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
  upsertGlobalWallets,
  getAppCategories,
  upsertAppCategories,
  subscribeToTransactions,
  subscribeToMonthlyConfig,
  getSavingsGoals,
  upsertSavingsGoal,
  deleteSavingsGoal,
  subscribeToSavingsGoals
} from './supabaseClient';
import CategoryManagerModal from './components/CategoryManagerModal';
import MemberManagerModal from './components/MemberManagerModal';
import MonthManagerModal from './components/MonthManagerModal';
import TransactionModal from './components/TransactionModal';
import AiSettingsModal from './components/AiSettingsModal';
import AiAssistantChat from './components/AiAssistantChat';
import { syncCloudAiConfigToLocal } from './services/geminiAiService';
import DailyReminderCard from './components/DailyReminderCard';
import SavingsGoalsSection from './components/SavingsGoalsSection';
import LoginForm from './components/LoginForm';
import { Check } from '@phosphor-icons/react';
import { sanitizeMemberForStorage } from './utils/crypto';

// Đảm bảo mỗi giao dịch luôn có giờ cố định, tuyệt đối không dùng Math.random() để tránh bị nhảy xáo trộn khi F5
const getDeterministicTime = (tx, index = 0) => {
  if (tx?.gio && typeof tx.gio === 'string' && tx.gio.trim().length > 0) {
    return tx.gio.trim();
  }
  if (tx?.created_at) {
    try {
      const d = new Date(tx.created_at);
      if (!isNaN(d.getTime())) {
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
      }
    } catch (e) {}
  }
  const str = String(tx?.id || index);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
  }
  const h = String(8 + (Math.abs(hash) % 13)).padStart(2, '0');
  const m = String((Math.abs(hash) * 7) % 60).padStart(2, '0');
  return `${h}:${m}`;
};

