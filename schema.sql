-- =========================
-- EXTENSIONS
-- =========================
create extension if not exists "pgcrypto";

-- =========================
-- TABLES
-- =========================

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text,
  contact_number text,
  occupation text,
  income_source text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists categories (
  uuid uuid primary key default gen_random_uuid(),
  user_uuid uuid,
  name text not null,
  type text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists cash_flow (
  uuid uuid primary key default gen_random_uuid(),
  user_uuid uuid,
  amount numeric not null,
  type text not null,
  category_id uuid,
  source_reason text,
  status text default 'completed',
  logged_at timestamptz not null default now(),
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists goals (
  uuid uuid primary key default gen_random_uuid(),
  user_id uuid,
  type text not null,
  target_amount numeric not null,
  start_date date not null,
  end_date date,
  status text default 'active',
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists insights (
  uuid uuid primary key default gen_random_uuid(),
  user_uuid uuid,
  title text not null,
  description text,
  trigger_type text not null,
  related_cash_flow uuid[],
  acknowledged boolean default false,
  created_at timestamptz default now()
);

create table if not exists investments (
  uuid uuid primary key default gen_random_uuid(),
  user_uuid uuid,
  name text not null,
  type text not null,
  principal numeric not null,
  current_value numeric not null,
  start_date date not null,
  status text default 'active',
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists investment_value_history (
  uuid uuid primary key default gen_random_uuid(),
  investment_uuid uuid,
  value numeric not null,
  recorded_at timestamptz not null default now(),
  notes text,
  created_at timestamptz default now()
);

create table if not exists reflections (
  uuid uuid primary key default gen_random_uuid(),
  user_uuid uuid,
  type text not null,
  prompt_text text,
  response_text text,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================
-- ENABLE RLS
-- =========================

alter table users enable row level security;
alter table categories enable row level security;
alter table cash_flow enable row level security;
alter table goals enable row level security;
alter table insights enable row level security;
alter table investments enable row level security;
alter table investment_value_history enable row level security;
alter table reflections enable row level security;

-- =========================
-- RLS POLICIES
-- =========================

-- USERS
create policy "Admins can access all data"
on users for all
using (auth.role() = 'admin');

create policy "Enable insert for authenticated users only"
on users for insert
with check (true);

create policy "Users can access their own data"
on users for all
using (auth.uid() = id);

create policy "users_select_own"
on users for select
using (auth.uid() = id);

create policy "users_update_own"
on users for update
using (auth.uid() = id);

-- CATEGORIES
create policy "Admins can access all categories"
on categories for all
using (auth.role() = 'admin');

create policy "Users can access their own categories"
on categories for all
using (auth.uid() = user_uuid);

create policy "categories_insert_own"
on categories for insert
with check (true);

create policy "categories_select_own"
on categories for select
using (auth.uid() = user_uuid);

create policy "categories_update_own"
on categories for update
using (auth.uid() = user_uuid);

create policy "categories_delete_own"
on categories for delete
using (auth.uid() = user_uuid);

-- CASH FLOW
create policy "Admins can access all cash flow"
on cash_flow for all
using (auth.role() = 'admin');

create policy "Users can access their own cash flow"
on cash_flow for all
using (auth.uid() = user_uuid);

create policy "cashflow_insert_own"
on cash_flow for insert
with check (true);

create policy "cashflow_select_own"
on cash_flow for select
using (auth.uid() = user_uuid);

create policy "cashflow_update_own"
on cash_flow for update
using (auth.uid() = user_uuid);

create policy "cashflow_delete_own"
on cash_flow for delete
using (auth.uid() = user_uuid);

-- GOALS
create policy "Admins can access all goals"
on goals for all
using (auth.role() = 'admin');

create policy "Users can access their own goals"
on goals for all
using (auth.uid() = user_id);

create policy "goals_insert_own"
on goals for insert
with check (true);

create policy "goals_select_own"
on goals for select
using (auth.uid() = user_id);

create policy "goals_update_own"
on goals for update
using (auth.uid() = user_id);

create policy "goals_delete_own"
on goals for delete
using (auth.uid() = user_id);

-- INSIGHTS
create policy "Admins can access all insights"
on insights for all
using (auth.role() = 'admin');

create policy "Users can access their own insights"
on insights for all
using (auth.uid() = user_uuid);

create policy "insights_insert_own"
on insights for insert
with check (true);

create policy "insights_select_own"
on insights for select
using (auth.uid() = user_uuid);

create policy "insights_update_own"
on insights for update
using (auth.uid() = user_uuid);

create policy "insights_delete_own"
on insights for delete
using (auth.uid() = user_uuid);

-- INVESTMENTS
create policy "investments_insert_own"
on investments for insert
with check (true);

create policy "investments_select_own"
on investments for select
using (auth.uid() = user_uuid);

create policy "investments_update_own"
on investments for update
using (auth.uid() = user_uuid);

create policy "investments_delete_own"
on investments for delete
using (auth.uid() = user_uuid);

-- INVESTMENT VALUE HISTORY
create policy "investment_history_insert_own"
on investment_value_history for insert
with check (true);

create policy "investment_history_select_own"
on investment_value_history for select
using (
  exists (
    select 1
    from investments i
    where i.uuid = investment_value_history.investment_uuid
      and i.user_uuid = auth.uid()
  )
);

-- REFLECTIONS
create policy "Admins can access all reflections"
on reflections for all
using (auth.role() = 'admin');

create policy "Users can access their own reflections"
on reflections for all
using (auth.uid() = user_uuid);

create policy "reflections_insert_own"
on reflections for insert
with check (true);

create policy "reflections_select_own"
on reflections for select
using (auth.uid() = user_uuid);

create policy "reflections_update_own"
on reflections for update
using (auth.uid() = user_uuid);

create policy "reflections_delete_own"
on reflections for delete
using (auth.uid() = user_uuid);
