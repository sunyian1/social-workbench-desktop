import { describe, expect, it } from 'vitest';
import { DEFAULT_FINGERPRINTS, getPlatform } from '../src/shared/types';

describe('WhatsApp browser compatibility', () => {
  it('uses WhatsApp Web instead of the generic homepage', () => {
    expect(getPlatform('whatsapp').url).toBe('https://web.whatsapp.com/');
  });

  it('defaults WhatsApp profiles to a modern Chrome Windows user agent', () => {
    const ua = DEFAULT_FINGERPRINTS.whatsapp.userAgent;
    expect(ua).toContain('Windows NT 10.0; Win64; x64');
    expect(ua).toContain('Chrome/');
    expect(ua).not.toContain('Electron');
    expect(ua).not.toContain('Social Workbench');
  });
});
