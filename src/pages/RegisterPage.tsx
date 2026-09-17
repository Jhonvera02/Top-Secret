import React, { useState } from 'react';
import { User, Gift, Candy, Sparkles, Copy, Check, ArrowRight, Lock, Users, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Gender, Character, SystemStatus } from '../types.ts';
import { CharacterBadge } from '../components/CharacterBadge.tsx';

interface RegisterPageProps {
  status: SystemStatus | null;
  onRegistered: (token: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ status, onRegistered }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('Femenino');
  const [giftWish, setGiftWish] = useState('');
  const [sweetWish, setSweetWish] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Registro completado state
  const [registeredUser, setRegisteredUser] = useState<{
    name: string;
    token: string;
    character: Character;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Si el sorteo ya fue bloqueado
  if (status?.isLocked) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <div className="glass-panel rounded-3xl p-8 text-center border border-amber-500/30">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Inscripciones Cerradas</h2>
          <p className="text-slate-300 mb-6">
            El sorteo de Amigo Secreto ya ha sido realizado y las asignaciones se encuentran
            bloqueadas. Si ya te registraste, busca tu enlace privado para consultar a tu amigo secreto.
          </p>
          <p className="text-xs text-slate-400">
            Pide al organizador que te reenvíe tu enlace privado si lo perdiste.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Por favor escribe tu nombre.');
      return;
    }
    if (!giftWish.trim()) {
      setError('Por favor indica qué regalo te gustaría recibir.');
      return;
    }
    if (!sweetWish.trim()) {
      setError('Por favor indica qué te gustaría recibir en la endulzada.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, gender, giftWish, sweetWish }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar el registro.');
      }

      // Celebración
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setRegisteredUser({
        name: data.name,
        token: data.token,
        character: data.character,
      });

      localStorage.setItem('amigo_secreto_token', data.token);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const getPrivateUrl = (token: string) => {
    return `${window.location.origin}/#token=${token}`;
  };

  const handleCopyLink = () => {
    if (!registeredUser) return;
    navigator.clipboard.writeText(getPrivateUrl(registeredUser.token));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Pantalla de éxito tras el registro
  if (registeredUser) {
    const privateUrl = getPrivateUrl(registeredUser.token);

    return (
      <div className="max-w-2xl mx-auto py-8 px-4 animate-in fade-in duration-500">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-fuchsia-500/30 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl -z-10" />

          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> ¡Registro Exitoso!
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              ¡Bienvenido al juego, {registeredUser.name}!
            </h2>
            <p className="text-slate-300 text-sm mt-1">
              El sistema te ha asignado un personaje secreto para proteger tu identidad.
            </p>
          </div>

          {/* Tarjeta del personaje asignado al usuario */}
          <div className="mb-6">
            <label className="block text-xs uppercase font-bold tracking-wider text-fuchsia-400 mb-2 text-center">
              🦸 Tu Personaje Secreto Asignado
            </label>
            <CharacterBadge character={registeredUser.character} size="md" />
            <p className="text-xs text-center text-slate-400 mt-2">
              Quien te saque como amigo secreto solo verá este personaje y tus gustos, nunca tu nombre real.
            </p>
          </div>

          {/* Enlace privado único */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-white/10 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                Tu Enlace Privado Personal:
              </span>
              {copied && (
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> ¡Copiado!
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={privateUrl}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-300 select-all font-mono"
              />
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0 shadow-lg shadow-indigo-600/30"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">Copiar</span>
              </button>
            </div>

            <p className="text-xs text-amber-300/90 mt-2">
              ⚠️ Guarda este enlace en tus favoritos o WhatsApp. Es el único medio para ver a tu amigo
              secreto cuando el organizador realice el sorteo.
            </p>
          </div>

          {/* Botón para ir directo a la vista de amigo */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onRegistered(registeredUser.token)}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-600/30 transition-all group"
            >
              <span>Ir a mi Enlace Privado</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                setRegisteredUser(null);
                setName('');
                setGiftWish('');
                setSweetWish('');
              }}
              className="py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-sm font-medium transition-colors"
            >
              Registrar a otra persona
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de inscripción
  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      {/* Intro header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-fuchsia-500/20 text-fuchsia-400 mb-3 border border-fuchsia-500/30 shadow-lg shadow-fuchsia-500/20">
          <Gift className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Inscripción al <span className="text-gradient">Amigo Secreto</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-md mx-auto">
          Ingresa tus datos y gustos. El sistema te asignará un personaje sorpresa y recibirás tu enlace
          privado.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 sm:p-8 space-y-5 border border-white/10 shadow-2xl">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-1.5 flex items-center gap-2">
            <User className="w-4 h-4 text-fuchsia-400" />
            👤 Tu Nombre Completo
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Andrés Pérez, Valentina Gómez..."
            className="w-full bg-slate-900/90 border border-white/10 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm transition-all outline-none"
          />
        </div>

        {/* Género */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-1.5 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            ⚧️ Género
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            className="w-full bg-slate-900/90 border border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-3 text-slate-100 text-sm transition-all outline-none"
          >
            <option value="Femenino">Femenino</option>
            <option value="Masculino">Masculino</option>
            <option value="No binario">No binario</option>
            <option value="Otro">Otro</option>
            <option value="Prefiero no decir">Prefiero no decir</option>
          </select>
        </div>

        {/* Regalo Deseado */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-1.5 flex items-center gap-2">
            <Gift className="w-4 h-4 text-fuchsia-400" />
            🎁 ¿Qué regalo te gustaría recibir? (Texto libre)
          </label>
          <textarea
            required
            rows={3}
            value={giftWish}
            onChange={(e) => setGiftWish(e.target.value)}
            placeholder="Ej. Taza térmica, audífonos bluetooth, libro de aventuras, camisa talla M, termo para agua..."
            className="w-full bg-slate-900/90 border border-white/10 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm transition-all outline-none resize-none"
          />
          <p className="text-xs text-slate-400 mt-1">
            Sé específico con tallas, colores o autores favoritos si aplica.
          </p>
        </div>

        {/* Endulzada */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-1.5 flex items-center gap-2">
            <Candy className="w-4 h-4 text-amber-400" />
            🍬 ¿Qué te gustaría recibir en la endulzada? (Texto libre)
          </label>
          <textarea
            required
            rows={3}
            value={sweetWish}
            onChange={(e) => setSweetWish(e.target.value)}
            placeholder="Ej. Chocolates con almendras, gomitas ácidas, galletas de avena, frutos secos, café especial..."
            className="w-full bg-slate-900/90 border border-white/10 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm transition-all outline-none resize-none"
          />
          <p className="text-xs text-slate-400 mt-1">
            Menciona si tienes alguna alergia o si prefieres opciones sin azúcar.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-fuchsia-600/30 hover:shadow-fuchsia-600/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Registrando y asignando personaje...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Inscribirme y Obtener mi Personaje Secreto
            </span>
          )}
        </button>
      </form>
    </div>
  );
};
