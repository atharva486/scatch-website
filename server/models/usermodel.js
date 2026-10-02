const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    // Always a bcrypt hash; never returned by any API response.
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    wishlist: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    contact: {
      type: Number,
      min: 0,
    },
    picture: String,
  },
  { timestamps: true }
);

// Unique index makes the "email already used" check race-safe.
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.models.user || mongoose.model('user', userSchema);