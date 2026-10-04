import React, { useState } from 'react';
import { 
  Trash, 
  DownloadSimple, 
  Table, 
  ListBullets,
  MagnifyingGlass,
  SlidersHorizontal,
  PencilSimple,
  Clock,
  Plus,
  ArrowDown,
  ArrowUp
} from '@phosphor-icons/react';
import { categoriesList, macroTypesList } from '../data/initialData';
import TransactionModal from './TransactionModal';

export default function TransactionList({ 
  transactions = [], 
  currentMonth = '2026-10',
  availableMonths = [],
  onAddTransaction,
  onDeleteTransaction, 
  onUpdateTransaction,
  categories = categoriesList,
  macroTypes = macroTypesList,
  members = [],
  onOpenCategoryManager,
  privacyMode, 
  activeVault = 'all',
  activeUser
}) {
  const [filterMonth, setFilterMonth] = useState('current');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // Trên điện thoại, ưu tiên dạng thẻ (cards) cực kỳ tiện thao tác cảm ứng
  const [mobileView, setMobileView] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'cards';
    }
    return 'table';
  });

  // Modal Thêm / Sửa thu chi
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  const formatMoney = (val) => {
    if (!val || val === 0) return '';
    if (privacyMode) return '•••••• đ';
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  // Mở modal thêm mới
  const handleOpenAdd = () => {
    setEditingTx(null);
    setIsModalOpen(true);
  };

  // Mở modal sửa
  const handleOpenEdit = (tx) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  // Lưu từ modal (thêm hoặc sửa)
  const handleSaveModal = (txData) => {
    if (editingTx) {
      onUpdateTransaction(editingTx.id, txData);
    } else if (onAddTransaction) {
      onAddTransaction(txData);
    }
  };

  // Xóa có xác nhận an toàn
  const handleDeleteWithConfirm = (tx) => {
    const amountStr = (tx.thu || 0) > 0 
      ? `+${new Intl.NumberFormat('vi-VN').format(tx.thu)} đ`
      : `-${new Intl.NumberFormat('vi-VN').format(tx.chi)} đ`;

    if (window.confirm(`Bạn có chắc chắn muốn xóa "${tx.noi_dung}" (${amountStr}) khỏi sổ không?`)) {
      onDeleteTransaction(tx.id);
    }
  };

  // Lọc dữ liệu theo tháng, phân loại, loại, từ khóa
  const filteredList = transactions.filter((tx) => {
    // Lọc theo tháng
    if (filterMonth === 'current') {
      if (currentMonth && !(tx.ngay || '').startsWith(currentMonth)) return false;
    } else if (filterMonth !== 'all') {
      if (!(tx.ngay || '').startsWith(filterMonth)) return false;
    }

    // Lọc theo phân loại
    if (filterCategory !== 'all' && tx.phan_loai !== filterCategory) return false;

    // Lọc theo loại
    if (filterType !== 'all' && tx.loai !== filterType) return false;

    // Tìm kiếm nội dung
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      const matchTitle = (tx.noi_dung || '').toLowerCase().includes(q);
      const matchNote = (tx.ghi_chu || '').toLowerCase().includes(q);
      if (!matchTitle && !matchNote) return false;
    }

    return true;
  });

  const totalThu = filteredList.reduce((s, t) => s + (Number(t.thu) || 0), 0);
  const totalChi = filteredList.reduce((s, t) => s + (Number(t.chi) || 0), 0);

  // Xuất file CSV
  const handleExportCSV = () => {
    const headers = ['Ngày', 'Giờ', 'Nội dung', 'Thu', 'Chi', 'Phân loại', 'Loại', 'Không gian', 'Người ghi', 'Ghi chú'];
    const rows = filteredList.map(t => [
      t.ngay,
      t.gio || '',
      `"${(t.noi_dung || '').replace(/"/g, '""')}"`,
      t.thu || 0,
      t.chi || 0,
      t.phan_loai || '',
      t.loai || '',
      t.vault === 'shared' ? 'Quỹ chung' : t.vault === 'personal_nhut' ? 'Ví Nhựt' : 'Ví Trang',
      t.author || '',
      `"${(t.ghi_chu || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `thu_chi_thang_10_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectCategory = (txId, val) => {
    if (val === '__manage__') {
      if (onOpenCategoryManager) onOpenCategoryManager();
      return;
    }
    if (onUpdateTransaction) onUpdateTransaction(txId, 'phan_loai', val);
  };

  const handleSelectMacroType = (txId, val) => {
    if (val === '__manage__') {
      if (onOpenCategoryManager) onOpenCategoryManager();
      return;
    }
    if (onUpdateTransaction) onUpdateTransaction(txId, 'loai', val);
  };

  return (
    <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-3 pb-12">
      <div className="card-soft overflow-hidden">
        
        {/* Thanh công cụ tìm kiếm & Thao tác Thêm / Sửa / Xuất file */}
        <div className="p-3.5 md:p-4 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative flex-1 max-w-xs">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm nội dung..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
              />
              <MagnifyingGlass size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            </div>

            {/* Lọc Theo Tháng */}
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-emerald-500 shadow-2xs"
            >
              <option value="current">
                {currentMonth?.includes('-') ? `Tháng ${currentMonth.split('-')[1]}/${currentMonth.split('-')[0]}` : currentMonth} (Đang xem)
              </option>
              <option value="all">Tất cả các tháng ({transactions.length})</option>
              {availableMonths
                .filter(m => m !== currentMonth)
                .map(m => {
                  const parts = m.split('-');
                  const label = parts.length === 2 ? `Tháng ${parts[1]}/${parts[0]}` : m;
                  return (
                    <option key={m} value={m}>
                      {label}
                    </option>
                  );
                })}
            </select>

            {/* Lọc Phân loại */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Tất cả phân loại</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Lọc Loại */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 hidden sm:block"
            >
              <option value="all">Tất cả loại</option>
              {macroTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Cụm nút Thêm mới & Quản lý danh mục & Chuyển chế độ xem & Xuất file */}
          <div className="flex items-center gap-2">
            
            {/* NÚT THÊM THU CHI MỚI */}
            <button
              onClick={handleOpenAdd}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors tactile-btn"
              title="Thêm khoản thu chi mới vào sổ"
            >
              <Plus size={14} weight="bold" />
              <span>Thêm thu chi</span>
            </button>

            {/* Nút quản lý phân loại & loại */}
            <button
              onClick={onOpenCategoryManager}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 tactile-btn flex items-center gap-1.5 transition-colors font-medium shadow-2xs"
              title="Thêm, sửa, xóa phân loại và loại"
            >
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">Sửa danh mục</span>
            </button>

            <button
              onClick={() => setMobileView(mobileView === 'table' ? 'cards' : 'table')}
              className="md:hidden px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 tactile-btn flex items-center gap-1"
            >
              {mobileView === 'table' ? <ListBullets size={14} /> : <Table size={14} />}
              <span>{mobileView === 'table' ? 'Thẻ' : 'Bảng'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 tactile-btn flex items-center gap-1.5 transition-colors font-medium shadow-2xs"
              title="Xuất file CSV/Excel"
            >
              <DownloadSimple size={14} />
              <span className="hidden sm:inline">Xuất Excel</span>
            </button>
          </div>

        </div>

        {/* 1. DẠNG BẢNG CHUẨN GOOGLE SHEETS */}
        {mobileView === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              
              {/* Tiêu đề bảng */}
              <thead>
                <tr className="bg-[#1B4D3E] text-white border-b border-emerald-900 font-semibold tracking-wide">
                  <th className="py-2.5 px-3.5 w-28">Ngày & Giờ</th>
                  <th className="py-2.5 px-3.5">Nội dung</th>
                  <th className="py-2.5 px-3.5 text-right w-28"># Thu</th>
                  <th className="py-2.5 px-3.5 text-right w-28"># Chi</th>
                  <th className="py-2.5 px-3.5 text-center w-32">Phân loại</th>
                  <th className="py-2.5 px-3.5 text-center w-32">Loại</th>
                  <th className="py-2.5 px-3 text-center w-24">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      Không có bản ghi nào trong danh sách.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((tx) => {
                    const hasThu = (tx.thu || 0) > 0;
                    const hasChi = (tx.chi || 0) > 0;

                    return (
                      <tr 
                        key={tx.id} 
                        className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Ngày & Giờ */}
                        <td className="py-2.5 px-3.5 tabular-nums text-slate-600 whitespace-nowrap">
                          <div className="font-medium text-slate-800 leading-tight">
                            {tx.ngay}
                          </div>
                          <div className="text-[11px] text-slate-400 tabular-nums flex items-center gap-1 mt-0.5 font-medium">
                            <Clock size={11} className="text-slate-400 shrink-0" />
                            <span>{tx.gio || '08:00'}</span>
                          </div>
                        </td>

                        {/* Nội dung */}
                        <td className="py-2.5 px-3.5 font-medium text-slate-800">
                          <div>{tx.noi_dung}</div>
                          {tx.ghi_chu && (
                            <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                              {tx.ghi_chu}
                            </div>
                          )}
                        </td>

                        {/* Thu */}
                        <td className="py-2.5 px-3.5 text-right tabular-nums font-semibold text-emerald-700 whitespace-nowrap">
                          {hasThu ? formatMoney(tx.thu) : ''}
                        </td>

                        {/* Chi */}
                        <td className="py-2.5 px-3.5 text-right tabular-nums font-semibold text-slate-800 whitespace-nowrap">
                          {hasChi ? formatMoney(tx.chi) : ''}
                        </td>

                        {/* Phân loại Dropdown */}
                        <td className="py-2 px-2 text-center whitespace-nowrap">
                          <select
                            value={tx.phan_loai || (categories[0] || 'ăn uống')}
                            onChange={(e) => handleSelectCategory(tx.id, e.target.value)}
                            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/90 text-slate-800 text-[11px] font-medium border border-slate-300/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white cursor-pointer text-center appearance-none pr-5.5 transition-colors relative"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23475569' viewBox='0 0 16 16'%3E%3Cpath d='M4.5 6l3.5 4 3.5-4z'/%3E%3C/svg%3E")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 6px center',
                              backgroundSize: '10px'
                            }}
                          >
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                            <option value="__manage__">✏️ Sửa danh mục...</option>
                          </select>
                        </td>

                        {/* Loại Dropdown */}
                        <td className="py-2 px-2 text-center whitespace-nowrap">
                          <select
                            value={tx.loai || (macroTypes[0] || 'thiết yếu')}
                            onChange={(e) => handleSelectMacroType(tx.id, e.target.value)}
                            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/90 text-slate-800 text-[11px] font-medium border border-slate-300/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white cursor-pointer text-center appearance-none pr-5.5 transition-colors relative"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23475569' viewBox='0 0 16 16'%3E%3Cpath d='M4.5 6l3.5 4 3.5-4z'/%3E%3C/svg%3E")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 6px center',
                              backgroundSize: '10px'
                            }}
                          >
                            {macroTypes.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                            <option value="__manage__">✏️ Sửa danh mục...</option>
                          </select>
                        </td>

                        {/* THAO TÁC: SỬA & XÓA */}
                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(tx)}
                              className="text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 p-1.5 rounded-lg transition-colors"
                              title="Sửa khoản thu chi này"
                            >
                              <PencilSimple size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteWithConfirm(tx)}
                              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                              title="Xóa khoản thu chi này"
                            >
                              <Trash size={15} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Dòng tổng cộng */}
              <tfoot>
                <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800">
                  <td colSpan="2" className="py-3 px-3.5 text-right uppercase text-[11px] tracking-wider text-slate-500">
                    Tổng cộng:
                  </td>
                  <td className="py-3 px-3.5 text-right tabular-nums text-emerald-700 font-bold">
                    {formatMoney(totalThu)}
                  </td>
                  <td className="py-3 px-3.5 text-right tabular-nums text-slate-900 font-bold">
                    {formatMoney(totalChi)}
                  </td>
                  <td colSpan="3" className="py-3 px-3.5 text-right text-xs text-slate-500 font-medium">
                    Còn dư: <strong className="text-emerald-800 tabular-nums">{new Intl.NumberFormat('vi-VN').format(totalThu - totalChi)} đ</strong>
                  </td>
                </tr>
              </tfoot>

            </table>
          </div>
        ) : (
          /* 2. DẠNG THẺ GỌN CHO ĐIỆN THOẠI CỰC KỲ ĐẸP MẮT & TIỆN LỢI */
          <div>
            {filteredList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-3">
                <p className="text-xs">Không tìm thấy khoản thu chi nào phù hợp.</p>
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  <Plus size={14} weight="bold" />
                  <span>Thêm khoản đầu tiên</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredList.map((tx) => {
                  const isThu = (tx.thu || 0) > 0;
                  return (
                    <div 
                      key={tx.id} 
                      className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 active:bg-slate-50 transition-colors"
                    >
                      {/* Icon & Nội dung */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isThu ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isThu ? <ArrowDown size={14} weight="bold" /> : <ArrowUp size={14} weight="bold" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-slate-900 truncate">
                            {tx.noi_dung}
                          </div>
                          
                          {/* Dòng thông tin phụ: Ngày, Giờ, Phân loại, Người ghi */}
                          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 mt-1 flex-wrap">
                            <span className="tabular-nums font-medium text-slate-600">{tx.ngay}</span>
                            <span className="text-slate-300">•</span>
                            <span className="tabular-nums text-slate-500 flex items-center gap-0.5">
                              <Clock size={10} className="text-slate-400" />
                              <span>{tx.gio || '08:00'}</span>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                              {tx.phan_loai}
                            </span>
                            {tx.author && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-400 font-medium">
                                  {tx.author}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Số tiền & Nút Sửa / Xóa */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="text-right">
                          {isThu ? (
                            <div className="text-xs font-bold text-emerald-700 tabular-nums">
                              +{new Intl.NumberFormat('vi-VN').format(tx.thu)} đ
                            </div>
                          ) : (
                            <div className="text-xs font-bold text-slate-800 tabular-nums">
                              -{new Intl.NumberFormat('vi-VN').format(tx.chi)} đ
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-0.5 pl-1.5 border-l border-slate-100">
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 rounded-lg transition-colors"
                            title="Sửa"
                          >
                            <PencilSimple size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteWithConfirm(tx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Dòng tổng kết ở đáy dạng thẻ cho mobile */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-500">
                <span>Tổng Thu:</span>
                <span className="font-bold text-emerald-700 tabular-nums">+{formatMoney(totalThu)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Tổng Chi:</span>
                <span className="font-bold text-slate-900 tabular-nums">-{formatMoney(totalChi)}</span>
              </div>
              <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/80 font-bold">
                <span className="text-slate-800">Còn dư:</span>
                <span className="text-emerald-800 tabular-nums text-sm font-extrabold">
                  {new Intl.NumberFormat('vi-VN').format(totalThu - totalChi)} đ
                </span>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* POPUP THÊM & SỬA THU CHI */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transactionToEdit={editingTx}
        onSave={handleSaveModal}
        categories={categories}
        macroTypes={macroTypes}
        members={members}
        activeUser={activeUser}
        currentMonth={currentMonth}
      />

    </section>
  );
}
