import { createClient } from '@supabase/supabase-js';
import { UserProfile, LeaderboardUser } from '@/types';
import { getUserProfile } from './storage';

export function getSupabaseClient() {
  if (typeof window === 'undefined') return null;
  const profile = getUserProfile();
  
  if (profile && profile.useCustomDb && profile.supabaseUrl && profile.supabaseAnonKey) {
    try {
      return createClient(profile.supabaseUrl, profile.supabaseAnonKey);
    } catch (err) {
      console.error("Erro ao inicializar cliente Supabase customizado:", err);
      return null;
    }
  }
  return null;
}

export async function syncUserProfileToSupabase(profile: UserProfile): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const username = profile.username || profile.name || 'Estudante';
    const { error } = await client.from('profiles').upsert({
      id: profile.id,
      username: username,
      name: username,
      email: profile.email,
      grade: profile.grade,
      xp: profile.xp || 0,
      level: profile.level || 1,
      streak: profile.streak || 1,
      consent_timestamp: profile.consent?.timestamp || new Date().toISOString(),
      consent_version: profile.consent?.version || 'v0.3',
      consent_revoked: profile.consentRevoked || false,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.warn("Aviso ao sincronizar perfil com Supabase:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Falha de rede ao sincronizar com Supabase:", err);
    return false;
  }
}

export async function deleteUserProfileFromSupabase(userId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('profiles').delete().eq('id', userId);
    if (error) {
      console.warn("Aviso ao excluir perfil no Supabase:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Falha de rede ao excluir dados no Supabase:", err);
    return false;
  }
}

export async function fetchSupabaseLeaderboard(): Promise<LeaderboardUser[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('profiles')
      .select('id, username, name, grade, xp, level, streak, consent_revoked')
      .order('xp', { ascending: false });

    if (error || !data) {
      return null;
    }

    return data
      .filter((item: any) => !item.consent_revoked)
      .map((item: any) => {
        const username = item.username || item.name || 'Estudante';
        return {
          id: item.id,
          username: username,
          name: username,
          grade: item.grade || '1_em',
          xp: Number(item.xp) || 0,
          level: Number(item.level) || 1,
          streak: Number(item.streak) || 1,
        };
      });
  } catch (err) {
    console.warn("Falha ao buscar leaderboard do Supabase:", err);
    return null;
  }
}
