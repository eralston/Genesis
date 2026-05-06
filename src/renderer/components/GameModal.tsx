import React, { useState } from 'react';
import type { Game, GameUpsertInput } from '../../types/index.js';
import RatingStars from './RatingStars.js';
import styles from './GameModal.module.css';

interface Props {
  initial?: Game;
  onSave: (data: GameUpsertInput) => void;
  onClose: () => void;
}

const EMPTY: GameUpsertInput = {
  title: '',
  description: null,
  releaseYear: null,
  genre: null,
  coverArtUrl: null,
  status: 'wishlist',
  rating: null,
  notes: null,
};

export default function GameModal({ initial, onSave, onClose }: Props): React.JSX.Element {
  const [form, setForm] = useState<GameUpsertInput>(
    initial
      ? {
          id: initial.id,
          title: initial.title,
          description: initial.description,
          releaseYear: initial.releaseYear,
          genre: initial.genre,
          coverArtUrl: initial.coverArtUrl,
          status: initial.status,
          rating: initial.rating,
          notes: initial.notes,
        }
      : EMPTY,
  );

  function set<K extends keyof GameUpsertInput>(key: K, value: GameUpsertInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave(form);
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <h2 className={styles.heading}>{initial ? 'Edit Game' : 'Add Game'}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span>Title *</span>
            <input
              required
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Sonic the Hedgehog"
            />
          </label>

          <label className={styles.field}>
            <span>Genre</span>
            <input
              value={form.genre ?? ''}
              onChange={(e) => set('genre', e.target.value || null)}
              placeholder="e.g. Platformer"
            />
          </label>

          <label className={styles.field}>
            <span>Release Year</span>
            <input
              type="number"
              min={1988}
              max={2030}
              value={form.releaseYear ?? ''}
              onChange={(e) =>
                set('releaseYear', e.target.value ? parseInt(e.target.value, 10) : null)
              }
            />
          </label>

          <label className={styles.field}>
            <span>Cover Art URL</span>
            <input
              value={form.coverArtUrl ?? ''}
              onChange={(e) => set('coverArtUrl', e.target.value || null)}
              placeholder="https://..."
            />
          </label>

          <label className={styles.field}>
            <span>Status</span>
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value as 'owned' | 'wishlist')}
            >
              <option value="wishlist">Wishlist</option>
              <option value="owned">Owned</option>
            </select>
          </label>

          <div className={styles.field}>
            <span>Rating</span>
            <RatingStars
              value={form.rating}
              onChange={(r) => set('rating', r)}
            />
          </div>

          <label className={styles.field}>
            <span>Description</span>
            <textarea
              rows={3}
              value={form.description ?? ''}
              onChange={(e) => set('description', e.target.value || null)}
            />
          </label>

          <label className={styles.field}>
            <span>Notes</span>
            <textarea
              rows={2}
              value={form.notes ?? ''}
              onChange={(e) => set('notes', e.target.value || null)}
            />
          </label>

          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.save}>
              {initial ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
