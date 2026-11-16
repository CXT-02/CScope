import React from 'react'

export default function SidebarNav({
  activeKey, // 'console' | 'checkin' | 'courses' | 'workshop' | 'exam' | 'mistakes' | 'cheatsheet' | 'aitutor' | 'profile' | 'analytics' | 'community'
  collapsed,
  onToggleCollapse,
  onSelectNav,
  user,
  onLogout
}) {
  const navSections = [
    {
      sectionTitle: '核心研习',
      items: [
        {
          key: 'console',
          label: '控制台总览',
          sub: '学情看板与推荐',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
          )
        },
        {
          key: 'checkin',
          label: '研习打卡',
          sub: '脑力能耗管理',
          badge: '今日',
          badgeClass: 'green-badge',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          )
        },
        {
          key: 'courses',
          label: '课程知识中心',
          sub: '8门专业课大纲',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          )
        },
        {
          key: 'workshop',
          label: '微观仿真工坊',
          sub: '25门底层时钟实验',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 2v7.31M14 9.3V1.99M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0" />
              <path d="M5.52 16h12.96" />
            </svg>
          )
        }
      ]
    },
    {
      sectionTitle: '408 考研测评与消错',
      items: [
        {
          key: 'exam',
          label: '408 智能测评',
          sub: '105题历年真题抽测',
          badge: 'HOT',
          badgeClass: 'red-badge',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          )
        },
        {
          key: 'mistakes',
          label: '靶向错题本',
          sub: '实验联动消错',
          badge: '提分',
          badgeClass: 'purple-badge',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          )
        },
        {
          key: 'cheatsheet',
          label: '408 速查宝典',
          sub: '必考公式与测算',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          )
        }
      ]
    },
    {
      sectionTitle: 'AI 伴学与个性化',
      items: [
        {
          key: 'aitutor',
          label: 'AI 计算机私教',
          sub: 'DeepSeek-R1 推理',
          badge: 'AI',
          badgeClass: 'ai-gold-badge',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M9 10h.01M15 10h.01" />
              <path d="M9.5 15a3.5 3.5 0 0 0 5 0" />
            </svg>
          )
        },
        {
          key: 'profile',
          label: '个人中心与设置',
          sub: '资料·安全·偏好',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )
        },
        {
          key: 'analytics',
          label: '学情数据画像',
          sub: '掌握度雷达分析',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          )
        },
        {
          key: 'community',
          label: '极客研学社区',
          sub: '408考友研讨广场',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          )
        }
      ]
    }
  ]

  return (
    <aside className={`cscope-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      {/* 侧边栏顶部品牌 */}
      <div className="sidebar-brand-wrapper">
        <div className="sidebar-brand-logo" onClick={() => onSelectNav('console')}>
          <span className="brand-avatar-badge">CS</span>
          {!collapsed && (
            <div className="brand-text-block">
              <span className="brand-title">CScope 领航者</span>
              <span className="brand-sub">计算机微观仿真实验室</span>
            </div>
          )}
        </div>
      </div>

      {/* 中部导航菜单 */}
      <nav className="sidebar-menu-list">
        {navSections.map((sec, sIdx) => (
          <div key={sIdx} className="sidebar-section-group">
            {!collapsed && <div className="sidebar-section-title">{sec.sectionTitle}</div>}
            {sec.items.map((item) => {
              const isActive =
                activeKey === item.key ||
                (item.key === 'courses' && activeKey === 'course') ||
                (item.key === 'workshop' && activeKey === 'lab')
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectNav(item.key)}
                  title={collapsed ? `${item.label} (${item.sub})` : undefined}
                >
                  <div className="nav-item-icon">{item.icon}</div>
                  {!collapsed && (
                    <div className="nav-item-label-group">
                      <div className="nav-item-main-row">
                        <span className="nav-item-name">{item.label}</span>
                        {item.badge && (
                          <span className={`nav-item-badge ${item.badgeClass || ''}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="nav-item-sub">{item.sub}</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* 底部：大模型接入状态徽章 */}
      {!collapsed && (
        <div className="sidebar-ai-engine-card">
          <div className="ai-chip-header">
            <span className="ai-tag-gold">大模型已接入</span>
            <span className="ai-pulse-dot" />
          </div>
          <div className="ai-model-info">
            <strong>模型：DeepSeek-R1</strong>
            <p>408 认知推演与微观实验 Agent 已就绪</p>
          </div>
        </div>
      )}

      {/* 侧栏底部用户与收起控制 */}
      <div className="sidebar-footer">
        <button
          type="button"
          className="sidebar-collapse-toggle"
          onClick={onToggleCollapse}
          title={collapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {!collapsed && <span>收起侧栏</span>}
        </button>

        {user && (
          <div
            className="sidebar-user-card"
            onClick={() => onSelectNav('profile')}
            style={{ cursor: 'pointer' }}
            title="点击前往个人中心"
          >
            <div className="sidebar-user-avatar">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                user.name.slice(0, 1).toUpperCase()
              )}
            </div>
            {!collapsed && (
              <div className="sidebar-user-info">
                <span className="sidebar-user-name" title={user.name}>{user.name}</span>
                <span className="sidebar-user-tag">{user.major ? `${user.major.slice(0, 4)}·在线` : '408研习中'}</span>
              </div>
            )}
            {!collapsed && (
              <button
                type="button"
                className="sidebar-logout-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onLogout()
                }}
                title="退出当前登录"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
