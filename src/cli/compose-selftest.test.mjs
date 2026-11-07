import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {registerHooks} from 'node:module';
import {test} from 'node:test';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Internals} from 'remotion';
import ts from 'typescript';
import {readCaptionText, buildCaptionPlan, buildCaptionConcat, captionImageName, buildComposeArgs} from '../../scripts/caption-overlay.mjs';
import {parseComposeArgs, validateMedia, verifyComposedMedia, composeLesson, probeMedia} from '../../scripts/compose-lesson.mjs';

const sourceRoot = new URL('../', import.meta.url).href;
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && context.parentURL?.startsWith(sourceRoot)) {
      for (const suffix of ['', '.ts', '.tsx']) {
        const url = new URL(specifier + suffix, context.parentURL);
        if (fs.existsSync(url)) return nextResolve(url.href, context);
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith(sourceRoot) && /\.tsx?$/.test(url)) {
      return {format: 'module', shortCircuit: true, source: ts.transpileModule(fs.readFileSync(new URL(url), 'utf8'), {
        compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX},
      }).outputText};
    }
    return nextLoad(url, context);
  },
});

const {CaptionsOverlay} = await import('../visual/shell/CaptionsOverlay.tsx');
const {CaptionStill} = await import('../visual/caption-export/CaptionStill.tsx');
const h = React.createElement;

function renderAt(Component, props, frame) {
  const video = {id: 'CaptionTest', fps: 30, width: 1920, height: 1080, durationInFrames: 3000, defaultProps: {}, props: {}};
  return renderToStaticMarkup(h(Internals.CompositionManager.Provider, {value: {
    compositions: [{...video, component: Component}], canvasContent: {type: 'composition', compositionId: video.id},
    currentCompositionMetadata: video, currentAssetMetadata: null,
  }}, h(Internals.VideoProvider, null,
    h(Internals.TimelineContext.Provider, {value: {frame: {[video.id]: frame}, isInsideFreeze: false}},
      h(Internals.CanUseRemotionHooksProvider, null, h(Component, props)),
    ),
  )));
}

function tempDirectory(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'course-compose-test-'));
  t.after(() => fs.rmSync(directory, {recursive: true, force: true}));
  return directory;
}

test('JSON 与 SRT 入口保留文本；拒绝重叠、逆序字幕', () => {
  const captions = [{text: '第一行\n第二行', startMs: 100.25, endMs: 1333.5}];
  assert.deepEqual(readCaptionText(JSON.stringify(captions), '.json'), captions);
  assert.deepEqual(readCaptionText(JSON.stringify({captions}), '.json'), captions);
  const plan = buildCaptionPlan(captions, {fps: 30, totalFrames: 60});
  assert.deepEqual(readCaptionText(plan.srt.replaceAll('\n', '\r\n'), '.srt'), [{...captions[0], startMs: 100, endMs: 1334}]);
  assert.throws(() => readCaptionText(JSON.stringify([...captions, ...captions]), '.json'), /不重叠/);
  assert.throws(() => readCaptionText('[{"text":"无效","startMs":2,"endMs":1}]', '.json'), /结束时间/);
});

test('稀疏字幕计划逐帧对应真实 CaptionsOverlay，包括小数毫秒、空白与重复文本', () => {
  const captions = [
    {index: 1, sceneId: 'quiz', text: '题干', startMs: 1000 / 30, endMs: 1000 / 15 + 1e-8},
    {index: 2, sceneId: 'quiz', text: '同一字幕', startMs: 100, endMs: 133.33333333333334},
    {index: 3, sceneId: 'quiz', text: '同一字幕', startMs: 3500, endMs: 4000},
    {index: 4, sceneId: 'quiz', text: '解释 & 示例 <A>', startMs: 4200.25, endMs: 6000},
  ];
  const plan = buildCaptionPlan(captions, {fps: 30, totalFrames: 210});
  assert.equal(plan.images.length, 4);
  const markup = plan.images.map((text) => renderAt(CaptionStill, {text}, 0).replace(/^<div[^>]*>/, '').replace(/<\/div>$/, ''));
  for (const run of plan.runs) {
    for (let frame = run.fromFrame; frame < run.endFrame; frame++) {
      assert.equal(markup[run.image], renderAt(CaptionsOverlay, {captions}, frame), `frame ${frame}`);
    }
  }
  assert.ok(plan.runs.some((run) => run.image === 0 && run.endFrame - run.fromFrame >= 90));
});

