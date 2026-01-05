
import React from 'react';
import { User, UserRole, AppConfig } from '../types';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_LOGO } from '../constants';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  hideNav?: boolean;
  appConfig: AppConfig;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, hideNav, appConfig }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNav && (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => navigate(user.role === UserRole.ADMIN ? '/admin' : '/dashboard')}
            >
              <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl group-hover:shadow-md transition-all overflow-hidden flex items-center justify-center">
                <img 
                  src={appConfig.logoUrl || DEFAULT_LOGO} 
                  alt="Logo" 
                  className="w-full h-full object-contain p-0.5" 
                />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{appConfig.name}</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-slate-900">{user.username}</p>
                <p className="text-xs text-slate-500">{user.role === UserRole.ADMIN ? 'Administrador' : 'Estudante'}</p>
              </div>
              <button 
                onClick={onLogout}
                className="text-slate-500 hover:text-red-600 transition-colors p-2"
                title="Sair"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </header>
      )}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} {appConfig.name}. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default Layout;
