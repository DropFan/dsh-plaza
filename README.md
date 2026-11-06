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

## 当前阶段

项目处于初始化和只读 MVP 设计阶段。第一阶段计划实现：

1. 注册独立的 Plugins Tab。
2. 接入 Format 1 插件索引。
3. 实现规则网格与紧凑列表。
4. 实现搜索、分类、标签、筛选与排序。
5. 实现应用内插件详情和列表状态恢复。
6. 验证体验后接入 DSH 官方安装流程。

详细方案见 [产品与技术方案](docs/product-and-technical-plan.md)。

## 开发状态

尚未发布，也尚未承诺稳定 API。支持的 DSH 版本范围将在完成首个契约验证后确定。
