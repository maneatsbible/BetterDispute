/**
 * Integration tests: github-client.js
 * Uses a fetch mock — no real network calls.
 */

import { describe, it, expect, beforeEach } from '../runner.js';
import {
  get, post, patch, buildBody, parseBody, issueUrl, issuesUrl, ApiError,
} from '../../src/api/github-client.js';

// ---------------------------------------------------------------------------
// fetch mock
// ---------------------------------------------------------------------------

let _fetchResponses = [];
let _fetchCalls     = [];

function mockFetch(responses) {
  _fetchResponses = Array.isArray(responses) ? [...responses] : [responses];
  _fetchCalls     = [];

  globalThis.fetch = async (url, opts) => {
    _fetchCalls.push({ url, opts });
    const res = _fetchResponses.shift();
    if (!res) throw new Error('No mock response queued');

    const bodyStr = JSON.stringify(res.body ?? null);
    return {
      ok:     res.status >= 200 && res.status < 300,
      status: res.status,
      headers: new Map(Object.entries(res.headers ?? {})),
      json:  () => Promise.resolve(res.body ?? null),
      text:  () => Promise.resolve(bodyStr),
    };
  };
}

// ---------------------------------------------------------------------------
// buildBody / parseBody
// ---------------------------------------------------------------------------

describe('buildBody / parseBody', () => {
  it('round-trips meta + content', () => {
    const meta    = { type: 'assertion', version: 1, appId: 'better-dispute' };
    const content = 'Hello world';
    const body    = buildBody(meta, content);
    const parsed  = parseBody(body);

    expect(parsed.type).toBe('assertion');
    expect(parsed.version).toBe(1);
    expect(body).toContain('Hello world');
  });

  it('returns null for body without BD:META', () => {
    expect(parseBody('No meta here')).toBeNull();
    expect(parseBody(null)).toBeNull();
    expect(parseBody('')).toBeNull();
  });

  it('returns null for body with invalid JSON in BD:META', () => {
    const bad = '<!-- BD:META\n{broken json\n-->';
    expect(parseBody(bad)).toBeNull();
  });

  it('buildBody with no content produces only the meta block', () => {
    const meta = { type: 'dispute', version: 1, appId: 'better-dispute' };
    const body = buildBody(meta);
    expect(body).toContain('BD:META');
    expect(parseBody(body).type).toBe('dispute');
  });
});

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

describe('issueUrl / issuesUrl', () => {
  it('builds correct issues list URL', () => {
    expect(issuesUrl('owner/repo')).toBe('https://api.github.com/repos/owner/repo/issues');
  });

  it('builds correct single-issue URL', () => {
    expect(issueUrl('owner/repo', 42)).toBe('https://api.github.com/repos/owner/repo/issues/42');
  });
});

// ---------------------------------------------------------------------------
// get() — ETag caching
// ---------------------------------------------------------------------------

describe('github-client.get', () => {
  beforeEach(() => {
    // Reset localStorage cache.
    try { localStorage.clear(); } catch { /* not in Node */ }
  });

  it('returns parsed JSON on a 200 response', async () => {
    mockFetch({ status: 200, body: [{ id: 1 }], headers: {} });
    const data = await get('https://api.github.com/repos/x/y/issues', null);
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].id).toBe(1);
  });

  it('throws ApiError on 4xx', async () => {
    mockFetch({ status: 404, body: { message: 'Not Found' } });
    let err;
    try { await get('https://api.github.com/repos/x/y/issues/99'); }
    catch (e) { err = e; }
    expect(err instanceof ApiError).toBe(true);
    expect(err.status).toBe(404);
  });

  it('sends Authorization header when token provided', async () => {
    mockFetch({ status: 200, body: [], headers: {} });
    await get('https://api.github.com/repos/x/y/issues', 'mytoken');
    const sentHeaders = _fetchCalls[0].opts.headers;
    expect(sentHeaders['Authorization']).toBe('Bearer mytoken');
  });
});

// ---------------------------------------------------------------------------
// post()
// ---------------------------------------------------------------------------

describe('github-client.post', () => {
  it('posts JSON and returns parsed response', async () => {
    mockFetch({ status: 201, body: { number: 5 } });
    const res = await post('https://api.github.com/repos/x/y/issues', { title: 'test' }, 'tok');
    expect(res.number).toBe(5);
    expect(_fetchCalls[0].opts.method).toBe('POST');
  });

  it('throws ApiError on 422', async () => {
    mockFetch({ status: 422, body: { message: 'Validation Failed' } });
    let err;
    try { await post('https://api.github.com/repos/x/y/issues', {}, 'tok'); }
    catch (e) { err = e; }
    expect(err instanceof ApiError).toBe(true);
    expect(err.status).toBe(422);
  });
});

// ---------------------------------------------------------------------------
// patch()
// ---------------------------------------------------------------------------

describe('github-client.patch', () => {
  it('sends PATCH method', async () => {
    mockFetch({ status: 200, body: { number: 5 } });
    await patch('https://api.github.com/repos/x/y/issues/5', { body: 'updated' }, 'tok');
    expect(_fetchCalls[0].opts.method).toBe('PATCH');
  });
});
