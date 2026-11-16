import React, { useEffect, useMemo, useState } from 'react'
import { ExperimentHeader } from './AttentionExperiment'
import LearningCycle from './LearningCycle'

const IMAGES = {
  vertical: [[0,0,1,1,1],[0,0,1,1,1],[0,0,1,1,1],[0,0,1,1,1],[0,0,1,1,1]],
  cross: [[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0]],
  corner: [[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0]],
}
const KERNELS = {
  vertical: { name: '垂直边缘', values: [[-1,0,1],[-1,0,1],[-1,0,1]] },
  horizontal: { name: '水平边缘', values: [[-1,-1,-1],[0,0,0],[1,1,1]] },
  sharpen: { name: '锐化', values: [[0,-1,0],[-1,5,-1],[0,-1,0]] },
  blur: { name: '均值模糊', values: [[1/9,1/9,1/9],[1/9,1/9,1/9],[1/9,1/9,1/9]] },
}
const STEPS = [
  { short: '像素', title: '第一步：图像在模型眼中是一张数字表', eyebrow: '01 · 表示图像', why: '计算机不能直接理解轮廓，只能读取每个位置的像素强度。' },
  { short: '卷积核', title: '第二步：卷积核是一块可学习的小型探测器', eyebrow: '02 · 定义特征', why: '一组固定大小的权重会在整张图上复用，用较少参数寻找同一种局部特征。' },
  { short: '滑动', title: '第三步：卷积核每次只观察一个局部区域', eyebrow: '03 · 局部感受野', why: '局部连接让模型优先组合相邻像素，同时保留特征出现的位置。' },
  { short: '乘加', title: '第四步：对应位置相乘，再把九项相加', eyebrow: '04 · 计算响应', why: '像素模式越符合卷积核期待的结构，乘加结果的绝对值通常越大。' },
  { short: '特征图', title: '第五步：滑完整张图，得到一张特征图', eyebrow: '05 · 汇集响应', why: '特征图记录同一种模式在每个局部区域的响应强弱。' },
  { short: '激活', title: '第六步：ReLU 保留正响应，截断负响应', eyebrow: '06 · 非线性筛选', why: '激活函数让网络能够表达复杂规律，并突出当前卷积核检测到的正向特征。' },
  { short: '池化', title: '最后一步：池化压缩尺寸并保留强特征', eyebrow: '07 · 下采样', why: '最大池化减少后续计算量，也让小幅位置变化不容易改变最终表示。' },
]

