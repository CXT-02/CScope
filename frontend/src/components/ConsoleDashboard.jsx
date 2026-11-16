import React, { useState, useMemo } from 'react'
import { useLearningProfile, calculateStreak } from './LearningProfileContext'
import { courses, experiments } from '../lib/experimentRegistry'

export default function ConsoleDashboard({
  onOpenCourses,
  onOpenExam,
  onOpenProfile,
  onOpenExperiment
}) {
  const { user, records } = useLearningProfile()
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiChatLog, setAiChatLog] = useState([
    {
      sender: 'ai',
      text: '你好！我是 CScope 学习副驾驶。已结合你的当前学习进度和 408 考情，随时可为你梳理知识盲区、推荐实验或即时抽测。'
    }
  ])
  const [showAiModal, setShowAiModal] = useState(false)
  const [refreshSeed, setRefreshSeed] = useState(0)

  // 读取 408 模考记录
  const examRecords = useMemo(() => {
    try {
      const saved = localStorage.getItem('408_exam_records_v1')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  }, [refreshSeed])

  // 计算模考均分
  const examStats = useMemo(() => {
    if (!examRecords.length) {
      return { count: 0, avgScore: 0, latestScore: 0, wrongCount: 0 }
    }
    const totalScore = examRecords.reduce((acc, r) => acc + (r.score || 0), 0)
    const avgScore = Math.round(totalScore / examRecords.length)
    const latestScore = examRecords[0]?.score || 0
    // 错题统计
    let wrongs = 0
    examRecords.forEach(rec => {
      if (rec.questions) {
        wrongs += rec.questions.filter(q => !q.isCorrect).length
      }
    })
    return {
      count: examRecords.length,
      avgScore,
      latestScore,
      wrongCount: wrongs
    }
  }, [examRecords])

  // 计算实验学习数据
  const expStats = useMemo(() => {
    const expEntries = records?.experiments || {}
    const keys = Object.keys(expEntries)
    const totalVisits = keys.reduce((acc, k) => acc + (expEntries[k]?.visits || 0), 0)
    const completedCount = keys.filter(k => expEntries[k]?.completed).length
    const streak = calculateStreak(records?.studyDates || [])
    return {
      visitedExpCount: keys.length,
      totalVisits,
      completedCount,
      streak: Math.max(1, streak)
    }
  }, [records, refreshSeed])

  // 问候语生成
  const greetingText = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 11) return '早上好'
    if (hour < 14) return '中午好'
    if (hour < 18) return '下午好'
    return '晚上好'
  }, [])

  // 格式化当前日期
  const todayFormatted = useMemo(() => {
    const now = new Date()
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    return `${now.getMonth() + 1}月${now.getDate()}日 ${days[now.getDay()]}`
  }, [])

  // AI 交互提问处理
  const handleAiSend = (customPrompt) => {
    const query = (customPrompt || aiQuestion).trim()
    if (!query) return

    const newLog = [...aiChatLog, { sender: 'user', text: query }]
    setAiQuestion('')

    let reply = ''
    let action = null

    if (query.includes('本周推荐') || query.includes('先学什么') || query.includes('下一步')) {
      reply = '根据真题高频考点分析，建议本周重点突破【计算机组成原理：指令流水线与数据冒险】以及【操作系统：银行家死锁避免算法】。这两大模块在 408 大题与选择题中每年必考。'
      action = { label: '进入 CPU 流水线实验', expId: 'cpu-pipeline' }
    } else if (query.includes('模考') || query.includes('测试') || query.includes('题目')) {
      reply = '已为您从 105 道 408 统考真题库中准备好智能测评卷，推荐先进行一组 5~10 题的综合自适应摸底！'
      action = { label: '立即前往 408 测评中心', isExam: true }
    } else if (query.includes('流水线') || query.includes('cpu') || query.includes('指令')) {
      reply = 'CPU 五级流水线（取指IF、译码ID、执行EX、访存MEM、写回WB）最大的难点在于解决 RAW 数据冒险与结构冒险。推荐直接在沙盘中单步仿真！'
      action = { label: '打开 CPU 流水线仿真', expId: 'cpu-pipeline' }
    } else if (query.includes('cache') || query.includes('缓存')) {
      reply = 'Cache 核心考点是组相联映射的主存地址划分（Tag + Set Index + Offset）与命中率/缺失替换算法。可立即进入交互实验直观观察命中与颠簸。'
      action = { label: '打开 Cache 映射实验', expId: 'cache-mapping' }
    } else if (query.includes('tcp') || query.includes('网络') || query.includes('握手')) {
      reply = 'TCP 考点集中在三次握手状态变迁机理、滑动窗口流量控制与拥塞控制（慢开始、拥塞避免、快重传、快恢复）。'
      action = { label: '打开 TCP 交互仿真', expId: 'tcp-connection' }
    } else {
      reply = `已为您检索【${query}】相关的 408 考点。建议结合微观仿真实验推演运行过程，再到 408 测评中心进行真题巩固验证！`
      action = { label: '前往课程知识地图', isCourses: true }
    }

    newLog.push({ sender: 'ai', text: reply, action })
    setAiChatLog(newLog)
  }

  return (
    <div className="console-dashboard-view">
      {/* 顶部状态与欢迎栏 (参考 JobPilot 样式) */}
      <header className="console-top-hero">
        <div className="console-hero-left">
          <div className="console-sub-label">CSCOPE CONSOLE · 控制台工作台</div>
          <h1 className="console-greeting-title">
            {greetingText}，{user?.name || '研友同学'}
          </h1>
          <p className="console-hero-status">
            <span>{todayFormatted}</span>
            <span className="dot-sep">•</span>
            <span>408 统考冲刺 & 核心专业课</span>
            <span className="dot-sep">•</span>
            <span className="focus-badge">正在推进 8 门核心课程与 105 道考研真题</span>
          </p>
        </div>
        <div className="console-hero-actions">
          <button
            type="button"
            className="console-action-btn secondary"
            onClick={() => setRefreshSeed(s => s + 1)}
            title="刷新数据看板"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>刷新数据</span>
          </button>
          <button
            type="button"
            className="console-action-btn primary"
            onClick={() => setShowAiModal(true)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>AI 今日学习简报</span>
          </button>
        </div>
      </header>

      {/* 第一大块：AI 伴学副驾驶 + 核心 4 指标卡片 (完全对应参考图结构) */}
      <div className="console-upper-grid">
        {/* 左侧：AI 伴学副驾驶大卡片 */}
        <section className="console-copilot-card">
          <div className="copilot-card-top">
            <div className="copilot-tag">
              <span className="copilot-dot" />
              <strong>AI 伴学副驾驶</strong>
            </div>
            <span className="copilot-subtext">已接入当前题库测评、错题溯源与实验学情数据</span>
          </div>

          <div className="copilot-body">
            <div className="copilot-avatar-area">
              <div className="copilot-avatar">CS</div>
              <div className="copilot-bubble-welcome">
                <strong>{greetingText}，想先从哪里开始？</strong>
                <p>我会结合你的 408 测评数据与实验推演进度，提供靶向辅导与即时直达通道。</p>
              </div>
            </div>

            {/* 快捷问答选项胶囊 */}
            <div className="copilot-quick-pills">
              <button
                type="button"
                className="quick-pill"
                onClick={() => handleAiSend('本周推荐我先学什么？')}
              >
                本周推荐我先学什么？
              </button>
              <button
                type="button"
                className="quick-pill"
                onClick={() => handleAiSend('开始一次 10 题 408 摸底模考')}
              >
                开始一次 10 题 408 模考
              </button>
              <button
                type="button"
                className="quick-pill"
                onClick={() => handleAiSend('直达 CPU 指令流水线实验')}
              >
                CPU 流水线微架构仿真
              </button>
            </div>

            {/* AI 交互对话历史展视区 */}
            <div className="copilot-chat-history">
              {aiChatLog.slice(-3).map((msg, i) => (
                <div key={i} className={`chat-message ${msg.sender}`}>
                  <span className="sender-tag">{msg.sender === 'ai' ? 'CScope AI' : '我'}：</span>
                  <span className="message-content">{msg.text}</span>
                  {msg.action && (
                    <div className="message-action-row">
                      {msg.action.expId && (
                        <button
                          type="button"
                          className="msg-action-btn"
                          onClick={() => onOpenExperiment(msg.action.expId)}
                        >
                          {msg.action.label} →
                        </button>
                      )}
                      {msg.action.isExam && (
                        <button
                          type="button"
                          className="msg-action-btn exam"
                          onClick={onOpenExam}
                        >
                          {msg.action.label} →
                        </button>
                      )}
                      {msg.action.isCourses && (
                        <button
                          type="button"
                          className="msg-action-btn"
                          onClick={onOpenCourses}
                        >
                          {msg.action.label} →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 提问输入框 */}
            <div className="copilot-input-bar">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAiSend() }}
                placeholder="问问 AI：帮我梳理流水线冒险 / 推荐一个薄弱考点实验..."
              />
              <button
                type="button"
                className="copilot-send-btn"
                onClick={() => handleAiSend()}
                disabled={!aiQuestion.trim()}
              >
                发送
              </button>
            </div>
          </div>
        </section>

        {/* 右侧：4 个核心指标卡片矩阵 (Metrics Matrix) */}
        <section className="console-metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">实验探索总数</span>
              <span className="metric-badge">工坊</span>
            </div>
            <div className="metric-number-row">
              <strong className="metric-value">{expStats.visitedExpCount || 0}</strong>
              <span className="metric-unit">个实验</span>
            </div>
            <div className="metric-footer">
              <span>累计推演 {expStats.totalVisits || 0} 次 · 完成 {expStats.completedCount || 0} 项</span>
            </div>
          </div>

          <div className="metric-card highlight">
            <div className="metric-header">
              <span className="metric-label">408 模考均分</span>
              <span className="metric-badge hot">真题</span>
            </div>
            <div className="metric-number-row">
              <strong className="metric-value">{examStats.count ? `${examStats.avgScore}` : '--'}</strong>
              <span className="metric-unit">分</span>
            </div>
            <div className="metric-footer">
              <span>{examStats.count ? `历经 ${examStats.count} 轮模考 · 最新 ${examStats.latestScore} 分` : '尚未开始全真测评'}</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">连续学习打卡</span>
              <span className="metric-badge">习惯</span>
            </div>
            <div className="metric-number-row">
              <strong className="metric-value">{expStats.streak}</strong>
              <span className="metric-unit">天</span>
            </div>
            <div className="metric-footer">
              <span>保持每日微观推演好习惯</span>
            </div>
          </div>

          <div className="metric-card warning">
            <div className="metric-header">
              <span className="metric-label">待突破错题库</span>
              <span className="metric-badge warn">待查</span>
            </div>
            <div className="metric-number-row">
              <strong className="metric-value">{examStats.wrongCount}</strong>
              <span className="metric-unit">道</span>
            </div>
            <div className="metric-footer">
              <span>{examStats.wrongCount ? '支持一键直达仿真实验验证' : '保持全对，实力优异！'}</span>
            </div>
          </div>
        </section>
      </div>

      {/* 第二大块：三大核心功能模块入口卡片 (横排大入口，对应用户之前要求的三大模块) */}
      <section className="console-portals-section">
        <div className="portal-banner-grid">
          {/* 模块一 */}
          <div className="portal-card" onClick={onOpenCourses}>
            <div className="portal-card-icon" style={{ background: '#2563eb' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div className="portal-card-body">
              <div className="portal-tag" style={{ color: '#2563eb' }}>模块一 · 课程知识库</div>
              <h3 className="portal-title">课程知识与微观仿真</h3>
              <p className="portal-desc">
                8 门核心课程知识地图 · 25 个时钟级可交互动态仿真实验
              </p>
            </div>
            <div className="portal-card-arrow" style={{ color: '#2563eb' }}>
              <span>进入课程 →</span>
            </div>
          </div>

          {/* 模块二 */}
          <div className="portal-card highlight-exam" onClick={onOpenExam}>
            <div className="portal-card-icon" style={{ background: '#4f46e5' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
            <div className="portal-card-body">
              <div className="portal-tag badge-hot">
                <span>HOT 备考专项</span>
              </div>
              <h3 className="portal-title">408 考研真题与智能测评</h3>
              <p className="portal-desc">
                历年 105 道统考真题抽测 · 自由题量时长 · 错题一键直达实验验证
              </p>
            </div>
            <div className="portal-card-arrow" style={{ color: '#fff' }}>
              <span>开始测试 →</span>
            </div>
          </div>

          {/* 模块三 */}
          <div className="portal-card" onClick={onOpenProfile}>
            <div className="portal-card-icon" style={{ background: '#059669' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M18 20V10M12 20V4M6 20v-6" />
              </svg>
            </div>
            <div className="portal-card-body">
              <div className="portal-tag" style={{ color: '#059669' }}>模块三 · 个人学情中心</div>
              <h3 className="portal-title">学情画像与学习档案</h3>
              <p className="portal-desc">
                四门课掌握度热力分析 · 历史模考成绩归档 · 习惯成长曲线
              </p>
            </div>
            <div className="portal-card-arrow" style={{ color: '#059669' }}>
              <span>查看档案 →</span>
            </div>
          </div>
        </div>
      </section>

      {/* 第三大块：下半部分双列布局 (参考图：方向欠缺与最近答题) */}
      <div className="console-lower-grid">
        {/* 左列：最近答题与模考记录 */}
        <section className="console-panel-card recent-tests-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <h3>最近 408 测评记录</h3>
              <span className="panel-badge">{examRecords.length} 轮测试</span>
            </div>
            <button type="button" className="panel-link-btn" onClick={onOpenExam}>
              去模考大厅 →
            </button>
          </div>

          <div className="recent-tests-list">
            {examRecords.length > 0 ? (
              examRecords.slice(0, 4).map((rec) => (
                <div key={rec.id} className="test-row-item">
                  <div className="test-info">
                    <strong className="test-title">{rec.courseScopeName}</strong>
                    <span className="test-meta">
                      {rec.date ? new Date(rec.date).toLocaleDateString() : '近期'} · 共 {rec.totalQuestions} 题 · 用时 {Math.round((rec.timeUsedSec || 60) / 60)} 分钟
                    </span>
                  </div>
                  <div className="test-score-badge" style={{
                    background: (rec.score || 0) >= 80 ? '#ecfdf5' : (rec.score || 0) >= 60 ? '#fef3c7' : '#fee2e2',
                    color: (rec.score || 0) >= 80 ? '#065f46' : (rec.score || 0) >= 60 ? '#92400e' : '#991b1b'
                  }}>
                    {rec.score} 分
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-test-tip">
                <p>暂无 408 测评记录，建议先进行一组 5 题快速测评！</p>
                <button type="button" className="empty-start-btn" onClick={onOpenExam}>
                  立即开启首次模考
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 右列：408 四大学科掌握度与方向欠缺诊断 */}
        <section className="console-panel-card subject-mastery-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <h3>408 学科掌握度诊断</h3>
              <span className="panel-badge highlight">AI 智能评估</span>
            </div>
            <span className="panel-sub-label">基于 105 题库与实验推演</span>
          </div>

          <div className="subject-bars-list">
            <div className="subject-bar-row">
              <div className="bar-label-line">
                <span className="subject-name">计算机组成原理</span>
                <span className="subject-score">29 题覆盖 · 掌握度 84%</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: '84%', background: '#4f46e5' }} />
              </div>
            </div>

            <div className="subject-bar-row">
              <div className="bar-label-line">
                <span className="subject-name">操作系统</span>
                <span className="subject-score">27 题覆盖 · 掌握度 76%</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: '76%', background: '#0284c7' }} />
              </div>
            </div>

            <div className="subject-bar-row">
              <div className="bar-label-line">
                <span className="subject-name">计算机网络</span>
                <span className="subject-score">25 题覆盖 · 掌握度 80%</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: '80%', background: '#059669' }} />
              </div>
            </div>

            <div className="subject-bar-row">
              <div className="bar-label-line">
                <span className="subject-name">数据结构与算法</span>
                <span className="subject-score">18 题覆盖 · 掌握度 88%</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: '88%', background: '#d97706' }} />
              </div>
            </div>
          </div>

          {/* AI 靶向建议小框 */}
          <div className="ai-diagnostic-footer">
            <div className="ai-badge-pill">AI 诊断建议</div>
            <p>
              检测到您在<strong>【虚拟存储管理与页面置换算法】</strong>以及<strong>【Cache 颠簸命中率】</strong>考点仍有提升空间，建议结合交互仿真深入时序推演！
            </p>
            <div className="ai-action-jump">
              <button
                type="button"
                className="ai-jump-btn"
                onClick={() => onOpenExperiment('page-replacement')}
              >
                跳转：页面置换算法实验 →
              </button>
              <button
                type="button"
                className="ai-jump-btn"
                onClick={() => onOpenExperiment('cache-mapping')}
              >
                跳转：Cache 映射实验 →
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* AI 今日学习简报弹窗 */}
      {showAiModal && (
        <div className="console-modal-overlay" onClick={() => setShowAiModal(false)}>
          <div className="console-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <span className="modal-icon">✦</span>
                <h2>AI 今日专属学习导学简报</h2>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowAiModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="brief-card">
                <h4>🎯 今日考情聚焦</h4>
                <p>今天为您规划的考点突破是 <strong>408 计算机组成原理与操作系统交叉模块</strong>（虚拟存储与 TLB 快表查询时序）。</p>
              </div>
              <div className="brief-steps">
                <div className="step-item">
                  <span className="step-num">1</span>
                  <div>
                    <strong>单步推演指令时序</strong>
                    <p>在 CPU 五级流水线实验中观察并验证数据相关性冒险。</p>
                  </div>
                </div>
                <div className="step-item">
                  <span className="step-num">2</span>
                  <div>
                    <strong>完成一组 5 题针对性模考</strong>
                    <p>验证 TLB、页表、Cache 与主存访问周期的组合真题。</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="modal-action-btn primary"
                onClick={() => { setShowAiModal(false); onOpenExam() }}
              >
                进入 408 智能模考
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
