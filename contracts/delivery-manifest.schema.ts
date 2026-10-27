/**
 * Stage 4 (`4-render`) 产出契约：四项交付物与媒体探针核验清单。
 */
import { z } from "zod";
import { Sha256Schema } from "./storyboard-ir.schema.ts";

export const DeliverableRoleSchema = z.enum([
  "voiced-captioned",
  "silent-clean",
  "subtitles-srt",
  "audio-wav",
]);

export const DeliverableEntrySchema = z.object({
  role: DeliverableRoleSchema,
  path: z.string().min(1),
  sha256: Sha256Schema,
  bytes: z.number().int().positive(),
  mediaStats: z
    .object({
      durationSec: z.number().positive(),
      videoStreams: z.number().int().nonnegative(),
      audioStreams: z.number().int().nonnegative(),
      width: z.number().int().nonnegative().optional(),
      height: z.number().int().nonnegative().optional(),
      fps: z.number().positive().optional(),
      encoderUsed: z.string().optional(),
    })
    .optional(),
});

export const DeliveryManifestSchema = z.object({
  schemaVersion: z.literal("1.0.0"),
  lessonId: z.string().min(1),
  lessonTitle: z.string().min(1),
  compiledLessonSha256: Sha256Schema,
  encoderPolicy: z.enum(["nvenc-preferred", "nvenc-required", "cpu-fallback"]),
  actualVideoEncoder: z.string().min(1),
  deliverables: z.array(DeliverableEntrySchema).length(4),
  renderedAt: z.string().min(1),
});
export type DeliveryManifest = z.infer<typeof DeliveryManifestSchema>;
