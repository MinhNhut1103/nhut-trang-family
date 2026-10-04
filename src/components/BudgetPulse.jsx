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
  Heart,
  Smiley
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
  const huongThuSpent = currentTransactions
    .filter(t => t.loai === 'hưởng thụ')
    .reduce((s, t) => s + (Number(t.chi) || 0), 0);

  const handleSaveBanner = () => {
    setMonthlyConfig(prev => ({ ...prev, banner_focus: bannerInput }));
    setIsEditingBanner(false);
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-5">
      
      {/* 1. APPLE COZY BANNER: MỤC TIÊU THÁNG ("GIẢM MUA ĐỒ") */}
      <div className="mb-6 p-4 md:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-200 shadow-xl shadow-amber-950/20 backdrop-blur-xl relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
            <Heart size={20} weight="fill" className="text-amber-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Tâm Niệm Tháng 10
              </span>

              {isEditingBanner ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={bannerInput}
                    onChange={(e) => setBannerInput(e.target.value)}
                    className="bg-slate-900 border border-amber-400 rounded-xl px-3 py-1 text-sm text-white focus:outline-none"
                    placeholder="giảm mua đồ..."
                  />
                  <button
                    onClick={handleSaveBanner}
                    className="p-1.5 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 tactile-btn"
                  >
                    <Check size={16} weight="bold" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-base md:text-lg font-bold text-white tracking-tight">
                    "{monthlyConfig.banner_focus || 'giảm mua đồ'}"
                  </span>
                  <button
                    onClick={() => setIsEditingBanner(true)}
                    className="p-1 rounded-lg text-amber-400/70 hover:text-amber-200 hover:bg-amber-500/10 transition-colors"
                    title="Chỉnh sửa khẩu hiệu tháng"
                  >
                    <PencilSimple size={14} />
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-amber-200/80 mt-0.5">
              Cùng nhau tiết chế mua sắm không cần thiết để vun vén cho những mục tiêu lớn hơn của tổ ấm.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs bg-slate-900/60 px-3.5 py-1.5 rounded-2xl border border-white/[0.08]">
          <span className="text-slate-400">Đang xem:</span>
          <strong className="text-emerald-400">
            {activeVault === 'shared' ? '🌿 Quỹ Chung Tổ Ấm' : `🔒 Ví Riêng ${activeUser === 'nhut' ? 'Nhựt' : 'Trang'}`}
          </strong>
        </div>
      </div>

      {/* 2. BENTO CARDS: APPLE SOFT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        
        {/* Card 1: Tổng Thu */}
        <div className="glass-panel p-6 rounded-3xl border border-white/[0.08] relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">TỔNG THU NHẬP</span>
            <div className="w-8 h-8 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <TrendUp size={18} weight="bold" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 tabular-nums my-1">
            +{formatMoney(totalThu)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {currentTransactions.filter(t => (t.thu || 0) > 0).length} khoản thu (phí web, ads, hoàn tiền...)
          </p>
        </div>

        {/* Card 2: Tổng Chi */}
        <div className="glass-panel p-6 rounded-3xl border border-white/[0.08] relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">TỔNG CHI TIÊU</span>
            <div className="w-8 h-8 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
              <TrendDown size={18} weight="bold" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tabular-nums my-1">
            -{formatMoney(totalChi)}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Thiết yếu: <strong className="text-slate-200 font-semibold">{formatMoney(thietYeuSpent)}</strong></span>
            <span>•</span>
            <span>Hưởng thụ: <strong className="text-slate-200 font-semibold">{formatMoney(huongThuSpent)}</strong></span>
          </div>
        </div>

        {/* Card 3: Số Dư Dòng Tiền (Net Flow) */}
        <div className={`glass-panel p-6 rounded-3xl border relative overflow-hidden transition-all ${
          netBalance >= 0 
            ? 'border-emerald-500/30 bg-emerald-950/20' 
            : 'border-rose-500/30 bg-rose-950/20'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">DÒNG TIỀN DƯ HIỆN TẠI</span>
            <div className={`w-8 h-8 rounded-2xl flex items-center justify-center ${
              netBalance >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
            }`}>
              <Wallet size={18} weight="bold" />
            </div>
          </div>
          <div className={`text-3xl font-extrabold tabular-nums my-1 ${
            netBalance >= 0 ? 'text-white' : 'text-rose-400'
          }`}>
            {netBalance >= 0 ? '+' : ''}{formatMoney(netBalance)}
          </div>
          <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
            <Sparkle size={14} className="text-amber-400" weight="fill" />
            {netBalance >= 0 ? 'Dòng tiền tổ ấm đang rất an tâm' : 'Chi tiêu đang vượt thu nhập, hãy chú ý nhé'}
          </p>
        </div>

      </div>

    </section>
  );
}
