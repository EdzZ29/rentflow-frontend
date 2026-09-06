import { useClerk, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

// Two systems, one signed-in user:
//
//   Clerk    owns credentials — password, Google/Facebook, email verification.
//   Rentivo  owns authorization — role, plan, isActive, avatarUrl.
//
// `user` here is always the Rentivo record (that's what the dashboards read),
// obtained by exchanging a verified Clerk session for our own httpOnly cookie
// via POST /auth/clerk. Clerk's own user object is deliberately not exposed:
// nothing downstream should have to care which provider vouched for the login.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clerk = useClerk();
  const { isLoaded: clerkLoaded, isSignedIn: clerkSignedIn } = useClerkAuth();

  // Email + password against our own API. Rentivo accounts — the seeded admin,
  // owners created in the dashboard, anyone registered through /auth/register —
  // live in our database and have no Clerk identity, so Clerk can't sign them
  // in. This is the path that works for them.
  const login = useCallback(async (email, password) => {
    const res = await api.login({ email: email.trim(), password });
    setUser(res.user);
    return res.user;
  }, []);

  // Hand the current Clerk session to the API and adopt the Rentivo user it
  // returns. `role` is only honoured for accounts that don't exist yet.
  const completeClerkSession = useCallback(
    async (role) => {
      const token = await clerk.session?.getToken();
      if (!token) throw new Error('No active Clerk session.');
      const res = await api.clerkSession(token, role);
      setUser(res.user);
      return res.user;
    },
    [clerk],
  );

  // Restore the session on load. Normally the Rentivo cookie is still valid and
  // /me answers directly. If it has expired but Clerk still considers us signed
  // in, silently re-exchange rather than bouncing a signed-in user to /login.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let me = null;
      try {
        me = await api.me();
      } catch {
        // No valid Rentivo cookie. Clerk might still vouch for this browser,
        // but we can't ask until it has loaded — bail out and let the effect
        // re-run when it does. Checking the cookie first means a password login
        // restores even if Clerk is slow, blocked, or misconfigured.
        if (!clerkLoaded) return;
        if (clerkSignedIn) {
          try {
            me = (await api.clerkSession(await clerk.session.getToken())).user;
          } catch {
            me = null;
          }
        }
      }
      if (!cancelled) {
        setUser(me);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clerkLoaded, clerkSignedIn, clerk]);

  const logout = useCallback(async () => {
    // Clear the Rentivo cookie AND the Clerk session. Skipping the second one
    // would let the effect above sign the user straight back in.
    try {
      await api.logout();
    } catch {
      /* clear local state regardless */
    }
    try {
      await clerk.signOut();
    } catch {
      /* already signed out */
    }
    setUser(null);
  }, [clerk]);

  // Refresh the cached user from the API (after a profile edit, etc.).
  const refreshUser = useCallback(async () => {
    const me = await api.me();
    setUser(me);
    return me;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        completeClerkSession,
        logout,
        setUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

// Where each role lands after authenticating.
// eslint-disable-next-line react-refresh/only-export-components
export function homePathForRole(role) {
  if (role === 'admin') return '/admin';
  if (role === 'owner') return '/owner';
  if (role === 'customer') return '/customer';
  return '/';
}