export default function ConvolutionExperiment({ experiment }) {
  const [image, setImage] = useState(IMAGES.vertical)
  const [preset, setPreset] = useState('vertical')
  const [kernelKey, setKernelKey] = useState('vertical')
  const [position, setPosition] = useState(0)
  const [relu, setRelu] = useState(true)
  const [scanning, setScanning] = useState(false)
  const kernel = KERNELS[kernelKey]
  const rawFeature = useMemo(() => convolve(image, kernel.values), [image, kernel])
  const feature = useMemo(() => relu ? rawFeature.map((row) => row.map((value) => Math.max(0, value))) : rawFeature, [rawFeature, relu])
  const pooled = useMemo(() => maxPool(feature), [feature])
  const row = Math.floor(position / 3); const col = position % 3
  const calculation = patchCalculation(image, kernel.values, row, col)

  useEffect(() => {
    if (!scanning) return undefined
    const timer = window.setInterval(() => setPosition((current) => {
      if (current >= 8) { setScanning(false); return 8 }
      return current + 1
    }), 700)
    return () => window.clearInterval(timer)
  }, [scanning])

  function selectImage(key) {
    setPreset(key); setImage(IMAGES[key].map((item) => [...item])); setPosition(0); setScanning(false)
  }
  function togglePixel(r, c) {
    setPreset('custom'); setScanning(false)
    setImage((current) => current.map((line, ri) => line.map((value, ci) => ri === r && ci === c ? (value >= .5 ? 0 : 1) : value)))
  }

  return <>
    <ExperimentHeader experiment={experiment} eyebrow="人工智能实验 04" />
    <ConvolutionStory image={image} kernel={kernel.values} feature={feature} pooled={pooled} position={position} calculation={calculation} relu={relu} />
    <div className="explore-heading"><span>自由探索 · 把每一次乘加都看清楚</span><h2>亲手移动卷积核，寻找图像中的局部特征</h2><p>点击像素修改图案，切换不同卷积核，再逐格扫描，比较输入区域与特征图响应。</p></div>
    <div className="lab-layout cnn-lab-layout">
      <aside className="control-panel">
        <div className="panel-title"><span>卷积参数</span><i className={scanning ? 'online' : ''}>{scanning ? '正在扫描' : `位置 ${position + 1}/9`}</i></div>
        <label className="field-block"><span>输入图案</span><small>预设会重置像素；也可以直接点击右侧输入矩阵自行绘制。</small><select value={preset} onChange={(event) => selectImage(event.target.value)}><option value="vertical">垂直边界</option><option value="cross">十字图案</option><option value="corner">左上角</option>{preset === 'custom' && <option value="custom">自定义图案</option>}</select></label>
        <label className="field-block"><span>卷积核类型</span><small>不同权重组合会对不同局部模式产生强响应。</small><select value={kernelKey} onChange={(event) => { setKernelKey(event.target.value); setPosition(0); setScanning(false) }}>{Object.entries(KERNELS).map(([key, item]) => <option value={key} key={key}>{item.name}</option>)}</select></label>
        <div className="cnn-kernel-preview"><span>当前 3×3 卷积核</span><MatrixGrid values={kernel.values} compact signed /></div>
        <label className="cnn-toggle"><input type="checkbox" checked={relu} onChange={(event) => setRelu(event.target.checked)} /><span><strong>启用 ReLU</strong><small>将特征图中的负数变成 0</small></span></label>
        <div className="step-counter"><span>卷积核位置</span><strong>{position + 1} / 9</strong></div>
        <input className="step-slider" type="range" min="0" max="8" value={position} onChange={(event) => { setPosition(Number(event.target.value)); setScanning(false) }} />
        <div className="step-buttons"><button type="button" disabled={position === 0} onClick={() => setPosition((value) => value - 1)}>← 上一格</button><button type="button" disabled={position === 8} onClick={() => setPosition((value) => value + 1)}>下一格 →</button></div>
        <button className={`cnn-scan-button ${scanning ? 'stop' : ''}`} type="button" onClick={() => { if (position === 8) setPosition(0); setScanning((value) => !value) }}>{scanning ? '暂停扫描' : '▶ 自动扫描整张图'}</button>
        <div className="live-explanation" key={`${position}-${kernelKey}-${relu}-${image.flat().join('')}`}><span>当前局部计算</span><strong>位置 ({row + 1}, {col + 1}) 的卷积结果 = {calculation.sum.toFixed(3)}</strong><p>{responseExplanation(calculation.sum, kernel.name, relu)}</p></div>
      </aside>
      <section className="visual-panel cnn-visual-panel">
        <div className="visual-toolbar"><div><strong>卷积数据流</strong><span>橙框：当前感受野 · 颜色越亮：响应绝对值越大</span></div><span className="source-chip">步长 1 · 无填充</span></div>
        <div className="cnn-workbench">
          <div className="cnn-matrix-block"><span>输入图像 · 5×5</span><PixelGrid values={image} activeRow={row} activeCol={col} onToggle={togglePixel} /></div>
          <div className="cnn-flow-arrow"><b>⊛</b><span>卷积</span></div>
          <div className="cnn-matrix-block"><span>{relu ? 'ReLU 特征图' : '原始特征图'} · 3×3</span><FeatureGrid values={feature} active={position} onSelect={setPosition} /></div>
          <div className="cnn-flow-arrow"><b>→</b><span>池化</span></div>
          <div className="cnn-matrix-block"><span>最大池化 · 2×2</span><FeatureGrid values={pooled} small /></div>
        </div>
        <div className="cnn-multiply-panel"><div><span>当前 3×3 图像区域</span><MatrixGrid values={calculation.patch} /></div><b>×</b><div><span>卷积核</span><MatrixGrid values={kernel.values} signed /></div><b>=</b><div className="cnn-products"><span>逐项乘积之和</span><code>{calculation.products.map((value) => format(value)).join(' + ')}</code><strong>{calculation.sum.toFixed(3)}</strong></div></div>
        <div className="cnn-formula"><span>输出尺寸</span><code>(输入尺寸 5 − 卷积核 3) ÷ 步长 1 + 1 = 3，所以得到 3 × 3 特征图</code></div>
      </section>
    </div>
    <LearningCycle experimentId="convolution" prediction={{ question: '垂直边缘卷积核通常会在哪里产生较强响应？', options: ['颜色完全均匀的区域', '像素从左到右明显变化的位置', '图像四个角固定位置'], answer: '像素从左到右明显变化的位置', explanation: ' 卷积核左右权重符号相反，因此会放大水平方向上的亮度变化。' }} operation={{ title: '让卷积核检测不同方向的边缘', instruction: '保持输入为十字图案，分别选择垂直边缘和水平边缘卷积核，比较两张特征图。' }} observation={`当前使用“${kernel.name}”卷积核，位置 (${row + 1}, ${col + 1}) 的原始响应为 ${calculation.sum.toFixed(3)}，${relu ? 'ReLU 已启用' : 'ReLU 未启用'}。`} summaryPrompt="卷积核、特征图和池化分别解决了什么问题？" />
  </>
}

