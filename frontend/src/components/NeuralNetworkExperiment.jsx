import React, { useEffect, useMemo, useState } from 'react'
import { ExperimentHeader } from './AttentionExperiment'
import LearningCycle from './LearningCycle'

const INITIAL_NEURONS = [
  { w1: 1.2, w2: 0.8, bias: -0.5 },
  { w1: -0.4, w2: 1.3, bias: 0.1 },
  { w1: 0.7, w2: -0.6, bias: 0.2 },
]

const STORY_STEPS = [
  { short: '全局', title: '先看全局：数据怎样变成一次预测', eyebrow: '01 · 建立地图', why: '先看清输入层、隐藏层和输出层的职责，公式才不会变成孤立的数字。' },
  { short: '输入', title: '第一步：把现实信息转换成输入特征', eyebrow: '02 · 准备数据', why: '神经网络只处理数字，因此要把“学习情况”表示成范围统一的数值特征。' },
  { short: '权重', title: '第二步：权重决定每条信息有多重要', eyebrow: '03 · 传递信号', why: '权重是模型从数据中学到的参数；绝对值越大，这个输入对神经元的影响通常越强。' },
  { short: '求和', title: '第三步：加权求和，再加入偏置', eyebrow: '04 · 汇总证据', why: '加权求和把多个输入合成一个分数，偏置则负责移动神经元开始响应的门槛。' },
  { short: '激活', title: '第四步：激活函数决定信号是否继续传递', eyebrow: '05 · 引入非线性', why: '没有激活函数，堆再多层也只相当于一次线性变换，无法学习弯曲、复杂的规律。' },
  { short: '隐藏层', title: '第五步：多个神经元并行提取不同模式', eyebrow: '06 · 组合特征', why: '不同神经元拥有不同参数，因此会对输入形成不同的观察角度。' },
  { short: '输出', title: '最后一步：把隐藏表示转换成预测概率', eyebrow: '07 · 得到结果', why: '输出层再次汇总隐藏信号，并用 Sigmoid 把任意分数压缩到 0～1。' },
]

