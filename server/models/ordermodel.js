const mongoose = require('mongoose');
const { formatAddress } = require('../utils/address');

/**
 * The destination for one order.
 *
 * This is the authoritative validation for a shipping address: the checkout form
 * checks the same rules for immediate feedback, but this is what actually
 * rejects a bad address, because client-side validation is trivially bypassed.
 *
 * Postal codes are deliberately not pinned to one country's format. India uses a
 * 6-digit PIN, the US allows ZIP+4, and the UK and Canada use alphanumeric
 * codes, so the rule is "3-12 characters that start and end alphanumeric".
 */
const shippingSchema = new mongoose.Schema(
  {
    recipient: {
      type: String,
      required: [true, 'Recipient name is required'],
      trim: true,
      minlength: [2, 'Recipient name must be at least 2 characters'],
      maxlength: [100, 'Recipient name is too long'],
    },
    line1: {
      type: String,
      required: [true, 'Address line 1 is required'],
      trim: true,
      minlength: [4, 'Address line 1 must be at least 4 characters'],
      maxlength: [120, 'Address line 1 is too long'],
    },
    // Apartment, floor, company -- genuinely optional.
    line2: { type: String, trim: true, maxlength: [120, 'Address line 2 is too long'], default: '' },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      minlength: [2, 'City must be at least 2 characters'],
      maxlength: [60, 'City name is too long'],
    },
    state: {
      type: String,
      required: [true, 'State or region is required'],
      trim: true,
      minlength: [2, 'State or region must be at least 2 characters'],
      maxlength: [60, 'State or region name is too long'],
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true,
      minlength: [3, 'Postal code must be at least 3 characters'],
      maxlength: [12, 'Postal code is too long'],
      match: [
        /^[A-Za-z0-9][A-Za-z0-9 -]*[A-Za-z0-9]$/,
        'Postal code may only contain letters, digits, spaces and hyphens',
      ],
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      minlength: [2, 'Country must be at least 2 characters'],
      maxlength: [60, 'Country name is too long'],
    },
    // Optional, but a courier cannot call without it.
    phone: { type: String, trim: true, maxlength: [24, 'Phone number is too long'], default: '' },
  },
  { _id: false }
);

/**
 * A single purchase.
 *
 * Orders used to be embedded inside `user.orders`, which meant every seller
 * analytics page had to load every user in the database and then query each
 * product one at a time (an N+1 that made the dashboard time out). Orders are
 * now first-class documents, so analytics are a single indexed aggregation and
 * "my orders" is one populated query.
 */
const orderSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      required: true,
      index: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      index: true,
    },
    // Denormalised so revenue can be grouped per seller without a join.
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'owner',
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    // Price snapshot at purchase time, so later price edits do not rewrite history.
    buyPrice: { type: Number, required: true, min: 0 },
    /**
     * Structured delivery address. See `shippingSchema` above for the rules.
     *
     * Left optional so orders placed before this field existed still load;
     * those documents carry only the legacy `address` string below.
     */
    shipping: { type: shippingSchema, default: undefined },
    /**
     * One-line rendering of `shipping`, kept for anything still reading it.
     *
     * A pre-validate hook fills it in from `shipping`, so the two can never
     * drift. Orders written before the change have only this field.
     */
    address: { type: String, trim: true, maxlength: 500, default: '' },
    orderedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

// `address` is derived, never trusted from the request. Must be a `function`,
// not an arrow, so `this` is the document.
orderSchema.pre('validate', function deriveAddressFromShipping(next) {
  if (this.shipping && this.shipping.line1) {
    this.address = formatAddress(this.shipping);
  }
  next();
});

orderSchema.index({ seller: 1, orderedAt: -1 });
orderSchema.index({ buyer: 1, orderedAt: -1 });

module.exports = mongoose.models.order || mongoose.model('order', orderSchema);