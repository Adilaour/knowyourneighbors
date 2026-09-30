import db from './db.js';
import { HttpError } from './middleware/errorHandler.js';

// Listen-Feld im API-Body -> kind in person_fields
const FIELD_LISTS = { phones: 'phone', emails: 'email', addresses: 'address' };
const CATEGORIES = ['family', 'social'];

function parseFieldList(name, list) {
  if (list === undefined) return undefined;
  if (!Array.isArray(list)) throw new HttpError(400, `${name} must be an array`);
  const result = [];
  for (const entry of list) {
    if (entry === null || typeof entry !== 'object') {
      throw new HttpError(400, `${name} entries must be objects`);
    }
    const { label, value } = entry;
    if (typeof value !== 'string') throw new HttpError(400, `${name} entries need a string value`);
    if (label !== undefined && label !== null && typeof label !== 'string') {
      throw new HttpError(400, `${name} labels must be strings`);
    }
    // Leere Zeilen aus dem Formular werden ignoriert statt abgelehnt.
    if (!value.trim()) continue;
    result.push({ label: label?.trim() || null, value: value.trim() });
  }
  return result;
}

function parseRelationships(list, selfId) {
  if (list === undefined) return undefined;
  if (!Array.isArray(list)) throw new HttpError(400, 'relationships must be an array');
  const seen = new Set();
  const result = [];
  for (const entry of list) {
    if (entry === null || typeof entry !== 'object') {
      throw new HttpError(400, 'relationships entries must be objects');
    }
    const { other_person_id, category, label, reverse_label } = entry;
    if (!Number.isInteger(other_person_id)) {
      throw new HttpError(400, 'relationship other_person_id must be an integer');
    }
    if (other_person_id === selfId) {
      throw new HttpError(400, 'A person cannot have a relationship with themselves');
    }
    if (!CATEGORIES.includes(category)) {
      throw new HttpError(400, `relationship category must be one of: ${CATEGORIES.join(', ')}`);
    }
    if (typeof label !== 'string' || !label.trim()) {
      throw new HttpError(400, 'relationship label is required');
    }
    if (reverse_label !== undefined && reverse_label !== null && typeof reverse_label !== 'string') {
      throw new HttpError(400, 'relationship reverse_label must be a string');
    }
    if (!db.prepare('SELECT 1 FROM people WHERE id = ?').get(other_person_id)) {
      throw new HttpError(400, `relationship person ${other_person_id} does not exist`);
    }
    const parsed = {
      other_person_id,
      category,
      label: label.trim(),
      // Ohne Gegenbezeichnung ist die Beziehung symmetrisch (z.B. Freund).
      reverse_label: reverse_label?.trim() || label.trim(),
    };
    const key = [parsed.other_person_id, parsed.category, parsed.label, parsed.reverse_label].join('\n');
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(parsed);
  }
  return result;
}

// Liest die optionalen Listen aus dem Body. Fehlt eine Liste (undefined),
// bleibt sie beim Speichern unverändert; eine vorhandene Liste ersetzt den
// bisherigen Stand komplett.
export function parsePersonDetails(body, selfId) {
  const details = { relationships: parseRelationships(body.relationships, selfId) };
  for (const name of Object.keys(FIELD_LISTS)) {
    details[name] = parseFieldList(name, body[name]);
  }
  return details;
}

export function savePersonDetails(personId, details) {
  for (const [name, kind] of Object.entries(FIELD_LISTS)) {
    const entries = details[name];
    if (entries === undefined) continue;
    db.prepare('DELETE FROM person_fields WHERE person_id = ? AND kind = ?').run(personId, kind);
    const insert = db.prepare(
      'INSERT INTO person_fields (person_id, kind, label, value, position) VALUES (?, ?, ?, ?, ?)'
    );
    entries.forEach((entry, position) => insert.run(personId, kind, entry.label, entry.value, position));
  }

  if (details.relationships !== undefined) {
    db.prepare('DELETE FROM relationships WHERE person_id = ? OR related_person_id = ?').run(personId, personId);
    const insert = db.prepare(
      `INSERT INTO relationships (person_id, related_person_id, category, label, reverse_label)
       VALUES (?, ?, ?, ?, ?)`
    );
    for (const rel of details.relationships) {
      insert.run(personId, rel.other_person_id, rel.category, rel.label, rel.reverse_label);
    }
  }
}

// Hängt phones, emails, addresses und relationships an die Personenzeilen.
// Beziehungen werden aus Sicht der jeweiligen Person geliefert: label ist das,
// was die andere Person für sie ist.
export function hydratePeople(rows) {
  if (rows.length === 0) return [];
  const ids = JSON.stringify(rows.map((r) => r.id));

  const fieldsByPerson = new Map();
  const fieldRows = db
    .prepare(
      `SELECT id, person_id, kind, label, value FROM person_fields
       WHERE person_id IN (SELECT j.value FROM json_each(?) AS j)
       ORDER BY position, id`
    )
    .all(ids);
  for (const { person_id, kind, ...field } of fieldRows) {
    const key = `${person_id}:${kind}`;
    if (!fieldsByPerson.has(key)) fieldsByPerson.set(key, []);
    fieldsByPerson.get(key).push(field);
  }

  const relationshipsByPerson = new Map();
  const addRelationship = (viewerId, relationship) => {
    if (!relationshipsByPerson.has(viewerId)) relationshipsByPerson.set(viewerId, []);
    relationshipsByPerson.get(viewerId).push(relationship);
  };
  const wanted = new Set(rows.map((r) => r.id));
  const relationshipRows = db
    .prepare(
      `SELECT * FROM relationships
       WHERE person_id IN (SELECT j.value FROM json_each(?) AS j)
          OR related_person_id IN (SELECT j.value FROM json_each(?) AS j)
       ORDER BY category, id`
    )
    .all(ids, ids);
  for (const rel of relationshipRows) {
    if (wanted.has(rel.person_id)) {
      addRelationship(rel.person_id, {
        id: rel.id,
        other_person_id: rel.related_person_id,
        category: rel.category,
        label: rel.label,
        reverse_label: rel.reverse_label,
      });
    }
    if (wanted.has(rel.related_person_id)) {
      addRelationship(rel.related_person_id, {
        id: rel.id,
        other_person_id: rel.person_id,
        category: rel.category,
        label: rel.reverse_label,
        reverse_label: rel.label,
      });
    }
  }

  return rows.map((row) => ({
    ...row,
    phones: fieldsByPerson.get(`${row.id}:phone`) ?? [],
    emails: fieldsByPerson.get(`${row.id}:email`) ?? [],
    addresses: fieldsByPerson.get(`${row.id}:address`) ?? [],
    relationships: relationshipsByPerson.get(row.id) ?? [],
  }));
}

export function getPerson(id) {
  const row = db.prepare('SELECT * FROM people WHERE id = ?').get(id);
  return row ? hydratePeople([row])[0] : undefined;
}