export default function NeuralNetworkExperiment({ experiment }) {
  const [inputs, setInputs] = useState([0.7, 0.6])
  const [neurons, setNeurons] = useState(INITIAL_NEURONS)
  const [activation, setActivation] = useState('relu')
  const [focus, setFocus] = useState(0)
  const model = useMemo(() => calculateNetwork(inputs, neurons, activation), [inputs, neurons, activation])
  const focused = model.hidden[focus]

  function setInput(index, value) {
    setInputs((current) => current.map((item, itemIndex) => itemIndex === index ? value : item))
  }

  function setNeuronValue(field, value) {
    setNeurons((current) => current.map((neuron, index) => index === focus ? { ...neuron, [field]: value } : neuron))
  }

  function reset() {
    setInputs([0.7, 0.6])
    setNeurons(INITIAL_NEURONS)
    setActivation('relu')
    setFocus(0)
  }

  return (
    <>
      <ExperimentHeader experiment={experiment} eyebrow="人工智能实验 02" />
      <NeuralNetworkStory inputs={inputs} model={model} activation={activation} focus={focus} setFocus={setFocus} />
      <div className="explore-heading"><span>自由探索 · 让每个数字都产生可见影响</span><h2>亲手控制一次前向传播</h2><p>选择一个隐藏神经元，调整它的权重和偏置；左侧每次操作都会立即改变右侧连线、节点值和最终预测。</p></div>
      <div className="lab-layout nn-lab-layout">
        <aside className="control-panel">
          <div className="panel-title"><span>模型参数</span><i>实时计算</i></div>
          <NnRange label="学习投入 x₁" description="把每天学习投入归一化为 0～1；越靠右代表投入越高。" value={inputs[0]} min={0} max={1} step={0.05} onChange={(value) => setInput(0, value)} />
          <NnRange label="练习完成度 x₂" description="练习任务的完成比例，同样归一化到 0～1。" value={inputs[1]} min={0} max={1} step={0.05} onChange={(value) => setInput(1, value)} />
          <label className="field-block"><span>激活函数</span><small>决定隐藏层如何把加权和转换成输出。</small><select value={activation} onChange={(event) => setActivation(event.target.value)}><option value="relu">ReLU</option><option value="sigmoid">Sigmoid</option><option value="tanh">Tanh</option></select></label>
          <div className="nn-neuron-tabs" aria-label="选择要调节的隐藏神经元">{neurons.map((_, index) => <button className={focus === index ? 'active' : ''} type="button" key={index} onClick={() => setFocus(index)}>H{index + 1}</button>)}</div>
          <NnRange label={`H${focus + 1} 的权重 w₁`} description="控制学习投入对当前神经元的影响方向和强度。" value={neurons[focus].w1} min={-2} max={2} step={0.1} onChange={(value) => setNeuronValue('w1', value)} />
          <NnRange label={`H${focus + 1} 的权重 w₂`} description="控制练习完成度对当前神经元的影响。" value={neurons[focus].w2} min={-2} max={2} step={0.1} onChange={(value) => setNeuronValue('w2', value)} />
          <NnRange label={`H${focus + 1} 的偏置 b`} description="整体移动当前神经元的响应门槛。" value={neurons[focus].bias} min={-1.5} max={1.5} step={0.1} onChange={(value) => setNeuronValue('bias', value)} />
          <div className="live-explanation" key={`${inputs.join('-')}-${focus}-${activation}-${neurons[focus].w1}-${neurons[focus].w2}-${neurons[focus].bias}`}><span>你的操作意味着</span><strong>H{focus + 1}：z = {focused.z.toFixed(3)} → {activationLabel(activation)}(z) = {focused.value.toFixed(3)}</strong><p>{explainNeuron(neurons[focus], focused, activation)}</p></div>
        </aside>
        <section className="visual-panel nn-visual-panel">
          <div className="visual-toolbar"><div><strong>神经网络数据流</strong><span>连线粗细 = |权重| · 蓝色为正权重 · 橙色为负权重</span></div><button className="text-button" type="button" onClick={reset}>恢复默认</button></div>
          <NeuralNetworkCanvas inputs={inputs} neurons={neurons} model={model} focus={focus} setFocus={setFocus} />
          <div className="nn-formula-panel"><span>当前 H{focus + 1} 的完整计算</span><code>z = {inputs[0].toFixed(2)} × {neurons[focus].w1.toFixed(1)} + {inputs[1].toFixed(2)} × {neurons[focus].w2.toFixed(1)} + ({neurons[focus].bias.toFixed(1)}) = {focused.z.toFixed(3)}</code><code>a = {activationLabel(activation)}({focused.z.toFixed(3)}) = {focused.value.toFixed(3)}</code></div>
          <div className="nn-prediction"><div><span>最终预测概率</span><strong>{(model.probability * 100).toFixed(1)}%</strong></div><div className="nn-probability-track"><i style={{ width: `${model.probability * 100}%` }} /></div><p>{model.probability >= 0.5 ? '模型当前倾向于判断：能够掌握该知识点。' : '模型当前倾向于判断：还需要增加学习或练习投入。'} 这是教学用简化网络，不代表真实学习评价。</p></div>
        </section>
      </div>
      <LearningCycle
        experimentId="neural-network"
        prediction={{
          question: '如果把某个正权重从 0.5 调高到 1.5，且输入为正，它对加权和的贡献通常会怎样？',
          options: ['贡献增大', '贡献减小', '完全不变'],
          answer: '贡献增大',
          explanation: ' 正输入乘以更大的正权重，会产生更大的正向贡献。',
        }}
        operation={{ title: '让同一个神经元从关闭变为激活', instruction: '选择 ReLU 和 H1，先把偏置调低，再逐渐提高，观察 z、激活值和最终概率如何变化。' }}
        observation={`当前 H${focus + 1} 的加权和为 ${focused.z.toFixed(3)}，激活值为 ${focused.value.toFixed(3)}；网络最终输出 ${(model.probability * 100).toFixed(1)}%。`}
        summaryPrompt="权重、偏置和激活函数分别在前向传播中起什么作用？"
      />
    </>
  )
}

