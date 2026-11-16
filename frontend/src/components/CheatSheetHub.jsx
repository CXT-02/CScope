import React, { useState, useMemo } from 'react'

const FORMULA_DATABASE = [
  // 计算机组成原理
  {
    id: 'f_arch_1',
    subject: 'arch',
    subjectName: '计算机组成原理',
    title: 'Cache 主存地址格式划分公式',
    category: '存储系统',
    formula: '主存地址位数 = Tag标记位 + 组索引位 (组相联) + 块内偏移位',
    keyPoints: [
      '块内偏移位数 = log2(主存块大小/B)',
      '组索引位数 = log2(Cache 组数) = log2(总块数 / 路数)',
      'Tag 标记位数 = 主存总地址位数 - 组索引位数 - 块内偏移位数',
      '直接映射是路数 = 1 的特例；全相联映射无组索引，只有 Tag 和块内偏移。'
    ],
    example: '64KB Cache，块大小 64B，4路组相联，32位主存地址：块内偏移6位，组数=1024/4=256(8位)，Tag=32-8-6=18位。',
    labId: 'cache-mapping',
    labName: 'Cache 组相联映射实验'
  },
  {
    id: 'f_arch_2',
    subject: 'arch',
    subjectName: '计算机组成原理',
    title: 'Cache 平均访问时间 (Average Memory Access Time)',
    category: '存储系统',
    formula: 'T_avg = H × T_c + (1 - H) × (T_c + T_m)  或  H × T_c + (1 - H) × T_m (视架构而定)',
    keyPoints: [
      'H：Cache 命中率 (Hit Rate)',
      'T_c：Cache 命中访问时间 (Hit Time)',
      '1 - H：缺失率 (Miss Rate)',
      'T_m：缺失损失或主存访问时间 (Miss Penalty)'
    ],
    example: '若命中率 95%，Cache 访问 2ns，主存访问 50ns，则平均时间 = 0.95×2 + 0.05×50 = 1.9 + 2.5 = 4.4ns。',
    labId: 'cache-mapping',
    labName: 'Cache 命中与颠簸实验'
  },
  {
    id: 'f_arch_3',
    subject: 'arch',
    subjectName: '计算机组成原理',
    title: '指令流水线加速比与吞吐率',
    category: 'CPU 微架构',
    formula: '加速比 S = (n × k) / (k + n - 1)  (当各流水段耗时相等且饱满时)',
    keyPoints: [
      'k：流水线段数（如 5 段流水线 k = 5）',
      'n：连续执行的指令总数',
      '当 n 趋近无穷大时，最大加速比极限等于流水线段数 k',
      '实际吞吐率 TP = n / [(k + n - 1) × Δt + 停顿周期数 × Δt]'
    ],
    example: '5 段流水线执行 100 条指令，理想总周期 = 5 + 99 = 104 个时钟周期；非流水线则需 500 个时钟周期。',
    labId: 'cpu-pipeline',
    labName: 'CPU 五级流水线实验'
  },

  // 操作系统
  {
    id: 'f_os_1',
    subject: 'os',
    subjectName: '操作系统',
    title: '虚存有效访存时间 EAT (引入快表 TLB)',
    category: '内存管理',
    formula: 'EAT = α × (t_tlb + t_m) + (1 - α) × (t_tlb + 2 × t_m)  (单级页表)',
    keyPoints: [
      'α：快表 TLB 命中率 (通常在 90% 以上)',
      't_tlb：快表查询时间；t_m：主存访问时间',
      'TLB 命中：查 TLB (t_tlb) + 访问物理主存 (t_m)',
      'TLB 未命中：查 TLB + 查主存页表 (t_m) + 访问目标内存 (t_m) = t_tlb + 2t_m'
    ],
    example: 'TLB 命中率 90%，TLB 耗时 10ns，内存 100ns：EAT = 0.9×(110) + 0.1×(210) = 99 + 21 = 120ns。',
    labId: 'page-replacement',
    labName: '虚拟页式存储与页面置换实验'
  },
  {
    id: 'f_os_2',
    subject: 'os',
    subjectName: '操作系统',
    title: '死锁避免临界资源数计算 (破除死锁)',
    category: '并发进程',
    formula: '系统不发生死锁的最小资源数 M >= ∑(Max_i - 1) + 1',
    keyPoints: [
      'Max_i：第 i 个并发进程对同类资源的最大需求量',
      '临界极端死锁状态：每个进程都拿到了 Max_i - 1 个资源，全部阻塞等待最后 1 个',
      '只要系统总资源数再加 1，就必有 1 个进程能拿齐资源执行并释放全部资源，打破循环等待。'
    ],
    example: '3 个进程分别需要 3、4、5 台打印机：临界极端需求 = (2 + 3 + 4) = 9 台；绝不死锁的最少资源数 = 9 + 1 = 10 台。',
    labId: 'deadlock',
    labName: '死锁避免与银行家算法实验'
  },

  // 计算机网络
  {
    id: 'f_net_1',
    subject: 'net',
    subjectName: '计算机网络',
    title: '时延带宽积与信道利用率 (Bandwidth-Delay Product)',
    category: '网络性能',
    formula: '时延带宽积 = 传播时延 (RTT / 2) × 信道带宽 (Bandwidth)',
    keyPoints: [
      '物理含义：以比特为单位的链路链路管道容量（管道中正在飞行的比特总数）',
      '停-等协议信道利用率 U = T_d / (T_d + RTT + T_a)',
      '流水线滑动窗口协议：当 发送窗口 W >= 1 + 2a (其中 a = 传播时延 / 发送时延) 时，信道利用率可达 100%。'
    ],
    example: '链路往返时延 RTT = 20ms，带宽 100Mbps：管道单向比特容量 = 10ms × 100Mbps = 1,000,000 bit (1Mb)。',
    labId: 'sliding-window',
    labName: '滑动窗口与时延吞吐实验'
  },
  {
    id: 'f_net_2',
    subject: 'net',
    subjectName: '计算机网络',
    title: 'CSMA/CD 争用期与最短帧长公式',
    category: '数据链路层',
    formula: '最短有效帧长 = 2 × 传播时延 (争用期 2τ) × 数据传输速率',
    keyPoints: [
      '2τ 称为争用期（冲突窗口）：在此时间内未检测到碰撞，方可确定此次发送绝不会再碰撞',
      '凡长度小于最短帧长的帧，均为因碰撞而异常终止的残片无效帧（Runt 帧）',
      '经典以太网：2τ = 51.2μs，速率 10Mbps，最短帧长 = 51.2μs × 10Mbps = 512 bit = 64 字节。'
    ],
    example: '100Mbps 快速以太网若保持 64 字节最短帧长不变，则最大网络电缆跨距必须缩小至原本的 1/10。',
    labId: 'tcp-connection',
    labName: '网络全双工交互仿真'
  },

  // 数据结构
  {
    id: 'f_ds_1',
    subject: 'ds',
    subjectName: '数据结构与算法',
    title: '平衡二叉树 (AVL) 高度为 h 时的最少结点数',
    category: '树与二叉树',
    formula: 'N_h = N_{h-1} + N_{h-2} + 1  (斐波那契递推式)',
    keyPoints: [
      'N_0 = 0 (空树高度为 0)',
      'N_1 = 1 (只有根结点)',
      'N_2 = 2, N_3 = 4, N_4 = 7, N_5 = 12, N_6 = 20, N_7 = 33...',
      '逆向应用：给定 n 个结点，能构成的 AVL 树的最大高度 h_max。'
    ],
    example: '给定 12 个结点，能够构成的 AVL 树的最大高度为 5（因为 N_5 = 12，N_6 = 20 > 12）。',
    labId: 'tree-traversal',
    labName: '二叉树遍历与平衡旋转实验'
  }
]

