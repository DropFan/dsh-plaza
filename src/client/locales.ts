export const zh = {
  tab: 'Plaza', title: 'DSH Plaza', subtitle: '发现适合你的 DSH 插件', search: '搜索插件',
  allCategories: '全部分类', labels: '标签', sort: '排序', sortIndex: '默认顺序', sortRelevance: '最佳匹配',
  sortNewest: '最新发布', view: '视图模式', viewGrid: '网格视图', viewList: '紧凑列表', clear: '清除全部', results: '{count} 个结果',
  loading: '正在加载…', empty: '没有符合当前条件的插件', error: '无法读取插件索引', retry: '重试',
  more: '显示更多', details: '插件详情', back: '返回插件列表', noDetail: '此插件暂未提供详细介绍', source: '索引源',
  detailLoading: '正在读取详细介绍…', detailError: '无法读取详细介绍', removeFilter: '移除筛选条件：{name}',
  compatible: '兼容', incompatible: '不兼容', compatibilityExempted: '已设置兼容性豁免', installed: '已安装', update: '有更新', provided: 'DSH 已提供',
  author: '作者', homepage: '项目主页', sourceCode: '源代码',
} as const

export type LocaleKey = keyof typeof zh

export const en: Record<LocaleKey, string> = {
  tab: 'Plaza', title: 'DSH Plaza', subtitle: 'Find the right plugins for DSH', search: 'Search plugins',
  allCategories: 'All categories', labels: 'Labels', sort: 'Sort', sortIndex: 'Default order', sortRelevance: 'Best match',
  sortNewest: 'Newest', view: 'View mode', viewGrid: 'Grid view', viewList: 'Compact list', clear: 'Clear all', results: '{count} results',
  loading: 'Loading…', empty: 'No plugins match the current filters', error: 'Could not read the plugin index', retry: 'Retry',
  more: 'Show more', details: 'Plugin details', back: 'Back to plugins', noDetail: 'No detailed description is available', source: 'Index source',
  detailLoading: 'Loading details…', detailError: 'Could not read the details', removeFilter: 'Remove filter: {name}',
  compatible: 'Compatible', incompatible: 'Incompatible', compatibilityExempted: 'Compatibility exemption applied', installed: 'Installed', update: 'Update available', provided: 'Provided by DSH',
  author: 'Author', homepage: 'Homepage', sourceCode: 'Source code',
}
