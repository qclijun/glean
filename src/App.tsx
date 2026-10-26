import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ArrowDownUp, ArrowRight, ArrowUpRight, Bell, Bookmark, Check, ChevronDown, CircleHelp, Compass, FileText, Flame, Globe2, LayoutGrid, Leaf, ListFilter, Menu, Plus, Search, ShieldCheck, SlidersHorizontal, Sparkles, Sprout, X, Zap } from 'lucide-react'
import { campaigns, SNAPSHOT } from './data'
import { filterCampaigns } from './model'
import type { Campaign } from './model'
import { CampaignCard, GleanMark, Hero } from './components'
import { Dialogs } from './dialogs'
import type { DialogKind } from './dialogs'
import { useStoredList } from './storage'

const categories = ['全部活动', '免费铸造', '轻量任务', 'AI Agent', '即将结束']

export default function App() {
  const [view, setView] = useState<'discover' | 'saved'>('discover')
  const [category, setCategory] = useState('全部活动')
  const [query, setQuery] = useState('')
  const [network, setNetwork] = useState('全部网络')
  const [risk, setRisk] = useState('全部风险')
  const [sort, setSort] = useState('推荐指数')
  const [liveOnly, setLiveOnly] = useState(false)
  const [saved, toggleSaved] = useStoredList('glean-saved-v1')
  const [dialog, setDialog] = useState<DialogKind | null>(null)
  const [selected, setSelected] = useState<Campaign | null>(null)
  const [mobileNav, setMobileNav] = useState(false)
  const [notice, setNotice] = useState(false)
  const [toast, setToast] = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const listRef = useRef<HTMLElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  useLayoutEffect(() => {
    function focusSearch(e: KeyboardEvent) { if (e.key === '/' && !dialog && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement) && !(e.target instanceof HTMLSelectElement)) { e.preventDefault(); searchRef.current?.focus() } }
    document.addEventListener('keydown', focusSearch)
    return () => document.removeEventListener('keydown', focusSearch)
  }, [dialog])
  const results = useMemo(() => filterCampaigns(campaigns, { query, category, network, risk, sort, status: liveOnly ? 'active' : 'all', savedOnly: view === 'saved', saved }), [query, category, network, risk, sort, liveOnly, view, saved])

  function flash(message: string) { setToast(message); if (toastTimer.current) clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 3000) }
  function onSave(id: string) { toggleSaved(id); flash(saved.includes(id) ? '已取消收藏' : '已加入我的收藏') }
  function open(c: Campaign) { setSelected(c); setDialog('detail') }
  function navigate(next: 'discover' | 'saved', nextCategory = '全部活动') { setView(next); setCategory(nextCategory); setMobileNav(false) }
  function resetFilters() { setQuery(''); setCategory('全部活动'); setNetwork('全部网络'); setRisk('全部风险'); setLiveOnly(false) }
  function showDialog(kind: DialogKind) { setDialog(kind); setMobileNav(false) }

  return <div className="app-shell">
    {mobileNav && <button className="nav-scrim" aria-label="关闭导航" onClick={() => setMobileNav(false)}/>}
    <aside className={`sidebar ${mobileNav ? 'mobile-open' : ''}`}>
      <a className="brand" href="#" onClick={e => { e.preventDefault(); navigate('discover'); resetFilters() }}><GleanMark/><span>glean<span className="brand-cn">拾穗</span></span><span className="beta">BETA</span></a>
      <div className="sidebar-label">发现与探索</div>
      <nav aria-label="主导航">
        <button className={view === 'discover' && category === '全部活动' ? 'active' : ''} onClick={() => navigate('discover')}><Compass size={19}/><span>机会广场</span><span className="nav-count">{campaigns.length}</span></button>
        <button className={view === 'saved' ? 'active' : ''} onClick={() => navigate('saved')}><Bookmark size={18}/><span>我的收藏</span>{saved.length > 0 && <span className="nav-count">{saved.length}</span>}</button>
      </nav>
      <div className="sidebar-label second-label">快速发现</div>
      <nav aria-label="快速筛选">
        <button className={category === '免费铸造' && view === 'discover' ? 'active' : ''} onClick={() => navigate('discover', '免费铸造')}><Zap size={18}/><span>低成本精选</span><span className="little-spark">✧</span></button>
        <button className={category === '即将结束' && view === 'discover' ? 'active' : ''} onClick={() => navigate('discover', '即将结束')}><Flame size={18}/><span>即将结束</span></button>
      </nav>
      <div className="sidebar-label second-label">研究工具</div>
      <nav aria-label="研究工具">
        <button onClick={() => showDialog('calculator')}><SlidersHorizontal size={18}/><span>收益计算器</span><ArrowUpRight size={13}/></button>
        <button onClick={() => showDialog('method')}><FileText size={18}/><span>评估方法</span></button>
        <button onClick={() => showDialog('sources')}><Globe2 size={18}/><span>数据来源</span></button>
      </nav>
      <div className="sidebar-bottom"><div className="sidebar-note"><span className="note-icon"><Sprout size={22}/></span><strong>小成本，也有好机会。</strong><p>从信息中拾穗，<br/>让每一份投入更有价值。</p><button onClick={() => showDialog('method')}>认识 Glean <ArrowUpRight size={13}/></button></div><button className="help-link" onClick={() => showDialog('help')}><CircleHelp size={16}/>使用帮助 <ArrowUpRight size={12}/></button><div className="sidebar-foot"><span>© 2026 Glean</span><span>用心筛选，理性参与</span></div></div>
    </aside>

    <div className="workspace">
      <header className="topbar"><div className="breadcrumb"><button className="mobile-menu icon-button" aria-label="打开导航" onClick={() => setMobileNav(true)}><Menu size={20}/></button><span className="breadcrumb-icon"><Compass size={16}/></span><span>发现</span><span className="slash">/</span><strong>{view === 'saved' ? '我的收藏' : '机会广场'}</strong></div><div className="topbar-actions"><span className="snapshot-label"><span/>研究快照 <b>{SNAPSHOT.replaceAll('-', '.')}</b></span><div className="notification-wrap"><button className={`icon-button notification-button ${notice ? 'selected' : ''}`} aria-label="查看更新说明" onClick={() => setNotice(!notice)}><Bell size={18}/><i/></button>{notice && <div className="notification-panel"><strong>研究台更新 <span>10.26</span></strong><p>新增 Ptah Relic 历史案例：每 ID 最多 4 枚、支持出售；已和不可转让的 POA 卡分开收录。</p><small>当前为人工整理快照，非实时行情。</small><button onClick={() => { open(campaigns[0]); setNotice(false) }}>查看 Relic <ArrowRight size={13}/></button></div>}</div><span className="top-divider"/><button className="submit-button" onClick={() => showDialog('submit')}><Plus size={15}/><span>提交活动</span></button><button className="avatar" aria-label="关于本地工作台" onClick={() => showDialog('help')}>G</button></div></header>
      <main>
        <div className="page-heading"><div><div className="page-eyebrow">THE OPPORTUNITY EDIT</div><h1>{view === 'saved' ? '留住值得关注的机会' : '机会很多，值得参与的在这里。'}<span className="heading-spark">✳</span></h1><p>{view === 'saved' ? '你的个人观察清单，收藏保存在当前浏览器。' : '筛掉噪音，发现低成本、高效率、有依据的 Web3 奖励活动。'}</p></div><button className="plain-link heading-link" onClick={() => showDialog('sources')}>查看收录标准 <ArrowUpRight size={14}/></button></div>
        {view === 'discover' && <><Hero onExplore={() => listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} onMethod={() => showDialog('method')}/><button className="case-spotlight" onClick={() => open(campaigns[0])}><span className="case-label"><Sparkles size={13}/> 机会复盘</span><strong>Ptah Relic</strong><span className="case-description">每 ID 最多 4 枚 · 可出售 · 低门槛案例</span><span className="case-status">首发已结束</span><span className="case-link">查看研究 <ArrowUpRight size={13}/></span></button></>}

        <div className="overview-strip"><div><span className="overview-icon"><LayoutGrid size={17}/></span><span>精选收录 <strong>{campaigns.length.toString().padStart(2, '0')}</strong><small>个活动</small></span></div><span className="overview-divider"/><div><span className="overview-icon"><Zap size={17}/></span><span>免费铸造 <strong>{campaigns.filter(c => c.mintFree && c.status === 'active').length.toString().padStart(2, '0')}</strong><small>个进行中</small></span></div><span className="overview-divider"/><div><span className="overview-icon"><ShieldCheck size={17}/></span><span>每项评估 <strong className="text-stat">有据可查</strong></span></div><button onClick={() => showDialog('method')}>透明评估，独立判断 <ArrowUpRight size={13}/></button></div>

        <section ref={listRef} className="opportunities" aria-label="活动列表">
          <div className="section-heading"><div><h2>{view === 'saved' ? '我的收藏' : '精选机会'}<span className="section-count">{results.length}</span></h2><p>{view === 'saved' ? '随时回来，继续你的研究。' : '不追所有热点，只看值得了解的机会。'}</p></div><button className="plain-link" onClick={() => showDialog('method')}><CircleHelp size={14}/>推荐指数怎么算？</button></div>
          <div className="category-tabs" role="tablist" aria-label="活动分类">{categories.map((cat, i) => <button key={cat} role="tab" aria-selected={category === cat} className={category === cat ? 'active' : ''} onClick={() => setCategory(cat)}>{i === 0 ? <LayoutGrid size={15}/> : i === 1 ? <Zap size={15}/> : i === 2 ? <Leaf size={15}/> : i === 3 ? <Sparkles size={15}/> : <Flame size={15}/>} {cat}{i === 0 && <span>{campaigns.length}</span>}</button>)}<div className="tabs-right"><span className="small-status-dot"/> 人工精选 · 持续研究</div></div>
          <div className="filter-bar"><div className="search-field"><Search size={16}/><input ref={searchRef} aria-label="搜索活动" placeholder="搜索活动、项目或关键词..." value={query} onChange={e => setQuery(e.target.value)}/>{query && <button className="icon-button" aria-label="清空搜索" onClick={() => setQuery('')}><X size={13}/></button>}<kbd>/</kbd></div><div className="filter-controls"><label className="select-wrap"><Globe2 size={14}/><select aria-label="筛选网络" value={network} onChange={e => setNetwork(e.target.value)}><option>全部网络</option><option>BNB Chain</option><option>X Layer / BNB</option></select><ChevronDown size={12}/></label><label className="select-wrap"><ShieldCheck size={14}/><select aria-label="筛选风险" value={risk} onChange={e => setRisk(e.target.value)}><option>全部风险</option><option value="中低">中低风险</option><option value="中">中风险</option><option value="高">高风险</option></select><ChevronDown size={12}/></label><label className="live-toggle"><input type="checkbox" checked={liveOnly} onChange={e => setLiveOnly(e.target.checked)}/><span>仅进行中</span></label><span className="filter-divider"/><label className="select-wrap sort-select"><ArrowDownUp size={13}/><select aria-label="活动排序" value={sort} onChange={e => setSort(e.target.value)}><option>推荐指数</option><option>耗时最少</option><option>即将截止</option></select><ChevronDown size={12}/></label></div></div>
          <div className="results-caption"><span>共 <b>{results.length}</b> 个活动{query && <> · 搜索「{query}」</>}</span><span><ListFilter size={12}/> {sort === '推荐指数' ? '按推荐指数排序' : `按${sort}排序`}</span></div>
          {results.length ? <div className="campaign-grid">{results.map(c => <CampaignCard key={c.id} campaign={c} saved={saved.includes(c.id)} onSave={() => onSave(c.id)} onOpen={() => open(c)}/>)}</div> : <div className="empty-state"><span><Search size={28}/></span><h3>{view === 'saved' && saved.length === 0 ? '把好机会留在这里' : '暂时没有匹配的活动'}</h3><p>{view === 'saved' && saved.length === 0 ? '点击活动卡片右上角的收藏图标，建立自己的观察清单。' : '换个关键词，或放宽筛选条件试试。'}</p><button className="button dark" onClick={() => { resetFilters(); if (!saved.length) setView('discover') }}>{view === 'saved' && saved.length === 0 ? '去发现活动' : '重置筛选'}<ArrowRight size={15}/></button></div>}
        </section>
        <div className="bottom-banner"><span className="bottom-banner-icon"><Sprout size={23}/></span><div><strong>发现了一个值得参与的活动？</strong><p>把线索分享出来，让好机会被更多人看见。</p></div><button onClick={() => showDialog('submit')}>提交活动线索 <ArrowUpRight size={15}/></button></div>
        <footer className="main-footer"><span><ShieldCheck size={13}/>独立研究，不构成投资建议。免费参与也可能产生 Gas、时间及合约风险。</span><button onClick={() => showDialog('sources')}>数据截至 {SNAPSHOT} <ArrowUpRight size={11}/></button></footer>
      </main>
    </div>
    {dialog && <Dialogs kind={dialog} campaign={selected} saved={saved} onSave={onSave} onClose={() => setDialog(null)} onToast={flash}/>}
    {toast && <div className="toast" role="status"><span><Check size={13}/></span>{toast}</div>}
  </div>
}
