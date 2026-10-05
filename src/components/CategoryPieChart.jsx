import React, { useState, useMemo } from 'react';
import { 
  ChartPieSlice, 
  TrendUp, 
  TrendDown, 
  CaretDown, 
  CaretUp,
  Tag,
  Receipt
} from '@phosphor-icons/react';

// Bảng màu rực rỡ, trang nhã cho các phân loại
const CATEGORY_COLORS = {
  'ăn uống': '#10B981',       // Emerald
  'di chuyển': '#3B82F6',      // Blue
  'nhà cửa': '#F59E0B',        // Amber
  'mua sắm': '#EC4899',        // Pink
  'sức khỏe': '#EF4444',       // Red
  'giải trí': '#8B5CF6',       // Purple
  'học tập': '#06B6D4',        // Cyan
  'con cái': '#F97316',        // Orange
  'tiết kiệm': '#14B8A6',      // Teal
  'đầu tư': '#6366F1',        // Indigo
  'hóa đơn': '#84CC16',        // Lime
  'tiền lương': '#10B981',     // Green
  'thưởng': '#F59E0B',         // Amber
  'khác': '#64748B'            // Slate
};

const FALLBACK_COLORS = [
  '#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', 
  '#06B6D4', '#F97316', '#14B8A6', '#6366F1', '#84CC16',
  '#D946EF', '#E11D48', '#0D9488', '#EA580C', '#4F46E5'
];

