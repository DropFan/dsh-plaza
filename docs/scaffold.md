# DSH Plaza 脚手架

## 目录

- `package.json`：Bundle、Client 注入关系、构建与测试命令。
- `cordis.patch.yml`：只插入一个 `dsh-plaza` Loader row。
- `src/index.ts`：无状态 Host 入口。
- `src/client/index.tsx`：Locale 注册与 `plugins.tab` Slot 注册。
- `src/client/Plaza.tsx`：市场列表、来源管理、详情、版本列表和 Owner 操作适配。
- `src/client/controller.ts`：索引、稳定分页、详情读取和 Host 事件控制器。
- `src/client/persistence.ts`：每来源查询、已加载数量、视图和滚动位置恢复。
- `src/client/Markdown.tsx`：GFM 与经过白名单净化的 README HTML 渲染。
- `src/client/install.ts`：精确版本、兼容性、来源和官方安装 Owner 适配。
- `src/client/query.ts` / `sources.ts`：查询与索引来源纯逻辑。
- `src/client/plaza.css`：只使用 DSH Theme Token 的响应式样式。
- `locale/`：Plugin Manager 展示用中英文元数据。
- `tests/`：控制器、状态恢复、Markdown 安全、安装参数和 Client 产物契约测试。

## 构建边界

Host 不提供市场后端，也不保存权威状态。Client 调用官方 `remote.pluginMarket` 读取和配置 Format 1 索引，并把精确安装目标交给 `plugins.tab` Owner 的 `install`；已安装条目调用 `openPackage` 进入官方 Installed 详情。Plaza 不调用 pnpm、不直接写 Profile，也不复制安装、更新、卸载、构建审批、恢复或重启事务。

Plaza Bundle 只提供 UI row。运行时必须由官方 `@deepseek-ai/dsh-experimental-plugin-market-bundle` 或等价的唯一 Owner 提供 `pluginMarket` Host Service；重复声明 Host row 会使 Settings 无法定位权威配置入口。

## 验证

```sh
pnpm install
pnpm check
```

构建输出为 `lib/index.js` 与 DSH Client Module Loader 可加载的 `client/client.js`。Client 产物测试会拒绝 Node builtin `require`，并限制 Markdown 管线加入后的体积预算。真实 Profile 测试必须通过官方 Plugin Manager 安装工作区 Bundle；测试插件也只通过官方安装和移除流程管理。

## 当前限制

- 当前会话的 Agent 预设没有暴露 `cordis_inspect_list` / `cordis_inspect_query` Tool；契约由运行中的 DSH `0.2.2-rc.2` 安装源码、升级指南和已发布类型包交叉核对。
- 当前已实现列表、组合查询、规则网格/列表、详情图片路由，以及每来源查询、兼容性/安装状态筛选、已加载数量和滚动位置恢复；启用客户端筛选时会自动读取服务端查询的全部分页。
- 已呈现 Format 1 与官方 Market Remote 提供的插件元数据、推荐/已安装版本、逐版本兼容要求与精确来源、详情来源、索引说明/错误/读取时间。
- 详情使用 `react-markdown`、`remark-gfm`、`rehype-raw` 与 `rehype-sanitize` 渲染 GFM 和常见 README HTML；脚本、事件属性、内联样式、iframe 和危险协议会被移除。
- 已接入官方安装闭环：推荐版本与精确版本调用 Owner `install`，已安装、可更新或 DSH 提供的条目调用 `openPackage`。更新、启停、配置、卸载和恢复仍由官方 Installed/Plugin Manager 负责。
- 未实现收藏、评论、分组、备注、备份或自建包管理事务。
- 已在 DSH Desktop `0.2.2-rc.1` 完成完整集成验证，并在 `0.2.2-rc.2` 复核运行与核心契约：Slot、Format 1 索引、搜索筛选、规则网格/列表、详情、深浅主题、窄屏、键盘返回、状态恢复和官方安装/移除闭环均保持兼容。
- 测试索引使用 dshmarket 文档公开推荐的独立 Format 1 地址 `https://cdn.jsdelivr.net/npm/dsh-plugin-catalog/index.json`；不调用 dshmarket 私有 API，也不读取其状态文件。
- Plaza Bundle 只声明 UI row；官方实验 Market Bundle 是 `pluginMarket` Host row 的唯一 Owner，避免重复行导致 Settings 无法保存来源。
