import React, { useState, useRef } from 'react';
import { User, Subject, Topic, Question, Comment, UserRole, QuestionType, QuestionOrigin, AppConfig } from '../types';
import Layout from '../components/Layout';
import { updateRemoteAppSettings } from '../services/supabase';
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

  // Question Form State
  const [showQForm, setShowQForm] = useState(false);
  const [qSubjectId, setQSubjectId] = useState('');
  const [qTopicId, setQTopicId] = useState('');
  const [qStatement, setQStatement] = useState('');
  const [qType, setQType] = useState<QuestionType>(QuestionType.MULTIPLE_CHOICE);
  const [qOrigin, setQOrigin] = useState<QuestionOrigin>(QuestionOrigin.AUTORAL);
  const [qOptions, setQOptions] = useState<string[]>(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState('');
  const [qExpl, setQExpl] = useState('');

  // Taxonomy Form State
  const [newSubName, setNewSubName] = useState('');
  const [newTopName, setNewTopName] = useState('');
  const [targetSubId, setTargetSubId] = useState('');

  // User Form State
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Customization Form State
  const [editAppName, setEditAppName] = useState(appConfig.name);
  const [editLogoUrl, setEditLogoUrl] = useState(appConfig.logoUrl || '');
  const [editActivationTime, setEditActivationTime] = useState(appConfig.adminActivationTime || 5);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddQuestion = (e: React.FormEvent) => {
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
    setQuestions(prev => [newQ, ...prev]);
    setShowQForm(false);
    resetQForm();
  };

  const resetQForm = () => {
    setQSubjectId(''); setQTopicId(''); setQStatement(''); setQOptions(['', '', '', '']); setQCorrect(''); setQExpl('');
  };

  const handleAddSubject = () => {
    if (!newSubName.trim()) return;
    setSubjects(prev => [...prev, { id: 's' + Date.now(), name: newSubName }]);
    setNewSubName('');
  };

  const handleAddTopic = () => {
    if (!newTopName.trim() || !targetSubId) return;
    setTopics(prev => [...prev, { id: 't' + Date.now(), name: newTopName, subjectId: targetSubId }]);
    setNewTopName('');
  };

  const handleAddUser = () => {
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
    setUsers(prev => [...prev, newUser]);
    setNewUserEmail(''); setNewUserPass(''); setNewUserName('');
  };

  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    if (userToDelete.role === UserRole.ADMIN) {
      alert("Este usuário não pode ser removido.");
      setUserToDelete(null);
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
    setUserToDelete(null);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRestoreDefaultLogo = () => {
    setEditLogoUrl(DEFAULT_LOGO);
  };

  const saveCustomization = async () => {
    setIsSaving(true);
    const newConfig = {
      name: editAppName,
      logoUrl: editLogoUrl === DEFAULT_LOGO ? null : editLogoUrl.trim() || null,
      adminActivationTime: Number(editActivationTime)
    };

    const success = await updateRemoteAppSettings(newConfig);
    
    if (success) {
      // Se salvou com sucesso, garantimos que a URL refletida no estado local seja consistente
      setAppConfig({
        ...newConfig,
        logoUrl: newConfig.logoUrl || DEFAULT_LOGO
      });
      alert('Configurações salvas no servidor com sucesso!');
    } else {
      setAppConfig({
        ...newConfig,
        logoUrl: newConfig.logoUrl || DEFAULT_LOGO
      });
      alert('Configurações salvas localmente. Erro ao sincronizar com o banco de dados.');
    }
    setIsSaving(false);
  };

  return (
    <Layout user={user} onLogout={onLogout} appConfig={appConfig}>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-3xl font-bold text-slate-900">Painel de Controle</h2>
          <nav className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'taxonomy', label: 'Disciplinas' },
              { id: 'questions', label: 'Questões' },
              { id: 'users', label: 'Usuários' },
              { id: 'comments', label: 'Moderação' },
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
                      <button onClick={() => setSubjects(prev => prev.filter(x => x.id !== s.id))} className="text-slate-300 hover:text-red-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg></button>
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
                      <div className="flex flex-col"><span className="font-medium text-slate-700 text-sm">{t.name}</span><span className="text-[10px] text-slate-400 font-bold uppercase">{subjects.find(s => s.id === t.subjectId)?.name}</span></div>
                      <button onClick={() => setTopics(prev => prev.filter(x => x.id !== t.id))} className="text-slate-300 hover:text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">Gerenciamento de Questões</h3>
                <button onClick={() => setShowQForm(!showQForm)} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 transition-all hover:bg-slate-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                  Nova Questão
                </button>
              </div>

              {showQForm && (
                <div className="bg-white rounded-2xl border-2 border-indigo-100 p-8 animate-in slide-in-from-top">
                  <form onSubmit={handleAddQuestion} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Disciplina</label>
                          <select required value={qSubjectId} onChange={(e) => setQSubjectId(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none">
                            <option value="">Selecione...</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tópico</label>
                          <select required value={qTopicId} onChange={(e) => setQTopicId(e.target.value)} disabled={!qSubjectId} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none disabled:opacity-50">
                            <option value="">Selecione...</option>
                            {topics.filter(t => t.subjectId === qSubjectId).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Modalidade</label>
                          <select value={qType} onChange={(e) => setQType(e.target.value as any)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none">
                            <option value={QuestionType.MULTIPLE_CHOICE}>Múltipla Escolha</option>
                            <option value={QuestionType.TRUE_FALSE}>Certo/Errado</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Origem</label>
                          <select value={qOrigin} onChange={(e) => setQOrigin(e.target.value as any)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none">
                            <option value={QuestionOrigin.AUTORAL}>Autoral</option>
                            <option value={QuestionOrigin.CONCURSO}>Concurso Público</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Enunciado</label>
                        <textarea required value={qStatement} onChange={(e) => setQStatement(e.target.value)} rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none" placeholder="Enunciado da questão..." />
                      </div>
                    </div>
                    <div className="space-y-4">
                      {qType === QuestionType.MULTIPLE_CHOICE ? (
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Alternativas</label>
                          {qOptions.map((opt, i) => (
                            <div key={i} className="flex gap-2 items-center">
                              <input type="radio" name="correct" checked={qCorrect === i.toString()} onChange={() => setQCorrect(i.toString())} />
                              <input required className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={opt} onChange={(e) => {
                                const copy = [...qOptions];
                                copy[i] = e.target.value;
                                setQOptions(copy);
                              }} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex gap-4">
                          <button type="button" onClick={() => setQCorrect('True')} className={`flex-1 py-4 border-2 rounded-xl font-bold ${qCorrect === 'True' ? 'bg-green-600 text-white' : 'text-green-600'}`}>CERTO</button>
                          <button type="button" onClick={() => setQCorrect('False')} className={`flex-1 py-4 border-2 rounded-xl font-bold ${qCorrect === 'False' ? 'bg-red-600 text-white' : 'text-red-600'}`}>ERRADO</button>
                        </div>
                      )}
                      <textarea value={qExpl} onChange={(e) => setQExpl(e.target.value)} rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none" placeholder="Explicação..." />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold">Salvar Questão</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* User management UI */}
             </div>
          )}

          {activeTab === 'customization' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                   </div>
                   <div>
                     <h3 className="text-xl font-bold text-slate-900">Configurações do App</h3>
                     <p className="text-sm text-slate-500">Personalize o nome, a logo e a segurança de acesso.</p>
                   </div>
                </div>

                <div className="space-y-6 pt-4 border-t border-slate-100">
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Nome do Aplicativo</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="Ex: QuizConcurso Premium"
                      value={editAppName}
                      onChange={(e) => setEditAppName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Logo do Aplicativo</label>
                      <button 
                        onClick={handleRestoreDefaultLogo}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-tight"
                      >
                        Restaurar Logo Padrão
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div 
                        className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-300 transition-all group bg-slate-50/50"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleLogoUpload} 
                        />
                        <svg className="w-10 h-10 text-slate-300 group-hover:text-indigo-400 transition-colors mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <p className="text-xs font-bold text-slate-500">Upload do PC</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Ou use uma URL:</p>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-xs"
                          placeholder="https://sua-logo.com/image.png"
                          value={editLogoUrl}
                          onChange={(e) => setEditLogoUrl(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Segurança de Acesso (Modo Oculto)</label>
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                       <div className="flex-1">
                         <p className="text-sm font-bold text-slate-700">Tempo de ativação (segundos)</p>
                         <p className="text-[10px] text-slate-500">Tempo pressionando a logo na tela de login para ativar o Modo Admin.</p>
                       </div>
                       <input 
                         type="number" 
                         min="1"
                         max="60"
                         className="w-20 px-3 py-2 bg-white border border-slate-300 rounded-lg text-center font-bold outline-none"
                         value={editActivationTime}
                         onChange={(e) => setEditActivationTime(Number(e.target.value))}
                       />
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Pré-visualização</h4>
                    <div className="flex items-center gap-4">
                       <div className="w-16 h-16 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-center overflow-hidden">
                         <img src={editLogoUrl || DEFAULT_LOGO} alt="Preview" className="w-full h-full object-contain" />
                       </div>
                       <div>
                         <p className="font-bold text-slate-800 text-base">{editAppName || 'QuizConcurso'}</p>
                         <p className="text-[10px] text-slate-400">Ativação oculta: {editActivationTime}s</p>
                       </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button 
                      onClick={saveCustomization}
                      disabled={isSaving}
                      className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 disabled:bg-slate-400 transition-all flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                      )}
                      {isSaving ? 'Salvando...' : 'Salvar Todas as Configurações'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
               {/* Comment moderation UI */}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;