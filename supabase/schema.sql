-- =======================================================
-- Kanso To-Do List - Supabase SQL Schema
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
-- =======================================================

-- 1. Create the tasks table
create table if not exists public.tasks (
  id text primary key,
  title text not null,
  notes text default '',
  completed boolean default false not null,
  completed_at timestamptz,
  date text not null, -- format: YYYY-MM-DD
  time text, -- format: HH:mm (e.g., '14:30')
  time_block text default 'Morning' not null,
  category text default 'Deep Work' not null,
  duration_minutes integer default 25 not null,
  priority text default 'Calm' not null,
  subtasks jsonb default '[]'::jsonb not null,
  created_at timestamptz default now() not null
);

-- 2. Create indices for performance
create index if not exists idx_tasks_date on public.tasks (date);
create index if not exists idx_tasks_completed on public.tasks (completed);
create index if not exists idx_tasks_created_at on public.tasks (created_at desc);

-- 3. Enable Row Level Security (RLS)
alter table public.tasks enable row level security;

-- 4. Create policies for public/anon access (useful for single-user or public prototype apps)
create policy "Allow public read access to tasks"
  on public.tasks for select
  using (true);

create policy "Allow public insert access to tasks"
  on public.tasks for insert
  with check (true);

create policy "Allow public update access to tasks"
  on public.tasks for update
  using (true)
  with check (true);

create policy "Allow public delete access to tasks"
  on public.tasks for delete
  using (true);

-- 5. (Optional) Enable Realtime
alter publication supabase_realtime add table public.tasks;
