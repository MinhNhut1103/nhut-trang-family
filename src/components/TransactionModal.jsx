import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, Plus, PencilSimple, ArrowDown, ArrowUp, Money, CreditCard } from '@phosphor-icons/react';
import { getCurrentTime } from '../data/initialData';

export default function TransactionModal({
  isOpen,
  onClose,
  transactionToEdit = null, // null = Thêm mới, object = Sửa
  defaultDate = null,
  onSave,
  categories = [],
  macroTypes = [],
  members = [],
  activeUser = 'nhut',
  currentMonth
}) {
  const isEditing = Boolean(transactionToEdit);

  const getInitialDate = () => {
    if (defaultDate) return defaultDate;
    const today = new Date().toISOString().split('T')[0];
    if (currentMonth && !today.startsWith(currentMonth)) {
      return `${currentMonth}-01`;
    }
    return today;
  };

  const [formData, setFormData] = useState({
    actionType: 'chi', // 'chi' | 'thu'
    so_tien: '',
    noi_dung: '',
    ngay: getInitialDate(),
    gio: getCurrentTime(),
    phan_loai: categories[0] || 'ăn uống',
    loai: macroTypes[0] || 'thiết yếu',
    vault: 'shared',
    wallet_source: 'card', // 'cash' | 'card'
    author: 'Nhựt',
    ghi_chu: ''
  });

  // Khởi tạo dữ liệu khi mở modal hoặc đổi giao dịch cần sửa
  useEffect(() => {
    if (!isOpen) return;

    if (transactionToEdit) {
      const isThu = (Number(transactionToEdit.thu) || 0) > 0;
      const amount = isThu ? transactionToEdit.thu : (transactionToEdit.chi || 0);
      const isCash = transactionToEdit.wallet_source === 'cash' || transactionToEdit.ghi_chu?.includes('[Tiền mặt]');
      const cleanNote = (transactionToEdit.ghi_chu || '').replace(/\[Tiền mặt\]|\[Thẻ NH\]/g, '').trim();

      setFormData({
        actionType: isThu ? 'thu' : 'chi',
        so_tien: amount ? String(amount) : '',
        noi_dung: transactionToEdit.noi_dung || '',
        ngay: transactionToEdit.ngay || getInitialDate(),
        gio: transactionToEdit.gio || getCurrentTime(),
        phan_loai: transactionToEdit.phan_loai || (categories[0] || 'ăn uống'),
        loai: transactionToEdit.loai || (macroTypes[0] || 'thiết yếu'),
        vault: transactionToEdit.vault || 'shared',
        wallet_source: isCash ? 'cash' : 'card',
        author: transactionToEdit.author || (activeUser === 'nhut' ? 'Nhựt' : 'Trang'),
        ghi_chu: cleanNote
      });
    } else {
      const currentMember = members.find(m => m.username === activeUser);
      setFormData({
        actionType: 'chi',
        so_tien: '',
        noi_dung: '',
        ngay: defaultDate || getInitialDate(),
        gio: getCurrentTime(),
        phan_loai: categories[0] || 'ăn uống',
        loai: macroTypes[0] || 'thiết yếu',
        vault: 'shared',
        wallet_source: 'card',
        author: currentMember ? currentMember.name : (activeUser === 'nhut' ? 'Nhựt' : 'Trang'),
        ghi_chu: ''
      });
    }
  }, [isOpen, transactionToEdit, defaultDate, categories, macroTypes, members, activeUser, currentMonth]);

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

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const rawAmount = String(formData.so_tien).replace(/\D/g, '');
    const numAmount = parseInt(rawAmount, 10);

    if (!formData.noi_dung.trim()) {
      alert('Vui lòng nhập nội dung thu chi!');
      return;
    }

    if (!numAmount || numAmount <= 0) {
      alert('Vui lòng nhập số tiền lớn hơn 0!');
      return;
    }

    const payload = {
      id: transactionToEdit ? transactionToEdit.id : ('tx-' + Date.now()),
      ngay: formData.ngay,
      gio: formData.gio || getCurrentTime(),
      noi_dung: formData.noi_dung.trim(),
      thu: formData.actionType === 'thu' ? numAmount : 0,
      chi: formData.actionType === 'chi' ? numAmount : 0,
      phan_loai: formData.phan_loai,
      loai: formData.loai,
      vault: formData.vault,
      wallet_source: formData.wallet_source || 'card',
      author: formData.author,
      ghi_chu: formData.ghi_chu.trim()
    };

    onSave(payload);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-lg p-5 md:p-6 rounded-2xl border shadow-xl space-y-4 max-h-[92vh] overflow-y-auto transition-colors duration-300 ${
          formData.actionType === 'chi'
            ? 'bg-gradient-to-b from-rose-50/80 via-white to-white border-rose-200/90 shadow-rose-950/5'
            : 'bg-gradient-to-b from-emerald-50/80 via-white to-white border-emerald-200/90 shadow-emerald-950/5'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              formData.actionType === 'chi'
                ? 'bg-rose-100 text-rose-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {isEditing ? (
                <PencilSimple size={18} weight="bold" />
              ) : formData.actionType === 'chi' ? (
                <ArrowDown size={18} weight="bold" />
              ) : (
                <Plus size={18} weight="bold" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {isEditing ? 'Sửa Khoản Thu Chi' : formData.actionType === 'chi' ? 'Thêm Khoản Chi Mới' : 'Thêm Khoản Thu Mới'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditing ? 'Cập nhật lại thông tin đã ghi trong sổ' : formData.actionType === 'chi' ? 'Ghi chép khoản đã chi tiêu vào sổ' : 'Ghi chép nguồn thu nhập mới vào sổ'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Đóng (phím Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form nhập liệu */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* 1. Chọn loại Thu hay Chi */}
          <div>
            <label className="block text-slate-500 font-medium mb-1">Loại giao dịch</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, actionType: 'chi' })}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-semibold transition-all cursor-pointer ${
                  formData.actionType === 'chi'
                    ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-2xs font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowDown size={14} weight="bold" />
                <span>Khoản Chi (-)</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, actionType: 'thu' })}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-semibold transition-all cursor-pointer ${
                  formData.actionType === 'thu'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowUp size={14} weight="bold" />
                <span>Khoản Thu (+)</span>
              </button>
            </div>
          </div>

          {/* 2. CHỌN NGUỒN TIỀN (VÍ TIỀN MẶT HOẶC THẺ NGÂN HÀNG) */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Nguồn tiền thực tế:
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                {formData.actionType === 'chi' ? 'Trừ trực tiếp số tiền hiện có' : 'Cộng trực tiếp số tiền hiện có'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, wallet_source: 'cash' })}
                className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer ${
                  formData.wallet_source === 'cash'
                    ? 'bg-amber-100/90 border-amber-300 text-amber-950 font-bold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-amber-50/50'
                }`}
              >
                <Money size={15} weight="bold" className="text-amber-700" />
                <span>Tiền ngoài ví (Tiền mặt)</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, wallet_source: 'card' })}
                className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer ${
                  formData.wallet_source === 'card'
                    ? 'bg-blue-100/90 border-blue-300 text-blue-950 font-bold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-blue-50/50'
                }`}
              >
                <CreditCard size={15} weight="bold" className="text-blue-700" />
                <span>Tiền trong thẻ (Ngân hàng)</span>
              </button>
            </div>
          </div>

          {/* 2. Số tiền & Nội dung */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Số tiền (đ) *</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  placeholder="50000"
                  value={formData.so_tien}
                  onChange={(e) => setFormData({ ...formData, so_tien: e.target.value })}
                  className={`w-full py-2 pl-3 pr-8 bg-slate-50 border rounded-xl text-sm font-bold tabular-nums focus:outline-none focus:bg-white ${
                    formData.actionType === 'thu'
                      ? 'text-emerald-700 border-slate-200 focus:border-emerald-500'
                      : 'text-rose-600 border-slate-200 focus:border-rose-500'
                  }`}
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">đ</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Nội dung giao dịch *</label>
              <input
                type="text"
                required
                placeholder="VD: Cơm trưa, Xăng xe, Tiền lương..."
                value={formData.noi_dung}
                onChange={(e) => setFormData({ ...formData, noi_dung: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-emerald-500"
              />
            </div>
          </div>

          {/* 3. Phân loại & Loại (dạng dropdown) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Phân loại</label>
              <select
                value={formData.phan_loai}
                onChange={(e) => setFormData({ ...formData, phan_loai: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-emerald-500"
              >
                {(categories.includes(formData.phan_loai) ? categories : [formData.phan_loai, ...categories]).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Loại</label>
              <select
                value={formData.loai}
                onChange={(e) => setFormData({ ...formData, loai: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-emerald-500"
              >
                {(macroTypes.includes(formData.loai) ? macroTypes : [formData.loai, ...macroTypes]).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Ngày ghi */}
          <div>
            <label className="block text-slate-500 font-medium mb-1 flex items-center gap-1">
              <Calendar size={13} className="text-slate-400" />
              <span>Ngày ghi</span>
            </label>
            <input
              type="date"
              required
              value={formData.ngay}
              onChange={(e) => setFormData({ ...formData, ngay: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-emerald-500 tabular-nums"
            />
          </div>

          {/* 5. Người ghi */}
          <div>
            <label className="block text-slate-500 font-medium mb-1">Người ghi</label>
            <select
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-emerald-500"
            >
              {members.length > 0 ? (
                members.map(m => (
                  <option key={m.id} value={m.name}>{m.name} ({m.username})</option>
                ))
              ) : (
                <>
                  <option value="Nhựt">Nhựt</option>
                  <option value="Trang">Trang</option>
                </>
              )}
            </select>
          </div>

          {/* 6. Ghi chú */}
          <div>
            <label className="block text-slate-500 font-medium mb-1">Ghi chú thêm (tùy chọn)</label>
            <input
              type="text"
              placeholder="VD: Mua chung, hoàn tiền..."
              value={formData.ghi_chu}
              onChange={(e) => setFormData({ ...formData, ghi_chu: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500"
            />
          </div>

          {/* Nút hành động */}
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
              className={`flex-1 py-2.5 rounded-xl text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all tactile-btn cursor-pointer ${
                formData.actionType === 'chi'
                  ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-rose-600/20'
                  : 'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 shadow-emerald-700/20'
              }`}
            >
              <Check size={16} weight="bold" />
              <span>{isEditing ? 'Lưu thay đổi' : formData.actionType === 'chi' ? 'Thêm khoản chi' : 'Thêm khoản thu'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
