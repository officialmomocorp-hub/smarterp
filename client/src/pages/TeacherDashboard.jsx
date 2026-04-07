import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { 
  Calendar, Clock, Award, UserCheck, 
  BookOpen, ClipboardList, Bell
} from 'lucide-react';
import toast from 'react-hot-toast';

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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-12 text-gray-500">No data found</div>;

  const quickStats = [
    {
      title: "Today's Periods",
      value: data.myClasses?.length || 0,
      icon: Clock,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Pending Marks",
      value: data.pendingMarks || 0,
      icon: Award,
      bgColor: "bg-amber-50",
      textColor: "text-amber-600"
    },
    {
      title: "Monthly Attendance",
      value: `${data.attendanceSummary?.attendancePercentage}%`,
      icon: UserCheck,
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h2>
          <p className="text-gray-500 mt-1">Manage your classes and monitor student progress.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickStats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className={`p-4 rounded-xl ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Timetable */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-600" />
              Today's Schedule
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {data.myClasses?.length > 0 ? (
              data.myClasses.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-50 flex flex-col items-center justify-center border border-primary-100">
                      <span className="text-[10px] text-primary-600 font-bold uppercase">Period</span>
                      <span className="text-lg font-black text-primary-700">{item.period}</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{item.subject?.name}</p>
                      <p className="text-xs text-gray-500">{item.class?.name} - Section {item.section?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">{item.startTime} - {item.endTime}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-bold uppercase">Active</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-20" />
                No periods scheduled for today.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Notifications */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-primary-600" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all group">
                <UserCheck className="w-6 h-6 text-gray-400 group-hover:text-primary-600 mb-2" />
                <span className="text-xs font-medium text-gray-600 group-hover:text-primary-700">Attendance</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all group">
                <Award className="w-6 h-6 text-gray-400 group-hover:text-primary-600 mb-2" />
                <span className="text-xs font-medium text-gray-600 group-hover:text-primary-700">Exam Marks</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all group">
                <BookOpen className="w-6 h-6 text-gray-400 group-hover:text-primary-600 mb-2" />
                <span className="text-xs font-medium text-gray-600 group-hover:text-primary-700">Homework</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all group">
                <Bell className="w-6 h-6 text-gray-400 group-hover:text-primary-600 mb-2" />
                <span className="text-xs font-medium text-gray-600 group-hover:text-primary-700">Notice</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
