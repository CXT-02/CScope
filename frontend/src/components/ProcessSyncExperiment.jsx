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

function SyncStory({ onSelectModel }) {
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
              <div
                onClick={() => onSelectModel && onSelectModel('producer-consumer')}
                style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', borderTop: '3px solid #60a5fa', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '0.95rem' }}>生产者-消费者</div>
                  <span style={{ fontSize: '0.72rem', color: '#93c5fd', background: 'rgba(96, 165, 250, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>进入模型 ➔</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '6px', lineHeight: '1.5' }}>
                  同步信号量控制空/满依赖，互斥信号量保障临界区独占。
                </div>
              </div>

              <div
                onClick={() => onSelectModel && onSelectModel('readers-writers')}
                style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', borderTop: '3px solid #34d399', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#34d399', fontWeight: 'bold', fontSize: '0.95rem' }}>读者-写者问题</div>
                  <span style={{ fontSize: '0.72rem', color: '#6ee7b7', background: 'rgba(52, 211, 153, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>进入模型 ➔</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '6px', lineHeight: '1.5' }}>
                  第一个读者加互斥锁，最后一个读者解互斥锁（计数器法）。
                </div>
              </div>

              <div
                onClick={() => onSelectModel && onSelectModel('dining-philosophers')}
                style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', borderTop: '3px solid #f59e0b', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '0.95rem' }}>哲学家进餐</div>
                  <span style={{ fontSize: '0.72rem', color: '#fde047', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>进入模型 ➔</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '6px', lineHeight: '1.5' }}>
                  死锁易发模型。通过资源有序分配或限制并发人数防死锁。
                </div>
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
  const [activeModel, setActiveModel] = useState('producer-consumer')

  return (
    <>
      <ExperimentHeader experiment={experiment} eyebrow="操作系统实验 03 · 进程同步" />

      {/* 动画导学区 */}
      <SyncStory onSelectModel={setActiveModel} />

      {/* 自由探索区 */}
      <div className="explore-heading">
        <span>自由探索 · 并发经典三大同步互斥模型</span>
        <h2>进程同步与互斥实验室</h2>
        <p>支持自由切换三大经典模型：生产者-消费者、读者-写者问题与哲学家进餐，亲手调度原语并探究死锁形成与防范。</p>
      </div>

      {/* 三大经典模型切换 Tab */}
      <div className="number-tabs" style={{ maxWidth: '560px', margin: '0 0 20px' }}>
        <button
          className={activeModel === 'producer-consumer' ? 'active' : ''}
          onClick={() => setActiveModel('producer-consumer')}
        >
          1. 生产者-消费者
        </button>
        <button
          className={activeModel === 'readers-writers' ? 'active' : ''}
          onClick={() => setActiveModel('readers-writers')}
        >
          2. 读者-写者问题
        </button>
        <button
          className={activeModel === 'dining-philosophers' ? 'active' : ''}
          onClick={() => setActiveModel('dining-philosophers')}
        >
          3. 哲学家进餐
        </button>
      </div>

      {activeModel === 'producer-consumer' && <ProducerConsumerLab />}
      {activeModel === 'readers-writers' && <ReadersWritersLab />}
      {activeModel === 'dining-philosophers' && <DiningPhilosophersLab />}

      {activeModel === 'producer-consumer' && (
        <LearningCycle
          experimentId="sync-pc"
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
          observation="当前模型为生产者-消费者：由 empty 与 full 信号量控制同步，由 mutex 信号量保障对共享环形缓冲区的独占原子访问。"
          summaryPrompt="为什么 P 操作的互斥与同步顺序不能颠倒，而 V 操作的顺序可以颠倒？"
        />
      )}

      {activeModel === 'readers-writers' && (
        <LearningCycle
          experimentId="sync-rw"
          prediction={{
            question: '在经典读者优先的读者-写者问题中，当已有读者在读时，新到来的读者需要等待吗？',
            options: ['不需要，可以直接加入并发读取', '需要等待当前读者全部读完', '由操作系统随机决定'],
            answer: '不需要，可以直接加入并发读取',
            explanation: '读者优先策略下，只要 readcount > 0，后续读者只需增加计数器即可共享临界区，这可能导致写者长时间饿死。'
          }}
          operation={{
            title: '验证共享读与排他写',
            instruction: '连续添加 3 位读者，观察文件状态如何变为“多读者共享”，且 wmutex 被锁住；此时尝试添加写者，观察写者如何被阻塞在等待队列中。'
          }}
          observation="当前模型为读者-写者：通过计数器 readcount 实现多读者共享读，通过 wmutex 实现写者排他写；写者进入时所有读者与其他写者均被阻塞。"
          summaryPrompt="读者优先会导致写者饥饿，怎样设计信号量才能实现写者优先或公平无饥饿排队？"
        />
      )}

      {activeModel === 'dining-philosophers' && (
        <LearningCycle
          experimentId="sync-dp"
          prediction={{
            question: '哲学家进餐问题中，若 5 位哲学家同时感到饥饿并同时拿起左边的筷子，会导致什么后果？',
            options: ['顺利吃完面条', '形成环路等待，全员阻塞发生死锁', '随机一人放弃筷子'],
            answer: '形成环路等待，全员阻塞发生死锁',
            explanation: '每位哲学家都持有一根筷子并等待右侧筷子，5 条请求边形成闭合环路，满足死锁的 4 个必要条件。'
          }}
          operation={{
            title: '一键复现死锁与破除死锁',
            instruction: '选择“朴素无保护”策略，点击“⚠️ 一键触发死锁”，观察 5 位哲学家如何同时陷入死锁环；然后切换为“奇偶规则”或“限制4人并发”，观察死锁如何被彻底消除。'
          }}
          observation="当前模型为哲学家进餐：圆桌上 5 位哲学家交替思考与就餐；死锁源于循环等待筷子，可通过打破循环等待（奇偶拿法或原子双拿）彻底免疫死锁。"
          summaryPrompt="在现实数据库死锁或多线程编程中，哲学家进餐的哪些策略对应了资源分级分配（Resource Hierarchy）？"
        />
      )}
    </>
  )
}

function ProducerConsumerLab() {
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
  )
}

function ReadersWritersLab() {
  const [strategy, setStrategy] = useState('reader-priority') // 'reader-priority' | 'fair'
  const [readCount, setReadCount] = useState(0)
  const [rmutex, setRmutex] = useState(1) // 保护 readCount
  const [wmutex, setWmutex] = useState(1) // 保护共享文件的写锁
  const [activeReaders, setActiveReaders] = useState([])
  const [activeWriter, setActiveWriter] = useState(null)
  const [waitingReaders, setWaitingReaders] = useState([])
  const [waitingWriters, setWaitingWriters] = useState([])
  const [fileVersion, setFileVersion] = useState(1)
  const [logs, setLogs] = useState([
    { time: '00:00', text: '读者-写者模型就绪：支持多读者并发读取、写者独占访问。', type: 'info' }
  ])

  const addLog = (text, type = 'info') => {
    const time = new Date().toTimeString().split(' ')[0]
    setLogs(prev => [{ time, text, type }, ...prev.slice(0, 18)])
  }

  // 添加读者
  const handleAddReader = () => {
    const rId = Math.floor(Math.random() * 900 + 100)
    const reader = { id: rId, name: `读者R${rId}` }

    // 若当前有写者正在写，或者在公平模式下已有写者排队等待
    if (activeWriter !== null || (strategy === 'fair' && waitingWriters.length > 0)) {
      addLog(`[${reader.name}] 申请读取，但文件被写者占用或排队，进入读者阻塞队列`, 'warning')
      setWaitingReaders(prev => [...prev, reader])
      return
    }

    // 读者进入流程
    addLog(`[${reader.name}] 执行 P(rmutex)，进入读者计数临界区`, 'info')
    setRmutex(0)

    setTimeout(() => {
      setReadCount(rc => {
        const nextRc = rc + 1
        if (rc === 0) {
          addLog(`[${reader.name}] 是首位读者，执行 P(wmutex) 锁住写锁，禁止所有写者进入！`, 'success')
          setWmutex(0)
        }
        return nextRc
      })
      setActiveReaders(prev => [...prev, reader])
      setRmutex(1)
      addLog(`[${reader.name}] 退出 rmutex，开始并发读取文件 (当前共 ${readCount + 1} 位读者)`, 'success')
    }, 200)
  }

  // 读者读毕离开
  const handleFinishReader = (rId) => {
    const reader = activeReaders.find(r => r.id === rId) || { name: `读者R${rId}` }
    addLog(`[${reader.name}] 读取完毕，申请执行 P(rmutex) 修改计数`, 'info')
    setRmutex(0)

    setTimeout(() => {
      setActiveReaders(prev => prev.filter(r => r.id !== rId))
      setReadCount(rc => {
        const nextRc = Math.max(0, rc - 1)
        if (nextRc === 0) {
          addLog(`[${reader.name}] 是最后离开的读者，执行 V(wmutex) 释放写锁！`, 'success')
          setWmutex(1)

          // 唤醒等待的写者
          setWaitingWriters(ww => {
            if (ww.length > 0) {
              const nextWriter = ww[0]
              addLog(`[系统唤醒] 读者全部离开，唤醒等待队列中的 ${nextWriter.name} 开始写入`, 'success')
              setWmutex(0)
              setActiveWriter(nextWriter)
              return ww.slice(1)
            }
            return ww
          })
        }
        return nextRc
      })
      setRmutex(1)
      addLog(`[${reader.name}] 退出系统，执行 V(rmutex)`, 'info')
    }, 200)
  }

  // 添加写者
  const handleAddWriter = () => {
    const wId = Math.floor(Math.random() * 900 + 100)
    const writer = { id: wId, name: `写者W${wId}` }

    if (activeWriter !== null || activeReaders.length > 0) {
      addLog(`[${writer.name}] 申请写入，但临界区有人正在访问（读者或写者），加入写者阻塞队列`, 'warning')
      setWaitingWriters(prev => [...prev, writer])
      return
    }

    // 获得独占权
    addLog(`[${writer.name}] 执行 P(wmutex)，获取文件排他写入锁！`, 'success')
    setWmutex(0)
    setActiveWriter(writer)
  }

  // 写者写毕离开
  const handleFinishWriter = () => {
    if (!activeWriter) return
    const writer = activeWriter
    addLog(`[${writer.name}] 写入操作完成，更新文件版本为 V${fileVersion + 1}`, 'success')
    setFileVersion(v => v + 1)
    setActiveWriter(null)
    setWmutex(1)
    addLog(`[${writer.name}] 执行 V(wmutex)，释放排他锁`, 'info')

    // 唤醒策略
    if (strategy === 'fair' && waitingReaders.length > 0) {
      addLog(`[公平调度] 优先唤醒阻塞中的 ${waitingReaders.length} 位等待读者`, 'success')
      const waking = [...waitingReaders]
      setWaitingReaders([])
      setWmutex(0)
      setActiveReaders(waking)
      setReadCount(waking.length)
    } else if (waitingWriters.length > 0) {
      const nextWriter = waitingWriters[0]
      setWaitingWriters(ww => ww.slice(1))
      addLog(`[系统唤醒] 唤醒下一位等待的写者 ${nextWriter.name}`, 'success')
      setWmutex(0)
      setActiveWriter(nextWriter)
    } else if (waitingReaders.length > 0) {
      const waking = [...waitingReaders]
      setWaitingReaders([])
      setWmutex(0)
      setActiveReaders(waking)
      setReadCount(waking.length)
    }
  }

  const handleReset = () => {
    setReadCount(0)
    setRmutex(1)
    setWmutex(1)
    setActiveReaders([])
    setActiveWriter(null)
    setWaitingReaders([])
    setWaitingWriters([])
    setFileVersion(1)
    addLog('已重置读者-写者模型到初始空闲状态。', 'info')
  }

  return (
    <div className="lab-layout sync-layout" style={{ gridTemplateColumns: '320px 1fr' }}>
      <aside className="control-panel">
        <div className="panel-title">
          <span>读者-写者调度</span>
          <i>共享读 · 排他写</i>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            className="btn btn-primary"
            style={{ padding: '10px', fontSize: '0.9rem', fontWeight: 'bold' }}
            onClick={handleAddReader}
          >
            ＋ 添加并发读者 (Reader)
          </button>

          <button
            className="btn btn-warning"
            style={{ padding: '10px', fontSize: '0.9rem', fontWeight: 'bold', background: '#f59e0b', color: '#1e293b', border: 'none' }}
            onClick={handleAddWriter}
          >
            ＋ 添加排他写者 (Writer)
          </button>
        </div>

        {activeWriter && (
          <div style={{ marginTop: '12px' }}>
            <button
              className="btn btn-success"
              style={{ width: '100%', padding: '10px', background: '#10b981', color: '#fff', border: 'none', fontWeight: 'bold' }}
              onClick={handleFinishWriter}
            >
              ✓ 当前写者写毕离开 (V操作)
            </button>
          </div>
        )}

        <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#334155', marginBottom: '6px' }}>
            调度策略模式
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn btn-sm ${strategy === 'reader-priority' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '6px' }}
              onClick={() => { setStrategy('reader-priority'); addLog('已切换为经典“读者优先”策略', 'info') }}
            >
              读者优先 (易饥饿)
            </button>
            <button
              className={`btn btn-sm ${strategy === 'fair' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '6px' }}
              onClick={() => { setStrategy('fair'); addLog('已切换为“公平无饥饿”排队策略', 'info') }}
            >
              公平排队
            </button>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px', lineHeight: '1.4' }}>
            {strategy === 'reader-priority'
              ? '只要有读者在读，后续来的读者无需等待写者即可进入，极端时导致写者饿死。'
              : '写者排队时，阻止后续读者插队，保障写者在当前读者读完后能优先执行。'}
          </div>
        </div>

        <div style={{ marginTop: '14px' }}>
          <button className="btn btn-secondary" style={{ width: '100%', padding: '8px' }} onClick={handleReset}>
            重置实验室状态
          </button>
        </div>

        <div style={{ marginTop: '16px', padding: '12px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>文件独占锁状态 (wmutex)</div>
          <div style={{ fontWeight: 'bold', marginTop: '4px', fontSize: '0.92rem', color: wmutex === 0 ? '#dc2626' : '#059669' }}>
            {wmutex === 0 ? 'LOCKED (被读者组或写者独占)' : 'UNLOCKED (空闲)'}
          </div>
        </div>
      </aside>

      <section className="visual-panel sync-visual" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="visual-toolbar">
          <div>
            <strong>读者-写者共享文件状态看板</strong>
            <span>允许多个读者共享读取，但任一时刻最多允许一个写者独占操作。</span>
          </div>
          <span className="source-chip">策略: {strategy === 'reader-priority' ? '读者优先' : '公平排队'}</span>
        </div>

        {/* 信号量与计数器 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>读者计数器 (readcount)</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#3b82f6', margin: '3px 0' }}>{readCount}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>当前在读读者总数</div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>互斥信号量 (rmutex)</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#10b981', margin: '3px 0' }}>{rmutex}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>保护 readCount 原语修改</div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>写锁信号量 (wmutex)</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#f59e0b', margin: '3px 0' }}>{wmutex}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>保护文件的排他互斥访问</div>
          </div>
        </div>

        {/* 共享文件与临界区沙盘 */}
        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <strong style={{ fontSize: '1rem', color: '#1e293b' }}>共享资源：database_file.bin</strong>
              <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#64748b' }}>版本: V{fileVersion}</span>
            </div>
            <span style={{
              padding: '3px 10px',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: 'bold',
              background: activeWriter ? '#fee2e2' : activeReaders.length > 0 ? '#eff6ff' : '#f0fdf4',
              color: activeWriter ? '#b91c1c' : activeReaders.length > 0 ? '#1d4ed8' : '#15803d'
            }}>
              {activeWriter ? '【写者排他写入中】' : activeReaders.length > 0 ? `【${activeReaders.length} 位读者并发读取中】` : '【空闲 IDLE】'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', margin: '10px 0' }}>
            {/* 活跃读者区 */}
            <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '8px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ color: '#0369a1', fontSize: '0.88rem' }}>正在读取的读者 (并发共享)</strong>
                <span style={{ fontSize: '0.78rem', color: '#0284c7' }}>{activeReaders.length} 位</span>
              </div>
              <div style={{ minHeight: '60px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                {activeReaders.length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>暂无读者正在读取</span>
                ) : (
                  activeReaders.map(r => (
                    <div key={r.id} style={{ background: '#0284c7', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{r.name}</span>
                      <button
                        onClick={() => handleFinishReader(r.id)}
                        style={{ background: 'rgba(255,255,255,0.25)', border: 'none', color: '#fff', borderRadius: '3px', padding: '0 4px', cursor: 'pointer', fontSize: '0.75rem' }}
                        title="读完离开"
                      >
                        ✓
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 活跃写者区 */}
            <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '8px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ color: '#b45309', fontSize: '0.88rem' }}>正在写入的写者 (独占排他)</strong>
                <span style={{ fontSize: '0.78rem', color: '#d97706' }}>{activeWriter ? '1 位 (独占)' : '0 位'}</span>
              </div>
              <div style={{ minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeWriter ? (
                  <div style={{ background: '#d97706', color: '#fff', padding: '8px 18px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.95rem' }}>
                    {activeWriter.name} [独占写入中...]
                  </div>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>暂无写者操作</span>
                )}
              </div>
            </div>
          </div>

          {/* 阻塞等待队列 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 'bold' }}>
                等待读取的读者队列: {waitingReaders.length}
              </div>
              <div style={{ minHeight: '26px', marginTop: '4px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                {waitingReaders.length === 0 ? (
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>无阻塞读者</span>
                ) : (
                  waitingReaders.map(r => (
                    <span key={r.id} style={{ background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '3px', fontSize: '0.75rem' }}>
                      {r.name}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 'bold' }}>
                等待写入的写者队列: {waitingWriters.length}
              </div>
              <div style={{ minHeight: '26px', marginTop: '4px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                {waitingWriters.length === 0 ? (
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>无阻塞写者</span>
                ) : (
                  waitingWriters.map(w => (
                    <span key={w.id} style={{ background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '3px', fontSize: '0.75rem' }}>
                      {w.name}
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
            <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>读者-写者 P/V 原语执行流水</span>
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>原子原语日志</span>
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
  )
}

function DiningPhilosophersLab() {
  const [strategy, setStrategy] = useState('naive') // 'naive' | 'limit4' | 'odd-even' | 'both-and'
  const [philosophers, setPhilosophers] = useState([
    { id: 0, state: 'thinking', hasLeft: false, hasRight: false },
    { id: 1, state: 'thinking', hasLeft: false, hasRight: false },
    { id: 2, state: 'thinking', hasLeft: false, hasRight: false },
    { id: 3, state: 'thinking', hasLeft: false, hasRight: false },
    { id: 4, state: 'thinking', hasLeft: false, hasRight: false }
  ])
  // 每根筷子持有人 id，null 表示在桌面上空闲
  const [chopsticks, setChopsticks] = useState([null, null, null, null, null])
  const [isDeadlocked, setIsDeadlocked] = useState(false)
  const [logs, setLogs] = useState([
    { time: '00:00', text: '哲学家进餐模型已就绪：5 位哲学家围绕圆桌，共享 5 根筷子。', type: 'info' }
  ])

  const addLog = (text, type = 'info') => {
    const time = new Date().toTimeString().split(' ')[0]
    setLogs(prev => [{ time, text, type }, ...prev.slice(0, 18)])
  }

  // 哲学家左筷子号为 id，右筷子号为 (id + 1) % 5
  const leftChopstick = (id) => id
  const rightChopstick = (id) => (id + 1) % 5

  // 单个哲学家的状态流转
  const handleTogglePhilosopher = (id) => {
    const p = philosophers[id]
    const left = leftChopstick(id)
    const right = rightChopstick(id)

    // 状态 1: 正在思考 ➔ 感到饥饿并尝试拿筷子
    if (p.state === 'thinking') {
      addLog(`[哲学家 P${id}] 思考完毕，感到饥饿，准备申请筷子 [C${left}, C${right}]`, 'info')

      // 方案 A: 限制最多 4 人同时拿筷子
      if (strategy === 'limit4') {
        const hungryOrEatingCount = philosophers.filter(item => item.state !== 'thinking').length
        if (hungryOrEatingCount >= 4) {
          addLog(`[限制并发规则] 当前已有 4 人在尝试就餐，P${id} 被限制信号量 count 阻塞等待！`, 'warning')
          return
        }
      }

      // 方案 B: 奇偶规则 (偶数先左后右，奇数先右后左)
      let first = left, second = right
      if (strategy === 'odd-even' && id % 2 === 1) {
        first = right
        second = left
      }

      // 方案 C: 同时拿两根 (AND 原语)
      if (strategy === 'both-and') {
        if (chopsticks[left] === null && chopsticks[right] === null) {
          setChopsticks(prev => {
            const next = [...prev]
            next[left] = id
            next[right] = id
            return next
          })
          setPhilosophers(prev => prev.map(item => item.id === id ? { ...item, state: 'eating', hasLeft: true, hasRight: true } : item))
          addLog(`[AND 原语成功] P${id} 检测到左右筷子均空闲，一次性全部拿起，开始就餐！`, 'success')
        } else {
          setPhilosophers(prev => prev.map(item => item.id === id ? { ...item, state: 'hungry' } : item))
          addLog(`[AND 原语等待] P${id} 左右筷子未同时空闲，一根不拿，保持等待`, 'warning')
        }
        return
      }

      // 普通顺序流程
      if (chopsticks[first] === null) {
        // 先拿第一根
        setChopsticks(prev => {
          const next = [...prev]
          next[first] = id
          return next
        })
        const hasLeftNow = first === left
        const hasRightNow = first === right

        if (chopsticks[second] === null) {
          // 第二根也拿到了，直接就餐
          setChopsticks(prev => {
            const next = [...prev]
            next[second] = id
            return next
          })
          setPhilosophers(prev => prev.map(item => item.id === id ? { ...item, state: 'eating', hasLeft: true, hasRight: true } : item))
          addLog(`[哲学家 P${id}] 顺利拿齐双筷 [C${left}, C${right}]，开始就餐！`, 'success')
        } else {
          // 拿了第一根，第二根被邻座占用
          setPhilosophers(prev => prev.map(item => item.id === id ? { ...item, state: 'hungry', hasLeft: hasLeftNow, hasRight: hasRightNow } : item))
          addLog(`[哲学家 P${id}] 拿到筷子 C${first}，但 C${second} 被邻座占用，陷入等待`, 'warning')
        }
      } else {
        setPhilosophers(prev => prev.map(item => item.id === id ? { ...item, state: 'hungry' } : item))
        addLog(`[哲学家 P${id}] 第一根筷子 C${first} 已被邻座持有，无法拿起，陷入饥饿等待`, 'warning')
      }
    } else if (p.state === 'eating') {
      // 就餐完毕 ➔ 放下两根筷子，回归思考
      setChopsticks(prev => {
        const next = [...prev]
        if (next[left] === id) next[left] = null
        if (next[right] === id) next[right] = null
        return next
      })
      setPhilosophers(prev => prev.map(item => item.id === id ? { ...item, state: 'thinking', hasLeft: false, hasRight: false } : item))
      addLog(`[哲学家 P${id}] 就餐完毕，放下左右两根筷子 [C${left}, C${right}]，回到思考状态`, 'info')
    } else if (p.state === 'hungry' && !isDeadlocked) {
      // 饥饿中，尝试继续补拿第二根筷子
      if (p.hasLeft && !p.hasRight && chopsticks[right] === null) {
        setChopsticks(prev => {
          const next = [...prev]
          next[right] = id
          return next
        })
        setPhilosophers(prev => prev.map(item => item.id === id ? { ...item, state: 'eating', hasRight: true } : item))
        addLog(`[哲学家 P${id}] 等到了右筷 C${right}，凑齐两根，开始就餐！`, 'success')
      } else if (!p.hasLeft && p.hasRight && chopsticks[left] === null) {
        setChopsticks(prev => {
          const next = [...prev]
          next[left] = id
          return next
        })
        setPhilosophers(prev => prev.map(item => item.id === id ? { ...item, state: 'eating', hasLeft: true } : item))
        addLog(`[哲学家 P${id}] 等到了左筷 C${left}，凑齐两根，开始就餐！`, 'success')
      } else {
        addLog(`[哲学家 P${id}] 所需筷子仍未释放，继续等待`, 'warning')
      }
    }
  }

  // ⚠️ 一键触发死锁
  const handleTriggerDeadlock = () => {
    // 5位哲学家同时拿起左筷子！
    setChopsticks([0, 1, 2, 3, 4])
    setPhilosophers([
      { id: 0, state: 'deadlocked', hasLeft: true, hasRight: false },
      { id: 1, state: 'deadlocked', hasLeft: true, hasRight: false },
      { id: 2, state: 'deadlocked', hasLeft: true, hasRight: false },
      { id: 3, state: 'deadlocked', hasLeft: true, hasRight: false },
      { id: 4, state: 'deadlocked', hasLeft: true, hasRight: false }
    ])
    setIsDeadlocked(true)
    addLog('【死锁警报】5位哲学家同时持有了各自左侧的筷子，又同时申请右侧筷子！', 'error')
    addLog('循环等待环路形成：P0➔P1➔P2➔P3➔P4➔P0，全员永久阻塞！', 'error')
  }

  // 解除死锁
  const handleResolveDeadlock = () => {
    // 让哲学家 P0 主动放下左手筷子
    setChopsticks(prev => {
      const next = [...prev]
      next[0] = null // 释放筷子 0
      return next
    })
    setPhilosophers(prev => prev.map(p => {
      if (p.id === 0) return { ...p, state: 'thinking', hasLeft: false, hasRight: false }
      if (p.id === 4) return { ...p, state: 'eating', hasRight: true } // P4 拿到右筷(0)
      return { ...p, state: 'hungry' }
    }))
    setIsDeadlocked(false)
    addLog('【打破死锁】破坏请求与保持条件：P0 放弃左筷 C0，使得邻座 P4 成功拿齐双筷就餐！', 'success')
  }

  const handleReset = () => {
    setChopsticks([null, null, null, null, null])
    setPhilosophers([
      { id: 0, state: 'thinking', hasLeft: false, hasRight: false },
      { id: 1, state: 'thinking', hasLeft: false, hasRight: false },
      { id: 2, state: 'thinking', hasLeft: false, hasRight: false },
      { id: 3, state: 'thinking', hasLeft: false, hasRight: false },
      { id: 4, state: 'thinking', hasLeft: false, hasRight: false }
    ])
    setIsDeadlocked(false)
    addLog('已重置圆桌状态：所有哲学家回到思考中，筷子全部归位。', 'info')
  }

  // 计算圆桌 5 个哲学家和 5 根筷子的坐标 (中心 170, 170)
  const CX = 170
  const CY = 170
  const R_PHILO = 110
  const R_CHOP = 65

  const philoCoords = [0, 1, 2, 3, 4].map(i => {
    const angle = ((-90 + i * 72) * Math.PI) / 180
    return {
      x: CX + R_PHILO * Math.cos(angle),
      y: CY + R_PHILO * Math.sin(angle)
    }
  })

  const chopCoords = [0, 1, 2, 3, 4].map(i => {
    const angle = ((-90 + 36 + i * 72) * Math.PI) / 180
    return {
      x: CX + R_CHOP * Math.cos(angle),
      y: CY + R_CHOP * Math.sin(angle)
    }
  })

  return (
    <div className="lab-layout sync-layout" style={{ gridTemplateColumns: '340px 1fr' }}>
      <aside className="control-panel">
        <div className="panel-title">
          <span>哲学家调度控制</span>
          <i>资源竞争与死锁防范</i>
        </div>

        {/* 策略选择 */}
        <label className="field-block">
          <span>防死锁策略选择</span>
          <select value={strategy} onChange={e => { setStrategy(e.target.value); handleReset() }}>
            <option value="naive">朴素无保护 (允许死锁发生)</option>
            <option value="limit4">策略 1: 限制最多 4 人并发尝试</option>
            <option value="odd-even">策略 2: 奇偶号非对称拿取规则</option>
            <option value="both-and">策略 3: AND 信号量 (仅双筷可用时拿)</option>
          </select>
        </label>

        <div style={{ marginTop: '10px', padding: '10px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>
          {strategy === 'naive' && '哲学家先拿左筷再拿右筷。若 5 人同时饥饿，将陷入经典死锁。'}
          {strategy === 'limit4' && '利用计数信号量 count=4 限制人数，必定至少有 1 位哲学家能同时拿到两根筷子。'}
          {strategy === 'odd-even' && '偶数哲学家先左后右，奇数先右后左。相邻两人竞争同一根，打破环路。'}
          {strategy === 'both-and' && '原子化检测，只有当左右两根筷子都空闲时才同时拿起，杜绝部分持有等待。'}
        </div>

        {/* 死锁触发与解除按钮 */}
        <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            className="btn btn-danger"
            style={{ padding: '10px', background: '#ef4444', color: '#fff', border: 'none', fontWeight: 'bold' }}
            onClick={handleTriggerDeadlock}
          >
            ⚠️ 一键复现死锁 (5人同时拿左筷)
          </button>

          {isDeadlocked && (
            <button
              className="btn btn-success"
              style={{ padding: '10px', background: '#10b981', color: '#fff', border: 'none', fontWeight: 'bold' }}
              onClick={handleResolveDeadlock}
            >
              ✓ 破坏死锁 (强制 P0 释放筷子)
            </button>
          )}
        </div>

        {/* 5位哲学家单步控制 */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>
            点击哲学家切换状态 (思考 ➔ 拿筷 ➔ 就餐 ➔ 放下):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
            {philosophers.map(p => (
              <button
                key={p.id}
                onClick={() => handleTogglePhilosopher(p.id)}
                style={{
                  padding: '8px 2px',
                  borderRadius: '6px',
                  border: `1.5px solid ${
                    p.state === 'eating' ? '#10b981' :
                    p.state === 'deadlocked' ? '#ef4444' :
                    p.state === 'hungry' ? '#f59e0b' : '#94a3b8'
                  }`,
                  background:
                    p.state === 'eating' ? '#ecfdf5' :
                    p.state === 'deadlocked' ? '#fef2f2' :
                    p.state === 'hungry' ? '#fffbeb' : '#f8fafc',
                  color:
                    p.state === 'eating' ? '#047857' :
                    p.state === 'deadlocked' ? '#b91c1c' :
                    p.state === 'hungry' ? '#b45309' : '#334155',
                  fontWeight: 'bold',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                P{p.id}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <button className="btn btn-secondary" style={{ width: '100%', padding: '8px' }} onClick={handleReset}>
            重置圆桌状态
          </button>
        </div>
      </aside>

      <section className="visual-panel sync-visual" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="visual-toolbar">
          <div>
            <strong>哲学家进餐圆桌沙盘</strong>
            <span>圆桌中央 5 根筷子，5 位哲学家必须同时持有左右两根筷子才能进餐。</span>
          </div>
          <span className={`source-chip ${isDeadlocked ? 'danger' : ''}`}>
            {isDeadlocked ? '⚠️ 系统已陷入死锁' : '正常运行'}
          </span>
        </div>

        {/* 圆桌沙盘 SVG */}
        <div style={{ background: '#0a101d', border: '1.5px solid #1e293b', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <svg width="340" height="340" viewBox="0 0 340 340" style={{ overflow: 'visible' }}>
            {/* 圆桌底盘 */}
            <circle cx={CX} cy={CY} r="105" fill="#1e293b" stroke="#334155" strokeWidth="3" />
            <circle cx={CX} cy={CY} r="45" fill="#0f172a" stroke="#c88724" strokeWidth="2" strokeDasharray="4 4" />
            <text x={CX} y={CY + 5} textAnchor="middle" fill="#f59e0b" fontSize="13" fontWeight="bold">
              餐盘
            </text>

            {/* 死锁环路警示连线 */}
            {isDeadlocked && (
              <circle
                cx={CX}
                cy={CY}
                r="110"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                strokeDasharray="6 6"
              />
            )}

            {/* 5 根筷子 (Chopsticks) */}
            {chopCoords.map((coord, idx) => {
              const holder = chopsticks[idx]
              const isHeld = holder !== null
              return (
                <g key={`chop-${idx}`}>
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r="14"
                    fill={isHeld ? (isDeadlocked ? '#dc2626' : '#2563eb') : '#334155'}
                    stroke={isHeld ? '#fff' : '#64748b'}
                    strokeWidth="1.5"
                  />
                  <text
                    x={coord.x}
                    y={coord.y + 4}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    C{idx}
                  </text>
                  {isHeld && (
                    <text
                      x={coord.x}
                      y={coord.y + 24}
                      textAnchor="middle"
                      fill="#93c5fd"
                      fontSize="9"
                    >
                      P{holder}持
                    </text>
                  )}
                </g>
              )
            })}

            {/* 5 位哲学家 (Philosophers) */}
            {philoCoords.map((coord, idx) => {
              const p = philosophers[idx]
              let strokeColor = '#64748b'
              let fillColor = '#1e293b'
              let textColor = '#cbd5e1'
              let label = '思考'

              if (p.state === 'eating') {
                strokeColor = '#10b981'
                fillColor = '#064e3b'
                textColor = '#34d399'
                label = '进餐'
              } else if (p.state === 'deadlocked') {
                strokeColor = '#ef4444'
                fillColor = '#7f1d1d'
                textColor = '#fca5a5'
                label = '死锁'
              } else if (p.state === 'hungry') {
                strokeColor = '#f59e0b'
                fillColor = '#78350f'
                textColor = '#fbbf24'
                label = p.hasLeft ? '等右筷' : p.hasRight ? '等左筷' : '饥饿'
              }

              return (
                <g
                  key={`philo-${idx}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleTogglePhilosopher(idx)}
                >
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r="24"
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth="2.5"
                  />
                  <text
                    x={coord.x}
                    y={coord.y - 3}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    P{idx}
                  </text>
                  <text
                    x={coord.x}
                    y={coord.y + 11}
                    textAnchor="middle"
                    fill={textColor}
                    fontSize="9"
                  >
                    {label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* 状态看板 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
          {philosophers.map(p => (
            <div
              key={p.id}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '8px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#1e293b' }}>哲学家 P{p.id}</div>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 'bold',
                marginTop: '4px',
                color:
                  p.state === 'eating' ? '#059669' :
                  p.state === 'deadlocked' ? '#dc2626' :
                  p.state === 'hungry' ? '#d97706' : '#64748b'
              }}>
                {p.state === 'eating' ? '正在进餐' :
                 p.state === 'deadlocked' ? '环路死锁' :
                 p.state === 'hungry' ? '饥饿等待' : '思考中'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                左筷[C{leftChopstick(p.id)}]: {p.hasLeft ? '已持' : '无'} · 右筷[C{rightChopstick(p.id)}]: {p.hasRight ? '已持' : '无'}
              </div>
            </div>
          ))}
        </div>

        {/* 实时调度流水账 */}
        <div style={{ background: '#0f172a', borderRadius: '6px', padding: '12px 16px', color: '#f8fafc', fontFamily: 'monospace' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', borderBottom: '1px solid #334155', paddingBottom: '4px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>哲学家竞争与筷子信号量流水</span>
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
  )
}
