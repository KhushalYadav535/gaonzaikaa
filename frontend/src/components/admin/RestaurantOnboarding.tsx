import React, { useEffect, useState } from 'react';
import { restaurantApplications as mockApplications } from '../../mock/data';
import { FaUtensils, FaUser, FaPhone, FaMapMarkerAlt, FaCheckCircle, FaTimesCircle, FaClipboardCheck, FaUserCircle, FaThList, FaThLarge, FaSearch } from 'react-icons/fa';

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

// Spinner component
const Spinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="w-12 h-12 border-4 border-orange-300 border-t-orange-500 rounded-full animate-spin"></div>
  </div>
);
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

const STORAGE_KEY = 'restaurant_onboarding_apps';

const RestaurantOnboarding: React.FC = () => {
  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : mockApplications;
    } catch (_e) {
      return mockApplications;
    }
  });
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const [view, setView] = useState<'table' | 'card'>('table');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  // Simulate loading state (replace with real loading logic if needed)
  const [loading] = useState(false); // set to true to see skeletons

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  // Persist applications to localStorage so status survives refresh
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    } catch (_e) {
      // ignore storage errors
    }
  }, [applications]);

  const handleApprove = (id: number) => {
    setApplications(apps => apps.map(app => app.id === id ? { ...app, status: 'approved' } : app));
    showToast('Restaurant approved!');
  };
  const handleReject = (id: number) => {
    setApplications(apps => apps.map(app => app.id === id ? { ...app, status: 'rejected' } : app));
    showToast('Restaurant rejected.', 'error');
  };

  // Filtered applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.owner.toLowerCase().includes(search.toLowerCase()) ||
      app.phone.toLowerCase().includes(search.toLowerCase()) ||
      app.cuisine.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const total = filteredApplications.length;
  const pending = filteredApplications.filter(app => app.status === 'pending').length;
  const approved = filteredApplications.filter(app => app.status === 'approved').length;
  const rejected = filteredApplications.filter(app => app.status === 'rejected').length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold flex items-center gap-3 text-amber-900"><FaClipboardCheck /> Restaurant Onboarding</h2>
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
            placeholder="Search by name, owner, phone, or cuisine..."
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
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-4 rounded-lg flex items-center gap-3 shadow">
          <FaClipboardCheck className="text-3xl" />
          <div>
            <div className="text-sm">Total Applications</div>
            <div className="text-2xl font-bold">{total}</div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white p-4 rounded-lg flex items-center gap-3 shadow">
          <FaTimesCircle className="text-3xl" />
          <div>
            <div className="text-sm">Pending</div>
            <div className="text-2xl font-bold">{pending}</div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white p-4 rounded-lg flex items-center gap-3 shadow">
          <FaCheckCircle className="text-3xl" />
          <div>
            <div className="text-sm">Approved</div>
            <div className="text-2xl font-bold">{approved}</div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-400 to-red-500 text-white p-4 rounded-lg flex items-center gap-3 shadow">
          <FaTimesCircle className="text-3xl" />
          <div>
            <div className="text-sm">Rejected</div>
            <div className="text-2xl font-bold">{rejected}</div>
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
                  <th className="py-2 px-4 border-b">Owner</th>
                  <th className="py-2 px-4 border-b">Phone</th>
                  <th className="py-2 px-4 border-b">Address</th>
                  <th className="py-2 px-4 border-b">Cuisine</th>
                  <th className="py-2 px-4 border-b">Status</th>
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
      ) : (
        view === 'table' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow-lg">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-r from-orange-100 to-orange-200 shadow-md">
                  <th className="py-2 px-4 border-b">Name</th>
                  <th className="py-2 px-4 border-b">Owner</th>
                  <th className="py-2 px-4 border-b">Phone</th>
                  <th className="py-2 px-4 border-b">Address</th>
                  <th className="py-2 px-4 border-b">Cuisine</th>
                  <th className="py-2 px-4 border-b">Status</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app, idx) => (
                  <tr key={app.id} className={`${idx % 2 === 0 ? 'bg-orange-50' : 'bg-white'} hover:bg-orange-100 transition border-b border-orange-100`}>
                    <td className="py-2 px-4 border-b flex items-center gap-2">
                      {/* Avatar with initials or icon */}
                      <span className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-lg font-bold text-orange-700 shadow mr-2">
                        {app.name ? app.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : <FaUserCircle />}
                      </span>
                      <span className="flex items-center gap-2">
                        <FaUtensils className="text-orange-400" /> {app.name}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b flex items-center gap-2"><FaUser className="text-orange-400" /> {app.owner}</td>
                    <td className="py-2 px-4 border-b flex items-center gap-2"><FaPhone className="text-orange-400" /> {app.phone}</td>
                    <td className="py-2 px-4 border-b flex items-center gap-2"><FaMapMarkerAlt className="text-orange-400" /> {app.address}</td>
                    <td className="py-2 px-4 border-b">{app.cuisine}</td>
                    <td className="py-2 px-4 border-b">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColors[app.status]} shadow transition-all duration-300`}>{app.status === 'pending' && <span className="w-2 h-2 bg-yellow-500 rounded-full animate-ping mr-1 inline-block"></span>}{statusLabels[app.status]}</span>
                    </td>
                    <td className="py-2 px-4 border-b flex gap-2">
                      {app.status === 'pending' && (
                        <>
                          <button className="bg-emerald-500 text-white p-2 rounded-full flex items-center justify-center" title="Approve" onClick={() => handleApprove(app.id)}><FaCheckCircle /></button>
                          <button className="bg-red-500 text-white p-2 rounded-full flex items-center justify-center" title="Reject" onClick={() => handleReject(app.id)}><FaTimesCircle /></button>
                        </>
                      )}
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
                <span className="w-16 h-16 rounded-full bg-orange-200 flex items-center justify-center text-2xl font-bold text-orange-700 shadow mb-3">
                  {app.name ? app.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : <FaUserCircle />}
                </span>
                <div className="text-lg font-semibold text-amber-900 flex items-center gap-2 mb-1"><FaUtensils className="text-orange-400" /> {app.name}</div>
                <div className="text-sm text-gray-600 flex items-center gap-2 mb-1"><FaUser className="text-orange-400" /> {app.owner}</div>
                <div className="text-sm text-gray-600 flex items-center gap-2 mb-1"><FaPhone className="text-orange-400" /> {app.phone}</div>
                <div className="text-sm text-gray-600 flex items-center gap-2 mb-1"><FaMapMarkerAlt className="text-orange-400" /> {app.address}</div>
                <div className="text-sm text-gray-600 mb-1">Cuisine: <span className="font-medium">{app.cuisine}</span></div>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColors[app.status]} shadow transition-all duration-300 mb-2`}>{app.status === 'pending' && <span className="w-2 h-2 bg-yellow-500 rounded-full animate-ping mr-1 inline-block"></span>}{statusLabels[app.status]}</span>
                <div className="flex gap-2 mt-2">
                  {app.status === 'pending' && (
                    <>
                      <button className="bg-emerald-500 text-white p-2 rounded-full flex items-center justify-center" title="Approve" onClick={() => handleApprove(app.id)}><FaCheckCircle /></button>
                      <button className="bg-red-500 text-white p-2 rounded-full flex items-center justify-center" title="Reject" onClick={() => handleReject(app.id)}><FaTimesCircle /></button>
                    </>
                  )}
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