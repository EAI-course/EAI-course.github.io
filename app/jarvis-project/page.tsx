import {
  ArrowDown,
  ArrowRight,
  Bot,
  BrainCircuit,
  CalendarClock,
  Camera,
  CheckCircle2,
  FileText,
  Lightbulb,
  MessageCircle,
  Mic2,
  Presentation,
  Rocket,
  Sparkles,
  Target,
  Wrench,
} from 'lucide-react';
import './jarvis-project.css';

const agents = [
  {
    icon: Mic2,
    title: '语音交互 Agent',
    eyebrow: 'LISTEN · REASON · RESPOND',
    description:
      '作为用户的主要交互入口，负责唤醒、语音识别、对话生成、功能调用、语音合成与播放。它既要理解用户，也要决定系统下一步调用哪些能力。',
  },
  {
    icon: Camera,
    title: '视觉 Agent',
    eyebrow: 'SEE · UNDERSTAND · LOCATE',
    description:
      '提供视觉理解、检测与定位能力，例如理解场景、识别用户行为、检测人脸或目标位置，并结合机械臂运动估计目标在三维空间中的位置。',
  },
  {
    icon: Bot,
    title: '机械控制 Agent',
    eyebrow: 'PLAN · CONTROL · ACT',
    description:
      '根据任务目标与视觉反馈生成并执行机械臂控制指令，例如转动机械臂调整观察视角、到达指定姿态，或将末端夹爪移动到目标点。',
  },
];

const ideas = [
  '捡球',
  '敲键盘',
  '扮演用户回复别人的消息',
  '通过“撑地”让自己越过一个台阶',
  '回答“你觉得谁更帅”并指向它认为的那个人',
];

const phases = [
  {
    number: '01',
    deadline: '2026.11.02 · 24:00',
    title: 'Proposal：定义你们想做什么',
    icon: Lightbulb,
    description:
      '从现在开始构思希望在 Agent 上实现的功能，并形成一份可继续迭代的项目提案。',
    deliverables: [
      '想在 Agent 上完成什么功能',
      '为什么这些功能有趣或有用',
      '计划如何实现：提供大致思路即可，暂不要求具体方案',
      '如果一切顺利，最后一周 Demo Day 准备展示什么',
    ],
    note: 'Proposal 不是不可更改的合同。随着实验推进，可以不断调整方向、范围和实现路径。',
  },
  {
    number: '02',
    deadline: '2026.11.23 · 24:00',
    title: 'Checkpoint：展示当前进展',
    icon: Wrench,
    description:
      '提交目前已经完成的功能和可以运行的阶段性结果，让实现状态与后续计划都清晰可见。',
    deliverables: [
      '用文档介绍当前进展情况',
      '说明当前实现思路与实际实现状态',
      '给出目前能够展示的 Demo',
      '说明相较 Proposal 做了哪些调整，以及为什么调整',
    ],
    note: '阶段性 Demo 不需要是最终形态；它应该真实反映当前已经完成、正在验证和仍未解决的部分。',
  },
  {
    number: '03',
    deadline: '2026.12.21 · 第 16 周',
    title: 'Demo Day：现场展示与发现',
    icon: Presentation,
    description:
      '在最后一次课举行 Demo Day。各小组上台展示最终实现的功能、系统表现和过程中得到的发现。',
    deliverables: [
      '现场演示实现的功能或完整系统',
      '说明系统如何工作，以及关键设计选择',
      '展示成功结果、限制与失败案例',
      '分享实验过程中得到的新现象或新理解',
    ],
    note: '最终展示不仅看“有没有成功”，也看你们是否把问题做深、把证据讲清楚。',
  },
];

const capabilities = [
  ['自然语音交互', '支持对话、聊天与模糊指令理解，而不只是硬编码的字符匹配。'],
  ['功能调用', '把用户意图转化为可执行的感知、推理或机械臂功能。'],
  ['视觉追踪与识别', '让机械臂调整观察视角、持续跟踪目标，并理解当前画面。'],
  ['物体交互', '定位目标并控制机械臂完成触碰、抓取或其他自定义交互。'],
];

