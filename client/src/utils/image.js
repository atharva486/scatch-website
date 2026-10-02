const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dunxugggm';

const PLACEHOLDER =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
       <rect width="100%" height="100%" fill="#e5e7eb"/>
       <text x="50%" y="50%" text-anchor="middle" font-family="sans-serif"
             font-size="16" fill="#6b7280">No image</text>
     </svg>`
  );

/**
 * Builds a Cloudinary delivery URL from a stored image id.
 *
 * The Cloud name used to be hardcoded in five components, so pointing the app
 * at a different account required editing source everywhere. It now comes from
 * VITE_CLOUDINARY_CLOUD_NAME.
 *
 * Passing a value that is already a full URL returns it unchanged, which keeps
 * any legacy absolute paths working.
 */
export function imageUrl(image) {
  if (!image) return PLACEHOLDER;
  if (/^https?:\/\//i.test(image)) return image;

  // Strip any transform/upload prefix so a stored path like
  // "image/upload/v123/abc" still resolves.
  const cleaned = image.replace(/^image\/upload\/(v\d+\/)?/, '');

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${cleaned}`;
}

export default imageUrl;