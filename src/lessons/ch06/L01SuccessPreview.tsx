import React from "react";
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {L01Header as HeaderBreadcrumb, L01Audio as Audio} from "./L01FullPlayback";
import {L01Captions as CaptionsOverlay} from "./L01FullPlayback";
import {TechNetwork} from "../../visual/backgrounds/tech-network/TechNetwork";
import {techNetworkSchema} from "../../visual/backgrounds/tech-network/schema";
import audio from "../../../workspaces/ch06-L01-success/audio-timeline.json";
import timing from "./l01-success-timing.json";

const cyan="#46D6E3",gold="#E6B65F",green="#7BD9B5",red="#FFAA92",muted="#9BB6CA";
const bg=techNetworkSchema.parse({type:"tech-network",ganttEnabled:false,linkOpacity:0.035,nodeOpacity:0.06,highlightCoreOpacity:0.1,highlightGlowOpacity:0.06});
const clamp={extrapolateLeft:"clamp",extrapolateRight:"clamp"} as const;
const norm=(s:string)=>s.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g,"").toUpperCase();
const at=(key:string,phrase:string,end=false)=>{
 const tokens=audio.scenes.find(s=>s.sceneId===`SC-${key}`)!.tokens;
 const chars=tokens.flatMap(t=>[...norm(t.text)].map(ch=>({ch,start:t.startMs,end:t.endMs})));
 const text=norm(phrase),i=chars.map(c=>c.ch).join("").indexOf(text);
 if(i<0)throw new Error(`SC-${key}: ${phrase}`);
 return chars[i+(end?text.length-1:0)][end?"end":"start"];
};
const fade=(ms:number,t:number)=>interpolate(ms,[t,t+400],[0,1],clamp);
const Box:React.FC<{x:number;y:number;w:number;h:number;color?:string;opacity?:number;children:React.ReactNode}>=({x,y,w,h,color=cyan,opacity=1,children})=><div style={{position:"absolute",left:x,top:y,width:w,height:h,boxSizing:"border-box",border:`1.5px solid ${color}85`,borderRadius:22,background:"#10213480",opacity}}>{children}</div>;
const Arrow:React.FC<{x:number;y:number;w:number;opacity?:number;color?:string}>=({x,y,w,opacity=1,color=cyan})=><svg width={w} height="36" style={{position:"absolute",left:x,top:y,opacity}}><path d={`M2 18 H${w-7} M${w-20} 7 L${w-7} 18 L${w-20} 29`} fill="none" stroke={color} strokeWidth="3"/></svg>;

const Strategy:React.FC<{ms:number}>=({ms})=>{
 const f=(s:string)=>fade(ms,at("strategy",s));
 return <>
  <div style={{position:"absolute",left:96,top:228,fontSize:40,color:gold,opacity:f("一个组织的战略能力")}}>有效、高效的项目管理，是组织的战略能力</div>
  {[{title:"项目成果",x:96,color:cyan},{title:"项目管理",x:716,color:gold},{title:"业务目标",x:1336,color:green}].map(s=><Box key={s.title} x={s.x} y={335} w={488} h={134} color={s.color} opacity={f("将项目成果与业务目标联系起来")}><div style={{fontSize:42,fontWeight:650,textAlign:"center",lineHeight:"132px",color:s.color}}>{s.title}</div></Box>)}
  <Arrow x={610} y={385} w={80} opacity={f("将项目成果与业务目标联系起来")}/><Arrow x={1230} y={385} w={80} color={green} opacity={f("将项目成果与业务目标联系起来")}/>
  {[{t:"更有效地竞争",sub:"把项目成果转化为竞争力",cue:"更有效地开展竞争",color:cyan},{t:"实现可持续发展",sub:"持续创造价值与效益",cue:"实现可持续发展",color:green},{t:"应对外部环境变化",sub:"适当调整项目管理计划",cue:"通过适当调整项目管理计划",color:gold}].map((s,i)=><Box key={s.t} x={96+i*592} y={566} w={544} h={249} color={s.color} opacity={f(s.cue)}><div style={{padding:"34px 31px"}}><div style={{fontSize:25,color:muted}}>0{i+1}</div><div style={{fontSize:35,fontWeight:650,color:s.color,marginTop:22}}>{s.t}</div><div style={{fontSize:25,color:muted,marginTop:25}}>{s.sub}</div></div></Box>)}
 </>;
};

