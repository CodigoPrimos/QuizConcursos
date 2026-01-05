
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole, Subject, Topic, Question, Comment, AuthState, AppConfig } from './types';
import { INITIAL_SUBJECTS, INITIAL_TOPICS, INITIAL_QUESTIONS, APP_NAME, DEFAULT_LOGO } from './constants';
import * as db from './services/supabase';

// Fix: Adding missing imports for view components
import AuthPage from './views/AuthPage';
import StudentDashboard from './views/StudentDashboard';
import QuestionView from './views/QuestionView';
import AdminDashboard from './views/AdminDashboard';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [authState, setAuthState] = useState<AuthState>(() => {
    const saved = localStorage.getItem('qc_auth');
    return saved ? JSON.parse(saved) : { user: null, isAuthenticated: false };
  });

  const [appConfig, setAppConfig] = useState<AppConfig>({ 
    name: APP_NAME, 
    logoUrl: DEFAULT_LOGO, 
    adminActivationTime: 5 
  });

  const [users, setUsers] = useState<User[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  // Carregamento Inicial Universal (Supabase)
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        const [
          remoteConfig,
          remoteUsers,
          remoteSubjects,
          remoteTopics,
          remoteQuestions,
          remoteComments
        ] = await Promise.all([
          db.getRemoteAppSettings(),
          db.fetchUsers(),
          db.fetchSubjects(),
          db.fetchTopics(),
          db.fetchQuestions(),
          db.fetchComments()
        ]);

        if (remoteConfig) setAppConfig(remoteConfig);
        
        // Se o banco estiver vazio, mantém os iniciais (opcional)
        setUsers(remoteUsers.length > 0 ? remoteUsers : [{
          id: 'admin1',
          email: 'admin@quizconcurso.com',
          username: 'Administrador Principal',
          password: 'admin',
          role: UserRole.ADMIN,
          isActive: true,
          createdAt: Date.now()
        }]);
        
        setSubjects(remoteSubjects.length > 0 ? remoteSubjects : INITIAL_SUBJECTS);
        setTopics(remoteTopics.length > 0 ? remoteTopics : INITIAL_TOPICS);
        setQuestions(remoteQuestions.length > 0 ? remoteQuestions : INITIAL_QUESTIONS);
        setComments(remoteComments);
      } catch (err) {
        console.error("Erro ao sincronizar com Supabase:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Persistência do estado de Login (Local apenas para sessão)
  useEffect(() => {
    localStorage.setItem('qc_auth', JSON.stringify(authState));
  }, [authState]);

  const login = (user: User) => {
    setAuthState({ user, isAuthenticated: true });
  };

  const logout = () => {
    setAuthState({ user: null, isAuthenticated: false });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-medium animate-pulse">Sincronizando com a nuvem...</p>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            !authState.isAuthenticated ? (
              <AuthPage users={users} onLogin={login} appConfig={appConfig} />
            ) : authState.user?.role === UserRole.ADMIN ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />

        <Route 
          path="/admin-portal" 
          element={<AuthPage users={users} onLogin={login} adminOnly appConfig={appConfig} />} 
        />

        <Route 
          path="/dashboard" 
          element={
            authState.isAuthenticated && authState.user?.role === UserRole.STUDENT ? (
              <StudentDashboard 
                user={authState.user} 
                onLogout={logout} 
                questions={questions}
                subjects={subjects}
                topics={topics}
                appConfig={appConfig}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        <Route 
          path="/question/:id" 
          element={
            authState.isAuthenticated ? (
              <QuestionView 
                user={authState.user!} 
                questions={questions}
                subjects={subjects}
                topics={topics}
                comments={comments}
                setComments={(updatedComments: any) => {
                  // Lógica para salvar novo comentário no banco
                  if (typeof updatedComments === 'function') {
                    const current = updatedComments(comments);
                    const newest = current[current.length - 1];
                    db.upsertComment(newest);
                    setComments(current);
                  } else {
                    setComments(updatedComments);
                  }
                }}
                appConfig={appConfig}
                onLogout={logout}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        <Route 
          path="/admin" 
          element={
            authState.isAuthenticated && authState.user?.role === UserRole.ADMIN ? (
              <AdminDashboard 
                user={authState.user} 
                onLogout={logout}
                users={users}
                setUsers={(u: any) => {
                   const result = typeof u === 'function' ? u(users) : u;
                   // Simples sincronização ao alterar usuários
                   setUsers(result);
                }}
                subjects={subjects}
                setSubjects={(s: any) => {
                  const result = typeof s === 'function' ? s(subjects) : s;
                  setSubjects(result);
                }}
                topics={topics}
                setTopics={(t: any) => {
                  const result = typeof t === 'function' ? t(topics) : t;
                  setTopics(result);
                }}
                questions={questions}
                setQuestions={(q: any) => {
                   const result = typeof q === 'function' ? q(questions) : q;
                   setQuestions(result);
                }}
                comments={comments}
                setComments={setComments}
                appConfig={appConfig}
                setAppConfig={setAppConfig}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
      </Routes>
    </HashRouter>
  );
};

export default App;
