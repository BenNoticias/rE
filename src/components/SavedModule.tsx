'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  BookOpen, 
  Network, 
  CheckCircle2, 
  Award, 
  Calendar, 
  Search, 
  Clock, 
  ExternalLink,
  Trash2,
  Sparkles
} from 'lucide-react';
import { UnifiedHistoryItem, SUBJECTS, GRADE_OPTIONS } from '@/types';
import { getSavedItems, toggleItemSaved } from '@/lib/storage';
import { HistoryViewerModal } from './HistoryViewerModal';

interface SavedModuleProps {
  onNavigate?: (tab: string, subject?: any) => void;
}

export function SavedModule({ onNavigate }: SavedModuleProps) {
  const [savedItems, setSavedItems] = useState<UnifiedHistoryItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [viewingItem, setViewingItem] = useState<UnifiedHistoryItem | null>(null);

  const loadItems = () => {
    setSavedItems(getSavedItems());
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleToggleSaved = (item: UnifiedHistoryItem) => {
    toggleItemSaved(item.type, item.id);
    loadItems();
    if (viewingItem && viewingItem.id === item.id) {
      setViewingItem(prev => prev ? { ...prev, isSaved: !prev.isSaved } : null);
    }
  };

  const filteredItems = savedItems.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.subject && item.subject.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white mb-2">
              <Bookmark className="w-3.5 h-3.5 fill-white" />
              <span>Coleção Pessoal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Meus Conteúdos Salvos</h1>
            <p className="text-sm text-amber-100 mt-1 max-w-xl">
              Acesse rapidamente os resumos, mapas mentais, simulados e redações que você favoritou para estudar mais tarde.
            </p>
          </div>

          <div className="w-full md:w-auto relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-white/60" />
            <input
              type="text"
              placeholder="Buscar nos salvos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 pl-9 pr-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/25 focus:bg-white/30 text-white placeholder-white/70 text-xs border border-white/30 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'Todos', icon: Bookmark, count: savedItems.length },
          { id: 'summary', label: 'Resumos', icon: BookOpen, count: savedItems.filter(i => i.type === 'summary').length },
          { id: 'mindmap', label: 'Mapas Mentais', icon: Network, count: savedItems.filter(i => i.type === 'mindmap').length },
          { id: 'quiz', label: 'Simulados', icon: CheckCircle2, count: savedItems.filter(i => i.type === 'quiz').length },
          { id: 'essay', label: 'Redações', icon: Award, count: savedItems.filter(i => i.type === 'essay').length },
          { id: 'schedule', label: 'Cronogramas', icon: Calendar, count: savedItems.filter(i => i.type === 'schedule').length },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = filterType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label} ({tab.count})</span>
            </button>
          );
        })}
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 mx-auto flex items-center justify-center">
            <Bookmark className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Nenhum conteúdo salvo nesta categoria
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Ao gerar resumos, mapas mentais, simulados ou redações, clique no ícone de salvar para adicioná-los à sua biblioteca favorita.
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explorar e Estudar Agora</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => {
            const subjObj = SUBJECTS.find(s => s.id === item.subject);
            const gradeObj = GRADE_OPTIONS.find(g => g.id === item.grade);

            return (
              <div
                key={`${item.type}_${item.id}`}
                onClick={() => setViewingItem(item)}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/60 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                      {item.type === 'summary' && 'Resumo'}
                      {item.type === 'mindmap' && 'Mapa Mental'}
                      {item.type === 'quiz' && 'Simulado'}
                      {item.type === 'essay' && 'Redação'}
                      {item.type === 'schedule' && 'Cronograma'}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSaved(item);
                      }}
                      className="p-1 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors"
                      title="Remover dos Salvos"
                    >
                      <Bookmark className="w-4 h-4 fill-amber-500" />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  {/* Subject or details */}
                  <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{subjObj?.name || item.subject || 'Geral'}</span>
                    {gradeObj && (
                      <>
                        <span>•</span>
                        <span>{gradeObj.label}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Bottom Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>

                  {item.score !== undefined && (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {item.score}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Full Details Modal */}
      <HistoryViewerModal
        item={viewingItem}
        onClose={() => setViewingItem(null)}
        onToggleSaved={handleToggleSaved}
      />

    </div>
  );
}
