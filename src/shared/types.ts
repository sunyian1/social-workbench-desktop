export type PlatformKey = 'telegram-a' | 'telegram-k' | 'whatsapp' | 'instagram' | 'facebook';

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
  { key: 'facebook', name: 'Facebook', url: 'https://www.facebook.com/' }
];

export const DEFAULT_FINGERPRINTS: Record<PlatformKey, FingerprintConfig> = {
  whatsapp: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    language: 'zh-CN',
    languages: ['zh-CN', 'zh', 'en-US', 'en'],
    platform: 'Win32',
    timezone: 'Asia/Shanghai',
    hardwareConcurrency: 8,
    deviceMemory: 8
  },
  'telegram-a': {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    language: 'zh-CN',
    languages: ['zh-CN', 'zh', 'en-US', 'en'],
    platform: 'Win32',
    timezone: 'Asia/Shanghai',
    hardwareConcurrency: 8,
    deviceMemory: 8
  },
  'telegram-k': {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    language: 'zh-CN',
    languages: ['zh-CN', 'zh', 'en-US', 'en'],
    platform: 'Win32',
    timezone: 'Asia/Shanghai',
    hardwareConcurrency: 8,
    deviceMemory: 8
  },
  instagram: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    language: 'zh-CN',
    languages: ['zh-CN', 'zh', 'en-US', 'en'],
    platform: 'Win32',
    timezone: 'Asia/Shanghai',
    hardwareConcurrency: 8,
    deviceMemory: 8
  },
  facebook: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    language: 'zh-CN',
    languages: ['zh-CN', 'zh', 'en-US', 'en'],
    platform: 'Win32',
    timezone: 'Asia/Shanghai',
    hardwareConcurrency: 8,
    deviceMemory: 8
  }
};

export function getPlatform(key: PlatformKey): PlatformDefinition {
  const item = PLATFORMS.find((p) => p.key === key);
  if (!item) throw new Error(`Unsupported platform: ${key}`);
  return item;
}
