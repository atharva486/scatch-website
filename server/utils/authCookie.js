/**
 * Central helper for the auth cookie.
 *
 * Historically the token was set with `res.cookie('token', token)` and no
 * options, which meant:
 *   - the cookie's default path was the login route (e.g. `/api/seller`),
 *     so the token was never sent to `/api/product/*` requests, and
 *   - `SameSite=Lax` + no `Secure` meant browsers dropped the cookie on the
 *     cross-site request from a Vercel frontend to a Render backend.
 *
 * Every cookie the app sets now goes through here so those options can never
 * drift apart again.
 */

const isProduction = process.env.NODE_ENV === 'production';

// When the frontend and backend live on different sites (Vercel -> Render) the
// browser treats requests as cross-site, so SameSite must be 'none' + Secure.
// In local dev both run on localhost and 'lax' is correct.
function sameSiteSetting() {
  const configured = process.env.COOKIE_SAMESITE;
  if (configured) {
    const value = String(configured).toLowerCase();
    return ['lax', 'strict', 'none'].includes(value) ? value : 'lax';
  }
  return isProduction ? 'none' : 'lax';
}

const BASE_COOKIE_OPTIONS = {
  httpOnly: true,
  path: '/',
  sameSite: sameSiteSetting(),
  secure: isProduction,
};

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    ...BASE_COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookie(res) {
  res.clearCookie('token', {
    ...BASE_COOKIE_OPTIONS,
    // clearCookie only removes the cookie if the attributes match.
    maxAge: undefined,
  });
}

module.exports = { setAuthCookie, clearAuthCookie, BASE_COOKIE_OPTIONS };