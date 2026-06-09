import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { InsightsPregunta, Match } from '@/types';
import { afinidadMedia, compatibilidadPorArea } from '@/lib/afinidad';
import { exportarRankingCSV } from '@/lib/exportCsv';
import { nombreCompleto } from '@/lib/utils';

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

const BADGES = [
  { label: '1º', bg: 'bg-yellow-400', text: 'text-yellow-900' },
  { label: '2º', bg: 'bg-gray-300',   text: 'text-gray-700'  },
  { label: '3º', bg: 'bg-amber-600',  text: 'text-amber-100' },
];

const MEDALS = ['🥇', '🥈', '🥉'];

// Accent colour for the % figure: golden ≥70, bright white ≥50, muted below
const pctColor = (pct: number) =>
  pct >= 70 ? 'text-datinder-yellow' : pct >= 50 ? 'text-white' : 'text-white/50';

function AreaTile({ label, afinidadMedia: pct, numParejas, pos }: { label: string; afinidadMedia: number; numParejas: number; pos: number }) {
  // Hero card — takes the full row to read unambiguously as #1
  if (pos === 0) {
    return (
      <div className="col-span-2 md:col-span-3 relative rounded-2xl overflow-hidden border border-datinder-yellow/40">
        {/* gold gradient fill */}
        <div className="absolute inset-0 bg-gradient-to-br from-datinder-yellow/20 via-datinder-yellow-dark/10 to-transparent" />
        <div className="relative flex items-center gap-4 px-5 py-4">
          {/* medal */}
          <span className="text-4xl leading-none flex-shrink-0 animate-bounce-in">{MEDALS[0]}</span>
          {/* label */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base md:text-lg leading-tight truncate">{label}</p>
            <p className="text-white/40 text-xs mt-0.5">{numParejas} {numParejas === 1 ? 'pareja' : 'parejas'}</p>
          </div>
          {/* pct — large and prominent */}
          <p className="text-datinder-yellow font-black text-5xl md:text-6xl tabular-nums flex-shrink-0">
            {Math.round(pct)}%
          </p>
        </div>
        {/* bottom bar shows fullness */}
        <div className="relative h-1 bg-white/10">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-datinder-yellow to-datinder-yellow-dark"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  // Runner-up tiles (pos 1, 2) — medium with medal
  if (pos <= 2) {
    return (
      <div className="relative bg-white/5 border border-white/10 rounded-xl p-3 text-center">
        <span className="absolute top-2 left-2 text-lg leading-none">{MEDALS[pos]}</span>
        <p className="text-white/60 text-xs mb-1 leading-tight mt-4">{label}</p>
        <p className={`font-black text-3xl tabular-nums ${pctColor(pct)}`}>{Math.round(pct)}%</p>
        <p className="text-white/30 text-xs mt-1">{numParejas} {numParejas === 1 ? 'pareja' : 'parejas'}</p>
        <div className="mt-2 h-0.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-white/30" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  // Remaining tiles — compact
  return (
    <div className="relative bg-white/5 rounded-xl p-3 text-center">
      <p className="text-white/50 text-xs mb-1 leading-tight">{label}</p>
      <p className={`font-bold text-xl tabular-nums ${pctColor(pct)}`}>{Math.round(pct)}%</p>
      <p className="text-white/30 text-[10px] mt-1">{numParejas} {numParejas === 1 ? 'pareja' : 'parejas'}</p>
    </div>
  );
}

export function Insights({ polarizada, consenso, matches }: InsightsProps) {
  const media = afinidadMedia(matches);
  const areaCompats = compatibilidadPorArea(matches);
  const crossArea = areaCompats.filter(c => c.areaA !== c.areaB);
  const sameArea  = areaCompats.filter(c => c.areaA === c.areaB);

  return (
    <div className="space-y-4">
      {/* Stats 3-col */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Compatibilidad entre áreas */}
      {areaCompats.length > 0 && (
        <div className="rounded-2xl overflow-hidden border border-white/10">
          {/* Section header */}
          <div className="bg-white/5 px-5 py-4 flex items-center gap-3 border-b border-white/10">
            <span className="text-2xl">🏢</span>
            <h4 className="text-datinder-yellow font-bold text-sm uppercase tracking-widest flex-1">
              Compatibilidad entre áreas
            </h4>
          </div>

          {/* Cross-area — warm, gold-accented */}
          {crossArea.length > 0 && (
            <div className="px-4 pt-4 pb-5">
              <div className="flex items-center gap-2 mb-3">
                {/* accent pill */}
                <span className="bg-datinder-yellow/20 border border-datinder-yellow/30 text-datinder-yellow text-xs font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                  Entre áreas distintas
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {crossArea.map((c, i) => (
                  <AreaTile key={`${c.areaA}-${c.areaB}`} label={c.label} afinidadMedia={c.afinidadMedia} numParejas={c.numParejas} pos={i} />
                ))}
              </div>
            </div>
          )}

          {/* Divider between groups */}
          {crossArea.length > 0 && sameArea.length > 0 && (
            <div className="mx-4 border-t border-white/10" />
          )}

          {/* Same-area — cooler, outlined treatment */}
          {sameArea.length > 0 && (
            <div className="px-4 pt-4 pb-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-white/5 border border-white/20 text-white/60 text-xs font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                  Dentro de la misma área
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {sameArea.map((c, i) => (
                  <AreaTile key={`${c.areaA}-${c.areaB}`} label={c.label} afinidadMedia={c.afinidadMedia} numParejas={c.numParejas} pos={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ranking completo */}
      {matches.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold">Ranking completo</h3>
            <Button variant="yellow" size="sm" onClick={() => exportarRankingCSV(matches)}>
              <Download className="w-4 h-4 mr-1" /> Descargar CSV
            </Button>
          </div>
          <ScrollArea className="h-64">
            <div className="space-y-1 pr-2">
              {matches.map((m, i) => (
                <div key={`${m.a.id}-${m.b.id}`} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    {i < 3 ? (
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full min-w-[28px] text-center ${BADGES[i].bg} ${BADGES[i].text}`}>
                        {BADGES[i].label}
                      </span>
                    ) : (
                      <span className="text-white/40 text-sm w-7 text-center">{i + 1}</span>
                    )}
                    <span className="text-white text-sm">
                      {nombreCompleto(m.a)} <span className="text-datinder-yellow">+</span> {nombreCompleto(m.b)}
                    </span>
                  </div>
                  <span className="text-datinder-yellow font-bold text-sm tabular-nums">{Math.round(m.afinidad)}%</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
