import React, { useState, useEffect } from 'react';
import { 
  BellRinging, 
  Plus, 
  Check, 
  X, 
  CalendarCheck,
  Sparkle
} from '@phosphor-icons/react';
import { formatDateDisplay } from '../data/initialData';

export default function DailyReminderCard({
  transactions = [],
  onOpenAddTransaction,
  onShowToast
}) {
  const getTodayISO = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayISO = getTodayISO();
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem(`nt_dismiss_reminder_${todayISO}`) === 'true';
  });

  // Kiểm tra xem hôm nay đã có giao dịch nào chưa
  const todayTransactions = transactions.filter(t => {
    if (!t.ngay) return false;
    const cleanDate = t.ngay.split('T')[0].trim();
    return cleanDate === todayISO;
  });

  const hasRecordedToday = todayTransactions.length > 0;

  // Nếu hôm nay đã có giao dịch hoặc người dùng đã bấm bỏ qua hôm nay -> Không hiện card
  if (hasRecordedToday || isDismissed) {
    return null;
  }

  const handleDismissForToday = () => {
    setIsDismissed(true);
    localStorage.setItem(`nt_dismiss_reminder_${todayISO}`, 'true');
    if (onShowToast) {
      onShowToast('Đã ghi nhận hôm nay không phát sinh chi tiêu!');
    }
  };

  const handleClose = () => {
    setIsDismissed(true);
    localStorage.setItem(`nt_dismiss_reminder_${todayISO}`, 'true');
  };

  return (
    <section className="w-full max-w-5xl mx-auto px-4 md:px-8 animate-fade-in">
      <div className="card-soft p-3.5 sm:p-4 bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-white border border-amber-200/90 shadow-2xs relative overflow-hidden">
        
        {/* Họa tiết trang trí góc mờ nhẹ */}
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-100/30 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3">
          
          {/* Cột trái: Icon chuông báo + Nội dung */}
          <div className="flex items-start gap-3 min-w-0">
            
            {/* Icon chuông lắc nhẹ */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200/80 shadow-2xs mt-0.5 relative">
              <BellRinging size={20} weight="fill" className="text-amber-700 animate-pulse" />
              {/* Chấm đỏ lôi cuốn */}
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  Hôm nay chưa có ghi nhận thu chi nào!
                </h4>
                <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200/70 tabular-nums">
                  {formatDateDisplay(todayISO)}
                </span>
              </div>

              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-normal">
                Đừng quên ghi chép các khoản chi tiêu nhỏ (cà phê, cơm trưa, đi chợ, xăng xe...) để số dư sổ luôn chuẩn xác nhé!
              </p>

              {/* Nút hành động trực tiếp */}
              <div className="flex items-center gap-2 pt-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={onOpenAddTransaction}
                  className="py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs tactile-btn transition-colors cursor-pointer"
                >
                  <Plus size={14} weight="bold" />
                  <span>Ghi thu chi ngay</span>
                </button>

                <button
                  type="button"
                  onClick={handleDismissForToday}
                  className="py-1.5 px-2.5 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl text-xs font-medium shadow-2xs tactile-btn transition-colors cursor-pointer"
                  title="Hôm nay tôi không tiêu gì"
                >
                  <span>Hôm nay không chi tiêu</span>
                </button>
              </div>
            </div>

          </div>

          {/* Nút tắt thông báo */}
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white/80 rounded-xl transition-colors shrink-0 cursor-pointer"
            title="Đóng thông báo hôm nay"
          >
            <X size={16} weight="bold" />
          </button>

        </div>

      </div>
    </section>
  );
}
