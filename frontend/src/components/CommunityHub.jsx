import React, { useState } from 'react'

const INITIAL_POSTS = [
  {
    id: 'p_1',
    author: '林知远 (408上岸学长)',
    avatar: '林',
    time: '2 小时前',
    tag: '计组压轴',
    title: '【真题避坑】Cache 直接映射在什么情况下会发生 100% 全颠簸？',
    content: '做 2023 年计组真题时发现，很多同学把直接映射的缺失率算错了。如果循环里交替访问映射到同一 Cache 行的两个变量，由于容量虽然足够但行号冲突，每次访问都会把上一次的数据踢出，导致命中率为 0。建议大家去实验室的 Cache 映射沙盘调成直接映射单步跑一遍，瞬间豁然开朗！',
    likes: 128,
    comments: 34,
    labId: 'cache-mapping',
    labName: 'Cache 映射与颠簸仿真'
  },
  {
    id: 'p_2',
    author: 'OS 内核研究员',
    avatar: '内',
    time: '4 小时前',
    tag: '并发安全',
    title: '【死锁判决】为什么每类资源有多实例时，资源分配图有环不一定死锁？',
    content: '很多教科书一笔带过，导致 408 选择题经常选错。“有环”在单实例资源下是死锁的充要条件，但在多实例下只是必要条件！因为环外的进程一旦运行完毕释放资源，就可以借给环内的进程打破死锁僵局。银行家算法就是在模拟这个资源回收推演过程。',
    likes: 96,
    comments: 18,
    labId: 'deadlock',
    labName: '死锁避免银行家算法实验'
  },
  {
    id: 'p_3',
    author: '网络协议极客',
    avatar: '网',
    time: '昨天',
    tag: '协议状态机',
    title: '【协议精读】TCP 四次挥手中，客户端为什么要苦等 2MSL 才进入 CLOSED？',
    content: 'MSL（Maximum Segment Lifetime）是报文在网络中的最大寿命。客户端在发送最后一个 ACK 后，必须等待 2MSL：一是保证服务端能收到这个 ACK（若丢失，服务端会重传 FIN，客户端在 2MSL 内可以再次回复 ACK）；二是防止旧连接的报文段在网络中幽灵游荡出现在新连接中。',
    likes: 145,
    comments: 42,
    labId: 'tcp-connection',
    labName: 'TCP 全双工交互仿真'
  },
  {
    id: 'p_4',
    author: '小明同学',
    avatar: '明',
    time: '2 天前',
    tag: '算法复盘',
    title: '【树与平衡】AVL 树的 LR 旋转本质到底是怎么转的？',
    content: '以前死记硬背 LR 旋转，一考试就懵。今天在二叉树遍历实验里拖动滑块看了结点的左旋再右旋过程，原来就是把孙子结点提到爷爷结点的根位置！微观可视化真的比看黑白教材生动太多了。',
    likes: 82,
    comments: 15,
    labId: 'tree-traversal',
    labName: '二叉树遍历与平衡旋转实验'
  }
]

export default function CommunityHub({ onOpenExperiment }) {
  const [posts, setPosts] = useState(INITIAL_POSTS)
  const [activeTab, setActiveTab] = useState('all')
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newTag, setNewTag] = useState('408 交流')

  const handleLike = (id) => {
    setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1, isLiked: true } : p))
  }

  const handleCreatePost = (e) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) return

    const newPostItem = {
      id: `post_${Date.now()}`,
      author: '我 (研友在线)',
      avatar: '我',
      time: '刚刚',
      tag: newTag,
      title: newTitle.trim(),
      content: newContent.trim(),
      likes: 1,
      comments: 0,
      isLiked: true
    }

    setPosts([newPostItem, ...posts])
    setNewTitle('')
    setNewContent('')
    setShowNewPostModal(false)
  }

  return (
    <div className="community-hub-page">
      {/* 顶部标头 */}
      <header className="community-header">
        <div>
          <div className="comm-badge">CSCOPE ACADEMIC COMMUNITY</div>
          <h1>极客学术社区 · 考研与原理讨论广场</h1>
          <p className="comm-desc">
            汇聚全国计算机研友与底层原理极客，分享 408 核心真题解法、微观仿真推演心得与避坑指南。
          </p>
        </div>

        <button
          type="button"
          className="publish-post-btn"
          onClick={() => setShowNewPostModal(true)}
        >
          <span>✍️ 发起研讨 / 提问</span>
        </button>
      </header>

      {/* 选项卡 */}
      <div className="community-tab-bar">
        {[
          { key: 'all', label: '🔥 综合热门' },
          { key: 'arch', label: '💻 计组微架构' },
          { key: 'os', label: '⚙️ 操作系统内核' },
          { key: 'net', label: '🌐 计算机网络' },
          { key: 'ds', label: '🌲 算法与数据结构' }
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            className={`comm-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 帖子流 */}
      <div className="community-post-stream">
        {posts.map((post) => (
          <article key={post.id} className="post-card">
            <div className="post-header">
              <div className="post-author-box">
                <div className="author-avatar">{post.avatar}</div>
                <div className="author-meta">
                  <strong>{post.author}</strong>
                  <span>{post.time}</span>
                </div>
              </div>
              <span className="post-tag-badge">{post.tag}</span>
            </div>

            <h3 className="post-title">{post.title}</h3>
            <p className="post-body">{post.content}</p>

            {/* 实验直达小插槽 */}
            {post.labId && (
              <div className="post-lab-badge" onClick={() => onOpenExperiment(post.labId)}>
                <span className="lab-badge-icon">🧪</span>
                <span>相关微观实验：<strong>{post.labName}</strong></span>
                <span className="lab-badge-arrow">点击去推演 →</span>
              </div>
            )}

            <div className="post-footer">
              <button
                type="button"
                className={`post-action-btn like ${post.isLiked ? 'active' : ''}`}
                onClick={() => handleLike(post.id)}
              >
                <span>👍</span>
                <span>{post.likes} 赞同</span>
              </button>
              <button type="button" className="post-action-btn comment">
                <span>💬</span>
                <span>{post.comments} 讨论</span>
              </button>
              <button type="button" className="post-action-btn share">
                <span>↗</span>
                <span>分享</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* 发表讨论弹窗 */}
      {showNewPostModal && (
        <div className="comm-modal-overlay" onClick={() => setShowNewPostModal(false)}>
          <div className="comm-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="comm-modal-header">
              <h3>发起学术研讨 / 考点提问</h3>
              <button type="button" className="close-btn" onClick={() => setShowNewPostModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreatePost} className="comm-form">
              <div className="form-group">
                <label>所属学科标签</label>
                <select value={newTag} onChange={(e) => setNewTag(e.target.value)}>
                  <option value="408 计组">408 计算机组成原理</option>
                  <option value="408 操作系统">408 操作系统</option>
                  <option value="408 计算机网络">408 计算机网络</option>
                  <option value="408 数据结构">408 数据结构与算法</option>
                  <option value="微观仿真心得">微观仿真心得</option>
                </select>
              </div>

              <div className="form-group">
                <label>研讨主题标题</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="例如：关于 408 虚拟内存 TLB 与页表查询周期的疑惑..."
                  required
                />
              </div>

              <div className="form-group">
                <label>详细讨论内容与推演思考</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="写下你的疑问、推演步骤或对实验的发现..."
                  rows={4}
                  required
                />
              </div>

              <div className="comm-modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowNewPostModal(false)}>
                  取消
                </button>
                <button type="submit" className="submit-btn" disabled={!newTitle.trim() || !newContent.trim()}>
                  公开发表讨论 →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
