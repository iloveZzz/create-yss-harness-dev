# YSS Harness Agent 模板源

> 四角色、五阶段 Harness：`harness-entry` → `tactical-design` → `slice-contract` → `slice-implementation` → `verification`。

## 定位

本仓库是 Harness Agent 的 `template-source`。Agent 只读取**当前仓库根**的 `yss-project.yaml` 与 `AGENTS.md`，不要把父目录或其他 submodule 的入口文件当作本仓路由。本仓默认作为研发管理仓库，保留流程文档、契约模板、Agent skills 和协作约定。前端 / 后端源码默认位于独立实现仓库；只有用户明确选择本仓库承载实现代码时，才按需创建 `apps/backend/`、`apps/frontend/`。

README 只解释上述入口，不另定义阶段、门禁或技能分层。

## 项目结构

```text
├── .agents/                 ← 跨 Agent 共享 skills 的权威内容
├── .claude/                 ← Claude skills 投影与平台专属 skills
├── .codex/                  ← Codex skills 投影与平台专属 skills
├── .cursor/                 ← Cursor skills 投影
├── .hermes/                 ← Hermes skills 投影与平台专属 skills
├── .pi/                     ← Pi skills 投影与平台专属 skills
├── .qoder/                  ← Qoder skills 投影与平台专属 skills
├── .trae/                   ← Trae skills 投影与平台专属 skills
├── AGENTS.md                ← AI 指令
├── CONTEXT.md               ← 领域词汇表
├── yss-project.yaml         ← 仓库身份清单
├── docs/
│   ├── api/                 ← OpenAPI 3.1 契约
│   ├── adr/                 ← 架构决策记录
│   ├── requirements/        ← Spec / 用户故事 / 需求草案 / 垂直切片
│   ├── discovery/           ← 机会探索、市场、竞品和用户材料
│   ├── design/              ← 产品设计、原型、交互说明和状态矩阵
│   ├── architecture/        ← 架构设计与审查模板
│   ├── releases/            ← 发布说明
│   ├── implementation/      ← 实施方案、上线记录和回滚方案
│   ├── testing/             ← 测试策略和验证记录
│   ├── agents/              ← Agent 协作规范、Ticket/Triage/领域文档约定
│   ├── templates/           ← 通用文档模板
│   └── process/             ← 生命周期、裁剪、Scrum 和技能治理说明
└── scripts/                 ← 模板轻量校验脚本
```

项目需要生成度量、外部实现仓库记录或其他临时产物时再按需创建对应目录。前后端实现仓库接入规则见 `docs/process/implementation-repo-integration.md`。

## Quickstart

1. 先读取当前仓库根 `yss-project.yaml`，按 `repository_mode` 选择模板维护或产品研发生命周期。
2. 必读入口为 `AGENTS.md` 与 `CONTEXT.md`；流程事实以 `docs/process/lifecycle-registry.yaml` 和 `docs/process/harness-process-tailoring.md` 为准。
3. `template-source` 修改流程、技能或模板后，执行 `scripts/sync-skills`、`scripts/update-skill-lock` 和 `scripts/verify-template`。
4. `project-instance` 先做影响面分诊，再走 `harness-orchestrator`：`harness-entry` → `tactical-design` → `slice-contract` → `slice-implementation` → `verification`。领域影响由 `architecture-agent` 使用 `yss-tactical-design`。`grill-with-docs`、`to-spec`、`to-tickets` 只作为用户显式兼容入口。
5. 实现仓库接入、YSS 路由、独立审查、fresh verification 和 Git checkpoint 以 `AGENTS.md` 的硬门禁为准。

