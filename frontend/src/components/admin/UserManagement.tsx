import React, { useState, useEffect } from 'react';
import Toast from './Toast';
import { useAdminSession } from './AdminSessionContext';
import { FaUser, FaEnvelope, FaUserShield, FaEdit, FaTrash, FaTimes, FaCheck, FaPhone, FaSearch } from 'react-icons/fa';
import { adminAPI } from '../../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  restaurantId?: any;
}

interface EditModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User, formData: any) => void;
}

interface DeleteModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, role: string) => void;
}

// Edit Modal Component
const EditModal: React.FC<EditModalProps> = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'vendor' });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'vendor'
      });
      setErrors({});
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    console.log('EditModal handleSave called');
    console.log('User:', user);
    console.log('FormData:', formData);
    
    const isValid = validateForm();
    console.log('Form validation result:', isValid);
    console.log('Validation errors:', errors);
    
    if (!isValid || !user) {
      console.log('Validation failed or no user, returning early');
      return;
    }
    
    setSaving(true);
    try {
      console.log('Calling onSave with:', { user, formData });
      await onSave(user, formData);
      console.log('onSave completed successfully');
      onClose();
    } catch (error) {
      console.error('Error in handleSave:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Edit User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter name"
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <div className="relative">
              <FaUserShield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              >
                <option value="vendor">Vendor</option>
                <option value="delivery">Delivery Person</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <FaCheck />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2"
          >
            <FaTimes />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteModal: React.FC<DeleteModalProps> = ({ user, isOpen, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!user) return;
    
    setDeleting(true);
    try {
      await onConfirm(user._id, user.role);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <FaTrash className="text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Delete User</h3>
            <p className="text-sm text-gray-600">This action cannot be undone</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 mb-2">
            Are you sure you want to delete <strong>{user.name}</strong>?
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {deleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <FaTrash />
            )}
            {deleting ? 'Deleting...' : 'Delete User'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2"
          >
            <FaTimes />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const usersPerPage = 10;
  const { adminName } = useAdminSession();
  const isAdmin = adminName === 'admin';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getUsers();
        if (response.data.success) {
          // Handle the response structure from backend
          const userData = response.data.data;
          let allUsers: User[] = [];
          
          if (userData.vendors && Array.isArray(userData.vendors)) {
            allUsers = [...allUsers, ...userData.vendors.map((vendor: any) => ({
              ...vendor,
              role: 'vendor'
            }))];
          }
          
          if (userData.deliveryPersons && Array.isArray(userData.deliveryPersons)) {
            allUsers = [...allUsers, ...userData.deliveryPersons.map((delivery: any) => ({
              ...delivery,
              role: 'delivery'
            }))];
          }
          
          setUsers(allUsers);
        } else {
          setError('Failed to load users.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load users.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleSaveEdit = async (user: User, formData: any) => {
    console.log('handleSaveEdit called with:', { user, formData });
    
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role
      };
      
      console.log('Sending update request with data:', updateData);
      console.log('User ID:', user._id);
      
      const response = await adminAPI.updateUser(user._id, updateData);
      
      console.log('API response:', response);
      
      if (response.data.success) {
        setUsers(users => users.map(u => u._id === user._id ? { ...u, ...formData } : u));
        showToast('User updated successfully.');
      } else {
        console.error('API returned success: false', response.data);
        showToast(response.data.message || 'Failed to update user.', 'error');
      }
    } catch (err: any) {
      console.error('Error in handleSaveEdit:', err);
      console.error('Error response:', err.response);
      showToast(err.response?.data?.message || 'Failed to update user.', 'error');
    }
  };

  const handleConfirmDelete = async (id: string, role: string) => {
    try {
      const response = await adminAPI.deleteUser(id, role);
      
      if (response.data.success) {
        setUsers(users => users.filter(u => u._id !== id));
        showToast('User deleted successfully.');
      } else {
        showToast(response.data.message || 'Failed to delete user.', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete user.', 'error');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                         user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });
  
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-4 text-amber-900">User Management</h2>
      {loading ? <div>Loading users...</div> : error ? <div className="text-red-500">{error}</div> : <>
      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Search users by name or email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="relative">
          <FaUserShield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">All Roles</option>
            <option value="vendor">Vendors</option>
            <option value="delivery">Delivery Staff</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <FaUser className="text-3xl text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Vendors</p>
              <p className="text-2xl font-bold">{users.filter(u => u.role === 'vendor').length}</p>
            </div>
            <FaUserShield className="text-3xl text-orange-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Delivery Staff</p>
              <p className="text-2xl font-bold">{users.filter(u => u.role === 'delivery').length}</p>
            </div>
            <FaUser className="text-3xl text-green-200" />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-orange-50">
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Role</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user, idx) => (
              <tr key={user._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-orange-50'}>
                <td className="py-2 px-4 border-b group transition hover:bg-orange-100">{user.name}</td>
                <td className="py-2 px-4 border-b group transition hover:bg-orange-100">{user.email}</td>
                <td className="py-2 px-4 border-b group transition hover:bg-orange-100">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 
                    user.role === 'vendor' ? 'bg-orange-100 text-orange-700' : 
                    user.role === 'delivery' ? 'bg-blue-100 text-blue-700' : 
                    'bg-emerald-100 text-emerald-700'
                  }`}>{user.role}</span>
                </td>
                <td className="py-2 px-4 border-b group transition hover:bg-orange-100">
                  <div className="flex gap-2">
                    <button 
                      className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-lg text-sm transition hover:bg-blue-600 active:scale-95" 
                      onClick={() => handleEdit(user)}
                    >
                      <FaEdit className="text-xs" />
                      Edit
                    </button>
                    {isAdmin && (
                      <button 
                        className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-lg text-sm transition hover:bg-red-600 active:scale-95" 
                        onClick={() => handleDelete(user)}
                      >
                        <FaTrash className="text-xs" />
                        Delete
                      </button>
                    )}
                  </div>
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
      </>
      }
      
      {/* Edit Modal */}
      <EditModal
        user={selectedUser}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveEdit}
      />
      
      {/* Delete Modal */}
      <DeleteModal
        user={selectedUser}
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmDelete}
      />
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default UserManagement; 