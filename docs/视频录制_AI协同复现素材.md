# CSCOPE 视频录制：AI 协同复现素材包

## 使用方式

本文件只用于录屏准备。正式录制时不要从头朗读，而是按照“问题现场 → 输入 Prompt → AI 回复 → 代码修改 → 运行验证 → Git Commit”的顺序展示。

建议提前把两段 Prompt 分别复制到纯文本编辑器中，录制时再粘贴到新的 AI 会话。必须保留点击发送和 AI 开始响应的画面，不能只展示整理后的历史截图。

---

## 案例一：实验推荐偏航

### 问题截图

docs/ai-history/chain-2/01_user_upload_evidence.jpg

### 录屏 Prompt

我在 AI 私教输入“推导银行家算法”，回答正确，但推荐卡片却跳到了“二叉树遍历”。请先不要直接改代码。检查旧版 detectRecommendedExperiment 中按数组顺序遇到关键词就立即返回的逻辑，解释为什么回答里的“递归检查”会抢先命中二叉树。

然后给出最小且可验证的修复方案，必须满足：

1. 用户问题中的专业考点词必须高于回答正文中的通用词；
2. 必须遍历全部实验后选择最高分，不能先到先得；
3. 不能破坏离线推荐；
4. 给出“银行家算法”和“二叉树遍历”两个回归测试；
5. 先给根因和方案，等我确认后再修改。

### 旧逻辑应展示的关键点

旧版本将 question 与 content 合并为一个字符串，并按 experiments 数组顺序遍历。只要标题或 concepts 中任意词命中便立即 return，因此回答正文中的“递归”会让排在前面的二叉树实验抢先返回。

### AI 回复中需要高亮

- Generic Keyword Precedence，通用高频词抢先命中；
- question 与 content 分开计分；
- 用户问题 strongKeys 权重最高；
- 遍历所有实验后选最高分；
- 最低置信度阈值；
- 两组回归用例。

### 当前代码展示位置

frontend/src/lib/aiTutorService.js

搜索：

- detectRecommendedExperiment
- strongKeys
- score += 100
- maxScore

### 运行验证

验证用例一：

- 输入：推导银行家算法
- 预期：死锁：预防、避免与解除（银行家算法）

验证用例二：

- 输入：二叉树前序遍历为什么使用递归
- 预期：二叉树遍历

### Git 证据

Commit：db19019

录制命令：

    git show --stat db19019
    git show --unified=8 db19019 -- frontend/src/lib/aiTutorService.js

---

## 案例二：头像 URL 溢出

### 问题截图

docs/ai-history/chain-3/01_user_upload_evidence.png

### 录屏 Prompt

社区评论区出现头像与输入框重叠。当前 currentUserAvatar 可能是一段很长的 http、https 或 data 图片地址，旧代码直接在 composer-avatar 中输出字符串。

请先分析为什么单纯增加宽度或 word-break 不是可靠修复，再设计一个统一的 React AvatarBadge，必须满足：

1. 图片地址渲染为 img，并使用 object-fit: cover；
2. 图片加载失败时降级为昵称首字；
3. 普通文字头像只显示 1～2 个字符；
4. 覆盖帖子作者、评论作者、评论输入区和当前身份条；
5. 增加 overflow: hidden 与 flex-shrink: 0 防御；
6. 列出正常 URL、损坏 URL、纯文字头像三组验证用例；
7. 先给根因和方案，等我确认后再修改。

### 旧代码应展示的关键点

旧代码直接渲染：

    <div className="composer-avatar">{currentUserAvatar}</div>

当 currentUserAvatar 是长 URL 时，React 会把它当成文字节点，而不是图片。容器没有统一的图片语义和失败降级规则，因此只改宽度或换行无法从数据层解决问题。

### AI 回复中需要高亮

- URL 被当成纯文本节点；
- 统一 AvatarBadge 组件；
- isUrl 判断；
- img 的 onError 降级；
- 首字徽章；
- 四个头像挂载点统一替换；
- CSS 防御约束。

### 当前代码展示位置

frontend/src/components/CommunityHub.jsx

搜索：

- function AvatarBadge
- isUrl
- onError
- displayChar

frontend/src/styles.css

搜索：

- avatar-img-badge
- overflow: hidden
- flex-shrink: 0
- object-fit: cover

### 运行验证

1. 正常网络图片：显示圆形头像；
2. 损坏图片地址：自动显示昵称首字；
3. 纯文字头像：显示 1～2 个字符；
4. 打开任意帖子评论区：头像、提示文字和输入框不重叠。

### Git 证据

Commit：3efb9ac

录制命令：

    git show --stat 3efb9ac
    git show --unified=8 3efb9ac -- frontend/src/components/CommunityHub.jsx frontend/src/styles.css

---

## AI 审计收尾画面

打开：

docs/ai-history/AI_Co-Creation_Audit_Viewer.html

依次展示：

1. Chain 1：DeepSeek-R1 接入；
2. Chain 2：推荐算法偏航修复；
3. Chain 3：头像 URL 溢出修复；
4. Chain 4：首页重构。

终端展示：

    git rev-list --count HEAD
    git log --oneline --decorate -15

截至本次视频脚本编写时，本地仓库共有 123 次提交。若录制前又产生新提交，应以录制当天命令输出为准，不要继续口播固定数字。

---

## 录屏安全提醒

- AI 工具界面不要展示 API Key。
- 不要展示 C 盘用户目录、微信文件路径或私人聊天。
- GitHub 页面不要停留在个人令牌或设置页面。
- 复现 Prompt 可以要求 AI 先分析，不必真的再次覆盖当前正确代码。
- 如果现场 AI 响应较慢，可保留真实等待 2～3 秒后剪去中间等待，但必须保留发送与响应开始两个画面。
- 不要把整理后的审计看板冒充现场输入；审计看板用于补充证据，现场 AI 会话用于证明协同过程。
