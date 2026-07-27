// Accepts either a full /verify/<token> URL from a scanned QR or a bare token,
// and returns the 48-hex token. Anything else yields null, so a stray barcode
// or an arbitrary URL never reaches the API.
export function tokenFromScan(text) {
  const value = String(text || '').trim();
  const fromUrl = value.match(/\/verify\/([a-f0-9]{48})/i);
  const bare = value.match(/^([a-f0-9]{48})$/i);
  return (fromUrl?.[1] || bare?.[1] || '').toLowerCase() || null;
}
