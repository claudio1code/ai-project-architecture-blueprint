import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  existsSync,
  linkSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(fileURLToPath(new URL("../", import.meta.url)));
const cliPath = path.join(repositoryRoot, "bin", "architecture-blueprint.mjs");
const packagePath = path.join(repositoryRoot, "package.json");
const catalog = JSON.parse(readFileSync(path.join(repositoryRoot, "reference", "catalog.json"), "utf8"));

function runCli(args, { cwd = repositoryRoot } = {}) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
  });
}

function createProject(t) {
  const target = mkdtempSync(path.join(tmpdir(), "architecture-blueprint-test-"));
  t.after(() => rmSync(target, { force: true, recursive: true }));
  return target;
}

function estimateTokens(value) {
  return Math.ceil(Buffer.byteLength(value, "utf8") / 3);
}

function count(value, fragment) {
  return value.split(fragment).length - 1;
}

function assertCatalogFile(relative, description) {
  assert.equal(typeof relative, "string", `${description} path must be a string`);
  assert.ok(relative.length > 0, `${description} path must not be empty`);
  assert.doesNotMatch(relative, /[\\\0]/, `${description} path must use safe POSIX separators`);
  assert.equal(path.posix.isAbsolute(relative), false, `${description} path must be relative`);
  assert.equal(path.win32.isAbsolute(relative), false, `${description} path must not be Windows-absolute`);
  assert.equal(path.posix.normalize(relative), relative, `${description} path must already be normalized`);
  assert.equal(relative.split("/").includes(".."), false, `${description} path must not traverse upward`);
  const absolute = path.join(repositoryRoot, ...relative.split("/"));
  assert.ok(existsSync(absolute), `${description} file does not exist: ${relative}`);
  assert.ok(statSync(absolute).isFile(), `${description} path is not a regular file: ${relative}`);
}

function snapshotFiles(root) {
  const snapshot = new Map();
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else snapshot.set(path.relative(root, absolute), readFileSync(absolute, "utf8"));
    }
  };
  visit(root);
  return [...snapshot.entries()].sort(([left], [right]) => left.localeCompare(right));
}

test("help is available through the executable entry point", () => {
  for (const args of [[], ["--help"], ["help"]]) {
    const result = runCli(args);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /AI Project Architecture Blueprint CLI/);
    assert.match(result.stdout, /architecture-blueprint init --profile/);
    assert.match(result.stdout, /guide <topic>/);
    assert.equal(result.stderr, "");
  }
});

test("profiles and topics expose every catalog entry in stable order", () => {
  const profiles = runCli(["profiles"]);
  assert.equal(profiles.status, 0, profiles.stderr);
  const profileLines = profiles.stdout.trim().split("\n");
  assert.deepEqual(
    profileLines.map((line) => line.split("\t", 1)[0]),
    Object.keys(catalog.profiles).sort(),
  );
  for (const [id, profile] of Object.entries(catalog.profiles)) {
    assert.ok(profileLines.includes(`${id}\t${profile.title}`));
  }

  const topics = runCli(["topics"]);
  assert.equal(topics.status, 0, topics.stderr);
  const topicLines = topics.stdout.trim().split("\n");
  assert.deepEqual(
    topicLines.map((line) => line.split("\t", 1)[0]),
    Object.keys(catalog.topics).sort(),
  );
  for (const [id, topic] of Object.entries(catalog.topics)) {
    assert.ok(topicLines.includes(`${id}\t${topic.aliases.join(", ")}`));
  }
});

