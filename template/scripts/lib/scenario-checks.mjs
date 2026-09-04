import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { parseDocument } from "../vendor/yaml.mjs";
import { lifecycleTransitionContract, validateNextRoute, validateSliceContractReadiness } from "./lifecycle-transition.mjs";
import { loadDigitalHumanRoles, validateDefaultDigitalHumanRoles } from "./digital-human-roles.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (relative) => readFileSync(path.join(root, relative), "utf8");
function ensure(condition, message) { if (!condition) throw new TypeError(message); }
function exists(relative) { return existsSync(path.join(root, relative)); }
function parse(relative) { return parseDocument(read(relative), { uniqueKeys: true }).toJS({ maxAliasCount: 0 }); }

const newRoles = ["role.architecture-agent", "role.frontend-agent", "role.backend-agent", "role.test-agent"];

function verifyHarnessContract() {
  const contract = parse(".agents/skills/harness-orchestrator/references/orchestration-contract.yaml");
  ensure(contract.contract_id === "harness-agent-contract-v1", "Harness Agent contract id 漂移");
  ensure(JSON.stringify(contract.roles) === JSON.stringify(newRoles), "Harness Agent 角色集合不是四角色");
  ensure(contract.orchestrator === "role.harness-orchestrator", "Harness Orchestrator 未登记");
  ensure(JSON.stringify(contract.execution_states) === JSON.stringify(["Explorer", "Drafter", "Worker", "Reviewer", "Verifier"]), "执行态集合不完整");
  ensure(JSON.stringify(contract.slice_contract?.required_sections) === JSON.stringify(["architecture", "frontend", "backend", "testing"]), "Slice Contract 四角色分区不完整");
  ensure(contract.parallelism?.test_seam_before_implementation === true && contract.parallelism?.frontend_backend_parallel_after_contract === true, "并行执行策略缺失");
}

function verifyReplacementBoundary() {
  const roles = loadDigitalHumanRoles();
  validateDefaultDigitalHumanRoles();
  ensure(JSON.stringify(roles.roles.map((role) => role.id)) === JSON.stringify(newRoles), "旧角色仍然进入默认角色集合");
  const serialized = read("docs/agents/digital-human-roles.yaml");
  for (const legacy of ["requirements-manager", "product-manager", "business", "project-manager", "frontend-engineer", "backend-engineer", "test-engineer"]) {
    ensure(!serialized.includes("role." + legacy), "旧角色残留: " + legacy);
  }
  const migrations = read("docs/agents/skill-migrations.md");
  for (const retired of ["yss-product-lifecycle", "yss-stage-decision"]) {
    ensure(!exists(`.agents/skills/${retired}`), `旧入口不得保留物理目录: ${retired}`);
    ensure(migrations.includes(`## ${retired}`) && migrations.includes("harness-orchestrator"), `旧入口缺少迁移说明: ${retired}`);
  }
  const publicSkills = JSON.parse(read("yss-public-skills.json"));
  ensure(!publicSkills.skills.includes("yss-product-lifecycle"), "公开清单不得再导出旧生命周期入口");
  ensure(!publicSkills.skills.includes("yss-stage-decision"), "公开清单不得再导出旧阶段决策入口");
}

