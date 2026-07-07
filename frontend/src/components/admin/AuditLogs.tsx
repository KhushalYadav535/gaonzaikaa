import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { FaHistory, FaSearch, FaUserShield, FaClock } from 'react-icons/fa';

interface AuditLog {
  _id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetId?: string;
  details?: any;
  createdAt: string;
}

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAuditLogs();
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const uniqueActions = Array.from(new Set(logs.map(l => l.action)));

  return (
    <div className="p-8 pb-24">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FaHistory className="text-indigo-600" /> Audit Logs
        </h2>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Admin Name or Action..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="w-full md:w-48">
            <select 
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Admin</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Action</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Loading audit history...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No logs found matching your criteria.</td></tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaClock className="text-gray-400" />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full w-max">
                        <FaUserShield /> {log.adminName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-gray-800 text-sm tracking-wide">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-xs text-gray-500 font-mono bg-gray-50 rounded p-2">
                      {log.details ? JSON.stringify(log.details) : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
