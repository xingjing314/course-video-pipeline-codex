import React from "react";
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {L01Header as HeaderBreadcrumb, L01Audio as Audio} from "./L01FullPlayback";
import {L01Captions as CaptionsOverlay} from "./L01FullPlayback";
import {TechNetwork} from "../../visual/backgrounds/tech-network/TechNetwork";
import {techNetworkSchema} from "../../visual/backgrounds/tech-network/schema";
import audio from "../../../workspaces/ch06-L01-traits/audio-timeline.json";

const cyan="#46D6E3",gold="#E6B65F",green="#7BD9B5",muted="#9BB6CA",red="#FFAA92";
const bg=techNetworkSchema.parse({type:"tech-network",ganttEnabled:false,linkOpacity:0.035,nodeOpacity:0.06,highlightCoreOpacity:0.1,highlightGlowOpacity:0.06});
const clamp={extrapolateLeft:"clamp",extrapolateRight:"clamp"} as const;
const norm=(s:string)=>s.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g,"").toUpperCase();
const at=(key:string,phrase:string)=>{
 const tokens=audio.scenes.find(s=>s.sceneId===`TR-${key}`)!.tokens;
 const chars=tokens.flatMap(t=>[...norm(t.text)].map(ch=>({ch,start:t.startMs})));
 const i=chars.map(c=>c.ch).join("").indexOf(norm(phrase));
 if(i<0)throw new Error(`TR-${key}: ${phrase}`);
 return chars[i].start;
};
const fade=(ms:number,t:number)=>interpolate(ms,[t,t+420],[0,1],clamp);
const Box:React.FC<{x:number;y:number;w:number;h:number;color?:string;opacity?:number;children:React.ReactNode}>=({x,y,w,h,color=cyan,opacity=1,children})=><div style={{position:"absolute",left:x,top:y,width:w,height:h,boxSizing:"border-box",border:`1.5px solid ${color}85`,borderRadius:22,background:"#10213480",opacity}}>{children}</div>;

