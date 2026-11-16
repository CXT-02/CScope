import React, { useEffect, useMemo, useState } from 'react'
import { ExperimentHeader } from './AttentionExperiment'
import LearningCycle from './LearningCycle'

const DEFAULT_VALUES = [7, 3, 9, 2, 8, 4, 6, 1]
const ALGORITHMS = [
  { id: 'bubble', name: '冒泡排序', idea: '相邻比较，大值逐轮浮到右侧', build: bubbleSteps },
  { id: 'selection', name: '选择排序', idea: '每轮寻找最小值放到左侧', build: selectionSteps },
  { id: 'insertion', name: '插入排序', idea: '把新元素插入左侧有序区', build: insertionSteps },
  { id: 'quick', name: '快速排序', idea: '按基准划分，再递归处理两侧', build: quickSteps },
]
const SORT_CODE = {
  bubble: {
    Python:[['loop','def bubble_sort(a):'],['loop','    for end in range(len(a) - 1, 0, -1):'],['loop','        changed = False'],['compare','        for i in range(end):'],['compare','            if a[i] > a[i + 1]:'],['swap','                a[i], a[i + 1] = a[i + 1], a[i]'],['swap','                changed = True'],['done','        if not changed: break'],['done','    return a']],
    Java:[['loop','static void bubbleSort(int[] a) {'],['loop','    for (int end = a.length - 1; end > 0; end--) {'],['loop','        boolean changed = false;'],['compare','        for (int i = 0; i < end; i++) {'],['compare','            if (a[i] > a[i + 1]) {'],['swap','                int temp = a[i]; a[i] = a[i + 1]; a[i + 1] = temp;'],['swap','                changed = true;'],['compare','            }'],['compare','        }'],['done','        if (!changed) break;'],['loop','    }'],['done','}']],
    'C++':[['loop','void bubbleSort(vector<int>& a) {'],['loop','    for (int end = a.size() - 1; end > 0; --end) {'],['loop','        bool changed = false;'],['compare','        for (int i = 0; i < end; ++i) {'],['compare','            if (a[i] > a[i + 1]) {'],['swap','                swap(a[i], a[i + 1]);'],['swap','                changed = true;'],['compare','            }'],['compare','        }'],['done','        if (!changed) break;'],['loop','    }'],['done','}']],
  },
  selection: {
    Python:[['loop','def selection_sort(a):'],['loop','    for i in range(len(a) - 1):'],['compare','        min_index = i'],['compare','        for j in range(i + 1, len(a)):'],['compare','            if a[j] < a[min_index]: min_index = j'],['swap','        a[i], a[min_index] = a[min_index], a[i]'],['done','    return a']],
    Java:[['loop','static void selectionSort(int[] a) {'],['loop','    for (int i = 0; i < a.length - 1; i++) {'],['compare','        int minIndex = i;'],['compare','        for (int j = i + 1; j < a.length; j++)'],['compare','            if (a[j] < a[minIndex]) minIndex = j;'],['swap','        int temp = a[i]; a[i] = a[minIndex]; a[minIndex] = temp;'],['loop','    }'],['done','}']],
    'C++':[['loop','void selectionSort(vector<int>& a) {'],['loop','    for (int i = 0; i + 1 < a.size(); ++i) {'],['compare','        int minIndex = i;'],['compare','        for (int j = i + 1; j < a.size(); ++j)'],['compare','            if (a[j] < a[minIndex]) minIndex = j;'],['swap','        swap(a[i], a[minIndex]);'],['loop','    }'],['done','}']],
  },
  insertion: {
    Python:[['loop','def insertion_sort(a):'],['loop','    for i in range(1, len(a)):'],['insert','        key, j = a[i], i - 1'],['compare','        while j >= 0 and a[j] > key:'],['shift','            a[j + 1] = a[j]'],['shift','            j -= 1'],['insert','        a[j + 1] = key'],['done','    return a']],
    Java:[['loop','static void insertionSort(int[] a) {'],['loop','    for (int i = 1; i < a.length; i++) {'],['insert','        int key = a[i], j = i - 1;'],['compare','        while (j >= 0 && a[j] > key) {'],['shift','            a[j + 1] = a[j];'],['shift','            j--;'],['compare','        }'],['insert','        a[j + 1] = key;'],['loop','    }'],['done','}']],
    'C++':[['loop','void insertionSort(vector<int>& a) {'],['loop','    for (int i = 1; i < a.size(); ++i) {'],['insert','        int key = a[i], j = i - 1;'],['compare','        while (j >= 0 && a[j] > key) {'],['shift','            a[j + 1] = a[j];'],['shift','            --j;'],['compare','        }'],['insert','        a[j + 1] = key;'],['loop','    }'],['done','}']],
  },
  quick: {
    Python:[['loop','def quick_sort(a, low, high):'],['done','    if low >= high: return'],['pivot','    pivot, i = a[high], low'],['compare','    for j in range(low, high):'],['compare','        if a[j] <= pivot:'],['swap','            a[i], a[j] = a[j], a[i]; i += 1'],['pivot','    a[i], a[high] = a[high], a[i]'],['loop','    quick_sort(a, low, i - 1)'],['loop','    quick_sort(a, i + 1, high)']],
    Java:[['loop','static void quickSort(int[] a, int low, int high) {'],['done','    if (low >= high) return;'],['pivot','    int pivot = a[high], i = low;'],['compare','    for (int j = low; j < high; j++) {'],['compare','        if (a[j] <= pivot) {'],['swap','            int t = a[i]; a[i++] = a[j]; a[j] = t;'],['compare','        }'],['compare','    }'],['pivot','    int t = a[i]; a[i] = a[high]; a[high] = t;'],['loop','    quickSort(a, low, i - 1);'],['loop','    quickSort(a, i + 1, high);'],['done','}']],
    'C++':[['loop','void quickSort(vector<int>& a, int low, int high) {'],['done','    if (low >= high) return;'],['pivot','    int pivot = a[high], i = low;'],['compare','    for (int j = low; j < high; ++j)'],['compare','        if (a[j] <= pivot) swap(a[i++], a[j]);'],['pivot','    swap(a[i], a[high]);'],['loop','    quickSort(a, low, i - 1);'],['loop','    quickSort(a, i + 1, high);'],['done','}']],
  },
}
const SORT_COMPLEXITY={bubble:['O(n)','O(n²)','O(n²)','O(1)','稳定'],selection:['O(n²)','O(n²)','O(n²)','O(1)','不稳定'],insertion:['O(n)','O(n²)','O(n²)','O(1)','稳定'],quick:['O(n log n)','O(n log n)','O(n²)','O(log n)','不稳定']}
const STORY = [
  { short: '目标', title: '同样是从小到大，算法走的路完全不同', eyebrow: '01 · 建立问题', why: '只有把过程并排观察，才能理解复杂度差异从哪里产生。' },
  { short: '冒泡', title: '冒泡排序：只比较相邻元素', eyebrow: '02 · 相邻交换', why: '规则简单且稳定，但逆序较多时要反复扫描，平均需要平方级比较。' },
  { short: '选择', title: '选择排序：每轮找出剩余最小值', eyebrow: '03 · 直接选择', why: '它减少了交换次数，但无论数据是否接近有序，都要继续寻找最小值。' },
  { short: '插入', title: '插入排序：维护一个逐渐扩大的有序区', eyebrow: '04 · 局部插入', why: '当输入本来接近有序时，需要移动的元素很少，表现会明显改善。' },
  { short: '快排', title: '快速排序：一次划分解决一批位置关系', eyebrow: '05 · 分治划分', why: '良好划分能把大问题拆成规模接近的小问题，平均复杂度为 O(n log n)。' },
  { short: '指标', title: '比较次数与移动次数揭示真实代价', eyebrow: '06 · 量化过程', why: '运行时间会受设备影响，而关键操作次数更能反映算法结构。' },
  { short: '选择', title: '没有永远最好的排序，要结合数据特征选择', eyebrow: '07 · 形成判断', why: '数据规模、初始顺序、稳定性和额外空间都会影响最终选择。' },
]

