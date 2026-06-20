import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Toast from './Toast';
import {
  FaHandshake, FaPlus, FaEdit, FaTrash, FaTimes, FaCheck,
  FaRupeeSign, FaClipboardList, FaMoneyBillWave, FaClock,
  FaCopy, FaChevronDown, FaChevronUp, FaUserTie
} from 'react-icons/fa';

interface PayoutDetails {
  upiId?: string;
  bankAccount?: string;
  ifsc?: string;
  accountHolderName?: string;
}

interface Affiliate {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  couponCode: string;
  couponId?: {
    code: string;
    type: string;
    discount: number;
    commissionAmount: number;
    isActive: boolean;
    usedCount?: number;
    usageLimit?: number;
    validTo?: string;
  };
  commissionPerOrder: number;
  totalOrders: number;
  totalCommissionEarned: number;
  totalPaid: number;
  pendingCommission: number;
  payoutDetails?: PayoutDetails;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

interface AffiliateOrder {
  _id: string;
  orderId: string;
  totalAmount: number;
  couponDiscount: number;
  status: string;
  createdAt: string;
  restaurantId?: { name: string };
  customerInfo?: { name: string };
}

const defaultForm = {
  name: '',
  phone: '',
  email: '',
  couponCode: '',
  couponType: 'flat' as 'flat' | 'percentage' | 'free_delivery',
  discountAmount: 50,
  commissionAmount: 30,
  minOrder: 0,
  usageLimit: 1000,
  validFrom: '',
  validTo: '',
  upiId: '',
  bankAccount: '',
  ifsc: '',
  accountHolderName: '',
  notes: ''
};

const AffiliateManagement: React.FC = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [summary, setSummary] = useState({ totalPending: 0, totalPaid: 0, totalEarned: 0 });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(defaultForm);
  const [editing, setEditing] = useState<Affiliate | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  // Order history modal
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [affiliateOrders, setAffiliateOrders] = useState<AffiliateOrder[]>([]);
  const [showOrders, setShowOrders] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Payout modal
  const [payoutAffiliate, setPayoutAffiliate] = useState<Affiliate | null>(null);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutRef, setPayoutRef] = useState('');
  const [showPayout, setShowPayout] = useState(false);
  const [payingOut, setPayingOut] = useState(false);

  // Expanded rows
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') =>
    setToast({ message, type });

  const fetchAffiliates = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAffiliates();
      if (res.data.success) {
        setAffiliates(res.data.data);
        setSummary(res.data.summary || { totalPending: 0, totalPaid: 0, totalEarned: 0 });
      }
    } catch {
      showToast('Affiliates load karne mein error', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAffiliates(); }, []);

  const generateCode = (name: string) => {
    const base = name.trim().toUpperCase().replace(/\s+/g, '').slice(0, 6);
    const suffix = Math.floor(Math.random() * 90 + 10);
    return `${base}${suffix}`;
  };

  const openCreate = () => {
    setEditing(null);
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setForm({ ...defaultForm, validFrom: today, validTo: nextYear });
    setShowModal(true);
  };

  const openEdit = (a: Affiliate) => {
    setEditing(a);
    setForm({
      name: a.name, phone: a.phone, email: a.email || '',
      couponCode: a.couponCode,
      couponType: (a.couponId?.type as any) || 'flat',
      discountAmount: a.couponId?.discount || 0,
      commissionAmount: a.commissionPerOrder,
      minOrder: 0,
      usageLimit: a.couponId?.usageLimit || 1000,
      validFrom: '', validTo: '',
      upiId: a.payoutDetails?.upiId || '',
      bankAccount: a.payoutDetails?.bankAccount || '',
      ifsc: a.payoutDetails?.ifsc || '',
      accountHolderName: a.payoutDetails?.accountHolderName || '',
      notes: a.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        couponCode: form.couponCode,
        couponType: form.couponType,
        discountAmount: form.discountAmount,
        commissionAmount: form.commissionAmount,
        minOrder: form.minOrder,
        usageLimit: form.usageLimit,
        validFrom: form.validFrom || undefined,
        validTo: form.validTo || undefined,
        payoutDetails: {
          upiId: form.upiId,
          bankAccount: form.bankAccount,
          ifsc: form.ifsc,
          accountHolderName: form.accountHolderName
        },
        notes: form.notes
      };

      if (editing) {
        await adminAPI.updateAffiliate(editing._id, {
          name: form.name, phone: form.phone, email: form.email,
          commissionAmount: form.commissionAmount,
          payoutDetails: payload.payoutDetails,
          notes: form.notes
        });
        showToast('Affiliate update ho gaya ✅');
      } else {
        await adminAPI.createAffiliate(payload);
        showToast('Naya affiliate create ho gaya 🎉');
      }
      fetchAffiliates();
      setShowModal(false);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Save karne mein error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" ko deactivate karein?`)) return;
    try {
      await adminAPI.deleteAffiliate(id);
      showToast('Affiliate deactivate ho gaya');
      fetchAffiliates();
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const openOrders = async (a: Affiliate) => {
    setSelectedAffiliate(a);
    setShowOrders(true);
    setLoadingOrders(true);
    try {
      const res = await adminAPI.getAffiliateOrders(a._id);
      setAffiliateOrders(res.data.data || []);
    } catch {
      showToast('Orders load karne mein error', 'error');
    } finally {
      setLoadingOrders(false);
    }
  };

  const openPayout = (a: Affiliate) => {
    setPayoutAffiliate(a);
    setPayoutAmount(String(a.pendingCommission));
    setPayoutRef('');
    setShowPayout(true);
  };

  const handlePayout = async () => {
    if (!payoutAffiliate) return;
    setPayingOut(true);
    try {
      await adminAPI.payoutAffiliate(payoutAffiliate._id, {
        amount: Number(payoutAmount),
        transactionRef: payoutRef
      });
      showToast(`₹${payoutAmount} payout done! ✅`);
      setShowPayout(false);
      fetchAffiliates();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Payout failed', 'error');
    } finally {
      setPayingOut(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast('Coupon code copied!');
  };

  const totalAffiliates = affiliates.length;

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-amber-900 flex items-center gap-3">
          <FaHandshake className="text-orange-500" /> Affiliate Program
        </h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow transition active:scale-95"
        >
          <FaPlus /> Add Affiliate
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Affiliates', value: totalAffiliates, icon: <FaUserTie />, color: 'from-indigo-500 to-indigo-600' },
          { label: 'Total Earned', value: `₹${summary.totalEarned.toLocaleString('en-IN')}`, icon: <FaRupeeSign />, color: 'from-green-500 to-green-600' },
          { label: 'Pending Payout', value: `₹${summary.totalPending.toLocaleString('en-IN')}`, icon: <FaClock />, color: 'from-amber-500 to-amber-600' },
          { label: 'Total Paid', value: `₹${summary.totalPaid.toLocaleString('en-IN')}`, icon: <FaMoneyBillWave />, color: 'from-blue-500 to-blue-600' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`bg-gradient-to-r ${color} text-white p-4 rounded-xl shadow`}>
            <div className="text-2xl mb-1">{icon}</div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs opacity-80 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Affiliates Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading affiliates...</div>
      ) : affiliates.length === 0 ? (
        <div className="text-center py-16">
          <FaHandshake className="text-6xl text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Abhi tak koi affiliate nahi hai</p>
          <button onClick={openCreate} className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-orange-600">
            Pehla Affiliate Add Karein
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {affiliates.map((a) => (
            <div key={a._id} className="bg-white rounded-2xl shadow border border-orange-50 overflow-hidden">
              {/* Main Row */}
              <div className="p-4 flex flex-wrap items-center gap-4">
                {/* Avatar + Name */}
                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-lg shadow">
                    {a.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{a.name}</p>
                    <p className="text-xs text-gray-400">{a.phone}</p>
                    {a.email && <p className="text-xs text-gray-400">{a.email}</p>}
                  </div>
                </div>

                {/* Coupon Code */}
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg text-sm tracking-widest">
                    {a.couponCode}
                  </span>
                  <button
                    onClick={() => copyCode(a.couponCode)}
                    className="text-gray-400 hover:text-indigo-600 transition"
                    title="Copy code"
                  >
                    <FaCopy className="text-sm" />
                  </button>
                </div>

                {/* Discount Given to Customer */}
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-0.5">Customer Discount</p>
                  <span className="font-bold text-green-600 text-sm">
                    {a.couponId?.type === 'percentage'
                      ? `${a.couponId.discount}% Off`
                      : a.couponId?.type === 'flat'
                        ? `₹${a.couponId.discount} Off`
                        : 'Free Delivery'}
                  </span>
                </div>

                {/* Commission */}
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-0.5">Commission/Order</p>
                  <span className="font-bold text-orange-600 text-sm">₹{a.commissionPerOrder}</span>
                </div>

                {/* Stats */}
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-0.5">Orders</p>
                    <p className="font-bold text-gray-700">{a.totalOrders}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-0.5">Earned</p>
                    <p className="font-bold text-green-600">₹{a.totalCommissionEarned}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-0.5">Pending</p>
                    <p className={`font-bold ${a.pendingCommission > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                      ₹{a.pendingCommission}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-0.5">Paid</p>
                    <p className="font-bold text-blue-600">₹{a.totalPaid}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-auto">
                  {a.pendingCommission > 0 && (
                    <button
                      onClick={() => openPayout(a)}
                      className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                    >
                      <FaMoneyBillWave /> Pay ₹{a.pendingCommission}
                    </button>
                  )}
                  <button
                    onClick={() => openOrders(a)}
                    className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                    title="View Orders"
                  >
                    <FaClipboardList className="text-sm" />
                  </button>
                  <button
                    onClick={() => openEdit(a)}
                    className="p-1.5 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition"
                    title="Edit"
                  >
                    <FaEdit className="text-sm" />
                  </button>
                  <button
                    onClick={() => handleDelete(a._id, a.name)}
                    className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition"
                    title="Delete"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === a._id ? null : a._id)}
                    className="p-1.5 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition"
                  >
                    {expandedId === a._id ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
                  </button>
                </div>
              </div>

              {/* Expanded Payout Details */}
              {expandedId === a._id && (
                <div className="border-t border-orange-50 px-5 py-4 bg-orange-50/30 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">UPI ID</p>
                    <p className="text-gray-700">{a.payoutDetails?.upiId || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Bank Account</p>
                    <p className="text-gray-700">{a.payoutDetails?.bankAccount || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">IFSC</p>
                    <p className="text-gray-700">{a.payoutDetails?.ifsc || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Notes</p>
                    <p className="text-gray-700">{a.notes || '—'}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── CREATE / EDIT MODAL ─────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaHandshake className="text-orange-500" />
                {editing ? 'Affiliate Edit Karein' : 'Naya Affiliate Banayein'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              {/* Personal Info */}
              <div>
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3">Personal Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Naam *</label>
                    <input
                      required
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                      placeholder="e.g. Raju Sharma"
                      value={form.name}
                      onChange={e => {
                        const name = e.target.value;
                        setForm(f => ({
                          ...f,
                          name,
                          couponCode: editing ? f.couponCode : generateCode(name)
                        }));
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Phone *</label>
                    <input
                      required
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                      placeholder="9876543210"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                      placeholder="raju@example.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Coupon Settings */}
              {!editing && (
                <div>
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3">Coupon Settings</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Coupon Code *</label>
                      <div className="flex gap-2">
                        <input
                          required
                          className="flex-1 border rounded-lg px-3 py-2 text-sm uppercase font-mono tracking-widest focus:ring-2 focus:ring-orange-400 focus:outline-none"
                          placeholder="e.g. RAJU50"
                          value={form.couponCode}
                          onChange={e => setForm(f => ({ ...f, couponCode: e.target.value.toUpperCase() }))}
                        />
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, couponCode: generateCode(form.name || 'AFF') }))}
                          className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold hover:bg-orange-200"
                        >
                          Auto
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Coupon Type</label>
                      <select
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-orange-400 focus:outline-none"
                        value={form.couponType}
                        onChange={e => setForm(f => ({ ...f, couponType: e.target.value as any }))}
                      >
                        <option value="flat">Flat ₹ Off (Customer ko)</option>
                        <option value="percentage">% Off (Customer ko)</option>
                        <option value="free_delivery">Free Delivery</option>
                      </select>
                    </div>
                    {form.couponType !== 'free_delivery' && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Customer Discount {form.couponType === 'percentage' ? '%' : '₹'}
                        </label>
                        <input
                          type="number" min="0"
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                          value={form.discountAmount}
                          onChange={e => setForm(f => ({ ...f, discountAmount: Number(e.target.value) }))}
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Min. Order (₹)</label>
                      <input
                        type="number" min="0"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                        value={form.minOrder}
                        onChange={e => setForm(f => ({ ...f, minOrder: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Usage Limit</label>
                      <input
                        type="number" min="1"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                        value={form.usageLimit}
                        onChange={e => setForm(f => ({ ...f, usageLimit: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Valid From</label>
                      <input
                        type="date"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                        value={form.validFrom}
                        onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Valid To</label>
                      <input
                        type="date"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                        value={form.validTo}
                        onChange={e => setForm(f => ({ ...f, validTo: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Commission */}
              <div>
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3">Commission (Affiliate Ko)</p>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Commission per Order (₹) *
                    <span className="ml-1 text-gray-400 font-normal">— Har order par affiliate ko kitna milega</span>
                  </label>
                  <input
                    required
                    type="number" min="0"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                    value={form.commissionAmount}
                    onChange={e => setForm(f => ({ ...f, commissionAmount: Number(e.target.value) }))}
                  />
                  {form.couponType !== 'free_delivery' && (
                    <p className="text-xs text-gray-400 mt-1">
                      💡 Customer ko: ₹{form.discountAmount} off | Affiliate ko: ₹{form.commissionAmount} commission
                    </p>
                  )}
                </div>
              </div>

              {/* Payout Details */}
              <div>
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3">Payout Details (Optional)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">UPI ID</label>
                    <input
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                      placeholder="raju@upi"
                      value={form.upiId}
                      onChange={e => setForm(f => ({ ...f, upiId: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Bank Account</label>
                    <input
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                      placeholder="Account Number"
                      value={form.bankAccount}
                      onChange={e => setForm(f => ({ ...f, bankAccount: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">IFSC Code</label>
                    <input
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none uppercase"
                      placeholder="SBIN0001234"
                      value={form.ifsc}
                      onChange={e => setForm(f => ({ ...f, ifsc: e.target.value.toUpperCase() }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Account Holder Name</label>
                    <input
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                      placeholder="Raju Sharma"
                      value={form.accountHolderName}
                      onChange={e => setForm(f => ({ ...f, accountHolderName: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                    <textarea
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none resize-none"
                      rows={2}
                      placeholder="Koi extra information..."
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FaCheck />}
                  {saving ? 'Saving...' : editing ? 'Update Karein' : 'Affiliate Banayein'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── ORDER HISTORY MODAL ─────────────────────────────────────── */}
      {showOrders && selectedAffiliate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{selectedAffiliate.name} — Orders</h3>
                <p className="text-xs text-gray-400">Coupon: <span className="font-mono font-bold text-indigo-600">{selectedAffiliate.couponCode}</span></p>
              </div>
              <button onClick={() => setShowOrders(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <div className="p-5">
              {loadingOrders ? (
                <div className="text-center py-8 text-gray-400">Loading orders...</div>
              ) : affiliateOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-400">Abhi tak koi order nahi aaya is coupon se</div>
              ) : (
                <div className="space-y-2">
                  {affiliateOrders.map(order => (
                    <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border">
                      <div>
                        <p className="font-mono font-bold text-indigo-700 text-sm">{order.orderId}</p>
                        <p className="text-xs text-gray-400">{order.customerInfo?.name} | {order.restaurantId?.name}</p>
                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-700">₹{order.totalAmount}</p>
                        <p className="text-xs text-green-600">Discount: ₹{order.couponDiscount || 0}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : order.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── PAYOUT MODAL ─────────────────────────────────────────────── */}
      {showPayout && payoutAffiliate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-800">💰 Commission Payout</h3>
              <button onClick={() => setShowPayout(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="font-bold text-amber-800">{payoutAffiliate.name}</p>
                <p className="text-sm text-amber-600">Pending Commission: <span className="font-bold text-lg">₹{payoutAffiliate.pendingCommission}</span></p>
                {payoutAffiliate.payoutDetails?.upiId && (
                  <p className="text-xs text-amber-600 mt-1">UPI: {payoutAffiliate.payoutDetails.upiId}</p>
                )}
                {payoutAffiliate.payoutDetails?.bankAccount && (
                  <p className="text-xs text-amber-600">Bank: {payoutAffiliate.payoutDetails.bankAccount} | IFSC: {payoutAffiliate.payoutDetails.ifsc}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Pay Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  max={payoutAffiliate.pendingCommission}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                  value={payoutAmount}
                  onChange={e => setPayoutAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Transaction Reference (Optional)</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                  placeholder="UTR / Transaction ID"
                  value={payoutRef}
                  onChange={e => setPayoutRef(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePayout}
                  disabled={payingOut || !payoutAmount}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {payingOut ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FaCheck />}
                  {payingOut ? 'Processing...' : 'Mark as Paid'}
                </button>
                <button
                  onClick={() => setShowPayout(false)}
                  className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AffiliateManagement;
