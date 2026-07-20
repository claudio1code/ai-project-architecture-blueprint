# Profile: CLI Application

Use this profile for terminal tools run by people, CI pipelines, or other programs. Commands, arguments, output, exit codes, and filesystem effects form a public interface and need compatibility discipline similar to an API.

Document behavior in the [project context](../templates/project-context.template.md) and apply the [testing strategy](../templates/testing-strategy.template.md) to the real execution environment.

## Characteristics

- On-demand execution, locally or in automation.
- Input from arguments, `stdin`, files, environment, or APIs.
- Human-readable or structured output on `stdout`.
- Diagnostics on `stderr` with predictable exit codes.
- Relevant installation, portability, and startup-time concerns.
- Persistent state usually limited to files or an external service.

## Recommended initial architecture

Separate command parsing/presentation, the primary operation, and side-effecting adapters. Functions are enough for a few commands; a plugin system or command bus is unjustified without actual extensibility needs.

```text
src/
├── cli/                 # parser, help, output formatting
├── commands/            # operations by command
├── adapters/            # files, processes, APIs
├── config/
└── errors/
tests/
fixtures/
```

A single-command CLI can start with `main` and extract pure functions as testing or reuse requires.

## Practice selection

### Essential

- Concise help, examples, and actionable errors.
- Documented, stable exit codes.
- Separation of `stdout` and `stderr`, with structured output for automation when needed.
- Validation before destructive effects and confirmation in interactive use.
- Explicit precedence among flags, environment, and configuration files.
- No secrets in logged arguments or messages.
- Deterministic behavior and interruption handling.
- Compatibility notes for commands used by scripts.

### Conditional

- `--dry-run` for destructive or bulk changes.
- Idempotency for commands retried by CI or a scheduler.
- JSON/NDJSON output for machine consumers.
- Checkpoints and resume for long operations.
- Local locking when executions can conflict.

### Advanced

- Plugins only when third parties must extend the CLI without changing its core.

### Not applicable

Unless a new requirement changes the assessment, the following practices are usually unnecessary:

- HTTP server, frontend, or Design System.
- Embedded relational database for simple configuration.
- Repository Pattern for reading one file.
- Tactical DDD, microservices, API Gateway, CQRS, and Event Sourcing.
- Distributed tracing for a short local execution.

## Minimum testing strategy

- Unit tests for transformations and validation.
- Process-level tests for arguments, output streams, errors, and exit codes.
- Small fixtures for supported file formats.
- Tests in temporary directories for filesystem effects.
- API failure, permission denied, and interruption tests for critical commands.
- Smoke test of the installed package or binary, not only source execution.

## Common risks

- Printing diagnostics on `stdout` and breaking pipelines.
- Silently changing a flag, format, or exit code.
- Partially executing a destructive operation before validating all input.
- Relying on current directory, locale, or shell without documentation.
- Leaving child processes or temporary files after failure.
- Catching every exception and returning success.

## Evolution signals

Extract adapters when multiple commands use the same effect under different policies. Add persistent state only when history, resumption, or local querying justifies it. If the tool must handle concurrent requests continuously, evaluate an API or worker rather than hiding a server inside the CLI.
