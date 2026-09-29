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

export default db;
