import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { LocalizedText } from '@deepseek-ai/dsh-package-manifest'
import type { MarketEntry, MarketIndexSummary, MarketSearchResult, PluginDetail, PluginTabProps, RemoteResult } from './contracts.js'
import { INITIAL_QUERY, activeFilterCount, storageKey, toggleLabel, type PlazaQuery, type ViewMode } from './query.js'
import type { ClientContext } from './contracts.js'
import plazaCss from './plaza.css?inline'

const PAGE_SIZE = 50

interface PlazaProps extends PluginTabProps {
  readonly ctx: ClientContext
  readonly t: (key: import('./locales.js').LocaleKey, params?: Record<string, string | number>) => string
}

function resolve(ctx: ClientContext, value: LocalizedText | undefined, fallback: string): string {
  return value === undefined ? fallback : ctx.locale.resolveText(value)
}

function Card({ entry, onOpen, ctx, t }: { entry: MarketEntry; onOpen(): void; ctx: ClientContext; t: PlazaProps['t'] }) {
  const version = entry.defaultVersion ?? entry.versions[0]?.version ?? '—'
  const compatible = entry.versions.find(item => item.version === version)?.compatibility?.compatible
  return <article className="plaza-card">
    <button className="plaza-card-main" type="button" onClick={onOpen} aria-label={`${t('details')}: ${entry.name}`}>
      <span className="plaza-icon" aria-hidden="true">{entry.name.slice(0, 1).toUpperCase()}</span>
      <span className="plaza-card-copy">
        <strong>{resolve(ctx, entry.title, entry.name)}</strong>
        <span className="plaza-package">{entry.name}</span>
        <span className="plaza-description">{resolve(ctx, entry.description, entry.name)}</span>
      </span>
    </button>
    <div className="plaza-card-tags">{entry.metadata.category && <span>{entry.metadata.category}</span>}{entry.metadata.labels.slice(0, 2).map(label => <span key={label}>{label}</span>)}</div>
    <footer><span>{compatible === true ? t('compatible') : compatible === false ? t('incompatible') : t('compatibilityUnknown')}</span><span>{version}</span></footer>
  </article>
}

