import React from 'react'

export default function HomeCover({ onOpenCourses, onOpenExam, onOpenProfile, onOpenExperiment }) {
  return (
    <div className="home-cover-container">
      {/* 动态科技背景与关键帧动画 */}
      <style>{`
        .home-cover-container {
          position: relative;
          min-height: calc(100vh - 72px);
          background: radial-gradient(circle at 50% 20%, #1e1b4b 0%, #090d16 65%, #05070c 100%);
          color: #f8fafc;
          overflow: hidden;
          padding: 48px 24px 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justifyContent: center;
        }

        /* 背景流光光斑 */
        .ambient-glow-1 {
          position: absolute;
          top: -120px;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 480px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, rgba(56, 189, 248, 0.08) 50%, transparent 70%);
          filter: blur(80px);
          pointer-events: none;
          animation: floatGlow 8s ease-in-out infinite alternate;
        }
        .ambient-glow-2 {
          position: absolute;
          bottom: 10%;
          right: 15%;
          width: 500px;
          height: 350px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%);
          filter: blur(90px);
          pointer-events: none;
        }

        @keyframes floatGlow {
          0% { transform: translateX(-50%) translateY(0px) scale(1); }
          100% { transform: translateX(-50%) translateY(30px) scale(1.08); }
        }

        /* 科技网格背景线条 */
        .grid-backdrop {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(circle at 50% 40%, black 30%, transparent 80%);
          pointer-events: none;
        }

        /* 顶部标题渐变文字 */
        .hero-title-gradient {
          background: linear-gradient(135deg, #ffffff 30%, #cbd5e1 70%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-title-highlight {
          background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* 模块大卡片样式 */
        .portal-card {
          position: relative;
          background: rgba(15, 23, 42, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 32px 28px;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          text-align: left;
          cursor: pointer;
          backdrop-filter: blur(16px);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
        }
        .portal-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          padding: 1.5px;
          background: linear-gradient(135deg, transparent, transparent);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          transition: all 0.35s ease;
        }
        .portal-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px -12px rgba(99, 102, 241, 0.25);
          background: rgba(22, 32, 56, 0.82);
        }

        .portal-card-course:hover::before {
          background: linear-gradient(135deg, #38bdf8, #818cf8);
        }
        .portal-card-exam:hover::before {
          background: linear-gradient(135deg, #a855f7, #ec4899);
        }
        .portal-card-profile:hover::before {
          background: linear-gradient(135deg, #10b981, #06b6d4);
        }

        /* 光斑掠过动效 */
        .portal-card .shine-effect {
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
          transform: skewX(-20deg);
          pointer-events: none;
          transition: 0.6s;
        }
        .portal-card:hover .shine-effect {
          left: 200%;
        }

        /* 微架构动画条 */
        @keyframes pulseTrack {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .data-flow-pulse {
          position: absolute;
          height: 2px;
          width: 120px;
          background: linear-gradient(90deg, transparent, #38bdf8, transparent);
          animation: pulseTrack 3s infinite linear;
        }

        @media (max-width: 980px) {
          .portal-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* 科技背景图元 */}
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />
      <div className="grid-backdrop" />

      {/* 顶部醒目标题区域 */}
      <div style={{ maxWidth: '960px', textAlign: 'center', zIndex: 1, marginBottom: '52px' }}>
        {/* 国家级/大赛学术徽标胶囊 */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 18px',
          borderRadius: '999px',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(129, 140, 248, 0.3)',
          marginBottom: '20px',
          backdropFilter: 'blur(8px)'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#34d399',
            boxShadow: '0 0 10px #34d399'
          }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c7d2fe', letterSpacing: '0.04em' }}>
            CSCOPE · 计算机核心课微观仿真实验室 & 408 测评中心
          </span>
        </div>

        {/* 主标题 */}
        <h1 style={{
          fontSize: 'clamp(2.4rem, 5vw, 4rem)',
          fontWeight: 900,
          lineHeight: '1.15',
          margin: '0 0 16px',
          letterSpacing: '-0.03em'
        }}>
          <span className="hero-title-gradient">让代码与硬件在指尖</span>
          <br />
          <span className="hero-title-highlight">一步步动态微观运行</span>
        </h1>

        {/* 描述文案 */}
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: '#94a3b8',
          lineHeight: '1.7',
          maxWidth: '780px',
          margin: '0 auto 28px'
        }}>
          穿透教科书的枯燥文字。从指令流水线、Cache 冲突颠簸到 TCP 全双工报文交互，
          深度集成<strong>历年 408 统考真题演练</strong>，做错一键将参数调入仿真实验推演验证。
        </p>

        {/* 核心快捷 CTA */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={onOpenCourses}
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#fff',
              border: 'none',
              padding: '13px 28px',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <span>进入课程知识地图</span>
            <span style={{ fontSize: '1.1rem' }}>➔</span>
          </button>

          <button
            onClick={onOpenExam}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '13px 26px',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)'
              e.currentTarget.style.borderColor = '#c084fc'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <span>408 统考真题自测</span>
            <span style={{ color: '#c084fc' }}>●</span>
          </button>
        </div>
      </div>

      {/* 核心三大功能门户卡片矩阵 */}
      <div className="portal-grid" style={{
        maxWidth: '1200px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        zIndex: 1,
        marginBottom: '48px'
      }}>
        {/* 卡片 1: 课程知识与交互实验 */}
        <div className="portal-card portal-card-course" onClick={onOpenCourses}>
          <div className="shine-effect" />
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(37, 99, 235, 0.2))',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(56, 189, 248, 0.18)'
              }}>
                {/* 芯片/拓扑 SVG 矢量图标 */}
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <rect x="9" y="9" width="6" height="6" />
                  <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
                </svg>
              </div>

              <span style={{
                background: 'rgba(56, 189, 248, 0.1)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.05em'
              }}>
                CORE LABS
              </span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 10px' }}>
              课程知识与仿真实验
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.6', margin: '0 0 22px' }}>
              系统覆盖 8 门计算机核心课程与 30+ 关键知识点，将抽象的 CPU 数据通路、页面置换、TCP 握手化为可触控的动态仿真。
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.88rem',
            color: '#38bdf8',
            fontWeight: 800
          }}>
            <span>浏览知识地图 (8门课程)</span>
            <span style={{ fontSize: '1.1rem', transition: 'transform 0.2s' }}>➔</span>
          </div>
        </div>

        {/* 卡片 2: 408 考研真题与智能测评中心 */}
        <div className="portal-card portal-card-exam" onClick={onOpenExam}>
          <div className="shine-effect" />
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))',
                border: '1px solid rgba(168, 85, 247, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(168, 85, 247, 0.2)'
              }}>
                {/* 考研罗盘/雷达 SVG 矢量图标 */}
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m4.93 4.93 4.24 4.24" />
                  <path d="m14.83 9.17 4.24-4.24" />
                  <path d="m14.83 14.83 4.24 4.24" />
                  <path d="m9.17 14.83-4.24 4.24" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>

              <span style={{
                background: 'rgba(168, 85, 247, 0.15)',
                color: '#d8b4fe',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.05em'
              }}>
                EXAM ARENA
              </span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 10px' }}>
              408 考研真题与专项测评
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.6', margin: '0 0 22px' }}>
              历年 408 全国统考经典真题库。自由配置题数与智能时长倒计时，独创<strong>“错题一键直达对应仿真实验”</strong>深入推演。
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.88rem',
            color: '#d8b4fe',
            fontWeight: 800
          }}>
            <span>开始自适应模考 (真题实战)</span>
            <span style={{ fontSize: '1.1rem', transition: 'transform 0.2s' }}>➔</span>
          </div>
        </div>

        {/* 卡片 3: 学情画像与成长档案 */}
        <div className="portal-card portal-card-profile" onClick={onOpenProfile}>
          <div className="shine-effect" />
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.18)'
              }}>
                {/* 数据分析/图表 SVG 矢量图标 */}
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                  <circle cx="19" cy="9" r="2" />
                </svg>
              </div>

              <span style={{
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.05em'
              }}>
                ANALYTICS
              </span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 10px' }}>
              学情画像与学习档案
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.6', margin: '0 0 22px' }}>
              自动追踪实验访问循环、理解自测与模考得分轨迹。多维雷达图洞察知识盲区，生成个性化阶段巩固路线。
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.88rem',
            color: '#34d399',
            fontWeight: 800
          }}>
            <span>查阅个人学情中心</span>
            <span style={{ fontSize: '1.1rem', transition: 'transform 0.2s' }}>➔</span>
          </div>
        </div>
      </div>

      {/* 底部：动态时序与微架构仿真展示条 */}
      <div style={{
        maxWidth: '1200px',
        width: '100%',
        background: 'rgba(15, 23, 42, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        zIndex: 1,
        fontSize: '0.85rem',
        color: '#94a3b8'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            padding: '2px 8px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontWeight: 800,
            fontSize: '0.78rem'
          }}>
            SIMULATION ENGINE
          </span>
          <span>高精度物理时钟驱动 · 硬件微操作与报文时空交互全开箱</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8', display: 'inline-block' }} />
            五级流水线冒险
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a855f7', display: 'inline-block' }} />
            TCP 拥塞滑动窗口
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            Cache 组相联映射
          </span>
        </div>
      </div>
    </div>
  )
}
