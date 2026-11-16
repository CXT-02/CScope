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
    <DatabaseStory
      title="B+ 树把巨大的有序表，折叠成几次磁盘页跳转"
      subtitle="跟随键值插入、叶节点分裂和根节点生长，再观察点查询与范围扫描的路径。"
      steps={STORY}
      badge={<><strong>B+</strong><span>ROOT → LEAF → RECORD</span></>}
      renderVisual={(s) => <BPlusTreeStoryVisual stageIndex={s} />}
    />
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
function BPlusTreeStoryVisual({ stageIndex }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {/* 阶段 1: 磁盘 I/O 与高扇出矮树 */}
      {stageIndex === 0 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#38bdf8', fontSize: '1rem', fontWeight: 'bold' }}>磁盘 I/O 瓶颈：为什么数据库不用二叉树？</span>
            <span style={{ background: '#3b82f6', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              高扇出 (High Fan-out)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', background: '#1e293b', padding: '14px', borderRadius: '8px' }}>
            <div style={{ background: '#0f172a', padding: '12px', borderRadius: '6px', border: '1px solid #ef4444' }}>
              <div style={{ color: '#f87171', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '6px' }}>普通二叉搜索树 (BST / AVL)</div>
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                • 每个节点仅存 1 个键、2 个分支<br />
                • 1000 万条记录 ➔ 树高约 <strong>24 层</strong><br />
                • 每次跳转都需要 1 次磁盘随机 I/O (每次 ~8ms)<br />
                • 单次查询耗时：<strong>接近 200 ms！</strong>
              </div>
            </div>

            <div style={{ background: '#0f172a', padding: '12px', borderRadius: '6px', border: '1.5px solid #10b981' }}>
              <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '6px' }}>B+ 树 (磁盘页友好设计)</div>
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                • 单节点对应 1 个磁盘页 (16 KB)，存数百个键<br />
                • 1000 万条记录 ➔ 树高仅 <strong>3 ~ 4 层</strong><br />
                • 根页常驻内存，实际仅需 2~3 次磁盘 I/O<br />
                • 单次查询耗时：<strong>微秒~毫秒级极速响应</strong>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '10px', fontSize: '0.82rem', color: '#38bdf8', textAlign: 'center' }}>
            “多叉矮胖”的核心设计让 B+ 树将昂贵的磁盘寻道次数降到最低。
          </div>
        </div>
      )}

      {/* 阶段 2: 内部节点只做路标 */}
      {stageIndex === 1 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#a855f7', fontSize: '1rem', fontWeight: 'bold' }}>内部索引页：纯粹的分隔键与页指针</span>
            <span style={{ background: '#a855f7', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              路标导航
            </span>
          </div>

          <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '8px' }}>4 阶内部索引页结构示例：</div>
            <div style={{ display: 'flex', height: '48px', borderRadius: '6px', overflow: 'hidden', border: '2px solid #64748b' }}>
              <div style={{ flex: 1, background: '#334155', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>Ptr 0 (&lt; 10)</div>
              <div style={{ width: '60px', background: '#a855f7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem' }}>10</div>
              <div style={{ flex: 1, background: '#334155', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>Ptr 1 [10, 20)</div>
              <div style={{ width: '60px', background: '#a855f7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem' }}>20</div>
              <div style={{ flex: 1, background: '#334155', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>Ptr 2 (&gt;= 20)</div>
            </div>

            <div style={{ marginTop: '12px', background: '#0f172a', padding: '10px', borderRadius: '6px', fontSize: '0.82rem', color: '#cbd5e1' }}>
              <strong>为什么不在内部节点存整行记录？</strong><br />
              若存整行数据（如数百字节），一个 16KB 页只能存几十条，导致扇出暴跌、树高剧增！只存 8 字节键 + 8 字节指针，能使一页容纳 1000+ 个分支！
            </div>
          </div>
        </div>
      )}

      {/* 阶段 3: 叶子节点汇总所有记录 */}
      {stageIndex === 2 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#10b981', fontSize: '1rem', fontWeight: 'bold' }}>叶子节点：真正的数据所在地与等长路径</span>
            <span style={{ background: '#10b981', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              平整叶底
            </span>
          </div>

          <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
              <div style={{ background: '#0f172a', padding: '10px', borderRadius: '6px', border: '1px solid #10b981', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>叶子页 1</div>
                <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1rem', margin: '4px 0' }}>[ 4 , 7 , 9 ]</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>含主键 + 行指针</div>
              </div>
              <div style={{ background: '#0f172a', padding: '10px', borderRadius: '6px', border: '1px solid #10b981', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>叶子页 2</div>
                <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1rem', margin: '4px 0' }}>[ 12 , 15 , 18 ]</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>含主键 + 行指针</div>
              </div>
              <div style={{ background: '#0f172a', padding: '10px', borderRadius: '6px', border: '1px solid #10b981', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>叶子页 3</div>
                <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1rem', margin: '4px 0' }}>[ 21 , 25 , 30 ]</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>含主键 + 行指针</div>
              </div>
            </div>

            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', textAlign: 'center', background: '#0f172a', padding: '8px', borderRadius: '4px' }}>
              无论查 key=4 还是 key=30，从根节点到叶子的跳转步数<strong>完全相同</strong>，查询响应极其平稳！
            </div>
          </div>
        </div>
      )}

      {/* 阶段 4: 节点分裂动效 */}
      {stageIndex === 3 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#f59e0b', fontSize: '1rem', fontWeight: 'bold' }}>容量溢出与节点分裂 (Node Split)</span>
            <span style={{ background: '#f59e0b', color: '#1e293b', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              自底向上生长
            </span>
          </div>

          <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ background: '#ef4444', color: '#fff', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                叶节点满 [ 4, 7, 9, 12 ]
              </div>
              <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '1.2rem' }}>➔ 裂开 ➔</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ background: '#a855f7', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', textAlign: 'center' }}>
                  上推分隔键 9 到父页 ↑
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ background: '#10b981', color: '#fff', padding: '6px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>左页: [ 4, 7 ]</div>
                  <div style={{ background: '#10b981', color: '#fff', padding: '6px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>右页: [ 9, 12 ]</div>
                </div>
              </div>
            </div>

            <div style={{ background: '#0f172a', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#cbd5e1' }}>
              若父节点也被推满，分裂会继续向上传播；只有当<strong>根节点分裂</strong>时，树才会拔高一层！
            </div>
          </div>
        </div>
      )}

      {/* 阶段 5: 叶链与双向扫描 */}
      {stageIndex === 4 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#10b981', fontSize: '1rem', fontWeight: 'bold' }}>叶子双向链表：范围查询的神器</span>
            <span style={{ background: '#10b981', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              WHERE val BETWEEN
            </span>
          </div>

          <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: '#0f172a', borderRadius: '6px', marginBottom: '12px' }}>
              <div style={{ background: '#1e293b', padding: '6px 10px', borderRadius: '4px', border: '1px solid #10b981', color: '#10b981', fontWeight: 'bold' }}>
                叶页 A: 4 · 7
              </div>
              <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem' }}>⇄</div>
              <div style={{ background: '#1e293b', padding: '6px 10px', borderRadius: '4px', border: '1.5px solid #f59e0b', color: '#f59e0b', fontWeight: 'bold' }}>
                叶页 B: 9 · 12 · 15
              </div>
              <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem' }}>⇄</div>
              <div style={{ background: '#1e293b', padding: '6px 10px', borderRadius: '4px', border: '1px solid #10b981', color: '#10b981', fontWeight: 'bold' }}>
                叶页 C: 18 · 21 · 25
              </div>
            </div>

            <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
              查询 <code>SELECT * WHERE id &gt;= 9 AND id &lt;= 21</code>：<br />
              只需从根查一次找到起始键 9，后续直接顺着叶子链顺序向右扫描，无需再回到根节点折返！
            </div>
          </div>
        </div>
      )}

      {/* 阶段 6: 完整查询路径 */}
      {stageIndex === 5 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#38bdf8', fontSize: '1rem', fontWeight: 'bold' }}>自顶向下路由：查询 21 的点查路径</span>
            <span style={{ background: '#3b82f6', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              点查全流程
            </span>
          </div>

          <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: '#3b82f6', color: '#fff', padding: '6px 16px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                根节点 [ 18 ] ➔ 21 &gt;= 18，选择右指针
              </div>
              <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>↓</span>
              <div style={{ background: '#a855f7', color: '#fff', padding: '6px 16px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                内部页 [ 21, 30 ] ➔ 21 落在 [21, 30) 区间，选择中指针
              </div>
              <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>↓</span>
              <div style={{ background: '#10b981', color: '#fff', padding: '6px 20px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.95rem' }}>
                叶子页 [ 21, 25 ] ➔ 命中键 21，读取数据行！
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function parseKeys(text) { return [...new Set(text.split(/[，,\s]+/).filter(Boolean).map(Number).filter((value) => Number.isInteger(value) && value >= 0 && value <= 999))].slice(0, 18) }
