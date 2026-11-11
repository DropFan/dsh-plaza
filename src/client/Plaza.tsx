import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { LocalizedText } from '@deepseek-ai/dsh-package-manifest'
import type { MarketEntry, MarketIndexSummary, PluginDetail, PluginTabProps } from './contracts.js'
import type { ClientContext } from './contracts.js'
import { Markdown, safeExternal } from './Markdown.js'
import { DETAIL_TIMEOUT_MS, PAGE_SIZE, PlazaController, type DetailState } from './controller.js'
import {
  DEFAULT_PREFERENCES, readPreferences, sourcePreference, updateSourcePreference, writePreferences, type PlazaPreferences,
} from './persistence.js'
import { INITIAL_QUERY, activeFilterCount, declaredQuery, toggleLabel, withText, type PlazaQuery, type ViewMode } from './query.js'
import plazaCss from './plaza.css?inline'
import { PLAZA_VERSION } from './version.js'
import { canonicalIndexUrl, sourceAlreadyExists } from './sources.js'
import { presentedVersion, requestInstall, sourceLabel, versionInstallable, type MarketVersion } from './install.js'

interface PlazaProps extends PluginTabProps {
  readonly ctx: ClientContext
  readonly controller: PlazaController
  readonly t: (key: import('./locales.js').LocaleKey, params?: Record<string, string | number>) => string
}

function resolve(ctx: ClientContext, value: LocalizedText | undefined, fallback: string): string {
  return value === undefined ? fallback : ctx.locale.resolveText(value)
}

function formatDate(timestamp: number, language: string): string {
  return new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(new Date(timestamp * 1000))
}

function PluginIcon({ entry }: { readonly entry: MarketEntry }) {
  const [failed, setFailed] = useState(false)
  return <span className="plaza-icon" aria-hidden="true">{entry.icon !== undefined && !failed
    ? <img src={entry.icon} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
    : entry.name.slice(0, 1).toUpperCase()}</span>
}

function Card({ entry, onOpen, onInstall, onOpenInstalled, ctx, t, language, labels, category }: {
  readonly entry: MarketEntry; onOpen(): void; onInstall(): void; onOpenInstalled(): void
  readonly ctx: ClientContext; readonly t: PlazaProps['t']; readonly language: string
  readonly labels: Readonly<Record<string, { readonly title: LocalizedText }>>; readonly category: LocalizedText | undefined
}) {
  const version = presentedVersion(entry)
  const shownLabels = entry.metadata.labels.slice(0, 2)
  const status = entry.installation.status
  return <article className="plaza-card" data-market-entry={entry.name}>
    <button className="plaza-card-main" type="button" onClick={onOpen} aria-label={`${t('details')}: ${entry.name}`}>
      <PluginIcon entry={entry} />
      <span className="plaza-card-copy">
        <strong>{resolve(ctx, entry.title, entry.name)}</strong>
        <span className="plaza-package">{entry.name}</span>
        <span className="plaza-description">{resolve(ctx, entry.description, entry.name)}</span>
        <span className="plaza-meta">{entry.author ? `${entry.author} · ` : ''}{formatDate(version.publishTimestamp, language)}</span>
      </span>
    </button>
    <div className="plaza-card-tags">
      {category && <span>{resolve(ctx, category, entry.metadata.category ?? '')}</span>}
      {shownLabels.map(id => <span key={id}>{resolve(ctx, labels[id]?.title, id)}</span>)}
      {entry.metadata.labels.length > shownLabels.length && <span>+{entry.metadata.labels.length - shownLabels.length}</span>}
    </div>
    <footer>
      <span>{version.compatibility.compatible ? t('compatible') : version.compatibility.exempted ? t('compatibilityExempted') : t('incompatible')}</span>
      {status === 'not-installed'
        ? <button type="button" className="plaza-action" disabled={!versionInstallable(version)} onClick={event => { event.stopPropagation(); onInstall() }}>{t('install')}</button>
        : <button type="button" className="plaza-action" onClick={event => { event.stopPropagation(); onOpenInstalled() }}>{status === 'update-available' ? t('update') : status === 'provided' ? t('provided') : t('installed')}</button>}
    </footer>
  </article>
}

function detailImage(document: string, path: string): string | undefined {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/iu.test(path)) return undefined
  return new URL(`api/plugin-market/detail-file?document=${encodeURIComponent(document)}&path=${encodeURIComponent(path)}`, documentBase()).href
}

