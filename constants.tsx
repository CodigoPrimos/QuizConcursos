
import { Subject, Topic, Question, QuestionType, QuestionOrigin } from './types';

export const APP_NAME = "QuizConcursos";

// Logotipo Novo: Representa estudo (livro) + questões resolvidas (check)
export const DEFAULT_LOGO = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgdmlld0JveD0iMCAwIDgwMCA4MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI4MDAiIHJ4PSIxODAiIGZpbGw9IiM0RjQ2RTUiLz48cGF0aCBkPSJNMjAwIDI0MEgzODBDNDAwIDI0MCA0MDAgMjYwIDQwMCAyNjBWNjIwQzQwMCA2MjAgNDAwIDYwMCAzODAgNjAwSDIwMFYyNDBaIiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik02MDAgMjQwSDQyMEM0MDAgMjQwIDQwMCAyNjAgNDAwIDI2MFY2MjBDNDAwIDYyMCA0MDAgNjAwIDQyMCA2MDBINjAwVjI0MFoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOSIvPjxwYXRoIGQ9Ik00NjAgMzgwTDUxMCA0MzBMNjAwIDMwMCIgc3Ryb2tlPSIjNEY0NkU1IiBzdHJva2Utd2lkdGg9IjUwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cmVjdCB4PSIyNTAiIHk9IjMyMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIyMCIgcng9IjEwIiBmaWxsPSIjQ0JEMUUxIi8+PHJlY3QgeD0iMjUwIiB5PSIzODAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMjAiIHJ4PSIxMCIgZmlsbD0iI0NCRDFFMSIvPjxyZWN0IHg9IjI1MCIgeT0iNDQwIiB3aWR0aD0iNzAiIGhlaWdodD0iMjAiIHJ4PSIxMCIgZmlsbD0iI0NCRDFFMSIvPjwvc3ZnPg==";

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub1', name: 'Português' },
  { id: 'sub2', name: 'Direito Constitucional' },
  { id: 'sub3', name: 'Matemática' },
];

export const INITIAL_TOPICS: Topic[] = [
  { id: 'top1', subjectId: 'sub1', name: 'Morfologia' },
  { id: 'top2', subjectId: 'sub1', name: 'Sintaxe' },
  { id: 'top3', subjectId: 'sub2', name: 'Direitos Fundamentais' },
  { id: 'top4', subjectId: 'sub3', name: 'Raciocínio Lógico' },
];

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q1',
    subjectId: 'sub1',
    topicId: 'top1',
    type: QuestionType.MULTIPLE_CHOICE,
    origin: QuestionOrigin.CONCURSO,
    statement: "Qual a classe gramatical da palavra 'rapidamente'?",
    options: ['Substantivo', 'Adjetivo', 'Advérbio', 'Preposição'],
    correctAnswer: '2',
    explanation: "'Rapidamente' é um advérbio de modo, derivado do adjetivo 'rápida'.",
    commentsEnabled: true,
    createdAt: Date.now()
  },
  {
    id: 'q2',
    subjectId: 'sub2',
    topicId: 'top3',
    type: QuestionType.TRUE_FALSE,
    origin: QuestionOrigin.AUTORAL,
    statement: "A casa é asilo inviolável do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, salvo em caso de flagrante delito ou desastre.",
    correctAnswer: 'True',
    explanation: "Texto literal do Art. 5º, XI da Constituição Federal.",
    commentsEnabled: true,
    createdAt: Date.now()
  }
];
