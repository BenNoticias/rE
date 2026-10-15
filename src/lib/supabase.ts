import { createClient } from '@supabase/supabase-js';
import { 
  UserProfile, 
  LeaderboardUser, 
  SavedSummary, 
  SavedMindmap, 
  QuizResult, 
  EssayCorrectionResult 
} from '@/types';
import { getUserProfile } from './storage';

export function getSupabaseClient() {
  const profile = typeof window !== 'undefined' ? getUserProfile() : null;
  
  // Prioriza as variáveis de ambiente (.env.local); se não houver, usa o perfil customizado
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || (profile?.useCustomDb ? profile?.supabaseUrl : undefined);
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (profile?.useCustomDb ? profile?.supabaseAnonKey : undefined);
  
  if (supabaseUrl && supabaseAnonKey) {
    try {
      return createClient(supabaseUrl, supabaseAnonKey);
    } catch (err) {
      console.error("Erro ao inicializar cliente Supabase:", err);
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

export async function syncSummaryToSupabase(summary: SavedSummary, userId?: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('summaries').upsert({
      id: summary.id,
      user_id: userId || null,
      title: summary.title,
      subject: summary.subject,
      grade: summary.grade,
      summary_overview: summary.summaryOverview,
      topics: summary.topics,
      study_tips: summary.studyTips,
      created_at: summary.createdAt || new Date().toISOString(),
    });
    if (error) console.warn("Aviso ao sincronizar resumo com Supabase:", error.message);
    return !error;
  } catch (err) {
    console.warn("Falha de rede ao sincronizar resumo:", err);
    return false;
  }
}

export async function syncMindmapToSupabase(mindmap: SavedMindmap, userId?: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('mindmaps').upsert({
      id: mindmap.id,
      user_id: userId || null,
      title: mindmap.title,
      subject: mindmap.subject,
      grade: mindmap.grade,
      nodes: mindmap.nodes,
      edges: mindmap.edges,
      created_at: mindmap.createdAt || new Date().toISOString(),
    });
    if (error) console.warn("Aviso ao sincronizar mapa mental com Supabase:", error.message);
    return !error;
  } catch (err) {
    console.warn("Falha de rede ao sincronizar mapa mental:", err);
    return false;
  }
}

export async function syncQuizToSupabase(quiz: QuizResult, userId?: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('quizzes').upsert({
      id: quiz.id,
      user_id: userId || null,
      title: quiz.title,
      subject: quiz.subject,
      grade: quiz.grade,
      score: quiz.score,
      total_questions: quiz.totalQuestions,
      xp_earned: quiz.xpEarned,
      questions: quiz.questions,
      created_at: quiz.createdAt || new Date().toISOString(),
    });
    if (error) console.warn("Aviso ao sincronizar simulado com Supabase:", error.message);
    return !error;
  } catch (err) {
    console.warn("Falha de rede ao sincronizar simulado:", err);
    return false;
  }
}

export async function syncEssayToSupabase(essay: EssayCorrectionResult, userId?: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('essays').upsert({
      id: essay.id,
      user_id: userId || null,
      title: essay.theme || essay.essayTitle || 'Redação Sem Título',
      exam_model: essay.examModel,
      essay_text: essay.essayText,
      grade_score: essay.finalScore,
      competencies: essay.competencies,
      feedback: essay.generalFeedback,
      created_at: essay.createdAt || new Date().toISOString(),
    });
    if (error) console.warn("Aviso ao sincronizar redação com Supabase:", error.message);
    return !error;
  } catch (err) {
    console.warn("Falha de rede ao sincronizar redação:", err);
    return false;
  }
}

export async function deleteRemoteItem(table: 'summaries' | 'mindmaps' | 'quizzes' | 'essays', id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from(table).delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

