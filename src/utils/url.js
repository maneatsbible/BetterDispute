/**
 * URL parameter helpers for Better Dispute.
 * All navigation is driven by query params.
 */

/**
 * Read current URL query params.
 * @returns {{ view?: string, id?: string, post?: string }}
 */
export function getUrlParams() {
  const p = new URLSearchParams(window.location.search);
  const result = {};
  if (p.has('view')) result.view = p.get('view');
  if (p.has('id'))   result.id   = p.get('id');
  if (p.has('post')) result.post = p.get('post');
  return result;
}

/**
 * Push a new URL state with the given params.
 * Pass an empty object to go to Home.
 * @param {Record<string, string|number>} params
 */
export function setUrlParams(params) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) p.set(k, String(v));
  }
  const search = p.toString() ? `?${p.toString()}` : '';
  window.history.pushState(params, '', `${window.location.pathname}${search}`);
}

/**
 * Build a canonical shareable URL for a Post or Dispute.
 * @param {{ postId?: number, disputeId?: number }} opts
 * @returns {string}
 */
export function buildCanonicalUrl({ postId, disputeId } = {}) {
  const base = `${window.location.origin}${window.location.pathname}`;
  const p = new URLSearchParams();
  if (disputeId) { p.set('view', 'dispute'); p.set('id', String(disputeId)); }
  if (postId)    p.set('post', String(postId));
  const qs = p.toString();
  return qs ? `${base}?${qs}` : base;
}
