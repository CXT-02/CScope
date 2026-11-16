import React, { useEffect, useMemo, useState } from 'react'
import { ExperimentHeader } from './AttentionExperiment'
import LearningCycle from './LearningCycle'

const DATA = [
  { x: 0.05, y: 0.12 }, { x: 0.2, y: 0.28 }, { x: 0.36, y: 0.39 },
  { x: 0.52, y: 0.58 }, { x: 0.68, y: 0.7 }, { x: 0.83, y: 0.86 }, { x: 0.96, y: 0.92 },
]
const INITIAL = { w: -0.45, b: 0.78 }

const STEPS = [
  { short: '全局', title: '先看全局：模型是怎样从错误中学习的', eyebrow: '01 · 建立地图', why: '训练不是模型突然“想明白了”，而是预测、计算错误、求梯度、更新参数的循环。' },
  { short: '预测', title: '第一步：用当前参数做出预测', eyebrow: '02 · 前向计算', why: '只有先得到预测，才能把它和真实答案比较，知道模型错了多少。' },
  { short: '损失', title: '第二步：用损失函数量化错误', eyebrow: '03 · 衡量偏差', why: '损失把许多样本的误差汇总成一个数字，为参数优化提供统一目标。' },
  { short: '梯度', title: '第三步：梯度指出损失上升最快的方向', eyebrow: '04 · 寻找坡度', why: '梯度同时包含方向和陡峭程度；想让损失下降，就要朝梯度的反方向移动。' },
  { short: '反传', title: '第四步：沿计算图把影响逐层传回参数', eyebrow: '05 · 责任分配', why: '链式法则把最终损失拆解为每个中间计算的局部影响，从而知道每个参数该承担多少责任。' },
  { short: '更新', title: '第五步：学习率决定参数迈多大一步', eyebrow: '06 · 修正参数', why: '步子太小收敛很慢，步子太大可能越过最低点甚至发散。' },
  { short: '循环', title: '重复循环：损失下降，预测线逐渐贴近数据', eyebrow: '07 · 完成训练', why: '一次更新通常不够，模型要反复观察数据，直到损失足够小或达到训练轮数。' },
]

