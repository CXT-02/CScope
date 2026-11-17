/**
 * CScope AI 计算机私教服务引擎 (aiTutorService.js)
 * 
 * 核心能力：
 * 1. 真实大模型 API 对接（DeepSeek 官方、硅基流动 SiliconFlow、本地 Ollama、OpenAI、Kimi 等标准 OpenAI 兼容接口）
 * 2. 真实流式输出（SSE Streaming），原生解析 DeepSeek-R1 深度思考推理链 (reasoning_content)
 * 3. 完整会话持久化归档系统（多会话管理、自动存盘、重命名、Markdown 笔记一键导出）
 * 4. 408 核心考点与 25 门底层微观仿真实验智能对齐联动
 * 5. 零配置离线兜底知识库，保障无网络/无 Key 状态下的可用性
 */

import { experiments } from './experimentRegistry'

export const STORAGE_KEYS = {
  SESSIONS: 'cscope_ai_tutor_sessions_v2',
  ACTIVE_SESSION: 'cscope_ai_tutor_active_session_v2',
  CONFIG: 'cscope_ai_tutor_config_v2'
}

// 预设主流大模型服务商
export const LLM_PROVIDERS = [
  {
    id: 'deepseek',
    name: 'DeepSeek 官方 API (推荐)',
    baseUrl: 'https://api.deepseek.com',
    defaultModel: 'deepseek-reasoner',
    availableModels: [
      { id: 'deepseek-reasoner', name: 'DeepSeek-R1 (深度思考推理链)' },
      { id: 'deepseek-chat', name: 'DeepSeek-V3 (极速通用对话)' }
    ],
    needKey: true,
    keyPlaceholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    helpUrl: 'https://platform.deepseek.com/'
  },
  {
    id: 'siliconflow',
    name: '硅基流动 SiliconFlow (含免费额度)',
    baseUrl: 'https://api.siliconflow.cn/v1',
    defaultModel: 'deepseek-ai/DeepSeek-R1',
    availableModels: [
      { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek-R1 (硅基满血版)' },
      { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek-V3 (极速问答)' },
      { id: 'Qwen/Qwen2.5-72B-Instruct', name: '通义千问 Qwen2.5-72B' },
      { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama-3.3-70B' }
    ],
    needKey: true,
    keyPlaceholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxx',
    helpUrl: 'https://cloud.siliconflow.cn/'
  },
  {
    id: 'ollama',
    name: 'Ollama 本地大模型 (无需 Key / 零网络离线)',
    baseUrl: 'http://localhost:11434/v1',
    defaultModel: 'deepseek-r1:latest',
    availableModels: [
      { id: 'deepseek-r1:latest', name: 'deepseek-r1 (本地已拉取)' },
      { id: 'qwen2.5:latest', name: 'qwen2.5 (本地已拉取)' },
      { id: 'llama3:latest', name: 'llama3 (本地已拉取)' }
    ],
    needKey: false,
    keyPlaceholder: '本地部署无需密钥 (留空即可)',
    helpUrl: 'https://ollama.com/'
  },
  {
    id: 'moonshot',
    name: 'Kimi / 月之暗面 Moonshot',
    baseUrl: 'https://api.moonshot.cn/v1',
    defaultModel: 'moonshot-v1-8k',
    availableModels: [
      { id: 'moonshot-v1-8k', name: 'Moonshot-v1-8k' },
      { id: 'moonshot-v1-32k', name: 'Moonshot-v1-32k' }
    ],
    needKey: true,
    keyPlaceholder: 'sk-xxxxxxxxxxxxxxxxxxxx',
    helpUrl: 'https://platform.moonshot.cn/'
  },
  {
    id: 'openai',
    name: 'OpenAI 官方兼容',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    availableModels: [
      { id: 'gpt-4o-mini', name: 'GPT-4o-mini (轻快)' },
      { id: 'gpt-4o', name: 'GPT-4o (全能旗舰)' }
    ],
    needKey: true,
    keyPlaceholder: 'sk-proj-xxxxxxxxxxxxxxxxxxxx',
    helpUrl: 'https://platform.openai.com/'
  },
  {
    id: 'custom',
    name: '自定义 OpenAI 格式接口',
    baseUrl: 'https://your-api-endpoint.com/v1',
    defaultModel: 'custom-model',
    availableModels: [],
    needKey: true,
    keyPlaceholder: '输入对应接口 API Key',
    helpUrl: ''
  }
]

// 408 计算机考研全能私教 System Prompt
export const CSCOPE_SYSTEM_PROMPT = `你是由 CScope 计算机微观计算架构总控台打造的【408 统考全能私教 AI Agent】。
你的使命是帮助计算机考研与核心课程学者突破抽象枯燥的教科书文字，从晶体管时序、微架构流水线、协议栈到数学模型进行深层剖析。

【你的专业领域】：
1. 计算机组成原理：CPU 5级流水线与冒险、Cache 直接/组相联映射及颠簸、指令执行周期 PC/MAR/MDR/IR 时钟微操作、浮点规格化与 IEEE 754、总线突发传输与中断响应；
2. 操作系统：五状态进程模型、PCB、PV 操作与同步互斥、死锁四条件与银行家算法、分页分段、TLB+Page+Cache 联合访问时序、页面置换算法（LRU/OPT/FIFO）；
3. 计算机网络：TCP 三次握手/四次挥手状态机与 2MSL TIME_WAIT、滑动窗口与拥塞控制（慢启动/拥塞避免/快重传）、CIDR 与子网划分、DNS 递归与迭代解析；
4. 数据结构与算法：二叉树先中后序及线索化、Dijkstra/Floyd/Prim/Kruskal 复杂度与松弛推导、经典排序比对与稳定性、栈与队列应用。

【回答格式与规范】：
1. 【底层机理深度剖析】：直击时序、因果律、状态流转或数学本质，使用清晰的 Markdown 结构；
2. 【408 统考命题避坑要点】：指出考研选择题或大题中高频丢分陷阱；
3. 【微观仿真实验验证建议】：指导学生结合 CScope 平台的微观仿真沙盒（如 CPU 流水线、Cache 映射、死锁算法、TCP 状态机等）单步打拍观察验证。
语气要求：客观、严谨、循序渐进、充满启发性，公式使用标准 LaTeX 格式（如 $T = H \\times T_c + (1-H) \\times T_m$）。`

// 获取本地存储的大模型配置
export function getLlmConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (e) {
    console.error('Failed to load LLM config:', e)
  }
  return {
    provider: 'deepseek',
    baseUrl: 'https://api.deepseek.com',
    apiKey: '',
    model: 'deepseek-reasoner',
    temperature: 0.6,
    maxTokens: 2048,
    systemPrompt: CSCOPE_SYSTEM_PROMPT
  }
}

// 保存大模型配置
export function saveLlmConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config))
  } catch (e) {
    console.error('Failed to save LLM config:', e)
  }
}

