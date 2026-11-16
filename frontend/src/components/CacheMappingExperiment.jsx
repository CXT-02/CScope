import React, { useEffect, useMemo, useState } from 'react'
import { ExperimentHeader } from './AttentionExperiment'
import LearningCycle from './LearningCycle'

const STORY = [
  ['速度鸿沟', 'CPU 很快，主存却跟不上', 'Cache 用少量高速存储保存最近可能再次使用的数据。'],
  ['局部性', '程序倾向于重复访问附近的数据', '时间局部性解释“再次访问”，空间局部性解释“相邻访问”。'],
  ['地址拆分', '一个地址被拆成标记、索引和块内偏移', '索引负责找位置，标记负责确认该位置里是不是目标块。'],
  ['直接映射', '每个主存块只能进入唯一 Cache 行', '硬件简单快速，但映射到同一行的块会反复冲突。'],
  ['全相联', '主存块可以放进任意 Cache 行', '冲突少，但必须同时比较所有行的标记，硬件成本更高。'],
  ['组相联', '先定位组，再在组内选择任意一路', '它在速度、成本和冲突率之间取得常见折中。'],
  ['命中与替换', '命中直接读取，缺失则调入并可能淘汰旧块', '访问序列决定命中率，LRU 等策略决定满组时淘汰谁。'],
]
const PRESETS = {
  locality: { label: '局部性序列', values: [0, 4, 0, 4, 8, 0, 4, 8] },
  conflict: { label: '冲突序列', values: [0, 16, 32, 0, 16, 32, 0, 16] },
}

