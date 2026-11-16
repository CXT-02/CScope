import React, { useEffect, useMemo, useState } from 'react'
import { ExperimentHeader } from './AttentionExperiment'
import LearningCycle from './LearningCycle'
import TheoryPrimer from './TheoryPrimer'

const initialProcesses = [{ id: 'P1', burst: 6 }, { id: 'P2', burst: 3 }, { id: 'P3', burst: 8 }, { id: 'P4', burst: 2 }]
const colors = ['#6558e8', '#159a83', '#ee6c4d', '#3977c3']

const SCHED_STORY = [
  ['就绪队列与分派', 'CPU 只有一个，但多个就绪进程同时想运行', '调度器的核心职责就是从就绪队列挑选最合适的进程分配给 CPU。'],
  ['FCFS 护航效应', '先来先服务实现简单，但长作业会阻塞短作业', '长进程霸占 CPU 时，后续所有短任务只能苦苦排队，严重拉高平均等待时间。'],
  ['SJF 最优等待', '优先执行短任务，平均等待时间数学最优', '让短任务先完成能迅速释放等待压力，但可能引发长任务饥饿。'],
  ['时间片轮转 (RR)', '时钟中断定时打断，每个进程轮流分派一小段', '保证交互式桌面的极佳响应速度，消除饥饿风险，但伴随上下文切换。'],
  ['时间片大小权衡', '时间片过大变 FCFS，过小则切换开销吞噬算力', '调度策略永远是在公平响应度、切换开销与系统吞吐量之间的动态博弈。'],
  ['三大策略全景竞速', '用同一组进程，同屏透视甘特图时序与等待时间', '直观透视不同调度哲学在相同工作负载下的取舍与差异。']
]

function schedStoryText(step) {
  return [
    '现代操作系统在多道程序环境下，内存中同时存在多个处于就绪态的进程。但 CPU 核心数量极为有限（如单核），调度程序（Scheduler）必须不断决定下一微秒由谁独占 CPU。',
    'FCFS 像超市排队一样按到达先后处理。若排在第一位的是超长作业（如大文件解压），后面只需 0.1 秒的按键响应进程都会被死死堵在就绪队列中，这就是著名的护航效应（Convoy Effect）。',
    '短作业优先（SJF）依据贪心思想，让短进程先执行并迅速退出。由于短任务在前面早早结束，减少了后续大量任务的连带等待时间，在所有非抢占式算法中具有理论最低的平均等待时间。',
    '时间片轮转（Round Robin）为分时系统而生。CPU 设定硬件时钟中断，每隔固定的时间片（Quantum）就强行剥夺当前进程的 CPU，将其移回队列尾部并切换下一个，绝不让单个任务霸屏。',
    '时间片绝非越小越好。若时间片设为 1 微秒，CPU 将把大部分精力耗费在保存/恢复寄存器与 PCB 的上下文切换（Context Switch）上；若设为无限大，则退化为迟钝的 FCFS。通常设为 10ms~100ms。',
    '没有绝对完美的单一算法。FCFS 适合后台批处理，SJF 适合已知时长的特定流水线，而现代 Linux/Windows 则采用综合了优先级与多级反馈队列（MLFQ）的混合调度体系。'
  ][step]
}

