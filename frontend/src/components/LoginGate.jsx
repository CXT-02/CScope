import React, { useState, useRef } from 'react'
import { useLearningProfile } from './LearningProfileContext'
import { useTheme } from './ThemeContext'
import ThemePicker from './ThemePicker'

export default function LoginGate({ onLoginSuccess }) {
  const { theme } = useTheme()
  const { users, login, register, resetPasswordWithSecurity, deleteUser } = useLearningProfile()
  
  // 视图控制：'landing' (居中首页/概览展示) | 'auth' (跳转进入登录/注册专区)
  const [view, setView] = useState('landing')
  const [mode, setMode] = useState('login') // 'login' | 'register' | 'forgot'
  
  const [name, setName] = useState(users[0]?.name || '小明同学')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [busy, setBusy] = useState(false)

  // 忘记密码找回表单
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [newResetPin, setNewResetPin] = useState('')

  // 注册拓展字段
  const [regIsTakingExam, setRegIsTakingExam] = useState('yes')
  const [regExamYear, setRegExamYear] = useState('2026')
  const [regTargetSchool, setRegTargetSchool] = useState('浙江大学 · 计算机科学与技术 (408专硕)')

  const pinInputRef = useRef(null)

  // 打开登录界面并聚焦
  const handleOpenAuth = (targetMode = 'login', targetUserName = null) => {
    setMode(targetMode)
    setError('')
    setSuccessMsg('')
    if (targetUserName) {
      setName(targetUserName)
      setPin('')
    }
    setView('auth')
    setTimeout(() => {
      if (pinInputRef.current) {
        pinInputRef.current.focus()
      }
    }, 100)
  }

  // 点击已有学者档案卡片，自动填入姓名并聚焦密码输入框
  const handleSelectAccount = (userName) => {
    setName(userName)
    setPin('')
    setError('')
    setSuccessMsg('')
    if (pinInputRef.current) {
      pinInputRef.current.focus()
    }
  }

  // 提交登录 / 注册
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!name.trim()) {
      setError('请输入学习昵称或学号')
      return
    }
    if (!pin) {
      setError('请输入学习密码（必填项，初始密码默认为 123456）')
      return
    }

    setBusy(true)
    try {
      if (mode === 'login') {
        await login(name, pin)
        if (onLoginSuccess) onLoginSuccess()
      } else if (mode === 'register') {
        if (pin.length < 4) {
          setError('学习密码至少需要 4 位数字')
          setBusy(false)
          return
        }
        if (pin !== confirmPin) {
          setError('两次输入的新密码不一致，请核对')
          setBusy(false)
          return
        }
        await register(name, pin, {
          isTakingExam: regIsTakingExam,
          examYear: regExamYear,
          targetSchool: regTargetSchool
        })
        if (onLoginSuccess) onLoginSuccess()
      }
    } catch (err) {
      setError(err.message || '操作失败，请核对后重试')
    } finally {
      setBusy(false)
    }
  }

  // 安全问题找回密码
  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    if (!name.trim()) {
      setError('请输入要找回密码的学者昵称')
      return
    }
    if (!securityAnswer.trim()) {
      setError('请输入安全问题答案（默认问题为“我最喜欢的计算机先驱是谁？”，答案“图灵”）')
      return
    }
    if (!newResetPin || newResetPin.length < 4) {
      setError('新密码需为 4～8 位数字')
      return
    }
    setBusy(true)
    try {
      await resetPasswordWithSecurity(name, securityAnswer, newResetPin)
      setSuccessMsg('密码重置成功！请使用新密码立即登录')
      setPin(newResetPin)
      setMode('login')
    } catch (err) {
      setError(err.message || '找回失败，请检查答案')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-gate-container" data-theme={theme}>
      {/* 顶部右上角主题自由切换 */}
      <div className="login-gate-top-bar">
        <ThemePicker />
      </div>

      <div className="login-gate-bg-glow glow-1" />
      <div className="login-gate-bg-glow glow-2" />

      {/* 视图一：居中展示实验室亮点与品牌英雄区 */}
      {view === 'landing' ? (
        <div className="login-gate-shell landing-center-shell">
          <div className="landing-center-hero">
            {/* 顶栏学术/科技胶囊微标 */}
            <div className="login-brand-sub-badge">
              <span className="brand-dot" />
              <span>COMPUTATIONAL ARCHITECTURE LAB · 408 统考全真微观仿真</span>
            </div>

            {/* 超大设计字号品牌标题 */}
            <h1 className="login-platform-brand-name hero-centered-brand">
              <span className="brand-en">CSCOPE</span>
              <span className="brand-sep">·</span>
              <span className="brand-cn">计算机微观仿真实验室</span>
            </h1>

            {/* 核心副标题 */}
            <h2 className="login-hero-title hero-centered-subtitle">
              把看不见的计算过程，变成<span className="title-highlight">可以操作的实验</span>。
            </h2>

            {/* 3 个特色方框亮点（响应式三栏横向网格） */}
            <div className="login-feature-grid">
              <div className="feature-item">
                <div className="feature-icon-box" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 2v7.31M14 9.3V1.99M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0" />
                    <path d="M5.52 16h12.96" />
                  </svg>
                </div>
                <div className="feature-text">
                  <strong>25 个底层时钟微观仿真沙盒</strong>
                  <p>单步观察晶振打拍、RAW 数据冒险前递停顿、银行家算法安全序列</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
                <div className="feature-text">
                  <strong>105 道 408 统考全真题库</strong>
                  <p>覆盖计组、操作系统、计网、数据结构，做错题目直接一键唤醒实验验证</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 20V10M12 20V4M6 20v-6" />
                  </svg>
                </div>
                <div className="feature-text">
                  <strong>个性化考研目标与专属研学方案</strong>
                  <p>智能定制考情画像、目标院校专属提分路线、AI 私教 DeepSeek-R1 深度伴学</p>
                </div>
              </div>
            </div>

            {/* 核心操作区：居中放置登录与注册按键 */}
            <div className="landing-cta-block">
              <div className="landing-cta-buttons">
                <button
                  type="button"
                  className="landing-cta-btn primary"
                  onClick={() => handleOpenAuth('login')}
                >
                  <span className="cta-icon">🚀</span>
                  <span className="cta-text">账号登录 · 验证进入实验室</span>
                  <span className="cta-arrow">→</span>
                </button>

                <button
                  type="button"
                  className="landing-cta-btn secondary"
                  onClick={() => handleOpenAuth('register')}
                >
                  <span className="cta-icon">✨</span>
                  <span className="cta-text">新建学籍档案</span>
                </button>
              </div>

              {/* 若已有已建立的学者档案，展示快速直通提示条 */}
              {users.length > 0 && (
                <div className="landing-quick-hint">
                  <span className="quick-hint-label">检测到已建立研学档案：</span>
                  <button
                    type="button"
                    className="landing-quick-user-pill"
                    onClick={() => handleOpenAuth('login', users[0].name)}
                    title={`以【${users[0].name}】身份直接验证密码进入`}
                  >
                    <span className="quick-pill-avatar">
                      {users[0].avatar ? (
                        <img src={users[0].avatar} alt={users[0].name} />
                      ) : (
                        users[0].name.slice(0, 1)
                      )}
                    </span>
                    <strong>{users[0].name}</strong>
                    <span className="quick-pill-action">快速验证进入 →</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* 视图二：点击后跳转进入的居中登录 / 注册专区 */
        <div className="login-gate-shell auth-view-shell">
          {/* 返回概览导航条 */}
          <div className="auth-back-nav">
            <button
              type="button"
              className="auth-back-to-landing-btn"
              onClick={() => setView('landing')}
              title="返回实验室首页概览"
            >
              <span className="back-arrow">←</span>
              <span>返回实验室概览</span>
            </button>
          </div>

          <div className="login-card-wrapper">
            <div className="login-card">
              <div className="login-card-header">
                <div className="login-card-avatar-pill">
                  <span className="avatar-core">CS</span>
                  <span className="avatar-status-dot" />
                </div>
                <div className="login-badge-label">AUTHENTICATION & SECURITY GATEWAY</div>
                <h2 className="login-card-title">
                  {mode === 'login'
                    ? '登录您的专属研学档案'
                    : mode === 'register'
                    ? '注册专属学籍档案'
                    : '安全问题找回学习密码'}
                </h2>
                <p className="login-card-subtitle">
                  {mode === 'login'
                    ? '系统已严密加密保存您的密码。请输入密码以恢复您的学习进度与测评记录。'
                    : '建立您的终身学情画像，定制考研目标院校与个性化实验方案。'}
                </p>
              </div>

              {/* 已保存档案快捷选择条（点击后自动填入账号并聚焦密码框，必须输入密码） */}
              {mode === 'login' && users.length > 0 && (
                <div className="saved-accounts-section">
                  <div className="saved-accounts-label">
                    <span>选择已建立的研学档案（点击填入并验证密码）：</span>
                  </div>
                  <div className="saved-accounts-grid">
                    {users.map((u) => {
                      const isSelected = name.trim().toLowerCase() === u.name.trim().toLowerCase()
                      return (
                        <div
                          key={u.id}
                          className={`saved-account-chip ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelectAccount(u.name)}
                          title={`点击选择 ${u.name}，随后输入密码完成鉴权`}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="chip-avatar">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} />
                            ) : (
                              u.name.slice(0, 1).toUpperCase()
                            )}
                          </div>
                          <div className="chip-info">
                            <strong>{u.name}</strong>
                            <span>{u.targetSchool ? u.targetSchool.slice(0, 8) + '...' : u.major}</span>
                          </div>
                          {isSelected && <span className="chip-active-check">✓</span>}
                          {users.length > 1 && (
                            <button
                              type="button"
                              className="chip-delete-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (deleteUser) deleteUser(u.id)
                              }}
                              title="从列表中移除此档案"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 切换登录 / 注册 Tab */}
              <div className="login-mode-tabs">
                <button
                  type="button"
                  className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => {
                    setMode('login')
                    setError('')
                    setSuccessMsg('')
                  }}
                >
                  账号密码登录
                </button>
                <button
                  type="button"
                  className={`tab-btn ${mode === 'register' ? 'active' : ''}`}
                  onClick={() => {
                    setMode('register')
                    setError('')
                    setSuccessMsg('')
                  }}
                >
                  新建学籍档案
                </button>
              </div>

              {/* 找回密码提示条 */}
              {successMsg && <div className="login-alert-box success">{successMsg}</div>}
              {error && <div className="login-alert-box error">{error}</div>}

              {/* 登录 / 注册 表单 */}
              {mode !== 'forgot' ? (
                <form className="login-form" onSubmit={handleSubmit}>
                  {/* 账号/昵称输入 */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="userNameInput">
                      <span>学习昵称 / 学号 *</span>
                      <span className="field-hint">用于绑定个人学情与考研档案</span>
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
                        placeholder="例如：小明同学"
                        maxLength={20}
                        autoComplete="username"
                        required
                      />
                    </div>
                  </div>

                  {/* 学习密码输入（强制输入与验证） */}
                  <div className="form-group">
                    <div className="form-label-row">
                      <label className="form-label" htmlFor="userPinInput">
                        <span>学习密码 *</span>
                        <span className="field-hint">4～8 位数字（初始默认密码：123456）</span>
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          className="forgot-pwd-link"
                          onClick={() => {
                            setMode('forgot')
                            setError('')
                            setSuccessMsg('')
                          }}
                        >
                          忘记密码？
                        </button>
                      )}
                    </div>
                    <div className="input-wrap">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <input
                        ref={pinInputRef}
                        id="userPinInput"
                        type={showPin ? 'text' : 'password'}
                        inputMode="numeric"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        placeholder="请输入 4~8 位数字密码"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        className="pwd-toggle-btn"
                        onClick={() => setShowPin(!showPin)}
                        title={showPin ? '隐藏密码' : '显示密码'}
                      >
                        {showPin ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  {/* 注册专属表单项：确认密码与考研意向初设 */}
                  {mode === 'register' && (
                    <>
                      <div className="form-group">
                        <label className="form-label" htmlFor="userConfirmPinInput">
                          <span>确认学习密码 *</span>
                          <span className="field-hint">请再次输入密码进行确认</span>
                        </label>
                        <div className="input-wrap">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                          <input
                            id="userConfirmPinInput"
                            type={showPin ? 'text' : 'password'}
                            inputMode="numeric"
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                            placeholder="请再次确认 4~8 位数字密码"
                            autoComplete="new-password"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <span>是否考研规划</span>
                        </label>
                        <div className="reg-goal-chips">
                          <button
                            type="button"
                            className={`reg-chip ${regIsTakingExam === 'yes' ? 'active' : ''}`}
                            onClick={() => setRegIsTakingExam('yes')}
                          >
                            🎓 我要考研 (408/自命题)
                          </button>
                          <button
                            type="button"
                            className={`reg-chip ${regIsTakingExam === 'no' ? 'active' : ''}`}
                            onClick={() => setRegIsTakingExam('no')}
                          >
                            💼 暂不考研 (期末通关/工程实操)
                          </button>
                        </div>
                      </div>

                      {regIsTakingExam === 'yes' && (
                        <div className="form-dual-row-compact">
                          <div className="form-group">
                            <label className="form-label">考研届次</label>
                            <select
                              className="reg-select"
                              value={regExamYear}
                              onChange={(e) => setRegExamYear(e.target.value)}
                            >
                              <option value="2025">2025届 (复试冲刺)</option>
                              <option value="2026">2026届 (统考备战)</option>
                              <option value="2027">2027届 (提前打底)</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">目标院校</label>
                            <input
                              type="text"
                              className="reg-input"
                              value={regTargetSchool}
                              onChange={(e) => setRegTargetSchool(e.target.value)}
                              placeholder="如：浙江大学 / 清华大学"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <button
                    type="submit"
                    className="login-submit-btn"
                    disabled={busy || !name.trim() || !pin}
                  >
                    {busy
                      ? '正在严密核验中...'
                      : mode === 'login'
                      ? '验证密码并进入实验室 →'
                      : '创建档案并立即开启研学 →'}
                  </button>
                </form>
              ) : (
                /* 找回密码表单 */
                <form className="login-form forgot-form" onSubmit={handleForgotSubmit}>
                  <div className="form-group">
                    <label className="form-label">学者昵称 *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="输入要找回的昵称"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>安全问题答案 *</span>
                      <span className="field-hint">默认问题：“我最喜欢的计算机先驱是谁？”</span>
                    </label>
                    <input
                      type="text"
                      value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                      placeholder="输入答案（默认答案：图灵）"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">设置新密码 *</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      value={newResetPin}
                      onChange={(e) => setNewResetPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      placeholder="输入新的 4～8 位数字密码"
                      required
                    />
                  </div>

                  <div className="forgot-action-row">
                    <button
                      type="button"
                      className="forgot-back-btn"
                      onClick={() => {
                        setMode('login')
                        setError('')
                        setSuccessMsg('')
                      }}
                    >
                      ← 返回登录
                    </button>
                    <button type="submit" className="login-submit-btn flex-1" disabled={busy}>
                      {busy ? '正在重置...' : '重置密码并返回登录'}
                    </button>
                  </div>
                </form>
              )}

              <div className="login-card-footer">
                <span className="security-icon-dot">🛡️</span>
                <span>
                  密码采用 SHA-256 哈希加密存储于当前浏览器沙盒，严格密码认证保护您的研学档案。
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
