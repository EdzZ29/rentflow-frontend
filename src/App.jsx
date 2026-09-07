import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ClerkProviderWithRouter from './components/ClerkProviderWithRouter';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { RealtimeProvider } from './context/RealtimeContext';
import AdminBookings from './pages/admin/AdminBookings';
import AdminClients from './pages/admin/AdminClients';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOverview from './pages/admin/AdminOverview';
import AdminOwners from './pages/admin/AdminOwners';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import CustomerBookings from './pages/customer/CustomerBookings';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerOverview from './pages/customer/CustomerOverview';
import CustomerReviews from './pages/customer/CustomerReviews';
import SupportView from './pages/support/SupportView';
import AboutPage from './pages/AboutPage';
import LegalPage from './pages/LegalPage';
import ForgotPassword from './pages/ForgotPassword';
import Landing from './pages/Landing';
import Login from './pages/Login';
import PricingPage from './pages/PricingPage';
import ServicesPage from './pages/ServicesPage';
import Settings from './pages/Settings';
import VerifyBooking from './pages/VerifyBooking';
import OAuthCallback from './pages/OAuthCallback';
import SsoCallback from './pages/SsoCallback';
import ResetPassword from './pages/ResetPassword';
import BrowseRentals from './pages/rentals/BrowseRentals';
import ProductDetail from './pages/rentals/ProductDetail';
import PackageDetail from './pages/rentals/PackageDetail';
import RentalDetail from './pages/rentals/RentalDetail';
import OwnerActivity from './pages/owner/OwnerActivity';
import OwnerBookingHistory from './pages/owner/OwnerBookingHistory';
import OwnerBusinesses from './pages/owner/OwnerBusinesses';
import OwnerCustomBooking from './pages/owner/OwnerCustomBooking';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerManageBookings from './pages/owner/OwnerManageBookings';
import OwnerOverview from './pages/owner/OwnerOverview';
import OwnerProducts from './pages/owner/OwnerProducts';
import OwnerProfile from './pages/owner/OwnerProfile';
import OwnerReports from './pages/owner/OwnerReports';
import OwnerReservationsList from './pages/owner/OwnerReservationsList';
import OwnerReviews from './pages/owner/OwnerReviews';
import OwnerSubscription from './pages/owner/OwnerSubscription';
import Signup from './pages/Signup';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    // BrowserRouter is outermost so ClerkProviderWithRouter can call
    // useNavigate — Clerk drives its own multi-step flows through the router.
    // The other providers don't use router hooks, so the order is otherwise
    // unchanged.
    <BrowserRouter>
      <ClerkProviderWithRouter>
    <LanguageProvider>
    <AuthProvider>
      <RealtimeProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<AboutPage />} />
          {/* Legal documents. Also reachable at their bare slugs so older
              links and printed material keep working. */}
          <Route path="/legal/:slug" element={<LegalPage />} />
          <Route path="/legal" element={<Navigate to="/legal/privacy-policy" replace />} />
          <Route path="/privacy-policy" element={<Navigate to="/legal/privacy-policy" replace />} />
          <Route path="/terms-and-conditions" element={<Navigate to="/legal/terms-and-conditions" replace />} />
          <Route path="/cookie-policy" element={<Navigate to="/legal/cookie-policy" replace />} />
          <Route path="/refund-policy" element={<Navigate to="/legal/refund-policy" replace />} />
          <Route path="/form-consent" element={<Navigate to="/legal/form-consent" replace />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          {/* Clerk-hosted auth. Catch-alls: Clerk routes its own sub-steps
              (second factor, SSO callback, reset password) under these paths. */}
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Where the social provider returns to; Clerk finishes the
              handshake here, then forwards to /oauth/callback. */}
          <Route path="/sso-callback" element={<SsoCallback />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          {/* Opened by scanning a booking QR code. */}
          <Route path="/verify/:token" element={<VerifyBooking />} />
          <Route path="/rentals" element={<BrowseRentals />} />
          <Route path="/rentals/business/:id" element={<RentalDetail />} />
          <Route path="/rentals/product/:id" element={<ProductDetail />} />
          <Route path="/rentals/package/:id" element={<PackageDetail />} />

          {/* Customer */}
          <Route
            path="/customer"
            element={
              <ProtectedRoute roles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<CustomerOverview />} />
            <Route path="bookings" element={<CustomerBookings />} />
            <Route path="reviews" element={<CustomerReviews />} />
            <Route path="support" element={<SupportView />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="owners" element={<AdminOwners />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="support" element={<SupportView admin />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Owner */}
          <Route
            path="/owner"
            element={
              <ProtectedRoute roles={['owner']}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<OwnerOverview />} />
            <Route path="businesses" element={<OwnerBusinesses />} />
            <Route path="businesses/:businessId/products" element={<OwnerProducts />} />
            <Route path="bookings" element={<OwnerManageBookings />} />
            <Route path="bookings/custom" element={<OwnerCustomBooking />} />
            <Route path="bookings/history" element={<OwnerBookingHistory />} />
            <Route path="bookings/reservations" element={<OwnerReservationsList />} />
            <Route path="reports" element={<OwnerReports />} />
            <Route path="reviews" element={<OwnerReviews />} />
            <Route path="activity" element={<OwnerActivity />} />
            <Route path="subscription" element={<OwnerSubscription />} />
            <Route path="support" element={<SupportView />} />
            <Route path="profile" element={<OwnerProfile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        <SpeedInsights />
        <Analytics />
      </RealtimeProvider>
    </AuthProvider>
    </LanguageProvider>
      </ClerkProviderWithRouter>
    </BrowserRouter>
  );
}

export default App;
