import { Router } from 'express';
import db from '../db.js';
import { HttpError } from '../middleware/errorHandler.js';

const router = Router();

function validatePersonBody(body) {
  const { house_id, first_name, last_name, phone, email, notes, moved_in } = body;
  if (typeof first_name !== 'string' || !first_name.trim()) {
    throw new HttpError(400, 'first_name is required');
  }
  let houseId = null;
  if (house_id !== undefined && house_id !== null && house_id !== '') {
    houseId = Number(house_id);
    if (!Number.isInteger(houseId)) throw new HttpError(400, 'house_id must be an integer');
    const house = db.prepare('SELECT id FROM houses WHERE id = ?').get(houseId);
    if (!house) throw new HttpError(400, `house_id ${houseId} does not exist`);
  }
  return {
    house_id: houseId,
    first_name: first_name.trim(),
    last_name: last_name ?? null,
    phone: phone ?? null,
    email: email ?? null,
    notes: notes ?? null,
    moved_in: moved_in ?? null,
  };
}

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM people ORDER BY first_name, last_name').all());
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM people WHERE id = ?').get(req.params.id);
  if (!row) throw new HttpError(404, 'Person not found');
  res.json(row);
});

router.post('/', (req, res) => {
  const data = validatePersonBody(req.body);
  const result = db
    .prepare(
      `INSERT INTO people (house_id, first_name, last_name, phone, email, notes, moved_in)
       VALUES (@house_id, @first_name, @last_name, @phone, @email, @notes, @moved_in)`
    )
    .run(data);
  const row = db.prepare('SELECT * FROM people WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(row);
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM people WHERE id = ?').get(req.params.id);
  if (!existing) throw new HttpError(404, 'Person not found');
  const data = validatePersonBody(req.body);
  db.prepare(
    `UPDATE people SET house_id = @house_id, first_name = @first_name, last_name = @last_name,
       phone = @phone, email = @email, notes = @notes, moved_in = @moved_in, updated_at = datetime('now')
     WHERE id = @id`
  ).run({ ...data, id: req.params.id });
  const row = db.prepare('SELECT * FROM people WHERE id = ?').get(req.params.id);
  res.json(row);
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM people WHERE id = ?').run(req.params.id);
  if (result.changes === 0) throw new HttpError(404, 'Person not found');
  res.status(204).end();
});

export default router;
