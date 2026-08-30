import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./lifecycle-registry.mjs";
import { INSTANTIATION } from "./harness-profile.mjs";
import { isTemplateSource } from "./repository-mode.mjs";

export const DISTRIBUTION_MANIFEST = path.join(ROOT, INSTANTIATION.distribution_manifest);
export const HARNESS_CONTRACT = path.join(
  ROOT,
  ".template-source/contracts/create-yss-harness-dev-repository-mode-contract.md",
);
export const LEGACY_SPEC_CONTRACT = path.join(
  ROOT,
  ".template-source/contracts/create-yss-spec-repository-mode-contract.md",
);

const REQUIRED_ALLOW_ROOT_ENTRIES = [
  ".agents",
  ".claude",
  ".codex",
  ".cursor",
  ".hermes",
  ".pi",
  ".qoder",
  ".trae",
  "docs",
  "scripts",
];
const REQUIRED_ALLOW_ROOT_FILES = [
  ".cursorrules",
  ".gitignore",
  ".nvmrc",
  "AGENTS.md",
  "CLAUDE.md",
  "CONTEXT.md",
  "README.md",
  "skills-lock.json",
  "yss-project.yaml",
  "yss-public-skills.json",
];
const REQUIRED_ALLOW_FILES = ["docs/adr/README.md"];
const REQUIRED_EXCLUDE_ROOT_ENTRIES = [
  ".git",
  ".codegraph",
  ".template-source",
  ".github",
  "wiki",
];
const REQUIRED_EXCLUDE_ROOT_FILES = [
  "package.json",
  "package-lock.json",
  ".gitmodules",
  "template.manifest.json",
  "template.snapshot.json",
];
const REQUIRED_EXCLUDE_PATHS = [
  ".cursor/environment.json",
  "docs/.scratch",
  "docs/reviews",
  "docs/adr",
];
const REQUIRED_RENDER_PATHS = ["README.md", "yss-project.yaml"];

function fail(message) {
  throw new TypeError(message);
}

function read(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  try {
    return readFileSync(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") fail(`缺少实例化入口文件: ${relativePath}`);
    throw error;
  }
}

function requireStringArray(value, field) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item)) {
    fail(`${field} 必须是非空字符串数组`);
  }
}

function requireIncludes(actual, required, field) {
  requireStringArray(actual, field);
  for (const item of required) {
    if (!actual.includes(item)) fail(`${field} 缺少 ${item}`);
  }
}

export function loadDistributionManifest(filePath = DISTRIBUTION_MANIFEST) {
  if (!existsSync(filePath)) fail(`缺少分发清单: ${path.relative(ROOT, filePath)}`);
  let value;
  try {
    value = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`无法解析分发清单: ${error.message}`);
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) fail("分发清单必须是 JSON 对象");
  return value;
}

export function validateDistributionManifest(manifest = loadDistributionManifest()) {
  requireIncludes(manifest.allowRootEntries, REQUIRED_ALLOW_ROOT_ENTRIES, "allowRootEntries");
  requireIncludes(manifest.allowRootFiles, REQUIRED_ALLOW_ROOT_FILES, "allowRootFiles");
  requireIncludes(manifest.allowFiles, REQUIRED_ALLOW_FILES, "allowFiles");
  requireIncludes(manifest.excludeRootEntries, REQUIRED_EXCLUDE_ROOT_ENTRIES, "excludeRootEntries");
  requireIncludes(manifest.excludeRootFiles, REQUIRED_EXCLUDE_ROOT_FILES, "excludeRootFiles");
  requireIncludes(manifest.excludePaths, REQUIRED_EXCLUDE_PATHS, "excludePaths");
  requireIncludes(manifest.renderPaths, REQUIRED_RENDER_PATHS, "renderPaths");
  requireStringArray(manifest.exampleDocPaths || [], "exampleDocPaths");
  requireStringArray(manifest.initExcludeRootEntries || [], "initExcludeRootEntries");
  requireStringArray(manifest.initExcludeRootFiles || [], "initExcludeRootFiles");
  requireStringArray(manifest.initExcludePaths || [], "initExcludePaths");
  if (!(manifest.initExcludeRootFiles || []).includes("yss-public-skills.json")) {
    fail("initExcludeRootFiles 必须排除 yss-public-skills.json");
  }
  if ((manifest.allowRootEntries || []).includes(".template-source")) {
    fail("allowRootEntries 不得包含 .template-source");
  }
  if ((manifest.allowRootFiles || []).includes("package.json")) {
    fail("allowRootFiles 不得包含根 package.json");
  }
  return {
    allowRootEntries: [...manifest.allowRootEntries],
    excludeRootEntries: [...manifest.excludeRootEntries],
    renderPaths: [...manifest.renderPaths],
  };
}

