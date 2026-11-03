import React from 'react';
import {ExamQuizCard} from '../../../visual/templates/ExamQuizCard';
import {C, Canvas, Link, Txt} from './g01-v2-objects';
import type {G02Cue, G02Motion, G02Pause} from './g02-timing';

const statements = [
  {id: '①', text: '关键绩效指标(KPI）'}, {id: '②', text: '净值分析'}, {id: '③', text: '进度活动的实际开始日期'},
  {id: '④', text: '可交付成果状态'}, {id: '⑤', text: '合同绩效信息'}, {id: '⑥', text: '缺陷的数量'},
];
const readingCues: G02Cue[] = ['item1', 'item2', 'item3', 'item4', 'item5', 'item6'];
const optionCues: G02Cue[] = ['readA', 'readB', 'readC', 'readD'];
const evidenceCues: G02Cue[] = ['evidence', 'evidence3', 'evidence4', 'evidence6'];

export const G02Quiz: React.FC<{m: G02Motion; pause: G02Pause; fps: number}> = ({m, pause, fps}) => {
  const revealed = m.has('answer');
  const readingPhase = m.ms < pause.startMs;
  const readingItem = readingCues.filter((cue) => m.has(cue)).length - 1;
  const readingOption = optionCues.filter((cue) => m.has(cue)).length - 1;
  const process = m.p('execution', 700);
  return <>
    <ExamQuizCard withShell={false} statusText={false} left={120} top={160} width={1680} columns={2} bodySize={32} optionSize={30}
      timing={{stemEndFrame: Math.ceil(pause.startMs * fps / 1000), revealFrame: Math.ceil(m.at('answer') * fps / 1000)}}
      payload={{title: '2023年5月 · 第25题', examMeta: '2023年5月 · 第25题', stem: '（25）属于工作绩效数据。', stemHighlights: [], numberedStatements: statements.map((statement) => ({...statement, eliminated: false})),
        options: ['①②③④', '①③④⑥', '②③⑤⑥', '③④⑤⑥'].map((text, i) => ({key: (['A', 'B', 'C', 'D'] as const)[i], text, isCorrect: i === 1}))}}
      renderStatement={(statement, i) => {
        const evidenceIndex = [0, 2, 3, 5].indexOf(i);
        const data = evidenceIndex >= 0 && m.has(evidenceCues[evidenceIndex]);
        const excluded = i === 1 && m.has('exclude2') || i === 4 && m.has('exclude5');
        const focused = readingPhase && !revealed && readingOption < 0 && readingItem === i;
        const color = data ? C.green : excluded ? C.red : focused ? C.gold : C.blue;
        return <div data-statement={statement.id} data-classified={data || excluded} data-reading-focus={focused} style={{flex: '0 0 calc(50% - 6px)', boxSizing: 'border-box', padding: '7px 16px', borderRadius: 10, minHeight: 56,
          background: focused ? `${C.gold}30` : data || excluded ? `${color}20` : 'rgba(18,34,64,.85)', border: `1.5px solid ${data || excluded || focused ? color : '#416086'}`, boxShadow: focused ? `inset 5px 0 0 ${C.gold}, inset 0 0 0 1px ${C.gold}` : undefined, color: C.text, fontSize: 28, fontWeight: 600}}>
          <span style={{color: data || excluded || focused ? color : C.text, fontWeight: focused ? 900 : 600}}>{statement.id}</span> {statement.text}
        </div>;
      }}
      renderOption={(option, i) => {
        const answer = revealed && i === 1;
        const focused = readingPhase && !revealed && readingOption === i;
        return <div data-option={option.key} data-answer={answer} data-reading-focus={focused} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '14px 24px', borderRadius: 14,
          background: answer ? `${C.green}25` : focused ? `${C.gold}30` : 'rgba(6,14,31,.78)', border: `2px solid ${answer ? C.green : focused ? C.gold : '#416086'}`, boxShadow: focused ? `inset 5px 0 0 ${C.gold}, inset 0 0 0 1px ${C.gold}` : undefined}}>
          <span style={{display: 'flex', width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center', background: answer ? C.green : focused ? C.gold : `${C.cyan}30`, color: answer || focused ? '#04131A' : C.text, fontSize: 30, fontWeight: 800}}>{option.key}</span>
          <span style={{fontSize: 30, flex: 1}}>{option.text}</span>
          {answer && <span style={{fontSize: 23, color: C.green}}>✓ 本题答案</span>}
        </div>;
      }}/>
    <Canvas>
      <g opacity={m.p('evidence', 400) * (1 - process)}>
        {m.has('exclude2') ? <>
          <Txt x={170} y={764} size={30} color={C.red}>{m.has('exclude5') ? '⑤ 合同绩效信息' : '② 净值分析'}</Txt>
          <Link d="M660 754H1030" color={C.red} label={m.has('exclude5') ? '已形成信息' : '分析处理'} x={760} y={731}/>
          <Txt x={1080} y={764} size={30}>不属于原始记录组合</Txt>
          <Txt x={170} y={852} size={28} color={C.green}>① 指标记录　③ 活动日期　④ 成果状态　⑥ 缺陷计数</Txt>
        </> : <>
          {['① 指标记录', '③ 活动日期', '④ 成果状态', '⑥ 缺陷计数'].map((label, i) => <g key={label} opacity={m.p(evidenceCues[i], 240)}>
            <Txt x={165 + i * 410} y={760} size={29} color={C.green}>{label}</Txt>
            <path d={`M${250 + i * 410} 778V806`} stroke={C.green} strokeWidth={2}/>
          </g>)}
          <g opacity={m.p('evidence6', 240)}><path d="M250 806H1480" stroke={C.green} strokeWidth={2}/><Txt x={860} y={860} center size={31} color={C.green}>执行中观察和测量得到的记录</Txt></g>
        </>}
      </g>
      <g opacity={process}>
        <Txt x={160} y={776} size={31} color={C.cyan}>执行活动</Txt>
        <Link d="M390 763H1130" label="收集并传递工作绩效数据" x={510} y={736} progress={process}/>
        <Txt x={1160} y={776} size={31} color={C.gold}>相关监控过程</Txt>
        <g opacity={m.p('analysis')}><Txt x={1160} y={855} size={29} color={C.gold}>分析 → 工作绩效信息</Txt></g>
      </g>
    </Canvas>
  </>;
};
