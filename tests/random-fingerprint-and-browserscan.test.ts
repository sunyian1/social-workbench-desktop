import { describe, expect, it } from 'vitest';
import { createRandomFingerprint, getPlatform, PLATFORMS } from '../src/shared/types';
import fs from 'node:fs';
import path from 'node:path';

describe('random profile fingerprints and BrowserScan platform', () => {
  it('supports creating BrowserScan profiles from the application center', () => {
    expect(PLATFORMS.map((p) => p.key)).toContain('browserscan');
    expect(getPlatform('browserscan').url).toBe('https://www.browserscan.net/zh');
  });

  it('generates different complete fingerprints for separate accounts', () => {
    const a = createRandomFingerprint('whatsapp', 'profile_a');
    const b = createRandomFingerprint('whatsapp', 'profile_b');
    expect(a).not.toEqual(b);
    for (const fp of [a, b]) {
      expect(fp.userAgent).toContain('Chrome/');
      expect(fp.userAgent).not.toContain('Electron');
      expect(fp.language).toBeTruthy();
      expect(fp.languages?.length).toBeGreaterThan(1);
      expect(fp.platform).toBeTruthy();
      expect(fp.timezone).toBeTruthy();
      expect(fp.hardwareConcurrency).toBeGreaterThanOrEqual(4);
      expect(fp.deviceMemory).toBeGreaterThanOrEqual(4);
      expect(fp.screenWidth).toBeGreaterThanOrEqual(1280);
      expect(fp.screenHeight).toBeGreaterThanOrEqual(720);
      expect(fp.webglVendor).toBeTruthy();
      expect(fp.webglRenderer).toBeTruthy();
      expect(fp.canvasNoise).toMatch(/^0\./);
      expect(fp.audioNoise).toMatch(/^0\./);
    }
  });

  it('uses random fingerprint generation when a profile is created', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/main/services/ProfileService.ts'), 'utf8');
    expect(source).toContain('createRandomFingerprint(input.platform, id)');
    expect(source).not.toContain('DEFAULT_FINGERPRINTS[input.platform]');
  });
});
