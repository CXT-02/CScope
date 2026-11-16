import React, { useEffect, useMemo, useState } from 'react'
import { ExperimentHeader } from './AttentionExperiment'
import LearningCycle from './LearningCycle'
import TheoryPrimer from './TheoryPrimer'

const nodes = [
  { id: 'A', x: 90, y: 190 }, { id: 'B', x: 230, y: 80 }, { id: 'C', x: 240, y: 285 },
  { id: 'D', x: 410, y: 100 }, { id: 'E', x: 430, y: 270 }, { id: 'F', x: 590, y: 185 },
]
const edges = [
  ['A', 'B', 4], ['A', 'C', 2], ['B', 'C', 1], ['B', 'D', 5],
  ['C', 'D', 8], ['C', 'E', 10], ['D', 'E', 2], ['D', 'F', 6], ['E', 'F', 3],
]

function buildSteps(start) {
  const distances = Object.fromEntries(nodes.map((node) => [node.id, Infinity]))
  const previous = {}
  const visited = new Set()
  const steps = []
  distances[start] = 0
  steps.push({ current: null, distances: { ...distances }, visited: [], previous: {}, message: `初始化：起点 ${start} 的距离设为 0，其余节点设为 ∞。`, phase: '初始化距离表', line: 2, activeEdge: null })
  while (visited.size < nodes.length) {
    const current = nodes.map((node) => node.id).filter((id) => !visited.has(id)).sort((a, b) => distances[a] - distances[b])[0]
    if (!current || distances[current] === Infinity) break
    steps.push({ current, distances: { ...distances }, visited: [...visited], previous: { ...previous }, message: `在所有未确定节点中，${current} 的候选距离 ${distances[current]} 最小，选择它。`, phase: '选择最小节点', line: 4, activeEdge: null })
    visited.add(current)
    steps.push({ current, distances: { ...distances }, visited: [...visited], previous: { ...previous }, message: `节点 ${current} 正式确定；非负边权保证它以后不可能再被更短路线改写。`, phase: '确定最短距离', line: 5, activeEdge: null })
    edges.forEach(([a, b, weight]) => {
      const neighbor = a === current ? b : b === current ? a : null
      if (!neighbor || visited.has(neighbor)) return
      const candidate = distances[current] + weight
      const oldDistance = distances[neighbor]
      steps.push({ current, distances: { ...distances }, visited: [...visited], previous: { ...previous }, message: `尝试经过 ${current} 到达 ${neighbor}：${distances[current]} + ${weight} = ${candidate}，与旧距离 ${oldDistance === Infinity ? '∞' : oldDistance} 比较。`, phase: '松弛相邻边', line: 7, activeEdge: [current, neighbor].sort().join('-') })
      if (candidate < distances[neighbor]) {
        distances[neighbor] = candidate
        previous[neighbor] = current
        steps.push({ current, distances: { ...distances }, visited: [...visited], previous: { ...previous }, message: `新路线更短：把 ${neighbor} 的距离更新为 ${candidate}，前驱改为 ${current}。`, phase: '更新距离与前驱', line: 8, activeEdge: [current, neighbor].sort().join('-') })
      }
    })
  }
  steps.push({ current: null, distances: { ...distances }, visited: [...visited], previous: { ...previous }, message: '所有可达节点都已确定，前驱关系组成从起点出发的最短路径树。', phase: '算法完成', line: 10, activeEdge: null })
  return steps
}

