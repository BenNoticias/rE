'use client';

import React from 'react';
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
  BookOpen
} from 'lucide-react';
import { UserProfile, SUBJECTS, SubjectId, GRADE_OPTIONS } from '@/types';

interface DashboardProps {
  profile: UserProfile;
  onNavigate: (tab: string, subject?: SubjectId) => void;
  openOnboarding: () => void;
}

export function Dashboard({ profile, onNavigate, openOnboarding }: DashboardProps) {
  const gradeLabel = GRADE_OPTIONS.find(g => g.id === profile.grade)?.label || '1º ANO EM';
  
  // Calculate level progress (e.g. 25% for next level)
  const xpInCurrentLevel = profile.xp % 200;
  const levelProgress = Math.round((xpInCurrentLevel / 200) * 100);

  const disciplineCards = [
    { id: 'matematica' as SubjectId, name: 'Matemática', count: '12 tópicos', icon: TrendingUp, color: 'text-blue-500' },
    { id: 'fisica' as SubjectId, name: 'Física', count: '8 tópicos', icon: Activity, color: 'text-sky-500' },
    { id: 'quimica' as SubjectId, name: 'Química', count: '9 tópicos', icon: FlaskConical, color: 'text-indigo-500' },
    { id: 'historia' as SubjectId, name: 'História', count: '7 tópicos', icon: Landmark, color: 'text-amber-500' },
    { id: 'biologia' as SubjectId, name: 'Biologia', count: '10 tópicos', icon: Dna, color: 'text-emerald-500' },
  ];

  const recentProgressItems = [
    { title: 'Geometria Plana e Espacial', subject: 'Matemática', type: 'Resumo IA', progress: 60 },
    { title: 'Mecânica e Leis de Newton', subject: 'Física', type: 'Simulado', progress: 45 },
    { title: 'Tabela Periódica e Ligações', subject: 'Química', type: 'Mapa Mental', progress: 30 },
  ];

  return (
    <div className="space-y-8 font-sans pb-12">
      
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
              Olá, {profile.name.split(' ')[0]}!
            </h1>

            <p className="text-sm text-blue-100 max-w-xl leading-relaxed">
              O que você quer dominar hoje? Escolha uma matéria abaixo ou use os geradores de IA para criar resumos, mapas mentais e simulados adaptados.
            </p>
          </div>

          {/* Right Progress Box */}
          <div className="p-5 rounded-2xl bg-[#041a40]/90 backdrop-blur-md border border-blue-400/20 text-white space-y-4 shadow-2xl">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
              SEU PROGRESSO
            </div>

            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-bold">Nível {profile.level}</h2>
              <span className="text-xs font-semibold text-blue-200">{profile.xp} XP</span>
            </div>

            {/* Glowing Blue Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-2 rounded-full bg-blue-950 overflow-hidden">
                <div 
                  className="h-full bg-blue-400 rounded-full shadow-[0_0_10px_#38bdf8] transition-all duration-500"
                  style={{ width: `${levelProgress || 25}%` }}
                />
              </div>
              <div className="text-[11px] text-right text-blue-300 font-medium">
                {levelProgress || 25}% para o Nível {profile.level + 1}
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
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Continue de onde parou Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Continue de onde parou
          </h2>
          <button 
            onClick={() => onNavigate('history')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Ver histórico
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {recentProgressItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate('history')}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                  {item.subject} • {item.type}
                </span>
                <span className="text-xs font-bold text-slate-500">{item.progress}%</span>
              </div>

              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {item.title}
              </h3>

              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
