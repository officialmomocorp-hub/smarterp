import React from 'react';
import { Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react';

export default function Notices() {
  const notices = [
    { id: 1, title: 'Annual Day Celebration', content: 'The Annual Day function will be held on 15th December 2025. All students must participate.', priority: 'URGENT', target: 'ALL', date: '2025-11-01' },
    { id: 2, title: 'Fee Payment Reminder', content: 'Last date for Q3 fee payment is 15th October 2025. Late fine of ₹5/day will be applicable.', priority: 'HIGH', target: 'PARENTS', date: '2025-10-01' },
    { id: 3, title: 'Winter Uniform', content: 'Students must wear winter uniform from 1st November 2025.', priority: 'MEDIUM', target: 'STUDENTS', date: '2025-10-15' },
    { id: 4, title: 'Parent-Teacher Meeting', content: 'PTM scheduled for 20th October 2025 from 9 AM to 1 PM.', priority: 'HIGH', target: 'PARENTS', date: '2025-10-10' },
    { id: 5, title: 'Diwali Holiday', content: 'School will remain closed from 18th to 22nd October 2025 on account of Diwali.', priority: 'MEDIUM', target: 'ALL', date: '2025-10-05' },
  ];

  const getPriorityBadge = (priority) => {
    const badges = {
      URGENT: 'bg-red-100 text-red-800',
      HIGH: 'bg-orange-100 text-orange-800',
      MEDIUM: 'bg-blue-100 text-blue-800',
      LOW: 'bg-gray-100 text-gray-800',
    };
    return badges[priority] || badges.LOW;
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'URGENT': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'HIGH': return <Bell className="w-5 h-5 text-orange-600" />;
      case 'MEDIUM': return <Info className="w-5 h-5 text-blue-600" />;
      default: return <CheckCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notice Board</h2>
          <p className="text-gray-500 mt-1">Digital notice board for school announcements</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Bell className="w-4 h-4" /> New Notice
        </button>
      </div>

      <div className="space-y-4">
        {notices.map((notice) => (
          <div key={notice.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {getPriorityIcon(notice.priority)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{notice.title}</h3>
                  <span className={`badge ${getPriorityBadge(notice.priority)}`}>
                    {notice.priority}
                  </span>
                  <span className="badge badge-gray">{notice.target}</span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{notice.content}</p>
                <p className="text-xs text-gray-400">
                  Published: {new Date(notice.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
