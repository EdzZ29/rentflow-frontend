import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { homePathForRole, useAuth } from '../context/AuthContext';

// Landing route the backend redirects to after a successful social login. The
// session cookie is already set; AuthProvider fetches /me on load, then we
// route the user to their role's dashboard.
export default function OAuthCallback() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (user) {
      navigate(homePathForRole(user.role), { replace: true });
    } else {
      navigate('/login?error=oauth_failed', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <AuthLayout>
      <div className="py-10 text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-accent" />
        <p className="text-sm text-slate-500">Signing you in…</p>
      </div>
    </AuthLayout>
  );
}
