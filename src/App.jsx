import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import BudgetPulse from './components/BudgetPulse';
import CategoryPieChart from './components/CategoryPieChart';
import QuickEntry from './components/QuickEntry';
import TransactionList from './components/TransactionList';
import { 
  initialTransactions, 
  initialProfile, 
  initialMonthlyConfig,
  initialSeptemberConfig,
  septemberTransactions,
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
  getAllMonthlyConfigs,
  upsertMonthlyConfig,
  updateMonthlyFocus,
  getFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember
} from './supabaseClient';
import CategoryManagerModal from './components/CategoryManagerModal';
import MemberManagerModal from './components/MemberManagerModal';
import MonthManagerModal from './components/MonthManagerModal';
import TransactionModal from './components/TransactionModal';
import DailyReminderCard from './components/DailyReminderCard';
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

  // Quản lý tháng đang xem & ghi chú riêng cho từng tháng (ưu tiên tháng 9 vừa nạp)
  const [currentMonth, setCurrentMonth] = useState(() => {
    return localStorage.getItem('nt_current_month') || '2026-09';
  });

  const [monthlyConfigs, setMonthlyConfigs] = useState(() => {
    const saved = localStorage.getItem('nt_monthly_configs');
    const defaults = {
      '2026-10': {
        id: '2026-10',
        banner_focus: initialMonthlyConfig.banner_focus || 'Tối ưu chi tiêu & tiết kiệm',
        han_muc_chi: initialMonthlyConfig.han_muc_chi || 30000000,
        ghi_chu: 'Tháng 10/2026: Ưu tiên tiết kiệm chuẩn bị cho các kế hoạch cuối năm, rà soát hóa đơn điện nước định kỳ.'
      },
      '2026-09': {
        id: '2026-09',
        banner_focus: initialSeptemberConfig.banner_focus,
        han_muc_chi: initialSeptemberConfig.han_muc_chi,
        ghi_chu: initialSeptemberConfig.ghi_chu
      }
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaults,
          ...parsed,
          '2026-09': parsed['2026-09'] || defaults['2026-09']
        };
      } catch (e) {
        console.error('Error parsing nt_monthly_configs:', e);
      }
    }
    return defaults;
  });

  const [isMonthManagerOpen, setIsMonthManagerOpen] = useState(false);

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('nt_transactions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasSep = parsed.some((t) => (t.ngay || '').startsWith('2026-09'));
        if (!hasSep) {
          return [...septemberTransactions, ...parsed];
        }
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

  // Modal Thêm / Sửa thu chi toàn cục (dùng cho cả DailyReminderCard và TransactionList)
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  const handleOpenAddTx = () => {
    setEditingTx(null);
    setIsTxModalOpen(true);
  };

  const handleOpenEditTx = (tx) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  const handleSaveTxModal = (txData) => {
    if (editingTx) {
      handleUpdateTransaction(editingTx.id, txData);
    } else {
      handleAddTransaction(txData);
    }
  };

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

      // Đồng bộ toàn bộ cấu hình & ghi chú của các tháng từ Supabase
      getAllMonthlyConfigs().then((cloudConfigs) => {
        if (cloudConfigs && cloudConfigs.length > 0) {
          setMonthlyConfigs((prev) => {
            const merged = { ...prev };
            cloudConfigs.forEach((c) => {
              merged[c.id] = {
                id: c.id,
                banner_focus: c.banner_focus || '',
                han_muc_chi: Number(c.han_muc_chi) || 30000000,
                ghi_chu: c.ghi_chu || ''
              };
            });
            return merged;
          });
        }
      });

      // Đồng bộ danh sách thành viên gia đình từ Supabase
      getFamilyMembers().then((cloudMembers) => {
        if (cloudMembers && cloudMembers.length > 0) {
          const formatted = cloudMembers.map((m) => ({
            id: m.id,
            username: m.username,
            name: m.name,
            pin: m.pin_hash,
            role: m.role || 'Thành viên',
            vault: m.vault || `personal_${m.username}`,
            color: m.color || 'emerald'
          }));
          setMembers(formatted);
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
    localStorage.setItem('nt_current_month', currentMonth);
  }, [currentMonth]);

  useEffect(() => {
    localStorage.setItem('nt_monthly_configs', JSON.stringify(monthlyConfigs));
  }, [monthlyConfigs]);

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

  // Quản lý tháng & ghi chú riêng cho từng tháng
  const handleSaveMonthlyConfig = async (newConfig) => {
    setMonthlyConfigs((prev) => ({
      ...prev,
      [newConfig.id]: newConfig
    }));
    showToast(`Đã lưu ghi chú Tháng ${newConfig.id}`);

    if (isSupabaseConfigured) {
      try {
        await upsertMonthlyConfig(newConfig);
      } catch (err) {
        console.error('Lỗi lưu cấu hình tháng lên Supabase:', err);
      }
    }
  };

  const handleAddMonth = (monthStr) => {
    if (!monthlyConfigs[monthStr]) {
      const initialCfg = {
        id: monthStr,
        banner_focus: '',
        han_muc_chi: 30000000,
        ghi_chu: ''
      };
      handleSaveMonthlyConfig(initialCfg);
    }
    setCurrentMonth(monthStr);
    showToast(`Đã chuyển sang ${monthStr}`);
  };

  // Tính danh sách các tháng có sẵn
  const availableMonths = useMemo(() => {
    const set = new Set(Object.keys(monthlyConfigs));
    set.add(currentMonth);
    set.add('2026-10');
    set.add('2026-09');
    transactions.forEach((t) => {
      if (t.ngay && t.ngay.length >= 7) {
        set.add(t.ngay.slice(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [monthlyConfigs, transactions, currentMonth]);

  // Cấu hình tháng hiện tại đang chọn
  const activeMonthlyConfig = monthlyConfigs[currentMonth] || {
    id: currentMonth,
    banner_focus: '',
    han_muc_chi: 30000000,
    ghi_chu: ''
  };

  // Các giao dịch thuộc tháng đang chọn
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((t) => (t.ngay || '').startsWith(currentMonth));
  }, [transactions, currentMonth]);

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
  const handleAddMember = async (newMember) => {
    setMembers((prev) => [...prev, newMember]);
    showToast(`Đã thêm thành viên: ${newMember.name}`);

    if (isSupabaseConfigured) {
      try {
        await addFamilyMember(newMember);
      } catch (err) {
        console.error('Lỗi lưu thành viên lên Supabase:', err);
      }
    }
  };

  const handleUpdateMember = async (id, updates) => {
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

    if (isSupabaseConfigured) {
      try {
        await updateFamilyMember(id, updates);
      } catch (err) {
        console.error('Lỗi cập nhật thành viên lên Supabase:', err);
      }
    }
  };

  const handleDeleteMember = async (id) => {
    const memberToDelete = members.find((m) => m.id === id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    showToast(`Đã xóa thành viên: ${memberToDelete?.name || ''}`);

    if (isSupabaseConfigured) {
      try {
        await deleteFamilyMember(id);
      } catch (err) {
        console.error('Lỗi xóa thành viên trên Supabase:', err);
      }
    }
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

  // Cập nhật giao dịch (như đổi Phân loại, Loại hoặc chỉnh sửa toàn bộ trong modal)
  const handleUpdateTransaction = async (id, updatesOrField, value) => {
    const updates = typeof updatesOrField === 'object' ? updatesOrField : { [updatesOrField]: value };

    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    showToast('Đã cập nhật khoản thu chi');

    if (isSupabaseConfigured) {
      try {
        await updateTransaction(id, updates);
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

      {/* Modal Quản lý Tháng & Ghi Chú Riêng Từng Tháng */}
      <MonthManagerModal
        isOpen={isMonthManagerOpen}
        onClose={() => setIsMonthManagerOpen(false)}
        currentMonth={currentMonth}
        onSelectMonth={(m) => setCurrentMonth(m)}
        monthlyConfigs={monthlyConfigs}
        onSaveMonthlyConfig={handleSaveMonthlyConfig}
        availableMonths={availableMonths}
        onAddMonth={handleAddMonth}
      />

      {/* Modal Thêm & Sửa Thu Chi Toàn Cục */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        transactionToEdit={editingTx}
        onSave={handleSaveTxModal}
        categories={categories}
        macroTypes={macroTypes}
        members={members}
        activeUser={activeUser}
        currentMonth={currentMonth}
      />

      {/* Đầu trang (Thanh điều hướng dính) */}
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

      {/* Nội dung chính: Khoảng trắng giữa tất cả các phần đều tăm tắp (space-y-3) */}
      <main className="space-y-3 pt-3">
        {/* Thông báo dạng card mỗi ngày khi chưa điền thu chi ngày đó */}
        <DailyReminderCard
          transactions={transactions}
          onOpenAddTransaction={handleOpenAddTx}
          onShowToast={showToast}
        />

        {/* Tổng quan tháng & ghi chú riêng của tháng */}
        <BudgetPulse
          transactions={currentMonthTransactions}
          currentMonth={currentMonth}
          onSelectMonth={(m) => setCurrentMonth(m)}
          monthlyConfig={activeMonthlyConfig}
          onOpenMonthManager={() => setIsMonthManagerOpen(true)}
          privacyMode={privacyMode}
        />

        {/* Biểu đồ tròn cơ cấu chi tiêu & thu nhập theo phân loại */}
        <CategoryPieChart
          transactions={currentMonthTransactions}
          privacyMode={privacyMode}
          currentMonth={currentMonth}
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
          currentMonth={currentMonth}
        />

        {/* Bảng sổ kế toán chuẩn Google Sheets */}
        <TransactionList
          transactions={transactions}
          currentMonth={currentMonth}
          availableMonths={availableMonths}
          onAddTransaction={handleAddTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onUpdateTransaction={handleUpdateTransaction}
          privacyMode={privacyMode}
          activeVault={activeVault}
          activeUser={activeUser}
          monthlyConfig={activeMonthlyConfig}
          categories={categories}
          macroTypes={macroTypes}
          members={members}
          onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
          onOpenAdd={handleOpenAddTx}
          onOpenEdit={handleOpenEditTx}
        />
      </main>

      {/* Chân trang */}
      <footer className="w-full border-t border-slate-200/80 py-4 px-4 text-center text-xs text-slate-400">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Sổ thu chi gia đình Nhựt & Trang
          </div>
          <div>
            Tháng {currentMonth?.includes('-') ? `${currentMonth.split('-')[1]}/${currentMonth.split('-')[0]}` : currentMonth} • Đồng bộ Supabase
          </div>
        </div>
      </footer>

    </div>
  );
}

