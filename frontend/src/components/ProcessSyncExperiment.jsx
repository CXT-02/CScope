import React, { useState, useEffect, useRef } from 'react'

const BUFFER_CAPACITY = 5

const initialStorySteps = [
  {
    tag: '01 · 核心概念',
    title: '临界资源与临界区：并发中的秩序保障',
    summary: '多进程并发执行时，共享打印机、共享变量等同一时刻只允许一个进程使用的资源称为“临界资源”。访问临界资源的代码段称为“临界区”。',
    why: '如果不加控制地同时写入共享数据，会导致竞争条件（Race Condition），产生不可预测的数据覆盖与脏数据。',
    visual: 'critical_section',
    status: { mutex: 1, inCS: '无', state: '空闲让进' }
  },
  {
    tag: '02 · 准则约束',
    title: '临界区互斥访问的四项黄金准则',
    summary: '①空闲让进（资源空闲立即允许申请者进入）；②忙则等待（已有进程在内则后来者必须等待）；③有限等待（不能让进程陷入无限等待）；④让权等待（不能占用 CPU 盲等，应当睡眠阻塞）。',
    why: '让权等待是信号量机制相较于软件轮询自旋锁（忙等）的核心优势。',
    visual: 'four_principles',
    status: { mutex: 0, inCS: '进程 P1', state: '忙则等待' }
  },
  {
    tag: '03 · 机制原理',
    title: 'Dijkstra 信号量机制与 P/V 原语',
    summary: '信号量 S 是一个整型变量，仅能通过两个不可中断的原子原语访问：P(S) 表示申请资源（S--; 若 S<0 则阻塞入队）；V(S) 表示释放资源（S++; 若 S<=0 则唤醒队列中的进程）。',
    why: 'P/V 原语保证了资源计数与进程阻塞/唤醒的原子性，彻底消除了竞态条件。',
    visual: 'pv_primitive',
    status: { S: 1, action: 'P(S) 申请成功', queueLen: 0 }
  },
  {
    tag: '04 · 经典模型',
    title: '生产者-消费者问题：同步与互斥的典范',
    summary: '一组生产者进程和一组消费者进程共享固定大小的缓冲区。生产者在缓冲区不满时生产，消费者在缓冲区不空时消费。',
    why: '包含两类约束：①互斥约束（对缓冲区的互斥访问）；②同步约束（空/满依赖关系，空不能消费，满不能生产）。',
    visual: 'producer_consumer',
    status: { mutex: 1, empty: 5, full: 0 }
  },
  {
    tag: '05 · 关键陷阱',
    title: 'P 操作的顺序至关重要：谨防死锁',
    summary: '在生产者中必须“先 P(empty) 再 P(mutex)”。若颠倒为“先 P(mutex) 后 P(empty)”，当缓冲区已满时，生产者占有互斥锁后因 empty=0 被阻塞，消费者想消费却因拿不到互斥锁同样被阻塞，导致死锁！',
    why: '申请资源信号量必须在外层，申请互斥信号量必须紧随临界区边界。',
    visual: 'order_danger',
    status: { warning: '死锁警告：互斥锁死锁' }
  },
  {
    tag: '06 · 经典扩展',
    title: '读者-写者与哲学家进餐：并发三大题',
    summary: '①读者-写者问题：允许多个读者同时读，但写者必须独占，分为读者优先与写者优先；②哲学家进餐问题：5 位哲学家共享 5 根筷子，必须破坏循环等待（如奇偶规则、最多允许 4 人同时拿）才能避免死锁。',
    why: '这些模型覆盖了现代数据库并发事务、文件系统锁以及多线程编程的核心底层。',
    visual: 'summary',
    status: { models: '生产者-消费者 / 读者-写者 / 哲学家进餐' }
  }
]

