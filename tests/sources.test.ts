import { describe, expect, it } from 'vitest'
import { canonicalIndexUrl, sourceAlreadyExists } from '../src/client/sources.js'

describe('index source validation', () => {
  it('canonicalizes supported URLs', () => {
    expect(canonicalIndexUrl('https://example.com/index.json')).toBe('https://example.com/index.json')
    expect(canonicalIndexUrl('https://EXAMPLE.com:443/index.json')).toBe('https://example.com/index.json')
  })

  it.each([
    'ftp://example.com/index.json',
    'https://user@example.com/index.json',
    'https://example.com/index.json#fragment',
    'not-a-url',
  ])('rejects unsafe or invalid URL %s', (url) => {
    expect(canonicalIndexUrl(url)).toBeUndefined()
  })

  it('detects a duplicate before calling the Host', () => {
    expect(sourceAlreadyExists(
      ['https://cdn.jsdelivr.net/npm/dsh-plugin-catalog/index.json'],
      'https://CDN.JSDELIVR.NET:443/npm/dsh-plugin-catalog/index.json',
    )).toBe(true)
  })
})
