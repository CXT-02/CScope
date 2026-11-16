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
  const [subTick, setSubTick] = useState(0)

  useEffect(() => {
    setSubTick(0)
    const timer = setInterval(() => {
      setSubTick(t => (t + 1) % 4)
    }, 1100)
    return () => clearInterval(timer)
  }, [stageIndex])

  return (
    <div className="cpu-story-visual-canvas" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <style>{`
        @keyframes cpuBusFlow {
          0% { stroke-dashoffset: 40; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes cpuGlowPulse {
          0%, 100% { box-shadow: 0 0 10px rgba(56, 189, 248, 0.25); border-color: rgba(56, 189, 248, 0.4); }
          50% { box-shadow: 0 0 22px rgba(56, 189, 248, 0.7); border-color: #38bdf8; }
        }
        @keyframes cuDecodePulse {
          0%, 100% { filter: drop-shadow(0 0 4px #a855f7); transform: scale(1); }
          50% { filter: drop-shadow(0 0 14px #c084fc); transform: scale(1.02); }
        }
        @keyframes aluComputeGlow {
          0%, 100% { background: rgba(16, 185, 129, 0.15); border-color: #10b981; }
          50% { background: rgba(16, 185, 129, 0.35); border-color: #34d399; box-shadow: 0 0 18px rgba(16, 185, 129, 0.5); }
        }
        @keyframes cycleOrbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes signalRay {
          0% { opacity: 0.2; transform: translateY(-3px); }
          50% { opacity: 1; transform: translateY(0); filter: drop-shadow(0 0 6px currentColor); }
          100% { opacity: 0.2; transform: translateY(3px); }
        }
      `}</style>

      {/* 阶段 1: 冯诺依曼架构总线与部件流转 */}
      {stageIndex === 0 && (
        <div style={{ background: '#090f1d', border: '1.5px solid #1e293b', borderRadius: '12px', padding: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', animation: 'cpuGlowPulse 1.5s infinite' }}></span>
              <span style={{ color: '#38bdf8', fontSize: '0.95rem', fontWeight: 'bold' }}>冯·诺依曼架构三大总线流转图</span>
            </div>
            <span style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid rgba(56, 189, 248, 0.3)', fontFamily: 'monospace' }}>
              CLK: 3.5 GHz 脉冲
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr auto 1fr', gap: '10px', alignItems: 'center' }}>
            {/* CPU 复合部件 */}
            <div style={{ background: '#0f172a', border: '1.5px solid #3b82f6', borderRadius: '8px', padding: '12px', textAlign: 'center', animation: 'cpuGlowPulse 3s infinite' }}>
              <div style={{ color: '#60a5fa', fontSize: '0.88rem', fontWeight: 'bold', marginBottom: '8px' }}>中央处理器 CPU</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <div style={{ background: '#1e293b', padding: '6px 4px', borderRadius: '4px', border: '1px solid #f59e0b' }}>
                  <div style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: 'bold' }}>控制器 CU</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>PC / IR / 时序</div>
                </div>
                <div style={{ background: '#1e293b', padding: '6px 4px', borderRadius: '4px', border: '1px solid #10b981' }}>
                  <div style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 'bold' }}>运算器 ALU</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>ACC / 逻辑算术</div>
                </div>
              </div>
              <div style={{ marginTop: '8px', background: 'rgba(59, 130, 246, 0.15)', padding: '3px', borderRadius: '4px', color: '#93c5fd', fontSize: '0.72rem' }}>
                内部寄存器: MAR · MDR · PSW
              </div>
            </div>

            {/* 动态总线通道 (SVG 动态流动粒子线) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 'bold' }}>地址总线 ABUS ➔</span>
                <svg width="120" height="12" style={{ display: 'block' }}>
                  <line x1="0" y1="6" x2="120" y2="6" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="6 4" style={{ animation: 'cpuBusFlow 1s linear infinite' }} />
                </svg>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 'bold' }}>⇄ 数据总线 DBUS ⇄</span>
                <svg width="120" height="12" style={{ display: 'block' }}>
                  <line x1="0" y1="6" x2="120" y2="6" stroke="#38bdf8" strokeWidth="3" strokeDasharray="8 4" style={{ animation: 'cpuBusFlow 0.8s linear infinite reverse' }} />
                </svg>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#c084fc', fontWeight: 'bold' }}>控制总线 CBUS ➔</span>
                <svg width="120" height="12" style={{ display: 'block' }}>
                  <line x1="0" y1="6" x2="120" y2="6" stroke="#c084fc" strokeWidth="2.5" strokeDasharray="6 4" style={{ animation: 'cpuBusFlow 1.2s linear infinite' }} />
                </svg>
              </div>
            </div>

            {/* 主存储器 Memory */}
            <div style={{ background: '#0f172a', border: '1.5px solid #10b981', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ color: '#34d399', fontSize: '0.88rem', fontWeight: 'bold' }}>主存储器 Memory</div>
              <div style={{ background: '#1e293b', border: '1px dashed #475569', borderRadius: '4px', padding: '6px', margin: '6px 0', fontSize: '0.76rem', fontFamily: 'monospace' }}>
                <div style={{ color: '#fbbf24' }}>00H: ADD M[06H]</div>
                <div style={{ color: '#38bdf8' }}>06H: DATA (13)</div>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>指令与数据同处一存</div>
            </div>
          </div>
        </div>
      )}

      {/* 阶段 2: 取指周期流水微操作 (动态高亮轮转) */}
      {stageIndex === 1 && (
        <div style={{ background: '#090f1d', border: '1.5px solid #1e293b', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#f59e0b', fontSize: '0.95rem', fontWeight: 'bold' }}>取指流水微操作：微节拍 T{subTick + 1} 演示</span>
            <span style={{ background: '#f59e0b', color: '#0f172a', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              步进：{['① 送地址', '② 读存储', '③ 入指令', '④ PC自增'][subTick]}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', position: 'relative' }}>
            {/* 1. PC */}
            <div style={{
              background: subTick === 0 ? 'rgba(59, 130, 246, 0.3)' : '#0f172a',
              border: subTick === 0 ? '2px solid #38bdf8' : '1px solid #334155',
              boxShadow: subTick === 0 ? '0 0 15px rgba(56, 189, 248, 0.6)' : 'none',
              borderRadius: '8px', padding: '10px 6px', textAlign: 'center', transition: 'all 0.3s'
            }}>
              <div style={{ fontSize: '0.72rem', color: subTick === 0 ? '#38bdf8' : '#94a3b8' }}>1. 计数器</div>
              <strong style={{ fontSize: '0.95rem', color: '#fff', display: 'block', margin: '2px 0' }}>PC: 00H</strong>
              <div style={{ fontSize: '0.68rem', color: subTick === 0 ? '#67e8f9' : '#64748b' }}>送地址MAR</div>
            </div>

            {/* 2. MAR */}
            <div style={{
              background: subTick === 1 ? 'rgba(245, 158, 11, 0.3)' : '#0f172a',
              border: subTick === 1 ? '2px solid #fbbf24' : '1px solid #334155',
              boxShadow: subTick === 1 ? '0 0 15px rgba(245, 158, 11, 0.6)' : 'none',
              borderRadius: '8px', padding: '10px 6px', textAlign: 'center', transition: 'all 0.3s'
            }}>
              <div style={{ fontSize: '0.72rem', color: subTick === 1 ? '#fbbf24' : '#94a3b8' }}>2. 地址寄存器</div>
              <strong style={{ fontSize: '0.95rem', color: '#fff', display: 'block', margin: '2px 0' }}>MAR: 00H</strong>
              <div style={{ fontSize: '0.68rem', color: subTick === 1 ? '#fde68a' : '#64748b' }}>访存读指令</div>
            </div>

            {/* 3. MDR */}
            <div style={{
              background: subTick === 2 ? 'rgba(16, 185, 129, 0.3)' : '#0f172a',
              border: subTick === 2 ? '2px solid #34d399' : '1px solid #334155',
              boxShadow: subTick === 2 ? '0 0 15px rgba(16, 185, 129, 0.6)' : 'none',
              borderRadius: '8px', padding: '10px 6px', textAlign: 'center', transition: 'all 0.3s'
            }}>
              <div style={{ fontSize: '0.72rem', color: subTick === 2 ? '#34d399' : '#94a3b8' }}>3. 数据缓冲</div>
              <strong style={{ fontSize: '0.95rem', color: '#fff', display: 'block', margin: '2px 0' }}>MDR</strong>
              <div style={{ fontSize: '0.68rem', color: subTick === 2 ? '#a7f3d0' : '#64748b' }}>暂存机器码</div>
            </div>

            {/* 4. IR */}
            <div style={{
              background: subTick === 3 ? 'rgba(236, 72, 153, 0.3)' : '#0f172a',
              border: subTick === 3 ? '2px solid #f472b6' : '1px solid #334155',
              boxShadow: subTick === 3 ? '0 0 15px rgba(236, 72, 153, 0.6)' : 'none',
              borderRadius: '8px', padding: '10px 6px', textAlign: 'center', transition: 'all 0.3s'
            }}>
              <div style={{ fontSize: '0.72rem', color: subTick === 3 ? '#f472b6' : '#94a3b8' }}>4. 指令寄存器</div>
              <strong style={{ fontSize: '0.95rem', color: '#fff', display: 'block', margin: '2px 0' }}>IR</strong>
              <div style={{ fontSize: '0.68rem', color: subTick === 3 ? '#fbcfe8' : '#64748b' }}>送控制器CU</div>
            </div>
          </div>

          {/* 动态微操作总线流转提示条 */}
          <div style={{ marginTop: '12px', background: '#0f172a', padding: '8px 12px', borderRadius: '6px', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: '#cbd5e1' }}>当前微操作硬件动作：</span>
            <span style={{ color: '#38bdf8', fontWeight: 'bold', fontFamily: 'monospace' }}>
              {subTick === 0 && 'PC ➔ MAR (发出物理内存地址 00H)'}
              {subTick === 1 && 'Memory[00H] ➔ 数据总线 ➔ MDR (读取操作码)'}
              {subTick === 2 && 'MDR ➔ 内部数据通路 ➔ IR (装载至指令寄存器)'}
              {subTick === 3 && '取指完成，伴随动作：PC 自动加 1 (PC ➔ 01H) ⚡'}
            </span>
          </div>
        </div>
      )}

      {/* 阶段 3: 译码周期动态解析 (用户截图指出的重点模块！) */}
      {stageIndex === 2 && (
        <div style={{ background: '#090f1d', border: '1.5px solid #1e293b', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#c084fc', animation: 'cuDecodePulse 1.2s infinite' }}></span>
              <span style={{ color: '#c084fc', fontSize: '0.95rem', fontWeight: 'bold' }}>指令译码 (Decode)：操作码分解与控制扇出</span>
            </div>
            <span style={{ background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid rgba(192, 132, 252, 0.3)', fontFamily: 'monospace' }}>
              CU 矩阵动态译码中
            </span>
          </div>

          {/* IR 指令分解框 */}
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
              <span>指令寄存器 IR [15:0]</span>
              <span style={{ color: '#cbd5e1', fontFamily: 'monospace' }}>机器码: 0001 0000 0000 0110</span>
            </div>
            <div style={{ display: 'flex', height: '38px', borderRadius: '6px', overflow: 'hidden', border: '2px solid #475569' }}>
              <div style={{ width: '42%', background: 'linear-gradient(135deg, #7e22ce, #9333ea)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', animation: 'cuDecodePulse 2s infinite' }}>
                操作码 OPCODE (ADD)
              </div>
              <div style={{ width: '58%', background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
                地址码 ADDRESS (06H)
              </div>
            </div>
          </div>

          {/* 译码流向扇出与信号激活 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', alignItems: 'stretch' }}>
            {/* 左侧：CU 逻辑解析与控制总线脉冲 */}
            <div style={{ background: '#0f172a', border: '1px solid #7e22ce', borderRadius: '8px', padding: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#c084fc', fontSize: '0.8rem', fontWeight: 'bold' }}>CU 控制单元矩阵</span>
                <span style={{ color: '#34d399', fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>译码识别: 加法指令</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1e293b', padding: '4px 8px', borderRadius: '4px', fontSize: '0.72rem' }}>
                  <span style={{ color: '#94a3b8' }}>① 控制线: ALU_OP</span>
                  <span style={{ color: '#38bdf8', fontWeight: 'bold', animation: 'signalRay 1s infinite' }}>[ADD] 高电平 ⚡</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1e293b', padding: '4px 8px', borderRadius: '4px', fontSize: '0.72rem' }}>
                  <span style={{ color: '#94a3b8' }}>② 控制线: MEM_READ</span>
                  <span style={{ color: '#34d399', fontWeight: 'bold', animation: 'signalRay 1.2s infinite' }}>[ENABLE] 有效 ⚡</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1e293b', padding: '4px 8px', borderRadius: '4px', fontSize: '0.72rem' }}>
                  <span style={{ color: '#94a3b8' }}>③ 时钟节拍: CLK_PULSE</span>
                  <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>节拍 T2 激活 ⏱</span>
                </div>
              </div>
            </div>

            {/* 右侧：地址码发射至 MAR */}
            <div style={{ background: '#0f172a', border: '1px solid #1d4ed8', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ color: '#60a5fa', fontSize: '0.8rem', fontWeight: 'bold' }}>操作数寻址通路</span>
                <div style={{ marginTop: '4px', fontSize: '0.75rem', color: '#94a3b8' }}>
                  地址码 <span style={{ color: '#93c5fd', fontWeight: 'bold', fontFamily: 'monospace' }}>06H</span> 注入 MAR：
                </div>
              </div>
              <div style={{ background: 'rgba(37, 99, 235, 0.15)', border: '1px dashed #3b82f6', borderRadius: '6px', padding: '6px', textAlign: 'center', margin: '4px 0' }}>
                <span style={{ color: '#93c5fd', fontSize: '0.82rem', fontWeight: 'bold', fontFamily: 'monospace' }}>MAR ➔ M[06H]</span>
                <div style={{ color: '#38bdf8', fontSize: '0.68rem', marginTop: '2px' }}>准备在执行期读取操作数 13</div>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#34d399', textAlign: 'center' }}>
                微命令准备就绪，进入执行阶段 ➔
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 阶段 4: 执行阶段动态 ALU 加法运算 */}
      {stageIndex === 3 && (
        <div style={{ background: '#090f1d', border: '1.5px solid #1e293b', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#10b981', fontSize: '0.95rem', fontWeight: 'bold' }}>执行周期 (Execute)：ALU 算术逻辑单元微操作运算</span>
            <span style={{ background: '#10b981', color: '#0f172a', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              微操作：(ACC) + (MDR) ➔ ALU
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1.2fr', gap: '8px', alignItems: 'center', padding: '12px', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
            {/* 输入 A: 累加器 */}
            <div style={{ background: '#1e293b', border: '1.5px solid #38bdf8', borderRadius: '6px', padding: '10px 6px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>累加器 ACC</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#38bdf8', fontFamily: 'monospace' }}>8</div>
              <div style={{ fontSize: '0.68rem', color: '#67e8f9' }}>第一操作数</div>
            </div>

            <div style={{ fontSize: '1.4rem', color: '#10b981', fontWeight: 'bold', animation: 'signalRay 0.8s infinite' }}>+</div>

            {/* 输入 B: 内存取出的操作数 */}
            <div style={{ background: '#1e293b', border: '1.5px solid #f59e0b', borderRadius: '6px', padding: '10px 6px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>缓冲器 MDR</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#fbbf24', fontFamily: 'monospace' }}>13</div>
              <div style={{ fontSize: '0.68rem', color: '#fde68a' }}>来自 M[06H]</div>
            </div>

            <div style={{ fontSize: '1.4rem', color: '#10b981', fontWeight: 'bold' }}>➔</div>

            {/* ALU 运算输出 */}
            <div style={{
              borderRadius: '6px', padding: '10px 8px', textAlign: 'center',
              animation: 'aluComputeGlow 1.8s infinite', border: '2px solid #10b981'
            }}>
              <div style={{ fontSize: '0.72rem', color: '#86efac' }}>ALU 运算输出</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#10b981', fontFamily: 'monospace' }}>21</div>
              <div style={{ fontSize: '0.68rem', color: '#34d399' }}>加法运算完成 ⚡</div>
            </div>
          </div>

          <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center', background: 'rgba(16, 185, 129, 0.08)', padding: '6px', borderRadius: '4px' }}>
            ALU 运算时间通常仅占半个时钟节拍，计算结果已送上内部总线等待写回。
          </div>
        </div>
      )}

      {/* 阶段 5: 写回周期与标志位更新 */}
      {stageIndex === 4 && (
        <div style={{ background: '#090f1d', border: '1.5px solid #1e293b', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#38bdf8', fontSize: '0.95rem', fontWeight: 'bold' }}>写回周期 (Writeback)：更新寄存器与状态标志</span>
            <span style={{ background: '#2563eb', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              微操作：ALU ➔ ACC
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
            {/* 写入 ACC */}
            <div style={{ background: '#0f172a', border: '1.5px solid #3b82f6', borderRadius: '8px', padding: '12px', animation: 'cpuGlowPulse 2.5s infinite' }}>
              <div style={{ fontSize: '0.88rem', color: '#93c5fd', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                <span>累加器写入：ACC ➔ 21</span>
                <span style={{ color: '#34d399', fontSize: '0.75rem' }}>已锁定</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '6px', lineHeight: '1.5' }}>
                运算结果正式保存进内部累加寄存器 ACC，替代原先的 8，供后续指令使用。
              </div>
            </div>

            {/* 标志位 PSW */}
            <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '0.88rem', color: '#fbbf24', fontWeight: 'bold', marginBottom: '6px' }}>
                程序状态字 PSW (标志位)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', textAlign: 'center' }}>
                <div style={{ background: '#1e293b', padding: '4px', borderRadius: '4px', border: '1px solid #475569' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Z (零)</span>
                  <strong style={{ fontSize: '0.85rem', color: '#38bdf8', fontFamily: 'monospace' }}>0</strong>
                </div>
                <div style={{ background: '#1e293b', padding: '4px', borderRadius: '4px', border: '1px solid #475569' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>S (符号)</span>
                  <strong style={{ fontSize: '0.85rem', color: '#38bdf8', fontFamily: 'monospace' }}>0</strong>
                </div>
                <div style={{ background: '#1e293b', padding: '4px', borderRadius: '4px', border: '1px solid #475569' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>V (溢出)</span>
                  <strong style={{ fontSize: '0.85rem', color: '#38bdf8', fontFamily: 'monospace' }}>0</strong>
                </div>
                <div style={{ background: '#1e293b', padding: '4px', borderRadius: '4px', border: '1px solid #475569' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>C (进位)</span>
                  <strong style={{ fontSize: '0.85rem', color: '#38bdf8', fontFamily: 'monospace' }}>0</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 阶段 6: 循环往复大循环 (动效跑马灯) */}
      {stageIndex === 5 && (
        <div style={{ background: '#090f1d', border: '1.5px solid #1e293b', borderRadius: '12px', padding: '16px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#f59e0b', fontSize: '0.95rem', fontWeight: 'bold' }}>无限指令大循环：时钟驱动四阶脉动</span>
            <span style={{ background: '#f59e0b', color: '#0f172a', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              PC ➔ PC + 1 (持续递增)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
            {[
              { name: '1. 取指 Fetch', color: '#38bdf8', code: 'PC➔MAR➔IR' },
              { name: '2. 译码 Decode', color: '#c084fc', code: 'CU 逻辑解析' },
              { name: '3. 执行 Execute', color: '#10b981', code: 'ALU 计算/访存' },
              { name: '4. 写回 WB', color: '#fbbf24', code: '刷新 ACC/PSW' }
            ].map((st, i) => (
              <div key={st.name} style={{
                background: subTick === i ? 'rgba(56, 189, 248, 0.2)' : '#0f172a',
                border: subTick === i ? `2px solid ${st.color}` : '1px solid #334155',
                boxShadow: subTick === i ? `0 0 16px ${st.color}` : 'none',
                borderRadius: '8px', padding: '12px 6px', transition: 'all 0.3s'
              }}>
                <strong style={{ color: st.color, fontSize: '0.88rem', display: 'block' }}>{st.name}</strong>
                <span style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'block', marginTop: '4px' }}>{st.code}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '14px', background: '#0f172a', padding: '8px 12px', borderRadius: '6px', border: '1px solid #334155', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
            时钟脉冲永不停歇，直到遇到 <span style={{ color: '#ef4444', fontWeight: 'bold' }}>HALT 停机</span> 或触发 <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>外部中断信号</span>。
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
