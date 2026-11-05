#HARYHORDHEYLEY Smart Tech Digital Service – Admin Dashboard

Project Overview

This project is an Admin Dashboard developed for HARYHORDHEYLEY Smart Tech Digital Service. It provides a centralized platform for managing customers, services, orders, payments, users, notifications, reports, and business settings.

Technologies Used

- React.js
- Vite
- React Router DOM
- Supabase (Authentication and Database)
- CSS

Features

- User Authentication (Login, Signup, Password Reset)
- Dashboard Statistics and Reports
- Customer Management
- Service Management
- Order Management
- Payment Management
- User Management
- Notifications System
- Profile and Settings Management
- Responsive Design

Live Demo

https://haryhordheyley-admin-dashboard.vercel.app

GitHub Repository

https://github.com/ayodelesamod112/Haryhordheyley-admin-dashboard

Author

Ayomide Samod
MITC (Masroor International Technical College) HARYHORDHEYLEY Smart Tech Digital Service — Admin Dashboard

React + Vite + React Router DOM + Supabase. Pure CSS (no Tailwind).

## 1. Create your Supabase project

You said you just made a Supabase **account** — here's how to get a project:

1. Go to https://supabase.com/dashboard and click **New project**.
2. Pick an organization (or create one), give the project a name (e.g. `haryhordheyley-admin`), set a database password (save it somewhere), pick a region close to you, and click **Create new project**. Wait ~2 minutes for it to spin up.
3. Once it's ready, go to **Project Settings -> API**. You'll need two values:
   - **Project URL** (looks like `https://xxxxxxxx.supabase.co`)
   - **anon public** key (a long string under "Project API keys")

## 2. Apply the database schema

- **Fresh Supabase project:** run `supabase_schema.sql` in **SQL Editor -> New query**. It creates the tables, secure Row Level Security policies, triggers, and the `avatars`, `business-assets`, and private `payment-proofs` storage buckets.
- **Existing project:** run `supabase_migrations/20261102_security_customer_portal.sql` once. It adds the fields and policies required by the current app. Do not reset or drop your tables.

The migration deliberately leaves current account roles unchanged. The older signup flow could create admin accounts, so inspect the existing admin list before reopening public signup. Downgrade any account you do not recognize.

## 3. Create the first administrator

Public signup now creates a customer account in `pending` status. It can never create an administrator. Create your own account at `/signup`, then promote that exact account in the Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin', status = 'active'
where id = (
  select id from auth.users where email = 'YOUR_ADMIN_EMAIL'
);
```

Replace `YOUR_ADMIN_EMAIL` with the email address of the account you own. Use the Users page to approve other customers or grant staff roles.

## 4. Configure email settings (recommended)

By default, Supabase requires email confirmation for new signups. For an internal admin tool this is often more friction than it's worth:

- Go to **Authentication -> Providers -> Email** and toggle **Confirm email** off if you want new admins to log in immediately after signing up. Leave it on if you'd rather verify every admin's email first.
- Go to **Authentication -> URL Configuration** and set **Site URL** to your deployed URL (or `http://localhost:5173` while developing) — this is used in password reset emails.

## 5. Connect the app to your project

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

## 6. Install and run

```bash
npm install
npm run dev
```

Visit the local URL Vite prints (usually `http://localhost:5173`). Sign up as a customer, then approve your own account as the first admin using the SQL Editor instructions above.

## 7. Build for production

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
- `supabase_schema.sql`: `profiles`, `customers`, `services`, `orders`, `payments`, `messages`, `notifications`, `business_settings` tables with foreign keys, role-based RLS policies, and private payment-proof storage

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

- The **Sign Up** page creates pending customer accounts only. Promote the first trusted administrator through the Supabase SQL Editor; later role changes are handled in the admin Users page.
- Currency formatting defaults to NGN. Change the `currency()` helper inside `Dashboard.jsx`, `Reports.jsx`, `Services.jsx`, `Orders.jsx`, and `Payments.jsx` if you'd prefer a different currency.
