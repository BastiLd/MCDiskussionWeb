// ---------------------------------------------------------------------------
// admin.js — owner login + private dashboard.
//
// Auth is Supabase email/password. Authorisation is enforced server-side by
// RLS via the public.admins table + is_admin() (see README SQL); the UI checks
// are only for showing/hiding the dashboard. A non-admin who reaches #admin
// just sees a login form and can do nothing useful.
//
// Dashboard shows:
//   • Stats: page views, section views, downloads (by target), game starts,
//     comment counts.
//   • Comment moderation: every comment (any status) with reply / hide / show /
//     delete actions.
// ---------------------------------------------------------------------------

import { getSupabase } from './supabaseClient.js';
import { t } from './i18n.js';
import { setAnalyticsAdmin } from './analytics.js';

const ADMIN_REPLY_NAME = 'BastiLd (Mod)';

export function initAdmin() {
  const section = document.getElementById('admin');
  if (!section) return;
  const sb = getSupabase();

  const loginView = section.querySelector('[data-admin-login]');
  const dashView = section.querySelector('[data-admin-dashboard]');
  const form = section.querySelector('[data-login-form]');
  const msg = section.querySelector('[data-login-msg]');
  const logoutBtn = section.querySelector('[data-logout]');
  const refreshBtn = section.querySelector('[data-admin-refresh]');
  const statsEl = section.querySelector('[data-admin-stats]');
  const commentsEl = section.querySelector('[data-admin-comments]');
  const navItem = document.querySelector('[data-admin-nav]');

  let currentUser = null;
  let isAdmin = false;

  if (!sb) {
    if (msg) {
      msg.textContent = t('commentsError');
      msg.className = 'form-msg error';
    }
    return;
  }

  // ---- auth wiring --------------------------------------------------------
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const email = (fd.get('email') || '').toString().trim();
    const password = (fd.get('password') || '').toString();
    setMsg(t('adminSigningIn'));
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      setMsg(t('adminLoginError'), 'error');
      return;
    }
    setMsg('');
  });

  logoutBtn?.addEventListener('click', async () => {
    await sb.auth.signOut();
  });

  refreshBtn?.addEventListener('click', () => renderDashboard());

  sb.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user || null;
    refreshAuthUI();
  });
  sb.auth.getSession().then(({ data }) => {
    currentUser = data?.session?.user || null;
    refreshAuthUI();
  });

  // Re-localise dashboard if the language changes while it's open.
  document.addEventListener('languagechange', () => {
    if (isAdmin) renderDashboard();
  });

  function setMsg(text, kind) {
    if (!msg) return;
    msg.textContent = text;
    msg.className = 'form-msg' + (kind ? ' ' + kind : '');
  }

  async function checkAdmin() {
    if (!currentUser) return false;
    const { data, error } = await sb
      .from('admins')
      .select('user_id')
      .eq('user_id', currentUser.id)
      .maybeSingle();
    return !error && !!data;
  }

  async function refreshAuthUI() {
    isAdmin = await checkAdmin();
    setAnalyticsAdmin(isAdmin);
    window.__isAdmin = isAdmin;
    if (navItem) navItem.hidden = !isAdmin;

    if (isAdmin) {
      loginView.hidden = true;
      dashView.hidden = false;
      setMsg('');
      renderDashboard();
    } else {
      loginView.hidden = false;
      dashView.hidden = true;
      if (currentUser) setMsg(t('adminNotAuthorized'), 'error');
    }
  }

  // ---- dashboard ----------------------------------------------------------
  async function renderDashboard() {
    await Promise.all([renderStats(), renderComments()]);
  }

  async function renderStats() {
    statsEl.innerHTML = '';
    statsEl.appendChild(makeMuted(t('adminLoading')));

    const [{ data: events, error: evErr }, { data: comments, error: cmErr }] = await Promise.all([
      sb.from('events').select('type,label,created_at'),
      sb.from('comments').select('id,status'),
    ]);

    if (evErr || cmErr) {
      statsEl.innerHTML = '';
      statsEl.appendChild(makeMuted(t('adminLoadError'), 'error'));
      return;
    }

    const evs = events || [];
    const cms = comments || [];
    const ofType = (tp) => evs.filter((e) => e.type === tp);

    const pageviews = ofType('pageview').length;
    const gameStarts = ofType('game_start').length;
    const downloads = ofType('download').length;
    const visible = cms.filter((c) => c.status === 'visible').length;
    const hidden = cms.filter((c) => c.status !== 'visible').length;

    statsEl.innerHTML = '';
    const cards = document.createElement('div');
    cards.className = 'stat-grid';
    cards.append(
      statCard(pageviews, t('statPageviews')),
      statCard(downloads, t('statDownloads')),
      statCard(gameStarts, t('statGameStarts')),
      statCard(cms.length, t('statComments')),
      statCard(visible, t('statVisible')),
      statCard(hidden, t('statHidden'))
    );
    statsEl.appendChild(cards);

    const breakdowns = document.createElement('div');
    breakdowns.className = 'breakdown-grid';
    breakdowns.append(
      breakdown(t('breakdownDownloads'), groupCount(ofType('download'), 'label')),
      breakdown(t('breakdownSections'), groupCount(ofType('section_view'), 'label'))
    );
    statsEl.appendChild(breakdowns);
  }

  async function renderComments() {
    commentsEl.innerHTML = '';
    commentsEl.appendChild(makeMuted(t('adminLoading')));

    const { data, error } = await sb
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      commentsEl.innerHTML = '';
      commentsEl.appendChild(makeMuted(t('adminLoadError'), 'error'));
      return;
    }
    commentsEl.innerHTML = '';
    if (!data || !data.length) {
      commentsEl.appendChild(makeMuted(t('adminNoComments')));
      return;
    }
    data.forEach((c) => commentsEl.appendChild(buildAdminComment(c)));
  }

  function buildAdminComment(c) {
    const row = document.createElement('article');
    row.className = 'admin-comment status-' + (c.status || 'visible');

    const head = document.createElement('div');
    head.className = 'admin-comment-head';
    const author = document.createElement('span');
    author.className = 'comment-author';
    author.textContent = c.author_name;
    const badge = document.createElement('span');
    badge.className = 'status-badge ' + (c.status || 'visible');
    badge.textContent = t('status_' + (c.status || 'visible')) || c.status;
    const proj = document.createElement('span');
    proj.className = 'comment-time';
    proj.textContent = `${c.project_id}${c.parent_id ? ' · ↪' : ''} · ${formatDate(c.created_at)}`;
    head.append(author, badge, proj);

    const body = document.createElement('p');
    body.className = 'comment-body';
    body.textContent = c.body;

    const actions = document.createElement('div');
    actions.className = 'admin-actions';

    const replyBtn = btn(t('adminReply'), () => toggleReply(row, c));
    actions.appendChild(replyBtn);

    if (c.status === 'visible') {
      actions.appendChild(btn(t('adminHide'), () => moderate(c.id, { status: 'hidden' })));
    } else {
      actions.appendChild(btn(t('adminShow'), () => moderate(c.id, { status: 'visible' })));
    }
    const del = btn(t('adminDelete'), () => removeComment(c.id), 'danger');
    actions.appendChild(del);

    row.append(head, body, actions);
    return row;
  }

  function toggleReply(row, c) {
    let box = row.querySelector('[data-reply-box]');
    if (box) {
      box.remove();
      return;
    }
    box = document.createElement('div');
    box.className = 'admin-reply';
    box.setAttribute('data-reply-box', '');
    const ta = document.createElement('textarea');
    ta.rows = 2;
    ta.maxLength = 1000;
    ta.placeholder = t('adminReplyPh');
    const send = btn(t('adminReplySend'), async () => {
      const text = ta.value.trim();
      if (!text) return;
      const { error } = await sb.from('comments').insert({
        project_id: c.project_id,
        author_name: ADMIN_REPLY_NAME,
        body: text,
        parent_id: c.id,
        status: 'visible',
      });
      if (error) {
        alert(t('adminLoadError'));
        return;
      }
      box.remove();
      renderComments();
    }, 'primary');
    box.append(ta, send);
    row.appendChild(box);
    ta.focus();
  }

  async function moderate(id, patch) {
    const { error } = await sb.from('comments').update(patch).eq('id', id);
    if (error) {
      alert(t('adminLoadError'));
      return;
    }
    renderDashboard();
  }

  async function removeComment(id) {
    if (!confirm(t('adminDeleteConfirm'))) return;
    const { error } = await sb.from('comments').delete().eq('id', id);
    if (error) {
      alert(t('adminLoadError'));
      return;
    }
    renderDashboard();
  }
}

