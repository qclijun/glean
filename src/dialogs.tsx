import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, ArrowUpRight, Bookmark, Calculator, Check, CheckCircle2, Clock3, ExternalLink, FileText, Globe2, Info, Link2, ShieldCheck, Sparkles, X } from 'lucide-react'
import type { Campaign } from './model'
import { dimensionLabels, estimateNet, score, weights } from './model'
import { campaigns, SNAPSHOT } from './data'
import { ProjectMark, Score } from './components'
import { useStoredList } from './storage'

export type DialogKind = 'detail' | 'calculator' | 'method' | 'sources' | 'submit' | 'help'
type Props = { kind: DialogKind; campaign: Campaign | null; saved: string[]; onSave: (id: string) => void; onClose: () => void; onToast: (message: string) => void }
const titles: Record<DialogKind, string> = { detail: '活动研究详情', calculator: '算一算，值不值得参与', method: '每一个分数，都有依据', sources: '好研究，从来源开始', submit: '分享一个好机会', help: '欢迎来到 Glean 拾穗' }

export function Dialogs(props: Props) {
  const { kind, campaign, onClose } = props
  const panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.focus()
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        const elements = panel.current?.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex="0"]')
        if (!elements?.length) return
        const first = elements[0], last = elements[elements.length - 1]
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', handleKey); previousFocus?.focus() }
  }, [onClose])

  return <div className="dialog-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}><div className={`dialog-panel ${kind === 'detail' ? 'detail-panel' : ''}`} ref={panel} role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabIndex={-1}>
    <div className="dialog-header"><span><span className="dialog-eyebrow">GLEAN RESEARCH</span><h2 id="dialog-title">{titles[kind]}</h2></span><button className="icon-button" aria-label="关闭弹窗" onClick={onClose}><X size={21}/></button></div>
    <div className="dialog-content">
      {kind === 'detail' && campaign && <Detail campaign={campaign} saved={props.saved.includes(campaign.id)} onSave={() => props.onSave(campaign.id)}/>}
      {kind === 'calculator' && <NetCalculator/>}
      {kind === 'method' && <Method/>}
      {kind === 'sources' && <Sources/>}
      {kind === 'submit' && <Submission onToast={props.onToast}/>}
      {kind === 'help' && <Help/>}
    </div>
  </div></div>
}

function Detail({ campaign: c, saved, onSave }: { campaign: Campaign; saved: boolean; onSave: () => void }) {
  const [completed, toggleCompleted] = useStoredList(`glean-steps-${c.id}`)
  return <>
    <div className="detail-identity"><ProjectMark campaign={c}/><div><span>{c.project} · {c.network}</span><h3>{c.name}</h3></div><Score campaign={c} large/></div>
    <p className="detail-description">{c.description}</p>
    <div className="detail-summary"><div><small>潜在奖励</small><strong>{c.reward}</strong><span>{c.rewardNote}</span></div><div><small>参与成本</small><strong>{c.cost}</strong><span>{c.costNote}</span></div><div><small>时间投入</small><strong>{c.status === 'ended' ? '历史活动' : c.id === 'tapeout' ? '待确认' : `约 ${c.minutes} 分钟`}</strong><span>{c.timeNote}</span></div></div>
    <section className="editor-note"><h4><Sparkles size={16}/> 拾穗观察</h4><p>{c.assessment}</p></section>
    <h4 className="detail-section-title">推荐指数拆解 <span>编辑规则评分 · 非收益预测</span></h4>
    <div className="dimension-list">{dimensionLabels.map((label, i) => <div key={label}><span>{label}<small>{weights[i] * 100}%</small></span><div className="dimension-track"><i style={{ width: `${c.dimensions[i]}%` }}/></div><b>{c.dimensions[i]}</b></div>)}</div>
    <p className="fine-print">{c.status === 'ended' ? '活动已结束，推荐指数不计分。' : c.unknownReward ? `加权原始分 ${Math.round(c.dimensions.reduce((sum, value, i) => sum + value * weights[i], 0))}，单人现金收益未知最高 69，高风险或未开放最高 49；当前为 ${score(c)} 分。` : '得分反映规则透明度、成本、时间、风险和证据。实物奖励不等于现金回报。'}</p>
    <h4 className="detail-section-title"><ShieldCheck size={16}/> 参与前需要知道</h4><ul className="risk-list">{c.risks.map(r => <li key={r}>{r}</li>)}</ul>
    <h4 className="detail-section-title">{c.status === 'ended' ? '研究记录' : '参与清单'}<span>勾选记录仅保存在本机</span></h4>
    <div className="step-list">{c.steps.map((step, i) => <label key={step} className={completed.includes(String(i)) ? 'complete' : ''}><input type="checkbox" checked={completed.includes(String(i))} onChange={() => toggleCompleted(String(i))}/><span className="step-number">{completed.includes(String(i)) ? <Check size={12}/> : i + 1}</span><span>{step}</span></label>)}</div>
    <h4 className="detail-section-title"><Link2 size={15}/> 证据与来源 <span>查阅于 {SNAPSHOT}</span></h4>
    <div className="source-list">{c.sources.map(source => <a href={source.url} target="_blank" rel="noopener noreferrer" key={source.url}><Globe2 size={16}/><span><strong>{source.label}</strong><small>{new URL(source.url).hostname} · {source.kind === 'official' ? '平台官方来源' : source.kind === 'project' ? '项目自述，非安全审计' : '社区来源，待交叉核验'}</small></span><ArrowUpRight size={16}/></a>)}</div>
    <div className="detail-actions"><button className={`button ${saved ? 'saved-detail' : 'secondary'}`} onClick={onSave}><Bookmark size={16} fill={saved ? 'currentColor' : 'none'}/>{saved ? '已加入收藏' : '收藏这个活动'}</button><a className="button dark" href={c.sources[0].url} target="_blank" rel="noopener noreferrer">{c.status === 'ended' ? '查看历史来源' : '阅读原始规则'}<ArrowUpRight size={16}/></a></div>
    <p className="fine-print">本站不连接钱包、不代为签名。最终费用、资格和活动状态以项目最新规则及钱包预览为准。</p>
  </>
}

