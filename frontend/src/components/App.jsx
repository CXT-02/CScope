import React, { useEffect, useState } from 'react'
import AttentionExperiment from './AttentionExperiment'
import ConvolutionExperiment from './ConvolutionExperiment'
import DijkstraExperiment from './DijkstraExperiment'
import DeadlockExperiment from './DeadlockExperiment'
import ProcessSyncExperiment from './ProcessSyncExperiment'
import ExperimentHub from './ExperimentHub'
import GradientDescentExperiment from './GradientDescentExperiment'
import IpSubnetExperiment from './IpSubnetExperiment'
import DnsResolutionExperiment from './DnsResolutionExperiment'
import InstructionCycleExperiment from './InstructionCycleExperiment'
import CpuPipelineExperiment from './CpuPipelineExperiment'
import CacheMappingExperiment from './CacheMappingExperiment'
import NumberRepresentationExperiment from './NumberRepresentationExperiment'
import BPlusTreeExperiment from './BPlusTreeExperiment'
import SqlJoinExperiment from './SqlJoinExperiment'
import TransactionExperiment from './TransactionExperiment'
import NormalizationExperiment from './NormalizationExperiment'
import AccountDialog from './AccountDialog'
import LearningDashboard from './LearningDashboard'
import ExamArena from './ExamArena'
import ConsoleDashboard from './ConsoleDashboard'
import DailyCheckin from './DailyCheckin'
import MistakeNotebook from './MistakeNotebook'
import AiTutorAgent from './AiTutorAgent'
import CheatSheetHub from './CheatSheetHub'
import ExperimentWorkshop from './ExperimentWorkshop'
import CommunityHub from './CommunityHub'
import KnowledgeGalaxy3D from './KnowledgeGalaxy3D'
import SidebarNav from './SidebarNav'
import LoginGate from './LoginGate'
import { useLearningProfile } from './LearningProfileContext'
import MemoryPartitionExperiment from './MemoryPartitionExperiment'
import NeuralNetworkExperiment from './NeuralNetworkExperiment'
import PageReplacementExperiment from './PageReplacementExperiment'
import SchedulingExperiment from './SchedulingExperiment'
import SortingExperiment from './SortingExperiment'
import TreeTraversalExperiment from './TreeTraversalExperiment'
import StackQueueExperiment from './StackQueueExperiment'
import TcpConnectionExperiment from './TcpConnectionExperiment'
import SlidingWindowExperiment from './SlidingWindowExperiment'
import { courseForExperiment, courses, experiments } from '../lib/experimentRegistry'
import ThemePicker from './ThemePicker'
import { useTheme } from './ThemeContext'
import './app.css'
import './Theme.css'

const experimentComponents = {
  attention: AttentionExperiment,
  convolution: ConvolutionExperiment,
  'neural-network': NeuralNetworkExperiment,
  'gradient-descent': GradientDescentExperiment,
  dijkstra: DijkstraExperiment,
  deadlock: DeadlockExperiment,
  sync: ProcessSyncExperiment,
  sorting: SortingExperiment,
  'tree-traversal': TreeTraversalExperiment,
  'page-replacement': PageReplacementExperiment,
  'stack-queue': StackQueueExperiment,
  'memory-partition': MemoryPartitionExperiment,
  'tcp-connection': TcpConnectionExperiment,
  'sliding-window': SlidingWindowExperiment,
  'ip-subnet': IpSubnetExperiment,
  'dns-resolution': DnsResolutionExperiment,
  'instruction-cycle': InstructionCycleExperiment,
  'cpu-pipeline': CpuPipelineExperiment,
  'cache-mapping': CacheMappingExperiment,
  'number-representation': NumberRepresentationExperiment,
  'bplus-tree': BPlusTreeExperiment,
  'sql-join': SqlJoinExperiment,
  transactions: TransactionExperiment,
  normalization: NormalizationExperiment,
  scheduling: SchedulingExperiment,
}

