import { UserProfile, SavedSummary, SavedMindmap, QuizResult, SavedSchedule, LeaderboardUser, GradeLevel, APP_VERSION } from '@/types';
import { buildUserExportData } from './security';

const STORAGE_KEYS = {
  USER_PROFILE: 'estuda_ai_user_profile',
  REGISTERED_USERS: 'estuda_ai_registered_users',
  SUMMARIES: 'estuda_ai_summaries',
  MINDMAPS: 'estuda_ai_mindmaps',
  QUIZZES: 'estuda_ai_quizzes',
  SCHEDULES: 'estuda_ai_schedules',
  LEADERBOARD: 'estuda_ai_leaderboard',
  THEME: 'estuda_ai_theme',
};

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

/**
 * Retrieves the currently active user profile.
 */
export function getUserProfile(): UserProfile {
  if (typeof window === 'undefined') return INITIAL_USER;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!data) {
      saveUserProfile(INITIAL_USER);
      return INITIAL_USER;
    }
    const parsed: UserProfile = JSON.parse(data);
    // Ensure username field is normalized
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
    const data = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
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
 * Permanently deletes the user account and associated personal data (LGPD Art. 18, VI - Direito ao Esquecimento).
 */
export function deleteUserAccount(userId: string): void {
  if (typeof window === 'undefined') return;
  try {
    // 1. Remove from registered users list
    const users = getRegisteredUsers().filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));

    // 2. Remove from leaderboard
    const leaderboard = getLeaderboard().filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));

    // 3. Clear active profile and local study data
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.SUMMARIES);
    localStorage.removeItem(STORAGE_KEYS.MINDMAPS);
    localStorage.removeItem(STORAGE_KEYS.QUIZZES);
    localStorage.removeItem(STORAGE_KEYS.SCHEDULES);
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
    const data = localStorage.getItem(STORAGE_KEYS.SUMMARIES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveSummary(summary: SavedSummary): SavedSummary[] {
  const current = getSavedSummaries();
  const updated = [summary, ...current.filter(s => s.id !== summary.id)];
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
    const data = localStorage.getItem(STORAGE_KEYS.MINDMAPS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveMindmap(mindmap: SavedMindmap): SavedMindmap[] {
  const current = getSavedMindmaps();
  const updated = [mindmap, ...current.filter(m => m.id !== mindmap.id)];
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
    const data = localStorage.getItem(STORAGE_KEYS.QUIZZES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveQuizResult(quiz: QuizResult): QuizResult[] {
  const current = getSavedQuizzes();
  const updated = [quiz, ...current.filter(q => q.id !== quiz.id)];
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
    const data = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveSchedule(schedule: SavedSchedule): SavedSchedule[] {
  const current = getSavedSchedules();
  const updated = [schedule, ...current.filter(s => s.id !== schedule.id)];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(updated));
  }
  return updated;
}

// --------------------------------------------------------------------------
// LEADERBOARD (STRICTLY REAL USERS ONLY)
// --------------------------------------------------------------------------

/**
 * Returns strictly real authenticated/registered users for the leaderboard,
 * sorted by XP descending. No mock/dummy data.
 */
export function getLeaderboard(): LeaderboardUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const currentProfile = getUserProfile();
    const registeredUsers = getRegisteredUsers();

    const userMap = new Map<string, LeaderboardUser>();

    // Add registered users
    for (const u of registeredUsers) {
      if (u && u.id && !LEGACY_MOCK_IDS.has(u.id)) {
        const username = u.username || u.name || 'Estudante';
        userMap.set(u.id, {
          id: u.id,
          username: username,
          name: username,
          grade: u.grade || '1_em',
          xp: u.xp || 0,
          level: u.level || 1,
          streak: u.streak || 1,
          isCurrentUser: currentProfile ? u.id === currentProfile.id : false,
        });
      }
    }

    // Ensure current active profile is included
    if (currentProfile && currentProfile.id && !LEGACY_MOCK_IDS.has(currentProfile.id)) {
      const currentUsername = currentProfile.username || currentProfile.name || 'Estudante';
      userMap.set(currentProfile.id, {
        id: currentProfile.id,
        username: currentUsername,
        name: currentUsername,
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

/**
 * Updates the current user's entry in the leaderboard and persists real user data.
 */
export function updateLeaderboardCurrentUser(user: UserProfile) {
  if (typeof window === 'undefined') return;
  try {
    const currentLeaderboard = getLeaderboard();
    const username = user.username || user.name || 'Estudante';
    const userEntry: LeaderboardUser = {
      id: user.id,
      username: username,
      name: username,
      grade: user.grade,
      xp: user.xp || 0,
      level: user.level || 1,
      streak: user.streak || 1,
      isCurrentUser: true,
    };

    const filtered = currentLeaderboard
      .filter(u => u.id !== user.id && !LEGACY_MOCK_IDS.has(u.id))
      .map(u => ({ ...u, isCurrentUser: false }));

    const updated = [...filtered, userEntry].sort((a, b) => b.xp - a.xp);
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(updated));
  } catch (e) {
    console.error("Erro ao atualizar usuário no ranking:", e);
  }
}
