# DSH Plaza 脚手架

## 目录

- `package.json`：Bundle、Client 注入关系、构建与测试命令。
- `cordis.patch.yml`：只插入一个 `dsh-plaza` Loader row。
- `src/index.ts`：无状态 Host 入口。
- `src/client/index.tsx`：Locale 注册与 `plugins.tab` Slot 注册。
- `src/client/Plaza.tsx`：只读市场页面骨架。
- `src/client/query.ts`：可独立测试的查询状态逻辑。
- `src/client/plaza.css`：只使用 DSH Theme Token 的响应式样式。
- `locale/`：Plugin Manager 展示用中英文元数据。
- `tests/`：查询逻辑和 Slot 注册契约测试。

## 构建边界

Host 不提供市场后端，也不保存权威状态。Client 只调用官方 `remote.pluginMarket`，不调用 pnpm、不写 Profile，也不实现安装、更新或卸载。安装阶段将单独复用 `plugins.tab` Owner 的 `install`，不在本 MVP 中启用。

## 验证

```sh
pnpm install
pnpm check
```

构建输出为 `lib/index.js` 与 DSH Client Module Loader 可加载的 `client/client.js`。项目不会在验证过程中安装到当前 Profile。

## 当前限制

- 当前会话的 Agent 预设没有暴露 `cordis_inspect_list` / `cordis_inspect_query` Tool；契约改由同版本 `0.2.2-rc.1` 本机源码、Inspect catalog 与已发布类型包交叉核对。
- 当前已实现列表、组合查询、规则网格/列表、安全 Markdown 子集、详情图片路由，以及每来源查询、已加载数量和滚动位置恢复。
- Markdown 刻意不支持原始 HTML；复杂 Markdown 语法会安全降级为文本，后续可在不依赖 DSH primitives 的前提下扩充。
- 未接入安装、收藏、备份、更新或卸载写操作。
- 尚未安装到真实 DSH Profile，因此真实 Slot、主题、滚动容器和响应式视觉效果仍待授权后的集成验证。
