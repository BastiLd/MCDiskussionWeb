# BastiLd Mod Hub

A fast, accessible, dark-themed, bilingual (English / German) static website that
showcases the **RestoreInventory** Fabric mod and leaves room for future mods.

No build tooling — plain HTML/CSS/JS with a few libraries loaded from CDNs. It runs as-is
on GitHub Pages.

Highlights:

- 🌓 Dark theme with a warm amber accent (one-line re-skin via `--accent-color`)
- 🌐 Full EN/DE translations, persisted in `localStorage`
- ✨ Signature heading hover, magnetic buttons, spotlight cursor, scroll reveal, 3D tilt
  cards, GSAP text scramble — all disabled under `prefers-reduced-motion`
- 🕹️ **Rotary Pong** (two players, rotating paddles, keyboard + touch) and a Memory bonus game
- 💬 Supabase-backed comments with nested replies, realtime updates, honeypot + rate limit
- 🔗 Hash-anchor navigation (`#restoreinventory`, `#games`, …) using the View Transitions API

## Project structure

```
index.html                 Main page: nav + all sections
css/style.css              Global styles (theme, layout, animations)
js/config.js               Supabase URL + anon key (single source of truth)
js/i18n.js                 EN/DE translation tables + setLanguage()
js/app.js                  Navigation, i18n wiring, signature animations
js/games.js                Rotary Pong + Memory game
js/comments.js             Supabase comments
.github/workflows/deploy.yml   Auto-deploy to GitHub Pages on push to main
.nojekyll                  Tell Pages not to run Jekyll
```

## Local preview

ES modules require `http://` (not `file://`). Serve the folder with any static server:

```bash
# Python 3
python -m http.server 8000
# or Node
npx serve .
```

Then open <http://localhost:8000>. In VS Code you can also use the **Live Server** extension.

## Supabase setup (one-time)

The comments feature needs a `comments` table. The project URL and **public anon key** are
already wired in [`js/config.js`](js/config.js) — the anon key is a client-side key protected
by Row Level Security, so it's safe to commit.

1. Open your Supabase project → **SQL Editor** → run this once:

   ```sql
   create extension if not exists "uuid-ossp";

   create table if not exists public.comments (
     id uuid primary key default uuid_generate_v4(),
     project_id text not null,
     author_name text not null check (char_length(author_name) <= 50),
     body text not null check (char_length(body) <= 1000),
     parent_id uuid references public.comments(id) on delete cascade,
     created_at timestamptz not null default now(),
     status text not null default 'visible' check (status in ('visible','hidden','deleted'))
   );

   alter table public.comments enable row level security;

   create policy "Public comments are visible" on public.comments
     for select using (status = 'visible');

   create policy "Anonymous can insert visible comments" on public.comments
     for insert with check (
       status = 'visible' and
       project_id is not null and author_name is not null and body is not null and
       char_length(author_name) > 0 and char_length(body) > 0
     );
   ```

2. **(Optional, for live updates)** Enable Realtime for the table so new comments appear
   without a refresh:

   ```sql
   alter publication supabase_realtime add table public.comments;
   ```

   Or in the dashboard: **Database → Replication →** add `public.comments`. The site still
   works without this — a posted comment is rendered immediately; it just won't stream in
   from *other* visitors until they reload.

> The URL in `js/config.js` is the API endpoint (`https://<ref>.supabase.co`), derived from
> the project ref — **not** the dashboard URL. If you swap projects, update both constants.

## Deploy to GitHub Pages

### Option A — GitHub Actions (included)

1. Create a repo (e.g. `bastild-mod-hub`) and push these files to `main`.
2. In **Settings → Pages → Build and deployment**, set **Source: GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` deploys on every push to `main`.

### Option B — branch / root (no Actions)

1. Push to `main`.
2. **Settings → Pages → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The `.nojekyll` file ensures the `js/` folder is served untouched.

After it builds, the site is live at `https://<username>.github.io/<repository>/`.

In the Modrinth project's **Website** field, link directly to the mod section:
`https://<username>.github.io/<repository>/#restoreinventory`.

## Customizing

- **Accent color:** change `--accent-color` (and `--accent-strong`) in `css/style.css`.
- **Translations:** edit the `en` / `de` objects in `js/i18n.js`. Mark new elements with
  `data-i18n="key"` (text) or `data-i18n-attr="placeholder:key"` (attributes).
- **Add a mod section:** copy the `#restoreinventory` `<section>`, give it a new `id`, add it
  to `SECTIONS` in `js/app.js`, add a nav link, and set a unique `data-project` on its
  comments block.

## Credits

Built with vanilla HTML/CSS/JS plus [GSAP](https://gsap.com/),
[vanilla-tilt.js](https://micku7zu.github.io/vanilla-tilt.js/) and
[supabase-js](https://supabase.com/). MIT licensed.
