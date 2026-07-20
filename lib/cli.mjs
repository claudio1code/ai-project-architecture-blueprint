import {
  lstat,
  mkdir,
  readdir,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_ROOT = path.resolve(fileURLToPath(new URL("../", import.meta.url)));
const CATALOG_PATH = path.join(PACKAGE_ROOT, "reference", "catalog.json");
const MANIFEST_NAME = ".architecture-blueprint.json";
const MANAGED_START = "<!-- architecture-blueprint:start -->";
const MANAGED_END = "<!-- architecture-blueprint:end -->";
const REPOSITORY = "https://github.com/claudio1code/ai-project-architecture-blueprint";
const DEFAULT_GUIDE_TOKENS = 1600;
const DEFAULT_OVERVIEW_TOKENS = 1600;
const DEFAULT_AGENT_INSTRUCTIONS_TOKENS = 1200;
const DEFAULT_BOOTSTRAP_TOKENS = 2400;

class CliError extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.exitCode = exitCode;
  }
}

const HELP = `AI Project Architecture Blueprint CLI

Usage:
  architecture-blueprint <command> [options]

Commands:
  init --profile <id> [--target <path>] [--dry-run]
      Create a compact active architecture pack without copying the reference catalog.

  profiles
      List available starting profiles.

  topics
      List on-demand reference topics and aliases.

  routes
      List deterministic task routes accepted by recommend.

  recommend <route> [--target <path>]
      Resolve a listed route to a small primary topic set and conditional related topics.

  guide <topic> [--max-tokens <n>]
      Print a compact guide made of complete source sections.
      Add --section <heading>, --outline, or --full for explicit expansion.

  check [--target <path>] [--strict] [--max-overview-tokens <n>]
      Validate the adopted pack, token budget, links, markers, and placeholders.

Global:
  -h, --help
  -v, --version

Examples:
  architecture-blueprint init --profile backend-api
  architecture-blueprint routes
  architecture-blueprint recommend api-change
  architecture-blueprint guide api
  architecture-blueprint guide architecture --section Microservices
  architecture-blueprint check --strict
`;

const OPTION_KIND = new Map([
  ["dry-run", "boolean"],
  ["strict", "boolean"],
  ["full", "boolean"],
  ["outline", "boolean"],
  ["help", "boolean"],
  ["h", "boolean"],
  ["version", "boolean"],
  ["v", "boolean"],
  ["profile", "value"],
  ["target", "value"],
  ["max-tokens", "value"],
  ["max-overview-tokens", "value"],
  ["section", "value"],
]);

function parseArguments(argv) {
  const args = [...argv];
  const command = args.shift() ?? "help";
  const options = {};
  const positionals = [];

  while (args.length > 0) {
    const argument = args.shift();
    if (argument === "--") {
      positionals.push(...args);
      break;
    }
    if (!argument.startsWith("--") && argument !== "-h" && argument !== "-v") {
      positionals.push(argument);
      continue;
    }

    const raw = argument === "-h" ? "h" : argument === "-v" ? "v" : argument.slice(2);
    const separator = raw.indexOf("=");
    const key = separator >= 0 ? raw.slice(0, separator) : raw;
    const inlineValue = separator >= 0 ? raw.slice(separator + 1) : undefined;
    const kind = OPTION_KIND.get(key);
    if (!kind) {
      throw new CliError(`Unknown option --${key}. Use --help for usage.`, 2);
    }
    if (kind === "boolean") {
      if (inlineValue !== undefined) {
        throw new CliError(`Option --${key} does not take a value.`, 2);
      }
      if (Object.hasOwn(options, key)) {
        throw new CliError(`Option --${key} was provided more than once.`, 2);
      }
      options[key] = true;
      continue;
    }
    const value = inlineValue ?? args.shift();
    if (value === undefined || value.length === 0 || value.startsWith("--")) {
      throw new CliError(`Option --${key} requires a value.`, 2);
    }
    if (Object.hasOwn(options, key)) {
      throw new CliError(`Option --${key} was provided more than once.`, 2);
    }
    options[key] = value;
  }

  return { command, options, positionals };
}

function assertAllowedOptions(options, allowed) {
  for (const key of Object.keys(options)) {
    if (!allowed.has(key) && key !== "help" && key !== "h") {
      throw new CliError(`Option --${key} is not valid for this command.`, 2);
    }
  }
}

function assertPositionals(positionals, minimum, maximum, usage) {
  if (positionals.length < minimum || positionals.length > maximum) {
    throw new CliError(`Expected ${usage}.`, 2);
  }
}

function parsePositiveInteger(raw, fallback, name, minimum = 100, maximum = 100000) {
  const value = Number(raw === undefined ? fallback : raw);
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new CliError(`--${name} must be an integer from ${minimum} to ${maximum}.`, 2);
  }
  return value;
}

async function exists(target) {
  try {
    await lstat(target);
    return true;
  } catch {
    return false;
  }
}

function isSafeRelativePath(relative) {
  if (typeof relative !== "string" || relative.length === 0 || relative.includes("\0") || relative.includes("\\")) {
    return false;
  }
  if (path.posix.isAbsolute(relative) || path.win32.isAbsolute(relative)) return false;
  const normalized = path.posix.normalize(relative);
  return normalized !== "." && normalized === relative && !normalized.split("/").includes("..");
}

function resolveWithinTarget(target, relative) {
  if (!isSafeRelativePath(relative)) {
    throw new CliError(`Unsafe project-relative path: ${String(relative)}.`);
  }
  const resolved = path.resolve(target, ...relative.split("/"));
  if (resolved !== target && !resolved.startsWith(`${target}${path.sep}`)) {
    throw new CliError(`Path escapes the target directory: ${relative}.`);
  }
  return resolved;
}

