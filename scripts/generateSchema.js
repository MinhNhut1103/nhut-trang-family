import * as data from '../src/data/initialData.js';
import fs from 'fs';

function escapeSql(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/'/g, "''");
}

let sql = `-- =========================================================================
-- DATABASE SCHEMA: NHỰT TRANG FAMILY FINANCE HUB
-- Hỗ trợ Supabase Postgres, RLS, Realtime và TOÀN BỘ 319 DÒNG DỮ LIỆU
-- Dự án: Nhựt & Trang Family
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
    id text primary key, -- ví dụ: '2026-10', '2026-09', '2026-08'
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

-- 4. BẢNG FAMILY_MEMBERS (Quản lý thành viên & Thông tin đăng nhập an toàn)
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

-- Policy cho phép đọc/ghi qua anon key
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

-- Bật Realtime cho cả 4 bảng
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

-- 6. CHÈN DỮ LIỆU THÀNH VIÊN GIA ĐÌNH
insert into public.family_members (id, username, name, pin_hash, role, vault, color)
values 
    ('m-1', 'nhut', 'Nhựt', '1103', 'Chủ gia đình', 'personal_nhut', 'emerald'),
    ('m-2', 'trang', 'Trang', '1234', 'Đồng quản lý', 'personal_trang', 'pink')
on conflict (id) do update set
    username = excluded.username,
    name = excluded.name,
    pin_hash = excluded.pin_hash,
    role = excluded.role,
    vault = excluded.vault,
    color = excluded.color;

-- 7. CHÈN DỮ LIỆU CẤU HÌNH CÁC THÁNG
insert into public.monthly_config (id, banner_focus, han_muc_chi, ghi_chu)
values 
    ('2026-10', 'Tối ưu chi tiêu & tiết kiệm', 30000000, 'Tháng 10/2026: Ưu tiên tiết kiệm chuẩn bị cho các kế hoạch cuối năm, rà soát hóa đơn điện nước định kỳ.'),
    ('2026-09', '${escapeSql(data.initialSeptemberConfig.banner_focus)}', ${data.initialSeptemberConfig.han_muc_chi || 25000000}, '${escapeSql(data.initialSeptemberConfig.ghi_chu)}'),
    ('2026-08', '${escapeSql(data.initialAugustConfig.banner_focus)}', ${data.initialAugustConfig.han_muc_chi || 20000000}, '${escapeSql(data.initialAugustConfig.ghi_chu)}')
on conflict (id) do update set
    banner_focus = excluded.banner_focus,
    han_muc_chi = excluded.han_muc_chi,
    ghi_chu = excluded.ghi_chu;

-- 8. CHÈN DỮ LIỆU MỤC TIÊU TIẾT KIỆM
insert into public.savings_goals (id, title, target, current, icon, color)
values 
    ('g1', 'Kỳ nghỉ gia đình hè 2026', 45000000, 34500000, 'AirplaneTilt', 'emerald'),
    ('g2', 'Quỹ dự phòng y tế & khẩn cấp', 60000000, 60000000, 'ShieldCheck', 'blue'),
    ('g3', 'Đổi xe máy mới cho Trang', 35000000, 22000000, 'Bicycle', 'amber')
on conflict (id) do update set
    title = excluded.title,
    target = excluded.target,
    current = excluded.current,
    icon = excluded.icon,
    color = excluded.color;

-- 9. CHÈN TOÀN BỘ 319 GIAO DỊCH THU CHI (THÁNG 8, THÁNG 9, THÁNG 10)
insert into public.transactions (id, ngay, gio, noi_dung, thu, chi, phan_loai, loai, vault, author, ghi_chu)
values
`;

const txValues = data.initialTransactions.map((t) => {
  const id = escapeSql(t.id);
  const ngay = escapeSql(t.ngay);
  const gio = escapeSql(t.gio || '08:00');
  const noiDung = escapeSql(t.noi_dung);
  const thu = Number(t.thu) || 0;
  const chi = Number(t.chi) || 0;
  const phanLoai = escapeSql(t.phan_loai || 'ăn uống');
  const loai = escapeSql(t.loai || 'thiết yếu');
  const vault = escapeSql(t.vault || 'shared');
  const author = escapeSql(t.author || 'Nhựt');
  const ghiChu = escapeSql(t.ghi_chu || '');
  return `  ('${id}', '${ngay}', '${gio}', '${noiDung}', ${thu}, ${chi}, '${phanLoai}', '${loai}', '${vault}', '${author}', '${ghiChu}')`;
});

sql += txValues.join(',\n') + '\non conflict (id) do nothing;\n';

fs.writeFileSync('supabase/schema.sql', sql, 'utf8');
console.log('Successfully written supabase/schema.sql with', txValues.length, 'transactions!');
