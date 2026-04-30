import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('BrowserManager network fallback', () => {
  it('does not reject profile open when the remote site times out', () => {
    const source = fs.readFileSync(path.resolve('src/main/services/BrowserManager.ts'), 'utf8');
    expect(source).toContain('private async loadProfileUrl');
    expect(source).toContain('网页暂时无法打开');
    expect(source).toContain('await this.loadProfileUrl(view, profile)');
    expect(source).not.toContain('await view.webContents.loadURL(profile.startUrl);\n    } else');
  });
});
