import { ipcMain, app } from 'electron';
import path from 'path';
import prisma from '../db/index.js';
import { IPC } from '../../types/index.js';
import { readFileBuf, writeFileBuf } from '../lib/fs.js';

function getSavesDir(): string {
  if (process.env.NODE_ENV === 'development') {
    return path.join(process.cwd(), 'saves');
  }
  return path.join(app.getPath('userData'), 'saves');
}

function saveFilePath(gameId: number, slot: number): string {
  return path.join(getSavesDir(), `${gameId}-slot${slot}.sav`);
}

export function registerSaveHandlers(): void {
  ipcMain.handle(IPC.SAVES_READ, async (_event, gameId: number, slot: number) => {
    const filePath = saveFilePath(gameId, slot);
    try {
      const buf = await readFileBuf(filePath);
      return buf;
    } catch {
      return null;
    }
  });

  ipcMain.handle(IPC.SAVES_WRITE, async (_event, gameId: number, slot: number, data: Uint8Array) => {
    const filePath = saveFilePath(gameId, slot);
    await writeFileBuf(filePath, Buffer.from(data));

    return prisma.saveState.upsert({
      where: { gameId_slot: { gameId, slot } },
      create: { gameId, slot, filePath },
      update: { filePath, createdAt: new Date() },
    });
  });
}
