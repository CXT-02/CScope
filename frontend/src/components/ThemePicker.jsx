import React, { useState, useRef, useEffect } from 'react'
import { useTheme, THEMES } from './ThemeContext'
import './ThemePicker.css'

export default function ThemePicker() {
  const { theme, setTheme, toggleLightDark, currentThemeObj } = useTheme()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="theme-picker-wrapper" ref={menuRef}>
      {/* 触发胶囊按钮 */}
      <button
        type="button"
        className="theme-trigger-btn"
        onClick={() => setOpen((v) => !v)}
        title="点击自主切换日间/夜间模式与主题配色"
        aria-expanded={open}
      >
        <span className="theme-trigger-icon">{currentThemeObj.icon}</span>
        <span className="theme-trigger-name">{currentThemeObj.name}</span>
        <span className="theme-trigger-arrow">{open ? '▲' : '▼'}</span>
      </button>

      {/* 快捷一键日夜切换微按钮 */}
      <button
        type="button"
        className="theme-quick-toggle"
        onClick={toggleLightDark}
        title={currentThemeObj.type === 'dark' ? '一键切换到白天模式' : '一键切换到夜间模式'}
      >
        {currentThemeObj.type === 'dark' ? '☀️' : '🌙'}
      </button>

      {/* 弹出式主题选择面板 */}
      {open && (
        <div className="theme-dropdown-panel animate-pop-in" role="dialog" aria-label="主题配色选择">
          <div className="theme-dropdown-header">
            <strong>🎨 选择界面视觉主题</strong>
            <small>自动保存并在全站生效</small>
          </div>

          <div className="theme-options-grid">
            {THEMES.map((item) => {
              const active = item.id === theme
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`theme-option-card ${active ? 'is-active' : ''}`}
                  onClick={() => {
                    setTheme(item.id)
                    setOpen(false)
                  }}
                >
                  <div className="theme-card-left">
                    <span className="theme-card-icon">{item.icon}</span>
                    <div>
                      <strong>{item.name}</strong>
                      <small>{item.hint}</small>
                    </div>
                  </div>

                  {/* 三色色块预览 */}
                  <div className="theme-color-dots">
                    {item.colorPreview.map((c, i) => (
                      <span key={i} style={{ background: c }} />
                    ))}
                  </div>

                  {active && <span className="theme-check-badge">✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
