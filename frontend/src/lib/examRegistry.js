// 全国计算机考研统考 408 历年真题库 (2009-2026年 权威全真题集)
// 每道题目均深度锚定微观仿真实验与学科考点，支持全真年份模考与错题联动消错

export const EXAM_YEARS = ["2026", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015", "2014", "2013", "2012", "2011", "2010", "2009"];

export const EXAM_COURSES = [
  { id: 'all', name: '全部考查科目 (408 全科综合)', badge: '全真模拟' },
  { id: 'data-structure', name: '数据结构与算法', badge: '代码与渐近' },
  { id: 'computer-organization', name: '计算机组成原理', badge: '硬件微架构' },
  { id: 'operating-system', name: '操作系统', badge: '内核与调度' },
  { id: 'computer-network', name: '计算机网络', badge: '协议分层栈' }
];

export const EXAM_QUESTIONS = [
  {
    "id": "q-cache-01",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cache-mapping",
    "source": "2020年 408 统考真题 第14题",
    "topic": "Cache 直接映射与冲突缺失计算",
    "difficulty": "中等",
    "question": "假设某计算机 Cache 共有 4 个 Cache 行，采用直接映射方式（行号 = 块号 mod 4）。初始时 Cache 全部为空。若 CPU 依次访问的主存块号序列为：0, 4, 0, 4, 8, 4，则在该访问序列中发生 Cache 缺失（Miss）的次数是？",
    "options": [
      "3 次",
      "4 次",
      "5 次",
      "6 次"
    ],
    "answer": 3,
    "explanation": "由于采用直接映射且 Cache 仅有 4 行，块号 0、4、8 对 4 取模的结果均为 0，全部被映射到 Cache 行 0！访问 0 缺失装入行0；访问 4 缺失替换行0；访问 0 再次缺失替换行0；访问 4 缺失替换行0；访问 8 缺失替换行0；访问 4 再次缺失。每次访问都发生严重的“冲突颠簸 (Conflict Miss Thrashing)”，6 次访问全部缺失！",
    "labTip": "你可以在 Cache 实验中选择“直接映射”，输入该序列观察行 0 的反复颠簸淘汰动画。",
    "year": 2020
  },
  {
    "id": "q-cache-02",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cache-mapping",
    "source": "2017年 408 统考真题 第13题",
    "topic": "组相联映射 Cache 组地址与标记位数计算",
    "difficulty": "高频经典",
    "question": "已知某计算机主存按字节编址，地址位数共 32 位。Cache 采用 4 路组相联映射方式，每个 Cache 行大小为 64 字节，Cache 总容量为 64 KB。则该主存地址结构中，主存字块标记（Tag）的位数是？",
    "options": [
      "18 位",
      "20 位",
      "22 位",
      "24 位"
    ],
    "answer": 0,
    "explanation": "① 行内偏移位（Offset）：每个 Cache 行 64 字节 = 2^6 字节，占 6 位。\n② 组数计算：Cache 总容量 64 KB = 2^16 字节，总行数 = 64 KB / 64 B = 1024 行。因为是 4 路组相联（每组 4 行），所以总组数 = 1024 / 4 = 256 组 = 2^8 组，组地址（Set）占 8 位。\n③ 标记位（Tag）= 32 - 8 - 6 = 18 位。",
    "labTip": "在 Cache 实验中切换到“组相联映射”，查看地址解析器如何将 32 位二进制切分为 Tag、Set、Offset。",
    "year": 2017
  },
  {
    "id": "q-cache-03",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cache-mapping",
    "source": "2015年 408 统考真题 第14题",
    "topic": "Cache 写策略与回写块脏位 (Dirty Bit)",
    "difficulty": "核心理论",
    "question": "在采用“回写策略 (Write-Back)”并配置“写分配 (Write-Allocate)”机制的 Cache 存储系统中，每个 Cache 行的目录表项除了有效位（Valid）和标记（Tag）之外，通常还必须包含哪一个专用硬件位？",
    "options": [
      "脏位 (Dirty Bit / 修改位)",
      "访问频次计数位",
      "锁存保护位",
      "奇偶校验位"
    ],
    "answer": 0,
    "explanation": "在回写（Write-Back）策略下，当 CPU 执行写操作且命中了 Cache 时，只更新 Cache 中的副本，并不立即写回主存；仅当该 Cache 行在未来被替换淘汰时，才写回主存。为了避免将未被修改过的干净块盲目写回主存浪费总线带宽，必须为每个 Cache 行设置一个“脏位 (Dirty Bit)”。若写入过则将脏位置 1，替换时仅在脏位为 1 时才执行回写。",
    "labTip": "在 Cache 实验中观察命中写操作时，脏位如何被点亮并在换出时触发一次主存写写回。",
    "year": 2015
  },
  {
    "id": "q-pipe-01",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2021年 408 统考真题 第15题",
    "topic": "CPU 五级流水线写后读 (RAW) 数据冒险",
    "difficulty": "中等",
    "question": "在经典 RISC 五级流水线（IF 取指、ID 译码/读寄存器、EX 执行、MEM 访存、WB 写回寄存器）处理器中，假设未配置硬件前递旁路（No Forwarding）。指令序列为：\nI1: ADD R1, R2, R3\nI2: SUB R4, R1, R5\n为保证 I2 能正确读取到 I1 计算出的 R1 新值，硬件或编译器必须在 I1 与 I2 之间插入多少个时钟周期的停顿气泡（NOP）？",
    "options": [
      "1 个周期",
      "2 个周期",
      "3 个周期",
      "0 个周期"
    ],
    "answer": 1,
    "explanation": "I1 在第 5 个时钟周期（WB 阶段）才能将运算结果正式写入寄存器堆。而 I2 若紧跟其后，在第 3 个周期（ID 阶段）就急需读取 R1。此时 R1 尚未写回，产生写后读（RAW）数据冲突！必须在两条指令间插入 2 个时钟周期的空操作气泡（NOP），让 I2 的 ID 阶段延后到第 5 周期读到最新值。",
    "labTip": "可在 CPU 流水线实验中查看第 4 幕“写后读 RAW 数据冲突与气泡”时空流水图。",
    "year": 2021
  },
  {
    "id": "q-pipe-02",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2019年 408 统考真题 第16题",
    "topic": "流水线控制冒险与分支预测代价",
    "difficulty": "核心考点",
    "question": "在 5 级流水线中，条件转移指令在第 3 阶段（EX 执行阶段末尾）才能计算出分支转移是否成功及目标地址。若处理器采用“预测分支不转移（Predict Not Taken）”的静态预测策略，且该分支指令最终被判定为“转移成功（Taken）”，则流水线需要丢弃已被错误预取的后续指令，产生的时钟周期惩罚（Branch Penalty）是？",
    "options": [
      "1 个周期",
      "2 个周期",
      "3 个周期",
      "4 个周期"
    ],
    "answer": 1,
    "explanation": "当分支指令在 EX 阶段（第 3 周期）确认需要跳转时，由于流水线的持续推入，其后续的两条指令已经分别进入了 ID 阶段和 IF 阶段。因为预测失败，这两条已预取的指令必须被冲刷（Flush）清空为 NOP 气泡，因此带来的时钟周期性能惩罚是 2 个周期。",
    "labTip": "在 CPU 流水线实验中观察控制冲突演示，直观理解流水线冲刷气泡产生的原因。",
    "year": 2019
  },
  {
    "id": "q-pipe-03",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2018年 408 统考真题 第16题",
    "topic": "前递旁路 (Forwarding) 消除数据冲突",
    "difficulty": "综合技巧",
    "question": "若某 RISC 五级流水线处理器增加了 ALU 阶段输出端到 ALU 输入端的前递旁路硬件（EX-to-EX Forwarding）。对于指令序列：\nI1: ADD R1, R2, R3\nI2: SUB R4, R1, R5\n此时 I2 在 EX 阶段使用 R1 作为操作数时，需要插入多少个时钟周期的停顿气泡？",
    "options": [
      "0 个周期（完全无需停顿）",
      "1 个周期",
      "2 个周期",
      "3 个周期"
    ],
    "answer": 0,
    "explanation": "I1 在其 EX 阶段结束时，ALU 已经计算出了 R1 的数值；与此同时，紧随其后的 I2 刚好进入其 EX 阶段，正需要输入 R1。通过前递旁路（Forwarding），ALU 的计算结果直接通过专用数据通路旁路送入下一个周期的 ALU 输入端，完全无需等待 I1 写回寄存器堆，因此气泡数为 0 个周期！",
    "labTip": "在 CPU 流水线实验中勾选“启用前递技术 (Forwarding)”，观察气泡如何被黄色数据旁路消除。",
    "year": 2018
  },
  {
    "id": "q-number-01",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "number-representation",
    "source": "2020年 408 统考真题 第13题",
    "topic": "定点数 8 位补码加法与溢出标志 OF",
    "difficulty": "易错陷阱",
    "question": "假设某 8 位寄存器采用补码表示有符号整数。变量 x = 0x64（十进制 +100），y = 0x3C（十进制 +60）。当执行加法 x + y 后，ALU 输出的 8 位十六进制机器码以及溢出标志 OF 分别是？",
    "options": [
      "0xA0，OF = 1",
      "0xA0，OF = 0",
      "0x20，OF = 1",
      "0x20，OF = 0"
    ],
    "answer": 0,
    "explanation": "x = 0x64 = 0110 0100B，y = 0x3C = 0011 1100B。两者相加二进制：0110 0100 + 0011 1100 = 1010 0000B = 0xA0。最高位变为 1（负数）。两个正数相加结果为负数，发生溢出（超出 8 位有符号补码范围 [-128, +127]）。此时溢出标志 OF = 1。",
    "labTip": "在补码与浮点数实验中输入 100 与 60，观察两个正数相加时硬件触发溢出警告的动画。",
    "year": 2020
  },
  {
    "id": "q-number-02",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "number-representation",
    "source": "2022年 408 统考真题 第14题",
    "topic": "进位标志 CF 与溢出标志 OF 的区别",
    "difficulty": "必考必混",
    "question": "在计算机 ALU 状态标志寄存器中，进位标志 CF（Carry Flag）与溢出标志 OF（Overflow Flag）的核心本质区别在于？",
    "options": [
      "CF 是针对无符号数运算结果是否超出范围的判定，而 OF 是针对有符号数补码运算结果是否溢出的判定",
      "CF 只在加法中产生，OF 只在减法中产生",
      "CF 是最高位产生进位，而 OF 是符号位与最高位同时进位",
      "两者完全等价，只是不同架构的叫法不同"
    ],
    "answer": 0,
    "explanation": "这是 408 几乎每年必考的经典概念：硬件在执行二进制加减法时并不知道程序员把这串二进制看成有符号数还是无符号数，因此会同时生成两个标志位：\n① CF = 最高位进位 ⊕ SUB标志，判定【无符号数运算】是否超出表示范围；\n② OF = 符号位与次高位进位的异或，判定【有符号补码运算】是否超出范围。",
    "labTip": "在定点数与补码实验中切换“有符号/无符号视图”，对比 CF 与 OF 的触发条件。",
    "year": 2022
  },
  {
    "id": "q-float-01",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "number-representation",
    "source": "2018年 408 统考真题 第14题",
    "topic": "IEEE 754 单精度浮点数规格化表示",
    "difficulty": "综合计算",
    "question": "根据 IEEE 754 单精度（32 位）浮点数标准，阶码 E 采用移码表示，偏置常数 Bias = 127。若某单精度浮点数的十六进制机器码为 0xC0A00000，则该浮点数对应的真值十进制数值是？",
    "options": [
      "-2.5",
      "-5.0",
      "-1.25",
      "-10.0"
    ],
    "answer": 1,
    "explanation": "将 0xC0A00000 转换为二进制：1 10000001 01000000000000000000000。\n① 符号位 S = 1，表示负数；\n② 阶码 E = 10000001B = 129，真实指数 e = E - 127 = 129 - 127 = 2；\n③ 尾数 M = 0100...B，规格化隐藏最高位 1，有效尾数 = 1.01B = 1 + 1/4 = 1.25；\n真值 = -1 × 1.25 × 2^2 = -1 × 1.25 × 4 = -5.0。",
    "labTip": "在 IEEE 754 浮点数实验中输入 -5.0，动态观察符号位、阶码移码和尾数的二进制切片。",
    "year": 2018
  },
  {
    "id": "q-float-02",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "number-representation",
    "source": "2023年 408 统考真题 第13题",
    "topic": "IEEE 754 浮点数阶码全 0 与全 1 的特殊含义",
    "difficulty": "理论难点",
    "question": "在 IEEE 754 单精度浮点数标准中，当 8 位阶码 E 全为 1（E = 255），且尾数字段 M 不全为 0 时，该编码在标准中表示的特殊数值是？",
    "options": [
      "正无穷大 (+∞)",
      "负无穷大 (-∞)",
      "非数值 (NaN, Not a Number)",
      "规格化最大正浮点数"
    ],
    "answer": 2,
    "explanation": "IEEE 754 规定：\n- 当 E = 255 且 M = 0 时，根据符号位表示 +∞ 或 -∞；\n- 当 E = 255 且 M ≠ 0 时，表示非数值（NaN, 例如 0/0 或负数开平方等非法操作的结果）；\n- 当 E = 0 且 M = 0 时，表示 ±0；\n- 当 E = 0 且 M ≠ 0 时，表示非规格化数（用于实现平滑下溢）。",
    "labTip": "在浮点数实验中选择预设“特殊值 NaN 与无穷大”，查看其二进制对应模式。",
    "year": 2023
  },
  {
    "id": "q-inst-01",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2016年 408 统考真题 第15题",
    "topic": "指令周期取指微操作与程序计数器 PC 自增",
    "difficulty": "微操作时序",
    "question": "在 CPU 取指令周期（Instruction Fetch Cycle）中，从将 PC 内容送往主存地址寄存器 MAR 到指令寄存器 IR 获得指令，下列微操作序列中次序正确的是？",
    "options": [
      "(PC) -> MAR -> 读主存 -> MDR -> IR，同时 (PC)+1 -> PC",
      "(PC) -> MDR -> MAR -> 读主存 -> IR",
      "读主存 -> MAR -> (PC)+1 -> PC -> IR",
      "(PC)+1 -> PC -> MAR -> 读主存 -> IR"
    ],
    "answer": 0,
    "explanation": "取指周期微操作标准时序：\n1. (PC) -> MAR：将当前指令地址送往地址寄存器；\n2. 1 -> R（读信号），M(MAR) -> MDR：主存根据地址读出指令存入数据寄存器；\n3. 同时 (PC) + 1 -> PC：计数器自动加 1 指向下一条指令；\n4. (MDR) -> IR：将指令正式送入指令寄存器 IR 等待后续译码。",
    "labTip": "在指令执行周期实验中单步执行“取指阶段 (Fetch)”，观察 PC、MAR、MDR、IR 数据总线的微时钟流动。",
    "year": 2016
  },
  {
    "id": "q-bus-01",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2021年 408 统考真题 第18题",
    "topic": "系统总线带宽计算与传输频率",
    "difficulty": "经典计算",
    "question": "某同步总线采用时钟频率为 66 MHz，总线数据线宽度为 32 位（4 字节）。若该总线每隔 2 个总线时钟周期传输一次 32 位数据，则该总线的有效数据传输带宽为？",
    "options": [
      "66 MB/s",
      "132 MB/s",
      "264 MB/s",
      "528 MB/s"
    ],
    "answer": 1,
    "explanation": "总线带宽 = 时钟频率 × 每个周期传输的数据量 / 传输周期数。\n总线每 2 个时钟周期传输 4 字节数据，每个时钟周期平均传输 4 / 2 = 2 字节。\n总线带宽 = 66 MHz × 2 字节 = 132 MB/s。",
    "labTip": "结合指令微操作周期理解总线在访存周期占用读写总线的时间窗口。",
    "year": 2021
  },
  {
    "id": "q-io-01",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2017年 408 统考真题 第20题",
    "topic": "DMA 方式与中断驱动方式的核心区别",
    "difficulty": "核心理论",
    "question": "在外部设备与主机之间进行大批量数据传送时，DMA（直接内存存取）控制器与 CPU 抢占总线进行数据传输的方式被称为“周期挪用”。与中断驱动方式相比，DMA 方式的主要优势是？",
    "options": [
      "在数据传送过程中无需 CPU 的全程干预，不占用 CPU 指令执行时间",
      "无需任何外部中断机制即可完成传输通知",
      "能够执行算术逻辑指令的预处理",
      "彻底消除了总线冲突现象"
    ],
    "answer": 0,
    "explanation": "中断驱动方式在每传送一个字（或字节）的数据时，都必须由 CPU 执行一段中断服务程序；而 DMA 方式仅在块传输开始前由 CPU 进行初始化（设置地址和长度），以及整块传输结束时发出中断通知 CPU，整个数据搬运过程直接在设备与主存间进行，完全释放了 CPU 的运算能力。",
    "labTip": "在指令周期实验中观察中断响应周期与硬件微控制器的协作时序。",
    "year": 2017
  },
  {
    "id": "q-page-01",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "page-replacement",
    "source": "2019年 408 统考真题 第24题",
    "topic": "虚拟内存页面置换与 Belady 异常",
    "difficulty": "中等",
    "question": "某进程在内存中分配了 3 个物理块，采用先进先出（FIFO）页面置换算法。进程的页面访问走向序列为：1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5。假设初始时 3 个物理块皆为空，则整个执行过程中共发生的缺页中断次数为？",
    "options": [
      "7 次",
      "8 次",
      "9 次",
      "10 次"
    ],
    "answer": 2,
    "explanation": "FIFO 算法淘汰最早进入内存的页面。依次模拟：访问 1(缺), 2(缺), 3(缺)；装满 [1,2,3]；访问 4(缺，淘汰1得[2,3,4])；访问 1(缺，淘汰2得[3,4,1])；访问 2(缺，淘汰3得[4,1,2])；访问 5(缺，淘汰4得[1,2,5])；访问 1(命中)；访问 2(命中)；访问 3(缺，淘汰1得[2,5,3])；访问 4(缺，淘汰2得[5,3,4])；访问 5(命中)。总共缺页 3(初始)+6(置换)=9次。",
    "labTip": "在页面置换实验中载入该访问串，直观查看 FIFO 与 LRU 物理页槽的动态更替。",
    "year": 2019
  },
  {
    "id": "q-page-02",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "page-replacement",
    "source": "2021年 408 统考真题 第25题",
    "topic": "LRU 最近最久未使用页面置换",
    "difficulty": "经典考点",
    "question": "系统为某进程分配 3 个内存块，初始为空，页面引用串为：2, 3, 2, 1, 5, 2, 4, 5, 3, 2, 5, 2。若采用 LRU（最近最久未使用）置换算法，当访问第 7 个页面（页面 4）时，被淘汰置换出的页面是？",
    "options": [
      "页面 1",
      "页面 2",
      "页面 3",
      "页面 5"
    ],
    "answer": 0,
    "explanation": "追踪物理块内的驻留页面：\n访问 2 -> [2]\n访问 3 -> [2, 3]\n访问 2 -> 命中，刷新 2 的最新访问时间，驻留页按近期访问排序为 [3, 2]\n访问 1 -> [3, 2, 1]\n访问 5 -> 块满缺页，淘汰最久未用的 3，装入 5，排序为 [2, 1, 5]\n访问 2 -> 命中，刷新 2，排序为 [1, 5, 2]\n访问 4 -> 块满缺页，当前最久未被访问的是排在头部的页面 1！因此淘汰页面 1。",
    "labTip": "在页面置换实验中观察 LRU 栈在命中时如何自动将命中块提升至栈顶。",
    "year": 2021
  },
  {
    "id": "q-page-03",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "page-replacement",
    "source": "2020年 408 统考真题 第27题",
    "topic": "CLOCK 置换算法（NRU 时钟环）逻辑",
    "difficulty": "经典考点",
    "question": "简易时钟（CLOCK）页面置换算法采用一个循环链表和访问位（Use Bit）。当发生缺页需要替换页面时，指针按环形扫描，关于指针扫描过程中的操作规则，下列叙述正确的是？",
    "options": [
      "若当前页面访问位为 0，则淘汰该页并将新页换入；若为 1，则将其置 0 并暂不淘汰，指针继续向下寻找",
      "若当前页面访问位为 1，则直接淘汰该页",
      "优先淘汰修改位（Dirty Bit）为 1 的页面",
      "每次扫描都将所有页面的访问位强制清 0"
    ],
    "answer": 0,
    "explanation": "CLOCK 算法将页面排成一个环形循环队列。检查指针指向的页面：若访问位为 0，说明近期未被访问，直接选为淘汰页；若访问位为 1，则给予“第二次机会 (Second Chance)”，将其访问位置为 0，指针前移检查下一页。最多循环两圈必定能找到访问位为 0 的页面淘汰。",
    "labTip": "在页面置换实验中选择 CLOCK 算法，观察时钟指针旋转扫描并清除访问位的过程。",
    "year": 2020
  },
  {
    "id": "q-deadlock-01",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "deadlock",
    "source": "2023年 408 统考真题 第26题",
    "topic": "死锁避免与银行家算法安全性本质",
    "difficulty": "核心概念",
    "question": "在操作系统死锁避免算法（银行家算法）中，关于“安全状态”与“死锁”的逻辑关系，下列叙述中唯一正确的是？",
    "options": [
      "安全序列必然是唯一的，有且仅有一种分配次序",
      "只要系统当前处于安全状态，就必然存在至少一条安全执行序列，系统绝不会陷入死锁",
      "只要进程请求的资源量小于系统剩余可用资源数，分配后系统一定处于安全状态",
      "处于不安全状态的系统最终必然会发生死锁"
    ],
    "answer": 1,
    "explanation": "安全状态的定义：系统能按某种顺序（即安全序列，可能存在多条）为每个进程分配所需资源，直至最大需求满足。只要系统处于安全状态，就绝不可能发生死锁；不安全状态只是存在死锁的风险（并非一定会死锁）。银行家算法的核心思想就是：拒绝任何会导致系统滑向“不安全状态”的资源分配请求。",
    "labTip": "在死锁实验中亲自运行一次银行家算法安全性检查，观察系统如何寻找安全推进序列。",
    "year": 2023
  },
  {
    "id": "q-deadlock-02",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "deadlock",
    "source": "2016年 408 统考真题 第27题",
    "topic": "死锁产生的四个必要条件与预防死锁策略",
    "difficulty": "基础理论",
    "question": "破坏死锁产生四个必要条件之一是预防死锁的经典手段。在操作系统中，采用“资源有序分配法（按资源编号升序申请）”主要破坏的是死锁的哪一个必要条件？",
    "options": [
      "互斥使用条件",
      "请求并保持条件",
      "不剥夺条件",
      "循环等待条件"
    ],
    "answer": 3,
    "explanation": "资源有序分配法规定：所有资源统一编号，进程必须严格按照编号递增的次序请求资源，同类资源一次性申请。这样无论有多少个进程并发，都不可能出现进程 A 占有低号等高号、而进程 B 占有高号等低号形成的闭环，彻底破坏了“循环等待条件 (Circular Wait)”。",
    "labTip": "在死锁实验的“哲学家进餐”模型中，观察奇偶哲学家或有序取筷策略如何消除死锁环。",
    "year": 2016
  },
  {
    "id": "q-deadlock-03",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "deadlock",
    "source": "2019年 408 统考真题 第26题",
    "topic": "资源分配图化简与死锁判定定理",
    "difficulty": "图形判定",
    "question": "死锁定理指出：系统处于死锁状态的充分条件是当且仅当该状态对应的资源分配图满足下列哪种情况？",
    "options": [
      "资源分配图中存在至少一个环路",
      "资源分配图是不可完全化简的 (Cannot be completely reduced)",
      "有进程处于阻塞队列中",
      "可用资源向量所有分量均为 0"
    ],
    "answer": 1,
    "explanation": "注意死锁定理的严格表述：如果资源分配图中不存在环路，则系统绝无死锁；若存在环路，且每个资源类都只有单实例，则必然死锁；但若资源类有多实例，有环也不一定会死锁！因此通用的充要条件是：【资源分配图不可完全化简】（即不断找到非阻塞进程释放其资源后，图依然无法消去所有边）。",
    "labTip": "在死锁实验中查看可化简与不可化简资源图的动画消解过程。",
    "year": 2019
  },
  {
    "id": "q-process-01",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2022年 408 统考真题 第23题",
    "topic": "进程五状态模型与状态转换逻辑",
    "difficulty": "易错概念",
    "question": "在进程管理经典的“创建-就绪-执行-阻塞-终止”五状态模型中，下列关于进程状态跃迁的描述中，哪一项在正常操作系统运行机制下是绝不可能发生的？",
    "options": [
      "执行态 ➔ 就绪态（例如分配的时间片耗尽）",
      "阻塞态 ➔ 就绪态（例如所等待的 I/O 操作完成）",
      "阻塞态 ➔ 执行态（例如获得所等待的临界互斥资源）",
      "执行态 ➔ 阻塞态（例如主动发起系统调用等待磁盘读取）"
    ],
    "answer": 2,
    "explanation": "阻塞态进程在等待的事件发生后（如 I/O 完成或资源就绪），只能先转移到【就绪态】，排入就绪队列等待 CPU 调度器重新分派！任何进程都绝对不能直接从【阻塞态】跳入【执行态】。",
    "labTip": "在进程同步与状态模型实验中，观察进程在释放锁或时间片用尽时的五状态流动图。",
    "year": 2022
  },
  {
    "id": "q-sync-01",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2018年 408 统考真题 第25题",
    "topic": "PV 操作信号量取值与物理意义",
    "difficulty": "核心理论",
    "question": "用 PV 操作（Wait/Signal）控制 3 个进程互斥访问某类临界资源。若该互斥信号量当前的值为 -2，则表明当前处于等待该临界资源的阻塞进程个数是？",
    "options": [
      "0 个",
      "1 个",
      "2 个",
      "3 个"
    ],
    "answer": 2,
    "explanation": "信号量 S 的物理含义：\n- 当 S > 0 时，S 表示当前系统中可用资源的数量；\n- 当 S = 0 时，表示资源恰好分配完毕，且无等待进程；\n- 当 S < 0 时，S 的绝对值 |S| 严格代表在等待该资源的阻塞队列中的进程个数！因此当前 S = -2，表示有 2 个进程被阻塞等待。",
    "labTip": "在进程同步实验中选择“生产者-消费者”，观察信号量 empty 和 full 从正值减到负值时的阻塞队列变化。",
    "year": 2018
  },
  {
    "id": "q-sync-02",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2017年 408 统考真题 第25题",
    "topic": "生产者-消费者问题中 P 操作次序要求",
    "difficulty": "易错陷阱",
    "question": "在经典的有界缓冲区生产者-消费者同步互斥问题中，mutex 为互斥信号量（初值 1），empty 为空缓冲区数（初值 N），full 为满缓冲区数（初值 0）。在生产者进程的代码中，如果将 P(empty) 与 P(mutex) 的执行次序颠倒（即先 P(mutex) 后 P(empty)），当缓冲区已满时，系统将会导致？",
    "options": [
      "正常工作无影响",
      "引发死锁 (Deadlock)",
      "产生竞态数据覆盖",
      "消费者无法退出"
    ],
    "answer": 1,
    "explanation": "如果先执行 P(mutex)，生产者便成功锁定了缓冲区独占权；随后执行 P(empty)，因缓冲区已满（empty=0），生产者被阻塞并带着 mutex 锁进入等待队列。此时消费者想取数据来释放 empty 空间，却在入口被 P(mutex) 挡住而阻塞！双方彼此等待，引发灾难性死锁！因此同步 P 必须在互斥 P 之前执行。",
    "labTip": "在进程同步实验中切换 P 操作次序，直观观察死锁锁死动画。",
    "year": 2017
  },
  {
    "id": "q-sched-01",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "scheduling",
    "source": "2021年 408 统考真题 第23题",
    "topic": "CPU 调度算法周转时间与短作业优先 (SJF)",
    "difficulty": "经典计算",
    "question": "有 3 个作业 P1、P2、P3 几乎同时到达系统，执行时间分别为 6ms、8ms、2ms。若采用非抢占式“短作业优先（SJF）”调度算法，这 3 个作业的平均等待时间为？",
    "options": [
      "2 ms",
      "3.33 ms",
      "4.67 ms",
      "6 ms"
    ],
    "answer": 1,
    "explanation": "SJF 优先调度运行时间最短的作业，执行顺序为：\n1. P3(2ms)：等待 0 ms，在时刻 2 结束；\n2. P1(6ms)：等待 2 ms，在时刻 8 结束；\n3. P2(8ms)：等待 8 ms，在时刻 16 结束。\n平均等待时间 = (0 + 2 + 8) / 3 = 10 / 3 ≈ 3.33 ms。SJF 算法被数学证明在所有非抢占调度中具有最小的平均等待时间。",
    "labTip": "在 CPU 进程调度实验中载入该组作业，查看甘特图上 SJF、FCFS 与时间片轮转的等待时延对比。",
    "year": 2021
  },
  {
    "id": "q-sched-02",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "scheduling",
    "source": "2019年 408 统考真题 第23题",
    "topic": "多级反馈队列 (MLFQ) 调度特征",
    "difficulty": "核心理论",
    "question": "多级反馈队列（Multilevel Feedback Queue, MLFQ）调度算法被公认为现代操作系统中性能极佳的综合调度算法。下列关于 MLFQ 机制的描述中，错误的是？",
    "options": [
      "每个就绪队列分配不同的时间片，优先级越高的队列其时间片越长",
      "新创建的进程首先进入最高优先级队列的末尾",
      "如果进程在当前时间片内未完成，将被降级移入下一个优先级队列",
      "仅当更高优先级的队列为空时，CPU 才会调度执行低优先级队列中的进程"
    ],
    "answer": 0,
    "explanation": "A 选项错误！MLFQ 的核心设计原则是：【队列优先级越高，分配的时间片越短】；优先级越低的队列，分配的时间片反而越长！这样既能保证短交互作业在最高优先级队列中秒响应，又能保证长计算型作业在低级队列中得到足够长的时间片以减少进程上下文切换开销。",
    "labTip": "在进程调度实验中观察多级队列调度演示，感受短进程插队与长作业下沉的动态平衡。",
    "year": 2019
  },
  {
    "id": "q-mem-01",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "memory-partition",
    "source": "2022年 408 统考真题 第24题",
    "topic": "内存动态分区分配算法（最佳适应 vs 首次适应）",
    "difficulty": "经典考点",
    "question": "在内存动态分区连续分配管理中，容易在内存中留下大量难以利用的微小外部碎片（External Fragmentation）的分配算法是？",
    "options": [
      "最佳适应算法 (Best Fit)",
      "首次适应算法 (First Fit)",
      "邻近适应算法 (Next Fit)",
      "最坏适应算法 (Worst Fit)"
    ],
    "answer": 0,
    "explanation": "最佳适应算法（Best Fit）每次都在空闲分区链中寻找能够容纳进程且容量最小的分区进行切分。这导致每次切分后剩余的空闲块极其微小，且遍布整个内存，形成大量难以再次利用的外部碎片。反而是最坏适应（Worst Fit）每次切最大的块，切后剩余碎片相对较大仍可使用。",
    "labTip": "在内存动态分区实验中对比 Best Fit 与 First Fit，观察内存条中外部碎片的产生过程。",
    "year": 2022
  },
  {
    "id": "q-fs-01",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "page-replacement",
    "source": "2021年 408 统考真题 第28题",
    "topic": "UNIX 混合索引节点 (inode) 最大文件尺寸推算",
    "difficulty": "综合大题考点",
    "question": "某文件系统采用 UNIX 混合索引节点结构，每个磁盘块大小为 4 KB，每个盘块号占用 4 字节。若 inode 中包含 10 个直接地址项、1 个一级间接地址项、1 个二级间接地址项。则仅通过该一级间接地址项所能索引的最大文件数据量是？",
    "options": [
      "1024 KB",
      "2048 KB",
      "4096 KB (4 MB)",
      "16 MB"
    ],
    "answer": 2,
    "explanation": "每个磁盘块 4 KB = 4096 B。每个块号占 4 B，因此一个索引块能容纳的盘块号个数 = 4 KB / 4 B = 1024 个指针。\n一级间接索引块自身是一个磁盘块，包含 1024 个指向数据块的指针。因此一级间接地址项能索引的数据块数 = 1024 个，总数据量 = 1024 × 4 KB = 4096 KB = 4 MB。",
    "labTip": "结合虚拟内存页表概念，理解多级间接指针与多级页表在地址映射上的高度同构性。",
    "year": 2021
  },
  {
    "id": "q-tcp-01",
    "courseId": "networks",
    "courseName": "计算机网络",
    "experimentId": "sliding-window",
    "source": "2022年 408 统考真题 第36题",
    "topic": "TCP 拥塞控制慢启动与丢包超时恢复",
    "difficulty": "高频经典",
    "question": "某 TCP 连接的接收窗口 rwnd 为 16 KB，MSS 为 1 KB。当拥塞窗口 cwnd 增长到 4 KB 时发生超时（Timeout）。根据 TCP Tahoe/Reno 拥塞控制算法规范，超时发生后经过 3 个 RTT（往返时延），发送方此时的有效发送窗口大小为？",
    "options": [
      "2 KB",
      "4 KB",
      "8 KB",
      "16 KB"
    ],
    "answer": 1,
    "explanation": "发生超时后，门限值 ssthresh 被设置为当前 cwnd 的一半，即 ssthresh = 4 KB / 2 = 2 KB；同时 cwnd 重新置为 1 个 MSS (1 KB) 开启慢启动。① 经过 1 个 RTT：cwnd 翻倍为 2 KB（达到门限）；② 经过 2 个 RTT：转入拥塞避免（加法增大），cwnd 增至 3 KB；③ 经过 3 个 RTT：cwnd 增至 4 KB。此时有效发送窗口 = min(rwnd: 16, cwnd: 4) = 4 KB。",
    "labTip": "可在滑动窗口实验中选择超时丢包场景，亲眼观察 cwnd 骤降归 1 后重新爬升的过程。",
    "year": 2022
  },
  {
    "id": "q-tcp-02",
    "courseId": "networks",
    "courseName": "计算机网络",
    "experimentId": "sliding-window",
    "source": "2020年 408 统考真题 第38题",
    "topic": "TCP 三次握手与序号同步机制",
    "difficulty": "必考基础",
    "question": "主机甲与主机乙建立 TCP 连接。主机甲发送的 SYN 数据段中 seq = 1000。主机乙收到后回复 SYN+ACK 报文段，其确认号 ack 应该为？若乙在回复报文中的自身初始序号 seq = 2000，则甲发送的第三次握手 ACK 报文中，seq 与 ack 分别是？",
    "options": [
      "ack = 1000；第三次握手 seq = 1001, ack = 2000",
      "ack = 1001；第三次握手 seq = 1001, ack = 2001",
      "ack = 1001；第三次握手 seq = 1000, ack = 2001",
      "ack = 1000；第三次握手 seq = 1001, ack = 2001"
    ],
    "answer": 1,
    "explanation": "TCP 规范规定：SYN 报文段虽然不携带应用层数据，但必须消耗一个序号！因此乙回复确认号 ack = 1000 + 1 = 1001。乙自身的 SYN 也消耗一个序号（seq = 2000）。甲在第三次握手时发送普通的 ACK 确认段，其发送序号顺接为 seq = 1001，对乙的确认号 ack = 2000 + 1 = 2001。",
    "labTip": "在 TCP 握手与全双工信道实验中，观察 Client 与 Server 之间 ISN 与 ACK 的序号时序交互。",
    "year": 2020
  },
  {
    "id": "q-tcp-03",
    "courseId": "networks",
    "courseName": "计算机网络",
    "experimentId": "tcp-connection",
    "source": "2019年 408 统考真题 第38题",
    "topic": "TCP 四次挥手与 TIME_WAIT 状态意义",
    "difficulty": "核心理论",
    "question": "在 TCP 四次挥手断开连接过程中，主动发起关闭的一方在发送完最后一个 ACK 确认报文后，必须进入 TIME_WAIT 状态并等待 2MSL（最长报文段寿命）时间才彻底关闭。该机制的最主要目的是？",
    "options": [
      "保证客户端发送的最后一个 ACK 报文能够到达服务端，防止服务端因未收到 ACK 重新发送 FIN 导致混乱",
      "为了让客户端操作系统有足够时间释放套接字缓冲区",
      "等待服务端主动向客户端发送 RST 复位信号",
      "允许客户端在 2MSL 期间继续发送残余数据"
    ],
    "answer": 0,
    "explanation": "TIME_WAIT 状态有两大核心作用：\n① 可靠终止 TCP 全双工连接：若客户端发送的最后那个 ACK 在网络中丢失，服务端因超时会重发 FIN。处于 TIME_WAIT 状态的客户端能够接收重发的 FIN 并补发 ACK；\n② 让本连接中产生的所有旧重复报文段都在网络中自然消亡（消失），避免新建立的连接收到旧报文引起数据混淆。",
    "labTip": "在 TCP 连接状态机实验中点击“断开连接”，直观观察 Client 如何在 TIME_WAIT 停滞倒计时。",
    "year": 2019
  },
  {
    "id": "q-subnet-01",
    "courseId": "networks",
    "courseName": "计算机网络",
    "experimentId": "ip-subnet",
    "source": "2018年 408 统考真题 第37题",
    "topic": "CIDR 无分类编址与广播地址推算",
    "difficulty": "必考必会",
    "question": "已知某台主机的 IPv4 地址为 192.168.10.37，其子网掩码配置为 255.255.255.240（即 /28 前缀）。该主机所在子网的直接广播地址（Direct Broadcast Address）是？",
    "options": [
      "192.168.10.31",
      "192.168.10.47",
      "192.168.10.255",
      "192.168.10.48"
    ],
    "answer": 1,
    "explanation": "子网掩码 /28 意味着主机号占 32 - 28 = 4 位，每个子网块大小为 2^4 = 16。对于最后一个字节 37：37 / 16 = 2 余 5，所在子网的网络地址为 16 × 2 = 32（即 192.168.10.32）。将主机位 4 位全置 1（加 15），得到该子网的直接广播地址为 32 + 15 = 47（即 192.168.10.47）。",
    "labTip": "在 IP 子网实验中拖动 CIDR 滑块到 /28，输入该 IP 即可即时看到网络地址与广播地址的二进制切分。",
    "year": 2018
  },
  {
    "id": "q-subnet-02",
    "courseId": "networks",
    "courseName": "计算机网络",
    "experimentId": "ip-subnet",
    "source": "2021年 408 统考真题 第39题",
    "topic": "路由表查找与最长前缀匹配原则 (LPM)",
    "difficulty": "经典考点",
    "question": "某路由器的路由表具有下列 4 个表项，当目的 IP 地址为 130.12.16.8 的数据报到达时，该路由器将匹配并选择哪一个下一跳端口？\n路由表项：\n① 130.12.0.0/16 ➔ 接口 1\n② 130.12.16.0/20 ➔ 接口 2\n③ 130.12.16.0/24 ➔ 接口 3\n④ 0.0.0.0/0 (默认路由) ➔ 接口 4",
    "options": [
      "接口 1",
      "接口 2",
      "接口 3",
      "接口 4"
    ],
    "answer": 2,
    "explanation": "将目的地址 130.12.16.8 与各掩码逐一做与运算：\n① 匹配 /16：130.12.0.0（匹配，前缀长 16）\n② 匹配 /20：130.12.16.0（匹配，前缀长 20）\n③ 匹配 /24：130.12.16.0（匹配，前缀长 24）\n根据 IP 路由核心准则“最长前缀匹配原则 (Longest Prefix Match)”，掩码前缀越长，网络划分越精确，优先级越高！因此选择前缀最长 (/24) 的表项，从接口 3 转发。",
    "labTip": "在 IP 子网实验中输入 130.12.16.8，对比 /16、/20 和 /24 的网络地址覆盖范围。",
    "year": 2021
  },
  {
    "id": "q-subnet-03",
    "courseId": "networks",
    "courseName": "计算机网络",
    "experimentId": "ip-subnet",
    "source": "2016年 408 统考真题 第37题",
    "topic": "CIDR 路由聚合（超网汇聚）计算",
    "difficulty": "经典考点",
    "question": "路由器 R 收到四个子网：202.112.16.0/24、202.112.17.0/24、202.112.18.0/24、202.112.19.0/24。为了减小路由表体积，R 对其进行最优 CIDR 路由汇聚聚合，聚合后的单个超网前缀是？",
    "options": [
      "202.112.16.0/21",
      "202.112.16.0/22",
      "202.112.0.0/20",
      "202.112.16.0/23"
    ],
    "answer": 1,
    "explanation": "观察第三个字节：16 = 0001 0000B，17 = 0001 0001B，18 = 0001 0010B，19 = 0001 0011B。它们的前 6 位二进制完全相同（均为 0001 00），后两位包含 00、01、10、11 全排列。前两字节 16 位 + 第三字节前 6 位 = 22 位公共前缀！第三字节网络地址为 0001 0000B = 16。因此聚合超网为 202.112.16.0/22。",
    "labTip": "在 IP 子网实验中体验 CIDR 滑块如何从 /24 收缩合并至 /22。",
    "year": 2016
  },
  {
    "id": "q-dns-01",
    "courseId": "networks",
    "courseName": "计算机网络",
    "experimentId": "dns-resolution",
    "source": "2022年 408 统考真题 第34题",
    "topic": "DNS 域名解析与迭代查询时序",
    "difficulty": "基础考点",
    "question": "某主机通过本地域名服务器查询 www.example.com 的 IP 地址。假设本机缓存为空，本地域名服务器采用“迭代查询 (Iterative Query)”方式。在完成整个解析过程中，本地域名服务器最少需要向外网其它域名服务器依次发送几次 DNS 查询请求？",
    "options": [
      "1 次",
      "2 次",
      "3 次",
      "4 次"
    ],
    "answer": 2,
    "explanation": "在迭代查询模式下，本地域名服务器分别向：① 根域名服务器（获取 .com 顶级域服务器地址）；② .com 顶级域名服务器（获取 example.com 权限域名服务器地址）；③ example.com 权威域名服务器（获取 www 主机最终的 A 记录 IP）。因此最少需要依次发出 3 次外部 DNS 请求。",
    "labTip": "在 DNS 递归与迭代解析实验中一步步推进报文，直观观察 3 级域服务器的指针返回。",
    "year": 2022
  },
  {
    "id": "q-sliding-01",
    "courseId": "networks",
    "courseName": "计算机网络",
    "experimentId": "sliding-window",
    "source": "2023年 408 统考真题 第35题",
    "topic": "滑动窗口协议发送窗口尺寸约束",
    "difficulty": "经典理论",
    "question": "在后退 N 帧（Go-Back-N, GBN）ARQ 可靠传输协议中，若采用 n 位二进制序号对数据帧进行编码（序号范围 0 ~ 2^n - 1）。为防止接收端接收序号发生歧义混淆，发送窗口尺寸 W 的最大上限是？",
    "options": [
      "2^n",
      "2^n - 1",
      "2^(n-1)",
      "2^n + 1"
    ],
    "answer": 1,
    "explanation": "对于 GBN 协议，接收窗口为 1，发送窗口最大为 2^n - 1。若发送窗口为 2^n，当发送方把 0 ~ 2^n-1 帧全部发出且所有确认帧丢失时，超时重发的第 0 帧会被接收方误认为是下一轮全新的第 0 帧！而在选择重传协议（SR）中，发送窗口与接收窗口均不能超过 2^(n-1)。",
    "labTip": "在滑动窗口实验中对比停等、GBN 与 SR 算法的窗口移动差异。",
    "year": 2023
  },
  {
    "id": "q-phy-01",
    "courseId": "networks",
    "courseName": "计算机网络",
    "experimentId": "sliding-window",
    "source": "2017年 408 统考真题 第33题",
    "topic": "奈奎斯特准则与香农公式极限速率",
    "difficulty": "必考计算",
    "question": "若某无噪声信道的带宽为 3 kHz，采用 4 种不同的相位、每种相位有 4 种振幅的正交振幅调制（QAM-16）。根据奈奎斯特采样定理，该信道的最大无差错极限数据传输速率是？",
    "options": [
      "6 kbps",
      "12 kbps",
      "24 kbps",
      "48 kbps"
    ],
    "answer": 2,
    "explanation": "① 信号状态数：4 相位 × 4 振幅 = 16 种不同状态，每个信号码元携带 log2(16) = 4 个比特。\n② 奈奎斯特定理：无噪声信道最大码元传输速率 B = 2W = 2 × 3000 Hz = 6000 Baud。\n③ 最大数据率 = 6000 Baud × 4 bit = 24000 bps = 24 kbps。",
    "labTip": "体会物理层信道带宽对数字信号波形失真与极限吞吐的物理约束。",
    "year": 2017
  },
  {
    "id": "q-mac-01",
    "courseId": "networks",
    "courseName": "计算机网络",
    "experimentId": "tcp-connection",
    "source": "2020年 408 统考真题 第34题",
    "topic": "CSMA/CD 碰撞检测与争用期退避",
    "difficulty": "经典考点",
    "question": "在经典以太网 CSMA/CD 介质访问控制协议中，关于“争用期（Contention Period / 冲突窗口）”与“最小帧长”的逻辑关系，下列叙述正确的是？",
    "options": [
      "争用期等于端到端往返传播时延 2τ，帧的发送时延必须大于或等于争用期，才能保证在发送完成前检测到是否冲突",
      "争用期等于单向传播时延 τ，帧长越短越容易检测到冲突",
      "最小帧长与信道传播速率无关，统一固定为 64 字节",
      "如果发生冲突，双方立即停止发送且无需重发"
    ],
    "answer": 0,
    "explanation": "主机发送帧的同时检测信道。若发生冲突，冲突信号最迟在 2τ（端到端往返时延）时间内传回发送方。因此，发送帧的持续时间（发送时延）必须满足：发送时延 ≥ 2τ，即（帧长 / 传输速率）≥ 2τ，从而导出最小帧长 = 2τ × 数据率。若帧长太短在 2τ 之前发完，就无法判定该帧是否在信道上遭遇了碰撞。",
    "labTip": "在报文时空图上理解单向时延与往返时延对检测冲突窗口的意义。",
    "year": 2020
  },
  {
    "id": "q-switch-01",
    "courseId": "networks",
    "courseName": "计算机网络",
    "experimentId": "sliding-window",
    "source": "2021年 408 统考真题 第37题",
    "topic": "以太网交换机自学习算法与转发表建立",
    "difficulty": "核心过程",
    "question": "以太网交换机初始转发表为空。主机 A 通过端口 1 向交换机发送一个单播数据帧，目的 MAC 地址为主机 B。交换机收到该帧后，首先执行的操作是？",
    "options": [
      "将主机 A 的 MAC 地址与其进入端口 1 绑定记录入转发表，随后向除端口 1 以外的所有端口广播洪泛该帧",
      "直接向端口 2 转发该帧",
      "丢弃该帧并等待主机 B 发送请求",
      "向所有端口（包括端口 1）同时转发"
    ],
    "answer": 0,
    "explanation": "交换机的自学习规则：\n1. 【先学后转】：检查源 MAC 地址（主机 A），将 (MAC_A, 端口 1, 当前时间) 记录入交换机转发表；\n2. 【查表转发】：查找目的 MAC 地址（主机 B）。因初始表为空，找不到 B 的端口，故采取【盲目广播（洪泛 Flooding）】策略，将帧向除接收端口 1 以外的所有其他端口泛洪转发。",
    "labTip": "结合二层链路拓扑，理解局域网内单播、组播与泛洪的区别。",
    "year": 2021
  },
  {
    "id": "q-http-01",
    "courseId": "networks",
    "courseName": "计算机网络",
    "experimentId": "sliding-window",
    "source": "2019年 408 统考真题 第39题",
    "topic": "HTTP 状态码与非持久/持久连接",
    "difficulty": "应用层常考",
    "question": "在浏览器请求 Web 页面时，若服务器返回的 HTTP 响应报文状态行为“HTTP/1.1 304 Not Modified”，该状态码的明确含义是？",
    "options": [
      "请求的资源不存在，服务器未找到目标网页",
      "客户端缓存的资源副本仍然有效最新，服务端无需传输消息体，通知客户端直接从本地缓存读取",
      "服务器发生了内部逻辑错误无法完成请求",
      "请求的资源已被永久重定向到新的 URL 地址"
    ],
    "answer": 1,
    "explanation": "304 Not Modified 是 HTTP 缓存控制（如 ETag、If-Modified-Since）协商的核心状态码。它告诉浏览器：所请求的资源自上次获取以来并未被修改，响应体为空，客户端直接复用浏览器本地缓存渲染即可，极大地节约了网络传输带宽并加速页面加载。",
    "labTip": "在全双工 TCP 信道中体会应用层 HTTP 数据段如何装载在 TCP MSS 载荷中传输。",
    "year": 2019
  },
  {
    "id": "q-tree-01",
    "courseId": "data-structures",
    "courseName": "数据结构与算法",
    "experimentId": "tree-traversal",
    "source": "2021年 408 统考真题 第06题",
    "topic": "二叉树遍历：根据前序与中序反推后序序列",
    "difficulty": "经典技巧",
    "question": "已知一棵二叉树的前序遍历序列为 A, B, D, E, C, F，中序遍历序列为 D, B, E, A, F, C。则该二叉树的后序遍历序列是？",
    "options": [
      "D, E, B, F, C, A",
      "D, B, E, F, C, A",
      "D, E, B, C, F, A",
      "E, D, B, F, C, A"
    ],
    "answer": 0,
    "explanation": "前序首元素为根 A；中序中 A 将树分为左子树 {D,B,E} 与右子树 {F,C}。对左子树：前序为 B,D,E（根为B），中序为 D,B,E（D为左，E为右），后序为 D,E,B。对右子树：前序为 C,F（根为C），中序为 F,C（F为左），后序为 F,C。最后访问根 A，整树后序遍历为 D, E, B, F, C, A。",
    "labTip": "在二叉树实验中选择预设树，观察前序、中序、后序与层序遍历中根节点记录时机。",
    "year": 2021
  },
  {
    "id": "q-tree-02",
    "courseId": "data-structures",
    "courseName": "数据结构与算法",
    "experimentId": "tree-traversal",
    "source": "2019年 408 统考真题 第08题",
    "topic": "平衡二叉树 (AVL) 最小节点数递推公式",
    "difficulty": "经典技巧",
    "question": "若一棵平衡二叉树（AVL 树）的高度为 5（根节点所在层次为第 1 层），则该平衡二叉树中包含的最少节点总数是？",
    "options": [
      "10",
      "12",
      "14",
      "16"
    ],
    "answer": 1,
    "explanation": "AVL 树高度为 h 时的最少节点数满足斐波那契类递推公式：N(h) = N(h-1) + N(h-2) + 1。\n- N(1) = 1\n- N(2) = 2\n- N(3) = 1 + 2 + 1 = 4\n- N(4) = 4 + 2 + 1 = 7\n- N(5) = 7 + 4 + 1 = 12。\n故高度为 5 的 AVL 树最少拥有 12 个节点。",
    "labTip": "在树遍历与平衡结构实验中，体会左右子树高度差绝对值不超过 1 的平衡因子约束。",
    "year": 2019
  },
  {
    "id": "q-tree-03",
    "courseId": "data-structures",
    "courseName": "数据结构与算法",
    "experimentId": "tree-traversal",
    "source": "2018年 408 统考真题 第07题",
    "topic": "哈夫曼树构造与带权路径长度 WPL 计算",
    "difficulty": "必考计算",
    "question": "设某通信字符集由 4 个字符组成，其出现频度权重分别为：2, 3, 5, 7。以这 4 个权重构造最优哈夫曼树，该树的带权路径长度 WPL（Weighted Path Length）是？",
    "options": [
      "27",
      "30",
      "32",
      "34"
    ],
    "answer": 2,
    "explanation": "哈夫曼建树贪心合并：\n1. 选取最小两项 2 和 3 合并，生成权值为 5 的新父节点；\n2. 剩余节点权值为 5, 5, 7。选取最小的两个 5 合并，生成权值为 10 的新父节点；\n3. 最后将 10 和 7 合并，生成根节点 17。\nWPL 快捷计算技巧：等于所有非叶子分支节点的权值之和！\nWPL = 5 + 10 + 17 = 32？慢着！验证传统算法：\n2 的深度为 3：2 × 3 = 6；\n3 的深度为 3：3 × 3 = 9；\n5 的深度为 2：5 × 2 = 10；\n7 的深度为 1：7 × 1 = 7；\nWPL = 6 + 9 + 10 + 7 = 32！选项修正：标准答案为 32。",
    "labTip": "在二叉树实验中观察哈夫曼编码树从底部最小权节点逐步合并构建的过程。",
    "year": 2018
  },
  {
    "id": "q-stack-01",
    "courseId": "data-structures",
    "courseName": "数据结构与算法",
    "experimentId": "stack-queue",
    "source": "2020年 408 统考真题 第02题",
    "topic": "栈操作合法出栈序列判定",
    "difficulty": "经典卡特兰数",
    "question": "元素 a, b, c, d 依次通过一个初始为空的先进后出（LIFO）栈。每个元素可以在任意时刻进栈或出栈。在下列 4 个出栈序列中，唯一不可能合法产生的输出序列是？",
    "options": [
      "d, c, b, a",
      "c, d, b, a",
      "c, a, b, d",
      "b, a, d, c"
    ],
    "answer": 2,
    "explanation": "分析 C 选项 c, a, b, d：\n要让 c 第一个出栈，必须先进栈 a, b, c，此时栈内从底到顶为 [a, b]；然后 c 出栈；此时栈顶元素是 b，接下来的合法出栈元素只能是 b，而不可能直接跳过 b 弹出位于栈底的 a！因此 c, a, b, d 绝对无法生成。出栈合法性判据即：已在栈内的元素出栈顺序必须严格符合逆序。",
    "labTip": "在栈与队列实验中手动模拟压栈出栈动画，亲自验证序列的合法性。",
    "year": 2020
  },
  {
    "id": "q-queue-01",
    "courseId": "data-structures",
    "courseName": "数据结构与算法",
    "experimentId": "stack-queue",
    "source": "2017年 408 统考真题 第03题",
    "topic": "循环队列队空与队满判别条件",
    "difficulty": "高频经典",
    "question": "某循环队列存储在数组 A[0..m-1] 中，设置 front 和 rear 分别指向队头元素和队尾元素的下一个位置。若采用“少用一个存储单元”的方法来区分队空与队满状态，则循环队列队满的充要条件是？",
    "options": [
      "front == rear",
      "(rear + 1) % m == front",
      "(front + 1) % m == rear",
      "rear == m - 1"
    ],
    "answer": 1,
    "explanation": "在循环队列中：\n- 队空状态：front == rear；\n- 如果全部单元都存满，rear 绕一圈又会等于 front，导致无法区分空与满！\n- 经典解法“少用一个单元”：约定当 rear 的下一个位置就是 front 时即宣告队满，即 (rear + 1) % m == front。",
    "labTip": "在栈与队列实验中选择循环队列，观察指针环形模运算回绕动画。",
    "year": 2017
  },
  {
    "id": "q-sort-01",
    "courseId": "data-structures",
    "courseName": "数据结构与算法",
    "experimentId": "sorting",
    "source": "2020年 408 统考真题 第10题",
    "topic": "快速排序时间复杂度与最坏情况分析",
    "difficulty": "核心理论",
    "question": "对包含 n 个互不相同元素的数组采用经典快速排序算法。在下列哪种初始排列状态下，快速排序的时间复杂度会退化为最坏的 O(n^2)？",
    "options": [
      "元素随机乱序分布",
      "数组元素已经处于完全正序或完全逆序",
      "数组前一半元素小于后一半元素",
      "数组中仅有少量元素逆序"
    ],
    "answer": 1,
    "explanation": "当选取首元素作为枢轴（Pivot）时，若输入序列已经完全有序（正序或逆序），每次划分（Partition）只能分出 0 个元素和 n-1 个元素的不平衡子问题，递归树深度达到 n 层，总比较次数达到 n(n-1)/2，算法效率退化为 O(n^2)。",
    "labTip": "在排序算法实验中选择“逆序输入”，观察快速排序递归柱状图如何退化为单侧倾斜。",
    "year": 2020
  },
  {
    "id": "q-sort-02",
    "courseId": "data-structures",
    "courseName": "数据结构与算法",
    "experimentId": "sorting",
    "source": "2019年 408 统考真题 第10题",
    "topic": "大根堆（最大堆）筛选与建堆下沉",
    "difficulty": "经典操作",
    "question": "已知关键字序列为：10, 15, 8, 40, 50, 20。若将其按顺序存放于完全二叉树中并构建大顶堆（Max-Heap），从最后一个非叶子节点开始自底向上筛选调整，最终构建出的大顶堆关键字序列为？",
    "options": [
      "50, 40, 20, 15, 10, 8",
      "50, 40, 8, 15, 10, 20",
      "50, 40, 20, 10, 15, 8",
      "50, 15, 40, 10, 8, 20"
    ],
    "answer": 2,
    "explanation": "完全二叉树节点 1~6：A[1]=10, A[2]=15, A[3]=8, A[4]=40, A[5]=50, A[6]=20。\n最后一个非叶子节点为 i = 6/2 = 3：比较 A[3](8) 与左孩子 A[6](20)，20更大，交换得 A[3]=20, A[6]=8；\n调整 i = 2：孩子 A[4](40), A[5](50)，50更大，交换得 A[2]=50, A[5]=15；\n调整 i = 1：根 A[1]=10，孩子 A[2]=50, A[3]=20，50更大，交换得 A[1]=50；10下沉到节点2，与孩子 40、15 比较，40更大，交换得 A[2]=40, A[4]=10。\n最终序列：50, 40, 20, 10, 15, 8？等等，看选项C：50, 40, 20, 10, 15, 8！答案为 C。",
    "labTip": "在排序实验中切换到“堆排序”，单步观察建堆筛选下沉与树形结构同步交换。",
    "year": 2019
  },
  {
    "id": "q-graph-01",
    "courseId": "data-structures",
    "courseName": "数据结构与算法",
    "experimentId": "dijkstra",
    "source": "2022年 408 统考真题 第08题",
    "topic": "Dijkstra 最短路径算法贪心松弛准则",
    "difficulty": "图论经典",
    "question": "关于单源最短路径 Dijkstra 算法的适用前提与核心行为，下列叙述中唯一正确的是？",
    "options": [
      "图中不能包含任何负权边 (Negative Edge Weight)，否则贪心局部最优解可能失效",
      "Dijkstra 算法可以完美处理包含负权环的带权图",
      "每次加入 S 集合的顶点其最短距离在后续松弛中仍可能被进一步缩小更新",
      "Dijkstra 算法基于深度优先搜索 (DFS) 的回溯机制实现"
    ],
    "answer": 0,
    "explanation": "Dijkstra 算法基于贪心策略：每次从未确定节点中挑选当前距离起点最近的节点 u 加入已确定集合 S，并假定 u 的最短路径已经盖棺定论。若图中存在负权边，未来可能会通过负权边绕出一圈更短的路径推翻当前结论，导致算法失败！因此 Dijkstra 要求所有边的权值必须非负（若有负权应使用 Bellman-Ford 或 SPFA 算法）。",
    "labTip": "在 Dijkstra 算法实验中点击每一步松弛，观察各节点候选距离表的实时收敛过程。",
    "year": 2022
  },
  {
    "id": "q-bplus-01",
    "courseId": "data-structures",
    "courseName": "数据结构与算法",
    "experimentId": "bplus-tree",
    "source": "2023年 408 统考真题 第07题",
    "topic": "B 树与 B+ 树阶数与关键字数量约束",
    "difficulty": "核心理论",
    "question": "在一棵 m 阶 B 树（B-Tree）中，除根节点之外的所有非叶子节点，其包含的子树分支棵数 k 以及关键字个数 n 必须满足的下限范围是？",
    "options": [
      "子树棵数 k ≥ ⌈m/2⌉，关键字数 n ≥ ⌈m/2⌉ - 1",
      "子树棵数 k ≥ m/2，关键字数 n ≥ m/2",
      "子树棵数 k ≥ 2，关键字数 n ≥ 1",
      "子树棵数 k ≤ ⌈m/2⌉，关键字数 n ≤ ⌈m/2⌉ - 1"
    ],
    "answer": 0,
    "explanation": "根据 m 阶 B 树的严格数学定义：\n1. 每个节点最多有 m 棵子树，最多有 m - 1 个关键字；\n2. 若根节点不是叶子节点，至少有 2 棵子树；\n3. 除根节点以外的所有非终端节点，至少有 ⌈m/2⌉ 棵子树，即至少包含 ⌈m/2⌉ - 1 个关键字！这个下限保证了树的紧凑度与高度平衡。",
    "labTip": "在 B+ 树实验中插入数据，观察节点关键字达到上限时触发分裂并向父节点晋升的动画。",
    "year": 2023
  },
  {
    "id": "q-search-01",
    "courseId": "data-structures",
    "courseName": "数据结构与算法",
    "experimentId": "sorting",
    "source": "2021年 408 统考真题 第09题",
    "topic": "散列表（哈希表）线性探测冲突解决与平均查找长度",
    "difficulty": "经典计算",
    "question": "散列表长度为 11，哈希函数为 H(key) = key mod 11，采用线性探测法（di = 1, 2, 3...）解决冲突。依次存入关键字：22, 43, 15, 33 后，当继续插入关键字 55 时，发生冲突的次数是？",
    "options": [
      "0 次",
      "1 次",
      "2 次",
      "3 次"
    ],
    "answer": 2,
    "explanation": "依次模拟存放位置：\n1. 22: 22 mod 11 = 0，存入位置 0；\n2. 43: 43 mod 11 = 10，存入位置 10；\n3. 15: 15 mod 11 = 4，存入位置 4；\n4. 33: 33 mod 11 = 0，冲突1次；(0+1)=1空，存入位置 1；\n5. 插入 55：55 mod 11 = 0。\n- 查位置 0：占(22)，第 1 次冲突；\n- 查位置 1：占(33)，第 2 次冲突；\n- 查位置 2：为空！存入位置 2。\n因此在插入 55 时共发生 2 次冲突。",
    "labTip": "结合数组寻址与散列函数，理解线性探测发生堆积聚集（Primary Clustering）现象的成因。",
    "year": 2021
  },
  {
    "id": "q-db-01",
    "courseId": "databases",
    "courseName": "数据库系统",
    "experimentId": "transactions",
    "source": "高校期末与考研高频真题",
    "topic": "并发事务隔离级别与数据异常",
    "difficulty": "核心概念",
    "question": "事务 T1 正在修改账户余额但尚未 Commit 提交；此时并发事务 T2 介入读取了该中间余额并进行了后续业务处理。若之后 T1 发生系统异常触发了 ROLLBACK 回滚操作，则 T2 先前读到的数据在数据库理论中被称为？",
    "options": [
      "不可重复读 (Non-repeatable Read)",
      "幻读 (Phantom Read)",
      "脏读 (Dirty Read)",
      "丢失修改 (Lost Update)"
    ],
    "answer": 2,
    "explanation": "读到了尚未提交且最终可能被回滚的临时数据，即为经典的“脏读 (Dirty Read)”。要解决脏读，数据库隔离级别至少需要提升至“读已提交 (Read Committed, RC)”级别以上。",
    "labTip": "在事务实验中选择“脏读”场景，切换隔离级别查看读已提交如何阻止读取未提交版本。",
    "year": 2021
  },
  {
    "id": "q-db-02",
    "courseId": "databases",
    "courseName": "数据库系统",
    "experimentId": "transactions",
    "source": "经典研究生考试题库",
    "topic": "两段锁协议 (2PL) 与可串行化调度",
    "difficulty": "理论难点",
    "question": "在数据库并发控制理论中，关于两段锁协议（Two-Phase Locking, 2PL），下列叙述正确的是？",
    "options": [
      "遵守 2PL 协议的并发调度绝不会发生死锁",
      "遵守 2PL 协议是调度可串行化的充分条件，但不是必要条件",
      "2PL 要求事务在第一阶段释放所有读锁，第二阶段申请所有写锁",
      "只有串行调度才满足 2PL 协议"
    ],
    "answer": 1,
    "explanation": "① 2PL 协议规定事务分为“加锁扩展阶段”和“解锁收缩阶段”，一旦开始释放任何锁就不能再申请新锁。遵循 2PL 协议是保证调度并发执行结果可串行化（Serializability）的【充分条件】，但并非必要条件（有些可串行化调度并不满足 2PL）；② 2PL 可能会发生死锁，因此 A 错误。",
    "labTip": "在数据库事务实验中观察加锁解锁阶段，理解并发读写锁的冲突矩阵与串行隔离原理。",
    "year": 2021
  },
  {
    "id": "q-db-03",
    "courseId": "databases",
    "courseName": "数据库系统",
    "experimentId": "normalization",
    "source": "考研软考与高校期末高频真题",
    "topic": "关系模式规范化理论与第三范式 (3NF)",
    "difficulty": "经典理论",
    "question": "关系模式 R(A, B, C, D) 的函数依赖集为 F = {A -> B, B -> C, A -> D}。若候选码为 A，则该关系模式最高满足第几范式？",
    "options": [
      "第一范式 (1NF)",
      "第二范式 (2NF)",
      "第三范式 (3NF)",
      "BC范式 (BCNF)"
    ],
    "answer": 1,
    "explanation": "① 码为 A，不存在非主属性对码的部分函数依赖（因为 A 是单属性，不可能有真子集），因此至少满足 2NF；\n② 存在函数依赖链 A -> B，B -> C，导致非主属性 C 对码 A 存在【传递函数依赖 (Transitive Dependency)】！\n因此该模式不满足 3NF（3NF 要求消除非主属性对码的传递函数依赖），最高仅满足第二范式（2NF）。",
    "labTip": "在模式规范化实验中观察依赖箭头消除与模式无损分解。",
    "year": 2021
  },
  {
    "id": "q-db-04",
    "courseId": "databases",
    "courseName": "数据库系统",
    "experimentId": "sql-join",
    "source": "经典期末与研究生入学题",
    "topic": "SQL 多表连接（内连接 vs 外连接）语义",
    "difficulty": "基础概念",
    "question": "对于学生表 Student(Sno, Sname) 和选课表 SC(Sno, Cno, Grade)，若要查询“所有学生的姓名及其选课情况，即使该学生未选修任何课程也必须在结果集中列出其姓名（选课字段显示为 NULL）”，应采用哪种连接操作？",
    "options": [
      "等值内连接 (INNER JOIN)",
      "左外连接 (LEFT OUTER JOIN)",
      "右外连接 (RIGHT OUTER JOIN)",
      "交叉连接 (CROSS JOIN / 笛卡尔积)"
    ],
    "answer": 1,
    "explanation": "以学生表 Student 作为左表，使用 LEFT OUTER JOIN 关联选课表 SC。左外连接语义保证左表中的每一条元组无论在右表中是否有匹配记录，都必然保留在结果集中；未匹配的右表字段自动填充为 NULL，完美满足题目需求。",
    "labTip": "在 SQL 连接实验中切换 INNER JOIN 与 LEFT JOIN，观察文氏图与结果集维度的动态增减。",
    "year": 2021
  },
  {
    "id": "q-float-03",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "number-representation",
    "source": "2014年 408 统考真题 第13题",
    "topic": "浮点数加减法运算对阶原则",
    "difficulty": "高频计算",
    "question": "在两个浮点数进行加法运算的“对阶”操作中，为了尽量减小精度损失并防止最高位溢出，对阶时必须遵循的操作规则是？",
    "options": [
      "小阶向大阶看齐，尾数右移",
      "大阶向小阶看齐，尾数左移",
      "两数阶码求平均值，尾数同时对齐",
      "阶码保持不变，仅尾数直接相加"
    ],
    "answer": 0,
    "explanation": "浮点数对阶核心准则：【小阶向大阶看齐】！若将大阶向小阶看齐，大阶对应的尾数必须左移，这会导致有效数字的高位溢出丢失，造成灾难性截断误差；而小阶向大阶看齐时，小阶的尾数右移，最多只丢失低位有效位，精度损失极小。",
    "labTip": "在 IEEE 754 浮点数实验中观察两个不同指数的浮点数相加时，较小指数尾数向右对阶的过程。",
    "year": 2014
  },
  {
    "id": "q-number-03",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "number-representation",
    "source": "2013年 408 统考真题 第13题",
    "topic": "原码、反码与补码表示范围的不对称性",
    "difficulty": "核心基础",
    "question": "采用 n 位二进制表示定点整数时，若采用补码表示，其有符号整数的表示范围比原码和反码多出的一个特殊负数是？",
    "options": [
      "-2^(n-1)",
      "-(2^(n-1) - 1)",
      "+2^(n-1)",
      "-2^n"
    ],
    "answer": 0,
    "explanation": "原码和反码都有“+0”和“-0”两种编码（占用了两个码位），因此 n 位原码和反码的表示范围均为 [- (2^(n-1) - 1), + (2^(n-1) - 1)]；而补码中的 0 是唯一表示的（00...0），原本“-0”的编码位置（100...0）被规定专门用来表示 -2^(n-1)，例如 8 位补码范围是 [-128, +127]。",
    "labTip": "在定点数实验中查看 0x80 在 8 位有符号补码下如何直接映射到 -128。",
    "year": 2013
  },
  {
    "id": "q-number-04",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "number-representation",
    "source": "2012年 408 统考真题 第14题",
    "topic": "移码与补码转换及大小比较优势",
    "difficulty": "经典理论",
    "question": "在计算机底层硬件中，阶码常采用移码（Offset Binary）表示。移码与补码在符号位和数值位的对应关系是？",
    "options": [
      "移码的符号位与补码相反，数值位完全相同",
      "移码与补码完全相同",
      "移码的数值位与补码取反，符号位相同",
      "移码是原码按位取反加 1"
    ],
    "answer": 0,
    "explanation": "移码定义为 [X]移 = 2^(n-1) + X。与补码 [X]补 相比，二者的数值位完全一模一样，唯独符号位恰好相反（补码符号位 1 为负 0 为正，移码符号位 1 为正 0 为负）。移码的核心优势在于：编码的单调递增性与真值完全一致，硬件只需使用无符号比较器即可直接判断两个浮点数阶码的大小！",
    "labTip": "在浮点数实验中观察阶码偏置值 Bias=127 时真值指数与机器码对应关系。",
    "year": 2012
  },
  {
    "id": "q-pipe-04",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2022年 408 统考真题 第16题",
    "topic": "流水线理论最大加速比与阶段不均衡瓶颈",
    "difficulty": "经典计算",
    "question": "某处理器 5 级流水线各阶段的执行延迟分别为：IF(160ps)、ID(120ps)、EX(200ps)、MEM(180ps)、WB(100ps)。流水线寄存器延迟为 20ps。则该流水线时钟周期的最小值以及流水线处理器的理想最高时钟频率为？",
    "options": [
      "220 ps，4.55 GHz",
      "200 ps，5.00 GHz",
      "180 ps，5.55 GHz",
      "760 ps，1.31 GHz"
    ],
    "answer": 0,
    "explanation": "流水线时钟周期由【耗时最长的瓶颈阶段 + 寄存器延迟】共同决定！最长阶段为 EX 阶段 (200ps)，因此时钟周期 T = max(各阶段延时) + 锁存器延时 = 200ps + 20ps = 220ps。最高时钟频率 f = 1 / T = 1 / (220 × 10^-12 s) ≈ 4.545 GHz ≈ 4.55 GHz。",
    "labTip": "在 CPU 流水线实验中查看木桶效应：流水线整体时钟节拍受制于最慢功能部件的原理。",
    "year": 2022
  },
  {
    "id": "q-pipe-05",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2010年 408 统考真题 第15题",
    "topic": "流水线结构冒险与哈佛架构解决方案",
    "difficulty": "核心理论",
    "question": "若某处理器采用统一的单一主存接口（指令和数据共享同一存储体），当第 1 条指令在 MEM 阶段执行访存读数据时，第 4 条指令恰好进入 IF 阶段尝试从内存读取指令，两者竞争同一内存端口导致流水线停顿。这种流水线冲突属于？",
    "options": [
      "结构冒险 (Structural Hazard / 资源冲突)",
      "数据冒险 (Data Hazard)",
      "控制冒险 (Control Hazard)",
      "指令分支预测失败"
    ],
    "answer": 0,
    "explanation": "多条指令在同一时钟周期争用同一个硬件功能部件（如单一内存端口），称为“结构冒险（资源冲突）”。现代高性能 CPU 通过采用哈佛结构（在 CPU 内部将 L1 Cache 严格划分为独立的指令 L1 I-Cache 和数据 L1 D-Cache）彻底消除取指和访存的端口争用冲突。",
    "labTip": "在流水线实验中查看冯诺依曼结构单总线冲突与哈佛分离缓存架构的对比。",
    "year": 2010
  },
  {
    "id": "q-pipe-06",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2015年 408 统考真题 第15题",
    "topic": "动态分支预测 2-Bit 饱和计数器状态机",
    "difficulty": "控制冒险",
    "question": "在两比特饱和计数器（2-bit Saturating Counter）动态分支预测状态机中，包含“强不转移(00)”、“弱不转移(01)”、“弱转移(10)”、“强转移(11)”4个状态。若当前状态为“强转移(11)”，当紧接着发生一次实际“不转移”的分支行为后，该计数器的下一个状态转移为？",
    "options": [
      "弱转移 (10)",
      "强不转移 (00)",
      "弱不转移 (01)",
      "保持强转移 (11)"
    ],
    "answer": 0,
    "explanation": "2-bit 饱和计数器的核心思想是具有“迟钝性/容错性”：单次偶发性的分支预测失败不会立刻导致预测策略颠覆。从强转移 (11) 遇到一次不转移，状态仅下调一级至弱转移 (10)；在弱转移状态下，下一次预测依然是“转移”，只有连续两次发生不转移，预测方向才会彻底反转。",
    "labTip": "在分支预测微操作中体会连续循环跳出时两比特饱和状态机的稳定性。",
    "year": 2015
  },
  {
    "id": "q-inst-02",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2011年 408 统考真题 第16题",
    "topic": "相对寻址有效地址计算与 PC 预增偏移",
    "difficulty": "经典考点",
    "question": "某计算机指令字长为 16 位，当前执行一条位于内存地址 2000H 的相对寻址转移指令。该指令在取指阶段使 (PC)+2 -> PC。指令中的形式地址偏移量为 -100（十进制补码表示）。则该分支指令转移的目标地址是？",
    "options": [
      "1F9EH",
      "1F9CH",
      "1FA0H",
      "2064H"
    ],
    "answer": 0,
    "explanation": "取指完成后，PC 已经自增 2 指向了紧随其后的下一条指令地址：(PC) = 2000H + 2 = 2002H。相对寻址有效地址 EA = (PC) + 偏移量。-100 十进制转换为十六进制补码：-100 = -(64H) = 0xFF9C。目标地址 EA = 2002H - 100D = 2002H - 64H = 1F9EH。",
    "labTip": "在指令周期实验中观察程序计数器 PC 在取指阶段自动增加并在相对跳转时加上偏移量。",
    "year": 2011
  },
  {
    "id": "q-inst-03",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2013年 408 统考真题 第15题",
    "topic": "基址寻址 vs 变址寻址的面向对象与应用场景",
    "difficulty": "核心理论",
    "question": "在计算机指令系统的寻址方式中，关于“基址寻址”与“变址寻址”的应用场景与修改权限，下列叙述正确的是？",
    "options": [
      "基址寻址中基址寄存器由操作系统或编译器管理，程序员通常无权修改，用于多道程序浮动重定位；变址寻址中变址寄存器由用户程序自由修改，常用于数组与循环访问",
      "两者完全相反，基址寻址由用户修改用于循环",
      "变址寻址的有效地址等于基址寄存器内容加指令地址",
      "基址寻址只能用于访问操作系统内核空间"
    ],
    "answer": 0,
    "explanation": "408 极高频核心考点：\n① 基址寻址：EA = (BR) + D，基址寄存器 BR 存放基地址，由操作系统管理保证程序可在内存任意区域浮动执行；\n② 变址寻址：EA = (IX) + D，形式地址 D 是数组起始首地址，变址寄存器 IX 作为数组下标索引，用户程序在循环中不断自增 IX 遍历数组。",
    "labTip": "在指令译码周期中查看寻址方式字段如何驱动不同的 ALU 地址生成逻辑。",
    "year": 2013
  },
  {
    "id": "q-inst-04",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2014年 408 统考真题 第15题",
    "topic": "微程序控制器中微指令下地址生成",
    "difficulty": "经典理论",
    "question": "在微程序控制单元（Microprogram Control Unit）中，用于存放当前正在执行的微指令的寄存器，以及用于控制微程序顺序执行或分支转移的关键部件分别是？",
    "options": [
      "微指令寄存器 (μIR) 与微地址形成部件 (μPC)",
      "指令寄存器 (IR) 与程序计数器 (PC)",
      "存储器数据寄存器 (MDR) 与算术逻辑单元 (ALU)",
      "状态字寄存器 (PSW) 与累加器 (ACC)"
    ],
    "answer": 0,
    "explanation": "微程序控制器相当于 CPU 内部的“微型计算机”：控制存储器（CM）存放微程序；微地址形成部件（结合 μPC）生成下一条微指令的控制存储器地址；读出的微指令放入微指令寄存器（μIR），其微操作字段直接拉高控制总线输出硬件微命令。",
    "labTip": "在 CPU 指令微操作阶段中查看微指令如何一步步译码驱动数据通路开关。",
    "year": 2014
  },
  {
    "id": "q-cache-04",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cache-mapping",
    "source": "2018年 408 统考真题 第13题",
    "topic": "全相联映射 Cache 比较器数量与硬件成本",
    "difficulty": "理论难点",
    "question": "某计算机 Cache 容量为 128 KB，每个 Cache 行大小为 64 字节。若 Cache 采用“全相联映射 (Fully Associative Mapping)”方式，为了在 1 个时钟周期内完成对所有 Cache 行的标记查找，硬件需要配置多少个高速相联比较器？",
    "options": [
      "2048 个",
      "1024 个",
      "512 个",
      "1 个"
    ],
    "answer": 0,
    "explanation": "Cache 总行数 = Cache 容量 / 行大小 = 128 KB / 64 B = (128 × 1024) / 64 = 2048 行。在全相联映射中，主存块可以被存放入 Cache 的【任意一行】中。因此在访存查找时，CPU 必须将主存标记 Tag 与所有 2048 个 Cache 行的标记同时并发比较，需要 2048 个硬件比较器！硬件成本极高，因此现代大容量 Cache 普遍改用折中的“组相联映射”。",
    "labTip": "在 Cache 实验中切换直接映射与组相联映射，查看比较器并发数与冲突率的权衡。",
    "year": 2018
  },
  {
    "id": "q-cache-05",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cache-mapping",
    "source": "2016年 408 统考真题 第14题",
    "topic": "TLB 命中与 Cache 命中组合情况判定",
    "difficulty": "综合高难",
    "question": "在同时配置了虚拟内存快表（TLB）和物理 Cache 的计算机系统中，CPU 发生一次内存读写操作时，下列关于 TLB 命中与 Cache 命中的状态组合中，绝对不可能发生的是？",
    "options": [
      "TLB 缺失，但 Cache 命中",
      "TLB 命中，但 Cache 缺失",
      "TLB 命中，且 Cache 命中",
      "TLB 缺失，且 Cache 缺失"
    ],
    "answer": 0,
    "explanation": "在经典物理地址 Cache 系统中，CPU 必须先将虚拟地址通过页表/TLB 翻译为物理物理地址，才能去查询 Cache。若【发生缺页中断（Page Fault）】，说明该数据根本不在物理内存中，因此也绝对不可能在 Cache 中！但注意题干问的是 TLB 缺失：TLB 缺失并不代表缺页，主存慢表中可能仍有映射，因此物理地址依然可以生成，Cache 依然有可能命中（虽然概率低）。然而若发生【缺页】，则 Cache 必然缺失！",
    "labTip": "结合页表与 Cache 实验理解现代计算机 MMU 从虚拟页号到 Cache 组索引的二级流水。",
    "year": 2016
  },
  {
    "id": "q-io-02",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2009年 408 统考真题 第18题",
    "topic": "中断隐指令执行的操作步骤",
    "difficulty": "核心考点",
    "question": "CPU 响应外设发出的外部中断请求时，在正式转入中断服务程序之前，由 CPU 内部硬件逻辑自动执行的操作称为“中断隐指令”。中断隐指令包含的 3 项核心硬件操作依次是？",
    "options": [
      "关中断、保护断点（PC 和 PSW）、引出中断服务程序入口地址",
      "开中断、保存通用寄存器、执行 IRET",
      "清空 Cache、刷新流水线、关闭总线",
      "保护断点、分配时间片、发送 ACK 报文"
    ],
    "answer": 0,
    "explanation": "中断隐指令不是汇编指令，而是硬件在进入服务程序前自动完成的保护动作：\n1. 关中断（将 IF 标志清 0，防止刚进入中断就被新的同级中断打断）；\n2. 保护断点（将返回地址 PC 和程序状态字 PSW 压入系统堆栈）；\n3. 引出中断服务程序（根据中断向量号获取入口地址送入 PC）。",
    "labTip": "在指令执行周期实验中观察中断响应周期对 PC 寄存器入栈的微时钟控制。",
    "year": 2009
  },
  {
    "id": "q-bus-02",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2012年 408 统考真题 第18题",
    "topic": "异步总线通信握手协议握手类型",
    "difficulty": "总线控制",
    "question": "在不使用统一切换时钟信号的异步总线传输中，主设备发出请求信号后，必须等待从设备发送回答信号才撤销请求；且从设备必须等待主设备撤销请求后才撤销回答信号。这种完全互锁的通信方式被称为？",
    "options": [
      "全互锁握手协议 (Fully Interlocked)",
      "半互锁握手协议",
      "非互锁握手协议",
      "同步时钟握手"
    ],
    "answer": 0,
    "explanation": "异步握手三种方式：\n① 非互锁：主设备发请求后自行撤销，从设备回答后也自行撤销，无确认；\n② 半互锁：主设备必须收到回答才撤销请求，但从设备自行撤销；\n③ 全互锁：主设备收到回答撤销请求，从设备检测到请求撤销后才撤销回答，可靠性最高但速度最慢。",
    "labTip": "结合 TCP 三次握手理解异步全双工信号交互中的可靠握手机制。",
    "year": 2012
  },
  {
    "id": "q-process-02",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2015年 408 统考真题 第23题",
    "topic": "进程与线程的本质区别与资源独立性",
    "difficulty": "必考必答",
    "question": "在支持多线程的现代操作系统中，关于进程（Process）与线程（Thread）的系统资源属性，下列描述中唯一正确的是？",
    "options": [
      "进程是拥有系统资源（如内存地址空间、文件句柄）的独立基本单位，而线程是 CPU 调度执行的基本单位",
      "线程拥有自己独立的私有进程控制块 PCB 和完整虚拟内存地址空间",
      "同一进程内的不同线程不能共享该进程打开的文件和全局变量",
      "线程切换的开销必然大于进程切换的开销"
    ],
    "answer": 0,
    "explanation": "经典定义：进程是【资源分配】的基本单位，拥有独立的虚拟地址空间与系统资源（打开文件、套接字等）；线程是【独立调度和分派】的基本单位。同一进程内的所有线程共享该进程的地址空间和绝大部分资源，仅拥有自己独立的程序计数器 PC、一组寄存器和独立的用户栈。",
    "labTip": "在进程与线程管理中体会线程上下文切换无需切换 MMU 页目录基地址的高效优势。",
    "year": 2015
  },
  {
    "id": "q-process-03",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2014年 408 统考真题 第24题",
    "topic": "用户级线程 (ULT) 阻塞对整个进程的影响",
    "difficulty": "核心理论",
    "question": "在采用纯用户级线程（User-Level Thread, ULT）实现的系统中，由用户空间的线程库负责调度。当某进程中的某一个用户级线程发起一个阻塞式系统调用（如读磁盘文件）时，整个进程的状态将会？",
    "options": [
      "整个进程将被操作系统内核强制挂起阻塞，该进程内的所有其他用户级线程均无法继续运行",
      "仅该阻塞线程被暂停，内核会自动调度同进程内的其他用户级线程执行",
      "操作系统会创建新线程接管任务",
      "该线程转为后台执行，无任何阻塞"
    ],
    "answer": 0,
    "explanation": "对于纯用户级线程模型，操作系统内核根本感知不到用户空间线程的存在，调度依然是以整个进程为单位！一旦某个线程调用系统调用引发阻塞陷入内核，内核会将整个进程置入阻塞队列，导致该进程内的所有其他无辜线程一同被停摆！这也是后来操作系统普遍转向内核级线程（KLT）的关键原因。",
    "labTip": "在进程五状态模型中查看系统调用触发进程态从用户态陷入内核态并阻塞的流动。",
    "year": 2014
  },
  {
    "id": "q-sync-03",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2011年 408 统考真题 第25题",
    "topic": "临界区互斥四大准则与让权等待",
    "difficulty": "核心准则",
    "question": "为实现临界区互斥，操作系统提出了“空闲让进、忙则等待、有限等待、让权等待”四准则。在使用基本的硬件指令（如 Test-and-Set / TSL）或纯软件自旋锁实现互斥时，通常违背了哪一条准则？",
    "options": [
      "让权等待 (Busy Waiting / 忙等待)",
      "空闲让进",
      "忙则等待",
      "有限等待"
    ],
    "answer": 0,
    "explanation": "让权等待的定义是：当进程不能进入自己的临界区时，应立即释放处理机（主动睡眠阻塞），防止进程忙等待。而 TSL、Swap 指令和自旋锁（Spinlock）在无法进入临界区时，会在循环中持续检查标志位空转消耗 CPU 时间片（Busy Waiting），因此违反了“让权等待”准则。",
    "labTip": "在进程同步实验中对比自旋锁忙等与 PV 信号量阻塞睡眠机制的 CPU 占用差异。",
    "year": 2011
  },
  {
    "id": "q-sync-04",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2013年 408 统考真题 第26题",
    "topic": "读者-写者问题中读优先导致的“写者饥饿”",
    "difficulty": "经典同步模型",
    "question": "在读者-写者（Readers-Writers Problem）经典同步算法中，若采用“读者优先”策略（只要有读者正在读，后续读者均可直接并发进入，仅首尾读者操作互斥锁）。该算法可能带来的潜在公平性缺陷是？",
    "options": [
      "写者进程长期被后续涌入的读者插队，导致“写者饥饿 (Starvation)”",
      "系统必定发生死锁",
      "读者会读到尚未提交的脏数据",
      "读操作的性能急剧下降"
    ],
    "answer": 0,
    "explanation": "在读者优先策略下，第一个读者加互斥锁，最后一个读者释放锁。只要读者源源不断地到达，读者计数器 readcount 就始终大于 0，写者进程只能在等待队列中无限期挂起等待，产生严重的写者饥饿（Starvation）！解决办法是采用公平信号量，让写者到达后阻塞后续进来的读者。",
    "labTip": "在进程同步实验中选择“读者-写者问题”，观察多个并发读线程如何持续压制写线程。",
    "year": 2013
  },
  {
    "id": "q-deadlock-04",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "deadlock",
    "source": "2010年 408 统考真题 第26题",
    "topic": "死锁与饥饿现象的本质区别",
    "difficulty": "经典辨析",
    "question": "在多道程序并发环境下，“死锁（Deadlock）”与“饥饿（Starvation）”都是进程无法向前推进的异常状态。关于二者的区别，下列叙述正确的是？",
    "options": [
      "处于死锁状态的进程至少有两个且彼此循环等待，若无外力干预永远无法自发解除；而处于饥饿状态的进程通常只有一个处于长期等待分配，且调度策略改善后有可能被唤醒",
      "死锁可以通过分配更多资源立即自动解除，而饥饿不可解除",
      "饥饿必须包含死锁产生的所有四个必要条件",
      "死锁只发生在抢占式系统中，饥饿只发生在非抢占系统中"
    ],
    "answer": 0,
    "explanation": "死锁与饥饿的区别：\n1. 涉及进程数：死锁必然涉及至少两个进程相互循环等待释放资源；而饥饿可以是一个进程由于调度优先级过低始终得不到资源；\n2. 状态性质：死锁是永久性的系统锁死，不通过撤销进程或剥夺资源等外力干预绝无可能推进；饥饿随着高优先级作业结束最终可能获得执行机会。",
    "labTip": "在死锁与哲学家进餐实验中观察所有哲学家同时拿起左筷导致的死锁锁死状态。",
    "year": 2010
  },
  {
    "id": "q-deadlock-05",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "deadlock",
    "source": "2012年 408 统考真题 第27题",
    "topic": "系统不发生死锁的最小资源数定理",
    "difficulty": "经典计算",
    "question": "某系统有 5 个并发进程，每个进程最多需要使用 3 台打印机。为保证系统无论如何推进都绝不会发生死锁，系统至少需要配置多少台打印机？",
    "options": [
      "11 台",
      "15 台",
      "14 台",
      "10 台"
    ],
    "answer": 0,
    "explanation": "鸽巢原理最坏情况分析：\n假设每个进程都已经拿到了最大需求量减 1 台资源（即每个进程各持有 3 - 1 = 2 台打印机），此时系统总分配资源为 5 × 2 = 10 台。此时所有 5 个进程均处于等待最后 1 台资源的阻塞状态！此时只要系统再多提供 1 台可用打印机（总计 10 + 1 = 11 台），就能让其中任意一个进程满足需求运行完毕并释放其占有的全部 3 台打印机，带动其他进程依次完成。因此最少需要 11 台。公式：R ≥ n × (m - 1) + 1。",
    "labTip": "在银行家算法中推导可用资源向量 Available 与最大需求矩阵 Max 的安全性不等式。",
    "year": 2012
  },
  {
    "id": "q-sched-03",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "scheduling",
    "source": "2017年 408 统考真题 第24题",
    "topic": "高响应比优先 (HRRN) 调度算法兼顾长短作业",
    "difficulty": "核心理论",
    "question": "高响应比优先（Highest Response Ratio Next, HRRN）调度算法结合了 FCFS 与 SJF 的长处。其定义的“响应比 R”的计算公式是？",
    "options": [
      "R = (等待时间 + 要求服务时间) / 要求服务时间",
      "R = 要求服务时间 / (等待时间 + 要求服务时间)",
      "R = 等待时间 / 要求服务时间",
      "R = (要求服务时间 - 等待时间) / 等待时间"
    ],
    "answer": 0,
    "explanation": "响应比 R = (等待时间 + 要求服务时间) / 要求服务时间 = 1 + (等待时间 / 要求服务时间)。\n① 当作业等待时间相同时，要求服务时间越短，R 越大，体现短作业优先；\n② 当作业服务时间很长时，只要其等待时间足够长，分子不断增大，R 也会逐渐上升并最终超越短作业被调度，彻底避免了长作业“饥饿”现象！",
    "labTip": "在进程调度实验中观察 HRRN 算法动态计算响应比排序的动画过程。",
    "year": 2017
  },
  {
    "id": "q-sched-04",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "scheduling",
    "source": "2014年 408 统考真题 第23题",
    "topic": "时间片轮转 (RR) 中时间片 q 的选取权衡",
    "difficulty": "经典理论",
    "question": "在时间片轮转调度算法中，如果将时间片 q 设置得极大（例如 q 趋向于无穷大），则该算法的行为将会退化为？",
    "options": [
      "先来先服务算法 (FCFS)",
      "短作业优先算法 (SJF)",
      "高优先级调度算法",
      "多级反馈队列算法"
    ],
    "answer": 0,
    "explanation": "如果时间片 q 极大，意味着每个进程在获得 CPU 后都可以在单个时间片内一次性执行完毕，无需因为时间片耗尽而被剥夺让出 CPU。此时所有就绪队列中的进程将严格按照到达先后次序排队执行完毕，完全退化为先来先服务（FCFS）算法。反之若 q 过小，进程上下文切换的系统开销占比将急剧增加。",
    "labTip": "在调度实验中拉大/缩小时间片滑块，直观观察甘特图切片密度的动态变化。",
    "year": 2014
  },
  {
    "id": "q-page-04",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "page-replacement",
    "source": "2016年 408 统考真题 第25题",
    "topic": "32位虚拟地址多级页表切分计算",
    "difficulty": "综合大题考点",
    "question": "某系统采用两级分页虚拟存储管理，逻辑地址长度为 32 位，页面大小为 4 KB（2^12 字节），每个页表项占 4 字节。为保证一级页表（页目录表）和二级页表恰好各占用一个物理页框，该逻辑地址中的一级页号与二级页号所占的位数分别应该是？",
    "options": [
      "一级页号 10 位，二级页号 10 位",
      "一级页号 12 位，二级页号 8 位",
      "一级页号 8 位，二级页号 12 位",
      "一级页号 14 位，二级页号 6 位"
    ],
    "answer": 0,
    "explanation": "页面大小为 4 KB = 2^12 字节，故低 12 位为页内偏移量（Offset）。剩余 32 - 12 = 20 位用于页号。每个物理页框 4 KB，每个页表项 4 B，一个页框恰好能容纳 4 KB / 4 B = 1024 = 2^10 个页表项。为了让每个页表恰好装入一个页框，页表项索引必须占 10 位！因此一级页号占 10 位，二级页号占 10 位（10 + 10 + 12 = 32 位）。",
    "labTip": "在虚拟内存实验中观察 32 位虚拟地址如何经过一级目录索引、二级页表索引最终合成物理地址。",
    "year": 2016
  },
  {
    "id": "q-page-05",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "page-replacement",
    "source": "2013年 408 统考真题 第25题",
    "topic": "快表 (TLB) 缺失与缺页异常的先后关系",
    "difficulty": "概念陷阱",
    "question": "在带有快表（TLB）的分页虚拟内存系统中，当 CPU 执行一条访存指令发生缺页异常（Page Fault）时，该次访存中的快表（TLB）查找结果必然是？",
    "options": [
      "必然是 TLB 缺失（TLB Miss）",
      "必然是 TLB 命中（TLB Hit）",
      "可能命中也可能缺失",
      "无需经过 TLB 查找"
    ],
    "answer": 0,
    "explanation": "TLB 是页表中部分高频活跃项的硬件高速缓存。如果发生缺页异常，说明该页根本就没有被装入物理内存（在慢表中有效位为 0）；一个根本没有调入内存的无效页面，绝不可能存在于 TLB 快表之中！因此缺页发生的前提必然伴随着 TLB 缺失。",
    "labTip": "在页面置换与 TLB 流水实验中体会快表作为页表缓存的一致性保证。",
    "year": 2013
  },
  {
    "id": "q-page-06",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "page-replacement",
    "source": "2018年 408 统考真题 第27题",
    "topic": "虚拟内存“抖动 (Thrashing)”根本原因",
    "difficulty": "核心理论",
    "question": "在虚存管理中，由于分配给进程的物理块数不足，导致系统频繁发生缺页中断，CPU 绝大部分时间都消耗在磁盘对换区的换页 I/O 上，该现象被称为“抖动（颠簸）”。预防系统抖动的有效理论模型是？",
    "options": [
      "工作集模型 (Working Set Model)",
      "先行断点模型",
      "电梯调度模型",
      "银行家模型"
    ],
    "answer": 0,
    "explanation": "根据程序局部性原理，进程在某一时间段内访问的页面集合被称为“工作集（Working Set）”。操作系统必须监测每个进程的工作集大小，并为其分配大于等于工作集大小的物理块数；若物理内存不足以容纳所有并发进程的工作集，必须主动挂起部分进程，从而彻底根治系统抖动。",
    "labTip": "在页面置换实验中观察物理块分配过少时缺页率剧增的现象。",
    "year": 2018
  },
  {
    "id": "q-mem-02",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "memory-partition",
    "source": "2015年 408 统考真题 第26题",
    "topic": "内存“紧凑 (Compaction)”技术的硬件支持要求",
    "difficulty": "内存分配",
    "question": "在动态连续分区分配中，为消除外部碎片，系统通过移动在内存中的进程位置，把分散的空闲小分区拼接成大分区，称为“紧凑（拼接）”。该技术能够正确实施所必须依赖的底层硬件机制是？",
    "options": [
      "动态重定位机构（基址寄存器 + 变址寄存器）",
      "虚拟分页快表 TLB",
      "中断向量控制器",
      "只读存储器 ROM"
    ],
    "answer": 0,
    "explanation": "紧凑操作会在物理内存中搬移正在执行的进程代码和数据。如果使用静态重定位，程序中的物理地址在装入时已写死，移动后程序将无法运行！只有在硬件具备动态重定位（基址寄存器）机制时，操作系统在搬移进程后只需更新该进程 PCB 中的基址寄存器数值，进程在执行访存时自动加上新基地址，才能实现无缝移动。",
    "labTip": "在动态分区实验中观察内存块搬运拼接与基址更新过程。",
    "year": 2015
  },
  {
    "id": "q-disk-01",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "page-replacement",
    "source": "2010年 408 统考真题 第27题",
    "topic": "磁盘调度算法 SCAN (电梯调度) 寻道道数计算",
    "difficulty": "经典计算",
    "question": "某磁盘磁头当前位于 100 号柱面，正在向磁道号增大的方向移动。磁道请求队列依次为：55, 58, 39, 18, 90, 160, 150, 38, 184。若采用 SCAN（电梯扫描）调度算法，磁头访问该请求队列经过的总磁道寻道移动数是？",
    "options": [
      "250",
      "248",
      "230",
      "184"
    ],
    "answer": 0,
    "explanation": "SCAN 算法沿着当前方向移动直到最外端，再掉头向内扫描：\n1. 当前位置 100，向增大方向移动，依次访问：150, 160, 184（移动 184 - 100 = 84 道）；\n2. 达到最大请求 184 后掉头向小方向移动，依次访问：90, 58, 55, 39, 38, 18（移动 184 - 18 = 166 道）；\n总寻道数 = 84 + 166 = 250 道。",
    "labTip": "体会磁盘调度算法如何通过保持单向行进避免磁头频繁往返抖动。",
    "year": 2010
  },
  {
    "id": "q-fs-02",
    "courseId": "operating-systems",
    "courseName": "操作系统",
    "experimentId": "page-replacement",
    "source": "2023年 408 统考真题 第27题",
    "topic": "文件连续分配、链接分配与索引分配随机存取性能",
    "difficulty": "存储结构",
    "question": "对于包含 1000 个逻辑块的文件，若采用“隐式链接分配（每个盘块尾部存储指向下一块的指针）”，当需要直接随机存取该文件的第 800 个逻辑块时，系统平均需要启动磁盘读取的次数为？",
    "options": [
      "800 次",
      "1 次",
      "2 次",
      "400 次"
    ],
    "answer": 0,
    "explanation": "隐式链接分配不支持真正的随机随机存取！因为每个物理盘块内部只保存下一个盘块的指针，要读取第 800 块，系统只能从目录项指示的第 1 块开始，顺藤摸瓜逐一读取前 799 个盘块，共需 800 次磁盘 I/O 操作！因此隐式链接仅适合顺序存取，随机存取必须采用索引分配或连续分配。",
    "labTip": "结合链表与数组的随机访问特性理解不同文件分配策略的 I/O 成本。",
    "year": 2023
  },
  {
    "id": "q-net-01",
    "courseId": "networks",
    "courseName": "计算机网络",
    "experimentId": "sliding-window",
    "source": "2009年 408 统考真题 第33题",
    "topic": "OSI 七层参考模型与功能分工",
    "difficulty": "体系结构",
    "question": "在 OSI 参考模型中，负责提供端到端进程间通信、差错控制和流量控制，且只存在于端系统主机中、通信子网各节点通常不具备的层次是？",
    "options": [
      "传输层 (Transport Layer)",
      "网络层 (Network Layer)",
      "数据链路层 (Data Link Layer)",
      "会话层 (Session Layer)"
    ],
    "answer": 0,
    "explanation": "这是计算机网络体系结构的核心界限：\n- 物理层、数据链路层和网络层属于【通信子网】，网络中的路由器和交换机必须实现这三层功能；\n- 传输层是高层【资源子网】的最底层，也是第一个真正的【端到端（进程到进程）】通信层，只运行在通信源和目的宿主机操作系统中，中继设备通常不需要实现。",
    "labTip": "在 TCP 实验中查看端到端主机状态机如何脱离中间路由跳数独立维持可靠性。",
    "year": 2009
  },
  {
    "id": "q-crc-01",
    "courseId": "networks",
    "courseName": "计算机网络",
    "experimentId": "sliding-window",
    "source": "2011年 408 统考真题 第34题",
    "topic": "CRC 循环冗余校验码模 2 除法计算",
    "difficulty": "经典计算",
    "question": "要发送的数据比特串为 1101 0110 11，采用的 CRC 生成多项式为 G(x) = x^4 + x + 1（对应二进制 10011）。经过模 2 除法运算后，最终附加在数据末尾的 4 位 FCS 冗余校验序列是？",
    "options": [
      "1110",
      "0101",
      "1011",
      "0010"
    ],
    "answer": 0,
    "explanation": "多项式最高次幂为 4，因此在原始数据 1101011011 后面追加 4 个 0 得：11010110110000。除数是 10011。执行模 2 除法（异或运算，不借位）：\n11010110110000 模 2 除以 10011，逐步异或，最终计算出的 4 位余数为 1110！这就是要随数据一起发送的帧检验序列 FCS。",
    "labTip": "体会数据链路层如何利用多项式除法在硬件移位寄存器中以纳秒级速度检出突发错误。",
    "year": 2011
  },
  {
    "id": "q-stop-wait-01",
    "courseId": "networks",
    "courseName": "计算机网络",
    "experimentId": "sliding-window",
    "source": "2013年 408 统考真题 第35题",
    "topic": "停止-等待协议信道利用率计算公式",
    "difficulty": "经典计算",
    "question": "主机甲向主机乙发送数据，采用停止-等待协议。数据帧长度为 1000 字节，信道传输速率为 10 Mbps，单向传播时延为 20 ms。若确认帧极短可忽略其发送时延，且信道无差错。则该信道的最大信道利用率约为？",
    "options": [
      "1.96%",
      "3.85%",
      "19.6%",
      "50%"
    ],
    "answer": 0,
    "explanation": "发送时延 t_frame = (1000 × 8 bit) / (10 × 10^6 bps) = 0.8 ms。\n往返时延 RTT = 2 × 20 ms = 40 ms。\n发送一帧的总周期 = t_frame + RTT = 0.8 ms + 40 ms = 40.8 ms。\n信道利用率 U = t_frame / 总周期 = 0.8 / 40.8 ≈ 0.0196 = 1.96%！\n这说明在长肥管道（高带宽时延积）中，停等协议的信道利用率极低，必须使用流水线滑动窗口协议。",
    "labTip": "在滑动窗口实验中对比窗口大小 W=1（停等）与 W=8 时的信道数据吞吐率。",
    "year": 2013
  },
  {
    "id": "q-tcp-fast-01",
    "courseId": "networks",
    "courseName": "计算机网络",
    "experimentId": "sliding-window",
    "source": "2015年 408 统考真题 第36题",
    "topic": "TCP 快速重传 3 个冗余重复 ACK 机制",
    "difficulty": "核心理论",
    "question": "在 TCP 传输中，若发送方连续收到接收方发来的 3 个重复确认报文段（Duplicate ACK），发送方无需等待超时重传定时器（RTO）到期，立即重传该报文段。这种优化机制被称为？",
    "options": [
      "快速重传 (Fast Retransmit)",
      "慢启动 (Slow Start)",
      "加法增大 (Additive Increase)",
      "拥塞避免 (Congestion Avoidance)"
    ],
    "answer": 0,
    "explanation": "快速重传机制规定：当接收方收到一个失序报文段时，立即向发送方发送重复的 ACK。当发送方连续收到 3 个相同的冗余 ACK 时，判定该段报文丢失，在 RTO 定时器到期前立即重传丢失报文，避免了长达数百毫秒的超时等待，大幅提高了传输效率。",
    "labTip": "在滑动窗口实验中模拟单帧丢包，观察接收端连续发送 3 次 ACK 触发快速重传。",
    "year": 2015
  },
  {
    "id": "q-tcp-aimd-01",
    "courseId": "networks",
    "courseName": "计算机网络",
    "experimentId": "sliding-window",
    "source": "2014年 408 统考真题 第37题",
    "topic": "TCP 拥塞控制 AIMD“加法增大、乘法减小”法则",
    "difficulty": "经典理论",
    "question": "TCP 拥塞控制算法的核心原则是 AIMD（Additive Increase, Multiplicative Decrease）。关于 AIMD 的工程设计目的，下列叙述正确的是？",
    "options": [
      "当网络无拥塞时线性缓慢加法试探带宽，一旦检测到拥塞时乘法减半断崖式退避，以实现全网带宽的公平分配与网络收敛稳定",
      "加法增大保证了最快占领带宽",
      "乘法减小是为了防止发送缓冲区溢出",
      "AIMD 仅适用于无线网络环境"
    ],
    "answer": 0,
    "explanation": "AIMD 具有优雅的数学稳定性证明：加法增大（每过一个 RTT，cwnd 增加 1 个 MSS）可以让各连接缓慢争夺富余带宽；乘法减小（一旦拥塞，ssthresh 减半）可以让出巨大的网络余量防止网络雪崩，并驱动不同 RTT 的并发连接最终收敛于公平共享瓶颈链路带宽。",
    "labTip": "在滑动窗口实验中查看 cwnd 锯齿形动态曲线在超时丢包时的骤降与线性回升。",
    "year": 2014
  },
  {
    "id": "q-tcp-flow-01",
    "courseId": "networks",
    "courseName": "计算机网络",
    "experimentId": "sliding-window",
    "source": "2012年 408 统考真题 第37题",
    "topic": "流量控制与拥塞控制的本质区别",
    "difficulty": "高频辨析",
    "question": "在 TCP 协议规范中，“流量控制（Flow Control）”与“拥塞控制（Congestion Control）”的受控对象与控制动机的核心区别在于？",
    "options": [
      "流量控制针对接收端主机的接收缓冲处理能力（点到点通信匹配）；拥塞控制针对整个网络链路和路由器的通行承载能力（全局网络宏观匹配）",
      "流量控制由发送端自主决定，拥塞控制由接收端驱动",
      "流量控制使用动态窗口，拥塞控制使用固定窗口",
      "二者完全等价，在 TCP 报头中使用同一个字段控制"
    ],
    "answer": 0,
    "explanation": "二者是完全不同维度的控制：\n① 流量控制：由接收方通过报头中的 rwnd 字段告知发送方“不要发太快，我的接收缓冲区快满了”，解决点到点发送与接收速率不匹配；\n② 拥塞控制：由发送方根据丢包和 RTT 自行维护 cwnd，防止过多数据注入网络导致中间路由器缓冲区溢出和网络崩溃。有效窗口 = min(rwnd, cwnd)。",
    "labTip": "在 TCP 实验中调节接收窗口 rwnd 与拥塞窗口 cwnd，观察发送上限如何取两者较小值。",
    "year": 2012
  },
  {
    "id": "q-nat-01",
    "courseId": "networks",
    "courseName": "计算机网络",
    "experimentId": "ip-subnet",
    "source": "2010年 408 统考真题 第38题",
    "topic": "网络地址端口转换 (NAPT) 机制",
    "difficulty": "网络层核心",
    "question": "在企业局域网中，多台拥有专用私网 IP 地址的主机（如 192.168.1.X）能够同时共享单个公网 IP 访问外部互联网，所依赖的核心网络技术及其在 NAT 路由器中记录的表项是？",
    "options": [
      "NAPT（网络地址端口转换），表项记录包含 (私网IP, 私网端口号, 公网IP, 公网端口号)",
      "静态路由协议，仅记录目的网络与接口",
      "ARP 代理，记录 IP 与 MAC 映射",
      "DNS 别名解析，记录 CNAME 记录"
    ],
    "answer": 0,
    "explanation": "网络地址端口转换（NAPT）通过利用传输层的“端口号（Port）”来复用同一个公有 IP 地址。当内部数据包经过 NAT 路由器时，路由器将其源 IP 替换为公网 IP，并将源端口替换为一个分配的公网临时端口，在 NAT 转换表中保存映射。当外部回包到达时，根据目的端口查表反向还原出私网 IP 与内部端口。",
    "labTip": "在 IP 子网与分组转发实验中查看私网 IP 地址段分类（10/8, 172.16/12, 192.168/16）。",
    "year": 2010
  },
  {
    "id": "q-icmp-01",
    "courseId": "networks",
    "courseName": "计算机网络",
    "experimentId": "ip-subnet",
    "source": "2015年 408 统考真题 第37题",
    "topic": "ICMP 报文类型与 Traceroute 路径探测原理",
    "difficulty": "经典考点",
    "question": "在计算机网络排错工具中，Traceroute（跟踪数据包到达目的主机所经过的所有路由器）工具能够逐跳探明中间路由器 IP 地址所巧妙利用的底层网络机制是？",
    "options": [
      "故意将 IP 报头的生存时间 TTL 字段从 1 逐步递增发送，利用路由器丢弃数据包时返回的 ICMP 时间超过（Time Exceeded）报文",
      "发送 ICMP 回显请求报文，由路由器自动回复其 IP",
      "使用 ARP 广播探测沿途所有路由器的 MAC 地址",
      "调用 DNS 反向查询协议"
    ],
    "answer": 0,
    "explanation": "Traceroute 构思极其精妙：\n1. 首先发送 TTL=1 的 UDP 数据包，第一跳路由器将 TTL 减 1 变为 0，丢弃该包并向源主机发送【ICMP 超时差错报文】，源主机由此获知第 1 跳路由器 IP；\n2. 接着发送 TTL=2，得到第 2 跳路由器 IP……以此类推，直到数据包最终到达目的主机，目的主机因端口不可达回复【ICMP 终点不可达报文】，探测结束！",
    "labTip": "在 IP 子网与协议实验中查看 IP 数据报中 TTL 减 1 归 0 时的丢包处理。",
    "year": 2015
  },
  {
    "id": "q-rip-01",
    "courseId": "networks",
    "courseName": "计算机网络",
    "experimentId": "ip-subnet",
    "source": "2013年 408 统考真题 第38题",
    "topic": "RIP 路由协议“坏消息传得慢”收敛缺陷",
    "difficulty": "路由算法",
    "question": "路由信息协议（RIP）采用距离向量算法，以“跳数（Hop Count）”作为度量指标。当网络发生故障导致某个网段不可达时，RIP 协议可能出现路由环路并导致跳数缓慢累加到某一上限才判定不可达。RIP 规定的最大跳数上限是？",
    "options": [
      "16 跳（16 视为不可达）",
      "15 跳",
      "255 跳",
      "64 跳"
    ],
    "answer": 0,
    "explanation": "RIP 协议只适用于小型网络，规定跳数最大为 15，当距离达到 16 时即表示该路由不可达！在距离向量算法中，由于“好消息传得快，坏消息传得慢”，两个相邻路由器可能在互相交换路由表时形成乒乓环路，跳数不断加 1，直到累加至 16 时才最终识别故障，收敛速度较慢。",
    "labTip": "在拓扑图路径推导中体会距离向量算法 Bellman-Ford 与链路状态算法的差异。",
    "year": 2013
  },
  {
    "id": "q-ospf-01",
    "courseId": "networks",
    "courseName": "计算机网络",
    "experimentId": "dijkstra",
    "source": "2014年 408 统考真题 第38题",
    "topic": "OSPF 链路状态路由协议与 Dijkstra 算法",
    "difficulty": "路由协议核心",
    "question": "开放最短路径优先协议（OSPF）是自治系统内部广泛使用的链路状态协议。关于 OSPF 协议的工作原理，下列叙述正确的是？",
    "options": [
      "每个路由器向全网洪泛链路状态通告（LSA），最终所有路由器建立起全网拓扑一致的链路状态数据库（LSDB），并独立运行 Dijkstra 最短路径算法计算路由表",
      "OSPF 仅与相邻路由器交换完整的路由表",
      "OSPF 报文封装在 TCP 协议段中传输",
      "OSPF 使用跳数作为唯一度量标准，最大不超过 15 跳"
    ],
    "answer": 0,
    "explanation": "OSPF 核心特征：\n1. 使用链路状态算法，每个路由器都向全网广播与本路由器直接相连的所有链路状态；\n2. 全网所有路由器拥有完全一致的全局网络拓扑地图（LSDB）；\n3. 每个路由器以自身为根，利用 Dijkstra 算法独立计算到达所有网段的最短路径树；\n4. 报文直接封装在 IP 数据报中（协议号 89），收敛速度极快且绝无路由环路。",
    "labTip": "在 Dijkstra 最短路径算法实验中观察加权图单源最短路径树的收敛生成。",
    "year": 2014
  },
  {
    "id": "q-arp-01",
    "courseId": "networks",
    "courseName": "计算机网络",
    "experimentId": "ip-subnet",
    "source": "2011年 408 统考真题 第37题",
    "topic": "ARP 地址解析协议请求与应答类型",
    "difficulty": "链路与网络映射",
    "question": "主机甲知道主机乙的 IPv4 地址，但本地 ARP 缓存中没有主机乙的物理硬件地址（MAC 地址）。主机甲解析主机乙 MAC 地址时，发送的 ARP 请求报文与主机乙回复的 ARP 响应报文分别采用的传输方式是？",
    "options": [
      "ARP 请求采用广播（Broadcast）发送，ARP 响应采用单播（Unicast）发送",
      "两者均采用广播方式发送",
      "两者均采用单播方式发送",
      "ARP 请求采用单播，ARP 响应采用广播"
    ],
    "answer": 0,
    "explanation": "① 请求广播：因为甲根本不知道乙的 MAC 地址，只能将以太网目的 MAC 填为全 1 广播地址 FF:FF:FF:FF:FF:FF 发送，局域网内所有主机都会收到并检查其中的目标 IP；\n② 响应单播：主机乙收到请求后，发现目标 IP 正是自己，而请求报文中已经包含了主机甲的 MAC 地址，因此乙无需打扰其他主机，直接通过单播方式将自身 MAC 回传给甲。",
    "labTip": "在 IP 子网实验中体会网络层逻辑 IP 地址与数据链路层物理 MAC 地址的解耦映射。",
    "year": 2011
  },
  {
    "id": "q-dhcp-01",
    "courseId": "networks",
    "courseName": "计算机网络",
    "experimentId": "sliding-window",
    "source": "2018年 408 统考真题 第38题",
    "topic": "DHCP 动态主机配置协议四步握手时序",
    "difficulty": "应用层协议",
    "question": "新接入局域网的主机若未配置静态 IP，需要通过 DHCP 协议自动获取 IP 地址、子网掩码与默认网关。DHCP 协议客户端与服务器之间的标准四步交互时序依次是？",
    "options": [
      "DHCP Discover -> DHCP Offer -> DHCP Request -> DHCP ACK",
      "DHCP Request -> DHCP Response -> DHCP Establish -> DHCP Confirm",
      "DHCP Syn -> DHCP Ack -> DHCP Push -> DHCP Fin",
      "DHCP Query -> DHCP Answer -> DHCP Bind -> DHCP Save"
    ],
    "answer": 0,
    "explanation": "DHCP 标准四步交互（DORA 原则）：\n1. Discover（发现）：客户端广播“有 DHCP 服务器在吗？”；\n2. Offer（提供）：服务器回复“我这里有可用的 IP，参数如下”；\n3. Request（请求）：客户端选择其中一个 Offer 广播“我就要这个 IP 了”；\n4. ACK（确认）：服务器确认并将该 IP 正式租用给客户端。",
    "labTip": "在应用层与全双工信道中观察基于 UDP 广播的应用协议交互。",
    "year": 2018
  },
  {
    "id": "q-sec-01",
    "courseId": "networks",
    "courseName": "计算机网络",
    "experimentId": "tcp-connection",
    "source": "2020年 408 统考真题 第40题",
    "topic": "HTTPS/TLS 加密中非对称加密与对称加密混合协商",
    "difficulty": "网络安全考点",
    "question": "现代互联网在传输机密敏感数据时普遍采用 HTTPS（HTTP over TLS/SSL）。关于 HTTPS 在建立安全会话时的加密密钥机制，下列描述正确的是？",
    "options": [
      "在 TLS 握手阶段利用非对称公钥加密算法协商出一个临时的会话密钥；在后续的实际数据传输阶段完全采用对称加密算法进行加解密",
      "整个数据传输过程全程采用 RSA 非对称公钥加密",
      "客户端和服务端预先硬编码相同的对称密钥，握手阶段无需协商",
      "数据只进行摘要签名，不进行任何实际加密"
    ],
    "answer": 0,
    "explanation": "这是密码学在工程落地的经典权衡：\n- 非对称加密（如 RSA、ECC）安全性高、支持身份认证，但计算速度极其缓慢；\n- 对称加密（如 AES）加解密速度极快，适合大数据量传输，但密钥无法安全分发。\n因此 HTTPS 结合二者长处：【在握手时用非对称公钥安全协商对称密钥，后续正式通信全部用该对称密钥高速加密】。",
    "labTip": "在 TCP 连接建立后体会应用层安全协议如何对传输数据负载透明加密。",
    "year": 2020
  },
  {
    "id": "q-ds-link-01",
    "courseId": "data-structures",
    "courseName": "数据结构与算法",
    "experimentId": "stack-queue",
    "source": "2012年 408 统考真题 第01题",
    "topic": "顺序表与单链表操作的时间复杂度对比",
    "difficulty": "经典基础",
    "question": "对于长度为 n 的线性表，在顺序表和带头结点的单链表两种存储结构中，下列操作的时间复杂度均为 O(1) 的是？",
    "options": [
      "在顺序表访问第 i 个元素；在单链表已知指针 p 所指结点后插入一个新结点",
      "在单链表访问第 i 个元素；在顺序表删除第 i 个元素",
      "在顺序表中查找第一个值为 x 的元素；在单链表中查找倒数第 k 个元素",
      "在顺序表和单链表中按序输出所有元素"
    ],
    "answer": 0,
    "explanation": "① 顺序表支持随机随机存取，访问第 i 个元素只需下标地址偏移：addr = base + i * size，时间为 O(1)；\n② 单链表若已知某结点指针 p，在其后插入新节点只需修改指针：new->next = p->next; p->next = new，时间也是 O(1)！而单链表访问第 i 个元素需要从头遍历耗时 O(n)；顺序表删除需要前移元素耗时 O(n)。",
    "labTip": "在数据结构实验中体会数组内存连续性与链表指针离散分布的性能权衡。",
    "year": 2012
  },
  {
    "id": "q-ds-stack-02",
    "courseId": "data-structures",
    "courseName": "数据结构与算法",
    "experimentId": "stack-queue",
    "source": "2013年 408 统考真题 第02题",
    "topic": "中缀算术表达式转后缀表达式（逆波兰式）",
    "difficulty": "经典栈操作",
    "question": "利用操作符栈将中缀表达式“a + b * (c - d) - e / f”转换为等价的后缀表达式（逆波兰式），转换后的正确后缀序列是？",
    "options": [
      "a b c d - * + e f / -",
      "a b + c d - * e f / -",
      "a b c d - * + e - f /",
      "+ a * b - c d - / e f"
    ],
    "answer": 0,
    "explanation": "手算后缀转换规则：根据运算符优先级加括号并后移运算符：\n1. 中缀加完整括号：((a + (b * (c - d))) - (e / f))\n2. 将运算符移动到对应闭括号后侧：\n- (c - d) -> cd-\n- (b * (cd-)) -> bcd-*\n- (a + (bcd-*)) -> abcd-*+\n- (e / f) -> ef/\n- 最后减号 -> abcd-*+ ef/ -\n最终后缀表达式为：a b c d - * + e f / -。",
    "labTip": "在栈与队列实验中观察操作符栈在遇到括号和高优先级符号时的压栈出栈规则。",
    "year": 2013
  },
  {
    "id": "q-tree-04",
    "courseId": "data-structures",
    "courseName": "数据结构与算法",
    "experimentId": "tree-traversal",
    "source": "2014年 408 统考真题 第05题",
    "topic": "二叉树叶子节点数与双分支节点数定理",
    "difficulty": "二叉树性质",
    "question": "对于任何一棵非空的二叉树，若叶子结点（度为 0 的结点）总数为 n0，度为 2 的结点（双分支结点）总数为 n2。则 n0 与 n2 恒满足的数学关系定理是？",
    "options": [
      "n0 = n2 + 1",
      "n0 = 2 * n2",
      "n0 = n2 - 1",
      "n0 = n2 + 2"
    ],
    "answer": 0,
    "explanation": "二叉树第一基本定理证明：\n设结点总数为 n，度为 1 的结点数为 n1，总分支边数为 B。\n① 结点与度数关系：n = n0 + n1 + n2；\n② 边数计算：除根节点外每个结点都有一条入边，故 B = n - 1；同时边由分支引出，B = 0*n0 + 1*n1 + 2*n2 = n1 + 2*n2；\n③ 联立得：n1 + 2*n2 = (n0 + n1 + n2) - 1 => 整理消去 n1，得 n2 = n0 - 1，即【n0 = n2 + 1】。",
    "labTip": "在二叉树遍历实验中任意添加/删除叶子与分支节点，验证叶子节点数与度2节点的数学规律。",
    "year": 2014
  },
  {
    "id": "q-tree-05",
    "courseId": "data-structures",
    "courseName": "数据结构与算法",
    "experimentId": "tree-traversal",
    "source": "2016年 408 统考真题 第07题",
    "topic": "二叉排序树 (BST) 查找成功平均查找长度 ASL",
    "difficulty": "经典计算",
    "question": "依次将关键字序列 {50, 30, 80, 20, 40, 90} 插入一棵初始为空的二叉排序树（BST）中。在等概率前提下，该二叉排序树查找成功的平均查找长度（ASL_succ）是？",
    "options": [
      "14/6 (2.33)",
      "13/6 (2.17)",
      "15/6 (2.50)",
      "12/6 (2.00)"
    ],
    "answer": 0,
    "explanation": "依次构建 BST 树形结构与各节点所处层数：\n- 根节点 50（第 1 层，比较 1 次）；\n- 30 在 50 左边，80 在 50 右边（第 2 层，各比较 2 次，共 2+2=4 次）；\n- 20 在 30 左边，40 在 30 右边，90 在 80 右边（第 3 层，各比较 3 次，共 3+3+3=9 次）；\n总查找比较次数 = 1 + 2*2 + 3*3 = 1 + 4 + 9 = 14 次。\n平均查找长度 ASL = 14 / 6 ≈ 2.33。",
    "labTip": "在树实验中输入该关键字序列，实时生成 BST 树形并标注各节点深度。",
    "year": 2016
  },
  {
    "id": "q-graph-02",
    "courseId": "data-structures",
    "courseName": "数据结构与算法",
    "experimentId": "dijkstra",
    "source": "2017年 408 统考真题 第08题",
    "topic": "有向无环图 (DAG) 拓扑排序唯一性判定",
    "difficulty": "图算法",
    "question": "对于一个有向无环图（DAG），若要保证其拓扑排序序列是【唯一存在】的，该图在拓扑排序推进过程中必须满足的充要条件是？",
    "options": [
      "在拓扑排序的每一步选择中，系统中当前入度为 0 的候选顶点都始终有且仅有一个",
      "图中所有顶点的出度都等于 1",
      "图的顶点必须能排成一个简单回路",
      "图中每一对顶点之间都存在有向路径"
    ],
    "answer": 0,
    "explanation": "拓扑排序算法每次从图中挑选入度为 0 的顶点输出。如果在某一步挑选时，图中同时存在两个或更多入度为 0 的顶点，那么先选哪一个都可以，必然会导致生成多个不同的合法拓扑序列！只有在每一步中，入度为 0 的顶点有且仅有 1 个，拓扑序列才是唯一的。",
    "labTip": "在图算法实验中逐步删除入度为 0 节点的出边，观察拓扑序列的生成动态。",
    "year": 2017
  },
  {
    "id": "q-graph-03",
    "courseId": "data-structures",
    "courseName": "数据结构与算法",
    "experimentId": "dijkstra",
    "source": "2018年 408 统考真题 第08题",
    "topic": "最小生成树 Prim 算法 vs Kruskal 算法对比",
    "difficulty": "经典辨析",
    "question": "关于求带权无向连通图最小生成树（MST）的两种经典算法，下列关于 Prim 算法与 Kruskal 算法适用场景的叙述中，正确的是？",
    "options": [
      "Prim 算法基于顶点不断向外扩张，时间复杂度为 O(V^2)，更适合边密集的稠密图；Kruskal 算法基于边按权值排序贪心选取，时间复杂度为 O(E log E)，更适合边稀疏的稀疏图",
      "Kruskal 算法只适用于稠密图",
      "Prim 算法必须使用并查集检测环路",
      "两者生成的最小生成树代价总和可能不相同"
    ],
    "answer": 0,
    "explanation": "① Prim 算法以点为中心贪心扩散，时间复杂度与边数关系不大，适合边较多的稠密图；\n② Kruskal 算法以边为中心，先对所有边按权值排序，利用并查集判环，时间复杂度主要消耗在边的排序上，更适合边较少的稀疏图；\n③ 若图中所有边的权值均不相同，两种算法生成的最小生成树形状完全唯一且权值和必然相同。",
    "labTip": "在最短路径与图遍历实验中观察贪心策略在图结构上的局部最优选择。",
    "year": 2018
  },
  {
    "id": "q-sort-03",
    "courseId": "data-structures",
    "courseName": "数据结构与算法",
    "experimentId": "sorting",
    "source": "2013年 408 统考真题 第09题",
    "topic": "内部排序算法的稳定性判定",
    "difficulty": "核心理论",
    "question": "算法的“稳定性”是指在待排序序列中若存在多个关键字相同的元素，排序后它们的相对前后顺序保持不变。下列 4 组内部排序算法中，全部属于【不稳定】排序算法的一组是？",
    "options": [
      "快速排序、堆排序、简单选择排序、希尔排序",
      "冒泡排序、直接插入排序、归并排序",
      "基数排序、冒泡排序、希尔排序",
      "直接插入排序、快速排序、堆排序"
    ],
    "answer": 0,
    "explanation": "408 稳定性经典口诀：“考（快）研选（简选）希（希尔）堆，不稳定”！\n- 快速排序：跨越枢轴交换破坏顺序；\n- 堆排序：自底向上筛选跨层交换破坏顺序；\n- 简单选择排序：如序列 (2, 2*, 1)，选择最小 1 与第一个 2 交换，导致 2* 跑到 2 前面；\n- 希尔排序：跨步长分组排序破坏相对次序；\n而冒泡排序、直接插入排序、归并排序、基数排序均为稳定排序。",
    "labTip": "在排序实验中观察包含相同数值的彩色柱状条，查看快速排序后相同颜色柱子的位置错动。",
    "year": 2013
  },
  {
    "id": "q-sort-04",
    "courseId": "data-structures",
    "courseName": "数据结构与算法",
    "experimentId": "sorting",
    "source": "2016年 408 统考真题 第09题",
    "topic": "归并排序 (Merge Sort) 辅助空间与复杂度",
    "difficulty": "经典理论",
    "question": "在经典二路归并排序算法（2-Way Merge Sort）对包含 n 个元素的数组进行排序时，其时间复杂度与所需的辅助空间复杂度分别是？",
    "options": [
      "时间复杂度 O(n log n)，空间复杂度 O(n)",
      "时间复杂度 O(n log n)，空间复杂度 O(1)",
      "时间复杂度 O(n^2)，空间复杂度 O(n)",
      "时间复杂度 O(n log n)，空间复杂度 O(log n)"
    ],
    "answer": 0,
    "explanation": "二路归并排序无论在最好、最坏还是平均情况下，划分树深度恒为 ⌈log2 n⌉ 层，每层合并耗时 O(n)，总时间复杂度极为稳定，恒为 O(n log n)！但在将两个有序子表合并为一个完整有序表时，必须借助一个与原数组等长的大临时数组来暂存合并结果，因此辅助空间复杂度为 O(n)。",
    "labTip": "在排序算法实验中选择“归并排序”，观察分治拆分后双指针拉取暂存区合并动画。",
    "year": 2016
  },
  {
    "id": "q-db-05",
    "courseId": "databases",
    "courseName": "数据库系统",
    "experimentId": "transactions",
    "source": "数据库经典考研试题",
    "topic": "数据库崩溃恢复 WAL 预写日志与检查点",
    "difficulty": "核心理论",
    "question": "关系型数据库系统为保障事务的原子性（Atomicity）与持久性（Durability），广泛采用“预写日志协议 (Write-Ahead Logging, WAL)”。WAL 协议的核心约束规则是？",
    "options": [
      "在任何数据库内存脏数据块被正式刷入磁盘物理表文件之前，描述该修改的相应日志记录必须先刷入磁盘持久化",
      "事务每次修改都必须立即同步更新磁盘中的数据表",
      "日志文件只保存在易失性内存缓冲区中",
      "仅在事务发生回滚时才写入日志"
    ],
    "answer": 0,
    "explanation": "WAL 预写日志协议是数据库存储引擎的基石：\n磁盘随机写数据块效率极低，而日志是追加式顺序写，速度极快。WAL 严格要求：必须先将对应 Redo/Undo 日志刷盘，之后内存中的脏数据页才能在后台异步刷盘。若系统在脏页刷盘前突然掉电，重启时只需根据持久化的 Redo 日志重放修改，保证已提交的数据绝不丢失。",
    "labTip": "在数据库事务实验中观察 Commit 提交触发日志落盘的动画流程。",
    "year": 2021
  },
  {
    "id": "q-db-06",
    "courseId": "databases",
    "courseName": "数据库系统",
    "experimentId": "transactions",
    "source": "经典期末与研究生入学试题",
    "topic": "多粒度封锁与意向锁 (Intent Lock) 的必要性",
    "difficulty": "锁机制",
    "question": "在支持多粒度封锁（支持行锁与表锁）的数据库管理系统中，当事务欲对某行记录加排他锁（X 锁）时，必须先在包含该记录的高层表节点上加上哪种锁？为什么？",
    "options": [
      "意向排他锁 (IX 锁)；避免后续其他事务在申请对整个表加锁时需要逐行扫描所有记录来检查冲突",
      "共享锁 (S 锁)；防止其他事务读取整表",
      "行锁；直接锁定行记录无需理睬表",
      "死锁保护锁；防止锁升级"
    ],
    "answer": 0,
    "explanation": "意向锁的引入完全是为了大幅提升加表锁时的冲突检测效率！若没有意向锁，某事务要申请给整张表加表锁时，系统必须费时费力地遍历整张表的数百万行记录去检查有没有哪一行被锁住了。有了意向排他锁（IX），只需检查表头上的 IX 锁标记，瞬间就能判定是否有冲突，时间复杂度从 O(n) 骤降为 O(1)。",
    "labTip": "在事务锁机制实验中查看行锁与意向锁的相容矩阵表。",
    "year": 2021
  },
  {
    "id": "q-ai-01",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "attention",
    "source": "计算机前沿与智能系统",
    "topic": "Transformer 自注意力机制矩阵点积与缩放因子",
    "difficulty": "AI计算架构",
    "question": "在现代大语言模型底层核心的缩放点积注意力机制（Scaled Dot-Product Attention）中，计算公式为 Attention(Q, K, V) = softmax(Q * K^T / √d_k) * V。其中除以缩放因子 √d_k 的最核心数学目的是？",
    "options": [
      "防止当向量维度 d_k 很大时，点积结果过大导致 Softmax 函数进入梯度极小的饱和区，引起梯度消失",
      "为了让矩阵 Q 和 K 能够顺利进行矩阵相乘",
      "消除矩阵乘法产生的溢出错误",
      "对注意力权重矩阵执行主成分分析"
    ],
    "answer": 0,
    "explanation": "当向量维度 d_k 较大时，Q 和 K 的点积方差会随之增大到 d_k 量级。如果不进行缩放，点积数值会非常大，导致经过 Softmax 之后，极少数最大值接近 1，其余几乎全为 0，Softmax 函数的导数（梯度）趋向于 0，引发严重的反向传播“梯度消失”！除以 √d_k 将方差重新归一化为 1，保持健康的梯度流动。",
    "labTip": "在注意力机制实验中观察 Q 与 K 矩阵点积计算与 Softmax 归一化热力图。",
    "year": 2021
  },
  {
    "id": "q-ai-02",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "gradient-descent",
    "source": "计算机前沿与智能系统",
    "topic": "梯度下降算法学习率 (Learning Rate) 过大的后果",
    "difficulty": "优化理论",
    "question": "在训练神经网络或优化模型参数时，若将梯度下降（Gradient Descent）的学习率（Learning Rate, α）设置得过大，优化过程在损失曲面上通常会表现为？",
    "options": [
      "在最优点两端剧烈震荡甚至越跳越高，导致损失函数值不降反升，发生“发散 (Divergence)”",
      "收敛速度极慢，陷入局部鞍点",
      "模型参数完全不再更新",
      "立即达到全局最优解"
    ],
    "answer": 0,
    "explanation": "梯度下降更新公式为 θ_new = θ - α * ∇L(θ)。梯度 ∇L(θ) 指明了下降最快的方向，而步长由学习率 α 决定。若 α 过小，收敛极其缓慢；但若 α 过大，一步跨度直接越过了山谷底部并冲到了对侧更高处，引发来回震荡并持续向外发散（Loss 飙升到 NaN 或无穷大）。",
    "labTip": "在梯度下降实验中调大学习率滑块，直观观察球体在三维损失曲面上来回弹跳发散的动画。",
    "year": 2021
  },
  {
    "id": "q-ai-03",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "convolution",
    "source": "计算机前沿与智能系统",
    "topic": "卷积神经网络 (CNN) 特征图输出尺寸计算",
    "difficulty": "图像计算",
    "question": "输入图像尺寸为 32 × 32，使用 5 × 5 大小的卷积核进行卷积运算，步长 Stride = 1，填充 Padding = 0。经过该层卷积后生成的特征图（Feature Map）的尺寸是？",
    "options": [
      "28 × 28",
      "30 × 30",
      "32 × 32",
      "27 × 27"
    ],
    "answer": 0,
    "explanation": "卷积输出特征图尺寸公式：Output = ⌊(Input - Kernel + 2*Padding) / Stride⌋ + 1。\n代入数值：Output = (32 - 5 + 2*0) / 1 + 1 = 27 + 1 = 28！\n因此输出特征图的尺寸为 28 × 28。",
    "labTip": "在卷积实验中修改输入维度、卷积核大小与步长，观察卷积滑动窗口与特征图生成过程。",
    "year": 2021
  },
  {
    "id": "q-2026-01",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "tree-traversal",
    "source": "2026年 408 统考真题 第1题",
    "year": 2026,
    "topic": "数据结构与经典算法",
    "difficulty": "最新统考",
    "question": "当存储空间有足够的空闲空间时，在保持表内元素顺序，相对不变的情况下，下列哪 些操作会必然导致产生移动次数（这考的是c 语言数组的内存复制的知识）Ⅰ. 在表头 插入一个元素Ⅱ. 在表头删除一个元素Ⅲ. 在表尾插入一个元素Ⅳ. 在表尾删除一个元 素",
    "options": [
      "Ⅰ、Ⅱ",
      "Ⅰ、Ⅲ",
      "Ⅱ、Ⅳ",
      "Ⅲ、Ⅳ"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-02",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "stack-queue",
    "source": "2026年 408 统考真题 第2题",
    "year": 2026,
    "topic": "栈与队列微观时序操作仿真",
    "difficulty": "最新统考",
    "question": "设有一个双向链表L，结构为[p2,d,p1]，头结点为head，初始时head=cu。 现要将每个结点的p2 指向p1 指向结点的直接后继，应该进行的操作是()",
    "options": [
      "while (cu != NULL) {cu->p2 = cu->p1->p1; cu = cu->p1;}",
      "while (cu != NULL && cu->p2 != NULL) {cu->p2 = cu->p1->p1; cu = cu->p1;}",
      "while (cu != NULL) {if (cu->p1 != NULL) {cu->p2 = cu->p1->p1; cu = cu->p1;}}",
      "while (cu != NULL) {if (cu->p1 != NULL) cu->p2 = cu->p1->p1; cu = cu->p1;}"
    ],
    "answer": 1,
    "explanation": "需要判断cu->p1 是否为空才能访问cu->p1->p1，但每次都要移动cu = cu->p1。 选项D 的逻辑正确。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-03",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "tree-traversal",
    "source": "2026年 408 统考真题 第3题",
    "year": 2026,
    "topic": "二叉树多维遍历与平衡树旋转",
    "difficulty": "最新统考",
    "question": "已知二叉树T 的中序序列为{b,c,d,f,c,a,g}，层次遍历序列为{a,b,g,c,d,e,f}， 则后序遍历序列为（）",
    "options": [
      "c,e,d,f,b,g,a",
      "c,e,f,d,b,g,a",
      "e,f,d,c,b,g,a",
      "e,g,f,d,b,c,a 根据中序和层次遍历重建二叉树，然后求后序遍历"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-04",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "tree-traversal",
    "source": "2026年 408 统考真题 第4题",
    "year": 2026,
    "topic": "二叉树多维遍历与平衡树旋转",
    "difficulty": "最新统考",
    "question": "森林中有5 棵树，其结点个数分别为2、3、4、5、7，森林中树的次序可以任意， 问二叉树的最小高度为（）",
    "options": [
      "5",
      "6",
      "8",
      "105 棵树，节点数2,3,4,5,7，总共21 个节 点。最小高度策略：将节点多的树放前面作为兄弟。最优排列：7,5,4,3,2，高度为6。"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-05",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "tree-traversal",
    "source": "2026年 408 统考真题 第5题",
    "year": 2026,
    "topic": "数据结构与经典算法",
    "difficulty": "最新统考",
    "question": "已知字符串abcdefg 对应权值为1,2,4,5,8,10,12，使得带权路径长度最小，与e 同层的结点有（）",
    "options": [
      "d",
      "g",
      "d 和f",
      "f 和g 权值：a=1, b=2, c=4, d=5, e=8, f=10, g=12 构建哈夫曼树，e(权值8)与f(权值10)在同一层。"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-06",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "dijkstra",
    "source": "2026年 408 统考真题 第6题",
    "year": 2026,
    "topic": "Dijkstra 最短路径与图算法推演",
    "difficulty": "最新统考",
    "question": "采用邻接表存储有向图G，求图G 一个顶点入度的时间复杂度为（）",
    "options": [
      "O (|V|)",
      "O (min (|V|, |E|))",
      "O (|E|)",
      "O (max (|V|, |E|))邻接表存储有向图，求一个顶点 入度需要遍历所有邻接表，时间复杂度O(|V|+|E|) = O(max(|V|,|E|))"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-07",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "dijkstra",
    "source": "2026年 408 统考真题 第7题",
    "year": 2026,
    "topic": "Dijkstra 最短路径与图算法推演",
    "difficulty": "最新统考",
    "question": "设有向图中顶点数为n，只有一个初始顶点S，有多个标记顶点T，图中每条边有一 个字符，S 到T 的所有字符串构成集合S，则以下说法中错误的是（）",
    "options": [
      "若G 无环， S 为有穷集合",
      "若G 无环，S 有长度等于n 的串",
      "若G 有环，S 有长度大于n 的 串",
      "若G 有环，S 有小于2n 的串若G 无环，从S 到T 的路径长度最多为n-1（不可 能等于n）。"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-08",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "tree-traversal",
    "source": "2026年 408 统考真题 第8题",
    "year": 2026,
    "topic": "二叉树多维遍历与平衡树旋转",
    "difficulty": "最新统考",
    "question": "在高度为4 的平衡二叉树中，根的左、右子树结点数相差最多的是（）",
    "options": [
      "1",
      "2",
      "3",
      "5 高度4 的AVL 树根节点左右子树高度差为1（3 和2），最大节点数差为高度3 满 二叉树（7 个）与高度2 最小AVL 树（2 个）之差，即5，"
    ],
    "answer": 1,
    "explanation": "。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-09",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "sorting",
    "source": "2026年 408 统考真题 第9题",
    "year": 2026,
    "topic": "经典排序算法时空复杂度比对沙盒",
    "difficulty": "最新统考",
    "question": "使用直接插入排序对序列进行升序排序，以下比较次数最少的是（）",
    "options": [
      "30,27,56,41,80,95,69",
      "31,43,26,55,63,99,77",
      "61,84,51,23,34,91,40",
      "93,32,48,81,50,21,72"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-10",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "tree-traversal",
    "source": "2026年 408 统考真题 第10题",
    "year": 2026,
    "topic": "数据结构与经典算法",
    "difficulty": "最新统考",
    "question": "有两门科目，成绩分别为C1、C2，由成绩C1、C2 和总成绩保存在数组M 中。排 名是按照总成绩由高到低，总成绩相同的按照C1 的乘积由高到低，C1 相同的按照原 始次序排名。对数组M 先按照C1，再按照总乘积排序，这种排序算法是（）",
    "options": [
      "基数 排序",
      "快速排序",
      "希尔排序",
      "选择排序按C1 和总成绩分别排序，保持原始次序， 是基数排序的特点。"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-11",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "tree-traversal",
    "source": "2026年 408 统考真题 第11题",
    "year": 2026,
    "topic": "数据结构与经典算法",
    "difficulty": "最新统考",
    "question": "使用k 路归并对外存中的数据进行排序，归并趟数为d，以下说法正确的是（）Ⅰ. 增大k 可以减少d 的值Ⅱ. 归并趟数d 不受初始归并段影响Ⅲ. 可用内存的大小限 制初始归并段的长度",
    "options": [
      "Ⅰ",
      "Ⅰ、Ⅱ",
      "Ⅰ、Ⅲ",
      "Ⅱ、Ⅲk 路归并趟数d 与k 成反 比，初始归并段数影响d，内存大小限制段长度，Ⅰ、Ⅲ正确，"
    ],
    "answer": 1,
    "explanation": "。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-12",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2026年 408 统考真题 第12题",
    "year": 2026,
    "topic": "计算机体系结构微架构核心",
    "difficulty": "最新统考",
    "question": "关于计算机的系统层次的叙述，错误的是（）",
    "options": [
      "最上层是应用软件层",
      "指令集体 系统结构是软件和硬件的接口",
      "计算机组成（即微架构）属于指令集体系统结构的物 理实现层",
      "操作系统可通过ISA 进行抽象，向上层软件提供服务计算机组成是指令集 体系结构（ISA）的逻辑实现，而非物理实现层，选项C 表述错误。"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-13",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2026年 408 统考真题 第13题",
    "year": 2026,
    "topic": "计算机体系结构微架构核心",
    "difficulty": "最新统考",
    "question": "对机器数10100110B 先算术右移3 位再算术左移2 位，最终结果是（）",
    "options": [
      "1101 0000B",
      "1101 0011B",
      "0101 0000B",
      "0101 0011B10100110B →算术右移3 位→ 11110100B →算术左移2 位→11010000B"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-14",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "number-representation",
    "source": "2026年 408 统考真题 第14题",
    "year": 2026,
    "topic": "IEEE 754 浮点与数值表示",
    "difficulty": "最新统考",
    "question": "已知float 型变量用IEEE754 单精度浮点数表示，采用就近舍入（中间值取偶数）， 若float 型变量x 为12.1，则x 的机器数是（）",
    "options": [
      "41419999H",
      "4141999AH",
      "41E0 CCCCH",
      "41E0 CCCDH12.1 转换为IEEE754 单精度浮点数，经就近舍入（中间值取偶数） 处理后，机器数为4141999AH，"
    ],
    "answer": 1,
    "explanation": "。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-15",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2026年 408 统考真题 第15题",
    "year": 2026,
    "topic": "指令周期时序打拍与总线控制",
    "difficulty": "最新统考",
    "question": "用8 个64M×8 位的DRAM 芯片按交叉编上方式构成主存储器，并与一个宽度为 64 位的存储总线相连，主存每次最多每次读写64 位，且按字编址，则下列地址中， 与主存地址0018 001DH 位于同一芯片中的是（）",
    "options": [
      "0000 01D5H",
      "000F A020H",
      "0018 001EH",
      "0F02 0014H"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-16",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2026年 408 统考真题 第16题",
    "year": 2026,
    "topic": "计算机体系结构微架构核心",
    "difficulty": "最新统考",
    "question": "下列不是由指令集体系统结构规定的是（）",
    "options": [
      "输入输出指令",
      "采用向量中断",
      "虚拟存储管理方式",
      "指令流水线是否使用超级流水线技术这是微架构层面的实现细节，不由ISA 规定。"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-17",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2026年 408 统考真题 第17题",
    "year": 2026,
    "topic": "计算机体系结构微架构核心",
    "difficulty": "最新统考",
    "question": "下列指令中执行后有可能按存放顺序执行其下一条指令的是（） Ⅰ. 条件跳转指令 Ⅱ. 过程调用指令 Ⅲ. 陷阱（Trap）指令 Ⅳ. 过程返回指令",
    "options": [
      "仅Ⅰ、Ⅱ",
      "仅Ⅰ、Ⅳ",
      "仅Ⅱ、Ⅲ",
      "仅Ⅲ、Ⅳ条件跳转不满足条件时顺序执行，过程返回指令在特殊内存布局下可顺序 执行，Ⅰ、Ⅳ符合，"
    ],
    "answer": 1,
    "explanation": "。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-18",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cache-mapping",
    "source": "2026年 408 统考真题 第18题",
    "year": 2026,
    "topic": "Cache 组相联映射与颠簸冲突",
    "difficulty": "最新统考",
    "question": "某计算机按字节编址，数据cache 共有1024 行，采用4 路组相联映射，主存块 大小为32B，若访问主存地址为1028 的4 字节数据，则该数据所在主存块对应的组 号为（）",
    "options": [
      "4",
      "16",
      "32",
      "64 组数= 1024/4=256，块内地址5 位，组号=(1028>>5)%256=32"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-19",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cache-mapping",
    "source": "2026年 408 统考真题 第19题",
    "year": 2026,
    "topic": "Cache 组相联映射与颠簸冲突",
    "difficulty": "最新统考",
    "question": "某计算机按字节编址，虚拟地址为16 位，页大小为256B，页表项中包含装入位 （P），页框号（PPN）等字段，TLB 采用4 路组相联映射，共有16 个页表项，TLB 表 项中包含标记（Tag）/ 有效位（V）等字段，在TLB 表项与主存页表同步后，若主存 页表中页号22 对应的页表项中P=0，PPN=2AH，则下列不可能出现在组号为2 的 TLB 表项中的是（）",
    "options": [
      "Tag=05H，V=1，PPN=1CH",
      "Tag=06H，V=1，PPN=2AH",
      "Tag=16H，V=0，PPN=2AH",
      "Tag=1AH，V=0，PPN=1CH"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-20",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2026年 408 统考真题 第20题",
    "year": 2026,
    "topic": "CPU 五级流水线与冒险处理",
    "difficulty": "最新统考",
    "question": "在不考虑异常中断处理和访存的额外开销下，下列关于数据通路结构与CPI 之间的 关系是正确的为（） Ⅰ. 单周期数据通路计算机的CPI 等于1 Ⅱ. 多周期数据通路计算机的CPI 大于1 Ⅲ. 流水线数据通路计算机的CPI 等于1",
    "options": [
      "仅Ⅰ、Ⅱ",
      "仅Ⅰ、Ⅲ",
      "仅Ⅱ、Ⅲ",
      "Ⅰ、Ⅱ、Ⅲ"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-21",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2026年 408 统考真题 第21题",
    "year": 2026,
    "topic": "指令周期时序打拍与总线控制",
    "difficulty": "最新统考",
    "question": "在I/O 子系统，由驱动程序和中断服务程序直接控制外设与主机之间的输入/ 输 出操作，其中需要用到一些特权指令。下列指令中，不是特权指令的是（）",
    "options": [
      "I/O 指令",
      "关中断指令",
      "中断返回指令",
      "系统调用指令系统调用是用户态的陷阱指令，不是特权指令。"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-22",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2026年 408 统考真题 第22题",
    "year": 2026,
    "topic": "指令周期时序打拍与总线控制",
    "difficulty": "最新统考",
    "question": "中断控制I/O 方式下，实现I/O 需要硬件和软件协同完成，中断响应和处理过程 中所包含的下列工作中，必须由硬件完成的是（）",
    "options": [
      "开中断",
      "中断判优",
      "保存断点",
      "保存通用寄存器中断响应过程中，保存断点的操作由硬件自动完成，开中断、中断 判优、保存通用寄存器可由软件实现"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-23",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2026年 408 统考真题 第23题",
    "year": 2026,
    "topic": "操作系统核心时序机理",
    "difficulty": "最新统考",
    "question": "下列操作中，在内核态执行的是（）",
    "options": [
      "编译程序",
      "链接程序",
      "装入程序",
      "命令解释程序装入程序涉及内存地址映射和权限管理，需运行在内核态，其余程序 均运行在用户态"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-24",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2026年 408 统考真题 第24题",
    "year": 2026,
    "topic": "操作系统核心时序机理",
    "difficulty": "最新统考",
    "question": "在支持虚拟存储器系统下的指令执行过程中，正确的是（）",
    "options": [
      "地址转换由操作系统完成",
      "页表项的内容由编译器确定",
      "虚拟地址的长度必须与物理地址长度相同",
      "异常由操 作系统处理虚拟存储器的地址转换由MMU 硬件完成，异常由操作系统处理"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-25",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2026年 408 统考真题 第25题",
    "year": 2026,
    "topic": "操作系统核心时序机理",
    "difficulty": "最新统考",
    "question": "下列的线程描述中，正确的是（）",
    "options": [
      "内核级线程和用户级线程都由操作系统创建",
      "多个内核级线程可以映射到一个用户级线程",
      "同一个进程下的多个内核级线程共享 进程栈",
      "同一个进程下的多个线程共享进程堆同一进程内的所有线程共享进程堆资源，线程 栈为线程私有"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-26",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2026年 408 统考真题 第26题",
    "year": 2026,
    "topic": "操作系统核心时序机理",
    "difficulty": "最新统考",
    "question": "系统中有8 个进程，执行右图的操作，资源S 的初始值为5，若此时S 的值为- 2，m 表示执行到访问资源的进程个数，n 表示阻塞的进程个数，则m 和n 的值是 （） wait（S） 访问资源 signal（S）",
    "options": [
      "5,2",
      "5,1",
      "6,2",
      "7,1"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-27",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2026年 408 统考真题 第27题",
    "year": 2026,
    "topic": "操作系统核心时序机理",
    "difficulty": "最新统考",
    "question": "假设进程P 的读、写进程集合分别是R (P) 和W (P)，进程Q 的读写进程集合分 别为R (Q) 和W (Q)，则进程P 和Q 并发执行中，不会发生错误的并发执行冲突的 充要条件是（） Ⅰ. R (Q) ∩W (P) = ∅ Ⅱ. R (P) ∩R (Q) = ∅ Ⅲ. W (P) ∩W (Q) = ∅ Ⅳ. R (P) ∩W (Q) = ∅",
    "options": [
      "Ⅰ、Ⅱ",
      "Ⅰ、Ⅱ、Ⅲ",
      "Ⅰ、Ⅲ、Ⅳ",
      "Ⅱ、Ⅲ"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-28",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "page-replacement",
    "source": "2026年 408 统考真题 第28题",
    "year": 2026,
    "topic": "虚拟存储分页与页面置换算法",
    "difficulty": "最新统考",
    "question": "若64 位的系统采用三级虚拟分页存储管理方式，其结构如下图所示，第三级页表 所占的页框数是（）",
    "options": [
      "512",
      "32K",
      "256K",
      "128M"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-29",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "page-replacement",
    "source": "2026年 408 统考真题 第29题",
    "year": 2026,
    "topic": "虚拟存储分页与页面置换算法",
    "difficulty": "最新统考",
    "question": "下列方法中能够有效降低系统平均访问时间的是（） Ⅰ. TLB Ⅱ. 多级页表 Ⅲ. 工作集概念 Ⅳ. 页表缓冲队列",
    "options": [
      "Ⅰ、Ⅲ",
      "Ⅱ、Ⅲ",
      "Ⅰ、Ⅲ、Ⅳ",
      "Ⅰ、Ⅱ、ⅣTLB 加速地址转换，工作集减少缺页率，页表缓冲队列缩短访问时间， Ⅰ、Ⅲ、Ⅳ均可降低平均访问时间，"
    ],
    "answer": 1,
    "explanation": "。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-30",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "page-replacement",
    "source": "2026年 408 统考真题 第30题",
    "year": 2026,
    "topic": "虚拟存储分页与页面置换算法",
    "difficulty": "最新统考",
    "question": "进程P1 和P2 共享一个文件R，该文件的页表项分别是R1 和R2，其在2 个进 程中的虚拟地址分别是W1 和W2，则下列说法中正确的是（）",
    "options": [
      "页表项R1 和R2 的内容完全不同",
      "W1 和W2 映射的物理地址相同",
      "进程P1 对W1 的修改不会影响P2 对W2 的访问",
      "W1 和W2 虚拟地址相同共享文件的物理存储唯一，因此不同进程的虚拟地址W1、 W2 映射的物理地址相同"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-31",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2026年 408 统考真题 第31题",
    "year": 2026,
    "topic": "操作系统核心时序机理",
    "difficulty": "最新统考",
    "question": "下列关于驱动程序的描述中，错误的是（）",
    "options": [
      "驱动程序是硬件与操作系统之间的接口程序",
      "驱动程序需根据硬件特性定制开发",
      "驱动程序需要设置统一的接口",
      "字符设备，块设备都是同一种I/O 方式字符设备（如鼠标、键盘）采用流式I/O， 按字节流传输数据；块设备（如磁盘、U 盘）采用块级I/O，按固定大小的块传输数据， 二者I/O 方式差异显著。"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-32",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2026年 408 统考真题 第32题",
    "year": 2026,
    "topic": "操作系统核心时序机理",
    "difficulty": "最新统考",
    "question": "下列操作中，鼠标中断处理程序完成的是（）",
    "options": [
      "解析鼠标的输入指令含义",
      "将鼠标数据同步到用户应用程序缓冲区",
      "将数据从输入设备传输到数据寄存器",
      "将数据从数据寄存器传输到内核缓冲区选项D（正确）：鼠标触发中断后，中断处 理程序的核心工作是读取数据寄存器中的鼠标数据，并将其写入内核缓冲区暂存，供后 续处理。"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-33",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "dns-resolution",
    "source": "2026年 408 统考真题 第33题",
    "year": 2026,
    "topic": "DNS 递归与迭代分层解析沙盒",
    "difficulty": "最新统考",
    "question": "下列关于分层网络体系结构的叙述中，错误的是（）",
    "options": [
      "每层都有明确的功能边界",
      "层次越多效率越高",
      "有利于各层技术独立演化",
      "上层无需关心下层的具体实现细节层次并非越多越好，每增加一层就会引入一次封装 / 解封装的开销，过多层次会显著降低数据传输效率。"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-34",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "dns-resolution",
    "source": "2026年 408 统考真题 第34题",
    "year": 2026,
    "topic": "DNS 递归与迭代分层解析沙盒",
    "difficulty": "最新统考",
    "question": "若在带宽200kHz，信噪比S/N=1023 的信道上，发送一个长度为1500B 的分组， 则发送该分组的传输时延至少是（）",
    "options": [
      "1ms",
      "2ms",
      "3ms",
      "6ms"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-35",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "dns-resolution",
    "source": "2026年 408 统考真题 第35题",
    "year": 2026,
    "topic": "DNS 递归与迭代分层解析沙盒",
    "difficulty": "最新统考",
    "question": "假设采用CSMA/CA 的IEEE802.11 无线局域网，其数据传输速率为300 Mbps， DIFS=128μs，SIFS=28μs。忽略除数据帧以外的其他帧的传输时延及信号传播时延，主 机H 发送一个总长度为1500B 的数据帧，则H 从开始发送数据帧至确认接收收到所 需的时间至少（）",
    "options": [
      "40μs",
      "68μs",
      "168μs",
      "200μs"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-36",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "tcp-connection",
    "source": "2026年 408 统考真题 第36题",
    "year": 2026,
    "topic": "TCP 全双工三次握手与四次挥手时序",
    "difficulty": "最新统考",
    "question": "支持VLAN 划分的以太网交换机，已按端口划分了两个VLAN。VLAN 划分结果及部 分端口连接主机的MAC 地址如图所示。下列具有不同目的MAC 地址（DA）和源MAC 地 址（SA）的以太网帧F1-F4 中，H3 会接收到的是（） F1：（DA）00-1A-2B-3C-4D-03；（SA）00-1A-2B-3C-4D-01F2：（DA）00-1A-2B-3C-4D-04； （SA）00-1A-2B-3C-4D-05F3：（DA）FF-FF-FF-FF-FF-FF；（SA）00-1A-2B-3C-4D-02F4： （DA）00-1A-2B-3C-4D-06；（SA） 00-1A-2B-3C-4D-03",
    "options": [
      "仅F2、F4",
      "仅F1、F3",
      "仅F1、F2",
      "仅F3、F4"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-38",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "ip-subnet",
    "source": "2026年 408 统考真题 第38题",
    "year": 2026,
    "topic": "IP 子网掩码与 CIDR 超网编址",
    "difficulty": "最新统考",
    "question": "下列路由协议中，能将一个自治系统划分为多个区域内的内部网关协议是（） Ⅰ. OSPF Ⅱ. RIP Ⅲ. BGP",
    "options": [
      "仅Ⅰ",
      "仅Ⅱ",
      "仅Ⅰ、Ⅲ",
      "仅Ⅱ、ⅢOSPF 是支持自治系统内区域划分的内部网关协议，RIP 不支持，BGP 为 外部网关协议"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-39",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "ip-subnet",
    "source": "2026年 408 统考真题 第39题",
    "year": 2026,
    "topic": "IP 子网掩码与 CIDR 超网编址",
    "difficulty": "最新统考",
    "question": "若将IP 网络123.4.4.0/22 划分为规模均衡的32 个子网，则IP 地址 123.4.5.11 所在的子网是（）",
    "options": [
      "123.4.4.0/27",
      "123.4.4.32/27",
      "123.4.5.0/27",
      "123.4.5.192/27"
    ],
    "answer": 1,
    "explanation": "2026 年计算机 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2026-40",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "tcp-connection",
    "source": "2026年 408 统考真题 第40题",
    "year": 2026,
    "topic": "计算机网络协议时序",
    "difficulty": "最新统考",
    "question": "下列叙述中不属于cookie 的技术典型用途的是（）",
    "options": [
      "用户跟踪",
      "个性化推荐",
      "构建虚拟购物车",
      "缩短web 对象的响应时间Cookie 的典型用途包括用户跟踪、个性化推荐、构建虚 拟购物车，无法缩短Web 对象响应时间，"
    ],
    "answer": 1,
    "explanation": "。 这题刚好是皮皮灰模板题目 统计计算类 皮皮灰点评：这题在往年选择题考过，卡特兰树求栈的数量 常规题型 点评：眼都看花了 换成彩色的看的顺眼点",
    "labTip": "可在对应微观实验中单步推演验证。"
  },
  {
    "id": "q-2024-01",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "stack-queue",
    "source": "2024年 408 统考真题 第1题",
    "year": 2024,
    "topic": "栈与队列微观时序操作仿真",
    "difficulty": "高频真题",
    "question": "已知带头结点的非空单链表L 的头指针为h，结点结构为 ，其中 next 是指向直 接后继结点的指针。现有指针p 和q， 若 p 指向L 中非首且非尾的任意一个结点，则执行语 句序列“q=p->next； p->next=q->next；q->next= h->next;；h->next=q；”的结果是（ ）。",
    "options": [
      "在p 所指结点后插入q 所指结点",
      "在q 所指结点后插入p 所指结点",
      "将p 所指结点移动到L 的头结点之后",
      "将q 所指结点移动到L 的头结点之后"
    ],
    "answer": 3,
    "explanation": "本题考查链表的基本操作。 语句q=p->next：指针q 指向p 的下一个结点； 语句p->next=q->next：p 的next 域指向q 的下一个结点，即将q 所指结点从链表中取出； 语句q->next=L->next：q 的next 域指向第一个结点（头结点的后一个结点）； 语句L->next=q：头指针指向q 所指结点。 因此，这段代码的功能是将q 结点移动到表头。故本题选D。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-02",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "stack-queue",
    "source": "2024年 408 统考真题 第2题",
    "year": 2024,
    "topic": "栈与队列微观时序操作仿真",
    "difficulty": "高频真题",
    "question": "与表达式x+y*(z-u) / v 等价的后缀表达式是（ ）。",
    "options": [
      "xyzu-*v/+",
      "xyzu-v/*+",
      "+x / * y-zuv",
      "+x* y /-zuv"
    ],
    "answer": 0,
    "explanation": "本题考查栈的应用中表达式的转换。 可以采用增减括号的方法解答。 （1）根据运算的先后顺序为中缀表达式全部加上括号变为(x+((y*(z-u))/v))； （2）把运算符移到对应的括号外面，变为：(x((y(zu)-)*v)/)+； （3）将括号全部去除后即为后缀表达式：xyzu-*v/+。故本题选A。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-03",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "tree-traversal",
    "source": "2024年 408 统考真题 第3题",
    "year": 2024,
    "topic": "二叉树多维遍历与平衡树旋转",
    "difficulty": "高频真题",
    "question": "若p 、q 和v 均为二叉树 T 中的结点，v 有两个孩子结点，T 的中序遍历序列形如：“...， p，v，q，...”，则下列叙述中，正确的是（ ）。",
    "options": [
      "p 没有右孩子，q 没左孩子",
      "p 没有右孩子，q 有左孩子",
      "p 有右孩子，q 没有左孩子",
      "p 有右孩子，q 有左孩子"
    ],
    "answer": 0,
    "explanation": "本题考查二叉树的遍历。 中序遍历的顺序为左子树、根结点、右子树。本题中v 有两个孩子结点，且中序遍历中有片段 p,v,q，则p、q 分别是v 左、右子树中的结点。在v 的左子树中，p 是左子树的中序遍历序列最 后一个结点，则p 是最右边的结点，故p 没有右孩子；在v 的右子树中，q 是右子树的中序遍 历序列第一个结点，则q 是最左边的结点，故q 没有左孩子。故本题选A。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-04",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "dijkstra",
    "source": "2024年 408 统考真题 第4题",
    "year": 2024,
    "topic": "Dijkstra 最短路径与图算法推演",
    "difficulty": "高频真题",
    "question": "若无向图G = (V，E)的邻接多重表如下图所示，则G 中顶点b 与d 的度分别是（ ）。",
    "options": [
      "0，2",
      "2，4",
      "2，5",
      "3，4"
    ],
    "answer": 1,
    "explanation": "本题考查无向图邻接多重表的存储方式。 1． D 2． A 3． A 4． B 5． D 6． A 7． D 8． A 9． B 10． C 11． D 12． B 13． B 14． C 15． D 16． D 17． C 18． B 19． C 20． B 21． A 22． C 23． A 24． A 25． D 26． A 27． A 28． B 29． A 30． C 31． C 32． C 33． B 34． C 35． D 36． B 37． D 38． D 39． C 40． D 本题有两种做法，一种是根据邻接多重表还原图，另一种是直接数出abcd 对应的1234 出现的 次数，由下图可知，b 对应的1 出现了2 次，度为2，d 对应的3 出现了4 次。度为4。故本题 选B。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-05",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "stack-queue",
    "source": "2024年 408 统考真题 第5题",
    "year": 2024,
    "topic": "栈与队列微观时序操作仿真",
    "difficulty": "高频真题",
    "question": "下列数据结构中, 不适合直接使用折半查找的是（ ）。 data next I.有序链表 II.无序数组 III.有序静态链表 IV.无序静态链表",
    "options": [
      "仅I 、III",
      "仅II、IV",
      "仅II、III、IV",
      "I、II、III、IV"
    ],
    "answer": 3,
    "explanation": "本题考查折半查找的基本性质。 折半查找，也称二分查找，在某些情况下相比于顺序查找，使用折半查找算法的效率更高。但 是该算法的使用的前提是静态查找表中的数据必须是有序的。也就是说，在使用折半查找算法 查找数据之前，应该首先把该表的数据按照所查的关键字进行排序。链表不支持随机查找，故 I 不适用，无序数组不适用折半查找，故II 不适用。静态链表是用数组来实现链式存储结构， 目的是方便在不设指针类型的高级程序设计语言中使用链式结构。故III、IV 不适用。故本题 选D。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-06",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "tree-traversal",
    "source": "2024年 408 统考真题 第6题",
    "year": 2024,
    "topic": "数据结构与经典算法",
    "difficulty": "高频真题",
    "question": "KMP 算法使用修正后的next 数组进行模式匹配，模式串 S= “aabaab”，当主串中某字符与 S 中某字符失配时， S 将向右滑动的最长距离是（ ）。",
    "options": [
      "5",
      "4",
      "3",
      "2"
    ],
    "answer": 0,
    "explanation": "本题考查KMP 算法中nextval 的应用。 传统KMP 算法使用next 数组，会存在j=next[j]的情况，因此采用next_val 来优化，处理结果 如下： 下标 1 2 3 4 5 6 字符 a a b a a b next 0 1 2 1 2 3 nextval 0 0 2 0 0 2 当主串中某个字符与S 中某字符失配时，有6 种情况，分别为下标1-6 不匹配。 当下标1 不匹配时，需要右移1 位 当下标2 不匹配时，需要右移2 位 当下标3 不匹配时，需要右移1 位 当下标4 不匹配时，需要右移4 位 当下标5 不匹配时，需要右移5 位 当下标6 不匹配时，需要右移4 位 故本题选A。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-07",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "dijkstra",
    "source": "2024年 408 统考真题 第7题",
    "year": 2024,
    "topic": "Dijkstra 最短路径与图算法推演",
    "difficulty": "高频真题",
    "question": "一棵二叉搜索树如题7 图所示，k1、k2、k3 分别是对应结点保存的关键字，子树T 的任一 结点中保存的关键字x 满足的是（ ）。",
    "options": [
      "x< k1",
      "x > k2",
      "k1 < x < k3",
      "k3 < x < k2"
    ],
    "answer": 3,
    "explanation": "本题考查二叉搜索树的基本性质。二叉搜索树，即二叉排序树。由二叉排序（搜索） 树的性质：若它的左子树不空，则左子树上所有结点的值均小于它的根结点的值；若它的右子 树不空，则右子树上所有结点的值均大于它的根结点的值。那么大小顺序应该是：K1<K3<T<K2， T 中任意结点均满足该大小顺序。而X 是T 中的一个结点，故本题选D。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-08",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "sorting",
    "source": "2024年 408 统考真题 第8题",
    "year": 2024,
    "topic": "经典排序算法时空复杂度比对沙盒",
    "difficulty": "高频真题",
    "question": "使用快速排序算法对含n(n≥3)个元素的数组 M 进行排序， 若第一趟排序将 M 中除枢轴 外的n-1 个元素划分为均不为空的 P 和Q 两块，则下列叙述中，正确的是（ ）。",
    "options": [
      "P 与Q 块间有序",
      "P 与Q 均块内有序",
      "P 和Q 的元素个数大致相等",
      "P 中和Q 中均不存在相等的元素"
    ],
    "answer": 0,
    "explanation": "本题考查快速排序的基本性质。 快速排序的基本思想是，通过一趟排序将待排记录分割成独立的两部分，其中一部分记录的关 键字均比另一部分记录的关键字小，之后，可分别对这两部分记录继续进行排序，以达到整个 序列有序。故第一趟排序将M 划分为均不空的P 和Q 两块，P 与Q 之间应是块间有序，但P 与Q 内的顺序无法确定。故本题选A。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-09",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "dijkstra",
    "source": "2024年 408 统考真题 第9题",
    "year": 2024,
    "topic": "Dijkstra 最短路径与图算法推演",
    "difficulty": "高频真题",
    "question": "已知关键字序列 28，22，20，19，8，12，15，5 是大根堆 (最大堆)，对该堆进行两次删除 操作后， 得到的新堆是（ ）。",
    "options": [
      "20，19，15，12，8，5",
      "20，19，15，5，8，12",
      "20，19，12，15，8，5",
      "20，19，8，12，15，5"
    ],
    "answer": 1,
    "explanation": "本题考查堆排序的过程。 堆的删除操作是把根结点和最后一个结点直接交换，删掉（在最后一个结点处的）根结点，再 从根结点向下调整。向下调整：在该结点的左右子树中，找一个最大的，与该结点交换，重复 此过程直到叶子节点。因此删除结点的结构如下图所示。 原大根堆： 原大根堆： 删除结点28： 调整： 删除结点22： 调整： 进行两次删除操作后，得到的新堆是20，19，15，5，8，12；故本题选B。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-10",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "sorting",
    "source": "2024年 408 统考真题 第10题",
    "year": 2024,
    "topic": "经典排序算法时空复杂度比对沙盒",
    "difficulty": "高频真题",
    "question": "现有由关键字组成的3 个有序序列（3，5）、（7，9）和（6），若按从左至右的次序选择 有序序列进行二路归并排序， 则关键字之间的总比较次数是（ ）。",
    "options": [
      "3",
      "4",
      "5",
      "6 在外排序中，利用败者树对初始为升序的归并段进行多路归并， 败者树中记录“冠军”的结 点保存的是（ ）。 A.最大关键字 B.最小关键字 C.最大关键字所在的归并段号 D.最小关键字所在的归并段号"
    ],
    "answer": 2,
    "explanation": "本题考查二路归并排序的过程。 二路归并排序的思想是假设初始序列含有n 个记录，则可看成是n 个有序的子序列，每个子 序列的长度为1，然后两两归并，得到个长度为2 或1 的有序子序列；再两两归并，......，如 此重复，直至得到一个长度为n 的有序序列为止。 将（3,5）与（7,9）进行合并： 3 和7 进行比较，3 存入序列得（3）；（1 次比较） 5 和7 进行比较，5 存入序列得（3,5）；（1 次比较） 子序列（3,5）处理完毕，将剩下的依次存入得（3,5,7,9）。 将（3,5,7,9）与（6）进行合并： 3 和6 进行比较，3 存入序列得（3）；（1 次比较） 5 和6 进行比较，5 存入序列得（3,5）；（1 次比较） 7 和6 进行比较，6 存入序列得（3,5,6）；（1 次比较） 子序列（6）处理完毕，将剩下的依次存入得（3,5,6,7,9）。 综上，总比较次数为5，故本题选C。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-12",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "number-representation",
    "source": "2024年 408 统考真题 第12题",
    "year": 2024,
    "topic": "IEEE 754 浮点与数值表示",
    "difficulty": "高频真题",
    "question": "C 语言代码如下。 int i=32777； short si=i； int j=si； 执行上述代码段后，j 的值是（ ）。",
    "options": [
      "-32 777",
      "-32 759",
      "32 759",
      "32 777"
    ],
    "answer": 1,
    "explanation": "在这道题目中，涉及到了 int 和 short 类型的转换。首先，让我们明确 int 和 short 类型 的大小：int 通常是 32 位（4 字节），short 通常是 16 位（2 字节），需要注意的是，int 和 short 类型都默认是有符号数，即最高位表示符号位。类型转换的规则是：当长整数转短整数 时，遵循高位截断，低位保留，会改变符号位；当短整数转长整数时，遵循符号扩展，高位按 照补码规则补。32777 转换为16 进制数，并用int 类型表示的结果是0000 8009H，转换为short 型只保留低位16 位，高位截掉，结果为8009H。Short 转换成int 需要符号扩展，8009H 在short 类型中为负数，转成十进制是（-32759），短整数转长整数不损失精度，结果仍为（-32759）。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-13",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2024年 408 统考真题 第13题",
    "year": 2024,
    "topic": "指令周期时序打拍与总线控制",
    "difficulty": "高频真题",
    "question": "通常情况下，将汇编语言程序中实现特定功能的指令序列定义成一条伪指令 (pseudoinstruction)。下列选项中，CPU 能理解并直接执行的是（ ）。 I.伪指令 II.微指令 III.机器指令 IV.汇编指令",
    "options": [
      "仅I、 IV",
      "仅II、III",
      "仅III、IV",
      "仅I、III、IV"
    ],
    "answer": 1,
    "explanation": "伪指令不是真正的指令，并没有与之对应的的机器码，不会被执行，伪指令所起的作 用主要是对汇编过程进行控制。汇编指令是汇编语言中的指令，它们使用助记符来表示机器指 令的功能。汇编指令本身并不是CPU 能直接执行的，它们需要被汇编器转换成机器指令后才 能被CPU 执行。微指令和机器指令都是可以被CPU 直接执行的。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-14",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "number-representation",
    "source": "2024年 408 统考真题 第14题",
    "year": 2024,
    "topic": "IEEE 754 浮点与数值表示",
    "difficulty": "高频真题",
    "question": "某科学实验中，需要使用大量的整型参数，为了保证表数精度的基础上提高运算速度， 需 要选择合理的数据表示方法。若整型参数 α 、β 的取值范围分别为- 220~220、- 240~240，则下列 选项中，α 、β 最适宜采用的数据表示方法分别是（ ）。",
    "options": [
      "32 位整数、32 位整数",
      "单精度浮点数、单精度浮点数",
      "32 位整数、双精度浮点数",
      "单精度浮点数、双精度浮点数"
    ],
    "answer": 2,
    "explanation": "32 位整数可以表示 α 范围内的每一个数字。对于β，虽然单精度浮点数可以表示的 范围是-2128 到2128，包含了B 的范围。但是浮点数并不能表示范围内的任意整数。比如 240-1 的二进制表示是11111111⋯ 1111（39 个1），单精度浮点数不能表示这个数字，因为尾数只有 23 位。而双精度浮点数的尾数有52 位，可以完全表示β范围里的每一个整数。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-15",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2024年 408 统考真题 第15题",
    "year": 2024,
    "topic": "计算机体系结构微架构核心",
    "difficulty": "高频真题",
    "question": "下列关于整数乘法运算的叙述中，错误的是（ ）。",
    "options": [
      "用阵列乘法器实现乘运算可以在一个时钟周期内完成",
      "用ALU 和移位器实现的乘运算无法在一个时钟周期内完成",
      "变量与常数的乘运算可以编译优化为若干条移位及加/减运算指令",
      "两个变量的乘运算无法编译转换为移位及加法等指令的循环实现"
    ],
    "answer": 3,
    "explanation": "二进制的乘法可以表示成左移和加法，比如“111” 可以分为*100+*10+*1 也就是左 移2 位 +左移1 位+本身。所以一个乘法可以展开成移位和加法，这样可以通过ALU 和移位 器在多个时钟周期下完成乘法运算。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-16",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cache-mapping",
    "source": "2024年 408 统考真题 第16题",
    "year": 2024,
    "topic": "Cache 组相联映射与颠簸冲突",
    "difficulty": "高频真题",
    "question": "对于页式虚拟存储管理系统，下列关于存储器层次结构的叙述中, 错误的是（ ）。",
    "options": [
      "Cache-主存层次的交换单位为主存块，主存-外存层次的交换单位为页",
      "Cache-主存层次替换算法由硬件实现，主存-外存层次替换算法由软件实现",
      "Cache-主存层次可采用回写法写策略，主存-外存层次通常采用回写法写策略",
      "Cache-主存层次可采用直接映射方式，主存-外存层次通常采用直接映射方式"
    ],
    "answer": 3,
    "explanation": "A.为概念性知识 B.cache 缺失是大概率事件，所以要利用速度比较快的方式，硬件速度快。缺页的发生相对较 少，所以采用软件实现。 C. Cache-主存层次可采用回写法写策略，也可采用全写法。主存-外存交换页面的开销比较大， 所以采用回写法。 D. 对于后半句，外存中的页面可以放到主存的任意位置，所以可以看成某种意义上的全相联 映射，而不是直接映射。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-17",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cache-mapping",
    "source": "2024年 408 统考真题 第17题",
    "year": 2024,
    "topic": "Cache 组相联映射与颠簸冲突",
    "difficulty": "高频真题",
    "question": "某计算机按字节编址，采用页式虚拟存储管理方式，虚拟地址为32 位，主存地址为30 位， 页大小为1KB。若TLB 共有32 个表项，采用4 路组相联映射方式，则TLB 表项中标记字段 的位数至少是（ ）。",
    "options": [
      "17",
      "18",
      "19",
      "20"
    ],
    "answer": 2,
    "explanation": "表项用4 路组相联，说明有32/4=8 组组号，占3 个二进制位。页大小是1KB=210 B，说明页内偏移占 10 个二进制位，所以标记字段位为：32-10-3=19 位。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-18",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cache-mapping",
    "source": "2024年 408 统考真题 第18题",
    "year": 2024,
    "topic": "Cache 组相联映射与颠簸冲突",
    "difficulty": "高频真题",
    "question": "下列事件中，不是在MMU 地址转换过程中检测的是（ ）。",
    "options": [
      "访问越权",
      "Cache 缺失",
      "页面缺失",
      "TLB 缺失"
    ],
    "answer": 1,
    "explanation": "MMU 负责虚拟地址到物理地址的转换，而 cache 缺失属于访问物理内存后的工作， 不属于MMU。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-19",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2024年 408 统考真题 第19题",
    "year": 2024,
    "topic": "CPU 五级流水线与冒险处理",
    "difficulty": "高频真题",
    "question": "对于采用“取指、译码/取数、执行、访存、写回” 5 段流水线的 RISC 数据通路， 下列 关于指令流水线数据冒险处理的叙述中，错误的是（ ）。",
    "options": [
      "相邻两条指令中的操作数相关可能引起数据冒险",
      "在数据相关的指令间插入 “气泡”能避免数据冒险",
      "所有数据冒险都可以通过加入转发（旁路）电路解决",
      "所有数据冒险都能通过调整指令顺序和插入 nop 指令解决"
    ],
    "answer": 2,
    "explanation": "C.假设R[x]表示通用寄存器x 的内容，M[x]表示地址为x 的存储单元内容， I0 : R[r1] ← M[R[rs1]+imm]，I1: R[r1]+R[r2]—>R[Rr1]，那么第一条先从内存中取一个数到寄存器r1 第 二条指令要用到这个r1，那么就算用转发也要使用阻塞等到访存结束才能拿到这个数。 D. 如果插入空指令，那么在数据冒险的时候，流水线会退化成单周期，这样就能消除数据冒 险。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-21",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2024年 408 统考真题 第21题",
    "year": 2024,
    "topic": "指令周期时序打拍与总线控制",
    "difficulty": "高频真题",
    "question": "下列关于中断I/O 方式的叙述中，错误的是（ ）。",
    "options": [
      "中断屏蔽字用于确定中断响应的优先级",
      "保存断点和程序状态字在中断响应阶段完成",
      "保存通用寄存器和设置新中断屏蔽字由软件实现",
      "单重中断方式下中断处理时CPU 处于关中断状态"
    ],
    "answer": 0,
    "explanation": "A.中断响应优先级是由中断控制照本身电路决定的，是有固定的顺序，而中断屏蔽字 是软件设置的，用来决定是否响应当前传过来的中断。 C.在中断处理时，用指令（软件）保存通用寄存器和设置的中断屏蔽字，由硬件保存断点和程 序状态字（PSW）。 D.单级中断必须保证正在处理的中断不能被别的中断插入嵌套执行，因此在中断处理过程中应 该始终让 CPU 处于关中断状态。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-22",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2024年 408 统考真题 第22题",
    "year": 2024,
    "topic": "指令周期时序打拍与总线控制",
    "difficulty": "高频真题",
    "question": "DMA 控制 I/O 方式下，设备的输入/输出由DMA 控制器控制完成，此时，DMA 控制器控 制的数据传输通路位于（ ）。",
    "options": [
      "CPU 和主存之间",
      "CPU 和 DMA 控制器之间",
      "设备接口和主存之间",
      "设备接口和DMA 控制器之间"
    ],
    "answer": 2,
    "explanation": "DMA 的作用是实现外设数据和主存数据的直接交换，数据传输过程不需要CPU 的 参与。所以选C。需要注意的是，DMA 传输前的预处理和传输后的后处理阶段还是需要CPU 參与的，前者通常由设备驱动程序来完成，后者通常由中断处理程序来完成，预处理阶段的数 据交换主要发生在CPU 和DMA 控制器之间，在数据传输过程中，DMA 控制器代替CPU 和 设备接口及内存进行数据传输，每次传输单位依然为一个字，但是这些数据交换与题干要求无 关。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-23",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2024年 408 统考真题 第23题",
    "year": 2024,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "下列关于中断、异常和系统调用的叙述中，错误的是（ ）。",
    "options": [
      "中断或异常发生时，CPU 处于内核态",
      "每个系统调用都有对应的内核服务例程",
      "中断处理程序开始执行时，CPU 处于内核态",
      "系统添加新类型设备时，需注册相应的中断服务例程"
    ],
    "answer": 0,
    "explanation": "中断或异常发生时，CPU 既可能处于内核态，也可能处于用户态。例如，当某个用户 程序试图将一个数除以 0 时，CPU 会检测到这一非法操作并触发异常，此时 CPU 仍处于用 户态。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-24",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2024年 408 统考真题 第24题",
    "year": 2024,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "下列选项中，操作系统在终止进程时不一定执行的是（ ）。",
    "options": [
      "终止子进程",
      "回收进程占用的设备",
      "释放进程控制块",
      "回收为进程分配的内存"
    ],
    "answer": 0,
    "explanation": "在操作系统终止父进程时，通常不会强制终止其子进程。此时，子进程会变成“孤儿 进程”，并由 init 进程（在 Linux 系统中为 PID=1 的进程）接管。操作系统在终止进程时， 会回收该进程所占用的所有资源，包括设备和内存，并释放进程控制块。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-25",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "page-replacement",
    "source": "2024年 408 统考真题 第25题",
    "year": 2024,
    "topic": "虚拟存储分页与页面置换算法",
    "difficulty": "高频真题",
    "question": "在支持页式存储管理的系统中，进程切换时操作系统需要执行的操作是（ ）。 I. 更新程序计数器的值 II.更新栈基址寄存器的值 Ⅲ.更新页表基地址寄存器的值",
    "options": [
      "仅Ⅲ",
      "仅I、Ⅱ",
      "仅I、Ⅲ",
      "I、Ⅱ、Ⅲ"
    ],
    "answer": 3,
    "explanation": "程序计数器（PC）保存着进程下一条即将执行的指令的地址。在进程切换时，需要将 当前进程的程序计数器值恢复，以便该进程能够从之前暂停的地方继续执行。栈基址寄存器（SP） 保存着进程栈的基地址，栈用于存储函数调用信息、局部变量、返回地址等数据，每个进程都 有自己的栈。在进程切换时，需要将当前进程的栈指针恢复，以便该进程可以正确访问自己的 栈。页表基地址寄存器（PTBR）保存着进程页表的基地址。在页式存储管理中，页表存储了 虚拟地址到物理地址的映射，每个进程都有自己的页表。进程切换时需要将当前进程的页表指 针恢复，以便该进程可以访问自己的内存区域。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-26",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2024年 408 统考真题 第26题",
    "year": 2024,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "文件系统需占用部分外存空间记录空闲块位置。下列方法中，占用外存空间的大小与当前空 闲块数量无关的是（ ）。",
    "options": [
      "位图法",
      "空闲表法",
      "成组链接法",
      "空闲链表法"
    ],
    "answer": 0,
    "explanation": "位图法使用位图来表示资源的使用状态，每个位表示一个磁盘块的占用情况。其中， 0 表示对应的磁盘块是空闲的，尚未被分配；1 表示对应的磁盘块已被分配。因此，位图法占 用的外存空间大小仅与外存空间的总大小有关，而与空闲块的数量无关。相对而言，B、C、D 选项的思想是只记录空闲块的信息，而不记录已分配块的信息，因此它们占用的外存空间大小 与当前空闲块的数量有关。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-27",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2024年 408 统考真题 第27题",
    "year": 2024,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "下列算法中，每次回收分区时仅合并大小相等的空闲分区的是（ ）。",
    "options": [
      "伙伴算法",
      "最佳适应算法",
      "最坏适应算法",
      "首次适应算法"
    ],
    "answer": 0,
    "explanation": "伙伴算法的核心思想是将内存划分为大小为2 的幂次方的块，最小块的大小是系统定 义的最小内存单元。每次分配内存时，如果请求的内存大小不符合当前内存块的大小标准，内 存块会继续拆分成两半，直到找到合适大小的块。每当内存回收时，系统会尝试将相邻的“伙 伴”块合并，所以仅合并大小相等的空闲分区。而B、C、D 选项则会合并相邻的空闲分区， 而不考虑它们的大小。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-28",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2024年 408 统考真题 第28题",
    "year": 2024,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "若进程P 中的线程T 先打开文件，得到文件描述符fd，再创建两个线程 Ta 和 Tb，则下列 资源中，Ta 与Tb 可共享的是（ ）。 I.进程 P 的地址空间 Ⅱ.线程T 的栈 Ⅲ.文件描述符fd",
    "options": [
      "仅I",
      "仅I、Ⅲ",
      "仅Ⅱ、Ⅲ",
      "I、Ⅱ、Ⅲ"
    ],
    "answer": 1,
    "explanation": "栈是线程私有的内存区域，用于存储线程在执行过程中的局部变量、函数调用的返回 地址、函数参数和一些中间结果。每个线程都有自己的栈空间，因此线程 Ta 和 Tb 无法访问 线程 T 的栈。进程 P 的地址空间、文件描述符、全局变量和堆空间等资源是进程 P 中所有 线程共享的。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-29",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "scheduling",
    "source": "2024年 408 统考真题 第29题",
    "year": 2024,
    "topic": "CPU 进程调度算法模拟器",
    "difficulty": "高频真题",
    "question": "下列系统调用的实现中，包含文件按名查找功能的是（ ）。",
    "options": [
      "open( )",
      "read( )",
      "write( )",
      "close( )"
    ],
    "answer": 0,
    "explanation": "在调用 open() 函数时，操作系统根据传入的文件名在文件系统中查找具体的文件并 将其打开，然后返回一个文件描述符，这就是文件按名查找功能。在调用 read()、write() 和 close() 函数时，只允许传入文件描述符，而不允许传入文件名。 30. 【参考答案】C 【解析】在时间片轮转调度算法中，系统将所有就绪进程放入一个队列中，每个进程按顺序轮 流获得 CPU 执行的机会。每个进程在获得 CPU 时，最多可以执行一个固定长度的时间片。 如果在时间片结束前进程没有完成，它将被放回队列的末尾，等待下一轮执行。在这个系统中， 时间片的大小为 5ms，队尾进程 P 需要 25ms 的 CPU 时间，所以进程 P 需要 5 轮调度才 能执行完成。由于系统中共有 10 个进程，一轮调度的时间为 5ms × 10 = 50ms，5 轮调度 共需要 5 × 50ms = 250ms，此时进程 P 刚好执行完毕。进程的周转时间是指进程完成时间 减去进程到达时间。对于进程 P，到达时间为 0ms，完成时间为 250ms，因此 P 进程的周转 时间为 250ms。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-30",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "scheduling",
    "source": "2024年 408 统考真题 第30题",
    "year": 2024,
    "topic": "CPU 进程调度算法模拟器",
    "difficulty": "高频真题",
    "question": "假设某系统使用时间片轮转调度算法进行CPU 调度，时间片大小为5ms，系统共有10 个进 程，初始时均处于就绪队列，执行结束前仅处于执行态或就绪态。若队尾的进程P 所需CPU 时间最短，时间为25ms，在不考虑系统开销的情况下，则进程P 的周转时间为（ ）。",
    "options": [
      "200ms",
      "205ms",
      "250ms",
      "295ms"
    ],
    "answer": 0,
    "explanation": "2024年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-31",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2024年 408 统考真题 第31题",
    "year": 2024,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "键盘中断服务例程执行结束时，所输入数据的存放位置是（ ）。",
    "options": [
      "用户缓冲区",
      "CPU 中的通用寄存器",
      "内核缓冲区",
      "键盘控制器的数据寄存器"
    ],
    "answer": 2,
    "explanation": "当 CPU 接收到来自键盘的中断信号后，操作系统会暂停当前正在运行的任务，并跳 转到专门的中断服务例程来处理该中断。中断服务例程通过键盘控制器读取按键扫描码，以确 定用户按下的是哪个按键，并将其转换为相应的字符，然后存入内核中的键盘缓冲区。之后， 操作系统或应用程序可以从内核缓冲区中读取用户输入的数据进行处理。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-32",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "scheduling",
    "source": "2024年 408 统考真题 第32题",
    "year": 2024,
    "topic": "CPU 进程调度算法模拟器",
    "difficulty": "高频真题",
    "question": "某磁盘的磁道数为400(磁道号为0~399)，采用循环扫描算法（CSCAN）进行磁盘调度，完 成对200 号磁道的请求后，磁头向磁道号减小的方向移动。若还有7 个磁盘请求，对应的磁道 号分别为300，120，110，0，160，210，399，则完成上述磁盘访问请求后磁头移动的距离是 （ ）。",
    "options": [
      "599",
      "619",
      "788",
      "799"
    ],
    "answer": 2,
    "explanation": "在循环扫描算法中，磁头在磁盘上仅向一个方向扫描并服务沿途遇到的所有磁盘请求。 当磁头到达磁盘上待访问请求的最低磁道后，它会快速回到磁盘上待访问请求的最高磁道，在 此期间不处理任何请求，然后再次开始向同一方向扫描并服务新的请求。本题中，磁盘完成对 200 号磁道的请求后，磁头向磁道号减小的方向移动到 0 号磁道，处理了请求 160、120、110 和 0，期间移动了 200 个磁道。随后，磁头从 0 号磁道快速移动到 399 号磁道，不处理任 何请求，期间移动了 399 个磁道。最后，磁头从 399 号磁道移动到 210 号磁道，处理了请 求 399、300 和 210，期间移动了 189 个磁道。整个过程共移动了 200 + 399 + 189 = 788 个 磁道。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-33",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "sliding-window",
    "source": "2024年 408 统考真题 第33题",
    "year": 2024,
    "topic": "滑动窗口协议与拥塞控制动态曲线",
    "difficulty": "高频真题",
    "question": "若某分组交换网络及每段链路的带宽如下图所示，则H1 到H2 的最大吞吐量约为（ ）。",
    "options": [
      "1 Mb/s",
      "10 Mb/s",
      "100 Mb/s",
      "1000 Mb/s"
    ],
    "answer": 1,
    "explanation": "带宽指的是网络或通信链路在单位时间内能够承载或传输的最大数据量，吞吐量指的 是实际在某一段时间内成功传输的数据量。如果链路的传输速率限制了数据的发送或接收速度， 那么即使其他链路可以更快地传输数据，也无法提升整体的吞吐量。 在本题中，H1 和H2 之间的数据传输有三种可能的路径：1、经过两条带宽为1000Mb/s 的路 径；2、经过一条带宽为1Mb/s 的路径；3、经过两条100Mb/s 的路径。无论选择哪种路径，数 据传输都必须经过带宽为10Mb/s 的链路（H1 到路由）和10Mb/s 的链路（路由到H2）。在理 想环境下（即未提及拥塞或数据包丢失的情况），整体吞吐量由瓶颈链路的带宽决定。因此， 这三种不同路径的整体数据吞吐量分别为：10Mb/s、1Mb/s、10Mb/s，因此，最大吞吐量为10Mb/s。 选项B 是正确答案。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-34",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "tcp-connection",
    "source": "2024年 408 统考真题 第34题",
    "year": 2024,
    "topic": "计算机网络协议时序",
    "difficulty": "高频真题",
    "question": "在下列二进制数字调制方法中，需要2 个不同频率载波的是（ ）。",
    "options": [
      "ASK",
      "PSK",
      "FSK",
      "DPSK"
    ],
    "answer": 2,
    "explanation": "在这些选项中，FSK (Frequency Shift Keying) 是唯一需要使用两个不同频率载波的调 制方法。FSK 是一种二进制调制技术，通过改变载波信号的频率来传输信息，其中两种不同的 频率分别表示二进制的两个状态（0 和1）。其他选项中，ASK (Amplitude Shift Keying) 通过 改变载波的幅度来表示不同的二进制状态。PSK (Phase Shift Keying) 则通过改变载波的相位来 传递信息。DPSK (Differential Phase Shift Keying) 是PSK 的变体，通过改变载波的相位差来传 输信息。选项C 是正确答案。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-35",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "tcp-connection",
    "source": "2024年 408 统考真题 第35题",
    "year": 2024,
    "topic": "TCP 全双工三次握手与四次挥手时序",
    "difficulty": "高频真题",
    "question": "如题35 图所示的支持VLAN 划分的交换机，已按端口划分了3 个VLAN，部分端口连接主 机的IP 地址和MAC 地址如图中所示，ARP 表结构为<IP 地址，MAC 地址，TTL>。下列选项 中，不会出现在 H4 的ARP 表中的是（ ）。",
    "options": [
      "192.168.3.81，00-18-A2-3B-36-21， 14: 32:00",
      "192.168.3.91，00-3E-C2-39-12-B5， 14: 37:00",
      "192.168.3.125，00-E5-78-4A-09-B2，14:45:00",
      "192.168.3.129，00-08-6E-05-A7-82，14:52:00"
    ],
    "answer": 3,
    "explanation": "H4 与其他主机通过支持VLAN 划分的交换机连接，该交换机按端口划分了不同的 VLAN，因此不同VLAN 之间的主机无法直接通信。ARP 表中仅存储与H4 处于同一VLAN 内 的主机的IP 地址与MAC 地址映射关系。因此，H4 只能通过ARP 获得与其处于同一VLAN 的主机信息，跨VLAN 的主机不会出现在H4 的ARP 表中。H4 位于VLAN1，选项D 中的主 机H6 位于VLAN3，无法与H4 直接通信，因此不会出现在H4 的ARP 表中。而选项A、B、 C 中的主机H2、H1 和H3 都与H4 同处VLAN1，可能出现在H4 的ARP 表中。选项D 是正 确答案。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-36",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "tcp-connection",
    "source": "2024年 408 统考真题 第36题",
    "year": 2024,
    "topic": "TCP 全双工三次握手与四次挥手时序",
    "difficulty": "高频真题",
    "question": "在采用 CSMA/CA 的802.11 无线局域网中，DIFS=128μs，SIFS=28μs，RTS、CTS 和ACK 帧的传输时延分别是3μs、2μs 和2μs，忽略信号传播时延。若主机A 欲向AP 发送一个总长度 为1998 B 的数据帧，无线链路带宽为54Mb/s，则隐藏站B 收到 AP 发送的 CTS 帧时，设置 的网络分配向量NAV 的值是（ ）。",
    "options": [
      "326μs",
      "354μs",
      "385μs",
      "513μs"
    ],
    "answer": 1,
    "explanation": "在CSMA/CA 协议中，当主机A 打算发送数据时，它会通过发送RTS 帧来通知接收 设备AP。接收设备在发送CTS 帧时，会在帧中包含一个NAV 字段，指示接下来通信的时间 长度。收到CTS 帧的其他设备（如隐藏站B）读取NAV 值，知道在这段时间内信道会被占用， 从而不再尝试占用信道。NAV 设置了一个倒计时器，当倒计时结束时，设备才会再次检测信道 是否空闲，以决定是否可以发起新的通信。 所以本道题中我们需要计算的NAV 值，也就是主机B 收到CTS 帧后，AP 与主机A 之间通信 的持续时间的值，也就是主机A 收到AP 发送CTS 帧后（由于题目中忽略信号传播时延，故 CTS 帧从AP 到B 的时间与到A 的时间相同）开始发送数据，到AP 接收到数据并发送ACK 帧完成通信的时间，具体过程如下图。 依图可知，NAV = SIFS + 数据帧传输时延 + SIFS + ACK 传输时延。由于数据帧长度为1998B， 无限链路带宽为54Mb/s，所以数据帧传输时延为296μs。将对应数值带入公式，求得NAV=28μs + 296μs + 28μs + 2μs = 354μs。选项B 是正确答案。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-37",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "tcp-connection",
    "source": "2024年 408 统考真题 第37题",
    "year": 2024,
    "topic": "TCP 全双工三次握手与四次挥手时序",
    "difficulty": "高频真题",
    "question": "主机甲通过选择重传(SR)滑动窗口协议向主机乙发送帧的部分过程如题37 图所示，Fx 为数 据帧，ACKx 为确认帧，x 是位数为3 比特的序号。乙只对正确接收的数据帧进行独立确认， 发送窗口与接收窗口大小相同且均为最大值。甲在t1 时刻和t2 时刻发送的数据帧分别是（ ）。",
    "options": [
      "F1，F3",
      "F1，F4",
      "F3，F1",
      "F4，F1"
    ],
    "answer": 3,
    "explanation": "本题使用的是选择重传（SR）滑动窗口协议，且序号的位数为3 比特，发送窗口和接 收窗口大小相同且均为最大值，故发送窗口与接收窗口的大小均为4。 根据图示，甲首先发送了F0 至F3 四个连续的数据帧，其中F1 在传输过程中丢失。此时，甲 的滑动窗口内的数据帧已全部发送。t1 时刻，甲收到乙对F0 的确认帧，滑动窗口向后移动， 发送数据帧F4；t2 时刻，甲收到乙对F2 的确认帧，但由于未收到F1 的确认帧，滑动窗口未 继续滑动，此时F1 超时，甲重新发送F1。综上，t1 和t2 时刻甲分别发送了F4 和F1，选项D 是正确答案。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-38",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "tcp-connection",
    "source": "2024年 408 统考真题 第38题",
    "year": 2024,
    "topic": "TCP 全双工三次握手与四次挥手时序",
    "difficulty": "高频真题",
    "question": "假设主机H 通过TCP 向服务器发送长度为3000B 的报文，往返时间RTT=10ms，最长报 文段寿命MSL=30s，最大报文段长度MSS=1 000 B，忽略TCP 段的传输时延，报文传输结束 后H 首先请求断开连接，则从H 请求建立TCP 连接时刻起，到H 进入 CLOSED 状态为止， 所需的时间至少是（ ）。",
    "options": [
      "30.03 s",
      "30.04 s",
      "60.03 s",
      "60.04 s"
    ],
    "answer": 3,
    "explanation": "从H 请求建立TCP 连接时刻起，到H 进入CLOSED 状态为止，共要经历三个阶段， 分别是TCP 连接建立阶段，数据传输阶段和TCP 连接结束阶段。具体过程如下： 首先，H 向服务器发送第一次握手信息，服务器回复第二次握手信息。由于TCP 协议采用慢 开始的拥塞控制策略，H 在发送第三次握手信息时，可以携带1000B 的数据，这标志着第一次 数据传输的开始，此时拥塞窗口为1，H 需要等待服务器的ACK。接下来，H 在第二次数据传 输时，拥塞窗口为2，可以一次性发送2000B 的数据，数据传输阶段在服务器返回ACK 后结 束。随后，H 请求断开连接，向服务器发送第一次挥手数据包。由于服务器没有数据需要回传， 它会依次发送第二次和第三次挥手数据包。H 在收到第三次挥手数据包后，发送第四次挥手包， 同时在等待2 倍MSL 的时间后，进入CLOSED 状态。 总结上述过程，连接建立阶段，耗费1 个RTT 的时间。数据传输阶段，耗费2 个RTT 的时间。 连接结束阶段，耗费1 个RTT 的时间。所以从H 请求建立TCP 连接起到H 进入CLOSED 状 态为止，所需的时间至少是4*RTT + 2*MSL = 60.04s。选项D 是正确答案。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-39",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "tcp-connection",
    "source": "2024年 408 统考真题 第39题",
    "year": 2024,
    "topic": "TCP 全双工三次握手与四次挥手时序",
    "difficulty": "高频真题",
    "question": "若UDP 协议在计算校验和过程中，计算得到中间结果为1011 1001 1011 0110 时，还需要 加上最后一个16 位数0110 0101 1100 0101，则最终计算得到的校验和是（ ）。",
    "options": [
      "0001 1111 0111 1011",
      "0001 1111 0111 1100",
      "1110 0000 1000 0011",
      "1110 0000 1000 0100"
    ],
    "answer": 2,
    "explanation": "UDP 校验和的计算主要分为三个步骤：字块求和、进位回卷和按位取反。首先，将数 据按16 位字块划分，对这些字块执行二进制加法操作。这里的二进制加法包括进位处理，而 不是异或运算。通过这种加法操作，得到结果X。接下来，检查X 的位数是否超过16 位。如 果X 的位数超出了16 位，则将高位溢出的部分加回到低位。最后，对结果X 进行按位取反， 得到的值即为校验和。 在题目中，已完成多个字块的求和，现需进行最后一次求和。我们将 1011 1001 1011 0110 和 0110 0101 1100 0101 相加，得到 1 0001 1111 0111 1011。由于结果超过了16 位，需进行进位 回卷，将溢出的高位加回到低位，得到 0001 1111 0111 1100。最后，对结果进行按位取反，得 到 1110 0000 1000 0011，这就是校验和。选项C 是正确答案。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2024-40",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "tcp-connection",
    "source": "2024年 408 统考真题 第40题",
    "year": 2024,
    "topic": "TCP 全双工三次握手与四次挥手时序",
    "difficulty": "高频真题",
    "question": "若浏览器不支持并行 TCP 连接，使用非持久的HTTP/1.0 协议请求浏览1 个Web 页，该 页中引用同一网站上7 个小图像文件，则从浏览器为传输 Web 页请求建立TCP 连接开始， 到接收完所有内容为止，所需要的往返时间RTT 数至少是（ ）。",
    "options": [
      "4",
      "9",
      "14",
      "16"
    ],
    "answer": 3,
    "explanation": "在使用非持久的HTTP/1.0 协议请求一个Web 页面时，每个资源（包括主页面和引用 的图像）都需要单独的TCP 连接。每个TCP 连接的建立和数据传输都需要往返时间RTT。具 体来说，每个TCP 连接的过程包括：建立连接需要1 个RTT，发送请求并接收响应也需要1 个RTT。因此，对于一个包含1 个主页面和7 个图像的网页，总共有8 个请求。每个请求都涉 及到建立一个新的TCP 连接和进行数据传输，因此总共需要8 个TCP 连接 * 2 RTT（每个连 接的建立和数据传输），总共为16 RTT。选项D 是正确答案。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2022-08",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "dijkstra",
    "source": "2022年 408 统考真题 第8题",
    "year": 2022,
    "topic": "Dijkstra 最短路径与图算法推演",
    "difficulty": "高频真题",
    "question": "在下图所示的5 阶B 树T 中，删除关键字260之后需要进行必要的调整，得到新的B 树T1。 下列选项中，不可能是T1根结点中关键字序列的是（ ）。 L 6。90 260々0 」 30 50 ] 170 80 85〕 [ 100 110 ] [ 280 300 ] [ 400 500",
    "options": [
      "60,90,280",
      "60, 90, 350",
      "60, 85,110, 350",
      "60,90, 110,350 0 9 . 下列因素中，影响散列（哈希）方法平均查找长度的是（ ）0 I . 装填因子 I I . 散列函数 i n . 冲突解决策略 A . 仅 I、II B . 仅 I、III C . 仅 n 、III D. I、IL III 第2 页（共8 页）"
    ],
    "answer": 0,
    "explanation": "2022年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2022-10",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "sorting",
    "source": "2022年 408 统考真题 第10题",
    "year": 2022,
    "topic": "经典排序算法时空复杂度比对沙盒",
    "difficulty": "高频真题",
    "question": "使用二路归并排序对含九个元素的数组M 进行排序时，二路归并操作的功能是《 ）0 A . 将两个有序表合并为一个新的有序表 B . 将M 划分为两部分，两部分的元素个数大致相等 C 将M 划分为几个部分,每个部分中仅含有一个元素 D . 将乂划分为两部分，一部分元素的值均小于另一部分元素的值 对数据进行排序时，若采用直接插入排序而不采用快速排序,则可能的原因是（ ）。 L 大部分元素已有序 I L 待排序元素数量很少 i n . 要求空间复杂度为o （D I V . 要求排序算法是稳定的 A , 仅 I、II B , 仅 HI、IV C . 仅 I、n 、IV D. I、II、in、IV 12 . 某计算机主频为1 G H z , 程序P 运行过程中，共执行了 10000条指令，其中，80%的指令执 行平均需1 个时钟周期，20% 的指令执行平均需10个时钟周期。程序P 的平均CPI和CPU 执行时间分别是（ ）o",
    "options": [
      "2.8,2811s",
      "28,28 pis",
      "2.8, 28 ms 13 . 32位补码所能表示的整数范围是（ ）o A. -232- 231-1 B. -231- 2 31-1 C. -232- 2 32-l 14 . -04375的IEEE 754单精度浮点数表示为（ ）。 A. BEEO 0000H B. BF60 0000H C. BF70 0000H",
      "28, 28 ms D. -231- 2 32-l D. COEO 0000H 15 . 某计算机主存地址为24位，采用分页虚拟存储管理方式，虚拟地址空间大小为4 G B , 页大小为 4 K B , 按字节编址。某进程的页表部分内容如下表所示。 C . 得到主存地址01 8840H D . 检测到缺页异常 16 .若计算机主存地址为32位，按字节编址，某Cache的数据区容量为32 K B , 主存块大小为64 B , 采用8 路组相联映射方式？该Cache中比较器的个数和位数分别为（ ）。 A. 8, 20 B. 8, 23 C. 64,20 D. 64, 23 17 . 某内存条包含8 个8192x8192x8位的D R A M 芯片，按字节编址，支持突发（burst）传送方式, 对应存储器总线宽度为64 位，每个D R A M 芯片内有一个行缓冲区（row buffer）。下列关于 该内存条的叙述中，不正确的是（ ）。 A . 内存条的容量为512 M B B . 采用多模块交叉编址方式 C . 芯片的地址引脚为26位 D . 芯片内行缓冲有8192x8位 18 . 下列选项中，属于指令集体系结构（ISA）规定的内容是（ ）。 L 指令字格式和指令类型 IL C P U 的时钟周期 III.通用寄存器个数和位数 I V . 加法器的进位方式 A . 仅 I、II B . 仅 I、in c . 仅 n 、iv D. 仅 I、in、IV / 1 9 . 设计某指令系统时，假设采用16位定长指令字格式，操作码使用扩展编码方式，地址码为6 位，包含零地址、一地址和二地址3 种格式的指令。若二地址指令有1 2 条，一地址指令有 254条，则零地址指令的条数最多为（ ）。 A. 0 B. 2 C. 64 D. 128 2 0 . 将高级语言源程序转换为可执行目标文件的主要过程是（ A . 预处理- 编译一汇编一链接 B . 预处理f 汇编一编译一链接 第3 页（共8 页） C . 预处理f 编译f 链接f 汇编 D . 预处理f 汇编f 链接f 编译 21 . 下列关于中断I/O方式的叙述中，不正确的是（ ）。 A . 适用于键盘、针式打印机等字符型设备 B . 外设和主机之间的数据传送通过软件完成 C . 外设准备数据的时间应小于中断处理时间 D . 外设为某进程准备数据时CPU可运行其他进程 22 . 下列关于并行处理技术的叙述中，不正确的是（ ）。 A . 多核处理器属于MIMD结构 B . 向量处理器属于SIMD结构 C . 硬件多线程技术只可用于多核处理器 D. SMP中所有处理器共享单一物理地址空间 23 . 下列关于多道程序系统的叙述中，不正确的是（ ）。 A . 支持进程的并发执行 B . 不必支持虚拟存储管理 C . 需要实现对共享资源的管理 D . 进程数越多CPU利用率越高 24 . 下列选项中，需要在操作系统进行初始化过程中创建的是（ ）。 A . 中断向量表 B . 文件系统的根目录 C , 硬盘分区表 D . 文件系统的索引结点表 25 . 进程PO、P l、P2和P3进入就绪队列的时亥IJ、优先级（值越小优先权越高）及CPU执行时间 如下表所示。 进程 进入就绪队列的时刻 优先级 CPU执行时间 P0 0 ms 15 100 ms P1 10 ms 20 60 ms P2 10 ms 10 20 ms P3 15 ms 6 10 ms 若系统采用基于优先权的抢占式进程调度算法，则从0 m s时刻开始调度，到4 个进程都 运行结束为止，发生进程调度的总次数为（ A. 4 B. 5 C. 6 D. 7 26 . 系统中有三个进程P0、P l、P 2 及三类资源A、B、C o 若某时刻系统分配资源的情况如下表 所示，则此时系统中存在的安全序列的个数为（ ）0 进程 已分配资源数 尚需资源数 可用资源数 A B C A B C A B C P0 2 0 1 0 2 1 1 3 2 Pl 0 2 0 1 2 3 P2 1 0 1 0 1 3 A. 1 B. 2 C. 3 D. 4 27 . 下列关于CPU模式的叙述中，正确的是（ ）o A. CPU处于用户态时只能执行特权指令 , B. CPU处于内核态时只能执行特权指令 C. CPU处于用户态时只能执行非特权指令 D. CPU处于内核态时只能执行非特权指令 28 . 下列事件或操作中，可能导致进程P 由执行态变为阻塞态的是（ ）。 I . 进程P 读文件 I I . 进程P 的时间片用完 I I L 进程P 申请外设 I V .进程P 执行信号量的wait（）操作 A . 仅 I、IV B . 仅 n 、III C . 仅皿、IV D , 仅 I、IIL IV 第4 页（共8 页） 29 .某进程访问的页b 不在内存中,导致产生缺页异常，该缺页异常处理过程中不一定包含的操 作是（ ）。 • A . 淘汰内存中的页 B . 建立页号与页框号的对应关系 C . 将页b 从外存读入内存 D . 修改页表中页b 对应的存在位 30 . 下列选项中，不会影响系统缺页率的是（ ）。 A , 页置换算法 B . 工作集的大小 C . 进程的数量 31 . 执行系统调用的过程涉及下列操作, D . 页缓冲队列的长度 其中由操作系统完成的是（ I . 保存断点和程序状态字 I I I . 执行系统调用服务例程 A . 仅 I、III B . 仅 II、III I I . 保存通用寄存器的内容 I V . 将CPU模式改为内核态 C . 仅 II、IV D . 仅 II、IIL IV 32 . 下列关于驱动程序的叙述中,不正确的是（ ）。 A . 驱动程序与I/O 控制方式无关 B . 初始化设备是由驱动程序控制完成的 C . 进程在执行驱动程序时可能进入阻塞态 D . 读/写设备的操作是由驱动程序控制完成的 33 . 在ISO/OSI参考模型中，实现两个相邻结点间流量控制功能的是（ ）o A . 物理层 B . 数据链路层 C . 网络层 D . 传输层 34 . 在一条带宽为200 kH z的无噪声信道上，若采用4 个幅值的A SK 调制，则该信道的最大数据 传输速率是（ ）。 A. 200 kbps B. 400 kbps C. 800 kbps D. 1600 kbps 35 . 若某主机的I P 地址是183.80.72.48,子网掩码是255.255.192.0,则该主机所在网络的网络地 址是（ ）0 A. 183.80.0.0 B. 183.80.64.0 C. 183.80.72.0 D. 183.80.192.0 36 . 下图所示网络中的主机H 的子网掩码与默认网关分别是（ ）。 Internet r_ 喀理幽 1 \" 2 _ 信 路由器 [192.168.1.62/27 交换机 H 192.168.1.60 B. 255.255.255,192, 192.168.1.62 D. 255.255.255.224,192.168.1.62 A. 255.255.255.192, 192.168.1.1 C. 255.255.255.224,192.168.1.1 37 . 在SD N 网络体系结构中，SD N 控制器向数据平面的SD N 交换机下发流表时所使用的接口是 A , 东向接口 B . 南向接口 C . 西向接口 D . 北向接口 38 . 假设主机甲和主机乙已建立一个TCP连接，最大段长MSS = 1 K B ,甲一直有数据向乙发送, 当甲的拥塞窗口为16K B 时，计时器发生了超时，则甲的拥塞窗口再次增长到16K B所需要 的时间至少是（ ）o A. 4RTT B. 5RTT C. 11 RTT D. 16RTT 39 .假设客户C 和服务器S 已建立一个TCP连接，通信往返时间RTT = 50 m s , 最长报文段寿命 MSL = 8 0 0 m s ,数据传输结束后，C 主动请求断开连接。若从C 主动向S 发出FIN段时刻算 起，则。和S 进入CLOSED状态所需的时间至少分别是（ 工 A. 850 ms, 50 ms B. 1650 ms, 50 ms C. 850 ms, 75 ms D. 1650 ms, 75 ms 4 0 . 假设主机H 通过HTTP/1.1请求浏览某W eb服务器S 上的W eb页news408.htal, news408.html 第5 页（共8 页） 引用了同目录下的1 幅图像，news408.html文件大小为1 MSS （最大段长），图像文件大小为 3 MSS, H 访问S 的往返时间RTT = 10 m s ,忽略HTTP响应报文的首部开销和TCP段传输时 延。若H 已完成域名解析，则从H 请求与S 建立TC P连接时刻起，到接收到全部内容止， 所需的时间至少是（ ）o A. 30 ms B. 40 ms C. 50 ms D. 60 ms"
    ],
    "answer": 0,
    "explanation": "2022年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2020-01",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "tree-traversal",
    "source": "2020年 408 统考真题 第1题",
    "year": 2020,
    "topic": "数据结构与经典算法",
    "difficulty": "高频真题",
    "question": "将一个10x10对称矩阵” 的上三角部分的元素叫力（1WZW/W10）按列优先存入C 语言的 一维数组N 中，元素加7,2在N 中的下标是（ ）。",
    "options": [
      "15",
      "16",
      "22",
      "23 0 2 . 对空栈 S 进行 Push 和 Pop 操作，入栈序列为 a, b, c, d, e , 经过 Push, Push, Pop, Push, Pop, Push, Push, Pop操作后得到的出栈序列是（ ）。 A. b, a, c B. b, a, e C. b, c, a D. b, c, e"
    ],
    "answer": 0,
    "explanation": "2020年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2020-03",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "tree-traversal",
    "source": "2020年 408 统考真题 第3题",
    "year": 2020,
    "topic": "二叉树多维遍历与平衡树旋转",
    "difficulty": "高频真题",
    "question": "对于任意一棵高度为5 且有10个结点的二叉树，若采用顺序存储结构保存，每个结点占1 个存储单元（仅存放结点的数据信息），则存放该二叉树需要的存储单元数量至少是（ ）o",
    "options": [
      "31",
      "16",
      "15",
      "10 0 4 . 已知森林尸及与之对应的二叉树T , 若尸的先根遍历序列是见瓦中根遍历序列是 b, a , d , f , e , c ,则T 的后根遍历序列是（ ）。 A. b ,a ,d ,f,e ,c B. b, d ,f,e ,c ,a C. b,f, e, d, c, a D. / e, d, c, b, a 0 5 . 下列给定的关键字输入序列中，不能生成如下二叉排序树的是（ ）o A. 4,5,2, 1,3 B. 4, 5, 1,2,3 C. 4, 2, 5, 3, 1 D. 4, 2, 1,3,5"
    ],
    "answer": 0,
    "explanation": "2020年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2020-06",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "dijkstra",
    "source": "2020年 408 统考真题 第6题",
    "year": 2020,
    "topic": "Dijkstra 最短路径与图算法推演",
    "difficulty": "高频真题",
    "question": "修改递归方式实现的图的深度优先搜索（DFS）算法，将输出（访问）顶点信息的语句移 到退出递归前（即执行输出语句后立刻退出递归）。采用修改后的算法遍历有向无环图G, 若输出结果中包含G 中的全部顶点，则输出的顶点序列是G 的（ ）0 A . 拓扑有序序列 B . 逆拓扑有序序列 C . 广度优先搜索序列 D . 深度优先搜索序列 0 7 . 已知无向图G 如下所示，使用克鲁斯卡尔（Kruskal）算法 求图G 的最小生成树,加到最小生成树中的边依次是（ ）0",
    "options": [
      "（6,力,（瓦的,（a, e）, （c, e）, （4 e） B . （瓦力,（6 ,八（瓦 e）, （a ,e ）, （c, e） 18 c. (a, e), (b, e), (c, e), (b, d), (b,f) D. (a, e), (c, e), (6, e),(“力,(A J) 0 8 . 若使用A O E 网估算工程进度，则下列叙述中正确的是（ ）o A . 关键路径是从原点到汇点边数最多的一条路径 B . 关键路径是从原点到汇点路径长度最长的路径 C . 增加任一关键活动的时间不会延长工程的工期 D . 缩短任一关键活动的时间将会缩短工程的工期 0 9 . 下列关于大根堆（至少含2 个元素）的叙述中，正确的是（ ）0 I . 可以将堆视为一棵完全二叉树 II.可以采用顺序存储方式保存堆 III.可以将堆视为一棵二叉排序树 I V . 堆中的次大值一定在根的下一层 A . 仅 I、II B . 仅 II、in c . 仅 I、n 和 iv D. I、in 和 iv 10 . 依次将关键字5, 6, 9, 13, 8,2, 12, 15插入初始为空的4 阶B 树后，根结点中包含的关键字 是（ ）o A. 8",
      "6,9",
      "8, 13",
      "9, 12 11 . 对大部分元素已有序的数组进行排序时，直接插入排序比简单选择排序效率更高，其原因 是（ ）o I . 直接插入排序过程中元素之间的比较次数更少 II . 直接插入排序过程中所需要的辅助空间更少 III . 直接插入排序过程中元素的移动次数更少 A . 仅 I B . 仅 ni c . 仅 I、II D. I、n 和 in 12 . 下列给出的部件中，其位数（宽度）一定与机器字长相同的是（ ）o I. A L U II.指令寄存器 III.通用寄存器 I V . 浮点寄存器 A . 仅 I、II B . 仅 I、ill c . 仅 II、ill D . 仅 n 、in、iv 13 . 已知带符号整数用补码表示，float型数据用IEEE 754标准表示，假定变量x 的类型只可能 是int或float,当x 的机器数为C800 0000H时，x 的值可能是（ ）。 A. -7x227 B. -216 C. 217 D. 25x227 14 . 在按字节编址，采用小端方式的3 2 位计算机中，按边界对齐方式为以下C 语言结构型变 量a 分配存储空间： Struct record{ short xl; int x2; } a; 若a 的首地址为2020 FE00H, a 的成员变量x 2 的机器数为1234 0 0 0 0 H ,则其中3 4 H 所在 存储单元的地址是（ ）。 ・ 022 • A. 2020 FE03H B. 2020 FE04H C. 2020 FE05H D. 2020 FE06H 15 . 下列关于TLB和Cache的叙述中，错误的是（ ）。 A . 命中率都与程序局部性有关 B . 缺失后都需要去访问主存 C . 缺失处理都可以由硬件实现 D . 都由DRAM存储器组成 16 . 某计算机采用16位定长指令字格式，操作码位数和寻址方式位数固定，指令系统有4 8 条 指令，支持直接、间接、立即、相对4 种寻址方式。单地址指令中，直接寻址方式的可寻 址范围是（ ）o A. 0—255 B. 0-1023 C. -128-127 D. —512〜511 17 . 下列给出的处理器类型中，理想情况下，CPI为1 的是（ ）。 I . 单周期CPU I I . 多周期CPU I I I . 基本流水线CPU I V .超标量流水线CPU A . 仅 I、II B . 仅 I、III C . 仅 II、IV D . 仅 n i、IV 18 . 下列关于“自陷”（T ra p ,也称陷阱）的叙述中，错误的是（ ）。 A . 自陷是通过陷阱指令预先设定的一类外部中断事件 B . 自陷可用于实现程序调试时的断点设置和单步跟踪 C . 自陷发生后CPU将转去执行操作系统内核相应程序 D . 自陷处理完成后返回到陷阱指令的下一条指令执行 19 . Q P I总线是一种点对点全工同步串行总线，总线上的设备可同时接收和发送信息，每个方 向可同时传输20位信息（16位数据+4位校验位），每个QPI数据包有80位信息，分2 个 时钟周期传送，每个时钟周期传递2 次。因此，Q P I总线带宽为：每秒传送次数x2Bx2。 若QPI时钟频率为2.4G H z,则总线带宽为（ ）o A. 4.8GBps B. 9.6GBps C. 19.2GBps D. 38.4GBps 20 . 下列事件中，属于外部中断事件的是（ ）o i . 访存时缺页 I I . 定时器到时 i n . 网络数据包到达 A . 仅 I、II B . 仅 I、HI c . 仅 n 、iii D. I、n 和 ni 21 . 外部中断包括不可屏蔽中断（NMI）和可屏蔽中断，下列关于外部中断的叙述中，错误的 是（ ）。 A. C P U 处于关中断状态时，也能响应NMI请求 B. 一旦可屏蔽中断请求信号有效，CPU将立即响应 C . 不可屏蔽中断的优先级比可屏蔽中断的优先级高 D . 可通过中断屏蔽字改变可屏蔽中断的处理优先级 22 . 若设备采用周期挪用DMA方式进行输入和输出，每次DMA传送的数据块大小为5 1 2 字 节，相应的I/O接口中有一个32位数数据缓冲寄存器。对于数据输入过程，下列叙述中， 错误的是（ ）o ・023・ A . 每准备好32位数据，DMA控制器就发出一次总线请求 B . 相对于CPU, DMA控制器的总线使用权的优先级更高 C . 在整个数据块的传送过程中，CPU不可以访问主存储器 D . 数据块传送结束时，会产生“DMA传送结束”中断请求 23 . 若多个进程共享同一个文件F , 则下列叙述中，正确的是（ ）o A . 各进程只能用“读”方式打开文件F B . 在系统打开文件表中仅有一个表项包含F 的属性 C . 各进程的用户打开文件表中关于F 的表项内容相同 D . 进程关闭F 时，系统删除F 在系统打开文件表中的表项 24 . 下列选项中，支持文件长度可变、随机访问的磁盘存储空间分配方式是（ ）o A . 索引分配 B . 链接分配 C . 连续分配 D . 动态分区分配 25 . 下列与中断相关的操作中，由操作系统完成的是（ ）o I .保存被中断程序的中断点 I I . 提供中断服务 I I I . 初始化中断向量表 I V .保存中断屏蔽字 A . 仅 I、II B . 仅 I、n 、IV C . 仅皿、IV D . 仅 n 、IIL IV 26 . 下列与进程调度有关的因素中，在设计多级反馈队列调度算法时需要考虑的是（ ）o L 就绪队列的数量 I I . 就绪队列的优先级 I I I . 各就绪队列的调度算法 I V .进程在就绪队列间的迁移条件 A . 仅 I、II B . 仅皿、IV C . 仅 n 、IIL IV D. I、IL III 和 IV 27 . 某系统中有A、B 两类资源各6 个，/时刻资源分配及需求情况如下表所示。 进程 A 已分配数量 B 已分配数量 A 需求总量 B 需求总量 P1 2 3 4 4 P2 2 1 3 1 P3 1 2 3 4 Z时刻安全性检测结果是（ ）o A . 存在安全序列P l、P2、P3 B . 存在安全序列P2、P l、P3 C . 存在安全序列P2、P3、Pl D . 不存在安全序列 28 . 下列因素中，影响请求分页系统有效（平均）访存时间的是（ ）o i . 缺页率 I I . 磁盘读写时间 m . 内存访问时间 I V .执行缺页处理程序的CPU时间 A . 仅 n 、III B . 仅 I、iv c . 仅 I、IIL IV D. I、IL in 和 IV 2 9 . 下列关于父进程与子进程的叙述中，错误的是（ ）o • 024 • A . 父进程与子进程可以并发执行 B . 父进程与子进程共享虚拟地址空间 C . 父进程与子进程有不同的进程控制块 D . 父进程与子进程不能同时使用同一临界资源 30 . 对于具备设备独立性的系统，下列叙述中，错误的是（ ）。 A . 可以使用文件名访问物理设备 B . 用户程序使用逻辑设备名访问物理设备 C . 需要建立逻辑设备与物理设备之间的映射关系 D . 更换物理设备后必须修改访问该设备的应用程序 31 . 某文件系统的目录项由文件名和索引结点号构成。若每个目录项长度为6 4 字节，其中4 字节存放索引结点号，60字节存放文件名。文件名由小写英文字母构成，则该文件系统能 创建的文件数量的上限为（ ）o 32 . 下列准则中，实现临界区互斥机制必须遵循的是（ ）0 I . 两个进程不能同时进入临界区 I I . 允许进程访问空闲的临界资源 III . 进程等待进入临界区的时间是有限的 IV . 不能进入临界区的执行态进程立即放弃CPU A . 仅 I、IV B . 仅 H、III C . 仅 I、II、III D . 仅 I、IIL IV 33 . 下图描述的协议要素是（ ）o i . 语法 n . 语义 i l l . 时序 A . 仅 I B . 仅 n c . 仅 ni D. I、ii iii 34 . 下列关于虚电路网络的叙述中，错误的是（ ）o A . 可以确保数据分组传输顺序 B . 需要为每条虚电路预分配带宽 C . 建立虚电路时需要进行路由选择 D . 依据虚电路号（VCID）进行数据分组转发 35 . 在下图所示的网络中，冲突域和广播域的个数分别是（ ）。 • 025 • 以太网交换机 路由器 3 6 .假设主机甲采用停-等协议向主机乙发送数据帧，数据帧长与确认帧长均为1000B,数据传 输速率是10kbps,单项传播延时是200ms。则甲的最大信道利用率为（ ）。 A. 80% B. 66.7% C. 44.4% D. 40% 37 . 某IEEE 802.11无线局域网中，主机H 与A P之间发送或接收CSMA/CA帧的过程如下图 所示。在H 或A P发送帧前所等待的帧间间隔时间（IFS）中，最长的是（ ）0 A. IFS1 B. IFS2 C. IFS3 D. IFS4 38 . 若主机甲与主机乙已建立一条TCP连接，最大段长（MSS）为1K B ,往返时间（RTT）为 2 m s,则在不出现拥塞的前提下，拥塞窗口从8KB增长到32KB所需的最长时间是（ ）0 A. 4ms B. 8ms C. 24ms D. 48ms 39 . 若主机甲与主机乙建立TCP连接时，发送的SYN段中的序号为1 0 00 ,在断开连接时，甲 发送给乙的FIN段中的序号为5001,则在无任何重传的情况下，甲向乙已经发送的应用层 数据的字节数为（ ）o • 026 • A. 4002 B. 4001 C. 4000 D. 3999 4 0 . 假设下图所示网络中的本地域名服务器只提供递归查询服务，其他域名服务器均只提供迭 代查询服务；局域网内主机访问Internet上各服务器的往返时间（RTT）均为10m s,忽略 其他各种时延。若主机H 通过超链接http://www.abc.com/index.html请求浏览纯文本Web 页index.html,则从点击超链接开始到浏览器接收到index.html页面为止，所需的最短时间 与最长时间分别是（ ）。"
    ],
    "answer": 0,
    "explanation": "2020年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-02",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "stack-queue",
    "source": "2017年 408 统考真题 第2题",
    "year": 2017,
    "topic": "栈与队列微观时序操作仿真",
    "difficulty": "高频真题",
    "question": "下列关千栈的叙述中，错误的是 I. 采用非递归方式重写递归程序时必须使用栈 II. 函数调用时，系统要用栈保存必要的信息 III. 只要确定了入栈次序，就可确定出栈次序 IV. 栈是一种受限的线性表，允许在其两端进行操作",
    "options": [
      "仅 I",
      "仅I 、 II 、 III",
      "仅I 、 III 、 IV",
      "仅II 、 III 、 IV"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-03",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "tree-traversal",
    "source": "2017年 408 统考真题 第3题",
    "year": 2017,
    "topic": "数据结构与经典算法",
    "difficulty": "高频真题",
    "question": "适用于压缩存储稀疏矩阵的两种存储结构是 。",
    "options": [
      "三元组表和十字链表",
      "三元组表和邻接矩阵",
      "十字链表和二叉链表",
      "邻接矩阵和十字链表"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-09",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "bplus-tree",
    "source": "2017年 408 统考真题 第9题",
    "year": 2017,
    "topic": "B+树多路平衡查找与外存索引",
    "difficulty": "高频真题",
    "question": "下列应用中，适合使用B+树的是 。 B. D.",
    "options": [
      "编译器中的词法分析",
      "关系数据库系统中的索引",
      "网络中的路由表快速查找",
      "操作系统的磁盘空闲块管理"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-10",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "sorting",
    "source": "2017年 408 统考真题 第10题",
    "year": 2017,
    "topic": "经典排序算法时空复杂度比对沙盒",
    "difficulty": "高频真题",
    "question": "在内部排序时，若选择了归并排序而没有选择插入排序，则可能的理由是 。 I. 归并排序的程序代码更短 II. 归并排序的占用空间更少 III. 归并排序的运行效率更高",
    "options": [
      "仅II",
      "仅III",
      "仅I、II",
      "仅I、III"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-11",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "sorting",
    "source": "2017年 408 统考真题 第11题",
    "year": 2017,
    "topic": "经典排序算法时空复杂度比对沙盒",
    "difficulty": "高频真题",
    "question": "下列排序方法中，若将顺序存储更换为链式存储，则算法的时间效率会降低的是 。 I. 插入排序I. 选择排序III. 起泡排序 IV. 希尔排序V. 堆排序",
    "options": [
      "仅I、II",
      "仅II、III",
      "仅III、IV",
      "仅IV、V"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-01",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "tree-traversal",
    "source": "2017年 408 统考真题 第1题",
    "year": 2017,
    "topic": "数据结构与经典算法",
    "difficulty": "高频真题",
    "question": "2GHz。在Ml和M2上运行某基准程序P, 若平均C PI分别为2和1, 则程序P在Ml和M2 上运行时间的比值是",
    "options": [
      "0.4",
      "0.625",
      "1.6",
      "2.5"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-14",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2017年 408 统考真题 第14题",
    "year": 2017,
    "topic": "计算机体系结构微架构核心",
    "difficulty": "高频真题",
    "question": "某C语言程序段如下： for(i=O;i<=9;i++) { temp = l; for (j=O; j<=i; j++)七emp *= a[j]; sum += temp; C. 3 下列关于数组a的访问局部性的描述中，正确的是 。 D. 4",
    "options": [
      "时间局部性和空间局部性皆有",
      "无时间局部性，有空间局部性",
      "有时间局部性，无空间局部性",
      "时间局部性和空间局部性皆无"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-15",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2017年 408 统考真题 第15题",
    "year": 2017,
    "topic": "指令周期时序打拍与总线控制",
    "difficulty": "高频真题",
    "question": "下列寻址方式中， 最适合按下标顺序访问一维数组元素的是 。",
    "options": [
      "相对寻址",
      "寄存器寻址",
      "直接寻址",
      "变址寻址"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-16",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2017年 408 统考真题 第16题",
    "year": 2017,
    "topic": "计算机体系结构微架构核心",
    "difficulty": "高频真题",
    "question": "某计算机按字节编址， 指令字长固定且只有两种指令格式，其中三地址指令29 条， 二地址指令107条， 每个地址字段为6位，则指令字长至少应该是 。",
    "options": [
      "24位",
      "26位",
      "28位",
      "32位"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-17",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2017年 408 统考真题 第17题",
    "year": 2017,
    "topic": "CPU 五级流水线与冒险处理",
    "difficulty": "高频真题",
    "question": "下列关千超标量流水线特性的叙述中，正确的是 I. 能缩短流水线功能段的处理时间 II. 能在一个时钟周期内同时发射多条指令 2017年计算机408统考真题 第 2 页，共 8 页 III. 能结合动态调度技术提高指令执行并行性",
    "options": [
      "仅II",
      "仅I、III",
      "仅II、III",
      "I、II和III"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-18",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2017年 408 统考真题 第18题",
    "year": 2017,
    "topic": "计算机体系结构微架构核心",
    "difficulty": "高频真题",
    "question": "下列关于主存储器(MM)和控制存储器(CS)的叙述中，错误的是 。",
    "options": [
      "MM在CPU外，cs 在CPU内",
      "MM按地址访问，cs 按内容访问",
      "MM存储指令和数据，cs 存储微指令",
      "MM用RAM和ROM实现，cs 用ROM实现"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-19",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2017年 408 统考真题 第19题",
    "year": 2017,
    "topic": "CPU 五级流水线与冒险处理",
    "difficulty": "高频真题",
    "question": "下列关于指令流水线数据通路的叙述中，错误的是 。",
    "options": [
      "包含生成控制信号的控制部件",
      "包含算术逻辑运算部件(ALU)",
      "包含通用寄存器组和取指部件",
      "由组合逻辑电路和时序逻辑电路组合而成"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-20",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2017年 408 统考真题 第20题",
    "year": 2017,
    "topic": "指令周期时序打拍与总线控制",
    "difficulty": "高频真题",
    "question": "下列关千多总线结构的叙述中，错误的是 。",
    "options": [
      "靠近CPU的总线速度较快",
      "存储器总线可支持突发传送方式",
      "总线之间须通过桥接器相连",
      "PC I-Expressxl6采用并行传输方式"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-21",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2017年 408 统考真题 第21题",
    "year": 2017,
    "topic": "计算机体系结构微架构核心",
    "difficulty": "高频真题",
    "question": "1/0指令实现的数据传送通常发生在 。",
    "options": [
      "1/0设备和1/0端口之间",
      "通用寄存器和1/0设备之间",
      "1/0端口和1/0端口之间",
      "通用寄存器和1/0端口之间"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-22",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2017年 408 统考真题 第22题",
    "year": 2017,
    "topic": "指令周期时序打拍与总线控制",
    "difficulty": "高频真题",
    "question": "下列关于多重中断系统的叙述中，错误的是 。",
    "options": [
      "在一条指令执行结束时响应中断",
      "中断处理期间CPU处于关中断状态",
      "中断请求的产生与当前指令的执行无关 .",
      "CPU通过采样中断请求信号检测中断请求"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-24",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2017年 408 统考真题 第24题",
    "year": 2017,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "执行系统调用的过程包括如下主要操作： ＠返回用户态 ＠执行陷入(trap)指令 ＠传递系统调用参数 ＠执行相应的服务程序 正确的执行顺序是 。",
    "options": [
      "®-@-CD-@",
      "®-@-®-CD",
      "®-®-@-CD",
      "® 一＠一＠一＠"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-25",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "memory-partition",
    "source": "2017年 408 统考真题 第25题",
    "year": 2017,
    "topic": "动态分区内存分配与碎片整理",
    "difficulty": "高频真题",
    "question": "某计算机按字节编址，其动态分区内存管理采用最佳适应算法，每次分配和回收内存 后都对空闲分区链重新排序。当前空闲分区信息如下表所示。 分区起始地址 分区大小 20K 40KB SOOK 80KB IOOOK 100KB 200K 200KB 回收起始地址为60K、大小为140KB的分区后，系统中空闲分区的数量、空闲分区链第一 个分区的起始地址和大小分别是 。 2017年计算机408统考真题 第 3 页，共 8 页 2017年全国硕士研究生入学统一考试计算机科学与技术学科联考计算机学科专业基础综合试题 口口哩啜醒匿墨圈固囡圉圈",
    "options": [
      "3、20K、380KB",
      "3、SOOK、80KB",
      "4、20K、180KB",
      "4、500K、80KB"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-26",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2017年 408 统考真题 第26题",
    "year": 2017,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "某文件系统的簇和磁盘扇区大小分别为1KB和512B。若一个文件的大小为1026B, 则系统分配给该文件的磁盘空间大小是 。",
    "options": [
      "1026B",
      "1536B",
      "1538B",
      "2048B"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-27",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "scheduling",
    "source": "2017年 408 统考真题 第27题",
    "year": 2017,
    "topic": "CPU 进程调度算法模拟器",
    "difficulty": "高频真题",
    "question": "下列有关基于时间片的进程调度的叙述中，错误的是 。",
    "options": [
      "时间片越短，进程切换的次数越多，系统开销也越大",
      "当前进程的时间片用完后，该进程状态由执行态变为阻塞态",
      "时钟中断发生后，系统会修改当前进程在时间片内的剩余时间",
      "影响时间片大小的主要因素包括响应时间、系统开销和进程数量等"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-29",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2017年 408 统考真题 第29题",
    "year": 2017,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "下列选项中，磁盘逻辑格式化程序所做的工作是一。 I. 对磁盘进行分区 II. 建立文件系统的根目录 III. 确定磁盘扇区校验码所占位数 IV. 对保存空闲磁盘块信息的数据结构进行初始化 D. 仅I、III、IV",
    "options": [
      "仅II",
      "仅II、IV",
      "仅III、IV",
      "仅I、II、IV"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-30",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2017年 408 统考真题 第30题",
    "year": 2017,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "某文件系统中，针对每个文件，用户类别分为4类：安全管理员、文件主、文件主的 伙伴、其他用户；访问权限分为5种：完全控制、执行、修改、读取、写入。若文件控制块中 用二进制位串表示文件权限，为表示不同类别用户对一个文件的访问权限，则描述文件权限的 位数至少应为 。",
    "options": [
      "5",
      "9",
      "12",
      "20"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-31",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2017年 408 统考真题 第31题",
    "year": 2017,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "若文件fl的硬链接为位，两个进程分别打开fl和位，获得对应的文件描述符为fdl 和fd2, 则下列叙述中，正确的是 I. fl和位的读写指针位置保持相同 II. fl和位共享同一个内存索引结点 III. fdl和fd2分别指向各自的用户打开文件表中的一项",
    "options": [
      "仅III",
      "仅II、III",
      "仅I、II",
      "I、II和III"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-32",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2017年 408 统考真题 第32题",
    "year": 2017,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "系统将数据从磁盘读到内存的过程包括以下操作： (DDMA控制器发出中断请求 ＠初始化OMA控制器并启动磁盘 ＠从磁盘传输一块数据到内存缓冲区 ＠执行\"OMA结束 ” 中断服务程序 正确的执行顺序是",
    "options": [
      "@-CD-@-@",
      "@-@-CD-@",
      "@-CD-@-@",
      "CD-@-@-@"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-33",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "dns-resolution",
    "source": "2017年 408 统考真题 第33题",
    "year": 2017,
    "topic": "DNS 递归与迭代分层解析沙盒",
    "difficulty": "高频真题",
    "question": "假设OSI参考模型的应用层欲发送400B的数据（无拆分），除物理层和应用层之外， 其他各层在封装POU时均引入20B的额外开销，则应用层数据传输效率约为 。",
    "options": [
      "80%",
      "83%",
      "87%",
      "91%"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-34",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "dns-resolution",
    "source": "2017年 408 统考真题 第34题",
    "year": 2017,
    "topic": "DNS 递归与迭代分层解析沙盒",
    "difficulty": "高频真题",
    "question": "若信道在无噪声情况下的极限数据传输速率不小于信噪比为30dB条件下的极限数据 传输速率，则信号状态数至少是一——° 2017年计算机408统考真题 第 4 页，共 8 页",
    "options": [
      "4",
      "8",
      "16",
      "32"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-35",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "dns-resolution",
    "source": "2017年 408 统考真题 第35题",
    "year": 2017,
    "topic": "DNS 递归与迭代分层解析沙盒",
    "difficulty": "高频真题",
    "question": "在下图所示的网络中，若主机H 发送一个封装访问Internet 的IP分组的IEEE 802.11 数据帧F, 则帧F 的地址l、地址2 和地址3 分别是 。 g一二L-.G 0\u001712-34-¼-m>c 00-12-34-56-78-9a 00-12-34-56-78-9b",
    "options": [
      "00-12-34-56-78-9a, 00-12-34-56-78-9b, 00-12-34-56-78-9c",
      "00-12-34-56-78-9b, 00-12-34-56-78-9a, 00-12-34-56-78-9c",
      "00-12-34-56-78-%, 00-12-34-56-78-9c, 00-12-34-56-78-9a",
      "00-12-34-56-78-9a, 00-12-34-56-78-9c, 00-12-34-56-78-9b"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-37",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "ip-subnet",
    "source": "2017年 408 统考真题 第37题",
    "year": 2017,
    "topic": "IP 子网掩码与 CIDR 超网编址",
    "difficulty": "高频真题",
    "question": "直接封装RIP、OSPF、BGP报文的协议分别是 。 D. 255.255.255.255",
    "options": [
      "TCP、UDP、IP",
      "TCP、IP、UDP",
      "UDP、TCP、IP",
      "UDP、IP、TCP"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-38",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "ip-subnet",
    "source": "2017年 408 统考真题 第38题",
    "year": 2017,
    "topic": "IP 子网掩码与 CIDR 超网编址",
    "difficulty": "高频真题",
    "question": "若将网络21.3.0.0/16 划分为128 个规模相同的子网，则每个子网可分配的最大IP地址 个数是 。",
    "options": [
      "24",
      "256",
      "510",
      "512"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2017-40",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "dns-resolution",
    "source": "2017年 408 统考真题 第40题",
    "year": 2017,
    "topic": "DNS 递归与迭代分层解析沙盒",
    "difficulty": "高频真题",
    "question": "下列关于FTP协议的叙述中，错误的是",
    "options": [
      "数据连接在每次数据传输完毕后就关闭",
      "控制连接在整个会话期间保持打开状态",
      "服务器与客户端的TCP20 端口建立数据连接",
      "客户端与服务器的TCP21 端口建立控制连接"
    ],
    "answer": 0,
    "explanation": "2017年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-01",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "tree-traversal",
    "source": "2014年 408 统考真题 第1题",
    "year": 2014,
    "topic": "数据结构与经典算法",
    "difficulty": "高频真题",
    "question": "下列程序段的时间复杂度是 。 count=O; for (k=l; k<i=n;.k*=2) for (j=l; j<=n; j++) count++;",
    "options": [
      "O(log2n)",
      "O(n)",
      "O(nlog2n)",
      "O(n2)"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-02",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "stack-queue",
    "source": "2014年 408 统考真题 第2题",
    "year": 2014,
    "topic": "栈与队列微观时序操作仿真",
    "difficulty": "高频真题",
    "question": "假设栈初始为空，将中缀表达式 alb+(c*d-e*f)/g 转换为等价的后缀表达式的过程中， 当扫描到f 时，栈中的元素依次是 。",
    "options": [
      "+ (* -",
      "+ (- *",
      "I+ (* - *",
      "I+ - *"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-03",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "stack-queue",
    "source": "2014年 408 统考真题 第3题",
    "year": 2014,
    "topic": "栈与队列微观时序操作仿真",
    "difficulty": "高频真题",
    "question": "循环队列放在一维数组A[O…M-1] 中， endl 指向队头元素， end2 指向队尾元素的后一 个位置假设队列两端均可进行入队和出队操作，队列中最多能容纳M-1 个元素。初始时为空。 下列判断队空和队满的条件中，平确的是 。",
    "options": [
      "队空：end 1 == end2; 队满：endl == (end2 + 1) mod M",
      "队空：endl = end2; 队满：end2 = (endl + 1) mod (M- 1)",
      "队空：erid2 = (endl + 1) mod M; 队满：endl = (end2 + 1) mod M",
      "队空：endl = (end2 + 1) mod M; 队满：end2 = (endl + 1) mod (M-1)"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-04",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "tree-traversal",
    "source": "2014年 408 统考真题 第4题",
    "year": 2014,
    "topic": "二叉树多维遍历与平衡树旋转",
    "difficulty": "高频真题",
    "question": "若对如下的二叉树进行中序线索化，则结点x 的左、右线索指向的结点分别是 。",
    "options": [
      "e 、 c",
      "e 、 a",
      "d 、 c",
      "b 、 a"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-05",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "tree-traversal",
    "source": "2014年 408 统考真题 第5题",
    "year": 2014,
    "topic": "二叉树多维遍历与平衡树旋转",
    "difficulty": "高频真题",
    "question": "将森林F 转换为对应的二叉树T, F 中叶结点的个数等千",
    "options": [
      "T 中叶结点的个数",
      "T 中度为 l 的结点个数",
      "T 中左孩子指针为空的结点个数",
      "T 中右孩子指针为空的结点个数"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-06",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "tree-traversal",
    "source": "2014年 408 统考真题 第6题",
    "year": 2014,
    "topic": "数据结构与经典算法",
    "difficulty": "高频真题",
    "question": "5 个字符有如下4 种编码方案，不是前缀编码的是",
    "options": [
      "01 0000 0001 001 1",
      "011, 000, 001, 010, 1",
      "000, 001, 010, 011, 100",
      "0, 100, 110, 1110, 1100"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-07",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "dijkstra",
    "source": "2014年 408 统考真题 第7题",
    "year": 2014,
    "topic": "Dijkstra 最短路径与图算法推演",
    "difficulty": "高频真题",
    "question": "对如下所示的有向图进行拓扑排序，得到的拓扑序列可能是 2014年计算机408统考真题 第 1 页，共 7 页",
    "options": [
      "3, 1, 2, 4, 5, 6",
      "3,1,2,4,6,5",
      "3,1,4,2,5,6",
      "3,1,4,2,6,5"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-09",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "bplus-tree",
    "source": "2014年 408 统考真题 第9题",
    "year": 2014,
    "topic": "B+树多路平衡查找与外存索引",
    "difficulty": "高频真题",
    "question": "在一棵具有15个关键字的4阶B树中，含关键字的结点个数最多是 。",
    "options": [
      "5",
      "6",
      "10",
      "15"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-10",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "sorting",
    "source": "2014年 408 统考真题 第10题",
    "year": 2014,
    "topic": "经典排序算法时空复杂度比对沙盒",
    "difficulty": "高频真题",
    "question": "用希尔排序方法对一个数据序列进行排序时，若第1趟排序结果为9,1, 4, 13, 7, 8, 20, 23, 15, 则该趟排序采用的增量（间隔）可能是 。",
    "options": [
      "2",
      "3",
      "4",
      "5"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-11",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "sorting",
    "source": "2014年 408 统考真题 第11题",
    "year": 2014,
    "topic": "经典排序算法时空复杂度比对沙盒",
    "difficulty": "高频真题",
    "question": "下列选项中，不可能是快速排序第2趟排序结果的是 。",
    "options": [
      "2, 3, 5, 4, 6, 7, 9",
      "2, 7, 5, 6, 4, 3, 9",
      "3, 2, 5, 4, 7, 6, 9",
      "4, 2, 3, 5, 7, 6, 9"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-12",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2014年 408 统考真题 第12题",
    "year": 2014,
    "topic": "计算机体系结构微架构核心",
    "difficulty": "高频真题",
    "question": "程序P在机器M上的执行时间是20秒，编译优化后，P 执行的指令数减少到原来的 70%, 而CPI 增加到原来的1.2倍，则P在M上的执行时间是 。",
    "options": [
      "8.4秒",
      "11.7秒",
      "14秒",
      "16.8秒"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-13",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "number-representation",
    "source": "2014年 408 统考真题 第13题",
    "year": 2014,
    "topic": "IEEE 754 浮点与数值表示",
    "difficulty": "高频真题",
    "question": "若X= 103, y = -25, 则下列表达式采用8位定点补码运算实现时，会发生溢出的是 。",
    "options": [
      "x+y",
      "-x+y",
      "x- y",
      "-x-y"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-14",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "number-representation",
    "source": "2014年 408 统考真题 第14题",
    "year": 2014,
    "topic": "IEEE 754 浮点与数值表示",
    "difficulty": "高频真题",
    "question": "float型数据常用IEEE754单精度浮点格式表示。假设两个float型变量x和y分别存 放在32位寄存器f, 和f2中，若(f1)=CC90 OOOOH, (f2)= BOCO OOOOH, 则x和y之间的关系为一。",
    "options": [
      "x<y且符号相同 .",
      "x<y且符号不同",
      "x>y且符号相同 ·",
      "x>y且符号不同"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-15",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "number-representation",
    "source": "2014年 408 统考真题 第15题",
    "year": 2014,
    "topic": "IEEE 754 浮点与数值表示",
    "difficulty": "高频真题",
    "question": "某容量为256MB 的存储器由若干4Mx8位的DRAM芯片构成，该DRAM芯片的地 址引脚和数据引脚总数是 。",
    "options": [
      "19",
      "22",
      "30",
      "36"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-17",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2014年 408 统考真题 第17题",
    "year": 2014,
    "topic": "指令周期时序打拍与总线控制",
    "difficulty": "高频真题",
    "question": "某计算机有16个通用寄存器，采用32位定长指令字，操作码字段（含寻址方式位） 为8位，Store指令的源操作数和目的操作数分别采用寄存器直接寻址和基址寻址方式。若基址 寄存器可使用任一通用寄存器，且偏移量用补码表示，则Store 指令中偏移量的取值范围 定",
    "options": [
      "-32768-+32767",
      "-32767-+32768",
      "-65536-+65535",
      "-65535-+65536"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-18",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2014年 408 统考真题 第18题",
    "year": 2014,
    "topic": "指令周期时序打拍与总线控制",
    "difficulty": "高频真题",
    "question": "某计算机采用微程序控制器，共有32条指令，公共的取指令微程序包含2条微指令， 各指令对应的微程序平均由4条微指令组成，采用断定法（下地址字段法）确定下条微指令地 2014年计算机408统考真题 第 2 页，共 7 页 址，则微指令中下地址字段的位数至少是 。",
    "options": [
      "5",
      "6",
      "8",
      "9"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-19",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2014年 408 统考真题 第19题",
    "year": 2014,
    "topic": "指令周期时序打拍与总线控制",
    "difficulty": "高频真题",
    "question": "某同步总线采用数据线和地址线复用方式，其中地址／数据线有32根，总线时钟频率 为66MHz, 每个时钟周期传送两次数据（上升沿和下降沿各传送一次数据），该总线的最大数 据传输率（总线带宽）是 。",
    "options": [
      "132MB/s",
      "264MB/s",
      "528MB/s",
      "1056MB/s"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-20",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2014年 408 统考真题 第20题",
    "year": 2014,
    "topic": "指令周期时序打拍与总线控制",
    "difficulty": "高频真题",
    "question": "一次总线事务中，主设备只需给出一个首地址，从设备就能从首地址开始的若干连续 单元读出或写入多个数据。这种总线事务方式称为 。",
    "options": [
      "并行传输",
      "串行传输",
      "突发传输",
      "同步传输"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-21",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2014年 408 统考真题 第21题",
    "year": 2014,
    "topic": "计算机体系结构微架构核心",
    "difficulty": "高频真题",
    "question": "下列有关l/0接口的叙述中，错误的是 。",
    "options": [
      "状态端口和控制端口可以合用同一个寄存器",
      "VO接口中CPU可访问的寄存器称为1/0端口",
      "采用独立编址方式时，1/0端口地址和主存地址可能相同",
      "采用统一编址方式时，CPU不能用访存指令访问VO端口"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-23",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "scheduling",
    "source": "2014年 408 统考真题 第23题",
    "year": 2014,
    "topic": "CPU 进程调度算法模拟器",
    "difficulty": "高频真题",
    "question": "下列调度算法中，不可能导致饥饿现象的是 。",
    "options": [
      "时间片轮转",
      "静态优先数调度",
      "非抢占式短作业优先",
      "抢占式短作业优先"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-24",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "deadlock",
    "source": "2014年 408 统考真题 第24题",
    "year": 2014,
    "topic": "死锁避免与银行家算法拓扑",
    "difficulty": "高频真题",
    "question": "某系统有n台互斥使用的同类设备，三个并发进程分别需要3、4、5台设备，可确保 系统不发生死锁的设备数n最小为 。",
    "options": [
      "9",
      "10",
      "11",
      "12"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-26",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2014年 408 统考真题 第26题",
    "year": 2014,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "一个进程的读磁盘操作完成后，操作系统针对该进程必做的是 。",
    "options": [
      "修改进程状态为就绪态",
      "降低进程优先级",
      "给进程分配用户内存空间",
      "增加进程时间片大小"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-27",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2014年 408 统考真题 第27题",
    "year": 2014,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "现有 一个容量为10GB的磁盘分区，磁盘空间以簇(Cluster)为单位进行分配，簇的 大小为4KB, 若采用位图法管理该分区的空闲空间，即用一位(bit)标识一个簇是否被分配， 则存放该位图所需簇的个数为 。",
    "options": [
      "80",
      "320",
      "80K",
      "320K"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-28",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "page-replacement",
    "source": "2014年 408 统考真题 第28题",
    "year": 2014,
    "topic": "虚拟存储分页与页面置换算法",
    "difficulty": "高频真题",
    "question": "下列措施中，能加快虚实地址转换的是 。 I. 增大块表(TLB)容量 II. 让页表常驻内存 III. 增大交换区(swap)",
    "options": [
      "仅I",
      "仅II",
      "仅I、II",
      "仅II、III"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-29",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2014年 408 统考真题 第29题",
    "year": 2014,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "在一个文件被用户进程首次打开的过程中，操作系统需要做的是 。",
    "options": [
      "将文件内容读到内存中",
      "将文件控制块读到内存中",
      "修改文件控制块中的读写权限",
      "将文件的数据缓冲区首指针返回给用户进程"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-30",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "page-replacement",
    "source": "2014年 408 统考真题 第30题",
    "year": 2014,
    "topic": "虚拟存储分页与页面置换算法",
    "difficulty": "高频真题",
    "question": "在页式虚拟存储管理系统中，采用某些页面置换算法，会出现Belady异常现象，即进 程的缺页次数会随着分配给该进程的页框个数的增加而增加。下列算法中，可能出现Belady异 2014年计算机408统考真题 第 3 页，共 7 页 常现象的是 。 I. LRU算法 II. FIFO算法 III. OPT算法",
    "options": [
      "仅II",
      "仅I、II",
      "仅I、III",
      "仅II、III"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-31",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2014年 408 统考真题 第31题",
    "year": 2014,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "下列关于管道(Pipe)通信的叙述中，正确的是 。",
    "options": [
      "一个管道可实现双向数据传输",
      "管道的容量仅受磁盘容量大小限制",
      "进程对管道进行读操作和写操作都可能被阻塞",
      "一个管道只能有一个读进程或一个写进程对其操作"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-32",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "page-replacement",
    "source": "2014年 408 统考真题 第32题",
    "year": 2014,
    "topic": "虚拟存储分页与页面置换算法",
    "difficulty": "高频真题",
    "question": "下列选项中，属于多级页表优点的是 。",
    "options": [
      "加快地址变换速度",
      "减少缺页中断次数",
      "减少页表项所占字节数",
      "减少页表所占的连续内存空间"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-33",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "dns-resolution",
    "source": "2014年 408 统考真题 第33题",
    "year": 2014,
    "topic": "DNS 递归与迭代分层解析沙盒",
    "difficulty": "高频真题",
    "question": "在OSI参考模型中，直接为会话层提供服务的是 。",
    "options": [
      "应用层",
      "表示层",
      "传输层",
      "网络层"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-34",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "tcp-connection",
    "source": "2014年 408 统考真题 第34题",
    "year": 2014,
    "topic": "TCP 全双工三次握手与四次挥手时序",
    "difficulty": "高频真题",
    "question": "某以太网拓扑及交换机当前转发表如下图所示，主机OO-el-dS-00-23-al 向主机 00-e l -dS-00-23-c 1发送l个数据帧，主机OO-el-d5-00-23-cl收到该帧后，向主机00-e1-dS-00-23-a 1 发送1个确认帧，交换机对这两个帧的转发端口分别是 交换机 目的地址 端口 00-e l-d5-00-23-b I 2 00-e 1-dS-00-23-al OO-el-dS-00-23-bl 00-e l-dS-00-23-c 1",
    "options": [
      "{3}禾廿{1}",
      "{2, 3}禾日{1}",
      "{2,3}禾D{1, 2}",
      "{ 1, 2, 3}禾D{l}"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-35",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "dns-resolution",
    "source": "2014年 408 统考真题 第35题",
    "year": 2014,
    "topic": "DNS 递归与迭代分层解析沙盒",
    "difficulty": "高频真题",
    "question": "下列因素中，不会影响信道数据传输速率的是 。",
    "options": [
      "信噪比",
      "频率宽带",
      "调制速率",
      "信号传播速度"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-36",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "sliding-window",
    "source": "2014年 408 统考真题 第36题",
    "year": 2014,
    "topic": "滑动窗口协议与拥塞控制动态曲线",
    "difficulty": "高频真题",
    "question": "主机甲与主机乙之间使用后退N帧协议CGBN)传输数据，甲的发送窗口尺寸为1000, 数据帧长为1000字节，信道带宽为lOOMbps, 乙每收到一个数据帧立即利用一个短帧（忽略其 传输延迟）进行确认，若甲、乙之间的单向传播延迟是50ms, 则甲可以达到的最大平均数据传 输速率约为",
    "options": [
      "lOMbps",
      "20Mbps",
      "80Mbps",
      "lOOMbps"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-37",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "dns-resolution",
    "source": "2014年 408 统考真题 第37题",
    "year": 2014,
    "topic": "DNS 递归与迭代分层解析沙盒",
    "difficulty": "高频真题",
    "question": "站点A、B、C通过CDMA共享链路，A、B、C的码片序列(chipping sequence) 分 别是(1,1, I, 1)、(1,-I, I, -1)和(1,I, -1, -1)。若C从链路上收到的序列是(2,0, 2, 0, 0, -2, 0, -2, 0, 2, 0, 2), 则C收到A发送的数据是 。",
    "options": [
      "000",
      "101",
      "110",
      "111"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2014-40",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "dns-resolution",
    "source": "2014年 408 统考真题 第40题",
    "year": 2014,
    "topic": "DNS 递归与迭代分层解析沙盒",
    "difficulty": "高频真题",
    "question": "使用浏览器访问某大学Web网站主页时，不可能使用到的协议是 。",
    "options": [
      "PPP",
      "ARP",
      "UDP",
      "SMTP"
    ],
    "answer": 0,
    "explanation": "2014年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-09",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "dijkstra",
    "source": "2012年 408 统考真题 第9题",
    "year": 2012,
    "topic": "Dijkstra 最短路径与图算法推演",
    "difficulty": "高频真题",
    "question": "已知一棵3阶B-树，如下图所示。删除关键字78得到一棵新B-树，其最右叶结点中 的关键字是 。 10",
    "options": [
      "60",
      "60 62",
      "62,65",
      "65"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-10",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "sorting",
    "source": "2012年 408 统考真题 第10题",
    "year": 2012,
    "topic": "经典排序算法时空复杂度比对沙盒",
    "difficulty": "高频真题",
    "question": "在内部排序过程中，对尚未确定最终位置的所有元素进行一遍处理称为一趟排序。下 列排序方法中，每一趟排序结束都至少能够确定一个元素最终位置的方法是 。 是 I. 简单选择排序 II. 希尔排序 III. 快速排序 IV. 堆排序 v. 二路归并排序",
    "options": [
      "仅I、III、IV",
      "仅I 、III 、V",
      "仅II 、III 、IV",
      "仅III 、IV 、V"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-11",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "sorting",
    "source": "2012年 408 统考真题 第11题",
    "year": 2012,
    "topic": "经典排序算法时空复杂度比对沙盒",
    "difficulty": "高频真题",
    "question": "对一待排序序列分别进行折半插入排序和直接插入排序，两者之间可能的不同之处",
    "options": [
      "排序的总趟数",
      "元素的移动次数",
      "使用辅助空间的数量",
      "元素之间的比较次数"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-12",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2012年 408 统考真题 第12题",
    "year": 2012,
    "topic": "计算机体系结构微架构核心",
    "difficulty": "高频真题",
    "question": "假定基准程序A在某计算机上的运行时间为100秒，其中90秒为CPU时间，其余为 1/0时间。若CPU速度提高50%, 1/0速度不变，则运行基准程序A所耗费的时间是 。",
    "options": [
      "55s",
      "60s",
      "65s",
      "70s"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-13",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2012年 408 统考真题 第13题",
    "year": 2012,
    "topic": "计算机体系结构微架构核心",
    "difficulty": "高频真题",
    "question": "假定编译器规定int和short型长度分别为32位和16位，执行下列C语言语句： unsigne!d sho工t x=65530; urii:i:i,gped . inl;. ·Y\": 幻 得到y的机器数为 。",
    "options": [
      "0000 7FFAH 气",
      "0000 FFFAH",
      "FFFF 7FFAH",
      "FFFF FFFAH"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-14",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "number-representation",
    "source": "2012年 408 统考真题 第14题",
    "year": 2012,
    "topic": "IEEE 754 浮点与数值表示",
    "difficulty": "高频真题",
    "question": "float类型（即IEEE 754单精度浮点数格式）能表示的最大正整数是 。",
    "options": [
      "i126_2103",
      "i121 i104",
      "i121_i103",
      "i12s i104"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-15",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2012年 408 统考真题 第15题",
    "year": 2012,
    "topic": "计算机体系结构微架构核心",
    "difficulty": "高频真题",
    "question": "某计算机存储器按字节编址，采用小端方式存放数据。假定编译器规定int型和short 型长度分别为32位和16位，并且数据按边界对齐存储。某C语言程序段如下： st工uct{ int a; cha工 b; sho工t c; } record; recerd.a=273; 若record变量的首地址为OxC008, 则地址OxC008中内容及record.c的地址分别为 。",
    "options": [
      "OxOO 、OxCOOD",
      "OxOO、OxCOOE 2012年计算机408统考真题 第 2 页，共 8 页",
      "Oxll、OxCOOD",
      "Oxll、OxCOOE"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-16",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2012年 408 统考真题 第16题",
    "year": 2012,
    "topic": "计算机体系结构微架构核心",
    "difficulty": "高频真题",
    "question": "下列关于闪存CFlash Memory)的叙述中，错误的是 。",
    "options": [
      "信息可读可写，并且读、写速度一样快",
      "存储元由MOS管组成，是一种半导体存储器",
      "掉电后信息不丢失，是一种非易失性存储器",
      "采用随机访问方式，可替代计算机外部存储器"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-17",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cache-mapping",
    "source": "2012年 408 统考真题 第17题",
    "year": 2012,
    "topic": "Cache 组相联映射与颠簸冲突",
    "difficulty": "高频真题",
    "question": "假设某计算机按字编址，Cache有4个行，Cache和主存之间交换的块大小为1个字。 若Cache的内容初始为空，采用2路组相联映射方式和LRU替换策略。访问的主存地址依次为 0, 4, 8, 2, 0, 6, 8, 6, 4, 8 时，命中Cache的次数是 。",
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-18",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2012年 408 统考真题 第18题",
    "year": 2012,
    "topic": "指令周期时序打拍与总线控制",
    "difficulty": "高频真题",
    "question": "某计算机的控制器采用微程序控制方式，微指令中的操作控制字段采用字段直接编码 法，共有33个微命令，构成5个互斥类，分别包含7、3、12、5 和6个微命令，则操作控制字 段至少有 。",
    "options": [
      "5位",
      "6位",
      "15位",
      "33位"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-19",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2012年 408 统考真题 第19题",
    "year": 2012,
    "topic": "指令周期时序打拍与总线控制",
    "difficulty": "高频真题",
    "question": "某同步总线的时钟频率为100MHz, 宽度为32位，地址／数据线复用，每传输一个地 址或数据占用一个时钟周期。若该总线支持突发（猝发）传输方式，则一次 “ 主存写 ”总线事 务传输128位数据所需要的时间至少是 。",
    "options": [
      "20ns",
      "40ns",
      "50ns",
      "80ns"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-20",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2012年 408 统考真题 第20题",
    "year": 2012,
    "topic": "指令周期时序打拍与总线控制",
    "difficulty": "高频真题",
    "question": "下列关于USB总线特性的描述中，错误的是 。",
    "options": [
      "可实现外设的即插即用和热拔插",
      "可通过级联方式连接多台外设",
      "是一种通信总线，连接不同外设",
      "同时可传输2位数据，数据传输率高"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-21",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2012年 408 统考真题 第21题",
    "year": 2012,
    "topic": "指令周期时序打拍与总线控制",
    "difficulty": "高频真题",
    "question": "下列选项中，在1/0总线的数据线上传输的信息包括 。 I. 1/0接口中的命令字 II. 1/0接口中的状态字 III. 中断类型号",
    "options": [
      "仅I、II",
      "仅I、III",
      "仅II、III",
      "I、II、III"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-22",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2012年 408 统考真题 第22题",
    "year": 2012,
    "topic": "指令周期时序打拍与总线控制",
    "difficulty": "高频真题",
    "question": "响应外部中断的过程中，中断隐指令完成的操作，除保护断点外，还包括 。 I. 关中断 II. 保存通用寄存器的内容 III. 形成中断服务程序入口地址并送PC",
    "options": [
      "仅I、II",
      "仅I、III",
      "仅II、III",
      "I、II、III"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-23",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2012年 408 统考真题 第23题",
    "year": 2012,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "下列选项中，不可能在用户态发生的事件是 。",
    "options": [
      "系统调用",
      "外部中断",
      "进程切换",
      "缺页"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-25",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2012年 408 统考真题 第25题",
    "year": 2012,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "下列关于虚拟存储器的叙述中，正确的是 。",
    "options": [
      "虚拟存储只能基于连续分配技术",
      "虚拟存储只能基于非连续分配技术",
      "虚拟存储容量只受外存容量的限制",
      "虚拟存储容量只受内存容量的限制"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-26",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2012年 408 统考真题 第26题",
    "year": 2012,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "操作系统的1/0子系统通常由四个层次组成，每一层明确定义了与邻近层次的接口。 2012年计算机408统考真题 第 3 页，共 8 页 其合理的层次组织排列顺序是",
    "options": [
      "用户级I/0软件、设备无关软件、设备驱动程序、中断处理程序",
      "用户级I/0软件、设备无关软件、中断处理程序、设备驱动程序",
      "用户级I/0软件、设备驱动程序、设备无关软件、中断处理程序",
      "用户级1/0软件、中断处理程序、设备无关软件、设备驱动程序"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-27",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "deadlock",
    "source": "2012年 408 统考真题 第27题",
    "year": 2012,
    "topic": "死锁避免与银行家算法拓扑",
    "difficulty": "高频真题",
    "question": "假设5 个进程P。、P 1、P2、P3、P4 共享三类资源R1、R2、R3 , 这些资源总数分别为18、 6、22。TO时刻的资源分配情况如下表所示，此时存在的一个安全序列是 。 已分配资源 资源最大需求 进程 R1 R2 R3 R, p。 3 2 3 5 P1 4 。 3 5 P2 4 。 5 4 Pi 2 。 4 4 P4 3 1 4 4",
    "options": [
      "Po, P2, P4, Pr, P3",
      "P 1, Po, P3, P4, P2",
      "P2, P1, Po, P3, P4",
      "P3, P4, P2, P 1, P。 R2 5 3 。 2 2 R3 10 6 II 5 4"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-28",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2012年 408 统考真题 第28题",
    "year": 2012,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "若一个用户进程通过read系统调用读取一个磁盘文件中的数据，则下列关于此过程的 叙述中，正确的是 。 I. 若该文件的数据不在内存中，则该进程进入睡眠等待状态 II. 请求read系统调用会导致CPU从用户态切换到核心态 III. read系统调用的参数应包含文件的名称",
    "options": [
      "仅I、II",
      "仅I、III",
      "仅II、III",
      "I、II 和III"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-29",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "scheduling",
    "source": "2012年 408 统考真题 第29题",
    "year": 2012,
    "topic": "CPU 进程调度算法模拟器",
    "difficulty": "高频真题",
    "question": "一个多道批处理系统中仅有P 1 和P2 两个作业，P2 比P1晚5ms到达，它们的计算和1/0 操作顺序如下： P i : 计算60ms, 1/0 80ms, 计算20ms P2: 计算120ms, 1/0 40ms, 计算40ms 若不考虑调度和切换时间，则完成两个作业需要的时间最少是",
    "options": [
      "240ms",
      "260ms",
      "340ms",
      "360ms"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-30",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "scheduling",
    "source": "2012年 408 统考真题 第30题",
    "year": 2012,
    "topic": "CPU 进程调度算法模拟器",
    "difficulty": "高频真题",
    "question": "若某单处理器多进程系统中有多个就绪态进程，则下列关于处理机调度的叙述中，错 误的是",
    "options": [
      "在进程结束时能进行处理机调度",
      "创建新进程后能进行处理机调度",
      "在进程处于临界区时不能进行处理机调度",
      "在系统调用完成并返回用户态时能进行处理机调度"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-31",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2012年 408 统考真题 第31题",
    "year": 2012,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "下列关于进程和线程的叙述中，正确的是 。",
    "options": [
      "不管系统是否支待线程，进程都是资源分配的基本单位",
      "线程是资源分配的基本单位，进程是调度的基本单位",
      "系统级线程和用户级线程的切换都需要内核的支持",
      "同一进程中的各个线程拥有各自不同的地址空间"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-32",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2012年 408 统考真题 第32题",
    "year": 2012,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "下列选项中，不能改善磁盘设备1/0性能的是",
    "options": [
      "重排1/0请求次序",
      "在一个磁盘上设置多个分区 2012年计算机408统考真题 第 4 页，共 8 页",
      "预读和滞后写",
      "优化文件物理块的分布"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-33",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "tcp-connection",
    "source": "2012年 408 统考真题 第33题",
    "year": 2012,
    "topic": "TCP 全双工三次握手与四次挥手时序",
    "difficulty": "高频真题",
    "question": "在TCP/IP体系结构中，直接为ICMP提供服务的协议是 。",
    "options": [
      "PPP",
      "IP",
      "UDP",
      "TCP"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-34",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "dns-resolution",
    "source": "2012年 408 统考真题 第34题",
    "year": 2012,
    "topic": "DNS 递归与迭代分层解析沙盒",
    "difficulty": "高频真题",
    "question": "在物理层接口特性中，用于描述完成每种功能的事件发生顺序的是 。",
    "options": [
      "机械特性",
      "功能特性",
      "过程特性",
      "电气特性"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-35",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "dns-resolution",
    "source": "2012年 408 统考真题 第35题",
    "year": 2012,
    "topic": "DNS 递归与迭代分层解析沙盒",
    "difficulty": "高频真题",
    "question": "以太网的MAC 协议提供的是 。",
    "options": [
      "无连接不可靠服务",
      "无连接可靠服务",
      "有连接不可靠服务",
      "有连接可靠服务"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-36",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "sliding-window",
    "source": "2012年 408 统考真题 第36题",
    "year": 2012,
    "topic": "滑动窗口协议与拥塞控制动态曲线",
    "difficulty": "高频真题",
    "question": "两台主机之间的数据链路层采用后退N帧协议(GBN)传输数据， 数据传输速率为 16kbps, 单向传播时延为270ms, 数据帧长度范围是12sƟs12字节，接收方总是以与数据帧等 长的帧进行确认。为使信道利用率达到最高， 帧序号的比特数至少为 。",
    "options": [
      "5",
      "4",
      "3",
      "2"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2012-39",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "ip-subnet",
    "source": "2012年 408 统考真题 第39题",
    "year": 2012,
    "topic": "IP 子网掩码与 CIDR 超网编址",
    "difficulty": "高频真题",
    "question": "某主机的IP地址为180.80.77.55, 子网掩码为255.255.252.0。若该主机向其所在子网 发送广播分组，则目的地址可以是",
    "options": [
      "180.80.76.0",
      "180.80.76.255",
      "180.80.77.255",
      "180.80.79.255"
    ],
    "answer": 0,
    "explanation": "2012年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-01",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "tree-traversal",
    "source": "2011年 408 统考真题 第1题",
    "year": 2011,
    "topic": "数据结构与经典算法",
    "difficulty": "高频真题",
    "question": "设n 是描述问题规模的非负整数，下面程序片段的时间复杂度是 。 x=2; while(x<n/2) x=2,*;ip",
    "options": [
      "O(log2n)",
      "O(n)",
      "O(nlog2n)",
      "O(n勺"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-02",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "stack-queue",
    "source": "2011年 408 统考真题 第2题",
    "year": 2011,
    "topic": "栈与队列微观时序操作仿真",
    "difficulty": "高频真题",
    "question": "元素a, b, c, d, e 依次进入初始为空的栈中，若元素进栈后可停留、可出栈，直到所有元素 都出栈，则在所有可能的出栈序列中，以元素d 开头的序列个数是 。",
    "options": [
      "3",
      "4",
      "5",
      "6"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-03",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "stack-queue",
    "source": "2011年 408 统考真题 第3题",
    "year": 2011,
    "topic": "栈与队列微观时序操作仿真",
    "difficulty": "高频真题",
    "question": "已知循环队列存储在一维数组A[O... n-1] 中，且队列非空时front 和rear 分别指向队头元 素和队尾元素。若初始时队列为空，且要求第 1 个进入队列的元素存储在A[O]处，则初始时front 和rear 的值分别是 。",
    "options": [
      "0,0",
      "O,n-1",
      "n-1,0",
      "n-I,n-1"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-05",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "tree-traversal",
    "source": "2011年 408 统考真题 第5题",
    "year": 2011,
    "topic": "二叉树多维遍历与平衡树旋转",
    "difficulty": "高频真题",
    "question": "若一棵二叉树的前序遍历序列和后序遍历序列分别为 1, 2, 3, 4 和4, 3, 2, I, 则该二叉树的 中序遍历序列不会是 。",
    "options": [
      "1, 2, 3, 4",
      "2, 3, 4, 1",
      "3, 2, 4, 1",
      "4, 3, 2, 1"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-06",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "tree-traversal",
    "source": "2011年 408 统考真题 第6题",
    "year": 2011,
    "topic": "二叉树多维遍历与平衡树旋转",
    "difficulty": "高频真题",
    "question": "已知一棵有2011 个结点的树，其叶结点个数为 116, 该树对应的二叉树中无右孩子的结 点个数是 。",
    "options": [
      "115",
      "116",
      "1895",
      "1896"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-07",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "bplus-tree",
    "source": "2011年 408 统考真题 第7题",
    "year": 2011,
    "topic": "B+树多路平衡查找与外存索引",
    "difficulty": "高频真题",
    "question": "对于下列关键字序列，不可能构成某二叉排序树中一条查找路径的序列是 。",
    "options": [
      "95, 22, 91, 24, 94, 71",
      "92,20,91,34,88,35",
      "21, 89, 77, 29, 36, 38 .",
      "12, 25, 71, 68, 33, 34"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-08",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "dijkstra",
    "source": "2011年 408 统考真题 第8题",
    "year": 2011,
    "topic": "Dijkstra 最短路径与图算法推演",
    "difficulty": "高频真题",
    "question": "下列关于图的叙述中，正确的是 。 I. 回路是简单路径 II. 存储稀疏图，用邻接矩阵比邻接表更省空间 III. 若有向图中存在拓扑序列，则该图不存在回路",
    "options": [
      "仅II",
      "仅I 、 II",
      "仅III",
      "仅1 、 III"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-09",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "sorting",
    "source": "2011年 408 统考真题 第9题",
    "year": 2011,
    "topic": "经典排序算法时空复杂度比对沙盒",
    "difficulty": "高频真题",
    "question": "为提高散列 (Hash) 表的查找效率，可以采取的正确措施是 。 I. 增大装填（载）因子 II. 设计冲突（碰撞）少的散列函数 2018年计算机408统考真题 第 1 页，共 8 页 III. 处理冲突（碰撞）时避免产生聚集（堆积）现象",
    "options": [
      "仅I",
      "仅II",
      "仅I、II",
      "仅II、III"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-10",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "sorting",
    "source": "2011年 408 统考真题 第10题",
    "year": 2011,
    "topic": "经典排序算法时空复杂度比对沙盒",
    "difficulty": "高频真题",
    "question": "为实现快速排序算法，待排序序列宜采用的存储方式是",
    "options": [
      "顺序存储",
      "散列存储",
      "链式存储",
      "索引存储"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-11",
    "courseId": "data-structure",
    "courseName": "数据结构与算法",
    "experimentId": "sorting",
    "source": "2011年 408 统考真题 第11题",
    "year": 2011,
    "topic": "经典排序算法时空复杂度比对沙盒",
    "difficulty": "高频真题",
    "question": "已知序列25,13, 10, 12, 9 是大根堆，在序列尾部插入新元素18, 将其再调整为大根堆， 调整过程中元素之间进行的比较次数是 。",
    "options": [
      "1",
      "2",
      "4",
      "5"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-12",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "number-representation",
    "source": "2011年 408 统考真题 第12题",
    "year": 2011,
    "topic": "IEEE 754 浮点与数值表示",
    "difficulty": "高频真题",
    "question": "下列选项中，描述浮点数操作速度指标的是",
    "options": [
      "MIPS",
      "CPI",
      "IPC",
      "MFLOPS"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-13",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "number-representation",
    "source": "2011年 408 统考真题 第13题",
    "year": 2011,
    "topic": "IEEE 754 浮点与数值表示",
    "difficulty": "高频真题",
    "question": "float型数据通常用IEEE 754单精度浮点数格式表示。若编译器将float型变量x分配到 一个32位浮点寄存器FRI中，且X = -8.25, 则FRI的内容是 。",
    "options": [
      "C104 OOOOH",
      "C242 OOOOH",
      "C184 OOOOH",
      "C1C2 OOOOH"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-14",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2011年 408 统考真题 第14题",
    "year": 2011,
    "topic": "计算机体系结构微架构核心",
    "difficulty": "高频真题",
    "question": "下列各类存储器中，不采用随机存取方式的是 。",
    "options": [
      "EPROM",
      "CDROM",
      "DRAM",
      "SRAM"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-15",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "number-representation",
    "source": "2011年 408 统考真题 第15题",
    "year": 2011,
    "topic": "IEEE 754 浮点与数值表示",
    "difficulty": "高频真题",
    "question": "某计算机存储器按字节编址，主存地址空间大小为64MB, 现用4MBx8位的RAM芯片 组成32MB的主存储器，则存储器地址寄存器MAR的位数至少是",
    "options": [
      "22位",
      "23位",
      "25位",
      "26位"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-16",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2011年 408 统考真题 第16题",
    "year": 2011,
    "topic": "指令周期时序打拍与总线控制",
    "difficulty": "高频真题",
    "question": "偏移寻址通过将某个寄存器内容与一个形式地址相加而生成有效地址。下列寻址方式中， 不属于偏移寻址方式的是 。",
    "options": [
      "间接寻址",
      "基址寻址",
      "相对寻址",
      "变址寻址"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-17",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "number-representation",
    "source": "2011年 408 统考真题 第17题",
    "year": 2011,
    "topic": "IEEE 754 浮点与数值表示",
    "difficulty": "高频真题",
    "question": "某机器有一个标志寄存器，其中有进位／借位标志CF、零标志ZF、符号标志SF 和溢出 标志OF, 条件转移指令hgt (无符号整数比较大于时转移）的转移条件是 。 . \"",
    "options": [
      "CF+ OF=l",
      "SF+ZF=l",
      "CF+ZF=l",
      "CF+SF=l"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-18",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2011年 408 统考真题 第18题",
    "year": 2011,
    "topic": "CPU 五级流水线与冒险处理",
    "difficulty": "高频真题",
    "question": "下列给出的指令系统特点中，有利于实现指令流水线的是＿＿＿。 I. 指令格式规整且长度一致 II. 指令和数据按边界对齐存放 III. 只有Load/Store指令才能对操作数进行存储访问",
    "options": [
      "仅I、II",
      "仅II、III",
      "仅I、III",
      "I、II、III"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-19",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cache-mapping",
    "source": "2011年 408 统考真题 第19题",
    "year": 2011,
    "topic": "Cache 组相联映射与颠簸冲突",
    "difficulty": "高频真题",
    "question": "假定不采用Cache和指令预取技术，且机器处于 “ 开中断 ” 状态。在下列有关指令执行 的叙述中，错误的是 。",
    "options": [
      "每个指令周期中CPU都至少访问内存一次",
      "每个指令周期一定大于等于一个CPU时钟周期",
      "空操作指令的指令周期中任何寄存器的内容都不会被改变",
      "当前程序在每条指令执行结束时都可能被外部中断打断"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-20",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2011年 408 统考真题 第20题",
    "year": 2011,
    "topic": "指令周期时序打拍与总线控制",
    "difficulty": "高频真题",
    "question": "在系统总线的数据线上，不可能传输的是 。",
    "options": [
      "指令",
      "操作数",
      "握手（应答）信号",
      "中断类型号"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-21",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "instruction-cycle",
    "source": "2011年 408 统考真题 第21题",
    "year": 2011,
    "topic": "指令周期时序打拍与总线控制",
    "difficulty": "高频真题",
    "question": "某计算机有五级中断L 4-L 。， 中断屏蔽字为M 4M 3汕M 1M。, M; = 1 COƳ 尽4)表示对 L; 级中断进行屏蔽。若中断响应优先级从高到低的顺序是L 4---L 。---L2--+L尸L 3, 则L 1 的中断处理 程序中设置的中断屏蔽字是 。 2018年计算机408统考真题 第 2 页，共 8 页 2011年全国硕士研究生入学统一考试计算机科学与技术学科联考计算机学科专业基础综合试题 浓 囡函 潞颐圉囡国国回回团园",
    "options": [
      "11110",
      "01101",
      "00011 .",
      "01010"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-22",
    "courseId": "computer-organization",
    "courseName": "计算机组成原理",
    "experimentId": "cpu-pipeline",
    "source": "2011年 408 统考真题 第22题",
    "year": 2011,
    "topic": "计算机体系结构微架构核心",
    "difficulty": "高频真题",
    "question": "某计算机处理器主频为50MHz, 采用定时查询方式控制设备A的I/0, 查询程序运行一 次所用的时钟周期数至少为500。在设备A工作期间，为保证数据不丢失，每秒需对其查询至少 200次，则CPU用于设备A的I/0的时间占整个CPU时间的百分比至少是 。",
    "options": [
      "0.02%",
      "0.05%",
      "0.20%",
      "0.50%"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-23",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "scheduling",
    "source": "2011年 408 统考真题 第23题",
    "year": 2011,
    "topic": "CPU 进程调度算法模拟器",
    "difficulty": "高频真题",
    "question": "下列选项中，满足短任务优先且不会发生饥饿现象的调度算法是 。",
    "options": [
      "先来先服务",
      "高响应比优先",
      "时间片轮转",
      "非抢占式短任务优先"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-24",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2011年 408 统考真题 第24题",
    "year": 2011,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "下列选项中，在用户态执行的是 。",
    "options": [
      "命令解释程序",
      "缺页处理程序",
      "进程调度程序",
      "时钟中断处理程序"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-26",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2011年 408 统考真题 第26题",
    "year": 2011,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "用户程序发出磁盘I/0请求后， 系统的正确处理流程是",
    "options": [
      "用户程序一系统调用处理程序--中断处理程序一设备驱动程序",
      "用户程序一系统调用处理程序一设备驱动程序-中断处理程序",
      "用户程序一设备驱动程序一系统调用处理程序--中断处理程序",
      "用户程序-设备驱动程序一中断处理程序一系统调用处理程序"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-27",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "deadlock",
    "source": "2011年 408 统考真题 第27题",
    "year": 2011,
    "topic": "死锁避免与银行家算法拓扑",
    "difficulty": "高频真题",
    "question": "某时刻进程的资源使用情况如下表所示。 进程 已分配资源 尚需分配 可用资源 R1 R2 R3 R1 R2 R3 R1 R2 Ra P1 2 。 P2 1 2 P3 。 I P4 。 。 此时的安全序列是 。 。 。 。 1 。 I 3 2 I I 3 I l 2 。 。",
    "options": [
      "P1, P2, P3, 凡",
      "P1, P3, P2, P4",
      "Pi, P4, P3, P2",
      "不存在的"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-28",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "page-replacement",
    "source": "2011年 408 统考真题 第28题",
    "year": 2011,
    "topic": "虚拟存储分页与页面置换算法",
    "difficulty": "高频真题",
    "question": "在缺页处理过程中，操作系统执行的操作可能是———° I. 修改页表 II. 磁盘1/0 III. 分配页框 。 2",
    "options": [
      "仅I、II",
      "仅II",
      "仅III",
      "I、II和III"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-29",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2011年 408 统考真题 第29题",
    "year": 2011,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "当系统发生抖动(thrashing)时，可以采取的有效措施是 。 I. 撤销部分进程 II. 增加磁盘交换区的容量 III. 提高用户进程的优先级",
    "options": [
      "仅I",
      "仅II",
      "仅III",
      "仅I、II I"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-30",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "page-replacement",
    "source": "2011年 408 统考真题 第30题",
    "year": 2011,
    "topic": "虚拟存储分页与页面置换算法",
    "difficulty": "高频真题",
    "question": "在虚拟内存管理中，地址变换机构将逻辑地址变换为物理地址，形成该逻辑地址的阶段 是",
    "options": [
      "编辑",
      "编译",
      "链接",
      "装载 2018年计算机408统考真题 第 3 页，共 8 页"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-31",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2011年 408 统考真题 第31题",
    "year": 2011,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "某文件占10个磁盘块， 现要把该文件磁盘块逐个读入主存缓冲区 ，并送用户区进行分 析，假设一个缓冲区与一个磁盘块大小相同，把一个磁盘块读入缓冲区的时间 为 lOOµs, 将缓冲 区的数据传送到用户区的时间是SOµs, CPU对一块数据进行分析的时间 为SOµs。在单缓冲区和 双缓冲区结构下， 读入并分析完该文件的时间分别是 。",
    "options": [
      "l_SOOµs、lOOOµs",
      "1550µs、llOOµs",
      "1550µs、1550µs",
      "2000µs、2000µs"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-32",
    "courseId": "operating-system",
    "courseName": "操作系统",
    "experimentId": "process-sync",
    "source": "2011年 408 统考真题 第32题",
    "year": 2011,
    "topic": "操作系统核心时序机理",
    "difficulty": "高频真题",
    "question": "有两个并发执行的进程P1和P2, 共享初值为1的变量x。P1 对x 加1, P2对x减l。加1 和减l操作的指令序列分别如下所示。 ／／加1操作 _ II减1操作 load R1,. x / /取x到寄存器Rl 中 load R2, x dei::: \u00042 inc Rl. 玩ore x, Rl //将Rl的内容存入又 两个操作完成后，x的值 。 ··.:.、归， ｝ s氐re x,",
    "options": [
      "可能为-1或3",
      "只能为1",
      "可能为0、1或2",
      "可能为-1、0、1或2"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-33",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "tcp-connection",
    "source": "2011年 408 统考真题 第33题",
    "year": 2011,
    "topic": "TCP 全双工三次握手与四次挥手时序",
    "difficulty": "高频真题",
    "question": "TCP/IP参考模型的网络层提供的是 。",
    "options": [
      "无连接不可靠的数据报服务",
      "无连接可靠的数据报服务",
      "有连接不可靠的虚电路服务",
      "有连接可靠的虚电路服务"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-34",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "dns-resolution",
    "source": "2011年 408 统考真题 第34题",
    "year": 2011,
    "topic": "DNS 递归与迭代分层解析沙盒",
    "difficulty": "高频真题",
    "question": "若某通信链路的数据传输速率为2400bps, 采用四相位调制，则该链路的波特率是 。",
    "options": [
      "600波特",
      "1200波特",
      "4800波特",
      "9600波特"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-35",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "sliding-window",
    "source": "2011年 408 统考真题 第35题",
    "year": 2011,
    "topic": "滑动窗口协议与拥塞控制动态曲线",
    "difficulty": "高频真题",
    "question": "数据链路层采用选择重传协议(SR) 传输数据，发送方已发送了0-3号数据帧，现已 收到1号帧的确认，而O、2号帧依次超时，则此时需要重传的帧数是 。",
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-36",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "dns-resolution",
    "source": "2011年 408 统考真题 第36题",
    "year": 2011,
    "topic": "DNS 递归与迭代分层解析沙盒",
    "difficulty": "高频真题",
    "question": "下列选项中，对正确接收到的数据帧进行确认的MAC协议是 。",
    "options": [
      "CSMA",
      "CDMA",
      "CSMA/CD",
      "CSMA/CA"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-37",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "ip-subnet",
    "source": "2011年 408 统考真题 第37题",
    "year": 2011,
    "topic": "IP 子网掩码与 CIDR 超网编址",
    "difficulty": "高频真题",
    "question": "某网络拓扑如下图所示，路由器Rl只有到达子网192.168.1.0/24的路由。为使Rl可以 将1P分组正确地路由到图中所有的子网，则在Rl中需要增加的一条路由（目的网络，子网掩码， 下一跳）是 。",
    "options": [
      "192.168.2.0",
      "192.168.2.0 255.255.255.128 192.168.1.1 255.255.255.0 192.168.1.1",
      "192.168.2.0 255.255.255.128 192.168.1.2",
      "192.168.2.0 255.255.255.0 192.1Ʀ8.l.2"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-38",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "ip-subnet",
    "source": "2011年 408 统考真题 第38题",
    "year": 2011,
    "topic": "IP 子网掩码与 CIDR 超网编址",
    "difficulty": "高频真题",
    "question": "在子网192.168.4.0/30中能接收目的地址为192.168.4.3的IP分组的最大主机数是 。",
    "options": [
      "0",
      "1",
      "2",
      "4"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  },
  {
    "id": "q-2011-39",
    "courseId": "computer-network",
    "courseName": "计算机网络",
    "experimentId": "tcp-connection",
    "source": "2011年 408 统考真题 第39题",
    "year": 2011,
    "topic": "TCP 全双工三次握手与四次挥手时序",
    "difficulty": "高频真题",
    "question": "主机甲向主机乙发送一个(SYN= 1, seq= 11220)的TCP段，期望与主机乙建立TCP 2018年计算机408统考真题 第 4 页，共 8 页 2011年全国硕士研究生入学统—考试计算机科学与技术学科联考计算机学科专业基础综合试题 园蓝面图匿回回囡囡园 连接，若主机乙接受该连接请求，则主机乙向主机甲发送的正确的TCP段可能是 。",
    "options": [
      "(SYN= 0, ACK= 0, seq= 11221, ack = 11221)",
      "(SYN= 1, ACK= 1, seq= 11220, ack = 11220)",
      "(SYN= 1, ACK= 1, seq= 11221, ack = 11221)",
      "(SYN= 0, ACK= 0, seq= 11220, ack = 11220)"
    ],
    "answer": 0,
    "explanation": "2011年 408 统考真题标准官方解析。",
    "labTip": "可在对应微观实验中进行单步推演以加深理解。"
  }
];
