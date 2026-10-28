import React, { useMemo, useState } from 'react'

/**
 * AttentionCanvas
 * token 注意力连线图（纯 SVG 实现，无第三方依赖，保证可复现性）。
 *
 * 输入：tokens[] 与 weights[seq][seq]
 * 交互：
 *  - 连线粗细 = 注意力权重
 *  - 悬停/点击 token 节点：高亮该 token 指向其他 token 的连线
 *  - 显示权重数值
 */
export default function AttentionCanvas({ tokens = [], weights = [], width = 720, height = 420, topK = 3 }) {
  const [focus, setFocus] = useState(null) // 聚焦的 token 索引
  const [hoverEdge, setHoverEdge] = useState(null)

  // 布局：token 沿一条弧线分布，目标行沿弧线下方，连线由源指向目标
  const layout = useMemo(() => {
    const n = tokens.length || 0
    if (n === 0) return []
    const padX = 70
    const ySource = 90
    const yTarget = 330
    const gap = (width - padX * 2) / Math.max(n - 1, 1)
    return tokens.map((tok, i) => {
      const x = padX + gap * i
      return {
        token: tok,
        index: i,
        sx: x,
        sy: ySource,
        tx: x,
        ty: yTarget,
      }
    })
  }, [tokens, width])

  // 计算最大权重用于归一化线宽
  const maxW = useMemo(() => {
    let m = 0
    for (const row of weights) for (const v of row) if (v > m) m = v
    return m || 1
  }, [weights])

  const visibleTargets = useMemo(() => weights.map((row) => new Set(
    row
      .map((weight, index) => ({ weight, index }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, Math.min(topK, row.length))
      .map((item) => item.index)
  )), [weights, topK])

  if (tokens.length === 0) {
    return <div style={styles.empty}>暂无数据，请先输入文本</div>
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={styles.svg} role="img" aria-label="注意力连线图">
      {/* 连线层：源(i) -> 目标(j)，线宽正比权重 */}
      <g>
        {weights.map((row, i) =>
          row.map((w, j) => {
            if (!visibleTargets[i]?.has(j)) return null
            const a = layout[i]
            const b = layout[j]
            if (!a || !b) return null
            const normalized = w / maxW
            const isFocused = focus === null || focus === i || focus === j
            const isHover = hoverEdge !== null && hoverEdge.i === i && hoverEdge.j === j
            const opacity = isFocused ? 0.35 + 0.65 * normalized : 0.06
            const strokeW = 0.6 + normalized * 6
            return (
              <path
                key={`${i}-${j}`}
                className="attention-edge"
                d={`M ${a.sx} ${a.sy} C ${a.sx} 190, ${b.tx} 230, ${b.tx} ${b.ty}`}
                fill="none"
                stroke={isHover ? '#ee6c4d' : '#6558e8'}
                strokeWidth={isHover ? strokeW + 1 : strokeW}
                strokeOpacity={isHover ? 1 : opacity}
                strokeLinecap="round"
                onMouseEnter={() => setHoverEdge({ i, j })}
                onMouseLeave={() => setHoverEdge(null)}
              />
            )
          })
        )}
      </g>

      {/* 源 token 节点（上层） */}
      <g>
        {layout.map((n, i) => {
          const active = focus === i
          return (
            <g key={`s-${i}`} className="attention-node" transform={`translate(${n.sx},${n.sy})`} style={{ cursor: 'pointer' }}>
              <circle r={active ? 16 : 12} fill={active ? '#ee6c4d' : '#6558e8'} />
              <circle r={active ? 16 : 12} fill="none" stroke="#fff" strokeWidth="2" />
              <text y="-22" textAnchor="middle" fontSize="13" fill="#1a2b4a" fontWeight={active ? 700 : 500}>
                {n.token}
              </text>
            </g>
          )
        })}
      </g>

      {/* 目标 token 节点（下层） */}
      <g>
        {layout.map((n, i) => {
          const active = focus === i
          return (
            <g key={`t-${i}`} className="attention-node" transform={`translate(${n.tx},${n.ty})`} style={{ cursor: 'pointer' }}>
              <circle r={active ? 14 : 10} fill={active ? '#ee6c4d' : '#159a83'} onClick={() => setFocus(focus === i ? null : i)} onMouseEnter={() => setFocus(focus === i ? null : i)} />
              <text y="29" textAnchor="middle" fontSize="12" fill="#1a2b4a" fontWeight={active ? 700 : 500}>
                {n.token}
              </text>
            </g>
          )
        })}
      </g>

      {/* 权重数值标注（hover 时显示） */}
      {hoverEdge && layout[hoverEdge.i] && layout[hoverEdge.j] && (
        <text
          x={(layout[hoverEdge.i].sx + layout[hoverEdge.j].tx) / 2}
          y={(layout[hoverEdge.i].sy + layout[hoverEdge.j].ty) / 2}
          textAnchor="middle" fontSize="13" fill="#ee6c4d" fontWeight="700"
        >
          {weights[hoverEdge.i][hoverEdge.j].toFixed(3)}
        </text>
      )}

      {/* 底部提示 */}
      <text x={width / 2} y={height - 10} textAnchor="middle" fontSize="12" fill="#8a94a6">
        每个 token 展示 Top {topK} 关系 · 连线粗细 = 注意力权重 · 点击下方节点聚焦
      </text>
    </svg>
  )
}

const styles = {
  svg: { display: 'block', background: '#fff', borderRadius: '8px' },
  empty: { padding: '40px', textAlign: 'center', color: '#8a94a6', fontSize: '14px' },
}
