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
    <DatabaseStory
      title="数据库范式是在问：每个事实究竟应该保存在哪里"
      subtitle="从一张重复信息很多的选课大表出发，沿函数依赖逐步拆分到 2NF 和 3NF。"
      steps={STORY}
      badge={<><strong>1NF → 2NF → 3NF</strong><span>减少冗余 · 保持语义</span></>}
      renderVisual={(s) => <NormalizationStoryVisual stageIndex={s} />}
    />
    <div className="explore-heading"><span>自由探索 · 沿函数依赖拆分关系</span><h2>把一张选课大表整理成职责清晰的关系</h2><p>选择范式阶段和函数依赖，观察哪些列被移动到新表，以及更新、插入和删除异常如何消失。</p></div>
    <div className="lab-layout db-layout"><aside className="control-panel"><div className="panel-title"><span>规范化控制台</span><i>{normalForm}NF</i></div><label className="field-block"><span>当前规范化阶段</span><select value={normalForm} onChange={(e) => setNormalForm(Number(e.target.value))}><option value={1}>1NF：属性保持原子</option><option value={2}>2NF：消除部分依赖</option><option value={3}>3NF：消除传递依赖</option></select></label><div className="normal-steps">{[1,2,3].map((level) => <button className={normalForm === level ? 'active' : normalForm > level ? 'done' : ''} key={level} onClick={() => setNormalForm(level)}><b>{normalForm > level ? '✓' : level}</b><span>{level}NF</span></button>)}</div><div className="dependency-list"><span>点击查看函数依赖</span>{DEPENDENCIES.map((item, index) => <button className={dependency === index ? 'active' : ''} key={index} onClick={() => setDependency(index)}><code>{item.from.join(' + ')} → {item.to.join('、')}</code><small>{item.type}</small></button>)}</div><label className="field-block"><span>观察数据异常</span><select value={anomaly} onChange={(e) => setAnomaly(e.target.value)}><option value="update">修改异常</option><option value="insert">插入异常</option><option value="delete">删除异常</option></select></label><div className={`normal-alert ${normalForm >= anomalySolvedAt(anomaly) ? 'solved' : ''}`}><strong>{normalForm >= anomalySolvedAt(anomaly) ? '该异常已被当前分解消除' : '当前结构仍可能发生异常'}</strong><p>{anomalyText(anomaly, normalForm)}</p></div></aside><section className="visual-panel normal-visual"><div className="visual-toolbar"><div><strong>关系分解图</strong><span>当前依赖中的决定属性为紫色，被决定属性为粉色；钥匙图标表示主键。</span></div><span className="source-chip">{tables.length} 张关系表</span></div><div className="dependency-banner"><span>函数依赖</span><strong>{active.from.join(' + ')} → {active.to.join('、')}</strong><i>{active.type}</i></div><div className={`schema-grid tables-${Math.min(tables.length, 4)}`}>{tables.map((table) => <SchemaTable table={table} active={active} key={table.name} />)}</div><div className="decomposition-flow"><div><span>原始关系</span><strong>选课大表</strong><small>学生、课程、院系、成绩混合</small></div><b>→</b><div><span>当前阶段</span><strong>{normalForm}NF</strong><small>{normalForm === 1 ? '原子值，但仍有冗余' : normalForm === 2 ? '学生与课程事实已分离' : '院系事实也独立维护'}</small></div><b>→</b><div><span>结果</span><strong>{normalForm === 3 ? '低冗余、易维护' : '继续识别依赖'}</strong><small>可通过主外键重新连接</small></div></div><div className="normal-metrics"><div><span>关系表数量</span><strong>{tables.length}</strong></div><div><span>重复姓名次数</span><strong>{normalForm === 1 ? '2' : '0'}</strong></div><div><span>重复院系电话</span><strong>{normalForm < 3 ? '存在' : '消除'}</strong></div><div><span>连接代价</span><strong>{normalForm === 1 ? '低' : normalForm === 2 ? '中' : '较高'}</strong></div></div></section></div>
    <LearningCycle experimentId="normalization" prediction={{ question: '选课表以“学号 + 课程号”为组合主键，姓名只依赖学号，这属于什么？', options: ['部分依赖', '传递依赖', '多值依赖'], answer: '部分依赖', explanation: ' 姓名只依赖组合主键的一部分“学号”，因此违反第二范式，需要拆入学生表。' }} operation={{ title: '从 1NF 分解到 3NF', instruction: '依次点击 1NF、2NF、3NF，观察学生、课程、院系和选课事实分别进入哪张表。' }} observation={`当前为 ${normalForm}NF，共拆分为 ${tables.length} 张表；${normalForm === 1 ? '部分依赖与传递依赖仍存在' : normalForm === 2 ? '部分依赖已消除，但院系电话仍是传递依赖' : '部分依赖与传递依赖均已消除'}。`} summaryPrompt="范式化为什么能减少更新异常，同时又可能增加查询时的 JOIN 成本？" />
  </>
}

