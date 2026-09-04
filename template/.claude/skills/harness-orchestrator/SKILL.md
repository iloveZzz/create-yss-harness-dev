---
name: harness-orchestrator
description: 编排 DDD 战术设计到垂直切片交付的四角色 Harness Agent 工作流；当需要路由、任务包、合同版本、状态或证据汇合时使用。
---

# Harness Orchestrator

这是四角色 Harness Agent 的唯一编排入口。它负责读取 `yss-project.yaml` 与 `CONTEXT.md`、判断影响面、选择下一个未阻塞工作单元、编译任务包、维护合同版本、汇合执行结果和触发重路由。

## 边界

- 不起草领域行为、前端页面、后端业务代码或测试代码。
- 不替专业 Agent 修改技术决策；遇到领域、交互、实现或可验证性冲突时暂停并升级。
- 不批准自己生成的专业资产，不把 实现合同编译器 草案当成 approved，也不以聊天消息代替证据。
- 只有当前版本 `Slice Implementation Contract` 满足就绪公式时，才能设置 `ready-for-agent`。

## 主流程

1. 校验上游输入、仓库身份、实现仓库、影响面和当前合同版本。
2. 调度 `architecture-agent` 完成 Tactical Design Contract。
3. 汇总四角色分区，生成一个版本化 Slice Implementation Contract。
4. 先调度 `test-agent` 建立测试 seam，再并行调度前后端 Worker。
5. 收集每个任务包的 `workflow-execution-result-v1`，重新执行 Fresh Verification。
6. 由独立 `test-agent` 返回验证结论；没有阻塞信号时才关闭切片。

## 必须阻断的信号

`blocked`、`stale`、`drift`、`violation`、`new_impacts`、合同版本不一致、写路径越界、验证未执行或证据不可读。