// 测试模型连通性
export async function testLlmConnection(config) {
  const { baseUrl, apiKey, model } = config
  if (!baseUrl) throw new Error('API 基础地址不能为空')

  const url = `${baseUrl.replace(/\/+$/, '')}/chat/completions`
  const headers = {
    'Content-Type': 'application/json'
  }
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey.trim()}`
  }

  const startTime = Date.now()
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: model || 'deepseek-chat',
      messages: [
        { role: 'user', content: 'Ping: 408 计算机考研测试，请回复 OK 即可。' }
      ],
      max_tokens: 15,
      temperature: 0.1
    })
  })

  const elapsed = Date.now() - startTime
  if (!res.ok) {
    let errText = ''
    try {
      const errJson = await res.json()
      errText = errJson.error?.message || JSON.stringify(errJson)
    } catch {
      errText = await res.text()
    }
    throw new Error(`连接失败 [HTTP ${res.status}]: ${errText}`)
  }

  const data = await res.json()
  const reply = data.choices?.[0]?.message?.content || 'OK'
  return { success: true, reply, elapsed }
}

// 智能匹配对应的微观仿真实验
export function detectRecommendedExperiment(question = '', content = '') {
  const text = (question + ' ' + content).toLowerCase()
  for (const exp of experiments) {
    // 匹配实验 id
    if (text.includes(exp.id.toLowerCase())) {
      return { id: exp.id, name: exp.title }
    }
    // 匹配实验标题
    if (text.includes(exp.title.toLowerCase())) {
      return { id: exp.id, name: exp.title }
    }
    // 匹配实验关键 concepts
    if (exp.concepts && exp.concepts.some((c) => text.includes(c.toLowerCase()))) {
      return { id: exp.id, name: exp.title }
    }
  }

  // 常见考点关键词硬匹配
  if (text.includes('流水线') || text.includes('load-use') || text.includes('冒险') || text.includes('forwarding')) {
    return { id: 'cpu-pipeline', name: 'CPU 五级流水线与冒险处理' }
  }
  if (text.includes('cache') || text.includes('颠簸') || text.includes('相联') || text.includes('命中率')) {
    return { id: 'cache-mapping', name: 'Cache 组相联映射与命中实验' }
  }
  if (text.includes('死锁') || text.includes('银行家') || text.includes('安全序列') || text.includes('资源分配图')) {
    return { id: 'deadlock', name: '死锁预防、避免（银行家算法）与解除' }
  }
  if (text.includes('tcp') || text.includes('握手') || text.includes('挥手') || text.includes('2msl') || text.includes('time_wait')) {
    return { id: 'tcp-connection', name: 'TCP 三次握手与四次挥手状态机' }
  }
  if (text.includes('滑动窗口') || text.includes('拥塞') || text.includes('慢启动') || text.includes('快重传')) {
    return { id: 'sliding-window', name: '滑动窗口与拥塞控制' }
  }
  if (text.includes('子网') || text.includes('cidr') || text.includes('ip地址') || text.includes('广播地址')) {
    return { id: 'ip-subnet', name: 'IP 地址与子网划分' }
  }
  if (text.includes('页面置换') || text.includes('lru') || text.includes('fifo') || text.includes('缺页')) {
    return { id: 'page-replacement', name: '页面置换算法（LRU/OPT/FIFO）' }
  }
  if (text.includes('dijkstra') || text.includes('最短路径') || text.includes('松弛')) {
    return { id: 'dijkstra', name: 'Dijkstra 单源最短路径算法' }
  }
  if (text.includes('二叉树') || text.includes('遍历') || text.includes('前序') || text.includes('后序')) {
    return { id: 'tree-traversal', name: '二叉树遍历与递归时序' }
  }
  if (text.includes('快速排序') || text.includes('冒泡') || text.includes('归并') || text.includes('堆排序')) {
    return { id: 'sorting', name: '快速/归并/堆排序对比实验' }
  }
  if (text.includes('指令周期') || text.includes('pc') || text.includes('mar') || text.includes('mdr') || text.includes('取指')) {
    return { id: 'instruction-cycle', name: '指令执行微操作周期' }
  }
  return null
}

// 离线知识库高阶解答生成器（当未填入 Key 或完全离线时自动接管，保障核心考点完整体验）
export function generateLocalFallbackResponse(question) {
  const q = question.toLowerCase()
  let thought = '已检索 408 统考离线核心知识库，正在提取底层物理时序与状态机模型...'
  let content = ''

  if (q.includes('load-use') || q.includes('流水线') || q.includes('冒险')) {
    thought = '分析 CPU 5 级时钟节拍：IF, ID, EX, MEM, WB。识别 RAW 读后写依赖。Load 指令的数据直到 MEM 阶段结束后才由主存/Cache 读出，后继指令在 EX 阶段就需要该数据。因果律导致无法通过前递消除，必须硬件阻塞 1 拍。'
    content = `### 深度剖析：Load-Use 数据冒险的物理与时序限制

