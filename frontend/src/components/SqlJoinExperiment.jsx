import React, { useEffect, useMemo, useState } from 'react'
import { ExperimentHeader } from './AttentionExperiment'
import DatabaseStory from './DatabaseStory'
import LearningCycle from './LearningCycle'

const STUDENTS = [{ id: 1, name: '林悦', dept: 'AI' }, { id: 2, name: '周宁', dept: 'NET' }, { id: 3, name: '陈曦', dept: 'AI' }, { id: 4, name: '许然', dept: 'OS' }]
const SCORES = [{ sid: 3, course: '数据库', score: 91 }, { sid: 1, course: '算法', score: 88 }, { sid: 4, course: '网络', score: 86 }, { sid: 1, course: '数据库', score: 95 }, { sid: 5, course: '编译原理', score: 80 }]
const STORY = [
  ['连接含义', 'JOIN 按条件把两张表的行组合起来', '连接条件通常比较主键与外键，输出同时包含两边的信息。', 'SQL 只描述想要什么，执行引擎还要选择具体怎样找匹配行。'],
  ['嵌套循环', '外表每取一行，就扫描一次内表', '实现简单，任何连接条件都能使用，但比较次数可能很多。', '小表驱动大表、或内表连接列有索引时，它仍可能非常高效。'],
  ['哈希连接', '先为一张表构建哈希桶，再用另一张表探测', '等值连接可以快速定位相同键，平均复杂度接近线性。', '它适合大规模等值连接，却不能直接处理范围条件。'],
  ['排序合并', '两边先按连接键排序，再用双指针同步前进', '相同键连续出现时可一次输出多条匹配。', '输入已经有序或需要排序输出时，合并连接很有竞争力。'],
  ['执行代价', '算法选择取决于数据量、索引、有序性和内存', '优化器根据统计信息估算 I/O、CPU 和中间结果大小。', '理解代价模型能解释同一条 SQL 为什么会出现不同执行计划。'],
  ['结果语义', 'INNER JOIN 只输出匹配行，外连接还保留未匹配行', '物理算法改变执行过程，但不能改变 SQL 的逻辑结果。', '优化的前提永远是保持查询语义一致。'],
]

export default function SqlJoinExperiment({ experiment }) {
  const [algorithm, setAlgorithm] = useState('hash')
  const trace = useMemo(() => buildTrace(algorithm), [algorithm])
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  useEffect(() => { setStep(0); setPlaying(false) }, [algorithm])
  useEffect(() => { if (!playing) return undefined; const timer = setInterval(() => setStep((value) => { if (value >= trace.length - 1) { setPlaying(false); return value } return value + 1 }), 800); return () => clearInterval(timer) }, [playing, trace.length])
  const current = trace[step]
  const results = trace.slice(0, step + 1).flatMap((item) => item.output || [])
  const comparisons = trace.slice(0, step + 1).reduce((sum, item) => sum + (item.comparisons || 0), 0)
  return <>
    <ExperimentHeader experiment={experiment} eyebrow="数据库实验 02" />
    <DatabaseStory title="一条 JOIN，背后可能是三种完全不同的数据流" subtitle="让两张小表分别通过嵌套循环、哈希连接和排序合并，观察它们如何寻找相同键。" steps={STORY} badge={<><strong>R ⋈ S</strong><span>ON R.id = S.sid</span></>} />
    <div className="explore-heading"><span>自由探索 · 切换物理连接算法</span><h2>让学生表和成绩表完成一次等值连接</h2><p>逐步查看当前扫描行、哈希桶或双指针位置；三种算法输出相同结果，但中间过程和比较代价不同。</p></div>
    <div className="lab-layout db-layout"><aside className="control-panel"><div className="panel-title"><span>执行计划</span><i>{algorithmLabel(algorithm)}</i></div><label className="field-block"><span>物理连接算法</span><select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}><option value="nested">嵌套循环连接</option><option value="hash">哈希连接</option><option value="merge">排序合并连接</option></select></label><div className="mapping-help"><strong>{algorithmLabel(algorithm)}</strong><p>{algorithm === 'nested' ? '学生表作为外表，每一行都依次与成绩表比较。' : algorithm === 'hash' ? '先按学生 id 构建哈希表，再用成绩表 sid 探测桶。' : '两表先按连接键排序，双指针只向前移动。'}</p></div><div className="join-sql"><span>逻辑 SQL</span><code>SELECT name, course, score<br />FROM Student S JOIN Score C<br />ON S.id = C.sid;</code></div><div className="step-counter"><span>执行微步骤</span><strong>{step + 1}/{trace.length}</strong></div><input className="step-slider" type="range" min="0" max={trace.length - 1} value={step} onChange={(e) => { setStep(Number(e.target.value)); setPlaying(false) }} /><div className="step-buttons"><button disabled={!step} onClick={() => setStep(step - 1)}>← 上一步</button><button disabled={step === trace.length - 1} onClick={() => setStep(step + 1)}>下一步 →</button></div><button className="tree-play" onClick={() => { if (step === trace.length - 1) setStep(0); setPlaying((value) => !value) }}>{playing ? '暂停执行' : '▶ 执行计划'}</button><div className="live-explanation"><span>{current.phase}</span><strong>{current.title}</strong><p>{current.message}</p></div></aside><section className="visual-panel join-visual"><div className="visual-toolbar"><div><strong>JOIN 数据流</strong><span>橙色行为当前输入，绿色行已成功连接，灰色行尚未处理。</span></div><span className="source-chip">{results.length} 条结果</span></div><div className="join-inputs"><DataTable title="Student 学生表" columns={['id', 'name', 'dept']} rows={STUDENTS} active={current.left} /><div className="join-operator"><span>{algorithm === 'nested' ? '双层循环' : algorithm === 'hash' ? '# 哈希桶' : '⇄ 双指针'}</span><strong>id = sid</strong><small>{current.workspace || '准备执行'}</small></div><DataTable title="Score 成绩表" columns={['sid', 'course', 'score']} rows={SCORES} active={current.right} /></div>{algorithm === 'hash' && <div className="hash-buckets"><span>内存哈希表</span>{[0, 1, 2, 3].map((bucket) => <div className={current.bucket === bucket ? 'active' : ''} key={bucket}><b>桶 {bucket}</b><code>{STUDENTS.filter((row) => row.id % 4 === bucket).map((row) => `${row.id}:${row.name}`).join(' / ') || '空'}</code></div>)}</div>}<div className="join-results"><header><span>name</span><span>course</span><span>score</span></header>{results.length ? results.map((row, index) => <div key={`${row.name}-${row.course}-${index}`}><strong>{row.name}</strong><span>{row.course}</span><span>{row.score}</span></div>) : <p>匹配结果会随执行步骤出现在这里</p>}</div><div className="join-metrics"><div><span>输入规模</span><strong>4 + 5 行</strong></div><div><span>已完成比较 / 探测</span><strong>{comparisons}</strong></div><div><span>输出结果</span><strong>{results.length}</strong></div><div><span>算法特点</span><strong>{algorithm === 'nested' ? '通用' : algorithm === 'hash' ? '等值快' : '顺序读'}</strong></div></div></section></div>
    <LearningCycle experimentId="sql-join" prediction={{ question: '大表之间进行无索引的等值连接，通常哪种算法更有优势？', options: ['哈希连接', '逐行嵌套循环', '随机选择'], answer: '哈希连接', explanation: ' 哈希连接先建立键到记录的快速映射，再线性探测另一张表，避免大量重复扫描。' }} operation={{ title: '比较三种执行过程', instruction: '依次选择三种算法并运行到最后，观察比较次数、工作区和最终结果是否变化。' }} observation={`当前使用${algorithmLabel(algorithm)}，已执行 ${step + 1} 个微步骤，产生 ${results.length} 条结果，累计 ${comparisons} 次比较或探测。`} summaryPrompt="为什么不同连接算法能得到相同结果，却可能有完全不同的执行代价？" />
  </>
}