YSS skills 的公开发布投影维护在 [iloveZzz/yss-spec-dev-skills](https://github.com/iloveZzz/yss-spec-dev-skills)，发布清单和导出命令见 [skills 维护说明](./docs/agents/skills-maintenance.md)。

## 模板初始化 CLI

开发落地 Harness 的实例化入口是独立 GitHub 仓库 [iloveZzz/create-yss-harness](https://github.com/iloveZzz/create-yss-harness)。本仓库不包含 CLI 源码、测试或发布配置，只保留分发契约和面向实例使用者的实践指南：

- [create-yss-harness 外部 CLI 实践指南](./docs/user-guide/外部命令行工具实践指南.md)

推荐入口：

```bash
npm create yss-harness@latest
```

`create-yss-spec` 属于全产品生命周期模板，不能用来初始化或同步本仓。首次使用前请确认独立仓库和 npm 包已完成与本仓固定 commit 的跨仓库验证。

## 模板配置取舍

`.agents/skills` 是共享技能的权威内容；其他 Agent root 只保存同步投影和平台专属技能。共享技能只能在权威目录修改，随后运行：

```bash
scripts/sync-skills
scripts/update-skill-lock
```

Matt skills 固定来源：

```text
mattpocock/skills
main@6acc160e4e0cd062dbbbd7a1b26ae92855edf07e
```

主研发流程使用 `skills/engineering`；`skills-lock.json` 同时记录本次安装的关联 `productivity`、`in-progress`、`deprecated`、`misc` 和 `personal` skill 路径。

## 轻量校验

```bash
scripts/verify-template
```

该脚本检查：

- `yss-project.yaml`、权威流程资产和模板是否完整。
- 共享技能投影及 `skills-lock.json` 的完整树哈希是否一致。
- 过时技能、路径和规范用语是否已清理。
- 五类流程压力场景是否符合条件门禁和仓库身份路由。
- Markdown 相对链接是否指向现有文件。
- 示例 OpenAPI YAML 是否可解析。
- Git diff 是否存在空白错误。

## 关键文档

| 文档 | 内容 |
|------|------|
| [AGENTS.md](./AGENTS.md) | 全局 AI 指令 + 工程基线入口 + Agent 协作 |
| [docs/user-guide/用户手册索引.md](./docs/user-guide/用户手册索引.md) | 模板使用说明 |
| [docs/user-guide/产品生命周期工作流.md](./docs/user-guide/产品生命周期工作流.md) | Harness Agent 五阶段使用手册 |
| [docs/user-guide/图示生成器使用指南.md](./docs/user-guide/图示生成器使用指南.md) | Excalidraw 可视化辅助 skill 使用手册 |
| [docs/process/PDCA-SCRUM.md](./docs/process/PDCA-SCRUM.md) | PDCA × Scrum × AI |
| [docs/process/MATT-POCOCK-ENGINEERING-SKILLS.md](./docs/process/MATT-POCOCK-ENGINEERING-SKILLS.md) | Matt Pocock Engineering Skills 集成与使用 |
| [docs/process/lifecycle-registry.yaml](./docs/process/lifecycle-registry.yaml) | 生命周期结构事实源：主阶段、门禁、产物、工作单元、证据与稳定 ID |
| [docs/process/harness-process-tailoring.md](./docs/process/harness-process-tailoring.md) | 小改动 / 中等变更 / 新模块的流程裁剪指南 |
| [docs/process/harness-executive-blueprint.md](./docs/process/harness-executive-blueprint.md) | 面向业务方和管理者的 Harness 一页式蓝图 |
| [docs/process/implementation-repo-integration.md](./docs/process/implementation-repo-integration.md) | 外部前端 / 后端实现仓库接入与跨仓库切片绑定 |
| [docs/agents/README.md](./docs/agents/README.md) | Agent 协作文档目录说明 |
| [docs/agents/skills-maintenance.md](./docs/agents/skills-maintenance.md) | Agent skills 安装与维护 |
| [docs/user-guide/规格与任务迁移指南.md](./docs/user-guide/规格与任务迁移指南.md) | 旧规格与任务入口迁移指南 |
| [docs/discovery/IDEATION.md](./docs/discovery/IDEATION.md) | 机会构想方法 |
| [docs/architecture/README.md](./docs/architecture/README.md) | 架构设计 + 审查清单 |
| [docs/testing/README.md](./docs/testing/README.md) | 测试策略 |

## 核心模板

| 模板 | 用途 |
|------|------|
| [docs/templates/spec-template.md](./docs/templates/spec-template.md) | Spec，包含 OpenAPI 影响、测试决策、AI / 人工审查点 |
| [docs/templates/local-parent-ticket-template.md](./docs/templates/local-parent-ticket-template.md) | Local Markdown 功能父 Ticket 与生命周期索引 |
| [docs/templates/vertical-slice-ticket-template.md](./docs/templates/vertical-slice-ticket-template.md) | 垂直切片 Ticket |
| [docs/templates/agent-brief-template.md](./docs/templates/agent-brief-template.md) | `triage` 产出的 Agent Brief |
| [docs/templates/implementation-repo-registry-template.md](./docs/templates/implementation-repo-registry-template.md) | 外部实现仓库登记 |
| [docs/templates/cross-repo-slice-template.md](./docs/templates/cross-repo-slice-template.md) | 跨仓库垂直切片记录 |
| [docs/architecture/templates/architecture-deepening-template.md](./docs/architecture/templates/architecture-deepening-template.md) | 架构 deepening 候选与 seam 设计 |
