'use client';

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  FileText, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Award, 
  BookOpen, 
  Search, 
  Send, 
  RotateCcw, 
  ChevronRight,
  Zap,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  FileCheck,
  Share2,
  Lightbulb,
  Check
} from 'lucide-react';
import { 
  UserProfile, 
  VestibularExamModel, 
  EssayCorrectionResult, 
  PastExamQuestion 
} from '@/types';
import { 
  updateUserXP, 
  addNotification, 
  getSavedEssays, 
  saveEssayCorrection 
} from '@/lib/storage';

interface VestibularesModuleProps {
  profile: UserProfile;
  onProfileUpdated?: (updated: UserProfile) => void;
}

// Preset past exam questions dataset for Vestibulares
const MOCK_PAST_QUESTIONS: PastExamQuestion[] = [
  {
    id: 'enem_2024_mat_1',
    exam: 'ENEM',
    year: 2024,
    subject: 'matematica',
    area: 'Matemática e Suas Tecnologias',
    questionText: 'Uma usina solar fotovoltaica instalada em uma propriedade rural possui uma capacidade de geração de energia que varia proporcionalmente à área dos painéis instalados. Se 50 m² de painéis geram 7.500 kWh por ano, qual será a produção anual estimada se a área for ampliada para 120 m²?',
    options: [
      'A) 15.000 kWh',
      'B) 18.000 kWh',
      'C) 20.000 kWh',
      'D) 22.500 kWh',
      'E) 24.000 kWh'
    ],
    correctAnswer: 1,
    explanation: 'Gabarito B: Como a produção é diretamente proporcional à área dos painéis, temos a regra de três simples: (50 m² / 120 m²) = (7.500 kWh / X). Multiplicando cruzado: 50X = 120 * 7.500 => 50X = 900.000 => X = 18.000 kWh.'
  },
  {
    id: 'enem_2024_port_1',
    exam: 'ENEM',
    year: 2024,
    subject: 'portugues',
    area: 'Linguagens, Códigos e Suas Tecnologias',
    questionText: 'No contexto dos estudos sobre coesão e coerência textual, a utilização de operadores argumentativos como "Contudo", "Ademais" e "Por conseguinte" desempenha um papel fundamental na articulação do discurso. Qual alternativa indica corretamente a função do conectivo "Por conseguinte"?',
    options: [
      'A) Introduzir uma ressalva ou oposição a uma ideia anterior.',
      'B) Estabelecer uma relação de causa e consequência lógica.',
      'C) Adicionar um argumento de mesma polaridade valorativa.',
      'D) Explicitar uma condição hipotética para a realização de um fato.',
      'E) Promover a retificação de uma informação imprecisa.'
    ],
    correctAnswer: 1,
    explanation: 'Gabarito B: O operador argumentativo "por conseguinte" possui valor semântico conclusivo/consecutivo, sendo empregado para conectar uma premissa à sua consequência lógica.'
  },
  {
    id: 'fuvest_2024_bio_1',
    exam: 'FUVEST',
    year: 2024,
    subject: 'biologia',
    area: 'Ciências da Natureza',
    questionText: 'Durante o processo de fotossíntese nas plantas angiospermas, a etapa fotoquímica (fase clara) ocorre nos tilacoides dos cloroplastos. Qual é o principal papel da fotólise da água nesse processo?',
    options: [
      'A) Fornecer elétrons para recompor o fotossistema II e liberar oxigênio molecular (O₂).',
      'B) Fixar o dióxido de carbono (CO₂) no ciclo de Calvin-Benson.',
      'C) Sintetizar glicose diretamente na matriz estromal do cloroplasto.',
      'D) Consumir ATP produzido na etapa escura da célula vegetal.',
      'E) Transportar piruvato para a mitocôndria durante a respiração celular.'
    ],
    correctAnswer: 0,
    explanation: 'Gabarito A: A fotólise da água (reação de Hill) quebra moléculas de H₂O utilizando energia luminosa, repondo os elétrons perdidos pelo fotossistema II (P680) e liberando O₂ como subproduto.'
  },
  {
    id: 'unicamp_2024_hist_1',
    exam: 'UNICAMP',
    year: 2024,
    subject: 'historia',
    area: 'Ciências Humanas',
    questionText: 'A Era Vargas (1930-1945) promoveu transformações profundas na estrutura socioeconômica brasileira. Dentre as principais medidas do período do Estado Novo (1937-1945), destaca-se:',
    options: [
      'A) A promulgação da Consolidação das Leis do Trabalho (CLT) e a criação da CSN.',
      'B) A privatização das indústrias de base e abertura irrestrita ao capital estrangeiro.',
      'C) A instituição do voto feminino pela primeira vez na Constituição de 1891.',
      'D) A descentralização política total concedida aos governadores oligárquicos.',
      'E) O fim definitivo do protecionismo cambial sobre a cafeicultura.'
    ],
    correctAnswer: 0,
    explanation: 'Gabarito A: Durante o Estado Novo, Getúlio Vargas impulsionou a industrialização estatal (Companhia Siderúrgica Nacional - CSN) e consolidou os direitos trabalhistas com a CLT em 1943.'
  }
];

