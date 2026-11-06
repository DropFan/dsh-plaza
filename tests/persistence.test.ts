import { describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_PREFERENCES,
  readPreferences,
  sourcePreference,
  updateSourcePreference,
  writePreferences,
} from '../src/client/persistence.js'
import { INITIAL_QUERY } from '../src/client/query.js'

const KEY = 'dsh-plaza:preferences:v1'
const FIRST = 'https://one.example/index.json'
const SECOND = 'https://two.example/index.json'

describe('Plaza persistence', () => {
  it('falls back safely when localStorage contains malformed JSON or throws', () => {
    expect(readPreferences({ getItem: () => '{broken' })).toEqual(DEFAULT_PREFERENCES)
    expect(readPreferences({ getItem: () => { throw new DOMException('blocked') } })).toEqual(DEFAULT_PREFERENCES)
  })

  it('drops malformed source records and normalizes unsafe numeric fields', () => {
    const raw = JSON.stringify({
      view: 'unknown',
      selectedSource: FIRST,
      sources: {
        [FIRST]: { query: { ...INITIAL_QUERY, text: 'git' }, loadedCount: 1, scrollY: -20 },
        [SECOND]: { query: { text: 3, category: '', labels: [], sort: { kind: 'index' } }, loadedCount: 100, scrollY: 40 },
      },
    })

    expect(readPreferences({ getItem: () => raw })).toEqual({
      view: 'grid', selectedSource: FIRST,
      sources: {
        [FIRST]: { query: { ...INITIAL_QUERY, text: 'git' }, loadedCount: 50, scrollY: 0 },
      },
    })
  })

  it('restores independent query, loadedCount, and scrollY for each source', () => {
    let preferences = DEFAULT_PREFERENCES
    preferences = updateSourcePreference(preferences, FIRST, {
      query: { ...INITIAL_QUERY, text: 'alpha', labels: ['official'] }, loadedCount: 150, scrollY: 720,
    })
    preferences = updateSourcePreference(preferences, SECOND, {
      query: { ...INITIAL_QUERY, category: 'tools', sort: { kind: 'published', direction: 'desc' } },
      loadedCount: 100, scrollY: 96,
    })

    const storage = new Map<string, string>()
    writePreferences({ setItem: (key, value) => { storage.set(key, value) } }, preferences)
    const restored = readPreferences({ getItem: key => storage.get(key) ?? null })

    expect(restored.selectedSource).toBe(SECOND)
    expect(sourcePreference(restored, FIRST)).toEqual({
      query: { ...INITIAL_QUERY, text: 'alpha', labels: ['official'] }, loadedCount: 150, scrollY: 720,
    })
    expect(sourcePreference(restored, SECOND)).toEqual({
      query: { ...INITIAL_QUERY, category: 'tools', sort: { kind: 'published', direction: 'desc' } },
      loadedCount: 100, scrollY: 96,
    })
    expect(sourcePreference(restored, 'https://new.example/index.json')).toEqual({
      query: INITIAL_QUERY, loadedCount: 50, scrollY: 0,
    })
    expect(storage.has(KEY)).toBe(true)
  })

  it('ignores storage write failures', () => {
    const setItem = vi.fn(() => { throw new DOMException('quota') })
    expect(() => writePreferences({ setItem }, DEFAULT_PREFERENCES)).not.toThrow()
    expect(setItem).toHaveBeenCalledOnce()
  })
})
