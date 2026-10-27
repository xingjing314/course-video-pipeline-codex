import path from 'node:path';
import {parseRenderArgs, projectRoot, renderLesson} from './render-lesson.mjs';

const args = parseRenderArgs();
const silentClean = args['silent-clean'] ?? false;
if (args.lesson || args.composition || args.audio || args.srt) {
  throw new Error('此入口固定导出 L01；其他课时请使用 scripts/render-lesson.mjs。');
}
const defaultOutput = !args.output;
if (args.frames && defaultOutput) throw new Error('短样段必须通过 --output 指定新文件名。');
await renderLesson({
  lesson: 'ch06-L01',
  composition: silentClean ? 'Ch06L01SilentClean' : 'Ch06L01Full',
  audio: 'public/audio/ch06-L01-full/narration.wav',
  srt: 'workspaces/ch06-L01-full/ch06-L01-full.srt',
  output: args.output ?? `deliverables/ch06-L01/ch06-L01-${silentClean ? 'silent-clean' : 'voiced-captioned'}.mp4`,
  frames: args.frames,
  silentClean,
  ...(defaultOutput ? {
    srtOutput: path.join(projectRoot, 'deliverables/ch06-L01/ch06-L01.srt'),
    infoOutput: path.join(projectRoot, `deliverables/ch06-L01/media-info${silentClean ? '-silent-clean' : ''}.json`),
  } : {}),
});
