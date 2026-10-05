import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import BudgetPulse from './components/BudgetPulse';
import CategoryPieChart from './components/CategoryPieChart';
import QuickEntry from './components/QuickEntry';
import TransactionList from './components/TransactionList';
import FloatingAmbience from './components/FloatingAmbience';
import { 
  initialTransactions, 
  initialProfile, 
  initialMonthlyConfig,
  initialSeptemberConfig,
  initialAugustConfig,
  septemberTransactions,
  augustTransactions,
  categoriesList,
  macroTypesList,
  getRandomTime,
  initialMembers,
  initialGoals,
  sortTransactionsByDateDesc,
  normalizeDateISO
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
  deleteFamilyMember,
  syncAllLocalToSupabase,
  getGlobalWallets,
  upsertGlobalWallets
} from './supabaseClient';
import CategoryManagerModal from './components/CategoryManagerModal';
import MemberManagerModal from './components/MemberManagerModal';
import MonthManagerModal from './components/MonthManagerModal';
import TransactionModal from './components/TransactionModal';
import DailyReminderCard from './components/DailyReminderCard';
import LoginForm from './components/LoginForm';
import { Check } from '@phosphor-icons/react';
import { sanitizeMemberForStorage } from './utils/crypto';

export default function App() {
  // 1. Trạng thái người dùng và không gian
  const [activeUser, setActiveUser] = useState(() => {
    return initialProfile.activeUser;
  });

  const [activeVault, setActiveVault] = useState(() => {
    return 'all'; // mặc định xem tất cả
  });

  const [privacyMode, setPrivacyMode] = useState(false);

  // SỐ TIỀN HIỆN CÓ: Tiền ngoài ví (tiền mặt) & Tiền trong thẻ (ngân hàng)
  // Khởi tạo ngay lập tức từ localStorage để F5 không bao giờ bị nhảy về 0
  const [currentFunds, setCurrentFunds] = useState(() => {
    try {
      const saved = localStorage.getItem('nt_current_funds');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.tien_ngoai_vi !== undefined || parsed.tien_trong_the !== undefined)) {
          return {
            tien_ngoai_vi: Number(parsed.tien_ngoai_vi) || 0,
            tien_trong_the: Number(parsed.tien_trong_the) || 0
          };
        }
      }
    } catch (e) {}
    return {
      tien_ngoai_vi: 0,
      tien_trong_the: 0
    };
  });

  // Lấy tháng hiện tại thực tế theo lịch (YYYY-MM)
  const getSystemCurrentMonth = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };

  // Quản lý tháng đang xem: Cứ F5 hoặc refresh tải lại trang sẽ luôn về tháng hiện tại
  const [currentMonth, setCurrentMonth] = useState(() => {
    return getSystemCurrentMonth();
  });

  const [monthlyConfigs, setMonthlyConfigs] = useState(() => {
    return {
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
      },
      '2026-08': {
        id: '2026-08',
        banner_focus: initialAugustConfig.banner_focus,
        han_muc_chi: initialAugustConfig.han_muc_chi,
        ghi_chu: initialAugustConfig.ghi_chu
      }
    };
  });

  const [isMonthManagerOpen, setIsMonthManagerOpen] = useState(false);

  const [transactions, setTransactions] = useState(() => {
    return sortTransactionsByDateDesc(initialTransactions);
  });

  const [categories, setCategories] = useState(() => {
    return categoriesList;
  });

  const [macroTypes, setMacroTypes] = useState(() => {
    return macroTypesList;
  });

  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  // Quản lý thành viên gia đình (Tự động xóa sạch mã PIN dạng plain text để bảo mật)
  const [members, setMembers] = useState(() => {
    return initialMembers.map((m) => sanitizeMemberForStorage(m));
  });

  // Trạng thái tài khoản đang đăng nhập (chỉ lưu trong sessionStorage của phiên duyệt web)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('nt_auth_user');
      if (saved) {
        return sanitizeMemberForStorage(JSON.parse(saved));
      }
    } catch (e) {}
    return null;
  });

  const [isMemberManagerOpen, setIsMemberManagerOpen] = useState(false);

  // Modal Thêm / Sửa thu chi toàn cục (dùng cho cả DailyReminderCard và TransactionList)
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [modalDefaultDate, setModalDefaultDate] = useState(null);

  const handleOpenAddTx = (customDate = null) => {
    setEditingTx(null);
    setModalDefaultDate(typeof customDate === 'string' ? customDate : null);
    setIsTxModalOpen(true);
  };

  const handleOpenEditTx = (tx) => {
    setEditingTx(tx);
    setModalDefaultDate(null);
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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // 2. Tự động đồng bộ Supabase Cloud nếu đã cấu hình
  useEffect(() => {
    if (isSupabaseConfigured) {
      getTransactions().then((cloudData) => {
        if (cloudData && cloudData.length > 0) {
          const withTime = cloudData.map((t) => ({
            ...t,
            gio: t.gio || getRandomTime()
          }));
          setTransactions(sortTransactionsByDateDesc(withTime));
          showToast('Đã đồng bộ dữ liệu từ Supabase Cloud');
        }
      });

      // Đồng bộ toàn bộ cấu hình & ghi chú của các tháng từ Supabase
      getAllMonthlyConfigs().then(async (cloudConfigs) => {
        const merged = {};
        if (cloudConfigs && cloudConfigs.length > 0) {
          cloudConfigs.forEach((c) => {
            merged[c.id] = {
              id: c.id,
              banner_focus: c.banner_focus || '',
              han_muc_chi: Number(c.han_muc_chi) || 30000000,
              ghi_chu: c.ghi_chu || '',
              tien_ngoai_vi: Number(c.tien_ngoai_vi) || 0,
              tien_trong_the: Number(c.tien_trong_the) || 0
            };
          });

          // Phục hồi Số Tiền Hiện Có (ưu tiên từ bản ghi global_wallets hoặc tháng mới nhất)
          const globalWallet = cloudConfigs.find((c) => c.id === 'global_wallets');
          if (globalWallet && (Number(globalWallet.tien_ngoai_vi) > 0 || Number(globalWallet.tien_trong_the) > 0)) {
            const nextFunds = {
              tien_ngoai_vi: Number(globalWallet.tien_ngoai_vi) || 0,
              tien_trong_the: Number(globalWallet.tien_trong_the) || 0
            };
            setCurrentFunds(nextFunds);
            try {
              localStorage.setItem('nt_current_funds', JSON.stringify(nextFunds));
            } catch (e) {}
          } else {
            const sortedMonths = [...cloudConfigs]
              .filter((c) => c.id !== 'global_wallets')
              .sort((a, b) => (b.id || '').localeCompare(a.id || ''));
            const latestWithFunds = sortedMonths.find(
              (c) => Number(c.tien_ngoai_vi) > 0 || Number(c.tien_trong_the) > 0
            );
            if (latestWithFunds) {
              const nextFunds = {
                tien_ngoai_vi: Number(latestWithFunds.tien_ngoai_vi) || 0,
                tien_trong_the: Number(latestWithFunds.tien_trong_the) || 0
              };
              setCurrentFunds(nextFunds);
              try {
                localStorage.setItem('nt_current_funds', JSON.stringify(nextFunds));
              } catch (e) {}
            }
          }
        }

        // Tự động kiểm tra: Nếu là ngày 1 (hoặc tháng hiện tại chưa có), tự động tạo cấu hình tháng mới
        const sysMonth = getSystemCurrentMonth();
        if (!merged[sysMonth]) {
          const sortedKeys = Object.keys(merged).sort().reverse();
          const lastMonthKey = sortedKeys[0];
          const lastHanMuc = lastMonthKey && merged[lastMonthKey]?.han_muc_chi
            ? Number(merged[lastMonthKey].han_muc_chi)
            : 30000000;
          const [y, m] = sysMonth.split('-');
          const autoMonth = {
            id: sysMonth,
            banner_focus: 'Khởi đầu tháng mới: Chi tiêu thông minh & tiết kiệm',
            han_muc_chi: lastHanMuc,
            ghi_chu: `Sổ chi tiêu Tháng ${m}/${y} (Hệ thống tự động khởi tạo)`,
            tien_ngoai_vi: 0,
            tien_trong_the: 0
          };
          merged[sysMonth] = autoMonth;
          upsertMonthlyConfig(autoMonth).catch(console.error);
        }

        setMonthlyConfigs((prev) => ({
          ...prev,
          ...merged
        }));
      });

      // Đồng bộ danh sách thành viên gia đình từ Supabase
      getFamilyMembers().then((cloudMembers) => {
        if (cloudMembers && cloudMembers.length > 0) {
          const formatted = cloudMembers.map((m) => ({
            id: m.id,
            username: m.username,
            name: m.name,
            pin_hash: m.pin_hash,
            role: m.role || 'Thành viên',
            vault: m.vault || `personal_${m.username}`,
            color: m.color || 'emerald'
          }));
          setMembers(formatted);
        }
      });
    }
  }, []);

  // Tự động rà soát ngày 1 tháng mới khi mở app hoặc chuyển tab
  useEffect(() => {
    const checkAndProvisionNewMonth = async () => {
      const sysMonth = getSystemCurrentMonth();
      if (!monthlyConfigs[sysMonth]) {
        const sorted = Object.keys(monthlyConfigs).sort().reverse();
        const prevHanMuc = sorted[0] && monthlyConfigs[sorted[0]]?.han_muc_chi
          ? Number(monthlyConfigs[sorted[0]].han_muc_chi)
          : 30000000;
        const [y, m] = sysMonth.split('-');
        const newMonthObj = {
          id: sysMonth,
          banner_focus: 'Khởi đầu tháng mới: Chi tiêu thông minh & tiết kiệm',
          han_muc_chi: prevHanMuc,
          ghi_chu: `Sổ chi tiêu Tháng ${m}/${y} (Tự động khởi tạo)`,
          tien_ngoai_vi: 0,
          tien_trong_the: 0
        };

        setMonthlyConfigs((prev) => {
          if (prev[sysMonth]) return prev;
          return {
            ...prev,
            [sysMonth]: newMonthObj
          };
        });

        if (isSupabaseConfigured) {
          try {
            await upsertMonthlyConfig(newMonthObj);
          } catch (e) {
            console.error('Lỗi tự động tạo tháng mới:', e);
          }
        }
        showToast(`🎉 Chào Tháng ${m}/${y}! Đã tự động tạo sổ tháng mới.`);
      }
    };

    checkAndProvisionNewMonth();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkAndProvisionNewMonth();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    const interval = setInterval(checkAndProvisionNewMonth, 30 * 60 * 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, [monthlyConfigs]);

  // Hàm lưu và đồng bộ Số Tiền Hiện Có bền vững (vừa lưu localStorage vừa lưu Supabase)
  const updateFundsAndPersist = (newFunds) => {
    setCurrentFunds(newFunds);
    try {
      localStorage.setItem('nt_current_funds', JSON.stringify(newFunds));
    } catch (e) {}
    if (isSupabaseConfigured) {
      upsertGlobalWallets(newFunds).catch(console.error);
      const updatedCfg = {
        ...(monthlyConfigs[currentMonth] || { id: currentMonth }),
        tien_ngoai_vi: newFunds.tien_ngoai_vi,
        tien_trong_the: newFunds.tien_trong_the
      };
      upsertMonthlyConfig(updatedCfg).catch(console.error);
    }
  };

  const handleUpdateTienNgoaiVi = (val) => {
    const num = Number(val) || 0;
    const next = { ...currentFunds, tien_ngoai_vi: num };
    updateFundsAndPersist(next);
    showToast(`Đã lưu tiền ngoài ví: ${new Intl.NumberFormat('vi-VN').format(num)} đ`);
  };

  const handleUpdateTienTrongThe = (val) => {
    const num = Number(val) || 0;
    const next = { ...currentFunds, tien_trong_the: num };
    updateFundsAndPersist(next);
    showToast(`Đã lưu tiền trong thẻ: ${new Intl.NumberFormat('vi-VN').format(num)} đ`);
  };

  const handleSaveMonthlyConfig = async (newConfig) => {
    setMonthlyConfigs((prev) => ({
      ...prev,
      [newConfig.id]: newConfig
    }));

    if (newConfig.tien_ngoai_vi !== undefined || newConfig.tien_trong_the !== undefined) {
      const nextFunds = {
        tien_ngoai_vi: newConfig.tien_ngoai_vi !== undefined ? Number(newConfig.tien_ngoai_vi) : currentFunds.tien_ngoai_vi,
        tien_trong_the: newConfig.tien_trong_the !== undefined ? Number(newConfig.tien_trong_the) : currentFunds.tien_trong_the,
      };
      updateFundsAndPersist(nextFunds);
    }

    if (isSupabaseConfigured) {
      try {
        await upsertMonthlyConfig(newConfig);
        showToast(`Đã lưu cấu hình tháng ${newConfig.id}`);
      } catch (err) {
        console.error('Lỗi lưu cấu hình tháng:', err);
        showToast('⚠️ Lỗi lưu cấu hình tháng: ' + (err.message || 'Lỗi'));
      }
    } else {
      showToast(`Đã lưu cấu hình tháng ${newConfig.id}`);
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
    set.add('2026-08');
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
    return transactions.filter((t) => {
      const iso = normalizeDateISO(t.ngay);
      return iso.startsWith(currentMonth);
    });
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

  // Đăng nhập & Đăng xuất (chỉ dùng sessionStorage trong phiên, không ghi localStorage)
  const handleLoginSuccess = (member) => {
    setCurrentUser(member);
    setActiveUser(member.username);
    try {
      sessionStorage.setItem('nt_auth_user', JSON.stringify(member));
    } catch (e) {}
    showToast(`Chào mừng ${member.name} đã đăng nhập!`);
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('nt_auth_user');
      localStorage.clear();
    } catch (e) {}
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
      try {
        sessionStorage.setItem('nt_auth_user', JSON.stringify(updatedUser));
      } catch (e) {}
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

  // Thêm giao dịch & tự động thay đổi Số tiền hiện có (Ví / Thẻ)
  const handleAddTransaction = async (newTx) => {
    setTransactions((prev) => sortTransactionsByDateDesc([newTx, ...prev]));

    // Điều chỉnh số tiền hiện có theo nguồn tiền
    const isThu = (Number(newTx.thu) || 0) > 0;
    const val = isThu ? Number(newTx.thu) : Number(newTx.chi);
    const source = newTx.wallet_source || (newTx.ghi_chu?.includes('[Tiền mặt]') ? 'cash' : 'card');

    const nextFunds = { ...currentFunds };
    if (source === 'cash') {
      nextFunds.tien_ngoai_vi = isThu 
        ? nextFunds.tien_ngoai_vi + val 
        : Math.max(0, nextFunds.tien_ngoai_vi - val);
    } else {
      nextFunds.tien_trong_the = isThu 
        ? nextFunds.tien_trong_the + val 
        : Math.max(0, nextFunds.tien_trong_the - val);
    }
    updateFundsAndPersist(nextFunds);

    const sourceLabel = source === 'cash' ? 'Tiền ngoài ví' : 'Tiền trong thẻ';
    const actionLabel = isThu 
      ? `+${new Intl.NumberFormat('vi-VN').format(val)} đ vào ${sourceLabel}` 
      : `-${new Intl.NumberFormat('vi-VN').format(val)} đ từ ${sourceLabel}`;

    if (isSupabaseConfigured) {
      try {
        await addTransaction(newTx);
        showToast(`Đã ghi sổ & cập nhật ${actionLabel}`);
      } catch (err) {
        console.error('Lỗi lưu Supabase:', err);
        showToast('⚠️ Không thể lưu lên Supabase: ' + (err.message || 'Lỗi'));
      }
    } else {
      showToast(`Đã ghi sổ & cập nhật ${actionLabel}`);
    }
  };

  // Xóa giao dịch & hoàn lại số tiền hiện có tương ứng
  const handleDeleteTransaction = async (id) => {
    const txToDelete = transactions.find((t) => t.id === id);
    if (txToDelete) {
      const isThu = (Number(txToDelete.thu) || 0) > 0;
      const val = isThu ? Number(txToDelete.thu) : Number(txToDelete.chi);
      const source = txToDelete.wallet_source || (txToDelete.ghi_chu?.includes('[Tiền mặt]') ? 'cash' : 'card');

      const nextFunds = { ...currentFunds };
      // Hoàn lại: Nếu là chi thì cộng lại tiền vào ví/thẻ, nếu là thu thì trừ lại
      if (source === 'cash') {
        nextFunds.tien_ngoai_vi = isThu 
          ? Math.max(0, nextFunds.tien_ngoai_vi - val) 
          : nextFunds.tien_ngoai_vi + val;
      } else {
        nextFunds.tien_trong_the = isThu 
          ? Math.max(0, nextFunds.tien_trong_the - val) 
          : nextFunds.tien_trong_the + val;
      }
      updateFundsAndPersist(nextFunds);
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Đã xóa dòng khỏi sổ & hoàn lại số tiền hiện có');

    if (isSupabaseConfigured) {
      try {
        await deleteTransaction(id);
      } catch (err) {
        console.error('Lỗi xóa Supabase:', err);
        showToast('⚠️ Lỗi xóa trên Supabase: ' + (err.message || 'Lỗi'));
      }
    }
  };

  // Cập nhật giao dịch & điều chỉnh lại số tiền hiện có nếu có thay đổi số tiền hoặc nguồn
  const handleUpdateTransaction = async (id, updatesOrField, value) => {
    const updates = typeof updatesOrField === 'object' ? updatesOrField : { [updatesOrField]: value };
    const oldTx = transactions.find((t) => t.id === id);

    if (oldTx && (updates.thu !== undefined || updates.chi !== undefined || updates.wallet_source !== undefined)) {
      const oldIsThu = (Number(oldTx.thu) || 0) > 0;
      const oldVal = oldIsThu ? Number(oldTx.thu) : Number(oldTx.chi);
      const oldSource = oldTx.wallet_source || (oldTx.ghi_chu?.includes('[Tiền mặt]') ? 'cash' : 'card');

      const newThu = updates.thu !== undefined ? Number(updates.thu) : Number(oldTx.thu);
      const newChi = updates.chi !== undefined ? Number(updates.chi) : Number(oldTx.chi);
      const newIsThu = newThu > 0;
      const newVal = newIsThu ? newThu : newChi;
      const newSource = updates.wallet_source || oldSource;

      const nextFunds = { ...currentFunds };

      // 1. Hoàn lại số tiền cũ
      if (oldSource === 'cash') {
        nextFunds.tien_ngoai_vi = oldIsThu 
          ? Math.max(0, nextFunds.tien_ngoai_vi - oldVal) 
          : nextFunds.tien_ngoai_vi + oldVal;
      } else {
        nextFunds.tien_trong_the = oldIsThu 
          ? Math.max(0, nextFunds.tien_trong_the - oldVal) 
          : nextFunds.tien_trong_the + oldVal;
      }

      // 2. Áp dụng số tiền mới
      if (newSource === 'cash') {
        nextFunds.tien_ngoai_vi = newIsThu 
          ? nextFunds.tien_ngoai_vi + newVal 
          : Math.max(0, nextFunds.tien_ngoai_vi - newVal);
      } else {
        nextFunds.tien_trong_the = newIsThu 
          ? nextFunds.tien_trong_the + newVal 
          : Math.max(0, nextFunds.tien_trong_the - newVal);
      }

      updateFundsAndPersist(nextFunds);
    }

    setTransactions((prev) =>
      sortTransactionsByDateDesc(prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
    );
    showToast('Đã cập nhật khoản thu chi & số tiền hiện có');

    if (isSupabaseConfigured) {
      try {
        await updateTransaction(id, updates);
      } catch (err) {
        console.error('Lỗi cập nhật Supabase:', err);
        showToast('⚠️ Lỗi cập nhật Supabase: ' + (err.message || 'Lỗi'));
      }
    }
  };

  // Đồng bộ toàn bộ dữ liệu hiện tại lên Supabase Cloud
  const handleSyncAllToSupabase = async () => {
    try {
      showToast('Đang kết nối và lưu dữ liệu lên Supabase...');
      const res = await syncAllLocalToSupabase({
        transactions,
        monthlyConfigs,
        members,
        goals: initialGoals
      });
      showToast(`Đã đồng bộ ${res.transactionsCount} giao dịch lên Supabase!`);
      return { success: true, ...res };
    } catch (err) {
      console.error('Lỗi đồng bộ Supabase:', err);
      if (err.code === 'PGRST205' || err.message?.includes('schema cache')) {
        alert('⚠️ Bảng chưa tồn tại trên Supabase Database!\n\nVui lòng mở Supabase Dashboard -> SQL Editor, copy nội dung file supabase/schema.sql và bấm RUN trước nhé.');
      } else {
        alert('Lỗi khi lưu Supabase: ' + (err.message || 'Không thể kết nối'));
      }
      return { success: false, error: err };
    }
  };

  // NẾU CHƯA ĐĂNG NHẬP: CHỈ HIỂN THỊ DUY NHẤT FORM ĐĂNG NHẬP (KHÔNG CÓ ĐĂNG KÝ, KHÔNG CÓ QUÊN MẬT KHẨU)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FFF8FA] relative">
        {/* Hiệu ứng bong bóng và trái tim bay lơ lửng */}
        <FloatingAmbience />

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
    <div className="min-h-screen bg-[#FFF8FA]/80 text-slate-800 flex flex-col justify-between relative">
      {/* Hiệu ứng bong bóng và trái tim bay lơ lửng */}
      <FloatingAmbience />
      
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
        currentFunds={currentFunds}
      />

      {/* Modal Thêm & Sửa Thu Chi Toàn Cục */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setModalDefaultDate(null);
        }}
        transactionToEdit={editingTx}
        defaultDate={modalDefaultDate}
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
        currentMonth={currentMonth}
        onLogout={handleLogout}
        onOpenMemberManager={() => setIsMemberManagerOpen(true)}
        onSyncSupabase={handleSyncAllToSupabase}
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
          availableMonths={availableMonths}
          currentFunds={currentFunds}
          onUpdateTienNgoaiVi={handleUpdateTienNgoaiVi}
          onUpdateTienTrongThe={handleUpdateTienTrongThe}
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
      <footer className="w-full border-t border-pink-200/80 bg-white/40 py-4 px-4 text-center text-xs text-pink-900/60">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <span>Sổ thu chi gia đình Nhựt & Trang</span>
            <span>💕</span>
          </div>
          <div>
            Tháng {currentMonth?.includes('-') ? `${currentMonth.split('-')[1]}/${currentMonth.split('-')[0]}` : currentMonth} • Đồng bộ Supabase
          </div>
        </div>
      </footer>

    </div>
  );
}

