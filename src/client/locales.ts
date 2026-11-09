export const zh = {
  tab: 'Plaza', title: 'DSH Plaza', subtitle: '发现适合你的 DSH 插件', search: '搜索插件',
  allCategories: '全部分类', labels: '标签', sort: '排序', sortIndex: '默认顺序', sortRelevance: '最佳匹配',
  sortNewest: '最新发布', view: '视图模式', viewGrid: '网格视图', viewList: '紧凑列表', clear: '清除全部', results: '{count} 个结果',
  loading: '正在加载…', empty: '没有符合当前条件的插件', error: '无法读取插件索引', retry: '重试',
  more: '显示更多', details: '插件详情', back: '返回插件列表', noDetail: '此插件暂未提供详细介绍', source: '索引源',
  detailLoading: '正在读取详细介绍…', detailError: '无法读取详细介绍', detailTimeout: '读取详细介绍超时，请重试。', removeFilter: '移除筛选条件：{name}',
  compatible: '兼容', incompatible: '不兼容', compatibilityExempted: '已设置兼容性豁免', installed: '已安装', update: '有更新', provided: 'DSH 已提供',
  author: '作者', homepage: '项目主页', sourceCode: '源代码', noSources: '尚未配置索引源', manageSources: '管理来源',
  sourcesTitle: '索引来源', sourcesTrust: '索引由第三方提供。只添加你信任的来源；其中的插件安装后会以你的权限运行。', sourceUrl: '索引 URL', addSource: '添加', removeSource: '移除', sourceError: '无法保存索引来源，请检查 URL 或稍后重试。',
} as const

export type LocaleKey = keyof typeof zh

export const en: Record<LocaleKey, string> = {
  tab: 'Plaza', title: 'DSH Plaza', subtitle: 'Find the right plugins for DSH', search: 'Search plugins',
  allCategories: 'All categories', labels: 'Labels', sort: 'Sort', sortIndex: 'Default order', sortRelevance: 'Best match',
  sortNewest: 'Newest', view: 'View mode', viewGrid: 'Grid view', viewList: 'Compact list', clear: 'Clear all', results: '{count} results',
  loading: 'Loading…', empty: 'No plugins match the current filters', error: 'Could not read the plugin index', retry: 'Retry',
  more: 'Show more', details: 'Plugin details', back: 'Back to plugins', noDetail: 'No detailed description is available', source: 'Index source',
  detailLoading: 'Loading details…', detailError: 'Could not read the details', detailTimeout: 'Reading the details timed out. Try again.', removeFilter: 'Remove filter: {name}',
  compatible: 'Compatible', incompatible: 'Incompatible', compatibilityExempted: 'Compatibility exemption applied', installed: 'Installed', update: 'Update available', provided: 'Provided by DSH',
  author: 'Author', homepage: 'Homepage', sourceCode: 'Source code', noSources: 'No index sources configured', manageSources: 'Manage sources',
  sourcesTitle: 'Index sources', sourcesTrust: 'Indexes are provided by third parties. Add only sources you trust; installed plugins run with your permissions.', sourceUrl: 'Index URL', addSource: 'Add', removeSource: 'Remove', sourceError: 'Could not save the index sources. Check the URL or try again.',
}
