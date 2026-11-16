import React, { useEffect, useMemo, useState, useRef } from 'react'
import { ExperimentHeader } from './AttentionExperiment'
import LearningCycle from './LearningCycle'

const DOMAINS = {
  example: 'www.example.com',
  school: 'lab.university.edu',
  shop: 'api.shop.cn'
}

const STORY_STEPS = [
  {
    step: 1,
    kicker: '01 · 寻址之桥',
    title: 'DNS 将人类可读域名转换为机器 IP 地址',
    summary: '网络传输层与网络层只认二进制 IP 地址，而人类习惯使用具有语义的字符域名。DNS（域名系统）是整个互联网分布式运行的核心基础设施，负责提供高并发的名称到地址解析。',
    why: '如果没有 DNS，人类访问任何网站都必须输入枯燥的数字 IP，且网站服务器更换 IP 时所有用户链接将失效。',
    visual: 'name_to_ip'
  },
  {
    step: 2,
    kicker: '02 · 极速捷径',
    title: '多级缓存机制：在触及外网前回答',
    summary: '当你在浏览器输入网址时，查询请求依次检查：①浏览器自身内存缓存 ➔ ②操作系统 DNS 缓存（及 hosts 文件） ➔ ③路由器 DNS 缓存。只要命中未过期的记录，即可毫秒级直接返回。',
    why: '全球每天数百亿次域名查询中，超过 80% 都被各级边缘缓存拦截消化，保护了上游根与顶级服务器。',
    visual: 'cache_hit'
  },
  {
    step: 3,
    kicker: '03 · 委托代理',
    title: '递归查询：将全权任务交付本地域名服务器',
    summary: '当本地缓存未命中时，客户端向配置的本地域名服务器（Local DNS / 递归解析器，如 8.8.8.8 或 114.114.114.114）发起递归查询（Recursive Query）。递归解析器承诺“包办到底”，直至找到最终答案。',
    why: '终端设备计算与网络资源有限，由高性能递归解析器代为执行全球多轮迭代查找是最优工程设计。',
    visual: 'recursive_req'
  },
  {
    step: 4,
    kicker: '04 · 寻根问祖',
    title: '迭代查询之根服务器：指向顶级域名服务器',
    summary: '递归解析器首先向全球 13 组根域名服务器（Root Server）发起迭代查询。根服务器并不保存具体网站的 IP，但它掌握所有顶级域（TLD），回复：“去问管理 .com 的 TLD 服务器”。',
    why: '根域名服务器是 DNS 分层树状命名空间的逻辑起点，掌握整个互联网域名的最高引路权。',
    visual: 'root_server'
  },
  {
    step: 5,
    kicker: '05 · 顺藤摸瓜',
    title: '迭代查询之顶级域 TLD：指向权威域名服务器',
    summary: '递归解析器接着询问 .com 顶级域服务器。TLD 服务器根据委派记录（NS 记录），回复：“去问负责 example.com 的权威域名服务器（Authoritative DNS）”。',
    why: '顶级域名由专门注册局（如 Verisign 管理 .com）统一维护，分流不同行政或商业后缀的查询。',
    visual: 'tld_server'
  },
  {
    step: 6,
    kicker: '06 · 最终真理',
    title: '权威服务器：返回最终权威 A 记录',
    summary: '递归解析器最终访问该域名的权威 DNS 服务器。权威服务器掌握真正的原始数据库，准确返回目标域名的 A 记录（IPv4 地址，如 203.0.113.10），完成闭环。',
    why: '权威服务器是唯一具有该域名修改与解释权力的服务器，所有其他服务器的记录都只是它的镜像与缓存。',
    visual: 'auth_server'
  },
  {
    step: 7,
    kicker: '07 · 记忆与更新',
    title: 'TTL 生存时间与解析器缓存',
    summary: '递归解析器在将 IP 返回给客户端的同时，将该记录保存在自身缓存中，并严格遵守权威服务器下发的 TTL（Time To Live，如 300 秒）。TTL 倒计时结束前，后续查询均秒级响应。',
    why: 'TTL 实现了“查询加速”与“配置变更灵活性”之间的工程权衡。TTL 越短更新越快，但上游压力越大。',
    visual: 'ttl_cache'
  }
]

