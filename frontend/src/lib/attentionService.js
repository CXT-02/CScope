/**
 * attentionService.js
 * 可降级（graceful degradation）的注意力权重获取服务。
 *
 * 数据来源三级降级链：
 *  1. backend 在线      → 实时请求真实 attention 权重（source: 'live'）
 *  2. backend 离线      → 加载预计算权重 JSON（source: 'precomputed'）
 *  3. 预计算也缺失      → 使用内置示例权重（source: 'sample'），UI 明确标注
 *
 * 所有对外接口统一返回 { status, data, source } 结构（见 ARCHITECTURE.md §5）。
 */

const API_BASE = '/api/v1'

// 内置示例权重：一个简单句子的 [1 head, 5 token, 5 token] 注意力矩阵（示意数据）
const SAMPLE_TOKENS = ['我', '喜欢', '学习', '深度', '学习']
const SAMPLE_WEIGHTS = [
  [0.30, 0.20, 0.15, 0.20, 0.15],
  [0.20, 0.35, 0.10, 0.15, 0.20],
  [0.15, 0.10, 0.40, 0.20, 0.15],
  [0.20, 0.15, 0.20, 0.30, 0.15],
  [0.15, 0.20, 0.15, 0.20, 0.30],
]

// 后端可用性探测（带超时）
async function probeBackend(timeoutMs = 2000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal })
    clearTimeout(timer)
    return res.ok
  } catch {
    clearTimeout(timer)
    return false
  }
}

/**
 * 获取注意力权重（自动降级）
 * @param {object} params
 * @param {string} params.text         输入文本
 * @param {number} params.layer        层索引（0-based）
 * @param {number} params.head         头索引
 * @param {number} params.temperature  温度参数（>0）
 * @returns {Promise<{status, data, source}>}
 */
export async function getAttention({ text, layer = 0, head = 0, temperature = 1.0 }) {
  // 1. 后端在线
  try {
    const online = await probeBackend()
    if (online) {
      const res = await fetch(`${API_BASE}/attention`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, layer, head, temperature }),
      })
      if (res.ok) {
        const json = await res.json()
        return {
          status: json.status || 'ok',
          data: json.data,
          source: json.source || 'live',
          message: json.message,
        }
      }
    }
  } catch (e) {
    // 降级到下一级
    console.warn('[attentionService] backend unavailable, falling back.', e)
  }

  // 2. 预计算权重（从 public 静态目录加载）
  try {
    const res = await fetch(`/precomputed/${encodeURIComponent(text)}.json`)
    if (res.ok) {
      const json = await res.json()
      return { status: 'ok', data: json, source: 'precomputed' }
    }
  } catch (e) {
    // 降级到示例
  }

  // 3. 示例权重（标注为示意）
  return {
    status: 'degraded',
    data: {
      tokens: SAMPLE_TOKENS,
      weights: SAMPLE_WEIGHTS,
      shape: [1, 5, 5],
    },
    source: 'sample',
  }
}

/**
 * 获取后端健康状态（供 UI 显示当前数据来源标记）
 */
export async function getBackendStatus() {
  const online = await probeBackend()
  return { online }
}