function NeuralNetworkStory({ inputs, model, activation, focus, setFocus }) {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)

  useEffect(() => {
    if (!playing) return undefined
    const timer = window.setTimeout(() => setStep((current) => {
      if (current === STORY_STEPS.length - 1) { setPlaying(false); return current }
      return current + 1
    }), 2700 / speed)
    return () => window.clearTimeout(timer)
  }, [playing, speed, step])

  function selectStep(next) { setStep(next); setPlaying(false) }
  const focused = model.hidden[focus]

  return (
    <section className="transformer-story nn-story" aria-label="神经网络前向传播动画导学">
      <header className="story-intro"><div><span className="story-kicker">动画导学 · 约 3 分钟</span><h2>跟随两个数字，走完一次前向传播</h2><p>同一组输入贯穿所有步骤。橙色光点代表正在向前传递的数值信号。</p></div><div className="nn-story-case"><span>本次案例</span><strong>预测能否掌握一个知识点</strong><small>学习投入 {inputs[0].toFixed(2)} · 练习完成度 {inputs[1].toFixed(2)}</small></div></header>
      <nav className="story-timeline" style={{ '--story-steps': STORY_STEPS.length }} aria-label="讲解章节">{STORY_STEPS.map((item, index) => <button key={item.short} className={`${index === step ? 'active' : ''} ${index < step ? 'passed' : ''}`} type="button" onClick={() => selectStep(index)}><i>{index < step ? '✓' : index + 1}</i><span>{item.short}</span></button>)}</nav>
      <div className="story-stage" key={`${step}-${focus}`}><div className="story-copy"><span>{STORY_STEPS[step].eyebrow}</span><h3>{STORY_STEPS[step].title}</h3><p>{nnStepDescription(step, inputs, model, focus, activation)}</p><aside><strong>为什么需要它？</strong><p>{STORY_STEPS[step].why}</p></aside></div><div className="story-visual"><NnStoryVisual step={step} inputs={inputs} model={model} activation={activation} focus={focus} setFocus={setFocus} /></div></div>
      <footer className="story-controls"><button type="button" disabled={step === 0} onClick={() => selectStep(step - 1)}>← 上一步</button><button className="story-play" type="button" onClick={() => { if (step === STORY_STEPS.length - 1) setStep(0); setPlaying((value) => !value) }}>{playing ? '暂停讲解' : step === STORY_STEPS.length - 1 ? '重新播放' : '▶ 自动播放'}</button><button type="button" disabled={step === STORY_STEPS.length - 1} onClick={() => selectStep(step + 1)}>下一步 →</button><label>速度<select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}><option value={0.75}>0.75×</option><option value={1}>1×</option><option value={1.5}>1.5×</option></select></label></footer>
    </section>
  )
}

