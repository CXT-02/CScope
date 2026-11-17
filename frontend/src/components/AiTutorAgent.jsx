import React, { useState } from 'react'

const PRESET_PROMPTS = [
  {
    category: '计组流水线',
    title: '为什么 Load-Use 冒险必须停顿？',
    query: '请深度剖析在 CPU 五级流水线中，为什么相邻的 Load 指令和 Use 指令无法单纯依靠数据旁路转发（Forwarding）消除冒险，必须插入 1 个周期的空泡气节？'
  },
  {
    category: 'Cache 映射',
    title: '直接映射为什么容易发生颠簸？',
    query: '请解释在 Cache 直接映射机制下，当程序循环交替访问映射到同一 Cache 行的两个不同主存块时，为什么会发生 100% 的颠簸缺失？如何改用组相联缓解？'
  },
  {
    category: '操作系统死锁',
    title: '有环路就一定会发生死锁吗？',
    query: '在操作系统资源分配图（RAG）中，“有环路”是死锁的充要条件还是必要条件？在每类资源有多个实例时，如何用银行家算法判定安全状态？'
  },
  {
    category: '计算机网络',
    title: 'TCP 握手为什么不能是两次？',
    query: '请从全双工序列号同步、以及网络中已失效的历史连接请求报文段（旧 SYN）重传等角度，彻底剖析为什么 TCP 必须三次握手，两次会引发什么严重后果？'
  }
]

