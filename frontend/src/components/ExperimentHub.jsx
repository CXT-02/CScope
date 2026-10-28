import React from 'react'

export default function ExperimentHub({ experiments, onOpen }) {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">不只告诉你答案，让知识在眼前运行</span>
          <h1>把抽象的计算机原理，<br /><em>变成可以动手的实验。</em></h1>
          <p>从人工智能、算法到操作系统，通过逐步动画、参数调节和结果对比，真正看懂每一个过程为什么发生。</p>
          <button className="primary-button" type="button" onClick={() => onOpen('attention')}>开始第一个实验 <span>→</span></button>
        </div>
        <div className="hero-visual" aria-label="知识可视化示意">
          <div className="orbit orbit-one"><span>输入</span><i /></div>
          <div className="orbit orbit-two"><span>过程</span><i /></div>
          <div className="orbit orbit-three"><span>理解</span><i /></div>
          <div className="core-orb">可视化<br />实验</div>
        </div>
      </section>

      <section className="hub-section">
        <div className="section-heading">
          <div><span className="eyebrow">EXPLORE LABS</span><h2>选择一个实验开始探索</h2></div>
          <p>三个模块覆盖人工智能、算法与操作系统，所有实验均可直接操作。</p>
        </div>
        <div className="experiment-grid">
          {experiments.map((experiment, index) => (
            <button className="experiment-card" type="button" key={experiment.id} onClick={() => onOpen(experiment.id)} style={{ '--accent': experiment.accent }}>
              <span className="card-index">0{index + 1}</span><span className="card-icon">{experiment.icon}</span>
              <span className="card-category">{experiment.category}</span><strong>{experiment.title}</strong>
              <span className="card-description">{experiment.description}</span>
              <span className="concept-list">{experiment.concepts.map((concept) => <i key={concept}>{concept}</i>)}</span>
              <span className="card-action">进入实验 <b>↗</b></span>
            </button>
          ))}
        </div>
      </section>

      <section className="learning-flow">
        <span className="eyebrow">HOW IT WORKS</span><h2>从“听懂了”到“真的会了”</h2>
        <div className="flow-steps">
          {[
            ['01', '提出问题', '带着一个真实困惑进入实验'], ['02', '动手验证', '调节参数并预测结果'],
            ['03', '观察过程', '逐帧看到原理如何运行'], ['04', '形成理解', '比较结果并总结规律'],
          ].map(([number, title, text]) => <div className="flow-step" key={number}><span>{number}</span><strong>{title}</strong><p>{text}</p></div>)}
        </div>
      </section>
    </main>
  )
}
