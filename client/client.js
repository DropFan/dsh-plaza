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
function storageKey(url) {
	return `dsh-plaza:query:${url}`;
}

//#endregion
//#region src/client/plaza.css?dsh-inline
var plaza_default = ".plaza,.plaza-detail{box-sizing:border-box;width:100%;height:100%;min-height:0;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1)}.plaza-scroll{box-sizing:border-box;scrollbar-gutter:stable;height:100%;padding:24px clamp(16px,3vw,36px) 40px;overflow:auto}.plaza-heading,.plaza-toolbar,.plaza-card footer,.plaza-detail header{align-items:center;display:flex}.plaza-heading{justify-content:space-between;gap:16px;margin-bottom:20px}.plaza-heading h2,.plaza-detail h2{margin:0;font-size:24px}.plaza-heading p,.plaza-detail header p{color:var(--dsw-alias-label-secondary);margin:4px 0 0}.plaza select,.plaza input,.plaza button{font:inherit;color:inherit}.plaza select,.plaza input{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-layer-1);border-radius:10px;height:36px;padding:0 12px}.plaza-toolbar{flex-wrap:wrap;gap:8px}.plaza-toolbar input{flex:240px}.plaza-toolbar select{flex:0 180px}.plaza-view{border:.5px solid var(--dsw-alias-border-l3);border-radius:10px;display:flex;overflow:hidden}.plaza-view button{background:0 0;border:0;width:36px;height:34px}.plaza-view button[aria-pressed=true]{background:var(--dsw-alias-interactive-bg-hover)}.plaza-labels{border:0;flex-wrap:wrap;gap:8px;margin:14px 0 0;padding:0;display:flex}.plaza-labels legend{float:left;color:var(--dsw-alias-label-secondary);margin-right:8px}.plaza-labels label{font-size:13px}.plaza-chips{flex-wrap:wrap;gap:6px;margin-top:12px;display:flex}.plaza-chips button,.plaza-more,.plaza-state button,.plaza-back{border:.5px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-layer-1);cursor:pointer;border-radius:999px;padding:5px 10px}.plaza-chips button:hover,.plaza-more:hover,.plaza-back:hover{background:var(--dsw-alias-interactive-bg-hover)}.plaza-result-meta{min-height:20px;color:var(--dsw-alias-label-secondary);margin:18px 0 10px;font-size:13px}.plaza-grid{grid-template-columns:repeat(auto-fill,minmax(260px,1fr));grid-auto-rows:1fr;gap:12px;display:grid}.plaza-list{grid-template-columns:1fr;gap:8px;display:grid}.plaza-card{border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:14px;flex-direction:column;min-width:0;min-height:210px;display:flex;overflow:hidden}.plaza-list .plaza-card{min-height:0}.plaza-card-main{text-align:left;cursor:pointer;background:0 0;border:0;flex:1;gap:12px;width:100%;padding:16px;display:flex}.plaza-card-main:hover{background:var(--dsw-alias-interactive-bg-hover)}.plaza-icon{border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-module-platform);width:42px;height:42px;color:var(--dsw-alias-link);border-radius:11px;flex:0 0 42px;place-items:center;font-weight:700;display:grid}.plaza-card-copy{flex-direction:column;min-width:0;display:flex}.plaza-package{color:var(--dsw-alias-label-secondary);text-overflow:ellipsis;white-space:nowrap;font-size:12px;overflow:hidden}.plaza-description{color:var(--dsw-alias-label-secondary);-webkit-line-clamp:2;-webkit-box-orient:vertical;margin-top:10px;font-size:13px;line-height:19px;display:-webkit-box;overflow:hidden}.plaza-card-tags{gap:5px;min-height:24px;padding:0 16px;display:flex}.plaza-card-tags span{background:var(--dsw-alias-interactive-bg-hover);border-radius:5px;padding:2px 6px;font-size:11px}.plaza-card footer{border-top:.5px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-secondary);justify-content:space-between;margin-top:10px;padding:10px 16px;font-size:12px}.plaza-more{margin:18px auto;display:block}.plaza-state{min-height:220px;color:var(--dsw-alias-label-secondary);place-items:center;gap:12px;display:grid}.plaza-detail{padding:24px clamp(16px,4vw,48px);overflow:auto}.plaza-detail header{gap:14px;margin:24px 0}.plaza-detail-body{border-top:.5px solid var(--dsw-alias-border-l3);margin-top:20px;padding-top:20px}.plaza-detail-body pre{white-space:pre-wrap;max-width:900px;font:inherit;line-height:1.65}.plaza-back{border-radius:8px}.plaza button:focus-visible,.plaza input:focus-visible,.plaza select:focus-visible,.plaza-detail button:focus-visible{outline:2px solid var(--dsw-alias-link);outline-offset:2px}@media (width<=640px){.plaza-scroll{padding:16px 12px 32px}.plaza-heading{flex-direction:column;align-items:stretch}.plaza-toolbar>*{flex:100%!important}.plaza-grid{grid-template-columns:1fr}.plaza-card{min-height:190px}}@media (prefers-reduced-motion:reduce){.plaza *{scroll-behavior:auto!important}}";

