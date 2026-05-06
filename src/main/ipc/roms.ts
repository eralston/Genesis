import { ipcMain, dialog, app } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import prisma from '../db/index.js';
import { IPC } from '../../types/index.js';
import { hasValidExtension, hasValidMagicBytes } from '../lib/rom-validator.js';
import { copyFile, readFileBuf } from '../lib/fs.js';
import { hashFile } from '../lib/hash.js';

function getRomsDir(): string {
  if (process.env.NODE_ENV === 'development') {
    return path.join(process.cwd(), 'roms');
  }
  return path.join(app.getPath('userData'), 'roms');
}

export function registerRomHandlers(): void {
  ipcMain.handle(IPC.ROMS_IMPORT, async (_event, gameId: number) => {
    const result = await dialog.showOpenDialog({
      title: 'Select a Genesis ROM',
      filters: [
        {
          name: 'Genesis ROMs',
          extensions: ['md', 'bin', 'gen', 'smd'],
        },
      ],
      properties: ['openFile'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const srcPath = result.filePaths[0];
    const filename = path.basename(srcPath);

    if (!hasValidExtension(filename)) {
      throw new Error(`Invalid file extension for ROM: ${filename}`);
    }

    if (!(await hasValidMagicBytes(srcPath))) {
      throw new Error(`File does not appear to be a valid Sega Genesis ROM: ${filename}`);
    }

    const romsDir = getRomsDir();
    const destPath = path.join(romsDir, filename);

    await copyFile(srcPath, destPath);

    const [sha256Hash, stat] = await Promise.all([
      hashFile(destPath),
      fs.stat(destPath),
    ]);

    return prisma.rom.create({
      data: {
        filename,
        absolutePath: destPath,
        fileSize: stat.size,
        sha256Hash,
        gameId,
      },
    });
  });

  ipcMain.handle(IPC.ROMS_READ, async (_event, romId: number) => {
    const rom = await prisma.rom.findUnique({ where: { id: romId } });
    if (!rom) return null;
    const buf = await readFileBuf(rom.absolutePath);
    return buf;
  });
}
