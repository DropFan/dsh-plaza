import React, { StrictMode } from 'react'
import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Plaza } from '../src/client/Plaza.js'
import { PlazaController } from '../src/client/controller.js'

function context(listIndexes = vi.fn().mockResolvedValue({ ok: true, value: [] })) {
  const listeners = new Set<() => void>()
  const locale = { active: 'en', locales: [], revision: 0 }
  return {
    ctx: {
      locale: {
        getLocale: () => locale, getSnapshot: () => locale,
        subscribe: (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener) },
        resolveText: (text: string | Record<string, string>) => typeof text === 'string' ? text : text.en ?? '',
      },
      remote: { pluginMarket: { listIndexes, search: vi.fn(), readEntryDetail: vi.fn() }, $on: vi.fn(() => () => {}) },
      on: vi.fn(() => () => {}),
    },
    listIndexes,
  }
}

const t = (key: string) => key

describe('Plaza lifecycle', () => {
  it('survives React StrictMode effect replay and shows empty-source state', async () => {
    const { ctx, listIndexes } = context()
    const controller = new PlazaController(ctx.remote.pluginMarket as never)
    render(<StrictMode><Plaza ctx={ctx as never} controller={controller} t={t as never} install={vi.fn()} openPackage={vi.fn()} /></StrictMode>)
    await act(async () => {})
    expect(listIndexes).toHaveBeenCalled()
    expect(screen.getByText('empty')).toBeInTheDocument()
    expect(controller.getSnapshot().indexesStatus).toBe('ready')
  })
})
