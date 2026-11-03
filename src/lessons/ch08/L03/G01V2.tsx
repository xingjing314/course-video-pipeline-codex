import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {AudioTimeline} from '../../../../contracts/audio-timeline.schema';
import {TechNetwork} from '../../../visual/backgrounds/tech-network/TechNetwork';
import {techNetworkSchema} from '../../../visual/backgrounds/tech-network/schema';
import {HeaderBreadcrumb} from '../../../visual/shell/HeaderBreadcrumb';
import {CaptionsOverlay} from '../../../visual/shell/CaptionsOverlay';
import {SceneShell} from '../../../visual/templates/shared';
import {ExamQuizCard} from '../../../visual/templates/ExamQuizCard';
import {BASE_COLORS, resolveTone, rgba} from '../../../visual/tokens/colorCard';
import type {Ch08L03QuizPause} from './G01';
import {g01Motion, resolveG01Cues, type Motion} from './g01-v2-timing';
import {C, Canvas, Link, Paper, Person, Platform, Tasks, Ticket, Txt} from './g01-v2-objects';

const bg = techNetworkSchema.parse({type: 'tech-network', ganttEnabled: false, linkOpacity: .035, nodeOpacity: .06, highlightCoreOpacity: .1, highlightGlowOpacity: .06});
const titles = ['从计划走进项目现场', '让计划成为有人协作的工作', '批准之后，工作怎样落实', '执行依据与变更的来路、去向', '2024 年 5 月 · 第 2 批次 · 第 20 题'];

