import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-public-key')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper API functions
export async function getTransactions() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('ngay', { ascending: false })
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching transactions:', error);
    return null;
  }
  return data;
}

export async function addTransaction(transaction) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select();
  
  if (error) {
    console.error('Error inserting transaction:', error);
    throw error;
  }
  return data[0];
}

export async function deleteTransaction(id) {
  if (!supabase) return null;
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
  return true;
}

export async function updateTransaction(id, updates) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
  return data[0];
}

export async function getMonthlyConfig(monthId = '2026-10') {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('monthly_config')
    .select('*')
    .eq('id', monthId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching monthly config:', error);
  }
  return data;
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
    console.error('Error fetching family_members from Supabase:', error);
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
    pin_hash: member.pin || '1234',
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

