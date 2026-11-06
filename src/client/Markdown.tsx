import React, { Fragment, type ReactNode } from 'react'

const TOKEN = /(!?\[[^\]]*\]\([^\s)]+(?:\s+"[^"]*")?\)|`[^`]+`|\*\*[^*]+\*\*)/g
const LINK = /^(!?)\[([^\]]*)\]\(([^\s)]+)(?:\s+"[^"]*")?\)$/

export function safeExternal(value: string): string | undefined {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' || url.protocol === 'mailto:' ? url.href : undefined
  } catch { return undefined }
}

function inline(text: string, resolveImage: (path: string) => string | undefined): ReactNode[] {
  return text.split(TOKEN).filter(Boolean).map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>
    const match = LINK.exec(part)
    if (match === null) return <Fragment key={index}>{part}</Fragment>
    const [, image, label = '', destination = ''] = match
    if (image === '!') {
      const src = resolveImage(destination)
      return src === undefined ? <Fragment key={index}>{label}</Fragment> : <img key={index} src={src} alt={label} loading="lazy" referrerPolicy="no-referrer" />
    }
    const href = safeExternal(destination)
    return href === undefined
      ? <Fragment key={index}>{label}</Fragment>
      : <a key={index} href={href} target="_blank" rel="noopener noreferrer">{label} <span aria-hidden="true">↗</span></a>
  })
}

export function Markdown({ source, resolveImage }: { readonly source: string; readonly resolveImage: (path: string) => string | undefined }) {
  const blocks: ReactNode[] = []
  const lines = source.replace(/\r\n?/g, '\n').split('\n')
  let paragraph: string[] = []
  let list: string[] = []
  let code: string[] | null = null
  const flush = () => {
    if (paragraph.length) { blocks.push(<p key={`p-${blocks.length}`}>{inline(paragraph.join(' '), resolveImage)}</p>); paragraph = [] }
    if (list.length) { blocks.push(<ul key={`l-${blocks.length}`}>{list.map((item, index) => <li key={index}>{inline(item, resolveImage)}</li>)}</ul>); list = [] }
  }
  for (const line of lines) {
    if (line.startsWith('```')) {
      if (code === null) { flush(); code = [] } else { blocks.push(<pre key={`c-${blocks.length}`}><code>{code.join('\n')}</code></pre>); code = null }
      continue
    }
    if (code !== null) { code.push(line); continue }
    const heading = /^(#{1,4})\s+(.+)$/.exec(line)
    if (heading !== null) {
      flush(); const level = heading[1]?.length ?? 2; const content = inline(heading[2] ?? '', resolveImage)
      blocks.push(React.createElement(`h${level}`, { key: `h-${blocks.length}` }, content)); continue
    }
    const item = /^[-*]\s+(.+)$/.exec(line)
    if (item !== null) { if (paragraph.length) flush(); list.push(item[1] ?? ''); continue }
    if (line.trim() === '') { flush(); continue }
    if (list.length) flush()
    paragraph.push(line.trim())
  }
  flush()
  if (code !== null) blocks.push(<pre key={`c-${blocks.length}`}><code>{code.join('\n')}</code></pre>)
  return <div className="plaza-markdown">{blocks}</div>
}
