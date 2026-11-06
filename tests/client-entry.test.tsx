import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { apply } from '../src/client/index.js'

vi.mock('../src/client/Plaza.js', () => ({ Plaza: () => React.createElement('div', null, 'plaza') }))

describe('client entry', () => {
  it('registers a late-load-safe plugins tab', () => {
    const register = vi.fn(() => () => {})
    const inject = vi.fn((_name, callback: () => unknown) => callback())
    const registerLocale = vi.fn(() => () => {})
    const ctx = {
      effect: vi.fn((callback: () => unknown) => callback()),
      locale: { register: registerLocale, bind: () => (key: string) => key, resolveText: String },
      remote: { pluginMarket: {} },
      slots: { inject, register },
    }
    apply(ctx as never)
    expect(inject).toHaveBeenCalledWith('plugins.tab', expect.any(Function))
    expect(register).toHaveBeenCalledWith(expect.objectContaining({ name: 'plugins.tab', id: 'dsh-plaza', order: 10 }), expect.any(Function))
    expect(registerLocale).toHaveBeenCalledOnce()
  })
})
