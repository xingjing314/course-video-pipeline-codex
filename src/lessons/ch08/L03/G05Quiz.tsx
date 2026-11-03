import React from 'react';
import {ExamQuizCard} from '../../../visual/templates/ExamQuizCard';
import {C, Canvas, Link, Paper, Person, Txt} from './g01-v2-objects';
import type {G05Cue, G05Motion, G05Pause} from './g05-timing';

const optionCues: G05Cue[] = ['readA', 'readB', 'readC', 'readD'];
export const G05Quiz: React.FC<{m: G05Motion; pause: G05Pause; fps: number}> = ({m, pause, fps}) => {
  const readingPhase = m.ms < pause.startMs;
  const revealed = m.has('answer');
  const focus = optionCues.filter((cue) => m.has(cue)).length - 1;
  return <>
    <ExamQuizCard withShell={false} statusText={false} left={120} top={160} width={1680} columns={2} bodySize={34} optionSize={32}
      timing={{stemEndFrame: Math.ceil(pause.startMs * fps / 1000), revealFrame: Math.ceil(m.at('answer') * fps / 1000)}}
      payload={{title: '2023年11月 · 第3批次 · 第26题', examMeta: '2023年11月 · 第3批次 · 第26题',
        stem: '管理项目知识过程的工具中，（  ）用于创建人们与知识之间的联系，可以有效促进简单、明确的显性知识的分享。',
        stemHighlights: [],
        options: ['专家判断', '知识管理工具和技术', '信息管理工具和技术', '人际关系与团队技能'].map((text, i) => ({key: (['A', 'B', 'C', 'D'] as const)[i], text, isCorrect: i === 2}))}}
      renderOption={(option, i) => {
        const answer = revealed && i === 2, active = readingPhase && !revealed && focus === i;
        const contrast = i === 1 && m.has('contrast');
        const color = answer ? C.green : contrast ? C.blue : active ? C.gold : '#416086';
        return <div data-option={option.key} data-answer={answer} data-reading-focus={active} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '15px 24px', borderRadius: 14,
          background: answer || active || contrast ? `${color}25` : 'rgba(6,14,31,.78)', border: `2px solid ${color}`, boxShadow: active ? `inset 5px 0 0 ${C.gold}` : undefined}}>
          <span style={{display: 'flex', width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center', background: answer || active ? color : `${C.cyan}30`, color: answer || active ? '#04131A' : C.text, fontSize: 30, fontWeight: 800}}>{option.key}</span>
          <span style={{fontSize: 31, flex: 1}}>{option.text}</span>
          {answer && <span style={{fontSize: 23, color: C.green}}>✓ 本题答案</span>}
        </div>;
      }}/>
    <Canvas>
      <g opacity={1 - m.p('evidence', 450)}>
        <g opacity={m.p('eyePeople', 300)}><Txt x={180} y={650} size={34} color={C.gold}>联系对象：人们 ↔ 知识</Txt></g>
        <g opacity={m.p('eyeExplicit', 300)}><Txt x={180} y={750} size={34} color={C.gold}>知识内容：简单、明确的显性知识</Txt></g>
      </g>
      <g opacity={m.p('evidence', 450)}>
        <Person x={250} y={650} label="查阅的成员"/>
        <Link d="M310 645H650" label="查找与使用" x={380} y={615} color={C.green}/>
        <Paper x={650} y={585} width={480} title="排查步骤记录" rows={['简单、明确的显性知识']} color={C.green}/>
        <Txt x={400} y={815} size={31} color={C.green}>C · 信息管理工具和技术</Txt>
      </g>
      <g opacity={m.p('contrast', 450)}>
        <Person x={1310} y={650} label="员工" color={C.gold}/><Person x={1700} y={650} label="员工"/>
        <Link d="M1360 640H1650" label="交流与合作" x={1380} y={610}/>
        <Txt x={1500} y={815} center size={30} color={C.blue}>B · 知识管理工具</Txt>
      </g>
      <g opacity={m.p('trap')}><Txt x={960} y={895} center size={29} color={C.gold}>过程名称“管理项目知识”不等于题目要选“知识管理工具”</Txt></g>
    </Canvas>
  </>;
};
