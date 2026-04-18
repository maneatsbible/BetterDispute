/**
 * GitHub REST API wrapper with ETag conditional GET caching.
 * All requests that need auth should pass the token.
 */

import * as cache from './cache.js';

const BASE_URL = 'https://api.github.com';
export const APP_ID = 'disputable.io';

export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {number} status  HTTP status code
   * @param {any}    body    Parsed response body (if available)
   */
  constructor(message, status, body = null) {
    super(message);
    this.name    = 'ApiError';
    this.status  = status;
    this.body    = body;
  }
}

/**
 * Perform a conditional-GET request, using the ETag cache.
 *
 * Returns cached data when the server responds 304 Not Modified.
 *
 * @param {string}      url   Full GitHub API URL
 * @param {string|null} token Bearer token (optional for public endpoints)
 * @returns {Promise<any>}    Parsed JSON body
 */
export async function get(url, token = null) {
  const cached = cache.get(url);
  const headers = _baseHeaders(token);
  if (cached?.etag) {
    headers['If-None-Match'] = cached.etag;
  }

  const res = await fetch(url, { headers });

  if (res.status === 304 && cached) {
    return cached.data;
  }

  if (!res.ok) {
    await _throwApiError(res);
  }

  const data = await res.json();
  const etag = res.headers.get('ETag');
  if (etag) {
    cache.set(url, etag, data);
  }
  return data;
}

/**
 * POST JSON to a GitHub API endpoint.
 *
 * @param {string}      url
 * @param {object}      body
 * @param {string|null} token
 * @returns {Promise<any>}
 */
export async function post(url, body, token = null) {
  const res = await fetch(url, {
    method:  'POST',
    headers: { ..._baseHeaders(token), 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    await _throwApiError(res);
  }
  return res.json();
}

/**
 * PATCH JSON to a GitHub API endpoint (e.g. update issue labels).
 *
 * @param {string}      url
 * @param {object}      body
 * @param {string|null} token
 * @returns {Promise<any>}
 */
export async function patch(url, body, token = null) {
  const res = await fetch(url, {
    method:  'PATCH',
    headers: { ..._baseHeaders(token), 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    await _throwApiError(res);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Body helpers
// ---------------------------------------------------------------------------

const META_OPEN  = '<!-- DSP:META';
const META_CLOSE = '-->';

/**
 * Build a GitHub Issue body from DSP:META + optional human-readable content.
 *
 * @param {object} meta    DSP:META JSON object
 * @param {string} content Human-readable text (may be empty string)
 * @returns {string}
 */
export function buildBody(meta, content = '') {
  const metaBlock = `${META_OPEN}\n${JSON.stringify(meta, null, 2)}\n${META_CLOSE}`;
  return content ? `${metaBlock}\n\n${content}` : metaBlock;
}

/**
 * Extract and parse the DSP:META JSON block from an issue body.
 *
 * @param {string} issueBody GitHub issue body string
 * @returns {object|null}    Parsed DSP:META object, or null if absent/invalid
 */
export function parseBody(issueBody) {
  if (!issueBody) return null;
  const start = issueBody.indexOf(META_OPEN);
  if (start === -1) return null;
  const innerStart = start + META_OPEN.length;
  const end = issueBody.indexOf(META_CLOSE, innerStart);
  if (end === -1) return null;
  const jsonStr = issueBody.slice(innerStart, end).trim();
  try {
    const meta = JSON.parse(jsonStr);
    if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return null;
    if (meta.appId !== APP_ID) return null;
    return meta;
  } catch {
    return null;
  }
}

/**
 * Build the full GitHub API URL for the issues endpoint.
 * @param {string} dataRepo  "owner/repo"
 * @returns {string}
 */
export function issuesUrl(dataRepo) {
  return `${BASE_URL}/repos/${dataRepo}/issues`;
}

/**
 * Build the URL for a specific issue number.
 * @param {string} dataRepo
 * @param {number} issueNumber
 * @returns {string}
 */
export function issueUrl(dataRepo, issueNumber) {
  return `${BASE_URL}/repos/${dataRepo}/issues/${issueNumber}`;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function _baseHeaders(token) {
  const headers = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function _throwApiError(res) {
  let body = null;
  try { body = await res.json(); } catch { /* ignore */ }
  throw new ApiError(
    body?.message ?? `HTTP ${res.status}`,
    res.status,
    body
  );
}
