import React, { useMemo, useState } from 'react'
import { ExperimentHeader } from './AttentionExperiment'
import LearningCycle from './LearningCycle'

const STORY = [
  ['位模式', '计算机只保存 0 和 1，含义由解释方式决定', '同一个 8 位模式既可解释为无符号数，也可解释为补码整数。'],
  ['符号表示', '只加一个符号位会产生 +0 和 -0', '原码的加减法规则复杂，硬件还要额外判断符号。'],
  ['二进制补码', '负数由“绝对值取反再加 1”得到', '补码把减法统一成加法，并让零只有一种表示。'],
  ['溢出判断', '位宽固定时，结果可能超出可表示范围', '两个同号数相加却得到异号结果，说明有符号加法溢出。'],
  ['科学计数', '浮点数用尾数乘以 2 的指数表示', '它用有限位覆盖极大范围，但多数小数只能近似保存。'],
  ['IEEE 754', '32 位单精度分成符号、指数和尾数', '指数采用偏置码，尾数对规格化数省略开头的 1。'],
  ['精度代价', '0.1 的二进制是无限循环小数', '浮点运算会舍入，因此比较和累计时必须考虑误差。'],
]

export default function NumberRepresentationExperiment({ experiment }) {
  const [mode, setMode] = useState('complement')
  const [a, setA] = useState(-13)
  const [b, setB] = useState(7)
  const [floatValue, setFloatValue] = useState(13.25)
  const complement = useMemo(() => complementInfo(a, b), [a, b])
  const float = useMemo(() => float32Info(floatValue), [floatValue])
  return <>
    <ExperimentHeader experiment={experiment} eyebrow="组成原理实验 04" />
    <NumberStory />
    <div className="explore-heading"><span>自由探索 · 改变数值并逐位拆解</span><h2>同一串 0 和 1，怎样表示整数与小数</h2><p>在 8 位补码加法和 IEEE 754 单精度之间切换；系统会解释每一段位模式的用途与限制。</p></div>
    <div className="number-tabs"><button className={mode === 'complement' ? 'active' : ''} onClick={() => setMode('complement')}>8 位补码</button><button className={mode === 'float' ? 'active' : ''} onClick={() => setMode('float')}>IEEE 754 浮点数</button></div>
    {mode === 'complement' ? <ComplementLab a={a} b={b} setA={setA} setB={setB} info={complement} /> : <FloatLab value={floatValue} setValue={setFloatValue} info={float} />}
    <LearningCycle experimentId="number-representation" prediction={{ question: '8 位补码中的 11111111 表示哪个十进制整数？', options: ['255', '-1', '-127'], answer: '-1', explanation: ' 最高位为 1 表示负数；对 11111111 取反得 00000000，再加 1 得绝对值 1，因此它表示 -1。' }} operation={{ title: mode === 'complement' ? '制造一次补码溢出' : '观察 0.1 的浮点误差', instruction: mode === 'complement' ? '把 A 调为 100、B 调为 60，观察正数相加为什么得到负的补码结果。' : '点击预设 0.1，观察实际保存值与输入值之间的舍入误差。' }} observation={mode === 'complement' ? `当前 ${a} + ${b} 的 8 位结果为 ${complement.signedResult}，位模式 ${complement.resultBits}，${complement.overflow ? '发生有符号溢出' : '没有溢出'}。` : `当前 Float32 位模式为 ${float.bits}，实际保存值 ${float.storedText}，误差 ${float.errorText}。`} summaryPrompt="补码和浮点数分别解决了什么表示问题，又各自带来了什么范围或精度限制？" />
  </>
}

