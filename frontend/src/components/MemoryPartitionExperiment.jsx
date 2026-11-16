import React, { useEffect, useMemo, useState, useRef } from 'react'
import { ExperimentHeader } from './AttentionExperiment'
import LearningCycle from './LearningCycle'

// 初始物理内存基准分布 (64 MB)
const INITIAL_SEGMENTS = [
  { type: 'hole', size: 10, start: 0 },
  { type: 'used', size: 8, name: 'OS系统A', start: 10 },
  { type: 'hole', size: 22, start: 18 },
  { type: 'used', size: 10, name: 'OS系统B', start: 40 },
  { type: 'hole', size: 14, start: 50 },
]

// 待分配作业列表
const DEFAULT_JOBS = [
  { name: 'P1', size: 9, color: '#3b82f6' },
  { name: 'P2', size: 13, color: '#10b981' },
  { name: 'P3', size: 6, color: '#f59e0b' },
  { name: 'P4', size: 12, color: '#8b5cf6' },
  { name: 'P5', size: 8, color: '#ec4899' },
]

// 连续分配四大经典算法
const ALGORITHM_CONFIG = {
  first: {
    name: '首次适应算法 (First Fit)',
    en: 'First Fit (FF)',
    desc: '空闲分区按地址递增排列。从低地址开始向后顺序查找，遇到第一个足够容纳的空闲区立即切分。',
    pros: '分配速度最快，尽可能保留了高地址的大空闲区。',
    cons: '低地址频繁切分，容易形成大量无法利用的小碎片。'
  },
  next: {
    name: '循环首次 / 邻近适应 (Next Fit)',
    en: 'Next Fit (NF)',
    desc: '从上一次查找结束的位置开始继续向下查找，直到找到第一个满足要求的空闲分区（到尾端则回绕至开头）。',
    pros: '使空闲分区分布得更均匀，减少了查找开销。',
    cons: '缺乏对高地址的保护，容易过早破坏高地址的大空闲分区。'
  },
  best: {
    name: '最佳适应算法 (Best Fit)',
    en: 'Best Fit (BF)',
    desc: '空闲分区按容量大小升序排列。每次挑选能够满足需求的“最小空闲区”进行切分。',
    pros: '最大可能地保留了其余大空闲块，满足未来大作业。',
    cons: '每次切割后剩下的空闲区极小，极易在系统中产生难以利用的“外部碎片地雷”。'
  },
  worst: {
    name: '最坏适应算法 (Worst Fit)',
    en: 'Worst Fit (WF)',
    desc: '空闲分区按容量大小降序排列。每次总是挑选“当前最大的空闲区”进行切分。',
    pros: '切割后剩下的空闲块仍然较大，不易产生微小碎片。',
    cons: '系统中的大空闲块被迅速蚕食，后续大作业到达时将无足够大空间而频频失败。'
  }
}

// 导学 6 幕完整数据
const STORY_STAGES = [
  {
    step: 1,
    title: '单一与固定分区 vs 动态分区：内部碎片与外部碎片的本质',
    kicker: '01 · 连续内存管理演进',
    summary: '早期固定分区将内存划分为固定若干块，若作业小于分区容量，内部未用部分称为“内部碎片”；现代动态分区则是在作业装入时按需切分，无内部碎片，但作业离开后留下的散碎空间会形成“外部碎片”。',
    why: '为什么不能直接把一个进程拆开放入多个小空闲洞？因为连续内存分配要求进程的逻辑地址与物理地址必须连续映射！',
    stageKey: 'evolution'
  },
  {
    step: 2,
    title: '首次适应算法 (First Fit)：低地址优先与顺序切分',
    kicker: '02 · 四大算法之首',
    summary: '空闲分区链严格按照起始地址从小到大排序。新进程到来时，扫描指针从 0 MB 低地址出发依次测试：10MB 放不下 12MB 则跳过，遇到 22MB 足够大时立即分割！',
    why: '首次适应之所以在工程中最常用，是因为它搜索速度最快，而且自然将大空闲块沉淀在高地址区域。',
    stageKey: 'first_fit'
  },
  {
    step: 3,
    title: '邻近适应算法 (Next Fit)：循环指针接续查找',
    kicker: '03 · 避免低地址碎片扎堆',
    summary: '由首次适应改进而来。记录上一次分配结束的位置指针，下次分配时从指针所在位置接着往下找，走到底部再循环回绕到顶部。',
    why: '虽然解决了低地址碎片扎堆的问题，但付出的代价是：高地址的大块空间也会被频繁切碎，丧失了对大作业的包容力。',
    stageKey: 'next_fit'
  },
  {
    step: 4,
    title: '最佳适应算法 (Best Fit)：专挑最小，制造微小碎片地雷',
    kicker: '04 · 贪心策略的代价',
    summary: '将所有空闲分区按容量升序排列。给 9MB 进程分配时，优先挑中仅容得下的 10MB 空闲块，切分后仅剩下 1MB 微小碎片！',
    why: '听上去最节省，但实际上 1MB 的小碎片几乎无法满足任何后续作业，成为死空间，导致外部碎片极其严重。',
    stageKey: 'best_fit'
  },
  {
    step: 5,
    title: '最坏适应算法 (Worst Fit)：大块先上，保留可用余量',
    kicker: '05 · 最大适应的权衡',
    summary: '将空闲分区按容量降序排列。无论进程多大，都从当前最大的 22MB 块中切出。切除 12MB 后还留有 10MB 相对较大的可用空间。',
    why: '虽然避免了微小碎片，但整个系统的“顶梁柱大分区”迅速被瓦解，后续大作业（如 20MB）到达时将束手无策。',
    stageKey: 'worst_fit'
  },
  {
    step: 6,
    title: '外部碎片与紧凑技术 (Compaction)：拼合分散的空闲空间',
    kicker: '06 · 破除外部碎片的终极手段',
    summary: '系统中明明有 10MB + 10MB + 14MB = 34MB 空闲总量，但因为分散在各处，一个 24MB 的大作业依然无法装入！此时操作系统启动“内存紧凑（浮动）”，将所有已分配进程平移推挤到一端，把分散碎片拼接为一整块 34MB 大连续空间。',
    why: '紧凑需要重定位寄存器（Relocation Register）的硬件支持，且数据平移会带来 CPU 停顿开销。',
    stageKey: 'compaction'
  }
]

