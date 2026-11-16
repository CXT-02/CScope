import React, { useEffect, useState } from 'react'
import { ExperimentHeader } from './AttentionExperiment'
import LearningCycle from './LearningCycle'

const STORY=[['结构','线性结构：元素按照一个方向依次排列','栈和队列都只允许在指定端点操作，因此过程可预测、实现高效。'],['栈','栈：后进入的元素最先离开','栈只暴露栈顶，形成 LIFO，像叠放的盘子。'],['队列','队列：先进入的元素最先离开','一端入队、另一端出队形成 FIFO，像排队办理业务。'],['操作','入栈/出栈与入队/出队只改变端点','受限操作避免随意访问，使两种结构能稳定表达不同顺序需求。'],['应用','调用栈保存返回现场，任务队列保存等待顺序','选择结构的关键不是外观，而是希望谁先被处理。'],['对比','同样的输入顺序，会产生相反的输出顺序','亲手执行同一组操作，比背 LIFO 和 FIFO 更容易形成直觉。']]

export default function StackQueueExperiment({experiment}){
  const [mode,setMode]=useState('stack');const [items,setItems]=useState(['A','B','C']);const [value,setValue]=useState('D');const [last,setLast]=useState('等待操作');
  function add(){const next=value.trim().slice(0,3);if(!next||items.length>=7)return;setItems((current)=>[...current,next]);setLast(mode==='stack'?`${next} 从栈顶入栈（Push）`:`${next} 从队尾入队（Enqueue）`);setValue('')}
  function remove(){if(!items.length)return;const removed=mode==='stack'?items.at(-1):items[0];setItems((current)=>mode==='stack'?current.slice(0,-1):current.slice(1));setLast(mode==='stack'?`${removed} 从栈顶出栈（Pop）`:`${removed} 从队首出队（Dequeue）`)}
  function switchMode(next){setMode(next);setItems(['A','B','C']);setLast(next==='stack'?'切换到栈：只能操作栈顶':'切换到队列：队尾进入、队首离开')}
  return <><ExperimentHeader experiment={experiment} eyebrow="算法实验 05"/><SqStory/><div className="explore-heading"><span>自由探索 · 用同一组元素比较两种规则</span><h2>谁应该先离开？由数据结构决定</h2><p>添加和移除元素，观察操作端点、元素移动方向以及最终输出顺序。</p></div><div className="lab-layout sq-layout"><aside className="control-panel"><div className="panel-title"><span>结构控制</span><i>{mode==='stack'?'LIFO':'FIFO'}</i></div><div className="nn-neuron-tabs"><button className={mode==='stack'?'active':''} type="button" onClick={()=>switchMode('stack')}>栈 Stack</button><button className={mode==='queue'?'active':''} type="button" onClick={()=>switchMode('queue')}>队列 Queue</button></div><label className="field-block"><span>新元素</span><small>最多保存 7 个元素，输入后从允许的入口加入。</small><input value={value} onChange={(e)=>setValue(e.target.value)} onKeyDown={(e)=>{if(e.key==='Enter')add()}} placeholder="例如 D"/></label><div className="sq-actions"><button type="button" disabled={!value.trim()||items.length>=7} onClick={add}>{mode==='stack'?'Push 入栈':'Enqueue 入队'}</button><button type="button" disabled={!items.length} onClick={remove}>{mode==='stack'?'Pop 出栈':'Dequeue 出队'}</button></div><button className="gd-reset" type="button" onClick={()=>{setItems(['A','B','C']);setLast('结构已恢复初始状态')}}>恢复初始状态</button><div className="live-explanation" key={`${mode}-${items.join('')}-${last}`}><span>刚才的操作</span><strong>{last}</strong><p>{mode==='stack'?'当前只能访问最上方元素；更早进入的元素被压在下面。':'当前从右侧队尾加入，从左侧队首移除；先到者优先。'}</p></div></aside><section className="visual-panel sq-visual"><div className="visual-toolbar"><div><strong>{mode==='stack'?'栈的 LIFO 数据流':'队列的 FIFO 数据流'}</strong><span>{mode==='stack'?'入口与出口都在栈顶':'入口在队尾，出口在队首'}</span></div><span className="source-chip">容量 {items.length}/7</span></div>{mode==='stack'?<StackView items={items}/>:<QueueView items={items}/>}<div className="sq-state"><div><span>{mode==='stack'?'栈底 → 栈顶':'队首 → 队尾'}</span><strong>{items.length?items.join(' → '):'空结构'}</strong></div><div><span>下一次移除</span><strong>{items.length?(mode==='stack'?items.at(-1):items[0]):'无'}</strong></div></div><div className="sq-applications"><article><span>栈的典型应用</span><strong>函数调用、撤销操作、括号匹配、深度优先搜索</strong></article><article><span>队列的典型应用</span><strong>任务调度、消息缓冲、打印队列、广度优先搜索</strong></article></div></section></div><StackQueueCodeDemo mode={mode} last={last}/><LearningCycle experimentId="stack-queue" prediction={{question:'依次加入 A、B、C 后，栈执行一次 Pop 会移除谁？',options:['A','B','C'],answer:'C',explanation:' C 最后进入且位于栈顶，因此最先离开。'}} operation={{title:'比较相同输入的输出顺序',instruction:'分别在栈和队列中加入 D，再连续移除所有元素，记录两种结构的输出顺序。'}} observation={`${mode==='stack'?'栈':'队列'}中当前有 ${items.length} 个元素，下一次将移除 ${items.length?(mode==='stack'?items.at(-1):items[0]):'无'}。`} summaryPrompt="LIFO 和 FIFO 分别适合解决哪类顺序问题？"/></>
}
const SQ_CODE={
 stack:{
  Python:[['setup','class Stack:'],['setup','    def __init__(self): self.data = []'],['push','    def push(self, value):'],['push','        self.data.append(value)'],['pop','    def pop(self):'],['pop','        if not self.data: raise IndexError("empty stack")'],['pop','        return self.data.pop()'],['peek','    def peek(self):'],['peek','        if not self.data: raise IndexError("empty stack")'],['peek','        return self.data[-1]']],
  Java:[['setup','class Stack<T> {'],['setup','    private final ArrayList<T> data = new ArrayList<>();'],['push','    void push(T value) { data.add(value); }'],['pop','    T pop() {'],['pop','        if (data.isEmpty()) throw new NoSuchElementException();'],['pop','        return data.remove(data.size() - 1);'],['pop','    }'],['peek','    T peek() {'],['peek','        if (data.isEmpty()) throw new NoSuchElementException();'],['peek','        return data.get(data.size() - 1);'],['peek','    }'],['setup','}']],
  'C++':[['setup','template<class T> class Stack {'],['setup','    vector<T> data;'],['push','public: void push(const T& value) { data.push_back(value); }'],['pop','    T pop() {'],['pop','        if (data.empty()) throw underflow_error("empty stack");'],['pop','        T value = data.back(); data.pop_back(); return value;'],['pop','    }'],['peek','    const T& peek() const {'],['peek','        if (data.empty()) throw underflow_error("empty stack");'],['peek','        return data.back();'],['peek','    }'],['setup','};']],
 },
 queue:{
  Python:[['setup','from collections import deque'],['setup','class Queue:'],['setup','    def __init__(self): self.data = deque()'],['push','    def enqueue(self, value):'],['push','        self.data.append(value)'],['pop','    def dequeue(self):'],['pop','        if not self.data: raise IndexError("empty queue")'],['pop','        return self.data.popleft()'],['peek','    def front(self):'],['peek','        if not self.data: raise IndexError("empty queue")'],['peek','        return self.data[0]']],
  Java:[['setup','class Queue<T> {'],['setup','    private final ArrayDeque<T> data = new ArrayDeque<>();'],['push','    void enqueue(T value) { data.addLast(value); }'],['pop','    T dequeue() {'],['pop','        if (data.isEmpty()) throw new NoSuchElementException();'],['pop','        return data.removeFirst();'],['pop','    }'],['peek','    T front() {'],['peek','        if (data.isEmpty()) throw new NoSuchElementException();'],['peek','        return data.getFirst();'],['peek','    }'],['setup','}']],
  'C++':[['setup','template<class T> class Queue {'],['setup','    deque<T> data;'],['push','public: void enqueue(const T& value) { data.push_back(value); }'],['pop','    T dequeue() {'],['pop','        if (data.empty()) throw underflow_error("empty queue");'],['pop','        T value = data.front(); data.pop_front(); return value;'],['pop','    }'],['peek','    const T& front() const {'],['peek','        if (data.empty()) throw underflow_error("empty queue");'],['peek','        return data.front();'],['peek','    }'],['setup','};']],
 }
}
function StackQueueCodeDemo({mode,last}){const[language,setLanguage]=useState('Python');const active=last.includes('入栈')||last.includes('入队')?'push':last.includes('出栈')||last.includes('出队')?'pop':'setup';const label=mode==='stack'?'栈 Stack':'队列 Queue';return <section className="structure-code-demo"><header><div><span>正式代码 · 操作同步</span><h2>{label} 的数组/双端队列实现</h2><p>点击上方操作按钮后，对应的 push、pop、enqueue 或 dequeue 语句会同步高亮。</p></div><nav>{Object.keys(SQ_CODE[mode]).map((item)=><button type="button" className={language===item?'active':''} onClick={()=>setLanguage(item)} key={item}>{item}</button>)}</nav></header><div className="structure-code-body"><pre><code>{SQ_CODE[mode][language].map(([key,line],index)=><span className={active===key?'active':''} key={`${language}-${index}`}><i>{String(index+1).padStart(2,'0')}</i>{line}</span>)}</code></pre><aside><div className="complexity-grid vertical"><span><small>{mode==='stack'?'Push':'Enqueue'}</small><strong>O(1) 均摊</strong></span><span><small>{mode==='stack'?'Pop':'Dequeue'}</small><strong>O(1)</strong></span><span><small>{mode==='stack'?'Peek':'Front'}</small><strong>O(1)</strong></span><span><small>存储 n 个元素</small><strong>O(n)</strong></span></div><p>{mode==='stack'?'动态数组尾部就是栈顶；扩容偶尔需要 O(n)，因此 Push 是均摊 O(1)。':'使用双端队列从尾部加入、头部删除，避免普通数组头删导致的 O(n) 搬移。'}</p></aside></div></section>}
function StackView({items}){return <div className="stack-view"><span className="sq-arrow">Push / Pop<br/>↓ ↑</span><div className="stack-container">{[...items].reverse().map((item,index)=><i className={index===0?'next':''} key={`${item}-${items.length-index}`}>{item}<b>{index===0?'栈顶':''}</b></i>)}{!items.length&&<small>空栈</small>}</div><strong>栈底</strong></div>}
function QueueView({items}){return <div className="queue-view"><span>Dequeue 出队 ←</span><div>{items.map((item,index)=><i className={index===0?'next':''} key={`${item}-${index}`}>{item}<b>{index===0?'队首':index===items.length-1?'队尾':''}</b></i>)}{!items.length&&<small>空队列</small>}</div><span>← Enqueue 入队</span></div>}
function SqStory(){const [step,setStep]=useState(0),[playing,setPlaying]=useState(false);useEffect(()=>{if(!playing)return;const t=setTimeout(()=>setStep((v)=>{if(v===STORY.length-1){setPlaying(false);return v}return v+1}),2600);return()=>clearTimeout(t)},[playing,step]);return <section className="transformer-story sq-story"><header className="story-intro"><div><span className="story-kicker">动画导学 · 约 2 分钟</span><h2>入口和出口的位置，决定元素离开的顺序</h2><p>用同一组 A、B、C 比较栈与队列，不再把 LIFO、FIFO 当作孤立缩写。</p></div><div className="sq-story-badge"><strong>Stack</strong><span>LIFO</span><b>对比</b><strong>Queue</strong><span>FIFO</span></div></header><nav className="story-timeline" style={{'--story-steps':STORY.length}}>{STORY.map((item,index)=><button key={item[0]} type="button" className={`${step===index?'active':''} ${index<step?'passed':''}`} onClick={()=>{setStep(index);setPlaying(false)}}><i>{index<step?'✓':index+1}</i><span>{item[0]}</span></button>)}</nav><div className="story-stage" key={step}><div className="story-copy"><span>0{step+1} · 核心概念</span><h3>{STORY[step][1]}</h3><p>{sqStoryText(step)}</p><aside><strong>为什么这样设计？</strong><p>{STORY[step][2]}</p></aside></div><div className="story-visual"><SqStoryVisual step={step}/></div></div><footer className="story-controls"><button disabled={step===0} onClick={()=>setStep(step-1)}>← 上一步</button><button className="story-play" onClick={()=>{if(step===STORY.length-1)setStep(0);setPlaying((v)=>!v)}}>{playing?'暂停讲解':'▶ 自动播放'}</button><button disabled={step===STORY.length-1} onClick={()=>setStep(step+1)}>下一步 →</button></footer></section>}
const SQ_APPLICATIONS = [
  {
    type: 'Stack',
    name: '函数调用与递归 (Call Stack)',
    tag: '现场保护 · LIFO',
    desc: '后调用的子函数最先执行完毕并返回；递归深入时一层层压栈保存返回地址，返回时依次出栈恢复现场。',
    icon: '🥞',
  },
  {
    type: 'Stack',
    name: '撤销与回退操作 (Undo / Redo)',
    tag: '时光倒流 · LIFO',
    desc: '用户的每一次按键或编辑操作依次入栈；按 Ctrl+Z 撤销时，最先撤销最近一次的操作（后发先撤）。',
    icon: '↩',
  },
  {
    type: 'Stack',
    name: '深度优先搜索 (DFS / 括号匹配)',
    tag: '触底回溯 · LIFO',
    desc: '顺着一条分支一直探索到底，遇到死胡同或闭合右括号时从栈顶弹出，返回最近的分叉口探索新路径。',
    icon: '🧭',
  },
  {
    type: 'Queue',
    name: '任务调度与打印机队列',
    tag: '先到先得 · FIFO',
    desc: '最先提交的打印文件、操作系统就绪任务排在队首优先获得处理，保障次序公平、避免饿死。',
    icon: '🖨️',
  },
  {
    type: 'Queue',
    name: '高并发消息队列 (MQ / 削峰填谷)',
    tag: '突发缓冲 · FIFO',
    desc: '秒杀等海量突发流量排入队尾缓冲，后端微服务按自身能力从队首匀速拉取消费，保护系统不被冲垮。',
    icon: '📨',
  },
  {
    type: 'Queue',
    name: '广度优先搜索 (BFS / 树层序遍历)',
    tag: '逐层扩散 · FIFO',
    desc: '按距离起点的步数由近及远扩展，先发现的节点先加入队尾，队首依次出队探索，求无权图最短路径。',
    icon: '🌊',
  },
]