function SyncStory() {
  const [step, setStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStep(prev => {
          if (prev >= initialStorySteps.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 3500)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isPlaying])

  const cur = initialStorySteps[step]

  return (
    <div className="story-card">
      <div className="story-nav">
        {initialStorySteps.map((s, idx) => (
          <button
            key={idx}
            className={`story-dot ${idx === step ? 'active' : ''} ${idx < step ? 'done' : ''}`}
            onClick={() => { setStep(idx); setIsPlaying(false) }}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      <div className="story-body" style={{ minHeight: '340px' }}>
        <div className="story-tag">{cur.tag}</div>
        <h3 className="story-title" style={{ fontSize: '1.4rem', marginTop: '6px' }}>{cur.title}</h3>
        <p className="story-desc" style={{ fontSize: '1.05rem', lineHeight: '1.7', color: '#cbd5e1' }}>{cur.summary}</p>
        
        <div className="story-highlight-box" style={{ background: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid #3b82f6', padding: '12px 16px', borderRadius: '4px', margin: '14px 0' }}>
          <strong style={{ color: '#60a5fa' }}>💡 考点聚焦：</strong>
          <span style={{ color: '#e2e8f0', fontSize: '0.95rem' }}>{cur.why}</span>
        </div>

        {/* 动态可视化展示区 */}
        <div className="story-visual-pane" style={{ background: '#0f172a', borderRadius: '8px', padding: '16px', border: '1px solid #334155' }}>
          {cur.visual === 'critical_section' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
              <div style={{ padding: '12px 20px', background: '#1e293b', border: '2px dashed #94a3b8', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>普通代码区</div>
                <div style={{ color: '#f8fafc', fontWeight: 'bold' }}>进程 P1 / P2</div>
              </div>
              <div style={{ color: '#60a5fa', fontSize: '1.5rem' }}>➔</div>
              <div style={{ padding: '16px 24px', background: 'rgba(239, 68, 68, 0.15)', border: '2px solid #ef4444', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ color: '#f87171', fontSize: '0.85rem', fontWeight: 'bold' }}>⚠️ 临界区 (Critical Section)</div>
                <div style={{ color: '#fca5a5', marginTop: '4px' }}>同一时刻仅允许 1 个进程</div>
                <div style={{ fontSize: '0.85rem', color: '#fef08a', marginTop: '4px' }}>当前状态: {cur.status.inCS}</div>
              </div>
              <div style={{ color: '#60a5fa', fontSize: '1.5rem' }}>➔</div>
              <div style={{ padding: '12px 20px', background: '#1e293b', border: '2px dashed #94a3b8', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>退出区</div>
                <div style={{ color: '#10b981' }}>释放互斥锁</div>
              </div>
            </div>
          )}

          {cur.visual === 'four_principles' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', textAlign: 'center', borderTop: '3px solid #10b981' }}>
                <div style={{ color: '#34d399', fontWeight: 'bold' }}>1. 空闲让进</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>无进程在临界区时，允许等待进程立即进入</div>
              </div>
              <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', textAlign: 'center', borderTop: '3px solid #ef4444' }}>
                <div style={{ color: '#f87171', fontWeight: 'bold' }}>2. 忙则等待</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>已有进程在临界区时，其他进程必须等待</div>
              </div>
              <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', textAlign: 'center', borderTop: '3px solid #f59e0b' }}>
                <div style={{ color: '#fbbf24', fontWeight: 'bold' }}>3. 有限等待</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>等待时间有限，杜绝进程饿死</div>
              </div>
              <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', textAlign: 'center', borderTop: '3px solid #3b82f6' }}>
                <div style={{ color: '#60a5fa', fontWeight: 'bold' }}>4. 让权等待</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>进不去临界区应立即释放 CPU 阻塞自己</div>
              </div>
            </div>
          )}

          {cur.visual === 'pv_primitive' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ background: '#1e293b', padding: '12px', borderRadius: '6px', fontFamily: 'monospace' }}>
                <div style={{ color: '#f59e0b', fontWeight: 'bold', marginBottom: '4px' }}>P(S) 操作 (Wait / 申请)</div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>S = S - 1;</div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>if (S &lt; 0) {'{'}</div>
                <div style={{ color: '#f87171', fontSize: '0.85rem', paddingLeft: '12px' }}>block(); // 阻塞入队并让出CPU</div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{'}'}</div>
              </div>
              <div style={{ background: '#1e293b', padding: '12px', borderRadius: '6px', fontFamily: 'monospace' }}>
                <div style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '4px' }}>V(S) 操作 (Signal / 释放)</div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>S = S + 1;</div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>if (S &lt;= 0) {'{'}</div>
                <div style={{ color: '#34d399', fontSize: '0.85rem', paddingLeft: '12px' }}>wakeup(); // 唤醒等待队列队首</div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{'}'}</div>
              </div>
            </div>
          )}

          {cur.visual === 'producer_consumer' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ color: '#60a5fa', fontWeight: 'bold' }}>生产者进程</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>需要 empty &amp; mutex</div>
              </div>
              <div style={{ flex: 1, margin: '0 16px', display: 'flex', gap: '6px', justifyContent: 'center' }}>
                {[0, 1, 2, 3, 4].map(idx => (
                  <div key={idx} style={{ width: '40px', height: '40px', border: '2px solid #3b82f6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: idx < 2 ? 'rgba(59, 130, 246, 0.3)' : 'transparent', color: '#fff', fontSize: '0.85rem' }}>
                    {idx < 2 ? '📦' : '空'}
                  </div>
                ))}
              </div>
              <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ color: '#34d399', fontWeight: 'bold' }}>消费者进程</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>需要 full &amp; mutex</div>
              </div>
            </div>
          )}

          {cur.visual === 'order_danger' && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '6px', padding: '12px' }}>
              <div style={{ color: '#f87171', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>❌ 错误写法导致死锁：</span>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#fca5a5', marginTop: '6px' }}>
                <div>生产者: P(mutex); P(empty); // 缓冲区满时占用 mutex 阻塞等待 empty</div>
                <div>消费者: P(mutex); P(full);  // 想消费但 mutex 被生产者死锁扣押，全系统停滞！</div>
              </div>
              <div style={{ color: '#34d399', fontWeight: 'bold', marginTop: '8px' }}>
                <span>✅ 正确写法：先申请资源信号量，再申请互斥锁</span>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#86efac', marginTop: '4px' }}>
                <div>生产者: P(empty); P(mutex); [放入产品]; V(mutex); V(full);</div>
                <div>消费者: P(full);  P(mutex); [取出产品]; V(mutex); V(empty);</div>
              </div>
            </div>
          )}

          {cur.visual === 'summary' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px' }}>
                <div style={{ color: '#60a5fa', fontWeight: 'bold' }}>生产者-消费者</div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '4px' }}>同步信号量控制空/满，互斥信号量控制单人修改缓冲。</div>
              </div>
              <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px' }}>
                <div style={{ color: '#34d399', fontWeight: 'bold' }}>读者-写者</div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '4px' }}>第一个读者加互斥锁，最后一个读者解互斥锁（计数器法）。</div>
              </div>
              <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px' }}>
                <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>哲学家进餐</div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '4px' }}>死锁高发模型。通过资源有序分配或限制并发人数防死锁。</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="story-footer">
        <button
          className="btn-story"
          disabled={step === 0}
          onClick={() => { setStep(s => Math.max(0, s - 1)); setIsPlaying(false) }}
        >
          ← 上一步
        </button>
        <button
          className={`btn-story ${isPlaying ? 'active' : ''}`}
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? '暂停' : '▶ 自动演示'}
        </button>
        <button
          className="btn-story"
          disabled={step === initialStorySteps.length - 1}
          onClick={() => { setStep(s => Math.min(initialStorySteps.length - 1, s + 1)); setIsPlaying(false) }}
        >
          下一步 →
        </button>
      </div>
    </div>
  )
}