export default function SortingExperiment({ experiment }) {
  const [values, setValues] = useState(DEFAULT_VALUES)
  const [text, setText] = useState(DEFAULT_VALUES.join(', '))
  const runs = useMemo(() => ALGORITHMS.map((algorithm) => ({ ...algorithm, steps: algorithm.build(values) })), [values])
  const maxSteps = Math.max(...runs.map((run) => run.steps.length))
  const [progress, setProgress] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [focusAlgorithm, setFocusAlgorithm] = useState('bubble')
  const [singleStep, setSingleStep] = useState(0)
  const [singlePlaying, setSinglePlaying] = useState(false)

  useEffect(() => { setProgress(0); setPlaying(false) }, [values])
  useEffect(() => {
    if (!playing) return undefined
    const timer = window.setInterval(() => setProgress((current) => {
      if (current >= maxSteps - 1) { setPlaying(false); return current }
      return current + 1
    }), 850 / speed)
    return () => window.clearInterval(timer)
  }, [playing, speed, maxSteps])
  const singleRun = runs.find((run) => run.id === focusAlgorithm)
  const singleState = singleRun.steps[Math.min(singleStep, singleRun.steps.length - 1)]
  useEffect(() => { setSingleStep(0); setSinglePlaying(false) }, [values, focusAlgorithm])
  useEffect(() => { if (!singlePlaying) return undefined; const timer = window.setInterval(() => setSingleStep((value) => { if (value >= singleRun.steps.length - 1) { setSinglePlaying(false); return value } return value + 1 }), 850 / speed); return () => window.clearInterval(timer) }, [singlePlaying, singleRun.steps.length, speed])

  function applyInput() {
    const parsed = text.split(/[，,\s]+/).map(Number).filter((value) => Number.isFinite(value)).slice(0, 10)
    if (parsed.length >= 3) { setValues(parsed); setText(parsed.join(', ')) }
  }
  function preset(next) { setValues(next); setText(next.join(', ')) }
  const states = runs.map((run) => run.steps[Math.min(run.steps.length - 1, Math.round(progress / Math.max(1, maxSteps - 1) * (run.steps.length - 1)))])
  const finished = progress === maxSteps - 1

  return <>
    <ExperimentHeader experiment={experiment} eyebrow="算法实验 03" />
    <SortingStory values={values} />
    <div className="explore-heading"><span>自由探索 · 同一份数据，同时起跑</span><h2>让四种排序算法并排运行</h2><p>改变初始顺序，观察高亮元素、已确定区域、比较次数和移动次数如何变化。</p></div>
    <div className="sort-control-bar">
      <label><span>输入 3～10 个数字</span><input value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') applyInput() }} /><button type="button" onClick={applyInput}>应用</button></label>
      <div><button type="button" onClick={() => preset([1,2,3,5,4,6,7,8])}>近乎有序</button><button type="button" onClick={() => preset([8,7,6,5,4,3,2,1])}>完全逆序</button><button type="button" onClick={() => preset(Array.from({ length: 8 }, () => Math.floor(Math.random() * 9) + 1))}>随机一组</button></div>
    </div>
    <section className="sort-practice"><div className="practice-heading"><div><span className="eyebrow">自己动手 · 单算法逐步演示</span><h2>一次只看懂一种排序</h2><p>先选择算法，再使用上一步、下一步或自动播放。数组状态、操作说明、统计指标和经典代码会保持同步。</p></div><span className="practice-progress">{singleStep} / {singleRun.steps.length - 1}</span></div><div className="algorithm-tabs">{ALGORITHMS.map((algorithm)=><button className={focusAlgorithm===algorithm.id?'active':''} type="button" key={algorithm.id} onClick={()=>setFocusAlgorithm(algorithm.id)}><strong>{algorithm.name}</strong><span>{algorithm.idea}</span></button>)}</div><div className="single-sort-layout"><div className="single-sort-visual"><SortPanel algorithm={singleRun} state={singleState}/><input className="sort-progress" type="range" min="0" max={singleRun.steps.length-1} value={singleStep} onChange={(event)=>{setSingleStep(Number(event.target.value));setSinglePlaying(false)}}/><div className="single-sort-controls"><button disabled={!singleStep} onClick={()=>setSingleStep((value)=>value-1)}>← 上一步</button><button className="sort-play" onClick={()=>{if(singleStep===singleRun.steps.length-1)setSingleStep(0);setSinglePlaying((value)=>!value)}}>{singlePlaying?'暂停':'▶ 自动播放'}</button><button disabled={singleStep===singleRun.steps.length-1} onClick={()=>setSingleStep((value)=>value+1)}>下一步 →</button></div><div className="single-step-explanation"><span>当前操作：{singleState.phase}</span><strong>{singleState.message}</strong><p>当前进行了 {singleState.comparisons} 次比较、{singleState.moves} 次数据移动。绿色位置已经确定，橙色位置正在参与本步操作。</p></div></div><SortCode algorithm={focusAlgorithm} phase={singleState.phase}/></div></section>
    <section className="sorting-lab">
      <div className="sorting-toolbar"><div><strong>同步进度 {progress} / {maxSteps - 1}</strong><span>各算法按自身总步骤比例同步播放</span></div><div><button type="button" disabled={progress === 0} onClick={() => setProgress((value) => value - 1)}>←</button><button className="sort-play" type="button" onClick={() => { if (finished) setProgress(0); setPlaying((value) => !value) }}>{playing ? '暂停' : finished ? '重新播放' : '▶ 播放'}</button><button type="button" disabled={finished} onClick={() => setProgress((value) => value + 1)}>→</button><select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}><option value={.75}>0.75×</option><option value={1}>1×</option><option value={1.5}>1.5×</option><option value={2}>2×</option></select></div></div>
      <input className="sort-progress" type="range" min="0" max={maxSteps - 1} value={progress} onChange={(event) => { setProgress(Number(event.target.value)); setPlaying(false) }} />
      <div className="sort-grid">{runs.map((run, index) => <SortPanel key={run.id} algorithm={run} state={states[index]} />)}</div>
      <div className="sort-summary"><strong>此刻怎么比较？</strong><p>{summaryText(states, finished)}</p></div>
    </section>
    <LearningCycle experimentId="sorting" prediction={{ question: '当数据已经接近有序时，哪种算法通常最容易减少操作？', options: ['插入排序', '选择排序', '所有算法完全相同'], answer: '插入排序', explanation: ' 插入排序只需移动少量位置不正确的元素，接近有序时可接近线性表现。' }} operation={{ title: '比较近乎有序与完全逆序', instruction: '分别加载两个预设并播放到结束，记录冒泡、选择和插入排序的比较与移动次数。' }} observation={finished ? `本轮已完成。${states.map((state, index) => `${ALGORITHMS[index].name}：${state.comparisons} 次比较、${state.moves} 次移动`).join('；')}。` : '先把动画播放到结束，再对照四种算法的最终指标。'} summaryPrompt="为什么同一种排序算法面对不同初始顺序时，操作次数可能不同？" />
  </>
}

