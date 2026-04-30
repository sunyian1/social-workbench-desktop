import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { createRandomFingerprint } from '../src/shared/types';

describe('BrowserScan risk hardening', () => {
  it('keeps timezone and language coherent in generated fingerprints', () => {
    const zh = createRandomFingerprint('browserscan', 'profile_zh');
    expect(zh.timezone).toBe('Asia/Shanghai');
    expect(zh.language).toBe('zh-CN');
    expect(zh.languages?.[0]).toBe(zh.language);

    const other = createRandomFingerprint('browserscan', 'profile_other');
    expect(other.timezone).toBe('Asia/Shanghai');
    expect(other.language).toBe('zh-CN');
    expect(other.languages?.[0]).toBe(other.language);
  });

  it('sets UA client hints and BrowserScan navigation support', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/main/services/BrowserManager.ts'), 'utf8');
    expect(source).toContain('sec-ch-ua');
    expect(source).toContain('sec-ch-ua-platform');
    expect(source).toContain('baseURLForDataURL: profile.startUrl');
    expect(source).toContain("hostname === 'www.browserscan.net'");
    expect(source).toContain("hostname.endsWith('.browserscan.net')");
  });

  it('injects less detectable browser APIs instead of breaking Canvas or Audio', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/main/services/FingerprintService.ts'), 'utf8');
    expect(source).toContain('HTMLCanvasElement.prototype.toDataURL');
    expect(source).toContain('HTMLCanvasElement.prototype.toBlob');
    expect(source).toContain('CanvasRenderingContext2D.prototype.getImageData');
    expect(source).toContain('OfflineAudioContext.prototype.startRendering');
    expect(source).toContain('Navigator.prototype, \'plugins\'');
    expect(source).toContain('navigator.permissions.query');
  });
});
