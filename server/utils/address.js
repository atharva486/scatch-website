/**
 * Shipping-address normalisation and formatting.
 *
 * An order used to store one free-text `address` string. That gave the checkout
 * a single textarea that could only ever be validated as "is it empty", and
 * because a `<textarea>` carries no address `autocomplete` token, browsers
 * could not fill it in either -- the buyer retyped their whole address on every
 * single order.
 *
 * New orders carry a structured `shipping` subdocument instead. The authoritative
 * field rules live on that schema in `models/ordermodel.js`; this module only
 * tidies request input and renders the parts back into one line.
 */

/** Coerces a value to a trimmed string; non-strings (including objects) become ''. */
const str = (value) => (typeof value === 'string' ? value.trim() : '');

/**
 * Reduces arbitrary request input to the shipping fields, trimmed.
 *
 * Unknown keys are dropped on purpose: without this, a client could push extra
 * fields into the subdocument and have Mongoose persist them. Blank optional
 * fields become '' rather than undefined so the stored document is predictable.
 */
function cleanShipping(input) {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};

  return {
    recipient: str(source.recipient),
    line1: str(source.line1),
    line2: str(source.line2),
    city: str(source.city),
    state: str(source.state),
    postalCode: str(source.postalCode),
    country: str(source.country),
    phone: str(source.phone),
  };
}

/**
 * True when the request carried a structured address worth validating.
 *
 * `{}` counts: an address form submitted empty should produce the specific
 * "Address line 1 is required" style messages from the schema rather than the
 * vaguer top-level error.
 */
const hasShipping = (input) => Boolean(input) && typeof input === 'object' && !Array.isArray(input);

/**
 * Renders the parts as a single line in postal order.
 *
 * `order.address` is kept populated from this so anything still reading it, and
 * any order placed before this change, keeps working. Also tolerates being
 * handed a plain string, in which case it just returns that string.
 */
function formatAddress(shipping) {
  if (!shipping || typeof shipping !== 'object') return str(shipping);

  const locality = [str(shipping.city), str(shipping.state), str(shipping.postalCode)]
    .filter(Boolean)
    .join(' ');

  return [str(shipping.line1), str(shipping.line2), locality, str(shipping.country)]
    .filter(Boolean)
    .join(', ');
}

module.exports = { cleanShipping, formatAddress, hasShipping };