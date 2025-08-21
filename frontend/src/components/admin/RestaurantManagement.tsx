import React, { useState, useEffect } from 'react';
import Toast from './Toast';
import { useAdminSession } from './AdminSessionContext';
import { FaUtensils, FaMapMarkerAlt, FaLeaf } from 'react-icons/fa';
import { adminAPI } from '../../services/api';

interface MenuItem {
  name: string;
  price: number;
}

interface Restaurant {
  _id: string;
  name: string;
  address: string | {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    fullAddress?: string;
  };
  cuisine: string;
  image?: string;
  menu?: MenuItem[];
  vendorId?: any;
  isActive?: boolean;
  createdAt?: string;
}

const RestaurantManagement: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Restaurant | null>(null);
  const [form, setForm] = useState({ name: '', address: '', cuisine: '' });
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { adminRole, isLoggedIn } = useAdminSession();
  const isAdmin = isLoggedIn && (
    adminRole === 'super_admin' ||
    adminRole === 'admin' ||
    adminRole === 'restaurant_manager' ||
    adminRole === 'delivery_manager'
  );

  // Details modal state
  const [showDetails, setShowDetails] = useState(false);
  const [detailsRestaurant, setDetailsRestaurant] = useState<Restaurant | null>(null);
  const [menuForm, setMenuForm] = useState<MenuItem>({ name: '', price: 0 });
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getRestaurants();
        if (response.data.success) {
          setRestaurants(response.data.data || []);
        } else {
          setError('Failed to load restaurants.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load restaurants.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleAdd = () => {
    if (!form.name || !form.address || !form.cuisine) {
      showToast('All fields are required.', 'error');
      return;
    }
    // Note: This would need to be implemented in the backend
    showToast('Add restaurant functionality not implemented yet.', 'error');
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditing(restaurant);
    const addressString = typeof restaurant.address === 'string' 
      ? restaurant.address 
      : restaurant.address?.fullAddress || 
        `${restaurant.address?.street || ''}, ${restaurant.address?.city || ''}, ${restaurant.address?.state || ''} ${restaurant.address?.pincode || ''}`.trim();
    
    setForm({ name: restaurant.name, address: addressString, cuisine: restaurant.cuisine });
  };

  const handleUpdate = async () => {
    if (!editing) return;
    if (!form.name || !form.address || !form.cuisine) {
      showToast('All fields are required.', 'error');
      return;
    }
    
    try {
      const response = await adminAPI.updateRestaurant(editing._id, {
        name: form.name,
        address: form.address,
        cuisine: form.cuisine
      });
      
      if (response.data.success) {
        setRestaurants(restaurants => restaurants.map(r => r._id === editing._id ? response.data.data : r));
        setEditing(null);
        setForm({ name: '', address: '', cuisine: '' });
        showToast('Restaurant updated successfully.');
      } else {
        showToast(response.data.message || 'Failed to update restaurant.', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update restaurant.', 'error');
    }
  };

  const handleToggleActive = async (id: string, nextActive: boolean) => {
    try {
      const response = await adminAPI.updateRestaurant(id, { isActive: nextActive });
      if (response.data.success) {
        setRestaurants(restaurants => restaurants.map(r => r._id === id ? { ...r, isActive: nextActive } : r));
        showToast(`Restaurant ${nextActive ? 'is now Online' : 'set to Offline'}.`);
      } else {
        showToast(response.data.message || 'Failed to update restaurant status.', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update restaurant status.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this restaurant?')) {
      try {
        const response = await adminAPI.deleteRestaurant(id);
        
        if (response.data.success) {
          setRestaurants(restaurants => restaurants.filter(r => r._id !== id));
          showToast('Restaurant deleted successfully.');
        } else {
          showToast(response.data.message || 'Failed to delete restaurant.', 'error');
        }
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Failed to delete restaurant.', 'error');
      }
    }
  };

  // Details modal handlers (local only, not persisted)
  const openDetails = (restaurant: Restaurant) => {
    setDetailsRestaurant(restaurant);
    setImageUrl(restaurant.image || '');
    setShowDetails(true);
  };
  const closeDetails = () => {
    setShowDetails(false);
    setDetailsRestaurant(null);
    setMenuForm({ name: '', price: 0 });
    setImageUrl('');
  };
  const handleMenuAdd = () => {
    if (!menuForm.name || !menuForm.price) return;
    setDetailsRestaurant(r => r ? { ...r, menu: [...(r.menu || []), { ...menuForm }] } : r);
    setMenuForm({ name: '', price: 0 });
  };
  const handleMenuRemove = (idx: number) => {
    setDetailsRestaurant(r => r ? { ...r, menu: (r.menu || []).filter((_, i) => i !== idx) } : r);
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setImageUrl(url);
      setDetailsRestaurant(r => r ? { ...r, image: url } : r);
    }
  };
  const saveDetails = () => {
    if (!detailsRestaurant) return;
    // Optionally, persist menu/image changes to backend here
    setRestaurants(restaurants => restaurants.map(r => r._id === detailsRestaurant._id ? detailsRestaurant : r));
    showToast('Details updated.');
    closeDetails();
  };

  const filteredRestaurants = restaurants.filter(r => {
    const addressString = typeof r.address === 'string' 
      ? r.address 
      : r.address?.fullAddress || 
        `${r.address?.street || ''}, ${r.address?.city || ''}, ${r.address?.state || ''} ${r.address?.pincode || ''}`.trim();
    
    return r.name.toLowerCase().includes(search.toLowerCase()) ||
           addressString.toLowerCase().includes(search.toLowerCase()) ||
           r.cuisine.toLowerCase().includes(search.toLowerCase());
  });
  const paginatedRestaurants = filteredRestaurants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-4 text-amber-900">Restaurant Management</h2>
      {loading ? <div>Loading restaurants...</div> : error ? <div className="text-red-500">{error}</div> : <>
      <input
        className="border p-2 rounded mb-4 w-full md:w-1/3"
        placeholder="Search restaurants by name, address, or cuisine..."
        value={search}
        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
      />
      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
        <div className="relative w-full md:w-auto mb-2 md:mb-0">
          <FaUtensils className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" />
          <input
            className="border pl-10 p-2 rounded w-full focus:ring-2 focus:ring-orange-400 focus:outline-none transition"
            placeholder="Name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className="relative w-full md:w-auto mb-2 md:mb-0">
          <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" />
          <input
            className="border pl-10 p-2 rounded w-full focus:ring-2 focus:ring-orange-400 focus:outline-none transition"
            placeholder="Address"
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
          />
        </div>
        <div className="relative w-full md:w-auto mb-2 md:mb-0">
          <FaLeaf className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" />
          <input
            className="border pl-10 p-2 rounded w-full focus:ring-2 focus:ring-orange-400 focus:outline-none transition"
            placeholder="Cuisine"
            value={form.cuisine}
            onChange={e => setForm(f => ({ ...f, cuisine: e.target.value }))}
          />
        </div>
        <div className="flex gap-2">
          {editing ? (
            <button className="bg-blue-500 text-white px-4 py-2 rounded mb-2 md:mb-0 transition hover:bg-blue-600 active:scale-95" onClick={handleUpdate}>Update</button>
          ) : (
            <button className="bg-green-500 text-white px-4 py-2 rounded mb-2 md:mb-0 transition hover:bg-green-600 active:scale-95" onClick={handleAdd}>Add</button>
          )}
          {editing && (
            <button className="bg-gray-400 text-white px-4 py-2 rounded transition hover:bg-gray-500 active:scale-95" onClick={() => { setEditing(null); setForm({ name: '', address: '', cuisine: '' }); }}>Cancel</button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-orange-50">
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Address</th>
              <th className="py-2 px-4 border-b">Cuisine</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRestaurants.map((restaurant, idx) => (
              <tr key={restaurant._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-orange-50'}>
                <td className="py-2 px-4 border-b group transition hover:bg-orange-100">{restaurant.name}</td>
                <td className="py-2 px-4 border-b group transition hover:bg-orange-100">
                  {typeof restaurant.address === 'string' 
                    ? restaurant.address 
                    : restaurant.address?.fullAddress || 
                      `${restaurant.address?.street || ''}, ${restaurant.address?.city || ''}, ${restaurant.address?.state || ''} ${restaurant.address?.pincode || ''}`.trim() || 'N/A'
                  }
                </td>
                <td className="py-2 px-4 border-b group transition hover:bg-orange-100">
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">{restaurant.cuisine}</span>
                </td>
                <td className="py-2 px-4 border-b group transition hover:bg-orange-100">
                  <div className="flex items-center gap-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${restaurant.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'}`}>
                      {restaurant.isActive ? 'Online' : 'Offline'}
                    </span>
                    {isAdmin && (
                      <button
                        className={`px-3 py-1 rounded text-xs font-semibold transition ${restaurant.isActive ? 'bg-gray-300 text-gray-800 hover:bg-gray-400' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                        onClick={() => handleToggleActive(restaurant._id, !restaurant.isActive)}
                        title={restaurant.isActive ? 'Set Offline' : 'Set Online'}
                      >
                        {restaurant.isActive ? 'Set Offline' : 'Set Online'}
                      </button>
                    )}
                  </div>
                </td>
                <td className="py-2 px-4 border-b flex flex-wrap gap-2 group transition hover:bg-orange-100">
                  <button className="bg-indigo-500 text-white px-2 py-1 rounded transition hover:bg-indigo-600 active:scale-95" onClick={() => openDetails(restaurant)}>Details</button>
                  <button className="bg-blue-400 text-white px-2 py-1 rounded transition hover:bg-blue-500 active:scale-95" onClick={() => handleEdit(restaurant)}>Edit</button>
                  {isAdmin && (
                    <button className="bg-red-500 text-white px-2 py-1 rounded transition hover:bg-red-600 active:scale-95" onClick={() => handleDelete(restaurant._id)}>Delete</button>
                  )}
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
      {showDetails && detailsRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-2xl" onClick={closeDetails}>&times;</button>
            <h3 className="text-xl font-bold mb-2">{detailsRestaurant.name} Details</h3>
            <div className="mb-4 flex flex-col md:flex-row gap-4 items-center">
              <img
                src={detailsRestaurant.image || 'https://via.placeholder.com/120x80?text=No+Image'}
                alt="Restaurant"
                className="w-32 h-20 object-cover rounded border"
              />
              <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2" />
            </div>
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Menu Items</h4>
              <ul className="mb-2">
                {(detailsRestaurant.menu || []).map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 mb-1">
                    <span>{item.name} - 9{item.price}</span>
                    <button className="text-red-500" onClick={() => handleMenuRemove(idx)} title="Remove">&times;</button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 mb-2">
                <input
                  className="border p-1 rounded"
                  placeholder="Item name"
                  value={menuForm.name}
                  onChange={e => setMenuForm(f => ({ ...f, name: e.target.value }))}
                />
                <input
                  className="border p-1 rounded"
                  placeholder="Price"
                  type="number"
                  value={menuForm.price}
                  onChange={e => setMenuForm(f => ({ ...f, price: Number(e.target.value) }))}
                />
                <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={handleMenuAdd}>Add</button>
              </div>
            </div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={saveDetails}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantManagement; 