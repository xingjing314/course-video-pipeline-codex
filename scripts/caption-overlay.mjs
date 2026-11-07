import { z } from 'zod';
import { exportCaptionsToSrt } from '../src/pipeline/2-audio/srt-exporter.ts';

const captionSchema = z.array(z.object({
  text: z.string().min(1), startMs: z.number().finite().nonnegative(), endMs: z.number().finite().nonnegative(),
})).superRefine((captions, context) => {
  captions.forEach((caption, index) => {
    if (caption.endMs <= caption.startMs || (index > 0 && caption.startMs < captions[index - 1].endMs)) {
      context.addIssue({code: 'custom', path: [index], message: '字幕须按时间排序、不重叠，且结束时间晚于开始时间。'});
    }
  });
});

export function readCaptionText(text, extension) {
  let source;
  if (extension === '.json') {
    const value = JSON.parse(text);
    source = Array.isArray(value) ? value : value.captions;
  } else if (extension === '.srt') {
    const toMs = (h, m, s, ms) => ((Number(h) * 60 + Number(m)) * 60 + Number(s)) * 1000 + Number(ms);
    source = text.trim() ? text.trim().split(/\r?\n\s*\r?\n/).map((block) => {
      const lines = block.split(/\r?\n/);
      const match = lines[1]?.match(/^(\d{2,}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2,}):(\d{2}):(\d{2}),(\d{3})$/);
      if (!match) throw new Error('SRT 时间格式无效。');
      return {startMs: toMs(...match.slice(1, 5)), endMs: toMs(...match.slice(5, 9)), text: lines.slice(2).join('\n')};
    }) : [];
  } else {
    throw new Error('captions 须为字幕 JSON（数组或包含 captions 字段）或 SRT。');
  }
  return captionSchema.parse(source);
}

export function buildCaptionPlan(captions, {fps, totalFrames, startFrame = 0}) {
  const images = [''];
  const imageIds = new Map([['', 0]]);
  const runs = [];
  let index = 0;
  // 使用与 CaptionsOverlay 相同的逐帧比较，保留现有 JSON 的小数毫秒精度。
  for (let frame = 0; frame < totalFrames; frame++) {
    const ms = ((frame + startFrame) / fps) * 1000;
    while (index < captions.length && ms >= captions[index].endMs) index++;
    const caption = captions[index];
    const text = caption && ms >= caption.startMs ? caption.text : '';
    if (!imageIds.has(text)) {
      imageIds.set(text, images.length);
      images.push(text);
    }
    const image = imageIds.get(text);
    const previous = runs.at(-1);
    if (previous?.image === image) previous.endFrame = frame + 1;
    else runs.push({image, fromFrame: frame, endFrame: frame + 1});
  }
  const startMs = startFrame / fps * 1000;
  const endMs = (startFrame + totalFrames) / fps * 1000;
  const clipped = captions.filter((caption) => caption.endMs > startMs && caption.startMs < endMs).map((caption) => ({
    ...caption, startMs: Math.max(caption.startMs, startMs) - startMs, endMs: Math.min(caption.endMs, endMs) - startMs,
  }));
  return {images, runs, srt: exportCaptionsToSrt(clipped)};
}

export const captionImageName = (index) => `caption-${String(index).padStart(4, '0')}.png`;

export function buildCaptionConcat(plan, fps) {
  const lines = ['ffconcat version 1.0'];
  for (const run of plan.runs) {
    // 用绝对边界之差写微秒，避免大量短字幕的时长舍入误差累积。
    const us = Math.round(run.endFrame * 1e6 / fps) - Math.round(run.fromFrame * 1e6 / fps);
    lines.push(`file '${captionImageName(run.image)}'`, `option framerate ${fps}`, `duration ${(us / 1e6).toFixed(6)}`);
  }
  lines.push(`file '${captionImageName(0)}'`, `option framerate ${fps}`);
  return lines.join('\n') + '\n';
}

export function buildComposeArgs({video, audio, concat, output, wavOutput, fps, totalFrames, startFrame, channels, videoBitrate, colorRange, colorSpace}) {
  const duration = totalFrames / fps;
  const samples = Math.round(duration * 24000);
  const stereo = channels === 1 ? 'pan=stereo|c0=c0|c1=c0,' : '';
  const filter = [
    '[0:v]setpts=PTS-STARTPTS,scale_cuda=format=yuv420p[base]',
    // Remotion 的 JPEG 干净版常为全范围 BT.601；字幕须采用相同色彩范围与矩阵。
    `[1:v]scale=out_range=${colorRange}:out_color_matrix=${colorSpace === 'bt709' ? 'bt709' : 'bt601'},format=yuva420p,hwupload[caption]`,
    '[base][caption]overlay_cuda=x=0:y=0:eof_action=repeat:repeatlast=1[video]',
    `[2:a]asetpts=PTS-STARTPTS,${stereo}aresample=24000,apad,atrim=end_sample=${samples},asplit=2[wav][aacInput]`,
    '[aacInput]aresample=48000[audio]',
  ].join(';');
  return [
    '-hide_banner', '-n', '-init_hw_device', 'cuda=compose:0', '-filter_hw_device', 'compose',
    '-hwaccel', 'cuda', '-hwaccel_device', 'compose', '-hwaccel_output_format', 'cuda', '-i', video,
    '-f', 'concat', '-safe', '0', '-i', concat,
    '-ss', String(startFrame / fps), '-i', audio,
    '-filter_complex', filter,
    '-map', '[video]', '-map', '[audio]', '-c:v', 'h264_nvenc', '-b:v', videoBitrate,
    // 1080 行视频在 H.264 中按 16 行对齐；保留底部 8 行裁切信息。
    '-bsf:v', 'h264_metadata=crop_bottom=8',
    '-r', String(fps), '-fps_mode', 'cfr', '-frames:v', String(totalFrames), '-t', String(duration),
    '-color_range', colorRange, '-colorspace', colorSpace,
    '-c:a', 'aac', '-ar', '48000', '-ac', '2', '-b:a', '192k', '-movflags', '+faststart', output,
    '-map', '[wav]', '-c:a', 'pcm_s16le', '-ar', '24000', '-ac', '2', '-t', String(duration), wavOutput,
  ];
}
