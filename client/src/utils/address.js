/**
 * Shipping-address rules for the checkout form.
 *
 * These mirror the `shippingSchema` in `server/models/ordermodel.js`, which is
 * the authoritative validation -- the server re-checks every field regardless,
 * because client-side validation is trivially bypassed. The copy here exists so
 * a mistake is reported under the input that caused it, instead of the buyer
 * submitting and reading a toast.
 *
 * Keep the two in step when a rule changes.
 *
 * Postal codes are intentionally not tied to one country: India uses a 6-digit
 * PIN, the US allows ZIP+4, and the UK and Canada use alphanumeric codes.
 */
const POSTAL_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 -]*[A-Za-z0-9]$/;

/**
 * Field metadata, in the order they should be filled in.
 *
 * `autoComplete` uses the standard HTML autofill tokens. They are the reason
 * this form behaves like a real checkout: with them a buyer can pick a saved
 * address from their browser instead of retyping it. `name`/`address-line1`/
 * `address-level2`/`postal-code`/`country` are what Chrome, Safari and Firefox
 * look for.
 *
 * `span` is out of a 6-column grid: 6 = full row, 3 = half, 2 = third.
 */
export const ADDRESS_FIELDS = [
  {
    name: 'recipient',
    label: 'Full name',
    autoComplete: 'name',
    placeholder: 'Who is receiving this?',
    span: 6,
    required: true,
    min: 2,
    max: 100,
  },
  {
    name: 'line1',
    label: 'Address line 1',
    autoComplete: 'address-line1',
    placeholder: 'House number and street',
    span: 6,
    required: true,
    min: 4,
    max: 120,
  },
  {
    name: 'line2',
    label: 'Address line 2',
    autoComplete: 'address-line2',
    placeholder: 'Flat, floor, landmark (optional)',
    span: 6,
    required: false,
    max: 120,
  },
  {
    name: 'city',
    label: 'City',
    autoComplete: 'address-level2',
    placeholder: 'Mumbai',
    span: 2,
    required: true,
    min: 2,
    max: 60,
  },
  {
    name: 'state',
    label: 'State / region',
    autoComplete: 'address-level1',
    placeholder: 'Maharashtra',
    span: 2,
    required: true,
    min: 2,
    max: 60,
  },
  {
    name: 'postalCode',
    label: 'Postal code',
    autoComplete: 'postal-code',
    placeholder: '400001',
    span: 2,
    required: true,
    min: 3,
    max: 12,
    pattern: POSTAL_PATTERN,
    patternMessage: 'Use letters, digits, spaces and hyphens only',
    // PIN, ZIP and postcode are all written without spaces or punctuation.
    autoCapitalize: 'characters',
  },
  {
    name: 'country',
    label: 'Country',
    autoComplete: 'country',
    placeholder: 'India',
    span: 3,
    required: true,
    min: 2,
    max: 60,
  },
  {
    name: 'phone',
    label: 'Phone',
    autoComplete: 'tel',
    type: 'tel',
    placeholder: '+91 98765 43210',
    span: 3,
    required: false,
    max: 24,
    // Optional for the form, but if given it has to be dialable -- a courier
    // cannot call a two-digit number.
    minDigits: 7,
  },
];

/** A blank address, so state never holds a partial object. */
export const EMPTY_ADDRESS = Object.freeze(
  ADDRESS_FIELDS.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
);

/** Only the fields the server accepts, trimmed. */
export function normaliseAddress(address = {}) {
  return ADDRESS_FIELDS.reduce((acc, field) => {
    const raw = address[field.name];
    acc[field.name] = typeof raw === 'string' ? raw.trim() : '';
    return acc;
  }, {});
}

/**
 * Validates one field.
 *
 * @returns {string} the message to show, or '' when the value is acceptable.
 */
export function validateAddressField(field, rawValue) {
  const value = typeof rawValue === 'string' ? rawValue.trim() : '';

  if (!value) return field.required ? `${field.label} is required` : '';
  if (field.min && value.length < field.min) {
    return `${field.label} must be at least ${field.min} characters`;
  }
  if (field.max && value.length > field.max) {
    return `${field.label} must be ${field.max} characters or fewer`;
  }
  if (field.pattern && !field.pattern.test(value)) {
    return field.patternMessage || `${field.label} is not valid`;
  }
  if (field.minDigits) {
    const digits = value.replace(/\D/g, '');
    if (digits.length < field.minDigits || digits.length > 15) {
      return 'Enter a phone number with 7 to 15 digits';
    }
  }
  return '';
}

/** Validates every field, returning only the ones with a problem. */
export function validateAddress(address = {}) {
  return ADDRESS_FIELDS.reduce((errors, field) => {
    const message = validateAddressField(field, address[field.name]);
    if (message) errors[field.name] = message;
    return errors;
  }, {});
}

export const addressIsValid = (address = {}) => Object.keys(validateAddress(address)).length === 0;