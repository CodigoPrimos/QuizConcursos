
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Question, User, Subject, Topic, Comment, QuestionType, AppConfig } from '../types';
import Layout from '../components/Layout';

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
  const [showComments, setShowComments] = useState(false); // Collapsed by default
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

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      questionId: question.id,
      userId: user.id,
      username: user.username,
      content: newComment,
      createdAt: Date.now(),
      isBlocked: false
    };

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
            Voltar para listagem
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

              {/* Responder Button */}
              {!isAnswered && (
                <button
                  disabled={selectedOption === null}
                  onClick={handleAnswer}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 disabled:bg-slate-200 disabled:cursor-not-allowed transition-all transform active:scale-95"
                >
                  Responder Questão
                </button>
              )}

              {/* Feedback and Actions */}
              {isAnswered && (
                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                  <div className={`p-6 rounded-2xl flex items-center gap-4 ${
                    isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                      {isCorrect ? (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">
                        {isCorrect ? '✅ Você Acertou!' : '❌ Você Errou.'}
                      </h4>
                      <p className="text-sm opacity-90">
                        {isCorrect ? 'Excelente! Continue praticando.' : 'Analise o gabarito para aprender com o erro.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setShowGabarito(!showGabarito)}
                      className={`flex-1 font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${showGabarito ? 'bg-indigo-800 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {showGabarito ? 'Esconder Gabarito' : 'Gabarito Comentado'}
                    </button>

                    <button
                      onClick={() => setShowComments(!showComments)}
                      className={`flex-1 font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${showComments ? 'bg-slate-800 text-white' : 'bg-slate-700 text-white hover:bg-slate-800'}`}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      {showComments ? 'Esconder Comentários' : 'Comentários'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gabarito Comentado Section */}
          {showGabarito && (
            <div className="bg-white rounded-2xl border border-indigo-200 p-8 space-y-6 animate-in slide-in-from-bottom duration-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.364-6.364l-.707-.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M12 7a5 5 0 015 5 5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Gabarito Oficial</h3>
                </div>
              </div>

              <div className="prose prose-slate max-w-none">
                <div className="mb-6 p-4 bg-slate-50 rounded-xl border-l-4 border-indigo-500">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Resposta Correta</span>
                  <p className="text-indigo-900 font-bold text-lg">
                    {question.type === QuestionType.MULTIPLE_CHOICE 
                      ? `${String.fromCharCode(65 + parseInt(question.correctAnswer))}) ${question.options?.[parseInt(question.correctAnswer)]}`
                      : question.correctAnswer === 'True' ? 'CERTO' : 'ERRADO'}
                  </p>
                </div>

                {question.explanation ? (
                  <div className="text-slate-700 leading-relaxed italic border-l-4 border-amber-200 pl-4 mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2 not-italic">Comentário do Professor</span>
                    {question.explanation}
                  </div>
                ) : (
                  <p className="text-slate-400 italic py-4">Gabarito comentado não disponível para esta questão.</p>
                )}
              </div>
            </div>
          )}

          {/* Comments Section - Expanded on click */}
          {showComments && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 animate-in slide-in-from-bottom duration-500">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Comentários dos Alunos ({questionComments.length})
              </h3>

              {question.commentsEnabled ? (
                <div className="space-y-6">
                  <form onSubmit={handleAddComment} className="space-y-3">
                    <textarea
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none transition-all"
                      placeholder="Deixe sua dúvida ou contribuição para os outros colegas..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <button 
                        type="submit"
                        className="bg-slate-900 text-white font-semibold py-2 px-6 rounded-lg hover:bg-slate-800 transition-colors text-sm"
                      >
                        Enviar Comentário
                      </button>
                    </div>
                  </form>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {questionComments.map(c => (
                      <div key={c.id} className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-xs">{c.username}</span>
                          <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{c.content}</p>
                      </div>
                    ))}
                    {questionComments.length === 0 && (
                      <p className="text-center text-slate-400 text-sm py-8 italic">Ainda não há comentários. Seja o primeiro!</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-slate-500 text-sm">Comentários desativados pelo administrador.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6 hidden lg:block">
           <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-xl">
             <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
               <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               Sobre a Questão
             </h4>
             <ul className="space-y-3 text-sm text-indigo-100">
               <li className="flex justify-between border-b border-indigo-800 pb-2">
                 <span>Disciplina:</span>
                 <span className="font-bold">{sub?.name}</span>
               </li>
               <li className="flex justify-between border-b border-indigo-800 pb-2">
                 <span>Tópico:</span>
                 <span className="font-bold">{top?.name}</span>
               </li>
               <li className="flex justify-between border-b border-indigo-800 pb-2">
                 <span>Modalidade:</span>
                 <span className="font-bold">{question.type === QuestionType.MULTIPLE_CHOICE ? 'Múltipla Escolha' : 'Certo ou Errado'}</span>
               </li>
               <li className="flex justify-between">
                 <span>ID da Questão:</span>
                 <span className="font-mono text-xs opacity-75">{question.id}</span>
               </li>
             </ul>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default QuestionView;
