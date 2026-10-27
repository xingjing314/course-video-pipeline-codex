"""Stage 2 (`2-audio`) Qwen3-TTS CUDA 批处理与内容寻址缓存合成器。

调用本地 `/projects/gaoxiang/qwen3-tts` 离线权重（`Qwen3-TTS-12Hz-1.7B-VoiceDesign`），
支持：
1. 分句级（Clause-level）SHA-256 缓存（`.cache/audio/clauses/<sha256>.wav`），未改动的句子 0 秒命中；
2. 标点自然停顿 + 显式教学互动停顿（`pauseDirectives`，如真题思考 2000ms）精准拼接；
3. 导出逐场景 WAV 与全课完整 `<lessonId>-full.wav`。
"""
import argparse
import hashlib
import json
import os
import sys
import time
from pathlib import Path

TTS_ROOT = Path('/projects/gaoxiang/qwen3-tts')
for key, value in {
    'ORT_DISABLE_TELEMETRY': '1',
    'HF_HUB_DISABLE_TELEMETRY': '1',
    'GRADIO_ANALYTICS_ENABLED': 'False',
    'DO_NOT_TRACK': '1',
    'HF_HUB_DISABLE_IMPLICIT_TOKEN': '1',
    'HF_HUB_OFFLINE': '1',
    'TRANSFORMERS_OFFLINE': '1',
    'HF_HOME': str(TTS_ROOT / 'cache/huggingface'),
    'XDG_CACHE_HOME': str(TTS_ROOT / 'cache'),
    'NUMBA_CACHE_DIR': str(TTS_ROOT / 'cache/numba'),
    'CUDA_CACHE_PATH': str(TTS_ROOT / 'cache/cuda'),
    'TMPDIR': str(TTS_ROOT / 'tmp'),
}.items():
    os.environ[key] = value

DEFAULT_INSTRUCT = (
    '成年女性声音，温暖、清澈、柔和、自然，带轻微成熟的磁性。像值得信任的女性伙伴自然交谈。'
    '语速中等偏慢，咬字清晰放松，语调克制有温度。避免少女音、甜腻、播音腔、明显气声和夸张表演。'
)

PAUSE_POLICY = {
    'version': 'clause-pause-v1.1',
    'weakMs': 300,
    'midMs': 380,
    'strongMs': 480,
    'edgeKeepMs': 40,
    'silenceRatio': 0.02,
}
WEAK_P = '，,、'
MID_P = '；;：:'
STRONG_P = '。！？!?'


def pause_after(clause: str) -> int:
    last = clause.strip()[-1:]
    if last in STRONG_P:
        return PAUSE_POLICY['strongMs']
    if last in MID_P:
        return PAUSE_POLICY['midMs']
    return PAUSE_POLICY['weakMs']


