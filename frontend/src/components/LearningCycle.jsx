import React, { useEffect, useMemo, useState } from 'react'

export default function LearningCycle({ experimentId, prediction, operation, observation, summaryPrompt }) {
  const storageKey = `cscope-reflection-${experimentId}`
  const [selected, setSelected] = useState('')
  const [checked, setChecked] = useState(false)
  const [operationDone, setOperationDone] = useState(false)
  const [reflection, setReflection] = useState(() => localStorage.getItem(storageKey) || '')
  const [saved, setSaved] = useState(Boolean(localStorage.getItem(storageKey)))
  const observationDone = operationDone && Boolean(observation)
  const progress = useMemo(() => [checked, operationDone, observationDone, saved].filter(Boolean).length, [checked, operationDone, observationDone, saved])

  useEffect(() => setChecked(false), [selected])

  function saveReflection() {
    const value = reflection.trim()
    if (!value) return
    localStorage.setItem(storageKey, value)
    setSaved(true)
  }

  return (
    <section className="learning-cycle">
      <div className="cycle-heading">
        <div><span className="eyebrow">LEARNING LOOP</span><h2>完成一次主动学习循环</h2><p>先预测，再操作；用观察结果修正自己的理解。</p></div>
        <div className="cycle-progress"><strong>{progress}/4</strong><span>学习步骤</span></div>
      </div>
      <div className="cycle-grid">
        <article className={checked ? 'cycle-card complete' : 'cycle-card'}>
          <span className="cycle-number">01 · 预测</span><h3>{prediction.question}</h3>
          <div className="prediction-options">{prediction.options.map((option) => <button className={selected === option ? 'selected' : ''} type="button" key={option} onClick={() => setSelected(option)}>{option}</button>)}</div>
          <button className="cycle-action" type="button" disabled={!selected} onClick={() => setChecked(true)}>验证预测</button>
          {checked && <p className={selected === prediction.answer ? 'feedback correct' : 'feedback'}>{selected === prediction.answer ? '预测正确。' : `更准确的答案是“${prediction.answer}”。`}{prediction.explanation}</p>}
        </article>
        <article className={operationDone ? 'cycle-card complete' : 'cycle-card'}><span className="cycle-number">02 · 操作</span><h3>{operation.title}</h3><p>{operation.instruction}</p><button className="cycle-action secondary" type="button" onClick={() => setOperationDone((value) => !value)}>{operationDone ? '重新操作' : '我已完成操作'}</button></article>
        <article className={observationDone ? 'cycle-card complete' : 'cycle-card'}><span className="cycle-number">03 · 观察</span><h3>当前实验告诉了你什么？</h3><div className="observation-value">{operationDone ? observation : '完成上方操作后，这里会提取当前实验结果。'}</div></article>
        <article className={saved ? 'cycle-card complete' : 'cycle-card'}>
          <span className="cycle-number">04 · 总结</span><h3>{summaryPrompt}</h3>
          <textarea rows="4" value={reflection} onChange={(event) => { setReflection(event.target.value); setSaved(false) }} placeholder="用自己的话写下规律，比复制答案更有效。" />
          <button className="cycle-action" type="button" disabled={!reflection.trim()} onClick={saveReflection}>{saved ? '已保存到本机' : '保存我的总结'}</button>
        </article>
      </div>
    </section>
  )
}