function DataTable({ title, columns, rows, active }) { return <div className="mini-data-table"><strong>{title}</strong><header>{columns.map((column) => <span key={column}>{column}</span>)}</header>{rows.map((row, index) => <div className={active === index ? 'active' : ''} key={index}>{columns.map((column) => <span key={column}>{row[column]}</span>)}</div>)}</div> }
function output(left, right) { return [{ name: left.name, course: right.course, score: right.score }] }
function buildTrace(algorithm) {
  const trace = [{ phase: '准备', title: '读取执行计划', message: '两张表已进入连接算子，尚未产生结果。', comparisons: 0 }]
  if (algorithm === 'nested') { STUDENTS.forEach((left, li) => SCORES.forEach((right, ri) => { const match = left.id === right.sid; trace.push({ phase: '比较', title: `${left.id} ${match ? '=' : '≠'} ${right.sid}`, message: match ? `${left.name} 与 ${right.course} 成绩匹配，输出一行。` : '连接键不同，继续扫描内表。', left: li, right: ri, comparisons: 1, output: match ? output(left, right) : [] }) })); return trace }
  if (algorithm === 'hash') { STUDENTS.forEach((left, li) => trace.push({ phase: 'Build', title: `把 id=${left.id} 放入桶 ${left.id % 4}`, message: '构建阶段只组织较小输入，不产生连接结果。', left: li, bucket: left.id % 4, comparisons: 0, workspace: `H[${left.id % 4}] ← ${left.name}` })); SCORES.forEach((right, ri) => { const left = STUDENTS.find((row) => row.id === right.sid); trace.push({ phase: 'Probe', title: `用 sid=${right.sid} 探测桶 ${right.sid % 4}`, message: left ? `桶内找到 ${left.name}，输出匹配行。` : '桶内没有相同键，该成绩没有对应学生。', left: left ? STUDENTS.indexOf(left) : undefined, right: ri, bucket: right.sid % 4, comparisons: 1, output: left ? output(left, right) : [], workspace: `probe H[${right.sid % 4}]` }) }); return trace }
  const leftSorted = [...STUDENTS].sort((a, b) => a.id - b.id), rightSorted = [...SCORES].sort((a, b) => a.sid - b.sid); let i = 0, j = 0
  trace.push({ phase: 'Sort', title: '两侧按连接键排序', message: '有序输入可跳过这一步；本例生成 id 与 sid 的升序流。', comparisons: 0, workspace: 'sort(id), sort(sid)' })
  while (i < leftSorted.length && j < rightSorted.length) { const left = leftSorted[i], right = rightSorted[j]; const match = left.id === right.sid; trace.push({ phase: 'Merge', title: match ? `${left.id} = ${right.sid}，输出` : left.id < right.sid ? `${left.id} < ${right.sid}，左指针前进` : `${left.id} > ${right.sid}，右指针前进`, message: match ? '键相等，输出组合并继续检查同键成绩。' : '较小一侧不可能再与当前键匹配，指针只向前移动。', left: STUDENTS.indexOf(left), right: SCORES.indexOf(right), comparisons: 1, output: match ? output(left, right) : [], workspace: `L=${left.id}, R=${right.sid}` }); if (match) j += 1; else if (left.id < right.sid) i += 1; else j += 1 }
  return trace
}
function algorithmLabel(value) { return ({ nested: '嵌套循环连接', hash: '哈希连接', merge: '排序合并连接' })[value] }
