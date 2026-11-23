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

export function requestUpdate(
  update: PluginTabProps['update'],
  entry: MarketEntry,
  version: MarketVersion,
): boolean {
  if (!version.update || version.source.type !== 'git' || entry.installation.status === 'not-installed' || entry.installation.status === 'provided'
    || !versionInstallable(version)) return false
  update({ packageName: entry.name, version: version.version, spec: version.install.spec })
  return true
}

export function sourceLabel(name: string, version: MarketVersion): string {
  if (version.source.type === 'npm') return version.source.registry === undefined
    ? `npm · ${name}@${version.version}`
    : `npm · ${name}@${version.version} · ${version.source.registry}`
  return `git · ${version.source.url}#${version.source.commit}${version.source.path ? `/${version.source.path}` : ''}`
}

export function installTargetLabel(version: MarketVersion): string {
  return version.install.registry === undefined ? version.install.spec : `${version.install.spec} · ${version.install.registry}`
}
