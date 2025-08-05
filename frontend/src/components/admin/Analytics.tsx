import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { FaChartLine, FaFire, FaMapMarkerAlt, FaUserFriends } from 'react-icons/fa';

// Mock data
const salesData = [
  { date: 'Mon', orders: 120, revenue: 2400 },
  { date: 'Tue', orders: 98, revenue: 2210 },
  { date: 'Wed', orders: 150, revenue: 3200 },
  { date: 'Thu', orders: 200, revenue: 4000 },
  { date: 'Fri', orders: 170, revenue: 3500 },
  { date: 'Sat', orders: 250, revenue: 5000 },
  { date: 'Sun', orders: 180, revenue: 3700 },
];
const topRestaurants = [
  { name: 'Spicy Bites', orders: 320 },
  { name: 'Pasta Palace', orders: 280 },
  { name: 'Village Dhaba', orders: 210 },
];
const topDishes = [
  { name: 'Paneer Tikka', value: 400 },
  { name: 'Spaghetti', value: 300 },
  { name: 'Dal Baati', value: 200 },
];
const orderHeatmap = [
  { village: 'Rampur', orders: 120 },
  { village: 'Lakhanpur', orders: 90 },
  { village: 'Basantpur', orders: 60 },
  { village: 'Rajpur', orders: 40 },
];
const activeUsers = 1200;
const newSignups = 45;
const repeatCustomers = 300;
const COLORS = ['#f59e42', '#6366f1', '#10b981', '#f43f5e'];

const Analytics: React.FC = () => {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-amber-900"><FaChartLine /> Analytics & Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Sales Trends */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-700"><FaChartLine /> Sales Trends</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={salesData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="orders" stroke="#f59e42" strokeWidth={3} />
              <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Top Restaurants */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-orange-700"><FaFire /> Top Restaurants</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topRestaurants} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#f59e42" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Top Dishes */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-emerald-700"><FaFire /> Top Dishes</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={topDishes} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {topDishes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Order Heatmap (by village) */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-pink-700"><FaMapMarkerAlt /> Orders by Village</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={orderHeatmap} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="village" type="category" />
              <Tooltip />
              <Bar dataKey="orders" fill="#f43f5e" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Active Users */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <FaUserFriends className="text-4xl text-indigo-500 mb-2" />
          <div className="text-2xl font-bold text-indigo-700">{activeUsers}</div>
          <div className="text-gray-500">Active Users</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <FaUserFriends className="text-4xl text-orange-500 mb-2" />
          <div className="text-2xl font-bold text-orange-700">{newSignups}</div>
          <div className="text-gray-500">New Signups (this week)</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <FaUserFriends className="text-4xl text-emerald-500 mb-2" />
          <div className="text-2xl font-bold text-emerald-700">{repeatCustomers}</div>
          <div className="text-gray-500">Repeat Customers</div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 