'use client';

import { useEffect, useState } from 'react';
import {
  ArrowDown, ArrowRight, BookOpen, Bot, BrainCircuit, CalendarDays, Camera,
  CheckCircle2, ChevronRight, Cpu, GitBranch, GraduationCap, Hand, Languages,
  Map, Route, Sparkles, Target, Users,
} from 'lucide-react';

const icons = [Camera, BrainCircuit, Route, Bot];

const content = {
  zh: {
    pageTitle: '具身智能引论｜2026 秋季', brand: '具身智能引论', language: 'EN', languageLabel: 'Switch to English',
    nav: ['课程内容', '课程安排', '课程项目', '学习资源'], term: 'AIB310002 · 2026 秋季',
    hero: ['让智能拥有身体，', '在世界中学习。'],
    summary: '从感知、世界模型与决策，到视觉—语言—动作模型和真实机器人系统。这门课不只讨论模型能知道什么，更关注智能体如何观察、思考并完成行动。',
    actions: ['查看学习路径', '浏览 16 周课程'], facts: [['16 周', '系统课程'], ['团队协作', '课程项目'], ['真实任务', '现场演示']],
    learnKicker: '学习主线', learnTitle: '一条完整的智能闭环', learnIntro: '课程以“机器人如何完成一个真实任务”为主线，把算法、系统与实践放进同一张地图。',
    modules: [
      ['感知世界', '从传感器到场景理解', '学习机器人如何通过视觉、触觉与本体感觉建立对环境和自身状态的可靠认识。', ['多模态传感', '三维视觉', '状态估计']],
      ['理解与推理', '从表征到世界模型', '理解空间、物体、动作与因果关系如何进入可计算的表征，并支持预测和推理。', ['空间表征', '世界模型', '具身认知']],
      ['决策与学习', '从目标到行动策略', '比较规划、模仿学习与强化学习，理解机器人怎样在不确定环境中选择下一步行动。', ['运动规划', '模仿学习', '强化学习']],
      ['构建智能体', '从模型到真实机器人', '把感知、语言、决策和控制连成闭环，完成一个能够在真实环境中工作的系统。', ['VLA 模型', '系统集成', 'Sim-to-Real']],
    ],
    questionKicker: '贯穿课程的问题', question: ['一个机器人怎样知道', '自己该做什么，并真正做到？'], loop: ['感知', '理解', '决策', '行动', '反馈'],
    scheduleKicker: '课程安排', scheduleTitle: '16 周，从概念到系统', scheduleIntro: '前半程建立共同基础，后半程进入机器人学习与前沿模型；每个模块都服务于最终项目。',
    schedule: [
      ['具身智能：从“会回答”到“会行动”', '导论'], ['机器人系统、传感器与执行器', '基础'], ['机器学习基础与表征学习', '基础'], ['视觉感知与三维场景理解', '感知'],
      ['触觉、本体感觉与多模态融合', '感知'], ['定位、建图与空间智能', '感知'], ['运动学、动力学与机器人控制', '行动'], ['运动规划与操作策略', '行动'],
      ['模仿学习：从示范中学习动作', '学习'], ['强化学习：在交互中优化策略', '学习'], ['世界模型与模型式决策', '推理'], ['视觉—语言—动作模型（VLA）', '前沿'],
      ['具身智能体：记忆、工具与任务规划', '前沿'], ['仿真平台、数据与 Sim-to-Real', '实践'], ['安全、评测与真实部署', '实践'], ['Demo Day：让系统在现场完成任务', '项目'],
    ],
    scheduleNote: '课程主题会根据领域进展与项目节奏微调；具体上课时间、地点和材料以教学平台通知为准。',
    projectKicker: '课程项目', projectTitle: ['做出一个能在现场', '完成任务的智能体'],
    projectIntro: '团队选择一个边界清楚的真实任务，完成问题定义、数据与仿真、模型训练、系统集成和现场评测。最终成绩看的是系统能否稳定工作，以及你能否解释它为什么成功或失败。',
    milestones: [['问题定义', '明确任务、环境与成功标准'], ['原型验证', '用最小系统验证关键假设'], ['闭环集成', '让感知、决策与行动真正连通'], ['现场评测', '用可复现的指标展示系统能力']],
    deliverablesTitle: '项目交付物', deliverables: [['系统演示', '现场完成约定任务'], ['技术报告', '说明设计、实验与限制'], ['开源仓库', '保存代码、配置与复现说明']], demo: 'DEMO DAY · 第 16 周',
    outcomeKicker: '完成课程后', outcomeTitle: '你应该能够独立回答四个问题', outcomes: ['解释具身智能系统的感知—推理—行动闭环', '为具体任务选择合适的学习与控制方法', '读懂并复现具身智能领域的代表性工作', '完成一个可演示、可评测的机器人项目'],
    resourcesKicker: '学习入口', resourcesTitle: '从这里开始', resources: [['课程日历', '查看每周主题与进度'], ['项目指南', '了解里程碑与交付物'], ['课程代码', '访问组织仓库与示例'], ['历史资料', '查阅往年课件与参考文献']],
    footer: '2026 秋季 · 复旦大学', back: '返回顶部 ↑', github: 'GitHub',
  },
  en: {
    pageTitle: 'Introduction to Embodied Intelligence | Fall 2026', brand: 'Embodied Intelligence', language: '中文', languageLabel: '切换至中文',
    nav: ['Curriculum', 'Schedule', 'Course Project', 'Resources'], term: 'AIB310002 · FALL 2026',
    hero: ['Give intelligence a body.', 'Learn through the world.'],
    summary: 'From perception, world models, and decision-making to vision–language–action models and real robotic systems. This course asks not only what a model can know, but how an agent can observe, reason, and act.',
    actions: ['Explore the learning path', 'View the 16-week schedule'], facts: [['16 weeks', 'Integrated curriculum'], ['Team-based', 'Course project'], ['Real tasks', 'Live demonstration']],
    learnKicker: 'LEARNING PATH', learnTitle: 'A complete intelligence loop', learnIntro: 'The course follows one central question—how can a robot complete a real task?—and places algorithms, systems, and practice on one shared map.',
    modules: [
      ['Perceive', 'From sensors to scene understanding', 'Learn how robots use vision, touch, and proprioception to form reliable estimates of the world and their own state.', ['Multimodal sensing', '3D vision', 'State estimation']],
      ['Understand', 'From representations to world models', 'Study how space, objects, actions, and causal relations become computational representations for prediction and reasoning.', ['Spatial representation', 'World models', 'Embodied cognition']],
      ['Decide & Learn', 'From goals to action policies', 'Compare planning, imitation learning, and reinforcement learning for choosing actions under uncertainty.', ['Motion planning', 'Imitation learning', 'Reinforcement learning']],
      ['Build an Agent', 'From models to real robots', 'Connect perception, language, decision-making, and control into a closed-loop system that works in the physical world.', ['VLA models', 'System integration', 'Sim-to-Real']],
    ],
    questionKicker: 'THE QUESTION THROUGHOUT THE COURSE', question: ['How does a robot know', 'what to do—and actually do it?'], loop: ['Perceive', 'Understand', 'Decide', 'Act', 'Learn'],
    scheduleKicker: 'COURSE SCHEDULE', scheduleTitle: '16 weeks, from ideas to systems', scheduleIntro: 'The first half builds shared foundations. The second moves into robot learning and frontier models. Every module supports the final project.',
    schedule: [
      ['Embodied intelligence: from answering to acting', 'Overview'], ['Robot systems, sensors, and actuators', 'Foundations'], ['Machine learning and representation learning', 'Foundations'], ['Visual perception and 3D scene understanding', 'Perception'],
      ['Touch, proprioception, and multimodal fusion', 'Perception'], ['Localization, mapping, and spatial intelligence', 'Perception'], ['Kinematics, dynamics, and robot control', 'Action'], ['Motion planning and manipulation policies', 'Action'],
      ['Imitation learning: learning from demonstrations', 'Learning'], ['Reinforcement learning: improving through interaction', 'Learning'], ['World models and model-based decision-making', 'Reasoning'], ['Vision–language–action models (VLA)', 'Frontier'],
      ['Embodied agents: memory, tools, and task planning', 'Frontier'], ['Simulation, data, and Sim-to-Real', 'Practice'], ['Safety, evaluation, and real-world deployment', 'Practice'], ['Demo Day: completing a task live', 'Project'],
    ],
    scheduleNote: 'Topics may be adjusted to reflect progress in the field and the project timeline. Consult the teaching platform for confirmed times, locations, and materials.',
    projectKicker: 'COURSE PROJECT', projectTitle: ['Build an agent that can', 'complete a task live'],
    projectIntro: 'Teams choose a well-scoped real task and work through problem definition, data and simulation, model training, system integration, and live evaluation. Success means a system that works reliably—and an explanation of why it succeeds or fails.',
    milestones: [['Define', 'Specify the task, environment, and success criteria'], ['Prototype', 'Test the key assumption with a minimal system'], ['Integrate', 'Connect perception, decision-making, and action'], ['Evaluate', 'Demonstrate capability with reproducible metrics']],
    deliverablesTitle: 'PROJECT DELIVERABLES', deliverables: [['System demo', 'Complete the agreed task live'], ['Technical report', 'Explain the design, experiments, and limits'], ['Open repository', 'Preserve code, configuration, and reproduction steps']], demo: 'DEMO DAY · WEEK 16',
    outcomeKicker: 'BY THE END', outcomeTitle: 'You should be able to do four things independently', outcomes: ['Explain the perception–reasoning–action loop of an embodied system', 'Choose suitable learning and control methods for a concrete task', 'Read and reproduce representative work in embodied intelligence', 'Build a robot project that can be demonstrated and evaluated'],
    resourcesKicker: 'START HERE', resourcesTitle: 'Course resources', resources: [['Course calendar', 'Review weekly topics and progress'], ['Project guide', 'Understand milestones and deliverables'], ['Course code', 'Visit the organization repositories and examples'], ['Past materials', 'Browse earlier slides and references']],
    footer: 'Fall 2026 · Fudan University', back: 'Back to top ↑', github: 'GitHub',
  },
} as const;

