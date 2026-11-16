import React, { useState } from 'react'
import { useLearningProfile } from './LearningProfileContext'

export default function AccountDialog({ open, onClose }) {
  const { login, register } = useLearningProfile()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (!open) return null

  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true)
    try { if (mode === 'login') await login(name, pin); else await register(name, pin); setName(''); setPin(''); onClose() }
    catch (reason) { setError(reason.message || '操作失败，请重试') }
    finally { setBusy(false) }
  }

  return <div className="account-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="account-dialog" role="dialog" aria-modal="true" aria-labelledby="account-title"><button className="account-close" type="button" onClick={onClose} aria-label="关闭">×</button><div className="account-mark">C</div><span className="eyebrow">PERSONAL LEARNING PROFILE</span><h2 id="account-title">{mode === 'login' ? '继续你的学习进度' : '创建本地学习账户'}</h2><p>{mode === 'login' ? '登录后会按账户恢复实验次数、学习总结和个性化推荐。' : '账户仅保存在当前浏览器，不会上传姓名或学习数据。'}</p><div className="account-tabs"><button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => { setMode('login'); setError('') }}>登录</button><button className={mode === 'register' ? 'active' : ''} type="button" onClick={() => { setMode('register'); setError('') }}>注册</button></div><form onSubmit={submit}><label><span>学习昵称</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} maxLength="20" placeholder="例如：小林同学" /></label><label><span>学习密码</span><input type="password" inputMode="numeric" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="4～8 位数字" /></label>{error && <div className="account-error">{error}</div>}<button className="account-submit" type="submit" disabled={busy || !name.trim() || !pin}>{busy ? '正在处理…' : mode === 'login' ? '登录并继续学习' : '创建账户'}</button></form><small className="account-privacy">本地演示账户 · 密码经摘要后保存在浏览器 LocalStorage · 清除浏览器数据后记录会消失</small></section></div>
}
