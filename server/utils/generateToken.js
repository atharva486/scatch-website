const jwt = require('jsonwebtoken');

const getSecret = () => process.env.JWT_KEY;

const TOKEN_TTL = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Signs a JWT carrying the subject's email and id.
 */
const generateToken = (subject) => {
  if (!subject || !subject._id || !subject.email) {
    throw new Error('generateToken requires an object with _id and email');
  }
  return jwt.sign({ email: subject.email, id: String(subject._id) }, getSecret(), {
    expiresIn: TOKEN_TTL,
  });
};

/**
 * Verifies a JWT. Returns null instead of throwing so callers can respond
 * with a clean 401 rather than a 500.
 */
const verifyToken = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, getSecret());
  } catch {
    return null;
  }
};

module.exports = { generateToken, verifyToken };