function SortPanel({ algorithm, state }) {
  const max = Math.max(...state.array, 1)
  return <article className={`sort-panel ${state.done ? 'done' : ''}`}><header><div><span>{algorithm.idea}</span><h3>{algorithm.name}</h3></div><i>{state.done ? '已完成' : state.phase}</i></header><div className="sort-bars">{state.array.map((value, index) => <div key={`${index}-${value}`} className={`${state.active.includes(index) ? 'active' : ''} ${state.sorted.includes(index) ? 'sorted' : ''} ${index === state.pivot ? 'pivot' : ''}`}><span>{value}</span><i style={{ height: `${22 + value / max * 75}%` }} /></div>)}</div><p>{state.message}</p><footer><span>比较 <b>{state.comparisons}</b></span><span>移动 <b>{state.moves}</b></span></footer></article>
}

function SortingStory({ values }) {
  const [step, setStep] = useState(0); const [playing, setPlaying] = useState(false); const [speed, setSpeed] = useState(1)
  useEffect(() => { if (!playing) return undefined; const timer = window.setTimeout(() => setStep((current) => { if (current === STORY.length - 1) { setPlaying(false); return current } return current + 1 }), 2700 / speed); return () => window.clearTimeout(timer) }, [playing, speed, step])
  function choose(value) { setStep(value); setPlaying(false) }
  return <section className="transformer-story sort-story"><header className="story-intro"><div><span className="story-kicker">动画导学 · 约 3 分钟</span><h2>四条不同路线，抵达同一个有序终点</h2><p>不要只记代码。先抓住每种算法在每一轮“确定什么”的核心策略。</p></div><div className="sort-story-array"><span>当前序列</span><div>{values.map((value, index) => <i key={index}>{value}</i>)}</div><small>目标：从小到大排列</small></div></header><nav className="story-timeline" style={{ '--story-steps': STORY.length }}>{STORY.map((item, index) => <button type="button" key={item.short} className={`${step === index ? 'active' : ''} ${index < step ? 'passed' : ''}`} onClick={() => choose(index)}><i>{index < step ? '✓' : index + 1}</i><span>{item.short}</span></button>)}</nav><div className="story-stage" key={step}><div className="story-copy"><span>{STORY[step].eyebrow}</span><h3>{STORY[step].title}</h3><p>{storyText(step)}</p><aside><strong>为什么需要这样做？</strong><p>{STORY[step].why}</p></aside></div><div className="story-visual"><SortStoryVisual step={step} values={values} /></div></div><footer className="story-controls"><button type="button" disabled={step === 0} onClick={() => choose(step - 1)}>← 上一步</button><button className="story-play" type="button" onClick={() => { if (step === STORY.length - 1) setStep(0); setPlaying((value) => !value) }}>{playing ? '暂停讲解' : step === STORY.length - 1 ? '重新播放' : '▶ 自动播放'}</button><button type="button" disabled={step === STORY.length - 1} onClick={() => choose(step + 1)}>下一步 →</button><label>速度<select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}><option value={.75}>0.75×</option><option value={1}>1×</option><option value={1.5}>1.5×</option></select></label></footer></section>
}

