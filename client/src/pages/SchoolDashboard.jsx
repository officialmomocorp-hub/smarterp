import 'chart.js/auto';
import React, { useState, useEffect } from 'react';
import { 
  Users, GraduationCap, School, Calendar, 
  TrendingUp, ArrowUpRight, ArrowRight, 
  MoreHorizontal, Zap, Search, Bell, IndianRupee
} from 'lucide-react';
import { dashboardAPI } from '../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { y: 12, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } }
};

export default function SchoolDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: response } = await dashboardAPI.getAdmin();
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch school dashboard:', error);
        toast.error('Could not load dashboard data');
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

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(10,132,255,0.12)' }}>
          <School className="w-7 h-7" style={{ color: '#0A84FF' }} />
        </div>
        <h2 className="text-lg font-semibold text-white mb-1">No Academic Year Set</h2>
        <p className="text-[13px] max-w-sm" style={{ color: 'rgba(235,235,245,0.40)' }}>
          Please create an academic year and classes in the Academic section to populate this dashboard with real data.
        </p>
      </div>
    );
  }

  const totalStudents = data.totalStudents || 0;
  const totalStaff = data.totalStaff || 0;
  const staffPresent = data.staffPresent || 0;
  const todayFee = data.todayFeeCollection || 0;
  const totalFee = data.totalFeeCollection || 0;
  const pendingAdmissions = data.pendingAdmissions || 0;
  const defaulterCount = data.defaulterCount || 0;

  // Calculate attendance
  const todayAttendance = data.todayAttendance || [];
  const presentCount = todayAttendance.find(a => a.status === 'PRESENT')?._count || 0;
  const absentCount = todayAttendance.find(a => a.status === 'ABSENT')?._count || 0;
  const totalMarked = presentCount + absentCount;
  const attendancePercent = totalMarked > 0 ? ((presentCount / totalMarked) * 100).toFixed(1) : '—';

  const metrics = [
    { label: 'Total Students', value: totalStudents.toLocaleString('en-IN'), icon: Users, color: '#0A84FF', sub: `${pendingAdmissions} pending admissions` },
    { label: 'Today\'s Attendance', value: attendancePercent === '—' ? '—' : `${attendancePercent}%`, icon: GraduationCap, color: '#30D158', sub: `${presentCount} present, ${absentCount} absent` },
    { label: 'Total Staff', value: totalStaff, icon: Zap, color: '#BF5AF2', sub: `${staffPresent} present today` },
    { label: 'Fee Collection', value: `₹${totalFee.toLocaleString('en-IN')}`, icon: IndianRupee, color: '#FF9F0A', sub: `₹${todayFee.toLocaleString('en-IN')} collected today` },
  ];

  // Recent students from class data
  const classWise = data.classWiseStudents || [];
  const genderWise = data.genderWiseStudents || [];

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
          <h1 className="text-[28px] font-bold text-white tracking-tight">School Dashboard</h1>
          <p className="text-[13px] mt-1" style={{ color: 'rgba(235,235,245,0.40)' }}>Real-time institutional data and analytics</p>
        </motion.div>
      </div>

      {/* ── Metrics ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="p-5 rounded-2xl"
            style={{ background: '#1c1c1e', border: '1px solid rgba(84,84,88,0.36)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: m.color + '18' }}>
                <m.icon className="w-5 h-5" style={{ color: m.color }} />
              </div>
            </div>
            <div className="text-[28px] font-bold text-white tracking-tight">{m.value}</div>
            <p className="text-[12px] mt-0.5" style={{ color: 'rgba(235,235,245,0.40)' }}>{m.label}</p>
            <p className="text-[11px] mt-1" style={{ color: 'rgba(235,235,245,0.25)' }}>{m.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* ── Class-wise Distribution ── */}
        <motion.div 
          variants={itemVariants} 
          className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{ background: '#1c1c1e', border: '1px solid rgba(84,84,88,0.36)' }}
        >
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(84,84,88,0.2)' }}>
            <h3 className="text-[14px] font-semibold text-white">Class-wise Students</h3>
            <span className="text-[12px] font-medium" style={{ color: '#0A84FF' }}>{classWise.length} classes</span>
          </div>
          <div className="p-5">
            {classWise.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {classWise.map((c, idx) => (
                  <div key={idx} className="text-center p-3 rounded-xl" style={{ background: '#2c2c2e' }}>
                    <div className="text-[20px] font-bold text-white">{c._count}</div>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(235,235,245,0.40)' }}>Class {c.classId?.slice(-4) || idx + 1}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[13px]" style={{ color: 'rgba(235,235,245,0.30)' }}>No class data available. Add students to see distribution.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Quick Stats ── */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Gender Distribution */}
          <div className="p-5 rounded-2xl" style={{ background: '#1c1c1e', border: '1px solid rgba(84,84,88,0.36)' }}>
            <h3 className="text-[14px] font-semibold text-white mb-4">Gender Distribution</h3>
            {genderWise.length > 0 ? (
              <div className="space-y-3">
                {genderWise.map((g, idx) => {
                  const gender = g.profile?.gender || 'Unknown';
                  const count = g._count || 0;
                  const pct = totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(0) : 0;
                  const barColor = gender === 'MALE' ? '#0A84FF' : gender === 'FEMALE' ? '#FF375F' : '#8E8E93';
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-[12px] mb-1">
                        <span style={{ color: 'rgba(235,235,245,0.60)' }}>{gender.charAt(0) + gender.slice(1).toLowerCase()}</span>
                        <span className="font-medium text-white">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: '#2c2c2e' }}>
                        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[12px]" style={{ color: 'rgba(235,235,245,0.30)' }}>No data yet</p>
            )}
          </div>

          {/* Fee Defaulters Alert */}
          <div className="p-5 rounded-2xl" style={{ background: '#1c1c1e', border: '1px solid rgba(84,84,88,0.36)' }}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" 
                style={{ background: defaulterCount > 0 ? 'rgba(255,69,58,0.12)' : 'rgba(48,209,88,0.12)' }}>
                <IndianRupee className="w-4 h-4" style={{ color: defaulterCount > 0 ? '#FF453A' : '#30D158' }} />
              </div>
              <div>
                <h4 className="text-[14px] font-semibold text-white mb-1">
                  {defaulterCount > 0 ? 'Fee Defaulters' : 'Fee Status'}
                </h4>
                <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(235,235,245,0.40)' }}>
                  {defaulterCount > 0 
                    ? `${defaulterCount} students have pending fee payments. Review and send reminders.`
                    : 'All fee payments are up to date. No defaulters found.'}
                </p>
                {defaulterCount > 0 && (
                  <button className="mt-2 flex items-center gap-1.5 text-[12px] font-medium" style={{ color: '#0A84FF' }}>
                    View Defaulters <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Monthly Collection */}
          {data.monthlyFeeCollection > 0 && (
            <div className="p-5 rounded-2xl" style={{ background: '#1c1c1e', border: '1px solid rgba(84,84,88,0.36)' }}>
              <p className="text-[12px]" style={{ color: 'rgba(235,235,245,0.40)' }}>This Month's Collection</p>
              <p className="text-[24px] font-bold text-white mt-1">₹{(data.monthlyFeeCollection || 0).toLocaleString('en-IN')}</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
