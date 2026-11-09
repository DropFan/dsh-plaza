import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

const locales = ['en', 'zh'] as const

describe('package metadata', () => {
  it.each(locales)('exports valid %s locale metadata', async (locale) => {
    const metadata = JSON.parse(await readFile(`locale/${locale}.json`, 'utf8')) as {
      meta?: { title?: unknown; description?: unknown }
    }
    expect(metadata.meta?.title).toBe('DSH Plaza')
    expect(metadata.meta?.description).toEqual(expect.any(String))
  })

  it('publishes every metadata and display resource', async () => {
    const manifest = JSON.parse(await readFile('package.json', 'utf8')) as {
      exports: Record<string, unknown>
      files: string[]
    }
    expect(manifest.exports).toMatchObject({
      './locale/*.json': './locale/*.json',
      './icon': './assets/icon.svg',
    })
    expect(manifest.files).toEqual(expect.arrayContaining(['locale/*.json', 'assets/icon.svg']))
  })
})
