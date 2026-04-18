/**
 * Model: Post hierarchy
 *
 * Encompasses Assertion, Challenge, and Answer — the core nodes of the
 * dispute tree stored as GitHub Issues.
 */

import { parseBody } from '../api/github-client.js';

export const POST_TYPE_ASSERTION = 'assertion';
export const POST_TYPE_CHALLENGE = 'challenge';
export const POST_TYPE_ANSWER    = 'answer';

export const CHALLENGE_TYPE_INTERROGATORY = 'interrogatory';
export const CHALLENGE_TYPE_OBJECTION     = 'objection';

// ---------------------------------------------------------------------------
// Base Post class
// ---------------------------------------------------------------------------

export class Post {
  /**
   * @param {number}      id           GitHub issue number
   * @param {string}      type         POST_TYPE_*
   * @param {string}      authorLogin  GitHub login of the author
   * @param {number}      authorId     GitHub user id
   * @param {string}      content      Human-readable body (stripped of DSP:META)
   * @param {string}      createdAt    ISO 8601 string
   * @param {object}      meta         Parsed DSP:META object
   */
  constructor(id, type, authorLogin, authorId, content, createdAt, meta) {
    this.id          = id;
    this.type        = type;
    this.authorLogin = authorLogin;
    this.authorId    = authorId;
    this.content     = content;
    this.createdAt   = createdAt;
    this.meta        = meta;
  }

  /** Factory: create the appropriate Post subclass from a GitHub Issue object. */
  static fromIssue(issue) {
    const meta = parseBody(issue.body);
    if (!meta) return null;

    const base = [
      issue.number,
      meta.type,
      issue.user?.login ?? '',
      issue.user?.id    ?? 0,
      _extractContent(issue.body),
      issue.created_at,
      meta,
    ];

    switch (meta.type) {
      case POST_TYPE_ASSERTION: return new Assertion(...base);
      case POST_TYPE_CHALLENGE: return new Challenge(...base);
      case POST_TYPE_ANSWER:    return new Answer(...base);
      default:                  return null;
    }
  }
}

// ---------------------------------------------------------------------------
// Assertion
// ---------------------------------------------------------------------------

export class Assertion extends Post {
  constructor(...args) {
    super(...args);
    this.parentId             = this.meta.parentId ?? null;
    this.rootId               = this.meta.rootId;
    this.isOffer              = this.meta.isOffer ?? false;
    this.offeredInDisputeId   = this.meta.offeredInDisputeId ?? null;
    this.proxyAuthor          = this.meta.proxyAuthor ?? null;
  }
}

// ---------------------------------------------------------------------------
// Challenge
// ---------------------------------------------------------------------------

export class Challenge extends Post {
  constructor(...args) {
    super(...args);
    this.parentId       = this.meta.parentId;
    this.rootId         = this.meta.rootId;
    this.disputeId      = this.meta.disputeId;
    this.challengeType  = this.meta.challengeType ?? CHALLENGE_TYPE_INTERROGATORY;
  }
}

// ---------------------------------------------------------------------------
// Answer
// ---------------------------------------------------------------------------

export class Answer extends Post {
  constructor(...args) {
    super(...args);
    this.parentId            = this.meta.parentId;
    this.rootId              = this.meta.rootId;
    this.disputeId           = this.meta.disputeId;
    this.yesNo               = this.meta.yesNo ?? null;
    this.counterChallengeId  = this.meta.counterChallengeId ?? null;
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const META_CLOSE = '-->';

/** Strip the DSP:META comment block and return the remaining text. */
function _extractContent(body) {
  if (!body) return '';
  const end = body.indexOf(META_CLOSE);
  if (end === -1) return body.trim();
  return body.slice(end + META_CLOSE.length).trim();
}