const Triangle:React.FC<{ms:number}>=({ms})=>{
 const f=(s:string)=>fade(ms,at("triangle",s));
 return <>
  <div style={{position:"absolute",left:96,top:224,fontSize:31,color:muted}}>传统视角 · 范围、进度、成本与质量</div>
  <svg width="920" height="570" viewBox="0 0 920 570" style={{position:"absolute",left:96,top:283,opacity:f("铁三角")}}>
   <path d="M460 75 L100 454 H820 Z" fill="#46D6E30D" stroke="#46D6E380" strokeWidth="3"/>
   <g opacity={f("范围有没有少做")}><circle cx="460" cy="75" r="11" fill={cyan}/><text x="460" y="35" textAnchor="middle" fill={cyan} fontSize="37">范围</text></g>
   <g opacity={f("工期有没有拖延")}><circle cx="100" cy="454" r="11" fill={cyan}/><text x="100" y="518" textAnchor="middle" fill={cyan} fontSize="37">进度</text></g>
   <g opacity={f("预算有没有超支")}><circle cx="820" cy="454" r="11" fill={cyan}/><text x="820" y="518" textAnchor="middle" fill={cyan} fontSize="37">成本</text></g>
   <g opacity={f("质量是否符合要求")}><circle cx="460" cy="311" r="85" stroke={`${gold}85`} fill="#E6B65F12" strokeWidth="2"/><text x="460" y="327" textAnchor="middle" fill={gold} fontSize="43">质量</text></g>
  </svg>
  <Box x={1120} y={293} w={704} h={530} color={cyan} opacity={f("铁三角")}><div style={{padding:"33px 38px"}}><div style={{fontSize:32,color:gold}}>四个可测量指标</div>{[{t:"范围",q:"有没有少做？",cue:"范围有没有少做"},{t:"进度",q:"有没有拖延？",cue:"工期有没有拖延"},{t:"成本",q:"有没有超支？",cue:"预算有没有超支"},{t:"质量",q:"是否符合要求？",cue:"质量是否符合要求"}].map((s,i)=><div key={s.t} style={{display:"flex",gap:38,alignItems:"center",marginTop:i===0?38:27,paddingBottom:20,borderBottom:i===3?"none":"1px solid #36556D66",fontSize:31,opacity:f(s.cue)}}><span style={{color:i===3?gold:cyan}}>{s.t}</span><span>{s.q}</span></div>)}</div></Box>
 </>;
};

const Failure:React.FC<{ms:number}>=({ms})=>{
 const f=(s:string)=>fade(ms,at("failure",s));
 return <>
  <Box x={96} y={266} w={720} h={472} color={green} opacity={f("从范围进度和预算来看都是成功的")}><div style={{padding:"34px 38px"}}><div style={{fontSize:29,color:muted}}>项目交付</div><div style={{fontSize:43,fontWeight:700,color:green,marginTop:21}}>按要求完成</div><div style={{display:"flex",gap:28,marginTop:43}}>{["范围","进度","预算"].map(t=><div key={t} style={{fontSize:29,color:green,border:`1px solid ${green}66`,borderRadius:12,padding:"16px 19px"}}>{t} ✓</div>)}</div><div style={{marginTop:46,fontSize:30,opacity:f("系统即使完美上线")}}>系统完美上线</div></div></Box>
  <Arrow x={846} y={460} w={130} color={red} opacity={f("但在业务角度上它彻底失败了")}/>
  <Box x={1006} y={266} w={818} h={472} color={red} opacity={f("但在业务角度上它彻底失败了")}><div style={{padding:"34px 38px"}}><div style={{fontSize:29,color:muted}}>业务结果</div><div style={{fontSize:43,fontWeight:700,color:red,marginTop:21}}>仍可能失败</div><div style={{fontSize:30,lineHeight:1.8,marginTop:30,color:muted,opacity:f("市场环境变化了")}}>市场环境变化<br/><span style={{opacity:f("客户需求早就消失了")}}>客户需求消失</span></div><div style={{fontSize:39,color:red,fontWeight:650,marginTop:25,opacity:f("没人使用")}}>上线 ≠ 有人使用</div></div></Box>
  <div style={{position:"absolute",left:96,right:96,top:802,textAlign:"center",fontSize:34,color:gold,opacity:f("无法为组织带来预期的效益和财务投资回报率")}}>没有预期效益与投资回报，交付合格也可能业务失败</div>
 </>;
};

