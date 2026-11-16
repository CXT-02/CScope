import React, { useRef, useEffect, useState, useMemo } from 'react'

// 25 个底层计算机核心知识节点在 3D 空间中的坐标与学情状态
const GALAXY_NODES = [
  // 计算机组成原理 (Cluster 1 - 硬件微架构)
  { id: 'n_cpu_pipe', name: 'CPU 五级流水线', course: '计算机组成原理', courseId: 'arch', status: 'weak', x: -140, y: 70, z: -40, size: 14, labId: 'cpu-pipeline', desc: '包含 IF/ID/EX/MEM/WB 阶段，重点解决 RAW 数据相关与分支控制冒险。' },
  { id: 'n_hazard', name: 'Load-Use 数据冒险', course: '计算机组成原理', courseId: 'arch', status: 'weak', x: -180, y: 120, z: -10, size: 10, labId: 'cpu-pipeline', desc: '数据在 MEM 阶段末尾产生，无法仅靠旁路转发消除，必须硬件插入空泡。' },
  { id: 'n_cache', name: 'Cache 组相联映射', course: '计算机组成原理', courseId: 'arch', status: 'core', x: -110, y: -40, z: 90, size: 13, labId: 'cache-mapping', desc: '主存地址划分为 Tag、Set Index、Offset，是 408 计算大题绝对核心。' },
  { id: 'n_thrash', name: 'Cache 冲突颠簸', course: '计算机组成原理', courseId: 'arch', status: 'weak', x: -150, y: -90, z: 120, size: 9, labId: 'cache-mapping', desc: '交替访问映射到同一 Cache 行的变量导致命中率跌至 0%，需通过组相联化解。' },
  { id: 'n_inst_cycle', name: '指令周期时序', course: '计算机组成原理', courseId: 'arch', status: 'mastered', x: -70, y: 110, z: -80, size: 11, labId: 'instruction-cycle', desc: '取指、间址、执行、中断四阶段总线数据流流转。' },
  { id: 'n_ieee754', name: 'IEEE 754 浮点表示', course: '计算机组成原理', courseId: 'arch', status: 'unvisited', x: -90, y: -110, z: -60, size: 10, labId: 'number-representation', desc: '阶码移码、尾数规格化与隐藏位 1.M 计算。' },

  // 操作系统 (Cluster 2 - 内核并发与存储)
  { id: 'n_deadlock', name: '死锁银行家算法', course: '操作系统', courseId: 'os', status: 'weak', x: 20, y: 140, z: 70, size: 14, labId: 'deadlock', desc: '利用安全性序列算法动态评估资源分配安全性，破坏循环等待。' },
  { id: 'n_deadlock_cond', name: '死锁四必要条件', course: '操作系统', courseId: 'os', status: 'mastered', x: 60, y: 190, z: 40, size: 9, labId: 'deadlock', desc: '互斥、占有且等待、不可剥夺、循环等待。' },
  { id: 'n_sync', name: '进程同步与 Peterson', course: '操作系统', courseId: 'os', status: 'core', x: 80, y: 90, z: -100, size: 12, labId: 'sync', desc: '通过 flag 标志与 turn 谦让变量解决两进程临界区互斥。' },
  { id: 'n_sched', name: 'CPU 调度算法', course: '操作系统', courseId: 'os', status: 'mastered', x: -10, y: 50, z: -140, size: 10, labId: 'scheduling', desc: 'FCFS、SJF、高响应比优先与时间片轮转的周转时间推演。' },
  { id: 'n_page_rep', name: '虚拟页式存储与置换', course: '操作系统', courseId: 'os', status: 'core', x: 90, y: -60, z: 80, size: 13, labId: 'page-replacement', desc: 'OPT、FIFO、LRU 与 Clock 算法缺页中断率与抖动现象。' },
  { id: 'n_mem_part', name: '内存动态分区分配', course: '操作系统', courseId: 'os', status: 'mastered', x: 50, y: -130, z: 30, size: 9, labId: 'memory-partition', desc: '首次适应、最佳适应与最坏适应算法碎片分析。' },

  // 计算机网络 (Cluster 3 - 传输层与协议栈)
  { id: 'n_tcp_conn', name: 'TCP 三次握手', course: '计算机网络', courseId: 'net', status: 'core', x: 130, y: -20, z: -80, size: 13, labId: 'tcp-connection', desc: '全双工序列号同步与历史失效 SYN 报文终止机制。' },
  { id: 'n_tcp_close', name: 'TCP 四次挥手 2MSL', course: '计算机网络', courseId: 'net', status: 'mastered', x: 170, y: 30, z: -60, size: 10, labId: 'tcp-connection', desc: 'TIME_WAIT 状态等待 2MSL 确保最后一个 ACK 可靠到达。' },
  { id: 'n_sliding_win', name: '滑动窗口与拥塞控制', course: '计算机网络', courseId: 'net', status: 'weak', x: 150, y: -100, z: -20, size: 13, labId: 'sliding-window', desc: '慢开始、拥塞避免、快重传与快恢复时序模型。' },
  { id: 'n_ip_subnet', name: 'IP 子网掩码与 CIDR', course: '计算机网络', courseId: 'net', status: 'mastered', x: 110, y: -150, z: -90, size: 10, labId: 'ip-subnet', desc: '网络前缀划分子网与路由表最长前缀匹配。' },
  { id: 'n_dns', name: 'DNS 递归与迭代解析', course: '计算机网络', courseId: 'net', status: 'unvisited', x: 90, y: 40, z: -150, size: 9, labId: 'dns-resolution', desc: '本地域名服务器向根、顶级与权威服务器逐级查询。' },

  // 数据结构与算法 (Cluster 4 - 树、图与高效结构)
  { id: 'n_dijkstra', name: 'Dijkstra 最短路径', course: '数据结构与算法', courseId: 'ds', status: 'core', x: -50, y: -40, z: -120, size: 13, labId: 'dijkstra', desc: '贪心策略逐步松弛非负权值边，时间复杂度 O(V^2) 或堆优化 O(E log V)。' },
  { id: 'n_tree_rot', name: 'AVL 平衡二叉树旋转', course: '数据结构与算法', courseId: 'ds', status: 'weak', x: 30, y: -40, z: -40, size: 12, labId: 'tree-traversal', desc: 'LL、RR、LR、RL 四种失衡旋转操作与最少结点递推。' },
  { id: 'n_sorting', name: '经典内部排序算法', course: '数据结构与算法', courseId: 'ds', status: 'mastered', x: -100, y: 20, z: -30, size: 11, labId: 'sorting', desc: '快排基准划分、堆排序下沉与归并排序稳定性对比。' },
  { id: 'n_stack_queue', name: '栈与队列时序模拟', course: '数据结构与算法', courseId: 'ds', status: 'mastered', x: -20, y: -80, z: -80, size: 9, labId: 'stack-queue', desc: '卡特兰数出栈序列与循环队列假溢出取模。' },

  // 数据库与前沿AI (Cluster 5)
  { id: 'n_bplus_tree', name: 'B+ 树索引结构', course: '数据库系统', courseId: 'db', status: 'core', x: -20, y: 100, z: 120, size: 12, labId: 'bplus-tree', desc: '叶子结点双向链表与多路平衡，专为磁盘 I/O 块设计。' },
  { id: 'n_transactions', name: 'ACID 事务与并发', course: '数据库系统', courseId: 'db', status: 'unvisited', x: -60, y: 150, z: 90, size: 10, labId: 'transactions', desc: '两段锁协议 2PL 与可串行化冲突等价调度。' },
  { id: 'n_attention', name: 'Transformer 注意力', course: '人工智能与前沿', courseId: 'ai', status: 'core', x: 70, y: -110, z: 130, size: 14, labId: 'attention', desc: 'Q、K、V 矩阵点积注意力与 Softmax 上下文关联加权。' },
  { id: 'n_neural_net', name: '多层感知机与梯度下降', course: '人工智能与前沿', courseId: 'ai', status: 'unvisited', x: 120, y: -70, z: 160, size: 10, labId: 'gradient-descent', desc: '链式法则反向传播与损失函数超平面收敛。' }
]

