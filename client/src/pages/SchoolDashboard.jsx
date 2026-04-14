import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import {
  Users, UserCheck, TrendingUp, Calendar, GraduationCap, 
  ArrowUpRight, MoreHorizontal, CheckCircle2, Circle
} from 'lucide-react';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, 
  Title, Tooltip, Legend, ArcElement, Filler
);

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
      <div className="flex items-center justify-center h-[80vh]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-12 text-gray-400">No data available</div>;

  // Mock attendance trend for the "EduPulse" feel
  const attendanceDonut = {
    labels: ['Present', 'Absent'],
    datasets: [{
      data: [94.8, 5.2],
      backgroundColor: ['#38bdf8', 'rgba(56, 189, 248, 0.1)'],
      borderWidth: 0,
      hoverOffset: 4,
      cutout: '80%'
    }]
  };

  const performanceLine = {
    labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    datasets: [{
      label: 'Performance',
      data: [45, 52, 48, 70, 65, 82, 90],
      fill: true,
      borderColor: '#38bdf8',
      backgroundColor: 'rgba(56, 189, 248, 0.1)',
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
      borderWidth: 3
    }]
  };

  const enrollmentBar = {
    labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [{
      label: 'New Students',
      data: [12, 19, 15, 8, 22, 18, 14],
      backgroundColor: '#38bdf8',
      borderRadius: 4,
      barThickness: 12
    }]
  };

  const recentStudents = [
    { name: 'John Doe', grade: '11B', id: '101912399', status: 'Active' },
    { name: 'Jane Smith', grade: '10A', id: '103105697', status: 'Present' },
    { name: 'Mailing Georees', grade: '5C', id: '103105798', status: 'Active' },
    { name: 'Rice Barnen', grade: '2B', id: '103105199', status: 'Present' },
    { name: 'Jenifer Elebers', grade: '2B', id: '102165857', status: 'Active' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">School Analytics Dashboard - Q2 2026</h1>
          <div className="flex gap-6 mt-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Total Students:</span>
              <span className="text-sky-400 font-bold">{data.totalStudents || '1,480'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Active Faculty:</span>
              <span className="text-sky-400 font-bold">{data.totalStaff || '112'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Overall Attendance:</span>
              <span className="text-emerald-400 font-bold">94.8%</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
               <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" alt="Profile" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-[#0B1121] flex items-center justify-center">
              <span className="text-[8px] text-white font-bold">1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Rate */}
        <div className="card group hover:border-sky-500/30 transition-all duration-300">
          <h3 className="text-sm font-bold text-gray-400 mb-6 flex justify-between items-center">
            Attendance Rate <MoreHorizontal className="w-4 h-4" />
          </h3>
          <div className="relative h-48 flex items-center justify-center">
            <div className="w-40 h-40">
              <Doughnut data={attendanceDonut} options={{ cutout: '85%', plugins: { legend: { display: false } } }} />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">94.8%</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Present</span>
            </div>
          </div>
        </div>

        {/* Student Performance */}
        <div className="card group hover:border-sky-500/30 transition-all duration-300">
          <h3 className="text-sm font-bold text-gray-400 mb-6 flex justify-between items-center">
            Student Performance <MoreHorizontal className="w-4 h-4" />
          </h3>
          <div className="h-44">
            <Line 
              data={performanceLine} 
              options={{ 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                  x: { grid: { display: false }, ticks: { color: '#64748b' } },
                  y: { display: false }
                }
              }} 
            />
          </div>
        </div>

        {/* New Enrollments */}
        <div className="card group hover:border-sky-500/30 transition-all duration-300">
          <h3 className="text-sm font-bold text-gray-400 mb-6 flex justify-between items-center">
            New Enrollments <MoreHorizontal className="w-4 h-4" />
          </h3>
          <div className="h-44">
            <Bar 
              data={enrollmentBar} 
              options={{ 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                  x: { grid: { display: false }, ticks: { color: '#64748b' } },
                  y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Bottom Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Student Records */}
        <div className="lg:col-span-2 card">
          <h3 className="text-sm font-bold text-gray-400 mb-6">Recent Student Records</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/5">
                  <th className="pb-3 px-2">Student Name</th>
                  <th className="pb-3 px-2">Grade</th>
                  <th className="pb-3 px-2">ID</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentStudents.map((s, idx) => (
                  <tr key={idx} className="group hover:bg-white/5">
                    <td className="py-4 px-2">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-sky-400">
                           {s.name.split(' ').map(n=>n[0]).join('')}
                         </div>
                         <span className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">{s.name}</span>
                       </div>
                    </td>
                    <td className="py-4 px-2 text-sm text-gray-400">{s.grade}</td>
                    <td className="py-4 px-2 text-sm font-mono text-gray-500">{s.id}</td>
                    <td className="py-4 px-2">
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                         s.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                       }`}>
                         {s.status}
                       </span>
                    </td>
                    <td className="py-4 px-2">
                       <button className="p-1 px-3 text-[10px] font-bold text-gray-400 border border-white/10 rounded-md hover:bg-white/10 hover:text-white transition-all">
                         Actions
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Daily Attendance Grid */}
        <div className="card">
          <h3 className="text-sm font-bold text-gray-400 mb-6">Daily Attendance Grid</h3>
          <div className="space-y-4">
             {/* Simple visual representation of students in dots */}
             <div className="grid grid-cols-6 gap-3">
                {[...Array(24)].map((_, i) => (
                  <div key={i} className={`aspect-square rounded-full flex items-center justify-center ${i % 7 === 0 ? 'bg-orange-500/40 shadow-[0_0_10px_rgba(249,115,22,0.4)]' : 'bg-sky-500/40 shadow-[0_0_10px_rgba(56,189,248,0.4)]'}`}>
                     <div className={`w-2 h-2 rounded-full ${i % 7 === 0 ? 'bg-orange-500' : 'bg-sky-500'}`}></div>
                  </div>
                ))}
             </div>
             
             <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                   <span className="text-[10px] text-gray-500 font-bold">Present</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                   <span className="text-[10px] text-gray-500 font-bold">Absent</span>
                </div>
             </div>
          </div>
          
          <div className="mt-8 p-4 bg-sky-500/5 border border-sky-500/10 rounded-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full translate-x-12 -translate-y-12 blur-2xl"></div>
             <div className="relative">
                <span className="text-[10px] text-sky-400 font-black uppercase tracking-widest">Smart Alert</span>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed font-medium">
                  3 students from Grade 11B have been absent for 3 consecutive days.
                </p>
                <button className="mt-3 text-[10px] font-bold text-white flex items-center gap-1 group-hover:gap-2 transition-all">
                  Take Action <ArrowUpRight className="w-3 h-3" />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
