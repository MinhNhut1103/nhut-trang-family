import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChartPieSlice, 
  ChartBar,
  CaretDown, 
  CaretUp,
  CalendarBlank,
  Receipt,
  TrendUp,
  TrendDown
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
  currentMonth = '2026-10',
  availableMonths = [],
  onChangeMonth = null
}) {
  const [viewType, setViewType] = useState('chi'); // 'chi' | 'thu'
  const [chartType, setChartType] = useState('donut'); // 'donut' | 'bar'
  const [selectedMonth, setSelectedMonth] = useState(currentMonth || '2026-10');
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Đồng bộ selectedMonth khi prop currentMonth bên ngoài thay đổi
  useEffect(() => {
    if (currentMonth) {
      setSelectedMonth(currentMonth);
    }
  }, [currentMonth]);

  // Danh sách các tháng để chọn bộ lọc
  const monthFilterOptions = useMemo(() => {
    const set = new Set(availableMonths || []);
    if (currentMonth) set.add(currentMonth);
    (transactions || []).forEach((t) => {
      if (t.ngay && t.ngay.length >= 7) {
        set.add(t.ngay.slice(0, 7));
      }
    });

    const sorted = Array.from(set).sort().reverse();
    const options = sorted.map((m) => {
      const [y, mm] = m.split('-');
      return {
        value: m,
        label: `Tháng ${mm}/${y}`
      };
    });

    return [
      ...options,
      { value: 'all', label: 'Tất cả các tháng' }
    ];
  }, [availableMonths, currentMonth, transactions]);

  // Lọc giao dịch theo tháng đã chọn và tính toán cơ cấu
  const { dataList, totalAmount } = useMemo(() => {
    const isExpense = viewType === 'chi';

    // 1. Lọc theo tháng
    const monthFiltered = (transactions || []).filter((t) => {
      if (!t.ngay) return false;
      if (selectedMonth === 'all') return true;
      return t.ngay.startsWith(selectedMonth);
    });

    // 2. Lọc theo Khoản Chi hoặc Khoản Thu
    const typeFiltered = monthFiltered.filter(t => 
      isExpense ? (Number(t.chi) > 0) : (Number(t.thu) > 0)
    );

    const map = {};
    let total = 0;

    typeFiltered.forEach(t => {
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
  }, [transactions, selectedMonth, viewType]);

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
    const innerRadius = 78;

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

  // Tính toán các cột cho Biểu đồ Cột SVG (Bar Chart)
  const barChartData = useMemo(() => {
    if (totalAmount <= 0 || dataList.length === 0) return { items: [], maxAmount: 1 };

    // Lấy tối đa 6 danh mục hàng đầu để hiển thị cột trực quan nhất
    const topCategories = dataList.slice(0, 6);
    const maxAmount = Math.max(...topCategories.map(d => d.amount), 1);

    const svgWidth = 320;
    const svgHeight = 220;
    const topMargin = 28;
    const bottomMargin = 42;
    const chartHeight = svgHeight - topMargin - bottomMargin;
    const leftMargin = 12;
    const rightMargin = 12;
    const availableWidth = svgWidth - leftMargin - rightMargin;

    const slotWidth = availableWidth / topCategories.length;
    const barWidth = Math.min(Math.max(slotWidth * 0.58, 22), 40);

    const items = topCategories.map((item, idx) => {
      const height = (item.amount / maxAmount) * chartHeight;
      const x = leftMargin + idx * slotWidth + (slotWidth - barWidth) / 2;
      const y = topMargin + chartHeight - height;
      const trackY = topMargin;
      const trackHeight = chartHeight;

      return {
        ...item,
        x,
        y,
        trackY,
        trackHeight,
        width: barWidth,
        height: Math.max(height, 4),
        centerX: x + barWidth / 2,
        topLabelY: y - 6,
        bottomLabelY: topMargin + chartHeight + 16,
        rankLabelY: topMargin + chartHeight + 30
      };
    });

    return { items, maxAmount, chartHeight, topMargin, svgWidth, svgHeight };
  }, [dataList, totalAmount]);

  const activeItem = hoveredCategory 
    ? dataList.find(d => d.name === hoveredCategory) 
    : null;

  const handleMonthChange = (e) => {
    const val = e.target.value;
    setSelectedMonth(val);
    if (val !== 'all' && onChangeMonth) {
      onChangeMonth(val);
    }
  };

  return (
    <section className="w-full max-w-5xl mx-auto px-4 md:px-8">
      <div className="card-soft p-4 md:p-5 border border-pink-200/90 shadow-xs shadow-pink-100/30">
        
        {/* TIÊU ĐỀ & THANH CÔNG CỤ ĐIỀU KHIỂN (LỌC THÁNG, THU/CHI, KIỂU BIỂU ĐỒ) */}
        <div className="flex flex-col gap-3 pb-3 border-b border-pink-100/80">
          
          {/* HÀNG 1: TIÊU ĐỀ (Không rớt chữ trên mobile) */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-700 flex items-center justify-center shrink-0 border border-pink-200/80">
                {chartType === 'donut' ? (
                  <ChartPieSlice size={18} weight="duotone" />
                ) : (
                  <ChartBar size={18} weight="duotone" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                  <span>Cơ cấu {viewType === 'chi' ? 'chi tiêu' : 'thu nhập'}</span>
                  <span className="text-[11px] font-semibold text-slate-400 font-normal">
                    ({dataList.length} mục)
                  </span>
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                  {selectedMonth === 'all' 
                    ? 'Toàn bộ thời gian' 
                    : `Tháng ${selectedMonth.split('-')[1]}/${selectedMonth.split('-')[0]}`} • {chartType === 'donut' ? 'Biểu đồ Tròn' : 'Biểu đồ Cột'}
                </p>
              </div>
            </div>

            {/* Nút thu gọn / mở rộng */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
              title={isCollapsed ? 'Mở rộng biểu đồ' : 'Thu gọn biểu đồ'}
            >
              {isCollapsed ? <CaretDown size={16} weight="bold" /> : <CaretUp size={16} weight="bold" />}
            </button>
          </div>

          {/* HÀNG 2: BỘ ĐIỀU KHIỂN (LỌC THÁNG, CHUYỂN ĐỔI BIỂU ĐỒ, CHỌN THU/CHI) */}
          <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap pt-0.5">
            
            {/* 1. BỘ LỌC THÁNG */}
            <div className="relative flex items-center">
              <CalendarBlank size={13} weight="bold" className="absolute left-2.5 text-pink-500 pointer-events-none" />
              <select
                value={selectedMonth}
                onChange={handleMonthChange}
                className="pl-7 pr-6 py-1 text-xs font-semibold rounded-xl bg-white border border-pink-200 text-slate-700 hover:border-pink-300 focus:outline-hidden focus:ring-1 focus:ring-pink-300 transition-all cursor-pointer shadow-2xs appearance-none"
                title="Lọc cơ cấu theo tháng"
              >
                {monthFilterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <CaretDown size={11} weight="bold" className="absolute right-2 text-slate-400 pointer-events-none" />
            </div>

            {/* 2. CHUYỂN ĐỔI KIỂU BIỂU ĐỒ (TRÒN / CỘT) */}
            <div className="inline-flex rounded-xl p-0.5 bg-pink-50/60 border border-pink-200/80 text-xs">
              <button
                type="button"
                onClick={() => setChartType('donut')}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                  chartType === 'donut'
                    ? 'bg-white text-pink-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Xem dạng biểu đồ tròn (Donut Chart)"
              >
                <ChartPieSlice size={13} weight="bold" />
                <span className="text-[11px]">Tròn</span>
              </button>
              <button
                type="button"
                onClick={() => setChartType('bar')}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                  chartType === 'bar'
                    ? 'bg-white text-pink-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Xem dạng biểu đồ cột (Bar Chart)"
              >
                <ChartBar size={13} weight="bold" />
                <span className="text-[11px]">Cột</span>
              </button>
            </div>

            {/* 3. TOGGLE KHOẢN CHI / KHOẢN THU */}
            <div className="inline-flex rounded-xl p-0.5 bg-pink-50/60 border border-pink-200/80 text-xs">
              <button
                type="button"
                onClick={() => { setViewType('chi'); setHoveredCategory(null); }}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                  viewType === 'chi'
                    ? 'bg-white text-rose-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Chi
              </button>
              <button
                type="button"
                onClick={() => { setViewType('thu'); setHoveredCategory(null); }}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                  viewType === 'thu'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Thu
              </button>
            </div>

          </div>
        </div>

        {/* NỘI DUNG BIỂU ĐỒ & DANH SÁCH CHI TIẾT */}
        {!isCollapsed && (
          <div className="pt-4">
            {totalAmount <= 0 || dataList.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 space-y-1">
                <p>Chưa có dữ liệu {viewType === 'chi' ? 'chi tiêu' : 'thu nhập'} nào trong khoảng thời gian này.</p>
                <p className="text-[11px] text-pink-500 font-medium">Hãy chọn tháng khác hoặc bấm nút thêm chi tiêu để vẽ biểu đồ nhé! 💕</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* CỘT TRÁI (MD: 5 CỘT): BIỂU ĐỒ TRÒN HOẶC BIỂU ĐỒ CỘT */}
                <div className="md:col-span-5 flex flex-col items-center justify-center py-1">
                  
                  {/* === CHẾ ĐỘ 1: BIỂU ĐỒ TRÒN (DONUT CHART) === */}
                  {chartType === 'donut' ? (
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

                      {/* VÙNG THÔNG TIN TRUNG TÂM DONUT */}
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
                  ) : (
                    /* === CHẾ ĐỘ 2: BIỂU ĐỒ CỘT (BAR / COLUMN CHART) === */
                    <div className="w-full max-w-[340px] flex flex-col items-center">
                      
                      {/* Thẻ hiển thị tóm tắt danh mục đang hover trên biểu đồ cột */}
                      <div className="w-full mb-1 h-9 px-3 py-1 rounded-xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-between text-xs">
                        {activeItem ? (
                          <>
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: activeItem.color }} />
                              <span className="font-bold text-slate-800 truncate">{activeItem.name}</span>
                              <span className="text-[10px] text-slate-400">({activeItem.count} gd)</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 font-extrabold text-slate-900">
                              <span>{activeItem.percent.toFixed(1)}%</span>
                              <span className="text-pink-600">{formatMoney(activeItem.amount)}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-slate-500 font-medium text-[11px]">
                              Tổng {viewType === 'chi' ? 'Chi' : 'Thu'}: <strong className={viewType === 'chi' ? 'text-rose-600' : 'text-emerald-600'}>{formatMoney(totalAmount)}</strong>
                            </span>
                            <span className="text-[10px] text-slate-400">Rê cột để xem</span>
                          </>
                        )}
                      </div>

                      {/* SVG Biểu đồ Cột sắc nét & chuyển động mượt mà */}
                      <div className="w-full aspect-[16/11] relative">
                        <svg viewBox={`0 0 ${barChartData.svgWidth} ${barChartData.svgHeight}`} className="w-full h-full">
                          <defs>
                            {barChartData.items.map((bar, i) => (
                              <linearGradient key={`grad-${i}`} id={`barGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={bar.color} stopOpacity="1" />
                                <stop offset="100%" stopColor={bar.color} stopOpacity="0.75" />
                              </linearGradient>
                            ))}
                          </defs>

                          {/* Các đường gióng ngang mờ (Gridlines) */}
                          {[0.25, 0.5, 0.75, 1.0].map((ratio, idx) => {
                            const gridY = barChartData.topMargin + barChartData.chartHeight * (1 - ratio);
                            return (
                              <line
                                key={idx}
                                x1="12"
                                y1={gridY}
                                x2={barChartData.svgWidth - 12}
                                y2={gridY}
                                stroke="#E2E8F0"
                                strokeDasharray="3 3"
                                strokeWidth="0.8"
                              />
                            );
                          })}

                          {/* Vẽ từng cột biểu đồ */}
                          {barChartData.items.map((bar, idx) => {
                            const isHovered = hoveredCategory === bar.name;

                            return (
                              <g 
                                key={idx}
                                className="cursor-pointer transition-all duration-200"
                                onMouseEnter={() => setHoveredCategory(bar.name)}
                                onMouseLeave={() => setHoveredCategory(null)}
                                onClick={() => setHoveredCategory(hoveredCategory === bar.name ? null : bar.name)}
                              >
                                {/* Cột nền mờ (Background Track) */}
                                <rect
                                  x={bar.x}
                                  y={bar.trackY}
                                  width={bar.width}
                                  height={bar.trackHeight}
                                  rx="6"
                                  fill="#F1F5F9"
                                  opacity="0.6"
                                />

                                {/* Cột dữ liệu thực tế với bo góc mềm mại */}
                                <rect
                                  x={bar.x}
                                  y={bar.y}
                                  width={bar.width}
                                  height={bar.height}
                                  rx="6"
                                  fill={`url(#barGrad-${idx})`}
                                  className={`transition-all duration-300 ${
                                    hoveredCategory && !isHovered ? 'opacity-35' : 'opacity-100'
                                  } ${isHovered ? 'filter drop-shadow-md brightness-110' : 'hover:opacity-95'}`}
                                />

                                {/* Phần trăm trên đỉnh cột */}
                                <text
                                  x={bar.centerX}
                                  y={bar.topLabelY}
                                  textAnchor="middle"
                                  className={`text-[10px] font-bold select-none transition-colors ${
                                    isHovered ? 'fill-pink-600 font-extrabold' : 'fill-slate-700'
                                  }`}
                                >
                                  {bar.percent.toFixed(0)}%
                                </text>

                                {/* Nhãn tên danh mục dưới chân cột */}
                                <text
                                  x={bar.centerX}
                                  y={bar.bottomLabelY}
                                  textAnchor="middle"
                                  className={`text-[10px] select-none font-bold capitalize transition-colors ${
                                    isHovered ? 'fill-slate-900 font-extrabold' : 'fill-slate-600'
                                  }`}
                                >
                                  {bar.name.length > 7 ? bar.name.slice(0, 6) + '…' : bar.name}
                                </text>

                                {/* Huy hiệu thứ hạng dưới tên */}
                                <text
                                  x={bar.centerX}
                                  y={bar.rankLabelY}
                                  textAnchor="middle"
                                  className="text-[9px] font-semibold fill-slate-400 select-none"
                                >
                                  #{bar.rank}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>
                  )}

                </div>

                {/* CỘT PHẢI (MD: 7 CỘT): DANH SÁCH BẢNG XẾP HẠNG PHÂN LOẠI */}
                <div className="md:col-span-7 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 px-1 pb-1">
                    <span>XẾP HẠNG PHÂN LOẠI ({dataList.length})</span>
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
                              ? 'bg-slate-50 border-pink-300 shadow-2xs scale-[1.01]'
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
