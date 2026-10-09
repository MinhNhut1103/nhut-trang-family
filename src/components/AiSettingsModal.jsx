import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkle, 
  Key, 
  Cpu, 
  Globe, 
  CheckCircle, 
  WarningCircle, 
  Eye, 
  EyeSlash, 
  ArrowClockwise,
  FloppyDisk,
  ShieldCheck
} from '@phosphor-icons/react';
import { AVAILABLE_MODELS, getAiConfig, saveAiConfig, testAiConnection } from '../services/kiraAiService';

export default function AiSettingsModal({ isOpen, onClose, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    baseUrl: 'https://kiraai.vn/api/v1',
    apiKey: '',
    model: 'qwen3.8-max-free',
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, message: string }
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Khởi tạo giá trị khi mở modal
  useEffect(() => {
    if (isOpen) {
      const current = getAiConfig();
      setFormData({
        baseUrl: current.baseUrl || 'https://kiraai.vn/api/v1',
        apiKey: current.apiKey || '',
        model: current.model || 'qwen3.8-max-free',
      });
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  // Hỗ trợ phím Esc để đóng modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testAiConnection(formData);
      if (res.success) {
        setTestResult({
          success: true,
          message: `Kết nối thành công! Phản hồi từ model ${formData.model}: "${res.reply.trim()}"`
        });
      } else {
        setTestResult({
          success: false,
          message: res.error || 'Kiểm tra thất bại. Vui lòng xem lại API Key hoặc Endpoint!'
        });
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = saveAiConfig(formData);
    if (ok) {
      setSaveSuccess(true);
      if (onSaveSuccess) onSaveSuccess(formData);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-pink-200/90 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
        
        {/* Header Modal */}
        <div className="px-5 py-4 border-b border-pink-100 flex items-center justify-between bg-gradient-to-r from-pink-50/80 via-rose-50/40 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center shadow-xs">
              <Sparkle size={20} weight="fill" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                Cài Đặt Quản Gia AI
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                  Quản gia nhà Nhựt Trang
                </span>
              </h3>
              <p className="text-xs text-slate-500">Cấu hình kết nối API thông minh để kích hoạt Quản gia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 tactile-btn"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          
          {/* Thông tin bảo mật */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-pink-50/60 border border-pink-100 text-xs text-pink-900/90 leading-relaxed">
            <ShieldCheck size={18} weight="fill" className="text-pink-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Bảo mật tuyệt đối:</span> Bạn có thể cấu hình API Key trực tiếp trong file <code className="bg-white px-1.5 py-0.5 rounded text-pink-700 border border-pink-200">.env</code> hoặc điền ngay tại form này. Key chỉ được lưu an toàn trên trình duyệt của bạn.
            </div>
          </div>

          {/* 1. Endpoint chung */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Globe size={14} weight="bold" className="text-pink-600" />
              API Base URL / Endpoint
            </label>
            <input
              type="text"
              value={formData.baseUrl}
              onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
              placeholder="https://..."
              required
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Đường dẫn đầy đủ: <code className="text-slate-600 font-mono">{formData.baseUrl.replace(/\/+$/, '')}/chat/completions</code>
            </p>
          </div>

          {/* 2. API Key */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key size={14} weight="bold" className="text-pink-600" />
                API Key (Khóa kết nối)
              </span>
              {formData.apiKey && (
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle size={12} weight="fill" /> Đã có khóa
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="Dán API Key của bạn..."
                required
                className="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600"
              >
                {showApiKey ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* 3. Dropdown Chọn Model AI */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Cpu size={14} weight="bold" className="text-pink-600" />
                Mô hình AI (Chọn qua Dropdown)
              </span>
              <span className="text-[10px] text-pink-700 font-bold px-2 py-0.5 rounded-full bg-pink-100 border border-pink-200">
                Mặc định: Kira Mini 1.0 ⭐
              </span>
            </label>

            {/* Dropdown Menu chọn Model */}
            <div className="relative">
              <select
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-pink-300 bg-white text-slate-800 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all cursor-pointer shadow-xs"
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.isDefault ? '⭐ (Khuyên dùng)' : `(${m.badge})`} — {m.id}
                  </option>
                ))}
              </select>
            </div>

            {/* Thẻ hiển thị chi tiết Model đang chọn */}
            {(() => {
              const activeM = AVAILABLE_MODELS.find(m => m.id === formData.model) || AVAILABLE_MODELS[0];
              return (
                <div className="mt-2.5 p-3 rounded-xl bg-gradient-to-r from-pink-50/80 to-rose-50/50 border border-pink-200 text-xs flex items-start justify-between gap-3 animate-fade-in">
                  <div>
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      {activeM.name}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeM.isDefault
                          ? 'bg-pink-200 text-pink-800 border border-pink-300'
                          : 'bg-white text-slate-700 border border-slate-200'
                      }`}>
                        {activeM.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      {activeM.description}
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-pink-700 font-bold bg-white px-2 py-1 rounded-lg border border-pink-200 shrink-0 shadow-xs">
                    ID: {activeM.id}
                  </div>
                </div>
              );
            })()}

            {/* Danh sách thẻ model bấm nhanh */}
            <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {AVAILABLE_MODELS.map((m) => {
                const isSelected = formData.model === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, model: m.id })}
                    className={`p-2 rounded-xl border text-left transition-all tactile-btn flex flex-col justify-between ${
                      isSelected
                        ? 'border-pink-500 bg-pink-50 ring-1 ring-pink-400 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-pink-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-[11px] text-slate-800 truncate">
                      {m.name}
                    </div>
                    <div className="text-[9px] font-mono text-slate-400 truncate mt-0.5">
                      {m.id}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kết quả Test kết nối */}
          {testResult && (
            <div className={`p-3 rounded-xl text-xs flex items-start gap-2 animate-fade-in ${
              testResult.success 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {testResult.success ? (
                <CheckCircle size={16} weight="fill" className="text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <WarningCircle size={16} weight="fill" className="text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="break-words leading-relaxed">
                {testResult.message}
              </div>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <CheckCircle size={16} weight="fill" className="text-emerald-500" />
              Đã lưu cấu hình Quản gia AI thành công!
            </div>
          )}

          {/* Footer Nút hành động */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting || !formData.apiKey}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 tactile-btn transition-colors disabled:opacity-50"
            >
              <ArrowClockwise size={14} weight="bold" className={isTesting ? 'animate-spin' : ''} />
              {isTesting ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 sm:w-auto px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold tactile-btn transition-colors"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="w-1/2 sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-pink-200 flex items-center justify-center gap-1.5 tactile-btn transition-all"
              >
                <FloppyDisk size={14} weight="bold" />
                Lưu cấu hình
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
