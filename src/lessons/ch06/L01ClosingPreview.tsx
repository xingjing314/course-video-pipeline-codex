import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {L01Header as HeaderBreadcrumb, L01Audio as Audio} from "./L01FullPlayback";
import {L01Captions as CaptionsOverlay} from "./L01FullPlayback";
import { TechNetwork } from "../../visual/backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../../visual/backgrounds/tech-network/schema";
import audio from "../../../workspaces/ch06-L01-closing/audio-timeline.json";
const cyan="#46D6E3",gold="#E6B65F",green="#7BD9B5",muted="#9BB6CA";
const bg=techNetworkSchema.parse({type:"tech-network",ganttEnabled:false,linkOpacity:0.035,nodeOpacity:0.06,highlightCoreOpacity:0.1,highlightGlowOpacity:0.06});
const clamp={extrapolateLeft:"clamp",extrapolateRight:"clamp"} as const;
const norm=(s:string)=>s.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g,"").toUpperCase();
const at=(key:string,phrase:string)=>{
 const tokens=audio.scenes.find(s=>s.sceneId===`CL-${key}`)!.tokens;
 const cc=tokens.flatMap(t=>[...norm(t.text)].map(ch=>({ch,start:t.startMs})));
 const i=cc.map(c=>c.ch).join("").indexOf(norm(phrase));
 if(i<0)throw new Error(`CL-${key}: ${phrase}`);
 return cc[i].start;
};
const nextAt=audio.scenes[1].startMs;
const recap=[
 {title:"项目的本质",cue:"项目的本质",color:cyan,first:"独特性 · 临时性",second:"驱动组织状态转换"},
 {title:"战略成功标准",cue:"战略成功标准",color:gold,first:"交付指标 + 业务价值",second:"兼顾组织战略与收益"},
 {title:"宏观管理关系",cue:"宏观棋局",color:green,first:"组合 · 项目集 · 项目 · 运营",second:"分工协作，支撑组织战略"},
];
export const CH06_CLOSING_FRAMES=Math.ceil(audio.totalDurationMs/1000*30)+60;
export const Ch06L01Closing:React.FC=()=>{
 const frame=useCurrentFrame(),{fps}=useVideoConfig(),ms=frame/fps*1000;
 const next=ms>=nextAt;
 const fade=(t:number,duration=420)=>interpolate(ms,[t,t+duration],[0,1],clamp);
 const enter=fade(nextAt,550);
 return <AbsoluteFill style={{background:"#081426",color:"#E6F1FA",fontFamily:'"Noto Sans CJK SC", sans-serif'}}>
  <TechNetwork {...bg}/><Audio src={staticFile("audio/ch06-L01-closing/narration.wav")}/>
  <HeaderBreadcrumb lessonId="ch06-L01" lessonTitle="第 6 章 项目管理概论 · L01" sceneId={next?"CL2":"CL1"} sceneOrder={next?2:1} totalScenes={2} segmentTitle={next?"下节预告":"本课回顾"}/>
  <div style={{position:"absolute",left:96,right:96,top:48}}><div style={{fontSize:20,lineHeight:1.5,letterSpacing:3,color:"#8FB8D9",marginBottom:10}}>{next?"L02 · 下节预告":"L01 · 本课回顾"}</div><div style={{fontSize:46,lineHeight:1.3,fontWeight:700,letterSpacing:1.2}}>{next?"下一节：聚焦项目经理":"把三个问题串成一条管理主线"}</div></div>
  <AbsoluteFill style={{opacity:1-enter,pointerEvents:"none"}}>
   {recap.map((s,i)=><div key={s.title} style={{position:"absolute",left:96+i*592,top:310,width:544,height:322,boxSizing:"border-box",padding:"32px 32px",border:`1.5px solid ${s.color}85`,borderRadius:22,background:"#10213480",opacity:fade(at("recap",s.cue)),translate:`0 ${18*(1-fade(at("recap",s.cue)))}px`}}>
    <div style={{fontSize:22,color:s.color,letterSpacing:3,marginBottom:23}}>0{i+1}</div>
    <div style={{fontSize:39,fontWeight:700,color:s.color,marginBottom:31}}>{s.title}</div>
    <div style={{fontSize:i===2?26:29,lineHeight:1.7}}>{s.first}</div>
    <div style={{fontSize:26,color:muted,marginTop:13}}>{s.second}</div>
   </div>)}
   <div style={{position:"absolute",left:320,right:320,top:710,display:"flex",justifyContent:"center",alignItems:"center",gap:30,opacity:fade(at("recap","五道典范真题"))}}>
    <div style={{display:"flex",gap:12}}>{[1,2,3,4,5].map(n=><div key={n} style={{width:52,height:52,border:`1px solid ${cyan}80`,borderRadius:13,background:"#102C3C80",display:"grid",placeItems:"center",color:cyan,fontSize:27}}>{n}</div>)}</div>
    <div style={{fontSize:30,color:muted}}>五道真题 · 辨清概念与命题陷阱</div>
   </div>
  </AbsoluteFill>
  {next&&<AbsoluteFill style={{opacity:enter}}>
   <div style={{position:"absolute",left:96,top:310,width:640,height:360,boxSizing:"border-box",padding:"42px 48px",border:`1.5px solid ${gold}85`,borderRadius:26,background:"#10213480",translate:`${-20*(1-enter)}px 0`}}>
    <div style={{fontSize:25,color:gold,letterSpacing:5}}>L02</div>
    <div style={{fontSize:66,fontWeight:700,marginTop:31,color:"#E6F1FA",opacity:fade(nextAt+150)}}>项目经理</div>
    <div style={{fontSize:29,color:muted,marginTop:32,opacity:fade(at("next","复杂组织中带队"))}}>复杂组织中的带队者</div>
   </div>
   {[{name:"人才三角",color:cyan},{name:"权力来源",color:gold},{name:"领导力艺术",color:green}].map((s,i)=>{
    const show=fade(at("next",s.name));
    return <React.Fragment key={s.name}>
     <svg width="180" height="480" style={{position:"absolute",left:736,top:250,opacity:show}}><path d={`M0 240 C80 240 80 ${95+i*175} 180 ${95+i*175}`} fill="none" stroke={`${s.color}85`} strokeWidth="2.5"/></svg>
     <div style={{position:"absolute",left:916,top:275+i*175,width:780,height:140,boxSizing:"border-box",display:"flex",alignItems:"center",gap:32,padding:"20px 34px",border:`1.5px solid ${s.color}85`,borderRadius:21,background:"#10213480",opacity:show,translate:`${16*(1-show)}px 0`}}><div style={{fontSize:27,color:s.color,border:`1px solid ${s.color}80`,borderRadius:13,width:62,height:62,display:"grid",placeItems:"center"}}>0{i+1}</div><div style={{fontSize:42,fontWeight:650,color:s.color}}>{s.name}</div></div>
    </React.Fragment>;
   })}
   <div style={{position:"absolute",left:96,right:96,top:830,textAlign:"center",fontSize:33,color:muted,letterSpacing:5,opacity:fade(at("next","我们下节课见"))}}>下节课见</div>
  </AbsoluteFill>}
  <CaptionsOverlay captions={audio.captions}/>
 </AbsoluteFill>;
};