//#endregion
//#region src/client/Plaza.tsx
const PAGE_SIZE = 50;
function resolve(ctx, value, fallback) {
	return value === void 0 ? fallback : ctx.locale.resolveText(value);
}
function Card({ entry, onOpen, ctx, t }) {
	const version = entry.defaultVersion ?? entry.versions[0]?.version ?? "—";
	const compatible = entry.versions.find((item) => item.version === version)?.compatibility?.compatible;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
		className: "plaza-card",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				className: "plaza-card-main",
				type: "button",
				onClick: onOpen,
				"aria-label": `${t("details")}: ${entry.name}`,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "plaza-icon",
					"aria-hidden": "true",
					children: entry.name.slice(0, 1).toUpperCase()
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
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
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "plaza-card-tags",
				children: [entry.metadata.category && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: entry.metadata.category }), entry.metadata.labels.slice(0, 2).map((label) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label }, label))]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: compatible === true ? t("compatible") : compatible === false ? t("incompatible") : t("compatibilityUnknown") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: version })] })
		]
	});
}
function Plaza(props) {
	const { ctx, t } = props;
	(0, react.useEffect)(() => {
		const tag = document.createElement("style");
		tag.dataset.plugin = "dsh-plaza";
		tag.textContent = plaza_default;
		document.head.appendChild(tag);
		return () => tag.remove();
	}, []);
	const [indexes, setIndexes] = (0, react.useState)([]);
	const [source, setSource] = (0, react.useState)("");
	const [query, setQuery] = (0, react.useState)(INITIAL_QUERY);
	const [draft, setDraft] = (0, react.useState)("");
	const [view, setView] = (0, react.useState)(() => localStorage.getItem("dsh-plaza:view") === "list" ? "list" : "grid");
	const [result, setResult] = (0, react.useState)(null);
	const [status, setStatus] = (0, react.useState)("loading");
	const [selected, setSelected] = (0, react.useState)(null);
	const [detail, setDetail] = (0, react.useState)(null);
	const scrollRef = (0, react.useRef)(null);
	const requestRef = (0, react.useRef)(0);
	const load = async (url, next, append = false) => {
		const request = ++requestRef.current;
		setStatus("loading");
		const previous = append ? result : null;
		const answer = await ctx.remote.pluginMarket.search(url, {
			...next.text.trim() ? { text: next.text.trim() } : {},
			...next.category ? { category: next.category } : {},
			...next.labels.length ? { labels: next.labels } : {},
			sort: next.sort,
			offset: previous?.entries.length ?? 0,
			limit: PAGE_SIZE,
			...previous ? { fetchedAt: previous.fetchedAt } : {}
		});
		if (request !== requestRef.current) return;
		if (!answer.ok) {
			setStatus("error");
			return;
		}
		setResult(previous ? {
			...answer.value,
			entries: [...previous.entries, ...answer.value.entries]
		} : answer.value);
		setStatus("ready");
	};
	(0, react.useEffect)(() => {
		let active = true;
		ctx.remote.pluginMarket.listIndexes().then((answer) => {
			if (!active) return;
			if (!answer.ok) {
				setStatus("error");
				return;
			}
			setIndexes(answer.value);
			const url = answer.value[0]?.url ?? "";
			setSource(url);
			if (!url) {
				setStatus("ready");
				return;
			}
			const saved = localStorage.getItem(storageKey(url));
			const restored = saved ? {
				...INITIAL_QUERY,
				...JSON.parse(saved)
			} : INITIAL_QUERY;
			setQuery(restored);
			setDraft(restored.text);
			load(url, restored);
		});
		return () => {
			active = false;
		};
	}, []);
	(0, react.useEffect)(() => {
		if (!source) return;
		const handle = window.setTimeout(() => {
			const next = {
				...query,
				text: draft,
				sort: draft.trim() && query.sort.kind === "index" ? { kind: "relevance" } : query.sort
			};
			setQuery(next);
			localStorage.setItem(storageKey(source), JSON.stringify(next));
			load(source, next);
		}, 250);
		return () => window.clearTimeout(handle);
	}, [draft]);
	const updateQuery = (next) => {
		setQuery(next);
		setDraft(next.text);
		if (source) {
			localStorage.setItem(storageKey(source), JSON.stringify(next));
			load(source, next);
		}
	};
	const open = async (entry) => {
		setSelected(entry);
		setDetail(null);
		const version = entry.defaultVersion ?? entry.versions[0]?.version;
		if (!version || !source) return;
		const answer = await ctx.remote.pluginMarket.readEntryDetail(source, entry.name, version, ctx.locale.getLocale().active);
		if (answer.ok) setDetail(answer.value);
	};
	const categories = Object.entries(result?.metadata.categories ?? {});
	const labels = Object.entries(result?.metadata.labels ?? {});
	const chips = (0, react.useMemo)(() => [query.category, ...query.labels].filter(Boolean), [query]);
	if (selected) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
		className: "plaza-detail",
		"aria-labelledby": "plaza-detail-title",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "plaza-back",
				onClick: () => setSelected(null),
				children: ["← ", t("close")]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "plaza-icon",
				"aria-hidden": "true",
				children: selected.name.slice(0, 1).toUpperCase()
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
				id: "plaza-detail-title",
				children: resolve(ctx, selected.title, selected.name)
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: selected.name })] })] }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: resolve(ctx, selected.description, "") }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "plaza-detail-body",
				children: detail === null ? t("loading") : detail.status === "found" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", { children: detail.markdown }) : t("noDetail")
			})
		]
	});
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
		className: "plaza",
		"aria-labelledby": "plaza-title",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "plaza-scroll",
			ref: scrollRef,
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
					className: "plaza-heading",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
						id: "plaza-title",
						children: t("title")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("subtitle") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
						"aria-label": t("source"),
						value: source,
						onChange: (event) => {
							const url = event.target.value;
							setSource(url);
							load(url, query);
						},
						children: indexes.map((index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
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
							onChange: (event) => updateQuery({
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
							value: query.sort.kind,
							onChange: (event) => updateQuery({
								...query,
								sort: event.target.value === "published" ? {
									kind: "published",
									direction: "desc"
								} : event.target.value === "relevance" ? { kind: "relevance" } : { kind: "index" }
							}),
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
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "plaza-view",
							role: "group",
							"aria-label": "View",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": view === "grid",
								onClick: () => {
									setView("grid");
									localStorage.setItem("dsh-plaza:view", "grid");
								},
								children: "▦"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": view === "list",
								onClick: () => {
									setView("list");
									localStorage.setItem("dsh-plaza:view", "list");
								},
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
						onChange: () => updateQuery({
							...query,
							labels: toggleLabel(query.labels, id)
						})
					}), resolve(ctx, item.title, id)] }, id))]
				}),
				activeFilterCount(query) > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "plaza-chips",
					children: [
						query.text && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							onClick: () => updateQuery({
								...query,
								text: ""
							}),
							children: [
								"“",
								query.text,
								"” ×"
							]
						}),
						chips.map((chip) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							onClick: () => updateQuery(chip === query.category ? {
								...query,
								category: ""
							} : {
								...query,
								labels: query.labels.filter((value) => value !== chip)
							}),
							children: [chip, " ×"]
						}, chip)),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							onClick: () => updateQuery(INITIAL_QUERY),
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
						onClick: () => void load(source, query),
						children: t("retry")
					})]
				}) : status === "loading" && !result ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "plaza-state",
					children: t("loading")
				}) : result?.entries.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "plaza-state",
					children: t("empty")
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: view === "grid" ? "plaza-grid" : "plaza-list",
					children: result?.entries.map((entry) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Card, {
						entry,
						onOpen: () => void open(entry),
						ctx,
						t
					}, entry.name))
				}),
				result?.nextOffset !== null && result?.nextOffset !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					className: "plaza-more",
					type: "button",
					onClick: () => void load(source, query, true),
					children: t("more")
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
	viewGrid: "网格视图",
	viewList: "紧凑列表",
	clear: "清除全部",
	results: "{count} 个结果",
	loading: "正在加载插件索引…",
	empty: "没有符合当前条件的插件",
	error: "无法读取插件索引",
	retry: "重试",
	more: "显示更多",
	details: "插件详情",
	close: "关闭详情",
	noDetail: "此插件暂未提供详细介绍",
	source: "索引源",
	compatibilityUnknown: "兼容性未知",
	compatible: "兼容",
	incompatible: "不兼容",
	installed: "已安装",
	update: "有更新"
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
	viewGrid: "Grid view",
	viewList: "Compact list",
	clear: "Clear all",
	results: "{count} results",
	loading: "Loading plugin index…",
	empty: "No plugins match the current filters",
	error: "Could not read the plugin index",
	retry: "Retry",
	more: "Show more",
	details: "Plugin details",
	close: "Close details",
	noDetail: "No detailed description is available",
	source: "Index source",
	compatibilityUnknown: "Compatibility unknown",
	compatible: "Compatible",
	incompatible: "Incompatible",
	installed: "Installed",
	update: "Update available"
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
		t
	})));
}

//#endregion
exports.apply = apply;
exports.inject = inject;
return module.exports; } });
//# sourceMappingURL=client.js.map