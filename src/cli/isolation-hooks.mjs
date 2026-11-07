import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const log = process.env.LOAD_LOG;
const hide = process.env.HIDE_WORKSPACES === "1";
const allow = process.env.ALLOW_WORKSPACE ?? "";
const deny = process.env.DENY_FILE ?? "";

export async function resolve(specifier, context, nextResolve) {
  const resolved = await nextResolve(specifier, context);
  if (!resolved.url.startsWith("file:")) return resolved;
  const file = fileURLToPath(resolved.url);
  if (log) fs.appendFileSync(log, `${file}\n`);
  if (deny && path.resolve(file) === path.resolve(deny)) {
    throw new Error(`缺少 ${file}`);
  }
  if (hide && file.includes(`${path.sep}workspaces${path.sep}`)) {
    const allowed = allow && file.includes(`${path.sep}workspaces${path.sep}${allow}${path.sep}`);
    if (!allowed) throw new Error(`缺少 ${file}`);
  }
  return resolved;
}
