/**
 * 让 `node --experimental-strip-types` 能加载本仓库的 .ts / .tsx / JSON 图。
 * 没有 JSX 的 TypeScript 交给 Node 自带的类型剥离；含 JSX 的文件才用 typescript 转译。
 */
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';

const hasJsx = (source) => /<\s*\/|\/\s*>|=>\s*</.test(source) || /return\s*\(?\s*</.test(source);

const candidates = (base) => [
  base,
  `${base}.ts`,
  `${base}.tsx`,
  `${base}.mts`,
  `${base}.js`,
  `${base}.mjs`,
  `${base}.json`,
  path.join(base, 'index.ts'),
  path.join(base, 'index.tsx'),
  path.join(base, 'index.js'),
];

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('.') || specifier.startsWith('/')) {
    const parent = context.parentURL ? path.dirname(new URL(context.parentURL).pathname) : process.cwd();
    const raw = specifier.startsWith('/') ? specifier : path.resolve(parent, specifier);
    const found = candidates(raw).find((file) => fs.existsSync(file) && fs.statSync(file).isFile());
    if (found) {
      return {url: pathToFileURL(found).href, shortCircuit: true};
    }
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.json')) {
    const value = JSON.parse(fs.readFileSync(new URL(url), 'utf8'));
    const named = value && typeof value === 'object' && !Array.isArray(value)
      ? Object.keys(value).filter((key) => /^[A-Za-z_$][\w$]*$/.test(key)).map((key) => `export const ${key} = ${JSON.stringify(value[key])};`).join('\n')
      : '';
    return {format: 'module', source: `export default ${JSON.stringify(value)};\n${named}\n`, shortCircuit: true};
  }
  if (url.endsWith('.ts') || url.endsWith('.tsx') || url.endsWith('.mts')) {
    const source = fs.readFileSync(new URL(url), 'utf8');
    if (url.endsWith('.tsx') && hasJsx(source)) {
      const compiled = ts.transpileModule(source, {
        compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX},
        fileName: url,
      }).outputText;
      return {format: 'module', source: compiled, shortCircuit: true};
    }
    return {format: 'module-typescript', source, shortCircuit: true};
  }
  return nextLoad(url, context);
}
