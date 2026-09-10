'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, MapPin, CheckCircle2, Calendar, ArrowRight } from 'lucide-react';
import { SUBJECTS, SubjectId } from '@/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, subject?: SubjectId) => void;
}

export function SearchModal({ isOpen, onClose, onNavigate }: SearchModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredSubjects = SUBJECTS.filter(s => 
    s.name.toLowerCase().includes(query.toLowerCase()) || 
    s.description.toLowerCase().includes(query.toLowerCase())
  );

  const quickActions = [
    { title: 'Gerar Resumo em Matemática', tab: 'summary', subject: 'matematica' as SubjectId, icon: BookOpen },
    { title: 'Criar Mapa Mental de História', tab: 'mindmap', subject: 'historia' as SubjectId, icon: MapPin },
    { title: 'Fazer Simulado de Física', tab: 'quiz', subject: 'fisica' as SubjectId, icon: CheckCircle2 },
    { title: 'Ver Cronograma Semanal', tab: 'schedule', icon: Calendar },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            placeholder="Buscar disciplinas, simulados ou ferramentas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 outline-none placeholder-slate-400"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          
          {/* Quick Actions */}
          {!query && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Ações Rápidas Recomendadas
              </span>
              <div className="space-y-1">
                {quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        onNavigate(action.tab, action.subject);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>{action.title}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Subjects Matching Query */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Disciplinas
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredSubjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    onNavigate('summary', s.id);
                    onClose();
                  }}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-left transition-colors"
                >
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                    {s.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block line-clamp-1">
                    {s.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
