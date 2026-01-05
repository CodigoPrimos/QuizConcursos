
import React from 'react';
import { User, UserRole, AppConfig } from '../types';
import { useNavigate } from 'react-router-dom';

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
              <div className="bg-indigo-600 text-white p-1 rounded-lg group-hover:bg-indigo-700 transition-colors overflow-hidden">
                {appConfig.logoUrl ? (
                  <img src={appConfig.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
                ) : (
                  <div className="p-1">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
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
