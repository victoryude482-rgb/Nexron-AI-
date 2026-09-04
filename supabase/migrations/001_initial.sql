create table if not exists public.conversations (
  id text primary key,
  user_id text not null,
  title text not null default 'New conversation',
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists conversations_user_updated_idx on public.conversations(user_id,updated_at desc);
alter table public.conversations enable row level security;
-- No public/anon policy is granted. The server uses the Supabase service-role key,
-- which bypasses RLS; accidental client-side use of the anon key cannot read rows.
