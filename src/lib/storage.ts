import { 
  UserProfile, 
  SavedSummary, 
  SavedMindmap, 
  QuizResult, 
  SavedSchedule, 
  LeaderboardUser, 
  GradeLevel, 
  APP_VERSION,
  NotificationItem,
  EssayCorrectionResult,
  UnifiedHistoryItem,
  HistoryItemType
} from '@/types';
import { buildUserExportData } from './security';

const STORAGE_KEYS = {
  USER_PROFILE: 'the_educator_user_profile',
  REGISTERED_USERS: 'the_educator_registered_users',
  SUMMARIES: 'the_educator_summaries',
  MINDMAPS: 'the_educator_mindmaps',
  QUIZZES: 'the_educator_quizzes',
  SCHEDULES: 'the_educator_schedules',
  LEADERBOARD: 'the_educator_leaderboard',
  NOTIFICATIONS: 'the_educator_notifications',
  ESSAYS: 'the_educator_essays',
  THEME: 'the_educator_theme',
};

// Legacy keys for seamless migration from Estuda AI
const LEGACY_STORAGE_KEYS = {
  USER_PROFILE: 'estuda_ai_user_profile',
  REGISTERED_USERS: 'estuda_ai_registered_users',
  SUMMARIES: 'estuda_ai_summaries',
  MINDMAPS: 'estuda_ai_mindmaps',
  QUIZZES: 'estuda_ai_quizzes',
  SCHEDULES: 'estuda_ai_schedules',
  LEADERBOARD: 'estuda_ai_leaderboard',
  NOTIFICATIONS: 'estuda_ai_notifications',
  ESSAYS: 'estuda_ai_essays',
};

function getWithLegacyFallback(newKey: string, oldKey: string): string | null {
  if (typeof window === 'undefined') return null;
  const current = localStorage.getItem(newKey);
  if (current) return current;
  const legacy = localStorage.getItem(oldKey);
  if (legacy) {
    localStorage.setItem(newKey, legacy);
    return legacy;
  }
  return null;
}

// Known legacy mock IDs to purge from storage
const LEGACY_MOCK_IDS = new Set(['u1', 'u2', 'u3', 'u4', 'u5']);

const INITIAL_USER: UserProfile = {
  id: 'user_' + Date.now().toString(36),
  username: 'Estudante',
  name: 'Estudante',
  email: 'aluno@escola.edu.br',
  grade: '1_em',
  xp: 0,
  streak: 1,
  level: 1,
  useCustomDb: false,
  createdAt: new Date().toISOString(),
  consent: {
    termsAccepted: true,
    privacyAccepted: true,
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
  },
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_v08_welcome',
    title: 'The Educator (v0.8) Atualizado!',
    message: 'Bem-vindo ao The Educator v0.8! Nova área dedicada de Perfil, aba exclusiva de Salvos, gravação automática no histórico e gerenciamento avançado de estudos.',
    type: 'system',
    read: false,
    createdAt: new Date().toISOString(),
    linkTab: 'dashboard'
  },
  {
    id: 'notif_schedule_today',
    title: 'Lembrete de Estudos Hoje',
    message: 'Seu cronograma recomenda revisão de Matemática e 1 simulado curto.',
    type: 'schedule',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    linkTab: 'schedule'
  },
  {
    id: 'notif_ranking_status',
    title: 'Ofensiva Mantida!',
    message: 'Você completou mais um dia de estudos e manteve sua sequência ativa.',
    type: 'ranking',
    read: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    linkTab: 'leaderboard'
  }
];

/**
 * Retrieves the currently active user profile.
 */
export function getUserProfile(): UserProfile {
  if (typeof window === 'undefined') return INITIAL_USER;
  try {
    const data = getWithLegacyFallback(STORAGE_KEYS.USER_PROFILE, LEGACY_STORAGE_KEYS.USER_PROFILE);
    if (!data) {
      saveUserProfile(INITIAL_USER);
      return INITIAL_USER;
    }
    const parsed: UserProfile = JSON.parse(data);
    if (!parsed.username && parsed.name) {
      parsed.username = parsed.name;
    }
    return parsed;
  } catch (e) {
    return INITIAL_USER;
  }
}

/**
 * Saves and persists the user profile, updating registered users and the leaderboard.
 */
export function saveUserProfile(profile: UserProfile): UserProfile {
  const normalized: UserProfile = {
    ...profile,
    username: profile.username || profile.name || 'Estudante',
    name: profile.username || profile.name || 'Estudante',
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(normalized));
    saveRegisteredUser(normalized);
    updateLeaderboardCurrentUser(normalized);
  }
  return normalized;
}

