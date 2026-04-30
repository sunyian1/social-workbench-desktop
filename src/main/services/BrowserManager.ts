import { app, BrowserView, BrowserWindow, session } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import type { Profile } from '../../shared/types.js';
import type { ProxyService } from './ProxyService.js';
import type { ProfileService } from './ProfileService.js';
import { buildFingerprintScript } from './FingerprintService.js';

export class BrowserManager {
  private views = new Map<string, BrowserView>();
  private activeId?: string;

  constructor(
    private mainWindow: BrowserWindow,
    private profileService: ProfileService,
    private proxyService: ProxyService
  ) {}

  async open(profileId: string): Promise<void> {
    const profile = this.profileService.get(profileId);
    if (!profile) throw new Error('Profile not found');
    this.hideAll();
    let view = this.views.get(profileId);
    if (!view || view.webContents.isDestroyed()) {
      view = await this.createView(profile);
      this.views.set(profileId, view);
      this.mainWindow.addBrowserView(view);
      await view.webContents.loadURL(profile.startUrl);
    } else {
      this.mainWindow.addBrowserView(view);
    }
    this.activeId = profileId;
    this.resizeActive();
  }

  hideAll(): void {
    for (const [, view] of this.views) {
      try { this.mainWindow.removeBrowserView(view); } catch {}
    }
    this.activeId = undefined;
  }

  resizeActive(): void {
    if (!this.activeId) return;
    const view = this.views.get(this.activeId);
    if (!view) return;
    const [width, height] = this.mainWindow.getContentSize();
    view.setBounds({ x: 360, y: 0, width: Math.max(300, width - 360), height });
    view.setAutoResize({ width: true, height: true });
  }

  async destroy(profileId: string): Promise<void> {
    const view = this.views.get(profileId);
    if (view) {
      try { this.mainWindow.removeBrowserView(view); } catch {}
      if (!view.webContents.isDestroyed()) view.webContents.close();
      this.views.delete(profileId);
    }
  }

  private async createView(profile: Profile): Promise<BrowserView> {
    const ses = session.fromPartition(profile.partitionKey, { cache: true });
    if (profile.proxyId) {
      const proxy = this.proxyService.get(profile.proxyId);
      if (proxy) {
        const localUrl = await this.proxyService.getLocalProxyUrl(proxy);
        await ses.setProxy({ proxyRules: localUrl });
      }
    } else {
      await ses.setProxy({ mode: 'direct' });
    }

    const view = new BrowserView({
      webPreferences: {
        partition: profile.partitionKey,
        preload: path.join(app.getAppPath(), 'src/main/preload/profilePreload.cjs'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        devTools: process.env.NODE_ENV !== 'production'
      }
    });

    view.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    view.webContents.on('will-navigate', (event, url) => {
      if (!this.isAllowedNavigation(url)) event.preventDefault();
    });
    if (profile.fingerprint.userAgent) view.webContents.setUserAgent(profile.fingerprint.userAgent);
    await view.webContents.session.setPermissionRequestHandler((_wc, permission, callback) => {
      callback(['notifications', 'media'].includes(permission));
    });
    view.webContents.on('dom-ready', () => {
      view?.webContents.executeJavaScript(buildFingerprintScript(profile.fingerprint)).catch(() => undefined);
    });
    return view;
  }

  private isAllowedNavigation(url: string): boolean {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();
      return (
        hostname === 'web.whatsapp.com' ||
        hostname.endsWith('.whatsapp.com') ||
        hostname === 'web.telegram.org' ||
        hostname.endsWith('.telegram.org') ||
        hostname === 'www.instagram.com' ||
        hostname.endsWith('.instagram.com') ||
        hostname === 'www.facebook.com' ||
        hostname.endsWith('.facebook.com') ||
        hostname === 'facebook.com' ||
        hostname === 'fbcdn.net' ||
        hostname.endsWith('.fbcdn.net')
      );
    } catch {
      return false;
    }
  }
}