export default function App() {
  const { theme } = useTheme()
  const [route, setRoute] = useState(readRouteFromHash)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user, logout, recordVisit } = useLearningProfile()
  const activeExperiment = route.kind === 'lab' ? route.id : null
  const activeCourseId = route.kind === 'course' ? route.id : null
  const activeCourse = courses.find((item) => item.id === activeCourseId)
  const experiment = experiments.find((item) => item.id === activeExperiment)
  const Experiment = experimentComponents[activeExperiment]
  const experimentCourse = activeExperiment ? courseForExperiment(activeExperiment) : null

  useEffect(() => {
    const syncRoute = () => setRoute(readRouteFromHash())
    window.addEventListener('hashchange', syncRoute)
    return () => window.removeEventListener('hashchange', syncRoute)
  }, [])

  useEffect(() => {
    if (experiment) recordVisit(experiment.id, experiment.courseId)
  }, [experiment?.id, user?.id])

  function navigate(nextHash) {
    if (window.location.hash === nextHash) setRoute(readRouteFromHash())
    else window.location.hash = nextHash
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goConsole = () => navigate('#/console')
  const openCourses = () => navigate('#/courses')
  const openExperiment = (experimentId) => navigate(`#/lab/${experimentId}`)
  const openCourse = (courseId) => navigate(`#/course/${courseId}`)
  const openProfile = () => navigate('#/profile')
  const openAnalytics = () => navigate('#/analytics')
  const openExam = () => navigate('#/exam')

  // 1. 若用户未登录，展示登录/建档迎宾门户（满足个性化学习服务门槛要求）
  if (!user) {
    return <LoginGate onLoginSuccess={() => navigate('#/console')} />
  }

  // 2. 登录后进入现代化控制台工作台（左侧常驻功能侧边栏 + 右侧主工作区）
  return (
    <div className={`cscope-workspace-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} data-theme={theme}>
      {/* 最左侧展示全部功能入口：切换其他功能无需返回首页 */}
      <SidebarNav
        activeKey={route.kind}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        onSelectNav={(key) => {
          if (key === 'console') goConsole()
          else if (key === 'galaxy') navigate('#/galaxy')
          else if (key === 'checkin') navigate('#/checkin')
          else if (key === 'courses') openCourses()
          else if (key === 'workshop') navigate('#/workshop')
          else if (key === 'exam') openExam()
          else if (key === 'mistakes') navigate('#/mistakes')
          else if (key === 'cheatsheet') navigate('#/cheatsheet')
          else if (key === 'aitutor') navigate('#/aitutor')
          else if (key === 'profile') openProfile()
          else if (key === 'analytics') openAnalytics()
          else if (key === 'community') navigate('#/community')
        }}
        user={user}
        onLogout={() => {
          logout()
          navigate('')
        }}
      />

      {/* 右侧主工作区 */}
      <div className="cscope-workspace-main">
        {/* 顶部全局状态栏与面包屑 */}
        <header className="workspace-header">
          <div className="breadcrumb-nav">
            <button type="button" className="crumb-btn home" onClick={goConsole}>
              控制台
            </button>
            {route.kind !== 'console' && <span className="crumb-sep">/</span>}
            {route.kind === 'galaxy' && <span className="crumb-current">3D 思维知识星图 · 三维神经网络</span>}
            {route.kind === 'checkin' && <span className="crumb-current">实机学时度量 · 仿真与模考档案</span>}
            {(route.kind === 'courses' || route.kind === 'course') && (
              <>
                {route.kind === 'course' ? (
                  <>
                    <button type="button" className="crumb-btn" onClick={openCourses}>课程中心</button>
                    <span className="crumb-sep">/</span>
                    <span className="crumb-current">{activeCourse?.title || '专项课程'} · 大纲知识点</span>
                  </>
                ) : (
                  <span className="crumb-current">课程知识中心 · 专业课大纲</span>
                )}
              </>
            )}
            {route.kind === 'workshop' && <span className="crumb-current">微观交互仿真工坊</span>}
            {route.kind === 'exam' && <span className="crumb-current">408 考研真题测评</span>}
            {route.kind === 'mistakes' && <span className="crumb-current">靶向错题本与消错实验</span>}
            {route.kind === 'cheatsheet' && <span className="crumb-current">408 必考速查宝典与公式库</span>}
            {route.kind === 'aitutor' && <span className="crumb-current">AI 计算机私教 (DeepSeek-R1)</span>}
            {route.kind === 'profile' && <span className="crumb-current">个人中心与资料安全管理</span>}
            {route.kind === 'analytics' && <span className="crumb-current">学情数据画像与能力雷达</span>}
            {route.kind === 'community' && <span className="crumb-current">极客学术社区广场</span>}
            {route.kind === 'lab' && (
              <>
                <button type="button" className="crumb-btn" onClick={() => navigate('#/workshop')}>仿真工坊</button>
                <span className="crumb-sep">/</span>
                <button type="button" className="crumb-btn" onClick={() => openCourse(experimentCourse?.id)}>
                  {experimentCourse?.title || '计算机专业课'}
                </button>
                <span className="crumb-sep">/</span>
                <span className="crumb-current">{experiment?.title || '仿真实验'}</span>
              </>
            )}
          </div>

          <div className="header-right">
            {/* 主题自主切换选择器 */}
            <ThemePicker />

            <div
              className="header-user-badge"
              onClick={openProfile}
              style={{ cursor: 'pointer' }}
              title="点击查看/编辑个人资料与安全设置"
            >
              <span className="header-avatar">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  user.name.slice(0, 1).toUpperCase()
                )}
              </span>
              <span className="header-name">{user.name}</span>
              <span className="header-status-pill">{user.major ? `${user.major.slice(0, 4)}·在线` : '408研习中'}</span>
            </div>
            <button
              type="button"
              className="header-logout-btn"
              onClick={() => {
                logout()
                navigate('')
              }}
              title="退出当前登录"
            >
              退出登录
            </button>
          </div>
        </header>

        {/* 核心工作区内容渲染 */}
        <div className="workspace-body-container">
          {route.kind === 'console' ? (
            /* 1. 控制台主页面 */
            <ConsoleDashboard
              onOpenCourses={openCourses}
              onOpenWorkshop={() => navigate('#/workshop')}
              onOpenExam={openExam}
              onOpenCheckin={() => navigate('#/checkin')}
              onOpenGalaxy={() => navigate('#/galaxy')}
              onOpenMistakes={() => navigate('#/mistakes')}
              onOpenProfile={openProfile}
              onOpenExperiment={openExperiment}
            />
          ) : route.kind === 'galaxy' ? (
            /* 2. 3D 思维知识星图 (空间三维神经网络与交互) */
            <KnowledgeGalaxy3D
              onOpenExperiment={openExperiment}
            />
          ) : route.kind === 'checkin' ? (
            /* 3. 实机学时度量档案 */
            <DailyCheckin
              onOpenExperiment={openExperiment}
              onOpenCourses={openCourses}
            />
          ) : (route.kind === 'courses' || route.kind === 'course') ? (
            /* 4. 课程知识库视图 (总览大纲与单科知识点) */
            <ExperimentHub
              courses={courses}
              activeCourseId={activeCourseId}
              onOpen={openExperiment}
              onSelectCourse={openCourse}
              onOpenWorkshopSubject={(subjectId) => navigate(`#/workshop?subject=${subjectId}`)}
              onBack={openCourses}
              onShowProfile={openProfile}
              onLogin={() => {}}
            />
          ) : route.kind === 'workshop' ? (
            /* 5. 微观仿真工坊分类检索 (支持带学科参数直达) */
            <ExperimentWorkshop
              initialSubject={route.subject || 'all'}
              onOpenExperiment={openExperiment}
            />
          ) : route.kind === 'exam' ? (
            /* 6. 408 考研真题测评中心 */
            <ExamArena
              onOpenExperiment={openExperiment}
              onBackHome={goConsole}
            />
          ) : route.kind === 'mistakes' ? (
            /* 7. 靶向错题本与消错实验 */
            <MistakeNotebook
              onOpenExperiment={openExperiment}
            />
          ) : route.kind === 'cheatsheet' ? (
            /* 8. 408 速查宝典与计算器 */
            <CheatSheetHub
              onOpenExperiment={openExperiment}
            />
          ) : route.kind === 'aitutor' ? (
            /* 9. AI 计算机私教 */
            <AiTutorAgent
              onOpenExperiment={openExperiment}
            />
          ) : route.kind === 'profile' ? (
            /* 10. 个人中心与资料、安全问题管理（参考图 127.0.0.1:5173/profile） */
            <LearningDashboard
              experiments={experiments}
              courses={courses}
              onOpen={openExperiment}
              onBack={goConsole}
              initialTab="profile"
            />
          ) : route.kind === 'analytics' ? (
            /* 11. 学情数据与能力画像 */
            <LearningDashboard
              experiments={experiments}
              courses={courses}
              onOpen={openExperiment}
              onBack={goConsole}
              initialTab="analytics"
            />
          ) : route.kind === 'community' ? (
            /* 12. 极客学术社区广场 */
            <CommunityHub
              onOpenExperiment={openExperiment}
            />
          ) : Experiment && experiment ? (
            /* 13. 具体的微观仿真实验页面：左侧侧边栏依然固定存在，随时一键跳转其他模块 */
            <main className="experiment-page" key={activeExperiment}>
              <Experiment experiment={experiment} />
            </main>
          ) : route.kind === 'lab' ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', background: 'white', borderRadius: '16px', margin: '24px' }}>
              <h2>未找到该仿真实验</h2>
              <p style={{ color: '#64748b', margin: '12px 0 20px' }}>请求的实验模块不存在或配置正在更新中。</p>
              <button type="button" className="start-lab-btn" style={{ padding: '8px 20px', cursor: 'pointer' }} onClick={() => navigate('#/workshop')}>
                返回微观仿真工坊
              </button>
            </div>
          ) : (
            <ConsoleDashboard
              onOpenCourses={openCourses}
              onOpenWorkshop={() => navigate('#/workshop')}
              onOpenExam={openExam}
              onOpenCheckin={() => navigate('#/checkin')}
              onOpenGalaxy={() => navigate('#/galaxy')}
              onOpenMistakes={() => navigate('#/mistakes')}
              onOpenProfile={openProfile}
              onOpenExperiment={openExperiment}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function readRouteFromHash() {
  if (window.location.hash === '#/galaxy') return { kind: 'galaxy', id: null }
  if (window.location.hash === '#/checkin') return { kind: 'checkin', id: null }
  if (window.location.hash.startsWith('#/workshop')) {
    const queryMatch = window.location.hash.match(/[?&]subject=([a-z-]+)/)
    return { kind: 'workshop', id: null, subject: queryMatch?.[1] || 'all' }
  }
  if (window.location.hash === '#/mistakes') return { kind: 'mistakes', id: null }
  if (window.location.hash === '#/cheatsheet') return { kind: 'cheatsheet', id: null }
  if (window.location.hash === '#/aitutor') return { kind: 'aitutor', id: null }
  if (window.location.hash === '#/community') return { kind: 'community', id: null }
  if (window.location.hash === '#/profile') return { kind: 'profile', id: null }
  if (window.location.hash === '#/analytics') return { kind: 'analytics', id: null }
  if (window.location.hash === '#/exam') return { kind: 'exam', id: null }
  if (window.location.hash === '#/courses') return { kind: 'courses', id: null }
  if (window.location.hash === '#/console') return { kind: 'console', id: null }
  const labMatch = window.location.hash.match(/^#\/lab\/([a-z-]+)$/)
  if (experiments.some((item) => item.id === labMatch?.[1])) return { kind: 'lab', id: labMatch[1] }
  const courseMatch = window.location.hash.match(/^#\/course\/([a-z-]+)$/)
  if (courses.some((item) => item.id === courseMatch?.[1])) return { kind: 'course', id: courseMatch[1] }
  return { kind: 'console', id: null }
}
