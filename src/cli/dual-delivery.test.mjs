import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {test} from 'node:test';
import {deliverCompiledLesson} from '../pipeline/4-render/dual-delivery.ts';
import {readCaptionText} from '../../scripts/caption-overlay.mjs';

const sha = 'b'.repeat(64);

function lesson(durationInFrames = 120, captions) {
  return {
    schemaVersion: '1.0.0',
    lessonId: 'fixture-L09',
    lessonTitle: '夹具课',
    meta: {
      fps: 30,
      width: 1920,
      height: 1080,
      durationMs: durationInFrames / 30 * 1000,
      durationInFrames,
      audioPublicSrc: 'audio/fixture/full.wav',
      audioSha256: sha,
      srtRelativePath: 'fixture.srt',
      srtSha256: sha,
    },
    overview: {
      chapterScope: '夹具',
      estimatedDurationText: '4秒',
      cognitiveGoals: ['看清'],
      coreVisualAssets: ['标题'],
      examAnchors: [],
    },
    scenes: [],
    captions: captions ?? [
      {index: 1, sceneId: 'S01', text: '甲', startMs: 1000, endMs: 2000},
      {index: 2, sceneId: 'S01', text: '乙', startMs: 2500, endMs: 3000},
    ],
    compiledAt: '2026-11-07T00:00:00.000Z',
  };
}

function workspace(t, compiled) {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'course-deliver-'));
  t.after(() => fs.rmSync(projectRoot, {recursive: true, force: true}));
  const dir = path.join(projectRoot, 'workspaces', compiled.lessonId);
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(path.join(dir, 'compiled-lesson.json'), JSON.stringify({captions: compiled.captions}));
  fs.writeFileSync(path.join(dir, `${compiled.lessonId}-full.wav`), 'wav');
  return projectRoot;
}

function writeClean(file, frames) {
  execFileSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'lavfi', '-i', 'testsrc=size=160x120:rate=30',
    '-frames:v', String(frames),
    '-c:v', 'libx264', '-g', '30', '-pix_fmt', 'yuv420p', '-an',
    file,
  ]);
}

function videoSpan(file) {
  const probe = JSON.parse(execFileSync('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=nb_frames,start_time',
    '-of', 'json', file,
  ], {encoding: 'utf8'}));
  return {frames: Number(probe.streams[0].nb_frames), startTime: Number(probe.streams[0].start_time ?? 0)};
}

function frameBytes(file, index) {
  const png = `${file}.frame-${index}.png`;
  execFileSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-i', file, '-vf', `select=eq(n\\,${index})`, '-frames:v', '1', png,
  ]);
  return fs.readFileSync(png);
}

function deps() {
  const calls = {clean: [], compose: []};
  return {
    calls,
    renderClean: async (request) => { calls.clean.push(request); },
    composeLesson: async (request) => { calls.compose.push(request); },
  };
}

test('没有干净版时只渲染一次教学画面，并调用一次 composeLesson', async (t) => {
  const compiled = lesson();
  const projectRoot = workspace(t, compiled);
  const fake = deps();
  const delivered = await deliverCompiledLesson(compiled, projectRoot, {
    frames: '30-89',
    entry: 'src/lessons/fixture/studio.tsx',
    composition: 'FixtureSilentClean',
  }, fake);
  assert.equal(fake.calls.clean.length, 1);
  assert.equal(fake.calls.compose.length, 1);
  assert.equal(delivered.cleanRendered, true);
  assert.equal(fake.calls.clean[0].frames, `${delivered.range.startFrame}-${delivered.range.endFrame}`);
  assert.equal(fake.calls.clean[0].silentClean, true);
  assert.equal(fake.calls.clean[0].sidecars, false);
  assert.equal(fake.calls.clean[0].inputProps.includeAudio, false);
  assert.equal(fake.calls.clean[0].inputProps.includeCaptions, false);
  assert.equal(fake.calls.clean[0].inputProps.silentClean, true);
  assert.equal(fake.calls.clean[0].composition, 'FixtureSilentClean');
  assert.equal(fake.calls.clean[0].entry, 'src/lessons/fixture/studio.tsx');
  assert.equal(String(fake.calls.clean[0].entry).includes('src/visual/index.ts'), false);
  assert.equal(fake.calls.compose[0]['start-frame'], String(delivered.range.startFrame));
  assert.equal(fake.calls.compose[0].video, fake.calls.clean[0].output);
  assert.equal(fake.calls.compose[0]['wav-output'], delivered.outputs.wav);
  assert.equal(fake.calls.compose[0]['srt-output'], delivered.outputs.srt);
  const sample = readCaptionText(delivered.captionPlan.srt, '.srt');
  const offset = delivered.range.startFrame / delivered.range.fps * 1000;
  assert.deepEqual(sample, [
    {text: '甲', startMs: 1000 - offset, endMs: 2000 - offset},
    {text: '乙', startMs: 2500 - offset, endMs: 3000 - offset},
  ]);
  assert.equal(sample[0].startMs, 0);
});

