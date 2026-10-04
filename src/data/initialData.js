export const initialProfile = {
  activeUser: 'nhut', // 'nhut' | 'trang'
  privacyMode: false,
  activeVault: 'shared', // 'shared' | 'personal'
};

export const initialMonthlyConfig = {
  id: '2026-10',
  banner_focus: 'giảm mua đồ',
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
    name: 'Vietcombank (+2,000,000 VND Phí sửa web)',
    text: 'VCB: +2,000,000 VND luc 01-10-2026 14:15. So du: 32,400,000 VND. Ref: phi sua web maylocnuocnhaty.com chuyen khoan'
  },
  {
    name: 'MoMo (-162,000 VND Trà sữa)',
    text: 'MoMo: Giao dich thanh cong 162.000d cho Tra sua homemate. Ma GD: 92837194. So du vi: 1.850.000d'
  }
];

export const initialGoals = [
  {
    id: 'g1',
    title: 'Kỳ nghỉ gia đình hè 2026',
    target: 45000000,
    current: 34500000,
    icon: 'AirplaneTilt',
    color: 'emerald',
  },
  {
    id: 'g2',
    title: 'Quỹ dự phòng y tế & khẩn cấp',
    target: 60000000,
    current: 60000000,
    icon: 'ShieldCheck',
    color: 'blue',
  },
  {
    id: 'g3',
    title: 'Đổi xe máy mới cho Trang',
    target: 35000000,
    current: 22000000,
    icon: 'Bicycle',
    color: 'amber',
  }
];

// DỮ LIỆU CHÍNH XÁC 100% TỪ BẢNG EXCEL CỦA USER
export const initialTransactions = [
  {
    id: 'tx-1',
    ngay: '2026-10-01',
    noi_dung: 'phí sửa web https://maylocnuocnhaty.com/',
    thu: 2000000,
    chi: 0,
    phan_loai: 'công việc',
    loai: 'công việc',
    vault: 'shared',
    author: 'Nhựt',
    ghi_chu: 'Khách thanh toán chuyển khoản'
  },
  {
    id: 'tx-2',
    ngay: '2026-10-01',
    noi_dung: 'chạy ads Clickclack Cafe',
    thu: 300000,
    chi: 0,
    phan_loai: 'công việc',
    loai: 'công việc',
    vault: 'shared',
    author: 'Nhựt',
    ghi_chu: 'Phí dịch vụ tuần 1'
  },
  {
    id: 'tx-3',
    ngay: '2026-10-01',
    noi_dung: 'Ăn sáng sữa đậu nành',
    thu: 0,
    chi: 70000,
    phan_loai: 'ăn uống',
    loai: 'thiết yếu',
    vault: 'shared',
    author: 'Trang',
    ghi_chu: 'Ăn sáng 2 vợ chồng'
  },
  {
    id: 'tx-4',
    ngay: '2026-10-01',
    noi_dung: 'Cơm trưa',
    thu: 0,
    chi: 43000,
    phan_loai: 'ăn uống',
    loai: 'thiết yếu',
    vault: 'personal_nhut',
    author: 'Nhựt',
    ghi_chu: 'Cơm trưa văn phòng'
  },
  {
    id: 'tx-5',
    ngay: '2026-10-01',
    noi_dung: 'lưu hositng cho web thanhdatvina.com',
    thu: 1000000,
    chi: 0,
    phan_loai: 'công việc',
    loai: 'công việc',
    vault: 'shared',
    author: 'Nhựt',
    ghi_chu: 'Gia hạn 1 năm'
  },
  {
    id: 'tx-6',
    ngay: '2026-10-01',
    noi_dung: 'Bách hóa xanh nước giặt, pin',
    thu: 0,
    chi: 190000,
    phan_loai: 'tiêu hao',
    loai: 'thiết yếu',
    vault: 'shared',
    author: 'Trang',
    ghi_chu: 'Đồ dùng sinh hoạt trong nhà'
  },
  {
    id: 'tx-7',
    ngay: '2026-10-01',
    noi_dung: 'Cơm sườn 1.10 24k',
    thu: 0,
    chi: 24000,
    phan_loai: 'ăn uống',
    loai: 'thiết yếu',
    vault: 'personal_nhut',
    author: 'Nhựt',
    ghi_chu: 'Cơm sườn chiều'
  },
  {
    id: 'tx-8',
    ngay: '2026-10-02',
    noi_dung: 'Chi chuyển lại',
    thu: 28000,
    chi: 0,
    phan_loai: 'ăn uống',
    loai: 'thiết yếu',
    vault: 'shared',
    author: 'Trang',
    ghi_chu: 'Tiền thừa bạn trả lại'
  },
  {
    id: 'tx-9',
    ngay: '2026-10-02',
    noi_dung: 'Mừng cưới Huyền Tám 1tr',
    thu: 0,
    chi: 1000000,
    phan_loai: 'biếu tặng',
    loai: 'thiết yếu',
    vault: 'shared',
    author: 'Nhựt',
    ghi_chu: 'Tiền mừng cưới bạn đại học'
  },
  {
    id: 'tx-10',
    ngay: '2026-10-02',
    noi_dung: 'Trà sữa homemate',
    thu: 0,
    chi: 162000,
    phan_loai: 'nhà cửa',
    loai: 'thiết yếu',
    vault: 'shared',
    author: 'Trang',
    ghi_chu: 'Mua nguyên liệu tự làm trà sữa'
  },
  {
    id: 'tx-11',
    ngay: '2026-10-03',
    noi_dung: 'cơm nước',
    thu: 0,
    chi: 25000,
    phan_loai: 'ăn uống',
    loai: 'thiết yếu',
    vault: 'shared',
    author: 'Nhựt',
    ghi_chu: ''
  },
  {
    id: 'tx-12',
    ngay: '2026-10-03',
    noi_dung: 'bánh',
    thu: 0,
    chi: 40000,
    phan_loai: 'ăn uống',
    loai: 'thiết yếu',
    vault: 'shared',
    author: 'Trang',
    ghi_chu: ''
  }
];
