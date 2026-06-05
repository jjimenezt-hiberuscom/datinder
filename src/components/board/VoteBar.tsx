import { cn } from '@/lib/utils';

interface VoteBarProps {
  label: string;
  opcion: string;
  votos: number;
  total: number;
  color?: string;
  emoji?: string;
}

export function VoteBar({ label, opcion, votos, total, emoji }: VoteBarProps) {
  const pct = total > 0 ? Math.round((votos / total) * 100) : 0;

  return (
    <div className="flex items-center gap-4">
      {/* Label */}
      <div className="w-24 flex-shrink-0 text-right">
        <span className="text-white/70 font-bold text-lg">{label}</span>
      </div>

      {/* Barra + opción */}
      <div className="flex-1 min-w-0">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-white text-base font-medium truncate">{emoji} {opcion}</span>
          <span className="text-white/60 text-sm ml-2 flex-shrink-0">{votos} votos</span>
        </div>
        <div className="h-7 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-datinder-yellow rounded-full transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Porcentaje gigante */}
      <div className="w-20 flex-shrink-0 text-right">
        <span
          className={cn(
            'text-4xl font-black tabular-nums transition-all duration-500',
            pct >= 50 ? 'text-datinder-yellow' : 'text-white/60'
          )}
        >
          {pct}%
        </span>
      </div>
    </div>
  );
}
