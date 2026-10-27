/**
 * 媒体探针核验器（media-verifier.ts）。
 *
 * 调用系统 ffprobe 验证四项交付物的视频流数、音频流数、时长与分辨率：
 * - `voiced-captioned.mp4` 必须包含 1 条视频流 + 1 条音频流；
 * - `silent-clean.mp4` 必须包含 1 条视频流 + 0 条音频流。
 */
import { execFileSync } from "node:child_process";

export type ProbedMediaStats = {
  durationSec: number;
  videoStreams: number;
  audioStreams: number;
  width?: number;
  height?: number;
  fps?: number;
};

export const probeMediaFile = (filePath: string): ProbedMediaStats => {
  const raw = execFileSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration:stream=codec_type,width,height,r_frame_rate",
      "-of",
      "json",
      filePath,
    ],
    { encoding: "utf-8" },
  );

  const parsed = JSON.parse(raw) as {
    streams?: Array<{
      codec_type?: string;
      width?: number;
      height?: number;
      r_frame_rate?: string;
    }>;
    format?: { duration?: string };
  };

  const streams = parsed.streams ?? [];
  const videoStreams = streams.filter((s) => s.codec_type === "video");
  const audioStreams = streams.filter((s) => s.codec_type === "audio");
  const durationSec = Number(parsed.format?.duration ?? 0);

  let fps: number | undefined;
  const rateStr = videoStreams[0]?.r_frame_rate;
  if (rateStr && rateStr.includes("/")) {
    const [num, den] = rateStr.split("/").map(Number);
    if (den > 0) fps = Math.round((num / den) * 100) / 100;
  }

  return {
    durationSec,
    videoStreams: videoStreams.length,
    audioStreams: audioStreams.length,
    width: videoStreams[0]?.width,
    height: videoStreams[0]?.height,
    fps,
  };
};