export function validateInstantiationPointers(documents = {}) {
  const agents = documents.agents ?? read("AGENTS.md");
  const readme = documents.readme ?? read("README.md");
  const guide = documents.guide ?? read("docs/user-guide/外部命令行工具实践指南.md");
  const index = documents.index ?? read("docs/user-guide/用户手册索引.md");
  const migration = documents.migration ?? read("docs/user-guide/规格与任务迁移指南.md");
  const implementation = read("docs/process/implementation-repo-integration.md");
  const context = read("CONTEXT.md");

  if (!agents.includes("`create-yss-harness-dev`")) {
    fail("AGENTS.md 必须把 create-yss-harness-dev 作为模板发布跨仓库伴侣");
  }
  if (agents.includes("模板与外部 `create-yss-spec` 的跨仓库契约")) {
    fail("AGENTS.md 不得再把 create-yss-spec 当成本仓发布伴侣");
  }
  if (!readme.includes("npm create yss-harness-dev")) {
    fail("README.md 必须提供 npm create yss-harness-dev 入口");
  }
  if (readme.includes("npm create yss-spec@latest")) {
    fail("README.md 不得再推荐 npm create yss-spec@latest");
  }
  if (!guide.includes("# `create-yss-harness-dev`")) {
    fail("外部命令行工具实践指南必须面向 create-yss-harness-dev");
  }
  if (guide.includes("npx create-yss-spec@latest")) {
    fail("外部命令行工具实践指南不得把 create-yss-spec 作为本 Harness 的可执行入口");
  }
  if (!index.includes("create-yss-harness-dev")) {
    fail("用户手册索引必须指向 create-yss-harness-dev");
  }
  if (!migration.includes("create-yss-harness-dev")) {
    fail("规格与任务迁移指南必须由 create-yss-harness-dev 执行身份改写");
  }
  if (!implementation.includes("YSS_HARNESS_TEMPLATE_REF")) {
    fail("实现仓库接入文档必须使用 YSS_HARNESS_TEMPLATE_REF");
  }
  if (!implementation.includes(".yss-harness-dev.json")) {
    fail("实现仓库接入文档必须声明 .yss-harness-dev.json");
  }
  if (!context.includes("create-yss-harness-dev")) {
    fail("CONTEXT.md 必须登记开发落地 Harness CLI");
  }
  if (isTemplateSource(ROOT)) {
    if (!existsSync(HARNESS_CONTRACT)) {
      fail("缺少 create-yss-harness-dev 跨仓库契约");
    }
    const contract = readFileSync(HARNESS_CONTRACT, "utf8");
    if (!contract.includes(INSTANTIATION.metadata_file) || !contract.includes(INSTANTIATION.cli_package)) {
      fail("create-yss-harness-dev 契约必须声明 metadata 与 CLI 包名");
    }
    if (existsSync(LEGACY_SPEC_CONTRACT)) {
      const legacy = readFileSync(LEGACY_SPEC_CONTRACT, "utf8");
      if (!/已退役|错误绑定|不再作为本仓发布门禁/.test(legacy)) {
        fail("create-yss-spec 契约必须标记为不再作为本仓发布门禁");
      }
    }
  }
  return { cli_package: INSTANTIATION.cli_package, metadata_file: INSTANTIATION.metadata_file };
}

export function validateInstanceDistribution({
  checkManifest = isTemplateSource(ROOT),
} = {}) {
  const pointers = validateInstantiationPointers();
  if (!checkManifest) return { ...pointers, manifest: null };
  const manifest = validateDistributionManifest();
  return { ...pointers, manifest };
}
