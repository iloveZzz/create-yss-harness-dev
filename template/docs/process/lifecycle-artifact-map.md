# YSS 生命周期产物与门禁地图

本文是模板仓库与模板实例共享的生命周期派生阅读视图。结构化事实源是 `docs/process/lifecycle-registry.yaml`；本文解释主阶段、条件门禁、必须持久化的产物和退出标准。具体项目只有在触发条件命中时才执行对应门禁。

<!-- lifecycle-registry:structure:start -->
> 此结构区由 `docs/process/lifecycle-registry.yaml` 生成。当前为 `active` 模式：它校验结构和派生文档，不改变运行时状态 schema 或人工批准语义。

## 1. 主阶段

| 稳定 ID | 阶段 | 目标 | 退出标准 |
|---|---|---|---|
| `stage.harness-entry` | Harness 入口 | 校验仓库身份、上游输入、影响面和实现仓库上下文。 | 上游输入版本当前，影响面、项目根、分支、写入范围和验证命令可解释。 |
| `stage.tactical-design` | DDD 战术设计 | 将已确认的战略领域输入细化为可实现、可验证的战术模型。 | Tactical Design Contract 已批准；无领域影响时已记录 not-applicable 及原因。 |
| `stage.slice-contract` | Slice Contract | 将战术设计和冻结契约编译为一个跨前后端测试的实现合同。 | 合同版本当前、四个角色分区完整、写路径和验证命令明确，且就绪公式满足。 |
| `stage.slice-implementation` | 垂直切片实现 | 由前端、后端和测试 Agent 按同一合同并行实现和验证。 | 行为实现、测试证据、契约一致性和写入边界均满足合同。 |
| `stage.verification` | 独立验证 | 由测试 Agent 以独立执行态完成 Fresh Verification 和合并前复核。 | 所有命中门禁通过，阻塞信号清空，证据可读且 checkpoint 可追溯。 |

## 2. 生命周期对象

门禁是需要裁决的审查点；产物、工作单元和证据不是门禁的同义词。未命中条件的门禁记录 `not-applicable` 及原因，不生成空文档。

### 2.1 条件门禁

| 稳定 ID | 门禁 | 所属阶段 | 触发条件 | 前置门禁 | 必须留下的证据 |
|---|---|---|---|---|---|
| `gate.repository-identity-valid` | 仓库身份有效 | `stage.harness-entry` | 每次进入 Harness。 | 无 | `evidence.repository-identity-check` |
| `gate.tactical-design-approved` | Tactical Design 批准 | `stage.tactical-design` | 存在领域行为、聚合、状态、不变量、一致性、事件、Gateway 或持久化影响。 | 无 | `evidence.tactical-design-review`、`evidence.approval-record` |
| `gate.high-risk-architecture-confirmed` | 高风险架构确认 | `stage.tactical-design` | 存在不可逆或跨边界高风险架构取舍。 | 无 | `evidence.architecture-decision`、`evidence.approval-record` |
| `gate.slice-contract-approved` | Slice Contract 批准 | `stage.slice-contract` | 任一 Agent 进入切片实现前。 | 无 | `evidence.contract-approval` |
| `gate.slice-ready-for-agent` | 切片实现就绪 | `stage.slice-contract` | Slice Contract 满足完整就绪公式。 | 无 | `evidence.contract-approval` |
| `gate.openapi-freeze-confirmed` | OpenAPI Freeze 确认 | `stage.slice-contract` | 切片有 API 影响且契约进入实现。 | 无 | `evidence.approval-record` |
| `gate.fresh-verification-passed` | Fresh Verification 通过 | `stage.verification` | 实现完成并准备进入合并前复核。 | 无 | `evidence.fresh-verification`、`evidence.test-verification` |
| `gate.merge-approved` | 合并批准 | `stage.verification` | 切片完成合并前裁决。 | 无 | `evidence.approval-record`、`evidence.checkpoint-and-rollback` |

### 2.2 生命周期产物

