# Implementation Plan: disputable.io

**Branch**: `001-better-dispute-app` | **Date**: 2026-04-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-better-dispute-app/spec.md`

## Summary

disputable.io is a browser-only, plain vanilla JavaScript SPA that uses GitHub Issues as an append-only database and GitHub OAuth (Device Flow for v1) for identity. Users compose Assertions, issue Challenges (Interrogatory Y/N or Objection), and engage in structured 1v1 turn-based Disputes. All state lives in a single shared GitHub repository. The architecture is strict MVC: all permission logic in the Controller, dumb rendering in the View, GitHub API entities mapped directly in the Model.

## Technical Context

**Language/Version**: Vanilla JavaScript ES2022+ (no transpilation), HTML5, CSS3  
**Primary Dependencies**: GitHub REST API v3 only — zero external JS libraries or frameworks  
**Storage**: GitHub Issues (append-only) in one shared app-owned repo; ETag-cached in `localStorage`  
**Testing**: Custom micro test-runner (plain JS, no framework — see Constitution Check note)  
**Target Platform**: Modern desktop browsers — Chrome 110+, Firefox 110+, Safari 16+, Edge 110+  
**Project Type**: Static web application (SPA-like, no SSR, deployable to GitHub Pages)  
**Performance Goals**: Home feed first render ≤ 2 s; challenge/answer round-trip ≤ 4 s; LCP ≤ 2.5 s; CLS ≤ 0.1  
**Constraints**: No server (v1); ETag conditional GETs; GitHub API 5 000 req/hr authenticated limit; append-only Issues  
**Scale/Scope**: Multiple concurrent users; shared repo; polling on user action; ~100 active disputes per day (v1)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality | ✅ PASS | MVC enforces SRP by design. Each module has one responsibility. |
| II. Testing Standards | ⚠️ TENSION | Spec forbids external libraries. A **custom micro test-runner** (~50 lines, pure JS) is required to meet the 80/85% coverage gates without violating the no-library constraint. This is documented as a justified trade-off — the micro-runner is part of `tests/` and counts as project code. |
| III. UX Consistency | ✅ PASS | Dark theme, design tokens in CSS custom properties (project's design system), WCAG 2.1 AA target. |
| IV. Performance | ✅ PASS | ETag cache, viewport pre-fetch, LCP/CLS targets encoded in spec SC-004/SC-005. |

**Gate decision**: PASS with one documented tension (Testing Standards). The micro test-runner approach resolves the conflict without violating the no-external-library constraint.

## Project Structure

### Documentation (this feature)

```text
specs/001-better-dispute-app/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── github-issues-schema.md   ← Phase 1 output
└── tasks.md             ← Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── api/
│   ├── github-client.js    # GitHub REST API wrapper (authed + unauthed)
│   ├── cache.js            # localStorage ETag cache layer
│   └── device-auth.js      # GitHub Device Flow OAuth
├── model/
│   ├── person.js           # Person entity + @strawman constant
│   ├── post.js             # Post base + Assertion / Challenge / Answer subtypes
│   ├── dispute.js          # Dispute entity + CricketsConditions
│   └── agreement.js        # Agreement entity
├── controller/
│   ├── app-controller.js   # Top-level routing, auth state, URL param handling
│   ├── home-controller.js  # Home feed logic, canChallenge, canAgree gates
│   └── dispute-controller.js  # Dispute turn logic, canAnswer, canCounterChallenge, canOffer, canDeclareCrickets
├── view/
│   ├── home-view.js        # Home feed render, card click-open, composer slide-up
│   ├── dispute-view.js     # Dispute view, 1-lane / 2-lane layout, lineage header
│   └── components/
│       ├── post-card.js    # Post card (all types), copy URL button, type icon
│       ├── composer.js     # Inline slide-up challenge / answer composer
│       ├── header.js       # App header bar
│       └── notification.js # Toast notification component
├── utils/
│   ├── url.js              # URL param read/write helpers
│   ├── audio.js            # Web Audio API crickets chirp generator
│   └── icons.js            # SVG icon constants (!, ?, ✓, scales, etc.)
└── app.js                  # Entry point — bootstraps controller, renders shell

styles/
└── main.css                # CSS custom properties (design tokens), dark theme

tests/
├── runner.js               # Custom micro test-runner (~50 lines, pure JS)
├── unit/
│   ├── model/              # Person, Post, Dispute, Agreement unit tests
│   └── controller/         # Permission gate unit tests (canChallenge etc.)
├── integration/
│   ├── github-client.test.js  # GitHub API wrapper contract tests (mock fetch)
│   └── cache.test.js          # ETag cache integration tests
└── e2e/
    └── flows/              # Critical user journey scripts

index.html                  # App shell — loads app.js as ES module
```

**Structure Decision**: Single project (web application). No backend directory — all logic is exclusively client-side. The `src/` structure mirrors the MVC layers exactly. `src/api/` is a separate concern (GitHub API adapter) sitting below the model layer.

## Complexity Tracking

| Tension | Why Accepted | Simpler Alternative Rejected Because |
|---------|-------------|--------------------------------------|
| Custom micro test-runner | Constitution II requires 80/85% coverage; spec forbids external libs | No external test framework (Jest, Vitest, etc.) can be used; native browser test APIs lack coverage reporting without tooling |
| Append-only Issues as DB | All state must persist to GitHub; no real DB available | A local-only IndexedDB store would lose data on other devices and violates the shared-dispute model |
| Client-side Crickets deadline enforcement | No server available in v1 for scheduled jobs | GitHub Actions scheduled workflow adds server complexity and 30-60 s latency — unacceptable for a real-time countdown |
