import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { api } from '../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.forgotPassword(email.trim());
      // The API always responds the same way (it never reveals whether the
      // email exists), so we always show the confirmation screen.
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Forgot your password?
        </h1>

        {sent ? (
          <>
            <p className="mt-3 text-slate-600">
              If an account exists for <span className="font-medium text-slate-900">{email}</span>,
              we&apos;ve sent a link to reset your password. It expires in 1 hour.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Didn&apos;t get it? Check your spam folder, or{' '}
              <button
                type="button"
                onClick={() => setSent(false)}
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
              Enter your email and we&apos;ll send you a link to reset it.
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-4">
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
                disabled={loading}
                className="w-full rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send reset link'}
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