export default function DijkstraExperiment({ experiment }) {
  const [start, setStart] = useState('A')
  const [stepIndex, setStepIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const steps = useMemo(() => buildSteps(start), [start])
  const step = steps[Math.min(stepIndex, steps.length - 1)]
  const pathEdges = new Set(Object.entries(step.previous).map(([to, from]) => [from, to].sort().join('-')))

  useEffect(() => { if (!playing) return undefined; const timer = window.setInterval(() => setStepIndex((value) => { if (value >= steps.length - 1) { setPlaying(false); return value } return value + 1 }), 900 / speed); return () => window.clearInterval(timer) }, [playing, speed, steps.length])

  function changeStart(event) {
    setStart(event.target.value)
    setStepIndex(0)
    setPlaying(false)
  }

  return (
    <>
      <ExperimentHeader experiment={experiment} eyebrow="算法实验 02" />
      <DijkstraStory />
      <TheoryPrimer
        title="Dijkstra 为什么能找到最短路径？"
        intro="它维护一张“从起点到每个节点目前最短要走多远”的距离表。每一步选择候选距离最小的未确定节点，再尝试通过它缩短邻居的距离，这个过程叫作松弛。"
        formula="候选距离 = 到当前节点的距离 + 当前边的权重"
        concepts={[
          { term: '候选距离', description: '目前已经发现的最好路线长度，但在节点被确定前仍可能继续变小。' },
          { term: '确定节点', description: '未确定节点中距离最小者；在边权非负时，它的最短距离以后不会再改变。' },
          { term: '松弛操作', description: '比较旧距离和“绕过当前节点”的新距离，若新路线更短就更新。' },
        ]}
        goal="逐步运行时，先预测下一个被确定的节点，再观察距离表如何更新；更换起点后比较确定顺序是否改变。"
      />
      <div className="lab-layout">
        <aside className="control-panel">
          <div className="panel-title"><span>运行控制</span><i>{playing ? '动画播放中' : '逐步模式'}</i></div>
          <label className="field-block"><span>起点</span><small>算法从这里开始，起点到自身距离为 0，其他节点初始为 ∞。</small><select value={start} onChange={changeStart}>{nodes.map((node) => <option key={node.id}>{node.id}</option>)}</select></label>
          <div className="step-counter"><span>当前步骤</span><strong>{stepIndex} / {steps.length - 1}</strong></div>
          <p className="control-help">拖动进度条可快速查看任意一步；使用按钮适合逐步理解每次松弛。</p>
          <input className="step-slider" type="range" min="0" max={steps.length - 1} value={stepIndex} onChange={(event) => setStepIndex(Number(event.target.value))} />
          <div className="step-buttons"><button type="button" disabled={stepIndex === 0} onClick={() => setStepIndex((value) => value - 1)}>← 上一步</button><button type="button" disabled={stepIndex === steps.length - 1} onClick={() => setStepIndex((value) => value + 1)}>下一步 →</button></div>
          <button className="tree-play" type="button" onClick={() => { if (stepIndex === steps.length - 1) setStepIndex(0); setPlaying((value) => !value) }}>{playing ? '暂停动画' : '▶ 自动播放全过程'}</button>
          <label className="field-block dijkstra-speed"><span>动画速度</span><select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}><option value={.75}>0.75×</option><option value={1}>1×</option><option value={1.5}>1.5×</option><option value={2}>2×</option></select></label>
          <div className="explanation-box"><strong>这一步发生了什么？</strong><p>{step.message}</p></div>
          <div className="tip-box"><strong>核心规律</strong><p>每一步都选择尚未确定、且当前距离最小的节点。边权不能为负数。</p></div>
        </aside>
        <section className="visual-panel">
          <div className="visual-toolbar"><div><strong>图的最短路径搜索</strong><span>绿色：已确定 · 橙色：当前节点</span></div><button className="text-button" type="button" onClick={() => setStepIndex(0)}>重新开始</button></div>
          <svg className="graph-canvas" viewBox="0 0 680 380" role="img" aria-label="Dijkstra 最短路径图">
            {edges.map(([a, b, weight]) => {
              const from = nodes.find((node) => node.id === a)
              const to = nodes.find((node) => node.id === b)
              const edgeId = [a, b].sort().join('-'); const selected = pathEdges.has(edgeId); const active = step.activeEdge === edgeId
              return <g key={`${a}-${b}`}><line x1={from.x} y1={from.y} x2={to.x} y2={to.y} className={`${selected ? 'path-edge' : ''} ${active ? 'active-edge' : ''}`} /><text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 8}>{weight}</text></g>
            })}
            {nodes.map((node) => {
              const state = step.current === node.id ? 'current' : step.visited.includes(node.id) ? 'visited' : ''
              return <g key={node.id} className={`graph-node ${state}`} transform={`translate(${node.x},${node.y})`}><circle r="28" /><text y="5">{node.id}</text><text className="distance" y="47">{step.distances[node.id] === Infinity ? '∞' : step.distances[node.id]}</text></g>
            })}
          </svg>
          <div className="distance-table">{nodes.map((node) => <div key={node.id}><span>{node.id}</span><strong>{step.distances[node.id] === Infinity ? '∞' : step.distances[node.id]}</strong></div>)}</div>
          <AlgorithmCode activeLine={step.line} />
        </section>
      </div>
      <LearningCycle
        experimentId="dijkstra"
        prediction={{
          question: 'Dijkstra 下一步应优先选择哪个未确定节点？',
          options: ['边数最少的节点', '当前候选距离最小的节点', '字母顺序最靠前的节点'],
          answer: '当前候选距离最小的节点',
          explanation: ' 贪心选择使这个节点的最短距离可以被正式确定。',
        }}
        operation={{ title: '逐步运行并更换起点', instruction: '先从 A 运行到最后，再把起点改成 C，比较节点确定顺序和距离表。' }}
        observation={`${step.message} 当前已确定 ${step.visited.length}/${nodes.length} 个节点。`}
        summaryPrompt="为什么已经确定的节点以后不需要重新计算？"
      />
    </>
  )
}

