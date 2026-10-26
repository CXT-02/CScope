import React, { useState, useEffect } from 'react'
import { getAttention, getBackendStatus } from '../lib/attentionService'
import AttentionCanvas from './AttentionCanvas'
import AttentionHeatmap from './AttentionHeatmap'

export default function App() {
  const [text, setText] = useState('我喜欢学习深度学习')
  const [layer, setLayer] = useState(0)
  const [head, setHead] = useState(0)
  const [temperature, setTemperature] = useState(1.0)
  const [view, setView] = useState('graph') // 'graph' | 'heatmap'
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [backendOnline, setBackendOnline] = useState(false)
  const [error, setError] = useState(null)

  // 初始：探测后端状态
  useEffect(() => {
    getBackendStatus().then((s) => setBackendOnline(s.online)).catch(() => setBackendOnline(false))
  }, [])

  // 输入、层级、温度变化时请求权重
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getAttention({ text, layer, head, temperature })
      .then((r) => {
        if (!cancelled) {
          setResult(r)
          setLoading(false)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(String(e))
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [text, layer, head, temperature])

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <div style={styles.headerTitle}>
          <h1 style={styles.title}>Attention Lab</h1>
          <span style={styles.subtitle}>注意力机制层级权重可视化工坊</span>
        </div>
        <span style={{ ...styles.badge, ...(backendOnline ? styles.badgeLive : styles.badgeDegraded) }}>
          {backendOnline ? '后端在线 · 真实权重' : '后端离线 · 降级数据'}
        </span>
      </header>

      <main style={styles.main}>
        {/* 控制面板 */}
        <section style={styles.panel}>
          <label style={styles.labelBlock}>
            <span style={styles.labelText}>输入文本</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              style={styles.textarea}
              placeholder="输入一句话，例如：我喜欢学习深度学习"
            />
          </label>

          <div style={styles.sliderGroup}>
            <label style={styles.labelBlock}>
              <span style={styles.labelRow}>
                <span style={styles.labelText}>层 Layer</span>
                <span style={styles.valueTag}>{layer}</span>
              </span>
              <input type="range" min={0} max={11} value={layer} onChange={(e) => setLayer(Number(e.target.value))} style={styles.slider} />
            </label>
            <label style={styles.labelBlock}>
              <span style={styles.labelRow}>
                <span style={styles.labelText}>头 Head</span>
                <span style={styles.valueTag}>{head}</span>
              </span>
              <input type="range" min={0} max={11} value={head} onChange={(e) => setHead(Number(e.target.value))} style={styles.slider} />
            </label>
            <label style={styles.labelBlock}>
              <span style={styles.labelRow}>
                <span style={styles.labelText}>温度 Temperature</span>
                <span style={styles.valueTag}>{temperature.toFixed(1)}</span>
              </span>
              <input type="range" min={0.1} max={3} step={0.1} value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} style={styles.slider} />
            </label>
          </div>

          <div style={styles.viewSwitch}>
            <button style={{ ...styles.viewBtn, ...(view === 'graph' ? styles.viewBtnActive : {}) }} onClick={() => setView('graph')}>连线图</button>
            <button style={{ ...styles.viewBtn, ...(view === 'heatmap' ? styles.viewBtnActive : {}) }} onClick={() => setView('heatmap')}>热力图</button>
          </div>

          {result && !loading && (
            <div style={styles.meta}>
              <div>Token 数：{result.data.tokens?.length}</div>
              <div>矩阵：{result.data.shape?.join(' × ')}</div>
              <div>层 {result.data.layer} · 头 {result.data.head}</div>
            </div>
          )}
        </section>

        {/* 可视化区 */}
        <section style={styles.canvasArea}>
          <div style={styles.canvasToolbar}>
            <span style={styles.sourceTag}>
              数据来源：{result ? sourceLabel(result.source) : '等待…'}
            </span>
          </div>
          {loading && <div style={styles.status}>计算中…</div>}
          {error && <div style={styles.error}>出错了：{error}</div>}
          {result && !loading && view === 'graph' && (
            <AttentionCanvas
              tokens={result.data.tokens}
              weights={result.data.weights}
            />
          )}
          {result && !loading && view === 'heatmap' && (
            <AttentionHeatmap
              tokens={result.data.tokens}
              weights={result.data.weights}
            />
          )}
        </section>
      </main>
    </div>
  )
}

function sourceLabel(source) {
  return (
    { live: '真实权重（后端）', precomputed: '预计算权重', sample: '示例数据（示意）' }[source] || source
  )
}

const styles = {
  root: { fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#1a2b4a', background: '#f0f4fa', minHeight: '100vh', padding: '24px', boxSizing: 'border-box' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' },
  headerTitle: { display: 'flex', alignItems: 'baseline', gap: '12px' },
  title: { margin: 0, fontSize: '26px', color: '#1a2b4a' },
  subtitle: { fontSize: '13px', color: '#66738c' },
  badge: { fontSize: '12px', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 },
  badgeLive: { background: '#e3f6e8', color: '#1a7f37' },
  badgeDegraded: { background: '#fdeee6', color: '#a34a1f' },
  main: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' },
  panel: { background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 8px rgba(20,40,80,.08)', alignSelf: 'start' },
  labelBlock: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  labelText: { fontSize: '13px', color: '#4a5870', fontWeight: 500 },
  valueTag: { fontSize: '13px', color: '#3b6fd4', fontWeight: 700, background: '#eef4ff', padding: '2px 8px', borderRadius: '6px' },
  textarea: { width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #d8dfe9', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical' },
  sliderGroup: { marginTop: '4px' },
  slider: { width: '100%', cursor: 'pointer' },
  viewSwitch: { display: 'flex', gap: '8px', marginTop: '4px' },
  viewBtn: { flex: 1, padding: '8px 0', borderRadius: '8px', border: '1px solid #d8dfe9', background: '#fff', color: '#4a5870', fontSize: '13px', cursor: 'pointer', fontWeight: 500 },
  viewBtnActive: { background: '#3b6fd4', color: '#fff', borderColor: '#3b6fd4' },
  meta: { marginTop: '16px', padding: '12px', background: '#f7f9fc', borderRadius: '8px', fontSize: '12px', color: '#66738c', display: 'flex', flexDirection: 'column', gap: '4px' },
  canvasArea: { background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 8px rgba(20,40,80,.08)', minHeight: '440px' },
  canvasToolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  sourceTag: { fontSize: '12px', color: '#66738c', padding: '4px 10px', background: '#f0f4fa', borderRadius: '6px' },
  status: { color: '#66738c', fontSize: '14px', padding: '40px', textAlign: 'center' },
  error: { color: '#c0392b', fontSize: '14px', padding: '40px', textAlign: 'center' },
}
