import React, { useEffect, useState } from 'react';
import { FaUsers, FaStore, FaClipboardList, FaMoneyBillWave, FaRupeeSign, FaStar, FaChartLine } from 'react-icons/fa';
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
  return <span>{prefix}{display.toLocaleString('en-IN')}</span>;
};

const STATUS_COLORS: Record<string, string> = {
  'Pending': '#F59E0B',
  'Accepted': '#3B82F6',
  'Preparing': '#8B5CF6',
  'Out for Delivery': '#EC4899',
  'Delivered': '#10B981',
  'Cancelled': '#EF4444',
};

const DummyDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>({
    totalRestaurants: 154,
    totalVendors: 160,
    totalDeliveryPersons: 345,
    totalOrders: 28450,
    totalRevenue: 2545800,
    todayRevenue: 45200,
    thisMonthRevenue: 985600,
    totalAdminEarnings: 254580,
    todayAdminEarnings: 4520,
    thisMonthAdminEarnings: 98560,
    orderStatusCounts: {
      'Delivered': 26100,
      'Pending': 150,
      'Accepted': 450,
      'Preparing': 800,
      'Out for Delivery': 600,
      'Cancelled': 350
    },
    chartData: [],
    recentOrders: [],
    topRestaurants: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealDataAndSpoof = async () => {
      try {
        setLoading(true);
        // Fetch real restaurants
        const response = await adminAPI.getRestaurants();
        let realRestaurants = [];
        if (response.data.success && Array.isArray(response.data.data)) {
          realRestaurants = response.data.data;
        }

        // Generate fake 7-day chart data
        const fakeChartData = [];
        let curRev = 35000;
        let curOrd = 300;
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          fakeChartData.push({
            date: dateStr,
            orders: curOrd + Math.floor(Math.random() * 200 - 100),
            revenue: curRev + Math.floor(Math.random() * 15000 - 5000)
          });
        }

        // Map real restaurants to fake high revenues
        const fakeTopRestaurants = realRestaurants.slice(0, 5).map((r: any, idx) => {
          let addrString = 'Local City';
          if (r.address) {
            if (typeof r.address === 'string') addrString = r.address;
            else if (typeof r.address === 'object') addrString = r.address.fullAddress || r.address.city || r.address.street || 'Local City';
          }
          return {
            _id: r._id,
            name: r.name,
            address: addrString,
            totalOrders: 1500 - (idx * 150) + Math.floor(Math.random() * 50),
            totalRevenue: 350000 - (idx * 40000) + Math.floor(Math.random() * 10000)
          };
        });

        // Generate some fake recent orders using real restaurant names
        const fakeRecentOrders = [];
        for (let i = 0; i < 5; i++) {
          const r = realRestaurants[i % realRestaurants.length];
          fakeRecentOrders.push({
            _id: `fake_${i}`,
            orderId: `ORD${Math.floor(Math.random() * 1000000)}`,
            customerInfo: { name: ['Rahul', 'Priya', 'Amit', 'Neha', 'Sanjay'][i] },
            restaurantId: { name: r ? r.name : 'Famous Restaurant' },
            totalAmount: 350 + Math.floor(Math.random() * 500),
            status: ['Pending', 'Preparing', 'Out for Delivery'][i % 3],
            createdAt: new Date().toISOString()
          });
        }

        setDashboardData((prev: any) => ({
          ...prev,
          totalRestaurants: realRestaurants.length > 50 ? realRestaurants.length : 154,
          chartData: fakeChartData,
          topRestaurants: fakeTopRestaurants,
          recentOrders: fakeRecentOrders
        }));
      } catch (err: any) {
        console.error('Failed to spoof dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRealDataAndSpoof();
  }, []);

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const pieData = Object.entries(dashboardData.orderStatusCounts || {}).map(([name, value]) => ({
    name, value
  }));

  if (loading) {
    return <div className="p-8"><div className="h-32 bg-gray-100 animate-pulse rounded-2xl w-full"></div></div>;
  }

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaChartLine className="text-blue-600" /> Marketing Dashboard (Live)
          </h2>
          <p className="text-gray-500 mt-1 font-medium">Real-time platform metrics and growth insights.</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-bold border border-emerald-200 animate-pulse">
          Live Sync Active
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><FaUsers className="text-6xl text-blue-500" /></div>
          <div className="text-sm font-bold text-gray-500 mb-1">Active Users & Vendors</div>
          <div className="text-3xl font-black text-gray-800"><AnimatedNumber value={12500} prefix="+" /></div>
          <div className="text-xs font-semibold text-emerald-500 mt-2 bg-emerald-50 inline-block px-2 py-1 rounded-md">↑ 18% vs last month</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><FaStore className="text-6xl text-indigo-500" /></div>
          <div className="text-sm font-bold text-gray-500 mb-1">Total Restaurants</div>
          <div className="text-3xl font-black text-gray-800"><AnimatedNumber value={dashboardData.totalRestaurants} /></div>
          <div className="text-xs font-semibold text-emerald-500 mt-2 bg-emerald-50 inline-block px-2 py-1 rounded-md">↑ 5 new this week</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><FaClipboardList className="text-6xl text-emerald-500" /></div>
          <div className="text-sm font-bold text-gray-500 mb-1">Total Orders Delivered</div>
          <div className="text-3xl font-black text-gray-800"><AnimatedNumber value={dashboardData.totalOrders} /></div>
          <div className="text-xs font-semibold text-emerald-500 mt-2 bg-emerald-50 inline-block px-2 py-1 rounded-md">↑ 2,500 this week</div>
        </div>
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl shadow-md text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20"><FaMoneyBillWave className="text-6xl" /></div>
          <div className="text-sm font-bold text-indigo-100 mb-1">Total Platform Revenue</div>
          <div className="text-3xl font-black"><AnimatedNumber value={dashboardData.totalRevenue} prefix="₹" /></div>
          <div className="text-xs font-bold text-indigo-200 mt-2 bg-indigo-800/50 inline-block px-2 py-1 rounded-md">Massive Growth 🚀</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Chart */}
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Revenue Trend (Last 7 Days)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie */}
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Order Success Rate</h3>
          <div className="h-72 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#CBD5E1'} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-emerald-500">98%</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delivered</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Restaurants */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><FaStar className="text-yellow-400"/> Top Rated Restaurants</h3>
          <div className="space-y-4">
            {dashboardData.topRestaurants.map((restaurant: any, index: number) => (
              <div key={restaurant._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-orange-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black text-lg">#{index + 1}</div>
                  <div>
                    <div className="font-bold text-gray-800 text-base">{restaurant.name}</div>
                    <div className="text-xs text-gray-500">{restaurant.address}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-emerald-600">{formatCurrency(restaurant.totalRevenue)}</div>
                  <div className="text-xs text-gray-400 font-medium">{restaurant.totalOrders} orders</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Orders Tracker */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div> Live Orders Activity
          </h3>
          <div className="space-y-4">
            {dashboardData.recentOrders.map((order: any) => (
              <div key={order._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-800">#{order.orderId}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">{order.status}</span>
                  </div>
                  <div className="text-sm text-gray-600">{order.restaurantId?.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{order.customerInfo?.name}</div>
                </div>
                <div className="font-black text-gray-900 bg-gray-50 px-3 py-1.5 rounded-xl">
                  {formatCurrency(order.totalAmount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DummyDashboard;
