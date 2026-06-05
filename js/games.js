// ---------------------------------------------------------------------------
// games.js — a Pong variant with *rotating* paddles, plus a bonus Memory game.
//
// Exposes initGames(); the module pauses the Pong loop whenever the Games
// section is hidden (via the `sectionchange` event) or the tab loses focus.
// ---------------------------------------------------------------------------

import { t } from './i18n.js';

const isTouch =
  window.matchMedia('(hover: none), (pointer: coarse)').matches || 'ontouchstart' in window;

export function initGames() {
  initPong();
  initMemory();
}

// ===========================================================================
// Rotary Pong
// ===========================================================================
function initPong() {
  const wrap = document.querySelector('[data-pong]');
  const canvas = document.querySelector('[data-pong-canvas]');
  if (!wrap || !canvas) return;
  const ctx = canvas.getContext('2d');

  const overlay = wrap.querySelector('[data-pong-overlay]');
  const resultEl = wrap.querySelector('[data-pong-result]');
  const restartBtn = wrap.querySelector('[data-pong-restart]');
  const touchControls = wrap.querySelector('[data-touch-controls]');

  // Logical play-field size; CSS scales the canvas to fit its container.
  const W = 800;
  const H = 500;
  const MAX_SCORE = 5;
  const PADDLE_W = 14;
  const PADDLE_H = 92;
  const MOVE_SPEED = 380; // px/s
  const ROT_SPEED = 2.4; // rad/s
  const MAX_ANGLE = 0.95; // rad
  const BALL_R = 9;
  const BALL_SPEED = 340;
  const BALL_SPEED_MAX = 720;

  let state; // 'idle' | 'running' | 'over'
  let p1, p2, ball;
  const keys = new Set();
  let rafId = 0;
  let lastT = 0;
  let sectionActive = false;

  function fitCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function newPaddle(x) {
    return { x, y: H / 2, angle: 0, w: PADDLE_W, h: PADDLE_H };
  }

  function resetBall(dir) {
    const angle = (Math.random() - 0.5) * 0.6; // mostly horizontal
    ball = {
      x: W / 2,
      y: H / 2,
      vx: Math.cos(angle) * BALL_SPEED * dir,
      vy: Math.sin(angle) * BALL_SPEED,
      r: BALL_R,
      speed: BALL_SPEED,
    };
  }

  function initGame() {
    p1 = newPaddle(46);
    p2 = newPaddle(W - 46);
    p1.score = 0;
    p2.score = 0;
    resetBall(Math.random() < 0.5 ? -1 : 1);
  }

  // --- input ---------------------------------------------------------------
  function onKeyDown(e) {
    if (!sectionActive) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
    if (e.key === ' ') {
      if (state !== 'running') start();
      return;
    }
    keys.add(k);
  }
  function onKeyUp(e) {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    keys.delete(k);
  }

  function bindTouchButton(btn) {
    const key = btn.dataset.key;
    const down = (e) => {
      e.preventDefault();
      keys.add(key.length === 1 ? key.toLowerCase() : key);
    };
    const up = (e) => {
      e.preventDefault();
      keys.delete(key.length === 1 ? key.toLowerCase() : key);
    };
    btn.addEventListener('touchstart', down, { passive: false });
    btn.addEventListener('touchend', up, { passive: false });
    btn.addEventListener('touchcancel', up, { passive: false });
    btn.addEventListener('mousedown', down);
    btn.addEventListener('mouseup', up);
    btn.addEventListener('mouseleave', up);
  }

  // --- update --------------------------------------------------------------
  function movePaddle(p, up, down, rotL, rotR, dt) {
    if (keys.has(up)) p.y -= MOVE_SPEED * dt;
    if (keys.has(down)) p.y += MOVE_SPEED * dt;
    if (keys.has(rotL)) p.angle -= ROT_SPEED * dt;
    if (keys.has(rotR)) p.angle += ROT_SPEED * dt;
    p.angle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, p.angle));
    const margin = p.h / 2 + 6;
    p.y = Math.max(margin, Math.min(H - margin, p.y));
  }

  // Reflect the ball off a (possibly rotated) paddle. Returns true on hit.
  function collidePaddle(p) {
    // Transform ball into the paddle's local frame.
    const cos = Math.cos(-p.angle);
    const sin = Math.sin(-p.angle);
    const dx = ball.x - p.x;
    const dy = ball.y - p.y;
    const lx = dx * cos - dy * sin;
    const ly = dx * sin + dy * cos;

    const hw = p.w / 2;
    const hh = p.h / 2;

    // Closest point on the rectangle to the ball, in local space.
    const cxp = Math.max(-hw, Math.min(hw, lx));
    const cyp = Math.max(-hh, Math.min(hh, ly));
    let nx = lx - cxp;
    let ny = ly - cyp;
    let d = Math.hypot(nx, ny);

    if (d > ball.r) return false;

    // Build a local normal (handle the ball-center-inside case).
    if (d === 0) {
      nx = lx < 0 ? -1 : 1;
      ny = 0;
      d = 1;
    } else {
      nx /= d;
      ny /= d;
    }
    // Bias the normal by where it struck along the paddle face for control.
    ny += (ly / hh) * 0.6;
    const nl = Math.hypot(nx, ny) || 1;
    nx /= nl;
    ny /= nl;

    // Rotate the normal back to world space.
    const wc = Math.cos(p.angle);
    const ws = Math.sin(p.angle);
    const wnx = nx * wc - ny * ws;
    const wny = nx * ws + ny * wc;

    // Reflect velocity about the world normal.
    const dot = ball.vx * wnx + ball.vy * wny;
    ball.vx -= 2 * dot * wnx;
    ball.vy -= 2 * dot * wny;

    // Speed up slightly, capped, and re-normalise to the new speed.
    ball.speed = Math.min(BALL_SPEED_MAX, ball.speed * 1.06);
    const vlen = Math.hypot(ball.vx, ball.vy) || 1;
    ball.vx = (ball.vx / vlen) * ball.speed;
    ball.vy = (ball.vy / vlen) * ball.speed;

    // Push the ball out of the paddle so it can't stick.
    const push = ball.r - d + 0.5;
    ball.x += wnx * push;
    ball.y += wny * push;
    return true;
  }

  function update(dt) {
    movePaddle(p1, 'w', 's', 'a', 'd', dt);
    movePaddle(p2, 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', dt);

    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // Top / bottom walls.
    if (ball.y < ball.r) {
      ball.y = ball.r;
      ball.vy = Math.abs(ball.vy);
    } else if (ball.y > H - ball.r) {
      ball.y = H - ball.r;
      ball.vy = -Math.abs(ball.vy);
    }

    collidePaddle(p1);
    collidePaddle(p2);

    // Scoring.
    if (ball.x < -ball.r) {
      p2.score++;
      afterPoint(1);
    } else if (ball.x > W + ball.r) {
      p1.score++;
      afterPoint(-1);
    }
  }

  function afterPoint(dir) {
    if (p1.score >= MAX_SCORE || p2.score >= MAX_SCORE) {
      gameOver();
      return;
    }
    // Reset ball and paddles.
    p1.angle = 0;
    p2.angle = 0;
    p1.y = H / 2;
    p2.y = H / 2;
    resetBall(dir);
  }

  // --- draw ----------------------------------------------------------------
  function drawPaddle(p, color) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    const r = 6;
    roundRect(ctx, -p.w / 2, -p.h / 2, p.w, p.h, r);
    ctx.fill();
    ctx.restore();
  }

  function draw() {
    const accent = cssVar('--accent-strong', '#f59e2c');
    const accent2 = cssVar('--accent-color', '#d9810f');

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0a0a0d';
    ctx.fillRect(0, 0, W, H);

    // Center dashed line.
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 14]);
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Scores + player labels.
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.textAlign = 'center';
    ctx.font = '700 56px system-ui, sans-serif';
    ctx.fillText(String(p1.score), W / 2 - 70, 70);
    ctx.fillText(String(p2.score), W / 2 + 70, 70);
    ctx.font = '600 14px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText(t('p1Label'), W / 2 - 70, 92);
    ctx.fillText(t('p2Label'), W / 2 + 70, 92);

    drawPaddle(p1, accent);
    drawPaddle(p2, accent2);

    // Ball.
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- loop ----------------------------------------------------------------
  function frame(ts) {
    rafId = 0;
    const dt = Math.min(0.033, (ts - lastT) / 1000 || 0);
    lastT = ts;
    if (state === 'running') update(dt);
    draw();
    if (state === 'running' && sectionActive) loop();
  }
  function loop() {
    if (!rafId) rafId = requestAnimationFrame(frame);
  }
  function stopLoop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  // --- state transitions ---------------------------------------------------
  function showOverlay(resultText) {
    if (resultEl) resultEl.textContent = resultText || '';
    overlay.hidden = false;
  }
  function hideOverlay() {
    overlay.hidden = true;
  }

  function start() {
    initGame();
    state = 'running';
    hideOverlay();
    lastT = performance.now();
    loop();
    document.dispatchEvent(new CustomEvent('gamestart', { detail: { game: 'pong' } }));
  }

  function gameOver() {
    state = 'over';
    const winner = p1.score > p2.score ? t('p1Label') : t('p2Label');
    showOverlay(`${winner} ${t('gameWinner')}`);
    stopLoop();
    draw();
  }

  function idle() {
    state = 'idle';
    initGame();
    showOverlay('');
    draw();
  }

  function setActive(active) {
    sectionActive = active;
    if (active) {
      fitCanvas();
      if (state === 'running') {
        lastT = performance.now();
        loop();
      } else {
        draw();
      }
    } else {
      stopLoop();
    }
  }

  // --- wiring --------------------------------------------------------------
  fitCanvas();
  idle();

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('resize', () => {
    fitCanvas();
    draw();
  });
  restartBtn?.addEventListener('click', start);

  document.addEventListener('sectionchange', (e) => setActive(e.detail.id === 'games'));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopLoop();
    else if (sectionActive && state === 'running') {
      lastT = performance.now();
      loop();
    }
  });
  document.addEventListener('languagechange', () => draw());

  if (isTouch && touchControls) {
    touchControls.hidden = false;
    touchControls.querySelectorAll('button[data-key]').forEach(bindTouchButton);
  }

  // If the page loads directly on #games, activate immediately.
  if ((location.hash || '').slice(1) === 'games') setActive(true);
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

  // Status line for the win message.
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

// ===========================================================================
// Helpers
// ===========================================================================
function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}
