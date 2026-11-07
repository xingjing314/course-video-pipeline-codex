/**
 * 读取一个分组目录里的 storyboard-ir.json，决定是否调用 runAudioEngine。
 * 公共入口默认 cuda。省略 --mode 时不要用来做无 GPU 的试跑；试跑请传 --mode=synthetic 或 --dry-run。
 */
import fs from "node:fs";
import path from "node:path";
import { StoryboardIRSchema } from "../contracts/storyboard-ir.schema.ts";
import { runAudioEngine } from "../src/pipeline/2-audio/audio-runner.ts";
import { planGroupAudio, type AudioMode, type GroupAudioInput } from "../src/pipeline/2-audio/group-audio-plan.ts";

export type GroupAudioCliOptions = {
  root: string;
  argv: string[];
  defaultMode: AudioMode;
  label: string;
};

const flagValue = (argv: string[], name: string) => {
  const prefix = `--${name}=`;
  const inline = [...argv].reverse().find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = argv.lastIndexOf(`--${name}`);
  if (index >= 0) {
    const value = argv[index + 1];
    return value === undefined || value.startsWith("--") ? "" : value;
  }
  return undefined;
};

const readIr = (irPath: string): Pick<GroupAudioInput, "ir" | "irError"> => {
  if (!fs.existsSync(irPath)) return { ir: null, irError: null };
  try {
    const parsed = StoryboardIRSchema.parse(JSON.parse(fs.readFileSync(irPath, "utf8")));
    return { ir: { lessonId: parsed.lessonId, sceneCount: parsed.scenes.length }, irError: null };
  } catch (error) {
    return { ir: null, irError: error instanceof Error ? error.message : String(error) };
  }
};

const readTimelineDevice = (timelinePath: string) => {
  if (!fs.existsSync(timelinePath)) return null;
  try {
    const prev = JSON.parse(fs.readFileSync(timelinePath, "utf8")) as { engineInfo?: { device?: string } };
    return prev.engineInfo?.device ?? "unknown";
  } catch {
    return "unreadable";
  }
};

export const runGroupAudioCli = ({ root, argv, defaultMode, label }: GroupAudioCliOptions) => {
  const workspaceArg = flagValue(argv, "workspace");
  const resolvedWorkspace = workspaceArg ? path.resolve(root, workspaceArg) : null;
  const irPath = resolvedWorkspace ? path.join(resolvedWorkspace, "storyboard-ir.json") : null;
  const irFacts = irPath && resolvedWorkspace && fs.existsSync(resolvedWorkspace)
    ? readIr(irPath)
    : { ir: null, irError: null };
  const plan = planGroupAudio({
    workspaceArg,
    resolvedWorkspace,
    modeArg: flagValue(argv, "mode"),
    defaultMode,
    dryRun: argv.includes("--dry-run"),
    force: argv.includes("--force"),
    workspaceExists: resolvedWorkspace ? fs.existsSync(resolvedWorkspace) : false,
    irPath,
    ...irFacts,
    timelineDevice: resolvedWorkspace ? readTimelineDevice(path.join(resolvedWorkspace, "audio-timeline.json")) : null,
  });
  if (plan.action === "refuse") {
    console.error(plan.message);
    return 1;
  }
  console.log(`[${label}] workspace=${plan.workspace}`);
  console.log(`[${label}] lessonId=${plan.lessonId}`);
  console.log(`[${label}] mode=${plan.mode}`);
  if (plan.action === "dry-run") {
    console.log(`[${label}] dry-run：不写任何文件，不加载模型，不运行 GPU`);
    for (const step of plan.steps) console.log(`[${label}] 将执行：${step}`);
    return 0;
  }
  const started = Date.now();
  const ir = StoryboardIRSchema.parse(JSON.parse(fs.readFileSync(path.join(plan.workspace, "storyboard-ir.json"), "utf8")));
  const timeline = runAudioEngine(ir, root, plan.workspace, plan.mode);
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`[${label}] 完成，用时 ${seconds}s`);
  console.log(`[${label}] wav ${path.resolve(root, timeline.fullWavPath)}`);
  console.log(`[${label}] srt ${path.resolve(root, timeline.srtPath)}`);
  console.log(`[${label}] timeline ${path.join(plan.workspace, "audio-timeline.json")}`);
  return 0;
};
