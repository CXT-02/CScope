import React, { useEffect, useMemo, useState } from 'react'
import { ExperimentHeader } from './AttentionExperiment'
import LearningCycle from './LearningCycle'
import TheoryPrimer from './TheoryPrimer'

const initialProcesses = [
  { id: 'P1', arrival: 0, burst: 6 },
  { id: 'P2', arrival: 0, burst: 3 },
  { id: 'P3', arrival: 0, burst: 8 },
  { id: 'P4', arrival: 0, burst: 2 }
]
const staggeredProcesses = [
  { id: 'P1', arrival: 0, burst: 6 },
  { id: 'P2', arrival: 2, burst: 3 },
  { id: 'P3', arrival: 4, burst: 8 },
  { id: 'P4', arrival: 6, burst: 2 }
]
const colors = ['#6558e8', '#159a83', '#ee6c4d', '#3977c3']

function scheduleProcesses(processes, algorithm, quantum) {
  const n = processes.length
  let timeline = []
  let currentTime = 0

  if (algorithm === 'fcfs') {
    const queue = [...processes].sort((a, b) => a.arrival - b.arrival || a.id.localeCompare(b.id))
    queue.forEach((p) => {
      if (currentTime < p.arrival) {
        timeline.push({ id: 'IDLE', start: currentTime, end: p.arrival, isIdle: true })
        currentTime = p.arrival
      }
      timeline.push({ ...p, start: currentTime, end: currentTime + p.burst })
      currentTime += p.burst
    })
  } else if (algorithm === 'sjf') {
    const remaining = processes.map((p) => ({ ...p, completed: false }))
    let completedCount = 0
    while (completedCount < n) {
      const available = remaining.filter((p) => !p.completed && p.arrival <= currentTime)
      if (available.length === 0) {
        const nextArrival = Math.min(...remaining.filter((p) => !p.completed).map((p) => p.arrival))
        timeline.push({ id: 'IDLE', start: currentTime, end: nextArrival, isIdle: true })
        currentTime = nextArrival
        continue
      }
      available.sort((a, b) => a.burst - b.burst || a.arrival - b.arrival)
      const chosen = available[0]
      timeline.push({ ...chosen, start: currentTime, end: currentTime + chosen.burst })
      currentTime += chosen.burst
      chosen.completed = true
      completedCount++
    }
  } else {
    // RR 时间片轮转算法
    const procMap = processes.map((p) => ({ ...p, remaining: p.burst }))
    let readyQueue = []
    let completedCount = 0
    const sorted = [...procMap].sort((a, b) => a.arrival - b.arrival)
    let arrivedIdx = 0

    while (completedCount < n) {
      while (arrivedIdx < sorted.length && sorted[arrivedIdx].arrival <= currentTime) {
        readyQueue.push(sorted[arrivedIdx])
        arrivedIdx++
      }

      if (readyQueue.length === 0) {
        if (arrivedIdx < sorted.length) {
          const nextTime = sorted[arrivedIdx].arrival
          timeline.push({ id: 'IDLE', start: currentTime, end: nextTime, isIdle: true })
          currentTime = nextTime
          continue
        } else {
          break
        }
      }

      const current = readyQueue.shift()
      const slice = Math.min(quantum, current.remaining)
      timeline.push({ ...current, start: currentTime, end: currentTime + slice })
      currentTime += slice
      current.remaining -= slice

      while (arrivedIdx < sorted.length && sorted[arrivedIdx].arrival <= currentTime) {
        readyQueue.push(sorted[arrivedIdx])
        arrivedIdx++
      }

      if (current.remaining > 0) {
        readyQueue.push(current)
      } else {
        completedCount++
      }
    }
  }

  const completionMap = {}
  timeline.forEach((block) => {
    if (!block.isIdle) {
      completionMap[block.id] = block.end
    }
  })

  const processStats = processes.map((p) => {
    const comp = completionMap[p.id] ?? (p.arrival + p.burst)
    const turnaround = comp - p.arrival
    const waiting = turnaround - p.burst
    const weightedTurnaround = (turnaround / p.burst).toFixed(2)
    return {
      ...p,
      completion: comp,
      turnaround,
      waiting,
      weightedTurnaround,
    }
  })

  const avgWait = processStats.reduce((acc, p) => acc + p.waiting, 0) / n
  const avgTurnaround = processStats.reduce((acc, p) => acc + p.turnaround, 0) / n
  const avgWeightedTurnaround = processStats.reduce((acc, p) => acc + Number(p.weightedTurnaround), 0) / n
  const validBlocks = timeline.filter((b) => !b.isIdle)
  const contextSwitches = validBlocks.length > 0 ? validBlocks.length - 1 : 0

  const waitSum = processStats.reduce((a, b) => a + b.waiting, 0)
  const turnaroundSum = processStats.reduce((a, b) => a + b.turnaround, 0)
  const waitFormula = `(${processStats.map((p) => `${p.id}:${p.waiting}`).join(' + ')}) ÷ ${n} = ${waitSum} ÷ ${n} = ${avgWait.toFixed(2)}`
  const turnaroundFormula = `(${processStats.map((p) => `${p.id}:${p.turnaround}`).join(' + ')}) ÷ ${n} = ${turnaroundSum} ÷ ${n} = ${avgTurnaround.toFixed(2)}`

  return {
    timeline,
    total: currentTime,
    processStats,
    averageWait: avgWait,
    averageTurnaround: avgTurnaround,
    averageWeightedTurnaround: avgWeightedTurnaround,
    contextSwitches,
    waitFormula,
    turnaroundFormula,
  }
}

const SCHED_STORY = [
  ['进程五状态与生命周期', '进程的一生在创建、就绪、运行、阻塞和终止中流转', 'PCB 是进程在系统中的唯一身份证，CPU 调度器负责在就绪与运行态之间做分派。'],
  ['FCFS 护航效应', '先来先服务实现简单，但长作业会阻塞短作业', '长进程霸占 CPU 时，后续所有短任务只能苦苦排队，严重拉高平均等待时间。'],
  ['SJF 最优等待', '优先执行短任务，平均等待时间数学最优', '让短任务先完成能迅速释放等待压力，但可能引发长任务饥饿。'],
  ['时间片轮转 (RR)', '时钟中断定时打断，每个进程轮流分派一小段', '保证交互式桌面的极佳响应速度，消除饥饿风险，但伴随上下文切换。'],
  ['时间片大小权衡', '时间片过大变 FCFS，过小则切换开销吞噬算力', '调度策略永远是在公平响应度、切换开销与系统吞吐量之间的动态博弈。'],
  ['三大策略全景竞速', '用同一组进程，同屏透视甘特图时序与等待时间', '直观透视不同调度哲学在相同工作负载下的取舍与差异。']
]

