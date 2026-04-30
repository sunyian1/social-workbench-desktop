import { create } from 'zustand';
import { PLATFORMS } from '../shared/types';
import type { PlatformDefinition, Profile, ProxyConfig, PlatformKey } from '../shared/types';

interface WorkbenchState {
  profiles: Profile[];
  proxies: ProxyConfig[];
  platforms: PlatformDefinition[];
  activeProfileId?: string;
  refresh(): Promise<void>;
  createProfile(name: string, platform: PlatformKey): Promise<void>;
  removeProfile(id: string): Promise<void>;
  openProfile(id: string): Promise<void>;
  createProxy(proxy: { name: string; type: ProxyConfig['type']; host: string; port: number; username?: string; password?: string }): Promise<void>;
}

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
  async createProfile(name, platform) {
    await window.workbench.profiles.create({ name, platform, fingerprint: { language: 'zh-CN', languages: ['zh-CN', 'zh'], platform: 'Win32', timezone: 'Asia/Shanghai', hardwareConcurrency: 8, deviceMemory: 8 } });
    await get().refresh();
  },
  async removeProfile(id) {
    await window.workbench.profiles.remove(id);
    await get().refresh();
  },
  async openProfile(id) {
    await window.workbench.profiles.open(id);
    set({ activeProfileId: id });
  },
  async createProxy(proxy) {
    await window.workbench.proxies.create(proxy);
    await get().refresh();
  }
}));