async function assertSafeDestinationPath(target, relative) {
  resolveWithinTarget(target, relative);
  const parts = relative.split("/");
  let current = target;
  for (const [index, part] of parts.entries()) {
    const entries = await readdir(current).catch((error) => {
      if (error.code === "ENOENT") return null;
      throw error;
    });
    if (entries === null) return;
    const matched = entries.find((entry) => entry.toLocaleLowerCase("en-US") === part.toLocaleLowerCase("en-US"));
    if (!matched) return;
    if (matched !== part) {
      const observed = path.relative(target, path.join(current, matched));
      throw new CliError(`Case-insensitive path collision: ${relative} conflicts with ${observed}.`);
    }
    current = path.join(current, matched);
    const metadata = await lstat(current);
    if (metadata.isSymbolicLink()) {
      throw new CliError(`Refusing to use a symbolic-link destination: ${path.relative(target, current)}.`);
    }
    if (index === parts.length - 1 && metadata.isFile() && metadata.nlink > 1) {
      throw new CliError(`Refusing to use a hard-linked destination: ${path.relative(target, current)}.`);
    }
    if (index < parts.length - 1 && !metadata.isDirectory()) {
      throw new CliError(`Destination parent is not a directory: ${path.relative(target, current)}.`);
    }
  }
}

function normalizeManagedBlock(markdown) {
  return markdown.replace(/\r\n?/g, "\n").trim();
}

function managedBlockHash(markdown) {
  return createHash("sha256").update(normalizeManagedBlock(markdown), "utf8").digest("hex");
}

function extractManagedBlock(markdown) {
  const starts = [...markdown.matchAll(new RegExp(MANAGED_START, "g"))];
  const ends = [...markdown.matchAll(new RegExp(MANAGED_END, "g"))];
  if (starts.length !== 1 || ends.length !== 1 || starts[0].index > ends[0].index) return null;
  return markdown.slice(starts[0].index, ends[0].index + MANAGED_END.length);
}

async function readJson(file) {
  let value;
  try {
    value = JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    throw new CliError(`Cannot read valid JSON from ${file}: ${error.message}`);
  }
  return value;
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readManifestBudget(raw, fallback, label, errors) {
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 100 || value > 100000) {
    errors.push(`Manifest ${label} must be an integer from 100 to 100000.`);
    return fallback;
  }
  return value;
}

async function loadCatalog() {
  const catalog = await readJson(CATALOG_PATH);
  if (!isRecord(catalog) || catalog.schema_version !== 1 || typeof catalog.blueprint_version !== "string") {
    throw new CliError("reference/catalog.json has an unsupported schema.");
  }
  if (!isRecord(catalog.profiles) || !isRecord(catalog.topics) || !isRecord(catalog.task_routes)) {
    throw new CliError("reference/catalog.json is missing profiles, topics, or task_routes.");
  }
  return catalog;
}

function resolveProfile(catalog, requested) {
  const id = requested?.toLowerCase();
  const profile = id ? catalog.profiles[id] : undefined;
  if (!profile) {
    const choices = Object.keys(catalog.profiles).sort().join(", ");
    throw new CliError(`Unknown or missing profile. Choose one of: ${choices}.`, 2);
  }
  return { id, ...profile };
}

function resolveTopic(catalog, requested) {
  const query = requested?.toLowerCase();
  for (const [id, topic] of Object.entries(catalog.topics)) {
    const aliases = Array.isArray(topic.aliases) ? topic.aliases.map((value) => value.toLowerCase()) : [];
    if (id.toLowerCase() === query || aliases.includes(query)) {
      return { id, ...topic };
    }
  }
  const choices = Object.keys(catalog.topics).sort().join(", ");
  throw new CliError(`Unknown or missing topic. Choose one of: ${choices}.`, 2);
}

function sourceRef(catalog) {
  return `v${catalog.blueprint_version}`;
}

function sourceBlobBase(catalog) {
  return `${REPOSITORY}/blob/${sourceRef(catalog)}/`;
}

function sourceFileUrl(catalog, repositoryPath) {
  const encoded = repositoryPath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `${sourceBlobBase(catalog)}${encoded}`;
}

function pinnedCommand(catalog) {
  return `npx --yes --ignore-scripts --package=github:claudio1code/ai-project-architecture-blueprint#${sourceRef(catalog)} -- architecture-blueprint`;
}

function rewriteRelativeMarkdownLinks(markdown, sourcePath, catalog) {
  const sourceDirectory = path.posix.dirname(sourcePath);
  return markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (whole, label, rawTarget) => {
    const target = rawTarget.trim();
    if (
      !target ||
      target.startsWith("#") ||
      /^[a-z][a-z0-9+.-]*:/i.test(target) ||
      target.startsWith("/")
    ) {
      return whole;
    }

    const [pathPart, fragment] = target.split("#", 2);
    if (!pathPart || /\s+["']/.test(pathPart)) return whole;
    const resolved = path.posix.normalize(path.posix.join(sourceDirectory, pathPart));
    if (resolved.startsWith("../") || resolved === "..") return whole;
    const suffix = fragment ? `#${fragment}` : "";
    return `[${label}](${sourceFileUrl(catalog, resolved)}${suffix})`;
  });
}

function estimateTokens(text) {
  // A deliberately conservative, tokenizer-free estimate. It is a budget guard,
  // not a claim about any particular model's tokenizer.
  return Math.ceil(Buffer.byteLength(text, "utf8") / 3);
}

function markdownFenceMarker(line) {
  const match = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
  if (!match) return null;
  return { character: match[1][0], length: match[1].length, trailing: match[2] };
}

function closesMarkdownFence(marker, fence) {
  return (
    marker &&
    marker.character === fence.character &&
    marker.length >= fence.length &&
    marker.trailing.trim() === ""
  );
}

function stripFencedMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const output = [];
  let fence = null;
  for (const line of lines) {
    const marker = markdownFenceMarker(line);
    if (fence) {
      if (closesMarkdownFence(marker, fence)) fence = null;
      output.push("");
      continue;
    }
    if (marker) {
      fence = marker;
      output.push("");
      continue;
    }
    output.push(line);
  }
  return output.join("\n");
}

function parseMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const headings = [];
  let fence = null;
  for (let index = 0; index < lines.length; index += 1) {
    const marker = markdownFenceMarker(lines[index]);
    if (fence) {
      if (closesMarkdownFence(marker, fence)) fence = null;
      continue;
    }
    if (marker) {
      fence = marker;
      continue;
    }
    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(lines[index]);
    if (match) {
      headings.push({ index, level: match[1].length, title: match[2].trim() });
    }
  }
  if (headings.length === 0 || headings[0].level !== 1) {
    throw new CliError("Guide source must begin with an H1 heading.");
  }

  const firstSubheading = headings.find((heading) => heading.level >= 2);
  const leadEnd = firstSubheading?.index ?? lines.length;
  const lead = lines.slice(0, leadEnd).join("\n").trim();
  const sections = headings
    .filter((heading) => heading.level >= 2)
    .map((heading) => {
      const next = headings.find(
        (candidate) => candidate.index > heading.index && candidate.level <= heading.level,
      );
      const end = next?.index ?? lines.length;
      return {
        ...heading,
        content: lines.slice(heading.index, end).join("\n").trim(),
      };
    });
  return { h1: lines[headings[0].index].trim(), lead, headings, sections };
}

function findSection(parsed, requested) {
  const query = requested.trim().toLowerCase();
  const matches = parsed.sections.filter((section) => section.title.toLowerCase() === query);
  if (matches.length === 0) {
    throw new CliError(`Section "${requested}" was not found. Use --outline to list headings.`, 2);
  }
  if (matches.length > 1) {
    throw new CliError(`Section "${requested}" is ambiguous. Use --outline and a unique heading.`, 2);
  }
  return matches[0];
}

function compactGuide(parsed, topic, catalog, maxTokens) {
  const selected = [];
  const configured = Array.isArray(topic.compact_sections) ? topic.compact_sections : [];
  const configuredSections = configured.map((title) => {
    const section = parsed.sections.find((candidate) => candidate.title.toLowerCase() === title.toLowerCase());
    if (!section) throw new CliError(`Catalog section "${title}" does not exist in ${topic.file}.`);
    return section;
  });
  const makeFooter = (selectedTitles) => {
    const selectedSet = new Set(selectedTitles);
    const omitted = configuredSections.filter((section) => !selectedSet.has(section.title));
    const omittedLine = omitted.length > 0
      ? `\nNot loaded: ${omitted.map((section) => `\`${section.title}\``).join(", ")}. Use \`guide ${topic.id} --section <heading>\` only if needed.`
      : "";
    return `---\nGeneric reference is secondary to project-local context and accepted decisions. Source: [\`${topic.file}\`](${sourceFileUrl(catalog, topic.file)}).${omittedLine}\nUse \`guide ${topic.id} --outline\` to inspect all headings. Use \`--full\` only when narrower guidance is insufficient.`;
  };
  let body = parsed.lead;

  if (estimateTokens(`${body}\n\n${makeFooter(selected)}`) > maxTokens) {
    throw new CliError(`The guide introduction exceeds the ${maxTokens}-token estimate. Increase --max-tokens.`);
  }

  for (const section of configuredSections) {
    const candidateTitles = [...selected, section.title];
    const candidate = `${body}\n\n${section.content}\n\n${makeFooter(candidateTitles)}`;
    if (estimateTokens(candidate) <= maxTokens) {
      body = `${body}\n\n${section.content}`;
      selected.push(section.title);
    }
  }

  if (selected.length === 0) {
    throw new CliError(
      `No complete compact section fits the ${maxTokens}-token estimate. Increase --max-tokens or request --section explicitly.`,
    );
  }

  const output = `${body}\n\n${makeFooter(selected)}\n`;
  return { output, estimatedTokens: estimateTokens(output), selected };
}

function replaceManagedBlock(existing, managedBlock) {
  const normalizedBlock = normalizeManagedBlock(managedBlock);
  if (!extractManagedBlock(normalizedBlock)) {
    throw new CliError("The packaged AGENTS.md managed block is malformed.");
  }
  const starts = [...existing.matchAll(new RegExp(MANAGED_START, "g"))];
  const ends = [...existing.matchAll(new RegExp(MANAGED_END, "g"))];
  if (starts.length !== ends.length || starts.length > 1) {
    throw new CliError("AGENTS.md has malformed or duplicate architecture-blueprint markers.");
  }
  if (starts.length === 0) {
    const eol = existing.includes("\r\n") ? "\r\n" : "\n";
    const block = normalizedBlock.replace(/\n/g, eol);
    if (existing.length === 0) return `${block}${eol}`;
    const separator = existing.endsWith(`${eol}${eol}`) ? "" : existing.endsWith(eol) ? eol : `${eol}${eol}`;
    return `${existing}${separator}${block}${eol}`;
  }
  if (starts[0].index > ends[0].index) {
    throw new CliError("AGENTS.md architecture-blueprint markers are out of order.");
  }
  const eol = existing.includes("\r\n") ? "\r\n" : "\n";
  const block = normalizedBlock.replace(/\n/g, eol);
  const before = existing.slice(0, starts[0].index);
  const after = existing.slice(ends[0].index + MANAGED_END.length);
  return `${before}${block}${after}`;
}

async function assertTargetDirectory(target) {
  let metadata;
  try {
    metadata = await lstat(target);
  } catch {
    throw new CliError(`Target does not exist: ${target}`);
  }
  if (metadata.isSymbolicLink()) {
    throw new CliError(`Target must not be a symbolic link: ${target}`);
  }
  if (!metadata.isDirectory()) {
    throw new CliError(`Target is not a directory: ${target}`);
  }
  if (path.parse(target).root === target) {
    throw new CliError("Refusing to initialize a filesystem root. Choose a project directory.");
  }
}

