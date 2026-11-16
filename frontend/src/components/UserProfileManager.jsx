import React, { useState, useEffect } from 'react'
import { useLearningProfile } from './LearningProfileContext'

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80'
]

export default function UserProfileManager() {
  const { user, updateUserProfile, updatePassword, setSecurityQuestion } = useLearningProfile()

  // 账户主信息
  const [name, setName] = useState(user?.name || '林知远')
  const [email, setEmail] = useState(user?.email || 'learner@cscope.edu.cn')
  const [major, setMajor] = useState(user?.major || '网络工程')
  const [grade, setGrade] = useState(user?.grade || '本科三年级')
  const [targetSchool, setTargetSchool] = useState(user?.targetSchool || '浙江大学 · 计算机科学与技术 (408专硕)')
  const [bio, setBio] = useState(user?.bio || '热爱微观计算底层，攻克408统考全真实验！')
  const [avatar, setAvatar] = useState(user?.avatar || PRESET_AVATARS[0])
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [profileSavedToast, setProfileSavedToast] = useState(false)

  // 个性化服务偏好
  const [studyGoal, setStudyGoal] = useState(user?.studyGoal || '408 统考 125+ 冲刺')
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(user?.dailyGoalMinutes || 60)
  const [aiPreference, setAiPreference] = useState(user?.aiPreference || '严谨推导型 (深入微架构硬件细节与状态机)')
  const [autoWeakPush, setAutoWeakPush] = useState(true)

  // 安全问题
  const [question, setQuestion] = useState(user?.securityQuestion || '我最喜欢的计算机先驱是谁？')
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [securityMsg, setSecurityMsg] = useState({ text: '', type: '' })

  // 密码修改
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' })

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || `${user.name?.toLowerCase() || 'user'}@cscope.edu.cn`)
      setMajor(user.major || '计算机科学与技术')
      setGrade(user.grade || '本科三年级')
      setTargetSchool(user.targetSchool || '408 统考名校冲刺')
      setBio(user.bio || '热爱微观计算底层，构建学-练-测-诊一体化能力！')
      if (user.avatar) setAvatar(user.avatar)
      if (user.studyGoal) setStudyGoal(user.studyGoal)
      if (user.dailyGoalMinutes) setDailyGoalMinutes(user.dailyGoalMinutes)
      if (user.aiPreference) setAiPreference(user.aiPreference)
      if (user.securityQuestion) setQuestion(user.securityQuestion)
    }
  }, [user])

  // 保存资料
  const handleSaveProfile = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    updateUserProfile({
      name: name.trim(),
      email: email.trim(),
      major: major.trim(),
      grade: grade.trim(),
      targetSchool: targetSchool.trim(),
      bio: bio.trim(),
      avatar,
      studyGoal,
      dailyGoalMinutes: Number(dailyGoalMinutes),
      aiPreference,
      autoWeakPush
    })
    setProfileSavedToast(true)
    setTimeout(() => setProfileSavedToast(false), 3000)
  }

  // 保存安全问题
  const handleSaveSecurity = async (e) => {
    e.preventDefault()
    setSecurityMsg({ text: '', type: '' })
    if (!securityAnswer.trim()) {
      setSecurityMsg({ text: '请输入安全问题答案', type: 'error' })
      return
    }
    try {
      await setSecurityQuestion(question, securityAnswer)
      setSecurityAnswer('')
      setSecurityMsg({ text: '安全问题设置成功！已加密保存', type: 'success' })
      setTimeout(() => setSecurityMsg({ text: '', type: '' }), 3500)
    } catch (err) {
      setSecurityMsg({ text: err.message || '保存失败', type: 'error' })
    }
  }

  // 修改密码
  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setPasswordMsg({ text: '', type: '' })
    if (!oldPin) {
      setPasswordMsg({ text: '请输入当前密码', type: 'error' })
      return
    }
    if (!newPin || newPin.length < 4) {
      setPasswordMsg({ text: '新密码至少需要 4 位数字', type: 'error' })
      return
    }
    if (newPin !== confirmPin) {
      setPasswordMsg({ text: '两次输入的新密码不一致', type: 'error' })
      return
    }
    try {
      await updatePassword(oldPin, newPin)
      setOldPin('')
      setNewPin('')
      setConfirmPin('')
      setPasswordMsg({ text: '密码修改成功！当前登录态已同步维持', type: 'success' })
      setTimeout(() => setPasswordMsg({ text: '', type: '' }), 3500)
    } catch (err) {
      setPasswordMsg({ text: err.message || '密码修改失败', type: 'error' })
    }
  }

  return (
    <div className="user-profile-manager-page">
      {/* 顶部面包屑与在线状态 (与参考图一致) */}
      <div className="profile-manager-top-strip">
        <div className="top-breadcrumb">
          <span>智研知库</span>
          <span className="sep">/</span>
          <span>工作区</span>
          <span className="sep">/</span>
          <strong className="current">个人中心与学情档案</strong>
        </div>
        <div className="top-online-status">
          <span className="online-badge">
            <span className="dot" />
            <span>知识库在线</span>
          </span>
          <span className="sep-line">|</span>
          <span className="model-badge">DeepSeek 在线 &gt;</span>
        </div>
      </div>

      {/* 主栅格：左侧主账户资料卡片 + 右侧安全与密码设置卡片 */}
      <div className="profile-layout-grid">
        {/* 左侧大卡片：【账户信息 / 个人资料】 */}
        <section className="profile-card profile-main-card">
          <div className="card-header-bar">
            <div>
              <span className="card-eyebrow">PROFILE / 个人资料</span>
              <h2 className="card-main-title">账户信息</h2>
            </div>
            <button
              type="button"
              className="save-profile-btn"
              onClick={handleSaveProfile}
            >
              保存资料
            </button>
          </div>

          <form onSubmit={handleSaveProfile} className="profile-form-grid">
            {/* 头像区域 (与参考图一致) */}
            <div className="profile-avatar-row">
              <div className="avatar-img-box">
                <img src={avatar} alt="用户头像" className="user-avatar-preview" />
              </div>
              <div className="avatar-action-box">
                <button
                  type="button"
                  className="change-avatar-btn"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                >
                  更换头像
                </button>
                <span className="avatar-hint-text">PNG / JPG / WEBP 最大 2MB</span>
              </div>
            </div>

            {/* 头像选择抽屉 */}
            {showAvatarPicker && (
              <div className="avatar-preset-drawer">
                <span className="drawer-title">精选学者与极客头像库：</span>
                <div className="preset-avatar-list">
                  {PRESET_AVATARS.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="可选头像"
                      className={`preset-thumb ${avatar === url ? 'selected' : ''}`}
                      onClick={() => {
                        setAvatar(url)
                        setShowAvatarPicker(false)
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 昵称与账号 */}
            <div className="form-dual-row">
              <div className="form-field-item">
                <div className="label-with-counter">
                  <label htmlFor="user_nickname">昵称 *</label>
                  <span className="counter-tag">{name.length} / 100</span>
                </div>
                <input
                  id="user_nickname"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-field-item">
                <label>账号</label>
                <input
                  type="text"
                  value={user?.account || `cs_${name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'learner'}`}
                  disabled
                  className="readonly-field"
                />
              </div>
            </div>

            {/* 邮箱与身份预览 */}
            <div className="form-dual-row">
              <div className="form-field-item">
                <label htmlFor="user_email">邮箱</label>
                <input
                  id="user_email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="例如：student@cscope.edu.cn"
                />
              </div>

              <div className="form-field-item">
                <label>身份预览</label>
                <input
                  type="text"
                  value={`${major} · ${grade}`}
                  disabled
                  className="readonly-preview-field"
                />
                <span className="sub-field-note">由专业和年级自动组合</span>
              </div>
            </div>

            {/* 专业与年级 */}
            <div className="form-dual-row">
              <div className="form-field-item">
                <label htmlFor="user_major">专业</label>
                <input
                  id="user_major"
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="例如：网络工程 / 计算机科学与技术"
                />
              </div>

              <div className="form-field-item">
                <label htmlFor="user_grade">年级 / 学段</label>
                <input
                  id="user_grade"
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="例如：本科三年级 / 考研冲刺生"
                />
              </div>
            </div>

            {/* 目标考研院校与攻坚方向 (特色个性化服务字段) */}
            <div className="form-field-item">
              <label htmlFor="user_target">目标考研院校 / 攻坚方向</label>
              <input
                id="user_target"
                type="text"
                value={targetSchool}
                onChange={(e) => setTargetSchool(e.target.value)}
                placeholder="例如：清华大学 · 计算机系 / 408 统考 125+"
              />
            </div>

            {/* 个人简介 */}
            <div className="form-field-item">
              <div className="label-with-counter">
                <label htmlFor="user_bio">个人简介</label>
                <span className="counter-tag">{bio.length} / 500</span>
              </div>
              <textarea
                id="user_bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                placeholder="写两句学习座右铭或个人简介..."
              />
            </div>

            {profileSavedToast && (
              <div className="profile-save-alert">
                ✓ 个人档案与个性化服务设置已成功保存！
              </div>
            )}
          </form>
        </section>

        {/* 右侧两小卡片 */}
        <div className="profile-side-column">
          {/* 右上一：【安全问题】(与参考图一致) */}
          <section className="profile-card profile-security-card">
            <div className="card-header-bar">
              <div className="security-title-wrap">
                <span className="sec-icon">👤</span>
                <div>
                  <h3 className="card-sub-title">安全问题</h3>
                  <span className="sec-subtext">用于忘记密码时验证身份</span>
                </div>
              </div>
              <span className="status-badge-set">已设置</span>
            </div>

            <form onSubmit={handleSaveSecurity} className="security-form">
              <div className="form-field-item">
                <label>安全问题</label>
                <select value={question} onChange={(e) => setQuestion(e.target.value)}>
                  <option value="我最喜欢的计算机先驱是谁？">我最喜欢的计算机先驱是谁？</option>
                  <option value="我的第一只宠物叫什么？">我的第一只宠物叫什么？</option>
                  <option value="我的高中母校是哪所？">我的高中母校是哪所？</option>
                  <option value="我第一门学会的编程语言是什么？">我第一门学会的编程语言是什么？</option>
                </select>
              </div>

              <div className="form-field-item">
                <label>答案 *</label>
                <input
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  placeholder="至少 2 个字符"
                />
              </div>

              {securityMsg.text && (
                <div className={`form-inline-msg ${securityMsg.type}`}>
                  {securityMsg.text}
                </div>
              )}

              <button type="submit" className="save-security-btn">
                保存安全问题
              </button>

              <p className="security-note">
                修改问题或答案时需要重新填写答案，答案不区分大小写。
              </p>
            </form>
          </section>

          {/* 右下一：【修改密码】(与参考图一致) */}
          <section className="profile-card profile-password-card">
            <div className="card-header-bar">
              <div className="security-title-wrap">
                <span className="sec-icon">🔒</span>
                <div>
                  <h3 className="card-sub-title">修改密码</h3>
                  <span className="sec-subtext">修改后当前登录状态保持有效</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="password-form">
              <div className="form-field-item">
                <label>当前密码</label>
                <input
                  type="password"
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  placeholder="输入当前密码"
                />
              </div>

              <div className="form-field-item">
                <label>新密码</label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="至少 4 位数字"
                />
              </div>

              <div className="form-field-item">
                <label>确认新密码</label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="请再次输入新密码"
                />
              </div>

              {passwordMsg.text && (
                <div className={`form-inline-msg ${passwordMsg.type}`}>
                  {passwordMsg.text}
                </div>
              )}

              <button type="submit" className="update-pwd-btn">
                更新密码
              </button>
            </form>
          </section>
        </div>
      </div>

      {/* 底部全宽卡片：【个性化智能服务深度定制】 */}
      <section className="profile-card personalized-services-panel">
        <div className="service-panel-header">
          <div className="service-title-group">
            <span className="service-sparkle">✦</span>
            <div>
              <h3>408 个性化研学与 AI 私教定制</h3>
              <p>系统将根据以下偏好，智能调整控制台的推荐顺序、AI 私教回答的深度以及模考抽题难度</p>
            </div>
          </div>
          <button
            type="button"
            className="save-pref-btn"
            onClick={handleSaveProfile}
          >
            保存偏好设置
          </button>
        </div>

        <div className="preferences-grid">
          {/* 偏好一：备考冲刺模式 */}
          <div className="pref-box">
            <label className="pref-label">🎯 当前研学目标模式</label>
            <div className="pref-options-row">
              {[
                '408 统考 125+ 冲刺',
                '期末专业课满绩攻坚',
                '跨考计算机底层基石',
                '保研面试与机试直通'
              ].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`pref-chip-btn ${studyGoal === opt ? 'active' : ''}`}
                  onClick={() => setStudyGoal(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
            <span className="pref-desc">
              所选模式将影响 408 模考自适应题库的难度比例。
            </span>
          </div>

          {/* 偏好二：每日研习目标时长 */}
          <div className="pref-box">
            <label className="pref-label">⏱️ 每日定制研习目标</label>
            <div className="pref-options-row">
              {[30, 45, 60, 90, 120].map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`pref-chip-btn ${dailyGoalMinutes === m ? 'active' : ''}`}
                  onClick={() => setDailyGoalMinutes(m)}
                >
                  {m} 分钟 / 天
                </button>
              ))}
            </div>
            <span className="pref-desc">
              将在每日研习打卡模块中作为达标基准，自动核算认知负荷达标率。
            </span>
          </div>

          {/* 偏好三：AI 私教导学风格 */}
          <div className="pref-box">
            <label className="pref-label">🤖 AI 伴学私教推理风格 (DeepSeek-R1)</label>
            <select
              value={aiPreference}
              onChange={(e) => setAiPreference(e.target.value)}
              className="pref-select"
            >
              <option value="严谨推导型 (深入微架构硬件细节与状态机)">
                严谨推导型 (深入微架构硬件细节与状态机 · 适合考研冲刺)
              </option>
              <option value="图解时序型 (直观生动、通俗易懂 · 适合初学入门)">
                图解时序型 (直观生动、通俗易懂 · 适合初学入门)
              </option>
              <option value="真题考点速记型 (直击题目陷阱与口诀)">
                真题考点速记型 (直击题目陷阱与口诀 · 适合考前攻坚)
              </option>
            </select>
            <span className="pref-desc">
              AI 私教在解答时将自动按所选风格调整思维链与深度。
            </span>
          </div>

          {/* 偏好四：薄弱项自动置顶 */}
          <div className="pref-box toggle-box">
            <div>
              <label className="pref-label">🔔 靶向薄弱项动态追踪</label>
              <span className="pref-desc">
                根据 408 测评与错题本数据，自动在控制台与首页置顶错题对应的微观实验。
              </span>
            </div>
            <label className="switch-toggle">
              <input
                type="checkbox"
                checked={autoWeakPush}
                onChange={(e) => setAutoWeakPush(e.target.checked)}
              />
              <span className="slider round" />
            </label>
          </div>
        </div>
      </section>
    </div>
  )
}
