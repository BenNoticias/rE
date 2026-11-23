import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, LeaderboardUser, PastExamQuestion, GradeLevel, UserConsent, APP_VERSION } from '@/types';
import { getUserProfile } from './storage';

let cachedClient: SupabaseClient | null = null;
let lastClientKey: string = '';

/**
 * Sanitiza a URL do Supabase removendo barras finais e o sufixo /rest/v1
 * caso tenha sido copiado inadvertidamente do endpoint REST.
 */
export function cleanSupabaseUrl(rawUrl: string): string {
  let url = (rawUrl || '').trim();
  url = url.replace(/\/+$/, '');
  url = url.replace(/\/rest\/v1\/?$/i, '');
  return url;
}

/**
 * Obtém ou instancia o cliente Supabase.
 * Prioridade:
 * 1. Chaves customizadas salvas nas configurações do perfil do usuário
 * 2. Variáveis de ambiente padrão do projeto (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)
 */
export function getSupabaseClient(): SupabaseClient | null {
  let rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Verifica se o usuário configurou credenciais próprias no perfil local
  if (typeof window !== 'undefined') {
    const profile = getUserProfile();
    if (profile?.useCustomDb && profile?.supabaseUrl && profile?.supabaseAnonKey) {
      rawUrl = profile.supabaseUrl;
      anonKey = profile.supabaseAnonKey;
    }
  }

  const url = cleanSupabaseUrl(rawUrl);

  if (!url || !anonKey || url.length === 0 || anonKey.trim().length === 0) {
    return null;
  }

  const currentKey = `${url}_${anonKey.trim()}`;
  if (cachedClient && lastClientKey === currentKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey.trim(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    lastClientKey = currentKey;
    return cachedClient;
  } catch (err) {
    console.error('[Supabase] Erro ao inicializar cliente:', err);
    return null;
  }
}

/**
 * Calcula a URL de redirecionamento para o OAuth (Google) considerando
 * desenvolvimento local e domínio oficial de produção na Vercel.
 */
export function getRedirectUrl(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl && siteUrl.length > 5) {
    const formatted = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`;
    return `${formatted.replace(/\/$/, '')}/auth/callback`;
  }
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
  if (vercelUrl && vercelUrl.length > 3) {
    return `https://${vercelUrl.replace(/\/$/, '')}/auth/callback`;
  }
  return 'http://localhost:3000/auth/callback';
}

/**
 * Inicia o fluxo de autenticação com o Google via Supabase Auth
 */
export async function signInWithGoogle(): Promise<{ error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      error: 'Supabase não configurado. Certifique-se de preencher NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY nas configurações da Vercel.'
    };
  }

  try {
    const redirectTo = getRedirectUrl();
    console.log('[Supabase Auth] Iniciando Google OAuth com redirect:', redirectTo);

    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (data?.url && typeof window !== 'undefined') {
      window.location.assign(data.url);
    }

    return {};
  } catch (err: any) {
    console.error('[Supabase Auth] Erro ao iniciar Google OAuth:', err);
    return { error: err.message || 'Erro inesperado na conexão com o Google.' };
  }
}

export interface AuthResult {
  user?: any;
  session?: any;
  profile?: UserProfile | null;
  error?: string;
  needsEmailConfirmation?: boolean;
}

