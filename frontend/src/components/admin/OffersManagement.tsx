import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Toast from './Toast';
import { FaGift, FaPlus, FaEdit, FaTrash, FaTimes, FaToggleOn, FaToggleOff, FaPercent, FaTruck, FaRupeeSign, FaTag } from 'react-icons/fa';

interface Offer {
  _id: string;
  title: string;
  description: string;
  type: 'percentage' | 'flat' | 'free_delivery' | 'bogo' | 'free_item';
  value: number;
  minOrder: number;
  maxDiscount?: number;
  restaurantId?: { _id: string; name: string } | null;
  backgroundColor: string;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  displayOrder: number;
  clickCount: number;
}

const TYPE_CONFIG = {
  percentage: { label: '% Off', icon: <FaPercent />, color: 'bg-orange-100 text-orange-700' },
  flat: { label: 'Flat Off', icon: <FaRupeeSign />, color: 'bg-blue-100 text-blue-700' },
  free_delivery: { label: 'Free Delivery', icon: <FaTruck />, color: 'bg-green-100 text-green-700' },
  bogo: { label: 'Buy 1 Get 1', icon: <FaTag />, color: 'bg-purple-100 text-purple-700' },
  buy_2_get_1: { label: 'Buy 2 Get 1', icon: <FaTag />, color: 'bg-indigo-100 text-indigo-700' },
  free_item: { label: 'Free Item', icon: <FaGift />, color: 'bg-yellow-100 text-yellow-700' },
  custom: { label: 'Custom', icon: <FaGift />, color: 'bg-teal-100 text-teal-700' },
};

const BG_COLORS = [
  '#FF5722', '#E91E63', '#9C27B0', '#3F51B5',
  '#2196F3', '#00BCD4', '#4CAF50', '#FF9800',
  '#795548', '#607D8B'
];

const defaultForm = {
  title: '', description: '', type: 'percentage' as const,
  value: 20, minOrder: 0, maxDiscount: undefined as number | undefined,
  restaurantId: '', backgroundColor: '#FF5722', customLabel: '',
  validFrom: '', validTo: '', isActive: true, displayOrder: 0,
};

