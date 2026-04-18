/**
 * Model: Agreement, CricketsConditions, CricketsEvent
 */

import { parseBody } from '../api/github-client.js';

// ---------------------------------------------------------------------------
// Agreement
// ---------------------------------------------------------------------------

export class Agreement {
  /**
   * @param {number} id          GitHub issue number
   * @param {number} assertionId Issue number of the agreed-with Assertion
   * @param {number} personId    GitHub user id of the agreeing person
   * @param {string} login       GitHub login (resolved separately)
   * @param {string} createdAt   ISO 8601 string
   * @param {object} meta        Parsed DSP:META object
   */
  constructor(id, assertionId, personId, login, createdAt, meta) {
    this.id          = id;
    this.assertionId = assertionId;
    this.personId    = personId;
    this.login       = login;
    this.createdAt   = createdAt;
    this.meta        = meta;
  }

  /**
   * @param {object} issue
   * @param {string} login resolved login for personId
   * @returns {Agreement|null}
   */
  static fromIssue(issue, login = '') {
    const meta = parseBody(issue.body);
    if (!meta || meta.type !== 'agreement') return null;
    return new Agreement(
      issue.number,
      meta.assertionId,
      meta.personId,
      login,
      issue.created_at,
      meta
    );
  }
}

// ---------------------------------------------------------------------------
// CricketsConditions
// ---------------------------------------------------------------------------

export class CricketsConditions {
  /**
   * @param {number}      id                  GitHub issue number
   * @param {number}      disputeId
   * @param {number}      proposedByPersonId
   * @param {number|null} agreedByPersonId     null until accepted
   * @param {number}      durationMs           e.g. 86_400_000
   * @param {string|null} currentDeadlineIso   ISO 8601 or null
   * @param {string}      createdAt
   * @param {object}      meta
   */
  constructor(
    id, disputeId,
    proposedByPersonId, agreedByPersonId,
    durationMs, currentDeadlineIso,
    createdAt, meta
  ) {
    this.id                  = id;
    this.disputeId           = disputeId;
    this.proposedByPersonId  = proposedByPersonId;
    this.agreedByPersonId    = agreedByPersonId;
    this.durationMs          = durationMs;
    this.currentDeadlineIso  = currentDeadlineIso;
    this.createdAt           = createdAt;
    this.meta                = meta;
  }

  get isAgreed() { return this.agreedByPersonId !== null; }

  /** @param {object} issue @returns {CricketsConditions|null} */
  static fromIssue(issue) {
    const meta = parseBody(issue.body);
    if (!meta || meta.type !== 'crickets-conditions') return null;
    return new CricketsConditions(
      issue.number,
      meta.disputeId,
      meta.proposedByPersonId,
      meta.agreedByPersonId ?? null,
      meta.durationMs,
      meta.currentDeadlineIso ?? null,
      issue.created_at,
      meta
    );
  }
}

// ---------------------------------------------------------------------------
// CricketsEvent
// ---------------------------------------------------------------------------

export class CricketsEvent {
  /**
   * @param {number} id                 GitHub issue number
   * @param {number} disputeId
   * @param {number} challengeId        The unanswered Challenge issue number
   * @param {number} triggeredByPersonId
   * @param {string} detectedAtIso      ISO 8601
   * @param {string} createdAt
   * @param {object} meta
   */
  constructor(id, disputeId, challengeId, triggeredByPersonId, detectedAtIso, createdAt, meta) {
    this.id                   = id;
    this.disputeId            = disputeId;
    this.challengeId          = challengeId;
    this.triggeredByPersonId  = triggeredByPersonId;
    this.detectedAtIso        = detectedAtIso;
    this.createdAt            = createdAt;
    this.meta                 = meta;
  }

  /** @param {object} issue @returns {CricketsEvent|null} */
  static fromIssue(issue) {
    const meta = parseBody(issue.body);
    if (!meta || meta.type !== 'crickets-event') return null;
    return new CricketsEvent(
      issue.number,
      meta.disputeId,
      meta.challengeId,
      meta.triggeredByPersonId,
      meta.detectedAtIso,
      issue.created_at,
      meta
    );
  }
}