function SortStoryVisual({ step, values }) {
  const modes = [null, 'bubble', 'selection', 'insertion', 'quick']; const mode = modes[step]
  const run = mode ? ALGORITHMS.find((item) => item.id === mode) : null
  const demoSteps = useMemo(() => run ? run.build(values) : [], [run, values])
  const [frame, setFrame] = useState(0)
  useEffect(() => { setFrame(0); if (!demoSteps.length) return undefined; const timer = window.setInterval(() => setFrame((value) => value >= demoSteps.length - 1 ? 0 : value + 1), 620); return () => window.clearInterval(timer) }, [mode, demoSteps.length])
  if (step === 0 || step === 6) return <div className="sort-route-map">{ALGORITHMS.map((item, index) => <div key={item.id}><i>{index + 1}</i><strong>{item.name}</strong><span>{item.idea}</span></div>)}</div>
  if (mode) { const sample = demoSteps[frame]; return <div className="sort-story-demo"><strong>{run.name}</strong><div>{sample.array.map((value, index) => <i className={`${sample.active.includes(index) ? 'active' : ''} ${sample.sorted.includes(index) ? 'sorted' : ''} ${sample.pivot === index ? 'pivot' : ''}`} key={index}>{value}</i>)}</div><p>{sample.message}</p><small>动画步骤 {frame} / {demoSteps.length-1}</small></div> }
  return <div className="sort-metric-stage"><div><span>比较次数</span><strong>谁和谁比过？</strong></div><div><span>移动次数</span><strong>数据被写动几次？</strong></div><div><span>额外空间</span><strong>是否需要新数组？</strong></div><div><span>稳定性</span><strong>相等元素顺序是否保留？</strong></div></div>
}

