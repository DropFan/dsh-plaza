import React from 'react'
import { Plaza } from './Plaza.js'
import type { ClientContext, PluginTabProps } from './contracts.js'
import { PlazaController } from './controller.js'
import { en, zh, type LocaleKey } from './locales.js'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    dshPlaza: LocaleKey
  }
}

const NS = 'dshPlaza'

export const inject = ['slots', 'locale', 'remote', 'remote.pluginMarket', 'remote.pluginRegistryProbe']

export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-plaza: locale')
  const controller = new PlazaController(ctx.remote)
  ctx.effect(() => () => controller.dispose(), 'dsh-plaza: controller')
  const t = ctx.locale.bind(NS)
  ctx.slots.inject('plugins.tab', () => ctx.slots.register({
    name: 'plugins.tab',
    id: 'dsh-plaza',
    order: 10,
    label: () => t('tab'),
    locale: NS,
  }, (owner: PluginTabProps) => React.createElement(Plaza, { ...owner, ctx, controller, t })))
}
