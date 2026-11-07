/**
 * 双版本交付编排：渲染一次干净版（或复用已有干净版），再调用 composeLesson()。
 * 不实现字幕叠加、音频处理和媒体检查；那些留在 composeLesson。
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { CompiledLesson } from "../../../contracts/compiled-lesson.schema.ts";
import { readCaptionText, buildCaptionPlan } from "../../../scripts/caption-overlay.mjs";
import { composeLesson as composeLessonImpl } from "../../../scripts/compose-lesson.mjs";
import { renderLesson } from "../../../scripts/render-lesson.mjs";

export type DeliveryRange = {
  startFrame: number;
  endFrame: number;
  totalFrames: number;
  fps: number;
};

export type CaptionPlan = {
  images: string[];
  runs: Array<{ image: number; fromFrame: number; endFrame: number }>;
  srt: string;
};

export type CleanRenderRequest = {
  lesson: string;
  composition: string;
  output: string;
  frames: string;
  silentClean: true;
  sidecars: false;
  entry: string;
  inputProps: {
    lesson: CompiledLesson;
    includeAudio: false;
    includeCaptions: false;
    silentClean: true;
  };
};

export type ComposeRequest = {
  lesson: string;
  video: string;
  audio: string;
  captions: string;
  output: string;
  "start-frame": string;
  "wav-output": string;
  "srt-output": string;
  "info-output": string;
};

export type DualDeliveryDeps = {
  renderClean: (request: CleanRenderRequest) => Promise<unknown>;
  composeLesson: (request: ComposeRequest) => Promise<unknown>;
};

export type DualDeliveryResult = {
  range: DeliveryRange;
  captionPlan: CaptionPlan;
  cleanRendered: boolean;
  cleanVideo: string;
  outputs: { video: string; wav: string; srt: string; info: string };
};

const refuseExisting = (file: string) => {
  if (fs.existsSync(file)) throw new Error(`拒绝覆盖已有文件：${file}`);
};

type VideoSpan = { frames: number; startTime: number };

const readVideoSpan = (file: string): VideoSpan => {
  const probe = JSON.parse(execFileSync("ffprobe", [
    "-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=nb_frames,start_time",
    "-of", "json", file,
  ], { encoding: "utf8" })) as { streams?: Array<{ nb_frames?: string; start_time?: string }> };
  const stream = probe.streams?.[0];
  const frames = Number(stream?.nb_frames);
  if (!stream || !Number.isInteger(frames) || frames <= 0) {
    throw new Error(`无法读取干净版帧数：${file}`);
  }
  return { frames, startTime: Number(stream.start_time ?? 0) };
};

/** 起点不在关键帧上时，流复制会落到前一个关键帧，画面会和口播错开。 */
const assertTrimStartsOnKeyframe = (file: string, range: DeliveryRange) => {
  const csv = execFileSync("ffprobe", [
    "-v", "error", "-select_streams", "v:0", "-skip_frame", "nokey",
    "-show_entries", "frame=best_effort_timestamp_time",
    "-of", "csv=p=0", file,
  ], { encoding: "utf8" });
  const target = range.startFrame / range.fps;
  const hit = csv.split(/\r?\n/).some((line) => {
    const time = Number(line.trim());
    return Number.isFinite(time) && Math.abs(time - target) <= 0.5 / range.fps;
  });
  if (!hit) {
    throw new Error(
      `干净版第 ${range.startFrame} 帧不是关键帧，流复制无法精确裁到 ${range.startFrame}-${range.endFrame}。请用该帧范围重新渲染干净版。`,
    );
  }
};

const clipOutputPath = (
  cleanVideo: string,
  cleanOutput: string,
  lessonId: string,
  outDir: string,
  range: DeliveryRange,
) => {
  if (path.resolve(cleanVideo) !== path.resolve(cleanOutput) && !fs.existsSync(cleanOutput)) return cleanOutput;
  return path.join(outDir, `${lessonId}-silent-clean.${range.startFrame}-${range.endFrame}.mp4`);
};

/** 把更长的干净版流复制成请求区间。不重新渲染教学画面，也不覆盖原文件。 */
const trimCleanSpan = (cleanVideo: string, output: string, range: DeliveryRange) => {
  if (range.startFrame > 0) assertTrimStartsOnKeyframe(cleanVideo, range);
  const args = ["-hide_banner", "-loglevel", "error", "-n"];
  if (range.startFrame > 0) args.push("-ss", String(range.startFrame / range.fps));
  args.push(
    "-i", cleanVideo,
    "-frames:v", String(range.totalFrames),
    "-c:v", "copy", "-an",
    "-bsf:v", "setts=pts=PTS-STARTPTS:dts=DTS-STARTDTS",
    output,
  );
  execFileSync("ffmpeg", args, { stdio: ["ignore", "inherit", "inherit"] });
  const span = readVideoSpan(output);
  if (span.frames !== range.totalFrames || Math.abs(span.startTime) > 0.5 / range.fps) {
    fs.rmSync(output, { force: true });
    throw new Error(
      `流复制裁切后得到 ${span.frames} 帧、起点 ${span.startTime}s，不是 ${range.startFrame}-${range.endFrame}。请用该帧范围重新渲染干净版。`,
    );
  }
};

/**
 * 干净版帧数已经等于请求区间时直接使用。
 * 更长时裁出该区间再交给合成，避免 composeLesson 按整段文件的帧数取音频。
 */
