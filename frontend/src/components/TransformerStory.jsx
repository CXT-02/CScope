import React, { useEffect, useMemo, useState } from 'react'

const STEPS = [
  { short: '全局', title: '先看全局：一句话如何穿过 Transformer', eyebrow: '01 · 建立地图', why: '先知道终点，再理解局部计算，后面的 Q、K、V 就不会变成孤立名词。' },
  { short: 'Token', title: '第一步：把句子拆成模型能处理的 Token', eyebrow: '02 · 拆分输入', why: '模型不能直接理解整句话，需要先把文本拆成一组有顺序的基本单位。' },
  { short: '向量', title: '第二步：把 Token 变成带位置的数字向量', eyebrow: '03 · 表示输入', why: '词向量描述“它是谁”，位置编码补充“它在哪里”，两者相加才构成完整输入。' },
  { short: 'Q·K·V', title: '第三步：同一个 Token 生成三种观察角色', eyebrow: '04 · 准备检索', why: 'Q 表示我想找什么，K 表示我能提供什么线索，V 表示真正要传递的内容。' },
  { short: '权重', title: '第四步：比较 Q 与所有 K，得到注意力权重', eyebrow: '05 · 计算关注', why: '相似度经过缩放和 Softmax 后变成总和为 1 的权重，模型由此决定该多关注谁。' },
  { short: '汇聚', title: '第五步：按权重汇聚信息，更新当前 Token', eyebrow: '06 · 形成上下文', why: '权重只是关注比例；真正的输出来自对所有 V 的加权求和。' },
  { short: '模块', title: '第六步：多头观察，再经过残差与前馈网络', eyebrow: '07 · 深化表示', why: '不同注意力头并行寻找不同关系，残差连接保留原信息，前馈网络继续加工每个位置。' },
  { short: '总图', title: '回到总图：现在你已经走完一个编码层', eyebrow: '08 · 拼回结构', why: '真实 Transformer 会重复堆叠这些模块；解码器还会加入掩码，逐个预测后续 Token。' },
]

export default function TransformerStory({ tokens = [], weights = [], text = '', onTextChange }) {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [focus, setFocus] = useState(0)
  const safeTokens = tokens.length ? tokens : ['我', '喜', '欢', '学', '习']
  const safeFocus = Math.min(focus, safeTokens.length - 1)
  const row = weights[safeFocus] || safeTokens.map(() => 1 / safeTokens.length)
  const strongest = useMemo(() => row.reduce((best, value, index) => value > best.value ? { value, index } : best, { value: -1, index: 0 }), [row])

  useEffect(() => {
    if (!playing) return undefined
    const timer = window.setTimeout(() => {
      setStep((current) => {
        if (current >= STEPS.length - 1) {
          setPlaying(false)
          return current
        }
        return current + 1
      })
    }, 2600 / speed)
    return () => window.clearTimeout(timer)
  }, [playing, step, speed])

  useEffect(() => {
    if (safeFocus >= safeTokens.length) setFocus(0)
  }, [safeFocus, safeTokens.length])

  function selectStep(nextStep) {
    setStep(nextStep)
    setPlaying(false)
  }

  return (
    <section className="transformer-story" aria-label="Transformer 引导动画">
      <header className="story-intro">
        <div>
          <span className="story-kicker">动画导学 · 约 3 分钟</span>
          <h2>让一句话亲自走一遍 Transformer</h2>
          <p>跟随橙色数据流逐步前进。每一步只回答一个问题，并解释它为什么存在。</p>
        </div>
        <label className="story-input"><span>贯穿整个动画的句子</span><input value={text} onChange={(event) => onTextChange(event.target.value)} maxLength={28} /></label>
      </header>

      <nav className="story-timeline" aria-label="讲解章节">
        {STEPS.map((item, index) => (
          <button key={item.short} className={`${index === step ? 'active' : ''} ${index < step ? 'passed' : ''}`} type="button" onClick={() => selectStep(index)}>
            <i>{index < step ? '✓' : index + 1}</i><span>{item.short}</span>
          </button>
        ))}
      </nav>

      <div className="story-stage" key={`${step}-${safeFocus}`}>
        <div className="story-copy">
          <span>{STEPS[step].eyebrow}</span>
          <h3>{STEPS[step].title}</h3>
          <p>{stepDescription(step, safeTokens, safeFocus, strongest)}</p>
          <aside><strong>为什么需要它？</strong><p>{STEPS[step].why}</p></aside>
        </div>
        <div className="story-visual" aria-live="polite">
          <StageVisual step={step} tokens={safeTokens} weights={row} focus={safeFocus} onFocus={setFocus} strongest={strongest} />
        </div>
      </div>

      <footer className="story-controls">
        <button type="button" onClick={() => selectStep(Math.max(0, step - 1))} disabled={step === 0}>← 上一步</button>
        <button className="story-play" type="button" onClick={() => {
          if (step === STEPS.length - 1) setStep(0)
          setPlaying((value) => !value)
        }}>{playing ? '暂停讲解' : step === STEPS.length - 1 ? '重新播放' : '▶ 自动播放'}</button>
        <button type="button" onClick={() => selectStep(Math.min(STEPS.length - 1, step + 1))} disabled={step === STEPS.length - 1}>下一步 →</button>
        <label>速度<select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}><option value={0.75}>0.75×</option><option value={1}>1×</option><option value={1.5}>1.5×</option></select></label>
      </footer>
    </section>
  )
}