#### 1. 为什么旁路转发（Forwarding）在此处失效？
- **普通 ALU 指令**（如 \`ADD R1, R2, R3\`）：计算结果在 **EX 阶段末尾** 就已经产生，可通过数据旁路直接引脚拉到后一条指令的 EX 阶段输入端，实现 **0 周期停顿**。
- **Load 指令**（如 \`LW R1, 0(R2)\`）：其目标数据必须从数据存储器/Cache 读取，数据只有在 **MEM 阶段结束**（第 4 拍末）时才准备就绪！
- **后一条 Use 指令**：如果在紧随其后执行，它在 **EX 阶段（第 3 拍）** 就必须拿到操作数进行运算；然而 Load 指令的数据要到第 4 拍末才能产出。
- **时序因果律**：数据不能在产生之前被消费。因此，即使硬件设计了最完善的旁路转发总线，也必须硬件阻塞（Stall）后继指令 **1 个时钟周期**！

#### 2. 硬件控制与编译器优化
1. **硬件冒险检测单元（Hazard Detection Unit）**：在 ID 阶段检测到 Load-Use 冒险时，将 PC 和 IF/ID 寄存器保持不变，并将 ID/EX 控制信号清零，插入一个空操作（Bubble）。
2. **编译器指令重排（Instruction Scheduling）**：优秀编译器会在 Load 与 Use 指令之间填入一条无关的独立指令，从而完全消除这 1 个周期的空泡浪费！`
  } else if (q.includes('cache') || q.includes('颠簸') || q.includes('直接映射')) {
    thought = '分析 Cache 直接映射地址映射函数：行号 = 块号 mod Cache行数。当两个频繁访问的块拥有相同行号时，发生冲突颠簸（Thrashing）。相联度增加可显著降低冲突缺失。'
    content = `### 深度剖析：Cache 直接映射的命中颠簸现象

#### 1. 颠簸的本质原因
在直接映射（Direct Mapped Cache）中，每个主存块只能放入 Cache 中**唯一固定**的一行（Row）。
- 若程序存在交替访问两块内存的循环：
  \`\`\`c
  for (int i = 0; i < N; i++) {
      A[i] = B[i] + 1; // 假定 A 和 B 刚好映射到 Cache 的同一行
  }
  \`\`\`
- 步骤 1：读取 \`B[i]\`，Cache 缺失，调入该行；
- 步骤 2：写入 \`A[i]\`，发生冲突缺失，将 \`B[i]\` 踢出替换为 \`A[i]\`；
- 步骤 3：下一轮读取 \`B[i+1]\`，再次冲突缺失，又将 \`A[i]\` 踢出！
- **结果**：Cache 命中率跌至 **0%**！CPU 大量时钟周期全部浪费在等待主存颠簸中。

#### 2. 解决方案：组相联映射（Set-Associative）
通过将 Cache 划分为组（如 2 路、4 路组相联），同一组内允许存放多个块。只要冲突的块数不超过相联度（Way），就不会发生颠簸替换！`
  } else if (q.includes('tcp') || q.includes('握手') || q.includes('两次')) {
    thought = '剖析全双工传输信道建立逻辑、旧 SYN 重复报文（RFC 793 核心考虑）及序列号同步机理。'
    content = `### 深度剖析：为什么 TCP 必须三次握手？

#### 1. 核心原因一：防止历史失效的连接请求突然到达服务端
- 假设只有**两次握手**：客户端发送了连接请求报文段 $A$。由于网络节点拥塞，$A$ 在某些网络节点长时间滞留，未在预期超时时间内到达服务端。
- 客户端超时后重新发送了连接请求 $B$，顺利完成连接并传输数据完毕后释放。
- 此时滞留的报文段 $A$ 终于到达服务端，服务端以为客户端又发起了新的连接，发送 ACK 确认并立即单方面建立连接。
- 但客户端早已视 $A$ 为失效请求，直接忽略；服务端却一直苦苦等待客户端发送数据，导致服务端**大量套接字与内存资源泄露瘫痪**！
- **三次握手的妙处**：服务端收到旧 $A$ 后回复 SYN+ACK，客户端根据序列号发现是历史过时请求，立即发送 RST 报文终止该错误连接。

#### 2. 核心原因二：双方初始序号（ISN）的可靠同步
TCP 是全双工双向传输协议，两端都必须发送自己的随机初始序号，并明确收到对方对自己序号的确认（ACK）。前两次只能确认一端的发送能力，第三次握手才完成了对服务端发送能力与初始序号的完整确认。`
  } else if (q.includes('死锁') || q.includes('环路') || q.includes('银行家')) {
    thought = '剖析资源分配图 RAG、死锁四必要条件、环路充分必要性判定、银行家算法安全性检查向量推导。'
    content = `### 深度剖析：死锁与环路的数学逻辑

#### 1. “有环”是死锁的充要条件还是必要条件？
- **当每类资源只有 1 个实例（Single Instance）时**：“有环路”是死锁的 **充分必要条件**！有环必死锁，死锁必有环。
- **当每类资源有多个实例（Multiple Instances）时**：“有环路”仅仅是死锁的 **必要条件，而非充分条件**！
  - 示例：进程 $P_1, P_2, P_3$ 形成等待环路，但只要环路外的进程 $P_4$ 执行完毕释放其占有的同类资源，环路中的某个进程就能拿到资源顺利运行，从而打破循环等待。

#### 2. 银行家算法（Banker's Algorithm）安全性矩阵核心
系统在分配资源前，进行预演：
1. 假定将资源分配给某进程；
2. 寻找是否存在一个进程满足：\`Need[i] <= Available\`；
3. 若存在，假设其执行完毕并释放全部已有资源：\`Available += Allocation[i]\`；
4. 递归检查是否所有进程均能完成。若能找到至少一条这样的排列，即为 **安全序列（Safe Sequence）**，系统处于安全状态，绝无死锁危险！`
  } else {
    thought = `解析提问：“${question}”，正在检索 408 统考知识图谱与计算题命题规则...`
    content = `### 针对【${question}】的底层架构深度剖析

在 408 统考与计算机核心体系中，此类问题通常贯穿**硬件物理约束**与**系统软件调度**的双重视角：

1. **底层物理/时序模型**：
   - 关注该机制的时钟周期开销（Cycle Count）、内存访问惩罚（Miss Penalty）或网络往返时延（RTT）。
   - 例如在微架构中关注时钟边沿触发（Clock Edge）、在操作系统中关注上下文切换的寄存器保护开销。

2. **核心真题命题避坑要点**：
   - 统考大题往往在**边界条件**设陷阱（如空链表、满队列、Cache 地址对齐、TCP 序号回绕、虚存缺页合并 Cache 访问）。
   - 计算时务必注意区分**字节（Byte）**与**位（Bit）**、$2^{10}=1024$ 与 $10^3=1000$ 的应用场景。

3. **建议行动**：
   - 您可以直接在上方点击「⚙️ 模型配置」接入 DeepSeek-R1 等大模型，获取无限制、针对性更强的多轮追问解答！`
  }

  return {
    thought,
    content,
    labJump: detectRecommendedExperiment(question, content)
  }
}