function NetCalculator() {
  const [values, setValues] = useState({ reward: '', probability: '20', gas: '0.05', fees: '0', minutes: '5', hourly: '10' })
  const fields = [
    { key: 'reward', label: '中奖后可变现奖励', unit: 'USD', hint: '未知时留空，不把代币数量当美元收益' },
    { key: 'probability', label: '获奖概率假设', unit: '%', hint: '手动假设，并非项目实际中奖率' },
    { key: 'gas', label: 'Gas 费用', unit: 'USD', hint: '按钱包实际预览填写' },
    { key: 'fees', label: '其他直接费用', unit: 'USD', hint: '包括手续费、兑换及跨链费用' },
    { key: 'minutes', label: '总时间投入', unit: '分钟', hint: '持续任务请计入每日累计时间' },
    { key: 'hourly', label: '每小时的时间价值', unit: 'USD', hint: '你为这段时间设定的机会成本' },
  ] as const
  const known = values.reward.trim() !== '' && values.probability.trim() !== ''
  const net = estimateNet(Number(values.reward), Number(values.probability), Number(values.gas), Number(values.fees), Number(values.minutes) / 60, Number(values.hourly))
  return <><p className="dialog-intro">把时间也算进成本。这里的结果来自你的假设，不是平台承诺或实时收益预测。</p><div className="calculator-fields">{fields.map(field => <label key={field.key}>{field.label}<span className="number-field"><input type="number" min="0" max={field.key === 'probability' ? 100 : undefined} step="any" placeholder={field.key === 'reward' ? '未知' : '0'} value={values[field.key]} onChange={e => { const n = e.target.value; if (n === '' || (Number.isFinite(Number(n)) && Number(n) >= 0 && (field.key !== 'probability' || Number(n) <= 100))) setValues({ ...values, [field.key]: n }) }}/><span>{field.unit}</span></span><small>{field.hint}</small></label>)}</div>
    <div className={`net-result ${known && net < 0 ? 'negative' : ''}`}><span><Calculator size={17}/> 预期净收益</span><strong>{known ? `${net < 0 ? '−' : '+'}$${Math.abs(net).toFixed(2)}` : 'UNKNOWN'}</strong><p>{known ? '此结果未计入本金损失、合约风险与代币价格波动。' : '奖励或中奖率未知时，无法计算可靠的预期净收益。'}</p></div><div className="formula">预期净收益 = 可变现奖励 × 获奖概率 − Gas − 其他费用 − 时间成本</div><button className="plain-link" onClick={() => setValues({ reward: '30', probability: '20', gas: '0.05', fees: '0', minutes: '5', hourly: '10' })}>填入一个演算示例 <ArrowRight size={13}/></button><p className="fine-print">示例为纯假设数字，与 Ptah 或其他活动实际回报无关。锁定本金不是直接费用，但应另计资金占用与可能损失。</p></>
}

function Method() {
  return <><p className="dialog-intro">推荐指数衡量一个活动是否值得进一步研究。它由编辑规则计算，关注参与效率与信息质量，不代表收益率、中奖率或安全认证。</p><div className="method-grid">{dimensionLabels.map((label, i) => <div key={label}><span>0{i + 1}</span><strong>{label}</strong><b>{weights[i] * 100}%</b><p>{['奖励类型、发放规则与可实现价值是否清楚。', '铸造、Gas、手续费和资金占用的负担。', '首次操作与持续维护所需的时间。', '授权范围、合约、流动性及参与条件的可控程度。', '是否有可访问的原始规则，以及独立验证的完整度。'][i]}</p></div>)}</div><div className="formula">推荐指数 = Σ（维度得分 × 对应权重）</div><div className="info-box"><Info size={17}/><div><strong>未知不会被当作零风险。</strong><p>单人现金收益未知的活动最高 69 分；高风险或未开放最高 49 分；活动结束后停止计分。资料缺失会降低相关维度分数。全部维度分数均为编辑判断，详情逐项公开。</p></div></div><div className="score-legend"><span><b>70–100</b>优先研究</span><span><b>50–69</b>有条件关注</span><span><b>0–49</b>谨慎观察</span></div><h4 className="detail-section-title">Relic 和 Proof of Agent 为什么分开？</h4><p className="body-copy">Relic 可交易，但首发铸造已结束，因此归档并停止计分。POA 是不可转让的另一种卡片，可用于每日奖励抽选；其单人现金收益未知，因此评分封顶 69。两者的规则、成本和收益逻辑不同。</p></>
}

