import { describe, expect, it } from 'vitest';
import { getPlatform, PLATFORMS } from '../src/shared/types';

describe('platform definitions', () => {
  it('contains the MVP platforms requested by the user', () => {
    expect(PLATFORMS.map((p) => p.key)).toEqual([
      'telegram-a',
      'telegram-k',
      'whatsapp',
      'instagram',
      'facebook',
      'browserscan'
    ]);
  });

  it('returns exact URL for WhatsApp Web', () => {
    expect(getPlatform('whatsapp').url).toBe('https://web.whatsapp.com/');
  });
});
