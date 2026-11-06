import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Markdown } from '../src/client/Markdown.js'

describe('Markdown', () => {
  it('renders headings, lists, emphasis and code without raw HTML', () => {
    const { container } = render(<Markdown source={'# Title\n\n- **safe**\n- `code`\n\n<script>alert(1)</script>'} resolveImage={() => undefined} />)
    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument()
    expect(screen.getByText('safe').tagName).toBe('STRONG')
    expect(container.querySelector('script')).toBeNull()
    expect(screen.getByText('<script>alert(1)</script>')).toBeInTheDocument()
  })

  it('marks safe external links and drops unsafe protocols', () => {
    const { container } = render(<Markdown source={'[Site](https://example.com) [Bad](javascript:alert(1))'} resolveImage={() => undefined} />)
    const link = screen.getByRole('link', { name: /Site/ })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveTextContent('↗')
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull()
    expect(container).toHaveTextContent('Bad')
  })

  it('routes only relative images through the resolver', () => {
    const resolveImage = vi.fn((path: string) => `/detail/${path}`)
    render(<Markdown source={'![Logo](images/logo.png) ![Remote](https://example.com/logo.png)'} resolveImage={path => path.startsWith('http') ? undefined : resolveImage(path)} />)
    expect(screen.getByRole('img', { name: 'Logo' })).toHaveAttribute('src', '/detail/images/logo.png')
    expect(resolveImage).toHaveBeenCalledWith('images/logo.png')
    expect(screen.queryByRole('img', { name: 'Remote' })).toBeNull()
  })
})
