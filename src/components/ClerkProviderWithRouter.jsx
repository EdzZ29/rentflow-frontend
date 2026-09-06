import { ClerkProvider } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import {
  CLERK_PUBLISHABLE_KEY,
  clerkAppearance,
  SIGN_IN_URL,
  SIGN_UP_URL,
} from '../lib/clerk';

// ClerkProvider, wired into react-router.
//
// Clerk's flows are multi-step (password → 2FA → SSO callback → …) and it
// navigates between those steps itself. Handing it routerPush/routerReplace
// makes those transitions client-side; without them every step is a full page
// reload. Both callbacks must be supplied together — Clerk's types reject one
// without the other.
//
// Because it calls useNavigate, this component MUST render inside <BrowserRouter>.
export default function ClerkProviderWithRouter({ children }) {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      appearance={clerkAppearance}
      signInUrl={SIGN_IN_URL}
      signUpUrl={SIGN_UP_URL}
      // "Fallback" (not "force") so a user sent to sign-in from a deep link
      // returns there afterwards; these only apply when there's no return path.
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}