const Dimensions:React.FC<{ms:number}>=({ms})=>{
 const f=(s:string)=>fade(ms,at("dimensions",s));
 return <>
  <Box x={96} y={263} w={780} h={514} color={cyan} opacity={f("时间成本范围质量")}><div style={{padding:"31px 36px"}}><div style={{fontSize:26,color:muted}}>第一维 · 传统测量指标</div><div style={{fontSize:43,fontWeight:650,color:cyan,marginTop:21}}>项目交付表现</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,marginTop:45}}>{["时间","成本","范围","质量"].map(t=><div key={t} style={{padding:"23px 0",textAlign:"center",fontSize:34,color:cyan,border:`1px solid ${cyan}66`,borderRadius:14,background:"#102C3C80"}}>{t}</div>)}</div></div></Box>
  <div style={{position:"absolute",left:905,top:470,fontSize:62,color:gold,opacity:f("还必须建立第二维标准")}}>＋</div>
  <Box x={1006} y={263} w={818} h={514} color={gold} opacity={f("还必须建立第二维标准")}><div style={{padding:"31px 36px"}}><div style={{fontSize:26,color:muted}}>第二维 · 战略与业务成果</div><div style={{fontSize:43,fontWeight:650,color:gold,marginTop:21}}>组织获得的价值</div><div style={{fontSize:23,color:muted,marginTop:20}}>相关标准与目标，例如：</div>{[{t:"完成项目效益管理计划",cue:"完成项目效益管理计划"},{t:"达到约定的财务指标 · NPV / ROI",cue:"净现值和投资回报率"},{t:"当前状态 → 将来状态",cue:"当前状态向将来状态"}].map(s=><div key={s.t} style={{fontSize:28,color:gold,marginTop:29,opacity:f(s.cue),paddingLeft:17,borderLeft:`3px solid ${gold}99`}}>{s.t}</div>)}</div></Box>
  <div style={{position:"absolute",left:96,right:96,top:819,textAlign:"center",fontSize:36,color:green,fontWeight:650,opacity:f("这两个维度必须兼备")}}>评价项目成功，两个维度都要看</div>
 </>;
};

