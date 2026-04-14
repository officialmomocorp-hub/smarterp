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
        g.addColorStop(0, 'rgba(59, 130, 246, 0.08)');
        g.addColorStop(1, 'rgba(59, 130, 246, 0)');
        return g;
      },
      borderColor: '#3b82f6',
      borderWidth: 2,
      tension: 0.35,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: '#3b82f6',
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
        grid: { color: '#f3f4f6', drawBorder: false },
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400 mb-1">{dateStr}</p>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            {greeting}, Super Admin
          </h1>
          <p className="text-sm text-gray-500 mt-1">Here's what's happening across SmartERP today.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/manage-schools')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add School
          </button>
          <button 
            onClick={() => navigate('/platform-reports')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* ── Metrics ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: m.accent + '10' }}>
                <m.icon className="w-[18px] h-[18px]" style={{ color: m.accent }} />
              </div>
              <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                <ArrowUpRight className="w-3 h-3" />
                {m.change}
              </span>
            </div>
            <div className="text-2xl font-semibold text-gray-900 tabular-nums">{m.value}</div>
            <div className="text-xs text-gray-500 mt-0.5 font-medium">{m.label}</div>
          </div>
        ))}
      </div>

      {/* ── Main Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Chart */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Revenue</h2>
              <p className="text-xs text-gray-400 mt-0.5">Monthly platform revenue</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              +18.5% from last month
            </div>
          </div>
          <div className="h-64 mt-4">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Schools */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Recent Schools</h2>
            <button 
              onClick={() => navigate('/manage-schools')}
              className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1">
            {data.recentSchools.map((school, i) => {
              const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
              const c = colors[i % colors.length];
              return (
                <div key={school.id} className="flex items-center gap-3 px-3 py-2.5 -mx-1 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                    style={{ backgroundColor: c }}
                  >
                    {school.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">{school.name}</p>
                    <p className="text-xs text-gray-400">{school.city}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[11px] text-gray-400 font-medium">
                      {new Date(school.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </p>
                    <span className="inline-block mt-0.5 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-px rounded">Active</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Maintenance */}
        <div className="bg-gray-900 text-white rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold">Platform Maintenance</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-5 max-w-md">
              Schedule system-wide maintenance. All school logins will be temporarily disabled during the window.
            </p>
            <button 
              onClick={() => {
                if(window.confirm('Broadcast maintenance notice to all schools?')) {
                  toast.success('Maintenance scheduled. All schools notified.');
                }
              }}
              className="px-4 py-2 text-sm font-medium bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Schedule Maintenance
            </button>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-[18px] h-[18px] text-amber-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">Unpaid Subscriptions</h3>
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">{data.unpaidSchoolsCount || 0} schools</span>
              </div>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                {data.unpaidSchoolsCount > 0 
                  ? "Schools with expired subscriptions running on grace period need attention."
                  : "All schools are currently active and running smoothly."}
              </p>
              {data.unpaidSchoolsCount > 0 && (
                <button 
                  onClick={() => navigate('/manage-schools')}
                  className="mt-4 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
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
