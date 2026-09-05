# AGENTS.md — 开发落地 Harness 入口

> 本文件只保存常驻路由、硬门禁和禁止事项。本仓职责以 `docs/process/harness-profile.yaml` 为准；生命周期 ID 以 `docs/process/lifecycle-registry.yaml` 为准；影响面裁剪见 `docs/process/harness-process-tailoring.md`。

## 1. 仓库身份

每个任务先读取当前仓库根的 `yss-project.yaml`：

- `template-source` 使用模板维护流程，不生成具体产品的 Spec、原型、OpenAPI 或垂直切片 Ticket。
- `project-instance` 使用 `harness.dev-agent-slice`，从已批准 Spec 或 Strategic Design Handoff 进入开发落地流程。
- 文件缺失、schema 不支持或模式非法时停止路由并执行迁移检查；不得根据目录、Git 远程或占位符猜测身份，也不得继承父目录或兄弟仓的 `AGENTS.md`。

## 2. 单一事实来源

| 事实 | 权威资产 |
|---|---|
| 业务词汇 | 根 `CONTEXT.md` |
| 本仓职责与允许 / 禁止工作单元 | `docs/process/harness-profile.yaml` |
| 生命周期 ID 与条件门禁 | `docs/process/lifecycle-registry.yaml`；`docs/process/lifecycle-artifact-map.md` 仅为派生视图 |
| 影响面与维护强度 | `docs/process/harness-process-tailoring.md`、`docs/process/maintenance-intensity.yaml` |
| 技能身份与路由 | `docs/agents/yss-skill-registry.yaml`（`status: active`；由 Harness 编排器消费）；来源与投影见 `skills-lock.json` |
| 数字人角色与会签 | `docs/agents/digital-human-roles.yaml` |
| 实现仓登记与边界 | `docs/process/implementation-repo-integration.md` |

README、用户指南和 `CLAUDE.md` 只解释或指向上述事实，不定义第二套规则。

## 3. 语言与 Context Contract

- 业务、产品、架构、实现、审查和验证文档正文使用简体中文；代码标识、API、schema、命令、文件名和协议 metadata 保持原样。
- 创建或修改稳定资产前必须读取并持续消费根 `CONTEXT.md`；无法读取时返回 `blocked`。
- 稳定术语先在根 `CONTEXT.md` 登记 PascalCase 英文标识，再进入契约、Ticket、代码或证据。每仓仅允许一个根 `CONTEXT.md`；术语引用使用 `<ContextId>/<EnglishIdentifier>`，真正共享的术语使用 `Global/<EnglishIdentifier>`。
- `project-instance` 每个工作单元流转或申请批准前完成 `context_reconciliation`：先回写稳定术语，再核对 `document_digest` 与 `referenced_terms_digest`；缺失、冲突或漂移即 `blocked`。模板源只校验该合同并记录有理由的 `not-applicable`。
- 当前流程使用 `harness-entry`、`tactical-design`、`slice-contract`、`slice-implementation`、`verification`；退役入口以 `docs/agents/skill-migrations.md` 为准，不参与当前路由。

## 4. `template-source` 维护

- 创建、修改或退役 skill 时使用 `maintaining-skills`；维护强度和证据以裁剪文档为准，日常停在 `implementation-ready`，发布前执行完整门禁。
- `.agents/skills` 是共享技能权威内容；`.claude/skills`、`.codex/skills`、`.cursor/skills`、`.pi/skills`、`.qoder/skills`、`.trae/skills` 是生成投影，不得分别手改。
- 依次使用 `scripts/verify-template-fast`、显式候选时的 `scripts/verify-template-candidate` 和发布前不可裁剪的 `scripts/verify-template`。未完成 `create-yss-harness-dev` 快照同步及生成实例验证，不得宣称可发布。

## 5. `project-instance` 开发落地路由

先读 `docs/process/harness-profile.yaml`，再按影响面裁剪。本仓只执行以下主链，终点为 `work-unit.verification`：

`work-unit.harness-entry` → `work-unit.tactical-design` → `work-unit.slice-contract` → `work-unit.slice-implementation` → `work-unit.verification`

- 默认输入是已批准 Spec 或 Strategic Design Handoff；Discovery 不是默认阶段。`grill-with-docs`、`to-spec`、`to-tickets` 只能作为用户显式兼容入口，并回交 `harness-orchestrator` 验收。
- 存在领域行为、聚合、不变量、状态、一致性、Domain Event、Gateway 或持久化映射影响时，由 `role.architecture-agent` 使用 `yss-tactical-design` 形成当前 Tactical Design Contract；无领域影响记录有理由的 `not-applicable`。
- API 影响先形成 OpenAPI 3.1 Draft，经必要审查后 Freeze；无 API 影响必须有当前记录。随后正式化为可独立验证的窄垂直切片，不得按技术层横向拆分。
- 架构、前端、后端和测试只在同一个当前 Slice Implementation Contract 下工作。命中的条件门禁必须完成；未命中才可记录 `not-applicable`，不生成空文档。
- `seam-deferred` 必须记录风险、责任人、后续 Ticket、验证计划和目标版本或日期。

