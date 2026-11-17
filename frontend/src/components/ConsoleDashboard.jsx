import React, { useState, useMemo } from 'react'
import { useLearningProfile, calculateStreak } from './LearningProfileContext'
import { courses, experiments } from '../lib/experimentRegistry'

export default function ConsoleDashboard({
  onOpenCourses,
  onOpenWorkshop,
  onOpenExam,
  onOpenCheckin,
  onOpenGalaxy,
  onOpenMistakes,
  onOpenProfile,
  onOpenExperiment
}) {
  const { user, records } = useLearningProfile()
  const [refreshSeed, setRefreshSeed] = useState(0)
  const [activeDomain, setActiveDomain] = useState('co') // 'co' | 'os' | 'net' | 'ds'

  // 读取 408 模考记录
  const examRecords = useMemo(() => {
    try {
      const saved = localStorage.getItem('408_exam_records_v1')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  }, [refreshSeed])

  // 计算模考与错题统计
  const examStats = useMemo(() => {
    if (!examRecords.length) {
      return { count: 0, avgScore: 0, latestScore: 0, wrongCount: 0 }
    }
    const totalScore = examRecords.reduce((acc, r) => acc + (r.score || 0), 0)
    const avgScore = Math.round(totalScore / examRecords.length)
    const latestScore = examRecords[0]?.score || 0
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

  // 最近一次学习的实验或推荐首个核心实验
  const lastActiveExperiment = useMemo(() => {
    const expEntries = records?.experiments || {}
    const keys = Object.keys(expEntries)
    if (keys.length > 0) {
      // 找访问次数最多的或者最近的
      const mostVisited = keys.sort((a, b) => (expEntries[b]?.visits || 0) - (expEntries[a]?.visits || 0))[0]
      const found = experiments.find(e => e.id === mostVisited)
      if (found) return found
    }
    // 默认推荐经典压轴
    return experiments.find(e => e.id === 'cpu-pipeline') || experiments[0]
  }, [records])

  // 408 四大微观体系结构领域拓扑数据
  const architectureDomains = [
    {
      id: 'co',
      badge: 'ARCH · 计组',
      name: '微处理器与指令流水线',
      fullTitle: '计算机组成原理 · 硬件微架构层',
      courseId: 'computer-organization',
      pipelineStages: ['IF 取指', 'ID 译码', 'EX 执行', 'MEM 访存', 'WB 写回'],
      clockFreq: '100 MHz 虚拟时钟',
      hazardStatus: 'RAW 数据相关旁路转发就绪',
      experiments: [
        { id: 'cpu-pipeline', name: '五级流水线与冒险气泡', tag: '流水线' },
        { id: 'cache-mapping', name: 'Cache 映射与颠簸冲突', tag: '存储' },
        { id: 'instruction-cycle', name: '指令周期时序打拍', tag: '控制' },
        { id: 'number-representation', name: '补码加减与溢出检测', tag: '运算器' }
      ],
      examCoverage: '29 题收录 · 历年统考占 45 分'
    },
    {
      id: 'os',
      badge: 'KERNEL · 系统',
      name: '进程并发与虚拟存储内核',
      fullTitle: '操作系统 · 系统软件与调度层',
      courseId: 'operating-systems',
      pipelineStages: ['创建态', '就绪队列', '运行态 (CPU)', '阻塞等待', '终止态'],
      clockFreq: '时间片轮转 10ms',
      hazardStatus: '银行家安全序列判定引擎就绪',
      experiments: [
        { id: 'process-sync', name: '生产者消费者 PV 信号量', tag: '并发' },
        { id: 'scheduling', name: 'RR 时间片与优先级调度', tag: '调度' },
        { id: 'deadlock', name: '银行家算法资源拓扑图', tag: '死锁' },
        { id: 'page-replacement', name: 'OPT/FIFO/LRU 缺页置换', tag: '虚存' }
      ],
      examCoverage: '27 题收录 · 历年统考占 35 分'
    },
    {
      id: 'net',
      badge: 'STACK · 网络',
      name: '全双工协议栈与网络拓扑',
      fullTitle: '计算机网络 · 协议分层与传输层',
      courseId: 'networks',
      pipelineStages: ['应用层', '传输层 (TCP/UDP)', '网络层 (IP)', '链路层', '物理层'],
      clockFreq: 'RTT 往返时延测算',
      hazardStatus: 'TCP 三次握手状态机已联通',
      experiments: [
        { id: 'tcp-connection', name: 'TCP 三次握手与四次挥手', tag: '传输层' },
        { id: 'sliding-window', name: '滑动窗口与拥塞控制', tag: '流控' },
        { id: 'ip-subnet', name: 'CIDR 无分类编址与子网', tag: '网络层' },
        { id: 'dns-resolution', name: '递归与迭代 DNS 解析', tag: '应用层' }
      ],
      examCoverage: '25 题收录 · 历年统考占 25 分'
    },
    {
      id: 'ds',
      badge: 'ALGO · 结构',
      name: '抽象数据拓扑与算法渐近',
      fullTitle: '数据结构与算法 · 计算模型层',
      courseId: 'data-structures',
      pipelineStages: ['问题建模', '状态空间树', '渐近分析 O(N)', '代码实现', '时空测算'],
      clockFreq: '渐进时间复杂度 O(N log N)',
      hazardStatus: '二叉树遍历与图寻路沙盒就绪',
      experiments: [
        { id: 'tree-traversal', name: '二叉树先中后序及层序', tag: '树结构' },
        { id: 'dijkstra', name: 'Dijkstra 单源最短路径', tag: '图算法' },
        { id: 'sorting', name: '快速/归并/堆排序比对', tag: '排序' },
        { id: 'stack-queue', name: '栈与队列双端微观演示', tag: '线性结构' }
      ],
      examCoverage: '24 题收录 · 历年统考占 45 分'
    }
  ]

  const currentDomain = architectureDomains.find(d => d.id === activeDomain) || architectureDomains[0]

  return (
    <div className="cscope-console-nexus">
      {/* 顶部：CScope 计算机微观计算架构总控台 */}
      <header className="cscope-nexus-header">
        <div className="nexus-brand-row">
          <div className="nexus-indicator-dot" />
          <span className="nexus-code-label">CSCOPE COMPUTATIONAL LAB // ARCHITECTURE CONTROL NEXUS</span>
          <span className="nexus-status-tag">VIRTUAL SIMULATION KERNEL ACTIVE</span>
        </div>
        <div className="nexus-title-row">
          <div>
            <h1 className="nexus-main-title">计算机核心课微观可视化教学平台 · 控制台总览</h1>
            <p className="nexus-subtitle">
              穿透教科书的抽象枯燥文字 · 从晶体管时序节拍、CPU 五级流水线到 TCP 状态机 · 25 门微观仿真实验与 105 题 408 统考真题双向对齐
            </p>
          </div>
          {/* 全局核心四大功能支柱直达快捷操作条 */}
          <div className="nexus-quick-actions">
            <button
              type="button"
              className="cscope-btn cscope-btn-outline"
              onClick={onOpenCourses}
              title="浏览 8 门专业课知识地图与考点大纲"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span>📚 课程知识中心</span>
            </button>
            <button
              type="button"
              className="cscope-btn cscope-btn-outline"
              onClick={onOpenWorkshop}
              title="进入 25 门底层微架构时钟实验全景工坊"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 2v7.31M14 9.3V1.99M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0" />
                <path d="M5.52 16h12.96" />
              </svg>
              <span>🔬 微观仿真工坊</span>
            </button>
            <button
              type="button"
              className="cscope-btn cscope-btn-primary"
              onClick={onOpenExam}
              title="开启 408 历年统考真题智能计时抽测"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
              <span>📝 408 智能模考</span>
            </button>
            <button
              type="button"
              className="cscope-btn cscope-btn-outline"
              onClick={onOpenCheckin}
              title="查看系统实时自动捕获的学时流水与考研签到档案"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>⏱️ 实机学时度量</span>
            </button>
          </div>
        </div>

        {/* 顶部硬核体系指标条 (专属计算机专业，摆脱通用SaaS感) */}
        <div className="nexus-telemetry-strip">
          <div className="telemetry-cell">
            <span className="telemetry-label">虚拟时钟节拍</span>
            <div className="telemetry-val-group">
              <strong className="telemetry-num">100</strong>
              <span className="telemetry-unit">MHz CLK</span>
            </div>
            <span className="telemetry-desc">纳秒级硬件时序推演沙盒</span>
          </div>
          <div className="telemetry-cell">
            <span className="telemetry-label">微观仿真实验</span>
            <div className="telemetry-val-group">
              <strong className="telemetry-num">25</strong>
              <span className="telemetry-unit">门底层沙盘</span>
            </div>
            <span className="telemetry-desc">已探索 {expStats.visitedExpCount} 门 · 完成 {expStats.completedCount} 项验证</span>
          </div>
          <div className="telemetry-cell">
            <span className="telemetry-label">408 统考真题库</span>
            <div className="telemetry-val-group">
              <strong className="telemetry-num">105</strong>
              <span className="telemetry-unit">道全真试题</span>
            </div>
            <span className="telemetry-desc">已测 {examStats.count} 轮 · 均分 {examStats.avgScore || '--'} 分</span>
          </div>
          <div className="telemetry-cell">
            <span className="telemetry-label">实机实操学时</span>
            <div className="telemetry-val-group">
              <strong className="telemetry-num">{Math.max(1, expStats.streak)}</strong>
              <span className="telemetry-unit">天连续活跃</span>
            </div>
            <span className="telemetry-desc">内核真实心跳防伪记录</span>
          </div>
        </div>
      </header>

      {/* 智能学习续航条带：小明同学，继续上次的推演 */}
      <section className="nexus-continuation-banner">
        <div className="banner-left">
          <div className="banner-badge-pill">
            <span className="live-dot" />
            <span>LEARNING CONTINUATION // 智能学习续航</span>
          </div>
          <h2 className="banner-title">
            {user?.name || '同学'}，准备好继续推演 <strong>【{lastActiveExperiment.title}】</strong> 了吗？
          </h2>
          <p className="banner-desc">
            {lastActiveExperiment.description} · 可视化单步观察硬件状态机，改变参数完成真题考点验证。
          </p>
        </div>
        <div className="banner-actions">
          <button
            type="button"
            className="banner-resume-btn"
            onClick={() => onOpenExperiment(lastActiveExperiment.id)}
          >
            ▶ 继续该实验推演
          </button>
          <button
            type="button"
            className="banner-secondary-btn"
            onClick={onOpenCourses}
          >
            浏览全部课程大纲 →
          </button>
        </div>
      </section>

      {/* 核心第一板块：408 四大底层核心域交互拓扑中枢 */}
      <section className="cscope-domain-matrix-section">
        <div className="section-head-bar">
          <div className="section-tag-group">
            <span className="section-code">[01] ARCHITECTURE MATRIX</span>
            <h2 className="section-heading">408 计算机体系结构微观穿透矩阵</h2>
          </div>
          <div className="domain-switch-tabs">
            {architectureDomains.map((d) => (
              <button
                key={d.id}
                type="button"
                className={`domain-tab-btn ${activeDomain === d.id ? 'active' : ''}`}
                onClick={() => setActiveDomain(d.id)}
              >
                {d.badge}
              </button>
            ))}
          </div>
        </div>

        {/* 活跃领域的穿透看板 */}
        <div className="domain-hero-card">
          <div className="domain-card-left">
            <div className="domain-meta-pill">
              <span className="domain-badge-text">{currentDomain.badge}</span>
              <span className="domain-clock-pill">{currentDomain.clockFreq}</span>
            </div>
            <h3 className="domain-full-title">{currentDomain.fullTitle}</h3>
            <p className="domain-desc-text">
              状态机健康度：<strong>{currentDomain.hazardStatus}</strong> · {currentDomain.examCoverage}
            </p>

            {/* 流水线/时序状态流动条 */}
            <div className="pipeline-flow-box">
              <div className="pipeline-flow-header">
                <span className="flow-title">硬件/系统时钟节拍阶段 (Clock Pipeline Stages)</span>
                <span className="flow-pulse-label">RUNNING</span>
              </div>
              <div className="pipeline-stages-track">
                {currentDomain.pipelineStages.map((stg, sIdx) => (
                  <div key={sIdx} className="stage-block">
                    <span className="stage-index">T{sIdx + 1}</span>
                    <span className="stage-name">{stg}</span>
                    {sIdx < currentDomain.pipelineStages.length - 1 && (
                      <span className="stage-arrow">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 该领域的微观仿真实验快捷阵列 */}
            <div className="domain-exp-shortcuts">
              <span className="shortcut-label">直通微观时钟沙盒：</span>
              <div className="shortcut-chips-wrap">
                {currentDomain.experiments.map((exp) => (
                  <button
                    key={exp.id}
                    type="button"
                    className="exp-shortcut-chip"
                    onClick={() => onOpenExperiment(exp.id)}
                    title={`进入 ${exp.name} 仿真实验`}
                  >
                    <span className="chip-tag">{exp.tag}</span>
                    <span className="chip-name">{exp.name}</span>
                    <span className="chip-arrow">↗</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="domain-card-right">
            <div className="domain-quick-panel">
              <h4 className="panel-sub-title">408 核心考点直达</h4>
              <ul className="domain-exam-focus-list">
                <li>
                  <span className="focus-dot" />
                  <span><strong>历年高频：</strong>选择题与 41-45 大题必考时钟节拍推演</span>
                </li>
                <li>
                  <span className="focus-dot" />
                  <span><strong>避坑要点：</strong>警惕 RAW 数据冒险停顿周期与 Cache 颠簸冲突</span>
                </li>
                <li>
                  <span className="focus-dot" />
                  <span><strong>双向验证：</strong>做错真题直接单步唤醒沙盘定位微指令</span>
                </li>
              </ul>
              <button
                type="button"
                className="domain-enter-exam-btn"
                onClick={onOpenExam}
              >
                开始本域真题专项测评 →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 核心第二板块：三柱鼎立 (真题测评轨迹 + 408学科掌握度 + 3D知识星图跃迁) */}
      <div className="cscope-lower-workbench-grid">
        {/* 左柱：最近 408 测评轨迹 */}
        <section className="workbench-card">
          <div className="wb-card-header">
            <div>
              <span className="wb-code-tag">[EVALUATION TRACE]</span>
              <h3 className="wb-title">最近 408 测评实测记录</h3>
            </div>
            <button type="button" className="wb-link-btn" onClick={onOpenExam}>
              全真模考大厅 →
            </button>
          </div>

          <div className="wb-tests-list">
            {examRecords.length > 0 ? (
              examRecords.slice(0, 4).map((rec) => {
                const count = rec.questionCount || rec.totalQuestions || 5
                const scopeTitle = rec.courseScope || rec.courseScopeName || '408 专业课测评'
                const timeMin = Math.max(1, Math.round((rec.timeUsedSec || 60) / 60))
                return (
                  <div key={rec.id} className="wb-test-row">
                    <div className="test-row-main">
                      <strong className="test-scope-title">{scopeTitle}</strong>
                      <span className="test-meta-line">
                        {rec.dateStr || '近期'} · {count} 道全真试题 · 耗时 {timeMin} 分钟
                      </span>
                    </div>
                    <div className={`test-score-pill ${
                      (rec.score || 0) >= 80 ? 'good' : (rec.score || 0) >= 60 ? 'pass' : 'warn'
                    }`}>
                      {rec.score} 分
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="wb-empty-state">
                <p>当前尚未进行 408 统考真题摸底测试</p>
                <button type="button" className="wb-start-eval-btn" onClick={onOpenExam}>
                  立即开启 10 题快速自测
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 中柱：408 四大学科掌握度与薄弱考点诊断 */}
        <section className="workbench-card">
          <div className="wb-card-header">
            <div>
              <span className="wb-code-tag">[MASTERY DIAGNOSTICS]</span>
              <h3 className="wb-title">408 学科掌握度实时画像</h3>
            </div>
            <span className="wb-badge-pill">系统实测推演</span>
          </div>

          <div className="wb-mastery-list">
            <div className="mastery-item">
              <div className="mastery-info-row">
                <span className="mastery-name">计算机组成原理</span>
                <span className="mastery-stat">29题 · 掌握度 84%</span>
              </div>
              <div className="mastery-progress-track">
                <div className="mastery-progress-bar bar-co" style={{ width: '84%' }} />
              </div>
            </div>

            <div className="mastery-item">
              <div className="mastery-info-row">
                <span className="mastery-name">操作系统</span>
                <span className="mastery-stat">27题 · 掌握度 76%</span>
              </div>
              <div className="mastery-progress-track">
                <div className="mastery-progress-bar bar-os" style={{ width: '76%' }} />
              </div>
            </div>

            <div className="mastery-item">
              <div className="mastery-info-row">
                <span className="mastery-name">计算机网络</span>
                <span className="mastery-stat">25题 · 掌握度 80%</span>
              </div>
              <div className="mastery-progress-track">
                <div className="mastery-progress-bar bar-net" style={{ width: '80%' }} />
              </div>
            </div>

            <div className="mastery-item">
              <div className="mastery-info-row">
                <span className="mastery-name">数据结构与算法</span>
                <span className="mastery-stat">24题 · 掌握度 88%</span>
              </div>
              <div className="mastery-progress-track">
                <div className="mastery-progress-bar bar-ds" style={{ width: '88%' }} />
              </div>
            </div>
          </div>

          <div className="wb-target-advice">
            <span className="advice-tag">靶向提分建议</span>
            <p>
              重点突破：<strong>【Cache 映射直接冲突】</strong>与<strong>【虚拟存储 TLB+页表访存时序】</strong>，做错真题可直接在微观工坊沙盘中单步复盘！
            </p>
          </div>
        </section>

        {/* 右柱：3D 思维知识星图与快捷导航 */}
        <section className="workbench-card galaxy-portal-card">
          <div className="wb-card-header">
            <div>
              <span className="wb-code-tag">[SPATIAL GALAXY]</span>
              <h3 className="wb-title">3D 思维知识星图</h3>
            </div>
            <span className="wb-badge-pill gold">WebGL 三维</span>
          </div>

          <div className="galaxy-preview-content">
            <div className="galaxy-wireframe-sphere">
              <div className="inner-node node-core" />
              <div className="inner-node node-1" />
              <div className="inner-node node-2" />
              <div className="inner-node node-3" />
            </div>
            <p className="galaxy-caption">
              25 个核心知识神经元在三维空间中实时自旋，支持 360° 旋转、层级穿透与考点联动。
            </p>
            <button
              type="button"
              className="galaxy-enter-btn"
              onClick={onOpenGalaxy || onOpenCourses}
            >
              进入 3D 知识星图漫游 →
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
