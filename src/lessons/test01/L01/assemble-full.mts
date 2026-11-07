import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FPS, G03_DURATION_FRAMES, G04_DURATION_FRAMES, framesForMs } from "./durations.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const work = path.join(root, "workspaces/test01/full");
const sampleRate = 24000;

type Preview = {
  timeline: {
    totalDurationMs: number;
    captions: Array<{ index: number; sceneId: string; text: string; startMs: number; endMs: number }>;
  };
};

const readPreview = (name: string) =>
  JSON.parse(fs.readFileSync(path.join(root, "workspaces/test01", name, "preview-data.json"), "utf8")) as Preview;

const readPcm = (file: string) => {
  const bytes = fs.readFileSync(file);
  if (bytes.toString("ascii", 0, 4) !== "RIFF") throw new Error(`不是 WAV：${file}`);
  let data: Buffer | undefined;
  let formatOk = false;
  for (let pos = 12; pos + 8 <= bytes.length;) {
    const id = bytes.toString("ascii", pos, pos + 4);
    const size = bytes.readUInt32LE(pos + 4);
    if (id === "fmt ") {
      if (bytes.readUInt16LE(pos + 8) !== 1 || bytes.readUInt16LE(pos + 10) !== 1 || bytes.readUInt32LE(pos + 12) !== sampleRate || bytes.readUInt16LE(pos + 22) !== 16) {
        throw new Error(`需要 24000Hz 单声道 16-bit PCM：${file}`);
      }
      formatOk = true;
    }
    if (id === "data") data = bytes.subarray(pos + 8, pos + 8 + size);
    pos += 8 + size + (size % 2);
  }
  if (!formatOk || !data) throw new Error(`WAV 缺少 fmt 或 data：${file}`);
  return data;
};

const silence = (frames: number) => Buffer.alloc(Math.round((frames / FPS) * sampleRate) * 2);
const pad = (pcm: Buffer, frames: number) => {
  const target = silence(frames);
  if (pcm.length > target.length) throw new Error(`配音长于画面：${pcm.length} > ${target.length}`);
  pcm.copy(target);
  return target;
};

const g01 = readPreview("g01");
const g02 = readPreview("g02");
const pieces = [
  { id: "G01", composition: "Test01L01G01", scenes: ["S01"], frames: framesForMs(g01.timeline.totalDurationMs), captions: g01.timeline.captions, pcm: readPcm(path.join(root, "workspaces/test01/g01/test01-L01-g01-full.wav")) },
  { id: "G02", composition: "Test01L01G02", scenes: ["S02"], frames: framesForMs(g02.timeline.totalDurationMs), captions: g02.timeline.captions, pcm: readPcm(path.join(root, "workspaces/test01/g02/test01-L01-g02-full.wav")) },
  { id: "G03", composition: "Test01L01G03", scenes: ["S03"], frames: G03_DURATION_FRAMES, captions: [], pcm: null },
  { id: "G04", composition: "Test01L01G04", scenes: ["S04"], frames: G04_DURATION_FRAMES, captions: [], pcm: null },
];

let from = 0;
const groups = pieces.map((piece) => {
  const startMs = (from / FPS) * 1000;
  const durationMs = (piece.frames / FPS) * 1000;
  const group = {
    id: piece.id,
    composition: piece.composition,
    from,
    durationInFrames: piece.frames,
    startMs,
    endMs: startMs + durationMs,
    scenes: piece.scenes,
  };
  from += piece.frames;
  return group;
});

const pcm = Buffer.concat(pieces.map((piece) => pad(piece.pcm ?? Buffer.alloc(0), piece.frames)));
const wav = Buffer.alloc(44 + pcm.length);
wav.write("RIFF");
wav.writeUInt32LE(36 + pcm.length, 4);
wav.write("WAVEfmt ", 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(sampleRate, 24);
wav.writeUInt32LE(sampleRate * 2, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write("data", 36);
wav.writeUInt32LE(pcm.length, 40);
pcm.copy(wav, 44);

const captions = pieces.flatMap((piece, index) => piece.captions.map((caption) => ({
  ...caption,
  startMs: Math.round(caption.startMs + groups[index].startMs),
  endMs: Math.round(caption.endMs + groups[index].startMs),
}))).map((caption, index) => ({ ...caption, index: index + 1 }));

const publicDir = path.join(root, "public/audio/test01/full");
fs.mkdirSync(work, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, "narration.wav"), wav);
const assembly = {
  lessonId: "test01-L01",
  fps: FPS,
  width: 1920,
  height: 1080,
  durationInFrames: from,
  durationMs: (from / FPS) * 1000,
  audio: "public/audio/test01/full/narration.wav",
  groups,
};
fs.writeFileSync(path.join(work, "assembly.json"), `${JSON.stringify(assembly, null, 2)}\n`);
fs.writeFileSync(path.join(work, "captions.json"), `${JSON.stringify({ captions }, null, 2)}\n`);
console.log(`[FULL] ${from} 帧，${assembly.durationMs.toFixed(0)}ms`);
for (const group of groups) console.log(`  ${group.id} ${group.composition} from ${group.from} +${group.durationInFrames}`);