function SchedulingStory() {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => {
      setStep((v) => {
        if (v === SCHED_STORY.length - 1) {
          setPlaying(false)
          return v
        }
        return v + 1
      })
    }, 4200)
    return () => clearTimeout(t)
  }, [playing, step])

  return (
    <section className="transformer-story sched-story">
      <header className="story-intro">
        <div>
          <span className="story-kicker">动画导学 · CPU 进程调度原理</span>
          <h2>多进程争抢单核 CPU 时，谁应该先运行？</h2>
          <p>从单核就绪队列、FCFS 护航效应，到 SJF 贪心破局与时间片轮转（RR），直观透视甘特图与等待时间的调度本质。</p>
        </div>
        <div className="sched-story-badge">
          <span>调度核心机制</span>
          <strong>Ready ➔ Running ➔ Done</strong>
          <small>分派 · 上下文切换 · 时间片</small>
        </div>
      </header>

      <nav className="story-timeline" style={{ '--story-steps': SCHED_STORY.length }}>
        {SCHED_STORY.map((x, i) => (
          <button
            key={x[0]}
            type="button"
            className={`${step === i ? 'active' : ''} ${i < step ? 'passed' : ''}`}
            onClick={() => {
              setStep(i)
              setPlaying(false)
            }}
          >
            <i>{i < step ? '✓' : i + 1}</i>
            <span>{x[0]}</span>
          </button>
        ))}
      </nav>

      <div className="story-stage" key={step}>
        <div className="story-copy">
          <span>0{step + 1} · {step === 0 ? '资源竞争' : step === 1 ? 'FCFS 瓶颈' : step === 2 ? 'SJF 贪心' : step === 3 ? 'RR 轮转' : step === 4 ? '权衡博弈' : '全景竞速'}</span>
          <h3>{SCHED_STORY[step][1]}</h3>
          <p>{schedStoryText(step)}</p>
          <aside>
            <strong>为什么重要？</strong>
            <p>{SCHED_STORY[step][2]}</p>
          </aside>
        </div>

        <div className="story-visual sched-story-canvas">
          <SchedulingStoryVisual step={step} />
        </div>
      </div>

      <footer className="story-controls">
        <button type="button" disabled={!step} onClick={() => setStep(step - 1)}>← 上一步</button>
        <button type="button" className="story-play" onClick={() => {
          if (step === SCHED_STORY.length - 1) setStep(0)
          setPlaying((v) => !v)
        }}>
          {playing ? '暂停讲解' : '▶ 自动播放'}
        </button>
        <button type="button" disabled={step === SCHED_STORY.length - 1} onClick={() => setStep(step + 1)}>下一步 →</button>
      </footer>
    </section>
  )
}

