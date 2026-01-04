
import React, { useState, useMemo } from 'react';
import { User, Subject, Topic, Question, QuestionType, QuestionOrigin, AppConfig } from '../types';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
  questions: Question[];
  subjects: Subject[];
  topics: Topic[];
  appConfig: AppConfig;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout, questions, subjects, topics, appConfig }) => {
  const navigate = useNavigate();
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterTopic, setFilterTopic] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterOrigin, setFilterOrigin] = useState<string>('');

  const availableTopics = useMemo(() => {
    return topics.filter(t => !filterSubject || t.subjectId === filterSubject);
  }, [topics, filterSubject]);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (filterSubject && q.subjectId !== filterSubject) return false;
      if (filterTopic && q.topicId !== filterTopic) return false;
      if (filterType && q.type !== filterType) return false;
      if (filterOrigin && q.origin !== filterOrigin) return false;
      return true;
    }).sort((a, b) => b.createdAt - a.createdAt);
  }, [questions, filterSubject, filterTopic, filterType, filterOrigin]);

  return (
    <Layout user={user} onLogout={onLogout} appConfig={appConfig}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <section className="bg-indigo-700 rounded-3xl p-8 text-white shadow-xl overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">Olá, {user.username}! 👋</h2>
            <p className="text-indigo-100 max-w-xl">Pronto para mais um dia de estudos? Escolha uma disciplina e comece a praticar agora mesmo.</p>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2 .712V17a1 1 0 001 1z" />
            </svg>
          </div>
        </section>

        {/* Filter Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-900">Filtros de Estudo</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Disciplina</label>
              <select 
                value={filterSubject}
                onChange={(e) => {
                  setFilterSubject(e.target.value);
                  setFilterTopic('');
                }}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                <option value="">Todas as Disciplinas</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tópico</label>
              <select 
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
                disabled={!filterSubject}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50"
              >
                <option value="">Todos os Tópicos</option>
                {availableTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Modalidade</label>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                <option value="">Todas</option>
                <option value={QuestionType.MULTIPLE_CHOICE}>Múltipla Escolha</option>
                <option value={QuestionType.TRUE_FALSE}>Certo ou Errado</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Origem</label>
              <select 
                value={filterOrigin}
                onChange={(e) => setFilterOrigin(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                <option value="">Todas</option>
                <option value={QuestionOrigin.AUTORAL}>Autoral {appConfig.name}</option>
                <option value={QuestionOrigin.CONCURSO}>Concursos Públicos</option>
              </select>
            </div>
          </div>
        </section>

        {/* Questions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold text-slate-900">Questões Encontradas ({filteredQuestions.length})</h3>
            <p className="text-sm text-slate-500">Mostrando as mais recentes</p>
          </div>

          <div className="grid gap-4">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((q) => {
                const sub = subjects.find(s => s.id === q.subjectId);
                const top = topics.find(t => t.id === q.topicId);
                return (
                  <div 
                    key={q.id}
                    onClick={() => navigate(`/question/${q.id}`)}
                    className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase">
                          {sub?.name || 'Disciplina'}
                        </span>
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                          {top?.name || 'Tópico'}
                        </span>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${q.origin === QuestionOrigin.AUTORAL ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                          {q.origin === QuestionOrigin.AUTORAL ? 'Autoral' : 'Concurso'}
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium line-clamp-2 leading-relaxed">
                        {q.statement}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xs text-slate-400 font-medium">
                        {q.type === QuestionType.MULTIPLE_CHOICE ? 'Múltipla Escolha' : 'Certo ou Errado'}
                      </span>
                      <div className="w-10 h-10 bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white rounded-full flex items-center justify-center transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 py-20 text-center">
                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-1">Nenhuma questão encontrada</h4>
                <p className="text-slate-500">Tente ajustar seus filtros para encontrar outros tópicos.</p>
                <button 
                  onClick={() => {
                    setFilterSubject('');
                    setFilterTopic('');
                    setFilterType('');
                    setFilterOrigin('');
                  }}
                  className="mt-6 text-indigo-600 font-semibold hover:underline"
                >
                  Limpar todos os filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
