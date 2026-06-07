import React, { useEffect, useState, useCallback } from 'react';
import {
  FaClipboardList, FaUtensils, FaStore, FaMoneyBillWave, FaCalendarAlt,
  FaPhone, FaMapMarkerAlt, FaUser, FaSync, FaClock, FaCheckCircle,
  FaTruck, FaTimesCircle, FaChevronDown, FaChevronUp, FaShoppingBag,
  FaExclamationTriangle, FaFilter
} from 'react-icons/fa';
import { adminAPI } from '../../services/api';
import Toast from './Toast';

interface DeliveryDetails {
  houseNumber?: string;
  apartment?: string;
  floor?: string;
  landmark?: string;
  area?: string;
  city?: string;
  pincode?: string;
  additionalInstructions?: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface Order {
  _id: string;
  orderId: string;
  createdAt: string;
  updatedAt: string;
  totalAmount: number;
  subtotal: number;
  deliveryFee: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  customerInfo: {
    name: string;
    phone: string;
    address: string;
    email?: string;
    deliveryDetails?: DeliveryDetails;
  };
  items: OrderItem[];
  restaurant?: { _id: string; name: string; cuisine?: string };
  deliveryPerson?: { name: string; phone: string };
}

interface Restaurant {
  _id: string;
  name: string;
  cuisine?: string;
}

// ── Status configuration ──────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode; next?: string }> = {
  'Order Placed':       { label: 'Order Placed',       color: 'text-yellow-700',  bg: 'bg-yellow-100',  icon: <FaClock />,           next: 'Accepted' },
  'Accepted':           { label: 'Accepted',           color: 'text-blue-700',    bg: 'bg-blue-100',    icon: <FaCheckCircle />,     next: 'Preparing' },
  'Preparing':          { label: 'Preparing',          color: 'text-orange-700',  bg: 'bg-orange-100',  icon: <FaUtensils />,        next: 'Ready for Delivery' },
  'Ready for Delivery': { label: 'Ready for Delivery', color: 'text-purple-700',  bg: 'bg-purple-100',  icon: <FaShoppingBag />,     next: 'Out for Delivery' },
  'Out for Delivery':   { label: 'Out for Delivery',   color: 'text-indigo-700',  bg: 'bg-indigo-100',  icon: <FaTruck />,           next: 'Delivered' },
  'Delivered':          { label: 'Delivered',          color: 'text-green-700',   bg: 'bg-green-100',   icon: <FaCheckCircle /> },
  'Cancelled':          { label: 'Cancelled',          color: 'text-red-700',     bg: 'bg-red-100',     icon: <FaTimesCircle /> },
};

