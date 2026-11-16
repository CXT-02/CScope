import React, { useEffect, useMemo, useState } from 'react'
import { ExperimentHeader } from './AttentionExperiment'
import DatabaseStory from './DatabaseStory'
import LearningCycle from './LearningCycle'

const STORY = [
  ['事务', '事务把多条读写操作包装成一个逻辑整体', '要么全部提交生效，要么失败后全部回滚。', '转账、下单等业务不能停留在只完成一半的状态。'],
  ['并发', '多个事务交错执行能提高吞吐量', '等待磁盘或网络时，数据库可以让其他事务继续工作。', '并发带来性能，也带来脏读、不可重复读和丢失更新。'],
  ['锁', '共享锁保护读取，排他锁保护写入', '不兼容的锁请求必须等待，直到持有者提交或回滚。', '锁把危险的并发交错转化为可控的等待。'],
  ['隔离级别', '不同隔离级别允许不同程度的并发可见性', '级别越高，读到的数据越稳定，但等待与维护成本通常越高。', '业务应根据一致性要求选择隔离级别，而不是一律选最高。'],
  ['MVCC', '多版本并发控制让读操作查看合适的历史版本', '读者和写者不必总是互相阻塞。', '现代数据库常把版本快照与锁结合使用。'],
  ['死锁', '两个事务循环等待对方持有的资源', '数据库会检测等待图中的环，并回滚其中一个事务。', '统一加锁顺序和缩短事务能降低死锁概率。'],
]
const SCENARIOS = {
  dirty: { label: '脏读', initial: 1000, steps: [['T1','BEGIN','开启转账事务'],['T1','WRITE 800','余额修改为 800，但尚未提交'],['T2','READ','尝试读取余额'],['T1','ROLLBACK','T1 回滚，余额恢复 1000'],['T2','COMMIT','T2 结束']] },
  repeat: { label: '不可重复读', initial: 1000, steps: [['T1','READ','第一次读取余额'],['T2','WRITE 1200','T2 修改余额'],['T2','COMMIT','T2 提交'],['T1','READ','T1 再次读取同一行'],['T1','COMMIT','T1 结束']] },
  lost: { label: '丢失更新', initial: 1000, steps: [['T1','READ','读取 1000，准备增加 100'],['T2','READ','也读取 1000，准备减少 200'],['T1','WRITE 1100','T1 写入计算结果'],['T2','WRITE 800','T2 的旧值计算覆盖 T1'],['SYS','CHECK','检查最终余额']] },
  deadlock: { label: '死锁', initial: 1000, steps: [['T1','LOCK A','锁定账户 A'],['T2','LOCK B','锁定账户 B'],['T1','LOCK B','等待 T2 释放 B'],['T2','LOCK A','等待 T1 释放 A，形成环'],['SYS','ROLLBACK T2','检测死锁并回滚 T2']] },
}

