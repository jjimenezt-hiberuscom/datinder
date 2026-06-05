import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/db';
import type { Pregunta, Sesion } from '@/types';

interface Props { sesion: Sesion }

export function QuestionsCrud({ sesion }: Props) {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [nuevo, setNuevo] = useState({ enunciado: '', opcion_a: '', opcion_b: '', peso: 1 });

  useEffect(() => { void cargar(); }, [sesion.id]);

  async function cargar() {
    const ps = await db.listarPreguntas(sesion.id);
    setPreguntas(ps);
  }

  async function agregar() {
    if (!nuevo.enunciado || !nuevo.opcion_a || !nuevo.opcion_b) return;
    const maxOrden = preguntas.length > 0 ? Math.max(...preguntas.map(p => p.orden)) : 0;
    await db.crearPregunta(sesion.id, { ...nuevo, orden: maxOrden + 1 });
    setNuevo({ enunciado: '', opcion_a: '', opcion_b: '', peso: 1 });
    await cargar();
  }

  async function borrar(id: string) {
    if (!confirm('¿Borrar esta pregunta?')) return;
    await db.borrarPregunta(id);
    await cargar();
  }

  async function mover(id: string, dir: 'up' | 'down') {
    const sorted = [...preguntas].sort((a, b) => a.orden - b.orden);
    const idx = sorted.findIndex(p => p.id === id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[swapIdx];
    await Promise.all([
      db.actualizarPregunta(a.id, { orden: b.orden }),
      db.actualizarPregunta(b.id, { orden: a.orden }),
    ]);
    await cargar();
  }

  async function cambiarPeso(id: string, peso: number) {
    await db.actualizarPregunta(id, { peso });
    await cargar();
  }

  const sorted = [...preguntas].sort((a, b) => a.orden - b.orden);

  return (
    <div className="space-y-6">
      {/* Formulario nuevo */}
      <div className="border rounded-xl p-4 space-y-3 bg-muted/30">
        <h3 className="font-semibold text-sm">Nueva pregunta</h3>
        <Input placeholder="Enunciado de la pregunta" value={nuevo.enunciado} onChange={e => setNuevo(p => ({ ...p, enunciado: e.target.value }))} />
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Opción A" value={nuevo.opcion_a} onChange={e => setNuevo(p => ({ ...p, opcion_a: e.target.value }))} />
          <Input placeholder="Opción B" value={nuevo.opcion_b} onChange={e => setNuevo(p => ({ ...p, opcion_b: e.target.value }))} />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-muted-foreground">Peso:</label>
          <div className="flex gap-2">
            {[1, 2, 3].map(w => (
              <button
                key={w}
                onClick={() => setNuevo(p => ({ ...p, peso: w }))}
                className={`px-3 py-1 rounded-md text-sm font-medium border transition-colors ${
                  nuevo.peso === w ? 'bg-datinder-yellow text-datinder-bg border-datinder-yellow' : 'border-input hover:bg-muted'
                }`}
              >
                {w}{w === 3 ? ' ⭐' : ''}
              </button>
            ))}
          </div>
          <Button variant="yellow" size="sm" className="ml-auto" onClick={agregar}>
            <Plus className="w-4 h-4 mr-1" /> Agregar
          </Button>
        </div>
      </div>

      {/* Lista de preguntas */}
      <div className="space-y-2">
        {sorted.map((p, i) => (
          <div key={p.id} className="border rounded-xl p-3 flex gap-3 items-start">
            <div className="flex flex-col gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" disabled={i === 0} onClick={() => mover(p.id, 'up')}>
                <ChevronUp className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" disabled={i === sorted.length - 1} onClick={() => mover(p.id, 'down')}>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs font-mono w-6">{p.orden}.</span>
                <span className="font-medium text-sm truncate">{p.enunciado}</span>
                {p.peso >= 3 && <span className="text-yellow-500 text-xs">⭐ estratégica</span>}
              </div>
              <div className="flex gap-4 mt-1 ml-8">
                <span className="text-xs text-muted-foreground">A: {p.opcion_a}</span>
                <span className="text-xs text-muted-foreground">B: {p.opcion_b}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {[1, 2, 3].map(w => (
                <button
                  key={w}
                  onClick={() => cambiarPeso(p.id, w)}
                  className={`px-2 py-0.5 rounded text-xs font-medium border transition-colors ${
                    p.peso === w ? 'bg-datinder-yellow text-datinder-bg border-datinder-yellow' : 'border-input hover:bg-muted'
                  }`}
                >
                  {w}
                </button>
              ))}
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => borrar(p.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No hay preguntas. Agrega la primera arriba.</p>
        )}
      </div>
    </div>
  );
}
