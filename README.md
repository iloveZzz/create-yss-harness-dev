# create-yss-harness-dev

当前版本：`0.4.0`，模板固定到 `75e977bd9a839c1e0d7d432b46d0307cd2244ba3`。该版本同步战略交接包核验与受控导入，将源规则和场景追溯到战术设计、测试 seam 及依赖切片，并按未解决依赖阻断实现。

把 [`yss-harness-dev-agent`](https://github.com/iloveZzz/yss-harness-dev-agent) 五阶段开发落地 Harness 初始化、接管并同步为 `project-instance` 的 npm CLI。

不是 [`create-yss-spec`](https://github.com/iloveZzz/create-yss-spec)。那是全产品生命周期模板的 CLI；两套产品用不同 metadata，互不接管。

## 用法

```bash
npm create yss-harness-dev@latest
```

```bash
npx create-yss-harness-dev@latest --help
```

当前支持：`init`（默认）、`attach`、`sync`、`update` / `upgrade`。

实例写入 `.yss-harness-dev.json`，`profileId` 为 `harness.dev-agent-slice`。目标已有 `.yss-template.json` 时 fail closed。

第一版只做研发管理资产实例化：不生成前后端运行时、不登记实现仓库、不替代 Harness Orchestrator。

使用方法和跨仓库契约以模板仓为准：

- [create-yss-harness-dev 外部 CLI 实践指南](https://github.com/iloveZzz/yss-harness-dev-agent/blob/main/docs/user-guide/外部命令行工具实践指南.md)

## 开发验证

从本机相邻的 `yss-harness-dev-agent` 工作树同步快照（含未提交文件）：

```bash
npm test
```

绑定远程固定 commit：

```bash
YSS_HARNESS_TEMPLATE_REPO=https://github.com/iloveZzz/yss-harness-dev-agent.git \
YSS_HARNESS_TEMPLATE_REF=<pinned-commit> npm test
YSS_HARNESS_TEMPLATE_REF=<pinned-commit> npm pack --dry-run
```

正式发布不得跟随浮动 `main`。模板仓与本仓未共同通过集成验证时，不得声称整体可发布。
