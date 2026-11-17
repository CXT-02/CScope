import React, { useState, useEffect, useMemo } from 'react'
import { useLearningProfile } from './LearningProfileContext'

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80'
]

// 热门高频考研目标院校预设
const HOT_TARGET_SCHOOLS = [
  { name: '浙江大学 · 计算机科学与技术 (408)', short: '浙江大学', type: '408' },
  { name: '清华大学 · 计算机科学与技术 / 软件工程', short: '清华大学', type: '912/408' },
  { name: '电子科技大学 · 计算机科学与工程学院 (408)', short: '电子科技大学', type: '408' },
  { name: '北京航空航天大学 · 计算机学院 (408)', short: '北京航空航天大学', type: '408' },
  { name: '上海交通大学 · 电子信息与电气工程 (408)', short: '上海交通大学', type: '408' },
  { name: '北京大学 · 计算机学院 (408/自命题)', short: '北京大学', type: '408' },
  { name: '中国科学技术大学 · 计算机科学与技术学院 (408)', short: '中科大', type: '408' },
  { name: '华中科技大学 · 计算机科学与技术学院 (408)', short: '华中科技大学', type: '408' },
  { name: '同济大学 · 电子与信息工程学院 (408)', short: '同济大学', type: '408' },
  { name: '国防科技大学 · 计算机学院 (408)', short: '国防科技大学', type: '408' }
]

