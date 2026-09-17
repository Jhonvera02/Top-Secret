import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { RevealPage } from './pages/RevealPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { SystemStatus } from './types.ts';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'register' | 'reveal' | 'admin'>('register');
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);

  // Leer token de la URL (hash o query param) o localStorage al inicio
  useEffect(() => {
    const parseUrlToken = () => {
      // 1. Verificar hash: #token=xxxx o #xxxx
      const hash = window.location.hash;
      if (hash) {
        if (hash.startsWith('#token=')) {
          return hash.replace('#token=', '').trim();
        } else if (hash.startsWith('#amigo/')) {
          return hash.replace('#amigo/', '').trim();
        } else if (hash.length > 1 && !hash.includes('/')) {
          return hash.substring(1).trim();
        }
      }

      // 2. Verificar search params: ?token=xxxx
      const params = new URLSearchParams(window.location.search);
      if (params.get('token')) {
        return params.get('token')!.trim();
      }

      // 3. Fallback a localStorage
      return localStorage.getItem('amigo_secreto_token');
    };

    const token = parseUrlToken();
    if (token) {
      setActiveToken(token);
      setCurrentTab('reveal');
    }

    fetchStatus();

    // Listener para cambios de hash
    const handleHashChange = () => {
      const updatedToken = parseUrlToken();
      if (updatedToken) {
        setActiveToken(updatedToken);
        setCurrentTab('reveal');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        // Si el sorteo ya se hizo y no tenemos token, y la pestaña actual es registro, podemos sugerir ver amigo
        if (data.isLocked && currentTab === 'register' && !activeToken) {
          setCurrentTab('reveal');
        }
      }
    } catch (err) {
      console.error('Error al obtener estado:', err);
    }
  };

  const handleRegistered = (token: string) => {
    setActiveToken(token);
    window.location.hash = `token=${token}`;
    setCurrentTab('reveal');
    fetchStatus();
  };

  const handleSelectToken = (token: string) => {
    setActiveToken(token);
    window.location.hash = `token=${token}`;
    localStorage.setItem('amigo_secreto_token', token);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-fuchsia-500 selection:text-white relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="fixed top-[-10%] left-[20%] w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-[40%] right-[10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-[30%] w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        status={status}
        activeToken={activeToken}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4">
        {currentTab === 'register' && (
          <RegisterPage status={status} onRegistered={handleRegistered} />
        )}

        {currentTab === 'reveal' && (
          <RevealPage token={activeToken} onSelectToken={handleSelectToken} />
        )}

        {currentTab === 'admin' && (
          <AdminPage onStatusChange={fetchStatus} />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-6 border-t border-white/5 text-center text-xs text-slate-500 mt-auto">
        <p>
          🎁 <strong className="text-slate-400">Amigo Secreto — Top Secret</strong> • Asignación confidencial de personajes y gustos
        </p>
      </footer>
    </div>
  );
};

export default App;