function SqStoryVisual({ step }) {
  const stackFrames = [[], ['A'], ['A', 'B'], ['A', 'B', 'C'], ['A', 'B'], ['A'], []]
  const queueFrames = [[], ['A'], ['A', 'B'], ['A', 'B', 'C'], ['B', 'C'], ['C'], []]
  const frameCount = step === 0 ? 8 : step === 4 ? SQ_APPLICATIONS.length : 7
  const [frame, setFrame] = useState(0)
  const [autoPlaying, setAutoPlaying] = useState(false)

  useEffect(() => {
    setFrame(0)
    setAutoPlaying(false)
  }, [step])

  useEffect(() => {
    if (!autoPlaying) return undefined
    const timer = window.setInterval(() => {
      setFrame((value) => {
        if (value >= frameCount - 1) {
          setAutoPlaying(false)
          return value
        }
        return value + 1
      })
    }, 1200)
    return () => window.clearInterval(timer)
  }, [autoPlaying, frameCount])

  const renderMicroControls = (hint) => (
    <div className="story-micro-controller sq-micro-ctrl">
      <div className="micro-meta">
        <span className="micro-step-pill">第 {frame + 1} / {frameCount} 项</span>
        <span className="micro-hint">{hint}</span>
      </div>
      <div className="micro-btn-group">
        <button
          type="button"
          disabled={frame === 0}
          onClick={() => { setFrame((f) => Math.max(0, f - 1)); setAutoPlaying(false) }}
          title="上一项"
        >
          ← 上一项
        </button>
        <button
          type="button"
          className={`micro-play-btn ${autoPlaying ? 'playing' : ''}`}
          onClick={() => {
            if (frame >= frameCount - 1) setFrame(0)
            setAutoPlaying((v) => !v)
          }}
        >
          {autoPlaying ? '❚❚ 暂停' : frame >= frameCount - 1 ? '↺ 重新演示' : '▶ 自动演示'}
        </button>
        <button
          type="button"
          disabled={frame >= frameCount - 1}
          onClick={() => { setFrame((f) => Math.min(frameCount - 1, f + 1)); setAutoPlaying(false) }}
          title="下一项"
        >
          下一项 →
        </button>
      </div>
    </div>
  )

  if (step === 0) {
    const items = ['A', 'B', 'C', 'D']
    return (
      <div className="sq-step-stage">
        <div className="sq-linear animated">
          {items.map((x, index) => (
            <i className={index === frame % items.length ? 'active' : ''} key={x}>
              {x}
            </i>
          ))}
          <p>元素沿着一个方向排列，当前指针正在访问 {items[frame % items.length]}</p>
        </div>
        {renderMicroControls('线性结构：元素依次排列')}
      </div>
    )
  }

  if (step === 1) {
    return (
      <div className="sq-step-stage">
        <div className="sq-story-operation">
          <span>
            {frame < 4
              ? `Push ${stackFrames[frame]?.at(-1) || ''}`
              : `Pop ${stackFrames[Math.max(0, frame - 1)]?.at(-1) || ''}`}
          </span>
          <StackView items={stackFrames[frame]} />
          <p>
            {frame < 4
              ? '新元素从栈顶进入，旧元素依次被压到下面。'
              : '栈顶元素先离开，不能直接取出被压在下面的元素。'}
          </p>
        </div>
        {renderMicroControls('观察栈顶进出与后进先出 (LIFO)')}
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="sq-step-stage">
        <div className="sq-story-operation">
          <span>
            {frame < 4
              ? `Enqueue ${queueFrames[frame]?.at(-1) || ''}`
              : `Dequeue ${queueFrames[Math.max(0, frame - 1)]?.[0] || ''}`}
          </span>
          <QueueView items={queueFrames[frame]} />
          <p>
            {frame < 4
              ? '新元素从队尾进入，保持到达顺序。'
              : '元素只能从队首离开，后到者继续等待。'}
          </p>
        </div>
        {renderMicroControls('观察队尾进、队首出与先进先出 (FIFO)')}
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="sq-step-stage">
        <div className="sq-dual-operation">
          <section>
            <strong>Stack · 同一端进出</strong>
            <StackView items={stackFrames[frame]} />
          </section>
          <section>
            <strong>Queue · 两端分工</strong>
            <QueueView items={queueFrames[frame]} />
          </section>
        </div>
        {renderMicroControls('同屏对比：一端操作与两端操作')}
      </div>
    )
  }

  // 步骤 5（应用）：大画幅、详细内容与大字号重构
  if (step === 4) {
    const activeApp = SQ_APPLICATIONS[Math.min(frame, SQ_APPLICATIONS.length - 1)]
    return (
      <div className="sq-use-map-hero">
        <div className="sq-hero-columns">
          {/* 栈应用列 */}
          <div className="sq-hero-col stack-col">
            <header className="hero-col-header">
              <span className="col-icon">🥞</span>
              <div>
                <strong>栈 Stack 典型应用</strong>
                <small>核心逻辑：后进先出 (LIFO)</small>
              </div>
            </header>
            <div className="hero-app-cards">
              {SQ_APPLICATIONS.slice(0, 3).map((item, idx) => {
                const isActive = frame === idx
                return (
                  <div
                    key={item.name}
                    className={`app-item-card ${isActive ? 'is-active' : ''}`}
                    onClick={() => { setFrame(idx); setAutoPlaying(false) }}
                  >
                    <div className="card-title-row">
                      <strong>{item.name}</strong>
                      <span className="card-tag">{item.tag}</span>
                    </div>
                    <p className="card-desc">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 队列应用列 */}
          <div className="sq-hero-col queue-col">
            <header className="hero-col-header">
              <span className="col-icon">🚶</span>
              <div>
                <strong>队列 Queue 典型应用</strong>
                <small>核心逻辑：先进先出 (FIFO)</small>
              </div>
            </header>
            <div className="hero-app-cards">
              {SQ_APPLICATIONS.slice(3, 6).map((item, idx) => {
                const actualIdx = idx + 3
                const isActive = frame === actualIdx
                return (
                  <div
                    key={item.name}
                    className={`app-item-card ${isActive ? 'is-active' : ''}`}
                    onClick={() => { setFrame(actualIdx); setAutoPlaying(false) }}
                  >
                    <div className="card-title-row">
                      <strong>{item.name}</strong>
                      <span className="card-tag">{item.tag}</span>
                    </div>
                    <p className="card-desc">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 底部当前应用深度解析横幅 */}
        <div className="sq-hero-focus-banner">
          <div className="focus-header-bar">
            <span className="focus-pill">
              {activeApp.icon} 当前解析 · {activeApp.type} 用于 “{activeApp.name}”
            </span>
            <span className="focus-rule-tag">{activeApp.tag}</span>
          </div>
          <p className="focus-detail-text">{activeApp.desc}</p>
        </div>

        {renderMicroControls('点击卡片或按“下一项”，深入理解栈与队列在计算机系统中的真实应用')}
      </div>
    )
  }

  // 步骤 6：输入完全相同，输出顺序相反的深度大画幅对比
  const COMPARE_STEPS = [
    {
      title: '初始准备',
      desc: '准备将完全相同的一组数据 [A, B, C] 依次送入栈和队列。',
      input: [],
      stack: [],
      queue: [],
      stackOut: [],
      queueOut: [],
      highlight: '等待开始',
    },
    {
      title: '1. 元素 A 依次进入',
      desc: 'A 进入栈底；A 同时进入队首。',
      input: ['A'],
      stack: ['A'],
      queue: ['A'],
      stackOut: [],
      queueOut: [],
      highlight: 'A 写入',
    },
    {
      title: '2. 元素 B 依次进入',
      desc: 'B 压在 A 之上（栈）；B 排在 A 之后（队列）。',
      input: ['A', 'B'],
      stack: ['A', 'B'],
      queue: ['A', 'B'],
      stackOut: [],
      queueOut: [],
      highlight: 'B 写入',
    },
    {
      title: '3. 元素 C 依次进入（写入全部完成）',
      desc: 'C 到达栈顶；C 排在队尾。此时两种结构内部存储完全就绪！',
      input: ['A', 'B', 'C'],
      stack: ['A', 'B', 'C'],
      queue: ['A', 'B', 'C'],
      stackOut: [],
      queueOut: [],
      highlight: '写入完成',
    },
    {
      title: '4. 第一次出栈 / 出队',
      desc: '栈只能取栈顶的 C（后进先出）；队列只能取队首的 A（先进先出）！',
      input: ['A', 'B', 'C'],
      stack: ['A', 'B'],
      queue: ['B', 'C'],
      stackOut: ['C'],
      queueOut: ['A'],
      highlight: '栈移出 C · 队列移出 A',
    },
    {
      title: '5. 第二次出栈 / 出队',
      desc: '栈继续弹出新的栈顶 B；队列继续移出新的队首 B。',
      input: ['A', 'B', 'C'],
      stack: ['A'],
      queue: ['C'],
      stackOut: ['C', 'B'],
      queueOut: ['A', 'B'],
      highlight: '栈移出 B · 队列移出 B',
    },
    {
      title: '6. 第三次出栈 / 出队（全部完成）',
      desc: '栈最后取出最初进入的 A；队列最后取出最后排队的 C！结果完全相反！',
      input: ['A', 'B', 'C'],
      stack: [],
      queue: [],
      stackOut: ['C', 'B', 'A'],
      queueOut: ['A', 'B', 'C'],
      highlight: '逆序 C-B-A vs 原序 A-B-C',
    },
  ]

  const curCmp = COMPARE_STEPS[Math.min(frame, COMPARE_STEPS.length - 1)]

  return (
    <div className="sq-compare-hero-stage">
      {/* 顶部相同输入展示 */}
      <div className="sq-cmp-input-bar">
        <span className="cmp-label">相同数据源依次进入：</span>
        <div className="cmp-input-tokens">
          {['A', 'B', 'C'].map((tok, i) => (
            <span key={tok} className={`token-badge ${curCmp.input.includes(tok) ? 'entered' : ''}`}>
              {tok}
            </span>
          ))}
        </div>
        <span className="cmp-status-tag">{curCmp.highlight}</span>
      </div>

      {/* 中部双结构真实容器动态对比 */}
      <div className="sq-cmp-split-view">
        {/* 栈对比卡片 */}
        <div className="cmp-side-card stack-side">
          <header className="side-header">
            <strong>🥞 栈 Stack (后进先出 LIFO)</strong>
            <small>入口 = 出口 = 栈顶</small>
          </header>
          <div className="side-visual-box">
            <div className="mini-stack-vessel">
              <span className="vessel-arrow">↓ 栈顶 ↑</span>
              <div className="vessel-body">
                {curCmp.stack.length === 0 ? (
                  <small className="vessel-empty">已全部出栈</small>
                ) : (
                  [...curCmp.stack].reverse().map((it, idx) => (
                    <i key={`${it}-${idx}`} className={idx === 0 ? 'top-item' : ''}>
                      {it}
                    </i>
                  ))
                )}
              </div>
              <span className="vessel-bottom">栈底 (封闭)</span>
            </div>
            <div className="side-output-list">
              <span className="out-label">栈输出序列 (逆序):</span>
              <div className="out-chips">
                {curCmp.stackOut.length === 0 ? (
                  <small>等待弹出...</small>
                ) : (
                  curCmp.stackOut.map((x, i) => (
                    <b key={`${x}-${i}`} className="out-badge stack-badge">
                      {x}
                    </b>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 队列对比卡片 */}
        <div className="cmp-side-card queue-side">
          <header className="side-header">
            <strong>🚶 队列 Queue (先进先出 FIFO)</strong>
            <small>队尾进 ➔ 队首出</small>
          </header>
          <div className="side-visual-box">
            <div className="mini-queue-tunnel">
              <span className="tunnel-label left">出队 ←</span>
              <div className="tunnel-track">
                {curCmp.queue.length === 0 ? (
                  <small className="vessel-empty">已全部出队</small>
                ) : (
                  curCmp.queue.map((it, idx) => (
                    <i key={`${it}-${idx}`} className={idx === 0 ? 'head-item' : ''}>
                      {it}
                    </i>
                  ))
                )}
              </div>
              <span className="tunnel-label right">← 入队</span>
            </div>
            <div className="side-output-list">
              <span className="out-label">队列输出序列 (原序):</span>
              <div className="out-chips">
                {curCmp.queueOut.length === 0 ? (
                  <small>等待出队...</small>
                ) : (
                  curCmp.queueOut.map((x, i) => (
                    <b key={`${x}-${i}`} className="out-badge queue-badge">
                      {x}
                    </b>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部深刻规律解析卡片 */}
      <div className="sq-cmp-summary-banner">
        <div className="summary-title-line">
          <strong>{curCmp.title}：</strong>
          <span>{curCmp.desc}</span>
        </div>
        <div className="summary-rule-box">
          💡 <strong>核心直觉：</strong>输入顺序完全一样（A ➔ B ➔ C），受限端点规则不同，导致栈逆转为 <strong>C ➔ B ➔ A</strong>，而队列保持为 <strong>A ➔ B ➔ C</strong>！
        </div>
      </div>

      {renderMicroControls('手动点击“下一步”，一步步看清入栈/出栈与入队/出队的鲜明时序差异')}
    </div>
  )
}
function sqStoryText(step){return ['两种结构都把元素排成线性顺序，但允许操作的位置不同。','A、B、C 依次入栈后，C 位于栈顶，因此移除顺序是 C、B、A。','A、B、C 依次入队后，A 位于队首，因此移除顺序仍是 A、B、C。','Push 和 Pop 都发生在栈顶；Enqueue 在队尾，Dequeue 在队首。','需要“回到最近现场”时用栈，需要“按到达顺序处理”时用队列。','输入完全相同，受限端点不同，就能产生两种稳定且有用的处理顺序。'][step]}
