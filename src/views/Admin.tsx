import React, { useState, useEffect } from 'react';
import { Settings, Users, List, Database, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventList } from '@/components/admin/EventList';
import { QuestionsCrud } from '@/components/admin/QuestionsCrud';
import { ControlRoom } from '@/components/admin/ControlRoom';
import { SqlTab } from '@/components/admin/SqlTab';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useRealtimeSession } from '@/hooks/useRealtimeSession';
import { db } from '@/db';
import type { Sesion } from '@/types';

function AdminLogin({ onLogin }: { onLogin: (u: string, p: string) => boolean }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const ok = onLogin(user, pass);
    if (!ok) setErr('Credenciales incorrectas');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Settings className="w-5 h-5" /> Admin — Datinder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label>Usuario</Label>
              <Input value={user} onChange={e => setUser(e.target.value)} placeholder="admin" className="mt-1" />
            </div>
            <div>
              <Label>Contraseña</Label>
              <Input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="datinder2026" className="mt-1" />
            </div>
            {err && <p className="text-destructive text-sm">{err}</p>}
            <Button type="submit" className="w-full">Entrar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function Admin() {
  const { authed, login, logout } = useAdminAuth();
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [sesionActiva, setSesionActiva] = useState<Sesion | null>(null);

  useEffect(() => {
    if (authed) void cargarSesiones();
  }, [authed]);

  async function cargarSesiones() {
    const ss = await db.listarSesiones();
    setSesiones(ss);
    if (!sesionActiva && ss.length > 0) setSesionActiva(ss[0]);
  }

  const { sesion: sesionLive, preguntas, usuarios, respuestas, preguntaActual, reload } = useRealtimeSession(sesionActiva?.id ?? null);

  if (!authed) {
    return <AdminLogin onLogin={(u, p) => { login(u, p); return false; }} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-black text-xl text-datinder-bg">Datinder</span>
            <span className="text-muted-foreground text-sm">/ Admin</span>
          </div>
          <div className="flex items-center gap-3">
            {sesionActiva && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Sesión:</span>
                <select
                  className="text-sm border rounded px-2 py-1 bg-background"
                  value={sesionActiva.id}
                  onChange={e => {
                    const s = sesiones.find(s => s.id === e.target.value);
                    if (s) setSesionActiva(s);
                  }}
                >
                  {sesiones.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre_evento} ({s.codigo_acceso})</option>
                  ))}
                </select>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
              <LogOut className="w-4 h-4" /> Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="eventos">
          <TabsList className="mb-6">
            <TabsTrigger value="eventos" className="gap-2">
              <List className="w-4 h-4" /> Eventos
            </TabsTrigger>
            {sesionActiva && (
              <>
                <TabsTrigger value="preguntas" className="gap-2">
                  <Database className="w-4 h-4" /> Preguntas
                </TabsTrigger>
                <TabsTrigger value="sala" className="gap-2">
                  <Users className="w-4 h-4" /> Sala de Control
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="sql" className="gap-2">
              <Settings className="w-4 h-4" /> SQL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="eventos">
            <div className="space-y-2 mb-6">
              <h2 className="text-xl font-bold">Gestión de Eventos</h2>
              <p className="text-muted-foreground text-sm">Crea y gestiona tus sesiones de Datinder</p>
            </div>
            <EventList />
          </TabsContent>

          {sesionActiva && (
            <>
              <TabsContent value="preguntas">
                <div className="space-y-2 mb-6">
                  <h2 className="text-xl font-bold">Preguntas — {sesionActiva.nombre_evento}</h2>
                  <p className="text-muted-foreground text-sm">CRUD de preguntas, orden y peso estratégico</p>
                </div>
                <QuestionsCrud sesion={sesionActiva} />
              </TabsContent>

              <TabsContent value="sala">
                <div className="space-y-2 mb-6">
                  <h2 className="text-xl font-bold">Sala de Control — {sesionActiva.nombre_evento}</h2>
                  <p className="text-muted-foreground text-sm">Controla el flujo y gestiona participantes</p>
                </div>
                <ControlRoom
                  sesion={sesionLive ?? sesionActiva}
                  preguntas={preguntas}
                  usuarios={usuarios}
                  respuestas={respuestas}
                  preguntaActual={preguntaActual}
                  onReload={reload}
                />
              </TabsContent>
            </>
          )}

          <TabsContent value="sql">
            <div className="space-y-2 mb-6">
              <h2 className="text-xl font-bold">Migración Supabase</h2>
              <p className="text-muted-foreground text-sm">Script SQL para crear las tablas en tu proyecto Supabase</p>
            </div>
            <SqlTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
