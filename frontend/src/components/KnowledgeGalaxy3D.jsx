import React, { useRef, useEffect, useState, useMemo } from 'react'

// 5 大核心学科体系配置
const COURSE_DOMAINS = [
  { id: 'all', name: '408 全景拓扑总星图', tag: '全景总览', count: 25, color: '#059669' },
  { id: 'arch', name: '计算机组成原理星图', tag: '01 计组硬件', count: 6, color: '#10b981' },
  { id: 'os', name: '操作系统内核星图', tag: '02 系统内核', count: 6, color: '#06b6d4' },
  { id: 'net', name: '计算机网络协议星图', tag: '03 网络传输', count: 5, color: '#8b5cf6' },
  { id: 'ds', name: '数据结构与算法星图', tag: '04 算法结构', count: 4, color: '#f59e0b' },
  { id: 'ai', name: '数据库与前沿AI星图', tag: '05 智能计算', count: 4, color: '#f43f5e' }
]

// 25 个底层计算机核心知识节点在 3D 芯片拓扑空间中的坐标（分学科星团聚类）
const GALAXY_NODES = [
  // 计算机组成原理星团 (Cluster 1: 左侧硬件星域, 坐标紧凑内聚)
  { id: 'n_cpu_pipe', code: 'CPU-01', name: 'CPU 五级流水线', course: '计算机组成原理', courseId: 'arch', status: 'weak', x: -130, y: 30, z: 20, size: 14, labId: 'cpu-pipeline', desc: '涵盖 IF/ID/EX/MEM/WB 五大时钟节拍，408 重点突破 RAW 数据冒险与分支预测。' },
  { id: 'n_hazard', code: 'CPU-02', name: 'Load-Use 数据冒险', course: '计算机组成原理', courseId: 'arch', status: 'weak', x: -170, y: 70, z: 40, size: 11, labId: 'cpu-pipeline', desc: '数据在 MEM 阶段末尾产出，后继指令 EX 阶段强行等待，必须硬件阻塞插入 Bubble。' },
  { id: 'n_cache', code: 'MEM-01', name: 'Cache 组相联映射', course: '计算机组成原理', courseId: 'arch', status: 'core', x: -100, y: -40, z: 80, size: 14, labId: 'cache-mapping', desc: '主存物理地址解构为 Tag + Set Index + Offset，408 必考 Cache 容量与组相联缺失判定。' },
  { id: 'n_thrash', code: 'MEM-02', name: 'Cache 冲突颠簸', course: '计算机组成原理', courseId: 'arch', status: 'weak', x: -140, y: -80, z: 110, size: 10, labId: 'cache-mapping', desc: '循环访问映射到同一 Cache 行的变量导致命中率跌至 0%，需提高相联度或填充数组解除。' },
  { id: 'n_inst_cycle', code: 'CTL-01', name: '指令周期时序打拍', course: '计算机组成原理', courseId: 'arch', status: 'mastered', x: -70, y: 70, z: -30, size: 11, labId: 'instruction-cycle', desc: '取指、间址、执行、中断四阶段总线控制逻辑与微操作控制信号时钟节拍。' },
  { id: 'n_ieee754', code: 'ALU-01', name: 'IEEE 754 浮点表示', course: '计算机组成原理', courseId: 'arch', status: 'unvisited', x: -80, y: -90, z: -20, size: 10, labId: 'number-representation', desc: '1 位符号 + 8 位阶码(移码) + 23 位尾数(隐藏位 1.M)，以及正负零与非规格化数计算。' },

  // 操作系统星团 (Cluster 2: 右上方内核星域, 空间独立聚类)
  { id: 'n_deadlock', code: 'OS-01', name: '死锁银行家算法', course: '操作系统', courseId: 'os', status: 'weak', x: 70, y: 110, z: 50, size: 14, labId: 'deadlock', desc: '利用安全性序列检查矩阵（Available, Max, Allocation, Need），判定系统是否处于安全状态。' },
  { id: 'n_deadlock_cond', code: 'OS-02', name: '死锁四必要条件', course: '操作系统', courseId: 'os', status: 'mastered', x: 110, y: 150, z: 30, size: 9, labId: 'deadlock', desc: '互斥条件、占有且等待、不可剥夺、循环等待链。' },
  { id: 'n_sync', code: 'OS-03', name: '进程同步与 Peterson', course: '操作系统', courseId: 'os', status: 'core', x: 50, y: 50, z: -50, size: 12, labId: 'process-sync', desc: '通过 flag 意愿标志与 turn 谦让变量严格解决双进程临界区访问互斥。' },
  { id: 'n_sched', code: 'OS-04', name: 'CPU 调度算法', course: '操作系统', courseId: 'os', status: 'mastered', x: 10, y: 80, z: -90, size: 10, labId: 'scheduling', desc: 'FCFS、SJF、高响应比优先 HRRN 与时间片轮转 RR 周转时间推导。' },
  { id: 'n_page_rep', code: 'VM-01', name: '虚拟页式存储与置换', course: '操作系统', courseId: 'os', status: 'core', x: 110, y: -20, z: 60, size: 13, labId: 'page-replacement', desc: 'TLB 快表命中、多级页表、OPT/FIFO/LRU 缺页中断时序与物理帧置换。' },
  { id: 'n_mem_part', code: 'VM-02', name: '内存动态分区分配', course: '操作系统', courseId: 'os', status: 'mastered', x: 80, y: -70, z: 20, size: 9, labId: 'memory-partition', desc: '首次适应、最佳适应与最坏适应算法地址空闲链分配与外部碎片。' },

  // 计算机网络星团 (Cluster 3: 右下方协议栈星域, 垂直分层紧密)
  { id: 'n_tcp_conn', code: 'NET-01', name: 'TCP 三次握手', course: '计算机网络', courseId: 'net', status: 'core', x: 120, y: -40, z: -80, size: 14, labId: 'tcp-connection', desc: '全双工初始序列号 ISN 同步，防止网络中已失效的历史 SYN 报文段产生错误连接。' },
  { id: 'n_tcp_close', code: 'NET-02', name: 'TCP 四次挥手 2MSL', course: '计算机网络', courseId: 'net', status: 'mastered', x: 160, y: 10, z: -70, size: 10, labId: 'tcp-connection', desc: 'TIME_WAIT 状态等待 2MSL 确保最终 ACK 可达，并使本连接产生的所有报文段均在网络中消失。' },
  { id: 'n_sliding_win', code: 'NET-03', name: '滑动窗口与拥塞控制', course: '计算机网络', courseId: 'net', status: 'weak', x: 140, y: -100, z: -30, size: 13, labId: 'sliding-window', desc: '慢开始、拥塞避免、快重传与快恢复拥塞窗口 cwnd 动态曲线与发送/接收滑动窗口演进。' },
  { id: 'n_ip_subnet', code: 'NET-04', name: 'IP 子网掩码与 CIDR', course: '计算机网络', courseId: 'net', status: 'mastered', x: 90, y: -140, z: -70, size: 10, labId: 'ip-subnet', desc: '网络前缀、斜线记法、路由聚合（超网形成）与路由表最长前缀匹配原则。' },
  { id: 'n_dns', code: 'NET-05', name: 'DNS 递归与迭代解析', course: '计算机网络', courseId: 'net', status: 'unvisited', x: 80, y: 10, z: -140, size: 9, labId: 'dns-resolution', desc: '主机向本地域名服务器递归，本地域名服务器向根、顶级与权限服务器迭代查询。' },

  // 数据结构与算法星团 (Cluster 4: 左下方算法星域, 树图拓扑高内聚)
  { id: 'n_dijkstra', code: 'DS-01', name: 'Dijkstra 最短路径', course: '数据结构与算法', courseId: 'ds', status: 'core', x: -40, y: -60, z: -110, size: 13, labId: 'dijkstra', desc: '贪心策略按路径递增顺序松弛非负权值边，时间复杂度 O(V^2) 或小顶堆优化 O(E log V)。' },
  { id: 'n_tree_rot', code: 'DS-02', name: 'AVL 平衡二叉树旋转', course: '数据结构与算法', courseId: 'ds', status: 'weak', x: 20, y: -40, z: -40, size: 12, labId: 'tree-traversal', desc: 'LL、RR、LR、RL 四种平衡旋转调整，维持二叉搜索树的 O(log N) 查找性能。' },
  { id: 'n_sorting', code: 'DS-03', name: '经典内部排序算法', course: '数据结构与算法', courseId: 'ds', status: 'mastered', x: -90, y: -10, z: -40, size: 11, labId: 'sorting', desc: '快速排序三数取中划分、堆排序大顶堆调整与归并排序稳定性时空对比。' },
  { id: 'n_stack_queue', code: 'DS-04', name: '栈与队列时序模拟', course: '数据结构与算法', courseId: 'ds', status: 'mastered', x: -10, y: -90, z: -70, size: 9, labId: 'stack-queue', desc: '卡特兰数 Catalan(n) 出栈排列计数与循环队列 (rear + 1) % MaxSize 判满判空。' },

  // 数据库与前沿计算 (Cluster 5: 远端拓展星域)
  { id: 'n_bplus_tree', code: 'DB-01', name: 'B+ 树外存索引', course: '数据库系统', courseId: 'ai', status: 'core', x: -20, y: 90, z: 120, size: 12, labId: 'bplus-tree', desc: '多路平衡查找树，非叶节点只存索引，叶子节点构成双向有序链表，极致优化磁盘 I/O。' },
  { id: 'n_transactions', code: 'DB-02', name: 'ACID 事务与并发', course: '数据库系统', courseId: 'ai', status: 'unvisited', x: -60, y: 130, z: 100, size: 10, labId: 'transaction', desc: '两段锁协议 2PL 保证冲突可串行化，WAL 预写日志与 Redo/Undo 恢复机制。' },
  { id: 'n_attention', code: 'AI-01', name: 'Transformer 注意力', course: '人工智能与前沿', courseId: 'ai', status: 'core', x: 60, y: -80, z: 120, size: 14, labId: 'attention', desc: 'Q·K^T / sqrt(d_k) 缩放点积自注意力，软寻址权重矩阵关联上下文语义拓扑。' },
  { id: 'n_neural_net', code: 'AI-02', name: '感知机与反向传播', course: '人工智能与前沿', courseId: 'ai', status: 'unvisited', x: 100, y: -40, z: 140, size: 10, labId: 'neural-network', desc: '多层前馈神经网络与损失函数梯度下降链式求导更新权重。' }
]

