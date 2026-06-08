import type { Sesion, Pregunta, Usuario, Respuesta } from '../../types';

const now = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 10);

export const SESION_DEMO: Sesion = {
  id: 'sesion-afterwork-2026',
  nombre_evento: 'Afterwork Madrid 2026',
  codigo_acceso: 'AFTERWORK',
  estado: 'jugando',
  pregunta_actual_id: null,
  pausada: false,
  created_at: now(),
};

export const PREGUNTAS_DEMO: Pregunta[] = [
  { id: 'p1',  sesion_id: SESION_DEMO.id, enunciado: '¿Madrugador o noctámbulo?',                       opcion_a: '🌅 Madrugador', opcion_b: '🦉 Noctámbulo',         orden: 1,  peso: 1 },
  { id: 'p2',  sesion_id: SESION_DEMO.id, enunciado: '¿Café o té?',                                     opcion_a: '☕ Café',        opcion_b: '🍵 Té',                  orden: 2,  peso: 1 },
  { id: 'p3',  sesion_id: SESION_DEMO.id, enunciado: '¿Playa o montaña?',                               opcion_a: '🏖️ Playa',      opcion_b: '🏔️ Montaña',            orden: 3,  peso: 1 },
  { id: 'p4',  sesion_id: SESION_DEMO.id, enunciado: '¿Trabajo desde casa o en la oficina?',            opcion_a: '🏠 Casa',        opcion_b: '🏢 Oficina',             orden: 4,  peso: 1 },
  { id: 'p5',  sesion_id: SESION_DEMO.id, enunciado: '¿Startup o gran empresa?',                        opcion_a: '🚀 Startup',     opcion_b: '🏛️ Gran empresa',        orden: 5,  peso: 3 },
  { id: 'p6',  sesion_id: SESION_DEMO.id, enunciado: '¿Reuniones cortas y frecuentes o largas y espaciadas?', opcion_a: '⚡ Cortas', opcion_b: '📅 Largas',            orden: 6,  peso: 1 },
  { id: 'p7',  sesion_id: SESION_DEMO.id, enunciado: '¿Excel o Notion?',                                opcion_a: '📊 Excel',       opcion_b: '📓 Notion',              orden: 7,  peso: 1 },
  { id: 'p8',  sesion_id: SESION_DEMO.id, enunciado: '¿Innovar o consolidar?',                          opcion_a: '💡 Innovar',     opcion_b: '🔒 Consolidar',          orden: 8,  peso: 3 },
  { id: 'p9',  sesion_id: SESION_DEMO.id, enunciado: '¿Mejor líder: carismático o técnico?',            opcion_a: '🎤 Carismático', opcion_b: '🛠️ Técnico',             orden: 9,  peso: 1 },
  { id: 'p10', sesion_id: SESION_DEMO.id, enunciado: '¿Datos o intuición para tomar decisiones?',       opcion_a: '📈 Datos',       opcion_b: '🧠 Intuición',           orden: 10, peso: 3 },
  { id: 'p11', sesion_id: SESION_DEMO.id, enunciado: '¿Presentaciones con mucho texto o visual?',       opcion_a: '📝 Texto',       opcion_b: '🖼️ Visual',              orden: 11, peso: 1 },
  { id: 'p12', sesion_id: SESION_DEMO.id, enunciado: '¿Slack o email?',                                 opcion_a: '💬 Slack',       opcion_b: '📧 Email',               orden: 12, peso: 1 },
  { id: 'p13', sesion_id: SESION_DEMO.id, enunciado: '¿Foco en proceso o en resultado?',                opcion_a: '⚙️ Proceso',     opcion_b: '🏁 Resultado',           orden: 13, peso: 3 },
  { id: 'p14', sesion_id: SESION_DEMO.id, enunciado: '¿Reuniones con agenda o improvisadas?',           opcion_a: '📋 Con agenda',  opcion_b: '🎲 Improvisadas',        orden: 14, peso: 1 },
  { id: 'p15', sesion_id: SESION_DEMO.id, enunciado: '¿Networking en eventos o relaciones profundas?',  opcion_a: '🌐 Networking',  opcion_b: '❤️ Relaciones',          orden: 15, peso: 1 },
  { id: 'p16', sesion_id: SESION_DEMO.id, enunciado: '¿Feedback continuo o revisiones periódicas?',     opcion_a: '🔄 Continuo',    opcion_b: '📆 Periódico',           orden: 16, peso: 1 },
  { id: 'p17', sesion_id: SESION_DEMO.id, enunciado: '¿Trabajo en equipo o independiente?',             opcion_a: '👥 Equipo',      opcion_b: '🧍 Independiente',       orden: 17, peso: 3 },
  { id: 'p18', sesion_id: SESION_DEMO.id, enunciado: '¿Aprendes mejor leyendo o haciendo?',             opcion_a: '📚 Leyendo',     opcion_b: '🔧 Haciendo',            orden: 18, peso: 1 },
  { id: 'p19', sesion_id: SESION_DEMO.id, enunciado: '¿Música o silencio al trabajar?',                 opcion_a: '🎵 Música',      opcion_b: '🤫 Silencio',            orden: 19, peso: 1 },
  { id: 'p20', sesion_id: SESION_DEMO.id, enunciado: '¿El éxito es individual o colectivo?',            opcion_a: '🏆 Individual',  opcion_b: '🤝 Colectivo',           orden: 20, peso: 3 },
];

// Inicializar la primera pregunta activa
SESION_DEMO.pregunta_actual_id = PREGUNTAS_DEMO[0].id;

export const USUARIOS_DEMO: Usuario[] = [];

export const RESPUESTAS_INICIALES: Respuesta[] = [];

export function generarId(): string {
  return uid() + uid();
}
