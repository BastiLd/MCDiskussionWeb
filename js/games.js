// ---------------------------------------------------------------------------
// games.js — entry point for the Games section.
// The Pong game now lives in pong.js (Paddle Force-style). Memory stays here.
// ---------------------------------------------------------------------------

import { t } from './i18n.js';

// Paddle Force now lives on its own full-screen page (game.html / paddleforce.js).
// The Games section links to it; here we only wire the Memory bonus game.
export function initGames() {
  initMemory();
}

// ===========================================================================
// Bonus: Memory match
// ===========================================================================
function initMemory() {
  const root = document.querySelector('[data-memory]');
  if (!root) return;
  const grid = root.querySelector('[data-memory-grid]');
  const movesEl = root.querySelector('[data-memory-moves]');
  const restartBtn = root.querySelector('[data-memory-restart]');

  const SYMBOLS = ['⛏️', '🗡️', '🛡️', '💎', '🍎', '🔥', '🌳', '⭐'];
  let moves = 0;
  let first = null;
  let lock = false;
  let matched = 0;

  let status = root.querySelector('[data-memory-status]');
  if (!status) {
    status = document.createElement('p');
    status.className = 'muted';
    status.setAttribute('data-memory-status', '');
    status.setAttribute('role', 'status');
    root.appendChild(status);
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function build() {
    moves = 0;
    matched = 0;
    first = null;
    lock = false;
    movesEl.textContent = '0';
    status.textContent = '';
    grid.innerHTML = '';

    const deck = shuffle([...SYMBOLS, ...SYMBOLS]);
    deck.forEach((sym) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'mem-card';
      card.setAttribute('aria-label', 'Memory card');
      card.dataset.sym = sym;
      card.innerHTML =
        '<span class="mem-inner">' +
        '<span class="mem-face mem-front">?</span>' +
        `<span class="mem-face mem-back">${sym}</span>` +
        '</span>';
      card.addEventListener('click', () => flip(card));
      grid.appendChild(card);
    });
  }

  function flip(card) {
    if (lock || card.classList.contains('flipped') || card.classList.contains('matched')) return;
    card.classList.add('flipped');

    if (!first) {
      first = card;
      return;
    }
    moves++;
    movesEl.textContent = String(moves);

    if (first.dataset.sym === card.dataset.sym) {
      first.classList.add('matched');
      card.classList.add('matched');
      matched += 2;
      first = null;
      if (matched === SYMBOLS.length * 2) {
        status.textContent = t('memoryWon').replace('{n}', String(moves));
      }
    } else {
      lock = true;
      const a = first;
      first = null;
      setTimeout(() => {
        a.classList.remove('flipped');
        card.classList.remove('flipped');
        lock = false;
      }, 750);
    }
  }

  restartBtn?.addEventListener('click', build);
  document.addEventListener('languagechange', () => {
    if (matched === SYMBOLS.length * 2) {
      status.textContent = t('memoryWon').replace('{n}', String(moves));
    }
  });
  build();
}
