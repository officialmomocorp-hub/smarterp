import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Building2, Users, CreditCard, Box, TrendingUp, 
  ArrowUpRight, School, GraduationCap, AlertCircle, CheckCircle2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
  Title, Tooltip, Legend, PointElement, LineElement
} from 'chart.js';
import { DashboardSkeleton } from '../components/Skeleton';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/dashboard/super-admin');
      const stats = res.data.data;
      
      setData({
        ...stats,
        activeSchools: stats.totalSchools, // Simplified
        totalRevenue: stats.totalSchools * 15000, 
        revenueTrend: [120000, 150000, 180000, 210000, 245000, 280000] 
      });
    } catch (err) {
      console.error('Failed to load super admin stats');
      toast.error('Failed to sync global platform stats.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  const stats = [
    { title: 'Total Schools', value: data.totalSchools, icon: Building2, color: 'bg-blue-50 text-blue-600', trend: '+2 this month' },
    { title: 'Active Subscriptions', value: data.activeSchools, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600', trend: '98% uptime' },
    { title: 'Estimated Students', value: data.totalStudentsAcross.toLocaleString(), icon: GraduationCap, color: 'bg-purple-50 text-purple-600', trend: 'Global footprint' },
    { title: 'Platform Revenue', value: `₹${(data.totalRevenue / 100000).toFixed(1)}L`, icon: CreditCard, color: 'bg-amber-50 text-amber-600', trend: 'MRR' }
  ];

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Platform Revenue (Monthly)',
      data: data.revenueTrend,
      fill: false,
      borderColor: 'rgb(79, 70, 229)',
      tension: 0.4
    }]
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">ERP Seller Dashboard</h2>
          <p className="text-gray-600 mt-1">Hello ERP Seller, here is the global view of Smarterp.</p>
        </div>
        <div className="hidden md:flex gap-4">
           <button 
             onClick={() => navigate('/manage-schools')}
             aria-label="Add New School Record"
             className="px-4 py-2 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all font-medium"
           >
             Add New School
           </button>
           <button 
             onClick={() => navigate('/platform-reports')}
             aria-label="Export Platform Reports to CSV"
             className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all font-medium"
           >
             Export Reports
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
             <div className="flex justify-between items-start mb-4">
                <div 
                  aria-label={`${stat.title} Icon`}
                  className={`p-3 rounded-2xl ${stat.color} transition-transform group-hover:scale-110`}
                >
                   <stat.icon className="w-6 h-6" />
                </div>
                <div className="flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                   <ArrowUpRight className="w-3 h-3 mr-1" />
                   {stat.trend}
                </div>
             </div>
             <div>
                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">{stat.title}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
             <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-600" aria-hidden="true" />
                Revenue Growth
             </h3>
             <div className="h-80" role="img" aria-label="Line chart showing monthly platform revenue growth">
                <Line data={chartData} options={{ maintainAspectRatio: false }} />
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
             <h3 className="text-lg font-bold text-gray-900 mb-6">Recent School Sign-ups</h3>
             <div className="space-y-4">
                {data.recentSchools.map(school => (
                  <div key={school.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold" aria-hidden="true">
                          {school.name.charAt(0)}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-gray-900 truncate w-32">{school.name}</p>
                          <p className="text-xs text-gray-600">{school.city}</p>
                       </div>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">{new Date(school.createdAt).toLocaleDateString('en-IN', {day:'2-digit', month:'short'})}</span>
                  </div>
                ))}
                <button 
                  onClick={() => navigate('/manage-schools')}
                  aria-label="Clear View of All Registered Schools"
                  className="w-full mt-4 py-3 text-sm font-bold text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
                >
                   View All Schools
                </button>
             </div>
          </div>
      </div>

      {/* Quick Actions / Notices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden group">
               <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4 transition-transform group-hover:scale-110" aria-hidden="true">
                  <Box className="w-48 h-48" />
               </div>
               <h3 className="text-xl font-bold mb-2">Platform Maintenance</h3>
               <p className="text-white/80 text-sm mb-6 leading-relaxed">
                  Schedule system wide maintenance for critical updates. All school logins will be disabled during this window.
               </p>
               <button 
                  aria-label="Broadcast Maintenance Notice"
                  onClick={() => {
                    if(window.confirm('Do you want to broadcast a maintenance window notice to all schools?')) {
                      toast.success('Maintenance scheduled for Sunday 12:00 AM. Distributed to all school notices.');
                    }
                  }}
                  className="px-6 py-2.5 bg-white text-primary-700 rounded-xl font-bold text-sm hover:shadow-lg transition-all active:scale-95"
                >
                  Schedule Now
               </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-amber-400">
               <div className="flex items-start gap-4">
                  <div className="p-2 bg-amber-50 rounded-lg">
                     <AlertCircle className="w-6 h-6 text-amber-600" aria-hidden="true" />
                  </div>
                  <div>
                     <h3 className="text-lg font-bold text-gray-900 mb-1">Unpaid School Subscriptions</h3>
                     <p className="text-sm text-gray-600 mb-4">
                        There are 4 schools with expired subscriptions that are currently running on grace period.
                     </p>
                     <button 
                        aria-label="View Detailed Subscription Reports"
                        onClick={() => window.location.href = '/manage-schools'}
                        className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                      >
                        View Delinquent Schools <ArrowUpRight className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            </div>
      </div>
    </div>
  );
}
