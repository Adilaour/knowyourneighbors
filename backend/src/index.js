import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import housesRouter from './routes/houses.js';
import peopleRouter from './routes/people.js';
import settingsRouter from './routes/settings.js';
import { errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

const app = express();
app.use(express.json());

app.use('/api/houses', housesRouter);
app.use('/api/people', peopleRouter);
app.use('/api/settings', settingsRouter);

app.use(express.static(publicDir));
app.get('/{*splat}', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(publicDir, 'index.html'), (err) => {
    if (err) next(err);
  });
});

app.use(errorHandler);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`knowyourneighbors backend listening on port ${port}`);
});