export default function TransactionExperiment({ experiment }) {
  const [scenario, setScenario] = useState('dirty')
  const [isolation, setIsolation] = useState('rc')
  const timeline = useMemo(() => simulateScenario(scenario, isolation), [scenario, isolation])
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  useEffect(() => { setStep(0); setPlaying(false) }, [scenario, isolation])
  useEffect(() => { if (!playing) return undefined; const timer = setInterval(() => setStep((value) => { if (value >= timeline.length - 1) { setPlaying(false); return value } return value + 1 }), 900); return () => clearInterval(timer) }, [playing, timeline.length])
  const current = timeline[step]
  return <>
    <ExperimentHeader experiment={experiment} eyebrow="数据库实验 03" />
    <DatabaseStory title="并发控制是在正确性与并行度之间安排秩序" subtitle="让两个事务交错读写同一份数据，观察隔离级别如何决定可见版本、锁等待与异常。" steps={STORY} badge={<><strong>T1 ⇄ T2</strong><span>LOCK · VERSION · COMMIT</span></>} />
    <div className="explore-heading"><span>自由探索 · 改变异常场景与隔离级别</span><h2>让两个事务在同一条时间线上交错执行</h2><p>逐步观察数据库值、事务私有值、锁和等待状态；系统会说明当前异常是否被隔离级别阻止。</p></div>
    <div className="lab-layout db-layout"><aside className="control-panel"><div className="panel-title"><span>并发控制台</span><i>{SCENARIOS[scenario].label}</i></div><label className="field-block"><span>并发异常场景</span><select value={scenario} onChange={(e) => setScenario(e.target.value)}>{Object.entries(SCENARIOS).map(([key, item]) => <option value={key} key={key}>{item.label}</option>)}</select></label><label className="field-block"><span>事务隔离级别</span><select value={isolation} onChange={(e) => setIsolation(e.target.value)}><option value="ru">读未提交</option><option value="rc">读已提交</option><option value="rr">可重复读</option><option value="serial">可串行化</option></select></label><div className="mapping-help"><strong>{isolationLabel(isolation)}</strong><p>{isolation === 'ru' ? '允许读取其他事务尚未提交的修改，并发高但可能脏读。' : isolation === 'rc' ? '每次读取只看已提交版本，避免脏读。' : isolation === 'rr' ? '同一事务多次读取保持同一快照，避免不可重复读。' : '效果等价于事务串行执行，并发异常最少。'}</p></div><div className="step-counter"><span>调度位置</span><strong>{step + 1}/{timeline.length}</strong></div><input className="step-slider" type="range" min="0" max={timeline.length - 1} value={step} onChange={(e) => { setStep(Number(e.target.value)); setPlaying(false) }} /><div className="step-buttons"><button disabled={!step} onClick={() => setStep(step - 1)}>← 上一步</button><button disabled={step === timeline.length - 1} onClick={() => setStep(step + 1)}>下一步 →</button></div><button className="tree-play" onClick={() => { if (step === timeline.length - 1) setStep(0); setPlaying((value) => !value) }}>{playing ? '暂停调度' : '▶ 执行调度'}</button><div className={`transaction-alert ${current.blocked ? 'blocked' : current.anomaly ? 'danger' : 'safe'}`}><span>{current.blocked ? 'LOCK WAIT' : current.anomaly ? 'ANOMALY' : 'CONSISTENT'}</span><strong>{current.title}</strong><p>{current.message}</p></div></aside><section className="visual-panel transaction-visual"><div className="visual-toolbar"><div><strong>事务调度与可见性</strong><span>每一行代表一个时间片；锁等待不会修改数据库的已提交版本。</span></div><span className="source-chip">{isolationLabel(isolation)}</span></div><div className="database-value"><span>数据库已提交余额</span><strong>¥ {current.committed}</strong><i>{current.uncommitted !== null ? `未提交版本：¥ ${current.uncommitted}` : '无未提交版本'}</i></div><div className="transaction-lanes"><div className="lane-head"><strong>T1</strong><span>时间</span><strong>T2 / 系统</strong></div>{timeline.map((item, index) => <div className={`${index === step ? 'active' : ''} ${index < step ? 'done' : ''}`} key={index}><section>{item.actor === 'T1' && <><b>{item.operation}</b><small>{item.blocked ? '等待' : '执行'}</small></>}</section><i>{index + 1}</i><section>{item.actor !== 'T1' && <><b>{item.operation}</b><small>{item.blocked ? '等待' : item.actor === 'SYS' ? '系统处理' : '执行'}</small></>}</section></div>)}</div><div className="lock-board"><div><span>T1 状态</span><strong>{current.t1}</strong></div><div><span>锁 / 版本</span><strong>{current.lock}</strong></div><div><span>T2 状态</span><strong>{current.t2}</strong></div></div><div className="isolation-grid">{[['ru','读未提交'],['rc','读已提交'],['rr','可重复读'],['serial','可串行化']].map(([key,label]) => <div className={isolation === key ? 'active' : ''} key={key}><strong>{label}</strong><span>{protection(key, scenario)}</span></div>)}</div></section></div>
    <LearningCycle experimentId="transactions" prediction={{ question: '哪个隔离级别允许事务读取尚未提交的数据？', options: ['读未提交', '读已提交', '可串行化'], answer: '读未提交', explanation: ' 读未提交不屏蔽其他事务的临时修改，因此可能看到随后被回滚的数据，也就是脏读。' }} operation={{ title: '观察脏读如何被阻止', instruction: '选择“脏读”，分别使用“读未提交”和“读已提交”执行到 T2 READ，对比读到的版本。' }} observation={`当前场景为${SCENARIOS[scenario].label}，隔离级别为${isolationLabel(isolation)}；${current.blocked ? '当前操作被阻塞等待' : current.anomaly ? '当前出现并发异常' : '当前读取保持一致'}。`} summaryPrompt="隔离级别提高时，数据一致性和事务并行度分别会发生什么变化？" />
  </>
}

