import React,{useEffect,useMemo,useState}from'react'
import{ExperimentHeader}from'./AttentionExperiment'
import LearningCycle from'./LearningCycle'

const DEFAULT=[7,0,1,2,0,3,0,4,2,3,0,3,2]
const ALGOS={fifo:{name:'FIFO',idea:'淘汰最早进入内存的页面'},lru:{name:'LRU',idea:'淘汰最长时间没有使用的页面'},opt:{name:'OPT',idea:'淘汰未来最晚再次使用的页面'}}
const STORY=[['内存','物理内存只能同时容纳有限页面','容量有限时，新页面进入就可能需要淘汰旧页面。'],['命中','页面已在内存中就是命中','命中无需从磁盘调页，访问代价低。'],['缺页','页面不在内存会触发缺页中断','系统必须装入页面；若没有空闲帧，还要选择牺牲者。'],['FIFO','FIFO 只记录页面进入的先后','实现简单，但最老页面不一定最不重要。'],['LRU','LRU 根据最近使用历史做决定','它利用时间局部性，认为刚使用过的页面近期可能再用。'],['OPT','OPT 查看未来，给出理论最优结果','真实系统无法准确预知未来，但 OPT 可作为比较基准。'],['比较','缺页次数越少，磁盘换入换出通常越少','同一引用串和帧数下比较，才能公平评价算法。']]

