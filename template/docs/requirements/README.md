# 需求定义 (Requirements) — 从想法到可执行定义

> 当前分支默认链路是 Harness Agent 五阶段。本目录保存 Spec、用户故事和垂直切片资产；Discovery 结论作为 Harness Entry 的上游输入，而不是本仓默认主阶段。

---

## 当前默认链路

```text
harness-entry
  → tactical-design
  → slice-contract
  → slice-implementation
  → verification
```

领域影响由 `architecture-agent` 使用 `yss-tactical-design`。`grill-with-docs`、`to-spec`、`to-tickets` 只作为用户显式兼容入口，不能代替 `harness-orchestrator`。

进入开发前必须满足：

- [ ] Spec 使用 [../templates/spec-template.md](../templates/spec-template.md)。
- [ ] OpenAPI 影响明确为“无”或已产出契约草案 / review-only Draft；进入开发前必须冻结 `docs/.scratch/<feature>/api/<feature>.yaml`。
- [ ] 测试决策明确主要测试 seam。
- [ ] AI / 人工审查点标注风险 / 人工确认项。
- [ ] 后续 Ticket 使用 [../templates/vertical-slice-ticket-template.md](../templates/vertical-slice-ticket-template.md)，不得按层横向拆分。

Local Markdown 默认将完整功能包保存到 `docs/.scratch/<feature>/`；功能父 Ticket 使用 [../templates/local-parent-ticket-template.md](../templates/local-parent-ticket-template.md)。GitHub / GitLab 只有在项目明确选择时才作为主 tracker。

## AI 三步法

### Step 1: 生成 Spec 初稿

```python
delegate_task(
    goal="根据发现报告生成 Spec 初稿",
    context="""
    输入：发现报告 (市场+竞品+用户)
    输出：背景/用户画像/场景/功能需求/NFR/验收条件/边界/技术影响
    """
)
```

### Step 2: 补充边界场景

```python
delegate_task(
    goal="对 Spec 做边界场景挖掘",
    context="""
    从以下角度挖掘遗漏场景：
    空值/并发/权限/网络异常/数据量极端/时间相关/国际化
    """
)
```

### Step 3: 拆解用户故事

```python
delegate_task(
    goal="将 Spec 拆解为可估算的用户故事",
    context="""
    格式: As a / I want / So that
    附带 Gherkin 验收条件 + 优先级(P0/P1/P2) + AI风险标注
    """
)
```

---

## Spec 模板结构

1. 问题陈述 / 解决方案
2. 用户故事
3. 功能需求 / 非功能需求
4. 验收标准
5. OpenAPI 影响
6. 测试决策
7. AI / 人工审查点
8. 非目标范围
9. 风险

---

## AI-Human Loop

```
批准的上游 Spec / 战略设计
→ harness-entry
→ architecture-agent + yss-tactical-design（无领域影响则 not-applicable）
→ slice-contract
→ 前端 / 后端 / 测试按同一合同实现
→ test-agent Fresh Verification
```
