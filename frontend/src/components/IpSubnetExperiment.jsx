import React, { useMemo, useState, useEffect, useRef } from 'react'
import { ExperimentHeader } from './AttentionExperiment'
import LearningCycle from './LearningCycle'

const STORY_STEPS = [
  {
    step: 1,
    kicker: '01 · 基础结构',
    title: 'IPv4 地址由 32 个连续二进制位组成',
    summary: '点分十进制（如 192.168.10.37）只是为了便于人类记忆的表示形式。在底层网卡与路由器中，IP 地址始终是 32 个无符号的 0 和 1 二进制序列（分为 4 个字节，每个字节 8 位）。',
    why: '理解 32 位二进制本质是掌握子网掩码、路由聚合和 CIDR 无类域间路由的关键。',
    visual: 'binary_split'
  },
  {
    step: 2,
    kicker: '02 · 划分边界',
    title: 'CIDR 斜杠切刀：网络位与主机位',
    summary: '无类别域间路由（CIDR）使用一条斜杠（如 /24）切开 32 位。斜杠前是网络前缀（Network ID），用于在全球或局域网中寻址该子网；斜杠后是主机号（Host ID），用于区分该子网内的具体设备。',
    why: '同一物理局域网中的所有设备必须共享完全相同的网络前缀才能实现直接二层互通。',
    visual: 'cidr_cut'
  },
  {
    step: 3,
    kicker: '03 · 提取利器',
    title: '子网掩码与按位与 (AND) 提取运算',
    summary: '子网掩码的网络位全为 1，主机位全为 0（如 /24 对应 255.255.255.0）。路由器将目标 IP 地址与子网掩码进行按位逻辑与（Bitwise AND）运算，瞬间将主机位全部抹零，得到该子网的网络地址！',
    why: '按位与运算可在硬件门电路中单时钟周期极速完成，这是路由器硬件线速查表的基础。',
    visual: 'bitwise_and'
  },
  {
    step: 4,
    kicker: '04 · 子网基准',
    title: '网络地址：主机位全 0 的子网代表',
    summary: '将 32 位地址中的主机位全部置为 0，得到该子网的“网络地址”（如 192.168.10.0）。网络地址代表整个网络本身，绝对不能分配给任何单个主机作为网卡 IP。',
    why: '路由表条目中的目标网段就是网络地址，用于指引数据包跨路由器转发。',
    visual: 'net_addr'
  },
  {
    step: 5,
    kicker: '05 · 全体广播',
    title: '广播地址：主机位全 1 的全员通知',
    summary: '将 32 位地址中的主机位全部翻转为 1，得到该子网的“受限广播地址”（如 192.168.10.255）。凡是发送给广播地址的数据报，网卡与交换机会复制并推送给子网内的所有主机。',
    why: 'ARP 寻址、DHCP 动态地址申请等关键网络协议均依赖广播地址实现初始握手。',
    visual: 'broadcast_addr'
  },
  {
    step: 6,
    kicker: '06 · 容量推导',
    title: '可用主机地址范围与 2^h - 2 容量法则',
    summary: '若主机位共有 h 位，则总共有 2^h 个二进制组合。传统 IPv4 子网必须扣除全 0 的网络地址和全 1 的广播地址，因此实际可分配给主机的有效地址数为 2^h - 2（/24 子网为 254 台）。',
    why: '地址范围从 网络地址+1（如 .1）一直到 广播地址-1（如 .254），通常将 .1 或 .254 分配给默认网关。',
    visual: 'host_capacity'
  }
]

