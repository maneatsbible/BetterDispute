/**
 * Integration tests: cache.js ETag flow
 */

import { describe, it, expect, beforeEach } from '../runner.js';
import { get, set, invalidate, invalidatePattern } from '../../src/api/cache.js';

// ---------------------------------------------------------------------------
// localStorage stub (for Node / test environments)
// ---------------------------------------------------------------------------

const _store = {};
if (typeof localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem:    key       => _store[key] ?? null,
    setItem:    (key, v)  => { _store[key] = String(v); },
    removeItem: key       => { delete _store[key]; },
    clear:      ()        => { Object.keys(_store).forEach(k => delete _store[k]); },
    get length()          { return Object.keys(_store).length; },
    key:        i         => Object.keys(_store)[i] ?? null,
  };
}

// ---------------------------------------------------------------------------

describe('cache', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null for a missing key', () => {
    expect(get('https://api.github.com/repos/x/y/issues')).toBeNull();
  });

  it('stores and retrieves a cached entry', () => {
    const url  = 'https://api.github.com/repos/x/y/issues';
    const etag = '"abc123"';
    const data = [{ id: 1 }];
    set(url, etag, data);

    const entry = get(url);
    expect(entry).toBeTruthy();
    expect(entry.etag).toBe(etag);
    expect(entry.data[0].id).toBe(1);
  });

  it('invalidate removes a specific entry', () => {
    const url = 'https://api.github.com/repos/x/y/issues/5';
    set(url, '"etag1"', { number: 5 });
    expect(get(url)).toBeTruthy();

    invalidate(url);
    expect(get(url)).toBeNull();
  });

  it('invalidatePattern removes all matching entries', () => {
    const base     = 'https://api.github.com/repos/x/y/issues';
    const url1     = `${base}?labels=dsp%3Aassertion`;
    const url2     = `${base}?labels=dsp%3Achallenge`;
    const otherUrl = 'https://api.github.com/repos/other/repo/issues';

    set(url1,     '"e1"', [{ id: 1 }]);
    set(url2,     '"e2"', [{ id: 2 }]);
    set(otherUrl, '"e3"', [{ id: 3 }]);

    invalidatePattern(base);

    expect(get(url1)).toBeNull();
    expect(get(url2)).toBeNull();
    expect(get(otherUrl)).toBeTruthy();
  });
});