// ── Order Card ────────────────────────────────────────────────────────────────
const OrderCard: React.FC<{
  order: Order;
  onStatusChange: (id: string, status: string) => void;
  highlight?: boolean;
}> = ({ order, onStatusChange, highlight }) => {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const statusConf = STATUS_CONFIG[order.status] || { label: order.status, color: 'text-gray-700', bg: 'bg-gray-100', icon: <FaClock /> };
  const ageMinutes = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
  const isOld = ageMinutes > 30 && order.status !== 'Delivered' && order.status !== 'Cancelled';

  const handleAdvance = async () => {
    if (!statusConf.next) return;
    setUpdating(true);
    await onStatusChange(order._id, statusConf.next);
    setUpdating(false);
  };

  const dd = order.customerInfo.deliveryDetails;
  const fullAddress = [
    dd?.houseNumber, dd?.apartment, dd?.floor && `Floor ${dd.floor}`,
    dd?.area, dd?.landmark && `Near ${dd.landmark}`, dd?.city, dd?.pincode
  ].filter(Boolean).join(', ') || order.customerInfo.address;

  return (
    <div className={`rounded-2xl shadow-lg border-2 overflow-hidden transition-all ${
      highlight ? 'border-orange-400 ring-2 ring-orange-200' :
      isOld ? 'border-red-300' : 'border-gray-100'
    } bg-white`}>
      {/* Top bar */}
      <div className={`flex items-center justify-between px-4 py-3 ${isOld ? 'bg-red-50' : 'bg-gradient-to-r from-orange-50 to-amber-50'}`}>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-gray-400">#{order.orderId?.slice(-8) || order._id.slice(-6)}</span>
          {isOld && <span className="flex items-center gap-1 text-xs text-red-600 font-semibold bg-red-100 px-2 py-0.5 rounded-full"><FaExclamationTriangle className="text-xs" /> {ageMinutes}m ago</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${statusConf.bg} ${statusConf.color}`}>
            {statusConf.icon} {statusConf.label}
          </span>
          <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Restaurant + Amount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaStore className="text-orange-400" />
            <span className="font-bold text-gray-800">{order.restaurant?.name || 'Unknown Restaurant'}</span>
            {order.restaurant?.cuisine && <span className="text-xs text-gray-400">({order.restaurant.cuisine})</span>}
          </div>
          <div className="text-right">
            <p className="font-bold text-green-700 text-lg">₹{order.totalAmount}</p>
            <p className="text-xs text-gray-400">{order.paymentMethod}</p>
          </div>
        </div>

        {/* Customer Info — ALWAYS VISIBLE */}
        <div className="bg-blue-50 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaUser className="text-blue-500 text-sm" />
              <span className="font-semibold text-gray-800">{order.customerInfo.name}</span>
            </div>
            {/* 📞 CALL BUTTON */}
            <a
              href={`tel:${order.customerInfo.phone}`}
              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition active:scale-95"
              title={`Call ${order.customerInfo.name}`}
            >
              <FaPhone className="text-xs" /> {order.customerInfo.phone}
            </a>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <FaMapMarkerAlt className="text-red-400 mt-0.5 flex-shrink-0" />
            <span className="leading-tight">{fullAddress}</span>
          </div>
          {dd?.additionalInstructions && (
            <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
              📝 {dd.additionalInstructions}
            </div>
          )}
        </div>

        {/* Delivery Person */}
        {order.deliveryPerson && (
          <div className="flex items-center justify-between bg-purple-50 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 text-sm">
              <FaTruck className="text-purple-500" />
              <span className="font-medium">{order.deliveryPerson.name}</span>
            </div>
            <a href={`tel:${order.deliveryPerson.phone}`} className="flex items-center gap-1 bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded-lg text-xs font-semibold transition">
              <FaPhone className="text-xs" /> {order.deliveryPerson.phone}
            </a>
          </div>
        )}

        {/* Expand/Collapse Items */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-between text-sm text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition"
        >
          <span className="font-medium">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</span>
          {expanded ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
        </button>

        {expanded && (
          <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
            {(order.items || []).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-xs font-bold">{item.quantity}</span>
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-800">₹{item.totalPrice || item.price * item.quantity}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Subtotal</span><span>₹{order.subtotal || order.totalAmount}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Delivery Fee</span><span>₹{order.deliveryFee || 0}</span>
              </div>
              <div className="flex justify-between font-bold text-sm">
                <span>Total</span><span className="text-green-700">₹{order.totalAmount}</span>
              </div>
            </div>
            {order.notes && <p className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">📝 {order.notes}</p>}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          {statusConf.next && (
            <button
              onClick={handleAdvance}
              disabled={updating}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition active:scale-95"
            >
              {updating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : statusConf.icon}
              {updating ? 'Updating...' : `Mark as ${statusConf.next}`}
            </button>
          )}
          {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
            <button
              onClick={() => onStatusChange(order._id, 'Cancelled')}
              className="px-3 py-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl text-sm font-medium transition"
              title="Cancel Order"
            >
              <FaTimesCircle />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const DailyOrder: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const [viewMode, setViewMode] = useState<'restaurant' | 'all'>('all');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => setToast({ message: msg, type });

  const fetchAllOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await adminAPI.getOrders({ limit: 200 });
      if (res.data.success) {
        setAllOrders(res.data.data || []);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load orders', 'error');
    } finally {
      setLoadingOrders(false);
      setLastRefresh(new Date());
    }
  }, []);

  const fetchRestaurantOrders = useCallback(async (restaurant: Restaurant) => {
    setLoadingOrders(true);
    try {
      const res = await adminAPI.getOrders({ restaurantId: restaurant._id, limit: 200 });
      if (res.data.success) {
        setOrders(res.data.data || []);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load orders', 'error');
    } finally {
      setLoadingOrders(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const res = await adminAPI.getRestaurants({ limit: 100 });
        if (res.data.success) setRestaurants(res.data.data || []);
      } finally {
        setLoadingRestaurants(false);
      }
    };
    loadRestaurants();
    fetchAllOrders();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      if (viewMode === 'all') fetchAllOrders();
      else if (selectedRestaurant) fetchRestaurantOrders(selectedRestaurant);
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, viewMode, selectedRestaurant]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await adminAPI.updateOrder(orderId, { status: newStatus });
      if (res.data.success) {
        const updated = (o: Order) => o._id === orderId ? { ...o, status: newStatus } : o;
        setAllOrders(prev => prev.map(updated));
        setOrders(prev => prev.map(updated));
        showToast(`Order updated to "${newStatus}"`);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const displayOrders = viewMode === 'all' ? allOrders : orders;
  const activeStatuses = ['Order Placed', 'Accepted', 'Preparing', 'Ready for Delivery', 'Out for Delivery'];

  const filteredOrders = displayOrders.filter(o => {
    if (statusFilter === 'active') return activeStatuses.includes(o.status);
    if (statusFilter === 'delivered') return o.status === 'Delivered';
    if (statusFilter === 'cancelled') return o.status === 'Cancelled';
    return true;
  });

  // Stats
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= todayStart);
  const activeCount = allOrders.filter(o => activeStatuses.includes(o.status)).length;
  const todayRevenue = todayOrders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.totalAmount, 0);
  const pendingCount = allOrders.filter(o => o.status === 'Order Placed').length;

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-orange-50 to-amber-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaClipboardList className="text-4xl text-orange-500" />
          <div>
            <h2 className="text-3xl font-extrabold text-amber-900">Live Orders</h2>
            <p className="text-gray-500 text-sm">Updated {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
            <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} className="w-4 h-4 accent-orange-500" />
            Auto-refresh
          </label>
          <button
            onClick={() => viewMode === 'all' ? fetchAllOrders() : selectedRestaurant && fetchRestaurantOrders(selectedRestaurant)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition active:scale-95"
          >
            <FaSync className={loadingOrders ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Today's Orders", value: todayOrders.length, color: 'from-blue-500 to-blue-600', icon: <FaCalendarAlt /> },
          { label: 'Active Orders', value: activeCount, color: 'from-orange-500 to-orange-600', icon: <FaClock /> },
          { label: 'Pending Accept', value: pendingCount, color: pendingCount > 0 ? 'from-red-500 to-red-600' : 'from-gray-400 to-gray-500', icon: <FaExclamationTriangle /> },
          { label: "Today's Revenue", value: `₹${todayRevenue.toLocaleString('en-IN')}`, color: 'from-green-500 to-green-600', icon: <FaMoneyBillWave /> },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className={`bg-gradient-to-r ${color} text-white p-4 rounded-xl shadow`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs opacity-80 mt-1">{label}</p>
              </div>
              <span className="opacity-60 text-xl">{icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* View Toggle + Status Filter */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex bg-white rounded-xl shadow p-1 gap-1">
          <button onClick={() => setViewMode('all')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${viewMode === 'all' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            All Orders
          </button>
          <button onClick={() => setViewMode('restaurant')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${viewMode === 'restaurant' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            By Restaurant
          </button>
        </div>

        <div className="flex items-center gap-2 bg-white rounded-xl shadow p-1">
          <FaFilter className="text-gray-400 ml-2" />
          {[
            { key: 'active', label: '🔴 Active' },
            { key: 'all', label: 'All' },
            { key: 'delivered', label: '✅ Delivered' },
            { key: 'cancelled', label: '❌ Cancelled' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setStatusFilter(key)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${statusFilter === key ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Restaurant Sidebar (only in restaurant mode) */}
        {viewMode === 'restaurant' && (
          <div className="lg:w-72 w-full">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-orange-700"><FaStore /> Restaurants</h3>
            {loadingRestaurants ? (
              <div className="text-center py-8 text-orange-400 animate-pulse">Loading...</div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {restaurants.map(r => {
                  const orderCount = allOrders.filter(o => o.restaurant?._id === r._id && activeStatuses.includes(o.status)).length;
                  return (
                    <div
                      key={r._id}
                      onClick={() => { setSelectedRestaurant(r); fetchRestaurantOrders(r); }}
                      className={`flex items-center justify-between gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all ${selectedRestaurant?._id === r._id ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-gray-100 bg-white hover:border-orange-300 hover:bg-orange-50/50'}`}
                    >
                      <div className="flex items-center gap-2">
                        <FaUtensils className="text-orange-400" />
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{r.name}</p>
                          {r.cuisine && <p className="text-xs text-gray-400">{r.cuisine}</p>}
                        </div>
                      </div>
                      {orderCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">{orderCount}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Orders Grid */}
        <div className="flex-1">
          {loadingOrders ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-white animate-pulse rounded-2xl shadow" />)}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow">
              <FaClipboardList className="text-5xl text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-semibold">No orders found</p>
              <p className="text-gray-300 text-sm mt-1">
                {viewMode === 'restaurant' && !selectedRestaurant ? 'Select a restaurant to view orders' : 'No orders matching the filter'}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-3 font-medium">{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found</p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredOrders
                  .sort((a, b) => {
                    // Sort: Order Placed first, then by time (newest first)
                    if (a.status === 'Order Placed' && b.status !== 'Order Placed') return -1;
                    if (b.status === 'Order Placed' && a.status !== 'Order Placed') return 1;
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                  })
                  .map(order => (
                    <OrderCard
                      key={order._id}
                      order={order}
                      onStatusChange={handleStatusChange}
                      highlight={order.status === 'Order Placed'}
                    />
                  ))}
              </div>
            </>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default DailyOrder;