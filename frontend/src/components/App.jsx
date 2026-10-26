import React, { useState, useEffect } from 'react'
import { getAttention, getBackendStatus } from '../lib/attentionService'
import AttentionCanvas from './AttentionCanvas'

export default function App() {
  const [text, setText] = useState('我喜欢学习深度学习')
  const [layer, setLayer] = useState(0)
  const [head, setHead] = useState(0)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [backendOnline, setBackendOnline] = useState(false)
  const [error, setError] = useState(null)

  // 初始：探测后端状态
  useEffect(() => {
    getBackendStatus().then((s) => setBackendOnline(s.online)).catch(() => setBackendOnline(false))
  }, [])

  // 输入或层级变化时请求权重
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getAttention({ text, layer, head })
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
  }, [text, layer, head])

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <h1 style={styles.title}>Attention Lab</h1>
        <span style={styles.subtitle}>注意力机制层级权重可视化工坊</span>
        <span style={{ ...styles.badge, ...(backendOnline ? styles.badgeLive : styles.badgeDegraded) }}>
          {backendOnline ? '后端在线 · 真实权重' : '后端离线 · 降级数据'}
        </span>
      </header>

      <main style={styles.main}>
        <section style={styles.panel}>
          <label style={styles.label}>输入文本</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            style={styles.textarea}
          />

          <div style={styles.controls}>
            <label style={styles.label}>
              层 Layer: {layer}
              <input
                type="range"
                min={0}
                max={11}
                value={layer}
                onChange={(e) => setLayer(Number(e.target.value))}
                style={styles.slider}
              />
            </label>
            <label style={styles.label}>
              头 Head: {head}
              <input
                type="range"
                min={0}
                max={11}
                value={head}
                onChange={(e) => setHead(Number(e.target.value))}
                style={styles.slider}
              />
            </label>
          </div>
        </section>

        <section style={styles.canvasArea}>
          <div style={styles.sourceTag}>
            数据来源：{result ? sourceLabel(result.source) : '等待…'}
          </div>
          {loading && <div style={styles.status}>计算中…</div>}
          {error && <div style={styles.error}>出错了：{error}</div>}
          {result && !loading && (
            <AttentionCanvas
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
  root: {
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: '#1a2b4a',
    background: '#f6f8fb',
    minHeight: '100vh',
    padding: '20px',
    boxSizing: 'border-box',
  },
  header: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' },
  title: { margin: 0, fontSize: '24px', color: '#1a2b4a' },
  subtitle: { fontSize: '13px', color: '#66738c' },
  badge: { fontSize: '12px', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 },
  badgeLive: { background: '#e3f6e8', color: '#1a7f37' },
  badgeDegraded: { background: '#fdeee6', color: '#a34a1f' },
  main: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' },
  panel: { background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 6px rgba(20,40,80,.08)' },
  label: { display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#4a5870', marginBottom: '12px' },
  textarea: { width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #d8dfe9', fontSize: '14px', fontFamily: 'inherit' },
  controls: { marginTop: '16px' },
  slider: { width: '100%' },
  canvasArea: { background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 6px rgba(20,40,80,.08)', minHeight: '400px' },
  status: { color: '#66738c', fontSize: '14px' },
  error: { color: '#c0392b', fontSize: '14px' },
  sourceTag: { fontSize: '12px', color: '#66738c', marginBottom: '10px', padding: '4px 10px', background: '#f0f4fa', borderRadius: '6px', display: 'inline-block' },
}
