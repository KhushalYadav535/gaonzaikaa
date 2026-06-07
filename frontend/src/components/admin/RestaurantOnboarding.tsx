import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { FaUtensils, FaUser, FaPhone, FaMapMarkerAlt, FaCheckCircle, FaTimesCircle, FaClipboardCheck, FaUserCircle, FaThList, FaThLarge, FaSearch, FaMotorcycle } from 'react-icons/fa';

const statusColors: Record<string, string> = {
  pending: 'bg-gradient-to-r from-yellow-200 to-yellow-400 text-yellow-900 animate-pulse',
  approved: 'bg-gradient-to-r from-emerald-200 to-emerald-400 text-emerald-900',
  rejected: 'bg-gradient-to-r from-red-200 to-red-400 text-red-900',
};
const statusLabels: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

// Skeleton card for card view
const AppCardSkeleton = () => (
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
const AppRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="py-2 px-4 border-b"><div className="w-8 h-8 rounded-full bg-orange-100 inline-block mr-2" /><div className="h-4 bg-orange-100 rounded w-20 inline-block" /></td>
    <td className="py-2 px-4 border-b"><div className="h-4 bg-orange-100 rounded w-16" /></td>
    <td className="py-2 px-4 border-b"><div className="h-4 bg-orange-100 rounded w-24" /></td>
    <td className="py-2 px-4 border-b"><div className="h-4 bg-orange-100 rounded w-16" /></td>
    <td className="py-2 px-4 border-b"><div className="h-4 bg-orange-100 rounded w-14" /></td>
    <td className="py-2 px-4 border-b"><div className="h-4 bg-orange-100 rounded w-14" /></td>
    <td className="py-2 px-4 border-b flex gap-2"><div className="w-8 h-8 bg-orange-100 rounded-full" /><div className="w-8 h-8 bg-orange-100 rounded-full" /></td>
  </tr>
);

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'vendor' | 'delivery';
  createdAt: string;
  status: string;
  vehicleDetails?: any;
}

