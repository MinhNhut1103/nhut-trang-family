import React, { useState, useMemo } from 'react';
import { 
  BellRinging, 
  Plus, 
  Check, 
  Calendar,
  CaretDown,
  CaretUp
} from '@phosphor-icons/react';
import { formatDateDisplay } from '../data/initialData';

export default function DailyReminderCard({
  transactions = [],
  onOpenAddTransaction,
  onShowToast
}) {
  // Trạng thái mở rộng danh sách ngày chi tiết (mặc định thu gọn nhỏ gọn)
  const [isExpanded, setIsExpanded] = useState(false);

  // Danh sách các ngày người dùng đã xác nhận "Không có chi tiêu" (lưu sessionStorage)
  const [zeroExpenseDays, setZeroExpenseDays] = useState(() => {
    try {
      const saved = sessionStorage.getItem('nt_zero_expense_days');
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
    try {
      sessionStorage.setItem('nt_zero_expense_days', JSON.stringify(updated));
    } catch (e) {}
    if (onShowToast) {
      onShowToast(`Đã xác nhận ngày ${formatDateDisplay(dateISO)} không có chi tiêu`);
    }
  };

  // Đánh dấu tất cả các ngày còn thiếu là "Không chi tiêu"
  const handleMarkAllZeroExpense = () => {
    const allMissedISOs = missingDays.map(d => d.iso);
    const updated = [...new Set([...zeroExpenseDays, ...allMissedISOs])];
    setZeroExpenseDays(updated);
    try {
      sessionStorage.setItem('nt_zero_expense_days', JSON.stringify(updated));
    } catch (e) {}
    if (onShowToast) {
      onShowToast(`Đã đánh dấu xong ${allMissedISOs.length} ngày không phát sinh chi tiêu!`);
    }
  };

  const primaryMissingDay = missingDays[0];

  return (
    <section className="w-full max-w-5xl mx-auto px-4 md:px-8 animate-fade-in">
      <div className="card-soft p-2.5 sm:p-3 bg-gradient-to-r from-amber-50/90 via-orange-50/30 to-white border border-amber-300/80 shadow-2xs relative overflow-hidden transition-all">
        
        {/* THANH THÔNG BÁO GỌN NHẸ (DẠNG SLIM BAR) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Thông tin vắn tắt */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Icon chuông với số ngày chưa điền */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200 shadow-2xs relative">
              <BellRinging size={16} weight="fill" className="text-amber-700 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center ring-1 ring-white">
                {missingDays.length}
              </span>
            </div>

            <div className="min-w-0 flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-[13px] font-bold text-slate-900 whitespace-nowrap">
                Chưa ghi thu chi ({missingDays.length} ngày):
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {missingDays.slice(0, 3).map((d) => (
                  <span 
                    key={d.iso} 
                    className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                      d.isToday 
                        ? 'bg-rose-100 text-rose-700 border-rose-200' 
                        : d.isYesterday 
                        ? 'bg-orange-100 text-orange-800 border-orange-200' 
                        : 'bg-amber-100/80 text-amber-900 border-amber-200'
                    }`}
                  >
                    {d.relativeLabel} ({formatDateDisplay(d.iso)})
                  </span>
                ))}
                {missingDays.length > 3 && (
                  <span className="text-[10px] text-slate-500 font-medium">
                    +{missingDays.length - 3} ngày nữa
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Các nút hành động nhanh thu gọn */}
          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
            {/* Ghi ngày gần nhất */}
            {primaryMissingDay && (
              <button
                type="button"
                onClick={() => onOpenAddTransaction && onOpenAddTransaction(primaryMissingDay.iso)}
                className="py-1 px-2.5 sm:px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs tactile-btn transition-colors cursor-pointer"
                title={`Ghi thu chi cho ${primaryMissingDay.relativeLabel}`}
              >
                <Plus size={12} weight="bold" />
                <span>Ghi {primaryMissingDay.relativeLabel}</span>
              </button>
            )}

            {/* Xác nhận tất cả 0đ */}
            {missingDays.length > 1 && (
              <button
                type="button"
                onClick={handleMarkAllZeroExpense}
                className="py-1 px-2 sm:px-2.5 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                title="Xác nhận tất cả các ngày trên không phát sinh chi tiêu"
              >
                <Check size={12} weight="bold" />
                <span className="hidden sm:inline">Tất cả 0đ</span>
                <span className="sm:hidden">0đ</span>
              </button>
            )}

            {/* Nút bật/tắt xem danh sách chi tiết các ngày */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="py-1 px-2 bg-amber-100/60 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
              title={isExpanded ? 'Thu gọn danh sách' : 'Xem chi tiết các ngày chưa ghi'}
            >
              <span className="text-[11px] hidden md:inline">{isExpanded ? 'Thu gọn' : 'Chi tiết'}</span>
              {isExpanded ? <CaretUp size={13} weight="bold" /> : <CaretDown size={13} weight="bold" />}
            </button>
          </div>
        </div>

        {/* PHẦN DANH SÁCH CHI TIẾT (CHỈ HIỂN THỊ KHI BẤM XEM CHI TIẾT) */}
        {isExpanded && (
          <div className="mt-2.5 pt-2.5 border-t border-amber-200/60 space-y-1.5 animate-fade-in">
            <div className="text-[11px] text-slate-500 mb-1 flex items-center justify-between">
              <span>Bấm "Ghi ngày này" để nhập khoản thu chi, hoặc "0đ" nếu hôm đó không tiêu gì:</span>
              {missingDays.length > 1 && (
                <button
                  type="button"
                  onClick={handleMarkAllZeroExpense}
                  className="text-amber-800 font-semibold hover:underline"
                >
                  Xác nhận tất cả 0đ
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {missingDays.map((day) => (
                <div 
                  key={day.iso}
                  className={`px-2.5 py-1.5 rounded-lg border flex items-center justify-between gap-2 transition-all ${
                    day.isToday 
                      ? 'bg-amber-100/60 border-amber-300' 
                      : 'bg-white/90 border-amber-200/70 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar size={14} weight="bold" className="text-amber-700 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 tabular-nums">
                      {formatDateDisplay(day.iso)}
                    </span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                      day.isToday 
                        ? 'bg-rose-100 text-rose-700 font-bold' 
                        : day.isYesterday 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {day.relativeLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenAddTransaction && onOpenAddTransaction(day.iso)}
                      className="py-0.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <Plus size={11} weight="bold" />
                      <span>Ghi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMarkZeroExpense(day.iso)}
                      className="py-0.5 px-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded text-[11px] font-medium cursor-pointer"
                      title="Không có chi tiêu (0đ)"
                    >
                      0đ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
