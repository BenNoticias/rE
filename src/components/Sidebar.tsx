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
  ArrowRight,
  Home
} from 'lucide-react';
import { UserProfile } from '@/types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openSettings: () => void;
  openAuth: () => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
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
      <div className="p-6 space-y-8">
        
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

      {/* Bottom Premium Card */}
      <div className="p-5 m-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-white space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Plano Premium
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          Acesse recursos exclusivos e acelere seus estudos.
        </p>
        <button className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1.5 pt-1 group">
          <span>Ver Recursos</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </aside>
  );
}
