import React, { useState, useEffect, useMemo } from 'react'
import { EXAM_QUESTIONS } from '../lib/examRegistry'

export default function ExamArena({ onOpenExperiment, onBackHome }) {
  const [filterCourse, setFilterCourse] = useState('all')
  const [mode, setMode] = useState('all') // 'all' | 'adaptive'
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({}) // { [qId]: optionIndex }
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(1200) // 20 分钟

  // 过滤后的题库列表
  const activeQuestions = useMemo(() => {
    let list = EXAM_QUESTIONS
    if (filterCourse !== 'all') {
      list = list.filter(q => q.courseId === filterCourse)
    }
    if (mode === 'adaptive') {
      // 随机精选 5 题自适应小测
      return list.slice(0, 5)
    }
    return list
  }, [filterCourse, mode])

  // 倒计时计时器
  useEffect(() => {
    if (submitted) return
    const timer = setInterval(() => {
      setTimeLeft(t => (t > 0 ? t - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [submitted])

  // 格式化倒计时
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const currentQ = activeQuestions[currentIndex] || activeQuestions[0]

  // 选择选项
  const handleSelect = (optionIdx) => {
    if (submitted) return
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionIdx
    }))
  }

  // 提交并生成诊断
  const handleSubmit = () => {
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 重新开始
  const handleRestart = () => {
    setUserAnswers({})
    setSubmitted(false)
    setCurrentIndex(0)
    setTimeLeft(1200)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 成绩统计
  const stats = useMemo(() => {
    let correct = 0
    let total = activeQuestions.length
    const courseStats = {}

    activeQuestions.forEach(q => {
      const isCorrect = userAnswers[q.id] === q.answer
      if (isCorrect) correct += 1

      if (!courseStats[q.courseName]) {
        courseStats[q.courseName] = { total: 0, correct: 0 }
      }
      courseStats[q.courseName].total += 1
      if (isCorrect) courseStats[q.courseName].correct += 1
    })

    const score = total > 0 ? Math.round((correct / total) * 100) : 0
    return { correct, total, score, courseStats }
  }, [activeQuestions, userAnswers])

  return (
    <div className="exam-arena-container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
      {/* 顶部介绍头图栏 */}
      <header style={{
        background: 'linear-gradient(135deg, #1e1b4b, #0f172a)',
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
              408 考研真题与专项测评中心
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>全国硕士统考高频计算与抽象算法真题集</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', color: '#f8fafc', fontWeight: 900 }}>
            做真题 · 测弱项 · 一键直达仿真实验推演
          </h1>
          <p style={{ margin: '6px 0 0', color: '#cbd5e1', fontSize: '0.9rem' }}>
            题目做错或理解不透？系统独创“真题 ➔ 可视化实验靶向跳转”，将真题参数直接导入交互仿真平台！
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
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

      {/* 筛选与模式控制条 */}
      {!submitted && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ffffff',
          padding: '12px 18px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 'bold', color: '#475569' }}>学科筛选：</span>
            {[
              { id: 'all', label: '全部学科 (综合模考)' },
              { id: 'computer-organization', label: '计组 408' },
              { id: 'operating-systems', label: '操作系统 408' },
              { id: 'networks', label: '计算机网络 408' },
              { id: 'data-structures', label: '数据结构 408' },
              { id: 'databases', label: '数据库系统' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setFilterCourse(tab.id); setCurrentIndex(0) }}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  border: filterCourse === tab.id ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  background: filterCourse === tab.id ? '#eff6ff' : '#fff',
                  color: filterCourse === tab.id ? '#1d4ed8' : '#64748b',
                  fontWeight: filterCourse === tab.id ? 800 : 500,
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{
              background: timeLeft < 300 ? '#fee2e2' : '#f1f5f9',
              color: timeLeft < 300 ? '#dc2626' : '#1e293b',
              padding: '4px 12px',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontWeight: 800,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              ⏱ 考场倒计时: {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      )}

      {/* 做题主视图与答题卡 */}
      {!submitted ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>
          {/* 左侧：题目交互卡片 */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 800 }}>
                  第 {currentIndex + 1} 题 / 共 {activeQuestions.length} 题
                </span>
                <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700 }}>
                  {currentQ.source}
                </span>
              </div>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>考点：{currentQ.topic}</span>
            </div>

            {/* 题干 */}
            <h3 style={{ fontSize: '1.05rem', lineHeight: '1.7', color: '#0f172a', margin: '0 0 20px', whiteSpace: 'pre-line' }}>
              {currentQ.question}
            </h3>

            {/* 选项组 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = userAnswers[currentQ.id] === oIdx
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelect(oIdx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      textAlign: 'left',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: isSelected ? '#eff6ff' : '#f8fafc',
                      color: isSelected ? '#1e40af' : '#334155',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      fontSize: '0.92rem',
                      transition: 'all 0.2s',
                      gap: '12px'
                    }}
                  >
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: isSelected ? '#2563eb' : '#e2e8f0',
                      color: isSelected ? '#fff' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      flexShrink: 0
                    }}>
                      {['A', 'B', 'C', 'D'][oIdx]}
                    </span>
                    <span>{opt}</span>
                  </button>
                )
              })}
            </div>

            {/* 翻题按钮栏 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(i => i - 1)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                  color: currentIndex === 0 ? '#94a3b8' : '#334155'
                }}
              >
                ← 上一题
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                {currentIndex < activeQuestions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex(i => i + 1)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '6px',
                      background: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    下一题 →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    style={{
                      padding: '8px 24px',
                      borderRadius: '6px',
                      background: '#16a34a',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '0.95rem'
                    }}
                  >
                    ✔ 交卷并查看诊断报告
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：答题卡与交卷 */}
          <aside style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', color: '#1e293b' }}>试题答题卡</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
              {activeQuestions.map((q, idx) => {
                const isAnswered = userAnswers[q.id] !== undefined
                const isCurrent = idx === currentIndex
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    style={{
                      width: '100%',
                      padding: '8px 0',
                      borderRadius: '6px',
                      border: isCurrent ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: isAnswered ? '#dbeafe' : '#f8fafc',
                      color: isAnswered ? '#1d4ed8' : '#64748b',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>

            <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.6', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#dbeafe', display: 'inline-block' }}></span>
                <span>已作答：{Object.keys(userAnswers).length} 题</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f8fafc', border: '1px solid #cbd5e1', display: 'inline-block' }}></span>
                <span>未作答：{activeQuestions.length - Object.keys(userAnswers).length} 题</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '8px',
                background: '#16a34a',
                color: '#fff',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.92rem'
              }}
            >
              提交试卷
            </button>
          </aside>
        </div>
      ) : (
        /* 提交后的评测与学情诊断报告 */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 得分卡片 */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            borderRadius: '16px',
            padding: '28px',
            color: '#fff',
            border: '1px solid #334155',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            gap: '24px',
            alignItems: 'center'
          }}>
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: stats.score >= 80 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              border: stats.score >= 80 ? '3px solid #10b981' : '3px solid #ef4444',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: stats.score >= 80 ? '0 0 20px rgba(16, 185, 129, 0.4)' : '0 0 20px rgba(239, 68, 68, 0.4)'
            }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 900, color: stats.score >= 80 ? '#34d399' : '#f87171', fontFamily: 'monospace' }}>
                {stats.score}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>满分 100</span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#f8fafc' }}>
                  {stats.score >= 80 ? '🎉 表现优异！考点掌握扎实' : stats.score >= 60 ? '👍 良好通过，部分知识点仍需巩固' : '⚠️ 存在明显考点盲区，建议针对性补强'}
                </h3>
                <span style={{ background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem' }}>
                  答对 {stats.correct} / {stats.total} 题
                </span>
              </div>
              <p style={{ margin: '8px 0 0', color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.5' }}>
                系统已为你分析错题并定位到相关底层硬件与协议模块。点击各题下方的“直达实验室”按钮，可以直接调起参数化交互仿真！
              </p>
            </div>

            <div>
              <button
                onClick={handleRestart}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                🔄 重新模考
              </button>
            </div>
          </div>

          {/* 逐题解析与靶向跳转 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: '8px 0 0', fontSize: '1.15rem', color: '#1e293b' }}>真题全解与考点仿真验证</h3>
            {activeQuestions.map((q, idx) => {
              const userAns = userAnswers[q.id]
              const isCorrect = userAns === q.answer
              return (
                <div key={q.id} style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: isCorrect ? '1.5px solid #bbf7d0' : '1.5px solid #fecaca',
                  padding: '20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        background: isCorrect ? '#dcfce7' : '#fee2e2',
                        color: isCorrect ? '#15803d' : '#b91c1c',
                        padding: '2px 8px',
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
                        {userAns !== undefined ? ['A', 'B', 'C', 'D'][userAns] : '未答'}
                      </strong>
                      <span style={{ color: '#64748b' }}>正确答案：</span>
                      <strong style={{ color: '#16a34a' }}>{['A', 'B', 'C', 'D'][q.answer]}</strong>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: 600, margin: '8px 0 14px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                    {q.question}
                  </p>

                  {/* 详尽解析卡片 */}
                  <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginBottom: '12px' }}>
                    <strong style={{ color: '#1d4ed8', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>
                      【考点剖析与名师全解】
                    </strong>
                    <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.6' }}>
                      {q.explanation}
                    </div>
                  </div>

                  {/* 核心杀手锏：一键直达可视化实验推演 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#eff6ff',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #bfdbfe'
                  }}>
                    <div style={{ fontSize: '0.82rem', color: '#1e40af' }}>
                      💡 <strong>仍有疑惑？</strong>{q.labTip}
                    </div>
                    <button
                      onClick={() => onOpenExperiment(q.experimentId)}
                      style={{
                        background: '#2563eb',
                        color: '#fff',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
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
    </div>
  )
}
