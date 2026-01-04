
import React, { useState, useRef } from 'react';
import { User, UserRole, AppConfig } from '../types';

interface AuthPageProps {
  users: User[];
  onLogin: (user: User) => void;
  adminOnly?: boolean;
  appConfig: AppConfig;
}

const AuthPage: React.FC<AuthPageProps> = ({ users, onLogin, adminOnly = false, appConfig }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(adminOnly);
  const [pressStartTime, setPressStartTime] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Use configurable time (defaulting to 5 if not set correctly)
  const REQUIRED_PRESS_TIME = (appConfig.adminActivationTime || 5) * 1000;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      if (!user.isActive) {
        setError('Sua conta está desativada. Entre em contato com o administrador.');
        return;
      }
      
      if (isAdminMode && user.role !== UserRole.ADMIN) {
        setError('Acesso restrito a administradores.');
        return;
      }

      if (!isAdminMode && user.role === UserRole.ADMIN) {
        setError('Por favor, utilize o acesso administrativo oculto.');
        return;
      }

      onLogin(user);
    } else {
      setError('Credenciais inválidas. Tente novamente.');
    }
  };

  const startPress = () => {
    if (isAdminMode) return;
    setPressStartTime(Date.now());
    setProgress(0);
    
    timerRef.current = window.setInterval(() => {
      setProgress(prev => {
        const next = prev + (100 / (REQUIRED_PRESS_TIME / 100));
        return next > 100 ? 100 : next;
      });
    }, 100);

    const timeout = window.setTimeout(() => {
      setIsAdminMode(true);
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(0);
      setPressStartTime(null);
    }, REQUIRED_PRESS_TIME);

    (timerRef as any).currentTimeout = timeout;
  };

  const endPress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if ((timerRef as any).currentTimeout) clearTimeout((timerRef as any).currentTimeout);
    setProgress(0);
    setPressStartTime(null);
  };

  const revertToStudent = () => {
    setIsAdminMode(false);
    setError('');
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-700 ${isAdminMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className={`w-full max-w-md rounded-2xl shadow-2xl p-8 space-y-8 transition-all duration-500 border-2 ${isAdminMode ? 'bg-slate-900 border-indigo-900 text-white' : 'bg-white border-transparent text-slate-900'}`}>
        <div className="text-center space-y-2 relative">
          <div 
            className={`mx-auto w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg cursor-pointer overflow-hidden transition-all duration-500 active:scale-95 select-none relative ${isAdminMode ? 'bg-slate-800' : 'bg-indigo-600'}`}
            onMouseDown={startPress}
            onMouseUp={endPress}
            onMouseLeave={endPress}
            onTouchStart={startPress}
            onTouchEnd={endPress}
          >
            {pressStartTime && !isAdminMode && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-full border-4 border-indigo-400 opacity-30 rounded-full animate-pulse"></div>
              </div>
            )}
            
            {appConfig.logoUrl ? (
              <img src={appConfig.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <svg className={`w-14 h-14 ${isAdminMode ? 'text-indigo-400' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            )}
          </div>
          
          <h1 className={`text-3xl font-bold transition-colors ${isAdminMode ? 'text-white' : 'text-slate-900'}`}>
            {appConfig.name}
          </h1>
          <p className={isAdminMode ? 'text-indigo-300 font-bold tracking-widest uppercase text-xs' : 'text-slate-500'}>
            {isAdminMode ? '🛡️ Acesso do Administrador' : 'Faça login para continuar seus estudos'}
          </p>

          {isAdminMode && (
            <button 
              onClick={revertToStudent}
              className="mt-4 text-xs text-slate-400 hover:text-indigo-300 transition-colors underline decoration-dotted underline-offset-4 block mx-auto"
            >
              Você não é Administrador? Clique aqui.
            </button>
          )}
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className={`border px-4 py-3 rounded-lg text-sm transition-all ${isAdminMode ? 'bg-red-900/20 border-red-800 text-red-200' : 'bg-red-50 border-red-200 text-red-600'}`}>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className={`block text-xs font-bold uppercase mb-1 tracking-wider ${isAdminMode ? 'text-slate-400' : 'text-slate-700'}`}>E-mail</label>
              <input 
                type="email"
                required
                className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none border ${
                  isAdminMode 
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase mb-1 tracking-wider ${isAdminMode ? 'text-slate-400' : 'text-slate-700'}`}>Senha</label>
              <input 
                type="password"
                required
                className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none border ${
                  isAdminMode 
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            className={`w-full font-bold py-4 rounded-xl transform hover:-translate-y-0.5 transition-all shadow-xl ${
              isAdminMode 
                ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-900/20' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isAdminMode ? 'Entrar no Painel' : 'Acessar Questões'}
          </button>
        </form>

        <div className="pt-4 text-center">
          <p className={`text-[10px] uppercase tracking-tighter ${isAdminMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {isAdminMode 
              ? 'Área restrita. Atividades monitoradas.' 
              : 'Acesso restrito a alunos autorizados.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