const options=[
 ["项目成功不涉及与组织战略和业务成果交付", "相关的标准与目标"],
 ["明确记录项目目标并选择可测量的目标", "是项目成功的关键"],
 ["确定项目是否成功应考虑项目目标的实现情况"],
 ["有可能一个项目从范围、进度、预算来看是成功的，", "但从业务角度来看并不成功"],
];
const Quiz:React.FC<{ms:number;section:string}>=({ms,section})=>{
 const counting=ms>=timing.countdownStartMs&&ms<timing.countdownStartMs+3000;
 const active=section==='Aread'||section==='Ajudge'?0:section==='B'?1:section==='C'?2:section==='D'?3:-1;
 const error=ms>=at('Ajudge','错得极其离谱',true);
 const word=ms>=at('Ajudge','不字',true);
 const b=ms>=at('B','是项目成功的关键',true),c=ms>=at('C','项目目标的实现情况',true),d=ms>=at('D','但从业务角度来看并不成功',true);
 const answer=ms>=at('summary','所以不正确的稳稳选A',true);
 const judged=[error,b,c,d];
 const f=(key:string,s:string,end=false)=>fade(ms,at(key,s,end));
 return <>
  <div style={{position:"absolute",left:96,top:228,width:1200,display:"flex",flexDirection:"column",gap:18}}>{options.map((lines,i)=>{
   const color=judged[i]?(i===0?red:green):active===i?cyan:"#526D86";
   return <div key={i} style={{height:146,boxSizing:"border-box",padding:"21px 22px",display:"flex",alignItems:"center",gap:20,border:`1.5px solid ${color}B3`,borderRadius:18,background:active===i?"#102C3C99":"#10213480"}}>
    <div style={{width:52,height:52,flexShrink:0,display:"grid",placeItems:"center",borderRadius:12,background:`${color}20`,color:judged[i]||active===i?color:"#C5D4E1",fontSize:31,fontWeight:750}}>{"ABCD"[i]}</div>
    <div style={{fontSize:29,lineHeight:1.65,flex:1}}>{lines.map((text,j)=><React.Fragment key={j}>{j>0&&<br/>}{i===0&&j===0&&word?<>项目成功<span style={{color:red,borderBottom:`3px solid ${red}`}}>不涉及</span>与组织战略和业务成果交付</>:text}</React.Fragment>)}</div>
    <div style={{width:35,flexShrink:0,fontSize:36,color,textAlign:"center"}}>{judged[i]?(i===0?'×':'✓'):''}</div>
   </div>;
  })}</div>
  <Box x={1340} y={228} w={484} h={638} color={muted}><div style={{padding:"28px 28px"}}>
   {section==='read'?<>
    <div style={{fontSize:28,color:muted,textAlign:"center",marginTop:23}}>{counting?'思考时间':ms>=timing.countdownStartMs+3000?'进入解析':'请先独立作答'}</div>
    <div style={{position:"relative",width:220,height:220,margin:"55px auto 32px"}}><svg width="220" height="220"><circle cx="110" cy="110" r="98" fill="none" stroke="#253D52" strokeWidth="6"/>{counting&&<circle cx="110" cy="110" r="98" fill="none" stroke={cyan} strokeWidth="6" strokeDasharray={Math.PI*196} strokeDashoffset={Math.PI*196*(ms-timing.countdownStartMs)/3000} transform="rotate(-90 110 110)"/>}</svg><div style={{position:"absolute",inset:0,display:"grid",placeItems:"center",fontSize:100,fontWeight:700,color:cyan}}>{counting?3-Math.floor((ms-timing.countdownStartMs)/1000):ms>=timing.countdownStartMs+3000?'—':'?'}</div></div>
    <div style={{textAlign:"center",fontSize:26,lineHeight:1.9,color:muted}}>阅读四个选项<br/>选择“不正确”的一项</div>
   </>:<>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",minHeight:44,fontSize:27,color:muted}}><span>{section==='summary'?'答案与归纳':`解析 ${'ABCD'[active]} 项`}</span>{answer&&<span style={{border:`1px solid ${gold}85`,padding:"5px 12px",borderRadius:9,color:gold,fontSize:25}}>答案 A</span>}</div>
    {(section==='Aread'||section==='Ajudge')&&<>
     <div style={{fontSize:28,lineHeight:1.9,marginTop:38,color:muted}}>关注成功标准<br/>与战略、业务成果的关系</div>
     <div style={{fontSize:36,color:red,marginTop:36,opacity:f('Ajudge','不字',true)}}>问题词：“不涉及”</div>
     <div style={{fontSize:29,lineHeight:1.8,color:gold,marginTop:35,opacity:f('Ajudge','全盘否定了战略和业务成果',true)}}>成功标准应考虑<br/>组织战略与业务成果</div>
     <div style={{fontSize:30,color:red,marginTop:35,opacity:f('Ajudge','错得极其离谱',true)}}>A 项表述错误</div>
    </>}
    {section==='B'&&<div style={{opacity:f('B','明确记录项目目标')}}><div style={{fontSize:33,color:cyan,marginTop:48}}>明确记录目标</div><div style={{fontSize:34,color:muted,margin:"23px 0"}}>↓</div><div style={{fontSize:33,color:cyan}}>选择可测量目标</div><div style={{fontSize:29,color:green,lineHeight:1.8,marginTop:43,opacity:f('B','是项目成功的关键',true)}}>项目成功的关键<br/>B 项正确</div></div>}
    {section==='C'&&<div style={{opacity:f('C','确定项目是否成功')}}><div style={{fontSize:33,color:cyan,lineHeight:1.8,marginTop:48}}>是否成功</div><div style={{fontSize:34,color:muted,margin:"23px 0"}}>↓</div><div style={{fontSize:31,color:gold,lineHeight:1.8,opacity:f('C','考虑项目目标的实现情况')}}>考虑目标实现情况</div><div style={{fontSize:29,color:green,marginTop:43,opacity:f('C','项目目标的实现情况',true)}}>C 项正确</div></div>}
    {section==='D'&&<div><div style={{fontSize:30,color:cyan,lineHeight:1.9,marginTop:42,opacity:f('D','从范围进度预算来看是成功的')}}>范围、进度、预算<br/>达到要求</div><div style={{fontSize:42,color:red,margin:"20px 0",opacity:f('D','但从业务角度来看')}}>≠</div><div style={{fontSize:32,color:gold,opacity:f('D','但从业务角度来看')}}>业务成功</div><div style={{fontSize:29,color:green,marginTop:43,opacity:f('D','但从业务角度来看并不成功',true)}}>D 项正确</div></div>}
    {section==='summary'&&<div style={{opacity:answer?1:0}}><div style={{fontSize:31,color:red,marginTop:40}}>不正确的是 A</div><div style={{fontSize:28,color:muted,marginTop:36}}>项目成功的两个维度</div>{['传统测量指标','战略与业务成果'].map(t=><div key={t} style={{fontSize:29,color:gold,textAlign:"center",border:`1px solid ${gold}70`,borderRadius:13,padding:"21px 10px",marginTop:24,background:"#E6B65F0D"}}>{t}</div>)}</div>}
   </>}
  </div></Box>
 </>;
};

