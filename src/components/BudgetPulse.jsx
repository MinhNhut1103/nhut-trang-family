import React from 'react';
import { CaretLeft, CaretRight, Calendar, Note, PencilSimple, Target } from '@phosphor-icons/react';

export default function BudgetPulse({ 
  transactions = [], 
  privacyMode = false,
  currentMonth = '2026-10',
  onSelectMonth,
  monthlyConfig,
  onOpenMonthManager
}) {
  const formatMoney = (val) => {
    if (privacyMode) return '•••••• đ';
    return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  };

  const totalThu = transactions.reduce((sum, t) => sum + (Number(t.thu) || 0), 0);
  const totalChi = transactions.reduce((sum, t) => sum + (Number(t.chi) || 0), 0);
  const netBalance = totalThu - totalChi;

  // Tính toán chuyển tháng trước / tháng sau
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
    <section className="w-full max-w-5xl mx-auto px-4 md:px-8 pt-4 pb-2">
      
      {/* 1. THANH CHUYỂN THÁNG & QUẢN LÝ THÁNG */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
        {/* Bộ điều hướng tháng */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200/90 rounded-2xl p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => onSelectMonth && onSelectMonth(getPrevMonth(currentMonth))}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="Tháng trước"
          >
            <CaretLeft size={16} weight="bold" />
          </button>

          <button
            type="button"
            onClick={onOpenMonthManager}
            className="px-3 py-1 rounded-xl text-xs md:text-sm font-bold text-slate-800 hover:bg-emerald-50 hover:text-emerald-800 transition-colors flex items-center gap-1.5"
            title="Bấm để mở Quản lý tháng & Ghi chú"
          >
            <Calendar size={15} weight="bold" className="text-emerald-700" />
            <span>{currentMonthLabel}</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMonth && onSelectMonth(getNextMonth(currentMonth))}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="Tháng tiếp theo"
          >
            <CaretRight size={16} weight="bold" />
          </button>
        </div>

        {/* Nút mở Quản lý tháng & Số dòng giao dịch */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenMonthManager}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200/60 px-2.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Note size={14} weight="bold" />
            <span className="hidden sm:inline">Quản lý tháng & Note</span>
            <span className="sm:hidden">Quản lý tháng</span>
          </button>

          <div className="text-xs text-slate-500 font-medium bg-slate-100/90 px-2.5 py-1.5 rounded-xl border border-slate-200/80 tabular-nums">
            <strong className="text-slate-700">{transactions.length}</strong> giao dịch
          </div>
        </div>
      </div>

      {/* 2. TÓM TẮT 3 CON SỐ: TỔNG THU - TỔNG CHI - CÒN LẠI */}
      <div className="grid grid-cols-3 gap-2 md:gap-3 mb-3">
        
        {/* Thu */}
        <div className="card-soft p-2.5 sm:p-3.5 md:p-4 text-center">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5 sm:mb-1">
            Tổng Thu
          </span>
          <div className="text-xs sm:text-base md:text-xl font-bold text-emerald-700 tabular-nums">
            +{formatMoney(totalThu)}
          </div>
        </div>

        {/* Chi */}
        <div className="card-soft p-2.5 sm:p-3.5 md:p-4 text-center">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5 sm:mb-1">
            Tổng Chi
          </span>
          <div className="text-xs sm:text-base md:text-xl font-bold text-rose-600 tabular-nums">
            -{formatMoney(totalChi)}
          </div>
        </div>

        {/* Còn lại */}
        <div className="card-soft p-2.5 sm:p-3.5 md:p-4 text-center bg-slate-50/50">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5 sm:mb-1">
            Chênh Lệch
          </span>
          <div className={`text-xs sm:text-base md:text-xl font-bold tabular-nums ${
            netBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'
          }`}>
            {netBalance >= 0 ? '+' : ''}{formatMoney(netBalance)}
          </div>
        </div>

      </div>

      {/* 3. KHỐI HIỂN THỊ GHI CHÚ RIÊNG CỦA THÁNG (NOTE) */}
      <div className="card-soft p-3 sm:p-4 mb-2 bg-gradient-to-r from-emerald-50/40 via-white to-slate-50/40 border border-emerald-100/80">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            
            {/* Header của Note */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Note size={14} weight="bold" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                Ghi chú {currentMonthLabel}
              </span>
              {monthFocus && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded-full">
                  <Target size={12} weight="bold" />
                  <span className="truncate max-w-[200px] sm:max-w-xs">{monthFocus}</span>
                </span>
              )}
            </div>

            {/* Nội dung Note */}
            {monthNote ? (
              <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed whitespace-pre-line pl-8 font-normal">
                {monthNote}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic pl-8">
                Chưa có ghi chú nào cho {currentMonthLabel}. Bấm nút bên cạnh để thêm lời nhắc, mục tiêu riêng của tháng.
              </p>
            )}

          </div>

          {/* Nút sửa nhanh ghi chú */}
          <button
            type="button"
            onClick={onOpenMonthManager}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-600 hover:text-emerald-700 text-xs font-semibold flex items-center gap-1 transition-colors shrink-0 shadow-2xs"
            title="Chỉnh sửa ghi chú & mục tiêu tháng này"
          >
            <PencilSimple size={14} weight="bold" />
            <span className="hidden sm:inline">{monthNote ? 'Sửa ghi chú' : 'Thêm ghi chú'}</span>
          </button>
        </div>
      </div>

    </section>
  );
}

