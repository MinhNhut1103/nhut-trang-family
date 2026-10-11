import { createClient } from '@supabase/supabase-js';

const getEnv = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

// Hỗ trợ mọi định dạng biến môi trường: VITE_*, NEXT_PUBLIC_*, SUPABASE_* (Vercel Integration)
const supabaseUrl = 
  (typeof __VITE_INJECTED_SUPABASE_URL__ !== 'undefined' && __VITE_INJECTED_SUPABASE_URL__) ||
  getEnv('VITE_SUPABASE_URL') ||
  getEnv('NEXT_PUBLIC_SUPABASE_URL') ||
  getEnv('SUPABASE_URL') ||
  '';

const supabaseAnonKey = 
  (typeof __VITE_INJECTED_SUPABASE_ANON_KEY__ !== 'undefined' && __VITE_INJECTED_SUPABASE_ANON_KEY__) ||
  getEnv('VITE_SUPABASE_ANON_KEY') ||
  getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
  getEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') ||
  getEnv('SUPABASE_ANON_KEY') ||
  getEnv('SUPABASE_PUBLISHABLE_KEY') ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-public-key')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSchemaMissing = (error) => {
  return Boolean(error && (error.code === 'PGRST205' || error.message?.includes('schema cache')));
};

// Helper API functions
export async function getTransactions() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('ngay', { ascending: false })
    .order('created_at', { ascending: false });
  
  if (error) {
    if (!isSchemaMissing(error)) {
      console.error('Error fetching transactions:', error);
    }
    return null;
  }
  return data.map((t) => ({
    ...t,
    ghi_chu: (t.ghi_chu || '').replace(/\[Tiền mặt\]|\[Thẻ NH\]/g, '').trim()
  }));
}

export async function addTransaction(transaction) {
  if (!supabase) return null;

  const cleanNote = (transaction.ghi_chu || '').replace(/\[Tiền mặt\]|\[Thẻ NH\]/g, '').trim();

  // Sanitize payload chỉ gửi các cột chuẩn
  const payload = {
    id: transaction.id || ('tx-' + Date.now()),
    ngay: transaction.ngay,
    noi_dung: transaction.noi_dung,
    thu: Number(transaction.thu) || 0,
    chi: Number(transaction.chi) || 0,
    phan_loai: transaction.phan_loai || 'ăn uống',
    loai: transaction.loai || 'thiết yếu',
    vault: transaction.vault || 'shared',
    author: transaction.author || 'Nhựt',
    ghi_chu: cleanNote
  };
  if (transaction.gio) {
    payload.gio = transaction.gio;
  }

  let { data, error } = await supabase
    .from('transactions')
    .insert([payload])
    .select();
  
  // Nếu database chưa kịp có cột gio, tự động bỏ gio và thử lại ngay lập tức
  if (error && (error.code === 'PGRST204' || error.message?.includes("'gio'"))) {
    delete payload.gio;
    const retry = await supabase
      .from('transactions')
      .insert([payload])
      .select();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error('Error inserting transaction to Supabase:', error);
    throw error;
  }
  return data ? data[0] : null;
}

export async function deleteTransaction(id) {
  if (!supabase) return null;
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting transaction from Supabase:', error);
    throw error;
  }
  return true;
}

export async function updateTransaction(id, updates) {
  if (!supabase) return null;

  const payload = {};
  const allowed = ['ngay', 'noi_dung', 'thu', 'chi', 'phan_loai', 'loai', 'vault', 'author', 'ghi_chu', 'gio'];
  allowed.forEach((k) => {
    if (updates[k] !== undefined) {
      payload[k] = updates[k];
    }
  });

  if (payload.ghi_chu !== undefined) {
    payload.ghi_chu = (payload.ghi_chu || '').replace(/\[Tiền mặt\]|\[Thẻ NH\]/g, '').trim();
  }

  if (payload.thu !== undefined) payload.thu = Number(payload.thu) || 0;
  if (payload.chi !== undefined) payload.chi = Number(payload.chi) || 0;

  let { data, error } = await supabase
    .from('transactions')
    .update(payload)
    .eq('id', id)
    .select();
  
  // Fallback nếu database chưa có cột gio
  if (error && (error.code === 'PGRST204' || error.message?.includes("'gio'"))) {
    delete payload.gio;
    const retry = await supabase
      .from('transactions')
      .update(payload)
      .eq('id', id)
      .select();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error('Error updating transaction in Supabase:', error);
    throw error;
  }
  return data ? data[0] : null;
}