export default function CacheMappingExperiment({ experiment }) {
  const [mode, setMode] = useState('direct')
  const [preset, setPreset] = useState('conflict')
  const [sequenceText, setSequenceText] = useState(PRESETS.conflict.values.join(', '))
  const sequence = useMemo(() => parseSequence(sequenceText), [sequenceText])
  const simulation = useMemo(() => simulate(sequence, mode), [sequence, mode])
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  useEffect(() => { setStep(0); setPlaying(false) }, [mode, sequenceText])
  useEffect(() => {
    if (!playing || simulation.length < 2) return undefined
    const timer = setInterval(() => setStep((value) => { if (value >= simulation.length - 1) { setPlaying(false); return value } return value + 1 }), 900)
    return () => clearInterval(timer)
  }, [playing, simulation.length])
  const current = simulation[Math.min(step, simulation.length - 1)] || emptyState(mode)
  const bitParts = addressParts(current.address, mode)
  const hits = simulation.slice(0, step + 1).filter((item) => item.hit).length
  const accesses = Math.min(step + 1, simulation.length)
  const rate = accesses ? Math.round((hits / accesses) * 100) : 0
  return <>
    <ExperimentHeader experiment={experiment} eyebrow="组成原理实验 03" />
    <CacheStory />
    <div className="explore-heading"><span>自由探索 · 输入地址并跟踪映射过程</span><h2>看一个主存地址如何找到 Cache 中的位置</h2><p>比较直接映射、全相联和二路组相联；每次访问都会实时拆分地址并标出命中、缺失和替换。</p></div>
    <div className="lab-layout cache-layout"><aside className="control-panel">
      <div className="panel-title"><span>Cache 控制台</span><i>{modeLabel(mode)}</i></div>
      <label className="field-block"><span>映射方式</span><select value={mode} onChange={(e) => setMode(e.target.value)}><option value="direct">直接映射</option><option value="fully">全相联映射</option><option value="set">二路组相联</option></select></label>
      <div className="mapping-help"><strong>{modeLabel(mode)}</strong><p>{mode === 'direct' ? '主存块号 mod 4 得到唯一 Cache 行。' : mode === 'fully' ? '四行均可存放，缺失时优先空行，否则淘汰最久未使用行。' : '块号 mod 2 定位组，再在两路之间选择。'}</p></div>
      <div className="cache-presets"><span>示例访问序列</span>{Object.entries(PRESETS).map(([key, item]) => <button className={preset === key ? 'active' : ''} key={key} onClick={() => { setPreset(key); setSequenceText(item.values.join(', ')) }}>{item.label}</button>)}</div>
      <label className="field-block"><span>字节地址（0～255，逗号分隔）</span><textarea rows="3" value={sequenceText} onChange={(e) => { setPreset(''); setSequenceText(e.target.value) }} /></label>
      {!sequence.length && <p className="input-warning">请输入至少一个 0～255 的整数地址。</p>}
      <div className="step-counter"><span>当前访问</span><strong>{simulation.length ? step + 1 : 0}/{simulation.length}</strong></div>
      <input className="step-slider" type="range" min="0" max={Math.max(0, simulation.length - 1)} value={Math.min(step, Math.max(0, simulation.length - 1))} onChange={(e) => { setStep(Number(e.target.value)); setPlaying(false) }} />
      <div className="step-buttons"><button disabled={step === 0} onClick={() => setStep(step - 1)}>← 上一次</button><button disabled={step >= simulation.length - 1} onClick={() => setStep(step + 1)}>下一次 →</button></div>
      <button className="tree-play" disabled={!simulation.length} onClick={() => { if (step >= simulation.length - 1) setStep(0); setPlaying((value) => !value) }}>{playing ? '暂停访问' : '▶ 连续访问'}</button>
      <div className={`cache-result ${current.hit ? 'hit' : 'miss'}`}><span>{current.hit ? 'CACHE HIT' : 'CACHE MISS'}</span><strong>{current.hit ? '命中：直接读取该行' : current.replaced !== null ? `缺失：替换块 ${current.replaced}` : '缺失：装入空闲行'}</strong><p>{current.reason}</p></div>
    </aside><section className="visual-panel cache-visual">
      <div className="visual-toolbar"><div><strong>8 位地址与 4 行 Cache</strong><span>块大小固定为 4 B，因此最低 2 位始终是块内偏移。</span></div><span className="source-chip">地址 {current.address}</span></div>
      <div className="cache-address"><div className="address-label"><strong>{current.address}</strong><code>{toBits(current.address, 8)}</code></div><div className="address-bits">{bitParts.map((part) => <div className={part.type} style={{ '--span': part.bits.length }} key={part.type}><span>{part.bits}</span><small>{part.label}</small></div>)}</div></div>
      <div className="cache-route"><div><span>主存地址</span><strong>{current.address}</strong></div><b>÷ 4</b><div><span>主存块号</span><strong>{current.block}</strong></div><b>→</b><div className="target"><span>{mode === 'fully' ? '比较范围' : mode === 'set' ? '目标组' : '目标行'}</span><strong>{mode === 'fully' ? '全部 4 行' : current.set}</strong></div></div>
      <div className="cache-table"><header><span>位置</span><span>有效</span><span>Tag</span><span>主存块</span><span>状态</span></header>{current.lines.map((line, index) => <div className={`${current.target === index ? 'target' : ''} ${current.lineIndex === index ? current.hit ? 'hit' : 'loaded' : ''}`} key={index}><strong>{lineName(index, mode)}</strong><span>{line.block === null ? '0' : '1'}</span><code>{line.block === null ? '—' : line.tag}</code><code>{line.block === null ? '空' : `B${line.block}`}</code><i>{current.lineIndex === index ? current.hit ? '命中' : current.replaced !== null ? '替换' : '装入' : current.target === index ? '候选' : '—'}</i></div>)}</div>
      <div className="cache-metrics"><div><span>已访问</span><strong>{accesses}</strong></div><div><span>命中</span><strong>{hits}</strong></div><div><span>缺失</span><strong>{Math.max(0, accesses - hits)}</strong></div><div><span>命中率</span><strong>{rate}%</strong></div></div>
      <div className="cache-formula"><span>本次地址解释</span><code>地址 {current.address} → 块号 ⌊{current.address}/4⌋ = {current.block} → {mode === 'direct' ? `${current.block} mod 4 = 行 ${current.set}` : mode === 'set' ? `${current.block} mod 2 = 组 ${current.set}` : '与所有有效行的 Tag 并行比较'}</code></div>
    </section></div>
    <LearningCycle experimentId="cache-mapping" prediction={{ question: '在直接映射 Cache 中，主存块 0、4、8 会映射到哪里？', options: ['不同的三行', '都映射到第 0 行', '任意空闲行'], answer: '都映射到第 0 行', explanation: ' 直接映射用“块号 mod Cache 行数”定位；0、4、8 对 4 取模都等于 0，因此容易产生冲突缺失。' }} operation={{ title: '比较冲突序列', instruction: '选择“冲突序列”，分别切换直接映射和二路组相联，播放到最后并比较命中率。' }} observation={`当前${modeLabel(mode)}已访问 ${accesses} 次，命中 ${hits} 次，命中率 ${rate}%。`} summaryPrompt="为什么组相联通常比直接映射更能缓解冲突，又比全相联更容易实现？" />
  </>
}

