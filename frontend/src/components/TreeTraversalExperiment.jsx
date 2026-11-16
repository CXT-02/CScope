import React, { useEffect, useMemo, useState } from 'react'
import { ExperimentHeader } from './AttentionExperiment'
import LearningCycle from './LearningCycle'

const TREES = {
  balanced: { name: '完全二叉树', root: 'A', nodes: [node('A',360,55,'B','C'),node('B',190,155,'D','E'),node('C',530,155,'F','G'),node('D',105,270),node('E',275,270),node('F',445,270),node('G',615,270)] },
  incomplete: { name: '非完全二叉树', root: 'A', nodes: [node('A',360,55,'B','C'),node('B',190,155,null,'D'),node('C',530,155,'E','F'),node('D',275,270),node('E',445,270,null,'G'),node('F',615,270),node('G',500,365)] },
  skewed: { name: '左斜树', root: 'A', nodes: [node('A',500,45,'B'),node('B',400,125,'C'),node('C',300,205,'D'),node('D',200,285,'E'),node('E',100,365)] },
}
const MODES = {
  preorder: { name: '前序遍历', rule: '根 → 左 → 右', color: '#6558e8' },
  inorder: { name: '中序遍历', rule: '左 → 根 → 右', color: '#159a83' },
  postorder: { name: '后序遍历', rule: '左 → 右 → 根', color: '#ee6c4d' },
  levelorder: { name: '层序遍历', rule: '从上到下、从左到右', color: '#c88724' },
}
const STORY = [
  { short:'结构',title:'先看结构：树不是一条线，而是递归分支',eyebrow:'01 · 建立地图',why:'每个节点都可能连接左右子树，因此遍历必须明确“何时访问根节点”。' },
  { short:'递归',title:'从 A 走到 B、再走到 D 时，A 和 B 的任务都还没有完成',eyebrow:'02 · 理解返回',why:'调用栈保存“返回哪个父节点、接下来还要处理哪棵子树”，所以 D 完成后先回到 B，再由 B 回到 A。' },
  { short:'前序',title:'前序：一到节点就先访问，再探索子树',eyebrow:'03 · 根左右',why:'先记录根节点，适合复制树结构、生成目录层级等场景。' },
  { short:'中序',title:'中序：先走左侧，回到根，再走右侧',eyebrow:'04 · 左根右',why:'对二叉搜索树使用中序遍历，可以得到从小到大的有序序列。' },
  { short:'后序',title:'后序：两个子树都处理完，最后访问根',eyebrow:'05 · 左右根',why:'先处理子节点再处理父节点，适合删除树、计算目录大小。' },
  { short:'层序',title:'层序：用队列按距离根节点的层级推进',eyebrow:'06 · 广度优先',why:'队列保持先进先出，使同一层节点在更深层节点之前被访问。' },
  { short:'对比',title:'同一棵树，访问顺序取决于“根在何时被记录”',eyebrow:'07 · 形成规律',why:'理解根节点的访问时机，比孤立背诵四条结果更容易迁移到新树。' },
]