export async function getMonthlyConfig(monthId = '2026-10') {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('monthly_config')
    .select('*')
    .eq('id', monthId)
    .single();

  if (error && error.code !== 'PGRST116') {
    if (!isSchemaMissing(error)) {
      console.error('Error fetching monthly config:', error);
    }
  }
  return data;
}

export async function getAllMonthlyConfigs() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('monthly_config')
    .select('*')
    .order('id', { ascending: false });
  
  if (error) {
    if (!isSchemaMissing(error)) {
      console.error('Error fetching all monthly configs:', error);
    }
    return null;
  }
  return data;
}

export async function upsertMonthlyConfig(config) {
  if (!supabase) return null;
  const payload = {
    id: config.id,
    banner_focus: config.banner_focus || '',
    han_muc_chi: Number(config.han_muc_chi) || 30000000,
    ghi_chu: config.ghi_chu || '',
    updated_at: new Date().toISOString()
  };
  if (config.tien_ngoai_vi !== undefined) {
    payload.tien_ngoai_vi = Number(config.tien_ngoai_vi) || 0;
  }
  if (config.tien_trong_the !== undefined) {
    payload.tien_trong_the = Number(config.tien_trong_the) || 0;
  }

  let { data, error } = await supabase
    .from('monthly_config')
    .upsert(payload)
    .select();
  
  // Fallback an toàn nếu database chưa có sẵn cột tien_ngoai_vi hoặc tien_trong_the
  if (error && (error.code === 'PGRST204' || error.message?.includes('tien_'))) {
    delete payload.tien_ngoai_vi;
    delete payload.tien_trong_the;
    const retry = await supabase
      .from('monthly_config')
      .upsert(payload)
      .select();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    if (!isSchemaMissing(error)) {
      console.error('Error upserting monthly config:', error);
    }
    throw error;
  }
  return data ? data[0] : null;
}

// Helper quản lý Số tiền hiện có toàn cục (Ví tiền mặt & Thẻ ngân hàng)
export async function getGlobalWallets() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('monthly_config')
    .select('tien_ngoai_vi, tien_trong_the')
    .eq('id', 'global_wallets')
    .single();

  if (error && error.code !== 'PGRST116') {
    return null;
  }
  if (!data) return null;
  return {
    so_tien_hien_co: (Number(data.tien_ngoai_vi) || 0) + (Number(data.tien_trong_the) || 0)
  };
}

export async function upsertGlobalWallets(wallets) {
  if (!supabase) return null;
  const amount = Number(wallets?.so_tien_hien_co ?? ((Number(wallets?.tien_ngoai_vi) || 0) + (Number(wallets?.tien_trong_the) || 0))) || 0;
  const payload = {
    id: 'global_wallets',
    banner_focus: 'Số tiền hiện có',
    tien_ngoai_vi: amount,
    tien_trong_the: 0,
    updated_at: new Date().toISOString()
  };
  try {
    const { data, error } = await supabase
      .from('monthly_config')
      .upsert(payload)
      .select();
    if (error) {
      console.warn('Không thể lưu global_wallets lên Supabase:', error);
      return null;
    }
    return data ? data[0] : null;
  } catch (e) {
    console.warn('Lỗi upsertGlobalWallets:', e);
    return null;
  }
}

export async function updateMonthlyFocus(monthId = '2026-10', focusText) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('monthly_config')
    .upsert({ id: monthId, banner_focus: focusText, updated_at: new Date().toISOString() })
    .select();
  
  if (error) throw error;
  return data[0];
}

// ==========================================
// 4. QUẢN LÝ THÀNH VIÊN & BẢO MẬT ĐĂNG NHẬP
// ==========================================

