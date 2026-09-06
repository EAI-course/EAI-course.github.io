import {
  ArrowDown, ArrowRight, BookOpen, Bot, BrainCircuit, CalendarDays, Camera,
  CheckCircle2, ChevronRight, Cpu, GitBranch, GraduationCap, Hand, Map, Route,
  Sparkles, Target, Users,
} from 'lucide-react';

const modules = [
  { number: '01', title: '感知世界', subtitle: '从传感器到场景理解', description: '学习机器人如何通过视觉、触觉与本体感觉建立对环境和自身状态的可靠认识。', topics: ['多模态传感', '三维视觉', '状态估计'], icon: Camera },
  { number: '02', title: '理解与推理', subtitle: '从表征到世界模型', description: '理解空间、物体、动作与因果关系如何进入可计算的表征，并支持预测和推理。', topics: ['空间表征', '世界模型', '具身认知'], icon: BrainCircuit },
  { number: '03', title: '决策与学习', subtitle: '从目标到行动策略', description: '比较规划、模仿学习与强化学习，理解机器人怎样在不确定环境中选择下一步行动。', topics: ['运动规划', '模仿学习', '强化学习'], icon: Route },
  { number: '04', title: '构建智能体', subtitle: '从模型到真实机器人', description: '把感知、语言、决策和控制连成闭环，完成一个能够在真实环境中工作的系统。', topics: ['VLA 模型', '系统集成', 'Sim-to-Real'], icon: Bot },
];

const schedule = [
  ['01', '具身智能：从“会回答”到“会行动”', '导论'], ['02', '机器人系统、传感器与执行器', '基础'],
  ['03', '机器学习基础与表征学习', '基础'], ['04', '视觉感知与三维场景理解', '感知'],
  ['05', '触觉、本体感觉与多模态融合', '感知'], ['06', '定位、建图与空间智能', '感知'],
  ['07', '运动学、动力学与机器人控制', '行动'], ['08', '运动规划与操作策略', '行动'],
  ['09', '模仿学习：从示范中学习动作', '学习'], ['10', '强化学习：在交互中优化策略', '学习'],
  ['11', '世界模型与模型式决策', '推理'], ['12', '视觉—语言—动作模型（VLA）', '前沿'],
  ['13', '具身智能体：记忆、工具与任务规划', '前沿'], ['14', '仿真平台、数据与 Sim-to-Real', '实践'],
  ['15', '安全、评测与真实部署', '实践'], ['16', 'Demo Day：让系统在现场完成任务', '项目'],
];