// ----------------------------------------------------------------- helpers
function statCard(value, label) {
  const card = document.createElement('div');
  card.className = 'stat-card';
  const v = document.createElement('span');
  v.className = 'stat-value';
  v.textContent = String(value);
  const l = document.createElement('span');
  l.className = 'stat-label';
  l.textContent = label;
  card.append(v, l);
  return card;
}

function breakdown(title, counts) {
  const wrap = document.createElement('div');
  wrap.className = 'breakdown';
  const h = document.createElement('h4');
  h.textContent = title;
  wrap.appendChild(h);
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (!entries.length) {
    wrap.appendChild(makeMuted('—'));
    return wrap;
  }
  const ul = document.createElement('ul');
  ul.className = 'breakdown-list';
  entries.forEach(([k, n]) => {
    const li = document.createElement('li');
    const name = document.createElement('span');
    name.textContent = k || '(none)';
    const val = document.createElement('strong');
    val.textContent = String(n);
    li.append(name, val);
    ul.appendChild(li);
  });
  wrap.appendChild(ul);
  return wrap;
}

function groupCount(rows, key) {
  const out = {};
  rows.forEach((r) => {
    const k = r[key] || '(none)';
    out[k] = (out[k] || 0) + 1;
  });
  return out;
}

function btn(label, onClick, kind) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'btn btn-sm' + (kind === 'primary' ? ' btn-primary' : kind === 'danger' ? ' btn-danger' : ' btn-ghost');
  b.textContent = label;
  b.addEventListener('click', onClick);
  return b;
}

function makeMuted(text, kind) {
  const p = document.createElement('p');
  p.className = 'muted' + (kind === 'error' ? ' error' : '');
  p.textContent = text;
  return p;
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