const cleanSpanForRange = (
  cleanVideo: string,
  cleanOutput: string,
  lessonId: string,
  outDir: string,
  range: DeliveryRange,
) => {
  const span = readVideoSpan(cleanVideo);
  if (span.frames === range.totalFrames) return cleanVideo;
  if (span.frames < range.totalFrames || range.startFrame + range.totalFrames > span.frames) {
    throw new Error(`干净版只有 ${span.frames} 帧，覆盖不了 ${range.startFrame}-${range.endFrame}。`);
  }
  const output = clipOutputPath(cleanVideo, cleanOutput, lessonId, outDir, range);
  refuseExisting(output);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  trimCleanSpan(cleanVideo, output, range);
  return output;
};

/** 两端包含。--frames 与 --max-frames 都表示视频、WAV、SRT 共用的同一区间。 */
export const resolveDeliveryRange = (
  durationInFrames: number,
  fps: number,
  options: { maxFrames?: number; frames?: string } = {},
): DeliveryRange => {
  if (options.frames !== undefined && options.maxFrames !== undefined) {
    throw new Error("不能同时指定 --frames 与 --max-frames。");
  }
  let startFrame = 0;
  let endFrame = durationInFrames - 1;
  if (options.maxFrames !== undefined) {
    if (!Number.isSafeInteger(options.maxFrames) || options.maxFrames < 1) {
      throw new Error("--max-frames 必须是正整数。");
    }
    endFrame = Math.min(durationInFrames - 1, options.maxFrames - 1);
  }
  if (options.frames !== undefined) {
    if (!/^\d+-\d+$/.test(options.frames)) throw new Error("frames 格式应为起始帧-结束帧（两端均包含）。");
    const [start, end] = options.frames.split("-").map(Number);
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || end < start || end >= durationInFrames) {
      throw new Error("无效的帧范围。");
    }
    startFrame = start;
    endFrame = end;
  }
  if (endFrame < startFrame) throw new Error("课时没有可导出的帧。");
  return { startFrame, endFrame, totalFrames: endFrame - startFrame + 1, fps };
};

const defaultDeps = (): DualDeliveryDeps => ({
  renderClean: (request) => renderLesson(request),
  composeLesson: (request) => composeLessonImpl(request),
});

/**
 * 从已读入的编译课组织一次双版本交付。
 * 未提供 cleanVideo 时只调用一次干净画面渲染；提供时不再渲染教学画面。
 * 两种情况都只调用一次 composeLesson，并把同一帧区间交给视频、WAV 和 SRT。
 */
export const deliverCompiledLesson = async (
  lesson: CompiledLesson,
  projectRoot: string,
  options: { maxFrames?: number; frames?: string; cleanVideo?: string; entry?: string; composition?: string } = {},
  deps: DualDeliveryDeps = defaultDeps(),
): Promise<DualDeliveryResult> => {
  const range = resolveDeliveryRange(lesson.meta.durationInFrames, lesson.meta.fps, options);
  const outDir = path.join(projectRoot, "deliverables", lesson.lessonId);
  const workspaceDir = path.join(projectRoot, "workspaces", lesson.lessonId);
  const captionsPath = path.join(workspaceDir, "compiled-lesson.json");
  const audioPath = path.join(workspaceDir, `${lesson.lessonId}-full.wav`);
  const cleanOutput = path.join(outDir, `${lesson.lessonId}-silent-clean.mp4`);
  const voicedOutput = path.join(outDir, `${lesson.lessonId}-voiced-captioned.mp4`);
  const wavOutput = path.join(outDir, `${lesson.lessonId}-full.wav`);
  const srtOutput = path.join(outDir, `${lesson.lessonId}.srt`);
  const infoOutput = path.join(outDir, `${lesson.lessonId}.media-info.json`);
  const cleanVideo = options.cleanVideo ? path.resolve(options.cleanVideo) : undefined;

  for (const file of [voicedOutput, wavOutput, srtOutput, infoOutput]) refuseExisting(file);
  if (cleanVideo) {
    if (!fs.existsSync(cleanVideo)) throw new Error(`找不到干净版：${cleanVideo}`);
  } else {
    refuseExisting(cleanOutput);
  }
  if (!fs.existsSync(captionsPath)) throw new Error(`未找到字幕来源 ${captionsPath}`);
  if (!fs.existsSync(audioPath)) throw new Error(`未找到整轨音频 ${audioPath}`);

  const captions = readCaptionText(fs.readFileSync(captionsPath, "utf8"), ".json");
  const captionPlan = buildCaptionPlan(captions, {
    fps: range.fps,
    totalFrames: range.totalFrames,
    startFrame: range.startFrame,
  }) as CaptionPlan;
  const video = cleanVideo
    ? cleanSpanForRange(cleanVideo, cleanOutput, lesson.lessonId, outDir, range)
    : cleanOutput;

  if (!cleanVideo) {
    if (!options.entry || !options.composition) {
      throw new Error("渲染干净版需要调用方提供 entry 和 composition。");
    }
    await deps.renderClean({
      lesson: lesson.lessonId,
      composition: options.composition,
      output: cleanOutput,
      frames: `${range.startFrame}-${range.endFrame}`,
      silentClean: true,
      sidecars: false,
      entry: options.entry,
      inputProps: {
        lesson,
        includeAudio: false,
        includeCaptions: false,
        silentClean: true,
      },
    });
  }

  await deps.composeLesson({
    lesson: lesson.lessonId,
    video,
    audio: audioPath,
    captions: captionsPath,
    output: voicedOutput,
    "start-frame": String(range.startFrame),
    "wav-output": wavOutput,
    "srt-output": srtOutput,
    "info-output": infoOutput,
  });

  return {
    range,
    captionPlan,
    cleanRendered: !cleanVideo,
    cleanVideo: video,
    outputs: { video: voicedOutput, wav: wavOutput, srt: srtOutput, info: infoOutput },
  };
};
