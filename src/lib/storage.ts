import { getSupabase } from '@/db/supabase/client';

const IS_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

async function resizarACirculo(file: File, size: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        blob => (blob ? resolve(blob) : reject(new Error('canvas toBlob failed'))),
        'image/jpeg',
        0.82,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image load failed')); };
    img.src = url;
  });
}

export async function uploadFoto(file: File, nombre: string): Promise<string> {
  const blob = await resizarACirculo(file, 200);

  if (IS_MOCK) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  const path = `${Date.now()}-${nombre.replace(/\s+/g, '-').toLowerCase()}.jpg`;
  const { error } = await getSupabase()
    .storage.from('fotos')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
  if (error) throw error;
  return getSupabase().storage.from('fotos').getPublicUrl(path).data.publicUrl;
}
