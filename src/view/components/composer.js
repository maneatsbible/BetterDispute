/**
 * View component: inline Composer panel
 *
 * Supports multiple modes:
 *   - "assertion" — free text + optional image + optional @strawman toggle
 *   - "challenge" — Interrogatory/Objection type selector + text
 *   - "answer"    — Yes/No radio (Interrogatory only) + text + optional counter-challenge
 *   - "offer"     — free text + optional image
 *
 * The composer slides up from the bottom of its container.
 * Draft text is preserved in memory while the composer is open; it is
 * cleared only on a successful submit.
 */

const MODES = ['assertion', 'challenge', 'answer', 'offer'];

/**
 * Render (or re-render) a composer panel inside `container`.
 *
 * @param {HTMLElement} container  Parent element to append the composer into
 * @param {{
 *   mode:           'assertion'|'challenge'|'answer'|'offer',
 *   placeholder:    string,
 *   canPostAsStrawman: boolean,
 *   challengeType:  'interrogatory'|'objection'|null,   // for answer mode
 *   onSubmit:       (data: object) => Promise<void>,
 *   onCancel:       () => void,
 * }} opts
 * @returns {{ destroy: () => void }}  Handle to remove the composer
 */
export function renderComposer(container, opts) {
  const {
    mode               = 'assertion',
    placeholder        = 'What do you want to say?',
    canPostAsStrawman  = false,
    challengeType      = null,
    onSubmit,
    onCancel,
  } = opts;

  if (!MODES.includes(mode)) throw new Error(`Unknown composer mode: ${mode}`);

  const el = document.createElement('div');
  el.className = `composer composer--${mode}`;

  el.innerHTML = `
    <form class="composer__form" novalidate>
      ${_modeExtras(mode, challengeType, canPostAsStrawman)}

      <textarea class="composer__textarea" rows="4"
                placeholder="${_esc(placeholder)}"
                aria-label="Compose your ${mode}"
                required></textarea>

      ${mode === 'assertion' || mode === 'offer'
        ? `<label class="composer__image-label">
             Image URL (optional)
             <input class="composer__image-input" type="url"
                    placeholder="https://example.com/image.png"
                    aria-label="Image URL">
           </label>`
        : ''}

      ${mode === 'answer'
        ? `<details class="composer__counter-challenge-section">
             <summary>Add a counter-challenge (optional)</summary>
             <div class="composer__counter-challenge">
               <label>
                 <span>Challenge type</span>
                 <select class="composer__counter-type">
                   <option value="interrogatory">Interrogatory</option>
                   <option value="objection">Objection</option>
                 </select>
               </label>
               <textarea class="composer__counter-text" rows="3"
                         placeholder="Your counter-challenge..."
                         aria-label="Counter-challenge text"></textarea>
             </div>
           </details>`
        : ''}

      <div class="composer__actions">
        <button type="button" class="btn btn--secondary composer__cancel-btn">Cancel</button>
        <button type="submit" class="btn btn--primary composer__submit-btn">Submit</button>
      </div>
    </form>
  `.trim();

  // Preserve draft across cancel.
  let savedText      = '';
  let savedImageUrl  = '';

  const form      = el.querySelector('form');
  const textarea  = el.querySelector('.composer__textarea');
  const imageInput = el.querySelector('.composer__image-input');

  if (savedText)     textarea.value = savedText;
  if (imageInput && savedImageUrl) imageInput.value = savedImageUrl;

  // Cancel
  el.querySelector('.composer__cancel-btn').addEventListener('click', () => {
    savedText     = textarea.value;
    savedImageUrl = imageInput?.value ?? '';
    onCancel();
  });

  // Submit
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const text     = textarea.value.trim();
    const imageUrl = imageInput?.value.trim() ?? '';

    if (mode !== 'answer' && !text && !imageUrl) {
      textarea.setCustomValidity('Please enter some text or an image URL.');
      textarea.reportValidity();
      return;
    }
    textarea.setCustomValidity('');

    const data = _collectData(el, mode, { text, imageUrl });

    const submitBtn = el.querySelector('.composer__submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    try {
      await onSubmit(data);
      savedText     = '';
      savedImageUrl = '';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
    }
  });

  container.appendChild(el);

  // Slide-up animation on next frame.
  requestAnimationFrame(() => el.classList.add('composer--visible'));

  return {
    destroy() {
      el.classList.remove('composer--visible');
      el.addEventListener('transitionend', () => el.remove(), { once: true });
      setTimeout(() => el.remove(), 400);
    },
  };
}

// ---------------------------------------------------------------------------

function _modeExtras(mode, challengeType, canPostAsStrawman) {
  const parts = [];

  if (mode === 'challenge') {
    parts.push(`
      <fieldset class="composer__type-selector">
        <legend>Challenge type</legend>
        <label>
          <input type="radio" name="challengeType" value="interrogatory" checked>
          Interrogatory <small>(yes/no question)</small>
        </label>
        <label>
          <input type="radio" name="challengeType" value="objection">
          Objection
        </label>
      </fieldset>
    `);
  }

  if (mode === 'answer' && challengeType === 'interrogatory') {
    parts.push(`
      <fieldset class="composer__yn-selector">
        <legend>Your answer</legend>
        <label>
          <input type="radio" name="yesNo" value="yes" required>
          Yes
        </label>
        <label>
          <input type="radio" name="yesNo" value="no" required>
          No
        </label>
      </fieldset>
    `);
  }

  if (mode === 'assertion' && canPostAsStrawman) {
    parts.push(`
      <label class="composer__strawman-toggle">
        <input type="checkbox" class="composer__strawman-cb" name="asStrawman">
        Post as @strawman
      </label>
    `);
  }

  return parts.join('');
}

function _collectData(el, mode, { text, imageUrl }) {
  const data = { mode, text, imageUrl };

  if (mode === 'challenge') {
    const checked = el.querySelector('input[name="challengeType"]:checked');
    data.challengeType = checked?.value ?? 'interrogatory';
  }

  if (mode === 'answer') {
    const checkedYN = el.querySelector('input[name="yesNo"]:checked');
    data.yesNo = checkedYN ? checkedYN.value === 'yes' : null;

    const counterText = el.querySelector('.composer__counter-text')?.value.trim();
    const counterType = el.querySelector('.composer__counter-type')?.value;
    if (counterText) {
      data.counterChallenge = { text: counterText, challengeType: counterType ?? 'interrogatory' };
    }
  }

  if (mode === 'assertion') {
    const strawmanCb = el.querySelector('.composer__strawman-cb');
    data.asStrawman = strawmanCb?.checked ?? false;
  }

  return data;
}

function _esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
