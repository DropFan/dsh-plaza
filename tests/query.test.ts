import { describe, expect, it } from 'vitest'
import { INITIAL_QUERY, activeFilterCount, filterChips, filterEntries, removeFilterChip, storageKey, toggleLabel } from '../src/client/query.js'
import type { MarketEntry } from '../src/client/contracts.js'

describe('query helpers', () => {
  it('counts visible active conditions', () => {
    expect(activeFilterCount({ ...INITIAL_QUERY, text: 'git', category: 'tool', labels: ['official', 'ui'] })).toBe(4)
  })

  it('counts compatibility and installation filters', () => {
    expect(activeFilterCount({ ...INITIAL_QUERY, compatibility: 'incompatible', installation: 'installed' })).toBe(2)
  })

  it('filters loaded entries by compatibility and exact installation status', () => {
    const entries = [
      { name: 'compatible', defaultVersion: '1.0.0', versions: [{ version: '1.0.0', compatibility: { compatible: true } }], installation: { status: 'installed' } },
      { name: 'exempted', defaultVersion: '1.0.0', versions: [{ version: '1.0.0', compatibility: { compatible: false, exempted: true } }], installation: { status: 'different-version' } },
      { name: 'blocked', defaultVersion: '1.0.0', versions: [{ version: '1.0.0', compatibility: { compatible: false, exempted: false } }], installation: { status: 'not-installed' } },
    ] as unknown as MarketEntry[]
    expect(filterEntries(entries, { ...INITIAL_QUERY, compatibility: 'exempted' }).map(entry => entry.name)).toEqual(['exempted'])
    expect(filterEntries(entries, { ...INITIAL_QUERY, compatibility: 'incompatible' }).map(entry => entry.name)).toEqual(['blocked'])
    expect(filterEntries(entries, { ...INITIAL_QUERY, installation: 'different-version' }).map(entry => entry.name)).toEqual(['exempted'])
  })

  it('keeps category and label chips distinct when their IDs match', () => {
    const query = { ...INITIAL_QUERY, category: 'official', labels: ['official'] }
    const chips = filterChips(query)
    expect(chips).toEqual([{ kind: 'category', id: 'official' }, { kind: 'label', id: 'official' }])
    expect(removeFilterChip(query, chips[0]!)).toMatchObject({ category: '', labels: ['official'] })
    expect(removeFilterChip(query, chips[1]!)).toMatchObject({ category: 'official', labels: [] })
  })

  it('toggles one label without mutating the input', () => {
    const labels = ['official']
    expect(toggleLabel(labels, 'ui')).toEqual(['official', 'ui'])
    expect(toggleLabel(labels, 'official')).toEqual([])
    expect(labels).toEqual(['official'])
  })

  it('isolates persisted queries by index URL', () => {
    expect(storageKey('https://one.example/index.json')).not.toBe(storageKey('https://two.example/index.json'))
  })
})
