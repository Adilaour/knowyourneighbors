CREATE TABLE IF NOT EXISTS houses (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  address    TEXT,
  polygon    TEXT NOT NULL,
  notes      TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS people (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  house_id   INTEGER REFERENCES houses(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name  TEXT,
  phone      TEXT,
  email      TEXT,
  notes      TEXT,
  moved_in   TEXT,
  photo_filename TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_people_house_id ON people(house_id);

CREATE TABLE IF NOT EXISTS settings (
  id             INTEGER PRIMARY KEY CHECK (id = 1),
  map_center_lat REAL NOT NULL DEFAULT 52.52,
  map_center_lng REAL NOT NULL DEFAULT 13.405,
  map_zoom       INTEGER NOT NULL DEFAULT 17,
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO settings (id) VALUES (1);
