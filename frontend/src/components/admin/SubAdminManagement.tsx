import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Toast from './Toast';
import { useAdminSession } from './AdminSessionContext';
import { FaUserShield, FaEdit, FaTrash, FaPlus, FaTimes, FaCheck } from 'react-icons/fa';

interface SubAdmin {
  _id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

const AVAILABLE_PERMISSIONS = [
  'read', 'write', 'delete', 'manage_users', 'manage_restaurants', 'manage_orders', 'view_analytics'
];

export default function SubAdminManagement() {
  const { adminRole, adminName } = useAdminSession();
  const [admins, setAdmins] = useState<SubAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<SubAdmin | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    permissions: [] as string[],
    isActive: true
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await adminAPI.getSubAdmins();
      if (res.data.success) {
        setAdmins(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch admins', err);
      showToast('Failed to load sub-admins', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (admin?: SubAdmin) => {
    if (admin) {
      setEditingAdmin(admin);
      setForm({
        name: admin.name,
        email: admin.email,
        password: '', // Password is not returned or easily updated, keep empty
        role: admin.role,
        permissions: admin.permissions || [],
        isActive: admin.isActive
      });
    } else {
      setEditingAdmin(null);
      setForm({
        name: '',
        email: '',
        password: '',
        role: 'admin',
        permissions: [],
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleTogglePermission = (perm: string) => {
    setForm(prev => {
      const perms = prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm];
      return { ...prev, permissions: perms };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        const updateData = { ...form };
        if (!updateData.password) delete (updateData as any).password;
        
        const res = await adminAPI.updateSubAdmin(editingAdmin._id, updateData);
        if (res.data.success) {
          showToast('Admin updated successfully', 'success');
          fetchAdmins();
          setIsModalOpen(false);
        }
      } else {
        if (!form.password) {
          showToast('Password is required for new admin', 'error');
          return;
        }
        const res = await adminAPI.createSubAdmin(form);
        if (res.data.success) {
          showToast('Admin created successfully', 'success');
          fetchAdmins();
          setIsModalOpen(false);
        }
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        const res = await adminAPI.deleteSubAdmin(id);
        if (res.data.success) {
          showToast('Admin deleted successfully', 'success');
          fetchAdmins();
        }
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Failed to delete admin', 'error');
      }
    }
  };

  if (adminRole !== 'super_admin') {
    return (
      <div className="p-8 text-center text-gray-500">
        <FaUserShield className="mx-auto text-5xl text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700">Access Denied</h2>
        <p>Only Super Admins can manage Sub-Admins.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sub-Admin Roles & Permissions</h2>
          <p className="text-gray-500 text-sm mt-1">Manage admin users and their access levels</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <FaPlus /> Add Sub-Admin
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Admin Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Created</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.map(admin => (
                <tr key={admin._id} className="hover:bg-orange-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                        {admin.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{admin.name}</div>
                        <div className="text-xs text-gray-500">{admin.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      admin.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                      admin.role === 'moderator' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {admin.role.replace('_', ' ').toUpperCase()}
                    </span>
                    <div className="text-[10px] text-gray-400 mt-1 max-w-[150px] truncate">
                      {admin.permissions.join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                      admin.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${admin.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(admin)}
                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Edit Admin"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDelete(admin._id)}
                        disabled={admin.name === adminName}
                        className={`p-2 rounded-lg transition-colors ${admin.name === adminName ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                        title={admin.name === adminName ? "Cannot delete yourself" : "Delete Admin"}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No admins found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaUserShield className="text-orange-500" />
                {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      required 
                      type="email" 
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {editingAdmin ? 'New Password (Optional)' : 'Password'}
                    </label>
                    <input 
                      type="password"
                      required={!editingAdmin}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                      value={form.password}
                      onChange={e => setForm({...form, password: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                    <select 
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none bg-white"
                      value={form.role}
                      onChange={e => setForm({...form, role: e.target.value})}
                    >
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                      <option value="moderator">Moderator</option>
                    </select>
                  </div>
                </div>

                {editingAdmin && (
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={form.isActive} 
                        onChange={e => setForm({...form, isActive: e.target.checked})}
                        className="rounded text-orange-600 focus:ring-orange-500"
                      />
                      Active Account
                    </label>
                  </div>
                )}

                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3 border-b pb-2">Permissions</label>
                  <div className="grid grid-cols-2 gap-3">
                    {AVAILABLE_PERMISSIONS.map(perm => (
                      <label key={perm} className={`flex items-start gap-2 p-2 rounded border cursor-pointer transition-colors ${
                        form.permissions.includes(perm) ? 'border-orange-200 bg-orange-50' : 'border-gray-100 hover:bg-gray-50'
                      }`}>
                        <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                          form.permissions.includes(perm) ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                        }`}>
                          {form.permissions.includes(perm) && <FaCheck className="text-white text-[10px]" />}
                        </div>
                        <span className="text-xs font-medium text-gray-700 capitalize">
                          {perm.replace('_', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-sm"
                >
                  {editingAdmin ? 'Save Changes' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
