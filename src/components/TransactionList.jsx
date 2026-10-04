import React, { useState } from 'react';
import { 
  Trash, 
  DownloadSimple, 
  Table, 
  ListBullets,
  MagnifyingGlass,
  SlidersHorizontal,
  PencilSimple
} from '@phosphor-icons/react';
import { categoriesList, macroTypesList } from '../data/initialData';

export default function TransactionList({ 
  transactions = [], 
  onDeleteTransaction, 
  onUpdateTransaction,
  categories = categoriesList,
  macroTypes = macroTypesList,
  onOpenCategoryManager,
  privacyMode, 
  activeVault,
  activeUser
}) {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [mobileView, setMobileView] = useState('table'); // 'table' | 'cards'

  const formatMoney = (val) => {
    if (!val || val === 0) return '';
    if (privacyMode) return '•••••• đ';
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  // Lọc dữ liệu
  const filteredList = transactions.filter((tx) => {
    // Lọc theo không gian
    if (activeVault === 'shared' && tx.vault !== 'shared') return false;
    if (activeVault === 'personal_nhut' && tx.vault !== 'personal_nhut') return false;
    if (activeVault === 'personal_trang' && tx.vault !== 'personal_trang') return false;

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
    const headers = ['Ngày', 'Nội dung', 'Thu', 'Chi', 'Phân loại', 'Loại', 'Không gian', 'Người ghi', 'Ghi chú'];
    const rows = filteredList.map(t => [
      t.ngay,
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
        
        {/* Thanh công cụ lọc phía trên bảng */}
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

          {/* Nút bấm chuyển chế độ xem & Quản lý danh mục & Xuất file */}
          <div className="flex items-center gap-2">
            
            {/* Nút quản lý phân loại & loại */}
            <button
              onClick={onOpenCategoryManager}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg text-slate-700 tactile-btn flex items-center gap-1.5 transition-colors font-medium shadow-2xs"
              title="Thêm, sửa, xóa phân loại và loại"
            >
              <SlidersHorizontal size={14} />
              <span>Sửa danh mục</span>
            </button>

            <button
              onClick={() => setMobileView(mobileView === 'table' ? 'cards' : 'table')}
              className="md:hidden px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 tactile-btn flex items-center gap-1"
            >
              {mobileView === 'table' ? <ListBullets size={14} /> : <Table size={14} />}
              <span>{mobileView === 'table' ? 'Dạng thẻ' : 'Dạng bảng'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 tactile-btn flex items-center gap-1.5 transition-colors font-medium shadow-2xs"
              title="Xuất file CSV/Excel"
            >
              <DownloadSimple size={14} />
              <span>Xuất Excel</span>
            </button>
          </div>

        </div>

        {/* 1. DẠNG BẢNG CHUẨN GOOGLE SHEETS (ĐÃ BỎ DÒNG GIẢM MUA ĐỒ) */}
        {mobileView === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              
              {/* Tiêu đề bảng màu xanh lá đậm như hình */}
              <thead>
                <tr className="bg-[#1B4D3E] text-white border-b border-emerald-900 font-semibold tracking-wide">
                  <th className="py-2.5 px-3.5 w-24">Ngày</th>
                  <th className="py-2.5 px-3.5">Nội dung</th>
                  <th className="py-2.5 px-3.5 text-right w-28"># Thu</th>
                  <th className="py-2.5 px-3.5 text-right w-28"># Chi</th>
                  <th className="py-2.5 px-3.5 text-center w-32">Phân loại</th>
                  <th className="py-2.5 px-3.5 text-center w-32">Loại</th>
                  <th className="py-2.5 px-2 text-right w-12"></th>
                </tr>
              </thead>

              <tbody>
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      Không có bản ghi nào trong không gian này.
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
                        {/* Ngày */}
                        <td className="py-2.5 px-3.5 tabular-nums text-slate-600 whitespace-nowrap font-medium">
                          {tx.ngay}
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

                        {/* Phân loại Dropdown có hỗ trợ sửa/thêm */}
                        <td className="py-2 px-2 text-center whitespace-nowrap">
                          <select
                            value={tx.phan_loai || (categories[0] || 'ăn uống')}
                            onChange={(e) => handleSelectCategory(tx.id, e.target.value)}
                            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/90 text-slate-800 text-[11px] font-medium border border-slate-300/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer text-center appearance-none pr-5.5 transition-colors relative"
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

                        {/* Loại Dropdown có hỗ trợ sửa/thêm */}
                        <td className="py-2 px-2 text-center whitespace-nowrap">
                          <select
                            value={tx.loai || (macroTypes[0] || 'thiết yếu')}
                            onChange={(e) => handleSelectMacroType(tx.id, e.target.value)}
                            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/90 text-slate-800 text-[11px] font-medium border border-slate-300/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer text-center appearance-none pr-5.5 transition-colors relative"
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

                        {/* Thao tác xóa */}
                        <td className="py-2.5 px-2 text-right whitespace-nowrap">
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-600 p-1 rounded-md transition-all"
                            title="Xóa dòng này"
                          >
                            <Trash size={14} />
                          </button>
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
          /* 2. DẠNG THẺ GỌN CHO ĐIỆN THOẠI */
          <div className="p-3 divide-y divide-slate-100">
            {filteredList.map((tx) => (
              <div key={tx.id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {tx.noi_dung}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                    <span className="tabular-nums font-mono">{tx.ngay}</span>
                    <span>•</span>
                    
                    {/* Phân loại trên mobile */}
                    <select
                      value={tx.phan_loai || (categories[0] || 'ăn uống')}
                      onChange={(e) => handleSelectCategory(tx.id, e.target.value)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200 focus:outline-none"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="__manage__">✏️ Sửa danh mục...</option>
                    </select>

                    {/* Loại trên mobile */}
                    <select
                      value={tx.loai || (macroTypes[0] || 'thiết yếu')}
                      onChange={(e) => handleSelectMacroType(tx.id, e.target.value)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200 focus:outline-none"
                    >
                      {macroTypes.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                      <option value="__manage__">✏️ Sửa danh mục...</option>
                    </select>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {tx.thu > 0 ? (
                    <div className="text-xs font-bold text-emerald-700 tabular-nums">
                      +{new Intl.NumberFormat('vi-VN').format(tx.thu)} đ
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-slate-800 tabular-nums">
                      -{new Intl.NumberFormat('vi-VN').format(tx.chi)} đ
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