function NnStoryVisual({ step, inputs, model, activation, focus, setFocus }) {
  const focused = model.hidden[focus]
  if (step === 0) return <div className="nn-overview"><NnFlowBox label="输入层" value="2 个特征" /><b>→</b><NnFlowBox label="隐藏层" value="3 个神经元" hot /><b>→</b><NnFlowBox label="输出层" value="1 个概率" /></div>
  if (step === 1) return <div className="nn-feature-stage"><FeatureCard icon="时" label="学习投入 x₁" value={inputs[0]} /><FeatureCard icon="练" label="练习完成度 x₂" value={inputs[1]} /></div>
  if (step === 2) return <div className="nn-weight-stage"><div className="nn-input-pair"><span>x₁ = {inputs[0].toFixed(2)}</span><span>x₂ = {inputs[1].toFixed(2)}</span></div><div className="nn-weight-lines"><i style={{ '--line-weight': Math.abs(focused.w1), '--line-color': focused.w1 >= 0 ? '#7568e7' : '#ee6c4d' }}><b>w₁ = {focused.w1.toFixed(1)}</b></i><i style={{ '--line-weight': Math.abs(focused.w2), '--line-color': focused.w2 >= 0 ? '#7568e7' : '#ee6c4d' }}><b>w₂ = {focused.w2.toFixed(1)}</b></i></div><button type="button" className="nn-story-neuron">H{focus + 1}</button></div>
  if (step === 3) return <div className="nn-sum-stage"><div><span>x₁ × w₁</span><strong>{(inputs[0] * focused.w1).toFixed(3)}</strong></div><b>＋</b><div><span>x₂ × w₂</span><strong>{(inputs[1] * focused.w2).toFixed(3)}</strong></div><b>＋</b><div><span>偏置 b</span><strong>{focused.bias.toFixed(3)}</strong></div><b>＝</b><div className="sum-result"><span>加权和 z</span><strong>{focused.z.toFixed(3)}</strong></div></div>
  if (step === 4) return <div className="nn-activation-stage"><div className="activation-axis"><i style={{ left: `${Math.max(4, Math.min(96, 50 + focused.z * 18))}%` }} /><span>z = {focused.z.toFixed(3)}</span></div><div className="activation-gate"><span>{activationLabel(activation)}</span><b>{activationFormula(activation)}</b></div><div className="activation-output"><span>激活值 a</span><strong>{focused.value.toFixed(3)}</strong></div></div>
  if (step === 5) return <div className="nn-hidden-stage">{model.hidden.map((neuron, index) => <button type="button" key={index} className={focus === index ? 'active' : ''} onClick={() => setFocus(index)}><span>H{index + 1}</span><strong>{neuron.value.toFixed(3)}</strong><i style={{ height: `${Math.min(100, Math.abs(neuron.value) * 75 + 12)}%` }} /></button>)}</div>
  return <div className="nn-output-stage"><div className="hidden-values">{model.hidden.map((neuron, index) => <span key={index}>H{index + 1}<b>{neuron.value.toFixed(2)}</b></span>)}</div><div className="output-arrow">加权汇总 → Sigmoid</div><div className="output-orb"><span>预测概率</span><strong>{(model.probability * 100).toFixed(1)}%</strong></div></div>
}

function NeuralNetworkCanvas({ inputs, neurons, model, focus, setFocus }) {
  const inputNodes = [{ x: 90, y: 125, label: 'x₁', value: inputs[0] }, { x: 90, y: 315, label: 'x₂', value: inputs[1] }]
  const hiddenNodes = model.hidden.map((item, index) => ({ x: 380, y: 90 + index * 130, label: `H${index + 1}`, value: item.value }))
  const output = { x: 675, y: 220, label: 'ŷ', value: model.probability }
  const outputWeights = [1.1, 0.9, -0.5]
  return <svg className="nn-canvas" viewBox="0 0 770 440" role="img" aria-label="神经网络前向传播图">
    <defs><filter id="nn-glow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
    <text className="nn-layer-label" x="90" y="30">输入层</text><text className="nn-layer-label" x="380" y="30">隐藏层</text><text className="nn-layer-label" x="675" y="30">输出层</text>
    {inputNodes.flatMap((input, inputIndex) => hiddenNodes.map((hidden, hiddenIndex) => <NnEdge key={`${inputIndex}-${hiddenIndex}`} from={input} to={hidden} weight={neurons[hiddenIndex][inputIndex === 0 ? 'w1' : 'w2']} active={focus === hiddenIndex} delay={(inputIndex * 3 + hiddenIndex) * .08} />))}
    {hiddenNodes.map((hidden, index) => <NnEdge key={`out-${index}`} from={hidden} to={output} weight={outputWeights[index]} active={focus === index} delay={.5 + index * .1} />)}
    {inputNodes.map((node) => <NnNode key={node.label} node={node} kind="input" />)}
    {hiddenNodes.map((node, index) => <NnNode key={node.label} node={node} active={focus === index} onClick={() => setFocus(index)} />)}
    <NnNode node={output} kind="output" />
  </svg>
}

function NnEdge({ from, to, weight, active, delay }) {
  const width = 1 + Math.min(6, Math.abs(weight) * 3)
  const color = weight >= 0 ? '#7467e8' : '#ee6c4d'
  return <g className={active ? 'nn-edge active' : 'nn-edge'}><path d={`M ${from.x + 34} ${from.y} C ${from.x + 145} ${from.y}, ${to.x - 145} ${to.y}, ${to.x - 34} ${to.y}`} fill="none" stroke={color} strokeWidth={width} strokeOpacity={active ? .9 : .25} /><circle r="5" fill={color} filter="url(#nn-glow)" style={{ animationDelay: `${delay}s` }}><animateMotion dur="2.4s" repeatCount="indefinite" path={`M ${from.x + 34} ${from.y} C ${from.x + 145} ${from.y}, ${to.x - 145} ${to.y}, ${to.x - 34} ${to.y}`} /></circle><text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 7} fill={color}>{weight.toFixed(1)}</text></g>
}

