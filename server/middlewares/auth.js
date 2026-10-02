const userModel = require('../models/usermodel');
const ownerModel = require('../models/ownermodel');
const { verifyToken } = require('../utils/generateToken');

/**
 * Resolves the request's JWT into `req.auth` ({ id, email }).
 * Returns null when there is no valid token. Never throws.
 */
function readAuth(req) {
  const token = req.cookies?.token;
  const payload = verifyToken(token);
  if (!payload || !payload.id) return null;
  return { id: payload.id, email: payload.email };
}

/**
 * Requires a logged-in customer.
 *
 * The previous version set `req.access = false` and then called `next()` anyway,
 * so no controller ever checked it and every "protected" route was public. It
 * also called `jwt.verify` outside a try/catch, so a request with no cookie
 * rejected the middleware promise and surfaced as a 500.
 */
async function requireUser(req, res, next) {
  const auth = readAuth(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const user = await userModel.findById(auth.id).select('_id email fullname');
  if (!user) {
    return res.status(401).json({ success: false, error: 'Session is no longer valid' });
  }

  req.auth = auth;
  req.user = user;
  return next();
}

/** Requires a logged-in seller. See requireUser for why this now actually blocks. */
async function requireSeller(req, res, next) {
  const auth = readAuth(req);
  if (!auth) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const seller = await ownerModel.findById(auth.id).select('_id email fullname gstin');
  if (!seller) {
    return res.status(401).json({ success: false, error: 'Session is no longer valid' });
  }

  req.auth = auth;
  req.seller = seller;
  return next();
}

/**
 * Blocks a seller from acting as a customer (and vice versa) so the two session
 * types cannot be confused for one another.
 */
function requireUserOnly(req, res, next) {
  const auth = readAuth(req);
  if (auth) {
    return ownerModel.exists({ _id: auth.id }).then((isSeller) => {
      if (isSeller) {
        return res.status(403).json({ success: false, error: 'Seller account cannot use this endpoint' });
      }
      return next();
    });
  }
  return next();
}

/** Attaches `req.auth` when a valid token exists, but never rejects. */
function optionalAuth(req, _res, next) {
  req.auth = readAuth(req);
  next();
}

module.exports = { requireUser, requireSeller, requireUserOnly, optionalAuth, readAuth };