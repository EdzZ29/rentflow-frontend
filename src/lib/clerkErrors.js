// Clerk rejects things in its own error shape:
//   { errors: [{ code, message, longMessage, meta: { paramName } }] }
// These helpers turn that into the plain strings and { field: message } maps
// the existing auth forms already render.

// Field names Clerk uses vs. the ones our forms use.
const FIELD_ALIASES = {
  email_address: 'email',
  identifier: 'email',
  password: 'password',
  first_name: 'fullName',
  last_name: 'fullName',
  code: 'code',
};

// Clerk's `longMessage` is the user-facing sentence ("Password has been found
// in an online data breach…"); `message` is the terse version.
export function clerkErrorMessage(err, fallback = 'Something went wrong.') {
  const first = err?.errors?.[0];
  return first?.longMessage || first?.message || err?.message || fallback;
}

// Split Clerk's errors into per-field messages, so they land under the right
// input instead of all piling into one banner.
export function clerkFieldErrors(err) {
  const out = {};
  for (const e of err?.errors ?? []) {
    const field = FIELD_ALIASES[e?.meta?.paramName];
    if (field && !out[field]) out[field] = e.longMessage || e.message;
  }
  return out;
}

// True when Clerk refuses because this identity already has an account.
export function isAlreadyTaken(err) {
  return (err?.errors ?? []).some((e) => e.code === 'form_identifier_exists');
}

// Clerk throws this when signIn.create() runs while a session is already
// active — e.g. the user hit Back onto /login after signing in.
export function isAlreadySignedIn(err) {
  return (err?.errors ?? []).some((e) => e.code === 'session_exists');
}

// Clerk doesn't recognise this identifier at all ("Identifier is invalid").
// On its own that's not worth surfacing: the account may simply live in the
// Rentivo database rather than in Clerk, so callers that already tried our own
// API collapse this into their generic "invalid email or password" message.
export function isUnknownIdentifier(err) {
  return (err?.errors ?? []).some(
    (e) =>
      e.code === 'form_identifier_not_found' ||
      e?.meta?.paramName === 'identifier',
  );
}
