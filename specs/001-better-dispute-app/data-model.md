# Data Model: disputable.io

**Phase**: 1 — Design  
**Date**: 2026-04-18  
**Plan**: [plan.md](plan.md)

---

## Entities

### Person

Represents an authenticated GitHub user.

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `id` | `number` | GitHub user id | Globally unique, immutable |
| `name` | `string` | GitHub login prefixed `@` | e.g., `@alice` |
| `profilePicUrl` | `string` | GitHub `avatar_url` | Display only |
| `isStrawman` | `boolean` | Derived | `true` if `name === '@strawman'` |

**Special instance**: `@strawman` — a pre-configured GitHub account. Any authenticated Person can post an Assertion as @strawman by using the @strawman token (stored as a repo secret / env var in the static site build). A Person who posts as @strawman is recorded in the metadata as `proxyAuthor`.

**Constraints**:
- A Person MUST NOT challenge their own Post.
- A Person MUST NOT challenge a Post they have agreed with.
- A Person MUST NOT challenge the same Post more than once.

---

### Post (abstract)

The base of all user-created content. Every Post is a GitHub Issue in the shared repo.

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `id` | `number` | GitHub issue number | Globally unique within the repo |
| `type` | `enum` | `DSP:META.type` | `"assertion"`, `"challenge"`, `"answer"` |
| `authorId` | `number` | GitHub issue `user.id` | Person who created the Issue |
| `proxyAuthor` | `string \| null` | `DSP:META.proxyAuthor` | Set when posting as @strawman |
| `parentId` | `number \| null` | `DSP:META.parentId` | Parent Post id; `null` for root Assertions |
| `rootId` | `number` | `DSP:META.rootId` | Id of the root Assertion in this tree |
| `text` | `string \| null` | Issue body (after meta comment) | Optional for non-root posts |
| `imageUrl` | `string \| null` | `DSP:META.imageUrl` | GitHub issue attachment URL |
| `createdAt` | `ISO8601` | GitHub `created_at` | |
| `disputeId` | `number \| null` | `DSP:META.disputeId` | The Dispute this post belongs to, if any |

**Validation rules**:
- Top-level Assertions (`parentId === null`): MUST have `text` XOR `imageUrl` (not both, not neither).
- Non-root Posts: MAY have both `text` and `imageUrl`.
- All Posts: issued body is immutable after creation (append-only).

---

### Assertion (extends Post)

A top-level claim or a resolution Offer. The root of every Post tree.

| Field | Type | Notes |
|-------|------|-------|
| `isOffer` | `boolean` | `DSP:META.isOffer` — `true` when submitted as a resolution Offer within a Dispute |
| `offeredInDisputeId` | `number \| null` | The Dispute this offer belongs to |

**State transitions** (derived from child entities):

```
OPEN ──(any challenge)──► DISPUTED
DISPUTED ──(offer accepted by both)──► RESOLVED
DISPUTED ──(crickets)──► CRICKETS
```

---

### Challenge (extends Post)

A challenge to any Post.

| Field | Type | Notes |
|-------|------|-------|
| `challengeType` | `enum` | `"interrogatory"` or `"objection"` |
| `questionText` | `string` | The challenge text; for Interrogatory this must be a Y/N question |

**Constraints**:
- `authorId` MUST NOT equal the `authorId` of the challenged Post.
- Only one Challenge per Person per Post (enforced by controller via API query before submission).

---

### Answer (extends Post)

A response to a Challenge.

| Field | Type | Notes |
|-------|------|-------|
| `yesNo` | `boolean \| null` | `DSP:META.yesNo` — REQUIRED for Interrogatory; `null` for Objection |
| `counterChallengeId` | `number \| null` | Id of the Challenge Post included in this Answer, if any |

**Constraints**:
- `yesNo` MUST be `true` or `false` if the parent Challenge is Interrogatory.
- `yesNo` MUST be `null` if the parent Challenge is Objection.
- At most one counter-challenge per Answer.

---

### Dispute

A first-class 1v1 duel between two Persons, triggered by a Challenge.

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `id` | `number` | GitHub issue number | |
| `challengerId` | `number` | `DSP:META.challengerId` | Person who issued the first Challenge |
| `defenderId` | `number` | `DSP:META.defenderId` | Person who must answer first |
| `rootPostId` | `number` | `DSP:META.rootPostId` | The Post that was challenged to start this Dispute |
| `triggerChallengeId` | `number` | `DSP:META.triggerChallengeId` | The initial Challenge Post |
| `currentTurnPersonId` | `number` | Derived — last action determines turn | |
| `status` | `enum` | Derived from child Issues | `"active"`, `"resolved"`, `"crickets"` |
| `cricketsConditions` | `CricketsConditions \| null` | Derived from child Issues | |
| `createdAt` | `ISO8601` | GitHub `created_at` | |

**Labels on the Dispute Issue**: `dsp:dispute`, `dsp:active` (or `dsp:resolved` / `dsp:crickets-event`).

**Turn derivation rule**: The Person whose last action in the Dispute was answered is "waiting"; the other person is "to move". On Dispute creation, `currentTurnPersonId = defenderId`.