export default function GradientDescentExperiment({ experiment }) {
  const [params, setParams] = useState(INITIAL)
  const [learningRate, setLearningRate] = useState(0.18)
  const [epoch, setEpoch] = useState(0)
  const metrics = useMemo(() => evaluate(params), [params])
  const [history, setHistory] = useState(() => [evaluate(INITIAL).loss])
  const [training, setTraining] = useState(false)

  function trainOnce() {
    setParams((current) => {
      const currentMetrics = evaluate(current)
      setHistory((items) => [...items.slice(-29), currentMetrics.loss])
      setEpoch((value) => value + 1)
      return updateParams(current, currentMetrics, learningRate)
    })
  }

  useEffect(() => {
    if (!training) return undefined
    const timer = window.setInterval(trainOnce, 650)
    return () => window.clearInterval(timer)
  }, [training, learningRate])

  useEffect(() => {
    if (training && (metrics.loss < 0.001 || epoch >= 80)) setTraining(false)
  }, [training, metrics.loss, epoch])

  function changeParam(field, value) {
    setTraining(false)
    const next = { ...params, [field]: value }
    setParams(next)
    setEpoch(0)
    setHistory([evaluate(next).loss])
  }

  function reset() {
    setTraining(false)
    setParams(INITIAL)
    setLearningRate(0.18)
    setEpoch(0)
    setHistory([evaluate(INITIAL).loss])
  }

  const nextParams = updateParams(params, metrics, learningRate)
  return (
    <>
      <ExperimentHeader experiment={experiment} eyebrow="人工智能实验 03" />
      <GradientStory params={params} metrics={metrics} learningRate={learningRate} nextParams={nextParams} />
      <div className="explore-heading"><span>自由探索 · 亲手训练一个模型</span><h2>让一条错误的预测线逐渐学会拟合数据</h2><p>单击训练一步，观察残差、梯度、参数和损失如何联动；再改变学习率，比较收敛速度与稳定性。</p></div>
      <div className="lab-layout gd-lab-layout">
        <aside className="control-panel">
          <div className="panel-title"><span>训练参数</span><i className={training ? 'online' : ''}>{training ? '自动训练中' : `第 ${epoch} 轮`}</i></div>
          <GdRange label="权重 w" description="决定预测线的斜率；它控制输入 x 对预测结果的影响。" value={params.w} min={-1.5} max={2} step={0.05} onChange={(value) => changeParam('w', value)} />
          <GdRange label="偏置 b" description="决定预测线整体上下移动多少。" value={params.b} min={-0.5} max={1.2} step={0.05} onChange={(value) => changeParam('b', value)} />
          <GdRange label="学习率 η" description="每次沿梯度反方向更新的步长。建议从 0.05～0.3 比较。" value={learningRate} min={0.01} max={1.2} step={0.01} onChange={(value) => { setTraining(false); setLearningRate(value) }} />
          <div className="gd-train-buttons"><button type="button" onClick={trainOnce}>训练一步</button><button className={training ? 'stop' : ''} type="button" onClick={() => setTraining((value) => !value)}>{training ? '暂停训练' : '连续训练'}</button></div>
          <button className="gd-reset" type="button" onClick={reset}>恢复初始参数</button>
          <div className="gd-gradient-card"><span>当前梯度</span><div><b>∂L/∂w</b><strong className={metrics.dw >= 0 ? 'positive' : 'negative'}>{signed(metrics.dw)}</strong></div><div><b>∂L/∂b</b><strong className={metrics.db >= 0 ? 'positive' : 'negative'}>{signed(metrics.db)}</strong></div></div>
          <div className="live-explanation" key={`${params.w}-${params.b}-${learningRate}`}><span>下一步会发生什么</span><strong>w：{params.w.toFixed(3)} → {nextParams.w.toFixed(3)}　b：{params.b.toFixed(3)} → {nextParams.b.toFixed(3)}</strong><p>{gradientExplanation(metrics, learningRate)}</p></div>
        </aside>
        <section className="visual-panel gd-visual-panel">
          <div className="visual-toolbar"><div><strong>线性模型拟合过程</strong><span>圆点：真实数据 · 紫线：当前预测 · 虚线：每个样本的残差</span></div><span className="source-chip">ŷ = wx + b</span></div>
          <RegressionChart params={params} metrics={metrics} />
          <div className="gd-metrics"><div><span>当前损失 MSE</span><strong>{metrics.loss.toFixed(5)}</strong></div><div><span>权重 w</span><strong>{params.w.toFixed(3)}</strong></div><div><span>偏置 b</span><strong>{params.b.toFixed(3)}</strong></div><div><span>训练轮数</span><strong>{epoch}</strong></div></div>
          <div className="gd-formula"><span>本轮参数更新</span><code>w新 = {params.w.toFixed(3)} − {learningRate.toFixed(2)} × ({metrics.dw.toFixed(3)}) = {nextParams.w.toFixed(3)}</code><code>b新 = {params.b.toFixed(3)} − {learningRate.toFixed(2)} × ({metrics.db.toFixed(3)}) = {nextParams.b.toFixed(3)}</code></div>
          <LossHistory values={history} current={metrics.loss} />
        </section>
      </div>
      <LearningCycle
        experimentId="gradient-descent"
        prediction={{
          question: '如果 ∂L/∂w 是正数，为了让损失下降，w 通常应该怎样更新？',
          options: ['减小 w', '增大 w', '保持不变'],
          answer: '减小 w',
          explanation: ' 梯度下降使用“参数减去学习率乘梯度”，因此正梯度会让参数减小。',
        }}
        operation={{ title: '比较小学习率与大学习率', instruction: '重置后先用学习率 0.05 连续训练几轮，再重置并改为 1.0，比较损失曲线是否平稳。' }}
        observation={`当前第 ${epoch} 轮，损失为 ${metrics.loss.toFixed(5)}；梯度 dw=${metrics.dw.toFixed(3)}、db=${metrics.db.toFixed(3)}。`}
        summaryPrompt="梯度、学习率和损失下降之间是什么关系？"
      />
    </>
  )
}

