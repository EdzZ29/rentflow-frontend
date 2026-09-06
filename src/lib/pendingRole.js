// Social sign-up bounces through the provider and back, which throws away
// React state — so the "renter or business owner?" choice has to survive the
// round trip. sessionStorage is scoped to the tab and cleared on close.
//
// This is only a hint for a brand-new account: the API applies it when creating
// a user and ignores it for one that already exists, so tampering with it can't
// change the role of an existing account.
const KEY = 'rentivo.pendingRole';

export function setPendingRole(role) {
  try {
    if (role) sessionStorage.setItem(KEY, role);
    else sessionStorage.removeItem(KEY);
  } catch {
    /* private mode / storage disabled — fall back to the default role */
  }
}

// Read once and clear, so a stale choice can't leak into a later sign-in.
export function takePendingRole() {
  try {
    const role = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return role === 'owner' || role === 'customer' ? role : undefined;
  } catch {
    return undefined;
  }
}
