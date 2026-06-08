import { Users, Pause, RotateCcw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MatchesList } from './MatchesList';
import type { Match, Sesion, Pregunta } from '@/types';
import { db } from '@/db';
import { getLoginUrl } from '@/config';
import { avanzarPregunta } from '@/lib/sesion';

interface SidebarProps {
  sesion: Sesion;
  usuarios: number;
  matches: Match[];
  preguntas: Pregunta[];
  preguntaActual: Pregunta | null;
  isPresenter: boolean;
  onReload: () => void;
}

export function Sidebar({ sesion, usuarios, matches, preguntas, preguntaActual, isPresenter, onReload }: SidebarProps) {
  const loginUrl = getLoginUrl(sesion.codigo_acceso);
  const pregActualOrden = preguntaActual?.orden ?? 0;

  async function handleSiguiente() {
    await avanzarPregunta(sesion, preguntas, preguntaActual);
    onReload();
  }

  async function handlePausar() {
    await db.setEstado(sesion.id, sesion.estado === 'espera' ? 'jugando' : 'espera');
    onReload();
  }

  async function handleReiniciar() {
    if (!confirm('¿Reiniciar el quiz? Se borrarán todas las respuestas.')) return;
    await db.borrarRespuestasDeSesion(sesion.id);
    const sorted = [...preguntas].sort((a, b) => a.orden - b.orden);
    if (sorted.length > 0) await db.setPreguntaActual(sesion.id, sorted[0].id);
    await db.setEstado(sesion.id, 'jugando');
    onReload();
  }

  return (
    <aside className="flex flex-col gap-4 h-full">
      {/* QR + Participantes */}
      <div className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3">
        {/* QR placeholder */}
        <div className="w-28 h-28 bg-datinder-bg rounded-xl flex items-center justify-center relative overflow-hidden">
          <div className="grid grid-cols-7 grid-rows-7 gap-0.5 p-2 w-full h-full">
            {Array.from({ length: 49 }).map((_, i) => (
              <div key={i} className={`rounded-sm ${Math.random() > 0.4 ? 'bg-white' : 'bg-transparent'}`} />
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-black text-xs bg-datinder-bg px-1">{sesion.codigo_acceso}</span>
          </div>
        </div>
        <p className="text-datinder-bg text-xs text-center font-medium truncate w-full">{loginUrl}</p>

        {/* Contador */}
        <div className="flex items-center gap-2 bg-datinder-bg text-white rounded-full px-4 py-2">
          <Users className="w-5 h-5 text-datinder-yellow" />
          <span className="text-2xl font-black tabular-nums">{usuarios}</span>
          <span className="text-white/60 text-sm">participantes</span>
        </div>
      </div>

      {/* Matches */}
      {matches.length > 0 && (
        <MatchesList matches={matches} />
      )}
      {matches.length === 0 && pregActualOrden < 5 && (
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
          <p className="text-white/40 text-sm">
            Los matches aparecerán en la pregunta 5
          </p>
          <div className="mt-2 flex justify-center gap-1">
            {[1,2,3,4,5].map(n => (
              <div key={n} className={`w-2 h-2 rounded-full ${n <= pregActualOrden ? 'bg-datinder-yellow' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>
      )}

      <div className="flex-1" />

      {/* Controles presentador */}
      {isPresenter && (
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Controles</p>
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-white/50 text-xs">Auto-avance</span>
            <button
              onClick={() => { void db.setPausada(sesion.id, !sesion.pausada).then(onReload); }}
              className={`text-xs font-bold px-3 py-1 rounded-full border transition-colors ${
                sesion.pausada
                  ? 'bg-white/5 border-white/20 text-white/40'
                  : 'bg-datinder-yellow/20 border-datinder-yellow/40 text-datinder-yellow'
              }`}
            >
              {sesion.pausada ? 'OFF' : 'ON'}
            </button>
          </div>
          <Button
            variant="yellow"
            className="w-full gap-2"
            onClick={handleSiguiente}
            disabled={sesion.estado === 'finalizado'}
          >
            <ChevronRight className="w-4 h-4" />
            Siguiente Pregunta
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1 gap-1 bg-white/10 border border-white/20 text-white hover:bg-white/20" onClick={handlePausar}>
              <Pause className="w-3 h-3" />
              {sesion.estado === 'espera' ? 'Reanudar' : 'Pausar'}
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 gap-1 bg-red-500/10 border border-red-400/30 text-red-300 hover:bg-red-500/20" onClick={handleReiniciar}>
              <RotateCcw className="w-3 h-3" />
              Reiniciar
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
