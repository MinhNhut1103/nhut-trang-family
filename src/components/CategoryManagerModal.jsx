import React, { useState } from 'react';
import { X, Plus, PencilSimple, Trash, Check } from '@phosphor-icons/react';

export default function CategoryManagerModal({
  isOpen,
  onClose,
  categories,
  macroTypes,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddMacroType,
  onUpdateMacroType,
  onDeleteMacroType
}) {
  const [activeTab, setActiveTab] = useState('category'); // 'category' | 'macroType'
  const [newItemName, setNewItemName] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  // Hỗ trợ phím Esc để tắt popup
  React.useEffect(() => {
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

  const isCat = activeTab === 'category';
  const currentList = isCat ? categories : macroTypes;

  const handleAdd = (e) => {
    e.preventDefault();
    const val = newItemName.trim();
    if (!val) return;

    if (currentList.includes(val)) {
      alert('Tên này đã tồn tại trong danh sách!');
      return;
    }

    if (isCat) {
      onAddCategory(val);
    } else {
      onAddMacroType(val);
    }
    setNewItemName('');
  };

  const startEdit = (idx, val) => {
    setEditingIndex(idx);
    setEditingValue(val);
  };

  const saveEdit = (oldVal) => {
    const val = editingValue.trim();
    if (!val || val === oldVal) {
      setEditingIndex(null);
      return;
    }

    if (isCat) {
      onUpdateCategory(oldVal, val);
    } else {
      onUpdateMacroType(oldVal, val);
    }
    setEditingIndex(null);
  };

  const handleDelete = (val) => {
    if (currentList.length <= 1) {
      alert('Cần giữ lại ít nhất 1 mục trong danh mục!');
      return;
    }
    if (confirm(`Bạn có chắc muốn xóa "${val}"?`)) {
      if (isCat) {
        onDeleteCategory(val);
      } else {
        onDeleteMacroType(val);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Tiêu đề & Nút đóng */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Quản Lý Phân Loại & Loại
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Thêm, sửa tên hoặc xóa các mục theo nhu cầu thực tế
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab chuyển đổi */}
        <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => { setActiveTab('category'); setEditingIndex(null); }}
            className={`flex-1 py-1.5 rounded-lg font-medium tactile-btn transition-colors ${
              isCat ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Phân loại ({categories.length})
          </button>
          <button
            onClick={() => { setActiveTab('macroType'); setEditingIndex(null); }}
            className={`flex-1 py-1.5 rounded-lg font-medium tactile-btn transition-colors ${
              !isCat ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Loại ({macroTypes.length})
          </button>
        </div>

        {/* Ô thêm mục mới */}
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            required
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={isCat ? "Nhập tên phân loại mới (vd: thể thao)..." : "Nhập loại mới (vd: đầu tư)..."}
            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold tactile-btn flex items-center gap-1 shadow-2xs"
          >
            <Plus size={14} weight="bold" />
            <span>Thêm</span>
          </button>
        </form>

        {/* Danh sách các mục hiện có */}
        <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200/80 p-1">
          {currentList.map((item, idx) => (
            <div 
              key={idx} 
              className="py-2 px-3 flex items-center justify-between gap-2 hover:bg-slate-50 rounded-lg group text-xs"
            >
              {editingIndex === idx ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs border border-emerald-500 rounded-md focus:outline-none bg-white"
                    autoFocus
                  />
                  <button
                    onClick={() => saveEdit(item)}
                    className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                    title="Lưu"
                  >
                    <Check size={15} weight="bold" />
                  </button>
                  <button
                    onClick={() => setEditingIndex(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    title="Hủy"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="font-medium text-slate-800">
                    {item}
                  </span>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => startEdit(idx, item)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded"
                      title="Sửa tên"
                    >
                      <PencilSimple size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                      title="Xóa mục này"
                    >
                      <Trash size={13} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Nút đóng */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium tactile-btn"
          >
            Hoàn tất
          </button>
        </div>

      </div>
    </div>
  );
}
