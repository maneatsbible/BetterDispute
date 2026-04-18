# Tasks: disputable.io

**Input**: Design documents from `/specs/001-better-dispute-app/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/github-issues-schema.md ✅ | quickstart.md ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no unresolved dependencies)
- **[Story]**: User story scope — [US1]–[US6]
- Exact file paths included in every task description

---

## Phase 1: Setup

**Purpose**: Project scaffold, configuration, tooling, and GitHub repo labels

- [X] T001 Create project directory structure per plan.md: `src/api/`, `src/model/`, `src/controller/`, `src/view/`, `src/view/components/`, `src/utils/`, `styles/`, `tests/unit/model/`, `tests/unit/controller/`, `tests/integration/`, `tests/e2e/flows/`
- [X] T002 Create `index.html` app shell with `<script type="module" src="src/app.js">` and semantic layout regions (header, main, notification-root) in `index.html`
- [X] T003 [P] Create `src/config.sample.js` with `CONFIG` export shape: `githubClientId`, `dataRepo`, `strawmanLogin`, `appVersion` in `src/config.sample.js`
- [X] T004 [P] Create `styles/main.css` with full CSS custom property design token palette (dark theme) from research.md §7 in `styles/main.css`
- [X] T005 [P] Create `tests/runner.js` custom micro test-runner with `describe`, `it`, `expect`, `beforeEach`, `afterEach` primitives (~50 lines, pure JS) in `tests/runner.js`
- [X] T006 [P] Create `scripts/setup-labels.sh` bash script that uses GitHub CLI (`gh`) to create all `dsp:*` labels defined in `contracts/github-issues-schema.md` in `scripts/setup-labels.sh`
- [X] T007 Add `.gitignore` entries for `src/config.js` and `.env`, and add `node_modules/` entry in `.gitignore`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure shared by all user stories — MUST complete before any story work

**⚠️ CRITICAL**: All user story phases depend on this phase being complete

- [X] T008 Implement `src/utils/url.js` — `getUrlParams()`, `setUrlParams(params)`, `buildCanonicalUrl(postId, disputeId)` helpers using `URLSearchParams`
- [X] T009 [P] Implement `src/utils/icons.js` — exported SVG/unicode icon constants: `ICON_ASSERTION` (`!`), `ICON_CHALLENGE` (`?`), `ICON_ANSWER` (`✓`), `ICON_SCALES`, `ICON_COPY`, `ICON_BACK`, `ICON_HOME`
- [X] T010 [P] Implement `src/utils/audio.js` — `playCricketsChirp()` using Web Audio API oscillator chain (4-5 kHz alternating tones) in `src/utils/audio.js`
- [X] T011 Implement `src/api/cache.js` — `localStorage` ETag cache: `get(url)`, `set(url, etag, data)`, `invalidate(url)`, `invalidatePattern(prefix)` in `src/api/cache.js`
- [X] T012 Implement `src/api/github-client.js` — authenticated/unauthenticated `GET` (with ETag conditional), `POST`, `PATCH` wrappers; `buildBody(meta, content)` helper; `parseBody(issueBody)` that extracts `DSP:META` JSON block in `src/api/github-client.js`
- [X] T013 Implement `src/api/device-auth.js` — full GitHub Device Flow: `startDeviceFlow()`, `pollForToken()`, `getStoredToken()`, `clearToken()`, `getAuthenticatedUser()` in `src/api/device-auth.js`
- [X] T014 [P] Implement `src/model/person.js` — `Person` class with `id`, `name`, `profilePicUrl`, `isStrawman`; `STRAWMAN` constant; `fromGitHubUser(apiObj)` factory in `src/model/person.js`
- [X] T015 [P] Implement `src/model/post.js` — `Post` base class + `Assertion`, `Challenge`, `Answer` subclasses with all fields from data-model.md; `fromIssue(apiObj)` factories in `src/model/post.js`
- [X] T016 [P] Implement `src/model/dispute.js` — `Dispute` class with all fields + `currentTurnPersonId` derivation logic + `status` derivation from labels; `fromIssue(apiObj)` factory in `src/model/dispute.js`
- [X] T017 [P] Implement `src/model/agreement.js` — `Agreement` class; `CricketsConditions` class; `CricketsEvent` class with all fields from data-model.md; `fromIssue(apiObj)` factories in `src/model/agreement.js`
- [X] T018 Implement `src/view/components/header.js` — `renderHeader(version)` function producing the header bar (scales icon, `disputable.io` wordmark, version on far-right) with `data-action="home"` navigation in `src/view/components/header.js`
- [X] T019 [P] Implement `src/view/components/notification.js` — `showNotification(message, type)` toast component (slide-in, auto-dismiss after 4 s) in `src/view/components/notification.js`
- [X] T020 Implement `src/app.js` — bootstrap: load config, init auth state, read URL params, instantiate controllers, render initial view, register `popstate` listener in `src/app.js`

**Checkpoint**: Foundation complete — all models, API client, cache, auth, URL routing, and shell render. User story phases can begin.

---

## Phase 3: User Story 1 — View and Start Assertions (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can view the Home assertion feed and compose/submit a new Assertion (text or image). @strawman posting and canonical URL copy also covered.

**Independent Test**: Open the app, sign in via Device Flow, type an assertion in the composer, submit it, and see a new card appear at the top of the Home feed. Copy its URL and open in a new tab to confirm deep-link renders the card.

- [X] T021 [US1] Implement `src/controller/home-controller.js` — `loadFeed(page)`, `canCompose(person)`, `canPostAsStrawman(person)`, `submitAssertion(person, text, imageUrl, asStrawman)` with `cache.js` ETag integration in `src/controller/home-controller.js`
- [X] T022 [P] [US1] Implement `src/view/components/post-card.js` — `renderPostCard(post, controller, currentUser)` producing a card with type icon, text/image, copy-URL button, disabled-state logic read from controller; "Your turn" badge slot in `src/view/components/post-card.js`
- [X] T023 [P] [US1] Implement `src/view/components/composer.js` — `renderComposer({ placeholder, onSubmit, onCancel, extras })` slide-up inline panel preserving draft text on cancel, image upload input, @strawman toggle slot in `src/view/components/composer.js`
- [X] T024 [US1] Implement `src/view/home-view.js` — `renderHomeView(controller, currentUser)`: renders feed of assertion summary cards (click-anywhere-to-open), "Start a fire 🔥" composer trigger, @strawman toggle, IntersectionObserver pre-fetch hook in `src/view/home-view.js`
- [X] T025 [US1] Wire copy-to-clipboard in `post-card.js`: on copy button click call `navigator.clipboard.writeText(buildCanonicalUrl(...))` and show a brief "Copied!" notification in `src/view/components/post-card.js`
- [X] T026 [US1] Implement terminal card visual state in `home-view.js`: apply `.card--terminal` CSS class (dimmed, `pointer-events: none`) to cards with zero challenges; no text label in `src/view/home-view.js` and `styles/main.css`
- [X] T027 [US1] Add stacked card depth CSS: `.card--depth-1`, `.card--depth-2` with `box-shadow` offset using `--shadow-stack-1` / `--shadow-stack-2` tokens in `styles/main.css`

**Checkpoint**: Home feed renders, users can sign in, compose an Assertion, copy its URL, and deep-link to it. US1 fully independently testable.

---

## Phase 4: User Story 2 — Challenge a Post (Priority: P1)

**Goal**: Any eligible authenticated user can challenge any Post they didn't author (and haven't already challenged), creating a Dispute.

**Independent Test**: Sign in as Person B, view Person A's assertion, tap the Challenge icon, compose an Interrogatory challenge, submit, confirm a Dispute Issue is created in the data repo and Person A sees a "You were challenged" badge.

- [X] T028 [US2] Implement `canChallenge(person, post)` gate in `src/controller/home-controller.js`: check authorship, existing challenge, existing agreement; return `{ allowed: bool, reason: string }` in `src/controller/home-controller.js`
- [X] T029 [US2] Implement `submitChallenge(person, post, { challengeType, text })` in `home-controller.js`: write Challenge Issue → write Dispute Issue via `github-client.js`; invalidate feed cache in `src/controller/home-controller.js`
- [X] T030 [US2] Add Challenge icon button to `post-card.js`: rendered always, disabled when `!canChallenge(...)`, opens composer on click; icon = `?` in `src/view/components/post-card.js`
- [X] T031 [US2] Extend `composer.js` for Challenge mode: add Interrogatory / Objection type selector radio buttons in `src/view/components/composer.js`
- [X] T032 [US2] Implement "Your turn" badge in `post-card.js` and Home feed: yellow badge shown when `currentUser` is the `defenderId` of an active Dispute linked to this card in `src/view/components/post-card.js`
- [X] T033 [US2] Implement notification trigger in `home-controller.js` + `home-view.js`: on feed load, detect Disputes where `currentUser === defenderId` and `status === 'active'`; call `showNotification("You were challenged")` in `src/controller/home-controller.js`

**Checkpoint**: Challenges can be submitted, Disputes created, "Your turn" badges appear. US2 independently testable on top of US1.

---

## Phase 5: User Story 3 — Answer and Counter-Challenge (Priority: P1)

**Goal**: The challenged person can answer an Interrogatory (with Yes/No + optional text) or an Objection (text only), and optionally include a counter-challenge that triggers the two-lane Dispute View.

**Independent Test**: Sign in as Person A (defender), open the Dispute View, answer Person B's Interrogatory with "Yes" plus a counter-challenge. Verify the view splits into two lanes. Verify Person B's turn indicator appears.

- [X] T034 [US3] Implement `src/controller/dispute-controller.js` skeleton: constructor, `loadDispute(disputeId)`, `loadPostTree(rootId)` using `github-client.js` + cache in `src/controller/dispute-controller.js`
- [X] T035 [US3] Implement `canAnswer(person, challenge)` in `dispute-controller.js`: must be current turn, challenge must be unanswered in `src/controller/dispute-controller.js`
- [X] T036 [US3] Implement `canCounterChallenge(person, answer)` in `dispute-controller.js`: person is answerer AND counter-challenge slot is empty in `src/controller/dispute-controller.js`
- [X] T037 [US3] Implement `submitAnswer(person, challenge, { yesNo, text, counterChallenge })` in `dispute-controller.js`: write Answer Issue; if `counterChallenge` present write Challenge Issue with `counterChallengeId` ref; update turn; invalidate dispute cache in `src/controller/dispute-controller.js`
- [X] T038 [US3] Implement `src/view/dispute-view.js` — single-lane layout: lineage header (parent chain with `→` separators), chronological Post cards, "Your turn" indicator, back button in `src/view/dispute-view.js`
- [X] T039 [US3] Implement two-lane layout switch in `dispute-view.js`: when `dispute.hasCounterChallenge === true`, render challenges in left lane and counter-challenges in right lane, interleaved by `createdAt` in `src/view/dispute-view.js`
- [X] T040 [US3] Extend `composer.js` for Answer mode: Yes/No radio buttons (Interrogatory only), free-text field, optional counter-challenge sub-section (collapsed by default) in `src/view/components/composer.js`
- [X] T041 [US3] Add Answer icon button (✓) to Post cards in Dispute View: disabled when `!canAnswer(...)`; opens Answer composer on click in `src/view/components/post-card.js`
- [X] T042 [US3] Wire navigation: clicking a Home card sets URL params `?view=dispute&id={id}` and renders `dispute-view.js`; back button sets URL to Home in `src/controller/app-controller.js`
- [X] T043 [US3] Create `src/controller/app-controller.js` — top-level router: reads URL params, instantiates correct controller+view, re-renders on `popstate` in `src/controller/app-controller.js`
- [X] T044 [US3] Highlight latest actionable Post in Dispute View: apply `.card--latest-action` CSS class with accent border to the most recent unanswered challenge in `src/view/dispute-view.js` and `styles/main.css`

**Checkpoint**: Full answer-challenge loop works. Two-lane duel view operational. US3 independently testable.

---

## Phase 6: User Story 4 — Resolution: Offers and Crickets (Priority: P2)

**Goal**: Either party can submit a resolution Offer. Both can negotiate Crickets conditions. Deadline expiry triggers a prominent Crickets event with audio.

**Independent Test**: Two users agree on a 10-minute Crickets countdown, one party doesn't answer, wait for deadline; verify Crickets event Issue is written in the data repo and the UI shows the visual+audio cue. Separately: both parties accept an Offer and the Dispute shows as resolved.

- [X] T045 [US4] Implement `canOffer(person, dispute)` and `submitOffer(person, dispute, { text, imageUrl })` in `dispute-controller.js` in `src/controller/dispute-controller.js`
- [X] T046 [US4] Implement `canAcceptOffer(person, offer)` and `acceptOffer(person, offer)` in `dispute-controller.js`; resolve Dispute by updating labels via PATCH in `src/controller/dispute-controller.js`
- [X] T047 [US4] Add Offer UI to Dispute View: "Make offer" button in dispute action bar, opens composer pre-labelled as Offer; accepted offers shown with distinct styling in `src/view/dispute-view.js`
- [X] T048 [US4] Implement `canProposeCrickets(person, dispute)` and `submitCricketsProposal(person, dispute, durationMs)` in `dispute-controller.js` in `src/controller/dispute-controller.js`
- [X] T049 [US4] Implement Crickets negotiation UI in `dispute-view.js`: proposal card with duration, accept/counter buttons; counter opens a duration-picker composer in `src/view/dispute-view.js`
- [X] T050 [US4] Implement `canDeclareCrickets(dispute)` in `dispute-controller.js`: `cricketsConditions.active && Date.now() > deadline && !cricketsEventExists` in `src/controller/dispute-controller.js`
- [X] T051 [US4] Implement `triggerCricketsEvent(dispute, challenge)` in `dispute-controller.js`: write `dsp:crickets-event` Issue; de-duplicate by earliest `created_at` in `src/controller/dispute-controller.js`
- [X] T052 [US4] Implement Crickets event display in `dispute-view.js`: fullwidth 🦗 banner, red/orange accent, call `playCricketsChirp()` on render in `src/view/dispute-view.js`
- [X] T053 [US4] Implement Crickets event detection on Dispute View load: call `canDeclareCrickets()` after loading dispute; if true call `triggerCricketsEvent()` in `src/view/dispute-view.js`
- [X] T054 [US4] Implement `canDisputeCrickets(person, cricketsEvent)` and `disputeCricketsEvent(person, cricketsEvent)` in `dispute-controller.js`; creates a new Dispute seeded on the CricketsEvent in `src/controller/dispute-controller.js`
- [X] T055 [US4] Show resolved Dispute state in both Dispute View and Home card: `.card--resolved` CSS class (muted palette, `pointer-events: none`), resolved offer highlighted in `src/view/dispute-view.js`, `src/view/home-view.js`, and `styles/main.css`

**Checkpoint**: Offer resolution and Crickets countdown both functional. US4 testable independently from US5/US6.

---

## Phase 7: User Story 5 — Agree With an Assertion (Priority: P2)

**Goal**: A Person can agree with an Assertion, making them eligible to answer challenges to it and creating a new Dispute against the challenger.

**Independent Test**: Person C clicks Agree on @strawman's Assertion, a `dsp:agreement` Issue is written, Person C subsequently sees the Answer action available when a new challenge arrives on that Assertion.

- [X] T056 [US5] Implement `canAgree(person, assertion)` in `home-controller.js`: authenticated, not author, no existing agreement, has not challenged this assertion in `src/controller/home-controller.js`
- [X] T057 [US5] Implement `submitAgreement(person, assertion)` in `home-controller.js`: write `dsp:agreement` Issue; cache-invalidate assertion in `src/controller/home-controller.js`
- [X] T058 [US5] Add Agree button/icon to `post-card.js` for Assertion cards: disabled when `!canAgree(...)`; show agre-er count badge in `src/view/components/post-card.js`
- [X] T059 [US5] Update `canAnswer` gate in `dispute-controller.js`: also allow person if they have an Agreement on the root Assertion of the dispute in `src/controller/dispute-controller.js`
- [X] T060 [US5] When an agre-er submits an Answer to a challenge on an agreed Assertion, create a new separate `dsp:dispute` Issue for that pair (`agre-er` as defender vs the challenger) in `src/controller/dispute-controller.js`

**Checkpoint**: Agreement mechanic complete. Agre-ers can co-defend. US5 testable.

---

## Phase 8: User Story 6 — Notifications and URL Navigation (Priority: P3)

**Goal**: Users see "You were challenged" and "Your answer was challenged" notifications. Every Post and Dispute has a shareable canonical URL that deep-links directly into the correct view.

**Independent Test**: Copy a Dispute URL, open it in a new browser tab with no prior navigation — the app must render the Dispute View for that dispute without going through Home. Load the app as Person A who has pending challenges — notifications appear.

- [X] T061 [US6] Implement full deep-link routing in `app-controller.js`: on `DOMContentLoaded` parse URL params; `?view=dispute&id=X` → render Dispute View; `?post=Y` → render Home scrolled-to card Y; no params → render Home in `src/controller/app-controller.js`
- [X] T062 [US6] Implement notification scan in `home-controller.js` and `dispute-controller.js`: on load, query all active Disputes where `currentUser` is `defenderId`; fire "You were challenged" or "Your answer was challenged" notifications via `showNotification()` in `src/controller/home-controller.js` and `src/controller/dispute-controller.js`
- [X] T063 [US6] Ensure URL params update on every navigation (Home → Dispute, Dispute → Home, back button) via `setUrlParams()` and `history.pushState` in `src/controller/app-controller.js`
- [X] T064 [US6] Implement `popstate` listener in `app-controller.js`: re-read URL params and re-render correct view on browser back/forward in `src/controller/app-controller.js`
- [X] T065 [US6] Verify copy-URL button on every Post card produces URLs that resolve correctly end-to-end (canonical URL → correct view on fresh load) in `src/view/components/post-card.js`

**Checkpoint**: All 6 user stories functional. App fully URL-driven and navigable.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Performance hardening, accessibility, edge-case error handling, and final UI polish across all stories

- [X] T066 [P] Implement `IntersectionObserver`-based viewport pre-fetch in `home-view.js`: when a card enters the viewport, pre-fetch its Dispute detail if `disputeId` is set (uses ETag cache so no quota cost after first fetch) in `src/view/home-view.js`
- [X] T067 [P] Add ARIA roles and labels to all interactive components: `role="button"` + `aria-disabled` for disabled controls, `aria-live` region for notifications, landmark roles for header/main in `src/view/components/`
- [X] T068 [P] Add error boundary to all GitHub API calls in `github-client.js`: on network error or 4xx/5xx, reject with a typed `ApiError`; callers show `showNotification("Something went wrong — try again")` and roll back optimistic UI in `src/api/github-client.js`
- [X] T069 [P] Prevent double-submission: disable submit button immediately on first click in `composer.js`; re-enable on API error in `src/view/components/composer.js`
- [X] T070 [P] Add image file size validation in `composer.js`: reject files >10 MB before upload attempt; show inline error without clearing form in `src/view/components/composer.js`
- [X] T071 Add unit tests for all `can*` permission gates in `tests/unit/controller/home-controller.test.js` and `tests/unit/controller/dispute-controller.test.js` to meet ≥80% module coverage gate
- [X] T072 Add unit tests for `src/model/` entities (`Person`, `Post`, `Dispute`, `Agreement`, `CricketsConditions`) in `tests/unit/model/`
- [X] T073 Add integration tests for `github-client.js` using `fetch` mock in `tests/integration/github-client.test.js`
- [X] T074 Add integration tests for `cache.js` ETag flow in `tests/integration/cache.test.js`
- [X] T075 Run `npx c8 check-coverage --lines 85 --functions 85 --branches 80` and fix any gaps
- [X] T076 Final CSS pass: verify `--color-disabled` on all disabled controls, terminal card dimming, resolved card muting, two-lane layout on narrow viewport, stacked shadow depth on all card variants in `styles/main.css`
- [X] T077 Run quickstart.md validation: fresh clone → setup labels script → local HTTP server → Device Flow sign-in → compose assertion → challenge it → answer it; document any corrections in `specs/001-better-dispute-app/quickstart.md`
- [ ] T092 [P] Implement structured in-browser logging and an enhanced page-render error panel:
  - **Logger** (`src/utils/logger.js`): singleton with `log(level, context, message, data)` — levels `debug|info|warn|error`; appends timestamped entries to an in-memory circular buffer (last 200 entries); mirrors to `console` at matching level; exposed on `window.__bdLogger` for DevTools access.
  - **Error panel** (`src/view/components/error-panel.js`): `showErrorPanel(error, context)` replaces the current `<main>` content on unrecoverable render failures; displays: human-readable summary, full stack trace in a scrollable `<pre>`, structured log dump (all buffered entries as JSON), copy-to-clipboard button for the complete debug bundle (error + stack + logs + `navigator.userAgent` + `window.location.href` + timestamp), and a "Retry" button that calls `window.location.reload()`.
  - Wire into `src/app.js`: wrap top-level bootstrap in `try/catch`; on catch call `logger.error('app', 'Bootstrap failed', err)` then `showErrorPanel(err, 'app bootstrap')`.
  - Wire into `src/controller/app-controller.js`: wrap each `render*` call in `try/catch`; on catch call `logger.error('router', 'Render failed', err)` then `showErrorPanel(err, 'view render')`.
  - **Interactive debugging**: clicking any log entry row in the panel expands it to show the full `data` payload as pretty-printed JSON; a "Filter by level" dropdown (debug/info/warn/error) filters the visible log entries in-panel without clearing them.
  - CSS in `styles/main.css`: error panel uses `--color-error` background tint, monospace stack trace block, log-level colour chips (`debug`=muted, `info`=blue, `warn`=amber, `error`=red), smooth expand/collapse transition on log entry detail.

---

## Phase 10: Social Sharing — OG Preview via Cloudflare Worker

**Goal**: Shareable `?post=42` and `?view=dispute&id=X` URLs produce rich social previews (title + description) when shared on Twitter/X, iMessage, Slack etc.

**Approach**: A Cloudflare Worker sits in front of GitHub Pages, intercepts requests with BD query params, fetches the GitHub Issue title/body, injects `<meta og:*>` tags into the proxied HTML, and returns it. The SPA and all client code are unchanged.

- [ ] T078 Create `worker/index.js` — Cloudflare Worker that proxies GitHub Pages, injects dynamic `og:title`, `og:description`, `og:url` for `?post=N` and `?view=dispute&id=N` requests by fetching the corresponding GitHub Issue; falls back to generic app tags for unparameterised requests in `worker/index.js`
- [ ] T079 Create `worker/wrangler.toml` — Wrangler config for the worker (account_id placeholder, route pattern, compatibility_date) in `worker/wrangler.toml`
- [ ] T080 Store `GITHUB_TOKEN` as a Cloudflare Worker secret via `wrangler secret put GITHUB_TOKEN` so the worker can fetch private Issue data without exposing credentials in source; document in `worker/wrangler.toml` and `specs/001-better-dispute-app/quickstart.md`
- [ ] T081 Update `specs/001-better-dispute-app/quickstart.md` — add "Social previews" section: install Wrangler, set `GITHUB_TOKEN` secret, deploy worker, point DNS/route at it in `specs/001-better-dispute-app/quickstart.md`

---

## Phase 12: Multi-Repo Environment Strategy (DEV → STG → PRD)

**Goal**: Separate GitHub data repos for development, staging, and production so testing never pollutes live data. Promotion flows through PRs: feature branch → DEV → STG → PRD.

**Approach**: `CONFIG.dataRepo` drives which GitHub repo the app reads/writes Issues to. Three named config profiles are loaded at build/deploy time. A `gh` CLI–based promotion script opens a PR from the current environment's branch to the next.

- [ ] T093 Add `dataRepoStg` and `dataRepoPrd` fields to the `CONFIG` shape in `src/config.sample.js`; document the three-repo model (DEV = `<owner>/dsp-data-dev`, STG = `<owner>/dsp-data-stg`, PRD = `<owner>/dsp-data-prd`) with placeholder values in `src/config.sample.js`
- [ ] T094 [P] Create `scripts/promote.sh` — interactive bash script that accepts `--from dev|stg` and `--title <PR title>`; uses `gh pr create` to open a PR from the source env branch (`dev`→`stg` or `stg`→`prd`) in the correct data repo; prints the PR URL on success in `scripts/promote.sh`
- [ ] T095 [P] Create `scripts/setup-env.sh` — bash script that accepts `--env dev|stg|prd`; calls `scripts/setup-labels.sh` against the correct repo (pass repo via `-R <owner>/<repo>`); ensures all three data repos have the full `dsp:*` label set in `scripts/setup-env.sh`
- [ ] T096 Update `src/config.js` (and `src/config.sample.js`) to select the active `dataRepo` based on a `CONFIG.env` field (`"dev"|"stg"|"prd"`): `dev` reads `dataRepoDev`, `stg` reads `dataRepoStg`, `prd` reads `dataRepoPrd`; `github-client.js` references only `CONFIG.dataRepo` (no changes needed there) in `src/config.js` and `src/config.sample.js`
- [ ] T097 Update `specs/001-better-dispute-app/quickstart.md` — add "Environment setup" section: create the three GitHub data repos, run `scripts/setup-env.sh` for each, configure `src/config.js` with all three repo names, use `scripts/promote.sh` to promote changes, and guidance on deploying each env to a separate GitHub Pages branch (`gh-pages-dev`, `gh-pages-stg`, `gh-pages`) in `specs/001-better-dispute-app/quickstart.md`

---

## Phase 11: Dispute Moments

**Goal**: Any authenticated user can annotate any Post (or contiguous range of Posts) with a one-liner Moment. Moments thread into scrollable one-liner replies. All Moments for a dispute are shown in a collapsible third lane on the right of the Dispute View.

**Storage**: New `dsp:moment` Issue type. Fields: `disputeId`, `anchorPostId` (single post) or `anchorStartId`+`anchorEndId` (range), `parentMomentId` (null for root, set for reply), `text` (≤280 chars). Label: `dsp:moment`.

- [ ] T082 Add `"moment"` to the DSP:META type enum and define its schema (fields above) in `specs/001-better-dispute-app/contracts/github-issues-schema.md`
- [ ] T083 Add `dsp:moment` label to `scripts/setup-labels.sh` in `scripts/setup-labels.sh`
- [ ] T084 Implement `src/model/moment.js` — `Moment` class with all fields; `fromIssue()` factory in `src/model/moment.js`
- [ ] T085 [P] Implement `canAddMoment(person, dispute)` and `submitMoment(person, dispute, { anchorPostId, anchorStartId, anchorEndId, parentMomentId, text })` in `src/controller/dispute-controller.js`
- [ ] T086 [P] Implement `loadMoments(disputeId)` in `src/controller/dispute-controller.js`: fetch all `dsp:moment` Issues for the dispute, sort into anchor-keyed tree in `src/controller/dispute-controller.js`
- [ ] T087 Implement `src/view/components/moment-lane.js` — `renderMomentLane(moments, postTree, controller, currentUser)`: collapsible third lane, Posts annotated with thread-count badge, clicking badge scrolls lane to that anchor's thread in `src/view/components/moment-lane.js`
- [ ] T088 Implement range-selection in Dispute View: shift-click a second Post card to define an anchor range; highlights the range and opens the Moment composer pre-filled with `anchorStartId`+`anchorEndId` in `src/view/dispute-view.js`
- [ ] T089 Extend `composer.js` for Moment mode: single-line input, 280-char counter, no image, submit on Enter in `src/view/components/composer.js`
- [ ] T090 Wire moment lane into `dispute-view.js`: load moments alongside post tree, render third lane, add collapse/expand toggle button to dispute action bar, persist collapsed state in `localStorage` in `src/view/dispute-view.js`
- [ ] T091 Add CSS for third lane, moment cards, anchor highlight, thread-count badge, range-selection highlight, collapse animation in `styles/main.css`
- [ ] T092 Add unit tests for `canAddMoment` gate and `Moment.fromIssue` in `tests/unit/`

---

## Phase 13: Widgets — Embeddable Post Attachments

**Goal**: Posts can carry one or more structured Widget attachments (stored as JSON in the Issue body's `DSP:META` block) rendered as rich interactive cards below the post text. The first Widget type is the **Bible Widget**.

**Architecture**: Widget data is serialised into the `widgets: []` array in `DSP:META`. Each entry has `{ type, payload }`. The renderer is a registry: `src/view/components/widgets/` holds one file per type; `widget-host.js` dispatches to the correct renderer. The composer gains a "+ Widget" action that opens a widget picker.

### Bible Widget

**Data**: `type: "bible"`, `payload: { ref: "John 3:16", verseIds: ["JHN.3.16"] }` — reference string (display) + canonical verse ID array (lookup key).

**Data source**: [api.esv.org](https://api.esv.org) is not used. All text and data is fetched from the free, public [api.bible](https://scripture.api.bible) (American Bible Society) using the **KJV** Bible ID (`de4e12af7f28f599-02`). No attribution label for the translation is shown in the UI. Original-language data uses the **BHSA** (Hebrew, BibleOL) for OT and **SBLGNT** (Greek, API.Bible free tier) for NT.

- [ ] T098 Define `widgets` array in `DSP:META` schema: `[{ type: string, payload: object }]`; document `"bible"` payload shape (`ref`, `verseIds`) in `specs/001-better-dispute-app/contracts/github-issues-schema.md`
- [ ] T099 [P] Create `src/api/bible-client.js` — thin wrapper around api.bible REST API (API key from `CONFIG.biblApiKey`); methods: `getPassage(verseIds)` → `{ html, verses[] }`; `search(query)` → `{ results[] }`; `getBooks()` → book list; `getChapter(bookId, chapter)` → verse list; responses cached via `cache.js` (long TTL, no ETag needed); errors surfaced as typed `ApiError` in `src/api/bible-client.js`
- [ ] T100 [P] Add `bibleApiKey` field to `CONFIG` shape in `src/config.sample.js` and `src/config.js` in `src/config.sample.js`
- [ ] T101 Implement `src/view/components/widgets/widget-host.js` — `renderWidget(widgetData)` registry dispatcher; gracefully renders an "Unknown widget" placeholder for unrecognised types in `src/view/components/widgets/widget-host.js`
- [ ] T102 Implement `src/view/components/widgets/bible-widget.js` — `renderBibleWidget(payload)`: collapsed pill showing reference (e.g. "John 3:16 ▾"); on expand shows the passage text with each verse individually numbered; "View in context" link opens the in-panel Bible reader in `src/view/components/widgets/bible-widget.js`
- [ ] T103 Implement `src/view/components/bible-reader.js` — slide-over panel (does not navigate away); tabs: **Passage** (formatted HTML from api.bible), **Context** (full chapter with current verses highlighted), **Original** (interlinear Hebrew/Greek fetched from api.bible BHSA/SBLGNT Bible IDs, word-by-word with transliteration and gloss on hover), **Cross-refs** (related passage list from api.bible `/passages/{id}/fums`); loading skeleton while fetching in `src/view/components/bible-reader.js`
- [ ] T104 [P] Implement `src/view/components/bible-search.js` — search input with debounced api.bible `search()` call; results list shows reference + snippet; clicking a result opens the Bible reader at that passage in `src/view/components/bible-search.js`
- [ ] T105 [P] Implement `src/view/components/bible-navigator.js` — book → chapter → verse drill-down picker using `getBooks()` + `getChapter()`; shows full chapter text with selectable verse checkboxes; "Attach selected" commits the selection as a widget payload in `src/view/components/bible-navigator.js`
- [ ] T106 Add "+ Widget" button to `composer.js`: opens a widget-picker modal (initially just "Bible" option); selecting "Bible" opens `bible-navigator.js` in picker mode; confirmed selection appends a widget chip to the draft and serialises into `widgets[]` on submit in `src/view/components/composer.js`
- [ ] T107 Wire `widget-host.js` into `post-card.js`: after rendering post text, iterate `post.widgets` and append each rendered widget in `src/view/components/post-card.js`
- [ ] T108 Extend `Post.fromIssue()` and `DSP:META` serialisation in `github-client.js` `buildBody()` / `parseBody()` to round-trip the `widgets` array in `src/model/post.js` and `src/api/github-client.js`
- [ ] T109 Add CSS: bible widget pill, expanded passage block (line-height 1.8, generous padding), verse number superscripts, interlinear word rows (original script top, transliteration middle, gloss bottom in muted colour), highlighted context verses, slide-over panel animation, Bible reader tab bar in `styles/main.css`
- [ ] T110 Add unit tests for `bible-client.js` fetch/cache paths (fetch mock) and `Post.fromIssue` widget round-trip in `tests/unit/` and `tests/integration/`

### Quote Widget

**Goal**: Attach a quoted social post (from X/Twitter or any public URL) that renders as a faithful social card preview — profile pic, display name, handle, timestamp, post text, and optional attached image — exactly as it would appear on the originating platform. The card is a static snapshot (stored at compose time), so it renders offline and can never be silently edited or deleted by the original author.

**Data**: `type: "quote"`, `payload: { sourceUrl, platform, authorName, authorHandle, authorProfilePicUrl, text, imageUrl?, postedAt, fetchedAt }` — all fields captured at compose time via `citation-client.js` (re-used) extended with X-card–specific OG/meta parsing (`og:image`, `twitter:creator`, `article:published_time`).

- [ ] T123 [P] Extend `src/api/citation-client.js` — add `fetchQuote(url)`: re-uses the existing proxy+OG fetch but additionally extracts `twitter:creator`, `twitter:title` (as post text fallback), `twitter:image`, `article:published_time`, and infers `platform` from hostname; returns the full Quote payload object in `src/api/citation-client.js`
- [ ] T124 [P] Implement `src/view/components/widgets/quote-widget.js` — `renderQuoteWidget(payload)`: renders a social card styled after an X post — rounded border, profile pic (circle), bold display name + muted `@handle` on the same line, post text with preserved line breaks, optional attached image below text, muted timestamp bottom-left, platform icon (X bird / generic link) bottom-right; entire card is a hyperlink to `sourceUrl` opening in a new tab in `src/view/components/widgets/quote-widget.js`
- [ ] T125 [P] Add `"quote"` to the widget picker in `composer.js`: URL input → `fetchQuote()` called on blur/debounce → live preview of the rendered social card updates inline before the user commits; "Attach" stores the snapshot payload in `src/view/components/composer.js`
- [ ] T126 Register `"quote"` type in `widget-host.js` in `src/view/components/widgets/widget-host.js`
- [ ] T127 Add CSS for the social card: outer border (`--color-border`), inner layout grid (profile pic column + content column), profile pic circle, name/handle row, post body typography, attached image (rounded, max-height capped), footer row (timestamp + platform icon), hover state (subtle background tint); card must be visually distinct from a BD post card in `styles/main.css`
- [ ] T128 Add `"quote"` payload shape to `widgets[]` schema in `specs/001-better-dispute-app/contracts/github-issues-schema.md`; add unit tests for `fetchQuote` OG parsing and `quote-widget` render in `tests/unit/` and `tests/integration/`

---

## Phase 15: Logic & Reasoning Widgets (Fallacy Tag, Claim Map) + Moment Widget Support

**Constitutional constraint** (from `spec.md` §Platform Philosophy): These widgets are *post-hoc diagnostic tools only*. They describe errors and patterns in reasoning that has already occurred — they are never used to construct an argument. Accordingly:
- Available on **Challenge and Answer posts only** — not on Assertions
- Available in **Moment annotations** (the platform's commentary layer)
- The widget picker suppresses these types when composing an Assertion

### Fallacy Tag Widget

**Data**: `type: "fallacy-tag"`, `payload: { fallacyId: string, fallacyName: string, definition: string, targetPostId?: string }` — `targetPostId` is optional; when set (always set from Moment context), a subtle link renders beneath the tag pointing to the targeted post.

**Fallacy list**: Curated set of ~25 common informal fallacies stored as a static JSON file (`src/data/fallacies.json`): ad hominem, straw man, false dichotomy, appeal to authority, begging the question, moving the goalposts, etc. No external API.

- [ ] T129 Create `src/data/fallacies.json` — array of `{ id, name, definition, category }` covering ~25 common informal fallacies in `src/data/fallacies.json`
- [ ] T130 [P] Implement `src/view/components/widgets/fallacy-tag-widget.js` — `renderFallacyTagWidget(payload)`: compact chip showing fallacy name with a `ⓘ` icon; hover/tap expands an inline popover with the one-line definition; if `targetPostId` is set, a muted "re: [post excerpt]" link appears below the chip in `src/view/components/widgets/fallacy-tag-widget.js`
- [ ] T131 [P] Add `"fallacy-tag"` to the widget picker in `composer.js` — only when `composerMode` is `"challenge"`, `"answer"`, or `"moment"`; opens a searchable list from `fallacies.json`; selecting a fallacy auto-fills name + definition; "Attach" commits the payload in `src/view/components/composer.js`
- [ ] T132 Register `"fallacy-tag"` in `widget-host.js`; add payload shape to `contracts/github-issues-schema.md` in `src/view/components/widgets/widget-host.js` and `specs/001-better-dispute-app/contracts/github-issues-schema.md`

### Claim Map Widget

**Purpose**: A read-only structured summary of the logical skeleton visible in a post or range of posts — rendered as an indented tree showing claims and the implicit assumptions beneath them. Used to expose what was left unstated, not to prove anything.

**Data**: `type: "claim-map"`, `payload: { nodes: [{ id, parentId, text, type: "claim"|"assumption"|"conclusion" }] }` — author-constructed tree with a minimal node editor in the composer.

- [ ] T133 [P] Implement `src/view/components/widgets/claim-map-widget.js` — `renderClaimMapWidget(payload)`: indented tree, node type indicated by icon (● claim, ○ assumption, ✓ conclusion); read-only in post view; clicking a node highlights its subtree in `src/view/components/widgets/claim-map-widget.js`
- [ ] T134 [P] Add `"claim-map"` to the widget picker in `composer.js` — only for `"challenge"`, `"answer"`, `"moment"` modes; opens a minimal node editor: add node, indent/outdent, set type, reorder; live preview of the rendered tree updates as nodes are edited in `src/view/components/composer.js`
- [ ] T135 Register `"claim-map"` in `widget-host.js`; add payload shape to schema in `src/view/components/widgets/widget-host.js` and `specs/001-better-dispute-app/contracts/github-issues-schema.md`

### Moment Widget Support

**Extends Phase 11** (T082–T092). Moments gain an optional single widget attachment. Allowed types: `fallacy-tag`, `claim-map`, `bible`, `web-citation`, `quote`. Image and video widgets are excluded from Moments. A Moment with a widget still requires non-empty text.

- [ ] T136 Extend `Moment` data model: add optional `widget?: { type, payload }` field to `DSP:META` schema and `src/model/moment.js`; update `Moment.fromIssue()` to deserialise it in `src/model/moment.js` and `specs/001-better-dispute-app/contracts/github-issues-schema.md`
- [ ] T137 Extend `composer.js` Moment mode (T089): add a `"+ Widget"` action restricted to the allowed Moment widget types (`fallacy-tag`, `claim-map`, `bible`, `web-citation`, `quote`); pass `allowedWidgets` array to `renderComposer()` so the widget picker filters accordingly in `src/view/components/composer.js`
- [ ] T138 Extend `submitMoment()` in `dispute-controller.js` to serialise `widget` into `DSP:META` when present in `src/controller/dispute-controller.js`
- [ ] T139 Extend `moment-lane.js` to render the widget below the one-liner text using `widget-host.js` when `moment.widget` is present in `src/view/components/moment-lane.js`
- [ ] T140 Add CSS: fallacy-tag chip + popover, claim-map indented tree, node type icons, subtree highlight, node editor layout (composer), Moment widget attachment area in `styles/main.css`
- [ ] T141 Add unit tests: fallacy picker filter, claim-map node serialisation round-trip, `Moment.fromIssue` with widget, `submitMoment` with widget payload in `tests/unit/`

---

## Phase 14: Image and Web Citation Widgets (Migrate Images into Widget Model)

**Goal**: Remove the first-class image upload field from the composer and replace it with two new widget types — `"image"` and `"web-citation"` — so all rich attachments flow through the unified widget system. The strawman composer uses Web Citation as its primary attachment method.

**Migration note**: T022–T023 and T070 added image upload directly to `composer.js` and `post-card.js`. These tasks supersede that implementation; the raw image input field is removed and its functionality is reborn as the Image widget.

### Image Widget

**Data**: `type: "image"`, `payload: { url: string, alt: string, caption?: string }` — URL is a GitHub-hosted image URL obtained by uploading to the Issue via the GitHub REST API (`POST /repos/{owner}/{repo}/issues/{issue_number}/comments` with a multipart body, then extracting the uploaded URL from the markdown response).

- [ ] T111 Remove the raw image file input from `composer.js`; remove image-URL prop from `submitAssertion` / `submitAnswer` signatures in `src/view/components/composer.js`, `src/controller/home-controller.js`, `src/controller/dispute-controller.js`
- [ ] T112 [P] Implement `src/view/components/widgets/image-widget.js` — `renderImageWidget(payload)`: renders `<figure>` with `<img>` (lazy-loaded, max-height capped), optional `<figcaption>`; clicking opens a lightbox overlay in `src/view/components/widgets/image-widget.js`
- [ ] T113 [P] Add `"image"` to the widget picker in `composer.js`: opens a file chooser (≤10 MB validation re-using T070 logic); on confirm, uploads to GitHub via `github-client.js` `uploadImage(file)` helper and stores the returned URL as the widget payload in `src/view/components/composer.js` and `src/api/github-client.js`
- [ ] T114 Register `"image"` type in `widget-host.js` in `src/view/components/widgets/widget-host.js`

### Web Citation Widget

**Data**: `type: "web-citation"`, `payload: { url: string, title: string, description: string, siteName: string, fetchedAt: string }` — metadata fetched at compose time via a CORS-safe proxy (use `https://corsproxy.io/?` prefix); extracted from Open Graph / `<title>` / `<meta name="description">` tags.

