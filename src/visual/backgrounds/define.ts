import type React from "react";
import type { z } from "zod";

/** Every background schema must carry its own `type` literal. */
export type BackgroundSchema = z.ZodObject<{ type: z.ZodLiteral<string> }>;

export type BackgroundEntry<S extends BackgroundSchema> = {
  readonly schema: S;
  /** Gets only its own parsed params. No content, no theme, no duration. */
  readonly component: React.FC<z.infer<S>>;
};

/** Pairs a schema with its component so the prop types are checked together. */
export const defineBackground = <S extends BackgroundSchema>(
  entry: BackgroundEntry<S>,
): BackgroundEntry<S> => entry;