const ExecutionWorld: React.FC<{m: Motion; second: boolean}> = ({m, second}) => {
  const zoom = second ? m.p('interface', 1000) : 0;
  const transfer = m.p('execute', 1500);
  const resource = m.p('resources', 1100);
  return <Canvas>
    <g opacity={1 - zoom}>
      <g opacity={m.p('charter')}>
        <Paper x={155} y={185} title="项目章程" rows={[]} width={335}/>
        <Link d="M490 236H742V360" label="授权" x={560} y={222} progress={m.p('charter', 1000)} color={C.blue}/>
      </g>
      <g opacity={m.p('plan')}><Paper x={155} y={355} title="项目管理计划" rows={['平台建设', '应用开发', '应用测试']} width={360} active={second ? 1 : -1}/></g>
      <Person x={745} y={420} label="项目经理" color={C.gold}/>
      <Person x={665} y={660} label="团队"/><Person x={800} y={660}/>
      <Link d="M745 512V574" color={C.gold} progress={second ? 1 : m.p('organize')}/>
      <Link d="M520 460H1142" label={second ? '安排执行' : '工作安排'} x={850} y={438} progress={second ? 1 : m.p('platform', 1100)}/>
      <g opacity={second ? transfer : m.p('organize')}>
        <path d="M850 656Q1010 656 1145 610" fill="none" stroke={C.cyan} strokeWidth={3} strokeDasharray="9 8"/>
        <Txt x={920} y={665} size={28} color={C.cyan}>{second ? '人员 → 工作' : '工作怎样组织？'}</Txt>
      </g>
      {second && <g opacity={transfer}>
        <rect x={520 + transfer * 585} y={472} width={34} height={24} rx={4} fill={C.cyan}/>
        <g opacity={resource}>
          <path d="M935 752V700H1145" fill="none" stroke={C.blue} strokeWidth={3} markerEnd={`url(#arrow-${C.blue.slice(1)})`}/>
          <rect x={872} y={753} width={127} height={65} rx={6} fill={C.ink} stroke={C.blue} strokeWidth={2}/>
          <Txt x={935} y={797} center size={29}>资源</Txt>
          <Txt x={1030} y={749} size={26} color={C.blue}>配置并管理使用</Txt>
        </g>
      </g>}
      <g opacity={second ? m.p('approvedEntry') : m.p('changeQuestion')}>
        <Ticket x={155} y={716} label={second ? '变更工作' : '变更入口'} width={360}/>
        <Link d="M515 774H580V690" color={second ? C.green : C.gold} progress={1}/>
      </g>
      <g opacity={!second ? m.p('experience') : 0}>
        <path d="M834 603Q965 544 1036 620" fill="none" stroke={C.gold} strokeWidth={2}/>
        <Txt x={880} y={572} size={27} color={C.gold}>经验怎样留下？</Txt>
        <Txt x={644} y={832} size={30} color={C.gold}>人与经验</Txt>
        <g opacity={m.p('knowledgeName')}><Txt x={860} y={832} size={27} color={C.gold}>8.6 管理项目知识</Txt></g>
      </g>
    </g>
    <Platform x={1180} y={365 + zoom * 10} scale={1.15} apps={m.p('apps', 1100)} work={m.p('apps')}/>
    <Txt x={1410} y={230} center size={34}>地铁 AI 中台项目</Txt>
    <g opacity={m.p('workName') * (1 - zoom)}><Txt x={1395} y={812} center color={C.cyan} size={30}>8.5 指导与管理项目工作</Txt></g>
    {second && <>
      <g opacity={m.p('whole') * (1 - zoom)}>
        <path d="M157 881H1730" stroke={C.muted} strokeWidth={2}/><path d="M157 873V890M1730 873V890" stroke={C.muted} strokeWidth={2}/>
        <Txt x={960} y={872} center size={24} color={C.muted}>整个项目期间 · 持续组织和协调</Txt>
      </g>
      <g opacity={zoom}>
        <Paper x={155} y={180} title="项目管理计划" rows={[]} width={355}/>
        <Txt x={155} y={332} color={C.muted} size={29}>同一现场中的数据交接</Txt>
        <g opacity={m.p('needData')}>
          <rect x={205} y={391} width={320} height={218} rx={12} fill={C.bg} stroke={C.blue} strokeWidth={3}/>
          {[0, 1, 2].map((i) => <g key={i}><rect x={231} y={415 + i * 43} width={265} height={30} rx={4} fill={C.ink}/><circle cx={472} cy={430 + i * 43} r={5} fill={C.blue}/></g>)}
          <Txt x={365} y={580} center size={30}>设备数据来源</Txt>
          <Link d="M1180 601H552" progress={1 - m.p('technical')} color={C.gold} label="开发需要设备数据" x={705} y={579}/>
          <g opacity={m.p('technical')}>
            <Link d="M540 486H1152" progress={m.p('technical', 1300)} label="系统怎样对接" x={720} y={456}/>
            <g transform={`translate(${620 + m.p('technical', 1600) * 500} 510)`}><rect width={92} height={64} rx={6} fill={C.ink} stroke={C.cyan}/><Txt x={46} y={42} center size={26}>数据</Txt></g>
            <Txt x={800} y={376} center size={32} color={C.cyan}>技术接口</Txt>
          </g>
          <g opacity={m.p('organization')}>
            <Person x={365} y={800} label="提供部门" color={C.gold}/><Person x={1410} y={800} label="配合人员／开发组" color={C.gold}/>
            <path d="M365 750V624M1410 750V744" stroke={C.gold} strokeWidth={2}/>
            <Link d="M430 803H1335" color={C.gold} progress={m.p('organization', 1100)} label="谁提供 · 谁配合" x={770} y={780}/>
            <Txt x={880} y={880} center size={32} color={C.gold}>组织接口</Txt>
          </g>
        </g>
      </g>
    </>}
  </Canvas>;
};

