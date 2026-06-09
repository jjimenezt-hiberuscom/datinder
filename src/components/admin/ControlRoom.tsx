import { UserX, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { db } from '@/db';
import type { Sesion, Pregunta, Usuario, Respuesta } from '@/types';

interface Props {
  sesion: Sesion;
  preguntas: Pregunta[];
  usuarios: Usuario[];
  respuestas: Respuesta[];
  preguntaActual: Pregunta | null;
  onReload: () => void;
}

export function ControlRoom({ sesion, preguntas, usuarios, respuestas, preguntaActual, onReload }: Props) {
  async function expulsar(uid: string) {
    if (!confirm('¿Expulsar a este usuario?')) return;
    await db.expulsar(uid);
    onReload();
  }

  async function siguiente() {
    const sorted = [...preguntas].sort((a, b) => a.orden - b.orden);
    const idx = sorted.findIndex(p => p.id === preguntaActual?.id);
    if (idx < sorted.length - 1) {
      await db.setPreguntaActual(sesion.id, sorted[idx + 1].id);
      if (sesion.estado !== 'jugando') await db.setEstado(sesion.id, 'jugando');
    } else {
      await db.setEstado(sesion.id, 'finalizado');
    }
    onReload();
  }

  async function pausar() {
    await db.setEstado(sesion.id, sesion.estado === 'espera' ? 'jugando' : 'espera');
    onReload();
  }

  async function reiniciar() {
    if (!confirm('¿Reiniciar el quiz? Se borrarán todas las respuestas.')) return;
    await db.borrarRespuestasDeSesion(sesion.id);
    const sorted = [...preguntas].sort((a, b) => a.orden - b.orden);
    if (sorted.length > 0) await db.setPreguntaActual(sesion.id, sorted[0].id);
    await db.setEstado(sesion.id, 'jugando');
    onReload();
  }

  // % de abandono: usuarios que NO han votado en la pregunta actual
  const votadosActual = preguntaActual
    ? new Set(respuestas.filter(r => r.pregunta_id === preguntaActual.id).map(r => r.usuario_id))
    : new Set<string>();
  const abandono = usuarios.length > 0
    ? Math.round(((usuarios.length - votadosActual.size) / usuarios.length) * 100)
    : 0;

  const estadoIcon: Record<string, string> = { espera: '⏸️', jugando: '▶️', finalizado: '🏁' };

  return (
    <div className="space-y-6">
      {/* Estado y controles */}
      <div className="flex items-center gap-4 flex-wrap">
        <Badge variant={sesion.estado === 'jugando' ? 'yellow' : 'default'} className="text-sm px-3 py-1">
          {estadoIcon[sesion.estado]} {sesion.estado}
        </Badge>
        <span className="text-muted-foreground text-sm">
          Pregunta: <strong>{preguntaActual?.orden ?? '—'} / {preguntas.length}</strong>
        </span>
        <span className="text-muted-foreground text-sm">
          Abandono: <strong className={abandono > 30 ? 'text-destructive' : 'text-green-600'}>{abandono}%</strong>
        </span>
        <div className="flex gap-2 ml-auto">
          <Button variant="yellow" size="sm" onClick={siguiente} disabled={sesion.estado === 'finalizado'}>
            <ChevronRight className="w-4 h-4 mr-1" /> Siguiente
          </Button>
          <Button variant="outline" size="sm" onClick={pausar}>
            {sesion.estado === 'espera' ? <><Play className="w-3 h-3 mr-1" />Reanudar</> : <><Pause className="w-3 h-3 mr-1" />Pausar</>}
          </Button>
          <Button variant="outline" size="sm" onClick={reiniciar}>
            <RotateCcw className="w-3 h-3 mr-1" /> Reiniciar
          </Button>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {usuarios.map(u => {
          const haVotado = votadosActual.has(u.id);
          return (
            <div key={u.id} className="border rounded-xl p-3 flex items-center gap-3">
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarImage src={u.foto_url} alt={u.nombre} />
                <AvatarFallback className="text-xs">{u.nombre[0]}{u.apellidos?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{u.nombre} {u.apellidos}</p>
                <p className="text-muted-foreground text-xs truncate">{u.empresa ?? 'Invitado'}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <div className={`w-2 h-2 rounded-full ${haVotado ? 'bg-green-500' : 'bg-yellow-500'}`} title={haVotado ? 'Ha votado' : 'Sin voto'} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => expulsar(u.id)}
                  title="Expulsar"
                >
                  <UserX className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
