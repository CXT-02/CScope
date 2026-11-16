import React, { useEffect, useMemo, useState } from 'react'
import { ExperimentHeader } from './AttentionExperiment'
import DatabaseStory from './DatabaseStory'
import LearningCycle from './LearningCycle'

const STORY = [
  ['磁盘访问', '数据库索引首先要减少磁盘 I/O', '磁盘页比一次 CPU 比较昂贵得多，所以树要矮、节点要宽。', 'B+ 树每个节点容纳多个键，一般只需很少几层就能定位海量记录。'],
  ['内部节点', '内部节点只保存分隔键和子页指针', '查找时根据键值范围选择一条向下路径。', '不在内部节点保存整行数据，能放入更多分支，降低树高。'],
  ['叶子节点', '所有真实索引项都集中在同一层的叶子', '无论查找哪个键，路径长度基本一致。', '稳定的树高让单点查询的 I/O 次数容易预测。'],
  ['节点分裂', '节点装满后会分裂，并把分隔键推向父节点', '分裂可能继续向上传播，根分裂会让树高增加一层。', '局部调整即可维持平衡，不必重建整棵索引。'],
  ['叶链', '叶子节点按键值顺序首尾相连', '定位范围起点后，可沿叶链连续扫描后续记录。', '这使 B+ 树同时适合等值查询和范围查询。'],
  ['查询路径', '点查走树，范围查先走树再走链', '索引把全表扫描转化为少量节点访问。', '理解路径有助于判断 SQL 条件能否真正利用索引。'],
]
const DEFAULT_KEYS = [18, 7, 25, 4, 12, 21, 30, 9, 15]

export default function BPlusTreeExperiment({ experiment }) {
  const [order, setOrder] = useState(4)
  const [text, setText] = useState(DEFAULT_KEYS.join(', '))
  const keys = useMemo(() => parseKeys(text), [text])
  const snapshots = useMemo(() => buildSnapshots(keys, order), [keys, order])
  const [step, setStep] = useState(Math.max(0, snapshots.length - 1))
  const [query, setQuery] = useState(21)
  const [playing, setPlaying] = useState(false)
  useEffect(() => { setStep(Math.max(0, snapshots.length - 1)); setPlaying(false) }, [snapshots.length, order, text])
  useEffect(() => { if (!playing) return undefined; const timer = setInterval(() => setStep((value) => { if (value >= snapshots.length - 1) { setPlaying(false); return value } return value + 1 }), 850); return () => clearInterval(timer) }, [playing, snapshots.length])
  const tree = snapshots[step] || { levels: [], leaves: [], event: '等待插入键值' }
  const path = findPath(tree.root, query, tree.nodes)
  return <>
    <ExperimentHeader experiment={experiment} eyebrow="数据库实验 01" />
    <DatabaseStory title="B+ 树把巨大的有序表，折叠成几次磁盘页跳转" subtitle="跟随键值插入、叶节点分裂和根节点生长，再观察点查询与范围扫描的路径。" steps={STORY} badge={<><strong>B+</strong><span>ROOT → LEAF → RECORD</span></>} />
    <div className="explore-heading"><span>自由探索 · 插入键值并追踪分裂</span><h2>亲手长出一棵 B+ 树索引</h2><p>调整阶数和插入顺序，逐步观察分隔键如何上推；输入查询键后，访问路径会同步高亮。</p></div>
    <div className="lab-layout db-layout"><aside className="control-panel"><div className="panel-title"><span>索引控制台</span><i>{order} 阶</i></div><label className="field-block"><span>树的阶数（最多子节点数）</span><select value={order} onChange={(e) => setOrder(Number(e.target.value))}><option value={3}>3 阶</option><option value={4}>4 阶</option><option value={5}>5 阶</option></select></label><div className="mapping-help"><strong>阶数有什么作用？</strong><p>阶数越大，每个磁盘页能保存的分隔键越多，树通常越矮；本实验中叶节点最多保存“阶数 − 1”个键。</p></div><label className="field-block"><span>插入顺序（整数，逗号分隔）</span><textarea rows="3" value={text} onChange={(e) => setText(e.target.value)} /></label><label className="field-block"><span>查询键值</span><input className="number-input" type="number" value={query} onChange={(e) => setQuery(Number(e.target.value))} /></label><div className="step-counter"><span>已插入键数</span><strong>{step}/{Math.max(0, snapshots.length - 1)}</strong></div><input className="step-slider" type="range" min="0" max={Math.max(0, snapshots.length - 1)} value={step} onChange={(e) => { setStep(Number(e.target.value)); setPlaying(false) }} /><div className="step-buttons"><button disabled={!step} onClick={() => setStep(step - 1)}>← 撤回一步</button><button disabled={step >= snapshots.length - 1} onClick={() => setStep(step + 1)}>插入下一个 →</button></div><button className="tree-play" onClick={() => { if (step >= snapshots.length - 1) setStep(0); setPlaying((value) => !value) }}>{playing ? '暂停插入' : '▶ 连续插入'}</button><div className="live-explanation"><span>本步结构变化</span><strong>{tree.event}</strong><p>{tree.split ? '节点超过容量后被拆成左右两页，右页的首键成为父节点的分隔键。' : '节点容量仍足够，只需在叶子内部维持升序。'}</p></div></aside><section className="visual-panel bplus-visual"><div className="visual-toolbar"><div><strong>B+ 树页结构</strong><span>紫色为内部索引页，粉色为叶子数据页；发光节点属于当前查询路径。</span></div><span className="source-chip">查询 {query}</span></div>{tree.levels.length ? <><div className="bplus-tree">{tree.levels.map((level, levelIndex) => <div className="bplus-level" key={levelIndex}>{level.map((node) => <div className={`bplus-node ${node.leaf ? 'leaf' : 'internal'} ${path.includes(node.id) ? 'path' : ''}`} key={node.id}><small>{node.leaf ? 'LEAF' : levelIndex === 0 ? 'ROOT' : 'INDEX'}</small><div>{node.keys.map((key) => <b className={key === query ? 'match' : ''} key={key}>{key}</b>)}</div></div>)}</div>)}</div><div className="leaf-chain"><span>叶子链</span>{tree.leaves.map((leaf, index) => <React.Fragment key={leaf.id}><div className={path.includes(leaf.id) ? 'path' : ''}>{leaf.keys.join(' · ')}</div>{index < tree.leaves.length - 1 && <b>→</b>}</React.Fragment>)}</div><div className="query-path"><span>查询路径</span><strong>{path.length ? path.map((id) => tree.nodes[id]?.keys.join('|')).join(' → ') : '树中暂无节点'}</strong><p>{tree.leaves.some((leaf) => leaf.keys.includes(query)) ? `找到键 ${query}：从根页逐层选择区间，最终在叶子页命中。` : `未找到键 ${query}：查询仍会到达它应该出现的叶子页。`}</p></div></> : <div className="empty-state">输入至少一个键值开始构建索引</div>}</section></div>
    <LearningCycle experimentId="bplus-tree" prediction={{ question: 'B+ 树为什么特别适合数据库范围查询？', options: ['所有记录都在根节点', '叶子节点按顺序连接', '它不需要比较键值'], answer: '叶子节点按顺序连接', explanation: ' 定位范围起点后，可以沿叶子链顺序读取后续键值，不必反复回到根节点。' }} operation={{ title: '制造一次根节点分裂', instruction: '选择 3 阶树，从第 0 步开始连续插入，观察分裂如何从叶子向上影响根节点。' }} observation={`当前已插入 ${step} 个键，树高 ${tree.levels.length}，共有 ${tree.leaves.length} 个叶子页；查询 ${query} 访问 ${path.length} 个节点。`} summaryPrompt="B+ 树的内部节点、叶子节点和叶子链分别承担什么职责？" />
  </>
}

