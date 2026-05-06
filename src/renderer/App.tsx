import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.js';
import Library from './pages/Library.js';
import ROMManager from './pages/ROMManager.js';
import GameDetail from './pages/GameDetail.js';
import Player from './pages/Player.js';

export default function App(): React.JSX.Element {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Library />} />
          <Route path="/roms" element={<ROMManager />} />
          <Route path="/game/:gameId" element={<GameDetail />} />
        </Route>
        <Route path="/play/:gameId" element={<Player />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
