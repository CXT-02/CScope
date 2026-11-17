import React, { useState, useMemo } from 'react'
import { EXAM_QUESTIONS } from '../lib/examRegistry'

const DEFAULT_MISTAKES = [
  {
    id: 'm_preset_1',
    subject: '计算机组成原理',
    courseId: 'arch',
    year: '2023 统考真题',
    title: '设某 Cache 采用 4 路组相联映射，Cache 容量为 64KB，主存块大小为 64B。若主存地址为 32 位，则该主存地址中的 Tag（主存字块标记）位数为多少位？',
    options: ['16 位', '18 位', '20 位', '22 位'],
    userAnswer: 2,
    correctAnswer: 1,
    analysis: 'Cache 块数 = 64KB / 64B = 1024 块；因为是 4 路组相联，所以组数 = 1024 / 4 = 256 组，组内块数占 8 位（2^8 = 256）。主存块大小 64B，块内偏移占 6 位（2^6 = 64）。主存总地址为 32 位，则 Tag 位数 = 32 - 8 - 6 = 18 位。',
    labId: 'cache-mapping',
    labTitle: 'Cache 映射与命中颠簸实验',
    isMastered: false,
    isStarred: true
  },
  {
    id: 'm_preset_2',
    subject: '计算机组成原理',
    courseId: 'arch',
    year: '2022 统考真题',
    title: '在一条 5 段指令流水线（IF、ID、EX、MEM、WB）中，假设不存在分支跳转，只有相邻指令发生写后读（RAW）数据相关。若无数据旁路转发，需要插入几个时钟周期的停顿气泡？',
    options: ['1 个时钟周期', '2 个时钟周期', '3 个时钟周期', '4 个时钟周期'],
    userAnswer: 0,
    correctAnswer: 1,
    analysis: '在无数据旁路转发（Forwarding）的标准流水线中，前一条指令在 WB 阶段写回寄存器，后一条指令在 ID 阶段读取寄存器。两者相隔 EX、MEM 两个完整阶段，因此必须插入 2 个时钟周期的空泡（Stall）才能确保读到最新计算值。',
    labId: 'cpu-pipeline',
    labTitle: 'CPU 五级时钟流水线实验',
    isMastered: false,
    isStarred: false
  },
  {
    id: 'm_preset_3',
    subject: '计算机网络',
    courseId: 'net',
    year: '2021 统考真题',
    title: '主机甲向主机乙发送数据，双方建立了 TCP 连接。若初始拥塞窗口 cwnd = 1 MSS，慢开始门限 ssthresh = 16 MSS。在不发生丢包和超时的理想情况下，经过几个 RTT 后 cwnd 达到 16 MSS？',
    options: ['3 个 RTT', '4 个 RTT', '5 个 RTT', '6 个 RTT'],
    userAnswer: 2,
    correctAnswer: 1,
    analysis: '在慢开始阶段，每经过一个往返时间 RTT，拥塞窗口 cwnd 翻倍增长：第 0 轮 cwnd = 1，第 1 轮 cwnd = 2，第 2 轮 cwnd = 4，第 3 轮 cwnd = 8，第 4 轮 cwnd = 16 MSS，恰好达到慢开始门限 ssthresh。因此共经历 4 个 RTT。',
    labId: 'tcp-connection',
    labTitle: 'TCP 全双工连接与滑动窗口实验',
    isMastered: false,
    isStarred: true
  },
  {
    id: 'm_preset_4',
    subject: '操作系统',
    courseId: 'os',
    year: '2020 统考真题',
    title: '某系统中有 3 个并发进程分别需要 3、4、5 台同类打印机资源。为保证系统绝对不会发生死锁，系统至少需要提供多少台该类打印机？',
    options: ['9 台', '10 台', '11 台', '12 台'],
    userAnswer: 0,
    correctAnswer: 1,
    analysis: '极端死锁临界条件是所有进程都拿到各自最大需求减 1 台资源：(3-1) + (4-1) + (5-1) = 2 + 3 + 4 = 9 台。此时系统处于死锁边缘；只要再多提供 1 台资源（即 9 + 1 = 10 台），就必然至少能满足一个进程顺利执行完毕并释放全部资源，打破循环等待，保证绝不死锁。',
    labId: 'deadlock',
    labTitle: '死锁避免与银行家算法实验',
    isMastered: false,
    isStarred: false
  }
]