export default function Home() {
  const [locale, setLocale] = useState<'zh' | 'en'>('zh');
  const t = content[locale];
  const factIcons = [CalendarDays, Users, Target];
  const loopIcons = [Camera, BrainCircuit, Map, Hand, Sparkles];
  const resourceIcons = [CalendarDays, GraduationCap, GitBranch, BookOpen];
  const resourceLinks = ['#schedule', '#project', 'https://github.com/EAI-course', 'https://memx.life/#/ei'];

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
    document.title = t.pageTitle;
  }, [locale, t.pageTitle]);

  return (
    <main data-locale={locale}>
      <header className="site-header">
        <a className="brand" href="#top" aria-label={t.brand}><span className="brand-mark"><Bot size={19} /></span><span>{t.brand}</span></a>
        <nav aria-label={locale === 'zh' ? '主导航' : 'Main navigation'}>
          <a href="#learn">{t.nav[0]}</a><a href="#schedule">{t.nav[1]}</a><a href="#project">{t.nav[2]}</a><a href="#resources">{t.nav[3]}</a>
        </nav>
        <a className="github-link" href="https://github.com/EAI-course" target="_blank" rel="noreferrer"><GitBranch size={18} /><span>{t.github}</span></a>
        <button className="lang-toggle" type="button" onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')} aria-label={t.languageLabel} title={t.languageLabel}>
          <Languages size={17} /><span>{t.language}</span>
        </button>
      </header>

      <section className="hero" id="top">
        <div className="hero-media" aria-hidden="true"><img src="/embodied-ai-cover.png" alt="" /></div><div className="hero-shade" />
        <div className="hero-content"><p className="eyebrow"><span /> {t.term}</p><h1>{t.hero[0]}<br /><em>{t.hero[1]}</em></h1><p className="hero-summary">{t.summary}</p>
          <div className="hero-actions"><a className="button primary" href="#learn">{t.actions[0]} <ArrowDown size={17} /></a><a className="button ghost" href="#schedule">{t.actions[1]} <ArrowRight size={17} /></a></div>
        </div>
        <div className="hero-facts">{t.facts.map(([strong, rest], index) => { const Icon = factIcons[index]; return <div key={strong}><Icon size={18} /><span><b>{strong}</b>{rest}</span></div>; })}</div>
      </section>

      <section className="intro section-shell" id="learn"><div className="section-heading split-heading"><div><p className="kicker">{t.learnKicker}</p><h2>{t.learnTitle}</h2></div><p>{t.learnIntro}</p></div>
        <div className="module-grid">{t.modules.map(([title, subtitle, description, topics], index) => { const Icon = icons[index]; return <article className="module-card" key={title}><div className="module-top"><span>{String(index + 1).padStart(2, '0')}</span><Icon size={24} /></div><p className="module-subtitle">{subtitle}</p><h3>{title}</h3><p className="module-description">{description}</p><ul>{topics.map((topic) => <li key={topic}>{topic}</li>)}</ul></article>; })}</div>
      </section>

      <section className="question-band"><div className="section-shell question-inner"><p className="kicker light">{t.questionKicker}</p><h2>{t.question[0]}<br /><em>{t.question[1]}</em></h2>
        <div className="loop" aria-label={t.loop.join(', ')}>{t.loop.map((label, index) => { const Icon = loopIcons[index]; return <div className="loop-step" key={label}><Icon size={21} /><span>{label}</span>{index < 4 && <ChevronRight size={17} />}</div>; })}</div>
      </div></section>

      <section className="schedule section-shell" id="schedule"><div className="section-heading split-heading"><div><p className="kicker">{t.scheduleKicker}</p><h2>{t.scheduleTitle}</h2></div><p>{t.scheduleIntro}</p></div>
        <div className="schedule-grid">{t.schedule.map(([title, tag], index) => <article className="week-row" key={title}><span className="week-number">{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><span className="week-tag">{tag}</span></article>)}</div><p className="schedule-note">{t.scheduleNote}</p>
      </section>

      <section className="project" id="project"><div className="section-shell project-grid"><div className="project-copy"><p className="kicker light">{t.projectKicker}</p><h2>{t.projectTitle[0]}<br />{t.projectTitle[1]}</h2><p>{t.projectIntro}</p>
        <div className="milestones">{t.milestones.map(([title, description], index) => <div key={title}><span>{String(index + 1).padStart(2, '0')}</span><p><b>{title}</b>{description}</p></div>)}</div></div>
        <div className="project-panel"><div className="panel-label"><Cpu size={18} /> {t.deliverablesTitle}</div>{t.deliverables.map(([title, description], index) => <div className="deliverable" key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><b>{title}</b><p>{description}</p></div></div>)}<div className="demo-badge"><Sparkles size={18} /> {t.demo}</div></div>
      </div></section>

      <section className="outcomes section-shell"><div className="outcome-card"><div><p className="kicker">{t.outcomeKicker}</p><h2>{t.outcomeTitle}</h2></div><div className="outcome-list">{t.outcomes.map((outcome) => <p key={outcome}><CheckCircle2 size={20} />{outcome}</p>)}</div></div></section>

      <section className="resources section-shell" id="resources"><div className="section-heading"><p className="kicker">{t.resourcesKicker}</p><h2>{t.resourcesTitle}</h2></div><div className="resource-grid">{t.resources.map(([title, description], index) => { const Icon = resourceIcons[index]; const external = index > 1; return <a key={title} href={resourceLinks[index]} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}><Icon /><span><b>{title}</b><small>{description}</small></span><ArrowRight /></a>; })}</div></section>

      <footer><div className="section-shell footer-inner"><div className="brand"><span className="brand-mark"><Bot size={19} /></span><span>{t.brand}</span></div><p>{t.footer}</p><a href="#top">{t.back}</a></div></footer>
    </main>
  );
}
