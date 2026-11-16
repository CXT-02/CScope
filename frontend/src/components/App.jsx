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
import './app.css'

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
  const openExam = () => navigate('#/exam')

  // 1. 若用户未登录，展示登录/建档迎宾门户（满足个性化学习服务门槛要求）
  if (!user) {
    return <LoginGate onLoginSuccess={() => navigate('#/console')} />
  }

  // 2. 登录后进入现代化控制台工作台（左侧常驻功能侧边栏 + 右侧主工作区）
  return (
    <div className={`cscope-workspace-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* 最左侧展示全部功能入口：切换其他功能无需返回首页 */}
      <SidebarNav
        activeKey={route.kind}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        onSelectNav={(key) => {
          if (key === 'console') goConsole()
          else if (key === 'courses') openCourses()
          else if (key === 'exam') openExam()
          else if (key === 'profile') openProfile()
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
            {route.kind === 'courses' && <span className="crumb-current">课程知识中心</span>}
            {route.kind === 'exam' && <span className="crumb-current">408 考研真题测评</span>}
            {route.kind === 'profile' && <span className="crumb-current">学情画像与学习档案</span>}
            {route.kind === 'course' && (
              <>
                <button type="button" className="crumb-btn" onClick={openCourses}>课程中心</button>
                <span className="crumb-sep">/</span>
                <span className="crumb-current">{activeCourse?.title || '专项课程'}</span>
              </>
            )}
            {route.kind === 'lab' && (
              <>
                <button type="button" className="crumb-btn" onClick={openCourses}>课程中心</button>
                <span className="crumb-sep">/</span>
                <button type="button" className="crumb-btn" onClick={() => openCourse(experimentCourse?.id)}>
                  {experimentCourse?.title}
                </button>
                <span className="crumb-sep">/</span>
                <span className="crumb-current">{experiment?.title}</span>
              </>
            )}
          </div>

          <div className="header-right">
            <div className="header-user-badge">
              <span className="header-avatar">{user.name.slice(0, 1).toUpperCase()}</span>
              <span className="header-name">{user.name}</span>
              <span className="header-status-pill">408在线研习</span>
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
            /* 控制台主页面（参考 JobPilot 控制台风格，问候、AI导学、核心指标、三大入口、最近测评与学科诊断） */
            <ConsoleDashboard
              onOpenCourses={openCourses}
              onOpenExam={openExam}
              onOpenProfile={openProfile}
              onOpenExperiment={openExperiment}
            />
          ) : route.kind === 'courses' ? (
            /* 课程知识库视图 */
            <ExperimentHub
              courses={courses}
              activeCourseId={activeCourseId}
              onOpen={openExperiment}
              onSelectCourse={openCourse}
              onBack={goConsole}
              onShowProfile={openProfile}
              onLogin={() => {}}
            />
          ) : route.kind === 'profile' ? (
            /* 个人学情中心与能力画像 */
            <LearningDashboard
              experiments={experiments}
              courses={courses}
              onOpen={openExperiment}
              onBack={goConsole}
            />
          ) : route.kind === 'exam' ? (
            /* 408 考研真题测评中心（105道真题、自定义题量时长、错题直达实验） */
            <ExamArena
              onOpenExperiment={openExperiment}
              onBackHome={goConsole}
            />
          ) : Experiment && experiment ? (
            /* 具体的微观仿真实验页面：左侧侧边栏依然固定存在，随时一键跳转其他模块 */
            <main className="experiment-page" key={activeExperiment}>
              <Experiment experiment={experiment} />
            </main>
          ) : (
            <ConsoleDashboard
              onOpenCourses={openCourses}
              onOpenExam={openExam}
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
  if (window.location.hash === '#/profile') return { kind: 'profile', id: null }
  if (window.location.hash === '#/exam') return { kind: 'exam', id: null }
  if (window.location.hash === '#/courses') return { kind: 'courses', id: null }
  if (window.location.hash === '#/console') return { kind: 'console', id: null }
  const labMatch = window.location.hash.match(/^#\/lab\/([a-z-]+)$/)
  if (experiments.some((item) => item.id === labMatch?.[1])) return { kind: 'lab', id: labMatch[1] }
  const courseMatch = window.location.hash.match(/^#\/course\/([a-z-]+)$/)
  if (courses.some((item) => item.id === courseMatch?.[1])) return { kind: 'course', id: courseMatch[1] }
  return { kind: 'console', id: null }
}
