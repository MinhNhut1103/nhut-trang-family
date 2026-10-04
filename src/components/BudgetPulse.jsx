import React from 'react';

export default function BudgetPulse({ 
  transactions, 
  activeVault, 
  setActiveVault,
  privacyMode 
}) {
  const formatMoney = (val) => {
    if (privacyMode) return '•••••• đ';
    return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  };

  // Lọc giao dịch theo không gian
  const currentTransactions = transactions.filter(t => {
    if (activeVault === 'all') return true;
    if (activeVault === 'shared') return t.vault === 'shared';
    if (activeVault === 'personal_nhut') return t.vault === 'personal_nhut';
    if (activeVault === 'personal_trang') return t.vault === 'personal_trang';
    return true;
  });

  const totalThu = currentTransactions.reduce((sum, t) => sum + (Number(t.thu) || 0), 0);
  const totalChi = currentTransactions.reduce((sum, t) => sum + (Number(t.chi) || 0), 0);
  const netBalance = totalThu - totalChi;

  return (
    <section className="w-full max-w-5xl mx-auto px-4 md:px-8 pt-4 pb-2">
      
      {/* 1. THANH CHUYỂN KHÔNG GIAN GỌN GÀNG */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveVault('all')}
            className={`px-3 py-1.5 rounded-lg font-medium tactile-btn transition-colors ${
              activeVault === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setActiveVault('shared')}
            className={`px-3 py-1.5 rounded-lg font-medium tactile-btn transition-colors ${
              activeVault === 'shared'
                ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quỹ chung
          </button>
          <button
            onClick={() => setActiveVault('personal_nhut')}
            className={`px-3 py-1.5 rounded-lg font-medium tactile-btn transition-colors ${
              activeVault === 'personal_nhut'
                ? 'bg-slate-800 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ví của Nhựt
          </button>
          <button
            onClick={() => setActiveVault('personal_trang')}
            className={`px-3 py-1.5 rounded-lg font-medium tactile-btn transition-colors ${
              activeVault === 'personal_trang'
                ? 'bg-pink-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ví của Trang
          </button>
        </div>

        <div className="text-xs text-slate-500">
          Tháng 10/2026 • {currentTransactions.length} mục ghi chép
        </div>
      </div>

      {/* 2. TÓM TẮT 3 CON SỐ: TỔNG THU - TỔNG CHI - CÒN LẠI */}
      <div className="grid grid-cols-3 gap-3 mb-2">
        
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
          <div className="text-base md:text-xl font-bold text-slate-800 tabular-nums">
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

    </section>
  );
}
