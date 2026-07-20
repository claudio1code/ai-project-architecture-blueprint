# 10 — Design System

## Purpose and applicability

A design system coordinates product design and implementation at scale. It is a product with governance, not merely a folder of components.

- **Essential for any visual UI:** a small set of consistent visual decisions and accessible controls.
- **Conditional:** shared semantic tokens and reusable components when screens or contributors repeat decisions.
- **Advanced:** a versioned, documented design system with dedicated ownership when several products or teams need coordinated evolution.
- **Not applicable:** remove this document for a backend, CLI, library without UI, or automation script.

Do not build a complete design system to launch one small interface. Start with the smallest rung that removes real inconsistency.

## Distinguish the concepts

| Concept | What it governs | It is not |
| --- | --- | --- |
| Design system | Principles, assets, components, documentation, contribution, and governance | A component package alone. |
| Design tokens | Named design decisions represented as data | Arbitrary constants or utility classes. |
| Component library | Reusable implemented UI components | The full design language and operating model. |
| Style guide | Guidance for visual and content usage | Necessarily executable code. |
| Theme | A selected mapping of visual values, such as brand or dark mode | An independent design system by default. |
| CSS architecture | Rules for scope, cascade, layering, naming, and delivery | Product semantics or component governance. |

These can exist independently. A project may use a theme and ten shared components without claiming a full design system.

## Select the minimum viable level

| Context | Recommended starting point | Avoid |
| --- | --- | --- |
| One small, short-lived UI | A few CSS variables and accessible local components | Governance, package publishing, and exhaustive catalogs. |
| Growing application with repeated screens | Semantic tokens plus a small shared component library | Copying controls per feature or abstracting every layout. |
| Several products with one brand and interaction language | Versioned library, documentation, contribution rules, and owners | Uncoordinated breaking changes. |
| Products with genuinely different brands or platforms | Shared foundations plus explicit themes/platform variants | One universal API with dozens of conditional switches. |

Signals for a full system include repeated accessibility defects, several teams implementing the same patterns, brand changes requiring scattered edits, or incompatible product libraries. Costs include ownership, design/engineering coordination, release management, migration, documentation, visual regression, and slower one-off changes.

Record system-wide choices in an [ADR](adr/README.md) and align frontend ownership with [frontend architecture](09-frontend-architecture.md).

## Design tokens

Tokens should express intent where possible. Keep raw palette or scale values as implementation foundations, then expose semantic aliases to product code.

Prefer:

```text
color.text.danger
```

over:

```text
color.red.500
```

The semantic name survives a palette change and states the role. A primitive such as `palette.red.500` can still exist internally as the value referenced by `color.text.danger`.

### Token categories

| Category | Examples of intent | Decision to document |
| --- | --- | --- |
| Colors | `color.text.primary`, `color.surface.warning`, `color.border.focus` | Contrast, interaction states, themes, and forced-colors behavior. |
| Typography | `font.body.family`, `font.heading.lg`, `line-height.compact` | Loading, fallback, readable measures, and user scaling. |
| Spacing | `space.inline.sm`, `space.section.lg` | Base scale and exceptions; avoid a token for every observed pixel. |
| Dimensions | `size.control.md`, `size.content.max` | Content constraints and target sizes. |
| Borders | `border.control.default`, `border.focus.width` | State meaning and high-contrast behavior. |
| Radii | `radius.control`, `radius.container` | A bounded visual vocabulary. |
| Shadows | `shadow.overlay`, `shadow.focus` | Elevation intent; never use shadow as the only boundary. |
| Breakpoints | `breakpoint.content.wide` | Content-driven transitions, not device brands. |
| Transitions | `motion.duration.fast`, `motion.easing.enter` | Reduced-motion alternatives and performance. |
| Z-index | `layer.dropdown`, `layer.modal`, `layer.toast` | A small ordered layer scale, not arbitrary large numbers. |

Separate global semantic tokens from component tokens only when it makes overrides clearer. Deep alias graphs make debugging hard. Validate generated outputs, keep names stable, and provide a migration when removing a token.

### Themes

A theme maps the same semantic roles to different values. It should not fork component behavior unless the products truly differ. Test contrast and states in every supported theme. Do not derive critical meaning exclusively from light/dark color differences.

## Component library

Build a shared component when interaction, accessibility, and appearance are repeated with the same semantics. A shared component must have a bounded API, documented states, ownership, and a way to test its public behavior.

