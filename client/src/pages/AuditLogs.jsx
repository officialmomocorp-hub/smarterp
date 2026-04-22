import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Shield, Search, Calendar, Filter, User, FileText, ChevronLeft, ChevronRight, Activity, Database, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    resource: '',
    startDate: '',
    endDate: ''
  });

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/audit', {
        params: { ...filters, page, limit: 20 }
      });
      if (data.success) {
        setLogs(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      toast.error('Failed to fetch audit logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE': return 'text-green-700 bg-green-50 border-green-200';
      case 'UPDATE': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'DELETE': return 'text-red-700 bg-red-50 border-red-200';
      case 'LOGIN': return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      default: return 'text-gray-700 bg-[#2c2c2e] border-[rgba(84,84,88,0.36)]';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-8 h-8 text-[#0A84FF]" />
            Security & Audit Logs
          </h2>
          <p className="text-gray-500 mt-1">Track administrative actions, system changes, and access history.</p>
        </div>
        <div className="bg-[#0A84FF]/15 text-[#409CFF] px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
           <Activity className="w-4 h-4 animate-pulse" />
           Live System Monitoring Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-[#1c1c1e] p-6 rounded-xl shadow-sm border border-[rgba(84,84,88,0.36)]">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase ">Resource</label>
          <select 
            name="resource" 
            value={filters.resource} 
            onChange={handleFilterChange}
            className="input w-full bg-[#2c2c2e] border-transparent focus:bg-white"
          >
            <option value="">All Resources</option>
            <option value="STUDENT">Students</option>
            <option value="FEE">Financials / Fees</option>
            <option value="ADMISSION">Admissions</option>
            <option value="STAFF">Staff Management</option>
            <option value="EXAM">Examinations</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase ">Action</label>
          <select 
            name="action" 
            value={filters.action} 
            onChange={handleFilterChange}
            className="input w-full bg-[#2c2c2e] border-transparent focus:bg-white"
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Sign In</option>
          </select>
        </div>
        <div className="md:col-span-2 space-y-1">
           <label className="text-xs font-bold text-gray-400 uppercase ">Date Range</label>
           <div className="flex gap-2">
              <input 
                type="date" 
                name="startDate" 
                value={filters.startDate} 
                onChange={handleFilterChange}
                className="input w-full bg-[#2c2c2e] border-transparent focus:bg-white"
              />
              <span className="self-center text-gray-300">to</span>
              <input 
                type="date" 
                name="endDate" 
                value={filters.endDate} 
                onChange={handleFilterChange}
                className="input w-full bg-[#2c2c2e] border-transparent focus:bg-white"
              />
           </div>
        </div>
        <div className="flex items-end">
           <button 
             onClick={() => setFilters({ userId: '', action: '', resource: '', startDate: '', endDate: '' })}
             className="btn btn-secondary w-full"
           >
             Clear Filters
           </button>
        </div>
      </div>

      <div className="bg-[#1c1c1e] rounded-xl shadow-sm border border-[rgba(84,84,88,0.36)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#2c2c2e] border-b border-[rgba(84,84,88,0.36)]">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Performer</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Action</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Resource</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Details</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Access Point</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-6 py-4 h-16 bg-[#2c2c2e]/50"></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">
                     No audit records found matching your filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#2c2c2e]/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-white">
                        {format(new Date(log.createdAt), 'MMM dd, HH:mm:ss')}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">{log.id.slice(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#0A84FF]/15 text-[#409CFF] flex items-center justify-center font-bold text-xs">
                          {log.user?.profile?.firstName?.[0] || 'S'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">
                            {log.user?.profile ? `${log.user.profile.firstName} ${log.user.profile.lastName}` : 'System Agent'}
                          </div>
                          <div className="text-[10px] text-gray-400 er">
                            {log.user?.role || 'SYSTEM'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-gray-400" />
                      {log.resource}
                    </td>
                    <td className="px-6 py-4">
                       <div className="text-sm text-gray-500 line-clamp-1 max-w-[200px]">
                          {log.action === 'UPDATE' ? 'Modified existing record fields' : 
                           log.action === 'CREATE' ? 'Generated new system object'  : 'System access event'}
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                       <div className="flex items-center justify-end gap-1.5 text-xs text-gray-400">
                          <Smartphone className="w-3 h-3" />
                          <span className="font-mono">{log.ipAddress || 'Internal'}</span>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="px-6 py-4 bg-[#2c2c2e] border-t border-[rgba(84,84,88,0.36)] flex items-center justify-between">
            <div className="text-sm text-gray-500 font-medium">
              Page <span className="text-white font-bold">{pagination.page}</span> of <span className="text-white font-bold">{pagination.pages}</span>
              <span className="ml-4 font-normal">({pagination.total} records total)</span>
            </div>
            <div className="flex gap-2">
              <button 
                disabled={pagination.page <= 1}
                onClick={() => fetchLogs(pagination.page - 1)}
                className="btn btn-secondary p-2 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchLogs(pagination.page + 1)}
                className="btn btn-secondary p-2 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
