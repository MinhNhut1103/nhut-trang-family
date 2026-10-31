import React, { useState, useEffect, useMemo } from 'react';
import { 
  Target, 
  Sparkle, 
  Plus, 
  Trash, 
  PencilSimple, 
  Calendar, 
  Check, 
  X, 
  AirplaneTilt, 
  House, 
  Car, 
  Heart, 
  Coins, 
  TrendUp, 
  Trophy, 
  CaretDown, 
  CaretUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  Gift,
  Smiley,
  CheckCircle
} from '@phosphor-icons/react';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'nt_family_savings_goals';

// 3 mục tiêu gợi ý mẫu ban đầu cho Nhựt & Trang để trải nghiệm giao diện (gắn với Tháng 10/2026)
const DEFAULT_SAMPLE_GOALS = [
  {
    id: 'goal-1',
    title: 'Kỳ nghỉ Đà Lạt gia đình 🌸',
    category: 'Du lịch & Nghỉ dưỡng',
    target: 15000000,
    current: 9500000,
    deadline: '2026-11-20',
    month: '2026-10',
    icon: 'AirplaneTilt',
    color: 'emerald', // emerald, rose, blue, amber, purple
    history: [
      { id: 'h-1', author: 'Nhựt', amount: 5000000, date: '2026-10-01', note: 'Trích từ thưởng quý' },
      { id: 'h-2', author: 'Trang', amount: 4500000, date: '2026-10-08', note: 'Tiết kiệm đầu tháng' }
    ]
  },
  {
    id: 'goal-2',
    title: 'Quỹ đổi tủ lạnh & Bếp mới 🏡',
    category: 'Tổ ấm gia đình',
    target: 25000000,
    current: 12000000,
    deadline: '2026-12-31',
    month: '2026-10',
    icon: 'House',
    color: 'indigo',
    history: [
      { id: 'h-3', author: 'Nhựt', amount: 7000000, date: '2026-09-25', note: 'Góp vào quỹ chung' },
      { id: 'h-4', author: 'Trang', amount: 5000000, date: '2026-10-05', note: 'Góp thêm cho bếp' }
    ]
  },
  {
    id: 'goal-3',
    title: 'Quỹ tự do tài chính 2026 📈',
    category: 'Tích lũy tương lai',
    target: 50000000,
    current: 35000000,
    deadline: '2027-01-15',
    month: '2026-10',
    icon: 'TrendUp',
    color: 'rose',
    history: [
      { id: 'h-5', author: 'Nhựt & Trang', amount: 35000000, date: '2026-10-01', note: 'Số dư tích lũy năm cũ' }
    ]
  }
];

const ICON_MAP = {
  Target: Target,
  AirplaneTilt: AirplaneTilt,
  House: House,
  Car: Car,
  Heart: Heart,
  Coins: Coins,
  TrendUp: TrendUp,
  Trophy: Trophy,
  Gift: Gift,
  ShieldCheck: ShieldCheck
};

