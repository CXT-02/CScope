import React, { useEffect, useMemo, useState } from 'react'
import './TransformerStory.css'

const STEPS = [
  {
    short: '全局',
    title: '先看全局：一句话如何穿过 Transformer',
    eyebrow: '01 · 建立地图',
    why: '先知道数据从哪里进、到哪里出，再理解局部的 Q、K、V 计算，就不会迷失在孤立的名词里。',
    tag: '⚡ 数据流全景巡航'
  },
  {
    short: 'Token',
    title: '第一步：把句子拆成模型能处理的 Token',
    eyebrow: '02 · 拆分输入',
    why: '计算机不认识整句话的抽象语义，必须先用分词算法把它切成一个个有序号的基本单元（Token）。',
    tag: '✂️ 激光划线分词与掉落'
  },
  {
    short: '向量',
    title: '第二步：把 Token 变成带位置的数字向量',
    eyebrow: '03 · 表示输入',
    why: '词向量描述“它是谁”（语义），位置编码用三角函数波浪描述“它在第几个座位”（顺序），两者相加才是完整输入。',
    tag: '🌊 语义向量 + 正弦波位置融合'
  },
  {
    short: 'Q·K·V',
    title: '第三步：同一个 Token 生成三种观察角色',
    eyebrow: '04 · 准备检索',
    why: 'Q 是侦探想问什么，K 是线索名牌，V 是真正要传递的行李箱。一个词化身三种角色才能灵活交互。',
    tag: '🔺 Q/K/V 三棱镜角色投影'
  },
  {
    short: '权重',
    title: '第四步：打聚光灯！计算注意力打分与 Softmax',
    eyebrow: '05 · 计算关注',
    why: 'Query 和所有 Key 做点积除以 √dk，再通过 Softmax 归一化为总和 100% 的比例，决定聚光灯该打在谁身上。',
    tag: '💡 聚光灯探照与 Softmax 打分'
  },
  {
    short: '汇聚',
    title: '第五步：按权重吸附 Value，生成上下文新表示',
    eyebrow: '06 · 形成上下文',
    why: '打分只是关注比例；真正的输出来自于把各个 Token 的 Value 按照权重粗细汇聚融合成一个全新的深层向量。',
    tag: '🧲 多路 Value 能量吸附汇聚'
  },
  {
    short: '模块',
    title: '第六步：多头观察、残差跳跃捷径与前馈加工',
    eyebrow: '07 · 深化表示',
    why: '多头从不同角度观察句子，残差连接（Add）保留原始输入防止梯度消失，前馈网络（FFN）继续升维提取深层特征。',
    tag: '🔀 4 头并行 + 残差跳跃 + FFN'
  },
  {
    short: '总图',
    title: '回到总图：现在你已经走完一个编码层！',
    eyebrow: '08 · 拼回结构',
    why: '大模型通过堆叠数十个这样的编码层加深理解；解码器还会加入因果掩码，逐字预测下一个要吐出的词。',
    tag: '🎉 编码层全通 · 准备自由实验'
  },
]