export default function PageReplacementExperiment({experiment}){
 const[text,setText]=useState(DEFAULT.join(', ')),[refs,setRefs]=useState(DEFAULT),[frames,setFrames]=useState(3),[index,setIndex]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(1)
 const runs=useMemo(()=>Object.keys(ALGOS).map((key)=>({key,steps:simulate(refs,frames,key)})),[refs,frames]);const states=runs.map((run)=>run.steps[Math.min(index,run.steps.length-1)])
 useEffect(()=>{setIndex(0);setPlaying(false)},[refs,frames]);useEffect(()=>{if(!playing)return;const t=setInterval(()=>setIndex((v)=>{if(v>=refs.length-1){setPlaying(false);return v}return v+1}),900/speed);return()=>clearInterval(t)},[playing,speed,refs.length])
 function apply(){const next=text.split(/[，,\s]+/).map(Number).filter((x)=>Number.isInteger(x)&&x>=0).slice(0,24);if(next.length>=4){setRefs(next);setText(next.join(', '))}}
 return <><ExperimentHeader experiment={experiment} eyebrow="操作系统实验 02"/><PageStory/><div className="explore-heading"><span>自由探索 · 同一引用串，三种淘汰策略</span><h2>每次缺页时，谁应该离开内存？</h2><p>逐项读取页面引用，观察内存帧变化、被淘汰页面和累计缺页次数。</p></div><div className="pager-controls"><label><span>页面引用串</span><input value={text} onChange={(e)=>setText(e.target.value)} onKeyDown={(e)=>{if(e.key==='Enter')apply()}}/><button onClick={apply}>应用</button></label><label><span>物理帧数：<b>{frames}</b></span><input type="range" min="2" max="5" value={frames} onChange={(e)=>setFrames(Number(e.target.value))}/></label></div><section className="pager-lab"><div className="pager-reference"><span>页面引用序列</span><div>{refs.map((page,i)=><button className={`${i===index?'active':''} ${i<index?'passed':''}`} key={i} onClick={()=>{setIndex(i);setPlaying(false)}}>{page}<i>{i+1}</i></button>)}</div></div><div className="pager-toolbar"><button disabled={index===0} onClick={()=>setIndex((v)=>v-1)}>← 上一步</button><button className="pager-play" onClick={()=>{if(index===refs.length-1)setIndex(0);setPlaying((v)=>!v)}}>{playing?'暂停':index===refs.length-1?'重新播放':'▶ 自动播放'}</button><button disabled={index===refs.length-1} onClick={()=>setIndex((v)=>v+1)}>下一步 →</button><select value={speed} onChange={(e)=>setSpeed(Number(e.target.value))}><option value={.75}>0.75×</option><option value={1}>1×</option><option value={1.5}>1.5×</option></select></div><div className="pager-grid">{runs.map((run,i)=><PagerPanel key={run.key} algo={run.key} state={states[i]} total={index+1}/>)}</div><div className="pager-comparison"><strong>当前比较</strong><p>{comparison(states,index+1)}</p></div></section><LearningCycle experimentId="page-replacement" prediction={{question:'LRU 在缺页且内存已满时淘汰哪个页面？',options:['最早进入内存的页面','最长时间未被访问的页面','未来最晚访问的页面'],answer:'最长时间未被访问的页面',explanation:' LRU 根据过去的最近使用时间作出选择。'}} operation={{title:'改变物理帧数比较缺页率',instruction:'使用默认引用串，分别设置 3 帧和 4 帧并播放到最后，记录三种算法的缺页次数。'}} observation={`当前处理第 ${index+1} 次引用（页面 ${refs[index]}）：${states.map((s,i)=>`${Object.values(ALGOS)[i].name} ${s.faults} 次缺页`).join('，')}。`} summaryPrompt="FIFO、LRU 和 OPT 分别依据什么信息选择淘汰页面？"/></>
}
function PagerPanel({algo,state,total}){return <article className={`pager-panel ${state.fault?'fault':'hit'}`}><header><div><span>{ALGOS[algo].idea}</span><h3>{ALGOS[algo].name}</h3></div><i>{state.fault?'缺页 Fault':'命中 Hit'}</i></header><div className="memory-frames">{state.frames.map((page,i)=><div className={page===state.loaded?'loaded':page===state.replaced?'replaced':''} key={i}><span>Frame {i+1}</span><strong>{page??'—'}</strong></div>)}</div><p>{state.message}</p><footer><span>缺页 <b>{state.faults}</b></span><span>命中 <b>{state.hits}</b></span><span>缺页率 <b>{(state.faults/total*100).toFixed(0)}%</b></span></footer></article>}
function simulate(refs,count,algo){let slots=Array(count).fill(null),faults=0,hits=0,pointer=0;const last=new Map(),steps=[];refs.forEach((page,index)=>{let fault=!slots.includes(page),replaced=null,loaded=null;if(!fault){hits++;last.set(page,index);steps.push(snapshot(`页面 ${page} 已在内存中，无需置换。`));return}faults++;let target=slots.indexOf(null);if(target<0){if(algo==='fifo'){target=pointer;pointer=(pointer+1)%count}else if(algo==='lru'){target=slots.reduce((best,p,i)=>((last.get(p)??-1)<(last.get(slots[best])??-1)?i:best),0)}else{target=chooseOpt(slots,refs,index)}replaced=slots[target]}slots[target]=page;loaded=page;last.set(page,index);if(algo==='fifo'&&replaced===null)pointer=(target+1)%count;steps.push(snapshot(replaced===null?`缺页：空闲帧装入页面 ${page}。`:`缺页：淘汰页面 ${replaced}，装入页面 ${page}。`));function snapshot(message){return{frames:[...slots],fault,hits,faults,replaced,loaded,message}}});return steps}
function chooseOpt(slots,refs,index){let best=0,distance=-1;slots.forEach((page,i)=>{const next=refs.slice(index+1).indexOf(page);const d=next<0?Infinity:next;if(d>distance){distance=d;best=i}});return best}
function comparison(states,total){const min=Math.min(...states.map((s)=>s.faults));const winners=states.map((s,i)=>s.faults===min?Object.keys(ALGOS)[i]:null).filter(Boolean).map((key)=>ALGOS[key].name).join('、');return `处理 ${total} 个页面后，${winners} 的累计缺页数最少（${min} 次）。OPT 使用未来信息，只作为理论上界。`}