function ComplementLab({ a, b, setA, setB, info }) {
  return <div className="lab-layout number-layout"><aside className="control-panel"><div className="panel-title"><span>补码控制台</span><i>-128 ～ 127</i></div><label className="range-field"><span>整数 A <i>{a}</i></span><input type="range" min="-128" max="127" value={a} onChange={(e) => setA(Number(e.target.value))} /></label><label className="range-field"><span>整数 B <i>{b}</i></span><input type="range" min="-128" max="127" value={b} onChange={(e) => setB(Number(e.target.value))} /></label><div className="number-presets"><span>快速示例</span><button onClick={() => { setA(-13); setB(7) }}>负数编码</button><button onClick={() => { setA(100); setB(60) }}>正溢出</button><button onClick={() => { setA(-100); setB(-60) }}>负溢出</button></div><div className={`overflow-box ${info.overflow ? 'warning' : ''}`}><span>有符号溢出检测</span><strong>{info.overflow ? '发生溢出' : '没有溢出'}</strong><p>{info.overflow ? '两个同号操作数相加，结果符号却改变；真实数学结果超出了 8 位补码范围。' : '结果位模式可以在 -128～127 范围内正确解释。'}</p></div></aside><section className="visual-panel number-visual"><div className="visual-toolbar"><div><strong>8 位补码加法器</strong><span>最高位同时参与加法，但被解释为符号权重 −128。</span></div><span className="source-chip">模 256 运算</span></div><BitRow label={`A = ${a}`} bits={info.aBits} /><div className="number-derivation"><span>{a < 0 ? `|${a}| = ${toBits(Math.abs(a), 8)} → 按位取反 → +1` : '正数的补码与普通二进制相同'}</span></div><BitRow label={`B = ${b}`} bits={info.bBits} /><div className="binary-plus">＋</div><BitRow label={`结果 = ${info.signedResult}`} bits={info.resultBits} result /><div className="bit-weights">{[-128, 64, 32, 16, 8, 4, 2, 1].map((weight) => <span key={weight}>{weight}</span>)}</div><div className="number-formula"><span>计算机实际做的事</span><code>{info.aBits} + {info.bBits} = {info.resultBits}（只保留低 8 位）</code><p>数学结果 {a + b}；8 位补码解释结果 {info.signedResult}。{info.overflow && '两者不同，因为超出可表示范围。'}</p></div></section></div>
}

function FloatLab({ value, setValue, info }) {
  return <div className="lab-layout number-layout"><aside className="control-panel"><div className="panel-title"><span>浮点数控制台</span><i>Float32</i></div><label className="field-block"><span>十进制输入</span><input className="number-input" type="number" step="0.01" value={value} onChange={(e) => setValue(clampFloat(e.target.value))} /></label><div className="number-presets"><span>快速示例</span>{[0.5, 13.25, -6.5, 0.1].map((item) => <button className={value === item ? 'active' : ''} key={item} onClick={() => setValue(item)}>{item}</button>)}</div><div className="float-help"><strong>为什么指数要加 127？</strong><p>8 位指数本身按无符号数保存。减去偏置 127 后，才得到真正的二进制指数，从而同时表示正指数和负指数。</p></div><div className={`precision-box ${Math.abs(info.error) > 0 ? 'warning' : ''}`}><span>Float32 实际保存值</span><strong>{info.storedText}</strong><p>与输入值的误差：{info.errorText}</p></div></aside><section className="visual-panel number-visual"><div className="visual-toolbar"><div><strong>IEEE 754 单精度拆解</strong><span>1 位符号 + 8 位指数 + 23 位尾数，共 32 位。</span></div><span className="source-chip">32 bits</span></div><div className="float-fields"><div className="sign"><span>{info.sign}</span><small>符号 S · 1 位</small></div><div className="exponent"><span>{info.exponentBits}</span><small>指数 E · 8 位</small></div><div className="fraction"><span>{info.fractionBits}</span><small>尾数 F · 23 位</small></div></div><div className="float-field-values"><div><span>符号</span><strong>{info.sign === '1' ? '负数' : '正数'}</strong></div><div><span>存储指数</span><strong>{info.exponentRaw}</strong></div><div><span>真实指数</span><strong>{info.special ? '特殊值' : info.exponent}</strong></div><div><span>有效数字</span><strong>{info.mantissaText}</strong></div></div><div className="float-equation"><span>解码公式</span><code>{info.formula}</code><strong>= {info.storedText}</strong></div><div className="float-scale"><span>符号决定方向</span><b>×</b><span>尾数决定精度</span><b>×</b><span>指数决定数量级</span></div><div className="number-formula"><span>完整位模式</span><code>{info.bits}</code><p>{Number(value) === 0.1 ? '0.1 在二进制中无限循环，只能截取 23 位尾数并舍入，所以保存值不是精确的 0.1。' : '当前数值可以按上方字段重新组合；有限尾数决定了可保存的有效精度。'}</p></div></section></div>
}

