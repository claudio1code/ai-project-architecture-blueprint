# Profile: Static Frontend

Use this profile for landing pages, documentation, portfolios, and institutional sites whose content can be delivered as static files. A form submitted to an external service does not, by itself, make the project a full-stack application.

Before adopting it, complete the [architecture assessment](../templates/architecture-assessment.template.md) and review the [frontend architecture guidance](../docs/09-frontend-architecture.md).

## Characteristics

- Public, predominantly read-only content.
- Local interactions and little shared state.
- Build-time generation or direct browser rendering.
- No first-party database or authentication.
- Delivery through a CDN or static-file host.
- SEO, accessibility, and performance may be primary requirements.

If the project has user sessions, authorization, private data, or transactional flows, evaluate the [frontend application](frontend-application.md) or [full-stack application](fullstack-application.md) profile.

## Recommended initial architecture

Start with pages and presentation components, separating content only when it has its own editorial lifecycle. Prefer static generation when content is known at build time. Add client-side JavaScript only for interactions that require it.

```text
src/
├── pages/
├── components/
├── content/
├── styles/
└── assets/
public/
tests/
```

For one small page, `index.html`, `styles.css`, and `main.js` may be a better structure than a component tree.

## Practice selection

### Essential

- Semantic HTML, keyboard navigation, sufficient contrast, and alternative text.
- Responsive layout and an explicit performance budget.
- Metadata, titles, canonical URLs, and sitemap when public discovery matters.
- Optimized images, fonts, and render-blocking resources.
- Explicit failure handling for forms and external integrations.
- Linting/formatting and a reproducible build.
- Cache rules that allow HTML updates without stale asset references.

### Conditional

- Shared components after repeated visual behavior is demonstrated.
- A CMS when non-technical editors publish frequently.
- Localization, cookie consent, analytics, and visual regression tests.
- Design tokens for consistency across several pages.

### Advanced

- A versioned component library only when other products consume it.

### Not applicable

Unless a new requirement changes the assessment, the following practices are usually unnecessary:

- Backend, database, and Repository Pattern.
- Tactical DDD, Clean Architecture, CQRS, or Event Sourcing.
- Queues, messaging, microservices, API Gateway, and Kubernetes.
- A complete Design System for one isolated campaign page.

Mark unnecessary items `Not applicable` and remove their copied sections from project documentation.

## Minimum testing strategy

- Complete production build in CI.
- Automated internal-link validation.
- Accessibility checks on primary pages.
- Navigation test for the critical CTA or form.
- Responsive inspection at representative widths.
- Check that artifacts contain no secrets or unintended personal data.

Large snapshots do not replace checks for semantics, navigation, and content.

## Common risks

- Adding a framework and hydration to content that does not need them.
- Degrading accessibility by rebuilding native controls.
- Shipping oversized images or unbudgeted third-party scripts.
- Coupling editorial content to code without a need.
- Treating browser validation as protection for an external integration.
- Publishing keys, private URLs, or sensitive source maps in the bundle.

## Evolution signals

Reassess this profile when authentication, per-user personalization, private content, real-time editing, transactional rules, or significant dynamic data appear. A CMS does not necessarily require a custom backend; authorization over private resources does require a trusted component outside the browser.