const Unique:React.FC<{ms:number}>=({ms})=>{
 const f=(s:string)=>fade(ms,at("unique",s));
 return <>
  <div style={{position:"absolute",left:96,top:223,fontSize:26,color:gold}}>项目的两大特征 · 01 独特性</div>
  <Box x={96} y={298} w={1728} h={140} opacity={f("完全相同的技术架构")}><div style={{padding:"24px 32px",display:"flex",alignItems:"center",gap:42}}><div style={{color:muted,fontSize:29}}>可以相同</div><div style={{fontSize:34,color:cyan}}>技术架构</div><div style={{fontSize:34,color:cyan,opacity:f("同一个开发团队")}}>开发团队</div><div style={{fontSize:34,color:cyan,opacity:f("相同的活动元素")}}>活动元素</div></div><div style={{position:"absolute",left:32,bottom:17,color:muted,fontSize:22}}>两个信息系统项目可以共享技术与经验</div></Box>
  {["项目 A","项目 B"].map((name,i)=><Box key={name} x={96+i*888} y={492} w={840} h={258} color={i?gold:cyan} opacity={f("两个信息系统项目")}><div style={{padding:"24px 32px"}}><div style={{fontSize:36,fontWeight:700,color:i?gold:cyan}}>{name}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px 30px",marginTop:29}}>{[{t:"客户需求",cue:"客户需求"},{t:"应用场景",cue:"应用场景"},{t:"干系人",cue:"干系人"},{t:"运行环境",cue:"运行环境"}].map(s=><div key={s.t} style={{fontSize:29,opacity:f(s.cue),display:"flex",gap:15,alignItems:"center"}}><span style={{width:7,height:27,borderRadius:4,background:i?gold:cyan}}/>{s.t}<span style={{fontSize:23,color:muted}}>不同</span></div>)}</div></div></Box>)}
  <div style={{position:"absolute",left:96,right:96,top:802,textAlign:"center",fontSize:41,fontWeight:650,color:gold,opacity:f("每个项目依然是独一无二的")}}>相同元素 ≠ 相同项目</div>
 </>;
};

const Boundary:React.FC<{ms:number}>=({ms})=>{
 const f=(s:string)=>fade(ms,at("boundary",s));
 return <>
  <div style={{position:"absolute",left:96,top:223,fontSize:26,color:gold}}>项目的两大特征 · 02 临时性</div>
  <Box x={96} y={330} w={490} h={368} color={gold} opacity={f("创新探索是有风险的")}><div style={{padding:"38px 35px"}}><div style={{fontSize:27,color:muted}}>创新探索</div><div style={{fontSize:51,fontWeight:700,color:gold,marginTop:34}}>存在风险</div><div style={{fontSize:29,color:muted,marginTop:40,lineHeight:1.7}}>需要明确的<br/>始末边界</div></div></Box>
  <div style={{position:"absolute",left:674,top:332,fontSize:34,color:cyan,opacity:f("明确的始末边界")}}>临时性：有明确的起点和终点</div>
  <svg width="1150" height="180" style={{position:"absolute",left:674,top:435,opacity:f("明确的始末边界")}}><rect x="42" y="32" width="1000" height="90" rx="15" fill="#46D6E318"/><path d="M42 77 H1042 M42 25 V130 M1042 25 V130" stroke={cyan} strokeWidth="4"/><circle cx="42" cy="77" r="10" fill={gold}/><circle cx="1042" cy="77" r="10" fill={green}/><text x="542" y="66" textAnchor="middle" fill="#E6F1FA" fontSize="31">项目工作</text></svg>
  <div style={{position:"absolute",left:674,top:611,width:1088,display:"flex",justifyContent:"space-between",fontSize:31,opacity:f("有明确的起点和终点")}}><span style={{color:gold}}>明确起点</span><span style={{color:green}}>明确终点</span></div>
  <div style={{position:"absolute",left:674,top:758,width:1088,textAlign:"center",fontSize:38,color:gold,opacity:f("实现风险闭环")}}>划定边界，实现风险闭环</div>
 </>;
};

const Traps:React.FC<{ms:number}>=({ms})=>{
 const f=(s:string)=>fade(ms,at("traps",s));
 const progress=interpolate(ms,[at("traps","大国工程做十年"),at("traps","依然叫临时性")],[0,1],clamp);
 return <>
  <Box x={96} y={267} w={840} h={520} color={gold} opacity={f("第一")}><div style={{padding:"30px 34px"}}><div style={{fontSize:25,color:gold}}>易错点 01</div><div style={{fontSize:42,fontWeight:700,marginTop:24}}>临时性 <span style={{color:red}}>≠</span> 持续时间短</div><div style={{marginTop:44,opacity:f("大国工程做十年")}}><div style={{fontSize:30,color:muted}}>大国工程</div><div style={{fontSize:68,color:gold,fontWeight:700,marginTop:16}}>10 <span style={{fontSize:32}}>年</span></div><div style={{height:5,background:"#304654",marginTop:20,position:"relative"}}><div style={{height:5,width:`${progress*100}%`,background:gold}}/><div style={{position:"absolute",left:0,top:-7,height:19,width:3,background:gold}}/><div style={{position:"absolute",right:0,top:-7,height:19,width:3,background:gold}}/></div><div style={{display:"flex",justifyContent:"space-between",marginTop:17,color:muted,fontSize:24}}><span>开始</span><span>结束</span></div></div><div style={{fontSize:29,color:green,marginTop:24,opacity:f("依然叫临时性")}}>有起点、有终点，依然是临时性</div></div></Box>
  <Box x={984} y={267} w={840} h={520} color={cyan} opacity={f("第二")}><div style={{padding:"30px 34px"}}><div style={{fontSize:25,color:cyan}}>易错点 02</div><div style={{fontSize:42,fontWeight:700,marginTop:24}}>项目 <span style={{color:red}}>≠</span> 周期性工作</div><svg width="690" height="168" style={{marginTop:30,opacity:f("周而复始的流水线")}}><path d="M90 38 H600 Q650 38 650 84 Q650 130 600 130 H90 Q40 130 40 84 Q40 38 90 38 M580 26 L600 38 L580 50 M110 118 L90 130 L110 142" stroke={muted} fill="none" strokeWidth="3"/>{[170,345,520].map(x=><rect key={x} x={x-28} y="65" width="56" height="38" rx="6" fill="#46D6E318" stroke={cyan}/>)}<text x="345" y="159" fill={muted} textAnchor="middle" fontSize="23">重复循环</text></svg><div style={{fontSize:29,color:muted,marginTop:18,opacity:f("周而复始的流水线")}}>周而复始的流水线</div><div style={{fontSize:29,color:red,marginTop:22,opacity:f("绝不能说成是周期性工作")}}>不能用“周期性”替换“临时性”</div></div></Box>
  <div style={{position:"absolute",left:96,right:96,top:815,textAlign:"center",fontSize:32,color:gold,opacity:f("绝不能说成是周期性工作")}}>判断临时性，看起止边界</div>
 </>;
};

const Results:React.FC<{ms:number}>=({ms})=>{
 const f=(s:string)=>fade(ms,at("results",s));
 const extend=interpolate(ms,[at("results","在项目结束后"),at("results","持续创造价值")+550],[0,1],clamp);
 return <>
  <div style={{position:"absolute",left:96,top:235,fontSize:35,color:gold}}>项目结束，成果仍可延续</div>
  <svg width="1728" height="330" style={{position:"absolute",left:96,top:340}}>
   <text x="0" y="70" fill={muted} fontSize="29">项目工作</text><path d="M240 60 H900" stroke={gold} strokeWidth="7"/><circle cx="240" cy="60" r="9" fill={gold}/><circle cx="900" cy="60" r="9" fill={gold}/><text x="240" y="108" fill={muted} fontSize="24" textAnchor="middle">开始</text><text x="900" y="108" fill={gold} fontSize="24" textAnchor="middle">项目结束</text>
   <path d="M900 130 V285" stroke="#557080" strokeWidth="2" strokeDasharray="8 9"/>
   <g opacity={f("项目交付的成果")}><text x="0" y="242" fill={muted} fontSize="29">交付成果</text><path d="M900 232 H1660" stroke="#254C4D" strokeWidth="8"/><path d={`M900 232 H${900+760*extend}`} stroke={green} strokeWidth="8"/><path d="M1640 220 L1660 232 L1640 244" stroke={green} strokeWidth="4" fill="none" opacity={extend}/><circle cx="900" cy="232" r="10" fill={green}/><text x="1250" y="203" fill={green} fontSize="31" textAnchor="middle" opacity={f("长期存在")}>长期存在，持续创造价值</text></g>
  </svg>
  {[{t:"核心交易系统",cue:"核心交易系统",color:cyan},{t:"数据中心",cue:"数据中心",color:green}].map((s,i)=><Box key={s.t} x={96+i*888} y={710} w={840} h={142} color={s.color} opacity={f(s.cue)}><div style={{display:"flex",alignItems:"center",gap:27,padding:"29px 33px"}}><svg width="62" height="78" viewBox="0 0 62 78">{[5,29,53].map(y=><g key={y}><rect x="2" y={y} width="57" height="19" rx="4" fill={`${s.color}18`} stroke={s.color}/><circle cx="48" cy={y+9} r="3" fill={s.color}/></g>)}</svg><div style={{fontSize:35,color:s.color}}>{s.t}</div></div></Box>)}
 </>;
};

const Ending:React.FC<{ms:number}>=({ms})=>{
 const f=(s:string)=>fade(ms,at("ending",s));
 const items=[{title:"达成目标",sub:"完成预定目标",cue:"达成目标",color:green},{title:"不能达到目标",sub:"目标无法实现",cue:"不能达到目标",color:gold},{title:"资金耗尽",sub:"缺少资金支持",cue:"资金耗尽",color:gold},{title:"需求不复存在",sub:"项目已不再被需要",cue:"需求不复存在",color:gold},{title:"无法获得所需资源",sub:"人力或物力无法到位",cue:"无法获得所需资源",color:gold},{title:"法律原因",sub:"依法终止",cue:"法律原因",color:gold}];
 return <>
  <div style={{position:"absolute",left:96,top:231,fontSize:29,color:muted}}>项目可以在以下情形下宣告结束</div>
  {items.map((s,i)=><Box key={s.title} x={96+(i%3)*592} y={310+Math.floor(i/3)*230} w={544} h={195} color={s.color} opacity={f(s.cue)}><div style={{padding:"24px 28px",display:"flex",gap:22}}><div style={{fontSize:25,color:s.color,paddingTop:5}}>0{i+1}</div><div><div style={{fontSize:i===4?32:35,color:s.color,fontWeight:650}}>{s.title}</div><div style={{fontSize:25,color:muted,marginTop:28}}>{s.sub}</div></div></div></Box>)}
  <div style={{position:"absolute",left:240,right:240,top:790,height:77,borderTop:`1px solid ${gold}66`,textAlign:"center",paddingTop:22,fontSize:34,color:gold,opacity:f("依法依规宣告终止")}}>达成目标可结束，满足终止条件也可结束</div>
 </>;
};

export const CH06_TRAITS_FRAMES=Math.ceil(audio.totalDurationMs/1000*30)+45;
export const Ch06L01Traits:React.FC=()=>{
 const frame=useCurrentFrame(),{fps}=useVideoConfig(),ms=frame/fps*1000;
 const index=audio.scenes.findIndex(s=>ms>=s.startMs&&ms<s.endMs),shot=index<0?4:index;
 const labels=["独特性","临时性","两个易错点","成果延续","结束条件"];
 const titles=["相同的技术与团队，依然是独特的项目","临时性：为项目划定起止边界","临时性，不等于短期或周期性","项目有终点，成果可持续创造价值","项目什么时候宣告结束？"];
 return <AbsoluteFill style={{background:"#081426",color:"#E6F1FA",fontFamily:'"Noto Sans CJK SC", sans-serif'}}>
  <TechNetwork {...bg}/><Audio src={staticFile("audio/ch06-L01-traits/narration.wav")}/>
  <HeaderBreadcrumb lessonId="ch06-L01" lessonTitle="第 6 章 项目管理概论 · L01" sceneId={`TR${shot+1}`} sceneOrder={shot+1} totalScenes={5} segmentTitle={labels[shot]}/>
  <div style={{position:"absolute",left:96,right:96,top:48}}><div style={{fontSize:20,lineHeight:1.5,letterSpacing:3,color:"#8FB8D9",marginBottom:10}}>6.2.1 · 项目的特征</div><div style={{fontSize:46,lineHeight:1.3,fontWeight:700,letterSpacing:1.2}}>{titles[shot]}</div></div>
  {shot===0?<Unique ms={ms}/>:shot===1?<Boundary ms={ms}/>:shot===2?<Traps ms={ms}/>:shot===3?<Results ms={ms}/>:<Ending ms={ms}/>}
  <CaptionsOverlay captions={audio.captions}/>
 </AbsoluteFill>;
};