---

### CricketsConditions

Negotiated timeout conditions within a Dispute. Stored as a child GitHub Issue.

| Field | Type | Notes |
|-------|------|-------|
| `disputeId` | `number` | Parent Dispute |
| `proposedByPersonId` | `number` | Who proposed the conditions |
| `agreedByPersonId` | `number \| null` | `null` until accepted |
| `durationMs` | `number` | Agreed countdown per challenge in milliseconds |
| `active` | `boolean` | `true` once both parties have agreed |
| `currentDeadlineIso` | `ISO8601 \| null` | When the current challenge's countdown expires |
| `proposalIssueId` | `number` | The GitHub Issue recording the proposal |

**State transitions**:
```
PROPOSED ──(other party accepts or counter-proposes)──► NEGOTIATING
NEGOTIATING ──(both agree)──► ACTIVE
ACTIVE ──(deadline passes, no answer)──► CRICKETS_EVENT triggered
```

---

### Agreement

Records that a Person has agreed with an Assertion, making them eligible to defend it.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | GitHub issue number |
| `assertionId` | `number` | The Assertion agreed with |
| `personId` | `number` | The person who agreed |
| `createdAt` | `ISO8601` | |

**Constraints**:
- A Person MUST NOT agree with an Assertion they authored.
- A Person who has agreed with an Assertion MUST NOT challenge that same Assertion.
- One Agreement per Person per Assertion.

---

### CricketsEvent

Records that a Crickets deadline expired. Stored as a child GitHub Issue.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | GitHub issue number |
| `disputeId` | `number` | |
| `challengeId` | `number` | The unanswered Challenge |
| `triggeredByPersonId` | `number` | First client to write this event |
| `detectedAt` | `ISO8601` | Client-detected time |
| `createdAt` | `ISO8601` | GitHub `created_at` |
| `isDisputed` | `boolean` | Derived — `true` if a dispute sub-issue exists |

---

## State Transitions Summary

### Dispute Status

```
                       ┌─────────────┐
                       │   ACTIVE    │
                       └──────┬──────┘
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
   Both accept offer   Crickets deadline    (ongoing turns)
          │              expires
          ▼                    ▼
     RESOLVED           CRICKETS_PENDING
                              │
                    ┌─────────┴──────────┐
                    ▼                    ▼
            Answer disputed        Not disputed
                    │                    │
                    ▼                    ▼
          new sub-Dispute          CRICKETS (final)
```

### Post Type Icons (UI mapping)

| Post Type | Icon char | CSS class |
|-----------|-----------|-----------|
| Assertion | `!` (bang) | `.icon-assertion` |
| Challenge | `?` | `.icon-challenge` |
| Answer | `✓` | `.icon-answer` |

---

## GitHub Issues → Entity Mapping

| Entity | GitHub Issues label | Key metadata fields |
|--------|--------------------|---------------------|
| Assertion | `dsp:assertion` | `parentId=null`, `rootId=self` |
| Challenge | `dsp:challenge` | `parentId`, `rootId`, `challengeType`, `disputeId` |
| Answer | `dsp:answer` | `parentId`, `rootId`, `yesNo`, `counterChallengeId`, `disputeId` |
| Dispute | `dsp:dispute` | `challengerId`, `defenderId`, `rootPostId`, `triggerChallengeId` |
| Agreement | `dsp:agreement` | `assertionId`, `personId` |
| Offer | `dsp:offer`, `dsp:assertion` | `isOffer=true`, `offeredInDisputeId` |
| CricketsConditions | `dsp:crickets-conditions` | `disputeId`, `durationMs`, `agreedByPersonId` |
| CricketsEvent | `dsp:crickets-event` | `disputeId`, `challengeId` |

---

## Controller Permission Gates

These are implemented in `DisputeController` and `HomeController`. The View reads these — it never decides them.

| Method | Rule |
|--------|------|
| `canChallenge(person, post)` | Person is authenticated AND person ≠ post.authorId AND no existing Challenge by person on this post AND person has not agreed with post (if Assertion) |
| `canAnswer(person, challenge)` | Person is the current-turn player in the Dispute AND challenge is unanswered |
| `canCounterChallenge(person, answer)` | Person is answering AND has not yet included a counter-challenge in this Answer |
| `canAgree(person, assertion)` | Person is authenticated AND person ≠ assertion.authorId AND no existing Agreement by person on this assertion AND person has not challenged this assertion |
| `canOffer(person, dispute)` | Person is a party in the Dispute AND dispute.status === 'active' |
| `canAcceptOffer(person, offer)` | Person is the OTHER party from the offer author AND offer is in person's active dispute |
| `canProposeCrickets(person, dispute)` | Person is a party AND dispute.status === 'active' AND no pending un-agreed conditions |
| `canDeclareCrickets(dispute)` | CricketsConditions.active === true AND Date.now() > currentDeadlineIso AND no CricketsEvent yet exists for this challenge |
| `canDisputeCrickets(person, cricketsEvent)` | Person is the party who failed to answer AND cricketsEvent.isDisputed === false |