const COLOR_THEMES = {
  emerald: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-700',
    light: 'bg-emerald-50',
    border: 'border-emerald-200',
    glow: 'from-emerald-400 to-teal-500',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  rose: {
    bg: 'bg-rose-500',
    text: 'text-rose-700',
    light: 'bg-rose-50',
    border: 'border-rose-200',
    glow: 'from-rose-400 to-pink-500',
    badge: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  indigo: {
    bg: 'bg-indigo-500',
    text: 'text-indigo-700',
    light: 'bg-indigo-50',
    border: 'border-indigo-200',
    glow: 'from-indigo-400 to-purple-500',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  amber: {
    bg: 'bg-amber-500',
    text: 'text-amber-700',
    light: 'bg-amber-50',
    border: 'border-amber-200',
    glow: 'from-amber-400 to-orange-500',
    badge: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  purple: {
    bg: 'bg-purple-500',
    text: 'text-purple-700',
    light: 'bg-purple-50',
    border: 'border-purple-200',
    glow: 'from-purple-400 to-fuchsia-500',
    badge: 'bg-purple-100 text-purple-800 border-purple-200'
  }
};

export default function SavingsGoalsSection({
  goals: propGoals = null,
  currentMonth = '2026-10',
  availableMonths = [],
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onDepositGoal,
  privacyMode = false,
  activeUser = 'nhut',
  onShowToast
}) {
  const [localGoals, setLocalGoals] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_SAMPLE_GOALS;
    } catch (e) {
      return DEFAULT_SAMPLE_GOALS;
    }
  });

  const allGoals = propGoals !== null && Array.isArray(propGoals) ? propGoals : localGoals;

  // Lọc mục tiêu ăn theo tháng: mỗi tháng hiển thị mục tiêu riêng, tháng mới chưa có thì trống
  const goals = useMemo(() => {
    return allGoals.filter(g => {
      const gMonth = g.month || (g.deadline ? g.deadline.slice(0, 7) : '2026-10');
      return gMonth === currentMonth;
    });
  }, [allGoals, currentMonth]);

  const formatMonthDisplay = (mStr) => {
    if (!mStr || !mStr.includes('-')) return mStr || 'Tháng này';
    const [year, month] = mStr.split('-');
    return `Tháng ${month}/${year}`;
  };

  const currentMonthLabel = formatMonthDisplay(currentMonth);

  // Trạng thái mở rộng / thu gọn: Mặc định thu gọn, khi nào bấm bật mới full ra theo yêu cầu
  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      const saved = localStorage.getItem('nt_goals_expanded');
      return saved !== null ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  });

  const handleToggleExpanded = () => {
    setIsExpanded(prev => {
      const next = !prev;
      try {
        localStorage.setItem('nt_goals_expanded', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Modal Nạp tiền tích lũy
  const [depositModal, setDepositModal] = useState({
    isOpen: false,
    goal: null,
    amount: '',
    author: activeUser === 'trang' ? 'Trang' : 'Nhựt',
    note: ''
  });

  // Modal Tạo / Sửa mục tiêu
  const [goalModal, setGoalModal] = useState({
    isOpen: false,
    isEdit: false,
    goalId: null,
    title: '',
    category: 'Gia đình',
    target: '',
    current: '',
    deadline: '',
    month: currentMonth,
    icon: 'Target',
    color: 'rose'
  });

  // Modal Xem lịch sử nạp
  const [historyModal, setHistoryModal] = useState({
    isOpen: false,
    goal: null
  });

  // Lưu localStorage mỗi khi allGoals thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allGoals));
    } catch (e) {
      console.warn('Lỗi lưu goals vào localStorage:', e);
    }
  }, [allGoals]);

  const formatMoney = (val) => {
    if (privacyMode) return '•••••• đ';
    return new Intl.NumberFormat('vi-VN').format(Number(val) || 0) + ' đ';
  };

  // Tính toán tổng quan các mục tiêu
  const totalTarget = goals.reduce((sum, g) => sum + (Number(g.target) || 0), 0);
  const totalCurrent = goals.reduce((sum, g) => sum + (Number(g.current) || 0), 0);
  const overallPercentage = totalTarget > 0 ? Math.min(100, Math.round((totalCurrent / totalTarget) * 100)) : 0;
  const completedCount = goals.filter(g => (Number(g.current) || 0) >= (Number(g.target) || 1)).length;

  // Tính số ngày còn lại đến hạn chót
  const getDaysRemaining = (deadlineStr) => {
    if (!deadlineStr) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const targetDate = new Date(deadlineStr);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Kích hoạt pháo hoa ăn mừng rực rỡ khi hoàn thành
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#10b981', '#fbbf24', '#8b5cf6']
      });
    } catch (e) {}
  };

  // Mở modal Nạp tiền
  const handleOpenDeposit = (goal) => {
    setDepositModal({
      isOpen: true,
      goal,
      amount: '',
      author: activeUser === 'trang' ? 'Trang' : 'Nhựt',
      note: 'Tích lũy định kỳ'
    });
  };

  // Xác nhận nạp tiền
  const handleConfirmDeposit = (e) => {
    e.preventDefault();
    const amountNum = Number(String(depositModal.amount).replace(/\D/g, '')) || 0;
    if (amountNum <= 0) return;

    const targetGoal = depositModal.goal;
    const prevCurrent = Number(targetGoal.current) || 0;
    const newCurrent = prevCurrent + amountNum;
    const targetAmount = Number(targetGoal.target) || 1;

    const newHistoryItem = {
      id: 'h-' + Date.now(),
      author: depositModal.author,
      amount: amountNum,
      date: new Date().toISOString().split('T')[0],
      note: depositModal.note || 'Tích lũy'
    };

    if (onDepositGoal) {
      onDepositGoal(targetGoal.id, amountNum, depositModal.author, depositModal.note || 'Tích lũy');
    } else {
      setLocalGoals(prev => prev.map(g => {
        if (g.id === targetGoal.id) {
          return {
            ...g,
            current: newCurrent,
            history: [newHistoryItem, ...(g.history || [])]
          };
        }
        return g;
      }));
    }

    // Nếu vừa chạm mốc hoặc vượt 100% -> Bắn pháo hoa ăn mừng
    if (prevCurrent < targetAmount && newCurrent >= targetAmount) {
      triggerConfetti();
      if (onShowToast) {
        onShowToast(`🎉 CHÚC MỪNG! Mục tiêu "${targetGoal.title}" đã hoàn thành xuất sắc 100%! 💕`);
      }
    } else {
      if (onShowToast) {
        onShowToast(`Đã nạp ${new Intl.NumberFormat('vi-VN').format(amountNum)} đ vào "${targetGoal.title}" 💕`);
      }
    }

    setDepositModal({ isOpen: false, goal: null, amount: '', author: 'Nhựt', note: '' });
  };

  // Mở modal tạo mới mục tiêu
  const handleOpenCreateGoal = () => {
    setGoalModal({
      isOpen: true,
      isEdit: false,
      goalId: null,
      title: '',
      category: 'Du lịch & Nghỉ dưỡng',
      target: '',
      current: '0',
      deadline: '',
      month: currentMonth,
      icon: 'Target',
      color: 'rose'
    });
  };

  // Mở modal sửa mục tiêu
  const handleOpenEditGoal = (goal) => {
    setGoalModal({
      isOpen: true,
      isEdit: true,
      goalId: goal.id,
      title: goal.title || '',
      category: goal.category || 'Gia đình',
      target: String(goal.target || ''),
      current: String(goal.current || 0),
      deadline: goal.deadline || '',
      month: goal.month || currentMonth,
      icon: goal.icon || 'Target',
      color: goal.color || 'rose'
    });
  };

  // Lưu mục tiêu (Tạo mới hoặc Sửa)
  const handleSaveGoal = (e) => {
    e.preventDefault();
    const targetNum = Number(String(goalModal.target).replace(/\D/g, '')) || 0;
    const currentNum = Number(String(goalModal.current).replace(/\D/g, '')) || 0;
    if (!goalModal.title.trim() || targetNum <= 0) return;

    if (goalModal.isEdit) {
      const existing = allGoals.find(g => g.id === goalModal.goalId);
      const updatedGoal = {
        ...existing,
        id: goalModal.goalId,
        title: goalModal.title.trim(),
        category: goalModal.category,
        target: targetNum,
        current: currentNum,
        deadline: goalModal.deadline,
        month: goalModal.month || existing?.month || currentMonth || '2026-10',
        icon: goalModal.icon,
        color: goalModal.color,
        history: existing?.history || []
      };

      if (onUpdateGoal) {
        onUpdateGoal(updatedGoal);
      } else {
        setLocalGoals(prev => prev.map(g => g.id === goalModal.goalId ? updatedGoal : g));
      }
      if (onShowToast) onShowToast(`Đã cập nhật mục tiêu "${goalModal.title}"`);
    } else {
      const newGoal = {
        id: 'goal-' + Date.now(),
        title: goalModal.title.trim(),
        category: goalModal.category,
        target: targetNum,
        current: currentNum,
        deadline: goalModal.deadline,
        month: goalModal.month || currentMonth || '2026-10',
        icon: goalModal.icon,
        color: goalModal.color,
        history: currentNum > 0 ? [{
          id: 'h-' + Date.now(),
          author: activeUser === 'trang' ? 'Trang' : 'Nhựt',
          amount: currentNum,
          date: new Date().toISOString().split('T')[0],
          note: 'Số dư khởi tạo'
        }] : []
      };

      if (onAddGoal) {
        onAddGoal(newGoal);
      } else {
        setLocalGoals(prev => [newGoal, ...prev]);
      }
      if (onShowToast) onShowToast(`Đã thêm mục tiêu mới: "${newGoal.title}" (${currentMonthLabel}) 💕`);
    }

    setGoalModal({ isOpen: false, isEdit: false, goalId: null, title: '', category: '', target: '', current: '', deadline: '', month: currentMonth, icon: 'Target', color: 'rose' });
  };

  // Xóa mục tiêu
  const handleDeleteGoal = (goal) => {
    if (window.confirm(`Bạn có chắc muốn xóa mục tiêu "${goal.title}" không?`)) {
      if (onDeleteGoal) {
        onDeleteGoal(goal.id);
      } else {
        setLocalGoals(prev => prev.filter(g => g.id !== goal.id));
      }
      if (onShowToast) onShowToast(`Đã xóa mục tiêu "${goal.title}"`);
    }
  };

  return (
    <section className="w-full max-w-5xl mx-auto px-4 md:px-8 animate-fade-in">
      <div className="card-soft p-3.5 sm:p-5 bg-gradient-to-br from-white via-pink-50/25 to-rose-50/15 border border-pink-200/90 shadow-xs shadow-pink-100/30 transition-all">
      
      {/* 1. Header Mục Tiêu Tài Chính */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isExpanded ? 'pb-3 border-b border-pink-100' : ''}`}>
        <div className="flex items-center gap-2.5 sm:gap-3 w-full min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 text-white flex items-center justify-center shadow-xs shrink-0">
            <Target size={22} weight="bold" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight whitespace-nowrap">
                Mục Tiêu Tài Chính {currentMonthLabel}
              </h3>
              <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200 whitespace-nowrap shrink-0">
                {completedCount}/{goals.length} Đạt 🏆
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap shrink-0">
                {overallPercentage}%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 whitespace-nowrap truncate">
              {isExpanded 
                ? `Kế hoạch tích lũy & dự định của ${currentMonthLabel} 💕` 
                : goals.length > 0
                ? `Đã có: ${formatMoney(totalCurrent)} / Mục tiêu: ${formatMoney(totalTarget)}`
                : `Chưa có mục tiêu cho ${currentMonthLabel} • Bấm để thêm`
              }
            </p>
          </div>
        </div>

        {/* Nút thao tác: Nằm bên dưới tiêu đề trên mobile, ngang hàng trên desktop */}
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-0.5 sm:pt-0">
          {isExpanded && (
            <button
              type="button"
              onClick={handleOpenCreateGoal}
              className="flex-1 sm:flex-initial py-2 sm:py-1.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 active:scale-98 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 tactile-btn transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus size={14} weight="bold" />
              <span>Thêm mục tiêu</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleExpanded}
            className={`py-2 sm:py-1.5 px-3.5 rounded-xl border text-xs font-semibold tactile-btn transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer ${
              isExpanded
                ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                : 'border-pink-300 bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 text-pink-700 shadow-2xs'
            }`}
            title={isExpanded ? 'Thu gọn mục tiêu tài chính' : 'Bật xem đầy đủ mục tiêu tài chính'}
          >
            <span>{isExpanded ? 'Thu gọn' : 'Bật xem mục tiêu'}</span>
            {isExpanded ? <CaretUp size={15} weight="bold" /> : <CaretDown size={15} weight="bold" />}
          </button>
        </div>
      </div>

      {/* 2 & 3: Chỉ hiển thị đầy đủ khi bấm BẬT (isExpanded === true) */}
      {isExpanded && (
        <div className="space-y-4 animate-fade-in">
          {/* 2. Thanh Tiến Độ Tổng Thể (Overall Progress Pulse) */}
          <div className="mt-3.5 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-pink-50/80 via-white to-amber-50/40 border border-pink-200/90 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Vòng tròn tiến độ Radial Donut trực quan */}
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 shrink-0 flex items-center justify-center filter drop-shadow-2xs">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                  {/* Vòng nền xám hồng nhẹ */}
                  <path
                    className="text-pink-100/90"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Vòng tiến độ gradient chuyển màu mượt mà */}
                  <path
                    stroke="url(#progressRingGradient)"
                    strokeWidth="3.2"
                    strokeDasharray={`${overallPercentage}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-1000 ease-out"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <defs>
                    <linearGradient id="progressRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FB7185" />
                      <stop offset="50%" stopColor="#F43F5E" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                  <span className="text-[11px] sm:text-xs font-black text-rose-600 tracking-tight font-sans flex items-baseline">
                    <span>{overallPercentage}</span>
                    <span className="text-[8px] font-bold opacity-80 ml-0.5">%</span>
                  </span>
                </div>
              </div>

              <div className="min-w-0">
                <div className="text-xs sm:text-[13px] font-bold text-slate-800 flex items-center gap-1.5 whitespace-nowrap">
                  <span>Tiến độ tích lũy toàn bộ</span>
                  <Sparkle size={13} weight="fill" className="text-amber-500 shrink-0" />
                </div>
                <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5 whitespace-nowrap">
                  Đã có: <strong className="text-emerald-600 font-bold">{formatMoney(totalCurrent)}</strong> / Mục tiêu: <span className="font-semibold text-slate-700">{formatMoney(totalTarget)}</span>
                </div>
              </div>
            </div>

            {/* Mini progress bar ngang kèm nhãn tỷ lệ */}
            <div className="w-full sm:w-56 flex flex-col gap-1 shrink-0">
              <div className="w-full bg-slate-100 rounded-full h-2.5 sm:h-3 border border-pink-200/80 p-0.5 shadow-inner">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 transition-all duration-700 shadow-2xs"
                  style={{ width: `${Math.min(100, Math.max(3, overallPercentage))}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium px-0.5">
                <span>0%</span>
                <span className="font-semibold text-rose-500">{overallPercentage}% hoàn thành</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* 3. Danh Sách Thẻ Mục Tiêu (Grid Goal Cards) */}
        <div className="mt-4">
          {goals.length === 0 ? (
            <div className="py-8 text-center rounded-2xl border-2 border-dashed border-pink-200/80 bg-pink-50/30">
              <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center mx-auto mb-2">
                <Target size={24} weight="duotone" />
              </div>
              <h4 className="font-bold text-slate-700 text-sm">Chưa có mục tiêu nào trong {currentMonthLabel}</h4>
              <p className="text-xs text-slate-400 mt-0.5 max-w-sm mx-auto">
                Mỗi tháng có mục tiêu tài chính riêng. Cùng nhau lên kế hoạch cho các dự định của {currentMonthLabel} nhé 💕
              </p>
              <button
                type="button"
                onClick={handleOpenCreateGoal}
                className="mt-3 px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-xs inline-flex items-center gap-1.5 tactile-btn cursor-pointer"
              >
                <Plus size={14} weight="bold" /> Thêm mục tiêu {currentMonthLabel}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {goals.map((g) => {
                const targetVal = Number(g.target) || 1;
                const currentVal = Number(g.current) || 0;
                const percent = Math.min(100, Math.round((currentVal / targetVal) * 100));
                const remaining = Math.max(0, targetVal - currentVal);
                const isComplete = currentVal >= targetVal;
                const daysLeft = getDaysRemaining(g.deadline);

                const theme = COLOR_THEMES[g.color] || COLOR_THEMES.rose;
                const IconComponent = ICON_MAP[g.icon] || Target;

                return (
                  <div
                    key={g.id}
                    className={`rounded-2xl border p-4 transition-all duration-200 relative flex flex-col justify-between group hover:shadow-md ${
                      isComplete 
                        ? 'bg-gradient-to-br from-amber-50/60 via-white to-pink-50/40 border-amber-300/80 shadow-xs' 
                        : 'bg-white border-pink-200/90 shadow-2xs hover:border-pink-300'
                    }`}
                  >
                    {/* Top Row: Icon, Category & Actions */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-10 h-10 rounded-xl ${theme.light} ${theme.text} border ${theme.border} flex items-center justify-center shrink-0 shadow-2xs`}>
                            <IconComponent size={20} weight={isComplete ? "fill" : "duotone"} />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-600 tracking-wide">
                              {g.category || 'Mục tiêu'}
                            </span>
                            <h4 className="font-bold text-slate-800 text-sm leading-tight line-clamp-1 group-hover:text-pink-600 transition-colors">
                              {g.title}
                            </h4>
                          </div>
                        </div>

                        {/* Nút sửa / xóa nhỏ gọn */}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleOpenEditGoal(g)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 tactile-btn"
                            title="Chỉnh sửa mục tiêu"
                          >
                            <PencilSimple size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGoal(g)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 tactile-btn"
                            title="Xóa mục tiêu"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Tiến độ % và Hạn chót Badge */}
                      <div className="mt-3 flex items-center justify-between text-xs gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                            isComplete 
                              ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                              : theme.badge
                          }`}>
                            {isComplete ? '100% Hoàn thành 🏆' : `${percent}% Đạt`}
                          </span>

                          {g.deadline && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 whitespace-nowrap shrink-0">
                              <Calendar size={11} />
                              {daysLeft !== null && daysLeft > 0 
                                ? `Còn ${daysLeft} ngày` 
                                : daysLeft === 0 
                                  ? 'Hạn hôm nay' 
                                  : 'Đã qua hạn'}
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap shrink-0">
                          {isComplete ? 'Đạt kỳ vọng' : `Thiếu: ${formatMoney(remaining)}`}
                        </span>
                      </div>

                      {/* Thanh Progress Bar */}
                      <div className="mt-2 w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200/80">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${
                            isComplete ? 'from-amber-400 to-emerald-500' : theme.glow
                          } transition-all duration-500 shadow-2xs`}
                          style={{ width: `${Math.min(100, Math.max(4, percent))}%` }}
                        />
                      </div>

                      {/* Số tiền chi tiết: Đã có / Mục tiêu */}
                      <div className="mt-2.5 flex items-baseline justify-between text-xs gap-2">
                        <div className="text-slate-500 text-[11px] whitespace-nowrap">
                          Đã có: <strong className="text-slate-900 font-bold text-xs">{formatMoney(currentVal)}</strong>
                        </div>
                        <div className="text-slate-400 text-[11px] whitespace-nowrap">
                          Kỳ vọng: <span className="font-semibold text-slate-700">{formatMoney(targetVal)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action: Nút nạp tiền & Lịch sử */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setHistoryModal({ isOpen: true, goal: g })}
                        className="text-[11px] font-medium text-slate-500 hover:text-pink-600 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
                      >
                        <Clock size={12} />
                        Lịch sử ({g.history?.length || 0})
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenDeposit(g)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all tactile-btn flex items-center gap-1.5 shadow-2xs whitespace-nowrap shrink-0 ${
                          isComplete
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300'
                            : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white'
                        }`}
                      >
                        <Coins size={14} weight="fill" />
                        <span>{isComplete ? 'Góp thêm' : '+ Nạp tiền'}</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
        </div>
      )}

      </div>{/* Đóng card-soft */}

      {/* =========================================================================
          MODAL 1: NẠP TIỀN TÍCH LŨY VÀO MỤC TIÊU
         ========================================================================= */}
      {depositModal.isOpen && depositModal.goal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setDepositModal({ isOpen: false, goal: null, amount: '', author: 'Nhựt', note: '' }); }}
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-pink-200 shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
            
            <div className="px-5 py-4 border-b border-pink-100 flex items-center justify-between bg-gradient-to-r from-pink-50/80 to-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-xs">
                  <Coins size={18} weight="fill" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Nạp Tiền Vào Mục Tiêu</h4>
                  <p className="text-[11px] text-pink-600 font-semibold truncate max-w-[220px]">
                    {depositModal.goal.title}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setDepositModal({ isOpen: false, goal: null, amount: '', author: 'Nhựt', note: '' })}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleConfirmDeposit} className="p-5 space-y-3.5">
              
              {/* Tình trạng hiện tại */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">Đã có hiện tại:</span>
                  <strong className="text-slate-800 font-bold">{formatMoney(depositModal.goal.current)}</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Mục tiêu cần đạt:</span>
                  <strong className="text-pink-600 font-bold">{formatMoney(depositModal.goal.target)}</strong>
                </div>
              </div>

              {/* Nhập số tiền */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số tiền nạp thêm (VNĐ)
                </label>
                <input
                  type="text"
                  value={depositModal.amount ? Number(depositModal.amount.replace(/\D/g, '')).toLocaleString('vi-VN') : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    setDepositModal({ ...depositModal, amount: raw });
                  }}
                  placeholder="Ví dụ: 1.000.000"
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 text-sm font-bold text-slate-800 rounded-xl border border-pink-300 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                />
                
                {/* Nút bấm nhanh số tiền */}
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  {[500000, 1000000, 2000000, 5000000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositModal({ ...depositModal, amount: String(amt) })}
                      className="px-2 py-1 rounded-lg border border-slate-200 text-[10px] font-semibold text-slate-600 hover:border-pink-300 hover:bg-pink-50"
                    >
                      +{amt >= 1000000 ? `${amt / 1000000}tr` : `${amt / 1000}k`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Người đóng góp */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Người đóng góp
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Nhựt', 'Trang', 'Nhựt & Trang'].map(person => (
                    <button
                      key={person}
                      type="button"
                      onClick={() => setDepositModal({ ...depositModal, author: person })}
                      className={`py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        depositModal.author === person
                          ? 'border-pink-500 bg-pink-50 text-pink-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {person}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú đóng góp (tùy chọn)
                </label>
                <input
                  type="text"
                  value={depositModal.note}
                  onChange={(e) => setDepositModal({ ...depositModal, note: e.target.value })}
                  placeholder="Ví dụ: Trích thưởng tháng, tiết kiệm tuần..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Nút bấm */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDepositModal({ isOpen: false, goal: null, amount: '', author: 'Nhựt', note: '' })}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!depositModal.amount || Number(depositModal.amount) <= 0}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-pink-200 disabled:opacity-50"
                >
                  Xác nhận nạp tiền
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: TẠO MỚI HOẶC CHỈNH SỬA MỤC TIÊU
         ========================================================================= */}
      {goalModal.isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setGoalModal({ ...goalModal, isOpen: false }); }}
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-pink-200 shadow-2xl max-w-md w-full overflow-hidden animate-scale-up max-h-[92vh] flex flex-col">
            
            <div className="px-5 py-4 border-b border-pink-100 flex items-center justify-between bg-gradient-to-r from-pink-50/80 to-white shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-xs">
                  <Target size={18} weight="bold" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">
                  {goalModal.isEdit ? `Chỉnh Sửa Mục Tiêu (${currentMonthLabel})` : `Thêm Mục Tiêu Mới Cho ${currentMonthLabel}`}
                </h4>
              </div>
              <button 
                onClick={() => setGoalModal({ ...goalModal, isOpen: false })}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="p-5 space-y-3.5 overflow-y-auto">
              
              {/* Thông tin tháng áp dụng */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Áp dụng cho tháng:</span>
                  <span className="text-[11px] font-bold text-pink-600">{currentMonthLabel}</span>
                </label>
                <div className="px-3.5 py-2 text-xs rounded-xl border border-pink-200/80 bg-pink-50/50 text-slate-800 font-medium flex items-center gap-2">
                  <Calendar size={15} className="text-pink-600 shrink-0" weight="bold" />
                  <span>Mục tiêu này sẽ được tính và lưu riêng cho <strong>{currentMonthLabel}</strong></span>
                </div>
              </div>

              {/* Tên mục tiêu */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên mục tiêu tích lũy *
                </label>
                <input
                  type="text"
                  value={goalModal.title}
                  onChange={(e) => setGoalModal({ ...goalModal, title: e.target.value })}
                  placeholder="Ví dụ: Mua máy pha cà phê, Du lịch Phú Quốc..."
                  required
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Danh mục */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phân nhóm mục tiêu
                </label>
                <select
                  value={goalModal.category}
                  onChange={(e) => setGoalModal({ ...goalModal, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-pink-500 bg-white"
                >
                  <option value="Du lịch & Nghỉ dưỡng">Du lịch & Nghỉ dưỡng 🏖️</option>
                  <option value="Tổ ấm gia đình">Tổ ấm gia đình 🏡</option>
                  <option value="Mua sắm & Thiết bị">Mua sắm & Thiết bị 📱</option>
                  <option value="Xe cộ & Đi lại">Xe cộ & Đi lại 🚗</option>
                  <option value="Tích lũy tương lai">Tích lũy tương lai 📈</option>
                  <option value="Sức khỏe & Học tập">Sức khỏe & Học tập 🎓</option>
                  <option value="Khác">Khác ✨</option>
                </select>
              </div>

              {/* Số tiền kỳ vọng & Đã có */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số tiền cần đạt *
                  </label>
                  <input
                    type="text"
                    value={goalModal.target ? Number(goalModal.target.replace(/\D/g, '')).toLocaleString('vi-VN') : ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      setGoalModal({ ...goalModal, target: raw });
                    }}
                    placeholder="Ví dụ: 20.000.000"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-pink-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Đã có sẵn ban đầu
                  </label>
                  <input
                    type="text"
                    value={goalModal.current ? Number(goalModal.current.replace(/\D/g, '')).toLocaleString('vi-VN') : ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      setGoalModal({ ...goalModal, current: raw });
                    }}
                    placeholder="0 đ"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Ngày hạn chót */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Hạn chót dự kiến (Deadline)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Tùy chọn</span>
                </label>
                <input
                  type="date"
                  value={goalModal.deadline}
                  onChange={(e) => setGoalModal({ ...goalModal, deadline: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-pink-500 bg-white"
                />
              </div>

              {/* Chọn Icon */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Biểu tượng Icon
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {Object.keys(ICON_MAP).map(key => {
                    const Icn = ICON_MAP[key];
                    const isSelected = goalModal.icon === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setGoalModal({ ...goalModal, icon: key })}
                        className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-2xs ring-1 ring-pink-400'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icn size={18} weight={isSelected ? "fill" : "duotone"} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chọn Màu sắc */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tông màu chủ đạo
                </label>
                <div className="flex items-center gap-2">
                  {Object.keys(COLOR_THEMES).map(cKey => {
                    const c = COLOR_THEMES[cKey];
                    const isSelected = goalModal.color === cKey;
                    return (
                      <button
                        key={cKey}
                        type="button"
                        onClick={() => setGoalModal({ ...goalModal, color: cKey })}
                        className={`w-7 h-7 rounded-full ${c.bg} flex items-center justify-center transition-transform ${
                          isSelected ? 'scale-110 ring-2 ring-offset-2 ring-pink-400' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {isSelected && <Check size={14} weight="bold" className="text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setGoalModal({ ...goalModal, isOpen: false })}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-pink-200"
                >
                  {goalModal.isEdit ? 'Cập nhật mục tiêu' : 'Tạo mục tiêu'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: XEM LỊCH SỬ ĐÓNG GÓP TIẾT KIỆM
         ========================================================================= */}
      {historyModal.isOpen && historyModal.goal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setHistoryModal({ isOpen: false, goal: null }); }}
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-pink-200 shadow-2xl max-w-md w-full overflow-hidden animate-scale-up max-h-[85vh] flex flex-col">
            
            <div className="px-5 py-4 border-b border-pink-100 flex items-center justify-between bg-gradient-to-r from-pink-50/80 to-white shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
                  <Clock size={18} weight="bold" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Lịch Sử Nạp Tiền</h4>
                  <p className="text-[11px] text-slate-500">{historyModal.goal.title}</p>
                </div>
              </div>
              <button 
                onClick={() => setHistoryModal({ isOpen: false, goal: null })}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-2">
              {(!historyModal.goal.history || historyModal.goal.history.length === 0) ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Chưa có lịch sử nạp tiền nào cho mục tiêu này.
                </div>
              ) : (
                historyModal.goal.history.map((h, i) => (
                  <div key={h.id || i} className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {h.author}
                        <span className="text-[10px] text-slate-400 font-normal">({h.date})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{h.note || 'Nạp tiền tích lũy'}</p>
                    </div>
                    <div className="font-bold text-emerald-600 text-xs">
                      +{formatMoney(h.amount)}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-slate-100 text-right shrink-0">
              <button
                type="button"
                onClick={() => setHistoryModal({ isOpen: false, goal: null })}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