export default function JarvisProjectPage() {
  return (
    <main className="jarvis-page">
      <header className="jarvis-header">
        <a className="jarvis-brand" href="#top" aria-label="建造你的 JARVIS">
          <span><Bot size={19} /></span>
          <b>建造你的 JARVIS</b>
        </a>
        <nav aria-label="课程项目页面导航">
          <a href="#vision">项目愿景</a>
          <a href="#framework">参考框架</a>
          <a href="#capabilities">能力参考</a>
          <a href="#timeline">三阶段安排</a>
          <a href="#grading">评估方式</a>
        </nav>
        <p>具身智能引论 · 2026 秋季</p>
      </header>

      <section className="jarvis-hero" id="top">
        <div className="jarvis-orb orb-one" />
        <div className="jarvis-orb orb-two" />
        <div className="jarvis-shell hero-grid">
          <div className="hero-copy">
            <p className="jarvis-kicker"><Sparkles size={15} /> FINAL COURSE PROJECT</p>
            <h1>建造你的<br /><em>JARVIS</em></h1>
            <p className="hero-lead">
              把语言、视觉和机械臂行动连成一个真正能工作的智能体。我们希望每一组最终做出的，不只是几段独立代码，而是一个有自己想法、能够被现场体验的系统。
            </p>
            <div className="hero-actions">
              <a className="jarvis-button primary" href="#framework">了解项目框架 <ArrowDown size={17} /></a>
              <a className="jarvis-button secondary" href="#timeline">查看时间节点 <ArrowRight size={17} /></a>
            </div>
          </div>
          <div className="hero-console" aria-label="课程项目关键词">
            <div className="console-top"><span /><span /><span /><b>JARVIS / PROJECT BRIEF</b></div>
            <div className="console-body">
              <p><span>01</span><b>Listen</b><small>自然语音交互</small></p>
              <p><span>02</span><b>See</b><small>环境理解与定位</small></p>
              <p><span>03</span><b>Think</b><small>Agent Workflow</small></p>
              <p><span>04</span><b>Act</b><small>机械臂闭环执行</small></p>
            </div>
          </div>
        </div>
      </section>

      <section className="jarvis-section vision-section" id="vision">
        <div className="jarvis-shell split-intro">
          <div>
            <p className="jarvis-kicker blue">PROJECT VISION</p>
            <h2>从一个有趣的想法，<br />到一个真实可演示的系统。</h2>
          </div>
          <div className="intro-copy">
            <p>想象这样一个机器人：听到你的声音时会主动看向你、和你打招呼；它能观察周围环境，理解你的行为与表情，并与你聊天。</p>
            <p>它还能控制机械臂完成触碰、抓取和其他动作，帮你按开关、递物体、敲键盘，甚至替你回复消息。今天，我们已经可以把这种科幻愿景做成系统原型。</p>
          </div>
        </div>
      </section>

      <section className="jarvis-section framework-section" id="framework">
        <div className="jarvis-shell">
          <p className="jarvis-kicker cyan">FRAMEWORK</p>
          <h2>我们准备怎么实现这个愿景？</h2>
          <p className="section-lead">你们可以从语音、视觉和机械控制三个能力模块出发，把用户意图转化为机械臂在真实环境中的行动。</p>

          <aside className="creative-callout">
            <div className="callout-icon"><Rocket size={25} /></div>
            <div>
              <p className="callout-label">重点 · 自己定义真正想做的项目</p>
              <h3>鼓励每一组构思和 DIY 自己觉得有趣的小功能，甚至重构整个系统。</h3>
              <p>例如：{ideas.join('、')}……这些只是帮助打开思路的例子，你们完全可以提出不同的方向。</p>
              <p>评分会参考想法的<strong>新颖程度、完成度和难度</strong>。我们同样鼓励探索与发现：哪怕原先设想的功能最终没有成功实现，只要实验带来了未预期的现象或对问题的新理解，也会获得相应加分。</p>
            </div>
          </aside>

          <div className="agent-grid">
            {agents.map(({ icon: Icon, title, eyebrow, description }) => (
              <article className="agent-card" key={title}>
                <div className="agent-icon"><Icon size={23} /></div>
                <p>{eyebrow}</p>
                <h3>{title}</h3>
                <div className="agent-rule" />
                <p className="agent-description">{description}</p>
              </article>
            ))}
          </div>

          <div className="workflow-panel">
            <div className="workflow-image">
              <img src="/jarvis-project/workflow.png" alt="语音交互 Agent、视觉 Agent 与机械臂功能闭环的参考 workflow" />
            </div>
            <div className="workflow-copy">
              <p className="jarvis-kicker blue">SYSTEM WORKFLOW</p>
              <ul>
                <li><span>01</span><p>用户通过语音与语音交互 Agent 沟通。</p></li>
                <li><span>02</span><p>视觉 Agent 提供环境上下文，例如当前看到了什么、人或目标物体在哪里。</p></li>
                <li><span>03</span><p>语音交互 Agent 发起功能调用；每个调用可以形成视觉理解与机械控制的小闭环。</p></li>
              </ul>
              <div className="workflow-note">
                <BrainCircuit size={21} />
                <p><strong>你们不需要照搬这张图。</strong>请按照自己的功能目标定义 Agent Workflow，也可以设计不同的 multi-agent system 框架、角色分工和通信方式。</p>
              </div>
            </div>
          </div>

          <div className="loop-examples">
            <article>
              <p className="example-number">EXAMPLE 01</p>
              <h3>追踪任务的闭环</h3>
              <ol>
                <li>用户提出“看着我”或“看着这个物体”的请求。</li>
                <li>视觉 Agent 检测目标并返回图像位置。</li>
                <li>机械控制 Agent 调整机械臂姿态，使目标保持在腕部相机视野的中央区域。</li>
                <li>新动作产生新观测，系统持续更新并形成实时闭环。</li>
              </ol>
            </article>
            <article>
              <p className="example-number">EXAMPLE 02</p>
              <h3>触碰任务的闭环</h3>
              <ol>
                <li>用户提出“碰一下那个目标”的请求。</li>
                <li>视觉 Agent 找到目标，机械臂改变观察视角以主动收集信息。</li>
                <li>系统结合视觉与运动信息估计三维位置。</li>
                <li>机械控制 Agent 规划动作并执行触碰，通过视觉反馈继续修正。</li>
              </ol>
            </article>
          </div>
        </div>
      </section>

      <section className="jarvis-section capability-section" id="capabilities">
        <div className="jarvis-shell capability-layout">
          <div className="capability-heading">
            <p className="jarvis-kicker blue">CAPABILITY REFERENCES</p>
            <h2>我们可以从这些能力出发</h2>
            <p>以下是可复用的能力模块，不是所有小组都必须完成的固定清单。请根据你们的 Proposal 选择、组合或替换。</p>
          </div>
          <div className="capability-list">
            {capabilities.map(([title, description], index) => (
              <article key={title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><h3>{title}</h3><p>{description}</p></div>
                <CheckCircle2 size={20} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="jarvis-section timeline-section" id="timeline">
        <div className="jarvis-shell">
          <div className="timeline-heading">
            <div>
              <p className="jarvis-kicker cyan">PROJECT TIMELINE</p>
              <h2>三个阶段，把想法变成现场 Demo。</h2>
            </div>
            <p>每个节点都记录真实进展。方向允许变化，但需要说清楚为什么变化、做到了什么、又发现了什么。</p>
          </div>
          <div className="phase-list">
            {phases.map(({ number, deadline, title, icon: Icon, description, deliverables, note }) => (
              <article className="phase-card" key={number}>
                <div className="phase-meta">
                  <span>{number}</span>
                  <div><CalendarClock size={17} /><b>{deadline}</b></div>
                </div>
                <div className="phase-main">
                  <div className="phase-icon"><Icon size={23} /></div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <ul>{deliverables.map((item) => <li key={item}><CheckCircle2 size={16} />{item}</li>)}</ul>
                  <aside>{note}</aside>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="jarvis-section grading-section" id="grading">
        <div className="jarvis-shell grading-grid">
          <div>
            <p className="jarvis-kicker cyan">HOW WE EVALUATE</p>
            <h2>我们既看结果，<br />也看你们提出了什么问题。</h2>
          </div>
          <div className="grading-cards">
            <article><Target size={22} /><div><h3>想法与挑战</h3><p>功能是否新颖、有趣或有用？你们选择的问题是否具有足够难度？</p></div></article>
            <article><Wrench size={22} /><div><h3>完成度</h3><p>系统实际做到了什么？功能是否稳定，演示是否能够体现完整的感知—决策—行动过程？</p></div></article>
            <article><FileText size={22} /><div><h3>过程与证据</h3><p>实现思路、实验过程、成功与失败是否记录清楚？是否能解释关键设计选择？</p></div></article>
            <article><Sparkles size={22} /><div><h3>探索与发现</h3><p>是否发现了未预期的现象，或对问题形成了新的理解？有证据的发现同样值得加分。</p></div></article>
          </div>
        </div>
      </section>

      <footer className="jarvis-footer">
        <div className="jarvis-shell">
          <div><Bot size={20} /><b>建造你的 JARVIS</b></div>
          <p>具身智能引论 · 2026 秋季 · 课程项目说明</p>
          <a href="#top">返回顶部 ↑</a>
        </div>
      </footer>
    </main>
  );
}