function simulate(sequence, mode) {
  let lines = Array.from({ length: 4 }, () => ({ block: null, tag: null, last: -1 }))
  return sequence.map((address, time) => {
    const block = Math.floor(address / 4)
    const set = mode === 'direct' ? block % 4 : mode === 'set' ? block % 2 : 0
    const candidates = mode === 'direct' ? [set] : mode === 'set' ? [set * 2, set * 2 + 1] : [0, 1, 2, 3]
    let lineIndex = candidates.find((index) => lines[index].block === block)
    const hit = lineIndex !== undefined
    let replaced = null
    if (!hit) {
      lineIndex = candidates.find((index) => lines[index].block === null)
      if (lineIndex === undefined) lineIndex = candidates.reduce((oldest, index) => lines[index].last < lines[oldest].last ? index : oldest, candidates[0])
      replaced = lines[lineIndex].block
      lines[lineIndex] = { block, tag: tagFor(block, mode), last: time }
    } else lines[lineIndex] = { ...lines[lineIndex], last: time }
    const target = mode === 'direct' ? set : lineIndex
    const reason = hit ? `块 B${block} 已在 ${lineName(lineIndex, mode)}，Tag 匹配。` : replaced === null ? `候选位置有空行，把主存块 B${block} 调入。` : `候选位置已满，按 LRU 淘汰 B${replaced}，装入 B${block}。`
    return { address, block, set, target, lineIndex, hit, replaced, reason, lines: lines.map((line) => ({ ...line })) }
  })
}
function parseSequence(text) { return text.split(/[，,\s]+/).filter((token) => token.trim() !== '').map(Number).filter((value) => Number.isInteger(value) && value >= 0 && value <= 255).slice(0, 20) }
function tagFor(block, mode) { return mode === 'direct' ? Math.floor(block / 4) : mode === 'set' ? Math.floor(block / 2) : block }
function toBits(value, length) { return Math.max(0, value || 0).toString(2).padStart(length, '0').slice(-length) }
function addressParts(address, mode) { const bits = toBits(address, 8); if (mode === 'direct') return [{ type: 'tag', label: 'Tag（4 位）', bits: bits.slice(0, 4) }, { type: 'index', label: '行索引（2 位）', bits: bits.slice(4, 6) }, { type: 'offset', label: '块内偏移（2 位）', bits: bits.slice(6) }]; if (mode === 'set') return [{ type: 'tag', label: 'Tag（5 位）', bits: bits.slice(0, 5) }, { type: 'index', label: '组索引（1 位）', bits: bits.slice(5, 6) }, { type: 'offset', label: '块内偏移（2 位）', bits: bits.slice(6) }]; return [{ type: 'tag', label: 'Tag（6 位）', bits: bits.slice(0, 6) }, { type: 'offset', label: '块内偏移（2 位）', bits: bits.slice(6) }] }
function modeLabel(mode) { return ({ direct: '直接映射', fully: '全相联映射', set: '二路组相联' })[mode] }
function lineName(index, mode) { return mode === 'set' ? `组${Math.floor(index / 2)} · 路${index % 2}` : `行 ${index}` }
function emptyState(mode) { return { address: 0, block: 0, set: 0, target: 0, lineIndex: -1, hit: false, replaced: null, reason: '输入访问序列后开始模拟。', lines: Array.from({ length: 4 }, () => ({ block: null, tag: null })) , mode } }

