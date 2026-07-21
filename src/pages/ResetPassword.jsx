import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import PasswordInput, { passwordIsValid } from '../components/PasswordInput';
import { api } from '../lib/api';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!passwordIsValid(password)) {
      setError('Your password does not meet all the requirements below.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'This reset link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Invalid link</h1>
          <p className="mt-3 text-slate-600">
            This password reset link is missing or invalid.
          </p>
          <Link to="/forgot-password" className="mt-6 inline-block text-sm font-semibold text-accent hover:underline">
            Request a new link →
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Set a new password
        </h1>

        {done ? (
          <p className="mt-3 text-slate-600">
            Your password has been updated. Redirecting you to log in…
          </p>
        ) : (
          <>
            <p className="mt-2 text-slate-500">Choose a strong password for your account.</p>

            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              )}
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">New password</span>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password</span>
                <PasswordInput
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter your password"
                  showChecklist={false}
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
              >
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
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