test('样段复用原课时的绝对字幕时间，SRT 同步裁切并从零开始', () => {
  const captions = [{text: '跨过起点', startMs: 900, endMs: 1100}, {text: '跨过终点', startMs: 1900, endMs: 2100}];
  const plan = buildCaptionPlan(captions, {fps: 30, totalFrames: 30, startFrame: 30});
  assert.deepEqual(plan.runs, [
    {image: 1, fromFrame: 0, endFrame: 3}, {image: 0, fromFrame: 3, endFrame: 27}, {image: 2, fromFrame: 27, endFrame: 30},
  ]);
  assert.deepEqual(readCaptionText(plan.srt, '.srt'), [{text: '跨过起点', startMs: 0, endMs: 100}, {text: '跨过终点', startMs: 900, endMs: 1000}]);
});

test('真实 ffprobe 验证 concat 图片时间戳；连续短字幕不积累舍入误差', (t) => {
  const directory = tempDirectory(t);
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
  fs.writeFileSync(path.join(directory, captionImageName(0)), png);
  const runs = Array.from({length: 301}, (_, index) => ({image: 0, fromFrame: index, endFrame: index + 1}));
  const concat = path.join(directory, 'captions.ffconcat');
  fs.writeFileSync(concat, buildCaptionConcat({runs}, 30));
  const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-f', 'concat', '-safe', '0', '-i', concat,
    '-show_entries', 'packet=pts:stream=time_base', '-of', 'json'], {encoding: 'utf8'}));
  assert.equal(probe.streams[0].time_base, '1/30');
  assert.deepEqual(probe.packets.map((packet) => packet.pts), [...runs.map((run) => run.fromFrame), 301]);
});

const job = {video: 'clean.mp4', audio: 'full.wav', concat: 'captions.ffconcat', output: 'voiced.mp4', wavOutput: 'delivery.wav',
  fps: 30, totalFrames: 4, startFrame: 90, channels: 1, videoBitrate: '8M', colorRange: 'pc', colorSpace: 'bt470bg'};

test('合成入口使用 CUDA 叠加及 NVENC，样段音频采用同一起点', () => {
  const args = buildComposeArgs(job);
  assert.equal(args[args.indexOf('-c:v') + 1], 'h264_nvenc');
  assert.equal(args[args.indexOf('-bsf:v') + 1], 'h264_metadata=crop_bottom=8');
  assert.equal(args[args.indexOf('-ss') + 1], '3');
  assert.match(args[args.indexOf('-filter_complex') + 1], /overlay_cuda/);
  assert.doesNotMatch(args.join(' '), /libx264|loudnorm|dynaudnorm/);
});

test('字幕转换匹配干净版色彩范围，避免全范围视频上的字幕发灰', () => {
  for (const [range, space, matrix] of [['pc', 'bt470bg', 'bt601'], ['tv', 'bt709', 'bt709']]) {
    const media = validateMedia({streams: [{...cleanStream, color_range: range, color_space: space}]}, {streams: [wavStream]}, 0);
    const args = buildComposeArgs({...job, ...media});
    assert.match(args[args.indexOf('-filter_complex') + 1], new RegExp(`out_range=${range}:out_color_matrix=${matrix}`));
    assert.equal(args[args.indexOf('-color_range') + 1], range);
    assert.equal(args[args.indexOf('-colorspace') + 1], space);
  }
});

