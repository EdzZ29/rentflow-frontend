import { useSignIn } from '@clerk/clerk-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import PasswordInput, { passwordIsValid } from '../components/PasswordInput';
import { homePathForRole, useAuth } from '../context/AuthContext';
import { clerkErrorMessage } from '../lib/clerkErrors';

// Password reset, via Clerk.
//
// Clerk owns the password now, so this replaces the old emailed-link flow with
// Clerk's emailed *code*. Both halves live on one page because the code is
// typed in rather than clicked — there's no separate landing URL to return to.
// Completing a reset also signs the user in, so we finish by picking up the
// Rentivo session the same way the login page does.
export default function ForgotPassword() {
  const navigate = useNavigate();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { completeClerkSession } = useAuth();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const requestCode = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email.trim(),
      });
      setSent(true);
    } catch (err) {
      // Deliberately don't distinguish "no such account" — surfacing that would
      // turn this form into an account-enumeration oracle, which the previous
      // backend flow was careful to avoid. An unknown address simply gets a
      // code screen where no code will ever work.
      const unknown = (err?.errors ?? []).some(
        (x) => x.code === 'form_identifier_not_found',
      );
      if (unknown) setSent(true);
      else setError(clerkErrorMessage(err, 'Something went wrong. Please try again in a moment.'));
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    if (!passwordIsValid(password)) {
      setError('Your new password does not meet all the requirements below.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: code.trim(),
        password,
      });

      if (result.status !== 'complete') {
        // A second factor is outstanding; Clerk's own page handles that ladder.
        navigate('/sign-in');
        return;
      }

      await setActive({ session: result.createdSessionId });
      const user = await completeClerkSession();
      navigate(homePathForRole(user.role), { replace: true });
    } catch (err) {
      setError(clerkErrorMessage(err, 'That code is incorrect or has expired.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {sent ? 'Choose a new password' : 'Forgot your password?'}
        </h1>

        {sent ? (
          <>
            <p className="mt-3 text-slate-600">
              If an account exists for{' '}
              <span className="font-medium text-slate-900">{email}</span>, we&apos;ve
              sent it a 6-digit code. Enter it below with your new password.
            </p>

            <form onSubmit={submitReset} className="mt-8 space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              )}

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Verification code
                </span>
                <input
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  placeholder="123456"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-center text-lg tracking-[0.4em] text-slate-900 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  New password
                </span>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </label>

              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="w-full rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
              >
                {loading ? 'Updating…' : 'Reset password'}
              </button>
            </form>

            <p className="mt-4 text-sm text-slate-500">
              Didn&apos;t get it? Check your spam folder, or{' '}
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setError('');
                  setCode('');
                }}
                className="font-semibold text-accent hover:underline"
              >
                try again
              </button>
              .
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block text-sm font-semibold text-accent hover:underline"
            >
              ← Back to login
            </Link>
          </>
        ) : (
          <>
            <p className="mt-2 text-slate-500">
              Enter your email and we&apos;ll send you a code to reset it.
            </p>

            <form onSubmit={requestCode} className="mt-8 space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              )}
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>
              <button
                type="submit"
                disabled={loading || !isLoaded}
                className="w-full rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send reset code'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Remembered it?{' '}
              <Link to="/login" className="font-semibold text-accent hover:underline">
                Back to login
              </Link>
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
