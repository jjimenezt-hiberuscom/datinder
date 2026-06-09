import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/context/SessionContext';
import { db } from '@/db';
import { uploadFoto } from '@/lib/storage';
import type { Area } from '@/types';
import { AREA_LABELS } from '@/types';

export function Login() {
  const navigate = useNavigate();
  const { usuario, sesion, setUsuario, setSesion } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Si ya hay sesión activa (localStorage), redirigir sin pasar por el login
  React.useEffect(() => {
    if (usuario && sesion) {
      navigate(sesion.estado === 'espera' ? '/lobby' : '/play', { replace: true });
    }
  }, [usuario, sesion, navigate]);

  // Formulario invitado
  const [form, setForm] = useState({ nombre: '', apellidos: '', area: '' as Area | '' });
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);
  // Código de sesión
  const [codigo, setCodigo] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('codigo') ?? '';
  });

  // Step: 'login' | 'codigo'
  const [step, setStep] = useState<'login' | 'codigo'>('login');
  const [pendingUser, setPendingUser] = useState<{ nombre: string; apellidos: string; foto_url: string; area: Area | '' } | null>(null);

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  function handleGuestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.apellidos.trim()) { setError('Nombre y apellidos son obligatorios'); return; }
    if (!form.area) { setError('Selecciona tu área'); return; }
    setPendingUser({ ...form, foto_url: fotoPreview ?? '' });
    setStep('codigo');
    setError('');
  }

  async function handleCodigo(e: React.FormEvent) {
    e.preventDefault();
    if (!codigo.trim()) { setError('Introduce el código de la sesión'); return; }
    setLoading(true);
    setError('');
    try {
      const sesion = await db.getSesionPorCodigo(codigo.trim());
      if (!sesion) { setError('Código no encontrado. Comprueba que el evento esté activo.'); setLoading(false); return; }
      let foto_url = pendingUser?.foto_url ?? '';
      if (fotoFile && pendingUser) {
        try {
          foto_url = await uploadFoto(fotoFile, `${pendingUser.nombre}-${pendingUser.apellidos}`);
        } catch { /* foto opcional, continuar sin ella */ }
      }
      const usuario = await db.unirse(sesion.id, {
        ...pendingUser!,
        foto_url: foto_url || undefined,
        tipo: 'invitado',
        area: pendingUser!.area || undefined,
      });
      setUsuario(usuario);
      setSesion(sesion);
      navigate('/lobby');
    } catch {
      setError('Error al unirse. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-datinder-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="search-mmatch-tica" className="h-20 mx-auto" />
          <p className="text-white/50 text-sm mt-3">Compatibilidad en tiempo real</p>
        </div>

        {step === 'login' ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6">
              <form onSubmit={handleGuestSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-white/70 text-xs">Nombre *</Label>
                    <Input
                      placeholder="Ana"
                      value={form.nombre}
                      onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/30 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-white/70 text-xs">Apellidos *</Label>
                    <Input
                      placeholder="García"
                      value={form.apellidos}
                      onChange={e => setForm(f => ({ ...f, apellidos: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/30 mt-1"
                    />
                  </div>
                </div>

                {/* Área */}
                <div>
                  <Label className="text-white/70 text-xs">Área *</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {(Object.keys(AREA_LABELS) as Area[]).map(a => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, area: a }))}
                        className={`py-2 px-1 rounded-lg text-xs font-bold border-2 transition-all ${
                          form.area === a
                            ? 'bg-datinder-yellow text-datinder-bg border-datinder-yellow'
                            : 'bg-white/5 text-white/60 border-white/20 hover:border-white/40'
                        }`}
                      >
                        {AREA_LABELS[a]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Foto selfie */}
                <div className="flex items-center gap-3 py-1">
                  <input
                    ref={fotoInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    onChange={handleFotoChange}
                  />
                  {fotoPreview ? (
                    <img
                      src={fotoPreview}
                      alt="Tu foto"
                      className="w-12 h-12 rounded-full object-cover border-2 border-datinder-yellow flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                      <Camera className="w-5 h-5 text-white/30" />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-white/60 border border-white/20 hover:bg-white/10 hover:text-white text-xs gap-1"
                    onClick={() => fotoInputRef.current?.click()}
                  >
                    <Camera className="w-3 h-3" />
                    {fotoPreview ? 'Cambiar foto' : 'Hazte una foto'}
                  </Button>
                </div>

                {error && <p className="text-red-400 text-xs">{error}</p>}
                <Button type="submit" variant="yellow" className="w-full gap-2">
                  Continuar <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg text-center">
                {pendingUser && (
                  <div className="flex flex-col items-center gap-3 mb-2">
                    <img
                      src={pendingUser.foto_url}
                      alt={pendingUser.nombre}
                      className="w-16 h-16 rounded-full border-2 border-datinder-yellow object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${pendingUser.nombre}`; }}
                    />
                    <div>
                      <p className="text-white font-bold">{pendingUser.nombre} {pendingUser.apellidos}</p>
                    </div>
                  </div>
                )}
                Introduce el código del evento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCodigo} className="space-y-3">
                <Input
                  placeholder="Ej. AFTERWORK"
                  value={codigo}
                  onChange={e => setCodigo(e.target.value.toUpperCase())}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 text-center text-xl font-bold tracking-widest uppercase"
                  autoFocus
                />
                {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                <Button type="submit" variant="yellow" className="w-full gap-2" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  Entrar al evento
                </Button>
                <Button variant="ghost" className="w-full text-white/40 text-xs" onClick={() => { setStep('login'); setError(''); }}>
                  ← Volver
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