export async function getFamilyMembers() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (error) {
    if (!isSchemaMissing(error)) {
      console.error('Error fetching family_members from Supabase:', error);
    }
    return null;
  }
  return data;
}

export async function addFamilyMember(member) {
  if (!supabase) return null;
  const payload = {
    id: member.id,
    username: member.username,
    name: member.name,
    pin_hash: member.pin_hash || member.pin || '',
    role: member.role || 'Thành viên',
    vault: member.vault || `personal_${member.username}`,
    color: member.color || 'emerald',
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('family_members')
    .insert([payload])
    .select();
  
  if (error) {
    console.error('Error adding family member to Supabase:', error);
    throw error;
  }
  return data[0];
}

export async function updateFamilyMember(id, updates) {
  if (!supabase) return null;
  const payload = { ...updates, updated_at: new Date().toISOString() };
  if (payload.pin) {
    payload.pin_hash = payload.pin;
    delete payload.pin;
  }

  const { data, error } = await supabase
    .from('family_members')
    .update(payload)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error updating family member in Supabase:', error);
    throw error;
  }
  return data[0];
}

export async function deleteFamilyMember(id) {
  if (!supabase) return null;
  const { error } = await supabase
    .from('family_members')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting family member from Supabase:', error);
    throw error;
  }
  return true;
}

// ==========================================
// 5. MỤC TIÊU TIẾT KIỆM (SAVINGS GOALS)
// ==========================================

export async function getSavingsGoals() {
  if (!supabase) return null;
  try {
    const [goalsRes, metaRes] = await Promise.all([
      supabase.from('savings_goals').select('*').order('created_at', { ascending: true }),
      supabase.from('monthly_config').select('*').eq('id', 'savings_goals_meta').maybeSingle()
    ]);

    if (goalsRes.error) {
      if (!isSchemaMissing(goalsRes.error)) {
        console.error('Error fetching savings_goals from Supabase:', goalsRes.error);
      }
      return null;
    }

    const rows = goalsRes.data || [];
    let metaMap = {};
    if (metaRes.data?.ghi_chu) {
      try {
        metaMap = JSON.parse(metaRes.data.ghi_chu) || {};
      } catch (e) {}
    }

    return rows.map((row) => {
      const meta = metaMap[row.id] || {};
      return {
        id: row.id,
        title: row.title,
        target: Number(row.target) || 0,
        current: Number(row.current) || 0,
        icon: row.icon || 'Target',
        color: row.color || 'emerald',
        category: meta.category || 'Gia đình',
        deadline: meta.deadline || '',
        history: Array.isArray(meta.history) ? meta.history : []
      };
    });
  } catch (err) {
    console.error('Error in getSavingsGoals:', err);
    return null;
  }
}

export async function saveSavingsGoalsMeta(goals = []) {
  if (!supabase) return;
  try {
    const metaMap = {};
    goals.forEach((g) => {
      metaMap[g.id] = {
        category: g.category || 'Gia đình',
        deadline: g.deadline || '',
        history: g.history || []
      };
    });
    await supabase.from('monthly_config').upsert({
      id: 'savings_goals_meta',
      ghi_chu: JSON.stringify(metaMap),
      updated_at: new Date().toISOString()
    });
  } catch (e) {
    console.error('Error saving savings_goals_meta:', e);
  }
}

export async function upsertSavingsGoal(goal, allGoals = null) {
  if (!supabase) return null;
  const payload = {
    id: goal.id,
    title: goal.title,
    target: Number(goal.target) || 0,
    current: Number(goal.current) || 0,
    icon: goal.icon || 'Target',
    color: goal.color || 'emerald'
  };

  const { data, error } = await supabase
    .from('savings_goals')
    .upsert(payload)
    .select();

  if (error) {
    console.error('Error upserting savings goal:', error);
    throw error;
  }

  if (allGoals && Array.isArray(allGoals)) {
    await saveSavingsGoalsMeta(allGoals);
  } else {
    // Cập nhật meta cho goal đơn lẻ
    const { data: curMeta } = await supabase.from('monthly_config').select('ghi_chu').eq('id', 'savings_goals_meta').maybeSingle();
    let metaMap = {};
    if (curMeta?.ghi_chu) {
      try { metaMap = JSON.parse(curMeta.ghi_chu) || {}; } catch (e) {}
    }
    metaMap[goal.id] = {
      category: goal.category || 'Gia đình',
      deadline: goal.deadline || '',
      history: goal.history || []
    };
    await supabase.from('monthly_config').upsert({
      id: 'savings_goals_meta',
      ghi_chu: JSON.stringify(metaMap),
      updated_at: new Date().toISOString()
    });
  }

  return data?.[0] || goal;
}

