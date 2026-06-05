/**
 * Motor de bots: vota automáticamente en la sesión demo para animar la demo.
 * Solo activo en modo mock.
 */
import { BOT_PROFILES, PREGUNTAS_DEMO, SESION_DEMO, USUARIOS_DEMO } from './seed';
import { db } from '../index';

let started = false;
let intervalId: ReturnType<typeof setInterval> | null = null;
let botsVotadosEnPreguntaActual = new Set<string>();

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function botVotar(userId: string, profileIdx: number, preguntaId: string) {
  const pregOrden = PREGUNTAS_DEMO.findIndex(p => p.id === preguntaId);
  if (pregOrden < 0) return;
  const profile = BOT_PROFILES[profileIdx % BOT_PROFILES.length];
  const eleccion = profile.bias[pregOrden] ?? (Math.random() > 0.5 ? 'A' : 'B');
  try {
    await db.votar(userId, preguntaId, eleccion);
  } catch {
    // ignore duplicate votes
  }
}

export function startBots() {
  if (started) return;
  started = true;

  // Fase inicial: hacer que los bots voten las primeras N preguntas de golpe
  // para que el ranking de matches aparezca desde el inicio del proyector
  void seedInitialVotes();

  // Escucha cambios de pregunta actual
  db.suscribir(SESION_DEMO.id, async () => {
    const sesion = await db.getSesionPorCodigo(SESION_DEMO.codigo_acceso);
    if (!sesion || !sesion.pregunta_actual_id) return;
    if (sesion.estado === 'finalizado') return;

    const pid = sesion.pregunta_actual_id;
    if (botsVotadosEnPreguntaActual.has(pid)) return;
    botsVotadosEnPreguntaActual.add(pid);

    const usersDemo = USUARIOS_DEMO.filter(u => !u.expulsado);

    // Hacer votar a cada bot con un retraso aleatorio escalonado
    for (let i = 0; i < usersDemo.length; i++) {
      const retraso = 600 + Math.random() * 3000 + i * 200;
      setTimeout(() => {
        botVotar(usersDemo[i].id, i, pid);
      }, retraso);
    }
  });
}

async function seedInitialVotes() {
  // Votar las primeras 6 preguntas al instante (para que matches aparezcan)
  const sesion = await db.getSesionPorCodigo(SESION_DEMO.codigo_acceso);
  if (!sesion) return;

  const preguntas = PREGUNTAS_DEMO.slice(0, 6);
  const usersDemo = USUARIOS_DEMO;

  for (const pregunta of preguntas) {
    for (let i = 0; i < usersDemo.length; i++) {
      await delay(10);
      await botVotar(usersDemo[i].id, i, pregunta.id);
    }
  }

  // Avanzar hasta la pregunta 7 automáticamente en la sesión
  if (sesion.pregunta_actual_id === PREGUNTAS_DEMO[0].id) {
    await db.setPreguntaActual(SESION_DEMO.id, PREGUNTAS_DEMO[6].id);
    botsVotadosEnPreguntaActual.add(PREGUNTAS_DEMO[6].id);
    // Votar la pregunta 7 también
    for (let i = 0; i < usersDemo.length; i++) {
      await delay(50 + Math.random() * 200);
      await botVotar(usersDemo[i].id, i, PREGUNTAS_DEMO[6].id);
    }
  }
}

export function stopBots() {
  if (intervalId) { clearInterval(intervalId); intervalId = null; }
  started = false;
}
