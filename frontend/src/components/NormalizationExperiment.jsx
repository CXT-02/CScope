import React, { useMemo, useState } from 'react'
import { ExperimentHeader } from './AttentionExperiment'
import DatabaseStory from './DatabaseStory'
import LearningCycle from './LearningCycle'

const STORY = [
  ['关系模型', '关系表用行表示元组、列表示属性', '主键唯一标识一行，外键把不同关系连接起来。', '清晰的键约束是理解依赖和拆表的起点。'],
  ['数据冗余', '把多个事实混在一张表会反复存储相同信息', '学生姓名、课程名和院系电话随每条选课记录重复。', '冗余不仅浪费空间，更会造成修改、插入和删除异常。'],
  ['函数依赖', 'X → Y 表示 X 的值能够唯一决定 Y', '学号决定姓名和院系，课程号决定课程名和教师。', '范式分解的依据不是表看起来多宽，而是属性之间的决定关系。'],
  ['第二范式', '消除对组合主键一部分的部分依赖', '选课表的主键是“学号 + 课程号”，但姓名只依赖学号。', '把学生和课程事实拆出后，每个事实只保存一次。'],
  ['第三范式', '继续消除非主属性之间的传递依赖', '学号决定院系，院系又决定电话，因此电话对学号是传递依赖。', '院系电话应由独立院系表维护，避免多行更新不一致。'],
  ['无损连接', '好的分解能通过键重新连接回原始信息', '拆表不能凭空丢失元组，也应尽量保留原有依赖。', '范式化不是越碎越好，而是在一致性与查询代价之间权衡。'],
]
const ROWS = [
  { 学号: 'S01', 姓名: '林悦', 院系: '计算机', 院系电话: '8001', 课程号: 'C01', 课程名: '数据库', 教师: '王老师', 成绩: 95 },
  { 学号: 'S01', 姓名: '林悦', 院系: '计算机', 院系电话: '8001', 课程号: 'C02', 课程名: '算法', 教师: '李老师', 成绩: 88 },
  { 学号: 'S02', 姓名: '周宁', 院系: '网络空间', 院系电话: '8012', 课程号: 'C01', 课程名: '数据库', 教师: '王老师', 成绩: 86 },
]
const DEPENDENCIES = [
  { from: ['学号'], to: ['姓名', '院系'], type: '部分依赖', level: 2 },
  { from: ['课程号'], to: ['课程名', '教师'], type: '部分依赖', level: 2 },
  { from: ['院系'], to: ['院系电话'], type: '传递依赖', level: 3 },
  { from: ['学号', '课程号'], to: ['成绩'], type: '完全依赖', level: 1 },
]

