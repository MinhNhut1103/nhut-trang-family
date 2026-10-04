import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BudgetPulse from './components/BudgetPulse';
import QuickEntry from './components/QuickEntry';
import TransactionList from './components/TransactionList';
import { 
  initialTransactions, 
  initialProfile, 
  initialMonthlyConfig,
  initialGoals 
} from './data/initialData';
import { 
  isSupabaseConfigured, 
  getTransactions, 
  addTransaction, 
  deleteTransaction,
  getMonthlyConfig,
  updateMonthlyFocus 
} from './supabaseClient';
import { Heart, CheckCircle, Database } from '@phosphor-icons/react';

export default function App() {
  // 1. Persistent State
  const [activeUser, setActiveUser] = useState(() => {
    return localStorage.getItem('nt_active_user') || initialProfile.activeUser;
  });

  const [activeVault, setActiveVault] = useState(() => {
    return localStorage.getItem('nt_active_vault') || initialProfile.activeVault;
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

  // 2. Fetch from Supabase on Mount if configured
  useEffect(() => {
    if (isSupabaseConfigured) {
      // Fetch cloud transactions
      getTransactions().then((cloudData) => {
        if (cloudData && cloudData.length > 0) {
          setTransactions(cloudData);
          showToast('☁️ Đã đồng bộ dữ liệu từ Supabase Cloud!');
        }
      });

      // Fetch monthly config
      getMonthlyConfig('2026-10').then((config) => {
        if (config) {
          setMonthlyConfig(prev => ({ ...prev, ...config }));
        }
      });
    }
  }, []);

  // 3. LocalStorage Sync Fallback
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

  // Toast auto-dismiss
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Add transaction handler (Local + Supabase)
  const handleAddTransaction = async (newTx) => {
    setTransactions((prev) => [newTx, ...prev]);

    if (isSupabaseConfigured) {
      try {
        await addTransaction(newTx);
      } catch (err) {
        console.error('Supabase add error:', err);
      }
    }
  };

  // Delete transaction handler (Local + Supabase)
  const handleDeleteTransaction = async (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('🗑️ Đã xóa mục khỏi sổ');

    if (isSupabaseConfigured) {
      try {
        await deleteTransaction(id);
      } catch (err) {
        console.error('Supabase delete error:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 border border-emerald-500/40 shadow-2xl text-emerald-300 text-xs md:text-sm font-medium">
            <CheckCircle size={18} weight="fill" className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div>
        <Header
          activeUser={activeUser}
          setActiveUser={setActiveUser}
          activeVault={activeVault}
          setActiveVault={setActiveVault}
          privacyMode={privacyMode}
          setPrivacyMode={setPrivacyMode}
        />

        <BudgetPulse
          monthlyConfig={monthlyConfig}
          setMonthlyConfig={setMonthlyConfig}
          transactions={transactions}
          activeVault={activeVault}
          activeUser={activeUser}
          privacyMode={privacyMode}
        />

        <QuickEntry
          onAddTransaction={handleAddTransaction}
          activeUser={activeUser}
          activeVault={activeVault}
          onShowToast={showToast}
        />

        <TransactionList
          transactions={transactions}
          onDeleteTransaction={handleDeleteTransaction}
          privacyMode={privacyMode}
          activeVault={activeVault}
          activeUser={activeUser}
        />
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 py-6 px-4 text-center text-xs text-slate-500 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Sổ Thu Chi Gia Đình</span>
            <strong className="text-white">Nhựt & Trang</strong>
            <Heart size={14} className="text-rose-500" weight="fill" />
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span>Database: Supabase Postgres</span>
            <span>•</span>
            <span>Hosting: Vercel Ready</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">Taste-Skill Anti-Slop</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
