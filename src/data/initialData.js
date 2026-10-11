export const initialProfile = {
  activeUser: 'nhut',
  privacyMode: false,
  activeVault: 'shared',
};

// Dữ liệu thành viên ban đầu: TUYỆT ĐỐI KHÔNG LƯU MÃ PIN DẠNG RÕ
export const initialMembers = [
  {
    id: 'm-1',
    username: 'nhut',
    name: 'Nhựt',
    role: 'Chủ gia đình',
    pin_hash: '96041a76c8cba0b8cc106368d37fc1c5cf14e7a83e05a8b79b6d859eb54ff95b', // SHA-256 bảo mật
    vault: 'personal_nhut',
    color: 'emerald'
  },
  {
    id: 'm-2',
    username: 'trang',
    name: 'Trang',
    role: 'Đồng quản lý',
    pin_hash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', // SHA-256 bảo mật
    vault: 'personal_trang',
    color: 'pink'
  }
];

export const initialMonthlyConfig = {
  id: '2026-10',
  banner_focus: 'Tối ưu chi tiêu & tiết kiệm gia đình',
  han_muc_chi: 30000000,
  daysRemaining: 27,
};

export const categoriesList = [
  'di chuyển',
  'ăn uống',
  'tiêu hao',
  'quần áo',
  'điện tử',
  'giải trí',
  'làm đẹp',
  'công việc',
  'mượn tiền',
  'nhà cửa',
  'học phí',
  'biếu tặng'
];

export const macroTypesList = [
  'thiết yếu',
  'không thiết yếu',
  'công việc'
];

export const quickPresets = [
  { id: 'p1', label: 'Cà phê sáng', amount: 35000, phan_loai: 'ăn uống', loai: 'thiết yếu', icon: 'Coffee', defaultVault: 'personal_nhut' },
  { id: 'p2', label: 'Cơm trưa', amount: 43000, phan_loai: 'ăn uống', loai: 'thiết yếu', icon: 'ForkKnife', defaultVault: 'personal_nhut' },
  { id: 'p3', label: 'Bách hóa xanh', amount: 190000, phan_loai: 'tiêu hao', loai: 'thiết yếu', icon: 'ShoppingCart', defaultVault: 'shared' },
  { id: 'p4', label: 'Đổ xăng', amount: 80000, phan_loai: 'đi lại', loai: 'thiết yếu', icon: 'GasPump', defaultVault: 'shared' },
  { id: 'p5', label: 'Trà sữa', amount: 55000, phan_loai: 'ăn uống', loai: 'hưởng thụ', icon: 'Cup', defaultVault: 'personal_trang' },
  { id: 'p6', label: 'Thu tiền web', amount: 1500000, phan_loai: 'công việc', loai: 'công việc', icon: 'Laptop', defaultVault: 'shared', isIncome: true },
];

export const sampleSmsTemplates = [
  {
    name: 'Techcombank (-185,000 VND WinMart)',
    text: 'TK 1903****4567 tai TCB GD -185,000VND luc 04/10/2026 18:22. ND: WINMART CONG HOA thanh toan tien cho sieu thi. SD: 14,250,000VND'
  },
  {
    name: 'Vietcombank (+2,000,000 VND Chuyển khoản)',
    text: 'VCB: +2,000,000 VND luc 01-10-2026 14:15. So du: 32,400,000 VND. Ref: chuyen khoan thanh toan dich vu'
  },
  {
    name: 'MoMo (-162,000 VND Mua sắm)',
    text: 'MoMo: Giao dich thanh cong 162.000d cho Cua hang. Ma GD: 92837194. So du vi: 1.850.000d'
  }
];

export const initialGoals = [];

export function getRandomTime() {
  const hours = ['07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'];
  const minutes = ['05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
  const h = hours[Math.floor(Math.random() * hours.length)];
  const m = minutes[Math.floor(Math.random() * minutes.length)];
  return `${h}:${m}`;
}

export function getCurrentTime() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

// Định dạng ngày hiển thị theo chuẩn Việt Nam: DD/MM/YYYY
export function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const clean = String(dateStr).split('T')[0].trim();
  if (clean.includes('-')) {
    const parts = clean.split('-');
    if (parts.length >= 3) {
      const [year, month, day] = parts;
      return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    }
  } else if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length >= 3) {
      if (parts[0].length === 4) {
        return `${String(parts[2]).padStart(2, '0')}/${String(parts[1]).padStart(2, '0')}/${parts[0]}`;
      }
      return `${String(parts[0]).padStart(2, '0')}/${String(parts[1]).padStart(2, '0')}/${parts[2]}`;
    }
  }
  return dateStr;
}

// Chuẩn hóa ngày về định dạng YYYY-MM-DD
export function normalizeDateISO(dateStr) {
  if (!dateStr) return '';
  const clean = String(dateStr).split('T')[0].trim();
  if (clean.includes('-')) {
    const parts = clean.split('-');
    if (parts.length >= 3) {
      const year = parts[0];
      const month = String(Number(parts[1])).padStart(2, '0');
      const day = String(Number(parts[2])).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } else if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length >= 3) {
      if (parts[0].length === 4) {
        return `${parts[0]}-${String(Number(parts[1])).padStart(2, '0')}-${String(Number(parts[2])).padStart(2, '0')}`;
      }
      const fullYear = parts[2].length === 2 ? '20' + parts[2] : parts[2];
      return `${fullYear}-${String(Number(parts[1])).padStart(2, '0')}-${String(Number(parts[0])).padStart(2, '0')}`;
    }
  }
  return clean;
}

// Sắp xếp các khoản thu chi từ MỚI TỚI CŨ
export function sortTransactionsByDateDesc(txList = []) {
  if (!Array.isArray(txList)) return [];
  return [...txList].sort((a, b) => {
    const isoA = normalizeDateISO(a?.ngay);
    const isoB = normalizeDateISO(b?.ngay);

    const dateCmp = (isoB || '').localeCompare(isoA || '');
    if (dateCmp !== 0) return dateCmp;

    if (a?.gio && b?.gio && a.gio !== b.gio) {
      return b.gio.localeCompare(a.gio);
    }

    const idA = typeof a?.id === 'number' ? a.id : parseInt(String(a?.id || '').replace(/\D/g, ''), 10) || 0;
    const idB = typeof b?.id === 'number' ? b.id : parseInt(String(b?.id || '').replace(/\D/g, ''), 10) || 0;
    if (idB !== idA) return idB - idA;

    return 0;
  });
}

// BẢO MẬT DỮ LIỆU: Toàn bộ dữ liệu thực tế được lưu an toàn trên Supabase Database riêng của bạn.
// Không lưu cứng dữ liệu tài chính thực vào mã nguồn.
export const initialAugustConfig = {
  id: "2026-08",
  banner_focus: "Tháng 8/2026",
  han_muc_chi: 20000000,
  ghi_chu: "Đã chốt sổ Tháng 8/2026"
};

export const augustTransactions = [];

export const initialSeptemberConfig = {
  id: "2026-09",
  banner_focus: "Tháng 9/2026",
  han_muc_chi: 25000000,
  ghi_chu: "Đã chốt sổ Tháng 9/2026"
};

export const septemberTransactions = [];

export const initialTransactions = [];
