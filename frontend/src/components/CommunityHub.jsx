import React, { useState, useEffect } from 'react'
import { useLearningProfile } from './LearningProfileContext'

const STORAGE_COMMUNITY_POSTS = 'cscope_community_discussions_v3'

const INITIAL_POSTS = [
  {
    id: 'p_1',
    author: '陈学长 (408考研高分)',
    authorId: 'u_chen',
    avatar: '陈',
    role: '浙大计算机 408 考研 (136分)',
    time: '2 小时前',
    tag: '计组微架构',
    title: '【真题避坑】Cache 直接映射在什么情况下会发生 100% 全颠簸？',
    content: '做 2023 年计组真题时发现，很多同学把直接映射的缺失率算错了。如果循环里交替访问映射到同一 Cache 行的两个变量，由于容量虽然足够但行号冲突，每次访问都会把上一次的数据踢出，导致命中率为 0。建议大家去实验室的 Cache 映射沙盘调成直接映射单步跑一遍，瞬间豁然开朗！',
    likes: 128,
    likedUserIds: [],
    labId: 'cache-mapping',
    labName: 'Cache 组相联映射与命中实验',
    comments: [
      {
        id: 'c_1_1',
        author: '张伟 (浙大408考研冲刺)',
        authorId: 'u_zhangwei',
        avatar: '张',
        role: '计组突破组',
        time: '1 小时前',
        content: '2023 年统考那道大题我印象太深了！两个数组循环步长刚好是 Cache 行数的倍数，每次刚调入就被另一个变量踢出。在仿真沙盘里观察 Tag 与行索引变化，亲眼看到颠簸才真正理解为什么需要 2 路组相联！',
        likes: 19,
        likedUserIds: []
      },
      {
        id: 'c_1_2',
        author: '王助教 (计算机系研二)',
        authorId: 'u_wang',
        avatar: '王',
        role: '微架构领航员',
        time: '45 分钟前',
        content: '补充一点：改用 2 路组相联后，这两个变量虽然映射到同一个 Cache 组（Set），但组内有两个 Cache 行（Way），因此两个变量各占一行，命中率立刻从 0% 暴涨到接近 100%！这就是组相联抵抗颠簸的物理本质。',
        likes: 31,
        likedUserIds: []
      },
      {
        id: 'c_1_3',
        author: '李华 (跨考408主力军)',
        authorId: 'u_lihua',
        avatar: '李',
        role: '跨考一战成硕',
        time: '20 分钟前',
        content: '太及时了！感谢学长和助教，之前做选择题一直死记公式，看了沙盘的单步时钟打拍，终于把 Cache 映射和命中时间彻底理清了！',
        likes: 8,
        likedUserIds: []
      }
    ]
  },
  {
    id: 'p_2',
    author: 'OS 内核研究员',
    authorId: 'u_os_dev',
    avatar: '内',
    role: '操作系统原理硬核玩家',
    time: '4 小时前',
    tag: '操作系统内核',
    title: '【死锁判决】为什么每类资源有多实例时，资源分配图有环不一定死锁？',
    content: '很多教科书一笔带过，导致 408 选择题经常选错。“有环”在单实例资源下是死锁的充要条件，但在多实例下只是必要条件！因为环外的进程一旦运行完毕释放资源，就可以借给环内的进程打破死锁僵局。银行家算法就是在模拟这个资源回收推演过程。',
    likes: 96,
    likedUserIds: [],
    labId: 'deadlock',
    labName: '死锁：预防、避免与解除（银行家算法）',
    comments: [
      {
        id: 'c_2_1',
        author: '刘同学 (北航系统方向)',
        authorId: 'u_liu',
        avatar: '刘',
        role: 'OS并发死磕组',
        time: '3 小时前',
        content: '这个题眼太经典了！去年模考错了一大批人。记住口诀：单实例环充要，多实例环必要！多实例必须逐步化简资源分配图 RAG！',
        likes: 15,
        likedUserIds: []
      },
      {
        id: 'c_2_2',
        author: '操作系统小助教',
        authorId: 'u_ta_os',
        avatar: '助',
        role: '教研组核心',
        time: '2 小时前',
        content: '没错，银行家算法的安全序列存在性检验本质就是尝试将资源借给能完成的进程并全部收回，如果能收回所有资源就代表处于安全状态！在实验室的死锁沙盘里可以手动化简验证。',
        likes: 24,
        likedUserIds: []
      }
    ]
  },
  {
    id: 'p_3',
    author: '网络协议极客',
    authorId: 'u_net_geek',
    avatar: '网',
    role: '计网全栈极客',
    time: '昨天',
    tag: '计算机网络',
    title: '【协议精读】TCP 四次挥手中，客户端为什么要苦等 2MSL 才进入 CLOSED？',
    content: 'MSL（Maximum Segment Lifetime）是报文在网络中的最大寿命。客户端在发送最后一个 ACK 后，必须等待 2MSL：一是保证服务端能收到这个 ACK（若丢失，服务端会重传 FIN，客户端在 2MSL 内可以再次回复 ACK）；二是防止旧连接的报文段在网络中幽灵游荡出现在新连接中。',
    likes: 145,
    likedUserIds: [],
    labId: 'tcp-connection',
    labName: 'TCP 三次握手与四次挥手状态机',
    comments: [
      {
        id: 'c_3_1',
        author: '陈研友 (西电网络所)',
        authorId: 'u_xidian',
        avatar: '西',
        role: '网络协议考研党',
        time: '昨天 21:30',
        content: 'RFC 793 规定 MSL 常用 2 分钟或 30 秒，2MSL 刚好允许报文在往返途中迷途消失。否则新老连接端口复用时会出现混乱。',
        likes: 18,
        likedUserIds: []
      },
      {
        id: 'c_3_2',
        author: '高并发架构师老林',
        authorId: 'u_lin',
        avatar: '林',
        role: '后端架构技术专家',
        time: '昨天 22:10',
        content: '在生产环境中，TIME_WAIT 积累过多还会耗尽本地端口，通常要开启 tcp_tw_reuse 优化，统考真题里常结合套接字状态迁移来考。',
        likes: 27,
        likedUserIds: []
      }
    ]
  },
  {
    id: 'p_4',
    author: '小明同学',
    authorId: 'u_ming',
    avatar: '明',
    role: '数据结构攻坚手',
    time: '2 天前',
    tag: '算法与数据结构',
    title: '【树与平衡】AVL 树的 LR 旋转本质到底是怎么转的？',
    content: '以前死记硬背 LR 旋转，一考试就懵。今天在二叉树遍历实验里拖动滑块看了结点的左旋再右旋过程，原来就是把孙子结点提到爷爷结点的根位置！微观可视化真的比看黑白教材生动太多了。',
    likes: 82,
    likedUserIds: [],
    labId: 'tree-traversal',
    labName: '二叉树遍历与递归时序',
    comments: [
      {
        id: 'c_4_1',
        author: '算法狂热者',
        authorId: 'u_algo',
        avatar: '算',
        role: 'ACM 金牌选手',
        time: '2 天前',
        content: '先对左子树左旋，再对根节点右旋，本质就是在保持二叉搜索树中序遍历顺序不变的前提下完成树高的重新平衡！',
        likes: 22,
        likedUserIds: []
      }
    ]
  }
]

