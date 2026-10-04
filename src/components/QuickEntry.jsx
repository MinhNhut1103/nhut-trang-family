import React, { useState } from 'react';
import { Plus, CaretDown, CaretUp, Check, Clock, X } from '@phosphor-icons/react';
import { categoriesList, macroTypesList, getCurrentTime } from '../data/initialData';
import { parseBankSMS } from '../utils/parser';

export default function QuickEntry({ 
  onAddTransaction, 
  activeUser, 
  activeVault,
  onShowToast,
  categories = categoriesList,
  macroTypes = macroTypesList
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSmsBox, setShowSmsBox] = useState(false);
  const [smsText, setSmsText] = useState('');
  const [confirmingQuickItem, setConfirmingQuickItem] = useState(null);

  const [formData, setFormData] = useState({
    ngay: new Date().toISOString().split('T')[0],
    gio: getCurrentTime(),
    noi_dung: '',
    actionType: 'chi', // 'chi' | 'thu'
    so_tien: '',
    phan_loai: 'ăn uống',
    loai: 'thiết yếu',
    vault: activeVault === 'all' ? 'shared' : activeVault,
    ghi_chu: ''
  });

  // Mẫu nhanh dựa đúng thói quen chi tiêu
  const quickList = [
    { label: 'Cơm trưa', amount: 43000, phan_loai: 'ăn uống', loai: 'thiết yếu', type: 'chi', vault: 'personal_nhut' },
    { label: 'Ăn sáng sữa đậu nành', amount: 70000, phan_loai: 'ăn uống', loai: 'thiết yếu', type: 'chi', vault: 'shared' },
    { label: 'Cơm sườn', amount: 24000, phan_loai: 'ăn uống', loai: 'thiết yếu', type: 'chi', vault: 'personal_nhut' },
    { label: 'Bách hóa xanh', amount: 190000, phan_loai: 'tiêu hao', loai: 'thiết yếu', type: 'chi', vault: 'shared' },
    { label: 'Cơm nước', amount: 25000, phan_loai: 'ăn uống', loai: 'thiết yếu', type: 'chi', vault: 'shared' },
    { label: 'Bánh', amount: 40000, phan_loai: 'ăn uống', loai: 'thiết yếu', type: 'chi', vault: 'shared' },
  ];

  const handleOpenQuickConfirm = (item) => {
    setConfirmingQuickItem({
      ...item,
      amount: item.amount,
      ngay: new Date().toISOString().split('T')[0],
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

    const newTx = {
      id: 'tx-' + Date.now(),
      ngay: confirmingQuickItem.ngay,
      gio: confirmingQuickItem.gio,
      noi_dung: confirmingQuickItem.label,
      thu: confirmingQuickItem.type === 'thu' ? num : 0,
      chi: confirmingQuickItem.type === 'chi' ? num : 0,
      phan_loai: confirmingQuickItem.phan_loai,
      loai: confirmingQuickItem.loai,
      vault: confirmingQuickItem.vault,
      author: activeUser === 'nhut' ? 'Nhựt' : 'Trang',
      ghi_chu: confirmingQuickItem.ghi_chu || 'Thêm nhanh thường dùng'
    };

    onAddTransaction(newTx);
    onShowToast(`Đã thêm: ${newTx.noi_dung} (${new Intl.NumberFormat('vi-VN').format(num)} đ)`);
    setConfirmingQuickItem(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseInt((formData.so_tien || '0').replace(/\D/g, ''), 10);
    if (!formData.noi_dung || num <= 0) {
      alert('Vui lòng điền nội dung và số tiền hợp lệ!');
      return;
    }

    const newTx = {
      id: 'tx-' + Date.now(),
      ngay: formData.ngay || new Date().toISOString().split('T')[0],
      gio: formData.gio || getCurrentTime(),
      noi_dung: formData.noi_dung.trim(),
      thu: formData.actionType === 'thu' ? num : 0,
      chi: formData.actionType === 'chi' ? num : 0,
      phan_loai: formData.phan_loai,
      loai: formData.loai,
      vault: formData.vault,
      author: activeUser === 'nhut' ? 'Nhựt' : 'Trang',
      ghi_chu: formData.ghi_chu.trim()
    };

    onAddTransaction(newTx);
    onShowToast(`Đã lưu vào sổ: ${newTx.noi_dung}`);
    
    // Reset form giữ ngày
    setFormData(prev => ({
      ...prev,
      gio: getCurrentTime(),
      noi_dung: '',
      so_tien: '',
      ghi_chu: ''
    }));
    setIsExpanded(false);
  };

  const handleParseSms = () => {
    if (!smsText.trim()) return;
    const result = parseBankSMS(smsText, activeUser);
    if (result) {
      onAddTransaction(result);
      const val = result.thu > 0 ? `+${result.thu}` : `-${result.chi}`;
      onShowToast(`Đã nhận diện từ tin nhắn: ${result.noi_dung} (${val} đ)`);
      setSmsText('');
      setShowSmsBox(false);
    }
  };

  return (
    <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-2">
      <div className="card-soft p-4 md:p-5">
        
        {/* Nút bấm nhanh thường dùng */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold text-slate-700">
            Thêm nhanh thường dùng:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSmsBox(!showSmsBox)}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              {showSmsBox ? 'Đóng hộp tin nhắn' : 'Dán tin nhắn ngân hàng'}
            </button>
            <span>•</span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>{isExpanded ? 'Thu gọn biểu mẫu' : 'Mở biểu mẫu nhập chi tiết'}</span>
              {isExpanded ? <CaretUp size={13} /> : <CaretDown size={13} />}
            </button>
          </div>
        </div>

        {/* Danh sách nút bấm nhanh */}
        <div className="flex flex-wrap gap-2 mb-3">
          {quickList.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleOpenQuickConfirm(item)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200/80 text-xs font-medium text-slate-700 tactile-btn transition-colors cursor-pointer"
            >
              {item.label} <span className="font-semibold text-slate-900 ml-1 tabular-nums font-money">{new Intl.NumberFormat('vi-VN').format(item.amount)} đ</span>
            </button>
          ))}
        </div>

        {/* Hộp dán tin nhắn ngân hàng */}
        {showSmsBox && (
          <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="block text-xs font-medium text-slate-700">
              Dán nội dung tin nhắn biến động số dư (Vietcombank, Techcombank, MoMo...):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                placeholder="Ví dụ: GD -43,000VND Com trua... hoặc +2,000,000VND phi sua web"
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleParseSms}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium tactile-btn"
              >
                Nhận diện
              </button>
            </div>
          </div>
        )}

        {/* Biểu mẫu chi tiết */}
        {isExpanded && (
          <form onSubmit={handleSubmit} className="pt-3 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
            
            {/* Ngày */}
            <div className="col-span-1 md:col-span-1">
              <label className="block text-slate-500 mb-1 font-medium">Ngày</label>
              <input
                type="date"
                required
                value={formData.ngay}
                onChange={(e) => setFormData({ ...formData, ngay: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white text-xs font-medium"
              />
            </div>

            {/* Giờ */}
            <div className="col-span-1 md:col-span-1">
              <label className="block text-slate-500 mb-1 font-medium">Giờ</label>
              <input
                type="time"
                required
                value={formData.gio}
                onChange={(e) => setFormData({ ...formData, gio: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white text-xs tabular-nums font-medium"
              />
            </div>

            {/* Nội dung */}
            <div className="col-span-2 md:col-span-2">
              <label className="block text-slate-500 mb-1 font-medium">Nội dung</label>
              <input
                type="text"
                required
                placeholder="Ăn sáng, phí sửa web..."
                value={formData.noi_dung}
                onChange={(e) => setFormData({ ...formData, noi_dung: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white"
              />
            </div>

            {/* Loại tiền Thu hay Chi */}
            <div className="col-span-1 md:col-span-1">
              <label className="block text-slate-500 mb-1 font-medium">Khoản</label>
              <select
                value={formData.actionType}
                onChange={(e) => setFormData({ ...formData, actionType: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white font-medium"
              >
                <option value="chi">Khoản Chi (-)</option>
                <option value="thu">Khoản Thu (+)</option>
              </select>
            </div>

            {/* Số tiền */}
            <div className="col-span-1 md:col-span-1">
              <label className="block text-slate-500 mb-1 font-medium">Số tiền (đ)</label>
              <input
                type="number"
                required
                placeholder="43000"
                value={formData.so_tien}
                onChange={(e) => setFormData({ ...formData, so_tien: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-none focus:bg-white tabular-nums"
              />
            </div>

            {/* Phân loại */}
            <div className="col-span-1 md:col-span-1">
              <label className="block text-slate-500 mb-1 font-medium">Phân loại</label>
              <select
                value={formData.phan_loai}
                onChange={(e) => setFormData({ ...formData, phan_loai: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Loại */}
            <div className="col-span-1 md:col-span-1">
              <label className="block text-slate-500 mb-1 font-medium">Loại</label>
              <select
                value={formData.loai}
                onChange={(e) => setFormData({ ...formData, loai: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white"
              >
                {macroTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Không gian ví */}
            <div className="col-span-1 md:col-span-1">
              <label className="block text-slate-500 mb-1 font-medium">Không gian</label>
              <select
                value={formData.vault}
                onChange={(e) => setFormData({ ...formData, vault: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white"
              >
                <option value="shared">Quỹ chung</option>
                <option value="personal_nhut">Ví của Nhựt</option>
                <option value="personal_trang">Ví của Trang</option>
              </select>
            </div>

            {/* Nút thêm */}
            <div className="col-span-1 md:col-span-3 flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs tactile-btn flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Plus size={15} weight="bold" />
                Lưu vào sổ
              </button>
            </div>

          </form>
        )}

      </div>

      {/* POPUP XÁC NHẬN THÊM NHANH THƯỜNG DÙNG */}
      {confirmingQuickItem && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setConfirmingQuickItem(null)}
        >
          <div 
            className="w-full max-w-sm bg-white p-5 rounded-2xl border border-slate-200 shadow-xl space-y-4"
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

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Phân loại & Loại:</span>
                <span className="font-medium text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200/80">
                  {confirmingQuickItem.phan_loai} • {confirmingQuickItem.loai}
                </span>
              </div>

              {/* Chọn ví */}
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Không gian:</span>
                <select
                  value={confirmingQuickItem.vault}
                  onChange={(e) => setConfirmingQuickItem({
                    ...confirmingQuickItem,
                    vault: e.target.value
                  })}
                  className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 focus:outline-none"
                >
                  <option value="shared">Quỹ chung</option>
                  <option value="personal_nhut">Ví của Nhựt</option>
                  <option value="personal_trang">Ví của Trang</option>
                </select>
              </div>

              {/* Thời gian */}
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Thời gian:</span>
                <span className="text-slate-600 tabular-nums font-medium">
                  {confirmingQuickItem.ngay} • {confirmingQuickItem.gio}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Người ghi:</span>
                <span className="font-medium text-slate-700">
                  {activeUser === 'nhut' ? 'Nhựt' : 'Trang'}
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

    </section>
  );
}