function NormalizationStoryVisual({ stageIndex }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {/* 阶段 1: 关系模型与键 */}
      {stageIndex === 0 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#38bdf8', fontSize: '1rem', fontWeight: 'bold' }}>关系模型：元组、属性与约束</span>
            <span style={{ background: '#3b82f6', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              二维表语义
            </span>
          </div>

          <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ background: '#0f172a', padding: '8px 12px', borderRadius: '6px', border: '1.5px solid #a855f7' }}>
                <span style={{ color: '#a855f7', fontWeight: 'bold', fontSize: '0.85rem' }}>主键 PK (Primary Key)</span>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '2px' }}>唯一标识表中一行（如学号 S01）</div>
              </div>
              <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>➔ 关联 ➔</span>
              <div style={{ background: '#0f172a', padding: '8px 12px', borderRadius: '6px', border: '1.5px solid #10b981' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem' }}>外键 FK (Foreign Key)</span>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '2px' }}>引用另一张表的主键保持参照完整性</div>
              </div>
            </div>

            <div style={{ fontSize: '0.82rem', color: '#94a3b8', textAlign: 'center', marginTop: '6px' }}>
              规范化的核心目标：让每个关系模式只表达“一个实体或一个联系”事实。
            </div>
          </div>
        </div>
      )}

      {/* 阶段 2: 数据冗余与三大异常 */}
      {stageIndex === 1 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#ef4444', fontSize: '1rem', fontWeight: 'bold' }}>扁平大表的致命代价：三大操作异常</span>
            <span style={{ background: '#ef4444', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              冗余危机
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#1e293b', padding: '12px', borderRadius: '8px' }}>
            <div style={{ background: '#0f172a', padding: '8px 12px', borderRadius: '4px', borderLeft: '4px solid #ef4444' }}>
              <strong style={{ color: '#f87171', fontSize: '0.85rem' }}>修改异常：</strong>
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1', marginLeft: '6px' }}>若计算机学院换了电话，必须遍历修改成千上万条选课记录，漏掉一条即发生数据不一致。</span>
            </div>
            <div style={{ background: '#0f172a', padding: '8px 12px', borderRadius: '4px', borderLeft: '4px solid #f59e0b' }}>
              <strong style={{ color: '#f59e0b', fontSize: '0.85rem' }}>插入异常：</strong>
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1', marginLeft: '6px' }}>新开设了一门《人工智能》课程，若还没有学生选课，就无法插入该课程事实（主键学号为 NULL 违反实体完整性）。</span>
            </div>
            <div style={{ background: '#0f172a', padding: '8px 12px', borderRadius: '4px', borderLeft: '4px solid #a855f7' }}>
              <strong style={{ color: '#a855f7', fontSize: '0.85rem' }}>删除异常：</strong>
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1', marginLeft: '6px' }}>唯一选修某门课的学生退选，删除该记录的同时将课程名称和授课教师信息也一并抹去。</span>
            </div>
          </div>
        </div>
      )}

      {/* 阶段 3: 函数依赖 */}
      {stageIndex === 2 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#38bdf8', fontSize: '1rem', fontWeight: 'bold' }}>函数依赖 (Functional Dependency, FD)</span>
            <span style={{ background: '#3b82f6', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              X ➔ Y
            </span>
          </div>

          <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', padding: '8px 12px', borderRadius: '4px' }}>
                <span style={{ width: '80px', color: '#38bdf8', fontWeight: 'bold', fontSize: '0.85rem' }}>完全依赖:</span>
                <code style={{ color: '#10b981', flex: 1 }}>(学号, 课程号) ➔ 成绩</code>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>必须两者合一才能确定唯一的成绩</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', padding: '8px 12px', borderRadius: '4px' }}>
                <span style={{ width: '80px', color: '#f59e0b', fontWeight: 'bold', fontSize: '0.85rem' }}>部分依赖:</span>
                <code style={{ color: '#f59e0b', flex: 1 }}>学号 ➔ 姓名、院系</code>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>只依赖复合主键的一部分（学号）</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', padding: '8px 12px', borderRadius: '4px' }}>
                <span style={{ width: '80px', color: '#ef4444', fontWeight: 'bold', fontSize: '0.85rem' }}>传递依赖:</span>
                <code style={{ color: '#f87171', flex: 1 }}>学号 ➔ 院系 ➔ 院系电话</code>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>非主属性间接决定另一个非主属性</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 阶段 4: 第二范式 (2NF) */}
      {stageIndex === 3 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#10b981', fontSize: '1rem', fontWeight: 'bold' }}>2NF：消除对主键的“部分函数依赖”</span>
            <span style={{ background: '#10b981', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              拆分为单事实表
            </span>
          </div>

          <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px' }}>
              <div style={{ background: '#0f172a', padding: '8px', borderRadius: '6px', border: '1px solid #10b981', textAlign: 'center' }}>
                <strong style={{ color: '#10b981', fontSize: '0.85rem' }}>学生表</strong>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px' }}>学号 (PK) · 姓名 · 院系</div>
              </div>
              <div style={{ background: '#0f172a', padding: '8px', borderRadius: '6px', border: '1px solid #10b981', textAlign: 'center' }}>
                <strong style={{ color: '#10b981', fontSize: '0.85rem' }}>课程表</strong>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px' }}>课程号 (PK) · 课程名 · 教师</div>
              </div>
              <div style={{ background: '#0f172a', padding: '8px', borderRadius: '6px', border: '1.5px solid #38bdf8', textAlign: 'center' }}>
                <strong style={{ color: '#38bdf8', fontSize: '0.85rem' }}>选课关系表</strong>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px' }}>(学号, 课程号) · 成绩</div>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#34d399', textAlign: 'center' }}>
              学生事实与课程事实独立存放，成功消除插入异常与删除异常！
            </div>
          </div>
        </div>
      )}

      {/* 阶段 5: 第三范式 (3NF) */}
      {stageIndex === 4 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#a855f7', fontSize: '1rem', fontWeight: 'bold' }}>3NF：消除非主属性间的“传递函数依赖”</span>
            <span style={{ background: '#a855f7', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              彻底解耦
            </span>
          </div>

          <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginBottom: '12px' }}>
              <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', border: '1px solid #38bdf8', textAlign: 'center' }}>
                <strong style={{ color: '#38bdf8', fontSize: '0.9rem' }}>学生表</strong>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '4px' }}>学号 (PK) · 姓名 · 院系 (FK)</div>
              </div>
              <span style={{ color: '#a855f7', fontWeight: 'bold', fontSize: '1.2rem' }}>➔ 独立 ➔</span>
              <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', border: '1.5px solid #a855f7', textAlign: 'center' }}>
                <strong style={{ color: '#a855f7', fontSize: '0.9rem' }}>院系表</strong>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '4px' }}>院系 (PK) · 院系电话</div>
              </div>
            </div>

            <div style={{ background: '#0f172a', padding: '8px 12px', borderRadius: '4px', fontSize: '0.8rem', color: '#cbd5e1' }}>
              院系电话只属于“院系”实体，在院系表中仅保存 1 次！修改电话只需改 1 行，彻底根除修改异常！
            </div>
          </div>
        </div>
      )}

      {/* 阶段 6: 无损连接与反范式权衡 */}
      {stageIndex === 5 && (
        <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#f59e0b', fontSize: '1rem', fontWeight: 'bold' }}>无损连接分解与工程反范式权衡</span>
            <span style={{ background: '#f59e0b', color: '#1e293b', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Lossless Join
            </span>
          </div>

          <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: '#0f172a', padding: '10px', borderRadius: '6px', borderLeft: '4px solid #10b981' }}>
                <strong style={{ color: '#10b981', fontSize: '0.85rem' }}>无损连接与依赖保持</strong>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '2px' }}>
                  通过公共主外键进行自然连接，可以 100% 还原原始信息，既不丢失数据也不产生虚假元组。
                </div>
              </div>

              <div style={{ background: '#0f172a', padding: '10px', borderRadius: '6px', borderLeft: '4px solid #f59e0b' }}>
                <strong style={{ color: '#f59e0b', fontSize: '0.85rem' }}>反范式化 (Denormalization)</strong>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '2px' }}>
                  范式越高拆表越细，查询时的 JOIN 成本越高。互联网高并发读场景常适度容忍冗余以提升读取速度。
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SchemaTable({ table, active }) { return <div className="schema-table"><header><strong>{table.name}</strong><span>{table.note}</span></header><div className="schema-columns">{table.columns.map((column) => <div className={`${table.keys.includes(column) ? 'key' : ''} ${active.from.includes(column) ? 'determinant' : ''} ${active.to.includes(column) ? 'dependent' : ''}`} key={column}><b>{table.keys.includes(column) ? 'PK' : '•'}</b><span>{column}</span></div>)}</div>{table.rows && <div className="schema-preview">{table.rows.map((row, index) => <p key={index}>{table.columns.slice(0, 3).map((column) => row[column]).join(' · ')}</p>)}</div>}</div> }
function normalizedTables(level) {
  if (level === 1) return [{ name: '选课记录', note: '主键：(学号, 课程号)', columns: ['学号','姓名','院系','院系电话','课程号','课程名','教师','成绩'], keys: ['学号','课程号'], rows: ROWS }]
  const base = [{ name: '学生', note: '一个学生只保存一次', columns: ['学号','姓名','院系',...(level === 2 ? ['院系电话'] : [])], keys: ['学号'] }, { name: '课程', note: '课程事实独立维护', columns: ['课程号','课程名','教师'], keys: ['课程号'] }, { name: '选课', note: '只保存学生与课程的联系', columns: ['学号','课程号','成绩'], keys: ['学号','课程号'] }]
  if (level === 3) base.splice(2, 0, { name: '院系', note: '消除院系的传递依赖', columns: ['院系','院系电话'], keys: ['院系'] })
  return base
}
function anomalySolvedAt(value) { return value === 'update' ? 3 : 2 }
function anomalyText(value, level) { if (value === 'update') return level >= 3 ? '院系电话只在院系表修改一次，不会出现同一院系多个号码。' : '同一院系电话重复在多行中，漏改一行就会产生不一致。'; if (value === 'insert') return level >= 2 ? '课程信息可以先写入课程表，不必等待学生选课。' : '没有学生选课时，无法单独录入一门新课程。'; return level >= 2 ? '删除最后一条选课记录不会同时删除课程定义。' : '删除某课程最后一条选课记录，可能把课程信息一并丢失。' }
