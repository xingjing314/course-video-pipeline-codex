import { z } from "zod";

// light-rays' hexToRgb() silently turns anything that is not #rgb/#rrggbb into
// black, so background colours are restricted to hex.
export const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Must be a hex colour like #e8b86d");
