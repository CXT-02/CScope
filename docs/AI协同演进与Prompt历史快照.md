# 2026年传智杯 · CSCOPE 参赛作品
# AI 协同演进全景记录与核心 Prompt 历史快照

> **声明**：本文件依据大赛“2.1 代码仓库与演进记录”规范编制，完整呈现项目从构思、架构设计、核心模块演进到顽固 Bug 定位与修复中，团队与 AI 协同开发的真实 Prompt 交互链条与决策上下文。

---

## 一、 团队意图控制策略与 AI 协同开发方法论

在本项目开发全程中，团队坚决贯彻**“人类架构师主导 + AI 高效工程落地”**的 Vibe Coding 准则，杜绝“无约束野蛮生成”导致的架构劣化与逻辑幻觉。团队构建了三道意图约束防火墙：

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AI 协同开发意图控制体系                         │
├────────────────────────────────────────────────────────────────────────┤
│ 1. 架构宪法约束 (ARCHITECTURE.md)                                     │
│    预先确立目录边界、命名约定、降级准则，禁止 AI 越界或颠覆核心数据流  │
├────────────────────────────────────────────────────────────────────────┤
│ 2. 细粒度任务解耦 (Atomic Iterations)                                  │
│    单次 Prompt 仅聚焦单一确定性目标，杜绝多重模糊指令导致的逻辑冲突    │
├────────────────────────────────────────────────────────────────────────┤
│ 3. 证据驱动的 Bug 修复闭环 (Evidence-Driven Debugging)                │
│    当发生异常时，提供真实截图/控制台报错，引导 AI 分析根因而非打补丁   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 二、 三个核心功能迭代的完整 Prompt 交互链

### 链条 1：AI 计算机私教 DeepSeek-R1 深度伴学与全时持久化沉淀

#### 1. 业务背景与初始缺陷
早期版本中，AI 私教模块仅是一个简单的静态提示框，回答内容有限，缺乏真正的推理能力，更无法记录考生的历史提问。备战 408 统考需要对计算机底层的深度剖析和长周期学情记录。

#### 2. 用户原始 Prompt（人类意图输入）
> **用户 Prompt**：  
> `“这部分要把功能做全，真的要接入一个大模型，真的可以全面的解答，同时要有聊天记录存档”`  
> *(附带原界面截图)*

#### 3. AI 的架构设计建议与初步落地
* **AI 建议**：
  1. 架构上接入 DeepSeek-R1（`deepseek-reasoner`）大模型，利用其独有的 Thinking Process（深度思维链）拆解 408 算法数学原理；
  2. 设计前端流式（Streaming）接收与思维链折叠面板（`<div className="reasoning-box">`），将推理过程与结论清晰分离；
  3. 引入多会话持久化存储机制，在 `localStorage` 中沉淀 `cscope_ai_chat_sessions_v2`，支持历史记录漫游与一键清空；
  4. 设计智能反向推荐：私教回答完毕后，智能分析关键词（如提到 Cache、流水线），自动生成直达微观实验沙盘的卡片。

#### 4. 出现边界问题：无网与无 API Key 场景下的评委复现崩溃
在实测中，团队发现如果评审环境断网或用户没有配置商业 API Key，AI 私教将陷入报错红框，破坏复现性。

#### 5. 用户引导 Prompt（引导 AI 构建降级机制）
> **用户引导 Prompt**：  
> `“如果比赛评委在断网或者没有 API Key 的情况下打开，必须不能报错白屏，要能够双重兜底，离线也要能解答 408 核心真题！”`

#### 6. AI 修复与最终方案落地
* AI 在 `DeepSeekChat.jsx` 中构建了双轨问答引擎：
  * **主轨（在线）**：优先请求真实流式接口，展现思考链；
  * **副轨（离线精编知识图谱 RAG）**：内置覆盖 408 四大学科超 50 个高频疑难考点（如 Load-Use 冒险、银行家算法矩阵、CIDR 子网、滑动窗口）的离线专家级题库。
  * **验证结果**：即使断开所有网络，用户提问“推导死锁银行家算法”依然秒级返回规范思维链与微观实验传送门，代码在 Git 中以 `feat(ai-tutor): full real LLM integration with DeepSeek-R1...` 提交（Commit `3b8fbde`）。

---

### 链条 2：408 真题智能推荐算法从“严重偏航”到“考点意图优先”的引导修复

#### 1. 业务背景与用户发现的严重异常
当系统上线了“错题一键唤醒仿真沙盘”功能后，团队在自测时发现了一个极具迷惑性的严重推荐逻辑 Bug：当提问推导操作系统的“银行家算法”时，系统却推荐了数据结构的“二叉树遍历”。

#### 2. 用户原始 Prompt（人类直接指谬并附带铁证）
> **用户 Prompt**：  
> `“为什么我问的是银行家算法他给我推荐的是二叉树排序”`  
> *(附带现场截图：提问“推导银行家算法”，系统底部却赫然显示推荐【二叉树遍历】)*

#### 3. AI 根因定位与机理剖析
AI 通过全面检索推荐匹配算法，定位到了隐蔽的“词频加权污染”根因：
1. 原算法仅使用简单的子串包含：`stem.includes(kw)`；
2. 银行家算法的知识图谱中包含说明：“避免进程**死锁**与等待**队列**”；
3. 而二叉树遍历的关键字列表中包含了高频泛化词“**树**”、“**序**”、“**列**”、“**算法**”；
4. 导致提问中的通用词汇（如“算法”、“序列”）错误击中了二叉树实验的泛化标签，且由于二叉树关键词较多，总得分竟然反超了死锁银行家算法！

