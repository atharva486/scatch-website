const multer = require('multer');
const { cloudinary, isConfigured } = require('../config/cloudinary');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

let storage;

if (isConfigured()) {
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  storage = new CloudinaryStorage({
    cloudinary,
    params: { folder: 'scatch-images', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] },
  });
} else {
  // In development Cloudinary credentials are often absent. Falling back to
  // memory storage lets the seller add-products flow still be exercised
  // locally instead of failing at request time.
  storage = multer.memoryStorage();
}

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG or WEBP images are allowed'));
    }
    return cb(null, true);
  },
});

module.exports = upload;