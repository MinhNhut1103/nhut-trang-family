import React, { useState, useMemo } from 'react';
import { 
  BellRinging, 
  Plus, 
  Check, 
  CalendarCheck,
  Calendar,
  Sparkle,
  WarningCircle,
  Clock,
  ArrowRight
} from '@phosphor-icons/react';
import { formatDateDisplay } from '../data/initialData';

export default function DailyReminderCard({
  transactions = [],
  onOpenAddTransaction,
  onShowToast
}) {
  // Danh sách các ngày người dùng đã xác nhận "Không có chi tiêu" (lưu localStorage)
  const [zeroExpenseDays, setZeroExpenseDays] = useState(() => {
    try {
      const saved = localStorage.getItem('nt_zero_expense_days');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Tìm các ngày chưa ghi chép (quét từ 7 ngày gần đây đến hôm nay)
  const missingDays = useMemo(() => {
    const list = [];
    const now = new Date();

    // Quét ngược 7 ngày (từ 6 ngày trước đến hôm nay = index 0)
    for (let i = 0; i <= 6; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateISO = `${y}-${m}-${day}`;

      // Nếu ngày này đã được người dùng đánh dấu là "Không chi tiêu" -> Bỏ qua
      if (zeroExpenseDays.includes(dateISO)) {
        continue;
      }

      // Kiểm tra xem trong sổ đã có giao dịch nào cho ngày này chưa
      const hasTx = transactions.some(t => {
        if (!t.ngay) return false;
        const clean = t.ngay.split('T')[0].trim();
        return clean === dateISO;
      });

      if (!hasTx) {
        list.push({
          iso: dateISO,
          dayNum: day,
          monthNum: m,
          yearNum: y,
          isToday: i === 0,
          isYesterday: i === 1,
          relativeLabel: i === 0 ? 'Hôm nay' : i === 1 ? 'Hôm qua' : `${i} ngày trước`
        });
      }
    }

    return list;
  }, [transactions, zeroExpenseDays]);

  // Nếu tất cả các ngày đều đã được điền hoặc xử lý xong -> Ẩn thẻ nhắc nhở
  if (missingDays.length === 0) {
    return null;
  }

  // Đánh dấu 1 ngày cụ thể là "Không chi tiêu" (đã xử lý xong)
  const handleMarkZeroExpense = (dateISO) => {
    const updated = [...new Set([...zeroExpenseDays, dateISO])];
    setZeroExpenseDays(updated);
    localStorage.setItem('nt_zero_expense_days', JSON.stringify(updated));
    if (onShowToast) {
      onShowToast(`Đã xác nhận ngày ${formatDateDisplay(dateISO)} không có chi tiêu`);
    }
  };

  // Đánh dấu tất cả các ngày còn thiếu là "Không chi tiêu"
  const handleMarkAllZeroExpense = () => {
    const allMissedISOs = missingDays.map(d => d.iso);
    const updated = [...new Set([...zeroExpenseDays, ...allMissedISOs])];
    setZeroExpenseDays(updated);
    localStorage.setItem('nt_zero_expense_days', JSON.stringify(updated));
    if (onShowToast) {
      onShowToast(`Đã đánh dấu xong ${allMissedISOs.length} ngày không phát sinh chi tiêu!`);
    }
  };

  return (
    <section className="w-full max-w-5xl mx-auto px-4 md:px-8 animate-fade-in">
      <div className="card-soft p-3.5 sm:p-4.5 bg-gradient-to-r from-amber-50/90 via-orange-50/30 to-white border border-amber-300/80 shadow-2xs space-y-3 relative overflow-hidden">
        
        {/* Họa tiết trang trí nhẹ */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl pointer-events-none" />

        {/* PHẦN 1: HEADER THÔNG BÁO VỚI SỐ LƯỢNG NGÀY CHƯA ĐIỀN */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            
            {/* Icon chuông lắc nhắc nhở */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200 shadow-2xs mt-0.5 relative">
              <BellRinging size={20} weight="fill" className="text-amber-700 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                {missingDays.length}
              </span>
            </div>

            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  Nhắc nhở: Bạn có {missingDays.length} ngày chưa ghi nhận thu chi!
                </h4>
                <span className="text-[10px] sm:text-[11px] font-semibold bg-amber-100/90 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200/80">
                  Nhắc cho tới khi hoàn tất
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-normal">
                Để số dư và báo cáo không bị sót tiền, vui lòng bấm ghi chép hoặc xác nhận ngày không tiêu dưới đây:
              </p>
            </div>

          </div>

          {/* Nút xử lý nhanh tất cả nếu không tiêu gì */}
          {missingDays.length > 1 && (
            <button
              type="button"
              onClick={handleMarkAllZeroExpense}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-xl transition-colors shrink-0 shadow-2xs hidden sm:inline-flex items-center gap-1 cursor-pointer"
              title="Xác nhận tất cả các ngày trên không phát sinh chi tiêu"
            >
              <Check size={13} weight="bold" />
              <span>Xác nhận tất cả 0đ</span>
            </button>
          )}
        </div>

        {/* PHẦN 2: DANH SÁCH CHI TIẾT TỪNG NGÀY CHƯA ĐIỀN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {missingDays.map((day) => (
            <div 
              key={day.iso}
              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
                day.isToday 
                  ? 'bg-amber-100/40 border-amber-300/80 shadow-2xs' 
                  : 'bg-white/95 border-amber-200/70 hover:border-amber-300'
              }`}
            >
              {/* Thông tin ngày */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                  day.isToday ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Calendar size={16} weight="bold" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
                      {formatDateDisplay(day.iso)}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      day.isToday 
                        ? 'bg-rose-100 text-rose-700 font-bold' 
                        : day.isYesterday 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {day.relativeLabel}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Chưa có khoản thu chi nào
                  </span>
                </div>
              </div>

              {/* Nút hành động cho ngày này: tách riêng dòng trên mobile cho thoáng */}
              <div className="flex items-center gap-2 w-full sm:w-auto pt-2 border-t border-amber-200/40 sm:border-t-0 sm:pt-0 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenAddTransaction && onOpenAddTransaction(day.iso)}
                  className="flex-1 sm:flex-none py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs tactile-btn transition-colors cursor-pointer"
                  title={`Ghi thu chi cho ngày ${formatDateDisplay(day.iso)}`}
                >
                  <Plus size={13} weight="bold" />
                  <span>Ghi ngày này</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMarkZeroExpense(day.iso)}
                  className="py-1.5 px-2.5 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
                  title="Ngày này không có phát sinh chi tiêu (0đ)"
                >
                  <span>0đ</span>
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Nút phụ trên mobile nếu có nhiều ngày */}
        {missingDays.length > 1 && (
          <div className="sm:hidden pt-1 flex justify-end">
            <button
              type="button"
              onClick={handleMarkAllZeroExpense}
              className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer w-full justify-center"
            >
              <Check size={13} weight="bold" />
              <span>Xác nhận tất cả ngày trên đều 0đ</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
