# Feature Specification: disputable.io

**Feature Branch**: `001-better-dispute-app`
**Created**: 2026-04-18
**Status**: Draft
**Input**: User description: "I want to build an app called disputable.io — plain vanilla JavaScript, runs in browser, GitHub back-end for users/repos/issues. No external frameworks or libraries."

---

## Clarifications

### Session 2026-04-18

- Q: How should GitHub authentication be handled on a static site with no server? → A: GitHub Device Flow for v1 (zero-server); serverless token-exchange function planned for v2.
- Q: Where do GitHub Issues (Posts/Disputes) live — single shared repo, per-topic, or per-user? → A: Single shared repo owned by the app (e.g., `disputableio/disputable-data`); all users' content is stored as issues there.
- Q: When multiple people have agreed with an Assertion and it is challenged, how many Disputes are created? → A: One Dispute per challenger–defender pair; each agre-er who chooses to respond opens their own separate 1v1 Dispute.
- Q: How is the Crickets countdown enforced with no server? → A: Agreed deadline timestamp stored in the GitHub Issue body; clients compute remaining time on load; the first client to load past the deadline writes the Crickets event as a new GitHub Issue.
- Q: What is the caching and pre-fetching strategy given GitHub API rate limits? → A: localStorage cache with ETag-based conditional GETs (If-None-Match); viewport pre-fetch for visible Home feed cards.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View and Start Assertions (Priority: P1)

A visitor opens disputable.io in their browser. They see the Home view listing top-level Assertions as summary cards. They can authenticate via GitHub and compose a new Assertion (text and/or a single image). They can also post as the special @strawman persona to plant a position for others to dispute.

**Why this priority**: The assertion feed and composition are the entry point for all activity. Without this, no disputes can begin.

**Independent Test**: A logged-in user can type text, submit an Assertion, and see it appear as a new card on the Home feed. Can be demonstrated with a single assertion and no challenges.

**Acceptance Scenarios**:

1. **Given** the user is unauthenticated, **When** they visit the Home view, **Then** they see the assertion feed in read-only mode with all interactive controls disabled.
2. **Given** the user is authenticated, **When** they type in the "Start a fire... 🔥" composer and submit, **Then** a new top-level Assertion card appears at the top of the feed.
3. **Given** the user wants to post as @strawman, **When** they toggle the strawman option before submitting, **Then** the Assertion is attributed to @strawman.
4. **Given** the user uploads an image, **When** they submit a top-level Assertion, **Then** the Assertion contains either the text or the image (not both — top-level is text OR image).
5. **Given** any Assertion card is visible, **When** the user clicks the copy icon, **Then** the canonical URL for that Assertion is copied to their clipboard.

---

### User Story 2 — Challenge a Post (Priority: P1)

An authenticated user views an Assertion they disagree with. They open an inline Compose panel (slide-up) and submit a Challenge of type Interrogatory (Y/N question) or Objection. A Dispute object is created. From that point forward the Dispute has its own view.

**Why this priority**: Challenging is the core mechanic. Without it there are no Disputes.

**Independent Test**: One user challenges another's Assertion. The Dispute is created and both users can navigate to the Dispute View.

**Acceptance Scenarios**:

1. **Given** Person A has posted an Assertion, **When** Person B (not the author) taps the Challenge icon, **Then** the inline Compose panel slides up showing Interrogatory and Objection options.
2. **Given** Person B fills in an Interrogatory challenge and submits, **Then** a new Dispute is created and Person A sees a "You were challenged" notification.
3. **Given** a person attempts to challenge their own Post, **Then** the Challenge icon is disabled (visible but non-interactive) and no action is taken.
4. **Given** Person B has already challenged a Post once, **When** they view that Post again, **Then** the Challenge icon is disabled for that Post.
5. **Given** a challenge is submitted, **When** the view refreshes, **Then** the card reflects the new challenge and shows a "Your turn" badge to the challenged person.

---

### User Story 3 — Answer a Challenge and Counter-Challenge (Priority: P1)

