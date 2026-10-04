import React, { useState } from 'react';
import { 
  Eye, 
  EyeSlash, 
  UsersThree, 
  LockKey, 
  Database, 
  CloudCheck, 
  Info,
  X
} from '@phosphor-icons/react';
import { isSupabaseConfigured } from '../supabaseClient';

export default function Header({ 
  activeUser, 
  setActiveUser, 
  activeVault, 
  setActiveVault, 
  privacyMode, 
  setPrivacyMode 
}) {
  const [showConfigModal, setShowConfigModal] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel-elevated border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        
        {/* Brand & Subtitle & Cloud Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/40 text-white font-bold text-lg tracking-wider">
              NT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  Nhựt & Trang
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Tổ Ấm
                </span>

                {/* Cloud Connection Badge */}
                <button
                  onClick={() => setShowConfigModal(true)}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 tactile-btn border transition-all ${
                    isSupabaseConfigured
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-950/30 text-amber-300 border-amber-500/30'
                  }`}
                  title="Xem trạng thái kết nối Supabase Cloud"
                >
                  <Database size={11} weight={isSupabaseConfigured ? 'fill' : 'regular'} />
                  <span>{isSupabaseConfigured ? 'Supabase Live' : 'Supabase Sẵn Sàng'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Sổ Thu Chi Gia Đình • Vercel & Supabase Ready
              </p>
            </div>
          </div>

          {/* Privacy Toggle on mobile */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setPrivacyMode(!privacyMode)}
              className={`p-2 rounded-lg border tactile-btn transition-colors ${
                privacyMode 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
              }`}
            >
              {privacyMode ? <EyeSlash size={16} weight="bold" /> : <Eye size={16} weight="bold" />}
            </button>
          </div>
        </div>

        {/* Center: Vault Mode Switcher */}
        <div className="flex items-center justify-center">
          <div className="inline-flex p-1 bg-slate-900/90 rounded-xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setActiveVault('shared')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium tactile-btn transition-all ${
                activeVault === 'shared'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UsersThree size={15} weight={activeVault === 'shared' ? 'fill' : 'regular'} />
              <span>🌿 Quỹ Chung Tổ Ấm</span>
            </button>

            <button
              onClick={() => setActiveVault('personal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium tactile-btn transition-all ${
                activeVault === 'personal'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LockKey size={15} weight={activeVault === 'personal' ? 'fill' : 'regular'} />
              <span>🔒 Ví Riêng ({activeUser === 'nhut' ? 'Nhựt' : 'Trang'})</span>
            </button>
          </div>
        </div>

        {/* Right: Active User Selector & Privacy Mode */}
        <div className="flex items-center justify-between md:justify-end gap-2.5">
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 pl-2 pr-1 font-medium">Bạn là:</span>
            <button
              onClick={() => setActiveUser('nhut')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold tactile-btn transition-all ${
                activeUser === 'nhut'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              👨‍💻 Nhựt
            </button>
            <button
              onClick={() => setActiveUser('trang')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold tactile-btn transition-all ${
                activeUser === 'trang'
                  ? 'bg-slate-800 text-pink-400 border border-pink-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              👩‍🦰 Trang
            </button>
          </div>

          <button
            onClick={() => setPrivacyMode(!privacyMode)}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium tactile-btn transition-all ${
              privacyMode
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {privacyMode ? <EyeSlash size={15} weight="bold" /> : <Eye size={15} weight="bold" />}
            <span>{privacyMode ? 'Đang che' : 'Ẩn số dư'}</span>
          </button>
        </div>

      </div>

      {/* Supabase Connection Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Database size={20} className="text-emerald-400" />
                <h3 className="font-bold text-white text-base">Cấu Hình Kết Nối Supabase Cloud</h3>
              </div>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <p>
                Ứng dụng đã được tích hợp sẵn <strong>@supabase/supabase-js</strong> và file SQL <strong>supabase/schema.sql</strong>.
              </p>
              
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="text-emerald-400 font-semibold">1. Chạy SQL trên Supabase:</div>
                <p className="text-slate-400">
                  Mở <em>SQL Editor</em> trên Dashboard Supabase, copy toàn bộ nội dung trong file <code className="text-white bg-slate-800 px-1 rounded">supabase/schema.sql</code> và ấn <strong>Run</strong> để tự động tạo bảng & chèn dữ liệu mẫu từ sheet của bạn.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="text-emerald-400 font-semibold">2. Biến môi trường trên Vercel:</div>
                <p className="text-slate-400">
                  Khi đẩy lên GitHub & Deploy lên Vercel, bạn chỉ cần thêm 2 Environment Variables:
                </p>
                <div className="bg-slate-950 p-2 rounded text-[11px] font-mono text-slate-200">
                  VITE_SUPABASE_URL=https://your-project-id.supabase.co<br />
                  VITE_SUPABASE_ANON_KEY=eyJhbGci...
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">
                ✨ Khi chưa điền Supabase, hệ thống tự động lưu vào <strong>LocalStorage Offline-first</strong> mượt mà, không bao giờ bị gián đoạn hay mất dữ liệu!
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs tactile-btn"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