for (const channels of [1, 2]) {
  test(`${channels} 声道实际音频滤镜保留样本音量、真静音并导出双声道`, (t) => {
    const directory = tempDirectory(t);
    const source = Buffer.alloc(3000 * channels * 2);
    for (let sample = 0; sample < 3000; sample++) {
      for (let channel = 0; channel < channels; channel++) {
        const value = sample >= 800 && sample < 1600 ? 0 : channel === 0 ? 6500 : -3500;
        source.writeInt16LE(value, (sample * channels + channel) * 2);
      }
    }
    const input = path.join(directory, 'input.pcm');
    const wav = path.join(directory, 'output.wav');
    const aac = path.join(directory, 'output.m4a');
    fs.writeFileSync(input, source);
    const args = buildComposeArgs({...job, channels});
    const graph = args[args.indexOf('-filter_complex') + 1];
    // 仅执行生产滤镜中的音频分支，以几千个合成样本检查；不启动 GPU 或视频渲染。
    const audioGraph = graph.slice(graph.indexOf('[2:a]')).replace('[2:a]', '[0:a]');
    execFileSync('ffmpeg', ['-v', 'error', '-n', '-f', 's16le', '-ar', '24000', '-ac', String(channels), '-i', input,
      '-filter_complex', audioGraph, '-map', '[wav]', '-c:a', 'pcm_s16le', wav,
      '-map', '[audio]', '-c:a', 'aac', '-b:a', '192k', aac]);
    const result = execFileSync('ffmpeg', ['-v', 'error', '-i', wav, '-f', 's16le', '-']);
    assert.equal(result.length, 3200 * 2 * 2);
    for (let sample = 0; sample < 3200; sample++) {
      for (let channel = 0; channel < 2; channel++) {
        const expected = sample < 3000 ? source.readInt16LE((sample * channels + (channels === 1 ? 0 : channel)) * 2) : 0;
        assert.equal(result.readInt16LE((sample * 2 + channel) * 2), expected, `sample ${sample}, channel ${channel}`);
      }
    }
    const wavStream = probeMedia(wav).streams[0];
    const aacStream = probeMedia(aac).streams[0];
    assert.equal(wavStream.sample_rate, '24000');
    assert.equal(aacStream.sample_rate, '48000');
    assert.equal(aacStream.channels, 2);
    assert.equal(Number(aacStream.start_time), 0);
  });
}

const cleanStream = {codec_type: 'video', codec_name: 'h264', width: 1920, height: 1080,
  avg_frame_rate: '30/1', r_frame_rate: '30/1', nb_frames: '300', start_time: '0', duration: '10'};
const wavStream = {codec_type: 'audio', codec_name: 'pcm_s16le', channels: 2, sample_rate: '24000', duration: '10'};
const aacStream = {...wavStream, codec_name: 'aac', sample_rate: '48000', start_time: '0'};

test('入口拒绝含音轨的干净版与未覆盖样段的整轨', () => {
  const clean = {streams: [cleanStream]};
  const audio = {streams: [wavStream], format: {duration: '10'}};
  assert.equal(validateMedia(clean, audio, 0).totalFrames, 300);
  assert.throws(() => validateMedia({streams: [cleanStream, aacStream]}, audio, 0), /没有音轨/);
  assert.throws(() => validateMedia(clean, audio, 30), /未覆盖/);
});

test('成品核验拒绝 42 ms 视频起点偏移、缺帧与错误音频格式', () => {
  const expected = {fps: 30, totalFrames: 300, width: 1920, height: 1080};
  const wav = {streams: [wavStream]};
  verifyComposedMedia({streams: [cleanStream, aacStream]}, wav, expected);
  assert.throws(() => verifyComposedMedia({streams: [{...cleanStream, height: 1088}, aacStream]}, wav, expected), /尺寸/);
  assert.throws(() => verifyComposedMedia({streams: [{...cleanStream, start_time: '0.042'}, aacStream]}, wav, expected), /起点/);
  assert.throws(() => verifyComposedMedia({streams: [{...cleanStream, nb_frames: '299'}, aacStream]}, wav, expected), /帧数/);
  assert.throws(() => verifyComposedMedia({streams: [cleanStream, {...aacStream, channels: 1}]}, wav, expected), /双声道/);
});

test('已有成片不被覆盖；检查失败时不会启动字幕截帧', async (t) => {
  const directory = tempDirectory(t);
  const output = path.join(directory, 'existing.mp4');
  fs.writeFileSync(output, 'original');
  const args = parseComposeArgs(['--lesson=ch01-L01', '--video=clean.mp4', '--audio=full.wav', '--captions=captions.json', `--output=${output}`]);
  await assert.rejects(composeLesson(args), /拒绝覆盖/);
  assert.equal(fs.readFileSync(output, 'utf8'), 'original');
});