const ApprovedWork: React.FC<{m: Motion}> = ({m}) => {
  const tasks = m.p('tasks', 1800);
  const data = m.p('data', 900);
  return <Canvas>
    <Txt x={155} y={218} size={29} color={C.muted}>同一项目 · 新增客流预测功能</Txt>
    <Ticket x={190 + tasks * 350} y={350} width={320} label="客流预测"/>
    <g opacity={m.p('decision')}>
      <rect x={150} y={330} width={330} height={210} rx={12} fill={C.bg} stroke={C.gold} strokeWidth={2}/>
      <Txt x={315} y={382} center size={27} color={C.gold}>8.8 实施整体变更控制</Txt>
      <Txt x={315} y={445} center size={34}>审查 · 决定</Txt>
      <Txt x={315} y={499} center size={25} color={C.muted}>批准结果的来源</Txt>
      <Link d="M480 412H525" color={C.green} progress={m.p('decision', 900)}/>
    </g>
    <Link d="M875 411H1015" color={C.green} progress={tasks} label="移交" x={913} y={387}/>
    <g opacity={tasks}>
      <Tasks x={1055} y={315} progress={tasks}/>
      <g opacity={m.p('implement')}><Txt x={1055} y={220} color={C.cyan} size={32}>8.5 指导与管理项目工作</Txt></g>
    </g>
    <g opacity={m.p('askProcess')}><path d="M885 483Q946 577 1020 506" fill="none" stroke={C.cyan} strokeWidth={4}/><Txt x={540} y={530} size={29} color={C.green}>决定已作出，接下来要落实</Txt></g>
    <g opacity={m.p('effects') * (1 - data)}>
      <Txt x={160} y={680} size={30}>回顾变更对工作和成果的影响</Txt>
      {(['correct', 'prevent', 'defect'] as const).map((cue, i) => <g key={cue} opacity={m.p(cue)}>
        <Ticket x={160 + i * 360} y={726} label={['纠正措施', '预防措施', '缺陷补救措施'][i]} width={310}/>
        <path d={`M${315 + i * 360} 714V699H1220V640`} fill="none" stroke={C.green} strokeWidth={2}/>
      </g>)}
    </g>
    <g opacity={data}>
      <Paper x={170} y={670} title="现场事实记录" rows={['工作绩效数据']} width={380}/>
      <Link d="M1280 655V690H560" progress={data} color={C.cyan} label="收集" x={870} y={677}/>
      <Link d="M550 793H1030" progress={m.p('analysis', 1200)} color={C.blue} label="交给相应控制过程" x={656} y={768}/>
      <g opacity={m.p('analysis')}><rect x={1050} y={742} width={660} height={112} rx={12} fill={C.bg} stroke={C.blue}/><Txt x={1380} y={788} center size={29}>十大知识领域的相应控制过程</Txt><Txt x={1380} y={832} center color={C.blue} size={28}>进一步分析</Txt></g>
    </g>
  </Canvas>;
};

