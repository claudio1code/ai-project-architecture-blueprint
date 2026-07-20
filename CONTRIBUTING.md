# Contributing

Contributions should make the blueprint more useful without turning contextual recommendations into universal requirements.

## Accepted scope

- decision criteria grounded in observable problems;
- reusable templates, profiles, and examples;
- consistency, accessibility, security, and link corrections;
- missing trade-offs or evolution signals;
- reduced duplication between documents;
- changes to the zero-dependency adoption CLI, catalog, or validation workflow that make blueprint adoption safer, smaller, or more repeatable.

Application runtime, generated application code, infrastructure, unrelated developer tooling, personal stack preferences, and patterns without context are outside this repository's scope. Executable code is limited to adoption and blueprint validation; new runtime dependencies require a demonstrated need, maintenance and supply-chain analysis, and explicit justification.

## Process

1. Identify the document that owns the concept; avoid repeating the rule in several files.
2. For a recommendation or practice change, describe the observed problem and at least two contrasting contexts.
3. For a recommendation or practice change, classify it as `Essential`, `Conditional`, `Advanced`, or `Not applicable`.
4. For a recommendation or practice change, explain its benefit, cost, simpler alternative, and reassessment trigger.
5. Update affected links, examples, profiles, and the changelog.
6. Check for empty files, broken relative links, and inconsistent terminology.
7. For CLI or catalog changes, preserve backward-compatible command behavior when possible, update command documentation, run `node --test`, exercise the affected command from a temporary target directory, and keep the Node.js 22/24 validation matrix passing.

## Editorial quality

Use clear English, direct sentences, and concrete examples. Use tables only when they make a comparison easier. Explicitly distinguish rules, recommendations, examples, and decisions. Avoid promotional language, emoji, and claims of universality.

## Pull requests

The description should state motivation, scope, changed decisions, compatibility, validation, and risks. Use the [pull request checklist](templates/pull-request-checklist.template.md) and confirm that profiles still produce meaningfully different recommendations. For CLI changes, also report file-write behavior, token-budget impact, dependency or lifecycle-script changes, and validation on the supported Node.js version.

## Versioning

Determine the release level using the canonical policy in [Evolving the blueprint](README.md#evolving-the-blueprint), then record relevant changes in [CHANGELOG.md](CHANGELOG.md). Keep commits focused and describe the result rather than only the file changed.
