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
  notes      TEXT,
  moved_in   TEXT,
  photo_filename TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_people_house_id ON people(house_id);

-- Telefonnummern, E-Mail-Adressen und zusätzliche Adressen (Arbeit, ...) einer
-- Person. Die Wohnadresse steht nicht hier, sie ergibt sich aus houses.address.
CREATE TABLE IF NOT EXISTS person_fields (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  kind      TEXT NOT NULL CHECK (kind IN ('phone', 'email', 'address')),
  label     TEXT,
  value     TEXT NOT NULL,
  position  INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_person_fields_person_id ON person_fields(person_id);

-- Eine Zeile pro Beziehung: related_person_id ist für person_id "label"
-- (z.B. Mutter), person_id ist für related_person_id "reverse_label" (z.B. Kind).
CREATE TABLE IF NOT EXISTS relationships (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id         INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  related_person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  category          TEXT NOT NULL CHECK (category IN ('family', 'social')),
  label             TEXT NOT NULL,
  reverse_label     TEXT NOT NULL,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (person_id <> related_person_id)
);

CREATE INDEX IF NOT EXISTS idx_relationships_person_id ON relationships(person_id);
CREATE INDEX IF NOT EXISTS idx_relationships_related_person_id ON relationships(related_person_id);

CREATE TABLE IF NOT EXISTS settings (
  id             INTEGER PRIMARY KEY CHECK (id = 1),
  map_center_lat REAL NOT NULL DEFAULT 52.52,
  map_center_lng REAL NOT NULL DEFAULT 13.405,
  map_zoom       INTEGER NOT NULL DEFAULT 17,
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO settings (id) VALUES (1);
