
import React from 'react';
import { Subject, Topic, Question, QuestionType, QuestionOrigin } from './types';

export const APP_NAME = "QuizConcursos";

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