export default function TreeTraversalExperiment({ experiment }) {
  const [treeKey,setTreeKey]=useState('balanced'); const [mode,setMode]=useState('preorder'); const [stepIndex,setStepIndex]=useState(0); const [playing,setPlaying]=useState(false); const [speed,setSpeed]=useState(1)
  const tree=TREES[treeKey]; const steps=useMemo(()=>buildTraversal(tree,mode),[tree,mode]); const step=steps[Math.min(stepIndex,steps.length-1)]
  useEffect(()=>{setStepIndex(0);setPlaying(false)},[treeKey,mode])
  useEffect(()=>{if(!playing)return undefined;const timer=window.setInterval(()=>setStepIndex((current)=>{if(current>=steps.length-1){setPlaying(false);return current}return current+1}),800/speed);return()=>window.clearInterval(timer)},[playing,speed,steps.length])
  return <>
    <ExperimentHeader experiment={experiment} eyebrow="算法实验 04" />
    <TreeStory tree={TREES.balanced} />
    <div className="explore-heading"><span>自由探索 · 同一棵树，四种访问顺序</span><h2>跟随当前节点，看懂递归栈与队列</h2><p>切换树形和遍历方式，逐步观察“进入节点、访问节点、返回父节点”的完整过程。</p></div>
    <div className="lab-layout tree-lab-layout"><aside className="control-panel"><div className="panel-title"><span>遍历控制</span><i>{step.done?'已完成':'逐步运行'}</i></div><label className="field-block"><span>树的形状</span><small>树形改变后，四种遍历的结果都会重新计算。</small><select value={treeKey} onChange={(event)=>setTreeKey(event.target.value)}>{Object.entries(TREES).map(([key,item])=><option value={key} key={key}>{item.name}</option>)}</select></label><label className="field-block"><span>遍历方式</span><small>{MODES[mode].rule}；切换后注意根节点访问时机。</small><select value={mode} onChange={(event)=>setMode(event.target.value)}>{Object.entries(MODES).map(([key,item])=><option value={key} key={key}>{item.name}</option>)}</select></label><div className="tree-rule" style={{'--tree-accent':MODES[mode].color}}><span>核心顺序</span><strong>{MODES[mode].rule}</strong></div><div className="step-counter"><span>当前步骤</span><strong>{stepIndex} / {steps.length-1}</strong></div><input className="step-slider" type="range" min="0" max={steps.length-1} value={stepIndex} onChange={(event)=>{setStepIndex(Number(event.target.value));setPlaying(false)}}/><div className="step-buttons"><button type="button" disabled={stepIndex===0} onClick={()=>setStepIndex((v)=>v-1)}>← 上一步</button><button type="button" disabled={stepIndex===steps.length-1} onClick={()=>setStepIndex((v)=>v+1)}>下一步 →</button></div><button className={`tree-play ${playing?'stop':''}`} type="button" onClick={()=>{if(step.done)setStepIndex(0);setPlaying((v)=>!v)}}>{playing?'暂停遍历':step.done?'重新播放':'▶ 自动遍历'}</button><div className="live-explanation" key={`${mode}-${stepIndex}`}><span>这一步发生了什么</span><strong>{step.action}</strong><p>{step.message}</p></div></aside>
      <section className="visual-panel tree-visual-panel"><div className="visual-toolbar"><div><strong>{tree.name} · {MODES[mode].name}</strong><span>橙色：当前节点 · 绿色：已经访问 · 虚线：当前递归路径</span></div><span className="source-chip">根节点 {tree.root}</span></div><TreeCanvas tree={tree} step={step}/><div className="tree-state-row"><div className="visit-sequence"><span>访问结果</span><div>{step.visited.length?step.visited.map((id,index)=><i key={`${id}-${index}`}>{id}<b>{index+1}</b></i>):<small>尚未访问任何节点</small>}</div></div><div className="tree-memory"><span>{mode==='levelorder'?'队列 Queue':'递归栈 Stack'}</span><div>{step.memory.length?step.memory.map((id,index)=><i key={`${id}-${index}`}>{id}</i>):<small>空</small>}</div><p>{mode==='levelorder'?'队首在左侧，先进入的节点先处理。':'栈顶在右侧，当前递归调用最后进入、最先返回。'}</p></div></div></section></div>
    <TreeCodeDemo mode={mode} action={step.action} />
    <LearningCycle experimentId="tree-traversal" prediction={{question:'前序遍历与中序遍历的关键区别是什么？',options:['根节点被访问的时机不同','是否访问叶子节点','树中节点数量不同'],answer:'根节点被访问的时机不同',explanation:' 前序在进入节点时访问根，中序在完成左子树后访问根。'}} operation={{title:'比较同一棵树的四种结果',instruction:'保持完全二叉树不变，依次运行前序、中序、后序和层序，观察根节点 A 分别第几个被访问。'}} observation={`${MODES[mode].name}当前已访问 ${step.visited.length}/${tree.nodes.length} 个节点，序列为 ${step.visited.join(' → ')||'空'}。`} summaryPrompt="递归栈和层序队列分别如何决定下一个被处理的节点？" />
  </>
}

