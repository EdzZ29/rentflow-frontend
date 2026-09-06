// Image upload limits. Must stay in sync with the multer configs on the API
// (businesses, products, avatars and reservation documents all cap at 5 MB) —
// checking here too means the user gets a clear message instantly instead of a
// failed request after uploading the whole file.
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = '5 MB';

export const ACCEPTED_IMAGE_TYPES = /^image\/(jpe?g|png|webp)$/;

export function formatBytes(bytes) {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// Returns an error message for a rejected file, or '' when it's acceptable.
export function validateImageFile(file) {
  if (!file) return '';
  if (!ACCEPTED_IMAGE_TYPES.test(file.type)) {
    return 'That file is not an image. Use a JPG, PNG or WebP.';
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    const size = formatBytes(file.size);
    // A file barely over the cap rounds to "5.0 MB", which reads as though it
    // should have been allowed — say "just over" instead.
    return size === MAX_UPLOAD_LABEL || size === '5.0 MB'
      ? `That image is just over the ${MAX_UPLOAD_LABEL} limit. Please pick a smaller photo.`
      : `That image is ${size} — the limit is ${MAX_UPLOAD_LABEL}. Please pick a smaller photo.`;
  }
  return '';
}
