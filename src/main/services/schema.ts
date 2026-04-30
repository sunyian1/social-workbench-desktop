export const schemaSql = `
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  start_url TEXT NOT NULL,
  partition_key TEXT NOT NULL UNIQUE,
  proxy_id TEXT,
  fingerprint_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'idle',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(proxy_id) REFERENCES proxies(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS proxies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  host TEXT NOT NULL,
  port INTEGER NOT NULL,
  username TEXT,
  password TEXT,
  status TEXT NOT NULL DEFAULT 'unchecked',
  latency_ms INTEGER,
  last_check_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;