| Component | Include when | Important contract questions |
| --- | --- | --- |
| Button | Actions repeat across screens | Intent, size, pending/disabled behavior, icon labeling, link versus button. |
| Input | Text entry is common | Label, description, error association, format, controlled/uncontrolled use. |
| Select | A bounded choice is needed | Native versus custom, keyboard search, large lists, async options. |
| Modal | Blocking dialog behavior repeats | Focus trap/return, close policy, responsive layout, destructive confirmation. |
| Table | Tabular comparison is real | Header semantics, sorting, empty state, overflow, responsive alternative. |
| Badge | Compact status/category is repeated | Semantic intent, readable text, color-independent meaning. |
| Alert | Contextual feedback repeats | Severity, live announcement, dismissal, persistent versus transient use. |
| Tooltip | Supplemental nonessential help is needed | Keyboard/focus/touch access; never hide required information in it. |
| Card | A repeated visual grouping has stable structure | Composition slots rather than domain-specific boolean props. |
| Pagination | Server or client collections require navigation | Current/total semantics, URL state, keyboard labels, unknown totals. |

Do not create all of these preemptively. Each component is **Conditional** on actual repeated use. Prefer native platform elements when they provide the required behavior. A custom select or modal carries significant keyboard, focus, touch, and assistive-technology responsibilities.

### Component API design

- model a small set of valid variants rather than boolean combinations;
- use composition or slots for content and layout;
- preserve semantic HTML and allow accessible names/descriptions;
- define default, hover, focus, active, disabled, pending, empty, and error states as relevant;
- do not expose internal styling details as a permanent contract without need;
- separate domain components from domain-neutral primitives;
- support escape hatches only when their compatibility cost is accepted.

An `InvoiceApprovalCard` belongs to the billing feature even if it uses shared `Card`, `Badge`, and `Button` primitives. Visual resemblance is not proof of shared business responsibility.

## CSS architecture

Choose one explicit model for scope and cascade: component-scoped styles, CSS Modules, utility classes, or a documented layering convention can all work. The choice should answer:

- where global resets and typography live;
- how component styles are scoped;
- how tokens are consumed;
- how variants and states are represented;
- how consumer overrides work, if allowed;
- how dead CSS and ordering regressions are detected.

Do not mix several conventions without boundaries. A utility framework may speed composition but does not replace semantic tokens or accessible components. CSS-in-JS can colocate variants but may add runtime, server-rendering, and tooling costs. Decide from project constraints.

## Quality and governance

For every shared component or token change:

- test keyboard, focus, accessible name/role/state, zoom, and contrast as relevant;
- test supported viewports and themes;
- cover public behavior with component tests and use visual regression only where it provides signal;
- document intended use, non-use, variants, and migration notes;
- classify breaking changes and publish versions if external consumers exist;
- identify an owner and contribution/review path;
- measure adoption before deleting old APIs.

Snapshotting every rendering produces noise; target meaningful states. A showcase or component explorer is **Conditional** when it improves review and discovery, not a requirement for a tiny project. See [testing](12-testing.md) and [documentation](15-documentation.md).

## Signs of under- and over-engineering

Under-engineering signals:

- the same control behaves differently across flows;
- accessibility defects recur in copied implementations;
- brand or spacing changes require many unrelated edits;
- teams cannot discover an approved component.

Over-engineering signals:

- more time is spent maintaining unused variants than shipping product behavior;
- wrappers only rename underlying properties;
- a component accepts domain-specific flags from unrelated features;
- releases require coordination even though there is one consumer in one repository;
- tokens encode every one-off value and obscure the actual CSS.

Respond by changing one level at a time: local implementation → tokens/few shared primitives → library → governed system.

## Review checklist

- [ ] Does the project need a full design system, a small library, only tokens, or none?
- [ ] Do tokens represent semantic intent and cover supported themes/states?
- [ ] Are color, type, spacing, dimensions, borders, radii, shadows, breakpoints, motion, and layers addressed only as needed?
- [ ] Does each shared component have repeated semantics and a bounded API?
- [ ] Are native controls preferred when custom behavior adds no value?
- [ ] Are domain-specific components kept in their domain?
- [ ] Are accessibility and responsive behavior part of component acceptance?
- [ ] Are ownership, documentation, compatibility, and migration proportional to the number of consumers?
