import React, { useState, useEffect, useMemo } from 'react'
import { EXAM_QUESTIONS } from '../lib/examRegistry'

const STORAGE_KEY = '408_exam_records_v1'

// Fisher-Yates 洗牌算法
function shuffleArray(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function ExamArena({ onOpenExperiment, onBackHome }) {
  // 视图模式: 'config' (组卷配置) | 'testing' (答题中) | 'result' (成绩结果) | 'history' (历史档案)
  const [viewState, setViewState] = useState('config')

  // ====== 组卷配置项 ======
  const [configCourse, setConfigCourse] = useState('all') // 'all' 或 具体 courseId
  const [questionCount, setQuestionCount] = useState(5) // 默认 5 题
  const [durationMinutes, setDurationMinutes] = useState(10) // 默认自动计算 10 分钟 (2分钟/题)
  const [autoDuration, setAutoDuration] = useState(true) // 是否自动根据题数联动时长

  // ====== 考试运行状态 ======
  const [quizQuestions, setQuizQuestions] = useState([]) // 当前抽出的考题数组
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({}) // { [qId]: optionIdx }
  const [timeLeft, setTimeLeft] = useState(600) // 剩余秒数
  const [totalTimeSec, setTotalTimeSec] = useState(600) // 总时长秒数
  const [examStartTime, setExamStartTime] = useState(null)

  // ====== 历史记录与持久化 ======
  const [examHistory, setExamHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      console.error('Failed to load exam history', e)
      return []
    }
  })
  const [viewingRecord, setViewingRecord] = useState(null) // 正在复盘的历史记录

  // 当题数变化且开启自动时长时，自动推算考试时长（按每题 2 分钟计算，最少 3 分钟）
  useEffect(() => {
    if (autoDuration) {
      setDurationMinutes(Math.max(3, questionCount * 2))
    }
  }, [questionCount, autoDuration])

  // 可选的最大题目数（根据选定学科）
  const availableQuestionCount = useMemo(() => {
    if (configCourse === 'all') return EXAM_QUESTIONS.length
    return EXAM_QUESTIONS.filter(q => q.courseId === configCourse).length
  }, [configCourse])

  // 保证选中的题数不超过当前学科可用最大题数
  useEffect(() => {
    if (questionCount > availableQuestionCount && availableQuestionCount > 0) {
      setQuestionCount(availableQuestionCount)
    }
  }, [availableQuestionCount, questionCount])

  // 考试计时器
  useEffect(() => {
    if (viewState !== 'testing') return
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer)
          handleAutoSubmit()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [viewState])

  // 格式化时间为 mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // ====== 开始生成试卷并进入测试 ======
  const handleStartExam = () => {
    let pool = EXAM_QUESTIONS
    if (configCourse !== 'all') {
      pool = pool.filter(q => q.courseId === configCourse)
    }

    // 随机洗牌并截取选定数量的题目
    const shuffled = shuffleArray(pool)
    const selected = shuffled.slice(0, Math.min(questionCount, pool.length))

    setQuizQuestions(selected)
    setCurrentIndex(0)
    setUserAnswers({})
    const totalSec = durationMinutes * 60
    setTimeLeft(totalSec)
    setTotalTimeSec(totalSec)
    setExamStartTime(Date.now())
    setViewState('testing')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 选择选项
  const handleSelectOption = (optionIdx) => {
    if (viewState !== 'testing') return
    const currentQ = quizQuestions[currentIndex]
    if (!currentQ) return
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionIdx
    }))
  }

  // 超时自动交卷
  const handleAutoSubmit = () => {
    finishExam(true)
  }

  // 用户主动提交试卷
  const handleSubmitPrompt = () => {
    const answeredCount = Object.keys(userAnswers).length
    const unAnsweredCount = quizQuestions.length - answeredCount
    if (unAnsweredCount > 0) {
      if (!window.confirm(`提示：您还有 ${unAnsweredCount} 道题未作答，确定要提前交卷吗？`)) {
        return
      }
    }
    finishExam(false)
  }

  // 计算并保存成绩归档
  const finishExam = (isTimeout = false) => {
    const timeUsedSec = Math.max(1, totalTimeSec - timeLeft)
    let correctCount = 0

    const snapshot = quizQuestions.map(q => {
      const userAns = userAnswers[q.id]
      const isCorrect = userAns === q.answer
      if (isCorrect) correctCount += 1
      return {
        ...q,
        userAnswer: userAns,
        isCorrect
      }
    })

    const score = Math.round((correctCount / quizQuestions.length) * 100)

    const courseScopeName = configCourse === 'all'
      ? '全科综合 408'
      : (quizQuestions[0]?.courseName || '专项测评')

    const newRecord = {
      id: 'rec_' + Date.now(),
      dateStr: new Date().toLocaleString('zh-CN', { hour12: false }),
      courseScope: courseScopeName,
      questionCount: quizQuestions.length,
      score,
      correctCount,
      timeUsedSec,
      totalTimeSec,
      isTimeout,
      questions: snapshot
    }

    // 保存至本地存储
    try {
      const updatedHistory = [newRecord, ...examHistory].slice(0, 30) // 最多保留最近 30 条
      setExamHistory(updatedHistory)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory))
    } catch (e) {
      console.error('Failed to save exam record', e)
    }

    setViewingRecord(newRecord)
    setViewState('result')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 清空历史记录
  const handleClearHistory = () => {
    if (window.confirm('确定要清空所有历史测评记录吗？')) {
      setExamHistory([])
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  // 当前正在回答的题目
  const currentQ = quizQuestions[currentIndex] || quizQuestions[0]

  // 学科选项列表
  const courseOptions = [
    { id: 'all', label: '全科综合 408 (多学科融合)' },
    { id: 'computer-organization', label: '计算机组成原理 408' },
    { id: 'operating-systems', label: '操作系统 408' },
    { id: 'networks', label: '计算机网络 408' },
    { id: 'data-structures', label: '数据结构与算法 408' },
    { id: 'databases', label: '数据库系统' }
  ]

  // 历史统计总览数据
  const historyStats = useMemo(() => {
    if (examHistory.length === 0) return null
    const totalExams = examHistory.length
    const avgScore = Math.round(examHistory.reduce((acc, r) => acc + r.score, 0) / totalExams)
    const maxScore = Math.max(...examHistory.map(r => r.score))
    const totalQuestionsDone = examHistory.reduce((acc, r) => acc + r.questionCount, 0)
    return { totalExams, avgScore, maxScore, totalQuestionsDone }
  }, [examHistory])

  return (
    <div className="exam-arena-container" style={{ maxWidth: '1120px', margin: '0 auto', padding: '24px 16px' }}>
      {/* 顶部介绍横幅 */}
      <header style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
        borderRadius: '16px',
        padding: '24px 28px',
        color: '#fff',
        border: '1px solid #312e81',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ background: '#4f46e5', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800 }}>
              408 考研真题与智能专项测评中心
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>自适应自由组卷 · 动态随机抽题 · 测评成长档案</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', color: '#f8fafc', fontWeight: 900 }}>
            做真题 · 自适应组卷 · 一键直达仿真实验推演
          </h1>
          <p style={{ margin: '6px 0 0', color: '#cbd5e1', fontSize: '0.9rem' }}>
            自由定制测试题数与时长，每次随机抽题绝不重样。错题支持一键跳转到微架构/协议实验室仿真推演！
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setViewState(viewState === 'history' ? 'config' : 'history')}
            style={{
              background: viewState === 'history' ? '#4f46e5' : 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📜 测评历史档案 ({examHistory.length})
          </button>
          <button
            onClick={onBackHome}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}
          >
            ← 返回实验大厅
          </button>
        </div>
      </header>

      {/* ================= 视图 1: 组卷配置面板 ================= */}
      {viewState === 'config' && (
        <div className="arena-config-card arena-panel">
          <div className="arena-panel-header">
            <h2 className="arena-panel-title">
              🛠 自定义组卷与考场规则配置
            </h2>
            <p className="arena-panel-desc">
              请根据您的当前复习进度选择评测学科、题量与考试时长，系统将从 408 经典真题库中随机抽取组合试卷。
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
            {/* 1. 学科范围选择 */}
            <div>
              <label className="arena-field-label">
                1. 选择测评科目范围：
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '10px' }}>
                {courseOptions.map(opt => {
                  const isSelected = configCourse === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setConfigCourse(opt.id)}
                      className={`exam-scope-btn ${isSelected ? 'selected' : ''}`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 2. 自由选择每次要考多少题 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label className="arena-field-label" style={{ marginBottom: 0 }}>
                  2. 每次测评题目数量：
                </label>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  当前科目题库可用：<strong style={{ color: '#2563eb' }}>{availableQuestionCount}</strong> 道
                </span>
              </div>

              {/* 快捷题量按钮 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {[
                  { count: 5, label: '5 题 (快速自测)' },
                  { count: 10, label: '10 题 (标准模考 · 推荐)' },
                  { count: 15, label: '15 题 (专项突破)' },
                  { count: 20, label: '20 题 (全真大模拟)' },
                  { count: availableQuestionCount, label: `全部题库 (${availableQuestionCount} 题)` }
                ].filter(item => item.count <= availableQuestionCount).map(item => (
                  <button
                    key={item.count}
                    onClick={() => setQuestionCount(item.count)}
                    className={`exam-chip-btn ${questionCount === item.count ? 'selected' : ''}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* 自定义滑块/数字微调 */}
              <div className="exam-slider-box">
                <span className="exam-slider-label">精细调整题数：</span>
                <input
                  type="range"
                  min={1}
                  max={Math.max(1, availableQuestionCount)}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#2563eb', cursor: 'pointer' }}
                />
                <span style={{ background: '#2563eb', color: '#fff', padding: '3px 12px', borderRadius: '6px', fontWeight: 800, fontSize: '0.9rem' }}>
                  {questionCount} 题
                </span>
              </div>
            </div>

            {/* 3. 自动定义与自定义考试时长 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label className="arena-field-label" style={{ marginBottom: 0 }}>
                  3. 考试倒计时时长设置：
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="autoDurCheck"
                    checked={autoDuration}
                    onChange={(e) => setAutoDuration(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="autoDurCheck" style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}>
                    自动根据题数智能匹配时长 (2分钟/题)
                  </label>
                </div>
              </div>

              <div className={`exam-duration-box ${autoDuration ? 'auto' : 'manual'}`}>
                <span style={{ fontSize: '1.2rem' }}>⏱</span>
                <div style={{ flex: 1 }}>
                  <div className="exam-duration-title">
                    本次考试时长：<span style={{ color: '#16a34a', fontSize: '1.15rem' }}>{durationMinutes} 分钟</span>
                    {autoDuration && <span style={{ color: '#15803d', fontSize: '0.8rem', marginLeft: '8px' }}>(智能自动计算: {questionCount} 题 × 2 分钟)</span>}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                    {autoDuration ? '系统已为您设定 408 标准考场平均答题节奏。如需高压冲刺或宽松练习，可取消勾选上方自动匹配并自定义。' : '当前处于手动自定义模式，您可自由拖动滑块调整考试用时。'}
                  </div>
                </div>

                {!autoDuration && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value)))}
                      className="exam-custom-input"
                    />
                    <span style={{ fontSize: '0.9rem', color: '#475569' }}>分钟</span>
                  </div>
                )}
              </div>
            </div>

            {/* 启动考试大按钮 */}
            <div style={{ paddingTop: '10px' }}>
              <button
                onClick={handleStartExam}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '16px',
                  fontSize: '1.1rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'transform 0.15s'
                }}
              >
                🚀 随机智能组卷 · 立即开始答题 ({questionCount} 题 / {durationMinutes} 分钟)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 视图 2: 考场全真测试中 ================= */}
      {viewState === 'testing' && currentQ && (
        <div>
          {/* 考场状态条 */}
          <div className="exam-status-bar arena-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 10px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 800 }}>
                {configCourse === 'all' ? '全科综合模考' : currentQ.courseName}
              </span>
              <span className="exam-status-text">
                随机抽题 · 第 <strong>{currentIndex + 1}</strong> / {quizQuestions.length} 题
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span className={`exam-countdown-pill ${timeLeft < 120 ? 'urgent' : ''}`}>
                ⏱ 考场倒计时: {formatTime(timeLeft)}
              </span>

              <button
                onClick={handleSubmitPrompt}
                className="exam-submit-header-btn"
              >
                交卷
              </button>
            </div>
          </div>

          {/* 做题主视窗与答题卡 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', alignItems: 'start' }}>
            {/* 左侧：题目交互卡片 */}
            <div className="exam-question-card arena-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '3px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 800 }}>
                    第 {currentIndex + 1} 题
                  </span>
                  <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700 }}>
                    {currentQ.source}
                  </span>
                </div>
                <span className="exam-topic-text">考点：<strong>{currentQ.topic}</strong></span>
              </div>

              {/* 题干 */}
              <h3 className="exam-question-text">
                {currentQ.question}
              </h3>

              {/* 选项组 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = userAnswers[currentQ.id] === oIdx
                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`exam-option-item ${isSelected ? 'selected' : ''}`}
                    >
                      <span className="exam-option-badge">
                        {['A', 'B', 'C', 'D'][oIdx]}
                      </span>
                      <span>{opt}</span>
                    </button>
                  )
                })}
              </div>

              {/* 翻题导航栏 */}
              <div className="exam-nav-bar">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(i => i - 1)}
                  className="exam-nav-btn prev"
                >
                  ← 上一题
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {currentIndex < quizQuestions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIndex(i => i + 1)}
                      className="exam-nav-btn next"
                    >
                      下一题 →
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitPrompt}
                      className="exam-nav-btn submit"
                    >
                      ✔ 交卷并查看诊断
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 右侧：答题卡 */}
            <aside className="exam-sheet-card arena-panel">
              <h4 className="exam-sheet-title">试题答题卡</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
                {quizQuestions.map((q, idx) => {
                  const isAnswered = userAnswers[q.id] !== undefined
                  const isCurrent = idx === currentIndex
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`exam-sheet-btn ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''}`}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>

              <div className="exam-sheet-legend">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="sheet-legend-dot answered"></span>
                  <span>已作答：{Object.keys(userAnswers).length} 题</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <span className="sheet-legend-dot unanswered"></span>
                  <span>未作答：{quizQuestions.length - Object.keys(userAnswers).length} 题</span>
                </div>
              </div>

              <button
                onClick={handleSubmitPrompt}
                className="exam-sheet-submit-btn"
              >
                提交试卷
              </button>
            </aside>
          </div>
        </div>
      )}

      {/* ================= 视图 3: 测评结果与真题剖析 ================= */}
      {viewState === 'result' && viewingRecord && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 得分与诊断卡片 */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderRadius: '16px',
            padding: '28px',
            color: '#fff',
            border: '1px solid #334155',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            gap: '24px',
            alignItems: 'center'
          }}>
            {/* 分数圆形徽标 */}
            <div style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              background: viewingRecord.score >= 80 ? 'rgba(16, 185, 129, 0.2)' : viewingRecord.score >= 60 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              border: viewingRecord.score >= 80 ? '3px solid #10b981' : viewingRecord.score >= 60 ? '3px solid #3b82f6' : '3px solid #ef4444',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: viewingRecord.score >= 80 ? '0 0 20px rgba(16, 185, 129, 0.4)' : '0 0 20px rgba(239, 68, 68, 0.4)'
            }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: viewingRecord.score >= 80 ? '#34d399' : viewingRecord.score >= 60 ? '#60a5fa' : '#f87171', fontFamily: 'monospace' }}>
                {viewingRecord.score}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>满分 100</span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#f8fafc' }}>
                  {viewingRecord.score >= 80 ? '🎉 表现极其优异！408 核心考点掌握扎实' : viewingRecord.score >= 60 ? '👍 良好通过，部分考点细节仍需巩固' : '⚠️ 存在明显考点盲区，建议针对性补强'}
                </h3>
                <span style={{ background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem' }}>
                  答对 {viewingRecord.correctCount} / {viewingRecord.questionCount} 题
                </span>
                <span style={{ background: 'rgba(255,255,255,0.15)', color: '#cbd5e1', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem' }}>
                  耗时 {formatTime(viewingRecord.timeUsedSec)}
                </span>
              </div>
              <p style={{ margin: '8px 0 0', color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.5' }}>
                ✅ <strong>本次测评已自动存入成长档案！</strong>系统已为您标记错题并定位底层硬件/网络实验。点击下方各题的“仿真实验验证”按钮，可直达微观推演！
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={handleStartExam}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  whiteSpace: 'nowrap'
                }}
              >
                🔄 换一批题 · 重新模考
              </button>
              <button
                onClick={() => setViewState('config')}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap'
                }}
              >
                ⚙ 修改题数与设置
              </button>
            </div>
          </div>

          {/* 逐题全解与可视化仿真验证 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="exam-review-heading">
                试卷真题深度剖析与实验推演验证
              </h3>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                错题率：<strong style={{ color: '#ef4444' }}>{Math.round(((viewingRecord.questionCount - viewingRecord.correctCount) / viewingRecord.questionCount) * 100)}%</strong>
              </span>
            </div>

            {viewingRecord.questions.map((q, idx) => {
              const isCorrect = q.isCorrect
              return (
                <div key={q.id} className={`exam-review-card arena-panel ${isCorrect ? 'correct' : 'wrong'}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        background: isCorrect ? '#dcfce7' : '#fee2e2',
                        color: isCorrect ? '#15803d' : '#b91c1c',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 800
                      }}>
                        第 {idx + 1} 题 · {isCorrect ? '回答正确 ✔' : '回答错误 ✖'}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{q.source}</span>
                    </div>

                    <div style={{ fontSize: '0.85rem' }}>
                      <span style={{ color: '#64748b' }}>你的选择：</span>
                      <strong style={{ color: isCorrect ? '#16a34a' : '#dc2626', marginRight: '10px' }}>
                        {q.userAnswer !== undefined ? ['A', 'B', 'C', 'D'][q.userAnswer] : '未作答'}
                      </strong>
                      <span style={{ color: '#64748b' }}>正确答案：</span>
                      <strong style={{ color: '#16a34a' }}>{['A', 'B', 'C', 'D'][q.answer]}</strong>
                    </div>
                  </div>

                  <p className="exam-review-title">
                    {q.question}
                  </p>

                  {/* 详尽名师解析卡片 */}
                  <div className="exam-review-analysis">
                    <strong style={{ color: '#1d4ed8', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>
                      【考点剖析与名师全解】
                    </strong>
                    <div className="exam-analysis-content">
                      {q.explanation}
                    </div>
                  </div>

                  {/* 核心联动：一键直达可视化仿真 */}
                  <div className="exam-review-lab-dock">
                    <div className="dock-tip">
                      💡 <strong>仍有疑惑？</strong>{q.labTip}
                    </div>
                    <button
                      onClick={() => onOpenExperiment(q.experimentId)}
                      className="dock-launch-btn"
                    >
                      🔬 打开【{q.courseName}】仿真实验验证 ➔
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ================= 视图 4: 历次模考档案与成长轨迹 ================= */}
      {viewState === 'history' && (
        <div className="arena-history-panel arena-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <h2 className="arena-panel-title">
                📜 408 测评历史档案与成长轨迹
              </h2>
              <p className="arena-panel-desc">
                系统自动持久化记录您的每一次真题模拟测试，支持随时重查错题与复盘。
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {examHistory.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  style={{
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  清空记录
                </button>
              )}
              <button
                onClick={() => setViewState('config')}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                + 发起新模考
              </button>
            </div>
          </div>

          {/* 历史统计卡片 */}
          {historyStats ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>累计模考场次</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', marginTop: '4px' }}>
                  {historyStats.totalExams} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>场</span>
                </div>
              </div>

              <div className="arena-stat-box">
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>历次平均得分</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2563eb', marginTop: '4px' }}>
                  {historyStats.avgScore} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>分</span>
                </div>
              </div>

              <div className="arena-stat-box">
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>历史最高记录</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#16a34a', marginTop: '4px' }}>
                  {historyStats.maxScore} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>分</span>
                </div>
              </div>

              <div className="arena-stat-box">
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>累计刷题量</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#7c3aed', marginTop: '4px' }}>
                  {historyStats.totalQuestionsDone} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>道</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📝</div>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>暂无历史测评记录，点击上方“发起新模考”开始您的第一次测验！</p>
            </div>
          )}

          {/* 历次记录列表 */}
          {examHistory.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {examHistory.map((rec, rIdx) => (
                <div
                  key={rec.id}
                  className="arena-history-item"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: rec.score >= 80 ? '#dcfce7' : rec.score >= 60 ? '#dbeafe' : '#fee2e2',
                      color: rec.score >= 80 ? '#15803d' : rec.score >= 60 ? '#1d4ed8' : '#b91c1c',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '1rem',
                      fontFamily: 'monospace'
                    }}>
                      {rec.score}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="history-course-title">{rec.courseScope}</span>
                        <span style={{ background: '#e2e8f0', color: '#475569', padding: '1px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>
                          {rec.questionCount} 题
                        </span>
                        {rec.isTimeout && (
                          <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '1px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>
                            超时强制交卷
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                        答对 {rec.correctCount} 题 · 耗时 {formatTime(rec.timeUsedSec)} · 测评时间: {rec.dateStr}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setViewingRecord(rec)
                      setViewState('result')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    style={{
                      background: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    查看答卷与错题 ➔
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
