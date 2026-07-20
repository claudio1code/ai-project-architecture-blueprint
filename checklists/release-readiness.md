# Release Readiness Checklist

Apply only controls relevant to the release and record evidence for high-risk changes.

- [ ] Build, formatting, lint, type checks, and required test suites pass.
- [ ] Release artifact/version is identifiable, reproducible where required, and dependency-scanned.
- [ ] Configuration is validated per environment and no secret is embedded in the artifact.
- [ ] Compatible migrations and representative data checks completed in the intended order.
- [ ] Backup/restore requirements are met and recovery evidence is current.
- [ ] Rollout, feature flag, rollback, and irreversible-step decisions are explicit.
- [ ] Health checks, dashboards, alerts, error tracking, and audit events are ready where applicable.
- [ ] Capacity and rate/resource limits cover the expected launch profile.
- [ ] Security, privacy, accessibility, and regulatory approvals are complete where required.
- [ ] Owners can observe the release and respond during the defined support window.
- [ ] Consumers, support, and stakeholders received necessary compatibility or behavior communication.
- [ ] Post-release success and guardrail measures have an owner and review time.
