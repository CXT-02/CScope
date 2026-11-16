import React, { useEffect, useMemo, useState, useRef } from 'react'
import { ExperimentHeader } from './AttentionExperiment'
import LearningCycle from './LearningCycle'

const TOTAL = 12

const STORY_STEPS = [
  {
    step: 1,
    kicker: '01 · 可靠传输与流水线',
    title: '滑动窗口：发送方无需每包停等确认',
    summary: '如果每发一个包都停下来等待对方确认（停等协议），信道大部分时间都在空闲等待传播时延。滑动窗口允许在收到确认前连续发送多个报文（在途报文），大幅提高信道利用率。',
    why: '停等协议的信道吞吐量受往返时延 RTT 严重制约，滑动窗口流水线机制是现代高速网络传输的基石。',
    visual: 'window_structure'
  },
  {
    step: 2,
    kicker: '02 · 窗口前移推进',
    title: '累计确认机制与窗口向右滑动',
    summary: 'TCP 采用累计确认（Cumulative ACK），ACK=n 表示序号 n 之前的所有数据均已无误收到。收到 ACK 后，发送窗口左边界向右推进，右侧释放出新的发送配额。',
    why: '累计确认不仅简化了状态维护，而且当某些中间的 ACK 报文在网络丢失时，后续更大的 ACK 能直接一并确认。',
    visual: 'window_slide'
  },
  {
    step: 3,
    kicker: '03 · 端到端保护',
    title: '流量控制：由接收方缓存 rwnd 约束',
    summary: '接收方的应用进程读取速度有限。接收方通过 TCP 首部中的“窗口字段（rwnd）”实时告知发送方自己当前剩余的接收缓存空间。发送方的发送窗口绝不能超过 rwnd，防止接收端缓冲区溢出。',
    why: '流量控制解决的是通信两端“发送端太快、接收端处理太慢”的局部匹配问题。',
    visual: 'flow_control'
  },
  {
    step: 4,
    kicker: '04 · 全局网络保护',
    title: '拥塞控制：有效窗口的双限瓶颈法则',
    summary: '整个互联网如同一个公用交通网络，若所有主机盲目向网络倾倒数据，路由器缓冲区溢出引发全网雪崩（拥塞崩溃）。发送方维护拥塞窗口 cwnd，有效发送窗口必须取两者的较小值：min(rwnd, cwnd)。',
    why: '流量控制是点对点的端系统保护；拥塞控制是全网性的全局容量自适应。',
    visual: 'dual_limit'
  },
  {
    step: 5,
    kicker: '05 · 带宽快速探测',
    title: '慢启动算法：指数爆炸式倍增',
    summary: '刚建立连接时，发送方对网络容量一无所知。慢启动让 cwnd 从 1 起步，每经过一个往返时间（RTT），收到一轮确认就使 cwnd 翻倍：1 ➔ 2 ➔ 4 ➔ 8，以指数级速度快速探顶网络吞吐上限。',
    why: '“慢启动”一点也不慢，其增长速率呈指数爆炸，能以最短时间利用高带宽链路。',
    visual: 'slow_start'
  },
  {
    step: 6,
    kicker: '06 · 平稳逼近容量',
    title: '拥塞避免算法：到达阈值转为线性增长',
    summary: '当 cwnd 达到慢启动门限（ssthresh）后，若继续翻倍极易撑爆路由器。此时切换为拥塞避免算法，每个 RTT 只增加 1 个报文段（线性加法增大），小心翼翼地逼近网络极限。',
    why: '加法增大使得发送速率在接近信道极限时更加平稳可控，避免引发大面积剧烈丢包。',
    visual: 'congestion_avoidance'
  },
  {
    step: 7,
    kicker: '07 · 拥塞信号与回退',
    title: '丢包信号与乘法减小：动态自适应平衡',
    summary: '当网络出现丢包超时时，发送方判定网络发生严重拥塞。立即启动“乘法减小”：将 ssthresh 砍半，cwnd 直接断崖回退到 1，重新进入慢启动，给网络路由器让出充足的排空恢复时间。',
    why: '加法增大、乘法减小（AIMD）在数学上被证明具有收敛性与公平性，是互联网稳定运行的核心保障。',
    visual: 'loss_recovery'
  }
]