function GradientStory({ params, metrics, learningRate, nextParams }) {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  useEffect(() => {
    if (!playing) return undefined
    const timer = window.setTimeout(() => setStep((current) => {
      if (current === STEPS.length - 1) { setPlaying(false); return current }
      return current + 1
    }), 2700 / speed)
    return () => window.clearTimeout(timer)
  }, [playing, speed, step])
  function selectStep(value) { setStep(value); setPlaying(false) }
  return <section className="transformer-story gd-story" aria-label="梯度下降与反向传播动画导学">
    <header className="story-intro"><div><span className="story-kicker">动画导学 · 约 3 分钟</span><h2>跟随一次错误，走完模型的学习循环</h2><p>正向传播负责得到预测，反向传播负责找出每个参数对错误的影响。</p></div><div className="gd-story-status"><span>当前模型</span><strong>ŷ = {params.w.toFixed(2)}x + {params.b.toFixed(2)}</strong><small>均方误差 MSE = {metrics.loss.toFixed(4)}</small></div></header>
    <nav className="story-timeline" style={{ '--story-steps': STEPS.length }}>{STEPS.map((item, index) => <button type="button" key={item.short} className={`${step === index ? 'active' : ''} ${index < step ? 'passed' : ''}`} onClick={() => selectStep(index)}><i>{index < step ? '✓' : index + 1}</i><span>{item.short}</span></button>)}</nav>
    <div className="story-stage" key={step}><div className="story-copy"><span>{STEPS[step].eyebrow}</span><h3>{STEPS[step].title}</h3><p>{stepDescription(step, params, metrics, learningRate, nextParams)}</p><aside><strong>为什么需要它？</strong><p>{STEPS[step].why}</p></aside></div><div className="story-visual"><GdStoryVisual step={step} params={params} metrics={metrics} learningRate={learningRate} nextParams={nextParams} /></div></div>
    <footer className="story-controls"><button type="button" disabled={step === 0} onClick={() => selectStep(step - 1)}>← 上一步</button><button className="story-play" type="button" onClick={() => { if (step === STEPS.length - 1) setStep(0); setPlaying((value) => !value) }}>{playing ? '暂停讲解' : step === STEPS.length - 1 ? '重新播放' : '▶ 自动播放'}</button><button type="button" disabled={step === STEPS.length - 1} onClick={() => selectStep(step + 1)}>下一步 →</button><label>速度<select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}><option value={.75}>0.75×</option><option value={1}>1×</option><option value={1.5}>1.5×</option></select></label></footer>
  </section>
}

function GdStoryVisual({ step, params, metrics, learningRate, nextParams }) {
  const sample = metrics.samples[4]
  if (step === 0) return <div className="gd-loop">{['预测 ŷ', '计算损失 L', '反向求梯度', '更新 w、b'].map((label, index) => <React.Fragment key={label}><div><i>{index + 1}</i><strong>{label}</strong></div>{index < 3 && <b>→</b>}</React.Fragment>)}<span>重复</span></div>
  if (step === 1) return <div className="gd-predict-stage"><div><span>输入 x</span><strong>{sample.x.toFixed(2)}</strong></div><b>× w {params.w.toFixed(2)}<br />＋ b {params.b.toFixed(2)}</b><div className="hot"><span>预测 ŷ</span><strong>{sample.prediction.toFixed(3)}</strong></div><i>真实 y = {sample.y.toFixed(2)}</i></div>
  if (step === 2) return <div className="gd-loss-stage"><div className="loss-pair"><span>预测 {sample.prediction.toFixed(3)}</span><b>−</b><span>真实 {sample.y.toFixed(3)}</span></div><div className="loss-square">平方误差<strong>{sample.error.toFixed(3)}² = {(sample.error ** 2).toFixed(4)}</strong></div><div className="loss-mean">全部样本取平均<strong>MSE = {metrics.loss.toFixed(5)}</strong></div></div>
  if (step === 3) return <div className="gd-slope-stage"><div className="slope-curve"><i style={{ left: `${Math.max(8, Math.min(92, 50 + params.w * 16))}%` }} /><span>当前位置 w={params.w.toFixed(2)}</span></div><div className="slope-value"><span>坡度 ∂L/∂w</span><strong>{signed(metrics.dw)}</strong><small>{metrics.dw > 0 ? '向左走可下降' : '向右走可下降'}</small></div></div>
  if (step === 4) return <div className="gd-chain-stage"><div><span>损失</span><strong>L</strong></div><b>∂L/∂ŷ</b><div><span>预测</span><strong>ŷ</strong></div><b>∂ŷ/∂w</b><div><span>权重</span><strong>w</strong></div><i>相乘得到 ∂L/∂w = {metrics.dw.toFixed(3)}</i></div>
  if (step === 5) return <div className="gd-update-stage"><div><span>旧参数</span><strong>w = {params.w.toFixed(3)}</strong><strong>b = {params.b.toFixed(3)}</strong></div><b>− η × 梯度<br /><em>η = {learningRate.toFixed(2)}</em></b><div className="new"><span>新参数</span><strong>w = {nextParams.w.toFixed(3)}</strong><strong>b = {nextParams.b.toFixed(3)}</strong></div></div>
  return <div className="gd-converge-stage"><svg viewBox="0 0 430 230"><path d="M 25 25 C 80 190, 130 45, 210 170 S 350 205, 405 205" /><circle cx="36" cy="55" r="8"><animate attributeName="cx" values="36;118;205;300;395" dur="3s" repeatCount="indefinite" /><animate attributeName="cy" values="55;112;170;194;204" dur="3s" repeatCount="indefinite" /></circle></svg><div><span>每轮训练</span><strong>参数更接近低损失区域</strong><small>直到收敛或达到停止条件</small></div></div>
}

