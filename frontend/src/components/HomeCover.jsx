import React from 'react'

export default function HomeCover({ onOpenCourses, onOpenExam, onOpenProfile }) {
  return (
    <div className="home-cover-page">
      <style>{`
        .home-cover-page {
          min-height: calc(100vh - 86px);
          background: 
            radial-gradient(circle at 10% 8%, rgba(101, 88, 232, 0.05), transparent 32rem),
            radial-gradient(circle at 90% 25%, rgba(21, 154, 131, 0.04), transparent 28rem),
            #f7f8f4;
          color: #14213d;
          padding: 48px clamp(24px, 5vw, 72px) 72px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .cover-hero {
          max-width: 1240px;
          width: 100%;
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(380px, 0.85fr);
          align-items: center;
          gap: 56px;
          margin-bottom: 60px;
        }

        .cover-eyebrow {
          display: inline-block;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #6554c0;
          margin-bottom: 16px;
        }

        .cover-heading {
          font: 700 clamp(38px, 4.5vw, 58px)/1.14 Georgia, "Songti SC", "SimSun", serif;
          letter-spacing: -0.03em;
          color: #14213d;
          margin: 0 0 20px;
        }
        .cover-heading em {
          font-style: normal;
          color: #6558e8;
        }

        .cover-desc {
          font-size: 16.5px;
          line-height: 1.8;
          color: #65708a;
          margin: 0 0 32px;
          max-width: 620px;
        }

        /* 优雅主按钮系统 */
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

        /* 右侧：计算机微架构时钟与动态时序沙盘（无旋转倒立文字） */
        .simulator-sandbox {
          position: relative;
          background: #ffffff;
          border: 1px solid #dfe3ea;
          border-radius: 20px;
          padding: 24px 26px;
          box-shadow: 0 16px 42px rgba(20, 33, 61, 0.07);
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow: hidden;
        }

        /* 顶部仿真控制栏 */
        .sim-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 14px;
          border-bottom: 1px solid #edf0f5;
        }
        .sim-dots {
          display: flex;
          gap: 6px;
        }
        .sim-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }

        /* 动态流水线时钟通道 */
        .pipeline-track {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          position: relative;
        }
        .pipeline-stage-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 6px;
          text-align: center;
          position: relative;
          transition: all 0.3s ease;
        }
        .pipeline-stage-box strong {
          display: block;
          font-size: 13px;
          color: #1e293b;
        }
        .pipeline-stage-box small {
          display: block;
          font-size: 10px;
          color: #64748b;
          margin-top: 2px;
        }

        /* 指令在流水线中流动的光斑 */
        @keyframes instStream {
          0% { transform: translateX(0); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateX(290px); opacity: 0; }
        }
        .inst-runner {
          position: absolute;
          top: -4px;
          left: 10px;
          height: 3px;
          width: 60px;
          background: linear-gradient(90deg, transparent, #6558e8, #38bdf8);
          border-radius: 99px;
          animation: instStream 3.8s ease-in-out infinite;
          box-shadow: 0 0 10px #6558e8;
        }

        /* 协议信道双向飞行数据包 */
        .channel-lane {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 16px;
          position: relative;
        }
        .lane-header {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 700;
          color: #475569;
          margin-bottom: 8px;
        }
        .lane-rail {
          height: 4px;
          background: #e2e8f0;
          border-radius: 99px;
          position: relative;
          overflow: hidden;
        }
        @keyframes packetFlyLeftRight {
          0% { left: 0%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { left: 90%; opacity: 0; }
        }
        @keyframes packetFlyRightLeft {
          0% { right: 0%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { right: 90%; opacity: 0; }
        }
        .packet-pulse-forward {
          position: absolute;
          top: 0;
          height: 100%;
          width: 36px;
          border-radius: 99px;
          background: linear-gradient(90deg, transparent, #2563eb);
          animation: packetFlyLeftRight 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .packet-pulse-backward {
          position: absolute;
          top: 0;
          height: 100%;
          width: 36px;
          border-radius: 99px;
          background: linear-gradient(-90deg, transparent, #10b981);
          animation: packetFlyRightLeft 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          animation-delay: 1.4s;
        }

        /* 实时微状态指示器 */
        .metrics-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .metric-cell {
          background: #f8fafc;
          border: 1px solid #edf0f5;
          border-radius: 8px;
          padding: 8px 10px;
          text-align: center;
        }
        .metric-cell span {
          display: block;
          font-size: 11px;
          color: #64748b;
        }
        .metric-cell strong {
          display: block;
          font-size: 14px;
          font-family: monospace;
          color: #1e293b;
          margin-top: 2px;
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
          <span className="cover-eyebrow">CSCOPE · 计算机软硬件全栈可视化仿真实验室</span>
          <h1 className="cover-heading">
            透视计算机底层机理<br />
            <em>让抽象代码在眼前具象运行</em>
          </h1>
          <p className="cover-desc">
            融汇 8 门计算机类核心学科知识图谱与 30+ 交互式微观仿真实验。
            首创历年 408 考研统考真题自适应测评与错题靶向推演，打造“学·练·测·诊”全闭环教研平台。
          </p>

          <div className="cover-cta-group">
            <button className="cover-btn-primary" onClick={onOpenCourses}>
              <span>进入课程知识库</span>
              <span>→</span>
            </button>
            <button className="cover-btn-secondary" onClick={onOpenExam}>
              <span>408 统考真题测评</span>
              <span style={{ color: '#6558e8' }}>●</span>
            </button>
          </div>
        </div>

        {/* 右侧：计算机微架构时钟与动态流水线沙盘（文字水平绝对不倒立，动效高级平稳） */}
        <div className="simulator-sandbox" aria-label="微架构与协议时序仿真动效展示">
          {/* 沙盘顶部控制状态栏 */}
          <div className="sim-header">
            <div className="sim-dots">
              <span className="sim-dot" style={{ background: '#f87171' }} />
              <span className="sim-dot" style={{ background: '#fbbf24' }} />
              <span className="sim-dot" style={{ background: '#34d399' }} />
            </div>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748b', fontWeight: 700 }}>
              CLK 0.5ns · CPU & PROTOCOL SIMULATOR
            </span>
          </div>

          {/* 1. 五级指令流水线动态数据通路展示 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b' }}>
                CPU 五级时空流水线 (Pipelined Dataflow)
              </span>
              <span style={{ fontSize: '11px', color: '#6558e8', fontWeight: 700, fontFamily: 'monospace' }}>
                Cycle #4 · RAW 无气泡
              </span>
            </div>

            <div className="pipeline-track">
              <div className="inst-runner" />
              <div className="pipeline-stage-box" style={{ borderTop: '2px solid #38bdf8' }}>
                <strong>IF</strong>
                <small>取指令</small>
              </div>
              <div className="pipeline-stage-box" style={{ borderTop: '2px solid #818cf8' }}>
                <strong>ID</strong>
                <small>译码/读</small>
              </div>
              <div className="pipeline-stage-box" style={{ borderTop: '2px solid #c084fc', background: '#f5f3ff' }}>
                <strong style={{ color: '#7c3aed' }}>EX</strong>
                <small>ALU执行</small>
              </div>
              <div className="pipeline-stage-box" style={{ borderTop: '2px solid #f59e0b' }}>
                <strong>MEM</strong>
                <small>访存读写</small>
              </div>
              <div className="pipeline-stage-box" style={{ borderTop: '2px solid #10b981' }}>
                <strong>WB</strong>
                <small>结果写回</small>
              </div>
            </div>
          </div>

          {/* 2. TCP 双向信道可靠报文滑动交互 */}
          <div className="channel-lane">
            <div className="lane-header">
              <span>Client 主机 [seq=1001]</span>
              <span style={{ color: '#6558e8' }}>⇄ 全双工信道 RTT ~15ms</span>
              <span>Server 服务端 [ack=1002]</span>
            </div>
            <div className="lane-rail">
              <div className="packet-pulse-forward" />
              <div className="packet-pulse-backward" />
            </div>
          </div>

          {/* 3. 动态指标标签 */}
          <div className="metrics-row">
            <div className="metric-cell">
              <span>Cache 命中率</span>
              <strong style={{ color: '#059669' }}>96.4% ⚡</strong>
            </div>
            <div className="metric-cell">
              <span>流水线吞吐</span>
              <strong style={{ color: '#2563eb' }}>1.0 IPC</strong>
            </div>
            <div className="metric-cell">
              <span>TCP 拥塞窗口</span>
              <strong style={{ color: '#7c3aed' }}>16 MSS</strong>
            </div>
          </div>
        </div>
      </section>

      {/* 三大核心门户入口大卡片 (点进去直达各模块) */}
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
