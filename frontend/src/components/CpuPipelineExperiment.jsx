import React, { useEffect, useMemo, useState } from 'react'
import { ExperimentHeader } from './AttentionExperiment'
import LearningCycle from './LearningCycle'

const STAGES = ['IF', 'ID', 'EX', 'MEM', 'WB']
const STAGE_NAMES = { IF: '取指', ID: '译码', EX: '执行', MEM: '访存', WB: '写回', STALL: '停顿', FLUSH: '冲刷' }
const PROGRAM = [
  { id: 'I1', code: 'LOAD R1, [A]' },
  { id: 'I2', code: 'ADD R2, R1, R3' },
  { id: 'I3', code: 'SUB R4, R2, R5' },
  { id: 'I4', code: 'STORE [B], R4' },
]
const STORY = [
  ['串行执行', '一条指令全部完成后，下一条才开始', '五个硬件阶段大部分时间都在等待，吞吐率很低。'],
  ['五级流水', '把执行拆成 IF、ID、EX、MEM、WB', '每一级只负责一种工作，像工厂流水线一样交叠运行。'],
  ['重叠执行', '同一时刻，不同指令占用不同阶段', '理想情况下，流水线填满后每个时钟都能完成一条指令。'],
  ['数据冒险', '后续指令读取了尚未写回的结果', 'ADD 依赖 LOAD 的 R1，必须等待或从中间阶段转发结果。'],
  ['数据前递', '把计算结果直接送给需要它的阶段', '前递减少停顿，但 LOAD 后立即使用通常仍需等待一个周期。'],
  ['控制冒险', '分支结果确定前，CPU 不知道下一条取谁', '错误路径上的指令要被冲刷，形成控制冒险代价。'],
  ['性能权衡', '流水线提高吞吐率，却不会缩短单条指令延迟', '真正的性能取决于阶段均衡、冒险频率和预测准确率。'],
]