function RegressionChart({ params, metrics }) {
  const left = 62; const right = 680; const top = 30; const bottom = 350
  const px = (x) => left + x * (right - left)
  const py = (y) => bottom - ((y + .2) / 1.6) * (bottom - top)
  return <svg className="gd-chart" viewBox="0 0 730 390" role="img" aria-label="线性回归梯度下降图">
    {[0, .25, .5, .75, 1].map((tick) => <g key={`x-${tick}`}><line x1={px(tick)} y1={top} x2={px(tick)} y2={bottom} /><text x={px(tick)} y={bottom + 23}>{tick.toFixed(2)}</text></g>)}
    {[0, .25, .5, .75, 1].map((tick) => <g key={`y-${tick}`}><line x1={left} y1={py(tick)} x2={right} y2={py(tick)} /><text x={left - 15} y={py(tick) + 4}>{tick.toFixed(2)}</text></g>)}
    <path className="gd-prediction-line" d={`M ${px(0)} ${py(params.b)} L ${px(1)} ${py(params.w + params.b)}`} />
    {metrics.samples.map((sample, index) => <g key={index}><line className="gd-residual" x1={px(sample.x)} y1={py(sample.y)} x2={px(sample.x)} y2={py(sample.prediction)} /><circle className="gd-data-point" cx={px(sample.x)} cy={py(sample.y)} r="7" /><circle className="gd-predicted-point" cx={px(sample.x)} cy={py(sample.prediction)} r="4" /></g>)}
    <text className="axis-title" x={(left + right) / 2} y="386">输入 x</text><text className="axis-title" transform="rotate(-90 14 190)" x="14" y="190">目标 y</text>
  </svg>
}

function LossHistory({ values, current }) {
  const items = [...values, current].slice(-30)
  const max = Math.max(...items, .001)
  const points = items.map((value, index) => `${20 + index * (560 / Math.max(1, items.length - 1))},${100 - value / max * 75}`).join(' ')
  return <div className="gd-history"><div><strong>损失变化</strong><span>最近 {items.length} 次</span></div><svg viewBox="0 0 600 115" preserveAspectRatio="none"><line x1="20" y1="100" x2="580" y2="100" /><polyline points={points} /></svg></div>
}

function GdRange({ label, description, value, onChange, ...props }) {
  return <label className="range-field"><span><b>{label}</b><i>{value.toFixed(2)}</i></span><small>{description}</small><input type="range" value={value} onChange={(event) => onChange(Number(event.target.value))} {...props} /></label>
}

function evaluate(params) {
  const samples = DATA.map((point) => {
    const prediction = params.w * point.x + params.b
    return { ...point, prediction, error: prediction - point.y }
  })
  const count = samples.length
  const loss = samples.reduce((sum, sample) => sum + sample.error ** 2, 0) / count
  const dw = 2 * samples.reduce((sum, sample) => sum + sample.error * sample.x, 0) / count
  const db = 2 * samples.reduce((sum, sample) => sum + sample.error, 0) / count
  return { samples, loss, dw, db }
}

function updateParams(params, metrics, learningRate) {
  return { w: params.w - learningRate * metrics.dw, b: params.b - learningRate * metrics.db }
}

function signed(value) { return `${value >= 0 ? '+' : ''}${value.toFixed(4)}` }

function gradientExplanation(metrics, learningRate) {
  const directionW = metrics.dw > 0 ? '减小' : '增大'
  const directionB = metrics.db > 0 ? '减小' : '增大'
  return `为了让损失下降，权重会${directionW}、偏置会${directionB}。当前学习率 ${learningRate.toFixed(2)} 决定这一步移动的距离。`
}

function stepDescription(step, params, metrics, learningRate, nextParams) {
  return [
    '当前模型先沿正向路径做预测，再沿反向路径计算梯度。参数更新后，又用新参数开始下一轮。',
    `模型使用 ŷ = wx + b。当前 w=${params.w.toFixed(2)}、b=${params.b.toFixed(2)}，因此每个输入都会得到一个对应预测。`,
    `预测和真实值之间的差被平方后取平均，得到 MSE=${metrics.loss.toFixed(5)}。损失越小，预测线通常越贴近数据。`,
    `当前 dw=${metrics.dw.toFixed(4)}、db=${metrics.db.toFixed(4)}。它们表示参数轻微增加时，损失会以多快的速度改变。`,
    '反向传播使用链式法则，从损失出发，经过预测值，逐层算回权重和偏置的梯度。',
    `使用“参数 − 学习率 × 梯度”，w 将从 ${params.w.toFixed(3)} 变为 ${nextParams.w.toFixed(3)}。当前学习率是 ${learningRate.toFixed(2)}。`,
    '不断重复后，参数逐渐移动到损失较低的位置。训练的本质就是这个循环，而不是模型记住一条固定答案。',
  ][step]
}
