import React,{useEffect,useMemo,useState}from'react'
import{ExperimentHeader}from'./AttentionExperiment'
import LearningCycle from'./LearningCycle'

const PROCESSES=['P1','P2','P3'],RESOURCES=['R1','R2','R3']
const PRESETS={safe:{name:'安全状态',owners:{R1:'P1',R2:'P2',R3:null},waiting:[{process:'P2',resource:'R1'}]},competition:{name:'资源竞争',owners:{R1:'P1',R2:null,R3:null},waiting:[{process:'P2',resource:'R1'},{process:'P3',resource:'R1'}]},deadlock:{name:'死锁环',owners:{R1:'P1',R2:'P2',R3:'P3'},waiting:[{process:'P1',resource:'R2'},{process:'P2',resource:'R3'},{process:'P3',resource:'R1'}]}}
const STORY=[['临界区','多个进程访问共享资源时，需要同步规则','同步保证关键操作互斥，避免数据竞争和不一致。'],['申请','进程必须先申请资源，成功后才能使用','资源只有一个实例时，同一时刻只能由一个进程持有。'],['阻塞','资源已被占用，申请者进入等待状态','阻塞避免忙等，但等待关系可能逐渐形成依赖链。'],['条件','死锁需要四个条件同时成立','互斥、占有并等待、不可剥夺、循环等待缺一不可。'],['等待环','等待图出现环时，进程彼此等待','每个进程都等环中下一个进程释放资源，因而无人能继续。'],['解除','释放、剥夺或破坏环可解除死锁','预防策略的本质是主动破坏四个必要条件之一。'],['安全性','安全状态允许找到一个完成顺序','即使当前有人等待，只要存在依次完成的路径，就不等于死锁。']]

