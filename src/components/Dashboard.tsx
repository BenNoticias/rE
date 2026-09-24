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
  Plus,
  GraduationCap
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
        type: 'Plano Semanal',
        tab: 'schedule',
        dateStr: sc.createdAt,
      });
    });

    // Sort by date descending
    items.sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime());
    setRecentActivities(items.slice(0, 5));
  }, []);

  return (
    <div className="space-y-8 font-sans">
      
      {/* Blue Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-[#031533] p-8 text-white shadow-xl border border-blue-900/60">
        
        {/* Subtle Background Glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.25),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          {/* Left Greeting & Grade */}
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
              O que você quer dominar hoje? Escolha uma matéria abaixo, pratique vestibulares anteriores ou use a IA para corrigir sua redação no modelo ENEM.
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          
          {/* Tool 0: Vestibulares & Redação */}
          <div 
            onClick={() => onNavigate('vestibulares')}
            className="p-5 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 border border-blue-700/60 text-white shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-400/30">
                <GraduationCap className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 text-[10px] font-bold uppercase mb-1">
                  NOVO v0.4
                </span>
                <h3 className="text-sm font-bold text-white">
                  Vestibulares & Redação
                </h3>
                <p className="text-xs text-blue-200 mt-1 leading-relaxed">
                  Provas do ENEM/FUVEST e correção de redação por IA.
                </p>
              </div>
            </div>
            <div className="pt-2 text-right">
              <ArrowRight className="w-4 h-4 text-blue-300 inline-block group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

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

      {/* Grid: Matérias + Atividade Recente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Matérias */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Disciplinas do Seu Ano ({gradeLabel})
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SUBJECTS.map((subj) => {
              return (
                <button
                  key={subj.id}
                  onClick={() => onNavigate('summary', subj.id)}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 text-left transition-all hover:-translate-y-0.5 hover:shadow-md group flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <span className="block text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {subj.name}
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {subj.description}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center space-x-1">
                    <span>Estudar</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Atividade Recente */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Sua Atividade Recente
          </h2>

          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            {recentActivities.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs space-y-2">
                <Clock className="w-8 h-8 mx-auto stroke-1 opacity-50" />
                <p>Nenhuma atividade salva recentemente.</p>
                <button
                  onClick={() => onNavigate('summary')}
                  className="text-xs font-bold text-blue-600 hover:underline inline-block pt-1"
                >
                  Gerar seu primeiro resumo
                </button>
              </div>
            ) : (
              recentActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => onNavigate(act.tab)}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        {act.type}
                      </span>
                      <span className="text-[10px] text-slate-400">•</span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {act.subjectName}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {act.title}
                    </h4>
                  </div>
                  {act.score !== undefined && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] shrink-0">
                      {act.score}%
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
