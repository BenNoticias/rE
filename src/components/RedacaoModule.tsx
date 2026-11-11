'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Award, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Send, 
  ChevronRight, 
  Share2, 
  Lightbulb, 
  History, 
  PenTool,
  Check,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { 
  UserProfile, 
  VestibularExamModel, 
  EssayCorrectionResult 
} from '@/types';
import { 
  updateUserXP, 
  addNotification, 
  getSavedEssays, 
  saveEssayCorrection 
} from '@/lib/storage';

interface RedacaoModuleProps {
  profile: UserProfile;
  onProfileUpdated?: (updated: UserProfile) => void;
}

const ESSAY_THEMES = [
  {
    exam: 'enem',
    label: 'ENEM • Desafios no Combate à Desinformação e Fake News na Era Digital',
    themeText: 'Desafios no combate à desinformação e às fake news na era da hiperconectividade no Brasil',
    motivator: 'A disseminação de conteúdos falsos afeta decisões democráticas, saúde pública e convivência social. Redija uma dissertação argumentativa propondo medidas de enfrentamento.'
  },
  {
    exam: 'enem',
    label: 'ENEM • Impactos da Inteligência Artificial no Trabalho e na Educação',
    themeText: 'Impactos e limites éticos da Inteligência Artificial na formação educacional e no futuro do trabalho',
    motivator: 'A automação cognitiva gera oportunidades produtivas, mas suscita debates sobre precarização laboral e pensamento crítico.'
  },
  {
    exam: 'fuvest',
    label: 'FUVEST • A Tensão Entre Memória Histórica e Esquecimento Social',
    themeText: 'A tensão entre a preservação da memória coletiva e a imposição do esquecimento na sociedade contemporânea',
    motivator: 'Reflita sobre como monumentos, livros didáticos e narrativas oficiais constroem ou silenciam episódios históricos.'
  },
  {
    exam: 'unicamp',
    label: 'UNICAMP • Crise Climática, Transição Justa e Biomas Brasileiros',
    themeText: 'A urgência da justiça climática e a preservação dos biomas frente às secas e queimadas extremas',
    motivator: 'Aborde como populações vulneráveis são desproporcionalmente afetadas pelas mudanças do clima nos centros urbanos e no campo.'
  },
  {
    exam: 'uerj',
    label: 'UERJ • Juventude, Solidão e o Algoritmo da Validação Contínua',
    themeText: 'A busca por pertencimento e as angústias da juventude diante da ditadura da visibilidade digital',
    motivator: 'Analise como as métricas de engajamento influenciam a autoestima e as relações interpessoais das novas gerações.'
  },
  {
    exam: 'ita',
    label: 'ITA • Soberania Tecnológica, Inovação e Desenvolvimento Nacional',
    themeText: 'Os caminhos para a autonomia científica e industrial do Brasil em setores estratégicos de ponta',
    motivator: 'Examine a importância do investimento em ciência de base, inteligência artificial e indústria aeroespacial.'
  }
];