// 紧密因果关联总线连线
const GALAXY_EDGES = [
  // 1. 计算机组成原理内部硬件总线
  { source: 'n_cpu_pipe', target: 'n_hazard', domain: 'arch', label: '流水线冒险' },
  { source: 'n_cpu_pipe', target: 'n_inst_cycle', domain: 'arch', label: '时钟节拍' },
  { source: 'n_cpu_pipe', target: 'n_cache', domain: 'arch', label: '访存时钟' },
  { source: 'n_cache', target: 'n_thrash', domain: 'arch', label: '组相联冲突' },
  { source: 'n_inst_cycle', target: 'n_ieee754', domain: 'arch', label: '运算器执行' },

  // 2. 操作系统内核总线
  { source: 'n_deadlock', target: 'n_deadlock_cond', domain: 'os', label: '死锁判定' },
  { source: 'n_deadlock', target: 'n_sync', domain: 'os', label: '互斥等待' },
  { source: 'n_sync', target: 'n_sched', domain: 'os', label: '阻塞调度' },
  { source: 'n_page_rep', target: 'n_mem_part', domain: 'os', label: '虚实映射' },

  // 3. 计算机网络协议栈总线
  { source: 'n_tcp_conn', target: 'n_tcp_close', domain: 'net', label: '连接生命期' },
  { source: 'n_tcp_conn', target: 'n_sliding_win', domain: 'net', label: '流量与拥塞' },
  { source: 'n_sliding_win', target: 'n_ip_subnet', domain: 'net', label: '分片路由' },
  { source: 'n_ip_subnet', target: 'n_dns', domain: 'net', label: '域名解析' },

  // 4. 数据结构与算法总线
  { source: 'n_tree_rot', target: 'n_dijkstra', domain: 'ds', label: '空间树寻优' },
  { source: 'n_sorting', target: 'n_stack_queue', domain: 'ds', label: '递归调用栈' },
  { source: 'n_tree_rot', target: 'n_sorting', domain: 'ds', label: '树形堆排序' },

  // 5. 数据库与前沿AI总线
  { source: 'n_bplus_tree', target: 'n_transactions', domain: 'ai', label: '索引行锁' },
  { source: 'n_attention', target: 'n_neural_net', domain: 'ai', label: '参数反向传播' },

  // 6. 极少数 408 统考跨学科经典大题综合连线
  { source: 'n_cache', target: 'n_page_rep', domain: 'cross', label: 'TLB+Cache联合访存', isCross: true },
  { source: 'n_sched', target: 'n_cpu_pipe', domain: 'cross', label: '时钟中断与硬件调度', isCross: true }
]