export default function UserProfileManager({ onOpenExperiment }) {
  const { user, updateUserProfile, updatePassword, setSecurityQuestion } = useLearningProfile()

  // 账户基本资料
  const [name, setName] = useState(user?.name || '小明同学')
  const [email, setEmail] = useState(user?.email || 'learner@cscope.edu.cn')
  const [major, setMajor] = useState(user?.major || '网络工程')
  const [grade, setGrade] = useState(user?.grade || '本科三年级')
  const [bio, setBio] = useState(user?.bio || '热爱微观计算底层，构建学-练-测-诊一体化能力！')
  const [avatar, setAvatar] = useState(user?.avatar || PRESET_AVATARS[0])
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [profileSavedToast, setProfileSavedToast] = useState(false)

  // 🎯 核心考研意向与个性化设定（响应用户需求）
  const [isTakingExam, setIsTakingExam] = useState(user?.isTakingExam || 'yes') // 'yes' (我要考研) | 'no' (暂不考研)
  const [examYear, setExamYear] = useState(user?.examYear || '2026') // '2025' | '2026' | '2027' | '2028'
  const [targetSchool, setTargetSchool] = useState(
    user?.targetSchool || '浙江大学 · 计算机科学与技术 (408专硕)'
  )
  const [examCategory, setExamCategory] = useState(user?.examCategory || '408') // '408' | 'self'
  const [prepStage, setPrepStage] = useState(user?.prepStage || 'breakthrough') // 'foundation' | 'breakthrough' | 'sprint'
  const [studyGoal, setStudyGoal] = useState(user?.studyGoal || '408 统考 125+ 冲刺')
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(user?.dailyGoalMinutes || 60)
  const [aiPreference, setAiPreference] = useState(
    user?.aiPreference || '严谨推导型 (深入微架构硬件细节与状态机)'
  )
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

  // 同步用户数据
  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || `${user.name?.toLowerCase() || 'user'}@cscope.edu.cn`)
      setMajor(user.major || '计算机科学与技术')
      setGrade(user.grade || '本科三年级')
      setBio(user.bio || '热爱微观计算底层，构建学-练-测-诊一体化能力！')
      if (user.avatar) setAvatar(user.avatar)
      if (user.isTakingExam) setIsTakingExam(user.isTakingExam)
      if (user.examYear) setExamYear(user.examYear)
      if (user.targetSchool) setTargetSchool(user.targetSchool)
      if (user.examCategory) setExamCategory(user.examCategory)
      if (user.prepStage) setPrepStage(user.prepStage)
      if (user.studyGoal) setStudyGoal(user.studyGoal)
      if (user.dailyGoalMinutes) setDailyGoalMinutes(user.dailyGoalMinutes)
      if (user.aiPreference) setAiPreference(user.aiPreference)
      if (user.securityQuestion) setQuestion(user.securityQuestion)
    }
  }, [user])

  // 保存资料与考研个性化偏好
  const handleSaveProfile = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!name.trim()) return
    updateUserProfile({
      name: name.trim(),
      email: email.trim(),
      major: major.trim(),
      grade: grade.trim(),
      bio: bio.trim(),
      avatar,
      isTakingExam,
      examYear,
      targetSchool: targetSchool.trim(),
      examCategory,
      prepStage,
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
      setSecurityMsg({ text: '安全问题设置成功！已加密保存于浏览器沙盒', type: 'success' })
      setTimeout(() => setSecurityMsg({ text: '', type: '' }), 3500)
    } catch (err) {
      setSecurityMsg({ text: err.message || '保存失败', type: 'error' })
    }
  }

  // 修改密码（带旧密码比对与格式校验）
  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setPasswordMsg({ text: '', type: '' })
    if (!oldPin) {
      setPasswordMsg({ text: '请输入当前旧密码', type: 'error' })
      return
    }
    if (!newPin || newPin.length < 4) {
      setPasswordMsg({ text: '新密码至少需要 4 位数字', type: 'error' })
      return
    }
    if (newPin !== confirmPin) {
      setPasswordMsg({ text: '两次输入的新密码不一致，请仔细核对', type: 'error' })
      return
    }
    try {
      await updatePassword(oldPin, newPin)
      setOldPin('')
      setNewPin('')
      setConfirmPin('')
      setPasswordMsg({ text: '✓ 密码修改成功！下次登录请使用新密码验证', type: 'success' })
      setTimeout(() => setPasswordMsg({ text: '', type: '' }), 3500)
    } catch (err) {
      setPasswordMsg({ text: err.message || '密码修改失败', type: 'error' })
    }
  }

  // ====== 核心：智能生成个性化研学方案与权威考情画像推荐 ======
  const tailoredPlan = useMemo(() => {
    if (isTakingExam === 'no') {
      return {
        title: '专业课满绩通关与大厂底层系统架构研习方案',
        tag: '工程导向 · 满绩就业',
        scoreGoal: '专业核心课 90+ 满绩 · 大厂基础架构面试直通',
        analysis:
          '暂不参加考研时，建议跳过考研偏题怪题与纯死记硬背的知识死角。聚焦【CPU 五级流水线】、【Cache 组相联映射】、【操作系统并发与死锁】以及【TCP 协议状态机与拥塞控制】，直接贯通计算机系统底层原理与企业级高频面试题！',
        roadmap: [
          { phase: '第 1 阶段', name: '底层物理时序通识', desc: '单步打拍观察 CPU 流水线冒险停顿与 Cache 颠簸，建立微架构直观认知' },
          { phase: '第 2 阶段', name: '系统级并发与网络', desc: '手操死锁银行家算法安全性检查，推演 TCP 2MSL TIME_WAIT 与滑动窗口' },
          { phase: '第 3 阶段', name: '大厂核心面经与机试', desc: '结合 B+ 树索引与 Dijkstra 算法实验，巩固工程实践代码能力' }
        ],
        mustLabs: [
          { id: 'cpu-pipeline', name: 'CPU 五级流水线', reason: '大厂高频微架构底层原理面试题' },
          { id: 'cache-mapping', name: 'Cache 映射与命中率', reason: '透视高并发内存访问局部性' },
          { id: 'deadlock', name: '死锁与银行家算法', reason: '操作系统并发编程安全基石' },
          { id: 'tcp-connection', name: 'TCP 三次握手与四次挥手', reason: '计网全双工与断开重传必备' },
          { id: 'bplus-tree', name: 'B+ 树动态索引', reason: 'MySQL 与数据库底层存储引擎核心' }
        ],
        dailyRecommendation: `${dailyGoalMinutes} 分钟/天：30% 理论理解 + 70% 仿真实验动手单步推演。`
      }
    }

    // 针对考研院校与届次的深度考情画像
    const isTopSchool =
      targetSchool.includes('浙大') ||
      targetSchool.includes('清华') ||
      targetSchool.includes('上交') ||
      targetSchool.includes('北大') ||
      targetSchool.includes('北航')
    const isElecSchool = targetSchool.includes('电子科大') || targetSchool.includes('成电')

    let schoolInsight = ''
    let targetScore = '120 ~ 130 分 (总分 150)'

    if (isTopSchool) {
      targetScore = '125 ~ 135+ 分 (高分决胜组)'
      schoolInsight = `${targetSchool} 计算机专业竞争激烈，历年统考复试线多在 350~370 分区间。408 专业课是拉开分差的关键支柱！其命题极为偏重计组综合大题（CPU 流水线 RAW 冒险停顿周期计算、Cache 联合主存地址划分与颠簸）与 OS 虚存分页访问时序！`
    } else if (isElecSchool) {
      targetScore = '118 ~ 128 分'
      schoolInsight = `电子科技大学对操作系统并发模型与计算机网络协议考查极为深入，选择题细节多，大题常结合 TCP 滑动窗口拥塞状态机与多实例资源分配图死锁判定！`
    } else {
      schoolInsight = `${targetSchool} 考研科目要求坚实扎实的专业基础。408 统考 105 题库中选择题占 80 分（务必争取 70+），大题 70 分注重系统综合时序推导。`
    }

    const roadmapPhases = [
      {
        phase: prepStage === 'foundation' ? '【当前攻坚】第 1 阶段' : '第 1 阶段 (基石)',
        name: '微观物理时序与算法打底',
        desc: '拒绝干背文字，在 25 门时钟仿真沙盒中单步观察硬件寄存器打拍、指针松弛与报文交互'
      },
      {
        phase: prepStage === 'breakthrough' ? '【当前攻坚】第 2 阶段' : '第 2 阶段 (题眼)',
        name: '408 历年 105 统考真题靶向击破',
        desc: '结合靶向错题本，专门消灭 Load-Use 冒险、Cache 组相联、银行家算法与子网划分易错陷阱'
      },
      {
        phase: prepStage === 'sprint' ? '【当前攻坚】第 3 阶段' : '第 3 阶段 (冲刺)',
        name: '全真智能模考计时与综合大题深推',
        desc: '开启 408 智能模考计时抽测，每周进行 2~3 轮全真自测，依托 AI 私教 DeepSeek-R1 补齐短板'
      }
    ]

    const mustLabs = [
      { id: 'cpu-pipeline', name: 'CPU 五级流水线与冒险', reason: '计组 41/42 大题必考时钟节拍推演' },
      { id: 'cache-mapping', name: 'Cache 映射与颠簸实验', reason: 'Tag/Set/Offset 地址划分高频丢分陷阱' },
      { id: 'deadlock', name: '死锁银行家算法推演', reason: '操作系统综合大题安全序列证明' },
      { id: 'tcp-connection', name: 'TCP 状态机与四次挥手', reason: '历年必考 2MSL TIME_WAIT 细节' },
      { id: 'dijkstra', name: 'Dijkstra 最短路径', reason: '数据结构图算法复杂度与松弛全过程' }
    ]

    return {
      title: `${targetSchool} · ${examYear} 届专属个性化研学蓝图`,
      tag: `${examYear} 届考研 · ${examCategory === '408' ? '408 统考全科' : '高校自命题'}`,
      scoreGoal: targetScore,
      analysis: schoolInsight,
      roadmap: roadmapPhases,
      mustLabs,
      dailyRecommendation: `建议每日研习 ${dailyGoalMinutes} 分钟：20 分钟底层沙盒单步观察 + 30 分钟 408 历年真题测评 + 10 分钟 DeepSeek AI 私教疑难复盘。`
    }
  }, [isTakingExam, examYear, targetSchool, examCategory, prepStage, dailyGoalMinutes])

  return (
    <div className="user-profile-manager-page">
      {/* 顶部面包屑与在线状态 */}
      <div className="profile-manager-top-strip">
        <div className="top-breadcrumb">
          <span>智研知库</span>
          <span className="sep">/</span>
          <span>工作区</span>
          <span className="sep">/</span>
          <strong className="current">个人中心 · 考研意向与定制方案</strong>
        </div>
        <div className="top-online-status">
          <span className="online-badge">
            <span className="dot" />
            <span>知识库在线</span>
          </span>
          <span className="sep-line">|</span>
          <span className="model-badge">
            {isTakingExam === 'yes' ? `${examYear} 届考研专班` : '工程研习学者'} &gt;
          </span>
        </div>
      </div>

      {/* 主栅格：左侧主账户资料卡片 + 右侧安全与密码设置卡片 */}
      <div className="profile-layout-grid">
        {/* 左侧大卡片：【账户信息 / 个人资料】 */}
        <section className="profile-card profile-main-card">
          <div className="card-header-bar">
            <div>
              <span className="card-eyebrow">PROFILE / 个人资料</span>
              <h2 className="card-main-title">账户基本信息</h2>
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
            {/* 头像区域 */}
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
                <span className="avatar-hint-text">支持精选学者与极客头像库</span>
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
                  <label htmlFor="user_nickname">学习昵称 *</label>
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
                <label>专属学籍账号</label>
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
                <label htmlFor="user_email">学研邮箱</label>
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
                <span className="sub-field-note">由专业和学段自动联动展示</span>
              </div>
            </div>

            {/* 专业与年级 */}
            <div className="form-dual-row">
              <div className="form-field-item">
                <label htmlFor="user_major">本科专业</label>
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

            {/* 个人简介 */}
            <div className="form-field-item">
              <div className="label-with-counter">
                <label htmlFor="user_bio">研学座右铭</label>
                <span className="counter-tag">{bio.length} / 500</span>
              </div>
              <textarea
                id="user_bio"
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                placeholder="写两句学习座右铭或个人简介..."
              />
            </div>

            {profileSavedToast && (
              <div className="profile-save-alert">
                ✓ 个人档案与个性化考研规划已成功保存！
              </div>
            )}
          </form>
        </section>

        {/* 右侧两小卡片：【安全问题】与【修改密码】 */}
        <div className="profile-side-column">
          {/* 右上一：【安全问题】 */}
          <section className="profile-card profile-security-card">
            <div className="card-header-bar">
              <div className="security-title-wrap">
                <span className="sec-icon-badge">SECURITY</span>
                <div>
                  <h3 className="card-sub-title">密保安全问题</h3>
                  <span className="sec-subtext">登录忘记密码时用于快速重置</span>
                </div>
              </div>
              <span className="status-badge-set">已受保护</span>
            </div>

            <form onSubmit={handleSaveSecurity} className="security-form">
              <div className="form-field-item">
                <label>密保问题</label>
                <select value={question} onChange={(e) => setQuestion(e.target.value)}>
                  <option value="我最喜欢的计算机先驱是谁？">我最喜欢的计算机先驱是谁？</option>
                  <option value="我的第一只宠物叫什么？">我的第一只宠物叫什么？</option>
                  <option value="我的高中母校是哪所？">我的高中母校是哪所？</option>
                  <option value="我第一门学会的编程语言是什么？">我第一门学会的编程语言是什么？</option>
                </select>
              </div>

              <div className="form-field-item">
                <label>密保答案 *</label>
                <input
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  placeholder="输入答案（默认答案：图灵）"
                />
              </div>

              {securityMsg.text && (
                <div className={`form-inline-msg ${securityMsg.type}`}>
                  {securityMsg.text}
                </div>
              )}

              <button type="submit" className="save-security-btn">
                保存密保问题
              </button>
            </form>
          </section>

          {/* 右下一：【修改密码】 */}
          <section className="profile-card profile-password-card">
            <div className="card-header-bar">
              <div className="security-title-wrap">
                <span className="sec-icon-badge">PASSWORD</span>
                <div>
                  <h3 className="card-sub-title">登录密码管理</h3>
                  <span className="sec-subtext">登录系统时必须输入该密码</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="password-form">
              <div className="form-field-item">
                <label>当前旧密码 *</label>
                <input
                  type="password"
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  placeholder="请输入当前旧密码（默认密码：123456）"
                />
              </div>

              <div className="form-field-item">
                <label>设置新密码 *</label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="4～8 位数字新密码"
                />
              </div>

              <div className="form-field-item">
                <label>确认新密码 *</label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="再次输入新密码"
                />
              </div>

              {passwordMsg.text && (
                <div className={`form-inline-msg ${passwordMsg.type}`}>
                  {passwordMsg.text}
                </div>
              )}

              <button type="submit" className="update-pwd-btn">
                更新登录密码
              </button>
            </form>
          </section>
        </div>
      </div>

      {/* 核心拓展第二大板块：【考研个性化意向设置】 (按用户需求新增) */}
      <section className="profile-card exam-target-settings-panel">
        <div className="card-header-bar">
          <div className="service-title-group">
            <span className="service-sparkle">🎯</span>
            <div>
              <h3 className="card-main-title">考研意向与个性化方案规划</h3>
              <p className="card-subtitle-text">
                设置您的考研意向、备考年份与目标院校，系统将实时为您定制权威考情画像、提分攻坚路线与必刷仿真机床。
              </p>
            </div>
          </div>
          <button
            type="button"
            className="save-profile-btn"
            onClick={handleSaveProfile}
          >
            保存意向并更新方案
          </button>
        </div>

        <div className="exam-settings-grid">
          {/* 选项 1：考不考研 */}
          <div className="exam-setting-item">
            <label className="pref-label">是否考研规划：</label>
            <div className="pref-options-row">
              <button
                type="button"
                className={`pref-chip-btn large-chip ${isTakingExam === 'yes' ? 'active' : ''}`}
                onClick={() => setIsTakingExam('yes')}
              >
                🎓 我要考研（目标攻克计算机统考或名校自命题硕士）
              </button>
              <button
                type="button"
                className={`pref-chip-btn large-chip ${isTakingExam === 'no' ? 'active' : ''}`}
                onClick={() => setIsTakingExam('no')}
              >
                💼 暂不考研（专业课满绩攻坚、底层原理研学与工程就业）
              </button>
            </div>
          </div>

          {/* 若选择考研，展示考研年份与目标院校设置 */}
          {isTakingExam === 'yes' ? (
            <>
              {/* 选项 2：什么时候考研 (考研届次) */}
              <div className="exam-setting-item">
                <label className="pref-label">什么时候考研（考研届次 / 毕业年份）：</label>
                <div className="pref-options-row">
                  {[
                    { id: '2025', label: '2025 届 (决胜复试 / 二战冲刺)' },
                    { id: '2026', label: '2026 届 (2026 统考核心主力主力军)' },
                    { id: '2027', label: '2027 届 (大三提速 · 提前研学)' },
                    { id: '2028', label: '2028 届及以后 (低年级筑基)' }
                  ].map((yr) => (
                    <button
                      key={yr.id}
                      type="button"
                      className={`pref-chip-btn ${examYear === yr.id ? 'active' : ''}`}
                      onClick={() => setExamYear(yr.id)}
                    >
                      {yr.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 选项 3：要考的目标院校与专业方向 */}
              <div className="exam-setting-item">
                <label className="pref-label">
                  要考的目标院校与学院方向：
                  <span className="pref-subnote">支持直接选择热门名校标签，或在下方输入框自由输入</span>
                </label>

                {/* 热门名校快捷标签 */}
                <div className="hot-schools-chips-row">
                  {HOT_TARGET_SCHOOLS.map((sch, sIdx) => {
                    const isSelected = targetSchool.includes(sch.short)
                    return (
                      <button
                        key={sIdx}
                        type="button"
                        className={`hot-school-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => setTargetSchool(sch.name)}
                      >
                        {sch.short}
                      </button>
                    )
                  })}
                </div>

                <div className="target-input-box">
                  <input
                    type="text"
                    className="custom-school-input"
                    value={targetSchool}
                    onChange={(e) => setTargetSchool(e.target.value)}
                    placeholder="输入您的目标院校全称，例如：浙江大学 · 计算机科学与技术学院 408 专硕"
                  />
                </div>
              </div>

              {/* 选项 4：试卷类型与当前备考阶段 */}
              <div className="exam-dual-options-row">
                <div className="exam-sub-setting">
                  <label className="pref-label">考试科目类型：</label>
                  <div className="pref-options-row">
                    <button
                      type="button"
                      className={`pref-chip-btn ${examCategory === '408' ? 'active' : ''}`}
                      onClick={() => setExamCategory('408')}
                    >
                      408 计算机统考全科 (计组/OS/计网/数据结构)
                    </button>
                    <button
                      type="button"
                      className={`pref-chip-btn ${examCategory === 'self' ? 'active' : ''}`}
                      onClick={() => setExamCategory('self')}
                    >
                      高校自主命题 (8xx/9xx/单科专业基础)
                    </button>
                  </div>
                </div>

                <div className="exam-sub-setting">
                  <label className="pref-label">当前备考攻坚阶段：</label>
                  <div className="pref-options-row">
                    {[
                      { id: 'foundation', label: '🌱 基础原理打底' },
                      { id: 'breakthrough', label: '🔥 统考真题强化' },
                      { id: 'sprint', label: '⚡ 全真模考冲刺' }
                    ].map((stg) => (
                      <button
                        key={stg.id}
                        type="button"
                        className={`pref-chip-btn ${prepStage === stg.id ? 'active' : ''}`}
                        onClick={() => setPrepStage(stg.id)}
                      >
                        {stg.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-exam-tips-banner">
              <strong>💡 已为您开启【工程就业与专业课满绩】研学轨道：</strong>
              <span>
                系统将弱化考研大题应试套路，自动为您强化 25 门时钟实验源码、底层并发安全性、TCP 状态机与分布式索引等大厂高频基础架构核心实操。
              </span>
            </div>
          )}

          {/* 每日研习目标与 AI 私教偏好 */}
          <div className="exam-dual-options-row">
            <div className="exam-sub-setting">
              <label className="pref-label">每日定制研习目标时长：</label>
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
            </div>

            <div className="exam-sub-setting">
              <label className="pref-label">AI 私教伴学推理风格 (DeepSeek-R1)：</label>
              <select
                value={aiPreference}
                onChange={(e) => setAiPreference(e.target.value)}
                className="pref-select"
              >
                <option value="严谨推导型 (深入微架构硬件细节与状态机)">
                  严谨推导型 (深入微架构硬件细节与状态机 · 推荐冲刺名校)
                </option>
                <option value="图解时序型 (直观生动、通俗易懂 · 适合初学入门)">
                  图解时序型 (直观生动、通俗易懂 · 适合打牢基石)
                </option>
                <option value="真题考点速记型 (直击题目陷阱与口诀)">
                  真题考点速记型 (直击题目陷阱与口诀 · 考前高效突破)
                </option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 核心拓展第三大板块：【专属个性化学习方案推荐面板】 (系统自动研判生成) */}
      <section className="profile-card tailored-study-plan-card">
        <div className="plan-card-header">
          <div className="plan-title-col">
            <span className="plan-badge-pill">DYNAMIC AI STUDY BLUEPRINT // 专属研学方案推荐</span>
            <h3 className="plan-main-title">{tailoredPlan.title}</h3>
            <span className="plan-goal-tag">{tailoredPlan.scoreGoal}</span>
          </div>

          <button
            type="button"
            className="save-profile-btn"
            onClick={() => {
              window.location.hash = '#/aitutor'
            }}
            title="将该专属定制方案联动至 AI 私教开启多轮对话"
          >
            💬 联动 DeepSeek AI 私教专项辅导 →
          </button>
        </div>

        {/* 方案深度解析与考情画像 */}
        <div className="plan-analysis-box">
          <div className="analysis-head">
            <span className="analysis-icon">📊</span>
            <strong>考情画像与目标规划深度研判：</strong>
          </div>
          <p className="analysis-text">{tailoredPlan.analysis}</p>
        </div>

        {/* 定制分阶段攻坚路线图 */}
        <div className="plan-roadmap-section">
          <h4 className="sub-section-title">📅 届次定制分阶段攻坚路线：</h4>
          <div className="roadmap-stages-grid">
            {tailoredPlan.roadmap.map((stg, sIdx) => (
              <div key={sIdx} className="roadmap-stage-card">
                <span className="stage-num-badge">{stg.phase}</span>
                <strong className="stage-name">{stg.name}</strong>
                <p className="stage-desc">{stg.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 必刷微观仿真机床阵列 */}
        <div className="plan-must-labs-section">
          <div className="labs-head-row">
            <h4 className="sub-section-title">🔬 针对您的目标定制：必刷核心微观实验清单</h4>
            <span className="labs-subtext">点击直通底层物理时序沙盒单步验证</span>
          </div>

          <div className="must-labs-grid">
            {tailoredPlan.mustLabs.map((lab) => (
              <div key={lab.id} className="must-lab-card">
                <div className="must-lab-left">
                  <span className="lab-id-code">CSCOPE // {lab.id.toUpperCase()}</span>
                  <strong className="lab-title">{lab.name}</strong>
                  <span className="lab-reason-tag">📌 {lab.reason}</span>
                </div>
                <button
                  type="button"
                  className="launch-lab-btn"
                  onClick={() => {
                    if (onOpenExperiment) {
                      onOpenExperiment(lab.id)
                    } else {
                      window.location.hash = `#/lab/${lab.id}`
                    }
                  }}
                  title={`立即进入 ${lab.name} 仿真推演`}
                >
                  进入实验推演 →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 每日学习节奏与行动建议 */}
        <div className="plan-footer-routine">
          <span className="routine-icon">⏱️</span>
          <span><strong>每日学习节奏建议：</strong>{tailoredPlan.dailyRecommendation}</span>
        </div>
      </section>
    </div>
  )
}
