import { Heart } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Match } from '@/types';

interface MatchesListProps {
  matches: Match[];
}

export function MatchesList({ matches }: MatchesListProps) {
  if (matches.length === 0) return null;

  return (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <Heart className="w-4 h-4 text-datinder-yellow fill-datinder-yellow" />
        <h3 className="text-datinder-yellow font-bold text-sm uppercase tracking-widest">Matches</h3>
      </div>
      <ScrollArea className="h-56">
        <div className="space-y-2 pr-2">
          {matches.slice(0, 20).map((m, i) => (
            <div
              key={`${m.a.id}-${m.b.id}`}
              className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2 animate-fade-in"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-white/40 text-xs w-5 text-center font-mono">{i + 1}</span>
                <div className="flex items-center gap-1 min-w-0">
                  <img
                    src={m.a.foto_url ?? `https://i.pravatar.cc/32?u=${m.a.id}`}
                    alt={m.a.nombre}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${m.a.nombre}&size=32`; }}
                  />
                  <span className="text-white text-xs font-medium truncate">{m.a.nombre}</span>
                  <span className="text-datinder-yellow text-xs">+</span>
                  <img
                    src={m.b.foto_url ?? `https://i.pravatar.cc/32?u=${m.b.id}`}
                    alt={m.b.nombre}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${m.b.nombre}&size=32`; }}
                  />
                  <span className="text-white text-xs font-medium truncate">{m.b.nombre}</span>
                </div>
              </div>
              <div className="flex-shrink-0 ml-2">
                <span className="text-datinder-yellow font-black text-sm tabular-nums">
                  {Math.round(m.afinidad)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