In a Dispute View, the challenged person can answer a challenge. Interrogatory answers require a Yes or No selection plus optional text. The answerer may also submit an optional counter-challenge, transforming the Dispute into a turn-based duel.

**Why this priority**: The answer-challenge cycle is the core loop of a dispute. Without it disputes cannot progress or resolve.

**Independent Test**: Person A answers Person B's Interrogatory with "Yes" and a follow-up counter-challenge. The Dispute View updates to show two lanes.

**Acceptance Scenarios**:

1. **Given** a pending Interrogatory challenge, **When** the challenged person opens the Answer panel, **Then** they see Yes/No radio buttons and an optional text field.
2. **Given** the answer is submitted, **Then** the Dispute View refreshes showing the answer on a card.
3. **Given** the answerer includes a counter-challenge, **When** the view refreshes after submission, **Then** the Dispute View splits into two lanes — challenges on the left, counter-challenges on the right — interleaved chronologically.
4. **Given** it is not the user's turn in a duel, **Then** the Challenge/Answer icons are disabled.
5. **Given** an Objection challenge, **When** the answerer opens the Answer panel, **Then** the form does not show Yes/No buttons; it shows a free-text response field.

---

### User Story 4 — Dispute Resolution: Agreement and Crickets (Priority: P2)

Either party can put forward an offer (an Assertion proposed for agreement) to resolve the Dispute. Alternatively, one party can propose Crickets conditions (a countdown timer per challenge). Both parties must negotiate and agree on those terms. If a person fails to respond within the agreed time, a Crickets event is triggered and displayed prominently.

**Why this priority**: Resolution paths are essential for the product's purpose but can be layered on top of the basic challenge loop.

**Independent Test**: Two users agree on a 24-hour crickets countdown, one party fails to answer, and the Crickets event is displayed with the chirping indicator.

**Acceptance Scenarios**:

1. **Given** two parties are in a Dispute, **When** one submits an offer Assertion, **Then** the other sees the offer and can accept or dispute it.
2. **Given** both parties accept an offer, **Then** the Dispute is marked resolved and the resolution is shown in both the Dispute View and the Home card.
3. **Given** one party proposes Crickets conditions (time limit), **When** the other party counters or accepts, **Then** the agreed countdown becomes active on the next unanswered challenge.
4. **Given** the countdown expires without an answer, **Then** a Crickets event is displayed prominently (visual + audio cue of crickets chirping).
5. **Given** a Crickets event is triggered, **When** the affected party disputes the event, **Then** a new sub-dispute is created to contest the Crickets ruling.

---

### User Story 5 — Agree With and Support an Assertion (Priority: P2)

A person can agree with an existing Assertion. This allows them to answer challenges directed at that Assertion on behalf of the original author's position, participating as a co-defender.

**Why this priority**: Agreement/support is a strong differentiator from regular comment threads and enables community participation in disputes.

**Independent Test**: Person C agrees with @strawman's Assertion and is then eligible to answer challenges against it.

**Acceptance Scenarios**:

1. **Given** an Assertion posted by another person, **When** an authenticated user clicks Agree, **Then** they become eligible to answer challenges to that Assertion.
2. **Given** a challenge is issued against an Assertion with multiple agreers, **Then** any agre-er can answer the challenge (creating a separate Dispute thread per responder).

---

### User Story 6 — Notification and Navigation (Priority: P3)

Users receive notifications when challenged or when their answer is challenged. The app is fully URL-param driven, allowing any Post or Dispute to be shared via canonical URL.

**Why this priority**: Notifications and deep-linking sustain engagement and enable sharing but are non-blocking for core mechanics.

**Independent Test**: A shared Post URL opens directly to the correct Dispute View without requiring Home navigation first.

**Acceptance Scenarios**:

1. **Given** Person A is challenged, **When** they next open the app, **Then** a notification "You were challenged" is shown and their Home feed card shows a "Your turn" badge.
2. **Given** any Post or Dispute is visible, **When** the user copies its canonical URL and opens it in a new tab, **Then** the app loads the correct view for that Post/Dispute.
3. **Given** the URL contains a dispute or post param, **When** the app initialises, **Then** it renders the appropriate Dispute View or Home card directly.

