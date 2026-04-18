/**
 * View component: notification toasts.
 *
 * Appends short-lived notification elements to `#notification-root`.
 * The root has `aria-live="polite"` so screen readers announce messages.
 */

const AUTO_DISMISS_MS = 4000;
const TYPE_CLASSES = {
  info:    'notification--info',
  success: 'notification--success',
  error:   'notification--error',
  warn:    'notification--warn',
};

/**
 * Show a toast notification.
 *
 * @param {string} message
 * @param {'info'|'success'|'error'|'warn'} [type='info']
 */
export function showNotification(message, type = 'info') {
  const root = document.getElementById('notification-root');
  if (!root) return;

  const el = document.createElement('div');
  el.className = `notification ${TYPE_CLASSES[type] ?? TYPE_CLASSES.info}`;
  el.setAttribute('role', 'status');
  el.textContent = message;

  root.appendChild(el);

  // Allow CSS transition to pick up the element before adding --out.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        el.classList.add('notification--out');
        el.addEventListener('transitionend', () => el.remove(), { once: true });
        // Fallback in case transition doesn't fire (e.g. reduced-motion, hidden tab).
        setTimeout(() => el.remove(), 1000);
      }, AUTO_DISMISS_MS);
    });
  });
}
