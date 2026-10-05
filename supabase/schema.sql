-- =========================================================================
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
    ('2026-09', 'Đã chốt sổ Tháng 9/2026', 25000000, 'Dữ liệu thu chi Tháng 9/2026 đã chốt sổ: Tổng Thu 28.515.874 đ, Tổng Chi 20.340.438 đ, Thặng dư +8.175.436 đ.'),
    ('2026-08', 'Đã chốt sổ Tháng 8/2026', 20000000, 'Dữ liệu thu chi Tháng 8/2026 đã chốt sổ: Tổng Thu 28.046.000 đ, Tổng Chi 13.453.503 đ, Thặng dư +14.592.497 đ.')
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
  ('tx-12', '2026-10-03', '16:10', 'bánh', 0, 40000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-11', '2026-10-03', '12:35', 'cơm nước', 0, 25000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-10', '2026-10-02', '15:25', 'Trà sữa homemate', 0, 162000, 'nhà cửa', 'thiết yếu', 'shared', 'Trang', 'Mua nguyên liệu tự làm trà sữa'),
  ('tx-9', '2026-10-02', '11:10', 'Mừng cưới Huyền Tám 1tr', 0, 1000000, 'biếu tặng', 'thiết yếu', 'shared', 'Nhựt', 'Tiền mừng cưới bạn đại học'),
  ('tx-8', '2026-10-02', '08:40', 'Chi chuyển lại', 28000, 0, 'ăn uống', 'thiết yếu', 'shared', 'Trang', 'Tiền thừa bạn trả lại'),
  ('tx-7', '2026-10-01', '18:55', 'Cơm sườn 1.10 24k', 0, 24000, 'ăn uống', 'thiết yếu', 'personal_nhut', 'Nhựt', 'Cơm sườn chiều'),
  ('tx-6', '2026-10-01', '17:40', 'Bách hóa xanh nước giặt, pin', 0, 190000, 'tiêu hao', 'thiết yếu', 'shared', 'Trang', 'Đồ dùng sinh hoạt trong nhà'),
  ('tx-5', '2026-10-01', '14:30', 'lưu hositng cho web thanhdatvina.com', 1000000, 0, 'công việc', 'công việc', 'shared', 'Nhựt', 'Gia hạn 1 năm'),
  ('tx-4', '2026-10-01', '12:15', 'Cơm trưa', 0, 43000, 'ăn uống', 'thiết yếu', 'personal_nhut', 'Nhựt', 'Cơm trưa văn phòng'),
  ('tx-2', '2026-10-01', '10:45', 'chạy ads Clickclack Cafe', 300000, 0, 'công việc', 'công việc', 'shared', 'Nhựt', 'Phí dịch vụ tuần 1'),
  ('tx-1', '2026-10-01', '09:15', 'phí sửa web https://maylocnuocnhaty.com/', 2000000, 0, 'công việc', 'công việc', 'shared', 'Nhựt', 'Khách thanh toán chuyển khoản'),
  ('tx-3', '2026-10-01', '07:20', 'Ăn sáng sữa đậu nành', 0, 70000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', 'Ăn sáng 2 vợ chồng'),
  ('tx-sep-165', '2026-09-30', '18:20', 'chuyển tiền ngọc anh', 0, 156000, 'nhà cửa', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-164', '2026-09-30', '17:35', 'fpt play', 0, 75000, 'giải trí', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-163', '2026-09-30', '16:50', 'xanh sm cho hoàng', 0, 66000, 'di chuyển', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-162', '2026-09-30', '15:25', 'xanh sm', 0, 54000, 'di chuyển', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-161', '2026-09-30', '14:40', 'xanh sm', 0, 59000, 'di chuyển', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-160', '2026-09-30', '13:10', 'grab', 0, 183000, 'di chuyển', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-159', '2026-09-30', '12:20', 'apple', 0, 89000, 'điện tử', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-158', '2026-09-30', '11:45', 'tiền thuốc bù', 0, 64000, 'công việc', 'công việc', 'shared', 'Trang', ''),
  ('tx-sep-157', '2026-09-30', '10:30', 'gemini pro', 0, 20000, 'công việc', 'công việc', 'personal_nhut', 'Nhựt', ''),
  ('tx-sep-156', '2026-09-30', '09:00', '4 cái bánh mì', 0, 32000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-153', '2026-09-29', '20:45', 'kẹo gừng', 0, 71000, 'tiêu hao', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-152', '2026-09-29', '19:15', 'chuột,dây sạc, tai nghe', 0, 777000, 'điện tử', 'thiết yếu', 'personal_nhut', 'Nhựt', ''),
  ('tx-sep-151', '2026-09-29', '18:20', 'mì ý', 0, 40000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-155', '2026-09-29', '08:15', 'mua đồ hết date', 0, 64000, 'công việc', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-154', '2026-09-29', '07:30', 'bún đậu', 0, 126000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-150', '2026-09-28', '17:35', 'bánh ngọt', 0, 27000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-149', '2026-09-28', '16:50', 'đổ xăng', 0, 50000, 'di chuyển', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-148', '2026-09-28', '15:25', 'bánh canh tiên', 0, 30000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-147', '2026-09-28', '14:40', 'bánh canh', 0, 30000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-146', '2026-09-28', '13:10', 'nước tiên và nhi', 0, 40000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-145', '2026-09-28', '12:20', 'nước', 0, 25000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-170', '2026-09-28', '09:00', 'grab 28', 0, 38000, 'di chuyển', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-139', '2026-09-27', '20:45', '18k bánh bao', 0, 18000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-138', '2026-09-27', '19:15', '90k đổ xăng', 0, 90000, 'di chuyển', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-144', '2026-09-27', '11:45', 'gỏi cuốn và trà tắc', 0, 25000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-143', '2026-09-27', '10:30', 'gỏi cuốn tây sơn nhi, khánh', 0, 30000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-142', '2026-09-27', '09:00', 'cafe bạc sĩu 40k', 0, 40000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-141', '2026-09-27', '08:15', '40k hoành thánh - chị Lan', 0, 40000, 'nhà cửa', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-140', '2026-09-27', '07:30', '20k bánh mì', 0, 20000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-137', '2026-09-26', '18:20', 'Thuốc a trưa 40k', 0, 40000, 'nhà cửa', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-136', '2026-09-26', '17:35', 'Thuốc hảo 32k', 0, 32000, 'nhà cửa', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-135', '2026-09-26', '16:50', 'Mẹ đưa 500k', 500000, 0, 'biếu tặng', 'không thiết yếu', 'shared', 'Nhựt', 'Chốt sổ tháng 9'),
  ('tx-sep-134', '2026-09-26', '15:25', '2 triệu chạy ads Bếp Phúc Hưng', 2000000, 0, 'công việc', 'công việc', 'shared', 'Nhựt', 'Chốt sổ tháng 9'),
  ('tx-sep-133', '2026-09-25', '14:40', 'Sữa tắm dầu gội dầu xả 477k', 0, 477000, 'tiêu hao', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-132', '2026-09-25', '13:10', 'Men vi sinh bé na 15k', 0, 15000, 'nhà cửa', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-131', '2026-09-25', '12:20', 'thuốc cho bà 316 thuốc của mẹ 291', 0, 607000, 'biếu tặng', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-130', '2026-09-25', '11:45', 'sửa xe 180', 0, 180000, 'di chuyển', 'thiết yếu', 'personal_nhut', 'Nhựt', ''),
  ('tx-sep-129', '2026-09-25', '10:30', 'cơm 30 bánh 20 cơm 30', 0, 80000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-128', '2026-09-25', '09:00', 'Tóc 60', 0, 60000, 'làm đẹp', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-127', '2026-09-25', '08:15', '100k phí cài email tên miền', 100000, 0, 'công việc', 'công việc', 'shared', 'Nhựt', 'Chốt sổ tháng 9'),
  ('tx-sep-126', '2026-09-25', '07:30', 'nạp game - 300k', 0, 300000, 'giải trí', 'thiết yếu', 'personal_nhut', 'Nhựt', ''),
  ('tx-sep-125', '2026-09-24', '20:45', 'nahp tiền mạng 70k', 0, 70000, 'điện tử', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-124', '2026-09-24', '19:15', 'Thuốc 26k', 0, 26000, 'làm đẹp', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-123', '2026-09-24', '18:20', 'Bánh 33k', 0, 33000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-122', '2026-09-24', '17:35', 'Cơm 35k', 0, 35000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-169', '2026-09-24', '08:15', 'bún mam bun thai 24', 0, 45000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-121', '2026-09-23', '16:50', 'Chăm sóc website MPN hair', 1550000, 0, 'công việc', 'công việc', 'shared', 'Nhựt', 'Chốt sổ tháng 9'),
  ('tx-sep-120', '2026-09-23', '15:25', 'đá banh', 0, 55000, 'giải trí', 'thiết yếu', 'personal_nhut', 'Nhựt', ''),
  ('tx-sep-119', '2026-09-23', '14:40', 'đá banh', 0, 105000, 'giải trí', 'thiết yếu', 'personal_nhut', 'Nhựt', ''),
  ('tx-sep-118', '2026-09-23', '13:10', 'hỗ trợ web dencuaong.vn', 250000, 0, 'công việc', 'công việc', 'shared', 'Nhựt', 'Chốt sổ tháng 9'),
  ('tx-sep-117', '2026-09-23', '12:20', 'bánh ngọt', 0, 15000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-116', '2026-09-23', '11:45', 'cơm', 0, 30000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-115', '2026-09-23', '10:30', 'nước muối chị Hằng', 0, 15000, 'nhà cửa', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-114', '2026-09-23', '09:00', 'cơm', 0, 32000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-111', '2026-09-22', '20:45', 'nước muối và băng cá nhân cho chị lan', 0, 20000, 'nhà cửa', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-110', '2026-09-22', '19:15', 'Nước cam', 0, 20000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-109', '2026-09-22', '18:20', 'áo mưa', 0, 10000, 'tiêu hao', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-113', '2026-09-22', '08:15', 'xịt mũi chị Hằng 42k, thuốc huyền 32k', 0, 74000, 'nhà cửa', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-112', '2026-09-22', '07:30', 'đồ ăn sáng (Hảo, Huyền, Lan, Hằng)', 0, 154000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-108', '2026-09-21', '17:35', 'bún đậu', 0, 50000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-107', '2026-09-21', '16:50', 'ăn sáng (anh Nhựt, An, Bảo)', 0, 118000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-106', '2026-09-21', '15:25', 'Cơm', 0, 32000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-167', '2026-09-20', '20:45', 'cơm 20', 0, 60000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-105', '2026-09-20', '14:40', 'Cơm nước', 0, 40000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-104', '2026-09-20', '13:10', 'Cơm nước', 0, 68000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-103', '2026-09-20', '12:20', 'Bánh', 0, 35000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-168', '2026-09-20', '07:30', 'hoàng 20', 0, 45000, 'biếu tặng', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-97', '2026-09-19', '20:45', 'Tàu hủ', 0, 20000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-166', '2026-09-19', '19:15', 'hoàng 19', 0, 78000, 'biếu tặng', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-96', '2026-09-19', '19:15', 'bánh mì', 0, 15000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-95', '2026-09-19', '18:20', 'Bún chả 2p', 0, 50000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-94', '2026-09-19', '17:35', 'anh với em', 0, 34000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-93', '2026-09-19', '16:50', 'bánh mì anh Hiển', 0, 20000, 'nhà cửa', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-102', '2026-09-19', '11:45', 'đổ xăng', 0, 50000, 'di chuyển', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-101', '2026-09-19', '10:30', 'Thuốc chị Hằng 1 ngày uống 20k và panadol 17k', 0, 37000, 'nhà cửa', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-100', '2026-09-19', '09:00', 'hảo', 0, 20000, 'nhà cửa', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-99', '2026-09-19', '08:15', 'Nước', 0, 37000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-98', '2026-09-19', '07:30', 'Cháo lòng', 0, 78000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-92', '2026-09-18', '15:25', 'Mì xào', 0, 30000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-91', '2026-09-18', '14:40', 'cơm nước', 0, 47000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-90', '2026-09-18', '13:10', 'Bánh', 0, 24000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-89', '2026-09-17', '12:20', 'cơm', 0, 32000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-88', '2026-09-17', '11:45', 'nước', 0, 70000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-87', '2026-09-17', '10:30', 'Bánh ngọt', 0, 27000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-83', '2026-09-16', '20:45', 'kebab', 0, 45000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-82', '2026-09-16', '19:15', 'cơm', 0, 68000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-81', '2026-09-16', '18:20', 'thuốc đền', 0, 666000, 'công việc', 'công việc', 'shared', 'Nhựt', ''),
  ('tx-sep-86', '2026-09-16', '09:00', 'đá banh', 0, 54000, 'giải trí', 'thiết yếu', 'personal_nhut', 'Nhựt', ''),
  ('tx-sep-85', '2026-09-16', '08:15', 'cháo lòng', 0, 40000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-84', '2026-09-16', '07:30', 'cafe', 0, 17000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-80', '2026-09-15', '17:35', 'lương long châu t8', 4743874, 0, 'công việc', 'công việc', 'shared', 'Trang', 'Chốt sổ tháng 9'),
  ('tx-sep-79', '2026-09-15', '16:50', 'dọn nhà, điện nước,...', 0, 4428000, 'nhà cửa', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-78', '2026-09-15', '15:25', 'nhà cửa homate', 0, 1889438, 'nhà cửa', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-77', '2026-09-15', '14:40', 'cọc nhà', 0, 1000000, 'nhà cửa', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-76', '2026-09-15', '13:10', 'ăn snasg', 0, 56000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-75', '2026-09-14', '12:20', 'đặ xe hoàng', 0, 72000, 'biếu tặng', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-74', '2026-09-14', '11:45', 'đặ xe hoàng', 0, 95000, 'biếu tặng', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-73', '2026-09-14', '10:30', 'quà bé na', 0, 377000, 'biếu tặng', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-72', '2026-09-14', '09:00', 'ăn uống', 0, 52000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-71', '2026-09-14', '08:15', 'ăn sáng', 0, 42000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-69', '2026-09-13', '20:45', 'duỗi tóc', 0, 400000, 'làm đẹp', 'thiết yếu', 'personal_trang', 'Trang', ''),
  ('tx-sep-68', '2026-09-13', '19:15', 'bún chả', 0, 40000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-70', '2026-09-13', '07:30', 'nhậu', 0, 0, 'giải trí', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-67', '2026-09-12', '18:20', 'bún đậu', 0, 126000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-66', '2026-09-12', '17:35', 'cơm nước', 0, 67000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-65', '2026-09-12', '16:50', 'thuốc a iu', 0, 303000, 'làm đẹp', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-64', '2026-09-11', '15:25', 'contetn kiến hiệp roll và bác sĩ', 2380000, 0, 'công việc', 'công việc', 'shared', 'Nhựt', 'Chốt sổ tháng 9'),
  ('tx-sep-63', '2026-09-11', '14:40', 'mì cay gà rán nước ngọt lipton', 0, 184000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-62', '2026-09-11', '13:10', 'coca', 0, 18000, 'biếu tặng', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-61', '2026-09-11', '12:20', 'đồ thắp nhang', 0, 60000, 'biếu tặng', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-60', '2026-09-11', '11:45', 'cọc in ảnh', 0, 50000, 'biếu tặng', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-55', '2026-09-10', '20:45', 'ăn trưa', 0, 30000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-54', '2026-09-10', '19:15', 'ăn sáng', 0, 34000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-59', '2026-09-10', '10:30', 'đặt xe hoàng', 0, 75000, 'biếu tặng', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-58', '2026-09-10', '09:00', 'đăng ký khám', 0, 150000, 'làm đẹp', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-57', '2026-09-10', '08:15', 'dừa 18000', 0, 18000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-56', '2026-09-10', '07:30', 'ống dây', 0, 30000, 'nhà cửa', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-53', '2026-09-09', '18:20', 'Cơm trưa 60k gồm trả cho a Hiển', 0, 60000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-52', '2026-09-09', '17:35', 'cơm trưa 30k', 0, 30000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-51', '2026-09-09', '16:50', 'bún riêu 60k', 0, 60000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-50', '2026-09-09', '15:25', 'bacsh hoas xanh 175k', 0, 175000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-49', '2026-09-09', '14:40', 'Còn anh cũng 12.000 luôn', 0, 12000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-48', '2026-09-09', '13:10', 'Linh với Huyền, với Hảo, với chị Trang mỗi người mười hai ngàn', 0, 48000, 'nhà cửa', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-47', '2026-09-09', '12:20', 'trà sữa 3 chị e 93k', 0, 93000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-46', '2026-09-09', '11:45', 'Bánh mì 24k', 0, 24000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-45', '2026-09-09', '10:30', 'Tiên bánh mì 24k', 0, 24000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-41', '2026-09-08', '20:45', 'Nước 48k', 0, 48000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-40', '2026-09-08', '19:15', 'Cơm trưa cơm tối 62k', 0, 62000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-39', '2026-09-08', '18:20', 'Tiền rác 192k hometa', 0, 192000, 'nhà cửa', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-44', '2026-09-08', '09:00', 'Nạp tiền Huy kira ai 28k', 0, 28000, 'công việc', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-43', '2026-09-08', '08:15', 'Salonpas 30', 0, 30000, 'tiêu hao', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-42', '2026-09-08', '07:30', 'Salonpas hảo 29k', 0, 29000, 'nhà cửa', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-38', '2026-09-07', '17:35', 'trà đường', 0, 12000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-37', '2026-09-07', '16:50', 'đồ chặn bàn', 0, 19000, 'nhà cửa', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-36', '2026-09-07', '15:25', 'cơm tối', 0, 60000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-35', '2026-09-07', '14:40', 'numberone', 0, 40000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-34', '2026-09-07', '13:10', 'dừa', 0, 15000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-33', '2026-09-07', '12:20', 'cacao', 0, 23000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-32', '2026-09-07', '11:45', 'cơm', 0, 30000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-27', '2026-09-06', '20:45', 'đá banh t2 2 tuần trước', 0, 60000, 'giải trí', 'thiết yếu', 'personal_nhut', 'Nhựt', ''),
  ('tx-sep-31', '2026-09-06', '10:30', 'dọn đồ không thanh lí được homeate', 0, 500000, 'nhà cửa', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-30', '2026-09-06', '09:00', 'content VTD', 1900000, 0, 'công việc', 'công việc', 'shared', 'Nhựt', 'Chốt sổ tháng 9'),
  ('tx-sep-29', '2026-09-06', '08:15', 'soda', 0, 25000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-28', '2026-09-06', '07:30', 'ăn hủ tiếu trả cho a Hiển', 0, 70000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-26', '2026-09-05', '19:15', 'content sgsb', 1540000, 0, 'công việc', 'công việc', 'shared', 'Nhựt', 'Chốt sổ tháng 9'),
  ('tx-sep-25', '2026-09-05', '18:20', 'lương dps tháng 8', 11652000, 0, 'công việc', 'công việc', 'shared', 'Nhựt', 'Chốt sổ tháng 9'),
  ('tx-sep-24', '2026-09-05', '17:35', 'nước', 0, 28000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-23', '2026-09-05', '16:50', 'cơm tối', 0, 32000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-22', '2026-09-05', '15:25', 'tiêm', 0, 980000, 'làm đẹp', 'thiết yếu', 'personal_trang', 'Trang', ''),
  ('tx-sep-21', '2026-09-05', '14:40', 'cơm (cho ô hiển 1 phần)', 0, 60000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-20', '2026-09-05', '13:10', 'đổ xăng', 0, 50000, 'di chuyển', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-19', '2026-09-04', '12:20', 'dầu gội', 0, 117000, 'tiêu hao', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-18', '2026-09-04', '11:45', 'cơm tối', 0, 30000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-17', '2026-09-04', '10:30', 'Cơm trưa', 0, 30000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-16', '2026-09-04', '09:00', 'chạy ads tháng 9 Bếp ấm nhà An', 1000000, 0, 'công việc', 'công việc', 'shared', 'Nhựt', 'Chốt sổ tháng 9'),
  ('tx-sep-15', '2026-09-04', '08:15', 'chạy ads Cafe Clickclack', 500000, 0, 'công việc', 'công việc', 'shared', 'Nhựt', 'Chốt sổ tháng 9'),
  ('tx-sep-14', '2026-09-04', '07:30', 'chạy ads cho Bé Bi Tu Ti', 400000, 0, 'công việc', 'công việc', 'shared', 'Nhựt', 'Chốt sổ tháng 9'),
  ('tx-sep-13', '2026-09-03', '20:45', 'bún riêu', 0, 70000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-12', '2026-09-03', '19:15', 'katinat nước và bánh', 0, 80000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-11', '2026-09-03', '18:20', 'Nước', 0, 30000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-10', '2026-09-02', '17:35', 'maxidi homeate', 0, 94000, 'nhà cửa', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-9', '2026-09-02', '16:50', 'cơm trưa', 0, 70000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-8', '2026-09-02', '15:25', 'bánh ngọt', 0, 42000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-7', '2026-09-02', '14:40', 'yakult lựu đỏ', 0, 30000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-6', '2026-09-02', '13:10', 'cơm tối', 0, 30000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-5', '2026-09-01', '12:20', 'mì cay', 0, 123000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-4', '2026-09-01', '11:45', 'trà sữa homeate', 0, 96000, 'nhà cửa', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-3', '2026-09-01', '10:30', 'grab', 0, 25000, 'di chuyển', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-sep-2', '2026-09-01', '09:00', 'trà xanh', 0, 12000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-sep-1', '2026-09-01', '08:15', 'cơm trưa', 0, 30000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-137', '2026-08-30', '15:30', 'đổ xằng', 0, 50000, 'di chuyển', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-136', '2026-08-30', '14:45', 'Ăn uống', 0, 93000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-135', '2026-08-30', '14:00', 'đi siu thị chủ nhật', 0, 173000, 'biếu tặng', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-134', '2026-08-30', '13:15', 'chè thái', 0, 107000, 'biếu tặng', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-133', '2026-08-30', '12:30', 'Cơm tối', 0, 35000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-132', '2026-08-30', '11:45', 'tiền công việc gì đó hình nhưu chạy ads', 1500000, 0, 'công việc', 'công việc', 'shared', 'Trang', ''),
  ('tx-aug-131', '2026-08-30', '11:00', 'nạp game', 0, 500000, 'giải trí', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-130', '2026-08-30', '10:15', 'cho Hàng đỗ ĐH', 0, 500000, 'biếu tặng', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-129', '2026-08-30', '09:30', 'bánh lọt', 0, 15000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-128', '2026-08-30', '08:45', 'bánh ngọt', 0, 38000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-127', '2026-08-30', '08:00', 'đổ xằng', 0, 50000, 'di chuyển', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-126', '2026-08-29', '09:30', 'cơm gà', 0, 30000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-125', '2026-08-29', '08:45', 'siu thị mới', 0, 131000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-124', '2026-08-29', '08:00', 'bánh flan', 0, 12000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-123', '2026-08-28', '14:00', 'bánh bao chiên', 0, 20000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-122', '2026-08-28', '13:15', 'nước cam', 0, 20000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-121', '2026-08-28', '12:30', 'betadin', 0, 43000, 'làm đẹp', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-120', '2026-08-28', '11:45', 'trà sữa', 0, 54000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-119', '2026-08-28', '11:00', 'cơm tối', 0, 35000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-118', '2026-08-28', '10:15', 'khăn tắm', 0, 217000, 'nhà cửa', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-117', '2026-08-28', '09:30', 'thuốc bôi', 0, 152000, 'làm đẹp', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-116', '2026-08-28', '08:45', 'bún đậu', 0, 67000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-115', '2026-08-28', '08:00', 'cơm tối', 0, 50000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-114', '2026-08-27', '08:45', 'cơm trưa', 0, 110000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-113', '2026-08-27', '08:00', 'cơm gà', 0, 33000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-112', '2026-08-26', '08:00', 'mì vịt tiềm', 0, 45000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-111', '2026-08-25', '09:30', 'nạp đth', 0, 70000, 'điện tử', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-110', '2026-08-25', '08:45', 'thuốc dị ứng, men tiêu hóa', 0, 85000, 'làm đẹp', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-109', '2026-08-25', '08:00', 'cơm gà', 0, 40000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-108', '2026-08-24', '10:15', 'trà xanh sữa', 0, 31000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-107', '2026-08-24', '09:30', 'cơm ba rọi', 0, 40000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-106', '2026-08-24', '08:45', 'nạp đth', 0, 50000, 'điện tử', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-105', '2026-08-24', '08:00', 'thuốc trị mụn acnacare', 0, 131000, 'làm đẹp', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-104', '2026-08-23', '11:00', 'khoai lamg chiên', 0, 20000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-103', '2026-08-23', '10:15', 'mì vịt tiềm', 0, 45000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-102', '2026-08-23', '09:30', 'cho Hoàng', 0, 300000, 'biếu tặng', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-101', '2026-08-23', '08:45', 'cafe sữa tươi', 0, 20000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-100', '2026-08-23', '08:00', 'coem trưa và bún riel', 0, 60000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-99', '2026-08-22', '08:45', 'trà sữa mời quản lý', 0, 83000, 'biếu tặng', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-98', '2026-08-22', '08:00', 'cơm tối', 0, 33000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-97', '2026-08-21', '11:00', 'nạp game', 0, 110000, 'giải trí', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-96', '2026-08-21', '10:15', 'khoai lang chiên', 0, 20000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-95', '2026-08-21', '09:30', 'gà rán mì ý', 0, 75000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-94', '2026-08-21', '08:45', 'nước soda và matcha', 0, 45000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-93', '2026-08-21', '08:00', 'cơm trưa', 0, 70000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-92', '2026-08-20', '10:15', 'bánh mì', 0, 41000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-91', '2026-08-20', '09:30', 'chè', 0, 40000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-90', '2026-08-20', '08:45', 'cơm gà', 0, 30000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-89', '2026-08-20', '08:00', 'bách hóa xanh', 0, 143000, 'tiêu hao', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-88', '2026-08-19', '12:30', 'gà rán', 0, 80000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-87', '2026-08-19', '11:45', 'bún thịt nướng', 0, 30000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-86', '2026-08-19', '11:00', 'phở và sữa bắp', 0, 67000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-85', '2026-08-19', '10:15', 'đá banh', 0, 52000, 'giải trí', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-84', '2026-08-19', '09:30', 'phần thưởng đh sv giỏi', 500000, 0, 'học phí', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-83', '2026-08-19', '08:45', 'thuốc bổ trứng', 0, 320000, 'làm đẹp', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-82', '2026-08-19', '08:00', 'bún bò', 0, 38000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-81', '2026-08-18', '09:30', 'chấm mụn', 0, 53000, 'làm đẹp', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-80', '2026-08-18', '08:45', 'trà lựu thạch dừa', 0, 34000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-79', '2026-08-18', '08:00', 'cơm gà', 0, 33000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-78', '2026-08-17', '11:00', 'chị ngân cho', 500000, 0, 'biếu tặng', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-77', '2026-08-17', '10:15', 'rau má đậu xanh', 0, 15000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-76', '2026-08-17', '09:30', 'bánh', 0, 45000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-75', '2026-08-17', '08:45', 'cơm tối', 0, 78000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-74', '2026-08-17', '08:00', 'nước toner tràm trà', 0, 70000, 'làm đẹp', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-73', '2026-08-16', '08:00', 'lẩu snack coca', 0, 260000, 'biếu tặng', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-72', '2026-08-15', '11:00', 'cơm gà', 0, 33000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-71', '2026-08-15', '10:15', 'bịch cam sành', 0, 59000, 'tiêu hao', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-70', '2026-08-15', '09:30', 'thuốc bôi trị rôm sảy', 0, 140000, 'làm đẹp', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-69', '2026-08-15', '08:45', 'trà ổi hồng', 0, 26000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-68', '2026-08-15', '08:00', 'tiền cài email tên miền', 186000, 0, 'công việc', 'công việc', 'shared', 'Trang', ''),
  ('tx-aug-67', '2026-08-14', '11:00', 'nạp đth', 0, 60000, 'điện tử', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-66', '2026-08-14', '10:15', 'đổ xăng', 0, 50000, 'di chuyển', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-65', '2026-08-14', '09:30', 'cơm tối', 0, 359000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-64', '2026-08-14', '08:45', 'cơm trưa', 0, 33000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-63', '2026-08-14', '08:00', 'lương vk', 2400000, 0, 'công việc', 'công việc', 'shared', 'Trang', ''),
  ('tx-aug-62', '2026-08-13', '10:15', 'đá banh', 0, 59000, 'giải trí', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-61', '2026-08-13', '09:30', 'soda', 0, 25000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-60', '2026-08-13', '08:45', 'nước hometae', 0, 100000, 'nhà cửa', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-59', '2026-08-13', '08:00', 'chè thái', 0, 25000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-58', '2026-08-12', '14:00', 'tiền nhà 155', 0, 4204503, 'nhà cửa', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-57', '2026-08-12', '13:15', 'trà trưa chị lan', 0, 35000, 'nhà cửa', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-56', '2026-08-12', '12:30', 'cơm chiều', 0, 50000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-55', '2026-08-12', '11:45', 'bánh mì a hiển chị lan chị hằng', 0, 15000, 'nhà cửa', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-54', '2026-08-12', '11:00', 'đá banh', 0, 58000, 'giải trí', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-53', '2026-08-12', '10:15', 'gỏi cuốn', 0, 40000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-52', '2026-08-12', '09:30', 'đặt shopee miwwnsg dán bảo vệ bàn phím laptop và bàn chải vệ sinh và đồ tra dầu', 0, 275000, 'nhà cửa', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-51', '2026-08-12', '08:45', 'bánh mì', 0, 15000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-50', '2026-08-12', '08:00', 'nước cam', 0, 15000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-49', '2026-08-11', '08:45', 'sữa tươi cafe', 0, 17000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-48', '2026-08-11', '08:00', 'siu thị mua nước, bánh', 0, 136000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-47', '2026-08-10', '12:30', 'băng vệ sinh', 0, 60000, 'tiêu hao', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-46', '2026-08-10', '11:45', 'bánh ngọt', 0, 72000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-45', '2026-08-10', '11:00', 'bún đậu', 0, 146000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-44', '2026-08-10', '10:15', 'web hóa chất việt trung', 6000000, 0, 'công việc', 'công việc', 'shared', 'Trang', ''),
  ('tx-aug-43', '2026-08-10', '09:30', 'hồng trà ngô gia', 0, 42000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-42', '2026-08-10', '08:45', 'bánh mì', 0, 41000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-41', '2026-08-10', '08:00', 'thuốc', 0, 130000, 'làm đẹp', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-40', '2026-08-09', '09:30', 'bình nước', 0, 61000, 'nhà cửa', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-39', '2026-08-09', '08:45', 'coca', 0, 16000, 'biếu tặng', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-38', '2026-08-09', '08:00', 'lẩu', 0, 150000, 'biếu tặng', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-37', '2026-08-07', '12:30', 'chè thái sâm bổ lượng', 0, 53000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-36', '2026-08-07', '11:45', 'công chứng', 0, 50000, 'biếu tặng', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-35', '2026-08-07', '11:00', 'trứng', 0, 36000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-34', '2026-08-07', '10:15', 'bnash mì', 0, 6000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-33', '2026-08-07', '09:30', 'hồng trà', 0, 32000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-32', '2026-08-07', '08:45', 'mua kem', 0, 7000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-31', '2026-08-07', '08:00', 'cơm tối', 0, 100000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-30', '2026-08-06', '11:45', 'đá banh', 0, 45000, 'giải trí', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-29', '2026-08-06', '11:00', 'trà tắc', 0, 10000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-28', '2026-08-06', '10:15', 'cháo', 0, 25000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-27', '2026-08-06', '09:30', 'thuốc', 0, 340000, 'làm đẹp', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-26', '2026-08-06', '08:45', 'nước cam', 0, 15000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-25', '2026-08-06', '08:00', 'cơm trưa', 0, 70000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-24', '2026-08-05', '11:00', 'bánh ngọt', 0, 71000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-23', '2026-08-05', '10:15', 'trà đường', 0, 10000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-22', '2026-08-05', '09:30', 'ăn tối bò né', 0, 120000, 'ăn uống', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-21', '2026-08-05', '08:45', 'thuốc vk', 0, 172000, 'làm đẹp', 'thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-20', '2026-08-05', '08:00', 'lương ck', 11750000, 0, 'công việc', 'công việc', 'shared', 'Nhựt', ''),
  ('tx-aug-19', '2026-08-04', '11:00', 'trà tắc', 0, 10000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-18', '2026-08-04', '10:15', 'sửa web bác sĩ', 2000000, 0, 'công việc', 'công việc', 'shared', 'Trang', ''),
  ('tx-aug-17', '2026-08-04', '09:30', 'Xong website 100% Phạm Gia Media', 1500000, 0, 'công việc', 'công việc', 'shared', 'Nhựt', ''),
  ('tx-aug-16', '2026-08-04', '08:45', '13 bài sgcb', 910000, 0, 'công việc', 'công việc', 'shared', 'Trang', ''),
  ('tx-aug-15', '2026-08-04', '08:00', 'rau má đậu xanh', 0, 15000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-14', '2026-08-03', '13:15', 'trà đường', 0, 10000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-13', '2026-08-03', '12:30', 'xôi tam giác xanh', 0, 15000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-12', '2026-08-03', '11:45', 'trà trái cây', 0, 125000, 'nhà cửa', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-11', '2026-08-03', '11:00', 'tàu hũ', 0, 20000, 'nhà cửa', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-10', '2026-08-03', '10:15', 'đá banh', 0, 46000, 'giải trí', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-9', '2026-08-03', '09:30', 'bún riêu', 0, 33000, 'ăn uống', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-8', '2026-08-03', '08:45', 'nước cam', 0, 15000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-7', '2026-08-03', '08:00', 'kem', 0, 10000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-6', '2026-08-02', '09:30', 'trà sữa sữa chua', 0, 30000, 'ăn uống', 'không thiết yếu', 'shared', 'Trang', ''),
  ('tx-aug-5', '2026-08-02', '08:45', 'gửi xe', 0, 3000, 'di chuyển', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-4', '2026-08-02', '08:00', 'mua snack nước ngọt', 0, 48000, 'biếu tặng', 'thiết yếu', 'shared', 'Nhựt', ''),
  ('tx-aug-3', '2026-08-01', '09:30', 'tiền ads bé tu ti', 400000, 0, 'công việc', 'công việc', 'shared', 'Nhựt', ''),
  ('tx-aug-2', '2026-08-01', '08:45', 'tiền ads lego cafe', 400000, 0, 'công việc', 'công việc', 'shared', 'Trang', ''),
  ('tx-aug-1', '2026-08-01', '08:00', 'bánh ngọt', 0, 27000, 'ăn uống', 'không thiết yếu', 'shared', 'Nhựt', '')
on conflict (id) do nothing;
