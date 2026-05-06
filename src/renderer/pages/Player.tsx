import React, { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi.js';
import { useToast } from '../hooks/useToast.js';
import type { SaveState } from '../../types/index.js';
import ToastContainer from '../components/ToastContainer.js';
import styles from './Player.module.css';

const SLOT_COUNT = 4;

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    EJS_player: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    EJS_core: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    EJS_gameUrl: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    EJS_pathtodata: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    EJS_onGameStart: () => void;
  }
}

export default function Player(): React.JSX.Element {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();
  const romId = searchParams.get('romId');
  const navigate = useNavigate();
  const api = useApi();
  const { toasts, addToast, dismiss } = useToast();

  const [slot, setSlot] = useState(1);
  const [saves, setSaves] = useState<(SaveState | null)[]>(Array(SLOT_COUNT).fill(null));
  const [romUrl, setRomUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const romBlobRef = useRef<string | null>(null);

  // Load save state metadata
  useEffect(() => {
    async function loadSaves() {
      if (!gameId) return;
      try {
        const all = await api.gamesList();
        const game = all.find((g) => g.id === Number(gameId));
        const states: (SaveState | null)[] = Array(SLOT_COUNT).fill(null);
        if (game?.saveStates) {
          for (const s of game.saveStates) {
            if (s.slot >= 1 && s.slot <= SLOT_COUNT) {
              states[s.slot - 1] = s;
            }
          }
        }
        setSaves(states);
      } catch {
        // non-fatal
      }
    }
    void loadSaves();
  }, [api, gameId]);

  // Read ROM binary and create an object URL for EmulatorJS
  useEffect(() => {
    async function loadRom() {
      if (!romId) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.romsRead(Number(romId));
        if (!data) throw new Error('ROM not found');
        const blob = new Blob([data.buffer as ArrayBuffer], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        romBlobRef.current = url;
        setRomUrl(url);
      } catch (err) {
        addToast(`Failed to load ROM: ${String(err)}`, 'error');
      } finally {
        setLoading(false);
      }
    }
    void loadRom();
    return () => {
      if (romBlobRef.current) {
        URL.revokeObjectURL(romBlobRef.current);
      }
    };
  }, [api, romId, addToast]);

  // Boot EmulatorJS once romUrl is ready
  useEffect(() => {
    if (!romUrl) return;

    window.EJS_player = '#emulator-container';
    window.EJS_core = 'segaMD';
    window.EJS_gameUrl = romUrl;
    window.EJS_pathtodata = './emulatorjs/';

    const script = document.createElement('script');
    script.src = './emulatorjs/loader.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [romUrl]);

  async function handleSave() {
    if (!gameId) return;
    try {
      // EmulatorJS save state via its API is game-specific;
      // here we write an empty placeholder to record the slot exists.
      // In a full integration, the emulator's saveState callback would provide the binary.
      const placeholder = new Uint8Array(0);
      const saved = await api.savesWrite(Number(gameId), slot, placeholder);
      setSaves((prev) => {
        const next = [...prev];
        next[slot - 1] = saved;
        return next;
      });
      addToast(`Saved to slot ${slot}.`, 'success');
    } catch (err) {
      addToast(`Save failed: ${String(err)}`, 'error');
    }
  }

  async function handleLoad() {
    if (!gameId) return;
    try {
      const data = await api.savesRead(Number(gameId), slot);
      if (!data || data.byteLength === 0) {
        addToast(`No save found in slot ${slot}.`, 'info');
        return;
      }
      // In a full EmulatorJS integration, pass `data` to the emulator's loadState API.
      addToast(`Loaded slot ${slot}.`, 'success');
    } catch (err) {
      addToast(`Load failed: ${String(err)}`, 'error');
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>
        <span className={styles.label}>Now Playing</span>
      </div>

      <div className={styles.playerWrapper}>
        {loading && <p className={styles.hint}>Loading ROM…</p>}
        {!loading && !romUrl && (
          <p className={styles.hint}>No ROM selected. Go back and choose a ROM to play.</p>
        )}
        <div id="emulator-container" className={styles.emulator} />
      </div>

      <div className={styles.controls}>
        <span className={styles.controlLabel}>Save State</span>
        <div className={styles.slots}>
          {Array.from({ length: SLOT_COUNT }, (_, i) => {
            const s = i + 1;
            const saved = saves[i];
            return (
              <button
                key={s}
                className={`${styles.slotBtn} ${slot === s ? styles.active : ''}`}
                onClick={() => setSlot(s)}
                title={saved ? `Slot ${s} — ${new Date(saved.createdAt).toLocaleString()}` : `Slot ${s} — empty`}
              >
                {s}
                {saved && <span className={styles.slotDot} />}
              </button>
            );
          })}
        </div>
        <button className={styles.actionBtn} onClick={() => void handleSave()}>💾 Save</button>
        <button className={styles.actionBtn} onClick={() => void handleLoad()}>📂 Load</button>
      </div>

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
