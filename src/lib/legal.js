// The five legal documents, in the order they appear in the footer and the
// sidebar. The text itself lives on the API (GET /legal/:slug) so the website
// and the mobile app can't drift apart on what the policies say; only the
// navigation order is a client concern.
export const LEGAL_LINKS = [
  { slug: 'privacy-policy', label: 'Privacy Policy' },
  { slug: 'terms-and-conditions', label: 'Terms and Conditions' },
  { slug: 'cookie-policy', label: 'Cookie Policy' },
  { slug: 'refund-policy', label: 'Refund Policy' },
  { slug: 'form-consent', label: 'Form Consent' },
];
