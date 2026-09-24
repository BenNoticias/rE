'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Crown, Medal, User, Sparkles, GraduationCap, Star, Users, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { LeaderboardUser, UserProfile, GRADE_OPTIONS } from '@/types';
import { getLeaderboard } from '@/lib/storage';
import { fetchSupabaseLeaderboard } from '@/lib/supabase';

interface LeaderboardModuleProps {
  profile: UserProfile;
}

export function LeaderboardModule({ profile }: LeaderboardModuleProps) {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [filter, setFilter] = useState<'all' | 'same_grade'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. Get local real registered users
    const localUsers = getLeaderboard();
    setUsers(localUsers);

    // 2. If Supabase is active, fetch real remote database users
    if (profile.useCustomDb && profile.supabaseUrl && profile.supabaseAnonKey) {
      setLoading(true);
      fetchSupabaseLeaderboard()
        .then((remoteUsers) => {
          if (remoteUsers && remoteUsers.length > 0) {
            // Merge remote users with local current user
            const mergedMap = new Map<string, LeaderboardUser>();
            remoteUsers.forEach(u => mergedMap.set(u.id, {
              ...u,
              username: u.username || u.name,
              name: u.username || u.name,
              isCurrentUser: u.id === profile.id,
            }));
            // Ensure current user is present
            if (!mergedMap.has(profile.id)) {
              const currentUsername = profile.username || profile.name || 'Estudante';
              mergedMap.set(profile.id, {
                id: profile.id,
                username: currentUsername,
                name: currentUsername,
                grade: profile.grade,
                xp: profile.xp || 0,
                level: profile.level || 1,
                streak: profile.streak || 1,
                isCurrentUser: true,
              });
            }
            const sorted = Array.from(mergedMap.values()).sort((a, b) => b.xp - a.xp);
            setUsers(sorted);
          }
        })
        .catch((err) => {
          console.warn("Could not load remote leaderboard:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [profile]);

  const filteredUsers = users.filter(u => {
    if (filter === 'same_grade') {
      return u.grade === profile.grade;
    }
    return true;
  });

  const top3 = filteredUsers.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>Classificação de Estudantes</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Ranking Oficial de Alunos</h1>
            <p className="text-sm text-amber-100 mt-1 max-w-xl">
              Pontuação de XP e posições em tempo real. Identificação por Nome de Usuário para proteção de privacidade (LGPD).
            </p>
          </div>

          {/* Filter */}
          <div className="flex bg-white/20 backdrop-blur-md p-1 rounded-xl border border-white/20 text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'all' ? 'bg-white text-slate-900 shadow' : 'text-white hover:bg-white/10'
              }`}
            >
              Geral ({users.length})
            </button>
            <button
              onClick={() => setFilter('same_grade')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'same_grade' ? 'bg-white text-slate-900 shadow' : 'text-white hover:bg-white/10'
              }`}
            >
              Minha Série ({users.filter(u => u.grade === profile.grade).length})
            </button>
          </div>
        </div>
      </div>

      {/* Podium Display for Real Users */}
      {filteredUsers.length > 0 && (
        <div>
          {/* 3 or more users podium */}
          {filteredUsers.length >= 3 && (
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 pb-2 items-end">
              
              {/* 2nd Place */}
              {top3[1] && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-center flex flex-col items-center space-y-2 order-1">
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-lg border-2 border-slate-300">
                      {(top3[1].username || top3[1].name || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full bg-slate-400 text-white font-bold text-xs flex items-center justify-center shadow">
                      2º
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[90px] sm:max-w-[120px]">
                      {top3[1].username || top3[1].name}
                    </h4>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      {GRADE_OPTIONS.find(g => g.id === top3[1].grade)?.label || ''}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    {top3[1].xp} XP
                  </span>
                </div>
              )}

              {/* 1st Place (Center) */}
              {top3[0] && (
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-amber-500/10 to-amber-500/20 dark:from-amber-950/40 dark:to-amber-900/20 border-2 border-amber-400 dark:border-amber-600 shadow-xl text-center flex flex-col items-center space-y-2.5 order-2 -translate-y-2">
                  <div className="relative">
                    <Crown className="w-6 h-6 text-amber-500 absolute -top-5 left-1/2 -translate-x-1/2 animate-bounce" />
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center font-black text-amber-950 text-xl border-4 border-amber-300 shadow-lg">
                      {(top3[0].username || top3[0].name || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-2 -right-1 w-7 h-7 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-lg">
                      1º
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 truncate max-w-[100px] sm:max-w-[140px]">
                      {top3[0].username || top3[0].name}
                    </h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">
                      {GRADE_OPTIONS.find(g => g.id === top3[0].grade)?.label || ''}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-white shadow">
                    {top3[0].xp} XP
                  </span>
                </div>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-center flex flex-col items-center space-y-2 order-3">
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-800/20 flex items-center justify-center font-bold text-amber-800 dark:text-amber-300 text-lg border-2 border-amber-700/40">
                      {(top3[2].username || top3[2].name || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full bg-amber-700 text-white font-bold text-xs flex items-center justify-center shadow">
                      3º
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[90px] sm:max-w-[120px]">
                      {top3[2].username || top3[2].name}
                    </h4>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      {GRADE_OPTIONS.find(g => g.id === top3[2].grade)?.label || ''}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    {top3[2].xp} XP
                  </span>
                </div>
              )}

            </div>
          )}

          {/* 1 or 2 users layout */}
          {filteredUsers.length < 3 && (
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-4 pb-2">
              {filteredUsers.map((user, idx) => (
                <div
                  key={user.id}
                  className={`p-6 rounded-2xl text-center flex flex-col items-center space-y-2.5 min-w-[180px] sm:min-w-[220px] transition-all shadow-md ${
                    idx === 0
                      ? 'bg-gradient-to-b from-amber-500/10 to-amber-500/20 dark:from-amber-950/40 dark:to-amber-900/20 border-2 border-amber-400 dark:border-amber-600'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="relative">
                    {idx === 0 && <Crown className="w-5 h-5 text-amber-500 absolute -top-4 left-1/2 -translate-x-1/2" />}
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-extrabold text-lg shadow ${
                      idx === 0
                        ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 border-2 border-amber-300'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300'
                    }`}>
                      {(user.username || user.name || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className={`absolute -bottom-1.5 -right-1 w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center text-white shadow ${
                      idx === 0 ? 'bg-amber-500' : 'bg-slate-400'
                    }`}>
                      {idx + 1}º
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {user.username || user.name}
                    </h4>
                    <span className="text-[11px] text-slate-400 block font-medium">
                      {GRADE_OPTIONS.find(g => g.id === user.grade)?.label || ''}
                    </span>
                  </div>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                    idx === 0 ? 'bg-amber-500 text-white' : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                  }`}>
                    {user.xp} XP
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State when 0 users match */}
      {filteredUsers.length === 0 && (
        <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Nenhum estudante nesta categoria ainda
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Complete simulados com boa pontuação e crie resumos para começar a pontuar XP e assumir a liderança no ranking!
          </p>
        </div>
      )}

      {/* Real Users Table */}
      {filteredUsers.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] flex items-center space-x-2">
              <Users className="w-4 h-4 text-slate-500" />
              <span>Estudantes Autenticados ({filteredUsers.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Nomes de Usuário protegidos por LGPD</span>
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredUsers.map((user, idx) => {
              const isMe = user.isCurrentUser || user.id === profile.id;
              const displayName = user.username || user.name || 'Estudante';
              return (
                <div 
                  key={user.id}
                  className={`px-6 py-4 flex items-center justify-between transition-colors ${
                    isMe ? 'bg-blue-50/70 dark:bg-blue-950/40 font-semibold' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <span className={`w-7 text-center font-bold text-sm ${
                      idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-700' : 'text-slate-500'
                    }`}>
                      #{idx + 1}
                    </span>

                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {displayName}
                        </span>
                        {isMe && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-600 text-white shadow-sm">
                            VOCÊ
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 block font-normal">
                        {GRADE_OPTIONS.find(g => g.id === user.grade)?.label || ''} • Nível {user.level || 1}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-xs text-amber-500 font-bold">
                      <Flame className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{user.streak || 1}d</span>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200">
                      {user.xp} XP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
