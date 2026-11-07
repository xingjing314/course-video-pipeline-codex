/** 按组配音的参数检查。通过之后才允许调用 runAudioEngine。 */

export const AUDIO_MODES = ["cuda", "cpu", "synthetic"] as const;
export type AudioMode = (typeof AUDIO_MODES)[number];

export type GroupAudioInput = {
  workspaceArg: string | undefined;
  resolvedWorkspace: string | null;
  modeArg: string | undefined;
  defaultMode: AudioMode;
  dryRun: boolean;
  force: boolean;
  workspaceExists: boolean;
  irPath: string | null;
  ir: { lessonId: string; sceneCount: number } | null;
  irError: string | null;
  /** 没有时间线时为 null；无法读取时为 unreadable。 */
  timelineDevice: string | null;
};

export type GroupAudioPlan =
  | { action: "refuse"; message: string }
  | {
      action: "dry-run" | "run";
      workspace: string;
      lessonId: string;
      sceneCount: number;
      mode: AudioMode;
      steps: string[];
    };

const isMode = (value: string): value is AudioMode =>
  (AUDIO_MODES as readonly string[]).includes(value);

export const planGroupAudio = (input: GroupAudioInput): GroupAudioPlan => {
  if (!input.workspaceArg || !input.resolvedWorkspace) {
    return {
      action: "refuse",
      message: "缺少 --workspace。请指定分组工作目录，例如 --workspace=workspaces/<课>/<组>。",
    };
  }
  const workspace = input.resolvedWorkspace;
  if (!input.workspaceExists) {
    return { action: "refuse", message: `分组工作目录不存在：${workspace}` };
  }
  if (input.modeArg !== undefined && !isMode(input.modeArg)) {
    return {
      action: "refuse",
      message: input.modeArg === ""
        ? "--mode 缺少值。请填写 cuda、cpu 或 synthetic。"
        : `无法识别的 --mode=${input.modeArg}。只能是 cuda、cpu 或 synthetic。`,
    };
  }
  const mode = (input.modeArg as AudioMode | undefined) ?? input.defaultMode;
  const irPath = input.irPath ?? `${workspace}/storyboard-ir.json`;
  if (!input.ir && !input.irError) {
    return { action: "refuse", message: `缺少 ${irPath}` };
  }
  if (!input.ir) {
    return {
      action: "refuse",
      message: `storyboard-ir.json 无法通过校验：${irPath}\n${input.irError ?? "内容无效"}`,
    };
  }
  if (
    mode === "synthetic" &&
    !input.dryRun &&
    !input.force &&
    input.timelineDevice !== null &&
    input.timelineDevice !== "synthetic"
  ) {
    return {
      action: "refuse",
      message:
        `已有真实产物（engineInfo.device=${input.timelineDevice}），synthetic 会覆盖它。\n` +
        "确实要覆盖请加 --force；只想验证链路请用 --dry-run。",
    };
  }
  const steps = [
    `读取 ${irPath}`,
    "调用已有 runAudioEngine：配音、强制对齐、字幕，沿用已有缓存",
    "只写入该分组工作目录中的音频、SRT 和 audio-timeline.json",
  ];
  return {
    action: input.dryRun ? "dry-run" : "run",
    workspace,
    lessonId: input.ir.lessonId,
    sceneCount: input.ir.sceneCount,
    mode,
    steps,
  };
};
