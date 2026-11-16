import React from 'react'

export default function SidebarNav({
  activeKey, // 'console' | 'courses' | 'exam' | 'profile' | 'lab'
  collapsed,
  onToggleCollapse,
  onSelectNav,
  user,
  onLogout
}) {
  const navItems = [
    {
      key: 'console',
      label: '控制台',
      sub: '综合概览与导学',
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
      key: 'courses',
      label: '课程知识中心',
      sub: '8门核心课知识地图',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )
    },
    {
      key: 'exam',
      label: '408 考研智能测评',
      sub: '105题历年真题抽取',
      badge: 'HOT',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      )
    },
    {
      key: 'profile',
      label: '学情画像与档案',
      sub: '成长轨迹与诊断',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      )
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
              <span className="brand-sub">计算机仿真控制台</span>
            </div>
          )}
        </div>
      </div>

      {/* 中部导航菜单 */}
      <nav className="sidebar-menu-list">
        {navItems.map((item) => {
          const isActive = activeKey === item.key || (item.key === 'courses' && activeKey === 'lab')
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
                    {item.badge && <span className="nav-item-badge">{item.badge}</span>}
                  </div>
                  <span className="nav-item-sub">{item.sub}</span>
                </div>
              )}
            </button>
          )
        })}
      </nav>

      {/* 底部折叠与用户状态 */}
      <div className="sidebar-footer">
        {/* 折叠收起按钮 */}
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

        {/* 当前登录用户信息卡 */}
        {user && (
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="sidebar-user-info">
                <span className="sidebar-user-name" title={user.name}>{user.name}</span>
                <span className="sidebar-user-tag">在线学习中</span>
              </div>
            )}
            {!collapsed && (
              <button
                type="button"
                className="sidebar-logout-btn"
                onClick={onLogout}
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
