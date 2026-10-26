export type Status = 'active' | 'upcoming' | 'ended'
export type Risk = '中低' | '中' | '高'
export type Campaign = {
  id: string; name: string; project: string; mark: string; color: string; category: string
  network: string; description: string; reward: string; rewardNote: string
  cost: string; costNote: string; mintFree: boolean; minutes: number; timeNote: string
  risk: Risk; status: Status; deadline?: string; endLabel: string
  dimensions: [number, number, number, number, number]; unknownReward: boolean
  tags: string[]; sources: { label: string; url: string; kind: 'official' | 'project' | 'community' }[]
  assessment: string; risks: string[]; steps: string[]
}

export const weights = [0.25, 0.25, 0.2, 0.2, 0.1]
export const dimensionLabels = ['奖励透明度', '成本友好度', '时间效率', '风险可控度', '证据完整度']

export function score(campaign: Campaign): number {
  if (campaign.status === 'ended') return 0
  const result = Math.round(campaign.dimensions.reduce((sum, value, i) => sum + value * weights[i], 0))
  const rewardCapped = campaign.unknownReward ? Math.min(69, result) : result
  return campaign.risk === '高' || campaign.status === 'upcoming' ? Math.min(49, rewardCapped) : rewardCapped
}

export function estimateNet(reward: number, probability: number, gas: number, fees: number, hours: number, hourlyValue: number) {
  return reward * probability / 100 - gas - fees - hours * hourlyValue
}

export function filterCampaigns(campaigns: Campaign[], options: {
  query: string; category: string; network: string; risk: string; status: string; sort: string; savedOnly?: boolean; saved: string[]
}) {
  return campaigns.filter(c => {
    const matchesQuery = `${c.name} ${c.project} ${c.description} ${c.tags.join(' ')}`.toLowerCase().includes(options.query.trim().toLowerCase())
    const category = options.category === '全部活动' || (options.category === '免费铸造' && c.mintFree) ||
      (options.category === '轻量任务' && c.minutes <= 10) || (options.category === '即将结束' && c.deadline && c.deadline <= '2026-10-29') ||
      (options.category === 'AI Agent' && c.tags.includes('AI Agent'))
    return matchesQuery && category && (options.network === '全部网络' || c.network === options.network) &&
      (options.risk === '全部风险' || c.risk === options.risk) &&
      (options.status === 'all' || c.status === options.status || (options.status === 'live' && c.status !== 'ended')) &&
      (!options.savedOnly || options.saved.includes(c.id))
  }).sort((a, b) => options.sort === '耗时最少' ? a.minutes - b.minutes : options.sort === '即将截止' ?
    (a.deadline || '9999').localeCompare(b.deadline || '9999') : score(b) - score(a))
}
