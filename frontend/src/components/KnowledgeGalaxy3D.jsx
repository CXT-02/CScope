import React, { useRef, useEffect, useState, useMemo } from 'react'

// 25 个底层计算机核心知识节点在 3D 芯片拓扑空间中的坐标与微架构元数据
const GALAXY_NODES = [
  // 计算机组成原理 (Cluster 1 - CPU 硬件微架构)
  { id: 'n_cpu_pipe', code: 'CPU-01', name: 'CPU 五级流水线', course: '计算机组成原理', courseId: 'arch', status: 'weak', x: -140, y: 50, z: -40, size: 14, labId: 'cpu-pipeline', desc: '涵盖 IF/ID/EX/MEM/WB 五大时钟节拍，408 核心重点突破 RAW 数据冒险与分支预测。' },
  { id: 'n_hazard', code: 'CPU-02', name: 'Load-Use 数据冒险', course: '计算机组成原理', courseId: 'arch', status: 'weak', x: -180, y: 110, z: -10, size: 11, labId: 'cpu-pipeline', desc: '数据在 MEM 阶段末尾由 Cache/主存产出，后继指令 EX 阶段强行等待，必须硬件阻塞插入 Bubble。' },
  { id: 'n_cache', code: 'MEM-01', name: 'Cache 组相联映射', course: '计算机组成原理', courseId: 'arch', status: 'core', x: -110, y: -40, z: 90, size: 14, labId: 'cache-mapping', desc: '主存物理地址解构为 Tag + Set Index + Offset，408 必考 Cache 容量与组相联缺失判定。' },
  { id: 'n_thrash', code: 'MEM-02', name: 'Cache 冲突颠簸', course: '计算机组成原理', courseId: 'arch', status: 'weak', x: -150, y: -90, z: 120, size: 10, labId: 'cache-mapping', desc: '循环访问映射到同一 Cache 行的变量导致命中率跌至 0%，需提高相联度或填充数组解除。' },
  { id: 'n_inst_cycle', code: 'CTL-01', name: '指令周期时序打拍', course: '计算机组成原理', courseId: 'arch', status: 'mastered', x: -70, y: 110, z: -80, size: 11, labId: 'instruction-cycle', desc: '取指、间址、执行、中断四阶段总线控制逻辑与微操作控制信号时钟节拍。' },
  { id: 'n_ieee754', code: 'ALU-01', name: 'IEEE 754 浮点表示', course: '计算机组成原理', courseId: 'arch', status: 'unvisited', x: -90, y: -110, z: -60, size: 10, labId: 'number-representation', desc: '1 位符号 + 8 位阶码(移码) + 23 位尾数(隐藏位 1.M)，以及正负零与非规格化数计算。' },

  // 操作系统 (Cluster 2 - 内核并发与虚存调度)
  { id: 'n_deadlock', code: 'OS-01', name: '死锁银行家算法', course: '操作系统', courseId: 'os', status: 'weak', x: 20, y: 130, z: 70, size: 14, labId: 'deadlock', desc: '利用安全性序列检查矩阵（Available, Max, Allocation, Need），判定系统是否处于安全状态。' },
  { id: 'n_deadlock_cond', code: 'OS-02', name: '死锁四必要条件', course: '操作系统', courseId: 'os', status: 'mastered', x: 60, y: 180, z: 40, size: 9, labId: 'deadlock', desc: '互斥条件、占有且等待、不可剥夺、循环等待链。' },
  { id: 'n_sync', code: 'OS-03', name: '进程同步与 Peterson', course: '操作系统', courseId: 'os', status: 'core', x: 80, y: 80, z: -100, size: 12, labId: 'process-sync', desc: '通过 flag 意愿标志与 turn 谦让变量严格解决双进程临界区访问互斥。' },
  { id: 'n_sched', code: 'OS-04', name: 'CPU 调度算法', course: '操作系统', courseId: 'os', status: 'mastered', x: -10, y: 40, z: -140, size: 10, labId: 'scheduling', desc: 'FCFS、SJF、高响应比优先 HRRN 与时间片轮转 RR 周转时间推导。' },
  { id: 'n_page_rep', code: 'VM-01', name: '虚拟页式存储与置换', course: '操作系统', courseId: 'os', status: 'core', x: 90, y: -50, z: 80, size: 13, labId: 'page-replacement', desc: 'TLB 快表命中、多级页表、OPT/FIFO/LRU 缺页中断时序与物理帧置换。' },
  { id: 'n_mem_part', code: 'VM-02', name: '内存动态分区分配', course: '操作系统', courseId: 'os', status: 'mastered', x: 50, y: -120, z: 30, size: 9, labId: 'memory-partition', desc: '首次适应、最佳适应与最坏适应算法地址空闲链分配与外部碎片。' },

  // 计算机网络 (Cluster 3 - 传输层协议栈与路由)
  { id: 'n_tcp_conn', code: 'NET-01', name: 'TCP 三次握手', course: '计算机网络', courseId: 'net', status: 'core', x: 130, y: -10, z: -80, size: 14, labId: 'tcp-connection', desc: '全双工初始序列号 ISN 同步，防止网络中已失效的历史 SYN 报文段产生错误连接。' },
  { id: 'n_tcp_close', code: 'NET-02', name: 'TCP 四次挥手 2MSL', course: '计算机网络', courseId: 'net', status: 'mastered', x: 170, y: 40, z: -60, size: 10, labId: 'tcp-connection', desc: 'TIME_WAIT 状态等待 2MSL 确保最终 ACK 可达，并使本连接产生的所有报文段均在网络中消失。' },
  { id: 'n_sliding_win', code: 'NET-03', name: '滑动窗口与拥塞控制', course: '计算机网络', courseId: 'net', status: 'weak', x: 150, y: -90, z: -20, size: 13, labId: 'sliding-window', desc: '慢开始、拥塞避免、快重传与快恢复拥塞窗口 cwnd 动态曲线与发送/接收滑动窗口演进。' },
  { id: 'n_ip_subnet', code: 'NET-04', name: 'IP 子网掩码与 CIDR', course: '计算机网络', courseId: 'net', status: 'mastered', x: 110, y: -140, z: -90, size: 10, labId: 'ip-subnet', desc: '网络前缀、斜线记法、路由聚合（超网形成）与路由表最长前缀匹配原则。' },
  { id: 'n_dns', code: 'NET-05', name: 'DNS 递归与迭代解析', course: '计算机网络', courseId: 'net', status: 'unvisited', x: 90, y: 50, z: -150, size: 9, labId: 'dns-resolution', desc: '主机向本地域名服务器递归，本地域名服务器向根、顶级与权限服务器迭代查询。' },

  // 数据结构与算法 (Cluster 4 - 树、图与时空复杂度)
  { id: 'n_dijkstra', code: 'DS-01', name: 'Dijkstra 最短路径', course: '数据结构与算法', courseId: 'ds', status: 'core', x: -50, y: -40, z: -120, size: 13, labId: 'dijkstra', desc: '贪心策略按路径递增顺序松弛非负权值边，时间复杂度 O(V^2) 或小顶堆优化 O(E log V)。' },
  { id: 'n_tree_rot', code: 'DS-02', name: 'AVL 平衡二叉树旋转', course: '数据结构与算法', courseId: 'ds', status: 'weak', x: 30, y: -30, z: -40, size: 12, labId: 'tree-traversal', desc: 'LL、RR、LR、RL 四种平衡旋转调整，维持二叉搜索树的 O(log N) 查找性能。' },
  { id: 'n_sorting', code: 'DS-03', name: '经典内部排序算法', course: '数据结构与算法', courseId: 'ds', status: 'mastered', x: -100, y: 20, z: -30, size: 11, labId: 'sorting', desc: '快速排序三数取中划分、堆排序大顶堆调整与归并排序稳定性时空对比。' },
  { id: 'n_stack_queue', code: 'DS-04', name: '栈与队列时序模拟', course: '数据结构与算法', courseId: 'ds', status: 'mastered', x: -20, y: -70, z: -80, size: 9, labId: 'stack-queue', desc: '卡特兰数 Catalan(n) 出栈排列计数与循环队列 (rear + 1) % MaxSize 判满判空。' },

  // 数据库与前沿计算 (Cluster 5)
  { id: 'n_bplus_tree', code: 'DB-01', name: 'B+ 树外存索引', course: '数据库系统', courseId: 'db', status: 'core', x: -20, y: 90, z: 120, size: 12, labId: 'bplus-tree', desc: '多路平衡查找树，非叶节点只存索引，叶子节点构成双向有序链表，极致优化磁盘 I/O。' },
  { id: 'n_transactions', code: 'DB-02', name: 'ACID 事务与并发', course: '数据库系统', courseId: 'db', status: 'unvisited', x: -60, y: 140, z: 90, size: 10, labId: 'transaction', desc: '两段锁协议 2PL 保证冲突可串行化，WAL 预写日志与 Redo/Undo 恢复机制。' },
  { id: 'n_attention', code: 'AI-01', name: 'Transformer 注意力', course: '人工智能与前沿', courseId: 'ai', status: 'core', x: 70, y: -100, z: 130, size: 14, labId: 'attention', desc: 'Q·K^T / sqrt(d_k) 缩放点积自注意力，软寻址权重矩阵关联上下文语义拓扑。' },
  { id: 'n_neural_net', code: 'AI-02', name: '感知机与反向传播', course: '人工智能与前沿', courseId: 'ai', status: 'unvisited', x: 120, y: -60, z: 160, size: 10, labId: 'neural-network', desc: '多层前馈神经网络与损失函数梯度下降链式求导更新权重。' }
]

