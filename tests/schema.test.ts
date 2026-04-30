import { describe, expect, it } from 'vitest';
import { schemaSql } from '../src/main/services/schema';

describe('SQLite schema', () => {
  it('stores profiles and proxies without plaintext cookie column', () => {
    expect(schemaSql).toContain('CREATE TABLE IF NOT EXISTS profiles');
    expect(schemaSql).toContain('CREATE TABLE IF NOT EXISTS proxies');
    expect(schemaSql.toLowerCase()).not.toContain('cookie');
  });

  it('profiles reference proxy by id', () => {
    expect(schemaSql).toContain('proxy_id TEXT');
  });
});
