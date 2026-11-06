window.__ModuleLoader__.load({ id: 'dsh-plaza', factory: (require) => { var module = { exports: {} }; var exports = module.exports;
//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion
let react = require("react");
react = __toESM(react);
let react_jsx_runtime = require("react/jsx-runtime");
react_jsx_runtime = __toESM(react_jsx_runtime);

//#region src/client/Markdown.tsx
const TOKEN = /(!?\[[^\]]*\]\([^\s)]+(?:\s+"[^"]*")?\)|`[^`]+`|\*\*[^*]+\*\*)/g;
const LINK = /^(!?)\[([^\]]*)\]\(([^\s)]+)(?:\s+"[^"]*")?\)$/;
function safeExternal(value) {
	try {
		const url = new URL(value);
		return url.protocol === "https:" || url.protocol === "http:" || url.protocol === "mailto:" ? url.href : void 0;
	} catch {
		return;
	}
}
function inline(text, resolveImage) {
	return text.split(TOKEN).filter(Boolean).map((part, index) => {
		if (part.startsWith("`") && part.endsWith("`")) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: part.slice(1, -1) }, index);
		if (part.startsWith("**") && part.endsWith("**")) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: part.slice(2, -2) }, index);
		const match = LINK.exec(part);
		if (match === null) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react.Fragment, { children: part }, index);
		const [, image, label = "", destination = ""] = match;
		if (image === "!") {
			const src = resolveImage(destination);
			return src === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react.Fragment, { children: label }, index) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
				src,
				alt: label,
				loading: "lazy",
				referrerPolicy: "no-referrer"
			}, index);
		}
		const href = safeExternal(destination);
		return href === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react.Fragment, { children: label }, index) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("a", {
			href,
			target: "_blank",
			rel: "noopener noreferrer",
			children: [
				label,
				" ",
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					"aria-hidden": "true",
					children: "↗"
				})
			]
		}, index);
	});
}
function Markdown({ source, resolveImage }) {
	const blocks = [];
	const lines = source.replace(/\r\n?/g, "\n").split("\n");
	let paragraph = [];
	let list = [];
	let code = null;
	const flush = () => {
		if (paragraph.length) {
			blocks.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: inline(paragraph.join(" "), resolveImage) }, `p-${blocks.length}`));
			paragraph = [];
		}
		if (list.length) {
			blocks.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", { children: list.map((item, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: inline(item, resolveImage) }, index)) }, `l-${blocks.length}`));
			list = [];
		}
	};
	for (const line of lines) {
		if (line.startsWith("```")) {
			if (code === null) {
				flush();
				code = [];
			} else {
				blocks.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: code.join("\n") }) }, `c-${blocks.length}`));
				code = null;
			}
			continue;
		}
		if (code !== null) {
			code.push(line);
			continue;
		}
		const heading = /^(#{1,4})\s+(.+)$/.exec(line);
		if (heading !== null) {
			flush();
			const level = heading[1]?.length ?? 2;
			const content = inline(heading[2] ?? "", resolveImage);
			blocks.push(react.default.createElement(`h${level}`, { key: `h-${blocks.length}` }, content));
			continue;
		}
		const item = /^[-*]\s+(.+)$/.exec(line);
		if (item !== null) {
			if (paragraph.length) flush();
			list.push(item[1] ?? "");
			continue;
		}
		if (line.trim() === "") {
			flush();
			continue;
		}
		if (list.length) flush();
		paragraph.push(line.trim());
	}
	flush();
	if (code !== null) blocks.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: code.join("\n") }) }, `c-${blocks.length}`));
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: "plaza-markdown",
		children: blocks
	});
}

