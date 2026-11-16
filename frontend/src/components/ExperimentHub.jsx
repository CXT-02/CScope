import React, { useMemo, useState } from 'react'
import { useLearningProfile } from './LearningProfileContext'
import { getPersonalRecommendations } from './LearningDashboard'
import { experiments } from '../lib/experimentRegistry'

export default function ExperimentHub({ courses, activeCourseId, onOpen, onSelectCourse, onBack, onShowProfile, onLogin }) {
  const { user, records } = useLearningProfile()
  const activeCourse = courses.find((course) => course.id === activeCourseId)
  if (activeCourse) return <CourseDetail course={activeCourse} onOpen={onOpen} onBack={onBack} records={records} />
  return <CourseCatalog courses={courses} onOpen={onOpen} onSelectCourse={onSelectCourse} user={user} records={records} onShowProfile={onShowProfile} onLogin={onLogin} />
}

function CourseCatalog({ courses, onOpen, onSelectCourse, user, records, onShowProfile, onLogin }) {
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const matches = useMemo(() => {
    if (!normalizedQuery) return []
    return courses.flatMap((course) => course.points.map((point) => ({ course, point }))).filter(({ course, point }) => (
      [course.title, course.english, ...course.tags, point.title, point.description, ...point.keywords]
        .join(' ').toLocaleLowerCase().includes(normalizedQuery)
    ))
  }, [courses, normalizedQuery])

  function chooseResult(course, point) {
    if (point.available) onOpen(point.experimentId)
    else onSelectCourse(course.id)
  }

  // 滚动至课程知识库
  const scrollToCourses = () => {
    const el = document.getElementById('course-library-section')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="course-home">
      {/* 顶部英雄区 */}
      <section className="course-hero">
        <div className="course-hero-copy">
          <span className="eyebrow">CSCOPE · 可视化计算机学习实验室</span>
          <h1>今天想看懂<br /><em>哪门计算机课程？</em></h1>
          <p>从课程进入知识地图，选择一个知识点，让抽象原理在眼前一步步运行。</p>
          <div className={`course-search ${query ? 'has-query' : ''}`}>
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索知识点，例如：注意力、最短路径、进程调度…" aria-label="搜索课程和知识点" />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="清除搜索">×</button>}
          </div>
          {normalizedQuery && (
            <div className="search-results" role="listbox" aria-label="搜索结果">
              <div className="search-summary">找到 {matches.length} 个相关知识点</div>
              {matches.length ? matches.slice(0, 8).map(({ course, point }) => (
                <button type="button" key={`${course.id}-${point.title}`} onClick={() => chooseResult(course, point)}>
                  <span className="search-course-dot" style={{ background: course.accent }}>{course.icon}</span>
                  <span><strong>{point.title}</strong><small>{course.title} · {point.description}</small></span>
                  <i className={point.available ? 'ready' : ''}>{point.available ? '进入可视化 →' : '查看课程 →'}</i>
                </button>
              )) : <div className="search-empty"><strong>暂时没有找到</strong><span>试试“TCP”“算法”或“内存”等关键词</span></div>}
            </div>
          )}
        </div>
        <div className="curriculum-map" aria-label="课程知识地图装饰">
          <div className="map-core"><strong>CS</strong><span>Computer Science</span></div>
          {courses.slice(0, 5).map((course, index) => <div className={`map-course map-course-${index + 1}`} key={course.id} style={{ '--course-accent': course.accent }}><i>{course.icon}</i><span>{course.title}</span></div>)}
        </div>
      </section>

      {/* 核心功能三大入口中枢导航 */}
      <section style={{
        maxWidth: '1240px',
        margin: '0 auto 36px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px',
        padding: '0 clamp(16px, 3vw, 24px)'
      }}>
        {/* 模块入口 1: 课程知识与交互实验 */}
        <div
          onClick={scrollToCourses}
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1.5px solid #e2e8f0',
            borderRadius: '16px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '1.5rem',
            flexShrink: 0,
            boxShadow: '0 4px 10px rgba(59,130,246,0.3)'
          }}>
            📚
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>模块一</span>
              <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>课程知识与仿真实验</strong>
            </div>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.82rem', lineHeight: '1.4' }}>
              8门核心课程知识地图 · 交互式动态时序与微架构仿真
            </p>
          </div>
          <span style={{ color: '#2563eb', fontWeight: 900, fontSize: '1.1rem' }}>➔</span>
        </div>

        {/* 模块入口 2: 408 考研真题与测评中心 */}
        <div
          onClick={() => { window.location.hash = '#/exam' }}
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #2e1065 100%)',
            border: '1.5px solid #4338ca',
            borderRadius: '16px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            color: '#fff',
            boxShadow: '0 6px 18px rgba(49, 46, 129, 0.25)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#4338ca'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '1.5rem',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
          }}>
            🎯
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ background: '#4f46e5', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 800 }}>HOT</span>
              <strong style={{ fontSize: '1.05rem', color: '#f8fafc' }}>408 考研真题与智能测评</strong>
            </div>
            <p style={{ margin: '4px 0 0', color: '#cbd5e1', fontSize: '0.82rem', lineHeight: '1.4' }}>
              历年真题抽测 · 自由题量时长 · 错题直达仿真验证
            </p>
          </div>
          <span style={{ color: '#a5b4fc', fontWeight: 900, fontSize: '1.1rem' }}>➔</span>
        </div>

        {/* 模块入口 3: 个人学情中心与成长轨迹 */}
        <div
          onClick={onShowProfile}
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1.5px solid #e2e8f0',
            borderRadius: '16px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '1.5rem',
            flexShrink: 0,
            boxShadow: '0 4px 10px rgba(16,185,129,0.3)'
          }}>
            📊
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em' }}>模块三</span>
              <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>学情画像与学习档案</strong>
            </div>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.82rem', lineHeight: '1.4' }}>
              掌握度热力分析 · 错题档案记录 · 学习习惯成长分析
            </p>
          </div>
          <span style={{ color: '#059669', fontWeight: 900, fontSize: '1.1rem' }}>➔</span>
        </div>
      </section>

      {/* 个人学习板块（小明，继续上次的学习） */}
      <PersonalLearning user={user} records={records} courses={courses} onOpen={onOpen} onShowProfile={onShowProfile} onLogin={onLogin} />

      {/* 408 考研真题与智能测评中心大卡片（与上方个人学习卡片完全同款长宽比与质感） */}
      <section style={{
        maxWidth: '1240px',
        margin: '0 auto 68px',
        padding: '32px clamp(24px, 5vw, 56px)',
        borderRadius: '22px',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
        border: '1px solid #312e81',
        boxShadow: '0 16px 40px rgba(15, 23, 42, 0.16)',
        color: '#fff'
      }}>
        {/* 顶部标题栏，与 personal-entry-heading 风格与层次完全一致 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <span style={{
              fontSize: '12px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#818cf8',
              fontWeight: 800,
              display: 'block',
              marginBottom: '6px'
            }}>
              EXAM & LAB INTEGRATION
            </span>
            <h2 style={{
              margin: '4px 0 8px',
              fontSize: '30px',
              color: '#f8fafc',
              fontWeight: 800,
              letterSpacing: '-0.02em'
            }}>
              408 考研真题与专项智能测评中心
            </h2>
            <p style={{
              margin: 0,
              fontSize: '15px',
              color: '#cbd5e1',
              lineHeight: '1.7'
            }}>
              全国硕士统考 408 历年经典真题 · 自由定制题量与智能考试时长 · 错题<strong>一键直达仿真实验验证</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={() => { window.location.hash = '#/exam' }}
            style={{
              background: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '15px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(79, 70, 229, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            进入模考测评大厅 →
          </button>
        </div>

        {/* 底部 3 列特色功能卡片，与 home-recommendations 完美等比对齐 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '14px',
          marginTop: '24px'
        }}>
          {/* 特色 1 */}
          <div
            onClick={() => { window.location.hash = '#/exam' }}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '14px',
              padding: '16px 18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.borderColor = '#818cf8' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)' }}
          >
            <span style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#312e81',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              flexShrink: 0
            }}>
              🎲
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ display: 'block', fontSize: '14px', color: '#f8fafc', marginBottom: '4px' }}>
                随机自适应动态组卷
              </strong>
              <small style={{ display: 'block', color: '#94a3b8', fontSize: '12px', lineHeight: '1.5' }}>
                自由选择 3题/5题/10题，系统自动按 2分钟/题 推算考场倒计时，每次抽题绝不重样。
              </small>
            </div>
          </div>

          {/* 特色 2 */}
          <div
            onClick={() => { window.location.hash = '#/exam' }}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '14px',
              padding: '16px 18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.borderColor = '#38bdf8' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)' }}
          >
            <span style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#0c4a6e',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              flexShrink: 0
            }}>
              🔬
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ display: 'block', fontSize: '14px', color: '#f8fafc', marginBottom: '4px' }}>
                一键直达可视化仿真推演
              </strong>
              <small style={{ display: 'block', color: '#94a3b8', fontSize: '12px', lineHeight: '1.5' }}>
                真题做错有疑惑？一键带入真题参数，在时空流水线/TCP信道/Cache中直观观察运行机理。
              </small>
            </div>
          </div>

          {/* 特色 3 */}
          <div
            onClick={() => { window.location.hash = '#/exam' }}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '14px',
              padding: '16px 18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.borderColor = '#34d399' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)' }}
          >
            <span style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#064e3b',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              flexShrink: 0
            }}>
              📜
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ display: 'block', fontSize: '14px', color: '#f8fafc', marginBottom: '4px' }}>
                测评历史档案持久化
              </strong>
              <small style={{ display: 'block', color: '#94a3b8', fontSize: '12px', lineHeight: '1.5' }}>
                自动记录历次模考成绩、平均分与做题速度，随时重查答卷错题，见证考研成长轨迹。
              </small>
            </div>
          </div>
        </div>
      </section>

      {/* 课程知识库地图 */}
      <section id="course-library-section" className="course-library">
        <div className="course-section-heading">
          <div><span className="eyebrow">COURSE LIBRARY</span><h2>课程知识地图</h2></div>
          <p><strong>{courses.length}</strong> 门核心课程 · <strong>{courses.reduce((sum, course) => sum + course.points.length, 0)}</strong> 个规划知识点 · 持续扩充</p>
        </div>
        <div className="course-grid">
          {courses.map((course) => {
            const readyCount = course.points.filter((point) => point.available).length
            return (
              <button className="course-card" type="button" key={course.id} onClick={() => onSelectCourse(course.id)} style={{ '--course-accent': course.accent }}>
                <div className="course-card-top"><span className="course-number">COURSE {course.number}</span><span className="course-icon">{course.icon}</span></div>
                <span className="course-english">{course.english}</span><h3>{course.title}</h3><p>{course.description}</p>
                <div className="course-point-preview">{course.points.slice(0, 3).map((point) => <span key={point.title}><i className={point.available ? 'ready' : ''} />{point.title}</span>)}</div>
                <div className="course-card-footer"><span>{readyCount ? `${readyCount} 个可视化已上线` : '课程内容规划中'}</span><b>查看知识点 →</b></div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="learning-flow">
        <span className="eyebrow">HOW IT WORKS</span><h2>从“听懂了”到“真的会了”</h2>
        <div className="flow-steps">
          {[
            ['01', '选择课程', '先建立这门课的知识地图'], ['02', '进入知识点', '带着一个具体问题开始学习'],
            ['03', '操作可视化', '改变参数并观察完整过程'], ['04', '完成验证', '用预测和总结形成自己的理解'],
          ].map(([number, title, text]) => <div className="flow-step" key={number}><span>{number}</span><strong>{title}</strong><p>{text}</p></div>)}
        </div>
      </section>
    </main>
  )
}

function CourseDetail({ course, onOpen, onBack, records }) {
  const readyCount = course.points.filter((point) => point.available).length
  return (
    <main className="course-detail" style={{ '--course-accent': course.accent }}>
      <section className="course-detail-hero">
        <button className="course-back" type="button" onClick={onBack}>← 返回全部课程</button>
        <div className="course-detail-title"><span className="course-detail-icon">{course.icon}</span><div><span>{course.english}</span><h1>{course.title}</h1><p>{course.description}</p></div></div>
        <div className="course-detail-stats"><span><strong>{course.points.length}</strong>知识点</span><span><strong>{readyCount}</strong>可立即学习</span><span><strong>{course.tags.length}</strong>核心方向</span></div>
      </section>
      <section className="knowledge-section">
        <div className="knowledge-heading"><div><span className="eyebrow">KNOWLEDGE POINTS</span><h2>选择一个知识点开始</h2></div><p>建议按顺序学习，也可以直接进入你正在复习的内容。</p></div>
        <div className="knowledge-list">
          {course.points.map((point, index) => (
            <article className={`knowledge-card ${point.available ? 'available' : 'planned'} ${records.experiments?.[point.experimentId]?.completed ? 'learned' : ''}`} key={point.title}>
              <div className="knowledge-index">{String(index + 1).padStart(2, '0')}</div>
              <div className="knowledge-content"><div><span>{point.available ? '交互式可视化' : '规划中'}</span><h3>{point.title}</h3></div><p>{point.description}</p><div>{point.keywords.map((keyword) => <i key={keyword}>{keyword}</i>)}</div></div>
              {point.available ? <button type="button" onClick={() => onOpen(point.experimentId)}>{records.experiments?.[point.experimentId]?.completed ? '再次复习' : records.experiments?.[point.experimentId]?.visits ? '继续学习' : '进入实验'} <span>→</span></button> : <button type="button" disabled>即将上线</button>}
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function PersonalLearning({ user, records, courses, onOpen, onShowProfile, onLogin }) {
  if (!user) return <section className="personal-entry guest"><div><span className="eyebrow">PERSONALIZED LEARNING</span><h2>登录后，让学习路径逐渐适合你</h2><p>系统会根据实验访问次数、理解自测和学习总结，优先推荐需要继续完成或适合复习的知识点。</p></div><div className="personal-entry-steps"><span><b>01</b>记录学习次数</span><span><b>02</b>识别未完成内容</span><span><b>03</b>生成下一步推荐</span></div><button type="button" onClick={onLogin}>创建本地学习账户 →</button></section>
  const recommendations = getPersonalRecommendations(records, experiments, courses)
  const entries = Object.values(records.experiments || {})
  const visits = entries.reduce((sum, item) => sum + (item.visits || 0), 0)
  const completed = entries.filter((item) => item.completed).length
  return <section className="personal-entry signed"><div className="personal-entry-heading"><div><span className="eyebrow">WELCOME BACK</span><h2>{user.name}，继续上次的学习</h2><p>已学习 <strong>{visits}</strong> 次，完成 <strong>{completed}</strong> 个实验学习循环。</p></div><button type="button" onClick={onShowProfile}>查看完整学习中心 →</button></div><div className="home-recommendations">{recommendations.map((item, index) => <button type="button" key={item.id} onClick={() => onOpen(item.id)} style={{ '--recommend-accent': item.accent }}><span>0{index + 1}</span><i>{item.icon}</i><div><strong>{item.title}</strong><small>{item.reason}</small></div><b>开始 →</b></button>)}</div></section>
}
