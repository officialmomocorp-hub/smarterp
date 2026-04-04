import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Building2, Plus, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageSchools() {
  const [schools, setSchools] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', code: '', address: '', city: '', state: '', pincode: '', phone: '', email: '', udiseCode: '', adminEmail: '', adminPassword: ''
  });

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
          <p className="text-gray-500 mt-1">SaaS Dashboard: Add and oversee all schools</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New School
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schools.map(school => (
          <div key={school.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-primary-50 rounded-lg">
                <Building2 className="w-6 h-6 text-primary-600" />
              </div>
              <span className="badge badge-success">Active</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{school.name}</h3>
            <p className="text-sm text-gray-500 mb-4 flex gap-1 items-center"><MapPin className="w-4 h-4"/> {school.city}, {school.state}</p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between"><span>Code:</span> <span className="font-medium text-gray-900">{school.code}</span></div>
              <div className="flex justify-between"><span>Admin:</span> <span className="font-medium text-gray-900">{school.users?.[0]?.email || 'N/A'}</span></div>
              <div className="flex justify-between"><span>Phone:</span> <span className="font-medium text-gray-900">{school.phone}</span></div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add New School</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="col-span-2 mt-4 pt-4 border-t">
                  <h4 className="text-md font-bold mb-4">First Admin Details</h4>
                </div>
                <div>
                  <label className="label">Admin Email</label>
                  <input type="email" className="input" required value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} />
                </div>
                <div>
                  <label className="label">Admin Password</label>
                  <input type="password" className="input" required value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Creating...' : 'Create School'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
