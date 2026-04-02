create table text_simplification_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table text_simplification_logs enable row level security;

create policy "Users can insert own logs"
  on text_simplification_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can read own logs"
  on text_simplification_logs for select
  using (auth.uid() = user_id);

create policy "Admins full access"
  on text_simplification_logs for all
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );
