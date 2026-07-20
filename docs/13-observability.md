# 13 — Observability

## Purpose and applicability

Observability provides evidence to detect, understand, and respond to behavior in a running system. Its depth should follow criticality, distribution, traffic, and operational ownership.

- **Essential for a deployed service:** actionable error reporting, safe structured logs, and a basic availability signal.
- **Conditional:** metrics, dashboards, alerting, tracing, audit trails, and explicit retention as system risk grows.
- **Advanced:** service-level objectives, distributed tracing at scale, exemplars, or automated burn-rate alerting for critical/distributed services.
- **Not applicable:** a local one-shot script may need only clear exit status and stderr; remove service dashboards and tracing when they have no operational consumer.

Observability is not “collect everything.” Every signal has ingestion, storage, privacy, query, maintenance, and on-call costs.

## Begin with operational questions

Identify the questions operators must answer:

- Is the service available to its users?
- Which critical journey is failing or slow?
- When did the change begin and which release/configuration correlates with it?
- Which dependency, tenant, queue, or operation is affected?
- Is data correctness or only presentation impacted?
- Can the issue be mitigated, rolled back, or replayed safely?

Collect signals that answer these questions. A dashboard with no decision attached is decoration.

## Structured logs

Logs should be machine-queryable events with stable fields. A useful application event may include:

```json
{
  "timestamp": "2026-07-20T12:34:56Z",
  "level": "error",
  "service": "orders-api",
  "environment": "production",
  "event": "order_creation_failed",
  "correlation_id": "01J2...",
  "trace_id": "...",
  "operation": "create_order",
  "error_code": "PAYMENT_TIMEOUT",
  "release": "1.4.2"
}
```

Guidelines:

- use stable event names and fields rather than embedding everything in prose;
- use severity consistently: debug for temporary detail, info for meaningful lifecycle events, warn for degraded/recoverable conditions, error for failed outcomes requiring attention;
- log once at the boundary that can add context or act; avoid repeating the same exception at every layer;
- include outcome, duration, dependency, retry count, and identifiers needed for diagnosis;
- never log passwords, session/token values, secret headers, private keys, or unneeded personal payloads;
- bound field size and cardinality;
- make production log level configurable without rebuilding.

Verbose success logs can cost more than they reveal. Sample high-volume diagnostic events or use metrics when individual records are not needed.

## Technical log versus audit trail

These have different purposes and guarantees:

| Aspect | Technical log | Audit trail |
| --- | --- | --- |
| Primary question | Why did the software behave this way? | Who performed which relevant action, when, and on what? |
| Audience | Engineering/operations | Security, compliance, support, or business control |
| Content | Errors, timing, dependency and runtime context | Actor, action, target, outcome, reason/context as required |
| Mutability | Operational retention; may be sampled | Stronger integrity and restricted access may be required |
| Retention | Diagnostic window | Legal/business policy |

Do not rely on application debug logs as an audit trail. Do not place entire before/after payloads in audit merely “for completeness.” Minimize sensitive data and define authorized access. See [security](11-security.md) and [data and persistence](08-data-and-persistence.md).

## Metrics

Prefer metrics connected to service behavior:

- request rate, error rate, and latency distributions;
- job throughput, failure, retry, age, and queue depth;
- dependency latency/error/timeout;
- resource saturation where it predicts user impact;
- domain outcomes such as successful checkouts or rejected approvals, with privacy-safe dimensions.

Use counters for totals, gauges for current state, and histograms for distributions. Averages hide tail latency; use percentiles for user experience. Never use user ID, request ID, raw URL, email, or unbounded error text as metric labels. High cardinality can make the system expensive or unusable.

Metric names, units, labels, and ownership are contracts. Define them near instrumentation and review changes.

## Tracing and correlation

A correlation ID connects related logs and can be useful in any request/job flow. Generate or validate it at ingress, return it to callers where useful, and propagate it across HTTP, messages, jobs, and events. It is not globally unique proof of identity and must not authorize anything.

Distributed tracing is **Conditional** when a request crosses several services or asynchronous boundaries and logs cannot explain latency. Capture spans around meaningful operations and dependencies, propagate context through supported standards, and mark errors accurately.

Tracing adds instrumentation, storage, sampling, and privacy cost. A monolith with clear structured logs and metrics may not need it. Sampling must preserve enough errors/slow traces for diagnosis without assuming every request is retained.

## Health checks

Separate signals where the platform supports them:

- **liveness:** the process is irrecoverably stuck and should restart;
- **readiness:** this instance can accept traffic;
- **startup:** initialization is still legitimately in progress.

Keep liveness shallow; tying it to a transient database failure can restart every instance and amplify an outage. Readiness may include essential dependencies, but decide whether removing all capacity helps. A public health response must not expose versions, topology, secrets, or internal diagnostics.

A static site may need only an external synthetic check. A worker needs progress/heartbeat and backlog signals rather than an HTTP endpoint merely for convention.

## Error tracking

Centralized error tracking is **Conditional** when production failures need grouping, release correlation, and triage. Capture handled errors only when they represent an actionable failed outcome; expected validation errors usually belong in metrics rather than exception alerts.

Configure source maps/symbols securely, scrub payloads, attach release and environment, group by stable cause, and assign ownership. An untriaged stream of duplicate exceptions is not observability.

## Dashboards

Create the smallest dashboard that supports an operational decision. A service overview commonly includes:

- traffic and success/error rate;
- latency percentiles;
- saturation/capacity indicators;
- dependency health;
- backlog or freshness for asynchronous work;
- current release and recent deployments;
- SLI/SLO status when defined.

Feature or business dashboards may have different owners and retention. Document data freshness and definitions so metrics are not misinterpreted.

## Alerts

Alert on actionable user impact or imminent exhaustion, not every abnormal datapoint.

Each page/notification must include:

- condition and affected scope;
- severity and expected response time;
- runbook/dashboard links;
- owner/escalation;
- safe context such as release and correlation/trace examples;
- resolution or suppression criteria.

Tune thresholds with observed baselines. Deduplicate correlated symptoms. A warning without an owner can be a dashboard instead. Test the alert path and remove alerts that never drive action.

## SLI, SLO, and SLA

- **SLI:** measured indicator, such as the proportion of valid requests completed successfully within a latency threshold.
- **SLO:** internal target for an SLI over a window.
- **SLA:** external commitment, often contractual, with consequences.

SLOs are **Conditional** and most valuable for user-critical services with operational ownership. Define what counts as valid traffic, success, and excluded maintenance. Prefer a small number of user-oriented indicators over dozens of infrastructure targets.

An SLO creates prioritization and on-call obligations. Do not promise an SLA by copying an internal SLO. Advanced multi-window burn-rate alerts are justified when a critical service has a meaningful error budget and a team able to respond.

## Retention and access

Define separate retention for logs, metrics, traces, error payloads, and audit records based on diagnostic need, legal duty, privacy, and cost.

- minimize and redact before collection rather than relying only on later deletion;
- limit access by role and record access to sensitive audit data where needed;
- encrypt in transit and at rest;
- define deletion for personal data and tenant offboarding;
- account for exports, archives, backups, and vendor processors;
- verify retention rules actually execute.

Longer retention is not inherently better. It increases exposure and cost.

## Minimum profiles

| Context | Useful minimum | Add when signaled |
| --- | --- | --- |
| Local CLI/script | Exit codes, stderr, concise operation summary | Structured file/log output and run ID for scheduled executions. |
| Static frontend | Deployment status and external availability/error reporting | Client error tracking and web-vital metrics for meaningful traffic. |
| Small API | Structured request/error logs, correlation ID, uptime/health, basic latency/error metrics | Alerts and dependency metrics when support becomes operational. |
| Critical/distributed system | Structured signals, tracing, SLI/SLO, tested alerts/runbooks, audit where needed | Advanced sampling, burn-rate alerts, cross-region views as scale requires. |

These are starting points, not fixed tiers.

## Review checklist

- [ ] Do collected signals answer named operational questions?
- [ ] Are logs structured, bounded, correlated, and free of sensitive data?
- [ ] Are technical logs and audit trails intentionally separate?
- [ ] Do metrics represent rate, errors, latency, saturation, and critical outcomes without high-cardinality labels?
- [ ] Is correlation propagated through requests, jobs, and events?
- [ ] Is tracing used only where cross-boundary diagnosis warrants its cost?
- [ ] Do health checks reflect liveness/readiness without causing cascading restarts?
- [ ] Are dashboards decision-oriented and definitions documented?
- [ ] Are alerts actionable, owned, tested, and linked to a response path?
- [ ] If SLO/SLA terms are used, are their measurements and obligations explicit?
- [ ] Are retention, access, privacy, and telemetry costs controlled?
