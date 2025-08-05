import React, { useEffect, useState } from 'react';
import { FaUsers, FaStore, FaClipboardList, FaMoneyBillWave } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';

const AnimatedNumber = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    let increment = end / 30;
    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, 20);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
};

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState({
    totalRestaurants: 0,
    totalVendors: 0,
    totalDeliveryPersons: 0,
    totalOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    thisMonthRevenue: 0,
    totalAdminEarnings: 0,
    todayAdminEarnings: 0,
    thisMonthAdminEarnings: 0,
    orderStatusCounts: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modal, setModal] = useState<null | 'users' | 'restaurants' | 'orders' | 'earnings'>(null);
  const [modalData, setModalData] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getDashboard();
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCardClick = async (type: 'users' | 'restaurants' | 'orders' | 'earnings') => {
    setModal(type);
    setModalLoading(true);
    
    try {
      let response;
      if (type === 'users') {
        response = await adminAPI.getUsers();
        if (response.data.success) {
          const userData = response.data.data;
          let allUsers: any[] = [];
          
          if (userData.vendors && Array.isArray(userData.vendors)) {
            allUsers = [...allUsers, ...userData.vendors.map((vendor: any) => ({
              ...vendor,
              role: 'vendor'
            }))];
          }
          
          if (userData.deliveryPersons && Array.isArray(userData.deliveryPersons)) {
            allUsers = [...allUsers, ...userData.deliveryPersons.map((delivery: any) => ({
              ...delivery,
              role: 'delivery'
            }))];
          }
          
          setModalData(allUsers);
        }
      } else if (type === 'restaurants') {
        response = await adminAPI.getRestaurants();
        if (response.data.success) {
          setModalData(response.data.data || []);
        }
      } else if (type === 'orders') {
        response = await adminAPI.getOrders();
        if (response.data.success) {
          setModalData(response.data.data || []);
        }
      } else if (type === 'earnings') {
        response = await adminAPI.getEarnings();
        if (response.data.success) {
          setModalData(response.data.data.earningsBreakdown || []);
        }
      }
    } catch (err: any) {
      console.error('Error fetching modal data:', err);
      setModalData([]);
    } finally {
      setModalLoading(false);
    }
  };

    if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-amber-900">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          className={`rounded-xl shadow-lg p-6 text-center relative overflow-hidden bg-gradient-to-br from-indigo-500 to-blue-400 transition-transform transform hover:scale-105 cursor-pointer`}
          onClick={() => handleCardClick('users')}
        >
          <div className="absolute top-3 right-3 opacity-20 text-6xl pointer-events-none">
            <FaUsers className="text-3xl text-white" />
          </div>
          <div className="flex flex-col items-center z-10 relative">
            <div className="text-2xl font-semibold text-white flex items-center gap-2">
              <FaUsers className="text-3xl text-white" />
              <span>Users</span>
            </div>
            <div className="text-5xl font-bold mt-2 text-white drop-shadow-lg">
              <AnimatedNumber value={dashboardData.totalVendors + dashboardData.totalDeliveryPersons} />
            </div>
          </div>
        </div>
        <div
          className={`rounded-xl shadow-lg p-6 text-center relative overflow-hidden bg-gradient-to-br from-orange-500 to-yellow-400 transition-transform transform hover:scale-105 cursor-pointer`}
          onClick={() => handleCardClick('restaurants')}
        >
          <div className="absolute top-3 right-3 opacity-20 text-6xl pointer-events-none">
            <FaStore className="text-3xl text-white" />
          </div>
          <div className="flex flex-col items-center z-10 relative">
            <div className="text-2xl font-semibold text-white flex items-center gap-2">
            <FaStore className="text-3xl text-white" />
              <span>Restaurants</span>
            </div>
            <div className="text-5xl font-bold mt-2 text-white drop-shadow-lg">
              <AnimatedNumber value={dashboardData.totalRestaurants} />
            </div>
          </div>
        </div>
        <div
          className={`rounded-xl shadow-lg p-6 text-center relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-400 transition-transform transform hover:scale-105 cursor-pointer`}
          onClick={() => handleCardClick('orders')}
        >
          <div className="absolute top-3 right-3 opacity-20 text-6xl pointer-events-none">
            <FaClipboardList className="text-3xl text-white" />
          </div>
          <div className="flex flex-col items-center z-10 relative">
            <div className="text-2xl font-semibold text-white flex items-center gap-2">
              <FaClipboardList className="text-3xl text-white" />
              <span>Orders</span>
            </div>
            <div className="text-5xl font-bold mt-2 text-white drop-shadow-lg">
              <AnimatedNumber value={dashboardData.totalOrders} />
            </div>
          </div>
        </div>
        <div
          className={`rounded-xl shadow-lg p-6 text-center relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-400 transition-transform transform hover:scale-105 cursor-pointer`}
          onClick={() => handleCardClick('earnings')}
        >
          <div className="absolute top-3 right-3 opacity-20 text-6xl pointer-events-none">
            <FaMoneyBillWave className="text-3xl text-white" />
          </div>
          <div className="flex flex-col items-center z-10 relative">
            <div className="text-2xl font-semibold text-white flex items-center gap-2">
              <FaMoneyBillWave className="text-3xl text-white" />
              <span>Admin Earnings</span>
            </div>
            <div className="text-5xl font-bold mt-2 text-white drop-shadow-lg">
              ₹<AnimatedNumber value={Math.round(dashboardData.totalAdminEarnings)} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <Link to="/admin/users" className="bg-orange-500 text-white px-6 py-3 rounded-xl shadow hover:bg-orange-600 text-center active:scale-95 transition font-semibold tracking-wide">User Management</Link>
        <Link to="/admin/restaurants" className="bg-orange-500 text-white px-6 py-3 rounded-xl shadow hover:bg-orange-600 text-center active:scale-95 transition font-semibold tracking-wide">Restaurant Management</Link>
        <Link to="/admin/orders" className="bg-orange-500 text-white px-6 py-3 rounded-xl shadow hover:bg-orange-600 text-center active:scale-95 transition font-semibold tracking-wide">Order Management</Link>
        <Link to="/admin/earnings" className="bg-purple-500 text-white px-6 py-3 rounded-xl shadow hover:bg-purple-600 text-center active:scale-95 transition font-semibold tracking-wide">Admin Earnings</Link>
      </div>
      {/* Modal for card data */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative animate-fadeIn">
            <button className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-red-500" onClick={() => setModal(null)}>&times;</button>
            <h3 className="text-2xl font-bold mb-4 text-orange-700 text-center">
              {modal === 'users' && 'User List'}
              {modal === 'restaurants' && 'Restaurant List'}
              {modal === 'orders' && 'Order List'}
              {modal === 'earnings' && 'Admin Earnings Breakdown'}
            </h3>
            <div className="overflow-x-auto max-h-96">
              {modalLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-lg">Loading data...</div>
                </div>
              ) : modalData.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-lg text-gray-500">No data available</div>
                </div>
              ) : (
                <>
                  {modal === 'users' && (
                    <table className="min-w-full bg-white rounded shadow">
                      <thead>
                        <tr className="bg-orange-50">
                          <th className="py-2 px-4 border-b">Name</th>
                          <th className="py-2 px-4 border-b">Email</th>
                          <th className="py-2 px-4 border-b">Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalData.map((user: any, idx) => (
                          <tr key={user._id || idx}>
                            <td className="py-2 px-4 border-b">{user.name}</td>
                            <td className="py-2 px-4 border-b">{user.email}</td>
                            <td className="py-2 px-4 border-b capitalize">{user.role}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {modal === 'restaurants' && (
                    <table className="min-w-full bg-white rounded shadow">
                      <thead>
                        <tr className="bg-orange-50">
                          <th className="py-2 px-4 border-b">Name</th>
                          <th className="py-2 px-4 border-b">Address</th>
                          <th className="py-2 px-4 border-b">Cuisine</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalData.map((restaurant: any, idx) => (
                          <tr key={restaurant._id || idx}>
                            <td className="py-2 px-4 border-b">{restaurant.name}</td>
                            <td className="py-2 px-4 border-b">
                              {typeof restaurant.address === 'string' 
                                ? restaurant.address 
                                : restaurant.address?.fullAddress || 
                                  `${restaurant.address?.street || ''}, ${restaurant.address?.city || ''}, ${restaurant.address?.state || ''} ${restaurant.address?.pincode || ''}`.trim() || 'N/A'
                              }
                            </td>
                            <td className="py-2 px-4 border-b">{restaurant.cuisine}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {modal === 'orders' && (
                    <table className="min-w-full bg-white rounded shadow">
                      <thead>
                        <tr className="bg-orange-50">
                          <th className="py-2 px-4 border-b">Customer</th>
                          <th className="py-2 px-4 border-b">Restaurant</th>
                          <th className="py-2 px-4 border-b">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalData.map((order: any, idx) => (
                          <tr key={order._id || idx}>
                            <td className="py-2 px-4 border-b">{order.customerInfo?.name || 'N/A'}</td>
                            <td className="py-2 px-4 border-b">{order.restaurant?.name || 'N/A'}</td>
                            <td className="py-2 px-4 border-b capitalize">{order.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {modal === 'earnings' && (
                    <table className="min-w-full bg-white rounded shadow">
                      <thead>
                        <tr className="bg-orange-50">
                          <th className="py-2 px-4 border-b">Restaurant</th>
                          <th className="py-2 px-4 border-b">Orders</th>
                          <th className="py-2 px-4 border-b">Revenue</th>
                          <th className="py-2 px-4 border-b">Commission</th>
                          <th className="py-2 px-4 border-b">Delivery</th>
                          <th className="py-2 px-4 border-b">Total Earnings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalData.map((earning: any, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-4 border-b">{earning.restaurantName}</td>
                            <td className="py-2 px-4 border-b">{earning.totalOrders}</td>
                            <td className="py-2 px-4 border-b">₹{earning.totalRevenue.toFixed(2)}</td>
                            <td className="py-2 px-4 border-b text-blue-600">₹{earning.totalCommission.toFixed(2)}</td>
                            <td className="py-2 px-4 border-b text-orange-600">₹{earning.totalDeliveryCharges.toFixed(2)}</td>
                            <td className="py-2 px-4 border-b font-semibold text-green-600">₹{earning.totalEarnings.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 