// 3D 知识语义关联边 (Semantic Edges)
const GALAXY_EDGES = [
  // 计组内关联
  ['n_cpu_pipe', 'n_hazard'],
  ['n_cpu_pipe', 'n_inst_cycle'],
  ['n_cpu_pipe', 'n_cache'],
  ['n_cache', 'n_thrash'],
  ['n_cache', 'n_page_rep'], // 计组 Cache 关联到 操作系统 虚存页面置换！
  ['n_inst_cycle', 'n_ieee754'],

  // 操作系统内关联
  ['n_deadlock', 'n_deadlock_cond'],
  ['n_deadlock', 'n_sync'],
  ['n_sync', 'n_sched'],
  ['n_page_rep', 'n_mem_part'],
  ['n_sched', 'n_cpu_pipe'], // 调度关联到硬件流水线！

  // 计算机网络内关联
  ['n_tcp_conn', 'n_tcp_close'],
  ['n_tcp_conn', 'n_sliding_win'],
  ['n_sliding_win', 'n_ip_subnet'],
  ['n_ip_subnet', 'n_dns'],
  ['n_tcp_conn', 'n_sync'], // 网络握手与进程同步语义相通！

  // 数据结构与算法内关联
  ['n_tree_rot', 'n_dijkstra'],
  ['n_tree_rot', 'n_bplus_tree'], // AVL 树过渡到 B+ 树！
  ['n_sorting', 'n_stack_queue'],
  ['n_dijkstra', 'n_ip_subnet'], // 路由最短路径关联到计网！

  // 数据库与 AI
  ['n_bplus_tree', 'n_transactions'],
  ['n_attention', 'n_neural_net'],
  ['n_attention', 'n_cache'] // 注意力热度矩阵比喻 Cache 命中局部性！
]