function documentBase(): string { return typeof document === 'undefined' ? 'http://localhost/' : document.baseURI }

export function Plaza({ ctx, controller, t, install, openPackage }: PlazaProps) {
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot)
  const localeSnapshot = useSyncExternalStore(ctx.locale.subscribe.bind(ctx.locale), ctx.locale.getSnapshot.bind(ctx.locale), ctx.locale.getSnapshot.bind(ctx.locale))
  const [preferences, setPreferences] = useState<PlazaPreferences>(() => typeof localStorage === 'undefined' ? DEFAULT_PREFERENCES : readPreferences(localStorage))
  const preferencesRef = useRef(preferences)
  const [source, setSourceState] = useState('')
  const sourceRef = useRef('')
  const setSource = (url: string) => { sourceRef.current = url; setSourceState(url) }
  const [query, setQuery] = useState<PlazaQuery>(INITIAL_QUERY)
  const [draft, setDraft] = useState('')
  const [view, setViewState] = useState<ViewMode>(preferences.view)
  const [selected, setSelected] = useState<MarketEntry | null>(null)
  const [editingSources, setEditingSources] = useState(false)
  const [sourceDraft, setSourceDraft] = useState('')
  const [sourceError, setSourceError] = useState<'duplicate' | 'invalid' | 'unavailable' | 'error' | null>(null)
  const [savingSource, setSavingSource] = useState(false)
  const selectedRef = useRef<MarketEntry | null>(null)
  const [detail, setDetail] = useState<DetailState | null>(null)
  const [detailRequest, setDetailRequest] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollPosition = useRef(0)
  const returnFocus = useRef<HTMLElement | null>(null)
  const restoringScroll = useRef(false)
  const language = localeSnapshot.active
  const result = state.listing?.value ?? null
  const status = state.listing?.status ?? (state.indexesStatus === 'error' ? 'error' : state.indexesStatus === 'ready' ? 'empty' : 'loading')

  useEffect(() => {
    const tag = document.createElement('style'); tag.dataset.plugin = 'dsh-plaza'; tag.textContent = plazaCss; document.head.appendChild(tag)
    return () => tag.remove()
  }, [])
  useEffect(() => {
    void controller.loadIndexes().then(indexes => {
      if (indexes === null) return
      const preferred = preferences.selectedSource
      const url = preferred && indexes.some(index => index.url === preferred) ? preferred : indexes[0]?.url ?? ''
      if (!url) return
      if (url !== preferred) save({ ...preferencesRef.current, selectedSource: url })
      const saved = sourcePreference(preferencesRef.current, url)
      setSource(url); setQuery(saved.query); setDraft(saved.query.text); restoringScroll.current = true
      void controller.load(url, saved.query, saved.loadedCount)
    })
  }, [controller])
  useEffect(() => {
    const disposers = [
      ctx.remote.$on('plugin-market/changed', () => { void controller.sourcesChanged() }),
      ctx.remote.$on('plugin-manager/changed', () => { const listing = controller.getSnapshot().listing; if (listing) void controller.load(listing.url, listing.query, Math.max(PAGE_SIZE, listing.value?.entries.length ?? PAGE_SIZE)) }),
      ctx.on('connection/reset' as never, () => { setDetail(null); void controller.connectionReset().then(() => { const entry = selectedRef.current; if (entry !== null) void readDetail(entry) }) }),
    ]
    return () => { for (const dispose of disposers) dispose() }
  }, [controller, ctx])
  useEffect(() => {
    if (!restoringScroll.current || status !== 'ready' || !source) return
    restoringScroll.current = false
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: sourcePreference(preferences, source).scrollY }))
  }, [status, source])
  useEffect(() => {
    if (!source || draft === query.text) return
    const handle = window.setTimeout(() => applyQuery(withText(query, draft)), 250)
    return () => window.clearTimeout(handle)
  }, [draft, query, source])
  useEffect(() => {
    if (selected === null) return
    const listener = (event: KeyboardEvent) => { if (event.key === 'Escape') closeDetail() }
    document.addEventListener('keydown', listener)
    return () => document.removeEventListener('keydown', listener)
  }, [selected])
  useEffect(() => {
    if (detail?.status !== 'loading') return
    const request = detailRequest
    const timer = window.setTimeout(() => {
      setDetail(current => current?.status === 'loading' && request === detailRequest
        ? { status: 'error', failure: 'timeout' } : current)
    }, DETAIL_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [detail?.status, detailRequest])

  const save = (next: PlazaPreferences) => { preferencesRef.current = next; setPreferences(next); writePreferences(localStorage, next) }
  const remember = (patch: Parameters<typeof updateSourcePreference>[2]) => { if (source) save(updateSourcePreference(preferencesRef.current, source, patch)) }
  const rememberScroll = () => remember({ scrollY: scrollPosition.current, loadedCount: result?.entries.length ?? PAGE_SIZE })
  const applyQuery = (next: PlazaQuery) => {
    setQuery(next); setDraft(next.text); remember({ query: next, loadedCount: PAGE_SIZE, scrollY: 0 }); void controller.load(source, next)
  }
  const chooseSource = (url: string) => {
    rememberScroll()
    const saved = sourcePreference(preferencesRef.current, url)
    setSource(url); setQuery(saved.query); setDraft(saved.query.text); restoringScroll.current = true
    save({ ...preferencesRef.current, selectedSource: url }); void controller.load(url, saved.query, saved.loadedCount)
  }
  const setView = (next: ViewMode) => { setViewState(next); save({ ...preferencesRef.current, view: next }) }
  const installVersion = (entry: MarketEntry, version: MarketVersion) => {
    requestInstall(install, entry, version, resolve(ctx, entry.title, entry.name))
  }
  const readDetail = async (entry: MarketEntry) => {
    setDetailRequest(value => value + 1)
    setDetail({ status: 'loading' })
    const version = presentedVersion(entry)
    const answer = await controller.readDetail(sourceRef.current, entry.name, version.version, language)
    if (answer !== null) setDetail(answer)
  }
  const openDetail = async (entry: MarketEntry, target: HTMLElement) => {
    returnFocus.current = target; rememberScroll(); selectedRef.current = entry; setSelected(entry)
    await readDetail(entry)
  }
  const closeDetail = () => {
    controller.invalidateDetails(); selectedRef.current = null; setSelected(null); setDetail(null)
    requestAnimationFrame(() => { returnFocus.current?.focus(); const top = sourcePreference(preferencesRef.current, source).scrollY; scrollRef.current?.scrollTo({ top }) })
  }
  const showMore = async () => { await controller.more(); const count = controller.getSnapshot().listing?.value?.entries.length; if (count) remember({ loadedCount: count }) }
  const addSource = async () => {
    const draft = sourceDraft.trim()
    if (!draft) return
    const url = canonicalIndexUrl(draft)
    if (url === undefined) { setSourceError('invalid'); return }
    if (sourceAlreadyExists(state.indexes.map(index => index.url), url)) { setSourceError('duplicate'); return }
    setSavingSource(true); setSourceError(null)
    const saved = await controller.setIndexes([...state.indexes.map(index => index.url), url])
    setSavingSource(false)
    if (saved !== 'saved') { setSourceError(saved); return }
    setSourceDraft(''); setEditingSources(false); setSource(url)
    const next = sourcePreference(preferencesRef.current, url)
    setQuery(next.query); setDraft(next.query.text); save({ ...preferencesRef.current, selectedSource: url })
    void controller.load(url, next.query, next.loadedCount)
  }
  const removeSource = async (url: string) => {
    setSavingSource(true); setSourceError(null)
    const saved = await controller.setIndexes(state.indexes.map(index => index.url).filter(item => item !== url))
    setSavingSource(false)
    if (saved !== 'saved') setSourceError(saved)
  }

  const metadata = result?.metadata
  useEffect(() => {
    if (!metadata) return
    const reduced = declaredQuery(query, metadata)
    if (reduced !== query) applyQuery(reduced)
  }, [metadata])
  const categories = Object.entries(metadata?.categories ?? {})
  const labels = Object.entries(metadata?.labels ?? {})
  const sortKeys = Object.entries(metadata?.sortKeys ?? {})
  const chips = [query.category, ...query.labels].filter(Boolean)

  if (selected !== null) {
    const version = presentedVersion(selected)
    const doc = detail?.status === 'ready' && detail.detail.status === 'found' ? detail.detail : undefined
    return <section className="plaza-detail" aria-labelledby="plaza-detail-title">
      <button type="button" className="plaza-back" autoFocus onClick={closeDetail}>← {t('back')}</button>
      <header><PluginIcon entry={selected} /><div className="plaza-detail-heading"><h2 id="plaza-detail-title">{resolve(ctx, selected.title, selected.name)}</h2><p>{selected.name} · {version.version}</p></div>{selected.installation.status === 'not-installed'
        ? <button type="button" className="plaza-action" disabled={!versionInstallable(version)} onClick={() => installVersion(selected, version)}>{t('install')}</button>
        : <button type="button" className="plaza-action" onClick={() => openPackage(selected.name)}>{t('openInstalled')}</button>}</header>
      <p>{resolve(ctx, selected.description, '')}</p>
      {!version.compatibility.compatible && <p className="plaza-notice" role="note">{version.compatibility.exempted ? t('compatibilityExempted') : t('incompatible')}</p>}
      <div className="plaza-detail-body">{detail?.status === 'loading' || detail === null ? t('detailLoading') : detail.status === 'error' ? <><p>{t(detail.failure === 'timeout' ? 'detailTimeout' : 'detailError')}</p><button onClick={() => void readDetail(selected)}>{t('retry')}</button></> : doc === undefined ? t('noDetail') : <Markdown source={doc.markdown} resolveImage={path => detailImage(doc.document, path)} />}</div>
      <section className="plaza-versions" aria-labelledby="plaza-versions-title">
        <h3 id="plaza-versions-title">{t('versions')}</h3>
        <ul>{selected.versions.map(item => {
          const current = selected.installation.installedVersion === item.version
          const offered = selected.installation.status !== 'provided' && !current && versionInstallable(item)
          return <li key={item.version}><div><strong>{item.version}</strong>{item.version === selected.defaultVersion && <span className="plaza-badge">{t('recommended')}</span>}{current && <span className="plaza-badge">{t('current')}</span>}{!item.compatibility.compatible && item.compatibility.exempted && <span className="plaza-badge">{t('compatibilityExempted')}</span>}<span>{formatDate(item.publishTimestamp, language)}</span><small>{sourceLabel(selected.name, item)}</small></div>{offered && <button type="button" className="plaza-action" onClick={() => installVersion(selected, item)}>{t('installVersion', { version: item.version })}</button>}{!versionInstallable(item) && <span className="plaza-version-status">{t('incompatible')}</span>}</li>
        })}</ul>
      </section>
      <dl className="plaza-facts">
        {selected.author && <div><dt>{t('author')}</dt><dd>{selected.author}</dd></div>}
        {selected.homepage && safeExternal(selected.homepage) && <div><dt>{t('homepage')}</dt><dd><a href={safeExternal(selected.homepage)} target="_blank" rel="noopener noreferrer">{selected.homepage} ↗</a></dd></div>}
        {selected.repository && safeExternal(selected.repository.url) && <div><dt>{t('sourceCode')}</dt><dd><a href={safeExternal(selected.repository.url)} target="_blank" rel="noopener noreferrer">{selected.repository.url} ↗</a></dd></div>}
      </dl>
    </section>
  }

  return <section className="plaza" aria-labelledby="plaza-title"><div className="plaza-scroll" ref={scrollRef} onScroll={event => { scrollPosition.current = event.currentTarget.scrollTop }} onPointerUp={rememberScroll} onKeyUp={rememberScroll}>
    <header className="plaza-heading"><div><h2 id="plaza-title">{t('title')} <span className="plaza-version">Beta {PLAZA_VERSION}</span></h2><p>{t('subtitle')}</p></div><div className="plaza-source-controls"><select aria-label={t('source')} value={source} disabled={state.indexes.length === 0} onChange={event => chooseSource(event.target.value)}>{state.indexes.length === 0 && <option value="">{t('noSources')}</option>}{state.indexes.map((index: MarketIndexSummary) => <option value={index.url} key={index.url}>{resolve(ctx, index.title, index.url)}</option>)}</select><button type="button" onClick={() => setEditingSources(value => !value)}>{t('manageSources')}</button></div></header>
    {editingSources && <section className="plaza-sources" aria-labelledby="plaza-sources-title"><h3 id="plaza-sources-title">{t('sourcesTitle')}</h3><p>{t('sourcesTrust')}</p><ul>{state.indexes.map(index => <li key={index.url}><span>{index.url}</span><button type="button" disabled={savingSource} onClick={() => void removeSource(index.url)}>{t('removeSource')}</button></li>)}</ul><div className="plaza-source-add"><input type="url" value={sourceDraft} onChange={event => setSourceDraft(event.target.value)} placeholder="https://example.com/index.json" aria-label={t('sourceUrl')} /><button type="button" disabled={savingSource || sourceDraft.trim() === ''} onClick={() => void addSource()}>{t('addSource')}</button></div>{sourceError !== null && <p className="plaza-source-error" role="alert">{t(sourceError === 'duplicate' ? 'sourceDuplicate' : sourceError === 'invalid' ? 'sourceInvalid' : sourceError === 'unavailable' ? 'sourceUnavailable' : 'sourceError')}</p>}</section>}
    <div className="plaza-toolbar">
      <input type="search" value={draft} onChange={event => setDraft(event.target.value)} placeholder={t('search')} aria-label={t('search')} />
      <select aria-label={t('allCategories')} value={query.category} onChange={event => applyQuery({ ...query, category: event.target.value })}><option value="">{t('allCategories')}</option>{categories.map(([id, item]) => <option key={id} value={id}>{resolve(ctx, item.title, id)}</option>)}</select>
      <select aria-label={t('sort')} value={query.sort.kind === 'key' ? `key:${query.sort.id}` : query.sort.kind} onChange={event => { const value = event.target.value; applyQuery({ ...query, sort: value.startsWith('key:') ? { kind: 'key', id: value.slice(4), direction: metadata!.sortKeys[value.slice(4)]?.order ?? 'asc' } : value === 'published' ? { kind: 'published', direction: 'desc' } : value === 'relevance' ? { kind: 'relevance' } : { kind: 'index' } }) }}>
        <option value="index">{t('sortIndex')}</option><option value="relevance">{t('sortRelevance')}</option><option value="published">{t('sortNewest')}</option>{sortKeys.map(([id, item]) => <option key={id} value={`key:${id}`}>{resolve(ctx, item.title, id)}</option>)}
      </select>
      <div className="plaza-view" role="group" aria-label={t('view')}><button type="button" aria-label={t('viewGrid')} aria-pressed={view === 'grid'} onClick={() => setView('grid')}>▦</button><button type="button" aria-label={t('viewList')} aria-pressed={view === 'list'} onClick={() => setView('list')}>☷</button></div>
    </div>
    {labels.length > 0 && <fieldset className="plaza-labels"><legend>{t('labels')}</legend>{labels.map(([id, item]) => <label key={id}><input type="checkbox" checked={query.labels.includes(id)} onChange={() => applyQuery({ ...query, labels: toggleLabel(query.labels, id) })} />{resolve(ctx, item.title, id)}</label>)}</fieldset>}
    {activeFilterCount(query) > 0 && <div className="plaza-chips">{query.text && <button aria-label={t('removeFilter', { name: query.text })} onClick={() => applyQuery(withText(query, ''))}>“{query.text}” ×</button>}{chips.map(chip => <button key={chip} aria-label={t('removeFilter', { name: chip })} onClick={() => applyQuery(chip === query.category ? { ...query, category: '' } : { ...query, labels: query.labels.filter(value => value !== chip) })}>{chip} ×</button>)}<button onClick={() => applyQuery(INITIAL_QUERY)}>{t('clear')}</button></div>}
    <div className="plaza-result-meta" aria-live="polite">{result && t('results', { count: result.total })}</div>
    {status === 'error' ? <div className="plaza-state">{t('error')}<button onClick={() => void controller.load(source, query, Math.max(PAGE_SIZE, result?.entries.length ?? PAGE_SIZE))}>{t('retry')}</button></div> : status === 'loading' && !result ? <div className="plaza-state">{t('loading')}</div> : status === 'empty' || result?.entries.length === 0 ? <div className="plaza-state">{t('empty')}</div> : <div className={view === 'grid' ? 'plaza-grid' : 'plaza-list'}>{result?.entries.map(entry => <Card key={entry.name} entry={entry} onOpen={() => void openDetail(entry, document.activeElement as HTMLElement)} onInstall={() => installVersion(entry, presentedVersion(entry))} onOpenInstalled={() => openPackage(entry.name)} ctx={ctx} t={t} language={language} labels={metadata?.labels ?? {}} category={entry.metadata.category ? metadata?.categories[entry.metadata.category]?.title : undefined} />)}</div>}
    {result?.nextOffset != null && <button className="plaza-more" type="button" disabled={status === 'more'} onClick={() => void showMore()}>{status === 'more' ? t('loading') : t('more')}</button>}
  </div></section>
}
