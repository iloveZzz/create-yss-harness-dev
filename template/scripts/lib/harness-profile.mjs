import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parseDocument } from "../vendor/yaml.mjs";
import { loadDigitalHumanRoles } from "./digital-human-roles.mjs";
import { loadRegistry, ROOT } from "./lifecycle-registry.mjs";
import { isTemplateSource } from "./repository-mode.mjs";

export const DEFAULT_PROFILE = path.join(ROOT, "docs/process/harness-profile.yaml");
export const DEV_AGENT_PROFILE_ID = "harness.dev-agent-slice";
export const TARGET_ROLES = [
  "role.architecture-agent",
  "role.frontend-agent",
  "role.backend-agent",
  "role.test-agent",
];
export const CONTROL_ROLES = ["role.harness-orchestrator"];
export const ALLOWED_WORK_UNITS = [
  "work-unit.harness-entry",
  "work-unit.tactical-design",
  "work-unit.slice-contract",
  "work-unit.slice-implementation",
  "work-unit.verification",
];
export const FORBIDDEN_WORK_UNITS = [
  "work-unit.ssot-update",
  "work-unit.skill-projection-sync",
  "work-unit.intensity-aware-verification",
  "work-unit.intensity-aware-review",
  "work-unit.release-and-rollback",
];
export const INSTANTIATION = Object.freeze({
  cli_package: "create-yss-harness-dev",
  npm_create: "yss-harness-dev",
  metadata_file: ".yss-harness-dev.json",
  foreign_metadata_files: [".yss-template.json"],
  template_source: "github:iloveZzz/yss-harness-dev-agent",
  distribution_manifest: ".template-source/distribution/template.manifest.json",
  pin_env: "YSS_HARNESS_TEMPLATE_REF",
});

function fail(message) {
  throw new TypeError(message);
}

