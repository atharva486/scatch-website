const bcrypt = require('bcrypt');

// Fall back to 10 rounds when ROUNDS is unset or unparseable. Previously
// `parseInt(undefined)` produced NaN and made every registration throw.
const ROUNDS = (() => {
  const parsed = parseInt(process.env.ROUNDS, 10);
  return Number.isFinite(parsed) && parsed >= 4 && parsed <= 15 ? parsed : 10;
})();

const generatePassword = async (password) => {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('Password must be a non-empty string');
  }
  const salt = await bcrypt.genSalt(ROUNDS);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (plain, hash) => {
  if (!plain || !hash) return false;
  return bcrypt.compare(plain, hash);
};

module.exports = { generatePassword, comparePassword };