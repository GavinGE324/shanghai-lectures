-- 在 Supabase SQL Editor 中运行此脚本
-- 如果之前已建表，先删除旧表：
-- drop table if exists lectures;

create table lectures (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  speaker text not null,
  date timestamptz not null,
  university text not null,
  category text not null check (category in ('science', 'engineering', 'social_science', 'interdisciplinary')),
  source_url text not null,
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  created_at timestamptz default now()
);

create index idx_lectures_status on lectures(status);
create index idx_lectures_category on lectures(category);
create index idx_lectures_date on lectures(date desc);
create unique index idx_lectures_source_url on lectures(source_url);

alter table lectures enable row level security;

create policy "Anyone can read published lectures"
  on lectures for select
  using (status = 'published');

create policy "Service role can do everything"
  on lectures for all
  using (true)
  with check (true);
