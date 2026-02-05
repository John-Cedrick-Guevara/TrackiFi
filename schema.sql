
database schema 

-- ============================================
-- 1. USERS TABLE
-- ============================================
create table public.users (
    uuid uuid primary key default gen_random_uuid(),
    first_name text not null,
    last_name text not null,
    contact_number text,
    occupation text,
    income_source text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Admin and RLS roles handled in policies (see below)

-- ============================================
-- 2. CATEGORIES TABLE
-- ============================================
create table public.categories (
    uuid uuid primary key default gen_random_uuid(),
    user_uuid uuid references public.users(uuid) on delete cascade,
    name text not null,
    type text check(type in ('in','out')) not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index idx_categories_user_uuid on public.categories(user_uuid);

-- ============================================
-- 3. GOALS TABLE
-- ============================================
create table public.goals (
    uuid uuid primary key default gen_random_uuid(),
    user_uuid uuid references public.users(uuid) on delete cascade,
    type text check(type in ('savings','investment','custom')) not null,
    target_amount numeric(12,2) not null,
    start_date date not null,
    end_date date,
    status text check(status in ('active','paused','completed')) default 'active',
    metadata jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index idx_goals_user_uuid on public.goals(user_uuid);
create index idx_goals_user_status on public.goals(user_uuid, status);

-- ============================================
-- 4. CASH_FLOW TABLE
-- ============================================
create table public.cash_flow (
    uuid uuid primary key default gen_random_uuid(),
    user_uuid uuid references public.users(uuid) on delete cascade,
    amount numeric(12,2) not null,
    type text check(type in ('in','out')) not null,
    category_id uuid references public.categories(uuid),
    source_reason text,
    status text check(status in ('completed','pending')) default 'completed',
    logged_at timestamptz not null default now(),
    metadata jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index idx_cash_flow_user on public.cash_flow(user_uuid);
create index idx_cash_flow_user_created on public.cash_flow(user_uuid, created_at);
create index idx_cash_flow_logged_at on public.cash_flow(logged_at);

-- ============================================
-- 5. REFLECTIONS TABLE
-- ============================================
create table public.reflections (
    uuid uuid primary key default gen_random_uuid(),
    user_uuid uuid references public.users(uuid) on delete cascade,
    type text check(type in ('weekly','monthly','ad_hoc')) not null,
    prompt_text text,
    response_text text,
    metadata jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index idx_reflections_user on public.reflections(user_uuid);

-- ============================================
-- 6. INSIGHTS TABLE
-- ============================================
create table public.insights (
    uuid uuid primary key default gen_random_uuid(),
    user_uuid uuid references public.users(uuid) on delete cascade,
    title text not null,
    description text,
    trigger_type text check(trigger_type in ('weekly_cron','monthly_review','behavior_change')) not null,
    related_cash_flow uuid[],  -- array of cash_flow uuids
    acknowledged boolean default false,
    created_at timestamptz default now()
);

create index idx_insights_user on public.insights(user_uuid);
create index idx_insights_ack on public.insights(user_uuid, acknowledged);

-- ============================================
-- 7. INVESTMENTS TABLE
-- ============================================
create table public.investments (
    uuid uuid primary key default gen_random_uuid(),
    user_uuid uuid references public.users(uuid) on delete cascade,
    name text not null,
    type text check(type in ('stock','crypto','fund','savings','other')) not null,
    principal numeric(12,2) not null,
    current_value numeric(12,2) not null,
    start_date date not null,
    status text check(status in ('active','closed')) default 'active',
    metadata jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index idx_investments_user on public.investments(user_uuid);
create index idx_investments_status on public.investments(user_uuid, status);

-- ============================================
-- 8. INVESTMENT_VALUE_HISTORY TABLE
-- ============================================
create table public.investment_value_history (
    uuid uuid primary key default gen_random_uuid(),
    investment_uuid uuid references public.investments(uuid) on delete cascade,
    value numeric(12,2) not null,
    recorded_at timestamptz not null default now(),
    notes text,
    created_at timestamptz default now()
);

create index idx_inv_history_investment_uuid on public.investment_value_history(investment_uuid);
create index idx_inv_history_recorded_at on public.investment_value_history(recorded_at);

-- ============================================
-- 9. ENABLE RLS AND CREATE POLICIES
-- ============================================

-- Enable RLS for each table
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.goals enable row level security;
alter table public.cash_flow enable row level security;
alter table public.reflections enable row level security;
alter table public.insights enable row level security;
alter table public.investments enable row level security;
alter table public.investment_value_history enable row level security;

-- Users can select/update/delete their own data
create policy "Users can access their own data" 
    on public.users
    for all
    using (auth.uid() = uuid);

create policy "Users can access their own categories" 
    on public.categories
    for all
    using (auth.uid() = user_uuid);

create policy "Users can access their own goals" 
    on public.goals
    for all
    using (auth.uid() = user_uuid);

create policy "Users can access their own cash flow" 
    on public.cash_flow
    for all
    using (auth.uid() = user_uuid);

create policy "Users can access their own reflections" 
    on public.reflections
    for all
    using (auth.uid() = user_uuid);

create policy "Users can access their own insights" 
    on public.insights
    for all
    using (auth.uid() = user_uuid);

create policy "Users can access their own investments" 
    on public.investments
    for all
    using (auth.uid() = user_uuid);

create policy "Users can access their own investment history" 
    on public.investment_value_history
    for all
    using (
        exists (
            select 1 from public.investments 
            where uuid = investment_value_history.investment_uuid 
            and user_uuid = auth.uid()
        )
    );

-- Admin can bypass RLS (assuming role is 'admin')
-- Supabase uses a custom claim in JWT, e.g., `role = 'admin'`
create policy "Admins can access all data" 
    on public.users
    for all
    using (auth.role() = 'admin');

create policy "Admins can access all categories" 
    on public.categories
    for all
    using (auth.role() = 'admin');

create policy "Admins can access all goals" 
    on public.goals
    for all
    using (auth.role() = 'admin');

create policy "Admins can access all cash flow" 
    on public.cash_flow
    for all
    using (auth.role() = 'admin');

create policy "Admins can access all reflections" 
    on public.reflections
    for all
    using (auth.role() = 'admin');

create policy "Admins can access all insights" 
    on public.insights
    for all
    using (auth.role() = 'admin');

create policy "Admins can access all investments" 
    on public.investments
    for all
    using (auth.role() = 'admin');

create policy "Admins can access all investment history" 
    on public.investment_value_history
    for all
    using (auth.role() = 'admin');
