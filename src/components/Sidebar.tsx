'use client';

import React from 'react';
import { 
  BookOpen, 
  MapPin, 
  CheckCircle2, 
  Calendar, 
  Trophy, 
  History, 
  Home,
  GraduationCap,
  PenTool,
  Bookmark,
  User,
  Settings
} from 'lucide-react';
import { APP_VERSION } from '@/types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openSettings?: () => void;
  openAuth?: () => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'redacao', label: 'Redação', icon: PenTool },
    { id: 'vestibulares', label: 'Vestibulares', icon: GraduationCap },
    { id: 'summary', label: 'Resumos', icon: BookOpen },
    { id: 'mindmap', label: 'Mapas Mentais', icon: MapPin },
    { id: 'quiz', label: 'Simulados', icon: CheckCircle2 },
    { id: 'schedule', label: 'Cronograma', icon: Calendar },
    { id: 'leaderboard', label: 'Ranking', icon: Trophy },
    { id: 'saved', label: 'Salvos', icon: Bookmark },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <aside className="w-64 bg-[#0a142f] text-slate-300 flex flex-col justify-between min-h-screen shrink-0 sticky top-0 h-screen z-30 font-sans border-r border-slate-800/60 hidden md:flex">
      
      {/* Top Logo & Menu */}
      <div className="p-6 space-y-7 overflow-y-auto">
        
        {/* Brand Logo */}
        <button 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center space-x-3 text-white focus:outline-none group text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            The <span className="text-blue-500">Educator</span>
          </span>
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Version Bar (Sem banner de 100% gratuito) */}
      <div className="p-4 shrink-0 border-t border-slate-800/50">
        <div className="flex items-center justify-between px-2 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">The Educator</span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-blue-400 border border-slate-700 font-bold">
            {APP_VERSION}
          </span>
        </div>
      </div>

    </aside>
  );
}
