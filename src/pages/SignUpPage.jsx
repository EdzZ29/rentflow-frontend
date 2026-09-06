import { SignUp } from '@clerk/clerk-react';
import AuthLayout from '../components/AuthLayout';
import { SIGN_IN_URL, SIGN_UP_URL } from '../lib/clerk';

// Clerk's prebuilt sign-up widget. See SignInPage for why the route is a
// catch-all and why the file carries the …Page suffix.
export default function SignUpPage() {
  return (
    <AuthLayout>
      <SignUp routing="path" path={SIGN_UP_URL} signInUrl={SIGN_IN_URL} />
    </AuthLayout>
  );
}