export default function CheatSheetHub({ onOpenExperiment }) {
  const [activeSubject, setActiveSubject] = useState('all')
  const [search, setSearch] = useState('')

  // 简易交互式 Cache 地址计算小工具
  const [calcCacheSize, setCalcCacheSize] = useState(64) // KB
  const [calcBlockSize, setCalcBlockSize] = useState(64) // B
  const [calcWays, setCalcWays] = useState(4) // 4路
  const [calcAddrBits, setCalcAddrBits] = useState(32) // 位

  const cacheCalcResult = useMemo(() => {
    const totalBytes = calcCacheSize * 1024
    const totalBlocks = totalBytes / calcBlockSize
    const sets = totalBlocks / calcWays
    const offsetBits = Math.round(Math.log2(calcBlockSize))
    const indexBits = Math.round(Math.log2(sets))
    const tagBits = calcAddrBits - indexBits - offsetBits
    return { totalBlocks, sets, offsetBits, indexBits, tagBits }
  }, [calcCacheSize, calcBlockSize, calcWays, calcAddrBits])

  const filteredFormulas = useMemo(() => {
    return FORMULA_DATABASE.filter(f => {
      if (activeSubject !== 'all' && f.subject !== activeSubject) return false
      if (search.trim()) {
        const query = search.toLowerCase()
        return f.title.toLowerCase().includes(query) || f.formula.toLowerCase().includes(query) || f.category.toLowerCase().includes(query)
      }
      return true
    })
  }, [activeSubject, search])

  return (
    <div className="cheatsheet-hub-page">
      {/* 顶部标题 */}
      <header className="cheatsheet-header">
        <div>
          <div className="sheet-tag-badge">408 CORE FORMULA & QUICK CHEAT SHEET</div>
          <h1>408 必考速查宝典 · 核心公式与考点推导</h1>
          <p className="sheet-desc">
            汇集计组微架构、操作系统并发、网络时序与数据结构递推等高频核心数学模型，配合计算器实时验证。
          </p>
        </div>

        <div className="sheet-search-wrap">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索公式名称、考点、关键字..."
          />
        </div>
      </header>

      {/* 嵌入式交互测算器：Cache 主存地址位数即时推演 */}
      <section className="interactive-calculator-card">
        <div className="calc-header">
          <div className="calc-title">
            <span className="calc-icon">⚡</span>
            <strong>408 真题高频测算器：Cache 组相联主存地址划分</strong>
          </div>
          <span className="calc-hint">参数修改后下方地址结构即时重绘</span>
        </div>

        <div className="calc-controls-row">
          <div className="calc-input-item">
            <label>Cache 容量 (KB)</label>
            <input
              type="number"
              value={calcCacheSize}
              onChange={(e) => setCalcCacheSize(Math.max(1, Number(e.target.value)))}
            />
          </div>
          <div className="calc-input-item">
            <label>主存块大小 (B)</label>
            <input
              type="number"
              value={calcBlockSize}
              onChange={(e) => setCalcBlockSize(Math.max(1, Number(e.target.value)))}
            />
          </div>
          <div className="calc-input-item">
            <label>组相联路数 (Way)</label>
            <select
              value={calcWays}
              onChange={(e) => setCalcWays(Number(e.target.value))}
            >
              <option value="1">1 路 (直接映射)</option>
              <option value="2">2 路组相联</option>
              <option value="4">4 路组相联</option>
              <option value="8">8 路组相联</option>
              <option value="16">16 路组相联</option>
            </select>
          </div>
          <div className="calc-input-item">
            <label>主存总地址位数 (Bit)</label>
            <input
              type="number"
              value={calcAddrBits}
              onChange={(e) => setCalcAddrBits(Math.max(16, Number(e.target.value)))}
            />
          </div>
        </div>

        {/* 测算结果条带 */}
        <div className="calc-result-strip">
          <div className="addr-split-bar">
            <div className="bit-block tag-block" style={{ flex: Math.max(1, cacheCalcResult.tagBits) }}>
              <span className="block-title">Tag 主存标记</span>
              <strong>{cacheCalcResult.tagBits} 位</strong>
            </div>
            <div className="bit-block index-block" style={{ flex: Math.max(1, cacheCalcResult.indexBits) }}>
              <span className="block-title">Set 组索引</span>
              <strong>{cacheCalcResult.indexBits} 位</strong>
              <small>({cacheCalcResult.sets} 组)</small>
            </div>
            <div className="bit-block offset-block" style={{ flex: Math.max(1, cacheCalcResult.offsetBits) }}>
              <span className="block-title">Offset 块内偏移</span>
              <strong>{cacheCalcResult.offsetBits} 位</strong>
              <small>({calcBlockSize} 字节)</small>
            </div>
          </div>
          <div className="calc-summary-text">
            <span>Cache 块总数：{cacheCalcResult.totalBlocks} 块</span>
            <span>•</span>
            <span>组数：{cacheCalcResult.sets} 组</span>
            <span>•</span>
            <span>主存总地址：{calcAddrBits} 位</span>
            <button
              type="button"
              className="calc-jump-btn"
              onClick={() => onOpenExperiment('cache-mapping')}
            >
              在仿真沙盘中观察该参数运行 →
            </button>
          </div>
        </div>
      </section>

      {/* 学科分类 Tab */}
      <div className="sheet-subject-tabs">
        {[
          { key: 'all', label: '全部公式速查' },
          { key: 'arch', label: '计算机组成原理' },
          { key: 'os', label: '操作系统' },
          { key: 'net', label: '计算机网络' },
          { key: 'ds', label: '数据结构与算法' }
        ].map(sub => (
          <button
            key={sub.key}
            type="button"
            className={`sheet-tab-btn ${activeSubject === sub.key ? 'active' : ''}`}
            onClick={() => setActiveSubject(sub.key)}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {/* 公式卡片网格 */}
      <div className="formulas-card-grid">
        {filteredFormulas.map((f) => (
          <div key={f.id} className="formula-card">
            <div className="formula-card-header">
              <span className="f-sub-badge">{f.subjectName}</span>
              <span className="f-cat-badge">{f.category}</span>
            </div>

            <h3 className="formula-name">{f.title}</h3>

            <div className="formula-code-box">
              <code>{f.formula}</code>
            </div>

            <div className="formula-points-list">
              {f.keyPoints.map((pt, pIdx) => (
                <div key={pIdx} className="point-item">
                  <span className="dot">•</span>
                  <span>{pt}</span>
                </div>
              ))}
            </div>

            {f.example && (
              <div className="formula-example-box">
                <span className="ex-title">典型 408 实例推导：</span>
                <p>{f.example}</p>
              </div>
            )}

            <div className="formula-card-footer">
              <button
                type="button"
                className="f-lab-link-btn"
                onClick={() => onOpenExperiment(f.labId)}
              >
                🔬 打开对应仿真：{f.labName} →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
