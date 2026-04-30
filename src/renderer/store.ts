import { create } from 'zustand';
import { PLATFORMS } from '../shared/types';
import type { CreateProxyInput, PlatformDefinition, Profile, ProxyConfig, PlatformKey } from '../shared/types';

interface WorkbenchState {
  profiles: Profile[];
  proxies: ProxyConfig[];
  platforms: PlatformDefinition[];
  activeProfileId?: string;
  refresh(): Promise<void>;
  createProfile(name: string, platform: PlatformKey, proxyId?: string | null): Promise<Profile>;
  removeProfile(id: string): Promise<void>;
  openProfile(id: string): Promise<void>;
  closeProfile(id: string): Promise<void>;
  closeActive(): Promise<void>;
  createProxy(proxy: CreateProxyInput): Promise<ProxyConfig>;
}

const defaultFingerprint = {
  language: 'zh-CN',
  languages: ['zh-CN', 'zh'],
  platform: 'Win32',
  timezone: 'Asia/Shanghai',
  hardwareConcurrency: 8,
  deviceMemory: 8
};

export const useWorkbenchStore = create<WorkbenchState>((set, get) => ({
  profiles: [],
  proxies: [],
  platforms: PLATFORMS,
  async refresh() {
    const [profiles, proxies, platforms] = await Promise.all([
      window.workbench.profiles.list(),
      window.workbench.proxies.list(),
      window.workbench.platforms()
    ]);
    set({ profiles, proxies, platforms });
  },
  async createProfile(name, platform, proxyId) {
    const profile = await window.workbench.profiles.create({
      name,
      platform,
      proxyId: proxyId ?? null,
      fingerprint: defaultFingerprint
    });
    await get().refresh();
    return profile;
  },
  async removeProfile(id) {
    await window.workbench.profiles.remove(id);
    if (get().activeProfileId === id) set({ activeProfileId: undefined });
    await get().refresh();
  },
  async openProfile(id) {
    await window.workbench.profiles.open(id);
    set({ activeProfileId: id });
  },
  async closeProfile(id) {
    if (get().activeProfileId === id) {
      await window.workbench.profiles.closeActive();
      set({ activeProfileId: undefined });
    }
  },
  async closeActive() {
    await window.workbench.profiles.closeActive();
    set({ activeProfileId: undefined });
  },
  async createProxy(proxy) {
    const created = await window.workbench.proxies.create(proxy);
    await get().refresh();
    return created;
  }
}));
