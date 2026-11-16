export const experiments = [
  { id: 'attention', courseId: 'ai', category: '人工智能', title: 'Transformer 注意力机制', description: '跟随一句话走过 Token、Q/K/V 和注意力权重，再自由切换层与注意力头。', accent: '#7467e8', icon: 'AI', concepts: ['多头注意力', 'Softmax', 'Transformer'] },
  { id: 'neural-network', courseId: 'ai', category: '人工智能', title: '神经网络前向传播', description: '调整输入、权重、偏置与激活函数，看见数值如何逐层流向最终预测。', accent: '#7467e8', icon: 'NN', concepts: ['神经元', '权重与偏置', '激活函数'] },
  { id: 'gradient-descent', courseId: 'ai', category: '人工智能', title: '梯度下降与反向传播', description: '沿损失函数的坡度反向计算梯度，逐步更新参数并观察模型拟合数据。', accent: '#7467e8', icon: 'GD', concepts: ['损失函数', '梯度', '反向传播'] },
  { id: 'convolution', courseId: 'ai', category: '人工智能', title: '卷积神经网络', description: '让卷积核在像素矩阵上滑动，观察局部计算如何生成特征图。', accent: '#7467e8', icon: 'CNN', concepts: ['卷积核', '特征图', '池化'] },
  { id: 'dijkstra', courseId: 'data-structures', category: '数据结构与算法', title: 'Dijkstra 最短路径', description: '逐步观察候选节点、距离松弛和最终最短路径的形成过程。', accent: '#159a83', icon: '图', concepts: ['图', '贪心算法', '路径规划'] },
  { id: 'sorting', courseId: 'data-structures', category: '数据结构与算法', title: '排序算法对比', description: '让冒泡、选择、插入和快速排序同步运行，对比过程与操作次数。', accent: '#159a83', icon: '序', concepts: ['比较排序', '复杂度', '分治'] },
  { id: 'tree-traversal', courseId: 'data-structures', category: '数据结构与算法', title: '二叉树遍历', description: '同步观察当前节点、递归栈或队列，以及前中后序和层序访问结果。', accent: '#159a83', icon: '树', concepts: ['二叉树', '递归', '队列'] },
  { id: 'stack-queue', courseId: 'data-structures', category: '数据结构与算法', title: '栈与队列', description: '通过进出动画理解 LIFO、FIFO、栈顶、队首与典型应用。', accent: '#159a83', icon: 'SQ', concepts: ['栈', '队列', '线性结构'] },
  { id: 'scheduling', courseId: 'operating-systems', category: '操作系统', title: '进程生命周期与 CPU 调度', description: '透视进程五状态模型（创建、就绪、运行、阻塞、终止）与 PCB 转换，对比 FCFS、SJF 与时间片轮转。', accent: '#ee6c4d', icon: 'OS', concepts: ['五状态模型', 'PCB', '就绪与阻塞', '调度算法', '甘特图'] },
  { id: 'page-replacement', courseId: 'operating-systems', category: '操作系统', title: '页面置换算法', description: '同步比较 FIFO、LRU 与 OPT 的命中、缺页和页面淘汰过程。', accent: '#ee6c4d', icon: 'VM', concepts: ['虚拟内存', '缺页', '页面置换'] },
  { id: 'sync', courseId: 'operating-systems', category: '操作系统', title: '进程同步与互斥', description: '模拟经典生产者-消费者模型，通过信号量 P/V 操作与互斥锁理解并发同步、临界区与阻塞唤醒。', accent: '#ee6c4d', icon: 'SYNC', concepts: ['信号量', 'P/V操作', '生产者消费者', '临界区'] },
  { id: 'deadlock', courseId: 'operating-systems', category: '操作系统', title: '死锁：预防、避免与解除', description: '透视死锁四个必要条件，实操银行家算法安全性检查，动态化简资源分配图并破除死锁环。', accent: '#ee6c4d', icon: 'DL', concepts: ['死锁四条件', '银行家算法', '死锁预防', '资源分配图'] },
  { id: 'memory-partition', courseId: 'operating-systems', category: '操作系统', title: '内存分区管理', description: '比较首次、最佳与最坏适应算法，观察空闲分区和外部碎片。', accent: '#ee6c4d', icon: 'MEM', concepts: ['连续分配', '空闲分区', '外部碎片'] },
  { id: 'tcp-connection', courseId: 'networks', category: '计算机网络', title: 'TCP 三次握手与四次挥手', description: '逐包观察序号、确认号以及客户端和服务器状态变化。', accent: '#2f8fe3', icon: 'TCP', concepts: ['连接建立', '连接释放', '状态机'] },
  { id: 'sliding-window', courseId: 'networks', category: '计算机网络', title: '滑动窗口与拥塞控制', description: '调整接收窗口和丢包位置，观察发送窗口、拥塞窗口与重传。', accent: '#2f8fe3', icon: 'WIN', concepts: ['滑动窗口', '慢启动', '拥塞避免'] },
  { id: 'ip-subnet', courseId: 'networks', category: '计算机网络', title: 'IP 地址与子网划分', description: '拖动 CIDR 前缀边界，实时计算网络地址、广播地址和可用主机范围。', accent: '#2f8fe3', icon: 'IP', concepts: ['IPv4', 'CIDR', '子网掩码'] },
  { id: 'dns-resolution', courseId: 'networks', category: '计算机网络', title: 'DNS 域名解析', description: '跟随查询依次访问缓存、递归解析器、根、顶级与权威服务器。', accent: '#2f8fe3', icon: 'DNS', concepts: ['递归查询', '迭代查询', '缓存'] },
  { id: 'instruction-cycle', courseId: 'computer-organization', category: '计算机组成原理', title: '指令执行周期', description: '观察 PC、MAR、MDR、IR、ACC 在取指、译码、执行和写回中的变化。', accent: '#c88724', icon: 'CPU', concepts: ['取指', '译码', '执行'] },
  { id: 'cpu-pipeline', courseId: 'computer-organization', category: '计算机组成原理', title: 'CPU 流水线', description: '逐周期观察五级流水重叠执行，以及数据冒险、前递、停顿和分支冲刷。', accent: '#c88724', icon: 'PIPE', concepts: ['五级流水', '数据冒险', '控制冒险'] },
  { id: 'cache-mapping', courseId: 'computer-organization', category: '计算机组成原理', title: 'Cache 映射', description: '拆分地址的 Tag、索引和偏移，比较直接、全相联与二路组相联的命中过程。', accent: '#c88724', icon: 'CACHE', concepts: ['局部性', '地址映射', '命中率'] },
  { id: 'number-representation', courseId: 'computer-organization', category: '计算机组成原理', title: '补码与浮点数', description: '逐位拆解 8 位补码运算、溢出判断和 IEEE 754 单精度字段。', accent: '#c88724', icon: '01', concepts: ['二进制补码', '溢出', 'IEEE 754'] },
  { id: 'bplus-tree', courseId: 'databases', category: '数据库系统', title: 'B+ 树索引', description: '逐键插入并观察叶节点与内部节点分裂，跟踪点查询和叶链范围扫描。', accent: '#b45b9b', icon: 'B+', concepts: ['多路平衡树', '索引页', '范围查询'] },
  { id: 'sql-join', courseId: 'databases', category: '数据库系统', title: 'SQL 连接算法', description: '逐步比较嵌套循环、哈希连接与排序合并的数据流和执行代价。', accent: '#b45b9b', icon: 'JOIN', concepts: ['嵌套循环', '哈希连接', '排序合并'] },
  { id: 'transactions', courseId: 'databases', category: '数据库系统', title: '事务与并发控制', description: '并排执行事务，观察脏读、不可重复读、丢失更新、锁等待与死锁。', accent: '#b45b9b', icon: 'TX', concepts: ['隔离级别', '锁', 'MVCC'] },
  { id: 'normalization', courseId: 'databases', category: '数据库系统', title: '关系模型与范式', description: '沿函数依赖把选课大表逐步分解到第二、第三范式并消除数据异常。', accent: '#b45b9b', icon: '3NF', concepts: ['函数依赖', '第二范式', '第三范式'] },
]

