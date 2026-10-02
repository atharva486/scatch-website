const mongoose = require('mongoose');

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
    address: {
      type: String,
      required: [true, 'Shipping address is required'],
      trim: true,
      maxlength: 500,
    },
    orderedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

orderSchema.index({ seller: 1, orderedAt: -1 });
orderSchema.index({ buyer: 1, orderedAt: -1 });

module.exports = mongoose.models.order || mongoose.model('order', orderSchema);