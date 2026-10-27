import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TechNetwork } from "../../visual/backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../../visual/backgrounds/tech-network/schema";
import {L01Header as HeaderBreadcrumb, L01Audio as Audio} from "./L01FullPlayback";
import {L01Captions as CaptionsOverlay} from "./L01FullPlayback";
import audio from "../../../workspaces/ch06-L01-envquiz/audio-timeline.json";
const cyan = "#46D6E3", gold = "#E6B65F", green = "#7BD9B5", muted = "#9BB6CA";
const bg = techNetworkSchema.parse({type:"tech-network",ganttEnabled:false,linkOpacity:0.035,nodeOpacity:0.06,highlightCoreOpacity:0.1,highlightGlowOpacity:0.06});
const norm=(s:string)=>s.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g,"").toUpperCase();
const scene=(key:string)=>audio.scenes.find(s=>s.sceneId===`EQ-${key}`)!;
const at=(key:string,phrase:string,end=false)=>{
 const cc=scene(key).tokens.flatMap(t=>[...norm(t.text)].map(ch=>({ch,start:t.startMs,end:t.endMs})));
 const p=norm(phrase),i=cc.map(c=>c.ch).join("").indexOf(p);
 if(i<0) throw new Error(`${key}: ${phrase}`);
 return cc[i+(end?p.length-1:0)][end?"end":"start"];
};
const cues={
 leftOpa:at("left-explain","妥妥的组织过程资产",true),
 leftPhysical:at("left-explain","客观物理限制",true),
 leftInternal:at("left-explain","属于内部事业环境因素",true),
 leftAnswer:at("left-explain","直接选A",true),
 rightExternal:at("right-explain","属于外部事业环境因素",true),
 rightSkills:at("right-explain","技能和知识沉淀",true),
 rightInternal:at("right-explain","是内部事业环境因素",true),
 rightAnswer:at("right-explain","锁定D选项",true),
};
const leftOptions=["设施和资源的物理分布","组织的社交媒体、道德和安全政策及程序","组织的问题、风险、变更","数据管理政策及程序"];
const rightOptions=["商业数据库","行业标准","市场条件","员工能力"];
const Question:React.FC<{side:"left"|"right";ms:number}>=({side,ms})=>{
 const right=side==="right", read=scene(`${side}-read`), explain=scene(`${side}-explain`);
 const countdownStart=read.endMs-3000;
 const counting=ms>=countdownStart&&ms<read.endMs;
 const explained=ms>=explain.startMs;
 const answer=ms>=(right?cues.rightAnswer:cues.leftAnswer);
 const active=right?ms>=read.startMs:ms<scene("right-read").startMs;
 const appeared=right?ms>=read.startMs:ms>=scene("left-read").startMs;
 const target=right?3:0;
 const fade=(when:number)=>interpolate(ms,[when,when+300],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
 return <div style={{position:"absolute",left:right?984:96,top:200,width:840,height:684,opacity:active?1:0.65}}>
  <div style={{color:active?cyan:muted,fontSize:22,letterSpacing:1,marginBottom:13}}>{right?"2026 年 5 月 · 第 2 批次 · 第 21 题":"2023 年 11 月 · 第 2 批次 · 第 29 题"}<span style={{fontSize:18,color:muted}}>（回忆版）</span></div>
  <div style={{height:92,fontSize:34,lineHeight:1.45,fontWeight:650}}>{right?<>（　）属于组织<strong style={{color:gold}}>内部</strong>事业环境因素。</>:<>（　）<strong style={{color:gold}}>不属于</strong>组织过程资产。</>}</div>
  {appeared?<>
   <div style={{display:"flex",flexDirection:"column",gap:12}}>
    {(right?rightOptions:leftOptions).map((text,i)=>{
     const classified=right?(i<3?ms>=cues.rightExternal:ms>=cues.rightInternal):(i>0?ms>=cues.leftOpa:ms>=cues.leftInternal);
     const chosen=answer&&i===target;
     const color=chosen?green:classified?gold:"#526D86";
     return <div key={text} style={{height:78,boxSizing:"border-box",border:`1.5px solid ${color}B3`,borderRadius:15,background:chosen?"#102C3C99":"#10213480",display:"flex",alignItems:"center",gap:16,padding:"10px 19px"}}>
      <div style={{width:44,height:44,flexShrink:0,borderRadius:10,background:`${color}20`,display:"grid",placeItems:"center",fontSize:27,fontWeight:700,color:classified?color:"#C5D4E1"}}>{"ABCD"[i]}</div>
      <div style={{fontSize:28,lineHeight:1.45,flex:1}}>{text}</div>
      <span style={{width:30,color:green,fontSize:30}}>{chosen?"✓":""}</span>
     </div>;
    })}
   </div>
   <div style={{position:"absolute",top:507,left:0,right:0,height:177,boxSizing:"border-box",border:"1px solid #36556D99",borderRadius:18,background:"#0E213380",padding:"20px 24px"}}>
    {!explained?<div style={{display:"flex",alignItems:"center",height:"100%",gap:25}}>
      <div style={{position:"relative",width:116,height:116,flexShrink:0}}>
       <svg width="116" height="116" viewBox="0 0 116 116"><circle cx="58" cy="58" r="50" stroke="#36556D" strokeWidth="4" fill="none"/>{counting&&<circle cx="58" cy="58" r="50" stroke={cyan} strokeWidth="4" fill="none" strokeDasharray={Math.PI*100} strokeDashoffset={Math.PI*100*(ms-countdownStart)/3000} transform="rotate(-90 58 58)"/>}</svg>
       <div style={{position:"absolute",inset:0,display:"grid",placeItems:"center",fontSize:58,color:cyan,fontWeight:700}}>{counting?3-Math.floor((ms-countdownStart)/1000):"?"}</div>
      </div>
      <div style={{fontSize:28,lineHeight:1.7,color:muted}}>{counting?"独立作答 · 3 秒":"先读题，再作答"}<br/><span style={{fontSize:24}}>{right?"选择属于内部环境的一项":"注意题干中的“不属于”"}</span></div>
    </div>:<>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:25,color:muted,marginBottom:12}}><span>分类辨析</span>{answer&&<strong style={{color:green}}>答案 {right?"D":"A"}</strong>}</div>
      {right?<>
       <div style={{fontSize:27,lineHeight:1.65,opacity:fade(cues.rightExternal)}}><span style={{color:gold}}>A / B / C</span> → 外部事业环境因素</div>
       <div style={{fontSize:27,lineHeight:1.65,opacity:fade(cues.rightSkills)}}><span style={{color:cyan}}>D 员工能力</span> → <span style={{opacity:fade(cues.rightInternal)}}>内部事业环境因素</span></div>
      </>:<>
       <div style={{fontSize:27,lineHeight:1.65,opacity:fade(cues.leftOpa)}}><span style={{color:gold}}>B / C / D</span> → 政策、管理程序 → 组织过程资产</div>
       <div style={{fontSize:27,lineHeight:1.65,opacity:fade(cues.leftPhysical)}}><span style={{color:cyan}}>A 物理分布</span> → <span style={{opacity:fade(cues.leftInternal)}}>内部事业环境因素</span></div>
      </>}
    </>}
   </div>
  </>:<div style={{height:440,border:"1px solid #36556D66",borderRadius:18,display:"grid",placeItems:"center",color:muted,fontSize:28,background:"#10213440"}}>即将读题</div>}
 </div>;
};
export const CH06_ENVQUIZ_FRAMES=Math.ceil(audio.totalDurationMs/1000*30)+45;
export const Ch06L01EnvironmentQuiz:React.FC=()=>{
 const frame=useCurrentFrame(),{fps}=useVideoConfig(),ms=frame/fps*1000;
 const right=ms>=scene("right-read").startMs;
 const read=scene(right?"right-read":"left-read");
 const counting=ms>=read.endMs-3000&&ms<read.endMs;
 const step=ms<scene("left-read").startMs?1:!right?(ms<read.endMs-3000?2:counting?3:4):(ms<read.endMs-3000?5:counting?6:7);
 const titles=["双题实战","读左题","左题作答","左题解析","读右题","右题作答","右题解析"];
 return <AbsoluteFill style={{background:"#081426",color:"#E6F1FA",fontFamily:'"Noto Sans CJK SC", sans-serif'}}>
  <TechNetwork {...bg}/><Audio src={staticFile("audio/ch06-L01-envquiz/narration.wav")}/>
  <HeaderBreadcrumb lessonId="ch06-L01" lessonTitle="第 6 章 项目管理概论 · L01" sceneId={`EQ${step}`} sceneOrder={step} totalScenes={7} segmentTitle={titles[step-1]}/>
  <div style={{position:"absolute",left:96,right:96,top:48}}><div style={{fontSize:20,lineHeight:1.5,letterSpacing:3,color:"#8FB8D9",marginBottom:10}}>6.2.5 · 组织过程资产与事业环境因素</div><div style={{fontSize:46,lineHeight:1.3,fontWeight:700,letterSpacing:1.2}}>两道真题：辨清资产、内部环境与外部环境</div></div>
  <Question side="left" ms={ms}/><Question side="right" ms={ms}/>
  <CaptionsOverlay captions={audio.captions}/>
 </AbsoluteFill>;
};