---

### Edge Cases

- What happens when a GitHub API call fails mid-challenge submission? The optimistic UI must roll back and inform the user.
- What if the same person is invited via a shared URL but is already a party to that Dispute? They are taken directly to the Dispute View in their correct role.
- What if @strawman is challenged by the only person who agreed with the Assertion? They become both defender and challenger simultaneously — this must be disallowed; a person MUST NOT challenge an Assertion they have agreed with.
- What if the same challenge type (Interrogatory/Objection) is submitted twice in one turn by accident? The UI must prevent double-submission after first submit.
- What if an image file exceeds GitHub's issue attachment limits? The user is shown an error before submission and the form is not cleared.
- What if a Dispute has no challenges yet (terminal card)? The Home summary card is visually dimmed/terminal-style but still shows the Assertion text; clicking is disabled with a subtle non-clickable indicator.

---

## Platform Philosophy

### On Argumentation Style

disputable.io is built on the conviction that **the best disputes are won with evidence and truth, not with rhetorical technique**. The platform therefore explicitly discourages philosophical argumentation — the construction of formal syllogisms, premise-mapping, and validity-based "winning" — as a primary mode of engagement. Such approaches reward structural cleverness over substantive engagement and can be used to avoid rather than address what is actually true.

This philosophy is expressed in the product in two ways:

1. **Post types** (Assertion, Challenge, Answer) are designed around substantive assertions, questions, and responses — not logical scaffolding.
2. **Logic & Reasoning widgets** (Fallacy Tag, Claim Map) are available *only as post-hoc diagnostic tools* — they describe errors and patterns in reasoning that has already occurred, never as a method to construct or win an argument. They are restricted to Challenge and Answer posts (not Assertions) and to Moment annotations.

> A Fallacy Tag names a failure that happened. A Claim Map renders visible what was implicit. Neither is an argument.

---

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Identity**

- **FR-001**: The app MUST authenticate users through the GitHub Device Flow (OAuth Device Authorization Grant) in v1; no server-side component is required. A standard redirect-based OAuth flow (requiring a serverless token-exchange endpoint) is the planned v2 upgrade. No separate account system exists.
- **FR-002**: Each Person MUST have a unique `@name` derived from their GitHub username and a unique id from their GitHub user id.
- **FR-003**: The @strawman persona MUST be a pre-configured special account that any authenticated user can post as.

**Posts & Tree Structure**

- **FR-004**: The system MUST support three Post types: Assertion, Challenge, Answer.
- **FR-005**: Every Post MUST be a node in a tree whose root is an Assertion; the tree structure MUST be stored as GitHub Issues in a single shared app-owned repository (one Issue per Post, parent encoded in issue body/metadata).
- **FR-006**: Top-level Assertions MUST contain either text OR a single image, not both.
- **FR-007**: Non-root Posts (Challenges, Answers) MAY contain text AND a single image.
- **FR-008**: All Posts MUST have globally unique ids (GitHub issue number within the repo serves as the id).
- **FR-009**: The GitHub Issues store MUST be treated as append-only; no Issue bodies are ever edited after creation.

**Challenges**

- **FR-010**: Challenge type MUST be one of: Interrogatory (Y/N question) or Objection (free-form validity/form/relevance objection).
- **FR-011**: A Person MUST NOT be able to challenge their own Post; the Challenge control MUST be disabled for the author.
- **FR-012**: A Person MUST NOT challenge the same Post more than once; after one challenge the control is disabled.
- **FR-013**: When a Challenge is submitted, a Dispute object MUST be created and assigned a unique id.

**Disputes**

