import React, { useState } from 'react';
import { Lock, User, SignIn, Eye, EyeSlash, ShieldCheck } from '@phosphor-icons/react';

export default function LoginForm({ members, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedUser) {
      setErrorMsg('Vui lòng nhập tên tài khoản');
      return;
    }

    if (!trimmedPass) {
      setErrorMsg('Vui lòng nhập mật khẩu hoặc mã PIN');
      return;
    }

    // Tìm thành viên trong danh sách
    const member = members.find(
      (m) => m.username.toLowerCase() === trimmedUser || m.name.toLowerCase() === trimmedUser
    );

    if (!member) {
      setErrorMsg('Tài khoản thành viên không tồn tại trong gia đình');
      return;
    }

    // Kiểm tra mật khẩu hoặc PIN chính xác tuyệt đối
    if (member.pin && member.pin !== trimmedPass) {
      setErrorMsg('Mật khẩu / Mã PIN không chính xác, vui lòng thử lại');
      return;
    }

    // Đăng nhập thành công
    onLoginSuccess(member, rememberMe);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md">
        
        {/* Logo & Tiêu đề */}
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-emerald-700 items-center justify-center text-white font-bold text-lg shadow-sm mb-3">
            NT
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Sổ Thu Chi Gia Đình
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Đăng nhập tài khoản để vào sổ ghi chép thu chi
          </p>
        </div>

        {/* Khối Form Đăng nhập */}
        <div className="card-soft p-6 md:p-8 bg-white border border-slate-200/90 shadow-sm">
          
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Nhập tên tài khoản */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tài khoản
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Nhập tên tài khoản..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-600 font-medium"
                />
                <User size={16} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            {/* Mật khẩu / Mã PIN */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Mật khẩu / Mã PIN
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Nhập mã PIN hoặc mật khẩu..."
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-600 font-medium tracking-wider"
                />
                <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Ghi nhớ đăng nhập */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span>Ghi nhớ đăng nhập trên thiết bị này</span>
              </label>
            </div>

            {/* Thông báo lỗi */}
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Nút Đăng nhập */}
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-xs tactile-btn flex items-center justify-center gap-1.5 shadow-sm transition-colors mt-2"
            >
              <SignIn size={16} weight="bold" />
              <span>Đăng nhập</span>
            </button>

          </form>

          {/* Ghi chú bảo mật */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck size={15} className="text-emerald-600" weight="fill" />
              <span>Hệ thống nội bộ gia đình • Mã hóa & bảo mật trên Database</span>
            </p>
          </div>

        </div>

        {/* Chân trang thông báo bảo mật */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          Sổ thu chi bảo mật gia đình Nhựt & Trang • Tháng 10/2026
        </p>

      </div>
    </div>
  );
}
