import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {L01Header as HeaderBreadcrumb, L01Audio as Audio} from "./L01FullPlayback";
import {L01Captions as CaptionsOverlay} from "./L01FullPlayback";
import { TechNetwork } from "../../visual/backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../../visual/backgrounds/tech-network/schema";
import audio from "../../../workspaces/ch06-L01-opening/audio-timeline.json";
const cyan="#46D6E3",gold="#E6B65F",green="#7BD9B5",muted="#9BB6CA",red="#FFAA92";
const bg=techNetworkSchema.parse({type:"tech-network",ganttEnabled:false,linkOpacity:0.035,nodeOpacity:0.06,highlightCoreOpacity:0.1,highlightGlowOpacity:0.06});
const clamp={extrapolateLeft:"clamp",extrapolateRight:"clamp"} as const;
const norm=(s:string)=>s.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g,"").toUpperCase();
const at=(key:string,phrase:string)=>{
 const tokens=audio.scenes.find(s=>s.sceneId===`OP-${key}`)!.tokens;
 const cc=tokens.flatMap(t=>[...norm(t.text)].map(ch=>({ch,start:t.startMs})));
 const i=cc.map(c=>c.ch).join("").indexOf(norm(phrase));
 if(i<0)throw new Error(`OP-${key}: ${phrase}`);
 return cc[i].start;
};
const fade=(ms:number,t:number)=>interpolate(ms,[t,t+420],[0,1],clamp);
const Box:React.FC<{x:number;y:number;w:number;h:number;color?:string;opacity?:number;children:React.ReactNode}>=({x,y,w,h,color=cyan,opacity=1,children})=><div style={{position:"absolute",left:x,top:y,width:w,height:h,boxSizing:"border-box",border:`1.5px solid ${color}85`,borderRadius:22,background:"#10213480",opacity}}>{children}</div>;
const Arrow:React.FC<{x:number;y:number;w:number;opacity?:number;color?:string}>=({x,y,w,opacity=1,color=cyan})=><svg width={w} height="34" style={{position:"absolute",left:x,top:y,opacity}}><path d={`M4 17 H${w-8} M${w-20} 7 L${w-8} 17 L${w-20} 27`} fill="none" stroke={color} strokeWidth="3"/></svg>;
const Intro:React.FC<{ms:number}>=({ms})=>{
 const f=(s:string)=>fade(ms,at("intro",s));
 const cards=[{chapter:"第 7 章",title:"项目立项",detail:"项目如何被立项",cue:"第7章",color:muted},{chapter:"第 6 章",title:"项目管理概论",detail:"建立管理总图",cue:"接下来从第6章",color:gold},{chapter:"第 8—19 章",title:"具体管理展开",detail:"把项目建好、管好",cue:"第8章到第19章",color:cyan}];
 return <>
  <div style={{position:"absolute",left:96,top:238,display:"flex",alignItems:"center",gap:28,paddingBottom:16}}>
   <span style={{fontSize:34,fontWeight:650,letterSpacing:2,color:gold,padding:"10px 20px",border:`1px solid ${gold}85`,borderRadius:12,background:"#E6B65F12"}}>第六章</span>
   <span style={{fontSize:68,lineHeight:1.2,fontWeight:700,letterSpacing:4,textShadow:"0 3px 18px #46D6E318"}}>项目管理概论</span>
   <div style={{position:"absolute",left:0,right:0,bottom:0,height:2,background:`linear-gradient(90deg, ${gold}B3, ${cyan}66 55%, transparent)`}}/>
  </div>
  <div style={{position:"absolute",left:98,top:344,fontSize:30,color:muted,opacity:f("项目建设阶段管理")}}>从正式立项，进入项目建设阶段管理</div>
  {cards.map((s,i)=><React.Fragment key={s.chapter}><Box x={96+i*604} y={438} w={520} h={236} color={s.color} opacity={f(s.cue)}><div style={{padding:"27px 32px"}}><div style={{color:s.color,fontSize:25,letterSpacing:2}}>{s.chapter}</div><div style={{fontSize:39,fontWeight:700,marginTop:22}}>{s.title}</div><div style={{color:muted,fontSize:27,marginTop:25}}>{s.detail}</div></div></Box>{i<2&&<Arrow x={630+i*604} y={540} w={58} opacity={f(cards[i+1].cue)}/>}</React.Fragment>)}
  <Box x={370} y={760} w={1180} h={99} color={gold} opacity={f("总设计图和底层地基")}><div style={{textAlign:"center",fontSize:34,lineHeight:"97px",color:gold}}>第 6 章：项目管理的总设计图与基础</div></Box>
 </>;
};
const Stats:React.FC<{ms:number}>=({ms})=>{
 const f=(s:string)=>fade(ms,at("stats",s));
 const data=[{n:"38",unit:"道",label:"选择题累计",cue:"38道选择题",color:cyan},{n:"3.5",unit:"分",label:"平均每套约",cue:"3.5分",color:gold},{n:"11 / 11",unit:"",label:"所统计试卷全部覆盖",cue:"百分之百全覆盖",color:green}];
 return <>
  <div style={{position:"absolute",left:96,top:220,fontSize:28,color:muted}}>统计范围：2023—2026 年 · 11 套试卷</div>
  {data.map((s,i)=><Box key={s.label} x={96+i*592} y={310} w={544} h={322} color={s.color} opacity={f(s.cue)}><div style={{padding:"28px 34px"}}><div style={{fontSize:29,color:muted}}>{s.label}</div><div style={{fontSize:i===2?80:112,fontWeight:700,color:s.color,marginTop:22,lineHeight:1.2}}>{s.n}<span style={{fontSize:33,marginLeft:10}}>{s.unit}</span></div>{i===1&&<div style={{fontSize:27,color:muted,marginTop:15,opacity:f("4.6%")}}>占选择题总分约 4.6%</div>}{i===2&&<div style={{fontSize:27,color:muted,marginTop:30}}>覆盖率 100%</div>}</div></Box>)}
  <Box x={96} y={703} w={840} h={155} color={cyan} opacity={f("每套卷稳定考2到5道题")}><div style={{padding:"30px 35px",display:"flex",alignItems:"center",gap:38}}><strong style={{fontSize:58,color:cyan}}>2—5</strong><div style={{fontSize:30,lineHeight:1.6}}>道 / 套<br/><span style={{fontSize:24,color:muted}}>所统计试卷的题量范围</span></div></div></Box>
  <Box x={984} y={703} w={840} h={155} color={gold} opacity={f("也都各考了3道题")}><div style={{padding:"31px 35px",display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{fontSize:29,lineHeight:1.7}}>2026 年 5 月<span style={{display:"block",fontSize:24,color:muted}}>第 1 批次 / 第 2 批次</span></div><div style={{fontSize:43,color:gold}}>3 题 / 3 题</div></div></Box>
 </>;
};
const History:React.FC<{ms:number;details:boolean}>=({ms,details})=>{
 const f=(key:string,s:string)=>fade(ms,at(key,s));
 const nodes=[{year:"1996",edition:"第 1 版",color:muted,title:"基于过程的标准",cue:"基于过程的标准",more:"过程之间相互联系"},{year:"2004",edition:"第 3 版",color:cyan,title:"ANSI 标准标识",cue:"ANSI",more:"首次印于封面"},{year:"2017",edition:"第 6 版",color:gold,title:"敏捷纳入正文",cue:"敏捷内容",more:"5 大过程组 · 10 大知识领域"},{year:"2021",edition:"第 7 版",color:green,title:"系统与价值",cue:"",more:"下一步重点理解"}];
 const timeline=details?1:f("overview","1996年");
 return <>
  <div style={{position:"absolute",left:96,top:205,fontSize:47,fontWeight:700,color:cyan}}>PMBOK <span style={{fontSize:34,color:"#E6F1FA",marginLeft:28}}>《项目管理知识体系指南》</span></div>
  <div style={{position:"absolute",left:98,top:277,fontSize:25,color:muted,opacity:details?1:f("overview","美国项目管理协会")}}>PMI · 美国项目管理协会</div>
  <div style={{position:"absolute",left:96,top:350,fontSize:24,color:muted,opacity:details?1:f("overview","表6-1")}}>表 6-1 · 四个关键版本</div>
  <svg width="1728" height="35" style={{position:"absolute",left:96,top:446,opacity:timeline}}><path d="M200 17 H1535" stroke="#36556D" strokeWidth="3"/></svg>
  {nodes.map((s,i)=>{
   const visible=details?1:i===0?timeline:f("overview","四个关键版本");
   const show=details?(i===3?0.45:f("editions",s.cue)):0;
   return <React.Fragment key={s.year}>
    <div style={{position:"absolute",left:96+i*442,top:392,width:402,textAlign:"center",opacity:visible}}><div style={{fontSize:37,color:s.color,fontWeight:650}}>{s.year}</div><div style={{width:18,height:18,borderRadius:20,background:s.color,margin:"12px auto 20px"}}/><div style={{fontSize:31}}>{s.edition}</div></div>
    <Box x={96+i*442} y={556} w={402} h={230} color={s.color} opacity={show}><div style={{padding:"28px 22px",textAlign:"center"}}><div style={{fontSize:30,fontWeight:650,color:s.color}}>{s.title}</div><div style={{fontSize:i===2?23:25,color:muted,lineHeight:1.8,marginTop:31,opacity:i===2?f("editions","五大过程组"):1}}>{s.more}</div></div></Box>
   </React.Fragment>;
  })}
  {!details&&<div style={{position:"absolute",left:380,right:380,top:650,padding:"30px 0",textAlign:"center",border:`1px solid ${gold}80`,borderRadius:20,background:"#10213480",color:gold,fontSize:39,opacity:f("overview","从第6版到第7版")}}>重点：第 6 版 → 第 7 版</div>}
 </>;
};
const Problem:React.FC<{ms:number}>=({ms})=>{
 const f=(s:string)=>fade(ms,at("problem",s));
 return <>
  <div style={{position:"absolute",left:96,top:225,fontSize:31,color:green}}>2021 · PMBOK 第 7 版</div>
  <Box x={96} y={338} w={742} h={370} color={cyan} opacity={f("过程规范")}><div style={{padding:"36px 40px"}}><div style={{fontSize:39,fontWeight:650,color:cyan}}>详尽的过程规范</div><div style={{fontSize:31,lineHeight:1.8,marginTop:36,color:muted,opacity:f("机械合规")}}>机械合规</div><div style={{fontSize:31,lineHeight:1.8,color:muted,opacity:f("死板套用流程")}}>死板套用流程</div></div></Box>
  <Arrow x={868} y={490} w={170} color={red} opacity={f("商业上失败")}/>
  <Box x={1070} y={338} w={754} h={370} color={red} opacity={f("商业上失败")}><div style={{padding:"36px 40px"}}><div style={{fontSize:29,color:muted}}>项目仍可能</div><div style={{fontSize:55,color:red,fontWeight:700,marginTop:40}}>商业上失败</div><div style={{fontSize:29,color:muted,marginTop:37}}>需要关注系统与价值</div></div></Box>
  <div style={{position:"absolute",left:96,right:96,top:797,textAlign:"center",fontSize:32,color:gold,opacity:f("商业上失败")}}>从执行过程，进一步看向业务结果</div>
 </>;
};
const Value:React.FC<{ms:number}>=({ms})=>{
 const f=(s:string)=>fade(ms,at("value",s));
 return <>
  <Box x={96} y={260} w={636} h={492} color={gold}><div style={{padding:"30px 37px"}}><div style={{fontSize:26,color:gold}}>2017 · 第 6 版</div><div style={{fontSize:39,fontWeight:700,marginTop:23}}>过程组与知识领域</div><div style={{display:"flex",gap:44,marginTop:40}}>{[{n:5,t:"过程组"},{n:10,t:"知识领域"}].map(s=><div key={s.t}><div style={{fontSize:87,fontWeight:700,color:gold,lineHeight:1.2}}>{s.n}</div><div style={{fontSize:28,color:muted,marginTop:12}}>{s.t}</div></div>)}</div><div style={{fontSize:28,color:muted,marginTop:43}}>敏捷内容纳入正文</div></div></Box>
  <Arrow x={764} y={474} w={102} color={green} opacity={f("系统为视角")}/>
  <Box x={900} y={260} w={924} h={492} color={green} opacity={f("系统为视角")}><div style={{padding:"30px 36px"}}><div style={{fontSize:26,color:green}}>2021 · 第 7 版</div><div style={{fontSize:39,fontWeight:700,marginTop:23}}>系统视角</div><div style={{marginTop:26,border:`1px solid ${green}60`,borderRadius:15,padding:"17px 22px",fontSize:34,color:green,background:"#102C3C80",opacity:f("价值交付系统")}}>价值交付系统</div><div style={{display:"flex",gap:62,marginTop:22}}>{[{n:12,t:"项目管理原则",cue:"十二个"},{n:8,t:"项目绩效域",cue:"八个"}].map(s=><div key={s.t} style={{opacity:f(s.cue)}}><div style={{fontSize:78,lineHeight:1.2,fontWeight:700,color:green}}>{s.n}</div><div style={{fontSize:27,color:muted,marginTop:8}}>{s.t}</div></div>)}</div></div></Box>
  <div style={{position:"absolute",left:180,right:180,top:804,textAlign:"center",fontSize:33,color:gold,opacity:f("同时容纳")}}>第四版教材：传统过程组 ＋ 价值原则</div>
 </>;
};
export const CH06_OPENING_FRAMES=Math.ceil(audio.totalDurationMs/1000*30)+45;
export const Ch06L01Opening:React.FC=()=>{
 const frame=useCurrentFrame(),{fps}=useVideoConfig(),ms=frame/fps*1000;
 const index=audio.scenes.findIndex(s=>ms>=s.startMs&&ms<s.endMs),shot=index<0?5:index;
 const titles=["从项目立项，走向项目建设与管理","第 6 章考情：题量与覆盖","PMBOK：看懂四个版本的演进","从过程标准，走到第 6 版","为什么要转向系统与价值？","第 6 → 7 版：把过程放进价值视角"];
 const labels=["课程引入","考情速览","发展脉络","关键版本","转轨背景","系统与价值"];
 return <AbsoluteFill style={{background:"#081426",color:"#E6F1FA",fontFamily:'"Noto Sans CJK SC", sans-serif'}}>
  <TechNetwork {...bg}/><Audio src={staticFile("audio/ch06-L01-opening/narration.wav")}/>
  <HeaderBreadcrumb lessonId="ch06-L01" lessonTitle="第 6 章 项目管理概论 · L01" sceneId={`OP${shot+1}`} sceneOrder={shot+1} totalScenes={6} segmentTitle={labels[shot]}/>
  <div style={{position:"absolute",left:96,right:96,top:48}}><div style={{fontSize:20,lineHeight:1.5,letterSpacing:3,color:"#8FB8D9",marginBottom:10}}>{shot<2?"第 6 章 · 学习导入":"6.1 · PMBOK 的发展"}</div><div style={{fontSize:46,lineHeight:1.3,fontWeight:700,letterSpacing:1.2}}>{titles[shot]}</div></div>
  {shot===0?<Intro ms={ms}/>:shot===1?<Stats ms={ms}/>:shot<4?<History ms={ms} details={shot===3}/>:shot===4?<Problem ms={ms}/>:<Value ms={ms}/>}
  <CaptionsOverlay captions={audio.captions}/>
 </AbsoluteFill>;
};
