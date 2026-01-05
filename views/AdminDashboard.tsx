
import React, { useState, useRef } from 'react';
import { User, Subject, Topic, Question, Comment, UserRole, QuestionType, QuestionOrigin, AppConfig } from '../types';
import Layout from '../components/Layout';
import * as db from '../services/supabase';
import { DEFAULT_LOGO } from '../constants';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  topics: Topic[];
  setTopics: React.Dispatch<React.SetStateAction<Topic[]>>;
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  appConfig: AppConfig;
  setAppConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  user, onLogout, users, setUsers, subjects, setSubjects, topics, setTopics, questions, setQuestions, comments, setComments, appConfig, setAppConfig
}) => {
  const [activeTab, setActiveTab] = useState<'taxonomy' | 'questions' | 'users' | 'comments' | 'customization'>('taxonomy');
  const [isSaving, setIsSaving] = useState(false);

  // Form States
  const [showQForm, setShowQForm] = useState(false);
  const [qSubjectId, setQSubjectId] = useState('');
  const [qTopicId, setQTopicId] = useState('');
  const [qStatement, setQStatement] = useState('');
  const [qType, setQType] = useState<QuestionType>(QuestionType.MULTIPLE_CHOICE);
  const [qOrigin, setQOrigin] = useState<QuestionOrigin>(QuestionOrigin.AUTORAL);
  const [qOptions, setQOptions] = useState<string[]>(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState('');
  const [qExpl, setQExpl] = useState('');

  const [newSubName, setNewSubName] = useState('');
  const [newTopName, setNewTopName] = useState('');
  const [targetSubId, setTargetSubId] = useState('');

  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserName, setNewUserName] = useState('');

  const [editAppName, setEditAppName] = useState(appConfig.name);
  const [editLogoUrl, setEditLogoUrl] = useState(appConfig.logoUrl || '');
  const [editActivationTime, setEditActivationTime] = useState(appConfig.adminActivationTime || 5);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers Cloud ---

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const newQ: Question = {
      id: 'q' + Date.now(),
      subjectId: qSubjectId,
      topicId: qTopicId,
      statement: qStatement,
      type: qType,
      origin: qOrigin,
      options: qType === QuestionType.MULTIPLE_CHOICE ? qOptions : undefined,
      correctAnswer: qCorrect,
      explanation: qExpl,
      commentsEnabled: true,
      createdAt: Date.now()
    };
    await db.upsertQuestion(newQ);
    setQuestions(prev => [newQ, ...prev]);
    setShowQForm(false);
    resetQForm();
  };

  const resetQForm = () => {
    setQSubjectId(''); setQTopicId(''); setQStatement(''); setQOptions(['', '', '', '']); setQCorrect(''); setQExpl('');
  };

  const handleAddSubject = async () => {
    if (!newSubName.trim()) return;
    const newSub = { id: 's' + Date.now(), name: newSubName };
    await db.upsertSubject(newSub);
    setSubjects(prev => [...prev, newSub]);
    setNewSubName('');
  };

  const handleRemoveSubject = async (id: string) => {
    await db.deleteRemoteSubject(id);
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  const handleAddTopic = async () => {
    if (!newTopName.trim() || !targetSubId) return;
    const newTop = { id: 't' + Date.now(), name: newTopName, subjectId: targetSubId };
    await db.upsertTopic(newTop);
    setTopics(prev => [...prev, newTop]);
    setNewTopName('');
  };

  const handleRemoveTopic = async (id: string) => {
    await db.deleteRemoteTopic(id);
    setTopics(prev => prev.filter(t => t.id !== id));
  };

  const handleAddUser = async () => {
    if (!newUserEmail.trim()) return;
    const newUser: User = {
      id: 'u' + Date.now(),
      email: newUserEmail,
      username: newUserName || newUserEmail.split('@')[0],
      password: newUserPass || '123456',
      role: UserRole.STUDENT,
      isActive: true,
      createdAt: Date.now()
    };
    await db.upsertUser(newUser);
    setUsers(prev => [...prev, newUser]);
    setNewUserEmail(''); setNewUserPass(''); setNewUserName('');
  };

  const toggleUserStatus = async (id: string) => {
    const updated = users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u);
    const userToUpdate = updated.find(u => u.id === id);
    if (userToUpdate) await db.upsertUser(userToUpdate);
    setUsers(updated);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditLogoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const saveCustomization = async () => {
    setIsSaving(true);
    const newConfig = {
      name: editAppName,
      logoUrl: editLogoUrl === DEFAULT_LOGO ? null : editLogoUrl.trim() || null,
      adminActivationTime: Number(editActivationTime)
    };

    const success = await db.updateRemoteAppSettings(newConfig);
    if (success) {
      setAppConfig({ ...newConfig, logoUrl: newConfig.logoUrl || DEFAULT_LOGO });
      alert('Configurações salvas e aplicadas para todos os usuários!');
    } else {
      alert('Erro ao salvar no Supabase.');
    }
    setIsSaving(false);
  };

  return (
    <Layout user={user} onLogout={onLogout} appConfig={appConfig}>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-3xl font-bold text-slate-900">Painel Administrativo Cloud</h2>
          <nav className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1 overflow-x-auto no-scrollbar">
            {['taxonomy', 'questions', 'users', 'customization'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid gap-8">
          {activeTab === 'taxonomy' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                <h3 className="text-lg font-bold text-slate-900">Disciplinas</h3>
                <div className="flex gap-2">
                  <input className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="Ex: Português" value={newSubName} onChange={(e) => setNewSubName(e.target.value)} />
                  <button onClick={handleAddSubject} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Adicionar</button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {subjects.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group">
                      <span className="font-medium text-slate-700">{s.name}</span>
                      <button onClick={() => handleRemoveSubject(s.id)} className="text-slate-300 hover:text-red-500 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                <h3 className="text-lg font-bold text-slate-900">Tópicos</h3>
                <div className="space-y-3">
                  <select value={targetSubId} onChange={(e) => setTargetSubId(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                    <option value="">Selecione a Disciplina...</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <input className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="Ex: Sintaxe" value={newTopName} onChange={(e) => setNewTopName(e.target.value)} />
                    <button onClick={handleAddTopic} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Adicionar</button>
                  </div>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {topics.filter(t => !targetSubId || t.subjectId === targetSubId).map(t => (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium text-slate-700 text-sm">{t.name}</span>
                      <button onClick={() => handleRemoveTopic(t.id)} className="text-slate-300 hover:text-red-500 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-6">
              <button onClick={() => setShowQForm(!showQForm)} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md">Nova Questão</button>
              {showQForm && (
                <div className="bg-white rounded-2xl border-2 border-indigo-100 p-8">
                  <form onSubmit={handleAddQuestion} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <select required value={qSubjectId} onChange={(e) => setQSubjectId(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border rounded-lg">
                        <option value="">Selecione Disciplina</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <select required value={qTopicId} onChange={(e) => setQTopicId(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border rounded-lg">
                        <option value="">Selecione Tópico</option>
                        {topics.filter(t => t.subjectId === qSubjectId).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                      <textarea required placeholder="Enunciado" className="w-full px-4 py-2 bg-slate-50 border rounded-lg" value={qStatement} onChange={(e) => setQStatement(e.target.value)} rows={4} />
                    </div>
                    <div className="space-y-4">
                      {qType === QuestionType.MULTIPLE_CHOICE ? (
                        qOptions.map((opt, i) => (
                          <div key={i} className="flex gap-2">
                            <input type="radio" name="correct" checked={qCorrect === i.toString()} onChange={() => setQCorrect(i.toString())} />
                            <input required className="flex-1 px-3 py-1 bg-slate-50 border rounded-lg" value={opt} onChange={e => {
                               const copy = [...qOptions];
                               copy[i] = e.target.value;
                               setQOptions(copy);
                            }} />
                          </div>
                        ))
                      ) : (
                        <div className="flex gap-4">
                           <button type="button" onClick={() => setQCorrect('True')} className={`flex-1 py-3 border rounded-xl font-bold ${qCorrect === 'True' ? 'bg-green-600 text-white' : 'text-green-600'}`}>CERTO</button>
                           <button type="button" onClick={() => setQCorrect('False')} className={`flex-1 py-3 border rounded-xl font-bold ${qCorrect === 'False' ? 'bg-red-600 text-white' : 'text-red-600'}`}>ERRADO</button>
                        </div>
                      )}
                      <textarea placeholder="Explicação (opcional)" className="w-full px-4 py-2 bg-slate-50 border rounded-lg" value={qExpl} onChange={(e) => setQExpl(e.target.value)} rows={3} />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold">Salvar na Nuvem</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl border p-6 space-y-6">
              <h3 className="text-lg font-bold text-slate-900">Alunos e Acessos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input className="px-4 py-2 bg-slate-50 border rounded-lg" placeholder="Email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} />
                <input className="px-4 py-2 bg-slate-50 border rounded-lg" placeholder="Senha" type="password" value={newUserPass} onChange={e => setNewUserPass(e.target.value)} />
                <button onClick={handleAddUser} className="bg-indigo-600 text-white rounded-lg font-bold">Criar Aluno</button>
              </div>
              <div className="divide-y">
                {users.map(u => (
                  <div key={u.id} className="flex justify-between py-3 items-center">
                    <div>
                      <p className="font-bold text-slate-800">{u.email}</p>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{u.role}</p>
                    </div>
                    <button onClick={() => toggleUserStatus(u.id)} className={`px-4 py-1.5 rounded-full text-xs font-bold ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.isActive ? 'Ativo' : 'Inativo'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'customization' && (
            <div className="max-w-2xl mx-auto bg-white p-8 border rounded-2xl space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Nome do App</label>
                <input className="w-full p-3 bg-slate-50 border rounded-xl" value={editAppName} onChange={e => setEditAppName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">URL da Logo</label>
                <input className="w-full p-3 bg-slate-50 border rounded-xl text-sm" value={editLogoUrl} onChange={e => setEditLogoUrl(e.target.value)} />
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-slate-400">Arraste uma imagem ou insira o link direto.</p>
                  <button onClick={() => setEditLogoUrl(DEFAULT_LOGO)} className="text-[10px] text-indigo-600 font-bold uppercase">Restaurar Padrão</button>
                </div>
              </div>
              <button onClick={saveCustomization} disabled={isSaving} className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {isSaving ? 'Salvando...' : 'Aplicar para Todos os Usuários'}
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
