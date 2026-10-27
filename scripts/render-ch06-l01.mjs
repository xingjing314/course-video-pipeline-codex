import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {renderMedia,selectComposition} from '@remotion/renderer';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const silentClean=process.argv.includes('--silent-clean');
const out=path.join(root,'deliverables/ch06-L01');
const pieces=path.join(root,silentClean?'out/ch06-L01-full/render-parts-silent':'out/ch06-L01-full/render-parts');
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(pieces,{recursive:true});
const outputLocation=path.join(out,silentClean?'ch06-L01-silent-clean.mp4':'ch06-L01-voiced-captioned.mp4');
if(fs.existsSync(outputLocation))throw new Error('成片已存在，请先明确新版本文件名再导出。');
console.log('正在打包整课…');
const serveUrl=await bundle({entryPoint:path.join(root,'src/visual/index.ts'),publicDir:path.join(root,'public')});
const browserExecutable='/opt/google/chrome/chrome';
const composition=await selectComposition({serveUrl,id:silentClean?'Ch06L01SilentClean':'Ch06L01Full',browserExecutable});
console.log(`整课 ${composition.durationInFrames} 帧，${(composition.durationInFrames/composition.fps).toFixed(2)} 秒。`);
const size=Math.ceil(composition.durationInFrames/4);
const progress=[0,0,0,0];let last=0;
const outputs=Array.from({length:4},(_,i)=>path.join(pieces,`part-${i+1}.mp4`));
try {
 const jobs=outputs.map(async(output,i)=>{
  const frameRange=[i*size,Math.min((i+1)*size-1,composition.durationInFrames-1)];
  await renderMedia({serveUrl,composition,outputLocation:output,browserExecutable,frameRange,muted:true,codec:'h264',pixelFormat:'yuv420p',videoBitrate:'8M',imageFormat:'jpeg',jpegQuality:95,concurrency:4,hardwareAcceleration:'if-possible',chromiumOptions:{gl:'angle'},onProgress:({renderedFrames})=>{progress[i]=renderedFrames;const now=Date.now();if(now-last>25000){last=now;console.log(`画面进度 ${(100*progress.reduce((a,b)=>a+b,0)/composition.durationInFrames).toFixed(1)}% ｜ 四段 ${progress.join(' / ')}`);}}});
  console.log(`第 ${i+1} 段完成。`);
 });
 const results=await Promise.allSettled(jobs);
 const failure=results.find(r=>r.status==='rejected');if(failure)throw failure.reason;
 const list=path.join(pieces,'concat.txt');
 fs.writeFileSync(list,outputs.map(p=>`file '${p}'`).join('\n')+'\n');
 console.log(silentClean?'画面完成，合并无声视频…':'画面完成，合并连续音轨…');
 if(silentClean){
  execFileSync('ffmpeg',['-hide_banner','-loglevel','warning','-n','-f','concat','-safe','0','-i',list,'-map','0:v:0','-c:v','copy','-an','-movflags','+faststart',outputLocation],{stdio:'inherit'});
 }else{
 execFileSync('ffmpeg',['-hide_banner','-loglevel','warning','-n','-f','concat','-safe','0','-i',list,'-i',path.join(root,'public/audio/ch06-L01-full/narration.wav'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-movflags','+faststart',outputLocation],{stdio:'inherit'});
 }
 fs.copyFileSync(path.join(root,'workspaces/ch06-L01-full/ch06-L01-full.srt'),path.join(out,'ch06-L01.srt'));
 const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_format','-show_streams','-of','json',outputLocation],{encoding:'utf8'}));
 fs.writeFileSync(path.join(out,silentClean?'media-info-silent-clean.json':'media-info.json'),JSON.stringify(probe,null,2)+'\n');
 console.log('导出完成：'+outputLocation);
 if(silentClean&&probe.streams.length===1&&probe.streams[0].codec_type==='video'&&Number(probe.streams[0].nb_frames)===composition.durationInFrames){
  for(const p of [...outputs,list])fs.unlinkSync(p);
  fs.rmdirSync(pieces);
 }
} finally {fs.rmSync(serveUrl,{recursive:true,force:true});}
