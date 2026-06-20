import React, { useState, useEffect, useRef } from 'react';
import Toast from './Toast';
import { useAdminSession } from './AdminSessionContext';
import {
  FaUtensils, FaMapMarkerAlt, FaLeaf, FaToggleOn, FaKey, FaSearch,
  FaPlus, FaEdit, FaTrash, FaTimes, FaCheck, FaImage, FaCamera,
  FaStore, FaClock, FaTag, FaStar, FaToggleOff
} from 'react-icons/fa';
import { adminAPI } from '../../services/api';

interface MenuItem {
  _id?: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
  isVeg?: boolean;
  isAvailable?: boolean;
  preparationTime?: number;
  image?: { url?: string; publicId?: string } | string;
}

interface Restaurant {
  _id: string;
  name: string;
  address: string | { street?: string; city?: string; state?: string; pincode?: string; fullAddress?: string };
  cuisine: string;
  image?: string;
  menu?: MenuItem[];
  vendorId?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    isLive?: boolean;
    accountStatus?: string;
  } | string | null;
  isActive?: boolean;
  isOpen?: boolean;  // vendor isLive se update hoti hai
  rating?: number;
  createdAt?: string;
  description?: string;
}

const CATEGORIES = ['Starters', 'Main Course', 'Breads', 'Rice & Biryani', 'Desserts', 'Beverages', 'Snacks', 'Other'];

const defaultMenuForm = (): MenuItem => ({
  name: '', price: 0, category: 'Starters', description: '', isVeg: true,
  preparationTime: 15, isAvailable: true
});

