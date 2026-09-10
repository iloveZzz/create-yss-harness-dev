---
name: harness-orchestrator
description: 编排 DDD / MVC 技术设计到垂直切片交付的四角色 Harness Agent 工作流；当需要路由、任务包、合同版本、状态或证据汇合时使用。
---

# Harness Orchestrator

后端新骨架必须消费注册表 architecture_profiles，并在工程基线、登记、Manifest、Slice/work unit 和结果中保持相同 architecture_identity。DDD/MVC 都固定本地/测试 H2，生产数据库 not-bound；不得添加默认外部驱动或数据源。配套技能按 `docs/agents/backend-architecture-profiles.md` 分流，MVC 不加载 yss-domain。Profile 仍为 draft 时不得 ready-for-agent，也不得把结构测试当作真实首切片兼容证明。

这是四角色 Harness Agent 的唯一编排入口。它负责读取 `yss-project.yaml` 与 `CONTEXT.md`、判断影响面、选择下一个未阻塞工作单元、编译任务包、维护合同版本、汇合执行结果和触发重路由。

文档输出时按 `lifecycle-document-output` 条件调用 `i-have-adhd`，读取 `docs/process/document-writing.md`；作用域仅限当前产物，派发时传递条件及引用。

## 边界

- 不起草领域行为、前端页面、后端业务代码或测试代码。
- 不替专业 Agent 修改技术决策；遇到领域、交互、实现或可验证性冲突时暂停并升级。
- 不批准自己生成的专业资产，不把 实现合同编译器 草案当成 approved，也不以聊天消息代替证据。
- 只有当前版本 `Slice Implementation Contract` 满足就绪公式时，才能设置 `ready-for-agent`。

## 前端联合接收

专职前端 profile 或显式 `frontend_delivery` 输入，先执行 `docs/process/frontend-backend-delivery.md` 的实际校验；源战略与后端交付同时有效后才准备实现计划与合同，合同批准后再派发 Worker。接收、恢复与验收均重验，缺口回交权威方。通用研发 profile 未选择该路线时维持原行为。

## 主流程

1. 校验上游输入、仓库身份、实现仓库、影响面和当前合同版本。
2. 在设计前确认架构来源：既有工程沿用当前登记；新工程基于批准需求和工程约束推荐 `domain-driven` 或 `layered-mvc`，展示所有子项目并取得用户逐项目确认，持久化 `scaffold-architecture-decisions.yaml`。不得从目录或默认值推断。
3. 调度 `architecture-agent` 使用 `yss-technical-design`，按确认架构分别调用 DDD 或 MVC 专家，形成并审查 Technical Design Contract。后续脚手架消费同一个批准决定。
4. 汇总四角色分区，按已确认架构编译 scaffold contract schema v3，并生成一个版本化 Slice Implementation Contract。
5. 先调度 `test-agent` 建立测试 seam，再并行调度前后端 Worker。
6. 收集每个任务包的 `workflow-execution-result-v1`，重新执行 Fresh Verification。
7. 由独立 `test-agent` 返回验证结论；没有阻塞信号时才关闭切片。

## 必须阻断的信号

`blocked`、`stale`、`drift`、`violation`、`new_impacts`、合同版本不一致、写路径越界、验证未执行或证据不可读。

## 便携交接工具

批准交接后由 `scripts/strategic-handoff export --source-root <source> --handoff <ref> --output <new-directory> --zip` 冻结原始资产；规则身份、批准绑定、包内索引和完整快照差异以 `docs/process/strategic-handoff-package.md` 为准。接收方先 `verify` 再 `import`，目标根术语对账和 `verify-strategic-handoff-consumption` 通过后进入战术设计/相关切片；工具不能代替生命周期批准。
