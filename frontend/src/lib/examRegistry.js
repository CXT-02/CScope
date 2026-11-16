// 全国计算机考研统考 408 经典真题与专项测试题库 (100+ 题完整题库)
// 每道题均已深度锚定现有可视化仿真实验室，支持“一键直达仿真推演”
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
    "labTip": "你可以在 Cache 实验中选择“直接映射”，输入该序列观察行 0 的反复颠簸淘汰动画。"
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
    "labTip": "在 Cache 实验中切换到“组相联映射”，查看地址解析器如何将 32 位二进制切分为 Tag、Set、Offset。"
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
    "labTip": "在 Cache 实验中观察命中写操作时，脏位如何被点亮并在换出时触发一次主存写写回。"
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
    "labTip": "可在 CPU 流水线实验中查看第 4 幕“写后读 RAW 数据冲突与气泡”时空流水图。"
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
    "labTip": "在 CPU 流水线实验中观察控制冲突演示，直观理解流水线冲刷气泡产生的原因。"
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
    "labTip": "在 CPU 流水线实验中勾选“启用前递技术 (Forwarding)”，观察气泡如何被黄色数据旁路消除。"
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
    "labTip": "在补码与浮点数实验中输入 100 与 60，观察两个正数相加时硬件触发溢出警告的动画。"
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
    "labTip": "在定点数与补码实验中切换“有符号/无符号视图”，对比 CF 与 OF 的触发条件。"
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
    "labTip": "在 IEEE 754 浮点数实验中输入 -5.0，动态观察符号位、阶码移码和尾数的二进制切片。"
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
    "labTip": "在浮点数实验中选择预设“特殊值 NaN 与无穷大”，查看其二进制对应模式。"
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
    "labTip": "在指令执行周期实验中单步执行“取指阶段 (Fetch)”，观察 PC、MAR、MDR、IR 数据总线的微时钟流动。"
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
    "labTip": "结合指令微操作周期理解总线在访存周期占用读写总线的时间窗口。"
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
    "labTip": "在指令周期实验中观察中断响应周期与硬件微控制器的协作时序。"
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
    "labTip": "在页面置换实验中载入该访问串，直观查看 FIFO 与 LRU 物理页槽的动态更替。"
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
    "labTip": "在页面置换实验中观察 LRU 栈在命中时如何自动将命中块提升至栈顶。"
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
    "labTip": "在页面置换实验中选择 CLOCK 算法，观察时钟指针旋转扫描并清除访问位的过程。"
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
    "labTip": "在死锁实验中亲自运行一次银行家算法安全性检查，观察系统如何寻找安全推进序列。"
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
    "labTip": "在死锁实验的“哲学家进餐”模型中，观察奇偶哲学家或有序取筷策略如何消除死锁环。"
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
    "labTip": "在死锁实验中查看可化简与不可化简资源图的动画消解过程。"
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
    "labTip": "在进程同步与状态模型实验中，观察进程在释放锁或时间片用尽时的五状态流动图。"
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
    "labTip": "在进程同步实验中选择“生产者-消费者”，观察信号量 empty 和 full 从正值减到负值时的阻塞队列变化。"
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
    "labTip": "在进程同步实验中切换 P 操作次序，直观观察死锁锁死动画。"
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
    "labTip": "在 CPU 进程调度实验中载入该组作业，查看甘特图上 SJF、FCFS 与时间片轮转的等待时延对比。"
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
    "labTip": "在进程调度实验中观察多级队列调度演示，感受短进程插队与长作业下沉的动态平衡。"
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
    "labTip": "在内存动态分区实验中对比 Best Fit 与 First Fit，观察内存条中外部碎片的产生过程。"
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
    "labTip": "结合虚拟内存页表概念，理解多级间接指针与多级页表在地址映射上的高度同构性。"
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
    "labTip": "可在滑动窗口实验中选择超时丢包场景，亲眼观察 cwnd 骤降归 1 后重新爬升的过程。"
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
    "labTip": "在 TCP 握手与全双工信道实验中，观察 Client 与 Server 之间 ISN 与 ACK 的序号时序交互。"
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
    "labTip": "在 TCP 连接状态机实验中点击“断开连接”，直观观察 Client 如何在 TIME_WAIT 停滞倒计时。"
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
    "labTip": "在 IP 子网实验中拖动 CIDR 滑块到 /28，输入该 IP 即可即时看到网络地址与广播地址的二进制切分。"
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
    "labTip": "在 IP 子网实验中输入 130.12.16.8，对比 /16、/20 和 /24 的网络地址覆盖范围。"
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
    "labTip": "在 IP 子网实验中体验 CIDR 滑块如何从 /24 收缩合并至 /22。"
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
    "labTip": "在 DNS 递归与迭代解析实验中一步步推进报文，直观观察 3 级域服务器的指针返回。"
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
    "labTip": "在滑动窗口实验中对比停等、GBN 与 SR 算法的窗口移动差异。"
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
    "labTip": "体会物理层信道带宽对数字信号波形失真与极限吞吐的物理约束。"
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
    "labTip": "在报文时空图上理解单向时延与往返时延对检测冲突窗口的意义。"
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
    "labTip": "结合二层链路拓扑，理解局域网内单播、组播与泛洪的区别。"
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
    "labTip": "在全双工 TCP 信道中体会应用层 HTTP 数据段如何装载在 TCP MSS 载荷中传输。"
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
    "labTip": "在二叉树实验中选择预设树，观察前序、中序、后序与层序遍历中根节点记录时机。"
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
    "labTip": "在树遍历与平衡结构实验中，体会左右子树高度差绝对值不超过 1 的平衡因子约束。"
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
    "labTip": "在二叉树实验中观察哈夫曼编码树从底部最小权节点逐步合并构建的过程。"
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
    "labTip": "在栈与队列实验中手动模拟压栈出栈动画，亲自验证序列的合法性。"
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
    "labTip": "在栈与队列实验中选择循环队列，观察指针环形模运算回绕动画。"
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
    "labTip": "在排序算法实验中选择“逆序输入”，观察快速排序递归柱状图如何退化为单侧倾斜。"
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
    "labTip": "在排序实验中切换到“堆排序”，单步观察建堆筛选下沉与树形结构同步交换。"
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
    "labTip": "在 Dijkstra 算法实验中点击每一步松弛，观察各节点候选距离表的实时收敛过程。"
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
    "labTip": "在 B+ 树实验中插入数据，观察节点关键字达到上限时触发分裂并向父节点晋升的动画。"
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
    "labTip": "结合数组寻址与散列函数，理解线性探测发生堆积聚集（Primary Clustering）现象的成因。"
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
    "labTip": "在事务实验中选择“脏读”场景，切换隔离级别查看读已提交如何阻止读取未提交版本。"
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
    "labTip": "在数据库事务实验中观察加锁解锁阶段，理解并发读写锁的冲突矩阵与串行隔离原理。"
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
    "labTip": "在模式规范化实验中观察依赖箭头消除与模式无损分解。"
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
    "labTip": "在 SQL 连接实验中切换 INNER JOIN 与 LEFT JOIN，观察文氏图与结果集维度的动态增减。"
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
    "labTip": "在 IEEE 754 浮点数实验中观察两个不同指数的浮点数相加时，较小指数尾数向右对阶的过程。"
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
    "labTip": "在定点数实验中查看 0x80 在 8 位有符号补码下如何直接映射到 -128。"
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
    "labTip": "在浮点数实验中观察阶码偏置值 Bias=127 时真值指数与机器码对应关系。"
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
    "labTip": "在 CPU 流水线实验中查看木桶效应：流水线整体时钟节拍受制于最慢功能部件的原理。"
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
    "labTip": "在流水线实验中查看冯诺依曼结构单总线冲突与哈佛分离缓存架构的对比。"
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
    "labTip": "在分支预测微操作中体会连续循环跳出时两比特饱和状态机的稳定性。"
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
    "labTip": "在指令周期实验中观察程序计数器 PC 在取指阶段自动增加并在相对跳转时加上偏移量。"
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
    "labTip": "在指令译码周期中查看寻址方式字段如何驱动不同的 ALU 地址生成逻辑。"
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
    "labTip": "在 CPU 指令微操作阶段中查看微指令如何一步步译码驱动数据通路开关。"
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
    "labTip": "在 Cache 实验中切换直接映射与组相联映射，查看比较器并发数与冲突率的权衡。"
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
    "labTip": "结合页表与 Cache 实验理解现代计算机 MMU 从虚拟页号到 Cache 组索引的二级流水。"
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
    "labTip": "在指令执行周期实验中观察中断响应周期对 PC 寄存器入栈的微时钟控制。"
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
    "labTip": "结合 TCP 三次握手理解异步全双工信号交互中的可靠握手机制。"
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
    "labTip": "在进程与线程管理中体会线程上下文切换无需切换 MMU 页目录基地址的高效优势。"
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
    "labTip": "在进程五状态模型中查看系统调用触发进程态从用户态陷入内核态并阻塞的流动。"
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
    "labTip": "在进程同步实验中对比自旋锁忙等与 PV 信号量阻塞睡眠机制的 CPU 占用差异。"
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
    "labTip": "在进程同步实验中选择“读者-写者问题”，观察多个并发读线程如何持续压制写线程。"
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
    "labTip": "在死锁与哲学家进餐实验中观察所有哲学家同时拿起左筷导致的死锁锁死状态。"
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
    "labTip": "在银行家算法中推导可用资源向量 Available 与最大需求矩阵 Max 的安全性不等式。"
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
    "labTip": "在进程调度实验中观察 HRRN 算法动态计算响应比排序的动画过程。"
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
    "labTip": "在调度实验中拉大/缩小时间片滑块，直观观察甘特图切片密度的动态变化。"
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
    "labTip": "在虚拟内存实验中观察 32 位虚拟地址如何经过一级目录索引、二级页表索引最终合成物理地址。"
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
    "labTip": "在页面置换与 TLB 流水实验中体会快表作为页表缓存的一致性保证。"
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
    "labTip": "在页面置换实验中观察物理块分配过少时缺页率剧增的现象。"
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
    "labTip": "在动态分区实验中观察内存块搬运拼接与基址更新过程。"
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
    "labTip": "体会磁盘调度算法如何通过保持单向行进避免磁头频繁往返抖动。"
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
    "labTip": "结合链表与数组的随机访问特性理解不同文件分配策略的 I/O 成本。"
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
    "labTip": "在 TCP 实验中查看端到端主机状态机如何脱离中间路由跳数独立维持可靠性。"
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
    "labTip": "体会数据链路层如何利用多项式除法在硬件移位寄存器中以纳秒级速度检出突发错误。"
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
    "labTip": "在滑动窗口实验中对比窗口大小 W=1（停等）与 W=8 时的信道数据吞吐率。"
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
    "labTip": "在滑动窗口实验中模拟单帧丢包，观察接收端连续发送 3 次 ACK 触发快速重传。"
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
    "labTip": "在滑动窗口实验中查看 cwnd 锯齿形动态曲线在超时丢包时的骤降与线性回升。"
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
    "labTip": "在 TCP 实验中调节接收窗口 rwnd 与拥塞窗口 cwnd，观察发送上限如何取两者较小值。"
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
    "labTip": "在 IP 子网与分组转发实验中查看私网 IP 地址段分类（10/8, 172.16/12, 192.168/16）。"
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
    "labTip": "在 IP 子网与协议实验中查看 IP 数据报中 TTL 减 1 归 0 时的丢包处理。"
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
    "labTip": "在拓扑图路径推导中体会距离向量算法 Bellman-Ford 与链路状态算法的差异。"
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
    "labTip": "在 Dijkstra 最短路径算法实验中观察加权图单源最短路径树的收敛生成。"
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
    "labTip": "在 IP 子网实验中体会网络层逻辑 IP 地址与数据链路层物理 MAC 地址的解耦映射。"
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
    "labTip": "在应用层与全双工信道中观察基于 UDP 广播的应用协议交互。"
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
    "labTip": "在 TCP 连接建立后体会应用层安全协议如何对传输数据负载透明加密。"
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
    "labTip": "在数据结构实验中体会数组内存连续性与链表指针离散分布的性能权衡。"
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
    "labTip": "在栈与队列实验中观察操作符栈在遇到括号和高优先级符号时的压栈出栈规则。"
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
    "labTip": "在二叉树遍历实验中任意添加/删除叶子与分支节点，验证叶子节点数与度2节点的数学规律。"
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
    "labTip": "在树实验中输入该关键字序列，实时生成 BST 树形并标注各节点深度。"
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
    "labTip": "在图算法实验中逐步删除入度为 0 节点的出边，观察拓扑序列的生成动态。"
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
    "labTip": "在最短路径与图遍历实验中观察贪心策略在图结构上的局部最优选择。"
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
    "labTip": "在排序实验中观察包含相同数值的彩色柱状条，查看快速排序后相同颜色柱子的位置错动。"
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
    "labTip": "在排序算法实验中选择“归并排序”，观察分治拆分后双指针拉取暂存区合并动画。"
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
    "labTip": "在数据库事务实验中观察 Commit 提交触发日志落盘的动画流程。"
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
    "labTip": "在事务锁机制实验中查看行锁与意向锁的相容矩阵表。"
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
    "labTip": "在注意力机制实验中观察 Q 与 K 矩阵点积计算与 Softmax 归一化热力图。"
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
    "labTip": "在梯度下降实验中调大学习率滑块，直观观察球体在三维损失曲面上来回弹跳发散的动画。"
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
    "labTip": "在卷积实验中修改输入维度、卷积核大小与步长，观察卷积滑动窗口与特征图生成过程。"
  }
];
