import React, { useState } from 'react';
import { 
  Lightning, 
  ChatTeardropText, 
  Microphone, 
  Coffee, 
  ForkKnife, 
  ShoppingCart, 
  GasPump, 
  BowlFood,
  Laptop,
  Receipt,
  Plus,
  Check,
  Sparkle
} from '@phosphor-icons/react';
import { quickPresets, sampleSmsTemplates, categoriesList, macroTypesList } from '../data/initialData';
import { parseBankSMS, parseNaturalVoicePrompt } from '../utils/parser';

export default function QuickEntry({ 
  onAddTransaction, 
  activeUser, 
  activeVault,
  onShowToast 
}) {
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'sms' | 'voice' | 'manual'
  const [smsInput, setSmsInput] = useState('');
  const [parsedPreview, setParsedPreview] = useState(null);
  const [naturalInput, setNaturalInput] = useState('');
  const [manualData, setManualData] = useState({
    noi_dung: '',
    thu: '',
    chi: '',
    phan_loai: 'ăn uống',
    loai: 'thiết yếu',
    vault: activeVault === 'shared' ? 'shared' : `personal_${activeUser}`,
    author: activeUser === 'nhut' ? 'Nhựt' : 'Trang',
    ngay: new Date().toISOString().split('T')[0],
    ghi_chu: ''
  });

  const getPresetIcon = (iconName) => {
    switch (iconName) {
      case 'Coffee': return <Coffee size={22} className="text-amber-400" />;
      case 'ForkKnife': return <ForkKnife size={22} className="text-orange-400" />;
      case 'ShoppingCart': return <ShoppingCart size={22} className="text-emerald-400" />;
      case 'GasPump': return <GasPump size={22} className="text-blue-400" />;
      case 'Cup': return <BowlFood size={22} className="text-pink-400" />;
      case 'BowlFood': return <BowlFood size={22} className="text-pink-400" />;
      case 'Laptop': return <Laptop size={22} className="text-purple-400" />;
      default: return <Receipt size={22} className="text-slate-400" />;
    }
  };

  // 1-Tap Preset Click
  const handlePresetClick = (preset) => {
    const targetVault = activeVault === 'personal' 
      ? `personal_${activeUser}` 
      : preset.defaultVault;

    const newTx = {
      id: 'tx-' + Date.now(),
      ngay: new Date().toISOString().split('T')[0],
      noi_dung: preset.label,
      thu: preset.isIncome ? preset.amount : 0,
      chi: !preset.isIncome ? preset.amount : 0,
      phan_loai: preset.phan_loai,
      loai: preset.loai,
      vault: targetVault,
      author: activeUser === 'nhut' ? 'Nhựt' : 'Trang',
      ghi_chu: 'Ghi nhanh 1-chạm'
    };

    onAddTransaction(newTx);
    onShowToast(`⚡ Đã ghi nhanh: ${preset.label} (${preset.isIncome ? '+' : '-'}${new Intl.NumberFormat('vi-VN').format(preset.amount)} ₫)`);
  };

  // SMS Parser
  const handleParseSms = (text) => {
    setSmsInput(text);
    if (!text.trim()) {
      setParsedPreview(null);
      return;
    }
    const result = parseBankSMS(text, activeUser);
    setParsedPreview(result);
  };

  const handleConfirmSms = () => {
    if (!parsedPreview) return;
    onAddTransaction(parsedPreview);
    const amountVal = parsedPreview.thu > 0 ? `+${parsedPreview.thu}` : `-${parsedPreview.chi}`;
    onShowToast(`💳 Đã lưu từ SMS: ${parsedPreview.noi_dung} (${amountVal} ₫)`);
    setSmsInput('');
    setParsedPreview(null);
  };

  // Natural Language
  const handleNaturalSubmit = (e) => {
    e.preventDefault();
    if (!naturalInput.trim()) return;
    const result = parseNaturalVoicePrompt(naturalInput, activeUser);
    if (result) {
      onAddTransaction(result);
      onShowToast(`🗣️ Đã nhận diện & ghi sổ: ${result.noi_dung}`);
      setNaturalInput('');
    }
  };

  // Manual Form Submit
  const handleManualSubmit = (e) => {
    e.preventDefault();
    const thuNum = parseInt(manualData.thu || '0', 10);
    const chiNum = parseInt(manualData.chi || '0', 10);

    if (!manualData.noi_dung || (thuNum === 0 && chiNum === 0)) {
      alert('Vui lòng nhập nội dung và số tiền Thu hoặc Chi!');
      return;
    }

    const newTx = {
      id: 'tx-' + Date.now(),
      ngay: manualData.ngay || new Date().toISOString().split('T')[0],
      noi_dung: manualData.noi_dung,
      thu: thuNum,
      chi: chiNum,
      phan_loai: manualData.phan_loai,
      loai: manualData.loai,
      vault: manualData.vault,
      author: manualData.author,
      ghi_chu: manualData.ghi_chu
    };

    onAddTransaction(newTx);
    onShowToast(`✅ Đã thêm: ${newTx.noi_dung}`);
    setManualData({
      noi_dung: '',
      thu: '',
      chi: '',
      phan_loai: 'ăn uống',
      loai: 'thiết yếu',
      vault: activeVault === 'shared' ? 'shared' : `personal_${activeUser}`,
      author: activeUser === 'nhut' ? 'Nhựt' : 'Trang',
      ngay: new Date().toISOString().split('T')[0],
      ghi_chu: ''
    });
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-3">
      <div className="glass-panel p-6 md:p-7 rounded-3xl border border-white/[0.08] relative overflow-hidden shadow-2xl">
        
        {/* Header with Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-6 border-b border-white/[0.08]">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lightning size={20} className="text-amber-400" weight="fill" />
              Ghi Nhanh Tiện Lợi (Zero Friction)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Thao tác siêu tốc giúp duy trì thói quen ghi chép mỗi ngày mà không bị nản.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-white/[0.08] overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tactile-btn whitespace-nowrap transition-all ${
                activeTab === 'presets' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚡ 1-Chạm Thường Dùng
            </button>
            <button
              onClick={() => setActiveTab('sms')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tactile-btn whitespace-nowrap transition-all ${
                activeTab === 'sms' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📩 Dán SMS Ngân Hàng
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tactile-btn whitespace-nowrap transition-all ${
                activeTab === 'voice' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🗣️ Nhập Câu Tự Nhiên
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tactile-btn whitespace-nowrap transition-all ${
                activeTab === 'manual' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ✍️ Chi Tiết (Chuẩn Sheet)
            </button>
          </div>
        </div>

        {/* TAB 1: 1-Tap Quick Presets */}
        {activeTab === 'presets' && (
          <div>
            <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
              <span>Chạm 1 nút để tự động ghi và phân loại:</span>
              <span className="text-[11px] text-emerald-400 font-semibold">Người ghi: {activeUser === 'nhut' ? 'Nhựt' : 'Trang'}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {quickPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetClick(preset)}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-white/[0.08] hover:border-emerald-500/50 hover:bg-slate-850 hover:shadow-xl hover:shadow-emerald-950/30 tactile-btn transition-all text-left flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800/90 group-hover:bg-emerald-500/15 flex items-center justify-center transition-colors">
                      {getPresetIcon(preset.icon)}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-emerald-400">
                      {preset.phan_loai}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-200 group-hover:text-white truncate">
                      {preset.label}
                    </div>
                    <div className={`text-sm font-bold tabular-nums mt-1 ${
                      preset.isIncome ? 'text-emerald-400' : 'text-white'
                    }`}>
                      {preset.isIncome ? '+' : '-'}{new Intl.NumberFormat('vi-VN').format(preset.amount)} ₫
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: SMS Bank Parser */}
        {activeTab === 'sms' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Dán tin nhắn thông báo biến động số dư (Techcombank, Vietcombank, Momo, MBBank...):
              </label>
              <textarea
                value={smsInput}
                onChange={(e) => handleParseSms(e.target.value)}
                placeholder="Ví dụ: TK 1903... tai TCB GD -185,000VND luc 04/10/2026. ND: WINMART CONG HOA..."
                rows={3}
                className="w-full p-4 rounded-2xl bg-slate-900/90 border border-white/[0.08] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400">Thử ngay mẫu có sẵn:</span>
              {sampleSmsTemplates.map((tpl, idx) => (
                <button
                  key={idx}
                  onClick={() => handleParseSms(tpl.text)}
                  className="px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 border border-white/[0.08] tactile-btn transition-colors text-[11px]"
                >
                  📋 {tpl.name}
                </button>
              ))}
            </div>

            {parsedPreview && (
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 text-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      Tự nhận diện thành công ✨
                    </span>
                    <span className="text-xs text-slate-400">
                      Phân loại: <strong className="text-white">{parsedPreview.phan_loai}</strong> ({parsedPreview.loai})
                    </span>
                  </div>
                  <div className="text-base font-bold text-white flex items-center gap-2">
                    <span>{parsedPreview.noi_dung}</span>
                    <span className={`tabular-nums ${parsedPreview.thu > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {parsedPreview.thu > 0 ? `+${new Intl.NumberFormat('vi-VN').format(parsedPreview.thu)} ₫` : `-${new Intl.NumberFormat('vi-VN').format(parsedPreview.chi)} ₫`}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>Đích đến:</span>
                    <select
                      value={parsedPreview.vault}
                      onChange={(e) => setParsedPreview({ ...parsedPreview, vault: e.target.value })}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-emerald-300 focus:outline-none"
                    >
                      <option value="shared">🌿 Quỹ Chung Tổ Ấm</option>
                      <option value="personal_nhut">🔒 Ví Riêng Nhựt</option>
                      <option value="personal_trang">🔒 Ví Riêng Trang</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleConfirmSms}
                  className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 tactile-btn shadow-lg transition-all"
                >
                  <Check size={18} weight="bold" />
                  Xác nhận lưu vào sổ
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Natural Language */}
        {activeTab === 'voice' && (
          <form onSubmit={handleNaturalSubmit} className="space-y-3">
            <div className="text-xs text-slate-400">
              Nhập câu tự nhiên, hệ thống tự động bóc tách số tiền, phân loại và người ghi:
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={naturalInput}
                onChange={(e) => setNaturalInput(e.target.value)}
                placeholder="Ví dụ: Trang đi bách hóa xanh 190k nước giặt pin... hoặc Nhựt nhận phí web 2 triệu"
                className="flex-1 px-4 py-3.5 rounded-2xl bg-slate-900/90 border border-white/[0.08] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 tactile-btn transition-all shadow-md"
              >
                <Sparkle size={18} weight="fill" />
                Ghi sổ tức thì
              </button>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 pt-1">
              <span>Gợi ý mẫu:</span>
              <button
                type="button"
                onClick={() => setNaturalInput('Bách hóa xanh nước giặt, pin 190k quỹ chung')}
                className="text-emerald-400 hover:underline"
              >
                "Bách hóa xanh nước giặt, pin 190k quỹ chung"
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setNaturalInput('phí sửa web 2tr')}
                className="text-emerald-400 hover:underline"
              >
                "phí sửa web 2tr"
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setNaturalInput('Cơm sườn 24k')}
                className="text-emerald-400 hover:underline"
              >
                "Cơm sườn 24k"
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: Detailed Manual Form */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Ngày</label>
              <input
                type="date"
                required
                value={manualData.ngay}
                onChange={(e) => setManualData({ ...manualData, ngay: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-900/90 border border-white/[0.08] text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Nội dung</label>
              <input
                type="text"
                required
                placeholder="Ăn sáng sữa đậu nành, phí web..."
                value={manualData.noi_dung}
                onChange={(e) => setManualData({ ...manualData, noi_dung: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-900/90 border border-white/[0.08] text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-emerald-400 mb-1 font-medium">Thu (₫)</label>
              <input
                type="number"
                placeholder="Để trống nếu là Chi"
                value={manualData.thu}
                onChange={(e) => setManualData({ ...manualData, thu: e.target.value, chi: e.target.value ? '' : manualData.chi })}
                className="w-full p-3 rounded-xl bg-slate-900/90 border border-white/[0.08] text-emerald-300 font-semibold focus:border-emerald-500 focus:outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="block text-rose-400 mb-1 font-medium">Chi (₫)</label>
              <input
                type="number"
                placeholder="Để trống nếu là Thu"
                value={manualData.chi}
                onChange={(e) => setManualData({ ...manualData, chi: e.target.value, thu: e.target.value ? '' : manualData.thu })}
                className="w-full p-3 rounded-xl bg-slate-900/90 border border-white/[0.08] text-rose-300 font-semibold focus:border-emerald-500 focus:outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Phân loại</label>
              <select
                value={manualData.phan_loai}
                onChange={(e) => setManualData({ ...manualData, phan_loai: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-900/90 border border-white/[0.08] text-slate-100 focus:border-emerald-500 focus:outline-none"
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Loại</label>
              <select
                value={manualData.loai}
                onChange={(e) => setManualData({ ...manualData, loai: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-900/90 border border-white/[0.08] text-slate-100 focus:border-emerald-500 focus:outline-none"
              >
                {macroTypesList.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Không gian (Ví)</label>
              <select
                value={manualData.vault}
                onChange={(e) => setManualData({ ...manualData, vault: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-900/90 border border-white/[0.08] text-slate-100 focus:border-emerald-500 focus:outline-none"
              >
                <option value="shared">🌿 Quỹ Chung Tổ Ấm</option>
                <option value="personal_nhut">🔒 Ví Riêng Nhựt</option>
                <option value="personal_trang">🔒 Ví Riêng Trang</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold tactile-btn flex items-center justify-center gap-1.5 transition-colors shadow-md"
              >
                <Plus size={16} weight="bold" />
                Lưu Vào Sổ
              </button>
            </div>
          </form>
        )}

      </div>
    </section>
  );
}
