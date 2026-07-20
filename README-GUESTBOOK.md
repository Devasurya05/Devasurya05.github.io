# The Visitors' Wall — going live

Out of the box the wall runs in **demo mode**: marks are saved in each visitor's own
browser (localStorage), so nobody sees anyone else's mark. To make the shield shared
across all visitors — for free, with no server of your own — connect Supabase:

## 1. Create the project (≈3 minutes)

1. Sign up at https://supabase.com (free tier is plenty).
2. Create a new project. Any name/region. Save the database password it asks for.
3. In the project: **Settings → API** — copy the **Project URL** and the **anon public key**.

## 2. Create the table

In the Supabase dashboard open **SQL Editor**, paste and run:

```sql
create table public.marks (
  id bigint generated always as identity primary key,
  sigil smallint not null check (sigil between 0 and 7),
  color text not null check (color in
    ('#b8853a','#e8a54b','#ff7a2f','#ffb36b','#e8e2d3','#4a8fc2')),
  initials text not null check (initials ~ '^[A-Z0-9]{1,3}$'),
  created_at timestamptz not null default now()
);

alter table public.marks enable row level security;

create policy "anyone can read marks"
  on public.marks for select using (true);

create policy "anyone can add a mark"
  on public.marks for insert with check (true);

-- Newer Supabase projects don't auto-grant API access to new tables,
-- so give the public (anon) role exactly what the wall needs and no more:
grant usage on schema public to anon;
grant select, insert on public.marks to anon;
grant usage on sequence public.marks_id_seq to anon;
```

The `check` constraints mirror the site's own validation, so even someone calling the
API directly can only ever insert a valid sigil/color/initials combination — nothing
free-form can appear on the shield.

## 3. Point the site at it

Edit `js/marks-config.js`:

```js
export const BACKEND = 'supabase';
export const SUPABASE_URL = 'https://YOURPROJECT.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJ...your anon key...';
```

The anon key is *designed* to be public — it can only do what the RLS policies above
allow (read marks, insert a valid mark). Committing it to the repo is normal.

That's it. Redeploy and every visitor shares one shield.

## Honest limitations (read this)

- **"One mark per visitor" is enforced softly** — a flag in the visitor's browser.
  Someone determined could clear storage and strike again, or script inserts against
  the API. For a portfolio guestbook this is usually fine.
- **True once-per-account** requires sign-in (e.g. "Continue with GitHub"). Supabase
  supports this, but it needs the `supabase-js` SDK served locally (the site's
  Content-Security-Policy intentionally blocks CDN scripts), an OAuth app, a
  `user_id uuid unique` column, and an insert policy of `auth.uid() = user_id`.
  Worth doing only if the wall attracts abuse.
- **Abuse valve:** if the wall ever gets spammed, in Supabase just delete rows in the
  Table Editor, or temporarily drop the insert policy
  (`drop policy "anyone can add a mark" on public.marks;`) — the site keeps working
  and simply shows the existing marks.
