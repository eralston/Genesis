// Shared TypeScript types between main and renderer processes

export type GameStatus = 'owned' | 'wishlist';

export interface Game {
  id: number;
  title: string;
  description: string | null;
  releaseYear: number | null;
  genre: string | null;
  coverArtUrl: string | null;
  status: GameStatus;
  rating: number | null;
  notes: string | null;
  roms?: Rom[];
  saveStates?: SaveState[];
}

export type GameUpsertInput = Omit<Game, 'id' | 'roms' | 'saveStates'> & { id?: number };

export interface Rom {
  id: number;
  filename: string;
  absolutePath: string;
  fileSize: number;
  sha256Hash: string;
  gameId: number;
}

export interface SaveState {
  id: number;
  slot: number;
  filePath: string;
  createdAt: string;
  gameId: number;
}

// IPC channel names
export const IPC = {
  GAMES_LIST: 'games:list',
  GAMES_UPSERT: 'games:upsert',
  GAMES_DELETE: 'games:delete',
  ROMS_IMPORT: 'roms:import',
  ROMS_READ: 'roms:read',
  SAVES_READ: 'saves:read',
  SAVES_WRITE: 'saves:write',
} as const;

// API exposed via contextBridge
export interface Api {
  gamesList: () => Promise<Game[]>;
  gamesUpsert: (data: GameUpsertInput) => Promise<Game>;
  gamesDelete: (id: number) => Promise<void>;
  romsImport: (gameId: number) => Promise<Rom | null>;
  romsRead: (romId: number) => Promise<Uint8Array | null>;
  savesRead: (gameId: number, slot: number) => Promise<Uint8Array | null>;
  savesWrite: (gameId: number, slot: number, data: Uint8Array) => Promise<SaveState>;
}
