import React, { useState } from 'react';
import { 
  Trash, 
  Table, 
  SquaresFour, 
  DownloadSimple, 
  Sparkle,
  CalendarBlank,
  Tag,
  Funnel
} from '@phosphor-icons/react';
import { categoriesList, macroTypesList } from '../data/initialData';

export default function TransactionList({ 
  transactions, 
  onDeleteTransaction, 
  privacyMode, 
  activeVault,
  activeUser 
}) {
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [filterVault, setFilterVault] = useState('current'); // 'current' | 'all' | 'shared' | 'personal_nhut' | 'personal_trang'
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const formatMoney = (val) => {
    if (!val || val === 0) return '—';
    if (privacyMode) return '•••••• ₫';
    return new Intl.NumberFormat('vi-VN').format(val) + ' ₫';
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filterVault === 'current') {
      if (activeVault === 'shared' && tx.vault !== 'shared') return false;
      if (activeVault === 'personal' && tx.vault !== `personal_${activeUser}`) return false;
    } else if (filterVault !== 'all') {
      if (tx.vault !== filterVault) return false;
    }

    if (filterCategory !== 'all' && tx.phan_loai !== filterCategory) {
      return false;
    }

    if (filterType !== 'all' && tx.loai !== filterType) {
      return false;
    }

    return true;
  });

  const totalFilteredThu = filteredTransactions.reduce((s, t) => s + (Number(t.thu) || 0), 0);
  const totalFilteredChi = filteredTransactions.reduce((s, t) => s + (Number(t.chi) || 0), 0);

  const handleExportCSV = () => {
    const headers = ['Ngày', 'Nội dung', 'Thu', 'Chi', 'Phân loại', 'Loại', 'Không gian', 'Người ghi', 'Ghi chú'];
    const rows = filteredTransactions.map(t => [
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
    link.setAttribute('download', `thu_chi_nhut_trang_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-5">
      <div className="glass-panel p-6 md:p-7 rounded-3xl border border-white/[0.08] shadow-2xl">
        
        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 pb-4 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Table size={20} className="text-emerald-400" />
                Sổ Nhật Ký Thu Chi (Chuẩn Google Sheets)
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold tabular-nums border border-white/[0.08]">
                {filteredTransactions.length} mục
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Đồng bộ dữ liệu thời gian thực với Supabase Postgres & tải về file Excel bất cứ lúc nào.
            </p>
          </div>

          {/* Right: View Mode & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-900/90 p-1 rounded-2xl border border-white/[0.08]">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-xl tactile-btn transition-colors ${
                  viewMode === 'table' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
                title="Dạng Bảng Tính (Table View)"
              >
                <Table size={16} weight="bold" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-xl tactile-btn transition-colors ${
                  viewMode === 'cards' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
                title="Dạng Thẻ (Card View)"
              >
                <SquaresFour size={16} weight="bold" />
              </button>
            </div>

            {/* Filter by Vault */}
            <select
              value={filterVault}
              onChange={(e) => setFilterVault(e.target.value)}
              className="bg-slate-900/90 border border-white/[0.08] rounded-2xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="current">Không gian đang xem</option>
              <option value="all">Tất cả các ví</option>
              <option value="shared">🌿 Quỹ Chung Tổ Ấm</option>
              <option value="personal_nhut">🔒 Ví Riêng Nhựt</option>
              <option value="personal_trang">🔒 Ví Riêng Trang</option>
            </select>

            {/* Filter by Category */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-900/90 border border-white/[0.08] rounded-2xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Tất cả phân loại</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Filter by Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-900/90 border border-white/[0.08] rounded-2xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Tất cả loại</option>
              {macroTypesList.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Export CSV button */}
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-2xl bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 tactile-btn transition-colors border border-white/[0.08]"
              title="Xuất file CSV/Excel"
            >
              <DownloadSimple size={15} />
              <span>Xuất CSV</span>
            </button>

          </div>
        </div>

        {/* 1. DẠNG BẢNG APPLE SPREADSHEET */}
        {viewMode === 'table' ? (
          <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
            <table className="w-full text-left border-collapse text-xs">
              
              {/* Header */}
              <thead>
                <tr className="bg-[#122820] text-emerald-200/90 border-b border-white/[0.08] font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Ngày</th>
                  <th className="py-3.5 px-4">Nội dung</th>
                  <th className="py-3.5 px-4 text-right text-emerald-300"># Thu</th>
                  <th className="py-3.5 px-4 text-right text-rose-300"># Chi</th>
                  <th className="py-3.5 px-4 text-center">Phân loại</th>
                  <th className="py-3.5 px-4 text-center">Loại</th>
                  <th className="py-3.5 px-4 text-center">Không gian</th>
                  <th className="py-3.5 px-4 text-center">Người ghi</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-white/[0.04] bg-slate-900/40">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-slate-500">
                      Không có bản ghi nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const hasThu = (tx.thu || 0) > 0;
                    const hasChi = (tx.chi || 0) > 0;

                    return (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors group">
                        
                        <td className="py-3.5 px-4 tabular-nums text-slate-300 font-mono whitespace-nowrap">
                          {tx.ngay}
                        </td>

                        <td className="py-3.5 px-4 font-medium text-white max-w-[280px]">
                          <div className="truncate" title={tx.noi_dung}>
                            {tx.noi_dung}
                          </div>
                          {tx.ghi_chu && (
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">
                              {tx.ghi_chu}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right tabular-nums font-bold whitespace-nowrap text-emerald-400">
                          {hasThu ? formatMoney(tx.thu) : '—'}
                        </td>

                        <td className="py-3.5 px-4 text-right tabular-nums font-semibold whitespace-nowrap text-slate-100">
                          {hasChi ? formatMoney(tx.chi) : '—'}
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                            tx.phan_loai === 'công việc' 
                              ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                              : tx.phan_loai === 'tiêu hao'
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                : tx.phan_loai === 'biếu tặng'
                                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          }`}>
                            {tx.phan_loai}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-white/[0.06]">
                            {tx.loai}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
                            tx.vault === 'shared'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                              : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                          }`}>
                            {tx.vault === 'shared' ? 'Quỹ chung' : tx.vault === 'personal_nhut' ? 'Ví Nhựt' : 'Ví Trang'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap font-medium text-slate-300">
                          {tx.author}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors tactile-btn"
                            title="Xóa mục này"
                          >
                            <Trash size={15} />
                          </button>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Total Footer */}
              <tfoot>
                <tr className="bg-slate-950/80 font-bold border-t border-white/[0.12] text-slate-200">
                  <td colSpan="2" className="py-4 px-4 uppercase tracking-wider text-right">
                    Tổng cộng:
                  </td>
                  <td className="py-4 px-4 text-right tabular-nums text-emerald-400 text-sm">
                    {formatMoney(totalFilteredThu)}
                  </td>
                  <td className="py-4 px-4 text-right tabular-nums text-rose-400 text-sm">
                    {formatMoney(totalFilteredChi)}
                  </td>
                  <td colSpan="5" className="py-4 px-4 text-right text-xs text-slate-400">
                    Chênh lệch ròng: <strong className="text-white tabular-nums">{formatMoney(totalFilteredThu - totalFilteredChi)}</strong>
                  </td>
                </tr>
              </tfoot>

            </table>
          </div>
        ) : (
          /* 2. DẠNG BENTO CARDS */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTransactions.map((tx) => (
              <div 
                key={tx.id}
                className="p-5 rounded-3xl bg-slate-900/80 border border-white/[0.08] hover:border-white/20 flex flex-col justify-between transition-all shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="font-mono text-slate-400">{tx.ngay}</span>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/[0.06]">
                      {tx.phan_loai} • {tx.loai}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm text-white mb-2 line-clamp-2">
                    {tx.noi_dung}
                  </h3>
                </div>

                <div className="pt-3.5 border-t border-white/[0.08] flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-400">Bởi: </span>
                    <strong className="text-slate-200">{tx.author}</strong>
                  </div>

                  <div className="text-right">
                    {tx.thu > 0 ? (
                      <span className="text-base font-bold text-emerald-400 tabular-nums">
                        +{formatMoney(tx.thu)}
                      </span>
                    ) : (
                      <span className="text-base font-bold text-white tabular-nums">
                        -{formatMoney(tx.chi)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