async function prepareInit(catalog, profile, target) {
  const manifestPath = path.join(target, MANIFEST_NAME);
  if (await exists(manifestPath)) {
    throw new CliError(`${target} is already initialized; run check instead of init.`);
  }

  const definitions = [
    ["PROJECT_CONTEXT.md", "templates/project-context.template.md"],
    ["docs/architecture/overview.md", "templates/architecture-overview.template.md"],
    ["docs/architecture/assessment.md", "templates/architecture-assessment.template.md"],
    ["docs/architecture/technology-stack.md", "templates/technology-stack.template.md"],
    ["docs/architecture/testing-strategy.md", "templates/testing-strategy.template.md"],
    ["docs/architecture/definition-of-done.md", "templates/definition-of-done.template.md"],
    ["docs/architecture/decisions/README.md", "adoption/decision-index.md"],
  ];
  const destinations = [...definitions.map(([destination]) => destination), "docs/architecture/profile.md"];
  for (const destination of [...destinations, "AGENTS.md", MANIFEST_NAME]) {
    await assertSafeDestinationPath(target, destination);
  }
  const collisions = [];
  for (const destination of destinations) {
    if (await exists(path.join(target, destination))) collisions.push(destination);
  }
  if (collisions.length > 0) {
    throw new CliError(`Init would overwrite existing files: ${collisions.join(", ")}.`);
  }

  const outputs = [];
  for (const [destination, source] of definitions) {
    outputs.push({ destination, content: await readFile(path.join(PACKAGE_ROOT, source), "utf8") });
  }
  const rawProfile = await readFile(path.join(PACKAGE_ROOT, profile.file), "utf8");
  const firstLineEnd = rawProfile.indexOf("\n");
  if (firstLineEnd < 0 || !rawProfile.startsWith("# ")) {
    throw new CliError(`Profile source must begin with an H1 heading: ${profile.file}.`);
  }
  const profileHeader = `\n> Adopted starting profile: \`${profile.id}\` from blueprint ${catalog.blueprint_version}. This is an initial hypothesis, not a decision. Record compositions and deviations in the project assessment and overview.\n`;
  outputs.push({
    destination: "docs/architecture/profile.md",
    content: `${rawProfile.slice(0, firstLineEnd)}${profileHeader}${rewriteRelativeMarkdownLinks(rawProfile.slice(firstLineEnd + 1), profile.file, catalog)}`,
  });

  const agentPath = path.join(target, "AGENTS.md");
  const agentExisted = await exists(agentPath);
  const previousAgent = agentExisted ? await readFile(agentPath, "utf8") : "";
  const managedBlock = await readFile(path.join(PACKAGE_ROOT, "adoption", "agent-block.md"), "utf8");
  const nextAgent = replaceManagedBlock(previousAgent, managedBlock);

  const activeFiles = {
    overview: "docs/architecture/overview.md",
    context: "PROJECT_CONTEXT.md",
    assessment: "docs/architecture/assessment.md",
    profile: "docs/architecture/profile.md",
    technology_stack: "docs/architecture/technology-stack.md",
    testing_strategy: "docs/architecture/testing-strategy.md",
    definition_of_done: "docs/architecture/definition-of-done.md",
    decision_index: "docs/architecture/decisions/README.md",
    agent_instructions: "AGENTS.md",
  };
  const manifest = {
    schema_version: 1,
    blueprint_version: catalog.blueprint_version,
    profile: profile.id,
    source: {
      repository: REPOSITORY,
      ref: sourceRef(catalog),
    },
    active_files: activeFiles,
    context_policy: {
      always_read: [activeFiles.overview],
      read_when_relevant: [
        activeFiles.context,
        activeFiles.assessment,
        activeFiles.profile,
        activeFiles.technology_stack,
        activeFiles.testing_strategy,
        activeFiles.definition_of_done,
        activeFiles.decision_index,
      ],
      full_reference_by_default: false,
      overview_max_estimated_tokens: DEFAULT_OVERVIEW_TOKENS,
      agent_instructions_max_estimated_tokens: DEFAULT_AGENT_INSTRUCTIONS_TOKENS,
      bootstrap_max_estimated_tokens: DEFAULT_BOOTSTRAP_TOKENS,
    },
    managed_block: {
      id: "architecture-blueprint",
      template_version: 1,
      sha256: managedBlockHash(managedBlock),
    },
  };

  return {
    outputs,
    manifestPath,
    manifestContent: `${JSON.stringify(manifest, null, 2)}\n`,
    agentPath,
    agentExisted,
    previousAgent,
    nextAgent,
  };
}

async function performInit(prepared, target) {
  const created = [];
  let agentWritten = false;
  try {
    for (const output of prepared.outputs) {
      await assertSafeDestinationPath(target, output.destination);
      const destination = path.join(target, output.destination);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, output.content, { encoding: "utf8", flag: "wx" });
      created.push(destination);
    }
    await assertSafeDestinationPath(target, "AGENTS.md");
    if (prepared.agentExisted) {
      const currentAgent = await readFile(prepared.agentPath, "utf8");
      if (currentAgent !== prepared.previousAgent) {
        throw new CliError("AGENTS.md changed during initialization; retry after reviewing it.");
      }
      await writeFile(prepared.agentPath, prepared.nextAgent, "utf8");
    } else {
      await writeFile(prepared.agentPath, prepared.nextAgent, { encoding: "utf8", flag: "wx" });
    }
    agentWritten = true;
    await writeFile(prepared.manifestPath, prepared.manifestContent, { encoding: "utf8", flag: "wx" });
    created.push(prepared.manifestPath);
  } catch (error) {
    const rollbackFailures = [];
    for (const file of created.reverse()) {
      await rm(file, { force: true }).catch((rollbackError) => {
        rollbackFailures.push(`${file}: ${rollbackError.message}`);
      });
    }
    if (agentWritten) {
      if (prepared.agentExisted) {
        await writeFile(prepared.agentPath, prepared.previousAgent, "utf8").catch((rollbackError) => {
          rollbackFailures.push(`${prepared.agentPath}: ${rollbackError.message}`);
        });
      } else {
        await rm(prepared.agentPath, { force: true }).catch((rollbackError) => {
          rollbackFailures.push(`${prepared.agentPath}: ${rollbackError.message}`);
        });
      }
    }
    const rollbackStatus = rollbackFailures.length === 0
      ? "Created files were rolled back."
      : `Rollback was incomplete: ${rollbackFailures.join("; ")}`;
    throw new CliError(`Init failed: ${error.message} ${rollbackStatus}`);
  }
}

