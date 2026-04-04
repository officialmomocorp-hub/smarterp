import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CreditCard, CheckCircle2, AlertCircle, Clock, Search, ArrowUpRight, ArrowDownRight, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Subscriptions() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { title: 'Total Revenue (MRR)', value: '₹0', icon: IndianRupee, trend: '+12%', isUp: true, color: 'bg-emerald-50 text-emerald-600' },
    { title: 'Active Subscriptions', value: '0', icon: CheckCircle2, trend: 'Updated just now', isUp: true, color: 'bg-blue-50 text-blue-600' },
    { title: 'Pending Renewals', value: '0', icon: Clock, trend: 'Due in 7 days', isUp: false, color: 'bg-amber-50 text-amber-600' },
    { title: 'Failed Payments', value: '0', icon: AlertCircle, trend: 'No issues', isUp: true, color: 'bg-rose-50 text-rose-600' }
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/schools');
      const apiSchools = res.data.data || [];
      
      let totalMrr = 0;
      let activeCount = 0;
      let pendingCount = 0;

      // Injecting random but realistic subscription data for demonstration
      const processed = apiSchools.map((s, index) => {
        const plans = ['Basic Plan', 'Premium Plan', 'Enterprise Plan'];
        const prices = [5000, 12000, 25000];
        const planIdx = index % 3;
        
        let status = 'Active';
        let expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 3 + index);
        
        if (index === 1) {
             status = 'Expiring Soon';
             expiryDate.setDate(expiryDate.getDate() + 5);
             pendingCount++;
             totalMrr += prices[planIdx];
        } else if (index === 2) {
             status = 'Expired';
             expiryDate.setDate(expiryDate.getDate() - 10);
        } else {
             activeCount++;
             totalMrr += prices[planIdx];
        }

        return {
           ...s,
           plan: plans[planIdx],
           price: prices[planIdx],
           status,
           expiryDate: expiryDate.toLocaleDateString('en-IN')
        };
      });

      setSchools(processed);
      
      setStats([
        { title: 'Total Revenue (MRR)', value: `₹${totalMrr.toLocaleString('en-IN')}`, icon: IndianRupee, trend: '+12%', isUp: true, color: 'bg-emerald-50 text-emerald-600' },
        { title: 'Active Subscriptions', value: activeCount.toString(), icon: CheckCircle2, trend: 'Updated just now', isUp: true, color: 'bg-blue-50 text-blue-600' },
        { title: 'Pending Renewals', value: pendingCount.toString(), icon: Clock, trend: 'Due in 7 days', isUp: false, color: 'bg-amber-50 text-amber-600' },
        { title: 'Failed Payments', value: '0', icon: AlertCircle, trend: 'No issues', isUp: true, color: 'bg-rose-50 text-rose-600' }
      ]);
    } catch (err) {
      toast.error('Failed to load subscriptions data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
     switch(status) {
       case 'Active': return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">Active</span>;
       case 'Expiring Soon': return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 border border-amber-200">Expiring Soon</span>;
       case 'Expired': return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-700 border border-rose-200">Expired</span>;
       default: return null;
     }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-primary-600" />
            Subscriptions & Billing
          </h2>
          <p className="text-gray-500 mt-1">Manage school plans, invoices, and SaaS revenue.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 ease-in-out blur-2xl`}></div>
            <div className="flex justify-between items-start mb-4 relative">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              {stat.isUp ? (
                 <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full"><ArrowUpRight className="w-3 h-3 mr-1"/> {stat.trend}</span>
              ) : (
                 <span className="flex items-center text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full"><ArrowDownRight className="w-3 h-3 mr-1"/> {stat.trend}</span>
              )}
            </div>
            <div className="relative">
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Registered Schools</h3>
            <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search schools..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-64" />
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-semibold">School Details</th>
                <th className="p-4 font-semibold">Current Plan</th>
                <th className="p-4 font-semibold">Monthly Rate</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Valid Until</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading subscriptions...</td></tr>
              ) : schools.map((school) => (
                <tr key={school.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{school.name}</div>
                    <div className="text-sm text-gray-500">Code: {school.code}</div>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-gray-800">{school.plan}</span>
                  </td>
                  <td className="p-4 font-medium text-gray-900">
                    ₹{school.price?.toLocaleString('en-IN')}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(school.status)}
                  </td>
                  <td className="p-4 text-gray-600 text-sm font-medium">
                    {school.expiryDate}
                  </td>
                  <td className="p-4 text-right">
                    <button className="px-4 py-1.5 text-sm font-medium text-primary-700 bg-primary-100 hover:bg-primary-200 rounded-lg transition-colors">
                      Renew
                    </button>
                    <button className="ml-2 px-4 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && schools.length === 0 && (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No schools found. Let's add some!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