function schedStoryText(step) {
  return [
    '进程是系统资源分配和调度的基本单位。操作系统用“五状态模型”刻画其生命周期：①创建态(New)：申请并初始化 PCB；②就绪态(Ready)：万事俱备只欠 CPU；③执行态(Running)：独占单核运算；④阻塞态(Blocked)：等待 I/O 或锁资源；⑤终止态(Terminated)：执行完毕回收资源。调度器负责就绪与运行之间的分派与时钟轮转。',
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
        <div className="sched-sc sched-sc-queue" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="sched-sc-header">
            <span className="sched-tag">原理透视 · 01</span>
            <strong>进程五状态生命周期模型 (Five-State Model)</strong>
          </div>

          <div style={{ background: '#0a101d', border: '1.5px solid #1e293b', borderRadius: '10px', padding: '16px' }}>
            {/* 五状态图解架构 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr 1.2fr 1fr', gap: '8px', alignItems: 'center' }}>
              {/* 1. 创建态 */}
              <div style={{ background: '#1e293b', border: '1.5px solid #a855f7', borderRadius: '8px', padding: '12px 8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#a855f7', fontWeight: 'bold' }}>01. 创建态</span>
                <strong style={{ display: 'block', fontSize: '1rem', color: '#fff', margin: '4px 0' }}>NEW</strong>
                <small style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>申请 PCB 结构<br />分配唯一 PID</small>
              </div>

              {/* 箭头 1: 提交 */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>载入/提交</span>
                <div style={{ color: '#a855f7', fontSize: '1.2rem', fontWeight: 'bold' }}>➔</div>
              </div>

              {/* 2. 就绪态 与 3. 执行态 与 4. 阻塞态 */}
              <div style={{ gridColumn: '2 / 5', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* 就绪态 与 执行态 核心循环 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '10px', alignItems: 'center' }}>
                  <div style={{ background: '#1e293b', border: '2px solid #10b981', borderRadius: '8px', padding: '12px 10px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 'bold' }}>02. 就绪态</span>
                    <strong style={{ display: 'block', fontSize: '1.05rem', color: '#34d399', margin: '3px 0' }}>READY</strong>
                    <small style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>除 CPU 外已备齐<br />在就绪队列排队</small>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center', minWidth: '95px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#10b981' }}>调度分派 ➔</span>
                    <span style={{ fontSize: '0.72rem', color: '#f59e0b' }}>⬅ 时间片用完</span>
                  </div>

                  <div style={{ background: '#1e293b', border: '2px solid #f59e0b', borderRadius: '8px', padding: '12px 10px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 'bold' }}>03. 执行态</span>
                    <strong style={{ display: 'block', fontSize: '1.05rem', color: '#fbbf24', margin: '3px 0' }}>RUNNING</strong>
                    <small style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>单核 CPU 独占运算<br />执行机器指令</small>
                  </div>
                </div>

                {/* 阻塞态 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#0f172a', padding: '10px', borderRadius: '8px', border: '1px dashed #475569' }}>
                  <div style={{ textAlign: 'left', paddingLeft: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#34d399' }}>⬅ 事件就绪 / I/O 中断唤醒</span>
                  </div>
                  <div style={{ textAlign: 'right', paddingRight: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>等待事件 / 请求 I/O ⬇</span>
                  </div>
                  <div style={{ gridColumn: '1 / 3', background: '#1e293b', border: '1.5px solid #ef4444', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 'bold' }}>04. 阻塞态 (BLOCKED / WAITING)</span>
                    <small style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px' }}>
                      因等待磁盘 I/O、键盘输入或信号量 P 操作而暂停，即使 CPU 空闲也无法运行
                    </small>
                  </div>
                </div>
              </div>

              {/* 5. 终止态 */}
              <div style={{ background: '#1e293b', border: '1.5px solid #64748b', borderRadius: '8px', padding: '12px 8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 'bold' }}>05. 终止态</span>
                <strong style={{ display: 'block', fontSize: '1rem', color: '#94a3b8', margin: '4px 0' }}>TERMINATED</strong>
                <small style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>exit() 结束退出<br />回收内存与 PCB</small>
              </div>
            </div>
          </div>

          <div className="sched-footer-tip">
            💡 <strong>状态转换核心准则</strong>：阻塞态<strong>不能直接转入执行态</strong>，必须先被唤醒回到就绪态，等待调度器重新分派 CPU！
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

function ProcessFiveStateLab() {
  const [procs, setProcs] = useState([
    {
      pid: 101,
      name: 'P1 (代码编译)',
      state: 'ready', // 'new' | 'ready' | 'running' | 'blocked' | 'terminated'
      pc: '0x00401200',
      registers: { ax: 24, bx: 10, sp: '0x7FF4' },
      priority: 2,
      totalBurst: 8,
      remainingBurst: 5,
      waitCount: 2,
      blockReason: null,
    },
    {
      pid: 102,
      name: 'P2 (浏览器标签)',
      state: 'ready',
      pc: '0x00402480',
      registers: { ax: 3, bx: 128, sp: '0x7FE0' },
      priority: 1,
      totalBurst: 4,
      remainingBurst: 4,
      waitCount: 1,
      blockReason: null,
    },
    {
      pid: 103,
      name: 'P3 (音频渲染)',
      state: 'running',
      pc: '0x00403110',
      registers: { ax: 105, bx: 88, sp: '0x7FD8' },
      priority: 1,
      totalBurst: 10,
      remainingBurst: 7,
      waitCount: 0,
      blockReason: null,
    },
    {
      pid: 104,
      name: 'P4 (数据库拉取)',
      state: 'blocked',
      pc: '0x004040A0',
      registers: { ax: 0, bx: 512, sp: '0x7FB0' },
      priority: 3,
      totalBurst: 6,
      remainingBurst: 3,
      waitCount: 4,
      blockReason: '等待磁盘读取数据块 #108',
    },
  ])

  const [selectedPid, setSelectedPid] = useState(103)
  const [logs, setLogs] = useState([
    { time: '00:00', text: '五状态进程管理模型就绪：就绪队列 2 个，执行态 1 个 (P3)，阻塞态 1 个 (P4)。', type: 'info' }
  ])

  const addLog = (text, type = 'info') => {
    const time = new Date().toTimeString().split(' ')[0]
    setLogs(prev => [{ time, text, type }, ...prev.slice(0, 18)])
  }

  const selectedProc = procs.find(p => p.pid === selectedPid) || procs[0]

  // 1. 创建新进程 (fork)
  const handleCreate = () => {
    const nextPid = Math.max(...procs.map(p => p.pid), 100) + 1
    const bursts = [4, 6, 8, 12]
    const chosenBurst = bursts[Math.floor(Math.random() * bursts.length)]
    const newP = {
      pid: nextPid,
      name: `P${nextPid} (新任务)`,
      state: 'new',
      pc: '0x00405000',
      registers: { ax: 0, bx: 0, sp: '0x7FA0' },
      priority: Math.floor(Math.random() * 3) + 1,
      totalBurst: chosenBurst,
      remainingBurst: chosenBurst,
      waitCount: 0,
      blockReason: null,
    }

    setProcs(prev => [...prev, newP])
    setSelectedPid(nextPid)
    addLog(`[fork] 操作系统创建进程 P${nextPid}，分配 PCB 结构，进入创建态 (NEW)`, 'info')

    // 600ms 后自动提交进就绪队列 (Admit)
    setTimeout(() => {
      setProcs(prev => prev.map(p => p.pid === nextPid ? { ...p, state: 'ready' } : p))
      addLog(`[Admit] 进程 P${nextPid} 所需内存与 PCB 初始化完毕，提交至就绪队列 (READY)`, 'success')
    }, 600)
  }

  // 2. 调度分派 (Dispatch)
  const handleDispatch = () => {
    const running = procs.find(p => p.state === 'running')
    if (running) {
      addLog(`[调度受阻] CPU 核心已被 ${running.name} 独占！请先触发时间片用完 (Timeout) 或 I/O 阻塞 (Block)。`, 'warning')
      return
    }

    const readyProc = procs.find(p => p.state === 'ready')
    if (!readyProc) {
      addLog('[就绪队列为空] 没有处于就绪态的进程可供调度分派。', 'warning')
      return
    }

    setProcs(prev => prev.map(p => p.pid === readyProc.pid ? { ...p, state: 'running' } : p))
    setSelectedPid(readyProc.pid)
    addLog(`[Dispatch] 调度程序选中 ${readyProc.name}，分配单核 CPU，状态切换为 RUNNING！`, 'success')
  }

  // 3. 时钟中断 / 时间片耗尽 (Timeout)
  const handleTimeout = () => {
    const running = procs.find(p => p.state === 'running')
    if (!running) {
      addLog('[无执行进程] 当前 CPU 处于空闲 IDLE 状态，无时间片中断。', 'warning')
      return
    }

    setProcs(prev => prev.map(p => {
      if (p.pid === running.pid) {
        return {
          ...p,
          state: 'ready',
          pc: `0x0040${Math.floor(Math.random() * 8000 + 1000).toString(16)}`,
          registers: { ...p.registers, ax: p.registers.ax + 1 }
        }
      }
      return p
    }))
    addLog(`[Timeout] 硬件时钟中断！${running.name} 时间片耗尽，剥离 CPU，重回就绪队列尾部 (READY)。`, 'info')
  }

  // 4. 发起 I/O 阻塞 (Block)
  const handleBlock = () => {
    const running = procs.find(p => p.state === 'running')
    if (!running) {
      addLog('[无执行进程] 只有正在运行的进程才能发起 I/O 系统调用。', 'warning')
      return
    }

    setProcs(prev => prev.map(p => {
      if (p.pid === running.pid) {
        return {
          ...p,
          state: 'blocked',
          blockReason: '等待磁盘读入数据块 (read syscall)'
        }
      }
      return p
    }))
    addLog(`[Event Wait] ${running.name} 发起 I/O 系统调用，主动让出 CPU，进入阻塞态 (BLOCKED)。`, 'warning')
  }

  // 5. I/O 中断唤醒 (Wakeup)
  const handleWakeup = () => {
    const blockedProc = procs.find(p => p.state === 'blocked')
    if (!blockedProc) {
      addLog('[无阻塞进程] 当前阻塞队列为空，无进程等待唤醒。', 'warning')
      return
    }

    setProcs(prev => prev.map(p => {
      if (p.pid === blockedProc.pid) {
        return { ...p, state: 'ready', blockReason: null }
      }
      return p
    }))
    addLog(`[Event Occurs] 磁盘外设发送 I/O 中断！数据已就绪，唤醒 ${blockedProc.name} 进入就绪队列 (READY)！`, 'success')
  }

  // 6. 进程正常退出终止 (Exit)
  const handleExit = () => {
    const running = procs.find(p => p.state === 'running')
    if (!running) {
      addLog('[无执行进程] 当前没有正在运行的进程可供退出。', 'warning')
      return
    }

    setProcs(prev => prev.map(p => {
      if (p.pid === running.pid) {
        return { ...p, state: 'terminated', remainingBurst: 0 }
      }
      return p
    }))
    addLog(`[Release] ${running.name} 调用 exit(0) 执行结束，转入终止态 (TERMINATED)，操作系统回收物理资源与 PCB。`, 'info')
  }

  // 7. 单步推进时钟周期 (Clock Tick)
  const handleTick = () => {
    let message = ''
    setProcs(prev => {
      return prev.map(p => {
        if (p.state === 'running') {
          const nextRemain = Math.max(0, p.remainingBurst - 1)
          if (nextRemain === 0) {
            message = `[时钟节拍] ${p.name} 计算全部完毕，调用 exit() 进入 TERMINATED 终止态！`
            return { ...p, state: 'terminated', remainingBurst: 0 }
          }
          message = `[时钟节拍] ${p.name} 消耗 1 单位 CPU 算力，剩余需求: ${nextRemain}`
          return { ...p, remainingBurst: nextRemain }
        }
        if (p.state === 'ready') {
          return { ...p, waitCount: p.waitCount + 1 }
        }
        return p
      })
    })
    if (message) addLog(message, 'info')
  }

  const handleReset = () => {
    setProcs([
      {
        pid: 101,
        name: 'P1 (代码编译)',
        state: 'ready',
        pc: '0x00401200',
        registers: { ax: 24, bx: 10, sp: '0x7FF4' },
        priority: 2,
        totalBurst: 8,
        remainingBurst: 5,
        waitCount: 2,
        blockReason: null,
      },
      {
        pid: 102,
        name: 'P2 (浏览器标签)',
        state: 'ready',
        pc: '0x00402480',
        registers: { ax: 3, bx: 128, sp: '0x7FE0' },
        priority: 1,
        totalBurst: 4,
        remainingBurst: 4,
        waitCount: 1,
        blockReason: null,
      },
      {
        pid: 103,
        name: 'P3 (音频渲染)',
        state: 'running',
        pc: '0x00403110',
        registers: { ax: 105, bx: 88, sp: '0x7FD8' },
        priority: 1,
        totalBurst: 10,
        remainingBurst: 7,
        waitCount: 0,
        blockReason: null,
      },
      {
        pid: 104,
        name: 'P4 (数据库拉取)',
        state: 'blocked',
        pc: '0x004040A0',
        registers: { ax: 0, bx: 512, sp: '0x7FB0' },
        priority: 3,
        totalBurst: 6,
        remainingBurst: 3,
        waitCount: 4,
        blockReason: '等待磁盘读取数据块 #108',
      },
    ])
    setSelectedPid(103)
    addLog('已重置五状态模型到初始状态。', 'info')
  }

  const newPool = procs.filter(p => p.state === 'new')
  const readyPool = procs.filter(p => p.state === 'ready')
  const runningPool = procs.filter(p => p.state === 'running')
  const blockedPool = procs.filter(p => p.state === 'blocked')
  const terminatedPool = procs.filter(p => p.state === 'terminated')

  return (
    <>
      <div className="explore-heading">
        <span>自由探索 · 进程五状态转换与 PCB 演进</span>
        <h2>进程五状态生命周期沙盘 (Process Lifecycle)</h2>
        <p>
          创建态 (New)、就绪态 (Ready)、执行态 (Running)、阻塞态 (Blocked) 与终止态 (Terminated) 的全流向可交互推演；点击任意进程卡片实时透视其 PCB 核心字段。
        </p>
      </div>

      <div className="lab-layout" style={{ gridTemplateColumns: '320px 1fr' }}>
        {/* 左侧控制台 */}
        <aside className="control-panel">
          <div className="panel-title">
            <span>状态机事件触发器</span>
            <i>系统调用与中断</i>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              className="btn btn-primary"
              style={{ padding: '9px 12px', fontSize: '0.88rem', fontWeight: 'bold' }}
              onClick={handleCreate}
            >
              ＋ 创建新进程 (fork ➔ New)
            </button>

            <button
              className="btn btn-success"
              style={{ padding: '9px 12px', fontSize: '0.88rem', fontWeight: 'bold', background: '#10b981', color: '#fff', border: 'none' }}
              onClick={handleDispatch}
            >
              ➔ 调度分派 (Dispatch ➔ Running)
            </button>

            <button
              className="btn btn-warning"
              style={{ padding: '9px 12px', fontSize: '0.88rem', fontWeight: 'bold', background: '#f59e0b', color: '#1e293b', border: 'none' }}
              onClick={handleTimeout}
            >
              ⏱️ 时钟中断 (Timeout ➔ Ready)
            </button>

            <button
              className="btn btn-danger"
              style={{ padding: '9px 12px', fontSize: '0.88rem', fontWeight: 'bold', background: '#ef4444', color: '#fff', border: 'none' }}
              onClick={handleBlock}
            >
              ⏳ 发起 I/O 阻塞 (Wait ➔ Blocked)
            </button>

            <button
              className="btn btn-secondary"
              style={{ padding: '9px 12px', fontSize: '0.88rem', fontWeight: 'bold', background: '#0284c7', color: '#fff', border: 'none' }}
              onClick={handleWakeup}
            >
              ⚡ I/O 完成唤醒 (Wakeup ➔ Ready)
            </button>

            <button
              className="btn btn-secondary"
              style={{ padding: '9px 12px', fontSize: '0.88rem', fontWeight: 'bold', background: '#475569', color: '#fff', border: 'none' }}
              onClick={handleExit}
            >
              ✓ 进程正常退出 (Exit ➔ Terminated)
            </button>
          </div>

          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #cbd5e1' }}>
            <button
              className="btn btn-secondary"
              style={{ width: '100%', padding: '9px', fontWeight: 'bold', background: '#334155', color: '#fff', border: 'none' }}
              onClick={handleTick}
            >
              ▶ 单步推进时钟 (CPU 时钟 +1)
            </button>
          </div>

          <div style={{ marginTop: '10px' }}>
            <button className="btn btn-secondary" style={{ width: '100%', padding: '8px' }} onClick={handleReset}>
              重置进程沙盘
            </button>
          </div>

          {/* 状态统计看板 */}
          <div style={{ marginTop: '14px', padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
            <div style={{ fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>系统进程状态概览</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', color: '#64748b' }}>
              <span>创建中: <b style={{ color: '#a855f7' }}>{newPool.length}</b></span>
              <span>就绪队列: <b style={{ color: '#10b981' }}>{readyPool.length}</b></span>
              <span>独占 CPU: <b style={{ color: '#f59e0b' }}>{runningPool.length}</b></span>
              <span>阻塞挂起: <b style={{ color: '#ef4444' }}>{blockedPool.length}</b></span>
              <span>已终止: <b style={{ color: '#64748b' }}>{terminatedPool.length}</b></span>
              <span>总进程数: <b>{procs.length}</b></span>
            </div>
          </div>
        </aside>

        {/* 右侧展示面板 */}
        <section className="visual-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="visual-toolbar">
            <div>
              <strong>五状态生命周期流向沙盘</strong>
              <span>点击任意进程卡片，可在下方实时透视其 PCB 详细结构。</span>
            </div>
            <span className="source-chip">当前聚焦: P{selectedProc ? selectedProc.pid : '—'}</span>
          </div>

          {/* 五状态沙盘地图 */}
          <div style={{ background: '#0a101d', border: '1.5px solid #1e293b', borderRadius: '10px', padding: '16px' }}>
            {/* 上部主干：NEW ➔ READY ⇄ RUNNING ➔ TERMINATED */}
            <div style={{ display: 'grid', gridTemplateColumns: '130px auto 1fr auto 160px auto 120px', gap: '6px', alignItems: 'center' }}>
              {/* 1. 创建态 NEW */}
              <div style={{ background: '#1e293b', border: '1.5px dashed #a855f7', borderRadius: '8px', padding: '10px 8px', minHeight: '120px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ color: '#a855f7', fontSize: '0.82rem' }}>创建态 NEW</strong>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{newPool.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {newPool.length === 0 ? (
                    <span style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center', marginTop: '20px' }}>无新建任务</span>
                  ) : (
                    newPool.map(p => (
                      <div
                        key={p.pid}
                        onClick={() => setSelectedPid(p.pid)}
                        style={{
                          background: selectedPid === p.pid ? '#9333ea' : '#334155',
                          color: '#fff',
                          padding: '4px 6px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        P{p.pid} 申请PCB中
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 连线 1: Admit */}
              <div style={{ textAlign: 'center', padding: '0 4px' }}>
                <span style={{ fontSize: '0.7rem', color: '#a855f7' }}>Admit</span>
                <div style={{ color: '#a855f7', fontWeight: 'bold' }}>➔</div>
              </div>

              {/* 2. 就绪态 READY */}
              <div style={{ background: '#1e293b', border: '2px solid #10b981', borderRadius: '8px', padding: '10px 8px', minHeight: '120px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ color: '#34d399', fontSize: '0.85rem' }}>就绪队列 (READY)</strong>
                  <span style={{ fontSize: '0.75rem', color: '#10b981' }}>{readyPool.length} 个进程</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {readyPool.length === 0 ? (
                    <span style={{ fontSize: '0.75rem', color: '#64748b', width: '100%', textAlign: 'center', marginTop: '20px' }}>就绪队列空闲</span>
                  ) : (
                    readyPool.map(p => (
                      <div
                        key={p.pid}
                        onClick={() => setSelectedPid(p.pid)}
                        style={{
                          background: selectedPid === p.pid ? '#059669' : '#0f172a',
                          border: `1.5px solid ${selectedPid === p.pid ? '#34d399' : '#334155'}`,
                          color: '#f8fafc',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          minWidth: '95px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong>P{p.pid}</strong>
                          <small style={{ color: '#94a3b8' }}>pri:{p.priority}</small>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#93c5fd' }}>剩余需求:{p.remainingBurst}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 连线 2: 调度与超时双向 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center', padding: '0 6px' }}>
                <div style={{ fontSize: '0.68rem', color: '#10b981' }}>分派 ➔</div>
                <div style={{ fontSize: '0.68rem', color: '#f59e0b' }}>⬅ 超时</div>
              </div>

              {/* 3. 执行态 RUNNING */}
              <div style={{ background: '#1e293b', border: '2px solid #f59e0b', borderRadius: '8px', padding: '10px 8px', minHeight: '120px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ color: '#fbbf24', fontSize: '0.85rem' }}>执行态 (RUNNING)</strong>
                  <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>单核 CPU 核心</span>
                </div>
                {runningPool.length > 0 ? (
                  <div
                    onClick={() => setSelectedPid(runningPool[0].pid)}
                    style={{
                      background: '#78350f',
                      border: '1.5px solid #f59e0b',
                      borderRadius: '6px',
                      padding: '8px',
                      cursor: 'pointer',
                      color: '#fff',
                      boxShadow: '0 0 12px rgba(245, 158, 11, 0.3)'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{runningPool[0].name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#fde68a', marginTop: '2px' }}>
                      剩余算力需求: {runningPool[0].remainingBurst}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '2px' }}>
                      PC: {runningPool[0].pc}
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '24px' }}>
                    CPU 空闲 (IDLE)
                  </div>
                )}
              </div>

              {/* 连线 3: 退出 */}
              <div style={{ textAlign: 'center', padding: '0 4px' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>exit()</span>
                <div style={{ color: '#64748b', fontWeight: 'bold' }}>➔</div>
              </div>

              {/* 5. 终止态 TERMINATED */}
              <div style={{ background: '#1e293b', border: '1.5px dashed #64748b', borderRadius: '8px', padding: '10px 8px', minHeight: '120px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ color: '#94a3b8', fontSize: '0.82rem' }}>终止态 EXIT</strong>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{terminatedPool.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {terminatedPool.length === 0 ? (
                    <span style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center', marginTop: '20px' }}>无已结束进程</span>
                  ) : (
                    terminatedPool.map(p => (
                      <div
                        key={p.pid}
                        onClick={() => setSelectedPid(p.pid)}
                        style={{
                          background: selectedPid === p.pid ? '#475569' : '#0f172a',
                          color: '#94a3b8',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          cursor: 'pointer'
                        }}
                      >
                        P{p.pid} (已回收)
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 下部：阻塞态 BLOCKED 与双向流 */}
            <div style={{ marginTop: '14px', background: '#0f172a', border: '1.5px solid #ef4444', borderRadius: '8px', padding: '10px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ color: '#f87171', fontSize: '0.85rem' }}>4. 阻塞态队列 (BLOCKED / WAITING)</strong>
                  <span style={{ fontSize: '0.75rem', color: '#fca5a5' }}>等待 I/O 或同步信号量，放弃 CPU</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                  流向准则: 执行态 ➔ 阻塞态 ➔ 唤醒回到就绪态 (禁止直接进执行态)
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '40px', alignItems: 'center' }}>
                {blockedPool.length === 0 ? (
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>当前无阻塞进程</span>
                ) : (
                  blockedPool.map(p => (
                    <div
                      key={p.pid}
                      onClick={() => setSelectedPid(p.pid)}
                      style={{
                        background: selectedPid === p.pid ? '#991b1b' : '#1e293b',
                        border: '1.5px solid #ef4444',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: '#fef2f2',
                        fontSize: '0.8rem'
                      }}
                    >
                      <strong>{p.name}</strong>
                      <div style={{ fontSize: '0.72rem', color: '#fca5a5', marginTop: '2px' }}>
                        {p.blockReason || '等待事件'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* PCB (Process Control Block) 实时透视镜 */}
          {selectedProc && (
            <div style={{ background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '8px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>进程控制块 PCB 实时镜像 (PID: {selectedProc.pid})</strong>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    background:
                      selectedProc.state === 'running' ? '#fef3c7' :
                      selectedProc.state === 'ready' ? '#ecfdf5' :
                      selectedProc.state === 'blocked' ? '#fee2e2' :
                      selectedProc.state === 'new' ? '#f3e8ff' : '#f1f5f9',
                    color:
                      selectedProc.state === 'running' ? '#b45309' :
                      selectedProc.state === 'ready' ? '#047857' :
                      selectedProc.state === 'blocked' ? '#b91c1c' :
                      selectedProc.state === 'new' ? '#7e22ce' : '#64748b'
                  }}>
                    当前状态: {selectedProc.state.toUpperCase()}
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>进程名: {selectedProc.name}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', fontSize: '0.8rem' }}>
                <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.72rem' }}>程序计数器 (PC)</span>
                  <div style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#1e293b', marginTop: '2px' }}>
                    {selectedProc.pc}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.72rem' }}>寄存器上下文快照</span>
                  <div style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#1e293b', marginTop: '2px' }}>
                    AX={selectedProc.registers.ax}, BX={selectedProc.registers.bx}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.72rem' }}>栈指针 (SP) / 优先级</span>
                  <div style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#1e293b', marginTop: '2px' }}>
                    {selectedProc.registers.sp} · Pri {selectedProc.priority}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.72rem' }}>执行与等待记账</span>
                  <div style={{ fontWeight: 'bold', color: '#1e293b', marginTop: '2px' }}>
                    已用 {selectedProc.totalBurst - selectedProc.remainingBurst} / 等待 {selectedProc.waitCount}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 内核事件流水日志 */}
          <div style={{ background: '#0f172a', borderRadius: '6px', padding: '12px 16px', color: '#f8fafc', fontFamily: 'monospace' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', borderBottom: '1px solid #334155', paddingBottom: '4px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>操作系统内核事件流水 (Kernel Event Trace)</span>
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>原子调度日志</span>
            </div>
            <div style={{ maxHeight: '130px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {logs.map((l, i) => (
                <div key={i} style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                  <span style={{ color: '#64748b', marginRight: '6px' }}>[{l.time}]</span>
                  <span style={{
                    color: l.type === 'error' ? '#f87171' :
                           l.type === 'warning' ? '#fbbf24' :
                           l.type === 'success' ? '#34d399' : '#93c5fd'
                  }}>
                    {l.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default function SchedulingExperiment({ experiment }) {
  const [activeTab, setActiveTab] = useState('lifecycle') // 'lifecycle' | 'scheduling'
  const [processes, setProcesses] = useState(initialProcesses)
  const [algorithm, setAlgorithm] = useState('fcfs')
  const [quantum, setQuantum] = useState(2)
  const [arrivalMode, setArrivalMode] = useState('simultaneous') // 'simultaneous' | 'staggered'

  const result = useMemo(() => scheduleProcesses(processes, algorithm, quantum), [processes, algorithm, quantum])

  function updateBurst(index, burst) {
    setProcesses((current) => current.map((p, i) => i === index ? { ...p, burst: Math.max(1, burst) } : p))
  }

  function updateArrival(index, arrival) {
    setProcesses((current) => current.map((p, i) => i === index ? { ...p, arrival: Math.max(0, arrival) } : p))
  }

  function switchArrivalMode(mode) {
    setArrivalMode(mode)
    if (mode === 'simultaneous') {
      setProcesses((current) => current.map((p) => ({ ...p, arrival: 0 })))
    } else {
      setProcesses(staggeredProcesses)
    }
  }

  return (
    <>
      <ExperimentHeader experiment={experiment} eyebrow="操作系统实验 01 · 进程管理与调度" />
      <SchedulingStory />
      <TheoryPrimer
        title="进程生命周期与 CPU 调度原理"
        intro="进程是操作系统分配资源与调度的核心实体。进程从创建到终止在五大状态间流转；当多个就绪进程争抢有限的 CPU 核心时，调度算法负责在响应度、等待时间与切换开销之间权衡。"
        formula="周转时间 = 完成时刻 − 到达时刻；等待时间 = 周转时间 − 实际运行时间"
        concepts={[
          { term: '五状态模型', description: '创建态(New)、就绪态(Ready)、执行态(Running)、阻塞态(Blocked)与终止态(Terminated)。' },
          { term: '进程控制块 (PCB)', description: '操作系统管理进程的核心数据结构，记录 PID、程序计数器 PC、通用寄存器快照与优先级。' },
          { term: '调度与切换', description: '调度器从就绪队列挑选进程投入 CPU，时钟中断或 I/O 等待触发上下文切换保存与恢复 PCB。' },
        ]}
        goal="先在五状态模型中观察进程在 New、Ready、Running、Blocked、Terminated 之间的转换与 PCB 演变，再深入甘特图对比 FCFS、SJF 与 RR 调度算法指标。"
      />

      {/* 模块模式切换 Tab */}
      <div className="number-tabs" style={{ maxWidth: '580px', margin: '24px 0 20px' }}>
        <button
          className={activeTab === 'lifecycle' ? 'active' : ''}
          onClick={() => setActiveTab('lifecycle')}
        >
          1. 进程五状态模型与 PCB
        </button>
        <button
          className={activeTab === 'scheduling' ? 'active' : ''}
          onClick={() => setActiveTab('scheduling')}
        >
          2. CPU 调度算法与甘特图
        </button>
      </div>

      {activeTab === 'lifecycle' && <ProcessFiveStateLab />}

      {activeTab === 'scheduling' && (
        <>
          <div className="explore-heading">
            <span>自由探索 · 参数化甘特图时序实验</span>
            <h2>动态调整到达与运行时间，透视不同算法的指标计算</h2>
            <p>自定义各进程的到达时间 (Arrival) 与运行时间 (Burst)，观察实时甘特图时序、进程指标数据表与公式代入展开过程。</p>
          </div>

      <div className="lab-layout">
        <aside className="control-panel">
          <div className="panel-title">
            <span>调度参数配置</span>
            <i>{arrivalMode === 'simultaneous' ? '全部同时到达 (t=0)' : '错峰动态到达'}</i>
          </div>

          <div className="sched-mode-toggle-group">
            <button
              type="button"
              className={`mode-btn ${arrivalMode === 'simultaneous' ? 'active' : ''}`}
              onClick={() => switchArrivalMode('simultaneous')}
            >
              ⚡ 全部同时到达 (t=0)
            </button>
            <button
              type="button"
              className={`mode-btn ${arrivalMode === 'staggered' ? 'active' : ''}`}
              onClick={() => switchArrivalMode('staggered')}
            >
              ⏱️ 错峰动态到达
            </button>
          </div>

          <label className="field-block">
            <span>调度算法</span>
            <small>{algorithmHelp(algorithm)}</small>
            <select value={algorithm} onChange={(event) => setAlgorithm(event.target.value)}>
              <option value="fcfs">FCFS 先来先服务</option>
              <option value="sjf">SJF 短作业优先 (非抢占)</option>
              <option value="rr">RR 时间片轮转</option>
            </select>
          </label>

          {algorithm === 'rr' && (
            <label className="range-field">
              <span><b>时间片 Quantum</b><i>{quantum} 单位</i></span>
              <small>每个进程一次最多运行多久。越小越公平，但上下文切换通常越频繁。</small>
              <input type="range" min="1" max="5" value={quantum} onChange={(event) => setQuantum(Number(event.target.value))} />
            </label>
          )}

          <div className="process-editor enhanced-proc-editor">
            <div className="editor-title-row">
              <span>作业时序参数设置</span>
              <small>自由微调到达与运行耗时</small>
            </div>
            {processes.map((process, index) => (
              <div className="proc-edit-row" key={process.id}>
                <b className="proc-color-tag" style={{ background: colors[index] }}>{process.id}</b>
                <div className="proc-input-pair">
                  <label className="sub-input-label">
                    <span>到达</span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={process.arrival}
                      onChange={(e) => updateArrival(index, Number(e.target.value))}
                    />
                  </label>
                  <label className="sub-input-label">
                    <span>运行</span>
                    <input
                      type="number"
                      min="1"
                      max="16"
                      value={process.burst}
                      onChange={(e) => updateBurst(index, Number(e.target.value))}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="live-explanation" key={`${algorithm}-${quantum}-${arrivalMode}`}>
            <span>当前策略分析</span>
            <strong>
              {algorithm === 'fcfs'
                ? '先来先服务：完全按到达时间排队，长任务霸占 CPU 时短任务等待时间长。'
                : algorithm === 'sjf'
                ? '短作业优先：在已到达的任务中挑选最短者，平均等待时间通常最低。'
                : `时间片轮转：每次最多轮流运行 ${quantum} 个时间片，兼顾各作业响应速度。`}
            </strong>
            <p>下方数据表会根据你的参数改动，实时更新每个作业的完成、周转与等待时间指标！</p>
          </div>
        </aside>

        <section className="visual-panel scheduling-panel">
          <div className="visual-toolbar">
            <div>
              <strong>CPU 调度甘特图 (Gantt Chart)</strong>
              <span>{algorithm.toUpperCase()} · 总完成时刻 {result.total} · 上下文切换 {result.contextSwitches} 次</span>
            </div>
          </div>

          {/* 顶部指标统计栏 */}
          <div className="metric-grid sched-metric-grid">
            <div className="metric-box-highlight">
              <span>平均等待时间</span>
              <strong>{result.averageWait.toFixed(2)}</strong>
              <small>各作业等待时长均值</small>
            </div>
            <div className="metric-box-highlight">
              <span>平均周转时间</span>
              <strong>{result.averageTurnaround.toFixed(2)}</strong>
              <small>从到达至完成全流程均值</small>
            </div>
            <div>
              <span>上下文切换</span>
              <strong>{result.contextSwitches} 次</strong>
              <small>进程切换保存/恢复开销</small>
            </div>
            <div>
              <span>CPU 总时长</span>
              <strong>{result.total} 单位</strong>
              <small>甘特图终点时间</small>
            </div>
          </div>

          {/* 甘特图渲染 */}
          <div className="gantt-wrap enhanced-gantt-wrap">
            <div className="gantt-chart">
              {result.timeline.map((block, index) => {
                const processIndex = processes.findIndex((p) => p.id === block.id)
                const widthPercent = result.total > 0 ? ((block.end - block.start) / result.total) * 100 : 0
                if (block.isIdle) {
                  return (
                    <div
                      key={`idle-${index}`}
                      className="gantt-block idle-block"
                      style={{ width: `${widthPercent}%` }}
                      title={`CPU 空闲: ${block.start} → ${block.end}`}
                    >
                      <strong>IDLE</strong>
                      <span>空闲 {block.end - block.start}</span>
                    </div>
                  )
                }
                return (
                  <div
                    key={`${block.id}-${index}`}
                    className="gantt-block"
                    style={{ width: `${widthPercent}%`, background: colors[processIndex] }}
                    title={`${block.id}: ${block.start} → ${block.end} (运行 ${block.end - block.start} 单位)`}
                  >
                    <strong>{block.id}</strong>
                    <span>{block.end - block.start}</span>
                  </div>
                )
              })}
            </div>
            <div className="gantt-axis">
              <span>0</span>
              {result.timeline.map((block, index) => (
                <span
                  key={`${block.id}-time-${index}`}
                  style={{ left: `${result.total > 0 ? (block.end / result.total) * 100 : 0}%` }}
                >
                  {block.end}
                </span>
              ))}
            </div>
          </div>

          {/* 1. 详细作业调度与执行数据表 */}
          <div className="sched-detail-table-container">
            <div className="table-caption-bar">
              <div className="table-title">
                <strong>📊 每个作业到达、运行、完成与等待时间明细表</strong>
                <span>根据甘特图执行时序实时精确计算</span>
              </div>
              <span className="table-mode-badge">{arrivalMode === 'simultaneous' ? '全部 t=0 同时到达' : '错峰动态到达'}</span>
            </div>

            <table className="sched-process-table">
              <thead>
                <tr>
                  <th>作业 / 进程</th>
                  <th>到达时间 (Arrival)</th>
                  <th>运行时间 (Burst)</th>
                  <th>完成时刻 (Completion)</th>
                  <th>周转时间 (Turnaround)</th>
                  <th>等待时间 (Waiting)</th>
                  <th>带权周转时间</th>
                </tr>
              </thead>
              <tbody>
                {result.processStats.map((p, idx) => (
                  <tr key={p.id}>
                    <td>
                      <div className="td-proc-cell">
                        <span className="dot" style={{ background: colors[idx] }} />
                        <strong>{p.id}</strong>
                      </div>
                    </td>
                    <td><span className="num-pill">{p.arrival}</span></td>
                    <td><span className="num-pill">{p.burst}</span></td>
                    <td><strong className="hl-num">{p.completion}</strong></td>
                    <td><span className="num-result">{p.turnaround}</span></td>
                    <td><strong className="hl-wait">{p.waiting}</strong></td>
                    <td><span>{p.weightedTurnaround}</span></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="summary-foot-row">
                  <td colSpan={4}><strong>平均统计均值 (Average Metrics)</strong></td>
                  <td><strong className="avg-val">{result.averageTurnaround.toFixed(2)}</strong></td>
                  <td><strong className="avg-val hl-wait-avg">{result.averageWait.toFixed(2)}</strong></td>
                  <td><strong>{result.averageWeightedTurnaround.toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 2. 核心公式与代入展开过程板 */}
          <div className="sched-formulas-card">
            <div className="formulas-card-header">
              <strong>📐 进程调度核心计算公式与当前代入演算过程</strong>
              <span>考研与操作系统实验核心考点</span>
            </div>

            <div className="formulas-definitions-grid">
              <div className="formula-def-item">
                <span className="def-tag">周转时间 (Turnaround Time)</span>
                <code>周转时间 $T_i$ = 完成时刻 $C_i$ − 到达时刻 $A_i$</code>
                <small>作业从提交进入系统到完全结束的总历时</small>
              </div>

              <div className="formula-def-item">
                <span className="def-tag">等待时间 (Waiting Time)</span>
                <code>等待时间 $W_i$ = 周转时间 $T_i$ − 实际运行时间 $B_i$</code>
                <small>作业在就绪队列中排队等待 CPU 的累计净时间</small>
              </div>

              <div className="formula-def-item">
                <span className="def-tag">带权周转时间 (Weighted Turnaround)</span>
                <code>带权周转时间 $W'_i$ = 周转时间 $T_i$ ÷ 实际运行时间 $B_i$</code>
                <small>反映作业等待相对耗时比率（越接近 1 越理想）</small>
              </div>
            </div>

            {/* 动态带入公式演算栏 */}
            <div className="formula-step-derivations">
              <div className="derivation-row">
                <div className="derivation-label">
                  <strong>平均等待时间 (Avg Waiting) 代入展开：</strong>
                  <span>{'公式：Avg W = ∑(各作业等待时间) ÷ 进程数 = (W1 + W2 + W3 + W4) ÷ 4'}</span>
                </div>
                <div className="derivation-calc-box">
                  <code>{result.waitFormula}</code>
                </div>
              </div>

              <div className="derivation-row">
                <div className="derivation-label">
                  <strong>平均周转时间 (Avg Turnaround) 代入展开：</strong>
                  <span>{'公式：Avg T = ∑(各作业周转时间) ÷ 进程数 = (T1 + T2 + T3 + T4) ÷ 4'}</span>
                </div>
                <div className="derivation-calc-box">
                  <code>{result.turnaroundFormula}</code>
                </div>
              </div>
            </div>
          </div>

          <div className="algorithm-note enhanced-note">
            <strong>{algorithm === 'fcfs' ? '先来先服务 (FCFS)' : algorithm === 'sjf' ? '短作业优先 (SJF)' : '时间片轮转 (RR)'}</strong>
            <p>
              {algorithm === 'fcfs'
                ? '按到达时刻排序一直运行至完成，无抢占。简单易实现，但长作业在前面会导致后续短任务等待时间激增（护航效应）。'
                : algorithm === 'sjf'
                ? '在已到达的任务中挑选 Burst 最小的执行。能拉低平均等待时间，但若短任务源源不断到来，长任务可能面临无限期饥饿。'
                : '按时间片 Q 轮流分派 CPU，保证各进程都有机会前进。时间片过大退化为 FCFS，时间片过小导致上下文切换频繁消耗算力。'}
            </p>
          </div>
        </section>
      </div>
      </>
    )}

      {activeTab === 'lifecycle' && (
        <LearningCycle
          experimentId="scheduling-lifecycle"
          prediction={{
            question: '在五状态模型中，处于阻塞态（Blocked）的进程能够直接被调度转入执行态（Running）吗？',
            options: ['可以，只要 CPU 空闲即可', '绝对不能，必须先被唤醒转入就绪态', '由当前进程优先级决定'],
            answer: '绝对不能，必须先被唤醒转入就绪态',
            explanation: '阻塞态进程尚未获得所需的外设数据或资源，即便 CPU 空闲它也无法执行；必须等待事件发生被唤醒进入就绪队列，再由调度器分派 CPU。'
          }}
          operation={{
            title: '演练一次完整的进程生命周期',
            instruction: '点击“＋ 创建新进程”，观察它进入创建态并提交至就绪态；点击“➔ 调度分派”进入执行态；点击“⏳ 发起 I/O 阻塞”将其挂起；再点击“⚡ I/O 完成唤醒”将其带回就绪队列，最后调度并“✓ 进程退出终止”。'
          }}
          observation="进程在操作系统中的生命周期完全受控于五状态机，PCB 保存着它的程序计数器 PC、通用寄存器上下文与优先级；调度器只在就绪态与执行态之间做分派。"
          summaryPrompt="为什么操作系统要区分就绪态和阻塞态？如果合并成一个‘等待态’会给调度器带来什么麻烦？"
        />
      )}

      {activeTab === 'scheduling' && (
        <LearningCycle
          experimentId="scheduling"
          prediction={{
            question: '所有进程同时到达时，哪种算法通常能降低平均等待时间？',
            options: ['FCFS 先来先服务', 'SJF 短作业优先', '随机选择'],
            answer: 'SJF 短作业优先',
            explanation: ' 让短任务先完成，可以减少更多任务的累计等待。',
          }}
          operation={{ title: '比较三种调度策略与到达时序', instruction: '切换为“错峰动态到达”，调整到达与运行时间，观察数据表各项指标和公式代入演算的变化。' }}
          observation={`${algorithm.toUpperCase()} 当前平均等待时间为 ${result.averageWait.toFixed(2)}，发生 ${result.contextSwitches} 次上下文切换。`}
          summaryPrompt="平均等待时间和调度公平性之间存在什么取舍？"
        />
      )}
    </>
  )
}

function algorithmHelp(algorithm) {
  if (algorithm === 'fcfs') return '按队列顺序一直运行到完成，几乎不考虑任务长短。'
  if (algorithm === 'sjf') return '优先执行运行时间最短的任务，通常能降低平均等待时间。'
  return '所有进程轮流获得固定时间片，强调及时响应与公平。'
}