export async function deleteSavingsGoal(goalId, remainingGoals = null) {
  if (!supabase) return false;
  const { error } = await supabase
    .from('savings_goals')
    .delete()
    .eq('id', goalId);

  if (error) {
    console.error('Error deleting savings goal:', error);
    throw error;
  }

  if (remainingGoals && Array.isArray(remainingGoals)) {
    await saveSavingsGoalsMeta(remainingGoals);
  } else {
    const { data: curMeta } = await supabase.from('monthly_config').select('ghi_chu').eq('id', 'savings_goals_meta').maybeSingle();
    if (curMeta?.ghi_chu) {
      try {
        const metaMap = JSON.parse(curMeta.ghi_chu) || {};
        delete metaMap[goalId];
        await supabase.from('monthly_config').upsert({
          id: 'savings_goals_meta',
          ghi_chu: JSON.stringify(metaMap),
          updated_at: new Date().toISOString()
        });
      } catch (e) {}
    }
  }

  return true;
}

export function subscribeToSavingsGoals(callback) {
  if (!supabase) return null;
  const channel = supabase
    .channel('savings_goals_realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'savings_goals' }, (payload) => {
      if (callback) callback(payload);
    })
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

// ==========================================
// 6. ĐỒNG BỘ TOÀN DIỆN LÊN SUPABASE CLOUD
// ==========================================

export async function syncAllLocalToSupabase({ transactions = [], monthlyConfigs = {}, members = [], goals = [] }) {
  if (!supabase) throw new Error('Supabase chưa được cấu hình');

  const results = {
    transactionsCount: 0,
    configsCount: 0,
    membersCount: 0,
    goalsCount: 0
  };

  // 1. Members
  if (members && members.length > 0) {
    const memPayload = members.map((m) => ({
      id: m.id,
      username: m.username,
      name: m.name,
      pin_hash: m.pin_hash || m.pin || '',
      role: m.role || 'Thành viên',
      vault: m.vault || `personal_${m.username}`,
      color: m.color || 'emerald',
      updated_at: new Date().toISOString()
    }));
    const { error: memErr } = await supabase.from('family_members').upsert(memPayload);
    if (memErr) throw memErr;
    results.membersCount = memPayload.length;
  }

  // 2. Configs
  const configList = Object.values(monthlyConfigs || {});
  if (configList.length > 0) {
    const confPayload = configList.map((c) => ({
      id: c.id,
      banner_focus: c.banner_focus || '',
      han_muc_chi: Number(c.han_muc_chi) || 30000000,
      ghi_chu: c.ghi_chu || '',
      tien_ngoai_vi: Number(c.tien_ngoai_vi) || 0,
      tien_trong_the: Number(c.tien_trong_the) || 0,
      updated_at: new Date().toISOString()
    }));
    const { error: confErr } = await supabase.from('monthly_config').upsert(confPayload);
    if (confErr) throw confErr;
    results.configsCount = confPayload.length;
  }

  // 3. Goals
  if (goals && goals.length > 0) {
    const goalPayload = goals.map((g) => ({
      id: g.id,
      title: g.title,
      target: Number(g.target) || 0,
      current: Number(g.current) || 0,
      icon: g.icon || 'ShieldCheck',
      color: g.color || 'emerald'
    }));
    const { error: goalErr } = await supabase.from('savings_goals').upsert(goalPayload);
    if (goalErr) throw goalErr;
    await saveSavingsGoalsMeta(goals);
    results.goalsCount = goalPayload.length;
  }

  // 4. Transactions (batch 50)
  if (transactions && transactions.length > 0) {
    const txPayload = transactions.map((t) => ({
      id: t.id,
      ngay: t.ngay,
      gio: t.gio || '08:00',
      noi_dung: t.noi_dung,
      thu: Number(t.thu) || 0,
      chi: Number(t.chi) || 0,
      phan_loai: t.phan_loai || 'ăn uống',
      loai: t.loai || 'thiết yếu',
      vault: t.vault || 'shared',
      author: t.author || 'Nhựt',
      ghi_chu: t.ghi_chu || ''
    }));

    const batchSize = 50;
    for (let i = 0; i < txPayload.length; i += batchSize) {
      const batch = txPayload.slice(i, i + batchSize);
      const { error: txErr } = await supabase.from('transactions').upsert(batch);
      if (txErr) throw txErr;
      results.transactionsCount += batch.length;
    }
  }

  return results;
}

