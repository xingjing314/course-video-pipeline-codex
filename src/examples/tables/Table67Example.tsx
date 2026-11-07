import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { TechNetwork } from "../../visual/backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../../visual/backgrounds/tech-network/schema";
import { HeaderBreadcrumb } from "../../visual/shell/HeaderBreadcrumb";
import { table67Rows } from "./Table67Data";

const cyan = "#46D6E3", gold = "#E6B65F", ink = "#E6F1FA", muted = "#8FB8D9";
const bg = techNetworkSchema.parse({type:"tech-network",ganttEnabled:false,linkOpacity:0.035,nodeOpacity:0.06,highlightCoreOpacity:0.1,highlightGlowOpacity:0.06});
const widths = [218,244,350,308,344,264];
const columns = ["启动过程组","规划过程组","执行过程组","监控过程组","收尾过程组"];
const names = ["整合","范围","进度","成本","质量","资源","沟通","风险","采购","干系人"];
const heights = [[100,132,170,100,48],[112,72,166,72,128]];
type Cue = {at:number; rows?:number[]; cols?:number[]; cells?:string[]; note:string};
// 每个节点是完整选中集合；索引为全表索引，翻页不改变对象身份。
const cues: Cue[] = [
  {at:0,note:"横向看：同一知识领域分布在哪些过程组；纵向看：同一过程组涉及哪些知识领域。"},
  {at:6,rows:[1,2],note:"范围与进度：对照这两行，相关过程集中在规划与监控。"},
  {at:12,rows:[2],note:"保留进度管理这一行：五个规划过程，对应一个监控过程。"},
  {at:17,cols:[2,4],note:"沿规划与监控两列比较：先安排工作，再检查与控制。"},
  {at:23,cells:["1:4","2:4"],note:"分别定位：范围管理中的确定范围、控制范围；进度管理中的控制进度。"},
  {at:27,note:"恢复完整对照。下一页继续使用相同表头与列位置。"},
  {at:30,note:"继续查看资源、沟通、风险、采购与干系人管理；五个过程组的位置保持不变。"},
  {at:36,rows:[6,8],note:"沟通与采购：横向对照规划、执行、监控三个过程组中的对应过程。"},
  {at:42,cols:[2,3,4],note:"纵向对照规划、执行与监控，观察不同知识领域如何分布。"},
  {at:48,cells:["6:4","7:4","9:4"],note:"共同定位监控过程组：监督沟通、监督风险、监督干系人参与。"},
  {at:54,cells:["6:4","9:4"],note:"取消风险单元格的强调，保留沟通与干系人两项作对照。"},
  {at:59,note:"取消全部强调，回到完整表格。空白表示此交叉位置没有列出独立过程。"},
];
const ease = Easing.bezier(0.22,1,0.36,1);
const ramp = (t:number,start:number,duration=0.5) => interpolate(t,[start,start+duration],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp",easing:ease});

export const Table67Example: React.FC = () => {
  const { fps } = useVideoConfig();
  const t = useCurrentFrame()/fps;
  const page = t < 30 ? 0 : 1;
  const index = cues.reduce((last,c,i)=>t>=c.at?i:last,0);
  const current = cues[index], previous = cues[Math.max(0,index-1)];
  const progress = ramp(t,current.at);
  const weight = (test:(cue:Cue)=>boolean) => Number(test(previous))*(1-progress)+Number(test(current))*progress;
  const rowWeight = (r:number)=>weight(c=>c.rows?.includes(r)??false);
  const colWeight = (col:number)=>weight(c=>c.cols?.includes(col)??false);
  const cellWeight = (r:number,col:number)=>weight(c=>c.cells?.includes(`${r}:${col}`)??false);
  // 翻页先退旧正文再进新正文；固定表头、网格宽度与定位条不移动。
  const bodyOpacity = page === 0 ? ramp(t,0.15)*(1-ramp(t,29.65,0.35)) : ramp(t,30,0.55);
  return <AbsoluteFill style={{background:"#081426",color:ink,fontFamily:'"Noto Sans CJK SC", sans-serif'}}>
    <TechNetwork {...bg}/>
    <HeaderBreadcrumb lessonId="ch06" lessonTitle="第 6 章 项目管理概论 · 表 6-7" sceneId={`P${page+1}`} sceneOrder={page+1} totalScenes={2} segmentTitle="过程组与知识领域"/>
    <div style={{position:"absolute",left:96,top:48}}>
      <div style={{fontSize:20,color:muted,letterSpacing:3,marginBottom:10}}>表 6-7 · 项目管理过程对应关系</div>
      <div style={{fontSize:46,fontWeight:700,lineHeight:1.3}}>五个过程组 × 十大知识领域</div>
    </div>
    <div style={{position:"absolute",left:96,right:96,top:166,height:38,display:"flex",gap:8}}>
      {names.map((name,r)=><div key={name} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:9,fontSize:24,
        color:Math.floor(r/5)===page?ink:muted,background:Math.floor(r/5)===page?"#46D6E319":"#10213466",borderRadius:6,
        borderBottom:`2px solid ${Math.floor(r/5)===page?cyan:"#8FB8D933"}`}}><span style={{fontSize:16,color:muted}}>{String(r+1).padStart(2,"0")}</span>{name}</div>)}
    </div>
    <div role="table" aria-label="表6-7 项目管理五个过程组和十大知识领域" style={{position:"absolute",left:96,top:224,width:1728,height:630,background:"#10213499",border:"1px solid #46D6E34D",borderRadius:16,overflow:"hidden",boxSizing:"border-box"}}>
      <div role="row" style={{height:80,display:"grid",gridTemplateColumns:"218px 1fr",background:"#46D6E314"}}>
        <div role="columnheader" style={{display:"flex",alignItems:"center",paddingLeft:18,fontSize:28,fontWeight:650,color:cyan,borderRight:"1px solid #8FB8D940"}}>知识领域</div>
        <div>
          <div style={{height:34,textAlign:"center",fontSize:22,letterSpacing:5,color:muted,borderBottom:"1px solid #8FB8D933",boxSizing:"border-box"}}>项目管理过程组</div>
          <div style={{display:"grid",gridTemplateColumns:widths.slice(1).map(w=>`${w}px`).join(" "),height:46}}>
            {columns.map((name,c)=><div role="columnheader" key={name} style={{display:"flex",alignItems:"center",justifyContent:"center",fontSize:27,fontWeight:650,color:cyan,borderRight:"1px solid #8FB8D933",position:"relative"}}>
              <div style={{position:"absolute",inset:0,background:"#E6B65F25",borderBottom:`3px solid ${gold}`,opacity:colWeight(c+1)}}/>
              <span style={{position:"relative"}}>{name}</span>
            </div>)}
          </div>
        </div>
      </div>
      <div style={{opacity:bodyOpacity}}>
        {table67Rows.slice(page*5,page*5+5).map((row,local)=>{
          const r=page*5+local;
          return <div role="row" key={r} style={{display:"grid",gridTemplateColumns:widths.map(w=>`${w}px`).join(" "),height:heights[page][local],boxSizing:"border-box",borderTop:"1px solid #8FB8D940",position:"relative"}}>
            <div style={{position:"absolute",inset:0,background:"#46D6E31C",borderLeft:`4px solid ${cyan}`,opacity:rowWeight(r),pointerEvents:"none"}}/>
            {row.map((lines,c)=><div role="cell" key={c} style={{position:"relative",borderRight:"1px solid #8FB8D933",padding:"0 16px",display:"flex",alignItems:"center",boxSizing:"border-box",minWidth:0}}>
              <div style={{position:"absolute",inset:0,background:"#E6B65F16",opacity:colWeight(c)}}/>
              <div style={{position:"absolute",inset:3,border:`2px solid ${gold}`,borderRadius:7,background:"#E6B65F1C",opacity:cellWeight(r,c)}}/>
              <div style={{position:"relative",fontSize:26,fontWeight:c===0?650:400,color:c===0?cyan:ink,lineHeight:"31px"}}>
                {lines.map((line,i)=><div key={i} style={{whiteSpace:"nowrap"}}>{line}</div>)}
              </div>
            </div>)}
          </div>;
        })}
      </div>
    </div>
    <div style={{position:"absolute",left:96,right:96,top:866,height:34,borderLeft:`3px solid ${gold}`,paddingLeft:20,fontSize:24,lineHeight:"34px",color:ink}}>
      {cues.map((c,i)=><div key={c.at} style={{position:"absolute",left:20,right:0,opacity:ramp(t,c.at+0.1,0.4)*(i===cues.length-1?1:1-ramp(t,cues[i+1].at,0.25))}}>{c.note}</div>)}
    </div>
  </AbsoluteFill>;
};
