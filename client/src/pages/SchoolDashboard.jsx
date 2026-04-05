import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import {
  Users, IndianRupee, UserCheck, AlertTriangle,
  TrendingUp, Calendar, GraduationCap, FileText,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function formatINR(amount) {
  const num = parseFloat(amount);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

export default function SchoolDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: response } = await dashboardAPI.getAdmin();
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-gray-500">No data available</div>;
  }

  const stats = [
    {
      title: 'Total Students',
      value: data.totalStudents || 0,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: "Today's Collection",
      value: formatINR(data.todayFeeCollection || 0),
      icon: IndianRupee,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Monthly Collection',
      value: formatINR(data.monthlyFeeCollection || 0),
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Fee Defaulters',
      value: data.defaulterCount || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      title: 'Staff Present Today',
      value: `${data.staffPresent || 0}/${data.totalStaff || 0}`,
      icon: GraduationCap,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      title: 'Pending Admissions',
      value: data.pendingAdmissions || 0,
      icon: FileText,
      color: 'bg-cyan-500',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-600',
    },
  ];

  const classData = data.classWiseStudents?.map(c => ({
    label: `Class ${c._count}`,
    value: c._count,
  })) || [];

  const barChartData = {
    labels: classData.map(c => c.label),
    datasets: [
      {
        label: 'Students',
        data: classData.map(c => c.value),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const genderData = {
    labels: data.genderWiseStudents?.map(g => g.profile?.gender || 'Unknown') || ['Male', 'Female', 'Other'],
    datasets: [
      {
        data: data.genderWiseStudents?.map(g => g._count) || [0, 0, 0],
        backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(236, 72, 153, 0.7)', 'rgba(168, 85, 247, 0.7)'],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening in your school.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.textColor}`}>{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Students by Class</h3>
          <Bar
            data={barChartData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h3>
          <div className="flex justify-center">
            <Pie
              data={genderData}
              options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
            />
          </div>
        </div>
      </div>

      {/* Fee Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Annual Fee Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600">Total Collected</p>
            <p className="text-xl font-bold text-green-700">{formatINR(data.totalFeeCollection)}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600">Monthly</p>
            <p className="text-xl font-bold text-blue-700">{formatINR(data.monthlyFeeCollection)}</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg">
            <p className="text-sm text-amber-600">Today</p>
            <p className="text-xl font-bold text-amber-700">{formatINR(data.todayFeeCollection)}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600">Defaulters</p>
            <p className="text-xl font-bold text-red-700">{data.defaulterCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
