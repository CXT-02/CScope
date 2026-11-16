import React, { useState } from 'react'
import { useLearningProfile } from './LearningProfileContext'

export default function LoginGate({ onLoginSuccess }) {
  const { users, login, register } = useLearningProfile()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('请输入学习昵称或学号')
      return
    }
    if (!pin) {
      setError('请输入 4～8 位学习密码')
      return
    }

    setBusy(true)
    try {
      if (mode === 'login') {
        // 尝试登录；如果用户尚未注册且仅有该输入，智能提示或辅助注册
        const userExists = users.some(u => u.name.toLocaleLowerCase() === name.trim().toLocaleLowerCase())
        if (!userExists) {
          // 提示用户或引导注册
          try {
            await register(name, pin)
            if (onLoginSuccess) onLoginSuccess()
            return
          } catch (regErr) {
            setError(regErr.message || '该账号尚未注册，已尝试为您快速创建账户失败，请检查输入')
            return
          }
        }
        await login(name, pin)
      } else {
        await register(name, pin)
      }
      if (onLoginSuccess) onLoginSuccess()
    } catch (err) {
      setError(err.message || '操作失败，请重试')
    } finally {
      setBusy(false)
    }
  }

  // 快捷示范账户一键登入
  const handleQuickLogin = async (demoName, demoPin) => {
    setError('')
    setBusy(true)
    try {
      const userExists = users.some(u => u.name.toLocaleLowerCase() === demoName.toLocaleLowerCase())
      if (userExists) {
        try {
          await login(demoName, demoPin)
        } catch {
          // 若之前密码被修改，直接用新名字注册
          await login(demoName, demoPin)
        }
      } else {
        await register(demoName, demoPin)
      }
      if (onLoginSuccess) onLoginSuccess()
    } catch (err) {
      // 容错处理
      try {
        await register(`${demoName}_${Math.floor(Math.random() * 900 + 100)}`, demoPin)
        if (onLoginSuccess) onLoginSuccess()
      } catch (err2) {
        setError(err2.message || '快捷登录异常')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-gate-container">
      <div className="login-gate-bg-glow glow-1" />
      <div className="login-gate-bg-glow glow-2" />

      <div className="login-gate-shell">
        {/* 左侧：学术质感展示与实验室亮点 */}
        <div className="login-gate-intro">
          <div className="login-brand-header-block">
            <div className="login-brand-sub-badge">
              <span className="brand-dot" />
              <span>COMPUTATIONAL ARCHITECTURE LAB</span>
            </div>
            <h1 className="login-platform-brand-name">
              <span className="brand-en">CSCOPE</span>
              <span className="brand-sep">·</span>
              <span className="brand-cn">计算机微观仿真与 408 测评实验室</span>
            </h1>
          </div>

          <h2 className="login-hero-title">
            把看不见的计算过程，<br />
            变成<span className="title-highlight">可以操作的实验</span>。
          </h2>

          <p className="login-hero-desc">
            从注意力机制、数据结构到操作系统与计算机网络，让抽象概念按步骤运行；
            内置 <strong>105 道历年 408 统考真题</strong> 与精准仿真映射，登录后为您建立终身学情画像与靶向诊断。
          </p>

          <div className="login-feature-list">
            <div className="feature-item">
              <div className="feature-icon-box" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 2v7.31M14 9.3V1.99M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0" />
                  <path d="M5.52 16h12.96" />
                </svg>
              </div>
              <div className="feature-text">
                <strong>25 个深度交互仿真实验</strong>
                <p>五级时钟流水线、Cache 组相联映射、死锁银行家推演、TCP 拥塞滑动窗口</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <div className="feature-text">
                <strong>105 道 408 历年考研统考真题库</strong>
                <p>覆盖计组、操作系统、计网、数据结构，智能答题计时，错题一键直达实验验证</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 20V10M12 20V4M6 20v-6" />
                </svg>
              </div>
              <div className="feature-text">
                <strong>个性化智能学情看板</strong>
                <p>知识点掌握度雷达、历史模考记录复盘、AI 靶向薄弱点学习建议</p>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：高雅温润的登录与建档卡片 */}
        <div className="login-card-wrapper">
          <div className="login-card">
            <div className="login-card-header">
              <div className="login-card-avatar-pill">
                <span className="avatar-core">CS</span>
                <span className="avatar-status-dot" />
              </div>
              <div className="login-badge-label">PERSONAL LEARNING GATEWAY</div>
              <h2 className="login-card-title">
                {mode === 'login' ? '开启您的个性化学习工作台' : '注册专属学情档案'}
              </h2>
              <p className="login-card-subtitle">
                登录后将持续记录您的实验推演、408 测评成绩与个性化推荐路径。
              </p>
            </div>

            {/* 快速体验通道 */}
            <div className="quick-demo-section">
              <div className="quick-demo-title">
                <span>⚡ 评审与快速体验通道（免手动输入）</span>
              </div>
              <div className="quick-demo-buttons">
                <button
                  type="button"
                  className="quick-demo-btn primary"
                  disabled={busy}
                  onClick={() => handleQuickLogin('小明同学', '123456')}
                >
                  <span className="btn-role">408 研习学者</span>
                  <strong>小明同学</strong>
                  <span className="btn-action">一键登入 →</span>
                </button>
              </div>
            </div>

            <div className="login-divider">
              <span>或输入个人账号与密码</span>
            </div>

            {/* 切换登录 / 注册 Tab */}
            <div className="login-mode-tabs">
              <button
                type="button"
                className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
                onClick={() => { setMode('login'); setError('') }}
              >
                账号登录
              </button>
              <button
                type="button"
                className={`tab-btn ${mode === 'register' ? 'active' : ''}`}
                onClick={() => { setMode('register'); setError('') }}
              >
                新建学籍档案
              </button>
            </div>

            {/* 表单 */}
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="userNameInput">
                  <span>学习昵称 / 学号</span>
                  <span className="field-hint">用于生成专属分析看板</span>
                </label>
                <div className="input-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    id="userNameInput"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例如：小明同学 或 20260408"
                    maxLength={20}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="userPinInput">
                  <span>学习密码</span>
                  <span className="field-hint">4～8 位数字</span>
                </label>
                <div className="input-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="userPinInput"
                    type="password"
                    inputMode="numeric"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="请输入 4~8 位数字密码"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {error && (
                <div className="login-error-alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="login-submit-btn"
                disabled={busy || !name.trim() || !pin}
              >
                {busy ? (
                  <span className="btn-loading">正在核验学情档案...</span>
                ) : mode === 'login' ? (
                  <span>进入 CSCOPE 学习控制台 →</span>
                ) : (
                  <span>创建专属档案并登录 →</span>
                )}
              </button>
            </form>

            <div className="login-security-notice">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>本地安全沙箱存储 · 保持登录态直至主动登出 · 保护隐私不上传外网</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
