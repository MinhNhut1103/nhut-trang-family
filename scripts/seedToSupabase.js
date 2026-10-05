import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as initialData from '../src/data/initialData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ Không tìm thấy file .env!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong .env');
  process.exit(1);
}

console.log('🔄 Đang kết nối tới Supabase:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  // 1. Kiểm tra xem bảng transactions đã tồn tại chưa
  const { error: testErr } = await supabase.from('transactions').select('id').limit(1);

  if (testErr && (testErr.code === 'PGRST205' || testErr.message?.includes('schema cache'))) {
    console.log('\n⚠️  BẢNG CHƯA TỒN TẠI TRÊN SUPABASE DATABASE!');
    console.log('---------------------------------------------------------');
    console.log('Do Supabase bảo mật kiến trúc Postgres, các bảng cần được khởi tạo 1 lần');
    console.log('bằng cách copy nội dung file: supabase/schema.sql');
    console.log('vào mục SQL Editor trên Dashboard Supabase rồi nhấn RUN.');
    console.log('---------------------------------------------------------\n');
    return;
  }

  console.log('✅ Bảng đã sẵn sàng! Bắt đầu đồng bộ toàn bộ dữ liệu...\n');

  // 2. Đồng bộ Family Members
  console.log('1️⃣ Đang lưu thành viên gia đình (family_members)...');
  const members = [
    {
      id: 'm-1',
      username: 'nhut',
      name: 'Nhựt',
      pin_hash: '1103',
      role: 'Chủ gia đình',
      vault: 'personal_nhut',
      color: 'emerald'
    },
    {
      id: 'm-2',
      username: 'trang',
      name: 'Trang',
      pin_hash: '1234',
      role: 'Đồng quản lý',
      vault: 'personal_trang',
      color: 'pink'
    }
  ];
  const { error: memErr } = await supabase.from('family_members').upsert(members);
  if (memErr) console.error('Lỗi members:', memErr.message);
  else console.log('   ✓ Đã lưu thành công 2 thành viên: Nhựt, Trang');

  // 3. Đồng bộ Monthly Configs
  console.log('2️⃣ Đang lưu cấu hình các tháng (monthly_config)...');
  const configs = [
    {
      id: '2026-10',
      banner_focus: initialData.initialMonthlyConfig.banner_focus || 'Tối ưu chi tiêu & tiết kiệm',
      han_muc_chi: initialData.initialMonthlyConfig.han_muc_chi || 30000000,
      ghi_chu: 'Tháng 10/2026: Ưu tiên tiết kiệm chuẩn bị cho các kế hoạch cuối năm, rà soát hóa đơn điện nước định kỳ.'
    },
    {
      id: '2026-09',
      banner_focus: initialData.initialSeptemberConfig.banner_focus || '',
      han_muc_chi: initialData.initialSeptemberConfig.han_muc_chi || 25000000,
      ghi_chu: initialData.initialSeptemberConfig.ghi_chu || ''
    },
    {
      id: '2026-08',
      banner_focus: initialData.initialAugustConfig.banner_focus || '',
      han_muc_chi: initialData.initialAugustConfig.han_muc_chi || 20000000,
      ghi_chu: initialData.initialAugustConfig.ghi_chu || ''
    }
  ];
  const { error: confErr } = await supabase.from('monthly_config').upsert(configs);
  if (confErr) console.error('Lỗi configs:', confErr.message);
  else console.log('   ✓ Đã lưu cấu hình 3 tháng: 2026-08, 2026-09, 2026-10');

  // 4. Đồng bộ Savings Goals
  console.log('3️⃣ Đang lưu mục tiêu tiết kiệm (savings_goals)...');
  const goals = initialData.initialGoals.map(g => ({
    id: g.id,
    title: g.title,
    target: g.target,
    current: g.current,
    icon: g.icon,
    color: g.color
  }));
  const { error: goalErr } = await supabase.from('savings_goals').upsert(goals);
  if (goalErr) console.error('Lỗi goals:', goalErr.message);
  else console.log('   ✓ Đã lưu', goals.length, 'mục tiêu tiết kiệm');

  // 5. Đồng bộ toàn bộ 319 transactions
  console.log('4️⃣ Đang lưu toàn bộ giao dịch thu chi (transactions)...');
  const allTx = initialData.initialTransactions.map(t => ({
    id: t.id,
    ngay: t.ngay,
    gio: t.gio || '08:00',
    noi_dung: t.noi_dung,
    thu: Number(t.thu) || 0,
    chi: Number(t.chi) || 0,
    phan_loai: t.phan_loai || 'ăn uống',
    loai: t.loai || 'thiết yếu',
    vault: t.vault || 'shared',
    author: t.author || 'Nhựt',
    ghi_chu: t.ghi_chu || ''
  }));

  // Gửi theo từng batch 50 items
  const batchSize = 50;
  let totalSaved = 0;
  for (let i = 0; i < allTx.length; i += batchSize) {
    const batch = allTx.slice(i, i + batchSize);
    const { error: txErr } = await supabase.from('transactions').upsert(batch);
    if (txErr) {
      console.error(`   Lỗi batch ${i + 1} - ${i + batch.length}:`, txErr.message);
    } else {
      totalSaved += batch.length;
      console.log(`   ✓ Đã nạp ${totalSaved}/${allTx.length} giao dịch`);
    }
  }

  console.log('\n🎉 HOÀN TẤT! Toàn bộ dữ liệu gia đình Nhựt & Trang đã được lưu thành công trên Supabase Database!');
}

seed();
