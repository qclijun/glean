import { ArrowDownLeft, ArrowUpRight, Bookmark, Check, Clock3, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react'
import type { Campaign } from './model'
import { score } from './model'

export function GleanMark({ small = false }: { small?: boolean }) {
  return <svg className={small ? 'glean-mark small' : 'glean-mark'} viewBox="0 0 36 36" fill="none" aria-hidden="true"><path d="M18 2C18 11.5 24.5 18 34 18C24.5 18 18 24.5 18 34C18 24.5 11.5 18 2 18C11.5 18 18 11.5 18 2Z" fill="currentColor"/><circle cx="18" cy="18" r="3" fill="var(--mark-center, #f3f7ec)"/></svg>
}

export function ProjectMark({ campaign }: { campaign: Campaign }) {
  return <span className={`project-mark ${campaign.color}`} aria-hidden="true">{campaign.mark}</span>
}

export function Score({ campaign, large = false }: { campaign: Campaign; large?: boolean }) {
  const value = score(campaign)
  return <div className={`score ${large ? 'large' : ''} ${value < 50 ? 'muted-score' : ''}`}><strong>{campaign.status === 'ended' ? '—' : value}</strong><span>{campaign.status === 'ended' ? '已归档' : '推荐指数'}</span></div>
}

export function Hero({ onExplore, onMethod }: { onExplore: () => void; onMethod: () => void }) {
  return <section className="hero">
    <div className="hero-copy"><div className="eyebrow"><span /> LESS NOISE. MORE OPPORTUNITY.</div>
      <h2>发现机会，<br/>更要看清<span>价值。</span><svg viewBox="0 0 112 12" aria-hidden="true"><path d="M3 8Q45 -2 108 5"/></svg></h2>
      <p>聚合 Web3 奖励活动，把收益、成本和风险摊开看。<br className="desktop-br"/>花更少的时间，做更有依据的选择。</p>
      <div className="hero-actions"><button className="button dark" onClick={onExplore}>探索精选活动 <ArrowUpRight size={16}/></button><button className="text-button" onClick={onMethod}>了解评估方法 <ArrowUpRight size={14}/></button></div>
    </div>
    <div className="hero-art" aria-hidden="true">
      <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
      <div className="art-spark spark-one">✳</div><div className="art-spark spark-two">✧</div>
      <div className="floating-tag tag-time"><Clock3 size={13}/> 小投入 · 多探索</div>
      <div className="poa-card back-card"/>
      <div className="poa-card"><div className="poa-top">PTAH <span>GENESIS / ARCHIVE</span></div><div className="poa-star"><GleanMark/></div><div className="poa-bottom"><span>GENESIS COLLECTION<br/><strong>RELIC.</strong></span><ArrowUpRight size={25}/></div><div className="poa-strip">FOUR PER AGENT ID · TRADABLE</div></div>
      <div className="floating-tag tag-free"><span className="tag-check"><Check size={13}/></span><span>每个 ID <strong>4 枚</strong><small>历史活动 · 可交易</small></span></div>
      <span className="art-caption">Good opportunities. Clear perspectives.</span>
    </div>
  </section>
}

export function CampaignCard({ campaign: c, saved, onSave, onOpen }: { campaign: Campaign; saved: boolean; onSave: () => void; onOpen: () => void }) {
  const status = c.status === 'active' ? '进行中' : c.status === 'upcoming' ? '待开放' : '已结束'
  return <article className={`campaign-card ${c.id === 'ptah-poa' ? 'featured-card' : ''} ${c.status === 'ended' ? 'ended-card' : ''}`}>
    {c.id === 'ptah-poa' && <div className="card-ribbon"><Sparkles size={12}/> 轻量观察 <span>免费铸造 · 收益待定</span></div>}
    <div className="card-inner">
      <div className="card-top"><div className="project-identity"><ProjectMark campaign={c}/><div><span className="project-name">{c.project}</span><span className="network"><i/> {c.network}</span></div></div><button className={`icon-button save-button ${saved ? 'is-saved' : ''}`} onClick={onSave} aria-label={`${saved ? '取消收藏' : '收藏'} ${c.name}`} title={saved ? '取消收藏' : '收藏活动'}><Bookmark size={17} fill={saved ? 'currentColor' : 'none'}/></button></div>
      <div className="card-title-row"><h3><button onClick={onOpen}>{c.name}</button></h3></div>
      <p className="card-description">{c.description}</p>
      <div className="card-tags"><span>{c.category}</span><span className={`risk risk-${c.risk}`}>{c.risk === '中低' ? <ShieldCheck size={11}/> : <span className="risk-dot"/>}{c.risk}风险</span><span className={`activity-status ${c.status}`}><i/>{status}</span></div>
      <div className="reward-block"><span className="metric-label">潜在奖励 <ArrowUpRight size={12}/></span><strong>{c.reward}</strong><small>{c.rewardNote}</small></div>
      <div className="card-metrics"><div><span className="metric-label"><ArrowDownLeft size={12}/> 参与成本</span><strong className={c.mintFree ? 'green-text' : ''}>{c.cost}</strong><small>{c.costNote}</small></div><div><span className="metric-label"><Clock3 size={12}/> 预计耗时</span><strong>{c.status === 'ended' ? '历史记录' : c.id === 'tapeout' ? '待确认' : `≈ ${c.minutes} 分钟`}</strong><small>{c.id === 'ptah-poa' ? '首次参与 · 需每日分享' : '编辑估计，因人而异'}</small></div></div>
      <div className="card-footer"><Score campaign={c}/><button className="detail-button" onClick={onOpen}>查看详情 <ArrowUpRight size={14}/></button></div>
      <div className="card-bottom"><span><Clock3 size={11}/>{c.endLabel}</span><span title="来源类型不代表合约安全审计">{c.sources[0].kind === 'official' ? <><ShieldCheck size={11}/>官方来源</> : c.sources[0].kind === 'project' ? <><ExternalLink size={10}/>项目规则</> : '社区线索'}</span></div>
    </div>
  </article>
}
