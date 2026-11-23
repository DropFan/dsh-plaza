import type {
  ClientContext, MarketIndexSummary, MarketSearchResult, PluginDetail, RemoteResult,
} from './contracts.js'
import type { PlazaQuery } from './query.js'

export const PAGE_SIZE = 50
const MAX_PAGE_SIZE = 100

function hasLocalFilters(query: PlazaQuery): boolean {
  return query.compatibility !== 'all' || query.installation !== 'all'
}

export interface ListingState {
  readonly url: string
  readonly query: PlazaQuery
  readonly status: 'loading' | 'more' | 'ready' | 'error'
  readonly value: MarketSearchResult | null
  readonly answeredQuery: PlazaQuery | null
}

export interface PlazaState {
  readonly indexes: readonly MarketIndexSummary[]
  readonly indexesStatus: 'idle' | 'loading' | 'ready' | 'error'
  readonly listing: ListingState | null
}

export type DetailState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly detail: PluginDetail }
  | { readonly status: 'error'; readonly failure: 'remote' | 'timeout' }

export const DETAIL_TIMEOUT_MS = 70_000

const INITIAL: PlazaState = { indexes: [], indexesStatus: 'idle', listing: null }

export class PlazaController {
  private state: PlazaState = INITIAL
  private readonly listeners = new Set<() => void>()
  private disposed = false
  private indexesRead = 0
  private listingRead = 0
  private detailRead = 0

  constructor(private readonly remote: ClientContext['remote']) {}

  getSnapshot = (): PlazaState => this.state

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  dispose(): void {
    this.disposed = true
    this.indexesRead++
    this.listingRead++
    this.detailRead++
    this.listeners.clear()
  }

  async setIndexes(urls: readonly string[]): Promise<'saved' | 'duplicate' | 'invalid' | 'unavailable' | 'error'> {
    const answer = await this.remote.pluginMarket.setIndexes([...urls])
    if (this.disposed) return 'error'
    if (!answer.ok) {
      if (answer.error.code === 'plugin-market/settings-unavailable') return 'unavailable'
      if (answer.error.code === 'plugin-market/invalid-index-url') {
        return answer.error.details.reason === 'duplicate' ? 'duplicate' : 'invalid'
      }
      return 'error'
    }
    await this.loadIndexes()
    return 'saved'
  }

  async loadIndexes(): Promise<readonly MarketIndexSummary[] | null> {
    const read = ++this.indexesRead
    this.patch({ indexesStatus: 'loading' })
    const answer = await this.remote.pluginMarket.listIndexes()
    if (!this.current(read, this.indexesRead)) return null
    if (!answer.ok) { this.patch({ indexesStatus: 'error' }); return null }
    const listing = this.state.listing
    const removedListing = listing !== null && !answer.value.some((index: MarketIndexSummary) => index.url === listing.url)
    if (removedListing) this.listingRead++
    this.patch({
      indexesStatus: 'ready',
      indexes: answer.value,
      ...(removedListing ? { listing: null } : {}),
    })
    return answer.value
  }

  async load(url: string, query: PlazaQuery, count = PAGE_SIZE, refresh = false): Promise<void> {
    const read = ++this.listingRead
    const kept = this.state.listing?.url === url ? this.state.listing.value : null
    const answeredQuery = this.state.listing?.url === url ? this.state.listing.answeredQuery : null
    this.patch({ listing: { url, query, status: 'loading', value: kept, answeredQuery } })
    let value: MarketSearchResult | null = null
    let restarted = false
    while (value === null || (value.nextOffset !== null && (hasLocalFilters(query) || value.entries.length < count))) {
      const offset = value?.entries.length ?? 0
      const remaining = hasLocalFilters(query) ? MAX_PAGE_SIZE : count - offset
      const answer = await this.page(url, query, offset, Math.min(MAX_PAGE_SIZE, remaining), value?.fetchedAt, refresh && value === null && !restarted)
      if (!this.current(read, this.listingRead)) return
      if (!answer.ok) { this.patch({ listing: { url, query, status: 'error', value: kept, answeredQuery } }); return }
      if (value === null || answer.value.fetchedAt === value.fetchedAt) {
        value = value === null ? answer.value : { ...answer.value, entries: [...value.entries, ...answer.value.entries] }
      } else if (!restarted) {
        restarted = true
        value = null
      } else {
        this.patch({ listing: { url, query, status: 'error', value: kept, answeredQuery } })
        return
      }
    }
    this.patch({ listing: { url, query, status: 'ready', value, answeredQuery: query } })
  }