function PageStory(){
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      setStep((v) => {
        if (v === STORY.length - 1) {
          setPlaying(false);
          return v;
        }
        return v + 1;
      });
    }, 4200);
    return () => clearTimeout(t);
  }, [playing, step]);

  return (
    <section className="transformer-story pager-story">
      <header className="story-intro">
        <div>
          <span className="story-kicker">动画导学 · 虚拟内存与页面置换</span>
          <h2>内存放不下时，必须决定保留谁</h2>
          <p>沿一条页面引用串，穿透虚拟内存、命中极速、缺页开销，深度对比 FIFO、LRU 与 OPT 三大策略原理。</p>
        </div>
        <div className="pager-story-status">
          <span>虚拟内存体系</span>
          <strong>Page ➔ Frame</strong>
          <small>容量有限 · 按需调页 · 淘汰置换</small>
        </div>
      </header>

      <nav className="story-timeline" style={{ '--story-steps': STORY.length }}>
        {STORY.map((x, i) => (
          <button
            key={x[0]}
            className={`${step === i ? 'active' : ''} ${i < step ? 'passed' : ''}`}
            onClick={() => {
              setStep(i);
              setPlaying(false);
            }}
          >
            <i>{i < step ? '✓' : i + 1}</i>
            <span>{x[0]}</span>
          </button>
        ))}
      </nav>

      <div className="story-stage" key={step}>
        <div className="story-copy">
          <span>0{step + 1} · {step === 0 ? '内存困境' : step === 1 ? '极速命中' : step === 2 ? '缺页风暴' : step === 3 ? 'FIFO 逻辑' : step === 4 ? 'LRU 核心' : step === 5 ? 'OPT 上帝视角' : '工程全景'}</span>
          <h3>{STORY[step][1]}</h3>
          <p>{pageStoryText(step)}</p>
          <aside>
            <strong>为什么重要？</strong>
            <p>{STORY[step][2]}</p>
          </aside>
        </div>

        <div className="story-visual page-story-rich-canvas">
          <PageStoryVisual step={step} />
        </div>
      </div>

      <footer className="story-controls">
        <button disabled={!step} onClick={() => setStep(step - 1)}>← 上一步</button>
        <button className="story-play" onClick={() => {
          if (step === STORY.length - 1) setStep(0);
          setPlaying((v) => !v);
        }}>
          {playing ? '暂停讲解' : '▶ 自动播放'}
        </button>
        <button disabled={step === STORY.length - 1} onClick={() => setStep(step + 1)}>下一步 →</button>
      </footer>
    </section>
  );
}

