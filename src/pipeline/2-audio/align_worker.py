"""Stage 2 (`2-audio`) Qwen3-ForcedAligner CUDA 字级强制对齐器。

调用本地 `/projects/gaoxiang/qwen3-forced-aligner` 离线权重（`Qwen3-ForcedAligner-0.6B`），
支持按分镜音频 SHA-256 缓存对齐结果（`.cache/audio/align/<wavSha256>.json`）。
"""
import argparse
import json
import os
import sys
from pathlib import Path

ALIGNER_ROOT = Path('/projects/gaoxiang/qwen3-forced-aligner')
for key, value in {
    'HF_HUB_OFFLINE': '1',
    'TRANSFORMERS_OFFLINE': '1',
    'HF_HUB_DISABLE_TELEMETRY': '1',
    'HF_HUB_DISABLE_IMPLICIT_TOKEN': '1',
    'DO_NOT_TRACK': '1',
    'GRADIO_ANALYTICS_ENABLED': 'False',
    'ORT_DISABLE_TELEMETRY': '1',
    'HF_HOME': str(ALIGNER_ROOT / 'cache/huggingface'),
    'XDG_CACHE_HOME': str(ALIGNER_ROOT / 'cache'),
    'NUMBA_CACHE_DIR': str(ALIGNER_ROOT / 'cache/numba'),
    'CUDA_CACHE_PATH': str(ALIGNER_ROOT / 'cache/cuda'),
    'TMPDIR': str(ALIGNER_ROOT / 'tmp'),
}.items():
    os.environ[key] = value


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--tts-meta', required=True, help='tts-output.json 绝对路径')
    parser.add_argument('--cache-dir', required=True, help='全局音频缓存目录绝对路径')
    parser.add_argument('--out', required=True, help='aligned-tokens.json 输出绝对路径')
    parser.add_argument('--device', default='cuda', choices=['cuda', 'cpu'])
    args = parser.parse_args()

    tts_meta = json.loads(Path(args.tts_meta).read_text(encoding='utf-8'))
    align_cache_dir = Path(args.cache_dir) / 'align'
    align_cache_dir.mkdir(parents=True, exist_ok=True)
    manifest = json.loads((ALIGNER_ROOT / 'model-manifest.json').read_text(encoding='utf-8'))

    aligner = None
    device_map = 'cuda:0' if args.device == 'cuda' else 'cpu'

    def ensure_aligner():
        nonlocal aligner
        if aligner is not None:
            return aligner
        import torch
        from qwen_asr import Qwen3ForcedAligner
        if args.device == 'cuda' and not torch.cuda.is_available():
            raise RuntimeError('请求 CUDA 但当前环境未检测到可用 GPU')
        dtype = torch.bfloat16 if args.device == 'cuda' else torch.float32
        print(f'[ALIGN] Loading {manifest["repo"]} on {device_map}...', flush=True)
        aligner = Qwen3ForcedAligner.from_pretrained(
            manifest['local_path'],
            device_map=device_map,
            dtype=dtype,
            attn_implementation='sdpa',
            local_files_only=True,
        )
        return aligner

    scene_outputs = []
    for s_idx, seg in enumerate(tts_meta['scenes']):
        scene_id = seg['sceneId']
        wav_sha256 = seg['wavSha256']
        seg_start_ms = int(seg['startMs'])
        seg_end_ms = int(seg['endMs'])
        cache_file = align_cache_dir / f'{wav_sha256}.json'

        if cache_file.is_file():
            rel_tokens = json.loads(cache_file.read_text(encoding='utf-8'))
            from_cache = True
        else:
            from_cache = False
            model = ensure_aligner()
            result = model.align(audio=seg['wavPath'], text=seg['narration'], language='Chinese')
            raw_tokens = result[0]
            rel_tokens = []
            for t in raw_tokens:
                txt = str(t.text).strip()
                if not txt:
                    continue
                rel_tokens.append({
                    'text': txt,
                    'relStartMs': int(round(t.start_time * 1000)),
                    'relEndMs': int(round(t.end_time * 1000)),
                })
            cache_file.write_text(json.dumps(rel_tokens, ensure_ascii=False), encoding='utf-8')

        abs_tokens = []
        for rt in rel_tokens:
            t_start = max(seg_start_ms, min(seg_start_ms + int(rt['relStartMs']), seg_end_ms - 1))
            t_end = max(t_start + 1, min(seg_start_ms + int(rt['relEndMs']), seg_end_ms))
            abs_tokens.append({
                'sceneId': scene_id,
                'text': rt['text'],
                'startMs': t_start,
                'endMs': t_end,
            })

        scene_outputs.append({
            'sceneId': scene_id,
            'fromCache': from_cache and bool(seg.get('fromCache', False)),
            'tokens': abs_tokens,
        })
        print(f'[ALIGN] {s_idx + 1}/{len(tts_meta["scenes"])} {scene_id} ({len(abs_tokens)} tokens, cached={from_cache})', flush=True)

    Path(args.out).write_text(
        json.dumps(
            {
                'alignerEngine': manifest['repo'],
                'scenes': scene_outputs,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding='utf-8',
    )


if __name__ == '__main__':
    main()
