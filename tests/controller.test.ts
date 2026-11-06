import { describe, expect, it, vi } from 'vitest'
import { PAGE_SIZE, PlazaController } from '../src/client/controller.js'
import type { MarketSearchResult, RemoteResult } from '../src/client/contracts.js'
import { INITIAL_QUERY, type PlazaQuery } from '../src/client/query.js'

type Deferred<T> = { promise: Promise<T>; resolve(value: T): void }

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(done => { resolve = done })
  return { promise, resolve }
}

function result(names: readonly string[], fetchedAt: number, nextOffset: number | null): MarketSearchResult {
  return {
    url: 'https://example.test/index.json',
    title: 'Test',
    metadata: { categories: {}, labels: {}, sortKeys: {} },
    fetchedAt,
    entries: names.map(name => ({ name, versions: [], metadata: { keywords: [], labels: [], sortKeys: {} }, installation: { status: 'not-installed' } })),
    total: names.length + (nextOffset === null ? 0 : PAGE_SIZE),
    nextOffset,
  } as unknown as MarketSearchResult
}

function ok(value: MarketSearchResult): RemoteResult<MarketSearchResult> {
  return { ok: true, value }
}

function setup() {
  const listIndexes = vi.fn()
  const search = vi.fn()
  const readEntryDetail = vi.fn()
  const controller = new PlazaController({ listIndexes, search, readEntryDetail } as never)
  return { controller, listIndexes, search, readEntryDetail }
}

const otherQuery: PlazaQuery = { ...INITIAL_QUERY, text: 'new' }

describe('PlazaController', () => {
  it('discards an older listing response after a newer request wins', async () => {
    const { controller, search } = setup()
    const oldRead = deferred<RemoteResult<MarketSearchResult>>()
    const newRead = deferred<RemoteResult<MarketSearchResult>>()
    search.mockReturnValueOnce(oldRead.promise).mockReturnValueOnce(newRead.promise)

    const oldLoad = controller.load('https://old.test/index.json', INITIAL_QUERY)
    const newLoad = controller.load('https://new.test/index.json', otherQuery)
    newRead.resolve(ok(result(['new'], 2, null)))
    await newLoad
    oldRead.resolve(ok(result(['old'], 1, null)))
    await oldLoad

    expect(controller.getSnapshot().listing).toMatchObject({
      url: 'https://new.test/index.json', query: otherQuery, status: 'ready',
      value: { fetchedAt: 2, entries: [{ name: 'new' }] },
    })
  })

  it('pins fetchedAt while merging pages from one document', async () => {
    const { controller, search } = setup()
    search
      .mockResolvedValueOnce(ok(result(['first'], 10, 1)))
      .mockResolvedValueOnce(ok(result(['second'], 10, null)))

    await controller.load('https://example.test/index.json', INITIAL_QUERY, 2)

    expect(search).toHaveBeenNthCalledWith(1, 'https://example.test/index.json', expect.objectContaining({ offset: 0, limit: 2 }))
    expect(search).toHaveBeenNthCalledWith(2, 'https://example.test/index.json', expect.objectContaining({ offset: 1, limit: 1, fetchedAt: 10 }))
    expect(controller.getSnapshot().listing?.value?.entries.map(entry => entry.name)).toEqual(['first', 'second'])
  })

  it('reloads from the first page instead of merging when more sees a replaced document', async () => {
    const { controller, search } = setup()
    const stalePage = Array.from({ length: PAGE_SIZE }, (_, index) => `stale-${index}`)
    search
      .mockResolvedValueOnce(ok(result(stalePage, 10, PAGE_SIZE)))
      .mockResolvedValueOnce(ok(result(['replacement-tail'], 20, null)))
      .mockResolvedValueOnce(ok(result(['fresh'], 20, null)))

    await controller.load('https://example.test/index.json', INITIAL_QUERY)
    await controller.more()

    expect(search).toHaveBeenNthCalledWith(2, 'https://example.test/index.json', expect.objectContaining({ offset: PAGE_SIZE, fetchedAt: 10 }))
    expect(search).toHaveBeenNthCalledWith(3, 'https://example.test/index.json', expect.objectContaining({ offset: 0, limit: 100 }))
    expect(controller.getSnapshot().listing).toMatchObject({ status: 'ready', value: { fetchedAt: 20 } })
    expect(controller.getSnapshot().listing?.value?.entries.map(entry => entry.name)).toEqual(['fresh'])
  })

  it('does not publish a pending result after dispose', async () => {
    const { controller, listIndexes } = setup()
    const pending = deferred<RemoteResult<readonly []>>()
    listIndexes.mockReturnValueOnce(pending.promise)
    const listener = vi.fn()
    controller.subscribe(listener)

    const loading = controller.loadIndexes()
    expect(listener).toHaveBeenCalledOnce()
    controller.dispose()
    pending.resolve({ ok: true, value: [] })

    await expect(loading).resolves.toBeNull()
    expect(listener).toHaveBeenCalledOnce()
    expect(controller.getSnapshot()).toMatchObject({ indexesStatus: 'loading', indexes: [] })
  })
})
