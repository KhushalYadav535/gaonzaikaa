import React, { useEffect, useState } from 'react';
import { FaUsers, FaStore, FaClipboardList, FaMoneyBillWave, FaRupeeSign, FaStar, FaChartLine } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const AnimatedNumber = ({ value, prefix = '' }: { value: number, prefix?: string }) => {
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
  return <span>{prefix}{display}</span>;
};

// Colors for Pie Chart (Order Statuses)
const STATUS_COLORS: Record<string, string> = {
  'Pending': '#F59E0B', // Amber
  'Accepted': '#3B82F6', // Blue
  'Preparing': '#8B5CF6', // Purple
  'Out for Delivery': '#EC4899', // Pink
  'Delivered': '#10B981', // Green
  'Cancelled': '#EF4444', // Red
};

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>({
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
    orderStatusCounts: {},
    chartData: [],
    recentOrders: [],
    topRestaurants: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modal, setModal] = useState<null | 'users' | 'restaurants' | 'orders' | 'earnings'>(null);
  const [modalData, setModalData] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const [config, setConfig] = useState({
    isRainModeActive: false,
    surgeFeeType: 'flat',
    surgeFeeValue: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getDashboard();
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
        const configRes = await adminAPI.getConfig();
        if (configRes.data.success) {
          setConfig(configRes.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleToggleRainMode = async () => {
    try {
      const updatedStatus = !config.isRainModeActive;
      const res = await adminAPI.updateConfig({ isRainModeActive: updatedStatus });
      if (res.data.success) {
        setConfig(prev => ({ ...prev, isRainModeActive: updatedStatus }));
      }
    } catch (err) {
      console.error('Failed to toggle rain mode');
    }
  };

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

  // Format data for Pie Chart
  const pieData = Object.entries(dashboardData.orderStatusCounts || {}).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="p-4 md:p-8 pb-20">
      <h1 className="text-3xl font-bold mb-6 text-amber-900 flex items-center gap-2">
        <FaChartLine /> Dashboard Overview
      </h1>
      
      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group hover:shadow-md transition">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Today's Revenue</p>
              <h3 className="text-3xl font-bold text-gray-800"><AnimatedNumber prefix="₹" value={Math.round(dashboardData.todayRevenue)} /></h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><FaRupeeSign className="text-xl" /></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group hover:shadow-md transition">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">This Month's Revenue</p>
              <h3 className="text-3xl font-bold text-gray-800"><AnimatedNumber prefix="₹" value={Math.round(dashboardData.thisMonthRevenue)} /></h3>
            </div>
            <div className="p-3 bg-green-100 text-green-600 rounded-xl"><FaMoneyBillWave className="text-xl" /></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group hover:shadow-md transition">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Total Orders</p>
              <h3 className="text-3xl font-bold text-gray-800"><AnimatedNumber value={dashboardData.totalOrders} /></h3>
            </div>
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><FaClipboardList className="text-xl" /></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group hover:shadow-md transition">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Today's Earnings</p>
              <h3 className="text-3xl font-bold text-gray-800"><AnimatedNumber prefix="₹" value={Math.round(dashboardData.todayAdminEarnings)} /></h3>
            </div>
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><FaStar className="text-xl" /></div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 flex items-center justify-between border-l-4 border-l-blue-500">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            ⛈️ Surge Pricing & Rain Mode
          </h3>
          <p className="text-gray-500 text-sm mt-1">Enable this to apply a surge fee on all new orders during high demand or bad weather.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-semibold text-gray-700">Surge Fee: {config.surgeFeeType === 'flat' ? '₹' : ''}{config.surgeFeeValue}{config.surgeFeeType === 'percentage' ? '%' : ''}</div>
            <Link to="/admin/settings" className="text-sm text-blue-500 hover:underline font-medium">Configure</Link>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={config.isRainModeActive}
              onChange={handleToggleRainMode}
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-500 shadow-inner"></div>
          </label>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Line Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue Trend (Last 7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `₹${val}`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`₹${value}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
          <h3 className="text-lg font-bold text-gray-800 mb-2 self-start">Order Statuses</h3>
          <div className="h-64 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#9CA3AF'} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => [value, 'Orders']} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
            <Link to="/admin/orders" className="text-sm text-orange-600 font-medium hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-sm font-semibold text-gray-500">Order ID</th>
                  <th className="pb-3 text-sm font-semibold text-gray-500">Restaurant</th>
                  <th className="pb-3 text-sm font-semibold text-gray-500">Amount</th>
                  <th className="pb-3 text-sm font-semibold text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentOrders?.map((order: any) => (
                  <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-4 text-sm font-mono text-gray-700">#{order._id.substring(18)}</td>
                    <td className="py-4 text-sm font-medium text-gray-800">{order.restaurantId?.name || 'Unknown'}</td>
                    <td className="py-4 text-sm font-semibold text-gray-800">₹{order.totalAmount}</td>
                    <td className="py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${STATUS_COLORS[order.status] || '#9CA3AF'}20`, color: STATUS_COLORS[order.status] || '#9CA3AF' }}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!dashboardData.recentOrders || dashboardData.recentOrders.length === 0) && (
                  <tr><td colSpan={4} className="py-6 text-center text-gray-400">No recent orders</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Restaurants */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Top Restaurants</h3>
          <div className="space-y-4">
            {dashboardData.topRestaurants?.map((rest: any, idx: number) => (
              <div key={rest._id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg shrink-0">
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-800 truncate">{rest.name}</h4>
                  <p className="text-xs text-gray-500">{rest.orders} orders</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">₹{rest.revenue}</p>
                </div>
              </div>
            ))}
            {(!dashboardData.topRestaurants || dashboardData.topRestaurants.length === 0) && (
              <div className="text-center py-6 text-gray-400">Not enough data</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Links</h3>
      <div className="flex flex-wrap gap-4">
        <Link to="/admin/users" className="bg-orange-50 text-orange-700 px-6 py-3 rounded-xl hover:bg-orange-100 transition font-semibold tracking-wide border border-orange-200">Manage Users</Link>
        <Link to="/admin/restaurants" className="bg-blue-50 text-blue-700 px-6 py-3 rounded-xl hover:bg-blue-100 transition font-semibold tracking-wide border border-blue-200">Manage Restaurants</Link>
        <Link to="/admin/earnings" className="bg-green-50 text-green-700 px-6 py-3 rounded-xl hover:bg-green-100 transition font-semibold tracking-wide border border-green-200">Admin Earnings</Link>
        <button onClick={() => handleCardClick('users')} className="bg-gray-50 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-100 transition font-semibold tracking-wide border border-gray-200">View Data Tables</button>
      </div>

      {/* Old Modal for legacy tables */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl relative max-h-[90vh] flex flex-col">
            <button className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-700" onClick={() => setModal(null)}>&times;</button>
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              {modal === 'users' && 'Detailed User List'}
              {modal === 'restaurants' && 'Detailed Restaurant List'}
              {modal === 'orders' && 'All Orders'}
              {modal === 'earnings' && 'Admin Earnings Breakdown'}
            </h3>
            <div className="overflow-auto flex-1 border rounded-xl">
              {modalLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-lg text-gray-500">Loading data...</div>
                </div>
              ) : modalData.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-lg text-gray-500">No data available</div>
                </div>
              ) : (
                <>
                  {modal === 'users' && (
                    <table className="min-w-full bg-white">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                          <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                          <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalData.map((user: any, idx) => (
                          <tr key={user._id || idx} className="hover:bg-gray-50 border-b">
                            <td className="py-3 px-4">{user.name}</td>
                            <td className="py-3 px-4 text-gray-600">{user.email}</td>
                            <td className="py-3 px-4 capitalize font-medium text-orange-600">{user.role}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {modal === 'restaurants' && (
                    <table className="min-w-full bg-white">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                          <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-500 uppercase">Address</th>
                          <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-500 uppercase">Cuisine</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalData.map((restaurant: any, idx) => (
                          <tr key={restaurant._id || idx} className="hover:bg-gray-50 border-b">
                            <td className="py-3 px-4 font-semibold text-gray-800">{restaurant.name}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {typeof restaurant.address === 'string' 
                                ? restaurant.address 
                                : restaurant.address?.fullAddress || 
                                  `${restaurant.address?.street || ''}, ${restaurant.address?.city || ''}`.trim() || 'N/A'
                              }
                            </td>
                            <td className="py-3 px-4 text-sm">{restaurant.cuisine}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {modal === 'orders' && (
                    <table className="min-w-full bg-white">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                          <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-500 uppercase">Restaurant</th>
                          <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalData.map((order: any, idx) => (
                          <tr key={order._id || idx} className="hover:bg-gray-50 border-b">
                            <td className="py-3 px-4 text-sm font-medium">{order.customerInfo?.name || 'N/A'}</td>
                            <td className="py-3 px-4 text-sm">{order.restaurant?.name || 'N/A'}</td>
                            <td className="py-3 px-4 capitalize text-sm font-semibold">{order.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {modal === 'earnings' && (
                    <table className="min-w-full bg-white">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-500 uppercase">Restaurant</th>
                          <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-500 uppercase">Orders</th>
                          <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-500 uppercase">Revenue</th>
                          <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-500 uppercase">Commission</th>
                          <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-500 uppercase">Delivery</th>
                          <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-500 uppercase">Earnings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalData.map((earning: any, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 border-b">
                            <td className="py-3 px-4 font-semibold text-gray-800">{earning.restaurantName}</td>
                            <td className="py-3 px-4">{earning.totalOrders}</td>
                            <td className="py-3 px-4">₹{earning.totalRevenue.toFixed(2)}</td>
                            <td className="py-3 px-4 text-blue-600">₹{earning.totalCommission.toFixed(2)}</td>
                            <td className="py-3 px-4 text-orange-600">₹{earning.totalDeliveryCharges.toFixed(2)}</td>
                            <td className="py-3 px-4 font-bold text-green-600">₹{earning.totalEarnings.toFixed(2)}</td>
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