import React, { useState } from 'react';
import { X, Plus, PencilSimple, Trash, Check, UserPlus, Users, Key, ShieldCheck } from '@phosphor-icons/react';
import { hashPin } from '../utils/crypto';

export default function MemberManagerModal({
  isOpen,
  onClose,
  members,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  currentUserId
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form thêm / sửa
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    pin: '',
    role: 'Thành viên',
    color: 'emerald'
  });

  // Hỗ trợ phím Esc để tắt modal quản lý thành viên
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

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      name: '',
      username: '',
      pin: '',
      role: 'Thành viên',
      color: 'emerald'
    });
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setIsAdding(false);
    setFormData({
      name: m.name,
      username: m.username,
      pin: '',
      role: m.role || 'Thành viên',
      color: m.color || 'emerald'
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    const trimmedUser = formData.username.trim().toLowerCase();
    const trimmedPin = formData.pin.trim();

    if (!trimmedName || !trimmedUser) {
      alert('Vui lòng điền đủ Tên và Tên tài khoản!');
      return;
    }

    if (isAdding) {
      if (!trimmedPin) {
        alert('Vui lòng nhập Mật khẩu / Mã PIN cho thành viên mới!');
        return;
      }
      // Kiểm tra trùng username
      if (members.some(m => m.username.toLowerCase() === trimmedUser)) {
        alert('Tên tài khoản này đã tồn tại!');
        return;
      }

      const pinHash = await hashPin(trimmedPin);
      onAddMember({
        id: 'm-' + Date.now(),
        name: trimmedName,
        username: trimmedUser,
        pin_hash: pinHash,
        role: formData.role,
        vault: `personal_${trimmedUser}`,
        color: formData.color
      });
      setIsAdding(false);
    } else if (editingId) {
      // Kiểm tra trùng username với người khác
      if (members.some(m => m.id !== editingId && m.username.toLowerCase() === trimmedUser)) {
        alert('Tên tài khoản này đã bị trùng!');
        return;
      }

      const updates = {
        name: trimmedName,
        username: trimmedUser,
        role: formData.role,
        color: formData.color
      };

      // Chỉ cập nhật mật khẩu nếu người dùng nhập mật khẩu mới
      if (trimmedPin) {
        updates.pin_hash = await hashPin(trimmedPin);
      }

      onUpdateMember(editingId, updates);
      setEditingId(null);
    }
  };

  const handleDelete = (m) => {
    if (members.length <= 1) {
      alert('Gia đình cần có ít nhất 1 thành viên!');
      return;
    }
    if (m.id === currentUserId) {
      alert('Bạn đang đăng nhập tài khoản này, không thể xóa chính mình!');
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa thành viên "${m.name}" khỏi danh sách gia đình?`)) {
      onDeleteMember(m.id);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Tiêu đề & Nút đóng */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Users size={18} weight="bold" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Quản Lý Thành Viên Gia Đình
              </h3>
              <p className="text-xs text-slate-500">
                Thêm, phân quyền hoặc đổi mã PIN đăng nhập cho thành viên
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Danh sách thành viên */}
        {!isAdding && !editingId && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Danh sách hiện tại ({members.length} người)
              </span>
              <button
                onClick={startAdd}
                className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium tactile-btn flex items-center gap-1 shadow-2xs"
              >
                <UserPlus size={14} weight="bold" />
                <span>Thêm thành viên</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
              {members.map((m) => {
                const isCurrent = m.id === currentUserId;
                return (
                  <div key={m.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        m.color === 'pink' ? 'bg-pink-100 text-pink-700' :
                        m.color === 'blue' ? 'bg-sky-100 text-sky-700' :
                        m.color === 'amber' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {m.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-slate-900 truncate">
                            {m.name}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-medium px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                              Đang dùng
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>@{m.username}</span>
                          <span>•</span>
                          <span className="text-slate-600">{m.role || 'Thành viên'}</span>
                          <span>•</span>
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-medium border border-emerald-200 flex items-center gap-1">
                            <ShieldCheck size={12} weight="bold" />
                            <span>Mật khẩu: ••••</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(m)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Sửa thông tin"
                      >
                        <PencilSimple size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(m)}
                        disabled={isCurrent}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isCurrent
                            ? 'text-slate-200 cursor-not-allowed'
                            : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title={isCurrent ? 'Không thể xóa tài khoản đang đăng nhập' : 'Xóa thành viên'}
                      >
                        <Trash size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Biểu mẫu Thêm / Sửa */}
        {(isAdding || editingId) && (
          <form onSubmit={handleSave} className="space-y-3.5 pt-1">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">
                {isAdding ? 'Thêm thành viên mới' : 'Chỉnh sửa thông tin thành viên'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-700 underline"
              >
                Quay lại danh sách
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              
              {/* Tên hiển thị */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-slate-600 font-medium mb-1">Tên hiển thị:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bé Bắp, Mẹ..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white"
                />
              </div>

              {/* Tên tài khoản */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-slate-600 font-medium mb-1">Tên đăng nhập (username):</label>
                <input
                  type="text"
                  required
                  placeholder="ví dụ: bebap, me..."
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white font-mono"
                />
              </div>

              {/* Mã PIN / Mật khẩu */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-slate-600 font-medium mb-1">Mật khẩu / Mã PIN:</label>
                <input
                  type="text"
                  required
                  placeholder="1234"
                  value={formData.pin}
                  onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white font-mono font-bold tracking-wider"
                />
              </div>

              {/* Vai trò */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-slate-600 font-medium mb-1">Vai trò trong nhà:</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white font-medium"
                >
                  <option value="Chủ gia đình">Chủ gia đình</option>
                  <option value="Đồng quản lý">Đồng quản lý</option>
                  <option value="Thành viên">Thành viên</option>
                  <option value="Con cái">Con cái</option>
                </select>
              </div>

              {/* Màu đại diện */}
              <div className="col-span-2">
                <label className="block text-slate-600 font-medium mb-1.5">Màu đại diện:</label>
                <div className="flex gap-2">
                  {[
                    { id: 'emerald', label: 'Xanh ngọc', bg: 'bg-emerald-500' },
                    { id: 'pink', label: 'Hồng', bg: 'bg-pink-500' },
                    { id: 'blue', label: 'Xanh dương', bg: 'bg-sky-500' },
                    { id: 'amber', label: 'Cam vàng', bg: 'bg-amber-500' },
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c.id })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        formData.color === c.id
                          ? 'border-slate-800 bg-slate-50 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${c.bg}`}></span>
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Check size={14} weight="bold" />
                <span>{isAdding ? 'Thêm mới' : 'Cập nhật'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
