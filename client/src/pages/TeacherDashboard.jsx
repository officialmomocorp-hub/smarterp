import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { 
  Calendar, Clock, Award, UserCheck, 
  BookOpen, ClipboardList, Bell, Zap, GraduationCap, ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 400, damping: 30 }
  }
};

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: response } = await dashboardAPI.getTeacher();
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch teacher dashboard:', error);
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
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-6 h-6 text-blue-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 space-y-4">
      <div className="w-20 h-20 bg-[#1c1c1e] rounded-full flex items-center justify-center border border-[#38383a]">
        <ClipboardList className="w-10 h-10 opacity-20" />
      </div>
      <p className="font-medium">No dashboard data discovered.</p>
    </div>
  );

  const quickStats = [
    {
      title: "Today's Periods",
      value: data.myClasses?.length || 0,
      icon: Clock,
      theme: "from-blue-500/20 to-cyan-500/10",
      accent: "text-blue-400"
    },
    {
      title: "Pending Marks",
      value: data.pendingMarks || 0,
      icon: Award,
      theme: "from-[#FF9F0A]/20 to-orange-500/10",
      accent: "text-[#FF9F0A]"
    },
    {
      title: "Monthly Presence",
      value: `${data.attendanceSummary?.attendancePercentage}%`,
      icon: UserCheck,
      theme: "from-[#30D158]/20 to-teal-500/10",
      accent: "text-[#30D158]"
    }
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-12"
    >
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[0px] -translate-x-1/2 -translate-y-1/2 -z-10" />
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <GraduationCap className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-xs font-bold text-blue-400  uppercase">Academic Control</span>
          </div>
          <h2 className="text-4xl font-bold text-white tracking-tight">Teacher Dashboard</h2>
          <p className="text-gray-400 mt-2 max-w-lg font-medium">Manage your academic schedule and empower students with real-time progress tracking.</p>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="flex items-center gap-3 px-4 py-2 bg-[#1c1c1e]  border border-[#38383a] rounded-2xl  overflow-hidden relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Calendar className="w-5 h-5 text-blue-400 relative z-10" />
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-gray-500 er">Current Session</p>
            <p className="text-sm font-bold text-white leading-tight">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short' })}
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickStats.map((stat, idx) => (
          <motion.div 
            key={idx} 
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`p-6 rounded-3xl bg-gradient-to-br ${stat.theme}  border border-[#38383a] flex items-center gap-6 relative overflow-hidden group`}
          >
            <div className={`p-4 rounded-2xl bg-[#1c1c1e] border border-[#38383a]  group-hover:scale-110 transition-transform ${stat.accent}`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400  mb-1">{stat.title}</p>
              <p className={`text-3xl font-bold ${stat.accent}  drop-shadow-md`}>{stat.value}</p>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon className="w-16 h-16" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ── Today's Schedule ── */}
        <motion.div 
          variants={itemVariants} 
          className="lg:col-span-2 card p-0 overflow-hidden bg-[#1c1c1e]  border-[#38383a] relative"
        >
          <div className="p-6 border-b border-[#38383a] flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Active Schedule
              </h3>
              <p className="text-xs text-gray-400 mt-1 ">Today's Academic Sequence</p>
            </div>
            <div className="px-3 py-1 bg-[#1c1c1e] border border-[#38383a] rounded-full text-[10px] font-bold text-blue-400 ">
              {data.myClasses?.length || 0} PERIODS
            </div>
          </div>
          
          <div className="divide-y divide-[#38383a]">
            {data.myClasses?.length > 0 ? (
              data.myClasses.map((item, idx) => (
                <div key={idx} className="p-6 flex items-center justify-between hover:bg-[#1c1c1e] transition-all group">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-transparent flex flex-col items-center justify-center border border-[#38383a] group-hover:border-blue-500/50 transition-colors ">
                      <span className="text-[10px] text-blue-400 font-bold er">P{item.period}</span>
                      <Zap className="w-4 h-4 text-white mt-1 group-hover:animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                        {item.subject?.name}
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0" />
                      </h4>
                      <p className="text-sm text-gray-400 font-medium">Class {item.class?.name} • Section {item.section?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white ">{item.startTime}</p>
                    <p className="text-xs text-gray-500 font-bold ">To {item.endTime}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center space-y-4">
                <div className="w-16 h-16 bg-[#1c1c1e] rounded-full flex items-center justify-center mx-auto border border-[#38383a]">
                  <Calendar className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-gray-500 font-semibold italic text-sm">No periods allocated for the current session.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Quick Actions ── */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="card bg-[#1c1c1e]  border-[#38383a]">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 ">
              <ClipboardList className="w-5 h-5 text-blue-400" />
              Teacher Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: UserCheck, label: "Attendance", color: "blue" },
                { icon: Award, label: "Exam Marks", color: "amber" },
                { icon: BookOpen, label: "Homework", color: "emerald" },
                { icon: Bell, label: "Notice", color: "purple" }
              ].map((action, i) => (
                <motion.button 
                  key={i}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center justify-center p-5 rounded-2xl border border-[#38383a] bg-[#1c1c1e] hover:bg-[#2c2c2e] hover:border-white/20 transition-all group relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-1 h-full bg-${action.color}-500/50 opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <action.icon className="w-7 h-7 text-gray-400 group-hover:text-white mb-3 transition-colors" />
                  <span className="text-xs font-bold text-gray-500 group-hover:text-white  transition-colors">{action.label}</span>
                </motion.button>
              ))}
            </div>
            
            <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-[#5E5CE6]/10 to-transparent border border-[#38383a]">
              <div className="flex items-center gap-3 mb-2">
                <Bell className="w-4 h-4 text-[#0A84FF] animate-bounce" />
                <span className="text-[10px] font-bold text-white ">Active Bulletin</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                Annual sports meet entries are now open for all staff members. Ensure timely department registration.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
