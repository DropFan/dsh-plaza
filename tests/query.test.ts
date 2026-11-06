import { describe, expect, it } from 'vitest'
import { INITIAL_QUERY, activeFilterCount, storageKey, toggleLabel } from '../src/client/query.js'

describe('query helpers', () => {
  it('counts visible active conditions', () => {
    expect(activeFilterCount({ ...INITIAL_QUERY, text: 'git', category: 'tool', labels: ['official', 'ui'] })).toBe(4)
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