function parseYaml(filePath, label) {
  let source;
  try {
    source = readFileSync(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") fail(`缺少${label}: ${filePath}`);
    throw error;
  }
  const document = parseDocument(source, { maxAliasCount: 0, uniqueKeys: true });
  if (document.errors.length > 0) fail(`无法解析${label}: ${document.errors[0].message}`);
  const value = document.toJS({ maxAliasCount: 0 });
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label}必须是对象`);
  return value;
}

function equalArray(actual, expected) {
  return Array.isArray(actual)
    && actual.length === expected.length
    && actual.every((value, index) => value === expected[index]);
}

function requireString(value, field) {
  if (typeof value !== "string" || !value.trim()) fail(`${field} 不能为空`);
}

export function loadHarnessProfile(filePath = DEFAULT_PROFILE) {
  return parseYaml(filePath, "Harness profile");
}

export function validateHarnessProfile(profile = loadHarnessProfile(), {
  lifecycle = loadRegistry(),
  roles = loadDigitalHumanRoles(),
} = {}) {
  if (profile.schema_version !== 1) fail("Harness profile schema_version 必须为 1");
  if (profile.profile_id !== DEV_AGENT_PROFILE_ID) fail(`只支持 ${DEV_AGENT_PROFILE_ID}`);
  if (profile.status !== "active") fail("Harness profile status 必须为 active");
  requireString(profile.name, "profile.name");
  requireString(profile.purpose, "profile.purpose");

  const roleIds = new Set([roles.orchestrator?.id, ...(roles.roles || []).map((role) => role.id)]);
  for (const [field, values] of [["target_user_roles", TARGET_ROLES], ["control_plane_roles", CONTROL_ROLES]]) {
    if (!equalArray(profile.audience?.[field], values)) fail(`audience.${field} 必须严格匹配开发落地四角色边界`);
    for (const role of values) {
      if (!roleIds.has(role)) fail(`audience.${field} 引用了未知角色: ${role}`);
    }
  }
  if (new Set(profile.audience.target_user_roles).size !== profile.audience.target_user_roles.length) {
    fail("target_user_roles 不得重复");
  }
  requireString(profile.audience.non_target_role_policy, "audience.non_target_role_policy");
  requireString(profile.audience.boundary, "audience.boundary");

  const stageIds = new Set((lifecycle.stages || []).map((stage) => stage.id));
  const workUnitIds = new Set((lifecycle.work_units || []).map((unit) => unit.id));
  if (!equalArray(profile.lifecycle?.allowed_work_units, ALLOWED_WORK_UNITS)) {
    fail("lifecycle.allowed_work_units 必须是五阶段开发落地工作单元");
  }
  if (!equalArray(profile.lifecycle?.forbidden_work_units, FORBIDDEN_WORK_UNITS)) {
    fail("lifecycle.forbidden_work_units 必须是 template-source 维护工作单元");
  }
  if (!equalArray(profile.lifecycle?.repository_modes, ["project-instance"])) {
    fail("profile 只适用于 project-instance");
  }
  if (profile.lifecycle.entry_work_unit !== "work-unit.harness-entry") {
    fail("lifecycle.entry_work_unit 必须为 work-unit.harness-entry");
  }
  if (profile.lifecycle.terminal_work_unit !== "work-unit.verification") {
    fail("lifecycle.terminal_work_unit 必须为 work-unit.verification");
  }
  if (profile.lifecycle.terminal_stage !== "stage.verification") {
    fail("lifecycle.terminal_stage 必须为 stage.verification");
  }
  for (const id of [
    profile.lifecycle.entry_work_unit,
    profile.lifecycle.terminal_work_unit,
    ...profile.lifecycle.allowed_work_units,
    ...profile.lifecycle.forbidden_work_units,
  ]) {
    if (!workUnitIds.has(id)) fail(`lifecycle 引用了未知工作单元: ${id}`);
  }
  if (!stageIds.has(profile.lifecycle.terminal_stage)) {
    fail(`lifecycle.terminal_stage 引用了未知阶段: ${profile.lifecycle.terminal_stage}`);
  }
  if (profile.lifecycle.allowed_work_units.some((id) => profile.lifecycle.forbidden_work_units.includes(id))) {
    fail("allowed_work_units 与 forbidden_work_units 不得重叠");
  }

  if (profile.upstream?.kind !== "approved-spec-or-strategic-design") {
    fail("upstream.kind 必须为 approved-spec-or-strategic-design");
  }
  if (profile.upstream?.discovery_is_default !== false) {
    fail("upstream.discovery_is_default 必须为 false");
  }
  if (profile.upstream?.default_entry !== "work-unit.harness-entry") {
    fail("upstream.default_entry 必须为 work-unit.harness-entry");
  }

  const instantiation = profile.instantiation || {};
  for (const [field, expected] of Object.entries(INSTANTIATION)) {
    if (Array.isArray(expected)) {
      if (!equalArray(instantiation[field], expected)) fail(`instantiation.${field} 必须为 ${JSON.stringify(expected)}`);
    } else if (instantiation[field] !== expected) {
      fail(`instantiation.${field} 必须为 ${expected}`);
    }
  }
  if (isTemplateSource(ROOT)) {
    const manifestPath = path.resolve(ROOT, instantiation.distribution_manifest);
    if (!existsSync(manifestPath)) {
      fail(`instantiation.distribution_manifest 不可读: ${instantiation.distribution_manifest}`);
    }
  }

  return {
    profile_id: profile.profile_id,
    target_user_roles: [...profile.audience.target_user_roles],
    terminal_work_unit: profile.lifecycle.terminal_work_unit,
    cli_package: instantiation.cli_package,
  };
}

export const harnessProfileContract = Object.freeze({
  profile_id: DEV_AGENT_PROFILE_ID,
  target_user_roles: TARGET_ROLES,
  control_plane_roles: CONTROL_ROLES,
  allowed_work_units: ALLOWED_WORK_UNITS,
  forbidden_work_units: FORBIDDEN_WORK_UNITS,
  instantiation: INSTANTIATION,
});
