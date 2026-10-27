import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';
import {execFileSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function parseRenderArgs(args = process.argv.slice(2)) {
  return parseArgs({args, options: {
    lesson: {type: 'string'}, composition: {type: 'string'},
    audio: {type: 'string'}, srt: {type: 'string'}, output: {type: 'string'},
    frames: {type: 'string'}, 'silent-clean': {type: 'boolean'},
  }}).values;
}

function clipSrt(source, startSeconds, endSeconds) {
  const toMs = (h, m, s, ms) => ((+h * 60 + +m) * 60 + +s) * 1000 + +ms;
  const stamp = (ms) => {
    const n = Math.round(ms);
    return `${String(Math.floor(n / 3600000)).padStart(2, '0')}:${String(Math.floor(n / 60000) % 60).padStart(2, '0')}:${String(Math.floor(n / 1000) % 60).padStart(2, '0')},${String(n % 1000).padStart(3, '0')}`;
  };
  const cues = [];
  for (const block of source.trim().split(/\r?\n\s*\r?\n/)) {
    const lines = block.split(/\r?\n/);
    const match = lines[1]?.match(/^(\d{2,}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2,}):(\d{2}):(\d{2}),(\d{3})$/);
    if (!match) throw new Error('SRT 时间格式无效，无法截取样段字幕。');
    const start = Math.max(toMs(...match.slice(1, 5)), startSeconds * 1000);
    const end = Math.min(toMs(...match.slice(5, 9)), endSeconds * 1000);
    if (end > start) cues.push(`${cues.length + 1}\n${stamp(start - startSeconds * 1000)} --> ${stamp(end - startSeconds * 1000)}\n${lines.slice(2).join('\n')}`);
  }
  return cues.length ? cues.join('\n\n') + '\n' : '';
}

function assertNew(file) {
  if (fs.existsSync(file)) throw new Error(`文件已存在，请指定新版本文件名，拒绝覆盖：${file}`);
}

