import React, { useState, useEffect } from 'react';
import Toast from './Toast';
import { FaSearch, FaUser, FaStore, FaInfoCircle, FaListUl, FaTruck, FaCheckCircle, FaClock, FaUtensils } from 'react-icons/fa';
import { adminAPI } from '../../services/api';

interface Order {
  _id: string;
  orderId: string;
  restaurantId?: any;
  customerInfo: {
    name: string;
    phone: string;
    address: string;
    email?: string;
  };
  status: string;
  totalAmount: number;
  items?: { name: string; quantity: number; price: number; totalPrice: number }[];
  deliveryPersonId?: any;
  createdAt?: string;
  updatedAt?: string;
  // Populated fields
  restaurant?: { name: string; cuisine: string };
  deliveryPerson?: { name: string; phone: string };
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  // Details modal state
  const [showDetails, setShowDetails] = useState(false);
  const [detailsOrder, setDetailsOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getOrders();
        console.log('Orders response:', response.data); // Debug log
        if (response.data.success) {
          setOrders(response.data.data || []);
        } else {
          setError('Failed to load orders.');
        }
      } catch (err: any) {
        console.error('Error fetching orders:', err); // Debug log
        setError(err.response?.data?.message || 'Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await adminAPI.updateOrder(id, { status });
      
      if (response.data.success) {
        setOrders(orders => orders.map(order => order._id === id ? response.data.data : order));
        showToast('Order status updated successfully.');
      } else {
        showToast(response.data.message || 'Failed to update order status.', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update order status.', 'error');
    }
  };

  const handleAssignStaff = (orderId: string, staffId: string) => {
    // Note: This would need to be implemented in the backend
    showToast('Staff assignment functionality not implemented yet.', 'error');
  };

  const handleStatusUpdate = (orderId: string, nextStatus: string) => {
    // Note: This would need to be implemented in the backend
    showToast('Status update functionality not implemented yet.', 'error');
  };

  // Details modal handlers
  const openDetails = (order: Order) => {
    setDetailsOrder(order);
    setShowDetails(true);
  };
  const closeDetails = () => {
    setShowDetails(false);
    setDetailsOrder(null);
  };

  // deliveryStaff would be fetched from backend in a real app
  const deliveryStaff: { id: number; name: string }[] = [];
  const statusSteps = [
    { key: 'placed', label: 'Placed', icon: <FaClock /> },
    { key: 'accepted', label: 'Accepted', icon: <FaCheckCircle /> },
    { key: 'preparing', label: 'Preparing', icon: <FaUtensils /> },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: <FaTruck /> },
    { key: 'delivered', label: 'Delivered', icon: <FaCheckCircle /> },
  ];

  const filteredOrders = orders.filter(order =>
    order.customerInfo.name.toLowerCase().includes(search.toLowerCase()) ||
    order.restaurant?.name.toLowerCase().includes(search.toLowerCase())
  );
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-4 text-amber-900">Order Management</h2>
      {loading ? <div>Loading orders...</div> : error ? <div className="text-red-500">{error}</div> : <>
      <input
        className="border p-2 rounded mb-4 w-full md:w-1/3 pl-10 focus:ring-2 focus:ring-orange-400 focus:outline-none transition"
        placeholder="Search orders by customer or restaurant..."
        value={search}
        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
        style={{ position: 'relative' }}
      />
      <FaSearch className="absolute left-4 top-24 md:top-24 text-orange-400" style={{ pointerEvents: 'none' }} />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-orange-50">
              <th className="py-2 px-4 border-b">Customer</th>
              <th className="py-2 px-4 border-b">Restaurant</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order, idx) => (
              <tr key={order._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-orange-50'}>
                <td className="py-2 px-4 border-b group transition hover:bg-orange-100">{order.customerInfo.name || 'N/A'}</td>
                <td className="py-2 px-4 border-b group transition hover:bg-orange-100">{order.restaurant?.name || 'N/A'}</td>
                <td className="py-2 px-4 border-b group transition hover:bg-orange-100">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    order.status === 'placed' ? 'bg-yellow-100 text-yellow-700' : 
                    order.status === 'accepted' ? 'bg-blue-100 text-blue-700' : 
                    order.status === 'preparing' ? 'bg-orange-100 text-orange-700' : 
                    order.status === 'out_for_delivery' ? 'bg-purple-100 text-purple-700' : 
                    order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                    'bg-gray-100 text-gray-700'
                  }`}>{order.status.replace('_', ' ')}</span>
                  <div className="mt-2 flex items-center gap-2">
                    <FaTruck className="text-orange-400" />
                    <span className="text-xs text-gray-600">
                      {order.deliveryPerson?.name || 'Unassigned'}
                    </span>
                  </div>
                </td>
                <td className="py-2 px-4 border-b flex flex-wrap gap-2 group transition hover:bg-orange-100">
                  <button className="bg-indigo-500 text-white px-2 py-1 rounded transition hover:bg-indigo-600 active:scale-95" onClick={() => openDetails(order)}>Details</button>
                  <select
                    className="border p-1 rounded mr-2"
                    value={order.status}
                    onChange={e => handleStatusChange(order._id, e.target.value)}
                  >
                    <option value="placed">Placed</option>
                    <option value="accepted">Accepted</option>
                    <option value="preparing">Preparing</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
      </>}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {/* Details Modal */}
      {showDetails && detailsOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fadeIn">
            <button className="absolute top-2 right-2 text-2xl" onClick={closeDetails}>&times;</button>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-orange-700"><FaInfoCircle /> Order Details</h3>
            <div className="mb-2 flex items-center gap-2"><FaUser className="text-orange-400" /><span className="font-semibold">Customer:</span> {detailsOrder.customerInfo.name || 'N/A'}</div>
            <div className="mb-2 flex items-center gap-2"><FaStore className="text-orange-400" /><span className="font-semibold">Restaurant:</span> {detailsOrder.restaurant?.name || 'N/A'}</div>
            <div className="mb-2"><span className="font-semibold">Contact:</span> {detailsOrder.customerInfo.phone || 'N/A'}</div>
            <div className="mb-2"><span className="font-semibold">Status:</span> {detailsOrder.status}</div>
            <div className="mb-2 flex items-center gap-2"><FaTruck className="text-orange-400" /><span className="font-semibold">Delivery Person:</span> {detailsOrder.deliveryPerson?.name || 'Unassigned'}</div>
            <div className="mb-4">
              <span className="font-semibold flex items-center gap-2"><FaListUl className="text-orange-400" /> Items:</span>
              <ul className="ml-4 mt-1">
                {(detailsOrder.items || []).map((item, idx) => (
                  <li key={idx}>{item.name} x{item.quantity} - ₹{item.price}</li>
                ))}
              </ul>
            </div>
            {/* Order Amount */}
            <div className="mb-4">
              <div className="font-semibold">Total Amount: ₹{detailsOrder.totalAmount}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement; 