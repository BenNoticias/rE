'use client';

import React from 'react';
import { 
  Sparkles, 
  Settings, 
  Flame, 
  Trophy, 
  Moon, 
  Sun, 
  GraduationCap, 
  User,
  BookOpen,
  MapPin,
  Calendar,
  History,
  CheckCircle2
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { UserProfile, GRADE_OPTIONS } from '@/types';

interface NavbarProps {
  profile: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openSettings: () => void;
  openOnboarding: () => void;
  openAuth: () => void;
}

export function Navbar({
  profile,
  activeTab,
  setActiveTab,
  openSettings,
  openOnboarding,
  openAuth,
}: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const currentGradeLabel = GRADE_OPTIONS.find(g => g.id === profile.grade)?.label || '1º Ano EM';

  const navItems = [
    { id: 'dashboard', label: 'Painel', icon: BookOpen },
    { id: 'vestibulares', label: 'Vestibulares', icon: GraduationCap },
    { id: 'summary', label: 'Resumos IA', icon: Sparkles },
    { id: 'mindmap', label: 'Mapas Mentais', icon: MapPin },
    { id: 'quiz', label: 'Simulados', icon: CheckCircle2 },
    { id: 'schedule', label: 'Cronograma', icon: Calendar },
    { id: 'leaderboard', label: 'Ranking', icon: Trophy },
    { id: 'history', label: 'Histórico', icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Grade Badge */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center space-x-2 group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-left">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  EstudaAI
                </span>
                <span className="block text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 -mt-1 tracking-wider">
                  Educação Básica & Vestibulares
                </span>
              </div>
            </button>

            {/* Current Grade Badge */}
            <button
              onClick={openOnboarding}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800 hover:bg-brand-100 transition-colors"
              title="Clique para alterar sua série"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{currentGradeLabel}</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Stats & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Streak Counter */}
            <div 
              className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 text-xs font-bold"
              title={`${profile.streak} dias seguidos praticando!`}
            >
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-bounce" />
              <span>{profile.streak}d</span>
            </div>

            {/* Level & XP */}
            <div 
              onClick={() => setActiveTab('leaderboard')}
              className="cursor-pointer flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/50 text-xs font-bold hover:scale-105 transition-transform"
              title={`Nível ${profile.level} - ${profile.xp} XP acumulados`}
            >
              <Trophy className="w-3.5 h-3.5 text-purple-500" />
              <span>Nível {profile.level}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                {profile.xp} XP
              </span>
            </div>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Alternar Tema (Claro / Escuro)"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>

            {/* Settings */}
            <button
              onClick={openSettings}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Configurações e Banco de Dados"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* User Account / Auth */}
            <button
              onClick={openAuth}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
            >
              <User className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span className="hidden sm:inline">{profile.username || profile.name || 'Estudante'}</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 py-2 flex items-center justify-around overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
                  isActive ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
