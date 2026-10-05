import React, { useState } from 'react';
import { 
  Trash, 
  DownloadSimple, 
  Table, 
  ListBullets, 
  MagnifyingGlass, 
  SlidersHorizontal, 
  PencilSimple, 
  Clock, 
  Plus, 
  ArrowDown, 
  ArrowUp, 
  Calendar, 
  Funnel, 
  ArrowCounterClockwise, 
  X,
  ForkKnife,
  Car,
  Briefcase,
  House,
  ShoppingCart,
  TShirt,
  DeviceMobile,
  GameController,
  Sparkle,
  HandCoins,
  GraduationCap,
  Gift,
  ArrowUpRight,
  ArrowDownRight,
  TrendUp
} from '@phosphor-icons/react';
import { categoriesList, macroTypesList, formatDateDisplay, sortTransactionsByDateDesc, normalizeDateISO } from '../data/initialData';
import TransactionModal from './TransactionModal';

// Hàm lấy icon và màu sắc nhận diện trực quan theo phân loại
const getCategoryIcon = (category, isThu) => {
  if (isThu) {
    return {
      icon: <TrendUp size={18} weight="bold" />,
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
  }

  const cat = (category || '').toLowerCase().trim();
  if (cat.includes('ăn uống')) {
    return {
      icon: <ForkKnife size={18} weight="bold" />,
      bg: 'bg-amber-50 text-amber-600 border-amber-200'
    };
  }
  if (cat.includes('di chuyển') || cat.includes('đi lại')) {
    return {
      icon: <Car size={18} weight="bold" />,
      bg: 'bg-blue-50 text-blue-600 border-blue-200'
    };
  }
  if (cat.includes('công việc')) {
    return {
      icon: <Briefcase size={18} weight="bold" />,
      bg: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    };
  }
  if (cat.includes('nhà cửa')) {
    return {
      icon: <House size={18} weight="bold" />,
      bg: 'bg-teal-50 text-teal-600 border-teal-200'
    };
  }
  if (cat.includes('tiêu hao')) {
    return {
      icon: <ShoppingCart size={18} weight="bold" />,
      bg: 'bg-purple-50 text-purple-600 border-purple-200'
    };
  }
  if (cat.includes('quần áo')) {
    return {
      icon: <TShirt size={18} weight="bold" />,
      bg: 'bg-pink-50 text-pink-600 border-pink-200'
    };
  }
  if (cat.includes('điện tử')) {
    return {
      icon: <DeviceMobile size={18} weight="bold" />,
      bg: 'bg-cyan-50 text-cyan-600 border-cyan-200'
    };
  }
  if (cat.includes('giải trí')) {
    return {
      icon: <GameController size={18} weight="bold" />,
      bg: 'bg-rose-50 text-rose-600 border-rose-200'
    };
  }
  if (cat.includes('làm đẹp')) {
    return {
      icon: <Sparkle size={18} weight="bold" />,
      bg: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200'
    };
  }
  if (cat.includes('mượn tiền')) {
    return {
      icon: <HandCoins size={18} weight="bold" />,
      bg: 'bg-yellow-50 text-yellow-700 border-yellow-200'
    };
  }
  if (cat.includes('học phí')) {
    return {
      icon: <GraduationCap size={18} weight="bold" />,
      bg: 'bg-sky-50 text-sky-600 border-sky-200'
    };
  }
  if (cat.includes('biếu tặng')) {
    return {
      icon: <Gift size={18} weight="bold" />,
      bg: 'bg-orange-50 text-orange-600 border-orange-200'
    };
  }

  return {
    icon: <ArrowDownRight size={18} weight="bold" />,
    bg: 'bg-rose-50 text-rose-600 border-rose-200'
  };
};

export default function TransactionList({ 
  transactions = [], 
  currentMonth = '2026-10',
  availableMonths = [],
  onAddTransaction,
  onDeleteTransaction, 
  onUpdateTransaction,
  categories = categoriesList,
  macroTypes = macroTypesList,
  members = [],
  onOpenCategoryManager,
  privacyMode, 
  activeVault = 'all',
  activeUser,
  onOpenAdd: externalOpenAdd,
  onOpenEdit: externalOpenEdit
}) {
  const [filterMonth, setFilterMonth] = useState('current');
  const [filterDate, setFilterDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // Trên điện thoại, ưu tiên dạng thẻ (cards) cực kỳ tiện thao tác cảm ứng
  const [mobileView, setMobileView] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'cards';
    }
    return 'table';
  });

  // Modal Thêm / Sửa thu chi
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  const formatMoney = (val) => {
    if (!val || val === 0) return '0đ';
    if (privacyMode) return '•••••• đ';
    return new Intl.NumberFormat('vi-VN').format(val) + 'đ';
  };

  // Mở modal thêm mới
  const handleOpenAdd = () => {
    if (externalOpenAdd) {
      externalOpenAdd();
    } else {
      setEditingTx(null);
      setIsModalOpen(true);
    }
  };

  // Mở modal sửa
  const handleOpenEdit = (tx) => {
    if (externalOpenEdit) {
      externalOpenEdit(tx);
    } else {
      setEditingTx(tx);
      setIsModalOpen(true);
    }
  };

  // Lưu từ modal (thêm hoặc sửa)
  const handleSaveModal = (txData) => {
    if (editingTx) {
      onUpdateTransaction(editingTx.id, txData);
    } else if (onAddTransaction) {
      onAddTransaction(txData);
    }
  };

  // Xóa có xác nhận an toàn
  const handleDeleteWithConfirm = (tx) => {
    const amountStr = (tx.thu || 0) > 0 
      ? `+${new Intl.NumberFormat('vi-VN').format(tx.thu)} đ`
      : `-${new Intl.NumberFormat('vi-VN').format(tx.chi)} đ`;

    if (window.confirm(`Bạn có chắc chắn muốn xóa "${tx.noi_dung}" (${amountStr}) khỏi sổ không?`)) {
      onDeleteTransaction(tx.id);
    }
  };

  // Chuẩn hóa định dạng ngày (hỗ trợ cả YYYY-MM-DD, ISO string và DD/MM/YYYY)
  const normalizeDate = (dStr) => {
    if (!dStr) return null;
    const clean = dStr.split('T')[0].trim();
    if (clean.includes('-')) {
      const parts = clean.split('-');
      if (parts.length >= 3) {
        return {
          year: parts[0],
          month: String(Number(parts[1])).padStart(2, '0'),
          day: String(Number(parts[2])).padStart(2, '0'),
          iso: `${parts[0]}-${String(Number(parts[1])).padStart(2, '0')}-${String(Number(parts[2])).padStart(2, '0')}`
        };
      }
    } else if (clean.includes('/')) {
      const parts = clean.split('/');
      if (parts.length >= 3) {
        const fullYear = parts[2].length === 2 ? '20' + parts[2] : parts[2];
        return {
          year: fullYear,
          month: String(Number(parts[1])).padStart(2, '0'),
          day: String(Number(parts[0])).padStart(2, '0'),
          iso: `${fullYear}-${String(Number(parts[1])).padStart(2, '0')}-${String(Number(parts[0])).padStart(2, '0')}`
        };
      }
    }
    return null;
  };

  // So khớp ngày thông minh (khớp Ngày và Tháng, bỏ qua lệch năm của lịch thiết bị)
  const isMatchingDate = (txDateStr, selectedFilterDate) => {
    if (!selectedFilterDate) return true;
    const txNorm = normalizeDate(txDateStr);
    const filterNorm = normalizeDate(selectedFilterDate);
    if (!txNorm || !filterNorm) {
      return (txDateStr || '').includes(selectedFilterDate);
    }
    return txNorm.day === filterNorm.day && txNorm.month === filterNorm.month;
  };

  // Danh sách các ngày có dữ liệu phát sinh trong tháng đang chọn (Sắp xếp từ MỚI TỚI CŨ)
  const availableDaysInScope = React.useMemo(() => {
    const dayMap = {};
    transactions.forEach((t) => {
      const norm = normalizeDate(t.ngay);
      if (!norm) return;

      // Giới hạn theo tháng đang chọn
      if (filterMonth === 'current') {
        if (currentMonth && !norm.iso.startsWith(currentMonth)) return;
      } else if (filterMonth !== 'all') {
        if (!norm.iso.startsWith(filterMonth)) return;
      }

      if (!dayMap[norm.iso]) {
        dayMap[norm.iso] = {
          iso: norm.iso,
          label: `${norm.day}/${norm.month}/${norm.year}`,
          count: 0
        };
      }
      dayMap[norm.iso].count += 1;
    });

    // Sắp xếp ngày từ mới nhất tới cũ nhất (Giảm dần)
    return Object.values(dayMap).sort((a, b) => b.iso.localeCompare(a.iso));
  }, [transactions, filterMonth, currentMonth]);

  // Lọc dữ liệu theo ngày, tháng, phân loại, loại, từ khóa và LUÔN SẮP XẾP TỪ MỚI TỚI CŨ
  const filteredList = React.useMemo(() => {
    const list = transactions.filter((tx) => {
      // 1. Lọc theo ngày cụ thể (nếu người dùng chọn ngày)
      if (filterDate) {
        if (!isMatchingDate(tx.ngay, filterDate)) return false;
      } else {
        // Nếu không chọn ngày cụ thể thì lọc theo tháng
        const norm = normalizeDate(tx.ngay);
        if (filterMonth === 'current') {
          if (currentMonth && norm && !norm.iso.startsWith(currentMonth)) return false;
        } else if (filterMonth !== 'all') {
          if (norm && !norm.iso.startsWith(filterMonth)) return false;
        }
      }

      // 2. Lọc theo phân loại
      if (filterCategory !== 'all' && tx.phan_loai !== filterCategory) return false;

      // 3. Lọc theo loại
      if (filterType !== 'all' && tx.loai !== filterType) return false;

      // 4. Tìm kiếm nội dung, người ghi, ghi chú, số tiền
      if (searchKeyword.trim()) {
        const q = searchKeyword.toLowerCase();
        const matchTitle = (tx.noi_dung || '').toLowerCase().includes(q);
        const matchNote = (tx.ghi_chu || '').toLowerCase().includes(q);
        const matchAuthor = (tx.author || '').toLowerCase().includes(q);
        const cleanDigits = q.replace(/\D/g, '');
        const matchAmount = cleanDigits && (
          String(tx.thu || '').includes(cleanDigits) || 
          String(tx.chi || '').includes(cleanDigits)
        );
        if (!matchTitle && !matchNote && !matchAuthor && !matchAmount) return false;
      }

      return true;
    });

    // Sắp xếp nghiêm ngặt từ MỚI TỚI CŨ (Ngày giảm dần -> Giờ giảm dần -> ID giảm dần)
    return sortTransactionsByDateDesc(list);
  }, [transactions, filterDate, filterMonth, currentMonth, filterCategory, filterType, searchKeyword]);

  const totalThu = filteredList.reduce((s, t) => s + (Number(t.thu) || 0), 0);
  const totalChi = filteredList.reduce((s, t) => s + (Number(t.chi) || 0), 0);

  // Kiểm tra có đang kích hoạt bộ lọc nào không
  const isFiltering = Boolean(
    filterDate || 
    filterCategory !== 'all' || 
    filterType !== 'all' || 
    filterMonth !== 'current' || 
    searchKeyword.trim()
  );

  const handleResetFilters = () => {
    setFilterMonth('current');
    setFilterDate('');
    setFilterCategory('all');
    setFilterType('all');
    setSearchKeyword('');
  };

  // Xuất file CSV
  const handleExportCSV = () => {
    const headers = ['Ngày', 'Giờ', 'Nội dung', 'Thu', 'Chi', 'Phân loại', 'Loại', 'Không gian', 'Người ghi', 'Ghi chú'];
    const rows = filteredList.map(t => [
      formatDateDisplay(t.ngay),
      t.gio || '',
      `"${(t.noi_dung || '').replace(/"/g, '""')}"`,
      t.thu || 0,
      t.chi || 0,
      t.phan_loai || '',
      t.loai || '',
      t.vault === 'shared' ? 'Quỹ chung' : t.vault === 'personal_nhut' ? 'Ví Nhựt' : 'Ví Trang',
      t.author || '',
      `"${(t.ghi_chu || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `thu_chi_${currentMonth}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectCategory = (txId, val) => {
    if (val === '__manage__') {
      if (onOpenCategoryManager) onOpenCategoryManager();
      return;
    }
    if (onUpdateTransaction) onUpdateTransaction(txId, 'phan_loai', val);
  };

  const handleSelectMacroType = (txId, val) => {
    if (val === '__manage__') {
      if (onOpenCategoryManager) onOpenCategoryManager();
      return;
    }
    if (onUpdateTransaction) onUpdateTransaction(txId, 'loai', val);
  };

  return (
    <section className="w-full max-w-5xl mx-auto px-4 md:px-8 pb-10">
      <div className="card-soft overflow-hidden">
        
        {/* ========================================================= */}
        {/* THANH CÔNG CỤ THEO DẠNG HÀNG 100% TRỰC QUAN CHO MOBILE */}
        {/* ========================================================= */}
        <div className="p-3.5 sm:p-4 bg-slate-50/90 border-b border-slate-200/90 space-y-2.5">
          
          {/* HÀNG 1: NÚT HÀNH ĐỘNG CHÍNH - THÊM THU CHI (100% WIDTH TRÊN MOBILE) */}
          <div className="w-full flex items-center justify-between gap-2">
            <button
              onClick={handleOpenAdd}
              type="button"
              className="w-full py-2.5 sm:py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors tactile-btn"
              title="Thêm khoản thu chi mới vào sổ"
            >
              <Plus size={18} weight="bold" />
              <span>Thêm thu chi mới</span>
            </button>
          </div>

          {/* HÀNG 2: TÌM KIẾM TOÀN DIỆN (100% WIDTH) */}
          <div className="relative w-full">
            <MagnifyingGlass size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm nội dung, người ghi, ghi chú, số tiền..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 shadow-2xs font-normal"
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => setSearchKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full transition-colors"
                title="Xóa tìm kiếm"
              >
                <X size={15} weight="bold" />
              </button>
            )}
          </div>

          {/* HÀNG BỘ LỌC CHI TIẾT: TRÊN MOBILE TÁCH RIÊNG 1 CỘT RỘNG RÃI, TRÊN DESKTOP 2 CỘT */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            
            {/* Hàng 1 - Cột 1: Lọc theo Tháng */}
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-2.5 sm:px-3 py-2 shadow-2xs hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold shrink-0">
                <Calendar size={15} className="text-emerald-700 shrink-0" weight="bold" />
                <span className="inline">Tháng:</span>
              </div>
              <select
                value={filterMonth}
                onChange={(e) => {
                  setFilterMonth(e.target.value);
                  if (filterDate && e.target.value !== 'all') {
                    const targetPrefix = e.target.value === 'current' ? currentMonth : e.target.value;
                    if (!filterDate.startsWith(targetPrefix)) {
                      setFilterDate('');
                    }
                  }
                }}
                className="w-full text-right text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer pl-1.5 truncate"
              >
                <option value="current">
                  {currentMonth?.includes('-') ? `Tháng ${currentMonth.split('-')[1]}/${currentMonth.split('-')[0]}` : currentMonth}
                </option>
                <option value="all">Tất cả ({transactions.length} khoản)</option>
                {availableMonths
                  .filter(m => m !== currentMonth)
                  .map(m => {
                    const parts = m.split('-');
                    const label = parts.length === 2 ? `Tháng ${parts[1]}/${parts[0]}` : m;
                    return (
                      <option key={m} value={m}>
                        {label}
                      </option>
                    );
                  })}
              </select>
            </div>

            {/* Hàng 1 - Cột 2: Lọc theo Ngày */}
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-2.5 sm:px-3 py-2 shadow-2xs hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold shrink-0">
                <Clock size={15} className="text-emerald-700 shrink-0" weight="bold" />
                <span className="hidden xs:inline sm:inline">Ngày:</span>
              </div>
              <div className="flex items-center gap-1 flex-1 justify-end min-w-0">
                <select
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full text-right text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer pl-1.5 truncate"
                >
                  <option value="">Tất cả các ngày</option>
                  {availableDaysInScope.map((d) => (
                    <option key={d.iso} value={d.iso}>
                      {d.label} ({d.count} khoản)
                    </option>
                  ))}
                </select>
                {filterDate && (
                  <button
                    type="button"
                    onClick={() => setFilterDate('')}
                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded-full shrink-0"
                    title="Bỏ chọn ngày"
                  >
                    <X size={13} weight="bold" />
                  </button>
                )}
              </div>
            </div>

            {/* Hàng 2 - Cột 1: Lọc theo Phân loại */}
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-2.5 sm:px-3 py-2 shadow-2xs hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold shrink-0">
                <Funnel size={15} className="text-emerald-700 shrink-0" weight="bold" />
                <span className="hidden xs:inline sm:inline">Phân loại:</span>
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full text-right text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer pl-1.5 truncate"
              >
                <option value="all">Tất cả ({categories.length})</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Hàng 2 - Cột 2: Lọc theo Loại */}
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-2.5 sm:px-3 py-2 shadow-2xs hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold shrink-0">
                <SlidersHorizontal size={15} className="text-emerald-700 shrink-0" weight="bold" />
                <span className="hidden xs:inline sm:inline">Loại:</span>
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full text-right text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer pl-1.5 truncate"
              >
                <option value="all">Tất cả ({macroTypes.length})</option>
                {macroTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

          </div>

          {/* HÀNG CÔNG CỤ PHỤ (DANH MỤC, XEM BẢNG/THẺ, XUẤT FILE) - CHIA 3 CỘT ĐỀU ĐẸP MẮT */}
          <div className="w-full grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/70">
            <button
              onClick={onOpenCategoryManager}
              className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 tactile-btn flex items-center justify-center gap-1.5 text-xs font-semibold shadow-2xs transition-colors"
              title="Quản lý danh sách phân loại & loại"
            >
              <SlidersHorizontal size={15} className="text-emerald-700 shrink-0" />
              <span>Danh mục</span>
            </button>

            <button
              onClick={() => setMobileView(mobileView === 'table' ? 'cards' : 'table')}
              className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 tactile-btn flex items-center justify-center gap-1.5 text-xs font-semibold shadow-2xs transition-colors"
              title="Chuyển chế độ xem Thẻ / Bảng"
            >
              {mobileView === 'table' ? (
                <ListBullets size={15} className="text-emerald-700 shrink-0" />
              ) : (
                <Table size={15} className="text-emerald-700 shrink-0" />
              )}
              <span>{mobileView === 'table' ? 'Dạng thẻ' : 'Dạng bảng'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 tactile-btn flex items-center justify-center gap-1.5 text-xs font-semibold shadow-2xs transition-colors"
              title="Xuất dữ liệu ra Excel CSV"
            >
              <DownloadSimple size={15} className="text-emerald-700 shrink-0" />
              <span>Xuất Excel</span>
            </button>
          </div>

          {/* HÀNG TRẠNG THÁI: SỐ LƯỢNG VÀ NÚT ĐẶT LẠI */}
          <div className="w-full flex items-center justify-between text-xs pt-1 px-1">
            <div className="text-slate-500 font-medium">
              Hiển thị <strong className="text-slate-800 tabular-nums">{filteredList.length}</strong> / {transactions.length} khoản
            </div>

            {isFiltering && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 px-2.5 py-1 rounded-xl transition-colors flex items-center gap-1 shadow-2xs"
                title="Bấm để xóa toàn bộ các bộ lọc và tìm kiếm"
              >
                <ArrowCounterClockwise size={12} weight="bold" />
                <span>Đặt lại bộ lọc</span>
              </button>
            )}
          </div>

        </div>

        {/* 1. DẠNG BẢNG CHUẨN GOOGLE SHEETS */}
        {mobileView === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              
              {/* Tiêu đề bảng */}
              <thead>
                <tr className="bg-[#1B4D3E] text-white border-b border-emerald-900 font-semibold tracking-wide">
                  <th className="py-2.5 px-3.5 w-28">Ngày</th>
                  <th className="py-2.5 px-3.5">Nội dung</th>
                  <th className="py-2.5 px-3.5 text-right w-28"># Thu</th>
                  <th className="py-2.5 px-3.5 text-right w-28"># Chi</th>
                  <th className="py-2.5 px-3.5 text-center w-32">Phân loại</th>
                  <th className="py-2.5 px-3.5 text-center w-32">Loại</th>
                  <th className="py-2.5 px-3 text-center w-24">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      Không có bản ghi nào trong danh sách.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((tx) => {
                    const hasThu = (tx.thu || 0) > 0;
                    const hasChi = (tx.chi || 0) > 0;

                    return (
                      <tr 
                        key={tx.id} 
                        className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Ngày */}
                        <td className="py-2.5 px-3.5 tabular-nums text-slate-600 whitespace-nowrap">
                          <div className="font-medium text-slate-800 leading-tight">
                            {formatDateDisplay(tx.ngay)}
                          </div>
                        </td>

                        {/* Nội dung */}
                        <td className="py-2.5 px-3.5 font-medium text-slate-800">
                          <div>{tx.noi_dung}</div>
                          {tx.ghi_chu && (
                            <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                              {tx.ghi_chu}
                            </div>
                          )}
                        </td>

                        {/* Thu */}
                        <td className="py-2.5 px-3.5 text-right tabular-nums font-bold text-emerald-700 whitespace-nowrap">
                          {hasThu ? (privacyMode ? '•••••• đ' : `+${new Intl.NumberFormat('vi-VN').format(tx.thu)}đ`) : ''}
                        </td>

                        {/* Chi */}
                        <td className="py-2.5 px-3.5 text-right tabular-nums font-bold text-rose-600 whitespace-nowrap">
                          {hasChi ? (privacyMode ? '•••••• đ' : `-${new Intl.NumberFormat('vi-VN').format(tx.chi)}đ`) : ''}
                        </td>

                        {/* Phân loại Dropdown */}
                        <td className="py-2 px-2 text-center whitespace-nowrap">
                          <select
                            value={tx.phan_loai || (categories[0] || 'ăn uống')}
                            onChange={(e) => handleSelectCategory(tx.id, e.target.value)}
                            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/90 text-slate-800 text-[11px] font-medium border border-slate-300/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white cursor-pointer text-center appearance-none pr-5.5 transition-colors relative"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23475569' viewBox='0 0 16 16'%3E%3Cpath d='M4.5 6l3.5 4 3.5-4z'/%3E%3C/svg%3E")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 6px center',
                              backgroundSize: '10px'
                            }}
                          >
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                            <option value="__manage__">✏️ Sửa danh mục...</option>
                          </select>
                        </td>

                        {/* Loại Dropdown */}
                        <td className="py-2 px-2 text-center whitespace-nowrap">
                          <select
                            value={tx.loai || (macroTypes[0] || 'thiết yếu')}
                            onChange={(e) => handleSelectMacroType(tx.id, e.target.value)}
                            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/90 text-slate-800 text-[11px] font-medium border border-slate-300/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white cursor-pointer text-center appearance-none pr-5.5 transition-colors relative"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23475569' viewBox='0 0 16 16'%3E%3Cpath d='M4.5 6l3.5 4 3.5-4z'/%3E%3C/svg%3E")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 6px center',
                              backgroundSize: '10px'
                            }}
                          >
                            {macroTypes.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                            <option value="__manage__">✏️ Sửa danh mục...</option>
                          </select>
                        </td>

                        {/* THAO TÁC: SỬA & XÓA */}
                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(tx)}
                              className="text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 p-1.5 rounded-lg transition-colors"
                              title="Sửa khoản thu chi này"
                            >
                              <PencilSimple size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteWithConfirm(tx)}
                              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                              title="Xóa khoản thu chi này"
                            >
                              <Trash size={15} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Dòng tổng cộng */}
              <tfoot>
                <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800">
                  <td colSpan="2" className="py-3 px-3.5 text-right uppercase text-[11px] tracking-wider text-slate-500">
                    Tổng cộng:
                  </td>
                  <td className="py-3 px-3.5 text-right tabular-nums text-emerald-700 font-bold">
                    +{formatMoney(totalThu)}
                  </td>
                  <td className="py-3 px-3.5 text-right tabular-nums text-rose-600 font-bold">
                    -{formatMoney(totalChi)}
                  </td>
                  <td colSpan="3" className="py-3 px-3.5 text-right text-xs text-slate-500 font-medium">
                    Còn dư: <strong className="text-emerald-800 tabular-nums">{new Intl.NumberFormat('vi-VN').format(totalThu - totalChi)} đ</strong>
                  </td>
                </tr>
              </tfoot>

            </table>
          </div>
        ) : (
          /* 2. DẠNG THẺ GỌN CHO ĐIỆN THOẠI CỰC KỲ ĐẸP MẮT & TIỆN LỢI */
          <div>
            {filteredList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-3">
                <p className="text-xs">Không tìm thấy khoản thu chi nào phù hợp.</p>
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  <Plus size={14} weight="bold" />
                  <span>Thêm khoản đầu tiên</span>
                </button>
              </div>
            ) : (
              <div className="p-3 sm:p-4 space-y-2.5 bg-slate-50/50">
                {filteredList.map((tx) => {
                  const isThu = (tx.thu || 0) > 0;
                  const catMeta = getCategoryIcon(tx.phan_loai, isThu);
                  return (
                    <div 
                      key={tx.id} 
                      className="p-3.5 bg-white hover:bg-slate-50/80 border border-slate-200/90 rounded-2xl shadow-2xs space-y-2.5 transition-all"
                    >
                      {/* HÀNG TRÊN: ICON PHÂN LOẠI + TIÊU ĐỀ RỘNG RÃI KHÔNG BỊ CẮT CHỮ */}
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${catMeta.bg} shadow-2xs mt-0.5`}>
                          {catMeta.icon}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <h4 className="text-sm font-bold text-slate-800 leading-snug break-words">
                            {tx.noi_dung}
                          </h4>
                          {tx.ghi_chu && (
                            <p className="text-xs text-slate-500 font-normal break-words">
                              {tx.ghi_chu}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200/60">
                              {tx.phan_loai}
                            </span>
                            {tx.loai && (
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-500 font-medium text-[10px] border border-slate-200/50">
                                {tx.loai}
                              </span>
                            )}
                            {tx.author && (
                              <span className="text-[11px] text-slate-400 font-medium">
                                • {tx.author}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* HÀNG DƯỚI: TÁCH RIÊNG RỘNG RÃI - NGÀY GHI & NÚT SỬA/XÓA BÊN TRÁI, GIÁ TIỀN BÊN PHẢI */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                        {/* Ngày & Cụm nút thao tác */}
                        <div className="flex items-center gap-2">
                          <span className="tabular-nums font-semibold text-slate-600 text-xs bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/60">
                            {formatDateDisplay(tx.ngay)}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(tx)}
                            className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-400 flex items-center justify-center border border-slate-200/70 transition-colors tactile-btn"
                            title="Chỉnh sửa giao dịch"
                          >
                            <PencilSimple size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteWithConfirm(tx)}
                            className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-400 flex items-center justify-center border border-slate-200/70 transition-colors tactile-btn"
                            title="Xóa giao dịch"
                          >
                            <Trash size={14} />
                          </button>
                        </div>

                        {/* GIÁ TIỀN NẰM DƯỚI TO RÕ RÀNG */}
                        <div className="text-right pl-2">
                          {isThu ? (
                            <span className="text-base sm:text-lg font-black text-emerald-700 tabular-nums font-money">
                              {privacyMode ? '•••••• đ' : `+${new Intl.NumberFormat('vi-VN').format(tx.thu)} đ`}
                            </span>
                          ) : (
                            <span className="text-base sm:text-lg font-black text-rose-600 tabular-nums font-money">
                              {privacyMode ? '•••••• đ' : `-${new Intl.NumberFormat('vi-VN').format(tx.chi)} đ`}
                            </span>
                          )}
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* Dòng tổng kết ở đáy dạng thẻ cho mobile */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-500">
                <span>Tổng Thu:</span>
                <span className="font-bold text-emerald-700 tabular-nums">+{formatMoney(totalThu)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Tổng Chi:</span>
                <span className="font-bold text-rose-600 tabular-nums">-{formatMoney(totalChi)}</span>
              </div>
              <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/80 font-bold">
                <span className="text-slate-800">Còn dư:</span>
                <span className="text-emerald-800 tabular-nums text-sm font-extrabold">
                  {new Intl.NumberFormat('vi-VN').format(totalThu - totalChi)} đ
                </span>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* POPUP THÊM & SỬA THU CHI (Dùng dự phòng nếu không dùng modal cấp App) */}
      {!externalOpenAdd && (
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          transactionToEdit={editingTx}
          onSave={handleSaveModal}
          categories={categories}
          macroTypes={macroTypes}
          members={members}
          activeUser={activeUser}
          currentMonth={currentMonth}
        />
      )}

    </section>
  );
}
