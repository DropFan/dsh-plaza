# DSH Plaza 产品与技术方案

## 1. 决策摘要

DSH Plaza 采用“替换体验、复用官方底层”的路线：

- 使用 DSH 官方 `pluginMarket` 负责索引源、搜索、分类、标签、排序、兼容性、分页和详情文档。
- 使用 DSH 官方 `pluginManager` 负责安装、更新、卸载、启停、构建脚本审批、取消、恢复和版本兼容检查。
- 以新的 `plugins.tab` Client 插件提供市场界面，不自行操作 pnpm、Profile 文件、Loader 或重启流程。
- 第一阶段与官方 Discover 和 dshmarket 并存；通过验证后再停用旧市场入口。

DSH Plaza 不依赖 dshmarket 的代码、HTTP 接口或 `.dsh-market` 状态文件。

## 2. 产品定位

> 一个专注于“快速找到、可靠判断、安心安装”的 DSH 原生插件市场。

它不做大而全的插件运维中心。普通用户默认只看到选择插件所需的信息；诊断、备份和 Loader 细节由 DSH 官方管理界面或独立高级工具承担。

### 核心原则

1. **应用内闭环**：查找、筛选、查看详情、选择版本和安装均不离开 DSH。
2. **位置稳定**：禁止瀑布流和卡片原地展开。
3. **筛选透明**：所有生效条件可见、可单独清除。
4. **排序可信**：严格执行用户选择；推荐排序必须可解释。
5. **渐进披露**：列表只放决策必需信息，技术细节进入详情。
6. **官方底层唯一写入**：不直接写 Profile 文件、不启动 pnpm、不维护第二套 Loader 状态。
7. **宿主原生体验**：使用 React Slot、DSH 主题 Token、Locale 和页面布局，不使用 iframe。

## 3. 信息架构

### 发现

用于搜索和安装新插件，包括：

1. 搜索框；
2. 常用筛选栏；
3. 高级筛选面板；
4. 生效条件标签；
5. 结果数量与排序；
6. 规则网格或紧凑列表；
7. 明确分页或“显示更多”。

### 收藏

收藏不是 MVP 的独立产品域。后续若实现，应使用 DSH Storage Domain 做 Host 持久化，避免只存在于单个浏览器。

### 来源

索引源管理放在工具栏二级入口中，展示来源标题、URL、最近错误和第三方信任提示。

已安装插件的启停、配置、更新和卸载仍由官方 Installed 页面承担。市场中的已安装状态调用 `openPackage(name)` 进入官方详情。

## 4. 插件列表设计

### 默认规则网格

- 使用 CSS Grid，不使用 Masonry。
- 桌面宽屏 3～4 列，普通宽度 2～3 列，窄屏单列。
- 同一行卡片等高。
- 简介固定两行截断。
- 标签最多显示两个，其余显示 `+N`。
- 图标固定尺寸并预留占位，加载失败不改变布局。
- 兼容状态固定在卡片底部左侧。
- 主操作固定在卡片底部右侧。
- 安装进度替换主操作位置，不改变卡片高度。

卡片展示图标、名称、作者、一句话描述、分类、标签、兼容状态、推荐版本、发布时间和安装状态。

### 紧凑列表

提供网格/列表切换并记忆选择。建议列：

- 插件；
- 分类；
- 兼容性；
- 最新版本；
- 发布时间；
- 状态与操作。

两种视图共享同一查询状态。

### 分页

MVP 沿用官方每页 50 条和“显示更多”。禁止自动无限滚动。

## 5. 筛选与排序

### MVP 筛选

- 索引源；
- 分类；
- 标签；
- 文本搜索；
- 兼容当前 DSH、兼容性未知、明确不兼容；
- 未安装、已安装、有更新、DSH 已提供。

兼容性和安装状态目前不是官方 `MarketQuery` 的服务端条件。若在 Client 对已加载页筛选，界面必须明确结果范围；长期应推动 Host Query 扩展。

### MVP 排序

- 有搜索词时默认最佳匹配；
- 无搜索词时默认索引顺序；
- 发布时间升序/降序；
- 索引声明的自定义排序键。

### 交互约束

- 显示结果总数。
- 生效条件显示为可删除 Chip。
- 提供一键清除。
- 零结果说明当前条件并提供清除操作。
- 搜索输入使用 250ms debounce。
- 返回列表时保留搜索、筛选、排序、已加载页数、视图模式和滚动位置。
- 每个索引源独立记忆查询条件。

## 6. 应用内插件详情

桌面端使用右侧宽抽屉，窄屏使用应用内全屏详情。若 Plugins 页容器不适合抽屉，则使用 Tab 内列表/详情双状态页面。

首屏展示：

1. 图标、名称、作者；
2. 一句话描述；
3. 兼容性结论；
4. 推荐版本；
5. 安装或查看已安装插件操作；
6. 信任提示。

正文展示 Markdown 详情、图片、版本列表、来源和技术信息。外部链接必须标注 `↗`，只有用户主动点击时才打开浏览器。

详情数据来自：

```ts
pluginMarket.readEntryDetail(url, name, version, language)
```

原始 HTML 保持禁用。

## 7. 安装与管理

新市场只负责选择和确认精确版本，然后调用 `plugins.tab` Owner：

```ts
install({ spec, registry?, title, version })
```

由官方 Plugin Manager 处理安装前检查、信任提示、Registry、安装日志、取消、断线恢复、构建脚本审批和 HMR/重启结果。

对于已安装、可更新或 DSH 提供的条目，调用：

