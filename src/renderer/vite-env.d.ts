/// <reference types="vite/client" />
import type { CreateProfileInput, CreateProxyInput, PlatformDefinition, Profile, ProxyConfig } from '../shared/types';

declare global {
  interface Window {
    workbench: {
      profiles: {
        list(): Promise<Profile[]>;
        create(input: CreateProfileInput): Promise<Profile>;
        update(id: string, patch: Partial<CreateProfileInput>): Promise<Profile>;
        remove(id: string): Promise<boolean>;
        open(id: string): Promise<boolean>;
      };
      proxies: {
        list(): Promise<ProxyConfig[]>;
        create(input: CreateProxyInput): Promise<ProxyConfig>;
        remove(id: string): Promise<boolean>;
      };
      platforms(): Promise<PlatformDefinition[]>;
    };
  }
}
