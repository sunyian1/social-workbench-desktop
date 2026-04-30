import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, BrowserWindow, ipcMain } from 'electron';
import log from 'electron-log';
import { PLATFORMS } from '../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { DatabaseService } from './services/DatabaseService.js';
import { ProfileService } from './services/ProfileService.js';
import { ProxyService } from './services/ProxyService.js';
import { BrowserManager } from './services/BrowserManager.js';

let mainWindow: BrowserWindow | undefined;
let browserManager: BrowserManager | undefined;
const dbService = new DatabaseService();

async function createWindow() {
  const db = dbService.open();
  const profileService = new ProfileService(db);
  const proxyService = new ProxyService(db);

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1000,
    minHeight: 680,
    title: 'Social Workbench',
    webPreferences: {
      preload: path.join(app.getAppPath(), 'src/main/preload/appPreload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  browserManager = new BrowserManager(mainWindow, profileService, proxyService);
  mainWindow.on('resize', () => browserManager?.resizeActive());
  mainWindow.on('closed', () => { mainWindow = undefined; });

  ipcMain.handle('platforms:list', () => PLATFORMS);
  ipcMain.handle('profiles:list', () => profileService.list());
  ipcMain.handle('profiles:create', (_e, input) => profileService.create(input));
  ipcMain.handle('profiles:update', (_e, id, patch) => profileService.update(id, patch));
  ipcMain.handle('profiles:remove', async (_e, id) => { await browserManager?.destroy(id); profileService.remove(id); return true; });
  ipcMain.handle('profiles:open', async (_e, id) => {
    try {
      await browserManager?.open(id);
      return true;
    } catch (error) {
      log.warn('Profile webview open failed, keeping renderer alive', error);
      return false;
    }
  });
  ipcMain.handle('profiles:close-active', () => { browserManager?.hideAll(); return true; });
  ipcMain.handle('proxies:list', () => proxyService.list());
  ipcMain.handle('proxies:create', (_e, input) => proxyService.create(input));
  ipcMain.handle('proxies:remove', (_e, id) => { proxyService.remove(id); return true; });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) await mainWindow.loadURL(devUrl);
  else await mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
}

app.whenReady().then(createWindow).catch((err) => log.error(err));
app.on('window-all-closed', () => { dbService.close(); if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) void createWindow(); });
