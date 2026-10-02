const userModel = require('../models/usermodel');
const ownerModel = require('../models/ownermodel');
const { generateToken, verifyToken } = require('../utils/generateToken');
const { generatePassword, comparePassword } = require('../utils/generateUser');
const { setAuthCookie, clearAuthCookie } = require('../utils/authCookie');
const { asyncHandler, badRequest, unauthorized } = require('../middlewares/errorHandler');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Standard Indian GSTIN: 2 digits + 5 letters + 4 digits + letter + alnum + Z + alnum.
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;

/** Shared registration handler for both account types. */
function registerHandler(Model) {
  return asyncHandler(async (req, res) => {
    const { fullname, email, password } = req.body ?? {};
    const extra = Model === ownerModel ? { gstin: req.body?.gstin } : {};

    if (!fullname || !email || !password) {
      throw badRequest('Full name, email and password are required');
    }
    if (!EMAIL_RE.test(String(email))) {
      throw badRequest('Please provide a valid email address');
    }
    if (String(password).length < 8) {
      throw badRequest('Password must be at least 8 characters');
    }
    if (extra.gstin !== undefined && !GSTIN_RE.test(String(extra.gstin).toUpperCase())) {
      throw badRequest('GSTIN must be a valid 15-character GSTIN (e.g. 27ABCDE1234F1Z5)');
    }

    const existing = await Model.findOne({ email: String(email).toLowerCase() });
    if (existing) {
      throw badRequest('An account with that email already exists');
    }

    await Model.create({
      fullname: String(fullname).trim(),
      email: String(email).toLowerCase(),
      password: await generatePassword(password),
      ...(extra.gstin !== undefined ? { gstin: String(extra.gstin) } : {}),
    });

    return res.status(201).json({ success: true });
  });
}

const register_user = registerHandler(userModel);
const register_seller = registerHandler(ownerModel);

/** Shared login handler for both account types. */
function loginHandler(Model, role) {
  return asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      throw badRequest('Email and password are required');
    }

    const account = await Model.findOne({ email: String(email).toLowerCase() }).select('+password');

    // Same response for "no such account" and "wrong password" so the endpoint
    // cannot be used to enumerate registered emails.
    if (!account) {
      throw unauthorized(`No ${role} account found with that email`);
    }

    const valid = await comparePassword(password, account.password);
    if (!valid) {
      throw unauthorized('Incorrect password');
    }

    setAuthCookie(res, generateToken(account));
    return res.json({ success: true, role });
  });
}

const login_user = loginHandler(userModel, 'user');
const login_seller = loginHandler(ownerModel, 'seller');

/**
 * Clears the auth cookie.
 *
 * `res.cookie('token', '')` did not remove anything: without `maxAge: 0` and
 * matching attributes the browser keeps the original cookie, so users were never
 * actually logged out.
 */
const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);
  return res.json({ success: true });
});

/** Lets the client check session validity without hitting a protected route. */
const session = asyncHandler(async (req, res) => {
  const payload = verifyToken(req.cookies?.token);
  if (!payload) {
    return res.status(401).json({ success: false, role: null });
  }

  if (await userModel.exists({ _id: payload.id })) {
    return res.json({ success: true, role: 'user' });
  }
  if (await ownerModel.exists({ _id: payload.id })) {
    return res.json({ success: true, role: 'seller' });
  }
  return res.status(401).json({ success: false, role: null });
});

module.exports = {
  register_user,
  register_seller,
  login_user,
  login_seller,
  logout,
  session,
};