import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { 
  Users, UserCheck, IndianRupee, FileText, 
  Bell, Calendar, ChevronRight, Award, Zap, Heart, TrendingDown
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

export default function ParentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: response } = await dashboardAPI.getParent();
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch parent dashboard:', error);
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
        <div className="w-12 h-12 border-4 border-[#30D158]/20 border-t-[#30D158] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data || !data.children || data.children.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 space-y-4">
      <div className="w-20 h-20 bg-[#1c1c1e] rounded-full flex items-center justify-center border border-[#38383a]">
        <Users className="w-10 h-10 opacity-20" />
      </div>
      <p className="font-medium italic">No children linked to this guardian profile.</p>
    </div>
  );

  const totalFamilyBalance = data.children.reduce((sum, child) => sum + (child.feeBalance || 0), 0);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-12"
    >
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#30D158]/10 rounded-full blur-[0px] -translate-x-1/2 -translate-y-1/2 -z-10" />
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#30D158]/20 flex items-center justify-center border border-[#30D158]/30">
              <Heart className="w-4 h-4 text-[#30D158]" />
            </div>
            <span className="text-xs font-bold text-[#30D158]  uppercase">Guardian Oversight</span>
          </div>
          <h2 className="text-4xl font-bold text-white tracking-tight">Parent Dashboard</h2>
          <p className="text-gray-400 mt-2 max-w-lg font-medium">Monitoring academic pathways and financial commitments for your family.</p>
        </motion.div>
      </div>

      {/* ── Family Snapshot ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          whileHover={{ y: -5, scale: 1.01 }}
          className="p-6 rounded-3xl bg-gradient-to-br from-[#30D158]/20 to-teal-500/10  border border-[#38383a] flex items-center gap-6 relative overflow-hidden group"
        >
          <div className="p-4 rounded-2xl bg-[#1c1c1e] border border-[#38383a]  group-hover:scale-110 transition-transform text-[#30D158]">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400  mb-1">Linked Siblings</p>
            <p className="text-3xl font-bold text-white  drop-shadow-md">{data.children.length} Students</p>
          </div>
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-16 h-16" />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5, scale: 1.01 }}
          className="p-6 rounded-3xl bg-gradient-to-br from-[#FF453A]/20 to-red-500/10  border border-[#38383a] flex items-center gap-6 relative overflow-hidden group"
        >
          <div className="p-4 rounded-2xl bg-[#1c1c1e] border border-[#38383a]  group-hover:scale-110 transition-transform text-rose-400">
            <IndianRupee className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400  mb-1">Total Family Dues</p>
            <p className="text-3xl font-bold text-white  drop-shadow-md">₹{totalFamilyBalance.toLocaleString('en-IN')}</p>
          </div>
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingDown className="w-16 h-16" />
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ── Children Grid ── */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#30D158]" />
              Progress Tracker
            </h3>
          </motion.div>
          
          <div className="grid grid-cols-1 gap-6">
            {data.children.map((child, idx) => (
              <motion.div 
                key={idx} 
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                className="card p-0 overflow-hidden bg-[#1c1c1e]  border-[#38383a] hover:border-[#30D158]/30 transition-all group"
              >
                <div className="p-5 border-b border-[#38383a] bg-transparent flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#30D158] to-teal-500 flex items-center justify-center text-white text-xl font-bold ">
                      {child.student?.profile?.firstName?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white group-hover:text-[#30D158] transition-colors">
                        {child.student?.profile?.firstName} {child.student?.profile?.lastName}
                      </h4>
                      <p className="text-xs text-gray-400 font-bold ">
                        Class {child.student?.class?.name} • Sec {child.student?.section?.name}
                      </p>
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-1 text-xs font-bold text-[#30D158]  px-3 py-1.5 bg-[#30D158]/10 rounded-full border border-[#30D158]/20"
                  >
                    Details <ChevronRight className="w-3 h-3" />
                  </motion.button>
                </div>
                
                <div className="p-6 grid grid-cols-3 gap-4">
                  {[
                    { label: "Attendance", value: `${child.attendancePercentage}%`, icon: UserCheck, color: "text-blue-400", bg: "bg-blue-400/10" },
                    { label: "Fee Balance", value: `₹${child.feeBalance?.toLocaleString('en-IN')}`, icon: IndianRupee, color: "text-rose-400", bg: "bg-rose-400/10" },
                    { label: "Academic", value: "Details", icon: Award, color: "text-[#FF9F0A]", bg: "bg-[#FF9F0A]/10" }
                  ].map((stat, i) => (
                    <div key={i} className="text-center space-y-2">
                      <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mx-auto border border-[#38383a]`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold er">{stat.label}</p>
                        <p className={`text-sm font-bold ${stat.color} tracking-tight`}>{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Notices & Side ── */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="card bg-[#1c1c1e]  border-[#38383a] p-0 overflow-hidden">
            <div className="p-5 border-b border-[#38383a] bg-transparent flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 ">
                <Bell className="w-4 h-4 text-[#30D158]" />
                Bulletin Board
              </h3>
            </div>
            <div className="divide-y divide-[#38383a] max-h-[460px] overflow-y-auto custom-scrollbar">
              {data.notices?.length > 0 ? (
                data.notices.map((notice, idx) => (
                  <div key={idx} className="p-5 hover:bg-[#1c1c1e] transition-all group">
                    <p className="text-sm font-bold text-white group-hover:text-[#30D158] transition-colors mb-2 leading-snug">
                      {notice.title}
                    </p>
                    <p className="text-xs text-gray-400 line-clamp-2 font-medium leading-relaxed">
                      {notice.content}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 er">
                        <Calendar className="w-3 h-3" />
                        {new Date(notice.publishDate).toLocaleDateString('en-IN')}
                      </div>
                      <button className="text-[10px] font-bold text-[#30D158]  hover:underline">
                        Read <ChevronRight className="w-3 h-3 inline" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-500 font-semibold italic text-xs">
                  All quiet on the notice front.
                </div>
              )}
            </div>
          </div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="p-6 rounded-3xl bg-gradient-to-br from-[#30D158] to-teal-600 border border-[#38383a]  relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20 rotate-12 group-hover:scale-110 transition-transform">
              <FileText className="w-20 h-20 text-white" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2 relative z-10">Instant Fee Pay</h4>
            <p className="text-xs text-emerald-100/70 font-bold mb-6 leading-relaxed relative z-10">
              Settle outstanding balances via secure UP/NetBanking gateway.
            </p>
            <button className="w-full py-3 bg-white text-emerald-900 text-xs font-bold  rounded-xl hover:bg-white/90 transition-colors  relative z-10">
              Launch Gateway
            </button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
