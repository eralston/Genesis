import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '../types/index.js';
import type { Api, Game, GameUpsertInput, Rom, SaveState } from '../types/index.js';

const api: Api = {
  gamesList: (): Promise<Game[]> => ipcRenderer.invoke(IPC.GAMES_LIST),

  gamesUpsert: (data: GameUpsertInput): Promise<Game> =>
    ipcRenderer.invoke(IPC.GAMES_UPSERT, data),

  gamesDelete: (id: number): Promise<void> =>
    ipcRenderer.invoke(IPC.GAMES_DELETE, id),

  romsImport: (gameId: number): Promise<Rom | null> =>
    ipcRenderer.invoke(IPC.ROMS_IMPORT, gameId),

  romsRead: (romId: number): Promise<Uint8Array | null> =>
    ipcRenderer.invoke(IPC.ROMS_READ, romId),

  savesRead: (gameId: number, slot: number): Promise<Uint8Array | null> =>
    ipcRenderer.invoke(IPC.SAVES_READ, gameId, slot),

  savesWrite: (gameId: number, slot: number, data: Uint8Array): Promise<SaveState> =>
    ipcRenderer.invoke(IPC.SAVES_WRITE, gameId, slot, data),
};

contextBridge.exposeInMainWorld('api', api);
