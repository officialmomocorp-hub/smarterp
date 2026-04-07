import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { 
  Users, UserCheck, IndianRupee, FileText, 
  Bell, Calendar, ChevronRight, Award
} from 'lucide-react';
import toast from 'react-hot-toast';

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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data || !data.children) return <div className="text-center py-12 text-gray-500">No children linked to this account</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Parent Dashboard</h2>
          <p className="text-gray-500 mt-1">Track your children's school progress and manage fees.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Children Status Cards */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" />
            My Children
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {data.children.map((child, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-700 font-bold">{child.student?.profile?.firstName?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{child.student?.profile?.firstName} {child.student?.profile?.lastName}</p>
                      <p className="text-xs text-gray-500">Class {child.student?.class?.name} - {child.student?.section?.name}</p>
                    </div>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                    View Profile <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                    <UserCheck className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-[10px] text-blue-500 font-medium uppercase">Attendance</p>
                    <p className="text-lg font-black text-blue-700">{child.attendancePercentage}%</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-red-50/50 border border-red-100">
                    <IndianRupee className="w-5 h-5 text-red-600 mx-auto mb-1" />
                    <p className="text-[10px] text-red-500 font-medium uppercase">Fee Due</p>
                    <p className="text-lg font-black text-red-700">₹{child.feeBalance?.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-50/50 border border-green-100">
                    <Award className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-[10px] text-green-500 font-medium uppercase">Exams</p>
                    <p className="text-lg font-black text-green-700">Details</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notices & Side Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary-600" />
                School Notices
              </h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {data.notices?.length > 0 ? (
                data.notices.map((notice, idx) => (
                  <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                    <p className="text-sm font-bold text-gray-900 mb-1">{notice.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{notice.content}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] font-medium text-gray-400">
                        {new Date(notice.publishDate).toLocaleDateString('en-IN')}
                      </span>
                      <button className="text-[10px] font-bold text-primary-600 uppercase hover:underline">Read More</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm italic">No recent notices.</div>
              )}
            </div>
          </div>

          {/* Quick Actions for Parents */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
             <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-primary-600" />
                Quick Payments
             </h3>
             <button className="w-full btn btn-primary flex items-center justify-center gap-2 py-2 text-sm">
                <IndianRupee className="w-4 h-4" />
                Pay School Fees Now
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
