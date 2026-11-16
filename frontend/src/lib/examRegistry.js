export const EXAM_QUESTIONS = [
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
  }
]
