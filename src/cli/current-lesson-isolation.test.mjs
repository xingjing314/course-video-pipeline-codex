import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {test} from 'node:test';
import {fileURLToPath} from 'node:url';
import {linkAndAssembleLesson} from '../pipeline/3-link/assembler.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sharedLesson = path.join(root, 'workspaces/current-lesson.json');
const sha = 'a'.repeat(64);

const fixture = () => {
  const ir = {
    schemaVersion: '1.0.0',
    lessonId: 'fixture-L01',
    lessonTitle: '夹具课',
    sourceMarkdownPath: 'fixture.md',
    sourceMarkdownSha256: sha,
    companionScriptVerified: false,
    overview: {
      chapterScope: '夹具',
      estimatedDurationText: '1秒',
      cognitiveGoals: ['看清对象'],
      coreVisualAssets: ['标题'],
      examAnchors: [],
    },
    scenes: [{
      sceneId: 'S01',
      parentSceneId: 'S01',
      segmentTitle: '引入',
      sceneTitle: '标题',
      order: 1,
      estimatedSeconds: 1,
      narration: '你好。',
      narrationSha256: sha,
      clauses: ['你好。'],
      pauseDirectives: [],
      rawVisualInstruction: '标题卡',
      pedagogicalIntent: '说明对象',
      cueSpecs: [],
      visualType: 'title-card',
      payload: {title: '标题', bullets: []},
    }],
    compiledAt: '2026-11-07T00:00:00.000Z',
  };
  const timeline = {
    schemaVersion: '1.0.0',
    lessonId: 'fixture-L01',
    sampleRate: 24000,
    totalDurationMs: 1000,
    fullWavPath: 'fixture.wav',
    fullWavSha256: sha,
    srtPath: 'fixture.srt',
    srtSha256: sha,
    engineInfo: {ttsEngine: 'test', alignerEngine: 'test', device: 'synthetic'},
    scenes: [{
      sceneId: 'S01',
      narrationSha256: sha,
      wavRelativePath: 's01.wav',
      wavSha256: sha,
      startMs: 0,
      endMs: 1000,
      durationMs: 1000,
      fromCache: false,
      tokens: [
        {sceneId: 'S01', text: '你', startMs: 0, endMs: 500},
        {sceneId: 'S01', text: '好', startMs: 500, endMs: 1000},
      ],
    }],
    captions: [{index: 1, sceneId: 'S01', text: '你好。', startMs: 0, endMs: 1000}],
    generatedAt: '2026-11-07T00:00:00.000Z',
  };
  return {ir, timeline};
};

const fingerprint = (file) => fs.existsSync(file)
  ? crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
  : 'absent';

test('组装器只写课时工作区，不创建或修改 current-lesson.json', () => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'course-assemble-'));
  const workspaceDir = path.join(projectRoot, 'workspaces', 'fixture-L01');
  fs.mkdirSync(workspaceDir, {recursive: true});
  const before = fingerprint(sharedLesson);
  const {ir, timeline} = fixture();
  try {
    const compiled = linkAndAssembleLesson(ir, timeline, projectRoot, workspaceDir, 30);
    const lessonFile = path.join(workspaceDir, 'compiled-lesson.json');
    assert.equal(compiled.lessonId, 'fixture-L01');
    assert.equal(fs.existsSync(lessonFile), true);
    assert.equal(JSON.parse(fs.readFileSync(lessonFile, 'utf8')).lessonId, 'fixture-L01');
    assert.equal(fs.existsSync(path.join(projectRoot, 'workspaces/current-lesson.json')), false);
    assert.equal(fingerprint(sharedLesson), before);
  } finally {
    fs.rmSync(projectRoot, {recursive: true, force: true});
  }
});

test('没有 current-lesson.json 时，公共入口仍能加载两次且入口集合相同', () => {
  const aside = `${sharedLesson}.aside-test`;
  const existed = fs.existsSync(sharedLesson);
  if (existed) fs.renameSync(sharedLesson, aside);
  const node = process.execPath;
  const run = () => execFileSync(node, [
    '--experimental-strip-types',
    '--import', path.join(root, 'src/cli/register-typescript.mjs'),
    path.join(root, 'src/cli/print-composition-ids.mjs'),
  ], {encoding: 'utf8', cwd: root});
  try {
    const first = JSON.parse(run());
    const second = JSON.parse(run());
    assert.deepEqual(first, second);
    assert.equal(first.length > 0, true);
    assert.equal(first.includes('QuizCardExam'), true);
    assert.equal(first.includes('Table67Example'), true);
    assert.equal(first.some((id) => /^(Test01|Ch0|CourseVideo)/.test(id)), false);
    console.log(JSON.stringify({count: first.length, ids: first}));
  } finally {
    if (existed && fs.existsSync(aside)) fs.renameSync(aside, sharedLesson);
    else if (fs.existsSync(sharedLesson) && !existed) fs.rmSync(sharedLesson);
  }
});