//#endregion
//#region src/client/controller.ts
const PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;
const INITIAL = {
	indexes: [],
	indexesStatus: "idle",
	listing: null
};
var PlazaController = class {
	state = INITIAL;
	listeners = /* @__PURE__ */ new Set();
	disposed = false;
	indexesRead = 0;
	listingRead = 0;
	detailRead = 0;
	constructor(remote) {
		this.remote = remote;
	}
	getSnapshot = () => this.state;
	subscribe = (listener) => {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	};
	dispose() {
		this.disposed = true;
		this.indexesRead++;
		this.listingRead++;
		this.detailRead++;
		this.listeners.clear();
	}
	async loadIndexes() {
		const read = ++this.indexesRead;
		this.patch({ indexesStatus: "loading" });
		const answer = await this.remote.listIndexes();
		if (!this.current(read, this.indexesRead)) return null;
		if (!answer.ok) {
			this.patch({ indexesStatus: "error" });
			return null;
		}
		this.patch({
			indexesStatus: "ready",
			indexes: answer.value
		});
		return answer.value;
	}
	async load(url, query, count = PAGE_SIZE, refresh = false) {
		const read = ++this.listingRead;
		const kept = this.state.listing?.url === url ? this.state.listing.value : null;
		const answeredQuery = this.state.listing?.url === url ? this.state.listing.answeredQuery : null;
		this.patch({ listing: {
			url,
			query,
			status: "loading",
			value: kept,
			answeredQuery
		} });
		let value = null;
		let restarted = false;
		while (value === null || value.entries.length < count && value.nextOffset !== null) {
			const offset = value?.entries.length ?? 0;
			const answer = await this.page(url, query, offset, Math.min(MAX_PAGE_SIZE, count - offset), value?.fetchedAt, refresh && value === null && !restarted);
			if (!this.current(read, this.listingRead)) return;
			if (!answer.ok) {
				this.patch({ listing: {
					url,
					query,
					status: "error",
					value: kept,
					answeredQuery
				} });
				return;
			}
			if (value === null || answer.value.fetchedAt === value.fetchedAt) value = value === null ? answer.value : {
				...answer.value,
				entries: [...value.entries, ...answer.value.entries]
			};
			else if (!restarted) {
				restarted = true;
				value = null;
			} else {
				this.patch({ listing: {
					url,
					query,
					status: "error",
					value: kept,
					answeredQuery
				} });
				return;
			}
		}
		this.patch({ listing: {
			url,
			query,
			status: "ready",
			value,
			answeredQuery: query
		} });
	}
	async more() {
		const listing = this.state.listing;
		if (listing === null || listing.value === null || listing.value.nextOffset === null || listing.status === "loading" || listing.status === "more" || listing.answeredQuery !== listing.query) return;
		const { url, query, value } = listing;
		const read = ++this.listingRead;
		this.patch({ listing: {
			...listing,
			status: "more"
		} });
		const answer = await this.page(url, query, value.nextOffset, PAGE_SIZE, value.fetchedAt, false);
		if (!this.current(read, this.listingRead)) return;
		if (!answer.ok) {
			this.patch({ listing: {
				...listing,
				status: "error"
			} });
			return;
		}
		if (answer.value.fetchedAt !== value.fetchedAt) {
			await this.load(url, query, value.entries.length + PAGE_SIZE);
			return;
		}
		this.patch({ listing: {
			url,
			query,
			status: "ready",
			value: {
				...answer.value,
				entries: [...value.entries, ...answer.value.entries]
			},
			answeredQuery: query
		} });
	}
	async readDetail(url, name, version, language) {
		const read = ++this.detailRead;
		const answer = await this.remote.readEntryDetail(url, name, version, language);
		if (!this.current(read, this.detailRead)) return null;
		return answer.ok ? {
			status: "ready",
			detail: answer.value
		} : { status: "error" };
	}
	invalidateDetails() {
		this.detailRead++;
	}
	async sourcesChanged() {
		await this.loadIndexes();
	}
	async connectionReset() {
		this.listingRead++;
		this.invalidateDetails();
		const indexes = await this.loadIndexes();
		const listing = this.state.listing;
		if (indexes !== null && listing !== null && indexes.some((index) => index.url === listing.url)) await this.load(listing.url, listing.query, Math.max(PAGE_SIZE, listing.value?.entries.length ?? PAGE_SIZE));
	}
	page(url, query, offset, limit, fetchedAt, refresh = false) {
		return this.remote.search(url, {
			...query.text.trim() ? { text: query.text.trim() } : {},
			...query.category ? { category: query.category } : {},
			...query.labels.length ? { labels: query.labels } : {},
			sort: query.sort,
			offset,
			limit,
			...fetchedAt === void 0 ? {} : { fetchedAt },
			...refresh ? { refresh: true } : {}
		});
	}
	current(read, current) {
		return !this.disposed && read === current;
	}
	patch(patch) {
		if (this.disposed) return;
		this.state = {
			...this.state,
			...patch
		};
		for (const listener of this.listeners) listener();
	}
};

//#endregion
//#region src/client/query.ts
const INITIAL_QUERY = {
	text: "",
	category: "",
	labels: [],
	sort: { kind: "index" }
};
function activeFilterCount(query) {
	return Number(query.text.length > 0) + Number(query.category.length > 0) + query.labels.length;
}
function toggleLabel(labels, label) {
	return labels.includes(label) ? labels.filter((value) => value !== label) : [...labels, label];
}
function withText(query, text) {
	const wasBlank = query.text.trim() === "";
	const isBlank = text.trim() === "";
	const sort = wasBlank && !isBlank && query.sort.kind === "index" ? { kind: "relevance" } : isBlank && query.sort.kind === "relevance" ? { kind: "index" } : query.sort;
	return {
		...query,
		text,
		sort
	};
}
function declaredQuery(query, metadata) {
	const category = query.category && !Object.hasOwn(metadata.categories, query.category) ? "" : query.category;
	const labels = query.labels.filter((label) => Object.hasOwn(metadata.labels, label));
	const sort = query.sort.kind === "key" && !Object.hasOwn(metadata.sortKeys, query.sort.id) ? { kind: "index" } : query.sort;
	return category === query.category && labels.length === query.labels.length && sort === query.sort ? query : {
		...query,
		category,
		labels,
		sort
	};
}