/**
 * Autentica o usuário com e-mail e senha estritamente via Supabase Auth.
 * Bloqueia e-mails não registrados ou senhas incorretas sem bypass local.
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      error: 'Serviço de autenticação do Supabase não configurado. Verifique as credenciais no .env.'
    };
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { error: 'Por favor, insira um endereço de e-mail válido.' };
  }
  if (!password) {
    return { error: 'Por favor, informe sua senha.' };
  }

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    if (error) {
      console.warn('[Supabase Auth] Falha ao autenticar usuário:', error.message);
      const msg = error.message.toLowerCase();
      if (
        msg.includes('invalid login credentials') ||
        msg.includes('invalid credentials') ||
        error.status === 400
      ) {
        return {
          error: 'E-mail ou senha inválidos. Verifique seus dados ou crie uma conta.'
        };
      }
      if (msg.includes('email not confirmed')) {
        return {
          error: 'E-mail ainda não confirmado. Verifique a caixa de entrada do seu e-mail para ativar sua conta.'
        };
      }
      return {
        error: error.message || 'E-mail ou senha inválidos. Verifique seus dados ou crie uma conta.'
      };
    }

    if (!data.user) {
      return {
        error: 'E-mail ou senha inválidos. Verifique seus dados ou crie uma conta.'
      };
    }

    // Busca o perfil do estudante no Supabase (por ID ou por e-mail como fallback)
    let dbProfile: UserProfile | null = null;
    try {
      let { data: profData } = await client
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!profData && cleanEmail) {
        const { data: profByEmail } = await client
          .from('profiles')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (profByEmail) {
          profData = profByEmail;
          // Atualiza o ID no banco para coincidir com o UID oficial do Supabase Auth
          try {
            await client.from('profiles').update({ id: data.user.id }).eq('id', profByEmail.id);
          } catch (updateErr) {
            console.warn('[Supabase Auth] Aviso ao atualizar id do perfil:', updateErr);
          }
        }
      }

      const userMeta = data.user.user_metadata || {};
      const resolvedUsername = 
        (profData?.username && profData.username.trim() && profData.username !== 'Estudante' && profData.username !== cleanEmail.split('@')[0]) ? profData.username.trim() :
        (userMeta.username && userMeta.username.trim() && userMeta.username !== 'Estudante' && userMeta.username !== cleanEmail.split('@')[0]) ? userMeta.username.trim() :
        (profData?.username || profData?.name || userMeta.username || userMeta.name || userMeta.full_name || cleanEmail.split('@')[0]);

      const resolvedGrade = (profData?.grade as GradeLevel) || (userMeta.grade as GradeLevel) || '1_em';
      const resolvedAvatar = profData?.avatar_url || userMeta.avatar_url || 'avatar_blue';

      if (profData) {
        dbProfile = {
          id: data.user.id,
          username: resolvedUsername,
          name: resolvedUsername,
          email: cleanEmail,
          avatarUrl: resolvedAvatar,
          grade: resolvedGrade,
          xp: Number(profData.xp) || 0,
          level: Number(profData.level) || 1,
          streak: Number(profData.streak) || 1,
          studyGoal: profData.study_goal || userMeta.study_goal || '',
          school: profData.school || userMeta.school || '',
          useCustomDb: false,
          createdAt: profData.created_at || new Date().toISOString(),
          consent: {
            termsAccepted: true,
            privacyAccepted: true,
            timestamp: profData.consent_timestamp || new Date().toISOString(),
            version: profData.consent_version || APP_VERSION,
          },
        };
      } else {
        // Inicializa o registro de perfil no Supabase para garantir persistência contínua
        dbProfile = {
          id: data.user.id,
          username: resolvedUsername,
          name: resolvedUsername,
          email: cleanEmail,
          avatarUrl: resolvedAvatar,
          grade: resolvedGrade,
          xp: 0,
          level: 1,
          streak: 1,
          studyGoal: userMeta.study_goal || '',
          school: userMeta.school || '',
          useCustomDb: false,
          createdAt: new Date().toISOString(),
          consent: {
            termsAccepted: true,
            privacyAccepted: true,
            timestamp: new Date().toISOString(),
            version: APP_VERSION,
          },
        };

        try {
          await client.from('profiles').upsert({
            id: data.user.id,
            username: resolvedUsername,
            name: resolvedUsername,
            email: cleanEmail,
            grade: resolvedGrade,
            xp: 0,
            level: 1,
            streak: 1,
            avatar_url: resolvedAvatar,
            consent_timestamp: new Date().toISOString(),
            consent_version: APP_VERSION,
            consent_revoked: false,
            updated_at: new Date().toISOString(),
          });
        } catch (initErr) {
          console.warn('[Supabase Auth] Aviso ao criar perfil inicial pós-login:', initErr);
        }
      }
    } catch (e) {
      console.warn('[Supabase Auth] Aviso ao carregar perfil do Supabase:', e);
    }

    return {
      user: data.user,
      session: data.session,
      profile: dbProfile,
    };
  } catch (err: any) {
    console.error('[Supabase Auth] Erro inesperado no login:', err);
    return {
      error: 'Erro de comunicação com o servidor de autenticação. Tente novamente mais tarde.'
    };
  }
}

/**
 * Cria uma nova conta no Supabase Auth com dados obrigatórios de estudante e consentimento LGPD.
 */
