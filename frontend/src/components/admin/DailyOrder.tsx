import React, { useEffect, useState } from 'react';
import { FaClipboardList, FaUtensils, FaStore, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';
import { adminAPI } from '../../services/api';

interface Restaurant {
  _id: string;
  name: string;
  cuisine?: string;
  image?: string;
}

interface Order {
  _id: string;
  createdAt: string;
  totalAmount: number;
  // Populated fields
  restaurant?: { name: string };
}

const DailyOrder: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoadingRestaurants(true);
      try {
        const res = await adminAPI.getRestaurants({ limit: 100 });
        if (res.data.success) {
          setRestaurants(res.data.data || []);
        } else {
          setError('Failed to fetch restaurants');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch restaurants');
      } finally {
        setLoadingRestaurants(false);
      }
    };
    fetchRestaurants();
  }, []);

  const fetchOrders = async (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setLoadingOrders(true);
    setOrders([]);
    setError('');
    try {
      const res = await adminAPI.getOrders({ restaurantId: restaurant._id, limit: 100 });
      if (res.data.success) {
        setOrders(res.data.data || []);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-orange-50 to-amber-100 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <FaClipboardList className="text-4xl text-orange-500 drop-shadow" />
        <h2 className="text-3xl md:text-4xl font-extrabold text-amber-900 tracking-tight">Daily Order</h2>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Restaurant List */}
        <div className="md:w-1/3 w-full">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-700"><FaStore /> Restaurants</h3>
          {loadingRestaurants ? (
            <div className="text-center py-8 text-orange-400 animate-pulse">Loading restaurants...</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {restaurants.map(r => (
                <div
                  key={r._id}
                  className={`flex items-center gap-4 p-4 rounded-xl shadow transition-all cursor-pointer border-2 hover:scale-[1.03] hover:border-orange-400 bg-white/80 hover:bg-orange-50 ${selectedRestaurant?._id === r._id ? 'border-orange-500 bg-orange-100 scale-105 ring-2 ring-orange-200' : 'border-transparent'}`}
                  onClick={() => fetchOrders(r)}
                >
                  <div className="flex-shrink-0">
                    <FaUtensils className="text-2xl text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg text-amber-900">{r.name}</div>
                    {r.cuisine && <div className="text-xs text-gray-500">{r.cuisine}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Orders Table */}
        <div className="flex-1">
          {selectedRestaurant && (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
                <h3 className="text-xl font-bold flex items-center gap-2 text-emerald-700">
                  <FaUtensils /> Orders for: <span className="text-amber-900">{selectedRestaurant.name}</span>
                </h3>
                <div className="flex items-center gap-4 mt-2 md:mt-0">
                  <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow text-orange-700 font-semibold">
                    <FaMoneyBillWave className="text-lg" />
                    Total: <span className="text-emerald-700 font-bold text-lg">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow text-gray-600 font-semibold">
                    <FaCalendarAlt className="text-lg" />
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
              {loadingOrders ? (
                <div className="text-center py-8 text-orange-400 animate-pulse">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="text-gray-500 text-center py-8">No orders found for this restaurant.</div>
              ) : (
                <div className="overflow-x-auto rounded-xl shadow-lg bg-white/90">
                  <table className="min-w-full text-sm md:text-base">
                    <thead className="sticky top-0 z-10 bg-orange-100">
                      <tr>
                        <th className="py-3 px-4 border-b font-bold text-left">Order ID</th>
                        <th className="py-3 px-4 border-b font-bold text-left">Date/Time</th>
                        <th className="py-3 px-4 border-b font-bold text-left">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, idx) => (
                        <tr key={order._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-orange-50'}>
                          <td className="py-2 px-4 border-b font-mono text-xs md:text-sm">{order._id}</td>
                          <td className="py-2 px-4 border-b">{new Date(order.createdAt).toLocaleString()}</td>
                          <td className="py-2 px-4 border-b text-emerald-700 font-bold">₹{order.totalAmount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
          {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default DailyOrder; 