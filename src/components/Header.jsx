import React, { useState } from 'react';
import { 
  Eye, 
  EyeSlash, 
  UsersThree, 
  LockKey, 
  Database, 
  Heart,
  Sparkle,
  X,
  House
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
    <header className="sticky top-0 z-40 w-full glass-panel-elevated border-b border-white/[0.08] px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3.5">
        
        {/* Brand & Subtitle & Cloud Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-amber-500 p-[1.5px] shadow-lg shadow-emerald-950/30">
              <div className="w-full h-full bg-[#0E111A] rounded-[14px] flex items-center justify-center text-white font-bold text-sm tracking-widest">
                NT
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  Nhựt & Trang
                </h1>
                <span className="text-[10px] font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 flex items-center gap-1">
                  <House size={11} weight="fill" />
                  Tổ Ấm
                </span>

                {/* Cloud Status Pill */}
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
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <span>Tài chính gia đình ấm áp</span>
                <span>•</span>
                <span className="text-amber-400/90 font-medium">Bình yên & Vun đắp</span>
              </p>
            </div>
          </div>

          {/* Privacy Toggle on mobile */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setPrivacyMode(!privacyMode)}
              className={`p-2.5 rounded-2xl border tactile-btn transition-colors ${
                privacyMode 
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' 
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
              }`}
            >
              {privacyMode ? <EyeSlash size={16} weight="bold" /> : <Eye size={16} weight="bold" />}
            </button>
          </div>
        </div>

        {/* Center: Apple-style Vault Pill Switcher */}
        <div className="flex items-center justify-center">
          <div className="inline-flex p-1.5 bg-slate-900/90 rounded-2xl border border-white/[0.08] shadow-inner backdrop-blur-xl">
            <button
              onClick={() => setActiveVault('shared')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold tactile-btn transition-all ${
                activeVault === 'shared'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UsersThree size={16} weight={activeVault === 'shared' ? 'fill' : 'regular'} />
              <span>🌿 Quỹ Chung Tổ Ấm</span>
            </button>

            <button
              onClick={() => setActiveVault('personal')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold tactile-btn transition-all ${
                activeVault === 'personal'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-950/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LockKey size={16} weight={activeVault === 'personal' ? 'fill' : 'regular'} />
              <span>🔒 Ví Riêng ({activeUser === 'nhut' ? 'Nhựt' : 'Trang'})</span>
            </button>
          </div>
        </div>

        {/* Right: Active Profile & Privacy Pill */}
        <div className="flex items-center justify-between md:justify-end gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-white/[0.08]">
            <span className="text-[11px] text-slate-400 pl-2 pr-1 font-medium">Bạn là:</span>
            <button
              onClick={() => setActiveUser('nhut')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold tactile-btn transition-all ${
                activeUser === 'nhut'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              👨‍💻 Nhựt
            </button>
            <button
              onClick={() => setActiveUser('trang')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold tactile-btn transition-all ${
                activeUser === 'trang'
                  ? 'bg-slate-800 text-pink-400 border border-pink-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              👩‍🦰 Trang
            </button>
          </div>

          <button
            onClick={() => setPrivacyMode(!privacyMode)}
            className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-xs font-semibold tactile-btn transition-all ${
              privacyMode
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                : 'bg-slate-900/80 border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/20'
            }`}
          >
            {privacyMode ? <EyeSlash size={16} weight="bold" /> : <Eye size={16} weight="bold" />}
            <span>{privacyMode ? 'Đang che' : 'Ẩn số dư'}</span>
          </button>
        </div>

      </div>

      {/* Supabase Connection Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-white/[0.12] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Database size={20} className="text-emerald-400" />
                <h3 className="font-bold text-white text-base">Cấu Hình Supabase Cloud</h3>
              </div>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <p>
                File cấu hình <strong>.env</strong> đã nhận diện kết nối Supabase của bạn.
              </p>
              
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/[0.08] space-y-2">
                <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Sparkle size={14} weight="fill" />
                  Bước 1: Chạy SQL Tạo Bảng (Chỉ làm 1 lần)
                </div>
                <p className="text-slate-400">
                  Mở <em>SQL Editor</em> trên Dashboard Supabase, copy toàn bộ nội dung trong file <code className="text-emerald-300 bg-slate-800 px-1.5 py-0.5 rounded">supabase/schema.sql</code> và ấn <strong>Run</strong> để tạo bảng & dữ liệu mẫu từ sheet của bạn.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/[0.08] space-y-2">
                <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Sparkle size={14} weight="fill" />
                  Bước 2: Cấu Hình Khi Deploy Lên Vercel
                </div>
                <p className="text-slate-400">
                  Khi đẩy lên GitHub & Deploy lên Vercel, bạn thêm 2 biến môi trường:
                </p>
                <div className="bg-slate-950 p-2.5 rounded-xl text-[11px] font-mono text-emerald-300 border border-white/[0.06]">
                  VITE_SUPABASE_URL=https://zzvfoakggchyacimkhsw.supabase.co<br />
                  VITE_SUPABASE_ANON_KEY=eyJhbGci...
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tactile-btn shadow-md"
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