function NnNode({ node, active, kind = 'hidden', onClick }) {
  return <g className={`nn-canvas-node ${kind} ${active ? 'active' : ''}`} transform={`translate(${node.x},${node.y})`} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}><circle r={active ? 38 : 33} /><text y="-5">{node.label}</text><text className="node-value" y="16">{node.value.toFixed(3)}</text></g>
}

function NnRange({ label, description, value, onChange, ...props }) {
  return <label className="range-field"><span><b>{label}</b><i>{value.toFixed(2)}</i></span><small>{description}</small><input type="range" value={value} onChange={(event) => onChange(Number(event.target.value))} {...props} /></label>
}

function NnFlowBox({ label, value, hot }) { return <div className={hot ? 'hot' : ''}><span>{label}</span><strong>{value}</strong></div> }
function FeatureCard({ icon, label, value }) { return <div><i>{icon}</i><span>{label}</span><strong>{value.toFixed(2)}</strong><b><em style={{ width: `${value * 100}%` }} /></b></div> }

function calculateNetwork(inputs, neurons, activation) {
  const hidden = neurons.map((neuron) => {
    const z = inputs[0] * neuron.w1 + inputs[1] * neuron.w2 + neuron.bias
    return { ...neuron, z, value: activate(z, activation) }
  })
  const logit = hidden[0].value * 1.1 + hidden[1].value * 0.9 - hidden[2].value * 0.5 - 0.4
  return { hidden, logit, probability: activate(logit, 'sigmoid') }
}

function activate(value, type) {
  if (type === 'relu') return Math.max(0, value)
  if (type === 'tanh') return Math.tanh(value)
  return 1 / (1 + Math.exp(-value))
}

function activationLabel(type) { return type === 'relu' ? 'ReLU' : type === 'tanh' ? 'Tanh' : 'Sigmoid' }
function activationFormula(type) { return type === 'relu' ? 'max(0, z)' : type === 'tanh' ? '(e²ᶻ−1)/(e²ᶻ+1)' : '1/(1+e⁻ᶻ)' }

function nnStepDescription(step, inputs, model, focus, activation) {
  const neuron = model.hidden[focus]
  return [
    '两个输入不会直接变成答案。它们先被三个隐藏神经元分别加工，再由输出神经元汇总成一个概率。',
    `学习投入被表示为 ${inputs[0].toFixed(2)}，练习完成度为 ${inputs[1].toFixed(2)}。统一到 0～1 后，两种特征可以进入同一次计算。`,
    `正在观察 H${focus + 1}：x₁ 的权重是 ${neuron.w1.toFixed(1)}，x₂ 的权重是 ${neuron.w2.toFixed(1)}。蓝线表示促进，橙线表示抑制。`,
    `H${focus + 1} 把两个“输入 × 权重”相加，再加偏置 ${neuron.bias.toFixed(1)}，得到 z = ${neuron.z.toFixed(3)}。`,
    `${activationLabel(activation)} 接收 z = ${neuron.z.toFixed(3)}，输出 ${neuron.value.toFixed(3)}。这一步为网络加入了非线性。`,
    `三个隐藏神经元的输出分别是 ${model.hidden.map((item) => item.value.toFixed(3)).join('、')}。点击任一节点可以比较它们。`,
    `隐藏层输出再次被加权汇总，最终得到 ${(model.probability * 100).toFixed(1)}% 的预测概率。前向传播到此结束。`,
  ][step]
}

function explainNeuron(neuron, result, activation) {
  const dominant = Math.abs(neuron.w1) >= Math.abs(neuron.w2) ? '学习投入' : '练习完成度'
  const state = activation === 'relu' && result.z <= 0 ? '当前加权和不大于 0，因此 ReLU 把输出截断为 0' : '当前信号已经通过激活函数继续向输出层传递'
  return `${dominant}对这个神经元的影响更强；${state}。`
}
