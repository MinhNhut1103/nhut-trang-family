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
    <section className="w-full max-w-5xl mx-auto px-4 md:px-8 space-y-3">
      
      {/* 1. THANH CHUYỂN THÁNG & QUẢN LÝ THÁNG (RESPONSIVE DESKTOP & MOBILE) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Bộ chuyển tháng: 100% trên mobile, gọn gàng trên desktop */}
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-1 bg-white border border-slate-200/90 rounded-2xl p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => onSelectMonth && onSelectMonth(getPrevMonth(currentMonth))}
            className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors tactile-btn"
            title="Tháng trước"
          >
            <CaretLeft size={17} weight="bold" />
          </button>

          <button
            type="button"
            onClick={onOpenMonthManager}
            className="px-3 py-1 sm:py-1.5 rounded-xl text-xs sm:text-sm font-bold text-slate-800 hover:bg-emerald-50 hover:text-emerald-800 transition-colors flex items-center gap-1.5"
            title="Bấm để mở Quản lý tháng & Ghi chú"
          >
            <Calendar size={16} weight="bold" className="text-emerald-700" />
            <span>{currentMonthLabel}</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMonth && onSelectMonth(getNextMonth(currentMonth))}
            className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors tactile-btn"
            title="Tháng tiếp theo"
          >
            <CaretRight size={17} weight="bold" />
          </button>
        </div>

        {/* Nút Quản lý tháng & Thống kê số lượng: 100% trên mobile, gọn cạnh nhau trên desktop */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenMonthManager}
            className="flex-1 sm:flex-none text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50/90 hover:bg-emerald-100 border border-emerald-200/80 px-3 py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs tactile-btn"
          >
            <Note size={15} weight="bold" />
            <span className="hidden sm:inline">Quản lý tháng & Note</span>
            <span className="sm:hidden">Quản lý tháng & Ghi chú</span>
          </button>

          <div className="text-xs text-slate-600 font-medium bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs tabular-nums shrink-0">
            <strong className="text-slate-800">{transactions.length}</strong> giao dịch
          </div>
        </div>
      </div>

      {/* 2A. BẢN DESKTOP (>= SM): GIỮ NGUYÊN 3 CỘT RỘNG RÃI SANG TRỌNG */}
      <div className="hidden sm:grid sm:grid-cols-3 sm:gap-3">
        {/* Thu */}
        <div className="card-soft p-3.5 md:p-4 text-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Tổng Thu
          </span>
          <div className="text-base md:text-xl font-bold text-emerald-700 tabular-nums">
            +{formatMoney(totalThu)}
          </div>
        </div>

        {/* Chi */}
        <div className="card-soft p-3.5 md:p-4 text-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Tổng Chi
          </span>
          <div className="text-base md:text-xl font-bold text-rose-600 tabular-nums">
            -{formatMoney(totalChi)}
          </div>
        </div>

        {/* Còn lại */}
        <div className="card-soft p-3.5 md:p-4 text-center bg-slate-50/50">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Chênh Lệch
          </span>
          <div className={`text-base md:text-xl font-bold tabular-nums ${
            netBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'
          }`}>
            {netBalance >= 0 ? '+' : ''}{formatMoney(netBalance)}
          </div>
        </div>
      </div>

      {/* 2B. BẢN MOBILE (< SM): DẠNG HÀNG 100% TỪNG DÒNG, KHÔNG BỊ BÓP NGHẸT */}
      <div className="block sm:hidden card-soft overflow-hidden divide-y divide-slate-100 shadow-2xs border border-slate-200/90">
        
        {/* HÀNG 1: TỔNG THU (100% WIDTH) */}
        <div className="flex items-center justify-between p-3 bg-white hover:bg-slate-50/60 transition-colors">
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
            <span className="text-sm font-bold text-emerald-700 tabular-nums">
              +{formatMoney(totalThu)}
            </span>
          </div>
        </div>

        {/* HÀNG 2: TỔNG CHI (100% WIDTH) */}
        <div className="flex items-center justify-between p-3 bg-white hover:bg-slate-50/60 transition-colors">
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
            <span className="text-sm font-bold text-rose-600 tabular-nums">
              -{formatMoney(totalChi)}
            </span>
          </div>
        </div>

        {/* HÀNG 3: CHÊNH LỆCH / THẶNG DƯ (100% WIDTH) */}
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
                Chênh Lệch {netBalance >= 0 ? '(Thặng dư)' : '(Thâm hụt)'}
              </span>
              <span className="text-[11px] text-slate-500">Số dư thực tế sau khi trừ chi</span>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-base font-extrabold tabular-nums ${
              netBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}>
              {netBalance >= 0 ? '+' : ''}{formatMoney(netBalance)}
            </span>
          </div>
        </div>

      </div>

      {/* 3. KHỐI HIỂN THỊ GHI CHÚ RIÊNG CỦA THÁNG (NOTE CARD SANG TRỌNG) */}
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