function ConvolutionStory({ image, kernel, feature, pooled, position, calculation, relu }) {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [slidePos, setSlidePos] = useState(0)
  const [slideAuto, setSlideAuto] = useState(true)

  // 当处于第 2 步（滑动）时，自动循环滑动 3x3 感受野 (0~8)
  useEffect(() => {
    if (step !== 2 || !slideAuto) return undefined
    const interval = window.setInterval(() => {
      setSlidePos((current) => (current + 1) % 9)
    }, Math.max(350, Math.round(850 / speed)))
    return () => window.clearInterval(interval)
  }, [step, speed, slideAuto])

  useEffect(() => {
    if (!playing) return undefined
    const duration = step === 2 ? 6800 / speed : 2800 / speed
    const timer = window.setTimeout(() => setStep((current) => {
      if (current === STEPS.length - 1) {
        setPlaying(false)
        return current
      }
      return current + 1
    }), duration)
    return () => window.clearTimeout(timer)
  }, [playing, speed, step])

  function selectStep(value) {
    setStep(value)
    setPlaying(false)
    if (value === 2) {
      setSlidePos(0)
      setSlideAuto(true)
    }
  }

  return (
    <section className="transformer-story cnn-story" aria-label="卷积神经网络动画导学">
      <header className="story-intro">
        <div>
          <span className="story-kicker">动画导学 · 约 3 分钟</span>
          <h2>跟随一块 3×3 卷积核，扫描完整张图像</h2>
          <p>同一块卷积核会在所有位置复用，每到一格都完成一次“对应相乘再求和”。</p>
        </div>
        <div className="cnn-story-status">
          <span>本次计算</span>
          <strong>5×5 ⊛ 3×3 → 3×3</strong>
          <small>步长 1 · 无填充 · {relu ? '使用 ReLU' : '不使用 ReLU'}</small>
        </div>
      </header>
      <nav className="story-timeline" style={{ '--story-steps': STEPS.length }}>
        {STEPS.map((item, index) => (
          <button
            type="button"
            key={item.short}
            className={`${index === step ? 'active' : ''} ${index < step ? 'passed' : ''}`}
            onClick={() => selectStep(index)}
          >
            <i>{index < step ? '✓' : index + 1}</i>
            <span>{item.short}</span>
          </button>
        ))}
      </nav>
      <div className="story-stage" key={step}>
        <div className="story-copy">
          <span>{STEPS[step].eyebrow}</span>
          <h3>{STEPS[step].title}</h3>
          <p>{storyDescription(step, calculation, relu)}</p>
          <aside>
            <strong>为什么需要它？</strong>
            <p>{STEPS[step].why}</p>
          </aside>
        </div>
        <div className="story-visual">
          <CnnStoryVisual
            step={step}
            image={image}
            kernel={kernel}
            feature={feature}
            pooled={pooled}
            position={position}
            slidePos={slidePos}
            onSelectSlidePos={setSlidePos}
            slideAuto={slideAuto}
            onToggleSlideAuto={() => setSlideAuto((v) => !v)}
            calculation={calculation}
          />
        </div>
      </div>
      <footer className="story-controls">
        <button type="button" disabled={step === 0} onClick={() => selectStep(step - 1)}>
          ← 上一步
        </button>
        <button
          className="story-play"
          type="button"
          onClick={() => {
            if (step === STEPS.length - 1) setStep(0)
            setPlaying((value) => !value)
          }}
        >
          {playing ? '暂停讲解' : step === STEPS.length - 1 ? '重新播放' : '▶ 自动播放'}
        </button>
        <button type="button" disabled={step === STEPS.length - 1} onClick={() => selectStep(step + 1)}>
          下一步 →
        </button>
        <label>
          速度
          <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
            <option value={0.75}>0.75×</option>
            <option value={1}>1×</option>
            <option value={1.5}>1.5×</option>
          </select>
        </label>
      </footer>
    </section>
  )
}

