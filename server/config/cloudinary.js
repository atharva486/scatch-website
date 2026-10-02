const { v2: cloudinary } = require('cloudinary');

let configured = false;

// The original module configured Cloudinary at require-time, which captured
// undefined credentials whenever the module loaded before dotenv had run.
function configureCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) return false;

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
  return true;
}

const isConfigured = () => configured || configureCloudinary();

module.exports = { cloudinary, configureCloudinary, isConfigured };