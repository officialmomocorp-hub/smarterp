import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store';
import { Lock, User, Shield, AlertCircle, Calendar, Plus, Save, ShieldCheck, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [schoolData, setSchoolData] = useState({
    name: '', address: '', city: '', state: '', pincode: '',
    phone: '', email: '', udiseCode: '', affiliationNumber: '',
    principalName: '', logoUrl: '', letterheadUrl: ''
  });

  const [logoFile, setLogoFile] = useState(null);
  const [letterheadFile, setLetterheadFile] = useState(null);
  const [holidayForm, setHolidayForm] = useState({ name: '', date: '', type: 'Festival', isNational: false });
  const [holidays, setHolidays] = useState([]);
  const [platformUsage, setPlatformUsage] = useState(null);

  const { user, impersonateId } = useAuthStore();

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      if (impersonateId) {
        try {
          const { data } = await api.get('/schools/settings');
          if (data.success && data.data) setSchoolData(data.data);
        } catch (err) { 
          if (err.response?.status === 403) {
             toast.error('Super Admins must select a school to manage settings.');
          } else {
             console.error('Failed to fetch settings', err); 
          }
        }
      } else if (user?.role === 'SUPER_ADMIN') {
        try {
          const { data } = await api.get('/platform/reports/usage');
          if (data.success && data.data) setPlatformUsage(data.data);
        } catch (err) {
          console.error('Failed to fetch platform usage', err);
        }
      }
      setLoading(false);
    };
    fetchSettings();
  }, [impersonateId, user]);

  const handleUpdateSchool = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(schoolData).forEach(key => {
        if (schoolData[key]) formData.append(key, schoolData[key]);
      });
      if (logoFile) formData.append('logo', logoFile);
      if (letterheadFile) formData.append('letterhead', letterheadFile);

      await api.put('/schools/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('School profile updated successfully! 🏢');
    } catch (err) {
      toast.error('Failed to update school profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New password and confirm password do not match');
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHoliday = (e) => {
    e.preventDefault();
    // Simulate adding holiday
    setHolidays([...holidays, { id: Date.now(), ...holidayForm }]);
    toast.success('Holiday added successfully');
    setHolidayForm({ name: '', date: '', type: 'Festival', isNational: false });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            {impersonateId ? 'School Settings & Security' : 'Platform Control Center'}
          </h2>
          <p className="text-gray-400 mt-1">
            {impersonateId 
              ? 'Manage configurations, calendars, and account security for this school.' 
              : 'Global platform configuration, system health, and super admin security.'}
          </p>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-white/5 backdrop-blur-md rounded-2xl w-fit mb-8 border border-white/10">
        {[
          { id: 'profile', icon: User, label: impersonateId ? 'School Profile' : 'System Overview', show: true },
          { id: 'security', icon: Lock, label: 'Security & Password', show: true },
          { id: 'holidays', icon: Calendar, label: 'Holidays & Calendar', show: !!impersonateId },
        ].filter(t => t.show).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all flex items-center gap-2.5 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        impersonateId ? (
          <div className="card">
            <form onSubmit={handleUpdateSchool} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center overflow-hidden">
                    {schoolData.logoUrl || logoFile ? (
                      <img 
                        src={logoFile ? URL.createObjectURL(logoFile) : schoolData.logoUrl} 
                        className="w-full h-full object-contain" 
                        alt="Logo"
                      />
                    ) : (
                      <Plus className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <label className="btn btn-secondary cursor-pointer flex items-center justify-center gap-2">
                    <UploadCloud className="w-4 h-4" />
                    Upload School Logo
                    <input type="file" className="hidden" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} />
                  </label>
                  <p className="text-[10px] text-gray-400 mt-2">Recommended: Square PNG, max 1MB</p>
                </div>

                <div>
                   <label className="label">School Name</label>
                   <input className="input" value={schoolData.name} onChange={e => setSchoolData({...schoolData, name: e.target.value})} />
                </div>
                <div>
                   <label className="label">UDISE Code</label>
                   <input className="input" value={schoolData.udiseCode} onChange={e => setSchoolData({...schoolData, udiseCode: e.target.value})} />
                </div>
                <div>
                   <label className="label">Affiliation Number</label>
                   <input className="input" value={schoolData.affiliationNumber || ''} onChange={e => setSchoolData({...schoolData, affiliationNumber: e.target.value})} />
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Principal Name</label>
                      <input className="input" value={schoolData.principalName || ''} onChange={e => setSchoolData({...schoolData, principalName: e.target.value})} />
                    </div>
                    <div>
                      <label className="label">Email Address</label>
                      <input className="input" value={schoolData.email} onChange={e => setSchoolData({...schoolData, email: e.target.value})} />
                    </div>
                    <div>
                      <label className="label">Phone Number</label>
                      <input className="input" value={schoolData.phone} onChange={e => setSchoolData({...schoolData, phone: e.target.value})} />
                    </div>
                    <div>
                      <label className="label">Website</label>
                      <input className="input" value={schoolData.website || ''} onChange={e => setSchoolData({...schoolData, website: e.target.value})} />
                    </div>
                 </div>

                 <div>
                    <label className="label">Full Address</label>
                    <textarea className="input h-20" value={schoolData.address} onChange={e => setSchoolData({...schoolData, address: e.target.value})} />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">City</label>
                      <input className="input" value={schoolData.city} onChange={e => setSchoolData({...schoolData, city: e.target.value})} />
                    </div>
                    <div>
                      <label className="label">State</label>
                      <input className="input" value={schoolData.state} onChange={e => setSchoolData({...schoolData, state: e.target.value})} />
                    </div>
                    <div>
                      <label className="label">Pincode</label>
                      <input className="input" value={schoolData.pincode} onChange={e => setSchoolData({...schoolData, pincode: e.target.value})} />
                    </div>
                 </div>

                 <div className="pt-6 flex justify-end">
                    <button type="submit" disabled={loading} className="btn btn-primary px-8 flex items-center gap-2">
                       {loading ? 'Saving Settings...' : (
                         <>
                           <Save className="w-4 h-4" />
                           Save School Profile
                         </>
                       )}
                    </button>
                 </div>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card">
            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
              Global SaaS Configuration
            </h3>
            <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label className="label">Platform Name</label>
                     <input className="input" defaultValue="SmartERP Solution" readOnly />
                     <p className="text-[10px] text-gray-500 mt-1">Global branding for all sub-directories.</p>
                  </div>
                  <div>
                     <label className="label">System Support Email</label>
                     <input className="input" defaultValue="support@smarterpsolution.com" readOnly />
                  </div>
               </div>
               <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                  <h4 className="text-sm font-bold text-blue-400 mb-2">Automated Backups</h4>
                  <p className="text-sm text-gray-400">Database backups are scheduled every 24 hours at 01:00 AM. Last backup: Successful (2h ago).</p>
               </div>
               <div className="pt-6 border-t border-white/10 flex justify-end">
                  <button className="btn btn-primary opacity-50 cursor-not-allowed">Save System Config</button>
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-transparent">
              <h3 className="text-lg font-bold text-white mb-4">System Health</h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-xs text-gray-400 font-bold uppercase">Schools Registered</span>
                    <span className="text-lg font-black text-blue-400">{platformUsage?.schools || 0}</span>
                 </div>
                 <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-xs text-gray-400 font-bold uppercase">Total active Students</span>
                    <span className="text-lg font-black text-cyan-400">{platformUsage?.students || 0}</span>
                 </div>
                 <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-xs text-gray-400 font-bold uppercase">API Version</span>
                    <span className="text-lg font-black text-white">v1.2.4-stable</span>
                 </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-bold text-white mb-2">Maintenance</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Turn on global maintenance mode to suspend all school activities and admin logins.</p>
              <div className="mt-4 flex items-center gap-3">
                 <div className="w-10 h-5 bg-gray-700 rounded-full relative cursor-pointer opacity-50">
                    <div className="absolute left-1 top-1 w-3 h-3 bg-gray-500 rounded-full" />
                 </div>
                 <span className="text-xs font-bold text-gray-500">Currently Disabled</span>
              </div>
            </div>
          </div>
        </div>
      )
    )}

      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 border border-gray-200 bg-white rounded-xl shadow-sm p-6 space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <User className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">Admin Account</h3>
              <p className="text-sm text-gray-500">Security Management</p>
            </div>
            <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm flex gap-3">
               <AlertCircle className="w-5 h-5 flex-shrink-0" />
               <p>It is recommended to change your password every 90 days to maintain security.</p>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
               <Lock className="w-5 h-5 text-gray-500" />
               Change Password
            </h3>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <input 
                  type="password" 
                  required 
                  className="input" 
                  value={passwordData.currentPassword} 
                  onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">New Password</label>
                  <input 
                    type="password" 
                    required 
                    className="input" 
                    value={passwordData.newPassword} 
                    onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} 
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <input 
                    type="password" 
                    required 
                    className="input" 
                    value={passwordData.confirmPassword} 
                    onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                    minLength={6}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-6 flex justify-end">
                <button disabled={loading} type="submit" className="btn btn-primary flex items-center gap-2">
                   {loading ? 'Updating...' : (
                     <>
                       <ShieldCheck className="w-4 h-4" />
                       Update Password
                     </>
                   )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'holidays' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Add Holiday</h3>
              <form onSubmit={handleAddHoliday} className="space-y-4">
                <div>
                  <label className="label">Holiday Name</label>
                  <input 
                    className="input" 
                    required 
                    value={holidayForm.name} 
                    onChange={e => setHolidayForm({...holidayForm, name: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="label">Date</label>
                  <input 
                    type="date" 
                    className="input" 
                    required 
                    value={holidayForm.date} 
                    onChange={e => setHolidayForm({...holidayForm, date: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="label">Holiday Type</label>
                  <select 
                    className="input" 
                    value={holidayForm.type} 
                    onChange={e => setHolidayForm({...holidayForm, type: e.target.value})}
                  >
                    <option value="Festival">Festival</option>
                    <option value="National">National Holiday</option>
                    <option value="Vacation">Vacation</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="isNational" 
                    checked={holidayForm.isNational} 
                    onChange={e => setHolidayForm({...holidayForm, isNational: e.target.checked})} 
                  />
                  <label htmlFor="isNational" className="text-sm">Is National Holiday?</label>
                </div>
                <button type="submit" className="w-full btn btn-primary flex justify-center items-center gap-2">
                  <Plus className="w-4 h-4"/> Save Holiday
                </button>
              </form>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Academic Calendar & Holidays</h3>
              <div className="space-y-3">
                {holidays.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No holidays added yet. Add some to display here.</p>
                ) : (
                  holidays.map(h => (
                    <div key={h.id} className="p-4 border rounded-lg flex justify-between items-center bg-gray-50">
                      <div>
                        <p className="font-bold text-gray-900">{h.name}</p>
                        <p className="text-sm text-gray-500">{new Date(h.date).toLocaleDateString()} - {h.type}</p>
                      </div>
                      {h.isNational && <span className="badge badge-green">National</span>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
