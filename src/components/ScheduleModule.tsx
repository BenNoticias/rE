'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  Play, 
  Pause, 
  RotateCcw, 
  Bookmark, 
  Check, 
  BookOpen, 
  Target 
} from 'lucide-react';
import { UserProfile, SavedSchedule, ScheduleDay, SUBJECTS } from '@/types';
import { saveSchedule } from '@/lib/storage';

interface ScheduleModuleProps {
  profile: UserProfile;
  onSavedScheduleAdded?: (schedule: SavedSchedule) => void;
}

export function ScheduleModule({ profile, onSavedScheduleAdded }: ScheduleModuleProps) {
  const [availableHours, setAvailableHours] = useState(3);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['matematica', 'portugues']);
  const [loading, setLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState<SavedSchedule | null>(null);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Pomodoro Timer State
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerLeft, setTimerLeft] = useState(25 * 60);

  const toggleSubject = (sId: string) => {
    if (selectedSubjects.includes(sId)) {
      setSelectedSubjects(selectedSubjects.filter(id => id !== sId));
    } else {
      setSelectedSubjects([...selectedSubjects, sId]);
    }
  };

  const handleGenerateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSaved(false);

    const weakSubjectNames = selectedSubjects
      .map(id => SUBJECTS.find(s => s.id === id)?.name)
      .filter(Boolean);

    try {
      const res = await fetch('/api/gemini/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: profile.grade,
          availableHours,
          weakSubjects: weakSubjectNames,
          userApiKey: profile.customGeminiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Erro ao gerar cronograma.');
      }

      const newSchedule: SavedSchedule = {
        id: `sched_${Date.now()}`,
        title: data.title || `Cronograma Semanal (${availableHours}h/dia)`,
        grade: profile.grade,
        weeklyPlan: data.weeklyPlan || [],
        createdAt: new Date().toISOString(),
      };

      setScheduleData(newSchedule);
      setActiveDayIdx(0);
    } catch (err: any) {
      setError(err.message || 'Falha ao conectar com a IA do Cronograma.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = () => {
    if (!scheduleData) return;
    saveSchedule(scheduleData);
    if (onSavedScheduleAdded) onSavedScheduleAdded(scheduleData);
    setSaved(true);
  };

  // Timer Effect
  React.useEffect(() => {
    if (!timerRunning || timerLeft <= 0) return;
    const interval = setInterval(() => {
      setTimerLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, timerLeft]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Planejador Inteligente</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Cronograma de Estudos com Pomodoro</h1>
            <p className="text-sm text-blue-100 mt-1 max-w-xl">
              Monte uma rotina de estudos equilibrada de acordo com suas horas disponíveis e prioridades escolares.
            </p>
          </div>
        </div>
      </div>

      {/* Generator Form */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <form onSubmit={handleGenerateSchedule} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Hours input */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Horas de estudo disponíveis por dia:
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min={1}
                  max={8}
                  value={availableHours}
                  onChange={(e) => setAvailableHours(Number(e.target.value))}
                  className="w-full accent-brand-600 cursor-pointer"
                />
                <span className="px-3 py-1.5 rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-bold text-xs shrink-0">
                  {availableHours} horas/dia
                </span>
              </div>
            </div>

            {/* Subject Focus Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Disciplinas Prioritárias (suas maiores dúvidas):
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-xl">
                {SUBJECTS.map((s) => {
                  const isChecked = selectedSubjects.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSubject(s.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        isChecked
                          ? 'bg-brand-600 text-white font-bold shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gerando Plano com IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Gerar Cronograma Semanal</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300">
            {error}
          </div>
        )}
      </div>

      {/* Schedule Output Display */}
      {scheduleData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          
          {/* Main Days Planner (2 Cols) */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {scheduleData.title}
                </h3>
                <span className="text-xs text-slate-400">Clique nos dias para visualizar as tarefas</span>
              </div>

              <button
                onClick={handleSaveSchedule}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  saved ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-brand-600 text-white hover:bg-brand-700'
                }`}
              >
                {saved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span>{saved ? 'Salvo' : 'Salvar Plano'}</span>
              </button>
            </div>

            {/* Day Tabs */}
            <div className="flex space-x-1 overflow-x-auto pb-1 no-scrollbar border-b border-slate-100 dark:border-slate-800">
              {scheduleData.weeklyPlan.map((day, dIdx) => (
                <button
                  key={dIdx}
                  onClick={() => setActiveDayIdx(dIdx)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeDayIdx === dIdx
                      ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {day.dayName}
                </button>
              ))}
            </div>

            {/* Active Day Tasks */}
            {scheduleData.weeklyPlan[activeDayIdx] && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                  <Target className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>Metas de {scheduleData.weeklyPlan[activeDayIdx].dayName}:</span>
                </h4>

                {scheduleData.weeklyPlan[activeDayIdx].subjects.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Dia livre para descanso e recuperação.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scheduleData.weeklyPlan[activeDayIdx].subjects.map((item, subIdx) => (
                      <div 
                        key={subIdx}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {item.subject}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                            {item.duration}
                          </span>
                        </div>
                        
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">Foco: </span>
                          {item.topic}
                        </p>

                        <div className="p-2.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200 font-medium">
                          <span className="font-bold text-indigo-700 dark:text-indigo-300">Técnica Recomendada: </span>
                          {item.technique}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Pomodoro Timer Sidebar (1 Col) */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-6">
                <Clock className="w-5 h-5 text-indigo-400 animate-pulse" />
                <h3 className="text-base font-bold text-white">Timer Pomodoro de Foco</h3>
              </div>

              <div className="text-center space-y-4 my-6">
                <div className="text-5xl font-black font-mono tracking-widest text-indigo-400 bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 shadow-inner">
                  {formatTimer(timerLeft)}
                </div>

                <p className="text-xs text-slate-300">
                  25 minutos de foco total sem distrações + 5 minutos de descanso.
                </p>

                <div className="flex justify-center space-x-3 pt-2">
                  <button
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg flex items-center space-x-1.5"
                  >
                    {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{timerRunning ? 'Pausar' : 'Iniciar'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setTimerRunning(false);
                      setTimerLeft(25 * 60);
                    }}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    title="Reiniciar Timer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 text-center">
              Dica: Complete 4 blocos de Pomodoro para acumular +100 XP bônus no dia!
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
