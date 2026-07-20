import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AdminBookings from './pages/admin/AdminBookings';
import AdminClients from './pages/admin/AdminClients';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOverview from './pages/admin/AdminOverview';
import AdminOwners from './pages/admin/AdminOwners';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import CustomerBookings from './pages/customer/CustomerBookings';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerOverview from './pages/customer/CustomerOverview';
import Landing from './pages/Landing';
import Login from './pages/Login';
import BrowseRentals from './pages/rentals/BrowseRentals';
import ProductDetail from './pages/rentals/ProductDetail';
import RentalDetail from './pages/rentals/RentalDetail';
import OwnerBusinesses from './pages/owner/OwnerBusinesses';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerOverview from './pages/owner/OwnerOverview';
import OwnerProducts from './pages/owner/OwnerProducts';
import OwnerReports from './pages/owner/OwnerReports';
import OwnerReservations from './pages/owner/OwnerReservations';
import OwnerSubscription from './pages/owner/OwnerSubscription';
import Signup from './pages/Signup';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
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
            <Route path="reservations" element={<OwnerReservations />} />
            <Route path="reports" element={<OwnerReports />} />
            <Route path="subscription" element={<OwnerSubscription />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