function simulateScenario(scenario, isolation) {
  const source = SCENARIOS[scenario]; let committed = source.initial, uncommitted = null, t1Read = null, t2Read = null
  return source.steps.map(([actor, operation, note], index) => {
    let blocked = false, anomaly = false, title = note, message = note, lock = '无', t1 = '运行', t2 = '运行'
    if (scenario === 'dirty') { if (operation === 'WRITE 800') { uncommitted = 800; lock = 'T1 持有 X 锁' } if (operation === 'READ') { if (isolation === 'ru') { t2Read = uncommitted; anomaly = true; title = `T2 读到未提交值 ${t2Read}`; message = '如果 T1 随后回滚，T2 使用的就是从未真正存在过的脏数据。' } else { t2Read = committed; blocked = isolation === 'serial'; title = blocked ? 'T2 等待 T1 完成' : `T2 只读取已提交值 ${committed}`; message = blocked ? '串行化阻止 T2 越过正在写入的事务。' : '读已提交及以上级别不会暴露 T1 的临时版本。' } } if (operation === 'ROLLBACK') uncommitted = null }
    if (scenario === 'repeat') { if (actor === 'T1' && operation === 'READ') { const second = t1Read !== null; const visible = second && (isolation === 'rr' || isolation === 'serial') ? t1Read : committed; if (!second) t1Read = visible; anomaly = second && visible !== t1Read; title = `${second ? '再次' : '首次'}读取 ${visible}`; message = anomaly ? '同一事务两次读取同一行得到不同结果，发生不可重复读。' : second ? '快照保持第一次读取的版本，因此结果稳定。' : 'T1 记录当前可见版本。' } if (operation === 'WRITE 1200') { uncommitted = 1200; blocked = isolation === 'serial'; if (blocked) { title = 'T2 等待 T1 结束'; message = '可串行化不允许本次交错写入。' } } if (actor === 'T2' && operation === 'COMMIT' && !blocked) { committed = 1200; uncommitted = null } }
    if (scenario === 'lost') { if (actor === 'T1' && operation === 'READ') t1Read = committed; if (actor === 'T2' && operation === 'READ') { t2Read = committed; blocked = isolation === 'serial' } if (operation === 'WRITE 1100') committed = 1100; if (operation === 'WRITE 800') { blocked = isolation === 'rr' || isolation === 'serial'; if (!blocked) { committed = 800; anomaly = true; title = 'T2 覆盖了 T1 的更新'; message = 'T2 基于旧值计算并写回，T1 增加的 100 丢失。' } else { title = '写冲突被检测'; message = '数据库阻止基于旧版本的覆盖写入，要求 T2 等待或重试。' } } }
    if (scenario === 'deadlock') { lock = index < 1 ? 'T1→A' : index < 2 ? 'T1→A，T2→B' : index < 3 ? 'T1 等 B' : index < 4 ? 'T1↔T2 等待环' : '释放 T2 的锁'; blocked = index === 2 || index === 3; anomaly = index === 3; if (index === 3) { title = '等待图形成环'; message = 'T1 等待 B，T2 又等待 A，任何一方都无法自行前进。' } if (index === 4) { title = 'T2 被选为死锁牺牲者'; message = '数据库回滚 T2 并释放 B，T1 可以继续执行。'; t2 = '已回滚' } }
    if (blocked) { actor === 'T1' ? t1 = '等待' : t2 = '等待'; lock = lock === '无' ? '操作等待锁或版本' : lock }
    return { actor, operation, note, committed, uncommitted, blocked, anomaly, title, message, lock, t1, t2 }
  })
}
function isolationLabel(value) { return ({ ru: '读未提交', rc: '读已提交', rr: '可重复读', serial: '可串行化' })[value] }
function protection(level, scenario) { const rank = { ru: 0, rc: 1, rr: 2, serial: 3 }[level]; const need = { dirty: 1, repeat: 2, lost: 2, deadlock: 4 }[scenario]; return need === 4 ? '仍可能死锁' : rank >= need ? '可防止' : '可能发生' }
