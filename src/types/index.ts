export const APP_VERSION = 'v0.10';

export type GradeLevel = 
  | '6_ef' 
  | '7_ef' 
  | '8_ef' 
  | '9_ef' 
  | '1_em' 
  | '2_em' 
  | '3_em';

export interface GradeInfo {
  id: GradeLevel;
  label: string;
  category: 'Fundamental' | 'Médio';
  description: string;
}

export const GRADE_OPTIONS: GradeInfo[] = [
  { id: '6_ef', label: '6º Ano EF', category: 'Fundamental', description: 'Ensino Fundamental II' },
  { id: '7_ef', label: '7º Ano EF', category: 'Fundamental', description: 'Ensino Fundamental II' },
  { id: '8_ef', label: '8º Ano EF', category: 'Fundamental', description: 'Ensino Fundamental II' },
  { id: '9_ef', label: '9º Ano EF', category: 'Fundamental', description: 'Ensino Fundamental II' },
  { id: '1_em', label: '1º Ano EM', category: 'Médio', description: 'Ensino Médio' },
  { id: '2_em', label: '2º Ano EM', category: 'Médio', description: 'Ensino Médio' },
  { id: '3_em', label: '3º Ano EM', category: 'Médio', description: 'Ensino Médio / Pré-ENEM' },
];

export type SubjectId = 
  | 'matematica'
  | 'portugues'
  | 'historia'
  | 'geografia'
  | 'fisica'
  | 'quimica'
  | 'biologia'
  | 'literatura'
  | 'filosofia'
  | 'sociologia';

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  color: string;
  iconName: string;
  description: string;
}

export const SUBJECTS: SubjectInfo[] = [
  { id: 'matematica', name: 'Matemática', color: 'from-blue-500 to-indigo-600', iconName: 'Calculator', description: 'Álgebra, Geometria, Funções e Números' },
  { id: 'portugues', name: 'Português', color: 'from-emerald-500 to-teal-600', iconName: 'BookOpen', description: 'Gramática, Redação e Interpretação' },
  { id: 'historia', name: 'História', color: 'from-amber-500 to-orange-600', iconName: 'Landmark', description: 'História do Brasil e Geral' },
  { id: 'geografia', name: 'Geografia', color: 'from-green-500 to-emerald-600', iconName: 'Globe', description: 'Geopolítica, Cartografia e Meio Ambiente' },
  { id: 'fisica', name: 'Física', color: 'from-violet-500 to-purple-600', iconName: 'Zap', description: 'Mecânica, Termodinâmica e Eletricidade' },
  { id: 'quimica', name: 'Química', color: 'from-pink-500 to-rose-600', iconName: 'FlaskConical', description: 'Reações, Estequiometria e Química Orgânica' },
  { id: 'biologia', name: 'Biologia', color: 'from-lime-500 to-green-600', iconName: 'Dna', description: 'Genética, Ecologia e Citologia' },
  { id: 'literatura', name: 'Literatura', color: 'from-purple-500 to-pink-600', iconName: 'Feather', description: 'Escolas Literárias e Obras Clássicas' },
  { id: 'filosofia', name: 'Filosofia', color: 'from-amber-600 to-yellow-700', iconName: 'Brain', description: 'Epistemologia, Ética, Teoria do Conhecimento e Política' },
  { id: 'sociologia', name: 'Sociologia', color: 'from-teal-600 to-cyan-700', iconName: 'Users', description: 'Sociedade, Cidadania, Cultura, Movimentos Sociais e Trabalho' },
];

export interface UserConsent {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  timestamp: string; // Data e hora do consentimento ISO 8601
  version: string;   // Versão dos termos (ex: 'v0.8')
}

