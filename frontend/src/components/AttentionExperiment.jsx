import React, { useEffect, useMemo, useState } from 'react'
import { getAttention, getBackendStatus } from '../lib/attentionService'
import AttentionCanvas from './AttentionCanvas'
import AttentionHeatmap from './AttentionHeatmap'
import LearningCycle from './LearningCycle'
import TheoryPrimer from './TheoryPrimer'

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
  const selectionExplanation = useMemo(
    () => explainAttentionSelection({ layer, head, temperature, edgeLimit, tokenCount: result?.data?.tokens?.length }),
    [layer, head, temperature, edgeLimit, result]
  )

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
      <TheoryPrimer
        title="Attention 到底在做什么？"
        intro="Transformer 会把一句话拆成多个 token。对每个 token，它都会计算“我现在应该关注句子里的谁”，并把关注程度表示为 0 到 1 的权重。权重越大，连线越粗、热力格颜色越深。"
        formula="Attention(Q, K, V) = Softmax(QKᵀ / √dₖ) · V"
        concepts={[
          { term: 'Token', description: '模型处理文本的基本单位。中文通常接近单字或词片，英文通常是单词或子词。' },
          { term: 'Layer 与 Head', description: 'Layer 是逐层加工的深度；同一层中的多个 Head 是并行观察句子的不同视角。' },
          { term: '权重矩阵', description: '每一行表示一个 token 如何分配注意力；同一行所有权重之和为 1。' },
        ]}
        goal="保持文本不变，切换 Layer 和 Head，观察主要连线是否改变；再调节温度，验证注意力会变得更集中还是更均匀。"
      />
      <div className="lab-layout">
        <aside className="control-panel">
          <div className="panel-title"><span>实验参数</span><i className={backendOnline ? 'online' : ''}>{backendOnline ? '真实模型' : '演示模式'}</i></div>
          <label className="field-block"><span>输入文本</span><small>文本会被拆成 token；修改内容后，右侧节点和关系会重新计算。</small><textarea value={text} onChange={(event) => setText(event.target.value)} rows={4} placeholder="输入一句话" /></label>
          <RangeField label="层 Layer" description="选择 Transformer 的第几层。浅层通常偏局部形式，深层逐渐整合上下文。" value={layer} display={layer + 1} min={0} max={11} onChange={setLayer} />
          <RangeField label="头 Head" description="选择同一层中的一个并行注意力视角；不同 Head 可能关注不同关系。" value={head} display={head + 1} min={0} max={11} onChange={setHead} />
          <RangeField label="温度 Temperature" description="低温让高权重更突出，高温让权重分布更平均。" value={temperature} display={temperature.toFixed(1)} min={0.1} max={3} step={0.1} onChange={setTemperature} />
          <RangeField label="每个 Token 显示 Top K" description="只显示每个 token 最重要的 K 条关系；它只影响显示密度，不改变真实权重。" value={edgeLimit} display={edgeLimit} min={1} max={6} onChange={setEdgeLimit} />
          <div className="segmented-control"><button className={view === 'graph' ? 'active' : ''} type="button" onClick={() => setView('graph')}>连线图</button><button className={view === 'heatmap' ? 'active' : ''} type="button" onClick={() => setView('heatmap')}>热力图</button></div>
          <div className="live-explanation" key={`${layer}-${head}-${temperature}-${edgeLimit}`}><span>你的操作意味着</span><strong>{selectionExplanation.title}</strong><p>{selectionExplanation.body}</p></div>
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

function RangeField({ label, description, value, display, onChange, ...rangeProps }) {
  return <label className="range-field"><span><b>{label}</b><i>{display}</i></span>{description && <small>{description}</small>}<input type="range" value={value} onChange={(event) => onChange(Number(event.target.value))} {...rangeProps} /></label>
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

function explainAttentionSelection({ layer, head, temperature, edgeLimit, tokenCount }) {
  const stage = layer <= 3 ? '浅层观察' : layer <= 7 ? '中层整合' : '深层语义观察'
  const temperatureEffect = temperature < 0.8 ? '低温会放大强关系，让少数连线更突出' : temperature > 1.4 ? '高温会拉近权重差异，让整体分布更均匀' : '当前温度接近模型原始分布'
  return {
    title: `第 ${layer + 1} 层 · Head ${head + 1} · ${stage}`,
    body: `${tokenCount || '若干'} 个 token 正通过第 ${head + 1} 个观察视角建立关系；${temperatureEffect}。图中每个 token 只保留最强的 ${edgeLimit} 条线，便于阅读。`,
  }
}