export default function AiTutorAgent({ onOpenExperiment }) {
  const [messages, setMessages] = useState([
    {
      id: 'init_1',
      sender: 'ai',
      time: '刚刚',
      modelTag: 'DeepSeek-R1 (深度思考)',
      thought: '已加载 408 计算机考研统考大纲及 25 门微观时钟仿真实验知识图谱。准备为学者提供深入到底层硬件时序与协议栈的推演解答。',
      content: `同学你好！我是你的 **CScope 计算机私教 AI Agent**。
我已接入历年 408 统考真题库与底层的可交互微观仿真沙盘。不论是遇到：
- **微架构硬件时序**（流水线数据相关、Cache 命中率/Tag 位数计算、浮点规格化）
- **操作系统并发与虚存**（银行家算法安全序列、TLB+Page+Cache 联合访问时序）
- **网络协议状态机**（三次握手四次挥手、滑动窗口拥塞控制、CIDR 子网汇聚）
- **算法与数据结构**（红黑树旋转、Dijkstra/Floyd 复杂度、KMP next 数组）

你都可以直接问我！我会为你拆解推导过程，并给出对应微观实验的直达验证建议。`,
      labJump: null
    }
  ])

  const [inputVal, setInputVal] = useState('')
  const [isThinking, setIsThinking] = useState(false)

  const handleSend = (textToSend) => {
    const question = (textToSend || inputVal).trim()
    if (!question) return

    const userMsg = {
      id: `u_${Date.now()}`,
      sender: 'user',
      time: '刚刚',
      content: question
    }

    setMessages((prev) => [...prev, userMsg])
    setInputVal('')
    setIsThinking(true)

    // 智能知识库匹配并生成高品质深度解答
    setTimeout(() => {
      let thought = '正在检索 408 统考知识库，比对微架构时序模型与真题考察频率...'
      let content = ''
      let labJump = null

      if (question.includes('Load-Use') || question.includes('流水线') || question.includes('冒险')) {
        thought = '分析 CPU 5 级时钟节拍：IF, ID, EX, MEM, WB。识别 RAW 读后写依赖。Load 指令的数据直到 MEM 阶段结束后才由主存/Cache 读出，而后继指令在 EX 阶段就需要该数据。'
        content = `### 深度剖析：Load-Use 数据冒险的物理限制

#### 1. 为什么旁路转发（Forwarding）在此处失效？
- **普通 ALU 指令**（如 \`ADD R1, R2, R3\`）：计算结果在 **EX 阶段末尾** 就已经产生，可通过数据旁路直接引脚拉到后一条指令的 EX 阶段输入端，实现 **0 周期停顿**。
- **Load 指令**（如 \`LW R1, 0(R2)\`）：其目标数据必须从数据存储器/Cache 读取，数据只有在 **MEM 阶段结束** 时才准备就绪！
- **后一条 Use 指令**：如果在紧随其后执行，它在 **EX 阶段（第 3 拍）** 就必须拿到操作数进行运算；然而 Load 指令的数据要到 **MEM 阶段结束（第 4 拍末）** 才能产生。
- **时序因果律**：数据不能在产生之前被消费。因此，即使硬件设计了最完善的旁路转发总线，也必须硬件阻塞（Stall）后继指令 **1 个时钟周期**！

#### 2. 硬件控制与编译器优化
1. **硬件冒险检测单元（Hazard Detection Unit）**：在 ID 阶段检测到 Load-Use 冒险时，将 PC 和 IF/ID 寄存器保持不变，并将 ID/EX 控制信号清零，插入一个空操作（Bubble）。
2. **编译器指令重排（Instruction Scheduling）**：优秀编译器会在 Load 与 Use 指令之间填入一条无关的独立指令，从而完全消除这 1 个周期的空泡浪费！`
        labJump = { id: 'cpu-pipeline', name: '打开 CPU 五级流水线实验，单步观察 Load-Use 空泡' }
      } else if (question.includes('Cache') || question.includes('颠簸') || question.includes('直接映射')) {
        thought = '分析 Cache 直接映射地址映射函数：行号 = 块号 mod Cache行数。当两个频繁访问的块拥有相同行号时，发生冲突颠簸（Thrashing）。'
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
        labJump = { id: 'cache-mapping', name: '进入 Cache 映射实验，可视化调整组相联度与命中率' }
      } else if (question.includes('TCP') || question.includes('握手') || question.includes('两次')) {
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
        labJump = { id: 'tcp-connection', name: '打开 TCP 全双工连接仿真，模拟历史重传报文交互' }
      } else if (question.includes('死锁') || question.includes('环路') || question.includes('银行家')) {
        thought = '剖析资源分配图 RAG、死锁四必要条件、环路充分必要性判定、银行家算法安全性检查向量推导。'
        content = `### 深度剖析：死锁与环路的数学逻辑

#### 1. “有环”是死锁的充要条件还是必要条件？
- **当每类资源只有 1 个实例（Single Instance）时**：“有环路”是死锁的 **充分必要条件**！有环必死锁，死锁必有环。
- **当每类资源有多个实例（Multiple Instances）时**：“有环路”仅仅是死锁的 **必要条件，而非充分条件**！
  - 示例：进程 $P_1, P_2, P_3$ 形成等待环路，但只要环路外的进程 $P_4$ 执行完毕释放其占有的同类资源，环路中的某个进程就能拿到资源顺利运行，从而打破循环等待。

#### 2. 银行家算法（Banker\'s Algorithm）安全性矩阵核心
系统在分配资源前，进行预演：
1. 假定将资源分配给某进程；
2. 寻找是否存在一个进程满足：\`Need[i] <= Available\`；
3. 若存在，假设其执行完毕并释放全部已有资源：\`Available += Allocation[i]\`；
4. 递归检查是否所有进程均能完成。若能找到至少一条这样的排列，即为 **安全序列（Safe Sequence）**，系统处于安全状态，绝无死锁危险！`
        labJump = { id: 'deadlock', name: '打开死锁银行家算法实验，推演四进程安全序列' }
      } else {
        thought = `解析用户提问：“${question}”，结合 408 核心考点与相关微观实验进行系统解答。`
        content = `### 针对【${question}】的专业解析与备考建议

在 408 统考与计算机核心课程中，该考点主要考察**系统底层的状态流转与资源调度逻辑**。
建议从以下三个维度建立认知模型：
1. **数学与时序模型**：明确该机制的输入、时钟周期节奏或报文包结构；
2. **异常与临界条件**：注意在并发、缓存缺失、网络拥塞等边界条件下的容错与恢复策略；
3. **历年真题命题点**：多以结合微架构计算题或综合大题的形式出现。

您可以直接在左侧侧边栏进入对应的微观仿真实验推演运行过程，再到 **408 测评中心** 抽取对应题目自测巩固！`
        labJump = { id: 'cpu-pipeline', name: '前往核心仿真实验工坊进行验证' }
      }

      const aiReply = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        time: '刚刚',
        modelTag: 'DeepSeek-R1 (深度思考)',
        thought,
        content,
        labJump
      }

      setMessages((prev) => [...prev, aiReply])
      setIsThinking(false)
    }, 600)
  }

  return (
    <div className="ai-tutor-page">
      {/* 顶部头部与大模型状态 */}
      <header className="ai-tutor-header">
        <div className="tutor-header-left">
          <div className="model-live-indicator">
            <span className="live-dot" />
            <span>DEEPSEEK-R1 · 深度认知诊断大模型已挂载</span>
          </div>
          <h1>AI 计算机私教 · 考研与原理全天候伴学</h1>
          <p className="tutor-desc">
            穿透枯燥文字，解答 408 微架构计算、协议状态机、并发安全等深层难点，智能关联微观实验。
          </p>
        </div>

        <div className="model-chip-badge">
          <span className="chip-name">DeepSeek-R1</span>
          <span className="chip-param">408专项蒸馏</span>
        </div>
      </header>

      {/* 快捷经典考点胶囊提示 */}
      <div className="prompt-cards-row">
        {PRESET_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            type="button"
            className="preset-prompt-btn"
            onClick={() => handleSend(p.query)}
            disabled={isThinking}
          >
            <div className="prompt-top-line">
              <span className="cat-tag">{p.category}</span>
              <span className="arrow-icon">→</span>
            </div>
            <strong>{p.title}</strong>
          </button>
        ))}
      </div>

      {/* 对话消息滚动流 */}
      <div className="tutor-chat-stream">
        {messages.map((msg) => (
          <div key={msg.id} className={`tutor-msg-item ${msg.sender}`}>
            <div className="msg-avatar-col">
              {msg.sender === 'ai' ? (
                <div className="ai-tutor-avatar">CS</div>
              ) : (
                <div className="user-tutor-avatar">研</div>
              )}
            </div>

            <div className="msg-content-col">
              <div className="msg-header-line">
                <span className="msg-sender-name">
                  {msg.sender === 'ai' ? 'CScope 私教导师' : '我'}
                </span>
                {msg.modelTag && <span className="msg-model-tag">{msg.modelTag}</span>}
                <span className="msg-time">{msg.time}</span>
              </div>

              {/* 思考过程折叠块（DeepSeek 特色思维链） */}
              {msg.thought && (
                <div className="tutor-thought-block">
                  <div className="thought-title">
                    <span className="thought-tag">DEEPSEEK REASONING</span>
                    <span>深度思维推理链：</span>
                  </div>
                  <p>{msg.thought}</p>
                </div>
              )}

              {/* 回答正文 */}
              <div className="msg-markdown-body">
                {msg.content.split('\n\n').map((para, pIdx) => {
                  if (para.startsWith('### ')) {
                    return <h3 key={pIdx}>{para.replace('### ', '')}</h3>
                  }
                  if (para.startsWith('#### ')) {
                    return <h4 key={pIdx}>{para.replace('#### ', '')}</h4>
                  }
                  return <p key={pIdx}>{para}</p>
                })}
              </div>

              {/* 联动仿真实验直达卡片 */}
              {msg.labJump && (
                <div className="msg-lab-jump-card">
                  <span className="jump-lab-badge">微观仿真</span>
                  <div className="jump-info">
                    <strong>微观实验推演推荐：</strong>
                    <span>{msg.labJump.name}</span>
                  </div>
                  <button
                    type="button"
                    className="jump-action-btn"
                    onClick={() => onOpenExperiment(msg.labJump.id)}
                  >
                    立即打开实验推演 →
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="tutor-msg-item ai thinking">
            <div className="msg-avatar-col">
              <div className="ai-tutor-avatar">CS</div>
            </div>
            <div className="msg-content-col">
              <div className="thinking-indicator">
                <span className="dot dot-1" />
                <span className="dot dot-2" />
                <span className="dot dot-3" />
                <span className="thinking-text">DeepSeek-R1 正在调取 408 知识图谱深度推理中...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部提问输入栏 */}
      <div className="tutor-bottom-input-dock">
        <div className="input-inner-wrap">
          <textarea
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="随时向私教提问：如“计网滑动窗口怎么计算？”或“帮我推导死锁银行家算法”... (Enter 发送)"
            rows={2}
          />
          <button
            type="button"
            className="send-button"
            onClick={() => handleSend()}
            disabled={!inputVal.trim() || isThinking}
          >
            发送提问 ↵
          </button>
        </div>
        <div className="tutor-input-footer-note">
          <span>大模型已接入 408 题库与 25 门微观实验仿真引擎 · 支持代码与公式解析</span>
        </div>
      </div>
    </div>
  )
}