export async function signUpWithEmail(params: {
  email: string;
  password: string;
  username: string;
  grade: GradeLevel;
  consent: UserConsent;
}): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      error: 'Serviço de autenticação do Supabase não configurado. Verifique as credenciais no .env.'
    };
  }

  const cleanEmail = (params.email || '').trim().toLowerCase();
  const cleanUsername = (params.username || '').trim();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { error: 'Por favor, insira um e-mail válido.' };
  }
  if (!cleanUsername) {
    return { error: 'Por favor, defina um Nome de Usuário para seu perfil.' };
  }
  if (!params.password || params.password.length < 6) {
    return { error: 'A senha deve conter no mínimo 6 caracteres.' };
  }
  if (!params.consent?.termsAccepted || !params.consent?.privacyAccepted) {
    return { error: 'É necessário aceitar os Termos de Uso e a Política de Privacidade (LGPD).' };
  }

  try {
    const { data, error } = await client.auth.signUp({
      email: cleanEmail,
      password: params.password,
      options: {
        data: {
          username: cleanUsername,
          name: cleanUsername,
          grade: params.grade,
        },
      },
    });

    if (error) {
      console.warn('[Supabase Auth] Erro ao cadastrar:', error.message);
      const msg = error.message.toLowerCase();
      if (
        msg.includes('already registered') ||
        msg.includes('user already exists')
      ) {
        return {
          error: 'Este e-mail já está cadastrado. Faça login na sua conta existente.'
        };
      }
      if (msg.includes('at least 6 characters')) {
        return { error: 'A senha deve conter no mínimo 6 caracteres.' };
      }
      return { error: error.message || 'Erro ao registrar usuário. Tente novamente.' };
    }

    if (!data.user) {
      return { error: 'Não foi possível registrar a conta. Tente novamente.' };
    }

    const newProfile: UserProfile = {
      id: data.user.id,
      username: cleanUsername,
      name: cleanUsername,
      email: cleanEmail,
      avatarUrl: 'avatar_blue',
      grade: params.grade,
      xp: 0,
      level: 1,
      streak: 1,
      useCustomDb: false,
      createdAt: new Date().toISOString(),
      consent: params.consent,
    };

    try {
      await client.from('profiles').upsert({
        id: data.user.id,
        username: cleanUsername,
        name: cleanUsername,
        email: cleanEmail,
        grade: params.grade,
        xp: 0,
        level: 1,
        streak: 1,
        avatar_url: 'avatar_blue',
        consent_timestamp: params.consent.timestamp,
        consent_version: params.consent.version,
        consent_revoked: false,
        updated_at: new Date().toISOString(),
      });
    } catch (profErr) {
      console.warn('[Supabase Auth] Aviso ao salvar perfil inicial:', profErr);
    }

    const needsEmailConfirmation = !data.session;

    return {
      user: data.user,
      session: data.session,
      profile: newProfile,
      needsEmailConfirmation,
    };
  } catch (err: any) {
    console.error('[Supabase Auth] Erro inesperado ao cadastrar:', err);
    return {
      error: 'Erro de comunicação com o servidor de autenticação. Tente novamente mais tarde.'
    };
  }
}

/**
 * Encerra a sessão do usuário no Supabase
 */
export async function signOutUser(): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (err) {
      console.warn('[Supabase Auth] Aviso ao fazer logout:', err);
    }
  }
}

/**
 * Sincroniza o perfil do usuário tanto no Supabase Auth (user_metadata) 
 * quanto na tabela pública 'profiles' do banco de dados PostgreSQL.
 */
