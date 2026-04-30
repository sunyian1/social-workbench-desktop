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
      this.activeId = profileId;
      this.resizeActive();
      await this.loadProfileUrl(view, profile);
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
    view.setBounds({ x: 58, y: 42, width: Math.max(300, width - 134), height: Math.max(300, height - 42) });
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

  private async loadProfileUrl(view: BrowserView, profile: Profile): Promise<void> {
    try {
      await view.webContents.loadURL(profile.startUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const safeName = this.escapeHtml(profile.name);
      const safeUrl = this.escapeHtml(profile.startUrl);
      const safeMessage = this.escapeHtml(message);
      const fallbackHtml = `
        <!doctype html>
        <html lang="zh-CN">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>应用加载失败</title>
            <style>
              body { margin: 0; font-family: "Microsoft YaHei", Arial, sans-serif; background: #f3f5f8; color: #202633; }
              .wrap { height: 100vh; display: grid; place-items: center; padding: 32px; box-sizing: border-box; }
              .card { width: min(680px, 92vw); background: #fff; border: 1px solid #e8ebf0; border-radius: 8px; box-shadow: 0 16px 45px rgba(16,24,40,.10); overflow: hidden; }
              .head { background: #f36a2f; color: #fff; padding: 14px 20px; font-weight: 600; }
              .body { padding: 28px 30px; }
              h1 { margin: 0 0 12px; font-size: 22px; }
              p { line-height: 1.7; color: #667085; }
              code { display: block; background: #f8fafc; border: 1px solid #edf0f5; padding: 12px; border-radius: 6px; color: #475467; white-space: pre-wrap; word-break: break-all; }
              .actions { margin-top: 22px; display: flex; gap: 12px; }
              button { border: 0; border-radius: 4px; padding: 10px 18px; cursor: pointer; font-size: 14px; }
              .primary { background: #f36a2f; color: #fff; }
              .secondary { background: #eef1f5; color: #344054; }
            </style>
          </head>
          <body>
            <div class="wrap">
              <div class="card">
                <div class="head">网页暂时无法打开</div>
                <div class="body">
                  <h1>${safeName} 加载失败</h1>
                  <p>应用环境已创建成功，但当前网络无法连接到目标网站。你可以检查网络、代理或稍后重试。</p>
                  <code>URL: ${safeUrl}\n错误: ${safeMessage}</code>
                  <div class="actions">
                    <button class="primary" onclick="location.href='${safeUrl}'">重新加载</button>
                    <button class="secondary" onclick="history.back()">返回</button>
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;
      try {
        await view.webContents.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(fallbackHtml)}`, { baseURLForDataURL: profile.startUrl });
      } catch {
        await view.webContents.loadURL('about:blank').catch(() => undefined);
      }
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
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
    const chromeUserAgent = profile.fingerprint.userAgent?.replace(/\s+Electron\/[^\s]+/g, '') ?? profile.fingerprint.userAgent;
    if (chromeUserAgent) {
      view.webContents.setUserAgent(chromeUserAgent);
      try {
        view.webContents.session.setUserAgent(chromeUserAgent);
      } catch {
        // Some Electron versions may not allow changing the session UA after initialization.
      }
      const chromeMajor = chromeUserAgent.match(/Chrome\/(\d+)/)?.[1] ?? '132';
      const uaPlatform = profile.fingerprint.platform === 'MacIntel' ? '"macOS"' : '"Windows"';
      view.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
        details.requestHeaders['User-Agent'] = chromeUserAgent;
        details.requestHeaders['Accept-Language'] = profile.fingerprint.languages?.join(',') ?? profile.fingerprint.language ?? 'zh-CN,zh,en-US,en';
        details.requestHeaders['sec-ch-ua'] = `"Not A(Brand";v="8", "Chromium";v="${chromeMajor}", "Google Chrome";v="${chromeMajor}"`;
        details.requestHeaders['sec-ch-ua-mobile'] = '?0';
        details.requestHeaders['sec-ch-ua-platform'] = uaPlatform;
        callback({ requestHeaders: details.requestHeaders });
      });
    }
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
        hostname.endsWith('.fbcdn.net') ||
        hostname === 'www.browserscan.net' ||
        hostname.endsWith('.browserscan.net')
      );
    } catch {
      return false;
    }
  }
}