/**
 * Gets all real registered users from local storage.
 */
export function getRegisteredUsers(): UserProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = getWithLegacyFallback(STORAGE_KEYS.REGISTERED_USERS, LEGACY_STORAGE_KEYS.REGISTERED_USERS);
    if (!data) return [];
    const list: UserProfile[] = JSON.parse(data);
    return list
      .filter(u => u && u.id && !LEGACY_MOCK_IDS.has(u.id))
      .map(u => ({
        ...u,
        username: u.username || u.name || 'Estudante',
        name: u.username || u.name || 'Estudante',
      }));
  } catch {
    return [];
  }
}

/**
 * Saves a registered user into the local database of registered users.
 */
export function saveRegisteredUser(user: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    const users = getRegisteredUsers();
    const normalizedUser = {
      ...user,
      username: user.username || user.name || 'Estudante',
      name: user.username || user.name || 'Estudante',
    };
    
    const existingIndex = users.findIndex(
      u => u.id === normalizedUser.id || (u.email && u.email.toLowerCase() === normalizedUser.email.toLowerCase())
    );
    
    let updated: UserProfile[];
    if (existingIndex >= 0) {
      updated = [...users];
      updated[existingIndex] = { ...updated[existingIndex], ...normalizedUser };
    } else {
      updated = [...users, normalizedUser];
    }
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(updated));
  } catch (e) {
    console.error("Erro ao salvar usuário registrado:", e);
  }
}

/**
 * Revokes consent for the current user (LGPD Art. 18, IX).
 */
export function revokeUserConsent(): UserProfile {
  const profile = getUserProfile();
  const updated: UserProfile = {
    ...profile,
    consentRevoked: true,
  };
  saveUserProfile(updated);
  return updated;
}

/**
 * Permanently deletes the user account and associated personal data (LGPD Art. 18, VI).
 */
export function deleteUserAccount(userId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const users = getRegisteredUsers().filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));

    const leaderboard = getLeaderboard().filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));

    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.SUMMARIES);
    localStorage.removeItem(STORAGE_KEYS.MINDMAPS);
    localStorage.removeItem(STORAGE_KEYS.QUIZZES);
    localStorage.removeItem(STORAGE_KEYS.SCHEDULES);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.ESSAYS);
  } catch (e) {
    console.error("Erro ao excluir conta de usuário:", e);
  }
}

/**
 * Exports complete personal data payload for data portability.
 */
export function exportAllUserData() {
  const profile = getUserProfile();
  const summaries = getSavedSummaries();
  const mindmaps = getSavedMindmaps();
  const quizzes = getSavedQuizzes();
  const schedules = getSavedSchedules();
  return buildUserExportData(profile, summaries, mindmaps, quizzes, schedules);
}

/**
 * Updates user XP and recalculates level.
 */
export function updateUserXP(xpAmount: number): UserProfile {
  const profile = getUserProfile();
  const newXP = Math.max(0, (profile.xp || 0) + xpAmount);
  const newLevel = Math.max(1, Math.floor(newXP / 200) + 1);
  const updated: UserProfile = { ...profile, xp: newXP, level: newLevel };
  saveUserProfile(updated);
  return updated;
}

// --------------------------------------------------------------------------
// SUMMARIES
// --------------------------------------------------------------------------
export function getSavedSummaries(): SavedSummary[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = getWithLegacyFallback(STORAGE_KEYS.SUMMARIES, LEGACY_STORAGE_KEYS.SUMMARIES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveSummary(summary: SavedSummary, markAsSaved: boolean = false): SavedSummary[] {
  const current = getSavedSummaries();
  const itemToSave: SavedSummary = {
    ...summary,
    isSaved: markAsSaved ? true : (summary.isSaved ?? false)
  };
  const updated = [itemToSave, ...current.filter(s => s.id !== summary.id)];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.SUMMARIES, JSON.stringify(updated));
  }
  return updated;
}

export function deleteSummary(id: string): SavedSummary[] {
  const current = getSavedSummaries();
  const updated = current.filter(s => s.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.SUMMARIES, JSON.stringify(updated));
  }
  return updated;
}

