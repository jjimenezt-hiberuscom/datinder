// Credenciales admin (ajustables)
export const ADMIN_USER = 'admin';
export const ADMIN_PASS = 'datinder2026';

// Código de la sesión de demo
export const DEMO_SESSION_CODE = 'AFTERWORK';

// Umbral de preguntas para mostrar matches
export const MATCHES_DESDE_PREGUNTA = 5;

// URL base para QR
export const getLoginUrl = (codigo: string) =>
  `${window.location.origin}/?codigo=${codigo}`;

export const getBoardUrl = (codigo: string) =>
  `${window.location.origin}/board/${codigo}`;
