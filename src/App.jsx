import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BudgetPulse from './components/BudgetPulse';
import QuickEntry from './components/QuickEntry';
import TransactionList from './components/TransactionList';
import { 
  initialTransactions, 
  initialProfile, 
  initialMonthlyConfig 
} from './data/initialData';
import { 
  isSupabaseConfigured, 
  getTransactions, 
  addTransaction, 
  deleteTransaction,
  getMonthlyConfig,
  updateMonthlyFocus 
} from './supabaseClient';
import { Check } from '@phosphor-icons/react';

export default function App() {
  // 1. Trạng thái người dùng và không gian
  const [activeUser, setActiveUser] = useState(() => {
    return localStorage.getItem('nt_active_user') || initialProfile.activeUser;
  });

  const [activeVault, setActiveVault] = useState(() => {
    return localStorage.getItem('nt_active_vault') || 'all'; // mặc định xem tất cả
  });

  const [privacyMode, setPrivacyMode] = useState(() => {
    return localStorage.getItem('nt_privacy_mode') === 'true';
  });

  const [monthlyConfig, setMonthlyConfig] = useState(() => {
    const saved = localStorage.getItem('nt_monthly_config');
    return saved ? JSON.parse(saved) : initialMonthlyConfig;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('nt_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [toastMessage, setToastMessage] = useState(null);

  // 2. Tự động đồng bộ Supabase Cloud nếu đã cấu hình
  useEffect(() => {
    if (isSupabaseConfigured) {
      getTransactions().then((cloudData) => {
        if (cloudData && cloudData.length > 0) {
          setTransactions(cloudData);
          showToast('Đã đồng bộ dữ liệu từ Supabase Cloud');
        }
      });

      getMonthlyConfig('2026-10').then((config) => {
        if (config) {
          setMonthlyConfig(prev => ({ ...prev, ...config }));
        }
      });
    }
  }, []);

  // 3. Tự động lưu LocalStorage trên máy
  useEffect(() => {
    localStorage.setItem('nt_active_user', activeUser);
  }, [activeUser]);

  useEffect(() => {
    localStorage.setItem('nt_active_vault', activeVault);
  }, [activeVault]);

  useEffect(() => {
    localStorage.setItem('nt_privacy_mode', privacyMode);
  }, [privacyMode]);

  useEffect(() => {
    localStorage.setItem('nt_monthly_config', JSON.stringify(monthlyConfig));
    if (isSupabaseConfigured && monthlyConfig.banner_focus) {
      updateMonthlyFocus(monthlyConfig.id || '2026-10', monthlyConfig.banner_focus);
    }
  }, [monthlyConfig]);

  useEffect(() => {
    localStorage.setItem('nt_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Thông báo nhẹ
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Thêm giao dịch
  const handleAddTransaction = async (newTx) => {
    setTransactions((prev) => [newTx, ...prev]);

    if (isSupabaseConfigured) {
      try {
        await addTransaction(newTx);
      } catch (err) {
        console.error('Lỗi lưu Supabase:', err);
      }
    }
  };

  // Xóa giao dịch
  const handleDeleteTransaction = async (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Đã xóa dòng khỏi sổ');

    if (isSupabaseConfigured) {
      try {
        await deleteTransaction(id);
      } catch (err) {
        console.error('Lỗi xóa Supabase:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between">
      
      {/* Thông báo nổi nhẹ */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-fade-in">
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-lg">
            <Check size={15} weight="bold" className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Nội dung chính */}
      <main>
        {/* Đầu trang */}
        <Header
          activeUser={activeUser}
          setActiveUser={setActiveUser}
          privacyMode={privacyMode}
          setPrivacyMode={setPrivacyMode}
        />

        {/* Tổng quan & Banner mục tiêu tháng 10 */}
        <BudgetPulse
          monthlyConfig={monthlyConfig}
          setMonthlyConfig={setMonthlyConfig}
          transactions={transactions}
          activeVault={activeVault}
          setActiveVault={setActiveVault}
          activeUser={activeUser}
          privacyMode={privacyMode}
        />

        {/* Khối nhập liệu nhanh gọn */}
        <QuickEntry
          onAddTransaction={handleAddTransaction}
          activeUser={activeUser}
          activeVault={activeVault}
          onShowToast={showToast}
        />

        {/* Bảng sổ kế toán chuẩn Google Sheets */}
        <TransactionList
          transactions={transactions}
          onDeleteTransaction={handleDeleteTransaction}
          privacyMode={privacyMode}
          activeVault={activeVault}
          activeUser={activeUser}
          monthlyConfig={monthlyConfig}
        />
      </main>

      {/* Chân trang */}
      <footer className="w-full border-t border-slate-200/80 py-4 px-4 text-center text-xs text-slate-400">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Sổ thu chi gia đình Nhựt & Trang
          </div>
          <div>
            Tháng 10/2026 • Đồng bộ Supabase
          </div>
        </div>
      </footer>

    </div>
  );
}
