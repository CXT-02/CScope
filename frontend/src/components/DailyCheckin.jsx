import React, { useState, useEffect, useMemo } from 'react'
import { useLearningProfile } from './LearningProfileContext'

const CHECKIN_STORAGE_KEY = 'cscope_daily_checkin_records_v1'

const PRESET_TOPICS = [
  { name: 'CPU 五级流水线与冒险处理', course: '计算机组成原理', weight: 1.4 },
  { name: 'Cache 组相联映射与命中颠簸', course: '计算机组成原理', weight: 1.3 },
  { name: 'IEEE 754 浮点数表示与截断', course: '计算机组成原理', weight: 1.2 },
  { name: '死锁避免与银行家算法推演', course: '操作系统', weight: 1.3 },
  { name: '进程同步与管程 Peterson 算法', course: '操作系统', weight: 1.4 },
  { name: '虚拟页式存储与页面置换', course: '操作系统', weight: 1.2 },
  { name: 'TCP 三次握手与全双工连接', course: '计算机网络', weight: 1.2 },
  { name: 'TCP 拥塞控制与滑动窗口时序', course: '计算机网络', weight: 1.3 },
  { name: 'IP 子网掩码与 CIDR 聚合划分子网', course: '计算机网络', weight: 1.1 },
  { name: 'Dijkstra 最短路径算法贪心推演', course: '数据结构与算法', weight: 1.3 },
  { name: '二叉平衡树与红黑树旋转遍历', course: '数据结构与算法', weight: 1.4 },
  { name: '自注意力机制 Attention 权重计算', course: '人工智能与前沿', weight: 1.5 },
]

