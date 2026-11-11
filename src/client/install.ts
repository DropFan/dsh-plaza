import type { MarketEntry, PluginTabProps } from './contracts.js'

export type MarketVersion = MarketEntry['versions'][number]

export function presentedVersion(entry: MarketEntry): MarketVersion {
  return entry.versions.find(item => item.version === entry.defaultVersion) ?? entry.versions[0]!
}

export function versionInstallable(version: MarketVersion): boolean {
  return version.compatibility.compatible || version.compatibility.exempted
}

export function requestInstall(
  install: PluginTabProps['install'],
  entry: MarketEntry,
  version: MarketVersion,
  title: string,
): boolean {
  if (entry.installation.status === 'provided' || !versionInstallable(version)) return false
  install({ ...version.install, title, version: version.version })
  return true
}

export function sourceLabel(name: string, version: MarketVersion): string {
  if (version.source.type === 'npm') return version.source.registry === undefined
    ? `${name}@${version.version}`
    : `${name}@${version.version} · ${version.source.registry}`
  return `${version.source.url}#${version.source.commit.slice(0, 12)}${version.source.path ? `/${version.source.path}` : ''}`
}
