import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminSession } from './AdminSessionContext';
import { FaTachometerAlt, FaUsers, FaStore, FaClipboardList, FaSignOutAlt, FaChartBar, FaTruck, FaClipboardCheck, FaGift, FaHeadset, FaBell, FaMapMarkerAlt } from 'react-icons/fa';

const links = [
  { to: '/admin', label: 'Dashboard', icon: <FaTachometerAlt /> },
  { to: '/admin/analytics', label: 'Analytics', icon: <FaChartBar /> },
  { to: '/admin/daily-order', label: 'Daily Order', icon: <FaClipboardList /> },
  { to: '/admin/delivery-staff', label: 'Delivery Staff', icon: <FaTruck /> },
  { to: '/admin/onboarding', label: 'Onboarding', icon: <FaClipboardCheck /> },
  { to: '/admin/coupons', label: 'Coupons', icon: <FaGift /> },
  { to: '/admin/support', label: 'Support', icon: <FaHeadset /> },
  { to: '/admin/notifications', label: 'Notifications', icon: <FaBell /> },
  { to: '/admin/villages', label: 'Villages', icon: <FaMapMarkerAlt /> },
  { to: '/admin/users', label: 'User Management', icon: <FaUsers /> },
  { to: '/admin/restaurants', label: 'Restaurant Management', icon: <FaStore /> },
  { to: '/admin/orders', label: 'Order Management', icon: <FaClipboardList /> },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, adminName, logout } = useAdminSession();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <>
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between bg-white shadow p-4 sticky top-0 z-40">
        <div className="flex items-center gap-2 font-bold text-lg text-black">
          <FaTachometerAlt className="text-2xl" />
          Admin Panel
        </div>
        <button
          className="text-2xl focus:outline-none"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          &#9776;
        </button>
      </div>
      {/* Sidebar for desktop, slide-in for mobile */}
      <aside
        className={`bg-white shadow h-full p-6 flex flex-col justify-between fixed md:static top-0 left-0 z-50 w-64 md:w-64 transition-transform duration-200 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{ minHeight: '100vh' }}
      >
        <div>
          <div className="flex items-center gap-3 mb-8 text-black font-bold text-xl">
            <FaTachometerAlt className="text-3xl" />
            <span>Admin Panel</span>
          </div>
          <nav className="flex flex-col gap-2 mb-8">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all text-base ${location.pathname === link.to ? 'bg-orange-100 border-l-4 border-orange-500 text-orange-800 shadow' : 'text-gray-700 hover:bg-orange-50'}`}
                onClick={() => setOpen(false)}
              >
                <span className="text-xl">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>
          {isLoggedIn && (
            <div className="mb-4 flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg shadow text-lg font-bold text-orange-700 border border-orange-200">
              <span>Welcome admin</span>
              <span role="img" aria-label="smile" className="text-2xl">😊</span>
            </div>
          )}
        </div>
        {isLoggedIn && (
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 w-full mt-4 flex items-center justify-center gap-2 text-base font-semibold transition-all"
            onClick={handleLogout}
          >
            <FaSignOutAlt /> Logout
          </button>
        )}
      </aside>
      {/* Overlay for mobile menu */}
      {open && <div className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden" onClick={() => setOpen(false)}></div>}
    </>
  );
};

export default Sidebar; 