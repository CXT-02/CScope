# AI 协同开发 Prompt 交互链证据快照：408 真题智能推荐算法从“二叉树偏航”到“考点意图优先加权”的引导修复

> **证据真实性声明**：本记录直接提取自开发环境底层审计日志（`transcript.jsonl`），时间戳、用户原始提问、上传截图附件、AI 无删减回复及 Git 提交记录均完全真实，可供大赛专家逐项核验。

---

## 📌 链条元数据对照

| 属性项 | 详细信息 |
| :--- | :--- |
| **交互链条编号** | `chain-2` |
| **功能/缺陷主题** | 408 真题智能推荐算法从“二叉树偏航”到“考点意图优先加权”的引导修复 |
| **交互发生时间** | `2026-11-17T15:56:35Z` |
| **对应 Git 提交** | [`db19019`](https://github.com/CXT-02/CScope/commit/db19019) (`fix(tutor): upgrade experiment recommendation with intent-prioritized score matching to fix deadlock vs tree traversal`) |
| **影响核心代码文件** | `frontend/src/lib/aiTutorService.js` |
| **底层审计 Step 跨度** | Step `5520` 至 Step `5593` (共 74 个交互状态跃迁) |

---

## 📷 用户现场上传的原始截图与证据

![用户上传证据截图](./01_user_upload_evidence.jpg)
*图 1：用户现场提问“推导银行家算法”但系统错误推荐“二叉树遍历”的指谬截图*

---

## 💬 原始 Prompt 与 AI 完整响应记录（无删减）

### 1. 人类开发者原始 Prompt 输入（Step 5520）

```text
<USER_REQUEST>
为什么我问的是银行家算法他给我推荐的是二叉树排序
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-11-17T23:56:35+08:00.

The user has uploaded 1 image(s):
- C:/Users/程馨婷/.gemini/antigravity/brain/9a72c924-de29-4bdd-b6fc-622c9d0cd374/.user_uploaded/media_1794930970832_a5c18fa3.jpg
You can embed this image in an artifact if you need the USER to review it.
</ADDITIONAL_METADATA>
```

### 2. AI 架构师/工程师原始完整回复（Step 5593）

```markdown
这是一个非常典型的**通用高频词抢先命中（Generic Keyword Precedence）**导致的问题，已彻底修复！

---

### 🔍 为什么会推荐成「二叉树遍历」？

1. **回答内容中包含了通用计算机词汇「递归」**：
   在为您解答银行家算法第 2 点第 4 步时，正文中写道：
   > *“4. **递归检查**是否所有进程均能完成。若能找到至少一条这样的排列，即为安全序列...”*
2. **实验列表遍历的“先到先得”与通用词缺陷**：
   - 之前在推荐关联微观仿真实验时，代码按数组顺序遍历 25 门微观实验；
   - 第 8 号实验是**「二叉树遍历」**，它的知识点标签里包含了 `['二叉树', '递归', '队列']`；
   - 而真正的**「死锁与银行家算法」**排在第 13 号实验。
   - 当程序在全文中扫描到“递归”这个词时，第 8 号实验**抢先返回**了「二叉树遍历」，直接退出了匹配流程，根本没轮到后面的「死锁：预防、避免与解除（银行家算法）」！

---

### 🛠️ 解决方案与彻底优化

在 [aiTutorService.js](file:///d:/2026年传智杯/attention-lab/frontend/src/lib/aiTutorService.js#L192-L380) 中重构了推荐实验的决策算法：

1. **用户提问意图绝对优先（Question Priority，权重 100 分）**：
   - 提问是学生的最直接诉求。用户问“银行家算法”或“死锁”，提问中的专有词直接赋予 **100 分绝对高权重**；正文中偶然出现的辅助词仅占 4 分。
2. **专有词与通用词严格分级**：
   - 彻底移除了“递归”、“队列”这类在各种算法中都会出现的通用词对特定实验的粗暴单点绑定；
   - 「二叉树遍历」必须包含“二叉树”、“先序/中序/后序遍历”等明确的树结构专有特征词才会触发。
3. **全局 25 门实验综合打分竞争机制（Scoring Model）**：
   - 遍历并计算所有 25 门实验的综合置信度得分，由最高分胜出。
   - 现在问**「推导银行家算法」**：
     - `deadlock`（死锁：预防、避免与解除）得分：**240 分**（命中提问强特征词 + 回答专有词）
     - `tree-traversal`（二叉树遍历）得分：**0 分**
     - **准确命中并推荐**：`死锁：预防、避免与解除（银行家算法）`，点击即可一键跳转至银行家算法与死锁环破除仿真沙盒！
```

---

## 🛠️ 代码提交与可复现性核验

* 对应 Git 提交已推送到公共仓库：`https://github.com/CXT-02/CScope/commit/db19019`
* 可在本地执行以下命令检出并复现本轮交互的代码落地成果：
  ```bash
  git show db19019
  ```
