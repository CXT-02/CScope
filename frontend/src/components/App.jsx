import React, { useState } from 'react'
import AttentionExperiment from './AttentionExperiment'
import DijkstraExperiment from './DijkstraExperiment'
import ExperimentHub from './ExperimentHub'
import { experiments } from '../lib/experimentRegistry'
import './app.css'

const experimentComponents = {
  attention: AttentionExperiment,
  dijkstra: DijkstraExperiment,
}

export default function App() {
  const [activeExperiment, setActiveExperiment] = useState(null)
  const experiment = experiments.find((item) => item.id === activeExperiment)
  const Experiment = experimentComponents[activeExperiment]

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={() => setActiveExperiment(null)}>
          <span className="brand-mark">C</span>
          <span><strong>CScope</strong><small>计算机原理可视化实验室</small></span>
        </button>
        <nav className="topbar-nav" aria-label="主导航">
          <button className={!activeExperiment ? 'active' : ''} type="button" onClick={() => setActiveExperiment(null)}>实验大厅</button>
          <span className="phase-badge">比赛版 · 3 个实验</span>
        </nav>
      </header>
      {Experiment && experiment ? (
        <main className="experiment-page">
          <div className="breadcrumb">
            <button type="button" onClick={() => setActiveExperiment(null)}>实验大厅</button>
            <span>/</span><span>{experiment.title}</span>
          </div>
          <Experiment experiment={experiment} />
        </main>
      ) : <ExperimentHub experiments={experiments} onOpen={setActiveExperiment} />}
    </div>
  )
}
