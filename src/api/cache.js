/**
 * ETag-based localStorage cache for GitHub API responses.
 * Keeps per-URL {etag, data} entries.
 * Keys are prefixed with "bd:cache:" to avoid collisions.
 */

const PREFIX = 'bd:cache:';

/**
 * Retrieve a cached entry.
 * @param {string} url
 * @returns {{ etag: string, data: any } | null}
 */
export function get(url) {
  try {
    const raw = localStorage.getItem(PREFIX + url);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Store an entry.
 * @param {string} url
 * @param {string} etag
 * @param {any}    data — must be JSON-serialisable
 */
export function set(url, etag, data) {
  try {
    localStorage.setItem(PREFIX + url, JSON.stringify({ etag, data }));
  } catch {
    // Storage quota exceeded — silently ignore; the app can re-fetch.
  }
}

/**
 * Remove a single cached entry.
 * @param {string} url
 */
export function invalidate(url) {
  try {
    localStorage.removeItem(PREFIX + url);
  } catch {
    // ignore
  }
}

/**
 * Remove all entries whose key starts with the given URL prefix.
 * @param {string} prefix
 */
export function invalidatePattern(prefix) {
  try {
    const fullPrefix = PREFIX + prefix;
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(fullPrefix)) {
        toRemove.push(key);
      }
    }
    toRemove.forEach(k => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}
