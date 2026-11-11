import { readFile, stat } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('client artifact contract', () => {
  it('registers a DSH module-loader factory and keeps React external', async () => {
    const artifact = await readFile(resolve('client/client.js'), 'utf8')
    expect(artifact).toContain("window.__ModuleLoader__.load({ id: 'dsh-plaza'")
    expect(artifact).toContain('require("react")')
    expect(artifact).toContain('require("react/jsx-runtime")')
    expect(artifact).not.toContain('react.production.min')
    expect(artifact).not.toMatch(/require\(["']node:/)
  })

  it('embeds the compiled plugin stylesheet', async () => {
    const artifact = await readFile(resolve('client/client.js'), 'utf8')
    expect(artifact).toContain('.plaza-grid')
    expect(artifact).toContain('--dsw-alias-label-primary')
  })

  it('keeps the full Markdown client bundle within its reviewed budget', async () => {
    const path = resolve('client/client.js')
    const bytes = await readFile(path)
    expect((await stat(path)).size).toBeLessThan(1_100_000)
    expect(gzipSync(bytes).byteLength).toBeLessThan(240_000)
  })
})
