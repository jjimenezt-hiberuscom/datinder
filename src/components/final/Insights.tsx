import type { InsightsPregunta, Match } from '@/types';
import { afinidadMedia } from '@/lib/afinidad';

interface InsightsProps {
  polarizada: InsightsPregunta | null;
  consenso: InsightsPregunta | null;
  matches: Match[];
}

function MiniBar({ pctA, pctB, labelA, labelB }: { pctA: number; pctB: number; labelA: string; labelB: string }) {
  return (
    <div className="space-y-1">
      <div className="flex gap-1 h-3 rounded overflow-hidden">
        <div className="bg-datinder-yellow transition-all duration-700" style={{ width: `${pctA}%` }} />
        <div className="bg-white/30 transition-all duration-700" style={{ width: `${pctB}%` }} />
      </div>
      <div className="flex justify-between text-xs text-white/60">
        <span>{labelA} {Math.round(pctA)}%</span>
        <span>{Math.round(pctB)}% {labelB}</span>
      </div>
    </div>
  );
}

export function Insights({ polarizada, consenso, matches }: InsightsProps) {
  const media = afinidadMedia(matches);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Pregunta más polarizada */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">⚖️</span>
          <h4 className="text-datinder-yellow font-bold text-sm uppercase tracking-wide">Más polarizada</h4>
        </div>
        {polarizada ? (
          <>
            <p className="text-white font-medium text-sm mb-3 leading-snug">{polarizada.pregunta.enunciado}</p>
            <MiniBar
              pctA={polarizada.pctA}
              pctB={polarizada.pctB}
              labelA={polarizada.pregunta.opcion_a.split(' ').slice(0, 2).join(' ')}
              labelB={polarizada.pregunta.opcion_b.split(' ').slice(0, 2).join(' ')}
            />
            <p className="text-white/40 text-xs mt-2">{polarizada.totalVotos} votos</p>
          </>
        ) : (
          <p className="text-white/40 text-sm">Sin datos suficientes</p>
        )}
      </div>

      {/* Pregunta con mayor consenso */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🤝</span>
          <h4 className="text-datinder-yellow font-bold text-sm uppercase tracking-wide">Mayor consenso</h4>
        </div>
        {consenso ? (
          <>
            <p className="text-white font-medium text-sm mb-3 leading-snug">{consenso.pregunta.enunciado}</p>
            <MiniBar
              pctA={consenso.pctA}
              pctB={consenso.pctB}
              labelA={consenso.pregunta.opcion_a.split(' ').slice(0, 2).join(' ')}
              labelB={consenso.pregunta.opcion_b.split(' ').slice(0, 2).join(' ')}
            />
            <p className="text-white/40 text-xs mt-2">{consenso.totalVotos} votos</p>
          </>
        ) : (
          <p className="text-white/40 text-sm">Sin datos suficientes</p>
        )}
      </div>

      {/* Afinidad media */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
        <span className="text-2xl mb-2">💞</span>
        <h4 className="text-datinder-yellow font-bold text-sm uppercase tracking-wide mb-2">Afinidad media</h4>
        <p className="text-datinder-yellow font-black text-5xl tabular-nums">{Math.round(media)}%</p>
        <p className="text-white/40 text-xs mt-2">del grupo</p>
        {matches.length > 0 && (
          <p className="text-white/40 text-xs mt-1">{matches.length} parejas analizadas</p>
        )}
      </div>
    </div>
  );
}