export async function syncUserProfileToSupabase(profile: UserProfile): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const username = (profile.username || profile.name || '').trim() || 'Estudante';
    
    // Obtém o usuário autenticado atualmente para garantir o UID correto
    let targetId = profile.id;
    let targetEmail = profile.email;

    try {
      const { data: { user } } = await client.auth.getUser();
      if (user) {
        targetId = user.id;
        targetEmail = user.email || targetEmail;
        
        // Atualiza os metadados do usuário diretamente no Supabase Auth
        await client.auth.updateUser({
          data: {
            username: username,
            name: username,
            grade: profile.grade,
            avatar_url: profile.avatarUrl || 'avatar_blue',
            study_goal: profile.studyGoal || '',
            school: profile.school || '',
          }
        });
      }
    } catch (authMetaErr) {
      console.warn('[Supabase Auth] Aviso ao atualizar user_metadata:', authMetaErr);
    }

    // Persiste no banco de dados na tabela 'profiles'
    const { error } = await client.from('profiles').upsert({
      id: targetId,
      username: username,
      name: username,
      email: targetEmail,
      grade: profile.grade,
      xp: profile.xp || 0,
      level: profile.level || 1,
      streak: profile.streak || 1,
      avatar_url: profile.avatarUrl || 'avatar_blue',
      study_goal: profile.studyGoal || '',
      school: profile.school || '',
      consent_timestamp: profile.consent?.timestamp || new Date().toISOString(),
      consent_version: profile.consent?.version || APP_VERSION,
      consent_revoked: profile.consentRevoked || false,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('[Supabase] Aviso ao sincronizar perfil no banco:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Falha de rede ao sincronizar perfil:', err);
    return false;
  }
}

export async function deleteUserProfileFromSupabase(userId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('profiles').delete().eq('id', userId);
    if (error) {
      console.warn('[Supabase] Aviso ao excluir perfil:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Falha ao excluir dados no Supabase:', err);
    return false;
  }
}

export async function fetchSupabaseLeaderboard(): Promise<LeaderboardUser[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('profiles')
      .select('id, username, name, grade, xp, level, streak, consent_revoked, avatar_url')
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
          avatarUrl: item.avatar_url || null,
        };
      });
  } catch (err) {
    console.warn('[Supabase] Falha ao buscar ranking:', err);
    return null;
  }
}

/**
 * Consulta o banco de questões de vestibulares na tabela 'past_exam_questions' do Supabase.
 * Permite filtrar por banca, ano, matéria e assunto.
 */
export async function fetchPastExamQuestionsFromSupabase(filters?: {
  exam?: string;
  year?: string | number;
  subject?: string;
  topic?: string;
}): Promise<PastExamQuestion[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    let query = client.from('past_exam_questions').select('*');

    if (filters?.exam && filters.exam !== 'todos') {
      query = query.ilike('exam', filters.exam);
    }
    if (filters?.year && filters.year.toString() !== 'todos') {
      query = query.eq('year', Number(filters.year));
    }
    if (filters?.subject && filters.subject !== 'todos') {
      query = query.eq('subject', filters.subject);
    }
    if (filters?.topic && filters.topic !== 'todos') {
      query = query.ilike('topic', `%${filters.topic}%`);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return null;
    }

    return data.map((item: any) => ({
      id: String(item.id),
      exam: item.exam,
      year: Number(item.year),
      subject: item.subject,
      topic: item.topic || 'Conceitos Gerais',
      area: item.area || 'Conhecimentos Gerais',
      questionText: item.question_text || item.questionText,
      options: Array.isArray(item.options) ? item.options : JSON.parse(item.options || '[]'),
      correctAnswer: Number(item.correct_answer ?? item.correctAnswer ?? 0),
      explanation: item.explanation || 'Gabarito oficial validado pela banca examinadora.',
    }));
  } catch (err) {
    console.warn('[Supabase] Aviso ao buscar questões de vestibulares do Supabase:', err);
    return null;
  }
}
