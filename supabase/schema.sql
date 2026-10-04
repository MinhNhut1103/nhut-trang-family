-- =========================================================================
-- DATABASE SCHEMA: NHỰT TRANG FAMILY FINANCE HUB
-- Hỗ trợ Supabase Postgres, RLS, Realtime và bảng dữ liệu mẫu chuẩn Google Sheet
-- =========================================================================

-- 1. BẢNG TRANSACTIONS (Thu Chi)
create table if not exists public.transactions (
    id uuid default gen_random_uuid() primary key,
    ngay date not null default current_date,
    noi_dung text not null,
    thu numeric default 0,
    chi numeric default 0,
    phan_loai text default 'ăn uống',     -- công việc, ăn uống, tiêu hao, biếu tặng, nhà cửa, con cái, đi lại, khác
    loai text default 'thiết yếu',       -- thiết yếu, công việc, hưởng thụ, tiết kiệm, đầu tư
    vault text default 'shared',          -- shared (quỹ chung), personal_nhut (ví Nhựt), personal_trang (ví Trang)
    author text default 'Nhựt',          -- Nhựt, Trang
    ghi_chu text default '',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index để truy vấn nhanh theo ngày và không gian ví
create index if not exists idx_transactions_ngay on public.transactions (ngay desc);
create index if not exists idx_transactions_vault on public.transactions (vault);

-- 2. BẢNG MONTHLY_CONFIG (Cấu hình tháng, mục tiêu tháng như "giảm mua đồ")
create table if not exists public.monthly_config (
    id text primary key, -- ví dụ: '2026-10'
    banner_focus text default 'giảm mua đồ', -- thông điệp chú ý của tháng
    han_muc_chi numeric default 30000000,
    ghi_chu text default '',
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

-- 4. BẬT ROW LEVEL SECURITY (RLS) & PUBLIC ACCESS CHO APP GIA ĐÌNH
alter table public.transactions enable row level security;
alter table public.monthly_config enable row level security;
alter table public.savings_goals enable row level security;

-- Policy cho phép đọc/ghi qua anon key (dành cho gia đình dùng chung mã kết nối)
create policy "Allow all operations for transactions" on public.transactions
    for all using (true) with check (true);

create policy "Allow all operations for monthly_config" on public.monthly_config
    for all using (true) with check (true);

create policy "Allow all operations for savings_goals" on public.savings_goals
    for all using (true) with check (true);

-- Bật Realtime
alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.monthly_config;
alter publication supabase_realtime add table public.savings_goals;

-- 5. CHÈN DỮ LIỆU MẪU CHUẨN TỪ BẢNG EXCEL CỦA BẠN (SEEDS)
insert into public.monthly_config (id, banner_focus, han_muc_chi)
values ('2026-10', 'giảm mua đồ', 30000000)
on conflict (id) do update set banner_focus = excluded.banner_focus;

insert into public.savings_goals (id, title, target, current, icon, color)
values 
    ('g1', 'Kỳ nghỉ gia đình hè 2026', 45000000, 34500000, 'AirplaneTilt', 'emerald'),
    ('g2', 'Quỹ dự phòng y tế & khẩn cấp', 60000000, 60000000, 'ShieldCheck', 'blue'),
    ('g3', 'Đổi xe máy mới cho Trang', 35000000, 22000000, 'Bicycle', 'amber')
on conflict (id) do nothing;

insert into public.transactions (ngay, noi_dung, thu, chi, phan_loai, loai, vault, author)
values
    ('2026-10-01', 'phí sửa web https://maylocnuocnhaty.com/', 2000000, 0, 'công việc', 'công việc', 'shared', 'Nhựt'),
    ('2026-10-01', 'chạy ads Clickclack Cafe', 300000, 0, 'công việc', 'công việc', 'shared', 'Nhựt'),
    ('2026-10-01', 'Ăn sáng sữa đậu nành', 0, 70000, 'ăn uống', 'thiết yếu', 'shared', 'Trang'),
    ('2026-10-01', 'Cơm trưa', 0, 43000, 'ăn uống', 'thiết yếu', 'personal_nhut', 'Nhựt'),
    ('2026-10-01', 'lưu hositng cho web thanhdatvina.com', 1000000, 0, 'công việc', 'công việc', 'shared', 'Nhựt'),
    ('2026-10-01', 'Bách hóa xanh nước giặt, pin', 0, 190000, 'tiêu hao', 'thiết yếu', 'shared', 'Trang'),
    ('2026-10-01', 'Cơm sườn 1.10 24k', 0, 24000, 'ăn uống', 'thiết yếu', 'personal_nhut', 'Nhựt'),
    ('2026-10-02', 'Chi chuyển lại', 28000, 0, 'ăn uống', 'thiết yếu', 'shared', 'Trang'),
    ('2026-10-02', 'Mừng cưới Huyền Tám 1tr', 0, 1000000, 'biếu tặng', 'thiết yếu', 'shared', 'Nhựt'),
    ('2026-10-02', 'Trà sữa homemate', 0, 162000, 'nhà cửa', 'thiết yếu', 'shared', 'Trang'),
    ('2026-10-03', 'cơm nước', 0, 25000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt'),
    ('2026-10-03', 'bánh', 0, 40000, 'ăn uống', 'thiết yếu', 'shared', 'Trang')
on conflict do nothing;
