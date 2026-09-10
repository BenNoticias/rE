'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, 
  BookOpen, 
  MapPin, 
  CheckCircle2, 
  Calendar, 
  Trash2, 
  ExternalLink, 
  Search,
  Sparkles
} from 'lucide-react';
import { SavedSummary, SavedMindmap, QuizResult, SavedSchedule, SUBJECTS, GRADE_OPTIONS } from '@/types';
import { 
  getSavedSummaries, 
  deleteSummary, 
  getSavedMindmaps, 
  deleteMindmap, 
  getSavedQuizzes, 
  getSavedSchedules 
} from '@/lib/storage';

interface HistoryModuleProps {
  onOpenSummary?: (summary: SavedSummary) => void;
  onOpenMindmap?: (mindmap: SavedMindmap) => void;
}

export function HistoryModule({ onOpenSummary, onOpenMindmap }: HistoryModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<'summaries' | 'mindmaps' | 'quizzes' | 'schedules'>('summaries');
  const [summaries, setSummaries] = useState<SavedSummary[]>([]);
  const [mindmaps, setMindmaps] = useState<SavedMindmap[]>([]);
  const [quizzes, setQuizzes] = useState<QuizResult[]>([]);
  const [schedules, setSchedules] = useState<SavedSchedule[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setSummaries(getSavedSummaries());
    setMindmaps(getSavedMindmaps());
    setQuizzes(getSavedQuizzes());
    setSchedules(getSavedSchedules());
  }, []);

  const handleDeleteSummary = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteSummary(id);
    setSummaries(updated);
  };

  const handleDeleteMindmap = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteMindmap(id);
    setMindmaps(updated);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-white mb-2">
              <History className="w-3.5 h-3.5" />
              <span>Biblioteca Pessoal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Histórico de Estudos & Salvos</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Consulte seus resumos criados, mapas mentais, notas dos simulados e cronogramas a qualquer momento.
            </p>
          </div>

          <div className="w-full md:w-auto relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título ou matéria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 pl-9 pr-4 py-2 rounded-xl bg-white/10 text-white placeholder-slate-400 text-xs border border-white/20 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('summaries')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'summaries'
              ? 'bg-brand-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Resumos ({summaries.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('mindmaps')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'mindmaps'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Mapas Mentais ({mindmaps.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('quizzes')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'quizzes'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Simulados ({quizzes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('schedules')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'schedules'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Cronogramas ({schedules.length})</span>
        </button>
      </div>

      {/* Summaries Tab Content */}
      {activeSubTab === 'summaries' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summaries
            .filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.subject.includes(search.toLowerCase()))
            .map((sum) => {
              const subjObj = SUBJECTS.find(s => s.id === sum.subject);
              const gradeLabel = GRADE_OPTIONS.find(g => g.id === sum.grade)?.label || '';
              return (
                <div 
                  key={sum.id}
                  onClick={() => onOpenSummary && onOpenSummary(sum)}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md cursor-pointer transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      {subjObj?.name || sum.subject} • {gradeLabel}
                    </span>

                    <button
                      onClick={(e) => handleDeleteSummary(sum.id, e)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors"
                      title="Excluir do histórico"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {sum.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {sum.summaryOverview}
                  </p>

                  <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                    <span>{new Date(sum.createdAt).toLocaleDateString('pt-BR')}</span>
                    <span className="font-semibold text-brand-600 dark:text-brand-400 flex items-center space-x-1">
                      <span>Ver Resumo</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}

          {summaries.length === 0 && (
            <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              Nenhum resumo salvo ainda. Crie um novo resumo no módulo de Resumos IA!
            </div>
          )}
        </div>
      )}

      {/* Mindmaps Tab Content */}
      {activeSubTab === 'mindmaps' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mindmaps
            .filter(m => m.title.toLowerCase().includes(search.toLowerCase()))
            .map((map) => {
              const subjObj = SUBJECTS.find(s => s.id === map.subject);
              return (
                <div 
                  key={map.id}
                  onClick={() => onOpenMindmap && onOpenMindmap(map)}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md cursor-pointer transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      {subjObj?.name || map.subject}
                    </span>

                    <button
                      onClick={(e) => handleDeleteMindmap(map.id, e)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {map.title}
                  </h3>

                  <div className="text-[11px] text-slate-500">
                    {map.nodes.length} nós e conexões conceituais
                  </div>

                  <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                    <span>{new Date(map.createdAt).toLocaleDateString('pt-BR')}</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400 flex items-center space-x-1">
                      <span>Abrir Mapa</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}

          {mindmaps.length === 0 && (
            <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              Nenhum mapa mental salvo ainda.
            </div>
          )}
        </div>
      )}

      {/* Quizzes Tab Content */}
      {activeSubTab === 'quizzes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((qz) => {
            const subjObj = SUBJECTS.find(s => s.id === qz.subject);
            return (
              <div 
                key={qz.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {subjObj?.name || qz.subject}
                  </span>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                    +{qz.xpEarned} XP
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {qz.title}
                </h3>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">
                    Pontuação: {qz.correctCount}/{qz.totalQuestions} ({qz.score}%)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(qz.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            );
          })}

          {quizzes.length === 0 && (
            <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              Nenhum simulado concluído ainda.
            </div>
          )}
        </div>
      )}

      {/* Schedules Tab Content */}
      {activeSubTab === 'schedules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedules.map((sc) => (
            <div 
              key={sc.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                Cronograma Semanal
              </span>

              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {sc.title}
              </h3>

              <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                <span>Criado em: {new Date(sc.createdAt).toLocaleDateString('pt-BR')}</span>
                <span>{sc.weeklyPlan.length} dias estruturados</span>
              </div>
            </div>
          ))}

          {schedules.length === 0 && (
            <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              Nenhum cronograma salvo ainda.
            </div>
          )}
        </div>
      )}

    </div>
  );
}