function SortCode({algorithm,phase}){const[language,setLanguage]=useState('Python');const lines=SORT_CODE[algorithm][language];const active=codeKeyFor(algorithm,phase);const complexity=SORT_COMPLEXITY[algorithm];return <div className="sort-code formal-code"><header><div><span>正式代码 · {ALGORITHMS.find((item)=>item.id===algorithm).name}</span><strong>高亮语句与左侧数组操作同步</strong></div><nav>{Object.keys(SORT_CODE[algorithm]).map((item)=><button type="button" className={language===item?'active':''} onClick={()=>setLanguage(item)} key={item}>{item}</button>)}</nav></header><pre>{lines.map(([key,line],index)=><code className={active===key?'active':''} key={`${language}-${index}`}><b>{String(index+1).padStart(2,'0')}</b>{line}</code>)}</pre><div className="complexity-grid compact"><span><small>最好</small><strong>{complexity[0]}</strong></span><span><small>平均</small><strong>{complexity[1]}</strong></span><span><small>最坏</small><strong>{complexity[2]}</strong></span><span><small>额外空间</small><strong>{complexity[3]}</strong></span><span><small>稳定性</small><strong>{complexity[4]}</strong></span></div><footer><strong>怎么看动画和代码？</strong><p>橙色元素对应当前高亮语句正在比较或移动的数据；绿色区域表示该位置已经确定。</p></footer></div>}
function codeKeyFor(algorithm,phase){const maps={bubble:{相邻比较:'compare',交换:'swap',完成:'done'},selection:{寻找最小:'compare',放置:'swap',完成:'done'},insertion:{寻找插入点:'compare',插入:'insert',完成:'done'},quick:{划分:'compare',基准就位:'pivot',完成:'done'}};return maps[algorithm]?.[phase]??'loop'}

