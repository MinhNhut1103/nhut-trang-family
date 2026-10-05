import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, Note, Plus, Target, CurrencyDollar, ArrowRight, Wallet } from '@phosphor-icons/react';

export default function MonthManagerModal({
  isOpen,
  onClose,
  currentMonth,
  onSelectMonth,
  monthlyConfigs = {},
  onSaveMonthlyConfig,
  availableMonths = [],
  onAddMonth,
  currentFunds = { so_tien_hien_co: 0 }
}) {
  const [activeTabMonth, setActiveTabMonth] = useState(currentMonth);
  const [newMonthInput, setNewMonthInput] = useState('');
  const [isAddingNewMonth, setIsAddingNewMonth] = useState(false);

  // Form chỉnh sửa cấu hình & ghi chú của tháng đang chọn
  const [formData, setFormData] = useState({
    ghi_chu: '',
    banner_focus: '',
    han_muc_chi: 30000000,
    so_tien_hien_co: 0
  });

  // Hỗ trợ phím Esc để đóng modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Cập nhật form khi đổi tháng hoặc mở modal
  useEffect(() => {
    if (!isOpen) return;
    setActiveTabMonth(currentMonth);
  }, [isOpen, currentMonth]);

  useEffect(() => {
    if (!isOpen) return;
    const config = monthlyConfigs[activeTabMonth] || {};
    const fundsVal = currentFunds?.so_tien_hien_co !== undefined 
      ? Number(currentFunds.so_tien_hien_co) 
      : (((Number(currentFunds?.tien_ngoai_vi) || 0) + (Number(currentFunds?.tien_trong_the) || 0)) || ((Number(config.tien_ngoai_vi) || 0) + (Number(config.tien_trong_the) || 0)));

    setFormData({
      ghi_chu: config.ghi_chu || '',
      banner_focus: config.banner_focus || '',
      han_muc_chi: config.han_muc_chi || 30000000,
      so_tien_hien_co: fundsVal
    });
  }, [isOpen, activeTabMonth, monthlyConfigs, currentFunds]);

  if (!isOpen) return null;

  // Format YYYY-MM sang dạng hiển thị tiếng Việt "Tháng MM/YYYY"
  const formatMonthLabel = (mStr) => {
    if (!mStr || !mStr.includes('-')) return mStr;
    const [year, month] = mStr.split('-');
    return `Tháng ${month}/${year}`;
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveMonthlyConfig({
      id: activeTabMonth,
      ghi_chu: formData.ghi_chu.trim(),
      banner_focus: formData.banner_focus.trim(),
      han_muc_chi: Number(formData.han_muc_chi) || 30000000,
      so_tien_hien_co: Number(formData.so_tien_hien_co) || 0,
      tien_ngoai_vi: Number(formData.so_tien_hien_co) || 0,
      tien_trong_the: 0
    });
    onClose();
  };

  const handleCreateNewMonth = (e) => {
    e.preventDefault();
    if (!newMonthInput) return;
    const clean = newMonthInput.trim();
    if (!/^\d{4}-\d{2}$/.test(clean)) {
      alert('Định dạng tháng không hợp lệ (Vui lòng chọn hoặc nhập dạng YYYY-MM, ví dụ 2026-11)!');
      return;
    }

    if (onAddMonth) {
      onAddMonth(clean);
    }
    setActiveTabMonth(clean);
    onSelectMonth(clean);
    setIsAddingNewMonth(false);
    setNewMonthInput('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white p-5 md:p-6 rounded-2xl border border-pink-200/90 shadow-xl shadow-pink-100/40 space-y-4 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Calendar size={18} weight="bold" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Quản Lý Tháng & Ghi Chú
              </h3>
              <p className="text-xs text-slate-500">
                Chuyển tháng, đặt mục tiêu và lưu ghi chú riêng cho từng tháng
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            title="Đóng (phím Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Danh sách các tháng & nút thêm tháng */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Chọn tháng làm việc:
            </span>
            <button
              type="button"
              onClick={() => setIsAddingNewMonth(!isAddingNewMonth)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <Plus size={13} weight="bold" />
              <span>{isAddingNewMonth ? 'Đóng thêm tháng' : 'Thêm tháng mới'}</span>
            </button>
          </div>

          {/* Form thêm tháng mới */}
          {isAddingNewMonth && (
            <form onSubmit={handleCreateNewMonth} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex gap-2 items-center">
              <input
                type="month"
                required
                value={newMonthInput}
                onChange={(e) => setNewMonthInput(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-500 flex-1 tabular-nums font-medium"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold tactile-btn transition-colors"
              >
                Mở tháng
              </button>
            </form>
          )}

          {/* Danh sách Pills chọn tháng */}
          <div className="flex flex-wrap gap-1.5">
            {availableMonths.map((m) => {
              const isSelected = activeTabMonth === m;
              const isCurrentActive = currentMonth === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setActiveTabMonth(m);
                    onSelectMonth(m);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium tactile-btn transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs font-semibold'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{formatMonthLabel(m)}</span>
                  {isCurrentActive && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-emerald-600'}`}></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form ghi chú và hạn mức của tháng đang chọn */}
        <form onSubmit={handleSave} className="pt-2 border-t border-slate-100 space-y-3.5 text-xs">
          
          <div className="flex items-center justify-between text-xs pb-1">
            <span className="font-bold text-slate-900">
              Cài đặt & Ghi chú cho {formatMonthLabel(activeTabMonth)}:
            </span>
          </div>

          {/* 1. Ghi chú riêng của tháng */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1 flex items-center gap-1.5">
              <Note size={14} className="text-emerald-700" weight="bold" />
              <span>Ghi chú riêng của tháng (Note):</span>
            </label>
            <textarea
              rows={4}
              placeholder="VD: Tháng này có đám cưới bạn thân, cần chuẩn bị tiền bảo hiểm xe máy, tiền thưởng cuối quý..."
              value={formData.ghi_chu}
              onChange={(e) => setFormData({ ...formData, ghi_chu: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500 leading-relaxed font-normal"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Ghi chú này sẽ được lưu riêng cho {formatMonthLabel(activeTabMonth)} và hiển thị trên màn hình tổng quan.
            </p>
          </div>

          {/* 2. Mục tiêu trọng tâm / Lời nhắc ngắn */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1 flex items-center gap-1.5">
              <Target size={14} className="text-emerald-700" weight="bold" />
              <span>Mục tiêu ngắn / Lời nhắc trọng tâm:</span>
            </label>
            <input
              type="text"
              placeholder="VD: Tiết kiệm tối thiểu 5 triệu, hạn chế ăn ngoài..."
              value={formData.banner_focus}
              onChange={(e) => setFormData({ ...formData, banner_focus: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500 font-medium"
            />
          </div>

          {/* 3. Số tiền hiện có */}
          <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
            <label className="block text-emerald-950 font-semibold mb-1 flex items-center gap-1.5">
              <Wallet size={16} className="text-emerald-700" weight="bold" />
              <span>Số tiền hiện có (Tài sản khả dụng):</span>
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="0"
                value={formData.so_tien_hien_co || ''}
                onChange={(e) => setFormData({ ...formData, so_tien_hien_co: e.target.value })}
                className="w-full py-2 pl-3 pr-8 bg-white border border-emerald-300 rounded-xl text-emerald-950 font-bold focus:outline-none focus:border-emerald-500 tabular-nums text-sm"
              />
              <span className="absolute right-3 top-2 text-xs text-emerald-700 font-semibold">đ</span>
            </div>
            <p className="text-[11px] text-emerald-800/80 mt-1.5">
              Tổng số tiền khả dụng hiện có. Số tiền này sẽ tự động cộng khi Thu và trừ khi Chi hàng tháng.
            </p>
          </div>

          {/* Nút lưu */}
          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              Hủy bỏ (Esc)
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Check size={16} weight="bold" />
              <span>Lưu ghi chú tháng</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
