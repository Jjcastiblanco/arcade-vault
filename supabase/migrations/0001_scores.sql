-- supabase/migrations/0001_scores.sql
create table if not exists scores (
  id bigint generated always as identity primary key,
  game_id text not null,
  player_name text not null,
  score integer not null,
  created_at timestamptz not null default now()
);

alter table scores enable row level security;

create policy "public read" on scores
  for select using (true);

create policy "public insert" on scores
  for insert with check (true);