export default function ProcessSyncExperiment() {
  // 环形缓冲区状态
  const [buffer, setBuffer] = useState([
    { id: 1, name: '数据块#1' },
    { id: 2, name: '数据块#2' },
    null,
    null,
    null
  ])
  const [inPtr, setInPtr] = useState(2)
  const [outPtr, setOutPtr] = useState(0)

  // 信号量
  const [mutex, setMutex] = useState(1) // 互斥信号量
  const [empty, setEmpty] = useState(3) // 空闲缓冲区
  const [full, setFull] = useState(2)   // 已满缓冲区

  // 阻塞队列
  const [producerQueue, setProducerQueue] = useState([])
  const [consumerQueue, setConsumerQueue] = useState([])

  // 日志
  const [logs, setLogs] = useState([
    { time: '00:00', text: '系统初始化完成，缓冲区容量 5，当前存有 2 个数据块。', type: 'info' }
  ])

  // 当前进入临界区的进程（用于高亮动画）
  const [activeProcess, setActiveProcess] = useState(null)

  // 错误测试开关：颠倒P操作顺序（演示死锁）
  const [reverseOrderTest, setReverseOrderTest] = useState(false)

  // 辅助添加日志
  const addLog = (text, type = 'info') => {
    const time = new Date().toTimeString().split(' ')[0]
    setLogs(prev => [{ time, text, type }, ...prev.slice(0, 24)])
  }

  // 生产者操作
  const handleProduce = () => {
    if (activeProcess) {
      addLog('临界区已被占用，请等待当前操作完成！', 'warning')
      return
    }

    const nextId = Date.now() % 1000
    const newItem = { id: nextId, name: `数据块#${nextId}` }

    if (reverseOrderTest) {
      // 颠倒顺序演示：先 P(mutex) 后 P(empty)
      addLog(`[生产者] 颠倒测试：执行 P(mutex)，成功获取互斥锁！`, 'info')
      setMutex(0)
      setActiveProcess('生产者 (持有互斥锁)')

      if (empty <= 0) {
        addLog(`[生产者] 执行 P(empty)，empty <= 0！生产者被阻塞，但未释放 mutex！`, 'error')
        setProducerQueue(prev => [...prev, newItem])
        addLog(`🚨 此时互斥锁被生产者持有并阻塞，消费者无法获取 mutex，全系统死锁！`, 'error')
      } else {
        setEmpty(e => e - 1)
        setTimeout(() => {
          setBuffer(prev => {
            const next = [...prev]
            next[inPtr] = newItem
            return next
          })
          setInPtr((inPtr + 1) % BUFFER_CAPACITY)
          setFull(f => f + 1)
          setMutex(1)
          setActiveProcess(null)
          addLog(`[生产者] 生产 ${newItem.name} 成功入队，释放 mutex 并执行 V(full)。`, 'success')
        }, 500)
      }
      return
    }

    // 正规流程：先 P(empty)
    if (empty <= 0) {
      addLog(`[生产者] P(empty) 失败 (empty=0)：缓冲区已满！生产者被挂起并加入阻塞队列。`, 'warning')
      setProducerQueue(prev => [...prev, newItem])
      return
    }

    // P(empty) 成功
    setEmpty(e => e - 1)
    addLog(`[生产者] 执行 P(empty)，空槽位 -1 (剩余 ${empty - 1})`, 'info')

    // P(mutex)
    setMutex(0)
    setActiveProcess('生产者')
    addLog(`[生产者] 执行 P(mutex)，获得临界区独占访问权`, 'info')

    setTimeout(() => {
      // 写入缓冲区
      setBuffer(prev => {
        const next = [...prev]
        next[inPtr] = newItem
        return next
      })
      const nextIn = (inPtr + 1) % BUFFER_CAPACITY
      setInPtr(nextIn)
      addLog(`[生产者] 在槽位 [${inPtr}] 放入 ${newItem.name}`, 'success')

      // V(mutex)
      setMutex(1)
      setActiveProcess(null)
      addLog(`[生产者] 执行 V(mutex)，退出临界区`, 'info')

      // V(full)
      setFull(f => {
        const nextFull = f + 1
        addLog(`[生产者] 执行 V(full)，满槽位 +1 (当前 ${nextFull})`, 'info')
        return nextFull
      })

      // 检查是否有等待消费的消费者
      setConsumerQueue(cq => {
        if (cq.length > 0) {
          addLog(`[唤醒] 检测到阻塞队列中有消费者，已被 V(full) 唤醒！`, 'success')
          return cq.slice(1)
        }
        return cq
      })
    }, 600)
  }

  // 消费者操作
  const handleConsume = () => {
    if (activeProcess) {
      addLog('临界区已被占用，请等待当前操作完成！', 'warning')
      return
    }

    if (reverseOrderTest && mutex === 0) {
      addLog(`[消费者] 试图执行 P(mutex)，但互斥锁被阻塞的生产者死锁扣押，消费者被无限期阻塞！`, 'error')
      setConsumerQueue(prev => [...prev, `消费任务#${Date.now() % 1000}`])
      return
    }

    // 正规流程：先 P(full)
    if (full <= 0) {
      addLog(`[消费者] P(full) 失败 (full=0)：缓冲区为空！消费者被挂起并加入阻塞队列。`, 'warning')
      setConsumerQueue(prev => [...prev, `消费任务#${Date.now() % 1000}`])
      return
    }

    // P(full) 成功
    setFull(f => f - 1)
    addLog(`[消费者] 执行 P(full)，产品数 -1 (剩余 ${full - 1})`, 'info')

    // P(mutex)
    setMutex(0)
    setActiveProcess('消费者')
    addLog(`[消费者] 执行 P(mutex)，获得临界区独占访问权`, 'info')

    setTimeout(() => {
      const removedItem = buffer[outPtr]
      // 从缓冲区取出
      setBuffer(prev => {
        const next = [...prev]
        next[outPtr] = null
        return next
      })
      const nextOut = (outPtr + 1) % BUFFER_CAPACITY
      setOutPtr(nextOut)
      addLog(`[消费者] 从槽位 [${outPtr}] 取出 ${removedItem ? removedItem.name : '数据'}`, 'success')

      // V(mutex)
      setMutex(1)
      setActiveProcess(null)
      addLog(`[消费者] 执行 V(mutex)，退出临界区`, 'info')

      // V(empty)
      setEmpty(e => {
        const nextEmpty = e + 1
        addLog(`[消费者] 执行 V(empty)，空位 +1 (当前 ${nextEmpty})`, 'info')
        return nextEmpty
      })

      // 检查是否有等待生产的生产者
      setProducerQueue(pq => {
        if (pq.length > 0) {
          addLog(`[唤醒] 检测到阻塞队列中有生产者，已被 V(empty) 唤醒！`, 'success')
          return pq.slice(1)
        }
        return pq
      })
    }, 600)
  }

  // 重置实验室
  const handleReset = () => {
    setBuffer([
      { id: 1, name: '数据块#1' },
      { id: 2, name: '数据块#2' },
      null,
      null,
      null
    ])
    setInPtr(2)
    setOutPtr(0)
    setMutex(1)
    setEmpty(3)
    setFull(2)
    setProducerQueue([])
    setConsumerQueue([])
    setActiveProcess(null)
    setReverseOrderTest(false)
    addLog('已重置缓冲区为初始状态。', 'info')
  }

  return (
    <div className="experiment-container">
      {/* 头部标题与导学区 */}
      <div className="experiment-header">
        <div className="experiment-title-row">
          <div>
            <h1 className="experiment-title">进程同步与互斥 (Synchronization &amp; Mutex)</h1>
            <p className="experiment-desc">
              掌握临界区、原子性 P/V 操作与信号量机制，探索经典生产者-消费者模型的缓冲区同步控制与防死锁设计。
            </p>
          </div>
          <span className="badge badge-os">操作系统 OS</span>
        </div>
      </div>

      <SyncStory />

      {/* 自由探索交互实验室 */}
      <div className="lab-section" style={{ marginTop: '24px' }}>
        <div className="section-title">
          <h2>自由探索：生产者-消费者 (Producer-Consumer) 协同实验室</h2>
          <p>动手触发生产与消费，实时观测信号量计数（mutex、empty、full）、阻塞队列与环形缓冲区的动态变化。</p>
        </div>

        <div className="experiment-grid" style={{ gridTemplateColumns: '320px 1fr' }}>
          {/* 左侧控制面板 */}
          <div className="control-panel">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#1e293b' }}>🎮 进程动作控制器</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
                onClick={handleProduce}
                disabled={activeProcess !== null}
              >
                <span>🏭 生产一个数据块</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>(Producer)</span>
              </button>

              <button
                className="btn btn-success"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#10b981', color: '#fff', border: 'none' }}
                onClick={handleConsume}
                disabled={activeProcess !== null}
              >
                <span>🛒 消费一个数据块</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>(Consumer)</span>
              </button>
            </div>

            <div style={{ marginTop: '20px', padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#334155', marginBottom: '8px' }}>
                🧪 考点对比实验
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', color: reverseOrderTest ? '#ef4444' : '#64748b' }}>
                <input
                  type="checkbox"
                  checked={reverseOrderTest}
                  onChange={e => setReverseOrderTest(e.target.checked)}
                />
                <span style={{ fontWeight: reverseOrderTest ? 'bold' : 'normal' }}>
                  颠倒 P 操作顺序 (模拟死锁)
                </span>
              </label>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '6px' }}>
                勾选后，生产者将先申请 mutex 再申请 empty。当缓冲区满时，将导致全系统锁死！
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={handleReset}>
                🔄 重置实验室状态
              </button>
            </div>

            {/* 临界区当前状态 */}
            <div style={{ marginTop: '20px', padding: '12px', borderRadius: '8px', background: activeProcess ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', border: `1px solid ${activeProcess ? '#ef4444' : '#10b981'}` }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>临界区占用状态</div>
              <div style={{ fontWeight: 'bold', marginTop: '4px', color: activeProcess ? '#dc2626' : '#059669' }}>
                {activeProcess ? `🔒 正在访问: ${activeProcess}` : '🔓 空闲 (允许进入)'}
              </div>
            </div>
          </div>

          {/* 右侧可视化看板 */}
          <div className="display-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 信号量看板 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              <div className="semaphore-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>互斥信号量</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#3b82f6', margin: '4px 0' }}>mutex = {mutex}</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>保护缓冲区原子访问 (初值 1)</div>
              </div>

              <div className="semaphore-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>资源信号量 (空位数)</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#10b981', margin: '4px 0' }}>empty = {empty}</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>剩余可存放数量 (初值 5)</div>
              </div>

              <div className="semaphore-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>资源信号量 (产品数)</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#f59e0b', margin: '4px 0' }}>full = {full}</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>当前已有产品数量 (初值 0)</div>
              </div>
            </div>

            {/* 环形缓冲区 (Circular Buffer) 示意图 */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ margin: 0, color: '#1e293b' }}>📦 共享环形缓冲区 (Buffer [0..4])</h4>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  写入指针 in = <strong style={{ color: '#3b82f6' }}>{inPtr}</strong>，读取指针 out = <strong style={{ color: '#10b981' }}>{outPtr}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', margin: '20px 0' }}>
                {buffer.map((item, idx) => {
                  const isIn = idx === inPtr
                  const isOut = idx === outPtr
                  return (
                    <div
                      key={idx}
                      style={{
                        height: '110px',
                        border: `2px solid ${item ? '#3b82f6' : '#cbd5e1'}`,
                        borderRadius: '8px',
                        background: item ? '#eff6ff' : '#f8fafc',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <span style={{ position: 'absolute', top: '6px', left: '8px', fontSize: '0.75rem', color: '#94a3b8' }}>
                        槽位 [{idx}]
                      </span>

                      {item ? (
                        <>
                          <span style={{ fontSize: '1.6rem' }}>📦</span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#1e40af', marginTop: '4px' }}>{item.name}</span>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>（空闲）</span>
                      )}

                      {/* 指针指示器 */}
                      <div style={{ position: 'absolute', bottom: '-26px', display: 'flex', gap: '4px' }}>
                        {isIn && (
                          <span style={{ background: '#3b82f6', color: '#fff', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px' }}>
                            in ➔
                          </span>
                        )}
                        {isOut && (
                          <span style={{ background: '#10b981', color: '#fff', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px' }}>
                            out ➔
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* 阻塞队列状态 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '36px', paddingTop: '16px', borderTop: '1px dashed #e2e8f0' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>
                    ⛔ 生产者阻塞等待队列 (Wait empty): {producerQueue.length} 个
                  </div>
                  <div style={{ minHeight: '32px', marginTop: '6px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {producerQueue.length === 0 ? (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>无等待进程</span>
                    ) : (
                      producerQueue.map((item, idx) => (
                        <span key={idx} style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem' }}>
                          待产 {item.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>
                    ⛔ 消费者阻塞等待队列 (Wait full): {consumerQueue.length} 个
                  </div>
                  <div style={{ minHeight: '32px', marginTop: '6px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {consumerQueue.length === 0 ? (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>无等待进程</span>
                    ) : (
                      consumerQueue.map((cName, idx) => (
                        <span key={idx} style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem' }}>
                          {cName}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 实时执行日志 */}
            <div style={{ background: '#0f172a', borderRadius: '8px', padding: '14px 18px', color: '#f8fafc', fontFamily: 'monospace' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #334155', paddingBottom: '6px' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>📋 进程调度与 P/V 原语实时执行日志</span>
                <span style={{ color: '#64748b', fontSize: '0.78rem' }}>原子指令流水</span>
              </div>
              <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {logs.map((l, i) => (
                  <div key={i} style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>
                    <span style={{ color: '#64748b', marginRight: '8px' }}>[{l.time}]</span>
                    <span style={{
                      color: l.type === 'error' ? '#f87171' :
                             l.type === 'warning' ? '#fbbf24' :
                             l.type === 'success' ? '#34d399' : '#93c5fd'
                    }}>
                      {l.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
