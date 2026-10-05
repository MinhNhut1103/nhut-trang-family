-- =========================================================================
-- DATABASE SCHEMA: NHỰT TRANG FAMILY FINANCE HUB
-- Cấu trúc bảng PostgreSQL, RLS, Realtime chuẩn bảo mật
-- =========================================================================

-- 1. BẢNG TRANSACTIONS (Thu Chi)
create table if not exists public.transactions (
    id text primary key,
    ngay date not null default current_date,
    gio text default '08:00',
    noi_dung text not null,
    thu numeric default 0,
    chi numeric default 0,
    phan_loai text default 'ăn uống',
    loai text default 'thiết yếu',
    vault text default 'shared',
    author text default 'Nhựt',
    ghi_chu text default '',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_transactions_ngay on public.transactions (ngay desc);
create index if not exists idx_transactions_vault on public.transactions (vault);

-- 2. BẢNG MONTHLY_CONFIG (Cấu hình tháng)
create table if not exists public.monthly_config (
    id text primary key,
    banner_focus text default '',
    han_muc_chi numeric default 30000000,
    ghi_chu text default '',
    tien_ngoai_vi numeric default 0,
    tien_trong_the numeric default 0,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. BẢNG SAVINGS_GOALS (Mục tiêu tiết kiệm gia đình)
create table if not exists public.savings_goals (
    id text primary key,
    title text not null,
    target numeric not null,
    current numeric default 0,
    icon text default 'ShieldCheck',
    color text default 'emerald',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. BẢNG FAMILY_MEMBERS (Quản lý thành viên & Mã PIN được băm bảo mật SHA-256)
create table if not exists public.family_members (
    id text primary key,
    username text unique not null,
    name text not null,
    pin_hash text not null,
    role text default 'Thành viên',
    vault text default 'shared',
    color text default 'emerald',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_family_members_username on public.family_members (username);

-- 5. BẬT ROW LEVEL SECURITY (RLS) & PUBLIC ACCESS CHO APP GIA ĐÌNH
alter table public.transactions enable row level security;
alter table public.monthly_config enable row level security;
alter table public.savings_goals enable row level security;
alter table public.family_members enable row level security;

drop policy if exists "Allow all operations for transactions" on public.transactions;
create policy "Allow all operations for transactions" on public.transactions
    for all using (true) with check (true);

drop policy if exists "Allow all operations for monthly_config" on public.monthly_config;
create policy "Allow all operations for monthly_config" on public.monthly_config
    for all using (true) with check (true);

drop policy if exists "Allow all operations for savings_goals" on public.savings_goals;
create policy "Allow all operations for savings_goals" on public.savings_goals
    for all using (true) with check (true);

drop policy if exists "Allow all operations for family_members" on public.family_members;
create policy "Allow all operations for family_members" on public.family_members
    for all using (true) with check (true);

-- 6. BẬT REALTIME CHO TẤT CẢ CÁC BẢNG
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'transactions') then
    alter publication supabase_realtime add table public.transactions;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'monthly_config') then
    alter publication supabase_realtime add table public.monthly_config;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'savings_goals') then
    alter publication supabase_realtime add table public.savings_goals;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'family_members') then
    alter publication supabase_realtime add table public.family_members;
  end if;
end;
$$;
