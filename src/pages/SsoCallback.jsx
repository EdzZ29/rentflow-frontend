import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import AuthLayout from '../components/AuthLayout';

// Where the provider drops the browser back off. Clerk's component reads the
// handshake out of the URL, activates the session, and — if this turned out to
// be a first-time login — transfers the attempt into a sign-up on its own.
// It then forwards to /oauth/callback, which swaps the Clerk session for ours.
export default function SsoCallback() {
  return (
    <AuthLayout>
      <div className="py-10 text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-accent" />
        <p className="text-sm text-slate-500">Completing sign-in…</p>
        <AuthenticateWithRedirectCallback
          signInFallbackRedirectUrl="/oauth/callback"
          signUpFallbackRedirectUrl="/oauth/callback"
          // If the provider handshake fails outright, Clerk lands the user back
          // on the login page with copy explaining what happened.
          continueSignUpUrl="/sign-up"
        />
      </div>
    </AuthLayout>
  );
}
