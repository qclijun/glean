import { test } from 'node:test'
import assert from 'node:assert/strict'
import { campaigns } from '../src/data.ts'
import { estimateNet, filterCampaigns, score, weights } from '../src/model.ts'

const defaults = { query: '', category: '全部活动', network: '全部网络', risk: '全部风险', status: 'all', sort: '推荐指数', saved: [] as string[] }

test('unknown cash rewards cap the recommendation; ended mints never earn a current score', () => {
  assert.ok(Math.abs(weights.reduce((sum, n) => sum + n, 0) - 1) < Number.EPSILON)
  const poa = campaigns.find(c => c.id === 'ptah-poa')!
  assert.equal(score(poa), 69)
  assert.equal(score({ ...poa, dimensions: [100, 100, 100, 100, 100] }), 69)
  assert.equal(score({ ...poa, risk: '高', dimensions: [100, 100, 100, 100, 100] }), 49)
  assert.equal(score(campaigns.find(c => c.id === 'ptah-relic')!), 0)
})

test('Relic and POA preserve their different economics and transfer restrictions', () => {
  const relic = campaigns.find(c => c.id === 'ptah-relic')!
  const poa = campaigns.find(c => c.id === 'ptah-poa')!
  assert.equal(relic.status, 'ended')
  assert.equal(relic.mintFree, false)
  assert.match(relic.reward, /可交易/)
  assert.equal(poa.mintFree, true)
  assert.ok(poa.risks.some(risk => risk.includes('不可转售')))
})

test('network, risk, live status, category and saved filters intersect', () => {
  const found = filterCampaigns(campaigns, { ...defaults, network: 'BNB Chain', risk: '中', status: 'active', category: '免费铸造', savedOnly: true, saved: ['ptah-poa', 'ptah-relic'] })
  assert.deepEqual(found.map(c => c.id), ['ptah-poa'])
  assert.equal(filterCampaigns(campaigns, { ...defaults, query: 'impossible campaign' }).length, 0)
  assert.equal(filterCampaigns(campaigns, { ...defaults, network: 'X Layer / BNB', risk: '中低' }).length, 0)
})

test('search is case insensitive and includes project names and tags', () => {
  assert.ok(filterCampaigns(campaigns, { ...defaults, query: '  rELic  ' }).some(c => c.id === 'ptah-relic'))
  assert.deepEqual(filterCampaigns(campaigns, { ...defaults, query: '每 ID 4 枚' }).map(c => c.id), ['ptah-relic'])
})

test('expected net includes probability, transaction fees and opportunity cost', () => {
  assert.ok(Math.abs(estimateNet(30, 20, .05, 0, 5 / 60, 10) - 5.1166666667) < .000001)
  assert.equal(estimateNet(10, 0, 1, 2, 1, 10), -13)
  assert.equal(estimateNet(0, 100, 0, 0, 0, 0), 0)
})