export default function CategoryPieChart({
  transactions = [],
  privacyMode = false,
  currentMonth = '2026-10'
}) {
  const [viewType, setViewType] = useState('chi'); // 'chi' | 'thu'
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Lọc và tính tổng theo từng phân loại
  const { dataList, totalAmount } = useMemo(() => {
    const isExpense = viewType === 'chi';
    const filtered = transactions.filter(t => isExpense ? (Number(t.chi) > 0) : (Number(t.thu) > 0));

    const map = {};
    let total = 0;

    filtered.forEach(t => {
      const cat = (t.phan_loai || 'Khác').trim();
      const amount = isExpense ? Number(t.chi) : Number(t.thu);
      if (!map[cat]) {
        map[cat] = {
          name: cat,
          amount: 0,
          count: 0
        };
      }
      map[cat].amount += amount;
      map[cat].count += 1;
      total += amount;
    });

    // Chuyển thành danh sách và sắp xếp từ nhiều nhất đến ít nhất
    const list = Object.values(map)
      .sort((a, b) => b.amount - a.amount)
      .map((item, index) => {
        const percent = total > 0 ? (item.amount / total) * 100 : 0;
        const normalizedName = item.name.toLowerCase();
        const color = CATEGORY_COLORS[normalizedName] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
        return {
          ...item,
          percent,
          color,
          rank: index + 1
        };
      });

    return { dataList: list, totalAmount: total };
  }, [transactions, viewType]);

  const formatMoney = (val) => {
    if (privacyMode) return '•••••• đ';
    return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  };

  // Tính toán các lát cắt hình tròn SVG (Donut Chart)
  const chartSlices = useMemo(() => {
    if (totalAmount <= 0 || dataList.length === 0) return [];

    let currentAngle = -Math.PI / 2; // Bắt đầu ở đỉnh 12h
    const size = 240;
    const center = size / 2; // 120
    const outerRadius = 110;
    const innerRadius = 78; // Lỗ trong rộng rãi (đường kính 156px), chữ hoàn toàn không bị chạm hay che

    // Nếu chỉ có đúng 1 danh mục chiếm 100%
    if (dataList.length === 1) {
      return [{
        ...dataList[0],
        isFullCircle: true,
        center,
        outerRadius,
        innerRadius
      }];
    }

    return dataList.map((item) => {
      const sliceAngle = (item.amount / totalAmount) * (2 * Math.PI);
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      currentAngle = endAngle;

      // Tọa độ góc cho SVG path
      const x1 = center + outerRadius * Math.cos(startAngle);
      const y1 = center + outerRadius * Math.sin(startAngle);
      const x2 = center + outerRadius * Math.cos(endAngle);
      const y2 = center + outerRadius * Math.sin(endAngle);

      const x3 = center + innerRadius * Math.cos(endAngle);
      const y3 = center + innerRadius * Math.sin(endAngle);
      const x4 = center + innerRadius * Math.cos(startAngle);
      const y4 = center + innerRadius * Math.sin(startAngle);

      const largeArc = sliceAngle > Math.PI ? 1 : 0;

      const pathData = [
        `M ${x1} ${y1}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
        'Z'
      ].join(' ');

      return {
        ...item,
        pathData,
        startAngle,
        endAngle,
        midAngle: startAngle + sliceAngle / 2
      };
    });
  }, [dataList, totalAmount]);

  const activeItem = hoveredCategory 
    ? dataList.find(d => d.name === hoveredCategory) 
    : null;

  return (
    <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-2">
      <div className="card-soft p-4 md:p-5 border border-slate-200/90 shadow-2xs">
        
        {/* TIÊU ĐỀ & CHỌN LOẠI THU / CHI */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
              <ChartPieSlice size={18} weight="duotone" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>Cơ cấu {viewType === 'chi' ? 'chi tiêu' : 'thu nhập'} theo danh mục</span>
                <span className="text-[11px] font-semibold text-slate-400 font-normal">
                  ({dataList.length} mục)
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Nhận biết phân loại nào chiếm tỷ trọng nhiều hay ít nhất
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {/* Toggle Thu / Chi */}
            <div className="inline-flex rounded-xl p-0.5 bg-slate-100 border border-slate-200/80 text-xs">
              <button
                type="button"
                onClick={() => { setViewType('chi'); setHoveredCategory(null); }}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  viewType === 'chi'
                    ? 'bg-white text-rose-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Khoản Chi
              </button>
              <button
                type="button"
                onClick={() => { setViewType('thu'); setHoveredCategory(null); }}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  viewType === 'thu'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Khoản Thu
              </button>
            </div>

            {/* Nút thu gọn / mở rộng */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              title={isCollapsed ? 'Mở rộng biểu đồ' : 'Thu gọn biểu đồ'}
            >
              {isCollapsed ? <CaretDown size={16} weight="bold" /> : <CaretUp size={16} weight="bold" />}
            </button>
          </div>
        </div>

        {/* NỘI DUNG BIỂU ĐỒ & DANH SÁCH CHI TIẾT */}
        {!isCollapsed && (
          <div className="pt-4">
            {totalAmount <= 0 || dataList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Chưa có dữ liệu {viewType === 'chi' ? 'chi tiêu' : 'thu nhập'} nào trong tháng này để vẽ biểu đồ.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* CỘT 1: BIỂU ĐỒ TRÒN DONUT CHART (TO HƠN, RỘNG RÃI, KHÔNG BỊ CHE CHỮ) */}
                <div className="md:col-span-5 flex flex-col items-center justify-center py-1">
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72">
                    <svg viewBox="0 0 240 240" className="w-full h-full transform -rotate-90">
                      {chartSlices.map((slice, idx) => {
                        const isHovered = hoveredCategory === slice.name;
                        
                        if (slice.isFullCircle) {
                          return (
                            <circle
                              key={idx}
                              cx={slice.center}
                              cy={slice.center}
                              r={(slice.outerRadius + slice.innerRadius) / 2}
                              fill="none"
                              stroke={slice.color}
                              strokeWidth={slice.outerRadius - slice.innerRadius}
                              className="cursor-pointer transition-opacity duration-200"
                              onMouseEnter={() => setHoveredCategory(slice.name)}
                              onMouseLeave={() => setHoveredCategory(null)}
                            />
                          );
                        }

                        return (
                          <path
                            key={idx}
                            d={slice.pathData}
                            fill={slice.color}
                            className={`cursor-pointer transition-all duration-200 ${
                              hoveredCategory && !isHovered ? 'opacity-40' : 'opacity-100'
                            } ${isHovered ? 'brightness-110 drop-shadow-md' : 'hover:opacity-90'}`}
                            stroke="#ffffff"
                            strokeWidth="2.5"
                            onMouseEnter={() => setHoveredCategory(slice.name)}
                            onMouseLeave={() => setHoveredCategory(null)}
                            onClick={() => setHoveredCategory(hoveredCategory === slice.name ? null : slice.name)}
                          />
                        );
                      })}
                    </svg>

                    {/* VÙNG THÔNG TIN TRUNG TÂM DONUT (RỘNG RÃI, CÂN ĐỐI, KHÔNG BỊ CHE) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
                      {activeItem ? (
                        <div className="flex flex-col items-center justify-center max-w-[145px] sm:max-w-[165px] space-y-0.5">
                          <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate w-full px-1">
                            {activeItem.name}
                          </span>
                          <span className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums leading-tight">
                            {activeItem.percent.toFixed(1)}%
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold text-slate-800 tabular-nums">
                            {formatMoney(activeItem.amount)}
                          </span>
                          <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                            {activeItem.count} giao dịch
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center max-w-[145px] sm:max-w-[165px] space-y-0.5">
                          <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Tổng {viewType === 'chi' ? 'Chi' : 'Thu'}
                          </span>
                          <span className={`text-base sm:text-lg font-black tabular-nums tracking-tight ${
                            viewType === 'chi' ? 'text-rose-600' : 'text-emerald-700'
                          }`}>
                            {formatMoney(totalAmount)}
                          </span>
                          <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium pt-0.5">
                            Rê chuột để xem
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* CỘT 2: DANH SÁCH BẢNG XẾP HẠNG NHIỀU / ÍT (DESKTOP: 7 CỘT) */}
                <div className="md:col-span-7 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 px-1 pb-1">
                    <span>XẾP HẠNG PHÂN LOẠI</span>
                    <span>TỶ TRỌNG & SỐ TIỀN</span>
                  </div>

                  <div className="max-h-72 sm:max-h-80 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                    {dataList.map((item) => {
                      const isHovered = hoveredCategory === item.name;

                      return (
                        <div
                          key={item.name}
                          onMouseEnter={() => setHoveredCategory(item.name)}
                          onMouseLeave={() => setHoveredCategory(null)}
                          onClick={() => setHoveredCategory(hoveredCategory === item.name ? null : item.name)}
                          className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isHovered
                              ? 'bg-slate-50 border-emerald-300 shadow-2xs scale-[1.01]'
                              : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            
                            {/* Tên mục + Rank + Dot màu */}
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                                item.rank === 1
                                  ? 'bg-amber-100 text-amber-800'
                                  : item.rank === 2
                                  ? 'bg-slate-200 text-slate-700'
                                  : item.rank === 3
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-slate-100 text-slate-500'
                              }`}>
                                {item.rank}
                              </span>

                              <div 
                                className="w-2.5 h-2.5 rounded-full shrink-0" 
                                style={{ backgroundColor: item.color }} 
                              />

                              <span className="text-xs font-bold text-slate-800 truncate">
                                {item.name}
                              </span>

                              <span className="text-[10px] text-slate-400 shrink-0">
                                ({item.count} gd)
                              </span>
                            </div>

                            {/* Tỷ trọng % và Tiền */}
                            <div className="flex items-center gap-2 shrink-0 text-right">
                              <span className="text-xs font-bold text-slate-700 tabular-nums">
                                {item.percent.toFixed(1)}%
                              </span>
                              <span className="text-xs font-extrabold text-slate-900 tabular-nums min-w-[70px]">
                                {formatMoney(item.amount)}
                              </span>
                            </div>

                          </div>

                          {/* Thanh phần trăm tiến trình tỷ trọng */}
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-300"
                              style={{ 
                                width: `${Math.max(item.percent, 2)}%`, 
                                backgroundColor: item.color 
                              }}
                            />
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
