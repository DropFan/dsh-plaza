import React, { StrictMode } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Plaza } from '../src/client/Plaza.js'
import { PlazaController } from '../src/client/controller.js'

function context(listIndexes = vi.fn().mockResolvedValue({ ok: true, value: [] })) {
  const listeners = new Set<() => void>()
  const locale = { active: 'en', locales: [], revision: 0 }
  const search = vi.fn()
  const readEntryDetail = vi.fn()
  return {
    ctx: {
      locale: {
        getLocale: () => locale, getSnapshot: () => locale,
        subscribe: (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener) },
        resolveText: (text: string | Record<string, string>) => typeof text === 'string' ? text : text[locale.active] ?? text.en ?? '',
      },
      remote: { pluginMarket: { listIndexes, search, readEntryDetail }, $on: vi.fn(() => () => {}) },
      on: vi.fn(() => () => {}),
    },
    listIndexes,
  }
}

const t = (key: string, params?: Record<string, string | number>) => params?.count === undefined ? key : `${key}:${params.count}`

function marketResult() {
  const version = (value: string, update = false) => ({
    version: value, publishTimestamp: 1, source: { type: 'git', url: 'https://example.test/plugin.git', commit: '1234567890abcdef1234567890abcdef12345678' },
    engines: {}, install: { spec: `git+https://example.test/plugin.git#${value}` }, compatibility: { compatible: true }, ...(update ? { update: true } : {}),
  })
  return {
    url: 'https://example.test/index.json', title: 'Test', fetchedAt: 1, total: 1, nextOffset: null,
    metadata: { categories: {}, labels: {}, sortKeys: {} },
    entries: [{
      name: 'plugin', defaultVersion: '2.0.0', versions: [version('2.0.0', true), version('1.0.0')],
      metadata: { keywords: [], labels: [], sortKeys: {} }, installation: { status: 'update-available', installedVersion: '1.0.0' },
    }],
  }
}

describe('Plaza lifecycle', () => {
  it('routes the Git update button to owner.update and exposes the filter panel state', async () => {
    const listIndexes = vi.fn().mockResolvedValue({ ok: true, value: [{ url: 'https://example.test/index.json', title: 'Test' }] })
    const { ctx } = context(listIndexes)
    ctx.remote.pluginMarket.search.mockResolvedValue({ ok: true, value: marketResult() })
    ctx.remote.pluginMarket.readEntryDetail.mockResolvedValue({ ok: true, value: { status: 'none' } })
    const controller = new PlazaController({ ...ctx.remote, pluginRegistryProbe: { fastest: vi.fn().mockResolvedValue({ ok: false }) } } as never)
    const install = vi.fn()
    const update = vi.fn()
    render(<Plaza ctx={ctx as never} controller={controller} t={t as never} install={install} update={update} openPackage={vi.fn()} />)

    await screen.findByLabelText('details: plugin')
    const toggle = screen.getByRole('button', { name: 'filters:0' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(screen.getByLabelText('details: plugin'))
    fireEvent.click(await screen.findByRole('button', { name: 'updateVersion' }))

    expect(update).toHaveBeenCalledWith({ packageName: 'plugin', version: '2.0.0', spec: 'git+https://example.test/plugin.git#2.0.0' })
    expect(install).not.toHaveBeenCalled()
  })

  it('survives React StrictMode effect replay and shows empty-source state', async () => {
    const { ctx, listIndexes } = context()
    const controller = new PlazaController({ ...ctx.remote, pluginRegistryProbe: { fastest: vi.fn() } } as never)
    render(<StrictMode><Plaza ctx={ctx as never} controller={controller} t={t as never} install={vi.fn()} update={vi.fn()} openPackage={vi.fn()} /></StrictMode>)
    await act(async () => {})
    expect(listIndexes).toHaveBeenCalled()
    expect(screen.getByText('empty')).toBeInTheDocument()
    expect(controller.getSnapshot().indexesStatus).toBe('ready')
  })
})