function extractRelativeLinks(markdown) {
  const withoutCode = stripFencedMarkdown(markdown).replace(/(`+)([\s\S]*?)\1/g, "");
  const links = [];
  for (const match of withoutCode.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    let target = match[1].trim();
    if (target.startsWith("<") && target.includes(">")) target = target.slice(1, target.indexOf(">"));
    else if (/\s+["']/.test(target)) target = target.split(/\s+/, 1)[0];
    if (!target || target.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
    links.push(target.split("#", 1)[0]);
  }
  return links;
}

async function checkAdoption(target, catalog, options) {
  const errors = [];
  const warnings = [];
  const manifestPath = path.join(target, MANIFEST_NAME);
  if (!(await exists(manifestPath))) {
    throw new CliError(`No ${MANIFEST_NAME} found in ${target}. Run init first.`);
  }
  const manifestMetadata = await lstat(manifestPath);
  if (manifestMetadata.isSymbolicLink() || !manifestMetadata.isFile() || manifestMetadata.nlink > 1) {
    throw new CliError(`${MANIFEST_NAME} must be a single-link regular file.`);
  }
  const manifest = await readJson(manifestPath);
  if (!isRecord(manifest)) {
    throw new CliError(`${MANIFEST_NAME} must contain a JSON object.`);
  }
  if (manifest.schema_version !== 1) errors.push("Manifest schema_version must be 1.");
  if (!catalog.profiles[manifest.profile]) errors.push(`Manifest profile is unknown: ${manifest.profile}.`);
  if (manifest.blueprint_version !== catalog.blueprint_version) {
    warnings.push(
      `Pack uses blueprint ${manifest.blueprint_version}; invoked CLI is ${catalog.blueprint_version}. Review changes before updating.`,
    );
  }
  if (!manifest.active_files || typeof manifest.active_files !== "object" || Array.isArray(manifest.active_files)) {
    errors.push("Manifest active_files is missing or invalid.");
  }

  const expectedRoles = {
    overview: "docs/architecture/overview.md",
    context: "PROJECT_CONTEXT.md",
    assessment: "docs/architecture/assessment.md",
    profile: "docs/architecture/profile.md",
    technology_stack: "docs/architecture/technology-stack.md",
    testing_strategy: "docs/architecture/testing-strategy.md",
    definition_of_done: "docs/architecture/definition-of-done.md",
    decision_index: "docs/architecture/decisions/README.md",
    agent_instructions: "AGENTS.md",
  };
  for (const [role, expectedPath] of Object.entries(expectedRoles)) {
    if (manifest.active_files?.[role] !== expectedPath) {
      errors.push(`Manifest role ${role} must point to ${expectedPath}.`);
    }
  }
  if (
    manifest.source?.repository !== REPOSITORY ||
    manifest.source?.ref !== `v${manifest.blueprint_version}`
  ) {
    errors.push("Manifest source must identify the canonical repository and its versioned tag.");
  }
  if (!manifest.context_policy || typeof manifest.context_policy !== "object" || Array.isArray(manifest.context_policy)) {
    errors.push("Manifest context_policy is missing or invalid.");
  } else {
    const alwaysRead = manifest.context_policy.always_read;
    if (!Array.isArray(alwaysRead) || alwaysRead.length !== 1 || alwaysRead[0] !== expectedRoles.overview) {
      errors.push("Manifest always_read must contain only the architecture overview.");
    }
    if (manifest.context_policy.full_reference_by_default !== false) {
      errors.push("Manifest full_reference_by_default must be false.");
    }
    const expectedConditional = Object.entries(expectedRoles)
      .filter(([role]) => role !== "overview" && role !== "agent_instructions")
      .map(([, relative]) => relative)
      .sort();
    const observedConditional = Array.isArray(manifest.context_policy.read_when_relevant)
      ? [...manifest.context_policy.read_when_relevant].sort()
      : [];
    if (JSON.stringify(observedConditional) !== JSON.stringify(expectedConditional)) {
      errors.push("Manifest read_when_relevant does not match the generated conditional context set.");
    }
  }
  const packagedManagedBlock = await readFile(path.join(PACKAGE_ROOT, "adoption", "agent-block.md"), "utf8");
  if (
    manifest.managed_block?.id !== "architecture-blueprint" ||
    manifest.managed_block?.template_version !== 1 ||
    manifest.managed_block?.sha256 !== managedBlockHash(packagedManagedBlock)
  ) {
    errors.push("Manifest managed_block metadata does not match this blueprint release.");
  }

  const activeEntries = Object.entries(manifest.active_files ?? {});
  const markdownFiles = [];
  const observedPaths = new Set();
  const canonicalTarget = await realpath(target);
  for (const [role, relative] of activeEntries) {
    if (!isSafeRelativePath(relative)) {
      errors.push(`Active file path for ${role} is unsafe: ${String(relative)}.`);
      continue;
    }
    const collisionKey = relative.toLocaleLowerCase("en-US");
    if (observedPaths.has(collisionKey)) {
      errors.push(`Manifest contains a duplicate or case-colliding active path: ${relative}.`);
      continue;
    }
    observedPaths.add(collisionKey);
    const absolute = resolveWithinTarget(target, relative);
    try {
      await assertSafeDestinationPath(target, relative);
    } catch (error) {
      errors.push(error.message);
      continue;
    }
    if (!(await exists(absolute))) {
      errors.push(`Missing active file (${role}): ${relative}.`);
      continue;
    }
    const metadata = await lstat(absolute);
    if (metadata.isSymbolicLink() || !metadata.isFile()) {
      errors.push(`Active file must be a regular file (${role}): ${relative}.`);
      continue;
    }
    const canonicalFile = await realpath(absolute);
    if (canonicalFile !== canonicalTarget && !canonicalFile.startsWith(`${canonicalTarget}${path.sep}`)) {
      errors.push(`Active file resolves outside the project (${role}): ${relative}.`);
      continue;
    }
    if (relative.endsWith(".md")) {
      markdownFiles.push({ role, relative, absolute, content: await readFile(absolute, "utf8") });
    }
  }

  const agent = markdownFiles.find((file) => file.role === "agent_instructions");
  if (agent) {
    const startCount = [...agent.content.matchAll(new RegExp(MANAGED_START, "g"))].length;
    const endCount = [...agent.content.matchAll(new RegExp(MANAGED_END, "g"))].length;
    const block = extractManagedBlock(agent.content);
    if (startCount !== 1 || endCount !== 1 || !block) {
      errors.push("AGENTS.md must contain exactly one ordered managed marker pair.");
    } else if (!manifest.managed_block || manifest.managed_block.sha256 !== managedBlockHash(block)) {
      errors.push("AGENTS.md managed block differs from the version recorded in the manifest.");
    }
  }

  const overview = markdownFiles.find((file) => file.role === "overview");
  const recordedOverviewBudget = readManifestBudget(
    manifest.context_policy?.overview_max_estimated_tokens,
    DEFAULT_OVERVIEW_TOKENS,
    "context_policy.overview_max_estimated_tokens",
    errors,
  );
  const overviewBudget = options["max-overview-tokens"] === undefined
    ? recordedOverviewBudget
    : parsePositiveInteger(options["max-overview-tokens"], recordedOverviewBudget, "max-overview-tokens");
  if (overview) {
    const estimate = estimateTokens(overview.content);
    if (estimate > overviewBudget) {
      errors.push(`Architecture overview is estimated at ${estimate} tokens; budget is ${overviewBudget}.`);
    }
    const requiredHeadings = [
      "System purpose",
      "Context profile",
      "System shape",
      "Dependency and data rules",
      "Adopted practices",
      "Quality gates and operation",
      "Decisions and evolution",
    ];
    try {
      const parsed = parseMarkdown(overview.content);
      const headings = new Set(parsed.headings.map((heading) => heading.title.toLowerCase()));
      for (const heading of requiredHeadings) {
        if (!headings.has(heading.toLowerCase())) errors.push(`Architecture overview is missing heading: ${heading}.`);
      }
    } catch (error) {
      errors.push(`Architecture overview is invalid: ${error.message}`);
    }
  }

  const agentBudget = readManifestBudget(
    manifest.context_policy?.agent_instructions_max_estimated_tokens,
    DEFAULT_AGENT_INSTRUCTIONS_TOKENS,
    "context_policy.agent_instructions_max_estimated_tokens",
    errors,
  );
  const bootstrapBudget = readManifestBudget(
    manifest.context_policy?.bootstrap_max_estimated_tokens,
    DEFAULT_BOOTSTRAP_TOKENS,
    "context_policy.bootstrap_max_estimated_tokens",
    errors,
  );
  const agentEstimate = agent ? estimateTokens(agent.content) : 0;
  const overviewEstimate = overview ? estimateTokens(overview.content) : 0;
  if (agent && agentEstimate > agentBudget) {
    warnings.push(`AGENTS.md is estimated at ${agentEstimate} tokens; its budget is ${agentBudget}.`);
  }
  if (agent && overview && agentEstimate + overviewEstimate > bootstrapBudget) {
    warnings.push(
      `Always-read bootstrap context is estimated at ${agentEstimate + overviewEstimate} tokens; budget is ${bootstrapBudget}.`,
    );
  }

  for (const file of markdownFiles) {
    for (const link of extractRelativeLinks(file.content)) {
      let decoded;
      try {
        decoded = decodeURIComponent(link.split("?", 1)[0]);
      } catch {
        errors.push(`${file.relative} has a malformed encoded link: ${link}.`);
        continue;
      }
      const resolved = path.resolve(path.dirname(file.absolute), decoded);
      const withinTarget = resolved === target || resolved.startsWith(`${target}${path.sep}`);
      if (!withinTarget) {
        errors.push(`${file.relative} has a relative link outside the project: ${link}.`);
      } else if (!(await exists(resolved))) {
        errors.push(`${file.relative} has a missing relative link: ${link}.`);
      } else {
        const canonicalLink = await realpath(resolved).catch(() => null);
        if (!canonicalLink || (canonicalLink !== canonicalTarget && !canonicalLink.startsWith(`${canonicalTarget}${path.sep}`))) {
          errors.push(`${file.relative} has a link resolving outside the project: ${link}.`);
        }
      }
    }
  }

  const templateSources = {
    overview: "templates/architecture-overview.template.md",
    context: "templates/project-context.template.md",
    assessment: "templates/architecture-assessment.template.md",
    technology_stack: "templates/technology-stack.template.md",
    testing_strategy: "templates/testing-strategy.template.md",
    definition_of_done: "templates/definition-of-done.template.md",
  };
  for (const file of markdownFiles.filter((candidate) => Object.hasOwn(templateSources, candidate.role))) {
    const template = await readFile(path.join(PACKAGE_ROOT, templateSources[file.role]), "utf8");
    const sentinels = new Set([...template.matchAll(/\{[^{}\n]+\}/g)].map((match) => match[0]));
    const placeholderCount = [...file.content.matchAll(/\{[^{}\n]+\}/g)].filter((match) => sentinels.has(match[0])).length;
    if (placeholderCount > 0) {
      const message = `${file.relative} has ${placeholderCount} unresolved template placeholder(s).`;
      if (options.strict) errors.push(message);
      else warnings.push(message);
    }
  }

  if (options.strict && warnings.length > 0) {
    errors.push(...warnings.map((warning) => `Strict mode: ${warning}`));
    warnings.length = 0;
  }

  return {
    errors,
    warnings,
    overviewBudget,
    agentBudget,
    bootstrapBudget,
    estimates: { overview: overviewEstimate, agentInstructions: agentEstimate },
    manifest,
  };
}

async function commandInit(catalog, options, positionals, stdout) {
  assertAllowedOptions(options, new Set(["profile", "target", "dry-run"]));
  assertPositionals(positionals, 0, 0, "no positional arguments for init");
  const target = path.resolve(options.target ?? process.cwd());
  await assertTargetDirectory(target);
  const profile = resolveProfile(catalog, options.profile);
  const existingManifestPath = path.join(target, MANIFEST_NAME);
  if (await exists(existingManifestPath)) {
    const existingManifest = await readJson(existingManifestPath);
    if (
      !isRecord(existingManifest) ||
      existingManifest.schema_version !== 1 ||
      existingManifest.blueprint_version !== catalog.blueprint_version ||
      existingManifest.profile !== profile.id
    ) {
      throw new CliError(
        "A different or unsupported architecture pack already exists. Run check and review it; init will not overwrite it.",
      );
    }
    const result = await checkAdoption(target, catalog, {});
    if (result.errors.length > 0) {
      throw new CliError(
        `The existing architecture pack is incomplete or inconsistent (${result.errors[0]}). Run check; init will not overwrite it.`,
      );
    }
    stdout.write(`Architecture pack is already initialized in ${target}; no files changed.\n`);
    return 0;
  }
  const prepared = await prepareInit(catalog, profile, target);

  if (options["dry-run"]) {
    stdout.write(`Dry run: initialize ${target}\n`);
    stdout.write(`Profile: ${profile.id}\n`);
    for (const output of prepared.outputs) stdout.write(`CREATE ${output.destination}\n`);
    stdout.write(`${prepared.agentExisted ? "UPDATE" : "CREATE"} AGENTS.md (managed block only)\n`);
    stdout.write(`CREATE ${MANIFEST_NAME}\n`);
    return 0;
  }

  await performInit(prepared, target);
  stdout.write(`Initialized token-efficient architecture context in ${target}.\n`);
  stdout.write(`Profile: ${profile.id}\n`);
  stdout.write(
    `Next: complete the active documents, then from ${target} run \`${pinnedCommand(catalog)} check --strict\`.\n`,
  );
  return 0;
}

function commandProfiles(catalog, options, positionals, stdout) {
  assertAllowedOptions(options, new Set());
  assertPositionals(positionals, 0, 0, "no positional arguments for profiles");
  for (const [id, profile] of Object.entries(catalog.profiles).sort(([a], [b]) => a.localeCompare(b))) {
    stdout.write(`${id}\t${profile.title}\n`);
  }
  return 0;
}

function commandTopics(catalog, options, positionals, stdout) {
  assertAllowedOptions(options, new Set());
  assertPositionals(positionals, 0, 0, "no positional arguments for topics");
  for (const [id, topic] of Object.entries(catalog.topics).sort(([a], [b]) => a.localeCompare(b))) {
    stdout.write(`${id}\t${topic.aliases.join(", ")}\n`);
  }
  return 0;
}

function commandRoutes(catalog, options, positionals, stdout) {
  assertAllowedOptions(options, new Set());
  assertPositionals(positionals, 0, 0, "no positional arguments for routes");
  for (const [id, route] of Object.entries(catalog.task_routes).sort(([a], [b]) => a.localeCompare(b))) {
    stdout.write(`${id}\t${route.primary_topics.join(", ")}\n`);
  }
  return 0;
}

async function commandRecommend(catalog, options, positionals, stdout) {
  assertAllowedOptions(options, new Set(["target"]));
  assertPositionals(positionals, 1, 1, "one task route for recommend");
  const task = positionals[0].toLowerCase();
  const route = catalog.task_routes[task];
  if (!route) {
    throw new CliError(`Unknown task route. Choose one of: ${Object.keys(catalog.task_routes).sort().join(", ")}.`, 2);
  }
  const target = path.resolve(options.target ?? process.cwd());
  await assertTargetDirectory(target);
  let profile = "not initialized";
  const manifestPath = path.join(target, MANIFEST_NAME);
  if (await exists(manifestPath)) {
    const metadata = await lstat(manifestPath);
    if (metadata.isSymbolicLink() || !metadata.isFile() || metadata.nlink > 1) {
      throw new CliError(`${MANIFEST_NAME} must be a single-link regular file.`);
    }
    const manifest = await readJson(manifestPath);
    if (!isRecord(manifest)) throw new CliError(`${MANIFEST_NAME} must contain a JSON object.`);
    profile = manifest.profile ?? "unknown";
  }
  const command = pinnedCommand(catalog);
  stdout.write(`# Blueprint route: ${task}\n\n`);
  stdout.write(`Project profile: ${profile}. Read the local architecture overview before external guidance.\n\n`);
  stdout.write(`Command prefix: \`${command}\`\n\n`);
  stdout.write(`Primary topics: ${route.primary_topics.map((topic) => `\`${topic}\``).join(", ")}. Load these with \`guide <topic>\`.\n`);
  if (route.related_topics.length > 0) {
    stdout.write(`Related topics (only if affected): ${route.related_topics.map((topic) => `\`${topic}\``).join(", ")}.\n`);
  }
  if (route.checklists.length > 0) {
    stdout.write("Checklists:\n");
    for (const file of route.checklists) stdout.write(`- ${sourceFileUrl(catalog, file)}\n`);
  }
  if (route.templates.length > 0) {
    stdout.write("Templates (copy only when the artifact is needed):\n");
    for (const file of route.templates) stdout.write(`- ${sourceFileUrl(catalog, file)}\n`);
  }
  stdout.write("\nCompact guide output is the default. Do not use `--full` unless project-local decisions and compact sections are insufficient.\n");
  return 0;
}

async function commandGuide(catalog, options, positionals, stdout, stderr) {
  assertAllowedOptions(options, new Set(["max-tokens", "section", "outline", "full"]));
  assertPositionals(positionals, 1, 1, "one topic for guide");
  const modes = [options.section !== undefined, Boolean(options.outline), Boolean(options.full)].filter(Boolean).length;
  if (modes > 1) throw new CliError("Use only one of --section, --outline, or --full.", 2);
  if ((options.full || options.outline) && options["max-tokens"] !== undefined) {
    throw new CliError("--max-tokens is valid only for compact or --section output.", 2);
  }
  const topic = resolveTopic(catalog, positionals[0]);
  const source = await readFile(path.join(PACKAGE_ROOT, topic.file), "utf8");
  const markdown = rewriteRelativeMarkdownLinks(source, topic.file, catalog);
  const parsed = parseMarkdown(markdown);
  const maxTokens = parsePositiveInteger(options["max-tokens"], DEFAULT_GUIDE_TOKENS, "max-tokens");

  if (options.full) {
    stdout.write(markdown.endsWith("\n") ? markdown : `${markdown}\n`);
    stderr.write(`Full guide emitted explicitly: ${topic.file} (~${estimateTokens(markdown)} estimated tokens).\n`);
    return 0;
  }
  if (options.outline) {
    stdout.write(`${parsed.h1}\n\n`);
    for (const heading of parsed.headings.filter((candidate) => candidate.level >= 2)) {
      stdout.write(`${"  ".repeat(heading.level - 2)}- ${heading.title}\n`);
    }
    return 0;
  }
  if (options.section) {
    const section = findSection(parsed, options.section);
    const output = `${parsed.h1}\n\n${section.content}\n`;
    const estimate = estimateTokens(output);
    if (estimate > maxTokens) {
      throw new CliError(
        `Section is ~${estimate} estimated tokens, above ${maxTokens}. Increase --max-tokens explicitly to load it.`,
      );
    }
    stdout.write(output);
    stderr.write(`Section emitted: ${section.title} (~${estimate} estimated tokens).\n`);
    return 0;
  }

  const compact = compactGuide(parsed, topic, catalog, maxTokens);
  stdout.write(compact.output);
  stderr.write(
    `Compact guide emitted: ${compact.selected.join(", ")} (~${compact.estimatedTokens}/${maxTokens} estimated tokens).\n`,
  );
  return 0;
}

async function commandCheck(catalog, options, positionals, stdout) {
  assertAllowedOptions(options, new Set(["target", "strict", "max-overview-tokens"]));
  assertPositionals(positionals, 0, 0, "no positional arguments for check");
  const target = path.resolve(options.target ?? process.cwd());
  await assertTargetDirectory(target);
  const result = await checkAdoption(target, catalog, options);
  stdout.write(`Architecture pack: ${target}\n`);
  stdout.write(`Profile: ${result.manifest.profile}; blueprint: ${result.manifest.blueprint_version}\n`);
  stdout.write(
    `Always-read estimate: ${result.estimates.overview + result.estimates.agentInstructions}/${result.bootstrapBudget} tokens ` +
      `(overview ${result.estimates.overview}/${result.overviewBudget}; AGENTS.md ${result.estimates.agentInstructions}/${result.agentBudget})\n`,
  );
  for (const warning of result.warnings) stdout.write(`WARN ${warning}\n`);
  for (const error of result.errors) stdout.write(`ERROR ${error}\n`);
  stdout.write(`Result: ${result.errors.length} error(s), ${result.warnings.length} warning(s).\n`);
  return result.errors.length > 0 ? 1 : 0;
}

export async function runCli(argv, io = {}) {
  const stdout = io.stdout ?? process.stdout;
  const stderr = io.stderr ?? process.stderr;
  const { command, options, positionals } = parseArguments(argv);
  if (options.help || options.h || command === "help" || command === "--help" || command === "-h") {
    stdout.write(HELP);
    return 0;
  }

  const catalog = await loadCatalog();
  if (options.version || options.v || command === "--version" || command === "-v") {
    stdout.write(`${catalog.blueprint_version}\n`);
    return 0;
  }
  switch (command) {
    case "init":
      return commandInit(catalog, options, positionals, stdout);
    case "profiles":
      return commandProfiles(catalog, options, positionals, stdout);
    case "topics":
      return commandTopics(catalog, options, positionals, stdout);
    case "routes":
      return commandRoutes(catalog, options, positionals, stdout);
    case "recommend":
      return commandRecommend(catalog, options, positionals, stdout);
    case "guide":
      return commandGuide(catalog, options, positionals, stdout, stderr);
    case "check":
      return commandCheck(catalog, options, positionals, stdout);
    default:
      throw new CliError(`Unknown command "${command}". Use --help for usage.`, 2);
  }
}

export const internals = {
  estimateTokens,
  extractRelativeLinks,
  parseMarkdown,
  replaceManagedBlock,
  rewriteRelativeMarkdownLinks,
};