export default function App() {
  // Trạng thái tài khoản đang đăng nhập (lưu cả localStorage & sessionStorage để duy trì vĩnh viễn khi F5 / mở lại trình duyệt)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nt_auth_user') || sessionStorage.getItem('nt_auth_user');
      if (saved) {
        return sanitizeMemberForStorage(JSON.parse(saved));
      }
    } catch (e) {}
    return null;
  });

  // 1. Trạng thái người dùng và không gian
  const [activeUser, setActiveUser] = useState(() => {
    try {
      const savedAuth = localStorage.getItem('nt_auth_user') || sessionStorage.getItem('nt_auth_user');
      if (savedAuth) {
        const u = JSON.parse(savedAuth);
        if (u && u.username) return u.username;
      }
      const savedActive = localStorage.getItem('nt_active_user');
      if (savedActive) return savedActive;
    } catch (e) {}
    return initialProfile.activeUser || 'nhut';
  });

  const handleSelectActiveUser = (username) => {
    setActiveUser(username);
    try {
      localStorage.setItem('nt_active_user', username);
    } catch (e) {}
  };

  const [activeVault, setActiveVault] = useState(() => {
    return 'all'; // mặc định xem tất cả
  });

  const [privacyMode, setPrivacyMode] = useState(false);

  // Trạng thái tải dữ liệu trực tiếp từ Supabase Cloud
  const [isLoadingData, setIsLoadingData] = useState(true);

  // SỐ TIỀN HIỆN CÓ: Tải và lưu trực tiếp trên Supabase Cloud
  const [currentFunds, setCurrentFunds] = useState({
    so_tien_hien_co: 0
  });

  // Lấy tháng hiện tại thực tế theo lịch (YYYY-MM)
  const getSystemCurrentMonth = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };

  // Quản lý tháng đang xem
  const [currentMonth, setCurrentMonth] = useState(getSystemCurrentMonth());

  const [monthlyConfigs, setMonthlyConfigs] = useState({
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
  });

  const [isMonthManagerOpen, setIsMonthManagerOpen] = useState(false);

  // Danh sách giao dịch: Lưu và đọc trực tiếp từ Supabase
  const [transactions, setTransactions] = useState([]);

  // Phân loại và loại: Đọc và lưu trực tiếp từ Supabase
  const [categories, setCategories] = useState(categoriesList);
  const [macroTypes, setMacroTypes] = useState(macroTypesList);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  // Quản lý thành viên gia đình (Tự động xóa sạch mã PIN dạng plain text để bảo mật)
  const [members, setMembers] = useState(() => {
    return initialMembers.map((m) => sanitizeMemberForStorage(m));
  });

  const [isMemberManagerOpen, setIsMemberManagerOpen] = useState(false);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  // Danh sách mục tiêu tiết kiệm: Lưu và đọc trực tiếp từ Supabase (gắn theo từng tháng)
  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem('nt_family_savings_goals');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(g => ({
            ...g,
            month: g.month || (g.deadline ? g.deadline.slice(0, 7) : '2026-10')
          }));
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  const handleAddGoal = async (newGoal) => {
    const goalWithMonth = {
      ...newGoal,
      month: newGoal.month || currentMonth || '2026-10'
    };
    const updated = [goalWithMonth, ...goals];
    setGoals(updated);
    try {
      localStorage.setItem('nt_family_savings_goals', JSON.stringify(updated));
    } catch (e) {}

    if (isSupabaseConfigured) {
      try {
        await upsertSavingsGoal(goalWithMonth, updated);
      } catch (err) {
        console.error('Lỗi lưu mục tiêu vào Supabase:', err);
      }
    }
  };

  const handleUpdateGoal = async (updatedGoal) => {
    const goalWithMonth = {
      ...updatedGoal,
      month: updatedGoal.month || currentMonth || '2026-10'
    };
    const updated = goals.map((g) => (g.id === updatedGoal.id ? goalWithMonth : g));
    setGoals(updated);
    try {
      localStorage.setItem('nt_family_savings_goals', JSON.stringify(updated));
    } catch (e) {}

    if (isSupabaseConfigured) {
      try {
        await upsertSavingsGoal(goalWithMonth, updated);
      } catch (err) {
        console.error('Lỗi cập nhật mục tiêu vào Supabase:', err);
      }
    }
  };

  const handleDeleteGoal = async (goalId) => {
    const remaining = goals.filter((g) => g.id !== goalId);
    setGoals(remaining);
    try {
      localStorage.setItem('nt_family_savings_goals', JSON.stringify(remaining));
    } catch (e) {}

    if (isSupabaseConfigured) {
      try {
        await deleteSavingsGoal(goalId, remaining);
      } catch (err) {
        console.error('Lỗi xóa mục tiêu khỏi Supabase:', err);
      }
    }
  };

  const handleDepositGoal = async (goalId, amountNum, author, note) => {
    let targetGoalUpdated = null;
    const updated = goals.map((g) => {
      if (g.id === goalId) {
        const newCurrent = (Number(g.current) || 0) + amountNum;
        const newHistoryItem = {
          id: 'h-' + Date.now(),
          author: author || 'Nhựt',
          amount: amountNum,
          date: new Date().toISOString().split('T')[0],
          note: note || 'Tích lũy'
        };
        targetGoalUpdated = {
          ...g,
          current: newCurrent,
          history: [newHistoryItem, ...(g.history || [])]
        };
        return targetGoalUpdated;
      }
      return g;
    });

    setGoals(updated);
    try {
      localStorage.setItem('nt_family_savings_goals', JSON.stringify(updated));
    } catch (e) {}

    if (isSupabaseConfigured && targetGoalUpdated) {
      try {
        await upsertSavingsGoal(targetGoalUpdated, updated);
      } catch (err) {
        console.error('Lỗi nạp tiền mục tiêu vào Supabase:', err);
      }
    }
  };

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

  // Cuộn mượt đến nút thêm chi tiêu và tạo hiệu ứng nhấp nháy nổi bật
  const handleScrollToAddExpense = () => {
    const target = document.getElementById('btn-add-transaction') || document.getElementById('add-transaction-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('ring-4', 'ring-emerald-400', 'ring-offset-2');
      setTimeout(() => {
        target.classList.remove('ring-4', 'ring-emerald-400', 'ring-offset-2');
      }, 1500);
    }
  };

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // 1. Tự động xóa sạch các cache dữ liệu cũ (giao dịch, cấu hình) để đảm bảo 100% dữ liệu đồng bộ từ Supabase
  useEffect(() => {
    ['nt_transactions', 'nt_monthly_configs', 'nt_current_funds', 'nt_current_month'].forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch (e) {}
    });
  }, []);

  // 2. Tải toàn bộ dữ liệu trực tiếp từ Supabase Cloud khi mở ứng dụng & Đăng ký Realtime
  useEffect(() => {
    let isMounted = true;

    const loadAllFromSupabase = async () => {
      if (!isSupabaseConfigured) {
        setIsLoadingData(false);
        return;
      }

      try {
        const [cloudTxs, cloudConfigs, cloudMembers, cloudCategories, cloudGoals] = await Promise.all([
          getTransactions().catch((e) => { console.error('Lỗi tải transactions:', e); return null; }),
          getAllMonthlyConfigs().catch((e) => { console.error('Lỗi tải monthly_config:', e); return null; }),
          getFamilyMembers().catch((e) => { console.error('Lỗi tải family_members:', e); return null; }),
          getAppCategories().catch((e) => { console.error('Lỗi tải app_categories:', e); return null; }),
          getSavingsGoals().catch((e) => { console.error('Lỗi tải savings_goals:', e); return null; })
        ]);

        if (!isMounted) return;

        // A. Cập nhật giao dịch từ Supabase
        if (cloudTxs && Array.isArray(cloudTxs)) {
          const withTime = cloudTxs.map((t, idx) => ({
            ...t,
            gio: getDeterministicTime(t, idx)
          }));
          setTransactions(sortTransactionsByDateDesc(withTime));
        }

        // B. Cập nhật cấu hình các tháng và Số tiền hiện có
        if (cloudConfigs && Array.isArray(cloudConfigs) && cloudConfigs.length > 0) {
          const merged = {};
          cloudConfigs.forEach((c) => {
            // QUAN TRỌNG: Chỉ lấy các bản ghi là Tháng thực tế (định dạng YYYY-MM)
            // Loại bỏ hoàn toàn các bản ghi meta hệ thống (savings_goals_meta, global_wallets, app_categories, system_ai_config...)
            if (!/^\d{4}-\d{2}$/.test(c.id)) return;
            merged[c.id] = {
              id: c.id,
              banner_focus: c.banner_focus || '',
              han_muc_chi: Number(c.han_muc_chi) || 30000000,
              ghi_chu: c.ghi_chu || '',
              tien_ngoai_vi: Number(c.tien_ngoai_vi) || 0,
              tien_trong_the: Number(c.tien_trong_the) || 0
            };
          });

          // Phục hồi cấu hình Quản gia AI dùng chung cho cả Nhựt & Trang từ Supabase
          const sharedAi = cloudConfigs.find((c) => c.id === 'system_ai_config');
          if (sharedAi?.ghi_chu) {
            try {
              const aiData = JSON.parse(sharedAi.ghi_chu);
              syncCloudAiConfigToLocal(aiData);
            } catch (e) {}
          }

          // Phục hồi Số Tiền Hiện Có từ Supabase
          const globalWallet = cloudConfigs.find((c) => c.id === 'global_wallets');
          if (globalWallet) {
            const cloudTotal = (Number(globalWallet.tien_ngoai_vi) || 0) + (Number(globalWallet.tien_trong_the) || 0);
            setCurrentFunds({ so_tien_hien_co: cloudTotal });
          }

          // Tự động kiểm tra và khởi tạo tháng hiện tại trên Supabase nếu chưa có
          const sysMonth = getSystemCurrentMonth();
          if (!merged[sysMonth]) {
            const validMonthKeys = Object.keys(merged).filter(k => /^\d{4}-\d{2}$/.test(k)).sort().reverse();
            const lastMonthKey = validMonthKeys[0];
            const lastHanMuc = lastMonthKey && merged[lastMonthKey]?.han_muc_chi
              ? Number(merged[lastMonthKey].han_muc_chi)
              : 30000000;
            const [y, m] = sysMonth.split('-');
            const autoMonth = {
              id: sysMonth,
              banner_focus: 'Khởi đầu tháng mới: Chi tiêu thông minh & tiết kiệm',
              han_muc_chi: lastHanMuc,
              ghi_chu: `Sổ chi tiêu Tháng ${m}/${y} (Tự động khởi tạo)`,
              tien_ngoai_vi: 0,
              tien_trong_the: 0
            };
            merged[sysMonth] = autoMonth;
            upsertMonthlyConfig(autoMonth).catch(console.error);
          }

          setMonthlyConfigs((prev) => ({ ...prev, ...merged }));
        }

        // C. Cập nhật thành viên gia đình từ Supabase
        if (cloudMembers && Array.isArray(cloudMembers) && cloudMembers.length > 0) {
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

        // D. Cập nhật danh mục phân loại & loại từ Supabase
        if (cloudCategories) {
          if (cloudCategories.categories && Array.isArray(cloudCategories.categories)) {
            setCategories(cloudCategories.categories);
          }
          if (cloudCategories.macroTypes && Array.isArray(cloudCategories.macroTypes)) {
            setMacroTypes(cloudCategories.macroTypes);
          }
        }

        // E. Cập nhật mục tiêu tiết kiệm từ Supabase
        if (cloudGoals && Array.isArray(cloudGoals)) {
          setGoals(cloudGoals);
          try {
            localStorage.setItem('nt_family_savings_goals', JSON.stringify(cloudGoals));
          } catch (e) {}
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu từ Supabase:', err);
      } finally {
        if (isMounted) {
          setIsLoadingData(false);
        }
      }
    };

    loadAllFromSupabase();

    // 3. Đăng ký Realtime Subscriptions từ Supabase
    const unsubscribeTx = subscribeToTransactions(
      (newTx) => {
        setTransactions((prev) => {
          if (prev.some((t) => t.id === newTx.id)) return prev;
          const withTime = { ...newTx, gio: newTx.gio || getDeterministicTime(newTx, 0) };
          return sortTransactionsByDateDesc([withTime, ...prev]);
        });
      },
      (updatedTx) => {
        setTransactions((prev) => {
          return prev.map((t) => (t.id === updatedTx.id ? { ...t, ...updatedTx } : t));
        });
      },
      (deletedTx) => {
        setTransactions((prev) => prev.filter((t) => t.id !== deletedTx.id));
      }
    );

    const unsubscribeConfig = subscribeToMonthlyConfig((payload) => {
      if (payload.new && payload.new.id === 'global_wallets') {
        const total = (Number(payload.new.tien_ngoai_vi) || 0) + (Number(payload.new.tien_trong_the) || 0);
        setCurrentFunds({ so_tien_hien_co: total });
      } else if (payload.new && payload.new.id === 'app_categories' && payload.new.ghi_chu) {
        try {
          const parsed = JSON.parse(payload.new.ghi_chu);
          if (parsed.categories) setCategories(parsed.categories);
          if (parsed.macroTypes) setMacroTypes(parsed.macroTypes);
        } catch (e) {}
      } else if (payload.new && payload.new.id === 'system_ai_config' && payload.new.ghi_chu) {
        try {
          const parsed = JSON.parse(payload.new.ghi_chu);
          syncCloudAiConfigToLocal(parsed);
        } catch (e) {}
      } else if (payload.new && payload.new.id) {
        setMonthlyConfigs((prev) => ({
          ...prev,
          [payload.new.id]: {
            id: payload.new.id,
            banner_focus: payload.new.banner_focus || '',
            han_muc_chi: Number(payload.new.han_muc_chi) || 30000000,
            ghi_chu: payload.new.ghi_chu || '',
            tien_ngoai_vi: Number(payload.new.tien_ngoai_vi) || 0,
            tien_trong_the: Number(payload.new.tien_trong_the) || 0
          }
        }));
      }
    });

    const unsubscribeGoals = subscribeToSavingsGoals(async () => {
      try {
        const freshGoals = await getSavingsGoals();
        if (freshGoals && Array.isArray(freshGoals)) {
          setGoals(freshGoals);
          try {
            localStorage.setItem('nt_family_savings_goals', JSON.stringify(freshGoals));
          } catch (e) {}
        }
      } catch (e) {}
    });

    return () => {
      isMounted = false;
      if (unsubscribeTx) unsubscribeTx();
      if (unsubscribeConfig) unsubscribeConfig();
      if (unsubscribeGoals) unsubscribeGoals();
    };
  }, []);

  // Hàm lưu và đồng bộ Số Tiền Hiện Có thẳng lên Supabase
  const updateFundsAndPersist = async (newFunds) => {
    setCurrentFunds(newFunds);
    if (isSupabaseConfigured) {
      try {
        await upsertGlobalWallets(newFunds);
        const updatedCfg = {
          ...(monthlyConfigs[currentMonth] || { id: currentMonth }),
          tien_ngoai_vi: newFunds.so_tien_hien_co,
          tien_trong_the: 0
        };
        await upsertMonthlyConfig(updatedCfg);
      } catch (err) {
        console.error('Lỗi lưu số tiền hiện có lên Supabase:', err);
      }
    }
  };

  const handleUpdateFunds = async (val) => {
    const num = Number(val) || 0;
    const next = { so_tien_hien_co: num };
    await updateFundsAndPersist(next);
    showToast(`Đã lưu số tiền hiện có lên Supabase: ${new Intl.NumberFormat('vi-VN').format(num)} đ`);
  };

  const handleSaveMonthlyConfig = async (newConfig) => {
    setMonthlyConfigs((prev) => ({
      ...prev,
      [newConfig.id]: newConfig
    }));

    if (newConfig.so_tien_hien_co !== undefined || newConfig.tien_ngoai_vi !== undefined || newConfig.tien_trong_the !== undefined) {
      const nextAmount = newConfig.so_tien_hien_co !== undefined 
        ? Number(newConfig.so_tien_hien_co) 
        : ((Number(newConfig.tien_ngoai_vi) || 0) + (Number(newConfig.tien_trong_the) || 0));
      await updateFundsAndPersist({ so_tien_hien_co: nextAmount });
    }

    if (isSupabaseConfigured) {
      try {
        await upsertMonthlyConfig(newConfig);
        showToast(`Đã lưu cấu hình tháng ${newConfig.id} lên Supabase`);
      } catch (err) {
        console.error('Lỗi lưu cấu hình tháng lên Supabase:', err);
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

  // Tính danh sách các tháng có sẵn (BẮT BUỘC chỉ chứa các tháng hợp lệ dạng YYYY-MM)
  const availableMonths = useMemo(() => {
    const set = new Set();
    Object.keys(monthlyConfigs).forEach((k) => {
      if (/^\d{4}-\d{2}$/.test(k)) set.add(k);
    });
    if (/^\d{4}-\d{2}$/.test(currentMonth)) set.add(currentMonth);
    set.add('2026-10');
    set.add('2026-09');
    set.add('2026-08');
    transactions.forEach((t) => {
      if (t.ngay && /^\d{4}-\d{2}/.test(t.ngay)) {
        set.add(t.ngay.slice(0, 7));
      }
    });
    return Array.from(set).filter(m => /^\d{4}-\d{2}$/.test(m)).sort().reverse();
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
  // Quản lý CRUD Phân loại
  const handleAddCategory = async (newCat) => {
    if (!categories.includes(newCat)) {
      const updated = [...categories, newCat];
      setCategories(updated);
      showToast(`Đã thêm phân loại: ${newCat}`);
      if (isSupabaseConfigured) {
        await upsertAppCategories(updated, macroTypes);
      }
    }
  };

  const handleUpdateCategory = async (oldCat, newCat) => {
    const updated = categories.map((c) => (c === oldCat ? newCat : c));
    setCategories(updated);
    setTransactions((prev) =>
      prev.map((t) => (t.phan_loai === oldCat ? { ...t, phan_loai: newCat } : t))
    );
    showToast(`Đã đổi tên phân loại thành: ${newCat}`);
    if (isSupabaseConfigured) {
      await upsertAppCategories(updated, macroTypes);
    }
  };

  const handleDeleteCategory = async (cat) => {
    const updated = categories.filter((c) => c !== cat);
    setCategories(updated);
    showToast(`Đã xóa phân loại: ${cat}`);
    if (isSupabaseConfigured) {
      await upsertAppCategories(updated, macroTypes);
    }
  };

  // Quản lý CRUD Loại (macro types)
  const handleAddMacroType = async (newType) => {
    if (!macroTypes.includes(newType)) {
      const updated = [...macroTypes, newType];
      setMacroTypes(updated);
      showToast(`Đã thêm loại: ${newType}`);
      if (isSupabaseConfigured) {
        await upsertAppCategories(categories, updated);
      }
    }
  };

  const handleUpdateMacroType = async (oldType, newType) => {
    const updated = macroTypes.map((t) => (t === oldType ? newType : t));
    setMacroTypes(updated);
    setTransactions((prev) =>
      prev.map((t) => (t.loai === oldType ? { ...t, loai: newType } : t))
    );
    showToast(`Đã đổi tên loại thành: ${newType}`);
    if (isSupabaseConfigured) {
      await upsertAppCategories(categories, updated);
    }
  };

  const handleDeleteMacroType = async (type) => {
    const updated = macroTypes.filter((t) => t !== type);
    setMacroTypes(updated);
    showToast(`Đã xóa loại: ${type}`);
    if (isSupabaseConfigured) {
      await upsertAppCategories(categories, updated);
    }
  };

  // Đăng nhập & Đăng xuất (lưu phiên đăng nhập an toàn trong localStorage & sessionStorage để ghi nhớ sau khi F5)
  const handleLoginSuccess = (member, rememberMe = true) => {
    setCurrentUser(member);
    setActiveUser(member.username);
    try {
      const serialized = JSON.stringify(member);
      sessionStorage.setItem('nt_auth_user', serialized);
      if (rememberMe) {
        localStorage.setItem('nt_auth_user', serialized);
        localStorage.setItem('nt_active_user', member.username);
      }
    } catch (e) {}
    showToast(`Chào mừng ${member.name} đã đăng nhập!`);
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('nt_auth_user');
      localStorage.removeItem('nt_auth_user');
      localStorage.removeItem('nt_active_user');
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
        const serialized = JSON.stringify(updatedUser);
        sessionStorage.setItem('nt_auth_user', serialized);
        if (localStorage.getItem('nt_auth_user')) {
          localStorage.setItem('nt_auth_user', serialized);
        }
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

  // Thêm giao dịch & lưu thẳng lên Supabase
  const handleAddTransaction = async (newTx) => {
    // Đảm bảo có giờ cố định
    const txWithTime = {
      ...newTx,
      gio: newTx.gio || getDeterministicTime(newTx, 0)
    };
    setTransactions((prev) => sortTransactionsByDateDesc([txWithTime, ...prev]));

    // Điều chỉnh số tiền hiện có (+ thu, - chi)
    const isThu = (Number(txWithTime.thu) || 0) > 0;
    const val = isThu ? Number(txWithTime.thu) : Number(txWithTime.chi);

    const nextAmount = isThu 
      ? currentFunds.so_tien_hien_co + val 
      : Math.max(0, currentFunds.so_tien_hien_co - val);
    
    updateFundsAndPersist({ so_tien_hien_co: nextAmount });

    const actionLabel = isThu 
      ? `+${new Intl.NumberFormat('vi-VN').format(val)} đ vào số tiền hiện có` 
      : `-${new Intl.NumberFormat('vi-VN').format(val)} đ từ số tiền hiện có`;

    if (isSupabaseConfigured) {
      try {
        await addTransaction(txWithTime);
        showToast(`Đã lưu vào Supabase & ${actionLabel}`);
      } catch (err) {
        console.error('Lỗi lưu Supabase:', err);
        showToast('⚠️ Không thể lưu lên Supabase: ' + (err.message || 'Lỗi'));
      }
    } else {
      showToast(`Đã ghi sổ & ${actionLabel}`);
    }
  };

  // Xóa giao dịch & hoàn lại số tiền hiện có trên Supabase
  const handleDeleteTransaction = async (id) => {
    const txToDelete = transactions.find((t) => t.id === id);
    if (txToDelete) {
      const isThu = (Number(txToDelete.thu) || 0) > 0;
      const val = isThu ? Number(txToDelete.thu) : Number(txToDelete.chi);

      // Hoàn lại: Nếu là chi thì cộng lại tiền, nếu là thu thì trừ lại
      const nextAmount = isThu 
        ? Math.max(0, currentFunds.so_tien_hien_co - val) 
        : currentFunds.so_tien_hien_co + val;

      updateFundsAndPersist({ so_tien_hien_co: nextAmount });
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Đã xóa khỏi Supabase & hoàn lại số tiền hiện có');

    if (isSupabaseConfigured) {
      try {
        await deleteTransaction(id);
      } catch (err) {
        console.error('Lỗi xóa Supabase:', err);
        showToast('⚠️ Lỗi xóa trên Supabase: ' + (err.message || 'Lỗi'));
      }
    }
  };

  // Cập nhật giao dịch & điều chỉnh lại số tiền hiện có trên Supabase
  const handleUpdateTransaction = async (id, updatesOrField, value) => {
    const updates = typeof updatesOrField === 'object' ? updatesOrField : { [updatesOrField]: value };
    const oldTx = transactions.find((t) => t.id === id);

    if (oldTx && (updates.thu !== undefined || updates.chi !== undefined)) {
      const oldIsThu = (Number(oldTx.thu) || 0) > 0;
      const oldVal = oldIsThu ? Number(oldTx.thu) : Number(oldTx.chi);

      const newThu = updates.thu !== undefined ? Number(updates.thu) : Number(oldTx.thu);
      const newChi = updates.chi !== undefined ? Number(updates.chi) : Number(oldTx.chi);
      const newIsThu = newThu > 0;
      const newVal = newIsThu ? newThu : newChi;

      // 1. Hoàn lại số tiền cũ
      let temp = oldIsThu 
        ? Math.max(0, currentFunds.so_tien_hien_co - oldVal) 
        : currentFunds.so_tien_hien_co + oldVal;

      // 2. Áp dụng số tiền mới
      let nextAmount = newIsThu 
        ? temp + newVal 
        : Math.max(0, temp - newVal);

      updateFundsAndPersist({ so_tien_hien_co: nextAmount });
    }

    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    showToast('Đã cập nhật trên Supabase');

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
        goals
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

  // NẾU ĐANG TẢI DỮ LIỆU TỪ SUPABASE CLOUD
  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-[#FFF8FA] flex flex-col items-center justify-center relative p-4 select-none">
        <FloatingAmbience />
        <div className="relative z-10 text-center space-y-4 max-w-sm w-full bg-white/85 backdrop-blur-md p-8 rounded-3xl border border-pink-200/90 shadow-xl shadow-pink-200/30">
          <div className="relative inline-flex items-center justify-center shrink-0 w-16 h-16 transition-transform">
            <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-md animate-pulse" fill="url(#pinkHeartLoading)">
              <defs>
                <linearGradient id="pinkHeartLoading" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FB7185" />
                  <stop offset="50%" stopColor="#EC4899" />
                  <stop offset="100%" stopColor="#E11D48" />
                </linearGradient>
              </defs>
              <path d="M16 28.5C15.5 28.5 15 28.3 14.6 28C13.2 26.9 2 17.8 2 10.5C2 5.8 5.8 2 10.5 2C13.2 2 15.6 3.2 16 3.5C16.4 3.2 18.8 2 21.5 2C26.2 2 30 5.8 30 10.5C30 17.8 18.8 26.9 17.4 28C17 28.3 16.5 28.5 16 28.5Z" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center pb-1 text-white font-black text-xl tracking-tight font-sans">
              NT
            </span>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 text-base">Sổ Thu Chi Nhựt & Trang</h3>
            <p className="text-xs text-pink-600/90 font-medium mt-1">Đang đồng bộ dữ liệu từ Supabase Cloud...</p>
          </div>

          <div className="w-full bg-pink-100/80 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 h-full w-1/2 rounded-full animate-indeterminate"></div>
          </div>
        </div>
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
        onSelectMonth={(m) => {
          setCurrentMonth(m);
        }}
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

      {/* Modal Cài đặt Quản gia AI */}
      <AiSettingsModal
        isOpen={isAiSettingsOpen}
        onClose={() => setIsAiSettingsOpen(false)}
        onSaveSuccess={(cfg) => {
          showToast(`Đã lưu cấu hình (${cfg.model})`);
        }}
      />

      {/* Đầu trang (Thanh điều hướng dính) */}
      <Header
        activeUser={activeUser}
        setActiveUser={handleSelectActiveUser}
        privacyMode={privacyMode}
        setPrivacyMode={setPrivacyMode}
        members={members}
        currentUser={currentUser}
        currentMonth={currentMonth}
        onLogout={handleLogout}
        onOpenMemberManager={() => setIsMemberManagerOpen(true)}
        onSyncSupabase={handleSyncAllToSupabase}
        onOpenAiSettings={() => setIsAiSettingsOpen(true)}
        onScrollToAddExpense={handleScrollToAddExpense}
      />

      {/* Nội dung chính: Khoảng trắng giữa tất cả các phần đều tăm tắp (space-y-3) */}
      <main className="space-y-3 pt-3">
        {/* 1. Thông báo gọn nhỏ mỗi ngày khi chưa điền thu chi ngày đó */}
        <DailyReminderCard
          transactions={transactions}
          onOpenAddTransaction={handleOpenAddTx}
          onShowToast={showToast}
        />

        {/* 2. Thêm thu chi lên đầu tiên dưới phần thông báo (Nút Thêm thu chi mới + Thêm nhanh 1 chạm) */}
        <QuickEntry
          onAddTransaction={handleAddTransaction}
          onOpenAddTransaction={handleOpenAddTx}
          activeUser={activeUser}
          activeVault={activeVault}
          onShowToast={showToast}
          categories={categories}
          macroTypes={macroTypes}
          members={members}
          currentMonth={currentMonth}
        />

        {/* 3. Section Mục Tiêu Tài Chính Tháng (Ăn theo tháng, mặc định thu gọn, khi nào bấm bật thì mới full ra) */}
        <SavingsGoalsSection
          goals={goals}
          currentMonth={currentMonth}
          availableMonths={availableMonths}
          onAddGoal={handleAddGoal}
          onUpdateGoal={handleUpdateGoal}
          onDeleteGoal={handleDeleteGoal}
          onDepositGoal={handleDepositGoal}
          privacyMode={privacyMode}
          activeUser={activeUser}
          onShowToast={showToast}
        />

        {/* 4. Tổng quan tháng & ghi chú riêng của tháng */}
        <BudgetPulse
          transactions={currentMonthTransactions}
          currentMonth={currentMonth}
          onSelectMonth={(m) => {
            setCurrentMonth(m);
          }}
          monthlyConfig={activeMonthlyConfig}
          onOpenMonthManager={() => setIsMonthManagerOpen(true)}
          privacyMode={privacyMode}
          availableMonths={availableMonths}
          currentFunds={currentFunds}
          onUpdateFunds={handleUpdateFunds}
        />

        {/* 5. Biểu đồ cơ cấu chi tiêu & thu nhập (hỗ trợ chuyển đổi Tròn/Cột & Lọc tháng) */}
        <CategoryPieChart
          transactions={transactions}
          privacyMode={privacyMode}
          currentMonth={currentMonth}
          availableMonths={availableMonths}
          onChangeMonth={setCurrentMonth}
        />

        {/* 6. Bảng sổ kế toán chuẩn Google Sheets */}
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

      {/* Quản gia nhà Nhựt Trang (Bot Chat Thông Minh) */}
      <AiAssistantChat
        isOpen={isAiChatOpen}
        onToggle={() => setIsAiChatOpen(!isAiChatOpen)}
        onOpenSettings={() => setIsAiSettingsOpen(true)}
        onAddTransaction={handleAddTransaction}
        onDeleteTransaction={handleDeleteTransaction}
        onUpdateTransaction={handleUpdateTransaction}
        transactions={transactions}
        monthlyConfig={activeMonthlyConfig}
        members={members}
        activeUser={activeUser}
        currentFunds={currentFunds}
        currentMonth={currentMonth}
        categories={categories}
        macroTypes={macroTypes}
        goals={goals}
        monthlyConfigs={monthlyConfigs}
      />

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