// 3D 知识芯片总线总拓扑
const GALAXY_EDGES = [
  // 计组内微架构总线
  ['n_cpu_pipe', 'n_hazard'],
  ['n_cpu_pipe', 'n_inst_cycle'],
  ['n_cpu_pipe', 'n_cache'],
  ['n_cache', 'n_thrash'],
  ['n_cache', 'n_page_rep'], // 计组 Cache 关联到 操作系统 虚存页面置换
  ['n_inst_cycle', 'n_ieee754'],

  // 操作系统内核总线
  ['n_deadlock', 'n_deadlock_cond'],
  ['n_deadlock', 'n_sync'],
  ['n_sync', 'n_sched'],
  ['n_page_rep', 'n_mem_part'],
  ['n_sched', 'n_cpu_pipe'], // 进程调度关联到硬件流水线

  // 计算机网络协议栈总线
  ['n_tcp_conn', 'n_tcp_close'],
  ['n_tcp_conn', 'n_sliding_win'],
  ['n_sliding_win', 'n_ip_subnet'],
  ['n_ip_subnet', 'n_dns'],
  ['n_tcp_conn', 'n_sync'], // 网络握手与并发同步语义相通

  // 数据结构与算法总线
  ['n_tree_rot', 'n_dijkstra'],
  ['n_tree_rot', 'n_bplus_tree'], // AVL 树过渡到外存 B+ 树
  ['n_sorting', 'n_stack_queue'],
  ['n_dijkstra', 'n_ip_subnet'], // 路由最短路径算法关联到计网

  // 数据库与前沿 AI 总线
  ['n_bplus_tree', 'n_transactions'],
  ['n_attention', 'n_neural_net'],
  ['n_attention', 'n_cache'] // 注意力热度矩阵比拟 Cache 局部性
]

