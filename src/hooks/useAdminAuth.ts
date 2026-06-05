import { useState } from 'react';
import { ADMIN_USER, ADMIN_PASS } from '../config';

export function useAdminAuth() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('datinder_admin') === '1');
  const [error, setError] = useState('');

  const login = (user: string, pass: string) => {
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      sessionStorage.setItem('datinder_admin', '1');
      setAuthed(true);
      setError('');
      return true;
    }
    setError('Credenciales incorrectas');
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem('datinder_admin');
    setAuthed(false);
  };

  return { authed, login, logout, error };
}