function StageVisual({ step, tokens, weights, focus, onFocus, strongest }) {
  if (step === 0 || step === 7) return <ArchitectureMap complete={step === 7} />
  if (step === 1) return <TokenStage tokens={tokens} focus={focus} onFocus={onFocus} />
  if (step === 2) return <EmbeddingStage tokens={tokens} focus={focus} onFocus={onFocus} />
  if (step === 3) return <QkvStage token={tokens[focus]} />
  if (step === 4) return <ScoreStage tokens={tokens} weights={weights} focus={focus} onFocus={onFocus} strongest={strongest} />
  if (step === 5) return <AggregationStage tokens={tokens} weights={weights} strongest={strongest} />
  return <ModuleStage tokens={tokens} />
}

function ArchitectureMap({ complete }) {
  const blocks = ['文本输入', 'Token + 位置', '多头注意力', 'Add & Norm', '前馈网络', 'Add & Norm', '上下文表示']
  return <div className={`architecture-map ${complete ? 'complete' : ''}`}>{blocks.map((block, index) => <React.Fragment key={block}><div className={`architecture-block b-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><strong>{block}</strong>{complete && index > 1 && <i>已理解</i>}</div>{index < blocks.length - 1 && <b className="flow-arrow">→</b>}</React.Fragment>)}</div>
}

function TokenStage({ tokens, focus, onFocus }) {
  return <div className="token-stage"><div className="raw-sentence">{tokens.join('')}</div><div className="split-guide">文本切分</div><div className="token-row">{tokens.map((token, index) => <button className={focus === index ? 'active' : ''} type="button" key={`${token}-${index}`} onClick={() => onFocus(index)}><span>{token}</span><i>Token {index + 1}</i></button>)}</div><small>点击一个 Token，后续步骤将以它作为当前查询对象</small></div>
}

function EmbeddingStage({ tokens, focus, onFocus }) {
  return <div className="embedding-stage"><div className="token-column">{tokens.slice(0, 8).map((token, index) => <button type="button" className={focus === index ? 'active' : ''} key={`${token}-${index}`} onClick={() => onFocus(index)}>{token}</button>)}</div><b className="stage-arrow">→</b><div className="embedding-box"><span>Embedding 层</span><small>查表得到语义向量</small></div><b className="stage-plus">＋</b><div className="position-box"><span>位置 {focus + 1}</span><small>补充顺序信息</small></div><b className="stage-arrow">→</b><VectorBars seed={focus + 1} /></div>
}

function QkvStage({ token }) {
  return <div className="qkv-stage"><div className="qkv-source"><strong>{token}</strong><small>当前 Token 向量</small></div><div className="qkv-lines"><i /><i /><i /></div><div className="qkv-results"><QkvCard type="Q" title="Query" text="我想寻找什么？" color="violet" /><QkvCard type="K" title="Key" text="我能匹配什么？" color="amber" /><QkvCard type="V" title="Value" text="我要传递什么？" color="coral" /></div></div>
}

function QkvCard({ type, title, text, color }) {
  return <div className={`qkv-card ${color}`}><strong>{type}</strong><div><b>{title}</b><span>{text}</span></div><VectorBars seed={type.charCodeAt(0)} compact /></div>
}

function ScoreStage({ tokens, weights, focus, onFocus, strongest }) {
  return <div className="score-stage"><div className="query-chip">Q · {tokens[focus]}</div><div className="score-operator">Q × Kᵀ → 缩放 → Softmax</div><div className="weight-list">{tokens.map((token, index) => { const weight = weights[index] || 0; return <button type="button" key={`${token}-${index}`} className={index === strongest.index ? 'strongest' : ''} onClick={() => onFocus(index)}><span>{token}</span><div><i style={{ width: `${Math.max(5, weight * 100)}%` }} /></div><b>{(weight * 100).toFixed(1)}%</b></button> })}</div><small>所有权重相加 = 100%；颜色最亮的 Token 获得最多关注</small></div>
}

function AggregationStage({ tokens, weights, strongest }) {
  return <div className="aggregation-stage"><div className="value-cloud">{tokens.map((token, index) => <div key={`${token}-${index}`} style={{ '--weight': Math.max(.18, weights[index] || 0) }}><strong>{token}</strong><span>V × {((weights[index] || 0) * 100).toFixed(0)}%</span></div>)}</div><div className="merge-beam">加权汇聚</div><div className="context-result"><span>新的上下文表示</span><strong>当前 Token 最关注“{tokens[strongest.index]}”</strong><VectorBars seed={strongest.index + 15} /></div></div>
}

function ModuleStage({ tokens }) {
  const heads = [0, 1, 2, 3]
  return <div className="module-stage"><div className="mini-tokens">{tokens.slice(0, 7).map((token, index) => <span key={`${token}-${index}`}>{token}</span>)}</div><div className="head-grid">{heads.map((head) => <div key={head}><strong>Head {head + 1}</strong><i style={{ transform: `rotate(${head % 2 ? -5 : 5}deg)` }} /></div>)}</div><div className="concat-chip">拼接 + 线性变换</div><div className="residual-path"><span>主路径：注意力 → Add & Norm → FFN</span><b>＋ 原始输入的残差捷径</b></div></div>
}

function VectorBars({ seed = 1, compact = false }) {
  return <div className={`vector-bars ${compact ? 'compact' : ''}`}>{Array.from({ length: compact ? 5 : 7 }, (_, index) => { const value = 28 + ((seed * 31 + index * 47) % 68); return <i key={index} style={{ height: `${value}%` }} /> })}</div>
}

function stepDescription(step, tokens, focus, strongest) {
  const token = tokens[focus]
  const descriptions = [
    '先不计算。观察整条路线：文本会被数字化、建立上下文关系，再被逐层加工成新的表示。',
    `“${tokens.join('')}”被拆成 ${tokens.length} 个 Token。现在选择的是“${token}”，后续动画会追踪它。`,
    `“${token}”先变成语义向量，再加上第 ${focus + 1} 个位置的编码，因此相同词出现在不同位置也能被区分。`,
    `“${token}”的同一份输入经过三组可学习的线性变换，分别生成 Query、Key 和 Value。`,
    `“${token}”的 Query 正在和所有 Token 的 Key 比较；当前最高权重落在“${tokens[strongest.index]}”上。`,
    `模型用刚才的权重混合所有 Value，为“${token}”生成包含全句信息的新表示。`,
    '多个 Head 同时重复注意力计算，再拼接结果。残差连接和前馈网络让信息既能保留又能继续变换。',
    '从现在起，完整结构图中的每个方块都不再是黑箱。你可以进入下方自由实验，修改句子、层和注意力头来验证。',
  ]
  return descriptions[step]
}