export default function DailyCheckin({ onOpenExperiment, onOpenCourses }) {
  const { user } = useLearningProfile()
  const [topic, setTopic] = useState(PRESET_TOPICS[0].name)
  const [customTopic, setCustomTopic] = useState('')
  const [duration, setDuration] = useState(45) // 分钟
  const [feeling, setFeeling] = useState('适中') // '轻松' | '适中' | '吃力'
  const [note, setNote] = useState('')
  const [checkinSuccess, setCheckinSuccess] = useState(false)

  // 读取本地打卡历史
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(CHECKIN_STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    // 预设几条高质量打卡示例
    return [
      {
        id: 'chk_1',
        date: '2026-11-12',
        topic: 'Cache 组相联映射与命中颠簸',
        duration: 50,
        feeling: '适中',
        energy: 360,
        note: '在仿真沙盘中观察了直接映射的冲突颠簸现象，结合 408 真题理解了组索引与 Tag 位数划分。'
      },
      {
        id: 'chk_2',
        date: '2026-11-13',
        topic: '死锁避免与银行家算法推演',
        duration: 60,
        feeling: '适中',
        energy: 440,
        note: '单步运行了四进程三类资源的安全序列验证，深刻理解了有环不一定死锁但死锁一定有环。'
      },
      {
        id: 'chk_3',
        date: '2026-11-14',
        topic: 'TCP 三次握手与全双工连接',
        duration: 40,
        feeling: '轻松',
        energy: 280,
        note: '抓包时序推演 SYN-ACK，明确了为什么两次握手会导致历史失效报文建立错误半连接。'
      },
      {
        id: 'chk_4',
        date: '2026-11-15',
        topic: 'CPU 五级流水线与冒险处理',
        duration: 65,
        feeling: '吃力',
        energy: 520,
        note: 'RAW 数据相关的旁路转发逻辑和 Load-Use 冒险插入气泡气节，推演两遍终于透彻掌握。'
      }
    ]
  })

  // 保存持久化
  useEffect(() => {
    try {
      localStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify(history))
    } catch {}
  }, [history])

  // 计算 MET 脑力认知消耗：时长 * 难度系数 * 基准能耗
  const currentEnergyKcal = useMemo(() => {
    const selected = PRESET_TOPICS.find(t => t.name === topic)
    const weight = selected ? selected.weight : 1.2
    const feelFactor = feeling === '轻松' ? 0.9 : feeling === '适中' ? 1.1 : 1.35
    return Math.round(duration * weight * feelFactor * 5.2)
  }, [topic, duration, feeling])

  // 连续打卡统计
  const stats = useMemo(() => {
    const totalDays = history.length
    const totalMinutes = history.reduce((sum, h) => sum + (h.duration || 0), 0)
    const totalKcal = history.reduce((sum, h) => sum + (h.energy || 0), 0)
    return {
      streakDays: totalDays > 0 ? totalDays : 1,
      weekDays: Math.min(7, totalDays),
      totalMinutes,
      totalKcal
    }
  }, [history])

  // 提交打卡
  const handleCheckin = (e) => {
    e.preventDefault()
    const activeTopic = customTopic.trim() || topic
    const today = new Date().toISOString().split('T')[0]

    const newRecord = {
      id: `chk_${Date.now()}`,
      date: today,
      topic: activeTopic,
      duration: Number(duration),
      feeling,
      energy: currentEnergyKcal,
      note: note.trim() || '今日完成了微观仿真推演与考点巩固。'
    }

    setHistory([newRecord, ...history])
    setNote('')
    setCustomTopic('')
    setCheckinSuccess(true)
    setTimeout(() => setCheckinSuccess(false), 4000)
  }

  return (
    <div className="daily-checkin-page">
      {/* 顶部标题与打卡状态 */}
      <header className="checkin-top-header">
        <div className="checkin-title-block">
          <div className="checkin-badge-row">
            <span className="checkin-live-badge">DAILY STUDY CHECK-IN</span>
            <span className="checkin-date-text">
              {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </span>
          </div>
          <h1>每日研习打卡 · 脑力负荷管理</h1>
          <p className="checkin-desc">
            记录每日计算机核心课微观推演与 408 真题攻坚时长，根据认知负荷算法智能折算专注度与脑力消耗。
          </p>
        </div>

        <div className="checkin-header-stat-pill">
          <span className="fire-icon">🔥</span>
          <div className="stat-text">
            <span>连续研习打卡</span>
            <strong>{stats.streakDays} 天</strong>
          </div>
        </div>
      </header>

      {/* 核心四大指标卡片（参考图样式） */}
      <section className="checkin-summary-cards">
        <div className="checkin-card">
          <div className="card-top">
            <span className="card-label">连续打卡</span>
            <span className="card-icon trophy">🏆</span>
          </div>
          <div className="card-number-row">
            <strong>{stats.streakDays}</strong>
            <span>天</span>
          </div>
          <div className="card-footer-tip">历史最长连续打卡 {Math.max(stats.streakDays, 7)} 天</div>
        </div>

        <div className="checkin-card highlight">
          <div className="card-top">
            <span className="card-label">本周研习</span>
            <span className="card-icon calendar">📅</span>
          </div>
          <div className="card-number-row">
            <strong>{stats.weekDays}</strong>
            <span>天</span>
          </div>
          <div className="card-footer-tip">已超越设定目标（目标 4 天/周）</div>
        </div>

        <div className="checkin-card">
          <div className="card-top">
            <span className="card-label">累计专注时长</span>
            <span className="card-icon timer">⏱️</span>
          </div>
          <div className="card-number-row">
            <strong>{stats.totalMinutes}</strong>
            <span>分钟</span>
          </div>
          <div className="card-footer-tip">折合约 {(stats.totalMinutes / 60).toFixed(1)} 小时微观推演</div>
        </div>

        <div className="checkin-card energy">
          <div className="card-top">
            <span className="card-label">脑力认知消耗</span>
            <span className="card-icon flame">⚡</span>
          </div>
          <div className="card-number-row">
            <strong>{stats.totalKcal}</strong>
            <span>kcal</span>
          </div>
          <div className="card-footer-tip">认知负荷模型 (MET系数×时长×难度)</div>
        </div>
      </section>

      {/* 主工作区两列布局：左侧快速打卡表单 + 右侧近7天图表与分布 */}
      <div className="checkin-workspace-grid">
        {/* 左侧：快速打卡卡片 (参考图样式) */}
        <section className="quick-checkin-card">
          <div className="card-title-line">
            <h3>快速研习打卡</h3>
            <span className="auto-calc-tag">
              <span>自动测算脑力消耗：</span>
              <strong>{currentEnergyKcal} kcal</strong>
            </span>
          </div>

          <form onSubmit={handleCheckin} className="checkin-form">
            <div className="form-item">
              <label>选择研习考点 / 实验模块</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="checkin-select"
              >
                {PRESET_TOPICS.map((item, idx) => (
                  <option key={idx} value={item.name}>
                    {item.name} （{item.course}）
                  </option>
                ))}
              </select>
            </div>

            <div className="form-item">
              <label>或者自填知识点 / 备考任务</label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="例如：刷完 2023 年 408 计网真题 5 道"
                className="checkin-input"
              />
            </div>

            <div className="form-item-row">
              <div className="form-item">
                <label>研习时长（分钟）</label>
                <div className="duration-slider-wrap">
                  <input
                    type="range"
                    min="10"
                    max="180"
                    step="5"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="checkin-slider"
                  />
                  <span className="duration-badge">{duration} 分钟</span>
                </div>
              </div>
            </div>

            <div className="form-item">
              <label>今天的理解与吸收感受</label>
              <div className="feeling-selector">
                {['轻松', '适中', '吃力'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`feeling-btn ${feeling === f ? 'active' : ''}`}
                    onClick={() => setFeeling(f)}
                  >
                    {f === '轻松' ? '🟢 轻松透彻' : f === '适中' ? '🟡 适中平稳' : '🔴 烧脑吃力'}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-item">
              <label>研习反思与心得备忘</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="今天踩了什么坑？哪个时钟周期或指针跳变没看懂？写两句备忘..."
                rows={3}
                className="checkin-textarea"
              />
            </div>

            <div className="checkin-submit-row">
              <button type="submit" className="checkin-submit-btn">
                完成今日打卡并入库 ✨
              </button>
              {checkinSuccess && (
                <span className="success-toast">
                  ✓ 打卡成功！连续学习天数已同步更新
                </span>
              )}
            </div>
          </form>
        </section>

        {/* 右侧：图表统计与学习类型分布 (参考图样式) */}
        <section className="checkin-analytics-column">
          {/* 近 7 天打卡柱状图 */}
          <div className="analytics-box">
            <div className="box-header">
              <h4>近 7 天微观研习量</h4>
              <span className="box-sub">分钟 / 脑力能耗 (kcal)</span>
            </div>
            <div className="bar-chart-container">
              {['11-10', '11-11', '11-12', '11-13', '11-14', '11-15', '今日'].map((label, idx) => {
                const heights = [40, 55, 50, 60, 30, 65, duration]
                const val = heights[idx] || 45
                const hPercent = Math.min(100, Math.round((val / 80) * 100))
                return (
                  <div key={idx} className="bar-col">
                    <div className="bar-track">
                      <div
                        className={`bar-fill ${idx === 6 ? 'today' : ''}`}
                        style={{ height: `${hPercent}%` }}
                        title={`${label}: ${val}分钟`}
                      />
                    </div>
                    <span className="bar-label">{label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 学科投入分布环形图 */}
          <div className="analytics-box">
            <div className="box-header">
              <h4>408 学科精力投入分布</h4>
              <span className="box-sub">按研习时长占比</span>
            </div>
            <div className="pie-summary-wrap">
              <div className="pie-visual-ring">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path
                    className="circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="circle-slice s1"
                    strokeDasharray="35, 100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="circle-slice s2"
                    strokeDasharray="25, 100"
                    strokeDashoffset="-35"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="circle-slice s3"
                    strokeDasharray="25, 100"
                    strokeDashoffset="-60"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="circle-slice s4"
                    strokeDasharray="15, 100"
                    strokeDashoffset="-85"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="pie-center-text">
                  <strong>408</strong>
                  <span>全科覆盖</span>
                </div>
              </div>

              <div className="pie-legends">
                <div className="legend-item">
                  <span className="dot dot-1" />
                  <span>计算机组成原理 (35%)</span>
                </div>
                <div className="legend-item">
                  <span className="dot dot-2" />
                  <span>操作系统 (25%)</span>
                </div>
                <div className="legend-item">
                  <span className="dot dot-3" />
                  <span>计算机网络 (25%)</span>
                </div>
                <div className="legend-item">
                  <span className="dot dot-4" />
                  <span>数据结构与算法 (15%)</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 底部：打卡历史流 */}
      <section className="checkin-history-section">
        <div className="section-header">
          <h3>近期研习打卡足迹 ({history.length} 条)</h3>
          <span className="section-hint">数据实时存入本地安全档案库</span>
        </div>

        <div className="history-cards-grid">
          {history.map((record) => (
            <div key={record.id} className="history-item-card">
              <div className="hist-top">
                <span className="hist-topic">{record.topic}</span>
                <span className="hist-date">{record.date}</span>
              </div>
              <p className="hist-note">“{record.note}”</p>
              <div className="hist-footer">
                <span className="hist-tag duration">⏱️ {record.duration} 分钟</span>
                <span className="hist-tag energy">⚡ {record.energy} kcal 认知负荷</span>
                <span className={`hist-tag feeling ${record.feeling === '吃力' ? 'hard' : ''}`}>
                  {record.feeling}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
