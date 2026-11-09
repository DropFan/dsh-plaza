export function canonicalIndexUrl(value: string): string | undefined {
  try {
    const url = new URL(value)
    if ((url.protocol !== 'http:' && url.protocol !== 'https:') || url.username || url.password || url.hash) return undefined
    return url.href
  } catch {
    return undefined
  }
}

export function sourceAlreadyExists(urls: readonly string[], candidate: string): boolean {
  const key = canonicalIndexUrl(candidate)
  return key !== undefined && urls.some(url => canonicalIndexUrl(url) === key)
}