export interface UserProfile {
  id: string;
  username: string; // Identificador minimizado para LGPD
  name: string;     // Alias para compatibilidade
  email: string;
  avatarUrl?: string; // Foto de perfil ou identificador de avatar preset
  studyGoal?: string; // Foco de estudos (ex: 'Medicina no ENEM', 'FUVEST', 'Reforço Escolar')
  school?: string;    // Escola / Colégio do estudante
  passwordHash?: string; // Hash seguro SHA-256
  grade: GradeLevel;
  xp: number;
  streak: number;
  level: number;
  consent?: UserConsent;
  consentRevoked?: boolean;
  createdAt?: string;
  customGeminiKey?: string;
  useCustomDb: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export interface SummaryTopic {
  title: string;
  content: string;
  keyTerms?: string[];
  example?: string;
}

export interface SavedSummary {
  id: string;
  title: string;
  customTitle?: string;
  subject: SubjectId;
  grade: GradeLevel;
  summaryOverview: string;
  topics: SummaryTopic[];
  studyTips: string[];
  createdAt: string;
  isSaved?: boolean;
  hiddenFromHistory?: boolean;
}

export interface MindmapNode {
  id: string;
  label: string;
  description?: string;
  color?: string;
  type?: 'root' | 'main' | 'sub' | 'detail';
  level?: number; // 0: Root, 1: Eixo, 2: Subtópico, 3: Detalhe/Exemplo
  parentId?: string;
  x?: number;
  y?: number;
}

export interface MindmapEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface SavedMindmap {
  id: string;
  title: string;
  customTitle?: string;
  subject: SubjectId;
  grade: GradeLevel;
  nodes: MindmapNode[];
  edges: MindmapEdge[];
  createdAt: string;
  isSaved?: boolean;
  hiddenFromHistory?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject?: SubjectId | string;
}

export interface QuizResult {
  id: string;
  title: string;
  customTitle?: string;
  subject: SubjectId;
  subjects?: SubjectId[];
  grade: GradeLevel;
  questions: QuizQuestion[];
  userAnswers: number[];
  score: number; // e.g. 80 out of 100
  correctCount: number;
  totalQuestions: number;
  xpEarned: number;
  timeMode?: 'timer' | 'stopwatch';
  timeSpentSeconds?: number;
  questionsPerMinute?: number;
  averageSecondsPerQuestion?: number;
  isEnemMode?: boolean;
  enemDay?: 1 | 2;
  createdAt: string;
  isSaved?: boolean;
  hiddenFromHistory?: boolean;
}

export interface ScheduleDay {
  dayName: string; // 'Segunda-feira', 'Domingo', etc.
  subjects: {
    subject: string;
    topic: string;
    duration: string;
    technique: string; // e.g. 'Pomodoro 50min + Resolução de Questões'
  }[];
}

export interface SavedSchedule {
  id: string;
  title: string;
  customTitle?: string;
  grade: GradeLevel;
  weeklyPlan: ScheduleDay[];
  createdAt: string;
  isSaved?: boolean;
  hiddenFromHistory?: boolean;
}

export interface LeaderboardUser {
  id: string;
  username: string;
  name: string;
  grade: GradeLevel;
  avatarUrl?: string;
  xp: number;
  level: number;
  streak: number;
  isCurrentUser?: boolean;
}

// --------------------------------------------------------------------------
// NOTIFICAÇÕES E ALERTAS DINÂMICOS (v0.8)
// --------------------------------------------------------------------------
export type NotificationType = 'schedule' | 'ranking' | 'quiz' | 'essay' | 'exam' | 'system';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  linkTab?: string;
  linkSubject?: SubjectId;
}

// --------------------------------------------------------------------------
// VESTIBULARES E CORREÇÃO DE REDAÇÃO COM GEMINI (v0.8)
// --------------------------------------------------------------------------
export type VestibularExamModel = 'enem' | 'fuvest' | 'unicamp' | 'uerj' | 'ita';

export interface CompetencyScore {
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface SuggestedRewrite {
  original: string;
  suggested: string;
  explanation: string;
}

export interface EssayCorrectionResult {
  id: string;
  examModel: VestibularExamModel;
  theme: string;
  essayTitle?: string;
  customTitle?: string;
  essayText: string;
  finalScore: number;
  maxScore: number;
  assessmentLevel: string;
  competencies: CompetencyScore[];
  strengths: string[];
  improvements: string[];
  suggestedRewrites: SuggestedRewrite[];
  generalFeedback: string;
  createdAt: string;
  isSaved?: boolean;
  hiddenFromHistory?: boolean;
}

export interface PastExamQuestion {
  id: string;
  exam: string;       // ex: 'ENEM', 'FUVEST', 'UNICAMP', 'UERJ', 'ITA'
  year: number;       // ex: 2024, 2023, 2022
  subject: SubjectId;
  topic: string;      // Assunto (ex: 'Geometria Espacial', 'Funções', 'Termodinâmica', 'Era Vargas', 'Genética', 'Cinemática')
  area: string;       // ex: 'Matemática e Suas Tecnologias', 'Linguagens'
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  isSaved?: boolean;
}

// --------------------------------------------------------------------------
// HISTÓRICO UNIFICADO E CONTEÚDOS SALVOS (v0.8)
// --------------------------------------------------------------------------
export type HistoryItemType = 'summary' | 'mindmap' | 'quiz' | 'essay' | 'schedule' | 'exam';

export interface UnifiedHistoryItem {
  id: string;
  type: HistoryItemType;
  title: string;
  subject?: SubjectId | string;
  grade?: GradeLevel;
  score?: number;
  maxScore?: number;
  createdAt: string;
  isSaved: boolean;
  hiddenFromHistory?: boolean;
  data: any;
}
