import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Menu from './components/Menu';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import Footer from './components/Footer';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsConditions from './components/TermsConditions';
import RefundCancellationPolicy from './components/RefundCancellationPolicy';
import Sidebar from './components/admin/Sidebar';
import Dashboard from './components/admin/Dashboard';
import UserManagement from './components/admin/UserManagement';
import RestaurantManagement from './components/admin/RestaurantManagement';
import OrderManagement from './components/admin/OrderManagement';
import Login from './components/admin/Login';
import Analytics from './components/admin/Analytics';
import DeliveryStaffManagement from './components/admin/DeliveryStaffManagement';
import RestaurantOnboarding from './components/admin/RestaurantOnboarding';
import CouponManagement from './components/admin/CouponManagement';
import SupportManagement from './components/admin/SupportManagement';
import NotificationManagement from './components/admin/NotificationManagement';
import VillageManagement from './components/admin/VillageManagement';
import DailyOrder from './components/admin/DailyOrder';
import AdminEarnings from './components/admin/AdminEarnings';
import { AdminSessionProvider, useAdminSession } from './components/admin/AdminSessionContext';

const AdminUsers = UserManagement;
const AdminRestaurants = RestaurantManagement;
const AdminOrders = OrderManagement;

function ProtectedAdminLayout() {
  const { isLoggedIn } = useAdminSession();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoggedIn) navigate('/admin/login');
  }, [isLoggedIn, navigate]);
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  return (
    <AdminSessionProvider>
      <div className="min-h-screen bg-orange-50">
        <Routes>
          <Route path="/admin/login" element={<Login />} />
          <Route path="/" element={
            <>
              <Navbar />
              <Hero />
              <About />
              <Menu />
              <Gallery />
              <Contact />
              <Footer />
            </>
          } />
          <Route path="/privacy-policy" element={<><Navbar /><PrivacyPolicy /><Footer /></>} />
          <Route path="/terms-conditions" element={<><Navbar /><TermsConditions /><Footer /></>} />
          <Route path="/refund-cancellation" element={<><Navbar /><RefundCancellationPolicy /><Footer /></>} />
          {/* Admin Panel Nested Routes */}
          <Route path="/admin" element={<div className="admin-bg"><ProtectedAdminLayout /></div>}>
            <Route index element={<Dashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="daily-order" element={<DailyOrder />} />
            <Route path="delivery-staff" element={<DeliveryStaffManagement />} />
            <Route path="onboarding" element={<RestaurantOnboarding />} />
            <Route path="coupons" element={<CouponManagement />} />
            <Route path="support" element={<SupportManagement />} />
            <Route path="notifications" element={<NotificationManagement />} />
            <Route path="villages" element={<VillageManagement />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="restaurants" element={<AdminRestaurants />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="earnings" element={<AdminEarnings />} />
          </Route>
        </Routes>
      </div>
    </AdminSessionProvider>
  );
}

export default App;