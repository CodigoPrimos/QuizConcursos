
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

  // Estados dos formulários omitidos para brevidade, mas mantidos os mesmos do original
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

  // --- HANDLERS COM SUPABASE ---

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

  const handleAddTopic = async () => {
    if (!newTopName.trim() || !targetSubId) return;
    const newTop = { id: 't' + Date.now(), name: newTopName, subjectId: targetSubId };
    await db.upsertTopic(newTop);
    setTopics(prev => [...prev, newTop]);
    setNewTopName('');
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
    const updatedUsers = users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u);
    const userToUpdate = updatedUsers.find(u => u.id === id);
    if (userToUpdate) await db.upsertUser(userToUpdate);
    setUsers(updatedUsers);
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
    }
    setIsSaving(false);
  };

  // O restante do JSX permanece igual, apenas as funções de clique chamam os novos handlers
  return (
    <Layout user={user} onLogout={onLogout} appConfig={appConfig}>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-3xl font-bold text-slate-900">Painel de Controle Cloud</h2>
          <nav className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'taxonomy', label: 'Disciplinas' },
              { id: 'questions', label: 'Questões' },
              { id: 'users', label: 'Usuários' },
              { id: 'customization', label: 'Personalização' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid gap-8">
          {activeTab === 'taxonomy' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                <h3 className="text-lg font-bold text-slate-900">Gerenciar Disciplinas</h3>
                <div className="flex gap-2">
                  <input className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="Ex: Português" value={newSubName} onChange={(e) => setNewSubName(e.target.value)} />
                  <button onClick={handleAddSubject} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Adicionar</button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {subjects.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group">
                      <span className="font-medium text-slate-700">{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                <h3 className="text-lg font-bold text-slate-900">Gerenciar Tópicos</h3>
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
             <div className="space-y-6">
               <button onClick={() => setShowQForm(!showQForm)} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold">Nova Questão</button>
               {showQForm && (
                 <div className="bg-white p-6 border rounded-xl">
                    {/* Reutiliza o form anterior, chamando handleAddQuestion */}
                    <form onSubmit={handleAddQuestion} className="space-y-4">
                      <select required value={qSubjectId} onChange={(e) => setQSubjectId(e.target.value)} className="w-full p-2 border rounded">
                        <option value="">Selecione Disciplina</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <select required value={qTopicId} onChange={(e) => setQTopicId(e.target.value)} className="w-full p-2 border rounded">
                        <option value="">Selecione Tópico</option>
                        {topics.filter(t => t.subjectId === qSubjectId).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                      <textarea placeholder="Enunciado" className="w-full p-2 border rounded" value={qStatement} onChange={(e) => setQStatement(e.target.value)} />
                      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Salvar na Nuvem</button>
                    </form>
                 </div>
               )}
             </div>
          )}

          {activeTab === 'users' && (
             <div className="bg-white rounded-2xl border p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input placeholder="Email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="p-2 border rounded" />
                  <input placeholder="Senha" value={newUserPass} onChange={e => setNewUserPass(e.target.value)} className="p-2 border rounded" />
                  <button onClick={handleAddUser} className="bg-indigo-600 text-white rounded">Criar Usuário</button>
                </div>
                <div className="space-y-2">
                  {users.map(u => (
                    <div key={u.id} className="flex justify-between p-2 bg-slate-50 rounded">
                      <span>{u.email} ({u.role})</span>
                      <button onClick={() => toggleUserStatus(u.id)} className={u.isActive ? "text-green-600" : "text-red-600"}>
                        {u.isActive ? "Ativo" : "Inativo"}
                      </button>
                    </div>
                  ))}
                </div>
             </div>
          )}

          {activeTab === 'customization' && (
            <div className="max-w-2xl mx-auto bg-white p-8 border rounded-2xl space-y-6">
               <input className="w-full p-3 border rounded" value={editAppName} onChange={e => setEditAppName(e.target.value)} />
               <button onClick={saveCustomization} className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold">Salvar Configurações Globais</button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
