import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Money, CreditCard } from '@phosphor-icons/react';
import { categoriesList, macroTypesList, getCurrentTime, formatDateDisplay } from '../data/initialData';

export default function QuickEntry({ 
  onAddTransaction, 
  activeUser, 
  activeVault,
  onShowToast,
  categories = categoriesList,
  macroTypes = macroTypesList,
  members = [],
  currentMonth
}) {
  const [confirmingQuickItem, setConfirmingQuickItem] = useState(null);

  const getInitialDate = () => {
    const today = new Date().toISOString().split('T')[0];
    if (currentMonth && !today.startsWith(currentMonth)) {
      return `${currentMonth}-01`;
    }
    return today;
  };

  const [isAddingPreset, setIsAddingPreset] = useState(false);
  const [presetForm, setPresetForm] = useState({
    label: '',
    amount: '',
    phan_loai: categories[0] || 'ăn uống',
    loai: macroTypes[0] || 'thiết yếu',
    type: 'chi',
    vault: 'shared'
  });

  // Hỗ trợ phím Esc để tắt popup xác nhận hoặc popup tạo mục
  useEffect(() => {
    if (!confirmingQuickItem && !isAddingPreset) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setConfirmingQuickItem(null);
        setIsAddingPreset(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmingQuickItem, isAddingPreset]);

  // Danh sách mục thêm nhanh do người dùng tự quản lý (lưu sessionStorage)
  const [quickList, setQuickList] = useState(() => {
    try {
      const saved = sessionStorage.getItem('nt_quick_presets');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const handleAddPresetSubmit = (e) => {
    e.preventDefault();
    const num = Number(String(presetForm.amount).replace(/\D/g, '')) || 0;
    if (!presetForm.label.trim() || num <= 0) {
      alert('Vui lòng nhập tên mục và số tiền hợp lệ!');
      return;
    }

    const newPreset = {
      label: presetForm.label.trim(),
      amount: num,
      phan_loai: presetForm.phan_loai,
      loai: presetForm.loai,
      type: presetForm.type || 'chi',
      vault: presetForm.vault || 'shared'
    };

    const updated = [...quickList, newPreset];
    setQuickList(updated);
    try {
      sessionStorage.setItem('nt_quick_presets', JSON.stringify(updated));
    } catch (e) {}
    if (onShowToast) onShowToast(`Đã lưu mục thường dùng: ${newPreset.label}`);
    setIsAddingPreset(false);
    setPresetForm({
      label: '',
      amount: '',
      phan_loai: categories[0] || 'ăn uống',
      loai: macroTypes[0] || 'thiết yếu',
      type: 'chi',
      vault: 'shared'
    });
  };

  const handleDeletePreset = (indexToDelete) => {
    const item = quickList[indexToDelete];
    if (window.confirm(`Bạn có chắc muốn xóa mục "${item.label}" khỏi danh sách thêm nhanh?`)) {
      const updated = quickList.filter((_, idx) => idx !== indexToDelete);
      setQuickList(updated);
      try {
        sessionStorage.setItem('nt_quick_presets', JSON.stringify(updated));
      } catch (e) {}
      if (onShowToast) onShowToast(`Đã xóa mục: ${item.label}`);
    }
  };

  const handleOpenQuickConfirm = (item) => {
    setConfirmingQuickItem({
      ...item,
      amount: item.amount,
      ngay: getInitialDate(),
      gio: getCurrentTime(),
      vault: item.vault || (activeVault === 'all' ? 'shared' : activeVault),
      ghi_chu: 'Thêm nhanh thường dùng'
    });
  };

  const handleConfirmQuickAdd = () => {
    if (!confirmingQuickItem) return;
    const num = Number(confirmingQuickItem.amount) || 0;
    if (num <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ!');
      return;
    }

    const currentMember = members.find(m => m.username === activeUser);
    const authorName = currentMember ? currentMember.name : (activeUser === 'nhut' ? 'Nhựt' : 'Trang');

    const newTx = {
      id: 'tx-' + Date.now(),
      ngay: confirmingQuickItem.ngay,
      gio: confirmingQuickItem.gio,
      noi_dung: confirmingQuickItem.label,
      thu: confirmingQuickItem.isIncome || confirmingQuickItem.type === 'thu' ? num : 0,
      chi: !confirmingQuickItem.isIncome && confirmingQuickItem.type !== 'thu' ? num : 0,
      phan_loai: confirmingQuickItem.phan_loai,
      loai: confirmingQuickItem.loai,
      vault: confirmingQuickItem.vault,
      author: authorName,
      ghi_chu: confirmingQuickItem.ghi_chu || 'Thêm nhanh thường dùng'
    };

    onAddTransaction(newTx);
    setConfirmingQuickItem(null);
  };

  return (
    <section className="w-full max-w-5xl mx-auto px-4 md:px-8">
      <div className="card-soft p-3.5 sm:p-4">
        
        {/* Nút bấm nhanh thường dùng */}
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-800">
              Thêm nhanh thường dùng:
            </span>
            <button
              type="button"
              onClick={() => setIsAddingPreset(true)}
              className="self-start sm:self-auto text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors tactile-btn shadow-2xs"
              title="Tự tạo mục chi tiêu thường dùng"
            >
              <Plus size={13} weight="bold" />
              <span>Thêm mục</span>
            </button>
          </div>

          {/* Danh sách nút bấm nhanh */}
          <div className="flex flex-wrap items-center gap-2">
            {quickList.length === 0 ? (
              <div className="text-xs text-slate-400 py-1 flex items-center gap-2">
                <span>Chưa có mục mẫu sẵn.</span>
                <button
                  type="button"
                  onClick={() => setIsAddingPreset(true)}
                  className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 hover:underline"
                >
                  <Plus size={13} weight="bold" />
                  <span>Tạo mục thường dùng</span>
                </button>
              </div>
            ) : (
              quickList.map((item, idx) => (
                <div key={idx} className="inline-flex items-center group shadow-2xs rounded-xl overflow-hidden border border-pink-200 hover:border-pink-400 transition-colors">
                  <button
                    type="button"
                    onClick={() => handleOpenQuickConfirm(item)}
                    className="px-3 py-1.5 bg-white hover:bg-pink-50/70 text-slate-700 hover:text-pink-800 text-xs font-medium tactile-btn transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{item.label}</span>
                    <span className="font-bold text-slate-900 tabular-nums font-money">
                      {new Intl.NumberFormat('vi-VN').format(item.amount)} đ
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePreset(idx)}
                    className="px-2 py-1.5 bg-pink-50/40 hover:bg-rose-50 hover:text-rose-600 border-l border-pink-200/80 text-slate-400 text-xs transition-colors"
                    title="Xóa mục này"
                  >
                    <X size={12} weight="bold" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* POPUP XÁC NHẬN THÊM NHANH THƯỜNG DÙNG */}
      {confirmingQuickItem && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setConfirmingQuickItem(null)}
        >
          <div 
            className="w-full max-w-sm bg-white p-5 rounded-2xl border border-pink-200/90 shadow-xl shadow-pink-100/40 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Popup */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check size={18} weight="bold" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Xác nhận thêm nhanh
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Kiểm tra và xác nhận trước khi lưu
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConfirmingQuickItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Thông tin khoản chi */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Nội dung:</span>
                <span className="font-bold text-slate-900">{confirmingQuickItem.label}</span>
              </div>

              {/* Số tiền có thể điều chỉnh nhanh nếu cần */}
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-500 shrink-0">Số tiền:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={confirmingQuickItem.amount}
                    onChange={(e) => setConfirmingQuickItem({
                      ...confirmingQuickItem,
                      amount: e.target.value
                    })}
                    className="w-28 text-right px-2 py-1 bg-white border border-slate-200 rounded-lg text-rose-600 font-bold text-sm tabular-nums focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-500">đ</span>
                </div>
              </div>

              {/* Phân loại */}
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Phân loại:</span>
                <select
                  value={confirmingQuickItem.phan_loai}
                  onChange={(e) => setConfirmingQuickItem({
                    ...confirmingQuickItem,
                    phan_loai: e.target.value
                  })}
                  className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-emerald-600 font-medium"
                >
                  {(categories.includes(confirmingQuickItem.phan_loai) ? categories : [confirmingQuickItem.phan_loai, ...categories]).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Loại */}
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Loại:</span>
                <select
                  value={confirmingQuickItem.loai}
                  onChange={(e) => setConfirmingQuickItem({
                    ...confirmingQuickItem,
                    loai: e.target.value
                  })}
                  className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-emerald-600 font-medium"
                >
                  {(macroTypes.includes(confirmingQuickItem.loai) ? macroTypes : [confirmingQuickItem.loai, ...macroTypes]).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Ngày ghi */}
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Ngày ghi:</span>
                <span className="text-slate-600 tabular-nums font-medium">
                  {formatDateDisplay(confirmingQuickItem.ngay)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Người ghi:</span>
                <span className="font-medium text-slate-700">
                  {members.find(m => m.username === activeUser)?.name || (activeUser === 'nhut' ? 'Nhựt' : 'Trang')}
                </span>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmingQuickItem(null)}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmQuickAdd}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Check size={14} weight="bold" />
                Xác nhận thêm
              </button>
            </div>

          </div>
        </div>
      )}

      {/* POPUP TỰ THÊM MỤC THƯỜNG DÙNG THỦ CÔNG */}
      {isAddingPreset && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsAddingPreset(false)}
        >
          <div 
            className="w-full max-w-sm bg-white p-5 rounded-2xl border border-pink-200/90 shadow-xl shadow-pink-100/40 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Plus size={16} weight="bold" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Tạo mục thêm nhanh
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Lưu các khoản bạn hay chi tiêu hàng ngày
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingPreset(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddPresetSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Tên mục thường dùng *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Cơm trưa, Cà phê, Xăng xe..."
                  value={presetForm.label}
                  onChange={(e) => setPresetForm({ ...presetForm, label: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Số tiền (đ) *</label>
                <input
                  type="number"
                  required
                  placeholder="VD: 35000"
                  value={presetForm.amount}
                  onChange={(e) => setPresetForm({ ...presetForm, amount: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-emerald-500 tabular-nums"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Phân loại</label>
                  <select
                    value={presetForm.phan_loai}
                    onChange={(e) => setPresetForm({ ...presetForm, phan_loai: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500 font-medium"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-medium mb-1">Loại</label>
                  <select
                    value={presetForm.loai}
                    onChange={(e) => setPresetForm({ ...presetForm, loai: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500 font-medium"
                  >
                    {macroTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingPreset(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
                >
                  Hủy (Esc)
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Check size={14} weight="bold" />
                  <span>Lưu mục</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
}
