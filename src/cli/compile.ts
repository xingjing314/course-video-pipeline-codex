/**
 * 课程合一稿编译 CLI（`npm run compile`）。
 *
 * 用法示例：
 *   npm run compile -- --input=<口播与分镜合一稿.md> --lesson=<课号> --audio-mode=synthetic
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compileMarkdownToStoryboardIR } from "../pipeline/1-ingest/ingest-compiler.ts";
import { runAudioEngine } from "../pipeline/2-audio/audio-runner.ts";
import { linkAndAssembleLesson } from "../pipeline/3-link/assembler.ts";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const parseArgs = (argv: string[]) => {
  let input: string | undefined;
  let lesson: string | undefined;
  let audioMode: "cuda" | "cpu" | "synthetic" = "cuda";

  for (let i = 0; i < argv.length; i += 1) {
    const [flag, inline] = argv[i].split("=", 2);
    const val = () => (inline !== undefined ? inline : argv[++i]);
    if (flag === "--input") input = val();
    else if (flag === "--lesson") lesson = val();
    else if (flag === "--audio-mode") {
      const m = val();
      if (m !== "cuda" && m !== "cpu" && m !== "synthetic") {
        throw new Error(`非法 --audio-mode：${m}（允许 cuda | cpu | synthetic）`);
      }
      audioMode = m;
    }
  }
  if (!input || !lesson) throw new Error("请指定 --input 和 --lesson。");
  return { input, lesson, audioMode };
};

const main = () => {
  const { input, lesson, audioMode } = parseArgs(process.argv.slice(2));
  const workspaceDir = path.join(PROJECT_ROOT, "workspaces", lesson);

  console.log(`\n==================================================================`);
  console.log(`[1-INGEST] 正在解析《合一稿》: ${input}`);
  const ir = compileMarkdownToStoryboardIR(input, lesson, workspaceDir);
  console.log(
    `[1-INGEST] ✓ 解析成功：共 ${ir.scenes.length} 个分镜单元（完整口播稿一致性核验=${ir.companionScriptVerified}）`,
  );
  for (const s of ir.scenes) {
    console.log(
      `  - ${s.sceneId.padEnd(7)} | ${s.visualType.padEnd(20)} | ${s.clauses.length} 句 | 停顿=${s.pauseDirectives.length} | ${s.sceneTitle}`,
    );
  }

  console.log(`\n[2-AUDIO] 正在运行音频合成与字级强制对齐 (mode=${audioMode})...`);
  const timeline = runAudioEngine(ir, PROJECT_ROOT, workspaceDir, audioMode);
  console.log(
    `[2-AUDIO] ✓ 音频与字幕就绪：总时长 ${(timeline.totalDurationMs / 1000).toFixed(1)}s，共 ${timeline.captions.length} 条 SRT 字幕`,
  );

  console.log(`\n[3-LINK] 正在绑定语音锚点 (Cue-Points) 与 Remotion 帧序列...`);
  const compiled = linkAndAssembleLesson(ir, timeline, PROJECT_ROOT, workspaceDir, 30);
  console.log(
    `[3-LINK] ✓ 编译完成：workspaces/${lesson}/compiled-lesson.json (${compiled.meta.durationInFrames} frames @ 30fps)`,
  );
  console.log(`[STUDIO] 结果在 workspaces/${lesson}/compiled-lesson.json。预览使用该课已注册入口，或把这份数据传给 CourseVideo 的 props.lesson。`);
  console.log(`==================================================================\n`);
};

main();
