import React, { useEffect, useMemo, useState, useRef } from 'react'
import { ExperimentHeader } from './AttentionExperiment'
import LearningCycle from './LearningCycle'

const STORY_STEPS = [
  {
    step: 1,
    kicker: '01 · 体系架构',
    title: '冯·诺依曼架构：存储程序与指令流',
    summary: '程序由连续的指令和数据混合存放在主存储器（Memory）中。CPU 必须通过总线不断读取指令，才能知道下一步要做什么。PC（程序计数器）始终保存下一条待执行指令的主存物理地址。',
    why: '“存储程序”思想是现代通用计算机能够灵活运行不同软件、无需重新布线硬件的根本基石。',
    visual: 'von_neumann'
  },
  {
    step: 2,
    kicker: '02 · 取指周期',
    title: '取指周期 (Fetch)：从主存抓取指令到 IR',
    summary: '取指微操作流水：① PC 送地址到地址寄存器 MAR (PC ➔ MAR)；② 触发主存读信号，指令由数据总线读入数据寄存器 MDR；③ 指令由 MDR 传入指令寄存器 IR；④ PC 自动加 1 指向下一条指令。',
    why: '取指阶段解决了“下一条指令在哪里”、“指令的机器码是什么”两大问题，对所有指令而言格式高度统一。',
    visual: 'fetch_cycle'
  },
  {
    step: 3,
    kicker: '03 · 译码周期',
    title: '译码周期 (Decode)：控制器解析操作码与寻址',
    summary: '指令寄存器 IR 将高位操作码（OPCODE）送入控制单元（CU）。CU 根据微代码或硬布线逻辑进行译码，识别出指令类型（如 LOAD、ADD、STORE 或 JUMP），并向各部件拉高相应的控制总线信号。',
    why: '译码就像指挥官下达指令，它负责将冷冰冰的二进制机器码翻译成驱动数据通路的硬件微命令。',
    visual: 'decode_cycle'
  },
  {
    step: 4,
    kicker: '04 · 执行周期',
    title: '执行周期 (Execute)：驱动 ALU 运算与访存',
    summary: '根据译码结果开启指定数据通路：若为算术指令，操作数送入算术逻辑单元（ALU）进行加减或逻辑运算；若为访存指令，MAR 接收目标有效地址，通过总线读写主存储器。',
    why: '不同指令在执行阶段经历的微操作差异极大，时钟节拍数各不相同。',
    visual: 'execute_cycle'
  },
  {
    step: 5,
    kicker: '05 · 写回周期',
    title: '写回周期 (Writeback)：更新寄存器与状态标志',
    summary: '计算得出的结果必须写回目的地：或写回通用寄存器/累加器 ACC，或写回主存储器指定单元；同时根据运算结果刷新标志寄存器 PSW（进位 C、零 Z、符号 S、溢出 V）。',
    why: '写回让本条指令产生的中间状态能够被后续指令感知与复用，完成指令语义的实质落地。',
    visual: 'writeback_cycle'
  },
  {
    step: 6,
    kicker: '06 · 指令大循环',
    title: '时钟节拍与无限指令周期大循环',
    summary: '一个指令周期由取指、译码、执行、写回等若干机器周期组成，每个机器周期包含若干时钟节拍（T 周期）。一条指令写回完成后，PC 已就绪，系统立即进入下一条指令的取指周期，直到停机（HALT）或中断响应。',
    why: '现代 CPU 主频（如 3.5 GHz）决定了时钟节拍的频率，时钟驱动着数字芯片亿万次微操作的脉动。',
    visual: 'infinite_loop'
  }
]

