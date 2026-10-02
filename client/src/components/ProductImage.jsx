import { useState } from 'react';
import { imageUrl } from '../utils/image';

/**
 * Product image with a graceful fallback.
 *
 * `<img src={imageUrl(x)}>` rendered a broken-image icon whenever the stored
 * Cloudinary public id was missing or deleted, which looks like a broken app.
 * This swaps in a neutral placeholder on error.
 *
 * The key includes the src so switching products resets the failed state -
 * without it a failed URL would keep showing the placeholder forever.
 */
export default function ProductImage({ src, alt = '', className = '' }) {
  const [failed, setFailed] = useState(false);
  const url = imageUrl(src);

  return (
    <img
      key={url}
      src={url}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setFailed(true)}
      style={failed ? { objectFit: 'contain' } : undefined}
    />
  );
}
