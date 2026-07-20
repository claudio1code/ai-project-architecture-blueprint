# Profile: Automation Script

Use this profile for one narrow operational task: convert files, synchronize data, generate a report, run maintenance, or connect two tools. The goal is a repeatable and safe routine, not a prematurely generalized platform.

Describe inputs, effects, and recovery in the [project context](../templates/project-context.template.md). If commands and users multiply, compare the [CLI application](cli-application.md) profile.

## Characteristics

- A manual, scheduled, or CI trigger.
- One main flow with a clear beginning, end, and verifiable result.
- Few integrations and a small maintaining team.
- Short or batch execution without continuous availability.
- Detectable failures and possible repeated execution.

## Recommended initial architecture

Start with one entry point and small functions to load configuration, validate, transform, and apply effects. Separate pure transformations from I/O where that makes behavior testable. Do not create empty layers.

```text
automation/
├── run.*
├── config.*
├── transform.*
└── adapters.*          # only with multiple meaningful boundaries
tests/
└── fixtures/
```

For a few dozen lines, one well-structured and tested file is acceptable.

## Practice selection

### Essential

- Inputs and preconditions validated before effects.
- Configuration outside code and secrets obtained from an appropriate source.
- Non-zero status on failure and a concise processing summary.
- Logs that identify the failed item without exposing sensitive data.
- Timeouts for network and child processes.
- Explicit policy for partial execution, retry, and cleanup.
- Pinned dependencies and reproducible execution instructions.
- A documented owner and invocation/recovery procedure.

### Conditional

- Dry-run for deletion, production writes, or large batches.
- Idempotency and deduplication when a scheduler may repeat work.
- Retry with backoff only for transient failures.
- Locking to prevent conflicting runs.
- Checkpoints when restarting the whole batch is expensive.

### Advanced

- Managed queue/worker when volume, duration, and parallelism outgrow one job.

### Not applicable

Unless a new requirement changes the assessment, the following practices are usually unnecessary:

- Frontend, component library, or Design System.
- Controller, Service Layer, and Repository Pattern.
- A dedicated database for a stateless flow.
- Microservices, DDD, CQRS, Event Sourcing, and API Gateway.
- Distributed tracing for one short integration.

## Minimum testing strategy

- Transformation and validation tests with representative fixtures.
- Happy-path flow in an isolated environment.
- Invalid-input, timeout, and dependency-failure tests.
- Repeat-execution test when the operation claims idempotency.
- Safe-mode or sandbox execution before production.
- Lint plus execution of the exact command used by the scheduler.

## Common risks

- Continuing after failure and reporting partial output as success.
- Retrying permanent errors or non-idempotent effects.
- Hard-coded tokens or secrets exposed in command arguments.
- Assuming format, timezone, encoding, or ordering without validation.
- Unbounded batches, memory, or external calls.
- No owner after the script becomes operationally critical.

## Evolution signals

Move to a CLI when several commands, users, and output contracts appear. Move to a job/worker when persistent retries, controlled concurrency, reliable scheduling, or long runtimes are needed. Add persistence only when checkpoints, history, or deduplication require durable state.
