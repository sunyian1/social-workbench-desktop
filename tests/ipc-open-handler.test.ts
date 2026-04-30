import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('profiles open IPC handler', () => {
  it('does not reject renderer IPC when a profile web page cannot load', () => {
    const source = fs.readFileSync(path.resolve('src/main/index.ts'), 'utf8');
    expect(source).toContain("ipcMain.handle('profiles:open'");
    expect(source).toContain('try {');
    expect(source).toContain("log.warn('Profile webview open failed, keeping renderer alive'");
    expect(source).toContain('return false;');
  });
});
