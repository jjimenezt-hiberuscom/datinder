import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import { Login } from './views/Login';
import { Lobby } from './views/Lobby';
import { Play } from './views/Play';
import { Board } from './views/Board';
import { Admin } from './views/Admin';

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/play" element={<Play />} />
          <Route path="/board/:codigo" element={<Board />} />
          <Route path="/board" element={<Navigate to="/board/AFTERWORK" replace />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}
