import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbPath = path.resolve(process.env.DB_PATH || path.join(__dirname, '..', 'data', 'dev.db'));
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const photosDir = path.join(path.dirname(dbPath), 'photos');
fs.mkdirSync(photosDir, { recursive: true });

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// Leichte Migration für Datenbanken, die vor Einführung von photo_filename
// angelegt wurden (CREATE TABLE IF NOT EXISTS legt keine neuen Spalten an).
const peopleColumns = db.prepare('PRAGMA table_info(people)').all();
if (!peopleColumns.some((c) => c.name === 'photo_filename')) {
  db.exec('ALTER TABLE people ADD COLUMN photo_filename TEXT');
}

// Telefon und E-Mail lagen früher als einzelne Spalten an people. Bestehende
// Werte wandern in person_fields, danach werden die Spalten entfernt.
const legacyColumns = ['phone', 'email'].filter((name) =>
  db.prepare('PRAGMA table_info(people)').all().some((c) => c.name === name)
);
if (legacyColumns.length > 0) {
  db.transaction(() => {
    for (const column of legacyColumns) {
      const kind = column;
      db.prepare(
        `INSERT INTO person_fields (person_id, kind, value)
         SELECT id, @kind, trim(${column}) FROM people
         WHERE ${column} IS NOT NULL AND trim(${column}) <> ''`
      ).run({ kind });
      db.exec(`ALTER TABLE people DROP COLUMN ${column}`);
    }
  })();
}

export default db;