const DIJKSTRA_CODE = {
  Python: [
    ['setup','def dijkstra(graph, start):'],['init','    dist = {v: float("inf") for v in graph}'],['init','    prev, visited = {}, set()'],['init','    dist[start] = 0'],['loop','    while len(visited) < len(graph):'],['select','        candidates = (v for v in graph if v not in visited)'],['select','        u = min(candidates, key=dist.get, default=None)'],['select','        if u is None or dist[u] == float("inf"): break'],['visit','        visited.add(u)'],['relax','        for v, weight in graph[u]:'],['update','            if dist[u] + weight < dist[v]:'],['update','                dist[v] = dist[u] + weight'],['update','                prev[v] = u'],['return','    return dist, prev'],
  ],
  Java: [
    ['setup','static Result dijkstra(List<Edge>[] graph, int start) {'],['init','    int n = graph.length;'],['init','    long[] dist = new long[n]; int[] prev = new int[n];'],['init','    boolean[] visited = new boolean[n];'],['init','    Arrays.fill(dist, Long.MAX_VALUE); Arrays.fill(prev, -1);'],['init','    dist[start] = 0;'],['loop','    for (int round = 0; round < n; round++) {'],['select','        int u = -1;'],['select','        for (int v = 0; v < n; v++)'],['select','            if (!visited[v] && (u == -1 || dist[v] < dist[u])) u = v;'],['select','        if (u == -1 || dist[u] == Long.MAX_VALUE) break;'],['visit','        visited[u] = true;'],['relax','        for (Edge edge : graph[u]) {'],['update','            if (!visited[edge.to()] && dist[u] + edge.weight() < dist[edge.to()]) {'],['update','                dist[edge.to()] = dist[u] + edge.weight();'],['update','                prev[edge.to()] = u;'],['update','            }'],['relax','        }'],['loop','    }'],['return','    return new Result(dist, prev);'],['return','}'],
  ],
  'C++': [
    ['setup','pair<vector<long long>, vector<int>> dijkstra(const Graph& graph, int start) {'],['init','    int n = graph.size();'],['init','    vector<long long> dist(n, LLONG_MAX);'],['init','    vector<int> prev(n, -1); vector<bool> visited(n, false);'],['init','    dist[start] = 0;'],['loop','    for (int round = 0; round < n; ++round) {'],['select','        int u = -1;'],['select','        for (int v = 0; v < n; ++v)'],['select','            if (!visited[v] && (u == -1 || dist[v] < dist[u])) u = v;'],['select','        if (u == -1 || dist[u] == LLONG_MAX) break;'],['visit','        visited[u] = true;'],['relax','        for (auto [v, weight] : graph[u]) {'],['update','            if (!visited[v] && dist[u] + weight < dist[v]) {'],['update','                dist[v] = dist[u] + weight;'],['update','                prev[v] = u;'],['update','            }'],['relax','        }'],['loop','    }'],['return','    return {dist, prev};'],['return','}'],
  ],
}
const DIJKSTRA_LINE_KEY={2:'init',4:'select',5:'visit',7:'relax',8:'update',10:'return'}
function AlgorithmCode({ activeLine }) { const[language,setLanguage]=useState('Python');const activeKey=DIJKSTRA_LINE_KEY[activeLine];return <div className="algorithm-code formal-code"><header><div><span>Dijkstra 正式实现</span><small>当前图采用顺序扫描选择最小节点，与上方动画完全一致</small></div><nav>{Object.keys(DIJKSTRA_CODE).map((item)=><button type="button" className={language===item?'active':''} onClick={()=>setLanguage(item)} key={item}>{item}</button>)}</nav></header><pre>{DIJKSTRA_CODE[language].map(([key,line],index)=><code className={activeKey===key?'active':''} key={`${language}-${index}`}><b>{String(index+1).padStart(2,'0')}</b>{line}</code>)}</pre><div className="complexity-grid"><span><small>时间复杂度</small><strong>O(V² + E)</strong><em>顺序扫描最小节点</em></span><span><small>空间复杂度</small><strong>O(V)</strong><em>dist、prev、visited</em></span><span><small>适用条件</small><strong>边权 ≥ 0</strong><em>负边需要其他算法</em></span></div></div> }