// 头像渲染安全组件：如果是图片链接则优雅渲染为圆角图片，若是纯字符/名称则提取精简单字徽章，彻底避免 URL 字符串溢出重叠
function AvatarBadge({ avatar, name, className = '' }) {
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setImgError(false)
  }, [avatar])

  const isUrl = typeof avatar === 'string' && (
    avatar.startsWith('http://') ||
    avatar.startsWith('https://') ||
    avatar.startsWith('data:') ||
    avatar.startsWith('/') ||
    avatar.includes('unsplash.com') ||
    avatar.length > 30
  )

  if (isUrl && !imgError) {
    return (
      <img
        src={avatar}
        alt={name || 'avatar'}
        className={`avatar-img-badge ${className}`.trim()}
        onError={() => setImgError(true)}
      />
    )
  }

  const fallbackText = (avatar && !isUrl ? avatar : (name || '研')).trim()
  const displayChar = fallbackText.length > 2 ? fallbackText.slice(0, 1) : fallbackText
  return <span className={`avatar-char-badge ${className}`.trim()}>{displayChar}</span>
}

export default function CommunityHub({ onOpenExperiment }) {
  const { user } = useLearningProfile()
  const currentUserId = user?.id || 'guest_user'
  const currentUserName = user?.name || '研友在线'
  const currentUserAvatar = user?.avatar || (user?.name ? user.name[0] : '研')
  const currentUserRole = user?.targetSchool ? `${user.targetSchool.slice(0, 8)} 研友` : '408 考研研学'

  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_COMMUNITY_POSTS)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch (e) {
      console.error('Failed to load community posts:', e)
    }
    return INITIAL_POSTS
  })

  const [activeTab, setActiveTab] = useState('all')
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newTag, setNewTag] = useState('计组微架构')

  // 展开讨论区的 post id 集合
  const [expandedPostIds, setExpandedPostIds] = useState(() => new Set(['p_1']))
  // 每个 post 独立的评论草稿
  const [replyInputs, setReplyInputs] = useState({})
  // 全局轻提示 Toast
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(''), 3200)
      return () => clearTimeout(timer)
    }
  }, [toastMsg])

  const showToast = (msg) => {
    setToastMsg(msg)
  }

  const savePostsToStorage = (newPosts) => {
    setPosts(newPosts)
    try {
      localStorage.setItem(STORAGE_COMMUNITY_POSTS, JSON.stringify(newPosts))
    } catch (e) {
      console.error('Failed to persist community posts:', e)
    }
  }

  // 切换折叠/展开讨论区
  const toggleComments = (postId) => {
    setExpandedPostIds(prev => {
      const next = new Set(prev)
      if (next.has(postId)) {
        next.delete(postId)
      } else {
        next.add(postId)
      }
      return next
    })
  }

  // 点赞主贴
  const handleLike = (id) => {
    const updated = posts.map(p => {
      if (p.id === id) {
        const liked = p.likedUserIds?.includes(currentUserId)
        const newLikedUserIds = liked
          ? (p.likedUserIds || []).filter(uid => uid !== currentUserId)
          : [...(p.likedUserIds || []), currentUserId]
        return {
          ...p,
          likes: liked ? Math.max(0, p.likes - 1) : p.likes + 1,
          likedUserIds: newLikedUserIds,
          isLiked: !liked
        }
      }
      return p
    })
    savePostsToStorage(updated)
  }

  // 点赞某条评论
  const handleLikeComment = (postId, commentId) => {
    const updated = posts.map(p => {
      if (p.id === postId) {
        const comments = (p.comments || []).map(c => {
          if (c.id === commentId) {
            const liked = c.likedUserIds?.includes(currentUserId)
            const newLikedUserIds = liked
              ? (c.likedUserIds || []).filter(uid => uid !== currentUserId)
              : [...(c.likedUserIds || []), currentUserId]
            return {
              ...c,
              likes: liked ? Math.max(0, c.likes - 1) : c.likes + 1,
              likedUserIds: newLikedUserIds
            }
          }
          return c
        })
        return { ...p, comments }
      }
      return p
    })
    savePostsToStorage(updated)
  }

  // 提交对某篇帖子的评论（支持任意账号登录后发表并同步）
  const handleAddComment = (postId) => {
    const text = (replyInputs[postId] || '').trim()
    if (!text) return

    const newComment = {
      id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      author: currentUserName,
      authorId: currentUserId,
      avatar: currentUserAvatar,
      role: currentUserRole,
      time: '刚刚',
      content: text,
      likes: 0,
      likedUserIds: []
    }

    const updated = posts.map(p => {
      if (p.id === postId) {
        const comments = [...(p.comments || []), newComment]
        return {
          ...p,
          comments
        }
      }
      return p
    })

    savePostsToStorage(updated)
    setReplyInputs(prev => ({ ...prev, [postId]: '' }))
    showToast(`✓ 已以【${currentUserName}】身份发表研讨见解！`)
  }

  // 点击“回复”某人时在输入框填入 @用户名
  const handleReplyToAuthor = (postId, targetAuthor) => {
    setReplyInputs(prev => {
      const current = prev[postId] || ''
      const prefix = `@${targetAuthor} `
      if (current.includes(prefix)) return prev
      return { ...prev, [postId]: `${prefix}${current}` }
    })
    // 确保讨论区是展开的
    setExpandedPostIds(prev => new Set(prev).add(postId))
  }

  // 分享帖子
  const handleSharePost = (post) => {
    const shareText = `【408 核心研讨】${post.title}
📚 所属学科：${post.tag} | 发起人：${post.author}
💡 核心思考：${post.content}
${post.labName ? `🔬 联动微观仿真：${post.labName} (http://localhost:5173/#/lab/${post.labId})` : ''}
🔗 来自 CScope 计算机微观计算架构与 408 考研平台研学社区`

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        showToast('✓ 研讨卡片已复制到剪贴板！可粘贴分享至考研讨论群或个人笔记。')
      }).catch(() => {
        showToast('✓ 已生成研讨卡片分享内容！')
      })
    } else {
      showToast('✓ 研讨卡片已就绪！')
    }
  }

  // 发布全新学术研讨主题
  const handleCreatePost = (e) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) return

    const newPostItem = {
      id: `post_${Date.now()}`,
      author: currentUserName,
      authorId: currentUserId,
      avatar: currentUserAvatar,
      role: currentUserRole,
      time: '刚刚',
      tag: newTag,
      title: newTitle.trim(),
      content: newContent.trim(),
      likes: 1,
      likedUserIds: [currentUserId],
      isLiked: true,
      comments: [
        {
          id: `c_auto_${Date.now()}`,
          author: 'CScope 领航私教',
          authorId: 'u_system_ai',
          avatar: 'CS',
          role: '408 全天候伴学智库',
          time: '刚刚',
          content: '已收录该研讨问题至 408 知识图谱。建议结合底层时序推演与状态机验证，欢迎大家参与讨论与补充题眼解法！',
          likes: 2,
          likedUserIds: []
        }
      ]
    }

    const updated = [newPostItem, ...posts]
    savePostsToStorage(updated)
    setNewTitle('')
    setNewContent('')
    setShowNewPostModal(false)
    // 默认展开新发布的帖子的讨论区
    setExpandedPostIds(prev => new Set(prev).add(newPostItem.id))
    showToast(`✓ 已以【${currentUserName}】身份成功发起学术研讨主题！`)
  }

  // 选项卡筛选
  const filteredPosts = posts.filter(post => {
    if (activeTab === 'all') return true
    if (activeTab === 'arch') return post.tag.includes('计组') || post.tag.includes('微架构')
    if (activeTab === 'os') return post.tag.includes('操作') || post.tag.includes('并发') || post.tag.includes('内核')
    if (activeTab === 'net') return post.tag.includes('网络') || post.tag.includes('协议')
    if (activeTab === 'ds') return post.tag.includes('数据结构') || post.tag.includes('算法') || post.tag.includes('树')
    return true
  })

  return (
    <div className="community-hub-page">
      {/* 顶部全局浮动 Toast */}
      {toastMsg && (
        <div className="community-toast-banner">
          <span className="toast-icon">✨</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 顶部标头 */}
      <header className="community-header">
        <div>
          <div className="comm-badge">CSCOPE ACADEMIC COMMUNITY</div>
          <h1>极客学术社区 · 考研与原理讨论广场</h1>
          <p className="comm-desc">
            汇聚全国计算机研友与底层原理极客，分享 408 核心真题解法、微观仿真推演心得与避坑指南。支持跨账号自由交流互动。
          </p>
        </div>

        <button
          type="button"
          className="publish-post-btn"
          onClick={() => setShowNewPostModal(true)}
        >
          <span>✍️ 发起学术研讨</span>
        </button>
      </header>

      {/* 选项卡 */}
      <div className="community-tab-bar">
        {[
          { key: 'all', label: '综合热门' },
          { key: 'arch', label: '计组微架构' },
          { key: 'os', label: '操作系统内核' },
          { key: 'net', label: '计算机网络' },
          { key: 'ds', label: '算法与数据结构' }
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

      {/* 当前登录身份提醒条 */}
      <div className="community-current-user-strip">
        <span className="strip-label">当前讨论发言身份：</span>
        <div className="strip-user-badge">
          <span className="strip-avatar"><AvatarBadge avatar={currentUserAvatar} name={currentUserName} /></span>
          <strong className="strip-name">{currentUserName}</strong>
          <span className="strip-role">({currentUserRole})</span>
        </div>
        <span className="strip-tips">💡 切换账号登录后发表的评论将全部沉淀存档，支持多账号互见研学观点</span>
      </div>

      {/* 帖子流 */}
      <div className="community-post-stream">
        {filteredPosts.map((post) => {
          const isLikedByMe = post.likedUserIds?.includes(currentUserId) || post.isLiked
          const isCommentsOpen = expandedPostIds.has(post.id)
          const commentList = post.comments || []
          const commentCount = commentList.length

          return (
            <article key={post.id} className="post-card">
              <div className="post-header">
                <div className="post-author-box">
                  <div className="author-avatar"><AvatarBadge avatar={post.avatar} name={post.author} /></div>
                  <div className="author-meta">
                    <strong>{post.author}</strong>
                    <span>{post.time} {post.role ? `· ${post.role}` : ''}</span>
                  </div>
                </div>
                <span className="post-tag-badge">{post.tag}</span>
              </div>

              <h3 className="post-title">{post.title}</h3>
              <p className="post-body">{post.content}</p>

              {/* 实验直达小插槽 */}
              {post.labId && (
                <div className="post-lab-badge" onClick={() => onOpenExperiment && onOpenExperiment(post.labId)}>
                  <span className="lab-badge-icon">联动实验</span>
                  <span>相关微观实验：<strong>{post.labName}</strong></span>
                  <span className="lab-badge-arrow">点击去推演 →</span>
                </div>
              )}

              {/* 卡片底栏操作按钮：赞同、讨论展开、分享 */}
              <div className="post-footer">
                <button
                  type="button"
                  className={`post-action-btn like ${isLikedByMe ? 'active' : ''}`}
                  onClick={() => handleLike(post.id)}
                  title={isLikedByMe ? '取消赞同' : '赞同此研讨主题'}
                >
                  <span className="action-icon">👍</span>
                  <span className="action-label">赞同</span>
                  <strong>{post.likes}</strong>
                </button>

                <button
                  type="button"
                  className={`post-action-btn comment ${isCommentsOpen ? 'active' : ''}`}
                  onClick={() => toggleComments(post.id)}
                  title="展开或折叠研学讨论区"
                >
                  <span className="action-icon">💬</span>
                  <span className="action-label">{isCommentsOpen ? '收起讨论' : '讨论'}</span>
                  <strong>{commentCount}</strong>
                </button>

                <button
                  type="button"
                  className="post-action-btn share"
                  onClick={() => handleSharePost(post)}
                  title="一键提取研讨卡片并复制分享文本"
                >
                  <span className="action-icon">↗</span>
                  <span className="action-label">分享卡片</span>
                </button>
              </div>

              {/* 核心拓展：嵌套内联讨论区 (Comments Thread) */}
              {isCommentsOpen && (
                <div className="post-comments-section">
                  <div className="comments-section-title-row">
                    <h4>研友深度研讨 ({commentCount})</h4>
                    <span className="comments-subnote">欢迎各高校研友结合真题与底层实验各抒己见</span>
                  </div>

                  {/* 评论发布输入区 */}
                  <div className="comment-composer-box">
                    <div className="composer-avatar"><AvatarBadge avatar={currentUserAvatar} name={currentUserName} /></div>
                    <div className="composer-main">
                      <div className="composer-user-hint">
                        <span>作为 <strong>{currentUserName}</strong> 发表研学见解：</span>
                      </div>
                      <div className="composer-input-row">
                        <textarea
                          className="composer-textarea"
                          rows={2}
                          value={replyInputs[post.id] || ''}
                          onChange={(e) => setReplyInputs({ ...replyInputs, [post.id]: e.target.value })}
                          placeholder={`写下你的解题思路、仿真观察或针对 ${post.author} 的提问... (Enter 换行)`}
                        />
                        <button
                          type="button"
                          className="composer-submit-btn"
                          disabled={!(replyInputs[post.id] || '').trim()}
                          onClick={() => handleAddComment(post.id)}
                        >
                          发表回复
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 评论列表 */}
                  <div className="comments-stream-list">
                    {commentList.length === 0 ? (
                      <div className="no-comments-tip">
                        <span>🌱</span> 暂无研学见解，快来发表全场第一条真题分析吧！
                      </div>
                    ) : (
                      commentList.map((comm) => {
                        const isCommLiked = comm.likedUserIds?.includes(currentUserId)
                        return (
                          <div key={comm.id} className="comment-thread-item">
                            <div className="comment-author-avatar"><AvatarBadge avatar={comm.avatar} name={comm.author} /></div>
                            <div className="comment-content-col">
                              <div className="comment-head-line">
                                <strong className="comment-author-name">{comm.author}</strong>
                                {comm.role && <span className="comment-role-tag">{comm.role}</span>}
                                <span className="comment-time-tag">{comm.time}</span>
                              </div>

                              <p className="comment-body-text">{comm.content}</p>

                              <div className="comment-actions-bar">
                                <button
                                  type="button"
                                  className={`comment-sub-btn like ${isCommLiked ? 'active' : ''}`}
                                  onClick={() => handleLikeComment(post.id, comm.id)}
                                >
                                  <span>👍</span>
                                  <span>{comm.likes || 0}</span>
                                </button>
                                <button
                                  type="button"
                                  className="comment-sub-btn reply"
                                  onClick={() => handleReplyToAuthor(post.id, comm.author)}
                                >
                                  <span>回复</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </div>

      {/* 发起学术研讨弹窗 */}
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
                  <option value="计组微架构">408 计算机组成原理 · 微架构</option>
                  <option value="操作系统内核">408 操作系统 · 进程与虚存</option>
                  <option value="计算机网络">408 计算机网络 · 协议状态机</option>
                  <option value="算法与数据结构">408 数据结构与算法 · 树图排序</option>
                  <option value="微观仿真心得">计算机微观仿真实验室打拍心得</option>
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
                  placeholder="写下你的疑问、推演步骤或对微观仿真实验的发现..."
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
