import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { FaBell, FaPaperPlane, FaClock, FaCheckCircle, FaTimesCircle, FaBullhorn } from 'react-icons/fa';

const statusColors: Record<string, string> = {
  sent: 'bg-emerald-100 text-emerald-700',
  scheduled: 'bg-yellow-100 text-yellow-700',
};

const NotificationManagement: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', message: '', targetAudience: 'all' });
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getBroadcastNotifications();
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      showToast('Failed to fetch notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSend = async () => {
    if (!form.title || !form.message) {
      showToast('Title and Message are required.', 'error');
      return;
    }
    
    try {
      const res = await adminAPI.sendBroadcastNotification(form);
      if (res.data.success) {
        setForm({ title: '', message: '', targetAudience: 'all' });
        showToast('Broadcast sent successfully.');
        fetchNotifications();
      }
    } catch (err) {
      showToast('Failed to send broadcast.', 'error');
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-indigo-900"><FaBell /> Broadcast Notifications</h2>
      
      {/* Compose Form */}
      <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-700"><FaPaperPlane /> Compose Push Notification</h3>
        <p className="text-sm text-gray-500 mb-4">Send instant push notifications to your users' devices.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input className="border p-2 rounded w-full focus:ring-2 focus:ring-indigo-400 focus:outline-none transition" placeholder="e.g., Flash Sale!" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
            <select className="border p-2 rounded w-full focus:ring-2 focus:ring-indigo-400 focus:outline-none transition" value={form.targetAudience} onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value }))}>
              <option value="all">All Users</option>
              <option value="customers">Customers Only</option>
              <option value="vendors">Vendors Only</option>
              <option value="delivery">Delivery Staff Only</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea className="border p-2 rounded w-full focus:ring-2 focus:ring-indigo-400 focus:outline-none transition h-24 resize-none" placeholder="Enter your notification message..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg transition hover:bg-indigo-700 active:scale-95 flex items-center gap-2 font-medium" onClick={handleSend}>
            <FaPaperPlane /> Send Broadcast
          </button>
        </div>
      </div>
      
      {/* Notification Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title & Message</th>
              <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
              <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent At</th>
              <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="py-8 text-center text-gray-500">Loading history...</td></tr>
            ) : notifications.length === 0 ? (
              <tr><td colSpan={4} className="py-8 text-center text-gray-500">No broadcasts sent yet.</td></tr>
            ) : (
              notifications.map(n => (
                <tr key={n._id} className="hover:bg-indigo-50 transition border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div className="font-bold text-gray-800 flex items-center gap-2">
                      <FaBullhorn className="text-indigo-400" /> {n.title}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{n.message}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-semibold capitalize">
                      {n.targetAudience}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{new Date(n.sentAt).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700`}>
                      Sent
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl text-white transition-all animate-fadeIn ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <FaCheckCircle className="text-2xl" /> : <FaTimesCircle className="text-2xl" />}
          <span className="font-semibold text-base tracking-wide">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default NotificationManagement; 