function Sources() {
  const sources = [...new Map(campaigns.flatMap(c => c.sources).map(s => [s.url, s])).values()]
  return <><p className="dialog-intro">当前版本为人工整理的研究快照，查阅日期 {SNAPSHOT}。不宣称自动抓取、实时价格或已完成合约审计。</p><div className="source-policy"><div><ShieldCheck size={20}/><strong>优先原始规则</strong><p>平台官方公告与项目自述分别标记。</p></div><div><FileText size={20}/><strong>保留不确定性</strong><p>传闻、预估和已确认事实分开显示。</p></div><div><Clock3 size={20}/><strong>明确时间范围</strong><p>状态只代表快照时点，参与前重新确认。</p></div></div><div className="info-box"><Info size={17}/><div><strong>X 查询说明</strong><p>已尝试搜索 X，但直读渠道需要登录。本版使用可公开检索的内容及项目原始页面交叉核对；未声称取得需登录的原帖全文。</p></div></div><div className="source-list all-sources">{sources.map(s => <a href={s.url} target="_blank" rel="noopener noreferrer" key={s.url}><Globe2 size={16}/><span><strong>{s.label}</strong><small>{new URL(s.url).hostname} · {s.kind === 'official' ? '平台官方' : s.kind === 'project' ? '项目自述' : '社区 / 生态汇总'}</small></span><ExternalLink size={15}/></a>)}</div></>
}

function Submission({ onToast }: { onToast: (message: string) => void }) {
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', url: '', notes: '' })
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError('')
    try { const url = new URL(form.url); if (url.protocol !== 'https:' || !url.hostname.includes('.')) { setError('请填写有效的 HTTPS 活动规则链接。'); return } } catch { setError('请填写有效的 HTTPS 活动规则链接。'); return }
    try {
      const raw: unknown = JSON.parse(localStorage.getItem('glean-submissions-v1') || '[]')
      const existing = Array.isArray(raw) ? raw : []
      localStorage.setItem('glean-submissions-v1', JSON.stringify([...existing, { ...form, status: 'local-draft', createdAt: new Date().toISOString() }]))
      setDone(true); onToast('线索已保存到当前浏览器')
    } catch { setError('浏览器存储不可用，未能保存。请检查隐私或存储设置。') }
  }
  if (done) return <div className="submission-success"><CheckCircle2 size={42}/><h3>好线索，已记下。</h3><p>「{form.name}」已保存在当前浏览器的待审核草稿中。<br/>当前版本没有服务端收件，尚未发送给网站运营者。</p><button className="button dark" onClick={() => { setDone(false); setForm({ name: '', url: '', notes: '' }) }}>继续保存线索 <ArrowRight size={15}/></button></div>
  return <><p className="dialog-intro">分享你发现的奖励活动和原始规则。当前版本保存为本地待审核草稿，不会直接公开，也不会发送到服务器。</p><form className="submission-form" onSubmit={submit}><label>活动名称 <span>*</span><input required maxLength={100} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="例如：Ptah Proof of Agent"/></label><label>原始规则链接 <span>*</span><input required type="url" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..."/></label><label>为什么值得关注？<textarea maxLength={2000} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="奖励、参与成本、时间、截止日期或需要注意的风险……" rows={4}/></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="info-box"><ShieldCheck size={17}/><p>请勿填写私钥、助记词或任何账户凭证。我们只需要公开活动信息。</p></div><button className="button dark" type="submit">保存本地线索 <ArrowUpRight size={15}/></button></form></>
}

function Help() {
  return <><div className="help-hero"><Sparkles size={28}/><h3>从信息里，拾到值得的机会。</h3><p>Glean 是一个独立的 Web3 活动研究工作台，帮助你在参与前看清投入与不确定性。</p></div><div className="help-steps"><div><SearchIcon/><span><strong>先找适合自己的</strong><p>通过类别、网络、风险与耗时筛选活动。进行中状态以研究快照为准。</p></span></div><div><ShieldCheck size={20}/><span><strong>读规则，再做决定</strong><p>打开活动详情查看评分、风险与原始来源。未知收益会明确标记。</p></span></div><div><Bookmark size={20}/><span><strong>留在自己的观察清单</strong><p>收藏、参与清单和提交草稿只保存在当前浏览器。清理站点数据会移除这些记录。</p></span></div></div><div className="info-box"><Info size={17}/><p>这是人工策展的首版工作台，尚无账户、自动采集或钱包交易功能。按钮“阅读原始规则”会打开外部网站，由你自行判断参与。</p></div></>
}
function SearchIcon() { return <Globe2 size={20}/> }