test('非 test01 的入口和 Composition 原样传到渲染层', async (t) => {
  const compiled = lesson(90);
  const projectRoot = workspace(t, compiled);
  const fake = deps();
  await deliverCompiledLesson(compiled, projectRoot, {
    entry: 'src/lessons/fixture/studio.tsx',
    composition: 'FixtureSilentClean',
  }, fake);
  assert.equal(fake.calls.clean.length, 1);
  assert.equal(fake.calls.compose.length, 1);
  assert.equal(fake.calls.clean[0].lesson, 'fixture-L09');
  assert.equal(fake.calls.clean[0].composition, 'FixtureSilentClean');
  assert.equal(fake.calls.clean[0].entry, 'src/lessons/fixture/studio.tsx');
  assert.equal(fake.calls.clean[0].inputProps.chapter, undefined);
  const source = fs.readFileSync(new URL('../pipeline/4-render/dual-delivery.ts', import.meta.url), 'utf8');
  assert.equal(source.includes('test01'), false);
  console.log(JSON.stringify({
    clean: fake.calls.clean.length,
    compose: fake.calls.compose.length,
    composition: fake.calls.clean[0].composition,
    entry: fake.calls.clean[0].entry,
  }));
});

test('更长的干净版先裁到请求区间，再交给合成', async (t) => {
  const compiled = lesson(120);
  const projectRoot = workspace(t, compiled);
  const clean = path.join(projectRoot, 'existing-clean.mp4');
  writeClean(clean, 120);
  const before = fs.readFileSync(clean);
  const fake = deps();
  const delivered = await deliverCompiledLesson(compiled, projectRoot, {frames: '30-89', cleanVideo: clean}, fake);
  assert.equal(fake.calls.clean.length, 0);
  assert.equal(fake.calls.compose.length, 1);
  assert.equal(delivered.cleanRendered, false);
  assert.notEqual(path.resolve(fake.calls.compose[0].video), path.resolve(clean));
  const span = videoSpan(fake.calls.compose[0].video);
  assert.equal(span.frames, delivered.range.totalFrames);
  assert.equal(delivered.range.startFrame, 30);
  assert.equal(delivered.range.endFrame, 89);
  assert.ok(Math.abs(span.startTime) <= 0.5 / delivered.range.fps);
  assert.equal(fake.calls.compose[0]['start-frame'], String(delivered.range.startFrame));
  const sample = readCaptionText(delivered.captionPlan.srt, '.srt');
  const offset = delivered.range.startFrame / delivered.range.fps * 1000;
  assert.deepEqual(sample, [
    {text: '甲', startMs: 1000 - offset, endMs: 2000 - offset},
    {text: '乙', startMs: 2500 - offset, endMs: 3000 - offset},
  ]);
  assert.equal(sample[0].startMs, 0);
  assert.deepEqual(frameBytes(fake.calls.compose[0].video, 0), frameBytes(clean, delivered.range.startFrame));
  assert.deepEqual(fs.readFileSync(clean), before);
});

test('更长的成片在 --max-frames=90 时只交出前 90 帧', async (t) => {
  const compiled = lesson(120);
  const projectRoot = workspace(t, compiled);
  const clean = path.join(projectRoot, 'master.mp4');
  writeClean(clean, 120);
  const fake = deps();
  const delivered = await deliverCompiledLesson(compiled, projectRoot, {maxFrames: 90, cleanVideo: clean}, fake);
  assert.equal(fake.calls.clean.length, 0);
  assert.equal(fake.calls.compose.length, 1);
  assert.notEqual(path.resolve(fake.calls.compose[0].video), path.resolve(clean));
  assert.equal(videoSpan(fake.calls.compose[0].video).frames, 90);
  assert.equal(delivered.range.startFrame, 0);
  assert.equal(delivered.range.endFrame, 89);
  assert.equal(fake.calls.compose[0]['start-frame'], '0');
  const sample = readCaptionText(delivered.captionPlan.srt, '.srt');
  assert.equal(sample[0].startMs, 1000);
  assert.equal(sample[1].endMs, 3000);
  assert.deepEqual(frameBytes(fake.calls.compose[0].video, 0), frameBytes(clean, 0));
});

