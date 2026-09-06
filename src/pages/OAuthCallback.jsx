import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { homePathForRole, useAuth } from '../context/AuthContext';
import { takePendingRole } from '../lib/pendingRole';

// Landing route after a successful social login. Clerk has already established
// its own session by this point (see SsoCallback); the remaining job is to
// trade it for a Rentivo session and send the user to their dashboard.
export default function OAuthCallback() {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const { completeClerkSession } = useAuth();
  const navigate = useNavigate();
  // StrictMode double-invokes effects in dev; the exchange must not run twice.
  const started = useRef(false);

  useEffect(() => {
    if (!isLoaded || started.current) return;
    started.current = true;

    if (!isSignedIn) {
      navigate('/login?error=oauth_failed', { replace: true });
      return;
    }

    (async () => {
      try {
        // Only applies if this social login just created the account.
        const user = await completeClerkSession(takePendingRole());
        navigate(homePathForRole(user.role), { replace: true });
      } catch {
        navigate('/login?error=oauth_failed', { replace: true });
      }
    })();
  }, [isLoaded, isSignedIn, completeClerkSession, navigate]);

  return (
    <AuthLayout>
      <div className="py-10 text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-accent" />
        <p className="text-sm text-slate-500">Signing you in…</p>
      </div>
    </AuthLayout>
  );
}
