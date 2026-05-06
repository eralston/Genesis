import { app, BrowserWindow } from 'electron';
import path from 'path';
import prisma from './db/index.js';
import { registerGameHandlers } from './ipc/games.js';
import { registerRomHandlers } from './ipc/roms.js';
import { registerSaveHandlers } from './ipc/saves.js';

const isDev = process.env.NODE_ENV === 'development';

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  return win;
}

app.whenReady().then(() => {
  registerGameHandlers();
  registerRomHandlers();
  registerSaveHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  await prisma.$disconnect();
});
