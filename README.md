# HARYHORDHEYLEY Smart Tech Digital Service — Admin Dashboard

React + Vite + React Router DOM + Supabase. Pure CSS (no Tailwind).

## 1. Create your Supabase project

You said you just made a Supabase **account** — here's how to get a project:

1. Go to https://supabase.com/dashboard and click **New project**.
2. Pick an organization (or create one), give the project a name (e.g. `haryhordheyley-admin`), set a database password (save it somewhere), pick a region close to you, and click **Create new project**. Wait ~2 minutes for it to spin up.
3. Once it's ready, go to **Project Settings -> API**. You'll need two values:
   - **Project URL** (looks like `https://xxxxxxxx.supabase.co`)
   - **anon public** key (a long string under "Project API keys")

## 2. Run the database schema

1. In the Supabase dashboard, open **SQL Editor -> New query**.
2. Open `supabase_schema.sql` (included in this project) and paste its entire contents in.
3. Click **Run**. This creates all tables (customers, services, orders, payments, profiles, notifications, business_settings), relationships, Row Level Security policies, and two storage buckets (`avatars`, `business-assets`).

If you ever need to reset, you can drop the tables and re-run the script (it uses `create table if not exists` and `on conflict do nothing`, so it's mostly safe to re-run).

## 3. Configure email settings (recommended)

By default, Supabase requires email confirmation for new signups. For an internal admin tool this is often more friction than it's worth:

- Go to **Authentication -> Providers -> Email** and toggle **Confirm email** off if you want new admins to log in immediately after signing up. Leave it on if you'd rather verify every admin's email first.
- Go to **Authentication -> URL Configuration** and set **Site URL** to your deployed URL (or `http://localhost:5173` while developing) — this is used in password reset emails.

## 4. Connect the app to your project

1. In the project folder, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in the two values from step 1:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
3. Never commit `.env` — it's already in `.gitignore`.

## 5. Install and run

```bash
npm install
npm run dev
```

Visit the local URL Vite prints (usually `http://localhost:5173`). Go to `/signup` to create your first admin account, then log in.

## 6. Build for production

```bash
npm run build
```

Output goes to `dist/`. Deploy it anywhere that serves static files (Vercel, Netlify, Cloudflare Pages, etc.) — just remember to set the same `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` as environment variables on the host, since they're baked in at build time.

---

## What changed from your uploaded project

Your original project had good folder structure and routing scaffolding, but almost nothing was wired to Supabase — auth was faked with `localStorage`, and most pages were empty shells. Here's what was built out:

**Authentication (real, not fake)**
- Supabase client (`src/supabase/supabaseClient.js`) reading from env vars
- `AuthContext`: login, signup, logout, forgot password, reset password, persistent sessions, auto profile creation on signup (via a Postgres trigger)
- Login / Signup / Forgot Password / Reset Password pages rewritten to use it
- `ProtectedRoute` and `PublicOnlyRoute` guards based on real session state

**Database**
- `supabase_schema.sql`: `profiles`, `customers`, `services`, `orders`, `payments`, `notifications`, `business_settings` tables with foreign keys, RLS policies, and two storage buckets for avatars/logos

**Pages built from scratch**
- Dashboard — live stat cards (customers, services, orders, revenue, pending/completed), recent orders table, quick actions
- Customers, Services, Orders, Payments — full CRUD with search, filters, pagination, modal forms, delete confirmation
- Users — staff/admin list with role & status management
- Reports — revenue/order breakdowns with lightweight CSS bar charts
- Notifications — list, mark read / mark all read
- Settings — business name, logo upload, theme
- Profile — name, phone, avatar upload, password change
- 404 page

**Shared infrastructure**
- `useCrudTable` hook — one reusable hook powering every list page (fetch, search, filter, paginate, create, update, delete)
- Reusable UI: `Modal`, `ConfirmDialog`, `StatusBadge`, `Loader`, `EmptyState`, `Pagination`, `StatCard`
- `ToastContext` for save/delete feedback
- `ThemeContext` for the dark/light toggle

**Sidebar & Navbar**
- Sidebar links fixed to match the spec (Dashboard, Customers, Services, Orders, Payments, Users, Reports, Notifications, Settings, Profile), working logout, mobile drawer + collapse support
- Navbar search now actually filters the active list page; notifications dropdown pulls real data; profile dropdown; dark/light toggle

**Design**
- Black / white / yellow theme per spec, pure CSS (Tailwind fully removed from `package.json` and `vite.config.js`)
- Type system: Space Grotesk (headings), Inter (body), JetBrains Mono (data/labels)
- Responsive at desktop / tablet / mobile breakpoints

**Cleanup**
- Removed `@tailwindcss/vite`, `@tailwindcss/postcss`, and a stray/bogus `icons` package from `package.json`; standardized icons on `react-icons`
- Added `.env` to `.gitignore`
- Removed stray Windows artifacts (`desktop.ini`, a `.lnk` file)
- Fixed a login bug where the auth token was set before credentials were actually verified

## Required npm packages

Already declared in `package.json` — just run `npm install`:
- `react`, `react-dom`, `react-router-dom`
- `@supabase/supabase-js`
- `react-icons`

## Notes

- New admin users are created via the **Sign Up** page — Supabase doesn't allow creating auth users from the browser with elevated privileges, so the Users page manages *role and status* for existing accounts rather than creating brand-new logins.
- Currency formatting defaults to NGN. Change the `currency()` helper inside `Dashboard.jsx`, `Reports.jsx`, `Services.jsx`, `Orders.jsx`, and `Payments.jsx` if you'd prefer a different currency.