test('从第 240 帧复用整课干净版时，视频、起点和字幕是同一段', async (t) => {
  const compiled = lesson(450, [
    {index: 1, sceneId: 'S01', text: '甲', startMs: 8000, endMs: 9000},
    {index: 2, sceneId: 'S01', text: '乙', startMs: 12000, endMs: 13000},
  ]);
  const projectRoot = workspace(t, compiled);
  fs.writeFileSync(path.join(projectRoot, 'workspaces', compiled.lessonId, 'compiled-lesson.json'), JSON.stringify({captions: compiled.captions}));
  const clean = path.join(projectRoot, 'master.mp4');
  writeClean(clean, 450);
  const fake = deps();
  const delivered = await deliverCompiledLesson(compiled, projectRoot, {frames: '240-389', cleanVideo: clean}, fake);
  assert.equal(fake.calls.clean.length, 0);
  assert.equal(fake.calls.compose.length, 1);
  assert.notEqual(path.resolve(fake.calls.compose[0].video), path.resolve(clean));
  const span = videoSpan(fake.calls.compose[0].video);
  assert.equal(span.frames, 150);
  assert.equal(delivered.range.startFrame, 240);
  assert.equal(delivered.range.endFrame, 389);
  assert.equal(delivered.range.totalFrames, span.frames);
  assert.ok(Math.abs(span.startTime) <= 0.5 / 30);
  assert.equal(fake.calls.compose[0]['start-frame'], '240');
  const sample = readCaptionText(delivered.captionPlan.srt, '.srt');
  assert.deepEqual(sample, [
    {text: '甲', startMs: 0, endMs: 1000},
    {text: '乙', startMs: 4000, endMs: 5000},
  ]);
  assert.deepEqual(frameBytes(fake.calls.compose[0].video, 0), frameBytes(clean, 240));
});

test('干净版帧数已经等于区间时直接复用，不再渲染', async (t) => {
  const compiled = lesson(120);
  const projectRoot = workspace(t, compiled);
  const clean = path.join(projectRoot, 'clip.mp4');
  writeClean(clean, 60);
  const fake = deps();
  const delivered = await deliverCompiledLesson(compiled, projectRoot, {frames: '30-89', cleanVideo: clean}, fake);
  assert.equal(fake.calls.clean.length, 0);
  assert.equal(fake.calls.compose.length, 1);
  assert.equal(path.resolve(fake.calls.compose[0].video), path.resolve(clean));
  assert.equal(fake.calls.compose[0]['start-frame'], String(delivered.range.startFrame));
  assert.equal(videoSpan(clean).frames, delivered.range.totalFrames);
});

test('未提供入口和 Composition 时不渲染', async (t) => {
  const compiled = lesson();
  const projectRoot = workspace(t, compiled);
  const fake = deps();
  await assert.rejects(
    () => deliverCompiledLesson(compiled, projectRoot, {}, fake),
    /entry 和 composition/,
  );
  assert.equal(fake.calls.clean.length, 0);
  assert.equal(fake.calls.compose.length, 0);
});

test('已有交付文件时拒绝覆盖，且不渲染、不合成', async (t) => {
  const compiled = lesson();
  const projectRoot = workspace(t, compiled);
  const voiced = path.join(projectRoot, 'deliverables', compiled.lessonId, `${compiled.lessonId}-voiced-captioned.mp4`);
  fs.mkdirSync(path.dirname(voiced), {recursive: true});
  fs.writeFileSync(voiced, 'keep-me');
  const fake = deps();
  await assert.rejects(
    () => deliverCompiledLesson(compiled, projectRoot, {maxFrames: 12}, fake),
    /拒绝覆盖已有文件/,
  );
  assert.equal(fs.readFileSync(voiced, 'utf8'), 'keep-me');
  assert.equal(fake.calls.clean.length, 0);
  assert.equal(fake.calls.compose.length, 0);
});
