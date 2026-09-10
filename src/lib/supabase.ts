import { createClient } from '@supabase/supabase-js';
import { getUserProfile } from './storage';

export function getSupabaseClient() {
  if (typeof window === 'undefined') return null;
  const profile = getUserProfile();
  
  if (profile.useCustomDb && profile.supabaseUrl && profile.supabaseAnonKey) {
    try {
      return createClient(profile.supabaseUrl, profile.supabaseAnonKey);
    } catch (err) {
      console.error("Erro ao inicializar cliente Supabase customizado:", err);
      return null;
    }
  }
  return null;
}
