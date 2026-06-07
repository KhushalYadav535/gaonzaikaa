import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { FaChartLine, FaFire, FaRupeeSign, FaShoppingBag, FaStore, FaTruck, FaUsers, FaSync } from 'react-icons/fa';
import { adminAPI } from '../../services/api';

const COLORS = ['#f59e42', '#6366f1', '#10b981', '#f43f5e', '#8b5cf6'];

const Analytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [dashRes, ordersRes] = await Promise.all([
        adminAPI.getAnalytics(),
        adminAPI.getOrdersData({ limit: 200 })
      ]);
      if (dashRes.data.success) setData(dashRes.data.data);
      if (ordersRes.data.success) setOrders(ordersRes.data.data || []);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Build weekly chart from real orders
  const weeklyData = (() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const map: Record<string, { orders: number; revenue: number }> = {};
    days.forEach(d => { map[d] = { orders: 0, revenue: 0 }; });
    orders.forEach((order: any) => {
      const day = days[new Date(order.createdAt).getDay()];
      map[day].orders += 1;
      map[day].revenue += (order.totalAmount || order.total || 0);
    });
    return days.map(d => ({ date: d, ...map[d] }));
  })();

  // Top restaurants from orders
  const topRestaurantsData = (() => {
    const map: Record<string, { name: string; orders: number; revenue: number }> = {};
    orders.forEach((order: any) => {
      const id = order.restaurant?._id || order.restaurantId;
      const name = order.restaurant?.name || 'Unknown';
      if (!id) return;
      if (!map[id]) map[id] = { name, orders: 0, revenue: 0 };
      map[id].orders += 1;
      map[id].revenue += (order.totalAmount || order.total || 0);
    });
    return Object.values(map).sort((a, b) => b.orders - a.orders).slice(0, 5);
  })();

  // Order status pie
  const statusData = (() => {
    const map: Record<string, number> = {};
    orders.forEach((o: any) => {
      const s = o.status || 'unknown';
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  if (loading) {
    return (
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-amber-900 flex items-center gap-3"><FaChartLine /> Analytics & Insights</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-amber-900 flex items-center gap-3"><FaChartLine /> Analytics & Insights</h2>
        <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center">
          <p className="mb-4">{error}</p>
          <button onClick={fetchData} className="bg-red-500 text-white px-4 py-2 rounded-lg">Retry</button>
        </div>
      </div>
    );
  }

  const totalRevenue = data?.totalRevenue || 0;
  const totalOrders = data?.totalOrders || 0;
  const totalRestaurants = data?.totalRestaurants || 0;
  const totalVendors = data?.totalVendors || 0;
  const totalDelivery = data?.totalDeliveryPersons || 0;
  const todayRevenue = data?.todayRevenue || 0;
  const adminEarnings = data?.totalAdminEarnings || 0;
  const orderStatusCounts = data?.orderStatusCounts || {};

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-amber-900 flex items-center gap-3"><FaChartLine /> Analytics & Insights</h2>
        <div className="flex items-center gap-3">
          {lastUpdated && <span className="text-xs text-gray-400">Updated {lastUpdated.toLocaleTimeString()}</span>}
          <button onClick={fetchData} className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-600 px-4 py-2 rounded-xl text-sm font-medium transition">
            <FaSync /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: <FaRupeeSign />, color: 'from-green-500 to-emerald-600' },
          { label: 'Today Revenue', value: `₹${todayRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: <FaRupeeSign />, color: 'from-teal-500 to-teal-600' },
          { label: 'Total Orders', value: totalOrders.toLocaleString(), icon: <FaShoppingBag />, color: 'from-blue-500 to-blue-600' },
          { label: 'Admin Earnings', value: `₹${adminEarnings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: <FaRupeeSign />, color: 'from-purple-500 to-purple-600' },
          { label: 'Restaurants', value: totalRestaurants, icon: <FaStore />, color: 'from-orange-500 to-orange-600' },
          { label: 'Vendors', value: totalVendors, icon: <FaUsers />, color: 'from-pink-500 to-pink-600' },
          { label: 'Delivery Staff', value: totalDelivery, icon: <FaTruck />, color: 'from-indigo-500 to-indigo-600' },
          { label: 'Completed Orders', value: orderStatusCounts?.delivered || 0, icon: <FaFire />, color: 'from-amber-500 to-amber-600' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`bg-gradient-to-r ${color} text-white p-4 rounded-xl shadow`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/70 text-xs">{label}</span>
              <span className="text-white/50">{icon}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Weekly Orders + Revenue */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-indigo-700">
            <FaChartLine /> Weekly Orders & Revenue
          </h3>
          {weeklyData.some(d => d.orders > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: any, name: string) => [name === 'revenue' ? `₹${value}` : value, name === 'revenue' ? 'Revenue' : 'Orders']} />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#f59e42" strokeWidth={2} dot={{ r: 4 }} name="orders" />
                <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="revenue" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center text-gray-300 text-sm">No order data this week</div>
          )}
        </div>

        {/* Top Restaurants */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-orange-700">
            <FaFire /> Top Restaurants by Orders
          </h3>
          {topRestaurantsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topRestaurantsData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="orders" fill="#f59e42" radius={[6, 6, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center text-gray-300 text-sm">No restaurant order data yet</div>
          )}
        </div>

        {/* Order Status Pie */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-emerald-700">
            <FaShoppingBag /> Order Status Breakdown
          </h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center text-gray-300 text-sm">No order status data yet</div>
          )}
        </div>

        {/* Revenue by Restaurant */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-700">
            <FaRupeeSign /> Revenue by Restaurant
          </h3>
          {topRestaurantsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topRestaurantsData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                <Tooltip formatter={(v: any) => [`₹${v}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 6, 6, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center text-gray-300 text-sm">No revenue data yet</div>
          )}
        </div>
      </div>

      {/* Order Status Quick View */}
      {Object.keys(orderStatusCounts).length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Order Status Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(orderStatusCounts).map(([status, count]: [string, any]) => (
              <div key={status} className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-gray-800">{count}</p>
                <p className="text-xs text-gray-500 capitalize mt-1">{status.replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;