// 动画导学右侧高动态可视化组件 (大字号、分层节点信令穿梭、高质感)
function DnsStoryVisual({ stageIndex }) {
  const [activeNode, setActiveNode] = useState(0)

  useEffect(() => {
    setActiveNode(stageIndex)
  }, [stageIndex])

  const nodes = [
    { title: '终端浏览器', desc: '发起解析请求', role: 'client' },
    { title: '本地递归解析器', desc: '包办代理查询', role: 'resolver' },
    { title: '根域名服务器 (.)', desc: '指引 TLD 后缀', role: 'root' },
    { title: '.com 顶级域 (TLD)', desc: '指引权威服务器', role: 'tld' },
    { title: '权威服务器 (example.com)', desc: '保存正式 A 记录', role: 'auth' }
  ]

  return (
    <div className="dns-story-visual-canvas" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {/* 顶部树状层次链路 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 10px 24px', position: 'relative' }}>
        {nodes.map((n, i) => {
          const isCurrent = activeNode === i || (stageIndex >= 2 && i === Math.min(stageIndex - 1, 4))
          return (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: isCurrent ? '#2563eb' : '#1e293b',
                    border: `2.5px solid ${isCurrent ? '#60a5fa' : '#475569'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    boxShadow: isCurrent ? '0 0 16px rgba(37,99,235,0.6)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {i + 1}
                </div>
                <span style={{ fontSize: '0.78rem', color: isCurrent ? '#93c5fd' : '#94a3b8', marginTop: '6px', fontWeight: isCurrent ? 'bold' : 'normal', textAlign: 'center', maxWidth: '80px' }}>
                  {n.title.split(' ')[0]}
                </span>
              </div>
              {i < nodes.length - 1 && (
                <div style={{ flex: 1, height: '2px', background: isCurrent ? '#2563eb' : '#334155', margin: '0 4px', transition: 'all 0.3s' }} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* 阶段 1: 域名到 IP 映射 */}
      {stageIndex === 0 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ color: '#38bdf8', fontSize: '1rem', fontWeight: 'bold' }}>应用层域名 ➔ 传输层/网络层 IP 映射</span>
            <span style={{ background: '#1e293b', color: '#cbd5e1', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              端口 53 (UDP / TCP)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '16px', background: '#1e293b', borderRadius: '8px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>用户输入域名</div>
              <div style={{ color: '#60a5fa', fontSize: '1.25rem', fontWeight: 'bold', marginTop: '4px' }}>www.example.com</div>
            </div>

            <div style={{ fontSize: '1.5rem', color: '#38bdf8', fontWeight: 'bold' }}>➔ DNS 解析 ➔</div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>物理网络目标 IP</div>
              <div style={{ color: '#10b981', fontSize: '1.25rem', fontWeight: 'bold', marginTop: '4px' }}>203.0.113.10</div>
            </div>
          </div>
        </div>
      )}

      {/* 阶段 2: 本地缓存快速命中 */}
      {stageIndex === 1 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#10b981', fontSize: '1rem', fontWeight: 'bold' }}>多级本地缓存首道防线 (毫秒级响应)</span>
            <span style={{ background: '#10b981', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Cache Hit (命中)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', margin: '14px 0' }}>
            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '6px', textAlign: 'center', borderTop: '3px solid #3b82f6' }}>
              <div style={{ color: '#93c5fd', fontSize: '0.88rem', fontWeight: 'bold' }}>1. 浏览器缓存</div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '4px' }}>检查 Chrome/Safari 自带内存记录</div>
            </div>

            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '6px', textAlign: 'center', borderTop: '3px solid #10b981' }}>
              <div style={{ color: '#86efac', fontSize: '0.88rem', fontWeight: 'bold' }}>2. 操作系统缓存</div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '4px' }}>OS DNS Client 服务与 hosts 文件</div>
            </div>

            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '6px', textAlign: 'center', borderTop: '3px solid #f59e0b' }}>
              <div style={{ color: '#fde68a', fontSize: '0.88rem', fontWeight: 'bold' }}>3. 路由器缓存</div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '4px' }}>家庭宽带网关内置 DNS 缓存池</div>
            </div>
          </div>
        </div>
      )}

      {/* 阶段 3: 递归查询 */}
      {stageIndex === 2 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#38bdf8', fontSize: '1rem', fontWeight: 'bold' }}>客户端向本地解析器发起递归查询 (Recursive)</span>
            <span style={{ background: '#2563eb', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              一次请求 · 终极答复
            </span>
          </div>

          <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #2563eb' }}>
            <div style={{ fontSize: '0.95rem', color: '#f8fafc', fontWeight: 'bold' }}>客户端承诺：“我只问你一次，请帮我找到最终 IP”</div>
            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '6px', lineHeight: '1.5' }}>
              递归解析器（如运营商 DNS 或 8.8.8.8）接单，随后代表客户端向全球根、顶级域发起多次“迭代查询”。
            </div>
          </div>
        </div>
      )}

      {/* 阶段 4: 根服务器查询 */}
      {stageIndex === 3 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#f59e0b', fontSize: '1rem', fontWeight: 'bold' }}>迭代查询第 1 站：全球 13 组根服务器 (.)</span>
            <span style={{ background: '#f59e0b', color: '#1e293b', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Root Hints
            </span>
          </div>

          <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ color: '#fde68a', fontWeight: 'bold', fontSize: '0.92rem' }}>根服务器应答：</div>
            <div style={{ color: '#fff', fontSize: '0.9rem', marginTop: '4px', lineHeight: '1.6' }}>
              “我不知道 www.example.com 的 IP，但根据后缀 <strong>.com</strong>，我为你推荐 <strong>.com TLD 顶级域名服务器</strong>的 IP 地址列表。”
            </div>
          </div>
        </div>
      )}

      {/* 阶段 5: TLD 顶级域名服务器 */}
      {stageIndex === 4 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#a855f7', fontSize: '1rem', fontWeight: 'bold' }}>迭代查询第 2 站：.com 顶级域名服务器 (TLD)</span>
            <span style={{ background: '#a855f7', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              TLD Registry
            </span>
          </div>

          <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #a855f7' }}>
            <div style={{ color: '#e9d5ff', fontWeight: 'bold', fontSize: '0.92rem' }}>.com TLD 服务器应答：</div>
            <div style={{ color: '#fff', fontSize: '0.9rem', marginTop: '4px', lineHeight: '1.6' }}>
              “我查到了 example.com 的注册委派信息（NS 记录），负责它的是 <strong>ns1.example.com 权威域名服务器</strong>，地址是 198.51.100.2。”
            </div>
          </div>
        </div>
      )}

      {/* 阶段 6: 权威域名服务器 */}
      {stageIndex === 5 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#10b981', fontSize: '1rem', fontWeight: 'bold' }}>迭代查询终点站：权威域名服务器 (Authoritative)</span>
            <span style={{ background: '#10b981', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              最终官方答案
            </span>
          </div>

          <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
            <div style={{ color: '#86efac', fontWeight: 'bold', fontSize: '0.92rem' }}>权威服务器返回正式 A 记录：</div>
            <div style={{ fontFamily: 'monospace', color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', margin: '6px 0' }}>
              www.example.com. &nbsp;300 &nbsp;IN &nbsp;A &nbsp;203.0.113.10
            </div>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>解析完成！目标主机的真实物理 IP 成功获得。</div>
          </div>
        </div>
      )}

      {/* 阶段 7: TTL 缓存写入 */}
      {stageIndex === 6 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#38bdf8', fontSize: '1rem', fontWeight: 'bold' }}>结果回传与写入缓存 (TTL 倒计时)</span>
            <span style={{ background: '#2563eb', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              TTL = 300 秒
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '6px' }}>
              <div style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '0.88rem' }}>递归解析器动作</div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '4px' }}>
                将 203.0.113.10 返回给客户端浏览器，并存入自己内存缓存中 300 秒。
              </div>
            </div>

            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '6px' }}>
              <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.88rem' }}>后续用户访问</div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '4px' }}>
                在 300 秒以内再次访问该域名，直接由解析器缓存秒回，无需再跑一趟根和 TLD！
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DnsStory() {
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
    <section className="transformer-story dns-story" style={{ marginBottom: '24px' }}>
      <header className="story-intro">
        <div>
          <span className="story-kicker">动画导学 · 约 3 分钟</span>
          <h2>没有一台服务器知道所有域名，但层级合作能找到答案</h2>
          <p>DNS 像全球分布式树状黄页：缓存优先秒回，未命中则由根、顶级域、权威服务器协同逐级定位。</p>
        </div>
        <div className="memory-story-badge" style={{ padding: '16px 20px', minWidth: '130px' }}>
          <strong>www.example.com</strong>
          <span>→ 203.0.113.10</span>
          <small>A 记录 · TTL 300s</small>
        </div>
      </header>

      <nav className="story-timeline" style={{ '--story-steps': STORY_STEPS.length }}>
        {STORY_STEPS.map((x, idx) => (
          <button
            key={idx}
            className={`${step === idx ? 'active' : ''} ${idx < step ? 'passed' : ''}`}
            onClick={() => { setStep(idx); setIsPlaying(false) }}
          >
            <i>{idx < step ? '✓' : idx + 1}</i>
            <span>{x.title.split('：')[0].split('(')[0].trim()}</span>
          </button>
        ))}
      </nav>

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

        <div className="story-visual" style={{ background: '#0a101d', borderRadius: '12px', padding: '18px', border: '1px solid #1e293b', display: 'flex', alignItems: 'center' }}>
          <DnsStoryVisual stageIndex={step} />
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

function buildDns(domain, cached) {
  if (cached) {
    return [
      {
        kind: '本地查询',
        title: '浏览器询问本地缓存',
        message: `查询 ${domain} 对应的 A 记录。`,
        from: '浏览器',
        to: '本地缓存',
        query: 'A 记录查询'
      },
      {
        kind: '缓存命中',
        title: '本地缓存直接返回 A 记录',
        message: 'TTL 尚未过期，秒级极速命中，无需发起外部远程查询。',
        from: '本地缓存',
        to: '浏览器',
        query: '203.0.113.x'
      }
    ]
  }

  const suffix = domain.split('.').at(-1)
  return [
    {
      kind: '递归请求',
      title: '客户端把任务全权交给递归解析器',
      message: '客户端发起递归查询，只等待最终解析答案。',
      from: '浏览器',
      to: '递归解析器',
      query: `${domain} A?`
    },
    {
      kind: '迭代查询 1',
      title: '解析器向根服务器发起迭代查询',
      message: `根服务器指出管理 .${suffix} 的顶级域名服务器 (TLD) 地址。`,
      from: '递归解析器',
      to: '根服务器',
      query: `${domain} A?`
    },
    {
      kind: '迭代查询 2',
      title: `解析器向 .${suffix} TLD 服务器发起查询`,
      message: 'TLD 服务器返回管理该域名的权威域名服务器地址。',
      from: '递归解析器',
      to: `.${suffix} TLD`,
      query: '权威服务器 NS?'
    },
    {
      kind: '权威回答',
      title: '权威服务器返回最终 A 记录',
      message: '这是域名的正式官方 IP 映射答案。',
      from: '递归解析器',
      to: '权威服务器',
      query: 'A = 203.0.113.x'
    },
    {
      kind: '缓存结果',
      title: '递归解析器写入本地缓存',
      message: '在 TTL 有效期内，后续同域名请求可直接由缓存秒级响应。',
      from: '权威服务器',
      to: '递归解析器',
      query: 'TTL = 300'
    },
    {
      kind: '返回答案',
      title: '解析器将 IP 返回给浏览器',
      message: '浏览器获取到最终 IP，正式开始建立 TCP 三次握手连接！',
      from: '递归解析器',
      to: '浏览器',
      query: '203.0.113.x'
    }
  ]
}

function DnsGraph({ steps, index, cached }) {
  const nodes = cached ? ['浏览器', '本地缓存'] : ['浏览器', '递归解析器', '根服务器', '.TLD', '权威服务器']
  const visited = new Set(steps.slice(0, index + 1).flatMap(s => [normalize(s.from), normalize(s.to)]))
  const current = normalize(steps[index].to)

  return (
    <div className={`dns-graph ${cached ? 'cached' : ''}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', margin: '20px 0' }}>
      {nodes.map((n, i) => (
        <React.Fragment key={n}>
          <div
            className={`${visited.has(n) ? 'visited' : ''} ${current === n ? 'current' : ''}`}
            style={{
              minWidth: '120px',
              padding: '16px 12px',
              border: `2px solid ${current === n ? '#2563eb' : visited.has(n) ? '#10b981' : '#cbd5e1'}`,
              borderRadius: '10px',
              textAlign: 'center',
              background: current === n ? '#eff6ff' : visited.has(n) ? '#f0fdf4' : '#f8fafc',
              transition: 'all 0.3s'
            }}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: current === n ? '#2563eb' : visited.has(n) ? '#10b981' : '#94a3b8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontWeight: 'bold', fontSize: '0.85rem' }}>
              {i + 1}
            </div>
            <strong style={{ fontSize: '1rem', color: '#1e293b', display: 'block' }}>{n}</strong>
            <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', display: 'block' }}>{dnsNodeText(n)}</span>
          </div>
          {i < nodes.length - 1 && <b style={{ color: '#2563eb', fontSize: '1.4rem' }}>→</b>}
        </React.Fragment>
      ))}
    </div>
  )
}

function normalize(n) {
  if (n.startsWith('.')) return '.TLD'
  return n
}

function dnsNodeText(n) {
  return {
    '浏览器': '发起应用查询',
    '本地缓存': '极速命中返回',
    '递归解析器': '包办代理查找',
    '根服务器': '指向顶级域',
    '.TLD': '指向权威服务器',
    '权威服务器': '保存官方记录'
  }[n]
}

export default function DnsResolutionExperiment({ experiment }) {
  const [domainKey, setDomainKey] = useState('example')
  const [cached, setCached] = useState(false)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)

  const domain = DOMAINS[domainKey]
  const steps = useMemo(() => buildDns(domain, cached), [domain, cached])
  const step = steps[index]

  useEffect(() => {
    setIndex(0)
    setPlaying(false)
  }, [domain, cached])

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
      <ExperimentHeader experiment={experiment} eyebrow="计算机网络实验 04 · 应用层" />

      {/* 动画导学区 */}
      <DnsStory />

      {/* 自由探索交互实验室 */}
      <div className="explore-heading">
        <span>自由探索 · 跟随一次全球域名分层解析</span>
        <h2>DNS 域名解析与分布式层次查询实验室</h2>
        <p>选择不同域名与缓存状态，完整追踪浏览器、本地递归解析器、全球根、顶级域 TLD 与权威服务器的信令流转。</p>
      </div>

      <div className="lab-layout dns-layout" style={{ gridTemplateColumns: '320px 1fr' }}>
        <aside className="control-panel">
          <div className="panel-title">
            <span>DNS 查询配置</span>
            <i>{cached ? '本地缓存路径' : '全球分层解析'}</i>
          </div>

          <label className="field-block">
            <span>目标域名</span>
            <select
              value={domainKey}
              onChange={e => setDomainKey(e.target.value)}
              style={{ padding: '8px', fontSize: '0.95rem', borderRadius: '6px', fontWeight: 'bold' }}
            >
              {Object.entries(DOMAINS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>

          <label className="cnn-toggle" style={{ marginTop: '12px' }}>
            <input type="checkbox" checked={cached} onChange={e => setCached(e.target.checked)} />
            <span>
              <strong>模拟本地 DNS 缓存命中</strong>
              <small>命中后直接返回，无需发起外部递归/迭代查询</small>
            </span>
          </label>

          <div className="step-counter" style={{ marginTop: '14px' }}>
            <span>当前查询步骤</span>
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
            {playing ? '暂停' : index === steps.length - 1 ? '重新播放' : '▶ 自动步进解析'}
          </button>

          <div className="live-explanation" style={{ marginTop: '14px', background: '#f8fafc', borderLeft: '4px solid #2563eb', padding: '12px 14px', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 'bold' }}>{step.kind}</span>
            <strong style={{ display: 'block', fontSize: '1.05rem', margin: '4px 0', color: '#1e293b' }}>{step.title}</strong>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>{step.message}</p>
          </div>
        </aside>

        <section className="visual-panel dns-visual">
          <div className="visual-toolbar">
            <div>
              <strong style={{ fontSize: '1.1rem' }}>全球分布式 DNS 分层解析拓扑图</strong>
              <span style={{ fontSize: '0.85rem' }}>绿色：已完成 · 蓝色：当前正在访问节点 · 灰色：未访问</span>
            </div>
            <span className="source-chip" style={{ fontSize: '0.9rem' }}>{domain}</span>
          </div>

          <DnsGraph steps={steps} index={index} cached={cached} />

          <div className="dns-record" style={{ margin: '20px 0', padding: '16px 20px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>最终权威 A 记录解析结果</span>
              <strong style={{ fontSize: '1.25rem', color: '#1e293b', display: 'block', marginTop: '2px' }}>
                {domain} ➔ 203.0.113.{domainKey === 'example' ? 10 : domainKey === 'school' ? 25 : 80}
              </strong>
            </div>
            <span style={{ background: '#2563eb', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              TTL = 300 秒 (有效生存期)
            </span>
          </div>

          <div className="dns-log" style={{ background: '#0f172a', borderRadius: '8px', padding: '14px 18px', color: '#f8fafc', fontFamily: 'monospace' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #334155', paddingBottom: '6px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>DNS 信令交互流水账</span>
              <span style={{ color: '#64748b', fontSize: '0.78rem' }}>协议日志</span>
            </div>
            <div style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {steps.slice(0, index + 1).map((s, i) => (
                <div key={i} style={{ fontSize: '0.85rem', color: i === index ? '#60a5fa' : '#cbd5e1', lineHeight: '1.5' }}>
                  <span style={{ color: '#64748b', marginRight: '8px' }}>[{String(i + 1).padStart(2, '0')}]</span>
                  <strong style={{ marginRight: '8px' }}>{s.from} ➔ {s.to}</strong>
                  <span style={{ color: '#94a3b8' }}>({s.query})</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <LearningCycle
        experimentId="dns-resolution"
        prediction={{
          question: '全球根域名服务器（Root DNS Server）通常会直接返回目标网站的最终物理 IP 吗？',
          options: ['通常不会，只返回对应的顶级域名 TLD 服务器地址', '一定会直接返回最终物理 IP', '取决于浏览器版本'],
          answer: '通常不会，只返回对应的顶级域名 TLD 服务器地址',
          explanation: '根域名服务器只维护顶级域的引路委派记录，不保存具体主机的 A 记录。'
        }}
        operation={{
          title: '比较缓存命中与完整递归解析',
          instruction: '先关闭缓存播放完整解析观察 6 步跨国查询，再勾选“模拟本地 DNS 缓存命中”，观察访问节点数量骤减至 2 步的极速效果。'
        }}
        observation={`当前使用${cached ? '本地缓存命中' : '完整全球分层解析'}路径，共 ${steps.length} 步；当前访问节点为 ${step.to}。`}
        summaryPrompt="什么是递归查询与迭代查询的区别？为什么客户端与递归解析器之间采用递归，而解析器与根/TLD 之间采用迭代？"
      />
    </>
  )
}