function PageStoryVisual({ step }) {
  switch (step) {
    case 0:
      return (
        <div className="ps-scene ps-scene-memory">
          <div className="ps-scene-header">
            <span className="ps-header-badge">场景透视 · 01</span>
            <strong>虚拟地址空间 (大) vs 物理内存物理帧 (小)</strong>
          </div>
          <div className="ps-funnel-layout">
            <div className="ps-block ps-virt-block">
              <div className="ps-block-title">
                <span>进程看到的虚拟内存 (Virtual Memory)</span>
                <small>4GB 庞大连续地址空间</small>
              </div>
              <div className="ps-pages-grid">
                {[
                  { id: 0, tag: '代码段', inMem: true, frame: 0 },
                  { id: 1, tag: '只读常量', inMem: true, frame: 1 },
                  { id: 2, tag: '全局数据', inMem: true, frame: 2 },
                  { id: 3, tag: '堆动态分配', inMem: false },
                  { id: 4, tag: '函数栈帧', inMem: false },
                  { id: 5, tag: '动态链接库', inMem: false },
                ].map((p) => (
                  <div className={`ps-page-pill ${p.inMem ? 'mapped' : 'unmapped'}`} key={p.id}>
                    <div className="page-id-row">
                      <strong>Page {p.id}</strong>
                      <small>{p.tag}</small>
                    </div>
                    <span className="page-status-tag">
                      {p.inMem ? `已映射 Frame ${p.frame}` : '在磁盘 Swap 中'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ps-bridge-col">
              <span className="ps-bridge-label">MMU / 页表</span>
              <div className="ps-bridge-line animated-flow">➔ 映射 ➔</div>
              <span className="ps-ratio-badge">只有 3 个位置</span>
            </div>

            <div className="ps-block ps-phys-block">
              <div className="ps-block-title">
                <span>实际物理内存 (RAM Frames)</span>
                <small className="full-warn">3/3 满载 100%</small>
              </div>
              <div className="ps-frames-column">
                <div className="ps-frame-slot active">
                  <div className="slot-head"><span>Frame 0</span><small>0x0000</small></div>
                  <strong className="slot-content">Page 0 (代码段)</strong>
                </div>
                <div className="ps-frame-slot active">
                  <div className="slot-head"><span>Frame 1</span><small>0x1000</small></div>
                  <strong className="slot-content">Page 1 (常量)</strong>
                </div>
                <div className="ps-frame-slot active">
                  <div className="slot-head"><span>Frame 2</span><small>0x2000</small></div>
                  <strong className="slot-content">Page 2 (全局)</strong>
                </div>
              </div>
            </div>
          </div>
          <div className="ps-scene-footer-tip">
            💡 <strong>矛盾所在</strong>：程序误以为自己拥有完整大内存，但实际物理 RAM 只能放下 3 个页面。当程序要访问 <code>Page 3</code> 时，必须强行选一个旧页面“淘汰”回磁盘！
          </div>
        </div>
      );

    case 1:
      return (
        <div className="ps-scene ps-scene-hit">
          <div className="ps-scene-header">
            <span className="ps-header-badge success">场景透视 · 02</span>
            <strong>内存命中 (Page Hit) · 零磁盘 I/O 极速访问</strong>
          </div>
          <div className="ps-hit-diagram">
            <div className="ps-cpu-emitter">
              <div className="cpu-badge">CPU 发起读请求</div>
              <div className="cpu-req-box">
                <code>LOAD R1, [Page 1 地址]</code>
              </div>
              <span className="down-signal">⚡ 查 MMU 页表...</span>
            </div>

            <div className="ps-hit-core">
              <div className="hit-status-banner">
                <span className="hit-check-badge">有效位 Valid = 1 (页面已在物理内存中)</span>
                <h4 className="hit-glow-text">🎉 命中 (HIT)！无需任何置换与磁盘访问</h4>
              </div>

              <div className="ps-frames-inspect">
                <div className="frame-item idle">
                  <span>Frame 0</span>
                  <strong>Page 0</strong>
                  <small>未被访问</small>
                </div>
                <div className="frame-item hit-target-box">
                  <span className="target-label">Frame 1 · 命中目标</span>
                  <strong className="hit-page-num">Page 1</strong>
                  <span className="hit-fire-chip">⚡ 毫秒级直接传输</span>
                </div>
                <div className="frame-item idle">
                  <span>Frame 2</span>
                  <strong>Page 2</strong>
                  <small>未被访问</small>
                </div>
              </div>

              <div className="ps-speed-contrast">
                <div className="speed-pill fast">
                  <small>物理 RAM 读取耗时</small>
                  <strong>~100 ns</strong>
                  <span>(极速硬件直通)</span>
                </div>
                <span className="vs-sign">比磁盘快 100,000 倍</span>
                <div className="speed-pill slow">
                  <small>若缺页走磁盘调页耗时</small>
                  <strong>~10,000,000 ns</strong>
                  <span>(产生机械/固态 I/O)</span>
                </div>
              </div>
            </div>
          </div>
          <div className="ps-scene-footer-tip success">
            💡 <strong>命中无需操作系统介入</strong>：数据直接从极速 RAM 送入 CPU 寄存器。页面置换算法的所有设计目标，就是为了在有限帧数下把<strong>命中率拉到最高</strong>！
          </div>
        </div>
      );

    case 2:
      return (
        <div className="ps-scene ps-scene-fault">
          <div className="ps-scene-header">
            <span className="ps-header-badge danger">场景透视 · 03</span>
            <strong>缺页中断 (Page Fault) · 内存已满触发淘汰抉择</strong>
          </div>

          <div className="ps-fault-container">
            <div className="fault-trigger-bar">
              <div className="cpu-req danger">
                <small>CPU 发起访问</small>
                <strong>请求 Page 3</strong>
              </div>
              <span className="fault-arrow">➔ 查 MMU ➔</span>
              <div className="fault-alarm-box">
                <span className="alarm-icon">🚨</span>
                <div>
                  <strong>缺页中断异常 (Interrupt 0x0E)</strong>
                  <small>Page 3 不在内存中，CPU 暂停当前程序并陷入 OS 内核！</small>
                </div>
              </div>
            </div>

            <div className="fault-dilemma-grid">
              <div className="dilemma-box">
                <div className="dilemma-title">
                  <span>检查当前 3 个物理帧状态</span>
                  <b className="full-tag">0 个空闲帧 (全满)</b>
                </div>
                <div className="candidate-frames">
                  <div className="cand-item">
                    <span>Frame 0</span>
                    <strong>Page 0</strong>
                    <small>淘汰候选 1</small>
                  </div>
                  <div className="cand-item">
                    <span>Frame 1</span>
                    <strong>Page 1</strong>
                    <small>淘汰候选 2</small>
                  </div>
                  <div className="cand-item">
                    <span>Frame 2</span>
                    <strong>Page 2</strong>
                    <small>淘汰候选 3</small>
                  </div>
                </div>
                <div className="victim-crosshair">
                  🎯 <strong>必须在 [0, 1, 2] 中选出 1 个牺牲者 (Victim) 逐出内存！</strong>
                </div>
              </div>

              <div className="swap-cost-card">
                <div className="cost-title">缺页中断的高昂处理流程</div>
                <ol className="cost-steps-list">
                  <li><span>1</span> 算法选定牺牲页面 (Victim Page)</li>
                  <li><span>2</span> 若被修改过，将牺牲页面写回磁盘</li>
                  <li><span>3</span> 磁盘读取 Page 3 写入腾出的物理帧</li>
                  <li><span>4</span> 更新页表映射关系，恢复 CPU 运行</li>
                </ol>
                <div className="cost-warning">
                  ⚠️ 这一流程耗时约 <strong>10ms</strong>，相当于 CPU 白白浪费数千万个时钟周期！
                </div>
              </div>
            </div>
          </div>
          <div className="ps-scene-footer-tip danger">
            💡 <strong>核心算法之争由此爆发</strong>：究竟把谁作为“牺牲者”赶回磁盘？选错了会导致该页面刚出去马上又缺页被换进来，引发灾难级的<strong>内存颠簸 (Thrashing)</strong>！
          </div>
        </div>
      );

    case 3:
      return (
        <div className="ps-scene ps-scene-algo">
          <div className="ps-scene-header">
            <span className="ps-header-badge fifo">算法透视 · FIFO</span>
            <strong>先进先出 · 传送带时序模型 (First In, First Out)</strong>
          </div>

          <div className="ps-conveyor-stage">
            <div className="conveyor-intro-strip">
              <span>决策铁律</span>
              <strong>完全按照“进入内存的先后顺序”排队；最早进来的，最先被淘汰。</strong>
            </div>

            <div className="conveyor-machine-wrap">
              <div className="conveyor-entry">
                <span className="incoming-tag">新请求到达</span>
                <div className="new-page-bubble">Page 2</div>
                <small>等待放入内存</small>
              </div>

              <div className="conveyor-track">
                <div className="track-rail">
                  <div className="track-slot newest">
                    <span className="slot-time">10:02 进入 (最新)</span>
                    <strong className="slot-page">Page 1</strong>
                    <small className="role-safe">暂不受威胁</small>
                  </div>
                  <div className="track-arrow-step">◀──</div>
                  <div className="track-slot middle">
                    <span className="slot-time">10:01 进入</span>
                    <strong className="slot-page">Page 0</strong>
                    <small className="role-safe">排在中间</small>
                  </div>
                  <div className="track-arrow-step">◀──</div>
                  <div className="track-slot oldest target-victim">
                    <span className="slot-time">10:00 进入 (最老 👴)</span>
                    <strong className="slot-page">Page 7</strong>
                    <span className="victim-badge">🎯 强制淘汰</span>
                  </div>
                </div>
                <div className="track-motion-bar">
                  <span>传送带运动方向 ──────────────────────▶ 出口 (淘汰端)</span>
                </div>
              </div>

              <div className="conveyor-exit">
                <span className="drop-tag">坠入磁盘 Swap</span>
                <div className="dropped-page">Page 7</div>
                <small>被挤出物理帧</small>
              </div>
            </div>

            <div className="ps-pitfall-box">
              <div className="pitfall-header">
                <strong>⚠️ FIFO 致命缺陷：Belady 异常 (Belady's Anomaly)</strong>
                <span>盲目按年龄淘汰，不问页面是否正在高频使用！</span>
              </div>
              <p>
                如果 <code>Page 7</code> 是程序正在高频循环执行的核心代码（1秒调用1000次），只要它进入较早，FIFO 也会盲目将它赶出内存。
                这会导致荒谬的现象：<strong>增加物理内存帧数，缺页次数反而可能不降反增！</strong>
              </p>
            </div>
          </div>
        </div>
      );

    case 4:
      return (
        <div className="ps-scene ps-scene-algo">
          <div className="ps-scene-header">
            <span className="ps-header-badge lru">算法透视 · LRU</span>
            <strong>最近最久未使用 · 时间局部性时间轴模型 (Least Recently Used)</strong>
          </div>

          <div className="ps-timeline-stage">
            <div className="conveyor-intro-strip lru-strip">
              <span>决策铁律</span>
              <strong>向前看过去历史：淘汰自上次被访问以来，经历时间最长（最久未用）的页面。</strong>
            </div>

            <div className="lru-axis-container">
              <div className="axis-legend-row">
                <span className="axis-cold">❄️ 过去很久 (冷页面 · 最久未用)</span>
                <div className="axis-line-arrow">────────── 时间流向 ──────────▶</div>
                <span className="axis-hot">🔥 刚刚访问 (热页面 · 刚用过)</span>
              </div>

              <div className="lru-nodes-flow">
                <div className="lru-card cold-target">
                  <div className="card-top-tag">5 秒前访问</div>
                  <strong className="page-title">Page 0</strong>
                  <div className="card-state-alert">⏳ 沉底最久 · 淘汰指针锁定！</div>
                </div>

                <div className="lru-sep-arrow">◀──</div>

                <div className="lru-card warm">
                  <div className="card-top-tag">2 秒前访问</div>
                  <strong className="page-title">Page 1</strong>
                  <div className="card-state-desc">中期访问，安全保留</div>
                </div>

                <div className="lru-sep-arrow">◀──</div>

                <div className="lru-card hot">
                  <div className="card-top-tag">0.1 秒前刚访问</div>
                  <strong className="page-title">Page 2</strong>
                  <div className="card-state-hot">🔥 极度活跃，留在链表头</div>
                </div>
              </div>

              <div className="lru-action-banner">
                <div className="incoming-notice">
                  <span>新页面 <strong>Page 3</strong> 发生缺页</span>
                  ➔ 检查时间轴最左端 ➔ <strong>精准淘汰沉底最久的 Page 0！</strong>
                </div>
              </div>
            </div>

            <div className="ps-philosophy-card">
              <div className="phil-title">💡 为什么 LRU 效果极佳？基于“时间局部性定律”</div>
              <p>
                计算机程序运行具有强烈的<strong>局部性原理 (Locality)</strong>：刚刚被访问过的页面，在接下来的时间里极大概率会再次被访问；
                而过去很久都没有摸过的页面，大概率已经执行完毕或处于闲置。LRU 尊重这一程序运行本质，因此在现实系统中最接近理论极限！
              </p>
            </div>
          </div>
        </div>
      );

    case 5:
      return (
        <div className="ps-scene ps-scene-algo">
          <div className="ps-scene-header">
            <span className="ps-header-badge opt">算法透视 · OPT</span>
            <strong>最佳理论算法 · 洞悉未来的上帝视角 (Optimal Replacement)</strong>
          </div>

          <div className="ps-future-stage">
            <div className="conveyor-intro-strip opt-strip">
              <span>决策铁律</span>
              <strong>向后看未来：淘汰在接下来的引用序列中，“未来最长时间内不再被使用”或“永远不再出现”的页面。</strong>
            </div>

            <div className="opt-radar-wrap">
              <div className="opt-memory-pool">
                <div className="pool-header">当前物理帧候选页面</div>
                <div className="pool-items">
                  <div className="pool-item safe">
                    <strong>Page 0</strong>
                    <small>未来距离 = 1 步</small>
                    <span>马上就要用！绝不淘汰</span>
                  </div>
                  <div className="pool-item medium">
                    <strong>Page 2</strong>
                    <small>未来距离 = 3 步</small>
                    <span>稍后还会用</span>
                  </div>
                  <div className="pool-item victim-opt">
                    <strong>Page 1</strong>
                    <small className="dist-inf">未来距离 = ∞ 无穷大！</small>
                    <span className="kill-tag">🎯 绝对最优牺牲者</span>
                  </div>
                </div>
              </div>

              <div className="opt-stream-tracker">
                <div className="tracker-title">
                  <span>未来页面引用序列流 (Future Stream)</span>
                  <small>拥有预知未来的“上帝视角”</small>
                </div>
                <div className="stream-blocks-row">
                  <div className="current-pt">当前: Page 3</div>
                  <div className="stream-arrow">──▶</div>
                  <div className="stream-pill match-zero">0<small>第1步</small></div>
                  <div className="stream-pill">4<small>第2步</small></div>
                  <div className="stream-pill match-two">2<small>第3步</small></div>
                  <div className="stream-pill">3<small>第4步</small></div>
                  <div className="stream-pill match-zero">0<small>第5步</small></div>
                  <div className="stream-pill none-pill">...不再有 1...</div>
                </div>
                <div className="stream-verdict">
                  🔭 <strong>未来雷达扫描结果</strong>：<code>Page 1</code> 在未来序列中完全不再出现，淘汰它对后续程序的执行**产生 0 次缺页惩罚**！
                </div>
              </div>
            </div>

            <div className="ps-theory-limit-card">
              <strong>⭐ OPT 的工程现实定位：黄金理论上界</strong>
              <p>
                因为操作系统在运行时<strong>无法未卜先知</strong>用户接下来会点什么按钮、程序接下来会走哪条 if-else 分支，所以 OPT 无法在真实操作系统中实现。
                但它具有不可替代的科学价值——用作衡量所有实际算法（FIFO、LRU 等）距离“完美极限”还有多远的<strong>终极基准线</strong>。
              </p>
            </div>
          </div>
        </div>
      );

    case 6:
      return (
        <div className="ps-scene ps-scene-compare">
          <div className="ps-scene-header">
            <span className="ps-header-badge summary">全景决战 · 07</span>
            <strong>三大算法横向三维决战与工程现实选择</strong>
          </div>

          <div className="ps-showdown-grid">
            <div className="showdown-card fifo-col">
              <div className="card-top">
                <span className="badge-type">简单但盲目</span>
                <h4>FIFO 先进先出</h4>
              </div>
              <ul className="spec-list">
                <li><span>决策依据</span><strong>进入时间戳 (过去)</strong></li>
                <li><span>硬件实现</span><strong className="star">★☆☆☆☆ (只需简单队列)</strong></li>
                <li><span>缺页率表现</span><strong>平庸 (缺页频繁)</strong></li>
                <li><span>Belady 异常</span><strong className="bad">❌ 会发生异常</strong></li>
                <li><span>适用场景</span><strong>开销要求极严的微嵌入式</strong></li>
              </ul>
            </div>

            <div className="showdown-card lru-col">
              <div className="card-top">
                <span className="badge-type gold">工程事实标准</span>
                <h4>LRU 最近最久未使用</h4>
              </div>
              <ul className="spec-list">
                <li><span>决策依据</span><strong>访问时间戳 / 顺序 (过去)</strong></li>
                <li><span>硬件实现</span><strong className="star">★★★☆☆ (需维护时钟或链表)</strong></li>
                <li><span>缺页率表现</span><strong className="good">优秀 (逼近理论最优)</strong></li>
                <li><span>Belady 异常</span><strong className="good">✅ 绝不会发生 (栈式算法)</strong></li>
                <li><span>适用场景</span><strong>操作系统虚拟内存与数据库缓存</strong></li>
              </ul>
            </div>

            <div className="showdown-card opt-col">
              <div className="card-top">
                <span className="badge-type purple">上帝视角基准</span>
                <h4>OPT 最佳理论置换</h4>
              </div>
              <ul className="spec-list">
                <li><span>决策依据</span><strong>引用序列下次出现距离 (未来)</strong></li>
                <li><span>硬件实现</span><strong className="bad">不可行 (无法预测未来)</strong></li>
                <li><span>缺页率表现</span><strong className="best">★★★★★ (数学绝对上限)</strong></li>
                <li><span>Belady 异常</span><strong className="good">✅ 绝不会发生</strong></li>
                <li><span>适用场景</span><strong>事后回放分析与理论基准评估</strong></li>
              </ul>
            </div>
          </div>

          <div className="ps-realworld-insight">
            <div className="insight-badge">🚀 现代操作系统（Linux / Windows）究竟在用什么？</div>
            <p>
              真实硬件中直接维护精确的 LRU 链表代价过高，因此操作系统普遍采用 <strong>Clock (时钟/二次机会) 置换算法</strong>：
              将物理帧排成一个环形表盘，利用硬件每访问一次自动置 1 的<strong>访问位 (Access Bit)</strong>。
              淘汰时指针像时钟一样旋转：遇到 1 则给一次免死机会并清为 0 继续走；遇到 0 则立即淘汰。
              <strong>以极低开销实现了几乎等同于 LRU 的卓越性能！</strong>
            </p>
          </div>
        </div>
      );

    default:
      return null;
  }
}
function pageStoryText(i){return['程序看到的是较大的虚拟地址空间，真正运行时只有部分页面被装入物理内存。','访问页面时先检查它是否已在物理帧中；若存在，本次访问就是命中。','若页面不在内存，就发生缺页；内存已满时必须先淘汰一个页面。','FIFO 把页面按进入内存的时间排队，最早进入者最先被淘汰。','LRU 记录最近使用时间，优先淘汰最久没有访问的页面。','OPT 查看后续引用串，淘汰未来最晚使用或不再使用的页面。','缺页会引发昂贵的磁盘访问；算法目标是在有限帧数下尽量降低缺页率。'][i]}
