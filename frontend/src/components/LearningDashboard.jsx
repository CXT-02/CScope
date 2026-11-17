import React, { useState, useMemo } from 'react'
import { calculateStreak, useLearningProfile } from './LearningProfileContext'
import UserProfileManager from './UserProfileManager'

export default function LearningDashboard({ experiments, courses, onOpen, onBack, initialTab = 'profile' }) {
  const { user, records } = useLearningProfile()
  const [activeTab, setActiveTab] = useState(initialTab) // 'profile' (个人中心与设置) | 'analytics' (学情画像与数据)
  const stats = useMemo(() => buildStats(records, experiments, courses), [records, experiments, courses])

  if (!user) {
    return (
      <main className="profile-page">
        <div className="profile-empty">
          <span>◎</span>
          <h1>请先登录账户</h1>
          <p>登录后可体验个人中心资料管理、安全问题验证与个性化学情服务。</p>
          <button type="button" onClick={onBack}>返回控制台</button>
        </div>
      </main>
    )
  }

  return (
    <main className="profile-page">
      {/* 顶部主选项卡切换：个人中心资料 vs 学情数据画像 */}
      <div className="profile-top-switcher-bar">
        <div className="switcher-tabs">
          <button
            type="button"
            className={`switcher-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span>个人中心与安全管理</span>
            <small>资料编辑 · 身份预览 · 安全问题 · 偏好定制</small>
          </button>
          <button
            type="button"
            className={`switcher-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <span>学情数据与能力画像</span>
            <small>掌握度雷达 · 课程进度 · 连续研习</small>
          </button>
        </div>
      </div>

      {activeTab === 'profile' ? (
        /* 1. 深度对标参考图的个人中心与信息管理面板 */
        <UserProfileManager onOpenExperiment={onOpen} />
      ) : (
        /* 2. 学情画像与研习报告 */
        <div className="learning-analytics-container">
          <section className="profile-hero">
            <button className="course-back" type="button" onClick={onBack}>
              ← 返回控制台
            </button>
            <div className="profile-welcome">
              <div className="profile-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  user.name.slice(0, 1).toUpperCase()
                )}
              </div>
              <div>
                <span className="eyebrow">MY LEARNING ANALYTICS</span>
                <h1>{greeting()}，{user.name}</h1>
                <p>
                  {stats.completed
                    ? `你已经完成 ${stats.completed} 个微观实验的完整学习闭环，继续保持！`
                    : '从一个感兴趣的计算机底层实验开始，系统会根据你的做题与操作建立画像。'}
                </p>
              </div>
            </div>

            <div className="profile-summary">
              <div>
                <span>实验推演</span>
                <strong>{stats.visits}</strong>
                <small>次访问</small>
              </div>
              <div>
                <span>完成实验</span>
                <strong>{stats.completed}</strong>
                <small>/ {experiments.length} 项</small>
              </div>
              <div>
                <span>连续研习</span>
                <strong>{stats.streak}</strong>
                <small>天打卡</small>
              </div>
              <div>
                <span>总结心得</span>
                <strong>{stats.reflections}</strong>
                <small>篇沉淀</small>
              </div>
            </div>
          </section>

          <section className="profile-content">
            <div className="profile-section-heading">
              <div>
                <span className="eyebrow">PERSONALIZED PATH</span>
                <h2>AI 为你规划下一步突破</h2>
              </div>
              <p>{stats.recommendationReason}</p>
            </div>

            <div className="recommendation-grid">
              {stats.recommended.map((item, index) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => onOpen(item.id)}
                  style={{ '--recommend-accent': item.accent }}
                >
                  <span>推荐 {index + 1}</span>
                  <i>{item.icon}</i>
                  <strong>{item.title}</strong>
                  <p>{item.reason}</p>
                  <b>开始推演 →</b>
                </button>
              ))}
            </div>

            <div className="profile-columns">
              <section className="course-progress-panel">
                <div className="profile-section-heading">
                  <div>
                    <span className="eyebrow">COURSE PROGRESS</span>
                    <h2>408 核心课程知识掌握度</h2>
                  </div>
                </div>
                {stats.courseStats.map((course) => (
                  <div className="course-progress-row" key={course.id}>
                    <span className="course-progress-icon" style={{ background: course.accent }}>
                      {course.icon}
                    </span>
                    <div>
                      <strong>{course.title}</strong>
                      <small>
                        {course.visits} 次推演 · {course.completed}/{course.total} 项达标
                      </small>
                      <i>
                        <b style={{ width: `${course.progress}%`, background: course.accent }} />
                      </i>
                    </div>
                    <em>{course.progress}%</em>
                  </div>
                ))}
              </section>

              <section className="recent-panel">
                <div className="profile-section-heading">
                  <div>
                    <span className="eyebrow">RECENT ACTIVITY</span>
                    <h2>近期研习足迹</h2>
                  </div>
                </div>
                {stats.recent.length ? (
                  stats.recent.map((item) => (
                    <button type="button" key={item.id} onClick={() => onOpen(item.id)}>
                      <i style={{ background: item.accent }}>{item.icon}</i>
                      <span>
                        <strong>{item.title}</strong>
                        <small>
                          {relativeTime(item.lastAt)} · 已推演 {item.visits} 次
                        </small>
                      </span>
                      <b>{item.completed ? '已掌握 ✓' : '继续推演 →'}</b>
                    </button>
                  ))
                ) : (
                  <div className="recent-empty">还没有实验学习记录，先选择一个实验吧。</div>
                )}
              </section>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export function getPersonalRecommendations(records, experiments, courses, limit = 3) {
  const entries = records.experiments || {}
  const courseVisits = courses.reduce(
    (map, course) => ({
      ...map,
      [course.id]: course.points.reduce((sum, point) => sum + (entries[point.experimentId]?.visits || 0), 0)
    }),
    {}
  )
  return [...experiments]
    .map((experiment, index) => {
      const record = entries[experiment.id] || {}
      const course = courses.find((item) => item.id === experiment.courseId)
      let score = 0
      let reason = '尚未学习，适合拓展新的底层知识方向'
      if (record.visits && !record.completed) {
        score = 100 + Math.min(record.visits, 5)
        reason = `已经推演 ${record.visits} 次，但还未完成理解总结`
      } else if (record.completed) {
        score = 10 - record.visits
        reason = '已经完成，可用于间隔复习巩固微架构记忆'
      } else {
        const visits = courseVisits[experiment.courseId] || 0
        score = 70 - visits + (24 - index) / 100
        reason = visits ? `延续你在“${course?.title}”中的研学路径` : '尚未推演，适合拓展新的知识方向'
      }
      return { ...experiment, score, reason }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

function buildStats(records, experiments, courses) {
  const entries = records.experiments || {}
  const values = Object.values(entries)
  const recommended = getPersonalRecommendations(records, experiments, courses)
  const courseStats = courses.map((course) => {
    const courseEntries = course.points.map((point) => entries[point.experimentId] || {})
    const completed = courseEntries.filter((item) => item.completed).length
    return {
      ...course,
      visits: courseEntries.reduce((sum, item) => sum + (item.visits || 0), 0),
      completed,
      total: course.points.length,
      progress: Math.round((completed / course.points.length) * 100)
    }
  })
  const recent = experiments
    .map((experiment) => ({
      ...experiment,
      ...(entries[experiment.id] || {}),
      lastAt: entries[experiment.id]?.lastActivityAt || entries[experiment.id]?.lastVisitAt
    }))
    .filter((item) => item.lastAt)
    .sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt))
    .slice(0, 6)

  return {
    visits: values.reduce((sum, item) => sum + (item.visits || 0), 0),
    completed: values.filter((item) => item.completed).length,
    reflections: values.filter((item) => item.reflectionSaved).length,
    streak: calculateStreak(records.studyDates),
    recommended,
    courseStats,
    recent,
    recommendationReason: values.length
      ? '优先安排推演过但尚未深入总结的实验，再逐步突破薄弱考点。'
      : '根据课程结构为你安排三个适合起步的微观仿真实验。'
  }
}

function greeting() {
  const hour = new Date().getHours()
  return hour < 11 ? '早上好' : hour < 18 ? '下午好' : '晚上好'
}

function relativeTime(value) {
  const diff = Date.now() - new Date(value).getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  return `${Math.floor(diff / 86400000)} 天前`
}
