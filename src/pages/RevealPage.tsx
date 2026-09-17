import React, { useEffect, useState } from 'react';
import { Sparkles, Gift, Candy, Users, Eye, EyeOff, AlertTriangle, ShieldCheck, Lock, Clock, HeartHandshake } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RevealResponse } from '../types.ts';
import { CharacterBadge } from '../components/CharacterBadge.tsx';

interface RevealPageProps {
  token: string | null;
  onSelectToken: (token: string) => void;
}

export const RevealPage: React.FC<RevealPageProps> = ({ token, onSelectToken }) => {
  const [inputToken, setInputToken] = useState(token || '');
  const [data, setData] = useState<RevealResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  // Cargar datos cuando cambie el token
  useEffect(() => {
    if (!token) return;
    setInputToken(token);
    loadRevealData(token);
  }, [token]);

  const loadRevealData = async (activeToken: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/reveal/${activeToken.trim()}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'No se pudo cargar la información del enlace privado.');
      }

      setData(json);
    } catch (err: any) {
      setError(err.message || 'Enlace inválido o expirado.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleManualLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputToken.trim()) return;
    onSelectToken(inputToken.trim());
    loadRevealData(inputToken.trim());
  };

  const handleRevealClick = () => {
    setIsRevealed(true);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });
  };

  // Si no hay token provisto
  if (!token && !data) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 text-center shadow-2xl">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Acceso a Enlace Privado</h2>
          <p className="text-slate-300 text-sm mb-6">
            Pega tu token o código privado que recibiste al inscribirte o que te envió el organizador.
          </p>

          <form onSubmit={handleManualLookup} className="space-y-4">
            <input
              type="text"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              placeholder="Pega tu token aquí..."
              className="w-full bg-slate-900/90 border border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-3 text-slate-100 text-sm font-mono outline-none"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30"
            >
              Consultar mi Amigo Secreto
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="w-10 h-10 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-300 text-sm">Cargando tus datos confidenciales...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="glass-panel rounded-3xl p-6 border border-rose-500/30 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Enlace no encontrado</h3>
          <p className="text-slate-300 text-sm mb-4">{error}</p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => {
                setError(null);
                setInputToken('');
                localStorage.removeItem('amigo_secreto_token');
                window.location.hash = '';
                window.location.reload();
              }}
              className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-semibold rounded-xl"
            >
              Ir a Inscripciones
            </button>
            <button
              onClick={() => {
                setError(null);
                setInputToken('');
                localStorage.removeItem('amigo_secreto_token');
                window.location.hash = '';
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
            >
              Intentar con otro código
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { participant, isRaffleCompleted, assignedFriend } = data;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* 1. Header con identidad del usuario */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-fuchsia-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Tu Identidad de Participante
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              ¡Hola, {participant.name}!
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Género registrado: <span className="text-slate-200 font-medium">{participant.gender}</span>
            </p>
          </div>

          <div className="flex-shrink-0 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-400 block mb-1">
              Tu personaje asignado:
            </span>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10">
              <span className="text-2xl">{participant.character.avatarEmoji}</span>
              <span className="font-bold text-sm text-white">{participant.character.name}</span>
            </div>
          </div>
        </div>

        {/* Recordatorio de gustos propios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-2">
          <div className="bg-slate-900/40 rounded-2xl p-3.5 border border-white/5">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
              <Candy className="w-3.5 h-3.5 text-amber-400" /> Lo que pediste de endulzada:
            </span>
            <p className="text-xs sm:text-sm text-slate-200 italic">"{participant.sweetWish}"</p>
          </div>
          <div className="bg-slate-900/40 rounded-2xl p-3.5 border border-white/5">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
              <Gift className="w-3.5 h-3.5 text-fuchsia-400" /> Lo que pediste de regalo final:
            </span>
            <p className="text-xs sm:text-sm text-slate-200 italic">"{participant.giftWish}"</p>
          </div>
        </div>
      </div>

      {/* 2. Sección del Amigo Secreto Asignado */}
      {!isRaffleCompleted ? (
        // Aún no hay sorteo
        <div className="glass-panel rounded-3xl p-8 border border-amber-500/20 text-center shadow-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            El Sorteo Aún No Se Ha Realizado
          </h2>
          <p className="text-slate-300 text-sm max-w-lg mx-auto mb-4">
            El organizador está esperando a que todos los participantes terminen de inscribirse.
            Guarda este enlace en tus favoritos. En cuanto se realice el sorteo, verás aquí
            el personaje asignado que te tocará endulzar y regalar.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-400">
            <span>🔗 Tu enlace está activo y seguro</span>
          </div>
        </div>
      ) : !assignedFriend ? (
        <div className="glass-panel rounded-3xl p-8 text-center text-rose-300">
          Ocurrió un inconveniente al cargar tu asignación. Por favor consulta con el organizador.
        </div>
      ) : !isRevealed ? (
        // Sorteo listo pero tarjeta oculta para dramatismo
        <div className="glass-panel rounded-3xl p-8 border border-fuchsia-500/30 text-center relative overflow-hidden shadow-2xl">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-fuchsia-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-fuchsia-500/30 animate-bounce-slow">
            <Gift className="w-10 h-10" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> ¡Sorteo Completado!
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            ¡Tu Amigo Secreto Ya Está Listo!
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-md mx-auto mb-6">
            El sistema ha emparejado a todos. ¿Listo para conocer a quién te tocó endulzar y regalar?
          </p>

          <button
            onClick={handleRevealClick}
            className="py-4 px-8 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-extrabold text-lg shadow-xl shadow-fuchsia-600/40 hover:scale-105 transition-all cursor-pointer inline-flex items-center gap-3"
          >
            <Eye className="w-6 h-6" />
            <span>Toca aquí para Revelar tu Asignación</span>
          </button>
        </div>
      ) : (
        // ASIGNACIÓN REVELADA CON ÉXITO
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-fuchsia-500/40 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="absolute top-0 right-0 w-80 h-80 bg-fuchsia-500/15 rounded-full blur-3xl -z-10" />

          {/* Banner de secreto */}
          <div className="flex items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-emerald-300 tracking-wide uppercase">
                Te corresponde endulzar y regalar a:
              </span>
            </div>
            <button
              onClick={() => {
                confetti({ particleCount: 50, spread: 60 });
              }}
              title="Lanzar confeti"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
            >
              🎉 <span className="hidden sm:inline">Celebrar</span>
            </button>
          </div>

          {/* Tarjeta del personaje del amigo asignado */}
          <div className="mb-6">
            <CharacterBadge character={assignedFriend.character} size="lg" />
          </div>

          {/* Género del amigo */}
          <div className="mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs sm:text-sm">
            <Users className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400">Género de tu amigo:</span>
            <span className="text-white font-semibold">{assignedFriend.gender}</span>
          </div>

          {/* Fichas de Gustos: Endulzada y Regalo */}
          <div className="space-y-4">
            {/* Endulzada */}
            <div className="bg-gradient-to-br from-amber-500/10 via-slate-900/80 to-slate-900/90 rounded-2xl p-5 border border-amber-500/30 shadow-lg">
              <div className="flex items-center gap-2.5 mb-2 text-amber-400">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Candy className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base sm:text-lg">
                  🍬 ¿Qué le gustaría recibir en la endulzada?
                </h3>
              </div>
              <p className="text-slate-100 text-sm sm:text-base pl-10 font-medium whitespace-pre-line">
                {assignedFriend.sweetWish}
              </p>
            </div>

            {/* Regalo Final */}
            <div className="bg-gradient-to-br from-fuchsia-500/10 via-slate-900/80 to-slate-900/90 rounded-2xl p-5 border border-fuchsia-500/30 shadow-lg">
              <div className="flex items-center gap-2.5 mb-2 text-fuchsia-400">
                <div className="w-8 h-8 rounded-xl bg-fuchsia-500/20 flex items-center justify-center">
                  <Gift className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base sm:text-lg">
                  🎁 ¿Qué regalo le gustaría recibir?
                </h3>
              </div>
              <p className="text-slate-100 text-sm sm:text-base pl-10 font-medium whitespace-pre-line">
                {assignedFriend.giftWish}
              </p>
            </div>
          </div>

          {/* Aviso de Confidencialidad Estricta */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-fuchsia-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-white">
                🔒 Regla de Confidencialidad Absoluta:
              </p>
              <p>
                El nombre real de tu amigo secreto <strong>nunca te será mostrado</strong>. Tu misión
                es endulzarlo y entregarle su regalo basándote en su personaje y sus deseos,
                manteniendo el suspenso hasta el día final de la revelación.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