export function RedacaoModule({ profile, onProfileUpdated }: RedacaoModuleProps) {
  const [activeTab, setActiveTab] = useState<'escrever' | 'historico'>('escrever');

  // Configuração da proposta
  const [examModel, setExamModel] = useState<VestibularExamModel>('enem');
  const [selectedThemeIndex, setSelectedThemeIndex] = useState<number>(0);
  const [customTheme, setCustomTheme] = useState<string>('');
  
  // Editor
  const [essayTitle, setEssayTitle] = useState<string>('');
  const [essayText, setEssayText] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<EssayCorrectionResult | null>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  // Histórico
  const [savedEssays, setSavedEssays] = useState<EssayCorrectionResult[]>([]);

  // Cronômetro de Redação (Simulador de 60 minutos)
  const [timerSeconds, setTimerSeconds] = useState<number>(3600);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    setSavedEssays(getSavedEssays());
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const wordCount = essayText.trim().length > 0 ? essayText.trim().split(/\s+/).length : 0;
  const paragraphCount = essayText.trim().length > 0 
    ? essayText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length 
    : 0;
  const estimatedLines = Math.ceil(essayText.length / 70);

  const activeThemeObject = ESSAY_THEMES[selectedThemeIndex];
  const activeThemeTitle = customTheme.trim() ? customTheme : activeThemeObject?.themeText || 'Tema livre de redação';

  const handleEvaluateEssay = async () => {
    if (!essayText || essayText.trim().length < 50) {
      alert('Sua redação precisa ter no mínimo 50 caracteres para ser analisada pedagogicamente pela IA.');
      return;
    }

    setIsEvaluating(true);
    setEvaluationResult(null);

    try {
      const response = await fetch('/api/gemini/essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examModel,
          theme: activeThemeTitle,
          essayTitle,
          essayText,
          userApiKey: profile.customGeminiKey
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const result: EssayCorrectionResult = {
        id: `essay_${Date.now().toString(36)}`,
        examModel,
        theme: activeThemeTitle,
        essayTitle,
        essayText,
        finalScore: data.finalScore,
        maxScore: data.maxScore || (examModel === 'enem' ? 1000 : examModel === 'fuvest' ? 50 : 100),
        assessmentLevel: data.assessmentLevel || 'Avaliado',
        competencies: data.competencies || [],
        strengths: data.strengths || [],
        improvements: data.improvements || [],
        suggestedRewrites: data.suggestedRewrites || [],
        generalFeedback: data.generalFeedback || 'Excelente esforço textual.',
        createdAt: new Date().toISOString()
      };

      setEvaluationResult(result);
      saveEssayCorrection(result);
      setSavedEssays(getSavedEssays());

      // Atribui XP educacional por praticar redação
      const earnedXp = Math.round((result.finalScore / result.maxScore) * 150) + 100;
      const updated = updateUserXP(earnedXp);
      if (onProfileUpdated) onProfileUpdated(updated);

      addNotification({
        title: 'Redação Corrigida com IA!',
        message: `Sua redação para o ${examModel.toUpperCase()} obteve ${result.finalScore}/${result.maxScore} pontos (+${earnedXp} XP).`,
        type: 'essay',
        linkTab: 'redacao'
      });

    } catch (err: any) {
      console.error('Erro ao avaliar redação:', err);
      alert('Ocorreu um erro ao conectar com o serviço de correção por IA. Verifique sua chave de API ou tente novamente.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleCopyReport = () => {
    if (!evaluationResult) return;
    const text = `ESTUDA AI - RELATÓRIO DE CORREÇÃO DE REDAÇÃO (${evaluationResult.examModel.toUpperCase()})
Tema: ${evaluationResult.theme}
Título: ${evaluationResult.essayTitle || 'Sem título'}
Nota Final: ${evaluationResult.finalScore} / ${evaluationResult.maxScore} (${evaluationResult.assessmentLevel})

PARECER GERAL:
${evaluationResult.generalFeedback}

COMPETÊNCIAS:
${evaluationResult.competencies.map(c => `- ${c.name}: ${c.score}/${c.maxScore} pts\n  ${c.feedback}`).join('\n')}

PONTOS FORTES:
${evaluationResult.strengths.map(s => `• ${s}`).join('\n')}

OPORTUNIDADES DE MELHORIA:
${evaluationResult.improvements.map(i => `• ${i}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 p-6 sm:p-10 text-white shadow-xl border border-blue-800/40">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Módulo de Redação IA • Versão v0.7</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Laboratório de Redação com Inteligência Artificial
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Escreva e submeta suas dissertações para as bancas oficiais do <strong className="text-white">ENEM</strong>, <strong className="text-white">FUVEST</strong>, <strong className="text-white">UNICAMP</strong> e <strong className="text-white">UERJ</strong>. Receba um parecer pedagógico com nota discriminada por competências e sugestões de reescrita.
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1 rounded-lg bg-blue-900/60 border border-blue-700/50 text-blue-200">
              ✓ Critérios Oficiais das Bancas
            </span>
            <span className="px-3 py-1 rounded-lg bg-indigo-900/60 border border-indigo-700/50 text-indigo-200">
              ✓ Sugestões de Reescrita Passo a Passo
            </span>
            <span className="px-3 py-1 rounded-lg bg-emerald-900/60 border border-emerald-700/50 text-emerald-200">
              ✓ 100% Gratuito
            </span>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('escrever')}
          className={`flex items-center space-x-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'escrever'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span>Escrever e Corrigir</span>
        </button>
        <button
          onClick={() => setActiveTab('historico')}
          className={`flex items-center space-x-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'historico'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Minhas Redações Salvas ({savedEssays.length})</span>
        </button>
      </div>

      {activeTab === 'escrever' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Writing Area (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Editor Container */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              
              {/* Header Editor Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Folha de Redação
                    </h3>
                    <p className="text-xs text-slate-500">
                      Banca Selecionada: <span className="font-semibold text-blue-600 uppercase">{examModel}</span>
                    </p>
                  </div>
                </div>

                {/* Timer Control */}
                <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {formatTimer(timerSeconds)}
                  </span>
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="text-[11px] font-sans font-semibold text-blue-600 hover:underline pl-1"
                  >
                    {isTimerRunning ? 'Pausar' : 'Iniciar'}
                  </button>
                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds(3600);
                    }}
                    title="Reiniciar timer"
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Título da Redação (Opcional no ENEM, Obrigatório na FUVEST)
                </label>
                <input
                  type="text"
                  placeholder="Ex: O labirinto informacional da pós-verdade"
                  value={essayTitle}
                  onChange={(e) => setEssayTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-slate-100 placeholder-slate-400"
                />
              </div>

              {/* Textarea for Essay Body */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Texto Dissertativo-Argumentativo
                  </label>
                  <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>{wordCount} palavras</span>
                    <span>•</span>
                    <span>~{estimatedLines} linhas</span>
                    <span>•</span>
                    <span>{paragraphCount} parágrafos</span>
                  </div>
                </div>

                <textarea
                  rows={16}
                  placeholder="Comece sua introdução contextualizando o tema e apresentando a sua tese clara. Desenvolva ao menos dois parágrafos argumentativos fundamentados em repertório sociocultural e conclua com uma proposta de intervenção detalhada (ENEM) ou reflexão crítica coerente..."
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-blue-500 font-serif transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400 resize-y"
                />
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    if (confirm('Deseja limpar todo o texto da redação?')) {
                      setEssayText('');
                      setEssayTitle('');
                    }
                  }}
                  className="text-xs text-rose-500 hover:text-rose-600 font-semibold"
                >
                  Limpar Texto
                </button>

                <button
                  onClick={handleEvaluateEssay}
                  disabled={isEvaluating || essayText.trim().length < 50}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center space-x-2"
                >
                  {isEvaluating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Banca Analisando Redação...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Corrigir Redação com IA</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Evaluation Result View */}
            {evaluationResult && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-xl space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                
                {/* Result Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Relatório Oficial de Correção Pedagógica
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                      Resultado para o exame {evaluationResult.examModel.toUpperCase()}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Avaliado pela banca inteligente • {new Date(evaluationResult.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  {/* Score Badge */}
                  <div className="flex items-center space-x-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/60 dark:to-indigo-950/60 p-4 rounded-2xl border border-blue-200 dark:border-blue-800">
                    <Award className="w-8 h-8 text-amber-500" />
                    <div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                        {evaluationResult.finalScore}{' '}
                        <span className="text-xs font-normal text-slate-500">/ {evaluationResult.maxScore}</span>
                      </div>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        Classificação: {evaluationResult.assessmentLevel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* General Pedagogical Feedback */}
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center space-x-1.5">
                    <Lightbulb className="w-4 h-4 text-blue-500" />
                    <span>Parecer Geral da Banca</span>
                  </span>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    {evaluationResult.generalFeedback}
                  </p>
                </div>

                {/* Competencies Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Pontuação por Critério / Competência Oficial
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {evaluationResult.competencies.map((comp, idx) => {
                      const percentage = Math.round((comp.score / comp.maxScore) * 100);
                      return (
                        <div 
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {comp.name}
                            </span>
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                              {comp.score} / {comp.maxScore} pts ({percentage}%)
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                percentage >= 80 ? 'bg-emerald-500' : percentage >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 leading-relaxed">
                            {comp.feedback}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Strengths */}
                  <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Pontos Fortes</span>
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {evaluationResult.strengths.map((s, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span>Oportunidades de Melhoria</span>
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {evaluationResult.improvements.map((imp, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Suggested Rewrites */}
                {evaluationResult.suggestedRewrites && evaluationResult.suggestedRewrites.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <span>Sugestões Práticas de Reescrita de Trechos</span>
                    </h4>
                    <div className="space-y-3">
                      {evaluationResult.suggestedRewrites.map((rw, idx) => (
                        <div 
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-2"
                        >
                          <div>
                            <span className="font-semibold text-rose-500">Trecho Original: </span>
                            <span className="italic text-slate-600 dark:text-slate-300">"{rw.original}"</span>
                          </div>
                          <div>
                            <span className="font-semibold text-emerald-500">Sugestão Aprimorada: </span>
                            <span className="font-medium text-slate-800 dark:text-slate-100">"{rw.suggested}"</span>
                          </div>
                          <p className="text-[11px] text-slate-500 pt-1">
                            <strong>Motivo Pedagógico:</strong> {rw.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleCopyReport}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                  >
                    {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copiedReport ? 'Relatório Copiado!' : 'Copiar Relatório Completo'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setEvaluationResult(null);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                  >
                    Praticar Outra Redação
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* Right Sidebar: Exam Selection & Themes (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Exam Selector Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                1. Escolha a Banca Examinadora
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'enem', label: 'ENEM', desc: '1000 pts • 5 Competências' },
                  { id: 'fuvest', label: 'FUVEST', desc: '50 pts • Modelo USP' },
                  { id: 'unicamp', label: 'UNICAMP', desc: '72 pts • Coletânea & Gênero' },
                  { id: 'uerj', label: 'UERJ', desc: '20 pts • Obra Literária' },
                  { id: 'ita', label: 'ITA', desc: '10 pts • Profundidade' },
                ].map((banca) => (
                  <button
                    key={banca.id}
                    onClick={() => setExamModel(banca.id as VestibularExamModel)}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      examModel === banca.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold">{banca.label}</div>
                    <div className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5">{banca.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Themes Selection Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                2. Propostas e Temas Recomendados
              </h3>

              <div className="space-y-2">
                {ESSAY_THEMES.map((theme, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedThemeIndex(idx);
                      setCustomTheme('');
                    }}
                    className={`w-full p-3 rounded-2xl text-left text-xs transition-all border ${
                      !customTheme && selectedThemeIndex === idx
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="line-clamp-2">{theme.label}</span>
                  </button>
                ))}
              </div>

              {/* Custom Theme Field */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Ou digite seu tema personalizado:
                </label>
                <input
                  type="text"
                  placeholder="Ex: O papel da literatura na empatia social..."
                  value={customTheme}
                  onChange={(e) => setCustomTheme(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200 placeholder-slate-400"
                />
              </div>

              {/* Active Motivator Box */}
              {!customTheme && activeThemeObject?.motivator && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                  <strong className="block text-slate-800 dark:text-slate-200 mb-0.5">Diretriz da Proposta:</strong>
                  {activeThemeObject.motivator}
                </div>
              )}

            </div>

            {/* Quick Tips */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900/10 to-blue-900/10 border border-indigo-200 dark:border-indigo-900/40 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4" />
                <span>Dicas de Ouro para a Nota 1000</span>
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
                <li>• <strong>Repertório legitimado:</strong> Conecte filósofos, dados sociológicos ou obras literárias aos seus argumentos.</li>
                <li>• <strong>Conectivos interparágrafos:</strong> Inicie os parágrafos de desenvolvimento com conectores fortes como "Nesse sentido", "Ademais", "Outrossim".</li>
                <li>• <strong>Proposta de Intervenção (ENEM):</strong> Garanta os 5 elementos: Quem faz (Agente), O que faz (Ação), Como faz (Meio), Para que (Efeito) e Detalhe ao menos 1 deles.</li>
              </ul>
            </div>

          </div>

        </div>
      )}

      {activeTab === 'historico' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Histórico de Redações Submetidas
              </h3>
              <p className="text-xs text-slate-500">
                Acompanhe a sua evolução de notas e releia os relatórios emitidos pela IA.
              </p>
            </div>
          </div>

          {savedEssays.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <PenTool className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 stroke-[1.5]" />
              <p className="text-sm font-semibold">Nenhuma redação corrigida ainda.</p>
              <p className="text-xs">Escreva seu primeiro texto na aba ao lado para receber nota e feedback detalhado.</p>
              <button
                onClick={() => setActiveTab('escrever')}
                className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
              >
                Escrever Redação Agora
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {savedEssays.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-[10px] font-bold uppercase">
                        {item.examModel}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString('pt-BR')} às {new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {item.essayTitle || item.theme}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {item.generalFeedback}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900 dark:text-white">
                        {item.finalScore} <span className="text-xs text-slate-400 font-normal">/ {item.maxScore}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {item.assessmentLevel}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setEvaluationResult(item);
                        setActiveTab('escrever');
                        window.scrollTo({ top: 400, behavior: 'smooth' });
                      }}
                      className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all flex items-center space-x-1"
                    >
                      <span>Ver Relatório</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

