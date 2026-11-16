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
  const [accountOpen, setAccountOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const { user, logout, recordVisit } = useLearningProfile()
  const activeExperiment = route.kind === 'lab' ? route.id : null
  const activeCourseId = route.kind === 'course' ? route.id : null
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

  const goHome = () => navigate('')
  const openExperiment = (experimentId) => navigate(`#\/lab\/${experimentId}`)
  const openCourse = (courseId) => navigate(`#\/course\/${courseId}`)
  const openProfile = () => navigate('#/profile')

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={goHome}>
          <span className="brand-mark">C</span>
          <span><strong>CScope</strong><small>计算机原理可视化实验室</small></span>
        </button>
        <nav className="topbar-nav" aria-label="主导航">
          <button className={route.kind === 'home' ? 'active' : ''} type="button" onClick={goHome}>课程首页</button>
          {user ? <div className="account-menu-wrap"><button className={`profile-trigger ${route.kind === 'profile' ? 'active' : ''}`} type="button" onClick={() => setAccountMenuOpen((value) => !value)}><span>{user.name.slice(0, 1).toUpperCase()}</span><strong>{user.name}</strong><i>⌄</i></button>{accountMenuOpen && <div className="account-menu"><button type="button" onClick={() => { setAccountMenuOpen(false); openProfile() }}><span>◎</span><div><strong>我的学习中心</strong><small>进度、记录与个性推荐</small></div></button><button type="button" onClick={() => { setAccountMenuOpen(false); logout(); goHome() }}><span>↪</span><div><strong>退出当前账户</strong><small>记录仍保存在本机</small></div></button></div>}</div> : <button className="login-trigger" type="button" onClick={() => setAccountOpen(true)}>登录 / 注册</button>}
        </nav>
      </header>
      {route.kind === 'profile' ? <LearningDashboard experiments={experiments} courses={courses} onOpen={openExperiment} onBack={goHome} /> : Experiment && experiment ? (
        <main className="experiment-page" key={activeExperiment}>
          <div className="breadcrumb">
            <button type="button" onClick={goHome}>全部课程</button>
            <span>/</span><button type="button" onClick={() => openCourse(experimentCourse?.id)}>{experimentCourse?.title}</button>
            <span>/</span><span>{experiment.title}</span>
          </div>
          <Experiment experiment={experiment} />
        </main>
      ) : <ExperimentHub courses={courses} activeCourseId={activeCourseId} onOpen={openExperiment} onSelectCourse={openCourse} onBack={goHome} onShowProfile={openProfile} onLogin={() => setAccountOpen(true)} />}
      <AccountDialog open={accountOpen} onClose={() => setAccountOpen(false)} />
    </div>
  )
}

function readRouteFromHash() {
  if (window.location.hash === '#/profile') return { kind: 'profile', id: null }
  const labMatch = window.location.hash.match(/^#\/lab\/([a-z-]+)$/)
  if (experiments.some((item) => item.id === labMatch?.[1])) return { kind: 'lab', id: labMatch[1] }
  const courseMatch = window.location.hash.match(/^#\/course\/([a-z-]+)$/)
  if (courses.some((item) => item.id === courseMatch?.[1])) return { kind: 'course', id: courseMatch[1] }
  return { kind: 'home', id: null }
}
