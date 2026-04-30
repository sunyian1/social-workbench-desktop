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

export function getPlatform(key: PlatformKey): PlatformDefinition {
  const item = PLATFORMS.find((p) => p.key === key);
  if (!item) throw new Error(`Unsupported platform: ${key}`);
  return item;
}
