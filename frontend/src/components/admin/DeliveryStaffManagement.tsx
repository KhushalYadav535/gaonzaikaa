import React, { useState, useEffect } from 'react';
import { FaUserTie, FaPhone, FaCheckCircle, FaTruck, FaUserSlash, FaEdit, FaTrash, FaPlus, FaUserCircle, FaThList, FaThLarge, FaSearch } from 'react-icons/fa';
import { adminAPI, authAPI } from '../../services/api';
import Toast from './Toast';

const statusColors: { [key: string]: string } = {
  active: 'bg-gradient-to-r from-emerald-200 to-emerald-400 text-emerald-900',
  on_delivery: 'bg-gradient-to-r from-blue-200 to-blue-400 text-blue-900 animate-pulse',
  on_leave: 'bg-gradient-to-r from-red-200 to-red-400 text-red-900',
};
const statusLabels: { [key: string]: string } = {
  active: 'Active',
  on_delivery: 'On Delivery',
  on_leave: 'On Leave',
};

interface Staff {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  status?: string;
  vehicleNumber?: string;
}

const initialForm = { name: '', phone: '', email: '', password: '', vehicleNumber: '' };

type FormType = typeof initialForm;

type ToastType = { message: string; type?: 'success' | 'error' } | null;

// Spinner component
const Spinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="w-12 h-12 border-4 border-orange-300 border-t-orange-500 rounded-full animate-spin"></div>
  </div>
);
// Skeleton card for card view
const StaffCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center animate-pulse border border-orange-100">
    <span className="w-16 h-16 rounded-full bg-orange-100 mb-3" />
    <div className="h-4 bg-orange-100 rounded w-2/3 mb-2" />
    <div className="h-3 bg-orange-100 rounded w-1/2 mb-2" />
    <div className="h-3 bg-orange-100 rounded w-3/4 mb-2" />
    <div className="h-3 bg-orange-100 rounded w-1/2 mb-2" />
    <div className="h-3 bg-orange-100 rounded w-1/3 mb-2" />
    <div className="flex gap-2 mt-2 w-full justify-center">
      <div className="w-8 h-8 bg-orange-100 rounded-full" />
      <div className="w-8 h-8 bg-orange-100 rounded-full" />
    </div>
  </div>
);
// Skeleton row for table view
const StaffRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="py-2 px-4 border-b"><div className="w-8 h-8 rounded-full bg-orange-100 inline-block mr-2" /><div className="h-4 bg-orange-100 rounded w-20 inline-block" /></td>
    <td className="py-2 px-4 border-b"><div className="h-4 bg-orange-100 rounded w-16" /></td>
    <td className="py-2 px-4 border-b"><div className="h-4 bg-orange-100 rounded w-24" /></td>
    <td className="py-2 px-4 border-b"><div className="h-4 bg-orange-100 rounded w-16" /></td>
    <td className="py-2 px-4 border-b"><div className="h-4 bg-orange-100 rounded w-14" /></td>
    <td className="py-2 px-4 border-b flex gap-2"><div className="w-8 h-8 bg-orange-100 rounded-full" /><div className="w-8 h-8 bg-orange-100 rounded-full" /></td>
  </tr>
);

const DeliveryStaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastType>(null);
  const [view, setView] = useState<'table' | 'card'>('table');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal state
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editStaff, setEditStaff] = useState<Staff | null>(null);
  const [form, setForm] = useState<FormType>(initialForm);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Search and Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching delivery staff...');
      const response = await adminAPI.getUsers({ role: 'delivery', limit: 100 });
      console.log('Fetch staff response:', response);
      
      if (response.data && response.data.success) {
        // Map vehicleDetails.number to vehicleNumber for each staff
        const staffList = (response.data.data || []).map((st: any) => ({
          ...st,
          vehicleNumber: st.vehicleDetails?.number || '',
        }));
        console.log('Processed staff list:', staffList);
        setStaff(staffList);
      } else {
        const errorMsg = response.data?.message || 'Failed to load delivery staff.';
        console.error('Fetch staff failed:', errorMsg);
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error('Fetch staff error:', err);
      const errorMsg = err.response?.data?.message || 
                      err.message || 
                      'Failed to load delivery staff.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Debug function to test API connectivity
  const testAPIConnection = async () => {
    try {
      console.log('Testing API connection...');
      const response = await adminAPI.getUsers({ role: 'delivery', limit: 1 });
      console.log('API connection test successful:', response);
      showToast('API connection working', 'success');
    } catch (error) {
      console.error('API connection test failed:', error);
      showToast('API connection failed', 'error');
    }
  };

  // Debug function to test delete endpoint
  const testDeleteEndpoint = async () => {
    try {
      if (staff.length === 0) {
        showToast('No staff available to test delete', 'error');
        return;
      }
      
      const testStaff = staff[0];
      console.log('Testing delete endpoint with staff:', testStaff);
      
      // Test the delete request without actually deleting
      const response = await adminAPI.deleteUser(testStaff._id, 'delivery');
      console.log('Delete endpoint test successful:', response);
      showToast('Delete endpoint working', 'success');
    } catch (error: any) {
      console.error('Delete endpoint test failed:', error);
      if (error.response) {
        showToast(`Delete endpoint error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`, 'error');
      } else {
        showToast('Delete endpoint test failed', 'error');
      }
    }
  };

  // Test different possible delete endpoints
  const testAllDeleteEndpoints = async () => {
    if (staff.length === 0) {
      showToast('No staff available to test', 'error');
      return;
    }
    
    const testStaff = staff[0];
    console.log('Testing all possible delete endpoints with staff:', testStaff);
    
    const endpoints = [
      { name: 'DELETE /admin/users/:id', test: () => adminAPI.deleteUser(testStaff._id, 'delivery') },
      { name: 'POST /admin/users/:id/delete', test: () => adminAPI.deleteUserPost(testStaff._id, 'delivery') }
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint.name}`);
        const response = await endpoint.test();
        console.log(`${endpoint.name} - Success:`, response);
        showToast(`${endpoint.name} working!`, 'success');
        return;
      } catch (error: any) {
        console.log(`${endpoint.name} - Failed:`, error.response?.status, error.response?.data);
      }
    }
    
    showToast('All delete endpoints failed', 'error');
  };

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  // Add Staff Handlers
  const openAdd = () => {
    setForm(initialForm);
    setShowAdd(true);
  };
  const closeAdd = () => setShowAdd(false);
  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      // Send both vehicleNumber (top-level) and vehicleDetails.number
      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        password: form.password,
        vehicleNumber: form.vehicleNumber,
        vehicleDetails: { number: form.vehicleNumber }
      };
      const res = await authAPI.registerDelivery(payload);
      if (res.data.success) {
        showToast('Staff added successfully');
        setShowAdd(false);
        fetchStaff();
      } else {
        showToast(res.data.message || 'Failed to add staff', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to add staff', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Edit Staff Handlers
  const openEdit = (st: Staff) => {
    setEditStaff(st);
    setForm({ name: st.name, phone: st.phone, email: st.email || '', password: '', vehicleNumber: st.vehicleNumber || '' });
    setShowEdit(true);
  };
  const closeEdit = () => setShowEdit(false);
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStaff) return;
    setFormLoading(true);
    try {
      const res = await adminAPI.updateUser(editStaff._id, { ...form, role: 'delivery' });
      if (res.data.success) {
        showToast('Staff updated successfully');
        setShowEdit(false);
        fetchStaff();
      } else {
        showToast(res.data.message || 'Failed to update staff', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update staff', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete Staff Handlers
  const confirmDelete = (id: string) => setDeleteId(id);
  const cancelDelete = () => setDeleteId(null);
  const handleDelete = async () => {
    if (!deleteId) return;
    
    // Validate that the staff member exists
    const staffToDelete = staff.find(s => s._id === deleteId);
    if (!staffToDelete) {
      showToast('Staff member not found', 'error');
      setDeleteId(null);
      return;
    }
    
    setDeleteLoading(true);
    try {
      console.log('Attempting to delete staff with ID:', deleteId);
      console.log('Staff details:', staffToDelete);
      
      // Try the main delete method first
      let res;
      try {
        res = await adminAPI.deleteUser(deleteId, 'delivery');
        console.log('Delete API response:', res);
      } catch (deleteError: any) {
        console.log('Main delete method failed, trying fallback:', deleteError);
        
        // If DELETE method fails with server error, try POST method
        if (deleteError.response?.status === 500) {
          console.log('Trying fallback POST delete method...');
          res = await adminAPI.deleteUserPost(deleteId, 'delivery');
          console.log('Fallback delete API response:', res);
        } else {
          throw deleteError; // Re-throw if it's not a server error
        }
      }
      
      if (res.data && res.data.success) {
        const successMsg = `Successfully deleted ${staffToDelete.name}`;
        showToast(successMsg);
        setSuccessMessage(successMsg);
        setDeleteId(null);
        // Remove the deleted staff from local state immediately
        setStaff(prevStaff => prevStaff.filter(st => st._id !== deleteId));
        // Also refresh from server to ensure consistency
        await fetchStaff();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        const errorMessage = res.data?.message || 'Failed to delete staff';
        console.error('Delete failed:', errorMessage);
        showToast(errorMessage, 'error');
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      console.error('Error headers:', err.response?.headers);
      
      let errorMessage = 'Failed to delete staff. Please try again.';
      
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 404) {
          errorMessage = 'Staff member not found on server.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to delete staff members.';
        } else if (err.response.status === 500) {
          errorMessage = `Server error occurred (${err.response.status}). Please try again later.`;
          console.error('Server error details:', err.response.data);
        } else if (err.response.status === 400) {
          errorMessage = `Bad request: ${err.response.data?.message || 'Invalid data sent to server'}`;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = `Server error (${err.response.status}): ${err.response.statusText}`;
        }
      } else if (err.request) {
        // Network error
        errorMessage = 'Network error. Please check your internet connection.';
        console.error('Network error details:', err.request);
      } else if (err.message) {
        // Other error
        errorMessage = err.message;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered staff
  const filteredStaff = staff.filter(st => {
    const matchesSearch =
      st.name.toLowerCase().includes(search.toLowerCase()) ||
      st.phone.toLowerCase().includes(search.toLowerCase()) ||
      (st.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (st.status || 'active') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const total = filteredStaff.length;
  const active = filteredStaff.filter(st => (st.status || 'active') === 'active').length;
  const onDelivery = filteredStaff.filter(st => st.status === 'on_delivery').length;
  const onLeave = filteredStaff.filter(st => st.status === 'on_leave').length;

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-amber-900"><FaUserTie /> Delivery Staff Management</h2>
      
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
          <FaCheckCircle className="text-green-500" />
          {successMessage}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Search staff by name, phone, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="on_delivery">On Delivery</option>
            <option value="on_leave">On Leave</option>
          </select>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={openAdd} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow font-semibold"><FaPlus /> Add Staff</button>
        <div className="flex gap-2">
          <button 
            onClick={testAPIConnection} 
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm"
            title="Test API Connection"
          >
            Test API
          </button>
          <button onClick={testDeleteEndpoint} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm" title="Test Delete Endpoint">Test Delete</button>
          <button onClick={testAllDeleteEndpoints} className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm" title="Test All Delete Endpoints">Test All Delete</button>
          <button onClick={() => setView('table')} className={`p-2 rounded ${view === 'table' ? 'bg-orange-200 text-orange-800' : 'bg-gray-100 text-gray-500'} transition`} title="Table View"><FaThList /></button>
          <button onClick={() => setView('card')} className={`p-2 rounded ${view === 'card' ? 'bg-orange-200 text-orange-800' : 'bg-gray-100 text-gray-500'} transition`} title="Card View"><FaThLarge /></button>
        </div>
      </div>
      {loading ? (
        view === 'table' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow-lg">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-r from-orange-100 to-orange-200 shadow-md">
                  <th className="py-2 px-4 border-b">Name</th>
                  <th className="py-2 px-4 border-b">Phone</th>
                  <th className="py-2 px-4 border-b">Email</th>
                  <th className="py-2 px-4 border-b">Vehicle Number</th>
                  <th className="py-2 px-4 border-b">Status</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, idx) => <StaffRowSkeleton key={idx} />)}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, idx) => <StaffCardSkeleton key={idx} />)}
          </div>
        )
      ) : error ? <div className="text-red-500">{error}</div> : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-4 rounded-lg flex items-center gap-3 shadow">
              <FaUserTie className="text-3xl" />
              <div>
                <div className="text-sm">Total Staff</div>
                <div className="text-2xl font-bold">{total}</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white p-4 rounded-lg flex items-center gap-3 shadow">
              <FaCheckCircle className="text-3xl" />
              <div>
                <div className="text-sm">Active</div>
                <div className="text-2xl font-bold">{active}</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white p-4 rounded-lg flex items-center gap-3 shadow">
              <FaTruck className="text-3xl" />
              <div>
                <div className="text-sm">On Delivery</div>
                <div className="text-2xl font-bold">{onDelivery}</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-red-400 to-red-500 text-white p-4 rounded-lg flex items-center gap-3 shadow">
              <FaUserSlash className="text-3xl" />
              <div>
                <div className="text-sm">On Leave</div>
                <div className="text-2xl font-bold">{onLeave}</div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow-lg">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-r from-orange-100 to-orange-200 shadow-md">
                  <th className="py-2 px-4 border-b">Name</th>
                  <th className="py-2 px-4 border-b">Phone</th>
                  <th className="py-2 px-4 border-b">Email</th>
                  <th className="py-2 px-4 border-b">Vehicle Number</th>
                  <th className="py-2 px-4 border-b">Status</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((st, idx) => (
                  <tr key={st._id} className={`${idx % 2 === 0 ? 'bg-orange-50' : 'bg-white'} hover:bg-orange-100 transition border-b border-orange-100`}>
                    <td className="py-2 px-4 border-b flex items-center gap-2">
                      {/* Avatar with initials or icon */}
                      <span className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-lg font-bold text-orange-700 shadow mr-2">
                        {st.name ? st.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : <FaUserCircle />}
                      </span>
                      <span className="flex items-center gap-2">
                        <FaUserTie className="text-orange-400" /> {st.name}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b flex items-center gap-2"><FaPhone className="text-orange-400" /> {st.phone}</td>
                    <td className="py-2 px-4 border-b">{st.email || '-'}</td>
                    <td className="py-2 px-4 border-b">{st.vehicleNumber || '-'}</td>
                    <td className="py-2 px-4 border-b">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${statusColors[st.status || 'active']} shadow transition-all duration-300`}> 
                        {st.status === 'active' && <FaCheckCircle />}
                        {st.status === 'on_delivery' && <>
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping mr-1"></span>
                          <FaTruck />
                        </>}
                        {st.status === 'on_leave' && <FaUserSlash />} 
                        {statusLabels[st.status || 'active']}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b flex gap-2">
                      <button onClick={() => openEdit(st)} className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full flex items-center justify-center" title="Edit"><FaEdit /></button>
                      <button 
                        onClick={() => confirmDelete(st._id)} 
                        disabled={deleteLoading && deleteId === st._id}
                        className={`p-2 rounded-full flex items-center justify-center transition-all ${
                          deleteLoading && deleteId === st._id 
                            ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                            : 'bg-red-500 hover:bg-red-600 text-white hover:scale-105'
                        }`} 
                        title={deleteLoading && deleteId === st._id ? 'Deleting...' : 'Delete'}
                      >
                        {deleteLoading && deleteId === st._id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <form onSubmit={handleAddSubmit} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn">
            <button type="button" className="absolute top-2 right-2 text-2xl" onClick={closeAdd}>&times;</button>
            <h3 className="text-2xl font-bold mb-4 text-orange-700 flex items-center gap-2"><FaPlus /> Add Delivery Staff</h3>
            <div className="mb-3">
              <input name="name" value={form.name} onChange={handleAddChange} required placeholder="Name" className="w-full border rounded px-3 py-2 mb-2" />
              <input name="phone" value={form.phone} onChange={handleAddChange} required placeholder="Phone" className="w-full border rounded px-3 py-2 mb-2" />
              <input name="email" value={form.email} onChange={handleAddChange} required placeholder="Email" className="w-full border rounded px-3 py-2 mb-2" />
              <input name="password" value={form.password} onChange={handleAddChange} required type="password" placeholder="Password" className="w-full border rounded px-3 py-2 mb-2" />
              <input name="vehicleNumber" value={form.vehicleNumber} onChange={handleAddChange} required placeholder="Vehicle Number" className="w-full border rounded px-3 py-2 mb-2" />
            </div>
            <button type="submit" disabled={formLoading} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold w-full">{formLoading ? 'Adding...' : 'Add Staff'}</button>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <form onSubmit={handleEditSubmit} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn">
            <button type="button" className="absolute top-2 right-2 text-2xl" onClick={closeEdit}>&times;</button>
            <h3 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2"><FaEdit /> Edit Delivery Staff</h3>
            <div className="mb-3">
              <input name="name" value={form.name} onChange={handleEditChange} required placeholder="Name" className="w-full border rounded px-3 py-2 mb-2" />
              <input name="phone" value={form.phone} onChange={handleEditChange} required placeholder="Phone" className="w-full border rounded px-3 py-2 mb-2" />
              <input name="email" value={form.email} onChange={handleEditChange} required placeholder="Email" className="w-full border rounded px-3 py-2 mb-2" />
              <input name="vehicleNumber" value={form.vehicleNumber} onChange={handleEditChange} required placeholder="Vehicle Number" className="w-full border rounded px-3 py-2 mb-2" />
            </div>
            <button type="submit" disabled={formLoading} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold w-full">{formLoading ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm relative animate-fadeIn">
            <h3 className="text-xl font-bold mb-4 text-red-700 flex items-center gap-2"><FaTrash /> Confirm Delete</h3>
            <p className="mb-6">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-orange-600">
                {staff.find(s => s._id === deleteId)?.name || 'this staff member'}?
              </span>
            </p>
            <p className="text-sm text-gray-600 mb-6">
              This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={handleDelete} 
                disabled={deleteLoading} 
                className={`px-4 py-2 rounded font-semibold w-full transition-all ${
                  deleteLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {deleteLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </span>
                ) : (
                  'Delete'
                )}
              </button>
              <button 
                onClick={cancelDelete} 
                disabled={deleteLoading}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-semibold w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default DeliveryStaffManagement; 