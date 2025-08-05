import React, { useState } from 'react';
import { notifications as mockNotifications } from '../../mock/data';
import { FaBell, FaPaperPlane, FaClock, FaCheckCircle, FaTimesCircle, FaBullhorn } from 'react-icons/fa';

const statusColors: Record<string, string> = {
  sent: 'bg-emerald-100 text-emerald-700',
  scheduled: 'bg-yellow-100 text-yellow-700',
};

const NotificationManagement: React.FC = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [form, setForm] = useState({ message: '', target: 'all', targetValue: '', scheduledAt: '' });
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleSend = () => {
    if (!form.message || !form.scheduledAt) {
      showToast('Message and schedule time are required.', 'error');
      return;
    }
    setNotifications([
      ...notifications,
      {
        id: Date.now(),
        message: form.message,
        target: form.target,
        targetValue: form.target === 'all' ? '' : form.targetValue,
        scheduledAt: form.scheduledAt,
        status: form.scheduledAt > new Date().toISOString().slice(0, 16) ? 'scheduled' : 'sent',
      },
    ]);
    setForm({ message: '', target: 'all', targetValue: '', scheduledAt: '' });
    showToast('Notification scheduled.');
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-amber-900"><FaBell /> Notifications & Announcements</h2>
      {/* Compose Form */}
      <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-700"><FaPaperPlane /> Compose Notification</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input className="border p-2 rounded w-full focus:ring-2 focus:ring-orange-400 focus:outline-none transition" placeholder="Message" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
          <select className="border p-2 rounded w-full focus:ring-2 focus:ring-orange-400 focus:outline-none transition" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value, targetValue: '' }))}>
            <option value="all">All Users</option>
            <option value="village">Village</option>
            <option value="restaurant">Restaurant</option>
          </select>
          {form.target !== 'all' && (
            <input className="border p-2 rounded w-full focus:ring-2 focus:ring-orange-400 focus:outline-none transition" placeholder={form.target === 'village' ? 'Village Name' : 'Restaurant Name'} value={form.targetValue} onChange={e => setForm(f => ({ ...f, targetValue: e.target.value }))} />
          )}
          <input className="border p-2 rounded w-full focus:ring-2 focus:ring-orange-400 focus:outline-none transition" type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} />
        </div>
        <button className="bg-orange-500 text-white px-4 py-2 rounded transition hover:bg-orange-600 active:scale-95 flex items-center gap-2" onClick={handleSend}><FaPaperPlane /> Send</button>
      </div>
      {/* Notification Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-orange-50">
              <th className="py-2 px-4 border-b">Message</th>
              <th className="py-2 px-4 border-b">Target</th>
              <th className="py-2 px-4 border-b">Scheduled At</th>
              <th className="py-2 px-4 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map(n => (
              <tr key={n.id} className="hover:bg-orange-50 transition">
                <td className="py-2 px-4 border-b flex items-center gap-2"><FaBullhorn className="text-orange-400" /> {n.message}</td>
                <td className="py-2 px-4 border-b">{n.target === 'all' ? 'All Users' : n.target === 'village' ? `Village: ${n.targetValue}` : `Restaurant: ${n.targetValue}`}</td>
                <td className="py-2 px-4 border-b">{n.scheduledAt.replace('T', ' ')}</td>
                <td className="py-2 px-4 border-b">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColors[n.status]}`}>{n.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl text-white transition-all animate-fadeIn ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <FaCheckCircle className="text-2xl" /> : <FaTimesCircle className="text-2xl" />}
          <span className="font-semibold text-base tracking-wide">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default NotificationManagement; 