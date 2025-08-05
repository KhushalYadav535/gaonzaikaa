import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaUtensils, FaChartBar } from 'react-icons/fa';

const VillageManagement: React.FC = () => {
  const [villages, setVillages] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', deliveryZone: '', assignedRestaurants: [] as string[] });
  const [editing, setEditing] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/villages').then(res => res.json()),
      fetch('/api/admin/restaurants').then(res => res.json()),
    ])
      .then(([villagesRes, restaurantsRes]) => {
        setVillages(villagesRes.data || []);
        setRestaurants(restaurantsRes.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load villages or restaurants.');
        setLoading(false);
      });
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleAdd = () => {
    if (!form.name || !form.deliveryZone) {
      showToast('Name and delivery zone are required.', 'error');
      return;
    }
    fetch('/api/admin/villages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then(res => res.json())
      .then(data => {
        setVillages(prev => [...prev, data.data]);
        setForm({ name: '', deliveryZone: '', assignedRestaurants: [] });
        showToast('Village added successfully.');
      })
      .catch(() => showToast('Failed to add village.', 'error'));
  };

  const handleEdit = (id: number) => {
    const v = villages.find(v => v.id === id);
    if (v) {
      setEditing(id);
      setForm({ name: v.name, deliveryZone: v.deliveryZone, assignedRestaurants: v.assignedRestaurants });
    }
  };

  const handleUpdate = () => {
    if (editing === null) return;
    fetch(`/api/admin/villages/${editing}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then(res => res.json())
      .then(data => {
        setVillages(villages => villages.map(v => v.id === editing ? data.data : v));
        setEditing(null);
        setForm({ name: '', deliveryZone: '', assignedRestaurants: [] });
        showToast('Village updated successfully.');
      })
      .catch(() => showToast('Failed to update village.', 'error'));
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this village?')) {
      fetch(`/api/admin/villages/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => {
          setVillages(villages => villages.filter(v => v.id !== id));
          showToast('Village deleted successfully.');
        })
        .catch(() => showToast('Failed to delete village.', 'error'));
    }
  };

  const handleRestaurantToggle = (restaurant: string) => {
    setForm(f => ({ ...f, assignedRestaurants: f.assignedRestaurants.includes(restaurant) ? f.assignedRestaurants.filter(r => r !== restaurant) : [...f.assignedRestaurants, restaurant] }));
  };

  // Analytics
  const totalVillages = villages.length;
  const totalOrders = villages.reduce((sum, v) => sum + (v.orderVolume || 0), 0);
  const avgCoverage = (villages.reduce((sum, v) => sum + (v.assignedRestaurants.length), 0) / (villages.length || 1)).toFixed(1);

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-amber-900"><FaMapMarkerAlt /> Village/Area Management</h2>
      {loading ? <div>Loading villages...</div> : error ? <div className="text-red-500">{error}</div> : <>
      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <FaMapMarkerAlt className="text-4xl text-indigo-500 mb-2" />
          <div className="text-2xl font-bold text-indigo-700">{totalVillages}</div>
          <div className="text-gray-500">Total Villages</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <FaChartBar className="text-4xl text-orange-500 mb-2" />
          <div className="text-2xl font-bold text-orange-700">{totalOrders}</div>
          <div className="text-gray-500">Total Orders</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <FaUtensils className="text-4xl text-emerald-500 mb-2" />
          <div className="text-2xl font-bold text-emerald-700">{avgCoverage}</div>
          <div className="text-gray-500">Avg. Restaurants/Village</div>
        </div>
      </div>
      {/* Add/Edit Form */}
      <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-700"><FaPlus /> {editing ? 'Edit Village' : 'Add Village'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input className="border p-2 rounded w-full focus:ring-2 focus:ring-orange-400 focus:outline-none transition" placeholder="Village Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input className="border p-2 rounded w-full focus:ring-2 focus:ring-orange-400 focus:outline-none transition" placeholder="Delivery Zone" value={form.deliveryZone} onChange={e => setForm(f => ({ ...f, deliveryZone: e.target.value }))} />
          <div>
            <div className="mb-1 text-sm font-semibold text-gray-700 flex items-center gap-1"><FaUtensils /> Restaurants</div>
            <div className="flex flex-wrap gap-2">
              {restaurants.map(r => (
                <label key={r.name} className={`px-2 py-1 rounded-full border cursor-pointer text-xs ${form.assignedRestaurants.includes(r.name) ? 'bg-orange-100 border-orange-400 text-orange-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                  <input
                    type="checkbox"
                    checked={form.assignedRestaurants.includes(r.name)}
                    onChange={() => handleRestaurantToggle(r.name)}
                    className="mr-1"
                  />
                  {r.name}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {editing !== null ? (
            <button className="bg-blue-500 text-white px-4 py-2 rounded transition hover:bg-blue-600 active:scale-95" onClick={handleUpdate}><FaEdit className="inline mr-1" /> Update</button>
          ) : (
            <button className="bg-green-500 text-white px-4 py-2 rounded transition hover:bg-green-600 active:scale-95" onClick={handleAdd}><FaPlus className="inline mr-1" /> Add</button>
          )}
          {editing !== null && (
            <button className="bg-gray-400 text-white px-4 py-2 rounded transition hover:bg-gray-500 active:scale-95" onClick={() => { setEditing(null); setForm({ name: '', deliveryZone: '', assignedRestaurants: [] }); }}>Cancel</button>
          )}
        </div>
      </div>
      {/* Village Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-orange-50">
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Delivery Zone</th>
              <th className="py-2 px-4 border-b">Restaurants</th>
              <th className="py-2 px-4 border-b">Order Volume</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {villages.map(v => (
              <tr key={v.id} className="hover:bg-orange-50 transition">
                <td className="py-2 px-4 border-b flex items-center gap-2"><FaMapMarkerAlt className="text-orange-400" /> {v.name}</td>
                <td className="py-2 px-4 border-b">{v.deliveryZone}</td>
                <td className="py-2 px-4 border-b">
                  {v.assignedRestaurants.map((r: string) => (
                    <span key={r} className="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-semibold mr-1 mb-1">{r}</span>
                  ))}
                </td>
                <td className="py-2 px-4 border-b font-bold text-indigo-700">{v.orderVolume}</td>
                <td className="py-2 px-4 border-b flex gap-2">
                  <button className="bg-blue-400 text-white px-2 py-1 rounded transition hover:bg-blue-500 active:scale-95" onClick={() => handleEdit(v.id)}><FaEdit /></button>
                  <button className="bg-red-500 text-white px-2 py-1 rounded transition hover:bg-red-600 active:scale-95" onClick={() => handleDelete(v.id)}><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </>}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl text-white transition-all animate-fadeIn ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <FaCheckCircle className="text-2xl" /> : <FaTimesCircle className="text-2xl" />}
          <span className="font-semibold text-base tracking-wide">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default VillageManagement; 