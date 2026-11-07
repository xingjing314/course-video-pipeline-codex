import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {test} from 'node:test';
import {fileURLToPath} from 'node:url';
import {groupPreviewSpecs, resolveFullLessonGroups} from '../pipeline/resolve-full-lesson-groups.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const spec = (id, marker) => ({
  id,
  component: function Group() { return null; },
  durationInFrames: 10,
  fps: 30,
  width: 1920,
  height: 1080,
  defaultProps: {marker},
});

test('分组顺序与 CompositionSpec 数组不同时，仍按 composition id 绑定帧和参数', () => {
  const specs = [spec('DemoG02', '第二组'), spec('DemoG01', '第一组')];
  const groups = [
    {id: 'G01', composition: 'DemoG01', from: 11, durationInFrames: 101},
    {id: 'G02', composition: 'DemoG02', from: 120, durationInFrames: 80},
  ];
  const resolved = resolveFullLessonGroups('demo-L01', groups, specs);
  assert.equal(resolved[0].spec.id, 'DemoG01');
  assert.equal(resolved[0].spec, specs[1]);
  assert.equal(resolved[0].from, 11);
  assert.equal(resolved[0].durationInFrames, 101);
  assert.deepEqual(resolved[0].props, {marker: '第一组'});
  assert.equal(resolved[1].spec.id, 'DemoG02');
  assert.equal(resolved[1].from, 120);
  assert.equal(resolved[1].durationInFrames, 80);
  assert.deepEqual(resolved[1].props, {marker: '第二组'});
});

test('缺少 composition id 时，错误包含课时、分组和缺失 id', () => {
  assert.throws(
    () => resolveFullLessonGroups('demo-L01', [
      {id: 'G04', composition: 'DemoG04', from: 4, durationInFrames: 9},
    ], [spec('DemoG01', '有')]),
    (error) => {
      assert.match(error.message, /demo-L01/);
      assert.match(error.message, /G04/);
      assert.match(error.message, /DemoG04/);
      return true;
    },
  );
});

test('单组预览没有数据时不注册；整课仍因缺失 id 失败', () => {
  const present = spec('DemoG01', '在');
  const absent = spec('DemoG02', '不在');
  let createdAbsent = false;
  const previewList = [
    ...groupPreviewSpecs({ready: true}, () => present),
    ...groupPreviewSpecs(null, () => {
      createdAbsent = true;
      return absent;
    }),
  ];
  assert.equal(createdAbsent, false);
  assert.deepEqual(previewList.map((item) => item.id), ['DemoG01']);
  assert.throws(
    () => resolveFullLessonGroups('demo-L01', [
      {id: 'G01', composition: 'DemoG01', from: 0, durationInFrames: 5},
      {id: 'G02', composition: 'DemoG02', from: 5, durationInFrames: 6},
    ], previewList),
    /课时 demo-L01 的分组 G02 找不到 composition「DemoG02」/,
  );
});

test('test01 整课组件使用同一查找，不再按下标配对', () => {
  const source = fs.readFileSync(path.join(root, 'src/lessons/test01/L01/FullLesson.tsx'), 'utf8');
  assert.match(source, /resolveFullLessonGroups\(assembly\.lessonId/);
  assert.doesNotMatch(source, /GROUP_COMPOSITIONS\[index\]/);
  const groups = fs.readFileSync(path.join(root, 'src/lessons/test01/L01/groups.ts'), 'utf8');
  assert.match(groups, /groupPreviewSpecs\(/);
});
