import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BudgetPulse from './components/BudgetPulse';
import QuickEntry from './components/QuickEntry';
import TransactionList from './components/TransactionList';
import { 
  initialTransactions, 
  initialProfile, 
  initialMonthlyConfig,
  categoriesList,
  macroTypesList,
  getRandomTime,
  initialMembers
} from './data/initialData';
import { 
  isSupabaseConfigured, 
  getTransactions, 
  addTransaction, 
  deleteTransaction,
  updateTransaction,
  getMonthlyConfig,
  updateMonthlyFocus 
} from './supabaseClient';
import CategoryManagerModal from './components/CategoryManagerModal';
import MemberManagerModal from './components/MemberManagerModal';
import LoginForm from './components/LoginForm';
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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((t) => ({
          ...t,
          gio: t.gio || getRandomTime()
        }));
      } catch (e) {
        return initialTransactions;
      }
    }
    return initialTransactions;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('nt_categories');
    return saved ? JSON.parse(saved) : categoriesList;
  });

  const [macroTypes, setMacroTypes] = useState(() => {
    const saved = localStorage.getItem('nt_macro_types');
    return saved ? JSON.parse(saved) : macroTypesList;
  });

  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  // Quản lý thành viên gia đình
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('nt_family_members');
    return saved ? JSON.parse(saved) : initialMembers;
  });

  // Trạng thái tài khoản đang đăng nhập (chỉ có form đăng nhập)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('nt_auth_user') || sessionStorage.getItem('nt_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isMemberManagerOpen, setIsMemberManagerOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState(null);

  // 2. Tự động đồng bộ Supabase Cloud nếu đã cấu hình
  useEffect(() => {
    if (isSupabaseConfigured) {
      getTransactions().then((cloudData) => {
        if (cloudData && cloudData.length > 0) {
          const withTime = cloudData.map((t) => ({
            ...t,
            gio: t.gio || getRandomTime()
          }));
          setTransactions(withTime);
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

  useEffect(() => {
    localStorage.setItem('nt_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('nt_macro_types', JSON.stringify(macroTypes));
  }, [macroTypes]);

  useEffect(() => {
    localStorage.setItem('nt_family_members', JSON.stringify(members));
  }, [members]);

  // Thông báo nhẹ
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Quản lý CRUD Phân loại
  const handleAddCategory = (newCat) => {
    if (!categories.includes(newCat)) {
      setCategories((prev) => [...prev, newCat]);
      showToast(`Đã thêm phân loại: ${newCat}`);
    }
  };

  const handleUpdateCategory = (oldCat, newCat) => {
    setCategories((prev) => prev.map((c) => (c === oldCat ? newCat : c)));
    setTransactions((prev) =>
      prev.map((t) => (t.phan_loai === oldCat ? { ...t, phan_loai: newCat } : t))
    );
    showToast(`Đã đổi tên phân loại thành: ${newCat}`);
  };

  const handleDeleteCategory = (cat) => {
    setCategories((prev) => prev.filter((c) => c !== cat));
    showToast(`Đã xóa phân loại: ${cat}`);
  };

  // Quản lý CRUD Loại (macro types)
  const handleAddMacroType = (newType) => {
    if (!macroTypes.includes(newType)) {
      setMacroTypes((prev) => [...prev, newType]);
      showToast(`Đã thêm loại: ${newType}`);
    }
  };

  const handleUpdateMacroType = (oldType, newType) => {
    setMacroTypes((prev) => prev.map((t) => (t === oldType ? newType : t)));
    setTransactions((prev) =>
      prev.map((t) => (t.loai === oldType ? { ...t, loai: newType } : t))
    );
    showToast(`Đã đổi tên loại thành: ${newType}`);
  };

  const handleDeleteMacroType = (type) => {
    setMacroTypes((prev) => prev.filter((t) => t !== type));
    showToast(`Đã xóa loại: ${type}`);
  };

  // Đăng nhập & Đăng xuất
  const handleLoginSuccess = (member, remember) => {
    setCurrentUser(member);
    setActiveUser(member.username);
    if (remember) {
      localStorage.setItem('nt_auth_user', JSON.stringify(member));
    } else {
      sessionStorage.setItem('nt_auth_user', JSON.stringify(member));
    }
    showToast(`Chào mừng ${member.name} đã đăng nhập!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('nt_auth_user');
    sessionStorage.removeItem('nt_auth_user');
    setCurrentUser(null);
    showToast('Đã đăng xuất khỏi tài khoản');
  };

  // Quản lý thành viên gia đình
  const handleAddMember = (newMember) => {
    setMembers((prev) => [...prev, newMember]);
    showToast(`Đã thêm thành viên: ${newMember.name}`);
  };

  const handleUpdateMember = (id, updates) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    if (currentUser?.id === id) {
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      if (localStorage.getItem('nt_auth_user')) {
        localStorage.setItem('nt_auth_user', JSON.stringify(updatedUser));
      }
    }
    showToast('Đã cập nhật thông tin thành viên');
  };

  const handleDeleteMember = (id) => {
    const memberToDelete = members.find((m) => m.id === id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    showToast(`Đã xóa thành viên: ${memberToDelete?.name || ''}`);
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

  // Cập nhật giao dịch (như đổi Phân loại, Loại trực tiếp trong bảng)
  const handleUpdateTransaction = async (id, field, value) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );

    if (isSupabaseConfigured) {
      try {
        await updateTransaction(id, { [field]: value });
      } catch (err) {
        console.error('Lỗi cập nhật Supabase:', err);
      }
    }
  };

  // NẾU CHƯA ĐĂNG NHẬP: CHỈ HIỂN THỊ DUY NHẤT FORM ĐĂNG NHẬP (KHÔNG CÓ ĐĂNG KÝ, KHÔNG CÓ QUÊN MẬT KHẨU)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 animate-fade-in">
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-lg">
              <Check size={15} weight="bold" className="text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
        <LoginForm 
          members={members} 
          onLoginSuccess={handleLoginSuccess} 
        />
      </div>
    );
  }

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

      {/* Modal Quản lý Phân loại và Loại */}
      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={categories}
        macroTypes={macroTypes}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddMacroType={handleAddMacroType}
        onUpdateMacroType={handleUpdateMacroType}
        onDeleteMacroType={handleDeleteMacroType}
      />

      {/* Modal Quản lý Thành viên Gia Đình */}
      <MemberManagerModal
        isOpen={isMemberManagerOpen}
        onClose={() => setIsMemberManagerOpen(false)}
        members={members}
        onAddMember={handleAddMember}
        onUpdateMember={handleUpdateMember}
        onDeleteMember={handleDeleteMember}
        currentUserId={currentUser.id}
      />

      {/* Nội dung chính */}
      <main>
        {/* Đầu trang */}
        <Header
          activeUser={activeUser}
          setActiveUser={setActiveUser}
          privacyMode={privacyMode}
          setPrivacyMode={setPrivacyMode}
          members={members}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenMemberManager={() => setIsMemberManagerOpen(true)}
        />

        {/* Tổng quan tháng 10 */}
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
          categories={categories}
          macroTypes={macroTypes}
          members={members}
        />

        {/* Bảng sổ kế toán chuẩn Google Sheets */}
        <TransactionList
          transactions={transactions}
          onDeleteTransaction={handleDeleteTransaction}
          onUpdateTransaction={handleUpdateTransaction}
          privacyMode={privacyMode}
          activeVault={activeVault}
          activeUser={activeUser}
          monthlyConfig={monthlyConfig}
          categories={categories}
          macroTypes={macroTypes}
          onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
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