export const CH06_SUCCESS_FRAMES=Math.ceil(audio.totalDurationMs/1000*30)+45;
export const Ch06L01Success:React.FC=()=>{
 const frame=useCurrentFrame(),{fps}=useVideoConfig(),ms=frame/fps*1000;
 const found=audio.scenes.findIndex(s=>ms>=s.startMs&&ms<s.endMs),index=found<0?audio.scenes.length-1:found;
 const section=audio.scenes[index].sceneId.replace('SC-','');
 const quiz=index>=4,counting=ms>=timing.countdownStartMs&&ms<timing.countdownStartMs+3000;
 const labels=['战略价值','传统指标','业务视角','两个维度','真题② · 读题','真题② · 阅读 A 项','真题② · 分析 A 项','真题② · 分析 B 项','真题② · 分析 C 项','真题② · 分析 D 项','真题② · 归纳'];
 const titles=['项目管理，把项目成果与业务目标联系起来','衡量项目成功，先看传统指标','交付达到要求，为什么业务仍可能失败？','项目成功：交付表现 ＋ 战略与业务成果'];
 const step=index<5?(index===4&&ms>=timing.countdownStartMs?6:index+1):index+2;
 return <AbsoluteFill style={{background:"#081426",color:"#E6F1FA",fontFamily:'"Noto Sans CJK SC", sans-serif'}}>
  <TechNetwork {...bg}/><Audio src={staticFile('audio/ch06-L01-success/narration.wav')}/>
  <HeaderBreadcrumb lessonId="ch06-L01" lessonTitle="第 6 章 项目管理概论 · L01" sceneId={`SC${step}`} sceneOrder={step} totalScenes={12} segmentTitle={counting?'真题② · 独立作答':labels[index]}/>
  <div style={{position:"absolute",left:96,right:96,top:48}}><div style={{fontSize:20,lineHeight:1.5,letterSpacing:3,color:"#8FB8D9",marginBottom:10}}>{quiz?'2023 年 11 月 · 第 3 批次 · 第 17 题（回忆版）':index===0?'6.2.2 · 项目管理的重要性':'6.2.3 · 项目成功的标准'}</div><div style={{fontSize:46,lineHeight:1.3,fontWeight:700,letterSpacing:1.2}}>{quiz?'下面有关项目成功标准的描述，不正确的是：（　）':titles[index]}</div></div>
  {index===0?<Strategy ms={ms}/>:index===1?<Triangle ms={ms}/>:index===2?<Failure ms={ms}/>:index===3?<Dimensions ms={ms}/>:<Quiz ms={ms} section={section}/>}
  <CaptionsOverlay captions={counting?[]:audio.captions}/>
 </AbsoluteFill>;
};