const outcomes = [
  '解释具身智能系统的感知—推理—行动闭环', '为具体任务选择合适的学习与控制方法',
  '读懂并复现具身智能领域的代表性工作', '完成一个可演示、可评测的机器人项目',
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="具身智能引论首页"><span className="brand-mark"><Bot size={19} /></span><span>具身智能引论</span></a>
        <nav aria-label="主导航"><a href="#learn">课程内容</a><a href="#schedule">课程安排</a><a href="#project">课程项目</a><a href="#resources">学习资源</a></nav>
        <a className="github-link" href="https://github.com/EAI-course" target="_blank" rel="noreferrer"><GitBranch size={18} /><span>GitHub</span></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-media" aria-hidden="true"><img src="/embodied-ai-cover.png" alt="" /></div>
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow"><span /> AIB310002 · 2026 秋季</p>
          <h1>让智能拥有身体，<br /><em>在世界中学习。</em></h1>
          <p className="hero-summary">从感知、世界模型与决策，到视觉—语言—动作模型和真实机器人系统。这门课不只讨论模型能知道什么，更关注智能体如何观察、思考并完成行动。</p>
          <div className="hero-actions"><a className="button primary" href="#learn">查看学习路径 <ArrowDown size={17} /></a><a className="button ghost" href="#schedule">浏览 16 周课程 <ArrowRight size={17} /></a></div>
        </div>
        <div className="hero-facts">
          <div><CalendarDays size={18} /><span><b>16 周</b>系统课程</span></div><div><Users size={18} /><span><b>团队协作</b>课程项目</span></div><div><Target size={18} /><span><b>真实任务</b>现场演示</span></div>
        </div>
      </section>

      <section className="intro section-shell" id="learn">
        <div className="section-heading split-heading"><div><p className="kicker">学习主线</p><h2>一条完整的智能闭环</h2></div><p>课程以“机器人如何完成一个真实任务”为主线，把算法、系统与实践放进同一张地图。</p></div>
        <div className="module-grid">
          {modules.map((module) => { const Icon = module.icon; return (
            <article className="module-card" key={module.number}>
              <div className="module-top"><span>{module.number}</span><Icon size={24} /></div><p className="module-subtitle">{module.subtitle}</p><h3>{module.title}</h3><p className="module-description">{module.description}</p><ul>{module.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul>
            </article>
          ); })}
        </div>
      </section>

      <section className="question-band"><div className="section-shell question-inner">
        <p className="kicker light">贯穿课程的问题</p><h2>一个机器人怎样知道<br />自己该做什么，<em>并真正做到？</em></h2>
        <div className="loop" aria-label="具身智能闭环：感知、理解、决策、行动、反馈">
          {[[Camera, '感知'], [BrainCircuit, '理解'], [Map, '决策'], [Hand, '行动'], [Sparkles, '反馈']].map(([Icon, label], index) => { const LoopIcon = Icon as typeof Camera; return <div className="loop-step" key={label as string}><LoopIcon size={21} /><span>{label as string}</span>{index < 4 && <ChevronRight size={17} />}</div>; })}
        </div>
      </div></section>

      <section className="schedule section-shell" id="schedule">
        <div className="section-heading split-heading"><div><p className="kicker">课程安排</p><h2>16 周，从概念到系统</h2></div><p>前半程建立共同基础，后半程进入机器人学习与前沿模型；每个模块都服务于最终项目。</p></div>
        <div className="schedule-grid">{schedule.map(([week, title, tag]) => <article className="week-row" key={week}><span className="week-number">{week}</span><h3>{title}</h3><span className="week-tag">{tag}</span></article>)}</div>
        <p className="schedule-note">课程主题会根据领域进展与项目节奏微调；具体上课时间、地点和材料以教学平台通知为准。</p>
      </section>

      <section className="project" id="project"><div className="section-shell project-grid">
        <div className="project-copy"><p className="kicker light">课程项目</p><h2>做出一个能在现场<br />完成任务的智能体</h2><p>团队选择一个边界清楚的真实任务，完成问题定义、数据与仿真、模型训练、系统集成和现场评测。最终成绩看的是系统能否稳定工作，以及你能否解释它为什么成功或失败。</p>
          <div className="milestones"><div><span>01</span><p><b>问题定义</b>明确任务、环境与成功标准</p></div><div><span>02</span><p><b>原型验证</b>用最小系统验证关键假设</p></div><div><span>03</span><p><b>闭环集成</b>让感知、决策与行动真正连通</p></div><div><span>04</span><p><b>现场评测</b>用可复现的指标展示系统能力</p></div></div>
        </div>
        <div className="project-panel"><div className="panel-label"><Cpu size={18} /> 项目交付物</div><div className="deliverable"><span>01</span><div><b>系统演示</b><p>现场完成约定任务</p></div></div><div className="deliverable"><span>02</span><div><b>技术报告</b><p>说明设计、实验与限制</p></div></div><div className="deliverable"><span>03</span><div><b>开源仓库</b><p>保存代码、配置与复现说明</p></div></div><div className="demo-badge"><Sparkles size={18} /> DEMO DAY · 第 16 周</div></div>
      </div></section>

      <section className="outcomes section-shell"><div className="outcome-card"><div><p className="kicker">完成课程后</p><h2>你应该能够独立回答四个问题</h2></div><div className="outcome-list">{outcomes.map((outcome) => <p key={outcome}><CheckCircle2 size={20} />{outcome}</p>)}</div></div></section>

      <section className="resources section-shell" id="resources"><div className="section-heading"><p className="kicker">学习入口</p><h2>从这里开始</h2></div><div className="resource-grid">
        <a href="#schedule"><CalendarDays /><span><b>课程日历</b><small>查看每周主题与进度</small></span><ArrowRight /></a><a href="#project"><GraduationCap /><span><b>项目指南</b><small>了解里程碑与交付物</small></span><ArrowRight /></a><a href="https://github.com/EAI-course" target="_blank" rel="noreferrer"><GitBranch /><span><b>课程代码</b><small>访问组织仓库与示例</small></span><ArrowRight /></a><a href="https://memx.life/#/ei" target="_blank" rel="noreferrer"><BookOpen /><span><b>历史资料</b><small>查阅往年课件与参考文献</small></span><ArrowRight /></a>
      </div></section>

      <footer><div className="section-shell footer-inner"><div className="brand"><span className="brand-mark"><Bot size={19} /></span><span>具身智能引论</span></div><p>2026 秋季 · 复旦大学</p><a href="#top">返回顶部 ↑</a></div></footer>
    </main>
  );
}