export default function DeadlockExperiment({experiment}){
 const[owners,setOwners]=useState({...PRESETS.safe.owners}),[waiting,setWaiting]=useState(PRESETS.safe.waiting),[process,setProcess]=useState('P1'),[resource,setResource]=useState('R1'),[message,setMessage]=useState('P2 正在等待 P1 释放 R1；P1 可以继续执行。')
 const cycle=useMemo(()=>findCycle(owners,waiting),[owners,waiting]);const blocked=new Set(waiting.map((x)=>x.process))
 function load(key){const p=PRESETS[key];setOwners({...p.owners});setWaiting(p.waiting.map((x)=>({...x})));setMessage(`已加载“${p.name}”示例。`)}
 function request(){const owner=owners[resource];if(owner===process){setMessage(`${process} 已经持有 ${resource}，无需重复申请。`);return}if(!owner){setOwners((current)=>({...current,[resource]:process}));setWaiting((current)=>current.filter((x)=>!(x.process===process&&x.resource===resource)));setMessage(`${process} 成功获得空闲资源 ${resource}。`)}else{setWaiting((current)=>current.some((x)=>x.process===process&&x.resource===resource)?current:[...current,{process,resource}]);setMessage(`${resource} 被 ${owner} 持有，${process} 进入阻塞等待。`)}}
 function release(){if(owners[resource]!==process){setMessage(`${process} 没有持有 ${resource}，不能释放。`);return}const waiter=waiting.find((x)=>x.resource===resource);setOwners((current)=>({...current,[resource]:waiter?.process??null}));setWaiting((current)=>current.filter((x)=>x!==waiter));setMessage(waiter?`${process} 释放 ${resource}，等待最久的 ${waiter.process} 获得资源并被唤醒。`:`${process} 释放 ${resource}，它现在为空闲状态。`)}
 function releaseAll(){const held=RESOURCES.filter((r)=>owners[r]===process);if(!held.length){setMessage(`${process} 当前没有持有资源。`);return}let nextOwners={...owners},nextWaiting=[...waiting];held.forEach((r)=>{const waiter=nextWaiting.find((x)=>x.resource===r);nextOwners[r]=waiter?.process??null;if(waiter)nextWaiting=nextWaiting.filter((x)=>x!==waiter)});setOwners(nextOwners);setWaiting(nextWaiting);setMessage(`${process} 已释放全部资源，等待进程按顺序获得可用资源。`)}
 return <><ExperimentHeader experiment={experiment} eyebrow="操作系统实验 03"/><DeadlockStory/><div className="explore-heading"><span>自由探索 · 亲手构造或解除等待环</span><h2>控制资源申请与释放，观察死锁何时形成</h2><p>实线表示资源已分配，虚线表示进程正在等待；系统会实时检测进程等待图中的环。</p></div><div className="lab-layout deadlock-layout"><aside className="control-panel"><div className="panel-title"><span>资源操作</span><i className={cycle.length?'':'online'}>{cycle.length?'检测到死锁':'无死锁'}</i></div><label className="field-block"><span>选择进程</span><select value={process} onChange={(e)=>setProcess(e.target.value)}>{PROCESSES.map((x)=><option key={x}>{x}</option>)}</select></label><label className="field-block"><span>选择资源</span><select value={resource} onChange={(e)=>setResource(e.target.value)}>{RESOURCES.map((x)=><option key={x}>{x} · {owners[x]?`${owners[x]} 持有`:'空闲'}</option>)}</select></label><div className="deadlock-actions"><button onClick={request}>申请资源</button><button onClick={release}>释放资源</button></div><button className="gd-reset" onClick={releaseAll}>释放 {process} 的全部资源</button><div className="deadlock-presets"><span>状态预设</span><div><button onClick={()=>load('safe')}>安全状态</button><button onClick={()=>load('competition')}>资源竞争</button><button onClick={()=>load('deadlock')}>死锁环</button></div></div><div className={`live-explanation ${cycle.length?'danger':''}`}><span>{cycle.length?'系统警报':'操作解释'}</span><strong>{cycle.length?`等待环：${cycle.join(' → ')} → ${cycle[0]}`:message}</strong><p>{cycle.length?'环中每个进程都在等待下一个进程持有的资源，因此没有进程能够继续。':`${blocked.size} 个进程阻塞；等待并不一定等于死锁。`}</p></div></aside><section className="visual-panel deadlock-visual"><div className="visual-toolbar"><div><strong>资源分配图</strong><span>绿色实线：资源 → 持有者 · 橙色虚线：等待者 → 资源</span></div><span className={`source-chip ${cycle.length?'deadlock-chip':''}`}>{cycle.length?'Deadlock':'Safe / Waiting'}</span></div><ResourceGraph owners={owners} waiting={waiting} cycle={cycle}/><div className="deadlock-state-grid"><div><span>资源持有情况</span>{RESOURCES.map((r)=><p key={r}><b>{r}</b><strong>{owners[r]??'空闲'}</strong></p>)}</div><div><span>进程状态</span>{PROCESSES.map((p)=><p key={p}><b>{p}</b><strong className={cycle.includes(p)?'danger':blocked.has(p)?'waiting':'running'}>{cycle.includes(p)?'死锁':blocked.has(p)?'阻塞':'可运行'}</strong></p>)}</div></div><div className="deadlock-conditions">{['互斥','占有并等待','不可剥夺','循环等待'].map((x,i)=><span className={i<3||cycle.length?'met':''} key={x}><i>{i<3||cycle.length?'✓':'○'}</i>{x}</span>)}</div></section></div><LearningCycle experimentId="deadlock" prediction={{question:'系统中有进程等待资源，就一定发生死锁了吗？',options:['一定是','不一定','只要有两个进程就是'],answer:'不一定',explanation:' 若持有资源的进程仍能继续并最终释放资源，等待者就能被唤醒，不构成死锁。'}} operation={{title:'构造并解除一个等待环',instruction:'加载“死锁环”预设，观察 P1→P2→P3 的依赖；然后选择一个进程并释放它持有的全部资源。'}} observation={cycle.length?`当前检测到死锁环：${cycle.join(' → ')} → ${cycle[0]}。`:`当前没有等待环，${blocked.size} 个进程处于阻塞等待。`} summaryPrompt="死锁的四个必要条件是什么？破坏其中哪个条件可以解除当前示例？"/></>
}
function ResourceGraph({owners,waiting,cycle}){const pp={P1:[130,105],P2:[360,105],P3:[590,105]},rp={R1:[130,310],R2:[360,310],R3:[590,310]};return <svg className="resource-graph" viewBox="0 0 720 410"><defs><marker id="greenArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#159a83"/></marker><marker id="orangeArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#ee6c4d"/></marker></defs>{RESOURCES.map((r)=>owners[r]&&<line className="allocation" key={`a-${r}`} x1={rp[r][0]} y1={rp[r][1]-34} x2={pp[owners[r]][0]} y2={pp[owners[r]][1]+37} markerEnd="url(#greenArrow)"/>)}{waiting.map((w,i)=><line className={cycle.includes(w.process)?'request cycle':'request'} key={`w-${w.process}-${w.resource}-${i}`} x1={pp[w.process][0]} y1={pp[w.process][1]+37} x2={rp[w.resource][0]} y2={rp[w.resource][1]-37} markerEnd="url(#orangeArrow)"/>)}{PROCESSES.map((p)=><g className={`process-node ${cycle.includes(p)?'cycle':''}`} key={p} transform={`translate(${pp[p][0]},${pp[p][1]})`}><circle r="37"/><text y="5">{p}</text></g>)}{RESOURCES.map((r)=><g className={`resource-node ${owners[r]?'owned':''}`} key={r} transform={`translate(${rp[r][0]},${rp[r][1]})`}><rect x="-34" y="-34" width="68" height="68" rx="14"/><text y="5">{r}</text><text className="owner" y="53">{owners[r]?`${owners[r]} 持有`:'空闲'}</text></g>)}</svg>}
function findCycle(owners,waiting){const edges={};waiting.forEach(({process,resource})=>{const owner=owners[resource];if(owner)(edges[process]??=[]).push(owner)});const visiting=new Set(),visited=new Set(),path=[];function dfs(p){if(visiting.has(p)){const i=path.indexOf(p);return path.slice(i)}if(visited.has(p))return null;visiting.add(p);path.push(p);for(const next of edges[p]??[]){const found=dfs(next);if(found)return found}path.pop();visiting.delete(p);visited.add(p);return null}for(const p of PROCESSES){const found=dfs(p);if(found)return found}return[]}