export function Plaza(props: PlazaProps) {
  const { ctx, t } = props
  useEffect(() => {
    const tag = document.createElement('style')
    tag.dataset.plugin = 'dsh-plaza'
    tag.textContent = plazaCss
    document.head.appendChild(tag)
    return () => tag.remove()
  }, [])
  const [indexes, setIndexes] = useState<readonly MarketIndexSummary[]>([])
  const [source, setSource] = useState('')
  const [query, setQuery] = useState<PlazaQuery>(INITIAL_QUERY)
  const [draft, setDraft] = useState('')
  const [view, setView] = useState<ViewMode>(() => localStorage.getItem('dsh-plaza:view') === 'list' ? 'list' : 'grid')
  const [result, setResult] = useState<MarketSearchResult | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [selected, setSelected] = useState<MarketEntry | null>(null)
  const [detail, setDetail] = useState<PluginDetail | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef(0)

  const load = async (url: string, next: PlazaQuery, append = false) => {
    const request = ++requestRef.current
    setStatus('loading')
    const previous = append ? result : null
    const answer = await ctx.remote.pluginMarket.search(url, {
      ...(next.text.trim() ? { text: next.text.trim() } : {}),
      ...(next.category ? { category: next.category } : {}),
      ...(next.labels.length ? { labels: next.labels } : {}),
      sort: next.sort,
      offset: previous?.entries.length ?? 0,
      limit: PAGE_SIZE,
      ...(previous ? { fetchedAt: previous.fetchedAt } : {}),
    })
    if (request !== requestRef.current) return
    if (!answer.ok) { setStatus('error'); return }
    setResult(previous ? { ...answer.value, entries: [...previous.entries, ...answer.value.entries] } : answer.value)
    setStatus('ready')
  }

  useEffect(() => {
    let active = true
    void ctx.remote.pluginMarket.listIndexes().then((answer: RemoteResult<MarketIndexSummary[]>) => {
      if (!active) return
      if (!answer.ok) { setStatus('error'); return }
      setIndexes(answer.value)
      const url = answer.value[0]?.url ?? ''
      setSource(url)
      if (!url) { setStatus('ready'); return }
      const saved = localStorage.getItem(storageKey(url))
      const restored = saved ? { ...INITIAL_QUERY, ...JSON.parse(saved) } as PlazaQuery : INITIAL_QUERY
      setQuery(restored); setDraft(restored.text); void load(url, restored)
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!source) return
    const handle = window.setTimeout(() => {
      const next = { ...query, text: draft, sort: draft.trim() && query.sort.kind === 'index' ? { kind: 'relevance' as const } : query.sort }
      setQuery(next); localStorage.setItem(storageKey(source), JSON.stringify(next)); void load(source, next)
    }, 250)
    return () => window.clearTimeout(handle)
  }, [draft])

  const updateQuery = (next: PlazaQuery) => {
    setQuery(next); setDraft(next.text)
    if (source) { localStorage.setItem(storageKey(source), JSON.stringify(next)); void load(source, next) }
  }
  const open = async (entry: MarketEntry) => {
    setSelected(entry); setDetail(null)
    const version = entry.defaultVersion ?? entry.versions[0]?.version
    if (!version || !source) return
    const answer = await ctx.remote.pluginMarket.readEntryDetail(source, entry.name, version, ctx.locale.getLocale().active)
    if (answer.ok) setDetail(answer.value)
  }
  const categories = Object.entries(result?.metadata.categories ?? {})
  const labels = Object.entries(result?.metadata.labels ?? {})
  const chips = useMemo(() => [query.category, ...query.labels].filter(Boolean), [query])

  if (selected) return <section className="plaza-detail" aria-labelledby="plaza-detail-title">
    <button type="button" className="plaza-back" onClick={() => setSelected(null)}>← {t('close')}</button>
    <header><span className="plaza-icon" aria-hidden="true">{selected.name.slice(0, 1).toUpperCase()}</span><div><h2 id="plaza-detail-title">{resolve(ctx, selected.title, selected.name)}</h2><p>{selected.name}</p></div></header>
    <p>{resolve(ctx, selected.description, '')}</p>
    <div className="plaza-detail-body">{detail === null ? t('loading') : detail.status === 'found' ? <pre>{detail.markdown}</pre> : t('noDetail')}</div>
  </section>

  return <section className="plaza" aria-labelledby="plaza-title">
    <div className="plaza-scroll" ref={scrollRef}>
      <header className="plaza-heading"><div><h2 id="plaza-title">{t('title')}</h2><p>{t('subtitle')}</p></div>
        <select aria-label={t('source')} value={source} onChange={event => { const url = event.target.value; setSource(url); void load(url, query) }}>
          {indexes.map(index => <option value={index.url} key={index.url}>{resolve(ctx, index.title, index.url)}</option>)}
        </select>
      </header>
      <div className="plaza-toolbar">
        <input type="search" value={draft} onChange={event => setDraft(event.target.value)} placeholder={t('search')} aria-label={t('search')} />
        <select aria-label={t('allCategories')} value={query.category} onChange={event => updateQuery({ ...query, category: event.target.value })}>
          <option value="">{t('allCategories')}</option>{categories.map(([id, item]) => <option key={id} value={id}>{resolve(ctx, item.title, id)}</option>)}
        </select>
        <select aria-label={t('sort')} value={query.sort.kind} onChange={event => updateQuery({ ...query, sort: event.target.value === 'published' ? { kind: 'published', direction: 'desc' } : event.target.value === 'relevance' ? { kind: 'relevance' } : { kind: 'index' } })}>
          <option value="index">{t('sortIndex')}</option><option value="relevance">{t('sortRelevance')}</option><option value="published">{t('sortNewest')}</option>
        </select>
        <div className="plaza-view" role="group" aria-label="View"><button type="button" aria-pressed={view === 'grid'} onClick={() => { setView('grid'); localStorage.setItem('dsh-plaza:view', 'grid') }}>▦</button><button type="button" aria-pressed={view === 'list'} onClick={() => { setView('list'); localStorage.setItem('dsh-plaza:view', 'list') }}>☷</button></div>
      </div>
      {labels.length > 0 && <fieldset className="plaza-labels"><legend>{t('labels')}</legend>{labels.map(([id, item]) => <label key={id}><input type="checkbox" checked={query.labels.includes(id)} onChange={() => updateQuery({ ...query, labels: toggleLabel(query.labels, id) })} />{resolve(ctx, item.title, id)}</label>)}</fieldset>}
      {activeFilterCount(query) > 0 && <div className="plaza-chips">{query.text && <button onClick={() => updateQuery({ ...query, text: '' })}>“{query.text}” ×</button>}{chips.map(chip => <button key={chip} onClick={() => updateQuery(chip === query.category ? { ...query, category: '' } : { ...query, labels: query.labels.filter(value => value !== chip) })}>{chip} ×</button>)}<button onClick={() => updateQuery(INITIAL_QUERY)}>{t('clear')}</button></div>}
      <div className="plaza-result-meta" aria-live="polite">{result && t('results', { count: result.total })}</div>
      {status === 'error' ? <div className="plaza-state">{t('error')}<button onClick={() => void load(source, query)}>{t('retry')}</button></div> : status === 'loading' && !result ? <div className="plaza-state">{t('loading')}</div> : result?.entries.length === 0 ? <div className="plaza-state">{t('empty')}</div> : <div className={view === 'grid' ? 'plaza-grid' : 'plaza-list'}>{result?.entries.map(entry => <Card key={entry.name} entry={entry} onOpen={() => void open(entry)} ctx={ctx} t={t} />)}</div>}
      {result?.nextOffset !== null && result?.nextOffset !== undefined && <button className="plaza-more" type="button" onClick={() => void load(source, query, true)}>{t('more')}</button>}
    </div>
  </section>
}