// 动画导学右侧高动态可视化组件 (大字号、鲜艳高对比度、高质感动画)
function WindowStoryVisual({ stageIndex }) {
  const [slideOffset, setSlideOffset] = useState(0) // 窗口滑动位移
  const [cwndVal, setCwndVal] = useState(1)

  useEffect(() => {
    setSlideOffset(0)
    setCwndVal(1)

    if (stageIndex === 1) { // 窗口滑动
      const t = setTimeout(() => setSlideOffset(2), 1200)
      return () => clearTimeout(t)
    } else if (stageIndex === 4) { // 慢启动 1 -> 2 -> 4 -> 8
      const t1 = setTimeout(() => setCwndVal(2), 700)
      const t2 = setTimeout(() => setCwndVal(4), 1400)
      const t3 = setTimeout(() => setCwndVal(8), 2100)
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    } else if (stageIndex === 5) { // 拥塞避免 8 -> 9 -> 10 -> 11
      const t1 = setTimeout(() => setCwndVal(9), 800)
      const t2 = setTimeout(() => setCwndVal(10), 1600)
      const t3 = setTimeout(() => setCwndVal(11), 2400)
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    }
  }, [stageIndex])

  return (
    <div className="window-story-visual-canvas" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {/* 阶段 1: 窗口结构与四大状态 */}
      {stageIndex === 0 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ color: '#38bdf8', fontSize: '1rem', fontWeight: 'bold' }}>发送方报文序列与当前发送窗口 (窗口大小 = 4)</span>
            <span style={{ background: '#1e293b', color: '#f8fafc', padding: '4px 12px', borderRadius: '4px', fontSize: '0.85rem' }}>
              Base = 3
            </span>
          </div>

          {/* 报文槽位长条 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '8px', padding: '14px 6px', position: 'relative' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
              const isAcked = num <= 2
              const inFlight = num >= 3 && num <= 4
              const canSend = num >= 5 && num <= 6
              const waitWindow = num >= 7

              const bg = isAcked ? '#10b981' : inFlight ? '#3b82f6' : canSend ? '#f59e0b' : '#334155'
              const statusText = isAcked ? '已确认' : inFlight ? '在途中' : canSend ? '可发送' : '未授权'

              return (
                <div
                  key={num}
                  style={{
                    height: '80px',
                    borderRadius: '8px',
                    background: bg,
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: canSend ? '2px dashed #fbbf24' : 'none',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <span style={{ fontSize: '1.25rem', fontWeight: '900' }}>{num}</span>
                  <span style={{ fontSize: '0.78rem', marginTop: '4px', opacity: 0.95 }}>{statusText}</span>
                </div>
              )
            })}
          </div>

          {/* 窗口框架示意 */}
          <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#1e293b', borderRadius: '6px' }}>
            <span style={{ color: '#10b981', fontSize: '0.85rem' }}>绿色：已确认 (越过窗口)</span>
            <span style={{ color: '#60a5fa', fontSize: '0.85rem' }}>蓝色：在途 (已发未确认)</span>
            <span style={{ color: '#fbbf24', fontSize: '0.85rem' }}>橙色：可用配额 (立即能发)</span>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>灰色：超出窗口禁止发送</span>
          </div>
        </div>
      )}

      {/* 阶段 2: 收到 ACK 窗口向右滑动 */}
      {stageIndex === 1 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ color: '#10b981', fontSize: '1rem', fontWeight: 'bold' }}>
              {slideOffset > 0 ? '收到 ACK=3：窗口向右平移 2 格' : '等待接收方返回 ACK...'}
            </span>
            <span style={{ background: slideOffset > 0 ? '#10b981' : '#1e293b', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              {slideOffset > 0 ? 'Base 推进至 3' : 'Base = 1'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '8px', padding: '14px 6px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
              const isAcked = slideOffset > 0 ? num <= 2 : false
              const inWindow = slideOffset > 0 ? num >= 3 && num <= 6 : num >= 1 && num <= 4

              return (
                <div
                  key={num}
                  style={{
                    height: '80px',
                    borderRadius: '8px',
                    background: isAcked ? '#10b981' : inWindow ? '#3b82f6' : '#334155',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: inWindow ? '2.5px solid #60a5fa' : 'none',
                    transform: inWindow ? 'scale(1.03)' : 'scale(1)',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <span style={{ fontSize: '1.25rem', fontWeight: '900' }}>{num}</span>
                  <span style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                    {isAcked ? '已确认' : inWindow ? '窗口内' : '等待中'}
                  </span>
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: '12px', fontSize: '0.88rem', color: slideOffset > 0 ? '#34d399' : '#cbd5e1', lineHeight: '1.5' }}>
            {slideOffset > 0
              ? '右侧新空位释放：原本不可发送的 [5] 和 [6] 随着窗口向右推进，自动纳入发送窗口并获得发送配额！'
              : '发送方已发出 [1] 和 [2]，此时正等待接收方返回累计确认 ACK...'}
          </div>
        </div>
      )}

      {/* 阶段 3: 流量控制 rwnd 机制 */}
      {stageIndex === 2 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ color: '#f59e0b', fontSize: '1rem', fontWeight: 'bold' }}>接收方缓存容量限制：流量控制 (Flow Control)</span>
            <span style={{ background: '#f59e0b', color: '#1e293b', padding: '4px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              rwnd = 3 (缓存剩余容量)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '14px 0' }}>
            <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ color: '#93c5fd', fontSize: '0.9rem', fontWeight: 'bold' }}>发送方强约束</div>
              <div style={{ color: '#f8fafc', fontSize: '1.2rem', fontWeight: 'bold', margin: '6px 0' }}>发送窗口 ≤ 3 个报文</div>
              <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>即便网络非常通畅，也不允许超出接收端承载能力。</div>
            </div>

            <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ color: '#fde68a', fontSize: '0.9rem', fontWeight: 'bold' }}>接收端缓存状态</div>
              <div style={{ color: '#f8fafc', fontSize: '1.2rem', fontWeight: 'bold', margin: '6px 0' }}>已占用 5 / 剩余 3</div>
              <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>通过 TCP 首部中的 Window 字段动态通告 rwnd。</div>
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
            若应用程序停止读取导致 rwnd = 0，发送方将停止发送并启动持续计时器（Persistence Timer）定期探测。
          </div>
        </div>
      )}

      {/* 阶段 4: 双限法则 min(rwnd, cwnd) */}
      {stageIndex === 3 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <span style={{ color: '#38bdf8', fontSize: '1.15rem', fontWeight: 'bold' }}>
              有效发送窗口 W = min(rwnd, cwnd)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center' }}>
            <div style={{ background: '#1e293b', border: '2px solid #10b981', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: '#6ee7b7' }}>接收方通告窗口 (rwnd)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981', margin: '4px 0' }}>6</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>保护对端接收缓冲区</div>
            </div>

            <div style={{ fontSize: '1.6rem', color: '#94a3b8', fontWeight: 'bold' }}>∩</div>

            <div style={{ background: '#1e293b', border: '2px solid #ef4444', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: '#fca5a5' }}>网络拥塞窗口 (cwnd)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ef4444', margin: '4px 0' }}>4</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>保护整个网络路由信道</div>
            </div>
          </div>

          <div style={{ marginTop: '16px', padding: '10px 14px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid #38bdf8', borderRadius: '6px', textAlign: 'center' }}>
            <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '0.95rem' }}>
              木桶短板决定：当前实际有效发送配额为 4 个报文段（受网络拥塞约束）
            </span>
          </div>
        </div>
      )}

      {/* 阶段 5: 慢启动指数翻倍动画 */}
      {stageIndex === 4 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ color: '#f59e0b', fontSize: '1rem', fontWeight: 'bold' }}>慢启动阶段 (Slow Start) · 动态探测可用带宽</span>
            <span style={{ background: '#f59e0b', color: '#1e293b', padding: '4px 12px', borderRadius: '4px', fontSize: '0.9rem', fontWeight: '900' }}>
              当前 cwnd = {cwndVal}
            </span>
          </div>

          {/* 指数柱状图对比 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', alignItems: 'flex-end', height: '120px', padding: '10px 0', borderBottom: '1px solid #334155' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '20px', background: '#3b82f6', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '0.85rem' }}>1</div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>第 1 轮</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '48px', height: cwndVal >= 2 ? '40px' : '0px', background: '#3b82f6', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.4s' }}>{cwndVal >= 2 ? '2' : ''}</div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>第 2 轮</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '48px', height: cwndVal >= 4 ? '70px' : '0px', background: '#3b82f6', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.4s' }}>{cwndVal >= 4 ? '4' : ''}</div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>第 3 轮</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '48px', height: cwndVal >= 8 ? '100px' : '0px', background: '#10b981', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.4s' }}>{cwndVal >= 8 ? '8' : ''}</div>
              <span style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '6px', fontWeight: 'bold' }}>触及 ssthresh</span>
            </div>
          </div>

          <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#cbd5e1' }}>
            规律：每经过 1 个 RTT，拥塞窗口翻倍增长（$2^0 \rightarrow 2^1 \rightarrow 2^2 \rightarrow 2^3$）。
          </div>
        </div>
      )}

      {/* 阶段 6: 拥塞避免线性加法增加 */}
      {stageIndex === 5 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ color: '#10b981', fontSize: '1rem', fontWeight: 'bold' }}>拥塞避免阶段 (Congestion Avoidance) · 线性缓慢逼近</span>
            <span style={{ background: '#10b981', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '0.9rem', fontWeight: '900' }}>
              cwnd = {cwndVal} (加法增大 +1)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '16px', background: '#1e293b', borderRadius: '8px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f59e0b' }}>8</div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ssthresh 阈值</span>
            </div>
            <div style={{ fontSize: '1.3rem', color: '#10b981', fontWeight: 'bold' }}>➔ +1 ➔</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#3b82f6' }}>9</div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>第 1 轮增加</span>
            </div>
            <div style={{ fontSize: '1.3rem', color: '#10b981', fontWeight: 'bold' }}>➔ +1 ➔</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#3b82f6' }}>10</div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>第 2 轮增加</span>
            </div>
            <div style={{ fontSize: '1.3rem', color: '#10b981', fontWeight: 'bold' }}>➔ +1 ➔</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#34d399' }}>11</div>
              <span style={{ fontSize: '0.75rem', color: '#34d399' }}>平稳逼近容量</span>
            </div>
          </div>

          <div style={{ marginTop: '14px', fontSize: '0.85rem', color: '#cbd5e1' }}>
            转入线性增长后，不再盲目翻倍，降低了网络排队丢包的概率。
          </div>
        </div>
      )}

      {/* 阶段 7: 丢包与乘法减小 */}
      {stageIndex === 6 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ color: '#ef4444', fontSize: '1rem', fontWeight: 'bold' }}>丢包断崖回退：乘法减小 (Multiplicative Decrease)</span>
            <span style={{ background: '#ef4444', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              超时警报：丢包发生
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', margin: '10px 0' }}>
            <div style={{ background: '#1e293b', borderLeft: '4px solid #ef4444', padding: '14px', borderRadius: '6px' }}>
              <div style={{ color: '#fca5a5', fontSize: '0.88rem', fontWeight: 'bold' }}>新慢启动阈值折半</div>
              <div style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold', margin: '4px 0' }}>
                ssthresh = cwnd / 2 = 5
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>记住发生拥塞的临界点</div>
            </div>

            <div style={{ background: '#1e293b', borderLeft: '4px solid #f59e0b', padding: '14px', borderRadius: '6px' }}>
              <div style={{ color: '#fde68a', fontSize: '0.88rem', fontWeight: 'bold' }}>拥塞窗口重置</div>
              <div style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold', margin: '4px 0' }}>
                cwnd 断崖回退至 1
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>给网络让出缓冲排空时间</div>
            </div>
          </div>

          <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#34d399' }}>
            随后在 1~5 之间重新进行慢启动，达到 5 后再次进入拥塞避免，形成著名的 TCP 锯齿波形。
          </div>
        </div>
      )}
    </div>
  )
}

