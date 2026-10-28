import React, { useEffect, useState } from 'react'
import AttentionExperiment from './AttentionExperiment'
import DijkstraExperiment from './DijkstraExperiment'
import ExperimentHub from './ExperimentHub'
import SchedulingExperiment from './SchedulingExperiment'
import { experiments } from '../lib/experimentRegistry'
import './app.css'

const experimentComponents = {
  attention: AttentionExperiment,
  dijkstra: DijkstraExperiment,
  scheduling: SchedulingExperiment,
}

export default function App() {
  const [activeExperiment, setActiveExperiment] = useState(readExperimentFromHash)
  const experiment = experiments.find((item) => item.id === activeExperiment)
  const Experiment = experimentComponents[activeExperiment]

  useEffect(() => {
    const syncRoute = () => setActiveExperiment(readExperimentFromHash())
    window.addEventListener('hashchange', syncRoute)
    return () => window.removeEventListener('hashchange', syncRoute)
  }, [])

  function navigate(experimentId) {
    const nextHash = experimentId ? `#/lab/${experimentId}` : ''
    if (window.location.hash === nextHash) setActiveExperiment(experimentId)
    else window.location.hash = nextHash
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={() => navigate(null)}>
          <span className="brand-mark">C</span>
          <span><strong>CScope</strong><small>计算机原理可视化实验室</small></span>
        </button>
        <nav className="topbar-nav" aria-label="主导航">
          <button className={!activeExperiment ? 'active' : ''} type="button" onClick={() => navigate(null)}>实验大厅</button>
          <span className="phase-badge">比赛版 · 3 个实验</span>
        </nav>
      </header>
      {Experiment && experiment ? (
        <main className="experiment-page">
          <div className="breadcrumb">
            <button type="button" onClick={() => navigate(null)}>实验大厅</button>
            <span>/</span><span>{experiment.title}</span>
          </div>
          <Experiment experiment={experiment} />
        </main>
      ) : <ExperimentHub experiments={experiments} onOpen={navigate} />}
    </div>
  )
}

function readExperimentFromHash() {
  const match = window.location.hash.match(/^#\/lab\/([a-z-]+)$/)
  const experimentId = match?.[1]
  return experiments.some((item) => item.id === experimentId) ? experimentId : null
}
