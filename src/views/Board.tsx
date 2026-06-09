import React, { useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Sidebar } from '@/components/board/Sidebar';
import { MainPanel } from '@/components/board/MainPanel';
import { Podium } from '@/components/final/Podium';
import { Insights } from '@/components/final/Insights';
import { useRealtimeSession } from '@/hooks/useRealtimeSession';
import { calcularMatches, preguntaMasPolarizada, preguntaMayorConsenso } from '@/lib/afinidad';
import { avanzarPregunta } from '@/lib/sesion';
import { db } from '@/db';

export function Board() {
  const { codigo = 'AFTERWORK' } = useParams<{ codigo: string }>();
  const [searchParams] = useSearchParams();
  const isPresenter = searchParams.get('rol') === 'presentador';

  const [sesionId, setSesionId] = React.useState<string | null>(null);

  useEffect(() => {
    db.getSesionPorCodigo(codigo).then(s => {
      if (s) setSesionId(s.id);
    });
  }, [codigo]);

  const { sesion, preguntas, usuarios, respuestas, preguntaActual, reload } = useRealtimeSession(sesionId);

  // Auto-avance: solo el presentador, cuando todos han respondido y no está pausado
  const autoAdvancedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!isPresenter || !sesion || sesion.estado !== 'jugando' || sesion.pausada || !preguntaActual || usuarios.length === 0) return;

    const votadosActual = new Set(
      respuestas.filter(r => r.pregunta_id === preguntaActual.id).map(r => r.usuario_id)
    ).size;

    if (votadosActual < usuarios.length) return;
    if (autoAdvancedRef.current === preguntaActual.id) return;

    const timer = setTimeout(() => {
      if (autoAdvancedRef.current === preguntaActual.id) return;
      autoAdvancedRef.current = preguntaActual.id;
      void avanzarPregunta(sesion, preguntas, preguntaActual);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isPresenter, sesion, preguntaActual, respuestas, usuarios, preguntas]);

  const matches = React.useMemo(
    () => calcularMatches(usuarios, preguntas, respuestas),
    [usuarios, preguntas, respuestas]
  );
  const polarizada = React.useMemo(() => preguntaMasPolarizada(preguntas, respuestas), [preguntas, respuestas]);
  const consenso = React.useMemo(() => preguntaMayorConsenso(preguntas, respuestas), [preguntas, respuestas]);

  if (!sesionId || !sesion) {
    return (
      <div className="min-h-screen bg-datinder-bg flex items-center justify-center">
        <div className="text-center">
          <img src="/logo.png" alt="search-mmatch-tica" className="h-16 mx-auto mb-2" />
          <p className="text-white/50">Cargando sesión <span className="font-mono">{codigo}</span>...</p>
        </div>
      </div>
    );
  }

  // Pantalla final
  if (sesion.estado === 'finalizado') {
    return (
      <div className="min-h-screen bg-datinder-bg p-8 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          <Podium matches={matches} />
          <Insights polarizada={polarizada} consenso={consenso} matches={matches} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-datinder-bg p-4 md:p-6 overflow-hidden">
      <div className="max-w-7xl mx-auto h-[calc(100vh-3rem)] grid grid-cols-[280px_1fr] gap-6">
        <Sidebar
          sesion={sesion}
          usuarios={usuarios.length}
          matches={matches}
          preguntas={preguntas}
          preguntaActual={preguntaActual}
          isPresenter={isPresenter}
          onReload={reload}
        />
        <MainPanel
          sesion={sesion}
          preguntaActual={preguntaActual}
          preguntas={preguntas}
          respuestas={respuestas}
        />
      </div>
    </div>
  );
}
