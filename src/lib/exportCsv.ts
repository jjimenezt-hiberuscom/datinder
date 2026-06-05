import type { Match } from '../types';

export function exportarRankingCSV(matches: Match[], filename = 'datinder-ranking.csv') {
  const header = ['Posición', 'Participante A', 'Participante B', 'Empresa A', 'Empresa B', 'Afinidad (%)', 'Racha Consecutiva'];
  const rows = matches.map((m, i) => [
    i + 1,
    `${m.a.nombre} ${m.a.apellidos}`,
    `${m.b.nombre} ${m.b.apellidos}`,
    m.a.empresa ?? '',
    m.b.empresa ?? '',
    Math.round(m.afinidad),
    m.racha,
  ]);

  const csv = [header, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
