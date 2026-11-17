import React, { createContext, useContext, useEffect, useState } from 'react'

export const THEMES = [
  {
    id: 'dark',
    name: '深空暗夜',
    icon: '🌙',
    hint: '夜间沉浸 · 科技星空',
    colorPreview: ['#0d1424', '#17223b', '#ff6845'],
    type: 'dark'
  },
  {
    id: 'light',
    name: '学术晨曦',
    icon: '☀️',
    hint: '日间明朗 · 清新高雅',
    colorPreview: ['#f4f6fb', '#ffffff', '#6558e8'],
    type: 'light'
  },
  {
    id: 'cyber',
    name: '极客赛博',
    icon: '🌌',
    hint: '赛博霓虹 · 双色电光紫夜',
    colorPreview: ['#0e0728', '#ff007f', '#00f5d4'],
    type: 'dark'
  },
  {
    id: 'forest',
    name: '苍林护眼',
    icon: '🍵',
    hint: '温润松石 · 考研防疲劳',
    colorPreview: ['#f4f7f2', '#eaf2ea', '#15803d'],
    type: 'light'
  }
]

const ThemeContext = createContext({
  theme: 'dark',
  setTheme: () => {},
  toggleLightDark: () => {},
  isDark: true
})

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem('cscope_theme')
      if (saved && THEMES.some(t => t.id === saved)) return saved
    } catch {}
    return 'dark'
  })

  useEffect(() => {
    try {
      localStorage.setItem('cscope_theme', theme)
    } catch {}
    // 设置到根 html 节点与 body
    document.documentElement.setAttribute('data-theme', theme)
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  const setTheme = (nextTheme) => {
    if (THEMES.some(t => t.id === nextTheme)) {
      setThemeState(nextTheme)
    }
  }

  const toggleLightDark = () => {
    setThemeState((current) => (current === 'light' || current === 'forest' ? 'dark' : 'light'))
  }

  const currentThemeObj = THEMES.find(t => t.id === theme) || THEMES[0]
  const isDark = currentThemeObj.type === 'dark'

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleLightDark, isDark, currentThemeObj }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
