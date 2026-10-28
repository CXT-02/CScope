import React, { useMemo, useState } from 'react'
import { ExperimentHeader } from './AttentionExperiment'
import LearningCycle from './LearningCycle'

const nodes = [
  { id: 'A', x: 90, y: 190 }, { id: 'B', x: 230, y: 80 }, { id: 'C', x: 240, y: 285 },
  { id: 'D', x: 410, y: 100 }, { id: 'E', x: 430, y: 270 }, { id: 'F', x: 590, y: 185 },
]
const edges = [
  ['A', 'B', 4], ['A', 'C', 2], ['B', 'C', 1], ['B', 'D', 5],
  ['C', 'D', 8], ['C', 'E', 10], ['D', 'E', 2], ['D', 'F', 6], ['E', 'F', 3],
]

function buildSteps(start) {
  const distances = Object.fromEntries(nodes.map((node) => [node.id, Infinity]))
  const previous = {}
  const visited = new Set()
  const steps = []
  distances[start] = 0
  steps.push({ current: null, distances: { ...distances }, visited: [], previous: {}, message: `从节点 ${start} 出发，初始距离设为 0。` })
  while (visited.size < nodes.length) {
    const current = nodes.map((node) => node.id).filter((id) => !visited.has(id)).sort((a, b) => distances[a] - distances[b])[0]
    if (!current || distances[current] === Infinity) break
    visited.add(current)
    const updates = []
    edges.forEach(([a, b, weight]) => {
      const neighbor = a === current ? b : b === current ? a : null
      if (!neighbor || visited.has(neighbor)) return
      const candidate = distances[current] + weight
      if (candidate < distances[neighbor]) {
        distances[neighbor] = candidate
        previous[neighbor] = current
        updates.push(`${neighbor} 更新为 ${candidate}`)
      }
    })
    steps.push({ current, distances: { ...distances }, visited: [...visited], previous: { ...previous }, message: updates.length ? `确定 ${current}，松弛相邻边：${updates.join('，')}。` : `确定 ${current}，没有产生更短的候选路径。` })
  }
  return steps
}

export default function DijkstraExperiment({ experiment }) {
  const [start, setStart] = useState('A')
  const [stepIndex, setStepIndex] = useState(0)
  const steps = useMemo(() => buildSteps(start), [start])
  const step = steps[Math.min(stepIndex, steps.length - 1)]
  const pathEdges = new Set(Object.entries(step.previous).map(([to, from]) => [from, to].sort().join('-')))

  function changeStart(event) {
    setStart(event.target.value)
    setStepIndex(0)
  }

  return (
    <>
      <ExperimentHeader experiment={experiment} eyebrow="算法实验 02" />
      <div className="lab-layout">
        <aside className="control-panel">
          <div className="panel-title"><span>运行控制</span><i>逐步模式</i></div>
          <label className="field-block"><span>起点</span><select value={start} onChange={changeStart}>{nodes.map((node) => <option key={node.id}>{node.id}</option>)}</select></label>
          <div className="step-counter"><span>当前步骤</span><strong>{stepIndex} / {steps.length - 1}</strong></div>
          <input className="step-slider" type="range" min="0" max={steps.length - 1} value={stepIndex} onChange={(event) => setStepIndex(Number(event.target.value))} />
          <div className="step-buttons"><button type="button" disabled={stepIndex === 0} onClick={() => setStepIndex((value) => value - 1)}>← 上一步</button><button type="button" disabled={stepIndex === steps.length - 1} onClick={() => setStepIndex((value) => value + 1)}>下一步 →</button></div>
          <div className="explanation-box"><strong>这一步发生了什么？</strong><p>{step.message}</p></div>
          <div className="tip-box"><strong>核心规律</strong><p>每一步都选择尚未确定、且当前距离最小的节点。边权不能为负数。</p></div>
        </aside>
        <section className="visual-panel">
          <div className="visual-toolbar"><div><strong>图的最短路径搜索</strong><span>绿色：已确定 · 橙色：当前节点</span></div><button className="text-button" type="button" onClick={() => setStepIndex(0)}>重新开始</button></div>
          <svg className="graph-canvas" viewBox="0 0 680 380" role="img" aria-label="Dijkstra 最短路径图">
            {edges.map(([a, b, weight]) => {
              const from = nodes.find((node) => node.id === a)
              const to = nodes.find((node) => node.id === b)
              const selected = pathEdges.has([a, b].sort().join('-'))
              return <g key={`${a}-${b}`}><line x1={from.x} y1={from.y} x2={to.x} y2={to.y} className={selected ? 'path-edge' : ''} /><text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 8}>{weight}</text></g>
            })}
            {nodes.map((node) => {
              const state = step.current === node.id ? 'current' : step.visited.includes(node.id) ? 'visited' : ''
              return <g key={node.id} className={`graph-node ${state}`} transform={`translate(${node.x},${node.y})`}><circle r="28" /><text y="5">{node.id}</text><text className="distance" y="47">{step.distances[node.id] === Infinity ? '∞' : step.distances[node.id]}</text></g>
            })}
          </svg>
          <div className="distance-table">{nodes.map((node) => <div key={node.id}><span>{node.id}</span><strong>{step.distances[node.id] === Infinity ? '∞' : step.distances[node.id]}</strong></div>)}</div>
        </section>
      </div>
      <LearningCycle
        experimentId="dijkstra"
        prediction={{
          question: 'Dijkstra 下一步应优先选择哪个未确定节点？',
          options: ['边数最少的节点', '当前候选距离最小的节点', '字母顺序最靠前的节点'],
          answer: '当前候选距离最小的节点',
          explanation: ' 贪心选择使这个节点的最短距离可以被正式确定。',
        }}
        operation={{ title: '逐步运行并更换起点', instruction: '先从 A 运行到最后，再把起点改成 C，比较节点确定顺序和距离表。' }}
        observation={`${step.message} 当前已确定 ${step.visited.length}/${nodes.length} 个节点。`}
        summaryPrompt="为什么已经确定的节点以后不需要重新计算？"
      />
    </>
  )
}
