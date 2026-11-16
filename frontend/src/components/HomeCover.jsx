import React, { useState } from 'react'

export default function HomeCover({ onOpenCourses, onOpenExam, onOpenProfile, onOpenExperiment }) {
  const [activeTab, setActiveTab] = useState('attention')

  return (
    <div className="home-cover-page">
      <style>{`
        .home-cover-page {
          min-height: calc(100vh - 86px);
          background: #f7f8f4;
          color: #14213d;
          padding: 44px clamp(20px, 4vw, 64px) 72px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .cover-hero {
          max-width: 1260px;
          width: 100%;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(460px, 1.05fr);
          align-items: center;
          gap: 48px;
          margin-bottom: 64px;
        }

        /* 左侧品牌与标语区 */
        .cover-brand-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #5548d2;
          font-size: 13.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          margin-bottom: 18px;
        }
        .cover-brand-tag .dash {
          width: 18px;
          height: 2px;
          background: #5548d2;
          border-radius: 2px;
        }

        .cover-heading {
          font: 700 clamp(34px, 4vw, 48px)/1.18 Georgia, "Songti SC", "SimSun", serif;
          letter-spacing: -0.025em;
          color: #14213d;
          margin: 0 0 20px;
        }
        .cover-heading .highlight-phrase {
          position: relative;
          color: #4338ca;
          display: inline-block;
        }
        .cover-heading .highlight-phrase::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 0;
          right: 0;
          height: 10px;
          background: rgba(99, 102, 241, 0.14);
          z-index: -1;
          border-radius: 4px;
        }

        .cover-desc {
          font-size: 15.5px;
          line-height: 1.8;
          color: #65708a;
          margin: 0 0 32px;
          max-width: 530px;
        }

        /* 按钮与指标排版 */
        .cover-actions {
          display: flex;
          gap: 14px;
          margin-bottom: 44px;
          flex-wrap: wrap;
        }
        .btn-dark {
          border: 0;
          border-radius: 12px;
          padding: 13px 24px;
          background: #18233c;
          color: #ffffff;
          font-weight: 700;
          font-size: 14.5px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 6px 20px rgba(24, 35, 60, 0.16);
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .btn-dark:hover {
          transform: translateY(-2px);
          background: #253352;
        }
        .btn-light {
          border: 1px solid #d9dce3;
          border-radius: 12px;
          padding: 12px 22px;
          background: #ffffff;
          color: #1e293b;
          font-weight: 700;
          font-size: 14.5px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .btn-light:hover {
          transform: translateY(-2px);
          border-color: #6558e8;
        }

        .cover-stats-row {
          display: flex;
          align-items: center;
          gap: 40px;
          padding-top: 10px;
        }
        .stat-item {
          display: flex;
          flex-direction: column;
        }
        .stat-num {
          font: 700 32px/1 Georgia, serif;
          color: #14213d;
        }
        .stat-lbl {
          font-size: 12.5px;
          color: #7b8499;
          margin-top: 6px;
        }

        /* 右侧深色模拟器展示窗口 (参考图神还原) */
        .live-lab-window {
          background: #0f172a;
          border-radius: 20px;
          border: 1px solid #1e293b;
          padding: 20px 24px 22px;
          color: #f8fafc;
          box-shadow: 0 24px 50px -10px rgba(15, 23, 42, 0.35);
          position: relative;
          overflow: hidden;
        }

        .window-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 16px;
        }
        .window-dots {
          display: flex;
          gap: 7px;
        }
        .window-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .window-title {
          font-family: monospace;
          font-size: 11.5px;
          letter-spacing: 0.12em;
          color: #64748b;
        }
        .window-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: #34d399;
          font-weight: 700;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 8px #34d399;
        }

        /* 模拟器上方小 Tabs */
        .window-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 18px;
        }
        .win-tab {
          border: 0;
          border-radius: 8px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          background: transparent;
          color: #94a3b8;
          transition: all 0.2s;
        }
        .win-tab.active {
          background: rgba(99, 102, 241, 0.18);
          color: #c7d2fe;
          border: 1px solid rgba(129, 140, 248, 0.35);
        }

        /* 模拟器画布网格与注意力弧线交互区 */
        .canvas-area {
          height: 200px;
          background: rgba(15, 23, 42, 0.65);
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 24px 24px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          position: relative;
          padding: 16px;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
        }

        /* 词元节点水平排列 */
        .tokens-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          z-index: 2;
        }
        .token-chip {
          background: rgba(30, 41, 59, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 7px 0;
          text-align: center;
          font-size: 12.5px;
          color: #cbd5e1;
        }
        .token-chip.target {
          background: #312e81;
          border-color: #6366f1;
          color: #ffffff;
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.35);
        }

        /* 注意力发光连线弧线 SVG */
        .arc-svg-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        @keyframes dashMove {
          to { stroke-dashoffset: -40; }
        }
        .animated-arc {
          stroke: #818cf8;
          stroke-dasharray: 6 4;
          animation: dashMove 3s linear infinite;
        }
        .target-glow-ball {
          animation: pulseBall 2s ease-in-out infinite alternate;
        }
        @keyframes pulseBall {
          0% { r: 6; fill: #818cf8; filter: drop-shadow(0 0 4px #818cf8); }
          100% { r: 8; fill: #c084fc; filter: drop-shadow(0 0 10px #c084fc); }
        }

        /* 底部注意力权重指示滑条 */
        .canvas-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: #64748b;
          z-index: 2;
        }
        .weight-track {
          flex: 1;
          margin-left: 12px;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 99px;
          position: relative;
          overflow: hidden;
        }
        .weight-fill {
          width: 72%;
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #a855f7);
          border-radius: 99px;
        }

        /* 模拟器下方说明文字与进入实验按钮 */
        .window-details {
          margin-top: 18px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 16px;
        }
        .kicker-tag {
          font-size: 11px;
          font-weight: 800;
          color: #818cf8;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .details-title {
          font-size: 15px;
          font-weight: 700;
          color: #f8fafc;
          margin: 6px 0 4px;
        }
        .details-desc {
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.5;
          margin: 0;
          max-width: 320px;
        }
        .btn-enter-lab {
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.2s;
        }
        .btn-enter-lab:hover {
          background: rgba(255, 255, 255, 0.16);
        }

        /* 下方三大模块大卡片入口 (保持不变的清晰层级) */
        .portal-deck {
          max-width: 1260px;
          width: 100%;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
          margin-bottom: 56px;
        }

        .portal-entry-card {
          background: #ffffff;
          border: 1px solid #dfe3ea;
          border-radius: 20px;
          padding: 30px 26px;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          text-align: left;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(20, 33, 61, 0.04);
          transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .portal-entry-card:hover {
          transform: translateY(-6px);
          border-color: #6558e8;
          box-shadow: 0 16px 36px rgba(20, 33, 61, 0.09);
        }

        .portal-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .portal-tag {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 8px;
          display: block;
        }

        .portal-title {
          font: 700 21px/1.3 Georgia, "Songti SC", serif;
          color: #14213d;
          margin: 0 0 10px;
        }

        .portal-text {
          font-size: 13.5px;
          line-height: 1.7;
          color: #65708a;
          margin: 0 0 20px;
          flex-grow: 1;
        }

        .portal-action-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13.5px;
          font-weight: 800;
          padding-top: 16px;
          border-top: 1px solid #f0f2ea;
        }
        .portal-entry-card:hover .portal-action-link span:last-child {
          transform: translateX(4px);
        }

        @media (max-width: 980px) {
          .cover-hero {
            grid-template-columns: 1fr;
          }
          .portal-deck {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* 顶部 Hero 主区域 */}
      <section className="cover-hero">
        {/* 左侧文案与数据 */}
        <div>
          <div className="cover-brand-tag">
            <span className="dash" />
            <span>CSCOPE · 可视化计算机学习实验室</span>
          </div>

          <h1 className="cover-heading">
            把看不见的<br />
            <span className="highlight-phrase">计算过程</span>，变成<br />
            可以操作的实验。
          </h1>

          <p className="cover-desc">
            从注意力机制、数据结构到操作系统与计算机网络，让抽象概念按步骤运行；
            你可以暂停、修改参数，并用代码对应每一次变化。
          </p>

          <div className="cover-actions">
            <button className="btn-dark" onClick={onOpenCourses}>
              <span>浏览课程知识地图</span>
              <span>→</span>
            </button>
            <button className="btn-light" onClick={onOpenExam}>
              <span>进入 408 测评</span>
            </button>
          </div>

          <div className="cover-stats-row">
            <div className="stat-item">
              <span className="stat-num">08</span>
              <span className="stat-lbl">门核心课程</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">30+</span>
              <span className="stat-lbl">个交互实验</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">04</span>
              <span className="stat-lbl">步主动学习循环</span>
            </div>
          </div>
        </div>

        {/* 右侧微型计算机仿真实验室窗口 (参考图精准神还原) */}
        <div className="live-lab-window">
          {/* 窗口顶栏 */}
          <div className="window-topbar">
            <div className="window-dots">
              <span className="window-dot" style={{ background: '#ef4444' }} />
              <span className="window-dot" style={{ background: '#f59e0b' }} />
              <span className="window-dot" style={{ background: '#10b981' }} />
            </div>
            <span className="window-title">CSCOPE / LIVE LAB</span>
            <div className="window-status">
              <span className="status-dot" />
              <span>正在运行</span>
            </div>
          </div>

          {/* 实验切换 Tabs */}
          <div className="window-tabs">
            <button
              className={`win-tab ${activeTab === 'attention' ? 'active' : ''}`}
              onClick={() => setActiveTab('attention')}
            >
              AI 注意力机制
            </button>
            <button
              className={`win-tab ${activeTab === 'tree' ? 'active' : ''}`}
              onClick={() => setActiveTab('tree')}
            >
              DS 二叉树遍历
            </button>
            <button
              className={`win-tab ${activeTab === 'tcp' ? 'active' : ''}`}
              onClick={() => setActiveTab('tcp')}
            >
              NET TCP 连接
            </button>
          </div>

          {/* 核心画布区 (注意力机制动态弧线) */}
          <div className="canvas-area">
            {/* 词元节点 */}
            <div className="tokens-row">
              <div className="token-chip">模型</div>
              <div className="token-chip">理解</div>
              <div className="token-chip target">上下文</div>
              <div className="token-chip">关系</div>
            </div>

            {/* 动态贝塞尔发光弧线 */}
            <svg className="arc-svg-container" viewBox="0 0 460 200">
              <defs>
                <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#a855f7" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="1" />
                </linearGradient>
              </defs>

              {/* 弧线 1: 从节点1到节点3 */}
              <path
                d="M 60 70 Q 180 10 290 70"
                fill="none"
                stroke="url(#arcGrad)"
                strokeWidth="2.5"
                className="animated-arc"
              />

              {/* 弧线 2: 从节点2到节点3 */}
              <path
                d="M 175 70 Q 230 35 290 70"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                opacity="0.6"
              />

              {/* 弧线 3: 从节点3到节点4 */}
              <path
                d="M 290 70 Q 350 35 400 70"
                fill="none"
                stroke="#475569"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* 发光注意力聚焦球 */}
              <circle cx="290" cy="70" r="7" className="target-glow-ball" />
            </svg>

            {/* 底部权重条 */}
            <div className="canvas-footer">
              <span>注意力权重</span>
              <div className="weight-track">
                <div className="weight-fill" />
              </div>
              <span style={{ marginLeft: '12px', fontFamily: 'monospace', color: '#c7d2fe', fontWeight: 700 }}>
                0.72
              </span>
            </div>
          </div>

          {/* 窗口下方详情与按钮 */}
          <div className="window-details">
            <div>
              <span className="kicker-tag">ARTIFICIAL INTELLIGENCE</span>
              <h3 className="details-title">一句话里的词，正在彼此寻找上下文</h3>
              <p className="details-desc">
                观察当前词如何把注意力分配给其他词，理解 Transformer 为什么能联系上下文。
              </p>
            </div>
            <button
              className="btn-enter-lab"
              onClick={() => onOpenExperiment('attention')}
            >
              进入实验 ↗
            </button>
          </div>
        </div>
      </section>

      {/* 下方三大核心门户入口大卡片 (点卡片直达各子模块) */}
      <section className="portal-deck">
        {/* 模块 1 */}
        <div className="portal-entry-card" onClick={onOpenCourses}>
          <div>
            <div className="portal-icon-box" style={{ background: '#eef2ff', color: '#4f46e5' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <rect x="9" y="9" width="6" height="6" />
                <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
              </svg>
            </div>
            <span className="portal-tag" style={{ color: '#4f46e5' }}>MODULE 01 · 核心实验</span>
            <h3 className="portal-title">课程知识地图与仿真实验</h3>
            <p className="portal-text">
              涵盖计算机组成原理、操作系统、计网、数据结构等 8 门核心课程。30+ 交互仿真让抽象的硬件微操作与时序直观可视。
            </p>
          </div>
          <div className="portal-action-link" style={{ color: '#4f46e5' }}>
            <span>进入课程知识库 (8门课程)</span>
            <span style={{ transition: 'transform 0.2s ease' }}>→</span>
          </div>
        </div>

        {/* 模块 2 */}
        <div className="portal-entry-card" onClick={onOpenExam}>
          <div>
            <div className="portal-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m4.93 4.93 4.24 4.24" />
                <path d="m14.83 9.17 4.24-4.24" />
                <path d="m14.83 14.83 4.24 4.24" />
                <path d="m9.17 14.83-4.24 4.24" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <span className="portal-tag" style={{ color: '#7c3aed' }}>MODULE 02 · 408真题</span>
            <h3 className="portal-title">408 考研真题与智能测评</h3>
            <p className="portal-text">
              收录历年全国硕士统考经典真题。自由定制题量与智能时长倒计时，做错一键将真题参数直达仿真实验平台进行微观推演！
            </p>
          </div>
          <div className="portal-action-link" style={{ color: '#7c3aed' }}>
            <span>开始真题测试与模考</span>
            <span style={{ transition: 'transform 0.2s ease' }}>→</span>
          </div>
        </div>

        {/* 模块 3 */}
        <div className="portal-entry-card" onClick={onOpenProfile}>
          <div>
            <div className="portal-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
                <circle cx="19" cy="9" r="2" />
              </svg>
            </div>
            <span className="portal-tag" style={{ color: '#059669' }}>MODULE 03 · 学习成长</span>
            <h3 className="portal-title">学情画像与学习档案</h3>
            <p className="portal-text">
              记录实验访问频次与各模块掌握度，自动归档历次 408 测评答卷与做题耗时，智能分析知识薄弱盲区并推荐巩固路径。
            </p>
          </div>
          <div className="portal-action-link" style={{ color: '#059669' }}>
            <span>查看个人学情中心</span>
            <span style={{ transition: 'transform 0.2s ease' }}>→</span>
          </div>
        </div>
      </section>
    </div>
  )
}