// --------------------------------------------------------------------------
// MINDMAPS
// --------------------------------------------------------------------------
export function getSavedMindmaps(): SavedMindmap[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = getWithLegacyFallback(STORAGE_KEYS.MINDMAPS, LEGACY_STORAGE_KEYS.MINDMAPS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveMindmap(mindmap: SavedMindmap, markAsSaved: boolean = false): SavedMindmap[] {
  const current = getSavedMindmaps();
  const itemToSave: SavedMindmap = {
    ...mindmap,
    isSaved: markAsSaved ? true : (mindmap.isSaved ?? false)
  };
  const updated = [itemToSave, ...current.filter(m => m.id !== mindmap.id)];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.MINDMAPS, JSON.stringify(updated));
  }
  return updated;
}

export function deleteMindmap(id: string): SavedMindmap[] {
  const current = getSavedMindmaps();
  const updated = current.filter(m => m.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.MINDMAPS, JSON.stringify(updated));
  }
  return updated;
}

// --------------------------------------------------------------------------
// QUIZZES
// --------------------------------------------------------------------------
export function getSavedQuizzes(): QuizResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = getWithLegacyFallback(STORAGE_KEYS.QUIZZES, LEGACY_STORAGE_KEYS.QUIZZES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveQuizResult(quiz: QuizResult, markAsSaved: boolean = false): QuizResult[] {
  const current = getSavedQuizzes();
  const itemToSave: QuizResult = {
    ...quiz,
    isSaved: markAsSaved ? true : (quiz.isSaved ?? false)
  };
  const updated = [itemToSave, ...current.filter(q => q.id !== quiz.id)];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(updated));
  }
  return updated;
}

export function deleteQuiz(id: string): QuizResult[] {
  const current = getSavedQuizzes();
  const updated = current.filter(q => q.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(updated));
  }
  return updated;
}

// --------------------------------------------------------------------------
// SCHEDULES
// --------------------------------------------------------------------------
export function getSavedSchedules(): SavedSchedule[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = getWithLegacyFallback(STORAGE_KEYS.SCHEDULES, LEGACY_STORAGE_KEYS.SCHEDULES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveSchedule(schedule: SavedSchedule, markAsSaved: boolean = false): SavedSchedule[] {
  const current = getSavedSchedules();
  const itemToSave: SavedSchedule = {
    ...schedule,
    isSaved: markAsSaved ? true : (schedule.isSaved ?? false)
  };
  const updated = [itemToSave, ...current.filter(s => s.id !== schedule.id)];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(updated));
  }
  return updated;
}

export function deleteSchedule(id: string): SavedSchedule[] {
  const current = getSavedSchedules();
  const updated = current.filter(s => s.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(updated));
  }
  return updated;
}

// --------------------------------------------------------------------------
// NOTIFICATIONS SYSTEM (v0.8)
// --------------------------------------------------------------------------
export function getNotifications(): NotificationItem[] {
  if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
  try {
    const data = getWithLegacyFallback(STORAGE_KEYS.NOTIFICATIONS, LEGACY_STORAGE_KEYS.NOTIFICATIONS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveNotifications(items: NotificationItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(items));
  } catch (e) {
    console.error("Erro ao salvar notificações:", e);
  }
}

export function addNotification(
  item: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>
): NotificationItem {
  const current = getNotifications();
  const newItem: NotificationItem = {
    ...item,
    id: 'notif_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 5),
    createdAt: new Date().toISOString(),
    read: false,
  };
  const updated = [newItem, ...current];
  saveNotifications(updated);
  return newItem;
}

export function markNotificationAsRead(id: string): NotificationItem[] {
  const current = getNotifications();
  const updated = current.map(n => n.id === id ? { ...n, read: true } : n);
  saveNotifications(updated);
  return updated;
}

export function markAllNotificationsAsRead(): NotificationItem[] {
  const current = getNotifications();
  const updated = current.map(n => ({ ...n, read: true }));
  saveNotifications(updated);
  return updated;
}

export function clearAllNotifications(): NotificationItem[] {
  saveNotifications([]);
  return [];
}

// --------------------------------------------------------------------------
// ESSAY CORRECTIONS (v0.8)
// --------------------------------------------------------------------------
export function getSavedEssays(): EssayCorrectionResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = getWithLegacyFallback(STORAGE_KEYS.ESSAYS, LEGACY_STORAGE_KEYS.ESSAYS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveEssayCorrection(essay: EssayCorrectionResult, markAsSaved: boolean = false): EssayCorrectionResult[] {
  const current = getSavedEssays();
  const itemToSave: EssayCorrectionResult = {
    ...essay,
    isSaved: markAsSaved ? true : (essay.isSaved ?? false)
  };
  const updated = [itemToSave, ...current.filter(e => e.id !== essay.id)];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.ESSAYS, JSON.stringify(updated));
  }
  return updated;
}

