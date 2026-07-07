import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { FaChartLine, FaFire, FaRupeeSign, FaShoppingBag, FaStore, FaTruck, FaUsers, FaSync, FaCalendarAlt, FaChartPie, FaMoneyBillWave } from 'react-icons/fa';
import { adminAPI } from '../../services/api';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Custom Tooltip Component for Premium Look
const CustomTooltip = ({ active, payload, label, formatterPrefix = '' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/50 text-sm">
        <p className="font-bold text-gray-800 mb-2 border-b pb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 my-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600 capitalize">{entry.name}:</span>
            <span className="font-bold text-gray-900">
              {formatterPrefix}{entry.value.toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Time Filter State
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | 'all'>('7d');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch dashboard totals and a large set of recent orders for analytics processing
      const [dashRes, ordersRes] = await Promise.all([
        adminAPI.getAnalytics(),
        adminAPI.getOrdersData({ limit: 1000 }) // Fetch more to allow 30d filtering
      ]);
      if (dashRes.data.success) setData(dashRes.data.data);
      if (ordersRes.data.success) setAllOrders(ordersRes.data.data || []);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  // Filter orders based on selected time range
  const filteredOrders = useMemo(() => {
    if (timeFilter === 'all') return allOrders;
    
    const cutoffDate = new Date();
    if (timeFilter === '7d') cutoffDate.setDate(cutoffDate.getDate() - 7);
    if (timeFilter === '30d') cutoffDate.setDate(cutoffDate.getDate() - 30);
    
    return allOrders.filter(o => new Date(o.createdAt) >= cutoffDate);
  }, [allOrders, timeFilter]);

  // Derived Metrics from Filtered Orders
  const filteredMetrics = useMemo(() => {
    const totalRev = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
    const totalOrd = filteredOrders.length;
    const aov = totalOrd > 0 ? (totalRev / totalOrd) : 0;
    
    return {
      revenue: totalRev,
      orders: totalOrd,
      aov: Math.round(aov)
    };
  }, [filteredOrders]);

  // Build Time Series Data (Daily)
  const timeSeriesData = useMemo(() => {
    const map: Record<string, { orders: number; revenue: number; timestamp: number }> = {};
    
    // Initialize days based on filter
    const daysToInit = timeFilter === '7d' ? 7 : (timeFilter === '30d' ? 30 : 0);
    if (daysToInit > 0) {
      for (let i = daysToInit - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        map[dateStr] = { orders: 0, revenue: 0, timestamp: d.getTime() };
      }
    }

    filteredOrders.forEach(order => {
      const d = new Date(order.createdAt);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!map[dateStr]) map[dateStr] = { orders: 0, revenue: 0, timestamp: d.getTime() };
      map[dateStr].orders += 1;
      map[dateStr].revenue += (order.totalAmount || order.total || 0);
    });

    return Object.entries(map)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [filteredOrders, timeFilter]);

  // Top Restaurants from Filtered Orders
  const topRestaurantsData = useMemo(() => {
    const map: Record<string, { name: string; orders: number; revenue: number }> = {};
    filteredOrders.forEach(order => {
      const id = order.restaurant?._id || order.restaurantId;
      const name = order.restaurant?.name || 'Unknown';
      if (!id) return;
      if (!map[id]) map[id] = { name, orders: 0, revenue: 0 };
      map[id].orders += 1;
      map[id].revenue += (order.totalAmount || order.total || 0);
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5); // Sorted by revenue for better insight
  }, [filteredOrders]);

  // Order status pie
  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredOrders.forEach(o => {
      const s = o.status || 'unknown';
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredOrders]);

  // Popular Dishes (Top Menu Items)
  const popularItemsData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredOrders.forEach(o => {
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach((item: any) => {
          if (item.name) {
            map[item.name] = (map[item.name] || 0) + (item.quantity || 1);
          }
        });
      }
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [filteredOrders]);

  // Payment Method Distribution
  const paymentMethodData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredOrders.forEach(o => {
      const pm = o.paymentMethod || 'Unknown';
      map[pm] = (map[pm] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredOrders]);

  // Busiest Hours of the Day
  const hourlyVolumeData = useMemo(() => {
    const hours = Array(24).fill(0);
    filteredOrders.forEach(o => {
      if (o.createdAt) {
        const h = new Date(o.createdAt).getHours();
        hours[h] += 1;
      }
    });
    return hours.map((count, hour) => {
      const displayHour = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
      return { hour: displayHour, orders: count };
    });
  }, [filteredOrders]);


  if (loading) {
    return (
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3"><FaChartLine className="text-indigo-500" /> Analytics & Insights</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3"><FaChartLine className="text-indigo-500" /> Analytics & Insights</h2>
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center shadow-sm">
          <p className="mb-4 font-medium">{error}</p>
          <button onClick={fetchData} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl transition shadow-md font-bold">Retry Connection</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen pb-24">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
            <FaChartLine className="text-indigo-600" /> Executive Analytics
          </h2>
          <p className="text-gray-500 mt-1 font-medium">Data-driven insights to grow your platform.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-1.5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {(['7d', '30d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeFilter(range)}
                className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all duration-200 ${
                  timeFilter === range 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
              >
                {range === 'all' ? 'All Time' : `Last ${range.replace('d', ' Days')}`}
              </button>
            ))}
          </div>
          <div className="w-px h-8 bg-gray-200 mx-1"></div>
          <button 
            onClick={fetchData} 
            className="flex items-center justify-center p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
            title="Refresh Data"
          >
            <FaSync />
          </button>
        </div>
      </div>

      {/* KPI Cards (Glassmorphism & Gradients) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Metric 1 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-50 rounded-full group-hover:scale-110 transition-transform duration-500 z-0"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Gross Revenue</span>
              <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl"><FaRupeeSign className="text-lg" /></div>
            </div>
            <h3 className="text-3xl font-black text-gray-800">₹{filteredMetrics.revenue.toLocaleString('en-IN')}</h3>
            <p className="text-xs font-semibold text-gray-400 mt-2 flex items-center gap-1">
              <FaCalendarAlt /> In selected time range
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-50 rounded-full group-hover:scale-110 transition-transform duration-500 z-0"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Orders</span>
              <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl"><FaShoppingBag className="text-lg" /></div>
            </div>
            <h3 className="text-3xl font-black text-gray-800">{filteredMetrics.orders.toLocaleString()}</h3>
            <p className="text-xs font-semibold text-gray-400 mt-2 flex items-center gap-1">
              <FaCalendarAlt /> In selected time range
            </p>
          </div>
        </div>

        {/* Metric 3 (New: AOV) */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-50 rounded-full group-hover:scale-110 transition-transform duration-500 z-0"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Avg Order Value</span>
              <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl"><FaMoneyBillWave className="text-lg" /></div>
            </div>
            <h3 className="text-3xl font-black text-gray-800">₹{filteredMetrics.aov.toLocaleString('en-IN')}</h3>
            <p className="text-xs font-semibold text-gray-400 mt-2 flex items-center gap-1">
              <FaCalendarAlt /> In selected time range
            </p>
          </div>
        </div>

        {/* Metric 4 (Platform Users) */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-orange-50 rounded-full group-hover:scale-110 transition-transform duration-500 z-0"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Entities</span>
              <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl"><FaUsers className="text-lg" /></div>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div>
                <p className="text-2xl font-black text-gray-800">{data?.totalRestaurants || 0}</p>
                <p className="text-xs font-bold text-gray-400">Stores</p>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div>
                <p className="text-2xl font-black text-gray-800">{data?.totalDeliveryPersons || 0}</p>
                <p className="text-xs font-bold text-gray-400">Riders</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Big Area Chart: Revenue Trend */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 lg:p-8 shadow-sm border border-white lg:col-span-2">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Revenue & Volume Trend</h3>
              <p className="text-sm text-gray-400 font-medium mt-1">Growth mapped over the selected timeframe.</p>
            </div>
          </div>
          
          {timeSeriesData.some(d => d.orders > 0) ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e42" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f59e42" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(val) => `₹${val}`} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#4b5563' }} />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 6, strokeWidth: 0, fill: '#6366f1' }} />
                  <Area yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#f59e42" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" activeDot={{ r: 6, strokeWidth: 0, fill: '#f59e42' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <FaChartLine className="text-4xl mb-3 text-gray-300" />
              <p className="font-semibold">No trend data available</p>
            </div>
          )}
        </div>

        {/* Order Status Donut Chart */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800">Order Health</h3>
            <p className="text-sm text-gray-400 font-medium mt-1">Status distribution ratio.</p>
          </div>
          
          {statusData.length > 0 ? (
            <div className="flex-1 w-full h-64 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={4}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend layout="horizontal" verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center text for donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-8">
                <span className="text-3xl font-black text-gray-800">{filteredMetrics.orders}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Orders</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 mt-4">
              <FaChartPie className="text-4xl mb-3 text-gray-300" />
              <p className="font-semibold">No status data</p>
            </div>
          )}
        </div>

      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Performers Bar Chart */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 lg:p-8 shadow-sm border border-white">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Top Performing Stores</h3>
              <p className="text-sm text-gray-400 font-medium mt-1">Ranked by revenue generation.</p>
            </div>
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><FaStore /></div>
          </div>
          
          {topRestaurantsData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topRestaurantsData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 600 }} />
                  <RechartsTooltip content={<CustomTooltip formatterPrefix="₹" />} cursor={{ fill: '#f9fafb' }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#f59e0b" radius={[0, 8, 8, 0]} barSize={24}>
                    {topRestaurantsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#f59e0b' : '#fbbf24'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <FaFire className="text-4xl mb-3 text-gray-300" />
              <p className="font-semibold">No store data yet</p>
            </div>
          )}
        </div>

        {/* Detailed Status Grid */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 lg:p-8 shadow-sm border border-white">
           <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800">Order Stage Breakdown</h3>
            <p className="text-sm text-gray-400 font-medium mt-1">Exact counts for the selected period.</p>
          </div>
          
          {statusData.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {statusData.map((item, i) => (
                <div key={item.name} className="bg-gray-50 hover:bg-gray-100 transition-colors rounded-2xl p-4 flex items-center justify-between border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></div>
                    <span className="font-bold text-gray-700 capitalize">{item.name}</span>
                  </div>
                  <span className="text-xl font-black text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              <p className="font-semibold">No detailed status available</p>
            </div>
          )}
        </div>

      </div>

      {/* New Insights Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        
        {/* Popular Items Bar Chart */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 lg:p-8 shadow-sm border border-white">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Top Popular Dishes</h3>
              <p className="text-sm text-gray-400 font-medium mt-1">Most ordered items across the platform.</p>
            </div>
            <div className="p-3 bg-red-50 text-red-500 rounded-xl"><FaFire /></div>
          </div>
          
          {popularItemsData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularItemsData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 600 }} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                  <Bar dataKey="count" name="Orders" fill="#ef4444" radius={[0, 8, 8, 0]} barSize={24}>
                    {popularItemsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#f87171'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <p className="font-semibold">No item data yet</p>
            </div>
          )}
        </div>

        {/* Payment Method Pie Chart */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 lg:p-8 shadow-sm border border-white">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Payment Methods</h3>
              <p className="text-sm text-gray-400 font-medium mt-1">COD vs Online Payment distribution.</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl"><FaMoneyBillWave /></div>
          </div>
          
          {paymentMethodData.length > 0 ? (
             <div className="h-72 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name.includes('Online') ? '#10b981' : '#f59e0b'} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <p className="font-semibold">No payment data yet</p>
            </div>
          )}
        </div>

      </div>

      {/* New Insights Row 2 */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 lg:p-8 shadow-sm border border-white mt-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Busiest Hours (Peak Times)</h3>
            <p className="text-sm text-gray-400 font-medium mt-1">Order volume distributed by hour of the day.</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><FaChartLine /></div>
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHourly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="orders" name="Orders" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorHourly)" activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;