export default function CpuPipelineExperiment({ experiment }) {
  const [scenario, setScenario] = useState('data')
  const [forwarding, setForwarding] = useState(true)
  const schedule = useMemo(() => buildSchedule(scenario, forwarding), [scenario, forwarding])
  const [cycle, setCycle] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  useEffect(() => { setCycle(1); setPlaying(false) }, [scenario, forwarding])
  useEffect(() => {
    if (!playing) return undefined
    const timer = setInterval(() => setCycle((value) => {
      if (value >= schedule.cycles) { setPlaying(false); return value }
      return value + 1
    }), 850 / speed)
    return () => clearInterval(timer)
  }, [playing, schedule.cycles, speed])

  const active = schedule.rows.map((row) => row.cells[cycle - 1]).filter(Boolean)
  const completed = schedule.rows.filter((row) => row.cells.slice(0, cycle).includes('WB')).length
  const explanation = explainCycle(schedule, cycle)
  return <>
    <ExperimentHeader experiment={experiment} eyebrow="组成原理实验 02" />
    <PipelineStory />
    <div className="explore-heading"><span>自由探索 · 改变冒险条件并逐周期观察</span><h2>让四条指令同时进入五级流水线</h2><p>切换理想、数据冒险和控制冒险场景，观察停顿、前递与冲刷如何改变总周期。</p></div>
    <div className="lab-layout pipeline-layout">
      <aside className="control-panel">
        <div className="panel-title"><span>流水线控制台</span><i>Cycle {cycle}</i></div>
        <label className="field-block"><span>实验场景</span><select value={scenario} onChange={(e) => setScenario(e.target.value)}><option value="ideal">理想流水</option><option value="data">数据冒险</option><option value="control">控制冒险</option></select></label>
        <div className="scenario-help"><strong>{scenario === 'ideal' ? '没有依赖与分支' : scenario === 'data' ? 'I2 需要 I1 产生的 R1' : 'I2 是分支，I3、I4 可能走错路径'}</strong><p>{scenario === 'ideal' ? '用于观察流水线的理论上限。' : scenario === 'data' ? '比较开启和关闭前递时需要停顿多少周期。' : '分支在 EX 阶段确定，错误取入的指令会被冲刷。'}</p></div>
        {scenario === 'data' && <label className="toggle-line"><input type="checkbox" checked={forwarding} onChange={(e) => setForwarding(e.target.checked)} /><span><strong>开启数据前递</strong><small>结果不必等到 WB，再送回 EX 使用</small></span></label>}
        <div className="step-counter"><span>当前时钟</span><strong>{cycle}/{schedule.cycles}</strong></div>
        <input className="step-slider" type="range" min="1" max={schedule.cycles} value={cycle} onChange={(e) => { setCycle(Number(e.target.value)); setPlaying(false) }} />
        <div className="step-buttons"><button disabled={cycle === 1} onClick={() => setCycle(cycle - 1)}>← 上一周期</button><button disabled={cycle === schedule.cycles} onClick={() => setCycle(cycle + 1)}>下一周期 →</button></div>
        <button className="tree-play" onClick={() => { if (cycle === schedule.cycles) setCycle(1); setPlaying((value) => !value) }}>{playing ? '暂停时钟' : '▶ 连续运行'}</button>
        <label className="field-block cpu-speed"><span>播放速度</span><select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}><option value={0.75}>0.75×</option><option value={1}>1×</option><option value={1.5}>1.5×</option></select></label>
        <div className="live-explanation"><span>本周期发生了什么</span><strong>{explanation.title}</strong><p>{explanation.text}</p></div>
      </aside>
      <section className="visual-panel pipeline-visual">
        <div className="visual-toolbar"><div><strong>五级流水时空图</strong><span>横轴是时钟周期，纵轴是指令；同一列表示同时发生的工作。</span></div><span className="source-chip">{scenarioLabel(scenario)}</span></div>
        <div className="pipeline-stages">{STAGES.map((stage) => <div className={active.includes(stage) ? 'active' : ''} key={stage}><b>{stage}</b><span>{STAGE_NAMES[stage]}</span></div>)}</div>
        <div className="pipeline-table" style={{ '--cycles': schedule.cycles }}>
          <div className="pipeline-corner">指令 / 周期</div>{Array.from({ length: schedule.cycles }, (_, i) => <div className={cycle === i + 1 ? 'cycle-head active' : 'cycle-head'} key={i}>C{i + 1}</div>)}
          {schedule.rows.map((row) => <React.Fragment key={row.id}><div className="pipeline-instruction"><strong>{row.id}</strong><code>{row.code}</code></div>{row.cells.map((cell, index) => <div className={`pipeline-cell ${cycle === index + 1 ? 'current' : ''} ${cell ? cell.toLowerCase() : ''}`} key={index}>{cell && <><b>{cell === 'STALL' ? '暂停' : cell === 'FLUSH' ? '冲刷' : cell}</b><small>{STAGE_NAMES[cell]}</small></>}</div>)}</React.Fragment>)}
        </div>
        <div className="pipeline-metrics"><div><span>完成指令</span><strong>{completed}/4</strong></div><div><span>总周期</span><strong>{schedule.cycles}</strong></div><div><span>气泡 / 冲刷</span><strong>{schedule.penalty}</strong></div><div><span>平均 CPI</span><strong>{(schedule.cycles / 4).toFixed(2)}</strong></div></div>
        <div className="pipeline-legend"><span><i className="stage" />正常阶段</span><span><i className="stall" />停顿气泡</span><span><i className="flush" />分支冲刷</span></div>
      </section>
    </div>
    <LearningCycle experimentId="cpu-pipeline" prediction={{ question: '理想五级流水线执行 4 条指令，至少需要多少个周期？', options: ['5 个', '8 个', '20 个'], answer: '8 个', explanation: ' 首条指令需要 5 个周期填满流水线，之后每增加一条理想情况下只多 1 个周期，所以是 5 + 3 = 8。' }} operation={{ title: '观察 LOAD-use 数据冒险', instruction: '选择“数据冒险”，先关闭再开启数据前递，对比总周期和暂停单元格。' }} observation={`当前为${scenarioLabel(scenario)}，总周期 ${schedule.cycles}，代价单元 ${schedule.penalty}，平均 CPI 为 ${(schedule.cycles / 4).toFixed(2)}。`} summaryPrompt="为什么流水线能提高吞吐率，却仍会因数据依赖或分支而停顿？" />
  </>
}

function buildSchedule(scenario, forwarding) {
  if (scenario === 'ideal') return fromStarts([1, 2, 3, 4], 0)
  if (scenario === 'data') {
    const starts = forwarding ? [1, 3, 4, 5] : [1, 5, 8, 9]
    const result = fromStarts(starts, forwarding ? 1 : 5)
    fillGap(result.rows[1], 2, starts[1], 'STALL')
    fillGap(result.rows[2], 3, starts[2], 'STALL')
    return normalize(result)
  }
  const result = fromStarts([1, 2, 5, 6], 2)
  result.rows[2].cells[2] = 'FLUSH'
  result.rows[3].cells[3] = 'FLUSH'
  return normalize(result)
}

