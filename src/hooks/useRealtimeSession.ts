import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../db';
import type { Sesion, Pregunta, Usuario, Respuesta } from '../types';

interface RealtimeSessionData {
  sesion: Sesion | null;
  preguntas: Pregunta[];
  usuarios: Usuario[];
  respuestas: Respuesta[];
  preguntaActual: Pregunta | null;
  loading: boolean;
  reload: () => void;
}

export function useRealtimeSession(sesionId: string | null): RealtimeSessionData {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
  const [loading, setLoading] = useState(true);
  const reloadRef = useRef(0);

  const reload = useCallback(() => { reloadRef.current++; }, []);

  useEffect(() => {
    if (!sesionId) { setLoading(false); return; }

    let cancelled = false;

    async function fetchAll() {
      if (!sesionId) return;
      setLoading(true);
      try {
        const [s, ps, us, rs] = await Promise.all([
          db.getSesionById(sesionId),
          db.listarPreguntas(sesionId),
          db.listarUsuarios(sesionId),
          db.listarRespuestas(sesionId),
        ]);
        if (cancelled) return;
        setSesion(s);
        setPreguntas(ps);
        setUsuarios(us);
        setRespuestas(rs);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchAll();

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const unsub = db.suscribir(sesionId, () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => { void fetchAll(); }, 300);
    });

    return () => {
      cancelled = true;
      if (debounceTimer) clearTimeout(debounceTimer);
      unsub();
    };
  }, [sesionId, reloadRef.current]); // eslint-disable-line react-hooks/exhaustive-deps

  const preguntaActual = sesion?.pregunta_actual_id
    ? (preguntas.find(p => p.id === sesion.pregunta_actual_id) ?? null)
    : null;

  return { sesion, preguntas, usuarios, respuestas, preguntaActual, loading, reload };
}
