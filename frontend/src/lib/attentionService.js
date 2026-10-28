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

// 后端可用性探测（带超时）
async function probeBackend(timeoutMs = 800) {
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
      return {
        status: 'ok',
        data: { ...json, weights: scaleTemperature(json.weights, temperature), temperature },
        source: 'precomputed',
      }
    }
  } catch (e) {
    // 降级到示例
  }

  // 3. 本地模拟权重：随文本、层、头和温度动态变化，保证离线教学交互有效。
  const simulated = createSimulatedAttention({ text, layer, head, temperature })
  return {
    status: 'degraded',
    data: simulated,
    source: 'simulated',
  }
}

/**
 * 获取后端健康状态（供 UI 显示当前数据来源标记）
 */
export async function getBackendStatus() {
  const online = await probeBackend()
  return { online }
}

function scaleTemperature(weights, temperature) {
  if (!Array.isArray(weights) || temperature === 1) return weights
  return weights.map((row) => {
    const powered = row.map((value) => Math.pow(Math.max(value, 1e-12), 1 / temperature))
    const sum = powered.reduce((total, value) => total + value, 0)
    return powered.map((value) => value / sum)
  })
}

function createSimulatedAttention({ text, layer, head, temperature }) {
  const tokens = tokenizeForPreview(text)
  const depth = layer / 11
  const rawWeights = tokens.map((source, sourceIndex) => {
    const scores = tokens.map((target, targetIndex) => {
      const distance = Math.abs(sourceIndex - targetIndex)
      const locality = Math.exp(-distance / (1.1 + depth * 3.2)) * (1.2 - depth * 0.45)
      const selfFocus = sourceIndex === targetIndex ? 0.8 - depth * 0.35 : 0
      const direction = ((head % 4) - 1.5) * (targetIndex - sourceIndex) * 0.045
      const semanticEcho = source === target && sourceIndex !== targetIndex ? 0.65 + depth : 0
      const seededVariation = pseudoRandom(`${text}|${layer}|${head}|${sourceIndex}|${targetIndex}`) * (0.55 + depth * 0.55)
      return Math.max(0.01, locality + selfFocus + semanticEcho + direction + seededVariation)
    })
    return softmax(scores)
  })
  const weights = scaleTemperature(rawWeights, temperature)
  return { tokens, weights, shape: [1, tokens.length, tokens.length], layer, head, temperature }
}

function tokenizeForPreview(text) {
  const matches = String(text || '').trim().match(/[\p{Script=Han}]|[A-Za-z0-9]+|[^\s]/gu) || []
  const tokens = matches.slice(0, 14)
  return tokens.length ? tokens : ['请', '输', '入', '文', '本']
}

function softmax(scores) {
  const max = Math.max(...scores)
  const exponents = scores.map((score) => Math.exp(score - max))
  const sum = exponents.reduce((total, value) => total + value, 0)
  return exponents.map((value) => value / sum)
}

function pseudoRandom(seed) {
  let hash = 2166136261
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return ((hash >>> 0) % 10000) / 10000
}
