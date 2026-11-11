import React, { type ComponentPropsWithoutRef, type ReactNode } from 'react'
import ReactMarkdown, { type Components, type UrlTransform } from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

export function safeExternal(value: string): string | undefined {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' || url.protocol === 'mailto:' ? url.href : undefined
  } catch { return undefined }
}

function relativeDestination(value: string): boolean {
  return value !== '' && !/^(?:[a-z][a-z\d+.-]*:|\/\/|#|\/)/iu.test(value)
}

const schema = {
  ...defaultSchema,
  tagNames: [...new Set([...(defaultSchema.tagNames ?? []), 'details', 'summary', 'kbd', 'sub', 'sup'])],
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a ?? []), 'title'],
    img: [...(defaultSchema.attributes?.img ?? []), 'alt', 'height', 'title', 'width'],
    ol: [...(defaultSchema.attributes?.ol ?? []), 'start'],
    td: [...(defaultSchema.attributes?.td ?? []), 'align'],
    th: [...(defaultSchema.attributes?.th ?? []), 'align'],
  },
} satisfies Parameters<typeof rehypeSanitize>[0]

function externalLink(props: ComponentPropsWithoutRef<'a'> & { readonly children?: ReactNode }) {
  const href = typeof props.href === 'string' ? safeExternal(props.href) : undefined
  const { children, ...rest } = props
  return href === undefined
    ? <>{children}</>
    : <a {...rest} href={href} target="_blank" rel="noopener noreferrer">{children} <span aria-hidden="true">↗</span></a>
}

export function Markdown({ source, resolveImage }: {
  readonly source: string
  readonly resolveImage: (path: string) => string | undefined
}) {
  const transformUrl: UrlTransform = (url, key, node) => {
    if (node.tagName === 'img' && key === 'src') return relativeDestination(url) ? resolveImage(url) ?? '' : ''
    if (node.tagName === 'a' && key === 'href') return safeExternal(url) ?? ''
    return ''
  }
  const components: Components = {
    a: ({ node: _node, ...props }) => externalLink(props),
    img: ({ node: _node, ...props }) => props.src
      ? <img {...props} loading="lazy" referrerPolicy="no-referrer" />
      : null,
  }
  return (
    <div className="plaza-markdown">
      <ReactMarkdown
        remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}
        components={components}
        urlTransform={transformUrl}
      >
        {source}
      </ReactMarkdown>
    </div>
  )
}
