import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import db, { photosDir } from '../db.js';
import { HttpError } from '../middleware/errorHandler.js';

const router = Router();

const ALLOWED_MIME_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES[file.mimetype]) {
      cb(new HttpError(400, 'Nur JPEG-, PNG- oder WebP-Bilder sind erlaubt'));
      return;
    }
    cb(null, true);
  },
});

function deletePhotoFile(filename) {
  if (!filename) return;
  const filePath = path.join(photosDir, filename);
  fs.rm(filePath, { force: true }, () => {});
}

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
  const existing = db.prepare('SELECT photo_filename FROM people WHERE id = ?').get(req.params.id);
  if (!existing) throw new HttpError(404, 'Person not found');
  db.prepare('DELETE FROM people WHERE id = ?').run(req.params.id);
  deletePhotoFile(existing.photo_filename);
  res.status(204).end();
});

router.get('/:id/photo', (req, res) => {
  const row = db.prepare('SELECT photo_filename FROM people WHERE id = ?').get(req.params.id);
  if (!row || !row.photo_filename) throw new HttpError(404, 'No photo');
  res.sendFile(path.join(photosDir, row.photo_filename), (err) => {
    if (err) res.status(404).end();
  });
});

router.post('/:id/photo', upload.single('photo'), (req, res) => {
  const existing = db.prepare('SELECT photo_filename FROM people WHERE id = ?').get(req.params.id);
  if (!existing) throw new HttpError(404, 'Person not found');
  if (!req.file) throw new HttpError(400, 'photo file is required');

  const ext = ALLOWED_MIME_TYPES[req.file.mimetype];
  const filename = `${req.params.id}-${Date.now()}${ext}`;
  fs.writeFileSync(path.join(photosDir, filename), req.file.buffer);

  db.prepare(`UPDATE people SET photo_filename = ?, updated_at = datetime('now') WHERE id = ?`).run(
    filename,
    req.params.id
  );
  deletePhotoFile(existing.photo_filename);

  const row = db.prepare('SELECT * FROM people WHERE id = ?').get(req.params.id);
  res.json(row);
});

router.delete('/:id/photo', (req, res) => {
  const existing = db.prepare('SELECT photo_filename FROM people WHERE id = ?').get(req.params.id);
  if (!existing) throw new HttpError(404, 'Person not found');
  db.prepare(`UPDATE people SET photo_filename = NULL, updated_at = datetime('now') WHERE id = ?`).run(
    req.params.id
  );
  deletePhotoFile(existing.photo_filename);
  const row = db.prepare('SELECT * FROM people WHERE id = ?').get(req.params.id);
  res.json(row);
});

export default router;