function TreeCanvas({tree,step}){const path=new Set(step.memory);return <svg className="tree-canvas" viewBox="0 0 720 420" role="img" aria-label="二叉树遍历动画">{tree.nodes.flatMap((parent)=>['left','right'].map((side)=>{const child=tree.nodes.find((n)=>n.id===parent[side]);if(!child)return null;const active=path.has(parent.id)&&path.has(child.id);return <line key={`${parent.id}-${child.id}`} className={active?'active-path':''} x1={parent.x} y1={parent.y} x2={child.x} y2={child.y}/> }))}{tree.nodes.map((n)=>{const state=step.current===n.id?'current':step.visited.includes(n.id)?'visited':path.has(n.id)?'pending':'';return <g className={`tree-node ${state}`} key={n.id} transform={`translate(${n.x},${n.y})`}><circle r="29"/><text y="5">{n.id}</text>{step.visited.includes(n.id)&&<text className="visit-order" y="-38">#{step.visited.indexOf(n.id)+1}</text>}</g>})}</svg>}

function TreeStory({tree}){const [step,setStep]=useState(0);const [playing,setPlaying]=useState(false);const [speed,setSpeed]=useState(1);useEffect(()=>{if(!playing)return undefined;const timer=window.setTimeout(()=>setStep((v)=>{if(v===STORY.length-1){setPlaying(false);return v}return v+1}),2700/speed);return()=>window.clearTimeout(timer)},[playing,speed,step]);function choose(v){setStep(v);setPlaying(false)}return <section className="transformer-story tree-story"><header className="story-intro"><div><span className="story-kicker">动画导学 · 约 3 分钟</span><h2>根节点什么时候被访问，决定遍历的名字</h2><p>用同一棵树贯穿四种算法，重点观察根、左子树和右子树的先后关系。</p></div><div className="tree-story-rules">{Object.values(MODES).map((item)=><span key={item.name}><i style={{background:item.color}}/>{item.name}<b>{item.rule}</b></span>)}</div></header><nav className="story-timeline" style={{'--story-steps':STORY.length}}>{STORY.map((item,index)=><button type="button" key={item.short} className={`${index===step?'active':''} ${index<step?'passed':''}`} onClick={()=>choose(index)}><i>{index<step?'✓':index+1}</i><span>{item.short}</span></button>)}</nav><div className="story-stage" key={step}><div className="story-copy"><span>{STORY[step].eyebrow}</span><h3>{STORY[step].title}</h3><p>{storyText(step)}</p><aside><strong>为什么需要它？</strong><p>{STORY[step].why}</p></aside></div><div className="story-visual"><TreeStoryVisual step={step} tree={tree}/></div></div><footer className="story-controls"><button type="button" disabled={step===0} onClick={()=>choose(step-1)}>← 上一步</button><button className="story-play" type="button" onClick={()=>{if(step===STORY.length-1)setStep(0);setPlaying((v)=>!v)}}>{playing?'暂停讲解':step===STORY.length-1?'重新播放':'▶ 自动播放'}</button><button type="button" disabled={step===STORY.length-1} onClick={()=>choose(step+1)}>下一步 →</button><label>速度<select value={speed} onChange={(e)=>setSpeed(Number(e.target.value))}><option value={.75}>0.75×</option><option value={1}>1×</option><option value={1.5}>1.5×</option></select></label></footer></section>}
const RECURSION_STEPS = [
  {
    title: '初始状态',
    desc: '从根节点 A 准备发起递归调用 dfs(A)，此时调用栈为空。',
    current: null,
    stack: [],
    path: [],
    flow: '准备开始',
    whyStillThere: '调用栈尚未建立任何活动帧。',
  },
  {
    title: '1. 进入根节点 A',
    desc: '调用 dfs(A) 压入栈底。A 发现有左孩子 B，准备递归深入 B；A 自身的右孩子 C 还完全没碰，A 必须在栈中等待。',
    current: 'A',
    stack: [
      { id: 'A', role: '根节点', wait: '正在等待左子树 B 完成；右子树 C 还未处理' }
    ],
    path: ['A'],
    flow: 'dfs(A) 入栈 ──▶ 准备深入左孩子 B',
    whyStillThere: 'A 的右子树 C 还没遍历，所以 A 绝不能出栈。',
  },
  {
    title: '2. 深入左孩子 B',
    desc: '调用 dfs(B) 压入栈顶。B 也有左孩子 D，准备继续递归深入 D；此时 A 和 B 的任务都没完成，都保存在栈中！',
    current: 'B',
    stack: [
      { id: 'A', role: '根节点', wait: '等待 B 完成，之后还要处理 C' },
      { id: 'B', role: '当前根', wait: '正在等待左子树 D 完成；右子树 E 还未处理' }
    ],
    path: ['A', 'B'],
    flow: 'dfs(B) 入栈 ──▶ 准备深入左孩子 D',
    whyStillThere: 'A 在等 B，B 在等 D，栈顶为当前活跃的 B。',
  },
  {
    title: '3. 深入叶子节点 D',
    desc: '调用 dfs(D) 压入栈顶，栈深达到 3 层 [A, B, D]。D 是叶子节点，左右孩子均为空，其自身任务即将完成。',
    current: 'D',
    stack: [
      { id: 'A', role: '根节点', wait: '等待 B 完成，之后处理 C' },
      { id: 'B', role: '父节点', wait: '等待 D 完成，之后处理 E' },
      { id: 'D', role: '叶子节点', wait: '左右子树均为空，任务完成准备返回' }
    ],
    path: ['A', 'B', 'D'],
    flow: 'dfs(D) 入栈 ──▶ 到达最深叶子 D',
    whyStillThere: 'D 到达递归边界，即将成为第一个执行完毕出栈的节点。',
  },
  {
    title: '4. D 执行完毕，回溯返回父节点 B',
    desc: 'dfs(D) 任务结束弹出栈顶！系统沿调用路径【回溯返回】给父节点 B，B 恢复执行。',
    current: 'B',
    stack: [
      { id: 'A', role: '根节点', wait: '等待 B 完成，之后处理 C' },
      { id: 'B', role: '恢复执行', wait: '左子树 D 已返回，接下来准备处理右孩子 E' }
    ],
    path: ['A', 'B'],
    flow: 'dfs(D) 出栈 ◀── 控制权回溯返回给 B',
    whyStillThere: 'D 已弹出；B 的左子树已完，但还要去处理右孩子 E，所以 B 继续留栈。',
  },
  {
    title: '5. B 转向处理右孩子 E',
    desc: '父节点 B 发起右分支调用，dfs(E) 压入栈顶。栈中状态更新为 [A, B, E]。',
    current: 'E',
    stack: [
      { id: 'A', role: '根节点', wait: '等待 B 完成，之后处理 C' },
      { id: 'B', role: '父节点', wait: '左子树已搞定，正在等待右子树 E' },
      { id: 'E', role: '叶子节点', wait: '左右均为空，自身任务完成准备返回' }
    ],
    path: ['A', 'B', 'E'],
    flow: 'dfs(E) 入栈 ──▶ 深入右孩子 E',
    whyStillThere: 'E 是叶子节点，任务完成后即将返回给 B。',
  },
  {
    title: '6. E 执行完毕，再次返回 B',
    desc: 'dfs(E) 弹出调用栈，控制权再次回溯返回给 B。此时 B 的左右子树 (D, E) 均已全部完成！',
    current: 'B',
    stack: [
      { id: 'A', role: '根节点', wait: '等待 B 完成，之后处理 C' },
      { id: 'B', role: '全部完成', wait: '左右子树均已处理完毕，准备返回根节点 A' }
    ],
    path: ['A', 'B'],
    flow: 'dfs(E) 出栈 ◀── B 的左右子树均已完毕',
    whyStillThere: 'B 的任务全部搞定，即将弹出返回给 A。',
  },
  {
    title: '7. B 执行完毕，回溯返回根节点 A',
    desc: 'dfs(B) 弹出调用栈，控制权回溯给根节点 A！整棵树的左半部分全部处理完毕！',
    current: 'A',
    stack: [
      { id: 'A', role: '根节点', wait: '左半树全部搞定！接下来准备处理右子树 C' }
    ],
    path: ['A'],
    flow: 'dfs(B) 出栈 ◀── 控制权回到根节点 A',
    whyStillThere: 'A 的左半部分终于结束了，A 接下来要调用 dfs(C) 探索右半树！',
  },
  {
    title: '8. 根节点 A 转向右子树 C',
    desc: '根节点 A 开始处理右子树，调用 dfs(C) 压栈。C 按照相同的逻辑递归处理其子节点 F 和 G。',
    current: 'C',
    stack: [
      { id: 'A', role: '根节点', wait: '正在等待右半树 C 全部完成' },
      { id: 'C', role: '右子树根', wait: '进入右半树，准备依次处理 F 与 G' }
    ],
    path: ['A', 'C'],
    flow: 'dfs(C) 入栈 ──▶ 开始处理右半树',
    whyStillThere: '左右子树是对称的，右半树处理完后最终回溯给 A。',
  },
  {
    title: '9. 全局递归完成',
    desc: '右半树处理完毕后回溯给 A，dfs(A) 弹出调用栈，栈彻底清空，整棵二叉树遍历圆满结束！',
    current: null,
    stack: [],
    path: [],
    flow: 'dfs(A) 出栈 · 遍历圆满完成',
    whyStillThere: '所有子树与根节点全部完成，调用栈安全清空。',
  }
]

function TreeStoryVisual({ step, tree }) {
  const mode = ['', '', 'preorder', 'inorder', 'postorder', 'levelorder'][step]
  const traversal = useMemo(() => (mode ? buildTraversal(tree, mode) : []), [tree, mode])
  const compareRuns = useMemo(
    () => Object.entries(MODES).map(([key, item]) => ({ key, item, result: buildTraversal(tree, key).at(-1).visited })),
    [tree]
  )

  const frameCount =
    step === 0 ? tree.nodes.length + 1 : step === 1 ? RECURSION_STEPS.length : mode ? traversal.length : step === 6 ? 28 : 6

  const [frame, setFrame] = useState(0)
  const [autoPlaying, setAutoPlaying] = useState(false)

  // 当切换故事 step 时，重置帧为 0 且暂停自动重复
  useEffect(() => {
    setFrame(0)
    setAutoPlaying(false)
  }, [step])

  // 可控自动播放逻辑：播放到最后一帧时自动停止，绝不循环重复
  useEffect(() => {
    if (!autoPlaying) return undefined
    const timer = window.setInterval(() => {
      setFrame((curr) => {
        if (curr >= frameCount - 1) {
          setAutoPlaying(false)
          return curr
        }
        return curr + 1
      })
    }, 1100)
    return () => window.clearInterval(timer)
  }, [autoPlaying, frameCount])

  // 控制条组件
  const renderControls = (hint) => (
    <div className="story-micro-controller">
      <div className="micro-meta">
        <span className="micro-step-pill">第 {frame + 1} / {frameCount} 步</span>
        <span className="micro-hint">{hint}</span>
      </div>
      <div className="micro-btn-group">
        <button
          type="button"
          disabled={frame === 0}
          onClick={() => { setFrame((f) => Math.max(0, f - 1)); setAutoPlaying(false) }}
          title="上一步"
        >
          ← 上一步
        </button>
        <button
          type="button"
          className={`micro-play-btn ${autoPlaying ? 'playing' : ''}`}
          onClick={() => {
            if (frame >= frameCount - 1) setFrame(0)
            setAutoPlaying((v) => !v)
          }}
        >
          {autoPlaying ? '❚❚ 暂停' : frame >= frameCount - 1 ? '↺ 重新演示' : '▶ 播放动画'}
        </button>
        <button
          type="button"
          disabled={frame >= frameCount - 1}
          onClick={() => { setFrame((f) => Math.min(frameCount - 1, f + 1)); setAutoPlaying(false) }}
          title="下一步"
        >
          下一步 →
        </button>
      </div>
    </div>
  )

  // 第一步：树结构展开
  if (step === 0) {
    const visibleCount = Math.min(frame, tree.nodes.length)
    const activeNode = visibleCount > 0 ? tree.nodes[visibleCount - 1]?.id : null
    return (
      <div className="tree-step0-stage">
        <div className="tree-mini tree-story-animation">
          <MiniTree tree={tree} visibleCount={visibleCount} current={activeNode} />
        </div>
        <div className="step-caption-pill">
          {visibleCount === 0
            ? '初始状态：等待展开树节点'
            : visibleCount === tree.nodes.length
            ? '所有节点展开完毕：树是一个层次递归结构'
            : `正在建立第 ${visibleCount} 个节点：${activeNode}（${visibleCount <= 1 ? '根节点' : visibleCount <= 3 ? '第二层分支' : '第三层叶子'}）`}
        </div>
        {renderControls('点击上一步/下一步或播放，观察二叉树如何从根节点向下分叉建立')}
      </div>
    )
  }

  // 第二步：深刻理解递归与回溯调用栈
  if (step === 1) {
    const curStep = RECURSION_STEPS[Math.min(frame, RECURSION_STEPS.length - 1)]
    const stackIds = curStep.stack.map((s) => s.id)
    return (
      <div className="recursion-deep-stage">
        {/* 上部：二叉树拓扑与调用链指示 */}
        <div className="recursion-tree-canvas-wrap">
          <svg viewBox="0 0 720 250" className="recursion-mini-svg">
            {tree.nodes.flatMap((p) =>
              ['left', 'right'].map((side) => {
                const c = tree.nodes.find((n) => n.id === p[side])
                if (!c) return null
                const inPath = curStep.path.includes(p.id) && curStep.path.includes(c.id)
                return (
                  <line
                    key={`${p.id}-${c.id}`}
                    x1={p.x}
                    y1={p.y * 0.75}
                    x2={c.x}
                    y2={c.y * 0.75}
                    className={inPath ? 'call-active-line' : 'call-dim-line'}
                  />
                )
              })
            )}
            {tree.nodes.map((n) => {
              const isCurrent = curStep.current === n.id
              const inStack = stackIds.includes(n.id)
              return (
                <g
                  key={n.id}
                  className={`rec-node ${isCurrent ? 'is-current' : inStack ? 'is-in-stack' : ''}`}
                  transform={`translate(${n.x},${n.y * 0.75})`}
                >
                  <circle r="26" />
                  <text y="7">{n.id}</text>
                  {isCurrent && <text className="rec-badge-text" y="-36">当前活跃</text>}
                  {!isCurrent && inStack && <text className="rec-badge-text wait" y="-36">栈中挂起</text>}
                </g>
              )
            })}
          </svg>
        </div>

        {/* 中部：立体调用栈帧容器 */}
        <div className="recursion-stack-board">
          <div className="stack-header-row">
            <strong>递归调用栈 (Call Stack)</strong>
            <span>最左为栈底 · 最右为栈顶 (当前正在执行)</span>
          </div>
          <div className="stack-frames-track">
            {curStep.stack.length === 0 ? (
              <div className="stack-empty-chip">调用栈为空（函数尚未调用或所有递归均已返回）</div>
            ) : (
              curStep.stack.map((item, idx) => {
                const isTop = idx === curStep.stack.length - 1
                return (
                  <div key={`${item.id}-${idx}`} className={`call-frame-card ${isTop ? 'is-top' : ''}`}>
                    <div className="frame-top-bar">
                      <span className="frame-func">dfs({item.id})</span>
                      <span className="frame-role">{item.role}</span>
                    </div>
                    <p className="frame-wait-desc">{item.wait}</p>
                    {isTop ? <span className="top-indicator">★ 栈顶执行中</span> : <span className="wait-indicator">⏳ 挂起等待返回</span>}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* 核心原理解析条 */}
        <div className="recursion-explain-banner">
          <div className="flow-badge">{curStep.flow}</div>
          <p className="desc-text"><strong>{curStep.title}：</strong>{curStep.desc}</p>
          <div className="why-text">💡 <strong>为什么 A 和 B 还在栈里？</strong> {curStep.whyStillThere}</div>
        </div>

        {renderControls('手动点击“下一步”，一步步看清入栈（深入）与出栈（回溯返回）的完整逻辑')}
      </div>
    )
  }

  // 遍历模式（前序、中序、后序、层序）
  if (mode) {
    const current = traversal[Math.min(frame, traversal.length - 1)]
    return (
      <div className="tree-traversal-stage">
        <div className="tree-story-traversal">
          <div>
            <MiniTree tree={tree} visited={current.visited} current={current.current} />
          </div>
          <section>
            <header>
              <strong>{MODES[mode].name}</strong>
              <span>{MODES[mode].rule}</span>
            </header>
            <p>{current.message}</p>
            <div className="story-tree-output">
              <span>已经输出序列</span>
              {current.visited.map((id, index) => (
                <i key={`${id}-${index}`}>{id}</i>
              ))}
            </div>
            <div className="story-tree-memory">
              <span>{mode === 'levelorder' ? '等待队列' : '调用栈'}</span>
              {current.memory.map((id, index) => (
                <i key={`${id}-${index}`}>{id}</i>
              ))}
            </div>
          </section>
        </div>
        {renderControls(`观察 ${MODES[mode].name} 在每个节点的访问时机，步进查看输出序列的生成`)}
      </div>
    )
  }

  // 第 7 步：对比总结
  const activeRun = Math.min(compareRuns.length - 1, Math.floor(frame / 7))
  const shown = (frame % 7) + 1
  return (
    <div className="tree-compare-stage">
      <div className="tree-compare animated">
        {compareRuns.map((run, index) => (
          <div className={index === activeRun ? 'active' : ''} key={run.key}>
            <span>{run.item.name}</span>
            <strong>
              {run.result.slice(0, index < activeRun ? run.result.length : index === activeRun ? shown : 0).join(' → ') ||
                '等待演示'}
            </strong>
          </div>
        ))}
      </div>
      {renderControls('对比四种遍历输出序列的差异')}
    </div>
  )
}
function MiniTree({tree,visibleCount=tree.nodes.length,visited=[],current=null}){const visible=new Set(tree.nodes.slice(0,visibleCount).map((node)=>node.id));return <svg viewBox="0 0 720 330">{tree.nodes.flatMap((p)=>['left','right'].map((side)=>{const c=tree.nodes.find((n)=>n.id===p[side]);return c&&visible.has(p.id)&&visible.has(c.id)?<line className={visited.includes(p.id)&&visited.includes(c.id)?'visited':''} key={`${p.id}-${c.id}`} x1={p.x} y1={p.y} x2={c.x} y2={c.y}/>:null}))}{tree.nodes.map((n)=>visible.has(n.id)?<g className={`${visited.includes(n.id)?'visited':''} ${current===n.id?'current':''}`} key={n.id} transform={`translate(${n.x},${n.y})`}><circle r="31"/><text y="7">{n.id}</text></g>:null)}</svg>}

const TREE_CODE = {
  preorder: {
    Python: ['def preorder(node, visit):','    if node is None: return','    visit(node)','    preorder(node.left, visit)','    preorder(node.right, visit)'],
    Java: ['void preorder(Node node) {','    if (node == null) return;','    visit(node);','    preorder(node.left);','    preorder(node.right);','}'],
    'C++': ['void preorder(Node* node) {','    if (node == nullptr) return;','    visit(node);','    preorder(node->left);','    preorder(node->right);','}'],
  },
  inorder: {
    Python: ['def inorder(node, visit):','    if node is None: return','    inorder(node.left, visit)','    visit(node)','    inorder(node.right, visit)'],
    Java: ['void inorder(Node node) {','    if (node == null) return;','    inorder(node.left);','    visit(node);','    inorder(node.right);','}'],
    'C++': ['void inorder(Node* node) {','    if (node == nullptr) return;','    inorder(node->left);','    visit(node);','    inorder(node->right);','}'],
  },
  postorder: {
    Python: ['def postorder(node, visit):','    if node is None: return','    postorder(node.left, visit)','    postorder(node.right, visit)','    visit(node)'],
    Java: ['void postorder(Node node) {','    if (node == null) return;','    postorder(node.left);','    postorder(node.right);','    visit(node);','}'],
    'C++': ['void postorder(Node* node) {','    if (node == nullptr) return;','    postorder(node->left);','    postorder(node->right);','    visit(node);','}'],
  },
  levelorder: {
    Python: ['from collections import deque','','def levelorder(root, visit):','    if root is None: return','    queue = deque([root])','    while queue:','        node = queue.popleft()','        visit(node)','        queue.extend(child for child in (node.left, node.right) if child)'],
    Java: ['void levelorder(Node root) {','    Queue<Node> q = new ArrayDeque<>();','    q.offer(root);','    while (!q.isEmpty()) {','        Node node = q.poll(); visit(node);','        if (node.left != null) q.offer(node.left);','        if (node.right != null) q.offer(node.right);','    }','}'],
    'C++': ['void levelorder(Node* root) {','    queue<Node*> q; q.push(root);','    while (!q.empty()) {','        Node* node = q.front(); q.pop();','        visit(node);','        if (node->left) q.push(node->left);','        if (node->right) q.push(node->right);','    }','}'],
  },
}

const TREE_COMPLEXITY={preorder:['O(n)','O(h)','递归栈最多保存树高 h 个节点'],inorder:['O(n)','O(h)','递归栈最多保存树高 h 个节点'],postorder:['O(n)','O(h)','递归栈最多保存树高 h 个节点'],levelorder:['O(n)','O(w)','队列最多保存树的最大宽度 w 个节点']}
function TreeCodeDemo({mode,action}){
  const [language,setLanguage]=useState('Python')
  const lines=TREE_CODE[mode][language]
  const visitIndex=mode==='preorder'?2:mode==='inorder'?3:mode==='postorder'?4:mode==='levelorder'?({Python:7,Java:4,'C++':4}[language]):0
  const activeIndex=action==='记录节点'||action==='出队并访问'?visitIndex:action==='递归返回'?lines.length-1:action==='进入节点'?0:-1
  const complexity=TREE_COMPLEXITY[mode]
  return <section className="tree-code-demo"><header><div><span>正式代码 · 与上方步骤同步</span><h2>{MODES[mode].name}的可执行实现</h2><p>先看动画理解“当前节点、调用栈或队列”，再对应到高亮语句。三种语言遵循同一套算法。</p></div><nav aria-label="选择代码语言">{Object.keys(TREE_CODE[mode]).map((item)=><button type="button" className={language===item?'active':''} onClick={()=>setLanguage(item)} key={item}>{item}</button>)}</nav></header><div className="tree-code-body"><div className="tree-code-rule"><span>执行顺序</span><strong>{MODES[mode].rule}</strong><p>{mode==='levelorder'?'队首出队并访问，再把左右孩子依次加入队尾。':'函数每进入一个节点，就按规定时机调用 visit，再递归处理左右子树。'}</p><div className="complexity-grid vertical"><span><small>时间复杂度</small><strong>{complexity[0]}</strong></span><span><small>空间复杂度</small><strong>{complexity[1]}</strong></span><em>{complexity[2]}</em></div></div><pre aria-label={`${language} ${MODES[mode].name}代码`}><code>{lines.map((line,index)=><span className={index===activeIndex?'active':''} key={`${language}-${index}`}><i>{String(index+1).padStart(2,'0')}</i>{line}</span>)}</code></pre></div></section>
}

function buildTraversal(tree,mode){const map=Object.fromEntries(tree.nodes.map((n)=>[n.id,n]));const visited=[];const steps=[state(null,'准备从根节点开始。','初始化',[],visited)];if(mode==='levelorder'){const queue=[tree.root];while(queue.length){const id=queue.shift();const n=map[id];visited.push(id);if(n.left)queue.push(n.left);if(n.right)queue.push(n.right);steps.push(state(id,`访问 ${id}，并把它的孩子加入队尾。`,'出队并访问',[...queue],visited))}}else{const stack=[];function walk(id){if(!id)return;const n=map[id];stack.push(id);steps.push(state(id,`进入节点 ${id}。`,'进入节点',stack,visited));if(mode==='preorder')visit(id);walk(n.left);if(mode==='inorder')visit(id);walk(n.right);if(mode==='postorder')visit(id);stack.pop();steps.push(state(id,`节点 ${id} 的任务完成，返回上一层。`,'递归返回',stack,visited))}function visit(id){visited.push(id);steps.push(state(id,`按照${MODES[mode].name}规则，现在访问 ${id}。`,'记录节点',stack,visited))}walk(tree.root)}steps.push({...state(null,'所有节点均已访问。','遍历完成',[],visited),done:true});return steps}
function state(current,message,action,memory,visited){return{current,message,action,memory:[...memory],visited:[...visited],done:false}}
function node(id,x,y,left=null,right=null){return{id,x,y,left,right}}
function storyText(step){return ['二叉树由节点和左右孩子组成。遇到分叉时，算法必须决定先走哪边，以及何时记录当前根节点。','例如 A 进入 B、B 再进入 D。此时 A 还没有处理右子树 C，B 还没有处理右子树 E，所以调用栈依次保存 A、B、D。D 完成后先回到 B，B 完成后再回到 A。','前序在刚进入节点时就记录根，再递归左子树和右子树。','中序先完整处理左子树，返回时记录根，最后处理右子树。','后序必须等待左右子树都结束，才记录当前根节点。','层序不使用递归栈，而用队列依次保存下一层将要访问的节点。','前、中、后序都是深度优先，只是记录根的时机不同；层序则是广度优先。'][step]}