function SchedulingStoryVisual({ step }) {
  switch (step) {
    case 0:
      return (
        <div className="sched-sc sched-sc-queue">
          <div className="sched-sc-header">
            <span className="sched-tag">原理透视 · 01</span>
            <strong>单核 CPU 瓶颈与就绪队列 (Ready Queue)</strong>
          </div>
          <div className="sched-queue-pipeline">
            <div className="sched-box-col queue-col">
              <div className="sched-box-title">
                <span>进程就绪队列 (Ready Queue)</span>
                <small>内存中等待 CPU 分派</small>
              </div>
              <div className="process-queue-cards">
                <div className="p-card-item p1">
                  <div className="p-badge">P1</div>
                  <div className="p-meta">
                    <strong>视频转码进程</strong>
                    <small>运行需求: 20 单位 (长作业)</small>
                  </div>
                </div>
                <div className="p-card-item p2">
                  <div className="p-badge">P2</div>
                  <div className="p-meta">
                    <strong>鼠标点击响应</strong>
                    <small>运行需求: 2 单位 (极短作业)</small>
                  </div>
                </div>
                <div className="p-card-item p3">
                  <div className="p-badge">P3</div>
                  <div className="p-meta">
                    <strong>键盘输入回显</strong>
                    <small>运行需求: 3 单位 (短作业)</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="sched-dispatcher-col">
              <div className="dispatch-badge">OS 调度器 (Scheduler)</div>
              <div className="dispatch-arrow-flow">➔ 分派 (Dispatch) ➔</div>
              <span className="dispatch-rule-chip">挑选哪个进程？</span>
            </div>

            <div className="sched-box-col cpu-col">
              <div className="sched-box-title">
                <span>单核 CPU (Single Core)</span>
                <small className="cpu-busy-badge">🔥 100% 满载运行</small>
              </div>
              <div className="cpu-core-slot">
                <div className="cpu-chip-icon">🔲</div>
                <div className="cpu-slot-content">
                  <span className="running-label">正在执行</span>
                  <strong className="running-pname">P1 正在独占核心</strong>
                  <small className="running-state">同一时刻只能算 1 个任务！</small>
                </div>
              </div>
            </div>
          </div>
          <div className="sched-footer-tip">
            💡 <strong>核心问题诞生</strong>：多个进程同时到达就绪队列，但单核 CPU 无法分身！必须制定调度策略决定先服务谁、运行多久。
          </div>
        </div>
      )

    case 1:
      return (
        <div className="sched-sc sched-sc-fcfs">
          <div className="sched-sc-header">
            <span className="sched-tag danger">原理透视 · 02</span>
            <strong>先来先服务 (FCFS) · 护航效应 (Convoy Effect)</strong>
          </div>
          <div className="convoy-visual-stage">
            <div className="convoy-road-track">
              <div className="road-car-large">
                <div className="truck-body">
                  <div className="truck-head">🚛 货车</div>
                  <div className="truck-cargo">
                    <strong>P1 (长任务)</strong>
                    <span>Burst = 24</span>
                  </div>
                </div>
                <span className="car-status-tag">在 CPU 单行道慢吞吞执行 24 秒...</span>
              </div>

              <div className="convoy-blocked-group">
                <div className="road-car-small car-p2">
                  <div className="car-body">🚗 P2</div>
                  <small>只需 2 秒！</small>
                  <span className="wait-badge">被堵等了 24 秒 😭</span>
                </div>
                <div className="road-car-small car-p3">
                  <div className="car-body">🚙 P3</div>
                  <small>只需 3 秒！</small>
                  <span className="wait-badge">被堵等了 26 秒 😭</span>
                </div>
              </div>
            </div>

            <div className="fcfs-metrics-bar">
              <div className="metric-col-card">
                <span>P1 等待时间</span>
                <strong>0 秒</strong>
                <small>排第一位立刻执行</small>
              </div>
              <div className="metric-col-card bad">
                <span>P2 等待时间</span>
                <strong>24 秒</strong>
                <small>无辜被大卡车堵死</small>
              </div>
              <div className="metric-col-card bad">
                <span>P3 等待时间</span>
                <strong>26 秒</strong>
                <small>等待 P1 与 P2 完成</small>
              </div>
              <div className="metric-col-card result-card">
                <span>平均等待时间</span>
                <strong className="huge-num">16.67 秒</strong>
                <small>整体效率极低！</small>
              </div>
            </div>
          </div>
          <div className="sched-footer-tip danger">
            💡 <strong>护航效应的破坏力</strong>：短作业紧跟在长作业后面时，会被严重拖累。就像在超市排队，你只买一瓶水，前面的人却推了 5 辆大购物车结账！
          </div>
        </div>
      )

    case 2:
      return (
        <div className="sched-sc sched-sc-sjf">
          <div className="sched-sc-header">
            <span className="sched-tag success">原理透视 · 03</span>
            <strong>短作业优先 (SJF) · 贪心降等待的数学最优</strong>
          </div>
          <div className="sjf-visual-stage">
            <div className="sjf-reorder-banner">
              <span>调度器贪心重排</span>
              <strong>按运行时间从小到大排序：先让短任务瞬间冲刺！</strong>
            </div>

            <div className="sjf-reorder-flow">
              <div className="sjf-node fast-one">
                <div className="sjf-badge">第 1 执行</div>
                <strong>P2 (耗时 2)</strong>
                <span className="sjf-state-chip">2秒后立刻完成并释放资源！</span>
              </div>
              <div className="sjf-arrow">➔</div>
              <div className="sjf-node fast-two">
                <div className="sjf-badge">第 2 执行</div>
                <strong>P3 (耗时 3)</strong>
                <span className="sjf-state-chip">第 5 秒顺利完成！</span>
              </div>
              <div className="sjf-arrow">➔</div>
              <div className="sjf-node slow-last">
                <div className="sjf-badge gray">最后执行</div>
                <strong>P1 (耗时 24)</strong>
                <span className="sjf-state-chip">长任务在最后慢慢跑</span>
              </div>
            </div>

            <div className="sjf-metrics-bar">
              <div className="metric-col-card good">
                <span>P2 等待时间</span>
                <strong>0 秒</strong>
                <small>排第一直接跑</small>
              </div>
              <div className="metric-col-card good">
                <span>P3 等待时间</span>
                <strong>2 秒</strong>
                <small>仅等 P2 跑完</small>
              </div>
              <div className="metric-col-card">
                <span>P1 等待时间</span>
                <strong>5 秒</strong>
                <small>等短任务先冲</small>
              </div>
              <div className="metric-col-card result-card good">
                <span>平均等待时间</span>
                <strong className="huge-num good">2.33 秒</strong>
                <small>从 16.67s 骤降至 2.33s！</small>
              </div>
            </div>
          </div>
          <div className="sched-footer-tip success">
            💡 <strong>为什么等待时间骤降？</strong> 让短任务先完成，它们就无需再为后续任务承担等待成本。但缺点是：如果源源不断有新短任务到来，长任务将面临<strong>“饥饿 (Starvation)”</strong>永远跑不上！
          </div>
        </div>
      )

    case 3:
      return (
        <div className="sched-sc sched-sc-rr">
          <div className="sched-sc-header">
            <span className="sched-tag rr">原理透视 · 04</span>
            <strong>时间片轮转 (RR) · 时钟中断与公平轮流服务</strong>
          </div>
          <div className="rr-carousel-stage">
            <div className="rr-timer-strip">
              <div className="quantum-badge">时间片 Quantum = 2 单位</div>
              <div className="clock-tick-box">⏱️ 硬件时钟中断：每次嘀嗒 2 秒强行切换！</div>
            </div>

            <div className="rr-ring-carousel">
              <div className="carousel-slot p1-slot active-turn">
                <span className="turn-label">正在执行</span>
                <strong>P1 (剩余 24➔22)</strong>
                <small>跑满 2 秒被时钟中断强制打断！</small>
              </div>
              <div className="carousel-arrow">➔ 移到队尾 ➔</div>
              <div className="carousel-slot p2-slot next-up">
                <span className="turn-label">下一个</span>
                <strong>P2 (需求 2)</strong>
                <small>跑完这轮 2 秒后将完全结束！</small>
              </div>
              <div className="carousel-arrow">➔</div>
              <div className="carousel-slot p3-slot waiting">
                <span className="turn-label">等待中</span>
                <strong>P3 (需求 3)</strong>
                <small>排在第三轮</small>
              </div>
            </div>

            <div className="context-switch-alert">
              <div className="cs-icon">🔄</div>
              <div className="cs-info">
                <strong>发生上下文切换 (Context Switch)！</strong>
                <p>CPU 将 P1 的寄存器、程序计数器存入 PCB，再将 P2 的状态从 PCB 恢复到 CPU 寄存器，开销约 1~10 微秒。</p>
              </div>
            </div>
          </div>
          <div className="sched-footer-tip">
            💡 <strong>分时系统灵魂</strong>：没有任何一个进程能长期霸占 CPU，桌面窗口、鼠标指针和后台下载都能“同时”被响应，彻底消除饥饿！
          </div>
        </div>
      )

    case 4:
      return (
        <div className="sched-sc sched-sc-tradeoff">
          <div className="sched-sc-header">
            <span className="sched-tag tradeoff">原理透视 · 05</span>
            <strong>时间片大小的终极权衡 (Quantum Trade-off)</strong>
          </div>
          <div className="tradeoff-stage-grid">
            <div className="tradeoff-side left-danger">
              <div className="side-title">
                <span className="badge-side">情况 A</span>
                <h4>时间片 Quantum 过大 ($Q \to \infty$)</h4>
              </div>
              <div className="side-body">
                <div className="side-icon">🐢</div>
                <strong className="problem-text">退化为 FCFS (先来先服务)</strong>
                <p>每个进程一次性跑完，短任务等待时间再度变长，前端界面卡顿，失去交互响应优势。</p>
              </div>
              <div className="side-foot-tag bad">响应速度：差 ❌</div>
            </div>

            <div className="tradeoff-balance-center">
              <div className="scale-needle">⚖️ 黄金平衡点</div>
              <div className="sweet-spot-card">
                <strong>10ms ~ 100ms</strong>
                <small>现代 OS 标准时间片</small>
                <span>使上下文切换开销占比 &lt; 1%</span>
              </div>
            </div>

            <div className="tradeoff-side right-danger">
              <div className="side-title">
                <span className="badge-side">情况 B</span>
                <h4>时间片 Quantum 过小 ($Q = 0.001ms$)</h4>
              </div>
              <div className="side-body">
                <div className="side-icon">💥</div>
                <strong className="problem-text">上下文切换吞噬 CPU 算力</strong>
                <p>CPU 刚跑两个指令就忙着存盘恢复寄存器，50% 以上的计算时间被频繁切换白白浪费！</p>
              </div>
              <div className="side-foot-tag bad">系统吞吐量：暴跌 ❌</div>
            </div>
          </div>
          <div className="sched-footer-tip">
            💡 <strong>系统工程法则</strong>：时间片必须远大于上下文切换所需的时间（至少 100 倍以上），才能保证绝大部分 CPU 时间用于真正的计算。
          </div>
        </div>
      )

    case 5:
      return (
        <div className="sched-sc sched-sc-summary">
          <div className="sched-sc-header">
            <span className="sched-tag summary">三大策略 · 全景竞速</span>
            <strong>同一组进程负载下的甘特图直观对照</strong>
          </div>
          <div className="summary-gantt-compare">
            <div className="gantt-row-item">
              <div className="row-label">
                <strong>FCFS 先来先服务</strong>
                <small>平均等待: 16.67s</small>
              </div>
              <div className="mini-gantt-track">
                <div className="mg-bar p1" style={{ flex: 24 }}>P1 (24)</div>
                <div className="mg-bar p2" style={{ flex: 2 }}>P2(2)</div>
                <div className="mg-bar p3" style={{ flex: 3 }}>P3(3)</div>
              </div>
              <span className="row-tag bad">短任务被严重护航拖延</span>
            </div>

            <div className="gantt-row-item">
              <div className="row-label">
                <strong>SJF 短作业优先</strong>
                <small className="good">平均等待: 2.33s (最优)</small>
              </div>
              <div className="mini-gantt-track">
                <div className="mg-bar p2" style={{ flex: 2 }}>P2(2)</div>
                <div className="mg-bar p3" style={{ flex: 3 }}>P3(3)</div>
                <div className="mg-bar p1" style={{ flex: 24 }}>P1 (24)</div>
              </div>
              <span className="row-tag good">平均等待最低 · 存在饥饿风险</span>
            </div>

            <div className="gantt-row-item">
              <div className="row-label">
                <strong>RR 时间片轮转 (Q=2)</strong>
                <small>响应最均匀 · 0 饥饿</small>
              </div>
              <div className="mini-gantt-track">
                <div className="mg-bar p1" style={{ flex: 2 }}>P1</div>
                <div className="mg-bar p2" style={{ flex: 2 }}>P2</div>
                <div className="mg-bar p3" style={{ flex: 2 }}>P3</div>
                <div className="mg-bar p1" style={{ flex: 2 }}>P1</div>
                <div className="mg-bar p3" style={{ flex: 1 }}>P3</div>
                <div className="mg-bar p1" style={{ flex: 20 }}>P1 (后续)</div>
              </div>
              <span className="row-tag rr">交互体验最佳 · 有切换开销</span>
            </div>
          </div>
          <div className="sched-footer-tip">
            💡 <strong>总结启示</strong>：现实中没有一种算法通吃所有场景。进入下方自由探索面板，自己调整进程运行时间与时间片，亲自验证它们的甘特图时序吧！
          </div>
        </div>
      )

    default:
      return null
  }
}

