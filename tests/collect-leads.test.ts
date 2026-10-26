import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const collector = fileURLToPath(new URL('../tools/collect-leads.mjs', import.meta.url))

function runCollector(sources: string, output: string, env: Record<string, string> = {}): Promise<{ code: number | null; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [collector, '--sources', sources, '--output', output], { env: { ...process.env, ...env } })
    let stderr = ''
    child.stderr.setEncoding('utf8').on('data', chunk => { stderr += chunk })
    child.on('error', reject)
    child.on('close', code => resolve({ code, stderr }))
  })
}

test('official RSS items enter the internal lead queue once, within the configured lookback', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'glean-leads-'))
  const recent = new Date().toUTCString()
  const old = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toUTCString()
  let body = `<?xml version="1.0"?><rss version="2.0"><channel><title>Official Updates</title>
    <item><title>Grant &amp; Funding Round</title><link>https://example.org/grant</link><pubDate>${recent}</pubDate></item>
    <item><title>Old round</title><link>https://example.org/old</link><pubDate>${old}</pubDate></item>
  </channel></rss>`
  const server = createServer((_request, response) => { response.writeHead(200, { 'content-type': 'application/rss+xml' }); response.end(body) })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  try {
    const address = server.address()
    assert.ok(address && typeof address !== 'string')
    const feedUrl = `http://127.0.0.1:${address.port}/rss`
    const sources = join(directory, 'sources.json')
    const output = join(directory, 'leads.json')
    await writeFile(sources, JSON.stringify({ lookbackDays: 30, feeds: [{ id: 'official-updates', name: 'Official Updates', url: feedUrl }] }))

    const first = await runCollector(sources, output)
    assert.equal(first.code, 0, first.stderr)
    const firstQueue = JSON.parse(await readFile(output, 'utf8'))
    assert.equal(firstQueue.version, 1)
    assert.equal(firstQueue.leads.length, 1)
    assert.equal(firstQueue.leads[0].title, 'Grant & Funding Round')
    assert.equal(firstQueue.leads[0].url, 'https://example.org/grant')
    assert.equal(firstQueue.leads[0].source.id, 'official-updates')
    assert.equal(firstQueue.leads[0].status, 'unverified')
    assert.ok(firstQueue.leads[0].discoveredAt)

    const second = await runCollector(sources, output)
    assert.equal(second.code, 0, second.stderr)
    assert.deepEqual(JSON.parse(await readFile(output, 'utf8')), firstQueue)

    body = body.replace('</channel>', `<item><title>New bounty</title><link>https://example.org/bounty</link><pubDate>${recent}</pubDate></item></channel>`)
    const third = await runCollector(sources, output)
    assert.equal(third.code, 0, third.stderr)
    const nextQueue = JSON.parse(await readFile(output, 'utf8'))
    assert.equal(nextQueue.leads.length, 2)
    assert.deepEqual(nextQueue.leads.find((lead: { url: string }) => lead.url === 'https://example.org/grant'), firstQueue.leads[0])
  } finally {
    server.close()
    await rm(directory, { recursive: true, force: true })
  }
})

test('Galxe quests from a known Space enter the same queue across pages and dedupe on rerun', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'glean-galxe-'))
  const cursors: Array<string | null> = []
  const server = createServer(async (request, response) => {
    let body = ''
    for await (const chunk of request) body += chunk
    const payload = JSON.parse(body)
    assert.equal(request.headers['access-token'], 'test-token')
    assert.equal(payload.variables.input.spaceId, '40')
    assert.deepEqual(payload.variables.input.statuses, ['Active', 'NotStarted'])
    const cursor = payload.variables.input.after ?? null
    cursors.push(cursor)
    response.writeHead(200, { 'content-type': 'application/json' })
    response.end(JSON.stringify({ data: { quests: cursor
      ? { list: [{ id: 'quest-2', name: 'Points quest', status: 'NotStarted' }], pageInfo: { hasNextPage: false, endCursor: 'page-2' } }
      : { list: [{ id: 'quest-1', name: 'Airdrop quest', status: 'Active' }], pageInfo: { hasNextPage: true, endCursor: 'page-1' } },
    } }))
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  try {
    const address = server.address()
    assert.ok(address && typeof address !== 'string')
    const sources = join(directory, 'sources.json')
    const output = join(directory, 'leads.json')
    await writeFile(sources, JSON.stringify({ lookbackDays: 30, feeds: [], galxeSpaces: [
      { id: '40', name: 'Galxe', slug: 'Galxe' },
    ] }))
    const env = { GALXE_ACCESS_TOKEN: 'test-token', GALXE_API_URL: `http://127.0.0.1:${address.port}/query` }

    const first = await runCollector(sources, output, env)
    assert.equal(first.code, 0, first.stderr)
    const queue = JSON.parse(await readFile(output, 'utf8'))
    assert.equal(queue.leads.length, 2)
    assert.deepEqual(queue.leads.map((lead: { url: string }) => lead.url), [
      'https://app.galxe.com/quest/Galxe/quest-1',
      'https://app.galxe.com/quest/Galxe/quest-2',
    ])
    assert.equal(queue.leads[0].source.id, 'galxe:40')
    assert.ok(queue.leads.every((lead: { status: string }) => lead.status === 'unverified'))
    assert.deepEqual(cursors, [null, 'page-1'])

    const second = await runCollector(sources, output, env)
    assert.equal(second.code, 0, second.stderr)
    assert.deepEqual(JSON.parse(await readFile(output, 'utf8')), queue)
  } finally {
    server.close()
    await rm(directory, { recursive: true, force: true })
  }
})

