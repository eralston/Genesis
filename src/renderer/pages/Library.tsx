import React, { useEffect, useState, useCallback } from 'react';
import { useApi } from '../hooks/useApi.js';
import { useToast } from '../hooks/useToast.js';
import type { Game, GameUpsertInput } from '../../types/index.js';
import GameCard from '../components/GameCard.js';
import GameModal from '../components/GameModal.js';
import ToastContainer from '../components/ToastContainer.js';
import styles from './Library.module.css';

export default function Library(): React.JSX.Element {
  const api = useApi();
  const { toasts, addToast, dismiss } = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing?: Game }>({ open: false });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.gamesList();
      setGames(data);
    } catch (err) {
      addToast(`Failed to load games: ${String(err)}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [api, addToast]);

  useEffect(() => { void load(); }, [load]);

  async function handleSave(data: GameUpsertInput) {
    try {
      await api.gamesUpsert(data);
      setModal({ open: false });
      await load();
      addToast(data.id ? 'Game updated.' : 'Game added.', 'success');
    } catch (err) {
      addToast(`Save failed: ${String(err)}`, 'error');
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.gamesDelete(id);
      setDeleteConfirm(null);
      await load();
      addToast('Game deleted.', 'success');
    } catch (err) {
      addToast(`Delete failed: ${String(err)}`, 'error');
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Library</h1>
        <button className={styles.addBtn} onClick={() => setModal({ open: true })}>
          + Add Game
        </button>
      </header>

      {loading && <p className={styles.hint}>Loading…</p>}
      {!loading && games.length === 0 && (
        <p className={styles.hint}>No games yet. Click "Add Game" to get started.</p>
      )}

      <div className={styles.grid}>
        {games.map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
      </div>

      {modal.open && (
        <GameModal
          initial={modal.editing}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
        />
      )}

      {deleteConfirm !== null && (
        <div className={styles.overlay}>
          <div className={styles.confirm}>
            <p>Delete this game and all its ROMs and save states?</p>
            <div className={styles.confirmActions}>
              <button onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className={styles.danger} onClick={() => void handleDelete(deleteConfirm)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
