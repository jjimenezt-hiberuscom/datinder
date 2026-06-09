const EMOJIS = ['🥸', '🤓', '😎', '🫠', '🥱', '🤵', '🧐', '🤨', '😏', '🫡', '🤡', '👔'];
const BG_COLORS = ['#1e3a5f', '#1a3a2a', '#3a1a2a', '#2a1a3a', '#3a2a0a', '#0a2a3a', '#2a0a2a'];

function djb2(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
  return Math.abs(h);
}

export function getAvatar(id: string, fotoUrl?: string | null): string {
  if (fotoUrl) return fotoUrl;
  const n = djb2(id);
  const emoji = EMOJIS[n % EMOJIS.length];
  const color = BG_COLORS[n % BG_COLORS.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="${color}"/><text x="50" y="70" text-anchor="middle" font-size="54">${emoji}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
