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
        <div><span className="eyebrow">理解自测 · 可选</span><h2>用 4 步检查自己是否真的理解</h2><p>这部分不是新的实验，也不影响上方操作；它帮助你把“看过动画”变成“能解释规律”。</p></div>
        <div className="cycle-progress"><strong>{progress}/4</strong><span>已完成</span></div>
      </div>
      <div className="cycle-purpose"><strong>为什么要做这四步？</strong><p>只看动画很容易产生“好像懂了”的感觉。先猜结果，再亲手改变参数，然后对照系统解释，最后用自己的话总结，才能发现理解中的偏差。</p><span>预测结果 → 动手验证 → 对照解释 → 总结规律</span></div>
      <div className="cycle-grid">
        <article className={checked ? 'cycle-card complete' : 'cycle-card'}>
          <span className="cycle-number">01 · 先猜一猜</span><h3>{prediction.question}</h3>
          <div className="prediction-options">{prediction.options.map((option) => <button className={selected === option ? 'selected' : ''} type="button" key={option} onClick={() => setSelected(option)}>{option}</button>)}</div>
          <button className="cycle-action" type="button" disabled={!selected} onClick={() => setChecked(true)}>查看答案与解释</button>
          {checked && <p className={selected === prediction.answer ? 'feedback correct' : 'feedback'}>{selected === prediction.answer ? '预测正确。' : `更准确的答案是“${prediction.answer}”。`}{prediction.explanation}</p>}
        </article>
        <article className={operationDone ? 'cycle-card complete' : 'cycle-card'}><span className="cycle-number">02 · 按提示动手</span><h3>{operation.title}</h3><p>{operation.instruction}</p><button className="cycle-action secondary" type="button" onClick={() => setOperationDone((value) => !value)}>{operationDone ? '我想重新操作' : '我已经操作过'}</button></article>
        <article className={observationDone ? 'cycle-card complete' : 'cycle-card'}><span className="cycle-number">03 · 对照结果</span><h3>系统如何解释刚才的结果？</h3><div className="observation-value">{operationDone ? observation : '先完成第 2 步，系统再结合当前参数解释你看到的结果。'}</div></article>
        <article className={saved ? 'cycle-card complete' : 'cycle-card'}>
          <span className="cycle-number">04 · 用自己的话总结</span><h3>{summaryPrompt}</h3>
          <textarea rows="4" value={reflection} onChange={(event) => { setReflection(event.target.value); setSaved(false) }} placeholder="不用写标准答案，只需写下你刚刚观察到的规律。" />
          <button className="cycle-action" type="button" disabled={!reflection.trim()} onClick={saveReflection}>{saved ? '总结已保存到本机' : '保存这次总结'}</button>
        </article>
      </div>
    </section>
  )
}
