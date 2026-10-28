import React, { useMemo, useState } from 'react'
import { ExperimentHeader } from './AttentionExperiment'

const initialProcesses = [{ id: 'P1', burst: 6 }, { id: 'P2', burst: 3 }, { id: 'P3', burst: 8 }, { id: 'P4', burst: 2 }]
const colors = ['#6757d9', '#138a72', '#df6c3f', '#3675c5']

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
      <div className="lab-layout">
        <aside className="control-panel">
          <div className="panel-title"><span>调度参数</span><i>全部同时到达</i></div>
          <label className="field-block"><span>调度算法</span><select value={algorithm} onChange={(event) => setAlgorithm(event.target.value)}><option value="fcfs">FCFS 先来先服务</option><option value="sjf">SJF 短作业优先</option><option value="rr">RR 时间片轮转</option></select></label>
          {algorithm === 'rr' && <label className="range-field"><span><b>时间片 Quantum</b><i>{quantum}</i></span><input type="range" min="1" max="5" value={quantum} onChange={(event) => setQuantum(Number(event.target.value))} /></label>}
          <div className="process-editor"><span>CPU 运行时间</span>{processes.map((process, index) => <label key={process.id}><b style={{ background: colors[index] }}>{process.id}</b><input type="number" min="1" max="12" value={process.burst} onChange={(event) => updateBurst(index, Number(event.target.value))} /><i>单位</i></label>)}</div>
          <div className="tip-box"><strong>试一试</strong><p>将 P1 调大，再切换 SJF；或者在 RR 中改变时间片，观察切换次数如何变化。</p></div>
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
    </>
  )
}
