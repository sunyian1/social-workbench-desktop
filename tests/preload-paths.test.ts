import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('preload bridge files', () => {
  it('keeps CommonJS preload bridges available for sandboxed Electron windows', () => {
    expect(fs.existsSync(path.resolve('src/main/preload/appPreload.cjs'))).toBe(true);
    expect(fs.existsSync(path.resolve('src/main/preload/profilePreload.cjs'))).toBe(true);
  });

  it('main process references cjs preload files that work under package type module', () => {
    const main = fs.readFileSync(path.resolve('src/main/index.ts'), 'utf8');
    const browserManager = fs.readFileSync(path.resolve('src/main/services/BrowserManager.ts'), 'utf8');
    expect(main).toContain("src/main/preload/appPreload.cjs");
    expect(browserManager).toContain("src/main/preload/profilePreload.cjs");
  });
});