// Preset Essay Themes
const ESSAY_THEMES = [
  {
    exam: 'enem',
    label: 'ENEM • Desafios no Combate à Desinformação e Fake News no Brasil Contemporâneo',
    themeText: 'Desafios no combate à desinformação e às fake news na era digital no Brasil'
  },
  {
    exam: 'enem',
    label: 'ENEM • Impactos da Inteligência Artificial na Educação e no Futuro do Trabalho',
    themeText: 'Impactos e limites da Inteligência Artificial na transformação do trabalho e da educação brasileira'
  },
  {
    exam: 'fuvest',
    label: 'FUVEST • O Papel da Arte e da Cultura na Construção da Identidade Nacional',
    themeText: 'O papel da arte, da literatura e da cultura na formação da identidade e da cidadania'
  },
  {
    exam: 'unicamp',
    label: 'UNICAMP • Preservação Ambiental, Transição Energética e Justiça Social',
    themeText: 'A urgência da transição energética e a preservação dos biomas brasileiros frente às mudanças climáticas'
  },
  {
    exam: 'uerj',
    label: 'UERJ • Saúde Mental da Juventude e os Desafios da Conectividade Contínua',
    themeText: 'A saúde mental da juventude em meio à hiperconectividade e às redes sociais'
  },
];

export function VestibularesModule({ profile, onProfileUpdated }: VestibularesModuleProps) {
  const [activeTab, setActiveTab] = useState<'acervo' | 'redacao' | 'historico'>('acervo');

  // Past Exams filter state
  const [selectedExam, setSelectedExam] = useState<string>('todos');
  const [selectedYear, setSelectedYear] = useState<string>('todos');
  const [selectedSubject, setSelectedSubject] = useState<string>('todos');
  const [expandedExplanation, setExpandedExplanation] = useState<string | null>(null);

  // Timed Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simAnswers, setSimAnswers] = useState<Record<string, number>>({});
  const [simTimeSeconds, setSimTimeSeconds] = useState(600); // 10 min
  const [isSimFinished, setIsSimFinished] = useState(false);
  const [simScore, setSimScore] = useState<{ correct: number; total: number; xp: number } | null>(null);

  // Essay Correction State
  const [examModel, setExamModel] = useState<VestibularExamModel>('enem');
  const [selectedThemeIndex, setSelectedThemeIndex] = useState<number>(0);
  const [customTheme, setCustomTheme] = useState<string>('');
  const [essayTitle, setEssayTitle] = useState<string>('');
  const [essayText, setEssayText] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<EssayCorrectionResult | null>(null);
  const [savedEssays, setSavedEssays] = useState<EssayCorrectionResult[]>([]);

  useEffect(() => {
    setSavedEssays(getSavedEssays());
  }, []);

  // Timer interval for test simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSimulating && !isSimFinished && simTimeSeconds > 0) {
      timer = setInterval(() => setSimTimeSeconds(prev => prev - 1), 1000);
    } else if (simTimeSeconds === 0 && isSimulating && !isSimFinished) {
      finishSimulation();
    }
    return () => clearInterval(timer);
  }, [isSimulating, isSimFinished, simTimeSeconds]);

  const filteredQuestions = MOCK_PAST_QUESTIONS.filter(q => {
    if (selectedExam !== 'todos' && q.exam.toLowerCase() !== selectedExam.toLowerCase()) return false;
    if (selectedYear !== 'todos' && q.year.toString() !== selectedYear) return false;
    if (selectedSubject !== 'todos' && q.subject !== selectedSubject) return false;
    return true;
  });

  const startSimulation = () => {
    setIsSimulating(true);
    setIsSimFinished(false);
    setSimAnswers({});
    setSimTimeSeconds(filteredQuestions.length * 150 || 600);
    setSimScore(null);
  };

  const finishSimulation = () => {
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
        message: `Você acertou ${correct} de ${total} questões anteriores de Vestibulares (+${earnedXp} XP).`,
        type: 'quiz',
        linkTab: 'vestibulares'
      });
    }
  };

  const handleEvaluateEssay = async () => {
    const activeThemeText = customTheme || ESSAY_THEMES[selectedThemeIndex]?.themeText || 'Tema livre de vestibular';
    if (!essayText || essayText.trim().length < 50) {
      alert('Sua redação precisa ter no mínimo 50 caracteres para ser avaliada pela banca da IA.');
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
          theme: activeThemeText,
          essayTitle,
          essayText,
          userApiKey: profile.customGeminiKey
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const resultObj: EssayCorrectionResult = {
        id: 'essay_' + Date.now().toString(36),
        examModel,
        theme: activeThemeText,
        essayTitle,
        essayText,
        finalScore: data.finalScore || 800,
        maxScore: data.maxScore || 1000,
        assessmentLevel: data.assessmentLevel || 'Muito Bom',
        competencies: data.competencies || [],
        strengths: data.strengths || [],
        improvements: data.improvements || [],
        suggestedRewrites: data.suggestedRewrites || [],
        generalFeedback: data.generalFeedback || 'Excelente trabalho!',
        createdAt: new Date().toISOString()
      };

      setEvaluationResult(resultObj);
      const updatedList = saveEssayCorrection(resultObj);
      setSavedEssays(updatedList);

      // Award XP
      const updated = updateUserXP(150);
      if (onProfileUpdated) onProfileUpdated(updated);

      addNotification({
        title: 'Redação Avaliada com Sucesso!',
        message: `Sua redação do modelo ${examModel.toUpperCase()} recebeu nota ${resultObj.finalScore}/${resultObj.maxScore}. (+150 XP)`,
        type: 'essay',
        linkTab: 'vestibulares'
      });

    } catch (err: any) {
      console.error("Erro na correção da redação:", err);
      alert("Houve uma oscilação na resposta da banca. Tentaremos novamente em instantes.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;
  const paragraphCount = essayText.trim() ? essayText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length : 0;

  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 p-8 text-white shadow-xl border border-blue-800/40">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.3),transparent_70%)] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              <GraduationCap className="w-4 h-4" />
              <span>Novo Módulo • v0.4 • 100% Gratuito</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Vestibulares & Redação com IA
            </h1>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              Pratique com o acervo de provas anteriores (ENEM, FUVEST, UNICAMP) e submeta suas redações para correção pedagógica automatizada baseada nas competências oficiais dos exames.
            </p>
          </div>

          {/* Quick Stat Pill */}
          <div className="flex items-center space-x-4 bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-700/60 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 flex items-center justify-center text-blue-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-2xl font-black text-white">{savedEssays.length}</span>
              <span className="text-xs text-slate-400 font-medium">Redações Corrigidas</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 pt-6 border-t border-blue-800/50 mt-6">
          <button
            onClick={() => setActiveTab('acervo')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'acervo'
                ? 'bg-white text-blue-900 shadow-lg'
                : 'text-blue-200 hover:text-white hover:bg-blue-800/40'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Acervo de Provas & Gabaritos</span>
          </button>

          <button
            onClick={() => setActiveTab('redacao')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'redacao'
                ? 'bg-white text-blue-900 shadow-lg'
                : 'text-blue-200 hover:text-white hover:bg-blue-800/40'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Correção de Redação (Gemini AI)</span>
          </button>

          <button
            onClick={() => setActiveTab('historico')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'historico'
                ? 'bg-white text-blue-900 shadow-lg'
                : 'text-blue-200 hover:text-white hover:bg-blue-800/40'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Minhas Redações ({savedEssays.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: ACERVO DE PROVAS E GABARITOS COMENTADOS                             */}
      {/* ========================================================================= */}
      {activeTab === 'acervo' && (
        <div className="space-y-6">
          
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Search className="w-5 h-5 text-blue-600" />
                <span>Filtrar Questões de Provas Anteriores</span>
              </h3>

              {!isSimulating && (
                <button
                  onClick={startSimulation}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  <span>Iniciar Simulado de Prova</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Exame / Vestibular
                </label>
                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todos">Todos os Exames (ENEM, FUVEST, etc.)</option>
                  <option value="enem">ENEM</option>
                  <option value="fuvest">FUVEST (USP)</option>
                  <option value="unicamp">UNICAMP</option>
                  <option value="uerj">UERJ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Ano de Aplicação
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todos">Todos os Anos</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Área / Disciplina
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todos">Todas as Matérias</option>
                  <option value="matematica">Matemática</option>
                  <option value="portugues">Português & Literatura</option>
                  <option value="biologia">Biologia</option>
                  <option value="historia">História</option>
                </select>
              </div>
            </div>
          </div>

          {/* Timed Test Mode Active Banner */}
          {isSimulating && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Modo Simulado em Andamento
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Tempo restante: <span className="font-mono font-bold">{Math.floor(simTimeSeconds / 60)}m {simTimeSeconds % 60}s</span>
                  </p>
                </div>
              </div>

              <button
                onClick={finishSimulation}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 shadow-sm"
              >
                Finalizar e Ver Gabarito
              </button>
            </div>
          )}

          {/* Simulation Results Banner */}
          {isSimFinished && simScore && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-6 rounded-3xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                Resultado do Simulado
              </h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Você acertou <strong className="text-emerald-900 dark:text-emerald-100">{simScore.correct}</strong> de <strong>{simScore.total}</strong> questões! (+{simScore.xp} XP)
              </p>
              <button
                onClick={() => setIsSimulating(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
              >
                Voltar ao Modo de Estudos
              </button>
            </div>
          )}

          {/* Questions Cards List */}
          <div className="space-y-6">
            {filteredQuestions.map((q, idx) => (
              <div 
                key={q.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                {/* Header tags */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold text-xs">
                      {q.exam} {q.year}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-xs">
                      {q.area}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">Questão #{idx + 1}</span>
                </div>

                {/* Enunciado */}
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {q.questionText}
                </p>

                {/* Alternativas */}
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = simAnswers[q.id] === optIdx;
                    const isCorrect = q.correctAnswer === optIdx;
                    const showFeedback = isSimFinished;

                    let btnClass = "w-full text-left p-3.5 rounded-2xl border text-xs font-medium transition-all ";
                    if (showFeedback) {
                      if (isCorrect) btnClass += "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold";
                      else if (isSelected) btnClass += "bg-red-50 dark:bg-red-950/50 border-red-500 text-red-900 dark:text-red-100";
                      else btnClass += "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500";
                    } else if (isSimulating) {
                      if (isSelected) btnClass += "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 font-bold";
                      else btnClass += "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800";
                    } else {
                      btnClass += "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300";
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={!isSimulating}
                        onClick={() => setSimAnswers({ ...simAnswers, [q.id]: optIdx })}
                        className={btnClass}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {/* Gabarito Comentado Button */}
                {!isSimulating && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => setExpandedExplanation(expandedExplanation === q.id ? null : q.id)}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1.5"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>{expandedExplanation === q.id ? 'Ocultar Gabarito Comentado' : 'Ver Gabarito Comentado'}</span>
                    </button>
                  </div>
                )}

                {/* Expanded Explanation Box */}
                {expandedExplanation === q.id && (
                  <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2 text-xs text-blue-950 dark:text-blue-200 animate-in fade-in duration-150">
                    <div className="flex items-center space-x-2 font-bold text-blue-800 dark:text-blue-300">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Resolução Comentada pela Banca:</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-line">
                      {q.explanation}
                    </p>
                  </div>
                )}

              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: CORREÇÃO DE REDAÇÃO COM GEMINI AI                                   */}
      {/* ========================================================================= */}
      {activeTab === 'redacao' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Input Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Submeter Redação para Correção</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Selecione o modelo do vestibular desejado e digite ou cole seu texto.
                </p>
              </div>

              {/* Exam Model Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Modelo de Correção do Vestibular
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'enem', label: 'ENEM (1000 pts)' },
                    { id: 'fuvest', label: 'FUVEST (50 pts)' },
                    { id: 'unicamp', label: 'UNICAMP (40 pts)' },
                    { id: 'uerj', label: 'UERJ (10 pts)' },
                    { id: 'ita', label: 'ITA (10 pts)' },
                  ].map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setExamModel(model.id as VestibularExamModel)}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center ${
                        examModel === model.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {model.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Proposta / Tema da Redação
                </label>
                <select
                  value={selectedThemeIndex}
                  onChange={(e) => setSelectedThemeIndex(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ESSAY_THEMES.map((t, idx) => (
                    <option key={idx} value={idx}>{t.label}</option>
                  ))}
                </select>

                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Ou digite um tema personalizado aqui..."
                    value={customTheme}
                    onChange={(e) => setCustomTheme(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Title Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Título da Redação (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: O labirinto da desinformação na sociedade em rede"
                  value={essayTitle}
                  onChange={(e) => setEssayTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Essay Content Text Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Texto da Redação
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    {wordCount} palavras • ~{paragraphCount} parágrafos
                  </span>
                </div>
                
                <textarea
                  rows={14}
                  placeholder="Cole ou digite aqui seu texto dissertativo-argumentativo completo..."
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-serif"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleEvaluateEssay}
                disabled={isEvaluating || !essayText.trim()}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                {isEvaluating ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <span>Avaliando Competências com Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Corrigir Redação Gratuitamente</span>
                  </>
                )}
              </button>

            </div>
          </div>

          {/* Results Output Column */}
          <div className="lg:col-span-5 space-y-6">
            {evaluationResult ? (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                
                {/* Score Header Gauge */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white text-center space-y-2 border border-blue-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                    Nota Final • {evaluationResult.examModel.toUpperCase()}
                  </span>
                  
                  <div className="text-5xl font-black text-white">
                    {evaluationResult.finalScore}
                    <span className="text-lg font-normal text-blue-300"> / {evaluationResult.maxScore}</span>
                  </div>

                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    Nível: {evaluationResult.assessmentLevel}
                  </span>
                </div>

                {/* Competencies Breakdown */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Avaliação por Competência
                  </h4>

                  {evaluationResult.competencies.map((comp, idx) => {
                    const percent = Math.round((comp.score / comp.maxScore) * 100);
                    return (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                          <span>{comp.name}</span>
                          <span className="text-blue-600 dark:text-blue-400 font-mono">{comp.score}/{comp.maxScore}</span>
                        </div>

                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                          {comp.feedback}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Strengths & Improvements */}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-2">
                    <h5 className="font-bold text-xs text-emerald-900 dark:text-emerald-200 flex items-center space-x-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Pontos Fortes Identificados:</span>
                    </h5>
                    <ul className="list-disc list-inside text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                      {evaluationResult.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
                    <h5 className="font-bold text-xs text-amber-900 dark:text-amber-200 flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Aspectos a Aprimorar:</span>
                    </h5>
                    <ul className="list-disc list-inside text-xs text-amber-800 dark:text-amber-300 space-y-1">
                      {evaluationResult.improvements.map((imp, i) => (
                        <li key={i}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* General Pedagogical Feedback */}
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-1.5">
                  <h5 className="font-bold text-xs text-blue-900 dark:text-blue-200 flex items-center space-x-1.5">
                    <Lightbulb className="w-4 h-4 text-blue-600" />
                    <span>Parecer da Banca Examinadora:</span>
                  </h5>
                  <p className="text-xs text-blue-950 dark:text-blue-200 leading-relaxed">
                    {evaluationResult.generalFeedback}
                  </p>
                </div>

              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8 stroke-1" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Aguardando Envio da Redação
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Preencha o formulário e clique em "Corrigir Redação" para gerar o parecer completo com nota por competência.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: HISTÓRICO DE REDAÇÕES SALVAS                                        */}
      {/* ========================================================================= */}
      {activeTab === 'historico' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <span>Histórico de Redações Corrigidas</span>
          </h3>

          {savedEssays.length === 0 ? (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <FileText className="w-12 h-12 mx-auto stroke-1 opacity-50" />
              <p className="text-xs">Você ainda não submeteu redações para correção.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedEssays.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => {
                    setEvaluationResult(item);
                    setActiveTab('redacao');
                  }}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 hover:border-blue-500 cursor-pointer transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase">
                      {item.examModel}
                    </span>
                    <span className="font-black text-lg text-slate-900 dark:text-slate-100">
                      {item.finalScore} / {item.maxScore}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-blue-600 line-clamp-1">
                      {item.essayTitle || item.theme}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {item.essayText}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                      Ver Detalhes →
                    </span>
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