function makeStep(array, message, active = [], sorted = [], comparisons = 0, moves = 0, phase = '运行中', pivot = -1, done = false) { return { array: [...array], message, active, sorted: [...sorted], comparisons, moves, phase, pivot, done } }
function bubbleSteps(input) { const a=[...input],s=[makeStep(a,'从左到右比较相邻元素。')];let c=0,m=0;for(let end=a.length-1;end>0;end--){let changed=false;for(let i=0;i<end;i++){c++;s.push(makeStep(a,`比较 ${a[i]} 和 ${a[i+1]}`, [i,i+1], range(end+1,a.length),c,m,'相邻比较'));if(a[i]>a[i+1]){[a[i],a[i+1]]=[a[i+1],a[i]];m+=2;changed=true;s.push(makeStep(a,'左边更大，交换相邻元素。',[i,i+1],range(end+1,a.length),c,m,'交换'))}}if(!changed)break}s.push(makeStep(a,'全部元素已经有序。',[],range(0,a.length),c,m,'完成',-1,true));return s}
function selectionSteps(input) { const a=[...input],s=[makeStep(a,'每轮从未排序区寻找最小值。')];let c=0,m=0;for(let i=0;i<a.length-1;i++){let min=i;for(let j=i+1;j<a.length;j++){c++;if(a[j]<a[min])min=j;s.push(makeStep(a,`扫描未排序区，当前最小值是 ${a[min]}。`,[min,j],range(0,i),c,m,'寻找最小'))}if(min!==i){[a[i],a[min]]=[a[min],a[i]];m+=2;s.push(makeStep(a,`把最小值放到位置 ${i+1}。`,[i,min],range(0,i+1),c,m,'放置'))}}s.push(makeStep(a,'全部元素已经有序。',[],range(0,a.length),c,m,'完成',-1,true));return s}
function insertionSteps(input) { const a=[...input],s=[makeStep(a,'把第一个元素视为有序区。',[],[0])];let c=0,m=0;for(let i=1;i<a.length;i++){const key=a[i];let j=i-1;while(j>=0){c++;s.push(makeStep(a,`把 ${key} 与左侧 ${a[j]} 比较。`,[j,j+1],range(0,i),c,m,'寻找插入点'));if(a[j]<=key)break;a[j+1]=a[j];m++;j--}a[j+1]=key;m++;s.push(makeStep(a,`将 ${key} 插入左侧有序区。`,[j+1],range(0,i+1),c,m,'插入'))}s.push(makeStep(a,'全部元素已经有序。',[],range(0,a.length),c,m,'完成',-1,true));return s}
function quickSteps(input) { const a=[...input],s=[makeStep(a,'选择基准值并划分左右区域。')];let c=0,m=0;const sorted=new Set();function sort(lo,hi){if(lo>hi)return;if(lo===hi){sorted.add(lo);return}const pivot=a[hi];let i=lo;for(let j=lo;j<hi;j++){c++;s.push(makeStep(a,`将 ${a[j]} 与基准 ${pivot} 比较。`,[j,hi],sorted,c,m,'划分',hi));if(a[j]<=pivot){[a[i],a[j]]=[a[j],a[i]];if(i!==j)m+=2;i++}}[a[i],a[hi]]=[a[hi],a[i]];if(i!==hi)m+=2;sorted.add(i);s.push(makeStep(a,`基准 ${pivot} 已到达最终位置。`,[i],sorted,c,m,'基准就位',i));sort(lo,i-1);sort(i+1,hi)}sort(0,a.length-1);range(0,a.length).forEach((i)=>sorted.add(i));s.push(makeStep(a,'全部元素已经有序。',[],sorted,c,m,'完成',-1,true));return s}
function range(start,end){return Array.from({length:Math.max(0,end-start)},(_,i)=>start+i)}
function storyText(step){return ['四种算法最终得到相同顺序，但它们每一步确定的位置、比较对象和数据移动方式不同。','每轮从左到右比较相邻元素并交换逆序对，轮末最大的未排序元素到达右端。','每轮扫描未排序区域，找出最小元素，只在轮末执行一次放置。','左侧始终保持有序，新元素从右向左寻找位置并移动挡路元素。','选择一个基准，小值放左、大值放右，再分别处理左右子问题。','用相同数据记录关键操作，才能公平比较算法，而不只是看动画谁先结束。','小规模或近乎有序可考虑插入排序；通用内存排序通常更偏向高效的分治方法。'][step]}
function summaryText(states, finished){if(!finished)return '当前高亮表示正在比较或移动的元素；绿色表示已经确定的位置。播放到结束后，再比较最终操作次数。';const best=[...states].sort((a,b)=>(a.comparisons+a.moves)-(b.comparisons+b.moves))[0];return `在这组输入上，关键操作总数最少的是 ${ALGORITHMS[states.indexOf(best)].name}。这只是当前数据的结果，不代表它在所有场景都最好。`}
