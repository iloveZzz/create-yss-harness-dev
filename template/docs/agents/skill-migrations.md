# 技能迁移说明

本文记录已退役技能入口的迁移路径。退役技能不保留物理目录、投影或 lock 条目；本文件是历史名称的唯一持久兼容说明。

## 实现合同与源码索引技能硬替换（2026-09-04）

`yss-router` 已由 `yss-implementation-contract-compiler` 硬替换；`yss-source-index` 已由 `yss-skill-source-index-refresh` 硬替换。两个旧 ID 不保留 alias、兼容目录、投影或 lock 条目，也不能作为 Recipe、合同、模板或脚本的正向输入。

- Registry、编译器合同、Slice Implementation Contract 和 YSS Skill Execution Result 使用 schema v2。
- Recipe 只引用 dotted capability；类型化依赖只由 `docs/agents/yss-skill-registry.yaml` 持有。
- schema v1 明确拒绝并返回迁移提示，不自动升级。
- 历史冻结证据不改写；旧 ID 只允许留在本迁移记录、`OBSOLETE` 阻断集合和负向测试。

## high-fidelity-html-prototype

`high-fidelity-html-prototype` 已退役，不再作为 实现合同编译器 alias、默认发现入口或独立物理技能存在。

迁移到：

- 阶段合同：`yss-prototype-stage`
- Codex 产品设计主入口：`product-design:index`
- Ant Design v6 事实与 CLI 证据：`yss-antd-design`
- 独立低保真评审：`prototype-review`

当前分支不执行旧生命周期迁移；旧原型资产只作为上游输入，由 `harness-orchestrator` 重新判定实际影响并路由到四角色 Harness Agent 流程。不得创建旧角色、旧阶段或同名兼容目录。

## yss-product-lifecycle

`yss-product-lifecycle` 已退役，不再作为 实现合同编译器 alias、默认发现入口、公开技能或独立物理技能存在。

迁移到：

- 正式编排入口：`harness-orchestrator`
- 领域战术设计：`architecture-agent` 使用 `yss-tactical-design`
- 垂直切片合同：`yss-implementation-contract-compiler` 编译 Slice Implementation Contract 草案，由 Harness Orchestrator 批准

遇到旧调用或旧阶段资产时返回 `blocked`，引用 `harness-agent-contract-v1`，由 Orchestrator 重新建立当前版本的上游输入、Tactical Design Contract 和 Slice Implementation Contract。不得创建同名兼容目录，也不得恢复需求、产品、商务或项目管理角色。

## yss-stage-decision

`yss-stage-decision` 已退役，不再作为 实现合同编译器 alias、默认发现入口或独立物理技能存在。

迁移到：

- 正式编排入口：`harness-orchestrator` 的 `harness-entry`
- 领域战术设计：`architecture-agent` 使用 `yss-tactical-design`

当前流程从已批准的上游 Spec / 战略设计进入 Harness Entry。遇到旧 Discovery / 战略设计调用或旧阶段资产时返回 `blocked`，引用 `harness-agent-contract-v1` 并交回 Orchestrator。不得创建同名兼容目录，也不得恢复旧阶段决策包为现行路由。
