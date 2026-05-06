import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi.js';
import { useToast } from '../hooks/useToast.js';
import type { Game } from '../../types/index.js';
import CoverArt from '../components/CoverArt.js';
import StatusBadge from '../components/StatusBadge.js';
import RatingStars from '../components/RatingStars.js';
import GameModal from '../components/GameModal.js';
import ToastContainer from '../components/ToastContainer.js';
import styles from './GameDetail.module.css';

export default function GameDetail(): React.JSX.Element {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const api = useApi();
  const { toasts, addToast, dismiss } = useToast();
  const [game, setGame] = useState<Game | null>(null);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    try {
      const all = await api.gamesList();
      const found = all.find((g) => g.id === Number(gameId));
      setGame(found ?? null);
    } catch (err) {
      addToast(`Failed to load: ${String(err)}`, 'error');
    }
  }, [api, gameId, addToast]);

  useEffect(() => { void load(); }, [load]);

  async function handleSave(data: Parameters<typeof api.gamesUpsert>[0]) {
    try {
      await api.gamesUpsert(data);
      setEditing(false);
      await load();
      addToast('Game saved.', 'success');
    } catch (err) {
      addToast(`Save failed: ${String(err)}`, 'error');
    }
  }

  async function handleDelete() {
    if (!game) return;
    try {
      await api.gamesDelete(game.id);
      navigate('/');
    } catch (err) {
      addToast(`Delete failed: ${String(err)}`, 'error');
    }
  }

  async function toggleStatus() {
    if (!game) return;
    const next = game.status === 'owned' ? 'wishlist' : 'owned';
    try {
      await api.gamesUpsert({ ...game, status: next });
      await load();
    } catch (err) {
      addToast(`Update failed: ${String(err)}`, 'error');
    }
  }

  async function handleRating(r: number) {
    if (!game) return;
    try {
      await api.gamesUpsert({ ...game, rating: r });
      await load();
    } catch (err) {
      addToast(`Update failed: ${String(err)}`, 'error');
    }
  }

  if (!game) {
    return <div className={styles.page}><p className={styles.hint}>Loading…</p></div>;
  }

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate('/')}>← Library</button>

      <div className={styles.hero}>
        <div className={styles.cover}>
          <CoverArt src={game.coverArtUrl} alt={game.title} />
        </div>
        <div className={styles.meta}>
          <h1 className={styles.title}>{game.title}</h1>
          <div className={styles.badges}>
            <button className={styles.statusBtn} onClick={() => void toggleStatus()}>
              <StatusBadge status={game.status as 'owned' | 'wishlist'} />
            </button>
            {game.genre && <span className={styles.genre}>{game.genre}</span>}
            {game.releaseYear && <span className={styles.year}>{game.releaseYear}</span>}
          </div>
          <RatingStars value={game.rating} onChange={handleRating} />
          {game.description && <p className={styles.desc}>{game.description}</p>}
          {game.notes && (
            <div className={styles.notes}>
              <span className={styles.notesLabel}>Notes</span>
              <p>{game.notes}</p>
            </div>
          )}
          <div className={styles.actions}>
            <button className={styles.editBtn} onClick={() => setEditing(true)}>Edit</button>
            <button className={styles.deleteBtn} onClick={() => setConfirmDelete(true)}>Delete</button>
          </div>
        </div>
      </div>

      {game.roms && game.roms.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>ROMs</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Filename</th>
                <th>Size</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {game.roms.map((r) => (
                <tr key={r.id}>
                  <td className={styles.mono}>{r.filename}</td>
                  <td>{(r.fileSize / (1024 * 1024)).toFixed(1)} MB</td>
                  <td>
                    <button
                      className={styles.playBtn}
                      onClick={() => navigate(`/play/${game.id}?romId=${r.id}`)}
                    >
                      ▶ Play
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {game.saveStates && game.saveStates.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Save States</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Slot</th>
                <th>Saved At</th>
              </tr>
            </thead>
            <tbody>
              {game.saveStates.map((s) => (
                <tr key={s.id}>
                  <td>Slot {s.slot}</td>
                  <td>{new Date(s.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {editing && (
        <GameModal
          initial={game}
          onSave={handleSave}
          onClose={() => setEditing(false)}
        />
      )}

      {confirmDelete && (
        <div className={styles.overlay}>
          <div className={styles.confirm}>
            <p>Delete <strong>{game.title}</strong> and all its ROMs and save states?</p>
            <div className={styles.confirmActions}>
              <button onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button className={styles.dangerBtn} onClick={() => void handleDelete()}>
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
