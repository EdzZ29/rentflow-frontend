import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
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
import ForgotPassword from './pages/ForgotPassword';
import Landing from './pages/Landing';
import Login from './pages/Login';
import OAuthCallback from './pages/OAuthCallback';
import ResetPassword from './pages/ResetPassword';
import BrowseRentals from './pages/rentals/BrowseRentals';
import ProductDetail from './pages/rentals/ProductDetail';
import RentalDetail from './pages/rentals/RentalDetail';
import OwnerActivity from './pages/owner/OwnerActivity';
import OwnerBookingHistory from './pages/owner/OwnerBookingHistory';
import OwnerBusinesses from './pages/owner/OwnerBusinesses';
import OwnerCustomBooking from './pages/owner/OwnerCustomBooking';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerManageBookings from './pages/owner/OwnerManageBookings';
import OwnerOverview from './pages/owner/OwnerOverview';
import OwnerProducts from './pages/owner/OwnerProducts';
import OwnerReports from './pages/owner/OwnerReports';
import OwnerReservationsList from './pages/owner/OwnerReservationsList';
import OwnerSubscription from './pages/owner/OwnerSubscription';
import Signup from './pages/Signup';

function App() {
  return (
    <AuthProvider>
      <RealtimeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route path="/rentals" element={<BrowseRentals />} />
          <Route path="/rentals/business/:id" element={<RentalDetail />} />
          <Route path="/rentals/product/:id" element={<ProductDetail />} />

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
            <Route path="activity" element={<OwnerActivity />} />
            <Route path="subscription" element={<OwnerSubscription />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </RealtimeProvider>
    </AuthProvider>
  );
}

export default App;
