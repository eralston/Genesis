import { ipcMain } from 'electron';
import prisma from '../db/index.js';
import { IPC } from '../../types/index.js';
import type { GameUpsertInput } from '../../types/index.js';

export function registerGameHandlers(): void {
  ipcMain.handle(IPC.GAMES_LIST, async () => {
    return prisma.game.findMany({
      include: { roms: true, saveStates: true },
      orderBy: { title: 'asc' },
    });
  });

  ipcMain.handle(IPC.GAMES_UPSERT, async (_event, data: GameUpsertInput) => {
    const { id, ...fields } = data;
    if (id !== undefined) {
      return prisma.game.update({
        where: { id },
        data: fields,
      });
    }
    return prisma.game.create({ data: fields });
  });

  ipcMain.handle(IPC.GAMES_DELETE, async (_event, id: number) => {
    // Cascade deletes Roms and SaveStates via Prisma schema onDelete: Cascade
    await prisma.game.delete({ where: { id } });
  });
}
