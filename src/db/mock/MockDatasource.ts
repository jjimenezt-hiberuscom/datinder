import type { Sesion, Pregunta, Usuario, Respuesta, EstadoSesion, Eleccion } from '../../types';
import type { Datasource, DatosUsuario, DatosPregunta } from '../Datasource';
import { emitter } from './emitter';
import { SESION_DEMO, PREGUNTAS_DEMO, USUARIOS_DEMO, RESPUESTAS_INICIALES, generarId } from './seed';

// Store en memoria (singleton)
let sesiones: Sesion[] = [{ ...SESION_DEMO }];
let preguntas: Pregunta[] = [...PREGUNTAS_DEMO];
let usuarios: Usuario[] = [...USUARIOS_DEMO];
let respuestas: Respuesta[] = [...RESPUESTAS_INICIALES];

function notificar(sesionId: string) {
  emitter.emit(`sesion:${sesionId}`);
}

export class MockDatasource implements Datasource {
  // ── sesiones ─────────────────────────────────────────────────────────────
  async crearSesion(nombre: string): Promise<Sesion> {
    const codigo = nombre.toUpperCase().replace(/\s+/g, '').slice(0, 8) + Math.floor(Math.random() * 100);
    const s: Sesion = {
      id: generarId(),
      nombre_evento: nombre,
      codigo_acceso: codigo,
      estado: 'espera',
      pregunta_actual_id: null,
      created_at: new Date().toISOString(),
    };
    sesiones.push(s);
    // Crear preguntas de ejemplo para la nueva sesión
    const plantilla = PREGUNTAS_DEMO.slice(0, 5);
    plantilla.forEach((p, i) => {
      preguntas.push({ ...p, id: generarId(), sesion_id: s.id, orden: i + 1 });
    });
    return s;
  }

  async getSesionPorCodigo(codigo: string): Promise<Sesion | null> {
    return sesiones.find(s => s.codigo_acceso === codigo.toUpperCase()) ?? null;
  }

  async getSesionById(id: string): Promise<Sesion | null> {
    return sesiones.find(s => s.id === id) ?? null;
  }

  async setEstado(sesionId: string, estado: EstadoSesion): Promise<void> {
    const s = sesiones.find(s => s.id === sesionId);
    if (s) { s.estado = estado; notificar(sesionId); }
  }

  async setPreguntaActual(sesionId: string, preguntaId: string | null): Promise<void> {
    const s = sesiones.find(s => s.id === sesionId);
    if (s) { s.pregunta_actual_id = preguntaId; notificar(sesionId); }
  }

  async listarSesiones(): Promise<Sesion[]> {
    return [...sesiones];
  }

  // ── preguntas ─────────────────────────────────────────────────────────────
  async listarPreguntas(sesionId: string): Promise<Pregunta[]> {
    return preguntas.filter(p => p.sesion_id === sesionId).sort((a, b) => a.orden - b.orden);
  }

  async crearPregunta(sesionId: string, datos: DatosPregunta): Promise<Pregunta> {
    const p: Pregunta = { ...datos, id: generarId(), sesion_id: sesionId };
    preguntas.push(p);
    notificar(sesionId);
    return p;
  }

  async actualizarPregunta(id: string, patch: Partial<DatosPregunta>): Promise<void> {
    const p = preguntas.find(p => p.id === id);
    if (p) {
      Object.assign(p, patch);
      notificar(p.sesion_id);
    }
  }

  async borrarPregunta(id: string): Promise<void> {
    const p = preguntas.find(p => p.id === id);
    if (p) {
      preguntas = preguntas.filter(x => x.id !== id);
      respuestas = respuestas.filter(r => r.pregunta_id !== id);
      notificar(p.sesion_id);
    }
  }

  // ── usuarios ──────────────────────────────────────────────────────────────
  async unirse(sesionId: string, datos: DatosUsuario): Promise<Usuario> {
    const u: Usuario = {
      ...datos,
      id: generarId(),
      sesion_id: sesionId,
      expulsado: false,
      created_at: new Date().toISOString(),
      apellidos: datos.apellidos ?? '',
    };
    usuarios.push(u);
    notificar(sesionId);
    return u;
  }

  async listarUsuarios(sesionId: string): Promise<Usuario[]> {
    return usuarios.filter(u => u.sesion_id === sesionId && !u.expulsado);
  }

  async expulsar(usuarioId: string): Promise<void> {
    const u = usuarios.find(u => u.id === usuarioId);
    if (u) { u.expulsado = true; notificar(u.sesion_id); }
  }

  // ── respuestas ────────────────────────────────────────────────────────────
  async votar(usuarioId: string, preguntaId: string, eleccion: Eleccion): Promise<void> {
    const existing = respuestas.find(r => r.usuario_id === usuarioId && r.pregunta_id === preguntaId);
    if (existing) return; // unique constraint
    const u = usuarios.find(u => u.id === usuarioId);
    respuestas.push({
      id: generarId(),
      usuario_id: usuarioId,
      pregunta_id: preguntaId,
      eleccion,
      created_at: new Date().toISOString(),
    });
    if (u) notificar(u.sesion_id);
  }

  async listarRespuestas(sesionId: string): Promise<Respuesta[]> {
    const uIds = new Set(usuarios.filter(u => u.sesion_id === sesionId && !u.expulsado).map(u => u.id));
    return respuestas.filter(r => uIds.has(r.usuario_id));
  }

  async listarRespuestasDePregunta(preguntaId: string): Promise<Respuesta[]> {
    return respuestas.filter(r => r.pregunta_id === preguntaId);
  }

  async borrarRespuestasDeSesion(sesionId: string): Promise<void> {
    const uIds = new Set(usuarios.filter(u => u.sesion_id === sesionId).map(u => u.id));
    respuestas = respuestas.filter(r => !uIds.has(r.usuario_id));
    notificar(sesionId);
  }

  // ── realtime ──────────────────────────────────────────────────────────────
  suscribir(sesionId: string, onChange: () => void): () => void {
    return emitter.on(`sesion:${sesionId}`, onChange);
  }
}

export { sesiones as _sesiones, preguntas as _preguntas, usuarios as _usuarios, respuestas as _respuestas };