function fromStarts(starts, penalty) {
  const rows = PROGRAM.map((instruction, index) => ({ ...instruction, cells: Array(starts[index] - 1).fill('').concat(STAGES) }))
  const cycles = Math.max(...rows.map((row) => row.cells.length))
  rows.forEach((row) => { while (row.cells.length < cycles) row.cells.push('') })
  return { rows, cycles, penalty }
}
function fillGap(row, naturalStart, actualStart, label) { for (let index = naturalStart - 1; index < actualStart - 1; index += 1) row.cells[index] = label }
function normalize(result) { const cycles = Math.max(...result.rows.map((row) => row.cells.length)); result.rows.forEach((row) => { while (row.cells.length < cycles) row.cells.push('') }); result.cycles = cycles; return result }
function scenarioLabel(value) { return ({ ideal: '理想流水', data: '数据冒险', control: '控制冒险' })[value] }
function explainCycle(schedule, cycle) {
  const entries = schedule.rows.map((row) => [row.id, row.cells[cycle - 1]]).filter(([, stage]) => stage)
  if (!entries.length) return { title: '流水线尚未占用', text: '拖动时间轴进入有效周期。' }
  if (entries.some(([, stage]) => stage === 'STALL')) return { title: '发生数据停顿', text: '依赖结果还没有到达可用位置，控制器插入气泡，后续阶段暂时不能推进。' }
  if (entries.some(([, stage]) => stage === 'FLUSH')) return { title: '错误路径被冲刷', text: '分支方向刚刚确定，已经取入的错误指令失效，流水线需要重新取指。' }
  return { title: `${entries.length} 条指令正在重叠执行`, text: entries.map(([id, stage]) => `${id} 处于${STAGE_NAMES[stage]}`).join('；') + '。' }
}

function PipelineStory() {
  const [step, setStep] = useState(0)
  return <section className="transformer-story pipeline-story"><header className="story-intro"><div><span className="story-kicker">动画导学 · 约 4 分钟</span><h2>流水线不是让一条指令更快，而是让更多指令同时前进</h2><p>先理解五个阶段如何重叠，再看数据依赖和分支为什么会让流水线出现气泡。</p></div><div className="pipeline-story-badge">{STAGES.map((stage) => <i key={stage}>{stage}</i>)}</div></header><nav className="story-timeline" style={{ '--story-steps': STORY.length }}>{STORY.map((item, index) => <button className={`${step === index ? 'active' : ''} ${index < step ? 'passed' : ''}`} key={item[0]} onClick={() => setStep(index)}><i>{index < step ? '✓' : index + 1}</i><span>{item[0]}</span></button>)}</nav><div className="story-stage"><div className="story-copy"><span>0{step + 1} · CPU 流水线</span><h3>{STORY[step][1]}</h3><p>{['串行方式执行 4 条五阶段指令需要 20 个阶段时间，硬件部件利用率很低。','取指、译码、执行、访存和写回分别交给独立硬件，每个时钟向前移动一级。','当 I1 在执行时，I2 可以译码、I3 可以取指，空间换来了更高吞吐率。','如果下一条指令需要上一条尚未生成的寄存器值，直接前进就会读到旧数据。','旁路网络绕过寄存器写回，把 EX 或 MEM 的结果直接送到后续 EX 输入。','分支是否跳转通常较晚才能确定，提前取入的错误指令必须作废。','用 CPI 衡量平均每条指令耗费的周期；理想值接近 1，但冒险会把它拉高。'][step]}</p><aside><strong>这一点为什么重要？</strong><p>{STORY[step][2]}</p></aside></div><div className="story-visual"><div className="pipeline-mini">{PROGRAM.slice(0, 3).map((instruction, row) => <div key={instruction.id}><b>{instruction.id}</b>{STAGES.map((stage, column) => <i className={column + row === step % 5 ? 'active' : ''} key={stage}>{stage}</i>)}</div>)}</div></div></div><footer className="story-controls"><button disabled={!step} onClick={() => setStep(step - 1)}>← 上一步</button><button className="story-play" onClick={() => setStep((step + 1) % STORY.length)}>播放下一幕</button><button disabled={step === STORY.length - 1} onClick={() => setStep(step + 1)}>下一步 →</button></footer></section>
}
