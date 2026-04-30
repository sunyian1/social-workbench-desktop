import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('BrowserManager user agent compatibility', () => {
  it('sets both webContents and session user agent without Electron product token', () => {
    const file = fs.readFileSync(path.join(process.cwd(), 'src/main/services/BrowserManager.ts'), 'utf8');
    expect(file).toContain("replace(/\\s+Electron\\/[^\\s]+/g, '')");
    expect(file).toContain('view.webContents.setUserAgent(chromeUserAgent)');
    expect(file).toContain('view.webContents.session.setUserAgent(chromeUserAgent)');
  });
});