// The composition owns teaching text and caption appearance. Audio is muxed once,
// from the supplied continuous track; sample ranges use the same absolute time.
export async function renderLesson({lesson, composition: id, audio, srt, output,
  frames, silentClean = false, srtOutput, infoOutput}) {
  if (!/^[a-z0-9]+-[A-Za-z0-9]+(?:-[a-z0-9]+)*$/.test(lesson ?? '')) throw new Error('请提供课时标识，例如 --lesson=ch06-L02。');
  if (!id || !output || !srt || (!silentClean && !audio)) throw new Error('必须指定 composition、output、srt；有声版还需 audio。');
  const resolve = (p) => path.resolve(projectRoot, p);
  const target = resolve(output);
  if (path.extname(target).toLowerCase() !== '.mp4') throw new Error('output 必须是 .mp4 文件。');
  assertNew(target);
  const stem = target.slice(0, -4);
  const subtitleTarget = resolve(srtOutput ?? `${stem}.srt`);
  const infoTarget = resolve(infoOutput ?? `${stem}.media-info.json`);
  const sourceSrt = resolve(srt);
  const sourceAudio = audio ? resolve(audio) : null;
  if (new Set([target, subtitleTarget, infoTarget, sourceSrt, ...(sourceAudio ? [sourceAudio] : [])]).size !== (sourceAudio ? 5 : 4)) throw new Error('输入与输出路径不能重合。');
  assertNew(infoTarget);
  const subtitles = fs.readFileSync(sourceSrt, 'utf8');
  if (!silentClean) fs.accessSync(sourceAudio, fs.constants.R_OK);
  let requestedRange;
  if (frames !== undefined) {
    if (!/^\d+-\d+$/.test(frames)) throw new Error('frames 格式应为起始帧-结束帧（两端均包含）。');
    requestedRange = frames.split('-').map(Number);
    if (!requestedRange.every(Number.isSafeInteger) || requestedRange[1] < requestedRange[0]) throw new Error('无效的帧范围。');
  }
  // An existing identical SRT is shared by the two legacy L01 variants.
  const checkSubtitle = (text) => {
    if (fs.existsSync(subtitleTarget) && fs.readFileSync(subtitleTarget, 'utf8') !== text) throw new Error(`字幕文件已存在且内容不同，拒绝覆盖：${subtitleTarget}`);
  };
  if (!requestedRange) checkSubtitle(subtitles);
  const browserExecutable = '/opt/google/chrome/chrome';
  let serveUrl;
  let pieces;
  let completed = false;
  try {
    console.log(`正在打包 ${lesson} / ${id}…`);
    serveUrl = await bundle({entryPoint: path.join(projectRoot, 'src/visual/index.ts'), publicDir: path.join(projectRoot, 'public')});
    const inputProps = silentClean ? {includeAudio: false, includeCaptions: false} : {};
    const composition = await selectComposition({serveUrl, id, browserExecutable, inputProps});
    const [start, end] = requestedRange ?? [0, composition.durationInFrames - 1];
    if (end >= composition.durationInFrames) throw new Error('帧范围超出 Composition 时长。');
    const totalFrames = end - start + 1;
    const subtitleText = requestedRange ? clipSrt(subtitles, start / composition.fps, (end + 1) / composition.fps) : subtitles;
    checkSubtitle(subtitleText);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    // Unique per export, on the target filesystem for atomic no-clobber publishing.
    pieces = fs.mkdtempSync(path.join(path.dirname(target), `.${lesson}-render-`));
    const size = Math.ceil(totalFrames / 4);
    const ranges = Array.from({length: Math.ceil(totalFrames / size)}, (_, i) => [start + i * size, Math.min(start + (i + 1) * size - 1, end)]);
    const outputs = ranges.map((_, i) => path.join(pieces, `part-${i + 1}.mp4`));
    const progress = ranges.map(() => 0);
    let last = 0;
    console.log(`${totalFrames} 帧，${(totalFrames / composition.fps).toFixed(2)} 秒；优先使用 NVENC。`);
    const results = await Promise.allSettled(outputs.map(async (outputLocation, i) => {
      await renderMedia({serveUrl, composition, inputProps, outputLocation, browserExecutable,
        frameRange: ranges[i], muted: true, codec: 'h264', pixelFormat: 'yuv420p',
        videoBitrate: '8M', imageFormat: 'jpeg', jpegQuality: 95, concurrency: 4,
        hardwareAcceleration: 'if-possible', chromiumOptions: {gl: 'angle'},
        ffmpegOverride: ({args}) => {
          const encoder = args[args.indexOf('-c:v') + 1];
          if (args.includes('-c:v') && encoder !== 'copy') console.log(`第 ${i + 1} 段编码器：${encoder}`);
          return args;
        },
        onProgress: ({renderedFrames}) => {
          progress[i] = renderedFrames;
          if (Date.now() - last > 25000) {
            last = Date.now();
            console.log(`画面进度 ${(100 * progress.reduce((a, b) => a + b, 0) / totalFrames).toFixed(1)}%`);
          }
        }});
      console.log(`第 ${i + 1} 段完成。`);
    }));
    const failure = results.find((r) => r.status === 'rejected');
    if (failure) throw failure.reason;
    const list = path.join(pieces, 'concat.txt');
    fs.writeFileSync(list, outputs.map((_, i) => `file 'part-${i + 1}.mp4'`).join('\n') + '\n');
    const stagedVideo = path.join(pieces, 'complete.mp4');
    const args = ['-hide_banner', '-loglevel', 'warning', '-n', '-f', 'concat', '-safe', '0', '-i', list];
    if (silentClean) args.push('-map', '0:v:0', '-c:v', 'copy', '-an');
    else {
      if (requestedRange) args.push('-ss', String(start / composition.fps), '-t', String(totalFrames / composition.fps));
      args.push('-i', sourceAudio, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k');
    }
    args.push('-movflags', '+faststart', stagedVideo);
    execFileSync('ffmpeg', args, {stdio: 'inherit'});
    const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', stagedVideo], {encoding: 'utf8'}));
    const video = probe.streams.find((s) => s.codec_type === 'video');
    const audioTracks = probe.streams.filter((s) => s.codec_type === 'audio');
    if (Number(video?.nb_frames) !== totalFrames || video.width !== composition.width || video.height !== composition.height || audioTracks.length !== (silentClean ? 0 : 1)) throw new Error('导出媒体参数与预期不符，保留临时结果供检查。');
    for (const p of [subtitleTarget, infoTarget]) fs.mkdirSync(path.dirname(p), {recursive: true});
    checkSubtitle(subtitleText);
    assertNew(infoTarget);
    fs.linkSync(stagedVideo, target); // Atomic: even concurrent runs cannot replace a film.
    if (!fs.existsSync(subtitleTarget)) fs.writeFileSync(subtitleTarget, subtitleText, {flag: 'wx'});
    probe.format.filename = target;
    fs.writeFileSync(infoTarget, JSON.stringify(probe, null, 2) + '\n', {flag: 'wx'});
    completed = true;
    console.log(`导出完成：${target}`);
  } finally {
    if (serveUrl) fs.rmSync(serveUrl, {recursive: true, force: true});
    if (pieces && completed) fs.rmSync(pieces, {recursive: true, force: true});
    else if (pieces) console.error(`导出未完成，临时文件保留在：${pieces}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = parseRenderArgs();
  await renderLesson({...args, silentClean: args['silent-clean']});
}
