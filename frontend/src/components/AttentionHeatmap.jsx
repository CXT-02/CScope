import React, { useMemo } from 'react'

/**
 * AttentionHeatmap
 * 注意力权重矩阵热力图（纯 CSS 实现，无第三方依赖）。
 * 单元格颜色深浅 = 注意力权重大小，行 = 源 token，列 = 目标 token。
 */
export default function AttentionHeatmap({ tokens = [], weights = [], cellSize = 34 }) {
  const maxW = useMemo(() => {
    let m = 0
    for (const row of weights) for (const v of row) if (v > m) m = v
    return m || 1
  }, [weights])

  const n = tokens.length
  if (n === 0 || weights.length === 0) {
    return <div style={styles.empty}>暂无热力图数据</div>
  }

  // 颜色插值：低权重→浅蓝，高权重→深蓝
  function heatColor(v) {
    const t = v / maxW
    const r = Math.round(246 - t * 146)
    const g = Math.round(247 - t * 160)
    const b = Math.round(255 - t * 25)
    return `rgb(${r},${g},${b})`
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.grid}>
        {/* 顶部 token 标签行 */}
        <div style={{ width: cellSize * 1.4, height: cellSize, display: 'inline-flex', alignItems: 'flex-end', justifyContent: 'flex-end', paddingRight: 4, fontSize: 11, color: '#66738c', whiteSpace: 'nowrap' }}>
          源\目标
        </div>
        {tokens.map((t, j) => (
          <div key={`th-${j}`} style={{ width: cellSize, height: cellSize, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#334', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '0 2px' }}>
            {t}
          </div>
        ))}
        <div style={{ clear: 'both' }} />
        {weights.map((row, i) => (
          <div key={`row-${i}`} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: cellSize * 1.4, height: cellSize, display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6, fontSize: 12, fontWeight: 600, color: '#1a2b4a', whiteSpace: 'nowrap' }}>
              {tokens[i]}
            </div>
            {row.map((w, j) => (
              <div
                key={`c-${i}-${j}`}
                className="heatmap-cell"
                style={{
                  width: cellSize,
                  height: cellSize,
                  background: heatColor(w),
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  color: w > maxW / 2 ? '#fff' : '#1a2b4a',
                  borderRadius: 3,
                  margin: 1,
                  fontWeight: 600,
                  transition: 'background-color 420ms cubic-bezier(.2,.8,.2,1), color 300ms ease, transform 180ms ease',
                }}
                title={`${tokens[i]} → ${tokens[j]}: ${w.toFixed(3)}`}
              >
                {w.toFixed(2)}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={styles.legend}>
        <span style={{ color: '#8a94a6', fontSize: 12 }}>权重：低</span>
        <span style={{ width: 90, height: 11, display: 'inline-block', background: 'linear-gradient(to right, rgb(246,247,255), rgb(100,87,230))', borderRadius: 6, margin: '0 8px' }} />
        <span style={{ color: '#8a94a6', fontSize: 12 }}>高</span>
      </div>
    </div>
  )
}

const styles = {
  wrap: { padding: '8px 4px' },
  grid: { lineHeight: 1 },
  empty: { padding: '40px', textAlign: 'center', color: '#8a94a6', fontSize: '14px' },
  legend: { display: 'flex', alignItems: 'center', marginTop: '12px', fontSize: 12, color: '#66738c' },
}
