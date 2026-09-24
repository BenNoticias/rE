'use client';

import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  Calendar, 
  Trophy, 
  History, 
  Home,
  GraduationCap
} from 'lucide-react';
import { APP_VERSION } from '@/types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openSettings: () => void;
  openAuth: () => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'vestibulares', label: 'Vestibulares & Redação', icon: GraduationCap },
    { id: 'summary', label: 'Resumos', icon: BookOpen },
    { id: 'mindmap', label: 'Mapas Mentais', icon: MapPin },
    { id: 'quiz', label: 'Simulados', icon: CheckCircle2 },
    { id: 'schedule', label: 'Cronograma', icon: Calendar },
    { id: 'leaderboard', label: 'Ranking', icon: Trophy },
    { id: 'history', label: 'Histórico', icon: History },
  ];

  return (
    <aside className="w-64 bg-[#0a142f] text-slate-300 flex flex-col justify-between min-h-screen shrink-0 sticky top-0 h-screen z-30 font-sans border-r border-slate-800/60 hidden md:flex">
      
      {/* Top Logo & Menu */}
      <div className="p-6 space-y-8 overflow-y-auto">
        
        {/* Brand Logo */}
        <button 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center space-x-3 text-white focus:outline-none group text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Estuda<span className="text-blue-500">AI</span>
          </span>
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600/90 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Free Access Card & Version */}
      <div className="p-4 space-y-3 shrink-0">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-teal-950/40 border border-emerald-800/40 text-white space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">100% Gratuito</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Acesso ilimitado a simulados, resumos, mapas e correção de redação por IA.
          </p>
        </div>

        {/* Version Tag */}
        <div className="flex items-center justify-between px-2 text-[11px] text-slate-500">
          <span>EstudaAI</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-400 border border-slate-800">
            {APP_VERSION}
          </span>
        </div>
      </div>

    </aside>
  );
}
