# Smart Bookmarks

A real-time bookmark manager built with Next.js, Supabase, and Tailwind CSS. Features Google OAuth authentication, per-user privacy via Row Level Security, and live WebSocket sync across tabs.

## Features

- **Google OAuth** — One-click sign-in via Supabase Auth
- **Real-time sync** — Bookmarks update instantly across tabs via Supabase Realtime (WebSocket, not polling)
- **Per-user privacy** — Row Level Security ensures users only see their own bookmarks
- **Optimistic UI** — Deletes remove from UI instantly with rollback on error
- **Favicon extraction** — Automatically fetches site favicons via Google's favicon API
- **Dark theme** — Polished dark UI with smooth Framer Motion animations
- **Responsive** — Works on mobile, tablet, and desktop
- **Defense-in-depth auth** — Middleware + server layout + RLS all enforce authentication

## Tech Stack

| Layer        | Technology                     |
| ------------ | ------------------------------ |
| Framework    | Next.js 16 (App Router, TypeScript) |
| Auth & DB    | Supabase (Google OAuth, PostgreSQL, Realtime) |
| Styling      | Tailwind CSS 4                 |
| Animations   | Framer Motion                  |
| Icons        | Lucide React                   |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project with Google OAuth configured

### 1. Clone and install

```bash
git clone <repo-url>
cd abstrabit
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set up Supabase

Run the following SQL in the Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create bookmarks table
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  favicon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only access their own bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmarks"
  ON public.bookmarks FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookmarks;
```

Also configure Google OAuth in your Supabase project:
1. Go to **Authentication → Providers → Google**
2. Enable it and add your Google OAuth client ID and secret
3. Set the redirect URL to `https://your-domain.com/auth/callback` (or `http://localhost:3000/auth/callback` for local dev)

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (Inter font, dark theme)
│   ├── page.tsx                # Landing page (hero + login)
│   ├── globals.css             # Tailwind + custom scrollbar
│   ├── auth/callback/route.ts  # OAuth callback handler
│   └── dashboard/
│       ├── layout.tsx          # Auth-protected shell + navbar
│       └── page.tsx            # Server-side bookmark fetch → BookmarkList
├── components/
│   ├── auth/
│   │   ├── login-button.tsx    # Google OAuth sign-in
│   │   └── user-menu.tsx       # Avatar + sign-out dropdown
│   └── bookmarks/
│       ├── bookmark-list.tsx   # Client: realtime list with animations
│       ├── bookmark-card.tsx   # Bookmark row (favicon, title, URL, delete)
│       ├── bookmark-form.tsx   # Add form with validation
│       └── empty-state.tsx     # Empty state illustration
├── hooks/
│   └── use-realtime-bookmarks.ts  # Realtime subscription + CRUD + optimistic UI
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   ├── server.ts           # Server Supabase client (cookie-aware)
│   │   └── middleware.ts       # Session refresh + route protection
│   ├── types/database.ts       # TypeScript types for DB schema
│   └── utils.ts                # URL validation, favicon URL, date formatting
└── middleware.ts               # Next.js middleware entry point
```

## Architecture Decisions

1. **Server Components fetch, Client Components interact**: The dashboard page (Server Component) fetches initial bookmarks server-side, then passes them to `BookmarkList` (Client Component) which manages realtime state. This gives us fast initial page loads and interactive updates.

2. **Defense-in-depth auth**: Authentication is enforced at three levels — Next.js middleware (redirects unauthenticated users), server-side layout (double-checks with `getUser()`), and Supabase RLS (database enforces `auth.uid() = user_id`).

3. **Optimistic UI with rollback**: Deletes remove the bookmark from the UI immediately. If the database delete fails, the bookmark is restored to its previous position.

4. **Realtime deduplication**: When a user adds a bookmark, it appears in the list from the direct insert response. The realtime `INSERT` event is deduplicated by checking if the bookmark ID already exists in state.

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy — Vercel auto-detects Next.js