//#endregion
//#region src/client/persistence.ts
const PREFERENCES_KEY = "dsh-plaza:preferences:v1";
const MAX_LOADED = 5e3;
const DEFAULT_PREFERENCES = {
	view: "grid",
	sources: {}
};
function validSort(value) {
	if (typeof value !== "object" || value === null || !("kind" in value)) return false;
	const sort = value;
	if (sort.kind === "index" || sort.kind === "relevance") return true;
	if (sort.kind === "published") return sort.direction === "asc" || sort.direction === "desc";
	return sort.kind === "key" && typeof sort.id === "string" && (sort.direction === "asc" || sort.direction === "desc");
}
function readSource(value) {
	if (typeof value !== "object" || value === null) return void 0;
	const source = value;
	const query = source.query;
	if (query === void 0 || typeof query.text !== "string" || typeof query.category !== "string" || !Array.isArray(query.labels) || query.labels.some((label) => typeof label !== "string") || !validSort(query.sort)) return void 0;
	const loadedCount = typeof source.loadedCount === "number" && Number.isInteger(source.loadedCount) ? Math.min(MAX_LOADED, Math.max(50, source.loadedCount)) : 50;
	const scrollY = typeof source.scrollY === "number" && Number.isFinite(source.scrollY) ? Math.max(0, source.scrollY) : 0;
	return {
		query: {
			text: query.text,
			category: query.category,
			labels: query.labels,
			sort: query.sort
		},
		loadedCount,
		scrollY
	};
}
function readPreferences(storage) {
	try {
		const raw = storage.getItem(PREFERENCES_KEY);
		if (raw === null) return DEFAULT_PREFERENCES;
		const value = JSON.parse(raw);
		const sources = {};
		if (typeof value.sources === "object" && value.sources !== null) for (const [url, candidate] of Object.entries(value.sources)) {
			const source = readSource(candidate);
			if (source !== void 0) sources[url] = source;
		}
		return {
			view: value.view === "list" ? "list" : "grid",
			...typeof value.selectedSource === "string" ? { selectedSource: value.selectedSource } : {},
			sources
		};
	} catch {
		return DEFAULT_PREFERENCES;
	}
}
function writePreferences(storage, preferences) {
	try {
		storage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
	} catch {}
}
function sourcePreference(preferences, url) {
	return preferences.sources[url] ?? {
		query: INITIAL_QUERY,
		loadedCount: 50,
		scrollY: 0
	};
}
function updateSourcePreference(preferences, url, patch) {
	return {
		...preferences,
		selectedSource: url,
		sources: {
			...preferences.sources,
			[url]: {
				...sourcePreference(preferences, url),
				...patch
			}
		}
	};
}

