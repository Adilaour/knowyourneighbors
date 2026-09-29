import { Router } from 'express';
import db from '../db.js';
import { HttpError } from '../middleware/errorHandler.js';

const router = Router();

function serialize(row) {
  return { ...row, polygon: JSON.parse(row.polygon) };
}

function validatePolygon(polygon) {
  if (
    !Array.isArray(polygon) ||
    polygon.length < 3 ||
    !polygon.every(
      (p) => Array.isArray(p) && p.length === 2 && typeof p[0] === 'number' && typeof p[1] === 'number'
    )
  ) {
    throw new HttpError(400, 'polygon must be an array of at least 3 [lat, lng] pairs');
  }
}

function validateHouseBody(body) {
  const { name, address, notes, polygon } = body;
  if (typeof name !== 'string' || !name.trim()) {
    throw new HttpError(400, 'name is required');
  }
  validatePolygon(polygon);
  return {
    name: name.trim(),
    address: address ?? null,
    notes: notes ?? null,
    polygon: JSON.stringify(polygon),
  };
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM houses ORDER BY name').all();
  res.json(rows.map(serialize));
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM houses WHERE id = ?').get(req.params.id);
  if (!row) throw new HttpError(404, 'House not found');
  res.json(serialize(row));
});

router.post('/', (req, res) => {
  const data = validateHouseBody(req.body);
  const result = db
    .prepare('INSERT INTO houses (name, address, notes, polygon) VALUES (@name, @address, @notes, @polygon)')
    .run(data);
  const row = db.prepare('SELECT * FROM houses WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(serialize(row));
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM houses WHERE id = ?').get(req.params.id);
  if (!existing) throw new HttpError(404, 'House not found');
  const data = validateHouseBody(req.body);
  db.prepare(
    `UPDATE houses SET name = @name, address = @address, notes = @notes, polygon = @polygon, updated_at = datetime('now') WHERE id = @id`
  ).run({ ...data, id: req.params.id });
  const row = db.prepare('SELECT * FROM houses WHERE id = ?').get(req.params.id);
  res.json(serialize(row));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM houses WHERE id = ?').run(req.params.id);
  if (result.changes === 0) throw new HttpError(404, 'House not found');
  res.status(204).end();
});

export default router;
