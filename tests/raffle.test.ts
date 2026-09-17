import { conductRaffle } from '../server/raffle.ts';
import { Participant } from '../server/types.ts';
import { CHARACTERS_POOL } from '../server/characters.ts';

function createMockParticipant(name: string, id: string): Participant {
  return {
    id,
    token: `token-${id}`,
    name,
    gender: 'Prefiero no decir',
    giftWish: `Regalo de ${name}`,
    sweetWish: `Dulce de ${name}`,
    character: CHARACTERS_POOL[Math.floor(Math.random() * CHARACTERS_POOL.length)],
    assignedFriendId: null,
    registeredAt: new Date().toISOString(),
  };
}

console.log('🧪 Iniciando pruebas de algoritmo de sorteo...');

// Test 1: Sorteo con menos de 3 participantes debe fallar
try {
  const twoParticipants = [
    createMockParticipant('Ana', '1'),
    createMockParticipant('Carlos', '2'),
  ];
  conductRaffle(twoParticipants);
  console.error('❌ Falló Test 1: El sorteo con < 3 no arrojó error.');
  process.exit(1);
} catch (e: any) {
  console.log('✅ Test 1: El sorteo con < 3 participantes fue rechazado correctamente.');
}

// Test 2: Sorteo con 5 participantes
for (let iteration = 1; iteration <= 100; iteration++) {
  const participants = [
    createMockParticipant('Ana', '1'),
    createMockParticipant('Carlos', '2'),
    createMockParticipant('Elena', '3'),
    createMockParticipant('David', '4'),
    createMockParticipant('Beatriz', '5'),
  ];

  const result = conductRaffle(participants);

  // Regla 1: Nadie se asigna a sí mismo
  for (const p of result) {
    if (p.assignedFriendId === p.id) {
      console.error(`❌ Falló Test 2 en iteración ${iteration}: ${p.name} se asignó a sí mismo!`);
      process.exit(1);
    }
  }

  // Regla 2: Cada participante es asignado exactamente una vez
  const assignedIds = result.map((p) => p.assignedFriendId);
  const uniqueAssigned = new Set(assignedIds);
  if (uniqueAssigned.size !== participants.length) {
    console.error(`❌ Falló Test 2 en iteración ${iteration}: Asignaciones duplicadas detectadas!`);
    process.exit(1);
  }

  // Regla 3: Un solo ciclo cerrado (Hamiltoniano)
  let currentId: string = result[0].id;
  const visited = new Set<string>();
  while (!visited.has(currentId)) {
    visited.add(currentId);
    const currentParticipant = result.find((p) => p.id === currentId)!;
    currentId = currentParticipant.assignedFriendId!;
  }
  if (visited.size !== participants.length) {
    console.error(
      `❌ Falló Test 2 en iteración ${iteration}: No se formó un ciclo único completo (sub-cliques)!`
    );
    process.exit(1);
  }
}
console.log('✅ Test 2: 100 sorteos ejecutados exitosamente con 0 auto-asignaciones y ciclo único perfecto.');

// Test 3: Verificación de que regalo y dulce pertenecen a la misma persona
const group = [
  createMockParticipant('A', '1'),
  createMockParticipant('B', '2'),
  createMockParticipant('C', '3'),
  createMockParticipant('D', '4'),
];
const resultGroup = conductRaffle(group);
resultGroup.forEach((giver) => {
  const receiver = resultGroup.find((p) => p.id === giver.assignedFriendId);
  if (!receiver) {
    console.error(`❌ Falló Test 3: No se encontró receptor para ${giver.name}`);
    process.exit(1);
  }
  // Ambos corresponden al mismo receiver
  if (receiver.giftWish !== `Regalo de ${receiver.name}` || receiver.sweetWish !== `Dulce de ${receiver.name}`) {
    console.error(`❌ Falló Test 3: Inconsistencia en deseos de ${receiver.name}`);
    process.exit(1);
  }
});
console.log('✅ Test 3: El regalo y la endulzada corresponden estrictamente al mismo amigo secreto.');

console.log('\n🎉 ¡Todas las pruebas unitarias pasaron con éxito!');
