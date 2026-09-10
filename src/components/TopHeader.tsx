'use client';

import React from 'react';
import { 
  Search, 
  Flame, 
  Gem, 
  Bell, 
  ChevronDown, 
  Moon, 
  Sun, 
  Settings, 
  User,
  GraduationCap
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { UserProfile, GRADE_OPTIONS } from '@/types';

interface TopHeaderProps {
  profile: UserProfile;
  openSettings: () => void;
  openAuth: () => void;
  openSearchModal: () => void;
  openOnboarding: () => void;
}

export function TopHeader({
  profile,
  openSettings,
  openAuth,
  openSearchModal,
  openOnboarding
}: TopHeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 px-6 py-3.5 flex items-center justify-between transition-colors">
      
      {/* Search Input Bar */}
      <div className="flex-1 max-w-md">
        <button
          onClick={openSearchModal}
          className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/60 text-slate-500 dark:text-slate-400 text-xs transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
        >
          <div className="flex items-center space-x-2.5">
            <Search className="w-4 h-4 text-slate-400" />
            <span>Buscar conteúdos, simulados, mapas...</span>
          </div>
          <kbd className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 text-[10px] font-mono text-slate-500 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-600">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Stats & Profile */}
      <div className="flex items-center space-x-4">
        
        {/* Streak Counter */}
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>{profile.streak} dias</span>
        </div>

        {/* XP Diamond Counter */}
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Gem className="w-4 h-4 text-blue-500" />
          <span>{profile.xp} XP</span>
        </div>

        {/* Notifications Bell */}
        <button 
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          title="Notificações"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-2 right-2" />
        </button>

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Alternar Tema"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Settings button */}
        <button
          onClick={openSettings}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Configurações"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Profile Pill */}
        <button
          onClick={openAuth}
          className="flex items-center space-x-3 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-[#0a142f] text-white font-bold flex items-center justify-center text-xs shadow-sm">
            {profile.name.charAt(0)}
          </div>
          <div className="text-left hidden sm:block">
            <span className="block text-xs font-bold text-slate-900 dark:text-slate-100 -mb-0.5">
              {profile.name.split(' ')[0]}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Nível {profile.level}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
        </button>

      </div>

    </header>
  );
}