function CnnStoryVisual({ step, image, kernel, feature, pooled, position, slidePos = 0, onSelectSlidePos, slideAuto, onToggleSlideAuto, calculation }) {
  if (step === 0) return <div className="cnn-story-pixels"><MatrixGrid values={image} /><div><span>每个格子都是一个像素值</span><strong>0 = 暗　1 = 亮</strong></div></div>
  if (step === 1) return <div className="cnn-story-kernel"><MatrixGrid values={kernel} signed /><div><span>9 个可学习权重</span><strong>共同描述一种局部模式</strong></div></div>
  if (step === 2) {
    const sRow = Math.floor(slidePos / 3)
    const sCol = slidePos % 3
    return (
      <div className="cnn-story-slide">
        <PixelGrid values={image} activeRow={sRow} activeCol={sCol} />
        <div className="cnn-slide-indicator">
          <i className="pulse-dot">●</i>
          <span>3×3 感受野正在滑动：第 {slidePos + 1}/9 处位置（第 {sRow + 1} 行，第 {sCol + 1} 列）</span>
        </div>
        <div className="cnn-slide-stepper">
          <button type="button" onClick={() => { onSelectSlidePos?.((slidePos + 8) % 9); onToggleSlideAuto && slideAuto && onToggleSlideAuto() }} title="上一格">
            ← 上一格
          </button>
          <button type="button" className={`cnn-slide-pause-btn ${slideAuto ? 'is-auto' : ''}`} onClick={onToggleSlideAuto}>
            {slideAuto ? '❚❚ 暂停移动' : '▶ 自动移动'}
          </button>
          <button type="button" onClick={() => { onSelectSlidePos?.((slidePos + 1) % 9); onToggleSlideAuto && slideAuto && onToggleSlideAuto() }} title="下一格">
            下一格 →
          </button>
        </div>
      </div>
    )
  }
  if (step === 3) return <div className="cnn-story-calc"><MatrixGrid values={calculation.patch} /><b>×</b><MatrixGrid values={kernel} signed /><b>→</b><div><span>求和</span><strong>{calculation.sum.toFixed(3)}</strong></div></div>
  if (step === 4) return <div className="cnn-story-feature"><FeatureGrid values={feature} active={position} /><div><span>每个输出格</span><strong>对应输入中的一个局部区域</strong></div></div>
  if (step === 5) return <div className="cnn-story-relu"><div><span>卷积原值</span><strong>{calculation.sum.toFixed(3)}</strong></div><b>ReLU<br />max(0, x)</b><div className="hot"><span>激活后</span><strong>{Math.max(0, calculation.sum).toFixed(3)}</strong></div></div>
  return <div className="cnn-story-pool"><FeatureGrid values={feature} /><b>2×2<br />最大池化</b><FeatureGrid values={pooled} small /></div>
}

