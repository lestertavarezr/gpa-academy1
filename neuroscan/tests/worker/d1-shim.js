import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";

// Minimal Cloudflare D1 binding over node:sqlite, loaded with the real migrations.
export function createD1() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON;");
  const dir = new URL("../../worker/migrations/", import.meta.url);
  for (const file of fs.readdirSync(dir).sort()) db.exec(fs.readFileSync(new URL(file, dir), "utf8"));
  const norm = (params) => params.map((p) => (p === undefined ? (() => { throw new Error("D1_TYPE_ERROR: undefined is not supported"); })() : typeof p === "boolean" ? Number(p) : p));
  const plain = (row) => (row ? { ...row } : null);

  class Statement {
    constructor(sql, params = []) {
      this.sql = sql;
      this.params = params;
    }
    bind(...params) {
      return new Statement(this.sql, norm(params));
    }
    async first(column) {
      const row = plain(db.prepare(this.sql).get(...this.params));
      return row && column ? row[column] : row;
    }
    async all() {
      const results = db.prepare(this.sql).all(...this.params).map(plain);
      return { success: true, results, meta: {} };
    }
    async run() {
      const info = db.prepare(this.sql).run(...this.params);
      return { success: true, results: [], meta: { changes: Number(info.changes), last_row_id: Number(info.lastInsertRowid) } };
    }
  }

  return {
    raw: db,
    prepare: (sql) => new Statement(sql),
    async batch(statements) {
      db.exec("BEGIN");
      try {
        const out = [];
        for (const s of statements) out.push(/^\s*(SELECT|WITH)/i.test(s.sql) || /RETURNING/i.test(s.sql) ? await s.all() : await s.run());
        db.exec("COMMIT");
        return out;
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
  };
}
