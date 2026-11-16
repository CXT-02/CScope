import React, { useEffect, useMemo, useState, useRef } from 'react'
import { ExperimentHeader } from './AttentionExperiment'
import LearningCycle from './LearningCycle'

const STORY_STEPS = [
  {
    step: 1,
    kicker: '01 · 核心目标',
    title: 'TCP 全双工信道与可靠连接建立',
    summary: 'TCP 是面向连接的、可靠的、基于字节流的全双工传输层协议。在传输应用层数据之前，双方必须先建立连接以同步初始序列号（ISN），并确认双向均具备正常收发能力。',
    why: 'IP 网络是不可靠的尽力而为服务，TCP 必须在不可靠的网络层之上构建端到端可靠信道。',
    visual: 'duplex'
  },
  {
    step: 2,
    kicker: '02 · 第一次握手',
    title: '客户端发起连接请求：SYN 报文',
    summary: '客户端随机生成初始序列号 seq=x（如 seq=100），发送标志位 SYN=1 的连接请求报文。客户端状态由 CLOSED 跃迁为 SYN-SENT，等待服务器确认。',
    why: 'SYN 报文不携带数据，但按协议规定消耗一个序列号。',
    visual: 'syn1'
  },
  {
    step: 3,
    kicker: '03 · 第二次握手',
    title: '服务器确认并同步：SYN + ACK 报文',
    summary: '服务器收到请求后，若同意连接，则随机生成自己的初始序列号 seq=y（如 seq=300），并对客户端序列号进行确认 ack=x+1（如 ack=101），发送 SYN=1, ACK=1 报文。服务器状态进入 SYN-RCVD。',
    why: '此报文一举两得：既向客户端确认了接收能力，又向客户端同步了服务器的发送序列号。',
    visual: 'syn_ack'
  },
  {
    step: 4,
    kicker: '04 · 第三次握手',
    title: '客户端最终确认：ACK 报文与双向导通',
    summary: '客户端收到 SYN+ACK 后，发送确认报文 ACK=1，确认号 ack=y+1（如 ack=301），自己的序号 seq=x+1。客户端进入 ESTABLISHED；服务器收到后也进入 ESTABLISHED，连接正式建立！',
    why: '为什么不是两次握手？两次握手无法防止已失效的历史连接请求突然到达服务器而导致服务器单方面错误开辟资源。',
    visual: 'ack3'
  },
  {
    step: 5,
    kicker: '05 · 四次挥手',
    title: '全双工连接释放：FIN 与半关闭状态',
    summary: '由于 TCP 是全双工的，关闭一个发送方向不代表对方也无数据要发。客户端发送 FIN 后进入 FIN-WAIT-1，服务器返回 ACK 进入 CLOSE-WAIT（半关闭状态，仍能向客户端推送数据）；服务器发完数据后再发送 FIN，双方分别确认。',
    why: '每个方向的连接关闭都需要一对 FIN 与 ACK，因此通常需要四次挥手。',
    visual: 'fin_close'
  },
  {
    step: 6,
    kicker: '06 · 关键机制',
    title: 'TIME-WAIT 状态与 2MSL 等待计时器',
    summary: '主动关闭方在发出最后的 ACK 后，必须在 TIME-WAIT 状态停留 2MSL（最长报文段寿命）。目的有二：①确保最后的 ACK 能到达对方，若丢失可重发；②让本连接产生的所有旧报文在网络中彻底消失，避免干扰新连接。',
    why: '如果主动关闭方直接关闭，最后的 ACK 一旦丢失，被动关闭方将永远卡在 LAST-ACK 状态无法正常释放。',
    visual: 'time_wait'
  },
  {
    step: 7,
    kicker: '07 · 可靠基石',
    title: '超时重传机制 (ARQ) 与不可靠信道对抗',
    summary: '握手和挥手报文同样可能遭遇网络丢包。发送方每发一个报文段都会启动重传计时器（RTO），若在超时前未收到对端的 ACK，则自动触发重新发送，直至成功确认。',
    why: '确认与超时重传是 TCP 在不可靠互联网上实现 100% 可靠交付的根本支柱。',
    visual: 'retransmit'
  }
]