export const courses = [
  {
    id: 'ai', number: '01', title: '人工智能', english: 'Artificial Intelligence', icon: 'AI', accent: '#7467e8',
    description: '从神经网络到大语言模型，看见数据如何经过层层计算变成模型的判断。',
    tags: ['机器学习', '深度学习', '大模型'],
    points: [
      point('Transformer 注意力机制', '理解 Token、Q/K/V、多头注意力与上下文汇聚', 'attention', ['Attention', 'QKV', 'Softmax']),
      point('神经网络前向传播', '观察输入如何穿过神经元、激活函数和隐藏层', 'neural-network', ['神经元', '激活函数']),
      point('梯度下降与反向传播', '看见损失如何沿计算图反向传递并更新参数', 'gradient-descent', ['梯度', '损失函数']),
      point('卷积神经网络', '拖动卷积核，观察图像特征图的形成过程', 'convolution', ['卷积核', '特征图']),
    ],
  },
  {
    id: 'data-structures', number: '02', title: '数据结构与算法', english: 'Data Structures & Algorithms', icon: 'DS', accent: '#159a83',
    description: '把抽象的结构、路径和复杂度变成可以逐步执行、对比和复盘的过程。',
    tags: ['图', '树', '排序'],
    points: [
      point('Dijkstra 最短路径', '逐轮选择节点并完成距离松弛，找到最短路线', 'dijkstra', ['图算法', '贪心', '最短路']),
      point('排序算法对比', '同时运行冒泡、选择、插入与快速排序', 'sorting', ['排序', '复杂度']),
      point('二叉树遍历', '逐步观察前序、中序、后序与层序遍历', 'tree-traversal', ['树', '递归']),
      point('栈与队列', '用进出动画理解 LIFO、FIFO 和实际应用', 'stack-queue', ['线性结构', '入栈出栈']),
    ],
  },
  {
    id: 'operating-systems', number: '03', title: '操作系统', english: 'Operating Systems', icon: 'OS', accent: '#ee6c4d',
    description: '观察进程、内存与资源在系统内部如何被分配、等待和调度。',
    tags: ['进程', '内存', '并发'],
    points: [
      point('进程生命周期与 CPU 调度', '透视进程五状态转换与 PCB，对比 FCFS、SJF 与时间片轮转', 'scheduling', ['进程五状态', 'PCB', '就绪队列', '调度算法', '甘特图']),
      point('页面置换算法', '模拟 FIFO、LRU 和 OPT 的缺页过程', 'page-replacement', ['虚拟内存', '缺页']),
      point('进程同步与互斥', '经典生产者-消费者模型与信号量 P/V 操作', 'sync', ['信号量', 'PV操作', '互斥锁']),
      point('死锁：预防与解除', '死锁四条件、银行家算法与资源图破环', 'deadlock', ['死锁四条件', '银行家算法', '死锁解除']),
      point('内存分区管理', '首次、邻近、最佳与最坏适应四大算法及紧凑技术', 'memory-partition', ['动态分区', '首次适应', '外部碎片', '内存紧凑']),
    ],
  },
  {
    id: 'networks', number: '04', title: '计算机网络', english: 'Computer Networks', icon: 'NET', accent: '#2f8fe3',
    description: '跟随一个数据包穿过协议栈，在动画中理解连接、传输与路由。',
    tags: ['TCP/IP', '路由', '协议'],
    points: [
      point('TCP 三次握手与四次挥手', '逐包观察连接建立与释放时的状态变化', 'tcp-connection', ['TCP', '连接']),
      point('滑动窗口与拥塞控制', '调整窗口大小，观察发送速率和重传变化', 'sliding-window', ['窗口', '拥塞']),
      point('IP 地址与子网划分', '拖动掩码，直观看见网络号与主机号边界', 'ip-subnet', ['IP', '子网掩码']),
      point('DNS 域名解析', '跟随请求访问本地、根、顶级与权威服务器', 'dns-resolution', ['DNS', '递归查询']),
    ],
  },
  {
    id: 'computer-organization', number: '05', title: '计算机组成原理', english: 'Computer Organization', icon: 'CPU', accent: '#c88724',
    description: '深入 CPU、存储器和指令系统，看见硬件部件如何协同执行程序。',
    tags: ['CPU', '缓存', '指令'],
    points: [
      point('指令执行周期', '观察取指、译码、执行与写回的完整数据通路', 'instruction-cycle', ['指令', '数据通路']),
      point('CPU 流水线', '比较流水与非流水执行，处理结构、数据和控制冒险', 'cpu-pipeline', ['流水线', '冒险']),
      point('Cache 映射', '输入地址，观察直接、全相联和组相联映射', 'cache-mapping', ['Cache', '局部性']),
      point('补码与浮点数', '逐位拆解补码运算和 IEEE 754 表示', 'number-representation', ['补码', '浮点数']),
    ],
  },
  {
    id: 'databases', number: '06', title: '数据库系统', english: 'Database Systems', icon: 'DB', accent: '#b45b9b',
    description: '用动态表格和索引结构理解查询、事务与数据库内部执行过程。',
    tags: ['SQL', '索引', '事务'],
    points: [
      point('B+ 树索引', '插入和查找数据，观察节点分裂与索引路径', 'bplus-tree', ['B+树', '索引']),
      point('SQL 连接算法', '可视化嵌套循环、哈希连接与排序合并', 'sql-join', ['JOIN', '执行计划']),
      point('事务与并发控制', '并排执行事务，观察锁、隔离级别和异常', 'transactions', ['事务', '锁']),
      point('关系模型与范式', '拆分数据表，识别依赖并消除更新异常', 'normalization', ['范式', '函数依赖']),
    ],
  },
]

function point(title, description, experimentId, keywords) {
  return { title, description, experimentId, keywords, available: Boolean(experimentId) }
}

export function courseForExperiment(experimentId) {
  const experiment = experiments.find((item) => item.id === experimentId)
  return courses.find((course) => course.id === experiment?.courseId)
}
