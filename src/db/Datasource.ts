import type { Sesion, Pregunta, Usuario, Respuesta, EstadoSesion, Eleccion, TipoUsuario, Area } from '../types';

export interface DatosUsuario {
  nombre: string;
  apellidos: string;
  empresa?: string;
  cargo?: string;
  foto_url?: string;
  tipo: TipoUsuario;
  area?: Area;
}

export interface DatosPregunta {
  enunciado: string;
  opcion_a: string;
  opcion_b: string;
  orden: number;
  peso: number;
}

export interface Datasource {
  // sesiones
  crearSesion(nombre: string): Promise<Sesion>;
  eliminarSesion(sesionId: string): Promise<void>;
  clonarSesion(sesionId: string, nuevoNombre: string): Promise<Sesion>;
  getSesionPorCodigo(codigo: string): Promise<Sesion | null>;
  getSesionById(id: string): Promise<Sesion | null>;
  setEstado(sesionId: string, estado: EstadoSesion): Promise<void>;
  setPreguntaActual(sesionId: string, preguntaId: string | null): Promise<void>;
  setPausada(sesionId: string, pausada: boolean): Promise<void>;
  listarSesiones(): Promise<Sesion[]>;
  // preguntas
  listarPreguntas(sesionId: string): Promise<Pregunta[]>;
  crearPregunta(sesionId: string, datos: DatosPregunta): Promise<Pregunta>;
  actualizarPregunta(id: string, patch: Partial<DatosPregunta>): Promise<void>;
  borrarPregunta(id: string): Promise<void>;
  // usuarios
  unirse(sesionId: string, datos: DatosUsuario): Promise<Usuario>;
  listarUsuarios(sesionId: string): Promise<Usuario[]>;
  expulsar(usuarioId: string): Promise<void>;
  // respuestas
  votar(usuarioId: string, preguntaId: string, eleccion: Eleccion, sesionId: string): Promise<void>;
  listarRespuestas(sesionId: string): Promise<Respuesta[]>;
  listarRespuestasDePregunta(preguntaId: string): Promise<Respuesta[]>;
  borrarRespuestasDeSesion(sesionId: string): Promise<void>;
  // realtime
  suscribir(sesionId: string, onChange: () => void): () => void;
}