// ==========================================
// 7. QUẢN LÝ PHÂN LOẠI & LOẠI TRÊN SUPABASE
// ==========================================

export async function getAppCategories() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('monthly_config')
    .select('ghi_chu')
    .eq('id', 'app_categories')
    .single();

  if (error || !data?.ghi_chu) return null;
  try {
    return JSON.parse(data.ghi_chu);
  } catch (e) {
    return null;
  }
}

export async function upsertAppCategories(categories, macroTypes) {
  if (!supabase) return null;
  const payload = {
    id: 'app_categories',
    banner_focus: 'Danh mục phân loại',
    ghi_chu: JSON.stringify({ categories, macroTypes }),
    updated_at: new Date().toISOString()
  };
  const { data, error } = await supabase
    .from('monthly_config')
    .upsert(payload)
    .select();
  if (error) {
    console.error('Error saving app_categories to Supabase:', error);
  }
  return data ? data[0] : null;
}

// ==========================================
// 7.1 CẤU HÌNH QUẢN GIA AI DÙNG CHUNG CẢ GIA ĐÌNH (SUPABASE CLOUD)
// Nhập 1 lần dùng chung cho cả Nhựt & Trang trên mọi thiết bị
// ==========================================

export async function getSharedAiConfig() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('monthly_config')
      .select('ghi_chu')
      .eq('id', 'system_ai_config')
      .single();

    if (error || !data?.ghi_chu) return null;
    return JSON.parse(data.ghi_chu);
  } catch (e) {
    return null;
  }
}

export async function upsertSharedAiConfig(aiConfig) {
  if (!supabase) return null;
  try {
    const payload = {
      id: 'system_ai_config',
      banner_focus: 'Cấu hình Quản gia AI Google (Dùng chung cả nhà)',
      ghi_chu: JSON.stringify({
        apiKey: (aiConfig.apiKey || '').trim(),
        model: aiConfig.model || 'gemini-3.5-flash-lite',
        baseUrl: (aiConfig.baseUrl || 'https://generativelanguage.googleapis.com/v1beta').trim(),
        updated_at: new Date().toISOString()
      }),
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase
      .from('monthly_config')
      .upsert(payload)
      .select();
    if (error) {
      console.error('Error saving system_ai_config to Supabase:', error);
    }
    return data ? data[0] : null;
  } catch (err) {
    console.error('Error in upsertSharedAiConfig:', err);
    return null;
  }
}

// ==========================================
// 8. SUPABASE REALTIME SUBSCRIPTIONS
// ==========================================

export function subscribeToTransactions(onInsert, onUpdate, onDelete) {
  if (!supabase) return () => {};
  const channel = supabase
    .channel('realtime_transactions_' + Date.now())
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, (payload) => {
      if (onInsert && payload.new) onInsert(payload.new);
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'transactions' }, (payload) => {
      if (onUpdate && payload.new) onUpdate(payload.new);
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'transactions' }, (payload) => {
      if (onDelete && payload.old) onDelete(payload.old);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToMonthlyConfig(onChange) {
  if (!supabase) return () => {};
  const channel = supabase
    .channel('realtime_monthly_config_' + Date.now())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'monthly_config' }, (payload) => {
      if (onChange) onChange(payload);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}



