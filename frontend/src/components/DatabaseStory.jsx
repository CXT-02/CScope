import React, { useState } from 'react'

export default function DatabaseStory({ title, subtitle, steps, badge, renderVisual }) {
  const [step, setStep] = useState(0)
  const current = steps[step]
  return (
    <section className="transformer-story db-story">
      <header className="story-intro">
        <div>
          <span className="story-kicker">动画导学 · 约 4 分钟</span>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="db-story-badge">{badge}</div>
      </header>
      <nav className="story-timeline" style={{ '--story-steps': steps.length }}>
        {steps.map((item, index) => (
          <button
            className={`${step === index ? 'active' : ''} ${index < step ? 'passed' : ''}`}
            key={item[0]}
            onClick={() => setStep(index)}
          >
            <i>{index < step ? '✓' : index + 1}</i>
            <span>{item[0]}</span>
          </button>
        ))}
      </nav>
      <div className="story-stage">
        <div className="story-copy">
          <span>0{step + 1} · 数据库原理</span>
          <h3>{current[1]}</h3>
          <p>{current[2]}</p>
          <aside>
            <strong>这一点为什么重要？</strong>
            <p>{current[3]}</p>
          </aside>
        </div>
        <div className="story-visual">
          {renderVisual ? (
            renderVisual(step)
          ) : (
            <div className="db-story-visual">
              <span>DATA</span>
              <b>→</b>
              <i>{current[0]}</i>
              <b>→</b>
              <strong>{step === steps.length - 1 ? '理解规律' : '下一步'}</strong>
            </div>
          )}
        </div>
      </div>
      <footer className="story-controls">
        <button disabled={!step} onClick={() => setStep(step - 1)}>← 上一步</button>
        <button className="story-play" onClick={() => setStep((step + 1) % steps.length)}>播放下一幕</button>
        <button disabled={step === steps.length - 1} onClick={() => setStep(step + 1)}>下一步 →</button>
      </footer>
    </section>
  )
}