```ts
openPackage(packageName)
```

更新、启停、配置和卸载继续由官方 Installed 页面承担。

## 8. 技术架构

```text
DSH Plaza Client Tab
  ├─ Query Controller
  │   └─ pluginMarket.search
  ├─ Detail Controller
  │   └─ pluginMarket.readEntryDetail
  ├─ Source Controller
  │   └─ listIndexes / setIndexes
  ├─ Install Adapter
  │   └─ plugins.tab owner.install
  └─ Installed Navigation
      └─ plugins.tab owner.openPackage

Official Host
  ├─ pluginMarket
  │   ├─ index validation/cache/search
  │   ├─ compatibility
  │   └─ detail Markdown/images
  └─ pluginManager
      ├─ install/update/remove
      ├─ progress/cancel/recovery
      └─ profile/HMR/build approval
```

### 插件形态

- Host 入口尽量保持轻薄，不新增权威业务状态。
- Client 入口注册 Locale、样式和 `plugins.tab`。
- 使用 `ctx.slots.inject('plugins.tab', ...)`，支持 Slot 晚加载和重载。
- UI 作为 Host React 树的一部分，不使用 iframe。
- 不直接依赖不稳定的 Client primitives 模块，只共享官方主题 Token。

### 状态分层

权威状态：

- 索引源由 `pluginMarket.setIndexes` 保存。
- 插件安装和启停状态由 `pluginManager` 保存。

浏览器偏好：

- 网格/列表模式；
- 每个来源的查询；
- 高级筛选展开状态。

浏览器存储不得保存安装事务或权威插件状态。

## 9. MVP 不实现

- 自建安装、更新、卸载和回滚接口；
- Loader Patch 写入；
- 重启助手；
- WebDAV/Gist 备份；
- Bundle 加载顺序；
- 组合预设和快照；
- GitHub 加速和地区探测；
- 自建诊断和 AI Fix；
- 评论、分组和备注；
- 主题互斥管理；
- dshmarket 自升级与自卸载。

## 10. 实施计划

### 阶段 0：验证契约

- 建立 `pluginMarket` 与 `pluginManager` API 契约测试。
- 验证 Desktop 和 Web 下的 Remote 权限、详情图片路由和安装 Owner Props。
- 选定一个 Format 1 索引作为测试源。

### 阶段 1：只读 MVP

- 新 `plugins.tab`；
- 来源、搜索、分类、标签和排序；
- 规则网格/紧凑列表；
- 应用内详情；
- 状态恢复。

### 阶段 2：安装闭环

- 精确版本选择；
- 安装确认；
- Owner `install`；
- 已安装条目 `openPackage`；
- 验证兼容性、构建审批、取消和重启结果。

### 阶段 3：并行试用

- 与官方 Discover、dshmarket 并存；
- 收集搜索成功率、详情打开率、安装完成率和错误类型；
- 不读取或修改 `.dsh-market/state.json`。

### 阶段 4：迁移与退场

- 配置 `dsh-plugin-catalog` Format 1 索引；
- 先关闭 dshmarket 的 Plugins Tab、Settings 和 Sidebar 入口；
- 验证 DSH Plaza 和官方 Installed 管理完整后，再决定是否卸载 dshmarket。

## 11. MVP 验收标准

### 浏览

- 不使用瀑布流；同一行等高，图片加载不造成布局跳动。
- 网格/列表切换在刷新后保持。
- 50、500 和 4000 条索引下交互可用。

### 搜索、筛选和排序

- 搜索、分类、标签和排序组合正确。
- 生效条件可见、可单独清除。
- 正确显示结果数量；Client 局部筛选不得伪装成全量结果。
- 返回列表保留查询和滚动位置。

### 详情

- 点击卡片在 DSH 内打开详情。
- Markdown、图片、版本和兼容性可查看。
- 只有明确的 `↗` 操作打开网页。
- 关闭详情后卡片位置不变化。

### 安装

- 安装由官方 Plugin Manager 完成。
- 成功、失败、取消、构建审批、需重启和断线恢复均有明确结果。
- DSH Plaza 不直接写 Profile 文件，不维护第二份安装状态。

### 可访问性和主题

- 键盘可完成搜索、筛选、打开详情和安装。
- 详情抽屉具备焦点约束、Escape 关闭和正确 ARIA 标识。
- 浅色、深色主题只使用 DSH Token。
- 窄屏下筛选进入面板，生效条件数量持续可见。

## 12. 主要风险

| 风险 | 应对 |
|---|---|
| 官方 Remote 或 Slot 接口变化 | 声明严格 `engines.dsh`；CI 执行契约检查 |
| Client 筛选只覆盖已加载页 | 明示范围；推动 Host Query 扩展 |
| 抽屉与 Plugins 页面滚动容器冲突 | 先验证真实 DOM；必要时改为 Tab 内详情页 |
| 官方完成结果刷新延迟 | 监听变更事件，重新进入页面时刷新 |
| dshmarket 收藏等数据丢失 | 默认不迁移；后续提供显式、可预览的一次性迁移工具 |
| 并存多个市场入口造成困惑 | 试用期标注 Beta；稳定后只保留一个入口 |

## 13. 下一步

首先实现只读交互原型：

1. 注册 `plugins.tab`；
2. 接入 Format 1 索引；
3. 完成规则网格、列表、筛选、排序和应用内详情；
4. 在真实 DSH 页面验证滚动、响应式、主题和返回状态；
5. 体验通过后接入官方安装流程。
