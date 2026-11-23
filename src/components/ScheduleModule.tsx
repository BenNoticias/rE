'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  Clock, 
  Sparkles, 
  Loader2, 
  Play, 
  Pause, 
  RotateCcw, 
  Bookmark, 
  Check, 
  Target,
  Volume2,
  VolumeX,
  Settings,
  Coffee,
  BrainCircuit,
  Sliders,
  Upload,
  Music,
  Square
} from 'lucide-react';
import { UserProfile, SavedSchedule, SUBJECTS } from '@/types';
import { saveSchedule } from '@/lib/storage';
import { SaveTitleModal } from '@/components/SaveTitleModal';

interface ScheduleModuleProps {
  profile: UserProfile;
  onSavedScheduleAdded?: (schedule: SavedSchedule) => void;
}

type SoundOption = 'bell' | 'chime' | 'harp' | 'beep' | 'digital' | 'custom';

const SOUND_LABELS: { id: SoundOption; label: string; desc: string }[] = [
  { id: 'bell', label: 'Sino Tibetano', desc: 'Tom zen profundo e relaxante' },
  { id: 'chime', label: 'Carrilhão Harmônico', desc: 'Três notas ascendentes brilhantes' },
  { id: 'harp', label: 'Acordes de Harpa', desc: 'Arpejo melódico e suave' },
  { id: 'beep', label: 'Bip Eletrônico', desc: 'Alerta digital moderno e focado' },
  { id: 'digital', label: 'Synth Moderno', desc: 'Tom futurista e estimulante' },
  { id: 'custom', label: '📁 Áudio do Dispositivo', desc: 'Arquivo de áudio personalizado (MP3, WAV, OGG)' }
];

