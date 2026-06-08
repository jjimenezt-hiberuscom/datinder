import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowRight, Loader2, Link2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/context/SessionContext';
import { db } from '@/db';
import { uploadFoto } from '@/lib/storage';

// Perfiles LinkedIn simulados
const LINKEDIN_PROFILES = [
  { nombre: 'María', apellidos: 'González Ruiz', empresa: 'Google Spain', cargo: 'Senior PM', foto_url: 'https://i.pravatar.cc/150?img=47' },
  { nombre: 'Alejandro', apellidos: 'Pérez Muñoz', empresa: 'Santander Tech', cargo: 'Tech Lead', foto_url: 'https://i.pravatar.cc/150?img=52' },
  { nombre: 'Patricia', apellidos: 'López Vidal', empresa: 'Accenture', cargo: 'Consultant', foto_url: 'https://i.pravatar.cc/150?img=44' },
  { nombre: 'Sergio', apellidos: 'Morales Cano', empresa: 'Indra', cargo: 'DevOps', foto_url: 'https://i.pravatar.cc/150?img=57' },
];

export function Login() {
  const navigate = useNavigate();
  const { setUsuario, setSesion } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Formulario invitado
  const [form, setForm] = useState({ nombre: '', apellidos: '', empresa: '', cargo: '' });
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
  const [pendingUser, setPendingUser] = useState<typeof LINKEDIN_PROFILES[0] | null>(null);

  async function handleLinkedIn() {
    setLoading(true);
    // Simular OAuth delay
    await new Promise(r => setTimeout(r, 1200));
    const profile = LINKEDIN_PROFILES[Math.floor(Math.random() * LINKEDIN_PROFILES.length)];
    setPendingUser(profile);
    setStep('codigo');
    setLoading(false);
  }

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  function handleGuestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.apellidos.trim()) { setError('Nombre y apellidos son obligatorios'); return; }
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
        tipo: pendingUser?.empresa ? 'linkedin' : 'invitado',
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
          <h1 className="text-datinder-yellow font-black text-4xl tracking-tight">Datinder</h1>
          <p className="text-white/50 text-sm mt-1">Compatibilidad en tiempo real</p>
        </div>

        {step === 'login' ? (
          <Tabs defaultValue="linkedin" className="w-full">
            <TabsList className="w-full bg-white/10 text-white/60">
              <TabsTrigger value="linkedin" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-datinder-bg">
                <Link2 className="w-4 h-4 mr-2" /> LinkedIn
              </TabsTrigger>
              <TabsTrigger value="invitado" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-datinder-bg">
                <User className="w-4 h-4 mr-2" /> Invitado
              </TabsTrigger>
            </TabsList>

            <TabsContent value="linkedin">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-6 space-y-4">
                  <p className="text-white/70 text-sm text-center">Accede con tu perfil de LinkedIn para importar tus datos profesionales automáticamente.</p>
                  <Button
                    variant="yellow"
                    className="w-full gap-2"
                    onClick={handleLinkedIn}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                    Continuar con LinkedIn
                  </Button>
                  <p className="text-white/30 text-xs text-center">* Simulación OAuth para demo</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invitado">
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
                    <div>
                      <Label className="text-white/70 text-xs">Empresa (opcional)</Label>
                      <Input
                        placeholder="Acme Inc."
                        value={form.empresa}
                        onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/30 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-white/70 text-xs">Cargo (opcional)</Label>
                      <Input
                        placeholder="Product Manager"
                        value={form.cargo}
                        onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/30 mt-1"
                      />
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
            </TabsContent>
          </Tabs>
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
                      {pendingUser.empresa && <p className="text-white/50 text-sm font-normal">{pendingUser.cargo} · {pendingUser.empresa}</p>}
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
