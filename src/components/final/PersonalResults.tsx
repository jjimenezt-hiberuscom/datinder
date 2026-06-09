import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calcularMatches } from '@/lib/afinidad';
import { nombreCompleto } from '@/lib/utils';
import { getAvatar } from '@/lib/avatar';
import type { Usuario, Pregunta, Respuesta } from '@/types';

interface PersonalResultsProps {
  usuarioId: string;
  usuarioNombre: string;
  usuarios: Usuario[];
  preguntas: Pregunta[];
  respuestas: Respuesta[];
  sesionCodigo: string;
  onLogout: () => void;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export function PersonalResults({ usuarioId, usuarioNombre, usuarios, preguntas, respuestas, sesionCodigo, onLogout }: PersonalResultsProps) {
  const allMatches = calcularMatches(usuarios, preguntas, respuestas);

  const myMatches = allMatches
    .filter(m => m.a.id === usuarioId || m.b.id === usuarioId)
    .map(m => ({ otro: m.a.id === usuarioId ? m.b : m.a, afinidad: m.afinidad }))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-datinder-bg flex flex-col items-center justify-center p-6 text-center">
      <span className="text-5xl mb-4">🎉</span>
      <h2 className="text-datinder-yellow font-black text-2xl mb-1">¡Has terminado, {usuarioNombre}!</h2>

      {allMatches.length > 0 ? (
        <>
          <p className="text-white/60 text-sm mb-6">Tus mejores matches:</p>
          <div className="w-full max-w-xs space-y-3 mb-6">
            {myMatches.map((m, i) => (
              <div key={m.otro.id} className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3 border border-white/10">
                <span className="text-2xl w-8">{MEDALS[i]}</span>
                <img
                  src={getAvatar(m.otro.id, m.otro.foto_url)}
                  alt={nombreCompleto(m.otro)}
                  className="w-10 h-10 rounded-full object-cover border-2 border-datinder-yellow flex-shrink-0"
                />
                <span className="text-white font-medium text-sm flex-1 text-left truncate">{nombreCompleto(m.otro)}</span>
                <span className="text-datinder-yellow font-black text-lg tabular-nums">{Math.round(m.afinidad)}%</span>
              </div>
            ))}
            {myMatches.length === 0 && (
              <p className="text-white/40 text-sm">Aún no hay matches disponibles para ti.</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/50 border border-white/20 mb-4"
            onClick={() => { window.location.href = `/board/${sesionCodigo}`; }}
          >
            Ver pódium general 🏆
          </Button>
        </>
      ) : (
        <p className="text-white/50 text-sm mb-6 max-w-xs">
          No hubo suficientes preguntas respondidas para calcular tus matches.
          <br />
          <span className="text-white/30 text-xs">Se necesitan al menos 5 preguntas.</span>
        </p>
      )}

      <Button variant="ghost" className="text-white/30 gap-2 text-xs" onClick={onLogout}>
        <LogOut className="w-3 h-3" /> Salir
      </Button>
    </div>
  );
}
