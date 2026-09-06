import { useSignIn } from '@clerk/clerk-react';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import OAuthButtons from '../components/OAuthButtons';
import PasswordInput from '../components/PasswordInput';
import { homePathForRole, useAuth } from '../context/AuthContext';
import { clerkErrorMessage, isAlreadySignedIn } from '../lib/clerkErrors';

// Friendly copy for the ?error=… codes the OAuth callback can redirect with.
const OAUTH_ERRORS = {
  cancelled: 'Sign-in was cancelled. Please try again.',
  oauth_failed: "We couldn't sign you in with that provider. Please try again.",
  email_unverified:
    'Your provider account email is not verified. Verify it, or log in with email and password.',
  no_email:
    'That provider did not share an email address, which we need to sign you in.',
};

export default function Login() {
  const navigate = useNavigate();
  // Clerk checks the credentials; completeClerkSession then trades the
  // resulting Clerk session for the Rentivo one the dashboards run on.
  const { isLoaded, signIn, setActive } = useSignIn();
  const { completeClerkSession } = useAuth();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(OAUTH_ERRORS[params.get('error')] || '');
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const finish = async () => {
    const user = await completeClerkSession();
    navigate(homePathForRole(user.role));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError('');
    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: form.email.trim(),
        password: form.password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        await finish();
        return;
      }

      // Anything else means Clerk wants another factor (e.g. the user turned on
      // TOTP). Rather than rebuild every step here, hand off to Clerk's own
      // sign-in page, which already handles the full ladder.
      navigate('/sign-in');
    } catch (err) {
      // Already signed in with Clerk — e.g. navigated Back onto /login. There's
      // nothing to authenticate, so just pick the session up.
      if (isAlreadySignedIn(err)) {
        try {
          await finish();
          return;
        } catch {
          /* fall through to the message below */
        }
      }
      setError(clerkErrorMessage(err, 'Invalid email or password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="mt-2 text-slate-500">Log in to your Rentivo account.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </label>

          <label className="block">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <Link to="/forgot-password" className="text-xs font-medium text-accent hover:underline">
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="Your password"
              autoComplete="current-password"
              showChecklist={false}
            />
          </label>

          <button
            type="submit"
            disabled={loading || !isLoaded}
            className="w-full rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">or</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <OAuthButtons label="Sign in" onError={setError} />

        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
