import React, { createContext, useContext, useMemo, useState } from 'react'

const USERS_KEY = 'cscope-users-v1'
const SESSION_KEY = 'cscope-session-v1'
const RECORDS_KEY = 'cscope-learning-records-v1'
const LearningProfileContext = createContext(null)

export function LearningProfileProvider({ children }) {
  const [users, setUsers] = useState(() => readJson(USERS_KEY, []))
  const [sessionId, setSessionId] = useState(() => localStorage.getItem(SESSION_KEY) || '')
  const [allRecords, setAllRecords] = useState(() => readJson(RECORDS_KEY, {}))
  const user = users.find((item) => item.id === sessionId) || null
  const records = user ? allRecords[user.id] || emptyRecords() : emptyRecords()

  async function register(name, pin) {
    const cleanName = name.trim()
    if (cleanName.length < 2) throw new Error('昵称至少需要 2 个字符')
    if (!/^\d{4,8}$/.test(pin)) throw new Error('学习密码需为 4～8 位数字')
    if (users.some((item) => item.name.toLocaleLowerCase() === cleanName.toLocaleLowerCase())) throw new Error('这个昵称已经存在，请直接登录或更换昵称')
    const nextUser = { id: `u_${Date.now().toString(36)}`, name: cleanName, pinHash: await hashText(pin), createdAt: new Date().toISOString() }
    const nextUsers = [...users, nextUser]
    setUsers(nextUsers); writeJson(USERS_KEY, nextUsers)
    const nextRecords = { ...allRecords, [nextUser.id]: emptyRecords() }
    setAllRecords(nextRecords); writeJson(RECORDS_KEY, nextRecords)
    setSessionId(nextUser.id); localStorage.setItem(SESSION_KEY, nextUser.id)
    return nextUser
  }

  async function login(name, pin) {
    const target = users.find((item) => item.name.toLocaleLowerCase() === name.trim().toLocaleLowerCase())
    if (!target || target.pinHash !== await hashText(pin)) throw new Error('昵称或学习密码不正确')
    setSessionId(target.id); localStorage.setItem(SESSION_KEY, target.id)
    touchRecord(target.id, (record) => ({ ...record, loginCount: (record.loginCount || 0) + 1, lastLoginAt: new Date().toISOString() }))
    return target
  }

  function logout() { setSessionId(''); localStorage.removeItem(SESSION_KEY) }

  function recordVisit(experimentId, courseId) {
    if (!user) return
    touchRecord(user.id, (record) => {
      const now = new Date(); const previous = record.experiments?.[experimentId] || {}
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
    setAllRecords((current) => { const next = { ...current, [userId]: updater(current[userId] || emptyRecords()) }; writeJson(RECORDS_KEY, next); return next })
  }

  const value = useMemo(() => ({ user, users, records, register, login, logout, recordVisit, recordCycle }), [user, users, records])
  return <LearningProfileContext.Provider value={value}>{children}</LearningProfileContext.Provider>
}

export function useLearningProfile() {
  const value = useContext(LearningProfileContext)
  if (!value) throw new Error('useLearningProfile 必须在 LearningProfileProvider 中使用')
  return value
}

export function calculateStreak(studyDates = []) {
  const dates = new Set(studyDates)
  const cursor = new Date(); let streak = 0
  const today = localDate(cursor)
  if (!dates.has(today)) cursor.setDate(cursor.getDate() - 1)
  while (dates.has(localDate(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1) }
  return streak
}

function emptyRecords() { return { experiments: {}, studyDates: [], loginCount: 1, lastLoginAt: new Date().toISOString() } }
function addStudyDate(dates = [], date) { const next = [...new Set([...dates, localDate(date)])]; return next.slice(-120) }
function localDate(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
function readJson(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback } catch { return fallback } }
function writeJson(key, value) { localStorage.setItem(key, JSON.stringify(value)) }
async function hashText(value) { const bytes = new TextEncoder().encode(`cscope-local-${value}`); const digest = await crypto.subtle.digest('SHA-256', bytes); return [...new Uint8Array(digest)].map((item) => item.toString(16).padStart(2, '0')).join('') }
