import React, { useEffect, useMemo, useState } from 'react'
import { getAttention, getBackendStatus } from '../lib/attentionService'
import AttentionCanvas from './AttentionCanvas'
import AttentionHeatmap from './AttentionHeatmap'
import LearningCycle from './LearningCycle'
import TransformerStory from './TransformerStory'

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
      <TransformerStory tokens={result?.data?.tokens} weights={result?.data?.weights} text={text} onTextChange={setText} />
      <div className="explore-heading"><span>自由探索 · 把刚才的理解变成证据</span><h2>现在由你控制注意力</h2><p>修改同一句话、切换层与注意力头，右侧图形会立即重新计算。先做预测，再观察变化。</p></div>
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
          <div className="visual-content-stage">
            {loading && !result && <div className="empty-state">正在生成注意力图…</div>}
            {error && <div className="error-state">计算失败：{error}</div>}
            {result && view === 'graph' && <AttentionCanvas tokens={result.data.tokens} weights={result.data.weights} topK={edgeLimit} />}
            {result && view === 'heatmap' && <AttentionHeatmap tokens={result.data.tokens} weights={result.data.weights} />}
          </div>
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
  const context = COURSE_CONTEXT[experiment.category] || COURSE_CONTEXT.default
  return <><header className="experiment-header" style={{ '--accent': experiment.accent }}><div><span className="eyebrow">{eyebrow}</span><h1>{experiment.title}</h1><p>{experiment.description}</p></div><span className="experiment-icon">{experiment.icon}</span></header><section className="knowledge-brief" style={{ '--brief-accent': experiment.accent }}><div className="knowledge-brief-intro"><span>KNOWLEDGE GUIDE · 知识点说明</span><h2>先明确“学什么”，再开始操作</h2><p>{experiment.description} 本实验不只展示结果，还会把关键状态、变化原因和最终规律对应起来。</p></div><div className="knowledge-brief-grid"><article><i>01</i><div><strong>核心概念</strong><p>{experiment.concepts.join('、')}。操作时要注意这些概念分别对应图中的哪些元素。</p></div></article><article><i>02</i><div><strong>学习目标</strong><p>能够用自己的话解释过程，并能预测改变输入或参数后会发生什么。</p></div></article><article><i>03</i><div><strong>实际应用</strong><p>{context.application}</p></div></article><article><i>04</i><div><strong>容易混淆</strong><p>{context.misconception}</p></div></article></div></section></>
}

const COURSE_CONTEXT = {
  人工智能: { application: '帮助理解模型训练、图像识别和大语言模型内部的数据计算过程。', misconception: '可视化展示的是一次具体运行，规律来自多次改变输入后的共同现象。' },
  数据结构与算法: { application: '用于程序设计、路径规划、检索、调度和各类性能优化问题。', misconception: '不要只背最终复杂度，还要区分比较、移动、访问和额外空间分别从哪里产生。' },
  操作系统: { application: '对应真实系统中的进程调度、内存管理、资源竞争与并发执行。', misconception: '系统策略通常是在公平性、吞吐量、响应速度和资源利用率之间权衡。' },
  计算机网络: { application: '用于理解浏览器访问、可靠传输、地址规划和互联网基础设施。', misconception: '协议步骤不是孤立规则，每个字段或状态都在解决一种具体的不确定性。' },
  计算机组成原理: { application: '对应处理器、存储层次和数值表示，是分析程序性能与硬件行为的基础。', misconception: '逻辑步骤与真实时钟周期不总是一一对应，要区分功能阶段和硬件并行过程。' },
  数据库系统: { application: '用于索引设计、查询优化、事务一致性和关系模式设计。', misconception: '正确结果只是第一步，还要考虑磁盘访问、并发冲突、冗余和维护成本。' },
  default: { application: '把抽象理论连接到真实计算机系统中的问题。', misconception: '不要只观察动画结果，要同时说明变化的原因。' },
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
