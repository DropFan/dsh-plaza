import type { MarketEntry, MarketSort } from './contracts.js'

export type ViewMode = 'grid' | 'list'
export type CompatibilityFilter = 'all' | 'compatible' | 'exempted' | 'incompatible'
export type InstallationFilter = 'all' | 'not-installed' | 'installed' | 'update-available' | 'different-version' | 'provided'

export interface PlazaQuery {
  readonly text: string
  readonly category: string
  readonly labels: readonly string[]
  readonly compatibility: CompatibilityFilter
  readonly installation: InstallationFilter
  readonly sort: MarketSort
}

export const INITIAL_QUERY: PlazaQuery = {
  text: '', category: '', labels: [], compatibility: 'all', installation: 'all', sort: { kind: 'index' },
}

export function activeFilterCount(query: PlazaQuery): number {
  return Number(query.text.length > 0) + Number(query.category.length > 0) + query.labels.length
    + Number(query.compatibility !== 'all') + Number(query.installation !== 'all')
}

export function filterEntries(entries: readonly MarketEntry[], query: PlazaQuery): MarketEntry[] {
  return entries.filter(entry => {
    const version = entry.versions.find(item => item.version === entry.defaultVersion) ?? entry.versions[0]
    if (query.installation !== 'all' && entry.installation.status !== query.installation) return false
    if (query.compatibility === 'all') return true
    if (version === undefined) return false
    if (query.compatibility === 'compatible') return version.compatibility.compatible
    if (version.compatibility.compatible) return false
    return query.compatibility === 'exempted' ? version.compatibility.exempted : !version.compatibility.exempted
  })
}

export function toggleLabel(labels: readonly string[], label: string): string[] {
  return labels.includes(label) ? labels.filter(value => value !== label) : [...labels, label]
}

export function withText(query: PlazaQuery, text: string): PlazaQuery {
  const wasBlank = query.text.trim() === ''
  const isBlank = text.trim() === ''
  const sort: MarketSort = wasBlank && !isBlank && query.sort.kind === 'index'
    ? { kind: 'relevance' }
    : isBlank && query.sort.kind === 'relevance' ? { kind: 'index' } : query.sort
  return { ...query, text, sort }
}

export function storageKey(url: string): string {
  return `dsh-plaza:query:${url}`
}

export function declaredQuery(query: PlazaQuery, metadata: import('@deepseek-ai/dsh-plugin-market-index').MarketIndexMetadata): PlazaQuery {
  const category = query.category && !Object.hasOwn(metadata.categories, query.category) ? '' : query.category
  const labels = query.labels.filter(label => Object.hasOwn(metadata.labels, label))
  const sort = query.sort.kind === 'key' && !Object.hasOwn(metadata.sortKeys, query.sort.id) ? { kind: 'index' as const } : query.sort
  return category === query.category && labels.length === query.labels.length && sort === query.sort
    ? query : { ...query, category, labels, sort }
}