- [ ] T115 [P] Create `src/api/citation-client.js` — `fetchCitation(url)`: fetches HTML through `corsproxy.io`, parses `og:title`, `og:description`, `og:site_name` (fallback to `<title>` / `<meta name="description">` / hostname), returns the payload object; errors surface as typed `ApiError` in `src/api/citation-client.js`
- [ ] T116 [P] Implement `src/view/components/widgets/web-citation-widget.js` — `renderWebCitationWidget(payload)`: card with site favicon (`https://www.google.com/s2/favicons?domain=`), site name, bold title (hyperlinked), one-line description, muted domain + fetch date footer; opens URL in new tab in `src/view/components/widgets/web-citation-widget.js`
- [ ] T117 Add `"web-citation"` to the widget picker in `composer.js`: URL input → live preview card updates as user types (debounced `fetchCitation` call) → "Attach" commits the payload in `src/view/components/composer.js`
- [ ] T118 Register `"web-citation"` type in `widget-host.js` in `src/view/components/widgets/widget-host.js`
- [ ] T119 Update `schemas/github-issues-schema.md` — add `"image"` and `"web-citation"` payload shapes to the `widgets[]` enum in `specs/001-better-dispute-app/contracts/github-issues-schema.md`
- ~~T120~~ *(superseded by Phase 20 — Strawman Composer Redesign)*
- [ ] T121 Add CSS: image widget figure/lightbox overlay, web citation card layout (favicon + site-name row, title, description, footer), live-preview skeleton while `fetchCitation` is in-flight in `styles/main.css`
- [ ] T122 Add unit tests: `citation-client.js` OG parsing (mock fetch responses), `image-widget` and `web-citation-widget` render output, widget round-trip through `Post.fromIssue` in `tests/unit/` and `tests/integration/`