  async more(): Promise<void> {
    const listing = this.state.listing
    if (listing === null || listing.value === null || listing.value.nextOffset === null || listing.status === 'loading' || listing.status === 'more' || listing.answeredQuery !== listing.query) return
    const { url, query, value } = listing
    const read = ++this.listingRead
    this.patch({ listing: { ...listing, status: 'more' } })
    const answer = await this.page(url, query, value.nextOffset as number, PAGE_SIZE, value.fetchedAt, false)
    if (!this.current(read, this.listingRead)) return
    if (!answer.ok) { this.patch({ listing: { ...listing, status: 'error' } }); return }
    if (answer.value.fetchedAt !== value.fetchedAt) {
      await this.load(url, query, value.entries.length + PAGE_SIZE)
      return
    }
    this.patch({ listing: { url, query, status: 'ready', value: { ...answer.value, entries: [...value.entries, ...answer.value.entries] }, answeredQuery: query } })
  }

  async readDetail(url: string, name: string, version: string, language: string): Promise<DetailState | null> {
    const read = ++this.detailRead
    let timer: ReturnType<typeof setTimeout> | undefined
    const timeout = new Promise<'timeout'>(resolve => { timer = setTimeout(() => resolve('timeout'), DETAIL_TIMEOUT_MS) })
    let npmFileSources: 'npmmirror'[] = []
    const fastest = await this.remote.pluginRegistryProbe.fastest()
    if (!this.current(read, this.detailRead)) return null
    if (fastest.ok && fastest.value === 'https://registry.npmmirror.com/') npmFileSources = ['npmmirror']
    const answer = await Promise.race([
      this.remote.pluginMarket.readEntryDetail(url, name, version, language, { npmFileSources }), timeout,
    ])
    if (timer !== undefined) clearTimeout(timer)
    if (!this.current(read, this.detailRead)) return null
    if (answer === 'timeout') return { status: 'error', failure: 'timeout' }
    return answer.ok ? { status: 'ready', detail: answer.value } : { status: 'error', failure: 'remote' }
  }

  invalidateDetails(): void { this.detailRead++ }

  async sourcesChanged(): Promise<void> {
    await this.loadIndexes()
  }

  async connectionReset(): Promise<void> {
    this.listingRead++
    this.invalidateDetails()
    const indexes = await this.loadIndexes()
    const listing = this.state.listing
    if (indexes !== null && listing !== null && indexes.some(index => index.url === listing.url)) {
      await this.load(listing.url, listing.query, Math.max(PAGE_SIZE, listing.value?.entries.length ?? PAGE_SIZE))
    }
  }

  private page(url: string, query: PlazaQuery, offset: number, limit: number, fetchedAt?: number, refresh = false): Promise<RemoteResult<MarketSearchResult>> {
    return this.remote.pluginMarket.search(url, {
      ...(query.text.trim() ? { text: query.text.trim() } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.labels.length ? { labels: query.labels } : {}),
      sort: query.sort, offset, limit,
      ...(fetchedAt === undefined ? {} : { fetchedAt }),
      ...(refresh ? { refresh: true } : {}),
    })
  }

  private current(read: number, current: number): boolean { return !this.disposed && read === current }

  private patch(patch: Partial<PlazaState>): void {
    if (this.disposed) return
    this.state = { ...this.state, ...patch }
    for (const listener of this.listeners) listener()
  }
}
