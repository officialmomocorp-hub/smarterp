import 'chart.js/auto';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { Users, School, TrendingUp, AlertCircle, ArrowUpRight, ArrowRight, Zap, Globe, ShieldCheck, GraduationCap } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { y: 12, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 400, damping: 30 }
  }
};

export default function SuperAdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: response } = await dashboardAPI.getSuperAdmin();
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch Super Admin dashboard:', error);
        toast.error('Could not load platform metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-[3px] border-[#0A84FF]/20 border-t-[#0A84FF] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-12" style={{ color: 'rgba(235,235,245,0.40)' }}>Platform analytics unavailable.</div>;

  const metrics = [
    { label: 'Total Schools', value: data.totalSchools, change: '+4.2%', icon: School, accent: '#0A84FF' },
    { label: 'Platform Students', value: data.totalStudents, change: '+12.5%', icon: Users, accent: '#5E5CE6' },
    { label: 'Platform Revenue', value: `₹${(data.totalRevenue || 0).toLocaleString('en-IN')}`, change: '+18.2%', icon: TrendingUp, accent: '#30D158' },
    { label: 'Active Staff', value: data.totalStaff, change: '+5.4', icon: GraduationCap, accent: '#FF9F0A' }
  ];

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Platform Revenue',
      data: [35000, 42000, 38000, 52000, 61000, 75000],
      fill: true,
      borderColor: '#0A84FF',
      backgroundColor: 'rgba(10, 132, 255, 0.08)',
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#0A84FF',
      pointBorderWidth: 2,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1c1c1e',
        titleColor: '#fff',
        titleFont: { weight: '600', size: 13 },
        bodyColor: 'rgba(235,235,245,0.60)',
        bodyFont: { size: 12 },
        borderColor: 'rgba(84,84,88,0.36)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        displayColors: false,
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: 'rgba(235,235,245,0.30)', font: { size: 11, weight: '500' } } },
      y: { grid: { color: 'rgba(84,84,88,0.18)' }, ticks: { color: 'rgba(235,235,245,0.30)', font: { size: 11, weight: '500' } } }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 pb-12"
    >
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div variants={itemVariants}>
          <h1 className="text-[28px] font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-[13px] mt-1" style={{ color: 'rgba(235,235,245,0.40)' }}>Platform overview and financial tracking</p>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl"
          style={{ background: '#1c1c1e', border: '1px solid rgba(84,84,88,0.36)' }}
        >
          <ShieldCheck className="w-4 h-4" style={{ color: '#30D158' }} />
          <div>
            <p className="text-[10px] font-medium" style={{ color: 'rgba(235,235,245,0.40)' }}>System Status</p>
            <p className="text-[13px] font-semibold flex items-center gap-1.5" style={{ color: '#30D158' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#30D158] animate-pulse"></span>
              All Nodes Operational
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Metrics Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="p-5 rounded-2xl relative overflow-hidden group"
            style={{ background: '#1c1c1e', border: '1px solid rgba(84,84,88,0.36)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: m.accent + '18' }}>
                <m.icon className="w-5 h-5" style={{ color: m.accent }} />
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ color: m.accent, backgroundColor: m.accent + '15' }}>
                {m.change}
              </span>
            </div>
            <div className="text-[28px] font-bold text-white tracking-tight">{m.value}</div>
            <p className="text-[12px] mt-0.5" style={{ color: 'rgba(235,235,245,0.40)' }}>{m.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Main Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">
        {/* Revenue Chart */}
        <motion.div 
          variants={itemVariants} 
          className="lg:col-span-3 p-5 rounded-2xl"
          style={{ background: '#1c1c1e', border: '1px solid rgba(84,84,88,0.36)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[16px] font-semibold text-white">Growth Trajectory</h3>
              <p className="text-[12px] mt-0.5" style={{ color: 'rgba(235,235,245,0.30)' }}>Revenue analytics · Last 6 months</p>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-lg" style={{ color: '#30D158', background: 'rgba(48,209,88,0.12)' }}>
              <TrendingUp className="w-3.5 h-3.5" />
              +18.5%
            </div>
          </div>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Recent Schools */}
        <motion.div 
          variants={itemVariants} 
          className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{ background: '#1c1c1e', border: '1px solid rgba(84,84,88,0.36)' }}
        >
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(84,84,88,0.2)' }}>
            <h3 className="text-[14px] font-semibold text-white">Active Institutions</h3>
            <button 
              onClick={() => navigate('/manage-schools')}
              className="text-[12px] font-medium flex items-center gap-1 transition-colors"
              style={{ color: '#0A84FF' }}
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(84,84,88,0.2)' }}>
            {data.recentSchools.map((school, i) => {
              const colors = ['#0A84FF', '#FF9F0A', '#BF5AF2', '#30D158', '#FF453A'];
              const c = colors[i % colors.length];
              return (
                <div key={school.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-white/[0.02] transition-all cursor-pointer">
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[13px] font-semibold flex-shrink-0"
                    style={{ backgroundColor: c }}
                  >
                    {school.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-white truncate">{school.name}</p>
                    <p className="text-[11px]" style={{ color: 'rgba(235,235,245,0.30)' }}>{school.city}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[11px]" style={{ color: 'rgba(235,235,245,0.30)' }}>
                      {new Date(school.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </p>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md" style={{ color: '#30D158', background: 'rgba(48,209,88,0.12)' }}>Active</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Bottom Section ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl" style={{ background: '#1c1c1e', border: '1px solid rgba(84,84,88,0.36)' }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(10,132,255,0.15)' }}>
              <Zap className="w-4 h-4" style={{ color: '#0A84FF' }} />
            </div>
            <h3 className="text-[16px] font-semibold text-white">System Maintenance</h3>
          </div>
          <p className="text-[13px] leading-relaxed mb-5" style={{ color: 'rgba(235,235,245,0.40)' }}>
            Broadcast platform-wide maintenance notices. Scheduled windows will temporarily disable institutional access for secure deployment.
          </p>
          <button 
            onClick={() => {
              if(window.confirm('Broadcast maintenance notice to all schools?')) {
                toast.success('Maintenance scheduled. All schools notified.');
              }
            }}
            className="px-5 py-2 rounded-lg text-[13px] font-semibold text-white transition-all active:scale-[0.97]"
            style={{ background: '#0A84FF' }}
            onMouseEnter={(e) => { e.target.style.background = '#409CFF'; }}
            onMouseLeave={(e) => { e.target.style.background = '#0A84FF'; }}
          >
            Start Maintenance
          </button>
        </div>

        <div className="p-6 rounded-2xl" style={{ background: '#1c1c1e', border: '1px solid rgba(84,84,88,0.36)' }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,69,58,0.12)' }}>
              <AlertCircle className="w-6 h-6" style={{ color: '#FF453A' }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-[16px] font-semibold text-white">Active Invoices</h3>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md" style={{ color: '#FF453A', background: 'rgba(255,69,58,0.12)' }}>{data.unpaidSchoolsCount || 0} pending</span>
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(235,235,245,0.40)' }}>
                {data.unpaidSchoolsCount > 0 
                  ? "Attention required for schools with lapsed subscriptions in the grace period."
                  : "Financial health is optimal. No subscriptions are currently in negative standing."}
              </p>
              {data.unpaidSchoolsCount > 0 && (
                <button 
                  onClick={() => navigate('/manage-schools')}
                  className="mt-4 text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors"
                  style={{ color: '#0A84FF' }}
                >
                  Review Balances <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
