import { createHash } from 'node:crypto'
import { readFile, mkdir, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { XMLParser } from 'fast-xml-parser'

const root = fileURLToPath(new URL('../', import.meta.url))
const defaults = {
  sources: resolve(root, 'config/lead-sources.json'),
  output: resolve(root, '.glean/leads.json'),
}
const galxeApiUrl = 'https://graphigo-business.prd.galaxy.eco/query'
const galxeQuery = `query GetSpaceQuests($input: ListQuestInput!) {
  quests(input: $input) {
    pageInfo { hasNextPage endCursor }
    list { id name status }
  }
}`

function argumentsFrom(argv) {
  const options = { ...defaults }
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index]
    const value = argv[index + 1]
    if (!value || (key !== '--sources' && key !== '--output')) {
      throw new Error('Usage: npm run collect:leads -- [--sources FILE] [--output FILE]')
    }
    options[key.slice(2)] = resolve(value)
  }
  return options
}

function webUrl(value) {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value.trim())
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

function validateSources(config) {
  if (!Number.isInteger(config?.lookbackDays) || config.lookbackDays < 1 ||
      !Array.isArray(config.feeds) || !Array.isArray(config.galxeSpaces ?? []) ||
      !config.feeds.length && !(config.galxeSpaces?.length)) {
    throw new Error('Sources must contain positive lookbackDays and at least one feed or Galxe Space')
  }
  const ids = new Set()
  for (const feed of config.feeds) {
    if (typeof feed?.id !== 'string' || !feed.id.trim() || ids.has(feed.id) ||
        typeof feed.name !== 'string' || !feed.name.trim() || !webUrl(feed.url)) {
      throw new Error('Each feed needs a unique id, name, and HTTP(S) URL')
    }
    ids.add(feed.id)
  }
  const spaceIds = new Set()
  for (const space of config.galxeSpaces ?? []) {
    if (typeof space?.id !== 'string' || !space.id.trim() || spaceIds.has(space.id) ||
        typeof space.name !== 'string' || !space.name.trim() ||
        typeof space.slug !== 'string' || !space.slug.trim()) {
      throw new Error('Each Galxe Space needs a unique id, name, and page slug')
    }
    spaceIds.add(space.id)
  }
}

async function* galxeEntries(space, token) {
  const endpoint = process.env.GALXE_API_URL ?? galxeApiUrl
  if (!webUrl(endpoint)) throw new Error('GALXE_API_URL must be an HTTP(S) URL')
  let cursor
  const usedCursors = new Set()
  while (true) {
    const input = { spaceId: space.id, statuses: ['Active', 'NotStarted'], first: 20 }
    if (cursor) input.after = cursor
    await delay(110)
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'access-token': token },
      body: JSON.stringify({ query: galxeQuery, variables: { input } }),
      signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) throw new Error(`Galxe Space ${space.id}: HTTP ${response.status}`)
    const payload = await response.json()
    const quests = payload?.data?.quests
    if (payload.errors !== undefined || !Array.isArray(quests?.list) ||
        typeof quests?.pageInfo?.hasNextPage !== 'boolean') {
      throw new Error(`Galxe Space ${space.id}: invalid Quest API response`)
    }
    for (const quest of quests.list) {
      if (typeof quest?.id !== 'string' || !quest.id ||
          typeof quest.name !== 'string' || !quest.name.trim() ||
          !['Active', 'NotStarted'].includes(quest.status)) continue
      yield { title: quest.name, link: `https://app.galxe.com/quest/${encodeURIComponent(space.slug)}/${encodeURIComponent(quest.id)}` }
    }
    if (!quests.pageInfo.hasNextPage) return
    cursor = quests.pageInfo.endCursor
    if (typeof cursor !== 'string' || !cursor || usedCursors.has(cursor)) {
      throw new Error(`Galxe Space ${space.id}: invalid pagination cursor`)
    }
    usedCursors.add(cursor)
  }
}

function entriesFrom(xml) {
  const parsed = new XMLParser({ ignoreAttributes: false }).parse(xml)
  const container = parsed?.rss?.channel ?? parsed?.feed
  if (!container || typeof container !== 'object') throw new Error('Expected an RSS channel or Atom feed')
  const entries = container.item ?? container.entry
  if (entries === undefined) return []
  return Array.isArray(entries) ? entries : [entries]
}

