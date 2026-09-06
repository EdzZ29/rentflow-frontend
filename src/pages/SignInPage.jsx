import { SignIn } from '@clerk/clerk-react';
import AuthLayout from '../components/AuthLayout';
import { SIGN_IN_URL, SIGN_UP_URL } from '../lib/clerk';

// Clerk's prebuilt sign-in widget, dropped into the app's two-column auth
// shell. Named …Page rather than SignIn.jsx to avoid colliding with the
// existing Signup.jsx on case-insensitive filesystems.
//
// routing="path" means Clerk owns every /sign-in/* sub-path (second factor,
// SSO callback, reset password), so App.jsx registers this as "/sign-in/*".
export default function SignInPage() {
  return (
    <AuthLayout>
      <SignIn routing="path" path={SIGN_IN_URL} signUpUrl={SIGN_UP_URL} />
    </AuthLayout>
  );
}
