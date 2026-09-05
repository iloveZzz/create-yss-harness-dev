---
name: yss-implementation-contract-compiler
description: 将已批准的 DDD 战术设计、冻结契约和 capability 编译为 Slice Implementation Contract v2 草案；当垂直切片进入实现、验证结果或需要重路由时使用。
---

# YSS Implementation Contract Compiler

本技能是确定性的实现合同编译器，不是生命周期主控。它消费已批准且版本当前的输入，输出 draft、blocked 或 ready-for-lifecycle-review 的合同草案，由 `harness-orchestrator` 批准、持久化并设置 ready-for-agent。

## 输入

必须读取 yss-project.yaml、CONTEXT.md、Spec / 战略设计、Tactical Design Contract、API / 数据 / UI 影响、实现仓库登记、允许写路径和验证命令。输入缺失、未批准或过期时返回 blocked。

当 backend `scaffold_status=required` 时，还必须读取当前 `scaffold-architecture-decisions.yaml`。Harness Orchestrator 先基于领域复杂度给出 `domain-driven` / `layered-mvc` 推荐并取得用户逐项目确认，本体选择只作为子项目预填默认；编译器不得自行默认、提问或批准。确认 DDD 时绑定 `yss-ddd-scaffold-generator`，确认 MVC 时绑定 `yss-layered-mvc-scaffold-generator`，并把 decision ref / id / digest、Profile 与确定性模块闭包写入 scaffold contract schema v3。

## 编译结果

合同必须绑定一个 `slice-implementation-contract-v2`，包含 architecture、frontend、backend、testing 四个分区，并为前端、后端、测试任务包复制同一 contract_id / contract_version。

编译器必须计算：

- 按 `compiler-contract.yaml` 将 impact 映射为入口 capability；Recipe 只能引用 capability。
- 合并多个窄 Recipe 后只计算一次闭包；只递归 `context-required`，显式 condition 命中时才加载 `context-conditional`，其他类型不扩张实现上下文。
- 按 Recipe 声明顺序、依赖拓扑和 skill ID 兜底确定性排序；去重 skill 并保留全部原因链。
- API Freeze 或无 API 影响记录。
- 数据架构或无数据影响记录。
- UI 交互、状态、原型输入，以及批准且 digest 当前的 Visual Baseline manifest 与当前切片 `case_id`；无 UI 影响时记录不适用。
- 实现仓库、分支、项目根、CI、验证命令、回滚点和允许写路径。
- `required_capabilities`、`required_skills`、Registry/Compiler digest、TDD 模式、预期证据和完整重路由触发器。

## 硬规则

- 编译器不得输出 approved、ready-for-agent 或 completed。
- Registry、编译器合同或 Slice Contract schema v1 一律拒绝并返回迁移提示；不自动升级，不提供旧技能名 alias。
- 任一 Registry/Compiler digest 变化使合同 `stale`；重新编译后仍须由 `harness-orchestrator` 再批准。
- 领域影响缺少批准且版本当前的 Tactical Design Contract 时，不得路由 Domain 实现。
- API、状态、Visual Baseline 版本或 digest、数据模型、写路径、测试 seam 或验证命令变化时，必须返回 new_impacts / drift 并完整重路由。
- UI 实现先按 `visual_baseline_case_ids` 读取 manifest、语义引用和对应 PNG，再以相同 case_id、视口、状态和数据 fixture 捕获实现图；禁止目录 glob 和图片独立猜义。
- 前端和后端任务必须使用同一合同版本；版本不一致立即 blocked。
- 业务行为使用 behavior-tdd；只有机械内容允许使用受控生成合同。
- 已存在或已初始化工程不得因架构选择而重新生成；DDD/MVC 互转必须完整重路由到独立迁移工作单元。
- 任务包写入范围、证据和命令必须能被独立验证，不能用自然语言说明替代结构化字段。

## 战略交接快照包

使用 `scripts/strategic-handoff export / verify / import`；源资产冻结、规则身份与批准绑定、目标术语对账和逐条承接合同以 `docs/process/strategic-handoff-package.md` 为准。来自导入包时，战术合同绑定 `strategic_handoff`；批准/流转前执行 `scripts/verify-strategic-handoff-consumption --root <target> <tactical>`，切片消费追加 `--slice <slice-id>`。存在延期时仅允许无依赖且核验通过的切片继续；未知依赖扩大阻断。