const InputUses: React.FC<{m: Motion}> = ({m}) => {
  const docStage = m.has('gather') ? 4 : m.has('communication') ? 3 : m.has('risk') ? 2 : m.has('schedule') ? 1 : 0;
  const compact = m.p('inputApproved', 900);
  const assetStage = m.has('history') ? 4 : m.has('controlRules') ? 3 : m.has('performanceDb') ? 2 : m.has('defectsDb') ? 1 : 0;
  const assetRows = ['标准政策、流程和程序', '问题与缺陷管理程序及数据库', '绩效测量数据库', '变更和风险控制程序', '历史项目信息'];
  return <>
    <Platform x={1330} y={410} scale={.96}/>
    <Person x={1480} y={800} label="项目团队"/>
    <g opacity={1 - compact}>
      <g opacity={1 - m.p('docs')}>
        <Paper x={180} y={270} title="项目管理计划" rows={['范围等管理安排', '进度等管理安排', '其他适用组件']} width={510}/>
        <Link d="M710 453H1300" progress={m.p('inputPlan', 1200)} label="任何组件都可能用于执行" x={807} y={425}/>
        <Txt x={180} y={734} color={C.muted} size={30}>工作从计划中取得依据</Txt>
      </g>
      <g opacity={m.p('docs')}>
        <Txt x={160} y={222} size={32} color={C.blue}>项目文件</Txt>
        <g opacity={1 - m.p('schedule', 400)}>
          <Paper x={160} y={302} title="需求跟踪矩阵" width={390} rows={['需求', '对应的成果']}/>
          <Txt x={720} y={365} size={32}>需求</Txt><Txt x={1060} y={365} size={32}>成果</Txt>
          {['故障预警', '缺陷识别'].map((s, i) => <g key={s}><Txt x={665} y={470 + i * 125} size={30}>{s}</Txt><Link d={`M815 ${460 + i * 125}H1050`} label="对应" x={907} y={441 + i * 125}/><rect x={1080} y={425 + i * 125} width={170} height={65} rx={6} fill={C.ink} stroke={C.cyan}/><Txt x={1165} y={468 + i * 125} center size={29}>应用成果</Txt></g>)}
          <Link d="M550 434H630" color={C.blue}/><Txt x={160} y={763} size={30} color={C.muted}>确认需求与成果的对应关系</Txt>
        </g>
        <g opacity={m.p('schedule', 400) * (1 - m.p('risk', 400))}>
          <Paper x={160} y={290} title="项目进度计划" width={415} rows={['安排活动', '确定工作先后']}/>
          <Paper x={160} y={575} title="里程碑清单" width={415} rows={['关注重要节点']}/>
          <Txt x={680} y={285} size={32}>安排工作</Txt>
          <path d="M680 385H1230M680 385V710" stroke={C.muted} strokeWidth={2}/>
          {['平台', '开发', '测试'].map((s, i) => <g key={s}><Txt x={700} y={455 + i * 85} size={28}>{s}</Txt><rect x={800 + i * 110} y={425 + i * 85} width={130} height={36} rx={3} fill={`${C.cyan}44`} stroke={C.cyan}/></g>)}
          <path d="M1190 360l14 20-14 20-14-20Z" fill={C.gold}/><path d="M1190 401V710" stroke={C.gold} strokeDasharray="6 7"/>
          <Txt x={1090} y={759} size={27} color={C.gold}>重要节点</Txt>
        </g>
        <g opacity={m.p('risk', 400) * (1 - m.p('communication', 400))}>
          <Paper x={160} y={305} title="风险登记册" width={450} rows={['风险事项', '单项风险的信息']}/>
          <Paper x={710} y={305} title="风险报告" width={450} rows={['整体风险情况', '对项目的总体影响']}/>
          <Link d="M385 538V660H1340" label="了解风险，再组织工作" x={650} y={638} color={C.gold}/>
          <Link d="M935 538V660" color={C.gold}/>
          <Txt x={160} y={797} size={30} color={C.muted}>事项层面与整体情况，提供不同观察范围</Txt>
        </g>
        <g opacity={m.p('communication', 400) * (1 - m.p('gather', 400))}>
          <Paper x={160} y={292} title="项目沟通记录" width={470} rows={['已沟通的项目情况']}/>
          <g opacity={m.p('lessons')}><Paper x={160} y={505} title="经验教训登记册" width={470} rows={['已积累的经验']}/></g>
          <g opacity={m.p('log')}><Paper x={735} y={505} title="变更日志" width={470} rows={['变更及其状态']}/></g>
          <Link d="M630 368H1170V460H1300" color={C.blue}/>
          <Link d="M630 580H705" color={C.gold} progress={0}/>
          <Txt x={735} y={352} size={31} color={C.cyan}>查明情况 → 支持当前工作</Txt>
        </g>
        <g opacity={m.p('gather', 400)}>
          <Txt x={160} y={280} size={27} color={C.muted}>不同知识领域 → 汇入同一执行现场</Txt>
          {[
            ['范围', '需求跟踪矩阵'], ['进度', '项目进度计划、里程碑清单'],
            ['风险', '风险登记册、风险报告'], ['沟通', '项目沟通记录'], ['整合', '经验教训登记册、变更日志'],
          ].map(([area, docs], i) => <g key={area}><Txt x={175} y={370 + i * 93} size={28} color={C.blue}>{area}</Txt><path d={`M260 ${361 + i * 93}H315`} stroke={C.blue} strokeWidth={2}/><Txt x={340} y={370 + i * 93} size={30}>{docs}</Txt></g>)}
          <path d="M1100 330H1140V778H1100M1140 554H1290" fill="none" stroke={C.cyan} strokeWidth={3} markerEnd={`url(#arrow-${C.cyan.slice(1)})`}/>
        </g>
        {docStage > 0 && docStage < 4 && <Txt x={160} y={870} size={25} color={C.muted}>
          {docStage === 1 ? '需求 ↔ 成果的对应关系' : docStage === 2 ? '需求 ↔ 成果　｜　活动与里程碑' : '需求 ↔ 成果　｜　活动与里程碑　｜　单项与整体风险'}
        </Txt>}
      </g>
    </g>
    <g opacity={compact}>
      <g opacity={m.has('allInputs') ? 0 : 1}>
        <Txt x={160} y={222} color={C.muted} size={28}>已建立的依据：项目管理计划 · 项目文件</Txt>
        <g opacity={1 - m.p('environment')}><Ticket x={270} y={380} label="客流预测" width={360}/><Link d="M640 442H1290" color={C.green} label="批准的变更请求 → 落实" x={771} y={416}/></g>
        <g opacity={m.p('environment') * (1 - m.p('assets'))}>
          <path d="M195 760V325H1770V760" fill="none" stroke={C.gold} strokeWidth={3} strokeDasharray="12 7"/>
          <Txt x={270} y={300} color={C.gold} size={34}>事业环境因素 · 工作所处的条件</Txt>
          <Txt x={270} y={430} size={31}>组织结构、文化、管理实践和可持续性</Txt>
          <g opacity={m.p('infrastructure')}><Txt x={270} y={562} size={31}>基础设施</Txt><path d="M270 588H600V722H1270" stroke={C.gold} strokeWidth={2} fill="none"/></g>
          <g opacity={m.p('threshold')}><Txt x={270} y={670} size={31}>干系人的风险临界值</Txt></g>
          <Txt x={270} y={835} size={28} color={C.muted}>影响工作的开展，而不是待执行的任务清单</Txt>
        </g>
        <g opacity={m.p('assets')}>
          <Txt x={160} y={300} color={C.blue} size={34}>组织过程资产 · 可使用的规则与经验</Txt>
          <rect x={160} y={335} width={1040} height={134 + 82 * (m.p('defectsDb') + m.p('performanceDb') + m.p('controlRules') + m.p('history'))} rx={12} fill={C.bg} stroke={C.blue} strokeWidth={2}/>
          {assetRows.map((s, i) => <g key={s} opacity={i <= assetStage ? 1 : 0}>
            <rect x={180} y={359 + i * 82} width={990} height={64} rx={6} fill={i === assetStage ? `${C.blue}22` : 'transparent'}/>
            <path d={`M205 ${378 + i * 82}h24v27h-24Z`} fill="none" stroke={C.blue} strokeWidth={2}/>
            <Txt x={254} y={403 + i * 82} size={30}>{s}</Txt>
          </g>)}
          <Link d="M1210 568H1300" color={C.blue}/>
        </g>
      </g>
      <g opacity={m.p('allInputs')}>
        <Txt x={160} y={240} size={34}>执行现场的五类依据</Txt>
        {[
          ['项目管理计划', '计划安排'], ['项目文件', '具体工作依据'], ['批准的变更请求', '需要落实的决定'],
          ['事业环境因素', '工作所处条件'], ['组织过程资产', '可用规则与经验'],
        ].map(([name, use], i) => <g key={name}><Txt x={175} y={348 + i * 100} size={31} color={[C.blue, C.blue, C.green, C.gold, C.blue][i]}>{name}</Txt><Txt x={660} y={348 + i * 100} size={29}>{use}</Txt><path d={`M1030 ${338 + i * 100}H1190V600H1300`} fill="none" stroke={C.muted} strokeWidth={2}/></g>)}
      </g>
    </g>
  </>;
};

