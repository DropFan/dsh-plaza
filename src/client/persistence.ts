import type { MarketSort } from './contracts.js'
import {
  INITIAL_QUERY, type CompatibilityFilter, type InstallationFilter, type PlazaQuery, type ViewMode,
} from './query.js'

const PREFERENCES_KEY = 'dsh-plaza:preferences:v1'
const MAX_LOADED = 5000

export interface SourcePreference {
  readonly query: PlazaQuery
  readonly loadedCount: number
  readonly scrollY: number
}

export interface PlazaPreferences {
  readonly view: ViewMode
  readonly selectedSource?: string
  readonly sources: Readonly<Record<string, SourcePreference>>
}

export const DEFAULT_PREFERENCES: PlazaPreferences = { view: 'grid', sources: {} }

function validSort(value: unknown): value is MarketSort {
  if (typeof value !== 'object' || value === null || !('kind' in value)) return false
  const sort = value as Record<string, unknown>
  if (sort.kind === 'index' || sort.kind === 'relevance') return true
  if (sort.kind === 'published') return sort.direction === 'asc' || sort.direction === 'desc'
  return sort.kind === 'key' && typeof sort.id === 'string' && (sort.direction === 'asc' || sort.direction === 'desc')
}

function validCompatibility(value: unknown): value is CompatibilityFilter {
  return value === 'all' || value === 'compatible' || value === 'exempted' || value === 'incompatible'
}

function validInstallation(value: unknown): value is InstallationFilter {
  return value === 'all' || value === 'not-installed' || value === 'installed' || value === 'update-available'
    || value === 'different-version' || value === 'provided'
}

function readSource(value: unknown): SourcePreference | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const source = value as Record<string, unknown>
  const query = source.query as Record<string, unknown> | undefined
  if (query === undefined || typeof query.text !== 'string' || typeof query.category !== 'string'
    || !Array.isArray(query.labels) || query.labels.some(label => typeof label !== 'string') || !validSort(query.sort)) return undefined
  const loadedCount = typeof source.loadedCount === 'number' && Number.isInteger(source.loadedCount)
    ? Math.min(MAX_LOADED, Math.max(50, source.loadedCount)) : 50
  const scrollY = typeof source.scrollY === 'number' && Number.isFinite(source.scrollY) ? Math.max(0, source.scrollY) : 0
  return {
    query: {
      text: query.text,
      category: query.category,
      labels: query.labels as string[],
      compatibility: validCompatibility(query.compatibility) ? query.compatibility : 'all',
      installation: validInstallation(query.installation) ? query.installation : 'all',
      sort: query.sort,
    },
    loadedCount,
    scrollY,
  }
}

export function readPreferences(storage: Pick<Storage, 'getItem'>): PlazaPreferences {
  try {
    const raw = storage.getItem(PREFERENCES_KEY)
    if (raw === null) return DEFAULT_PREFERENCES
    const value = JSON.parse(raw) as Record<string, unknown>
    const sources: Record<string, SourcePreference> = {}
    if (typeof value.sources === 'object' && value.sources !== null) {
      for (const [url, candidate] of Object.entries(value.sources)) {
        const source = readSource(candidate)
        if (source !== undefined) sources[url] = source
      }
    }
    return {
      view: value.view === 'list' ? 'list' : 'grid',
      ...(typeof value.selectedSource === 'string' ? { selectedSource: value.selectedSource } : {}),
      sources,
    }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export function writePreferences(storage: Pick<Storage, 'setItem'>, preferences: PlazaPreferences): void {
  try { storage.setItem(PREFERENCES_KEY, JSON.stringify(preferences)) } catch { /* Browser storage may be unavailable. */ }
}

export function sourcePreference(preferences: PlazaPreferences, url: string): SourcePreference {
  return preferences.sources[url] ?? { query: INITIAL_QUERY, loadedCount: 50, scrollY: 0 }
}

export function updateSourcePreference(
  preferences: PlazaPreferences,
  url: string,
  patch: Partial<SourcePreference>,
): PlazaPreferences {
  return {
    ...preferences,
    selectedSource: url,
    sources: { ...preferences.sources, [url]: { ...sourcePreference(preferences, url), ...patch } },
  }
}
