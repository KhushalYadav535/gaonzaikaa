import React, { useState } from 'react';
import { supportTickets as mockTickets } from '../../mock/data';
import { FaHeadset, FaCheckCircle, FaTimesCircle, FaReply, FaInbox, FaExclamationTriangle, FaFilter } from 'react-icons/fa';

const statusColors: Record<string, string> = {
  open: 'bg-yellow-100 text-yellow-700',
  closed: 'bg-emerald-100 text-emerald-700',
};

const SupportManagement: React.FC = () => {
  const [tickets, setTickets] = useState(mockTickets);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [reply, setReply] = useState('');
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleReply = (id: number) => {
    if (!reply.trim()) {
      showToast('Reply cannot be empty.', 'error');
      return;
    }
    setTickets(tickets => tickets.map(t => t.id === id ? { ...t, response: reply, status: 'closed' } : t));
    setReply('');
    setReplyingId(null);
    showToast('Response sent and ticket closed.');
  };

  const handleClose = (id: number) => {
    setTickets(tickets => tickets.map(t => t.id === id ? { ...t, status: 'closed' } : t));
    showToast('Ticket closed.');
  };

  // Analytics
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const closedTickets = tickets.filter(t => t.status === 'closed').length;
  const complaintCount = tickets.filter(t => t.type === 'Complaint').length;
  const feedbackCount = tickets.filter(t => t.type === 'Feedback').length;

  const filteredTickets = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-amber-900"><FaHeadset /> Support & Feedback</h2>
      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <FaInbox className="text-4xl text-indigo-500 mb-2" />
          <div className="text-2xl font-bold text-indigo-700">{openTickets}</div>
          <div className="text-gray-500">Open Tickets</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <FaCheckCircle className="text-4xl text-emerald-500 mb-2" />
          <div className="text-2xl font-bold text-emerald-700">{closedTickets}</div>
          <div className="text-gray-500">Closed Tickets</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <FaExclamationTriangle className="text-4xl text-yellow-500 mb-2" />
          <div className="text-2xl font-bold text-yellow-700">{complaintCount}</div>
          <div className="text-gray-500">Complaints</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <FaReply className="text-4xl text-orange-500 mb-2" />
          <div className="text-2xl font-bold text-orange-700">{feedbackCount}</div>
          <div className="text-gray-500">Feedback</div>
        </div>
      </div>
      {/* Filter */}
      <div className="mb-4 flex gap-2 items-center">
        <FaFilter className="text-gray-400" />
        <button className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setFilter('all')}>All</button>
        <button className={`px-3 py-1 rounded ${filter === 'open' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setFilter('open')}>Open</button>
        <button className={`px-3 py-1 rounded ${filter === 'closed' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setFilter('closed')}>Closed</button>
      </div>
      {/* Ticket Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-orange-50">
              <th className="py-2 px-4 border-b">Customer</th>
              <th className="py-2 px-4 border-b">Type</th>
              <th className="py-2 px-4 border-b">Message</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Created</th>
              <th className="py-2 px-4 border-b">Response</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map(t => (
              <tr key={t.id} className="hover:bg-orange-50 transition">
                <td className="py-2 px-4 border-b">{t.customer}</td>
                <td className="py-2 px-4 border-b">{t.type}</td>
                <td className="py-2 px-4 border-b">{t.message}</td>
                <td className="py-2 px-4 border-b">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColors[t.status]}`}>{t.status}</span>
                </td>
                <td className="py-2 px-4 border-b">{t.createdAt}</td>
                <td className="py-2 px-4 border-b">{t.response || (replyingId === t.id ? (
                  <div className="flex gap-2 items-center">
                    <input className="border p-1 rounded w-32 focus:ring-2 focus:ring-orange-400 focus:outline-none transition" placeholder="Reply..." value={reply} onChange={e => setReply(e.target.value)} />
                    <button className="bg-emerald-500 text-white px-2 py-1 rounded transition hover:bg-emerald-600 active:scale-95" onClick={() => handleReply(t.id)}><FaReply /></button>
                  </div>
                ) : t.status === 'open' ? (
                  <button className="bg-blue-400 text-white px-2 py-1 rounded transition hover:bg-blue-500 active:scale-95" onClick={() => { setReplyingId(t.id); setReply(''); }}>Reply</button>
                ) : null)}</td>
                <td className="py-2 px-4 border-b flex gap-2">
                  {t.status === 'open' && (
                    <button className="bg-gray-400 text-white px-2 py-1 rounded transition hover:bg-gray-500 active:scale-95" onClick={() => handleClose(t.id)}><FaTimesCircle /></button>
                  )}
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

export default SupportManagement; 