const STORY_NODES = [
  { id: 'A', x: 75, y: 155 },
  { id: 'B', x: 225, y: 65 },
  { id: 'C', x: 225, y: 245 },
  { id: 'D', x: 415, y: 65 },
  { id: 'E', x: 415, y: 245 },
  { id: 'F', x: 565, y: 155 },
]

const STORY_EDGES = [
  ['A', 'B', 4],
  ['A', 'C', 2],
  ['B', 'C', 1],
  ['B', 'D', 5],
  ['C', 'D', 8],
  ['C', 'E', 10],
  ['D', 'E', 2],
  ['D', 'F', 6],
  ['E', 'F', 3],
]

const STORY_STATES = [
  {
    phase: '建表初始化',
    current: 'A',
    visited: ['A'],
    treeEdges: [],
    activeEdges: ['A-B', 'A-C'],
    relaxEdge: null,
    distances: { A: 0, B: 4, C: 2, D: '∞', E: '∞', F: '∞' },
    note: '起点 A 初始化为 0，探索邻居：通过边 A-B(4) 与 A-C(2) 得到最初的候选距离。',
  },
  {
    phase: '贪心选最小',
    current: 'C',
    visited: ['A', 'C'],
    treeEdges: ['A-C'],
    activeEdges: ['B-C', 'C-D', 'C-E'],
    relaxEdge: null,
    distances: { A: 0, B: 4, C: 2, D: 10, E: 12, F: '∞' },
    note: '在所有未确定节点中，C 的候选距离 2 最小，确定 C；将边 A-C 加入最短路径树。',
  },
  {
    phase: '松弛成功！',
    current: 'B',
    visited: ['A', 'C', 'B'],
    treeEdges: ['A-C', 'B-C'],
    activeEdges: ['B-D'],
    relaxEdge: 'B-C',
    distances: { A: 0, B: 3, C: 2, D: 8, E: 12, F: '∞' },
    note: '关键松弛！通过 C 到达 B 仅需 2+1=3，比直达 A-B(4) 更短！B 的最短距离被更新为 3 并确定。',
  },
  {
    phase: '继续向右松弛',
    current: 'D',
    visited: ['A', 'C', 'B', 'D', 'E'],
    treeEdges: ['A-C', 'B-C', 'B-D', 'D-E'],
    activeEdges: ['D-F', 'E-F'],
    relaxEdge: 'D-E',
    distances: { A: 0, B: 3, C: 2, D: 8, E: 10, F: 13 },
    note: '确定 D(8)；通过 D-E(2) 松弛 E（由原来的12缩短到 8+2=10）；随后确定 E。',
  },
  {
    phase: '最短路径树完成',
    current: null,
    visited: ['A', 'C', 'B', 'D', 'E', 'F'],
    treeEdges: ['A-C', 'B-C', 'B-D', 'D-E', 'E-F'],
    activeEdges: [],
    relaxEdge: null,
    distances: { A: 0, B: 3, C: 2, D: 8, E: 10, F: 13 },
    note: '终点 F 到达！绿色高亮边连接成完整最短路径树，到达 F 的最优总距离为 13。',
  },
]

