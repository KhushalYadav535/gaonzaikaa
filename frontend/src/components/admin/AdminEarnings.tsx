import React, { useEffect, useState } from 'react';
import { FaMoneyBillWave, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import { adminAPI } from '../../services/api';

interface EarningsData {
  period: string;
  totalEarnings: number;
  totalRevenue: number;
  totalOrders: number;
  earningsBreakdown: Array<{
    restaurantName: string;
    totalOrders: number;
    totalRevenue: number;
    totalCommission: number;
    totalDeliveryCharges: number;
    totalEarnings: number;
    commissionRate: number;
    deliveryCharge: number;
  }>;
  summary: {
    averageCommissionRate: number;
    averageOrderValue: number;
    averageEarningsPerOrder: number;
    totalDeliveryCharges: number;
    totalCommissionEarnings: number;
    deliveryChargePerOrder: number;
  };
}

const AdminEarnings: React.FC = () => {
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useEffect(() => {
    fetchEarningsData();
  }, [selectedPeriod]);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getEarnings({ period: selectedPeriod });
      if (response.data.success) {
        setEarningsData(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch earnings data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading earnings data...</div>
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

  if (!earningsData) {
    return (
      <div className="p-4 md:p-8">
        <div className="text-center">No earnings data available</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold text-amber-900 mb-4 md:mb-0">
          <FaMoneyBillWave className="inline mr-3 text-purple-600" />
          Admin Earnings
        </h1>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <FaCalendarAlt className="text-gray-600" />
            Period:
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-pink-400 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Earnings</p>
              <p className="text-3xl font-bold">{formatCurrency(earningsData.totalEarnings)}</p>
            </div>
            <FaMoneyBillWave className="text-4xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Commission Earnings</p>
              <p className="text-3xl font-bold">{formatCurrency(earningsData.summary.totalCommissionEarnings)}</p>
            </div>
            <FaChartLine className="text-4xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-400 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Delivery Charges</p>
              <p className="text-3xl font-bold">{formatCurrency(earningsData.summary.totalDeliveryCharges)}</p>
            </div>
            <div className="text-4xl opacity-80">🚚</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-400 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Commission Rate</p>
              <p className="text-3xl font-bold">{earningsData.summary.averageCommissionRate.toFixed(1)}%</p>
            </div>
            <div className="text-4xl opacity-80">📊</div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(earningsData.totalRevenue)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Orders</h3>
          <p className="text-2xl font-bold text-blue-600">
            {earningsData.totalOrders}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Delivery Charge per Order</h3>
          <p className="text-2xl font-bold text-orange-600">
            ₹{earningsData.summary.deliveryChargePerOrder}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Earnings Percentage</h3>
          <p className="text-2xl font-bold text-purple-600">
            {earningsData.totalRevenue > 0 
              ? ((earningsData.totalEarnings / earningsData.totalRevenue) * 100).toFixed(1)
              : 0}%
          </p>
        </div>
      </div>

      {/* Earnings Breakdown Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Earnings Breakdown by Restaurant</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Restaurant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Charges
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {earningsData.earningsBreakdown.map((earning, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {earning.restaurantName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{earning.totalOrders}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(earning.totalRevenue)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {earning.commissionRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-blue-600">
                      {formatCurrency(earning.totalCommission)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-orange-600">
                      {formatCurrency(earning.totalDeliveryCharges)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-600">
                      {formatCurrency(earning.totalEarnings)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {earningsData.totalEarnings > 0 
                        ? ((earning.totalEarnings / earningsData.totalEarnings) * 100).toFixed(1)
                        : 0}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {earningsData.earningsBreakdown.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No earnings data available for the selected period.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEarnings; 