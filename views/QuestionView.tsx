
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Question, User, Subject, Topic, Comment, QuestionType, AppConfig } from '../types';
import Layout from '../components/Layout';
import * as db from '../services/supabase';

interface QuestionViewProps {
  user: User;
  questions: Question[];
  subjects: Subject[];
  topics: Topic[];
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  appConfig: AppConfig;
  onLogout: () => void;
}

const QuestionView: React.FC<QuestionViewProps> = ({ user, questions, subjects, topics, comments, setComments, appConfig, onLogout }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showGabarito, setShowGabarito] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const question = useMemo(() => questions.find(q => q.id === id), [id, questions]);
  const sub = useMemo(() => subjects.find(s => s.id === question?.subjectId), [question, subjects]);
  const top = useMemo(() => topics.find(t => t.id === question?.topicId), [question, topics]);
  const questionComments = useMemo(() => comments.filter(c => c.questionId === id && !c.isBlocked).sort((a, b) => b.createdAt - a.createdAt), [id, comments]);

  if (!question) {
    return <div className="p-20 text-center">Questão não encontrada.</div>;
  }

  const handleAnswer = () => {
    if (selectedOption === null) return;
    const correct = selectedOption === question.correctAnswer;
    setIsCorrect(correct);
    setIsAnswered(true);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: 'c' + Date.now(),
      questionId: question.id,
      userId: user.id,
      username: user.username,
      content: newComment,
      createdAt: Date.now(),
      isBlocked: false
    };

    // Salva remotamente
    await db.upsertComment(comment);
    
    // Atualiza localmente
    setComments(prev => [...prev, comment]);
    setNewComment('');
  };

  return (
    <Layout user={user} onLogout={onLogout} appConfig={appConfig}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-white border border-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase">
                  {sub?.name}
                </span>
                <span className="px-3 py-1 bg-white border border-slate-100 text-slate-600 text-xs font-medium rounded-full">
                  {top?.name}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">ID: {question.id}</span>
            </div>

            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enunciado</h3>
                <p className="text-xl text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
                  {question.statement}
                </p>
              </div>

              <div className="space-y-3">
                {question.type === QuestionType.MULTIPLE_CHOICE ? (
                  question.options?.map((option, idx) => (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => setSelectedOption(idx.toString())}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
                        selectedOption === idx.toString()
                          ? isAnswered 
                            ? isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                            : 'border-indigo-600 bg-indigo-50 shadow-md transform -translate-y-0.5'
                          : isAnswered && question.correctAnswer === idx.toString()
                            ? 'border-green-500 bg-green-50 opacity-70'
                            : 'border-slate-100 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${
                        selectedOption === idx.toString()
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className={`text-slate-700 font-medium pt-0.5 ${selectedOption === idx.toString() ? 'text-indigo-900' : ''}`}>
                        {option}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="flex gap-4">
                    {['True', 'False'].map((val) => (
                      <button
                        key={val}
                        disabled={isAnswered}
                        onClick={() => setSelectedOption(val)}
                        className={`flex-1 p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                          selectedOption === val
                            ? isAnswered 
                              ? isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                              : 'border-indigo-600 bg-indigo-50 shadow-md'
                            : isAnswered && question.correctAnswer === val
                              ? 'border-green-500 bg-green-50 opacity-70'
                              : 'border-slate-100 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <span className={`text-2xl font-bold ${val === 'True' ? 'text-green-600' : 'text-red-600'}`}>
                          {val === 'True' ? 'CERTO' : 'ERRADO'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {!isAnswered && (
                <button
                  disabled={selectedOption === null}
                  onClick={handleAnswer}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 disabled:bg-slate-200 disabled:cursor-not-allowed transition-all transform active:scale-95"
                >
                  Responder Questão
                </button>
              )}

              {isAnswered && (
                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                  <div className={`p-6 rounded-2xl flex items-center gap-4 ${
                    isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                      {isCorrect ? '✓' : '×'}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">
                        {isCorrect ? '✅ Você Acertou!' : '❌ Você Errou.'}
                      </h4>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setShowGabarito(!showGabarito)}
                      className="flex-1 bg-indigo-600 text-white font-bold py-4 rounded-xl"
                    >
                      {showGabarito ? 'Esconder Gabarito' : 'Gabarito Comentado'}
                    </button>
                    <button
                      onClick={() => setShowComments(!showComments)}
                      className="flex-1 bg-slate-700 text-white font-bold py-4 rounded-xl"
                    >
                      {showComments ? 'Esconder Comentários' : 'Comentários'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {showGabarito && (
            <div className="bg-white rounded-2xl border border-indigo-200 p-8 animate-in slide-in-from-bottom">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Gabarito Oficial</h3>
              <p className="text-indigo-900 font-bold text-lg mb-4">
                Resposta: {question.type === QuestionType.MULTIPLE_CHOICE 
                  ? String.fromCharCode(65 + parseInt(question.correctAnswer))
                  : question.correctAnswer === 'True' ? 'CERTO' : 'ERRADO'}
              </p>
              <div className="text-slate-700 italic border-l-4 pl-4">
                {question.explanation || 'Sem comentário disponível.'}
              </div>
            </div>
          )}

          {showComments && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 animate-in slide-in-from-bottom">
              <h3 className="text-lg font-bold mb-4">Comentários ({questionComments.length})</h3>
              <form onSubmit={handleAddComment} className="mb-6 space-y-2">
                <textarea
                  className="w-full p-4 bg-slate-50 border rounded-xl"
                  placeholder="Sua contribuição..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold">Enviar</button>
              </form>
              <div className="space-y-4">
                {questionComments.map(c => (
                  <div key={c.id} className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs font-bold text-slate-800 mb-1">{c.username}</p>
                    <p className="text-sm text-slate-600">{c.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default QuestionView;
