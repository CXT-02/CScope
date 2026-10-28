import React, { useEffect, useMemo, useState } from 'react'
import { getAttention, getBackendStatus } from '../lib/attentionService'
import AttentionCanvas from './AttentionCanvas'
import AttentionHeatmap from './AttentionHeatmap'
import LearningCycle from './LearningCycle'

export default function AttentionExperiment({ experiment }) {
  const [text, setText] = useState('我喜欢学习深度学习')
  const debouncedText = useDebouncedValue(text, 220)
  const [layer, setLayer] = useState(0)
  const [head, setHead] = useState(0)
  const [temperature, setTemperature] = useState(1)
  const [edgeLimit, setEdgeLimit] = useState(3)
  const [view, setView] = useState('graph')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [backendOnline, setBackendOnline] = useState(false)
  const [error, setError] = useState(null)
  const observation = useMemo(() => strongestAttention(result, layer, head), [result, layer, head])

  useEffect(() => {
    getBackendStatus().then((status) => setBackendOnline(status.online)).catch(() => setBackendOnline(false))
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getAttention({ text: debouncedText, layer, head, temperature })
      .then((response) => { if (!cancelled) setResult(response) })
      .catch((requestError) => { if (!cancelled) setError(String(requestError)) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [debouncedText, layer, head, temperature])

  return (
    <>
      <ExperimentHeader experiment={experiment} eyebrow="人工智能实验 01" />
      <div className="lab-layout">
        <aside className="control-panel">
          <div className="panel-title"><span>实验参数</span><i className={backendOnline ? 'online' : ''}>{backendOnline ? '真实模型' : '演示模式'}</i></div>
          <label className="field-block"><span>输入文本</span><textarea value={text} onChange={(event) => setText(event.target.value)} rows={4} placeholder="输入一句话" /></label>
          <RangeField label="层 Layer" value={layer} display={layer + 1} min={0} max={11} onChange={setLayer} />
          <RangeField label="头 Head" value={head} display={head + 1} min={0} max={11} onChange={setHead} />
          <RangeField label="温度 Temperature" value={temperature} display={temperature.toFixed(1)} min={0.1} max={3} step={0.1} onChange={setTemperature} />
          <RangeField label="每个 Token 显示 Top K" value={edgeLimit} display={edgeLimit} min={1} max={6} onChange={setEdgeLimit} />
          <div className="segmented-control"><button className={view === 'graph' ? 'active' : ''} type="button" onClick={() => setView('graph')}>连线图</button><button className={view === 'heatmap' ? 'active' : ''} type="button" onClick={() => setView('heatmap')}>热力图</button></div>
          <div className="tip-box"><strong>观察提示</strong><p>尝试切换浅层与深层，比较模型关注局部词形和完整语义时的差异。</p></div>
        </aside>
        <section className={`visual-panel ${loading && result ? 'is-updating' : ''}`}>
          <div className="visual-toolbar"><div><strong>{view === 'graph' ? 'Token 注意力连线' : '注意力权重矩阵'}</strong><span>{result ? `${result.data.tokens?.length || 0} tokens · Layer ${layer + 1} · Head ${head + 1}` : '等待数据'}</span></div><span className={`source-chip ${loading ? 'updating' : ''}`}>{loading ? '正在更新' : sourceLabel(result?.source)}</span></div>
          {loading && !result && <div className="empty-state">正在生成注意力图…</div>}
          {error && <div className="error-state">计算失败：{error}</div>}
          {result && view === 'graph' && <AttentionCanvas tokens={result.data.tokens} weights={result.data.weights} topK={edgeLimit} />}
          {result && view === 'heatmap' && <AttentionHeatmap tokens={result.data.tokens} weights={result.data.weights} />}
        </section>
      </div>
      <LearningCycle
        experimentId="attention"
        prediction={{
          question: '把温度调高后，注意力通常会怎样变化？',
          options: ['更集中在少数 token', '分布更加均匀', 'token 数量减少'],
          answer: '分布更加均匀',
          explanation: ' 温度升高会减小分数之间的相对差距。',
        }}
        operation={{ title: '比较不同层和注意力头', instruction: '保持文本不变，分别观察 Layer 1 与 Layer 12，再切换两个不同的 Head。' }}
        observation={observation}
        summaryPrompt="不同层或不同头的关注模式有什么区别？"
      />
    </>
  )
}

export function ExperimentHeader({ experiment, eyebrow }) {
  return <header className="experiment-header" style={{ '--accent': experiment.accent }}><div><span className="eyebrow">{eyebrow}</span><h1>{experiment.title}</h1><p>{experiment.description}</p></div><span className="experiment-icon">{experiment.icon}</span></header>
}

function RangeField({ label, value, display, onChange, ...rangeProps }) {
  return <label className="range-field"><span><b>{label}</b><i>{display}</i></span><input type="range" value={value} onChange={(event) => onChange(Number(event.target.value))} {...rangeProps} /></label>
}

function sourceLabel(source) {
  return ({ live: '真实模型', precomputed: '预计算数据', sample: '后端模拟', simulated: '本地动态模拟' }[source] || '等待数据')
}

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])
  return debounced
}

function strongestAttention(result, layer, head) {
  if (!result?.data?.weights?.length) return '等待注意力权重计算。'
  const { tokens, weights } = result.data
  let strongest = { value: -1, from: 0, to: 0 }
  weights.forEach((row, from) => row.forEach((value, to) => {
    if (from !== to && value > strongest.value) strongest = { value, from, to }
  }))
  return `Layer ${layer + 1} · Head ${head + 1} 中，当前最强的非自身关系是“${tokens[strongest.from]} → ${tokens[strongest.to]}”，权重 ${strongest.value.toFixed(3)}。`
}