const RestaurantOnboarding: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const [view, setView] = useState<'table' | 'card'>('table');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPendingOnboarding();
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      showToast('Failed to fetch applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = async (id: string, role: string, action: 'approve' | 'reject') => {
    try {
      const res = await adminAPI.updateOnboardingStatus(id, role, action);
      if (res.data.success) {
        setApplications(apps => apps.filter(app => app.id !== id));
        showToast(`Application ${action}d successfully!`);
      } else {
        showToast(res.data.message || `Failed to ${action}`, 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || `Failed to ${action}`, 'error');
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.email.toLowerCase().includes(search.toLowerCase()) ||
      app.phone.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || app.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const total = applications.length;
  const vendors = applications.filter(app => app.role === 'vendor').length;
  const delivery = applications.filter(app => app.role === 'delivery').length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold flex items-center gap-3 text-amber-900"><FaClipboardCheck /> Onboarding Management</h2>
        <div className="flex gap-2">
          <button onClick={() => setView('table')} className={`p-2 rounded ${view === 'table' ? 'bg-orange-200 text-orange-800' : 'bg-gray-100 text-gray-500'} transition`} title="Table View"><FaThList /></button>
          <button onClick={() => setView('card')} className={`p-2 rounded ${view === 'card' ? 'bg-orange-200 text-orange-800' : 'bg-gray-100 text-gray-500'} transition`} title="Card View"><FaThLarge /></button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="vendor">Vendors</option>
            <option value="delivery">Delivery Staff</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-4 rounded-lg flex items-center gap-3 shadow">
          <FaClipboardCheck className="text-3xl" />
          <div>
            <div className="text-sm">Total Pending</div>
            <div className="text-2xl font-bold">{total}</div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white p-4 rounded-lg flex items-center gap-3 shadow">
          <FaUtensils className="text-3xl" />
          <div>
            <div className="text-sm">Pending Vendors</div>
            <div className="text-2xl font-bold">{vendors}</div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-400 to-purple-500 text-white p-4 rounded-lg flex items-center gap-3 shadow">
          <FaMotorcycle className="text-3xl" />
          <div>
            <div className="text-sm">Pending Delivery</div>
            <div className="text-2xl font-bold">{delivery}</div>
          </div>
        </div>
      </div>
      
      {loading ? (
        view === 'table' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow-lg">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-r from-orange-100 to-orange-200 shadow-md">
                  <th className="py-2 px-4 border-b">Name</th>
                  <th className="py-2 px-4 border-b">Email</th>
                  <th className="py-2 px-4 border-b">Phone</th>
                  <th className="py-2 px-4 border-b">Role</th>
                  <th className="py-2 px-4 border-b">Applied On</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, idx) => <AppRowSkeleton key={idx} />)}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, idx) => <AppCardSkeleton key={idx} />)}
          </div>
        )
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 flex flex-col items-center text-gray-500">
          <FaCheckCircle className="text-6xl text-emerald-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-700">All Caught Up!</h3>
          <p>There are no pending applications for onboarding.</p>
        </div>
      ) : (
        view === 'table' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow-lg">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-r from-orange-100 to-orange-200 shadow-md text-left">
                  <th className="py-3 px-4 border-b">Name</th>
                  <th className="py-3 px-4 border-b">Email</th>
                  <th className="py-3 px-4 border-b">Phone</th>
                  <th className="py-3 px-4 border-b">Role</th>
                  <th className="py-3 px-4 border-b">Applied On</th>
                  <th className="py-3 px-4 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app, idx) => (
                  <tr key={app.id} className={`${idx % 2 === 0 ? 'bg-orange-50' : 'bg-white'} hover:bg-orange-100 transition border-b border-orange-100`}>
                    <td className="py-3 px-4 border-b flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-lg font-bold text-orange-700 shadow mr-2">
                        {app.name ? app.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : <FaUserCircle />}
                      </span>
                      <span className="font-semibold text-gray-800">{app.name}</span>
                    </td>
                    <td className="py-3 px-4 border-b text-sm text-gray-600">{app.email}</td>
                    <td className="py-3 px-4 border-b text-sm text-gray-600">{app.phone}</td>
                    <td className="py-3 px-4 border-b">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold shadow-sm ${app.role === 'vendor' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                        {app.role === 'vendor' ? <FaUtensils /> : <FaMotorcycle />} 
                        {app.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b text-sm text-gray-500">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 border-b">
                      <div className="flex gap-2 justify-center">
                        <button className="bg-emerald-500 text-white p-2 rounded-full flex items-center justify-center hover:bg-emerald-600 shadow" title="Approve" onClick={() => handleStatusChange(app.id, app.role, 'approve')}><FaCheckCircle /></button>
                        <button className="bg-red-500 text-white p-2 rounded-full flex items-center justify-center hover:bg-red-600 shadow" title="Reject" onClick={() => handleStatusChange(app.id, app.role, 'reject')}><FaTimesCircle /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredApplications.map(app => (
              <div key={app.id} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center relative group hover:shadow-2xl transition-all border border-orange-100">
                <div className={`absolute top-0 right-0 m-3 px-2 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1 ${app.role === 'vendor' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                  {app.role === 'vendor' ? <FaUtensils /> : <FaMotorcycle />} {app.role.toUpperCase()}
                </div>
                
                <span className="w-16 h-16 rounded-full bg-orange-200 flex items-center justify-center text-2xl font-bold text-orange-700 shadow mb-3 mt-4">
                  {app.name ? app.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : <FaUserCircle />}
                </span>
                
                <div className="text-lg font-bold text-gray-800 mb-1">{app.name}</div>
                <div className="text-sm text-gray-600 flex items-center gap-2 mb-1"><FaUser className="text-orange-400" /> {app.email}</div>
                <div className="text-sm text-gray-600 flex items-center gap-2 mb-3"><FaPhone className="text-orange-400" /> {app.phone}</div>
                
                <div className="text-xs text-gray-400 mb-4">Applied: {new Date(app.createdAt).toLocaleDateString()}</div>
                
                <div className="flex gap-4 w-full">
                  <button className="flex-1 bg-emerald-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 font-semibold hover:bg-emerald-600 shadow transition" onClick={() => handleStatusChange(app.id, app.role, 'approve')}>
                    <FaCheckCircle /> Approve
                  </button>
                  <button className="flex-1 bg-red-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 font-semibold hover:bg-red-600 shadow transition" onClick={() => handleStatusChange(app.id, app.role, 'reject')}>
                    <FaTimesCircle /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
      
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl text-white transition-all animate-fadeIn ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <FaCheckCircle className="text-2xl" /> : <FaTimesCircle className="text-2xl" />}
          <span className="font-semibold text-base tracking-wide">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default RestaurantOnboarding;