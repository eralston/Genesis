import React, { useEffect, useState, useCallback } from 'react';
import { useApi } from '../hooks/useApi.js';
import { useToast } from '../hooks/useToast.js';
import type { Game, Rom } from '../../types/index.js';
import ToastContainer from '../components/ToastContainer.js';
import styles from './ROMManager.module.css';

interface RomWithGame extends Rom {
  game?: Game;
}

export default function ROMManager(): React.JSX.Element {
  const api = useApi();
  const { toasts, addToast, dismiss } = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [roms, setRoms] = useState<RomWithGame[]>([]);
  const [importing, setImporting] = useState(false);
  const [selectedGame, setSelectedGame] = useState<number | ''>('');

  const load = useCallback(async () => {
    try {
      const gs = await api.gamesList();
      setGames(gs);
      const all: RomWithGame[] = gs.flatMap((g) =>
        (g.roms ?? []).map((r) => ({ ...r, game: g })),
      );
      setRoms(all);
    } catch (err) {
      addToast(`Failed to load: ${String(err)}`, 'error');
    }
  }, [api, addToast]);

  useEffect(() => { void load(); }, [load]);

  async function handleImport() {
    if (!selectedGame) {
      addToast('Please select a game first.', 'info');
      return;
    }
    setImporting(true);
    try {
      const rom = await api.romsImport(Number(selectedGame));
      if (rom) {
        addToast(`ROM "${rom.filename}" imported.`, 'success');
        await load();
      } else {
        addToast('Import cancelled.', 'info');
      }
    } catch (err) {
      addToast(`Import failed: ${String(err)}`, 'error');
    } finally {
      setImporting(false);
    }
  }

  function formatBytes(n: number): string {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>ROM Manager</h1>
      </header>

      <div className={styles.toolbar}>
        <select
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value ? Number(e.target.value) : '')}
          className={styles.gameSelect}
        >
          <option value="">— Select a game —</option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>{g.title}</option>
          ))}
        </select>
        <button
          className={styles.importBtn}
          onClick={() => void handleImport()}
          disabled={importing || !selectedGame}
        >
          {importing ? 'Importing…' : 'Import ROM'}
        </button>
      </div>

      {roms.length === 0 ? (
        <p className={styles.hint}>No ROMs indexed yet. Select a game and click "Import ROM".</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Filename</th>
              <th>Game</th>
              <th>Size</th>
              <th>SHA-256</th>
            </tr>
          </thead>
          <tbody>
            {roms.map((r) => (
              <tr key={r.id}>
                <td className={styles.filename}>{r.filename}</td>
                <td>{r.game?.title ?? '—'}</td>
                <td>{formatBytes(r.fileSize)}</td>
                <td className={styles.hash}>{r.sha256Hash.slice(0, 16)}…</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