## 6. Ticket 与状态

- 功能父 Ticket 汇总批准资产、阻塞项和证据；Spec、Draft 和待冻结资产使用 `ready-for-human`。
- 只有合同已批准且当前、必要门禁通过、阻塞清除并可直接实现的窄垂直切片，才能设为 `ready-for-agent`。
- Tracker 按 `docs/agents/issue-tracker.md` 选择，不得从 Git remote 推断；平台不可用时生成待发布草案。

## 7. 实现硬门禁

- 实现前读取 `docs/process/implementation-repo-integration.md`，登记目标仓、项目根、分支、CI、验证命令和回滚点；再由 `yss-implementation-contract-compiler` 编译最小技能集与合同草案。编译器不批准合同、不设置状态、不宣布完成。
- 无可复用后端工程时，`harness-orchestrator` 根据当前 Tactical Design 给出 `domain-driven` / `layered-mvc` 推荐并由用户逐项目确认；确认后分别使用 `yss-ddd-scaffold-generator` / `yss-layered-mvc-scaffold-generator`。前端使用 `yss-frontend-scaffold-generator`。
- 脚手架仅在 `scaffold_status=required`、`scaffold-architecture-decisions.yaml` 已确认且批准、schema v3 生成合同已持久化后运行；生成器无交互、无回退，只产机械骨架。既有工程不覆盖，DDD / MVC 转换另立迁移工作单元；业务行为回到合同编译器并使用 `behavior-tdd`。
- UI 影响切片在 `ready-for-agent` 前必须有通过校验的 `frontend_implementation_plan`，实现后补齐 `frontend_implementation_verification`，包含截图 / 视觉、状态与交互、console warning 和真实命令退出码证据。
- 前端测试、type-check、构建优先 `pnpm`；后端优先项目根 `./mvnw`。缺失时记录受控例外和实际命令。
- 路径越界、证据缺失、未验证、`drift`、`violation` 或 `new_impacts` 时停止实现并重新路由。

## 8. 专项入口

- 技术事实、标准或第三方行为影响决策时使用 `research`；竞品、市场或用户口碑事实使用 `competitive-intelligence`。
- 原型和设计使用 `yss-design-system` → `yss-prototype-stage`；当前兼容路线用 `yss-antd-design` 记录版本事实。生产前端改用 `yss-ui`，原型阶段不得调用 `yss-ui`。
- Bug、测试失败或性能回退先用 `diagnosing-bugs` 建立复现，再使用 `tdd`；业务行为默认按 `behavior-tdd` 逐切片实现，不适用时记录理由和可执行验证。
- 四个专业 Agent 不另起生命周期、不批准自己起草的合同，也不替实现者完成独立验证；协同边界见 `docs/agents/digital-human-roles.yaml`。

## 9. 工作区与实现仓边界

运行时代码优先位于已登记的 `external-repository`。只有用户明确选择当前仓承载代码时，才使用 `apps/backend/<project>/`、`apps/frontend/<project>/`（`harness-apps`）或登记的 `git-submodule`。

`app/backend/`、`app/frontend/` 及其子路径禁止作为输出；submodule 不得登记成 `harness-apps` 或复制源码冒充挂载。空 gitlink、detached HEAD 和 `--force` 覆盖不得当普通目录。

## 10. 审查、验证与 Git

- 实现者不承担命中的独立审查。任何完成、可合并结论必须基于本轮 fresh verification。
- 会签按 `docs/agents/digital-human-roles.yaml` 关闭并由 `scripts/verify-approval-record` 校验；高风险架构、OpenAPI Freeze、合并、商务承诺和运行时外部副作用仍须生物人。
- 在暂停、handoff、进入实现和验证边界同步范围、证据、风险、会签点、Ticket 状态和下一步。
- Git checkpoint 只含本轮范围；获得用户授权后才提交或推送。返工或 IMPORTANT / CRITICAL finding 触发简体中文复盘并修订权威资产。

## 11. Subagent 协同

使用 subagent 前读取 `docs/process/subagent-collaboration.md`，定义任务包、数字人角色、运行时、执行态和不重叠写入范围；共享工作区不是沙箱。实现者不得兼任独立 Reviewer，仓库身份、Ticket 状态、Git checkpoint、Slice 合同批准和完成结论仍由 `harness-orchestrator` 裁决。

## 12. 测试质量基线

推荐 Domain / Application `>= 90%`、API `>= 80%`、前端组件 `>= 75%`、已定义关键流程 `100% E2E`；只有项目测试策略明确采纳后才成为 CI 门禁，未定义关键流程不得声称 100% E2E。