function DeadlockStory(){
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
    <section className="transformer-story deadlock-story">
      <header className="story-intro">
        <div>
          <span className="story-kicker">动画导学 · 进程同步与死锁成因</span>
          <h2>等待并不可怕，可怕的是等待形成闭环</h2>
          <p>从共享资源的互斥独占开始，穿透四大必要条件，逐帧推演死锁形成的完整动态时序过程。</p>
        </div>
        <div className="deadlock-story-status">
          <span>死锁核心模型</span>
          <strong>P1 ⇄ P2 形成死循环</strong>
          <small>互斥 · 占有并等待 · 不可剥夺 · 循环等待</small>
        </div>
      </header>

      <nav className="story-timeline" style={{ '--story-steps': STORY.length }}>
        {STORY.map((x, i) => (
          <button
            key={x[0]}
            type="button"
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
          <span>0{step + 1} · {step === 0 ? '互斥独占' : step === 1 ? '占有等待' : step === 2 ? '禁止剥夺' : step === 3 ? '四大条件' : step === 4 ? '闭环演变' : step === 5 ? '破环解除' : '安全检测'}</span>
          <h3>{STORY[step][1]}</h3>
          <p>{deadlockStoryText(step)}</p>
          <aside>
            <strong>为什么重要？</strong>
            <p>{STORY[step][2]}</p>
          </aside>
        </div>

        <div className="story-visual deadlock-story-rich-canvas">
          <DeadlockStoryVisual step={step} />
        </div>
      </div>

      <footer className="story-controls">
        <button type="button" disabled={!step} onClick={() => setStep(step - 1)}>← 上一步</button>
        <button type="button" className="story-play" onClick={() => {
          if (step === STORY.length - 1) setStep(0);
          setPlaying((v) => !v);
        }}>
          {playing ? '暂停讲解' : '▶ 自动播放'}
        </button>
        <button type="button" disabled={step === STORY.length - 1} onClick={() => setStep(step + 1)}>下一步 →</button>
      </footer>
    </section>
  );
}

function DeadlockStoryVisual({ step }) {
  const [evoStage, setEvoStage] = useState(3); // 0, 1, 2, 3

  switch (step) {
    case 0:
      return (
        <div className="dl-sc dl-sc-mutex">
          <div className="dl-sc-header">
            <span className="dl-tag">条件 1 · 互斥 (Mutual Exclusion)</span>
            <strong>临界资源不可共享 · 一次只能 1 个进程持有</strong>
          </div>
          <div className="mutex-gate-stage">
            <div className="mutex-process-queue">
              <div className="p-in-gate running">
                <span className="p-role">持有锁运行中</span>
                <strong>进程 P1</strong>
                <small>正在写入内存共享区</small>
              </div>
              <div className="gate-barrier locked">
                <div className="lock-icon">🔒</div>
                <div className="lock-info">
                  <strong>MUTEX LOCK (互斥锁已占用)</strong>
                  <small>临界区大门紧闭，禁止第二个进程进入！</small>
                </div>
              </div>
              <div className="p-in-gate blocked">
                <span className="p-role warn">被门禁阻挡</span>
                <strong>进程 P2</strong>
                <small>只能在门外进入挂起等待队列</small>
              </div>
            </div>

            <div className="critical-resource-box">
              <span className="res-tag">受保护的临界资源</span>
              <strong>Resource R1 (如打印机 / 共享银行账户)</strong>
              <p>为了保证数据一致性，如果两个进程同时写入就会发生数据破坏，因此必须施加排他性互斥锁！</p>
            </div>
          </div>
          <div className="dl-footer-tip">
            💡 <strong>死锁必要条件之一</strong>：资源具有排他性。如果所有资源都能无限并发读取，根本就不会发生等待与死锁！
          </div>
        </div>
      );

    case 1:
      return (
        <div className="dl-sc dl-sc-hold">
          <div className="dl-sc-header">
            <span className="dl-tag">条件 2 · 占有并等待 (Hold and Wait)</span>
            <strong>吃着碗里的，看着锅里的 · 贪心持有不撒手</strong>
          </div>
          <div className="hold-wait-diagram">
            <div className="hold-flow-grid">
              <div className="process-hold-card p1-side">
                <div className="proc-header">
                  <strong>进程 P1</strong>
                  <span className="greedy-tag">贪心占有者</span>
                </div>
                <div className="action-arrows">
                  <div className="arrow-box holding">
                    <span className="arrow-label">一手死死抓着</span>
                    <strong className="res-badge">已占有 R1 (打印机)</strong>
                  </div>
                  <div className="arrow-box requesting">
                    <span className="arrow-label">另一手向外强索</span>
                    <strong className="res-badge want">申请 R2 (扫描仪)</strong>
                  </div>
                </div>
              </div>

              <div className="versus-divider">
                <span>同时发生</span>
                <i>VS</i>
                <span>互不相让</span>
              </div>

              <div className="process-hold-card p2-side">
                <div className="proc-header">
                  <strong>进程 P2</strong>
                  <span className="greedy-tag">贪心占有者</span>
                </div>
                <div className="action-arrows">
                  <div className="arrow-box holding">
                    <span className="arrow-label">一手死死抓着</span>
                    <strong className="res-badge">已占有 R2 (扫描仪)</strong>
                  </div>
                  <div className="arrow-box requesting">
                    <span className="arrow-label">另一手向外强索</span>
                    <strong className="res-badge want">申请 R1 (打印机)</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="rag-preview-strip">
              <span className="rag-label">资源分配图局部映射</span>
              <code>R1 ──▶ P1 ┄┄▶ R2 ──▶ P2 ┄┄▶ R1</code>
              <small>实线表示已分配，虚线表示正在申请</small>
            </div>
          </div>
          <div className="dl-footer-tip">
            💡 <strong>死锁必要条件之二</strong>：进程至少持有一个资源，并且在不释放已有资源的前提下，提出新的资源申请。
          </div>
        </div>
      );

    case 2:
      return (
        <div className="dl-sc dl-sc-preempt">
          <div className="dl-sc-header">
            <span className="dl-tag danger">条件 3 · 不可剥夺 (No Preemption)</span>
            <strong>神圣不可侵犯 · 未主动释放前谁也不能硬抢</strong>
          </div>
          <div className="no-preempt-stage">
            <div className="preempt-visual-row">
              <div className="victim-p">
                <strong>进程 P1 (阻塞中)</strong>
                <p>因申请 R2 失败，陷入挂起休眠状态，无法继续执行指令。</p>
              </div>

              <div className="os-police-shield">
                <div className="shield-icon">🛡️</div>
                <strong>OS 内核保护规则：不可剥夺</strong>
                <span>“进程持有的资源不能被强行剥夺，除非持有者主动调用 release() 释放。”</span>
                <span className="forbid-chip">❌ 操作系统禁止强制没收 R2</span>
              </div>

              <div className="owner-p">
                <strong>进程 P2 (阻塞中)</strong>
                <p>也处于挂起休眠，只有拿到 R1 才会释放 R2。但双方都在睡大觉！</p>
              </div>
            </div>

            <div className="deadlock-stalemate-box">
              <div className="stalemate-icon">⚖️</div>
              <div className="stalemate-text">
                <strong>陷入僵局 (Stalemate)</strong>
                <p>因为不可剥夺，P1 拿不到 R2 就永远不放 R1；P2 拿不到 R1 就永远不放 R2。没有外部力量介入，双方将在这场对峙中永久冰封！</p>
              </div>
            </div>
          </div>
          <div className="dl-footer-tip danger">
            💡 <strong>死锁必要条件之三</strong>：进程已获得的资源在未使用完之前，不能被剥夺，只能在使用完时由自己主动释放。
          </div>
        </div>
      );

    case 3:
      return (
        <div className="dl-sc dl-sc-conditions">
          <div className="dl-sc-header">
            <span className="dl-tag warning">核心理论 · 死锁四必要条件</span>
            <strong>四要素齿轮严密咬合 · 缺一不可</strong>
          </div>
          <div className="four-conditions-grid">
            <div className="cond-card met">
              <div className="cond-head">
                <span className="cond-num">01</span>
                <strong>互斥条件</strong>
              </div>
              <p>资源具有排他性，一段时间内只能被一个进程占有。</p>
              <span className="cond-status">✓ 必要前提</span>
            </div>

            <div className="cond-card met">
              <div className="cond-head">
                <span className="cond-num">02</span>
                <strong>占有并等待</strong>
              </div>
              <p>进程在占有至少一个资源的同时，又申请被他人占有的新资源。</p>
              <span className="cond-status">✓ 贪心持有</span>
            </div>

            <div className="cond-card met">
              <div className="cond-head">
                <span className="cond-num">03</span>
                <strong>不可剥夺条件</strong>
              </div>
              <p>已被占有的资源在未被主动释放前，不能被第三方强行夺走。</p>
              <span className="cond-status">✓ 外部无权剥夺</span>
            </div>

            <div className="cond-card met trigger">
              <div className="cond-head">
                <span className="cond-num">04</span>
                <strong>循环等待条件</strong>
              </div>
              <p>存在一个进程等待链：P0 等 P1，P1 等 P2，...，Pn 等 P0，形成闭环！</p>
              <span className="cond-status trigger-alert">🚨 致命闭环达成！</span>
            </div>
          </div>

          <div className="cond-verdict-banner">
            <span className="alarm-badge">系统警告</span>
            <strong>当且仅当以上 4 个条件同时具备时，死锁必然发生！</strong>
            <small>因此，预防死锁的核心工程思想就是——想方设法<strong>破坏这 4 个条件中的任意一个</strong>！</small>
          </div>
        </div>
      );

    case 4:
      return (
        <div className="dl-sc dl-sc-evolution">
          <div className="dl-sc-header">
            <span className="dl-tag cycle-tag">死锁形成演变全时序 · 逐帧透视</span>
            <strong>从无害申请到形成死锁闭环的 4 个关键阶段</strong>
          </div>

          <div className="evolution-controller-tabs">
            {[
              { id: 0, title: '阶段 1: 各自申请' },
              { id: 1, title: '阶段 2: 成功持有' },
              { id: 2, title: '阶段 3: 单向等待 (安全)' },
              { id: 3, title: '阶段 4: 闭环形成 💥 死锁！' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                className={`evo-btn ${evoStage === st.id ? 'active' : ''}`}
                onClick={() => setEvoStage(st.id)}
              >
                {st.title}
              </button>
            ))}
          </div>

          <div className="evolution-canvas-wrap">
            <div className={`rag-visual-box stage-${evoStage}`}>
              {/* 资源分配图动态渲染 */}
              <div className="rag-row rag-processes">
                <div className={`rag-node p-node p1 ${evoStage === 3 ? 'deadlocked-node' : ''}`}>
                  <span className="node-id">P1</span>
                  <small className="node-desc">
                    {evoStage === 0 ? '申请 R1' : evoStage >= 1 ? '持有 R1' : ''}
                  </small>
                </div>

                <div className="rag-middle-indicator">
                  {evoStage === 0 && <span className="stage-tip">双方刚启动</span>}
                  {evoStage === 1 && <span className="stage-tip safe">各自拿到 1 个资源</span>}
                  {evoStage === 2 && <span className="stage-tip warn">P1 等待 R2 (单向依赖，仍安全)</span>}
                  {evoStage === 3 && <span className="stage-tip danger-pulse">🚨 等待形成闭环！双向死锁！</span>}
                </div>

                <div className={`rag-node p-node p2 ${evoStage === 3 ? 'deadlocked-node' : ''}`}>
                  <span className="node-id">P2</span>
                  <small className="node-desc">
                    {evoStage <= 1 ? '持有 R2' : evoStage >= 2 ? '持有 R2' : ''}
                  </small>
                </div>
              </div>

              {/* 箭头连接线与状态 */}
              <div className="rag-links-container">
                {evoStage >= 1 && (
                  <div className="rag-link alloc alloc-r1-p1">
                    <span className="link-tag">分配: R1 ──▶ P1</span>
                  </div>
                )}
                {evoStage >= 2 && (
                  <div className="rag-link req req-p1-r2">
                    <span className="link-tag req-tag">申请: P1 ┄┄▶ R2 (被 P2 占用阻塞)</span>
                  </div>
                )}
                {evoStage >= 1 && (
                  <div className="rag-link alloc alloc-r2-p2">
                    <span className="link-tag">分配: R2 ──▶ P2</span>
                  </div>
                )}
                {evoStage === 3 && (
                  <div className="rag-link req req-p2-r1 deadly-close">
                    <span className="link-tag req-tag deadly">💥 申请: P2 ┄┄▶ R1 (被 P1 占用阻塞)</span>
                  </div>
                )}
              </div>

              <div className="rag-row rag-resources">
                <div className={`rag-node r-node r1 ${evoStage >= 1 ? 'owned' : ''}`}>
                  <span className="res-icon">🖨️</span>
                  <span className="node-id">R1 (打印机)</span>
                  <small className="res-owner-tag">{evoStage >= 1 ? 'P1 正在占用' : '空闲'}</small>
                </div>

                <div className="rag-row-center-note">
                  {evoStage === 3 ? (
                    <div className="cycle-loop-warning">
                      <strong>🔄 闭环拓扑闭合：</strong>
                      <code>P1 ➔ 等待 R2 ➔ 持有者 P2 ➔ 等待 R1 ➔ 持有者 P1</code>
                    </div>
                  ) : (
                    <span className="open-path-text">路径尚未闭合</span>
                  )}
                </div>

                <div className={`rag-node r-node r2 ${evoStage >= 1 ? 'owned' : ''}`}>
                  <span className="res-icon">📷</span>
                  <span className="node-id">R2 (扫描仪)</span>
                  <small className="res-owner-tag">{evoStage >= 1 ? 'P2 正在占用' : '空闲'}</small>
                </div>
              </div>
            </div>

            <div className="evolution-explain-box">
              {evoStage === 0 && (
                <p><strong>阶段 1</strong>：系统启动，P1 申请 R1，P2 申请 R2，资源充裕无冲突。</p>
              )}
              {evoStage === 1 && (
                <p><strong>阶段 2</strong>：P1 成功持有 R1，P2 成功持有 R2。此时系统处于<strong>完全安全状态</strong>。</p>
              )}
              {evoStage === 2 && (
                <p><strong>阶段 3</strong>：P1 在工作途中向系统申请 R2。但 R2 正在被 P2 使用，P1 进入<strong>挂起阻塞</strong>。注意：此时<strong>并没有死锁</strong>，只要 P2 结束并归还 R2，P1 就能被唤醒！</p>
              )}
              {evoStage === 3 && (
                <p className="danger-text">
                  <strong>阶段 4 (死锁彻底爆发)</strong>：戏剧性的一幕发生了——P2 也需要 R1 才能继续！P2 发起申请，同样被挂起阻塞。
                  <strong>P1 在等 P2 放手，P2 在等 P1 放手</strong>。等待关系形成了死闭环，没有人能迈出下一步，系统永久僵死！
                </p>
              )}
            </div>
          </div>
        </div>
      );

    case 5:
      return (
        <div className="dl-sc dl-sc-break">
          <div className="dl-sc-header">
            <span className="dl-tag success">死锁解除与破除 · 手术刀方案</span>
            <strong>破坏等待闭环 · 恢复系统并发流动</strong>
          </div>
          <div className="break-solutions-grid">
            <div className="solution-card">
              <span className="sol-badge">方案 A · 预防策略</span>
              <h4>资源有序分配法 (Order Allocation)</h4>
              <p>给系统所有资源编号（R1=1, R2=2）。所有进程必须<strong>严格按照编号递增顺序申请</strong>。永远不允许先拿高号再申请低号，在数学上彻底斩断反向环路形成的可能！</p>
              <div className="sol-tag good">工程首选 · 零运行时开销</div>
            </div>

            <div className="solution-card">
              <span className="sol-badge">方案 B · 避免策略</span>
              <h4>银行家算法预演 (Banker's Algorithm)</h4>
              <p>在每次分配资源之前，试探性预演分配：如果分配后系统能找到一个<strong>安全序列</strong>让所有人依次完成，才真正分配；否则拒绝分配让其等待。</p>
              <div className="sol-tag safe">动态安全把控 · 无死锁风险</div>
            </div>

            <div className="solution-card">
              <span className="sol-badge">方案 C · 恢复策略</span>
              <h4>强制剥夺或终止死锁进程</h4>
              <p>当系统检测到死锁环时，强行终止环中的一个进程（如代价最小的 P1），没收它持有的全部资源分给其他被阻碍的进程，等待环瞬间瓦解！</p>
              <div className="sol-tag warn">事后止损 · 会丢失部分计算</div>
            </div>
          </div>

          <div className="dl-footer-tip success">
            💡 <strong>破环核心结论</strong>：死锁是一条脆弱的链条。只要破坏“互斥、占有等待、不可剥夺、循环等待”中任意一环，死锁环便不攻自破！
          </div>
        </div>
      );

    case 6:
      return (
        <div className="dl-sc dl-sc-safe">
          <div className="dl-sc-header">
            <span className="dl-tag summary">核心认知辨析</span>
            <strong>有进程等待 ≠ 发生死锁 · 安全状态与安全序列</strong>
          </div>
          <div className="safe-sequence-stage">
            <div className="safe-seq-pipeline">
              <div className="seq-step-card step-p1">
                <div className="step-num">Step 1</div>
                <strong>P1 优先获得资源</strong>
                <p>现有可用资源能满足 P1，P1 顺利运行完毕并归还 <strong>R1 + R2</strong>！</p>
              </div>
              <div className="seq-arrow">➔ 资源归还池扩充 ➔</div>
              <div className="seq-step-card step-p2">
                <div className="step-num">Step 2</div>
                <strong>P2 获得归还的资源</strong>
                <p>得到充足资源，P2 从阻塞中唤醒，执行完毕并归还全部资源！</p>
              </div>
              <div className="seq-arrow">➔</div>
              <div className="seq-step-card step-p3">
                <div className="step-num">Step 3</div>
                <strong>P3 最终安全完成</strong>
                <p>所有进程顺利退场，系统 0 死锁！</p>
              </div>
            </div>

            <div className="safe-verdict-card">
              <div className="verdict-title">
                <strong>🎯 安全序列判定：&lt; P1, P2, P3 &gt; 成立！</strong>
                <span>只要存在至少一条可以让所有进程依次执行完毕的次序，当前状态就是绝对安全的！</span>
              </div>
              <p>
                <strong>重要辨析</strong>：死锁状态必定是不安全状态；但处于不安全状态的系统<strong>并不一定会发生死锁</strong>（因为某些进程可能在申请新资源前提前释放了旧资源）。银行家算法的核心就是保证系统永远留在安全状态内！
              </p>
            </div>
          </div>
          <div className="dl-footer-tip">
            💡 <strong>总结提示</strong>：进入下方自由探索面板，自己切换“安全状态”、“资源竞争”与“死锁环”预设，亲手构造一个死锁环并打破它！
          </div>
        </div>
      );

    default:
      return null;
  }
}

function deadlockStoryText(i) {
  return [
    '临界区一次只允许一个进程进入，信号量或互斥锁负责协调访问，这是死锁能够发生的前提（互斥条件）。',
    '进程申请并持有了部分资源，在未完成任务前不释放，同时又向系统申请其他资源，导致依赖扩散。',
    '已被占有的资源在持有者主动释放前，系统不可强行剥夺，这使得任何外部力量无法轻易打破僵局。',
    '互斥、占有并等待、不可剥夺和循环等待四个条件必须同时成立，系统才会爆发灾难级死锁。',
    '双向或多向依赖最终形成闭环：P1 在等 P2 的资源，P2 在等 P1 的资源。全员互相等待，时间在此冻结！',
    '破坏互斥、破坏占有等待、允许剥夺或规定统一申请顺序（资源有序分配法），都可以优雅预防死锁。',
    '存在等待和阻塞不等于死锁；只要能找到一条安全执行序列让进程依次完成，系统就依然处于安全状态。'
  ][i];
}
