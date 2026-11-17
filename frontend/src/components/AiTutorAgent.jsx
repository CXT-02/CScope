import React, { useState, useEffect, useRef } from 'react'
import {
  LLM_PROVIDERS,
  getLlmConfig,
  saveLlmConfig,
  testLlmConnection,
  streamChatWithLlm,
  loadChatSessions,
  saveChatSessions,
  createInitialSession,
  exportSessionAsMarkdown,
  STORAGE_KEYS
} from '../lib/aiTutorService'

const PRESET_PROMPTS = [
  {
    category: '计组流水线',
    title: '为什么 Load-Use 冒险必须停顿？',
    query: '请深度剖析在 CPU 五级流水线中，为什么相邻的 Load 指令和 Use 指令无法单纯依靠数据旁路转发（Forwarding）消除冒险，必须硬件阻塞插入 1 个周期的空泡气泡？'
  },
  {
    category: 'Cache 映射',
    title: '直接映射为什么容易发生颠簸？',
    query: '请解释在 Cache 直接映射机制下，当程序循环交替访问映射到同一 Cache 行的两个不同主存块时，为什么会发生 100% 的颠簸缺失？如何改用组相联缓解？'
  },
  {
    category: '操作系统死锁',
    title: '有环路就一定会发生死锁吗？',
    query: '在操作系统资源分配图（RAG）中，“有环路”是死锁的充要条件还是必要条件？在每类资源有多个实例时，如何用银行家算法判定安全状态与安全序列？'
  },
  {
    category: '计算机网络',
    title: 'TCP 握手为什么不能是两次？',
    query: '请从全双工序列号同步、以及网络中已失效的历史连接请求报文段（旧 SYN）重传等角度，彻底剖析为什么 TCP 必须三次握手，两次会引发什么严重后果？'
  }
]

