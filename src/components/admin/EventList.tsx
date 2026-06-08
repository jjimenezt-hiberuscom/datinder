import { useState, useEffect } from 'react';
import { Plus, Copy, ExternalLink, Trash2, CopyPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { db } from '@/db';
import type { Sesion } from '@/types';
import { getBoardUrl } from '@/config';

export function EventList() {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { void cargar(); }, []);

  async function cargar() {
    const s = await db.listarSesiones();
    setSesiones(s);
  }

  async function crearEvento() {
    if (!nombre.trim()) return;
    setLoading(true);
    await db.crearSesion(nombre.trim());
    setNombre('');
    await cargar();
    setLoading(false);
  }

  function copiar(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  async function clonarEvento(s: Sesion) {
    const nuevoNombre = prompt('Nombre del nuevo evento:', `${s.nombre_evento} — Copia`);
    if (!nuevoNombre?.trim()) return;
    setLoading(true);
    await db.clonarSesion(s.id, nuevoNombre.trim());
    await cargar();
    setLoading(false);
  }

  async function eliminarEvento(s: Sesion) {
    if (!confirm(`¿Eliminar "${s.nombre_evento}"? Se borrarán todas sus preguntas, participantes y respuestas.`)) return;
    setLoading(true);
    await db.eliminarSesion(s.id);
    await cargar();
    setLoading(false);
  }

  const estadoColor: Record<string, 'default' | 'yellow' | 'destructive'> = {
    espera: 'default',
    jugando: 'yellow',
    finalizado: 'destructive',
  };

  return (
    <div className="space-y-6">
      {/* Crear evento */}
      <div className="flex gap-2">
        <Input
          placeholder="Nombre del evento (ej. Afterwork Madrid 2026)"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && void crearEvento()}
          className="flex-1"
        />
        <Button variant="yellow" onClick={crearEvento} disabled={loading || !nombre.trim()}>
          <Plus className="w-4 h-4 mr-1" /> Crear
        </Button>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {sesiones.map(s => {
          const boardUrl = getBoardUrl(s.codigo_acceso);
          return (
            <div key={s.id} className="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold truncate">{s.nombre_evento}</h3>
                  <Badge variant={estadoColor[s.estado] ?? 'default'}>
                    {s.estado}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  Código: <span className="font-mono font-bold">{s.codigo_acceso}</span>
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => copiar(s.codigo_acceso)}>
                  <Copy className="w-3 h-3 mr-1" /> Código
                </Button>
                <Button variant="outline" size="sm" onClick={() => copiar(boardUrl)}>
                  <Copy className="w-3 h-3 mr-1" /> URL Proyector
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={`/board/${s.codigo_acceso}?rol=presentador`} target="_blank" rel="noreferrer">
                    <ExternalLink className="w-3 h-3 mr-1" /> Abrir
                  </a>
                </Button>
                <Button variant="outline" size="sm" onClick={() => void clonarEvento(s)} disabled={loading}>
                  <CopyPlus className="w-3 h-3 mr-1" /> Clonar
                </Button>
                <Button variant="outline" size="sm" onClick={() => void eliminarEvento(s)} disabled={loading}
                  className="text-destructive border-destructive/30 hover:bg-destructive/10">
                  <Trash2 className="w-3 h-3 mr-1" /> Eliminar
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
