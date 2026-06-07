import React, { useState, useEffect } from 'react';
import Toast from './Toast';
import { useAdminSession } from './AdminSessionContext';
import { FaUser, FaEnvelope, FaUserShield, FaEdit, FaTrash, FaTimes, FaCheck, FaPhone, FaSearch, FaPlus, FaKey, FaStore, FaTruck, FaThList } from 'react-icons/fa';
import { adminAPI } from '../../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  restaurantId?: any;
}

// ── Create Vendor Modal ────────────────────────────────────────────────────────
const CreateVendorModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', restaurantName: '', restaurantAddress: '', cuisine: 'Mixed' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cuisines = ['Mixed', 'Indian', 'Chinese', 'South Indian', 'North Indian', 'Fast Food', 'Street Food', 'Vegetarian'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await adminAPI.createVendor(form);
      if (res.data.success) {
        onSuccess();
        onClose();
        setForm({ name: '', email: '', phone: '', password: '', restaurantName: '', restaurantAddress: '', cuisine: 'Mixed' });
      } else {
        setError(res.data.message || 'Failed to create vendor');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create vendor');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-orange-700 flex items-center gap-2"><FaStore /> Create Vendor</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl"><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">{error}</div>}
          
          <div className="bg-orange-50 rounded-lg p-3 mb-2">
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-3">Vendor Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" placeholder="Full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
                <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" placeholder="10-digit phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                <input required type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" placeholder="email@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Password *</label>
                <input required type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" placeholder="Min 6 chars" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-3">Restaurant Details</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Restaurant Name *</label>
                <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" placeholder="e.g. Sharma Ji Ka Dhaba" value={form.restaurantName} onChange={e => setForm(f => ({ ...f, restaurantName: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Cuisine</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none bg-white" value={form.cuisine} onChange={e => setForm(f => ({ ...f, cuisine: e.target.value }))}>
                    {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" placeholder="Full address" value={form.restaurantAddress} onChange={e => setForm(f => ({ ...f, restaurantAddress: e.target.value }))} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
            <strong>Default PIN:</strong> 1234 &nbsp;|&nbsp; Vendor can change it after login
          </div>

          <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FaPlus />}
            {loading ? 'Creating...' : 'Create Vendor & Restaurant'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Create Delivery Modal ─────────────────────────────────────────────────────
const CreateDeliveryModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', vehicleNumber: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await adminAPI.createDelivery(form);
      if (res.data.success) {
        onSuccess();
        onClose();
        setForm({ name: '', email: '', phone: '', password: '', vehicleNumber: '' });
      } else {
        setError(res.data.message || 'Failed to create delivery person');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create delivery person');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-blue-700 flex items-center gap-2"><FaTruck /> Create Delivery Boy</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl"><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">{error}</div>}
          {[
            { label: 'Name *', key: 'name', type: 'text', placeholder: 'Full name' },
            { label: 'Phone *', key: 'phone', type: 'tel', placeholder: '10-digit phone' },
            { label: 'Email *', key: 'email', type: 'email', placeholder: 'email@example.com' },
            { label: 'Password *', key: 'password', type: 'password', placeholder: 'Min 6 characters' },
            { label: 'Vehicle Number *', key: 'vehicleNumber', type: 'text', placeholder: 'e.g. UP32 AB 1234' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input required type={type} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" placeholder={placeholder} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
          <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
            <strong>Default PIN:</strong> 5678
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FaPlus />}
            {loading ? 'Creating...' : 'Create Delivery Boy'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Reset Password Modal ──────────────────────────────────────────────────────
const ResetPasswordModal: React.FC<{ user: User | null; isOpen: boolean; onClose: () => void; onSuccess: (msg: string) => void }> = ({ user, isOpen, onClose, onSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!user) return;
    setError('');
    setLoading(true);
    try {
      const res = await adminAPI.resetUserPassword(user._id, user.role as 'vendor' | 'delivery', newPassword);
      if (res.data.success) {
        onSuccess(res.data.message);
        onClose();
        setNewPassword(''); setConfirmPassword('');
      } else {
        setError(res.data.message || 'Failed to reset password');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><FaKey className="text-yellow-500" /> Reset Password</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
            <p className="font-semibold text-gray-800">{user.name}</p>
            <p>{user.email} &bull; <span className="capitalize">{user.role}</span></p>
          </div>
          {error && <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
            <input required type="password" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 focus:outline-none" placeholder="Min 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Confirm Password</label>
            <input required type="password" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 focus:outline-none" placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FaKey />}
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Edit Modal ────────────────────────────────────────────────────────────────
const EditModal: React.FC<{ user: User | null; isOpen: boolean; onClose: () => void; onSave: (user: User, formData: any) => void }> = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'vendor' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setFormData({ name: user.name || '', email: user.email || '', phone: user.phone || '', role: user.role || 'vendor' });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try { await onSave(user, formData); onClose(); } catch {} finally { setSaving(false); }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><FaEdit className="text-blue-500" /> Edit User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
        </div>
        <div className="p-5 space-y-3">
          {[
            { label: 'Name', icon: <FaUser />, key: 'name', type: 'text' },
            { label: 'Email', icon: <FaEnvelope />, key: 'email', type: 'email' },
            { label: 'Phone', icon: <FaPhone />, key: 'phone', type: 'tel' },
          ].map(({ label, icon, key, type }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
                <input type={type} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" value={(formData as any)[key]} onChange={e => setFormData(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FaCheck />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Delete Modal ──────────────────────────────────────────────────────────────
const DeleteModal: React.FC<{ user: User | null; isOpen: boolean; onClose: () => void; onConfirm: (id: string, role: string) => void }> = ({ user, isOpen, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);
  const handleConfirm = async () => {
    if (!user) return;
    setDeleting(true);
    try { await onConfirm(user._id, user.role); onClose(); } finally { setDeleting(false); }
  };
  if (!isOpen || !user) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"><FaTrash className="text-red-500" /></div>
          <div><h3 className="font-bold text-gray-800">Delete User</h3><p className="text-xs text-gray-500">This cannot be undone</p></div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
          <p className="font-semibold">{user.name}</p>
          <p className="text-gray-500">{user.email} &bull; {user.role}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleConfirm} disabled={deleting} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            {deleting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FaTrash />}
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
          <button onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold">Cancel</button>
        </div>
      </div>
    </div>
  );
};

// ── User Stats Modal ────────────────────────────────────────────────────────────
export const UserStatsModal: React.FC<{ user: User | null; isOpen: boolean; onClose: () => void }> = ({ user, isOpen, onClose }) => {
  const [stats, setStats] = useState<{ totalOrders: number; deliveredOrders: number; cancelledOrders: number; revenue?: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setLoading(true);
      adminAPI.getUserStats(user._id, user.role)
        .then(res => setStats(res.data.data))
        .catch(() => setStats(null))
        .finally(() => setLoading(false));
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-5 text-white">
          <button onClick={onClose} className="absolute top-3 right-3 text-white/70 hover:text-white"><FaTimes /></button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold backdrop-blur-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">{user.name}</h3>
              <p className="text-white/80 text-sm capitalize">{user.role} Stats</p>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-4 bg-gray-50">
          {loading ? (
            <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : stats ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-center">
                <p className="text-xs text-gray-500 mb-1">Total Orders</p>
                <p className="text-xl font-bold text-gray-800">{stats.totalOrders}</p>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-center">
                <p className="text-xs text-gray-500 mb-1">Delivered</p>
                <p className="text-xl font-bold text-green-600">{stats.deliveredOrders}</p>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-center">
                <p className="text-xs text-gray-500 mb-1">Cancelled</p>
                <p className="text-xl font-bold text-red-500">{stats.cancelledOrders}</p>
              </div>
              {stats.revenue !== undefined && stats.revenue > 0 && (
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-center">
                  <p className="text-xs text-gray-500 mb-1">Revenue</p>
                  <p className="text-xl font-bold text-indigo-600">₹{stats.revenue}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-red-500 text-sm py-4">Failed to load stats.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const [createVendorOpen, setCreateVendorOpen] = useState(false);
  const [createDeliveryOpen, setCreateDeliveryOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const { isLoggedIn } = useAdminSession();

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers();
      if (response.data.success) {
        const userData = response.data.data;
        let allUsers: User[] = [];
        if (userData.vendors && Array.isArray(userData.vendors)) {
          allUsers = [...allUsers, ...userData.vendors.map((v: any) => ({ ...v, role: 'vendor' }))];
        }
        if (userData.deliveryPersons && Array.isArray(userData.deliveryPersons)) {
          allUsers = [...allUsers, ...userData.deliveryPersons.map((d: any) => ({ ...d, role: 'delivery' }))];
        }
        if (userData.customers && Array.isArray(userData.customers)) {
          allUsers = [...allUsers, ...userData.customers.map((c: any) => ({ ...c, role: 'customer' }))];
        }
        setUsers(allUsers);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSaveEdit = async (user: User, formData: any) => {
    const response = await adminAPI.updateUser(user._id, { ...formData, role: formData.role });
    if (response.data.success) {
      setUsers(users => users.map(u => u._id === user._id ? { ...u, ...formData } : u));
      showToast('User updated successfully');
    } else {
      showToast(response.data.message || 'Failed to update', 'error');
    }
  };

  const handleConfirmDelete = async (id: string, role: string) => {
    const response = await adminAPI.deleteUser(id, role);
    if (response.data.success) {
      setUsers(users => users.filter(u => u._id !== id));
      showToast('User deleted successfully');
    } else {
      showToast(response.data.message || 'Failed to delete', 'error');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });
  const paginated = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-3xl font-bold text-amber-900">User Management</h2>
        <div className="flex gap-2">
          <button onClick={() => setCreateVendorOpen(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-semibold text-sm shadow transition active:scale-95">
            <FaStore /> Add Vendor
          </button>
          <button onClick={() => setCreateDeliveryOpen(true)} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold text-sm shadow transition active:scale-95">
            <FaTruck /> Add Delivery Boy
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: users.length, color: 'from-indigo-500 to-indigo-600', icon: <FaUser className="text-2xl text-indigo-200" /> },
          { label: 'Vendors', value: users.filter(u => u.role === 'vendor').length, color: 'from-orange-500 to-orange-600', icon: <FaStore className="text-2xl text-orange-200" /> },
          { label: 'Delivery Staff', value: users.filter(u => u.role === 'delivery').length, color: 'from-blue-500 to-blue-600', icon: <FaTruck className="text-2xl text-blue-200" /> },
          { label: 'Customers', value: users.filter(u => u.role === 'customer').length, color: 'from-green-500 to-green-600', icon: <FaUser className="text-2xl text-green-200" /> },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className={`bg-gradient-to-r ${color} text-white p-4 rounded-xl flex items-center justify-between shadow`}>
            <div><p className="text-xs opacity-80">{label}</p><p className="text-2xl font-bold">{value}</p></div>
            {icon}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
        </div>
        <select className="pl-3 pr-8 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-orange-400 focus:outline-none" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }}>
          <option value="all">All Roles</option>
          <option value="vendor">Vendors</option>
          <option value="delivery">Delivery Staff</option>
          <option value="customer">Customers</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading users...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl shadow">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gradient-to-r from-orange-50 to-amber-50">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Name</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Phone</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Role</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-gray-400">No users found</td></tr>
                ) : paginated.map((user, idx) => (
                  <tr key={user._id} className={`border-b transition hover:bg-orange-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800 text-sm">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{user.phone || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'vendor' ? 'bg-orange-100 text-orange-700' : 
                        user.role === 'delivery' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {user.role === 'vendor' ? <FaStore className="text-xs" /> : 
                         user.role === 'delivery' ? <FaTruck className="text-xs" /> :
                         <FaUser className="text-xs" />}
                        {user.role === 'vendor' ? 'Vendor' : user.role === 'delivery' ? 'Delivery' : 'Customer'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setSelectedUser(user); setStatsModalOpen(true); }} className="p-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition flex items-center gap-1 text-xs font-semibold" title="View Stats">
                          <FaThList className="text-xs" /> Stats
                        </button>
                        <button onClick={() => { setSelectedUser(user); setEditModalOpen(true); }} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition" title="Edit"><FaEdit className="text-xs" /></button>
                        <button onClick={() => { setSelectedUser(user); setResetPasswordOpen(true); }} className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition" title="Reset Password"><FaKey className="text-xs" /></button>
                        <button onClick={() => { setSelectedUser(user); setDeleteModalOpen(true); }} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition" title="Delete"><FaTrash className="text-xs" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-4">
              <button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-sm font-medium" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Previous</button>
              <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
              <button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-sm font-medium" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next →</button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <CreateVendorModal isOpen={createVendorOpen} onClose={() => setCreateVendorOpen(false)} onSuccess={() => { fetchUsers(); showToast('Vendor created successfully! 🎉'); }} />
      <CreateDeliveryModal isOpen={createDeliveryOpen} onClose={() => setCreateDeliveryOpen(false)} onSuccess={() => { fetchUsers(); showToast('Delivery boy created successfully! 🚴'); }} />
      <EditModal user={selectedUser} isOpen={editModalOpen} onClose={() => { setEditModalOpen(false); setSelectedUser(null); }} onSave={handleSaveEdit} />
      <DeleteModal user={selectedUser} isOpen={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setSelectedUser(null); }} onConfirm={handleConfirmDelete} />
      <ResetPasswordModal user={selectedUser} isOpen={resetPasswordOpen} onClose={() => { setResetPasswordOpen(false); setSelectedUser(null); }} onSuccess={msg => showToast(msg)} />
      <UserStatsModal user={selectedUser} isOpen={statsModalOpen} onClose={() => { setStatsModalOpen(false); setSelectedUser(null); }} />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default UserManagement;