- **FR-014**: Disputes MUST be first-class objects stored as GitHub Issues with a distinct label.
- **FR-015**: A Dispute involves exactly two Persons (one challenger, one defender); the controller MUST enforce whose turn it is. Multiple agre-ers of the same Assertion each participate in their own independent 1v1 Dispute with the challenger.
- **FR-016**: A counter-challenge from the answerer MUST be permitted; this triggers the two-lane Dispute View layout.
- **FR-017**: Any third Person who challenges any Post within a Dispute MUST generate a new, separate Dispute.
- **FR-018**: Persons who have agreed with an Assertion MUST be eligible to respond to challenges against it; each responding agre-er MUST open a new independent 1v1 Dispute with the challenger (one Dispute per challenger–defender pair).

**Answers**

- **FR-019**: An Answer to an Interrogatory Challenge MUST include a Yes/No selection; free-text is optional.
- **FR-020**: An Answer to an Objection Challenge MUST include free-text only; no Yes/No selection.
- **FR-021**: An Answer MAY include an optional counter-challenge (one Challenge per Answer).

**Resolution**

- **FR-022**: Either party in a Dispute MAY submit an offer (an Assertion) as a proposed resolution; the other party can accept or dispute it.
- **FR-023**: When both parties accept an offer, the Dispute MUST be marked resolved.
- **FR-024**: Either party MAY propose Crickets conditions (a countdown duration per challenge); conditions MUST be mutually agreed before activation. The agreed absolute deadline timestamp MUST be stored in the Dispute's GitHub Issue body.
- **FR-025**: Upon expiry of an agreed Crickets countdown, the Crickets event MUST be triggered client-side: whichever participant's client loads the Dispute View after the deadline MUST write a Crickets event as a new GitHub Issue (append-only), then display the event prominently with a visual indicator and an audio cue (Web Audio API crickets chirp).
- **FR-026**: A Crickets event MAY be disputed by the answerer, creating a new sub-dispute.

**MVC Architecture**

- **FR-027**: All permission logic (canChallenge, canAnswer, canDispute, canAgree, etc.) MUST reside in the Controller; the View MUST NOT make permission decisions.
- **FR-028**: The View MUST only read Controller state and render accordingly; it MUST disable (not hide) controls that are unavailable.
- **FR-029**: The Model MUST map directly to GitHub API entities (Users → Person, Issues → Post/Dispute).

**URL & Navigation**

- **FR-030**: Every Post and Dispute MUST have a canonical URL expressed as browser URL params.
- **FR-031**: The app MUST interpret URL params on load and render the correct view (Home or Dispute View for the specified entity).
- **FR-032**: A copy-to-clipboard button MUST appear on every Post card.

**UI / UX**

- **FR-033**: The app MUST use a dark theme with select colorful accent elements.
- **FR-034**: The header MUST contain: home/scales icon (top-left), `disputable.io`, and the current version (far right).
- **FR-035**: Post type icons MUST be: Assertion = `!`, Challenge = `?`, Answer = `✓`.
- **FR-036**: Home View MUST list top-level Assertion/Dispute summary cards; cards MUST show a "Your turn" badge when applicable.
- **FR-037**: Cards with no challenges MUST be visually indicated as terminal (dimmed or non-interactive styling) without a text label.
- **FR-038**: The Inline Composer (challenge/answer input) MUST slide up in-place, preserve draft text on cancel, and dismiss on deliberate close.
- **FR-039**: After any submission the current view MUST refresh to reflect the updated state.
- **FR-040**: Notifications ("You were challenged", "Your answer was challenged") MUST appear for pending actions.
- **FR-041**: Cards in the Home feed MUST be cliché click-anywhere-to-open, like X (Twitter).
- **FR-042**: Stacked card depth MUST be conveyed visually (slight z-offset shadow stacking).
- **FR-043**: The Dispute View MUST show the full Post lineage at top as parent chain with arrow separators (no "lineage" label).
- **FR-044**: The two-lane Dispute View (after first counter-challenge) MUST interleave challenges and counter-challenges chronologically.
- **FR-045**: The "Your turn" indicator MUST be shown within the active Dispute View.
- **FR-046**: The latest actionable Post MUST be highlighted.
- **FR-047**: The app MUST use no external JavaScript frameworks or libraries; plain vanilla JS only.
- **FR-048**: The app MUST cache GitHub API responses in `localStorage` using HTTP ETag-based conditional requests (`If-None-Match` header); unchanged resources MUST return 304 and be served from cache, consuming zero rate-limit quota.
- **FR-049**: The Home feed MUST pre-fetch Dispute detail data for all Post cards visible in the current viewport.

