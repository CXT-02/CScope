import React, { useState, useEffect, useMemo, useRef } from 'react'
import { ExperimentHeader } from './AttentionExperiment'
import LearningCycle from './LearningCycle'

const BUFFER_CAPACITY = 5

const STORY_STEPS = [
  {
    kicker: '01 · 核心概念',
    title: '临界资源与临界区：并发中的互斥访问',
    summary: '多进程并发执行时，一次仅允许一个进程使用的资源称为“临界资源”。访问临界资源的代码段称为“临界区”。',
    why: '若无同步互斥机制，多个进程同时写入共享缓冲区会导致竞态条件（Race Condition），造成数据覆盖与脏读。',
    visual: 'critical_section'
  },
  {
    kicker: '02 · 准则约束',
    title: '临界区互斥访问的四项准则',
    summary: '①空闲让进：无进程在临界区时应允许申请者立即进入；②忙则等待：已有进程在临界区时其他进程必须等待；③有限等待：不能使等待进程陷入饿死；④让权等待：不能进入临界区时应释放 CPU 转入阻塞。',
    why: '“让权等待”是信号量机制相较于软件忙等自旋锁（Spinlock）的根本优势，避免了浪费 CPU 时钟周期。',
    visual: 'four_principles'
  },
  {
    kicker: '03 · 机制原理',
    title: 'Dijkstra 信号量机制与 P/V 原语',
    summary: '信号量 S 是一个受保护的整数，仅能通过两个不可中断的原子原语访问：P(S)（申请资源，S 减 1，若小于 0 则阻塞进程并让出 CPU）；V(S)（释放资源，S 加 1，若小于等于 0 则唤醒等待队列队首进程）。',
    why: '原语（Primitive）必须由硬件关中断或底层锁保障原子性，执行过程绝不被上下文切换打断。',
    visual: 'pv_primitive'
  },
  {
    kicker: '04 · 经典模型',
    title: '生产者-消费者问题：同步与互斥的结合',
    summary: '一组生产者与消费者共享有限容量的缓冲区。包含两大约束：互斥约束（同一时刻仅一个进程读写缓冲区，信号量 mutex 初值 1）；同步约束（空缓冲区不能消费，信号量 full 初值 0；满缓冲区不能生产，信号量 empty 初值 N）。',
    why: '同步负责协调进程间的先后时序，互斥负责保护共享数据的独占访问，二者紧密配合。',
    visual: 'producer_consumer'
  },
  {
    kicker: '05 · 关键陷阱',
    title: 'P 操作顺序的死锁陷阱：先资源后互斥',
    summary: '生产者必须先执行 P(empty) 申请空位，再执行 P(mutex) 占用互斥锁。若颠倒为先 P(mutex) 后 P(empty)，当缓冲区满时，生产者占有互斥锁后因 empty 为 0 阻塞，消费者想消费却拿不到互斥锁同样阻塞，产生死锁。',
    why: '信号量申请准则：申请资源信号量必须在外层，申请互斥信号量必须紧随临界区边界。',
    visual: 'order_danger'
  },
  {
    kicker: '06 · 扩展模型',
    title: '并发经典三大题：读者-写者与哲学家进餐',
    summary: '①读者-写者问题：允许多个读者同时读，但写者必须独占，重点在于读者计数器与读者优先/写者优先；②哲学家进餐问题：5 位哲学家拿左右两根筷子进餐，通过破坏循环等待（如奇偶规则、最多允许 4 人同时拿）防止死锁。',
    why: '这些同步模型构成了现代数据库并发事务引擎、文件系统锁机制与多线程运行时的基石。',
    visual: 'summary'
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
          if (prev >= STORY_STEPS.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 4000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isPlaying])

  const cur = STORY_STEPS[step]

  return (
    <section className="transformer-story sync-story" style={{ marginBottom: '24px' }}>
      <header className="story-intro">
        <div>
          <span className="story-kicker">动画导学 · 约 3 分钟</span>
          <h2>临界资源与信号量：并发中的秩序保障</h2>
          <p>
            从临界区访问准则、原子性 P/V 操作，到经典生产者-消费者模型的同步互斥协同与死锁防范。
          </p>
        </div>
        <div className="memory-story-badge" style={{ padding: '16px 20px', minWidth: '130px' }}>
          <strong>P / V 原语</strong>
          <span>信号量 Semaphore</span>
          <small>互斥锁 · 阻塞与唤醒</small>
        </div>
      </header>

      {/* 步骤时间轴导航 */}
      <nav className="story-timeline" style={{ '--story-steps': STORY_STEPS.length }}>
        {STORY_STEPS.map((s, idx) => (
          <button
            key={idx}
            className={`${step === idx ? 'active' : ''} ${idx < step ? 'passed' : ''}`}
            onClick={() => { setStep(idx); setIsPlaying(false) }}
          >
            <i>{idx < step ? '✓' : idx + 1}</i>
            <span>{s.title.split('：')[0].split('(')[0].trim()}</span>
          </button>
        ))}
      </nav>

      {/* 导学主体布局：左侧文字说明(35%)，右侧图形化演示(65%) */}
      <div className="story-stage" style={{ display: 'grid', gridTemplateColumns: '35% 65%', gap: '20px', minHeight: '340px' }}>
        <div className="story-copy" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#ee6c4d', fontWeight: 'bold' }}>{cur.kicker}</span>
            <h3 style={{ fontSize: '1.25rem', margin: '8px 0', color: '#fff' }}>{cur.title}</h3>
            <p style={{ fontSize: '0.98rem', lineHeight: '1.7', color: '#cbd5e1' }}>{cur.summary}</p>
          </div>
          <aside style={{ background: 'rgba(238, 108, 77, 0.12)', borderLeft: '4px solid #ee6c4d', padding: '12px 14px', borderRadius: '4px' }}>
            <strong style={{ color: '#ee6c4d', fontSize: '0.92rem' }}>为什么重要？</strong>
            <p style={{ fontSize: '0.88rem', color: '#e2e8f0', margin: '4px 0 0' }}>{cur.why}</p>
          </aside>
        </div>

        {/* 右侧专属动态可视化 (学术工程风，无多余 emoji) */}
        <div className="story-visual" style={{ background: '#0a101d', borderRadius: '12px', padding: '18px', border: '1px solid #1e293b', display: 'flex', alignItems: 'center' }}>
          {cur.visual === 'critical_section' && (
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
              <div style={{ padding: '14px 18px', background: '#1e293b', border: '1.5px dashed #64748b', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>进入区 (Entry)</div>
                <div style={{ color: '#f8fafc', fontWeight: 'bold', marginTop: '4px' }}>P(mutex) 申请访问权</div>
              </div>
              <div style={{ color: '#ee6c4d', fontSize: '1.4rem', fontWeight: 'bold' }}>➔</div>
              <div style={{ padding: '16px 24px', background: 'rgba(238, 108, 77, 0.15)', border: '2px solid #ee6c4d', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ color: '#ee6c4d', fontSize: '0.88rem', fontWeight: 'bold' }}>临界区 (Critical Section)</div>
                <div style={{ color: '#fca5a5', marginTop: '4px', fontSize: '0.85rem' }}>同一时刻仅允许单进程执行</div>
                <div style={{ fontSize: '0.82rem', color: '#fef08a', marginTop: '4px' }}>状态: 当前进程执行操作</div>
              </div>
              <div style={{ color: '#ee6c4d', fontSize: '1.4rem', fontWeight: 'bold' }}>➔</div>
              <div style={{ padding: '14px 18px', background: '#1e293b', border: '1.5px dashed #64748b', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>退出区 (Exit)</div>
                <div style={{ color: '#10b981', fontWeight: 'bold', marginTop: '4px' }}>V(mutex) 释放访问权</div>
              </div>
            </div>
          )}

          {cur.visual === 'four_principles' && (
            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              <div style={{ background: '#1e293b', padding: '12px 10px', borderRadius: '6px', textAlign: 'center', borderTop: '3px solid #10b981' }}>
                <div style={{ color: '#34d399', fontWeight: 'bold', fontSize: '0.92rem' }}>1. 空闲让进</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px', lineHeight: '1.5' }}>临界区无进程时，允许就绪进程立即进入</div>
              </div>
              <div style={{ background: '#1e293b', padding: '12px 10px', borderRadius: '6px', textAlign: 'center', borderTop: '3px solid #ef4444' }}>
                <div style={{ color: '#f87171', fontWeight: 'bold', fontSize: '0.92rem' }}>2. 忙则等待</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px', lineHeight: '1.5' }}>已有进程在内时，其他进程必须排队等待</div>
              </div>
              <div style={{ background: '#1e293b', padding: '12px 10px', borderRadius: '6px', textAlign: 'center', borderTop: '3px solid #f59e0b' }}>
                <div style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '0.92rem' }}>3. 有限等待</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px', lineHeight: '1.5' }}>等待时间有限，杜绝进程陷入永久饥饿</div>
              </div>
              <div style={{ background: '#1e293b', padding: '12px 10px', borderRadius: '6px', textAlign: 'center', borderTop: '3px solid #3b82f6' }}>
                <div style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '0.92rem' }}>4. 让权等待</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px', lineHeight: '1.5' }}>无法进入临界区时应释放 CPU 阻塞自己</div>
              </div>
            </div>
          )}

          {cur.visual === 'pv_primitive' && (
            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ background: '#1e293b', padding: '14px', borderRadius: '6px', fontFamily: 'monospace' }}>
                <div style={{ color: '#f59e0b', fontWeight: 'bold', marginBottom: '6px', fontSize: '0.92rem' }}>P(S) 操作 (Wait / 申请)</div>
                <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>S = S - 1;</div>
                <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>if (S &lt; 0) {'{'}</div>
                <div style={{ color: '#f87171', fontSize: '0.85rem', paddingLeft: '14px' }}>block(process); // 阻塞并加入等待队列</div>
                <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{'}'}</div>
              </div>
              <div style={{ background: '#1e293b', padding: '14px', borderRadius: '6px', fontFamily: 'monospace' }}>
                <div style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '6px', fontSize: '0.92rem' }}>V(S) 操作 (Signal / 释放)</div>
                <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>S = S + 1;</div>
                <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>if (S &lt;= 0) {'{'}</div>
                <div style={{ color: '#34d399', fontSize: '0.85rem', paddingLeft: '14px' }}>wakeup(process); // 唤醒等待队列队首</div>
                <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{'}'}</div>
              </div>
            </div>
          )}

          {cur.visual === 'producer_consumer' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ background: '#1e293b', padding: '10px 16px', borderRadius: '6px', textAlign: 'center', border: '1px solid #3b82f6' }}>
                  <div style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '0.9rem' }}>生产者进程 (Producer)</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>P(empty) ➔ P(mutex)</div>
                </div>

                <div style={{ flex: 1, margin: '0 16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  {[0, 1, 2, 3, 4].map(idx => (
                    <div key={idx} style={{ width: '42px', height: '42px', border: '1.5px solid #475569', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: idx < 2 ? 'rgba(59, 130, 246, 0.25)' : 'transparent', color: idx < 2 ? '#93c5fd' : '#64748b', fontSize: '0.82rem', fontWeight: 'bold' }}>
                      {idx < 2 ? `D${idx + 1}` : '空'}
                    </div>
                  ))}
                </div>

                <div style={{ background: '#1e293b', padding: '10px 16px', borderRadius: '6px', textAlign: 'center', border: '1px solid #10b981' }}>
                  <div style={{ color: '#34d399', fontWeight: 'bold', fontSize: '0.9rem' }}>消费者进程 (Consumer)</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>P(full) ➔ P(mutex)</div>
                </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
                当前信号量状态：mutex = 1（可用），empty = 3（剩余空位），full = 2（已有产品）
              </div>
            </div>
          )}

          {cur.visual === 'order_danger' && (
            <div style={{ width: '100%', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid #ef4444', borderRadius: '8px', padding: '14px' }}>
              <div style={{ color: '#f87171', fontWeight: 'bold', fontSize: '0.92rem' }}>
                错误顺序引发死锁演练：
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#fca5a5', marginTop: '8px', lineHeight: '1.6' }}>
                <div>生产者: P(mutex); P(empty); // 当 empty=0 时占有互斥锁进入阻塞</div>
                <div>消费者: P(mutex); P(full);  // 想唤醒生产者却因拿不到互斥锁同样阻塞！</div>
              </div>
              <div style={{ color: '#34d399', fontWeight: 'bold', marginTop: '10px', fontSize: '0.92rem' }}>
                正确规则：先申请资源信号量，再申请互斥锁
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#86efac', marginTop: '4px' }}>
                <div>生产者: P(empty); P(mutex); [放入缓冲]; V(mutex); V(full);</div>
                <div>消费者: P(full);  P(mutex); [取出缓冲]; V(mutex); V(empty);</div>
              </div>
            </div>
          )}

          {cur.visual === 'summary' && (
            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ background: '#1e293b', padding: '12px', borderRadius: '6px' }}>
                <div style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '0.9rem' }}>生产者-消费者</div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '6px', lineHeight: '1.5' }}>同步信号量控制空/满依赖，互斥信号量保障临界区独占。</div>
              </div>
              <div style={{ background: '#1e293b', padding: '12px', borderRadius: '6px' }}>
                <div style={{ color: '#34d399', fontWeight: 'bold', fontSize: '0.9rem' }}>读者-写者问题</div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '6px', lineHeight: '1.5' }}>第一个读者加互斥锁，最后一个读者解互斥锁（计数器法）。</div>
              </div>
              <div style={{ background: '#1e293b', padding: '12px', borderRadius: '6px' }}>
                <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '0.9rem' }}>哲学家进餐</div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '6px', lineHeight: '1.5' }}>死锁易发模型。通过资源有序分配或限制并发人数防死锁。</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="story-controls">
        <button
          disabled={step === 0}
          onClick={() => { setStep(s => Math.max(0, s - 1)); setIsPlaying(false) }}
        >
          ← 上一步
        </button>
        <button
          className={`story-play ${isPlaying ? 'playing' : ''}`}
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? '暂停' : '▶ 自动播放导学'}
        </button>
        <button
          disabled={step === STORY_STEPS.length - 1}
          onClick={() => { setStep(s => Math.min(STORY_STEPS.length - 1, s + 1)); setIsPlaying(false) }}
        >
          下一步 →
        </button>
      </footer>
    </section>
  )
}