// 动画导学右侧高动态可视化组件
function MemoryStoryVisual({ stageIndex }) {
  const [ffStep, setFfStep] = useState(0)
  const [bfStep, setBfStep] = useState(0)
  const [wfStep, setWfStep] = useState(0)
  const [isCompacted, setIsCompacted] = useState(false)

  useEffect(() => {
    setFfStep(0)
    setBfStep(0)
    setWfStep(0)
    setIsCompacted(false)

    if (stageIndex === 1) {
      const t1 = setTimeout(() => setFfStep(1), 1200)
      const t2 = setTimeout(() => setFfStep(2), 2400)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    } else if (stageIndex === 3) {
      const t1 = setTimeout(() => setBfStep(1), 1500)
      return () => clearTimeout(t1)
    } else if (stageIndex === 4) {
      const t1 = setTimeout(() => setWfStep(1), 1500)
      return () => clearTimeout(t1)
    } else if (stageIndex === 5) {
      const t1 = setTimeout(() => setIsCompacted(true), 1800)
      return () => clearTimeout(t1)
    }
  }, [stageIndex])

  return (
    <div className="story-right-stage" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'center' }}>
      {/* 阶段 1: 内存分区演进 (固定分区内部碎片 vs 动态分区外部碎片) */}
      {stageIndex === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '0.95rem' }}>固定分区 (Fixed Partitioning) · 产生内部碎片</span>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>预先切好固定格槽 (如 32MB)</span>
            </div>
            <div style={{ height: '48px', background: '#1e293b', borderRadius: '6px', display: 'flex', border: '2px solid #475569', overflow: 'hidden' }}>
              <div style={{ width: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                进程 P1 (16 MB)
              </div>
              <div style={{ width: '50%', background: 'repeating-linear-gradient(45deg, #334155, #334155 10px, #475569 10px, #475569 20px)', color: '#fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold' }}>
                ⚠️ 内部碎片 16 MB (槽位多余空间)
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px' }}>
              分区过大导致进程占用后留下浪费空间，不可分给别人。
            </div>
          </div>

          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.95rem' }}>动态分区 (Dynamic Partitioning) · 产生外部碎片</span>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>作业装入时按需切分</span>
            </div>
            <div style={{ height: '48px', background: '#1e293b', borderRadius: '6px', display: 'flex', border: '2px solid #10b981', overflow: 'hidden' }}>
              <div style={{ width: '25%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold', borderRight: '1px solid #fff' }}>
                P1 (16MB)
              </div>
              <div style={{ width: '15%', background: '#1e293b', color: '#94a3b8', border: '1px dashed #64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                空闲 10M
              </div>
              <div style={{ width: '35%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold', borderRight: '1px solid #fff' }}>
                P2 (22MB)
              </div>
              <div style={{ width: '25%', background: '#1e293b', color: '#94a3b8', border: '1px dashed #64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                外部碎片 16M
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px' }}>
              进程自身紧凑无浪费，但进程释放后在各处留下分散的空隙（外部碎片）。
            </div>
          </div>
        </div>
      )}

      {/* 阶段 2: 首次适应算法 (First Fit) 动态指针扫描 */}
      {stageIndex === 1 && (
        <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '1rem' }}>首次适应 (First Fit) 指针从低地址扫描</span>
            <span style={{ background: '#1e293b', color: '#f8fafc', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              新作业：<strong>P(12 MB)</strong>
            </span>
          </div>

          <div style={{ position: 'relative', height: '64px', background: '#1e293b', borderRadius: '8px', border: '2px solid #475569', display: 'flex', overflow: 'hidden' }}>
            <div style={{
              width: '15.6%',
              background: ffStep === 0 ? 'rgba(239, 68, 68, 0.25)' : '#1e293b',
              border: ffStep === 0 ? '2px solid #ef4444' : '1px dashed #64748b',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s'
            }}>
              <span style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 'bold' }}>10 MB</span>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>0~10M</span>
            </div>

            <div style={{ width: '12.5%', background: '#475569', color: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
              OS (8M)
            </div>

            <div style={{
              width: '34.4%',
              background: ffStep >= 1 ? 'rgba(16, 185, 129, 0.15)' : '#1e293b',
              border: ffStep === 1 ? '2px solid #10b981' : '1px dashed #64748b',
              display: 'flex',
              transition: 'all 0.4s'
            }}>
              {ffStep < 2 ? (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 'bold' }}>22 MB 空闲</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>18~40M</span>
                </div>
              ) : (
                <>
                  <div style={{ width: '54.5%', background: '#3b82f6', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', animation: 'fadeIn 0.4s' }}>
                    <span>P (12M)</span>
                    <span style={{ fontSize: '0.65rem' }}>已分配</span>
                  </div>
                  <div style={{ width: '45.5%', background: '#1e293b', border: '1px dashed #10b981', color: '#34d399', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                    <span>余 10M</span>
                    <span style={{ fontSize: '0.65rem' }}>新空闲块</span>
                  </div>
                </>
              )}
            </div>

            <div style={{ width: '15.6%', background: '#475569', color: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
              OS (10M)
            </div>

            <div style={{ width: '21.9%', background: '#1e293b', border: '1px dashed #64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 'bold' }}>14 MB</span>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>50~64M</span>
            </div>
          </div>

          <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.88rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#60a5fa' }}>🔍 探针状态：</span>
              {ffStep === 0 && <span style={{ color: '#f87171' }}>比对 [0~10M]: 容量 10MB &lt; 所需 12MB ❌ 放不下，探针向后移动...</span>}
              {ffStep === 1 && <span style={{ color: '#34d399' }}>比对 [18~40M]: 容量 22MB &gt;= 12MB ✅ 发现首个可用空闲块！准备切分...</span>}
              {ffStep >= 2 && <span style={{ color: '#60a5fa' }}>🎉 切分成功！P(12MB) 入驻 [18~30M]，切出剩余 [30~40M] (10MB) 重归空闲链！</span>}
            </div>
          </div>
        </div>
      )}

      {/* 阶段 3: 循环首次 / 邻近适应 (Next Fit) */}
      {stageIndex === 2 && (
        <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ color: '#a78bfa', fontWeight: 'bold', fontSize: '1rem' }}>循环首次适应 (Next Fit) 从上次位置顺延</span>
            <span style={{ background: '#1e293b', color: '#f8fafc', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              新作业：<strong>P_new(8 MB)</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: '#1e293b', borderRadius: '8px', border: '1px solid #475569' }}>
            <div style={{ padding: '8px 12px', background: '#334155', borderRadius: '6px', textAlign: 'center', opacity: 0.6 }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>低地址区 [0~10M]</div>
              <div style={{ color: '#f8fafc' }}>10 MB (空闲)</div>
              <div style={{ fontSize: '0.7rem', color: '#fca5a5' }}>跳过 (上次已过)</div>
            </div>

            <div style={{ color: '#a78bfa', fontSize: '1.4rem' }}>➔</div>

            <div style={{ padding: '8px 14px', background: 'rgba(167, 139, 250, 0.15)', border: '2px solid #a78bfa', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#c4b5fd' }}>📍 上次分配结束位置</div>
              <div style={{ color: '#f8fafc', fontWeight: 'bold' }}>地址 30 MB 处</div>
              <div style={{ fontSize: '0.75rem', color: '#34d399' }}>本次直接从此处往下搜寻</div>
            </div>

            <div style={{ color: '#a78bfa', fontSize: '1.4rem' }}>➔</div>

            <div style={{ padding: '8px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '2px solid #10b981', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#86efac' }}>命中高地址区 [50~64M]</div>
              <div style={{ color: '#fff', fontWeight: 'bold' }}>14 MB (空闲)</div>
              <div style={{ fontSize: '0.75rem', color: '#86efac' }}>切出 8MB 给新进程</div>
            </div>
          </div>

          <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.6' }}>
            💡 <strong>特征评价：</strong>指针不再回流到低地址，使得空闲块分配更均匀，循环时间短；但缺点是<strong>高地址的大空闲块也过早被切散</strong>。
          </div>
        </div>
      )}

      {/* 阶段 4: 最佳适应算法 (Best Fit) */}
      {stageIndex === 3 && (
        <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#34d399', fontWeight: 'bold', fontSize: '1rem' }}>最佳适应 (Best Fit) 容量升序排列，挑最小满足块</span>
            <span style={{ background: '#1e293b', color: '#f8fafc', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              待分配：<strong>P(9 MB)</strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ flex: 1, padding: '10px', borderRadius: '6px', background: bfStep === 1 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)', border: `2px solid ${bfStep === 1 ? '#ef4444' : '#10b981'}`, textAlign: 'center' }}>
              <div style={{ color: '#10b981', fontWeight: 'bold' }}>10 MB (候选 1 · 最小满足)</div>
              {bfStep === 1 ? (
                <div style={{ fontSize: '0.8rem', color: '#f87171', marginTop: '4px' }}>
                  放入 9MB ➔ <strong>仅剩 1MB 微小碎片！</strong>
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>能容纳 9MB 且差值最小 (余1MB)</div>
              )}
            </div>

            <div style={{ flex: 1, padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #475569', textAlign: 'center', opacity: 0.6 }}>
              <div style={{ color: '#f8fafc', fontWeight: 'bold' }}>14 MB (候选 2)</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>较大，暂保留</div>
            </div>

            <div style={{ flex: 1, padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #475569', textAlign: 'center', opacity: 0.6 }}>
              <div style={{ color: '#f8fafc', fontWeight: 'bold' }}>22 MB (候选 3)</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>最大块，保留给大作业</div>
            </div>
          </div>

          <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '6px' }}>
            <span style={{ color: '#f87171', fontWeight: 'bold', fontSize: '0.88rem' }}>⚠️ 外部碎片陷阱：</span>
            <span style={{ color: '#fca5a5', fontSize: '0.84rem', marginLeft: '6px' }}>
              虽然保留了 14MB 和 22MB 大块，但切出的 1MB 碎片太小，几乎无法分配给任何作业，成为长期占据内存表的“无效垃圾碎片”！
            </span>
          </div>
        </div>
      )}

      {/* 阶段 5: 最坏适应算法 (Worst Fit) */}
      {stageIndex === 4 && (
        <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '1rem' }}>最坏适应 (Worst Fit) 容量降序排列，总是切分最大块</span>
            <span style={{ background: '#1e293b', color: '#f8fafc', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              待分配：<strong>P(12 MB)</strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ flex: 1.2, padding: '10px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.15)', border: '2px solid #f59e0b', textAlign: 'center' }}>
              <div style={{ color: '#fbbf24', fontWeight: 'bold' }}>22 MB (当前最大块 · 首选)</div>
              <div style={{ fontSize: '0.8rem', color: '#fde68a', marginTop: '4px' }}>
                切出 12MB ➔ <strong>剩余 10MB 仍然很大！</strong>
              </div>
            </div>

            <div style={{ flex: 1, padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #475569', textAlign: 'center', opacity: 0.6 }}>
              <div style={{ color: '#f8fafc' }}>14 MB (次大块)</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>不选</div>
            </div>

            <div style={{ flex: 1, padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #475569', textAlign: 'center', opacity: 0.6 }}>
              <div style={{ color: '#f8fafc' }}>10 MB (最小块)</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>不选</div>
            </div>
          </div>

          <div style={{ marginTop: '14px', padding: '10px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }}>
            <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '0.88rem' }}>💡 考点分析：</span>
            <span style={{ color: '#cbd5e1', fontSize: '0.84rem', marginLeft: '6px' }}>
              优点是剩下的块不至于太小，碎片率低；但致命缺点是<strong>系统里再也没有超大连续块了</strong>，若下一秒来一个 18MB 的大进程将直接无法装入！
            </span>
          </div>
        </div>
      )}

      {/* 阶段 6: 外部碎片与内存紧凑 (Compaction) */}
      {stageIndex === 5 && (
        <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '1rem' }}>内存紧凑技术 (Compaction) 动态拼合碎片</span>
            <button
              onClick={() => setIsCompacted(v => !v)}
              style={{ background: isCompacted ? '#10b981' : '#3b82f6', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', fontSize: '0.82rem', cursor: 'pointer' }}
            >
              {isCompacted ? '↩ 还原分散状态' : '⚡ 立即执行内存紧凑'}
            </button>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '8px' }}>
            当前系统空闲总和：<strong>10MB + 10MB + 14MB = 34 MB</strong>！新作业 <strong>P_Large(24MB)</strong> 进场：
          </div>

          <div style={{ position: 'relative', height: '60px', background: '#1e293b', borderRadius: '8px', border: '2px solid #38bdf8', display: 'flex', overflow: 'hidden', transition: 'all 0.5s ease' }}>
            {!isCompacted ? (
              <>
                <div style={{ width: '15.6%', border: '1px dashed #ef4444', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                  碎片 10M
                </div>
                <div style={{ width: '12.5%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  已占 8M
                </div>
                <div style={{ width: '34.4%', border: '1px dashed #ef4444', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                  碎片 10M
                </div>
                <div style={{ width: '15.6%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  已占 10M
                </div>
                <div style={{ width: '21.9%', border: '1px dashed #ef4444', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                  碎片 14M
                </div>
              </>
            ) : (
              <>
                <div style={{ width: '28.1%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold', borderRight: '2px solid #fff' }}>
                  所有已占用分区 (靠左重定位 18M)
                </div>
                <div style={{ width: '71.9%', background: 'rgba(16, 185, 129, 0.25)', border: '2px solid #10b981', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold', animation: 'fadeIn 0.5s' }}>
                  🎉 紧凑拼接完成：连续大空闲块 34 MB（可容纳 24MB 大作业！）
                </div>
              </>
            )}
          </div>

          <div style={{ marginTop: '12px', fontSize: '0.84rem', color: isCompacted ? '#34d399' : '#f87171' }}>
            {isCompacted
              ? '✅ 紧凑成功：将所有作业平移推挤到低地址一端，零散的外部碎片汇聚成连续大空间，24MB 大作业成功分配！'
              : '❌ 未紧凑时：由于空间分散，即使总空闲量有 34MB，最大的单个空闲块仅 14MB，24MB 作业分配失败！'}
          </div>
        </div>
      )}
    </div>
  )
}

// 导学组件
function MemoryStory() {
  const [step, setStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStep(prev => {
          if (prev >= STORY_STAGES.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 4200)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isPlaying])

  const cur = STORY_STAGES[step]

  return (
    <section className="transformer-story memory-story" style={{ marginBottom: '24px' }}>
      <header className="story-intro">
        <div>
          <span className="story-kicker">动画导学 · 约 3 分钟</span>
          <h2 style={{ fontSize: '1.6rem' }}>空闲总量够，不代表有地方能放进去</h2>
          <p style={{ fontSize: '1.05rem', color: '#cbd5e1' }}>
            连续分配要求进程地址空间不可拆分，必须在四大分配算法中做出空间利用率与分配速度的平衡。
          </p>
        </div>
        <div className="memory-story-badge" style={{ padding: '16px 20px', minWidth: '130px' }}>
          <strong style={{ fontSize: '1.4rem' }}>64 MB</strong>
          <span>连续地址空间</span>
          <small>4 大算法 + 紧凑技术</small>
        </div>
      </header>

      {/* 步骤导航条 */}
      <nav className="story-timeline" style={{ '--story-steps': STORY_STAGES.length }}>
        {STORY_STAGES.map((s, idx) => (
          <button
            key={idx}
            className={`${step === idx ? 'active' : ''} ${idx < step ? 'passed' : ''}`}
            onClick={() => { setStep(idx); setIsPlaying(false) }}
          >
            <i>{idx < step ? '✓' : idx + 1}</i>
            <span>{s.title.split('：')[0].split('(')[0].trim()}</span>
          </button>
        ))}
      </nav>

      {/* 导学主体布局：左侧文字说明(35%)，右侧大画幅动画(65%) */}
      <div className="story-stage" style={{ display: 'grid', gridTemplateColumns: '35% 65%', gap: '20px', minHeight: '340px' }}>
        <div className="story-copy" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 'bold' }}>{cur.kicker}</span>
            <h3 style={{ fontSize: '1.3rem', margin: '8px 0', color: '#fff' }}>{cur.title}</h3>
            <p style={{ fontSize: '1rem', lineHeight: '1.7', color: '#cbd5e1' }}>{cur.summary}</p>
          </div>
          <aside style={{ background: 'rgba(59, 130, 246, 0.12)', borderLeft: '4px solid #3b82f6', padding: '12px 14px', borderRadius: '4px' }}>
            <strong style={{ color: '#60a5fa', fontSize: '0.95rem' }}>为什么重要？</strong>
            <p style={{ fontSize: '0.9rem', color: '#e2e8f0', margin: '4px 0 0' }}>{cur.why}</p>
          </aside>
        </div>

        {/* 右侧专属动态可视化 */}
        <div className="story-visual" style={{ background: '#0a101d', borderRadius: '12px', padding: '16px', border: '1px solid #1e293b', display: 'flex', alignItems: 'center' }}>
          <MemoryStoryVisual stageIndex={step} />
        </div>
      </div>

      <footer className="story-controls">
        <button
          disabled={step === 0}
          onClick={() => { setStep(s => Math.max(0, s - 1)); setIsPlaying(false) }}
        >
          ← 上一步
        </button>
        <button
          className={`story-play ${isPlaying ? 'playing' : ''}`}
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? '暂停' : '▶ 自动播放导学'}
        </button>
        <button
          disabled={step === STORY_STAGES.length - 1}
          onClick={() => { setStep(s => Math.min(STORY_STAGES.length - 1, s + 1)); setIsPlaying(false) }}
        >
          下一步 →
        </button>
      </footer>
    </section>
  )
}

// 自由探索模拟算法函数
function simulateAllocate(method, jobsList, lastIndex = 0) {
  let seg = INITIAL_SEGMENTS.map(x => ({ ...x }))
  let nextFitPointer = lastIndex
  const steps = [
    {
      segments: seg.map(x => ({ ...x })),
      message: '初始物理内存布局：存在 3 个空闲分区（10MB, 22MB, 14MB），2 个操作系统占用块。',
      jobIndex: 0,
      done: false,
      free: 46,
      largest: 22,
      holes: 3,
      failed: 0,
      pointerAt: 0
    }
  ]

  let failedCount = 0

  jobsList.forEach((job, jobIdx) => {
    const holeIndices = []
    seg.forEach((s, idx) => {
      if (s.type === 'hole' && s.size >= job.size) {
        holeIndices.push(idx)
      }
    })

    if (holeIndices.length === 0) {
      failedCount++
      const holes = seg.filter(s => s.type === 'hole')
      const totalFree = holes.reduce((acc, h) => acc + h.size, 0)
      const maxHole = Math.max(0, ...holes.map(h => h.size))
      steps.push({
        segments: seg.map(x => ({ ...x })),
        message: `❌ ${job.name}（${job.size} MB）分配失败！总空闲仍有 ${totalFree} MB，但最大连续单块仅 ${maxHole} MB，存在外部碎片。`,
        jobIndex: jobIdx + 1,
        done: false,
        free: totalFree,
        largest: maxHole,
        holes: holes.length,
        failed: failedCount,
        pointerAt: nextFitPointer
      })
      return
    }

    let targetIndex = -1

    if (method === 'first') {
      targetIndex = holeIndices[0]
    } else if (method === 'next') {
      const after = holeIndices.filter(i => i >= nextFitPointer)
      if (after.length > 0) {
        targetIndex = after[0]
      } else {
        targetIndex = holeIndices[0]
      }
      nextFitPointer = targetIndex
    } else if (method === 'best') {
      targetIndex = [...holeIndices].sort((a, b) => seg[a].size - seg[b].size)[0]
    } else if (method === 'worst') {
      targetIndex = [...holeIndices].sort((a, b) => seg[b].size - seg[a].size)[0]
    }

    const chosenHole = seg[targetIndex]
    const remainSize = chosenHole.size - job.size
    const newStart = chosenHole.start

    const replacement = [
      { type: 'process', size: job.size, name: job.name, color: job.color, start: newStart }
    ]

    if (remainSize > 0) {
      replacement.push({
        type: 'hole',
        size: remainSize,
        start: newStart + job.size
      })
    }

    seg.splice(targetIndex, 1, ...replacement)

    const holes = seg.filter(s => s.type === 'hole')
    const totalFree = holes.reduce((acc, h) => acc + h.size, 0)
    const maxHole = Math.max(0, ...holes.map(h => h.size))

    steps.push({
      segments: seg.map(x => ({ ...x })),
      message: `✅ ${job.name}（${job.size} MB）成功分配至 [${newStart} MB] 起始地址！原空闲块 ${chosenHole.size} MB，切分后剩余 ${remainSize} MB。`,
      jobIndex: jobIdx + 1,
      done: false,
      free: totalFree,
      largest: maxHole,
      holes: holes.length,
      failed: failedCount,
      pointerAt: targetIndex
    })
  })

  const finalHoles = seg.filter(s => s.type === 'hole')
  steps.push({
    segments: seg.map(x => ({ ...x })),
    message: `🏁 全部 ${jobsList.length} 个作业分配尝试结束。总计失败 ${failedCount} 次。`,
    jobIndex: jobsList.length,
    done: true,
    free: finalHoles.reduce((acc, h) => acc + h.size, 0),
    largest: Math.max(0, ...finalHoles.map(h => h.size)),
    holes: finalHoles.length,
    failed: failedCount,
    pointerAt: nextFitPointer
  })

  return steps
}

export default function MemoryPartitionExperiment({ experiment }) {
  const [method, setMethod] = useState('first')
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [isCompactedLab, setIsCompactedLab] = useState(false)

  const steps = useMemo(() => simulateAllocate(method, DEFAULT_JOBS), [method])
  const state = steps[Math.min(step, steps.length - 1)]

  useEffect(() => {
    setStep(0)
    setPlaying(false)
    setIsCompactedLab(false)
  }, [method])

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => {
      setStep(v => {
        if (v >= steps.length - 1) {
          setPlaying(false)
          return v
        }
        return v + 1
      })
    }, 1300)
    return () => clearInterval(t)
  }, [playing, steps.length])

  const handleCompactionLab = () => {
    setIsCompactedLab(true)
  }

  const currentSegments = useMemo(() => {
    if (!isCompactedLab) return state.segments
    const usedParts = state.segments.filter(s => s.type !== 'hole')
    let curOffset = 0
    const compactedUsed = usedParts.map(u => {
      const item = { ...u, start: curOffset }
      curOffset += u.size
      return item
    })
    const totalFreeSize = 64 - curOffset
    if (totalFreeSize > 0) {
      compactedUsed.push({
        type: 'hole',
        size: totalFreeSize,
        start: curOffset
      })
    }
    return compactedUsed
  }, [isCompactedLab, state.segments])

  const algoInfo = ALGORITHM_CONFIG[method]

  return (
    <>
      <ExperimentHeader experiment={experiment} eyebrow="操作系统实验 04 · 内存管理" />
      
      {/* 动画导学区 */}
      <MemoryStory />

      {/* 自由探索交互实验室 */}
      <div className="explore-heading">
        <span>自由探索 · 同一组物理内存空闲块，四大算法实时推演</span>
        <h2>动态内存分区分配算法对比实验室</h2>
        <p>在首次适应、邻近适应、最佳适应与最坏适应之间自由切换，观察进程落点、切割后剩余碎片与外部碎片率。</p>
      </div>

      <div className="lab-layout memory-layout" style={{ gridTemplateColumns: '340px 1fr' }}>
        {/* 左侧控制台 */}
        <aside className="control-panel">
          <div className="panel-title">
            <span>分配算法选择</span>
            <i>4 大经典策略</i>
          </div>

          <label className="field-block">
            <span>选择分配策略</span>
            <select
              value={method}
              onChange={e => setMethod(e.target.value)}
              style={{ fontSize: '0.95rem', padding: '8px', borderRadius: '6px', fontWeight: 'bold' }}
            >
              {Object.entries(ALGORITHM_CONFIG).map(([k, v]) => (
                <option value={k} key={k}>{v.name}</option>
              ))}
            </select>
          </label>

          <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
            <div style={{ fontWeight: 'bold', color: '#1e293b' }}>策略原理：</div>
            <div style={{ color: '#64748b', marginTop: '4px' }}>{algoInfo.desc}</div>
            <div style={{ marginTop: '6px', color: '#059669' }}><strong>优势：</strong>{algoInfo.pros}</div>
            <div style={{ marginTop: '2px', color: '#dc2626' }}><strong>代价：</strong>{algoInfo.cons}</div>
          </div>

          <div className="memory-jobs" style={{ marginTop: '14px' }}>
            <span>待装入进程队列 (按序请求)</span>
            {DEFAULT_JOBS.map((j, i) => (
              <div
                className={i === state.jobIndex ? 'active' : i < state.jobIndex ? 'done' : ''}
                key={j.name}
                style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between' }}
              >
                <b>{j.name}</b>
                <span>{j.size} MB</span>
              </div>
            ))}
          </div>

          <div className="step-counter" style={{ marginTop: '12px' }}>
            <span>分配进度</span>
            <strong>{step} / {steps.length - 1}</strong>
          </div>

          <input
            className="step-slider"
            type="range"
            min="0"
            max={steps.length - 1}
            value={step}
            onChange={e => {
              setStep(Number(e.target.value))
              setPlaying(false)
              setIsCompactedLab(false)
            }}
          />

          <div className="step-buttons">
            <button disabled={!step} onClick={() => { setStep(step - 1); setIsCompactedLab(false) }}>
              ← 上一步
            </button>
            <button disabled={step === steps.length - 1} onClick={() => { setStep(step + 1); setIsCompactedLab(false) }}>
              下一步 →
            </button>
          </div>

          <button
            className="tree-play"
            onClick={() => {
              if (state.done) setStep(0)
              setIsCompactedLab(false)
              setPlaying(v => !v)
            }}
          >
            {playing ? '暂停' : state.done ? '重新播放' : '▶ 自动单步推演'}
          </button>

          {/* 一键紧凑按钮 */}
          <div style={{ marginTop: '14px' }}>
            <button
              onClick={handleCompactionLab}
              disabled={isCompactedLab}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                background: isCompactedLab ? '#10b981' : '#6366f1',
                color: '#fff',
                border: 'none',
                fontWeight: 'bold',
                cursor: isCompactedLab ? 'default' : 'pointer'
              }}
            >
              {isCompactedLab ? '✅ 已执行紧凑 (碎片已融合)' : '⚡ 一键内存紧凑 (消除外部碎片)'}
            </button>
          </div>
        </aside>

        {/* 右侧内存分布大画幅 */}
        <section className="visual-panel memory-visual" style={{ minHeight: '480px' }}>
          <div className="visual-toolbar">
            <div>
              <strong style={{ fontSize: '1.1rem' }}>64 MB 物理内存实时映射图</strong>
              <span style={{ fontSize: '0.85rem' }}>灰色：系统占用 · 彩色：作业进程 · 虚线：空闲分区 (Hole)</span>
            </div>
            <span className="source-chip" style={{ fontSize: '0.9rem', padding: '4px 10px' }}>{algoInfo.en}</span>
          </div>

          {/* 实时决策解释 */}
          <div className="live-explanation" style={{ background: '#f8fafc', borderLeft: '4px solid #3b82f6', padding: '12px 16px', borderRadius: '6px', margin: '14px 0' }}>
            <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 'bold' }}>当前步决策日志</span>
            <strong style={{ display: 'block', fontSize: '1.05rem', margin: '4px 0', color: '#1e293b' }}>{state.message}</strong>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              连续内存分配核心法则：进程必须占用一整段相邻的物理地址，绝不拆分。
            </p>
          </div>

          {/* 连续内存条大可视化 */}
          <div style={{ margin: '30px 10px 45px' }}>
            <div className="memory-map" style={{ height: '140px', border: '3px solid #1e293b', borderRadius: '10px', position: 'relative', display: 'flex', background: '#f8fafc' }}>
              {currentSegments.map((s, i) => (
                <div
                  key={i}
                  className={s.type}
                  style={{
                    width: `${(s.size / 64) * 100}%`,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRight: '1px solid rgba(255,255,255,0.7)',
                    background: s.type === 'hole'
                      ? 'repeating-linear-gradient(45deg, #f8fafc, #f8fafc 8px, #edf2f7 8px, #edf2f7 16px)'
                      : s.color || (s.name.includes('OS') ? '#475569' : '#3b82f6'),
                    color: s.type === 'hole' ? '#64748b' : '#fff',
                    transition: 'all 0.4s ease'
                  }}
                >
                  <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{s.name ?? '空闲 (Hole)'}</span>
                  <b style={{ fontSize: '0.85rem', marginTop: '2px' }}>{s.size} MB</b>
                  {/* 起始物理地址标尺 */}
                  <i style={{ position: 'absolute', left: '4px', bottom: '-26px', fontSize: '0.8rem', color: '#64748b', fontStyle: 'normal' }}>
                    {s.start}M
                  </i>
                </div>
              ))}
              <em style={{ position: 'absolute', right: '4px', bottom: '-26px', fontSize: '0.8rem', color: '#64748b', fontStyle: 'normal', fontWeight: 'bold' }}>
                64 MB
              </em>
            </div>
          </div>

          {/* 指标看板 */}
          <div className="memory-metrics" style={{ marginTop: '20px' }}>
            <div>
              <span>系统总空闲容量</span>
              <strong style={{ color: '#10b981' }}>{state.free} MB</strong>
            </div>
            <div>
              <span>最大连续空闲块</span>
              <strong style={{ color: '#3b82f6' }}>{state.largest} MB</strong>
            </div>
            <div>
              <span>分散空闲块数量</span>
              <strong style={{ color: '#f59e0b' }}>{state.holes} 个</strong>
            </div>
            <div>
              <span>分配失败作业</span>
              <strong style={{ color: state.failed > 0 ? '#ef4444' : '#10b981' }}>{state.failed} 个</strong>
            </div>
          </div>

          {/* 外部碎片深度分析 */}
          <div className="fragment-note" style={{ marginTop: '16px' }}>
            <strong>📊 外部碎片分析诊断</strong>
            <p>
              {state.free > state.largest
                ? `⚠️ 发现外部碎片！当前系统中总空闲量为 ${state.free} MB，但最大连续单块仅 ${state.largest} MB。剩余空闲空间已被切割分散在 ${state.holes} 个不连续的碎片洞中。点击左侧“一键内存紧凑”可消除外部碎片。`
                : '✅ 空间连续性良好，当前所有可用空闲容量集中在整块大分区中。'}
            </p>
          </div>
        </section>
      </div>

      <LearningCycle
        experimentId="memory-partition"
        prediction={{
          question: '总空闲空间为 20 MB，但最大空闲块只有 8 MB，能否连续分配 12 MB 进程？',
          options: ['可以', '不可以', '取决于进程名称'],
          answer: '不可以',
          explanation: '连续分配要求单个空闲块足够大，分散的总量不能直接合并使用，除非系统启动了内存紧凑技术。'
        }}
        operation={{
          title: '比较四大适应算法的碎片分布',
          instruction: '分别播放首次、邻近、最佳和最坏适应到结束，对比它们的最大空闲块大小与分配失败次数。'
        }}
        observation={`${algoInfo.name} 当前总空闲 ${state.free} MB，最大连续空闲块 ${state.largest} MB，共 ${state.holes} 个空闲块。`}
        summaryPrompt="为什么最佳适应不一定产生最少的外部碎片？邻近适应相比首次适应有哪些得失？"
      />
    </>
  )
}
