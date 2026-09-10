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
  | 'ciencias'
  | 'fisica'
  | 'quimica'
  | 'biologia'
  | 'literatura'
  | 'filosofia';

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
  { id: 'ciencias', name: 'Ciências', color: 'from-cyan-500 to-blue-600', iconName: 'Atom', description: 'Fundamentos de Física, Química e Biologia' },
  { id: 'fisica', name: 'Física', color: 'from-violet-500 to-purple-600', iconName: 'Zap', description: 'Mecânica, Termodinâmica e Eletricidade' },
  { id: 'quimica', name: 'Química', color: 'from-pink-500 to-rose-600', iconName: 'FlaskConical', description: 'Reações, Estequiometria e Química Orgânica' },
  { id: 'biologia', name: 'Biologia', color: 'from-lime-500 to-green-600', iconName: 'Dna', description: 'Genética, Ecologia e Citologia' },
  { id: 'literatura', name: 'Literatura', color: 'from-purple-500 to-pink-600', iconName: 'Feather', description: 'Escolas Literárias e Obras Clássicas' },
  { id: 'filosofia', name: 'Filosofia & Sociologia', color: 'from-slate-600 to-zinc-700', iconName: 'Brain', description: 'Pensadores, Ética e Sociedade' },
];

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  grade: GradeLevel;
  xp: number;
  streak: number;
  level: number;
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
  subject: SubjectId;
  grade: GradeLevel;
  summaryOverview: string;
  topics: SummaryTopic[];
  studyTips: string[];
  createdAt: string;
}

export interface MindmapNode {
  id: string;
  label: string;
  description?: string;
  color?: string;
  type?: 'root' | 'main' | 'sub';
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
  subject: SubjectId;
  grade: GradeLevel;
  nodes: MindmapNode[];
  edges: MindmapEdge[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizResult {
  id: string;
  title: string;
  subject: SubjectId;
  grade: GradeLevel;
  questions: QuizQuestion[];
  userAnswers: number[];
  score: number; // e.g. 80 out of 100
  correctCount: number;
  totalQuestions: number;
  xpEarned: number;
  createdAt: string;
}

export interface ScheduleDay {
  dayName: string; // 'Segunda-feira', etc.
  subjects: {
    subject: string;
    topic: string;
    duration: string;
    technique: string; // e.g. 'Pomodoro 25min + Exercícios'
  }[];
}

export interface SavedSchedule {
  id: string;
  title: string;
  grade: GradeLevel;
  weeklyPlan: ScheduleDay[];
  createdAt: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  grade: GradeLevel;
  xp: number;
  level: number;
  streak: number;
  isCurrentUser?: boolean;
}
