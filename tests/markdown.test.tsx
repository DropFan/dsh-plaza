import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Markdown } from '../src/client/Markdown.js'

function renderMarkdown(source: string, resolveImage: (path: string) => string | undefined = () => undefined) {
  return render(<Markdown source={source} resolveImage={resolveImage} />)
}

describe('Markdown', () => {
  it('renders core Markdown structures', () => {
    const { container } = renderMarkdown('# Title\n\n> Quote\n\n1. one\n2. two\n\n**strong** and *emphasis* and `code`\n\n```ts\nconst n = 1\n```')
    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument()
    expect(container.querySelector('blockquote')).toHaveTextContent('Quote')
    expect(container.querySelector('ol')).toHaveTextContent('one two')
    expect(container.querySelector('strong')).toHaveTextContent('strong')
    expect(container.querySelector('em')).toHaveTextContent('emphasis')
    expect(container.querySelector('code.language-ts')).toHaveTextContent('const n = 1')
  })

  it('renders GitHub Flavored Markdown tables, task lists, strikethrough, and autolinks', () => {
    const { container } = renderMarkdown('| Name | State |\n| --- | --- |\n| Plaza | Ready |\n\n- [x] shipped\n- [ ] pending\n\n~~old~~\n\nhttps://example.com')
    const table = screen.getByRole('table')
    expect(within(table).getByText('Plaza')).toBeInTheDocument()
    expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(2)
    expect(container.querySelector('del')).toHaveTextContent('old')
    expect(screen.getByRole('link', { name: /https:\/\/example\.com/ })).toHaveTextContent('↗')
  })

  it('renders safe GitHub README HTML elements', () => {
    const { container } = renderMarkdown('<details open><summary>More</summary><p>Use <kbd>Cmd</kbd><sup>2</sup><sub>n</sub><br>now.</p></details>')
    expect(container.querySelector('details')).toHaveAttribute('open')
    expect(container.querySelector('summary')).toHaveTextContent('More')
    expect(container.querySelector('kbd')).toHaveTextContent('Cmd')
    expect(container.querySelector('sup')).toHaveTextContent('2')
    expect(container.querySelector('sub')).toHaveTextContent('n')
    expect(container.querySelector('br')).not.toBeNull()
  })

  it('sanitizes executable HTML, event handlers, styles, and dangerous URLs', () => {
    const { container } = renderMarkdown('<script>alert(1)</script><p onclick="alert(1)" style="color:red">safe</p><a href="javascript:alert(1)">bad</a><iframe src="https://example.com"></iframe>')
    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('iframe')).toBeNull()
    expect(screen.getByText('safe')).not.toHaveAttribute('onclick')
    expect(screen.getByText('safe')).not.toHaveAttribute('style')
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull()
    expect(container).toHaveTextContent('bad')
  })

  it('marks safe external links and drops unsafe or relative link destinations', () => {
    const { container } = renderMarkdown('[Site](https://example.com) [Mail](mailto:hi@example.com) [Relative](docs/readme.md) [Bad](javascript:alert(1))')
    expect(screen.getByRole('link', { name: /Site/ })).toHaveAttribute('target', '_blank')
    expect(screen.getByRole('link', { name: /Mail/ })).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.queryByRole('link', { name: /Relative/ })).toBeNull()
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull()
    expect(container).toHaveTextContent('Relative')
    expect(container).toHaveTextContent('Bad')
  })

  it('routes Markdown and HTML relative images through the resolver', () => {
    const resolveImage = vi.fn((path: string) => `/detail/${path}`)
    renderMarkdown('![Markdown](images/markdown.png)\n\n<img src="images/html.png" alt="HTML" width="320">\n\n![Remote](https://example.com/logo.png)', resolveImage)
    expect(screen.getByRole('img', { name: 'Markdown' })).toHaveAttribute('src', '/detail/images/markdown.png')
    expect(screen.getByRole('img', { name: 'HTML' })).toHaveAttribute('src', '/detail/images/html.png')
    expect(screen.getByRole('img', { name: 'HTML' })).toHaveAttribute('width', '320')
    expect(screen.queryByRole('img', { name: 'Remote' })).toBeNull()
    expect(resolveImage).toHaveBeenCalledWith('images/markdown.png')
    expect(resolveImage).toHaveBeenCalledWith('images/html.png')
  })
})
