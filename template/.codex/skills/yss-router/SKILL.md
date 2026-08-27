---
name: yss-router
description: 将已批准的 DDD 战术设计、冻结契约和实现仓库上下文编译为 Slice Implementation Contract 草案；当垂直切片进入实现或需要重路由时使用。
---

# YSS Router

yss-router 是实现合同编译器，不是生命周期主控。它消费已批准且版本当前的输入，输出 draft、blocked 或 ready-for-lifecycle-review 的合同草案，由 harness-orchestrator 批准和设置 ready-for-agent。

## 输入

必须读取 yss-project.yaml、CONTEXT.md、Spec / 战略设计、Tactical Design Contract、API / 数据 / UI 影响、实现仓库登记、允许写路径和验证命令。输入缺失、未批准或过期时返回 blocked。

## 编译结果

合同必须绑定一个 slice-implementation-contract-v1，包含 architecture、frontend、backend、testing 四个分区，并为前端、后端、测试任务包复制同一 contract_id / contract_version。

Router 必须计算：

- domain_behavior、aggregate、invariant、state、consistency、event、Gateway 和 persistence mapping 影响。
- API Freeze 或无 API 影响记录。
- 数据架构或无数据影响记录。
- UI 交互、状态和原型输入或无 UI 影响记录。
- 实现仓库、分支、项目根、CI、验证命令、回滚点和允许写路径。
- 主技能、专项技能依赖闭包、TDD 模式、预期证据和完整重路由触发器。

## 硬规则

- Router 不得输出 approved、ready-for-agent 或 completed。
- 领域影响缺少批准且版本当前的 Tactical Design Contract 时，不得路由 Domain 实现。
- API、状态、数据模型、写路径、测试 seam 或验证命令变化时，必须返回 new_impacts / drift 并完整重路由。
- 前端和后端任务必须使用同一合同版本；版本不一致立即 blocked。
- 业务行为使用 behavior-tdd；只有机械内容允许使用受控生成合同。
- 任务包写入范围、证据和命令必须能被独立验证，不能用自然语言说明替代结构化字段。
