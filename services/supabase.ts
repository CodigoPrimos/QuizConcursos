
import { createClient } from '@supabase/supabase-js';
import { User, Subject, Topic, Question, Comment } from '../types';

const SETTINGS_ID = 'b00656af-7387-4228-a4eb-feff86ca10bd';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// --- CONFIGURAÇÕES DO APP ---
export const getRemoteAppSettings = async () => {
  if (!supabase) return null;
  const { data } = await supabase.from('app_settings').select('*').eq('id', SETTINGS_ID).single();
  return data ? {
    name: data.app_name,
    logoUrl: data.logo_url,
    adminActivationTime: data.admin_press_time
  } : null;
};

export const updateRemoteAppSettings = async (config: any) => {
  if (!supabase) return false;
  const { error } = await supabase.from('app_settings').update({
    app_name: config.name,
    logo_url: config.logoUrl,
    admin_press_time: config.adminActivationTime,
    updated_at: new Date().toISOString()
  }).eq('id', SETTINGS_ID);
  return !error;
};

// --- USUÁRIOS ---
export const fetchUsers = async (): Promise<User[]> => {
  if (!supabase) return [];
  const { data } = await supabase.from('app_users').select('*');
  return (data || []).map(u => ({
    id: u.id,
    email: u.email,
    username: u.username,
    password: u.password,
    role: u.role,
    isActive: u.is_active,
    createdAt: u.created_at
  }));
};

export const upsertUser = async (user: User) => {
  if (!supabase) return;
  await supabase.from('app_users').upsert({
    id: user.id,
    email: user.email,
    username: user.username,
    password: user.password,
    role: user.role,
    is_active: user.isActive,
    created_at: user.createdAt
  });
};

export const deleteRemoteUser = async (id: string) => {
  if (!supabase) return;
  await supabase.from('app_users').delete().eq('id', id);
};

// --- TAXONOMIA (DISCIPLINAS E TÓPICOS) ---
export const fetchSubjects = async () => {
  if (!supabase) return [];
  const { data } = await supabase.from('subjects').select('*');
  return data || [];
};

export const upsertSubject = async (sub: Subject) => {
  if (!supabase) return;
  await supabase.from('subjects').upsert(sub);
};

export const fetchTopics = async () => {
  if (!supabase) return [];
  const { data } = await supabase.from('topics').select('*');
  return (data || []).map(t => ({ id: t.id, subjectId: t.subject_id, name: t.name }));
};

export const upsertTopic = async (topic: Topic) => {
  if (!supabase) return;
  await supabase.from('topics').upsert({ id: topic.id, subject_id: topic.subjectId, name: topic.name });
};

// --- QUESTÕES ---
export const fetchQuestions = async (): Promise<Question[]> => {
  if (!supabase) return [];
  const { data } = await supabase.from('questions').select('*');
  return (data || []).map(q => ({
    id: q.id,
    subjectId: q.subject_id,
    topicId: q.topic_id,
    type: q.type,
    origin: q.origin,
    statement: q.statement,
    options: q.options,
    correctAnswer: q.correct_answer,
    explanation: q.explanation,
    commentsEnabled: q.comments_enabled,
    createdAt: q.created_at
  }));
};

export const upsertQuestion = async (q: Question) => {
  if (!supabase) return;
  await supabase.from('questions').upsert({
    id: q.id,
    subject_id: q.subjectId,
    topic_id: q.topicId,
    type: q.type,
    origin: q.origin,
    statement: q.statement,
    options: q.options,
    correct_answer: q.correctAnswer,
    explanation: q.explanation,
    comments_enabled: q.commentsEnabled,
    created_at: q.createdAt
  });
};

// --- COMENTÁRIOS ---
export const fetchComments = async (): Promise<Comment[]> => {
  if (!supabase) return [];
  const { data } = await supabase.from('comments').select('*');
  return (data || []).map(c => ({
    id: c.id,
    questionId: c.question_id,
    userId: c.user_id,
    username: c.username,
    content: c.content,
    isBlocked: c.is_blocked,
    createdAt: c.created_at
  }));
};

export const upsertComment = async (c: Comment) => {
  if (!supabase) return;
  await supabase.from('comments').upsert({
    id: c.id,
    question_id: c.questionId,
    user_id: c.userId,
    username: c.username,
    content: c.content,
    is_blocked: c.isBlocked,
    created_at: c.createdAt
  });
};