function WindowStory() {
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
    <section className="transformer-story window-story" style={{ marginBottom: '24px' }}>
      <header className="story-intro">
        <div>
          <span className="story-kicker">动画导学 · 约 3 分钟</span>
          <h2>窗口越大不一定越快，还要看网络能否承受</h2>
          <p>滑动窗口提高并行度，流量控制保护接收端，拥塞控制保护整个网络。</p>
        </div>
        <div className="memory-story-badge" style={{ padding: '16px 20px', minWidth: '130px' }}>
          <strong>有效窗口</strong>
          <span>min(rwnd, cwnd)</span>
          <small>接收能力 ∩ 网络能力</small>
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
          <WindowStoryVisual stageIndex={step} />
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

function PacketTrack({ step, rwnd }) {
  const win = Math.min(rwnd, step.cwnd)
  return (
    <div className="packet-track" style={{ display: 'grid', gridTemplateColumns: `repeat(${TOTAL}, 1fr)`, gap: '8px', margin: '24px 0' }}>
      {Array.from({ length: TOTAL }, (_, i) => i + 1).map((p) => {
        const isAcked = step.acked.includes(p)
        const isLost = step.lost === p
        const isFlight = step.inFlight.includes(p)
        const inWindow = p >= step.base && p < step.base + win

        const cls = isAcked ? 'acked' : isLost ? 'lost' : isFlight ? 'flight' : inWindow ? 'window' : ''
        
        return (
          <div
            className={cls}
            key={p}
            style={{
              height: '90px',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: inWindow ? '2.5px solid #2f8fe3' : '1px solid #e2e8f0',
              background: isAcked ? '#10b981' : isLost ? '#ef4444' : isFlight ? '#3b82f6' : inWindow ? '#eff6ff' : '#f8fafc',
              color: isAcked || isLost || isFlight ? '#fff' : '#1e293b',
              transition: 'all 0.3s'
            }}
          >
            <span style={{ fontSize: '1.35rem', fontWeight: '900' }}>{p}</span>
            <i style={{ fontStyle: 'normal', fontSize: '0.8rem', marginTop: '4px', fontWeight: 'bold' }}>
              {isAcked ? '已确认' : isLost ? '丢弃' : isFlight ? '发送中' : inWindow ? '可用' : '等待'}
            </i>
          </div>
        )
      })}
    </div>
  )
}

function CwndChart({ steps, index }) {
  const shown = steps.slice(0, index + 1)
  const max = Math.max(8, ...shown.map(s => s.cwnd))
  const points = shown.map((s, i) => `${20 + i * (560 / Math.max(1, steps.length - 1))},${105 - (s.cwnd / max) * 85}`).join(' ')
  
  return (
    <div className="cwnd-chart" style={{ marginTop: '16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <strong style={{ fontSize: '1rem', color: '#1e293b' }}>拥塞窗口变化动态轨迹 (cwnd)</strong>
        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>慢启动 (指数) ➔ 拥塞避免 (线性) ➔ 超时丢包回退</span>
      </div>
      <svg viewBox="0 0 600 120" style={{ width: '100%', height: '110px' }} preserveAspectRatio="none">
        <line x1="20" y1="105" x2="580" y2="105" stroke="#cbd5e1" strokeWidth="1.5" />
        <polyline points={points} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function simulate(rwnd, lossAt) {
  let base = 1, cwnd = 1, ssthresh = 8, lostOnce = false, acked = []
  const steps = [snap('准备发送', '连接刚建立，cwnd 从 1 个报文起步 (慢启动初期)。', [], null, '慢启动')]
  let guard = 0

  while (base <= TOTAL && guard++ < 30) {
    const count = Math.max(1, Math.floor(Math.min(rwnd, cwnd)))
    const batch = Array.from({ length: Math.min(count, TOTAL - base + 1) }, (_, i) => base + i)
    steps.push(snap('发送数据', `当前有效窗口允许本轮发送报文 [${batch.join(', ')}]。`, batch, null, cwnd < ssthresh ? '慢启动' : '拥塞避免'))

    if (lossAt && batch.includes(lossAt) && !lostOnce) {
      lostOnce = true
      steps.push(snap('检测到网络丢包', `报文 Packet ${lossAt} 未到达对端，发送方 RTO 定时器等待超时。`, batch, lossAt, '拥塞告警'))
      ssthresh = Math.max(2, Math.floor(cwnd / 2))
      cwnd = 1
      steps.push(snap('超时重传与回退', `cwnd 强制回退到 1，门限 ssthresh 调整为 ${ssthresh}，重新启动发送。`, [], lossAt, '慢启动'))
      continue
    }

    acked = [...acked, ...batch.filter(p => !acked.includes(p))].sort((a, b) => a - b)
    base = batch.at(-1) + 1
    cwnd = cwnd < ssthresh ? Math.min(16, cwnd * 2) : Math.min(16, cwnd + 1)
    steps.push(snap('收到累计确认', `接收方成功累计确认至 Packet ${base - 1}，发送窗口向右平移。`, [], null, cwnd < ssthresh ? '慢启动' : '拥塞避免'))
  }

  steps.push({ ...snap('传输全部完成', '所有报文均已成功收到 ACK 确认，窗口停止滑动。', [], null, '完成'), done: true })
  return steps

  function snap(event, message, inFlight, lost, phase) {
    return {
      event,
      message,
      inFlight: [...inFlight],
      lost,
      phase,
      base,
      cwnd,
      ssthresh,
      acked: [...acked],
      done: false
    }
  }
}

export default function SlidingWindowExperiment({ experiment }) {
  const [rwnd, setRwnd] = useState(5)
  const [loss, setLoss] = useState(7)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)

  const steps = useMemo(() => simulate(rwnd, loss), [rwnd, loss])
  const step = steps[Math.min(index, steps.length - 1)]

  useEffect(() => {
    setIndex(0)
    setPlaying(false)
  }, [rwnd, loss])

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
    }, 1000)
    return () => clearInterval(t)
  }, [playing, steps.length])

  return (
    <>
      <ExperimentHeader experiment={experiment} eyebrow="计算机网络实验 02 · 传输层" />

      {/* 动画导学区 */}
      <WindowStory />

      {/* 自由探索交互实验室 */}
      <div className="explore-heading">
        <span>自由探索 · 发送窗口同时受两种限制</span>
        <h2>滑动窗口与拥塞控制 (TCP Congestion Control) 实验室</h2>
        <p>调整接收端窗口 rwnd 与注入丢包节点，逐轮观测慢启动、拥塞避免、超时重传与 cwnd 动态曲线。</p>
      </div>

      <div className="lab-layout window-layout" style={{ gridTemplateColumns: '320px 1fr' }}>
        {/* 左侧控制台 */}
        <aside className="control-panel">
          <div className="panel-title">
            <span>传输与信道参数</span>
            <i>{step.phase}</i>
          </div>

          <label className="range-field" style={{ marginTop: '12px' }}>
            <span>
              <b style={{ fontSize: '0.95rem' }}>接收窗口 rwnd</b>
              <i style={{ fontSize: '1.1rem', color: '#2563eb' }}>{rwnd}</i>
            </span>
            <small style={{ fontSize: '0.8rem', color: '#64748b' }}>接收方当前剩余缓存配额</small>
            <input type="range" min="2" max="8" value={rwnd} onChange={e => setRwnd(Number(e.target.value))} />
          </label>

          <label className="field-block" style={{ marginTop: '14px' }}>
            <span>首次模拟丢包的报文</span>
            <small style={{ fontSize: '0.8rem', color: '#64748b' }}>选“无丢包”可观察完整的慢启动与线性增长</small>
            <select
              value={loss}
              onChange={e => setLoss(Number(e.target.value))}
              style={{ padding: '8px', fontSize: '0.92rem', borderRadius: '6px', fontWeight: 'bold' }}
            >
              <option value="0">无丢包 (理想顺畅网络)</option>
              {Array.from({ length: 9 }, (_, i) => i + 4).map(x => (
                <option key={x} value={x}>Packet {x} (报文丢失)</option>
              ))}
            </select>
          </label>

          <div className="step-counter" style={{ marginTop: '14px' }}>
            <span>当前传输步数</span>
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
              if (step.done) setIndex(0)
              setPlaying(v => !v)
            }}
          >
            {playing ? '暂停' : step.done ? '重新播放' : '▶ 自动步进传输'}
          </button>

          <div className="live-explanation" style={{ marginTop: '14px', background: '#f8fafc', borderLeft: '4px solid #2563eb', padding: '12px 14px', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 'bold' }}>{step.event}</span>
            <strong style={{ display: 'block', fontSize: '1.05rem', margin: '4px 0', color: '#1e293b' }}>{step.message}</strong>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              当前有效发送窗口 = min(rwnd {rwnd}, cwnd {step.cwnd}) = <strong>{Math.min(rwnd, step.cwnd)}</strong>。
            </p>
          </div>
        </aside>

        {/* 右侧展示面板 */}
        <section className="visual-panel window-visual">
          <div className="visual-toolbar">
            <div>
              <strong style={{ fontSize: '1.1rem' }}>报文序列流动与窗口覆盖图</strong>
              <span style={{ fontSize: '0.85rem' }}>绿色：已确认 · 蓝色：在途中 · 红色：丢失 · 蓝框：当前授权发送窗口</span>
            </div>
            <span className="source-chip" style={{ fontSize: '0.9rem' }}>ACK {step.base}</span>
          </div>

          {/* 报文槽位长条 (字大、颜色鲜明) */}
          <PacketTrack step={step} rwnd={rwnd} />

          <div className="window-flow" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center' }}>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>发送方当前状态</span>
              <strong style={{ fontSize: '1.15rem', color: '#1e293b', marginTop: '4px' }}>窗口左边界 Base = {step.base}</strong>
            </div>

            <b style={{ color: '#2563eb', fontSize: '1.2rem', textAlign: 'center' }}>
              {step.event.includes('ACK') ? '⬅ 收到累计 ACK' : '数据流水线 ➔'}
            </b>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>接收端通告能力</span>
              <strong style={{ fontSize: '1.15rem', color: '#10b981', marginTop: '4px' }}>rwnd = {rwnd}</strong>
            </div>
          </div>

          <div className="window-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '16px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>拥塞窗口 cwnd</span>
              <strong style={{ fontSize: '1.3rem', color: '#2563eb', marginTop: '4px' }}>{step.cwnd}</strong>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>慢启动阈值 ssthresh</span>
              <strong style={{ fontSize: '1.3rem', color: '#f59e0b', marginTop: '4px' }}>{step.ssthresh}</strong>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>有效发送窗口</span>
              <strong style={{ fontSize: '1.3rem', color: '#10b981', marginTop: '4px' }}>{Math.min(rwnd, step.cwnd)}</strong>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>累计已确认进度</span>
              <strong style={{ fontSize: '1.3rem', color: '#1e293b', marginTop: '4px' }}>{step.acked.length} / {TOTAL}</strong>
            </div>
          </div>

          {/* 拥塞窗口曲线图 */}
          <CwndChart steps={steps} index={index} />
        </section>
      </div>

      <LearningCycle
        experimentId="sliding-window"
        prediction={{
          question: 'TCP 的有效发送窗口大小通常由什么决定？',
          options: ['只由接收方通告的 rwnd 决定', '只由网络拥塞窗口 cwnd 决定', '取接收窗口 rwnd 与拥塞窗口 cwnd 的较小值 min(rwnd, cwnd)'],
          answer: '取接收窗口 rwnd 与拥塞窗口 cwnd 的较小值 min(rwnd, cwnd)',
          explanation: '流量控制保护接收端缓存不溢出，拥塞控制保护整个网络不崩溃，发送方必须同时满足两者的限制。'
        }}
        operation={{
          title: '观察丢包对 cwnd 的惩罚回退',
          instruction: '先选择“无丢包”观察 cwnd 如何从慢启动平滑切换到拥塞避免；再设置“Packet 7 丢失”，观察超时后 cwnd 如何直接断崖回退至 1。'
        }}
        observation={`当前阶段为 ${step.phase}，cwnd=${step.cwnd}，ssthresh=${step.ssthresh}，有效发送窗口为 ${Math.min(rwnd, step.cwnd)}。`}
        summaryPrompt="为什么发生丢包后，TCP 要将 ssthresh 减半并把 cwnd 重置为 1？"
      />
    </>
  )
}