export default function KnowledgeGalaxy3D({ onOpenExperiment }) {
  const canvasRef = useRef(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [autoRotate, setAutoRotate] = useState(true)
  const [filterWeakOnly, setFilterWeakOnly] = useState(false)

  // 3D 摄像机状态（带有目标平滑旋转和缩放）
  const cameraRef = useRef({
    rotX: 0.2,
    rotY: -0.3,
    zoom: 1.05,
    panX: 0,
    panY: 0,
    isDragging: false,
    dragButton: 0,
    lastMouseX: 0,
    lastMouseY: 0,
    targetRotX: 0.2,
    targetRotY: -0.3,
    targetZoom: 1.05
  })

  // 计算机微观芯片总线背景：十六进制代码微粒与晶体管网格
  const cyberGridParticles = useMemo(() => {
    const list = []
    const hexCodes = ['0x00FF', 'PC:040', 'CLK', 'WASM', 'ALU', 'BUS:32', 'TAG:14', 'SYN', 'ACK', 'PV:0', 'O(NlogN)', 'RW:1']
    for (let i = 0; i < 90; i++) {
      list.push({
        x: (Math.random() - 0.5) * 880,
        y: (Math.random() - 0.5) * 880,
        z: (Math.random() - 0.5) * 880,
        label: hexCodes[i % hexCodes.length],
        alpha: Math.random() * 0.4 + 0.1,
        size: Math.random() * 2 + 1
      })
    }
    return list
  }, [])

  // 总线上流动的数据包脉冲粒子
  const busSignalsRef = useRef(
    GALAXY_EDGES.map(() => ({
      progress: Math.random(),
      speed: 0.003 + Math.random() * 0.004
    }))
  )

  // 统计指标
  const stats = useMemo(() => {
    const total = GALAXY_NODES.length
    const weak = GALAXY_NODES.filter(n => n.status === 'weak').length
    const mastered = GALAXY_NODES.filter(n => n.status === 'mastered').length
    const core = GALAXY_NODES.filter(n => n.status === 'core').length
    const coverage = Math.round(((mastered + weak) / total) * 100)
    return { total, edges: GALAXY_EDGES.length, weak, mastered, core, coverage }
  }, [])

  // 3D 核心渲染循环
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const render = () => {
      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height
      const cam = cameraRef.current

      // 自转：仅在未选中节点且非拖拽时低速自转
      if (autoRotate && !cam.isDragging && !selectedNode) {
        cam.targetRotY += 0.0018
      }

      // 弹性插值平滑逼近目标视角 (Smooth Damping)
      cam.rotX += (cam.targetRotX - cam.rotX) * 0.08
      cam.rotY += (cam.targetRotY - cam.rotY) * 0.08
      cam.zoom += (cam.targetZoom - cam.zoom) * 0.08

      // 1. 清空画布 (采用专属微观硅晶圆石板蓝底色)
      ctx.fillStyle = '#060a12'
      ctx.fillRect(0, 0, width, height)

      // 绘制微观芯片电路辐射背光
      const bgGlow = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width * 0.7)
      bgGlow.addColorStop(0, 'rgba(10, 25, 47, 0.75)')
      bgGlow.addColorStop(0.5, 'rgba(6, 15, 30, 0.45)')
      bgGlow.addColorStop(1, '#060a12')
      ctx.fillStyle = bgGlow
      ctx.fillRect(0, 0, width, height)

      // 3D 变换矩阵计算
      const cosX = Math.cos(cam.rotX)
      const sinX = Math.sin(cam.rotX)
      const cosY = Math.cos(cam.rotY)
      const sinY = Math.sin(cam.rotY)
      const fov = 460
      const cameraDist = 480

      // 3D 坐标投影函数
      const project = (x, y, z) => {
        // 绕 Y 轴旋转
        const x1 = x * cosY - z * sinY
        const z1 = z * cosY + x * sinY
        // 绕 X 轴旋转
        const y2 = y * cosX - z1 * sinX
        const z2 = z1 * cosX + y * sinX + cameraDist

        const scale = (fov / Math.max(10, z2)) * cam.zoom
        const screenX = width / 2 + x1 * scale + cam.panX
        const screenY = height / 2 + y2 * scale + cam.panY

        return { screenX, screenY, scale, zDepth: z2, x1, y2, z1 }
      }

      // 2. 绘制微观芯片透视坐标网格 (Cyber Circuit Grid)
      ctx.save()
      ctx.strokeStyle = 'rgba(5, 150, 105, 0.08)'
      ctx.lineWidth = 1
      const gridRadius = 260
      const ringSteps = [80, 160, 240]
      ringSteps.forEach(r => {
        ctx.beginPath()
        for (let i = 0; i <= 32; i++) {
          const theta = (i / 32) * Math.PI * 2
          const gx = Math.cos(theta) * r
          const gz = Math.sin(theta) * r
          const gp = project(gx, 0, gz)
          if (i === 0) ctx.moveTo(gp.screenX, gp.screenY)
          else ctx.lineTo(gp.screenX, gp.screenY)
        }
        ctx.stroke()
      })
      ctx.restore()

      // 3. 绘制十六进制指令代码微粒 (Hex Instruction Dust)
      ctx.save()
      ctx.font = '9px ui-monospace, monospace'
      cyberGridParticles.forEach(p => {
        const proj = project(p.x, p.y, p.z)
        if (proj.zDepth > 20) {
          ctx.fillStyle = `rgba(100, 116, 139, ${p.alpha * Math.min(1, proj.scale)})`
          ctx.fillText(p.label, proj.screenX, proj.screenY)
        }
      })
      ctx.restore()

      // 4. 计算所有节点的 2D 投影
      const projectedNodes = GALAXY_NODES.map(node => {
        const proj = project(node.x, node.y, node.z)
        return { ...node, ...proj }
      })

      const nodeMap = new Map()
      projectedNodes.forEach(n => nodeMap.set(n.id, n))

      // 5. 绘制芯片内部总线 (Data Bus Lines) 与流动的数据脉冲粒子
      const busSignals = busSignalsRef.current
      GALAXY_EDGES.forEach(([sourceId, targetId], edgeIdx) => {
        const src = nodeMap.get(sourceId)
        const tgt = nodeMap.get(targetId)
        if (!src || !tgt) return

        if (filterWeakOnly && src.status !== 'weak' && tgt.status !== 'weak') {
          return
        }

        const isHighlight =
          (hoveredNode && (hoveredNode.id === src.id || hoveredNode.id === tgt.id)) ||
          (selectedNode && (selectedNode.id === src.id || selectedNode.id === tgt.id))

        const avgDepth = (src.zDepth + tgt.zDepth) / 2
        const depthAlpha = Math.max(0.1, Math.min(0.8, 1 - avgDepth / 850))

        ctx.beginPath()
        ctx.moveTo(src.screenX, src.screenY)
        ctx.lineTo(tgt.screenX, tgt.screenY)

        if (isHighlight) {
          ctx.strokeStyle = '#059669'
          ctx.lineWidth = 2.4
          ctx.shadowColor = '#10b981'
          ctx.shadowBlur = 10
        } else {
          ctx.strokeStyle = `rgba(71, 85, 105, ${depthAlpha * 0.5})`
          ctx.lineWidth = Math.max(0.8, 1.2 * ((src.scale + tgt.scale) / 2))
          ctx.shadowBlur = 0
        }
        ctx.stroke()
        ctx.shadowBlur = 0

        // 在总线上流动的时钟数据脉冲粒子
        const sig = busSignals[edgeIdx]
        if (sig) {
          sig.progress = (sig.progress + sig.speed) % 1.0
          const packetX = src.screenX + (tgt.screenX - src.screenX) * sig.progress
          const packetY = src.screenY + (tgt.screenY - src.screenY) * sig.progress
          ctx.beginPath()
          ctx.arc(packetX, packetY, isHighlight ? 2.5 : 1.5, 0, Math.PI * 2)
          ctx.fillStyle = isHighlight ? '#34d399' : 'rgba(16, 185, 129, 0.6)'
          ctx.fill()
        }
      })

      // 6. 按深度排序（Z-Sorting）绘制节点，选中节点始终排在最前面
      projectedNodes.sort((a, b) => {
        // 如果其中一个是当前选中的节点，强制将其排在最后绘制（在最顶层最前）
        if (selectedNode) {
          if (a.id === selectedNode.id) return 1
          if (b.id === selectedNode.id) return -1
        }
        return b.zDepth - a.zDepth
      })

      // 7. 绘制微架构芯片知识节点 (Micro-Architecture Chip Nodes)
      projectedNodes.forEach(node => {
        const isHovered = hoveredNode && hoveredNode.id === node.id
        const isSelected = selectedNode && selectedNode.id === node.id

        const isFaded = filterWeakOnly && node.status !== 'weak'
        // 选中节点强制最大透明度 1.0，不会受距离衰减变暗
        const baseAlpha = isSelected ? 1.0 : (isFaded ? 0.2 : Math.max(0.35, Math.min(1.0, 1.35 - node.zDepth / 750)))

        // 依据微架构所属领域定义专业色彩
        let themeColor = '#10b981' // 计组：翡翠绿
        let glowColor = 'rgba(16, 185, 129, 0.45)'
        if (node.courseId === 'os') {
          themeColor = '#06b6d4' // 系统：电光青
          glowColor = 'rgba(6, 182, 212, 0.45)'
        } else if (node.courseId === 'net') {
          themeColor = '#8b5cf6' // 网络：协议紫
          glowColor = 'rgba(139, 92, 246, 0.45)'
        } else if (node.courseId === 'ds') {
          themeColor = '#f59e0b' // 算法：琥珀金
          glowColor = 'rgba(245, 158, 11, 0.45)'
        } else if (node.courseId === 'ai') {
          themeColor = '#f43f5e' // 前沿AI：电光玫红
          glowColor = 'rgba(244, 63, 94, 0.45)'
        }

        // 薄弱考点额外加红警示晕
        if (node.status === 'weak') {
          glowColor = 'rgba(239, 68, 68, 0.55)'
        }

        const radius = Math.max(4.5, node.size * node.scale * (isSelected ? 1.5 : isHovered ? 1.25 : 1.0))

        // A. 外层微架构光晕
        if (!isFaded) {
          const glowGrad = ctx.createRadialGradient(
            node.screenX, node.screenY, radius * 0.2,
            node.screenX, node.screenY, radius * 3.4
          )
          glowGrad.addColorStop(0, glowColor)
          glowGrad.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = glowGrad
          ctx.beginPath()
          ctx.arc(node.screenX, node.screenY, radius * 3.4, 0, Math.PI * 2)
          ctx.fill()
        }

        // B. 芯片外层微时钟引脚圈 (Hardware Pins & Radar Ring)
        ctx.save()
        ctx.strokeStyle = isSelected ? '#ffffff' : themeColor
        ctx.globalAlpha = baseAlpha * 0.7
        ctx.lineWidth = isSelected ? 1.8 : 1.0
        ctx.beginPath()
        ctx.arc(node.screenX, node.screenY, radius * 1.5, 0, Math.PI * 2)
        ctx.stroke()

        // 绘制引脚微刻度
        const pinCount = 6
        for (let p = 0; p < pinCount; p++) {
          const pAngle = (p / pinCount) * Math.PI * 2
          const pinR1 = radius * 1.5
          const pinR2 = radius * 1.8
          ctx.beginPath()
          ctx.moveTo(node.screenX + Math.cos(pAngle) * pinR1, node.screenY + Math.sin(pAngle) * pinR1)
          ctx.lineTo(node.screenX + Math.cos(pAngle) * pinR2, node.screenY + Math.sin(pAngle) * pinR2)
          ctx.stroke()
        }
        ctx.restore()

        // C. 核心芯片实心晶元
        ctx.beginPath()
        ctx.arc(node.screenX, node.screenY, radius, 0, Math.PI * 2)
        ctx.fillStyle = themeColor
        ctx.globalAlpha = baseAlpha
        ctx.fill()

        // D. 选中时的高能 HUD 准星 (Lock Reticle)
        if (isSelected) {
          ctx.save()
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 2
          ctx.shadowColor = '#10b981'
          ctx.shadowBlur = 12
          const reticleSize = radius * 2.3
          // 四角瞄准框
          const d = 8
          // 左上
          ctx.beginPath()
          ctx.moveTo(node.screenX - reticleSize, node.screenY - reticleSize + d)
          ctx.lineTo(node.screenX - reticleSize, node.screenY - reticleSize)
          ctx.lineTo(node.screenX - reticleSize + d, node.screenY - reticleSize)
          // 右上
          ctx.moveTo(node.screenX + reticleSize - d, node.screenY - reticleSize)
          ctx.lineTo(node.screenX + reticleSize, node.screenY - reticleSize)
          ctx.lineTo(node.screenX + reticleSize, node.screenY - reticleSize + d)
          // 左下
          ctx.moveTo(node.screenX - reticleSize, node.screenY + reticleSize - d)
          ctx.lineTo(node.screenX - reticleSize, node.screenY + reticleSize)
          ctx.lineTo(node.screenX - reticleSize + d, node.screenY + reticleSize)
          // 右下
          ctx.moveTo(node.screenX + reticleSize - d, node.screenY + reticleSize)
          ctx.lineTo(node.screenX + reticleSize, node.screenY + reticleSize)
          ctx.lineTo(node.screenX + reticleSize, node.screenY + reticleSize - d)
          ctx.stroke()
          ctx.restore()
        }

        // E. 绘制微架构芯片标识与知识点名称
        if (!isFaded && (node.zDepth < 650 || isHovered || isSelected)) {
          const fontSize = Math.max(10, Math.min(14, 12 * node.scale))
          ctx.save()
          ctx.font = `${isSelected ? 'bold ' : ''}${fontSize}px Inter, -apple-system, sans-serif`
          ctx.fillStyle = isSelected ? '#ffffff' : isHovered ? '#34d399' : `rgba(226, 232, 240, ${baseAlpha * 0.9})`
          
          // 绘制编号标签 (如 [CPU-01])
          const codeText = `[${node.code}] `
          ctx.font = `800 ${Math.max(9, fontSize - 2)}px ui-monospace, monospace`
          ctx.fillStyle = isSelected ? '#34d399' : themeColor
          ctx.fillText(codeText, node.screenX + radius + 6, node.screenY + 4)

          const codeWidth = ctx.measureText(codeText).width
          ctx.font = `${isSelected ? 'bold ' : ''}${fontSize}px Inter, sans-serif`
          ctx.fillStyle = isSelected ? '#ffffff' : `rgba(226, 232, 240, ${baseAlpha * 0.95})`
          ctx.fillText(node.name, node.screenX + radius + 6 + codeWidth, node.screenY + 4)
          ctx.restore()
        }
      })

      animId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [autoRotate, filterWeakOnly, hoveredNode, selectedNode, cyberGridParticles])

  // 鼠标交互：拖动旋转、滚轮缩放
  const handleMouseDown = (e) => {
    const cam = cameraRef.current
    cam.isDragging = true
    cam.dragButton = e.button
    cam.lastMouseX = e.clientX
    cam.lastMouseY = e.clientY
  }

  const handleMouseMove = (e) => {
    const cam = cameraRef.current
    if (cam.isDragging) {
      const deltaX = e.clientX - cam.lastMouseX
      const deltaY = e.clientY - cam.lastMouseY
      cam.lastMouseX = e.clientX
      cam.lastMouseY = e.clientY

      if (cam.dragButton === 0) {
        cam.targetRotY += deltaX * 0.007
        cam.targetRotX += deltaY * 0.007
      } else if (cam.dragButton === 2) {
        cam.panX += deltaX
        cam.panY += deltaY
      }
    } else {
      // 鼠标悬停拾取判定
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      let hit = null
      const cosX = Math.cos(cam.rotX)
      const sinX = Math.sin(cam.rotX)
      const cosY = Math.cos(cam.rotY)
      const sinY = Math.sin(cam.rotY)

      GALAXY_NODES.forEach(node => {
        const x1 = node.x * cosY - node.z * sinY
        const z1 = node.z * cosY + node.x * sinY
        const y2 = node.y * cosX - z1 * sinX
        const z2 = z1 * cosX + node.y * sinX + 480
        const scale = (460 / Math.max(10, z2)) * cam.zoom
        const screenX = rect.width / 2 + x1 * scale + cam.panX
        const screenY = rect.height / 2 + y2 * scale + cam.panY
        const dist = Math.hypot(mouseX - screenX, mouseY - screenY)

        if (dist < 22) {
          hit = node
        }
      })
      setHoveredNode(hit)
    }
  }

  const handleMouseUp = () => {
    cameraRef.current.isDragging = false
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const cam = cameraRef.current
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88
    cam.targetZoom = Math.max(0.45, Math.min(2.8, cam.targetZoom * zoomFactor))
  }

  // ========================================================
  // 核心数学推导修复：将点击的任意知识点稳稳自旋到正前方最前面 (Bring to Front)
  // ========================================================
  const handleClick = () => {
    if (hoveredNode) {
      setSelectedNode(hoveredNode)
      setAutoRotate(false) // 选中的同时暂停乱转，方便研读

      const cam = cameraRef.current
      const nx = hoveredNode.x
      const ny = hoveredNode.y
      const nz = hoveredNode.z

      // 要让节点旋转后位于正前方正中心且最靠近视口（z1 > 0 为正前方极大值）：
      // x1 = nx * cosY - nz * sinY = 0  且  z1 = nz * cosY + nx * sinY = R_xz > 0
      // 充要数学解：targetAngleY = atan2(nx, nz)
      const idealRotY = Math.atan2(nx, nz)
      const rxz = Math.hypot(nx, nz)

      // 让 y2 = ny * cosX - z1 * sinX = 0，从而屏幕垂直方向也正正居中：
      const idealRotX = Math.atan2(ny, rxz)

      // 保证以最短角度旋转插值（避免多转一圈）：
      let diffY = (idealRotY - (cam.rotY % (Math.PI * 2)))
      while (diffY > Math.PI) diffY -= Math.PI * 2
      while (diffY < -Math.PI) diffY += Math.PI * 2

      cam.targetRotY = cam.rotY + diffY
      cam.targetRotX = idealRotX
      cam.targetZoom = 1.35
      cam.panX = 0
      cam.panY = 0
    }
  }

  // 视角重置
  const resetCamera = () => {
    const cam = cameraRef.current
    cam.targetRotX = 0.2
    cam.targetRotY = -0.3
    cam.targetZoom = 1.05
    cam.panX = 0
    cam.panY = 0
    setSelectedNode(null)
    setAutoRotate(true)
  }

  return (
    <div className="knowledge-galaxy-page">
      {/* 3D 芯片拓扑视窗 */}
      <div className="galaxy-viewport-wrapper">
        <canvas
          ref={canvasRef}
          className="galaxy-canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onClick={handleClick}
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* 顶部控制栏 (专属微架构中枢风格) */}
        <div className="galaxy-top-controls">
          <div className="galaxy-title-badge">
            <span className="live-pulse-dot" />
            <span className="hub-code-badge">CSCOPE // 3D TOPOLOGY</span>
            <strong>408 计算机体系结构时钟神经星图</strong>
            <span className="node-count-tag">{stats.total} 芯片核 · {stats.edges} 条总线</span>
          </div>

          <div className="galaxy-action-buttons">
            <button
              type="button"
              className={`galaxy-btn ${filterWeakOnly ? 'active' : ''}`}
              onClick={() => setFilterWeakOnly(!filterWeakOnly)}
            >
              {filterWeakOnly ? '显示全总线' : '高亮薄弱考点 🔴'}
            </button>
            <button
              type="button"
              className={`galaxy-btn ${autoRotate ? 'active' : ''}`}
              onClick={() => setAutoRotate(!autoRotate)}
            >
              {autoRotate ? '暂停时钟自转 ⏸' : '启动时钟自转 ⟲'}
            </button>
            <button
              type="button"
              className="galaxy-btn reset"
              onClick={resetCamera}
            >
              微架构复位 ⌖
            </button>
          </div>
        </div>

        {/* 底部 3D 空间漫游交互提示 */}
        <div className="galaxy-bottom-hints">
          <span>拖拽: 360° 旋转芯片拓扑</span>
          <span className="dot">•</span>
          <span>滚轮: 纳米级深度缩放</span>
          <span className="dot">•</span>
          <span>右键: 平移微架构视角</span>
          <span className="dot">•</span>
          <span className="highlight-hint">点击任意节点: 瞬时对正正前方并置顶聚焦</span>
        </div>

        {/* 右侧微架构学情与领域图例面板 */}
        <div className="galaxy-right-stat-panel">
          <div className="panel-box-header">
            <h4>芯片拓扑与考情画像</h4>
            <span className="panel-badge">WASM 实时渲染</span>
          </div>

          <div className="stat-metric-rows">
            <div className="metric-row">
              <span>微指令节点</span>
              <strong>{stats.total}</strong>
            </div>
            <div className="metric-row">
              <span>时序数据总线</span>
              <strong>{stats.edges}</strong>
            </div>
            <div className="metric-row">
              <span>408 考点覆盖率</span>
              <strong className="green">{stats.coverage}%</strong>
            </div>
          </div>

          <div className="divider-line" />

          {/* 学科领域色彩图例 */}
          <div className="legend-block">
            <span className="legend-title">硬件体系结构领域：</span>
            <div className="legend-row">
              <span className="legend-chip-color arch" />
              <span>[CPU] 计组微架构 (6)</span>
            </div>
            <div className="legend-row">
              <span className="legend-chip-color os" />
              <span>[OS] 操作系统内核 (6)</span>
            </div>
            <div className="legend-row">
              <span className="legend-chip-color net" />
              <span>[NET] 传输协议栈 (5)</span>
            </div>
            <div className="legend-row">
              <span className="legend-chip-color ds" />
              <span>[DS] 算法与数据结构 (4)</span>
            </div>
            <div className="legend-row">
              <span className="legend-chip-color ai" />
              <span>[AI] 前沿智能计算 (4)</span>
            </div>
          </div>
        </div>

        {/* 选中节点的高能 HUD 详情卡片 */}
        {selectedNode && (
          <div className="node-inspector-floating-card">
            <button
              type="button"
              className="close-inspector-btn"
              onClick={() => setSelectedNode(null)}
            >
              ×
            </button>
            <div className="inspector-badge-row">
              <span className="course-tag">{selectedNode.course}</span>
              <span className="node-code-tag">[{selectedNode.code}]</span>
              <span className={`status-tag ${selectedNode.status}`}>
                {selectedNode.status === 'weak' ? '薄弱攻坚点' : selectedNode.status === 'mastered' ? '已掌握' : '408 核心必考'}
              </span>
            </div>
            <h3 className="inspector-title">{selectedNode.name}</h3>
            <p className="inspector-desc">{selectedNode.desc}</p>

            <div className="inspector-action-row">
              <button
                type="button"
                className="launch-lab-btn"
                onClick={() => onOpenExperiment(selectedNode.labId)}
              >
                🔬 启动该考点微观仿真时序推演 →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
