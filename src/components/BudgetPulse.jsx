import React, { useState } from 'react';
import { 
  CaretLeft, 
  CaretRight, 
  CaretDown,
  Calendar, 
  Note, 
  PencilSimple, 
  Target, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet,
  Money,
  CreditCard,
  Check,
  X,
  Sparkle
} from '@phosphor-icons/react';

export default function BudgetPulse({ 
  transactions = [], 
  privacyMode = false,
  currentMonth = '2026-10',
  onSelectMonth,
  monthlyConfig,
  onOpenMonthManager,
  availableMonths = [],
  currentFunds = { tien_ngoai_vi: 0, tien_trong_the: 0 },
  onUpdateTienNgoaiVi,
  onUpdateTienTrongThe
}) {
  const formatMoney = (val) => {
    if (privacyMode) return '•••••• đ';
    return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  };

  // Thu chi riêng trong tháng hiện tại
  const totalThu = transactions.reduce((sum, t) => sum + (Number(t.thu) || 0), 0);
  const totalChi = transactions.reduce((sum, t) => sum + (Number(t.chi) || 0), 0);
  const netBalance = totalThu - totalChi;

  // SỐ TIỀN HIỆN CÓ: Lấy từ currentFunds toàn cục (hoặc fallback monthlyConfig)
  const tienNgoaiVi = currentFunds?.tien_ngoai_vi !== undefined 
    ? Number(currentFunds.tien_ngoai_vi) 
    : (Number(monthlyConfig?.tien_ngoai_vi) || 0);

  const tienTrongThe = currentFunds?.tien_trong_the !== undefined 
    ? Number(currentFunds.tien_trong_the) 
    : (Number(monthlyConfig?.tien_trong_the) || 0);

  const tongTienHienCo = tienNgoaiVi + tienTrongThe;

  // State chỉnh sửa Tiền ngoài ví
  const [isEditingCash, setIsEditingCash] = useState(false);
  const [cashInput, setCashInput] = useState('');

  const handleStartEditCash = () => {
    setCashInput(tienNgoaiVi > 0 ? String(tienNgoaiVi) : '');
    setIsEditingCash(true);
  };

  const handleSaveCash = () => {
    const num = Number(String(cashInput).replace(/\D/g, '')) || 0;
    if (onUpdateTienNgoaiVi) {
      onUpdateTienNgoaiVi(num);
    }
    setIsEditingCash(false);
  };

  const handleCancelCash = () => {
    setIsEditingCash(false);
  };

  // State chỉnh sửa Tiền trong thẻ
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [cardInput, setCardInput] = useState('');

  const handleStartEditCard = () => {
    setCardInput(tienTrongThe > 0 ? String(tienTrongThe) : '');
    setIsEditingCard(true);
  };

  const handleSaveCard = () => {
    const num = Number(String(cardInput).replace(/\D/g, '')) || 0;
    if (onUpdateTienTrongThe) {
      onUpdateTienTrongThe(num);
    }
    setIsEditingCard(false);
  };

  const handleCancelCard = () => {
    setIsEditingCard(false);
  };

  // Danh sách tháng cho dropdown
  const monthsList = availableMonths && availableMonths.length > 0 
    ? availableMonths 
    : ['2026-10', '2026-09', '2026-08'];

  // Chuyển tháng trước / tháng sau
  const getPrevMonth = (mStr) => {
    if (!mStr || !mStr.includes('-')) return '2026-09';
    const [y, m] = mStr.split('-').map(Number);
    const date = new Date(y, m - 2, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const getNextMonth = (mStr) => {
    if (!mStr || !mStr.includes('-')) return '2026-11';
    const [y, m] = mStr.split('-').map(Number);
    const date = new Date(y, m, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const formatMonthDisplay = (mStr) => {
    if (!mStr || !mStr.includes('-')) return mStr || 'Tháng 10/2026';
    const [year, month] = mStr.split('-');
    return `Tháng ${month}/${year}`;
  };

  const currentMonthLabel = formatMonthDisplay(currentMonth);
  const monthNote = monthlyConfig?.ghi_chu?.trim();
  const monthFocus = monthlyConfig?.banner_focus?.trim();

  return (
    <section className="w-full max-w-5xl mx-auto px-4 md:px-8 space-y-3.5">
      
      {/* ========================================================================= */}
      {/* KHỐI 1: SỐ TIỀN HIỆN CÓ (VÍ TIỀN MẶT & THẺ NGÂN HÀNG - HOÀN TOÀN NẰM RIÊNG) */}
      {/* ========================================================================= */}
      <div className="card-soft p-3.5 sm:p-5 bg-gradient-to-br from-white via-pink-50/20 to-emerald-50/20 border border-pink-200/90 shadow-xs shadow-pink-100/30">
        {/* Header Khối Số Tiền Hiện Có */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-pink-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-xs shrink-0">
              <Wallet size={18} weight="fill" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
                  Số Tiền Hiện Có
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/80">
                  Tài sản khả dụng
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Tự động cộng khi Thu và trừ khi Chi trong tháng — Phân bổ giữa Tiền ngoài ví & Tiền trong thẻ
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <Sparkle size={13} weight="fill" className="text-amber-500" />
            <span>Bấm vào số tiền hoặc biểu tượng bút để sửa</span>
          </div>
        </div>

        {/* 3 Thẻ: Tiền ngoài ví - Tiền trong thẻ - Tổng tài sản hiện có */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          
          {/* 1. TIỀN NGOÀI VÍ (TIỀN MẶT) */}
          <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 hover:border-amber-300 transition-all relative group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Money size={14} weight="bold" />
                </div>
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  Tiền Ngoài Ví
                </span>
              </div>
              <button
                type="button"
                onClick={handleStartEditCash}
                className="text-amber-700 hover:text-amber-950 p-1 rounded-md hover:bg-amber-100/80 transition-colors cursor-pointer"
                title="Chỉnh sửa số tiền mặt ngoài ví"
              >
                <PencilSimple size={13} weight="bold" />
              </button>
            </div>

            {isEditingCash ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="text"
                  autoFocus
                  placeholder="0"
                  value={cashInput ? Number(cashInput.replace(/\D/g, '')).toLocaleString('vi-VN') : ''}
                  onChange={(e) => setCashInput(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveCash();
                    if (e.key === 'Escape') handleCancelCash();
                  }}
                  className="w-full text-sm font-bold text-amber-950 bg-white border border-amber-300 rounded-lg py-1 px-2 focus:outline-none focus:ring-1 focus:ring-amber-500 tabular-nums"
                />
                <button
                  type="button"
                  onClick={handleSaveCash}
                  className="p-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs cursor-pointer shrink-0"
                  title="Lưu"
                >
                  <Check size={14} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={handleCancelCash}
                  className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs cursor-pointer shrink-0"
                  title="Hủy"
                >
                  <X size={14} weight="bold" />
                </button>
              </div>
            ) : (
              <div 
                onClick={handleStartEditCash}
                className="text-lg sm:text-xl font-bold text-amber-900 tabular-nums font-money cursor-pointer hover:underline py-0.5"
                title="Bấm để chỉnh sửa tiền mặt ngoài ví"
              >
                {formatMoney(tienNgoaiVi)}
              </div>
            )}
            <span className="text-[10px] text-amber-700/80 font-medium block mt-0.5">
              Tiền mặt sẵn có bên ngoài
            </span>
          </div>

          {/* 2. TIỀN TRONG THẺ (NGÂN HÀNG / ATM) */}
          <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200/80 hover:border-blue-300 transition-all relative group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <CreditCard size={14} weight="bold" />
                </div>
                <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                  Tiền Trong Thẻ
                </span>
              </div>
              <button
                type="button"
                onClick={handleStartEditCard}
                className="text-blue-700 hover:text-blue-950 p-1 rounded-md hover:bg-blue-100/80 transition-colors cursor-pointer"
                title="Chỉnh sửa số tiền trong thẻ ngân hàng"
              >
                <PencilSimple size={13} weight="bold" />
              </button>
            </div>

            {isEditingCard ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="text"
                  autoFocus
                  placeholder="0"
                  value={cardInput ? Number(cardInput.replace(/\D/g, '')).toLocaleString('vi-VN') : ''}
                  onChange={(e) => setCardInput(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveCard();
                    if (e.key === 'Escape') handleCancelCard();
                  }}
                  className="w-full text-sm font-bold text-blue-950 bg-white border border-blue-300 rounded-lg py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 tabular-nums"
                />
                <button
                  type="button"
                  onClick={handleSaveCard}
                  className="p-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs cursor-pointer shrink-0"
                  title="Lưu"
                >
                  <Check size={14} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={handleCancelCard}
                  className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs cursor-pointer shrink-0"
                  title="Hủy"
                >
                  <X size={14} weight="bold" />
                </button>
              </div>
            ) : (
              <div 
                onClick={handleStartEditCard}
                className="text-lg sm:text-xl font-bold text-blue-900 tabular-nums font-money cursor-pointer hover:underline py-0.5"
                title="Bấm để chỉnh sửa tiền trong thẻ ngân hàng"
              >
                {formatMoney(tienTrongThe)}
              </div>
            )}
            <span className="text-[10px] text-blue-700/80 font-medium block mt-0.5">
              Tài khoản / Thẻ ATM ngân hàng
            </span>
          </div>

          {/* 3. TỔNG TIỀN HIỆN CÓ (VÍ + THẺ) */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border border-emerald-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Sparkle size={14} weight="fill" />
                </div>
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Tổng Tiền Hiện Có
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.2 rounded">
                Ví + Thẻ
              </span>
            </div>

            <div className="text-lg sm:text-xl font-extrabold text-emerald-800 tabular-nums font-money py-0.5">
              {formatMoney(tongTienHienCo)}
            </div>

            <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5 flex-wrap">
              <span>{currentMonthLabel}:</span>
              <strong className={netBalance >= 0 ? 'text-emerald-800' : 'text-rose-600'}>
                {netBalance >= 0 ? '+' : ''}{formatMoney(netBalance)}
              </strong>
              <span className="text-[9px] text-slate-400 font-normal">
                (Thu: +{formatMoney(totalThu)}, Chi: -{formatMoney(totalChi)})
              </span>
            </span>
          </div>

        </div>
      </div>


      {/* ========================================================================= */}
      {/* KHỐI 2: BÁO CÁO THU CHI THÁNG (THEO THÁNG ĐANG XEM) */}
      {/* ========================================================================= */}
      <div className="card-soft p-3.5 sm:p-5 bg-white border border-pink-200/90 shadow-xs shadow-pink-100/30 space-y-3">
        
        {/* Header chọn tháng & quản lý tháng */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Bộ chọn tháng dạng dropdown */}
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-1 bg-pink-50/40 border border-pink-200/80 rounded-2xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => onSelectMonth && onSelectMonth(getPrevMonth(currentMonth))}
              className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-900 hover:bg-white rounded-xl transition-colors tactile-btn shrink-0"
              title="Tháng trước"
            >
              <CaretLeft size={17} weight="bold" />
            </button>

            {/* Dropdown chọn tháng trực tiếp */}
            <div className="relative flex-1 sm:flex-none flex items-center bg-white hover:bg-pink-50/40 border border-pink-200/80 rounded-xl px-2.5 py-1 sm:py-1.5 transition-all group">
              <Calendar size={16} weight="bold" className="text-emerald-700 shrink-0 mr-1.5 pointer-events-none" />
              <select
                id="budget-month-dropdown"
                value={currentMonth}
                onChange={(e) => onSelectMonth && onSelectMonth(e.target.value)}
                className="w-full sm:w-auto bg-transparent text-xs sm:text-sm font-bold text-slate-900 hover:text-emerald-900 cursor-pointer focus:outline-none pr-5 appearance-none py-0.5 tracking-tight"
                title="Chọn tháng"
              >
                {monthsList.map((m) => {
                  const parts = m.split('-');
                  const label = parts.length === 2 ? `Tháng ${parts[1]}/${parts[0]}` : m;
                  return (
                    <option key={m} value={m} className="text-slate-900 font-semibold py-1 bg-white">
                      {label}
                    </option>
                  );
                })}
              </select>
              <CaretDown size={14} weight="bold" className="text-emerald-700 pointer-events-none absolute right-2.5" />
            </div>

            <button
              type="button"
              onClick={() => onSelectMonth && onSelectMonth(getNextMonth(currentMonth))}
              className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-900 hover:bg-white rounded-xl transition-colors tactile-btn shrink-0"
              title="Tháng tiếp theo"
            >
              <CaretRight size={17} weight="bold" />
            </button>
          </div>

          {/* Nút Quản lý tháng & Đếm số lượng giao dịch */}
          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenMonthManager}
              className="flex-1 sm:flex-none text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50/90 hover:bg-emerald-100 border border-emerald-200/80 px-3 py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs tactile-btn"
            >
              <Note size={15} weight="bold" />
              <span>Quản lý tháng & Ghi chú</span>
            </button>

            <div className="text-xs text-slate-600 font-medium bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shadow-2xs tabular-nums shrink-0">
              <strong className="text-slate-800">{transactions.length}</strong> giao dịch
            </div>
          </div>
        </div>

        {/* 2A. BẢN DESKTOP (>= SM): 3 CỘT THU CHI THÁNG RÕ RÀNG */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-2.5 md:gap-3">
          {/* 1. Tổng Thu Tháng */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
              <ArrowUpRight size={14} weight="bold" />
              <span>Tổng Thu {currentMonthLabel}</span>
            </div>
            <div className="text-base md:text-xl font-bold text-emerald-700 tabular-nums font-money">
              +{formatMoney(totalThu)}
            </div>
            <span className="text-[10px] text-emerald-700/80 mt-0.5 block">
              Tất cả nguồn thu trong tháng
            </span>
          </div>

          {/* 2. Tổng Chi Tháng */}
          <div className="p-3.5 rounded-2xl bg-rose-50/40 border border-rose-200/80 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-rose-800 uppercase tracking-wider mb-1">
              <ArrowDownRight size={14} weight="bold" />
              <span>Tổng Chi {currentMonthLabel}</span>
            </div>
            <div className="text-base md:text-xl font-bold text-rose-600 tabular-nums font-money">
              -{formatMoney(totalChi)}
            </div>
            <span className="text-[10px] text-rose-700/80 mt-0.5 block">
              Tất cả khoản đã tiêu trong tháng
            </span>
          </div>

          {/* 3. Dư Tháng Này (Chênh Lệch Thu - Chi) */}
          <div className={`p-3.5 rounded-2xl text-center border ${
            netBalance >= 0 
              ? 'bg-teal-50/40 border-teal-200/80' 
              : 'bg-amber-50/40 border-amber-200/80'
          }`}>
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Dư Tháng Này (Thu - Chi)
            </span>
            <div className={`text-base md:text-xl font-bold tabular-nums font-money ${
              netBalance >= 0 ? 'text-teal-700' : 'text-rose-600'
            }`}>
              {netBalance >= 0 ? '+' : ''}{formatMoney(netBalance)}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              {netBalance >= 0 ? 'Thặng dư tháng này' : 'Thâm hụt tháng này'}
            </span>
          </div>
        </div>

        {/* 2B. BẢN MOBILE (< SM): DẠNG HÀNG 100% TỪNG DÒNG RÕ RÀNG */}
        <div className="block sm:hidden card-soft overflow-hidden divide-y divide-pink-100 border border-pink-200/90">
          
          {/* HÀNG 1: TỔNG THU */}
          <div className="flex items-center justify-between p-3 bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ArrowUpRight size={18} weight="bold" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-700 block">Tổng Thu Tháng</span>
                <span className="text-[11px] text-slate-400">Các nguồn thu {currentMonthLabel}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-emerald-700 tabular-nums font-money">
                +{formatMoney(totalThu)}
              </span>
            </div>
          </div>

          {/* HÀNG 2: TỔNG CHI */}
          <div className="flex items-center justify-between p-3 bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <ArrowDownRight size={18} weight="bold" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-700 block">Tổng Chi Tháng</span>
                <span className="text-[11px] text-slate-400">Các khoản tiêu {currentMonthLabel}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-rose-600 tabular-nums font-money">
                -{formatMoney(totalChi)}
              </span>
            </div>
          </div>

          {/* HÀNG 3: DƯ THÁNG NÀY (CHÊNH LỆCH) */}
          <div className={`flex items-center justify-between p-3 transition-colors ${
            netBalance >= 0 ? 'bg-emerald-50/40' : 'bg-rose-50/40'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                netBalance >= 0 ? 'bg-emerald-200/80 text-emerald-800' : 'bg-rose-200/80 text-rose-800'
              }`}>
                <Wallet size={18} weight="bold" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Dư Tháng Này {netBalance >= 0 ? '(Thặng dư)' : '(Thâm hụt)'}
                </span>
                <span className="text-[11px] text-slate-500">Chênh lệch Thu trừ Chi</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-base font-extrabold tabular-nums font-money ${
                netBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}>
                {netBalance >= 0 ? '+' : ''}{formatMoney(netBalance)}
              </span>
            </div>
          </div>

        </div>

      </div>


      {/* ========================================================================= */}
      {/* KHỐI 3: GHI CHÚ RIÊNG CỦA THÁNG (NOTE CARD SANG TRỌNG) */}
      {/* ========================================================================= */}
      <div className="card-soft p-3.5 sm:p-4 bg-gradient-to-br from-emerald-50/50 via-white to-slate-50/60 border border-emerald-100/90 shadow-2xs">
        
        {/* Header ghi chú */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-2xs">
              <Note size={15} weight="bold" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              Ghi chú {currentMonthLabel}
            </span>
            {monthFocus && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100/80 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                <Target size={12} weight="bold" />
                <span className="truncate max-w-[160px] sm:max-w-xs">{monthFocus}</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenMonthManager}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-emerald-700 text-xs font-semibold flex items-center gap-1 transition-colors shrink-0 shadow-2xs tactile-btn"
            title="Chỉnh sửa ghi chú & mục tiêu tháng này"
          >
            <PencilSimple size={14} weight="bold" />
            <span className="hidden sm:inline">{monthNote ? 'Sửa ghi chú' : 'Thêm ghi chú'}</span>
          </button>
        </div>

        {/* Khung nội dung ghi chú mềm mại, tinh tế */}
        <div className="bg-white/90 rounded-xl p-3 border border-emerald-100/80 shadow-2xs">
          {monthNote ? (
            <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed whitespace-pre-line font-normal">
              {monthNote}
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Chưa có ghi chú nào cho {currentMonthLabel}. Bấm nút sửa để thêm lời nhắc hoặc mục tiêu riêng của tháng.
            </p>
          )}
        </div>

      </div>

    </section>
  );
}