export default function KnowledgeGalaxy3D({ onOpenExperiment }) {
  const canvasRef = useRef(null)
  const [selectedCourse, setSelectedCourse] = useState('all')
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

  // 硅晶圆十六进制微粒
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

  // 当前选中星域下的节点与连线筛选
  const activeNodes = useMemo(() => {
    if (selectedCourse === 'all') return GALAXY_NODES
    return GALAXY_NODES.filter(n => n.courseId === selectedCourse)
  }, [selectedCourse])

  const activeEdges = useMemo(() => {
    if (selectedCourse === 'all') return GALAXY_EDGES
    return GALAXY_EDGES.filter(e => e.domain === selectedCourse)
  }, [selectedCourse])

  // 找出与当前选中节点直接相连的邻居节点 ID 集合（用于景深聚焦高亮）
  const connectedNodeIds = useMemo(() => {
    if (!selectedNode) return new Set()
    const set = new Set([selectedNode.id])
    GALAXY_EDGES.forEach(e => {
      if (e.source === selectedNode.id) set.add(e.target)
      if (e.target === selectedNode.id) set.add(e.source)
    })
    return set
  }, [selectedNode])

  // 统计指标
  const stats = useMemo(() => {
    const total = activeNodes.length
    const weak = activeNodes.filter(n => n.status === 'weak').length
    const mastered = activeNodes.filter(n => n.status === 'mastered').length
    const core = activeNodes.filter(n => n.status === 'core').length
    const coverage = Math.round(((mastered + weak) / Math.max(1, total)) * 100)
    return { total, edges: activeEdges.length, weak, mastered, core, coverage }
  }, [activeNodes, activeEdges])

  // 切换学科星图时的平滑运镜飞入
  const handleSelectDomain = (domainId) => {
    setSelectedCourse(domainId)
    setSelectedNode(null)
    const cam = cameraRef.current

    if (domainId === 'all') {
      cam.targetRotX = 0.2
      cam.targetRotY = -0.3
      cam.targetZoom = 1.05
      cam.panX = 0
      cam.panY = 0
    } else {
      const clusterNodes = GALAXY_NODES.filter(n => n.courseId === domainId)
      if (clusterNodes.length) {
        const avgX = clusterNodes.reduce((acc, n) => acc + n.x, 0) / clusterNodes.length
        const avgY = clusterNodes.reduce((acc, n) => acc + n.y, 0) / clusterNodes.length
        const avgZ = clusterNodes.reduce((acc, n) => acc + n.z, 0) / clusterNodes.length

        const targetRotY = Math.atan2(avgX, avgZ)
        const rxz = Math.hypot(avgX, avgZ)
        const targetRotX = Math.atan2(avgY, rxz)

        let diffY = (targetRotY - (cam.rotY % (Math.PI * 2)))
        while (diffY > Math.PI) diffY -= Math.PI * 2
        while (diffY < -Math.PI) diffY += Math.PI * 2

        cam.targetRotY = cam.rotY + diffY
        cam.targetRotX = targetRotX
        cam.targetZoom = 1.55
        cam.panX = 0
        cam.panY = 0
      }
    }
  }

  // 3D 渲染核心循环
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

      // 自转：未选中且非拖拽时缓速自转
      if (autoRotate && !cam.isDragging && !selectedNode) {
        cam.targetRotY += 0.0018
      }

      // 弹性插值平滑阻尼
      cam.rotX += (cam.targetRotX - cam.rotX) * 0.08
      cam.rotY += (cam.targetRotY - cam.rotY) * 0.08
      cam.zoom += (cam.targetZoom - cam.zoom) * 0.08

      // 1. 清空画布
      ctx.fillStyle = '#060a12'
      ctx.fillRect(0, 0, width, height)

      // 绘制微观芯片电路辐射背光
      const bgGlow = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width * 0.7)
      bgGlow.addColorStop(0, selectedNode ? 'rgba(8, 20, 38, 0.85)' : 'rgba(10, 25, 47, 0.75)')
      bgGlow.addColorStop(0.5, 'rgba(6, 15, 30, 0.45)')
      bgGlow.addColorStop(1, '#060a12')
      ctx.fillStyle = bgGlow
      ctx.fillRect(0, 0, width, height)

      const cosX = Math.cos(cam.rotX)
      const sinX = Math.sin(cam.rotX)
      const cosY = Math.cos(cam.rotY)
      const sinY = Math.sin(cam.rotY)
      const fov = 460
      const cameraDist = 480

      // 3D 投影函数 (支持为选中的节点注入“向前跃升”物理视差)
      const project = (x, y, z, isPopForward = false) => {
        const x1 = x * cosY - z * sinY
        const z1 = z * cosY + x * sinY
        const y2 = y * cosX - z1 * sinX
        let z2 = z1 * cosX + y * sinX + cameraDist

        // 核心视觉增强：如果此节点被点中，给它一个朝向相机的向前跃升偏移量（Pop Forward -90）
        if (isPopForward) {
          z2 = Math.max(40, z2 - 90)
        }

        const scale = (fov / Math.max(10, z2)) * cam.zoom
        const screenX = width / 2 + x1 * scale + cam.panX
        const screenY = height / 2 + y2 * scale + cam.panY

        return { screenX, screenY, scale, zDepth: z2, x1, y2, z1 }
      }

      // 2. 绘制微观晶圆坐标刻度环
      ctx.save()
      ctx.strokeStyle = selectedNode ? 'rgba(5, 150, 105, 0.04)' : 'rgba(5, 150, 105, 0.08)'
      ctx.lineWidth = 1
      const ringSteps = [90, 170, 250]
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

      // 3. 绘制指令代码微粒 (选中时微粒自动压暗形成景深)
      ctx.save()
      ctx.font = '9px ui-monospace, monospace'
      cyberGridParticles.forEach(p => {
        const proj = project(p.x, p.y, p.z)
        if (proj.zDepth > 20) {
          const particleAlpha = selectedNode ? p.alpha * 0.35 : p.alpha
          ctx.fillStyle = `rgba(100, 116, 139, ${particleAlpha * Math.min(1, proj.scale)})`
          ctx.fillText(p.label, proj.screenX, proj.screenY)
        }
      })
      ctx.restore()

      // 4. 2D 投影与节点映射
      const projectedNodes = GALAXY_NODES.map(node => {
        const isSelected = selectedNode && selectedNode.id === node.id
        // 关键：选中的节点在投影层发生向前跃升 (Pop Forward)！
        const proj = project(node.x, node.y, node.z, isSelected)
        const isBelong = selectedCourse === 'all' || node.courseId === selectedCourse
        return { ...node, ...proj, isBelong }
      })

      const nodeMap = new Map()
      projectedNodes.forEach(n => nodeMap.set(n.id, n))

      // 5. 绘制学科总线连线与数据包脉冲
      const busSignals = busSignalsRef.current
      GALAXY_EDGES.forEach((edge, edgeIdx) => {
        const src = nodeMap.get(edge.source)
        const tgt = nodeMap.get(edge.target)
        if (!src || !tgt) return

        if (selectedCourse !== 'all' && edge.domain !== selectedCourse) {
          return
        }

        if (filterWeakOnly && src.status !== 'weak' && tgt.status !== 'weak') {
          return
        }

        const isHighlight =
          (hoveredNode && (hoveredNode.id === src.id || hoveredNode.id === tgt.id)) ||
          (selectedNode && (selectedNode.id === src.id || selectedNode.id === tgt.id))

        // 景深聚焦：如果有选中节点且本条总线与其无关，则强力压暗虚化
        const isDimmed = selectedNode && !isHighlight

        const avgDepth = (src.zDepth + tgt.zDepth) / 2
        let depthAlpha = Math.max(0.12, Math.min(0.85, 1 - avgDepth / 850))
        if (isDimmed) depthAlpha *= 0.25

        ctx.save()
        ctx.beginPath()
        ctx.moveTo(src.screenX, src.screenY)
        ctx.lineTo(tgt.screenX, tgt.screenY)

        if (edge.isCross) {
          ctx.setLineDash([4, 4])
        }

        if (isHighlight) {
          ctx.strokeStyle = '#059669'
          ctx.lineWidth = 2.8
          ctx.shadowColor = '#10b981'
          ctx.shadowBlur = 12
        } else {
          ctx.strokeStyle = edge.isCross
            ? `rgba(148, 163, 184, ${depthAlpha * 0.4})`
            : `rgba(71, 85, 105, ${depthAlpha * 0.55})`
          ctx.lineWidth = Math.max(0.8, 1.2 * ((src.scale + tgt.scale) / 2))
          ctx.shadowBlur = 0
        }
        ctx.stroke()
        ctx.restore()

        const sig = busSignals[edgeIdx]
        if (sig && (selectedCourse === 'all' || edge.domain === selectedCourse) && !isDimmed) {
          sig.progress = (sig.progress + sig.speed) % 1.0
          const packetX = src.screenX + (tgt.screenX - src.screenX) * sig.progress
          const packetY = src.screenY + (tgt.screenY - src.screenY) * sig.progress
          ctx.beginPath()
          ctx.arc(packetX, packetY, isHighlight ? 2.8 : 1.5, 0, Math.PI * 2)
          ctx.fillStyle = isHighlight ? '#34d399' : 'rgba(16, 185, 129, 0.65)'
          ctx.fill()
        }
      })

      // 6. 按深度排序：选中的节点强制排在最顶层（绘制在最后面，绝对遮盖一切背景球）
      projectedNodes.sort((a, b) => {
        if (selectedNode) {
          if (a.id === selectedNode.id) return 1
          if (b.id === selectedNode.id) return -1
        }
        return b.zDepth - a.zDepth
      })

      // 7. 绘制微架构芯片核 (带景深虚化与前置高光冲击)
      const now = Date.now()
      projectedNodes.forEach(node => {
        if (selectedCourse !== 'all' && !node.isBelong) {
          return
        }

        const isHovered = hoveredNode && hoveredNode.id === node.id
        const isSelected = selectedNode && selectedNode.id === node.id
        const isConnected = selectedNode && connectedNodeIds.has(node.id)
        const isFaded = filterWeakOnly && node.status !== 'weak'

        // 景深对比：非选中且非相连的节点透明度压低，形成强烈的“被选中节点在前、其他在深处后退”的层次感
        let baseAlpha = 1.0
        if (isSelected) {
          baseAlpha = 1.0
        } else if (selectedNode) {
          baseAlpha = isConnected ? 0.6 : 0.14 // 深度景深虚化
        } else {
          baseAlpha = isFaded ? 0.2 : Math.max(0.35, Math.min(1.0, 1.35 - node.zDepth / 750))
        }

        let themeColor = '#10b981'
        let glowColor = 'rgba(16, 185, 129, 0.45)'
        if (node.courseId === 'os') {
          themeColor = '#06b6d4'
          glowColor = 'rgba(6, 182, 212, 0.45)'
        } else if (node.courseId === 'net') {
          themeColor = '#8b5cf6'
          glowColor = 'rgba(139, 92, 246, 0.45)'
        } else if (node.courseId === 'ds') {
          themeColor = '#f59e0b'
          glowColor = 'rgba(245, 158, 11, 0.45)'
        } else if (node.courseId === 'ai') {
          themeColor = '#f43f5e'
          glowColor = 'rgba(244, 63, 94, 0.45)'
        }

        if (node.status === 'weak') {
          glowColor = 'rgba(239, 68, 68, 0.55)'
        }

        // 视觉效果上有强烈的往前面感觉：选中的节点半径明显放大 (2.1 倍)
        const radius = Math.max(4.5, node.size * node.scale * (isSelected ? 2.1 : isHovered ? 1.3 : 1.0))

        // A. 选中的节点专属：前置立体向外脉冲扩散光波 (Pulse Ripple Waves)
        if (isSelected) {
          const wavePhase = (now % 1600) / 1600 // 0 -> 1
          const waveRadius = radius * 1.4 + wavePhase * (radius * 1.8)
          const waveAlpha = (1 - wavePhase) * 0.75
          ctx.save()
          ctx.beginPath()
          ctx.arc(node.screenX, node.screenY, waveRadius, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(52, 211, 153, ${waveAlpha})`
          ctx.lineWidth = 2
          ctx.stroke()
          ctx.restore()
        }

        // B. 外层高能发光光晕
        if (!isFaded && (!selectedNode || isSelected || isConnected)) {
          const glowMultiplier = isSelected ? 4.5 : 3.4
          const glowGrad = ctx.createRadialGradient(
            node.screenX, node.screenY, radius * 0.15,
            node.screenX, node.screenY, radius * glowMultiplier
          )
          glowGrad.addColorStop(0, isSelected ? 'rgba(52, 211, 153, 0.85)' : glowColor)
          glowGrad.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = glowGrad
          ctx.beginPath()
          ctx.arc(node.screenX, node.screenY, radius * glowMultiplier, 0, Math.PI * 2)
          ctx.fill()
        }

        // C. 芯片外层引脚刻度圈 (Hardware Pins & Radar Ring)
        ctx.save()
        ctx.strokeStyle = isSelected ? '#ffffff' : themeColor
        ctx.globalAlpha = baseAlpha * (isSelected ? 0.95 : 0.7)
        ctx.lineWidth = isSelected ? 2.2 : 1.0
        ctx.beginPath()
        ctx.arc(node.screenX, node.screenY, radius * 1.45, 0, Math.PI * 2)
        ctx.stroke()

        const pinCount = isSelected ? 8 : 6
        for (let p = 0; p < pinCount; p++) {
          const pAngle = (p / pinCount) * Math.PI * 2 + (isSelected ? (now / 2000) : 0) // 选中时微引脚缓慢自旋
          const pinR1 = radius * 1.45
          const pinR2 = radius * (isSelected ? 1.85 : 1.75)
          ctx.beginPath()
          ctx.moveTo(node.screenX + Math.cos(pAngle) * pinR1, node.screenY + Math.sin(pAngle) * pinR1)
          ctx.lineTo(node.screenX + Math.cos(pAngle) * pinR2, node.screenY + Math.sin(pAngle) * pinR2)
          ctx.stroke()
        }
        ctx.restore()

        // D. 核心实心球 (立体球体质感)
        ctx.save()
        const sphereGrad = ctx.createRadialGradient(
          node.screenX - radius * 0.3, node.screenY - radius * 0.3, radius * 0.1,
          node.screenX, node.screenY, radius
        )
        if (isSelected) {
          sphereGrad.addColorStop(0, '#ffffff')
          sphereGrad.addColorStop(0.5, '#34d399')
          sphereGrad.addColorStop(1, '#059669')
        } else {
          sphereGrad.addColorStop(0, '#ffffff')
          sphereGrad.addColorStop(0.4, themeColor)
          sphereGrad.addColorStop(1, themeColor)
        }
        ctx.beginPath()
        ctx.arc(node.screenX, node.screenY, radius, 0, Math.PI * 2)
        ctx.fillStyle = sphereGrad
        ctx.globalAlpha = baseAlpha
        ctx.fill()
        ctx.restore()

        // E. 选中时的高能 HUD 准星
        if (isSelected) {
          ctx.save()
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 2.4
          ctx.shadowColor = '#10b981'
          ctx.shadowBlur = 14
          const reticleSize = radius * 2.2
          const d = 10
          ctx.beginPath()
          ctx.moveTo(node.screenX - reticleSize, node.screenY - reticleSize + d)
          ctx.lineTo(node.screenX - reticleSize, node.screenY - reticleSize)
          ctx.lineTo(node.screenX - reticleSize + d, node.screenY - reticleSize)
          ctx.moveTo(node.screenX + reticleSize - d, node.screenY - reticleSize)
          ctx.lineTo(node.screenX + reticleSize, node.screenY - reticleSize)
          ctx.lineTo(node.screenX + reticleSize, node.screenY - reticleSize + d)
          ctx.moveTo(node.screenX - reticleSize, node.screenY + reticleSize - d)
          ctx.lineTo(node.screenX - reticleSize, node.screenY + reticleSize)
          ctx.lineTo(node.screenX - reticleSize + d, node.screenY + reticleSize)
          ctx.moveTo(node.screenX + reticleSize - d, node.screenY + reticleSize)
          ctx.lineTo(node.screenX + reticleSize, node.screenY + reticleSize)
          ctx.lineTo(node.screenX + reticleSize, node.screenY + reticleSize - d)
          ctx.stroke()
          ctx.restore()
        }

        // F. 文本标签 (选中的节点文字放大且带有微光)
        if (!isFaded && (isSelected || !selectedNode || isConnected)) {
          const fontSize = isSelected ? 15 : Math.max(10, Math.min(13, 11.5 * node.scale))
          ctx.save()
          ctx.font = `${isSelected ? 'bold ' : ''}${fontSize}px Inter, sans-serif`
          ctx.fillStyle = isSelected ? '#ffffff' : isHovered ? '#34d399' : `rgba(226, 232, 240, ${baseAlpha * 0.95})`

          const codeText = `[${node.code}] `
          ctx.font = `800 ${Math.max(9, fontSize - 2)}px ui-monospace, monospace`
          ctx.fillStyle = isSelected ? '#34d399' : themeColor
          ctx.fillText(codeText, node.screenX + radius + 8, node.screenY + 4)

          const codeWidth = ctx.measureText(codeText).width
          ctx.font = `${isSelected ? 'bold ' : ''}${fontSize}px Inter, sans-serif`
          ctx.fillStyle = isSelected ? '#ffffff' : `rgba(226, 232, 240, ${baseAlpha * 0.95})`
          if (isSelected) {
            ctx.shadowColor = '#059669'
            ctx.shadowBlur = 8
          }
          ctx.fillText(node.name, node.screenX + radius + 8 + codeWidth, node.screenY + 4)
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
  }, [autoRotate, filterWeakOnly, hoveredNode, selectedNode, selectedCourse, cyberGridParticles, connectedNodeIds])

  // 鼠标交互
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

      activeNodes.forEach(node => {
        const isSelected = selectedNode && selectedNode.id === node.id
        const x1 = node.x * cosY - node.z * sinY
        const z1 = node.z * cosY + node.x * sinY
        const y2 = node.y * cosX - z1 * sinX
        let z2 = z1 * cosX + node.y * sinX + 480
        if (isSelected) z2 = Math.max(40, z2 - 90)

        const scale = (460 / Math.max(10, z2)) * cam.zoom
        const screenX = rect.width / 2 + x1 * scale + cam.panX
        const screenY = rect.height / 2 + y2 * scale + cam.panY
        const dist = Math.hypot(mouseX - screenX, mouseY - screenY)

        if (dist < (isSelected ? 32 : 24)) {
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
  // 核心：点击节点时不仅正对居中，更要让镜头强力推近、产生震撼的“往前跃升”体感
  // ========================================================
  const handleClick = () => {
    if (hoveredNode) {
      setSelectedNode(hoveredNode)
      setAutoRotate(false)

      const cam = cameraRef.current
      const nx = hoveredNode.x
      const ny = hoveredNode.y
      const nz = hoveredNode.z

      // 正对居中的理想角度
      const idealRotY = Math.atan2(nx, nz)
      const rxz = Math.hypot(nx, nz)
      const idealRotX = Math.atan2(ny, rxz)

      let diffY = (idealRotY - (cam.rotY % (Math.PI * 2)))
      while (diffY > Math.PI) diffY -= Math.PI * 2
      while (diffY < -Math.PI) diffY += Math.PI * 2

      cam.targetRotY = cam.rotY + diffY
      cam.targetRotX = idealRotX
      // 关键：将缩放目标大幅拉近（从原本平缓推至 1.85），产生强烈的穿梭飞入特写感！
      cam.targetZoom = 1.85
      cam.panX = 0
      cam.panY = 0
    }
  }

  const resetCamera = () => {
    handleSelectDomain('all')
    setAutoRotate(true)
  }

  return (
    <div className="knowledge-galaxy-page">
      {/* 学科独立星图切换 Tab 栏 */}
      <div className="galaxy-discipline-bar">
        <div className="discipline-bar-title">
          <span className="dot-live" />
          <span>学科星域模式：</span>
        </div>
        <div className="discipline-pills-wrap">
          {COURSE_DOMAINS.map((domain) => (
            <button
              key={domain.id}
              type="button"
              className={`discipline-pill ${selectedCourse === domain.id ? 'active' : ''}`}
              onClick={() => handleSelectDomain(domain.id)}
            >
              <span className="pill-dot" style={{ background: domain.color }} />
              <span className="pill-name">{domain.name}</span>
              <span className="pill-count">{domain.count} 考点</span>
            </button>
          ))}
        </div>
      </div>

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

        {/* 顶部控制栏 */}
        <div className="galaxy-top-controls">
          <div className="galaxy-title-badge">
            <span className="live-pulse-dot" />
            <span className="hub-code-badge">
              {selectedCourse === 'all' ? '408 全景星图' : COURSE_DOMAINS.find(d => d.id === selectedCourse)?.name}
            </span>
            <strong>{stats.total} 核心微架构芯片核 · {stats.edges} 条因果总线</strong>
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
              星系复位 ⌖
            </button>
          </div>
        </div>

        {/* 底部 3D 空间漫游交互提示 */}
        <div className="galaxy-bottom-hints">
          <span>拖拽: 自由旋转当前星图</span>
          <span className="dot">•</span>
          <span>滚轮: 深度缩放</span>
          <span className="dot">•</span>
          <span>点击上方学科: 独立切换对应学科星域</span>
          <span className="dot">•</span>
          <span className="highlight-hint">点击任意考点: 正面立体推近置顶</span>
        </div>

        {/* 右侧微架构学情与当前学科图例面板 */}
        <div className="galaxy-right-stat-panel">
          <div className="panel-box-header">
            <h4>
              {selectedCourse === 'all' ? '408 考情全景画像' : `${COURSE_DOMAINS.find(d => d.id === selectedCourse)?.tag} 独立星图`}
            </h4>
            <span className="panel-badge">因果图谱就绪</span>
          </div>

          <div className="stat-metric-rows">
            <div className="metric-row">
              <span>学科考点</span>
              <strong>{stats.total} 个</strong>
            </div>
            <div className="metric-row">
              <span>因果时钟总线</span>
              <strong>{stats.edges} 条</strong>
            </div>
            <div className="metric-row">
              <span>统考覆盖率</span>
              <strong className="green">{stats.coverage}%</strong>
            </div>
          </div>

          <div className="divider-line" />

          {/* 学科领域色彩图例 */}
          <div className="legend-block">
            <span className="legend-title">当前拓扑因果关系说明：</span>
            <p style={{ margin: '4px 0 8px', fontSize: '11px', color: '#94a3b8', lineHeight: 1.45 }}>
              {selectedCourse === 'all'
                ? '已清除跨学科盲目乱连，仅保留具有直接因果时序与真题大题交集的关键总线。'
                : `当前仅高亮 ${COURSE_DOMAINS.find(d => d.id === selectedCourse)?.name} 内部硬件/协议推演拓扑。`}
            </p>
            <div className="legend-row">
              <span className="legend-dot red" />
              <span>薄弱待攻坚 ({stats.weak})</span>
            </div>
            <div className="legend-row">
              <span className="legend-dot green" />
              <span>已掌握/已仿真 ({stats.mastered})</span>
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