//#endregion
//#region src/client/plaza.css?dsh-inline
var plaza_default = ".plaza,.plaza-detail{box-sizing:border-box;width:100%;height:100%;min-height:0;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1)}.plaza-scroll{box-sizing:border-box;scrollbar-gutter:stable;height:100%;padding:24px clamp(16px,3vw,36px) 40px;overflow:auto}.plaza-heading,.plaza-toolbar,.plaza-card footer,.plaza-detail header{align-items:center;display:flex}.plaza-heading{justify-content:space-between;gap:16px;margin-bottom:20px}.plaza-heading h2,.plaza-detail h2{margin:0;font-size:24px}.plaza-heading p,.plaza-detail header p{color:var(--dsw-alias-label-secondary);margin:4px 0 0}.plaza select,.plaza input,.plaza button,.plaza-detail button{font:inherit;color:inherit}.plaza select,.plaza input{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-layer-1);border-radius:10px;height:36px;padding:0 12px}.plaza-toolbar{flex-wrap:wrap;gap:8px}.plaza-toolbar input{flex:240px}.plaza-toolbar select{flex:0 180px}.plaza-view{border:.5px solid var(--dsw-alias-border-l3);border-radius:10px;display:flex;overflow:hidden}.plaza-view button{background:0 0;border:0;width:36px;height:34px}.plaza-view button[aria-pressed=true]{background:var(--dsw-alias-interactive-bg-hover)}.plaza-labels{border:0;flex-wrap:wrap;gap:8px;margin:14px 0 0;padding:0;display:flex}.plaza-labels legend{float:left;color:var(--dsw-alias-label-secondary);margin-right:8px}.plaza-labels label{font-size:13px}.plaza-chips{flex-wrap:wrap;gap:6px;margin-top:12px;display:flex}.plaza-chips button,.plaza-more,.plaza-state button,.plaza-back,.plaza-detail-body button{border:.5px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-layer-1);cursor:pointer;border-radius:999px;padding:5px 10px}.plaza-result-meta{min-height:20px;color:var(--dsw-alias-label-secondary);margin:18px 0 10px;font-size:13px}.plaza-grid{grid-template-columns:repeat(auto-fill,minmax(260px,1fr));grid-auto-rows:1fr;gap:12px;display:grid}.plaza-list{grid-template-columns:1fr;gap:8px;display:grid}.plaza-card{border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:14px;flex-direction:column;min-width:0;min-height:230px;display:flex;overflow:hidden}.plaza-list .plaza-card{min-height:0}.plaza-card-main{text-align:left;cursor:pointer;background:0 0;border:0;flex:1;gap:12px;width:100%;padding:16px;display:flex}.plaza-icon{border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-module-platform);width:42px;height:42px;color:var(--dsw-alias-link);border-radius:11px;flex:0 0 42px;place-items:center;font-weight:700;display:grid;overflow:hidden}.plaza-icon img{object-fit:contain;width:36px;height:36px;display:block}.plaza-card-copy{flex-direction:column;min-width:0;display:flex}.plaza-package{color:var(--dsw-alias-label-secondary);text-overflow:ellipsis;white-space:nowrap;font-size:12px;overflow:hidden}.plaza-description{color:var(--dsw-alias-label-secondary);-webkit-line-clamp:2;-webkit-box-orient:vertical;margin-top:10px;font-size:13px;line-height:19px;display:-webkit-box;overflow:hidden}.plaza-meta{color:var(--dsw-alias-label-tertiary);margin-top:8px;font-size:12px}.plaza-card-tags{gap:5px;min-height:24px;padding:0 16px;display:flex}.plaza-card-tags span{background:var(--dsw-alias-interactive-bg-hover);border-radius:5px;padding:2px 6px;font-size:11px}.plaza-card footer{border-top:.5px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-secondary);justify-content:space-between;margin-top:10px;padding:10px 16px;font-size:12px}.plaza-more{margin:18px auto;display:block}.plaza-state{min-height:220px;color:var(--dsw-alias-label-secondary);place-items:center;gap:12px;display:grid}.plaza-detail{padding:24px clamp(16px,4vw,48px);overflow:auto}.plaza-detail header{gap:14px;margin:24px 0}.plaza-detail-body{border-top:.5px solid var(--dsw-alias-border-l3);max-width:900px;margin-top:20px;padding-top:20px}.plaza-back{border-radius:8px}.plaza-notice{border:.5px solid var(--dsw-alias-state-warn-primary);max-width:900px;color:var(--dsw-alias-state-warn-primary);border-radius:8px;padding:10px}.plaza-markdown{overflow-wrap:anywhere;line-height:1.65}.plaza-markdown img{border-radius:8px;max-width:100%;height:auto;margin:12px 0;display:block}.plaza-markdown pre{border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-module-platform);border-radius:8px;padding:12px;overflow:auto}.plaza-markdown code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.plaza-markdown a,.plaza-facts a{color:var(--dsw-alias-link)}.plaza-facts{gap:10px;max-width:900px;margin-top:28px;display:grid}.plaza-facts div{grid-template-columns:minmax(100px,160px) 1fr;gap:12px;display:grid}.plaza-facts dt{color:var(--dsw-alias-label-secondary)}.plaza-facts dd{overflow-wrap:anywhere;margin:0}.plaza button:focus-visible,.plaza input:focus-visible,.plaza select:focus-visible,.plaza-detail button:focus-visible,.plaza-detail a:focus-visible{outline:2px solid var(--dsw-alias-link);outline-offset:2px}@media (hover:hover){.plaza-card-main:hover,.plaza-chips button:hover,.plaza-more:hover,.plaza-back:hover{background:var(--dsw-alias-interactive-bg-hover)}}@media (width<=640px){.plaza-scroll,.plaza-detail{padding:16px 12px 32px}.plaza-heading{flex-direction:column;align-items:stretch}.plaza-toolbar>*{flex:100%!important}.plaza-grid{grid-template-columns:1fr}.plaza-card{min-height:210px}.plaza-facts div{grid-template-columns:1fr;gap:2px}}@media (prefers-reduced-motion:reduce){.plaza *{scroll-behavior:auto!important}}";