const ChangeFlow: React.FC<{m: Motion}> = ({m}) => {
  const authority = m.p('authority', 800);
  const example = m.p('example', 700);
  const approved = m.p('approval', 1200);
  return <>
    <g opacity={1 - authority}>
      <Txt x={155} y={225} size={27} color={C.muted}>计划 · 项目文件 · 环境条件 · 组织资产</Txt>
      <rect x={1180} y={287} width={555} height={392} rx={20} fill={C.bg} stroke={C.cyan} strokeWidth={2}/>
      <Person x={1330} y={400} label="项目经理" color={C.gold}/><Person x={1575} y={400} label="项目团队"/>
      <Txt x={1457} y={556} center size={31}>依据输入组织工作</Txt>
      <Txt x={1457} y={610} center size={30} color={C.cyan}>8.5 指导与管理项目工作</Txt>
      <rect x={155} y={332} width={450} height={195} rx={12} fill={C.bg} stroke={C.gold} strokeWidth={2}/>
      <Txt x={380} y={402} center size={29} color={C.gold}>8.8 实施整体变更控制</Txt><Txt x={380} y={472} center size={33}>审查变更 · 作出决定</Txt>
      <Ticket x={740} y={330} label="需落实的变更" width={330}/>
      <Link d="M615 390H725" color={C.green}/><Link d="M1080 390H1165" color={C.green}/>
      <g opacity={m.p('newRequest')}>
        <Txt x={1190} y={743} size={30} color={C.gold}>执行中发现仍需调整</Txt>
        <Ticket x={740 - m.p('sendRequest', 1300) * 80} y={680} approved={false} label="新的调整需要" width={330}/>
        <Link d="M1210 776H1080" color={C.gold} progress={m.p('newRequest', 1100)}/>
        <Link d="M645 741H380V542" color={C.gold} progress={m.p('sendRequest', 1300)} label="提出新请求" x={405} y={715}/>
      </g>
      <g opacity={m.p('origin')}><Txt x={680} y={270} size={30} color={C.green}>批准结果的来路</Txt></g>
    </g>
    <g opacity={authority}>
      <g opacity={1 - example}>
        <Txt x={155} y={195} size={30} color={C.gold}>8.8 实施整体变更控制 · 按规定权限审查</Txt>
        <Paper x={155} y={345} title="变更请求" width={330} rows={['待审查的材料']}/>
        <path d="M495 442H570M570 274V560M570 274H725M570 560H725" fill="none" stroke={C.gold} strokeWidth={2}/>
        <g opacity={m.p('pm')}>
          <Person x={930} y={259} label="项目经理审查批准" color={C.gold}/>
          <Txt x={615} y={244} color={C.gold} size={25}>权限内</Txt>
        </g>
        <g opacity={m.p('ccb')}><Txt x={605} y={530} color={C.gold} size={25}>必要时</Txt></g>
      </g>
      <g opacity={m.p('ccb')}>
        <rect x={740} y={403} width={450} height={255} rx={16} fill={C.bg} stroke={C.gold} strokeWidth={2}/>
        <Txt x={965} y={451} center size={35} color={C.gold}>CCB · 审查决策</Txt>
        <g opacity={m.p('members')}><Person x={850} y={524} scale={.72} label="用户" color={C.gold}/><Person x={1070} y={524} scale={.72} label="组织管理层" color={C.gold}/></g>
        <g opacity={m.p('owner')}><Txt x={965} y={629} center size={27}>项目所有者的权益代表</Txt></g>
      </g>
      <g opacity={m.p('pm') * (1 - example)}>
        <path d="M1160 275H1260V385M1205 533H1260V385H1320" fill="none" stroke={C.green} strokeWidth={3}/>
        <Ticket x={1330} y={328} label="批准的变更请求" width={370}/>
      </g>
      <g opacity={m.p('agency') * (1 - example)}>
        <Person x={1510} y={613} label="项目团队"/>
        <Txt x={1510} y={763} center size={30} color={C.cyan}>具体实施留在团队</Txt>
        <Link d="M1510 460V544" color={C.green}/>
      </g>
      <g opacity={m.p('baseline') * (1 - example)}>
        <Txt x={155} y={720} size={31}>评审已有方案</Txt><Link d="M440 710H720V622" color={C.gold}/>
        <Txt x={775} y={745} size={29} color={C.gold}>决定基准是否需要变更</Txt>
        <g opacity={m.p('noProposal')}><Txt x={155} y={800} size={29} color={C.muted}>方案在审查区外准备</Txt></g>
      </g>
      <g opacity={example}>
        <Txt x={155} y={220} size={32}>客流预测功能 · 提交 CCB 审查时</Txt>
        <Paper x={155} y={324} title="待审材料" width={425} rows={m.has('prepared') ? ['变更方案', '影响分析'] : ['客流预测功能']}/>
        <Link d="M595 485H725" color={C.gold} progress={m.p('review', 800)} label="评审" x={624} y={461}/>
        <g opacity={approved}>
          <Ticket x={1230 + approved * 30} y={270} width={420} label="客流预测"/>
          <Link d="M1202 485H1240V330" color={C.green} progress={approved}/>
          <g opacity={m.p('implementSchedule')}><Tasks x={1285} y={500} scale={.72} progress={m.p('implementSchedule', 1700)} title="项目进度计划 → 团队"/></g>
        </g>
        <g opacity={m.p('controlled')}>
          <Link d="M1690 330H1775V856H1110" color={C.blue} label="可能影响" x={1175} y={842}/>
          <Paper x={605} y={726} title="正式受控的计划组件／项目文件" width={490} rows={[]}/>
          <Txt x={625} y={867} size={27} color={C.blue}>按需要修订，不是全部必然修改</Txt>
        </g>
      </g>
    </g>
  </>;
};

