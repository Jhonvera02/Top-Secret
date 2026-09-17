import React, { useState } from 'react';
import { Gift, Shield, UserPlus, Sparkles, KeyRound, QrCode } from 'lucide-react';
import { SystemStatus } from '../types.ts';

interface NavbarProps {
  currentTab: 'register' | 'reveal' | 'admin';
  setCurrentTab: (tab: 'register' | 'reveal' | 'admin') => void;
  status: SystemStatus | null;
  activeToken: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  status,
  activeToken,
}) => {
  const [showQrModal, setShowQrModal] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => setCurrentTab(activeToken ? 'reveal' : 'register')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/20 group-hover:scale-105 transition-transform">
            <Gift className="w-5 h-5 text-white animate-bounce-slow" />
          </div>
          <div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-gradient">
              Amigo Secreto
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-800/60">
              Top Secret 🦸
            </span>
          </div>
        </div>

        {/* Status Pill */}
        <div className="hidden md:flex items-center gap-2">
          {status?.isLocked ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Sorteo Realizado (Asignaciones Bloqueadas)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Inscripciones Abiertas ({status?.totalParticipants ?? 0} registrados)
            </span>
          )}
        </div>

        {/* Nav actions */}
        <nav className="flex items-center gap-2">
          {!status?.isLocked && (
            <button
              onClick={() => setCurrentTab('register')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentTab === 'register'
                  ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Inscribirme</span>
            </button>
          )}

          {activeToken && (
            <button
              onClick={() => setCurrentTab('reveal')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentTab === 'reveal'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Mi Amigo</span>
            </button>
          )}

          <button
            onClick={() => setShowQrModal(true)}
            title="Abrir en celular con código QR"
            className="p-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60"
          >
            <QrCode className="w-4 h-4 text-fuchsia-400" />
            <span className="hidden sm:inline">📱 QR Celular</span>
          </button>

          <button
            onClick={() => setCurrentTab('admin')}
            title="Panel de Organizador"
            className={`p-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              currentTab === 'admin'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Organizador</span>
          </button>
        </nav>
      </div>

      {/* Modal QR Code */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-white/20 shadow-2xl text-center animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-white text-base flex items-center gap-2">
                <QrCode className="w-5 h-5 text-fuchsia-400" /> Escanear con tu Celular
              </span>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-white text-sm p-1"
              >
                ✕
              </button>
            </div>
            <p className="text-slate-300 text-xs mb-4">
              Apunta la cámara de tu iPhone o Android a este código para abrir la app al instante sin escribir la dirección:
            </p>

            <div className="bg-white p-2.5 rounded-2xl inline-block shadow-lg mb-3 border border-slate-200">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                  window.location.origin
                )}`}
                alt="Código QR Amigo Secreto"
                className="w-36 h-36 mx-auto"
              />
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-white/10 text-xs font-mono text-slate-300 break-all mb-4">
              {window.location.origin}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin);
                  alert('¡Enlace copiado al portapapeles!');
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Copiar Enlace
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="py-2 px-4 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
