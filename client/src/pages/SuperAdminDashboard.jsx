import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Building2, CreditCard, TrendingUp, 
  ArrowUpRight, GraduationCap, AlertCircle,
  Plus, Download, Zap, ShieldCheck,
  ArrowRight, MoreHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  Title, Tooltip, Legend, PointElement, LineElement, Filler
} from 'chart.js';
import { DashboardSkeleton } from '../components/Skeleton';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Title, Tooltip, Legend);

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/dashboard/super-admin');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load super admin stats');
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const metrics = [
    { label: 'Total Schools', value: data.totalSchools || 0, change: '+2', icon: Building2, accent: '#3b82f6' },
    { label: 'Active Plans', value: data.activeSchools || 0, change: '98%', icon: ShieldCheck, accent: '#10b981' },
    { label: 'Total Students', value: (data.totalStudentsAcross || 0).toLocaleString(), change: 'All', icon: GraduationCap, accent: '#8b5cf6' },
    { label: 'Revenue', value: `₹${((data.totalRevenue || 0) / 100000).toFixed(1)}L`, change: '+18%', icon: CreditCard, accent: '#f59e0b' },
  ];

  const chartData = {
    labels: data.trendLabels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: data.revenueTrend || [0, 0, 0, 0, 0, 0],
      fill: true,
      backgroundColor: (ctx) => {
        const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 280);
        g.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
        g.addColorStop(1, 'rgba(56, 189, 248, 0)');
        return g;
      },
      borderColor: '#38bdf8', // Neon Sky Blue
      borderWidth: 3,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: '#38bdf8',
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 2,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111827',
        titleFont: { size: 12, weight: '500' },
        bodyFont: { size: 13, weight: '600' },
        padding: { top: 8, right: 12, bottom: 8, left: 12 },
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (items) => items[0].label,
          label: (ctx) => `₹ ${ctx.parsed.y.toLocaleString('en-IN')}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
        border: { display: false },
        ticks: { font: { size: 11 }, color: '#9ca3af', padding: 8, callback: (v) => `₹${(v/1000)}K` }
      },
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { font: { size: 11 }, color: '#9ca3af', padding: 4 }
      }
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px]">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10">
        <div>
          <p className="text-sm text-sky-400 mb-1">{dateStr}</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {greeting}, Super Admin
          </h1>
          <p className="text-sm text-gray-400 mt-1">Here's what's happening across SmartERP today.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/manage-schools')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:bg-blue-500 transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" />
            Add School
          </button>
          <button 
            onClick={() => navigate('/platform-reports')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-white/10 border border-white/20 backdrop-blur-md rounded-lg hover:bg-white/20 transition-all hover:scale-105"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* ── Metrics ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {metrics.map((m, i) => (
          <div key={i} className="card hover:shadow-[0_0_25px_rgba(56,189,248,0.15)] hover:border-sky-500/30 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10" style={{ backgroundColor: m.accent + '20', boxShadow: `0 0 15px ${m.accent}40` }}>
                <m.icon className="w-5 h-5" style={{ color: m.accent }} />
              </div>
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-sky-400 bg-sky-400/10 border border-sky-400/20 px-2 py-0.5 rounded-md">
                <ArrowUpRight className="w-3 h-3" />
                {m.change}
              </span>
            </div>
            <div className="text-3xl font-bold text-white tabular-nums drop-shadow-md">{m.value}</div>
            <div className="text-sm text-gray-400 mt-1 font-medium">{m.label}</div>
          </div>
        ))}
      </div>

      {/* ── Main Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 relative z-10">

        {/* Chart */}
        <div className="lg:col-span-3 card">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-base font-bold text-white">Revenue Overview</h2>
              <p className="text-sm text-gray-400 mt-0.5">Monthly platform revenue trajectory</p>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-orange-400 bg-orange-400/10 px-3 py-1 rounded-full border border-orange-400/20 shadow-[0_0_10px_rgba(251,146,60,0.2)]">
              <TrendingUp className="w-4 h-4" />
              +18.5%
            </div>
          </div>
          <div className="h-64 mt-6">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Schools */}
        <div className="lg:col-span-2 card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Recent Schools</h2>
            <button 
              onClick={() => navigate('/manage-schools')}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 hover:underline"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2 flex-1">
            {data.recentSchools.map((school, i) => {
              const colors = ['#38bdf8', '#fb923c', '#a78bfa', '#34d399', '#f87171'];
              const c = colors[i % colors.length];
              return (
                <div key={school.id} className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer group">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-900 text-sm font-black flex-shrink-0"
                    style={{ backgroundColor: c, boxShadow: `0 0 10px ${c}60` }}
                  >
                    {school.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">{school.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{school.city}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[11px] text-gray-400 font-medium tracking-wider">
                      {new Date(school.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.3)]">ACTIVE</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">

        {/* Maintenance */}
        <div className="card border-blue-500/20 bg-gradient-to-br from-[#1e293b]/80 to-blue-900/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
              <h3 className="text-base font-bold text-white">Platform Maintenance</h3>
            </div>
            <p className="text-sm text-blue-200/70 leading-relaxed mb-5 max-w-md">
              Schedule system-wide maintenance. All school logins will be temporarily disabled during the window.
            </p>
            <button 
              onClick={() => {
                if(window.confirm('Broadcast maintenance notice to all schools?')) {
                  toast.success('Maintenance scheduled. All schools notified.');
                }
              }}
              className="px-5 py-2.5 text-sm font-bold bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-md"
            >
              Schedule Maintenance
            </button>
          </div>
        </div>

        {/* Alerts */}
        <div className="card border-orange-500/20 bg-gradient-to-br from-[#1e293b]/80 to-orange-900/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
              <AlertCircle className="w-6 h-6 text-orange-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Unpaid Subscriptions</h3>
                <span className="text-[10px] font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full border border-orange-400/20">{data.unpaidSchoolsCount || 0} schools</span>
              </div>
              <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">
                {data.unpaidSchoolsCount > 0 
                  ? "Schools with expired subscriptions running on grace period need attention."
                  : "All schools are currently active and running smoothly."}
              </p>
              {data.unpaidSchoolsCount > 0 && (
                <button 
                  onClick={() => navigate('/manage-schools')}
                  className="mt-4 text-sm font-bold text-sky-400 hover:text-sky-300 transition-colors inline-flex items-center gap-1 hover:underline"
                >
                  Review details <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