const InputsAndChange: React.FC<{m: Motion}> = ({m}) => <Canvas>
  <g opacity={1 - m.p('flow', 700)}><InputUses m={m}/></g>
  <g opacity={m.p('flow', 700)}><ChangeFlow m={m}/></g>
</Canvas>;

const options = [
  '批准的变更请求可能导致修改正式受控的项目文件',
  'CCB 通过对变更方案的审查决策，对变更进行管理实施和控制',
  '组织的结构文化管理实践和可持续性是影响指导与管理项目工作过程的因素',
  '项目管理计划的任何组件都可用作指导与管理项目工作的输入',
];

const Quiz: React.FC<{m: Motion; pause: Ch08L03QuizPause; fps: number}> = ({m, pause, fps}) => {
  const reveal = m.has('answer');
  const reading = m.has('readD') ? 3 : m.has('readC') ? 2 : m.has('readB') ? 1 : m.has('readA') ? 0 : -1;
  const readingPhase = m.ms < pause.startMs;
  const judged = [m.has('explainA'), reveal, m.has('explainC'), m.has('explainD')];
  return <>
    <ExamQuizCard withShell={false} statusText={false} left={120} top={180} width={1680} bodySize={34} optionSize={28}
      timing={{stemEndFrame: Math.ceil(pause.startMs * fps / 1000), revealFrame: Math.ceil(m.at('answer') * fps / 1000)}}
      payload={{title: titles[4], examMeta: '2024年5月 · 第2批次 · 第20题', stem: '关于项目整合管理的描述不正确的是（　）。', stemHighlights: [], polarity: 'negative',
        options: options.map((text, i) => ({key: (['A', 'B', 'C', 'D'] as const)[i], text, isCorrect: i !== 1}))}}
      renderOption={(option, i) => {
        const focused = !reveal && readingPhase && reading === i;
        const tone = resolveTone(judged[i] ? (i === 1 ? 'red' : 'green') : focused ? 'gold' : 'blue');
        return <div data-option={option.key} data-judged={judged[i]} data-reading-focus={focused} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18,
          padding: '14px 24px', borderRadius: 14, boxSizing: 'border-box', minHeight: 74,
          background: judged[i] || focused ? rgba(tone.rgb, .2) : 'rgba(6, 14, 31, 0.78)',
          border: `2px solid ${rgba(tone.rgb, judged[i] || focused ? .95 : .42)}`,
          boxShadow: focused ? `inset 5px 0 0 ${tone.hex}, inset 0 0 0 1px ${tone.hex}` : undefined}}>
          <div style={{width: 42, height: 42, borderRadius: 10, background: focused ? tone.hex : judged[i] ? rgba(tone.rgb, .25) : rgba(resolveTone('cyan').rgb, .2),
            color: focused ? '#04131A' : BASE_COLORS.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, flexShrink: 0}}>{option.key}</div>
          <div style={{flex: 1, fontSize: 28, color: BASE_COLORS.text, lineHeight: 1.45, fontWeight: judged[i] ? 700 : 500}}>
            {i === 1 && m.has('mistake') ? <>CCB 通过对变更方案的审查决策，对变更进行<span style={{color: '#FCA5A5', textDecoration: 'underline', textDecorationThickness: 3, textUnderlineOffset: 6}}>管理实施</span>和控制</> : option.text}
          </div>
          {judged[i] && <span style={{padding: '4px 12px', borderRadius: 999, border: `1px solid ${rgba(tone.rgb, .6)}`, color: tone.hex, fontSize: 19, fontWeight: 700, flexShrink: 0}}>{i === 1 ? '本题答案' : '✓ 表述正确'}</span>}
        </div>;
      }}/>
    <Canvas>
      <g opacity={m.p('explainCcb', 350) * (1 - m.p('explainA', 300))}>
        <rect x={240} y={737} width={400} height={119} rx={12} fill={C.bg} stroke={C.gold}/>
        <Txt x={440} y={786} center size={31} color={C.gold}>CCB</Txt><Txt x={440} y={830} center size={29}>审查决策</Txt>
        <Link d="M657 794H1215" color={C.green} progress={m.p('explainTeam', 750)} label="批准的变更 → 移交" x={773} y={770}/>
        <g opacity={m.p('explainTeam', 350)}><rect x={1235} y={737} width={400} height={119} rx={12} fill={C.bg} stroke={C.cyan}/><Txt x={1435} y={786} center size={31} color={C.cyan}>项目团队</Txt><Txt x={1435} y={830} center size={29}>具体实施</Txt></g>
      </g>
      {m.has('explainA') && <>
        <Txt x={220} y={772} size={31} color={C.green}>{m.has('explainD') ? 'D · 项目管理计划' : m.has('explainC') ? 'C · 事业环境因素' : 'A · 批准的变更'}</Txt>
        <Link d="M650 763H1090" color={m.has('explainC') && !m.has('explainD') ? C.gold : C.blue} label={m.has('explainD') ? '作为输入' : m.has('explainC') ? '影响工作' : '可能导致修订'} x={770} y={741}/>
        <Txt x={1130} y={772} size={31}>{m.has('explainD') || m.has('explainC') ? '指导与管理项目工作' : '正式受控的项目文件'}</Txt>
        <g opacity={m.p('final', 200)}><Txt x={960} y={871} center size={29} color={C.muted}>A、C、D 表述正确；B 把具体实施归给了 CCB</Txt></g>
      </>}
    </Canvas>
  </>;
};