test('a configured Galxe Space without a token fails before fetching and preserves the queue', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'glean-galxe-token-'))
  try {
    const sources = join(directory, 'sources.json')
    const output = join(directory, 'leads.json')
    const original = JSON.stringify({ version: 1, leads: [{ id: 'existing', status: 'reviewed' }] })
    await writeFile(output, original)
    await writeFile(sources, JSON.stringify({ lookbackDays: 30,
      feeds: [{ id: 'offline', name: 'Offline', url: 'http://127.0.0.1:1/rss' }],
      galxeSpaces: [{ id: '40', name: 'Galxe', slug: 'Galxe' }],
    }))

    const result = await runCollector(sources, output, { GALXE_ACCESS_TOKEN: '' })
    assert.notEqual(result.code, 0)
    assert.match(result.stderr, /GALXE_ACCESS_TOKEN is required/)
    assert.equal(await readFile(output, 'utf8'), original)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('Atom entries are collected; a malformed existing queue is preserved', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'glean-atom-'))
  const recent = new Date().toISOString()
  const body = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom">
    <entry><title>Builder bounty</title><link rel="alternate" href="https://example.org/builder"/><updated>${recent}</updated></entry>
  </feed>`
  const server = createServer((_request, response) => { response.writeHead(200, { 'content-type': 'application/atom+xml' }); response.end(body) })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  try {
    const address = server.address()
    assert.ok(address && typeof address !== 'string')
    const sources = join(directory, 'sources.json')
    const output = join(directory, 'leads.json')
    await writeFile(sources, JSON.stringify({ lookbackDays: 30, feeds: [{ id: 'builder', name: 'Builder', url: `http://127.0.0.1:${address.port}/atom` }] }))

    const collected = await runCollector(sources, output)
    assert.equal(collected.code, 0, collected.stderr)
    const queue = JSON.parse(await readFile(output, 'utf8'))
    assert.equal(queue.leads[0].url, 'https://example.org/builder')
    assert.equal(queue.leads[0].publishedAt, recent)

    await writeFile(output, '{bad json')
    const failed = await runCollector(sources, output)
    assert.notEqual(failed.code, 0)
    assert.equal(await readFile(output, 'utf8'), '{bad json')
  } finally {
    server.close()
    await rm(directory, { recursive: true, force: true })
  }
})

test('valid empty RSS and Atom feeds produce an empty queue', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'glean-empty-feeds-'))
  const server = createServer((request, response) => {
    response.writeHead(200, { 'content-type': 'application/xml' })
    response.end(request.url === '/rss'
      ? '<rss version="2.0"><channel><title>Empty RSS</title><link>https://example.org/rss</link><description>No entries</description></channel></rss>'
      : '<feed xmlns="http://www.w3.org/2005/Atom"><id>https://example.org/atom</id><title>Empty Atom</title><updated>2026-10-26T00:00:00Z</updated></feed>')
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  try {
    const address = server.address()
    assert.ok(address && typeof address !== 'string')
    const sources = join(directory, 'sources.json')
    const output = join(directory, 'leads.json')
    const baseUrl = `http://127.0.0.1:${address.port}`
    await writeFile(sources, JSON.stringify({ lookbackDays: 30, feeds: [
      { id: 'empty-rss', name: 'Empty RSS', url: `${baseUrl}/rss` },
      { id: 'empty-atom', name: 'Empty Atom', url: `${baseUrl}/atom` },
    ] }))

    const result = await runCollector(sources, output)
    assert.equal(result.code, 0, result.stderr)
    assert.deepEqual(JSON.parse(await readFile(output, 'utf8')), { version: 1, leads: [] })
  } finally {
    server.close()
    await rm(directory, { recursive: true, force: true })
  }
})