export default function AiTutorAgent({ onOpenExperiment }) {
  // ====== 会话存档状态管理 ======
  const [sessions, setSessions] = useState(() => loadChatSessions())
  const [activeSessionId, setActiveSessionId] = useState(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION)
      if (savedId) return savedId
    } catch (e) {
      console.error(e)
    }
    const list = loadChatSessions()
    return list[0]?.id || ''
  })
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false)
  const [editingTitleId, setEditingTitleId] = useState(null)
  const [editTitleVal, setEditTitleVal] = useState('')

  // ====== 当前会话与消息流 ======
  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0] || createInitialSession()
  const messages = currentSession.messages || []

  // ====== 大模型配置与弹窗 ======
  const [llmConfig, setLlmConfig] = useState(() => getLlmConfig())
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [configForm, setConfigForm] = useState(llmConfig)
  const [showApiKey, setShowApiKey] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState(null) // { success: boolean, msg: string }

  // ====== 交互与流式生成状态 ======
  const [inputVal, setInputVal] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamingThought, setStreamingThought] = useState('')
  const [streamingContent, setStreamingContent] = useState('')
  const [collapsedThoughts, setCollapsedThoughts] = useState({}) // { [msgId]: boolean }
  const [copySuccessId, setCopySuccessId] = useState(null)

  const abortControllerRef = useRef(null)
  const chatBottomRef = useRef(null)

  // 同步当前激活会话至 localStorage
  useEffect(() => {
    if (activeSessionId) {
      try {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, activeSessionId)
      } catch (e) {
        console.error(e)
      }
    }
  }, [activeSessionId])

  // 当会话变化时自动持久化到 localStorage
  useEffect(() => {
    if (sessions && sessions.length > 0) {
      saveChatSessions(sessions)
    }
  }, [sessions])

  // 消息更新或流式输入时自动轻柔滚动到底部
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, streamingContent, isGenerating])

  // ====== 会话管理操作 ======
  const handleNewSession = () => {
    const newSess = {
      id: `sess_${Date.now()}`,
      title: '新研学对话',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        {
          id: `ai_init_${Date.now()}`,
          sender: 'ai',
          time: '刚刚',
          timestamp: Date.now(),
          modelTag: llmConfig.model.includes('reasoner') || llmConfig.model.includes('R1')
            ? 'DeepSeek-R1 (深度思考)'
            : llmConfig.model,
          thought: '已开启新对话，等待输入考研专业课或底层时序疑难问题。',
          content: '新研学研讨已开启。同学请提出你在 408 备考中遇到的硬件时钟、协议状态机、并发算法或具体真题问题！',
          labJump: null
        }
      ]
    }
    setSessions((prev) => [newSess, ...prev])
    setActiveSessionId(newSess.id)
    setShowHistoryDrawer(false)
  }

  const handleDeleteSession = (sessId, e) => {
    e.stopPropagation()
    if (sessions.length <= 1) {
      // 若仅剩最后一个会话，则清空并重置
      const resetSess = createInitialSession()
      setSessions([resetSess])
      setActiveSessionId(resetSess.id)
      return
    }
    const filtered = sessions.filter((s) => s.id !== sessId)
    setSessions(filtered)
    if (activeSessionId === sessId) {
      setActiveSessionId(filtered[0].id)
    }
  }

  const handleStartRename = (sess, e) => {
    e.stopPropagation()
    setEditingTitleId(sess.id)
    setEditTitleVal(sess.title)
  }

  const handleSaveRename = (sessId) => {
    if (!editTitleVal.trim()) {
      setEditingTitleId(null)
      return
    }
    setSessions((prev) =>
      prev.map((s) => (s.id === sessId ? { ...s, title: editTitleVal.trim() } : s))
    )
    setEditingTitleId(null)
  }

  const handleClearAllSessions = () => {
    if (window.confirm('确定要清空全部历史对话记录吗？此操作不可撤销。')) {
      const fresh = [createInitialSession()]
      setSessions(fresh)
      setActiveSessionId(fresh[0].id)
      saveChatSessions(fresh)
    }
  }

  const handleExportMarkdown = () => {
    exportSessionAsMarkdown(currentSession)
  }

  // ====== 模型配置操作 ======
  const handleOpenConfig = () => {
    setConfigForm(llmConfig)
    setTestResult(null)
    setShowConfigModal(true)
  }

  const handleProviderSelect = (provId) => {
    const prov = LLM_PROVIDERS.find((p) => p.id === provId)
    if (!prov) return
    setConfigForm((prev) => ({
      ...prev,
      provider: prov.id,
      baseUrl: prov.baseUrl,
      model: prov.defaultModel
    }))
    setTestResult(null)
  }

  const handleTestConnection = async () => {
    setTestingConnection(true)
    setTestResult(null)
    try {
      const res = await testLlmConnection(configForm)
      setTestResult({
        success: true,
        msg: `连通正常！耗时 ${res.elapsed}ms · 响应: "${res.reply.slice(0, 30)}..."`
      })
    } catch (err) {
      setTestResult({
        success: false,
        msg: err.message || '连接失败，请检查 Base URL 与 API Key'
      })
    } finally {
      setTestingConnection(false)
    }
  }

  const handleSaveConfig = () => {
    saveLlmConfig(configForm)
    setLlmConfig(configForm)
    setShowConfigModal(false)
  }

  // ====== 核心流式提问处理 ======
  const handleSend = async (textToSend) => {
    const question = (textToSend || inputVal).trim()
    if (!question || isGenerating) return

    const now = Date.now()
    const userMsg = {
      id: `u_${now}`,
      sender: 'user',
      time: '刚刚',
      timestamp: now,
      content: question
    }

    const isFirstQuestion = currentSession.messages.filter((m) => m.sender === 'user').length === 0
    const newTitle = isFirstQuestion
      ? question.slice(0, 20) + (question.length > 20 ? '...' : '')
      : currentSession.title

    // 将用户消息存入当前会话
    const updatedMessages = [...currentSession.messages, userMsg]
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSession.id
          ? { ...s, title: newTitle, updatedAt: now, messages: updatedMessages }
          : s
      )
    )

    setInputVal('')
    setIsGenerating(true)
    setStreamingThought('')
    setStreamingContent('')

    const abortCtrl = new AbortController()
    abortControllerRef.current = abortCtrl

    const isDeepSeekReasoner =
      llmConfig.model.includes('reasoner') ||
      llmConfig.model.includes('R1') ||
      llmConfig.model.includes('r1')

    try {
      const historyForApi = updatedMessages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content
      }))

      let accThought = ''
      let accContent = ''

      const result = await streamChatWithLlm({
        messages: historyForApi,
        config: llmConfig,
        signal: abortCtrl.signal,
        onThoughtChunk: (chunk) => {
          accThought += chunk
          setStreamingThought((prev) => prev + chunk)
        },
        onContentChunk: (chunk) => {
          accContent += chunk
          setStreamingContent((prev) => prev + chunk)
        }
      })

      // 生成完成，写入 AI 消息并持久化
      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        time: '刚刚',
        timestamp: Date.now(),
        modelTag: result.isLocalFallback
          ? '408 内置精编知识图谱 (离线)'
          : isDeepSeekReasoner
          ? 'DeepSeek-R1 (深度思考)'
          : llmConfig.model,
        thought: accThought || result.thought || '',
        content: accContent || result.content || '未返回有效内容',
        labJump: result.labJump || null
      }

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSession.id
            ? { ...s, updatedAt: Date.now(), messages: [...updatedMessages, aiMsg] }
            : s
        )
      )
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Generation aborted by user')
      } else {
        const errorMsg = {
          id: `ai_err_${Date.now()}`,
          sender: 'ai',
          time: '刚刚',
          timestamp: Date.now(),
          modelTag: '调用异常诊断',
          thought: 'API 调用遇到网络或鉴权错误。',
          content: `### 大模型请求未能完成\n\n**错误信息**：\`${err.message}\`\n\n**排查建议**：\n1. 点击右上角「⚙️ 接入大模型」检查 API Key 是否有效或过期；\n2. 检查网络是否可以连通该服务商 Base URL（若使用 Ollama，请确认本地 \`ollama serve\` 正在运行）；\n3. 也可暂时留空 API Key，系统将自动切换为高精度的 408 离线知识图谱全天候伴学。`,
          labJump: null
        }
        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSession.id
              ? { ...s, updatedAt: Date.now(), messages: [...updatedMessages, errorMsg] }
              : s
          )
        )
      }
    } finally {
      setIsGenerating(false)
      setStreamingThought('')
      setStreamingContent('')
      abortControllerRef.current = null
    }
  }

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  const handleToggleThought = (msgId) => {
    setCollapsedThoughts((prev) => ({
      ...prev,
      [msgId]: !prev[msgId]
    }))
  }

  const handleCopyContent = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccessId(id)
      setTimeout(() => setCopySuccessId(null), 2000)
    })
  }

  // 格式化时间戳
  const formatTime = (ts) => {
    if (!ts) return '刚刚'
    const date = new Date(ts)
    const now = new Date()
    if (date.toDateString() === now.toDateString()) {
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    }
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  return (
    <div className="ai-tutor-page">
      {/* 顶部头部与大模型状态栏 */}
      <header className="ai-tutor-header">
        <div className="tutor-header-left">
          <div className="model-live-indicator">
            <span className="live-dot" />
            <span>
              {llmConfig.apiKey || llmConfig.provider === 'ollama'
                ? `大模型已接入：${llmConfig.model} [全时多轮对话开启]`
                : '离线 408 知识图谱引擎 [推荐接入 DeepSeek 获取无限大模型问答]'}
            </span>
          </div>
          <h1>AI 计算机私教 · 考研与原理全天候伴学</h1>
          <p className="tutor-desc">
            穿透枯燥文字，深度推演 408 微架构时序计算、协议状态机、死锁并发等核心考点，全链路存档研学记录。
          </p>
        </div>

        {/* 顶部快捷操作区 */}
        <div className="tutor-header-actions">
          <button
            type="button"
            className="tutor-action-pill"
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            title="查看或切换历史研学记录存档"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>研学存档 ({sessions.length})</span>
          </button>

          <button
            type="button"
            className="tutor-action-pill"
            onClick={handleNewSession}
            title="开启新的研学提问会话"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>新建对话</span>
          </button>

          <button
            type="button"
            className="tutor-action-pill"
            onClick={handleExportMarkdown}
            title="将当前对话导出为 Markdown 研学笔记"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>导出笔记</span>
          </button>

          <button
            type="button"
            className="tutor-action-pill primary-pill"
            onClick={handleOpenConfig}
            title="配置大模型 API Key 及供应商"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>⚙️ 接入大模型</span>
          </button>
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
            disabled={isGenerating}
          >
            <div className="prompt-top-line">
              <span className="cat-tag">{p.category}</span>
              <span className="arrow-icon">→</span>
            </div>
            <strong>{p.title}</strong>
          </button>
        ))}
      </div>

      {/* 主对话交互区与历史抽屉布局 */}
      <div className="tutor-main-workspace">
        {/* 历史存档侧边抽屉 */}
        {showHistoryDrawer && (
          <aside className="tutor-history-drawer">
            <div className="drawer-head">
              <div className="drawer-title-row">
                <span className="drawer-title">📜 研学对话存档 ({sessions.length})</span>
                <button
                  type="button"
                  className="drawer-close-btn"
                  onClick={() => setShowHistoryDrawer(false)}
                >
                  ✕
                </button>
              </div>
              <div className="drawer-actions-bar">
                <button type="button" className="drawer-new-btn" onClick={handleNewSession}>
                  + 开启新会话
                </button>
                <button
                  type="button"
                  className="drawer-clear-btn"
                  onClick={handleClearAllSessions}
                  title="清空全部存档"
                >
                  清空
                </button>
              </div>
            </div>

            <div className="drawer-session-list">
              {sessions.map((sess) => {
                const isActive = sess.id === currentSession.id
                const isEditing = editingTitleId === sess.id
                return (
                  <div
                    key={sess.id}
                    className={`drawer-session-card ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setActiveSessionId(sess.id)
                      setShowHistoryDrawer(false)
                    }}
                  >
                    <div className="session-card-main">
                      {isEditing ? (
                        <div className="session-rename-box" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editTitleVal}
                            onChange={(e) => setEditTitleVal(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(sess.id)
                              if (e.key === 'Escape') setEditingTitleId(null)
                            }}
                            autoFocus
                          />
                          <button
                            type="button"
                            className="rename-save-btn"
                            onClick={() => handleSaveRename(sess.id)}
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <div className="session-title-line">
                          <span className="session-title-text" title={sess.title}>
                            {sess.title}
                          </span>
                        </div>
                      )}
                      <div className="session-meta-line">
                        <span className="session-count-tag">
                          {sess.messages?.length || 0} 条对话
                        </span>
                        <span className="session-time-text">
                          {formatTime(sess.updatedAt || sess.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="session-card-actions">
                      <button
                        type="button"
                        className="sess-icon-btn"
                        onClick={(e) => handleStartRename(sess, e)}
                        title="重命名会话"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        className="sess-icon-btn delete-btn"
                        onClick={(e) => handleDeleteSession(sess.id, e)}
                        title="删除该条存档"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </aside>
        )}

        {/* 核心对话消息流 */}
        <div className="tutor-chat-stream">
          {messages.map((msg) => {
            const isThoughtCollapsed = collapsedThoughts[msg.id]
            const isCopied = copySuccessId === msg.id

            return (
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
                    <span className="msg-time">{msg.time || formatTime(msg.timestamp)}</span>

                    {msg.sender === 'ai' && (
                      <button
                        type="button"
                        className="msg-copy-btn"
                        onClick={() => handleCopyContent(msg.content, msg.id)}
                        title="复制 Markdown 回答内容"
                      >
                        {isCopied ? '✓ 已复制' : '复制回答'}
                      </button>
                    )}
                  </div>

                  {/* 思考过程折叠块（DeepSeek 特色思维链） */}
                  {msg.thought && (
                    <div className="tutor-thought-block">
                      <div
                        className="thought-title"
                        onClick={() => handleToggleThought(msg.id)}
                        style={{ cursor: 'pointer' }}
                        title="点击展开/折叠深度推理链"
                      >
                        <span className="thought-tag">DEEPSEEK REASONING</span>
                        <span>深度思维推理链</span>
                        <span className="thought-toggle-indicator">
                          {isThoughtCollapsed ? '▶ 展开思考' : '▼ 折叠思考'}
                        </span>
                      </div>
                      {!isThoughtCollapsed && <p>{msg.thought}</p>}
                    </div>
                  )}

                  {/* 回答正文渲染 */}
                  <div className="msg-markdown-body">
                    {msg.content.split('\n\n').map((para, pIdx) => {
                      if (para.startsWith('### ')) {
                        return <h3 key={pIdx}>{para.replace('### ', '')}</h3>
                      }
                      if (para.startsWith('#### ')) {
                        return <h4 key={pIdx}>{para.replace('#### ', '')}</h4>
                      }
                      if (para.startsWith('```')) {
                        const codeContent = para.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '')
                        return (
                          <pre key={pIdx} className="tutor-code-block">
                            <code>{codeContent}</code>
                          </pre>
                        )
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
            )
          })}

          {/* 流式生成实时渲染块 */}
          {isGenerating && (
            <div className="tutor-msg-item ai streaming">
              <div className="msg-avatar-col">
                <div className="ai-tutor-avatar">CS</div>
              </div>
              <div className="msg-content-col">
                <div className="msg-header-line">
                  <span className="msg-sender-name">CScope 私教导师</span>
                  <span className="msg-model-tag">
                    {llmConfig.model.includes('reasoner') || llmConfig.model.includes('R1')
                      ? 'DeepSeek-R1 (流式推理)'
                      : 'AI 实时流式响应'}
                  </span>
                  <span className="msg-time">生成中...</span>
                </div>

                {streamingThought && (
                  <div className="tutor-thought-block streaming-thought">
                    <div className="thought-title">
                      <span className="thought-tag pulse-tag">DEEPSEEK REASONING</span>
                      <span>正在深度推理底层机理与考点拓扑...</span>
                    </div>
                    <p>{streamingThought}</p>
                  </div>
                )}

                {streamingContent ? (
                  <div className="msg-markdown-body">
                    {streamingContent.split('\n\n').map((para, pIdx) => {
                      if (para.startsWith('### ')) {
                        return <h3 key={pIdx}>{para.replace('### ', '')}</h3>
                      }
                      if (para.startsWith('#### ')) {
                        return <h4 key={pIdx}>{para.replace('#### ', '')}</h4>
                      }
                      return <p key={pIdx}>{para}</p>
                    })}
                  </div>
                ) : (
                  !streamingThought && (
                    <div className="thinking-indicator">
                      <span className="dot dot-1" />
                      <span className="dot dot-2" />
                      <span className="dot dot-3" />
                      <span className="thinking-text">大模型正在连接并思考中，请稍候...</span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          <div ref={chatBottomRef} style={{ height: '1px' }} />
        </div>
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
            placeholder={
              isGenerating
                ? '大模型正在输出中，可点击右侧按钮停止生成...'
                : '随时向私教提问：如“计网滑动窗口怎么计算？”或“帮我推导死锁银行家算法”... (Enter 发送，Shift+Enter 换行)'
            }
            rows={2}
            disabled={isGenerating}
          />

          {isGenerating ? (
            <button
              type="button"
              className="stop-button"
              onClick={handleStopGenerating}
              title="中断当前流式输出"
            >
              ⏹ 停止生成
            </button>
          ) : (
            <button
              type="button"
              className="send-button"
              onClick={() => handleSend()}
              disabled={!inputVal.trim()}
            >
              发送提问 ↵
            </button>
          )}
        </div>

        <div className="tutor-input-footer-note">
          <div className="note-left">
            <span>当前会话：<strong>{currentSession.title}</strong></span>
          </div>
          <div className="note-right">
            <span>
              已接入 408 统考真题库与 25 门时钟仿真沙盘 · 支持代码与公式解析 · 聊天记录全自动存档
            </span>
          </div>
        </div>
      </div>

      {/* ====== 大模型配置模态弹窗 (Model Settings Modal) ====== */}
      {showConfigModal && (
        <div className="cscope-modal-backdrop" onClick={() => setShowConfigModal(false)}>
          <div className="cscope-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div className="modal-title-group">
                <h3>⚙️ 接入真实大模型配置</h3>
                <span className="modal-subtitle">
                  支持接入 DeepSeek 官方、硅基流动、本地 Ollama 以及任何标准 OpenAI 兼容大模型
                </span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowConfigModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body-content">
              {/* 服务商预设切换卡片 */}
              <div className="config-form-item">
                <label className="form-label">选择模型服务商 (Provider)：</label>
                <div className="provider-grid">
                  {LLM_PROVIDERS.map((prov) => (
                    <button
                      key={prov.id}
                      type="button"
                      className={`provider-card ${configForm.provider === prov.id ? 'active' : ''}`}
                      onClick={() => handleProviderSelect(prov.id)}
                    >
                      <span className="prov-name">{prov.name}</span>
                      <span className="prov-url">{prov.baseUrl}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Base URL */}
              <div className="config-form-item">
                <label className="form-label">
                  API 接口基础地址 (Base URL)：
                  <span className="form-tip">支持各类兼容代理或本地端口</span>
                </label>
                <input
                  type="text"
                  className="config-input"
                  value={configForm.baseUrl}
                  onChange={(e) => setConfigForm({ ...configForm, baseUrl: e.target.value })}
                  placeholder="https://api.deepseek.com"
                />
              </div>

              {/* API Key */}
              <div className="config-form-item">
                <label className="form-label">
                  API Key（密钥）：
                  <span className="form-tip">本地浏览器安全存储，绝不上报第三方</span>
                </label>
                <div className="api-key-input-wrap">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    className="config-input"
                    value={configForm.apiKey}
                    onChange={(e) => setConfigForm({ ...configForm, apiKey: e.target.value })}
                    placeholder={
                      LLM_PROVIDERS.find((p) => p.id === configForm.provider)?.keyPlaceholder ||
                      '请输入 API Key'
                    }
                  />
                  <button
                    type="button"
                    className="key-eye-btn"
                    onClick={() => setShowApiKey(!showApiKey)}
                    title={showApiKey ? '隐藏密钥' : '显示密钥'}
                  >
                    {showApiKey ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Model Name */}
              <div className="config-form-item">
                <label className="form-label">
                  模型名称 (Model Identifier)：
                  <span className="form-tip">支持直接手写输入任意模型 ID</span>
                </label>
                <div className="model-select-group">
                  <select
                    className="config-select"
                    value={configForm.model}
                    onChange={(e) => setConfigForm({ ...configForm, model: e.target.value })}
                  >
                    {LLM_PROVIDERS.find((p) => p.id === configForm.provider)?.availableModels.map(
                      (m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.id})
                        </option>
                      )
                    )}
                    <option value={configForm.model}>自定义: {configForm.model}</option>
                  </select>
                  <input
                    type="text"
                    className="config-input custom-model-input"
                    value={configForm.model}
                    onChange={(e) => setConfigForm({ ...configForm, model: e.target.value })}
                    placeholder="或直接手写模型名如 deepseek-reasoner"
                  />
                </div>
              </div>

              {/* Temperature */}
              <div className="config-form-item">
                <div className="slider-label-row">
                  <label className="form-label">发散度 / 温度 (Temperature)：</label>
                  <span className="slider-val">{configForm.temperature ?? 0.6}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  className="config-range"
                  value={configForm.temperature ?? 0.6}
                  onChange={(e) =>
                    setConfigForm({ ...configForm, temperature: parseFloat(e.target.value) })
                  }
                />
                <span className="form-tip">0.1 严谨推导 | 0.6 考研私教标准推荐 | 1.0 创意发散</span>
              </div>

              {/* 连通性测试结果提示 */}
              {testResult && (
                <div className={`test-result-box ${testResult.success ? 'success' : 'error'}`}>
                  <span>{testResult.success ? '✓' : '⚠'}</span>
                  <span>{testResult.msg}</span>
                </div>
              )}
            </div>

            <div className="modal-footer-row">
              <button
                type="button"
                className="test-conn-btn"
                onClick={handleTestConnection}
                disabled={testingConnection}
              >
                {testingConnection ? '正在探测连通性...' : '🧪 测试接口连通性'}
              </button>

              <div className="footer-right-actions">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setShowConfigModal(false)}
                >
                  取消
                </button>
                <button type="button" className="modal-save-btn" onClick={handleSaveConfig}>
                  保存并生效
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
