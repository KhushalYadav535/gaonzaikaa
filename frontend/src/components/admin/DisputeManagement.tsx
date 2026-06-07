import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { FaHeadset, FaSearch, FaFilter, FaCheckCircle, FaTimes, FaUndo, FaSave } from 'react-icons/fa';

interface Dispute {
  _id: string;
  orderId: string;
  customerInfo: { name: string; phone: string; email: string };
  restaurantId: { name: string };
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  refundStatus: 'requested' | 'processing' | 'refunded' | 'rejected';
  disputeNotes: string;
  createdAt: string;
}

const DisputeManagement: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getDisputes();
      if (res.data.success) {
        setDisputes(res.data.data);
      }
    } catch (err) {
      showToast('Failed to fetch disputes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setNotes(dispute.disputeNotes || '');
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedDispute) return;
    setUpdating(true);
    try {
      const res = await adminAPI.updateRefundStatus(selectedDispute._id, {
        refundStatus: status,
        disputeNotes: notes
      });
      if (res.data.success) {
        showToast(`Refund marked as ${status}`);
        fetchDisputes();
        setSelectedDispute(null);
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const filteredDisputes = disputes.filter(d => {
    if (statusFilter !== 'all' && d.refundStatus !== statusFilter) return false;
    if (search && !d._id.includes(search) && !d.customerInfo?.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaHeadset className="text-red-500" /> Refunds & Disputes
          </h2>
          <p className="text-gray-500 mt-1">Manage customer refund requests and order disputes.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center border border-gray-100">
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="requested">Requested</option>
              <option value="processing">Processing</option>
              <option value="refunded">Refunded</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refund Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading disputes...</td></tr>
            ) : filteredDisputes.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No active disputes or refund requests found.</td></tr>
            ) : (
              filteredDisputes.map(dispute => (
                <tr key={dispute._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">#{dispute._id.substring(dispute._id.length - 8)}</div>
                    <div className="text-xs text-gray-500 mt-1">{dispute.restaurantId?.name || 'Unknown Restaurant'}</div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(dispute.createdAt).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{dispute.customerInfo?.name || 'Unknown User'}</div>
                    <div className="text-xs text-gray-500 mt-1">{dispute.customerInfo?.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">₹{dispute.totalAmount}</div>
                    <div className="text-xs text-gray-500 mt-1 bg-gray-100 px-2 py-0.5 rounded-full inline-block">{dispute.paymentMethod}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border 
                      ${dispute.refundStatus === 'requested' ? 'bg-orange-50 text-orange-700 border-orange-200 animate-pulse' : 
                        dispute.refundStatus === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        dispute.refundStatus === 'refunded' ? 'bg-green-50 text-green-700 border-green-200' :
                        'bg-red-50 text-red-700 border-red-200'}`}
                    >
                      {dispute.refundStatus.charAt(0).toUpperCase() + dispute.refundStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button 
                      onClick={() => handleOpenModal(dispute)}
                      className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Review Case
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-fadeIn">
            <div className="bg-red-500 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FaHeadset /> Review Dispute #{selectedDispute._id.substring(selectedDispute._id.length - 8)}
              </h3>
              <button onClick={() => setSelectedDispute(null)} className="text-white hover:text-red-200 transition-colors">
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-gray-500 mb-1">Customer</p>
                  <p className="font-bold text-gray-800">{selectedDispute.customerInfo?.name}</p>
                  <p className="text-gray-600">{selectedDispute.customerInfo?.phone}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-gray-500 mb-1">Payment</p>
                  <p className="font-bold text-gray-800">₹{selectedDispute.totalAmount}</p>
                  <p className="text-gray-600">{selectedDispute.paymentMethod} ({selectedDispute.paymentStatus})</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Admin Notes / Resolution Log</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none h-32 resize-none"
                  placeholder="Record discussion with customer, reason for refund, UTR details..."
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-bold text-gray-700 mb-3">Update Status Action</p>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleUpdateStatus('processing')}
                    disabled={updating}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Set Processing
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus('refunded')}
                    disabled={updating}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <FaUndo /> Issue Refund
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus('rejected')}
                    disabled={updating}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Reject Claim
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl text-white transition-all animate-fadeIn ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          <FaCheckCircle className="text-2xl" />
          <span className="font-semibold tracking-wide">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default DisputeManagement;
