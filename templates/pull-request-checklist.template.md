# Pull Request Checklist

## Purpose

- **Problem and outcome:** `{what changes for whom}`
- **Scope and deliberate exclusions:** `{...}`
- **Related requirement/issue/ADR:** `{links}`
- **Assumptions:** `{none or explicit list}`

## Author checks

- [ ] I inspected and reused the authoritative rule, contract, type, and component where available.
- [ ] The change is the smallest coherent solution and contains no unrelated refactor.
- [ ] Compatibility and impacts on UI, API, data, security, operations, and tests are described below.
- [ ] Error paths, authorization, tenant isolation, and sensitive data were reviewed where applicable.
- [ ] Tests cover changed behavior and critical risk, not only implementation details.
- [ ] Format, lint, type checks, build, and applicable tests pass.
- [ ] Migrations, rollout, rollback, monitoring, and documentation are ready or explicitly N/A.
- [ ] I reviewed the complete diff for secrets, generated artifacts, dead code, and accidental changes.

## Impact and evidence

| Area | Impact or `N/A` with reason | Validation/evidence |
| --- | --- | --- |
| Public behavior/contracts | `{...}` | `{...}` |
| Data/migrations | `{...}` | `{...}` |
| Security/privacy | `{...}` | `{...}` |
| Performance/reliability | `{...}` | `{...}` |
| Deployment/rollback | `{...}` | `{...}` |
| Documentation | `{...}` | `{...}` |

## Reviewer focus

`{specific uncertainty, trade-off, or risky area where review is most valuable}`
