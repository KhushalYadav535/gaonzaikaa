import React, { useState } from 'react';
import { coupons as mockCoupons } from '../../mock/data';
import { FaGift, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaChartBar } from 'react-icons/fa';

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-gray-100 text-gray-700',
};

const CouponManagement: React.FC = () => {
  const [coupons, setCoupons] = useState(mockCoupons);
  const [form, setForm] = useState({ code: '', discount: 0, validFrom: '', validTo: '', usageLimit: 1, applicableVillages: '', applicableRestaurants: '', status: 'active' });
  const [editing, setEditing] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleAdd = () => {
    if (!form.code || !form.discount || !form.validFrom || !form.validTo) {
      showToast('All fields are required.', 'error');
      return;
    }
    setCoupons([...coupons, {
      id: Date.now(),
      code: form.code,
      discount: Number(form.discount),
      validFrom: form.validFrom,
      validTo: form.validTo,
      usageLimit: Number(form.usageLimit),
      used: 0,
      applicableVillages: form.applicableVillages.split(',').map(v => v.trim()),
      applicableRestaurants: form.applicableRestaurants.split(',').map(r => r.trim()),
      status: form.status,
    }]);
    setForm({ code: '', discount: 0, validFrom: '', validTo: '', usageLimit: 1, applicableVillages: '', applicableRestaurants: '', status: 'active' });
    showToast('Coupon added successfully.');
  };

  const handleEdit = (id: number) => {
    const c = coupons.find(c => c.id === id);
    if (c) {
      setEditing(id);
      setForm({
        code: c.code,
        discount: c.discount,
        validFrom: c.validFrom,
        validTo: c.validTo,
        usageLimit: c.usageLimit,
        applicableVillages: c.applicableVillages.join(', '),
        applicableRestaurants: c.applicableRestaurants.join(', '),
        status: c.status,
      });
    }
  };

  const handleUpdate = () => {
    if (editing === null) return;
    setCoupons(coupons.map(c => c.id === editing ? {
      ...c,
      ...form,
      discount: Number(form.discount),
      usageLimit: Number(form.usageLimit),
      applicableVillages: form.applicableVillages.split(',').map(v => v.trim()),
      applicableRestaurants: form.applicableRestaurants.split(',').map(r => r.trim()),
    } : c));
    setEditing(null);
    setForm({ code: '', discount: 0, validFrom: '', validTo: '', usageLimit: 1, applicableVillages: '', applicableRestaurants: '', status: 'active' });
    showToast('Coupon updated successfully.');
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      setCoupons(coupons.filter(c => c.id !== id));
      showToast('Coupon deleted successfully.');
    }
  };

  // Analytics
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.status === 'active').length;
  const totalUsed = coupons.reduce((sum, c) => sum + (c.used || 0), 0);

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-amber-900"><FaGift /> Coupon & Promotion Management</h2>
      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <FaChartBar className="text-4xl text-indigo-500 mb-2" />
          <div className="text-2xl font-bold text-indigo-700">{totalCoupons}</div>
          <div className="text-gray-500">Total Coupons</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <FaGift className="text-4xl text-orange-500 mb-2" />
          <div className="text-2xl font-bold text-orange-700">{activeCoupons}</div>
          <div className="text-gray-500">Active Coupons</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <FaCheckCircle className="text-4xl text-emerald-500 mb-2" />
          <div className="text-2xl font-bold text-emerald-700">{totalUsed}</div>
          <div className="text-gray-500">Total Used</div>
        </div>
      </div>
      {/* Add/Edit Form */}
      <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-700"><FaPlus /> {editing ? 'Edit Coupon' : 'Add Coupon'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
          <input className="border p-2 rounded w-full focus:ring-2 focus:ring-orange-400 focus:outline-none transition" placeholder="Code" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
          <input className="border p-2 rounded w-full focus:ring-2 focus:ring-orange-400 focus:outline-none transition" type="number" placeholder="Discount (%)" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: Number(e.target.value) }))} />
          <input className="border p-2 rounded w-full focus:ring-2 focus:ring-orange-400 focus:outline-none transition" type="date" placeholder="Valid From" value={form.validFrom} onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))} />
          <input className="border p-2 rounded w-full focus:ring-2 focus:ring-orange-400 focus:outline-none transition" type="date" placeholder="Valid To" value={form.validTo} onChange={e => setForm(f => ({ ...f, validTo: e.target.value }))} />
          <input className="border p-2 rounded w-full focus:ring-2 focus:ring-orange-400 focus:outline-none transition" type="number" placeholder="Usage Limit" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: Number(e.target.value) }))} />
          <select className="border p-2 rounded w-full focus:ring-2 focus:ring-orange-400 focus:outline-none transition" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input className="border p-2 rounded w-full focus:ring-2 focus:ring-orange-400 focus:outline-none transition" placeholder="Applicable Villages (comma separated)" value={form.applicableVillages} onChange={e => setForm(f => ({ ...f, applicableVillages: e.target.value }))} />
          <input className="border p-2 rounded w-full focus:ring-2 focus:ring-orange-400 focus:outline-none transition" placeholder="Applicable Restaurants (comma separated)" value={form.applicableRestaurants} onChange={e => setForm(f => ({ ...f, applicableRestaurants: e.target.value }))} />
        </div>
        <div className="flex gap-2">
          {editing !== null ? (
            <button className="bg-blue-500 text-white px-4 py-2 rounded transition hover:bg-blue-600 active:scale-95" onClick={handleUpdate}><FaEdit className="inline mr-1" /> Update</button>
          ) : (
            <button className="bg-green-500 text-white px-4 py-2 rounded transition hover:bg-green-600 active:scale-95" onClick={handleAdd}><FaPlus className="inline mr-1" /> Add</button>
          )}
          {editing !== null && (
            <button className="bg-gray-400 text-white px-4 py-2 rounded transition hover:bg-gray-500 active:scale-95" onClick={() => { setEditing(null); setForm({ code: '', discount: 0, validFrom: '', validTo: '', usageLimit: 1, applicableVillages: '', applicableRestaurants: '', status: 'active' }); }}>Cancel</button>
          )}
        </div>
      </div>
      {/* Coupon Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-orange-50">
              <th className="py-2 px-4 border-b">Code</th>
              <th className="py-2 px-4 border-b">Discount</th>
              <th className="py-2 px-4 border-b">Validity</th>
              <th className="py-2 px-4 border-b">Usage</th>
              <th className="py-2 px-4 border-b">Villages</th>
              <th className="py-2 px-4 border-b">Restaurants</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c.id} className="hover:bg-orange-50 transition">
                <td className="py-2 px-4 border-b font-mono font-bold text-indigo-700">{c.code}</td>
                <td className="py-2 px-4 border-b">{c.discount}%</td>
                <td className="py-2 px-4 border-b">{c.validFrom} - {c.validTo}</td>
                <td className="py-2 px-4 border-b">{c.used}/{c.usageLimit}</td>
                <td className="py-2 px-4 border-b">
                  {c.applicableVillages.map((v: string) => (
                    <span key={v} className="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-semibold mr-1 mb-1">{v}</span>
                  ))}
                </td>
                <td className="py-2 px-4 border-b">
                  {c.applicableRestaurants.map((r: string) => (
                    <span key={r} className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-semibold mr-1 mb-1">{r}</span>
                  ))}
                </td>
                <td className="py-2 px-4 border-b">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColors[c.status]}`}>{c.status}</span>
                </td>
                <td className="py-2 px-4 border-b flex gap-2">
                  <button className="bg-blue-400 text-white px-2 py-1 rounded transition hover:bg-blue-500 active:scale-95" onClick={() => handleEdit(c.id)}><FaEdit /></button>
                  <button className="bg-red-500 text-white px-2 py-1 rounded transition hover:bg-red-600 active:scale-95" onClick={() => handleDelete(c.id)}><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl text-white transition-all animate-fadeIn ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <FaCheckCircle className="text-2xl" /> : <FaTimesCircle className="text-2xl" />}
          <span className="font-semibold text-base tracking-wide">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default CouponManagement; 