import type { Usuario, Pregunta, Respuesta, Match, InsightsPregunta } from '../types';
import { MATCHES_DESDE_PREGUNTA } from '../config';

/** Votos agrupados por usuario */
type VotosPorUsuario = Map<string, Map<string, 'A' | 'B'>>;

function buildVotos(respuestas: Respuesta[]): VotosPorUsuario {
  const m: VotosPorUsuario = new Map();
  for (const r of respuestas) {
    if (!m.has(r.usuario_id)) m.set(r.usuario_id, new Map());
    m.get(r.usuario_id)!.set(r.pregunta_id, r.eleccion);
  }
  return m;
}

function maxRachaConsecutiva(
  votosA: Map<string, 'A' | 'B'>,
  votosB: Map<string, 'A' | 'B'>,
  preguntas: Pregunta[]
): number {
  const sorted = [...preguntas].sort((a, b) => a.orden - b.orden);
  let maxRacha = 0;
  let actual = 0;
  for (const p of sorted) {
    const a = votosA.get(p.id);
    const b = votosB.get(p.id);
    if (a !== undefined && b !== undefined && a === b) {
      actual++;
      if (actual > maxRacha) maxRacha = actual;
    } else {
      actual = 0;
    }
  }
  return maxRacha;
}

/**
 * Calcula la afinidad entre todos los pares de usuarios activos.
 * Solo activo cuando hay ≥ MATCHES_DESDE_PREGUNTA preguntas respondidas.
 */
export function calcularMatches(
  usuarios: Usuario[],
  preguntas: Pregunta[],
  respuestas: Respuesta[]
): Match[] {
  // ¿Hay al menos N preguntas con respuestas?
  const preguntasConRespuestas = new Set(respuestas.map(r => r.pregunta_id));
  if (preguntasConRespuestas.size < MATCHES_DESDE_PREGUNTA) return [];

  const votos = buildVotos(respuestas);
  const activos = usuarios.filter(u => !u.expulsado && votos.has(u.id));
  const matches: Match[] = [];

  for (let i = 0; i < activos.length; i++) {
    for (let j = i + 1; j < activos.length; j++) {
      const ua = activos[i];
      const ub = activos[j];
      const votosA = votos.get(ua.id)!;
      const votosB = votos.get(ub.id)!;

      // Preguntas respondidas por ambos
      const ambas = preguntas.filter(p => votosA.has(p.id) && votosB.has(p.id));
      if (ambas.length === 0) continue;

      const totalPeso = ambas.reduce((s, p) => s + p.peso, 0);
      const pesoCoincide = ambas
        .filter(p => votosA.get(p.id) === votosB.get(p.id))
        .reduce((s, p) => s + p.peso, 0);

      const afinidad = totalPeso > 0 ? (pesoCoincide / totalPeso) * 100 : 0;
      const racha = maxRachaConsecutiva(votosA, votosB, ambas);

      matches.push({ a: ua, b: ub, afinidad, racha });
    }
  }

  // Ordenar: 1) afinidad desc, 2) racha desc, 3) alfabético
  matches.sort((x, y) => {
    if (y.afinidad !== x.afinidad) return y.afinidad - x.afinidad;
    if (y.racha !== x.racha) return y.racha - x.racha;
    const nx = `${x.a.nombre} ${x.b.nombre}`;
    const ny = `${y.a.nombre} ${y.b.nombre}`;
    return nx.localeCompare(ny);
  });

  return matches;
}

/** Pregunta más polarizada (resultado más cercano a 50/50) */
export function preguntaMasPolarizada(
  preguntas: Pregunta[],
  respuestas: Respuesta[]
): InsightsPregunta | null {
  return insightsDe(preguntas, respuestas, 'min');
}

/** Pregunta con mayor consenso (resultado más alejado de 50/50) */
export function preguntaMayorConsenso(
  preguntas: Pregunta[],
  respuestas: Respuesta[]
): InsightsPregunta | null {
  return insightsDe(preguntas, respuestas, 'max');
}

function insightsDe(
  preguntas: Pregunta[],
  respuestas: Respuesta[],
  tipo: 'min' | 'max'
): InsightsPregunta | null {
  const resultados = preguntas.map(p => {
    const rs = respuestas.filter(r => r.pregunta_id === p.id);
    const totalVotos = rs.length;
    if (totalVotos === 0) return null;
    const votosA = rs.filter(r => r.eleccion === 'A').length;
    const pctA = (votosA / totalVotos) * 100;
    return { pregunta: p, pctA, pctB: 100 - pctA, totalVotos, distancia: Math.abs(pctA - 50) };
  }).filter(Boolean) as (InsightsPregunta & { distancia: number })[];

  if (resultados.length === 0) return null;
  resultados.sort((a, b) => tipo === 'min' ? a.distancia - b.distancia : b.distancia - a.distancia);
  const { distancia: _d, ...rest } = resultados[0];
  return rest;
}

/** Afinidad media del grupo */
export function afinidadMedia(matches: Match[]): number {
  if (matches.length === 0) return 0;
  return matches.reduce((s, m) => s + m.afinidad, 0) / matches.length;
}
