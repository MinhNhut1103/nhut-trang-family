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
  currentFunds = { so_tien_hien_co: 0 },
  onUpdateFunds
}) {
  const formatMoney = (val) => {
    if (privacyMode) return '•••••• đ';
    return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  };

  // Thu chi riêng trong tháng hiện tại
  const totalThu = transactions.reduce((sum, t) => sum + (Number(t.thu) || 0), 0);
  const totalChi = transactions.reduce((sum, t) => sum + (Number(t.chi) || 0), 0);
  const netBalance = totalThu - totalChi;

  // SỐ TIỀN HIỆN CÓ: Lấy từ currentFunds toàn cục (tự động cộng dồn nếu từ phiên bản cũ)
  const soTienHienCo = currentFunds?.so_tien_hien_co !== undefined 
    ? Number(currentFunds.so_tien_hien_co) 
    : ((Number(currentFunds?.tien_ngoai_vi) || 0) + (Number(currentFunds?.tien_trong_the) || 0) || (Number(monthlyConfig?.tien_ngoai_vi) || 0) + (Number(monthlyConfig?.tien_trong_the) || 0));

  // State chỉnh sửa Số tiền hiện có
  const [isEditingFunds, setIsEditingFunds] = useState(false);
  const [fundsInput, setFundsInput] = useState('');

  const handleStartEditFunds = () => {
    setFundsInput(soTienHienCo > 0 ? String(soTienHienCo) : '');
    setIsEditingFunds(true);
  };

  const handleSaveFunds = () => {
    const num = Number(String(fundsInput).replace(/\D/g, '')) || 0;
    if (onUpdateFunds) {
      onUpdateFunds(num);
    }
    setIsEditingFunds(false);
  };

  const handleCancelFunds = () => {
    setIsEditingFunds(false);
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-xs shrink-0">
              <Wallet size={22} weight="fill" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                  Số Tiền Hiện Có
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/80">
                  Tài sản khả dụng
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tự động cộng khi có khoản Thu (+) và trừ khi có khoản Chi (-) trong tháng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {isEditingFunds ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  autoFocus
                  placeholder="0"
                  value={fundsInput ? Number(fundsInput.replace(/\D/g, '')).toLocaleString('vi-VN') : ''}
                  onChange={(e) => setFundsInput(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveFunds();
                    if (e.key === 'Escape') handleCancelFunds();
                  }}
                  className="text-base sm:text-lg font-bold text-emerald-950 bg-white border border-emerald-300 rounded-xl py-1 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums w-44 sm:w-52 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={handleSaveFunds}
                  className="p-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs cursor-pointer shrink-0 transition-colors shadow-2xs"
                  title="Lưu số tiền hiện có"
                >
                  <Check size={16} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={handleCancelFunds}
                  className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs cursor-pointer shrink-0 transition-colors"
                  title="Hủy"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div 
                  onClick={handleStartEditFunds}
                  className="text-2xl sm:text-3xl font-extrabold text-emerald-800 tabular-nums font-money cursor-pointer hover:underline py-0.5 tracking-tight"
                  title="Bấm để chỉnh sửa số tiền hiện có"
                >
                  {formatMoney(soTienHienCo)}
                </div>
                <button
                  type="button"
                  onClick={handleStartEditFunds}
                  className="text-slate-400 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                  title="Chỉnh sửa số tiền hiện có"
                >
                  <PencilSimple size={16} weight="bold" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dòng tóm tắt biến động tháng */}
        <div className="mt-3 pt-2.5 border-t border-pink-100/80 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-700">Biến động {currentMonthLabel}:</span>
            <span className={`font-bold ${netBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {netBalance >= 0 ? '+' : ''}{formatMoney(netBalance)}
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              (Thu: +{formatMoney(totalThu)} • Chi: -{formatMoney(totalChi)})
            </span>
          </div>
          <div className="text-[11px] text-slate-400 italic">
            Bấm vào số tiền để chỉnh sửa số dư bất kỳ lúc nào
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
