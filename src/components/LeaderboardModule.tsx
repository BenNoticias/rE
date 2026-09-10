'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Crown, Medal, User, Sparkles, GraduationCap, Star } from 'lucide-react';
import { LeaderboardUser, UserProfile, GRADE_OPTIONS } from '@/types';
import { getLeaderboard } from '@/lib/storage';

interface LeaderboardModuleProps {
  profile: UserProfile;
}

export function LeaderboardModule({ profile }: LeaderboardModuleProps) {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [filter, setFilter] = useState<'all' | 'same_grade'>('all');

  useEffect(() => {
    const list = getLeaderboard();
    setUsers(list);
  }, [profile]);

  const filteredUsers = users.filter(u => {
    if (filter === 'same_grade') {
      return u.grade === profile.grade;
    }
    return true;
  });

  const top3 = filteredUsers.slice(0, 3);
  const remaining = filteredUsers.slice(3);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>Competição Saudável</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Ranking de Estudantes (Leaderboard)</h1>
            <p className="text-sm text-amber-100 mt-1 max-w-xl">
              Ganhe XP completando simulados e resumos para subir no pódio semanal dos melhores alunos.
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
              Global
            </button>
            <button
              onClick={() => setFilter('same_grade')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'same_grade' ? 'bg-white text-slate-900 shadow' : 'text-white hover:bg-white/10'
              }`}
            >
              Minha Série
            </button>
          </div>
        </div>
      </div>

      {/* Podium Top 3 */}
      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 pb-2 items-end">
          
          {/* 2nd Place */}
          {top3[1] && (
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-center flex flex-col items-center space-y-2 order-1 sm:order-1">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-lg border-2 border-slate-300">
                  {top3[1].name.charAt(0)}
                </div>
                <div className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full bg-slate-400 text-white font-bold text-xs flex items-center justify-center shadow">
                  2º
                </div>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[90px] sm:max-w-[120px]">
                  {top3[1].name}
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

          {/* 1st Place (Center Big) */}
          {top3[0] && (
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-amber-500/10 to-amber-500/20 dark:from-amber-950/40 dark:to-amber-900/20 border-2 border-amber-400 dark:border-amber-600 shadow-xl text-center flex flex-col items-center space-y-2.5 order-2 sm:order-2 -translate-y-2">
              <div className="relative">
                <Crown className="w-6 h-6 text-amber-500 absolute -top-5 left-1/2 -translate-x-1/2 animate-bounce" />
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center font-black text-amber-950 text-xl border-4 border-amber-300 shadow-lg">
                  {top3[0].name.charAt(0)}
                </div>
                <div className="absolute -bottom-2 -right-1 w-7 h-7 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-lg">
                  1º
                </div>
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 truncate max-w-[100px] sm:max-w-[140px]">
                  {top3[0].name}
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
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-center flex flex-col items-center space-y-2 order-3 sm:order-3">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-800/20 flex items-center justify-center font-bold text-amber-800 dark:text-amber-300 text-lg border-2 border-amber-700/40">
                  {top3[2].name.charAt(0)}
                </div>
                <div className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full bg-amber-700 text-white font-bold text-xs flex items-center justify-center shadow">
                  3º
                </div>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[90px] sm:max-w-[120px]">
                  {top3[2].name}
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

      {/* Remaining Rank Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Classificação Geral
          </h3>
          <span className="text-xs text-slate-400">Atualizado em tempo real</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredUsers.map((user, idx) => {
            const isMe = user.isCurrentUser || user.id === profile.id;
            return (
              <div 
                key={user.id}
                className={`px-6 py-4 flex items-center justify-between transition-colors ${
                  isMe ? 'bg-brand-50/70 dark:bg-brand-950/40 font-semibold' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span className={`w-7 text-center font-bold text-sm ${
                    idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-700' : 'text-slate-500'
                  }`}>
                    #{idx + 1}
                  </span>

                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                    {user.name.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {user.name}
                      </span>
                      {isMe && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-brand-600 text-white">
                          VOCÊ
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 block font-normal">
                      {GRADE_OPTIONS.find(g => g.id === user.grade)?.label || ''} • Nível {user.level}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-xs text-amber-500 font-bold">
                    <Flame className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{user.streak}d</span>
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

    </div>
  );
}
