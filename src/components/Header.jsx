import React, { useState } from 'react';
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
  onLogout,
  onOpenMemberManager
}) {
  const [showConfigModal, setShowConfigModal] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        
        {/* Tên ứng dụng */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            NT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Sổ Thu Chi Gia Đình
              </h1>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Nhựt & Trang
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Quản lý tài chính tháng 10/2026
            </p>
          </div>
        </div>

        {/* Khu vực chọn người ghi & quản lý thành viên & cài đặt */}
        <div className="flex items-center gap-2">
          
          {/* Trạng thái Cloud */}
          <button
            onClick={() => setShowConfigModal(true)}
            className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border tactile-btn transition-colors hidden sm:block ${
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
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold tactile-btn transition-all ${
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
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 tactile-btn transition-colors"
            title="Quản lý thành viên gia đình"
          >
            <Users size={16} weight="bold" />
          </button>

          {/* Nút ẩn số tiền */}
          <button
            onClick={() => setPrivacyMode(!privacyMode)}
            className={`p-2 rounded-xl border tactile-btn transition-colors ${
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
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 tactile-btn transition-colors"
            title="Đăng xuất khỏi sổ"
          >
            <SignOut size={16} weight="bold" />
          </button>
        </div>

      </div>

      {/* Hộp thoại thông tin Supabase */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Trạng Thái Dữ Liệu
              </h3>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                Dự án đã tích hợp sẵn <strong>Supabase</strong> để đồng bộ dữ liệu thời gian thực giữa hai vợ chồng.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-semibold text-slate-800">Khởi tạo dữ liệu trên Supabase:</span>
                <p className="text-slate-500">
                  Mở mục <em>SQL Editor</em> trên trang Supabase của bạn, dán mã trong file <code>supabase/schema.sql</code> và bấm Chạy (Run).
                </p>
              </div>
              <p className="text-slate-500">
                Nếu chưa kết nối mạng hoặc chưa cấu hình Supabase, hệ thống vẫn tự động lưu trữ trên bộ nhớ máy (LocalStorage) một cách an toàn.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-medium text-xs tactile-btn"
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
