'use client';

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Search, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  Sparkles, 
  BarChart3, 
  BookOpen, 
  Database,
  Filter,
  Check,
  X,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { 
  UserProfile, 
  PastExamQuestion, 
  SUBJECTS, 
  SubjectId 
} from '@/types';
import { 
  updateUserXP, 
  addNotification 
} from '@/lib/storage';
import { 
  OFFICIAL_VESTIBULARES_QUESTIONS, 
  VESTIBULARES_BANCAS, 
  VESTIBULARES_YEARS 
} from '@/lib/vestibulares-data';
import { fetchPastExamQuestionsFromSupabase } from '@/lib/supabase';

interface VestibularesModuleProps {
  profile: UserProfile;
  onProfileUpdated?: (updated: UserProfile) => void;
}

export function VestibularesModule({ profile, onProfileUpdated }: VestibularesModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<'banco' | 'simulado' | 'estatisticas'>('banco');

  // Filters State: Banca, Ano, Matéria, Assunto
  const [selectedExam, setSelectedExam] = useState<string>('todos');
  const [selectedYear, setSelectedYear] = useState<string>('todos');
  const [selectedSubject, setSelectedSubject] = useState<string>('todos');
  const [selectedTopic, setSelectedTopic] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Questions Database & Active State
  const [questions, setQuestions] = useState<PastExamQuestion[]>(OFFICIAL_VESTIBULARES_QUESTIONS);
  const [isFromSupabase, setIsFromSupabase] = useState<boolean>(false);
  const [expandedExplanation, setExpandedExplanation] = useState<string | null>(null);
  const [userSelectedAnswers, setUserSelectedAnswers] = useState<Record<string, number>>({});

  // Timed Simulation State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simAnswers, setSimAnswers] = useState<Record<string, number>>({});
  const [simTimeSeconds, setSimTimeSeconds] = useState<number>(600);
  const [isSimFinished, setIsSimFinished] = useState<boolean>(false);
  const [simScore, setSimScore] = useState<{ correct: number; total: number; xp: number } | null>(null);

  // Load questions from Supabase if available
  useEffect(() => {
    async function loadData() {
      const remoteQuestions = await fetchPastExamQuestionsFromSupabase({
        exam: selectedExam !== 'todos' ? selectedExam : undefined,
        year: selectedYear !== 'todos' ? selectedYear : undefined,
        subject: selectedSubject !== 'todos' ? selectedSubject : undefined,
        topic: selectedTopic !== 'todos' ? selectedTopic : undefined,
      });

      if (remoteQuestions && remoteQuestions.length > 0) {
        setQuestions(remoteQuestions);
        setIsFromSupabase(true);
      } else {
        setQuestions(OFFICIAL_VESTIBULARES_QUESTIONS);
        setIsFromSupabase(false);
      }
    }
    loadData();
  }, [selectedExam, selectedYear, selectedSubject, selectedTopic]);

  // Simulation timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSimulating && !isSimFinished && simTimeSeconds > 0) {
      timer = setInterval(() => setSimTimeSeconds(prev => prev - 1), 1000);
    } else if (simTimeSeconds === 0 && isSimulating && !isSimFinished) {
      handleFinishSimulation();
    }
    return () => clearInterval(timer);
  }, [isSimulating, isSimFinished, simTimeSeconds]);

  // Extract unique topics for filtering
  const availableTopics = Array.from(new Set(questions.map(q => q.topic).filter(Boolean)));

  // Filter questions based on all criteria
  const filteredQuestions = questions.filter(q => {
    if (selectedExam !== 'todos' && q.exam.toLowerCase() !== selectedExam.toLowerCase()) return false;
    if (selectedYear !== 'todos' && q.year.toString() !== selectedYear) return false;
    if (selectedSubject !== 'todos' && q.subject !== selectedSubject) return false;
    if (selectedTopic !== 'todos' && q.topic.toLowerCase() !== selectedTopic.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchText = q.questionText.toLowerCase().includes(query);
      const matchTopic = q.topic.toLowerCase().includes(query);
      const matchArea = q.area.toLowerCase().includes(query);
      if (!matchText && !matchTopic && !matchArea) return false;
    }
    return true;
  });

  const handleSelectAnswer = (questionId: string, optionIdx: number, correctAnswer: number) => {
    if (userSelectedAnswers[questionId] !== undefined) return; // Prevent changing after revealing
    setUserSelectedAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
    
    // Automatically open resolution explanation
    setExpandedExplanation(questionId);

    // Give XP on correct answer
    if (optionIdx === correctAnswer) {
      const earnedXp = 25;
      const updated = updateUserXP(earnedXp);
      if (onProfileUpdated) onProfileUpdated(updated);
    }
  };

  const handleStartSimulation = () => {
    setIsSimulating(true);
    setIsSimFinished(false);
    setSimAnswers({});
    const totalSeconds = Math.max(300, filteredQuestions.length * 180); // 3 min per question
    setSimTimeSeconds(totalSeconds);
    setSimScore(null);
  };

  const handleFinishSimulation = () => {
    let correct = 0;
    filteredQuestions.forEach(q => {
      if (simAnswers[q.id] === q.correctAnswer) correct++;
    });
    const total = filteredQuestions.length;
    const earnedXp = correct * 40 + 50;

    setIsSimFinished(true);
    setSimScore({ correct, total, xp: earnedXp });

    if (earnedXp > 0) {
      const updated = updateUserXP(earnedXp);
      if (onProfileUpdated) onProfileUpdated(updated);
      addNotification({
        title: 'Simulado de Vestibular Concluído!',
        message: `Você acertou ${correct} de ${total} questões oficiais (+${earnedXp} XP).`,
        type: 'exam',
        linkTab: 'vestibulares'
      });
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-10 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
            <span>Módulo de Vestibulares • v0.7</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Banco Oficial de Questões de Vestibulares
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Consulte bancas examinadoras, resolva provas anteriores categorizadas por <strong className="text-white">Banca, Ano, Matéria e Assunto</strong> com gabarito oficial e resolução comentada passo a passo.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isFromSupabase ? 'Sincronizado via Supabase DB' : 'Acervo Oficial Integrado'}</span>
            </span>
            <span className="px-3 py-1 rounded-lg bg-blue-900/40 border border-blue-700/50 text-blue-200">
              ENEM • FUVEST • UNICAMP • UERJ • ITA
            </span>
          </div>
        </div>
      </div>

      {/* Sub-tab Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab('banco')}
          className={`flex items-center space-x-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
            activeSubTab === 'banco'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Banco de Questões ({filteredQuestions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('simulado')}
          className={`flex items-center space-x-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
            activeSubTab === 'simulado'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Modo Simulado Cronometrado</span>
        </button>

        <button
          onClick={() => setActiveSubTab('estatisticas')}
          className={`flex items-center space-x-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
            activeSubTab === 'estatisticas'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Estatísticas & Análise de Bancas</span>
        </button>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* TAB 1: BANCO DE QUESTÕES COM FILTROS MULTINÍVEIS                        */}
      {/* ---------------------------------------------------------------------- */}
      {activeSubTab === 'banco' && (
        <div className="space-y-6">
          
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Filter className="w-4 h-4 text-blue-500" />
                <span>Filtros do Banco de Questões Oficiais</span>
              </span>
              <button
                onClick={() => {
                  setSelectedExam('todos');
                  setSelectedYear('todos');
                  setSelectedSubject('todos');
                  setSelectedTopic('todos');
                  setSearchQuery('');
                }}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Limpar Todos os Filtros
              </button>
            </div>

            {/* Grid of Select Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              {/* Filter 1: Banca */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  1. Banca Examinadora
                </label>
                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {VESTIBULARES_BANCAS.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Filter 2: Ano */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  2. Ano da Prova
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {VESTIBULARES_YEARS.map(y => (
                    <option key={y.id} value={y.id}>{y.name}</option>
                  ))}
                </select>
              </div>

              {/* Filter 3: Matéria */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  3. Matéria / Disciplina
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todos">Todas as Matérias</option>
                  {SUBJECTS.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Filter 4: Assunto */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  4. Assunto Específico
                </label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todos">Todos os Assuntos</option>
                  {availableTopics.map((topic, i) => (
                    <option key={i} value={topic}>{topic}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Keyword Search Input */}
            <div className="relative pt-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
              <input
                type="text"
                placeholder="Buscar por palavra-chave no enunciado (ex: 'propano', 'Carnot', 'Vargas', 'fotossíntese')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Question List View */}
          {filteredQuestions.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center text-slate-400 border border-slate-200 dark:border-slate-800 space-y-3">
              <AlertCircle className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-semibold">Nenhuma questão encontrada com os filtros selecionados.</p>
              <button
                onClick={() => {
                  setSelectedExam('todos');
                  setSelectedYear('todos');
                  setSelectedSubject('todos');
                  setSelectedTopic('todos');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
              >
                Resetar Filtros
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredQuestions.map((q, idx) => {
                const userChoice = userSelectedAnswers[q.id];
                const hasAnswered = userChoice !== undefined;
                const isExpanded = expandedExplanation === q.id;

                return (
                  <div 
                    key={q.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5"
                  >
                    {/* Question Meta Tags */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {/* Banca */}
                        <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-extrabold uppercase">
                          {q.exam}
                        </span>

                        {/* Ano */}
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                          {q.year}
                        </span>

                        {/* Matéria */}
                        <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold capitalize">
                          {q.subject}
                        </span>

                        {/* Assunto */}
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-semibold">
                          Assunto: {q.topic}
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-400 font-mono">
                        Questão #{idx + 1}
                      </span>
                    </div>

                    {/* Question Statement */}
                    <div className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 font-serif">
                      {q.questionText}
                    </div>

                    {/* Options */}
                    <div className="space-y-2.5 pt-2">
                      {q.options.map((opt, optIdx) => {
                        let btnStyle = 'border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300';
                        
                        if (hasAnswered) {
                          if (optIdx === q.correctAnswer) {
                            btnStyle = 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold';
                          } else if (userChoice === optIdx) {
                            btnStyle = 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 font-bold';
                          } else {
                            btnStyle = 'opacity-40 border-slate-200 dark:border-slate-800 text-slate-400';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={hasAnswered}
                            onClick={() => handleSelectAnswer(q.id, optIdx, q.correctAnswer)}
                            className={`w-full p-4 rounded-2xl text-left text-xs sm:text-sm transition-all border flex items-start space-x-3 ${btnStyle}`}
                          >
                            <span className="shrink-0 mt-0.5">
                              {hasAnswered && optIdx === q.correctAnswer && (
                                <Check className="w-4 h-4 text-emerald-600 inline" />
                              )}
                              {hasAnswered && userChoice === optIdx && optIdx !== q.correctAnswer && (
                                <X className="w-4 h-4 text-rose-600 inline" />
                              )}
                            </span>
                            <span className="flex-1">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Step-by-Step Commented Resolution Toggle */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => setExpandedExplanation(isExpanded ? null : q.id)}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                      >
                        <span>{isExpanded ? 'Ocultar Resolução Comentada' : 'Ver Gabarito Oficial & Resolução Comentada Passo a Passo'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {hasAnswered && (
                        <span className={`text-xs font-bold ${userChoice === q.correctAnswer ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {userChoice === q.correctAnswer ? '✓ Resposta Correta (+25 XP)' : '✗ Resposta Incorreta'}
                        </span>
                      )}
                    </div>

                    {/* Step-by-Step Resolution Box */}
                    {isExpanded && (
                      <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-2 animate-in fade-in duration-200">
                        <div className="flex items-center space-x-1.5 font-bold text-blue-800 dark:text-blue-300 text-xs uppercase tracking-wider">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Resolução Comentada Passo a Passo • Banca {q.exam}</span>
                        </div>
                        <div className="whitespace-pre-line leading-relaxed font-sans pt-1">
                          {q.explanation}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* TAB 2: MODO SIMULADO CRONOMETRADO                                      */}
      {/* ---------------------------------------------------------------------- */}
      {activeSubTab === 'simulado' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          
          {!isSimulating && !isSimFinished && (
            <div className="max-w-xl mx-auto text-center space-y-6 py-8">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                <Clock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  Simulação Oficial Cronometrada
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Teste seus conhecimentos com tempo regulado. O simulado selecionará as <strong className="text-slate-800 dark:text-slate-200">{filteredQuestions.length} questões</strong> do filtro atual ({selectedExam === 'todos' ? 'Todas as Bancas' : selectedExam.toUpperCase()}).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-left space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Total de Questões:</span>
                  <span className="text-blue-600 font-bold">{filteredQuestions.length}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Tempo Máximo Sugerido:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold">{Math.round(filteredQuestions.length * 3)} minutos</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Recompensa de Desempenho:</span>
                  <span className="text-emerald-600 font-bold">+40 XP por acerto + Bônus</span>
                </div>
              </div>

              <button
                onClick={handleStartSimulation}
                disabled={filteredQuestions.length === 0}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all"
              >
                Iniciar Simulado Agora
              </button>
            </div>
          )}

          {isSimulating && !isSimFinished && (
            <div className="space-y-6">
              
              {/* Simulation Header with Timer */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">
                <div>
                  <span className="text-xs text-slate-500 block">Tempo Restante de Prova</span>
                  <span className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
                    {formatTimer(simTimeSeconds)}
                  </span>
                </div>

                <button
                  onClick={handleFinishSimulation}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                >
                  Finalizar e Ver Gabarito
                </button>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {filteredQuestions.map((q, idx) => (
                  <div 
                    key={q.id}
                    className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4"
                  >
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
                      <span>Questão {idx + 1} de {filteredQuestions.length}</span>
                      <span>•</span>
                      <span className="uppercase text-blue-600">{q.exam} {q.year}</span>
                    </div>

                    <p className="text-sm text-slate-800 dark:text-slate-200 font-serif leading-relaxed">
                      {q.questionText}
                    </p>

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = simAnswers[q.id] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => setSimAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                            className={`w-full p-3.5 rounded-xl text-left text-xs transition-all border ${
                              isChosen
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                                : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {isSimFinished && simScore && (
            <div className="max-w-xl mx-auto text-center space-y-6 py-6">
              <Award className="w-16 h-16 text-amber-500 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Resultado do Simulado
                </h3>
                <p className="text-xs text-slate-500">
                  Desempenho avaliado com gabarito oficial comentado
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="text-3xl font-black text-blue-600">
                  {simScore.correct} <span className="text-sm font-normal text-slate-500">de {simScore.total} questões corretas</span>
                </div>
                <div className="text-xs font-semibold text-emerald-600">
                  + {simScore.xp} Pontos de Experiência (XP) adicionados ao perfil!
                </div>
              </div>

              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => {
                    setIsSimulating(false);
                    setIsSimFinished(false);
                    setActiveSubTab('banco');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  Revisar Resoluções Comentadas
                </button>
                <button
                  onClick={handleStartSimulation}
                  className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* TAB 3: ESTATÍSTICAS E ANÁLISE DE BANCAS                                */}
      {/* ---------------------------------------------------------------------- */}
      {activeSubTab === 'estatisticas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card: ENEM Profile */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                ENEM
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Exame Nacional do Ensino Médio</h4>
                <p className="text-xs text-slate-500">Matriz de Referência e TRI (Teoria de Resposta ao Item)</p>
              </div>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
              <li>• <strong>Matemática:</strong> Proporcionalidade, Geometria Espacial e Funções representam ~45% da prova.</li>
              <li>• <strong>Linguagens:</strong> Coesão textual, operadores argumentativos e gêneros digitais dominam o exame.</li>
              <li>• <strong>Natureza:</strong> Ecologia, Ondulatória, Termodinâmica e Estequiometria são os tópicos mais incidentes.</li>
            </ul>
          </div>

          {/* Card: FUVEST & UNICAMP Profile */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                SP
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">FUVEST (USP) & UNICAMP</h4>
                <p className="text-xs text-slate-500">Vestibulares Tradicionais Paulistas</p>
              </div>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
              <li>• <strong>Rigor Conceitual:</strong> Maior profundidade teórica e terminologia científica estrita.</li>
              <li>• <strong>Leitura Obrigatória:</strong> Questões interdisciplinares articulando as obras literárias com História e Sociedade.</li>
              <li>• <strong>Interpretação Crítica:</strong> Exige análise densa de gráficos, tabelas e contextos socioeconômicos.</li>
            </ul>
          </div>

          {/* Card: ITA & IME Profile */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                MIL
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">ITA & Vestibulares Militares</h4>
                <p className="text-xs text-slate-500">Alto Nível de Exigência em Ciências Exatas</p>
              </div>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
              <li>• <strong>Cálculo Avançado:</strong> Geometria analítica de cônicas, números complexos e matrizes.</li>
              <li>• <strong>Termodinâmica e Eletromagnetismo:</strong> Resolução de circuitos complexos e ciclos térmicos de alta performance.</li>
            </ul>
          </div>

          {/* Card: UERJ Profile */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                UERJ
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Universidade do Estado do Rio de Janeiro</h4>
                <p className="text-xs text-slate-500">Exame de Qualificação e Discursivo</p>
              </div>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
              <li>• <strong>Cidadania e Humanidades:</strong> Foco em História do Brasil, Geopolítica urbana e Filosofia Política.</li>
              <li>• <strong>Química e Biologia:</strong> Enfoque prático em equilíbrios químicos, pH e ecossistemas da Mata Atlântica.</li>
            </ul>
          </div>

        </div>
      )}

    </div>
  );
}
