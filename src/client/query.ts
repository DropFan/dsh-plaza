import type { MarketSort } from './contracts.js'

export type ViewMode = 'grid' | 'list'

export interface PlazaQuery {
  readonly text: string
  readonly category: string
  readonly labels: readonly string[]
  readonly sort: MarketSort
}

export const INITIAL_QUERY: PlazaQuery = {
  text: '', category: '', labels: [], sort: { kind: 'index' },
}

export function activeFilterCount(query: PlazaQuery): number {
  return Number(query.text.length > 0) + Number(query.category.length > 0) + query.labels.length
}

export function toggleLabel(labels: readonly string[], label: string): string[] {
  return labels.includes(label) ? labels.filter(value => value !== label) : [...labels, label]
}

export function storageKey(url: string): string {
  return `dsh-plaza:query:${url}`
}
