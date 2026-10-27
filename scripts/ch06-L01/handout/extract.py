from pathlib import Path
import json,subprocess
root=Path(__file__).resolve().parents[3]
base=root/'deliverables/ch06-L01/handout-v1.0'
(base/'images').mkdir(parents=True,exist_ok=True)
assembly=json.loads((root/'workspaces/ch06-L01-full/assembly.json').read_text())
segments={s['key']:s for s in assembly['segments']}
items=[]
def add(key,scene,title,kind='知识图解',local=None,frame=None,crop=None,chapter=None):
 if frame is None:
  if local is None:
   audio=json.loads((root/f'workspaces/ch06-L01-{key}/audio-timeline.json').read_text())
   s=next(s for s in audio['scenes'] if s['sceneId']==scene)
   local=s['endMs']/1000-.35
  frame=segments[key]['fromFrame']+int(local*30)
 sec=frame/30
 items.append(dict(id=f'{len(items)+1:02}-{key}-{scene}',title=title,kind=kind,frame=frame,time=f'{int(sec)//60:02}:{int(sec)%60:02}',crop=crop or [1760,860,80,48],note='我的选择：________    判断依据：' if kind=='真题练习' else '错因与复习笔记' if kind=='真题解析' else '学习笔记',chapter=chapter))
add('opening','OP-stats','第六章考情概览',chapter='学习导入与 PMBOK 演进')
add('opening','OP-editions','PMBOK 的四个关键版本')
add('opening','OP-value','第七版：系统视角与价值交付')
add('preview','S01','项目的定义','核心概念',chapter='项目定义与特征')
add('preview','S02','项目驱动组织状态转换')
add('traits','TR-unique','独特性：相同元素不等于相同项目','概念辨析')
add('traits','TR-traps','临时性：两个易错点','概念辨析',frame=7710)
add('traits','TR-results','项目结束，成果仍可延续')
add('traits','TR-ending','项目的结束条件','概念归纳',frame=8665)
add('quiz','question','真题①：项目的特征与结束条件','真题练习',frame=9090)
add('quiz','answer','真题①解析：临时性与周期性','真题解析',frame=11295)
add('success','SC-strategy','项目管理的战略价值',chapter='战略价值与成功标准')
add('success','SC-failure','交付合格，业务仍可能失败','概念辨析')
add('success','SC-dimensions','项目成功的两个维度','概念归纳')
add('success','question','真题②：项目成功的标准','真题练习',local=121.8)
add('success','answer','真题②解析：兼顾战略与业务成果','真题解析',local=187.8)
add('relations','R01','组织级项目管理',frame=17795,chapter='项目组合、项目集、项目与运营')
add('relations','R03','项目组合、项目集、项目和运营',frame=18935)
add('relations','R04','项目组合的三个考查要点','概念归纳')
add('relations','R06','项目集：协调依赖，获得整体收益')
add('relations','R07','项目：范围渐进明晰','概念辨析')
add('relations','R08','项目与运营的交集')
add('quiz69','question','真题③：组织战略与项目管理','真题练习',local=12.9)
add('quiz69','Q69-summary','真题③解析：共同支撑组织战略','真题解析')
add('environment','E-boundary','OPA 与 EEF 的区分线索','概念辨析',chapter='运行环境与组织系统')
add('environment','E-external','OPA、内部 EEF 与外部 EEF 对照','分类对照')
add('systems','S-structure','组织结构与项目经理职权')
add('systems','S-pmo','三类 PMO 的控制程度','分类对照')
add('systems','S-lifecycle','产品生命周期与项目活动')
add('envquiz','left-question','真题④：哪项不属于组织过程资产？','真题练习',local=29.9,crop=[864,704,84,190])
add('envquiz','left-answer','真题④解析：物理分布属于内部 EEF','真题解析',local=54.8,crop=[864,704,84,190])
add('envquiz','right-question','真题⑤：哪项属于内部事业环境因素？','真题练习',local=69.5,crop=[864,704,972,190])
add('envquiz','right-answer','真题⑤解析：员工能力属于内部 EEF','真题解析',local=89.6,crop=[864,704,972,190])
add('closing','CL-recap','本课回顾：串起管理主线','学习回顾',chapter='本课回顾')
(root/'docs/lessons/ch06/handout/v1.0/selection.json').write_text(json.dumps(items,ensure_ascii=False,indent=2))
for i in items:
 target=base/'images'/f"{i['id']}.png"
 if target.exists():continue
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-n','-hwaccel','cuda','-ss',str(i['frame']/30),'-i',str(root/'deliverables/ch06-L01/ch06-L01-silent-clean.mp4'),'-frames:v','1','-vf','crop='+':'.join(map(str,i['crop'])),'-update','1',str(target)],check=True)
 print(i['id'],i['time'],flush=True)
print('总页数',len(items))
