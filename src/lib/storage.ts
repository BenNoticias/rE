import { UserProfile, SavedSummary, SavedMindmap, QuizResult, SavedSchedule, LeaderboardUser, GradeLevel } from '@/types';

const STORAGE_KEYS = {
  USER_PROFILE: 'estuda_ai_user_profile',
  SUMMARIES: 'estuda_ai_summaries',
  MINDMAPS: 'estuda_ai_mindmaps',
  QUIZZES: 'estuda_ai_quizzes',
  SCHEDULES: 'estuda_ai_schedules',
  LEADERBOARD: 'estuda_ai_leaderboard',
  THEME: 'estuda_ai_theme',
};

const DEFAULT_USER: UserProfile = {
  id: 'user_default_1',
  name: 'Estudante Dedicado',
  email: 'estudante@escola.edu.br',
  grade: '1_em',
  xp: 450,
  streak: 5,
  level: 3,
  useCustomDb: false,
};

const DEFAULT_LEADERBOARD: LeaderboardUser[] = [
  { id: 'u1', name: 'Mariana Silva', grade: '3_em', xp: 2450, level: 12, streak: 14 },
  { id: 'u2', name: 'Lucas Oliveira', grade: '3_em', xp: 1980, level: 10, streak: 9 },
  { id: 'u3', name: 'Beatriz Santos', grade: '2_em', xp: 1620, level: 8, streak: 12 },
  { id: 'u4', name: 'Gabriel Costa', grade: '1_em', xp: 1240, level: 6, streak: 7 },
  { id: 'u5', name: 'Ana Clara Lima', grade: '9_ef', xp: 890, level: 5, streak: 4 },
];

export function getUserProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_USER;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!data) {
      saveUserProfile(DEFAULT_USER);
      return DEFAULT_USER;
    }
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_USER;
  }
}

export function saveUserProfile(profile: UserProfile): UserProfile {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  }
  return profile;
}

export function updateUserXP(xpAmount: number): UserProfile {
  const profile = getUserProfile();
  const newXP = profile.xp + xpAmount;
  const newLevel = Math.floor(newXP / 200) + 1;
  const updated = { ...profile, xp: newXP, level: newLevel };
  saveUserProfile(updated);
  updateLeaderboardCurrentUser(updated);
  return updated;
}

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

export function getLeaderboard(): LeaderboardUser[] {
  if (typeof window === 'undefined') return DEFAULT_LEADERBOARD;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(DEFAULT_LEADERBOARD));
      return DEFAULT_LEADERBOARD;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_LEADERBOARD;
  }
}

function updateLeaderboardCurrentUser(user: UserProfile) {
  if (typeof window === 'undefined') return;
  const currentLeaderboard = getLeaderboard();
  const userEntry: LeaderboardUser = {
    id: user.id,
    name: user.name,
    grade: user.grade,
    xp: user.xp,
    level: user.level,
    streak: user.streak,
    isCurrentUser: true,
  };
  const filtered = currentLeaderboard.filter(u => u.id !== user.id && !u.isCurrentUser);
  const updated = [...filtered, userEntry].sort((a, b) => b.xp - a.xp);
  localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(updated));
}