//#endregion
//#region src/client/Plaza.tsx
function resolve(ctx, value, fallback) {
	return value === void 0 ? fallback : ctx.locale.resolveText(value);
}
function formatDate(timestamp, language) {
	return new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(/* @__PURE__ */ new Date(timestamp * 1e3));
}
function presented(entry) {
	return entry.versions.find((item) => item.version === entry.defaultVersion) ?? entry.versions[0];
}
function PluginIcon({ entry }) {
	const [failed, setFailed] = (0, react.useState)(false);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
		className: "plaza-icon",
		"aria-hidden": "true",
		children: entry.icon !== void 0 && !failed ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
			src: entry.icon,
			alt: "",
			loading: "lazy",
			referrerPolicy: "no-referrer",
			onError: () => setFailed(true)
		}) : entry.name.slice(0, 1).toUpperCase()
	});
}
function Card({ entry, onOpen, ctx, t, language, labels, category }) {
	const version = presented(entry);
	const shownLabels = entry.metadata.labels.slice(0, 2);
	const status = entry.installation.status;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
		className: "plaza-card",
		"data-market-entry": entry.name,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				className: "plaza-card-main",
				type: "button",
				onClick: onOpen,
				"aria-label": `${t("details")}: ${entry.name}`,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PluginIcon, { entry }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: "plaza-card-copy",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: resolve(ctx, entry.title, entry.name) }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "plaza-package",
							children: entry.name
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "plaza-description",
							children: resolve(ctx, entry.description, entry.name)
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "plaza-meta",
							children: [entry.author ? `${entry.author} · ` : "", formatDate(version.publishTimestamp, language)]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "plaza-card-tags",
				children: [
					category && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: resolve(ctx, category, entry.metadata.category ?? "") }),
					shownLabels.map((id) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: resolve(ctx, labels[id]?.title, id) }, id)),
					entry.metadata.labels.length > shownLabels.length && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: ["+", entry.metadata.labels.length - shownLabels.length] })
				]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: version.compatibility.compatible ? t("compatible") : version.compatibility.exempted ? t("compatibilityExempted") : t("incompatible") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: status === "update-available" ? t("update") : status === "provided" ? t("provided") : status === "installed" || status === "different-version" ? t("installed") : version.version })] })
		]
	});
}
function detailImage(document$1, path) {
	if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/iu.test(path)) return void 0;
	return new URL(`api/plugin-market/detail-file?document=${encodeURIComponent(document$1)}&path=${encodeURIComponent(path)}`, documentBase()).href;
}
function documentBase() {
	return typeof document === "undefined" ? "http://localhost/" : document.baseURI;
}
function Plaza({ ctx, controller, t }) {
	const state = (0, react.useSyncExternalStore)(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
	const localeSnapshot = (0, react.useSyncExternalStore)(ctx.locale.subscribe.bind(ctx.locale), ctx.locale.getSnapshot.bind(ctx.locale), ctx.locale.getSnapshot.bind(ctx.locale));
	const [preferences, setPreferences] = (0, react.useState)(() => typeof localStorage === "undefined" ? DEFAULT_PREFERENCES : readPreferences(localStorage));
	const preferencesRef = (0, react.useRef)(preferences);
	const [source, setSourceState] = (0, react.useState)("");
	const sourceRef = (0, react.useRef)("");
	const setSource = (url) => {
		sourceRef.current = url;
		setSourceState(url);
	};
	const [query, setQuery] = (0, react.useState)(INITIAL_QUERY);
	const [draft, setDraft] = (0, react.useState)("");
	const [view, setViewState] = (0, react.useState)(preferences.view);
	const [selected, setSelected] = (0, react.useState)(null);
	const selectedRef = (0, react.useRef)(null);
	const [detail, setDetail] = (0, react.useState)(null);
	const scrollRef = (0, react.useRef)(null);
	const scrollPosition = (0, react.useRef)(0);
	const returnFocus = (0, react.useRef)(null);
	const restoringScroll = (0, react.useRef)(false);
	const language = localeSnapshot.active;
	const result = state.listing?.value ?? null;
	const status = state.listing?.status ?? (state.indexesStatus === "error" ? "error" : state.indexesStatus === "ready" ? "empty" : "loading");
	(0, react.useEffect)(() => {
		const tag = document.createElement("style");
		tag.dataset.plugin = "dsh-plaza";
		tag.textContent = plaza_default;
		document.head.appendChild(tag);
		return () => tag.remove();
	}, []);
	(0, react.useEffect)(() => {
		controller.loadIndexes().then((indexes) => {
			if (indexes === null) return;
			const preferred = preferences.selectedSource;
			const url = preferred && indexes.some((index) => index.url === preferred) ? preferred : indexes[0]?.url ?? "";
			if (!url) return;
			if (url !== preferred) save({
				...preferencesRef.current,
				selectedSource: url
			});
			const saved = sourcePreference(preferencesRef.current, url);
			setSource(url);
			setQuery(saved.query);
			setDraft(saved.query.text);
			restoringScroll.current = true;
			controller.load(url, saved.query, saved.loadedCount);
		});
	}, [controller]);
	(0, react.useEffect)(() => {
		const disposers = [
			ctx.remote.$on("plugin-market/changed", () => {
				controller.sourcesChanged();
			}),
			ctx.remote.$on("plugin-manager/changed", () => {
				const listing = controller.getSnapshot().listing;
				if (listing) controller.load(listing.url, listing.query, Math.max(PAGE_SIZE, listing.value?.entries.length ?? PAGE_SIZE));
			}),
			ctx.on("connection/reset", () => {
				setDetail(null);
				controller.connectionReset().then(() => {
					const entry = selectedRef.current;
					if (entry !== null) readDetail(entry);
				});
			})
		];
		return () => {
			for (const dispose of disposers) dispose();
		};
	}, [controller, ctx]);
	(0, react.useEffect)(() => {
		if (!restoringScroll.current || status !== "ready" || !source) return;
		restoringScroll.current = false;
		requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: sourcePreference(preferences, source).scrollY }));
	}, [status, source]);
	(0, react.useEffect)(() => {
		if (!source || draft === query.text) return;
		const handle = window.setTimeout(() => applyQuery(withText(query, draft)), 250);
		return () => window.clearTimeout(handle);
	}, [
		draft,
		query,
		source
	]);
	(0, react.useEffect)(() => {
		if (selected === null) return;
		const listener = (event) => {
			if (event.key === "Escape") closeDetail();
		};
		document.addEventListener("keydown", listener);
		return () => document.removeEventListener("keydown", listener);
	}, [selected]);
	const save = (next) => {
		preferencesRef.current = next;
		setPreferences(next);
		writePreferences(localStorage, next);
	};
	const remember = (patch) => {
		if (source) save(updateSourcePreference(preferencesRef.current, source, patch));
	};
	const rememberScroll = () => remember({
		scrollY: scrollPosition.current,
		loadedCount: result?.entries.length ?? PAGE_SIZE
	});
	const applyQuery = (next) => {
		setQuery(next);
		setDraft(next.text);
		remember({
			query: next,
			loadedCount: PAGE_SIZE,
			scrollY: 0
		});
		controller.load(source, next);
	};
	const chooseSource = (url) => {
		rememberScroll();
		const saved = sourcePreference(preferencesRef.current, url);
		setSource(url);
		setQuery(saved.query);
		setDraft(saved.query.text);
		restoringScroll.current = true;
		save({
			...preferencesRef.current,
			selectedSource: url
		});
		controller.load(url, saved.query, saved.loadedCount);
	};
	const setView = (next) => {
		setViewState(next);
		save({
			...preferencesRef.current,
			view: next
		});
	};
	const readDetail = async (entry) => {
		setDetail({ status: "loading" });
		const version = presented(entry);
		const answer = await controller.readDetail(sourceRef.current, entry.name, version.version, language);
		if (answer !== null) setDetail(answer);
	};
	const openDetail = async (entry, target) => {
		returnFocus.current = target;
		rememberScroll();
		selectedRef.current = entry;
		setSelected(entry);
		await readDetail(entry);
	};
	const closeDetail = () => {
		controller.invalidateDetails();
		selectedRef.current = null;
		setSelected(null);
		setDetail(null);
		requestAnimationFrame(() => {
			returnFocus.current?.focus();
			const top = sourcePreference(preferencesRef.current, source).scrollY;
			scrollRef.current?.scrollTo({ top });
		});
	};
	const showMore = async () => {
		await controller.more();
		const count = controller.getSnapshot().listing?.value?.entries.length;
		if (count) remember({ loadedCount: count });
	};
	const metadata = result?.metadata;
	(0, react.useEffect)(() => {
		if (!metadata) return;
		const reduced = declaredQuery(query, metadata);
		if (reduced !== query) applyQuery(reduced);
	}, [metadata]);
	const categories = Object.entries(metadata?.categories ?? {});
	const labels = Object.entries(metadata?.labels ?? {});
	const sortKeys = Object.entries(metadata?.sortKeys ?? {});
	const chips = [query.category, ...query.labels].filter(Boolean);
	if (selected !== null) {
		const version = presented(selected);
		const doc = detail?.status === "ready" && detail.detail.status === "found" ? detail.detail : void 0;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
			className: "plaza-detail",
			"aria-labelledby": "plaza-detail-title",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "plaza-back",
					autoFocus: true,
					onClick: closeDetail,
					children: ["← ", t("back")]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PluginIcon, { entry: selected }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
					id: "plaza-detail-title",
					children: resolve(ctx, selected.title, selected.name)
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
					selected.name,
					" · ",
					version.version
				] })] })] }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: resolve(ctx, selected.description, "") }),
				!version.compatibility.compatible && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: "plaza-notice",
					role: "note",
					children: version.compatibility.exempted ? t("compatibilityExempted") : t("incompatible")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "plaza-detail-body",
					children: detail?.status === "loading" || detail === null ? t("detailLoading") : detail.status === "error" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("detailError") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						onClick: () => void readDetail(selected),
						children: t("retry")
					})] }) : doc === void 0 ? t("noDetail") : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Markdown, {
						source: doc.markdown,
						resolveImage: (path) => detailImage(doc.document, path)
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
					className: "plaza-facts",
					children: [
						selected.author && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("author") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: selected.author })] }),
						selected.homepage && safeExternal(selected.homepage) && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("homepage") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("a", {
							href: safeExternal(selected.homepage),
							target: "_blank",
							rel: "noopener noreferrer",
							children: [selected.homepage, " ↗"]
						}) })] }),
						selected.repository && safeExternal(selected.repository.url) && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("sourceCode") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("a", {
							href: safeExternal(selected.repository.url),
							target: "_blank",
							rel: "noopener noreferrer",
							children: [selected.repository.url, " ↗"]
						}) })] })
					]
				})
			]
		});
	}
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
		className: "plaza",
		"aria-labelledby": "plaza-title",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "plaza-scroll",
			ref: scrollRef,
			onScroll: (event) => {
				scrollPosition.current = event.currentTarget.scrollTop;
			},
			onPointerUp: rememberScroll,
			onKeyUp: rememberScroll,
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
					className: "plaza-heading",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
						id: "plaza-title",
						children: t("title")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("subtitle") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
						"aria-label": t("source"),
						value: source,
						onChange: (event) => chooseSource(event.target.value),
						children: state.indexes.map((index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
							value: index.url,
							children: resolve(ctx, index.title, index.url)
						}, index.url))
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "plaza-toolbar",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "search",
							value: draft,
							onChange: (event) => setDraft(event.target.value),
							placeholder: t("search"),
							"aria-label": t("search")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
							"aria-label": t("allCategories"),
							value: query.category,
							onChange: (event) => applyQuery({
								...query,
								category: event.target.value
							}),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "",
								children: t("allCategories")
							}), categories.map(([id, item]) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: id,
								children: resolve(ctx, item.title, id)
							}, id))]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
							"aria-label": t("sort"),
							value: query.sort.kind === "key" ? `key:${query.sort.id}` : query.sort.kind,
							onChange: (event) => {
								const value = event.target.value;
								applyQuery({
									...query,
									sort: value.startsWith("key:") ? {
										kind: "key",
										id: value.slice(4),
										direction: metadata.sortKeys[value.slice(4)]?.order ?? "asc"
									} : value === "published" ? {
										kind: "published",
										direction: "desc"
									} : value === "relevance" ? { kind: "relevance" } : { kind: "index" }
								});
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: "index",
									children: t("sortIndex")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: "relevance",
									children: t("sortRelevance")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: "published",
									children: t("sortNewest")
								}),
								sortKeys.map(([id, item]) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: `key:${id}`,
									children: resolve(ctx, item.title, id)
								}, id))
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "plaza-view",
							role: "group",
							"aria-label": t("view"),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": t("viewGrid"),
								"aria-pressed": view === "grid",
								onClick: () => setView("grid"),
								children: "▦"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": t("viewList"),
								"aria-pressed": view === "list",
								onClick: () => setView("list"),
								children: "☷"
							})]
						})
					]
				}),
				labels.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
					className: "plaza-labels",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("legend", { children: t("labels") }), labels.map(([id, item]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: query.labels.includes(id),
						onChange: () => applyQuery({
							...query,
							labels: toggleLabel(query.labels, id)
						})
					}), resolve(ctx, item.title, id)] }, id))]
				}),
				activeFilterCount(query) > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "plaza-chips",
					children: [
						query.text && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							"aria-label": t("removeFilter", { name: query.text }),
							onClick: () => applyQuery(withText(query, "")),
							children: [
								"“",
								query.text,
								"” ×"
							]
						}),
						chips.map((chip) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							"aria-label": t("removeFilter", { name: chip }),
							onClick: () => applyQuery(chip === query.category ? {
								...query,
								category: ""
							} : {
								...query,
								labels: query.labels.filter((value) => value !== chip)
							}),
							children: [chip, " ×"]
						}, chip)),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							onClick: () => applyQuery(INITIAL_QUERY),
							children: t("clear")
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "plaza-result-meta",
					"aria-live": "polite",
					children: result && t("results", { count: result.total })
				}),
				status === "error" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "plaza-state",
					children: [t("error"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						onClick: () => void controller.load(source, query, Math.max(PAGE_SIZE, result?.entries.length ?? PAGE_SIZE)),
						children: t("retry")
					})]
				}) : status === "loading" && !result ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "plaza-state",
					children: t("loading")
				}) : status === "empty" || result?.entries.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "plaza-state",
					children: t("empty")
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: view === "grid" ? "plaza-grid" : "plaza-list",
					children: result?.entries.map((entry) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Card, {
						entry,
						onOpen: () => void openDetail(entry, document.activeElement),
						ctx,
						t,
						language,
						labels: metadata?.labels ?? {},
						category: entry.metadata.category ? metadata?.categories[entry.metadata.category]?.title : void 0
					}, entry.name))
				}),
				result?.nextOffset != null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					className: "plaza-more",
					type: "button",
					disabled: status === "more",
					onClick: () => void showMore(),
					children: status === "more" ? t("loading") : t("more")
				})
			]
		})
	});
}

