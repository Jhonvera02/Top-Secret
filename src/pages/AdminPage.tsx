import React, { useState, useEffect } from 'react';
import {
  Shield,
  KeyRound,
  Users,
  Dices,
  Lock,
  Unlock,
  Trash2,
  Edit2,
  Copy,
  Check,
  Share2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AdminParticipant, Gender } from '../types.ts';
import { CharacterBadge } from '../components/CharacterBadge.tsx';

interface AdminPageProps {
  onStatusChange: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onStatusChange }) => {
  const [pin, setPin] = useState(localStorage.getItem('amigo_admin_pin') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [participants, setParticipants] = useState<AdminParticipant[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [raffleCompletedAt, setRaffleCompletedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit Modal State
  const [editingParticipant, setEditingParticipant] = useState<AdminParticipant | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    gender: 'Femenino' as Gender,
    giftWish: '',
    sweetWish: '',
  });

  // Check stored PIN on load
  useEffect(() => {
    if (pin) {
      verifyAndLoad(pin);
    }
  }, []);

  const verifyAndLoad = async (tryPin: string) => {
    try {
      setLoading(true);
      setAuthError(null);
      const res = await fetch('/api/admin/participants', {
        headers: { 'x-admin-pin': tryPin },
      });

      if (!res.ok) {
        throw new Error('PIN incorrecto o sesión inválida.');
      }

      const data = await res.json();
      setIsAuthenticated(true);
      setPin(tryPin);
      localStorage.setItem('amigo_admin_pin', tryPin);
      setParticipants(data.participants);
      setIsLocked(data.isLocked);
      setRaffleCompletedAt(data.raffleCompletedAt);
    } catch (err: any) {
      setIsAuthenticated(false);
      setAuthError(err.message || 'Error al autenticar.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    verifyAndLoad(pinInput.trim());
  };

  const handleLogout = () => {
    localStorage.removeItem('amigo_admin_pin');
    setIsAuthenticated(false);
    setPin('');
    setPinInput('');
  };

  const loadData = () => {
    if (pin) verifyAndLoad(pin);
  };

  // Realizar Sorteo
  const handlePerformRaffle = async () => {
    if (participants.length < 3) {
      alert('Se necesitan como mínimo 3 participantes para realizar el sorteo.');
      return;
    }

    const confirmMsg =
      '¿Estás seguro de realizar el sorteo ahora?\n\n' +
      '⚠️ ATENCIÓN: Las asignaciones quedarán bloqueadas de forma permanente y se cerrarán nuevas inscripciones.';

    if (!window.confirm(confirmMsg)) return;

    try {
      setActionError(null);
      const res = await fetch('/api/admin/raffle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al ejecutar el sorteo.');
      }

      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
      });

      loadData();
      onStatusChange();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // Reiniciar Sorteo (mantiene participantes)
  const handleResetRaffle = async () => {
    const confirmMsg =
      '¿Deseas reiniciar el sorteo?\n\n' +
      'Esto desbloqueará el juego y eliminará las asignaciones actuales (los participantes se mantendrán registrados).';
    if (!window.confirm(confirmMsg)) return;

    try {
      setActionError(null);
      const res = await fetch('/api/admin/reset-raffle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      loadData();
      onStatusChange();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // Vaciar Todo
  const handleClearAll = async () => {
    const confirmMsg =
      '⚠️ PELIGRO: ¿Estás seguro de eliminar a TODOS los participantes registrados?\n\nEsta acción no se puede deshacer.';
    if (!window.confirm(confirmMsg)) return;

    try {
      setActionError(null);
      const res = await fetch('/api/admin/clear-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      loadData();
      onStatusChange();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // Eliminar un participante
  const handleDeleteParticipant = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar a "${name}" del sorteo?`)) return;

    try {
      setActionError(null);
      const res = await fetch(`/api/admin/participant/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': pin },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      loadData();
      onStatusChange();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // Abrir Modal de Edición
  const handleOpenEdit = (p: AdminParticipant) => {
    setEditingParticipant(p);
    setEditForm({
      name: p.name,
      gender: p.gender,
      giftWish: p.giftWish,
      sweetWish: p.sweetWish,
    });
  };

  // Guardar Edición
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParticipant) return;

    try {
      setActionError(null);
      const res = await fetch(`/api/admin/participant/${editingParticipant.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin,
        },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEditingParticipant(null);
      loadData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const getPrivateUrl = (token: string) => {
    return `${window.location.origin}/#token=${token}`;
  };

  const handleCopyLink = (participant: AdminParticipant) => {
    const url = getPrivateUrl(participant.token);
    navigator.clipboard.writeText(url);
    setCopiedId(participant.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleShareWhatsapp = (participant: AdminParticipant) => {
    const url = getPrivateUrl(participant.token);
    const message = `¡Hola ${participant.name}! 🎁🦸 Aquí tienes tu enlace privado y personal para nuestro juego de Amigo Secreto:\n\n${url}\n\nEntra para conocer qué personaje te asignó el sistema y descubrir a quién te toca endulzar y regalar. ¡Guárdalo bien!`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  // Si no está autenticado
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="glass-panel rounded-3xl p-8 border border-white/10 text-center shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Panel del Organizador</h2>
          <p className="text-slate-400 text-sm mb-6">
            Ingresa el PIN maestro para administrar los participantes y realizar el sorteo.
            (PIN por defecto: <code className="text-fuchsia-300 font-bold bg-fuchsia-950/60 px-2 py-0.5 rounded">1234</code>)
          </p>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-left flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Ingresa el PIN de organizador..."
                className="w-full bg-slate-900/90 border border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl pl-11 pr-4 py-3 text-slate-100 text-sm outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30"
            >
              {loading ? 'Verificando...' : 'Acceder al Panel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      {/* Header del Dashboard */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Administrador
            </span>
            {isLocked ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Sorteo Bloqueado
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Unlock className="w-3.5 h-3.5" /> Registro Abierto
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Control de Amigo Secreto
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            {participants.length} participante(s) registrado(s) en total.
          </p>
        </div>

        {/* Acciones principales */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {!isLocked ? (
            <button
              onClick={handlePerformRaffle}
              disabled={participants.length < 3}
              className="flex-1 md:flex-none px-5 py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-fuchsia-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Dices className="w-5 h-5 animate-spin-slow" />
              <span>🎲 Realizar Sorteo ({participants.length}/3 mín)</span>
            </button>
          ) : (
            <button
              onClick={handleResetRaffle}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Desbloquear y Reiniciar Sorteo</span>
            </button>
          )}

          <button
            onClick={loadData}
            title="Recargar datos"
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-3 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
          >
            Salir
          </button>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Alerta de bloqueo */}
      {isLocked && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-slate-300 space-y-1">
            <p className="font-bold text-white">
              🔒 Asignaciones Bloqueadas Permanentemente
            </p>
            <p>
              El sorteo fue completado exitosamente. Ahora comparte con cada persona su enlace
              privado utilizando el botón de <strong>WhatsApp</strong> o <strong>Copiar Enlace</strong>.
              Ellos solo verán el personaje y gustos de su amigo secreto; nunca su nombre.
            </p>
          </div>
        </div>
      )}

      {/* Lista de Participantes */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-bold text-lg text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Participantes ({participants.length})
          </h2>
          {participants.length > 0 && !isLocked && (
            <button
              onClick={handleClearAll}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Vaciar lista
            </button>
          )}
        </div>

        {participants.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-base font-semibold text-slate-300">No hay participantes registrados</p>
            <p className="text-xs text-slate-500 mt-1">
              Invita a las personas a llenar el formulario de inscripción.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3.5">Participante</th>
                  <th className="px-4 py-3.5">Personaje Asignado</th>
                  <th className="px-4 py-3.5">Deseo Endulzada 🍬</th>
                  <th className="px-4 py-3.5">Deseo Regalo 🎁</th>
                  <th className="px-4 py-3.5 text-center">Enlace Privado</th>
                  <th className="px-4 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {participants.map((p) => {
                  const isCopied = copiedId === p.id;
                  return (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                      {/* Nombre y género */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-bold text-white">{p.name}</div>
                        <div className="text-xs text-slate-400">{p.gender}</div>
                      </td>

                      {/* Personaje asignado */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-white/10">
                          <span className="text-xl">{p.character.avatarEmoji}</span>
                          <div>
                            <div className="text-xs font-bold text-white">
                              {p.character.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {p.character.universe}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Endulzada */}
                      <td className="px-4 py-4 max-w-xs">
                        <p className="text-xs text-slate-200 line-clamp-2 italic">
                          "{p.sweetWish}"
                        </p>
                      </td>

                      {/* Regalo */}
                      <td className="px-4 py-4 max-w-xs">
                        <p className="text-xs text-slate-200 line-clamp-2 italic">
                          "{p.giftWish}"
                        </p>
                      </td>

                      {/* Enlace Privado con Copiar y WhatsApp */}
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleCopyLink(p)}
                            title="Copiar enlace privado al portapapeles"
                            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                              isCopied
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            }`}
                          >
                            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span>{isCopied ? '¡Copiado!' : 'Copiar'}</span>
                          </button>

                          <button
                            onClick={() => handleShareWhatsapp(p)}
                            title="Enviar enlace por WhatsApp"
                            className="p-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </button>
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!isLocked && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(p)}
                                title="Editar datos del participante"
                                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteParticipant(p.id, p.name)}
                                title="Eliminar participante"
                                className="p-2 rounded-lg bg-rose-900/20 hover:bg-rose-900/40 text-rose-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {isLocked && (
                            <span className="text-xs text-emerald-400 font-medium px-2 py-1 bg-emerald-500/10 rounded-lg">
                              Asignado ✓
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Edición de Participante */}
      {editingParticipant && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/20 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-white mb-4">
              Editar Participante: {editingParticipant.name}
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Género</label>
                <select
                  value={editForm.gender}
                  onChange={(e) =>
                    setEditForm({ ...editForm, gender: e.target.value as Gender })
                  }
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                >
                  <option value="Femenino">Femenino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="No binario">No binario</option>
                  <option value="Otro">Otro</option>
                  <option value="Prefiero no decir">Prefiero no decir</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Deseo de Regalo 🎁
                </label>
                <textarea
                  rows={2}
                  value={editForm.giftWish}
                  onChange={(e) => setEditForm({ ...editForm, giftWish: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Deseo de Endulzada 🍬
                </label>
                <textarea
                  rows={2}
                  value={editForm.sweetWish}
                  onChange={(e) => setEditForm({ ...editForm, sweetWish: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingParticipant(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-sm font-semibold shadow-lg shadow-fuchsia-600/30"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
