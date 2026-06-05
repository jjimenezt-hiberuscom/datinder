import type { Sesion, Pregunta, Usuario, Respuesta, EstadoSesion, Eleccion } from '../../types';
import type { Datasource, DatosUsuario, DatosPregunta } from '../Datasource';
import { supabase } from './client';

export class SupabaseDatasource implements Datasource {
  async crearSesion(nombre: string): Promise<Sesion> {
    const codigo = nombre.toUpperCase().replace(/\s+/g, '').slice(0, 8) + Math.floor(Math.random() * 100);
    const { data, error } = await supabase
      .from('sesiones')
      .insert({ nombre_evento: nombre, codigo_acceso: codigo, estado: 'espera' })
      .select()
      .single();
    if (error) throw error;
    return data as Sesion;
  }

  async getSesionPorCodigo(codigo: string): Promise<Sesion | null> {
    const { data } = await supabase.from('sesiones').select('*').eq('codigo_acceso', codigo.toUpperCase()).single();
    return data as Sesion | null;
  }

  async getSesionById(id: string): Promise<Sesion | null> {
    const { data } = await supabase.from('sesiones').select('*').eq('id', id).single();
    return data as Sesion | null;
  }

  async setEstado(sesionId: string, estado: EstadoSesion): Promise<void> {
    await supabase.from('sesiones').update({ estado }).eq('id', sesionId);
  }

  async setPreguntaActual(sesionId: string, preguntaId: string | null): Promise<void> {
    await supabase.from('sesiones').update({ pregunta_actual_id: preguntaId }).eq('id', sesionId);
  }

  async listarSesiones(): Promise<Sesion[]> {
    const { data } = await supabase.from('sesiones').select('*').order('created_at', { ascending: false });
    return (data ?? []) as Sesion[];
  }

  async listarPreguntas(sesionId: string): Promise<Pregunta[]> {
    const { data } = await supabase.from('preguntas').select('*').eq('sesion_id', sesionId).order('orden');
    return (data ?? []) as Pregunta[];
  }

  async crearPregunta(sesionId: string, datos: DatosPregunta): Promise<Pregunta> {
    const { data, error } = await supabase.from('preguntas').insert({ ...datos, sesion_id: sesionId }).select().single();
    if (error) throw error;
    return data as Pregunta;
  }

  async actualizarPregunta(id: string, patch: Partial<DatosPregunta>): Promise<void> {
    await supabase.from('preguntas').update(patch).eq('id', id);
  }

  async borrarPregunta(id: string): Promise<void> {
    await supabase.from('preguntas').delete().eq('id', id);
  }

  async unirse(sesionId: string, datos: DatosUsuario): Promise<Usuario> {
    const { data, error } = await supabase.from('usuarios').insert({ ...datos, sesion_id: sesionId, expulsado: false }).select().single();
    if (error) throw error;
    return data as Usuario;
  }

  async listarUsuarios(sesionId: string): Promise<Usuario[]> {
    const { data } = await supabase.from('usuarios').select('*').eq('sesion_id', sesionId).eq('expulsado', false);
    return (data ?? []) as Usuario[];
  }

  async expulsar(usuarioId: string): Promise<void> {
    await supabase.from('usuarios').update({ expulsado: true }).eq('id', usuarioId);
  }

  async votar(usuarioId: string, preguntaId: string, eleccion: Eleccion): Promise<void> {
    await supabase.from('respuestas').upsert({ usuario_id: usuarioId, pregunta_id: preguntaId, eleccion }, { onConflict: 'usuario_id,pregunta_id' });
  }

  async listarRespuestas(sesionId: string): Promise<Respuesta[]> {
    const { data } = await supabase
      .from('respuestas')
      .select('*, usuarios!inner(sesion_id)')
      .eq('usuarios.sesion_id', sesionId);
    return (data ?? []) as Respuesta[];
  }

  async listarRespuestasDePregunta(preguntaId: string): Promise<Respuesta[]> {
    const { data } = await supabase.from('respuestas').select('*').eq('pregunta_id', preguntaId);
    return (data ?? []) as Respuesta[];
  }

  async borrarRespuestasDeSesion(sesionId: string): Promise<void> {
    const { data: users } = await supabase.from('usuarios').select('id').eq('sesion_id', sesionId);
    if (!users?.length) return;
    const ids = users.map((u: { id: string }) => u.id);
    await supabase.from('respuestas').delete().in('usuario_id', ids);
  }

  suscribir(sesionId: string, onChange: () => void): () => void {
    const channel = supabase
      .channel(`sesion-${sesionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sesiones', filter: `id=eq.${sesionId}` }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'respuestas' }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'usuarios', filter: `sesion_id=eq.${sesionId}` }, onChange)
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }
}