//#endregion
//#region src/client/locales.ts
const zh = {
	tab: "Plaza",
	title: "DSH Plaza",
	subtitle: "发现适合你的 DSH 插件",
	search: "搜索插件",
	allCategories: "全部分类",
	labels: "标签",
	sort: "排序",
	sortIndex: "默认顺序",
	sortRelevance: "最佳匹配",
	sortNewest: "最新发布",
	view: "视图模式",
	viewGrid: "网格视图",
	viewList: "紧凑列表",
	clear: "清除全部",
	results: "{count} 个结果",
	loading: "正在加载…",
	empty: "没有符合当前条件的插件",
	error: "无法读取插件索引",
	retry: "重试",
	more: "显示更多",
	details: "插件详情",
	back: "返回插件列表",
	noDetail: "此插件暂未提供详细介绍",
	source: "索引源",
	detailLoading: "正在读取详细介绍…",
	detailError: "无法读取详细介绍",
	removeFilter: "移除筛选条件：{name}",
	compatible: "兼容",
	incompatible: "不兼容",
	compatibilityExempted: "已设置兼容性豁免",
	installed: "已安装",
	update: "有更新",
	provided: "DSH 已提供",
	author: "作者",
	homepage: "项目主页",
	sourceCode: "源代码"
};
const en = {
	tab: "Plaza",
	title: "DSH Plaza",
	subtitle: "Find the right plugins for DSH",
	search: "Search plugins",
	allCategories: "All categories",
	labels: "Labels",
	sort: "Sort",
	sortIndex: "Default order",
	sortRelevance: "Best match",
	sortNewest: "Newest",
	view: "View mode",
	viewGrid: "Grid view",
	viewList: "Compact list",
	clear: "Clear all",
	results: "{count} results",
	loading: "Loading…",
	empty: "No plugins match the current filters",
	error: "Could not read the plugin index",
	retry: "Retry",
	more: "Show more",
	details: "Plugin details",
	back: "Back to plugins",
	noDetail: "No detailed description is available",
	source: "Index source",
	detailLoading: "Loading details…",
	detailError: "Could not read the details",
	removeFilter: "Remove filter: {name}",
	compatible: "Compatible",
	incompatible: "Incompatible",
	compatibilityExempted: "Compatibility exemption applied",
	installed: "Installed",
	update: "Update available",
	provided: "Provided by DSH",
	author: "Author",
	homepage: "Homepage",
	sourceCode: "Source code"
};

//#endregion
//#region src/client/index.tsx
const NS = "dshPlaza";
const inject = [
	"slots",
	"locale",
	"remote",
	"remote.pluginMarket"
];
function apply(ctx) {
	ctx.effect(() => ctx.locale.register(NS, {
		zh,
		en
	}), "dsh-plaza: locale");
	const controller = new PlazaController(ctx.remote.pluginMarket);
	ctx.effect(() => () => controller.dispose(), "dsh-plaza: controller");
	const t = ctx.locale.bind(NS);
	ctx.slots.inject("plugins.tab", () => ctx.slots.register({
		name: "plugins.tab",
		id: "dsh-plaza",
		order: 10,
		label: () => t("tab"),
		locale: NS
	}, (owner) => react.default.createElement(Plaza, {
		...owner,
		ctx,
		controller,
		t
	})));
}

//#endregion
exports.apply = apply;
exports.inject = inject;
return module.exports; } });
//# sourceMappingURL=client.js.map