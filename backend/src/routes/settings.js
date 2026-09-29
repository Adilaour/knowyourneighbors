import { Router } from 'express';
import db from '../db.js';
import { HttpError } from '../middleware/errorHandler.js';

const router = Router();

function isFiniteNumber(n) {
  return typeof n === 'number' && Number.isFinite(n);
}

router.get('/', (req, res) => {
  const row = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  res.json(row);
});

router.put('/', (req, res) => {
  const { map_center_lat, map_center_lng, map_zoom } = req.body;
  if (!isFiniteNumber(map_center_lat) || map_center_lat < -90 || map_center_lat > 90) {
    throw new HttpError(400, 'map_center_lat must be a number between -90 and 90');
  }
  if (!isFiniteNumber(map_center_lng) || map_center_lng < -180 || map_center_lng > 180) {
    throw new HttpError(400, 'map_center_lng must be a number between -180 and 180');
  }
  if (!Number.isInteger(map_zoom) || map_zoom < 1 || map_zoom > 19) {
    throw new HttpError(400, 'map_zoom must be an integer between 1 and 19');
  }
  db.prepare(
    `UPDATE settings SET map_center_lat = @map_center_lat, map_center_lng = @map_center_lng,
       map_zoom = @map_zoom, updated_at = datetime('now') WHERE id = 1`
  ).run({ map_center_lat, map_center_lng, map_zoom });
  const row = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  res.json(row);
});

export default router;
