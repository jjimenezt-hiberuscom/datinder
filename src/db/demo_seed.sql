-- ============================================================
-- search-mmatch-tica — Seed evento DEMO con 20 bots y 20 preguntas
-- Ejecutar en Supabase SQL Editor o via CLI
-- ============================================================

DO $$
DECLARE
  v_sesion   uuid;
  v_preguntas uuid[];
  v_users    uuid[];
  v_uid      uuid;
  v_i        int;
  v_j        int;
  v_vote     text;

  v_areas    text[] := ARRAY[
    'gastaperras','gastaperras','gastaperras','gastaperras','gastaperras','gastaperras','gastaperras',
    'analistos',  'analistos',  'analistos',  'analistos',  'analistos',  'analistos',  'analistos',
    'caza_keywords','caza_keywords','caza_keywords','caza_keywords','caza_keywords','caza_keywords'
  ];
  v_nombres  text[] := ARRAY['Carlos','María','Pedro','Ana','Luis','Sofía','Miguel',
                              'Elena','Javier','Laura','Pablo','Carmen','Sergio','Marta',
                              'Antonio','Rosa','David','Patricia','Jorge','Lucía'];
  v_apellidos text[] := ARRAY['García','Martínez','López','Sánchez','González','Fernández','Torres',
                               'Jiménez','Ruiz','Díaz','Moreno','Álvarez','Romero','Alonso',
                               'Navarro','Gutiérrez','Domínguez','Vargas','Castillo','Ramos'];
BEGIN
  -- Limpiar si ya existe
  DELETE FROM sesiones WHERE codigo_acceso = 'DEMO';

  -- Crear sesión
  INSERT INTO sesiones (nombre_evento, codigo_acceso, estado, pausada)
  VALUES ('Demo search-mmatch-tica', 'DEMO', 'finalizado', false)
  RETURNING id INTO v_sesion;

  -- 20 preguntas
  INSERT INTO preguntas (sesion_id, enunciado, opcion_a, opcion_b, orden, peso) VALUES
    (v_sesion, '¿Madrugador o noctámbulo?',                          '🌅 Madrugador',      '🦉 Noctámbulo',        1,  1),
    (v_sesion, '¿Café o té?',                                         '☕ Café',             '🍵 Té',                2,  1),
    (v_sesion, '¿Playa o montaña?',                                   '🏖️ Playa',           '🏔️ Montaña',          3,  1),
    (v_sesion, '¿Trabajo desde casa o en la oficina?',                '🏠 Casa',             '🏢 Oficina',           4,  1),
    (v_sesion, '¿Startup o gran empresa?',                            '🚀 Startup',          '🏛️ Gran empresa',     5,  3),
    (v_sesion, '¿Reuniones cortas y frecuentes o largas y espaciadas?','⚡ Cortas',           '📅 Largas',            6,  1),
    (v_sesion, '¿Excel o Notion?',                                    '📊 Excel',            '📓 Notion',            7,  1),
    (v_sesion, '¿Innovar o consolidar?',                              '💡 Innovar',          '🔒 Consolidar',        8,  3),
    (v_sesion, '¿Mejor líder: carismático o técnico?',                '🎤 Carismático',      '🛠️ Técnico',          9,  1),
    (v_sesion, '¿Datos o intuición para tomar decisiones?',           '📈 Datos',            '🧠 Intuición',        10,  3),
    (v_sesion, '¿Presentaciones con mucho texto o visual?',           '📝 Texto',            '🖼️ Visual',           11,  1),
    (v_sesion, '¿Slack o email?',                                     '💬 Slack',            '📧 Email',            12,  1),
    (v_sesion, '¿Foco en proceso o en resultado?',                    '⚙️ Proceso',          '🏁 Resultado',        13,  3),
    (v_sesion, '¿Reuniones con agenda o improvisadas?',               '📋 Con agenda',       '🎲 Improvisadas',     14,  1),
    (v_sesion, '¿Networking en eventos o relaciones profundas?',      '🌐 Networking',       '❤️ Relaciones',       15,  1),
    (v_sesion, '¿Feedback continuo o revisiones periódicas?',         '🔄 Continuo',         '📆 Periódico',        16,  1),
    (v_sesion, '¿Trabajo en equipo o independiente?',                 '👥 Equipo',           '🧍 Independiente',    17,  3),
    (v_sesion, '¿Aprendes mejor leyendo o haciendo?',                 '📚 Leyendo',          '🔧 Haciendo',         18,  1),
    (v_sesion, '¿Música o silencio al trabajar?',                     '🎵 Música',           '🤫 Silencio',         19,  1),
    (v_sesion, '¿El éxito es individual o colectivo?',                '🏆 Individual',       '🤝 Colectivo',        20,  3);

  -- Recoger IDs de preguntas en orden
  SELECT ARRAY(SELECT id FROM preguntas WHERE sesion_id = v_sesion ORDER BY orden)
  INTO v_preguntas;

  -- 20 usuarios (7 gastaperras, 7 analistos, 6 caza_keywords)
  v_users := ARRAY[]::uuid[];
  FOR v_i IN 1..20 LOOP
    INSERT INTO usuarios (sesion_id, nombre, apellidos, area, tipo, expulsado)
    VALUES (v_sesion, v_nombres[v_i], v_apellidos[v_i], v_areas[v_i], 'invitado', false)
    RETURNING id INTO v_uid;
    v_users := array_append(v_users, v_uid);
  END LOOP;

  -- Votos con patrón por área:
  --   gastaperras  → ~70% A (orientados a acción/resultado)
  --   analistos    → ~40% A (más reflexivos/B)
  --   caza_keywords→ ~50% A (mixto)
  FOR v_i IN 1..20 LOOP
    FOR v_j IN 1..20 LOOP
      v_vote := CASE
        WHEN v_areas[v_i] = 'gastaperras'   THEN CASE WHEN (v_i * 7  + v_j * 3)  % 10 >= 3 THEN 'A' ELSE 'B' END
        WHEN v_areas[v_i] = 'analistos'     THEN CASE WHEN (v_i * 5  + v_j * 11) % 10 >= 6 THEN 'A' ELSE 'B' END
        ELSE                                     CASE WHEN (v_i * 9  + v_j * 7)  % 10 >= 5 THEN 'A' ELSE 'B' END
      END;
      INSERT INTO respuestas (usuario_id, pregunta_id, eleccion)
      VALUES (v_users[v_i], v_preguntas[v_j], v_vote);
    END LOOP;
  END LOOP;

  -- Apuntar a la última pregunta
  UPDATE sesiones SET pregunta_actual_id = v_preguntas[20] WHERE id = v_sesion;

  RAISE NOTICE 'Evento DEMO creado: sesion_id = %', v_sesion;
END $$;
