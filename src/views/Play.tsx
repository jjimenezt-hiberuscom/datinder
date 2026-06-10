import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from '@/context/SessionContext';
import { useRealtimeSession } from '@/hooks/useRealtimeSession';
import { PersonalResults } from '@/components/final/PersonalResults';
import { db } from '@/db';

export function Play() {
  const navigate = useNavigate();
  const { usuario, sesion, logout } = useSession();
  const { sesion: sesionLive, preguntaActual, respuestas, usuarios, preguntas } = useRealtimeSession(sesion?.id ?? null);
  const [votando, setVotando] = useState(false);
  const [elegida, setElegida] = useState<'A' | 'B' | null>(null);

  useEffect(() => {
    if (!usuario || !sesion) { navigate('/'); return; }
  }, [usuario, sesion, navigate]);

  // Reset elegida al cambiar de pregunta
  useEffect(() => {
    setElegida(null);
  }, [preguntaActual?.id]);

  // Verificar si ya votó en la pregunta actual
  const yaVoto = preguntaActual
    ? respuestas.some(r => r.usuario_id === usuario?.id && r.pregunta_id === preguntaActual.id)
    : false;

  async function votar(eleccion: 'A' | 'B') {
    if (!usuario || !sesion || !preguntaActual || yaVoto || votando) return;
    setVotando(true);
    setElegida(eleccion);
    await db.votar(usuario.id, preguntaActual.id, eleccion, sesion.id);
    setVotando(false);
  }

  if (!usuario || !sesion) return null;

  // Estado finalizado
  if (sesionLive?.estado === 'finalizado') {
    return (
      <PersonalResults
        usuarioId={usuario.id}
        usuarioNombre={usuario.nombre}
        usuarios={usuarios}
        preguntas={preguntas}
        respuestas={respuestas}
        sesionCodigo={sesionLive.codigo_acceso}
        onLogout={logout}
      />
    );
  }

  // Estado espera
  if (sesionLive?.estado === 'espera') {
    return (
      <div className="min-h-screen bg-datinder-bg flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-datinder-yellow animate-spin mb-4" />
        <h2 className="text-white font-bold text-xl">Pausa</h2>
        <p className="text-white/40 mt-2">El presentador reanudará en breve...</p>
      </div>
    );
  }

  // Sin pregunta activa
  if (!preguntaActual) {
    return (
      <div className="min-h-screen bg-datinder-bg flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-datinder-yellow animate-spin mb-4" />
        <p className="text-white/60">Esperando la primera pregunta...</p>
      </div>
    );
  }

  // Ya votó
  if (yaVoto || elegida) {
    return (
      <div className="min-h-screen bg-datinder-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="animate-bounce-in">
          <CheckCircle2 className="w-20 h-20 text-datinder-yellow mx-auto mb-4" />
          <h2 className="text-white font-black text-2xl mb-2">¡Voto registrado!</h2>
          <p className="text-white/60 text-lg">Mira la pantalla principal 📺</p>
          {elegida && (
            <p className="text-datinder-yellow/60 text-sm mt-3">
              Has elegido: Opción {elegida}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Votación activa
  return (
    <div className="min-h-screen bg-datinder-bg flex flex-col p-4">
      {/* Enunciado */}
      <div className="flex-shrink-0 pt-8 pb-6 px-2 text-center">
        <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Pregunta</p>
        <h2 className="text-white font-bold text-xl leading-snug">
          {preguntaActual.enunciado}
        </h2>
      </div>

      {/* Botones de voto gigantes */}
      <div className="flex-1 flex flex-col gap-4">
        <button
          onClick={() => votar('A')}
          disabled={votando}
          className="flex-1 bg-white/10 hover:bg-white/20 active:scale-95 border-2 border-white/20 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all duration-150 disabled:opacity-50"
        >
          <span className="text-5xl">A</span>
          <span className="text-white font-bold text-xl text-center px-4 leading-snug">
            {preguntaActual.opcion_a}
          </span>
        </button>

        <button
          onClick={() => votar('B')}
          disabled={votando}
          className="flex-1 bg-datinder-yellow/10 hover:bg-datinder-yellow/20 active:scale-95 border-2 border-datinder-yellow/30 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all duration-150 disabled:opacity-50"
        >
          <span className="text-5xl text-datinder-yellow">B</span>
          <span className="text-white font-bold text-xl text-center px-4 leading-snug">
            {preguntaActual.opcion_b}
          </span>
        </button>
      </div>

      <div className="flex-shrink-0 pb-6 pt-4 text-center">
        <Button variant="ghost" size="sm" className="text-white/20 text-xs gap-1" onClick={logout}>
          <LogOut className="w-3 h-3" /> Salir
        </Button>
      </div>
    </div>
  );
}
