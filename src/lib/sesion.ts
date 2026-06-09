import { db } from '@/db';
import type { Sesion, Pregunta } from '@/types';

export async function avanzarPregunta(
  sesion: Sesion,
  preguntas: Pregunta[],
  preguntaActual: Pregunta | null
): Promise<void> {
  const sorted = [...preguntas].sort((a, b) => a.orden - b.orden);
  const idx = sorted.findIndex(p => p.id === preguntaActual?.id);
  if (idx < sorted.length - 1) {
    await db.setPreguntaActual(sesion.id, sorted[idx + 1].id);
    if (sesion.estado !== 'jugando') await db.setEstado(sesion.id, 'jugando');
  } else {
    await db.setEstado(sesion.id, 'finalizado');
  }
}
