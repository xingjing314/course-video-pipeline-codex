/**
 * 加载所选课程入口。缺本课数据时，错误保留真实路径。
 * 不导入其他课程。
 *
 *   node --experimental-strip-types --import ./src/cli/register-typescript.mjs scripts/check-course.mjs --course=test01
 */
import path from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const course = process.argv.find((arg) => arg.startsWith("--course="))?.slice("--course=".length);
if (!course) {
  console.error("缺少 --course。例如 --course=test01");
  process.exit(1);
}
const entry = path.join(root, "src/lessons", course, "studio.tsx");
try {
  await import(pathToFileURL(entry).href);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
console.log(`[check:course] 已加载 ${path.relative(root, entry)}`);
