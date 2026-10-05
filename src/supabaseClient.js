import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL);
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY);

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
  return data;
}

export async function addTransaction(transaction) {
  if (!supabase) return null;

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
    ghi_chu: transaction.ghi_chu || ''
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

  const { data, error } = await supabase
    .from('monthly_config')
    .upsert(payload)
    .select();
  
  if (error) {
    if (!isSchemaMissing(error)) {
      console.error('Error upserting monthly config:', error);
    }
    throw error;
  }
  return data[0];
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
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (error) {
    if (!isSchemaMissing(error)) {
      console.error('Error fetching savings_goals from Supabase:', error);
    }
    return null;
  }
  return data;
}

export async function upsertSavingsGoal(goal) {
  if (!supabase) return null;
  const payload = {
    id: goal.id,
    title: goal.title,
    target: Number(goal.target) || 0,
    current: Number(goal.current) || 0,
    icon: goal.icon || 'ShieldCheck',
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
  return data[0];
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


