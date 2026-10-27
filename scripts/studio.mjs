import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const forwarded = [];
let port = '3025';
let specified = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' || args[i].startsWith('--port=')) {
    if (specified) throw new Error('请只指定一次 --port。');
    specified = true;
    port = args[i] === '--port' ? args[++i] : args[i].slice(7);
  } else forwarded.push(args[i]);
}
if (!/^\d+$/.test(port ?? '') || +port < 1 || +port > 65535) throw new Error('端口必须是 1–65535 的整数。');
// Fail visibly instead of silently switching to another task's port.
await new Promise((resolve, reject) => {
  const server = net.createServer();
  server.once('error', () => reject(new Error(`端口 ${port} 不可用，请通过 --port 指定其他端口。`)));
  server.listen(+port, () => server.close(resolve));
});
const child = spawn(process.execPath, [path.join(root, 'node_modules/@remotion/cli/remotion-cli.js'),
  'studio', 'src/visual/index.ts', `--port=${port}`, '--force-new', ...forwarded], {cwd: root, stdio: 'inherit'});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('error', (error) => { console.error(error); process.exitCode = 1; });
child.on('exit', (code, signal) => { process.exitCode = code ?? (signal === 'SIGINT' ? 130 : 143); });
