import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { FaMoneyBillWave, FaCheckCircle, FaSearch, FaUser, FaFilter, FaClock } from 'react-icons/fa';

interface Payout {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  role: string;
  amount: number;
  status: string;
  transactionRef: string;
  periodStart: string;
  periodEnd: string;
  paidAt: string;
  createdAt: string;
}

const PayoutManagement: React.FC = () => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  // Modal state
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPayouts();
  }, [statusFilter, roleFilter]);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPayouts(
        statusFilter === 'all' ? undefined : statusFilter,
        roleFilter === 'all' ? undefined : roleFilter
      );
      if (res.data.success) {
        setPayouts(res.data.data);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch payouts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleMarkPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayout || !transactionRef) return;
    
    setSubmitting(true);
    try {
      const res = await adminAPI.markPayoutPaid(selectedPayout._id, transactionRef, notes);
      if (res.data.success) {
        showToast('Payout marked as paid!');
        setPayouts(payouts.map(p => p._id === selectedPayout._id ? { ...p, status: 'paid', transactionRef, paidAt: new Date().toISOString() } : p));
        closeModal();
      } else {
        showToast(res.data.message || 'Failed to update', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to mark as paid', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (payout: Payout) => {
    setSelectedPayout(payout);
    setTransactionRef('');
    setNotes('');
  };

  const closeModal = () => {
    setSelectedPayout(null);
    setTransactionRef('');
    setNotes('');
  };

  const filteredPayouts = payouts.filter(p => {
    const userMatches = p.userId?.name?.toLowerCase().includes(search.toLowerCase()) || 
                        p.userId?.phone?.includes(search) ||
                        p.userId?.email?.toLowerCase().includes(search.toLowerCase());
    return userMatches;
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FaMoneyBillWave className="text-emerald-500" /> Payouts & Settlements
        </h2>
      </div>

      {/* Filters & Stats */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="all">All Roles</option>
              <option value="Vendor">Vendors</option>
              <option value="DeliveryPerson">Delivery Staff</option>
            </select>
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg flex flex-col items-center shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Dues</span>
            <span className="text-xl font-bold">₹{payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)}</span>
          </div>
          <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg flex flex-col items-center shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Paid</span>
            <span className="text-xl font-bold">₹{payouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading payouts...</td></tr>
              ) : filteredPayouts.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No payouts found matching criteria.</td></tr>
              ) : (
                filteredPayouts.map(payout => (
                  <tr key={payout._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <FaUser className="text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{payout.userId?.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{payout.userId?.phone || 'No Phone'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${payout.role === 'Vendor' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                        {payout.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-gray-900">₹{payout.amount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{new Date(payout.periodStart).toLocaleDateString()} -</div>
                      <div>{new Date(payout.periodEnd).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payout.status === 'paid' ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Paid
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 animate-pulse">
                          Pending
                        </span>
                      )}
                      {payout.transactionRef && <div className="text-xs text-gray-500 mt-1">Ref: {payout.transactionRef}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {payout.status === 'pending' && (
                        <button 
                          onClick={() => openModal(payout)}
                          className="text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1 ml-auto"
                        >
                          <FaCheckCircle /> Settle
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settlement Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
            <div className="bg-emerald-500 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FaMoneyBillWave /> Settle Payout
              </h3>
            </div>
            <form onSubmit={handleMarkPaid} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Paying To:</p>
                <p className="font-semibold text-lg">{selectedPayout.userId?.name}</p>
                <p className="text-sm text-gray-500">{selectedPayout.role} • {selectedPayout.userId?.phone}</p>
              </div>
              <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Amount Due:</p>
                <p className="text-3xl font-bold text-gray-800">₹{selectedPayout.amount}</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Reference (UTR/UPI ID) *</label>
                <input
                  type="text"
                  required
                  value={transactionRef}
                  onChange={e => setTransactionRef(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. UPI/1234567890"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Any additional notes..."
                  rows={2}
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-4 py-2 text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-md transition-colors font-medium disabled:opacity-70 flex items-center gap-2"
                >
                  {submitting ? <FaClock className="animate-spin" /> : <FaCheckCircle />} 
                  Mark as Paid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl text-white transition-all animate-fadeIn ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <FaCheckCircle className="text-2xl" /> : <FaCheckCircle className="text-2xl" />}
          <span className="font-semibold tracking-wide">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default PayoutManagement;
