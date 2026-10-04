import React from 'react';
import { 
  CaretLeft, 
  CaretRight, 
  Calendar, 
  Note, 
  PencilSimple, 
  Target, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet 
} from '@phosphor-icons/react';

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
      
      {/* 1. THANH CHUYỂN THÁNG (100% HÀNG RIÊNG) */}
      <div className="w-full flex items-center justify-between bg-white border border-slate-200/90 rounded-2xl p-1.5 shadow-2xs mb-2">
        <button
          type="button"
          onClick={() => onSelectMonth && onSelectMonth(getPrevMonth(currentMonth))}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors tactile-btn"
          title="Tháng trước"
        >
          <CaretLeft size={18} weight="bold" />
        </button>

        <button
          type="button"
          onClick={onOpenMonthManager}
          className="px-3 py-1.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-emerald-50 hover:text-emerald-800 transition-colors flex items-center gap-2"
          title="Bấm để mở Quản lý tháng & Ghi chú"
        >
          <Calendar size={17} weight="bold" className="text-emerald-700" />
          <span>{currentMonthLabel}</span>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
            {transactions.length} giao dịch
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectMonth && onSelectMonth(getNextMonth(currentMonth))}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors tactile-btn"
          title="Tháng tiếp theo"
        >
          <CaretRight size={18} weight="bold" />
        </button>
      </div>

      {/* 2. NÚT QUẢN LÝ THÁNG (100% HÀNG RIÊNG XUỐNG HÀNG) */}
      <div className="w-full mb-3">
        <button
          type="button"
          onClick={onOpenMonthManager}
          className="w-full py-2.5 px-3 bg-emerald-50/90 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl text-xs sm:text-sm font-semibold text-emerald-800 flex items-center justify-center gap-2 shadow-2xs transition-colors tactile-btn"
        >
          <Note size={16} weight="bold" className="text-emerald-700" />
          <span>Quản lý tháng & Ghi chú chốt sổ</span>
        </button>
      </div>

      {/* 3. TỔNG THU - TỔNG CHI - CHÊNH LỆCH (XUỐNG HÀNG 100% TỪNG DÒNG, KHÔNG CHIA CỘT NGANG) */}
      <div className="card-soft overflow-hidden mb-3 divide-y divide-slate-100 shadow-2xs border border-slate-200/90">
        
        {/* HÀNG 1: TỔNG THU (100% WIDTH) */}
        <div className="flex items-center justify-between p-3 sm:p-3.5 bg-white hover:bg-slate-50/60 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ArrowUpRight size={18} weight="bold" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-700 block">Tổng Thu</span>
              <span className="text-[11px] text-slate-400">Tất cả nguồn thu trong tháng</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm sm:text-lg font-bold text-emerald-700 tabular-nums">
              +{formatMoney(totalThu)}
            </span>
          </div>
        </div>

        {/* HÀNG 2: TỔNG CHI (100% WIDTH) */}
        <div className="flex items-center justify-between p-3 sm:p-3.5 bg-white hover:bg-slate-50/60 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <ArrowDownRight size={18} weight="bold" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-700 block">Tổng Chi</span>
              <span className="text-[11px] text-slate-400">Tất cả khoản đã tiêu</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm sm:text-lg font-bold text-rose-600 tabular-nums">
              -{formatMoney(totalChi)}
            </span>
          </div>
        </div>

        {/* HÀNG 3: CHÊNH LỆCH / THẶNG DƯ (100% WIDTH) */}
        <div className={`flex items-center justify-between p-3 sm:p-3.5 transition-colors ${
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
                Chênh Lệch {netBalance >= 0 ? '(Thặng dư)' : '(Thâm hụt)'}
              </span>
              <span className="text-[11px] text-slate-500">Số dư thực tế sau khi trừ chi</span>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-base sm:text-xl font-extrabold tabular-nums ${
              netBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}>
              {netBalance >= 0 ? '+' : ''}{formatMoney(netBalance)}
            </span>
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

