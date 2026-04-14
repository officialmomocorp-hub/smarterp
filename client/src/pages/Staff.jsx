import React, { useState, useEffect } from 'react';
import { staffAPI, salaryAPI } from '../services/api';
import { Plus, Search, X, FileText, Download, Key } from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_FORM = {
  firstName: '', lastName: '', phone: '', email: '',
  designation: 'Teacher', department: 'General', qualification: 'B.Ed',
  dateOfJoining: new Date().toISOString().split('T')[0], basicPay: '30000',
};

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStaff = async () => {
    try {
      const { data } = await staffAPI.getAll({ page: 1, limit: 50 });
      setStaff(data.data.staff || []);
    } catch (error) {
      console.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.phone || !form.designation) {
      return toast.error('Please fill required fields');
    }
    setSubmitting(true);
    try {
      await staffAPI.create({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email || undefined,
        designation: form.designation,
        department: form.department,
        qualification: form.qualification,
        dateOfJoining: form.dateOfJoining,
        basicPay: parseFloat(form.basicPay) || 0,
      });
      toast.success('Staff member added successfully!');
      setShowModal(false);
      setForm(INITIAL_FORM);
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add staff');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (s) => {
    const first = s.firstName || s.user?.profile?.firstName || s.staffId || '';
    const last = s.lastName || s.user?.profile?.lastName || '';
    return (first.charAt(0) + last.charAt(0)).toUpperCase() || 'ST';
  };

  const getName = (s) => {
    if (s.firstName) return `${s.firstName} ${s.lastName || ''}`.trim();
    if (s.user?.profile) return `${s.user.profile.firstName} ${s.user.profile.lastName}`.trim();
    return s.staffId;
  };

  const filtered = staff.filter(s => {
    if (!searchQuery) return true;
    const name = getName(s).toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || 
           s.staffId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           s.designation?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
          <p className="text-gray-500 mt-1">Manage teaching and non-teaching staff</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      <div className="card">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              className="input pl-10" 
              placeholder="Search staff..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 text-center py-8 text-gray-500">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-gray-500">No staff found. Click "Add Staff" to add one.</div>
          ) : (
            filtered.map(s => (
              <div key={s.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                    {getInitials(s)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{getName(s)}</p>
                    <p className="text-sm text-gray-500">{s.designation} - {s.department}</p>
                    <p className="text-xs text-gray-400">{s.staffId} | {s.qualification}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm">
                  <div>
                    <p className="text-gray-500">Joining Date</p>
                    <p className="font-medium">{new Date(s.dateOfJoining).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <button 
                      onClick={async () => {
                         if(!window.confirm(`Are you sure you want to reset the password for ${getName(s)} back to completely default (admin123)?`)) return;
                         try {
                           await staffAPI.resetPassword(s.id);
                           toast.success(`Password securely reset to admin123 for ${getName(s)}`);
                         } catch (err) { toast.error(err.response?.data?.message || 'Failed to reset password'); }
                      }}
                      className="p-2 bg-amber-50 rounded-lg text-amber-600 hover:bg-amber-100 mr-2" 
                      title="Reset Password to admin123"
                    >
                       <Key className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={async () => {
                         try {
                           const response = await salaryAPI.getSlip(s.id);
                           const url = window.URL.createObjectURL(new Blob([response.data]));
                           const link = document.createElement('a');
                           link.href = url;
                           link.setAttribute('download', `Salary-${s.staffId}.pdf`);
                           const linkElem = document.createElement('a');
                           linkElem.href = url;
                           linkElem.download = `SalarySlip-${s.staffId}.pdf`;
                           document.body.appendChild(linkElem);
                           linkElem.click();
                           document.body.removeChild(linkElem);
                         } catch (e) { toast.error('No salary record found for this month'); }
                      }}
                      className="p-2 bg-primary-50 rounded-lg text-primary-600 hover:bg-primary-100" 
                      title="Download Last Salary Slip"
                    >
                       <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add New Staff Member</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name *</label>
                  <input className="input" required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input className="input" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone *</label>
                  <input className="input" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Designation *</label>
                  <select className="input" required value={form.designation} onChange={e => setForm({...form, designation: e.target.value})}>
                    <option>Teacher</option>
                    <option>Senior Teacher</option>
                    <option>HOD</option>
                    <option>Principal</option>
                    <option>Vice Principal</option>
                    <option>Clerk</option>
                    <option>Librarian</option>
                    <option>Lab Assistant</option>
                    <option>Peon</option>
                    <option>Driver</option>
                    <option>Guard</option>
                  </select>
                </div>
                <div>
                  <label className="label">Department</label>
                  <select className="input" value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                    <option>General</option>
                    <option>Mathematics</option>
                    <option>Science</option>
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Social Studies</option>
                    <option>Computer Science</option>
                    <option>Physical Education</option>
                    <option>Arts</option>
                    <option>Admin</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Qualification</label>
                  <input className="input" value={form.qualification} onChange={e => setForm({...form, qualification: e.target.value})} />
                </div>
                <div>
                  <label className="label">Basic Pay (₹)</label>
                  <input className="input" type="number" value={form.basicPay} onChange={e => setForm({...form, basicPay: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="label">Date of Joining</label>
                <input className="input" type="date" value={form.dateOfJoining} onChange={e => setForm({...form, dateOfJoining: e.target.value})} />
              </div>
              <div className="pt-4 border-t">
                <button type="submit" disabled={submitting} className="w-full btn btn-primary">
                  {submitting ? 'Adding...' : 'Add Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
