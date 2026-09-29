export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function errorHandler(err, req, res, next) {
  const status = err.status || (err.name === 'MulterError' ? 400 : 500);
  if (status === 500) {
    console.error(err);
  }
  res.status(status).json({ error: err.message || 'Internal server error' });
}
