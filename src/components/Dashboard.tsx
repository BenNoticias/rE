'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Network, 
  CheckSquare, 
  Calendar, 
  TrendingUp, 
  Activity, 
  FlaskConical, 
  Landmark, 
  Dna, 
  ChevronRight,
  ArrowRight,
  Sparkles,
  BookOpen,
  Clock,
  CheckCircle2,
  MapPin,
  Flame,
  Plus
} from 'lucide-react';
import { UserProfile, SUBJECTS, SubjectId, GRADE_OPTIONS, APP_VERSION } from '@/types';
import { getSavedSummaries, getSavedQuizzes, getSavedMindmaps, getSavedSchedules } from '@/lib/storage';

interface DashboardProps {
  profile: UserProfile;
  onNavigate: (tab: string, subject?: SubjectId) => void;
  openOnboarding: () => void;
}

interface RecentActivityItem {
  id: string;
  title: string;
  subjectName: string;
  type: string;
  tab: string;
  dateStr: string;
  score?: number;
}

export function Dashboard({ profile, onNavigate, openOnboarding }: DashboardProps) {
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([]);
  const gradeLabel = GRADE_OPTIONS.find(g => g.id === profile.grade)?.label || '1º ANO EM';
  
  // Calculate level progress (e.g. 25% for next level)
  const currentXP = profile.xp || 0;
  const xpInCurrentLevel = currentXP % 200;
  const levelProgress = Math.round((xpInCurrentLevel / 200) * 100);

  useEffect(() => {
    // Load real recent items from storage
    const summaries = getSavedSummaries();
    const quizzes = getSavedQuizzes();
    const mindmaps = getSavedMindmaps();
    const schedules = getSavedSchedules();

    const items: RecentActivityItem[] = [];

    summaries.forEach(s => {
      const subj = SUBJECTS.find(sub => sub.id === s.subject)?.name || s.subject;
      items.push({
        id: s.id,
        title: s.title,
        subjectName: subj,
        type: 'Resumo IA',
        tab: 'summary',
        dateStr: s.createdAt,
      });
    });

    quizzes.forEach(q => {
      const subj = SUBJECTS.find(sub => sub.id === q.subject)?.name || q.subject;
      items.push({
        id: q.id,
        title: q.title,
        subjectName: subj,
        type: 'Simulado',
        tab: 'quiz',
        dateStr: q.createdAt,
        score: q.score,
      });
    });

    mindmaps.forEach(m => {
      const subj = SUBJECTS.find(sub => sub.id === m.subject)?.name || m.subject;
      items.push({
        id: m.id,
        title: m.title,
        subjectName: subj,
        type: 'Mapa Mental',
        tab: 'mindmap',
        dateStr: m.createdAt,
      });
    });

    schedules.forEach(sc => {
      items.push({
        id: sc.id,
        title: sc.title,
        subjectName: 'Cronograma',
        type: 'Planejamento',
        tab: 'schedule',
        dateStr: sc.createdAt,
      });
    });

    // Sort by most recent
    items.sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime());
    setRecentActivities(items.slice(0, 3));
  }, []);

  const disciplineCards = [
    { id: 'matematica' as SubjectId, name: 'Matemática', count: 'Álgebra e Geometria', icon: TrendingUp, color: 'text-blue-500' },
    { id: 'fisica' as SubjectId, name: 'Física', count: 'Mecânica e Energia', icon: Activity, color: 'text-sky-500' },
    { id: 'quimica' as SubjectId, name: 'Química', count: 'Reações e Tabela', icon: FlaskConical, color: 'text-indigo-500' },
    { id: 'historia' as SubjectId, name: 'História', count: 'Brasil e Geral', icon: Landmark, color: 'text-amber-500' },
    { id: 'biologia' as SubjectId, name: 'Biologia', count: 'Citologia e Ecologia', icon: Dna, color: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-8 font-sans pb-6">
      
      {/* Blue Hero Card Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0052cc] text-white shadow-xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          {/* Left Welcome Area */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Grade Badge */}
            <div className="inline-flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                SÉRIE ATUAL: {gradeLabel.toUpperCase()}
              </span>
              <button 
                onClick={openOnboarding} 
                className="px-2 py-0.5 rounded-full bg-blue-700/60 hover:bg-blue-700 text-[11px] font-semibold text-blue-100 transition-colors"
              >
                Alterar
              </button>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Olá, {profile.username || profile.name || 'Estudante'}!
            </h1>

            <p className="text-sm text-blue-100 max-w-xl leading-relaxed">
              O que você quer dominar hoje? Escolha uma matéria abaixo ou use os geradores de IA para criar resumos, mapas mentais e simulados adaptados à sua série.
            </p>
          </div>

          {/* Right Progress Box */}
          <div className="p-5 rounded-2xl bg-[#041a40]/90 backdrop-blur-md border border-blue-400/20 text-white space-y-4 shadow-2xl">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
              SEU PROGRESSO
            </div>

            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-bold">Nível {profile.level || 1}</h2>
              <span className="text-xs font-semibold text-blue-200">{profile.xp || 0} XP</span>
            </div>

            {/* Glowing Blue Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-2 rounded-full bg-blue-950 overflow-hidden">
                <div 
                  className="h-full bg-blue-400 rounded-full shadow-[0_0_10px_#38bdf8] transition-all duration-500"
                  style={{ width: `${Math.max(5, levelProgress)}%` }}
                />
              </div>
              <div className="text-[11px] text-right text-blue-300 font-medium">
                {levelProgress}% para o Nível {(profile.level || 1) + 1}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Ferramentas Principais Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Ferramentas principais
          </h2>
          <button 
            onClick={() => onNavigate('summary')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Ver todas
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Tool 1: Resumos */}
          <div 
            onClick={() => onNavigate('summary')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Resumos Didáticos
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Gere tópicos conceituais, termos-chave e exemplos práticos.
                </p>
              </div>
            </div>
            <div className="pt-2 text-right">
              <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 inline-block group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Tool 2: Mapas Mentais */}
          <div 
            onClick={() => onNavigate('mindmap')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Mapas Mentais Visuais
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Diagramas gráficos interativos com nós e explicações.
                </p>
              </div>
            </div>
            <div className="pt-2 text-right">
              <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 inline-block group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Tool 3: Simulados */}
          <div 
            onClick={() => onNavigate('quiz')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Simulados Gamificados
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Questões com temporizador, gabarito e pontuação para o ranking.
                </p>
              </div>
            </div>
            <div className="pt-2 text-right">
              <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 inline-block group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Tool 4: Cronograma */}
          <div 
            onClick={() => onNavigate('schedule')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Cronograma & Pomodoro
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Planos semanais personalizados com temporizador de foco.
                </p>
              </div>
            </div>
            <div className="pt-2 text-right">
              <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 inline-block group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </div>

      {/* Disciplinas Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Disciplinas
        </h2>

        <div className="flex items-center space-x-3 overflow-x-auto pb-2 no-scrollbar">
          {disciplineCards.map((disc) => {
            const Icon = disc.icon;
            return (
              <button
                key={disc.id}
                onClick={() => onNavigate('summary', disc.id)}
                className="flex items-center space-x-3 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all shrink-0 group text-left min-w-[170px]"
              >
                <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800 ${disc.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {disc.name}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {disc.count}
                  </span>
                </div>
              </button>
            );
          })}

          <button 
            onClick={() => onNavigate('summary')}
            className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-slate-50 shrink-0"
            title="Ver todas as matérias"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Atividades Recentes / Continue de onde parou Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Continue de onde parou
          </h2>
          <button 
            onClick={() => onNavigate('history')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Ver histórico completo
          </button>
        </div>

        {recentActivities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentActivities.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate(item.tab)}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                    {item.subjectName} • {item.type}
                  </span>
                  {item.score !== undefined && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {item.score}%
                    </span>
                  )}
                </div>

                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                  {item.title}
                </h3>

                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>{new Date(item.dateStr).toLocaleDateString('pt-BR')}</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center space-x-1">
                    <span>Acessar</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Nenhuma atividade recente registrada
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                Gere resumos, construa mapas mentais ou responda simulados para acompanhar o seu progresso aqui.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => onNavigate('summary')}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                Criar Resumo
              </button>
              <button
                onClick={() => onNavigate('quiz')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
              >
                Fazer Simulado
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Minimalist Discreet Version Tag & Institutional Footer */}
      <div className="pt-8 pb-2 border-t border-slate-200/70 dark:border-slate-800/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-500">
        <div className="flex items-center space-x-2">
          <span>EstudaAI • Plataforma de Inteligência Educacional</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Versão da Plataforma</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            {APP_VERSION}
          </span>
        </div>
      </div>

    </div>
  );
}
