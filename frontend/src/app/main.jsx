import React from 'react'
import { createRoot } from 'react-dom/client'
import App from '../components/App'
import '../lib/attentionService'

function init() {
  const el = document.getElementById('root')
  if (!el) return
  createRoot(el).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

// 幂等初始化，避免重复挂载
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true })
} else {
  init()
}
