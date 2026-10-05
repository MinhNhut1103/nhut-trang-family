import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeSlash, 
  Database, 
  X, 
  Check, 
  Users, 
  SignOut 
} from '@phosphor-icons/react';
import { isSupabaseConfigured } from '../supabaseClient';

export default function Header({ 
  activeUser, 
  setActiveUser, 
  privacyMode, 
  setPrivacyMode,
  members = [],
  currentUser,
  currentMonth,
  onLogout,
  onOpenMemberManager,
  onSyncSupabase
}) {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Hỗ trợ phím Esc để tắt popup thông tin Supabase
  useEffect(() => {
    if (!showConfigModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowConfigModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showConfigModal]);

  const handleTriggerSync = async () => {
    if (!onSyncSupabase) return;
    setIsSyncing(true);
    try {
      await onSyncSupabase();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-pink-200/90 px-3 md:px-8 py-2.5 md:py-3 shadow-xs shadow-pink-100/30">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        
        {/* Tên ứng dụng */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Logo NT nằm trong trái tim màu hồng */}
          <div className="relative flex items-center justify-center shrink-0 w-9 h-9 md:w-10 md:h-10 transition-transform hover:scale-105" title="Nhựt & Trang">
            <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-xs" fill="url(#pinkHeartHeader)">
              <defs>
                <linearGradient id="pinkHeartHeader" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FB7185" />
                  <stop offset="50%" stopColor="#EC4899" />
                  <stop offset="100%" stopColor="#E11D48" />
                </linearGradient>
              </defs>
              <path d="M16 28.5C15.5 28.5 15 28.3 14.6 28C13.2 26.9 2 17.8 2 10.5C2 5.8 5.8 2 10.5 2C13.2 2 15.6 3.2 16 3.5C16.4 3.2 18.8 2 21.5 2C26.2 2 30 5.8 30 10.5C30 17.8 18.8 26.9 17.4 28C17 28.3 16.5 28.5 16 28.5Z" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center pb-0.5 text-white font-black text-xs md:text-[13px] tracking-tight font-sans select-none drop-shadow-xs">
              NT
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm md:text-base font-bold text-slate-900 tracking-tight leading-tight">
                Thu Chi <span className="hidden sm:inline">Gia Đình</span>
              </h1>
              <span className="text-[10px] md:text-[11px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200 hidden sm:inline-block">
                Nhựt & Trang 💕
              </span>
            </div>
            <p className="text-[10px] text-pink-700/70 font-medium hidden md:block">
              Quản lý tài chính {currentMonth && currentMonth.includes('-') ? `tháng ${currentMonth.split('-')[1]}/${currentMonth.split('-')[0]}` : 'gia đình'}
            </p>
          </div>
        </div>

        {/* Khu vực chọn người ghi & quản lý thành viên & cài đặt */}
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          
          {/* Trạng thái Cloud */}
          <button
            onClick={() => setShowConfigModal(true)}
            className={`text-[11px] font-medium px-2 py-1 rounded-lg border tactile-btn transition-colors hidden md:block ${
              isSupabaseConfigured
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {isSupabaseConfigured ? 'Đã nối Supabase' : 'Lưu trên máy'}
          </button>

          {/* Chọn nhanh người ghi theo danh sách thành viên */}
          {members.length > 0 && (
            <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200">
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveUser(m.username)}
                  className={`px-2 py-1 rounded-lg text-[11px] md:text-xs font-semibold tactile-btn transition-all ${
                    activeUser === m.username
                      ? m.color === 'pink'
                        ? 'bg-white text-pink-700 shadow-xs'
                        : 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title={`${m.name} (${m.role || 'Thành viên'})`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          )}

          {/* Nút Quản lý thành viên */}
          <button
            onClick={onOpenMemberManager}
            className="p-1.5 md:p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 tactile-btn transition-colors"
            title="Quản lý thành viên gia đình"
          >
            <Users size={16} weight="bold" />
          </button>

          {/* Nút ẩn số tiền */}
          <button
            onClick={() => setPrivacyMode(!privacyMode)}
            className={`p-1.5 md:p-2 rounded-xl border tactile-btn transition-colors ${
              privacyMode
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title={privacyMode ? 'Đang che số tiền' : 'Ẩn số tiền'}
          >
            {privacyMode ? <EyeSlash size={16} weight="bold" /> : <Eye size={16} weight="bold" />}
          </button>

          {/* Nút Đăng xuất */}
          <button
            onClick={onLogout}
            className="p-1.5 md:p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 tactile-btn transition-colors"
            title="Đăng xuất khỏi sổ"
          >
            <SignOut size={16} weight="bold" />
          </button>
        </div>

      </div>

      {/* Hộp thoại thông tin Supabase */}
      {showConfigModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowConfigModal(false)}
        >
          <div 
            className="w-full max-w-lg bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Database size={16} weight="bold" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Đồng Bộ Dữ Liệu Supabase Cloud
                </h3>
              </div>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Trạng thái cấu hình:</span>
                <span className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                  isSupabaseConfigured 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {isSupabaseConfigured ? '✓ Đã kết nối Supabase' : 'Chưa cấu hình'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2 text-slate-700">
                <p className="font-semibold text-emerald-900 flex items-center gap-1.5">
                  ⚡ Hướng dẫn lưu toàn bộ dữ liệu vào Supabase:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-600 leading-normal">
                  <li>
                    Mở <strong>Supabase Dashboard</strong> &gt; vào mục <strong>SQL Editor</strong>.
                  </li>
                  <li>
                    Sao chép toàn bộ file <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-mono text-[11px]">supabase/schema.sql</code>.
                  </li>
                  <li>
                    Dán vào SQL Editor và nhấn nút <strong>Run</strong> xanh lá.
                  </li>
                </ol>
                <p className="text-[11px] text-emerald-700 italic pt-1">
                  Mã SQL tạo cấu trúc bảng PostgreSQL bảo mật, bật chính sách RLS và đồng bộ Realtime.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-semibold text-slate-800">Bảo mật mã PIN & Dữ liệu:</span>
                <p className="text-slate-500">
                  Mã PIN của gia đình được mã hóa một chiều qua thuật toán <strong>SHA-256</strong>. Dữ liệu tài chính chỉ được lưu trên Supabase Cloud riêng của gia đình.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
              <button
                onClick={handleTriggerSync}
                disabled={isSyncing}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs tactile-btn flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Database size={15} weight="bold" />
                <span>{isSyncing ? 'Đang đẩy dữ liệu...' : 'Đẩy tất cả dữ liệu lên Supabase'}</span>
              </button>

              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs tactile-btn"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