function CacheStoryVisual({ stageIndex }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {/* 阶段 1: 速度鸿沟与存储金字塔 */}
      {stageIndex === 0 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#38bdf8', fontSize: '1rem', fontWeight: 'bold' }}>存储体系的“速度鸿沟” (Memory Wall)</span>
            <span style={{ background: '#3b82f6', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              阶梯访问延迟
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#1e293b', padding: '10px 14px', borderRadius: '8px', borderLeft: '4px solid #38bdf8' }}>
              <div style={{ width: '90px', fontWeight: 'bold', color: '#38bdf8', fontSize: '0.95rem' }}>CPU 核心</div>
              <div style={{ flex: 1, color: '#94a3b8', fontSize: '0.85rem' }}>单时钟周期 ~0.5 ns，需要连续高速吞吐指令与数据</div>
              <span style={{ background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>0.5 ns</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', background: '#1e293b', padding: '10px 14px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
              <div style={{ width: '90px', fontWeight: 'bold', color: '#10b981', fontSize: '0.95rem' }}>Cache (SRAM)</div>
              <div style={{ flex: 1, color: '#94a3b8', fontSize: '0.85rem' }}>容量通常几十KB~数十MB，延迟极低，抵挡 90%+ 访存请求</div>
              <span style={{ background: '#059669', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>1 ~ 5 ns</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', background: '#1e293b', padding: '10px 14px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ width: '90px', fontWeight: 'bold', color: '#f59e0b', fontSize: '0.95rem' }}>主存 (DRAM)</div>
              <div style={{ flex: 1, color: '#94a3b8', fontSize: '0.85rem' }}>容量 8GB~64GB，但访问延迟高达数十至上百周期</div>
              <span style={{ background: '#d97706', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>50 ~ 100 ns</span>
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#38bdf8', textAlign: 'center' }}>
            若直接从主存读写，CPU 绝大部分时间都将处于停摆空转等待（Memory Stall）！
          </div>
        </div>
      )}

      {/* 阶段 2: 局部性原理 */}
      {stageIndex === 1 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#10b981', fontSize: '1rem', fontWeight: 'bold' }}>局部性原理 (Locality of Reference)</span>
            <span style={{ background: '#10b981', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              时间 + 空间
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px solid #3b82f6' }}>
              <div style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '6px' }}>时间局部性 (Temporal)</div>
              <div style={{ background: '#0f172a', padding: '8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#e2e8f0', marginBottom: '8px' }}>
                while (i &lt; 1000) {'{'}<br />
                &nbsp;&nbsp;sum += arr[i]; // 变量 sum<br />
                &nbsp;&nbsp;i++;<br />
                {'}'}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>刚被访问过的指令或数据，在不久的将来极大概率被再次访问（保存在 Cache 内）。</p>
            </div>

            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px solid #10b981' }}>
              <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '6px' }}>空间局部性 (Spatial)</div>
              <div style={{ background: '#0f172a', padding: '8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#e2e8f0', marginBottom: '8px' }}>
                arr[0] ➔ arr[1] ➔ arr[2]<br />
                Cache 块一次性调入<br />
                整个块 [arr[0] ~ arr[7]]
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>一旦访问了某个存储单元，其附近相连的单元不久后也会被访问（以 Cache 行整块调入）。</p>
            </div>
          </div>
        </div>
      )}

      {/* 阶段 3: 地址拆分 */}
      {stageIndex === 2 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#f59e0b', fontSize: '1rem', fontWeight: 'bold' }}>主存地址的三段式解构</span>
            <span style={{ background: '#f59e0b', color: '#1e293b', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Tag | Index | Offset
            </span>
          </div>

          <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '8px' }}>示例：8 位内存地址 (例如 0110 01 10B)</div>
            <div style={{ display: 'flex', height: '52px', borderRadius: '6px', overflow: 'hidden', border: '2px solid #475569' }}>
              <div style={{ flex: 4, background: '#a855f7', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>Tag (标记)</span>
                <span style={{ fontSize: '0.75rem' }}>高 4 位: 0110</span>
              </div>
              <div style={{ flex: 2, background: '#3b82f6', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>Index (索引)</span>
                <span style={{ fontSize: '0.75rem' }}>中间 2 位: 01</span>
              </div>
              <div style={{ flex: 2, background: '#10b981', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>Offset (偏移)</span>
                <span style={{ fontSize: '0.75rem' }}>低 2 位: 10</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '4fr 2fr 2fr', gap: '6px', marginTop: '10px', fontSize: '0.8rem', color: '#cbd5e1', textAlign: 'center' }}>
              <span>用于与 Cache 行中 Tag 比对，核实验对身份</span>
              <span>直接定位到第几行 (或第几组)</span>
              <span>定位行内哪一个字节 (Byte)</span>
            </div>
          </div>
        </div>
      )}

      {/* 阶段 4: 直接映射 */}
      {stageIndex === 3 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#ef4444', fontSize: '1rem', fontWeight: 'bold' }}>直接映射 (Direct Mapped)</span>
            <span style={{ background: '#ef4444', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              行号 = 块号 mod 行数
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.3fr 1.2fr', alignItems: 'center', gap: '10px', background: '#1e293b', padding: '14px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', textAlign: 'center' }}>主存块 (Memory Blocks)</div>
              {['块 0 (Tag 0)', '块 4 (Tag 1)', '块 8 (Tag 2)', '块 12 (Tag 3)'].map((name, i) => (
                <div key={i} style={{ background: '#334155', color: '#f8fafc', padding: '6px 10px', borderRadius: '4px', fontSize: '0.85rem', textAlign: 'center', border: '1px solid #ef4444' }}>
                  {name}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontWeight: 'bold', fontSize: '1.2rem' }}>
              ➔<br />全部映射到
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', textAlign: 'center' }}>4 行 Cache</div>
              <div style={{ background: '#ef4444', color: '#fff', padding: '8px', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 'bold', textAlign: 'center' }}>
                Cache 行 0 (严重冲突颠簸!)
              </div>
              <div style={{ background: '#1e293b', color: '#64748b', padding: '6px', borderRadius: '4px', fontSize: '0.8rem', textAlign: 'center', border: '1px dashed #475569' }}>
                Cache 行 1 (空闲)
              </div>
              <div style={{ background: '#1e293b', color: '#64748b', padding: '6px', borderRadius: '4px', fontSize: '0.8rem', textAlign: 'center', border: '1px dashed #475569' }}>
                Cache 行 2 (空闲)
              </div>
              <div style={{ background: '#1e293b', color: '#64748b', padding: '6px', borderRadius: '4px', fontSize: '0.8rem', textAlign: 'center', border: '1px dashed #475569' }}>
                Cache 行 3 (空闲)
              </div>
            </div>
          </div>
          <div style={{ marginTop: '10px', fontSize: '0.82rem', color: '#fca5a5', textAlign: 'center' }}>
            优点：硬件极简，无需查找；缺点：映射固定，极易发生“冲突缺失 (Conflict Miss)”。
          </div>
        </div>
      )}

      {/* 阶段 5: 全相联映射 */}
      {stageIndex === 4 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#a855f7', fontSize: '1rem', fontWeight: 'bold' }}>全相联映射 (Fully Associative)</span>
            <span style={{ background: '#a855f7', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              任意块可存入任意行
            </span>
          </div>

          <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ background: '#3b82f6', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                目标主存块 B8
              </div>
              <div style={{ color: '#a855f7', fontSize: '1.1rem', fontWeight: 'bold' }}>
                自由选择 ➔
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', flex: 1, marginLeft: '14px' }}>
                <div style={{ background: '#10b981', color: '#fff', padding: '6px', borderRadius: '4px', textAlign: 'center', fontSize: '0.8rem' }}>Line 0 (B1)</div>
                <div style={{ background: '#10b981', color: '#fff', padding: '6px', borderRadius: '4px', textAlign: 'center', fontSize: '0.8rem' }}>Line 1 (B4)</div>
                <div style={{ background: '#a855f7', color: '#fff', padding: '6px', borderRadius: '4px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 'bold' }}>Line 2 (装入 B8)</div>
                <div style={{ background: '#334155', color: '#94a3b8', padding: '6px', borderRadius: '4px', textAlign: 'center', fontSize: '0.8rem' }}>Line 3 (空闲)</div>
              </div>
            </div>

            <div style={{ background: '#0f172a', padding: '10px', borderRadius: '6px', border: '1px solid #64748b' }}>
              <div style={{ color: '#f59e0b', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>检索代价：并行比较器 (CAM)</div>
              <div style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>
                因为无 Index 限制，查找目标块时必须同时将目标 Tag 与 Cache 内<strong>所有行</strong>的 Tag 进行并行比对！硬件开销极大，适合容量小的 TLB。
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 阶段 6: 组相联映射 */}
      {stageIndex === 5 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#10b981', fontSize: '1rem', fontWeight: 'bold' }}>二路组相联 (2-Way Set Associative)</span>
            <span style={{ background: '#10b981', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              组间直接映射 · 组内全相联
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', border: '1.5px solid #38bdf8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ color: '#38bdf8', fontSize: '0.95rem' }}>Set 0 (组号 0)</strong>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>块号 mod 2 = 0</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1, background: '#0f172a', padding: '8px', borderRadius: '4px', textAlign: 'center', border: '1px solid #475569' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Way 0 (路0)</div>
                  <strong style={{ color: '#38bdf8', fontSize: '0.9rem' }}>块 B0</strong>
                </div>
                <div style={{ flex: 1, background: '#0f172a', padding: '8px', borderRadius: '4px', textAlign: 'center', border: '1px solid #475569' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Way 1 (路1)</div>
                  <strong style={{ color: '#38bdf8', fontSize: '0.9rem' }}>块 B4</strong>
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#34d399', marginTop: '6px' }}>B0 和 B4 可以同时共存，不再冲突！</div>
            </div>

            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', border: '1.5px solid #a855f7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ color: '#a855f7', fontSize: '0.95rem' }}>Set 1 (组号 1)</strong>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>块号 mod 2 = 1</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1, background: '#0f172a', padding: '8px', borderRadius: '4px', textAlign: 'center', border: '1px solid #475569' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Way 0 (路0)</div>
                  <strong style={{ color: '#a855f7', fontSize: '0.9rem' }}>块 B1</strong>
                </div>
                <div style={{ flex: 1, background: '#0f172a', padding: '8px', borderRadius: '4px', textAlign: 'center', border: '1px dashed #64748b' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Way 1 (路1)</div>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>空闲</span>
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '6px' }}>只需 2 个比较器，硬件性价比最优方案</div>
            </div>
          </div>
        </div>
      )}

      {/* 阶段 7: 命中与替换 */}
      {stageIndex === 6 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#f59e0b', fontSize: '1rem', fontWeight: 'bold' }}>命中 (Hit) 与缺失替换 (Miss & Replace)</span>
            <span style={{ background: '#f59e0b', color: '#1e293b', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              LRU 算法仲裁
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
              <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.95rem' }}>Cache 命中流程 (Hit)</div>
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '4px' }}>
                1. 检查对应行的有效位 Valid == 1<br />
                2. Tag 匹配一致 ➔ 命中<br />
                3. 根据 Offset 提取对应字直接送入 CPU
              </div>
            </div>

            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
              <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.95rem' }}>Cache 缺失流程 (Miss)</div>
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '4px' }}>
                1. CPU 发生停顿 (Stall)<br />
                2. 向主存发起整块读取 (例如 4 字节块)<br />
                3. 若组已满，采用 <strong>LRU (近期最少使用)</strong> 淘汰最久未访问的旧行
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CacheStory() {
  const [step, setStep] = useState(0)
  return (
    <section className="transformer-story cache-story">
      <header className="story-intro">
        <div>
          <span className="story-kicker">动画导学 · 约 4 分钟</span>
          <h2>Cache 像一张高速工作台：关键是把数据放在哪里</h2>
          <p>从局部性出发，理解地址拆分，再比较三种映射方式如何在速度、容量和冲突之间权衡。</p>
        </div>
        <div className="cache-story-badge">
          <strong>Address</strong>
          <span>Tag</span>
          <span>Index</span>
          <span>Offset</span>
        </div>
      </header>
      <nav className="story-timeline" style={{ '--story-steps': STORY.length }}>
        {STORY.map((item, index) => (
          <button
            className={`${step === index ? 'active' : ''} ${index < step ? 'passed' : ''}`}
            key={item[0]}
            onClick={() => setStep(index)}
          >
            <i>{index < step ? '✓' : index + 1}</i>
            <span>{item[0]}</span>
          </button>
        ))}
      </nav>
      <div className="story-stage">
        <div className="story-copy">
          <span>0{step + 1} · Cache 映射</span>
          <h3>{STORY[step][1]}</h3>
          <p>{[
            'CPU 一个周期就可能需要数据，而主存访问慢得多。Cache 位于两者之间，减少平均访存时间。',
            '循环会反复访问同一批指令和数据，数组遍历又会连续访问相邻地址，这让“小而快”变得可行。',
            '块内偏移选择块内字节；索引缩小查找范围；Tag 与缓存行中的标记比较确认身份。',
            '直接映射只有一个候选位置，访问快，却可能出现“明明还有空位却不断互相顶掉”的冲突。',
            '全相联允许放在任意位置，空间利用灵活，但需要更多比较器并行检查 Tag。',
            '组相联把 Cache 分组，每个块只进入一个组，却可以选择组内多路。',
            '命中率不是映射方式单独决定的，还受到块大小、容量、访问模式和替换策略影响。',
          ][step]}</p>
          <aside>
            <strong>这一点为什么重要？</strong>
            <p>{STORY[step][2]}</p>
          </aside>
        </div>
        <div className="story-visual">
          <CacheStoryVisual stageIndex={step} />
        </div>
      </div>
      <footer className="story-controls">
        <button disabled={!step} onClick={() => setStep(step - 1)}>← 上一步</button>
        <button className="story-play" onClick={() => setStep((step + 1) % STORY.length)}>播放下一幕</button>
        <button disabled={step === STORY.length - 1} onClick={() => setStep(step + 1)}>下一步 →</button>
      </footer>
    </section>
  )
}