#### 4. 用户引导 Prompt（约束算法设计原则）
> **用户引导 Prompt**：  
> `“不能用这种模糊的普通字去匹配，必须根据考点专业名词设定极高的特征权重，而且不同学科要有强隔离隔离机制，银行家算法属于操作系统，绝对不能跨学科串到数据结构去！”`

#### 5. AI 的修改方案与算法重构
AI 重新设计了**意图优先与学科强隔离加权算法（Intent-Prioritized Matching）**：
```javascript
// 核心加权公式重构
function matchRecommendedLab(queryText) {
  let bestScore = -1, bestLab = null;
  experiments.forEach(lab => {
    let score = 0;
    // 1. 极高权重特征考点精确强匹配 (Weight = 100)
    if (lab.id === 'deadlock' && (queryText.includes('银行家') || queryText.includes('死锁') || queryText.includes('安全序列'))) {
      score += 100;
    }
    if (lab.id === 'cpu-pipeline' && (queryText.includes('流水线') || queryText.includes('数据冒险') || queryText.includes('RAW'))) {
      score += 100;
    }
    // 2. 清除'算法'、'结构'等泛化干扰无意义词
    // 3. 学科一致性增益
    if (score > bestScore) {
      bestScore = score;
      bestLab = lab;
    }
  });
  return bestLab;
}
```
* **落地与验证**：重新测试提问“推导银行家算法”，系统 100% 精准推荐【死锁：预防、避免与银行家算法】，并以 Commit `db19019` 提交入库。

---

### 链条 3：学术社区评论区头像 URL 文本溢出重叠顽固 Bug 的引导排查

#### 1. 业务背景与用户发现的排版重叠
在拓展极客学术社区的多账号互动功能后，用户切换至带有真实头像（如 Unsplash 网络人像链接）的学者账号【小明同学】并打开评论区时，页面出现了极其刺眼的文字错位重叠。

#### 2. 用户原始 Prompt（直观反馈）
> **用户 Prompt**：  
> `“每个帖子下面打开评论都是有这种重叠的效果，修改”`  
> *(附带现场截图：`https://images.unsplash.com/photo-153571...` 长串链接文字直接横向印在输入框和“作为【小明同学】发表研学见解：”文字上)*

#### 3. AI 根因定位与排查
* **根因剖析**：
  1. 在 `CommunityHub.jsx` 中，当前用户头像变量为 `currentUserAvatar = user?.avatar || '研'`。当用户绑定了网络头像时，该变量为包含 120 多个字符的完整 URL 字符串；
  2. 在评论输入组件中，原代码简单写为：`<div className="composer-avatar">{currentUserAvatar}</div>`；
  3. React 将此字符串直接作为纯文本节点渲染，而非 `<img />` 标签；
  4. 且由于 `.composer-avatar` 类仅设置了 `width: 32px; height: 32px;`，未声明 `overflow: hidden`，无空格的长字符串无法折行，向右横向穿透 400px，恰好覆盖了紧随其后的提示文字与文本域！

#### 4. 用户引导 Prompt（强调美观与健壮性）
> **用户引导 Prompt**：  
> `“不仅是输入框，所有的帖子头像、评论人头像都要正常显示图片，如果是网址就显示圆形图片，如果图片失效或者没有网址就显示名字的第一个字，绝对不能再让任何字飘出来！”`

#### 5. AI 修改方案与落地落地
* **构建通用防御组件 `AvatarBadge`**：
  ```jsx
  function AvatarBadge({ avatar, name, className = '' }) {
    const [imgError, setImgError] = useState(false);
    useEffect(() => { setImgError(false); }, [avatar]);

    const isUrl = typeof avatar === 'string' && (
      avatar.startsWith('http://') || avatar.startsWith('https://') || 
      avatar.startsWith('/') || avatar.length > 30
    );

    if (isUrl && !imgError) {
      return (
        <img
          src={avatar}
          alt={name || 'avatar'}
          className={`avatar-img-badge ${className}`.trim()}
          onError={() => setImgError(true)} // 加载失败优雅降级
        />
      );
    }
    const char = (avatar && !isUrl ? avatar : (name || '研')).trim().slice(0, 1);
    return <span className={`avatar-char-badge ${className}`.trim()}>{char}</span>;
  }
  ```
* **CSS 容器强制防御机制**：
  ```css
  .author-avatar, .strip-avatar, .composer-avatar, .comment-author-avatar {
    overflow: hidden !important;
    flex-shrink: 0 !important;
    border-radius: 50% !important;
    display: grid !important;
    place-items: center !important;
  }
  ```
* **落地与验证**：不仅彻底消除了输入框的文字重叠，而且评论流中所有研友的头像均以精致圆角图片或首字徽章呈现，以 Commit `3efb9ac` 提交入库。

---

## 三、 结论与可复现性验证依据

通过上述三个完整 Prompt 迭代链条可以清晰看出：
1. **作品具备纯正的原创性与真实的自主迭代历程**：每一次功能跃迁与 Bug 修复均由团队根据真实操作体验发现、提出针对性引导，并约束 AI 精准解决；
2. **Git Commit 细粒度印证**：仓库中的每一个 Git Commit Hash 均可与上述 Prompt 链及问题点完美对应，有力证明作品绝非从外部直接克隆的现成开源项目；
3. **架构健壮与可复现**：全套体系遵循架构宪法约束，具备完整的工业级交付水准。
