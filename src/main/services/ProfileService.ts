import { nanoid } from 'nanoid';
import type Database from 'better-sqlite3';
import type { CreateProfileInput, Profile } from '../../shared/types.js';
import { getPlatform } from '../../shared/types.js';

const now = () => new Date().toISOString();

function rowToProfile(row: any): Profile {
  return {
    id: row.id,
    name: row.name,
    platform: row.platform,
    startUrl: row.start_url,
    partitionKey: row.partition_key,
    proxyId: row.proxy_id,
    fingerprint: JSON.parse(row.fingerprint_json || '{}'),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class ProfileService {
  constructor(private db: Database.Database) {}

  list(): Profile[] {
    return this.db.prepare('SELECT * FROM profiles ORDER BY created_at DESC').all().map(rowToProfile);
  }

  get(id: string): Profile | undefined {
    const row = this.db.prepare('SELECT * FROM profiles WHERE id = ?').get(id);
    return row ? rowToProfile(row) : undefined;
  }

  create(input: CreateProfileInput): Profile {
    const id = `profile_${nanoid(12)}`;
    const platform = getPlatform(input.platform);
    const ts = now();
    const partitionKey = `persist:profile:${id}`;
    this.db.prepare(`INSERT INTO profiles
      (id, name, platform, start_url, partition_key, proxy_id, fingerprint_json, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'idle', ?, ?)`)
      .run(id, input.name, input.platform, platform.url, partitionKey, input.proxyId ?? null, JSON.stringify(input.fingerprint ?? {}), ts, ts);
    return this.get(id)!;
  }

  update(id: string, patch: Partial<CreateProfileInput>): Profile {
    const current = this.get(id);
    if (!current) throw new Error('Profile not found');
    const platformKey = patch.platform ?? current.platform;
    const platform = getPlatform(platformKey);
    this.db.prepare(`UPDATE profiles SET name=?, platform=?, start_url=?, proxy_id=?, fingerprint_json=?, updated_at=? WHERE id=?`)
      .run(patch.name ?? current.name, platformKey, platform.url, patch.proxyId ?? current.proxyId ?? null, JSON.stringify(patch.fingerprint ?? current.fingerprint), now(), id);
    return this.get(id)!;
  }

  remove(id: string): void {
    this.db.prepare('DELETE FROM profiles WHERE id = ?').run(id);
  }
}
