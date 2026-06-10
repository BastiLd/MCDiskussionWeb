// ---------------------------------------------------------------------------
// modsRender.js — renders the public Mods grid from the Supabase `mods` cache.
//
// Lazy-loads when the #mods section becomes active (same pattern as the
// comments block). Falls back to the hand-written static card if the table is
// empty or unreachable, so nothing ever breaks for visitors.
// ---------------------------------------------------------------------------

import { getSupabase } from './supabaseClient.js';
import { t, getLanguage } from './i18n.js';
import { observeReveal } from './effects.js';

/** Card block order presets; the key is stored per mod in mods.data.layout. */
export const MOD_LAYOUTS = {
  standard: ['head', 'summary', 'stats', 'actions'],
  downloads_top: ['stats', 'head', 'summary', 'actions'],
  downloads_under_title: ['head', 'stats', 'summary', 'actions'],
  buttons_top: ['head', 'actions', 'summary', 'stats'],
};

export function initModsRender() {
  const grid = document.querySelector('[data-mods-grid]');
  if (!grid) return;

  let loaded = false;
  let cached = null;

  async function load() {
    if (loaded) return;
    loaded = true;
    const sb = getSupabase();
    if (!sb) { loaded = false; return; }

    const { data, error } = await sb
      .from('mods')
      .select('*')
      .eq('visible', true)
      .order('sort', { ascending: true })
      .order('created_at', { ascending: true });

    if (error || !data || !data.length) {
      // keep the static fallback card; retry on next visit if it was an error
      if (error) { console.warn('[mods] load failed:', error.message); loaded = false; }
      return;
    }
    cached = data;
    render(data);
  }

  function render(mods) {
    // Remove the static fallback card; keep the "coming soon" card at the end.
    grid.querySelectorAll('[data-mods-fallback]').forEach((el) => el.remove());
    grid.querySelectorAll('[data-mod-card]').forEach((el) => el.remove());
    const soon = grid.querySelector('[data-mods-soon]');

    mods.forEach((mod) => {
      const card = buildCard(mod);
      if (soon) grid.insertBefore(card, soon);
      else grid.appendChild(card);
    });
  }

  function buildCard(mod) {
    const card = document.createElement('article');
    card.className = 'card mod-card beam';
    card.setAttribute('data-mod-card', '');

    const head = document.createElement('div');
    head.className = 'mod-head';
    if (mod.icon_url) {
      const img = document.createElement('img');
      img.src = mod.icon_url;
      img.alt = '';
      img.loading = 'lazy';
      img.className = 'mod-icon';
      head.appendChild(img);
    } else {
      const ph = document.createElement('span');
      ph.className = 'mod-icon mod-icon-ph';
      ph.textContent = '📦';
      head.appendChild(ph);
    }
    const title = document.createElement('h3');
    title.textContent = mod.name;
    head.appendChild(title);

    const summary = document.createElement('p');
    const lang = getLanguage();
    summary.textContent =
      (lang === 'de' && mod.summary_de) ? mod.summary_de : (mod.summary_en || mod.summary_de || '');

    // Stats row: count-up downloads + latest version badge
    const stats = document.createElement('div');
    stats.className = 'mod-stats';
    let countEl = null;
    if (mod.downloads > 0) {
      const dl = document.createElement('span');
      dl.className = 'mod-stat';
      const num = document.createElement('strong');
      num.dataset.count = String(mod.downloads);
      num.textContent = '0';
      dl.append(num, ' ⬇ ', document.createTextNode(t('modDownloads')));
      stats.appendChild(dl);
      countEl = num;
    }
    if (mod.latest_version) {
      const v = document.createElement('span');
      v.className = 'mod-stat mod-version';
      v.textContent = mod.latest_version;
      stats.appendChild(v);
    }
    if (Array.isArray(mod.game_versions) && mod.game_versions.length) {
      const gv = document.createElement('span');
      gv.className = 'mod-stat';
      gv.textContent = `MC ${mod.game_versions[0]} – ${mod.game_versions[mod.game_versions.length - 1]}`;
      stats.appendChild(gv);
    }

    const actions = document.createElement('div');
    actions.className = 'card-actions';
    if (mod.modrinth_url) actions.appendChild(linkBtn(mod.modrinth_url, t('btnModrinth'), 'btn btn-primary', mod.slug));
    if (mod.github_url) actions.appendChild(linkBtn(mod.github_url, 'GitHub', 'btn btn-ghost', mod.slug));

    // The owner can rearrange the card blocks per mod (set in the dashboard,
    // stored in mods.data.layout). Unknown/missing values fall back to standard.
    const blocks = { head, summary, stats, actions };
    layoutOrder(mod).forEach((key) => card.appendChild(blocks[key]));
    if (countEl) observeReveal(countEl); // after the block is in the card
    return card;
  }

  function layoutOrder(mod) {
    const key = mod.data && mod.data.layout;
    return MOD_LAYOUTS[key] || MOD_LAYOUTS.standard;
  }

  function linkBtn(href, label, cls, slug) {
    const a = document.createElement('a');
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = cls;
    a.textContent = label;
    a.dataset.track = 'download';
    a.dataset.trackLabel = `mod:${slug}`;
    return a;
  }

  document.addEventListener('sectionchange', (e) => {
    if (e.detail.id === 'mods') load();
  });
  document.addEventListener('languagechange', () => {
    if (cached) render(cached);
  });
  if ((location.hash || '').slice(1) === 'mods') load();
}
