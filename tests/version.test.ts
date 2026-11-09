import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

describe('version marker', () => {
  it('embeds the package version in the client artifact', async () => {
    const manifest = JSON.parse(await readFile('package.json', 'utf8')) as { version: string }
    const artifact = await readFile('client/client.js', 'utf8')
    expect(artifact).toContain(`var version = ${JSON.stringify(manifest.version)}`)
    expect(artifact).toContain('children: ["Beta ", PLAZA_VERSION]')
  })
})