function BitRow({ label, bits, result = false }) { return <div className={`bit-row ${result ? 'result' : ''}`}><strong>{label}</strong><div>{bits.split('').map((bit, index) => <i className={index === 0 ? 'sign' : ''} key={index}>{bit}</i>)}</div></div> }
function complementInfo(a, b) { const rawA = a & 0xff; const rawB = b & 0xff; const rawResult = (rawA + rawB) & 0xff; const signedResult = rawResult >= 128 ? rawResult - 256 : rawResult; return { aBits: toBits(rawA, 8), bBits: toBits(rawB, 8), resultBits: toBits(rawResult, 8), signedResult, overflow: (a >= 0 && b >= 0 && signedResult < 0) || (a < 0 && b < 0 && signedResult >= 0) } }
function float32Info(input) {
  const value = Number.isFinite(Number(input)) ? Number(input) : 0
  const buffer = new ArrayBuffer(4); const view = new DataView(buffer); view.setFloat32(0, value, false)
  const stored = view.getFloat32(0, false); const raw = view.getUint32(0, false); const bits = raw.toString(2).padStart(32, '0')
  const sign = bits[0]; const exponentBits = bits.slice(1, 9); const fractionBits = bits.slice(9); const exponentRaw = parseInt(exponentBits, 2); const fractionRaw = parseInt(fractionBits, 2)
  const special = exponentRaw === 0 || exponentRaw === 255; const exponent = exponentRaw - 127; const mantissa = exponentRaw === 0 ? fractionRaw / 2 ** 23 : 1 + fractionRaw / 2 ** 23
  const storedText = formatNumber(stored); const error = stored - value
  return { bits, sign, exponentBits, fractionBits, exponentRaw, exponent, special, error, storedText, errorText: error === 0 ? '0（可精确表示）' : error.toExponential(8), mantissaText: mantissa.toFixed(8), formula: exponentRaw === 255 ? '特殊编码：∞ 或 NaN' : exponentRaw === 0 ? `(-1)^${sign} × ${mantissa.toFixed(8)} × 2^-126` : `(-1)^${sign} × ${mantissa.toFixed(8)} × 2^${exponent}` }
}
function toBits(value, length) { return (value >>> 0).toString(2).padStart(length, '0').slice(-length) }
function clampFloat(value) { const number = Number(value); return Number.isFinite(number) ? Math.max(-3.4e38, Math.min(3.4e38, number)) : 0 }
function formatNumber(value) { return Math.abs(value) >= 1e7 || (Math.abs(value) > 0 && Math.abs(value) < 1e-6) ? value.toExponential(8) : Number(value.toPrecision(10)).toString() }

function NumberStory() {
  const [step, setStep] = useState(0)
  return <section className="transformer-story number-story"><header className="story-intro"><div><span className="story-kicker">动画导学 · 约 4 分钟</span><h2>比特没有正负和小数点，规则赋予它们含义</h2><p>先用补码统一整数加减，再用 IEEE 754 把有限的 32 位分配给范围与精度。</p></div><div className="number-story-badge"><span>11010110</span><b>→</b><strong>整数 / 浮点数</strong></div></header><nav className="story-timeline" style={{ '--story-steps': STORY.length }}>{STORY.map((item, index) => <button className={`${step === index ? 'active' : ''} ${index < step ? 'passed' : ''}`} key={item[0]} onClick={() => setStep(index)}><i>{index < step ? '✓' : index + 1}</i><span>{item[0]}</span></button>)}</nav><div className="story-stage"><div className="story-copy"><span>0{step + 1} · 数值表示</span><h3>{STORY[step][1]}</h3><p>{['位模式 11111111 按无符号数解释是 255，按 8 位补码解释却是 -1。上下文决定含义。','符号位加绝对值最直观，但会同时出现 00000000 和 10000000 两个零，加法器也更复杂。','n 位补码可以看作模 2ⁿ 的循环：负数 -x 对应 2ⁿ-x，因此减法可以转化为加法。','8 位补码范围只有 -128～127。最高位进位不能单独判断溢出，必须检查操作数和结果符号。','类似十进制 1.25×10³，二进制浮点写成 1.f×2ᵉ，指数扩大范围，尾数保存有效数字。','单精度的三个字段分别回答：正负、数量级、有效数字；它们按统一公式解码。','有限的 23 位尾数必须舍入无限二进制小数，所以 0.1+0.2 可能不等于精确的 0.3。'][step]}</p><aside><strong>这一点为什么重要？</strong><p>{STORY[step][2]}</p></aside></div><div className="story-visual"><div className="number-mini"><div className="mini-bits">{['1','0','1','1','0','1','1','0'].map((bit, index) => <i className={index === step % 8 ? 'active' : ''} key={index}>{bit}</i>)}</div><div className="mini-interpret"><span>补码：-74</span><span>无符号：182</span></div></div></div></div><footer className="story-controls"><button disabled={!step} onClick={() => setStep(step - 1)}>← 上一步</button><button className="story-play" onClick={() => setStep((step + 1) % STORY.length)}>播放下一幕</button><button disabled={step === STORY.length - 1} onClick={() => setStep(step + 1)}>下一步 →</button></footer></section>
}