let nodeSeed = 0
function buildSnapshots(keys, order) {
  nodeSeed = 0
  let root = makeNode(true)
  const snapshots = [snapshot(root, '索引为空，等待第一条记录', false)]
  keys.forEach((key) => { const result = insert(root, key, order); root = result.root; snapshots.push(snapshot(root, result.event, result.split)) })
  return snapshots
}
function makeNode(leaf) { return { id: `n${nodeSeed += 1}`, leaf, keys: [], children: [], parent: null } }
function insert(root, key, order) {
  let leaf = root
  while (!leaf.leaf) { let index = 0; while (index < leaf.keys.length && key >= leaf.keys[index]) index += 1; leaf = leaf.children[index] }
  if (leaf.keys.includes(key)) return { root, event: `键 ${key} 已存在，索引保持不变`, split: false }
  leaf.keys.push(key); leaf.keys.sort((a, b) => a - b)
  if (leaf.keys.length < order) return { root, event: `键 ${key} 插入叶子节点`, split: false }
  const result = splitLeaf(root, leaf, order)
  return { root: result.root, event: `插入 ${key} 后叶节点已满，发生分裂`, split: true }
}
function splitLeaf(root, leaf, order) { const right = makeNode(true); const middle = Math.ceil(leaf.keys.length / 2); right.keys = leaf.keys.splice(middle); right.parent = leaf.parent; return insertParent(root, leaf, right.keys[0], right, order) }
function insertParent(root, left, key, right, order) {
  if (!left.parent) { const nextRoot = makeNode(false); nextRoot.keys = [key]; nextRoot.children = [left, right]; left.parent = nextRoot; right.parent = nextRoot; return { root: nextRoot } }
  const parent = left.parent; const index = parent.children.indexOf(left); parent.keys.splice(index, 0, key); parent.children.splice(index + 1, 0, right); right.parent = parent
  if (parent.keys.length < order) return { root }
  const next = makeNode(false); const mid = Math.floor(parent.keys.length / 2); const promoted = parent.keys[mid]; next.keys = parent.keys.splice(mid + 1); parent.keys.splice(mid); next.children = parent.children.splice(mid + 1); next.children.forEach((child) => { child.parent = next }); next.parent = parent.parent
  return insertParent(root, parent, promoted, next, order)
}
function snapshot(root, event, split) { const levels = [], nodes = {}, leaves = []; const visit = (node, depth) => { const copy = { id: node.id, leaf: node.leaf, keys: [...node.keys], children: node.children.map((child) => child.id) }; nodes[node.id] = copy; if (!levels[depth]) levels[depth] = []; levels[depth].push(copy); if (node.leaf) leaves.push(copy); else node.children.forEach((child) => visit(child, depth + 1)) }; visit(root, 0); return { root: nodes[root.id], levels, nodes, leaves, event, split } }
function findPath(root, key, nodes, result = []) { if (!root) return result; result.push(root.id); if (root.leaf) return result; let index = 0; while (index < root.keys.length && key >= root.keys[index]) index += 1; return findPath(nodes[root.children[index]], key, nodes, result) }
function parseKeys(text) { return [...new Set(text.split(/[，,\s]+/).filter(Boolean).map(Number).filter((value) => Number.isInteger(value) && value >= 0 && value <= 999))].slice(0, 18) }
