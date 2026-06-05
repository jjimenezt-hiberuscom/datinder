import React, { createContext, useContext, useState } from 'react';
import type { Usuario, Sesion } from '../types';

interface SessionState {
  usuario: Usuario | null;
  sesion: Sesion | null;
  setUsuario: (u: Usuario | null) => void;
  setSesion: (s: Sesion | null) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionState>({
  usuario: null,
  sesion: null,
  setUsuario: () => {},
  setSesion: () => {},
  logout: () => {},
});

const LS_USER = 'datinder_user';
const LS_SESSION = 'datinder_session';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuarioState] = useState<Usuario | null>(() => {
    try { return JSON.parse(localStorage.getItem(LS_USER) ?? 'null'); } catch { return null; }
  });
  const [sesion, setSesionState] = useState<Sesion | null>(() => {
    try { return JSON.parse(localStorage.getItem(LS_SESSION) ?? 'null'); } catch { return null; }
  });

  const setUsuario = (u: Usuario | null) => {
    setUsuarioState(u);
    if (u) localStorage.setItem(LS_USER, JSON.stringify(u));
    else localStorage.removeItem(LS_USER);
  };

  const setSesion = (s: Sesion | null) => {
    setSesionState(s);
    if (s) localStorage.setItem(LS_SESSION, JSON.stringify(s));
    else localStorage.removeItem(LS_SESSION);
  };

  const logout = () => { setUsuario(null); setSesion(null); };

  return (
    <SessionContext.Provider value={{ usuario, sesion, setUsuario, setSesion, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