function DijkstraStory() {
  const items = [
    ['建表', '起点距离为 0，其余节点暂时都是 ∞。'],
    ['选择', '从未确定节点中选出候选距离最小者。'],
    ['确定', '非负边权保证它的当前距离已经是最终答案。'],
    ['松弛', '尝试通过当前节点缩短每个相邻节点的距离。'],
    ['重复', '持续选择与松弛，直到所有可达节点都被确定。'],
  ]
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const state = STORY_STATES[step] || STORY_STATES[0]

  useEffect(() => {
    if (!playing) return undefined
    const timer = window.setTimeout(() => setStep((value) => {
      if (value === items.length - 1) {
        setPlaying(false)
        return value
      }
      return value + 1
    }), 2600)
    return () => window.clearTimeout(timer)
  }, [playing, step, items.length])

  return (
    <section className="transformer-story dijkstra-story">
      <header className="story-intro">
        <div>
          <span className="story-kicker">动画导学 · 约 2 分钟</span>
          <h2>Dijkstra 的核心不是“找最近的边”，而是确定最近的节点</h2>
          <p>观察每个点和每条边的权重，看候选距离如何在松弛过程中被刷新，最终连成最短路径树。</p>
        </div>
        <div className="dijkstra-story-badge">
          <strong>{items[step][0]} · {state.phase}</strong>
          <span>dist[v] = min(dist[v], dist[u] + w)</span>
        </div>
      </header>
      <nav className="story-timeline" style={{ '--story-steps': items.length }}>
        {items.map((item, index) => (
          <button
            type="button"
            className={`${index === step ? 'active' : ''} ${index < step ? 'passed' : ''}`}
            onClick={() => { setStep(index); setPlaying(false) }}
            key={item[0]}
          >
            <i>{index < step ? '✓' : index + 1}</i>
            <span>{item[0]}</span>
          </button>
        ))}
      </nav>
      <div className="story-stage">
        <div className="story-copy">
          <span>0{step + 1} · 最短路径形成过程</span>
          <h3>{items[step][1]}</h3>
          <p>
            {[
              '距离表保存的是“目前已知的最好结果”，不是一开始就正确的最终答案。',
              '选择标准是从起点出发的累计距离，而不是当前边权或节点编号。',
              '如果存在负边，后面可能通过负边再次缩短已确定节点，因此 Dijkstra 不再成立。',
              '松弛就是用新候选值挑战旧距离；更短时同时记录前驱，便于恢复完整路径。',
              '每轮至少确定一个节点，最终 previous 指针会连接成一棵最短路径树。',
            ][step]}
          </p>
          <aside>
            <strong>观察重点</strong>
            <p>观察图中发光的点、带权边与松弛过程：绿色为已确定最短路，橙色为正在松弛更新的边。</p>
          </aside>
        </div>
        <div className="story-visual">
          <div className="dijkstra-story-container">
            <svg className="dijkstra-story-svg" viewBox="0 0 640 320" role="img" aria-label="Dijkstra 完整带权图">
              {/* 绘制所有边及权重 */}
              {STORY_EDGES.map(([u, v, w]) => {
                const fromNode = STORY_NODES.find((n) => n.id === u)
                const toNode = STORY_NODES.find((n) => n.id === v)
                const edgeKey = [u, v].sort().join('-')
                const isTree = state.treeEdges.includes(edgeKey)
                const isRelax = state.relaxEdge === edgeKey
                const isActive = state.activeEdges.includes(edgeKey)
                const midX = (fromNode.x + toNode.x) / 2
                const midY = (fromNode.y + toNode.y) / 2

                return (
                  <g key={`${u}-${v}`}>
                    <line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      className={isRelax ? 'relax-edge' : isTree ? 'tree-edge' : isActive ? 'active-edge' : ''}
                    />
                    <rect x={midX - 14} y={midY - 12} width="28" height="24" rx="6" className="edge-weight-bg" />
                    <text x={midX} y={midY} className="edge-weight-text">
                      {w}
                    </text>
                  </g>
                )
              })}

              {/* 绘制所有点及候选距离 */}
              {STORY_NODES.map((node) => {
                const isCurrent = state.current === node.id
                const isVisited = state.visited.includes(node.id)
                const distVal = state.distances[node.id]

                return (
                  <g
                    key={node.id}
                    className={`s-node ${isCurrent ? 'current' : ''} ${isVisited ? 'visited' : ''}`}
                    transform={`translate(${node.x},${node.y})`}
                  >
                    <circle r="22" className="main-circle" />
                    <text className="node-id" y="1">{node.id}</text>
                    <g transform="translate(0, 36)">
                      <rect x="-24" y="-10" width="48" height="20" rx="5" className="dist-badge" />
                      <text className="dist-text" y="1">
                        {distVal === '∞' ? '∞' : `d:${distVal}`}
                      </text>
                    </g>
                  </g>
                )
              })}
            </svg>

            {/* 当前步骤解释卡片 */}
            <div className="dijkstra-story-note">
              <strong>当前阶段：</strong>{state.note}
            </div>

            {/* 确定顺序与最短路径树进度胶囊 */}
            <div className="dijkstra-story-chain">
              {['A', 'C', 'B', 'D', 'E', 'F'].map((node, index) => {
                const isVis = state.visited.includes(node)
                const isCur = state.current === node
                const d = state.distances[node]
                return (
                  <React.Fragment key={node}>
                    <span className={isCur ? 'curr' : isVis ? 'active' : ''}>
                      {node} ({d === '∞' ? '∞' : d})
                    </span>
                    {index < 5 && <i>→</i>}
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      <footer className="story-controls">
        <button disabled={!step} onClick={() => setStep(step - 1)}>
          ← 上一步
        </button>
        <button
          className="story-play"
          onClick={() => {
            if (step === items.length - 1) setStep(0)
            setPlaying((value) => !value)
          }}
        >
          {playing ? '暂停讲解' : '▶ 自动播放'}
        </button>
        <button disabled={step === items.length - 1} onClick={() => setStep(step + 1)}>
          下一步 →
        </button>
      </footer>
    </section>
  )
}
