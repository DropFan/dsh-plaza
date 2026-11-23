import { describe, expect, it, vi } from 'vitest'
import { installTargetLabel, presentedVersion, requestInstall, requestUpdate, sourceLabel, versionInstallable } from '../src/client/install.js'
import type { MarketEntry } from '../src/client/contracts.js'

function version(value: string, options: { compatible?: boolean; exempted?: boolean; source?: 'npm' | 'git' } = {}) {
  const compatible = options.compatible ?? true
  return {
    version: value,
    publishTimestamp: 1,
    source: options.source === 'git'
      ? { type: 'git', url: 'https://github.com/example/plugin.git', commit: '1234567890abcdef1234567890abcdef12345678', path: 'packages/plugin' }
      : { type: 'npm', registry: 'https://registry.example/' },
    engines: {},
    install: { spec: `plugin@${value}`, registry: 'https://registry.example/' },
    compatibility: compatible ? { compatible: true } : {
      compatible: false, runtimeVersion: '0.2.2-rc.2', requirements: { 'engines.dsh': '>=9' }, exempted: options.exempted ?? false,
    },
    ...(options.source === 'git' ? { update: true } : {}),
  } as MarketEntry['versions'][number]
}

function entry(status: MarketEntry['installation']['status'] = 'not-installed'): MarketEntry {
  const versions = [version('2.0.0'), version('1.0.0')]
  return {
    name: 'plugin', metadata: { keywords: [], labels: [], sortKeys: {} }, versions,
    defaultVersion: '1.0.0', installation: { status },
  } as MarketEntry
}

describe('install adapter', () => {
  it('presents the Host-selected default version', () => {
    expect(presentedVersion(entry()).version).toBe('1.0.0')
  })

  it('passes the exact Host install target to the slot owner', () => {
    const install = vi.fn()
    const plugin = entry()
    expect(requestInstall(install, plugin, plugin.versions[0]!, 'Plugin title')).toBe(true)
    expect(install).toHaveBeenCalledWith({
      spec: 'plugin@2.0.0', registry: 'https://registry.example/', title: 'Plugin title', version: '2.0.0',
    })
  })

  it('routes an installed Git version through the rollback-safe update owner', () => {
    const update = vi.fn()
    const plugin = entry('update-available')
    const target = version('3.0.0', { source: 'git' })
    expect(requestUpdate(update, plugin, target)).toBe(true)
    expect(update).toHaveBeenCalledWith({ packageName: 'plugin', version: '3.0.0', spec: 'plugin@3.0.0' })
    expect(requestUpdate(update, entry(), target)).toBe(false)
    expect(requestUpdate(update, plugin, version('3.0.0'))).toBe(false)
  })

  it('blocks incompatible versions unless exempted and never replaces provided bundles', () => {
    const install = vi.fn()
    expect(requestInstall(install, entry(), version('3.0.0', { compatible: false }), 'Plugin')).toBe(false)
    expect(versionInstallable(version('3.0.0', { compatible: false, exempted: true }))).toBe(true)
    expect(requestInstall(install, entry('provided'), version('1.0.0'), 'Plugin')).toBe(false)
    expect(install).not.toHaveBeenCalled()
  })

  it('describes npm and pinned git sources', () => {
    expect(sourceLabel('plugin', version('1.0.0'))).toContain('npm · plugin@1.0.0')
    expect(sourceLabel('plugin', version('1.0.0', { source: 'git' }))).toBe('git · https://github.com/example/plugin.git#1234567890abcdef1234567890abcdef12345678/packages/plugin')
    expect(installTargetLabel(version('1.0.0'))).toBe('plugin@1.0.0 · https://registry.example/')
  })
})