def trim_edges(wav, sr):
    import numpy as np
    peak = float(np.max(np.abs(wav))) if len(wav) else 0.0
    if peak <= 0:
        return wav
    idx = np.where(np.abs(wav) > peak * PAUSE_POLICY['silenceRatio'])[0]
    if len(idx) == 0:
        return wav
    keep = int(sr * PAUSE_POLICY['edgeKeepMs'] / 1000)
    return wav[max(0, idx[0] - keep): min(len(wav), idx[-1] + keep + 1)]


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--ir', required=True, help='storyboard-ir.json 绝对路径')
    parser.add_argument('--workspace', required=True, help='课程工作区目录绝对路径')
    parser.add_argument('--cache-dir', required=True, help='全局音频缓存目录绝对路径')
    parser.add_argument('--device', default='cuda', choices=['cuda', 'cpu'])
    parser.add_argument('--instruct', default=DEFAULT_INSTRUCT)
    parser.add_argument('--seed', type=int, default=20261024)
    args = parser.parse_args()

    ir_path = Path(args.ir)
    workspace_dir = Path(args.workspace)
    cache_dir = Path(args.cache_dir) / 'clauses'
    cache_dir.mkdir(parents=True, exist_ok=True)
    scene_wav_dir = workspace_dir / 'audio'
    scene_wav_dir.mkdir(parents=True, exist_ok=True)

    ir = json.loads(ir_path.read_text(encoding='utf-8'))
    scenes = ir['scenes']
    lesson_id = ir['lessonId']

    import numpy as np
    import soundfile as sf
    import torch

    sample_rate = 24000
    model = None
    manifest = json.loads((TTS_ROOT / 'model-manifest.json').read_text(encoding='utf-8'))
    device_map = 'cuda:0' if args.device == 'cuda' else 'cpu'

    def ensure_model():
        nonlocal model
        if model is not None:
            return model
        from qwen_tts import Qwen3TTSModel
        if args.device == 'cuda' and not torch.cuda.is_available():
            raise RuntimeError('请求 CUDA 但当前环境未检测到可用 GPU')
        dtype = torch.bfloat16 if args.device == 'cuda' else torch.float32
        torch.manual_seed(args.seed)
        print(f'[TTS] Loading {manifest["repo"]} on {device_map}...', flush=True)
        model = Qwen3TTSModel.from_pretrained(
            manifest['local_path'],
            device_map=device_map,
            dtype=dtype,
            attn_implementation='sdpa',
            local_files_only=True,
        )
        return model

    inter_scene_samples = int(round(0.60 * sample_rate))
    tail_samples = int(round(0.60 * sample_rate))
    cursor_samples = 0
    full_parts = []
    scene_records = []

    for s_idx, scene in enumerate(scenes):
        scene_id = scene['sceneId']
        clauses = scene['clauses']
        pause_map = {
            int(p['afterClauseIndex']): int(p['durationMs'])
            for p in scene.get('pauseDirectives', [])
        }
        scene_parts = []
        all_cached = True

        for c_idx, clause in enumerate(clauses):
            clause_key = f"{PAUSE_POLICY['version']}|{args.seed}|{args.instruct}|{clause}"
            c_hash = sha256_bytes(clause_key.encode('utf-8'))
            c_cache_path = cache_dir / f'{c_hash}.wav'

            if c_cache_path.is_file():
                piece, sr = sf.read(c_cache_path, dtype='float32')
                sample_rate = sr
            else:
                all_cached = False
                tts_model = ensure_model()
                with torch.inference_mode():
                    wavs, sr = tts_model.generate_voice_design(
                        text=clause,
                        language='Chinese',
                        instruct=args.instruct,
                        max_new_tokens=512,
                    )
                sample_rate = sr
                piece = trim_edges(np.asarray(wavs[0], dtype=np.float32), sr)
                sf.write(c_cache_path, piece, sr, subtype='PCM_16')

            scene_parts.append(piece)

            # 计算句后停顿：若存在显式教学停顿（如 2000ms），取最大值
            base_pause = pause_after(clause) if c_idx < len(clauses) - 1 else 0
            pedagogical_pause = pause_map.get(c_idx, 0)
            pause_ms = max(base_pause, pedagogical_pause)
            if pause_ms > 0:
                scene_parts.append(np.zeros(int(round(pause_ms / 1000 * sample_rate)), dtype=np.float32))

        scene_wav = np.concatenate(scene_parts) if scene_parts else np.zeros(sample_rate, dtype=np.float32)
        scene_wav_path = scene_wav_dir / f'{scene_id}.wav'
        sf.write(scene_wav_path, scene_wav, sample_rate, subtype='PCM_16')
        wav_sha256 = sha256_bytes(scene_wav_path.read_bytes())

        start_ms = int(round(cursor_samples / sample_rate * 1000))
        full_parts.append(scene_wav)
        cursor_samples += len(scene_wav)
        if s_idx < len(scenes) - 1:
            full_parts.append(np.zeros(inter_scene_samples, dtype=np.float32))
            cursor_samples += inter_scene_samples
        else:
            full_parts.append(np.zeros(tail_samples, dtype=np.float32))
            cursor_samples += tail_samples
        end_ms = int(round(cursor_samples / sample_rate * 1000))

        scene_records.append({
            'sceneId': scene_id,
            'narration': scene['narration'],
            'narrationSha256': scene['narrationSha256'],
            'wavPath': str(scene_wav_path),
            'wavSha256': wav_sha256,
            'startMs': start_ms,
            'endMs': end_ms,
            'durationMs': end_ms - start_ms,
            'fromCache': all_cached,
        })
        print(f'[TTS] {s_idx + 1}/{len(scenes)} {scene_id} ({end_ms - start_ms}ms, cached={all_cached})', flush=True)

    full_wav = np.concatenate(full_parts)
    full_wav_path = workspace_dir / f'{lesson_id}-full.wav'
    sf.write(full_wav_path, full_wav, sample_rate, subtype='PCM_16')

    out_meta = {
        'lessonId': lesson_id,
        'sampleRate': sample_rate,
        'totalDurationMs': int(round(len(full_wav) / sample_rate * 1000)),
        'fullWavPath': str(full_wav_path),
        'fullWavSha256': sha256_bytes(full_wav_path.read_bytes()),
        'ttsEngine': manifest['repo'],
        'device': args.device,
        'scenes': scene_records,
    }
    meta_path = workspace_dir / 'tts-output.json'
    meta_path.write_text(json.dumps(out_meta, ensure_ascii=False, indent=2), encoding='utf-8')


if __name__ == '__main__':
    main()
