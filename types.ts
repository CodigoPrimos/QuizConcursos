
export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE'
}

export enum QuestionOrigin {
  AUTORAL = 'AUTORAL',
  CONCURSO = 'CONCURSO'
}

export interface User {
  id: string;
  email: string;
  username: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: number;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Question {
  id: string;
  subjectId: string;
  topicId: string;
  type: QuestionType;
  origin: QuestionOrigin;
  statement: string;
  options?: string[]; // For multiple choice
  correctAnswer: string; // "True"/"False" or option index "0", "1", etc.
  explanation?: string;
  commentsEnabled: boolean;
  createdAt: number;
}

export interface Comment {
  id: string;
  questionId: string;
  userId: string;
  username: string;
  content: string;
  createdAt: number;
  isBlocked: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AppConfig {
  name: string;
  logoUrl: string | null;
  adminActivationTime: number; // New: time in seconds to activate admin mode
}
