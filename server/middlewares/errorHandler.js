/**
 * Error-handling helpers.
 *
 * Every controller used to swallow failures with a bare `catch { res.json({success:false}) }`,
 * which turned 500s (and even programming errors) into a generic "failure" the
 * UI could only report as "Something went wrong".
 */

/** Wraps an async handler so rejected promises reach the Express error handler. */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/** An error with an associated HTTP status code. */
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = 'HttpError';
  }
}

const badRequest = (message) => new HttpError(400, message);
const unauthorized = (message) => new HttpError(401, message);
const forbidden = (message) => new HttpError(403, message);
const notFound = (message) => new HttpError(404, message);

/**
 * Central error handler. Never leaks stack traces to the client.
 *
 * Specific error shapes are matched first; only genuinely unrecognised errors
 * are treated as 500s and logged. (Matching the generic case first meant a
 * malformed ObjectId in a URL was logged and reported as a server fault.)
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  // Multer rejects oversized/unexpected uploads with a coded error.
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, error: 'Image must be smaller than 5 MB' });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({ success: false, error: err.message });
  }

  // Duplicate key (e.g. registering an email that already exists).
  if (err?.code === 11000) {
    return res
      .status(409)
      .json({ success: false, error: 'An account with that email already exists' });
  }

  // Mongoose schema validation.
  if (err?.name === 'ValidationError' && err.errors) {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    return res.status(400).json({ success: false, error: message });
  }

  // Malformed or missing ObjectId in a path/body parameter.
  if (err?.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(404).json({ success: false, error: 'Resource not found' });
  }

  const status = err?.status || err?.statusCode || 500;

  if (status >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }

  return res.status(status).json({ success: false, error: err.message });
}

module.exports = {
  asyncHandler,
  errorHandler,
  HttpError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
};