export function ScheduleModule({ profile, onSavedScheduleAdded }: ScheduleModuleProps) {
  const [availableHours, setAvailableHours] = useState(3);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['matematica', 'portugues', 'historia']);
  const [loading, setLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState<SavedSchedule | null>(null);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Pomodoro Timer State (Padrão 50 min estudo / 10 min descanso)
  const [studyMinutes, setStudyMinutes] = useState(50);
  const [breakMinutes, setBreakMinutes] = useState(10);
  const [timerMode, setTimerMode] = useState<'study' | 'break'>('study');
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerLeft, setTimerLeft] = useState(50 * 60);
  const [selectedSound, setSelectedSound] = useState<SoundOption>('bell');
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [showPomodoroConfig, setShowPomodoroConfig] = useState(false);

  // Áudio personalizado do dispositivo e controle de reprodução
  const [customAudioData, setCustomAudioData] = useState<string | null>(null);
  const [customAudioName, setCustomAudioName] = useState<string>('');
  const [isPlayingAlarm, setIsPlayingAlarm] = useState(false);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioCtxRef = useRef<AudioContext | null>(null);

  // Parar/Pausar som imediatamente
  const stopAlarmSound = () => {
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch (e) {}
      currentAudioRef.current = null;
    }

    if (currentAudioCtxRef.current) {
      try {
        currentAudioCtxRef.current.close();
      } catch (e) {}
      currentAudioCtxRef.current = null;
    }

    setIsPlayingAlarm(false);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAudio = localStorage.getItem('pomodoro_custom_audio');
      const savedAudioName = localStorage.getItem('pomodoro_custom_audio_name');
      if (savedAudio) {
        setCustomAudioData(savedAudio);
        setCustomAudioName(savedAudioName || 'meu_alarme.mp3');
      }
    }

    return () => {
      stopAlarmSound();
    };
  }, []);

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Audio = event.target?.result as string;
      setCustomAudioData(base64Audio);
      setCustomAudioName(file.name);
      setSelectedSound('custom');
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('pomodoro_custom_audio', base64Audio);
          localStorage.setItem('pomodoro_custom_audio_name', file.name);
        } catch (err) {
          console.warn('Não foi possível persistir áudio no localStorage (limite excedido), ativo apenas na sessão.', err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Sound Function (Suporta sintetizador e áudio do dispositivo)
  const playAlarmSound = (soundType: SoundOption = selectedSound) => {
    if (isSoundMuted) return;

    // Se já estiver tocando, para primeiro antes de reiniciar
    stopAlarmSound();

    // Se a opção selecionada for áudio personalizado do dispositivo
    if (soundType === 'custom') {
      if (customAudioData) {
        try {
          const audio = new Audio(customAudioData);
          currentAudioRef.current = audio;
          setIsPlayingAlarm(true);

          audio.onended = () => {
            setIsPlayingAlarm(false);
            currentAudioRef.current = null;
          };

          audio.onerror = () => {
            setIsPlayingAlarm(false);
            currentAudioRef.current = null;
          };

          audio.play().catch(err => {
            console.warn('Erro ao tocar áudio personalizado, reproduzindo som padrão:', err);
            setIsPlayingAlarm(false);
            playDefaultBell();
          });
          return;
        } catch (e) {
          console.warn('Erro ao carregar áudio:', e);
          setIsPlayingAlarm(false);
        }
      } else {
        alert('Nenhum arquivo de áudio carregado. Clique em "Escolher áudio do dispositivo".');
        audioFileInputRef.current?.click();
        return;
      }
    }

    playDefaultSynth(soundType);
  };

  const playDefaultBell = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      currentAudioCtxRef.current = ctx;
      setIsPlayingAlarm(true);
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(293.66, now + 2.5);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 2.5);

      setTimeout(() => {
        setIsPlayingAlarm(false);
      }, 2500);
    } catch {
      setIsPlayingAlarm(false);
    }
  };

  const playDefaultSynth = (soundType: SoundOption) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      currentAudioCtxRef.current = ctx;
      setIsPlayingAlarm(true);
      const now = ctx.currentTime;
      let durationMs = 2500;

      if (soundType === 'bell') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(293.66, now + 2.5);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2.5);
        durationMs = 2500;
      } else if (soundType === 'chime') {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + idx * 0.18;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.25, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 1.2);
        });
        durationMs = 2000;
      } else if (soundType === 'harp') {
        const notes = [440, 554.37, 659.25, 880, 1108.73];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + idx * 0.12;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.3, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 1.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 1.6);
        });
        durationMs = 2200;
      } else if (soundType === 'beep') {
        [0, 0.22, 0.44].forEach((delay) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + delay;
          osc.type = 'square';
          osc.frequency.setValueAtTime(880, start);
          gain.gain.setValueAtTime(0.2, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.12);
        });
        durationMs = 1000;
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.0);
        durationMs = 1200;
      }

      setTimeout(() => {
        setIsPlayingAlarm(false);
      }, durationMs);
    } catch (e) {
      console.warn('Erro ao reproduzir alarme sonoro:', e);
      setIsPlayingAlarm(false);
    }
  };

  const toggleSubject = (sId: string) => {
    if (selectedSubjects.includes(sId)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter(id => id !== sId));
      }
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

  const confirmSaveSchedule = (customTitle: string) => {
    if (!scheduleData) return;
    const finalSchedule: SavedSchedule = {
      ...scheduleData,
      title: customTitle,
      customTitle: customTitle
    };
    saveSchedule(finalSchedule);
    setScheduleData(finalSchedule);
    if (onSavedScheduleAdded) onSavedScheduleAdded(finalSchedule);
    setSaved(true);
  };

  // Timer Countdown Effect with sound notification
  useEffect(() => {
    if (!timerRunning) return;
    if (timerLeft <= 0) {
      playAlarmSound();
      if (timerMode === 'study') {
        setTimerMode('break');
        setTimerLeft(breakMinutes * 60);
      } else {
        setTimerMode('study');
        setTimerLeft(studyMinutes * 60);
      }
      return;
    }

    const interval = setInterval(() => {
      setTimerLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, timerLeft, timerMode, studyMinutes, breakMinutes, selectedSound, isSoundMuted]);

  const resetTimer = (mode: 'study' | 'break' = timerMode) => {
    setTimerRunning(false);
    setTimerMode(mode);
    setTimerLeft((mode === 'study' ? studyMinutes : breakMinutes) * 60);
  };

  const handleApplyCustomMinutes = (study: number, rest: number) => {
    setStudyMinutes(study);
    setBreakMinutes(rest);
    setTimerRunning(false);
    setTimerLeft((timerMode === 'study' ? study : rest) * 60);
    setShowPomodoroConfig(false);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Planejador Inteligente v0.11</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Cronograma Inteligente & Pomodoro</h1>
            <p className="text-sm text-blue-100 mt-1 max-w-xl">
              Monte sua rotina de estudos exclusiva com técnicas rotativas de alta fixação e cronômetro Pomodoro sonoro personalizável.
            </p>
          </div>
        </div>
      </div>

      {/* Generator Form */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <form onSubmit={handleGenerateSchedule} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Hours input */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Horas disponíveis por dia:
                </label>
                <span className="px-3 py-1 rounded-xl bg-brand-500 text-white font-bold text-xs">
                  {availableHours}h por dia
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                value={availableHours}
                onChange={(e) => setAvailableHours(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                A IA distribuirá as matérias selecionadas ao longo de toda a semana (Segunda a Domingo).
              </p>
            </div>

            {/* Subject Focus Selector (Matérias Estritamente Selecionadas) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Matérias Exclusivas do Cronograma:
                </label>
                <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                  {selectedSubjects.length} selecionada(s)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Apenas as disciplinas marcadas farão parte da sua grade semanal:
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
                {SUBJECTS.map((s) => {
                  const isChecked = selectedSubjects.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSubject(s.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        isChecked
                          ? 'bg-brand-600 text-white font-bold shadow-sm ring-2 ring-brand-500/20'
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
            className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-lg shadow-brand-500/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.008]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gerando Grade Semanal com IA (Segunda a Domingo)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Gerar Cronograma Exclusivo de 7 Dias</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300">
            {error}
          </div>
        )}
      </div>

      {/* Grid: Output Display & Pomodoro Timer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
        
        {/* Main Days Planner (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          {scheduleData ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
                    {scheduleData.customTitle || scheduleData.title}
                  </h3>
                  <span className="text-xs text-slate-400">7 dias completos com rotação ativa de técnicas</span>
                </div>

                <button
                  onClick={() => setIsSaveModalOpen(true)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                    saved 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                      : 'bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-500/20'
                  }`}
                >
                  {saved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  <span>{saved ? 'Salvo em Meus Conteúdos' : 'Salvar Plano'}</span>
                </button>
              </div>

              {/* Day Tabs (Segunda a Domingo) */}
              <div className="flex space-x-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-100 dark:border-slate-800">
                {scheduleData.weeklyPlan.map((day, dIdx) => (
                  <button
                    key={dIdx}
                    onClick={() => setActiveDayIdx(dIdx)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeDayIdx === dIdx
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                        : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    {day.dayName}
                  </button>
                ))}
              </div>

              {/* Active Day Tasks */}
              {scheduleData.weeklyPlan[activeDayIdx] && (
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                    <Target className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <span>Metas de {scheduleData.weeklyPlan[activeDayIdx].dayName}:</span>
                  </h4>

                  {scheduleData.weeklyPlan[activeDayIdx].subjects.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      Dia livre para descanso mental e recuperação.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {scheduleData.weeklyPlan[activeDayIdx].subjects.map((item, subIdx) => (
                        <div 
                          key={subIdx}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-2 hover:border-brand-500/40 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {item.subject}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                              {item.duration}
                            </span>
                          </div>
                          
                          {/* Exibição direta do conteúdo da sessão sem a palavra "foco" */}
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                            {item.topic}
                          </p>

                          <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 font-medium flex items-center space-x-2">
                            <BrainCircuit className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span>
                              <strong className="font-bold text-indigo-700 dark:text-indigo-300">Técnica Recomendada: </strong>
                              {item.technique}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center space-y-3">
              <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">Nenhum cronograma gerado ainda</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Selecione as matérias acima e as horas disponíveis para gerar uma grade personalizada de 7 dias com a IA.
              </p>
            </div>
          )}
        </div>

        {/* Pomodoro Timer Sidebar (1 Col) */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white shadow-2xl flex flex-col justify-between space-y-6 border border-slate-800">
          <div>
            {/* Header com Modo e Configuração */}
            <div className="flex items-center justify-between border-b border-slate-800/90 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-indigo-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white">Timer Pomodoro</h3>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setIsSoundMuted(!isSoundMuted)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title={isSoundMuted ? 'Ativar som do alarme' : 'Silenciar alarme'}
                >
                  {isSoundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPomodoroConfig(!showPomodoroConfig)}
                  className={`p-1.5 rounded-lg transition-colors ${showPomodoroConfig ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                  title="Personalizar tempos e som do alarme"
                >
                  <Sliders className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal de Configuração Integrada do Pomodoro */}
            {showPomodoroConfig && (
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-3 mb-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Settings className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Configurar Pomodoro</span>
                  </span>
                  <button
                    onClick={() => setShowPomodoroConfig(false)}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    Fechar
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">Estudo (min):</label>
                    <input 
                      type="number"
                      min={1}
                      max={120}
                      defaultValue={studyMinutes}
                      id="studyInput"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">Descanso (min):</label>
                    <input 
                      type="number"
                      min={1}
                      max={60}
                      defaultValue={breakMinutes}
                      id="breakInput"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold"
                    />
                  </div>
                </div>

                {/* Seletor de Toque / Som do Alarme */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] text-slate-300 block">Som do Alarme:</label>
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedSound}
                      onChange={(e) => {
                        stopAlarmSound();
                        setSelectedSound(e.target.value as SoundOption);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    >
                      {SOUND_LABELS.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>

                    {isPlayingAlarm ? (
                      <button
                        type="button"
                        onClick={stopAlarmSound}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold shrink-0 flex items-center space-x-1 animate-pulse shadow-md shadow-red-500/30"
                        title="Pausar / Parar som agora"
                      >
                        <Square className="w-3 h-3 fill-white" />
                        <span>Pausar</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => playAlarmSound(selectedSound)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 flex items-center space-x-1"
                        title="Testar toque agora"
                      >
                        <Play className="w-3 h-3" />
                        <span>Testar</span>
                      </button>
                    )}
                  </div>

                  {/* Input oculto e botão para selecionar áudio do dispositivo */}
                  <input
                    type="file"
                    ref={audioFileInputRef}
                    onChange={handleAudioFileUpload}
                    accept="audio/mp3, audio/wav, audio/ogg, audio/mpeg, audio/mp4, audio/x-m4a, audio/*"
                    className="hidden"
                  />

                  <div className="pt-1.5 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        audioFileInputRef.current?.click();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-750 text-indigo-300 hover:text-white border border-dashed border-indigo-500/40 text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{customAudioName ? `Trocar Áudio: ${customAudioName}` : 'Escolher Áudio do Dispositivo (MP3, WAV, OGG, M4A)'}</span>
                    </button>

                    {customAudioName && (
                      <div className="flex items-center justify-between text-[11px] text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                        <span className="truncate max-w-[190px] flex items-center space-x-1.5">
                          <Music className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span className="truncate font-mono">{customAudioName}</span>
                        </span>
                        <span className="text-emerald-400 font-bold text-[10px] shrink-0">Áudio Ativo</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const st = Number((document.getElementById('studyInput') as HTMLInputElement)?.value || 50);
                    const bk = Number((document.getElementById('breakInput') as HTMLInputElement)?.value || 10);
                    handleApplyCustomMinutes(st, bk);
                  }}
                  className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Salvar Preferências
                </button>
              </div>
            )}

            {/* Alternador de Modo: Estudo vs Descanso */}
            <div className="flex rounded-xl bg-slate-800/80 p-1 mb-4 border border-slate-700/60">
              <button
                type="button"
                onClick={() => resetTimer('study')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                  timerMode === 'study' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>Foco ({studyMinutes}m)</span>
              </button>
              <button
                type="button"
                onClick={() => resetTimer('break')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                  timerMode === 'break' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Pausa ({breakMinutes}m)</span>
              </button>
            </div>

            {/* Banner com botão de Pausa / Parar Alarme ativo */}
            {isPlayingAlarm && (
              <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center justify-between animate-pulse mb-3">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span>Alarme tocando...</span>
                </div>
                <button
                  type="button"
                  onClick={stopAlarmSound}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[11px] font-extrabold shadow-md flex items-center space-x-1.5 transition-all"
                  title="Pausar o alarme agora"
                >
                  <Square className="w-3 h-3 fill-white" />
                  <span>Pausar Alarme</span>
                </button>
              </div>
            )}

            {/* Display do Cronômetro */}
            <div className="text-center space-y-4 my-2">
              <div className="relative">
                <div className={`text-5xl font-black font-mono tracking-widest p-6 rounded-2xl border shadow-inner transition-colors ${
                  timerMode === 'study' 
                    ? 'text-indigo-400 bg-slate-850 border-slate-700/80' 
                    : 'text-emerald-400 bg-slate-850 border-emerald-900/60'
                }`}>
                  {formatTimer(timerLeft)}
                </div>
                <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  timerMode === 'study' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/60' : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                }`}>
                  {timerMode === 'study' ? 'Bloco de Foco Ativo' : 'Intervalo de Recuperação'}
                </span>
              </div>

              {/* Botões Iniciar / Pausar / Resetar */}
              <div className="flex justify-center space-x-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setTimerRunning(!timerRunning)}
                  className={`px-7 py-2.5 rounded-xl text-xs font-bold shadow-lg flex items-center space-x-2 transition-transform hover:scale-105 ${
                    timerRunning
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : timerMode === 'study'
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{timerRunning ? 'Pausar' : 'Iniciar'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => resetTimer(timerMode)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Reiniciar Ciclo"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/90 text-[11px] text-slate-400 text-center">
            Padrão 50 min estudo / 10 min pausa com alarme sonoro ativo.
          </div>
        </div>

      </div>

      {/* Modal para Nome Personalizado ao Salvar */}
      <SaveTitleModal
        isOpen={isSaveModalOpen}
        defaultTitle={scheduleData?.customTitle || scheduleData?.title || `Meu Cronograma Semanal (${availableHours}h/dia)`}
        itemTypeLabel="Cronograma de Estudos"
        onSave={confirmSaveSchedule}
        onClose={() => setIsSaveModalOpen(false)}
      />

    </div>
  );
}