function PixelGrid({ values, activeRow = -1, activeCol = -1, onToggle }) {
  return <div className="pixel-grid" style={{ '--size': values.length }}>{values.flatMap((row, r) => row.map((value, c) => <button type="button" key={`${r}-${c}`} disabled={!onToggle} onClick={() => onToggle?.(r, c)} className={r >= activeRow && r < activeRow + 3 && c >= activeCol && c < activeCol + 3 ? 'active' : ''} style={{ '--pixel': value }}><span>{format(value)}</span></button>))}</div>
}
function FeatureGrid({ values, active = -1, onSelect, small }) {
  const flat = values.flat(); const max = Math.max(...flat.map(Math.abs), .001)
  return <div className={`feature-grid ${small ? 'small' : ''}`} style={{ '--size': values.length }}>{flat.map((value, index) => <button type="button" disabled={!onSelect} onClick={() => onSelect?.(index)} key={index} className={index === active ? 'active' : ''} style={{ '--strength': Math.abs(value) / max, '--tone': value < 0 ? '238,108,77' : '101,88,232' }}>{format(value)}</button>)}</div>
}
function MatrixGrid({ values, compact, signed }) { return <div className={`matrix-grid ${compact ? 'compact' : ''}`} style={{ '--size': values.length }}>{values.flat().map((value, index) => <span className={signed ? value > 0 ? 'positive' : value < 0 ? 'negative' : '' : ''} key={index}>{format(value)}</span>)}</div> }

function convolve(image, kernel) { return Array.from({ length: 3 }, (_, r) => Array.from({ length: 3 }, (_, c) => patchCalculation(image, kernel, r, c).sum)) }
function patchCalculation(image, kernel, row, col) { const patch = Array.from({ length: 3 }, (_, r) => Array.from({ length: 3 }, (_, c) => image[row + r][col + c])); const products = patch.flatMap((line, r) => line.map((value, c) => value * kernel[r][c])); return { patch, products, sum: products.reduce((sum, value) => sum + value, 0) } }
function maxPool(values) { return Array.from({ length: 2 }, (_, r) => Array.from({ length: 2 }, (_, c) => Math.max(values[r][c], values[r][c + 1], values[r + 1][c], values[r + 1][c + 1]))) }
function format(value) { if (Math.abs(value) < .0001) return '0'; return Number.isInteger(value) ? String(value) : value.toFixed(2) }
function responseExplanation(sum, kernelName, relu) { const strength = Math.abs(sum) < .2 ? '响应很弱，当前区域不太符合卷积核寻找的模式' : Math.abs(sum) < 1 ? '产生了中等响应' : '响应较强，当前区域与目标特征较匹配'; return `“${kernelName}”在这里${strength}。${relu && sum < 0 ? '由于启用了 ReLU，负响应会在特征图中显示为 0。' : ''}` }
function storyDescription(step, calculation, relu) { return ['输入被表示为 5×5 数字矩阵。亮色格子的值更大，暗色格子的值更小。','3×3 卷积核包含 9 个权重。权重排列方式决定它更擅长响应哪种局部结构。','卷积核覆盖输入中的 3×3 区域，然后按步长 1 向右、向下移动。','当前九组对应数值分别相乘再求和，得到 '+calculation.sum.toFixed(3)+'，写入特征图的对应位置。','卷积核扫描完 9 个位置后形成 3×3 特征图，亮色表示更强的局部响应。',`ReLU 使用 max(0,x)。当前原始值 ${calculation.sum.toFixed(3)} 会变为 ${relu ? Math.max(0,calculation.sum).toFixed(3) : '未启用'}。`,'2×2 最大池化每次保留局部最大响应，把 3×3 特征图压缩成 2×2。'][step] }