// 动画导学右侧高动态可视化组件 (纯正工程风，无多余 emoji)
function TcpStoryVisual({ stageIndex }) {
  const [animProgress, setAnimProgress] = useState(0) // 0: 发送端发出, 1: 信道飞行, 2: 对端接收处理

  useEffect(() => {
    setAnimProgress(0)
    const t1 = setTimeout(() => setAnimProgress(1), 800)
    const t2 = setTimeout(() => setAnimProgress(2), 2000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [stageIndex])

  return (
    <div className="tcp-story-visual-canvas" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {/* 顶部节点指示标尺 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '0 30px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#1e293b', border: '2.5px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>
            Client
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px' }}>客户端主机</span>
        </div>

        <div style={{ flex: 1, margin: '0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '4px' }}>双向全双工传输介质</span>
          <div style={{ width: '100%', height: '2px', background: '#334155', position: 'relative' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#1e293b', border: '2.5px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>
            Server
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px' }}>服务端主机</span>
        </div>
      </div>

      {/* 阶段 1: 全双工双通道说明 */}
      {stageIndex === 0 && (
        <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#1e293b', borderRadius: '6px', borderLeft: '4px solid #3b82f6' }}>
              <span style={{ color: '#93c5fd', fontSize: '0.88rem', fontWeight: 'bold' }}>发送方向 A ➔ B (Client 发送通道)</span>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>初始状态：未同步</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#1e293b', borderRadius: '6px', borderLeft: '4px solid #10b981' }}>
              <span style={{ color: '#86efac', fontSize: '0.88rem', fontWeight: 'bold' }}>发送方向 B ➔ A (Server 发送通道)</span>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>初始状态：LISTEN 监听中</span>
            </div>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '12px', textAlign: 'center' }}>
            TCP 连接必须双向分别确认收发能力，才能保证全双工通信的无损可靠。
          </div>
        </div>
      )}

      {/* 阶段 2: 第一次握手 SYN 报文飞行 */}
      {stageIndex === 1 && (
        <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '14px' }}>
            <span>Client: <strong style={{ color: '#f59e0b' }}>SYN-SENT</strong></span>
            <span>报文：[SYN=1, seq=100]</span>
            <span>Server: <strong style={{ color: animProgress >= 2 ? '#3b82f6' : '#94a3b8' }}>{animProgress >= 2 ? 'SYN-RCVD' : 'LISTEN'}</strong></span>
          </div>

          <div style={{ position: 'relative', height: '42px', background: '#1e293b', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                position: 'absolute',
                left: animProgress === 0 ? '10%' : animProgress === 1 ? '50%' : '85%',
                transform: 'translateX(-50%)',
                transition: 'all 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
                background: '#3b82f6',
                color: '#fff',
                padding: '4px 14px',
                borderRadius: '4px',
                fontSize: '0.82rem',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
                whiteSpace: 'nowrap'
              }}
            >
              SYN ➔ (seq=100)
            </div>
          </div>

          <div style={{ marginTop: '14px', fontSize: '0.82rem', color: animProgress >= 2 ? '#34d399' : '#94a3b8' }}>
            {animProgress >= 2
              ? '[处理完毕] Server 成功接收 SYN 报文，记录 Client 初始序号 100，状态转入 SYN-RCVD。'
              : '[传输中] Client 生成 seq=100 发送 SYN，请求同步序号...'}
          </div>
        </div>
      )}

      {/* 阶段 3: 第二次握手 SYN + ACK 报文返回 */}
      {stageIndex === 2 && (
        <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '14px' }}>
            <span>Client: <strong style={{ color: animProgress >= 2 ? '#10b981' : '#f59e0b' }}>{animProgress >= 2 ? 'ESTABLISHED' : 'SYN-SENT'}</strong></span>
            <span>报文：[SYN=1, ACK=1, seq=300, ack=101]</span>
            <span>Server: <strong style={{ color: '#3b82f6' }}>SYN-RCVD</strong></span>
          </div>

          <div style={{ position: 'relative', height: '42px', background: '#1e293b', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                position: 'absolute',
                left: animProgress === 0 ? '85%' : animProgress === 1 ? '50%' : '12%',
                transform: 'translateX(-50%)',
                transition: 'all 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
                background: '#10b981',
                color: '#fff',
                padding: '4px 14px',
                borderRadius: '4px',
                fontSize: '0.82rem',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
                whiteSpace: 'nowrap'
              }}
            >
              ⬅ SYN + ACK (seq=300, ack=101)
            </div>
          </div>

          <div style={{ marginTop: '14px', fontSize: '0.82rem', color: animProgress >= 2 ? '#34d399' : '#94a3b8' }}>
            {animProgress >= 2
              ? '[处理完毕] Client 收到 SYN+ACK，确认 Server 收发正常，Client 率先进入 ESTABLISHED！'
              : '[反向传输] Server 同步自身序号 300，并确认 Client 序号 (ack=101)...'}
          </div>
        </div>
      )}

      {/* 阶段 4: 第三次握手 ACK 完成双向导通 */}
      {stageIndex === 3 && (
        <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '14px' }}>
            <span>Client: <strong style={{ color: '#10b981' }}>ESTABLISHED</strong></span>
            <span>报文：[ACK=1, seq=101, ack=301]</span>
            <span>Server: <strong style={{ color: animProgress >= 2 ? '#10b981' : '#3b82f6' }}>{animProgress >= 2 ? 'ESTABLISHED' : 'SYN-RCVD'}</strong></span>
          </div>

          <div style={{ position: 'relative', height: '42px', background: '#1e293b', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                position: 'absolute',
                left: animProgress === 0 ? '12%' : animProgress === 1 ? '50%' : '88%',
                transform: 'translateX(-50%)',
                transition: 'all 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
                background: '#3b82f6',
                color: '#fff',
                padding: '4px 14px',
                borderRadius: '4px',
                fontSize: '0.82rem',
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }}
            >
              ACK ➔ (seq=101, ack=301)
            </div>
          </div>

          <div style={{ marginTop: '14px', fontSize: '0.82rem', color: animProgress >= 2 ? '#34d399' : '#94a3b8' }}>
            {animProgress >= 2
              ? '[连接完全建立] Server 收到最终确认，双方均处于 ESTABLISHED 状态，数据通道正式开通！'
              : '[最终确认中] Client 发送最后一次 ACK，通知 Server 双向已就绪...'}
          </div>
        </div>
      )}

      {/* 阶段 5: 四次挥手时序 */}
      {stageIndex === 4 && (
        <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', borderLeft: '3px solid #f59e0b' }}>
              <div style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 'bold' }}>方向 1: 客户端关闭发送</div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '4px' }}>1. Client ➔ FIN (seq=200)</div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>2. Server ➔ ACK (ack=201)</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Server 进入 CLOSE-WAIT (半关闭)</div>
            </div>

            <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', borderLeft: '3px solid #ef4444' }}>
              <div style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: 'bold' }}>方向 2: 服务端关闭发送</div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '4px' }}>3. Server ➔ FIN (seq=700)</div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>4. Client ➔ ACK (ack=701)</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Client 进入 TIME-WAIT (等 2MSL)</div>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '10px', textAlign: 'center' }}>
            四次挥手核心：半关闭状态下，Server 仍可将剩余数据全部推给 Client，直至 Server 发出自己的 FIN。
          </div>
        </div>
      )}

      {/* 阶段 6: TIME-WAIT 2MSL 倒计时机制 */}
      {stageIndex === 5 && (
        <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '0.9rem' }}>TIME-WAIT 状态保活倒计时</span>
            <span style={{ background: '#1e293b', color: '#cbd5e1', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
              标准等待：2MSL (约 60~120 秒)
            </span>
          </div>

          <div style={{ background: '#1e293b', borderRadius: '6px', padding: '12px', border: '1px solid #475569' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                T
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 'bold' }}>防止最后的 ACK 丢失产生死锁</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                  若第 4 次 ACK 丢失，Server 超时重传 FIN，处于 TIME-WAIT 的客户端可再次响应 ACK，使 Server 正常 CLOSED。
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '12px', fontSize: '0.82rem', color: '#34d399' }}>
            [旧报文消亡] 经过 2MSL 时间后，本次连接在网络中产生的所有历史迷路报文全部寿命自然耗尽，避免混淆后续新连接。
          </div>
        </div>
      )}

      {/* 阶段 7: 超时重传机制 */}
      {stageIndex === 6 && (
        <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#f87171', fontWeight: 'bold', fontSize: '0.9rem' }}>丢包场景：RTO 定时器超时自动重传</span>
            <span style={{ background: '#334155', color: '#f87171', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
              Packet Loss 模拟
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.82rem', color: '#fca5a5' }}>第 1 次发送：SYN 报文在网络路由器丢弃 (LOST)</span>
              <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>未收到确认</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.82rem', color: '#86efac' }}>超时重传：RTO 定时器触发，重新发送 SYN 报文</span>
              <span style={{ fontSize: '0.75rem', color: '#10b981' }}>Server 成功接收</span>
            </div>
          </div>

          <div style={{ marginTop: '12px', fontSize: '0.82rem', color: '#cbd5e1' }}>
            总结：TCP 将不可靠的网络层转变为可靠数据流的核心，就是<strong>超时计时器 + 确认应答 + 自动重传</strong>。
          </div>
        </div>
      )}
    </div>
  )
}

