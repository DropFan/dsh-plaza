# DSH Plaza

DSH Plaza 是一个面向 DeepSeek Harness 的原生插件市场界面，专注于让插件发现、筛选、比较、查看详情和安装更加清晰可靠。

## 项目目标

- 使用等高规则网格和紧凑列表，拒绝瀑布流。
- 提供明确、可组合、可恢复的搜索、筛选与排序。
- 在 DSH 内查看插件详情，只有明确的外部链接才打开浏览器。
- 复用 DSH 官方 `pluginMarket` 和 `pluginManager`，不重复实现包管理事务。
- 独立于 `dshmarket` 运行，不依赖其接口或状态文件。

## 架构原则

```text
DSH Plaza Client
├── pluginMarket：目录、搜索、兼容性、详情
├── pluginManager：安装和插件生命周期
├── plugins.tab：DSH 原生页面入口
└── Format 1 Index：可配置插件索引
```

DSH Plaza 不直接运行 pnpm，不直接修改 Profile、Lockfile 或 Loader 配置。

## 当前能力

DSH Plaza 已完成浏览、详情和官方安装核心链路；完整安装异常场景仍在验证：

- 通过 `plugins.tab` 注册 DSH 原生 Plaza 页面。
- 管理可配置的 Format 1 索引源。
- 支持搜索、分类、标签、组合筛选、索引排序和分页。
- 提供等高规则网格与紧凑列表，并按来源恢复查询、已加载数量和滚动位置。
- 在应用内渲染 GFM Markdown、经过白名单净化的常见 README HTML，以及官方详情图片。
- 展示推荐版本、已安装版本、完整版本列表、精确安装来源、DSH 兼容要求、安装状态和详情文档来源。
- 支持兼容性与安装状态的客户端筛选；启用时自动读取服务端查询的全部分页，避免遗漏后续页中的匹配插件。
- 展示索引说明、最近错误、读取时间，以及插件关键词、自定义排序指标和仓库子目录。
- 通过 `plugins.tab` Owner 的 `install(...)` 调用官方安装流程；已安装条目通过 `openPackage(...)` 进入官方 Installed 详情。
- 支持中英文、深浅主题、窄屏筛选面板和键盘操作；详情采用 Tab 内双状态页面并在返回时恢复焦点。

详细设计、边界与阶段状态见 [产品与技术方案](docs/product-and-technical-plan.md)，项目结构与验证方式见 [开发与验证说明](docs/scaffold.md)。

## 开发

当前要求 DSH `>=0.2.2-rc.1 <0.3.0`，并依赖官方实验 Plugin Market Bundle 提供唯一的 `pluginMarket` Host Service。

```sh
pnpm install
pnpm check
```

`pnpm check` 会运行严格类型检查、源码测试、Host/Client 构建和 Client 产物契约测试。

## 开发状态

当前版本为 `0.3.0`，尚未发布，也尚未承诺稳定 API。代码已在真实 DSH Desktop Profile 中验证，并以 4000 条索引自动测试覆盖全分页读取；后续重点是浏览器性能基线、更多官方安装异常场景和并行试用。
