import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Confetti } from './Confetti';
import type { Match } from '@/types';
import { exportarRankingCSV } from '@/lib/exportCsv';
import { nombreCompleto } from '@/lib/utils';
import { getAvatar } from '@/lib/avatar';

interface PodiumProps {
  matches: Match[];
  compacto?: boolean;
}

function PodiumSlot({ match, pos, delay }: { match: Match; pos: 1 | 2 | 3; delay: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), delay); }, [delay]);

  const heights: Record<number, string> = { 1: 'h-32', 2: 'h-24', 3: 'h-16' };
  const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
  const orders: Record<number, number> = { 1: 2, 2: 1, 3: 3 };

  return (
    <div
      className={`flex flex-col items-center gap-2 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
      style={{ order: orders[pos] }}
    >
      {/* Avatares */}
      <div className="flex -space-x-3">
        <img
          src={getAvatar(match.a.id, match.a.foto_url)}
          alt={match.a.nombre}
          className="w-12 h-12 rounded-full border-2 border-datinder-yellow object-cover"
        />
        <img
          src={getAvatar(match.b.id, match.b.foto_url)}
          alt={match.b.nombre}
          className="w-12 h-12 rounded-full border-2 border-datinder-yellow object-cover"
        />
      </div>
      <div className="text-center">
        <p className="text-white font-bold text-sm">{nombreCompleto(match.a)} <span className="text-datinder-yellow">+</span> {nombreCompleto(match.b)}</p>
        <p className="text-datinder-yellow font-black text-xl">{Math.round(match.afinidad)}%</p>
      </div>
      {/* Bloque podio */}
      <div className={`w-24 ${heights[pos]} bg-datinder-yellow/20 border-2 border-datinder-yellow rounded-t-lg flex items-start justify-center pt-2`}>
        <span className="text-3xl">{medals[pos]}</span>
      </div>
    </div>
  );
}

export function Podium({ matches, compacto = false }: PodiumProps) {
  const top3 = matches.slice(0, 3);

  return (
    <div className="relative">
      <Confetti />

      <div className={`text-center ${compacto ? 'mb-4' : 'mb-8'}`}>
        <h2 className="text-datinder-yellow font-black text-4xl mb-1">🏆 ¡Resultados Finales!</h2>
        <p className="text-white/60">Las parejas con mayor compatibilidad del evento</p>
      </div>

      {/* Pódium */}
      <div className={`flex items-end justify-center gap-4 ${compacto ? 'mb-6' : 'mb-10'}`}>
        {top3.map((m, i) => (
          <PodiumSlot
            key={`${m.a.id}-${m.b.id}`}
            match={m}
            pos={(i + 1) as 1 | 2 | 3}
            delay={i * 400 + 200}
          />
        ))}
      </div>

      {/* Botón CSV en compacto */}
      {compacto && (
        <div className="text-center">
          <Button variant="yellow" onClick={() => exportarRankingCSV(matches)}>
            <Download className="w-4 h-4 mr-1" /> Descargar ranking CSV
          </Button>
        </div>
      )}
    </div>
  );
}
