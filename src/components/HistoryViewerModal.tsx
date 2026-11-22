'use client';

import React, { useState } from 'react';
import { 
  X, 
  Bookmark, 
  Check, 
  Share2, 
  Award, 
  Clock, 
  BookOpen, 
  Network, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { UnifiedHistoryItem } from '@/types';

interface HistoryViewerModalProps {
  item: UnifiedHistoryItem | null;
  onClose: () => void;
  onToggleSaved: (item: UnifiedHistoryItem) => void;
}

export function HistoryViewerModal({ item, onClose, onToggleSaved }: HistoryViewerModalProps) {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const handleCopy = () => {
    let text = `${item.title}\n\n`;

    if (item.type === 'summary') {
      const s = item.data;
      text += `VISÃO GERAL:\n${s.summaryOverview}\n\n`;
      s.topics?.forEach((t: any) => {
        text += `### ${t.title}\n${t.content}\n`;
        if (t.keyTerms?.length) text += `Termos-chave: ${t.keyTerms.join(', ')}\n`;
        if (t.example) text += `Exemplo: ${t.example}\n`;
        text += '\n';
      });
      if (s.studyTips?.length) {
        text += `DICAS DE ESTUDO:\n${s.studyTips.map((tip: string) => `- ${tip}`).join('\n')}\n`;
      }
    } else if (item.type === 'essay') {
      const e = item.data;
      text += `Nota Final: ${e.finalScore}/${e.maxScore} (${e.assessmentLevel})\n\n`;
      text += `TEXTO:\n${e.essayText}\n\n`;
      text += `PARECER DA BANCA:\n${e.generalFeedback}\n\n`;
      text += `COMPETÊNCIAS:\n${e.competencies?.map((c: any) => `- ${c.name}: ${c.score}/${c.maxScore} pts - ${c.feedback}`).join('\n')}\n`;
    } else if (item.type === 'quiz') {
      const q = item.data;
      text += `Pontuação: ${q.score}% (${q.correctCount}/${q.totalQuestions} acertos)\n\n`;
      q.questions?.forEach((qu: any, idx: number) => {
        text += `Questão ${idx + 1}: ${qu.question}\n`;
        qu.options?.forEach((opt: string, optIdx: number) => {
          const isCorrect = qu.correctAnswer === optIdx;
          text += `  ${isCorrect ? '[CORRETA] ' : '  '}${opt}\n`;
        });
        text += `Gabarito Comentado: ${qu.explanation}\n\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center space-x-3 min-w-0 pr-4">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              {item.type === 'summary' && <BookOpen className="w-5 h-5" />}
              {item.type === 'mindmap' && <Network className="w-5 h-5" />}
              {item.type === 'quiz' && <CheckCircle2 className="w-5 h-5" />}
              {item.type === 'essay' && <Award className="w-5 h-5" />}
              {item.type === 'schedule' && <Calendar className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 block">
                {item.type === 'summary' && 'Resumo Didático'}
                {item.type === 'mindmap' && 'Mapa Mental'}
                {item.type === 'quiz' && 'Simulado Gamificado'}
                {item.type === 'essay' && 'Correção de Redação'}
                {item.type === 'schedule' && 'Cronograma Semanal'}
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                {item.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Toggle Saved */}
            <button
              onClick={() => onToggleSaved(item)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border ${
                item.isSaved
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
              title={item.isSaved ? 'Remover dos Salvos' : 'Salvar nos Meus Conteúdos'}
            >
              <Bookmark className={`w-4 h-4 ${item.isSaved ? 'fill-white' : ''}`} />
              <span className="hidden sm:inline">{item.isSaved ? 'Salvo' : 'Salvar'}</span>
            </button>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Copiar Conteúdo"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Time & Metadata Pill */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Registrado em {new Date(item.createdAt).toLocaleString('pt-BR')}</span>
            </span>
            {item.score !== undefined && item.maxScore !== undefined && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                Pontuação: {item.score} / {item.maxScore}
              </span>
            )}
          </div>

          {/* RENDER TYPE: SUMMARY */}
          {item.type === 'summary' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/60 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center space-x-1.5">
                  <Lightbulb className="w-4 h-4" />
                  <span>Visão Geral do Conteúdo</span>
                </span>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {item.data?.summaryOverview}
                </p>
              </div>

              {/* Topics */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Tópicos Estruturados
                </h3>
                {item.data?.topics?.map((topic: any, idx: number) => (
                  <div 
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {topic.title}
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {topic.content}
                    </p>
                    {topic.keyTerms && topic.keyTerms.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2">
                        <span className="text-xs font-semibold text-slate-500 mr-1">Termos-chave:</span>
                        {topic.keyTerms.map((term: string, tIdx: number) => (
                          <span 
                            key={tIdx}
                            className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-mono font-medium border border-slate-200 dark:border-slate-600"
                          >
                            {term}
                          </span>
                        ))}
                      </div>
                    )}
                    {topic.example && (
                      <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300">
                        <span className="font-bold">Exemplo Prático: </span>
                        {topic.example}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Study Tips */}
              {item.data?.studyTips && item.data.studyTips.length > 0 && (
                <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Dicas Pedagógicas para Fixação & Provas</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {item.data.studyTips.map((tip: string, i: number) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* RENDER TYPE: MINDMAP */}
          {item.type === 'mindmap' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 text-xs text-purple-900 dark:text-purple-300">
                Estrutura visual dos conceitos interligados gerados para este tema.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {item.data?.nodes?.map((node: any) => (
                  <div 
                    key={node.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${
                        node.type === 'root' ? 'bg-purple-600' : node.type === 'main' ? 'bg-blue-500' : 'bg-emerald-500'
                      }`} />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {node.label}
                      </h4>
                    </div>
                    {node.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {node.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RENDER TYPE: QUIZ */}
          {item.type === 'quiz' && (
            <div className="space-y-6">
              {/* Score Header */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-bold text-blue-200">Resultado do Simulado</span>
                  <div className="text-3xl font-black mt-1">
                    {item.data?.score}% de Aproveitamento
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-center">
                  <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                    <span className="text-lg font-bold block">{item.data?.correctCount} / {item.data?.totalQuestions}</span>
                    <span className="text-[10px] text-blue-200 uppercase font-semibold">Acertos</span>
                  </div>
                  {item.data?.xpEarned && (
                    <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                      <span className="text-lg font-bold block">+{item.data.xpEarned} XP</span>
                      <span className="text-[10px] text-blue-200 uppercase font-semibold">Experiência</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Gabarito Detalhado das Questões
                </h3>

                {item.data?.questions?.map((q: any, idx: number) => {
                  const studentAns = item.data?.userAnswers?.[idx];
                  const isCorrect = studentAns === q.correctAnswer;

                  return (
                    <div 
                      key={idx}
                      className={`p-5 rounded-2xl border space-y-3 ${
                        isCorrect 
                          ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/10'
                          : 'border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          <span className="text-slate-400 mr-2">{idx + 1}.</span>
                          {q.question}
                        </h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          isCorrect ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                        }`}>
                          {isCorrect ? 'Correta' : 'Incorreta'}
                        </span>
                      </div>

                      {/* Options */}
                      <div className="space-y-1.5 text-xs">
                        {q.options?.map((opt: string, oIdx: number) => {
                          const isStudentChoice = studentAns === oIdx;
                          const isTheCorrect = q.correctAnswer === oIdx;

                          let optionClass = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';
                          if (isTheCorrect) {
                            optionClass = 'border-emerald-500 bg-emerald-100/50 dark:bg-emerald-950/40 font-semibold text-emerald-800 dark:text-emerald-200';
                          } else if (isStudentChoice) {
                            optionClass = 'border-red-500 bg-red-100/50 dark:bg-red-950/40 text-red-700 dark:text-red-300';
                          }

                          return (
                            <div key={oIdx} className={`p-2.5 rounded-xl border flex items-center justify-between ${optionClass}`}>
                              <span>{opt}</span>
                              {isTheCorrect && <span className="text-[10px] font-bold text-emerald-600 ml-2">✓ Gabarito</span>}
                              {isStudentChoice && !isTheCorrect && <span className="text-[10px] font-bold text-red-500 ml-2">Sua Resposta</span>}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                          <span className="font-bold block text-slate-900 dark:text-slate-100">
                            Resolução Comentada:
                          </span>
                          <p className="leading-relaxed whitespace-pre-line">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* RENDER TYPE: ESSAY */}
          {item.type === 'essay' && (
            <div className="space-y-6">
              {/* Score Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-blue-950 text-white flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-bold text-indigo-300">
                    Banca {item.data?.examModel?.toUpperCase()} • {item.data?.assessmentLevel}
                  </span>
                  <div className="text-3xl font-black mt-1">
                    {item.data?.finalScore} <span className="text-lg font-normal text-indigo-300">/ {item.data?.maxScore}</span>
                  </div>
                </div>
                <div className="max-w-md text-xs text-indigo-200">
                  <span className="font-bold block mb-1">Tema:</span>
                  {item.data?.theme}
                </div>
              </div>

              {/* General Feedback */}
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center space-x-1.5">
                  <Lightbulb className="w-4 h-4 text-blue-500" />
                  <span>Parecer Geral da Banca</span>
                </span>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {item.data?.generalFeedback}
                </p>
              </div>

              {/* Essay Text */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Texto da Redação do Estudante
                </h4>
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 font-serif text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line">
                  {item.data?.essayText}
                </div>
              </div>

              {/* Competencies */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Avaliação por Competências Oficiais
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {item.data?.competencies?.map((comp: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{comp.name}</span>
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                          {comp.score} / {comp.maxScore} pts
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {comp.feedback}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Pontos Fortes</span>
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {item.data?.strengths?.map((s: string, i: number) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span>Oportunidades de Melhoria</span>
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {item.data?.improvements?.map((imp: string, i: number) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* RENDER TYPE: SCHEDULE */}
          {item.type === 'schedule' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Plano de Estudos Semanal
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {item.data?.weeklyPlan?.map((day: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">
                      {day.dayName}
                    </h4>
                    <div className="space-y-1 text-xs">
                      {day.subjects?.map((sub: any, sIdx: number) => (
                        <div key={sIdx} className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{sub.subject}</span>
                            <span className="text-slate-400 mx-2">•</span>
                            <span className="text-slate-500">{sub.topic}</span>
                          </div>
                          <span className="text-blue-600 font-mono text-[11px]">{sub.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-800/30">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Fechar Visualização
          </button>
        </div>
      </div>
    </div>
  );
}
