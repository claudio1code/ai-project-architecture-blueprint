# Architecture Health Checklist

Run on a meaningful trigger—repeated incidents, material scale/team change, new regulation, or recurring delivery friction—not as ceremony on a fixed cadence alone.

- [ ] Project context, quality targets, traffic, team shape, and constraints still match reality.
- [ ] Module/service boundaries follow current ownership and change patterns.
- [ ] Important rules, schemas, contracts, and design tokens each have one authoritative source.
- [ ] Repeated defects reveal no missing invariant, authorization check, or state model.
- [ ] Dependencies and abstractions still earn their maintenance cost.
- [ ] Conditional/advanced practices have evidence; unused guidance has been removed.
- [ ] Coupling, build/test time, deployment coordination, and incident recovery remain acceptable.
- [ ] Data ownership, migrations, retention, backups, restore, and tenant isolation are verified.
- [ ] Security threats, dependency lifecycle, secrets, permissions, and audit needs were reassessed.
- [ ] Logs, metrics, traces, alerts, SLOs, and retention are proportional to current criticality.
- [ ] Accepted technical debt has an owner, guardrail, and current review trigger.
- [ ] ADRs describe current decisions; superseded records are marked, not rewritten.
- [ ] The next small improvement and its evidence of success are explicit.

Record the outcome using [architecture review guidance](../docs/17-architecture-review.md), changing the architecture only when evidence justifies the cost.
