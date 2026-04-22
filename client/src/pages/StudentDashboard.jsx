import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { 
  BookOpen, Clock, UserCheck, Calendar,
  Award, FileText, Bell, GraduationCap,
  Wallet, TrendingUp, ArrowRight, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: response } = await dashboardAPI.getStudent();
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch student dashboard:', error);
        toast.error('Could not load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#000]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 bg-blue-500/20 blur-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!data || !data.profile) return <div className="text-center py-12 text-gray-500">Student profile not found</div>;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
        type: 'spring',
        stiffness: 400,
        damping: 30
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto space-y-8 p-4"
    >
      {/* Premium Hero Header */}
      <motion.div 
        variants={itemVariants}
        className="relative group"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-[#111827]/80  border border-[#38383a] rounded-[2rem] p-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[0px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-blue-400 uppercase">Student Portal</span>
              </div>
              <h2 className="text-4xl font-bold text-white leading-tight">
                Welcome Back, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#0A84FF]">
                  {data.profile.firstName} {data.profile.lastName}
                </span>! 👋
              </h2>
              <div className="flex flex-wrap gap-4">
                <div className="bg-[#1c1c1e]  rounded-2xl px-5 py-2.5 border border-[#38383a] flex items-center gap-3 transition-colors hover:bg-[#2c2c2e]">
                   <GraduationCap className="w-5 h-5 text-blue-400" />
                   <span className="text-sm font-bold text-white tracking-tight italic">Class {data.class?.name} • Sec {data.section?.name}</span>
                </div>
                <div className="bg-[#1c1c1e]  rounded-2xl px-5 py-2.5 border border-[#38383a] flex items-center gap-3 transition-colors hover:bg-[#2c2c2e]">
                   <UserCheck className="w-5 h-5 text-[#30D158]" />
                   <span className="text-sm font-bold text-white tracking-tight">{data.attendanceSummary?.attendancePercentage}% Presence</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
               {data.profile.avatarUrl ? (
                 <div className="w-24 h-24 rounded-3xl border-2 border-white/20 p-1 bg-[#1c1c1e]">
                   <img src={data.profile.avatarUrl} className="w-full h-full object-cover rounded-2xl" alt="Profile" />
                 </div>
               ) : (
                 <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/20 to-[#5E5CE6]/20 border-2 border-[#38383a] flex items-center justify-center shadow-inner">
                    <GraduationCap className="w-10 h-10 text-blue-400" />
                 </div>
               )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Fee Card - NEW */}
             <div className="relative group cursor-pointer">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF9F0A] to-orange-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition"></div>
               <div className="relative card p-6 bg-[#111827]/60 border-[#38383a]">
                  <div className="flex items-center justify-between mb-4">
                     <div className="p-3 bg-[#FF9F0A]/10 rounded-2xl border border-[#FF9F0A]/20">
                        <Wallet className="w-6 h-6 text-[#FF9F0A]" />
                     </div>
                     <button className="text-xs font-bold text-[#FF9F0A] uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all">
                        Pay Now <ArrowRight className="w-3 h-3" />
                     </button>
                  </div>
                  <h4 className="text-gray-400 text-xs font-bold  mb-1">Outstanding Fees</h4>
                  <div className="text-3xl font-bold text-white ">
                    ₹{data.feeSummary?.feeBalance || 0}
                  </div>
                  <div className="mt-4 w-full bg-[#1c1c1e] h-1.5 rounded-full overflow-hidden">
                     <div 
                      className="h-full bg-[#FF9F0A] shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      style={{ width: `${(data.feeSummary?.paidFees / data.feeSummary?.totalFees) * 100 || 0}%` }}
                     ></div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-wider">
                    Total Collection: ₹{data.feeSummary?.totalFees || 0}
                  </p>
               </div>
             </div>

             {/* Attendance Mini - NEW */}
             <div className="relative group">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-[#30D158] to-teal-600 rounded-3xl blur opacity-20 transition"></div>
               <div className="relative card p-6 bg-[#111827]/60 border-[#38383a]">
                  <div className="flex items-center justify-between mb-4">
                     <div className="p-3 bg-[#30D158]/10 rounded-2xl border border-[#30D158]/20">
                        <TrendingUp className="w-6 h-6 text-[#30D158]" />
                     </div>
                     <span className="p-2 bg-[#30D158]/10 text-[#30D158] text-[10px] font-bold rounded-lg uppercase">Rising</span>
                  </div>
                  <h4 className="text-gray-400 text-xs font-bold  mb-1">Academic Attendance</h4>
                  <div className="text-3xl font-bold text-white ">
                    {data.attendanceSummary?.attendancePercentage}%
                  </div>
                  <p className="text-[10px] text-[#30D158] mt-4 font-bold uppercase tracking-[0.2em] flex items-center gap-1">
                    <UserCheck className="w-3 h-3"/> {data.attendanceSummary?.presentDays} Days Present
                  </p>
               </div>
             </div>
          </motion.div>

          {/* Today's Timetable */}
          <motion.div 
            variants={itemVariants}
            className="card overflow-hidden border-[#38383a]"
          >
            <div className="p-6 border-b border-[#38383a] bg-transparent flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                Today's Learning Path
              </h3>
              <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold  text-blue-400 uppercase">
                Day {new Date().getDay()}
              </div>
            </div>
            
            <div className="p-2">
              {data.timetable?.length > 0 ? (
                <div className="grid gap-3">
                  {data.timetable.map((item, idx) => (
                    <div key={idx} className="group p-4 rounded-2xl transition-all duration-300 hover:bg-[#1c1c1e] border border-transparent hover:border-[#38383a] flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-[#1c1c1e] border border-[#38383a] flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-500 ">
                          <span className="text-xs text-gray-500 font-bold  uppercase">P-</span>
                          <span className="text-xl font-bold text-white">{item.period}</span>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors uppercase italic">{item.subject?.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-1 h-1 rounded-full bg-blue-500 group-hover:animate-ping"></div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{item.startTime} — {item.endTime}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-10 h-10 rounded-full bg-[#1c1c1e] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-[#1c1c1e] rounded-full flex items-center justify-center mx-auto border border-[#38383a]">
                    <Calendar className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em]">Digital Detox Today. No Classes!</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar Sections */}
        <div className="space-y-8">
          
          {/* Latest Homework */}
          <motion.div variants={itemVariants} className="card overflow-hidden border-[#0A84FF]/10">
            <div className="p-5 border-b border-[#38383a] bg-transparent flex items-center gap-3">
               <div className="p-2 bg-[#0A84FF]/20 rounded-xl">
                  <BookOpen className="w-5 h-5 text-[#0A84FF]" />
               </div>
               <h3 className="text-lg font-bold text-white uppercase italic tracking-tight">Latest Homework</h3>
            </div>
            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide">
              {data.homework?.length > 0 ? (
                data.homework.map((hw, idx) => (
                  <div key={idx} className="p-5 rounded-3xl border border-[#38383a] bg-transparent hover:border-[#0A84FF]/30 hover:bg-white/[0.04] transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold text-[#0A84FF] bg-[#0A84FF]/10 px-3 py-1 rounded-full ">{hw.subject?.name}</span>
                      <span className="text-[9px] text-gray-600 font-bold uppercase tracking-wider">{new Date(hw.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-bold text-white mb-4 line-clamp-2">{hw.title}</p>
                    <button className="w-full py-2.5 rounded-2xl bg-[#1c1c1e] text-[10px] font-bold text-gray-400  group-hover:bg-indigo-600 group-hover:text-white transition-all ">
                       Upload Solution
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-gray-600 font-bold uppercase tracking-[0.2em] text-[10px]">Work Completed! 🎉</div>
              )}
            </div>
          </motion.div>

          {/* School Notice Board - NEW */}
          <motion.div variants={itemVariants} className="card overflow-hidden border-[#FF453A]/10 bg-gradient-to-b from-[#111827]/60 to-transparent">
            <div className="p-5 border-b border-[#38383a] bg-transparent flex items-center gap-3">
               <div className="p-2 bg-[#FF453A]/20 rounded-xl">
                  <Bell className="w-5 h-5 text-rose-400" />
               </div>
               <h3 className="text-lg font-bold text-white uppercase italic tracking-tight">Notice Board</h3>
            </div>
            <div className="p-4 space-y-3">
              {data.notices?.length > 0 ? (
                data.notices.map((notice, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-[#38383a] hover:border-[#38383a] transition-colors bg-white/[0.01]">
                     <div className="flex items-center gap-2 mb-2">
                        <Info className="w-3 h-3 text-rose-400" />
                        <span className="text-[9px] font-bold text-gray-500 ">Official Bulletin</span>
                     </div>
                     <p className="text-xs font-bold text-white leading-relaxed">{notice.title}</p>
                     <p className="text-[9px] text-gray-600 mt-2">Published: {new Date(notice.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-center text-gray-600 font-bold uppercase py-8 ">All Quiet for Now</p>
              )}
            </div>
          </motion.div>

          {/* Action Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
             <button className="group relative overflow-hidden flex flex-col items-center justify-center p-6 bg-transparent border border-[#38383a] rounded-[2rem] hover:bg-white/[0.05] transition-all duration-500">
                <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors"></div>
                <Award className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-125 group-hover:-rotate-12 transition-all duration-500 " />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] group-hover:text-white transition-colors">Exams</span>
             </button>
             <button className="group relative overflow-hidden flex flex-col items-center justify-center p-6 bg-transparent border border-[#38383a] rounded-[2rem] hover:bg-white/[0.05] transition-all duration-500">
                <div className="absolute inset-0 bg-[#0A84FF]/0 group-hover:bg-[#0A84FF]/5 transition-colors"></div>
                <FileText className="w-8 h-8 text-[#0A84FF] mb-3 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 " />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] group-hover:text-white transition-colors">Files</span>
             </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
