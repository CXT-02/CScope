import React from 'react'

export default function HomeCover({ onOpenCourses, onOpenExam, onOpenProfile }) {
  return (
    <div className="home-cover-page">
      {/* 沉稳高雅的学术风专属动效与样式 */}
      <style>{`
        .home-cover-page {
          min-height: calc(100vh - 86px);
          background: 
            radial-gradient(circle at 10% 8%, rgba(101, 88, 232, 0.06), transparent 32rem),
            radial-gradient(circle at 90% 25%, rgba(21, 154, 131, 0.05), transparent 28rem),
            #f7f8f4;
          color: #14213d;
          padding: 50px clamp(24px, 5vw, 72px) 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .cover-hero {
          max-width: 1240px;
          width: 100%;
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(360px, 0.85fr);
          align-items: center;
          gap: 60px;
          margin-bottom: 64px;
        }

        .cover-eyebrow {
          display: inline-block;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #6554c0;
          margin-bottom: 16px;
        }

        .cover-heading {
          font: 700 clamp(40px, 4.8vw, 62px)/1.12 Georgia, "Songti SC", "SimSun", serif;
          letter-spacing: -0.03em;
          color: #14213d;
          margin: 0 0 20px;
        }
        .cover-heading em {
          font-style: normal;
          color: #6558e8;
        }

        .cover-desc {
          font-size: 17px;
          line-height: 1.8;
          color: #65708a;
          margin: 0 0 32px;
          max-width: 620px;
        }

        /* 优雅的按纽系统 */
        .cover-cta-group {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        .cover-btn-primary {
          border: 0;
          border-radius: 12px;
          padding: 14px 26px;
          background: linear-gradient(135deg, #182440, #2c3e66);
          color: #ffffff;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 8px 24px rgba(24, 36, 64, 0.18);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .cover-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(24, 36, 64, 0.25);
        }
        .cover-btn-secondary {
          border: 1px solid #d9dce3;
          border-radius: 12px;
          padding: 13px 24px;
          background: #ffffff;
          color: #202a44;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .cover-btn-secondary:hover {
          transform: translateY(-2px);
          border-color: #6558e8;
        }

        /* 右侧经典的轨道微动效展示 */
        .cover-visual {
          position: relative;
          height: 380px;
          display: grid;
          place-items: center;
        }
        .cover-core-orb {
          width: 126px;
          height: 126px;
          border-radius: 50%;
          background: linear-gradient(145deg, #182440, #2d3f6b);
          color: #ffffff;
          display: grid;
          place-items: center;
          text-align: center;
          font-weight: 800;
          box-shadow: 0 0 0 16px rgba(101, 88, 232, 0.12), 0 20px 50px rgba(33, 45, 74, 0.22);
          z-index: 2;
        }
        .cover-core-orb strong {
          font: 700 28px Georgia, serif;
          display: block;
        }
        .cover-core-orb span {
          font-size: 11px;
          letter-spacing: 0.1em;
          color: #c8cedf;
          text-transform: uppercase;
          margin-top: 2px;
        }

        .cover-orbit {
          position: absolute;
          border: 1px dashed rgba(101, 88, 232, 0.28);
          border-radius: 50%;
        }
        .orbit-inner {
          width: 230px;
          height: 230px;
          animation: orbitSpin 26s linear infinite;
        }
        .orbit-middle {
          width: 320px;
          height: 320px;
          animation: orbitSpin 36s linear infinite reverse;
        }
        .orbit-outer {
          width: 400px;
          height: 400px;
          animation: orbitSpin 46s linear infinite;
        }

        @keyframes orbitSpin {
          to { transform: rotate(360deg); }
        }

        .orbit-node {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          padding: 5px 12px;
          background: #ffffff;
          border: 1px solid #dcdbe8;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 700;
          color: #202a44;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          white-space: nowrap;
        }
        .orbit-node-dot {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          bottom: 12%;
          left: 14%;
        }

        /* 三大模块入口大卡片 */
        .portal-deck {
          max-width: 1240px;
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
          padding: 32px 28px;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          text-align: left;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(20, 33, 61, 0.04);
          transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.25s ease, box-shadow 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .portal-entry-card:hover {
          transform: translateY(-6px);
          border-color: #6558e8;
          box-shadow: 0 16px 36px rgba(20, 33, 61, 0.09);
        }

        .portal-icon-box {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
          border: 1px solid rgba(0, 0, 0, 0.05);
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
          font: 700 22px/1.3 Georgia, "Songti SC", serif;
          color: #14213d;
          margin: 0 0 12px;
        }

        .portal-text {
          font-size: 14px;
          line-height: 1.7;
          color: #65708a;
          margin: 0 0 24px;
          flex-grow: 1;
        }

        .portal-action-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
          font-weight: 800;
          padding-top: 18px;
          border-top: 1px solid #f0f2ea;
          transition: color 0.2s ease;
        }
        .portal-entry-card:hover .portal-action-link span:last-child {
          transform: translateX(4px);
        }

        /* 底部底标栏 */
        .cover-footer-bar {
          max-width: 1240px;
          width: 100%;
          border-top: 1px solid #e2e5df;
          padding-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 13px;
          color: #7b8396;
        }

        @media (max-width: 960px) {
          .cover-hero {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 40px;
          }
          .cover-desc {
            margin-inline: auto;
          }
          .cover-cta-group {
            justify-content: center;
          }
          .portal-deck {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* 顶部 Hero 区域 */}
      <section className="cover-hero">
        <div className="cover-hero-copy">
          <span className="cover-eyebrow">CSCOPE · 计算机原理与智能算法实验室</span>
          <h1 className="cover-heading">
            今天想看懂<br />
            <em>哪门计算机核心课？</em>
          </h1>
          <p className="cover-desc">
            穿透教科书的枯燥文字。从指令流水线、Cache 冲突颠簸到 TCP 全双工报文交互，
            深度集成历年 408 统考真题演练，构建“学-练-测-诊”一体化闭环。
          </p>

          <div className="cover-cta-group">
            <button className="cover-btn-primary" onClick={onOpenCourses}>
              <span>进入课程知识库</span>
              <span>→</span>
            </button>
            <button className="cover-btn-secondary" onClick={onOpenExam}>
              <span>408 统考真题模考</span>
              <span style={{ color: '#6558e8' }}>●</span>
            </button>
          </div>
        </div>

        {/* 右侧优雅的同心圆动态轨道展示 */}
        <div className="cover-visual" aria-hidden="true">
          <div className="cover-core-orb">
            <div>
              <strong>CS</strong>
              <span>Lab Core</span>
            </div>
          </div>

          {/* 内环轨道 */}
          <div className="cover-orbit orbit-inner">
            <span className="orbit-node">Cache 冲突映射</span>
            <i className="orbit-node-dot" style={{ background: '#38bdf8' }} />
          </div>

          {/* 中环轨道 */}
          <div className="cover-orbit orbit-middle">
            <span className="orbit-node">CPU 五级流水线</span>
            <i className="orbit-node-dot" style={{ background: '#6558e8' }} />
          </div>

          {/* 外环轨道 */}
          <div className="cover-orbit orbit-outer">
            <span className="orbit-node">TCP 拥塞滑动窗口</span>
            <i className="orbit-node-dot" style={{ background: '#159a83' }} />
          </div>
        </div>
      </section>

      {/* 三大核心门户入口卡片 (卡片点进去即是对应模块) */}
      <section className="portal-deck">
        {/* 模块 1: 课程知识与交互实验 */}
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
              涵盖计算机组成原理、操作系统、计网、数据结构、数据库等 8 门核心课。30+ 交互仿真让抽象的硬件微操作与时序直观可视。
            </p>
          </div>
          <div className="portal-action-link" style={{ color: '#4f46e5' }}>
            <span>进入课程知识库 (8门课程)</span>
            <span style={{ transition: 'transform 0.2s ease' }}>→</span>
          </div>
        </div>

        {/* 模块 2: 408 考研真题与智能测评中心 */}
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

        {/* 模块 3: 学情画像与成长档案 */}
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

      {/* 底部沉稳的学术规格标牌 */}
      <footer className="cover-footer-bar">
        <div>
          <strong>CSCOPE Lab</strong> · 全国计算机类高水平课程与考研统考仿真平台
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>8 门核心课程规划</span>
          <span>·</span>
          <span>30+ 交互式仿真</span>
          <span>·</span>
          <span>408 真题靶向实验联动</span>
        </div>
      </footer>
    </div>
  )
}
