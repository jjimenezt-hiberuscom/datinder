import { CheckCircle } from 'lucide-react';
import { VoteBar } from './VoteBar';
import type { Pregunta, Respuesta, Sesion } from '@/types';

interface MainPanelProps {
  sesion: Sesion;
  preguntaActual: Pregunta | null;
  preguntas: Pregunta[];
  respuestas: Respuesta[];
}

const EMOJIS_A = ['🅰️', '⚡', '🌅', '🚀', '💡', '📈', '🏆', '🔥', '✨', '🎯'];
const EMOJIS_B = ['🅱️', '🌙', '🦉', '🏛️', '🔒', '🧠', '🤝', '❄️', '💫', '🎲'];

export function MainPanel({ sesion, preguntaActual, preguntas, respuestas }: MainPanelProps) {
  const total = preguntas.length;
  const actual = preguntas.findIndex(p => p.id === preguntaActual?.id) + 1;

  const respuestasDePregunta = preguntaActual
    ? respuestas.filter(r => r.pregunta_id === preguntaActual.id)
    : [];
  const votosA = respuestasDePregunta.filter(r => r.eleccion === 'A').length;
  const votosB = respuestasDePregunta.filter(r => r.eleccion === 'B').length;
  const totalVotos = votosA + votosB;

  const emojiIdx = actual % EMOJIS_A.length;

  if (sesion.estado === 'espera') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-datinder-yellow/20 flex items-center justify-center mx-auto animate-pulse-slow">
            <span className="text-4xl">⏳</span>
          </div>
          <h2 className="text-white text-3xl font-bold">Esperando...</h2>
          <p className="text-white/50">El presentador reanudará en breve</p>
        </div>
      </div>
    );
  }

  if (!preguntaActual) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl">📋</span>
          <p className="text-white/50 mt-4">No hay pregunta activa</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Progreso */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-datinder-yellow font-black text-xl uppercase tracking-widest">
            Pregunta {actual} / {total}
          </span>
          <div className="flex gap-1">
            {preguntas.sort((a, b) => a.orden - b.orden).map((p, i) => (
              <div
                key={p.id}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i < actual - 1 ? 'bg-datinder-yellow w-4' :
                  i === actual - 1 ? 'bg-datinder-yellow w-6' :
                  'bg-white/20 w-3'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5">
          <CheckCircle className="w-4 h-4 text-datinder-yellow" />
          <span className="text-white font-bold tabular-nums">{totalVotos}</span>
          <span className="text-white/50 text-sm">respuestas</span>
        </div>
      </div>

      {/* Tarjeta de pregunta */}
      <div className="flex-1 bg-white rounded-3xl p-8 flex items-center justify-center shadow-2xl">
        <h2 className="text-datinder-bg text-3xl xl:text-4xl font-bold text-center leading-snug max-w-2xl">
          {preguntaActual.enunciado}
          {preguntaActual.peso >= 3 && (
            <span className="ml-2 text-yellow-500 text-2xl" title="Pregunta estratégica">⭐</span>
          )}
        </h2>
      </div>

      {/* Barras de voto */}
      <div className="space-y-5">
        <VoteBar
          label="Opción A"
          opcion={preguntaActual.opcion_a}
          votos={votosA}
          total={totalVotos}
          emoji={EMOJIS_A[emojiIdx]}
        />
        <VoteBar
          label="Opción B"
          opcion={preguntaActual.opcion_b}
          votos={votosB}
          total={totalVotos}
          emoji={EMOJIS_B[emojiIdx]}
        />
      </div>
    </div>
  );
}