function IpStoryVisual({ stageIndex }) {
  const [andStep, setAndStep] = useState(0)

  useEffect(() => {
    setAndStep(0)
    if (stageIndex === 2) { // 按位与扫描动效
      const t = setTimeout(() => setAndStep(1), 1200)
      return () => clearTimeout(t)
    }
  }, [stageIndex])

  // 192.168.10.37 的 32 位二进制
  const rawIpBits = '11000000101010000000101000100101'
  const maskBits = '11111111111111111111111100000000'
  const netBits = '11000000101010000000101000000000'
  const bcastBits = '11000000101010000000101011111111'

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {/* 阶段 1: 4 个字节段分解 */}
      {stageIndex === 0 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#38bdf8', fontSize: '1rem', fontWeight: 'bold' }}>点分十进制 ➔ 4 字节 32 位二进制展开</span>
            <span style={{ background: '#1e293b', color: '#f8fafc', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              IPv4 长度 = 4 Byte = 32 Bit
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', margin: '14px 0' }}>
            {[
              { dec: '192', bin: '11000000' },
              { dec: '168', bin: '10101000' },
              { dec: '10', bin: '00001010' },
              { dec: '37', bin: '00100101' }
            ].map((byte, i) => (
              <div key={i} style={{ background: '#1e293b', border: '1.5px solid #3b82f6', borderRadius: '8px', padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>第 {i + 1} 字节</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#60a5fa', margin: '4px 0' }}>{byte.dec}</div>
                <div style={{ fontSize: '0.92rem', fontFamily: 'monospace', color: '#f8fafc', background: '#090f1a', padding: '4px 2px', borderRadius: '4px', fontWeight: 'bold' }}>
                  {byte.bin}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8', marginTop: '10px' }}>
            每个点分段对应完整的 8 个二进制位（取值 0 ~ 255）。
          </div>
        </div>
      )}

      {/* 阶段 2: CIDR /24 切刀 */}
      {stageIndex === 1 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#f59e0b', fontSize: '1rem', fontWeight: 'bold' }}>CIDR /24 边界切分：网络位与主机位</span>
            <span style={{ background: '#f59e0b', color: '#1e293b', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              /24 前缀
            </span>
          </div>

          <div style={{ display: 'flex', height: '64px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #334155', position: 'relative' }}>
            {/* 前 24 位网络位 */}
            <div style={{ width: '75%', background: '#2563eb', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>网络前缀 (Network ID · 24 位)</span>
              <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>192.168.10.x</span>
            </div>

            {/* 激光切刀分界线 */}
            <div style={{ width: '4px', background: '#ef4444', height: '100%', position: 'relative', zIndex: 2 }}>
              <span style={{ position: 'absolute', top: '-22px', left: '-12px', background: '#ef4444', color: '#fff', fontSize: '0.72rem', padding: '1px 5px', borderRadius: '3px', fontWeight: 'bold' }}>
                /24
              </span>
            </div>

            {/* 后 8 位主机位 */}
            <div style={{ width: '25%', background: '#ee6c4d', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>主机号 (8 位)</span>
              <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>.37</span>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #2563eb' }}>
              <span style={{ color: '#93c5fd', fontSize: '0.85rem', fontWeight: 'bold' }}>网络位 (24 位)</span>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>决定子网属于哪个网段，全网路由依据。</div>
            </div>
            <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #ee6c4d' }}>
              <span style={{ color: '#fca5a5', fontSize: '0.85rem', fontWeight: 'bold' }}>主机位 (8 位)</span>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>决定该子网内具体的第几台终端主机。</div>
            </div>
          </div>
        </div>
      )}

      {/* 阶段 3: 按位与运算扫描 */}
      {stageIndex === 2 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ color: '#10b981', fontSize: '0.95rem', fontWeight: 'bold' }}>按位逻辑与 (AND) 提取网络地址</span>
            <span style={{ color: andStep > 0 ? '#34d399' : '#94a3b8', fontSize: '0.85rem', fontWeight: 'bold' }}>
              {andStep > 0 ? '运算完成：主机位已清零' : '扫描运算中...'}
            </span>
          </div>

          <div style={{ fontFamily: 'monospace', fontSize: '0.88rem', background: '#1e293b', borderRadius: '8px', padding: '12px 14px', lineHeight: '1.8' }}>
            <div style={{ color: '#93c5fd' }}>IP 地址: &nbsp;11000000.10101000.00001010.<span style={{ color: '#fca5a5' }}>00100101</span> (192.168.10.37)</div>
            <div style={{ color: '#cbd5e1' }}>子网掩码: 11111111.11111111.11111111.<span style={{ color: '#94a3b8' }}>00000000</span> (255.255.255.0)</div>
            <div style={{ borderBottom: '1px solid #475569', margin: '4px 0' }} />
            <div style={{ color: '#34d399', fontWeight: 'bold' }}>
              网络地址: 11000000.10101000.00001010.<span style={{ color: andStep > 0 ? '#fbbf24' : '#cbd5e1' }}>00000000</span> (192.168.10.0)
            </div>
          </div>

          <div style={{ marginTop: '10px', fontSize: '0.82rem', color: '#94a3b8', textAlign: 'center' }}>
            掩码中为 1 的位置原样保留 IP 网络位；掩码中为 0 的位置强制将 IP 主机位全清零。
          </div>
        </div>
      )}

      {/* 阶段 4: 网络地址全 0 */}
      {stageIndex === 3 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#3b82f6', fontSize: '1rem', fontWeight: 'bold' }}>子网基准标识：网络地址 (全 0)</span>
            <span style={{ background: '#2563eb', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              192.168.10.0
            </span>
          </div>

          <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ fontSize: '1.1rem', color: '#f8fafc', fontWeight: 'bold' }}>主机位状态：全为 0 (00000000)</div>
            <div style={{ fontSize: '0.88rem', color: '#cbd5e1', marginTop: '6px', lineHeight: '1.6' }}>
              它是整个子网地址池的<strong>绝对最小值</strong>。用于向路由器声明“本子网在此”，网络设备通过该地址将流量导向本子网路由器。
            </div>
          </div>

          <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '6px', color: '#fca5a5', fontSize: '0.85rem' }}>
            严禁分配原则：不可将 .0 分配给普通电脑或手机，否则主机无法区分自己是单一终端还是网段标识。
          </div>
        </div>
      )}

      {/* 阶段 5: 广播地址全 1 */}
      {stageIndex === 4 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#ef4444', fontSize: '1rem', fontWeight: 'bold' }}>子网全员通知：广播地址 (全 1)</span>
            <span style={{ background: '#ef4444', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              192.168.10.255
            </span>
          </div>

          <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
            <div style={{ fontSize: '1.1rem', color: '#f8fafc', fontWeight: 'bold' }}>主机位状态：全为 1 (11111111)</div>
            <div style={{ fontSize: '0.88rem', color: '#cbd5e1', marginTop: '6px', lineHeight: '1.6' }}>
              它是整个子网地址池的<strong>绝对最大值</strong>。目的 IP 为此地址的报文会被局域网二层交换机洪泛（Flooding），子网内全部主机网卡均须接收解析。
            </div>
          </div>

          <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: '6px', color: '#fde68a', fontSize: '0.85rem' }}>
            典型应用：ARP 地址解析协议、DHCP Discover 广播探测、局域网设备自发现。
          </div>
        </div>
      )}

      {/* 阶段 6: 可用主机容量推导 */}
      {stageIndex === 5 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#10b981', fontSize: '1rem', fontWeight: 'bold' }}>有效主机范围与容量计算公式</span>
            <span style={{ background: '#10b981', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              2^8 - 2 = 254 台
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '14px 0' }}>
            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>第一个可用主机 IP</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#38bdf8', marginTop: '4px' }}>192.168.10.1</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>网络地址 + 1 (通常作为网关)</div>
            </div>

            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>最后一个可用主机 IP</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#38bdf8', marginTop: '4px' }}>192.168.10.254</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>广播地址 - 1</div>
            </div>
          </div>

          <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #38bdf8', borderRadius: '6px', padding: '10px 14px', textAlign: 'center' }}>
            <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '0.9rem' }}>
              公式：可用主机数 = 2^(32 - 前缀) - 2 （必须剔除全 0 网络与全 1 广播）
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function IpStory() {
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
    <section className="transformer-story ip-story" style={{ marginBottom: '24px' }}>
      <header className="story-intro">
        <div>
          <span className="story-kicker">动画导学 · 约 3 分钟</span>
          <h2>一条斜杠，切开网络身份与主机身份</h2>
          <p>从 32 个二进制位出发，推导掩码、网络地址、广播地址和主机范围。</p>
        </div>
        <div className="memory-story-badge" style={{ padding: '16px 20px', minWidth: '130px' }}>
          <strong>192.168.10.37</strong>
          <span>/24 前缀</span>
          <small>网络 24 位 · 主机 8 位</small>
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
          <IpStoryVisual stageIndex={step} />
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

function BitGrid({ bits, prefix }) {
  return (
    <div className="ip-bits" style={{ display: 'grid', gridTemplateColumns: 'repeat(32, 1fr)', gap: '3px', margin: '20px 0' }}>
      {bits.split('').map((b, i) => (
        <div
          key={i}
          style={{
            height: '60px',
            borderRadius: '4px',
            background: i < prefix ? '#2563eb' : '#ee6c4d',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{b}</span>
          {i === prefix - 1 && (
            <b style={{ position: 'absolute', bottom: '-22px', fontSize: '0.72rem', color: '#ee6c4d', whiteSpace: 'nowrap', fontStyle: 'normal' }}>
              /{prefix} 边界
            </b>
          )}
        </div>
      ))}
    </div>
  )
}

function Result({ label, value, wide }) {
  return (
    <div className={wide ? 'wide' : ''} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{label}</span>
      <strong style={{ display: 'block', fontSize: '1.2rem', color: '#1e293b', marginTop: '4px' }}>{value}</strong>
    </div>
  )
}

function subnet(parts, prefix) {
  const value = parts.reduce((n, x) => ((n << 8) | x) >>> 0, 0)
  const mask = (0xffffffff << (32 - prefix)) >>> 0
  const network = (value & mask) >>> 0
  const broadcast = (network | (~mask >>> 0)) >>> 0
  const total = 2 ** (32 - prefix)
  return {
    bits: value.toString(2).padStart(32, '0'),
    mask: toIp(mask),
    network: toIp(network),
    broadcast: toIp(broadcast),
    first: toIp((network + 1) >>> 0),
    last: toIp((broadcast - 1) >>> 0),
    total,
    usable: Math.max(0, total - 2)
  }
}

function toIp(n) {
  return [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.')
}

export default function IpSubnetExperiment({ experiment }) {
  const [text, setText] = useState('192.168.10.37')
  const [ip, setIp] = useState([192, 168, 10, 37])
  const [prefix, setPrefix] = useState(24)

  const info = useMemo(() => subnet(ip, prefix), [ip, prefix])

  function apply() {
    const parts = text.trim().split('.').map(Number)
    if (parts.length === 4 && parts.every(x => Number.isInteger(x) && x >= 0 && x <= 255)) {
      setIp(parts)
    }
  }

  return (
    <>
      <ExperimentHeader experiment={experiment} eyebrow="计算机网络实验 03 · 网络层" />

      {/* 动画导学区 */}
      <IpStory />

      {/* 自由探索交互实验室 */}
      <div className="explore-heading">
        <span>自由探索 · 拖动网络位与主机位边界</span>
        <h2>IPv4 子网划分与 CIDR 掩码实验室</h2>
        <p>输入任意 IPv4 地址并调整 CIDR 前缀斜杠，实时观察 32 位二进制切分与子网地址空间分布。</p>
      </div>

      <div className="lab-layout ip-layout" style={{ gridTemplateColumns: '320px 1fr' }}>
        <aside className="control-panel">
          <div className="panel-title">
            <span>子网划分参数</span>
            <i>IPv4 / CIDR</i>
          </div>

          <label className="field-block">
            <span>IPv4 地址输入</span>
            <small style={{ fontSize: '0.8rem', color: '#64748b' }}>使用标准点分十进制，例如 192.168.10.37</small>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') apply() }}
              style={{ padding: '8px', fontSize: '0.95rem', borderRadius: '6px', fontWeight: 'bold' }}
            />
          </label>

          <button className="tree-play" onClick={apply}>
            应用 IP 地址
          </button>

          <label className="range-field" style={{ marginTop: '14px' }}>
            <span>
              <b style={{ fontSize: '0.95rem' }}>CIDR 掩码前缀</b>
              <i style={{ fontSize: '1.15rem', color: '#2563eb' }}>/{prefix}</i>
            </span>
            <small style={{ fontSize: '0.8rem', color: '#64748b' }}>
              前 {prefix} 位属于网络号，后 {32 - prefix} 位属于主机号
            </small>
            <input type="range" min="8" max="30" value={prefix} onChange={e => setPrefix(Number(e.target.value))} />
          </label>

          <div className="ip-presets" style={{ marginTop: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>典型常用前缀</span>
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              {[16, 20, 24, 26, 28].map(x => (
                <button
                  className={prefix === x ? 'active' : ''}
                  key={x}
                  onClick={() => setPrefix(x)}
                  style={{ flex: 1, padding: '6px 0', borderRadius: '4px', fontWeight: 'bold' }}
                >
                  /{x}
                </button>
              ))}
            </div>
          </div>

          <div className="live-explanation" style={{ marginTop: '14px', background: '#f8fafc', borderLeft: '4px solid #2563eb', padding: '12px 14px', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 'bold' }}>当前划分概要</span>
            <strong style={{ display: 'block', fontSize: '1.1rem', margin: '4px 0', color: '#1e293b' }}>
              {info.network} /{prefix}
            </strong>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              总地址容量 {info.total.toLocaleString()} 个，可用终端主机数为 <strong>{info.usable.toLocaleString()}</strong> 个。
            </p>
          </div>
        </aside>

        <section className="visual-panel ip-visual">
          <div className="visual-toolbar">
            <div>
              <strong style={{ fontSize: '1.1rem' }}>32 位地址二进制切刀图</strong>
              <span style={{ fontSize: '0.85rem' }}>蓝色：网络位 · 橙色：主机位 · 每 8 位为一个点分段</span>
            </div>
            <span className="source-chip" style={{ fontSize: '0.9rem' }}>/{prefix} 前缀</span>
          </div>

          <BitGrid bits={info.bits} prefix={prefix} />

          <div className="ip-decimal-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '30px 0 20px' }}>
            {ip.map((x, i) => (
              <React.Fragment key={i}>
                <div style={{ minWidth: '130px', padding: '14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>第 {i + 1} 字节</span>
                  <strong style={{ fontSize: '1.4rem', color: '#1e293b', display: 'block', margin: '2px 0' }}>{x}</strong>
                  <code style={{ fontSize: '0.88rem', color: '#2563eb', fontWeight: 'bold' }}>{x.toString(2).padStart(8, '0')}</code>
                </div>
                {i < 3 && <b style={{ fontSize: '1.6rem', color: '#94a3b8' }}>.</b>}
              </React.Fragment>
            ))}
          </div>

          <div className="ip-results" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <Result label="子网掩码 (Subnet Mask)" value={info.mask} />
            <Result label="网络地址 (Network Address)" value={info.network} />
            <Result label="广播地址 (Broadcast Address)" value={info.broadcast} />
            <Result label="可用终端主机 IP 范围" value={`${info.first} — ${info.last}`} wide />
          </div>

          <div className="ip-formula" style={{ marginTop: '14px', background: '#f8fafc', borderLeft: '4px solid #2563eb', padding: '12px 16px', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.88rem', color: '#2563eb', fontWeight: 'bold' }}>路由运算法则</span>
            <div style={{ fontFamily: 'monospace', fontSize: '0.92rem', color: '#334155', marginTop: '4px' }}>
              网络地址 = IP 地址 AND 子网掩码 &nbsp;|&nbsp; 广播地址 = 网络地址 OR 反掩码 (~Mask)
            </div>
          </div>
        </section>
      </div>

      <LearningCycle
        experimentId="ip-subnet"
        prediction={{
          question: '把前缀从 /24 增大到 /26 后，单个子网可用主机数量通常怎样变化？',
          options: ['增加', '减少', '完全不变'],
          answer: '减少',
          explanation: '网络位由 24 位增加到 26 位，主机位由 8 位减少到 6 位，可用主机数由 254 锐减至 62 台。'
        }}
        operation={{
          title: '比较 /24 与 /26 的子网容量',
          instruction: '保持 IP 地址不变，分别点击快速前缀 /24 与 /26，观察网络地址、广播地址和可用主机范围的变化。'
        }}
        observation={`当前 ${info.network}/${prefix} 的广播地址为 ${info.broadcast}，可用主机范围 ${info.first} 至 ${info.last}（共 ${info.usable} 台）。`}
        summaryPrompt="CIDR 前缀变大时，子网数量和每个子网的主机容量如何变化？为什么 /31 通常用于路由器点对点链路？"
      />
    </>
  )
}