### Key Entities

- **Person**: A GitHub user. Attributes: unique `@name` (GitHub login), unique id (GitHub user id). Special instance: @strawman.
- **Post** (abstract): Base for Assertion, Challenge, Answer. Attributes: unique id (GitHub issue number), author (Person), type, parent Post id,  text (optional), image URL (optional), created timestamp.
  - **Assertion**: Root-level or offer Post. Top-level: text OR image only. Can be agreed with.
  - **Challenge**: Child of any Post. Type: Interrogatory | Objection. Constraints: not self-challenge, not duplicate challenge on same Post.
  - **Answer**: Child of a Challenge. Includes mandatory Yes/No for Interrogatory; free-text for Objection. May include one counter-challenge.
- **Dispute**: First-class object. Attributes: unique id (GitHub issue number with distinct label), two Persons (challenger, challenged), status (active | resolved | crickets), root Post, current turn (Person), crickets conditions (optional).
- **CricketsConditions**: Agreed-upon countdown duration per challenge. Attributes: duration, agreed-by (both Persons), active (bool).
- **Agreement**: A Person's explicit agreement with an Assertion. Stored as a GitHub issue comment or reaction.
- **Offer**: An Assertion submitted within a Dispute as a proposed resolution.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user can read the Home feed, authenticate with GitHub, compose an Assertion, and see it appear in the feed — all within 3 minutes.
- **SC-002**: Any Post or Dispute can be opened via its canonical URL in a freshly opened browser tab without additional navigation steps.
- **SC-003**: All permission controls (Challenge, Answer, Agree) accurately reflect the current user's eligibility — zero cases of an unauthorised action being permitted client-side.
- **SC-004**: The full challenge-answer-counter-challenge cycle for one Dispute round-trips (submit → GitHub → re-render) in under 4 seconds on a standard broadband connection.
- **SC-005**: The Home feed loads and renders the first screen of cards in under 2 seconds on a standard broadband connection.
- **SC-006**: A Crickets countdown expiry triggers a visible and audible Crickets event within 5 seconds of the deadline passing.
- **SC-007**: 100% of Post/Dispute state changes are persisted to GitHub Issues; no client-only state mutations go unrecorded.

---

## Assumptions

- Users have a GitHub account and are willing to authorise the app via the GitHub Device Flow (no server required for v1).
- Authentication in v1 uses GitHub Device Flow (user enters a short code at github.com/login/device); a serverless OAuth token-exchange function is the planned v2 upgrade for a standard redirect-based sign-in experience.
- A single shared GitHub repository (owned by the app organisation) is used as the append-only data store for all Posts and Disputes; it is pre-created and configured. Repository selection or creation by users is out of scope for v1.
- Mobile browser support is a stretch goal; v1 targets modern desktop browsers (Chrome, Firefox, Safari, Edge).
- Real-time push notifications (WebSockets/SSE) are out of scope; the app polls or refreshes on user action.
- GitHub API responses MUST be cached in `localStorage` using ETag-based conditional GET requests (`If-None-Match`) to minimise rate-limit consumption. Dispute detail data MUST be pre-fetched for cards visible in the viewport.
- The @strawman GitHub account is pre-created and its OAuth token is available to the app as a configured secret for posting on behalf of @strawman.
- Audio for the Crickets event uses the Web Audio API (no external audio library); a simple generated chirp pattern is acceptable for v1.
- Accessibility (WCAG 2.1 AA) is a goal but secondary to functional completeness in v1.
- The app is deployed as a static site (GitHub Pages or equivalent); no server-side rendering is involved.
- Image uploads are handled by attaching images to GitHub Issues via the GitHub API; file size limits are governed by GitHub's limits (~10 MB per attachment).