// 核心流式大模型调用函数 (支持 DeepSeek-R1 深度思考推理链 + 打字机流式回传)
export async function streamChatWithLlm({
  messages,
  config,
  signal,
  onThoughtChunk,
  onContentChunk
}) {
  const { baseUrl, apiKey, model, temperature, systemPrompt } = config

  // 如果未配置 API Key 且不是本地免 Key 的 Ollama，则转为高质量本地知识库应答
  const isOllama = config.provider === 'ollama' || (baseUrl && baseUrl.includes('localhost:11434'))
  if (!apiKey && !isOllama) {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || ''
    const fallback = generateLocalFallbackResponse(lastUserMsg)

    // 模拟流式打字机效果让体验极佳
    if (fallback.thought && onThoughtChunk) {
      for (const ch of fallback.thought) {
        if (signal?.aborted) return
        onThoughtChunk(ch)
        await new Promise((r) => setTimeout(r, 8))
      }
    }
    if (fallback.content && onContentChunk) {
      for (let i = 0; i < fallback.content.length; i += 3) {
        if (signal?.aborted) return
        onContentChunk(fallback.content.slice(i, i + 3))
        await new Promise((r) => setTimeout(r, 12))
      }
    }
    return {
      content: fallback.content,
      thought: fallback.thought,
      labJump: fallback.labJump,
      isLocalFallback: true
    }
  }

  // 构建标准 OpenAI 格式 Payload
  const url = `${baseUrl.replace(/\/+$/, '')}/chat/completions`
  const headers = {
    'Content-Type': 'application/json'
  }
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey.trim()}`
  }

  const formattedMessages = [
    { role: 'system', content: systemPrompt || CSCOPE_SYSTEM_PROMPT },
    ...messages.map((m) => ({
      role: m.role || (m.sender === 'ai' ? 'assistant' : 'user'),
      content: m.content
    }))
  ]

  const response = await fetch(url, {
    method: 'POST',
    headers,
    signal,
    body: JSON.stringify({
      model: model || 'deepseek-reasoner',
      messages: formattedMessages,
      temperature: temperature ?? 0.6,
      stream: true
    })
  })

  if (!response.ok) {
    let errMessage = ''
    try {
      const errJson = await response.json()
      errMessage = errJson.error?.message || JSON.stringify(errJson)
    } catch {
      errMessage = await response.text()
    }
    throw new Error(`[大模型服务响应错误 ${response.status}]: ${errMessage}`)
  }

  let fullThought = ''
  let fullContent = ''

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  while (true) {
    if (signal?.aborted) {
      reader.cancel()
      break
    }

    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith(':')) continue
      if (trimmed === 'data: [DONE]') continue

      if (trimmed.startsWith('data: ')) {
        const jsonStr = trimmed.slice(6)
        try {
          const parsed = JSON.parse(jsonStr)
          const delta = parsed.choices?.[0]?.delta
          if (!delta) continue

          // DeepSeek-R1 深度思考推理链 (reasoning_content)
          if (delta.reasoning_content) {
            fullThought += delta.reasoning_content
            if (onThoughtChunk) {
              onThoughtChunk(delta.reasoning_content)
            }
          }

          // 正文回答流式内容 (content)
          if (delta.content) {
            fullContent += delta.content
            if (onContentChunk) {
              onContentChunk(delta.content)
            }
          }
        } catch {
          // 忽略不完整的 JSON 分片
        }
      }
    }
  }

  const lastUserQuery = [...messages].reverse().find((m) => m.role === 'user')?.content || ''
  const labJump = detectRecommendedExperiment(lastUserQuery, fullContent)

  return {
    thought: fullThought,
    content: fullContent,
    labJump,
    isLocalFallback: false
  }
}

// ====== 会话存档管理 (Chat History Session Manager) ======

export function loadChatSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS)
    if (raw) {
      const list = JSON.parse(raw)
      if (Array.isArray(list) && list.length > 0) {
        return list
      }
    }
  } catch (e) {
    console.error('Failed to load chat sessions:', e)
  }

  // 默认初始会话
  const defaultSession = createInitialSession()
  saveChatSessions([defaultSession])
  return [defaultSession]
}

export function saveChatSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions))
  } catch (e) {
    console.error('Failed to save chat sessions:', e)
  }
}

export function createInitialSession() {
  return {
    id: `sess_${Date.now()}`,
    title: '408 计算机考研全能私教伴学',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [
      {
        id: 'init_welcome',
        sender: 'ai',
        time: '刚刚',
        timestamp: Date.now(),
        modelTag: 'DeepSeek-R1 (深度思考)',
        thought: '已挂载 408 计算机考研全套大纲、统考真题拓扑及 25 门底层微观仿真机床知识图谱。',
        content: `同学你好！我是你的 **CScope 计算机全能私教 AI Agent**。
