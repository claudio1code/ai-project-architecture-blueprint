# Changelog

All notable changes to this blueprint will be recorded here. Release-level criteria are defined in [Evolving the blueprint](README.md#evolving-the-blueprint) and follow [Semantic Versioning](https://semver.org/).

## 0.2.0 - 2026-07-20

### Added

- zero-dependency Node.js adoption CLI with profile and topic discovery, compact project initialization, task routing, on-demand guides, and active-pack validation;
- machine-readable catalog for profiles, topics, compact sections, and task routes;
- compact managed `AGENTS.md` block and decision-index asset for adopted projects;
- token-efficient adoption model that separates project-owned active context from on-demand reference guidance;
- approximate token budgets, strict placeholder checks, conservative collision handling, and deterministic adoption metadata.
- Node.js 22/24 validation for the test suite and packed release contents, with external actions pinned by commit SHA.

### Changed

- made CLI-based active-pack initialization the primary adoption path while retaining manual template adoption as a fallback;
- narrowed the repository's executable scope to adoption and blueprint validation without adding application runtime, infrastructure, or runtime dependencies;
- updated AI-assisted workflow guidance to use read-first local context and compact, routed reference sections.

## 0.1.0 - 2026-07-20

### Added

- multidimensional project classification method;
- contextual architecture selection matrix;
- engineering, structure, domain, backend, API, data, frontend, Design System, security, testing, observability, delivery, and AI guidance;
- nine differentiated starting profiles;
- context, architecture overview, decision, strategy, and contract templates;
- completed examples for three contexts and one ADR;
- operational checklists for project start, feature start, code review, release, and architecture health;
- operational instructions for AI agents;
- MIT license and contribution process.
