export type EstadoSesion = 'espera' | 'jugando' | 'finalizado';
export type Eleccion = 'A' | 'B';
export type TipoUsuario = 'linkedin' | 'invitado';
export type Area = 'gastaperras' | 'analistos' | 'caza_keywords';

export const AREA_LABELS: Record<Area, string> = {
  gastaperras: 'Gastaperras',
  analistos: 'Analistos',
  caza_keywords: 'Caza Keywords',
};

export interface Sesion {
  id: string;
  nombre_evento: string;
  codigo_acceso: string;
  estado: EstadoSesion;
  pregunta_actual_id: string | null;
  pausada: boolean;
  created_at: string;
}

export interface Pregunta {
  id: string;
  sesion_id: string;
  enunciado: string;
  opcion_a: string;
  opcion_b: string;
  orden: number;
  peso: number;
}

export interface Usuario {
  id: string;
  sesion_id: string;
  nombre: string;
  apellidos: string;
  empresa?: string;
  cargo?: string;
  foto_url?: string;
  tipo: TipoUsuario;
  area?: Area;
  expulsado: boolean;
  created_at: string;
}

export interface Respuesta {
  id: string;
  usuario_id: string;
  pregunta_id: string;
  eleccion: Eleccion;
  created_at: string;
}

export interface Match {
  a: Usuario;
  b: Usuario;
  afinidad: number;
  racha: number;
}

export interface InsightsPregunta {
  pregunta: Pregunta;
  pctA: number;
  pctB: number;
  totalVotos: number;
}
