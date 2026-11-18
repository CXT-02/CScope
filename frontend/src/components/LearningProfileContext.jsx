import React, { createContext, useContext, useMemo, useState } from 'react'

const USERS_KEY = 'cscope-users-v1'
const SESSION_KEY = 'cscope-session-v1'
const RECORDS_KEY = 'cscope-learning-records-v1'
const LearningProfileContext = createContext(null)

export function LearningProfileProvider({ children }) {
  const [users, setUsers] = useState(() => {
    const saved = readJson(USERS_KEY, [])
    if (saved && saved.length > 0) {
      // 智能去重与头像平滑升级：将旧版外部图库链接无缝升级为精美本地卡通头像
      const hasMingStudent = saved.some((u) => u.name?.trim() === '小明同学')
      const deduplicated = []
      const seenNames = new Set()
      for (const rawUser of saved) {
        const u = { ...rawUser }
        if (!u.avatar || u.avatar.includes('images.unsplash.com')) {
          u.avatar = '/avatars/avatar_boy_geek.svg'
        }
        const norm = u.name?.trim()
        if (norm === '小明' && hasMingStudent) continue
        if (!seenNames.has(norm)) {
          seenNames.add(norm)
          deduplicated.push(u)
        }
      }
      writeJson(USERS_KEY, deduplicated)
      return deduplicated
    }
    // 默认内置演示学者账户（初始密码 123456）
    const initialDemoUser = {
      id: 'u_demo_ming',
      name: '小明同学',
      account: 'cs_xiaoming',
      email: 'xiaoming@cscope.edu.cn',
      major: '计算机科学与技术',
      grade: '本科三年级',
      targetSchool: '浙江大学 · 计算机科学与技术 (408专硕)',
      isTakingExam: 'yes',
      examYear: '2026',
      examCategory: '408',
      prepStage: 'breakthrough',
      bio: '热爱微观计算底层，构建学-练-测-诊一体化能力！',
      avatar: '/avatars/avatar_boy_geek.svg',
      securityQuestion: '我最喜欢的计算机先驱是谁？',
      securityAnswerHash: 'b52044813589b27464010a30b05b8a6a68393e8e2fa516089bbbf8c2576b2e35', // 图灵
      studyGoal: '408 统考 125+ 冲刺',
      dailyGoalMinutes: 60,
      aiPreference: '严谨推导型 (深入微架构硬件细节与状态机)',
      pinHash: '38a7c2966144e39665651ab36b5676751e18ec332463e2714fa4f86d8b96574f', // 123456
      createdAt: new Date().toISOString()
    }
    writeJson(USERS_KEY, [initialDemoUser])
    return [initialDemoUser]
  })
  const [sessionId, setSessionId] = useState(() => localStorage.getItem(SESSION_KEY) || '')
  const [allRecords, setAllRecords] = useState(() => readJson(RECORDS_KEY, {}))
  const user = users.find((item) => item.id === sessionId) || null
  const records = user ? allRecords[user.id] || emptyRecords() : emptyRecords()

  function deleteUser(userId) {
    const nextUsers = users.filter((u) => u.id !== userId)
    if (nextUsers.length === 0) return
    setUsers(nextUsers)
    writeJson(USERS_KEY, nextUsers)
    if (sessionId === userId) {
      const nextSession = nextUsers[0].id
      setSessionId(nextSession)
      localStorage.setItem(SESSION_KEY, nextSession)
    }
  }

  async function register(name, pin, extraConfig = {}) {
    const cleanName = name.trim()
    if (cleanName.length < 2) throw new Error('昵称至少需要 2 个字符')
    if (!/^\d{4,8}$/.test(pin)) throw new Error('学习密码需为 4～8 位数字')
    if (users.some((item) => item.name.toLocaleLowerCase() === cleanName.toLocaleLowerCase())) {
      throw new Error('这个昵称已经存在，请直接输入密码登录')
    }
    const nextUser = {
      id: `u_${Date.now().toString(36)}`,
      name: cleanName,
      account: `cs_${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || Date.now().toString(36).slice(-4)}`,
      email: `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'learner'}@cscope.edu.cn`,
      major: extraConfig.major || '计算机科学与技术',
      grade: extraConfig.grade || '本科三年级',
      isTakingExam: extraConfig.isTakingExam || 'yes',
      examYear: extraConfig.examYear || '2026',
      targetSchool: extraConfig.targetSchool || '浙江大学 · 计算机科学与技术 (408专硕)',
      examCategory: extraConfig.examCategory || '408',
      prepStage: extraConfig.prepStage || 'breakthrough',
      bio: extraConfig.bio || '热爱微观计算底层，构建学-练-测-诊一体化能力！',
      avatar: extraConfig.avatar || '/avatars/avatar_boy_geek.svg',
      securityQuestion: '我最喜欢的计算机先驱是谁？',
      securityAnswerHash: await hashText('图灵'),
      studyGoal: extraConfig.studyGoal || '408 统考 125+ 冲刺',
      dailyGoalMinutes: extraConfig.dailyGoalMinutes || 60,
      aiPreference: '严谨推导型 (深入微架构硬件细节与状态机)',
      pinHash: await hashText(pin),
      createdAt: new Date().toISOString()
    }
    const nextUsers = [...users, nextUser]
    setUsers(nextUsers)
    writeJson(USERS_KEY, nextUsers)
    const nextRecords = { ...allRecords, [nextUser.id]: emptyRecords() }
    setAllRecords(nextRecords)
    writeJson(RECORDS_KEY, nextRecords)
    setSessionId(nextUser.id)
    localStorage.setItem(SESSION_KEY, nextUser.id)
    return nextUser
  }

  async function login(name, pin) {
    const target = users.find((item) => item.name.toLocaleLowerCase() === name.trim().toLocaleLowerCase())
    if (!target) throw new Error('该学习昵称尚未注册，请核对输入或点击“新建学籍档案”')
    const calculatedHash = await hashText(pin)
    if (target.pinHash !== calculatedHash) {
      throw new Error('学习密码错误，请输入您在个人中心设置的正确密码（默认密码是 123456）')
    }
    setSessionId(target.id)
    localStorage.setItem(SESSION_KEY, target.id)
    touchRecord(target.id, (record) => ({ ...record, loginCount: (record.loginCount || 0) + 1, lastLoginAt: new Date().toISOString() }))
    return target
  }

  function logout() {
    setSessionId('')
    localStorage.removeItem(SESSION_KEY)
  }

  // 通过安全问题重置密码
  async function resetPasswordWithSecurity(name, answer, newPin) {
    const target = users.find((item) => item.name.toLocaleLowerCase() === name.trim().toLocaleLowerCase())
    if (!target) throw new Error('该学习昵称不存在')
    const cleanAns = answer.trim().toLowerCase()
    const ansHash = await hashText(cleanAns)
    if (target.securityAnswerHash && target.securityAnswerHash !== ansHash) {
      throw new Error('安全问题答案验证失败，请确认后重试')
    }
    if (!/^\d{4,8}$/.test(newPin)) throw new Error('新密码需为 4～8 位数字')
    const newHash = await hashText(newPin)
    const updatedUsers = users.map((u) => {
      if (u.id === target.id) {
        return { ...u, pinHash: newHash }
      }
      return u
    })
    setUsers(updatedUsers)
    writeJson(USERS_KEY, updatedUsers)
  }

  // 更新个人资料与个性化配置
  function updateUserProfile(updates) {
    if (!user) return
    const updatedUsers = users.map((u) => {
      if (u.id === user.id) {
        return { ...u, ...updates }
      }
      return u
    })
    setUsers(updatedUsers)
    writeJson(USERS_KEY, updatedUsers)
  }

  // 修改密码
  async function updatePassword(oldPin, newPin) {
    if (!user) throw new Error('用户未登录')
    const oldHash = await hashText(oldPin)
    if (user.pinHash && user.pinHash !== oldHash) {
      throw new Error('当前旧密码不正确，请重新输入')
    }
    if (!/^\d{4,8}$/.test(newPin)) {
      throw new Error('新密码需为 4～8 位数字')
    }
    const newHash = await hashText(newPin)
    const updatedUsers = users.map((u) => {
      if (u.id === user.id) {
        return { ...u, pinHash: newHash }
      }
      return u
    })
    setUsers(updatedUsers)
    writeJson(USERS_KEY, updatedUsers)
  }

  // 保存安全问题
  async function setSecurityQuestion(question, answer) {
    if (!user) throw new Error('用户未登录')
    const cleanAns = answer.trim().toLowerCase()
    if (cleanAns.length < 2) throw new Error('安全问题答案至少需要 2 个字符')
    const answerHash = await hashText(cleanAns)
    const updatedUsers = users.map((u) => {
      if (u.id === user.id) {
        return { ...u, securityQuestion: question, securityAnswerHash: answerHash }
      }
      return u
    })
    setUsers(updatedUsers)
    writeJson(USERS_KEY, updatedUsers)
  }

  function recordVisit(experimentId, courseId) {
    if (!user) return
    touchRecord(user.id, (record) => {
      const now = new Date()
      const previous = record.experiments?.[experimentId] || {}
      const duplicatedByStrictMode = previous.lastVisitAt && now.getTime() - new Date(previous.lastVisitAt).getTime() < 1200
      const experiments = { ...record.experiments, [experimentId]: { ...previous, courseId, visits: (previous.visits || 0) + (duplicatedByStrictMode ? 0 : 1), lastVisitAt: now.toISOString() } }
      return { ...record, experiments, studyDates: addStudyDate(record.studyDates, now) }
    })
  }

  function recordCycle(experimentId, update) {
    if (!user) return
    touchRecord(user.id, (record) => {
      const previous = record.experiments?.[experimentId] || {}
      const next = { ...previous, ...update, lastActivityAt: new Date().toISOString() }
      next.completed = Boolean(next.checked && next.operationDone && next.observationDone && next.reflectionSaved)
      return { ...record, experiments: { ...record.experiments, [experimentId]: next }, studyDates: addStudyDate(record.studyDates, new Date()) }
    })
  }

  function touchRecord(userId, updater) {
    setAllRecords((current) => {
      const next = { ...current, [userId]: updater(current[userId] || emptyRecords()) }
      writeJson(RECORDS_KEY, next)
      return next
    })
  }

  const value = useMemo(
    () => ({
      user,
      users,
      records,
      register,
      login,
      logout,
      deleteUser,
      resetPasswordWithSecurity,
      updateUserProfile,
      updatePassword,
      setSecurityQuestion,
      recordVisit,
      recordCycle
    }),
    [user, users, records]
  )

  return <LearningProfileContext.Provider value={value}>{children}</LearningProfileContext.Provider>
}

export function useLearningProfile() {
  const value = useContext(LearningProfileContext)
  if (!value) throw new Error('useLearningProfile 必须在 LearningProfileProvider 中使用')
  return value
}

export function calculateStreak(studyDates = []) {
  const dates = new Set(studyDates)
  const cursor = new Date()
  let streak = 0
  const today = localDate(cursor)
  if (!dates.has(today)) cursor.setDate(cursor.getDate() - 1)
  while (dates.has(localDate(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

function emptyRecords() {
  return { experiments: {}, studyDates: [], loginCount: 1, lastLoginAt: new Date().toISOString() }
}
function addStudyDate(dates = [], date) {
  const next = [...new Set([...dates, localDate(date)])]
  return next.slice(-120)
}
function localDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback
  } catch {
    return fallback
  }
}
function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}
async function hashText(value) {
  const bytes = new TextEncoder().encode(`cscope-local-${value}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((item) => item.toString(16).padStart(2, '0')).join('')
}
