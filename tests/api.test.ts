import express from 'express';
import http from 'http';
import { router } from '../server/routes.ts';
import { clearAllGame } from '../server/db.ts';

const app = express();
app.use(express.json());
app.use('/api', router);

const server = http.createServer(app);

async function runApiTests() {
  await new Promise<void>((resolve) => server.listen(3099, resolve));
  const baseUrl = 'http://localhost:3099/api';

  console.log('🧪 Iniciando pruebas de integración de API...');

  try {
    // 0. Limpiar estado previo
    clearAllGame();

    // 1. Estado inicial
    const statusRes = await fetch(`${baseUrl}/status`);
    const statusJson = await statusRes.json();
    if (statusJson.isLocked !== false || statusJson.totalParticipants !== 0) {
      throw new Error('Estado inicial inválido');
    }
    console.log('✅ 1. Estado inicial limpio y desbloqueado.');

    // 2. Registrar 3 participantes
    const p1Res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Camila Torres',
        gender: 'Femenino',
        giftWish: 'Audífonos inalámbricos o libro de misterio',
        sweetWish: 'Chocolates rellenos de avellana',
      }),
    });
    const p1 = await p1Res.json();
    if (!p1.token || !p1.character) throw new Error('Error registrando p1');

    const p2Res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Mateo Morales',
        gender: 'Masculino',
        giftWish: 'Camiseta de fútbol talla M',
        sweetWish: 'Gomitas ácidas y galletas',
      }),
    });
    const p2 = await p2Res.json();
    if (!p2.token || !p2.character) throw new Error('Error registrando p2');

    const p3Res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sofía Ramirez',
        gender: 'Femenino',
        giftWish: 'Libreta de cuero con pluma',
        sweetWish: 'Almendras con chocolate amargo',
      }),
    });
    const p3 = await p3Res.json();
    if (!p3.token || !p3.character) throw new Error('Error registrando p3');

    console.log('✅ 2. Tres participantes registrados exitosamente con personajes asignados:');
    console.log(`   - ${p1.name} -> ${p1.character.name} ${p1.character.avatarEmoji}`);
    console.log(`   - ${p2.name} -> ${p2.character.name} ${p2.character.avatarEmoji}`);
    console.log(`   - ${p3.name} -> ${p3.character.name} ${p3.character.avatarEmoji}`);

    // 3. Consultar revelación antes del sorteo
    const revBefore = await fetch(`${baseUrl}/reveal/${p1.token}`);
    const revBeforeJson = await revBefore.json();
    if (revBeforeJson.isRaffleCompleted !== false || revBeforeJson.assignedFriend !== null) {
      throw new Error('Antes del sorteo no debe haber amigo asignado');
    }
    console.log('✅ 3. Consulta de enlace privado antes del sorteo muestra estado pendiente.');

    // 4. Ejecutar sorteo como Administrador
    const raffleRes = await fetch(`${baseUrl}/admin/raffle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pin': '1234',
      },
    });
    const raffleJson = await raffleRes.json();
    if (!raffleJson.success || !raffleJson.isLocked) {
      throw new Error('Fallo al ejecutar el sorteo');
    }
    console.log('✅ 4. Sorteo ejecutado por el administrador y bloqueado permanentemente.');

    // 5. Intentar registrar un nuevo participante después del sorteo (DEBE FALLAR)
    const lateRegRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Infiltrado Tardío',
        gender: 'Otro',
        giftWish: 'Nada',
        sweetWish: 'Nada',
      }),
    });
    if (lateRegRes.status !== 400) {
      throw new Error('El sistema permitió un registro después del sorteo!');
    }
    console.log('✅ 5. Registro post-sorteo bloqueado correctamente con código 400.');

    // 6. Consultar revelación después del sorteo para cada participante
    for (const [idx, p] of [p1, p2, p3].entries()) {
      const revAfter = await fetch(`${baseUrl}/reveal/${p.token}`);
      const revAfterJson = await revAfter.json();

      if (!revAfterJson.isRaffleCompleted) {
        throw new Error(`Sorteo no marcado como completado para ${p.name}`);
      }

      const assigned = revAfterJson.assignedFriend;
      if (!assigned) {
        throw new Error(`Amigo no asignado para ${p.name}`);
      }

      // ¡VERIFICACIÓN DE CONFIDENCIALIDAD CRÍTICA!
      if ('name' in assigned || 'id' in assigned || 'token' in assigned) {
        throw new Error(`VIOLACIÓN DE PRIVACIDAD: El nombre real u otros datos privados fueron expuestos en la API!`);
      }

      if (!assigned.character || !assigned.gender || !assigned.giftWish || !assigned.sweetWish) {
        throw new Error(`Faltan campos requeridos en el amigo asignado para ${p.name}`);
      }

      console.log(`✅ 6.${idx + 1}. ${p.name} ve a su amigo asignado:`);
      console.log(`      🦸 Personaje: ${assigned.character.name} ${assigned.character.avatarEmoji}`);
      console.log(`      ⚧️ Género: ${assigned.gender}`);
      console.log(`      🍬 Endulzada: ${assigned.sweetWish}`);
      console.log(`      🎁 Regalo: ${assigned.giftWish}`);
      console.log(`      🔒 Nombre real: PROTEGIDO Y OCULTO (undefined en JSON)`);
    }

    console.log('\n🎉 ¡TODAS LAS PRUEBAS DE INTEGRACIÓN PASARON AL 100%!');
  } finally {
    server.close();
  }
}

runApiTests().catch((err) => {
  console.error('❌ Error en pruebas:', err);
  process.exit(1);
});
