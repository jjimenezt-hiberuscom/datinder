import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPct(n: number): string {
  return `${Math.round(n)}%`;
}

export function nombreCompleto(u: { nombre: string; apellidos: string }): string {
  return `${u.nombre} ${u.apellidos}`.trim();
}
