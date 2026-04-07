import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { 
  BookOpen, Clock, UserCheck, Calendar,
  Award, FileText, Bell, GraduationCap
} from 'lucide-react';
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data || !data.profile) return <div className="text-center py-12 text-gray-500">Student profile not found</div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold">Hello, {data.profile.firstName}! 👋</h2>
          <p className="text-primary-100 mt-2 opacity-90">Ready for today's learning? You have {data.timetable?.length || 0} periods today.</p>
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10 flex items-center gap-2">
               <GraduationCap className="w-4 h-4" />
               <span className="text-sm font-medium">Class {data.class?.name} - {data.section?.name}</span>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10 flex items-center gap-2">
               <UserCheck className="w-4 h-4" />
               <span className="text-sm font-medium">{data.attendanceSummary?.attendancePercentage}% Attendance</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 -translate-y-1/2 translate-x-1/4 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Timetable */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" />
              Today's Timetable
            </h3>
            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-full uppercase">Day {new Date().getDay()}</span>
          </div>
          <div className="p-0">
            {data.timetable?.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {data.timetable.map((item, idx) => (
                  <div key={idx} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center border border-primary-100">
                        <span className="text-xl font-black text-primary-700">{item.period}</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{item.subject?.name}</p>
                        <p className="text-xs text-gray-500">{item.startTime} - {item.endTime}</p>
                      </div>
                    </div>
                    {idx === 0 && (
                      <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-20" />
                No classes scheduled for today. Take rest!
              </div>
            )}
          </div>
        </div>

        {/* Recent Homework */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-600" />
                Latest Homework
              </h3>
            </div>
            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
              {data.homework?.length > 0 ? (
                data.homework.map((hw, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/30 hover:border-primary-100 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full uppercase">{hw.subject?.name}</span>
                      <span className="text-[10px] text-gray-400">{new Date(hw.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 mb-2">{hw.title}</p>
                    <button className="text-xs font-bold text-primary-600 hover:text-primary-700">Submit Now →</button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-400 text-sm">No pending homework. Yay! 🎉</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button className="flex flex-col items-center justify-center p-4 bg-amber-50 border border-amber-100 rounded-2xl hover:bg-amber-100 transition-colors group">
                < Award className="w-6 h-6 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-amber-700">Results</span>
             </button>
             <button className="flex flex-col items-center justify-center p-4 bg-blue-50 border border-blue-100 rounded-2xl hover:bg-blue-100 transition-colors group">
                <FileText className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-blue-700">ID Card</span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