| 稳定 ID | 产物 | 所属阶段 | 触发条件 |
|---|---|---|---|
| `artifact.impact-assessment` | 影响面分析 | `stage.harness-entry` | 每次进入 Harness。 |
| `artifact.upstream-inputs` | 上游输入包 | `stage.harness-entry` | 进入战术设计前。 |
| `artifact.tactical-design` | DDD 战术设计 | `stage.tactical-design` | 存在领域行为或战术 DDD 影响。 |
| `artifact.api-boundary` | API 边界 | `stage.slice-contract` | 存在 API 影响。 |
| `artifact.openapi-draft` | OpenAPI Draft | `stage.slice-contract` | 存在 API 影响且需要进入 Freeze 审查。 |
| `artifact.data-architecture` | 数据架构 | `stage.slice-contract` | 存在数据模型、存储或一致性影响。 |
| `artifact.slice-implementation-contract` | Slice Implementation Contract | `stage.slice-contract` | 任一 Agent 进入实现。 |
| `artifact.frontend-implementation-plan` | 前端实现计划 | `stage.slice-contract` | 存在 UI 影响。 |
| `artifact.test-strategy` | 测试策略 | `stage.slice-contract` | 每个行为切片。 |
| `artifact.test-seams` | 测试 seam 与 fixture | `stage.slice-contract` | 进入实现前。 |
| `artifact.fresh-verification` | Fresh Verification | `stage.verification` | 实现完成后。 |
| `artifact.checkpoint` | Git Checkpoint | `stage.verification` | 合并前或发生阻塞 / 责任变化时。 |

### 2.3 执行证据

| 稳定 ID | 证据 | 说明 |
|---|---|---|
| `evidence.repository-identity-check` | 仓库身份校验结果 | yss-project.yaml 合法性与 repository_mode 裁决。 |
| `evidence.upstream-input-check` | 上游输入校验结果 | Spec、战略设计、原型、OpenAPI、数据架构和工程约束的版本与批准状态。 |
| `evidence.tactical-design-review` | DDD 战术设计评审证据 | 聚合、Entity、Value Object、行为、不变量、状态、一致性、Gateway、持久化和测试 seam 的评审结果。 |
| `evidence.architecture-decision` | 架构决策证据 | API、数据、跨边界和高风险架构取舍的可追溯决策。 |
| `evidence.contract-approval` | Slice Contract 批准记录 | 当前版本 Slice Implementation Contract 的生成、校验和批准引用。 |
| `evidence.frontend-verification` | 前端验证证据 | 前端页面、状态、交互、组件和 pnpm 命令的实际验证结果。 |
| `evidence.backend-verification` | 后端验证证据 | Domain、Application、API、数据和 ./mvnw 命令的实际验证结果。 |
| `evidence.test-verification` | 测试验证证据 | 测试 seam、fixture、契约、集成、E2E 和覆盖率结果。 |
| `evidence.fresh-verification` | Fresh Verification 记录 | 本轮重新执行的验证命令、退出码、执行时间和可读输出引用。 |
| `evidence.checkpoint-and-rollback` | Checkpoint 与回滚点 | 变更边界、仓库顺序、提交引用和恢复动作。 |
| `evidence.approval-record` | 人工批准记录 | 高风险架构、OpenAPI Freeze 或合并裁决的可追溯记录。 |
<!-- lifecycle-registry:structure:end -->

完成结论必须同时包含批准的 Slice Implementation Contract 与 YSS Skill Execution Result（若进入实现阶段）。

安全 / 权限不形成独立门禁。只有需求或冻结资产明确改变相关业务行为时，才把它写入普通产物，并按实际 UI、API、Backend、Data、High-risk 影响使用上表既有门禁。

## 3. 退出与 checkpoint

阶段退出以“当前命中的门禁已通过、阻塞边已清除、证据可读、下一阶段入口明确”为准。连续推进时集中记录阶段因果、Ticket 同步状态、验证证据、风险、人工审查点和 Git checkpoint；不把单个阶段的口头汇报当作完成证明。
