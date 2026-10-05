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
  X
} from '@phosphor-icons/react';

export default function BudgetPulse({ 
  transactions = [], 
  privacyMode = false,
  currentMonth = '2026-10',
  onSelectMonth,
  monthlyConfig,
  onOpenMonthManager,
  availableMonths = [],
  onUpdateTienNgoaiVi,
  onUpdateTienTrongThe
}) {
  const formatMoney = (val) => {
    if (privacyMode) return '•••••• đ';
    return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  };

  const totalThu = transactions.reduce((sum, t) => sum + (Number(t.thu) || 0), 0);
  const totalChi = transactions.reduce((sum, t) => sum + (Number(t.chi) || 0), 0);
  const netBalance = totalThu - totalChi;

  // Tiền ngoài ví (tiền mặt thủ công) và Tiền trong thẻ (ngân hàng thủ công)
  const tienNgoaiVi = Number(monthlyConfig?.tien_ngoai_vi) || 0;
  const tienTrongThe = Number(monthlyConfig?.tien_trong_the) || 0;
  const tongThucTe = netBalance + tienNgoaiVi + tienTrongThe;

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
        {/* Bộ chọn tháng dạng dropdown: 100% trên mobile, gọn gàng trên desktop */}
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-1 bg-white border border-slate-200/90 rounded-2xl p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => onSelectMonth && onSelectMonth(getPrevMonth(currentMonth))}
            className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors tactile-btn shrink-0"
            title="Tháng trước"
          >
            <CaretLeft size={17} weight="bold" />
          </button>

          {/* Dropdown chọn tháng trực tiếp */}
          <div className="relative flex-1 sm:flex-none flex items-center bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-200/90 rounded-xl px-2.5 py-1 sm:py-1.5 transition-all group">
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
            className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors tactile-btn shrink-0"
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

      {/* 2A. BẢN DESKTOP (>= SM): 5 CỘT RỘNG RÃI SANG TRỌNG */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-5 sm:gap-2.5 md:gap-3">
        {/* 1. Thu */}
        <div className="card-soft p-3.5 md:p-4 text-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Tổng Thu
          </span>
          <div className="text-base md:text-xl font-bold text-emerald-700 tabular-nums font-money">
            +{formatMoney(totalThu)}
          </div>
        </div>

        {/* 2. Chi */}
        <div className="card-soft p-3.5 md:p-4 text-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Tổng Chi
          </span>
          <div className="text-base md:text-xl font-bold text-rose-600 tabular-nums font-money">
            -{formatMoney(totalChi)}
          </div>
        </div>

        {/* 3. Chênh Lệch */}
        <div className="card-soft p-3.5 md:p-4 text-center bg-slate-50/50">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Chênh Lệch
          </span>
          <div className={`text-base md:text-xl font-bold tabular-nums font-money ${
            netBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'
          }`}>
            {netBalance >= 0 ? '+' : ''}{formatMoney(netBalance)}
          </div>
        </div>

        {/* 4. Tiền Ngoài Ví (Tiền mặt tự điền) */}
        <div className="card-soft p-3.5 md:p-4 text-center relative group bg-amber-50/40 border border-amber-200/80 hover:border-amber-300 transition-all">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
              Tiền Ngoài Ví
            </span>
            <button
              type="button"
              onClick={handleStartEditCash}
              className="text-amber-700 hover:text-amber-950 p-0.5 rounded transition-colors cursor-pointer"
              title="Chỉnh sửa số tiền mặt ngoài ví"
            >
              <PencilSimple size={12} weight="bold" />
            </button>
          </div>

          {isEditingCash ? (
            <div className="flex items-center justify-center gap-1 mt-0.5">
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
                className="w-24 text-center text-xs font-bold text-amber-950 bg-white border border-amber-300 rounded-lg py-1 px-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 tabular-nums"
              />
              <button
                type="button"
                onClick={handleSaveCash}
                className="p-1 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs cursor-pointer"
                title="Lưu"
              >
                <Check size={13} weight="bold" />
              </button>
              <button
                type="button"
                onClick={handleCancelCash}
                className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs cursor-pointer"
                title="Hủy"
              >
                <X size={13} weight="bold" />
              </button>
            </div>
          ) : (
            <div 
              onClick={handleStartEditCash}
              className="text-base md:text-xl font-bold text-amber-900 tabular-nums font-money cursor-pointer hover:underline"
              title="Bấm để chỉnh sửa tiền mặt"
            >
              {formatMoney(tienNgoaiVi)}
            </div>
          )}
          <span className="text-[10px] text-amber-700/80 block mt-0.5 font-medium">
            Tiền mặt tự điền
          </span>
        </div>

        {/* 5. Tiền Trong Thẻ (Thẻ ngân hàng tự điền) */}
        <div className="card-soft p-3.5 md:p-4 text-center relative group bg-blue-50/40 border border-blue-200/80 hover:border-blue-300 transition-all sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">
              Tiền Trong Thẻ
            </span>
            <button
              type="button"
              onClick={handleStartEditCard}
              className="text-blue-700 hover:text-blue-950 p-0.5 rounded transition-colors cursor-pointer"
              title="Chỉnh sửa số tiền trong thẻ ngân hàng"
            >
              <PencilSimple size={12} weight="bold" />
            </button>
          </div>

          {isEditingCard ? (
            <div className="flex items-center justify-center gap-1 mt-0.5">
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
                className="w-24 text-center text-xs font-bold text-blue-950 bg-white border border-blue-300 rounded-lg py-1 px-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 tabular-nums"
              />
              <button
                type="button"
                onClick={handleSaveCard}
                className="p-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs cursor-pointer"
                title="Lưu"
              >
                <Check size={13} weight="bold" />
              </button>
              <button
                type="button"
                onClick={handleCancelCard}
                className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs cursor-pointer"
                title="Hủy"
              >
                <X size={13} weight="bold" />
              </button>
            </div>
          ) : (
            <div 
              onClick={handleStartEditCard}
              className="text-base md:text-xl font-bold text-blue-900 tabular-nums font-money cursor-pointer hover:underline"
              title="Bấm để chỉnh sửa tiền trong thẻ"
            >
              {formatMoney(tienTrongThe)}
            </div>
          )}
          <span className="text-[10px] text-blue-700/80 block mt-0.5 font-medium">
            Tài khoản / Thẻ
          </span>
        </div>
      </div>

      {/* TỔNG TÀI CHÍNH THỰC CÓ TRÊN DESKTOP NẾU CÓ TIỀN NGOÀI VÍ HOẶC TIỀN THẺ */}
      {(tienNgoaiVi > 0 || tienTrongThe > 0) && (
        <div className="hidden sm:flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-emerald-50 via-blue-50/40 to-amber-50/40 rounded-xl border border-emerald-200/70 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-800">Tổng tài chính thực có trong tháng:</span>
            <span className="text-slate-500">
              (Chênh lệch {formatMoney(netBalance)}
              {tienNgoaiVi > 0 ? ` + Tiền mặt ${formatMoney(tienNgoaiVi)}` : ''}
              {tienTrongThe > 0 ? ` + Tiền thẻ ${formatMoney(tienTrongThe)}` : ''})
            </span>
          </div>
          <span className="font-extrabold text-emerald-800 text-sm tabular-nums font-money shrink-0">
            = {formatMoney(tongThucTe)}
          </span>
        </div>
      )}

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
            <span className="text-sm font-bold text-emerald-700 tabular-nums font-money">
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
            <span className="text-sm font-bold text-rose-600 tabular-nums font-money">
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
            <span className={`text-base font-extrabold tabular-nums font-money ${
              netBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}>
              {netBalance >= 0 ? '+' : ''}{formatMoney(netBalance)}
            </span>
          </div>
        </div>

        {/* HÀNG 4: TIỀN NGOÀI VÍ (TIỀN MẶT TỰ ĐIỀN) */}
        <div className="flex items-center justify-between p-3 bg-amber-50/40 hover:bg-amber-50/70 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
              <Money size={18} weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-amber-950 block">Tiền Ngoài Ví</span>
                <span className="text-[10px] font-semibold bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded">
                  Tiền mặt
                </span>
              </div>
              <span className="text-[11px] text-amber-700/80">Tự điền thủ công</span>
            </div>
          </div>

          <div className="text-right flex items-center gap-1.5">
            {isEditingCash ? (
              <div className="flex items-center gap-1">
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
                  className="w-24 text-right text-xs font-bold text-amber-950 bg-white border border-amber-300 rounded-lg py-1 px-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 tabular-nums"
                />
                <button
                  type="button"
                  onClick={handleSaveCash}
                  className="p-1 bg-amber-700 text-white rounded-lg text-xs"
                >
                  <Check size={14} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={handleCancelCash}
                  className="p-1 bg-slate-200 text-slate-700 rounded-lg text-xs"
                >
                  <X size={14} weight="bold" />
                </button>
              </div>
            ) : (
              <div 
                onClick={handleStartEditCash}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <span className="text-sm font-bold text-amber-900 tabular-nums font-money">
                  {formatMoney(tienNgoaiVi)}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEditCash();
                  }}
                  className="w-6 h-6 rounded-md bg-white border border-amber-200 text-amber-700 flex items-center justify-center hover:bg-amber-100"
                  title="Chỉnh sửa tiền mặt ngoài ví"
                >
                  <PencilSimple size={12} weight="bold" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* HÀNG 5: TIỀN TRONG THẺ (THẺ NGÂN HÀNG TỰ ĐIỀN) */}
        <div className="flex items-center justify-between p-3 bg-blue-50/40 hover:bg-blue-50/70 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
              <CreditCard size={18} weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-blue-950 block">Tiền Trong Thẻ</span>
                <span className="text-[10px] font-semibold bg-blue-200/80 text-blue-900 px-1.5 py-0.2 rounded">
                  Thẻ ATM
                </span>
              </div>
              <span className="text-[11px] text-blue-700/80">Tự điền thủ công</span>
            </div>
          </div>

          <div className="text-right flex items-center gap-1.5">
            {isEditingCard ? (
              <div className="flex items-center gap-1">
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
                  className="w-24 text-right text-xs font-bold text-blue-950 bg-white border border-blue-300 rounded-lg py-1 px-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 tabular-nums"
                />
                <button
                  type="button"
                  onClick={handleSaveCard}
                  className="p-1 bg-blue-700 text-white rounded-lg text-xs"
                >
                  <Check size={14} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={handleCancelCard}
                  className="p-1 bg-slate-200 text-slate-700 rounded-lg text-xs"
                >
                  <X size={14} weight="bold" />
                </button>
              </div>
            ) : (
              <div 
                onClick={handleStartEditCard}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <span className="text-sm font-bold text-blue-900 tabular-nums font-money">
                  {formatMoney(tienTrongThe)}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEditCard();
                  }}
                  className="w-6 h-6 rounded-md bg-white border border-blue-200 text-blue-700 flex items-center justify-center hover:bg-blue-100"
                  title="Chỉnh sửa tiền trong thẻ"
                >
                  <PencilSimple size={12} weight="bold" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* HÀNG 6: TỔNG THỰC CÓ (NẾU CÓ TIỀN NGOÀI VÍ HOẶC TIỀN TRONG THẺ) */}
        {(tienNgoaiVi > 0 || tienTrongThe > 0) && (
          <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-emerald-50 via-blue-50/30 to-amber-50/30 text-xs">
            <span className="text-slate-700 font-semibold">Tổng thực có (Gồm tiền mặt & thẻ):</span>
            <span className="font-extrabold text-emerald-800 tabular-nums text-sm font-money">
              {formatMoney(tongThucTe)}
            </span>
          </div>
        )}

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

