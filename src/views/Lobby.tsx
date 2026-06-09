import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from '@/context/SessionContext';
import { useRealtimeSession } from '@/hooks/useRealtimeSession';

export function Lobby() {
  const navigate = useNavigate();
  const { usuario, sesion, logout } = useSession();
  const { sesion: sesionLive, usuarios } = useRealtimeSession(sesion?.id ?? null);

  useEffect(() => {
    if (!usuario || !sesion) { navigate('/'); return; }
  }, [usuario, sesion, navigate]);

  useEffect(() => {
    if (sesionLive?.estado === 'jugando') {
      navigate('/play');
    }
  }, [sesionLive?.estado, navigate]);

  if (!usuario || !sesion) return null;

  return (
    <div className="min-h-screen bg-datinder-bg flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <img src="/logo.png" alt="search-mmatch-tica" className="h-20 mx-auto mb-8" />

      {/* Tarjeta usuario */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center mb-6">
        <img
          src={usuario.foto_url ?? `https://i.pravatar.cc/80?u=${usuario.id}`}
          alt={usuario.nombre}
          className="w-20 h-20 rounded-full border-2 border-datinder-yellow object-cover mx-auto mb-3"
          onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${usuario.nombre}&background=ffd60a&color=0d1b2a`; }}
        />
        <h2 className="text-white font-bold text-lg">{usuario.nombre} {usuario.apellidos}</h2>
        {usuario.empresa && <p className="text-white/50 text-sm">{usuario.cargo} · {usuario.empresa}</p>}
        <div className="mt-3 bg-white/10 rounded-lg px-4 py-1 inline-block">
          <span className="text-datinder-yellow font-mono font-bold">{sesion.codigo_acceso}</span>
        </div>
      </div>

      {/* Esperando */}
      <div className="text-center mb-8 space-y-3">
        <div className="flex items-center gap-2 justify-center">
          <Loader2 className="w-5 h-5 text-datinder-yellow animate-spin" />
          <span className="text-white font-medium">Esperando a que empiece el quiz...</span>
        </div>
        <p className="text-white/40 text-sm">El presentador activará el juego en breve</p>
      </div>

      {/* Contador */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4 w-full max-w-sm">
        <div className="bg-datinder-yellow/20 rounded-full p-3">
          <Users className="w-6 h-6 text-datinder-yellow" />
        </div>
        <div>
          <p className="text-white font-black text-3xl tabular-nums">{usuarios.length}</p>
          <p className="text-white/50 text-sm">participantes conectados</p>
        </div>
      </div>

      <Button variant="ghost" className="mt-8 text-white/30 text-sm gap-2" onClick={logout}>
        <LogOut className="w-4 h-4" /> Salir
      </Button>
    </div>
  );
}
