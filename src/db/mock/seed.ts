import type { Sesion, Pregunta, Usuario, Respuesta } from '../../types';

const now = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 10);

export const SESION_DEMO: Sesion = {
  id: 'sesion-afterwork-2026',
  nombre_evento: 'Afterwork Madrid 2026',
  codigo_acceso: 'AFTERWORK',
  estado: 'jugando',
  pregunta_actual_id: null,
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

type BotProfile = { bias: ('A' | 'B')[] }; // bias[i] = tendencia para pregunta i

export const BOT_PROFILES: BotProfile[] = [
  { bias: ['A','A','B','A','A','A','B','A','B','A','A','A','B','A','B','A','A','B','A','B'] },
  { bias: ['A','B','A','B','A','B','A','B','A','B','A','B','A','B','A','B','A','B','A','B'] },
  { bias: ['B','B','A','B','B','B','A','B','A','B','B','B','A','B','A','B','B','A','B','A'] },
  { bias: ['A','A','A','A','B','A','B','A','A','A','B','A','A','A','B','A','A','A','B','A'] },
  { bias: ['B','A','B','B','B','B','A','B','B','B','A','B','B','B','A','B','B','B','A','B'] },
  { bias: ['A','B','B','A','A','A','B','A','A','B','A','A','A','B','A','A','B','A','A','A'] },
  { bias: ['B','B','B','B','A','B','B','A','B','B','B','B','A','B','B','B','B','A','B','B'] },
  { bias: ['A','A','A','B','B','B','A','B','A','A','B','A','B','A','A','B','A','B','A','A'] },
  { bias: ['B','A','B','A','B','A','B','A','B','A','B','A','B','A','B','A','B','A','B','A'] },
  { bias: ['A','B','A','A','A','A','B','A','B','A','A','B','A','A','A','A','B','A','A','A'] },
  { bias: ['B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B'] },
  { bias: ['A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A'] },
  { bias: ['A','B','A','B','A','A','B','A','B','A','A','B','A','A','B','A','B','A','B','A'] },
  { bias: ['B','A','B','A','B','B','A','B','A','B','B','A','B','B','A','B','A','B','A','B'] },
  { bias: ['A','A','B','A','B','A','A','B','A','A','B','A','B','A','A','B','A','A','B','A'] },
  { bias: ['B','B','A','B','A','B','B','A','B','B','A','B','A','B','B','A','B','B','A','B'] },
];

export const USUARIOS_DEMO: Usuario[] = [
  { id: 'u1',  sesion_id: SESION_DEMO.id, nombre: 'Ana',      apellidos: 'García López',     empresa: 'Telefónica',   cargo: 'Product Manager',      foto_url: 'https://i.pravatar.cc/150?img=1',  tipo: 'linkedin', expulsado: false, created_at: now() },
  { id: 'u2',  sesion_id: SESION_DEMO.id, nombre: 'Carlos',   apellidos: 'Martínez Ruiz',    empresa: 'BBVA',         cargo: 'Data Engineer',        foto_url: 'https://i.pravatar.cc/150?img=3',  tipo: 'linkedin', expulsado: false, created_at: now() },
  { id: 'u3',  sesion_id: SESION_DEMO.id, nombre: 'Elena',    apellidos: 'Fernández Pérez',  empresa: 'Inditex',      cargo: 'UX Designer',          foto_url: 'https://i.pravatar.cc/150?img=5',  tipo: 'invitado', expulsado: false, created_at: now() },
  { id: 'u4',  sesion_id: SESION_DEMO.id, nombre: 'Miguel',   apellidos: 'Sánchez Torres',   empresa: 'Cabify',       cargo: 'Backend Developer',    foto_url: 'https://i.pravatar.cc/150?img=7',  tipo: 'linkedin', expulsado: false, created_at: now() },
  { id: 'u5',  sesion_id: SESION_DEMO.id, nombre: 'Sofía',    apellidos: 'López Morales',    empresa: 'Glovo',        cargo: 'Growth Hacker',        foto_url: 'https://i.pravatar.cc/150?img=9',  tipo: 'invitado', expulsado: false, created_at: now() },
  { id: 'u6',  sesion_id: SESION_DEMO.id, nombre: 'Pablo',    apellidos: 'Romero Castillo',  empresa: 'Santander',    cargo: 'Agile Coach',          foto_url: 'https://i.pravatar.cc/150?img=11', tipo: 'linkedin', expulsado: false, created_at: now() },
  { id: 'u7',  sesion_id: SESION_DEMO.id, nombre: 'Laura',    apellidos: 'Jiménez Vega',     empresa: 'Amazon',       cargo: 'SRE',                  foto_url: 'https://i.pravatar.cc/150?img=13', tipo: 'invitado', expulsado: false, created_at: now() },
  { id: 'u8',  sesion_id: SESION_DEMO.id, nombre: 'Javier',   apellidos: 'Navarro Gil',      empresa: 'Microsoft',    cargo: 'Cloud Architect',      foto_url: 'https://i.pravatar.cc/150?img=15', tipo: 'linkedin', expulsado: false, created_at: now() },
  { id: 'u9',  sesion_id: SESION_DEMO.id, nombre: 'Marta',    apellidos: 'Molina Ramos',     empresa: 'Repsol',       cargo: 'Business Analyst',     foto_url: 'https://i.pravatar.cc/150?img=17', tipo: 'invitado', expulsado: false, created_at: now() },
  { id: 'u10', sesion_id: SESION_DEMO.id, nombre: 'Diego',    apellidos: 'Ortega Medina',    empresa: 'Mapfre',       cargo: 'DevOps Engineer',      foto_url: 'https://i.pravatar.cc/150?img=19', tipo: 'linkedin', expulsado: false, created_at: now() },
  { id: 'u11', sesion_id: SESION_DEMO.id, nombre: 'Isabel',   apellidos: 'Díaz Herrera',     empresa: 'Airbus',       cargo: 'Marketing Director',   foto_url: 'https://i.pravatar.cc/150?img=21', tipo: 'invitado', expulsado: false, created_at: now() },
  { id: 'u12', sesion_id: SESION_DEMO.id, nombre: 'Rodrigo',  apellidos: 'Gutiérrez Blanco', empresa: 'Iberdrola',    cargo: 'CTO',                  foto_url: 'https://i.pravatar.cc/150?img=23', tipo: 'linkedin', expulsado: false, created_at: now() },
  { id: 'u13', sesion_id: SESION_DEMO.id, nombre: 'Carmen',   apellidos: 'Santos Iglesias',  empresa: 'El País',      cargo: 'Frontend Developer',   foto_url: 'https://i.pravatar.cc/150?img=25', tipo: 'invitado', expulsado: false, created_at: now() },
  { id: 'u14', sesion_id: SESION_DEMO.id, nombre: 'Álvaro',   apellidos: 'Suárez Campos',    empresa: 'Mango',        cargo: 'HR Director',          foto_url: 'https://i.pravatar.cc/150?img=27', tipo: 'linkedin', expulsado: false, created_at: now() },
  { id: 'u15', sesion_id: SESION_DEMO.id, nombre: 'Natalia',  apellidos: 'Delgado Rueda',    empresa: 'Mercadona',    cargo: 'Data Scientist',       foto_url: 'https://i.pravatar.cc/150?img=29', tipo: 'invitado', expulsado: false, created_at: now() },
  { id: 'u16', sesion_id: SESION_DEMO.id, nombre: 'Tomás',    apellidos: 'Vargas Esteve',    empresa: 'Vueling',      cargo: 'Finance Manager',      foto_url: 'https://i.pravatar.cc/150?img=31', tipo: 'linkedin', expulsado: false, created_at: now() },
];

export const RESPUESTAS_INICIALES: Respuesta[] = [];

export function generarId(): string {
  return uid() + uid();
}
