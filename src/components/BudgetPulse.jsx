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

  const totalThu = transactions.reduce((sum, t) => sum + (Number(t.thu) || 0), 0);
  const totalChi = transactions.reduce((sum, t) => sum + (Number(t.chi) || 0), 0);
  const netBalance = totalThu - totalChi;

  return (
    <section className="w-full max-w-5xl mx-auto px-4 md:px-8 pt-4 pb-2">
      
      {/* 1. TIÊU ĐỀ & TỔNG KẾT THÁNG */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">
            Tổng Quan Thu Chi Gia Đình
          </h2>
        </div>
        <div className="text-xs text-slate-600 font-medium bg-slate-100/90 px-3 py-1 rounded-xl border border-slate-200">
          Tháng 10/2026 • <strong className="text-slate-800 tabular-nums">{transactions.length}</strong> khoản ghi chép
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