function plainText(value) {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  return typeof value?.['#text'] === 'string' ? value['#text'].trim() : ''
}

function entryUrl(entry) {
  if (typeof entry.link === 'string') return webUrl(entry.link)
  const links = Array.isArray(entry.link) ? entry.link : [entry.link]
  const alternate = links.find(link => link?.['@_rel'] === 'alternate')
    ?? links.find(link => !link?.['@_rel'])
  return webUrl(alternate?.['@_href'])
}

function leadFrom(entry, feed, cutoff, discoveredAt) {
  const title = plainText(entry.title)
  const url = entryUrl(entry)
  const dateText = entry.pubDate ?? entry.published ?? entry.updated
  const date = dateText ? new Date(dateText) : null
  if (!title || !url || (date && (!Number.isFinite(date.getTime()) || date < cutoff))) return null
  const id = createHash('sha256').update(`${feed.id}\n${url}`).digest('hex')
  return {
    id,
    source: { id: feed.id, name: feed.name, url: feed.url },
    title,
    url,
    publishedAt: date?.toISOString() ?? null,
    discoveredAt,
    status: 'unverified',
  }
}

async function existingQueue(path) {
  let queue
  try {
    queue = JSON.parse(await readFile(path, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return { version: 1, leads: [] }
    throw error
  }
  if (queue?.version !== 1 || !Array.isArray(queue.leads) ||
      queue.leads.some(lead => typeof lead?.id !== 'string')) {
    throw new Error('Existing lead queue has an unsupported format')
  }
  return queue
}

async function saveQueue(path, queue) {
  await mkdir(dirname(path), { recursive: true })
  const temporary = `${path}.${process.pid}.tmp`
  try {
    await writeFile(temporary, `${JSON.stringify(queue, null, 2)}\n`, { flag: 'wx', mode: 0o600 })
    await rename(temporary, path)
  } finally {
    await rm(temporary, { force: true })
  }
}

async function main() {
  const { sources, output } = argumentsFrom(process.argv.slice(2))
  const config = JSON.parse(await readFile(sources, 'utf8'))
  validateSources(config)
  const token = process.env.GALXE_ACCESS_TOKEN
  if (config.galxeSpaces?.length && !token) {
    throw new Error('GALXE_ACCESS_TOKEN is required for configured Galxe Spaces')
  }
  const queue = await existingQueue(output)
  const seen = new Set(queue.leads.map(lead => lead.id))
  const discoveredAt = new Date().toISOString()
  const cutoff = new Date(Date.now() - config.lookbackDays * 86400000)
  let added = 0
  function enqueueLead(entry, source) {
    const lead = leadFrom(entry, source, cutoff, discoveredAt)
    if (!lead || seen.has(lead.id)) return
    seen.add(lead.id)
    queue.leads.push(lead)
    added++
  }

  for (const feed of config.feeds) {
    const response = await fetch(feed.url, { signal: AbortSignal.timeout(15000) })
    if (!response.ok) throw new Error(`${feed.id}: HTTP ${response.status}`)
    for (const entry of entriesFrom(await response.text())) {
      enqueueLead(entry, feed)
    }
  }

  if (config.galxeSpaces?.length) {
    for (const space of config.galxeSpaces) {
      const source = {
        id: `galxe:${space.id}`,
        name: `Galxe · ${space.name}`,
        url: `https://app.galxe.com/quest/${encodeURIComponent(space.slug)}`,
      }
      for await (const entry of galxeEntries(space, token)) {
        enqueueLead(entry, source)
      }
    }
  }

  if (added || !(await exists(output))) await saveQueue(output, queue)
  console.log(`Collected ${added} new leads; ${queue.leads.length} pending in ${output}`)
}

async function exists(path) {
  try {
    await readFile(path)
    return true
  } catch (error) {
    if (error.code === 'ENOENT') return false
    throw error
  }
}

main().catch(error => {
  console.error(`Lead collection failed: ${error.message}`)
  process.exitCode = 1
})