function TcpStory() {
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
      }, 4200)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isPlaying])

  const cur = STORY_STEPS[step]

  return (
    <section className="transformer-story tcp-story" style={{ marginBottom: '24px' }}>
      <header className="story-intro">
        <div>
          <span className="story-kicker">动画导学 · 约 3 分钟</span>
          <h2>每一次 SYN、ACK、FIN 都在确认一种状态</h2>
          <p>不要只背“三次”和“四次”，沿报文流动方向理解双方对彼此收发能力的确认过程。</p>
        </div>
        <div className="memory-story-badge" style={{ padding: '16px 20px', minWidth: '130px' }}>
          <strong>TCP 状态机</strong>
          <span>SYN · ACK · FIN</span>
          <small>全双工 · 超时重传</small>
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

      {/* 导学主体布局：左侧文字说明(35%)，右侧大画幅动画(65%) */}
      <div className="story-stage" style={{ display: 'grid', gridTemplateColumns: '35% 65%', gap: '20px', minHeight: '340px' }}>
        <div className="story-copy" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#2f8fe3', fontWeight: 'bold' }}>{cur.kicker}</span>
            <h3 style={{ fontSize: '1.25rem', margin: '8px 0', color: '#fff' }}>{cur.title}</h3>
            <p style={{ fontSize: '0.98rem', lineHeight: '1.7', color: '#cbd5e1' }}>{cur.summary}</p>
          </div>
          <aside style={{ background: 'rgba(47, 143, 227, 0.12)', borderLeft: '4px solid #2f8fe3', padding: '12px 14px', borderRadius: '4px' }}>
            <strong style={{ color: '#2f8fe3', fontSize: '0.92rem' }}>为什么重要？</strong>
            <p style={{ fontSize: '0.88rem', color: '#e2e8f0', margin: '4px 0 0' }}>{cur.why}</p>
          </aside>
        </div>

        {/* 右侧动态可视化 */}
        <div className="story-visual" style={{ background: '#0a101d', borderRadius: '12px', padding: '18px', border: '1px solid #1e293b', display: 'flex', alignItems: 'center' }}>
          <TcpStoryVisual stageIndex={step} />
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

function buildSteps(phase, loss) {
  if (phase === 'open') {
    const s = [st('等待建立连接', '客户端准备主动打开，服务器正在 LISTEN 监听。', 'CLOSED', 'LISTEN')]
    s.push(st('客户端发送连接请求 (第一次握手)', 'SYN 报文消耗一个序号，携带客户端初始序号 seq=100。', 'SYN-SENT', 'LISTEN', 'SYN', 'SEQ=100'))
    s.push(
      st(
        loss ? 'SYN+ACK 在网络中丢失' : '服务器确认并同步 (第二次握手)',
        loss ? '客户端迟迟收不到确认，等待超时。' : 'ACK=101 表示已确认客户端 SYN；同时服务器同步序号 seq=500。',
        'SYN-SENT',
        'SYN-RCVD',
        'SYN + ACK',
        `SEQ=500, ACK=101${loss ? ' · LOST' : ''}`,
        loss
      )
    )
    if (loss) {
      s.push(st('超时后服务器重传 SYN+ACK', '可靠传输依靠超时重传机制恢复，无需假设网络不丢包。', 'SYN-SENT', 'SYN-RCVD', 'SYN + ACK 重传', 'SEQ=500, ACK=101'))
    }
    s.push(st('客户端发送最终确认 (第三次握手)', '确认服务器序号 ack=501。服务器收到 ACK 后双方均进入 ESTABLISHED。', 'ESTABLISHED', 'ESTABLISHED', 'ACK', 'SEQ=101, ACK=501'))
    return s
  }

  const s = [st('连接正在传输数据', '双方均处于 ESTABLISHED 状态。', 'ESTABLISHED', 'ESTABLISHED')]
  s.push(st('客户端主动关闭发送方向 (第一次挥手)', '客户端发送 FIN 报文，消耗一个序号。', 'FIN-WAIT-1', 'ESTABLISHED', 'FIN', 'SEQ=200'))
  s.push(st('服务器确认客户端 FIN (第二次挥手)', '客户端进入 FIN-WAIT-2，服务器进入 CLOSE-WAIT（半关闭）。', 'FIN-WAIT-2', 'CLOSE-WAIT', 'ACK', 'ACK=201'))
  s.push(
    st(
      loss ? '服务器 FIN 报文丢失' : '服务器也关闭发送方向 (第三次挥手)',
      loss ? '客户端继续等待服务器关闭报文。' : '服务器发送完毕，向客户端提出关闭请求。',
      'FIN-WAIT-2',
      'LAST-ACK',
      'FIN',
      `SEQ=700${loss ? ' · LOST' : ''}`,
      loss
    )
  )
  if (loss) {
    s.push(st('服务器超时重传 FIN', '客户端收到服务器的关闭请求并准备最终响应。', 'FIN-WAIT-2', 'LAST-ACK', 'FIN 重传', 'SEQ=700'))
  }
  s.push(st('客户端最终确认 (第四次挥手)', '服务器收到后彻底 CLOSED；客户端进入 TIME-WAIT 状态。', 'TIME-WAIT', 'CLOSED', 'ACK', 'ACK=701'))
  s.push(st('等待 2MSL 后客户端完全关闭', '网络中残留的旧报文自然消亡，双方完全 CLOSED。', 'CLOSED', 'CLOSED'))
  return s
}

function st(title, message, client, server, packet = null, seq = null, lost = false) {
  return { title, message, client, server, packet, seq, lost }
}

function TcpDiagram({ steps, index }) {
  const visibleSteps = steps.slice(1, index + 1)
  const svgHeight = Math.max(460, visibleSteps.length * 75 + 90)

  return (
    <div className="tcp-diagram-container" style={{ width: '100%', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
      {/* 顶部两端标题 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 50px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3b82f6' }} />
          <strong style={{ fontSize: '1.1rem', color: '#1e293b' }}>客户端 Client</strong>
        </div>
        <div style={{ fontSize: '0.88rem', color: '#64748b', fontStyle: 'italic' }}>
          时间流逝方向 ↓ (向下斜线体现传输时长)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <strong style={{ fontSize: '1.1rem', color: '#1e293b' }}>服务器 Server</strong>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
        </div>
      </div>

      {/* SVG 斜向下时空时序图 */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 760 ${svgHeight}`}
          style={{ width: '100%', minWidth: '600px', height: `${svgHeight}px`, overflow: 'visible' }}
        >
          <defs>
            {/* 普通蓝色箭头 */}
            <marker id="tcp-arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb" />
            </marker>
            {/* 绿色返回箭头 */}
            <marker id="tcp-arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669" />
            </marker>
            {/* 红色重传/丢失箭头 */}
            <marker id="tcp-arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
            </marker>
          </defs>

          {/* 两条垂直时间轴 (生命线) */}
          <line x1="110" y1="20" x2="110" y2={svgHeight - 20} stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="5 5" />
          <line x1="650" y1="20" x2="650" y2={svgHeight - 20} stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="5 5" />

          {/* 时间轴末端向下指示箭头 */}
          <polygon points="106,440 114,440 110,452" fill="#94a3b8" />
          <polygon points="646,440 654,440 650,452" fill="#94a3b8" />
          <text x="110" y={svgHeight - 6} fill="#64748b" fontSize="12" fontWeight="bold" textAnchor="middle">时间 t ↓</text>
          <text x="650" y={svgHeight - 6} fill="#64748b" fontSize="12" fontWeight="bold" textAnchor="middle">时间 t ↓</text>

          {/* 渲染所有已发生报文的斜向下长箭头 */}
          {visibleSteps.map((s, i) => {
            const isCurrent = i === visibleSteps.length - 1
            const y1 = 45 + i * 72
            const y2 = y1 + 46 // 长长的斜向下跨越 46 像素时延！

            const fromServer = s.packet?.startsWith('SYN + ACK') || (s.packet?.startsWith('FIN') && s.server === 'LAST-ACK') || (s.packet === 'ACK' && s.server === 'CLOSE-WAIT')

            const xStart = fromServer ? 650 : 110
            const xEnd = fromServer ? 110 : 650
            const arrowMarker = s.lost ? 'tcp-arrow-red' : fromServer ? 'tcp-arrow-green' : 'tcp-arrow-blue'
            const strokeColor = s.lost ? '#dc2626' : fromServer ? '#059669' : '#2563eb'

            // 中点坐标 (放置大号清晰文字)
            const midX = (xStart + xEnd) / 2
            const midY = (y1 + y2) / 2

            // 丢包场景下只画前半截
            const dropX = fromServer ? 650 - (650 - 110) * 0.55 : 110 + (650 - 110) * 0.55
            const dropY = y1 + 46 * 0.55

            return (
              <g key={i} className={`tcp-seq-row ${isCurrent ? 'is-active' : ''}`}>
                {/* 发送端时间锚点 */}
                <circle cx={xStart} cy={y1} r={isCurrent ? '6' : '4.5'} fill={strokeColor} stroke="#fff" strokeWidth="2" />

                {!s.lost ? (
                  <>
                    {/* 长长的斜向下传播箭头线 */}
                    <line
                      x1={xStart}
                      y1={y1}
                      x2={xEnd}
                      y2={y2}
                      stroke={strokeColor}
                      strokeWidth={isCurrent ? '3.5' : '2.5'}
                      markerEnd={`url(#${arrowMarker})`}
                      style={{
                        filter: isCurrent ? 'drop-shadow(0 0 6px rgba(37,99,235,0.4))' : 'none',
                        transition: 'all 0.3s ease'
                      }}
                    />
                    {/* 接收端时间锚点 (晚于发送时刻到达) */}
                    <circle cx={xEnd} cy={y2} r={isCurrent ? '6' : '4.5'} fill={strokeColor} stroke="#fff" strokeWidth="2" />
                  </>
                ) : (
                  <>
                    {/* 丢包场景：斜线中途夭折并带有红色阻断 X */}
                    <line
                      x1={xStart}
                      y1={y1}
                      x2={dropX}
                      y2={dropY}
                      stroke="#dc2626"
                      strokeWidth="3"
                      strokeDasharray="6 4"
                    />
                    <circle cx={dropX} cy={dropY} r="10" fill="#fee2e2" stroke="#dc2626" strokeWidth="2" />
                    <text x={dropX} y={dropY + 4} fill="#dc2626" fontSize="12" fontWeight="bold" textAnchor="middle">×</text>
                    <rect x={dropX - 45} y={dropY + 12} width="90" height="20" rx="4" fill="#fef2f2" stroke="#dc2626" strokeWidth="1" />
                    <text x={dropX} y={dropY + 26} fill="#dc2626" fontSize="11" fontWeight="bold" textAnchor="middle">报文丢弃 (LOST)</text>
                  </>
                )}

                {/* 报文标签卡片 (大字号、清晰醒目、带背景衬底) */}
                <g transform={`translate(${midX}, ${midY - 14})`}>
                  <rect
                    x="-125"
                    y="-16"
                    width="250"
                    height="32"
                    rx="6"
                    fill={isCurrent ? (s.lost ? '#fef2f2' : '#eff6ff') : '#ffffff'}
                    stroke={isCurrent ? strokeColor : '#cbd5e1'}
                    strokeWidth={isCurrent ? '1.8' : '1'}
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"
                  />
                  {/* 大字号报文名称 */}
                  <text
                    x="-115"
                    y="5"
                    fill={s.lost ? '#b91c1c' : strokeColor}
                    fontSize="15"
                    fontWeight="800"
                    fontFamily="sans-serif"
                  >
                    {s.packet}
                  </text>
                  {/* 大字号参数序列号 */}
                  <text
                    x="115"
                    y="5"
                    fill="#334155"
                    fontSize="13.5"
                    fontWeight="600"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {s.seq}
                  </text>
                </g>

                {/* 两侧对应时刻的状态标注 */}
                <text
                  x={xStart > 200 ? 665 : 95}
                  y={y1 + 4}
                  fill="#475569"
                  fontSize="12.5"
                  fontWeight="bold"
                  textAnchor={xStart > 200 ? 'start' : 'end'}
                >
                  {xStart > 200 ? s.server : s.client}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

export default function TcpConnectionExperiment({ experiment }) {
  const [phase, setPhase] = useState('open')
  const [loss, setLoss] = useState(false)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)

  const steps = useMemo(() => buildSteps(phase, loss), [phase, loss])
  const step = steps[index]

  useEffect(() => {
    setIndex(0)
    setPlaying(false)
  }, [phase, loss])

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => {
      setIndex(v => {
        if (v >= steps.length - 1) {
          setPlaying(false)
          return v
        }
        return v + 1
      })
    }, 1100)
    return () => clearInterval(t)
  }, [playing, steps.length])

  return (
    <>
      <ExperimentHeader experiment={experiment} eyebrow="计算机网络实验 01 · 传输层" />

      {/* 动画导学区 */}
      <TcpStory />

      {/* 自由探索交互实验室 */}
      <div className="explore-heading">
        <span>自由探索 · 逐包观察 TCP 状态机演化</span>
        <h2>连接建立 (握手) 与连接释放 (挥手) 实验室</h2>
        <p>切换握手与挥手模式，开启丢包模拟，实时观察控制报文序号、确认号及两端状态机的转移。</p>
      </div>

      <div className="lab-layout tcp-layout">
        <aside className="control-panel">
          <div className="panel-title">
            <span>连接状态机控制</span>
            <i>{phase === 'open' ? '建立连接 (握手)' : '释放连接 (挥手)'}</i>
          </div>

          <div className="nn-neuron-tabs">
            <button className={phase === 'open' ? 'active' : ''} onClick={() => setPhase('open')}>
              三次握手 (Connect)
            </button>
            <button className={phase === 'close' ? 'active' : ''} onClick={() => setPhase('close')}>
              四次挥手 (Disconnect)
            </button>
          </div>

          <label className="cnn-toggle" style={{ marginTop: '12px' }}>
            <input type="checkbox" checked={loss} onChange={e => setLoss(e.target.checked)} />
            <span>
              <strong>模拟控制报文丢失 (Loss)</strong>
              <small>观察 RTO 超时后如何自动重传恢复</small>
            </span>
          </label>

          <div className="step-counter" style={{ marginTop: '14px' }}>
            <span>当前时序步数</span>
            <strong>{index} / {steps.length - 1}</strong>
          </div>

          <input
            className="step-slider"
            type="range"
            min="0"
            max={steps.length - 1}
            value={index}
            onChange={e => {
              setIndex(Number(e.target.value))
              setPlaying(false)
            }}
          />

          <div className="step-buttons">
            <button disabled={!index} onClick={() => setIndex(index - 1)}>
              ← 上一步
            </button>
            <button disabled={index === steps.length - 1} onClick={() => setIndex(index + 1)}>
              下一步 →
            </button>
          </div>

          <button
            className="tree-play"
            onClick={() => {
              if (index === steps.length - 1) setIndex(0)
              setPlaying(v => !v)
            }}
          >
            {playing ? '暂停' : index === steps.length - 1 ? '重新播放' : '▶ 自动播放时序'}
          </button>

          <div className="live-explanation" style={{ marginTop: '14px' }}>
            <span>{step.packet ? `报文标志：${step.packet}` : '连接状态'}</span>
            <strong>{step.title}</strong>
            <p>{step.message}</p>
          </div>
        </aside>

        <section className="visual-panel tcp-visual">
          <div className="visual-toolbar">
            <div>
              <strong>TCP 状态机与报文时序流水线</strong>
              <span>左：客户端 · 右：服务端 · 蓝色：正常传输 · 红色：丢失重传</span>
            </div>
            <span className="source-chip">{step.client} / {step.server}</span>
          </div>

          <TcpDiagram steps={steps} index={index} />

          <div className="tcp-state-cards" style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '16px 20px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.88rem', color: '#64748b' }}>客户端当前状态 (Client State)</span>
              <strong style={{ display: 'block', fontSize: '1.3rem', marginTop: '6px', color: step.client === 'ESTABLISHED' ? '#10b981' : step.client.includes('WAIT') ? '#f59e0b' : '#2563eb' }}>
                {step.client}
              </strong>
            </div>
            <div style={{ padding: '16px 20px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.88rem', color: '#64748b' }}>服务端当前状态 (Server State)</span>
              <strong style={{ display: 'block', fontSize: '1.3rem', marginTop: '6px', color: step.server === 'ESTABLISHED' ? '#10b981' : step.server.includes('WAIT') ? '#f59e0b' : '#059669' }}>
                {step.server}
              </strong>
            </div>
          </div>

          <div className="tcp-packet-detail" style={{ marginTop: '14px', padding: '16px 20px', borderRadius: '8px', background: '#f8fafc', borderLeft: '4px solid #2563eb', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.88rem', color: '#64748b' }}>当前处理报文与状态机说明</span>
            <strong style={{ display: 'block', fontSize: '1.2rem', marginTop: '6px', color: '#1e293b' }}>{step.packet ?? '当前无传输中的控制报文'}</strong>
            <p style={{ fontSize: '0.95rem', marginTop: '6px', color: '#334155', lineHeight: '1.6', margin: '6px 0 0' }}>
              {step.seq ? `${step.seq} · ${step.message}` : step.message}
            </p>
          </div>
        </section>
      </div>

      <LearningCycle
        experimentId="tcp-connection"
        prediction={{
          question: '为什么建立 TCP 连接通常需要三次握手，而不是两次？',
          options: ['确认双方各自具备发送和接收能力，防止失效的历史连接请求导致错误开辟资源', '让传输报文的体积变得更大', '为了动态获取对方的 IP 地址'],
          answer: '确认双方各自具备发送和接收能力，防止失效的历史连接请求导致错误开辟资源',
          explanation: '第三次 ACK 让服务器确认客户端已经收到服务器的 SYN，从而确认了双向可用性，避免历史滞留 SYN 让服务器盲目等待。'
        }}
        operation={{
          title: '观察报文丢失后的超时重传',
          instruction: '勾选“模拟控制报文丢失”，分别播放三次握手和四次挥手，观察发送方如何超时触发重传并恢复正常状态机。'
        }}
        observation={`当前客户端状态为 ${step.client}，服务端状态为 ${step.server}；${step.packet ? `当前报文：${step.packet} (${step.seq})` : '两端连接处于稳定状态'}。`}
        summaryPrompt="四次挥手中，客户端为什么要在 TIME-WAIT 停留 2MSL 时间才真正关闭？"
      />
    </>
  )
}