---

## Phase 16: Definitions & Language Widgets

**Goal**: Pin the meaning of words at compose time so both parties are arguing about the same thing and latecomers can see exactly what was intended.

### Dictionary Widget

**Data**: `type: "dictionary"`, `payload: { word, partOfSpeech, definition, etymology, sourceUrl, fetchedAt }` — fetched at compose time from the free [dictionaryapi.dev](https://dictionaryapi.dev) (no API key required); snapshot stored in payload.

- [ ] T142 [P] Create `src/api/dictionary-client.js` — `fetchDefinition(word)`: calls `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`, picks the first entry's first definition + etymology + part-of-speech; returns payload object; responses cached via `cache.js`; errors as typed `ApiError` in `src/api/dictionary-client.js`
- [ ] T143 [P] Implement `src/view/components/widgets/dictionary-widget.js` — `renderDictionaryWidget(payload)`: word as header, italic part-of-speech, definition body, muted etymology line, small "via dictionary" footer link; compact collapsed pill that expands on click in `src/view/components/widgets/dictionary-widget.js`
- [ ] T144 [P] Add `"dictionary"` to the widget picker in `composer.js`: word input → live lookup debounced → shows definition preview → "Attach" commits snapshot; available on all post types and Moments in `src/view/components/composer.js`
- [ ] T145 Register `"dictionary"` in `widget-host.js`; add payload shape to schema; add unit tests for fetch/cache path in `src/view/components/widgets/widget-host.js`, `specs/001-better-dispute-app/contracts/github-issues-schema.md`, and `tests/unit/`

### Lexicon Widget

**Purpose**: Like Dictionary but for biblical/theological vocabulary — pulls the Hebrew (OT) or Greek (NT) entry for a word including lexical form, transliteration, Strong's number, and a short gloss. Natural companion to the Bible Widget.

**Data**: `type: "lexicon"`, `payload: { word, language: "hebrew"|"greek", strongsNumber, lexicalForm, transliteration, gloss, extendedDefinition, sourceLabel }` — sourced from OpenScriptures Strong's static JSON files (hosted on CDN, no key required) for both Hebrew (BDB-derived) and Greek (Thayer/BDAG-lite).

- [ ] T146 [P] Create `src/api/lexicon-client.js` — `fetchLexiconEntry(strongsNumber, language)`: fetches the appropriate static JSON entry from the OpenScriptures CDN; returns payload object; cached via `cache.js` with long TTL; `searchLexicon(query, language)` does a client-side fuzzy match over a downloaded index in `src/api/lexicon-client.js`
- [ ] T147 [P] Implement `src/view/components/widgets/lexicon-widget.js` — `renderLexiconWidget(payload)`: lexical form in original script (large), transliteration in italics, Strong's number badge, gloss as definition, extended definition in expandable section; language badge (`HEB`/`GRK`) in corner in `src/view/components/widgets/lexicon-widget.js`
- [ ] T148 [P] Add `"lexicon"` to the widget picker in `composer.js`: language toggle (Hebrew / Greek), search input → results list (Strong's number + gloss) → selecting an entry shows full preview → "Attach" commits; available on all post types and Moments in `src/view/components/composer.js`
- [ ] T149 Register `"lexicon"` in `widget-host.js`; add payload shape to schema; add unit tests in `src/view/components/widgets/widget-host.js`, `specs/001-better-dispute-app/contracts/github-issues-schema.md`, and `tests/unit/`
- [ ] T150 Add CSS: dictionary pill/expand, lexicon original-script header (large font, correct Unicode range), Strong's number badge, language badge, extended definition collapse animation in `styles/main.css`

---

## Phase 17: Data & Fact-Checking Widgets

**Goal**: Allow parties to attach structured factual evidence — timelines, side-by-side comparisons, and reader polls — directly to posts.

### Timeline Widget

**Data**: `type: "timeline"`, `payload: { title?, events: [{ date, label, description?, sourceUrl? }] }` — author-constructed; events sorted by date on render; each event's source URL is optional.

- [ ] T151 [P] Implement `src/view/components/widgets/timeline-widget.js` — `renderTimelineWidget(payload)`: vertical timeline list; each event has a date chip (left), bold label, optional one-line description, optional source link icon; collapsed to first 3 events with "Show all N" expand control in `src/view/components/widgets/timeline-widget.js`
- [ ] T152 [P] Add `"timeline"` to the widget picker in `composer.js`: event-list editor (add/remove/reorder rows, each row has date input + label + optional description + optional URL); live preview updates as rows are edited in `src/view/components/composer.js`
- [ ] T153 Register `"timeline"` in `widget-host.js`; add payload shape to schema in `src/view/components/widgets/widget-host.js` and `specs/001-better-dispute-app/contracts/github-issues-schema.md`

### Comparison Table Widget

**Data**: `type: "comparison-table"`, `payload: { colALabel, colBLabel, rows: [{ label, colA, colB }] }` — two-column comparison; column labels default to "Claim A" / "Claim B" but are editable.

- [ ] T154 [P] Implement `src/view/components/widgets/comparison-table-widget.js` — `renderComparisonTableWidget(payload)`: two-column table with header row (col labels), left-aligned row labels, cell text wrapping; collapsed to first 4 rows with expand control in `src/view/components/widgets/comparison-table-widget.js`
- [ ] T155 [P] Add `"comparison-table"` to the widget picker in `composer.js`: column label inputs + row editor (add/remove rows, each row has label + two cell inputs); live preview in `src/view/components/composer.js`
- [ ] T156 Register `"comparison-table"` in `widget-host.js`; add payload shape to schema in `src/view/components/widgets/widget-host.js` and `specs/001-better-dispute-app/contracts/github-issues-schema.md`

### Poll Widget

**Data**: `type: "poll"`, `payload: { question, options: [{ id, label }] }` — stored in Issue body. Votes are separate `dsp:poll-vote` Issues (`{ pollWidgetId, optionId, voterId }`); tallies computed client-side by counting matching Issues.

- [ ] T157 Add `"poll-vote"` to DSP:META type enum and define its schema; add `dsp:poll-vote` label to `scripts/setup-labels.sh` in `specs/001-better-dispute-app/contracts/github-issues-schema.md` and `scripts/setup-labels.sh`
- [ ] T158 [P] Implement `src/model/poll-vote.js` — `PollVote` class; `fromIssue()` factory in `src/model/poll-vote.js`
- [ ] T159 [P] Implement `canVote(person, poll, existingVotes)` and `submitVote(person, poll, optionId)` in `dispute-controller.js`; `submitVote` writes a `dsp:poll-vote` Issue; `loadVotes(pollWidgetId)` fetches and tallies in `src/controller/dispute-controller.js`
- [ ] T160 [P] Implement `src/view/components/widgets/poll-widget.js` — `renderPollWidget(payload, votes, currentUser, onVote)`: before voting shows radio options + "Vote" button; after voting shows bar-chart style result rows (option label + percentage fill + count); current user's choice shown with accent colour in `src/view/components/widgets/poll-widget.js`
- [ ] T161 [P] Add `"poll"` to the widget picker in `composer.js`: question input + option list editor (min 2, max 6 options); available on all post types (not Moments — polls are post-level only) in `src/view/components/composer.js`
- [ ] T162 Register `"poll"` in `widget-host.js`; add payload shapes to schema; add unit tests for `canVote` gate and vote tally in `src/view/components/widgets/widget-host.js`, `specs/001-better-dispute-app/contracts/github-issues-schema.md`, and `tests/unit/`
- [ ] T163 Add CSS: timeline date chips + vertical connector line, comparison table alternating row tint, poll option bars (CSS width driven by percentage variable), voted-state accent, expand/collapse controls for all three widgets in `styles/main.css`

---

## Phase 18: Concession & Scope Widgets

**Goal**: Give parties structured tools to narrow the dispute — explicitly agreeing on shared ground and declaring what is out of scope — so the real disagreement becomes visible.

**Constitutional note**: Both widgets are cooperative by design; they reduce rather than escalate. Either party can propose; the other must acknowledge (not necessarily agree) before items lock. Available on all post types and Moments.

### Common Ground Widget

**Data**: `type: "common-ground"`, `payload: { items: [{ id, text, lockedBy: [personId] }] }` — each item has a `lockedBy` array; an item is "agreed" when both parties' IDs appear. Lock actions are additional `dsp:common-ground-lock` Issues so the append-only model is preserved.

- [ ] T164 Add `"common-ground-lock"` to DSP:META type enum and schema; add `dsp:common-ground-lock` label to `scripts/setup-labels.sh` in `specs/001-better-dispute-app/contracts/github-issues-schema.md` and `scripts/setup-labels.sh`
- [ ] T165 [P] Implement `src/view/components/widgets/common-ground-widget.js` — `renderCommonGroundWidget(payload, locks, currentUser, onLock)`: checklist of items; unlocked items show a "✓ I agree with this" button for the current user; locked items show a green checkmark + both parties' handles; items cannot be removed once locked in `src/view/components/widgets/common-ground-widget.js`
- [ ] T166 [P] Implement `canLock(person, item, locks)` and `submitLock(person, item)` in `dispute-controller.js`; `submitLock` writes a `dsp:common-ground-lock` Issue in `src/controller/dispute-controller.js`
- [ ] T167 [P] Add `"common-ground"` to the widget picker in `composer.js`: free-text item list editor (add/remove rows before submitting); "Attach" commits the widget; items are editable until the post is submitted, then append-only via lock Issues in `src/view/components/composer.js`
- [ ] T168 Register `"common-ground"` in `widget-host.js`; add payload shape to schema in `src/view/components/widgets/widget-host.js` and `specs/001-better-dispute-app/contracts/github-issues-schema.md`

### Scope Limiter Widget

**Data**: `type: "scope-limiter"`, `payload: { outOfScopeItems: [{ id, text }] }` — a plain authored list of things this dispute is explicitly *not* about. Read-only once posted; no locking mechanic (it's a declaration, not a negotiation).

- [ ] T169 [P] Implement `src/view/components/widgets/scope-limiter-widget.js` — `renderScopeLimiterWidget(payload)`: labelled section "This dispute is not about:", bulleted list with a `⊘` prefix icon per item; muted styling to distinguish from post body in `src/view/components/widgets/scope-limiter-widget.js`
- [ ] T170 [P] Add `"scope-limiter"` to the widget picker in `composer.js`: item list editor (add/remove rows); available on Assertions and Challenges only (scope is set when a dispute opens, not mid-resolution) in `src/view/components/composer.js`
- [ ] T171 Register `"scope-limiter"` in `widget-host.js`; add payload shape to schema in `src/view/components/widgets/widget-host.js` and `specs/001-better-dispute-app/contracts/github-issues-schema.md`
- [ ] T172 Add CSS: common-ground checklist (locked item green state, lock button), scope-limiter muted block with `⊘` bullets, common-ground lock loading state in `styles/main.css`
- [ ] T173 Add unit tests: `canLock` gate, `submitLock` Issue write, common-ground locked-state render, scope-limiter render in `tests/unit/`

---

## Phase 19: Media Widgets

**Goal**: Allow parties to attach visual evidence — annotated screenshots/diagrams and timestamped video clips — to posts.

### Annotated Image Widget

**Data**: `type: "annotated-image"`, `payload: { url, alt, annotations: [{ id, x, y, width, height, label }] }` — image uploaded to GitHub (same `uploadImage()` helper as T113); bounding-box annotations authored in an SVG overlay editor at compose time and stored as normalised coordinates (0–1 range) so they scale to any render size.

- [ ] T174 [P] Implement `src/view/components/widgets/annotated-image-widget.js` — `renderAnnotatedImageWidget(payload)`: renders image with SVG overlay; each annotation box is dashed-border rect + numbered badge; hovering/tapping a badge shows the label in a tooltip; lightbox on click (annotations preserved in lightbox) in `src/view/components/widgets/annotated-image-widget.js`
- [ ] T175 [P] Add `"annotated-image"` to the widget picker in `composer.js`: file chooser (≤10 MB, re-uses T070 validation) → upload → SVG annotation editor (drag to draw box, type label, delete box); live preview; "Attach" commits in `src/view/components/composer.js` and `src/api/github-client.js`
- [ ] T176 Register `"annotated-image"` in `widget-host.js`; add payload shape to schema in `src/view/components/widgets/widget-host.js` and `specs/001-better-dispute-app/contracts/github-issues-schema.md`

### Video Clip Widget

**Data**: `type: "video-clip"`, `payload: { url, platform: "youtube"|"vimeo"|"other", videoId, startSeconds, endSeconds?, title, thumbnailUrl, fetchedAt }` — metadata fetched at compose time via the same corsproxy.io pattern as `citation-client.js`; `videoId` + `startSeconds` are parsed from the URL.

- [ ] T177 [P] Extend `src/api/citation-client.js` — add `fetchVideoMeta(url)`: parses YouTube/Vimeo URLs for `videoId` + timestamp params (`t=`, `start=`); fetches OG title + thumbnail via proxy; returns Video Clip payload in `src/api/citation-client.js`
- [ ] T178 [P] Implement `src/view/components/widgets/video-clip-widget.js` — `renderVideoClipWidget(payload)`: thumbnail image with a play-button overlay; title below; "▶ Play from X:XX" button opens the video URL (with timestamp) in a new tab; never embeds an iframe (avoids CSP complexity and autoplay issues) in `src/view/components/widgets/video-clip-widget.js`
- [ ] T179 [P] Add `"video-clip"` to the widget picker in `composer.js`: URL input → `fetchVideoMeta()` on blur → live preview of thumbnail + title + detected start time → optional end-time input → "Attach" commits in `src/view/components/composer.js`
- [ ] T180 Register `"video-clip"` in `widget-host.js`; add payload shape to schema in `src/view/components/widgets/widget-host.js` and `specs/001-better-dispute-app/contracts/github-issues-schema.md`
- [ ] T181 Add CSS: annotated-image SVG overlay (dashed rect, numbered badge, label tooltip), lightbox annotation preservation, video-clip thumbnail card (play-button overlay, title, timestamp badge) in `styles/main.css`
- [ ] T182 Add unit tests: `fetchVideoMeta` URL parsing (YouTube + Vimeo timestamp variants), annotation coordinate normalisation, annotated-image render with multiple boxes in `tests/unit/` and `tests/integration/`

---

## Phase 20: Strawman Composer Redesign — Callout, Required Challenge, and Author Notification

**Goal**: The strawman composer is purpose-built for one job: publicly disputing a specific claim someone made, with the intent to surface the dispute back to its author. It is redesigned from a generic assertion composer with a URL attachment into a three-step guided flow: **source the claim → state the challenge → notify the author**.

**Key design decisions**:
- A strawman post **always opens with a required, simultaneous challenge** — the two are one atomic submission. An unchallenged strawman post cannot be created.
- Pasting any URL auto-detects the source type and routes to the right widget (social post → Quote; article/blog/other → Web Citation) without the user choosing.
- The assertion text field is pre-filled with an editable suggestion derived from the quoted content.
- After submission, a **Notify panel** appears with a pre-composed callout ready to copy or launch directly on the source platform.
- The OG preview for a strawman assertion (Phase 10, T078) is extended to surface the original author's name and their words in `og:description`.

### Step 1 — Source Detection & Auto-Widget

- [ ] T183 Extend `src/api/citation-client.js` — add `detectAndFetch(url)`: inspects the hostname and URL shape to determine source type (`"social"` for twitter.com, x.com, bsky.app, facebook.com, instagram.com, threads.net; `"video"` for youtube.com, youtu.be, vimeo.com; `"article"` for everything else); calls `fetchQuote()`, `fetchVideoMeta()`, or `fetchCitation()` accordingly; returns `{ widgetType, payload }` in `src/api/citation-client.js`
- [ ] T184 Redesign the strawman variant of `renderComposer()` in `composer.js` — replace the flat `defaultWidget` option with a full `mode: "strawman"` composer mode that renders a three-step flow: **(1) Paste URL** → auto-detection spinner → resolved widget preview with detected author name and claim text; **(2) State your challenge** — assertion text field pre-filled with editable suggestion (social: quote text truncated to 150 chars; article: OG title); required inline challenge composer below (Interrogatory or Objection selector + challenge text; cannot submit without it); **(3) Review & Submit** — shows the final assertion card + challenge card side-by-side before committing; in `src/view/components/composer.js`
- [ ] T185 Update `submitAssertion()` in `home-controller.js` — add `strawmanChallenge` parameter; when present, atomically write the Assertion Issue then immediately write the Challenge Issue and Dispute Issue in sequence; if any write fails after the Assertion is created, surface a recovery notification with a link to finish the challenge manually; in `src/controller/home-controller.js`

### Step 2 — Assertion Text Auto-Suggestion

- [ ] T186 [P] Add `suggestAssertionText(widgetType, payload)` helper in `src/utils/url.js` (or a new `src/utils/suggest.js`): for `"quote"` returns the tweet/post text truncated to 150 chars with `"…"` suffix; for `"web-citation"` returns the OG title; for `"video-clip"` returns the video title; result is placed into the assertion text field as an editable pre-fill (not locked) in `src/utils/suggest.js`

### Step 3 — Notify the Author

- [ ] T187 [P] Implement `src/view/components/notify-panel.js` — `renderNotifyPanel({ widgetType, payload, disputeUrl })`: shown as a slide-up panel immediately after a strawman post submits successfully; displays: detected author handle (or domain for articles), a pre-composed notification message (e.g. `"@handle — your claim was disputed: {disputeUrl}"`), a **Copy** button (copies message to clipboard via `navigator.clipboard`), and platform-specific **Open on X / Open on Bluesky** intent buttons that open `https://x.com/intent/post?text=...` or `https://bsky.app/intent/compose?text=...` in a new tab; a "Done" button dismisses; in `src/view/components/notify-panel.js`
- [ ] T188 Wire `renderNotifyPanel()` into the strawman post-submit flow in `home-view.js`: after `submitAssertion()` resolves, render the notify panel over the current view (not navigating away); in `src/view/home-view.js`
- [ ] T189 [P] Build intent URL helpers in `src/utils/url.js`: `buildXIntentUrl(text)` → `https://x.com/intent/post?text={encoded}`; `buildBlueSkyIntentUrl(text)` → `https://bsky.app/intent/compose?text={encoded}`; max 280 chars enforced (truncate dispute URL suffix last); in `src/utils/url.js`

### OG Preview Enhancement for Strawman Posts

- [ ] T190 Update `worker/index.js` (T078) — when the requested Issue is a strawman Assertion with a `"quote"` or `"web-citation"` widget: set `og:title` to `"[authorHandle] disputed on disputable.io"`; set `og:description` to the original claim text (quote text or article title, truncated to 200 chars); set `og:image` to the original author's profile pic URL if available; this makes the shared dispute URL show the original person's own words as the social card preview in `worker/index.js`

### CSS & Tests

- [ ] T191 Add CSS: three-step strawman composer layout (step indicator, step transitions), auto-detection spinner + resolved widget preview, assertion pre-fill field (editable but visually distinct from blank), side-by-side review step, notify panel slide-up + platform intent buttons in `styles/main.css`
- [ ] T192 Add unit tests: `detectAndFetch` source-type routing (social/video/article hostnames), `suggestAssertionText` for each widget type, `buildXIntentUrl` + `buildBlueSkyIntentUrl` encoding and truncation, `submitAssertion` atomic write with partial-failure recovery in `tests/unit/`

---

## Phase 21: Strawman Persona — Decouple from GitHub User

**Goal**: The strawman persona is currently tied to a real GitHub account (`CONFIG.strawmanLogin` maps to an actual GitHub user). This creates friction (requires owning a dedicated GitHub account), leaks implementation details into the UI, and breaks down if the account changes. The persona should be fully config-defined — a synthetic identity with no required GitHub user backing — while remaining functional for writing Issues to the data repo.

**How Issue authorship works without a GitHub user**: Issues in the data repo are written by the *authenticated user* calling the API, regardless of what the `DSP:META` block says the post's `authorId` is. The strawman persona is a logical identity inside the app — the GitHub API author of the underlying Issue is irrelevant to BD's data model. The only remaining real dependency is the profile pic URL, which becomes a config field.

**Defaults if `CONFIG.strawman` is absent**: `{ displayName: "Strawman", handle: "strawman", profilePicUrl: null }` — the app renders a generated monogram profile pic (first letter of `displayName` in a circle using `--color-accent`) when `profilePicUrl` is null.

- [ ] T193 Replace `CONFIG.strawmanLogin` (GitHub username string) with `CONFIG.strawman` object in `src/config.sample.js` and `src/config.js`: shape `{ displayName: string, handle: string, profilePicUrl: string|null }`; defaults applied at runtime if the key is absent or partially populated; document the change and migration note in `src/config.sample.js`
- [ ] T194 Update `src/model/person.js` — remove `STRAWMAN_LOGIN` constant and the GitHub-API-derived `isStrawman(login)` check; replace with `Person.isStrawman()` instance method that compares `this.id` to a synthetic strawman ID (`"__strawman__"`); add `Person.strawman()` static factory that builds the persona from `CONFIG.strawman` with `id: "__strawman__"` and `isStrawmanPersona: true`; `fromGitHubUser()` never produces a strawman persona in `src/model/person.js`
- [ ] T195 Update all `isStrawman(strawmanLogin)` call sites in `home-controller.js`, `dispute-controller.js`, `home-view.js`, `post-card.js`, and `app.js` to use the new `person.isStrawmanPersona` boolean in `src/controller/home-controller.js`, `src/controller/dispute-controller.js`, `src/view/home-view.js`, `src/view/components/post-card.js`, and `src/app.js`
- [ ] T196 [P] Implement monogram profile pic fallback in `post-card.js` and `header.js`: when `person.profilePicUrl` is null, render a `<span class="profile-pic--monogram">` element (CSS circle, `--color-accent` background, first letter of `displayName`); used for the strawman persona and as a general fallback for any person whose profile pic fails to load (`onerror` handler) in `src/view/components/post-card.js` and `src/view/components/header.js`
- [ ] T197 Add CSS: `.profile-pic--monogram` circle (size-matched to `<img>` profile pic slots, `--color-accent` bg, white letter, same border-radius) in `styles/main.css`
- [ ] T198 Update unit tests in `tests/unit/model/models.test.js` and `tests/unit/controller/` to use the new `Person.strawman()` factory and `isStrawmanPersona` boolean; remove tests that relied on `STRAWMAN_LOGIN` string matching in `tests/unit/`

---

## Phase 22: Rebrand to disputable.io

**Goal**: Rename the product from its legacy brand to **disputable.io** consistently across all user-facing text, code identifiers, config, repo conventions, docs, and branding assets. The domain name is always written all-lowercase including in prose. The `.io` suffix is part of the name and is never dropped.

**Branding rules** (encode in all relevant files):
- Wordmark: `disputable.io` — all lowercase, never "Disputable.io" or "Disputable"
- Tagline: `every claim is disputable.` (lowercase, period intentional)
- Secondary taglines: `say it. defend it.` / `post it. prove it.`
- Accent colour anchor: fire orange (`#e85d04` or nearest existing `--color-*` token)
- Favicon: flame glyph (🔥) as interim; SVG flame to replace in a follow-up

### Code & Config

- [ ] T199 Rename `CONFIG.appName` value to `'disputable.io'` in `src/config.sample.js` and `src/config.js`; add `appName` field if not already present in `src/config.sample.js`
- [ ] T200 [P] Replace all legacy product-name string literals in `src/` with `"disputable.io"`; replace the old product shorthand in inline comments and JSDoc where it refers to the product name (leave `dsp:` label identifiers untouched — those are data-layer keys, not branding) across `src/`
- [ ] T201 [P] Update `<title>` in `index.html` to `disputable.io — every claim is disputable.`; update any `<meta name="description">` and `<meta property="og:site_name">` tags to `disputable.io` in `index.html`
- [ ] T202 [P] Update `renderHeader()` in `src/view/components/header.js`: replace the legacy title text with `disputable.io`; keep scales icon and version on far-right unchanged in `src/view/components/header.js`

### Repo & Config Naming Conventions

- [ ] T203 [P] Update `CONFIG` sample repo name convention: change `dataRepo` placeholder from `'YOUR_ORG/dsp-data'` to `'YOUR_ORG/disputable-data'`; update DEV/STG/PRD placeholders (`disputable-data-dev`, `disputable-data-stg`, `disputable-data-prd`) in `src/config.sample.js`
- [ ] T204 [P] Update `specs/001-better-dispute-app/quickstart.md` — replace legacy product-name / `dsp-data` references with `disputable.io` / `disputable-data`; update GitHub org placeholder to `disputableio` in `specs/001-better-dispute-app/quickstart.md`

### UI & Empty States

- [ ] T205 [P] Update all user-facing strings in `src/view/` — empty state messages, notification text, page headings — to use `disputable.io` branding and lowercase tone; update "Start a fire 🔥" composer placeholder to remain as-is (it's on-brand); update any legacy-name references in notification copy in `src/view/`
- [ ] T206 [P] Update the post-submit author callout template in `src/view/components/notify-panel.js` (T187) to read: `"your claim is disputable: {disputeUrl}"` — dropping the app name from the message body (the URL domain carries the brand) in `src/view/components/notify-panel.js`

### Docs & Specs

- [ ] T207 [P] Update `specs/001-better-dispute-app/spec.md`, `plan.md`, `research.md`, and `data-model.md` — replace legacy product-name references with `disputable.io` in headings and prose; leave `DSP:META` and `dsp:*` label identifiers unchanged (data-layer protocol identifiers, not product branding) across `specs/001-better-dispute-app/`
- [ ] T208 [P] Update `README.md` (create if absent) — product name `disputable.io`, one-line description using the tagline, link to quickstart, link to data repo convention in root `README.md`

### CSS & Favicon

- [ ] T209 [P] Verify `--color-accent` token in `styles/main.css` is fire orange (`#e85d04` or close); add `--app-tagline` as a CSS custom property comment block at the top of the file for reference; set `<link rel="icon">` in `index.html` to the 🔥 emoji favicon (`data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><text y='1em' font-size='1em'>🔥</text></svg>`) as an interim until a proper SVG is designed in `styles/main.css` and `index.html`

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Requires Phase 1 complete — **BLOCKS all user stories**
- **US1 (Phase 3)**: Requires Phase 2 — independent of all other stories ✅
- **US2 (Phase 4)**: Requires Phase 2 + US1 card/composer components ready ✅
- **US3 (Phase 5)**: Requires Phase 2 + US2 (challenge must exist to answer) ✅
- **US4 (Phase 6)**: Requires Phase 2 + US3 (dispute must be active) ✅
- **US5 (Phase 7)**: Requires Phase 2 + US1 (assertion cards) — **independent of US2–US4** ✅
- **US6 (Phase 8)**: Requires Phase 2 — URL routing overlaps US1–US5 but can be completed independently ✅
- **Polish (Phase 9)**: Requires all desired user stories complete

### User Story Dependencies

| Story | Depends on | Can run in parallel with |
|-------|-----------|--------------------------|
| US1 | Phase 2 | US5, US6 (partially) |
| US2 | Phase 2 + US1 components | US5 |
| US3 | Phase 2 + US2 | US5 |
| US4 | Phase 2 + US3 | US5 |
| US5 | Phase 2 + US1 | US2, US3, US4 |
| US6 | Phase 2 | US1 (start URL routing alongside) |

### Parallel Opportunities Per Story

**US1** (Phase 3):
```
T021 (controller) ──────────────────────────────► T024 (home-view)
T022 (post-card) ────────────────────────────────► T024
T023 (composer) ─────────────────────────────────► T024
                                                    T025, T026, T027 in parallel
```

**US2** (Phase 4):
```
T028 (canChallenge gate) ─► T029 (submitChallenge) ─► T032, T033
T030 (challenge button) ──► parallel with T031 (composer extension)
```

**US3** (Phase 5):
```
T034 ─► T035, T036 (gates, parallel) ─► T037 (submitAnswer)
T038 (dispute-view single-lane) ─► T039 (two-lane) parallel with T040 (answer composer)
T041, T042 parallel after T038
T043 (app-controller) parallel with all above
```

---

## Implementation Strategy

**MVP scope**: Phases 1–5 (US1, US2, US3) — delivers a working 1v1 dispute loop from Assertion → Challenge → Answer → Counter-Challenge with deep-link URLs.

**Increment 2**: Phase 6 (US4) — Resolution via Offers + Crickets countdown.

**Increment 3**: Phase 7 (US5) — Agreement and co-defence.

**Increment 4**: Phase 8 (US6) — Polished notifications.

**Increment 5**: Phase 9 — Coverage gates, accessibility, error hardening.

---

## Summary

| Phase | Tasks | Stories | Parallel tasks |
|-------|-------|---------|----------------|
| Phase 1 — Setup | T001–T007 | — | T003–T006 |
| Phase 2 — Foundational | T008–T020 | — | T009, T010, T014–T017 |
| Phase 3 — US1 (P1) 🎯 | T021–T027 | US1 | T022, T023, T026, T027 |
| Phase 4 — US2 (P1) | T028–T033 | US2 | T030, T031 |
| Phase 5 — US3 (P1) | T034–T044 | US3 | T035, T036, T040, T041, T043 |
| Phase 6 — US4 (P2) | T045–T055 | US4 | T048, T049 |
| Phase 7 — US5 (P2) | T056–T060 | US5 | T056, T057, T058 |
| Phase 8 — US6 (P3) | T061–T065 | US6 | T063, T064 |
| Phase 9 — Polish | T066–T077 | all | T066–T070 |
| **Total** | **77 tasks** | | |
