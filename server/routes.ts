import { Router, Request, Response, NextFunction } from 'express';
import {
  getGameState,
  addParticipant,
  updateParticipant,
  removeParticipant,
  executeRaffle,
  resetGame,
  clearAllGame,
  findParticipantByToken,
} from './db.ts';
import { ParticipantRevealView, Gender } from './types.ts';

export const router = Router();

// Middleware de autenticación básica para el Administrador
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const pin = req.headers['x-admin-pin'] || req.body?.pin || req.query?.pin;
  const state = getGameState();

  if (!pin || pin !== state.adminPin) {
    res.status(401).json({ error: 'PIN de administrador inválido o no proporcionado.' });
    return;
  }
  next();
}

// 1. Estado público del juego
router.get('/status', (_req: Request, res: Response) => {
  const state = getGameState();
  res.json({
    isLocked: state.isLocked,
    totalParticipants: state.participants.length,
    raffleCompletedAt: state.raffleCompletedAt,
  });
});

// 2. Registro público de participantes
router.post('/register', (req: Request, res: Response) => {
  try {
    const { name, gender, giftWish, sweetWish } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'El nombre es obligatorio.' });
      return;
    }

    const validGenders: Gender[] = [
      'Femenino',
      'Masculino',
      'No binario',
      'Otro',
      'Prefiero no decir',
    ];

    if (!gender || !validGenders.includes(gender)) {
      res.status(400).json({ error: 'Por favor selecciona un género válido.' });
      return;
    }

    if (!giftWish || typeof giftWish !== 'string' || !giftWish.trim()) {
      res.status(400).json({ error: 'Por favor indica qué regalo te gustaría recibir.' });
      return;
    }

    if (!sweetWish || typeof sweetWish !== 'string' || !sweetWish.trim()) {
      res.status(400).json({ error: 'Por favor indica qué te gustaría en la endulzada.' });
      return;
    }

    const newParticipant = addParticipant({
      name: name.trim(),
      gender,
      giftWish: giftWish.trim(),
      sweetWish: sweetWish.trim(),
    });

    res.status(201).json({
      success: true,
      token: newParticipant.token,
      name: newParticipant.name,
      character: newParticipant.character,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al registrar participante.' });
  }
});

// 3. Vista privada para el participante mediante token
router.get('/reveal/:token', (req: Request, res: Response) => {
  const token = String(req.params.token);
  const result = findParticipantByToken(token);

  if (!result) {
    res.status(404).json({ error: 'Enlace privado no válido o no encontrado.' });
    return;
  }

  const { participant, assignedFriend, isRaffleCompleted } = result;

  // Estricta confidencialidad: Si hay amigo asignado, NO enviar su nombre real
  const responseData: ParticipantRevealView = {
    participant: {
      name: participant.name,
      gender: participant.gender,
      character: participant.character,
      giftWish: participant.giftWish,
      sweetWish: participant.sweetWish,
    },
    isRaffleCompleted,
    assignedFriend:
      isRaffleCompleted && assignedFriend
        ? {
            character: assignedFriend.character,
            gender: assignedFriend.gender,
            giftWish: assignedFriend.giftWish,
            sweetWish: assignedFriend.sweetWish,
            // ¡NUNCA ENVIAR assignedFriend.name!
          }
        : null,
  };

  res.json(responseData);
});

// 4. Endpoints del Administrador / Organizador

// Verificar PIN
router.post('/admin/verify-pin', (req: Request, res: Response) => {
  const { pin } = req.body;
  const state = getGameState();
  if (pin === state.adminPin) {
    res.json({ valid: true });
  } else {
    res.status(401).json({ valid: false, error: 'PIN incorrecto.' });
  }
});

// Obtener lista completa de participantes (para el organizador)
router.get('/admin/participants', requireAdmin, (_req: Request, res: Response) => {
  const state = getGameState();
  // El organizador puede ver la lista de participantes y sus enlaces privados para compartirlos
  const participants = state.participants.map((p) => ({
    id: p.id,
    name: p.name,
    gender: p.gender,
    token: p.token,
    character: p.character,
    giftWish: p.giftWish,
    sweetWish: p.sweetWish,
    hasAssignment: Boolean(p.assignedFriendId),
    registeredAt: p.registeredAt,
  }));

  res.json({
    isLocked: state.isLocked,
    raffleCompletedAt: state.raffleCompletedAt,
    participants,
  });
});

// Ejecutar sorteo y bloquear
router.post('/admin/raffle', requireAdmin, (_req: Request, res: Response) => {
  try {
    const updatedState = executeRaffle();
    res.json({
      success: true,
      message: '¡Sorteo realizado con éxito! Las asignaciones han quedado bloqueadas permanentemente.',
      raffleCompletedAt: updatedState.raffleCompletedAt,
      isLocked: updatedState.isLocked,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al ejecutar el sorteo.' });
  }
});

// Reiniciar sorteo
router.post('/admin/reset-raffle', requireAdmin, (_req: Request, res: Response) => {
  try {
    resetGame();
    res.json({ success: true, message: 'El sorteo ha sido reiniciado. Asignaciones liberadas.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Vaciar todos los participantes
router.post('/admin/clear-all', requireAdmin, (_req: Request, res: Response) => {
  try {
    clearAllGame();
    res.json({ success: true, message: 'Se han eliminado todos los participantes del juego.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar participante individual
router.delete('/admin/participant/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    removeParticipant(id);
    res.json({ success: true, message: 'Participante eliminado exitosamente.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Actualizar datos de participante
router.put('/admin/participant/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, gender, giftWish, sweetWish } = req.body;
    const updated = updateParticipant(id, { name, gender, giftWish, sweetWish });
    res.json({ success: true, participant: updated });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
