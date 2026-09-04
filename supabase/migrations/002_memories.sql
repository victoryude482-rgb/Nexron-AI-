create table if not exists public.memories (
  id text primary key,
  user_id text not null,
  scope text not null check (scope in ('user','project','conversation')),
  key text not null,
  value text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists memories_user_created_idx on public.memories(user_id,created_at desc);
create index if not exists memories_scope_created_idx on public.memories(scope,created_at desc);
alter table public.memories enable row level security;
