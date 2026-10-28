import React from 'react'

export default function TheoryPrimer({ title, intro, formula, concepts, goal }) {
  return (
    <section className="theory-primer">
      <div className="theory-heading">
        <span className="theory-step">开始前 · 先读 2 分钟</span>
        <h2>{title}</h2>
        <p>{intro}</p>
      </div>
      {formula && <div className="theory-formula"><span>核心关系</span><code>{formula}</code></div>}
      <div className="theory-concepts">
        {concepts.map((concept, index) => (
          <article key={concept.term}>
            <span>0{index + 1}</span>
            <div><strong>{concept.term}</strong><p>{concept.description}</p></div>
          </article>
        ))}
      </div>
      <div className="theory-goal"><strong>进入实验后要验证什么？</strong><p>{goal}</p></div>
    </section>
  )
}