export function deleteEssay(id: string): EssayCorrectionResult[] {
  const current = getSavedEssays();
  const updated = current.filter(e => e.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.ESSAYS, JSON.stringify(updated));
  }
  return updated;
}

// --------------------------------------------------------------------------
// UNIFIED HISTORY & SAVED HELPERS (v0.8)
// --------------------------------------------------------------------------

/**
 * Returns all generated items across modules aggregated into a unified history format,
 * sorted by creation date descending.
 */
export function getAllHistoryItems(): UnifiedHistoryItem[] {
  const summaries = getSavedSummaries().map(s => ({
    id: s.id,
    type: 'summary' as HistoryItemType,
    title: s.title,
    subject: s.subject,
    grade: s.grade,
    createdAt: s.createdAt,
    isSaved: !!s.isSaved,
    data: s,
  }));

  const mindmaps = getSavedMindmaps().map(m => ({
    id: m.id,
    type: 'mindmap' as HistoryItemType,
    title: m.title,
    subject: m.subject,
    grade: m.grade,
    createdAt: m.createdAt,
    isSaved: !!m.isSaved,
    data: m,
  }));

  const quizzes = getSavedQuizzes().map(q => ({
    id: q.id,
    type: 'quiz' as HistoryItemType,
    title: q.title,
    subject: q.subject,
    grade: q.grade,
    score: q.score,
    maxScore: 100,
    createdAt: q.createdAt,
    isSaved: !!q.isSaved,
    data: q,
  }));

  const essays = getSavedEssays().map(e => ({
    id: e.id,
    type: 'essay' as HistoryItemType,
    title: `Redação ${e.examModel.toUpperCase()}: ${e.theme}`,
    subject: 'portugues',
    score: e.finalScore,
    maxScore: e.maxScore,
    createdAt: e.createdAt,
    isSaved: !!e.isSaved,
    data: e,
  }));

  const schedules = getSavedSchedules().map(sc => ({
    id: sc.id,
    type: 'schedule' as HistoryItemType,
    title: sc.title,
    grade: sc.grade,
    createdAt: sc.createdAt,
    isSaved: !!sc.isSaved,
    data: sc,
  }));

  const combined = [...summaries, ...mindmaps, ...quizzes, ...essays, ...schedules];
  combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return combined;
}

/**
 * Returns only explicitly saved/favorited items.
 */
export function getSavedItems(): UnifiedHistoryItem[] {
  return getAllHistoryItems().filter(item => item.isSaved);
}

/**
 * Toggles the saved/favorited status of an item.
 */
export function toggleItemSaved(type: HistoryItemType, id: string): boolean {
  if (typeof window === 'undefined') return false;

  let newStatus = false;
  if (type === 'summary') {
    const items = getSavedSummaries();
    const updated = items.map(i => {
      if (i.id === id) {
        newStatus = !i.isSaved;
        return { ...i, isSaved: newStatus };
      }
      return i;
    });
    localStorage.setItem(STORAGE_KEYS.SUMMARIES, JSON.stringify(updated));
  } else if (type === 'mindmap') {
    const items = getSavedMindmaps();
    const updated = items.map(i => {
      if (i.id === id) {
        newStatus = !i.isSaved;
        return { ...i, isSaved: newStatus };
      }
      return i;
    });
    localStorage.setItem(STORAGE_KEYS.MINDMAPS, JSON.stringify(updated));
  } else if (type === 'quiz') {
    const items = getSavedQuizzes();
    const updated = items.map(i => {
      if (i.id === id) {
        newStatus = !i.isSaved;
        return { ...i, isSaved: newStatus };
      }
      return i;
    });
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(updated));
  } else if (type === 'essay') {
    const items = getSavedEssays();
    const updated = items.map(i => {
      if (i.id === id) {
        newStatus = !i.isSaved;
        return { ...i, isSaved: newStatus };
      }
      return i;
    });
    localStorage.setItem(STORAGE_KEYS.ESSAYS, JSON.stringify(updated));
  } else if (type === 'schedule') {
    const items = getSavedSchedules();
    const updated = items.map(i => {
      if (i.id === id) {
        newStatus = !i.isSaved;
        return { ...i, isSaved: newStatus };
      }
      return i;
    });
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(updated));
  }
  return newStatus;
}

