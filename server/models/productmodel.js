const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productname: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters'],
      maxlength: 150,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000,
    },
    // Cloudinary `public_id` (or a legacy filename). The CDN URL is built on
    // the client from this value.
    image: {
      type: String,
      required: [true, 'Product image is required'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'owner',
      required: true,
      index: true,
    },
    /**
     * Units currently available to sell.
     *
     * Previously this stored the lifetime total and sold units were kept in a
     * separate `customer[]` array, so "stock left" was computed by summing that
     * array everywhere and the two could drift apart. Stock is now decremented
     * atomically when an order is placed, so this value is always authoritative.
     */
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
  },
  { timestamps: true }
);

// Backs the storefront query "products that are actually buyable".
productSchema.index({ seller: 1, stock: 1 });
productSchema.index({ productname: 'text', description: 'text' });

module.exports = mongoose.models.product || mongoose.model('product', productSchema);