const OffersManagement: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [restaurants, setRestaurants] = useState<{_id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [res, restRes] = await Promise.all([
        adminAPI.getOffers(),
        adminAPI.getRestaurants()
      ]);
      if (res.data.success) setOffers(res.data.data);
      if (restRes.data.success) setRestaurants(restRes.data.data);
    } catch (err: any) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setForm({ ...defaultForm, validFrom: today, validTo: nextMonth });
    setShowModal(true);
  };

  const openEdit = (offer: Offer) => {
    setEditing(offer);
    setForm({
      title: offer.title,
      description: offer.description,
      type: offer.type,
      value: offer.value,
      minOrder: offer.minOrder,
      maxDiscount: offer.maxDiscount,
      restaurantId: offer.restaurantId?._id || '',
      backgroundColor: offer.backgroundColor,
      customLabel: offer.customLabel || '',
      validFrom: offer.validFrom?.split('T')[0] || '',
      validTo: offer.validTo?.split('T')[0] || '',
      isActive: offer.isActive,
      displayOrder: offer.displayOrder,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        restaurantId: form.restaurantId || null,
        maxDiscount: form.maxDiscount || null,
      };
      if (editing) {
        await adminAPI.updateOffer(editing._id, payload);
        showToast('Offer updated successfully ✅');
      } else {
        await adminAPI.createOffer(payload);
        showToast('Offer created successfully 🎉');
      }
      fetchData();
      setShowModal(false);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save offer', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this offer?')) return;
    try {
      await adminAPI.deleteOffer(id);
      showToast('Offer deleted');
      setOffers(offers.filter(o => o._id !== id));
    } catch {
      showToast('Failed to delete offer', 'error');
    }
  };

  const handleToggle = async (offer: Offer) => {
    try {
      await adminAPI.updateOffer(offer._id, { isActive: !offer.isActive });
      setOffers(offers.map(o => o._id === offer._id ? { ...o, isActive: !o.isActive } : o));
      showToast(`Offer ${!offer.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      showToast('Failed to update', 'error');
    }
  };

  const now = new Date();
  const activeOffers = offers.filter(o => o.isActive && new Date(o.validTo) >= now).length;
  const expiredOffers = offers.filter(o => new Date(o.validTo) < now).length;

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-amber-900 flex items-center gap-3">
            <FaGift className="text-orange-500" /> Offers & Banners
          </h2>
          <p className="text-gray-500 text-sm mt-1">Create offers that appear as banners in the customer app</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow transition active:scale-95">
          <FaPlus /> Create Offer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Offers', value: offers.length, color: 'from-indigo-500 to-indigo-600' },
          { label: 'Active Now', value: activeOffers, color: 'from-green-500 to-green-600' },
          { label: 'Expired', value: expiredOffers, color: 'from-gray-400 to-gray-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-gradient-to-r ${color} text-white p-4 rounded-xl shadow`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs opacity-80 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Preview Note */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <span className="text-2xl">📱</span>
        <div>
          <p className="font-semibold text-orange-800 text-sm">Customer App Preview</p>
          <p className="text-orange-600 text-xs mt-1">Active offers appear as banner cards on the customer home screen. Offers are sorted by Display Order (lowest first).</p>
        </div>
      </div>

      {/* Offers Grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading offers...</div>
      ) : offers.length === 0 ? (
        <div className="text-center py-16">
          <FaGift className="text-6xl text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No offers yet</p>
          <p className="text-gray-300 text-sm">Create your first offer to show it in the customer app</p>
          <button onClick={openCreate} className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-orange-600">Create Offer</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {offers.map(offer => {
            const isExpired = new Date(offer.validTo) < now;
            const typeConf = TYPE_CONFIG[offer.type] || TYPE_CONFIG.percentage;
            return (
              <div key={offer._id} className={`rounded-2xl overflow-hidden shadow-lg border transition hover:shadow-xl ${!offer.isActive || isExpired ? 'opacity-60' : ''}`}>
                {/* Banner Preview */}
                <div className="relative p-5 text-white" style={{ background: `linear-gradient(135deg, ${offer.backgroundColor}, ${offer.backgroundColor}99)` }}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-bold text-lg leading-tight">{offer.title}</p>
                      <p className="text-white/80 text-sm mt-1">{offer.description}</p>
                    </div>
                    <div className="text-3xl font-black opacity-90">
                      {offer.type === 'percentage' && `${offer.value}%`}
                      {offer.type === 'flat' && `₹${offer.value}`}
                      {offer.type === 'free_delivery' && '🚴'}
                      {offer.type === 'bogo' && '2×1'}
                      {offer.type === 'buy_2_get_1' && '3×2'}
                      {offer.type === 'free_item' && '🎁'}
                      {offer.type === 'custom' && (offer.customLabel || '✨')}
                    </div>
                  </div>
                  {offer.minOrder > 0 && (
                    <p className="text-white/70 text-xs mt-2">Min. order: ₹{offer.minOrder}</p>
                  )}
                  {isExpired && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">Expired</span>
                  )}
                </div>

                {/* Details */}
                <div className="bg-white p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${typeConf.color}`}>
                      {typeConf.icon} {typeConf.label}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${offer.isActive && !isExpired ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {isExpired ? 'Expired' : offer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 space-y-1 mb-3">
                    <p>Valid: {new Date(offer.validFrom).toLocaleDateString('en-IN')} – {new Date(offer.validTo).toLocaleDateString('en-IN')}</p>
                    {offer.restaurantId && <p>Restaurant: {offer.restaurantId.name}</p>}
                    <p>Order: {offer.displayOrder} | Clicks: {offer.clickCount}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleToggle(offer)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition">
                      {offer.isActive ? <FaToggleOn className="text-green-500 text-lg" /> : <FaToggleOff className="text-gray-400 text-lg" />}
                      {offer.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button onClick={() => openEdit(offer)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition"><FaEdit /></button>
                    <button onClick={() => handleDelete(offer._id)} className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-sm font-medium hover:bg-red-100 transition"><FaTrash /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaGift className="text-orange-500" /> {editing ? 'Edit Offer' : 'Create New Offer'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl"><FaTimes /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Live Preview */}
              <div className="rounded-xl overflow-hidden mb-2">
                <div className="p-4 text-white flex justify-between items-center" style={{ background: `linear-gradient(135deg, ${form.backgroundColor}, ${form.backgroundColor}99)` }}>
                  <div>
                    <p className="font-bold">{form.title || 'Offer Title'}</p>
                    <p className="text-white/70 text-xs">{form.description || 'Offer description'}</p>
                  </div>
                  <p className="text-3xl font-black">
                    {form.type === 'percentage' && `${form.value}%`}
                    {form.type === 'flat' && `₹${form.value}`}
                    {form.type === 'free_delivery' && '🚴'}
                    {form.type === 'bogo' && '2×1'}
                    {form.type === 'buy_2_get_1' && '3×2'}
                    {form.type === 'free_item' && '🎁'}
                    {form.type === 'custom' && (form.customLabel || '✨')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label>
                  <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" placeholder="e.g. 30% Off on First Order" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Description *</label>
                  <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" placeholder="e.g. Use code FIRST30 at checkout" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Offer Type *</label>
                  <select required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-orange-400 focus:outline-none" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}>
                    <option value="percentage">% Discount</option>
                    <option value="flat">Flat ₹ Off</option>
                    <option value="free_delivery">Free Delivery</option>
                    <option value="bogo">Buy 1 Get 1</option>
                    <option value="buy_2_get_1">Buy 2 Get 1</option>
                    <option value="free_item">Free Item</option>
                    <option value="custom">Custom Label</option>
                  </select>
                </div>

                {form.type === 'custom' && (
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Custom Badge Text (max 10 chars)</label>
                    <input maxLength={10} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" placeholder="e.g. 5x4, FREE TEA" value={form.customLabel} onChange={e => setForm(f => ({ ...f, customLabel: e.target.value }))} />
                  </div>
                )}

                {form.type !== 'free_delivery' && form.type !== 'bogo' && form.type !== 'buy_2_get_1' && form.type !== 'free_item' && form.type !== 'custom' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      {form.type === 'percentage' ? 'Discount %' : 'Flat Amount (₹)'}
                    </label>
                    <input type="number" min="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" value={form.value} onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))} />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Min. Order (₹)</label>
                  <input type="number" min="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: Number(e.target.value) }))} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Restaurant</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-orange-400 focus:outline-none" value={form.restaurantId} onChange={e => setForm(f => ({ ...f, restaurantId: e.target.value }))}>
                    <option value="">All Restaurants (Global)</option>
                    {restaurants.map(r => (
                      <option key={r._id} value={r._id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                {form.type === 'percentage' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Max Discount Cap (₹)</label>
                    <input type="number" min="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" placeholder="Optional" value={form.maxDiscount || ''} onChange={e => setForm(f => ({ ...f, maxDiscount: Number(e.target.value) || undefined }))} />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Valid From *</label>
                  <input required type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" value={form.validFrom} onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Valid To *</label>
                  <input required type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" value={form.validTo} onChange={e => setForm(f => ({ ...f, validTo: e.target.value }))} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Display Order</label>
                  <input type="number" min="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" value={form.displayOrder} onChange={e => setForm(f => ({ ...f, displayOrder: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Active</label>
                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-orange-500" />
                    <span className="text-sm text-gray-600">Show in customer app</span>
                  </label>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Banner Color</label>
                  <div className="flex flex-wrap gap-2">
                    {BG_COLORS.map(color => (
                      <button key={color} type="button" onClick={() => setForm(f => ({ ...f, backgroundColor: color }))}
                        className={`w-8 h-8 rounded-full border-2 transition ${form.backgroundColor === color ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FaGift />}
                  {saving ? 'Saving...' : editing ? 'Update Offer' : 'Create Offer'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default OffersManagement;
