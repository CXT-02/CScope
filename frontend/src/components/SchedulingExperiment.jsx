import React, { useMemo, useState } from 'react'
import { ExperimentHeader } from './AttentionExperiment'
import LearningCycle from './LearningCycle'
import TheoryPrimer from './TheoryPrimer'

const initialProcesses = [{ id: 'P1', burst: 6 }, { id: 'P2', burst: 3 }, { id: 'P3', burst: 8 }, { id: 'P4', burst: 2 }]
const colors = ['#6558e8', '#159a83', '#ee6c4d', '#3977c3']

function schedule(processes, algorithm, quantum) {
  let timeline = []
  if (algorithm === 'fcfs' || algorithm === 'sjf') {
    const ordered = algorithm === 'sjf' ? [...processes].sort((a, b) => a.burst - b.burst) : processes
    let time = 0
    timeline = ordered.map((process) => {
      const block = { ...process, start: time, end: time + process.burst }
      time = block.end
      return block
    })
  } else {
    const queue = processes.map((process) => ({ ...process, remaining: process.burst }))
    let time = 0
    while (queue.some((process) => process.remaining > 0)) {
      queue.forEach((process) => {
        if (process.remaining <= 0) return
        const duration = Math.min(quantum, process.remaining)
        timeline.push({ ...process, start: time, end: time + duration })
        time += duration
        process.remaining -= duration
      })
    }
  }
  const completion = {}
  timeline.forEach((block) => { completion[block.id] = block.end })
  const waits = processes.map((process) => completion[process.id] - process.burst)
  return { timeline, averageWait: waits.reduce((sum, wait) => sum + wait, 0) / waits.length, total: timeline.at(-1)?.end || 0 }
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