export default function ProcessSyncExperiment({ experiment }) {
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
    { time: '00:00', text: '系统初始化完成：缓冲区容量 5，当前存有 2 个数据块。', type: 'info' }
  ])

  // 当前进入临界区的进程
  const [activeProcess, setActiveProcess] = useState(null)

  // 顺序颠倒死锁测试
  const [reverseOrderTest, setReverseOrderTest] = useState(false)

  const addLog = (text, type = 'info') => {
    const time = new Date().toTimeString().split(' ')[0]
    setLogs(prev => [{ time, text, type }, ...prev.slice(0, 18)])
  }

  // 生产者操作
  const handleProduce = () => {
    if (activeProcess) {
      addLog('临界区已被占用，请等待当前操作完成。', 'warning')
      return
    }

    const nextId = Date.now() % 1000
    const newItem = { id: nextId, name: `数据块#${nextId}` }

    if (reverseOrderTest) {
      addLog('[生产者] 执行 P(mutex)，成功获取互斥锁。', 'info')
      setMutex(0)
      setActiveProcess('生产者 (持有互斥锁)')

      if (empty <= 0) {
        addLog('[生产者] 执行 P(empty)，empty <= 0！生产者被阻塞，但未释放互斥锁！', 'error')
        setProducerQueue(prev => [...prev, newItem])
        addLog('互斥锁被生产者持有并阻塞，消费者无法获取 mutex，全系统发生死锁。', 'error')
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
      addLog('[生产者] P(empty) 失败 (empty=0)：缓冲区已满！生产者被挂起并加入阻塞队列。', 'warning')
      setProducerQueue(prev => [...prev, newItem])
      return
    }

    setEmpty(e => e - 1)
    addLog(`[生产者] 执行 P(empty)，空槽位 -1 (剩余 ${empty - 1})`, 'info')

    setMutex(0)
    setActiveProcess('生产者')
    addLog('[生产者] 执行 P(mutex)，获得临界区独占访问权', 'info')

    setTimeout(() => {
      setBuffer(prev => {
        const next = [...prev]
        next[inPtr] = newItem
        return next
      })
      const nextIn = (inPtr + 1) % BUFFER_CAPACITY
      setInPtr(nextIn)
      addLog(`[生产者] 在槽位 [${inPtr}] 放入 ${newItem.name}`, 'success')

      setMutex(1)
      setActiveProcess(null)
      addLog('[生产者] 执行 V(mutex)，退出临界区', 'info')

      setFull(f => {
        const nextFull = f + 1
        addLog(`[生产者] 执行 V(full)，产品数 +1 (当前 ${nextFull})`, 'info')
        return nextFull
      })

      setConsumerQueue(cq => {
        if (cq.length > 0) {
          addLog('[唤醒] 检测到阻塞队列中有消费者，已被 V(full) 唤醒。', 'success')
          return cq.slice(1)
        }
        return cq
      })
    }, 550)
  }

  // 消费者操作
  const handleConsume = () => {
    if (activeProcess) {
      addLog('临界区已被占用，请等待当前操作完成。', 'warning')
      return
    }

    if (reverseOrderTest && mutex === 0) {
      addLog('[消费者] 试图执行 P(mutex)，但互斥锁被阻塞的生产者持有，消费者被无限期阻塞。', 'error')
      setConsumerQueue(prev => [...prev, `消费任务#${Date.now() % 1000}`])
      return
    }

    if (full <= 0) {
      addLog('[消费者] P(full) 失败 (full=0)：缓冲区为空！消费者被挂起并加入阻塞队列。', 'warning')
      setConsumerQueue(prev => [...prev, `消费任务#${Date.now() % 1000}`])
      return
    }

    setFull(f => f - 1)
    addLog(`[消费者] 执行 P(full)，产品数 -1 (剩余 ${full - 1})`, 'info')

    setMutex(0)
    setActiveProcess('消费者')
    addLog('[消费者] 执行 P(mutex)，获得临界区独占访问权', 'info')

    setTimeout(() => {
      const removedItem = buffer[outPtr]
      setBuffer(prev => {
        const next = [...prev]
        next[outPtr] = null
        return next
      })
      const nextOut = (outPtr + 1) % BUFFER_CAPACITY
      setOutPtr(nextOut)
      addLog(`[消费者] 从槽位 [${outPtr}] 取出 ${removedItem ? removedItem.name : '数据'}`, 'success')

      setMutex(1)
      setActiveProcess(null)
      addLog('[消费者] 执行 V(mutex)，退出临界区', 'info')

      setEmpty(e => {
        const nextEmpty = e + 1
        addLog(`[消费者] 执行 V(empty)，空位 +1 (当前 ${nextEmpty})`, 'info')
        return nextEmpty
      })

      setProducerQueue(pq => {
        if (pq.length > 0) {
          addLog('[唤醒] 检测到阻塞队列中有生产者，已被 V(empty) 唤醒。', 'success')
          return pq.slice(1)
        }
        return pq
      })
    }, 550)
  }

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
    <>
      <ExperimentHeader experiment={experiment} eyebrow="操作系统实验 03 · 进程同步" />

      {/* 动画导学区 */}
      <SyncStory />

      {/* 自由探索区 */}
      <div className="explore-heading">
        <span>自由探索 · 经典生产者-消费者协同模型</span>
        <h2>生产者-消费者 (Producer-Consumer) 协同实验室</h2>
        <p>控制生产者与消费者进程，实时观测信号量计数（mutex、empty、full）、阻塞队列与共享环形缓冲区的动态流转。</p>
      </div>

      <div className="lab-layout sync-layout" style={{ gridTemplateColumns: '320px 1fr' }}>
        {/* 左侧控制台 */}
        <aside className="control-panel">
          <div className="panel-title">
            <span>进程动作控制</span>
            <i>P/V 原语调度</i>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              className="btn btn-primary"
              style={{ padding: '10px', fontSize: '0.92rem', fontWeight: 'bold' }}
              onClick={handleProduce}
              disabled={activeProcess !== null}
            >
              生产单个项目 (Producer)
            </button>

            <button
              className="btn btn-success"
              style={{ padding: '10px', fontSize: '0.92rem', fontWeight: 'bold', background: '#10b981', color: '#fff', border: 'none' }}
              onClick={handleConsume}
              disabled={activeProcess !== null}
            >
              消费单个项目 (Consumer)
            </button>
          </div>

          <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 'bold', fontSize: '0.88rem', color: '#334155', marginBottom: '6px' }}>
              P 操作顺序对照测试
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: reverseOrderTest ? '#ef4444' : '#64748b' }}>
              <input
                type="checkbox"
                checked={reverseOrderTest}
                onChange={e => setReverseOrderTest(e.target.checked)}
              />
              <span style={{ fontWeight: reverseOrderTest ? 'bold' : 'normal' }}>
                颠倒 P 操作顺序 (模拟死锁)
              </span>
            </label>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '6px', lineHeight: '1.4' }}>
              勾选后生产者将先申请 mutex 再申请 empty。当缓冲区满时，将导致系统锁死。
            </div>
          </div>

          <div style={{ marginTop: '14px' }}>
            <button className="btn btn-secondary" style={{ width: '100%', padding: '8px' }} onClick={handleReset}>
              重置实验室状态
            </button>
          </div>

          {/* 临界区状态指示 */}
          <div style={{ marginTop: '16px', padding: '12px', borderRadius: '6px', background: activeProcess ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)', border: `1px solid ${activeProcess ? '#ef4444' : '#10b981'}` }}>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>临界区占用状态</div>
            <div style={{ fontWeight: 'bold', marginTop: '4px', fontSize: '0.92rem', color: activeProcess ? '#dc2626' : '#059669' }}>
              {activeProcess ? `占用中: ${activeProcess}` : '空闲 (允许申请进入)'}
            </div>
          </div>
        </aside>

        {/* 右侧展示面板 */}
        <section className="visual-panel sync-visual" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="visual-toolbar">
            <div>
              <strong>共享缓冲区与信号量看板</strong>
              <span>容量：5 个槽位 · 互斥信号量初值 1 · 同步信号量初值 empty=5, full=0</span>
            </div>
            <span className="source-chip">PV 原语协同</span>
          </div>

          {/* 信号量看板 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>互斥信号量</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3b82f6', margin: '3px 0' }}>mutex = {mutex}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>保护缓冲区原子访问 (初值 1)</div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>资源信号量 (空位数)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981', margin: '3px 0' }}>empty = {empty}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>剩余可存放数量 (初值 5)</div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>资源信号量 (产品数)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f59e0b', margin: '3px 0' }}>full = {full}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>当前已有产品数量 (初值 0)</div>
            </div>
          </div>

          {/* 环形缓冲区槽位 */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <strong style={{ fontSize: '0.95rem', color: '#1e293b' }}>共享环形缓冲区 Buffer [0..4]</strong>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                写入指针 in = <b style={{ color: '#3b82f6' }}>{inPtr}</b>，读取指针 out = <b style={{ color: '#10b981' }}>{outPtr}</b>
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', margin: '14px 0 28px' }}>
              {buffer.map((item, idx) => {
                const isIn = idx === inPtr
                const isOut = idx === outPtr
                return (
                  <div
                    key={idx}
                    style={{
                      height: '90px',
                      border: `1.5px solid ${item ? '#3b82f6' : '#cbd5e1'}`,
                      borderRadius: '6px',
                      background: item ? '#eff6ff' : '#f8fafc',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      transition: 'all 0.25s'
                    }}
                  >
                    <span style={{ position: 'absolute', top: '5px', left: '6px', fontSize: '0.72rem', color: '#94a3b8' }}>
                      槽位 [{idx}]
                    </span>

                    {item ? (
                      <span style={{ fontSize: '0.88rem', fontWeight: 'bold', color: '#1e40af' }}>{item.name}</span>
                    ) : (
                      <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>空闲</span>
                    )}

                    <div style={{ position: 'absolute', bottom: '-22px', display: 'flex', gap: '4px' }}>
                      {isIn && (
                        <span style={{ background: '#3b82f6', color: '#fff', fontSize: '0.68rem', padding: '1px 5px', borderRadius: '3px' }}>
                          in 写入
                        </span>
                      )}
                      {isOut && (
                        <span style={{ background: '#10b981', color: '#fff', fontSize: '0.68rem', padding: '1px 5px', borderRadius: '3px' }}>
                          out 读取
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 阻塞等待队列 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 'bold' }}>
                  生产者等待队列 (Wait empty): {producerQueue.length}
                </div>
                <div style={{ minHeight: '26px', marginTop: '4px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {producerQueue.length === 0 ? (
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>无阻塞进程</span>
                  ) : (
                    producerQueue.map((item, idx) => (
                      <span key={idx} style={{ background: '#fee2e2', color: '#b91c1c', padding: '1px 6px', borderRadius: '3px', fontSize: '0.75rem' }}>
                        {item.name}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 'bold' }}>
                  消费者等待队列 (Wait full): {consumerQueue.length}
                </div>
                <div style={{ minHeight: '26px', marginTop: '4px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {consumerQueue.length === 0 ? (
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>无阻塞进程</span>
                  ) : (
                    consumerQueue.map((cName, idx) => (
                      <span key={idx} style={{ background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '3px', fontSize: '0.75rem' }}>
                        {cName}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 实时调度流水账 */}
          <div style={{ background: '#0f172a', borderRadius: '6px', padding: '12px 16px', color: '#f8fafc', fontFamily: 'monospace' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', borderBottom: '1px solid #334155', paddingBottom: '4px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>进程调度与 P/V 原语执行流水</span>
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>原子指令日志</span>
            </div>
            <div style={{ maxHeight: '130px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {logs.map((l, i) => (
                <div key={i} style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                  <span style={{ color: '#64748b', marginRight: '6px' }}>[{l.time}]</span>
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
        </section>
      </div>

      <LearningCycle
        experimentId="sync"
        prediction={{
          question: '在生产者-消费者问题中，如果颠倒生产者的 P(empty) 与 P(mutex) 顺序，当缓冲区已满时会发生什么？',
          options: ['正常生产不会受影响', '生产者在持有互斥锁的情况下阻塞，导致消费者也无法进入，形成死锁', '消费者直接消费失败并退出'],
          answer: '生产者在持有互斥锁的情况下阻塞，导致消费者也无法进入，形成死锁',
          explanation: '互斥锁必须紧贴临界区，若先获取互斥锁再申请资源，当资源不足阻塞时互斥锁无法释放，导致死锁。'
        }}
        operation={{
          title: '演练生产者与消费者协同',
          instruction: '连续点击“生产单个项目”直到缓冲区占满（5/5），观察第 6 次生产如何被挂起入队；再点击“消费单个项目”，观察消费者如何释放空位并唤醒等待的生产者。'
        }}
        observation={`当前缓冲区状态：mutex=${mutex}，empty=${empty}，full=${full}。生产者队列等待数：${producerQueue.length}，消费者队列等待数：${consumerQueue.length}。`}
        summaryPrompt="为什么 P 操作的互斥与同步顺序不能颠倒，而 V 操作的顺序可以颠倒？"
      />
    </>
  )
}