export default function NormalizationExperiment({ experiment }) {
  const [normalForm, setNormalForm] = useState(1)
  const [dependency, setDependency] = useState(0)
  const [anomaly, setAnomaly] = useState('update')
  const tables = useMemo(() => normalizedTables(normalForm), [normalForm])
  const active = DEPENDENCIES[dependency]
  return <>
    <ExperimentHeader experiment={experiment} eyebrow="数据库实验 04" />
    <DatabaseStory title="数据库范式是在问：每个事实究竟应该保存在哪里" subtitle="从一张重复信息很多的选课大表出发，沿函数依赖逐步拆分到 2NF 和 3NF。" steps={STORY} badge={<><strong>1NF → 2NF → 3NF</strong><span>减少冗余 · 保持语义</span></>} />
    <div className="explore-heading"><span>自由探索 · 沿函数依赖拆分关系</span><h2>把一张选课大表整理成职责清晰的关系</h2><p>选择范式阶段和函数依赖，观察哪些列被移动到新表，以及更新、插入和删除异常如何消失。</p></div>
    <div className="lab-layout db-layout"><aside className="control-panel"><div className="panel-title"><span>规范化控制台</span><i>{normalForm}NF</i></div><label className="field-block"><span>当前规范化阶段</span><select value={normalForm} onChange={(e) => setNormalForm(Number(e.target.value))}><option value={1}>1NF：属性保持原子</option><option value={2}>2NF：消除部分依赖</option><option value={3}>3NF：消除传递依赖</option></select></label><div className="normal-steps">{[1,2,3].map((level) => <button className={normalForm === level ? 'active' : normalForm > level ? 'done' : ''} key={level} onClick={() => setNormalForm(level)}><b>{normalForm > level ? '✓' : level}</b><span>{level}NF</span></button>)}</div><div className="dependency-list"><span>点击查看函数依赖</span>{DEPENDENCIES.map((item, index) => <button className={dependency === index ? 'active' : ''} key={index} onClick={() => setDependency(index)}><code>{item.from.join(' + ')} → {item.to.join('、')}</code><small>{item.type}</small></button>)}</div><label className="field-block"><span>观察数据异常</span><select value={anomaly} onChange={(e) => setAnomaly(e.target.value)}><option value="update">修改异常</option><option value="insert">插入异常</option><option value="delete">删除异常</option></select></label><div className={`normal-alert ${normalForm >= anomalySolvedAt(anomaly) ? 'solved' : ''}`}><strong>{normalForm >= anomalySolvedAt(anomaly) ? '该异常已被当前分解消除' : '当前结构仍可能发生异常'}</strong><p>{anomalyText(anomaly, normalForm)}</p></div></aside><section className="visual-panel normal-visual"><div className="visual-toolbar"><div><strong>关系分解图</strong><span>当前依赖中的决定属性为紫色，被决定属性为粉色；钥匙图标表示主键。</span></div><span className="source-chip">{tables.length} 张关系表</span></div><div className="dependency-banner"><span>函数依赖</span><strong>{active.from.join(' + ')} → {active.to.join('、')}</strong><i>{active.type}</i></div><div className={`schema-grid tables-${Math.min(tables.length, 4)}`}>{tables.map((table) => <SchemaTable table={table} active={active} key={table.name} />)}</div><div className="decomposition-flow"><div><span>原始关系</span><strong>选课大表</strong><small>学生、课程、院系、成绩混合</small></div><b>→</b><div><span>当前阶段</span><strong>{normalForm}NF</strong><small>{normalForm === 1 ? '原子值，但仍有冗余' : normalForm === 2 ? '学生与课程事实已分离' : '院系事实也独立维护'}</small></div><b>→</b><div><span>结果</span><strong>{normalForm === 3 ? '低冗余、易维护' : '继续识别依赖'}</strong><small>可通过主外键重新连接</small></div></div><div className="normal-metrics"><div><span>关系表数量</span><strong>{tables.length}</strong></div><div><span>重复姓名次数</span><strong>{normalForm === 1 ? '2' : '0'}</strong></div><div><span>重复院系电话</span><strong>{normalForm < 3 ? '存在' : '消除'}</strong></div><div><span>连接代价</span><strong>{normalForm === 1 ? '低' : normalForm === 2 ? '中' : '较高'}</strong></div></div></section></div>
    <LearningCycle experimentId="normalization" prediction={{ question: '选课表以“学号 + 课程号”为组合主键，姓名只依赖学号，这属于什么？', options: ['部分依赖', '传递依赖', '多值依赖'], answer: '部分依赖', explanation: ' 姓名只依赖组合主键的一部分“学号”，因此违反第二范式，需要拆入学生表。' }} operation={{ title: '从 1NF 分解到 3NF', instruction: '依次点击 1NF、2NF、3NF，观察学生、课程、院系和选课事实分别进入哪张表。' }} observation={`当前为 ${normalForm}NF，共拆分为 ${tables.length} 张表；${normalForm === 1 ? '部分依赖与传递依赖仍存在' : normalForm === 2 ? '部分依赖已消除，但院系电话仍是传递依赖' : '部分依赖与传递依赖均已消除'}。`} summaryPrompt="范式化为什么能减少更新异常，同时又可能增加查询时的 JOIN 成本？" />
  </>
}

function SchemaTable({ table, active }) { return <div className="schema-table"><header><strong>{table.name}</strong><span>{table.note}</span></header><div className="schema-columns">{table.columns.map((column) => <div className={`${table.keys.includes(column) ? 'key' : ''} ${active.from.includes(column) ? 'determinant' : ''} ${active.to.includes(column) ? 'dependent' : ''}`} key={column}><b>{table.keys.includes(column) ? '🔑' : '•'}</b><span>{column}</span></div>)}</div>{table.rows && <div className="schema-preview">{table.rows.map((row, index) => <p key={index}>{table.columns.slice(0, 3).map((column) => row[column]).join(' · ')}</p>)}</div>}</div> }
function normalizedTables(level) {
  if (level === 1) return [{ name: '选课记录', note: '主键：(学号, 课程号)', columns: ['学号','姓名','院系','院系电话','课程号','课程名','教师','成绩'], keys: ['学号','课程号'], rows: ROWS }]
  const base = [{ name: '学生', note: '一个学生只保存一次', columns: ['学号','姓名','院系',...(level === 2 ? ['院系电话'] : [])], keys: ['学号'] }, { name: '课程', note: '课程事实独立维护', columns: ['课程号','课程名','教师'], keys: ['课程号'] }, { name: '选课', note: '只保存学生与课程的联系', columns: ['学号','课程号','成绩'], keys: ['学号','课程号'] }]
  if (level === 3) base.splice(2, 0, { name: '院系', note: '消除院系的传递依赖', columns: ['院系','院系电话'], keys: ['院系'] })
  return base
}
function anomalySolvedAt(value) { return value === 'update' ? 3 : 2 }
function anomalyText(value, level) { if (value === 'update') return level >= 3 ? '院系电话只在院系表修改一次，不会出现同一院系多个号码。' : '同一院系电话重复在多行中，漏改一行就会产生不一致。'; if (value === 'insert') return level >= 2 ? '课程信息可以先写入课程表，不必等待学生选课。' : '没有学生选课时，无法单独录入一门新课程。'; return level >= 2 ? '删除最后一条选课记录不会同时删除课程定义。' : '删除某课程最后一条选课记录，可能把课程信息一并丢失。' }
