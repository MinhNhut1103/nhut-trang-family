import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  TrendUp, 
  TrendDown,
  Wallet, 
  PiggyBank, 
  Sparkle, 
  CalendarCheck,
  ShieldCheck,
  Bicycle,
  AirplaneTilt,
  Plus,
  PencilSimple,
  Check,
  Tag
} from '@phosphor-icons/react';

export default function BudgetPulse({ 
  monthlyConfig,
  setMonthlyConfig,
  transactions, 
  activeVault, 
  activeUser, 
  privacyMode,
  onAddContribution 
}) {
  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const [bannerInput, setBannerInput] = useState(monthlyConfig.banner_focus || 'giảm mua đồ');

  const formatMoney = (val) => {
    if (privacyMode) return '•••••••• ₫';
    return new Intl.NumberFormat('vi-VN').format(val) + ' ₫';
  };

  // Filter transactions for current view
  const currentTransactions = transactions.filter(t => {
    if (activeVault === 'shared') return t.vault === 'shared';
    return t.vault === `personal_${activeUser}`;
  });

  const totalThu = currentTransactions.reduce((sum, t) => sum + (Number(t.thu) || 0), 0);
  const totalChi = currentTransactions.reduce((sum, t) => sum + (Number(t.chi) || 0), 0);
  const netBalance = totalThu - totalChi;

  // Macro type breakdown (Thiết yếu vs Công việc vs Hưởng thụ)
  const thietYeuSpent = currentTransactions
    .filter(t => t.loai === 'thiết yếu')
    .reduce((s, t) => s + (Number(t.chi) || 0), 0);
  const congViecSpent = currentTransactions
    .filter(t => t.loai === 'công việc')
    .reduce((s, t) => s + (Number(t.chi) || 0), 0);
  const huongThuSpent = currentTransactions
    .filter(t => t.loai === 'hưởng thụ')
    .reduce((s, t) => s + (Number(t.chi) || 0), 0);

  const totalExpenseAll = totalChi || 1;
  const thietYeuPct = Math.round((thietYeuSpent / totalExpenseAll) * 100);
  const huongThuPct = Math.round((huongThuSpent / totalExpenseAll) * 100);

  const handleSaveBanner = () => {
    setMonthlyConfig(prev => ({ ...prev, banner_focus: bannerInput }));
    setIsEditingBanner(false);
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-5">
      
      {/* 1. ROW BANNER CHÚ Ý CỦA THÁNG (GIỐNG DÒNG MÀU VÀNG "GIẢM MUA ĐỒ" TRONG BẢNG CỦA BẠN) */}
      <div className="mb-5 p-3.5 md:p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-300 shadow-lg shadow-amber-950/20">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-extrabold text-xs tracking-wider uppercase shadow-sm">
            Mục Tiêu Tháng 10
          </span>

          {isEditingBanner ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={bannerInput}
                onChange={(e) => setBannerInput(e.target.value)}
                className="bg-slate-900 border border-amber-400 rounded-lg px-2.5 py-1 text-sm text-white focus:outline-none"
                placeholder="giảm mua đồ..."
              />
              <button
                onClick={handleSaveBanner}
                className="p-1 rounded-md bg-amber-500 text-slate-950 hover:bg-amber-400"
              >
                <Check size={16} weight="bold" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm md:text-base font-bold text-white tracking-wide">
                "{monthlyConfig.banner_focus || 'giảm mua đồ'}"
              </span>
              <button
                onClick={() => setIsEditingBanner(true)}
                className="text-amber-400/80 hover:text-amber-200 text-xs flex items-center gap-1"
                title="Sửa khẩu hiệu tháng"
              >
                <PencilSimple size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-amber-200/90">
          <span>Không gian hiện tại: <strong className="text-white">{activeVault === 'shared' ? 'Quỹ Chung Tổ Ấm' : `Ví Riêng ${activeUser === 'nhut' ? 'Nhựt' : 'Trang'}`}</strong></span>
        </div>
      </div>

      {/* 2. BENTO CARDS: 3 THẺ TỔNG THU - TỔNG CHI - SỐ DƯ RÒNG */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        
        {/* Card 1: Tổng Thu */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">TỔNG THU (THÁNG 10)</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendUp size={16} weight="bold" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-400 tabular-nums my-1">
            +{formatMoney(totalThu)}
          </div>
          <p className="text-[11px] text-slate-400">
            {currentTransactions.filter(t => (t.thu || 0) > 0).length} nguồn thu (phí web, ads, hoàn tiền...)
          </p>
        </div>

        {/* Card 2: Tổng Chi */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">TỔNG CHI (THÁNG 10)</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <TrendDown size={16} weight="bold" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-rose-400 tabular-nums my-1">
            -{formatMoney(totalChi)}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Thiết yếu: <strong className="text-slate-200">{formatMoney(thietYeuSpent)}</strong></span>
            <span>•</span>
            <span>Hưởng thụ: <strong className="text-slate-200">{formatMoney(huongThuSpent)}</strong></span>
          </div>
        </div>

        {/* Card 3: Số Dư Ròng (Net Balance) */}
        <div className={`glass-panel p-5 rounded-2xl border relative overflow-hidden ${
          netBalance >= 0 ? 'border-emerald-500/30 bg-emerald-950/15' : 'border-rose-500/30 bg-rose-950/15'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">DÒNG TIỀN DƯ CÒN LẠI</span>
            <div className={`p-1.5 rounded-lg ${netBalance >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
              <Wallet size={16} weight="bold" />
            </div>
          </div>
          <div className={`text-2xl md:text-3xl font-extrabold tabular-nums my-1 ${
            netBalance >= 0 ? 'text-white' : 'text-rose-400'
          }`}>
            {netBalance >= 0 ? '+' : ''}{formatMoney(netBalance)}
          </div>
          <p className="text-[11px] text-slate-300">
            {netBalance >= 0 ? 'Dòng tiền dương lành mạnh ✨' : 'Cần thắt chặt chi tiêu để không thâm hụt'}
          </p>
        </div>

      </div>

    </section>
  );
}
