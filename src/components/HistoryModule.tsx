'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, 
  BookOpen, 
  MapPin, 
  CheckCircle2, 
  Calendar, 
  GraduationCap, 
  Trash2, 
  ExternalLink, 
  Search,
  Sparkles,
  Award,
  X,
  FileText,
  Clock,
  Check,
  AlertCircle,
  ArrowRight,
  Filter
} from 'lucide-react';
import { 
  SavedSummary, 
  SavedMindmap, 
  QuizResult, 
  SavedSchedule, 
  EssayCorrectionResult,
  SUBJECTS, 
  GRADE_OPTIONS 
} from '@/types';
import { 
  getSavedSummaries, 
  deleteSummary, 
  getSavedMindmaps, 
  deleteMindmap, 
  getSavedQuizzes, 
  deleteQuizResult,
  getSavedSchedules,
  deleteSchedule,
  getSavedEssays,
  deleteEssayCorrection
} from '@/lib/storage';

interface HistoryModuleProps {
  onOpenSummary?: (summary: SavedSummary) => void;
  onOpenMindmap?: (mindmap: SavedMindmap) => void;
}

export type HistoryTabType = 'all' | 'quizzes' | 'summaries' | 'mindmaps' | 'essays' | 'schedules';

export function HistoryModule({ onOpenSummary, onOpenMindmap }: HistoryModuleProps) {
  const [activeTab, setActiveTab] = useState<HistoryTabType>('all');
  const [summaries, setSummaries] = useState<SavedSummary[]>([]);
  const [mindmaps, setMindmaps] = useState<SavedMindmap[]>([]);
  const [quizzes, setQuizzes] = useState<QuizResult[]>([]);
  const [schedules, setSchedules] = useState<SavedSchedule[]>([]);
  const [essays, setEssays] = useState<EssayCorrectionResult[]>([]);
  const [search, setSearch] = useState('');

  // Modals state for viewing item details
  const [selectedEssay, setSelectedEssay] = useState<EssayCorrectionResult | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizResult | null>(null);
  const [selectedSummary, setSelectedSummary] = useState<SavedSummary | null>(null);

  useEffect(() => {
    loadAllHistory();
  }, []);

  const loadAllHistory = () => {
    setSummaries(getSavedSummaries());
    setMindmaps(getSavedMindmaps());
    setQuizzes(getSavedQuizzes());
    setSchedules(getSavedSchedules());
    setEssays(getSavedEssays());
  };

  const handleDeleteSummary = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteSummary(id);
    setSummaries(updated);
    if (selectedSummary?.id === id) setSelectedSummary(null);
  };

  const handleDeleteMindmap = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteMindmap(id);
    setMindmaps(updated);
  };

  const handleDeleteQuiz = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteQuizResult(id);
    setQuizzes(updated);
    if (selectedQuiz?.id === id) setSelectedQuiz(null);
  };

  const handleDeleteSchedule = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteSchedule(id);
    setSchedules(updated);
  };

  const handleDeleteEssay = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteEssayCorrection(id);
    setEssays(updated);
    if (selectedEssay?.id === id) setSelectedEssay(null);
  };

  // Combine all items for the "Todos" (All) tab
  const allHistoryItems = [
    ...summaries.map(s => ({
      id: s.id,
      type: 'summary' as const,
      title: s.title,
      date: s.createdAt,
      subjectName: SUBJECTS.find(sub => sub.id === s.subject)?.name || s.subject,
      badgeLabel: 'Resumo IA',
      data: s
    })),
    ...mindmaps.map(m => ({
      id: m.id,
      type: 'mindmap' as const,
      title: m.title,
      date: m.createdAt,
      subjectName: SUBJECTS.find(sub => sub.id === m.subject)?.name || m.subject,
      badgeLabel: 'Mapa Mental',
      data: m
    })),
    ...quizzes.map(q => ({
      id: q.id,
      type: 'quiz' as const,
      title: q.title,
      date: q.createdAt,
      subjectName: SUBJECTS.find(sub => sub.id === q.subject)?.name || q.subject,
      badgeLabel: `Simulado • ${q.score}%`,
      data: q
    })),
    ...essays.map(e => ({
      id: e.id,
      type: 'essay' as const,
      title: e.essayTitle || `Redação ${e.examModel.toUpperCase()}: ${e.theme}`,
      date: e.createdAt,
      subjectName: `Modelo ${e.examModel.toUpperCase()}`,
      badgeLabel: `Redação • ${e.finalScore}/${e.maxScore}`,
      data: e
    })),
    ...schedules.map(sc => ({
      id: sc.id,
      type: 'schedule' as const,
      title: sc.title,
      date: sc.createdAt,
      subjectName: 'Planejamento',
      badgeLabel: 'Cronograma',
      data: sc
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredAllItems = allHistoryItems.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.subjectName?.toLowerCase().includes(search.toLowerCase()) ||
    item.badgeLabel.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-white mb-2">
              <History className="w-3.5 h-3.5" />
              <span>Biblioteca Pessoal • v0.6</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Histórico Geral de Estudos</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Acesse e revise todos os resumos, mapas mentais, simulados, cronogramas e o texto integral de suas redações corrigidas.
            </p>
          </div>

          <div className="w-full md:w-auto relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar no histórico..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 pl-9 pr-4 py-2 rounded-xl bg-white/10 text-white placeholder-slate-400 text-xs border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>
      </div>

      {/* Primary Tabs Navigation Bar */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'all'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Todos ({allHistoryItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quizzes')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'quizzes'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Simulados ({quizzes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('summaries')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'summaries'
              ? 'bg-brand-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Resumos ({summaries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mindmaps')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'mindmaps'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Mapas Mentais ({mindmaps.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('essays')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'essays'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Redações ({essays.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schedules')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'schedules'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Cronogramas ({schedules.length})</span>
        </button>
      </div>

      {/* Tab: ALL (Todos) */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAllItems.map((item) => {
            return (
              <div 
                key={`${item.type}_${item.id}`}
                onClick={() => {
                  if (item.type === 'essay') setSelectedEssay(item.data as EssayCorrectionResult);
                  else if (item.type === 'quiz') setSelectedQuiz(item.data as QuizResult);
                  else if (item.type === 'summary') {
                    if (onOpenSummary) onOpenSummary(item.data as SavedSummary);
                    else setSelectedSummary(item.data as SavedSummary);
                  }
                  else if (item.type === 'mindmap' && onOpenMindmap) onOpenMindmap(item.data as SavedMindmap);
                }}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md cursor-pointer transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center space-x-1 ${
                    item.type === 'quiz' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                    item.type === 'summary' ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300' :
                    item.type === 'mindmap' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300' :
                    item.type === 'essay' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                    'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  }`}>
                    {item.type === 'quiz' && <CheckCircle2 className="w-3 h-3" />}
                    {item.type === 'summary' && <BookOpen className="w-3 h-3" />}
                    {item.type === 'mindmap' && <MapPin className="w-3 h-3" />}
                    {item.type === 'essay' && <GraduationCap className="w-3 h-3" />}
                    {item.type === 'schedule' && <Calendar className="w-3 h-3" />}
                    <span>{item.badgeLabel}</span>
                  </span>

                  <button
                    onClick={(e) => {
                      if (item.type === 'summary') handleDeleteSummary(item.id, e);
                      else if (item.type === 'mindmap') handleDeleteMindmap(item.id, e);
                      else if (item.type === 'quiz') handleDeleteQuiz(item.id, e);
                      else if (item.type === 'essay') handleDeleteEssay(item.id, e);
                      else if (item.type === 'schedule') handleDeleteSchedule(item.id, e);
                    }}
                    className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors"
                    title="Excluir do histórico"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {item.title}
                </h3>

                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                  <span>{item.subjectName}</span>
                  <span>{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            );
          })}

          {filteredAllItems.length === 0 && (
            <div className="col-span-2 text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs space-y-2">
              <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">Nenhum item encontrado no histórico.</p>
              <p>Gere resumos, simulados, mapas mentais ou redações para popular sua biblioteca!</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: REDAÇÕES (Essays) */}
      {activeTab === 'essays' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {essays
            .filter(e => e.theme.toLowerCase().includes(search.toLowerCase()) || (e.essayTitle && e.essayTitle.toLowerCase().includes(search.toLowerCase())))
            .map((es) => (
              <div 
                key={es.id}
                onClick={() => setSelectedEssay(es)}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md cursor-pointer transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    Redação • {es.examModel.toUpperCase()}
                  </span>

                  <button
                    onClick={(e) => handleDeleteEssay(es.id, e)}
                    className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {es.essayTitle || `Redação ${es.examModel.toUpperCase()}`}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
                    Tema: {es.theme}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 text-xs font-serif text-slate-700 dark:text-slate-300 line-clamp-2">
                  "{es.essayText}"
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">
                    Nota: {es.finalScore} / {es.maxScore} ({es.assessmentLevel})
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(es.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}

          {essays.length === 0 && (
            <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              Nenhuma redação avaliada e salva ainda. Submeta uma nova redação no módulo de Vestibulares!
            </div>
          )}
        </div>
      )}

      {/* Tab: SIMULADOS (Quizzes) */}
      {activeTab === 'quizzes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes
            .filter(q => q.title.toLowerCase().includes(search.toLowerCase()))
            .map((qz) => {
              const subjObj = SUBJECTS.find(s => s.id === qz.subject);
              return (
                <div 
                  key={qz.id}
                  onClick={() => setSelectedQuiz(qz)}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md cursor-pointer transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {subjObj?.name || qz.subject}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                        +{qz.xpEarned} XP
                      </span>
                      <button
                        onClick={(e) => handleDeleteQuiz(qz.id, e)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {qz.title}
                  </h3>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-600 dark:text-slate-300 font-semibold">
                      Acertos: {qz.correctCount}/{qz.totalQuestions} ({qz.score}%)
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

      {/* Tab: RESUMOS (Summaries) */}
      {activeTab === 'summaries' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summaries
            .filter(s => s.title.toLowerCase().includes(search.toLowerCase()))
            .map((sum) => {
              const subjObj = SUBJECTS.find(s => s.id === sum.subject);
              const gradeLabel = GRADE_OPTIONS.find(g => g.id === sum.grade)?.label || '';
              return (
                <div 
                  key={sum.id}
                  onClick={() => {
                    if (onOpenSummary) onOpenSummary(sum);
                    else setSelectedSummary(sum);
                  }}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md cursor-pointer transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      {subjObj?.name || sum.subject} • {gradeLabel}
                    </span>

                    <button
                      onClick={(e) => handleDeleteSummary(sum.id, e)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors"
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

      {/* Tab: MAPAS MENTAIS (Mindmaps) */}
      {activeTab === 'mindmaps' && (
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

      {/* Tab: CRONOGRAMAS (Schedules) */}
      {activeTab === 'schedules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedules.map((sc) => (
            <div 
              key={sc.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Cronograma Semanal
                </span>
                <button
                  onClick={(e) => handleDeleteSchedule(sc.id, e)}
                  className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

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

      {/* MODAL: Full Essay View (Histórico Completo de Redações) */}
      {selectedEssay && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 relative">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-blue-600 text-white">
                    Redação {selectedEssay.examModel.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(selectedEssay.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                  {selectedEssay.essayTitle || 'Redação Sem Título'}
                </h2>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400">Proposta / Tema:</span> {selectedEssay.theme}
                </p>
              </div>

              <button
                onClick={() => setSelectedEssay(null)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Overview Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div>
                <span className="text-xs uppercase font-bold text-blue-200 block">Classificação da Banca</span>
                <h3 className="text-2xl font-black mt-0.5">{selectedEssay.assessmentLevel}</h3>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-emerald-400">
                  {selectedEssay.finalScore} <span className="text-sm font-normal text-slate-300">/ {selectedEssay.maxScore}</span>
                </span>
                <span className="block text-[11px] text-blue-200 uppercase font-semibold">Nota Final Obtida</span>
              </div>
            </div>

            {/* Seção 1: Texto Integral Enviado pelo Estudante */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Texto Integral da Redação Enviada</span>
              </h3>

              <div className="p-6 rounded-2xl bg-amber-50/40 dark:bg-slate-800/80 border border-amber-200/60 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-serif leading-relaxed whitespace-pre-line shadow-inner">
                {selectedEssay.essayText}
              </div>

              <div className="text-[11px] text-slate-400 text-right">
                Total de caracteres: {selectedEssay.essayText.length} • Palavras: {selectedEssay.essayText.trim().split(/\s+/).length}
              </div>
            </div>

            {/* Seção 2: Relatório Detalhado de Correção */}
            <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Relatório Detalhado de Correção por Competência</span>
              </h3>

              {/* Competencies Grid */}
              <div className="space-y-3">
                {selectedEssay.competencies.map((comp, idx) => {
                  const perc = Math.round((comp.score / comp.maxScore) * 100);
                  return (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-900 dark:text-slate-100">{comp.name}</span>
                        <span className="text-blue-600 dark:text-blue-400">{comp.score} / {comp.maxScore} pts</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${perc}%` }} />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                        {comp.feedback}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center space-x-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Pontos Fortes Observados</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-emerald-900 dark:text-emerald-200 list-disc pl-4">
                    {selectedEssay.strengths.map((str, sIdx) => <li key={sIdx}>{str}</li>)}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
                  <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Oportunidades de Melhoria</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-amber-900 dark:text-amber-200 list-disc pl-4">
                    {selectedEssay.improvements.map((imp, iIdx) => <li key={iIdx}>{imp}</li>)}
                  </ul>
                </div>
              </div>

              {/* Suggested Rewrites */}
              {selectedEssay.suggestedRewrites && selectedEssay.suggestedRewrites.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Sugestões Relevantes de Reescrita:
                  </h4>
                  {selectedEssay.suggestedRewrites.map((rw, rIdx) => (
                    <div key={rIdx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                      <div className="text-red-700 dark:text-red-300">
                        <span className="font-bold">Original: </span>"{rw.original}"
                      </div>
                      <div className="text-emerald-700 dark:text-emerald-300 font-medium">
                        <span className="font-bold">Sugestão: </span>"{rw.suggested}"
                      </div>
                      <div className="text-slate-500 italic pt-1 border-t border-slate-200 dark:border-slate-800">
                        Motivo da alteração: {rw.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* General Feedback */}
              <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 space-y-1">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center space-x-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Parecer Pedagógico da Banca:</span>
                </span>
                <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed font-medium">
                  {selectedEssay.generalFeedback}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedEssay(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold shadow"
              >
                Fechar Visualização
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: Quiz Detail View */}
      {selectedQuiz && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  Simulado Concluído • {selectedQuiz.score}% de Acertos
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {selectedQuiz.title}
                </h2>
              </div>
              <button onClick={() => setSelectedQuiz(null)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {selectedQuiz.questions.map((q, idx) => {
                const userAns = selectedQuiz.userAnswers[idx];
                const isCorrect = userAns === q.correctAnswer;
                return (
                  <div key={idx} className={`p-4 rounded-xl border space-y-2 text-xs ${isCorrect ? 'border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/20' : 'border-red-200 bg-red-50/30 dark:bg-red-950/20'}`}>
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-start space-x-2">
                      <span>{idx + 1}.</span>
                      <span>{q.question}</span>
                    </div>
                    <div className="space-y-1 pl-4">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className={`p-2 rounded-lg border ${q.correctAnswer === oIdx ? 'bg-emerald-100 dark:bg-emerald-900 border-emerald-300 font-bold' : userAns === oIdx ? 'bg-red-100 dark:bg-red-900 border-red-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                          {opt} {q.correctAnswer === oIdx && ' (Gabarito)'} {userAns === oIdx && q.correctAnswer !== oIdx && ' (Sua Resposta)'}
                        </div>
                      ))}
                    </div>
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-brand-600 block mb-0.5">Explicação da IA:</span>
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button onClick={() => setSelectedQuiz(null)} className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Summary Detail View */}
      {selectedSummary && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase">
                  Resumo Didático Salvo
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {selectedSummary.title}
                </h2>
              </div>
              <button onClick={() => setSelectedSummary(null)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {selectedSummary.summaryOverview}
            </div>

            <div className="space-y-3">
              {selectedSummary.topics.map((tp, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{tp.title}</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{tp.content}</p>
                  {tp.example && <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-medium">Exemplo: {tp.example}</div>}
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button onClick={() => setSelectedSummary(null)} className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
