import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Sidebar } from '@/components/board/Sidebar';
import { MainPanel } from '@/components/board/MainPanel';
import { Podium } from '@/components/final/Podium';
import { Insights } from '@/components/final/Insights';
import { useRealtimeSession } from '@/hooks/useRealtimeSession';
import { calcularMatches, preguntaMasPolarizada, preguntaMayorConsenso } from '@/lib/afinidad';
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
    <div className="relative min-h-screen bg-datinder-bg p-4 md:p-6 overflow-hidden">
      <img
        src="/logo-horizontal.png"
        alt="search-mmatch-tica"
        className="absolute bottom-4 right-5 h-7 w-auto brightness-0 invert opacity-25 pointer-events-none select-none"
      />
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
          totalUsuarios={usuarios.length}
        />
      </div>
    </div>
  );
}
