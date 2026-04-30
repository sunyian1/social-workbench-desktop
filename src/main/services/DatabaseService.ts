import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'node:path';
import { schemaSql } from './schema.js';

export class DatabaseService {
  private db?: Database.Database;

  open(dbPath = path.join(app.getPath('userData'), 'social-workbench.db')): Database.Database {
    if (!this.db) {
      this.db = new Database(dbPath);
      this.db.pragma('foreign_keys = ON');
      this.db.exec(schemaSql);
    }
    return this.db;
  }

  close(): void {
    this.db?.close();
    this.db = undefined;
  }
}
