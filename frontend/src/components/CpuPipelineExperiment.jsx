import React, { useEffect, useMemo, useState, useRef } from 'react'
import { ExperimentHeader } from './AttentionExperiment'
import LearningCycle from './LearningCycle'

const STAGES = ['IF', 'ID', 'EX', 'MEM', 'WB']
const STAGE_NAMES = { IF: '取指', ID: '译码', EX: '执行', MEM: '访存', WB: '写回', STALL: '停顿气泡', FLUSH: '分支冲刷' }

const PROGRAM = [
  { id: 'I1', code: 'LOAD R1, [A]' },
  { id: 'I2', code: 'ADD R2, R1, R3' },
  { id: 'I3', code: 'SUB R4, R2, R5' },
  { id: 'I4', code: 'STORE [B], R4' },
]

const STORY_STEPS = [
  {
    step: 1,
    kicker: '01 · 性能革命',
    title: '串行执行 vs 五级流水：空间换时间的吞吐倍增',
    summary: '传统串行方式执行 4 条指令需要 4×5=20 个时钟周期，CPU 各硬件部件大部分时间处于闲置状态。指令流水线将执行过程拆为 5 个独立工位，使不同指令重叠并行推进，只需 8 个周期即可全部完成！',
    why: '流水线并不缩短单条指令的绝对执行时间（延迟），但极大地提高了单位时间内完成的指令条数（吞吐率）。',
    visual: 'serial_vs_pipe'
  },
  {
    step: 2,
    kicker: '02 · 经典分段',
    title: '经典五级流水线架构：IF / ID / EX / MEM / WB',
    summary: '① IF 取指（从指令 Cache 取指令）；② ID 译码（分析指令并读寄存器堆）；③ EX 执行（ALU 算术计算或计算有效地址）；④ MEM 访存（访问数据 Cache 读写数据）；⑤ WB 写回（把结果写入目标寄存器）。',
    why: '流水线划分要求每个阶段的硬件延迟尽可能均衡，木桶最慢阶段（瓶颈阶段）将决定整个 CPU 的最高主频。',
    visual: 'five_stages'
  },
  {
    step: 3,
    kicker: '03 · 理想时空',
    title: '理想重叠执行瀑布流：每个周期完成一条指令',
    summary: '当时钟脉冲敲响时，每条指令各向前推进一个工位。在理想情况下，当流水线被充满后，每个时钟节拍都有一条指令进入 WB 阶段并执行完成，平均每条指令消耗周期 CPI 趋近于 1！',
    why: 'CPI（Cycles Per Instruction）是衡量处理器架构效率的核心黄金指标。',
    visual: 'waterfall'
  },
  {
    step: 4,
    kicker: '04 · 数据冲突',
    title: '数据冒险 (Data Hazard)：写后读 (RAW) 依赖',
    summary: '当后续指令需要使用前序指令尚未生成的寄存器数据时，发生数据冒险（如 I2 需要 I1 的 R1，但 I1 直到第 5 周期 WB 才会写回）。如果直接执行将读取到过时的错误旧值。',
    why: '写后读（RAW）是流水线中最常见的数据冒险。最朴素的解决方案是硬件互锁（Stall）插入停顿气泡。',
    visual: 'data_hazard'
  },
  {
    step: 5,
    kicker: '05 · 旁路救星',
    title: '数据前递技术 (Bypassing / Forwarding)：截胡结果',
    summary: 'ALU 计算的结果在 EX 阶段末或 MEM 阶段初就已经物理生成，不必苦等到 WB 阶段写入寄存器堆。通过在硬件中搭建一条“旁路前递导线”，将结果直接送往后续指令的 EX 输入端，将停顿彻底消灭或降到最低！',
    why: '数据前递是现代超标量处理器消除流水线停顿、维持高 IPC 的最核心工程技巧。',
    visual: 'forwarding'
  },
  {
    step: 6,
    kicker: '06 · 分支代价',
    title: '控制冒险 (Control Hazard) 与流水线冲刷 (Flush)',
    summary: '遇到条件跳转（JMP/BEQ）时，跳转目标和条件通常要到 EX 或 MEM 阶段才能确定。此时 CPU 已经盲目取入了后续多条指令。若最终发生跳转，这些预测错误的指令必须全部作废冲刷（Flush），造成周期浪费。',
    why: '为此现代 CPU 引入了深度的动态分支预测器（Branch Predictor）和投机执行（Speculation）。',
    visual: 'control_flush'
  },
  {
    step: 7,
    kicker: '07 · 加速极限',
    title: '阿姆达尔定律与流水线级数权衡',
    summary: '流水线级数是不是越多越好？不是！流水线级数越深，各级寄存器延迟占比越大，且一旦发生分支预测失败冲刷的代价（Branch Penalty）呈灾难性暴增（如奔腾 4 的 31 级流水线）。现代处理器通常权衡在 12~16 级。',
    why: '体系结构设计永远是时钟频率、吞吐率、功耗与冒险惩罚之间的精巧妥协艺术。',
    visual: 'amdahl'
  }
]

