import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { FaMoneyBillWave, FaCheckCircle, FaSearch, FaStore, FaFileInvoiceDollar, FaCheckSquare } from 'react-icons/fa';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

interface Order {
  _id: string;
  orderId: string;
  totalAmount: number;
  status: string;
  vendorPaymentStatus: 'Pending' | 'Settled';
  vendorPaymentDate: string | null;
  createdAt: string;
  deliveryPersonId?: string;
  customerInfo?: { phone?: string; email?: string };
  deliveryFee?: number;
  items?: OrderItem[];
}

interface Vendor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  restaurantId: string;
}

const PayoutManagement: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  
  // Tabs: 'pending' or 'settled'
  const [activeTab, setActiveTab] = useState<'pending' | 'settled'>('pending');
  
  // Selection
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [settling, setSettling] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (selectedVendorId) {
      fetchVendorOrders(selectedVendorId);
      setSelectedOrderIds(new Set()); // Reset selection
    } else {
      setOrders([]);
    }
  }, [selectedVendorId]);

  const fetchVendors = async () => {
    try {
      const res = await adminAPI.getVendors();
      if (res.data.success) {
        setVendors(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch vendors', err);
    }
  };

  const fetchVendorOrders = async (vendorId: string) => {
    setLoading(true);
    try {
      const res = await adminAPI.getVendorSettlementOrders(vendorId);
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch vendor orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const pendingIds = orders.filter(o => o.vendorPaymentStatus !== 'Settled').map(o => o._id);
      setSelectedOrderIds(new Set(pendingIds));
    } else {
      setSelectedOrderIds(new Set());
    }
  };

  const handleSelectOrder = (id: string) => {
    const newSelection = new Set(selectedOrderIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedOrderIds(newSelection);
  };

  const handleSettle = async () => {
    if (selectedOrderIds.size === 0) return;
    
    setSettling(true);
    try {
      const res = await adminAPI.settleVendorOrders(Array.from(selectedOrderIds));
      if (res.data.success) {
        showToast(`Successfully settled ${selectedOrderIds.size} orders!`);
        // Refresh orders
        fetchVendorOrders(selectedVendorId);
        setSelectedOrderIds(new Set());
      } else {
        showToast(res.data.message || 'Failed to settle orders', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to settle orders', 'error');
    } finally {
      setSettling(false);
    }
  };

  // Derived state
  // Filter out Cancelled orders completely as they shouldn't be paid for
  const validOrders = orders.filter(o => o.status !== 'Cancelled');
  const pendingOrders = validOrders.filter(o => o.vendorPaymentStatus !== 'Settled');
  const settledOrders = validOrders.filter(o => o.vendorPaymentStatus === 'Settled');
  
  const displayedOrders = activeTab === 'pending' ? pendingOrders : settledOrders;
  
  // Detect shared delivery batches (same CUSTOMER on the same day)
  const getSharedCount = (order: Order, contextOrders: Order[]) => {
    const customerId = order.customerInfo?.phone || order.customerInfo?.email;
    if (!customerId) return 1;
    
    const dateStr = new Date(order.createdAt).toDateString();
    return contextOrders.filter(o => {
      const oCustomerId = o.customerInfo?.phone || o.customerInfo?.email;
      return oCustomerId === customerId && new Date(o.createdAt).toDateString() === dateStr;
    }).length;
  };

  // Calculate Vendor Payout: Total Amount - 10% commission - Pro-rated dynamic delivery charge
  const calculatePayout = (order: Order, contextOrders: Order[]) => {
    const amount = order.totalAmount || 0;
    const commission = amount * 0.10;
    const sharedCount = getSharedCount(order, contextOrders);
    const dynamicDeliveryCharge = order.deliveryFee ?? 30; // fallback to 30 if missing
    const deliveryCharge = dynamicDeliveryCharge / (sharedCount || 1);
    return Math.max(0, amount - commission - deliveryCharge);
  };

  // Calculate totals based on their respective context lists
  const totalPendingAmount = pendingOrders.reduce((sum, o) => sum + calculatePayout(o, pendingOrders), 0);
  const totalSettledAmount = settledOrders.reduce((sum, o) => sum + calculatePayout(o, settledOrders), 0);
  
  // For selected amount, context is the selected orders
  const selectedOrdersList = validOrders.filter(o => selectedOrderIds.has(o._id));
  const selectedAmount = selectedOrdersList.reduce((sum, o) => sum + calculatePayout(o, selectedOrdersList), 0);

  return (
    <div className="p-8 pb-24">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FaMoneyBillWave className="text-emerald-500" /> Vendor Settlements
        </h2>
      </div>

      {/* Vendor Selector & Stats */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col lg:flex-row gap-6 justify-between">
        <div className="w-full lg:w-1/3">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Vendor</label>
          <div className="relative">
            <FaStore className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-gray-800 appearance-none shadow-sm"
            >
              <option value="">-- Choose a Vendor --</option>
              {vendors.map(v => (
                <option key={v._id} value={v._id}>{v.name} ({v.phone})</option>
              ))}
            </select>
          </div>
        </div>
        
        {selectedVendorId && (
          <div className="flex gap-4 w-full lg:w-auto">
            <div className="bg-orange-50 border border-orange-100 text-orange-800 px-6 py-3 rounded-xl flex flex-col justify-center flex-1 lg:flex-none min-w-[150px]">
              <span className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Unpaid Dues</span>
              <span className="text-2xl font-bold flex items-center gap-1">₹{totalPendingAmount.toFixed(2)}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-6 py-3 rounded-xl flex flex-col justify-center flex-1 lg:flex-none min-w-[150px]">
              <span className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Total Paid</span>
              <span className="text-2xl font-bold flex items-center gap-1">₹{totalSettledAmount.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Orders List Area */}
      {selectedVendorId ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-6 pt-4 gap-6 bg-gray-50/50">
            <button 
              onClick={() => setActiveTab('pending')}
              className={`pb-4 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'pending' ? 'border-orange-500 text-orange-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Pending Settlement ({pendingOrders.length})
            </button>
            <button 
              onClick={() => setActiveTab('settled')}
              className={`pb-4 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'settled' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Settled / Paid ({settledOrders.length})
            </button>
          </div>

          {/* Action Bar (Only for Pending tab) */}
          {activeTab === 'pending' && pendingOrders.length > 0 && (
            <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={selectedOrderIds.size === pendingOrders.length && pendingOrders.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {selectedOrderIds.size} selected
                </span>
              </div>
              
              <button 
                disabled={selectedOrderIds.size === 0 || settling}
                onClick={handleSettle}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-bold shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {settling ? 'Processing...' : (
                  <>
                    <FaCheckSquare /> Mark Selected as Paid (₹{selectedAmount.toFixed(2)})
                  </>
                )}
              </button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {activeTab === 'pending' && <th className="w-16 px-6 py-4"></th>}
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID & Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order Total</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-emerald-600 uppercase tracking-wider">Payout (Vendor Gets)</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vendor Payment</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading orders...</td></tr>
                ) : displayedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <FaFileInvoiceDollar className="text-5xl mb-4 text-gray-300" />
                        <p className="text-lg font-medium text-gray-600">No {activeTab} orders found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedOrders.map(order => (
                    <React.Fragment key={order._id}>
                    <tr 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                    >
                      {activeTab === 'pending' && (
                        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            checked={selectedOrderIds.has(order._id)}
                            onChange={() => handleSelectOrder(order._id)}
                            className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-800">#{order.orderId}</div>
                        <div className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString()}</div>
                        {order.items && <div className="text-[10px] font-bold text-indigo-500 mt-1">Tap to view {order.items.length} items</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">₹{order.totalAmount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const context = activeTab === 'pending' ? pendingOrders : settledOrders;
                          const payout = calculatePayout(order, context);
                          const shared = getSharedCount(order, context);
                          const dynamicDeliveryCharge = order.deliveryFee ?? 30;
                          const deliveryFee = dynamicDeliveryCharge / (shared || 1);
                          return (
                            <>
                              <div className="text-lg font-bold text-emerald-600">₹{payout.toFixed(2)}</div>
                              <div className="text-[10px] text-gray-400 mt-1">
                                -10% fee, -₹{deliveryFee.toFixed(2)} del
                                {shared > 1 && ` (Shared by ${shared})`}
                              </div>
                            </>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-blue-100 text-blue-800">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.vendorPaymentStatus === 'Settled' ? (
                          <div className="flex flex-col items-start gap-1">
                            <span className="px-3 py-1 inline-flex text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                              <FaCheckCircle className="mr-1" /> Paid
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">on {new Date(order.vendorPaymentDate || '').toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="px-3 py-1 inline-flex text-xs font-bold rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                    
                    {/* Expanded Items Row */}
                    {expandedOrderId === order._id && order.items && order.items.length > 0 && (
                      <tr className="bg-indigo-50/30 border-b border-indigo-100">
                        <td colSpan={activeTab === 'pending' ? 6 : 5} className="px-8 py-4">
                          <div className="bg-white border border-indigo-100 rounded-xl p-4 shadow-sm w-full max-w-2xl">
                            <h4 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
                              <FaFileInvoiceDollar className="text-indigo-500" /> Order Items ({order.items.length})
                            </h4>
                            <div className="space-y-2">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                  <div className="flex gap-3 text-gray-700 items-center">
                                    <span className="font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs">{item.quantity}x</span>
                                    <span className="font-medium">{item.name}</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="text-xs text-gray-400">@ ₹{item.price}</span>
                                    <span className="font-bold text-gray-800 w-12 text-right">₹{item.totalPrice || (item.price * item.quantity)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-dashed border-gray-200 flex justify-end">
                              <div className="text-xs text-gray-500">
                                Subtotal (Items): <span className="font-bold text-gray-800 text-sm ml-2">
                                  ₹{order.items.reduce((sum, item) => sum + (item.totalPrice || (item.price * item.quantity)), 0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center flex flex-col items-center justify-center">
          <FaStore className="text-6xl text-gray-200 mb-4" />
          <h3 className="text-xl font-bold text-gray-700">Select a Vendor to manage settlements</h3>
          <p className="text-gray-500 mt-2 max-w-md">Choose a vendor from the dropdown above to view their delivered orders and settle pending payments.</p>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl text-white transition-all animate-fadeIn ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          <FaCheckCircle className="text-2xl" />
          <span className="font-semibold tracking-wide">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default PayoutManagement;
