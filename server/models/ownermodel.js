const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [3, 'Full name must be at least 3 characters'],
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    gstin: {
      type: String,
      required: [true, 'GSTIN is required'],
      trim: true,
      uppercase: true,
      match: [
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/,
        'GSTIN must be a valid 15-character GSTIN (e.g. 27ABCDE1234F1Z5)',
      ],
    },
  },
  { timestamps: true }
);

ownerSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.models.owner || mongoose.model('owner', ownerSchema);