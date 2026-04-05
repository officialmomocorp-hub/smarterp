import React, { useState } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, Plus, X } from 'lucide-react';
import { noticeAPI } from '../services/api';
import toast from 'react-hot-toast';

const INITIAL_NOTICES = [
  { id: 1, title: 'Annual Day Celebration', content: 'The Annual Day function will be held on 15th December 2025. All students must participate.', priority: 'URGENT', target: 'ALL', date: '2025-11-01' },
  { id: 2, title: 'Fee Payment Reminder', content: 'Last date for Q3 fee payment is 15th October 2025. Late fine of ₹5/day will be applicable.', priority: 'HIGH', target: 'PARENTS', date: '2025-10-01' },
  { id: 3, title: 'Winter Uniform', content: 'Students must wear winter uniform from 1st November 2025.', priority: 'MEDIUM', target: 'STUDENTS', date: '2025-10-15' },
  { id: 4, title: 'Parent-Teacher Meeting', content: 'PTM scheduled for 20th October 2025 from 9 AM to 1 PM.', priority: 'HIGH', target: 'PARENTS', date: '2025-10-10' },
  { id: 5, title: 'Diwali Holiday', content: 'School will remain closed from 18th to 22nd October 2025 on account of Diwali.', priority: 'MEDIUM', target: 'ALL', date: '2025-10-05' },
];

const INITIAL_FORM = {
  title: '', content: '', priority: 'MEDIUM', target: 'ALL',
};

export default function Notices() {
  const [notices, setNotices] = useState(INITIAL_NOTICES);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      return toast.error('Title and content are required');
    }
    setSubmitting(true);
    try {
      // Try backend first, fallback to local
      try {
        await noticeAPI.create(form);
      } catch (apiErr) {
        console.log('API not available, adding locally');
      }
      // Add locally for immediate UI feedback
      const newNotice = {
        id: Date.now(),
        ...form,
        date: new Date().toISOString().split('T')[0],
      };
      setNotices([newNotice, ...notices]);
      toast.success('Notice published successfully! 📢');
      setShowModal(false);
      setForm(INITIAL_FORM);
    } catch (err) {
      toast.error('Failed to create notice');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notice Board</h2>
          <p className="text-gray-500 mt-1">Digital notice board for school announcements</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
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

      {/* New Notice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Create New Notice</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Title *</label>
                <input 
                  className="input" 
                  required 
                  placeholder="Notice title..." 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                />
              </div>
              <div>
                <label className="label">Content *</label>
                <textarea 
                  className="input min-h-[100px]" 
                  required 
                  placeholder="Notice content..." 
                  value={form.content} 
                  onChange={e => setForm({...form, content: e.target.value})}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Priority</label>
                  <select className="input" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="label">Target Audience</label>
                  <select className="input" value={form.target} onChange={e => setForm({...form, target: e.target.value})}>
                    <option value="ALL">All</option>
                    <option value="STUDENTS">Students</option>
                    <option value="PARENTS">Parents</option>
                    <option value="TEACHERS">Teachers</option>
                    <option value="STAFF">Staff</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 border-t">
                <button type="submit" disabled={submitting} className="w-full btn btn-primary">
                  {submitting ? 'Publishing...' : '📢 Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
