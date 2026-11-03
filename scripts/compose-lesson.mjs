import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';
import {execFileSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {readCaptionText, buildCaptionPlan, buildCaptionConcat, captionImageName, buildComposeArgs} from './caption-overlay.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function parseComposeArgs(args = process.argv.slice(2)) {
  const {values} = parseArgs({args, options: {
    lesson: {type: 'string'}, video: {type: 'string'}, audio: {type: 'string'}, captions: {type: 'string'},
    output: {type: 'string'}, 'start-frame': {type: 'string', default: '0'},
    'wav-output': {type: 'string'}, 'srt-output': {type: 'string'}, 'info-output': {type: 'string'},
    'video-bitrate': {type: 'string', default: '8M'},
    'browser-executable': {type: 'string', default: '/opt/google/chrome/chrome'},
    help: {type: 'boolean', short: 'h'},
  }});
  return values;
}

export function probeMedia(file) {
  return JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file], {encoding: 'utf8'}));
}

export function validateMedia(videoProbe, audioProbe, startFrame) {
  const video = videoProbe.streams.filter((stream) => stream.codec_type === 'video');
  const audio = audioProbe.streams.filter((stream) => stream.codec_type === 'audio');
  if (video.length !== 1 || videoProbe.streams.some((stream) => stream.codec_type === 'audio')) {
    throw new Error('video 必须是只有一条视频轨、没有音轨的干净版；调用方须确认画面未烧录口播字幕。');
  }
  if (audio.length !== 1 || ![1, 2].includes(audio[0].channels) || !audio[0].codec_name.startsWith('pcm_')) {
    throw new Error('audio 必须是单声道或双声道的已确认 PCM 整轨。');
  }
  const [num, den] = video[0].avg_frame_rate.split('/').map(Number);
  const fps = num / den;
  const totalFrames = Number(video[0].nb_frames);
  if (video[0].width !== 1920 || video[0].height !== 1080 || fps !== 30 || video[0].r_frame_rate !== video[0].avg_frame_rate || !Number.isSafeInteger(totalFrames) || totalFrames <= 0) {
    throw new Error('本项目导出入口要求 1920×1080、恒定 30 fps 且有准确帧数的 MP4。');
  }
  if (Math.abs(Number(video[0].start_time ?? 0)) > 0.000001 || Math.abs(Number(audio[0].start_time ?? 0)) > 0.000001) {
    throw new Error('视频、整轨音频必须从 0 开始；不要把带偏移的分段合并结果直接作为输入。');
  }
  const endSeconds = (startFrame + totalFrames) / fps;
  const audioDuration = Number(audio[0].duration ?? audioProbe.format.duration);
  if (!Number.isFinite(audioDuration) || audioDuration < endSeconds - 1 / fps) {
    throw new Error('音频未覆盖干净视频对应的时间范围，请核对素材版本和 start-frame。');
  }
  const colorRange = video[0].color_range === 'pc' ? 'pc' : 'tv';
  const colorSpace = video[0].color_space === 'bt709' ? 'bt709' : 'bt470bg';
  return {fps, totalFrames, width: video[0].width, height: video[0].height, channels: audio[0].channels, colorRange, colorSpace};
}