/**
 * Deletes a single history item by its type and ID.
 */
export function deleteHistoryItem(type: HistoryItemType, id: string): void {
  if (type === 'summary') deleteSummary(id);
  else if (type === 'mindmap') deleteMindmap(id);
  else if (type === 'quiz') deleteQuiz(id);
  else if (type === 'essay') deleteEssay(id);
  else if (type === 'schedule') deleteSchedule(id);
}

/**
 * Batch deletes a list of history items.
 */
export function deleteHistoryBatch(items: { type: HistoryItemType; id: string }[]): void {
  items.forEach(item => deleteHistoryItem(item.type, item.id));
}

/**
 * Deletes history items based on timeframe: 'today', 'week', 'month' or 'all'.
 */
export function deleteHistoryByTimeframe(timeframe: 'today' | 'week' | 'month' | 'all'): number {
  const all = getAllHistoryItems();
  const now = Date.now();
  
  let targetItems: UnifiedHistoryItem[] = [];

  if (timeframe === 'all') {
    targetItems = all;
  } else if (timeframe === 'today') {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayMs = startOfToday.getTime();
    targetItems = all.filter(item => new Date(item.createdAt).getTime() >= todayMs);
  } else if (timeframe === 'week') {
    const weekAgoMs = now - 7 * 24 * 60 * 60 * 1000;
    targetItems = all.filter(item => new Date(item.createdAt).getTime() >= weekAgoMs);
  } else if (timeframe === 'month') {
    const monthAgoMs = now - 30 * 24 * 60 * 60 * 1000;
    targetItems = all.filter(item => new Date(item.createdAt).getTime() >= monthAgoMs);
  }

  deleteHistoryBatch(targetItems.map(t => ({ type: t.type, id: t.id })));
  return targetItems.length;
}

// --------------------------------------------------------------------------
// LEADERBOARD (STRICTLY REAL USERS ONLY)
// --------------------------------------------------------------------------
export function getLeaderboard(): LeaderboardUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const currentProfile = getUserProfile();
    const registeredUsers = getRegisteredUsers();

    const userMap = new Map<string, LeaderboardUser>();

    for (const u of registeredUsers) {
      if (u && u.id && !LEGACY_MOCK_IDS.has(u.id)) {
        const username = u.username || u.name || 'Estudante';
        userMap.set(u.id, {
          id: u.id,
          username: username,
          name: username,
          avatarUrl: u.avatarUrl,
          grade: u.grade || '1_em',
          xp: u.xp || 0,
          level: u.level || 1,
          streak: u.streak || 1,
          isCurrentUser: currentProfile ? u.id === currentProfile.id : false,
        });
      }
    }

    if (currentProfile && currentProfile.id && !LEGACY_MOCK_IDS.has(currentProfile.id)) {
      const currentUsername = currentProfile.username || currentProfile.name || 'Estudante';
      userMap.set(currentProfile.id, {
        id: currentProfile.id,
        username: currentUsername,
        name: currentUsername,
        avatarUrl: currentProfile.avatarUrl,
        grade: currentProfile.grade || '1_em',
        xp: currentProfile.xp || 0,
        level: currentProfile.level || 1,
        streak: currentProfile.streak || 1,
        isCurrentUser: true,
      });
    }

    const leaderboardList = Array.from(userMap.values()).sort((a, b) => b.xp - a.xp);
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboardList));

    return leaderboardList;
  } catch (e) {
    console.error("Erro ao obter ranking:", e);
    return [];
  }
}

export function updateLeaderboardCurrentUser(user: UserProfile) {
  if (typeof window === 'undefined') return;
  try {
    const currentLeaderboard = getLeaderboard();
    const username = user.username || user.name || 'Estudante';
    const userEntry: LeaderboardUser = {
      id: user.id,
      username: username,
      name: username,
      avatarUrl: user.avatarUrl,
      grade: user.grade,
      xp: user.xp || 0,
      level: user.level || 1,
      streak: user.streak || 1,
      isCurrentUser: true,
    };

    const filtered = currentLeaderboard
      .filter(u => u.id !== user.id && !LEGACY_MOCK_IDS.has(user.id))
      .map(u => ({ ...u, isCurrentUser: false }));

    const updated = [...filtered, userEntry].sort((a, b) => b.xp - a.xp);
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(updated));
  } catch (e) {
    console.error("Erro ao atualizar usuário no ranking:", e);
  }
}