export default function MistakeNotebook({ onOpenExperiment }) {
  const [subjectFilter, setSubjectFilter] = useState('all') // 'all' | 'arch' | 'os' | 'net' | 'ds'
  const [tabFilter, setTabFilter] = useState('all') // 'all' | 'unmastered' | 'starred'
  const [searchWord, setSearchWord] = useState('')

  // 本地持久化错题状态（标记已掌握/收藏）
  const [items, setItems] = useState(() => {
    // 从考试记录合并真实错题
    try {
      const examSaved = localStorage.getItem('408_exam_records_v1')
      const records = examSaved ? JSON.parse(examSaved) : []
      const realMistakes = []

      records.forEach(rec => {
        if (rec.questions) {
          rec.questions.forEach(q => {
            if (!q.isCorrect && !realMistakes.some(m => m.title === q.title)) {
              realMistakes.push({
                id: `real_${q.id}`,
                subject: q.courseName || '408 统考真题',
                courseId: q.courseId || 'arch',
                year: q.year || '历年真题',
                title: q.title,
                options: q.options,
                userAnswer: q.userAnswer ?? 0,
                correctAnswer: q.answer,
                analysis: q.analysis || '暂无详细解析',
                labId: q.labId || 'cpu-pipeline',
                labTitle: q.labTitle || '微观仿真实验',
                isMastered: false,
                isStarred: false
              })
            }
          })
        }
      })

      if (realMistakes.length > 0) {
        return [...realMistakes, ...DEFAULT_MISTAKES]
      }
    } catch {}
    return DEFAULT_MISTAKES
  })

  // 切换掌握状态
  const toggleMaster = (id) => {
    setItems(items.map(it => it.id === id ? { ...it, isMastered: !it.isMastered } : it))
  }

  // 切换收藏状态
  const toggleStar = (id) => {
    setItems(items.map(it => it.id === id ? { ...it, isStarred: !it.isStarred } : it))
  }

  // 过滤错题列表
  const filteredList = useMemo(() => {
    return items.filter(it => {
      if (subjectFilter !== 'all' && it.courseId !== subjectFilter) return false
      if (tabFilter === 'unmastered' && it.isMastered) return false
      if (tabFilter === 'starred' && !it.isStarred) return false
      if (searchWord.trim()) {
        const query = searchWord.toLowerCase()
        return it.title.toLowerCase().includes(query) || it.analysis.toLowerCase().includes(query)
      }
      return true
    })
  }, [items, subjectFilter, tabFilter, searchWord])

  const stats = useMemo(() => {
    const total = items.length
    const mastered = items.filter(i => i.isMastered).length
    const starred = items.filter(i => i.isStarred).length
    return {
      total,
      unmastered: total - mastered,
      mastered,
      starred
    }
  }, [items])

  return (
    <div className="mistake-notebook-page">
      {/* 顶部标头 */}
      <header className="mistake-header">
        <div>
          <div className="mistake-badge-pill">408 ADAPTIVE MISTAKE REPOSITORY</div>
          <h1>靶向错题本 · 实验联动消错</h1>
          <p className="mistake-subtitle">
            不仅仅是背诵标准答案。错题直接与 <strong>微观交互仿真实验</strong> 绑定，通过可观测的单步推演彻底根除盲区。
          </p>
        </div>

        {/* 错题统计数据简报 */}
        <div className="mistake-stats-bar">
          <div className="stat-cell">
            <span>待攻克错题</span>
            <strong className="warn">{stats.unmastered}</strong>
          </div>
          <div className="stat-sep" />
          <div className="stat-cell">
            <span>已完全掌握</span>
            <strong className="success">{stats.mastered}</strong>
          </div>
          <div className="stat-sep" />
          <div className="stat-cell">
            <span>重点收藏</span>
            <strong className="star">{stats.starred}</strong>
          </div>
        </div>
      </header>

      {/* 控制栏：科目筛选 + 状态 Tab + 搜索 */}
      <div className="mistake-controls-bar">
        {/* 学科筛选 */}
        <div className="subject-filter-group">
          {[
            { key: 'all', label: '全部学科' },
            { key: 'arch', label: '计算机组成原理' },
            { key: 'os', label: '操作系统' },
            { key: 'net', label: '计算机网络' },
            { key: 'ds', label: '数据结构与算法' }
          ].map(sub => (
            <button
              key={sub.key}
              type="button"
              className={`filter-btn ${subjectFilter === sub.key ? 'active' : ''}`}
              onClick={() => setSubjectFilter(sub.key)}
            >
              {sub.label}
            </button>
          ))}
        </div>

        {/* 状态与搜索 */}
        <div className="right-tools-group">
          <div className="status-tab-group">
            <button
              type="button"
              className={tabFilter === 'all' ? 'active' : ''}
              onClick={() => setTabFilter('all')}
            >
              全部 ({stats.total})
            </button>
            <button
              type="button"
              className={tabFilter === 'unmastered' ? 'active' : ''}
              onClick={() => setTabFilter('unmastered')}
            >
              待消灭 ({stats.unmastered})
            </button>
            <button
              type="button"
              className={tabFilter === 'starred' ? 'active' : ''}
              onClick={() => setTabFilter('starred')}
            >
              ⭐ 收藏 ({stats.starred})
            </button>
          </div>

          <div className="search-input-wrap">
            <input
              type="text"
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              placeholder="搜索错题关键词或考点..."
            />
          </div>
        </div>
      </div>

      {/* 错题卡片列表 */}
      <div className="mistake-cards-list">
        {filteredList.length > 0 ? (
          filteredList.map((item, idx) => (
            <div key={item.id} className={`mistake-card ${item.isMastered ? 'mastered' : ''}`}>
              <div className="mistake-card-top">
                <div className="tags-row">
                  <span className="exam-year-tag">{item.year}</span>
                  <span className="subject-tag">{item.subject}</span>
                  {item.isMastered && <span className="mastered-badge">✓ 已攻克</span>}
                </div>
                <div className="card-actions">
                  <button
                    type="button"
                    className={`star-btn ${item.isStarred ? 'starred' : ''}`}
                    onClick={() => toggleStar(item.id)}
                    title={item.isStarred ? '取消收藏' : '加入收藏'}
                  >
                    {item.isStarred ? '★ 重点考点' : '☆ 收藏'}
                  </button>
                  <button
                    type="button"
                    className={`master-btn ${item.isMastered ? 'mastered' : ''}`}
                    onClick={() => toggleMaster(item.id)}
                  >
                    {item.isMastered ? '设为待复盘' : '标为已攻克'}
                  </button>
                </div>
              </div>

              {/* 题干 */}
              <h3 className="mistake-question-title">
                <span className="idx-num">{idx + 1}.</span> {item.title}
              </h3>

              {/* 选项比对 */}
              <div className="options-comparison-grid">
                {item.options.map((opt, oIdx) => {
                  const isUserPick = item.userAnswer === oIdx
                  const isRight = item.correctAnswer === oIdx
                  let statusClass = ''
                  if (isRight) statusClass = 'correct-opt'
                  else if (isUserPick) statusClass = 'wrong-opt'

                  return (
                    <div key={oIdx} className={`option-compare-item ${statusClass}`}>
                      <span className="opt-letter">{String.fromCharCode(65 + oIdx)}.</span>
                      <span className="opt-text">{opt}</span>
                      {isRight && <span className="opt-badge right">正确答案</span>}
                      {isUserPick && !isRight && <span className="opt-badge wrong">当时错选</span>}
                    </div>
                  )
                })}
              </div>

              {/* 深入解析 */}
              <div className="mistake-analysis-box">
                <div className="analysis-title">
                  <span className="analysis-badge">考点剖析</span>
                  <strong>考点深度剖析与防坑指南：</strong>
                </div>
                <p>{item.analysis}</p>
              </div>

              {/* 核心亮点：直达微观仿真实验推演 */}
              <div className="mistake-lab-dock">
                <div className="dock-left">
                  <span className="dock-lab-badge">微观仿真</span>
                  <div>
                    <strong>推演该考点对应的计算机物理时序：</strong>
                    <span>【{item.labTitle}】</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="jump-lab-btn"
                  onClick={() => onOpenExperiment(item.labId)}
                >
                  立即启动仿真实验推演 →
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-mistake-state">
            <h3>暂无符合筛选条件的错题</h3>
            <p>在 408 测评中心完成模考后，系统会自动为您归档做错的考题与仿真实验映射！</p>
          </div>
        )}
      </div>
    </div>
  )
}