function prepareInputs(options) {
  for (const key of ['lesson', 'video', 'audio', 'captions', 'output']) {
    if (!options[key]) throw new Error(`缺少 --${key}；使用 --help 查看命令。`);
  }
  if (!/^[a-z0-9]+-[A-Za-z0-9]+(?:-[a-z0-9]+)*$/.test(options.lesson)) throw new Error('课时标识格式应为 ch06-L02。');
  const startFrame = Number(options['start-frame'] ?? 0);
  if (!Number.isSafeInteger(startFrame) || startFrame < 0) throw new Error('start-frame 必须是非负整数。');
  const resolve = (value) => path.resolve(projectRoot, value);
  const video = resolve(options.video);
  const audio = resolve(options.audio);
  const captionsFile = resolve(options.captions);
  const output = resolve(options.output);
  if (path.extname(output) !== '.mp4') throw new Error('output 必须以 .mp4 结尾。');
  const stem = output.slice(0, -4);
  const targets = {
    video: output, wav: resolve(options['wav-output'] ?? `${stem}.wav`),
    srt: resolve(options['srt-output'] ?? `${stem}.srt`), info: resolve(options['info-output'] ?? `${stem}.media-info.json`),
  };
  const allPaths = [video, audio, captionsFile, ...Object.values(targets)];
  if (new Set(allPaths).size !== allPaths.length) throw new Error('输入和各输出路径不能重合。');
  for (const file of Object.values(targets)) {
    if (fs.existsSync(file)) throw new Error(`拒绝覆盖已有文件：${file}；请指定新版本输出路径。`);
  }
  const captions = readCaptionText(fs.readFileSync(captionsFile, 'utf8'), path.extname(captionsFile).toLowerCase());
  const media = validateMedia(probeMedia(video), probeMedia(audio), startFrame);
  const videoBitrate = options['video-bitrate'] ?? '8M';
  if (!/^\d+(?:\.\d+)?[kKmM]?$/.test(videoBitrate) || parseFloat(videoBitrate) <= 0) throw new Error('video-bitrate 应为正数码率，例如 8M。');
  const browserExecutable = options['browser-executable'] ?? '/opt/google/chrome/chrome';
  fs.accessSync(browserExecutable, fs.constants.X_OK);
  return {lesson: options.lesson, video, audio, captionsFile, targets, ...media, startFrame, videoBitrate, browserExecutable,
    plan: buildCaptionPlan(captions, {...media, startFrame})};
}

async function renderCaptionImages(job, directory) {
  let serveUrl;
  let browser;
  try {
    const publicDir = path.join(directory, 'empty-public');
    fs.mkdirSync(publicDir);
    serveUrl = await bundle({entryPoint: path.join(projectRoot, 'src/visual/caption-export/index.tsx'), publicDir});
    browser = await openBrowser('chrome', {browserExecutable: job.browserExecutable, chromiumOptions: {gl: 'angle'}});
    const composition = await selectComposition({serveUrl, id: 'CaptionStill', puppeteerInstance: browser});
    for (let index = 0; index < job.plan.images.length; index++) {
      const inputProps = {text: job.plan.images[index]};
      await renderStill({serveUrl, composition: {...composition, props: inputProps}, inputProps, frame: 0,
        imageFormat: 'png', output: path.join(directory, captionImageName(index)), puppeteerInstance: browser, overwrite: false});
      if (index % 25 === 0 || index === job.plan.images.length - 1) console.log(`字幕图片 ${index + 1}/${job.plan.images.length}`);
    }
  } finally {
    if (browser) await browser.close({silent: true});
    if (serveUrl) fs.rmSync(serveUrl, {recursive: true, force: true});
  }
}

export function verifyComposedMedia(videoProbe, wavProbe, {fps, totalFrames, width, height}) {
  const video = videoProbe.streams.filter((stream) => stream.codec_type === 'video');
  const audio = videoProbe.streams.filter((stream) => stream.codec_type === 'audio');
  const wav = wavProbe.streams[0];
  const duration = totalFrames / fps;
  if (video.length !== 1 || audio.length !== 1 || video[0].codec_name !== 'h264' || Number(video[0].nb_frames) !== totalFrames || video[0].width !== width || video[0].height !== height || video[0].avg_frame_rate !== `${fps}/1`) {
    throw new Error('合成视频的轨道、编码、尺寸、帧率或帧数与干净版不一致。');
  }
  if (audio[0].codec_name !== 'aac' || Number(audio[0].sample_rate) !== 48000 || audio[0].channels !== 2 || wav.codec_name !== 'pcm_s16le' || Number(wav.sample_rate) !== 24000 || wav.channels !== 2) {
    throw new Error('输出须为 48 kHz 双声道 AAC 和 24 kHz 双声道 PCM16 WAV。');
  }
  for (const stream of [video[0], audio[0], wav]) {
    if (Math.abs(Number(stream.start_time ?? 0)) > 0.000001 || !Number.isFinite(Number(stream.duration)) || Math.abs(Number(stream.duration) - duration) > 1 / fps) {
      throw new Error('成片或 WAV 的起点、时长不一致，请检查合成日志。');
    }
  }
}

