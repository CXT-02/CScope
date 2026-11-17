import React, { useState, useMemo, useEffect } from 'react'
import { experiments, courses } from '../lib/experimentRegistry'

export default function ExperimentWorkshop({ onOpenExperiment, initialSubject = 'all' }) {
  const [subjectFilter, setSubjectFilter] = useState(initialSubject)
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (initialSubject) {
      setSubjectFilter(initialSubject)
    }
  }, [initialSubject])

  const subjectTabs = useMemo(() => {
    const counts = { all: experiments.length }
    experiments.forEach((e) => {
      counts[e.courseId] = (counts[e.courseId] || 0) + 1
    })
    return [
      { key: 'all', label: `全部学科 (${counts.all || 25})` },
      { key: 'computer-organization', label: `计算机组成原理 (${counts['computer-organization'] || 0})` },
      { key: 'operating-systems', label: `操作系统 (${counts['operating-systems'] || 0})` },
      { key: 'networks', label: `计算机网络 (${counts['networks'] || 0})` },
      { key: 'data-structures', label: `数据结构与算法 (${counts['data-structures'] || 0})` },
      { key: 'databases', label: `数据库系统 (${counts['databases'] || 0})` },
      { key: 'ai', label: `人工智能与前沿 (${counts['ai'] || 0})` },
    ]
  }, [])

  const enrichedExperiments = useMemo(() => {
    return experiments.map((exp) => {
      const course = courses.find(c => c.id === exp.courseId)
      // 为每个实验赋予难度与考频评级
      let difficulty = '核心重难点'
      let stars = '⭐⭐⭐⭐⭐'
      if (['sorting', 'stack-queue', 'ip-subnet'].includes(exp.id)) {
        difficulty = '基础基石'
        stars = '⭐⭐⭐⭐'
      } else if (['cpu-pipeline', 'cache-mapping', 'deadlock', 'sync', 'page-replacement', 'tcp-connection', 'sliding-window'].includes(exp.id)) {
        difficulty = '408 必考压轴'
        stars = '⭐⭐⭐⭐⭐'
      } else if (['attention', 'neural-network', 'gradient-descent', 'transactions'].includes(exp.id)) {
        difficulty = '前沿高阶'
        stars = '⭐⭐⭐⭐'
      }

      return {
        ...exp,
        courseTitle: course ? course.title : '计算机专业课',
        difficulty,
        stars
      }
    })
  }, [])

  const filteredList = useMemo(() => {
    return enrichedExperiments.filter(item => {
      if (subjectFilter !== 'all' && item.courseId !== subjectFilter) return false
      if (difficultyFilter !== 'all' && item.difficulty !== difficultyFilter) return false
      if (search.trim()) {
        const query = search.toLowerCase()
        return (
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.courseTitle.toLowerCase().includes(query) ||
          (item.concepts && item.concepts.some(c => c.toLowerCase().includes(query)))
        )
      }
      return true
    })
  }, [enrichedExperiments, subjectFilter, difficultyFilter, search])

  return (
    <div className="experiment-workshop-page">
      {/* 顶部标题与工坊简介 */}
      <header className="workshop-header">
        <div>
          <div className="workshop-pill-tag">MICRO-SIMULATION WORKSHOP</div>
          <h1>微观交互仿真工坊 · 25 门底层实验全景</h1>
          <p className="workshop-desc">
            从时钟级微架构流水线、Cache 冲突颠簸、到死锁银行家算法与 Transformer 注意力，把抽象代码与硬件时序变成可暂停、可调参的动态推演。
          </p>
        </div>

        <div className="workshop-stats-pill">
          <div className="pill-item">
            <strong>25</strong>
            <span>交互仿真</span>
          </div>
          <div className="pill-sep" />
          <div className="pill-item">
            <strong>8</strong>
            <span>专业学科</span>
          </div>
          <div className="pill-sep" />
          <div className="pill-item">
            <strong>100%</strong>
            <span>408 考点对齐</span>
          </div>
        </div>
      </header>

      {/* 筛选与检索栏 */}
      <div className="workshop-filter-bar">
        {/* 学科分类 */}
        <div className="filter-subject-tabs">
          {subjectTabs.map((sub) => (
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

        {/* 难度与搜索 */}
        <div className="filter-right-tools">
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="difficulty-select"
          >
            <option value="all">全部考频难度</option>
            <option value="408 必考压轴">408 必考压轴</option>
            <option value="核心重难点">核心重难点</option>
            <option value="基础基石">基础基石</option>
            <option value="前沿高阶">前沿高阶</option>
          </select>

          <div className="workshop-search-box">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索实验名称、时钟周期、算法关键词..."
            />
          </div>
        </div>
      </div>

      {/* 实验卡片大网格 */}
      {filteredList.length === 0 ? (
        <div className="workshop-empty-state" style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px', margin: '20px 0', border: '1px dashed #cbd5e1' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
          <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '8px' }}>未找到匹配的底层仿真实验</h3>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '18px' }}>
            没有找到符合当前学科或关键词的实验，建议调整学科分类或清空搜索条件。
          </p>
          <button
            type="button"
            className="filter-btn active"
            style={{ padding: '8px 18px', borderRadius: '8px', cursor: 'pointer' }}
            onClick={() => {
              setSubjectFilter('all')
              setDifficultyFilter('all')
              setSearch('')
            }}
          >
            重置所有筛选条件
          </button>
        </div>
      ) : (
        <div className="workshop-grid">
          {filteredList.map((exp) => (
            <div
              key={exp.id}
              className="workshop-card"
              style={{ '--card-accent': exp.accent || '#4f46e5' }}
              onClick={() => onOpenExperiment(exp.id)}
            >
              <div className="workshop-card-top">
                <span className="course-tag">{exp.courseTitle}</span>
                <span className="diff-tag">{exp.difficulty}</span>
              </div>

              <div className="card-center-icon" style={{ background: exp.accent || '#4f46e5' }}>
                <span>{exp.icon || '🔬'}</span>
              </div>

              <h3 className="workshop-card-title">{exp.title}</h3>
              <p className="workshop-card-desc">{exp.description}</p>

              {/* 核心概念标签 */}
              {exp.concepts && (
                <div className="card-concept-pills">
                  {exp.concepts.slice(0, 3).map((c, cIdx) => (
                    <span key={cIdx} className="concept-pill">{c}</span>
                  ))}
                </div>
              )}

              <div className="workshop-card-footer">
                <div className="stars-rate">
                  <span>考频：</span>
                  <strong>{exp.stars}</strong>
                </div>
                <button type="button" className="start-lab-btn">
                  启动推演 →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
