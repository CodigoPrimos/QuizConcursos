
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole, Subject, Topic, Question, Comment, AuthState, AppConfig } from './types';
import { INITIAL_SUBJECTS, INITIAL_TOPICS, INITIAL_QUESTIONS, APP_NAME, DEFAULT_LOGO } from './constants';
import { getRemoteAppSettings } from './services/supabase';

// Views
import AuthPage from './views/AuthPage';
import StudentDashboard from './views/StudentDashboard';
import AdminDashboard from './views/AdminDashboard';
import QuestionView from './views/QuestionView';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const saved = localStorage.getItem('qc_auth');
    return saved ? JSON.parse(saved) : { user: null, isAuthenticated: false };
  });

  const [appConfig, setAppConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('qc_config');
    // Default config with 5s activation time and the new QC logo
    return saved ? JSON.parse(saved) : { name: APP_NAME, logoUrl: DEFAULT_LOGO, adminActivationTime: 5 };
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('qc_users');
    if (saved) return JSON.parse(saved);
    return [{
      id: 'admin1',
      email: 'admin@quizconcurso.com',
      username: 'Administrador Principal',
      password: 'admin',
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: Date.now()
    }];
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('qc_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [topics, setTopics] = useState<Topic[]>(() => {
    const saved = localStorage.getItem('qc_topics');
    return saved ? JSON.parse(saved) : INITIAL_TOPICS;
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('qc_questions');
    return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('qc_comments');
    return saved ? JSON.parse(saved) : [];
  });

  // Efeito para carregar configurações do Supabase ao iniciar
  useEffect(() => {
    const loadRemoteConfig = async () => {
      const remoteConfig = await getRemoteAppSettings();
      if (remoteConfig) {
        setAppConfig(remoteConfig);
      }
    };
    loadRemoteConfig();
  }, []);

  useEffect(() => {
    localStorage.setItem('qc_auth', JSON.stringify(authState));
    localStorage.setItem('qc_users', JSON.stringify(users));
    localStorage.setItem('qc_subjects', JSON.stringify(subjects));
    localStorage.setItem('qc_topics', JSON.stringify(topics));
    localStorage.setItem('qc_questions', JSON.stringify(questions));
    localStorage.setItem('qc_comments', JSON.stringify(comments));
    localStorage.setItem('qc_config', JSON.stringify(appConfig));
  }, [authState, users, subjects, topics, questions, comments, appConfig]);

  const login = (user: User) => {
    setAuthState({ user, isAuthenticated: true });
  };

  const logout = () => {
    setAuthState({ user: null, isAuthenticated: false });
  };

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
                setComments={setComments}
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
                setUsers={setUsers}
                subjects={subjects}
                setSubjects={setSubjects}
                topics={topics}
                setTopics={setTopics}
                questions={questions}
                setQuestions={setQuestions}
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