export default function TransformerStory({ tokens = [], weights = [], text = '', onTextChange }) {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [focus, setFocus] = useState(0)
  const [subPhase, setSubPhase] = useState(0)
  const [animKey, setAnimKey] = useState(0)

  const safeTokens = tokens.length ? tokens : ['我', '喜', '欢', '学', '习']
  const safeFocus = Math.min(focus, safeTokens.length - 1)
  const row = weights[safeFocus] || safeTokens.map(() => 1 / safeTokens.length)
  const strongest = useMemo(
    () => row.reduce((best, value, index) => (value > best.value ? { value, index } : best), { value: -1, index: 0 }),
    [row]
  )

  // 当步骤切换或点击重播时，触发阶段推进动画（Phase 0 -> 1 -> 2 -> 3）
  useEffect(() => {
    setSubPhase(0)
    const t1 = setTimeout(() => setSubPhase(1), 350 / speed)
    const t2 = setTimeout(() => setSubPhase(2), 850 / speed)
    const t3 = setTimeout(() => setSubPhase(3), 1400 / speed)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [step, animKey, speed])

  // 自动播放定时器
  useEffect(() => {
    if (!playing) return undefined
    const duration = (3600 / speed)
    const timer = window.setTimeout(() => {
      setStep((current) => {
        if (current >= STEPS.length - 1) {
          setPlaying(false)
          return current
        }
        return current + 1
      })
    }, duration)
    return () => window.clearTimeout(timer)
  }, [playing, step, speed])

  useEffect(() => {
    if (safeFocus >= safeTokens.length) setFocus(0)
  }, [safeFocus, safeTokens.length])

  function selectStep(nextStep) {
    setStep(nextStep)
    setPlaying(false)
    setAnimKey((k) => k + 1)
  }

  function replayCurrentStep() {
    setAnimKey((k) => k + 1)
  }

  return (
    <section className="transformer-story" aria-label="Transformer 引导动画">
      {/* 顶部标题与贯穿句子输入 */}
      <header className="story-intro">
        <div>
          <span className="story-kicker">动画导学 · 约 3 分钟彻底搞懂</span>
          <h2>让一句话亲自走一遍 Transformer</h2>
          <p>
            参考经典科普动画逻辑：跟随橙色数据流逐步前进，亲眼看见文字如何被切开、打光、融合与升维。
          </p>
        </div>
        <label className="story-input">
          <span>
            <b>贯穿整个动画的句子</b>
            <small style={{ color: '#ffb340' }}>实时响应切分与推演</small>
          </span>
          <input
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            maxLength={28}
            placeholder="输入一句话体验分词与注意力..."
          />
        </label>
      </header>

      {/* 步骤时间轴导航 */}
      <nav className="story-timeline" aria-label="讲解章节">
        {STEPS.map((item, index) => (
          <button
            key={item.short}
            className={`${index === step ? 'active' : ''} ${index < step ? 'passed' : ''}`}
            type="button"
            onClick={() => selectStep(index)}
          >
            <i>{index < step ? '✓' : index + 1}</i>
            <span>{item.short}</span>
          </button>
        ))}
      </nav>

      {/* 核心舞台区域 */}
      <div className="story-stage" key={`${step}-${safeFocus}`}>
        <div className="story-copy">
          <div>
            <span>{STEPS[step].eyebrow}</span>
            <h3>{STEPS[step].title}</h3>
            <p>{stepDescription(step, safeTokens, safeFocus, strongest)}</p>
          </div>
          <aside>
            <strong>为什么需要它？</strong>
            <p>{STEPS[step].why}</p>
          </aside>
        </div>

        <div className="story-visual" aria-live="polite">
          {/* 右上方动效微标签 */}
          <div className="visual-subphase-indicator">
            <span className="subphase-dot" />
            <span>{STEPS[step].tag}</span>
          </div>

          <StageVisual
            key={animKey}
            step={step}
            subPhase={subPhase}
            tokens={safeTokens}
            weights={row}
            focus={safeFocus}
            onFocus={(idx) => {
              setFocus(idx)
              setAnimKey((k) => k + 1)
            }}
            strongest={strongest}
            speed={speed}
          />
        </div>
      </div>

      {/* 底部控制台 */}
      <footer className="story-controls">
        <button
          className="story-nav-btn"
          type="button"
          onClick={() => selectStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          ← 上一步
        </button>

        <button
          className="story-replay"
          type="button"
          onClick={replayCurrentStep}
          title="重新观看当前步骤的完整流光动画"
        >
          ↺ 重播本步动画
        </button>

        <button
          className="story-play"
          type="button"
          onClick={() => {
            if (step === STEPS.length - 1) setStep(0)
            setPlaying((value) => !value)
          }}
        >
          {playing ? '⏸ 暂停讲解' : step === STEPS.length - 1 ? '🔄 重新播放全部' : '▶ 自动连播'}
        </button>

        <button
          className="story-nav-btn"
          type="button"
          onClick={() => selectStep(Math.min(STEPS.length - 1, step + 1))}
          disabled={step === STEPS.length - 1}
        >
          下一步 →
        </button>

        <label>
          播放速度
          <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
            <option value={0.75}>0.75×</option>
            <option value={1}>1.0× (标准)</option>
            <option value={1.5}>1.5× (快速)</option>
          </select>
        </label>
      </footer>
    </section>
  )
}

function StageVisual({ step, subPhase, tokens, weights, focus, onFocus, strongest, speed }) {
  if (step === 0 || step === 7) return <ArchitectureMap complete={step === 7} subPhase={subPhase} />
  if (step === 1) return <TokenStage tokens={tokens} focus={focus} onFocus={onFocus} subPhase={subPhase} />
  if (step === 2) return <EmbeddingStage tokens={tokens} focus={focus} onFocus={onFocus} subPhase={subPhase} />
  if (step === 3) return <QkvStage token={tokens[focus]} subPhase={subPhase} />
  if (step === 4) return <ScoreStage tokens={tokens} weights={weights} focus={focus} onFocus={onFocus} strongest={strongest} subPhase={subPhase} />
  if (step === 5) return <AggregationStage tokens={tokens} weights={weights} strongest={strongest} subPhase={subPhase} />
  return <ModuleStage tokens={tokens} subPhase={subPhase} />
}

/* ---------------- 步骤 01 & 08: 架构全图与流光管道 ---------------- */
function ArchitectureMap({ complete, subPhase }) {
  const blocks = [
    { title: '文本输入', num: '01', desc: '原始字符串' },
    { title: 'Token + 位置', num: '02', desc: '词向量与波浪相加' },
    { title: '多头注意力', num: '03', desc: 'Q/K/V 聚光灯' },
    { title: 'Add & Norm', num: '04', desc: '残差相加与归一化' },
    { title: '前馈网络', num: '05', desc: '两层全连接升维' },
    { title: 'Add & Norm', num: '06', desc: '二次残差平滑' },
    { title: '上下文表示', num: '07', desc: '输出深层表征' },
  ]

  // 计算当前流光高亮的位置（循环流转）
  const [activeIdx, setActiveIdx] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % blocks.length)
    }, 900)
    return () => clearInterval(timer)
  }, [blocks.length])

  return (
    <div className="architecture-container">
      <div className="arch-pipe-visual">
        <div className="architecture-map">
          {blocks.map((b, index) => {
            const isHighlight = complete || activeIdx === index
            return (
              <React.Fragment key={b.num}>
                <div
                  className={`architecture-block b-${index} ${isHighlight ? 'active-glow' : ''} ${
                    complete ? 'complete-badge' : ''
                  }`}
                >
                  <span>{b.num}</span>
                  <strong>{b.title}</strong>
                  {complete ? (
                    <i>✓ 已透彻理解</i>
                  ) : activeIdx === index ? (
                    <i style={{ color: '#ff8a69' }}>数据包推进中</i>
                  ) : (
                    <span style={{ fontSize: '10px', color: '#687892' }}>{b.desc}</span>
                  )}
                </div>
                {index < blocks.length - 1 && (
                  <span className={`arch-arrow ${activeIdx === index ? 'active' : ''}`}>→</span>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      <div className="arch-status-banner">
        <span>⚡</span>
        <strong>
          {complete
            ? '🎉 恭喜！你已经完整走完了 Transformer 编码器全部 7 个核心步骤！'
            : '橙色数据流包正在从 01 文本输入 向右贯穿整个编码器管线'}
        </strong>
      </div>
    </div>
  )
}

/* ---------------- 步骤 02: Token 激光切割与掉落 ---------------- */
function TokenStage({ tokens, focus, onFocus, subPhase }) {
  return (
    <div className="token-stage-v2">
      {/* 顶部激光切割仪原句展示 */}
      <div className="raw-sentence-wrapper">
        {subPhase >= 1 && <div className="laser-cutter-beam" />}
        <div className="raw-sentence-text">
          {tokens.map((token, index) => (
            <span key={index} className="raw-char-span">
              {token}
              {subPhase >= 1 && index < tokens.length - 1 && <i className="cut-slit-line" />}
            </span>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', color: '#ff9d82', fontSize: '13px', fontWeight: 700 }}>
        {subPhase === 0 && '🔍 正在载入原始连续字符串...'}
        {subPhase === 1 && '⚡ 激光分词器正在扫描字间边界并下刀...'}
        {subPhase >= 2 && '🧱 文本已分离成独立 Token，掉落进入模型卡槽'}
      </div>

      {/* 下方掉落的 Token 积木块 */}
      <div className="token-drop-zone">
        {tokens.map((token, index) => {
          const isCurrentFocus = focus === index
          return (
            <button
              key={`${token}-${index}`}
              type="button"
              className={`token-brick ${subPhase >= 2 ? 'anim-drop' : ''} ${
                isCurrentFocus ? 'active-focus' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => onFocus(index)}
            >
              {isCurrentFocus && <div className="token-radar-ring" />}
              <span>{token}</span>
              <i>Token {index + 1}</i>
            </button>
          )
        })}
      </div>

      <div className="token-guide-tip">
        <span>🎯 当前聚焦追踪 Token：【<strong>{tokens[focus]}</strong>】（点击上方任意 Token 可自由切换）</span>
      </div>
    </div>
  )
}

/* ---------------- 步骤 03: 向量化与位置波浪相加 ---------------- */
function EmbeddingStage({ tokens, focus, onFocus, subPhase }) {
  const currentToken = tokens[focus]
  return (
    <div className="embedding-stage-v2">
      <div className="embedding-flow-grid">
        {/* 输入 Token */}
        <div className="embed-token-anchor">
          <strong>{currentToken}</strong>
          <small>第 {focus + 1} 个字</small>
        </div>

        <span className="operator-icon" style={{ color: '#8d7cff' }}>➔</span>

        {/* 词向量 Embedding 查表 */}
        <div className="embed-card word-vec">
          <span className="embed-card-title">① 语义词向量</span>
          <span className="embed-card-desc">描述“它是谁”</span>
          <VectorBars seed={focus * 17 + 1} color="#8d7cff" subPhase={subPhase} />
        </div>

        <span className="operator-icon">＋</span>

        {/* 位置编码 Positional Encoding */}
        <div className="embed-card pos-vec">
          <span className="embed-card-title">② 正弦余弦位置波</span>
          <span className="embed-card-desc">座位号 #{focus + 1}</span>
          <svg className="sin-wave-canvas" viewBox="0 0 110 48">
            <path
              d="M 5 24 Q 30 5, 55 24 T 105 24"
              className="sin-wave-path"
            />
            <circle cx="55" cy="24" r="4" fill="#ffb340" />
          </svg>
          <VectorBars seed={focus * 7 + 13} color="#ffb340" subPhase={subPhase} />
        </div>

        <span className="operator-icon" style={{ color: '#1ed4aa' }}>➔</span>

        {/* 最终相加结果 */}
        <div className="embed-card final-vec">
          <span className="embed-card-title">③ 带位置输入向量</span>
          <span className="embed-card-desc">既懂语义又有顺序</span>
          <VectorBars seed={focus * 23 + 29} color="#1ed4aa" subPhase={subPhase} />
        </div>
      </div>

      <div style={{ color: '#a2b4cb', fontSize: '13.5px', textAlign: 'center', maxWidth: '580px' }}>
        <strong>关键考点：</strong>在 Transformer 中，“我咬了狗”与“狗咬了我”字完全一样；正是通过将语义向量与独特的正弦波位置编码相加，模型才能准确分清词序！
      </div>
    </div>
  )
}

/* ---------------- 步骤 04: Q·K·V 三棱镜分流 ---------------- */
function QkvStage({ token, subPhase }) {
  return (
    <div className="qkv-stage-v2">
      {/* 左侧单一输入源 */}
      <div className="qkv-source-v2">
        <strong>{token}</strong>
        <small>带位置向量</small>
      </div>

      {/* 中间三棱镜 SVG 分光路径 */}
      <svg className="prism-svg-box" viewBox="0 0 100 240">
        <path d="M 10 120 C 50 120, 60 50, 95 45" className="prism-beam q" />
        <path d="M 10 120 L 95 120" className="prism-beam k" />
        <path d="M 10 120 C 50 120, 60 190, 95 195" className="prism-beam v" />
      </svg>

      {/* 右侧三张角色卡片 */}
      <div className="qkv-cards-col">
        <div className="qkv-card-v2 q-card" style={{ animationDelay: '0.1s' }}>
          <div className="qkv-badge">Q</div>
          <div className="qkv-info">
            <b>Query（查询向量 · 侦探视角）</b>
            <span>“我想寻找什么？去全场搜寻匹配”</span>
          </div>
        </div>

        <div className="qkv-card-v2 k-card" style={{ animationDelay: '0.25s' }}>
          <div className="qkv-badge">K</div>
          <div className="qkv-info">
            <b>Key（键向量 · 线索名牌）</b>
            <span>“我能提供什么线索？被动等待被 Q 匹配”</span>
          </div>
        </div>

        <div className="qkv-card-v2 v-card" style={{ animationDelay: '0.4s' }}>
          <div className="qkv-badge">V</div>
          <div className="qkv-info">
            <b>Value（值向量 · 真实内容行李箱）</b>
            <span>“如果匹配到了，我真正要传递的核心信息”</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- 步骤 05: 注意力打分与聚光灯 Softmax ---------------- */
function ScoreStage({ tokens, weights, focus, onFocus, strongest, subPhase }) {
  const currentToken = tokens[focus]

  return (
    <div className="score-stage-v2">
      {/* 顶部探照灯状态与公式 */}
      <div className="spotlight-header">
        <span className="query-spotlight-pill">
          <span>🔦 聚光灯发射源：Q(<strong>{currentToken}</strong>)</span>
        </span>
        <span className="spotlight-formula">
          Attention(Q, K) = Softmax( Q · Kᵀ / √dₖ )
        </span>
      </div>

      {/* 每一对词的打分与 Softmax 条 */}
      <div className="attention-pairs-list">
        {tokens.map((token, index) => {
          const w = weights[index] || 0
          const percent = (w * 100).toFixed(1)
          const isStrongest = index === strongest.index

          return (
            <div
              key={`${token}-${index}`}
              className={`attention-pair-row ${isStrongest ? 'is-strongest' : ''}`}
              onClick={() => onFocus(index)}
              title="点击查看聚焦"
            >
              <div className="pair-token-label">
                <span>{token}</span>
                {isStrongest && <span style={{ fontSize: '13px' }}>🎯</span>}
              </div>

              <div className="pair-dot-score">
                K{index + 1}
              </div>

              <div className="pair-bar-track">
                <div
                  className="pair-bar-fill"
                  style={{
                    width: subPhase >= 1 ? `${Math.max(6, w * 100)}%` : '0%'
                  }}
                />
              </div>

              <div className="pair-percent">
                {subPhase >= 2 ? `${percent}%` : '...'}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ color: '#8d9fb8', fontSize: '12.5px', textAlign: 'center' }}>
        <strong>视频动画同款理解：</strong>所有 Key 的注意力总和严格等于 100%；最高权重落在【<strong style={{ color: '#ff6845' }}>{tokens[strongest.index]}</strong>】，模型此时的“聚光灯”死死打在它身上！
      </div>
    </div>
  )
}

/* ---------------- 步骤 06: 多路 Value 能量吸附汇聚 ---------------- */
function AggregationStage({ tokens, weights, strongest, subPhase }) {
  return (
    <div className="aggregation-stage-v2">
      {/* 左侧各 Value 块 */}
      <div className="value-sources-cloud">
        {tokens.map((token, index) => {
          const w = weights[index] || 0
          const percent = (w * 100).toFixed(0)
          return (
            <div
              key={`${token}-${index}`}
              className="value-source-item"
              style={{ '--w-val': w }}
            >
              <strong>V({token})</strong>
              <span>× 权重 {percent}%</span>
            </div>
          )
        })}
      </div>

      {/* 中间加权求和聚焦器 */}
      <div className="merge-focus-core">
        <div className="sigma-symbol">Σ</div>
        <span className="merge-label">加权求和</span>
      </div>

      {/* 右侧凝聚生成的新上下文向量 */}
      <div className="context-output-box">
        <span>✨ 深度融合后的新向量</span>
        <strong>
          已充分汲取【{tokens[strongest.index]}】等全句关键信息
        </strong>
        <VectorBars seed={strongest.index * 13 + 37} color="#ff6845" subPhase={subPhase} />
      </div>
    </div>
  )
}

/* ---------------- 步骤 07: 多头、残差捷径与 FFN ---------------- */
function ModuleStage({ tokens, subPhase }) {
  const heads = [
    { name: 'Head 1 (语法修饰)', focus: '主谓宾依赖' },
    { name: 'Head 2 (深层语义)', focus: '同义与指代' },
    { name: 'Head 3 (远距离跨度)', focus: '首尾全局' },
    { name: 'Head 4 (局部邻近)', focus: '前后连词' },
  ]

  return (
    <div className="module-stage-v2">
      {/* 4 个注意力头小视窗 */}
      <div className="multi-head-grid-v2">
        {heads.map((h, idx) => (
          <div key={idx} className="head-card-v2">
            <strong>{h.name}</strong>
            <div className="head-mini-rays">
              <span className="ray-line" style={{ top: '10px', left: '10%', width: '80%', animationDelay: `${idx * 0.2}s` }} />
              <span className="ray-line" style={{ top: '24px', left: '20%', width: '60%', animationDelay: `${idx * 0.3}s` }} />
            </div>
            <span style={{ fontSize: '11px', color: '#97a7be' }}>{h.focus}</span>
          </div>
        ))}
      </div>

      <div className="concat-linear-banner">
        4 头输出拼接 (Concat) + 线性变换 Wᵒ
      </div>

      {/* 弧形残差捷径与前馈网络 */}
      <div className="residual-ffn-block">
        <div className="residual-line-label">
          <span>＋ 残差捷径 (Residual Skip Connection): x + SubLayer(x)</span>
        </div>
        <div className="ffn-layer-flow">
          <span>LayerNorm 层归一化</span>
          <span>➔</span>
          <span>FFN (前馈网络: 升维 4× ➔ ReLU/GELU ➔ 降维)</span>
          <span>➔</span>
          <span>LayerNorm 最终输出</span>
        </div>
      </div>
    </div>
  )
}

/* ---------------- 动态特征柱状条 ---------------- */
function VectorBars({ seed = 1, color = '#ff6845', subPhase = 3 }) {
  const heights = [45, 80, 30, 95, 60, 75]
  return (
    <div className="vector-bars-v2">
      {heights.map((baseH, idx) => {
        const dynamicH = 20 + ((seed * 19 + idx * 37) % 75)
        const finalH = subPhase >= 1 ? dynamicH : 10
        return (
          <div
            key={idx}
            className="v-bar-item"
            style={{
              height: `${finalH}%`,
              background: color,
              transitionDelay: `${idx * 0.05}s`
            }}
          />
        )
      })}
    </div>
  )
}

function stepDescription(step, tokens, focus, strongest) {
  const token = tokens[focus]
  const descriptions = [
    '先不急着计算。观察整条路线：文本从左边输入，被切分数字化、建立全句上下文注意力关系，再通过残差和前馈网络逐层加工。',
    `“${tokens.join('')}”被激光刀精准切分为 ${tokens.length} 个 Token。当前追踪的是“${token}”，接下来我们将跟随它一步步蜕变。`,
    `“${token}”通过查表得到语义特征向量，再叠加上正弦余弦波浪生成的第 ${focus + 1} 号“座位编码”，让模型不仅懂意思，还懂顺序！`,
    `“${token}”经过三个不同权重的矩阵投影，一分为三：变成 Query（主动发问）、Key（被动名牌）和 Value（真实行李）。`,
    `“${token}”举起聚光灯发射 Q，与句中所有字的 K 对眼神。目前最强的聚光灯打在了“${tokens[strongest.index]}”上！`,
    `打分不是终点！模型以刚才算出的比例为吸力，从所有字的 Value 里吸取信息并融合成一体，形成全句深层上下文表示！`,
    `不仅一个头在看！4 个 Head 从语法、指代、全局等不同角度并行观察；弧形残差捷径（Add）保证原始信号不丢失，前馈网络（FFN）继续升维加工。`,
    `看！7 个方块全部被点亮！通过重复堆叠多个这样的编码层，大模型获得了真正“读懂人类语言”的无上智慧。你可以进入下方沙盒自由修改调参！`,
  ]
  return descriptions[step]
}
