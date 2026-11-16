export const EXAM_QUESTIONS = [
  // ================= 计算机组成原理 =================
  {
    id: 'q-cache-01',
    courseId: 'computer-organization',
    courseName: '计算机组成原理',
    experimentId: 'cache-mapping',
    source: '2020年 408 统考真题 第14题',
    topic: 'Cache 直接映射与冲突缺失计算',
    difficulty: '中等',
    question: '假设某计算机 Cache 共有 4 个 Cache 行，采用直接映射方式（行号 = 块号 mod 4）。初始时 Cache 全部为空。若 CPU 依次访问的主存块号序列为：0, 4, 0, 4, 8, 4，则在该访问序列中发生 Cache 缺失（Miss）的次数是？',
    options: [
      '3 次',
      '4 次',
      '5 次',
      '6 次'
    ],
    answer: 3, // D. 6 次
    explanation: '由于采用直接映射且 Cache 仅有 4 行，块号 0、4、8 对 4 取模的结果均为 0，全部被映射到 Cache 行 0！访问 0 缺失装入行0；访问 4 缺失替换行0；访问 0 再次缺失替换行0；访问 4 缺失替换行0；访问 8 缺失替换行0；访问 4 再次缺失。每次访问都发生严重的“冲突颠簸 (Conflict Miss Thrashing)”，6 次访问全部缺失！',
    labTip: '你可以在 Cache 实验中选择“直接映射”，输入该序列观察行 0 的反复颠簸淘汰动画。'
  },
  {
    id: 'q-cache-02',
    courseId: 'computer-organization',
    courseName: '计算机组成原理',
    experimentId: 'cache-mapping',
    source: '2017年 408 统考真题 第13题',
    topic: '组相联映射 Cache 组地址与标记位数计算',
    difficulty: '高频经典',
    question: '已知某计算机主存按字节编址，地址位数共 32 位。Cache 采用 4 路组相联映射方式，每个 Cache 行大小为 64 字节，Cache 总容量为 64 KB。则该主存地址结构中，主存字块标记（Tag）的位数是？',
    options: [
      '18 位',
      '20 位',
      '22 位',
      '24 位'
    ],
    answer: 0, // A. 18 位
    explanation: '① 行内偏移位（Offset）：每个 Cache 行 64 字节 = 2^6 字节，占 6 位。\n② 组数计算：Cache 总容量 64 KB = 2^16 字节，总行数 = 64 KB / 64 B = 1024 行。因为是 4 路组相联（每组 4 行），所以总组数 = 1024 / 4 = 256 组 = 2^8 组，组地址（Set）占 8 位。\n③ 标记位（Tag）= 32 - 8 - 6 = 18 位。',
    labTip: '在 Cache 实验中切换到“组相联映射”，查看地址解析器如何将 32 位二进制切分为 Tag、Set、Offset。'
  },
  {
    id: 'q-pipe-01',
    courseId: 'computer-organization',
    courseName: '计算机组成原理',
    experimentId: 'cpu-pipeline',
    source: '2021年 408 统考真题 第15题',
    topic: 'CPU 五级流水线写后读 (RAW) 数据冒险',
    difficulty: '中等',
    question: '在经典 RISC 五级流水线（IF 取指、ID 译码/读寄存器、EX 执行、MEM 访存、WB 写回寄存器）处理器中，假设未配置硬件前递旁路（No Forwarding）。指令序列为：\nI1: ADD R1, R2, R3\nI2: SUB R4, R1, R5\n为保证 I2 能正确读取到 I1 计算出的 R1 新值，硬件或编译器必须在 I1 与 I2 之间插入多少个时钟周期的停顿气泡（NOP）？',
    options: [
      '1 个周期',
      '2 个周期',
      '3 个周期',
      '0 个周期'
    ],
    answer: 1, // B. 2 个周期
    explanation: 'I1 在第 5 个时钟周期（WB 阶段）才能将运算结果正式写入寄存器堆。而 I2 若紧跟其后，在第 3 个周期（ID 阶段）就急需读取 R1。此时 R1 尚未写回，产生写后读（RAW）数据冲突！必须在两条指令间插入 2 个时钟周期的空操作气泡（NOP），让 I2 的 ID 阶段延后到第 5 周期读到最新值。',
    labTip: '可在 CPU 流水线实验中查看第 4 幕“写后读 RAW 数据冲突与气泡”时空流水图。'
  },
  {
    id: 'q-pipe-02',
    courseId: 'computer-organization',
    courseName: '计算机组成原理',
    experimentId: 'cpu-pipeline',
    source: '2019年 408 统考真题 第16题',
    topic: '流水线控制冒险与分支预测代价',
    difficulty: '核心考点',
    question: '在 5 级流水线中，条件转移指令在第 3 阶段（EX 执行阶段末尾）才能计算出分支转移是否成功及目标地址。若处理器采用“预测分支不转移（Predict Not Taken）”的静态预测策略，且该分支指令最终被判定为“转移成功（Taken）”，则流水线需要丢弃已被错误预取的后续指令，产生的时钟周期惩罚（Branch Penalty）是？',
    options: [
      '1 个周期',
      '2 个周期',
      '3 个周期',
      '4 个周期'
    ],
    answer: 1, // B. 2 个周期
    explanation: '当分支指令在 EX 阶段（第 3 周期）确认需要跳转时，由于流水线的持续推入，其后续的两条指令已经分别进入了 ID 阶段和 IF 阶段。因为预测失败，这两条已预取的指令必须被冲刷（Flush）清空为 NOP 气泡，因此带来的时钟周期性能惩罚是 2 个周期。',
    labTip: '在 CPU 流水线实验中观察控制冲突演示，直观理解流水线冲刷气泡产生的原因。'
  },
  {
    id: 'q-number-01',
    courseId: 'computer-organization',
    courseName: '计算机组成原理',
    experimentId: 'number-representation',
    source: '2020年 408 统考真题 第13题',
    topic: '定点数 8 位补码加法与溢出标志 OF',
    difficulty: '易错陷阱',
    question: '假设某 8 位寄存器采用补码表示有符号整数。变量 x = 0x64（十进制 +100），y = 0x3C（十进制 +60）。当执行加法 x + y 后，ALU 输出的 8 位十六进制机器码以及溢出标志 OF 分别是？',
    options: [
      '0xA0，OF = 1',
      '0xA0，OF = 0',
      '0x20，OF = 1',
      '0x20，OF = 0'
    ],
    answer: 0, // A
    explanation: 'x = 0x64 = 0110 0100B，y = 0x3C = 0011 1100B。两者相加二进制：0110 0100 + 0011 1100 = 1010 0000B = 0xA0。最高位变为 1（负数）。两个正数相加结果为负数，发生溢出（超出 8 位有符号补码范围 [-128, +127]）。此时溢出标志 OF = 1。',
    labTip: '在补码与浮点数实验中输入 100 与 60，观察两个正数相加时硬件触发溢出警告的动画。'
  },
  {
    id: 'q-float-01',
    courseId: 'computer-organization',
    courseName: '计算机组成原理',
    experimentId: 'number-representation',
    source: '2018年 408 统考真题 第14题',
    topic: 'IEEE 754 单精度浮点数规格化表示',
    difficulty: '综合计算',
    question: '根据 IEEE 754 单精度（32 位）浮点数标准，阶码 E 采用移码表示，偏置常数 Bias = 127。若某单精度浮点数的十六进制机器码为 0xC0A00000，则该浮点数对应的真值十进制数值是？',
    options: [
      '-2.5',
      '-5.0',
      '-1.25',
      '-10.0'
    ],
    answer: 1, // B. -5.0
    explanation: '将 0xC0A00000 转换为二进制：1 10000001 01000000000000000000000。\n① 符号位 S = 1，表示负数；\n② 阶码 E = 10000001B = 129，真实指数 e = E - 127 = 129 - 127 = 2；\n③ 尾数 M = 0100...B，规格化隐藏最高位 1，有效尾数 = 1.01B = 1 + 1/4 = 1.25；\n真值 = -1 × 1.25 × 2^2 = -1 × 1.25 × 4 = -5.0。',
    labTip: '在 IEEE 754 浮点数实验中输入 -5.0，动态观察符号位、阶码移码和尾数的二进制切片。'
  },

  // ================= 操作系统 =================
  {
    id: 'q-page-01',
    courseId: 'operating-systems',
    courseName: '操作系统',
    experimentId: 'page-replacement',
    source: '2019年 408 统考真题 第24题',
    topic: '虚拟内存页面置换与 Belady 异常',
    difficulty: '中等',
    question: '某进程在内存中分配了 3 个物理块，采用先进先出（FIFO）页面置换算法。进程的页面访问走向序列为：1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5。假设初始时 3 个物理块皆为空，则整个执行过程中共发生的缺页中断次数为？',
    options: [
      '7 次',
      '8 次',
      '9 次',
      '10 次'
    ],
    answer: 2, // C. 9 次
    explanation: 'FIFO 算法淘汰最早进入内存的页面。依次模拟：访问 1(缺), 2(缺), 3(缺)；装满 [1,2,3]；访问 4(缺，淘汰1得[2,3,4])；访问 1(缺，淘汰2得[3,4,1])；访问 2(缺，淘汰3得[4,1,2])；访问 5(缺，淘汰4得[1,2,5])；访问 1(命中)；访问 2(命中)；访问 3(缺，淘汰1得[2,5,3])；访问 4(缺，淘汰2得[5,3,4])；访问 5(命中)。总共缺页 3(初始)+6(置换)=9次。',
    labTip: '在页面置换实验中载入该访问串，直观查看 FIFO 与 LRU 物理页槽的动态更替。'
  },
  {
    id: 'q-page-02',
    courseId: 'operating-systems',
    courseName: '操作系统',
    experimentId: 'page-replacement',
    source: '2021年 408 统考真题 第25题',
    topic: 'LRU 最近最久未使用页面置换',
    difficulty: '经典考点',
    question: '系统为某进程分配 3 个内存块，初始为空，页面引用串为：2, 3, 2, 1, 5, 2, 4, 5, 3, 2, 5, 2。若采用 LRU（最近最久未使用）置换算法，当访问第 7 个页面（页面 4）时，被淘汰置换出的页面是？',
    options: [
      '页面 1',
      '页面 2',
      '页面 3',
      '页面 5'
    ],
    answer: 0, // A. 页面 1
    explanation: '追踪物理块内的驻留页面：\n访问 2 -> [2]\n访问 3 -> [2, 3]\n访问 2 -> 命中，刷新 2 的最新访问时间，驻留页按近期访问排序为 [3, 2]\n访问 1 -> [3, 2, 1]\n访问 5 -> 块满缺页，淘汰最久未用的 3，装入 5，排序为 [2, 1, 5]\n访问 2 -> 命中，刷新 2，排序为 [1, 5, 2]\n访问 4 -> 块满缺页，当前最久未被访问的是排在头部的页面 1！因此淘汰页面 1。',
    labTip: '在页面置换实验中观察 LRU 栈在命中时如何自动将命中块提升至栈顶。'
  },
  {
    id: 'q-deadlock-01',
    courseId: 'operating-systems',
    courseName: '操作系统',
    experimentId: 'deadlock',
    source: '2023年 408 统考真题 第26题',
    topic: '死锁避免与银行家算法安全性本质',
    difficulty: '核心概念',
    question: '在操作系统死锁避免算法（银行家算法）中，关于“安全状态”与“死锁”的逻辑关系，下列叙述中唯一正确的是？',
    options: [
      '安全序列必然是唯一的，有且仅有一种分配次序',
      '只要系统当前处于安全状态，就必然存在至少一条安全执行序列，系统绝不会陷入死锁',
      '只要进程请求的资源量小于系统剩余可用资源数，分配后系统一定处于安全状态',
      '处于不安全状态的系统最终必然会发生死锁'
    ],
    answer: 1, // B
    explanation: '安全状态的定义：系统能按某种顺序（即安全序列，可能存在多条）为每个进程分配所需资源，直至最大需求满足。只要系统处于安全状态，就绝不可能发生死锁；不安全状态只是存在死锁的风险（并非一定会死锁）。银行家算法的核心思想就是：拒绝任何会导致系统滑向“不安全状态”的资源分配请求。',
    labTip: '在死锁实验中亲自运行一次银行家算法安全性检查，观察系统如何寻找安全推进序列。'
  },
  {
    id: 'q-deadlock-02',
    courseId: 'operating-systems',
    courseName: '操作系统',
    experimentId: 'deadlock',
    source: '2016年 408 统考真题 第27题',
    topic: '死锁产生的四个必要条件与预防死锁策略',
    difficulty: '基础理论',
    question: '破坏死锁产生四个必要条件之一是预防死锁的经典手段。在操作系统中，采用“资源有序分配法（按资源编号升序申请）”主要破坏的是死锁的哪一个必要条件？',
    options: [
      '互斥使用条件',
      '请求并保持条件',
      '不剥夺条件',
      '循环等待条件'
    ],
    answer: 3, // D. 循环等待条件
    explanation: '资源有序分配法规定：所有资源统一编号，进程必须严格按照编号递增的次序请求资源，同类资源一次性申请。这样无论有多少个进程并发，都不可能出现进程 A 占有低号等高号、而进程 B 占有高号等低号形成的闭环，彻底破坏了“循环等待条件 (Circular Wait)”。',
    labTip: '在死锁实验的“哲学家进餐”模型中，观察奇偶哲学家或有序取筷策略如何消除死锁环。'
  },
  {
    id: 'q-process-01',
    courseId: 'operating-systems',
    courseName: '操作系统',
    experimentId: 'process-sync',
    source: '2022年 408 统考真题 第23题',
    topic: '进程五状态模型与状态转换逻辑',
    difficulty: '易错概念',
    question: '在进程管理经典的“创建-就绪-执行-阻塞-终止”五状态模型中，下列关于进程状态跃迁的描述中，哪一项在正常操作系统运行机制下是绝不可能发生的？',
    options: [
      '执行态 ➔ 就绪态（例如分配的时间片耗尽）',
      '阻塞态 ➔ 就绪态（例如所等待的 I/O 操作完成）',
      '阻塞态 ➔ 执行态（例如获得所等待的临界互斥资源）',
      '执行态 ➔ 阻塞态（例如主动发起系统调用等待磁盘读取）'
    ],
    answer: 2, // C
    explanation: '阻塞态进程在等待的事件发生后（如 I/O 完成或资源就绪），只能先转移到【就绪态】，排入就绪队列等待 CPU 调度器重新分派！任何进程都绝对不能直接从【阻塞态】跳入【执行态】。',
    labTip: '在进程同步与状态模型实验中，观察进程在释放锁或时间片用尽时的五状态流动图。'
  },
  {
    id: 'q-sync-01',
    courseId: 'operating-systems',
    courseName: '操作系统',
    experimentId: 'process-sync',
    source: '2018年 408 统考真题 第25题',
    topic: 'PV 操作信号量取值与物理意义',
    difficulty: '核心理论',
    question: '用 PV 操作（Wait/Signal）控制 3 个进程互斥访问某类临界资源。若该互斥信号量当前的值为 -2，则表明当前处于等待该临界资源的阻塞进程个数是？',
    options: [
      '0 个',
      '1 个',
      '2 个',
      '3 个'
    ],
    answer: 2, // C. 2 个
    explanation: '信号量 S 的物理含义：\n- 当 S > 0 时，S 表示当前系统中可用资源的数量；\n- 当 S = 0 时，表示资源恰好分配完毕，且无等待进程；\n- 当 S < 0 时，S 的绝对值 |S| 严格代表在等待该资源的阻塞队列中的进程个数！因此当前 S = -2，表示有 2 个进程被阻塞等待。',
    labTip: '在进程同步实验中选择“生产者-消费者”，观察信号量 empty 和 full 从正值减到负值时的阻塞队列变化。'
  },

  // ================= 计算机网络 =================
  {
    id: 'q-tcp-01',
    courseId: 'networks',
    courseName: '计算机网络',
    experimentId: 'sliding-window',
    source: '2022年 408 统考真题 第36题',
    topic: 'TCP 拥塞控制慢启动与丢包超时恢复',
    difficulty: '高频经典',
    question: '某 TCP 连接的接收窗口 rwnd 为 16 KB，MSS 为 1 KB。当拥塞窗口 cwnd 增长到 4 KB 时发生超时（Timeout）。根据 TCP Tahoe/Reno 拥塞控制算法规范，超时发生后经过 3 个 RTT（往返时延），发送方此时的有效发送窗口大小为？',
    options: [
      '2 KB',
      '4 KB',
      '8 KB',
      '16 KB'
    ],
    answer: 1, // B. 4 KB
    explanation: '发生超时后，门限值 ssthresh 被设置为当前 cwnd 的一半，即 ssthresh = 4 KB / 2 = 2 KB；同时 cwnd 重新置为 1 个 MSS (1 KB) 开启慢启动。① 经过 1 个 RTT：cwnd 翻倍为 2 KB（达到门限）；② 经过 2 个 RTT：转入拥塞避免（加法增大），cwnd 增至 3 KB；③ 经过 3 个 RTT：cwnd 增至 4 KB。此时有效发送窗口 = min(rwnd: 16, cwnd: 4) = 4 KB。',
    labTip: '可在滑动窗口实验中选择超时丢包场景，亲眼观察 cwnd 骤降归 1 后重新爬升的过程。'
  },
  {
    id: 'q-tcp-02',
    courseId: 'networks',
    courseName: '计算机网络',
    experimentId: 'sliding-window',
    source: '2020年 408 统考真题 第38题',
    topic: 'TCP 三次握手与序号同步机制',
    difficulty: '必考基础',
    question: '主机甲与主机乙建立 TCP 连接。主机甲发送的 SYN 数据段中 seq = 1000。主机乙收到后回复 SYN+ACK 报文段，其确认号 ack 应该为？若乙在回复报文中的自身初始序号 seq = 2000，则甲发送的第三次握手 ACK 报文中，seq 与 ack 分别是？',
    options: [
      'ack = 1000；第三次握手 seq = 1001, ack = 2000',
      'ack = 1001；第三次握手 seq = 1001, ack = 2001',
      'ack = 1001；第三次握手 seq = 1000, ack = 2001',
      'ack = 1000；第三次握手 seq = 1001, ack = 2001'
    ],
    answer: 1, // B
    explanation: 'TCP 规范规定：SYN 报文段虽然不携带应用层数据，但必须消耗一个序号！因此乙回复确认号 ack = 1000 + 1 = 1001。乙自身的 SYN 也消耗一个序号（seq = 2000）。甲在第三次握手时发送普通的 ACK 确认段，其发送序号顺接为 seq = 1001，对乙的确认号 ack = 2000 + 1 = 2001。',
    labTip: '在 TCP 握手与全双工信道实验中，观察 Client 与 Server 之间 ISN 与 ACK 的序号时序交互。'
  },
  {
    id: 'q-subnet-01',
    courseId: 'networks',
    courseName: '计算机网络',
    experimentId: 'ip-subnet',
    source: '2018年 408 统考真题 第37题',
    topic: 'CIDR 无分类编址与广播地址推算',
    difficulty: '必考必会',
    question: '已知某台主机的 IPv4 地址为 192.168.10.37，其子网掩码配置为 255.255.255.240（即 /28 前缀）。该主机所在子网的直接广播地址（Direct Broadcast Address）是？',
    options: [
      '192.168.10.31',
      '192.168.10.47',
      '192.168.10.255',
      '192.168.10.48'
    ],
    answer: 1, // B. 192.168.10.47
    explanation: '子网掩码 /28 意味着主机号占 32 - 28 = 4 位，每个子网块大小为 2^4 = 16。对于最后一个字节 37：37 / 16 = 2 余 5，所在子网的网络地址为 16 × 2 = 32（即 192.168.10.32）。将主机位 4 位全置 1（加 15），得到该子网的直接广播地址为 32 + 15 = 47（即 192.168.10.47）。',
    labTip: '在 IP 子网实验中拖动 CIDR 滑块到 /28，输入该 IP 即可即时看到网络地址与广播地址的二进制切分。'
  },
  {
    id: 'q-subnet-02',
    courseId: 'networks',
    courseName: '计算机网络',
    experimentId: 'ip-subnet',
    source: '2021年 408 统考真题 第39题',
    topic: '路由表查找与最长前缀匹配原则 (LPM)',
    difficulty: '经典考点',
    question: '某路由器的路由表具有下列 4 个表项，当目的 IP 地址为 130.12.16.8 的数据报到达时，该路由器将匹配并选择哪一个下一跳端口？\n路由表项：\n① 130.12.0.0/16 ➔ 接口 1\n② 130.12.16.0/20 ➔ 接口 2\n③ 130.12.16.0/24 ➔ 接口 3\n④ 0.0.0.0/0 (默认路由) ➔ 接口 4',
    options: [
      '接口 1',
      '接口 2',
      '接口 3',
      '接口 4'
    ],
    answer: 2, // C. 接口 3
    explanation: '将目的地址 130.12.16.8 与各掩码逐一做与运算：\n① 匹配 /16：130.12.0.0（匹配，前缀长 16）\n② 匹配 /20：130.12.16.0（匹配，前缀长 20）\n③ 匹配 /24：130.12.16.0（匹配，前缀长 24）\n根据 IP 路由核心准则“最长前缀匹配原则 (Longest Prefix Match)”，掩码前缀越长，网络划分越精确，优先级越高！因此选择前缀最长 (/24) 的表项，从接口 3 转发。',
    labTip: '在 IP 子网实验中输入 130.12.16.8，对比 /16、/20 和 /24 的网络地址覆盖范围。'
  },
  {
    id: 'q-dns-01',
    courseId: 'networks',
    courseName: '计算机网络',
    experimentId: 'sliding-window',
    source: '2022年 408 统考真题 第34题',
    topic: 'DNS 域名解析与迭代查询时序',
    difficulty: '基础考点',
    question: '某主机通过本地域名服务器查询 www.example.com 的 IP 地址。假设本机缓存为空，本地域名服务器采用“迭代查询 (Iterative Query)”方式。在完成整个解析过程中，本地域名服务器最少需要向外网其它域名服务器依次发送几次 DNS 查询请求？',
    options: [
      '1 次',
      '2 次',
      '3 次',
      '4 次'
    ],
    answer: 2, // C. 3 次
    explanation: '在迭代查询模式下，本地域名服务器分别向：① 根域名服务器（获取 .com 顶级域服务器地址）；② .com 顶级域名服务器（获取 example.com 权限域名服务器地址）；③ example.com 权威域名服务器（获取 www 主机最终的 A 记录 IP）。因此最少需要依次发出 3 次外部 DNS 请求。',
    labTip: '结合网络分层传输概念，理解应用层 DNS 报文如何封装在 UDP/IP 数据段中端到端交互。'
  },

  // ================= 数据结构与算法 =================
  {
    id: 'q-tree-01',
    courseId: 'data-structures',
    courseName: '数据结构与算法',
    experimentId: 'tree-traversal',
    source: '2021年 408 统考真题 第06题',
    topic: '二叉树遍历：根据前序与中序反推后序序列',
    difficulty: '经典技巧',
    question: '已知一棵二叉树的前序遍历序列为 A, B, D, E, C, F，中序遍历序列为 D, B, E, A, F, C。则该二叉树的后序遍历序列是？',
    options: [
      'D, E, B, F, C, A',
      'D, B, E, F, C, A',
      'D, E, B, C, F, A',
      'E, D, B, F, C, A'
    ],
    answer: 0, // A. D, E, B, F, C, A
    explanation: '前序首元素为根 A；中序中 A 将树分为左子树 {D,B,E} 与右子树 {F,C}。对左子树：前序为 B,D,E（根为B），中序为 D,B,E（D为左，E为右），后序为 D,E,B。对右子树：前序为 C,F（根为C），中序为 F,C（F为左），后序为 F,C。最后访问根 A，整树后序遍历为 D, E, B, F, C, A。',
    labTip: '在二叉树实验中选择预设树，观察前序、中序、后序与层序遍历中根节点记录时机。'
  },
  {
    id: 'q-tree-02',
    courseId: 'data-structures',
    courseName: '数据结构与算法',
    experimentId: 'tree-traversal',
    source: '2019年 408 统考真题 第08题',
    topic: '平衡二叉树 (AVL) 最小节点数与失衡判断',
    difficulty: '经典技巧',
    question: '若一棵平衡二叉树（AVL 树）的高度为 5（根节点所在层次为第 1 层），则该平衡二叉树中包含的最少节点总数是？',
    options: [
      '10',
      '12',
      '14',
      '16'
    ],
    answer: 1, // B. 12
    explanation: 'AVL 树高度为 h 时的最少节点数满足斐波那契类递推公式：N(h) = N(h-1) + N(h-2) + 1。\n- N(1) = 1\n- N(2) = 2\n- N(3) = 1 + 2 + 1 = 4\n- N(4) = 4 + 2 + 1 = 7\n- N(5) = 7 + 4 + 1 = 12。\n故高度为 5 的 AVL 树最少拥有 12 个节点。',
    labTip: '在树遍历与平衡结构实验中，体会左右子树高度差绝对值不超过 1 的平衡因子约束。'
  },
  {
    id: 'q-sort-01',
    courseId: 'data-structures',
    courseName: '数据结构与算法',
    experimentId: 'tree-traversal',
    source: '2020年 408 统考真题 第10题',
    topic: '快速排序时间复杂度与最坏情况分析',
    difficulty: '核心理论',
    question: '对包含 n 个互不相同元素的数组采用经典快速排序算法。在下列哪种初始排列状态下，快速排序的时间复杂度会退化为最坏的 O(n^2)？',
    options: [
      '元素随机乱序分布',
      '数组元素已经处于完全正序或完全逆序',
      '数组前一半元素小于后一半元素',
      '数组中仅有少量元素逆序'
    ],
    answer: 1, // B
    explanation: '当选取首元素作为枢轴（Pivot）时，若输入序列已经完全有序（正序或逆序），每次划分（Partition）只能分出 0 个元素和 n-1 个元素的不平衡子问题，递归树深度达到 n 层，总比较次数达到 n(n-1)/2，算法效率退化为 O(n^2)。',
    labTip: '理解递归分治与二叉树结构的同构性：最优快排调用树平衡度类似于满二叉树，最差情况退化为单支树。'
  },

  // ================= 数据库系统 =================
  {
    id: 'q-db-01',
    courseId: 'databases',
    courseName: '数据库系统',
    experimentId: 'transactions',
    source: '高校期末与考研高频真题',
    topic: '并发事务隔离级别与数据异常',
    difficulty: '核心概念',
    question: '事务 T1 正在修改账户余额但尚未 Commit 提交；此时并发事务 T2 介入读取了该中间余额并进行了后续业务处理。若之后 T1 发生系统异常触发了 ROLLBACK 回滚操作，则 T2 先前读到的数据在数据库理论中被称为？',
    options: [
      '不可重复读 (Non-repeatable Read)',
      '幻读 (Phantom Read)',
      '脏读 (Dirty Read)',
      '丢失修改 (Lost Update)'
    ],
    answer: 2, // C. 脏读
    explanation: '读到了尚未提交且最终可能被回滚的临时数据，即为经典的“脏读 (Dirty Read)”。要解决脏读，数据库隔离级别至少需要提升至“读已提交 (Read Committed, RC)”级别以上。',
    labTip: '在事务实验中选择“脏读”场景，切换隔离级别查看读已提交如何阻止读取未提交版本。'
  },
  {
    id: 'q-db-02',
    courseId: 'databases',
    courseName: '数据库系统',
    experimentId: 'transactions',
    source: '经典研究生考试题库',
    topic: '两段锁协议 (2PL) 与可串行化调度',
    difficulty: '理论难点',
    question: '在数据库并发控制理论中，关于两段锁协议（Two-Phase Locking, 2PL），下列叙述正确的是？',
    options: [
      '遵守 2PL 协议的并发调度绝不会发生死锁',
      '遵守 2PL 协议是调度可串行化的充分条件，但不是必要条件',
      '2PL 要求事务在第一阶段释放所有读锁，第二阶段申请所有写锁',
      '只有串行调度才满足 2PL 协议'
    ],
    answer: 1, // B
    explanation: '① 2PL 协议规定事务分为“加锁扩展阶段”和“解锁收缩阶段”，一旦开始释放任何锁就不能再申请新锁。遵循 2PL 协议是保证调度并发执行结果可串行化（Serializability）的【充分条件】，但并非必要条件（有些可串行化调度并不满足 2PL）；② 2PL 可能会发生死锁，因此 A 错误。',
    labTip: '在数据库事务实验中观察加锁解锁阶段，理解并发读写锁的冲突矩阵与串行隔离原理。'
  }
]
