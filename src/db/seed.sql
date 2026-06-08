-- Seed de la sesión demo AFTERWORK para Supabase
-- Ejecutar en el SQL Editor DESPUÉS de migration.sql

-- 1. Crear sesión
INSERT INTO sesiones (id, nombre_evento, codigo_acceso, estado, pregunta_actual_id, pausada)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Afterwork Madrid 2026',
  'AFTERWORK',
  'espera',
  NULL,
  false
)
ON CONFLICT (codigo_acceso) DO NOTHING;

-- 2. Crear las 20 preguntas
INSERT INTO preguntas (id, sesion_id, enunciado, opcion_a, opcion_b, orden, peso) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '¿Madrugador o noctámbulo?',                              '🌅 Madrugador',   '🦉 Noctámbulo',      1,  1),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '¿Café o té?',                                            '☕ Café',          '🍵 Té',              2,  1),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '¿Playa o montaña?',                                      '🏖️ Playa',         '🏔️ Montaña',         3,  1),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', '¿Trabajo desde casa o en la oficina?',                   '🏠 Casa',          '🏢 Oficina',         4,  1),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', '¿Startup o gran empresa?',                               '🚀 Startup',       '🏛️ Gran empresa',    5,  3),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', '¿Reuniones cortas y frecuentes o largas y espaciadas?',  '⚡ Cortas',        '📅 Largas',          6,  1),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', '¿Excel o Notion?',                                       '📊 Excel',         '📓 Notion',          7,  1),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', '¿Innovar o consolidar?',                                 '💡 Innovar',       '🔒 Consolidar',      8,  3),
  ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', '¿Mejor líder: carismático o técnico?',                   '🎤 Carismático',   '🛠️ Técnico',         9,  1),
  ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', '¿Datos o intuición para tomar decisiones?',              '📈 Datos',         '🧠 Intuición',       10, 3),
  ('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', '¿Presentaciones con mucho texto o visual?',              '📝 Texto',         '🖼️ Visual',          11, 1),
  ('b0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', '¿Slack o email?',                                        '💬 Slack',         '📧 Email',           12, 1),
  ('b0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', '¿Foco en proceso o en resultado?',                       '⚙️ Proceso',       '🏁 Resultado',       13, 3),
  ('b0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', '¿Reuniones con agenda o improvisadas?',                  '📋 Con agenda',    '🎲 Improvisadas',    14, 1),
  ('b0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001', '¿Networking en eventos o relaciones profundas?',         '🌐 Networking',    '❤️ Relaciones',      15, 1),
  ('b0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000001', '¿Feedback continuo o revisiones periódicas?',            '🔄 Continuo',      '📆 Periódico',       16, 1),
  ('b0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000001', '¿Trabajo en equipo o independiente?',                    '👥 Equipo',        '🧍 Independiente',   17, 3),
  ('b0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000001', '¿Aprendes mejor leyendo o haciendo?',                    '📚 Leyendo',       '🔧 Haciendo',        18, 1),
  ('b0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000001', '¿Música o silencio al trabajar?',                        '🎵 Música',        '🤫 Silencio',        19, 1),
  ('b0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000001', '¿El éxito es individual o colectivo?',                   '🏆 Individual',    '🤝 Colectivo',       20, 3)
ON CONFLICT (id) DO NOTHING;

-- 3. Apuntar la sesión a la primera pregunta
UPDATE sesiones
SET pregunta_actual_id = 'b0000000-0000-0000-0000-000000000001'
WHERE codigo_acceso = 'AFTERWORK';
