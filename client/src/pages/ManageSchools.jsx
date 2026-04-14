import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Building2, Plus, MapPin, Trash2, ShieldAlert, Power, PowerOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageSchools() {
  const [schools, setSchools] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', code: '', address: '', city: '', state: '', pincode: '', phone: '', email: '', udiseCode: '', adminEmail: '', adminPassword: ''
  });

  const [resetModalSchool, setResetModalSchool] = useState(null);
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [deleteConfirmSchool, setDeleteConfirmSchool] = useState(null);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const res = await api.get(`/schools`);
      setSchools(res.data.data);
    } catch (err) {
      toast.error('Failed to load schools');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/schools/${resetModalSchool.id}/reset-password`, { newPassword: newAdminPassword });
      toast.success('Admin password reset successfully!');
      setResetModalSchool(null);
      setNewAdminPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (school) => {
    try {
      await api.put(`/schools/${school.id}/toggle-status`);
      toast.success(`School ${school.isActive ? 'deactivated' : 'activated'} successfully!`);
      fetchSchools();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteSchool = async () => {
    if (!deleteConfirmSchool) return;
    setLoading(true);
    try {
      await api.delete(`/schools/${deleteConfirmSchool.id}`);
      toast.success('School deleted permanently!');
      setDeleteConfirmSchool(null);
      fetchSchools();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete school');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/schools`, formData);
      toast.success('School created successfully!');
      setShowModal(false);
      fetchSchools();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create school');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary-600" />
            Manage Schools
          </h2>
          <p className="text-gray-500 mt-1">Super Admin Dashboard: Oversee school status and access</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New School
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schools.map(school => (
          <div key={school.id} className={`card hover:shadow-lg transition-all relative border-t-4 ${school.isActive ? 'border-emerald-500' : 'border-rose-500'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${school.isActive ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                <Building2 className={`w-6 h-6 ${school.isActive ? 'text-emerald-600' : 'text-rose-600'}`} />
              </div>
              <div className="flex gap-2">
                <span className={`badge ${school.isActive ? 'badge-success' : 'badge-error'}`}>
                  {school.isActive ? 'Active' : 'Inactive'}
                </span>
                <button 
                  onClick={() => {
                    if (school.isActive) {
                      toast.error('Active schools cannot be deleted. Deactivate first.');
                      return;
                    }
                    setDeleteConfirmSchool(school);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    school.isActive 
                    ? 'text-gray-300 cursor-not-allowed grayscale' 
                    : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                  title={school.isActive ? "Deactivate school before deleting" : "Delete School"}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900">{school.name}</h3>
            <p className="text-sm text-gray-500 mb-4 flex gap-1 items-center"><MapPin className="w-4 h-4"/> {school.city}, {school.state}</p>
            
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <div className="flex justify-between"><span>Code:</span> <span className="font-medium text-gray-900">{school.code}</span></div>
              <div className="flex justify-between"><span>Admin:</span> <span className="font-medium text-gray-900 truncate ml-4" title={school.users?.[0]?.email}>{school.users?.[0]?.email || 'N/A'}</span></div>
              <div className="flex justify-between"><span>Phone:</span> <span className="font-medium text-gray-900">{school.phone}</span></div>
              <div className="flex justify-between pt-2 border-t border-gray-50 mt-2 text-[10px] uppercase tracking-tighter text-gray-400 font-bold">
                 <span>Registered On</span>
                 <span>{new Date(school.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                  onClick={() => setResetModalSchool(school)}
                  className="py-2 px-3 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors"
              >
                Password
              </button>
              <button 
                  onClick={() => handleToggleStatus(school)}
                  className={`py-2 px-3 flex items-center justify-center gap-2 rounded-lg text-xs font-bold transition-colors ${
                    school.isActive 
                    ? 'border border-rose-200 text-rose-600 hover:bg-rose-50' 
                    : 'border border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                  }`}
              >
                {school.isActive ? <PowerOff className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                {school.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reset Password Modal */}
      {resetModalSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reset Admin Password</h3>
            <p className="text-sm text-gray-500 mb-6">Changing password for <strong>{resetModalSchool.name}</strong> admin account.</p>
            <form onSubmit={handleResetPassword}>
              <div className="space-y-4">
                <div>
                  <label className="label">New Admin Password</label>
                  <input type="text" className="input" required value={newAdminPassword} onChange={e => setNewAdminPassword(e.target.value)} placeholder="Enter new secure password" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setResetModalSchool(null)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
                <button type="submit" disabled={loading} className="btn bg-primary-600 text-white hover:bg-primary-700 min-w-[120px]">{loading ? 'Saving...' : 'Update Password'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-600">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete School?</h3>
            <p className="text-gray-500 mb-8">
              This will permanently delete <strong>{deleteConfirmSchool.name}</strong> and all associated data including students, staff, and records. This action cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleDeleteSchool} 
                disabled={loading}
                className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Yes, Delete Permanently'}
              </button>
              <button 
                type="button" 
                onClick={() => setDeleteConfirmSchool(null)} 
                className="w-full py-3 text-gray-500 font-bold hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add School Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Add New School</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-900 rounded-lg">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="md:col-span-2"><h4 className="text-xs font-black text-primary-600 uppercase tracking-widest mb-2">School Information</h4><hr className="mb-4" /></div>
                <div>
                  <label className="label">School Name</label>
                  <input type="text" className="input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="label">School Code (Unique)</label>
                  <input type="text" className="input" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                </div>
                <div>
                  <label className="label">Address</label>
                  <input type="text" className="input" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div>
                  <label className="label">City</label>
                  <input type="text" className="input" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
                <div>
                  <label className="label">State</label>
                  <input type="text" className="input" required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                </div>
                <div>
                  <label className="label">Pincode</label>
                  <input type="text" className="input" required value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input type="text" className="input" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <label className="label">School Email</label>
                  <input type="email" className="input" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="label">UDISE Code</label>
                  <input type="text" className="input" required value={formData.udiseCode} onChange={e => setFormData({...formData, udiseCode: e.target.value})} />
                </div>

                <div className="md:col-span-2 mt-8"><h4 className="text-xs font-black text-rose-600 uppercase tracking-widest mb-2">Initial Admin Account</h4><hr className="mb-4" /></div>
                <div>
                  <label className="label">Admin Email</label>
                  <input type="email" className="input" required value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} />
                </div>
                <div>
                  <label className="label">Admin Password</label>
                  <input type="password" className="input" required value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-10">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 font-bold text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-primary px-8 py-3 shadow-lg shadow-primary-200">{loading ? 'Creating...' : 'Register School'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
