import type { Sesion, Pregunta, Usuario, Respuesta, EstadoSesion, Eleccion } from '../../types';
import type { Datasource, DatosUsuario, DatosPregunta } from '../Datasource';
import { getSupabase } from './client';

export class SupabaseDatasource implements Datasource {
  async crearSesion(nombre: string): Promise<Sesion> {
    const codigo = nombre.toUpperCase().replace(/\s+/g, '');
    const { data, error } = await getSupabase()
      .from('sesiones')
      .insert({ nombre_evento: nombre, codigo_acceso: codigo, estado: 'espera' })
      .select()
      .single();
    if (error) throw error;
    return data as Sesion;
  }

  async eliminarSesion(sesionId: string): Promise<void> {
    await getSupabase().from('sesiones').delete().eq('id', sesionId);
  }

  async clonarSesion(sesionId: string, nuevoNombre: string): Promise<Sesion> {
    const codigo = nuevoNombre.toUpperCase().replace(/\s+/g, '');
    const { data: nueva, error } = await getSupabase()
      .from('sesiones')
      .insert({ nombre_evento: nuevoNombre, codigo_acceso: codigo, estado: 'espera', pausada: false })
      .select()
      .single();
    if (error) throw error;
    const { data: preguntas } = await getSupabase()
      .from('preguntas').select('*').eq('sesion_id', sesionId).order('orden');
    if (preguntas?.length) {
      const copias = preguntas.map(({ enunciado, opcion_a, opcion_b, orden, peso }: { enunciado: string; opcion_a: string; opcion_b: string; orden: number; peso: number }) =>
        ({ enunciado, opcion_a, opcion_b, orden, peso, sesion_id: nueva.id })
      );
      const { data: insertadas } = await getSupabase().from('preguntas').insert(copias).select().order('orden');
      if (insertadas?.length) {
        await getSupabase().from('sesiones').update({ pregunta_actual_id: insertadas[0].id }).eq('id', nueva.id);
        return { ...nueva, pregunta_actual_id: insertadas[0].id } as Sesion;
      }
    }
    return nueva as Sesion;
  }

  async getSesionPorCodigo(codigo: string): Promise<Sesion | null> {
    const { data } = await getSupabase().from('sesiones').select('*').eq('codigo_acceso', codigo.toUpperCase()).single();
    return data as Sesion | null;
  }

  async getSesionById(id: string): Promise<Sesion | null> {
    const { data } = await getSupabase().from('sesiones').select('*').eq('id', id).single();
    return data as Sesion | null;
  }

  async setEstado(sesionId: string, estado: EstadoSesion): Promise<void> {
    await getSupabase().from('sesiones').update({ estado }).eq('id', sesionId);
  }

  async setPreguntaActual(sesionId: string, preguntaId: string | null): Promise<void> {
    await getSupabase().from('sesiones').update({ pregunta_actual_id: preguntaId }).eq('id', sesionId);
  }

  async setPausada(sesionId: string, pausada: boolean): Promise<void> {
    await getSupabase().from('sesiones').update({ pausada }).eq('id', sesionId);
  }

  async listarSesiones(): Promise<Sesion[]> {
    const { data } = await getSupabase().from('sesiones').select('*').order('created_at', { ascending: false });
    return (data ?? []) as Sesion[];
  }

  async listarPreguntas(sesionId: string): Promise<Pregunta[]> {
    const { data } = await getSupabase().from('preguntas').select('*').eq('sesion_id', sesionId).order('orden');
    return (data ?? []) as Pregunta[];
  }

  async crearPregunta(sesionId: string, datos: DatosPregunta): Promise<Pregunta> {
    const { data, error } = await getSupabase().from('preguntas').insert({ ...datos, sesion_id: sesionId }).select().single();
    if (error) throw error;
    return data as Pregunta;
  }

  async actualizarPregunta(id: string, patch: Partial<DatosPregunta>): Promise<void> {
    await getSupabase().from('preguntas').update(patch).eq('id', id);
  }

  async borrarPregunta(id: string): Promise<void> {
    await getSupabase().from('preguntas').delete().eq('id', id);
  }

  async unirse(sesionId: string, datos: DatosUsuario): Promise<Usuario> {
    const { data, error } = await getSupabase().from('usuarios').insert({ ...datos, sesion_id: sesionId, expulsado: false }).select().single();
    if (error) throw error;
    return data as Usuario;
  }

  async listarUsuarios(sesionId: string): Promise<Usuario[]> {
    const { data } = await getSupabase().from('usuarios').select('*').eq('sesion_id', sesionId).eq('expulsado', false);
    return (data ?? []) as Usuario[];
  }

  async expulsar(usuarioId: string): Promise<void> {
    await getSupabase().from('usuarios').update({ expulsado: true }).eq('id', usuarioId);
  }

  async votar(usuarioId: string, preguntaId: string, eleccion: Eleccion): Promise<void> {
    await getSupabase().from('respuestas').upsert({ usuario_id: usuarioId, pregunta_id: preguntaId, eleccion }, { onConflict: 'usuario_id,pregunta_id' });
  }

  async listarRespuestas(sesionId: string): Promise<Respuesta[]> {
    const { data } = await getSupabase()
      .from('respuestas')
      .select('*, usuarios!inner(sesion_id)')
      .eq('usuarios.sesion_id', sesionId);
    return (data ?? []) as Respuesta[];
  }

  async listarRespuestasDePregunta(preguntaId: string): Promise<Respuesta[]> {
    const { data } = await getSupabase().from('respuestas').select('*').eq('pregunta_id', preguntaId);
    return (data ?? []) as Respuesta[];
  }

  async borrarRespuestasDeSesion(sesionId: string): Promise<void> {
    const { data: users } = await getSupabase().from('usuarios').select('id').eq('sesion_id', sesionId);
    if (!users?.length) return;
    const ids = users.map((u: { id: string }) => u.id);
    await getSupabase().from('respuestas').delete().in('usuario_id', ids);
  }

  suscribir(sesionId: string, onChange: () => void): () => void {
    const sb = getSupabase();
    const channel = sb
      .channel(`sesion-${sesionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sesiones', filter: `id=eq.${sesionId}` }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'respuestas' }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'usuarios', filter: `sesion_id=eq.${sesionId}` }, onChange)
      .subscribe();
    return () => { void sb.removeChannel(channel); };
  }
}