function CpuStoryVisual({ stageIndex }) {
  const [pulseStep, setPulseStep] = useState(0)

  useEffect(() => {
    setPulseStep(0)
    const t = setTimeout(() => setPulseStep(1), 1000)
    return () => clearTimeout(t)
  }, [stageIndex])

  return (
    <div className="cpu-story-visual-canvas" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {/* 阶段 1: 冯诺依曼架构 */}
      {stageIndex === 0 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#38bdf8', fontSize: '1rem', fontWeight: 'bold' }}>冯·诺依曼计算机五大部件架构</span>
            <span style={{ background: '#1e293b', color: '#cbd5e1', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              存储程序 · 顺序执行
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '14px', alignItems: 'center' }}>
            <div style={{ background: '#1e293b', border: '2px solid #3b82f6', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
              <div style={{ color: '#93c5fd', fontSize: '0.85rem', fontWeight: 'bold' }}>主存储器 (Memory)</div>
              <div style={{ color: '#f8fafc', fontSize: '1.1rem', margin: '6px 0', fontFamily: 'monospace' }}>指令 + 数据</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>同一空间混存，按地址访问</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid #c88724' }}>
                <span style={{ color: '#f59e0b', fontSize: '0.82rem', fontWeight: 'bold' }}>控制器 CU</span>
                <div style={{ color: '#cbd5e1', fontSize: '0.78rem', marginTop: '2px' }}>PC / IR / 控制逻辑</div>
              </div>
              <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid #10b981' }}>
                <span style={{ color: '#10b981', fontSize: '0.82rem', fontWeight: 'bold' }}>运算器 ALU</span>
                <div style={{ color: '#cbd5e1', fontSize: '0.78rem', marginTop: '2px' }}>ACC / 算术逻辑单元</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 阶段 2: 取指周期动态流动 */}
      {stageIndex === 1 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#f59e0b', fontSize: '1rem', fontWeight: 'bold' }}>取指微操作四步曲 (Fetch Data-flow)</span>
            <span style={{ background: '#f59e0b', color: '#1e293b', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              PC ➔ MAR ➔ MDR ➔ IR
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: '#1e293b', borderRadius: '8px' }}>
            <div style={{ padding: '8px 12px', background: '#3b82f6', borderRadius: '6px', color: '#fff', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem' }}>1. 计数器</div>
              <strong style={{ fontSize: '0.95rem' }}>PC (00H)</strong>
            </div>
            <div style={{ color: '#f59e0b', fontSize: '1.2rem', fontWeight: 'bold' }}>➔</div>
            <div style={{ padding: '8px 12px', background: '#1e293b', border: '1.5px solid #f59e0b', borderRadius: '6px', color: '#f59e0b', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem' }}>2. 地址寄存器</div>
              <strong style={{ fontSize: '0.95rem' }}>MAR</strong>
            </div>
            <div style={{ color: '#f59e0b', fontSize: '1.2rem', fontWeight: 'bold' }}>➔</div>
            <div style={{ padding: '8px 12px', background: '#1e293b', border: '1.5px solid #10b981', borderRadius: '6px', color: '#10b981', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem' }}>3. 数据缓冲</div>
              <strong style={{ fontSize: '0.95rem' }}>MDR</strong>
            </div>
            <div style={{ color: '#f59e0b', fontSize: '1.2rem', fontWeight: 'bold' }}>➔</div>
            <div style={{ padding: '8px 12px', background: '#ec4899', borderRadius: '6px', color: '#fff', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem' }}>4. 指令寄存器</div>
              <strong style={{ fontSize: '0.95rem' }}>IR</strong>
            </div>
          </div>

          <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#34d399', textAlign: 'center' }}>
            取指结束伴随动作：程序计数器自动自增 PC ➔ PC + 1，为下一条指令准备就绪！
          </div>
        </div>
      )}

      {/* 阶段 3: 译码周期 */}
      {stageIndex === 2 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#a855f7', fontSize: '1rem', fontWeight: 'bold' }}>指令译码 (Decode)：拆分操作码与地址码</span>
            <span style={{ background: '#a855f7', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              CU 逻辑解析
            </span>
          </div>

          <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '6px' }}>当前位于 IR 中的 16 位指令：</div>
            <div style={{ display: 'flex', height: '46px', borderRadius: '6px', overflow: 'hidden', border: '2px solid #475569' }}>
              <div style={{ width: '40%', background: '#a855f7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.95rem' }}>
                操作码 OPCODE (ADD)
              </div>
              <div style={{ width: '60%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.95rem' }}>
                地址码 ADDRESS (06H)
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#cbd5e1', marginTop: '8px' }}>
              <span>发送到控制器 CU 译码 ➔ 激活 ALU 加法通路</span>
              <span>发送到地址寄存器 MAR ➔ 准备读内存 M[6]</span>
            </div>
          </div>
        </div>
      )}

      {/* 阶段 4: 执行阶段 */}
      {stageIndex === 3 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#10b981', fontSize: '1rem', fontWeight: 'bold' }}>执行周期 (Execute)：ALU 算术运算</span>
            <span style={{ background: '#10b981', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              ALU 运算中
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: '8px', alignItems: 'center', padding: '16px', background: '#1e293b', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ padding: '10px', background: '#334155', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>累加器 ACC</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#38bdf8' }}>8</div>
            </div>

            <div style={{ fontSize: '1.4rem', color: '#10b981', fontWeight: 'bold' }}>+</div>

            <div style={{ padding: '10px', background: '#334155', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>MDR 操作数</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#f59e0b' }}>13</div>
            </div>

            <div style={{ fontSize: '1.4rem', color: '#10b981', fontWeight: 'bold' }}>=</div>

            <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.2)', border: '2px solid #10b981', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.78rem', color: '#86efac' }}>ALU 输出</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#10b981' }}>21</div>
            </div>
          </div>
        </div>
      )}

      {/* 阶段 5: 写回周期 */}
      {stageIndex === 4 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#38bdf8', fontSize: '1rem', fontWeight: 'bold' }}>写回周期 (Writeback)：更新寄存器与状态标志</span>
            <span style={{ background: '#2563eb', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              ACC 赋值
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
            <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ fontSize: '0.9rem', color: '#93c5fd', fontWeight: 'bold' }}>累加器写入：ACC ➔ 21</div>
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '4px' }}>
                运算结果正式保存进内部通用寄存器，供下一条 STORE 指令使用。
              </div>
            </div>

            <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '0.9rem', color: '#86efac', fontWeight: 'bold' }}>标志位状态：PSW</div>
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '4px' }}>
                零标志 Z=0 · 负标志 S=0 · 溢出 V=0
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 阶段 6: 大循环 */}
      {stageIndex === 5 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#f59e0b', fontSize: '1rem', fontWeight: 'bold' }}>指令周期大循环：取指 ➔ 译码 ➔ 执行 ➔ 写回</span>
            <span style={{ background: '#f59e0b', color: '#1e293b', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              循环往复
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '14px', background: '#1e293b', borderRadius: '8px' }}>
            <div style={{ textAlign: 'center', color: '#60a5fa' }}>
              <strong style={{ fontSize: '1.1rem' }}>取指 (Fetch)</strong>
            </div>
            <div style={{ color: '#f59e0b', fontSize: '1.2rem', fontWeight: 'bold' }}>➔</div>
            <div style={{ textAlign: 'center', color: '#a855f7' }}>
              <strong style={{ fontSize: '1.1rem' }}>译码 (Decode)</strong>
            </div>
            <div style={{ color: '#f59e0b', fontSize: '1.2rem', fontWeight: 'bold' }}>➔</div>
            <div style={{ textAlign: 'center', color: '#10b981' }}>
              <strong style={{ fontSize: '1.1rem' }}>执行 (Execute)</strong>
            </div>
            <div style={{ color: '#f59e0b', fontSize: '1.2rem', fontWeight: 'bold' }}>➔</div>
            <div style={{ textAlign: 'center', color: '#38bdf8' }}>
              <strong style={{ fontSize: '1.1rem' }}>写回 (WB)</strong>
            </div>
          </div>

          <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center' }}>
            PC 递增推进，不断重复此周期，直至遇到 HALT 停机指令或被硬件中断信号暂停。
          </div>
        </div>
      )}
    </div>
  )
}

function CpuStory() {
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
    <section className="transformer-story cpu-story" style={{ marginBottom: '24px' }}>
      <header className="story-intro">
        <div>
          <span className="story-kicker">动画导学 · 约 3 分钟</span>
          <h2>一条指令不是瞬间完成，而是一串精准的硬件微操作</h2>
          <p>沿 PC、MAR、MDR、IR、ALU、ACC 的数据通路，透视 CPU 如何把程序指令化为物理动作。</p>
        </div>
        <div className="memory-story-badge" style={{ padding: '16px 20px', minWidth: '130px' }}>
          <strong>Fetch</strong>
          <span>Decode · Execute</span>
          <small>微操作时钟节拍</small>
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
          <CpuStoryVisual stageIndex={step} />
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

const INITIAL_MEMORY = { 0: 'LOAD 5', 1: 'ADD 6', 2: 'STORE 7', 3: 'HALT', 5: 8, 6: 13, 7: 0 }

function buildProgram() {
  let regs = { PC: 0, MAR: null, MDR: null, IR: null, ACC: 0 }, memory = { ...INITIAL_MEMORY }
  const steps = []

  function push(phase, operation, message, active = [], halted = false) {
    steps.push({ phase, operation, message, active, halted, regs: { ...regs }, memory: { ...memory } })
  }

  push('准备阶段', 'RESET', '寄存器复位完成，PC 指向程序入口地址 0。', ['PC'])

  while (true) {
    regs.MAR = regs.PC
    push('取指周期', 'MAR ← PC', '把下一条指令物理地址送入地址寄存器 MAR。', ['PC', 'MAR'])

    regs.MDR = memory[regs.MAR]
    regs.PC++
    push('取指周期', 'MDR ← M[MAR], PC ← PC + 1', '从主存读出指令到 MDR，同时 PC 自动加 1。', ['MAR', 'MEM', 'MDR', 'PC', `M${regs.MAR}`])

    regs.IR = regs.MDR
    push('取指周期', 'IR ← MDR', '指令由 MDR 锁存入指令寄存器 IR，取指完成。', ['MDR', 'IR'])

    const [op, argText] = String(regs.IR).split(' ')
    const arg = Number(argText)

    push('译码周期', `Decode ${op}${argText ? ` addr ${arg}` : ''}`, '控制单元 CU 译码操作码并产生对应控制总线信号。', ['IR', 'CU'])

    if (op === 'LOAD') {
      regs.MAR = arg
      regs.MDR = memory[arg]
      push('执行周期', 'MAR ← 5, MDR ← M[5]', '从主存地址 5 中读出操作数 8。', ['MAR', 'MEM', 'MDR', `M${arg}`])
      regs.ACC = regs.MDR
      push('写回周期', 'ACC ← MDR', '数据 8 正式写入累加器 ACC。', ['MDR', 'ACC'])
    } else if (op === 'ADD') {
      regs.MAR = arg
      regs.MDR = memory[arg]
      push('执行周期', 'MAR ← 6, MDR ← M[6]', '从主存地址 6 读出第二操作数 13。', ['MAR', 'MEM', 'MDR', `M${arg}`])
      regs.ACC = regs.ACC + Number(regs.MDR)
      push('写回周期', 'ACC ← ACC + MDR', 'ALU 完成加法 8 + 13，结果 21 写回累加器 ACC。', ['MDR', 'ALU', 'ACC'])
    } else if (op === 'STORE') {
      regs.MAR = arg
      regs.MDR = regs.ACC
      push('执行周期', 'MAR ← 7, MDR ← ACC', '准备把 ACC 中的运算结果 21 写回主存地址 7。', ['ACC', 'MDR', 'MAR'])
      memory[arg] = regs.MDR
      push('写回周期', 'M[MAR] ← MDR', '运算结果 21 成功存入主存单元 M[7]。', ['MDR', 'MEM', `M${arg}`])
    } else {
      push('停机阶段', 'HALT', '执行停机指令，CPU 停止取指循环，程序执行结束。', ['IR', 'CU'], true)
      break
    }
  }

  return steps
}

function CpuDatapath({ step }) {
  const boxes = [
    ['PC', 100, 80],
    ['MAR', 300, 80],
    ['MDR', 500, 80],
    ['IR', 300, 240],
    ['ACC', 500, 240],
    ['CU', 100, 240],
    ['ALU', 500, 370],
    ['MEM', 300, 370]
  ]

  return (
    <svg className="cpu-datapath" viewBox="0 0 620 460" style={{ width: '100%', borderRadius: '10px' }}>
      <defs>
        <marker id="cpuArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L7,3 z" fill="#c88724" />
        </marker>
      </defs>
      {[
        [100, 80, 300, 80, 'PC', 'MAR'],
        [300, 80, 300, 370, 'MAR', 'MEM'],
        [300, 370, 500, 80, 'MEM', 'MDR'],
        [500, 80, 300, 240, 'MDR', 'IR'],
        [300, 240, 100, 240, 'IR', 'CU'],
        [500, 80, 500, 370, 'MDR', 'ALU'],
        [500, 370, 500, 240, 'ALU', 'ACC'],
        [500, 240, 500, 370, 'ACC', 'ALU'],
        [500, 240, 300, 370, 'ACC', 'MEM']
      ].map(([x1, y1, x2, y2, a, b], i) => (
        <line
          className={step.active.includes(a) && step.active.includes(b) ? 'active' : ''}
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          markerEnd="url(#cpuArrow)"
          strokeWidth="2.5"
        />
      ))}
      {boxes.map(([name, x, y]) => (
        <g className={step.active.includes(name) ? 'active' : ''} key={name} transform={`translate(${x},${y})`}>
          <rect x="-52" y="-30" width="104" height="60" rx="10" />
          <text y="5" fontSize="15" fontWeight="bold">{name}</text>
        </g>
      ))}
    </svg>
  )
}

export default function InstructionCycleExperiment({ experiment }) {
  const steps = useMemo(() => buildProgram(), [])
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const step = steps[index]

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => {
      setIndex(v => {
        if (v >= steps.length - 1) {
          setPlaying(false)
          return v
        }
        return v + 1
      })
    }, 900 / speed)
    return () => clearInterval(t)
  }, [playing, speed, steps.length])

  return (
    <>
      <ExperimentHeader experiment={experiment} eyebrow="计算机组成原理实验 01 · 处理器架构" />

      {/* 动画导学区 */}
      <CpuStory />

      {/* 自由探索交互实验室 */}
      <div className="explore-heading">
        <span>自由探索 · 跟踪经典程序每次寄存器微传送</span>
        <h2>指令执行周期与 CPU 数据通路实验室</h2>
        <p>单步观测 PC、MAR、MDR、IR、ACC 累加器与主存单元如何在取指、译码、执行、写回之间流转数据。</p>
      </div>

      <div className="lab-layout cpu-layout" style={{ gridTemplateColumns: '320px 1fr' }}>
        <aside className="control-panel">
          <div className="panel-title">
            <span>指令时钟控制</span>
            <i>{step.phase}</i>
          </div>

          <div className="cpu-program" style={{ padding: '14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>待执行汇编程序</span>
            <code style={{ fontSize: '0.95rem', display: 'block', margin: '4px 0', color: '#1e293b' }}>0: LOAD 5</code>
            <code style={{ fontSize: '0.95rem', display: 'block', margin: '4px 0', color: '#1e293b' }}>1: ADD 6</code>
            <code style={{ fontSize: '0.95rem', display: 'block', margin: '4px 0', color: '#1e293b' }}>2: STORE 7</code>
            <code style={{ fontSize: '0.95rem', display: 'block', margin: '4px 0', color: '#dc2626' }}>3: HALT</code>
            <small style={{ display: 'block', marginTop: '6px', color: '#64748b' }}>初始数据：M[5]=8，M[6]=13</small>
          </div>

          <div className="step-counter" style={{ marginTop: '14px' }}>
            <span>微操作节拍</span>
            <strong>{index} / {steps.length - 1}</strong>
          </div>

          <input
            className="step-slider"
            type="range"
            min="0"
            max={steps.length - 1}
            value={index}
            onChange={e => {
              setIndex(Number(e.target.value))
              setPlaying(false)
            }}
          />

          <div className="step-buttons">
            <button disabled={!index} onClick={() => setIndex(index - 1)}>
              ← 上一步
            </button>
            <button disabled={index === steps.length - 1} onClick={() => setIndex(index + 1)}>
              下一步 →
            </button>
          </div>

          <button
            className="tree-play"
            onClick={() => {
              if (step.halted) setIndex(0)
              setPlaying(v => !v)
            }}
          >
            {playing ? '暂停时钟' : step.halted ? '重新运行' : '▶ 连续时钟推进'}
          </button>

          <label className="field-block cpu-speed" style={{ marginTop: '12px' }}>
            <span>时钟主频速度</span>
            <select value={speed} onChange={e => setSpeed(Number(e.target.value))} style={{ padding: '6px', borderRadius: '4px' }}>
              <option value={0.75}>0.75×</option>
              <option value={1}>1.0×</option>
              <option value={1.5}>1.5×</option>
            </select>
          </label>

          <div className="live-explanation" style={{ marginTop: '14px', background: '#f8fafc', borderLeft: '4px solid #c88724', padding: '12px 14px', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: '#c88724', fontWeight: 'bold' }}>{step.phase}</span>
            <strong style={{ display: 'block', fontSize: '1.05rem', margin: '4px 0', color: '#1e293b' }}>{step.operation}</strong>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>{step.message}</p>
          </div>
        </aside>

        <section className="visual-panel cpu-visual">
          <div className="visual-toolbar">
            <div>
              <strong style={{ fontSize: '1.1rem' }}>CPU 数据通路与微操作总线</strong>
              <span style={{ fontSize: '0.85rem' }}>高亮模块：当前正在读写部件 · 发光连线：数据传输方向</span>
            </div>
            <span className="source-chip" style={{ fontSize: '0.9rem' }}>Clock {index}</span>
          </div>

          <CpuDatapath step={step} />

          <div className="cpu-registers" style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            {['PC', 'MAR', 'MDR', 'IR', 'ACC'].map(r => (
              <div
                className={step.active.includes(r) ? 'active' : ''}
                key={r}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: step.active.includes(r) ? '#fff7ed' : '#f8fafc',
                  border: `1.5px solid ${step.active.includes(r) ? '#c88724' : '#e2e8f0'}`,
                  textAlign: 'center'
                }}
              >
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{r}</span>
                <strong style={{ display: 'block', fontSize: '1.2rem', color: '#1e293b', marginTop: '2px' }}>
                  {String(step.regs[r] ?? '—')}
                </strong>
              </div>
            ))}
          </div>

          <div className="cpu-memory" style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            <span style={{ gridColumn: '1 / -1', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>主存储器数据单元 (Memory)</span>
            {Object.entries(step.memory).map(([addr, value]) => (
              <div
                className={step.active.includes(`M${addr}`) ? 'active' : ''}
                key={addr}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: step.active.includes(`M${addr}`) ? '#fff7ed' : '#f8fafc',
                  border: `1px solid ${step.active.includes(`M${addr}`) ? '#c88724' : '#e2e8f0'}`
                }}
              >
                <i style={{ fontStyle: 'normal', color: '#c88724', fontWeight: 'bold', fontSize: '0.85rem' }}>M[{addr}]</i>
                <code style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#1e293b' }}>{String(value)}</code>
              </div>
            ))}
          </div>

          <div className="cpu-micro-op" style={{ marginTop: '14px', background: '#f8fafc', borderLeft: '4px solid #c88724', padding: '12px 16px', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: '#c88724', fontWeight: 'bold' }}>当前微操作寄存器传送语言 (RTL)</span>
            <code style={{ display: 'block', fontSize: '1.05rem', color: '#1e293b', marginTop: '4px', fontWeight: 'bold' }}>
              {step.operation}
            </code>
          </div>
        </section>
      </div>

      <LearningCycle
        experimentId="instruction-cycle"
        prediction={{
          question: '在指令周期的取指阶段，哪个寄存器用于保存下一条待执行指令的主存物理地址？',
          options: ['PC (程序计数器)', 'IR (指令寄存器)', 'ACC (累加器)'],
          answer: 'PC (程序计数器)',
          explanation: 'PC 始终指向下一条待取指令的地址，在每次取指后自动自增。'
        }}
        operation={{
          title: '跟踪 ADD 6 指令的执行',
          instruction: '单步推进时钟直到执行 ADD 6，观察 IR 何时锁存指令、ALU 何时被驱动，以及累加器 ACC 何时由 8 更新为 21。'
        }}
        observation={`当前执行阶段为 ${step.phase}，PC=${step.regs.PC}，IR=${step.regs.IR ?? '—'}，ACC=${step.regs.ACC}，M[7]=${step.memory[7]}。`}
        summaryPrompt="取指、译码、执行和写回四个周期分别改变了哪些寄存器或存储单元？"
      />
    </>
  )
}