export const Ch08L03G01V2: React.FC<{timeline: AudioTimeline; pause: Ch08L03QuizPause; includeAudio?: boolean; includeCaptions?: boolean}> = ({timeline, pause, includeAudio = true, includeCaptions = true}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ms = frame * 1000 / fps;
  const cues = useMemo(() => resolveG01Cues(timeline), [timeline]);
  const m = g01Motion(ms, cues);
  const index = Math.min(4, timeline.scenes.findIndex((s) => ms < s.endMs) === -1 ? 4 : timeline.scenes.findIndex((s) => ms < s.endMs));
  return <AbsoluteFill style={{background: '#091624', color: C.text, fontFamily: 'Noto Sans CJK SC, sans-serif'}}>
    <TechNetwork {...bg}/>
    {includeAudio && <Audio src={staticFile('audio/ch08-L03-g01/narration-s05-r1.wav')}/>}
    <HeaderBreadcrumb lessonId="ch08-L03" lessonTitle="第 8 章 项目整合管理 · L03" sceneId={`S0${index + 1}`} sceneOrder={index + 1} totalScenes={22} segmentTitle="指导与管理项目工作"/>
    <SceneShell title={titles[index]}>
      {index < 2 ? <ExecutionWorld m={m} second={index === 1}/> : index === 2 ? <ApprovedWork m={m}/> : index === 3 ? <InputsAndChange m={m}/> : <Quiz m={m} pause={pause} fps={fps}/>}
    </SceneShell>
    {includeCaptions && <CaptionsOverlay captions={timeline.captions}/>}
  </AbsoluteFill>;
};
