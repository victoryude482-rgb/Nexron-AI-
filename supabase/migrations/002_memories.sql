create table if not exists public.memories (
  id text primary key,
  user_id text not null,
  content text not null,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);
create index if not exists memories_user_created_idx on public.memories(user_id,created_at desc);
alter table public.memories enable row level security;
-- No public/anon policy. Server-side service-role access is required.