const RestaurantManagement: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'inactive' | 'live' | 'offline'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const { adminRole, isLoggedIn } = useAdminSession();
  const isAdmin = isLoggedIn && ['super_admin', 'admin', 'restaurant_manager', 'delivery_manager'].includes(adminRole || '');
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  // ─── Menu Modal State ────────────────────────────────────────
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);

  // ─── Add/Edit Item State ─────────────────────────────────────
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemForm, setItemForm] = useState<MenuItem>(defaultMenuForm());
  const [itemImage, setItemImage] = useState<File | null>(null);
  const [itemImagePreview, setItemImagePreview] = useState<string>('');
  const [savingItem, setSavingItem] = useState(false);
  const itemImageRef = useRef<HTMLInputElement>(null);

  // ─── Restaurant Image State ──────────────────────────────────
  const [uploadingRestImage, setUploadingRestImage] = useState<string | null>(null);
  const restImageRef = useRef<HTMLInputElement>(null);
  const [activeRestImageId, setActiveRestImageId] = useState<string | null>(null);

  // ─── OTP Tools State ─────────────────────────────────────────
  const [showOTP, setShowOTP] = useState(false);
  const [otpPhone, setOtpPhone] = useState('');
  const [otpResult, setOtpResult] = useState<any>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpGenerating, setOtpGenerating] = useState(false);
  const [otpError, setOtpError] = useState('');

  // ─── Load Restaurants ────────────────────────────────────────
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getRestaurants();
      if (response.data.success) setRestaurants(response.data.data || []);
      else setError('Failed to load restaurants.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load restaurants.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchRestaurants(); }, []);

  // ─── Helpers ─────────────────────────────────────────────────
  const addressStr = (addr: Restaurant['address']) =>
    typeof addr === 'string' ? addr :
      addr?.fullAddress || `${addr?.street || ''}, ${addr?.city || ''}, ${addr?.state || ''} ${addr?.pincode || ''}`.trim() || '—';

  const itemImageUrl = (img?: MenuItem['image']) => {
    if (!img) return '';
    if (typeof img === 'string') return img;
    return img.url || '';
  };

  // Get vendor isLive from populated vendorId
  const getVendorIsLive = (restaurant: Restaurant): boolean => {
    if (!restaurant.vendorId) return false;
    if (typeof restaurant.vendorId === 'string') return false;
    return restaurant.vendorId?.isLive === true;
  };

  const getVendorId = (restaurant: Restaurant): string => {
    if (!restaurant.vendorId) return '';
    if (typeof restaurant.vendorId === 'string') return restaurant.vendorId;
    return restaurant.vendorId?._id || '';
  };

  const getVendorName = (restaurant: Restaurant): string => {
    if (!restaurant.vendorId) return 'No Vendor';
    if (typeof restaurant.vendorId === 'string') return 'Linked';
    return restaurant.vendorId?.name || 'No Vendor';
  };

  // ─── Toggle Restaurant Active ────────────────────────────────
  const handleToggleActive = async (id: string, nextActive: boolean) => {
    try {
      await adminAPI.updateRestaurant(id, { isActive: nextActive });
      setRestaurants(rs => rs.map(r => r._id === id ? { ...r, isActive: nextActive } : r));
      showToast(`Restaurant ${nextActive ? '✅ Active (Online)' : '⛔ Inactive (Offline)'} kiya`);
    } catch {
      showToast('Status update failed', 'error');
    }
  };

  // ─── Vendor Live Toggle ───────────────────────────────────────
  const handleVendorLiveToggle = async (restaurant: Restaurant) => {
    const vendorId = getVendorId(restaurant);
    if (!vendorId) { showToast('Is restaurant ka koi vendor linked nahi hai', 'error'); return; }
    try {
      const res = await adminAPI.toggleVendorLive(vendorId);
      if (res.data.success) {
        showToast(res.data.message);
        // Update local state
        const nowLive = !getVendorIsLive(restaurant);
        setRestaurants(rs => rs.map(r => {
          if (r._id !== restaurant._id) return r;
          return {
            ...r,
            isOpen: nowLive,
            vendorId: typeof r.vendorId === 'object' && r.vendorId
              ? { ...r.vendorId, isLive: nowLive }
              : r.vendorId
          };
        }));
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  // ─── Delete Restaurant ────────────────────────────────────────
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" ko delete karein?`)) return;
    try {
      await adminAPI.deleteRestaurant(id);
      setRestaurants(rs => rs.filter(r => r._id !== id));
      showToast('Restaurant deleted');
    } catch { showToast('Delete failed', 'error'); }
  };

  // ─── Filter Logic ─────────────────────────────────────────────
  const filterRestaurants = (list: Restaurant[]) => {
    return list.filter(r => {
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
        addressStr(r.address).toLowerCase().includes(search.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(search.toLowerCase()) ||
        getVendorName(r).toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;

      if (filterTab === 'active') return r.isActive === true;
      if (filterTab === 'inactive') return r.isActive !== true;
      if (filterTab === 'live') return getVendorIsLive(r) === true;
      if (filterTab === 'offline') return getVendorIsLive(r) !== true;
      return true; // 'all'
    });
  };

  const filtered = filterRestaurants(restaurants);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // Counts for filter tabs
  const counts = {
    all: restaurants.length,
    active: restaurants.filter(r => r.isActive === true).length,
    inactive: restaurants.filter(r => r.isActive !== true).length,
    live: restaurants.filter(r => getVendorIsLive(r)).length,
    offline: restaurants.filter(r => !getVendorIsLive(r)).length,
  };

  // ─── Restaurant Image Upload ──────────────────────────────────
  const handleRestImageUpload = async (restaurantId: string, file: File) => {
    setUploadingRestImage(restaurantId);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await adminAPI.uploadRestaurantImage(restaurantId, fd);
      if (res.data.success) {
        const newUrl = res.data.data.imageUrl;
        setRestaurants(rs => rs.map(r => r._id === restaurantId ? { ...r, image: newUrl } : r));
        if (selectedRestaurant?._id === restaurantId) {
          setSelectedRestaurant(r => r ? { ...r, image: newUrl } : r);
        }
        showToast('Restaurant image updated ✅');
      }
    } catch { showToast('Image upload failed', 'error'); }
    finally { setUploadingRestImage(null); }
  };

  // ─── Open Menu Modal ──────────────────────────────────────────
  const openMenuModal = async (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowMenuModal(true);
    setMenuLoading(true);
    setShowItemForm(false);
    setEditingItem(null);
    try {
      const res = await adminAPI.getRestaurantMenu(restaurant._id);
      setMenuItems(res.data.success ? res.data.data : []);
    } catch { showToast('Menu load karne mein error', 'error'); }
    finally { setMenuLoading(false); }
  };

  // ─── Open Add Item Form ───────────────────────────────────────
  const openAddItem = () => {
    setEditingItem(null);
    setItemForm(defaultMenuForm());
    setItemImage(null);
    setItemImagePreview('');
    setShowItemForm(true);
  };

  // ─── Open Edit Item Form ──────────────────────────────────────
  const openEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      price: item.price,
      category: item.category || 'Starters',
      description: item.description || '',
      isVeg: item.isVeg !== false,
      isAvailable: item.isAvailable !== false,
      preparationTime: item.preparationTime || 15
    });
    setItemImage(null);
    setItemImagePreview(itemImageUrl(item.image));
    setShowItemForm(true);
  };

  // ─── Item Image Change ────────────────────────────────────────
  const handleItemImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setItemImage(file);
    setItemImagePreview(URL.createObjectURL(file));
  };

  // ─── Save Item (Add or Edit) ──────────────────────────────────
  const handleSaveItem = async () => {
    if (!selectedRestaurant || !itemForm.name || !itemForm.price) {
      showToast('Naam aur price required hain', 'error');
      return;
    }
    setSavingItem(true);
    try {
      const fd = new FormData();
      fd.append('name', itemForm.name);
      fd.append('price', String(itemForm.price));
      fd.append('category', itemForm.category || 'Starters');
      fd.append('description', itemForm.description || itemForm.name);
      fd.append('isVeg', String(itemForm.isVeg !== false));
      fd.append('isAvailable', String(itemForm.isAvailable !== false));
      fd.append('preparationTime', String(itemForm.preparationTime || 15));
      if (itemImage) fd.append('image', itemImage);

      if (editingItem?._id) {
        const res = await adminAPI.updateMenuItem(selectedRestaurant._id, editingItem._id, fd);
        if (res.data.success) {
          setMenuItems(items => items.map(i => i._id === editingItem._id ? res.data.data : i));
          showToast('Menu item updated ✅');
        }
      } else {
        const res = await adminAPI.addMenuItem(selectedRestaurant._id, fd);
        if (res.data.success) {
          setMenuItems(items => [...items, res.data.data]);
          showToast('Menu item added ✅');
        }
      }
      setShowItemForm(false);
      setEditingItem(null);
      setItemImage(null);
      setItemImagePreview('');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSavingItem(false);
    }
  };

  // ─── OTP Tools ────────────────────────────────────────────────
  const handleFetchOTP = async () => {
    if (!otpPhone.trim()) { setOtpError('Phone number daalo'); return; }
    setOtpLoading(true);
    setOtpError('');
    setOtpResult(null);
    try {
      const res = await adminAPI.getCustomerOTP(otpPhone.trim());
      if (res.data.success) setOtpResult({ ...res.data.data, isGenerated: false });
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'OTP fetch karne mein error');
    } finally { setOtpLoading(false); }
  };

  // Admin naya OTP banata hai jab customer ka SMS nahi aata
  const handleGenerateOTP = async () => {
    if (!otpPhone.trim()) { setOtpError('Phone number daalo'); return; }
    setOtpGenerating(true);
    setOtpError('');
    setOtpResult(null);
    try {
      const res = await adminAPI.generateCustomerOTP(otpPhone.trim());
      if (res.data.success) {
        setOtpResult({ ...res.data.data, isGenerated: true, isExpired: false });
        showToast('OTP generate ho gaya! Customer ko batao 📞');
      }
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'OTP generate karne mein error');
    } finally { setOtpGenerating(false); }
  };

  // ─── Delete Item ──────────────────────────────────────────────
  const handleDeleteItem = async (item: MenuItem) => {
    if (!selectedRestaurant || !item._id) return;
    if (!window.confirm(`"${item.name}" delete karein?`)) return;
    try {
      await adminAPI.deleteMenuItem(selectedRestaurant._id, item._id);
      setMenuItems(items => items.filter(i => i._id !== item._id));
      showToast('Menu item deleted');
    } catch { showToast('Delete failed', 'error'); }
  };

  // ─── Toggle Item Availability ─────────────────────────────────
  const handleToggleAvailability = async (item: MenuItem) => {
    if (!selectedRestaurant || !item._id) return;
    const fd = new FormData();
    fd.append('isAvailable', String(!item.isAvailable));
    try {
      const res = await adminAPI.updateMenuItem(selectedRestaurant._id, item._id, fd);
      if (res.data.success) {
        setMenuItems(items => items.map(i => i._id === item._id ? { ...i, isAvailable: !item.isAvailable } : i));
      }
    } catch { showToast('Update failed', 'error'); }
  };


  // ─── Filter & Paginate ────────────────────────────────────────
  // (moved above into filterRestaurants function)

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-3xl font-bold mb-5 text-amber-900 flex items-center gap-2">
        <FaStore className="text-orange-500" /> Restaurant Management
      </h2>

      {/* ─── OTP TOOLS ─────────────────────────────────────────── */}
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
        <button onClick={() => setShowOTP(!showOTP)}
          className="w-full flex items-center gap-2 px-4 py-3 text-amber-800 font-semibold text-sm hover:bg-amber-100 transition">
          <FaKey className="text-amber-600" />
          🔐 Customer OTP Tool
          <span className="text-xs text-amber-500 ml-1 font-normal">— SMS nahi aaya? Yahan se OTP dekho ya banao</span>
          <span className="ml-auto text-amber-400">{showOTP ? '▲' : '▼'}</span>
        </button>

        {showOTP && (
          <div className="px-4 pb-4">
            {/* Phone input */}
            <div className="flex gap-2 items-center mb-3">
              <input
                className="border rounded-xl px-3 py-2 text-sm flex-1 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                placeholder="Customer ka phone number (e.g. 9876543210)"
                value={otpPhone}
                onChange={e => { setOtpPhone(e.target.value); setOtpResult(null); setOtpError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleFetchOTP()}
              />
            </div>

            {/* Two action buttons */}
            <div className="flex gap-2 mb-3">
              {/* Find existing OTP */}
              <button onClick={handleFetchOTP} disabled={otpLoading || !otpPhone.trim()}
                className="flex-1 flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition">
                <FaSearch className="text-xs" />
                {otpLoading ? 'Searching...' : 'OTP Dekho'}
              </button>

              {/* Generate NEW OTP */}
              <button onClick={handleGenerateOTP} disabled={otpGenerating || !otpPhone.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition">
                {otpGenerating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : '✨'}
                {otpGenerating ? 'Bana raha hoon...' : 'Naya OTP Banao'}
              </button>
            </div>

            <p className="text-xs text-amber-600 mb-3">
              💡 <strong>OTP Dekho</strong> — Agar SMS gaya tha to wo dikhega &nbsp;|&nbsp;
              <strong>Naya OTP Banao</strong> — Fresh OTP banao aur customer ko batao (10 min valid)
            </p>

            {otpError && <p className="text-red-500 text-xs mb-2">❌ {otpError}</p>}

            {otpResult && (
              <div className={`p-4 rounded-2xl border-2 ${
                otpResult.isGenerated
                  ? 'border-green-300 bg-green-50'
                  : otpResult.isExpired ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'
              }`}>
                {/* Customer info */}
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  👤 {otpResult.customerName} &nbsp;·&nbsp; 📱 {otpResult.phone}
                </p>

                {/* Badge */}
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  otpResult.isGenerated ? 'bg-green-200 text-green-800' : 'bg-blue-100 text-blue-700'
                }`}>
                  {otpResult.isGenerated ? '✨ Admin Generated OTP' : '📋 System OTP'}
                </span>

                {/* OTP Display */}
                <div className="flex items-center gap-3 mt-3">
                  <span className={`text-4xl font-mono font-bold tracking-[0.3em] ${
                    otpResult.isGenerated ? 'text-green-700' :
                    otpResult.isExpired ? 'text-red-500' : 'text-blue-700'
                  }`}>
                    {otpResult.otp}
                  </span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(otpResult.otp); showToast('OTP copied!'); }}
                    className="px-3 py-1.5 bg-white border rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"
                  >
                    📋 Copy
                  </button>
                </div>

                {/* Validity */}
                <p className={`text-xs mt-2 font-semibold ${
                  otpResult.isGenerated ? 'text-green-600' :
                  otpResult.isExpired ? 'text-red-500' : 'text-blue-600'
                }`}>
                  {otpResult.isGenerated
                    ? `⏳ 10 minutes valid — Jaldi customer ko batao!`
                    : otpResult.isExpired ? '⏰ Ye OTP expire ho gaya hai — Naya banao'
                    : `✅ ${otpResult.timeRemaining}`
                  }
                </p>

                {/* Instructions */}
                <div className="mt-3 p-3 bg-white rounded-xl border text-xs text-gray-600">
                  <p className="font-bold text-gray-700 mb-1">📞 Customer ko batao:</p>
                  <p>"Aapka OTP hai: <strong className="text-lg text-gray-900">{otpResult.otp}</strong>"</p>
                  <p className="mt-1 text-gray-400">App pe 'Enter OTP' screen pe ye type kare → Login ho jayega</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── FILTER TABS ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-5">
        {([
          { key: 'all',      label: '🏪 Sabhi',            color: 'bg-gray-100 text-gray-700' },
          { key: 'active',   label: '✅ Active (On)',       color: 'bg-green-100 text-green-700' },
          { key: 'inactive', label: '⛔ Inactive (Off)',    color: 'bg-red-100 text-red-700' },
          { key: 'live',     label: '🟢 Vendor Live',       color: 'bg-emerald-100 text-emerald-700' },
          { key: 'offline',  label: '🔴 Vendor Offline',    color: 'bg-orange-100 text-orange-700' },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => { setFilterTab(tab.key); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition ${
              filterTab === tab.key
                ? `${tab.color} border-current`
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            {tab.label} <span className="ml-1 opacity-70">({counts[tab.key]})</span>
          </button>
        ))}
      </div>

      {/* ─── SEARCH ──────────────────────────────────────────────── */}
      <input
        className="border px-4 py-2 rounded-xl mb-5 w-full md:w-1/2 focus:ring-2 focus:ring-orange-400 focus:outline-none"
        placeholder="🔍 Search by name, address, cuisine, vendor..."
        value={search}
        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
      />

      {/* Hidden file input for restaurant image */}
      <input type="file" accept="image/*" ref={restImageRef} className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file && activeRestImageId) handleRestImageUpload(activeRestImageId, file);
        }}
      />
      {/* ─── RESTAURANT CARDS ────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading restaurants...</div>
      ) : error ? (
        <div className="text-red-500 py-4">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginated.length === 0 ? (
              <div className="col-span-3 text-center py-16 text-gray-400">
                <FaStore className="text-5xl mx-auto mb-3 text-gray-200" />
                <p>Is filter mein koi restaurant nahi mila</p>
              </div>
            ) : paginated.map(restaurant => {
              const vendorIsLive = getVendorIsLive(restaurant);
              const vendorName = getVendorName(restaurant);
              return (
                <div key={restaurant._id} className={`bg-white rounded-2xl shadow border overflow-hidden flex flex-col transition ${
                  !restaurant.isActive ? 'border-red-100 opacity-80' : vendorIsLive ? 'border-green-100' : 'border-orange-50'
                }`}>
                  {/* Restaurant Image */}
                  <div className="relative h-36 bg-gray-100 group">
                    {restaurant.image ? (
                      <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <FaStore className="text-4xl" />
                      </div>
                    )}
                    {/* Image upload overlay */}
                    <button
                      onClick={() => { setActiveRestImageId(restaurant._id); restImageRef.current?.click(); }}
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center opacity-0 group-hover:opacity-100"
                      title="Restaurant image change karo"
                    >
                      {uploadingRestImage === restaurant._id ? (
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <div className="flex flex-col items-center text-white">
                          <FaCamera className="text-2xl" />
                          <span className="text-xs mt-1 font-semibold">Change Photo</span>
                        </div>
                      )}
                    </button>

                    {/* ─── STATUS BADGES ─── */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {/* Restaurant Active/Inactive */}
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full shadow ${
                        restaurant.isActive ? 'bg-green-500 text-white' : 'bg-gray-700 text-white'
                      }`}>
                        {restaurant.isActive ? '✅ Active' : '⛔ Inactive'}
                      </span>
                      {/* Vendor Live/Offline */}
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full shadow ${
                        vendorIsLive ? 'bg-emerald-400 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {vendorIsLive ? '🟢 Vendor Live' : '🔴 Vendor Offline'}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-gray-800 text-base leading-tight">{restaurant.name}</h3>
                      {restaurant.rating && (
                        <span className="flex items-center gap-0.5 text-xs font-bold text-amber-600 shrink-0">
                          <FaStar /> {restaurant.rating}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-1 truncate">📍 {addressStr(restaurant.address)}</p>
                    <p className="text-xs text-gray-400 mb-1">👤 {vendorName}</p>
                    <span className="inline-block text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full w-fit mb-3">
                      {restaurant.cuisine}
                    </span>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {/* Menu Management */}
                      <button
                        onClick={() => openMenuModal(restaurant)}
                        className="flex-1 flex items-center justify-center gap-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-xl text-sm font-semibold transition active:scale-95"
                      >
                        <FaUtensils /> Menu Manage
                      </button>

                      {/* Restaurant Active Toggle */}
                      <button
                        onClick={() => handleToggleActive(restaurant._id, !restaurant.isActive)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                          restaurant.isActive
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                        title={restaurant.isActive ? 'Restaurant ko Inactive karo' : 'Restaurant ko Active karo'}
                      >
                        {restaurant.isActive ? '⛔ Set Off' : '✅ Set On'}
                      </button>

                      {/* Vendor Live Toggle */}
                      <button
                        onClick={() => handleVendorLiveToggle(restaurant)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                          vendorIsLive
                            ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                        title={vendorIsLive ? 'Vendor ko Offline karo' : 'Vendor ko Live karo'}
                      >
                        {vendorIsLive ? '🔴 Go Offline' : '🟢 Go Live'}
                      </button>

                      {/* Delete */}
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(restaurant._id, restaurant.name)}
                          className="px-3 py-2 bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl text-xs transition"
                          title="Delete restaurant"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
              <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
              <button className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
            </div>
          )}
        </>
      )}


      {/* ═══════════════════════════════════════════════════════════════
           MENU MANAGEMENT MODAL
      ════════════════════════════════════════════════════════════════ */}
      {showMenuModal && selectedRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex z-50 p-0 md:p-4 items-stretch md:items-center justify-center">
          <div className="bg-white w-full md:max-w-3xl md:rounded-2xl shadow-2xl flex flex-col max-h-screen overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b bg-white sticky top-0 z-10">
              {selectedRestaurant.image && (
                <img src={selectedRestaurant.image} alt="" className="w-10 h-10 rounded-xl object-cover border" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 truncate">{selectedRestaurant.name}</h3>
                <p className="text-xs text-gray-400">{menuItems.length} items</p>
              </div>
              <button
                onClick={openAddItem}
                className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold"
              >
                <FaPlus /> Add Item
              </button>
              <button onClick={() => { setShowMenuModal(false); setShowItemForm(false); }}
                className="text-gray-400 hover:text-gray-600 text-xl ml-1">
                <FaTimes />
              </button>
            </div>

            {/* Add/Edit Item Form — slides in */}
            {showItemForm && (
              <div className="border-b bg-orange-50 px-5 py-4">
                <div className="flex items-center gap-2 mb-4">
                  <h4 className="font-bold text-orange-700">{editingItem ? '✏️ Item Edit Karo' : '➕ Naya Item Add Karo'}</h4>
                  <button onClick={() => { setShowItemForm(false); setEditingItem(null); }}
                    className="ml-auto text-gray-400 hover:text-gray-600"><FaTimes /></button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Item Image */}
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">📷 Item Image</label>
                    <div className="flex items-center gap-3">
                      {itemImagePreview ? (
                        <div className="relative">
                          <img src={itemImagePreview} alt="preview" className="w-20 h-14 object-cover rounded-lg border-2 border-orange-200" />
                          <button onClick={() => { setItemImage(null); setItemImagePreview(''); }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">×</button>
                        </div>
                      ) : (
                        <div className="w-20 h-14 rounded-lg border-2 border-dashed border-orange-300 flex items-center justify-center bg-white">
                          <FaImage className="text-orange-300 text-xl" />
                        </div>
                      )}
                      <div>
                        <input type="file" accept="image/*" ref={itemImageRef}
                          className="hidden" onChange={handleItemImageChange} />
                        <button onClick={() => itemImageRef.current?.click()}
                          className="flex items-center gap-1 text-xs bg-white border border-orange-300 text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-50">
                          <FaCamera /> {itemImagePreview ? 'Change' : 'Upload Image'}
                        </button>
                        <p className="text-xs text-gray-400 mt-1">Max 5MB, JPG/PNG</p>
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Item Name *</label>
                    <input
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                      placeholder="e.g. Paneer Butter Masala"
                      value={itemForm.name}
                      onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>

                  {/* Description */}
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                    <textarea
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none resize-none"
                      placeholder="Item ke baare mein batao..."
                      rows={2}
                      value={itemForm.description || ''}
                      onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Price (₹) *</label>
                    <input
                      type="number" min="1"
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                      placeholder="e.g. 180"
                      value={itemForm.price || ''}
                      onChange={e => setItemForm(f => ({ ...f, price: Number(e.target.value) }))}
                    />
                  </div>

                  {/* Prep Time */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1"><FaClock className="inline" /> Prep Time (mins)</label>
                    <input
                      type="number" min="1"
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                      placeholder="15"
                      value={itemForm.preparationTime || ''}
                      onChange={e => setItemForm(f => ({ ...f, preparationTime: Number(e.target.value) }))}
                    />
                  </div>

                  {/* Category */}
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1"><FaTag className="inline" /> Category</label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setItemForm(f => ({ ...f, category: cat }))}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${itemForm.category === cat
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Veg / Non-Veg */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="vegType" checked={itemForm.isVeg !== false}
                          onChange={() => setItemForm(f => ({ ...f, isVeg: true }))} className="accent-green-500" />
                        <span className="text-sm font-semibold text-green-700">🟢 Veg</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="vegType" checked={itemForm.isVeg === false}
                          onChange={() => setItemForm(f => ({ ...f, isVeg: false }))} className="accent-red-500" />
                        <span className="text-sm font-semibold text-red-700">🔴 Non-Veg</span>
                      </label>
                    </div>
                  </div>

                  {/* Available */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Availability</label>
                    <button
                      type="button"
                      onClick={() => setItemForm(f => ({ ...f, isAvailable: !f.isAvailable }))}
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${itemForm.isAvailable
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {itemForm.isAvailable ? '✅ Available' : '❌ Unavailable'}
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveItem}
                  disabled={savingItem || !itemForm.name || !itemForm.price}
                  className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition active:scale-95"
                >
                  {savingItem
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <FaCheck />
                  }
                  {savingItem ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            )}

            {/* Menu Items List */}
            <div className="overflow-y-auto flex-1 px-4 py-3">
              {menuLoading ? (
                <div className="text-center py-10 text-gray-400">Loading menu...</div>
              ) : menuItems.length === 0 ? (
                <div className="text-center py-12">
                  <FaUtensils className="text-5xl text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400">Koi menu item nahi hai abhi</p>
                  <button onClick={openAddItem} className="mt-3 bg-orange-500 text-white px-5 py-2 rounded-xl text-sm font-semibold">
                    Pehla Item Add Karo
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {menuItems.map(item => (
                    <div key={item._id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition ${item.isAvailable ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-200 opacity-70'}`}>
                      {/* Item Image */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border">
                        {itemImageUrl(item.image) ? (
                          <img src={itemImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <FaUtensils />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.isVeg !== false ? 'bg-green-500' : 'bg-red-500'}`} />
                          <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                        </div>
                        {item.description && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">{item.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {item.category && (
                            <span className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-medium">{item.category}</span>
                          )}
                          {item.preparationTime && (
                            <span className="text-xs text-gray-400"><FaClock className="inline" /> {item.preparationTime}m</span>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <p className="font-bold text-orange-600 shrink-0">₹{item.price}</p>

                      {/* Actions */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <button onClick={() => openEditItem(item)}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition" title="Edit">
                          <FaEdit className="text-xs" />
                        </button>
                        <button onClick={() => handleToggleAvailability(item)}
                          className={`p-1.5 rounded-lg transition text-xs ${item.isAvailable ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                          title={item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}>
                          {item.isAvailable ? '✅' : '❌'}
                        </button>
                        <button onClick={() => handleDeleteItem(item)}
                          className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition" title="Delete">
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default RestaurantManagement;