export default function SchedulingExperiment({ experiment }) {
  const [processes, setProcesses] = useState(initialProcesses)
  const [algorithm, setAlgorithm] = useState('fcfs')
  const [quantum, setQuantum] = useState(2)
  const result = useMemo(() => schedule(processes, algorithm, quantum), [processes, algorithm, quantum])

  function updateBurst(index, burst) {
    setProcesses((current) => current.map((process, processIndex) => processIndex === index ? { ...process, burst: Math.max(1, burst) } : process))
  }

  return (
    <>
      <ExperimentHeader experiment={experiment} eyebrow="操作系统实验 03" />
      <SchedulingStory />
      <TheoryPrimer
        title="CPU 为什么需要调度算法？"
        intro="当多个进程都想使用 CPU 时，操作系统必须决定谁先运行、一次运行多久。不同策略会在平均等待时间、响应速度、公平性和切换开销之间做出不同取舍。"
        formula="等待时间 = 完成时刻 − 到达时刻 − 实际运行时间"
        concepts={[
          { term: '运行时间', description: '进程真正占用 CPU 所需的时间。数值越大，任务越长。' },
          { term: '等待时间', description: '进程在就绪队列中等待 CPU 的累计时间；平均值越小，整体周转通常越快。' },
          { term: '上下文切换', description: 'CPU 从一个进程切换到另一个进程，需要保存和恢复状态，会产生额外开销。' },
        ]}
        goal="保持进程不变，比较 FCFS、SJF 和 RR 的甘特图、平均等待时间与切换次数，理解“最快”和“最公平”不一定是同一个答案。"
      />
      <div className="explore-heading">
        <span>自由探索 · 参数化甘特图时序实验</span>
        <h2>动态调整任务长度，透视三种调度算法的实际表现</h2>
        <p>自定义各进程的 CPU 需求时长与时间片，观察实时甘特图时序、平均等待时间与上下文切换次数的敏捷变化。</p>
      </div>
      <div className="lab-layout">
        <aside className="control-panel">
          <div className="panel-title"><span>调度参数</span><i>全部同时到达</i></div>
          <label className="field-block"><span>调度算法</span><small>{algorithmHelp(algorithm)}</small><select value={algorithm} onChange={(event) => setAlgorithm(event.target.value)}><option value="fcfs">FCFS 先来先服务</option><option value="sjf">SJF 短作业优先</option><option value="rr">RR 时间片轮转</option></select></label>
          {algorithm === 'rr' && <label className="range-field"><span><b>时间片 Quantum</b><i>{quantum}</i></span><small>每个进程一次最多运行多久。越小越公平，但上下文切换通常越频繁。</small><input type="range" min="1" max="5" value={quantum} onChange={(event) => setQuantum(Number(event.target.value))} /></label>}
          <div className="process-editor"><span>CPU 运行时间</span><small>修改每个进程完成任务需要的 CPU 时间，右侧甘特图和指标会立即重算。</small>{processes.map((process, index) => <label key={process.id}><b style={{ background: colors[index] }}>{process.id}</b><input type="number" min="1" max="12" value={process.burst} onChange={(event) => updateBurst(index, Number(event.target.value))} /><i>单位</i></label>)}</div>
          <div className="live-explanation" key={`${algorithm}-${quantum}`}><span>你当前选择的是</span><strong>{algorithm === 'fcfs' ? '先来先服务：简单，但可能让短任务久等' : algorithm === 'sjf' ? '短作业优先：平均等待时间通常更低' : `时间片轮转：每次最多运行 ${quantum} 个单位`}</strong><p>观察右侧平均等待时间和上下文切换次数，它们会随着算法和参数实时变化。</p></div>
        </aside>
        <section className="visual-panel scheduling-panel">
          <div className="visual-toolbar"><div><strong>CPU 调度甘特图</strong><span>{algorithm.toUpperCase()} · 总运行时间 {result.total}</span></div></div>
          <div className="metric-grid"><div><span>平均等待时间</span><strong>{result.averageWait.toFixed(2)}</strong></div><div><span>上下文切换</span><strong>{Math.max(0, result.timeline.length - 1)}</strong></div><div><span>完成进程</span><strong>{processes.length}</strong></div></div>
          <div className="gantt-wrap">
            <div className="gantt-chart">{result.timeline.map((block, index) => { const processIndex = processes.findIndex((process) => process.id === block.id); return <div key={`${block.id}-${index}`} className="gantt-block" style={{ width: `${((block.end - block.start) / result.total) * 100}%`, background: colors[processIndex] }} title={`${block.id}: ${block.start} → ${block.end}`}><strong>{block.id}</strong><span>{block.end - block.start}</span></div> })}</div>
            <div className="gantt-axis"><span>0</span>{result.timeline.map((block, index) => <span key={`${block.id}-time-${index}`} style={{ left: `${(block.end / result.total) * 100}%` }}>{block.end}</span>)}</div>
          </div>
          <div className="algorithm-note"><strong>{algorithm === 'fcfs' ? '先来先服务' : algorithm === 'sjf' ? '短作业优先' : '时间片轮转'}</strong><p>{algorithm === 'fcfs' ? '按进入队列的顺序执行，实现简单，但长任务可能让后续短任务等待很久。' : algorithm === 'sjf' ? '优先执行运行时间短的任务，通常能降低平均等待时间，但长任务可能被推迟。' : '每个进程轮流获得一小段 CPU 时间，响应更公平，但时间片过小会带来频繁切换。'}</p></div>
        </section>
      </div>
      <LearningCycle
        experimentId="scheduling"
        prediction={{
          question: '所有进程同时到达时，哪种算法通常能降低平均等待时间？',
          options: ['FCFS 先来先服务', 'SJF 短作业优先', '随机选择'],
          answer: 'SJF 短作业优先',
          explanation: ' 让短任务先完成，可以减少更多任务的累计等待。',
        }}
        operation={{ title: '比较三种调度策略', instruction: '保持四个进程不变，依次切换 FCFS、SJF 和 RR，并在 RR 中改变时间片。' }}
        observation={`${algorithm.toUpperCase()} 当前平均等待时间为 ${result.averageWait.toFixed(2)}，发生 ${Math.max(0, result.timeline.length - 1)} 次上下文切换。`}
        summaryPrompt="平均等待时间和调度公平性之间存在什么取舍？"
      />
    </>
  )
}

function algorithmHelp(algorithm) {
  if (algorithm === 'fcfs') return '按队列顺序一直运行到完成，几乎不考虑任务长短。'
  if (algorithm === 'sjf') return '优先执行运行时间最短的任务，通常能降低平均等待时间。'
  return '所有进程轮流获得固定时间片，强调及时响应与公平。'
}