test("catalog paths, compact headings, aliases, and task routes are internally valid", () => {
  const names = new Map();
  for (const id of Object.keys(catalog.topics)) names.set(id.toLowerCase(), `topic ${id}`);

  for (const [id, profile] of Object.entries(catalog.profiles)) {
    assertCatalogFile(profile.file, `profile ${id}`);
  }

  for (const [id, topic] of Object.entries(catalog.topics)) {
    assertCatalogFile(topic.file, `topic ${id}`);
    assert.ok(Array.isArray(topic.aliases));
    for (const alias of topic.aliases) {
      const normalized = alias.toLowerCase();
      assert.ok(normalized.length > 0, `topic ${id} has an empty alias`);
      assert.equal(names.has(normalized), false, `topic alias ${alias} collides with ${names.get(normalized)}`);
      names.set(normalized, `alias of ${id}`);
    }

    const markdown = readFileSync(path.join(repositoryRoot, topic.file), "utf8");
    const headings = [...markdown.matchAll(/^#{2,6}\s+(.+?)\s*#*$/gm)].map((match) => match[1].trim());
    assert.ok(Array.isArray(topic.compact_sections) && topic.compact_sections.length > 0);
    for (const compactHeading of topic.compact_sections) {
      assert.equal(
        headings.filter((heading) => heading === compactHeading).length,
        1,
        `topic ${id} compact heading must occur exactly once: ${compactHeading}`,
      );
    }
  }

  for (const [id, route] of Object.entries(catalog.task_routes)) {
    assert.ok(Array.isArray(route.primary_topics) && route.primary_topics.length > 0, `${id} needs a primary topic`);
    assert.ok(route.primary_topics.length <= 3, `${id} should keep its primary topic set compact`);
    assert.ok(Array.isArray(route.related_topics));
    const routedTopics = [...route.primary_topics, ...route.related_topics];
    assert.equal(new Set(routedTopics).size, routedTopics.length, `${id} contains duplicate topic references`);
    for (const topic of routedTopics) {
      assert.ok(catalog.topics[topic], `${id} references an unknown topic: ${topic}`);
    }
    for (const checklist of route.checklists) assertCatalogFile(checklist, `route ${id} checklist`);
    for (const template of route.templates) assertCatalogFile(template, `route ${id} template`);
  }
});

test("advertised version flags match the catalog", () => {
  for (const option of ["--version", "-v"]) {
    const version = runCli([option]);
    assert.equal(version.status, 0, version.stderr);
    assert.equal(version.stdout.trim(), catalog.blueprint_version);
  }
});

test("advertised route discovery command matches the catalog", () => {
  const routes = runCli(["routes"]);
  assert.equal(routes.status, 0, routes.stderr);
  assert.deepEqual(
    routes.stdout.trim().split("\n").map((line) => line.split("\t", 1)[0]),
    Object.keys(catalog.task_routes).sort(),
  );
});

test("init dry-run reports the complete plan without changing the target", (t) => {
  const target = createProject(t);
  const originalAgents = "# Existing agent rules\n\nKeep this project-specific rule.\n";
  writeFileSync(path.join(target, "AGENTS.md"), originalAgents);

  const before = snapshotFiles(target);
  const result = runCli(["init", "--profile", "backend-api", "--target", target, "--dry-run"]);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Dry run:/);
  assert.match(result.stdout, /Profile: backend-api/);
  assert.match(result.stdout, /CREATE PROJECT_CONTEXT\.md/);
  assert.match(result.stdout, /CREATE docs\/architecture\/overview\.md/);
  assert.match(result.stdout, /UPDATE AGENTS\.md \(managed block only\)/);
  assert.match(result.stdout, /CREATE \.architecture-blueprint\.json/);
  assert.deepEqual(snapshotFiles(target), before);
});

test("init creates only the compact active pack and preserves existing AGENTS content", (t) => {
  const target = createProject(t);
  const originalAgents = "# Local instructions\n\nPreserve this exact project rule.\n";
  writeFileSync(path.join(target, "AGENTS.md"), originalAgents);

  const result = runCli(["init", "--profile", "backend-api", "--target", target]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Initialized token-efficient architecture context/);

  const manifest = JSON.parse(readFileSync(path.join(target, ".architecture-blueprint.json"), "utf8"));
  assert.equal(manifest.schema_version, 1);
  assert.equal(manifest.blueprint_version, catalog.blueprint_version);
  assert.equal(manifest.profile, "backend-api");
  assert.deepEqual(manifest.source, {
    repository: "https://github.com/claudio1code/ai-project-architecture-blueprint",
    ref: `v${catalog.blueprint_version}`,
  });
  assert.deepEqual(manifest.context_policy.always_read, ["docs/architecture/overview.md"]);
  assert.equal(manifest.context_policy.full_reference_by_default, false);
  assert.equal(manifest.context_policy.overview_max_estimated_tokens, 1600);
  assert.equal(manifest.context_policy.agent_instructions_max_estimated_tokens, 1200);
  assert.equal(manifest.context_policy.bootstrap_max_estimated_tokens, 2400);
  assert.equal(manifest.active_files.definition_of_done, "docs/architecture/definition-of-done.md");
  const managedTemplate = readFileSync(path.join(repositoryRoot, "adoption", "agent-block.md"), "utf8");
  const expectedManagedHash = createHash("sha256")
    .update(managedTemplate.replace(/\r\n?/g, "\n").trim(), "utf8")
    .digest("hex");
  assert.deepEqual(manifest.managed_block, {
    id: "architecture-blueprint",
    template_version: 1,
    sha256: expectedManagedHash,
  });

  for (const relative of Object.values(manifest.active_files)) {
    assert.ok(existsSync(path.join(target, relative)), `missing active file: ${relative}`);
  }
  for (const omittedCatalogDirectory of ["profiles", "templates", "reference", "checklists", "examples"]) {
    assert.equal(existsSync(path.join(target, omittedCatalogDirectory)), false);
  }

  const agents = readFileSync(path.join(target, "AGENTS.md"), "utf8");
  assert.ok(agents.startsWith(originalAgents));
  assert.match(agents, /Never scan the (?:complete|full) reference(?: tree)? by default/);
  assert.equal(count(agents, "<!-- architecture-blueprint:start -->"), 1);
  assert.equal(count(agents, "<!-- architecture-blueprint:end -->"), 1);

  const profile = readFileSync(path.join(target, "docs", "architecture", "profile.md"), "utf8");
  assert.match(profile, /Adopted starting profile: `backend-api`/);
  assert.match(profile, /# Profile: Backend API/);
  assert.match(profile, new RegExp(`github\\.com/claudio1code/ai-project-architecture-blueprint/blob/v${catalog.blueprint_version}/`));
  assert.doesNotMatch(profile, /\]\(\.\.\//);
});

test("init detects collisions before writing anything", (t) => {
  const target = createProject(t);
  const collision = path.join(target, "docs", "architecture", "assessment.md");
  mkdirSync(path.dirname(collision), { recursive: true });
  writeFileSync(collision, "# Existing assessment\n");
  writeFileSync(path.join(target, "AGENTS.md"), "# Existing instructions\n");
  const before = snapshotFiles(target);

  const result = runCli(["init", "--profile", "backend-api", "--target", target]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /would overwrite existing files: docs\/architecture\/assessment\.md/);
  assert.deepEqual(snapshotFiles(target), before);
  assert.equal(existsSync(path.join(target, ".architecture-blueprint.json")), false);
  assert.equal(existsSync(path.join(target, "PROJECT_CONTEXT.md")), false);
});

test("init rejects symbolic-link targets and destination parents", (t) => {
  const realTarget = createProject(t);
  const linkContainer = createProject(t);
  const linkedTarget = path.join(linkContainer, "project-link");
  symlinkSync(realTarget, linkedTarget, "dir");

  const targetResult = runCli(["init", "--profile", "backend-api", "--target", linkedTarget]);
  assert.equal(targetResult.status, 1);
  assert.match(targetResult.stderr, /Target must not be a symbolic link/);

  const destinationTarget = createProject(t);
  const redirectedDirectory = createProject(t);
  mkdirSync(path.join(destinationTarget, "docs"));
  symlinkSync(redirectedDirectory, path.join(destinationTarget, "docs", "architecture"), "dir");

  const destinationResult = runCli([
    "init",
    "--profile",
    "backend-api",
    "--target",
    destinationTarget,
  ]);
  assert.equal(destinationResult.status, 1);
  assert.match(destinationResult.stderr, /Refusing to use a symbolic-link destination: docs\/architecture/);
  assert.equal(existsSync(path.join(destinationTarget, ".architecture-blueprint.json")), false);
  assert.equal(existsSync(path.join(destinationTarget, "PROJECT_CONTEXT.md")), false);
  assert.deepEqual(readdirSync(redirectedDirectory), []);
});

test("init is idempotent for the same profile and rejects a different profile", (t) => {
  const target = createProject(t);
  const first = runCli(["init", "--profile", "cli-application", "--target", target]);
  assert.equal(first.status, 0, first.stderr);
  const before = snapshotFiles(target);

  const repeated = runCli(["init", "--profile", "cli-application", "--target", target]);
  assert.equal(repeated.status, 0, repeated.stderr);
  assert.match(repeated.stdout, /already initialized .*; no files changed/);
  assert.deepEqual(snapshotFiles(target), before);

  const different = runCli(["init", "--profile", "backend-api", "--target", target]);
  assert.equal(different.status, 1);
  assert.match(different.stderr, /different or unsupported architecture pack already exists/);
  assert.deepEqual(snapshotFiles(target), before);
});

test("recommend routes known tasks and uses the adopted project profile", (t) => {
  const target = createProject(t);
  const uninitialized = runCli(["recommend", "api-change", "--target", target]);
  assert.equal(uninitialized.status, 0, uninitialized.stderr);
  assert.match(uninitialized.stdout, /Project profile: not initialized/);
  assert.match(uninitialized.stdout, /Primary topics: `api`, `testing`/);
  assert.match(uninitialized.stdout, /Related topics \(only if affected\): `backend`, `security`, `documentation`/);
  assert.match(
    uninitialized.stdout,
    /--ignore-scripts --package=github:claudio1code\/ai-project-architecture-blueprint#v0\.2\.0 -- architecture-blueprint/,
  );

  const initialized = runCli(["init", "--profile", "saas-application", "--target", target]);
  assert.equal(initialized.status, 0, initialized.stderr);
  const adopted = runCli(["recommend", "api-change", "--target", target]);
  assert.equal(adopted.status, 0, adopted.stderr);
  assert.match(adopted.stdout, /Project profile: saas-application/);

  const unknown = runCli(["recommend", "invented-task", "--target", target]);
  assert.equal(unknown.status, 2);
  assert.match(unknown.stderr, /Unknown task route/);

  const missingTarget = runCli(["recommend", "api-change", "--target", path.join(target, "missing")]);
  assert.equal(missingTarget.status, 1);
  assert.match(missingTarget.stderr, /Target does not exist/);
});

test("compact guides stay within budget and support topic aliases", () => {
  const budget = 1200;
  const result = runCli(["guide", "rest", "--max-tokens", String(budget)]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(estimateTokens(result.stdout) <= budget);
  assert.match(result.stdout, /^# 07 — API Design/m);
  assert.match(result.stdout, /## Contract before implementation/);
  assert.match(
    result.stdout,
    /Source: \[`docs\/07-api-design\.md`\]\(https:\/\/github\.com\/claudio1code\/ai-project-architecture-blueprint\/blob\/v0\.2\.0\/docs\/07-api-design\.md\)/,
  );
  assert.match(result.stdout, /Not loaded: .*Use `guide api --section <heading>` only if needed/);
  assert.match(result.stderr, /Compact guide emitted:/);
  assert.match(result.stderr, new RegExp(`~\\d+/${budget} estimated tokens`));

  const tooSmall = runCli(["guide", "api", "--max-tokens", "100"]);
  assert.equal(tooSmall.status, 1);
  assert.match(tooSmall.stderr, /No complete compact section fits|guide introduction exceeds/);
});

test("every catalog topic has a usable default compact guide within its budget", () => {
  for (const id of Object.keys(catalog.topics)) {
    const result = runCli(["guide", id]);
    assert.equal(result.status, 0, `${id}: ${result.stderr}`);
    assert.ok(estimateTokens(result.stdout) <= 1600, `${id} exceeded the default guide budget`);
    assert.match(result.stdout, /Generic reference is secondary to project-local context and accepted decisions/);
    assert.match(result.stderr, /Compact guide emitted:/);
  }
});

test("guide outline, section, and explicit full modes expand context deliberately", () => {
  const compact = runCli(["guide", "api"]);
  assert.equal(compact.status, 0, compact.stderr);

  const outline = runCli(["guide", "api", "--outline"]);
  assert.equal(outline.status, 0, outline.stderr);
  assert.match(outline.stdout, /^# 07 — API Design/);
  assert.match(outline.stdout, /^- Contract before implementation$/m);
  assert.match(outline.stdout, /^  - Input and output schemas$/m);
  assert.doesNotMatch(outline.stdout, /A contract describes observable behavior/);

  const section = runCli([
    "guide",
    "api",
    "--section",
    "Contract before implementation",
    "--max-tokens",
    "1600",
  ]);
  assert.equal(section.status, 0, section.stderr);
  assert.match(section.stdout, /^# 07 — API Design/);
  assert.match(section.stdout, /## Contract before implementation/);
  assert.match(section.stdout, /### Input and output schemas/);
  assert.doesNotMatch(section.stdout, /## Predictable REST semantics/);
  assert.match(section.stderr, /Section emitted: Contract before implementation/);

  const full = runCli(["guide", "api", "--full"]);
  assert.equal(full.status, 0, full.stderr);
  assert.ok(full.stdout.length > compact.stdout.length);
  assert.match(full.stdout, /## Predictable REST semantics/);
  assert.match(full.stdout, /## Authentication, authorization, and rate limiting/);
  assert.match(full.stdout, /## Review checklist/);
  assert.match(full.stderr, /Full guide emitted explicitly/);

  const budgetWithFull = runCli(["guide", "api", "--full", "--max-tokens", "100"]);
  assert.equal(budgetWithFull.status, 2);
  assert.match(budgetWithFull.stderr, /--max-tokens is valid only for compact or --section output/);

  const conflictingModes = runCli(["guide", "api", "--outline", "--full"]);
  assert.equal(conflictingModes.status, 2);
  assert.match(conflictingModes.stderr, /Use only one of --section, --outline, or --full/);
});

test("check reports template warnings normally and makes them errors in strict mode", (t) => {
  const target = createProject(t);
  const initialized = runCli(["init", "--profile", "fullstack-application", "--target", target]);
  assert.equal(initialized.status, 0, initialized.stderr);

  const normal = runCli(["check", "--target", target]);
  assert.equal(normal.status, 0, normal.stderr);
  assert.match(normal.stdout, /Profile: fullstack-application; blueprint: 0\.2\.0/);
  assert.match(normal.stdout, /WARN .* unresolved template placeholder/);
  assert.match(normal.stdout, /Result: 0 error\(s\), [1-9]\d* warning\(s\)/);

  const strict = runCli(["check", "--target", target, "--strict"]);
  assert.equal(strict.status, 1, strict.stderr);
  assert.match(strict.stdout, /ERROR .* unresolved template placeholder/);
  assert.match(strict.stdout, /Result: [1-9]\d* error\(s\), 0 warning\(s\)/);
});

test("check detects missing active files and damaged managed markers", (t) => {
  const target = createProject(t);
  const initialized = runCli(["init", "--profile", "automation-script", "--target", target]);
  assert.equal(initialized.status, 0, initialized.stderr);

  rmSync(path.join(target, "docs", "architecture", "testing-strategy.md"));
  const agentsPath = path.join(target, "AGENTS.md");
  writeFileSync(
    agentsPath,
    readFileSync(agentsPath, "utf8").replace("<!-- architecture-blueprint:end -->", ""),
  );

  const result = runCli(["check", "--target", target]);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /ERROR Missing active file \(testing_strategy\): docs\/architecture\/testing-strategy\.md/);
  assert.match(result.stdout, /ERROR AGENTS\.md must contain exactly one (?:ordered )?managed marker pair/);
});

test("check detects managed-block changes even when markers remain valid", (t) => {
  const target = createProject(t);
  const initialized = runCli(["init", "--profile", "backend-api", "--target", target]);
  assert.equal(initialized.status, 0, initialized.stderr);

  const agentsPath = path.join(target, "AGENTS.md");
  const agents = readFileSync(agentsPath, "utf8");
  writeFileSync(
    agentsPath,
    agents.replace("Read `docs/architecture/overview.md` before changing", "Review the overview before changing"),
  );

  const result = runCli(["check", "--target", target]);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /ERROR AGENTS\.md managed block differs from the version recorded in the manifest/);
});

test("check enforces overview budget and reports always-read context budget pressure", (t) => {
  const target = createProject(t);
  const initialized = runCli(["init", "--profile", "backend-api", "--target", target]);
  assert.equal(initialized.status, 0, initialized.stderr);

  const overviewPath = path.join(target, "docs", "architecture", "overview.md");
  writeFileSync(overviewPath, `${readFileSync(overviewPath, "utf8")}\n${"overview ".repeat(1000)}\n`);
  const agentsPath = path.join(target, "AGENTS.md");
  writeFileSync(agentsPath, `${readFileSync(agentsPath, "utf8")}\n${"local-rule ".repeat(1000)}\n`);

  const result = runCli(["check", "--target", target]);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /Always-read estimate: \d+\/2400 tokens/);
  assert.match(result.stdout, /WARN AGENTS\.md is estimated at \d+ tokens; its budget is 1200/);
  assert.match(result.stdout, /WARN Always-read bootstrap context is estimated at \d+ tokens; budget is 2400/);
  assert.match(result.stdout, /ERROR Architecture overview is estimated at \d+ tokens; budget is 1600/);
});

test("check rejects symbolic-link manifests and active files", (t) => {
  const manifestTarget = createProject(t);
  const external = createProject(t);
  const initializedManifest = runCli(["init", "--profile", "backend-api", "--target", manifestTarget]);
  assert.equal(initializedManifest.status, 0, initializedManifest.stderr);
  const manifestPath = path.join(manifestTarget, ".architecture-blueprint.json");
  const externalManifest = path.join(external, "manifest.json");
  writeFileSync(externalManifest, readFileSync(manifestPath, "utf8"));
  rmSync(manifestPath);
  symlinkSync(externalManifest, manifestPath);

  const manifestResult = runCli(["check", "--target", manifestTarget]);
  assert.equal(manifestResult.status, 1);
  assert.match(manifestResult.stderr, /\.architecture-blueprint\.json must be a single-link regular file/);

  const activeTarget = createProject(t);
  const initializedActive = runCli(["init", "--profile", "backend-api", "--target", activeTarget]);
  assert.equal(initializedActive.status, 0, initializedActive.stderr);
  const activePath = path.join(activeTarget, "docs", "architecture", "testing-strategy.md");
  const externalActive = path.join(external, "outside.md");
  writeFileSync(externalActive, "# External content\n");
  rmSync(activePath);
  symlinkSync(externalActive, activePath);

  const activeResult = runCli(["check", "--target", activeTarget]);
  assert.equal(activeResult.status, 1);
  assert.match(activeResult.stdout, /ERROR Refusing to use a symbolic-link destination: docs\/architecture\/testing-strategy\.md/);
});

test("init rejects a hard-linked AGENTS file without modifying its other link", (t) => {
  const target = createProject(t);
  const external = createProject(t);
  const externalAgents = path.join(external, "shared-agents.md");
  const original = "# Shared instructions\n\nDo not modify through another link.\n";
  writeFileSync(externalAgents, original);
  linkSync(externalAgents, path.join(target, "AGENTS.md"));

  const result = runCli(["init", "--profile", "backend-api", "--target", target]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Refusing to use a hard-linked destination: AGENTS\.md/);
  assert.equal(readFileSync(externalAgents, "utf8"), original);
  assert.equal(existsSync(path.join(target, ".architecture-blueprint.json")), false);
  assert.equal(existsSync(path.join(target, "PROJECT_CONTEXT.md")), false);
});

test("check handles invalid manifest roots and context policies as controlled validation failures", (t) => {
  const invalidRoot = createProject(t);
  writeFileSync(path.join(invalidRoot, ".architecture-blueprint.json"), "null\n");

  const rootResult = runCli(["check", "--target", invalidRoot]);
  assert.equal(rootResult.status, 1);
  assert.match(rootResult.stderr, /\.architecture-blueprint\.json must contain a JSON object/);
  assert.doesNotMatch(rootResult.stderr, /Cannot read properties|TypeError/);

  const invalidPolicy = createProject(t);
  const initialized = runCli(["init", "--profile", "backend-api", "--target", invalidPolicy]);
  assert.equal(initialized.status, 0, initialized.stderr);
  const manifestPath = path.join(invalidPolicy, ".architecture-blueprint.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  manifest.context_policy.always_read = [];
  manifest.context_policy.full_reference_by_default = true;
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  const policyResult = runCli(["check", "--target", invalidPolicy]);
  assert.equal(policyResult.status, 1);
  assert.match(policyResult.stdout, /ERROR Manifest always_read must contain only the architecture overview/);
  assert.match(policyResult.stdout, /ERROR Manifest full_reference_by_default must be false/);
});

test("check does not accept required overview headings from fenced examples", (t) => {
  const target = createProject(t);
  const initialized = runCli(["init", "--profile", "backend-api", "--target", target]);
  assert.equal(initialized.status, 0, initialized.stderr);
  const fakeOverview = [
    "# Architecture Overview",
    "",
    "```md",
    "## System purpose",
    "## Context profile",
    "## System shape",
    "## Dependency and data rules",
    "## Adopted practices",
    "## Quality gates and operation",
    "## Decisions and evolution",
    "```",
    "",
  ].join("\n");
  writeFileSync(path.join(target, "docs", "architecture", "overview.md"), fakeOverview);

  const result = runCli(["check", "--target", target]);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /ERROR Architecture overview is missing heading: System purpose/);
});

test("check ignores example links inside fenced and inline code", (t) => {
  const target = createProject(t);
  const initialized = runCli(["init", "--profile", "backend-api", "--target", target]);
  assert.equal(initialized.status, 0, initialized.stderr);
  const overviewPath = path.join(target, "docs", "architecture", "overview.md");
  const example = [
    "",
    "~~~md",
    "[fenced example](not-a-project-file.md)",
    "~~~",
    "",
    "Inline syntax example: `[inline](also-not-a-project-file.md)`.",
    "",
  ].join("\n");
  writeFileSync(overviewPath, `${readFileSync(overviewPath, "utf8")}${example}`);

  const result = runCli(["check", "--target", target]);
  assert.equal(result.status, 0, result.stderr);
  assert.doesNotMatch(result.stdout, /not-a-project-file|also-not-a-project-file/);
});

test("package metadata keeps the adoption CLI zero-dependency and pinned to supported Node", () => {
  const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
  assert.equal(packageJson.type, "module");
  assert.equal(packageJson.bin?.["architecture-blueprint"], "bin/architecture-blueprint.mjs");
  assert.equal(packageJson.engines?.node, ">=22");
  assert.equal(packageJson.version, catalog.blueprint_version);

  for (const dependencyField of ["dependencies", "optionalDependencies", "peerDependencies"]) {
    assert.ok(
      !packageJson[dependencyField] || Object.keys(packageJson[dependencyField]).length === 0,
      `${dependencyField} must remain empty`,
    );
  }
  for (const lifecycle of ["preinstall", "install", "postinstall", "prepare", "prepublish", "prepublishOnly"]) {
    assert.equal(packageJson.scripts?.[lifecycle], undefined, `${lifecycle} must not execute package code`);
  }

  const bin = readFileSync(cliPath, "utf8");
  assert.ok(bin.startsWith("#!/usr/bin/env node\n"));
  assert.notEqual(statSync(cliPath).mode & 0o111, 0, "CLI bin must be executable in the published package");
});
