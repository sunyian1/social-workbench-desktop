export type PlatformKey = 'telegram-a' | 'telegram-k' | 'whatsapp' | 'instagram' | 'facebook' | 'browserscan';

export interface PlatformDefinition {
  key: PlatformKey;
  name: string;
  url: string;
}

export interface FingerprintConfig {
  userAgent?: string;
  language?: string;
  languages?: string[];
  platform?: string;
  timezone?: string;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  screenWidth?: number;
  screenHeight?: number;
  colorDepth?: number;
  webglVendor?: string;
  webglRenderer?: string;
  canvasNoise?: string;
  audioNoise?: string;
}

export interface ProxyConfig {
  id: string;
  name: string;
  type: 'http' | 'https' | 'socks4' | 'socks5';
  host: string;
  port: number;
  username?: string;
  password?: string;
  status: 'unchecked' | 'ok' | 'failed';
  latencyMs?: number | null;
  lastCheckAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  name: string;
  platform: PlatformKey;
  startUrl: string;
  partitionKey: string;
  proxyId?: string | null;
  fingerprint: FingerprintConfig;
  status: 'idle' | 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileInput {
  name: string;
  platform: PlatformKey;
  proxyId?: string | null;
  fingerprint?: FingerprintConfig;
}

export interface CreateProxyInput {
  name: string;
  type: ProxyConfig['type'];
  host: string;
  port: number;
  username?: string;
  password?: string;
}

export const PLATFORMS: PlatformDefinition[] = [
  { key: 'telegram-a', name: 'Telegram A', url: 'https://web.telegram.org/a/' },
  { key: 'telegram-k', name: 'Telegram K', url: 'https://web.telegram.org/k/' },
  { key: 'whatsapp', name: 'WhatsApp', url: 'https://web.whatsapp.com/' },
  { key: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/' },
  { key: 'facebook', name: 'Facebook', url: 'https://www.facebook.com/' },
  { key: 'browserscan', name: 'BrowserScan', url: 'https://www.browserscan.net/zh' }
];

const chromeVersion = '132.0.6834.210';
const windowsDeviceProfiles = [
  {
    platform: 'Win32',
    os: 'Windows NT 10.0; Win64; x64',
    language: 'zh-CN',
    languages: ['zh-CN', 'zh', 'en-US', 'en'],
    timezone: 'Asia/Shanghai',
    screen: [1920, 1080],
    webglVendor: 'Google Inc. (Intel)',
    webglRenderer: 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)'
  },
  {
    platform: 'Win32',
    os: 'Windows NT 10.0; Win64; x64',
    language: 'zh-CN',
    languages: ['zh-CN', 'zh', 'en-US', 'en'],
    timezone: 'Asia/Shanghai',
    screen: [1536, 864],
    webglVendor: 'Google Inc. (NVIDIA)',
    webglRenderer: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 Direct3D11 vs_5_0 ps_5_0, D3D11)'
  },
  {
    platform: 'Win32',
    os: 'Windows NT 10.0; Win64; x64',
    language: 'zh-CN',
    languages: ['zh-CN', 'zh', 'en-US', 'en'],
    timezone: 'Asia/Shanghai',
    screen: [1440, 900],
    webglVendor: 'Google Inc. (AMD)',
    webglRenderer: 'ANGLE (AMD, AMD Radeon RX 580 Direct3D11 vs_5_0 ps_5_0, D3D11)'
  },
  {
    platform: 'Win32',
    os: 'Windows NT 10.0; Win64; x64',
    language: 'zh-CN',
    languages: ['zh-CN', 'zh', 'en-US', 'en'],
    timezone: 'Asia/Shanghai',
    screen: [1680, 1050],
    webglVendor: 'Google Inc. (Microsoft)',
    webglRenderer: 'ANGLE (Microsoft, Microsoft Basic Render Driver Direct3D11 vs_5_0 ps_5_0, D3D11)'
  }
] as const;

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(items: readonly T[], seed: number): T {
  return items[seed % items.length];
}

export function createRandomFingerprint(platform: PlatformKey, seed = `${platform}:${Date.now()}:${Math.random()}`): FingerprintConfig {
  const h = hashSeed(seed);
  const base = pick(windowsDeviceProfiles, h);
  const cpu = pick([4, 6, 8, 10, 12, 16] as const, h >>> 9);
  const memory = pick([4, 8, 12, 16] as const, h >>> 13);
  const widthJitter = ((h >>> 17) % 5) * 8;
  const heightJitter = ((h >>> 21) % 5) * 4;
  const canvasNoise = `0.${String((h % 900000) + 100000)}`;
  const audioNoise = `0.${String(((h >>> 3) % 900000) + 100000)}`;
  return {
    userAgent: `Mozilla/5.0 (${base.os}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`,
    language: base.language,
    languages: [...base.languages],
    platform: base.platform,
    timezone: base.timezone,
    hardwareConcurrency: cpu,
    deviceMemory: memory,
    screenWidth: base.screen[0] + widthJitter,
    screenHeight: base.screen[1] + heightJitter,
    colorDepth: 24,
    webglVendor: base.webglVendor,
    webglRenderer: base.webglRenderer,
    canvasNoise,
    audioNoise
  };
}

export const DEFAULT_FINGERPRINTS: Record<PlatformKey, FingerprintConfig> = Object.fromEntries(
  PLATFORMS.map((platform) => [platform.key, createRandomFingerprint(platform.key, `default:${platform.key}`)])
) as Record<PlatformKey, FingerprintConfig>;

export function getPlatform(key: PlatformKey): PlatformDefinition {
  const item = PLATFORMS.find((p) => p.key === key);
  if (!item) throw new Error(`Unsupported platform: ${key}`);
  return item;
}
