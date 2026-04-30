import { nanoid } from 'nanoid';
import type Database from 'better-sqlite3';
import proxyChain from 'proxy-chain';
import type { CreateProxyInput, ProxyConfig } from '../../shared/types.js';

const now = () => new Date().toISOString();

function rowToProxy(row: any): ProxyConfig {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    host: row.host,
    port: row.port,
    username: row.username ?? undefined,
    password: row.password ?? undefined,
    status: row.status,
    latencyMs: row.latency_ms,
    lastCheckAt: row.last_check_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class ProxyService {
  private localUrls = new Map<string, string>();

  constructor(private db: Database.Database) {}

  list(): ProxyConfig[] {
    return this.db.prepare('SELECT * FROM proxies ORDER BY created_at DESC').all().map(rowToProxy);
  }

  get(id: string): ProxyConfig | undefined {
    const row = this.db.prepare('SELECT * FROM proxies WHERE id=?').get(id);
    return row ? rowToProxy(row) : undefined;
  }

  create(input: CreateProxyInput): ProxyConfig {
    const id = `proxy_${nanoid(12)}`;
    const ts = now();
    this.db.prepare(`INSERT INTO proxies
      (id, name, type, host, port, username, password, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'unchecked', ?, ?)`)
      .run(id, input.name, input.type, input.host, input.port, input.username ?? null, input.password ?? null, ts, ts);
    return this.get(id)!;
  }

  remove(id: string): void {
    void this.closeRuntime(id);
    this.db.prepare('DELETE FROM proxies WHERE id=?').run(id);
  }

  async getLocalProxyUrl(proxy: ProxyConfig): Promise<string> {
    const cached = this.localUrls.get(proxy.id);
    if (cached) return cached;
    const auth = proxy.username ? `${encodeURIComponent(proxy.username)}:${encodeURIComponent(proxy.password ?? '')}@` : '';
    const upstreamProxyUrl = `${proxy.type}://${auth}${proxy.host}:${proxy.port}`;
    const localUrl = await proxyChain.anonymizeProxy(upstreamProxyUrl);
    this.localUrls.set(proxy.id, localUrl);
    return localUrl;
  }

  async closeRuntime(id: string): Promise<void> {
    const url = this.localUrls.get(id);
    if (url) {
      await proxyChain.closeAnonymizedProxy(url, true).catch(() => undefined);
      this.localUrls.delete(id);
    }
  }
}
