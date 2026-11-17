import React, { useMemo, useState } from 'react'
import { useLearningProfile } from './LearningProfileContext'
import { getPersonalRecommendations } from './LearningDashboard'
import { experiments } from '../lib/experimentRegistry'
import './ExperimentHub.css'

export default function ExperimentHub({
  courses,
  activeCourseId,
  onOpen,
  onSelectCourse,
  onOpenWorkshopSubject,
  onBack,
  onShowProfile,
  onLogin
}) {
  const { user, records } = useLearningProfile()
  const activeCourse = courses.find((course) => course.id === activeCourseId)
  if (activeCourse) {
    return (
      <CourseDetail
        course={activeCourse}
        onOpen={onOpen}
        onOpenWorkshopSubject={onOpenWorkshopSubject}
        onBack={onBack}
        records={records}
      />
    )
  }
  return (
    <CourseCatalog
      courses={courses}
      onOpen={onOpen}
      onSelectCourse={onSelectCourse}
      onOpenWorkshopSubject={onOpenWorkshopSubject}
      user={user}
      records={records}
      onShowProfile={onShowProfile}
      onLogin={onLogin}
    />
  )
}

function CourseCatalog({
  courses,
  onOpen,
  onSelectCourse,
  onOpenWorkshopSubject,
  user,
  records,
  onShowProfile,
  onLogin
}) {
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

  return (
    <main className="course-home">
      {/* 顶部搜索与课程导引区 */}
      <section className="course-hero">
        <div className="course-hero-copy">
          <span className="eyebrow">CSCOPE · 计算机核心课知识地图</span>
          <h1>今天想看懂<br /><em>哪门计算机课程？</em></h1>
          <p>从课程进入知识地图，选择一个知识点，让抽象原理在眼前一步步运行。</p>
          <div className={`course-search ${query ? 'has-query' : ''}`}>
            <span aria-hidden="true">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索知识点，例如：Cache、流水线、TCP、死锁…"
              aria-label="搜索课程和知识点"
            />
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
              )) : <div className="search-empty"><strong>暂时没有找到</strong><span>试试“TCP”“流水线”或“Cache”等关键词</span></div>}
            </div>
          )}
        </div>
        <div className="curriculum-map" aria-label="课程知识地图装饰">
          <div className="map-core"><strong>CS</strong><span>Computer Science</span></div>
          {courses.slice(0, 5).map((course, index) => (
            <div
              className={`map-course map-course-${index + 1}`}
              key={course.id}
              style={{ '--course-accent': course.accent, cursor: 'pointer' }}
              title={`点击直达微观仿真工坊 · ${course.title}专区`}
              onClick={() => onOpenWorkshopSubject ? onOpenWorkshopSubject(course.id) : onSelectCourse(course.id)}
            >
              <i>{course.icon}</i>
              <span>{course.title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 个人学习板块（小明，继续上次的学习） */}
      <PersonalLearning user={user} records={records} courses={courses} onOpen={onOpen} onShowProfile={onShowProfile} onLogin={onLogin} />

      {/* 课程知识库地图 */}
      <section id="course-library-section" className="course-library">
        <div className="course-section-heading">
          <div><span className="eyebrow">COURSE LIBRARY</span><h2>全部课程知识地图</h2></div>
          <p><strong>{courses.length}</strong> 门核心课程 · <strong>{courses.reduce((sum, course) => sum + course.points.length, 0)}</strong> 个规划知识点 · 持续扩充</p>
        </div>
        <div className="course-grid">
          {courses.map((course) => {
            const readyCount = course.points.filter((point) => point.available).length
            return (
              <div
                className="course-card"
                key={course.id}
                style={{ '--course-accent': course.accent }}
              >
                <div className="course-card-top">
                  <span className="course-number">COURSE {course.number}</span>
                  <span
                    className="course-icon"
                    style={{ cursor: 'pointer' }}
                    onClick={() => onOpenWorkshopSubject ? onOpenWorkshopSubject(course.id) : onSelectCourse(course.id)}
                    title="点击在微观仿真工坊中查看该学科"
                  >
                    {course.icon}
                  </span>
                </div>
                <span className="course-english">{course.english}</span>
                <h3
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectCourse(course.id)}
                  title="点击查看该课程完整大纲考点"
                >
                  {course.title}
                </h3>
                <p>{course.description}</p>

                {/* 知识点预览：点击具体知识点直接进入对应的微观仿真实验！ */}
                <div className="course-point-preview">
                  {course.points.slice(0, 4).map((point) => (
                    <button
                      type="button"
                      key={point.title}
                      className="point-interactive-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (point.available) onOpen(point.experimentId)
                        else onSelectCourse(course.id)
                      }}
                      title={point.available ? `立即进入「${point.title}」微观时钟仿真实验` : '查看该知识点'}
                    >
                      <i className={point.available ? 'ready' : ''} />
                      <span className="point-text">{point.title}</span>
                      {point.available && <b className="point-play-tag">推演 ▶</b>}
                    </button>
                  ))}
                </div>

                {/* 卡片底部双操作：既可前往微观仿真工坊，也可查看大纲详情 */}
                <div className="course-card-footer">
                  <button
                    type="button"
                    className="footer-workshop-link"
                    onClick={() => onOpenWorkshopSubject ? onOpenWorkshopSubject(course.id) : onSelectCourse(course.id)}
                    title={`在微观仿真工坊中筛选全部「${course.title}」时钟实验`}
                  >
                    🔬 微观工坊 ({readyCount}门实验)
                  </button>
                  <button
                    type="button"
                    className="footer-detail-link"
                    onClick={() => onSelectCourse(course.id)}
                    title={`查看「${course.title}」考点大纲总览`}
                  >
                    <b>大纲总览 →</b>
                  </button>
                </div>
              </div>
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

function CourseDetail({ course, onOpen, onOpenWorkshopSubject, onBack, records }) {
  const readyCount = course.points.filter((point) => point.available).length
  return (
    <main className="course-detail" style={{ '--course-accent': course.accent }}>
      <section className="course-detail-hero">
        <div className="course-detail-nav-bar">
          <button className="course-back" type="button" onClick={onBack}>
            ← 返回全部课程大纲地图
          </button>
          {onOpenWorkshopSubject && (
            <button
              className="course-go-workshop-top-btn"
              type="button"
              onClick={() => onOpenWorkshopSubject(course.id)}
            >
              🔬 直达微观仿真工坊 · 查看本学科全部实验 →
            </button>
          )}
        </div>
        <div className="course-detail-title">
          <span className="course-detail-icon">{course.icon}</span>
          <div>
            <span>{course.english}</span>
            <h1>{course.title} · 考点知识大纲</h1>
            <p>{course.description}</p>
          </div>
        </div>
        <div className="course-detail-stats">
          <span><strong>{course.points.length}</strong>知识考点</span>
          <span><strong>{readyCount}</strong>可进入底层微观仿真</span>
          <span><strong>{course.tags.length}</strong>核心考纲方向</span>
        </div>
      </section>
      <section className="knowledge-section">
        <div className="knowledge-heading">
          <div><span className="eyebrow">KNOWLEDGE POINTS</span><h2>选择知识点 · 进入底层时序仿真推演</h2></div>
          <p>点击知识点直接启动可交互的微观时钟实验，直观观察硬件时序与算法逻辑。</p>
        </div>
        <div className="knowledge-list">
          {course.points.map((point, index) => (
            <article className={`knowledge-card ${point.available ? 'available' : 'planned'} ${records.experiments?.[point.experimentId]?.completed ? 'learned' : ''}`} key={point.title}>
              <div className="knowledge-index">{String(index + 1).padStart(2, '0')}</div>
              <div className="knowledge-content">
                <div>
                  <span>{point.available ? '微观交互仿真' : '考点规划中'}</span>
                  <h3>{point.title}</h3>
                </div>
                <p>{point.description}</p>
                <div>{point.keywords.map((keyword) => <i key={keyword}>{keyword}</i>)}</div>
              </div>
              {point.available ? (
                <button type="button" onClick={() => onOpen(point.experimentId)}>
                  {records.experiments?.[point.experimentId]?.completed ? '再次推演' : records.experiments?.[point.experimentId]?.visits ? '继续推演' : '进入微观实验'} <span>→</span>
                </button>
              ) : (
                <button type="button" disabled>即将上线</button>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function PersonalLearning({ user, records, courses, onOpen, onShowProfile, onLogin }) {
  if (!user) {
    return (
      <section className="personal-entry guest">
        <div>
          <span className="eyebrow">PERSONALIZED LEARNING</span>
          <h2>登录后，让学习路径逐渐适合你</h2>
          <p>系统会根据实验访问次数、理解自测和学习总结，优先推荐需要继续完成或适合复习的知识点。</p>
        </div>
        <div className="personal-entry-steps">
          <span><b>01</b>记录学习次数</span>
          <span><b>02</b>识别未完成内容</span>
          <span><b>03</b>生成下一步推荐</span>
        </div>
        <button type="button" onClick={onLogin}>创建本地学习账户 →</button>
      </section>
    )
  }
  const recommendations = getPersonalRecommendations(records, experiments, courses)
  const entries = Object.values(records.experiments || {})
  const visits = entries.reduce((sum, item) => sum + (item.visits || 0), 0)
  const completed = entries.filter((item) => item.completed).length
  return (
    <section className="personal-entry signed">
      <div className="personal-entry-heading">
        <div>
          <span className="eyebrow">WELCOME BACK</span>
          <h2>{user.name}，继续上次的学习</h2>
          <p>已学习 <strong>{visits}</strong> 次，完成 <strong>{completed}</strong> 个实验学习循环。</p>
        </div>
        <button type="button" onClick={onShowProfile}>查看完整学习中心 →</button>
      </div>
      <div className="home-recommendations">
        {recommendations.map((item, index) => (
          <button type="button" key={item.id} onClick={() => onOpen(item.id)} style={{ '--recommend-accent': item.accent }}>
            <span>0{index + 1}</span>
            <i>{item.icon}</i>
            <div>
              <strong>{item.title}</strong>
              <small>{item.reason}</small>
            </div>
            <b>开始 →</b>
          </button>
        ))}
      </div>
    </section>
  )
}
