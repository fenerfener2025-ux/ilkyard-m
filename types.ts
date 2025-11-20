
export enum Difficulty {
  EASY = 'Kolay',
  MEDIUM = 'Orta',
  HARD = 'Zor'
}

export enum Topic {
  GENERAL = 'Genel İlkyardım Bilgisi',
  ANATOMY = 'İnsan Vücudu ve İşleyişi',
  CPR = 'Temel Yaşam Desteği (CPR)',
  BLEEDING = 'Kanamalar ve Şok',
  BURNS = 'Yanıklar ve Donmalar',
  FRACTURES = 'Kırık, Çıkık ve Burkulmalar',
  CHOKING = 'Hava Yolu Tıkanıklığı',
  ENV_EMERGENCIES = 'Çevresel Aciller (Zehirlenme/Isırma)',
  TRANSPORT = 'Hasta Taşıma Teknikleri',
  PDF_EXAM = 'PDF / Çıkmış Sorular'
}

export type Theme = 'light' | 'dark' | 'system';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: Topic;
  difficulty: Difficulty;
  imageUrl?: string; // Pre-defined or AI generated
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  level: string;
  topicBreakdown: Record<Topic, { total: number; correct: number }>; // Detailed breakdown
}

export interface UserState {
  totalQuizzes: number;
  totalQuestionsAnswered: number;
  topicStats: Record<Topic, { total: number; correct: number }>;
  theme: Theme;
  customQuestions: Question[]; // Store imported questions
}