我已原生接入历年 408 统考真题库与底层 25 门可交互微观时序仿真沙盘：
- **微架构硬件时序**（流水线 RAW 冒险/前递、Cache 命中率/组相联/颠簸、浮点规格化）
- **操作系统并发与虚存**（银行家算法安全序列、TLB+Page+Cache 联合访问时序）
- **网络协议状态机**（三次握手四次挥手、滑动窗口拥塞控制、CIDR 子网划分）
- **算法与数据结构**（红黑树旋转、Dijkstra/Floyd 复杂度、KMP next 数组）

你可以直接向我提问！我会为你拆解推导过程，并给出对应微观实验的直达验证建议。点击右上角「⚙️ 接入大模型」可随时切换 DeepSeek / 硅基流动 / 本地 Ollama！`,
        labJump: null
      }
    ]
  }
}

// 导出当前会话为 Markdown 研学笔记
export function exportSessionAsMarkdown(session) {
  if (!session || !session.messages) return
  let md = `# CScope AI 私教研学笔记档案\n`
  md += `> 会话标题：${session.title}\n`
  md += `> 归档时间：${new Date(session.updatedAt || session.createdAt).toLocaleString()}\n`
  md += `> 消息总数：${session.messages.length} 条\n\n---\n\n`

  for (const msg of session.messages) {
    const roleName = msg.sender === 'user' ? '👤 提问者' : '🤖 CScope 私教导师'
    md += `### ${roleName} [${msg.time || ''}]\n\n`
    if (msg.thought) {
      md += `> **[DEEPSEEK REASONING 深度思维链]**\n`
      md += `> ${msg.thought.replace(/\n/g, '\n> ')}\n\n`
    }
    md += `${msg.content}\n\n`
    if (msg.labJump) {
      md += `*🔗 推荐微观实验联动：${msg.labJump.name} (ID: ${msg.labJump.id})*\n\n`
    }
    md += `---\n\n`
  }

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `CScope_408_AI私教笔记_${session.title.replace(/[^\w\u4e00-\u9fa5]/g, '_')}_${Date.now()}.md`
  a.click()
  URL.revokeObjectURL(a)
}