export default function KnowledgeGalaxy3D({ onOpenExperiment }) {
  const canvasRef = useRef(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [autoRotate, setAutoRotate] = useState(true)
  const [filterWeakOnly, setFilterWeakOnly] = useState(false)
  const [searchWord, setSearchWord] = useState('')

  // 3D 摄像机与视口状态
  const cameraRef = useRef({
    rotX: 0.25,
    rotY: -0.35,
    zoom: 1.0,
    panX: 0,
    panY: 0,
    isDragging: false,
    dragButton: 0,
    lastMouseX: 0,
    lastMouseY: 0,
    targetRotX: 0.25,
    targetRotY: -0.35,
    targetZoom: 1.0
  })

  // 3D 空间微粒背景 (Star Dust)
  const starDust = useMemo(() => {
    const stars = []
    for (let i = 0; i < 180; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 800,
        z: (Math.random() - 0.5) * 800,
        size: Math.random() * 1.8 + 0.5,
        alpha: Math.random() * 0.6 + 0.2
      })
    }
    return stars
  }, [])

  // 统计指标
  const stats = useMemo(() => {
    const total = GALAXY_NODES.length
    const weak = GALAXY_NODES.filter(n => n.status === 'weak').length
    const mastered = GALAXY_NODES.filter(n => n.status === 'mastered').length
    const core = GALAXY_NODES.filter(n => n.status === 'core').length
    const coverage = Math.round(((mastered + weak) / total) * 100)
    return { total, edges: GALAXY_EDGES.length, weak, mastered, core, coverage }
  }, [])

  // 3D 渲染核心循环
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    // 适配高清屏幕 DPI
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

      // 自转插值
      if (autoRotate && !cam.isDragging) {
        cam.targetRotY += 0.0025
      }

      // 弹性平滑逼近目标视角 (Smooth Slerp)
      cam.rotX += (cam.targetRotX - cam.rotX) * 0.1
      cam.rotY += (cam.targetRotY - cam.rotY) * 0.1
      cam.zoom += (cam.targetZoom - cam.zoom) * 0.1

      // 清空画布 (深邃浩瀚黑夜星空渐变)
      ctx.fillStyle = '#060a12'
      ctx.fillRect(0, 0, width, height)

      // 绘制背景微弱深空星云光晕
      const radGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.6)
      radGrad.addColorStop(0, 'rgba(15, 23, 42, 0.8)')
      radGrad.addColorStop(0.5, 'rgba(10, 15, 28, 0.5)')
      radGrad.addColorStop(1, '#060a12')
      ctx.fillStyle = radGrad
      ctx.fillRect(0, 0, width, height)

      // 3D 旋转变换矩阵
      const cosX = Math.cos(cam.rotX)
      const sinX = Math.sin(cam.rotX)
      const cosY = Math.cos(cam.rotY)
      const sinY = Math.sin(cam.rotY)

      const fov = 420 // 视角透视焦距
      const cameraDist = 480 // 摄像机距离

      // 3D 坐标投影函数
      const project = (x, y, z) => {
        // 先绕 Y 轴旋转
        const x1 = x * cosY - z * sinY
        const z1 = z * cosY + x * sinY
        // 再绕 X 轴旋转
        const y2 = y * cosX - z1 * sinX
        const z2 = z1 * cosX + y * sinX + cameraDist

        // 透视除法
        const scale = fov / Math.max(10, z2) * cam.zoom
        const screenX = width / 2 + x1 * scale + cam.panX
        const screenY = height / 2 + y2 * scale + cam.panY

        return { screenX, screenY, scale, zDepth: z2 }
      }

      // 1. 绘制背景星尘
      starDust.forEach(star => {
        const p = project(star.x, star.y, star.z)
        if (p.zDepth > 20) {
          ctx.beginPath()
          ctx.arc(p.screenX, p.screenY, Math.max(0.6, star.size * p.scale), 0, Math.PI * 2)
          ctx.fillStyle = `rgba(180, 200, 240, ${star.alpha * Math.min(1, p.scale)})`
          ctx.fill()
        }
      })

      // 2. 映射所有知识点节点到 2D 屏幕并排序（Z-Sorting 确保遮挡关系）
      const projectedNodes = GALAXY_NODES.map(node => {
        const proj = project(node.x, node.y, node.z)
        return { ...node, ...proj }
      })

      const nodeMap = new Map()
      projectedNodes.forEach(n => nodeMap.set(n.id, n))

      // 3. 绘制 3D 空间光纤语义连线 (Edges)
      GALAXY_EDGES.forEach(([sourceId, targetId]) => {
        const src = nodeMap.get(sourceId)
        const tgt = nodeMap.get(targetId)
        if (!src || !tgt) return

        // 若处于“只看薄弱链路”模式，且两者都不是薄弱节点，则淡化隐藏
        if (filterWeakOnly && src.status !== 'weak' && tgt.status !== 'weak') {
          return
        }

        const isHighlight =
          (hoveredNode && (hoveredNode.id === src.id || hoveredNode.id === tgt.id)) ||
          (selectedNode && (selectedNode.id === src.id || selectedNode.id === tgt.id))

        const avgDepth = (src.zDepth + tgt.zDepth) / 2
        const depthAlpha = Math.max(0.08, Math.min(0.7, 1 - avgDepth / 850))

        ctx.beginPath()
        ctx.moveTo(src.screenX, src.screenY)
        ctx.lineTo(tgt.screenX, tgt.screenY)

        if (isHighlight) {
          ctx.strokeStyle = '#38bdf8'
          ctx.lineWidth = 2.2
          ctx.shadowColor = '#0284c7'
          ctx.shadowBlur = 8
        } else {
          ctx.strokeStyle = `rgba(148, 163, 184, ${depthAlpha * 0.45})`
          ctx.lineWidth = Math.max(0.8, 1.2 * ((src.scale + tgt.scale) / 2))
          ctx.shadowBlur = 0
        }
        ctx.stroke()
        ctx.shadowBlur = 0
      })

      // 按深度由远及近绘制节点 (Painter's Algorithm)
      projectedNodes.sort((a, b) => b.zDepth - a.zDepth)

      // 4. 绘制发光知识星球粒子与光晕
      projectedNodes.forEach(node => {
        const isHovered = hoveredNode && hoveredNode.id === node.id
        const isSelected = selectedNode && selectedNode.id === node.id

        // 若筛选薄弱节点且不是，则半透明淡出
        const isFaded = filterWeakOnly && node.status !== 'weak'
        const baseAlpha = isFaded ? 0.2 : Math.max(0.3, Math.min(1.0, 1.3 - node.zDepth / 750))

        // 颜色映射
        let coreColor = '#fbbf24' // 核心默认金黄
        let glowColor = 'rgba(251, 191, 36, 0.4)'
        if (node.status === 'weak') {
          coreColor = '#f43f5e' // 薄弱鲜红
          glowColor = 'rgba(244, 63, 94, 0.55)'
        } else if (node.status === 'mastered') {
          coreColor = '#10b981' // 已掌握翠绿
          glowColor = 'rgba(16, 185, 129, 0.5)'
        } else if (node.status === 'unvisited') {
          coreColor = '#94a3b8' // 未访问空心
          glowColor = 'rgba(148, 163, 184, 0.3)'
        }

        const radius = Math.max(3.5, node.size * node.scale * (isHovered || isSelected ? 1.4 : 1.0))

        // 外层发光光晕 (Glow Halo)
        if (!isFaded) {
          const glowGrad = ctx.createRadialGradient(
            node.screenX, node.screenY, radius * 0.2,
            node.screenX, node.screenY, radius * 3.2
          )
          glowGrad.addColorStop(0, glowColor)
          glowGrad.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = glowGrad
          ctx.beginPath()
          ctx.arc(node.screenX, node.screenY, radius * 3.2, 0, Math.PI * 2)
          ctx.fill()
        }

        // 核心实心球体 (带立体高光)
        ctx.beginPath()
        ctx.arc(node.screenX, node.screenY, radius, 0, Math.PI * 2)
        ctx.fillStyle = coreColor
        ctx.globalAlpha = baseAlpha
        ctx.fill()
        ctx.globalAlpha = 1.0

        // 选中或悬停时的光环脉冲圈
        if (isHovered || isSelected) {
          ctx.beginPath()
          ctx.arc(node.screenX, node.screenY, radius * 1.8, 0, Math.PI * 2)
          ctx.strokeStyle = '#38bdf8'
          ctx.lineWidth = 1.8
          ctx.stroke()
        }

        // 绘制知识点文字标签 (近大远小清晰度调节)
        if (!isFaded && (node.zDepth < 600 || isHovered || isSelected)) {
          const fontSize = Math.max(10, Math.min(14, 12 * node.scale))
          ctx.font = `${isHovered || isSelected ? 'bold' : 'normal'} ${fontSize}px Inter, sans-serif`
          ctx.fillStyle = isHovered || isSelected ? '#ffffff' : `rgba(226, 232, 240, ${baseAlpha * 0.85})`
          ctx.fillText(node.name, node.screenX + radius + 6, node.screenY + 4)
        }
      })

      animId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [autoRotate, filterWeakOnly, hoveredNode, selectedNode, starDust])

  // 鼠标交互事件：拖动旋转、滚轮缩放、点击选中
  const handleMouseDown = (e) => {
    const cam = cameraRef.current
    cam.isDragging = true
    cam.dragButton = e.button // 0: 左键旋转, 2: 右键平移
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
        // 左键：旋转
        cam.targetRotY += deltaX * 0.008
        cam.targetRotX += deltaY * 0.008
      } else if (cam.dragButton === 2) {
        // 右键：平移视口
        cam.panX += deltaX
        cam.panY += deltaY
      }
    } else {
      // 鼠标悬停拾取判定 (Raycasting 2D Hit Test)
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      let hit = null
      GALAXY_NODES.forEach(node => {
        // 计算当前投影坐标判断距离
        const cosX = Math.cos(cam.rotX)
        const sinX = Math.sin(cam.rotX)
        const cosY = Math.cos(cam.rotY)
        const sinY = Math.sin(cam.rotY)
        const x1 = node.x * cosY - node.z * sinY
        const z1 = node.z * cosY + node.x * sinY
        const y2 = node.y * cosX - z1 * sinX
        const z2 = z1 * cosX + node.y * sinX + 480
        const scale = 420 / Math.max(10, z2) * cam.zoom
        const screenX = rect.width / 2 + x1 * scale + cam.panX
        const screenY = rect.height / 2 + y2 * scale + cam.panY
        const dist = Math.hypot(mouseX - screenX, mouseY - screenY)

        if (dist < 18) {
          hit = node
        }
      })
      setHoveredNode(hit)
    }
  }

  const handleMouseUp = () => {
    cameraRef.current.isDragging = false
  }

  // 滚轮缩放
  const handleWheel = (e) => {
    e.preventDefault()
    const cam = cameraRef.current
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88
    cam.targetZoom = Math.max(0.4, Math.min(2.8, cam.targetZoom * zoomFactor))
  }

  // 点击选中并平滑飞行聚焦到该知识点
  const handleClick = (e) => {
    if (hoveredNode) {
      setSelectedNode(hoveredNode)
      // 计算相机让该节点转到正中间
      const targetAngleY = -Math.atan2(hoveredNode.x, hoveredNode.z)
      cameraRef.current.targetRotY = targetAngleY
      cameraRef.current.targetRotX = 0.1
      cameraRef.current.targetZoom = 1.35
    }
  }

  // 视角重置
  const resetCamera = () => {
    const cam = cameraRef.current
    cam.targetRotX = 0.25
    cam.targetRotY = -0.35
    cam.targetZoom = 1.0
    cam.panX = 0
    cam.panY = 0
    setSelectedNode(null)
  }

  return (
    <div className="knowledge-galaxy-page">
      {/* 3D 星空主视窗 */}
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

        {/* 顶部工具栏 (与参考图一致) */}
        <div className="galaxy-top-controls">
          <div className="galaxy-title-badge">
            <span className="live-pulse-dot" />
            <strong>思维可视化 · 408 知识神经网络</strong>
            <span className="node-count-tag">{stats.total} 节点 · {stats.edges} 关系</span>
          </div>

          <div className="galaxy-action-buttons">
            <button
              type="button"
              className={`galaxy-btn ${filterWeakOnly ? 'active' : ''}`}
              onClick={() => setFilterWeakOnly(!filterWeakOnly)}
            >
              {filterWeakOnly ? '显示全图谱' : '只看薄弱链路 🔴'}
            </button>
            <button
              type="button"
              className={`galaxy-btn ${autoRotate ? 'active' : ''}`}
              onClick={() => setAutoRotate(!autoRotate)}
            >
              {autoRotate ? '暂停自转 ⏸' : '开启自转 ⟲'}
            </button>
            <button
              type="button"
              className="galaxy-btn reset"
              onClick={resetCamera}
            >
              复位视角 ⌖
            </button>
          </div>
        </div>

        {/* 底部 3D 空间漫游交互提示 (参考图样式) */}
        <div className="galaxy-bottom-hints">
          <span>拖动: 自由旋转 3D 星空</span>
          <span className="dot">•</span>
          <span>滚轮: 缩放距离</span>
          <span className="dot">•</span>
          <span>右键: 平移画布</span>
          <span className="dot">•</span>
          <span>点击节点: 摄像机平滑飞入聚焦</span>
        </div>

        {/* 右侧浮动学情面板 (参考图样式) */}
        <div className="galaxy-right-stat-panel">
          <div className="panel-box-header">
            <h4>图谱规模与学情</h4>
            <span className="panel-badge">实时运算</span>
          </div>

          <div className="stat-metric-rows">
            <div className="metric-row">
              <span>知识节点</span>
              <strong>{stats.total}</strong>
            </div>
            <div className="metric-row">
              <span>语义关联</span>
              <strong>{stats.edges}</strong>
            </div>
            <div className="metric-row">
              <span>图谱覆盖率</span>
              <strong className="green">{stats.coverage}%</strong>
            </div>
          </div>

          <div className="divider-line" />

          {/* 状态图例 */}
          <div className="legend-block">
            <span className="legend-title">研习状态图例：</span>
            <div className="legend-row">
              <span className="legend-dot red" />
              <span>薄弱待攻坚 ({stats.weak})</span>
            </div>
            <div className="legend-row">
              <span className="legend-dot gold" />
              <span>408 核心必考 ({stats.core})</span>
            </div>
            <div className="legend-row">
              <span className="legend-dot green" />
              <span>已推演掌握 ({stats.mastered})</span>
            </div>
            <div className="legend-row">
              <span className="legend-dot gray" />
              <span>未探索基石</span>
            </div>
          </div>
        </div>

        {/* 选中节点的空间飞入详情浮窗 (Node Inspector Card) */}
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
              <span className={`status-tag ${selectedNode.status}`}>
                {selectedNode.status === 'weak' ? '薄弱考点' : selectedNode.status === 'mastered' ? '已掌握' : '核心必考'}
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
                🔬 启动该考点微观仿真推演 →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
