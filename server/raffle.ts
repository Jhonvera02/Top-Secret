import { Participant } from './types.ts';

/**
 * Realiza el sorteo de Amigo Secreto utilizando el algoritmo de Sattolo.
 * Garantiza:
 * 1. Nadie se regala a sí mismo.
 * 2. Un único ciclo cerrado perfecto (A -> B -> C -> ... -> A).
 * 3. Asignación biunívoca: cada quien regala y recibe de una sola persona.
 */
export function conductRaffle(participants: Participant[]): Participant[] {
  if (participants.length < 3) {
    throw new Error('Se requieren al menos 3 participantes para realizar el sorteo.');
  }

  // Copia de los IDs para barajar en ciclo
  const ids = participants.map((p) => p.id);
  const n = ids.length;

  // Algoritmo de Sattolo
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i); // 0 <= j < i
    const temp = ids[i];
    ids[i] = ids[j];
    ids[j] = temp;
  }

  // Mapear cada participante con el siguiente en el ciclo cerrado
  const assignmentMap = new Map<string, string>();
  for (let i = 0; i < n; i++) {
    const giverId = ids[i];
    const receiverId = ids[(i + 1) % n];
    assignmentMap.set(giverId, receiverId);
  }

  // Retornar los participantes con su asignación fijada
  return participants.map((p) => {
    const assignedId = assignmentMap.get(p.id);
    if (!assignedId || assignedId === p.id) {
      throw new Error(`Error en el sorteo: asignación inválida para ${p.name}`);
    }
    return {
      ...p,
      assignedFriendId: assignedId,
    };
  });
}
