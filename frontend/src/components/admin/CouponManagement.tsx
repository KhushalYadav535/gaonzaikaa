import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Toast from './Toast';
import { FaGift, FaPlus, FaEdit, FaTrash, FaTimes, FaCheck, FaToggleOn, FaToggleOff } from 'react-icons/fa';

interface Coupon {
  _id: string;
  code: string;
  description: string;
  type: 'percentage' | 'flat' | 'free_delivery';
  discount: number;
  maxDiscount?: number;
  minOrder: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

const defaultForm = {
  code: '', description: '', type: 'percentage' as const,
  discount: 10, minOrder: 0, maxDiscount: undefined as number | undefined,
  usageLimit: 100, validFrom: '', validTo: '', isActive: true
};

const CouponManagement: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(defaultForm);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getCoupons();
      if (res.data.success) setCoupons(res.data.data);
    } catch {
      showToast('Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openCreate = () => {
    setEditing(null);
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setForm({ ...defaultForm, validFrom: today, validTo: nextMonth });
    setShowModal(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code, description: c.description || '', type: c.type,
      discount: c.discount, minOrder: c.minOrder, maxDiscount: c.maxDiscount,
      usageLimit: c.usageLimit, validFrom: c.validFrom?.split('T')[0] || '',
      validTo: c.validTo?.split('T')[0] || '', isActive: c.isActive
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await adminAPI.updateCoupon(editing._id, form);
        showToast('Coupon updated ✅');
      } else {
        await adminAPI.createCoupon(form);
        showToast('Coupon created 🎉');
      }
      fetchCoupons();
      setShowModal(false);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save coupon', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await adminAPI.deleteCoupon(id);
      showToast('Coupon deleted');
      setCoupons(coupons.filter(c => c._id !== id));
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const handleToggle = async (c: Coupon) => {
    try {
      await adminAPI.updateCoupon(c._id, { isActive: !c.isActive });
      setCoupons(coupons.map(x => x._id === c._id ? { ...x, isActive: !x.isActive } : x));
      showToast(`Coupon ${!c.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      showToast('Failed to update', 'error');
    }
  };

  const now = new Date();
  const activeCoupons = coupons.filter(c => c.isActive && new Date(c.validTo) >= now);
  const totalUsed = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-amber-900 flex items-center gap-3"><FaGift /> Coupon Management</h2>
        <button onClick={openCreate} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow transition active:scale-95">
          <FaPlus /> Add Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Coupons', value: coupons.length, color: 'from-indigo-500 to-indigo-600' },
          { label: 'Active', value: activeCoupons.length, color: 'from-green-500 to-green-600' },
          { label: 'Total Used', value: totalUsed, color: 'from-orange-500 to-orange-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-gradient-to-r ${color} text-white p-4 rounded-xl shadow`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs opacity-80 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading coupons...</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16">
          <FaGift className="text-6xl text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No coupons yet</p>
          <button onClick={openCreate} className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-orange-600">Add First Coupon</button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gradient-to-r from-orange-50 to-amber-50">
                {['Code', 'Type', 'Discount', 'Min Order', 'Validity', 'Usage', 'Status', 'Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map((c, idx) => {
                const expired = new Date(c.validTo) < now;
                return (
                  <tr key={c._id} className={`border-b transition hover:bg-orange-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700 text-sm">{c.code}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.type === 'percentage' ? 'bg-orange-100 text-orange-700' : c.type === 'flat' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {c.type === 'percentage' ? '% Off' : c.type === 'flat' ? 'Flat ₹' : 'Free Delivery'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold">{c.type === 'percentage' ? `${c.discount}%` : c.type === 'flat' ? `₹${c.discount}` : '—'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">₹{c.minOrder}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      {new Date(c.validFrom).toLocaleDateString('en-IN')} →<br/>
                      {new Date(c.validTo).toLocaleDateString('en-IN')}
                      {expired && <span className="ml-1 text-red-500">(Expired)</span>}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{c.usedCount}</span>
                        <span className="text-gray-400">/ {c.usageLimit}</span>
                      </div>
                      <div className="w-20 h-1.5 bg-gray-200 rounded-full mt-1">
                        <div className="h-1.5 bg-orange-400 rounded-full" style={{ width: `${Math.min(100, (c.usedCount / c.usageLimit) * 100)}%` }} />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => handleToggle(c)} className="flex items-center gap-1 text-sm">
                        {c.isActive && !expired ? <FaToggleOn className="text-green-500 text-xl" /> : <FaToggleOff className="text-gray-400 text-xl" />}
                        <span className={`text-xs ${c.isActive && !expired ? 'text-green-600' : 'text-gray-400'}`}>
                          {c.isActive && !expired ? 'Active' : expired ? 'Expired' : 'Off'}
                        </span>
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(c)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"><FaEdit className="text-xs" /></button>
                        <button onClick={() => handleDelete(c._id)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition"><FaTrash className="text-xs" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-800">{editing ? 'Edit Coupon' : 'Create Coupon'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Coupon Code *</label>
                  <input required className="w-full border rounded-lg px-3 py-2 text-sm uppercase font-mono tracking-widest focus:ring-2 focus:ring-orange-400 focus:outline-none" placeholder="e.g. SAVE20" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" placeholder="e.g. 20% off on orders above ₹200" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Type *</label>
                  <select required className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-orange-400 focus:outline-none" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}>
                    <option value="percentage">% Discount</option>
                    <option value="flat">Flat ₹ Off</option>
                    <option value="free_delivery">Free Delivery</option>
                  </select>
                </div>
                {form.type !== 'free_delivery' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Discount {form.type === 'percentage' ? '%' : '₹'} *</label>
                    <input required type="number" min="0" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: Number(e.target.value) }))} />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Min. Order (₹)</label>
                  <input type="number" min="0" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Usage Limit</label>
                  <input type="number" min="1" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Valid From *</label>
                  <input required type="date" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" value={form.validFrom} onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Valid To *</label>
                  <input required type="date" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" value={form.validTo} onChange={e => setForm(f => ({ ...f, validTo: e.target.value }))} />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="couponActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-orange-500" />
                  <label htmlFor="couponActive" className="text-sm text-gray-600 cursor-pointer">Active (customers can use this coupon)</label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FaCheck />}
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default CouponManagement;