// 导学右侧高动态动画组件
function PipelineStoryVisual({ stageIndex }) {
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    setPulse(0)
    const t = setTimeout(() => setPulse(1), 1200)
    return () => clearTimeout(t)
  }, [stageIndex])

  return (
    <div className="pipeline-story-visual-canvas" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {/* 阶段 1: 串行 vs 流水线对比 */}
      {stageIndex === 0 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#38bdf8', fontSize: '1rem', fontWeight: 'bold' }}>串行执行 (Serial) vs 流水线重叠 (Pipelined)</span>
            <span style={{ background: '#1e293b', color: '#10b981', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              加速比 2.5×
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: '6px', borderLeft: '4px solid #ef4444' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fca5a5', fontSize: '0.88rem', fontWeight: 'bold' }}>
                <span>串行执行：4 条指令</span>
                <span>总耗时 20 个周期</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>每条指令独立耗费 5 周期，其他部件全部空等。</div>
            </div>

            <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: '6px', borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#86efac', fontSize: '0.88rem', fontWeight: 'bold' }}>
                <span>流水线执行：4 条指令重叠</span>
                <span>仅需 8 个周期！</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>5 级独立工位同时作业，吞吐率激增 150%。</div>
            </div>
          </div>
        </div>
      )}

      {/* 阶段 2: 经典五级划分 */}
      {stageIndex === 1 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#f59e0b', fontSize: '1rem', fontWeight: 'bold' }}>经典 RISC 五级流水工位</span>
            <span style={{ background: '#f59e0b', color: '#1e293b', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              5-Stage Pipeline
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {[
              { code: 'IF', name: '取指', role: '指令 Cache' },
              { code: 'ID', name: '译码', role: '读寄存器' },
              { code: 'EX', name: '执行', role: 'ALU 运算' },
              { code: 'MEM', name: '访存', role: '数据 Cache' },
              { code: 'WB', name: '写回', role: '写寄存器' }
            ].map((s, i) => (
              <div key={s.code} style={{ background: '#1e293b', border: '1.5px solid #475569', borderRadius: '6px', padding: '10px 6px', textAlign: 'center' }}>
                <span style={{ color: '#38bdf8', fontSize: '1.1rem', fontWeight: 'bold', display: 'block' }}>{s.code}</span>
                <strong style={{ color: '#f8fafc', fontSize: '0.85rem', display: 'block', margin: '2px 0' }}>{s.name}</strong>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{s.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 阶段 3: 瀑布流推进 */}
      {stageIndex === 2 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#10b981', fontSize: '1rem', fontWeight: 'bold' }}>理想流水线时空瀑布图 (CPI ≈ 1)</span>
            <span style={{ background: '#10b981', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              无气泡连续推进
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: '#1e293b', padding: '12px', borderRadius: '8px' }}>
            {PROGRAM.map((inst, rowIdx) => (
              <div key={inst.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '28px', fontSize: '0.8rem', fontWeight: 'bold', color: '#94a3b8' }}>{inst.id}</span>
                {Array.from({ length: 8 }, (_, cIdx) => {
                  const stagePos = cIdx - rowIdx
                  const stageCode = stagePos >= 0 && stagePos < 5 ? STAGES[stagePos] : ''
                  return (
                    <div
                      key={cIdx}
                      style={{
                        width: '36px',
                        height: '26px',
                        borderRadius: '4px',
                        background: stageCode ? '#2563eb' : '#0f172a',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        opacity: stageCode ? 1 : 0.3
                      }}
                    >
                      {stageCode}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 阶段 4: 数据冒险与气泡 */}
      {stageIndex === 3 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#ef4444', fontSize: '1rem', fontWeight: 'bold' }}>写后读 (RAW) 数据冲突与停顿气泡 (Stall)</span>
            <span style={{ background: '#ef4444', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              插入 2 周期气泡
            </span>
          </div>

          <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', lineHeight: '1.6' }}>
            <div style={{ color: '#93c5fd', fontSize: '0.88rem' }}>I1: LOAD <strong style={{ color: '#f59e0b' }}>R1</strong>, [A] ➔ 直到第 5 周期 WB 才能把 R1 写入寄存器堆！</div>
            <div style={{ color: '#fca5a5', fontSize: '0.88rem' }}>I2: ADD R2, <strong style={{ color: '#f59e0b' }}>R1</strong>, R3 ➔ 第 3 周期在 ID 阶段就急需读 R1！</div>
            <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '6px', color: '#fca5a5', fontSize: '0.82rem' }}>
              无硬件旁路时：硬件检测到依赖，必须强制让 I2 停顿 2 个时钟周期（Stall 气泡），等待 R1 写回完成。
            </div>
          </div>
        </div>
      )}

      {/* 阶段 5: 旁路前递技术 */}
      {stageIndex === 4 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#10b981', fontSize: '1rem', fontWeight: 'bold' }}>硬件旁路前递 (Bypass / Forwarding) 挽救停顿</span>
            <span style={{ background: '#10b981', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              无需等待 WB 阶段
            </span>
          </div>

          <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
            <div style={{ color: '#86efac', fontWeight: 'bold', fontSize: '0.92rem' }}>短路直通原理：</div>
            <div style={{ color: '#f8fafc', fontSize: '0.88rem', marginTop: '6px', lineHeight: '1.6' }}>
              ALU 的计算结果早在 EX/MEM 寄存器中就已经就绪！
              通过在硬件层铺设一条<strong>前递多路选择器导线</strong>，直接将结果从 MEM 阶段拉回到后续指令的 EX 阶段输入端，消除大部分停顿！
            </div>
          </div>
        </div>
      )}

      {/* 阶段 6: 分支冲刷 */}
      {stageIndex === 5 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#f59e0b', fontSize: '1rem', fontWeight: 'bold' }}>控制冒险与流水线冲刷 (Branch Flush)</span>
            <span style={{ background: '#f59e0b', color: '#1e293b', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              预测失败清空
            </span>
          </div>

          <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px' }}>
            <div style={{ color: '#fde68a', fontSize: '0.88rem', fontWeight: 'bold' }}>遇到条件跳转指令 BEQ：</div>
            <div style={{ color: '#cbd5e1', fontSize: '0.82rem', marginTop: '4px', lineHeight: '1.5' }}>
              当分支真正发生跳转时，原本顺延取入的错位指令被直接置为 NOP（空操作），所有阶段同步清空（FLUSH 冲刷），代价是损失 1~3 个周期。
            </div>
          </div>
        </div>
      )}

      {/* 阶段 7: 权衡总结 */}
      {stageIndex === 6 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#38bdf8', fontSize: '1rem', fontWeight: 'bold' }}>现代流水线设计的综合工程权衡</span>
            <span style={{ background: '#2563eb', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              CPI vs 主频
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px' }}>
              <div style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 'bold' }}>级数越深</div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '4px' }}>每个工位更简单，主频可以做得极高。</div>
            </div>
            <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px' }}>
              <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 'bold' }}>冒险惩罚暴增</div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '4px' }}>一旦分支失败冲刷几十级工位，CPI 恶化。</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PipelineStory() {
  const [step, setStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStep(prev => {
          if (prev >= STORY_STEPS.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 4200)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isPlaying])

  const cur = STORY_STEPS[step]

  return (
    <section className="transformer-story pipeline-story" style={{ marginBottom: '24px' }}>
      <header className="story-intro">
        <div>
          <span className="story-kicker">动画导学 · 约 3 分钟</span>
          <h2>流水线不是缩短单条指令，而是让更多指令同时前进</h2>
          <p>先理解五级流水如何重叠，再看数据依赖和分支预测失败为什么会让流水线产生停顿气泡。</p>
        </div>
        <div className="memory-story-badge" style={{ padding: '16px 20px', minWidth: '130px' }}>
          <strong>五级流水</strong>
          <span>IF · ID · EX · MEM · WB</span>
          <small>重叠并行 · 吞吐倍增</small>
        </div>
      </header>

      <nav className="story-timeline" style={{ '--story-steps': STORY_STEPS.length }}>
        {STORY_STEPS.map((x, idx) => (
          <button
            key={idx}
            className={`${step === idx ? 'active' : ''} ${idx < step ? 'passed' : ''}`}
            onClick={() => { setStep(idx); setIsPlaying(false) }}
          >
            <i>{idx < step ? '✓' : idx + 1}</i>
            <span>{x.title.split('：')[0].split('(')[0].trim()}</span>
          </button>
        ))}
      </nav>

      <div className="story-stage" style={{ display: 'grid', gridTemplateColumns: '35% 65%', gap: '20px', minHeight: '340px' }}>
        <div className="story-copy" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#c88724', fontWeight: 'bold' }}>{cur.kicker}</span>
            <h3 style={{ fontSize: '1.25rem', margin: '8px 0', color: '#fff' }}>{cur.title}</h3>
            <p style={{ fontSize: '0.98rem', lineHeight: '1.7', color: '#cbd5e1' }}>{cur.summary}</p>
          </div>
          <aside style={{ background: 'rgba(200, 135, 36, 0.12)', borderLeft: '4px solid #c88724', padding: '12px 14px', borderRadius: '4px' }}>
            <strong style={{ color: '#c88724', fontSize: '0.92rem' }}>为什么重要？</strong>
            <p style={{ fontSize: '0.88rem', color: '#e2e8f0', margin: '4px 0 0' }}>{cur.why}</p>
          </aside>
        </div>

        <div className="story-visual" style={{ background: '#0a101d', borderRadius: '12px', padding: '18px', border: '1px solid #1e293b', display: 'flex', alignItems: 'center' }}>
          <PipelineStoryVisual stageIndex={step} />
        </div>
      </div>

      <footer className="story-controls">
        <button
          disabled={step === 0}
          onClick={() => { setStep(s => Math.max(0, s - 1)); setIsPlaying(false) }}
        >
          ← 上一步
        </button>
        <button
          className={`story-play ${isPlaying ? 'playing' : ''}`}
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? '暂停' : '▶ 自动播放导学'}
        </button>
        <button
          disabled={step === STORY_STEPS.length - 1}
          onClick={() => { setStep(s => Math.min(STORY_STEPS.length - 1, s + 1)); setIsPlaying(false) }}
        >
          下一步 →
        </button>
      </footer>
    </section>
  )
}

function buildSchedule(scenario, forwarding) {
  if (scenario === 'ideal') {
    return fromStarts([1, 2, 3, 4], 0)
  }
  if (scenario === 'data') {
    if (forwarding) {
      const result = fromStarts([1, 2, 4, 5], 1)
      fillGap(result.rows[1], 2, 2, 'STALL')
      fillGap(result.rows[2], 3, 4, 'STALL')
      return normalize(result)
    }
    const starts = [1, 4, 7, 10]
    const result = fromStarts(starts, 6)
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
  const rows = PROGRAM.map((instruction, index) => ({
    ...instruction,
    cells: Array(starts[index] - 1).fill('').concat(STAGES)
  }))
  const cycles = Math.max(...rows.map(row => row.cells.length))
  rows.forEach(row => {
    while (row.cells.length < cycles) row.cells.push('')
  })
  return { rows, cycles, penalty }
}

function fillGap(row, naturalStart, actualStart, label) {
  for (let index = naturalStart - 1; index < actualStart - 1; index += 1) {
    row.cells[index] = label
  }
}

function normalize(result) {
  const cycles = Math.max(...result.rows.map(row => row.cells.length))
  result.rows.forEach(row => {
    while (row.cells.length < cycles) row.cells.push('')
  })
  result.cycles = cycles
  return result
}

function scenarioLabel(value) {
  return ({ ideal: '理想流水', data: '数据冒险', control: '控制冒险' })[value]
}

function explainCycle(schedule, cycle) {
  const entries = schedule.rows.map(row => [row.id, row.cells[cycle - 1]]).filter(([, stage]) => stage)
  if (!entries.length) return { title: '流水线尚未占用', text: '拖动时间轴进入有效周期。' }
  if (entries.some(([, stage]) => stage === 'STALL')) {
    return { title: '发生数据停顿 (Stall)', text: '依赖数据尚未就绪，硬件互锁自动插入停顿气泡，后续阶段保持等待。' }
  }
  if (entries.some(([, stage]) => stage === 'FLUSH')) {
    return { title: '分支冲刷 (Flush)', text: '跳转方向确定，已取入的错误路径指令被清空冲刷。' }
  }
  return {
    title: `${entries.length} 条指令正在重叠执行`,
    text: entries.map(([id, stage]) => `${id} 处于 ${STAGE_NAMES[stage]}`).join('；') + '。'
  }
}

export default function CpuPipelineExperiment({ experiment }) {
  const [scenario, setScenario] = useState('data')
  const [forwarding, setForwarding] = useState(true)
  const schedule = useMemo(() => buildSchedule(scenario, forwarding), [scenario, forwarding])
  const [cycle, setCycle] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)

  useEffect(() => {
    setCycle(1)
    setPlaying(false)
  }, [scenario, forwarding])

  useEffect(() => {
    if (!playing) return undefined
    const timer = setInterval(() => {
      setCycle(value => {
        if (value >= schedule.cycles) {
          setPlaying(false)
          return value
        }
        return value + 1
      })
    }, 850 / speed)
    return () => clearInterval(timer)
  }, [playing, schedule.cycles, speed])

  const explanation = explainCycle(schedule, cycle)

  return (
    <>
      <ExperimentHeader experiment={experiment} eyebrow="计算机组成原理实验 02 · 流水线" />

      {/* 动画导学区 */}
      <PipelineStory />

      {/* 自由探索交互实验室 */}
      <div className="explore-heading">
        <span>自由探索 · 改变冒险条件并逐时钟周期观察</span>
        <h2>五级指令流水线时空并发与冒险消除实验室</h2>
        <p>在理想流水、数据冒险和控制冒险之间切换，观察硬件停顿、旁路前递与分支冲刷如何影响总时钟周期与 CPI。</p>
      </div>

      <div className="lab-layout pipeline-layout" style={{ gridTemplateColumns: '320px 1fr' }}>
        <aside className="control-panel">
          <div className="panel-title">
            <span>流水线控制台</span>
            <i>Cycle {cycle}</i>
          </div>

          <label className="field-block">
            <span>实验场景选择</span>
            <select
              value={scenario}
              onChange={e => setScenario(e.target.value)}
              style={{ padding: '8px', fontSize: '0.95rem', borderRadius: '6px', fontWeight: 'bold' }}
            >
              <option value="ideal">理想流水 (无冲突)</option>
              <option value="data">数据冒险 (RAW 冲突)</option>
              <option value="control">控制冒险 (分支跳转)</option>
            </select>
          </label>

          {scenario === 'data' && (
            <label className="cnn-toggle" style={{ marginTop: '10px' }}>
              <input type="checkbox" checked={forwarding} onChange={e => setForwarding(e.target.checked)} />
              <span>
                <strong>开启旁路前递 (Bypassing)</strong>
                <small>从 EX/MEM 提前转发结果，消除停顿</small>
              </span>
            </label>
          )}

          <div className="step-counter" style={{ marginTop: '14px' }}>
            <span>当前时钟周期</span>
            <strong>{cycle} / {schedule.cycles}</strong>
          </div>

          <input
            className="step-slider"
            type="range"
            min="1"
            max={schedule.cycles}
            value={cycle}
            onChange={e => {
              setCycle(Number(e.target.value))
              setPlaying(false)
            }}
          />

          <div className="step-buttons">
            <button disabled={cycle <= 1} onClick={() => setCycle(cycle - 1)}>
              ← 上个周期
            </button>
            <button disabled={cycle >= schedule.cycles} onClick={() => setCycle(cycle + 1)}>
              下个周期 →
            </button>
          </div>

          <button
            className="tree-play"
            onClick={() => {
              if (cycle >= schedule.cycles) setCycle(1)
              setPlaying(v => !v)
            }}
          >
            {playing ? '暂停推进' : cycle >= schedule.cycles ? '重新开始' : '▶ 自动时钟推进'}
          </button>

          <label className="field-block" style={{ marginTop: '12px' }}>
            <span>推进速度</span>
            <select value={speed} onChange={e => setSpeed(Number(e.target.value))} style={{ padding: '6px', borderRadius: '4px' }}>
              <option value={0.75}>0.75×</option>
              <option value={1}>1.0×</option>
              <option value={1.5}>1.5×</option>
            </select>
          </label>

          <div className="live-explanation" style={{ marginTop: '14px', background: '#f8fafc', borderLeft: '4px solid #c88724', padding: '12px 14px', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: '#c88724', fontWeight: 'bold' }}>周期 {cycle} 状态</span>
            <strong style={{ display: 'block', fontSize: '1.05rem', margin: '4px 0', color: '#1e293b' }}>{explanation.title}</strong>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>{explanation.text}</p>
          </div>
        </aside>

        <section className="visual-panel pipeline-visual">
          <div className="visual-toolbar">
            <div>
              <strong style={{ fontSize: '1.1rem' }}>指令流水线时空矩阵 (Space-Time Matrix)</strong>
              <span style={{ fontSize: '0.85rem' }}>纵轴：指令流 · 横轴：时钟周期 Clock · 蓝色：执行 · 橙色：停顿 · 红色：冲刷</span>
            </div>
            <span className="source-chip" style={{ fontSize: '0.9rem' }}>{scenarioLabel(scenario)}</span>
          </div>

          {/* 矩阵大看板 */}
          <div style={{ margin: '20px 0', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#64748b', fontSize: '0.9rem' }}>指令</th>
                  {Array.from({ length: schedule.cycles }, (_, i) => (
                    <th key={i} style={{ padding: '10px 6px', color: i + 1 === cycle ? '#2563eb' : '#64748b', fontWeight: i + 1 === cycle ? '900' : 'normal', fontSize: '0.9rem' }}>
                      C{i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedule.rows.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '0.92rem', color: '#1e293b' }}>
                      {row.id}: {row.code}
                    </td>
                    {row.cells.map((cell, colIdx) => {
                      const isCurrent = colIdx + 1 === cycle
                      const isStall = cell === 'STALL'
                      const isFlush = cell === 'FLUSH'
                      const bg = isStall ? '#fef3c7' : isFlush ? '#fee2e2' : cell ? '#eff6ff' : 'transparent'
                      const color = isStall ? '#b45309' : isFlush ? '#b91c1c' : cell ? '#1d4ed8' : '#94a3b8'

                      return (
                        <td key={colIdx} style={{ padding: '8px 4px', background: isCurrent ? 'rgba(37,99,235,0.06)' : 'transparent' }}>
                          {cell ? (
                            <span
                              style={{
                                display: 'inline-block',
                                width: '38px',
                                padding: '6px 0',
                                borderRadius: '4px',
                                background: bg,
                                color: color,
                                fontWeight: 'bold',
                                fontSize: '0.85rem',
                                border: isCurrent ? '1.5px solid #2563eb' : '1px solid transparent'
                              }}
                            >
                              {cell}
                            </span>
                          ) : (
                            <span style={{ color: '#cbd5e1' }}>·</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>总耗费时钟周期</span>
              <strong style={{ display: 'block', fontSize: '1.4rem', color: '#1e293b', marginTop: '4px' }}>{schedule.cycles} 周期</strong>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>冒险损失气泡 (Penalty)</span>
              <strong style={{ display: 'block', fontSize: '1.4rem', color: schedule.penalty > 0 ? '#ef4444' : '#10b981', marginTop: '4px' }}>
                {schedule.penalty} 周期
              </strong>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>平均每指令周期 (CPI)</span>
              <strong style={{ display: 'block', fontSize: '1.4rem', color: '#2563eb', marginTop: '4px' }}>
                {(schedule.cycles / PROGRAM.length).toFixed(2)}
              </strong>
            </div>
          </div>
        </section>
      </div>

      <LearningCycle
        experimentId="cpu-pipeline"
        prediction={{
          question: '在经典五级流水线中，旁路前递技术（Forwarding）主要用于解决哪种类型的冒险？',
          options: ['数据冒险 (RAW)', '结构冒险 (硬件资源冲突)', '控制冒险 (分支跳转)'],
          answer: '数据冒险 (RAW)',
          explanation: '旁路前递将已计算出的结果直接从 EX/MEM 阶段拉到后续指令的 EX 输入端，从而消除写后读数据冒险的停顿。'
        }}
        operation={{
          title: '比较有无旁路前递的周期差异',
          instruction: '选择“数据冒险”场景，先关闭旁路前递观察 6 个周期的严重停顿，再开启旁路前递，观察周期如何锐减回 5 周期。'
        }}
        observation={`当前场景为 ${scenarioLabel(scenario)}，总耗时 ${schedule.cycles} 个时钟周期，CPI 达到 ${(schedule.cycles / PROGRAM.length).toFixed(2)}。`}
        summaryPrompt="为什么流水线级数不能无限加深？分支预测失败在极深流水线中会带来哪些恶果？"
      />
    </>
  )
}
