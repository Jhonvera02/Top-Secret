import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { GameState, Participant, Gender } from './types.ts';
import { getRandomCharacter } from './characters.ts';
import { conductRaffle } from './raffle.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'secret_santa.json');

const INITIAL_STATE: GameState = {
  isLocked: false,
  raffleCompletedAt: null,
  adminPin: '1234', // Clave predeterminada para el organizador
  participants: [],
};

// Asegurar existencia del directorio de datos
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Leer estado actual
export function getGameState(): GameState {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    saveGameState(INITIAL_STATE);
    return INITIAL_STATE;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as GameState;
  } catch (error) {
    console.error('Error leyendo la base de datos JSON, inicializando estado limpio:', error);
    saveGameState(INITIAL_STATE);
    return INITIAL_STATE;
  }
}

// Guardar estado de forma atómica
export function saveGameState(state: GameState): void {
  ensureDataDir();
  const tempFile = `${DATA_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), 'utf-8');
  fs.renameSync(tempFile, DATA_FILE);
}

// Registrar nuevo participante
export function addParticipant(data: {
  name: string;
  gender: Gender;
  giftWish: string;
  sweetWish: string;
}): Participant {
  const state = getGameState();

  if (state.isLocked) {
    throw new Error('El sorteo ya ha sido realizado y las inscripciones están bloqueadas.');
  }

  // Comprobar si ya existe alguien con el mismo nombre (insensible a mayúsculas/minúsculas)
  const trimmedName = data.name.trim();
  const exists = state.participants.some(
    (p) => p.name.trim().toLowerCase() === trimmedName.toLowerCase()
  );
  if (exists) {
    throw new Error(`Ya existe un participante registrado con el nombre "${trimmedName}".`);
  }

  // Personaje aleatorio que no esté repetido si es posible
  const usedCharacterIds = state.participants.map((p) => p.character.id);
  const character = getRandomCharacter(usedCharacterIds);

  // Generar token único para enlace privado
  const token = crypto.randomBytes(16).toString('hex');
  const id = crypto.randomUUID();

  const newParticipant: Participant = {
    id,
    token,
    name: trimmedName,
    gender: data.gender,
    giftWish: data.giftWish.trim(),
    sweetWish: data.sweetWish.trim(),
    character,
    assignedFriendId: null,
    registeredAt: new Date().toISOString(),
  };

  state.participants.push(newParticipant);
  saveGameState(state);

  return newParticipant;
}

// Modificar datos de un participante (solo antes del sorteo)
export function updateParticipant(
  id: string,
  updates: Partial<Pick<Participant, 'name' | 'gender' | 'giftWish' | 'sweetWish'>>
): Participant {
  const state = getGameState();

  if (state.isLocked) {
    throw new Error('No se pueden editar participantes una vez realizado el sorteo.');
  }

  const participant = state.participants.find((p) => p.id === id);
  if (!participant) {
    throw new Error('Participante no encontrado.');
  }

  if (updates.name !== undefined) participant.name = updates.name.trim();
  if (updates.gender !== undefined) participant.gender = updates.gender;
  if (updates.giftWish !== undefined) participant.giftWish = updates.giftWish.trim();
  if (updates.sweetWish !== undefined) participant.sweetWish = updates.sweetWish.trim();

  saveGameState(state);
  return participant;
}

// Eliminar participante (solo antes del sorteo)
export function removeParticipant(id: string): void {
  const state = getGameState();

  if (state.isLocked) {
    throw new Error('No se pueden eliminar participantes una vez realizado el sorteo.');
  }

  const index = state.participants.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error('Participante no encontrado.');
  }

  state.participants.splice(index, 1);
  saveGameState(state);
}

// Realizar el sorteo y bloquear
export function executeRaffle(): GameState {
  const state = getGameState();

  if (state.isLocked) {
    throw new Error('El sorteo ya fue realizado previamente y está bloqueado.');
  }

  if (state.participants.length < 3) {
    throw new Error('Se necesitan mínimo 3 participantes para realizar el sorteo.');
  }

  // Ejecutar algoritmo de sorteo seguro
  const participantsWithAssignments = conductRaffle(state.participants);

  state.participants = participantsWithAssignments;
  state.isLocked = true;
  state.raffleCompletedAt = new Date().toISOString();

  saveGameState(state);
  return state;
}

// Reiniciar sorteo (solo por organizador con confirmación)
export function resetGame(): GameState {
  const state = getGameState();
  state.isLocked = false;
  state.raffleCompletedAt = null;
  state.participants = state.participants.map((p) => ({
    ...p,
    assignedFriendId: null,
  }));
  saveGameState(state);
  return state;
}

// Reiniciar todo (vaciar participantes)
export function clearAllGame(): GameState {
  const state = getGameState();
  state.isLocked = false;
  state.raffleCompletedAt = null;
  state.participants = [];
  saveGameState(state);
  return state;
}

// Buscar participante por token privado
export function findParticipantByToken(token: string): {
  participant: Participant;
  assignedFriend?: Participant | null;
  isRaffleCompleted: boolean;
} | null {
  const state = getGameState();
  const participant = state.participants.find((p) => p.token === token);
  if (!participant) return null;

  let assignedFriend: Participant | null = null;
  if (state.isLocked && participant.assignedFriendId) {
    assignedFriend = state.participants.find((p) => p.id === participant.assignedFriendId) || null;
  }

  return {
    participant,
    assignedFriend,
    isRaffleCompleted: state.isLocked,
  };
}