const profiles = {
  lifecycle: {
    message: "harness-agent 生命周期压力场景验证通过",
    files: [".agents/skills/harness-orchestrator/SKILL.md", ".agents/skills/harness-orchestrator/references/orchestration-contract.yaml", "docs/process/lifecycle-registry.yaml"],
    markers: [[".agents/skills/harness-orchestrator/SKILL.md", "Fresh Verification"], [".agents/skills/harness-orchestrator/references/orchestration-contract.yaml", "ready_for_agent"]]
  },
  matt: {
    message: "harness-agent 替换边界压力场景验证通过",
    files: ["docs/agents/digital-human-roles.yaml", "docs/process/lifecycle-registry.yaml", "docs/agents/skill-migrations.md", ".agents/skills/harness-orchestrator/SKILL.md"],
    markers: [["docs/agents/digital-human-roles.yaml", "role.architecture-agent"], ["docs/process/lifecycle-registry.yaml", "stage.tactical-design"], ["docs/agents/skill-migrations.md", "yss-stage-decision"], [".agents/skills/harness-orchestrator/SKILL.md", "四角色"]]
  },
  prototype: {
    message: "DDD 战术设计到实现路由场景验证通过",
    files: [".agents/skills/yss-ddd-scaffold-generator/scripts/generate_scaffold.mjs", ".agents/skills/yss-implementation-contract-compiler/references/compiler-contract.yaml"],
    markers: [[".agents/skills/yss-implementation-contract-compiler/references/compiler-contract.yaml", "slice_contract_required"], [".agents/skills/yss-implementation-contract-compiler/references/compiler-contract.yaml", "architecture"]]
  },
  implementationContractCompiler: {
    message: "YSS implementation contract compiler harness-agent 场景验证通过",
    files: [".agents/skills/yss-implementation-contract-compiler/references/compiler-contract.yaml", ".agents/skills/yss-implementation-contract-compiler/SKILL.md"],
    markers: [[".agents/skills/yss-implementation-contract-compiler/references/compiler-contract.yaml", "impact_to_capabilities"], [".agents/skills/yss-implementation-contract-compiler/SKILL.md", "required_capabilities"]]
  },
  openapiYaml: {
    message: "OpenAPI YAML-first 场景验证通过",
    files: ["docs/templates/openapi-spec-template.yaml", ".agents/skills/yss-openapi-governance/SKILL.md"],
    markers: [["docs/templates/openapi-spec-template.yaml", "openapi: 3.1.0"], [".agents/skills/yss-openapi-governance/SKILL.md", "YAML-first"]]
  },
  openapiJson: {
    message: "OpenAPI YAML-first JSON handoff scenarios passed",
    files: ["docs/api/templates/openapi-json-export-record-template.md", ".agents/skills/yss-api-integration/SKILL.md"],
    markers: [[".agents/skills/yss-api-integration/SKILL.md", "SHA-256"]]
  },
  yssDtoWire: {
    message: "YSS DTO OpenAPI wire-shape scenarios passed",
    files: [".agents/skills/yss-dto/references/openapi-wire-profile.yaml", ".agents/skills/yss-dto/SKILL.md", ".agents/skills/yss-openapi-governance/SKILL.md", ".agents/skills/yss-openapi-draft-review/SKILL.md", "docs/api/templates/openapi-draft-review-checklist.md", "scripts/verify-yss-dto-openapi-profile"],
    markers: [[".agents/skills/yss-dto/SKILL.md", "x-yss-response-wrapper"], [".agents/skills/yss-openapi-governance/SKILL.md", "verify-yss-dto-openapi-profile"], [".agents/skills/yss-openapi-draft-review/SKILL.md", "needTotalCount"], ["docs/api/templates/openapi-draft-review-checklist.md", "DTO wire shape"]]
  }
};

export function runScenario(name) {
  const profile = profiles[name];
  if (!profile) throw new TypeError("未知 Node 场景: " + name);
  for (const file of profile.files) ensure(exists(file), "缺少场景资产: " + file);
  for (const [file, marker] of profile.markers) ensure(read(file).includes(marker), "场景资产缺少标记 " + marker + ": " + file);
  if (name === "lifecycle") {
    verifyHarnessContract();
    const result = spawnSync("scripts/verify-lifecycle-registry", [], { cwd: root, encoding: "utf8" });
    ensure(result.status === 0, result.stderr || result.stdout);
    const registry = parse("docs/process/lifecycle-registry.yaml");
    ensure(registry.status === "active", "新生命周期必须为 active");
    ensure(JSON.stringify(registry.stages.map((stage) => stage.id)) === JSON.stringify(["stage.harness-entry", "stage.tactical-design", "stage.slice-contract", "stage.slice-implementation", "stage.verification"]), "生命周期阶段不是五阶段 Harness Agent 流程");
    ensure(lifecycleTransitionContract.next_routes["work-unit.slice-contract"].includes("work-unit.slice-implementation"), "Slice Contract 后未允许进入实现");
    ensure(validateNextRoute("work-unit.slice-implementation", "work-unit.verification").result === "allowed", "实现后未允许进入独立验证");
    const flags = ["upstream_inputs_current_and_approved", "tactical_design_current_or_not_applicable_recorded", "api_freeze_or_no_api_impact_recorded", "data_architecture_or_no_data_impact_recorded", "ui_inputs_or_no_ui_impact_recorded", "implementation_repositories_and_commands_registered", "allowed_write_paths_registered", "test_seams_and_acceptance_executable", "task_packages_share_contract_version"];
    const valid = { status: "approved", current_version: true, readiness: Object.fromEntries(flags.map((key) => [key, true])), architecture: {}, frontend: {}, backend: {}, testing: {} };
    ensure(validateSliceContractReadiness(valid).result === "allowed", "完整就绪公式未通过正向场景");
    const blocked = structuredClone(valid);
    blocked.readiness.task_packages_share_contract_version = false;
    ensure(validateSliceContractReadiness(blocked).result === "blocked", "合同版本不一致未阻断");
  }
  if (name === "matt") verifyReplacementBoundary();
  if (name === "implementationContractCompiler") verifyHarnessContract();
  if (name === "prototype") ensure(read(".agents/skills/yss-implementation-contract-compiler/references/compiler-contract.yaml").includes("behavior-tdd"), "行为切片未使用 behavior-tdd");
  if (name === "yssDtoWire") {
    const result = spawnSync("scripts/verify-yss-dto-openapi-profile", [], { cwd: root, encoding: "utf8" });
    ensure(result.status === 0, result.stderr || result.stdout);
  }
  process.stdout.write(profile.message + "\n");
}
