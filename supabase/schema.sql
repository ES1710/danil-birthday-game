create table if not exists public.quiz_results (
  id bigint generated always as identity primary key,
  name text not null check (char_length(btrim(name)) between 2 and 30),
  name_key text generated always as (lower(btrim(name))) stored unique,
  score smallint not null check (score between 0 and 15),
  created_at timestamptz not null default now()
);

alter table public.quiz_results enable row level security;

revoke all on table public.quiz_results from anon, authenticated;
revoke all on sequence public.quiz_results_id_seq from anon, authenticated;