export async function composeLesson(options) {
  const job = prepareInputs(options);
  fs.mkdirSync(path.dirname(job.targets.video), {recursive: true});
  const directory = fs.mkdtempSync(path.join(path.dirname(job.targets.video), `.${job.lesson}-compose-`));
  let completed = false;
  try {
    console.log(`复用干净版 ${job.video}；${job.totalFrames} 帧，仅生成 ${job.plan.images.length} 张字幕图片。`);
    console.log('视频使用 CUDA 解码、overlay_cuda 叠加和 h264_nvenc 编码；PNG 解码/格式转换、音频处理使用 CPU。');
    await renderCaptionImages(job, directory);
    const concat = path.join(directory, 'captions.ffconcat');
    fs.writeFileSync(concat, buildCaptionConcat(job.plan, job.fps));
    const staged = {video: path.join(directory, 'voiced.mp4'), wav: path.join(directory, 'full.wav'),
      srt: path.join(directory, 'captions.srt'), info: path.join(directory, 'media-info.json')};
    const args = buildComposeArgs({...job, concat, output: staged.video, wavOutput: staged.wav});
    execFileSync('ffmpeg', args, {stdio: 'inherit'});
    const videoProbe = probeMedia(staged.video);
    const wavProbe = probeMedia(staged.wav);
    verifyComposedMedia(videoProbe, wavProbe, job);
    videoProbe.format.filename = job.targets.video;
    wavProbe.format.filename = job.targets.wav;
    fs.writeFileSync(staged.srt, job.plan.srt);
    fs.writeFileSync(staged.info, JSON.stringify({lessonId: job.lesson, video: videoProbe, wav: wavProbe,
      sources: {cleanVideo: job.video, audio: job.audio, captions: job.captionsFile},
      range: {startFrame: job.startFrame, totalFrames: job.totalFrames, fps: job.fps},
      outputs: job.targets, captionImages: job.plan.images.length, videoEncoder: 'h264_nvenc', videoOverlay: 'overlay_cuda'}, null, 2) + '\n');
    for (const [kind, target] of Object.entries(job.targets)) {
      fs.mkdirSync(path.dirname(target), {recursive: true});
      fs.copyFileSync(staged[kind], target, fs.constants.COPYFILE_EXCL);
    }
    completed = true;
    console.log(`合成完成：${job.targets.video}\nWAV：${job.targets.wav}\nSRT：${job.targets.srt}\nJSON：${job.targets.info}`);
    return job.targets;
  } finally {
    if (completed) fs.rmSync(directory, {recursive: true, force: true});
    else console.error(`合成未完成，临时文件保留：${directory}。GPU 错误不会自动切换为 CPU 渲染。`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const options = parseComposeArgs();
  if (options.help) {
    console.log(`复用干净视频生成有声字幕版（GPU 命令交由用户执行）：
node scripts/compose-lesson.mjs --lesson=ch06-L02 --video=<干净MP4> --audio=<确认的整轨WAV> --captions=<字幕JSON或SRT> --output=<新有声MP4>

可选：--start-frame=0（干净样段在整课中的起始帧；音频和字幕仍传整课版本）
      --wav-output=<WAV> --srt-output=<SRT> --info-output=<JSON>
      --video-bitrate=8M --browser-executable=/opt/google/chrome/chrome
默认副产物与输出 MP4 同名，后缀为 .wav、.srt、.media-info.json。拒绝覆盖。
要求：1920×1080、30 fps、无音轨且未烧录口播字幕的干净视频；CUDA / NVENC。
字幕沿用 CaptionsOverlay，每个不同文本只截一次透明图；思考空白来自传入字幕时间轴。
单声道音频等幅复制到双声道；导出不重新处理已确认的音量。`);
  } else {
    await composeLesson(options);
  }
}
